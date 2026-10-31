/* Only j11-2: exact rational affine arithmetic; no sampled identity tests. */
(function () {
  'use strict';
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) { const t = a % b; a = b; b = t; } return a; }
  function q(n, d = 1n) {
    if (!d) throw Error('分母不能为0');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); return { n: n / g, d: d / g };
  }
  const Q = n => q(BigInt(n)), Z = Q(0), O = Q(1);
  const add = (a, b) => q(a.n * b.d + b.n * a.d, a.d * b.d);
  const neg = a => q(-a.n, a.d);
  const mul = (a, b) => q(a.n * b.n, a.d * b.d);
  const div = (a, b) => q(a.n * b.d, a.d * b.n);
  const eq = (a, b) => a.n === b.n && a.d === b.d;
  const cmp = (a, b) => { const n = a.n * b.d - b.n * a.d; return n < 0n ? -1 : n > 0n ? 1 : 0; };
  const show = a => String(a.n) + (a.d === 1n ? '' : '/' + a.d);
  const flip = s => ({ '<': '>', '>': '<', '<=': '>=', '>=': '<=', '=': '=' })[s];
  function lex(s) {
    if (typeof s !== 'string' || s.length > 300) throw Error('请用不超过300字的声明语法');
    // Deliberately no NFKC and no whitespace deletion: 1 0 is not 10, x² is not x2.
    s = s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/≤/g, '<=').replace(/≥/g, '>=');
    const ts = []; let i = 0;
    while (i < s.length) {
      if (/\s/u.test(s[i])) { i++; continue; }
      const m = /^(?:\d{1,9}(?:\.\d{1,6})?|<=|>=|[x+*/()<>＝=\-])/.exec(s.slice(i));
      if (!m || m[0] === '＝') throw Error('语法不支持：只用数字、x、括号、四则运算及比较号');
      ts.push(m[0]); i += m[0].length;
      if (ts.length > 100) throw Error('式子过长');
    }
    if (!ts.length) throw Error('请先填写'); return ts;
  }
  function expression(ts) {
    let i = 0, depth = 0;
    function node(a, b, x, kind, children = []) { return { a, b, x, kind, children }; }
    function atom() {
      if (++depth > 20) throw Error('括号过深');
      const t = ts[i++]; let v;
      if (t === '+' || t === '-') {
        v = atom(); v = node(t === '-' ? neg(v.a) : v.a, t === '-' ? neg(v.b) : v.b, v.x, t === '-' ? 'neg' : 'pos', [v]);
      } else if (t === '(') {
        v = sum(); if (ts[i++] !== ')') throw Error('括号不匹配'); v = node(v.a, v.b, v.x, 'group', [v]);
      } else if (t === 'x') v = node(O, Z, true, 'x');
      else if (t && /^\d+(?:\.\d+)?$/.test(t)) {
        const p = t.split('.'); v = node(Z, q(BigInt(p.join('')), 10n ** BigInt((p[1] || '').length)), false, 'number');
      } else throw Error('缺少数字、x或括号');
      depth--; return v;
    }
    function product() {
      let a = atom();
      while (ts[i] === '*' || ts[i] === '/' || (ts[i] === 'x' || ts[i] === '(') && (ts[i - 1] === ')' || /^\d/.test(ts[i - 1] || ''))) {
        const op = ts[i] === '*' || ts[i] === '/' ? ts[i++] : '*', b = atom();
        if (op === '/' && b.x) throw Error('本练习不解未知数在分母中的式子');
        if (op === '*' && a.x && b.x) throw Error('本练习只接收一次整式，不接收未知数相乘');
        if (op === '/') a = node(div(a.a, b.b), div(a.b, b.b), a.x, '/', [a, b]);
        else a = node(add(mul(a.a, b.b), mul(b.a, a.b)), mul(a.b, b.b), a.x || b.x, '*', [a, b]);
      }
      return a;
    }
    function sum() {
      let a = product();
      while (ts[i] === '+' || ts[i] === '-') {
        const op = ts[i++], b = product(), sign = op === '+' ? O : Q(-1);
        a = node(add(a.a, mul(sign, b.a)), add(a.b, mul(sign, b.b)), a.x || b.x, op, [a, b]);
      }
      return a;
    }
    const value = sum(); if (i !== ts.length) throw Error('词元不能这样相连；数字之间的空格不表示拼接'); return value;
  }
  function expr(s) { return expression(lex(s)); }
  function relation(s) {
    const ts = lex(s), inds = ts.flatMap((t, i) => /^(?:[<>]=?|=)$/.test(t) ? [i] : []);
    if (inds.length !== 1) throw Error('此栏写一条不等式（或等式）');
    const i = inds[0]; return { l: expression(ts.slice(0, i)), op: ts[i], r: expression(ts.slice(i + 1)) };
  }
  const same = (a, b) => eq(a.a, b.a) && eq(a.b, b.b);
  function has(n, kind) { return n.kind === kind || n.children.some(c => has(c, kind)); }
  function terms(n, sign = O) {
    if (n.kind === '+' || n.kind === '-') return terms(n.children[0], sign).concat(terms(n.children[1], n.kind === '-' ? neg(sign) : sign));
    if (n.kind === 'neg' || n.kind === 'pos') return terms(n.children[0], n.kind === 'neg' ? neg(sign) : sign);
    return [show(mul(n.a, sign)) + ':' + show(mul(n.b, sign))];
  }
  const termKey = n => terms(n).sort().join('|');
  const tasks = [
    { prompt: '(x+2)/3 − (2x−1)/2 ≥ 2', steps: ['2(x+2)-3(2x-1)>=12', '2x+4-6x+3>=12', '2x-6x>=12-4-3', '-4x>=5', 'x<=-5/4'], reasons: ['两边乘6', '分配律', '性质1', '合并同类项', '两边除-4'], end: '-5/4', solid: 'closed', dir: 'left' },
    { prompt: '(3x−2)/4 + (x+1)/2 < 3', steps: ['(3x-2)+2(x+1)<12', '3x-2+2x+2<12', '3x+2x<12+2-2', '5x<12', 'x<12/5'], reasons: ['两边乘4', '分配律', '性质1', '合并同类项', '两边除5'], end: '12/5', solid: 'open', dir: 'left' }
  ];
  function checkStep(task, index, value, reason) {
    const got = relation(value), expected = relation(task.steps[index]);
    if (got.op !== expected.op || !same(got.l, expected.l) || !same(got.r, expected.r)) throw Error('请核对本步两边各项与不等号方向；不能只给最终解集');
    if (index === 0 && (has(got.l, '/') || has(got.r, '/') || !has(got.l, 'group'))) throw Error('去分母后不要留分母；保留多项式分子的括号');
    if ((index === 1 || index === 2) && (has(got.l, 'group') || has(got.r, 'group') || termKey(got.l) !== termKey(expected.l) || termKey(got.r) !== termKey(expected.r))) throw Error(index === 1 ? '请展开括号，暂不合并各项' : '请先把未知数项移到左边、常数项移到右边，暂不合并');
    if (index === 3 && (terms(got.l).length !== 1 || terms(got.r).length !== 1)) throw Error('请合并同类项');
    if (index === 4 && (got.l.kind !== 'x' || got.r.x)) throw Error('把x系数化为1，右边只留精确数');
    if (index === 0 || index === 4) {
      const gotBasis = /^(两边乘|两边除)(.+)$/.exec(reason.trim()), expectedBasis = /^(两边乘|两边除)(.+)$/.exec(task.reasons[index]);
      if (!gotBasis || gotBasis[1] !== expectedBasis[1] || !eq(scalar(gotBasis[2]), scalar(expectedBasis[2]))) throw Error('依据按约定写两边乘或两边除，并填本步运算数；0不能作除数');
    } else if (reason.trim() !== task.reasons[index]) throw Error('请按约定亲写本步依据，并核对性质或运算法则');
    return true;
  }
  function scalar(s) { const v = expr(s); if (v.x) throw Error('此栏只填数'); return v.b; }
  function checkOperation(kind, factor, value, reason) {
    const k = scalar(factor); if (!k.n) throw Error(kind === 'divide' ? '0不能作除数' : '乘0会丢失原解集，不能作等价变形');
    const f = kind === 'divide' ? div(O, k) : k, got = relation(value);
    const l = { a: mul(Q(-3), f), b: Z }, r = { a: Z, b: mul(Q(6), f) };
    if (!same(got.l, l) || !same(got.r, r) || got.op !== (k.n < 0n ? '<=' : '>=')) throw Error('请把每一边都作指定运算，并根据运算数正负确定方向');
    if (reason !== (k.n < 0n ? 'negative' : 'positive')) throw Error('请核对运算数的正负与方向依据'); return true;
  }
  // A range is represented by exact endpoints, with null meaning unbounded.
  function range(s) {
    if (s.trim() === '无') return { empty: true };
    const ts = lex(s), inds = ts.flatMap((t, i) => /^(?:[<>]=?|=)$/.test(t) ? [i] : []);
    if (inds.length < 1 || inds.length > 2) throw Error('范围用单条或两端连写不等式；没有金额写“无”');
    const parts = []; let start = 0;
    inds.concat([ts.length]).forEach(i => { parts.push(expression(ts.slice(start, i))); start = i + 1; });
    let lo = null, hi = null, lc = false, hc = false;
    function bound(a, op, b) {
      if (a.kind !== 'x') { if (b.kind !== 'x' || a.x) throw Error('范围要用x和精确数'); return bound(b, flip(op), a); }
      if (b.x) throw Error('端点只填数');
      const v = b.b;
      if (op === '=' || op[0] === '>') { if (lo === null || cmp(v, lo) > 0) { lo = v; lc = op.includes('='); } else if (eq(v, lo)) lc = lc && op.includes('='); }
      if (op === '=' || op[0] === '<') { if (hi === null || cmp(v, hi) < 0) { hi = v; hc = op.includes('='); } else if (eq(v, hi)) hc = hc && op.includes('='); }
    }
    inds.forEach((idx, j) => bound(parts[j], ts[idx], parts[j + 1]));
    if (lo && hi && (cmp(lo, hi) > 0 || eq(lo, hi) && !(lc && hc))) throw Error('没有金额请写“无”，不要用矛盾范围代替');
    return { lo, hi, lc, hc, empty: false };
  }
  function sameRange(a, b) { return a.empty || b.empty ? a.empty === b.empty : (a.lo === null ? b.lo === null : b.lo !== null && eq(a.lo, b.lo)) && (a.hi === null ? b.hi === null : b.hi !== null && eq(a.hi, b.hi)) && a.lc === b.lc && a.hc === b.hc; }
  const discount = [
    ['0<=x<100', 'x', 'x', '0', '无', '无', '0<=x<100'],
    ['100<=x<200', '0.9x', 'x', '0.1x', '100<=x<200', '无', '无'],
    ['x>=200', '0.9x', 'x-30', '0.1x-30', 'x>300', '200<=x<300', 'x=300']
  ];
  function checkDiscount(row, col, value) {
    const expected = discount[row][col];
    if (col === 0 || col >= 4) { if (!sameRange(range(value), range(expected))) throw Error('核对门槛等号、x非负和本段范围；求出的界限必须落在本段'); }
    else if (!same(expr(value), expr(expected))) throw Error(col === 3 ? '请用乙实付款减甲实付款，逐项合并' : '核对本段是否达到各自门槛；减免只做一次');
    return true;
  }
  function checkComparison(i, value) {
    const got = relation(value), expected = relation(['0.9x<x-30', '0.9x>x-30', '0.9x=x-30'][i]);
    // Require actual payment models (not a guessed final boundary).
    if (got.op !== expected.op || !same(got.l, expected.l) || !same(got.r, expected.r)) throw Error('按甲、乙实付款列比较式，先不要直接写答案范围'); return true;
  }
  const api = { expr, relation, scalar, range, sameRange, checkStep, checkOperation, checkDiscount, checkComparison, tasks, discount, show };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const root = document.getElementById('j112-self');
  if (!root || document.body.dataset.sec !== 'j11-2' || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const get = id => root.querySelector('#' + id);
  const reasonOptions = '<option value="">请选择依据</option><option value="positive">两边乘除同一个正数，方向不变</option><option value="negative">两边乘除同一个负数，方向改变</option><option value="expand">分配律去括号，方向不变</option><option value="add">两边加减同一式子，方向不变</option><option value="collect">合并同类项，方向不变</option><option value="zero">两边除以0</option>';
  let taskIndex = 0, solid = '', direction = '';
  root.querySelectorAll('.j112-reason').forEach(s => { s.innerHTML = reasonOptions; });
  const labels = ['去分母（两边乘最小公倍数）', '去括号（暂不合并）', '移项（暂不合并）', '合并同类项', '系数化为1，写出解集'];
  labels.forEach((label, i) => {
    const box = document.createElement('div'); box.className = 'card';
    box.innerHTML = '<label for="j112-line-' + i + '">' + (i + 1) + '. ' + label + '</label><input id="j112-line-' + i + '" type="text" autocomplete="off" spellcheck="false"><label for="j112-reason-' + i + '">本步依据</label><input id="j112-reason-' + i + '" type="text" autocomplete="off" spellcheck="false"><p class="small j112-step-note" aria-live="polite"></p>';
    get('j112-lines').appendChild(box);
  });
  const headings = ['金额范围', '甲实付款（元）', '乙实付款（元）', '乙减甲（元）', '甲省的金额范围', '乙省的金额范围', '一样的金额范围'];
  discount.forEach((_, r) => {
    const fs = document.createElement('fieldset'); fs.className = 'card';
    const legend = document.createElement('legend'); legend.textContent = '第' + (r + 1) + '段（按金额从小到大）'; fs.appendChild(legend);
    headings.forEach((h, c) => {
      const label = document.createElement('label'); label.htmlFor = 'j112-d-' + r + '-' + c; label.textContent = h;
      const input = document.createElement('input'); input.id = label.htmlFor; input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
      fs.append(label, input);
    }); get('j112-segments').appendChild(fs);
  });
  function clearFeedback() {
    root.querySelectorAll('.j112-feedback,.j112-step-note').forEach(e => { e.textContent = ''; });
    root.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
  }
  root.addEventListener('input', clearFeedback); root.addEventListener('change', clearFeedback);
  function verify(input, fn, failures, label) {
    try { fn(input.value); input.setAttribute('aria-invalid', 'false'); }
    catch (e) { input.setAttribute('aria-invalid', 'true'); failures.push(label + '：' + e.message); }
  }
  function report(id, failures, success) { get(id).textContent = failures.length ? failures.join('；') : success; }
  function draw() {
    const svg = get('j112-axis'); svg.replaceChildren();
    const NS = 'http://www.w3.org/2000/svg';
    function el(tag, attrs, text) { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); if (text) e.textContent = text; svg.appendChild(e); }
    const X = v => 30 + (v + 6) * 25;
    el('line', { x1: 20, y1: 70, x2: 342, y2: 70, stroke: 'currentColor', 'stroke-width': 2 });
    el('path', { d: 'M342 70l-9 -5v10z', fill: 'currentColor' });
    for (let n = -6; n <= 6; n++) { el('line', { x1: X(n), x2: X(n), y1: 65, y2: 75, stroke: 'currentColor' }); el('text', { x: X(n), y: 98, 'text-anchor': 'middle', fill: 'currentColor', 'font-size': 12 }, String(n)); }
    try {
      const v = scalar(get('j112-end').value), num = Number(v.n) / Number(v.d);
      if (num < -6 || num > 6) throw Error('outside');
      if (direction) { const end = direction === 'left' ? 20 : 340; el('line', { x1: X(num), x2: end, y1: 45, y2: 45, stroke: 'currentColor', 'stroke-width': 4 }); el('path', { d: direction === 'left' ? 'M18 45l10 -6v12z' : 'M342 45l-10 -6v12z', fill: 'currentColor' }); }
      if (solid) el('circle', { cx: X(num), cy: 45, r: 6, fill: solid === 'closed' ? 'currentColor' : 'var(--card)', stroke: 'currentColor', 'stroke-width': 2 });
      el('text', { x: X(num), y: 24, fill: 'currentColor', 'text-anchor': 'middle', 'font-size': 13 }, show(v));
    } catch (_) { /* An untouched/invalid answer draws no solution. */ }
    get('j112-drawing-state').textContent = '你的图：端点 ' + (get('j112-end').value || '未定') + '；' + (solid ? solid === 'closed' ? '实心' : '空心' : '未选端点样式') + '；' + (direction ? direction === 'left' ? '向左' : '向右' : '未选方向');
  }
  root.querySelectorAll('[data-j112-solid],[data-j112-dir]').forEach(b => b.addEventListener('click', () => {
    clearFeedback(); if (b.dataset.j112Solid) solid = b.dataset.j112Solid; else direction = b.dataset.j112Dir;
    root.querySelectorAll('[data-j112-solid]').forEach(e => e.setAttribute('aria-pressed', String(e.dataset.j112Solid === solid)));
    root.querySelectorAll('[data-j112-dir]').forEach(e => e.setAttribute('aria-pressed', String(e.dataset.j112Dir === direction))); draw();
  }));
  get('j112-axis').addEventListener('pointerdown', e => {
    const svg = get('j112-axis'), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const x = p.matrixTransform(svg.getScreenCTM().inverse()).x;
    get('j112-end').value = String(Math.round(Math.max(-6, Math.min(6, (x - 30) / 25 - 6)) * 20) / 20); clearFeedback(); draw();
  });
  get('j112-end').addEventListener('input', draw);
  get('j112-solve-check').addEventListener('click', () => {
    const failures = [], t = tasks[taskIndex];
    labels.forEach((_, i) => verify(get('j112-line-' + i), v => checkStep(t, i, v, get('j112-reason-' + i).value), failures, '第' + (i + 1) + '步'));
    verify(get('j112-end'), v => { if (!eq(scalar(v), scalar(t.end))) throw Error('核对端点的精确值'); }, failures, '数轴');
    if (solid !== t.solid || direction !== t.dir) failures.push('数轴：核对端点是否属于解集及方向');
    report('j112-solve-feedback', failures, '本题五步式子、亲写的约定依据和你画的数轴已核对。依据是逐项符号运算，不是抽几个数试算。');
  });
  get('j112-op-check').addEventListener('click', () => {
    const failures = []; verify(get('j112-op-result'), v => checkOperation(get('j112-op').value, get('j112-factor').value, v, get('j112-op-reason').value), failures, '运算核对');
    report('j112-op-feedback', failures, '指定运算的两边与方向已按精确系数核对；原解集保持。');
  });
  get('j112-discount-check').addEventListener('click', () => {
    const failures = [];
    discount.forEach((_, r) => headings.forEach((h, c) => verify(get('j112-d-' + r + '-' + c), v => checkDiscount(r, c, v), failures, '第' + (r + 1) + '段·' + h)));
    for (let i = 0; i < 3; i++) verify(get('j112-compare-' + i), v => checkComparison(i, v), failures, '第三段比较式' + (i + 1));
    [['j112-cross', '300'], ['j112-a100', '90'], ['j112-b100', '100'], ['j112-a200', '180'], ['j112-b200', '170']].forEach(([id, expected]) => verify(get(id), v => { if (!eq(scalar(v), scalar(expected))) throw Error('用该门槛对应规则算实付款或交点'); }, failures, get(id).labels[0].textContent));
    report('j112-discount-feedback', failures, '三段模型、一般比较范围、交点和两个门槛的归属已核对。实付款在各自金额范围内非负。开放解释请按下方准则自核，系统不认证任意文字。');
  });
  function resetSolve() {
    get('j112-lines').querySelectorAll('input,select').forEach(e => { e.value = ''; }); get('j112-end').value = ''; solid = ''; direction = '';
    root.querySelectorAll('[data-j112-solid],[data-j112-dir]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    get('j112-prompt').textContent = tasks[taskIndex].prompt; clearFeedback(); draw();
  }
  get('j112-task').addEventListener('change', e => { taskIndex = Number(e.target.value); resetSolve(); });
  get('j112-solve-reset').addEventListener('click', resetSolve);
  get('j112-all-reset').addEventListener('click', () => {
    root.querySelectorAll('input,textarea,select').forEach(e => { e.value = ''; });
    taskIndex = 0; get('j112-task').value = '0'; get('j112-op').value = 'multiply'; resetSolve();
  });
  resetSolve();
}());
