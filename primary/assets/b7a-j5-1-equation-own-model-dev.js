/* j5-1 only. No storage or shared learning contracts. Exact rational affine arithmetic. */
(function () {
  'use strict';
  const root = document.getElementById('j51-own');
  if (document.body.dataset.sec !== 'j5-1' || !root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';

  // Author display rules must not expose later phases marked hidden.
  root.classList.add('own-workspace');
  const phaseStyle = document.createElement('style');
  phaseStyle.textContent = '.own-workspace [hidden]{display:none!important}.own-workspace input,.own-workspace select,.own-workspace textarea,.own-workspace button{font:inherit;max-width:100%;box-sizing:border-box}';
  root.append(phaseStyle);
  // Page-local feedback: keep the first correction beside its control.
  let activeField = null;
  function clearErrors() {
    root.querySelectorAll('[data-input-error]').forEach(e => {
      const id=e.id;
      root.querySelectorAll('[aria-describedby]').forEach(input=>{
        const ids=input.getAttribute('aria-describedby').split(/\s+/).filter(v=>v!==id);
        if(ids.length)input.setAttribute('aria-describedby',ids.join(' '));else input.removeAttribute('aria-describedby');
      });e.remove();
    });
    root.querySelectorAll('[aria-invalid="true"]').forEach(e => e.removeAttribute('aria-invalid'));
  }
  function fieldError(input, message) {
    if (!input) return;
    const panel = input.closest('[data-phase]');
    if (panel) showPhase(Number(panel.dataset.phase));
    clearErrors();
    for(let parent=input.parentElement;parent&&parent!==root;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    input.setAttribute('aria-invalid', 'true');
    const note = document.createElement('span');
    note.dataset.inputError = 'true'; note.setAttribute('role', 'alert');
    note.id=(input.id||input.name||'own-field')+'-error';
    const described=(input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
    if(!described.includes(note.id))described.push(note.id);
    input.setAttribute('aria-describedby',described.join(' '));
    note.style.cssText = 'display:block;font-size:15px;overflow-wrap:anywhere;color:var(--no)';
    note.textContent = message; input.insertAdjacentElement('afterend', note);
    if (!input.closest('[hidden]')) input.focus();
  }
  function atField(input, run) { activeField = input; return run(); }
  function inputHelp(element) {
    if (!element) return;
    const d = document.createElement('details'); d.className = 'more';
    const s = document.createElement('summary'); s.textContent = '怎么输入？';
    element.before(d); d.append(s, element);
  }
  root.addEventListener('input', clearErrors);
  root.addEventListener('change', clearErrors);
  root.addEventListener('reset', clearErrors);

  const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) { [a, b] = [b, a % b]; } return a; };
  function q(n, d = 1n) {
    if (!d) throw Error('除以 0 无意义');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); return [n / g, d / g];
  }
  const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const neg = a => [-a[0], a[1]];
  const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => q(a[0] * b[1], a[1] * b[0]);
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const zero = a => a[0] === 0n;
  const str = a => String(a[0]) + (a[1] === 1n ? '' : '/' + a[1]);
  const Z = q(0n), O = q(1n), C = n => [Z, q(BigInt(n))];
  const plus = (a, b) => [add(a[0], b[0]), add(a[1], b[1])];
  const minus = (a, b) => plus(a, b.map(neg));
  function times(a, b) {
    if (!zero(a[0]) && !zero(b[0])) throw Error('暂未核对含字母的乘积，请改写为本节的一次式');
    return [add(mul(a[0], b[1]), mul(a[1], b[0])), mul(a[1], b[1])];
  }
  function over(a, b) {
    if (!zero(b[0])) throw Error('暂未核对含未知数的除数，请改写');
    return a.map(v => div(v, b[1]));
  }
  const same = (a, b) => eq(a[0], b[0]) && eq(a[1], b[1]);
  const value = (a, x) => add(mul(a[0], x), a[1]);
  // Tokenize without deleting whitespace: "3 4" is never "34". No NFKC.
  function parse(raw, variable = 'x') {
    if (!raw.trim()) throw Error('请先填写待答内容');
    if (raw.length > 180) throw Error('暂未核对这么长的式子，请简写');
    const s = raw.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
    const tokens = []; let p = 0;
    while (p < s.length) {
      if (/\s/.test(s[p])) { p++; continue; }
      const m = s.slice(p).match(/^(?:\d+(?:\.\d+)?|\.\d+)/);
      if (m) {
        if (m[0].replace('.', '').length > 12) throw Error('暂未核对超过 12 位的数，请改写');
        tokens.push({t:'n', v:m[0]}); p += m[0].length;
      } else if (s[p] === variable) { tokens.push({t:'v'}); p++; }
      else if ('+-*/()'.includes(s[p])) { tokens.push({t:s[p++]}); }
      else throw Error('第 ' + (p + 1) + ' 个字符“' + s[p] + '”不能放在这里。字母请用你所设的小写字母。');
    }
    let i = 0;
    const at = () => tokens[i]?.t;
    function atom() {
      const t = tokens[i++];
      if (!t) throw Error('暂未核对不完整的式子，请补全');
      if (t.t === 'n') {
        const [a, b = ''] = t.v.split('.');
        return [Z, q(BigInt((a || '0') + b), 10n ** BigInt(b.length))];
      }
      if (t.t === 'v') return [O, Z];
      if (t.t === '+' || t.t === '-') { const a = atom(); return t.t === '-' ? a.map(neg) : a; }
      if (t.t === '(') { const a = sum(); if (at() !== ')') throw Error('暂未核对括号，请补全'); i++; return a; }
      throw Error('暂未核对此式，请改写');
    }
    function product() {
      let a = atom();
      while (true) {
        const t = at(), previous = tokens[i - 1]?.t;
        if (t === '*' || t === '/') { i++; a = t === '*' ? times(a, atom()) : over(a, atom()); }
        else if ((t === 'v' || t === '(') && (previous === 'n' || previous === ')')) a = times(a, atom());
        else break;
      }
      return a;
    }
    function sum() {
      let a = product();
      while (at() === '+' || at() === '-') { const t = tokens[i++].t; const b = product(); a = t === '+' ? plus(a, b) : minus(a, b); }
      return a;
    }
    const a = sum();
    if (i !== tokens.length) throw Error('这段式子暂未核对：两个数之间少了运算符；一个数的数字不要用空格拆开');
    return a;
  }
  function constant(s) { const a = parse(s); if (!zero(a[0])) throw Error('这里请填写一个数'); return a[1]; }
  function equation(s, v = 'x') {
    const sides = s.split('=');
    if (sides.length !== 2) throw Error('请填写只有一个等号的等式；暂未核对其它写法');
    return sides.map(a => parse(a, v));
  }
  const form = name => root.querySelector('[data-work="' + name + '"]');
  const field = (f, name) => f.elements.namedItem(name);
  const get = (f, name) => { activeField = field(f, name); return activeField.value; };
  const feedback = (f, text = '') => { f.querySelector('[data-feedback]').textContent = text; };
  const model = form('model'), verify = form('verify'), solve = form('solve'), original = form('original');
  let modelEquation = null, current = equation('-3x+6=18'), finalLine = false;
  function clearVerification() { modelEquation = null; feedback(verify); verify.hidden = solve.hidden = original.hidden = true; root.querySelector('[data-solve-intro]').hidden = true; }
  model.addEventListener('input', clearVerification);
  model.addEventListener('change', clearVerification);
  let phase = 0;
  function showPhase(n) {
    clearErrors(); feedback(model);
    phase = n;
    model.querySelectorAll('[data-phase]').forEach(e => e.hidden = Number(e.dataset.phase) !== n);
    model.querySelector('[data-back]').hidden = n === 0;
  }
  function readMeaning() {
    const v = get(model, 'variable');
    if (!/^[a-z]$/.test(v)) throw Error('请自己选择一个小写英文字母表示未知数');
    for (const name of ['attempt', 'meaning']) if (!get(model, name).trim()) throw Error(name === 'attempt' ? '先写你打算怎样算，或写卡在哪里。' : '写清这个字母表示什么、用什么单位。');
    if (get(model, 'unit') !== 'yuan') throw Error('每本的价格，用“元/本”表示。');
    return v;
  }
  function readQuantities(v) {
    const quantity = parse(get(model, 'quantity'), v);
    if (!same(quantity, [q(4n), Z])) throw Error('这里是4本的钱，检查本数与每本价格怎样相乘。');
    const total = parse(get(model, 'total'), v);
    if (!same(total, [q(4n), q(6n)])) throw Error('总钱数还要算上6元包装费。');
    if (!get(model, 'relation').trim()) throw Error('先写全这句关系：哪两笔钱相等？');
    return total;
  }
  function readModel() {
    const v = readMeaning(), total = readQuantities(v);
    activeField = field(model, 'self');
    if (!activeField.checked) throw Error('展开文字自核准则，检查后再勾选。');
    const e = equation(get(model, 'equation'), v);
    if (!((same(e[0], total) && same(e[1], C(34))) || (same(e[1], total) && same(e[0], C(34))))) throw Error('等号两边应分别是你写的总钱数和34元。其他列式请先在纸上自核。');
    return e;
  }
  model.querySelector('[data-back]').onclick = () => { showPhase(Math.max(0, phase - 1)); clearVerification(); };
  showPhase(0);
  function submit(f, run) {
    f.addEventListener('submit', event => { event.preventDefault(); try { run(); } catch (error) { fieldError(activeField, error.message); feedback(f, error.message); } });
    for (const type of ['input', 'change']) f.addEventListener(type, () => feedback(f));
    f.addEventListener('reset', () => feedback(f));
  }
  submit(model, () => {
    if (phase < 2) {
      const v = readMeaning();
      if (phase === 1) readQuantities(v);
      showPhase(phase + 1); feedback(model, phase === 1 ? '接着用字母写出两笔钱。文字还要自己检查。' : '量式核对通过。检查文字，再列方程。'); return;
    }
    modelEquation = readModel(); verify.hidden = false;
    feedback(model, '量式和方程核对通过。接着选一个数代入；文字按准则自核。');
  });
  model.addEventListener('reset', () => { clearVerification(); showPhase(0); clearErrors(); });
  submit(verify, () => {
    if (!modelEquation) throw Error('请先提交并核对你列的方程；编辑后需重新提交');
    if (!get(verify, 'candidate')) throw Error('请选择一个给定值');
    const x = constant(get(verify, 'candidate')), l = value(modelEquation[0], x), r = value(modelEquation[1], x);
    const a = constant(get(verify, 'left'));
    if (!eq(a, l)) throw Error('左边的计算尚未核对一致，负数代入时要加括号。');
    const b = constant(get(verify, 'right'));
    if (!eq(b, r)) throw Error('右边的计算尚未核对一致，请代回原方程右边。');
    const isSolution = eq(l, r);
    if (get(verify, 'judgment') !== (isSolution ? 'yes' : 'no')) throw Error('请根据原方程两边是否相等重新判断');
    solve.hidden = false; root.querySelector('[data-solve-intro]').hidden = false;
    feedback(verify, '原左边 = ' + str(l) + '，原右边 = ' + str(r) + '；' + (isSolution ? '相等，是方程的解，且单价非负，符合题意。' : '不相等，不是原方程的解。') + (x[0] < 0n ? '负单价也不符合本题的实际范围。' : ''));
  });
  submit(solve, () => {
    const op = get(solve, 'operation');
    if (!['+', '-', '*', '/'].includes(op)) throw Error('请先选择两边的同一动作');
    const operand = parse(get(solve, 'operand'));
    if ((op === '*' || op === '/') && !zero(operand[0])) throw Error('本节两边乘除仅用数；含未知数的式子暂未核对');
    if (op === '/' && zero(operand[1])) throw Error('除以 0 无意义，不能做这一步');
    const next = equation(get(solve, 'next'));
    const action = {'+':plus, '-':minus, '*':times, '/':over}[op];
    const expected = current.map(a => action(a, operand));
    if (!same(next[0], expected[0]) || !same(next[1], expected[1])) throw Error('下一行与所写的双边动作不一致；两边都要做同样运算，检查符号和整边');
    const property = op === '+' || op === '-' ? '1' : '2';
    if (get(solve, 'property') !== property) throw Error('请再核对等式性质：加减依据性质 1，乘除依据性质 2');
    if (op === '*' && zero(operand[1])) {
      feedback(solve, '同乘 0 后这个等式仍成立，数学上没有错；但它丢失了原来未知数的限制，不能用于求原方程的解。本次不推进，请换一步。'); return;
    }
    if (root.querySelector('[data-history]').children.length >= 20) throw Error('已记录 20 步，请重来并尝试更简洁的路线');
    current = next;
    finalLine = same(current[0], [O, Z]) && zero(current[1][0]);
    const li = document.createElement('li');
    li.textContent = '两边同' + {'+':'加', '-':'减', '*':'乘', '/':'除以'}[op] + '（' + get(solve, 'operand') + '），依据性质 ' + property + '，得 ' + get(solve, 'next');
    root.querySelector('[data-history]').append(li);
    root.querySelector('[data-current]').textContent = '当前等式：' + get(solve, 'next');
    for (const name of ['operation', 'operand', 'next', 'property']) field(solve, name).value = '';
    feedback(original); original.hidden = !finalLine;
    feedback(solve, finalLine ? '已写成 x = 一个数。请将它代回原方程核对。' : '这一步的双边动作、等式和依据核对通过。继续亲写下一步。');
  });
  solve.addEventListener('reset', () => {
    current = equation('-3x+6=18'); finalLine = false;
    root.querySelector('[data-current]').textContent = '当前等式：−3x + 6 = 18';
    root.querySelector('[data-history]').replaceChildren(); original.reset(); original.hidden = true;
  });
  submit(original, () => {
    if (!finalLine) throw Error('请先逐步亲写到 x = 一个数，再检验');
    const x = constant(get(original, 'answer')), l = value(equation('-3x+6=18')[0], x), r = q(18n);
    if (!eq(x, current[1][1]) || !eq(l, r)) throw Error('所写的值不符合逐步结果或原方程，请回看每一步');
    if (!eq(constant(get(original, 'left')), l) || !eq(constant(get(original, 'right')), r)) throw Error('请重新计算原方程两边');
    feedback(original, '代回原方程：左边 = ' + str(l) + '，右边 = ' + str(r) + '，相等。逐步解方程及原式检验核对通过。');
  });
})();
