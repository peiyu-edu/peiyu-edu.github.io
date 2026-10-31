/* This lesson's scratch work is ephemeral: no learning-store calls or shared hooks. */
(() => {
  'use strict';
  const root = document.getElementById('b9a-j25-1-teaching-workshop-dev');
  if (!root || document.body.dataset.sec !== 'j25-1' || root.dataset.ready) return;
  root.dataset.ready = '1';
  const $ = id => root.querySelector('#mw-' + id);
  const LIMIT = 10n ** 30n;
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; }
  function rat(n, d = 1n) {
    if (!d) throw Error('分母不能为0。');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    if (n > LIMIT || n < -LIMIT || d > LIMIT) throw Error('计算过大，请用更简短的式子。');
    return [n, d];
  }
  const Z = [0n, 1n], ONE = [1n, 1n];
  const add = (a, b) => rat(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const neg = a => [-a[0], a[1]];
  const mul = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const trim = p => { while (p.length > 1 && !p[p.length - 1][0]) p.pop(); return p; };
  function plus(a, b, sign = 1) { return trim(Array.from({length: Math.max(a.length, b.length)}, (_, i) => add(a[i] || Z, sign === 1 ? (b[i] || Z) : neg(b[i] || Z)))); }
  function times(a, b) {
    const r = Array.from({length: a.length + b.length - 1}, () => Z);
    for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) r[i + j] = add(r[i + j], mul(a[i], b[j]));
    trim(r); if (r.length > 5) throw Error('暂只支持最高4次的整式。'); return r;
  }
  function number(s) {
    if (!/^(?:\d{1,6}(?:\.\d{1,4})?|\.\d{1,4})$/.test(s)) throw Error('数值需为半角小数或整数，最多6位整数、4位小数。');
    const parts = s.split('.'); return rat(BigInt((parts[0] || '0') + (parts[1] || '')), 10n ** BigInt((parts[1] || '').length));
  }
  function polynomial(source, symbol) {
    if (!source || source.length > 160) throw Error('请填写式子（最多160字符）。');
    const tokens = []; let pos = 0;
    while (pos < source.length) {
      if (/[ \t\r\n]/.test(source[pos])) { pos++; continue; }
      const m = source.slice(pos).match(/^(?:\d+(?:\.\d+)?|\.\d+)/);
      if (m) { tokens.push({kind:'num', text:m[0]}); pos += m[0].length; continue; }
      const c = source[pos++];
      if (c === symbol) tokens.push({kind:'var', text:c});
      else if ('+-*/^()'.includes(c)) tokens.push({kind:c, text:c});
      else throw Error('输入格式未支持这个符号；请按格式说明书写，不要换用其他字母。');
      if (tokens.length > 100) throw Error('式子过长，请简化书写。');
    }
    let i = 0, depth = 0;
    const at = () => tokens[i]?.kind;
    function atom() {
      if (++depth > 24) throw Error('括号嵌套过深。');
      let p;
      if (at() === 'num') p = [number(tokens[i++].text)];
      else if (at() === 'var') { i++; p = [Z, ONE]; }
      else if (at() === '(') { i++; p = sum(); if (at() !== ')') throw Error('请检查括号配对。'); i++; }
      else throw Error('请检查运算符或缺少的式子。');
      depth--; return p;
    }
    function power() {
      let p = atom();
      if (at() === '^') { i++; const t = tokens[i++]; if (t?.kind !== 'num' || !/^[1-4]$/.test(t.text)) throw Error('指数暂只支持1至4的正整数。'); const a = p; p = [ONE]; for (let k = 0; k < +t.text; k++) p = times(p, a); }
      return p;
    }
    function unary() { if (at() === '+' || at() === '-') { const sign = at(); i++; const p = unary(); return sign === '-' ? p.map(neg) : p; } return power(); }
    function product() {
      let p = unary();
      while (true) {
        const op = at(), prev = tokens[i - 1]?.kind;
        const implicit = op === 'var' || op === '(' || (op === 'num' && prev === ')');
        if (op === '*' || op === '/') i++; else if (!implicit) break;
        const start = i, q = unary();
        if (op === '/' && tokens.slice(start, i).some(t => t.kind === 'var')) throw Error('分母中请只写常数，不含未知数。');
        if (op === '/') { if (q.length !== 1) throw Error('分母含未知数；这里的检查只支持整式方程。'); if (!q[0][0]) throw Error('分母不能为0。'); p = p.map(v => mul(v, rat(q[0][1], q[0][0]))); }
        else p = times(p, q);
      }
      return p;
    }
    function sum() { let p = product(); while (at() === '+' || at() === '-') { const sign = at(); i++; p = plus(p, product(), sign === '+' ? 1 : -1); } return p; }
    const p = sum(); if (i !== tokens.length) throw Error('相邻数字之间缺运算符；不会删除空格拼接数字。'); return trim(p);
  }
  function equation(s) {
    const sides = s.split('='); if (sides.length !== 2) throw Error('请写一个等号，等号两边都要有式子。');
    const symbol = $('symbol').value;
    const left = polynomial(sides[0], symbol), right = polynomial(sides[1], symbol);
    return {left, right, difference:plus(left, right, -1)};
  }
  function proportional(a, b) {
    if (a.length !== b.length || a.every(v => !v[0])) return false;
    const i = b.findIndex(v => v[0]);
    return a.every((v, j) => eq(mul(v, b[i]), mul(b[j], a[i])));
  }
  function scalar(id) { if ($(id).value.includes($('symbol').value)) throw Error('系数和边界请用数表示，不含未知数。'); const p = polynomial($(id).value, $('symbol').value); if (p.length !== 1) throw Error('系数或边界请写一个数，可以用常数分数。'); return p[0]; }
  const state = {declared:false, model:false, final:false};
  function feedback(kind, message, id = 'feedback') { $(id).dataset.state = kind; $(id).textContent = message; }
  function clearFeedback() { for (const id of ['feedback','probe-feedback']) { $(id).textContent = ''; delete $(id).dataset.state; } }
  function facts() {
    const garden = $('task').value === 'garden', second = $('quantity').value === 'second';
    const scale = $('unit').value === 'cm' ? 100n : 1n;
    return garden ? {expected:[rat(-40n * scale * scale),rat((second ? -3n : 3n) * scale),ONE], unit:scale === 100n ? 'cm' : 'm', kind:'real', bound:second ? Number(3n * scale) : 0, sign:'>'} : {expected:[rat(-42n),rat(second ? 1n : -1n),ONE], unit:second ? '个' : '队', kind:'integer', bound:second ? 1 : 2, sign:'>='};
  }
  function checkDomain() {
    const f = facts(), low = scalar('lower'), sign = $('sign').value;
    let boundOK = eq(low, rat(BigInt(f.bound))) && sign === f.sign;
    // For integer counts, > (minimum - 1) and >= minimum describe the same natural domain.
    if (f.kind === 'integer' && (sign === '>' || sign === '>=')) {
      const floor = low[0] / low[1] - (low[0] < 0n && low[0] % low[1] ? 1n : 0n);
      const minimum = sign === '>' ? floor + 1n : floor + (low[0] % low[1] ? 1n : 0n);
      boundOK = minimum === BigInt(f.bound);
    }
    if ($('unit').value !== f.unit || $('kind').value !== f.kind || !boundOK) throw Error('再核对所设的量、单位、整数或实数，以及自然下界；这里先不解方程。');
  }
  function attempt(fn) { try { fn(); } catch (error) { feedback('revise', error.message); } }
  $('declare').addEventListener('click', () => attempt(() => { checkDomain(); state.declared = true; feedback('declared', '设量、单位和自然范围已核对。请自己写等量关系与方程。'); }));
  $('model').addEventListener('click', () => attempt(() => {
    if (!state.declared) throw Error('请先核对设量与范围；修改设量后需重新核对。');
    const p = equation($('equation').value).difference;
    if (!proportional(p, facts().expected)) throw Error('方程还未对应当前设量的数量关系。花圃检查长宽乘积，长度差和面积是否与所选单位一致；赛程检查每场是否重复计数。');
    state.model = true; feedback('model', '方程的代数结构与此情境相符。文字草稿未自动判真；请继续亲自展开、移项、合并。');
  }));
  $('check').addEventListener('click', () => attempt(() => {
    if (!state.model) throw Error('先完成设量与自己列方程的核对。');
    const e = equation($('standard').value), p = e.difference;
    if (e.right.length !== 1 || e.right[0][0]) throw Error('请把右边整理为0。');
    if (!proportional(p, equation($('equation').value).difference)) throw Error('整理结果与原方程不等价，请检查展开、移项与合并。');
    if (!['a','b','c'].every((id, i) => eq(scalar(id), p[2 - i] || Z))) throw Error('系数要对应你自己整理的左边，带上正负号，不能包含未知数。');
    if ($('degree').value !== '2') throw Error('再检查合并后的最高次项及其非零系数。');
    state.final = true; feedback('checked', '列式、等价整理、系数和二次类型已核对。次数解释和等量关系文字未自动判真，请按准则自行核对。这不表示已完成实际调查或普遍证明。');
  }));
  $('probe-check').addEventListener('click', () => {
    try { const p = equation($('probe').value).difference, degree = p.length - 1, type = degree === 2 ? '2' : degree === 1 ? '1' : 'other';
      if (!$('probe-degree').value) throw Error('请先自己判断类型。');
      const message = degree === 0 ? (p[0][0] ? '两边的差为非零常数，是矛盾等式。' : '两边恒等，未知数项全部抵消。') : '移项合并后的最高次数为' + degree + '。';
      feedback(type === $('probe-degree').value ? 'checked' : 'revise', message + '本项只核代数类型，不核实际背景。', 'probe-feedback');
    } catch (e) { feedback('revise', e.message, 'probe-feedback'); }
  });
  function reset() {
    for (const id of ['lower','relation','equation','standard','a','b','c','reason','probe']) $(id).value = '';
    for (const id of ['unit','kind','sign','degree','probe-degree']) $(id).value = '';
    state.declared = state.model = state.final = false; clearFeedback();
  }
  function taskChange() {
    const garden = $('task').value === 'garden';
    $('quantity').replaceChildren(...(garden ? ['花圃的宽','花圃的长'] : ['球队总数','每队的对手数']).map((text, i) => { const o = document.createElement('option'); o.value = i ? 'second' : 'first'; o.textContent = text; return o; }));
    $('prompt').textContent = garden ? '长方形花圃的长比宽多3 m，面积为40 m²。可设宽，也可设长；另一条边怎样表示？长度可连续变化，不能为0。' : '若干球队进行单循环比赛，每两队恰好赛1场，共21场。可设球队数，也可设每队的对手数；球队数必须是至少2的整数。';
    reset();
  }
  $('task').addEventListener('change', taskChange);
  $('quantity').addEventListener('change', reset);
  $('symbol').addEventListener('change', reset);
  for (const control of root.querySelectorAll('input, textarea, select')) {
    const invalidate = () => {
      clearFeedback(); state.final = false;
      if (['mw-unit','mw-kind','mw-sign','mw-lower'].includes(control.id)) state.declared = state.model = false;
      if (control.id === 'mw-equation') state.model = false;
    };
    control.addEventListener('input', invalidate); control.addEventListener('change', invalidate);
  }
  $('reset').addEventListener('click', reset);
  $('save').addEventListener('click', () => {
    const ids = ['task','quantity','symbol','unit','kind','sign','lower','relation','equation','standard','a','b','c','degree','reason','probe','probe-degree'];
    const text = '25.1 我的建模草稿\n仅为本页草稿；文字和实际建模未自动判真。\n' + ids.map(id => { const el = $(id); return el.closest('label')?.childNodes[0].textContent.trim() + '：' + (el.tagName === 'SELECT' ? el.selectedOptions[0]?.textContent : el.value); }).join('\n') + '\n本轮代数核对状态：' + (state.final ? '已核对（不含文字）' : '尚未完成或已编辑') + '\n';
    const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'})), a = document.createElement('a'); a.href = url; a.download = 'j25-1-我的建模草稿.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  taskChange();
})();
