/* j5-2 only. Exact rational arithmetic; deliberately closed input grammar. */
(function () {
  'use strict';
  const unsupported = '暂未核对：请按本区语法改写；这不表示你的数学想法错误。';
  function need(ok, msg = unsupported) { if (!ok) throw new Error(msg); }
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; }
  function q(n, d = 1n) {
    need(d !== 0n, '除数不能为 0。');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    need(n.toString().length < 80 && d.toString().length < 80, unsupported);
    return [n, d];
  }
  const zero = q(0n), one = q(1n);
  const add = (a, b) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const neg = a => [-a[0], a[1]];
  const sub = (a, b) => add(a, neg(b));
  const mul = (a, b) => q(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => { need(b[0] !== 0n, '除数不能为 0。'); return q(a[0] * b[1], a[1] * b[0]); };
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
  const str = a => String(a[0]) + (a[1] === 1n ? '' : '/' + a[1]);
  const val = (a, x) => add(mul(a.a, x), a.b);
  const same = (a, b) => eq(a.a, b.a) && eq(a.b, b.b);
  const combine = (a, b, minus = false) => ({ a: (minus ? sub : add)(a.a, b.a), b: (minus ? sub : add)(a.b, b.b) });
  const scale = (a, k) => ({ a: mul(a.a, k), b: mul(a.b, k) });
  function parse(raw) {
    need(typeof raw === 'string' && raw.length > 0 && raw.length <= 160);
    const s = raw.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
    const ts = []; let i = 0;
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue; }
      const m = /^(?:0|[1-9][0-9]{0,5})(?:\.[0-9]{1,6})?/.exec(s.slice(i));
      if (m) { ts.push({ t: 'n', s: m[0] }); i += m[0].length; }
      else { need(/[x()+*/-]/.test(s[i])); ts.push({ t: s[i], s: s[i++] }); }
      need(ts.length <= 100);
    }
    // A space never joins digits: `1 2`, `1 .2`, `0.1 2` stay invalid.
    let at = 0;
    function node(op, props) { return { op, ...props }; }
    function atom() {
      const t = ts[at++]; need(t);
      if (t.t === '+' || t.t === '-') return node('sign', { sign: t.t, child: atom() });
      if (t.t === 'n') {
        const [a, b = ''] = t.s.split('.');
        return node('num', { value: q(BigInt(a + b), 10n ** BigInt(b.length)) });
      }
      if (t.t === 'x') return node('x', {});
      need(t.t === '('); const child = sum(); need(ts[at++]?.t === ')'); return node('group', { child });
    }
    function product() {
      let a = atom();
      while (true) {
        let op = ts[at]?.t;
        const implicit = ts[at - 1]?.t === 'n' && (op === 'x' || op === '(');
        if (implicit) op = '*';
        else if (op === '*' || op === '/') at++;
        else break;
        a = node(op, { left: a, right: atom() });
      }
      return a;
    }
    function sum() {
      let a = product();
      while (ts[at]?.t === '+' || ts[at]?.t === '-') { const op = ts[at++].t; a = node(op, { left: a, right: product() }); }
      return a;
    }
    const tree = sum(); need(at === ts.length);
    function calc(t) {
      if (t.op === 'num') return { a: zero, b: t.value, hasX: false };
      if (t.op === 'x') return { a: one, b: zero, hasX: true };
      if (t.op === 'group') return calc(t.child);
      if (t.op === 'sign') { const a = calc(t.child); return { ...(t.sign === '-' ? scale(a, neg(one)) : a), hasX: a.hasX }; }
      const a = calc(t.left), b = calc(t.right), hasX = a.hasX || b.hasX;
      if (t.op === '+' || t.op === '-') return { ...combine(a, b, t.op === '-'), hasX };
      if (t.op === '*') { need(!(a.hasX && b.hasX)); return { ...scale(a.hasX ? a : b, a.hasX ? b.b : a.b), hasX }; }
      need(!b.hasX); return { ...scale(a, div(one, b.b)), hasX };
    }
    return { ...calc(tree), tree };
  }
  function equation(raw) {
    const parts = raw.split('='); need(parts.length === 2);
    return parts.map(parse);
  }
  function number(raw) { const a = parse(raw); need(!a.hasX); return a.b; }
  function unique(e) { need(!eq(e[0].a, e[1].a), '两边一次项的总系数相同，不属于本区求唯一解的练习；请另选数字系数一元一次方程。'); }
  function solution(e) { unique(e); return div(sub(e[1].b, e[0].b), sub(e[0].a, e[1].a)); }
  function contains(t, op) { return t.op === op || !!(t.child && contains(t.child, op)) || !!(t.left && (contains(t.left, op) || contains(t.right, op))); }
  function denominators(t, out = []) {
    if (t.op === '/') out.push(numberFromTree(t.right));
    if (t.child) denominators(t.child, out);
    if (t.left) { denominators(t.left, out); denominators(t.right, out); }
    return out;
  }
  // Evaluate only a numeric AST through an independent traversal of its operations.
  function numberFromTree(t) {
    if (t.op === 'num') return t.value;
    if (t.op === 'group') return numberFromTree(t.child);
    if (t.op === 'sign') return t.sign === '-' ? neg(numberFromTree(t.child)) : numberFromTree(t.child);
    const a = numberFromTree(t.left), b = numberFromTree(t.right);
    return ({ '+': add, '-': sub, '*': mul, '/': div })[t.op](a, b);
  }
  function step(before, after, action, operand) {
    const a = equation(before), b = equation(after); unique(a);
    let want;
    if (action === 'expand' || action === 'collect') {
      need(a.some(v => contains(v.tree, action === 'expand' ? 'group' : '+') || (action === 'collect' && contains(v.tree, '-'))), '这一行没有所选操作的对象；请按式子特点另选操作。');
      if (action === 'expand') need(!b.some(v => contains(v.tree, 'group')), '本区“去括号”请一次去完两边括号；分配律要乘到每一项。');
      if (action === 'collect') need(!a.concat(b).some(v => contains(v.tree, 'group')), '先去括号，或选更符合本行变化的操作。');
      want = a;
    } else if (action === 'add' || action === 'subtract') {
      const t = parse(operand); want = a.map(v => combine(v, t, action === 'subtract'));
    } else {
      need(['multiply', 'divide', 'denominator'].includes(action), '请先选这一步的操作和依据。');
      const k = number(operand); need(k[0] !== 0n, '两边同乘或同除的数必须非零。');
      if (action === 'denominator') {
        const ds = a.flatMap(v => denominators(v.tree));
        need(ds.length > 0, '原行没有数字分母；请按式子特点选择操作。');
        need(k[1] === 1n && k[0] > 0n && ds.every(d => d[1] === 1n && div(k, d)[1] === 1n), '本区去分母请填各整数分母的正公倍数；可先改写为整数分母。');
        need(!b.some(v => contains(v.tree, '/')), '本区去分母请写出已去完数字分母的一行。');
      }
      want = a.map(v => scale(v, action === 'divide' ? div(one, k) : k));
    }
    need(want.every((v, i) => same(v, b[i])), '这一行与所选的双边动作不一致。逐项检查符号、乘数以及没有分母的项；末解相同也不能代替这一步的依据。');
    unique(b); return b;
  }
  const cases = [
    { title: '盒子的质量', text: '天平左盘有4个相同盒子和3克砝码，右盘有1个同样盒子和18克砝码，恰好平衡。设每个盒子质量为x克。求1个盒子和4个盒子的质量。', equation: '4x+3=x+18', expressions: ['x', '4x'], labels: ['1个盒子的质量', '4个盒子的质量'], unit: '克', min: 0, meaning: 'x是每个盒子的质量（克）；两边分别是左盘、右盘的总质量。' },
    { title: '剪彩绳（括号）', text: '一根30米彩绳剪下3段等长绳，每段比x米长2米，剩余彩绳长x米。求每段剪下的长度和剩余长度。', equation: '30-3(x+2)=x', expressions: ['x+2', 'x'], labels: ['每段剪下的长度', '剩余长度'], unit: '米', min: 0, meaning: 'x是剩余彩绳长度（米）；左边是从30米扣除3段后余下的长度，右边也是剩余长度。' },
    { title: '比较绳长（数字分母）', text: '第一段绳长x米，第二段比第一段短2米。第一段的一半比第二段的三分之一长4米。求这两段绳各长多少米。', equation: 'x/2-(x-2)/3=4', expressions: ['x', 'x-2'], labels: ['第一段长度', '第二段长度'], unit: '米', min: 2, meaning: 'x是第一段长度（米）；左边是第一段的一半与第二段的三分之一的长度差，右边是已知的4米。' },
    { title: '按2∶5分绳', text: '两段绳的长度比是2∶5，总长84米。请设公共的份量为x米，分别用含x的式子表示两段长度，再列方程求两段各长多少米。', equation: '2x+5x=84', expressions: ['2x', '5x'], labels: ['较短段长度', '较长段长度'], unit: '米', min: 0, meaning: 'x是1份的长度（米）；两段分别为2x、5x米，左边是两段长度和，右边是总长84米。' }
  ];
  // Keep the original numerical quantities visible when transferring terms.
  // Distribute a known multiplier/divisor over an affine sum, but do not merge
  // separate constant quantities. Thus a total=parts relation and its expanded
  // or transposed form agree; a solved equation with the same root is not enough.
  function constantParts(t, factor = one) {
    if (t.op === 'group') return constantParts(t.child, factor);
    if (t.op === 'sign') return constantParts(t.child, t.sign === '-' ? neg(factor) : factor);
    if (t.op === '+' || t.op === '-') return constantParts(t.left, factor).concat(constantParts(t.right, t.op === '-' ? neg(factor) : factor));
    if (t.op === 'x') return [];
    if (t.op === '/') return constantParts(t.left, div(factor, numberFromTree(t.right)));
    if (t.op === '*') {
      if (contains(t.left, 'x')) return constantParts(t.left, mul(factor, numberFromTree(t.right)));
      if (contains(t.right, 'x')) return constantParts(t.right, mul(factor, numberFromTree(t.left)));
    }
    return [mul(factor, numberFromTree(t))];
  }
  function modelForm(e, sign = one) {
    const difference = scale(combine(e[0], e[1], true), sign);
    const parts = constantParts(e[0].tree, sign).concat(constantParts(e[1].tree, neg(sign)));
    return [str(difference.a), str(difference.b), parts.filter(v => v[0] !== 0n).map(str).sort().join(',')].join('|');
  }
  function model(raw, index, expressions) {
    const c = cases[index], e = equation(raw), expected = equation(c.equation); unique(e);
    need(expressions.every((v, i) => same(parse(v), parse(c.expressions[i]))), '请检查两问量与x的关系，单位也要一致。比值题中的x只代表1份。');
    const originalSides = (same(e[0], expected[0]) && same(e[1], expected[1])) || (same(e[1], expected[0]) && same(e[0], expected[1]));
    need(originalSides || modelForm(e) === modelForm(expected) || modelForm(e, neg(one)) === modelForm(expected), '暂未核对这种列式：本区支持原两边各自恒等的写法，以及保留原数量的展开、合并x项、移项或换边。请保留情境中的数及其运算关系；只写最终解不能代替建模。这不表示未支持的写法数学错误。');
    return e;
  }
  function inOriginalUnit(raw, unit, originalUnit) {
    const units = { '克': ['mass', one], 'g': ['mass', one], '千克': ['mass', q(1000n)], 'kg': ['mass', q(1000n)], '米': ['length', one], 'm': ['length', one] };
    const got = units[unit.trim()], original = units[originalUnit];
    need(got, '暂未核对这个单位：质量请用克/g或千克/kg，长度请用米/m；请同时换算数值，未支持不表示量值错误。');
    need(got[0] === original[0], '单位量纲不一致：质量和长度不能互换。');
    return mul(number(raw), div(got[1], original[1]));
  }
  function verify(raw, xRaw, left, right, quantities, units, index) {
    const c = cases[index], e = equation(raw), x = number(xRaw); unique(e);
    const l = val(e[0], x), r = val(e[1], x);
    need(eq(l, number(left)) && eq(r, number(right)) && eq(l, r), '请把x代入最初列出的方程，分别计算左右两边，不是代最后一行。');
    need(sub(x, q(BigInt(c.min)))[0] > 0n, '请检查实际范围：两段长度或盒子质量都应为正，短2米的绳也必须存在。');
    quantities.forEach((v, i) => need(eq(inOriginalUnit(v, units[i], c.unit), val(parse(c.expressions[i]), x)), '第' + (i + 1) + '个问量的数值与单位换算后不符；请逐一还原两问量，不能只改单位而不换数值。'));
    return x;
  }
  function repeat(block, multiplier, subtraction, numerator, denominator) {
    need(/^[0-9]{1,3}$/.test(block), '循环节请输入1–3位数字，可保留前导0；不填小数点或省略号。');
    need(!/^0+$/.test(block), '全0展式的值为0，是有限小数的补零展式；请另选一个非全0循环节做纯循环探究。');
    const k = BigInt(block.length), m = 10n ** k, a = BigInt(block);
    need(eq(number(multiplier), q(m)), '请按循环节的位数移动小数点，使无限重复尾部对齐。');
    const e = equation(subtraction);
    // Require the actual 10^k x − x derivation, not just a solved result.
    const tree = e[0].tree;
    need(tree.op === '-' && same(parse('x'), parseTreeAffine(tree.right)), '相减一行请保留“所乘倍数*x-x”的形式，再合并。');
    need(eq(e[0].a, q(m - 1n)) && eq(e[0].b, zero) && eq(e[1].a, zero) && eq(e[1].b, q(a)), '相同的无限尾部相减后消去；整数部分按保留的循环节位数计算。');
    need(/^(?:0|[1-9][0-9]{0,5})$/.test(numerator) && /^[1-9][0-9]{0,5}$/.test(denominator), '最终分数请分别填写非负整数分子、正整数分母。');
    const n = BigInt(numerator), d = BigInt(denominator);
    need(gcd(n, d) === 1n && eq(q(n, d), q(a, m - 1n)), '请用所得系数求x，并约成最简分数。');
    return { k: String(k), m: String(m), a: String(a), coefficient: String(m - 1n), fraction: str(q(n, d)) };
  }
  function parseTreeAffine(t) {
    // Used only for the explicit right subtrahend x (allow parentheses/unary +).
    while (t.op === 'group' || (t.op === 'sign' && t.sign === '+')) t = t.child;
    return t.op === 'x' ? { a: one, b: zero } : { a: zero, b: zero };
  }
  const api = { parse, equation, number, solution, step, model, verify, repeat, str, cases };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined' || document.body?.dataset.sec !== 'j5-2') return;
  const root = document.getElementById('j52-own');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  root.innerHTML = `
    <h2>先自己列、自己解，再对照</h2>
    <p>这里不预填下一步。先按题意列式，再根据式子的特点选操作；可以跳过不需要的步骤。已有讲解和图解仍在下方。</p>
    <p class="small">核对语法：只用小写x、整数或最多6位小数、+ − * / 和圆括号；数字可紧接x或左括号，其他乘法请写*。分母只用已知数。每次只写一个等号，不写单位或省略号；数的空格不会拼接。列式可把原数量展开、合并x项、移项或换边，请保留情境中的数及其运算关系；只给末解不算建模。未支持写法会提示暂未核对。</p>
    <label>选择一个情境 <select id="own-case">${cases.map((c, i) => `<option value="${i}">${c.title}</option>`).join('')}</select></label>
    <p id="own-story"></p>
    <form id="own-model" class="card">
      <label>x表示什么？两边各表示什么量？等量关系是什么？<textarea id="own-meaning" rows="3"></textarea></label>
      <p class="small">这段文字只供你自核，不自动判真，也不表示已发生纸笔或同伴讨论。</p>
      <label><span id="own-expr-label0"></span>的式子 <input id="own-expr0" autocomplete="off"></label>
      <label><span id="own-expr-label1"></span>的式子 <input id="own-expr1" autocomplete="off"></label>
      <label>自己列出的方程 <input id="own-equation" autocomplete="off"></label>
      <button type="submit">核对数量关系，开始推演</button>
      <p id="own-model-feedback" role="status"></p>
      <details id="own-model-compare" hidden><summary>对照一种列式的设量和意义（你的文字仍需自核）</summary><p id="own-model-meaning"></p></details>
    </form>
    <form id="own-solve" class="card" hidden>
      <p>已核对的逐行过程：</p><ol id="own-lines"></ol>
      <label>这一步的操作和依据 <select id="own-action">
        <option value="">请选择</option><option value="denominator">去分母：两边同乘正公倍数（等式性质2）</option>
        <option value="expand">去括号：数乘到每项（分配律）</option><option value="add">两边同加一个式子／移项（等式性质1）</option>
        <option value="subtract">两边同减一个式子／移项（等式性质1）</option><option value="collect">合并同类项／算常数（运算律）</option>
        <option value="divide">两边同除非零数／系数化1（等式性质2）</option><option value="multiply">两边同乘非零数／系数化1（等式性质2）</option>
      </select></label>
      <label id="own-operand-label">同加／减的式子，或同乘／除的数 <input id="own-operand" autocomplete="off"></label>
      <label>为什么现在选这一步？它让方程有什么变化？<textarea id="own-why" rows="2"></textarea></label>
      <label>下一行等式 <input id="own-next" autocomplete="off"></label>
      <button type="submit">核对这一行和依据</button> <button type="button" id="own-undo">退回上一行</button>
      <p id="own-step-feedback" role="status"></p>
      <p class="small">操作和等式由程序逐边核对；“为什么”的文字只供自核。可把合并写在双边动作的同一行；去括号与合并只核两边各自恒等，不核你心里采用的书写顺序。</p>
    </form>
    <form id="own-verify" class="card" hidden>
      <h3>代回原式，再答全部问量</h3>
      <p class="small" id="own-unit-note"></p>
      <label>求出的x <input id="own-x" autocomplete="off"></label>
      <label>代入最初方程的左边，计算结果 <input id="own-left" autocomplete="off"></label>
      <label>代入最初方程的右边，计算结果 <input id="own-right" autocomplete="off"></label>
      <label><span id="own-quantity-label0"></span> <input id="own-quantity0" autocomplete="off"></label>
      <label>这一量的单位 <input id="own-unit0" autocomplete="off"></label>
      <label><span id="own-quantity-label1"></span> <input id="own-quantity1" autocomplete="off"></label>
      <label>这一量的单位 <input id="own-unit1" autocomplete="off"></label>
      <label>检查实际范围：各个量是否为正、能否存在？<textarea id="own-range" rows="2"></textarea></label>
      <p class="small">范围文字仍需自核；程序另核数值的正长度／正质量限制。</p>
      <button type="submit">核对原式、问量和单位</button><p id="own-verify-feedback" role="status"></p>
    </form>
    <button type="button" id="own-reset">清空本次，重新尝试</button>
    <details class="more"><summary>选学：自己选择纯循环小数的循环节</summary>
      <p>选择1–3位、非全0的循环节（可以以0开头），设x为从小数点后立即开始无限重复该循环节的小数。先移动小数点，再相减、约分。有限截断的小数不能与无限重复展式写等号；全0展式的值为0，另作有限小数看待。</p>
      <form id="own-repeat">
        <label>循环节 <input id="own-block" inputmode="numeric" maxlength="3" autocomplete="off"></label>
        <p id="own-repeat-reading"></p>
        <label>为了对齐无限重复尾部，两边同乘的倍数 <input id="own-repeat-m" autocomplete="off"></label>
        <label>相减一行（保留所乘倍数*x-x，再等于整数）<input id="own-repeat-sub" autocomplete="off"></label>
        <label>约分后的分子 <input id="own-repeat-n" inputmode="numeric" autocomplete="off"></label>
        <label>约分后的分母 <input id="own-repeat-d" inputmode="numeric" autocomplete="off"></label>
        <button type="submit">核对自己的推导</button> <button type="reset">重试选学</button>
        <p id="own-repeat-feedback" role="status"></p>
        <details id="own-repeat-compare" hidden><summary>推导后对照</summary><p id="own-repeat-proof"></p></details>
      </form>
    </details>`;
  const $ = id => root.querySelector('#' + id);
  let index = 0, original = '', lines = [];
  const feedback = (id, s = '') => { $(id).textContent = s; };
  function clearVerify() { $('own-verify').reset(); $('own-verify').hidden = true; feedback('own-verify-feedback'); }
  function showLines() {
    $('own-lines').replaceChildren();
    for (const line of lines) { const li = document.createElement('li'); li.textContent = line; $('own-lines').append(li); }
  }
  function invalidateModel() {
    original = ''; lines = []; showLines(); $('own-solve').reset(); $('own-solve').hidden = true;
    clearVerify(); feedback('own-model-feedback'); feedback('own-step-feedback'); $('own-model-compare').hidden = true; $('own-model-compare').open = false;
  }
  function reset() {
    index = Number($('own-case').value); const c = cases[index];
    $('own-model').reset(); invalidateModel(); $('own-story').textContent = c.text;
    $('own-unit-note').textContent = 'x和代入原式的左右值都按题设的“' + c.unit + '”填写。最后两问量可分别用质量单位克/g、千克/kg，或长度单位米/m；数值须随单位精确换算。其它单位暂未核对，不能把质量与长度互换。';
    c.labels.forEach((s, i) => { $('own-expr-label' + i).textContent = s; $('own-quantity-label' + i).textContent = s; });
    $('own-repeat').reset(); feedback('own-repeat-feedback'); feedback('own-repeat-reading'); $('own-repeat-compare').hidden = true; $('own-repeat-compare').open = false;
  }
  function attempt(id, run) { try { run(); } catch (e) { feedback(id, e.message); } }
  $('own-case').addEventListener('change', reset); $('own-reset').addEventListener('click', reset);
  $('own-model').addEventListener('input', invalidateModel);
  $('own-model').addEventListener('submit', ev => {
    ev.preventDefault(); invalidateModel(); attempt('own-model-feedback', () => {
      need($('own-meaning').value.trim(), '先写下设量、两边量及等量关系；文字请自己核对。');
      $('own-model-meaning').textContent = '这是一种参考列式的意义；采用重排关系时，请自行说明你写的每一边：' + cases[index].meaning; $('own-model-compare').hidden = false;
      model($('own-equation').value, index, [0, 1].map(i => $('own-expr' + i).value));
      original = $('own-equation').value; lines = [original]; showLines(); $('own-solve').hidden = false;
      feedback('own-model-feedback', '方程和两问量的式子通过本区原数量关系核对。两边量的实际意义及文字解释仍请自行核对，再逐行推演。');
    });
  });
  function operandVisibility() { $('own-operand-label').hidden = ['expand', 'collect'].includes($('own-action').value); }
  $('own-action').addEventListener('change', operandVisibility);
  $('own-solve').addEventListener('input', () => { feedback('own-step-feedback'); clearVerify(); });
  $('own-solve').addEventListener('change', () => { feedback('own-step-feedback'); clearVerify(); });
  $('own-solve').addEventListener('submit', ev => {
    ev.preventDefault(); attempt('own-step-feedback', () => {
      need($('own-why').value.trim(), '先写为什么选这一步；文字只供自核。');
      const next = $('own-next').value, action = $('own-action').value;
      const e = step(lines[lines.length - 1].split(' ｜ ')[0], next, action, $('own-operand').value);
      const label = $('own-action').selectedOptions[0].textContent;
      lines.push(next + ' ｜ ' + label + ($('own-operand-label').hidden ? '' : '：' + $('own-operand').value) + '；自述（仅自核）：' + $('own-why').value.trim()); showLines();
      feedback('own-step-feedback', '本行与所选操作逐边一致。回看“为什么”的文字，再考虑下一步。');
      $('own-next').value = ''; $('own-operand').value = ''; $('own-why').value = ''; $('own-action').value = ''; operandVisibility();
      if (eq(e[0].a, one) && eq(e[0].b, zero) && eq(e[1].a, zero)) {
        $('own-verify').hidden = false; feedback('own-step-feedback', '已化成x等于一个常数。请自行代回最初方程，再答两个问量。');
      }
    });
  });
  $('own-undo').addEventListener('click', () => { if (lines.length > 1) lines.pop(); showLines(); clearVerify(); feedback('own-step-feedback'); });
  $('own-verify').addEventListener('input', () => feedback('own-verify-feedback'));
  $('own-verify').addEventListener('submit', ev => {
    ev.preventDefault(); attempt('own-verify-feedback', () => {
      need($('own-range').value.trim(), '先写下实际范围检查；文字请自己核对。');
      verify(original, $('own-x').value, $('own-left').value, $('own-right').value, [0, 1].map(i => $('own-quantity' + i).value), [0, 1].map(i => $('own-unit' + i).value), index);
      feedback('own-verify-feedback', '代原式的左右数值、两个问量、单位及数值范围均通过。设量、两边量和步骤作用的文字仍需你逐项自核；可到下方图解对照。');
    });
  });
  function clearRepeat() { feedback('own-repeat-feedback'); $('own-repeat-compare').hidden = true; $('own-repeat-compare').open = false; }
  $('own-repeat').addEventListener('input', () => {
    clearRepeat(); const b = $('own-block').value;
    feedback('own-repeat-reading', /^[0-9]{1,3}$/.test(b) ? '你选的展式：0.' + b + b + b + '…（循环节“' + b + '”无限重复，保留' + b.length + '位）' : '');
  });
  $('own-repeat').addEventListener('reset', () => { clearRepeat(); feedback('own-repeat-reading'); });
  $('own-repeat').addEventListener('submit', ev => {
    ev.preventDefault(); attempt('own-repeat-feedback', () => {
      const r = repeat($('own-block').value, $('own-repeat-m').value, $('own-repeat-sub').value, $('own-repeat-n').value, $('own-repeat-d').value);
      feedback('own-repeat-feedback', '移位、相减及最简分数通过。');
      $('own-repeat-proof').textContent = '循环节有' + r.k + '位。' + r.m + 'x与x的小数部分完全相同，相减得' + r.coefficient + 'x=' + r.a + '，所以x=' + r.fraction + '。这是无限重复展式的移位相减，不是有限截断小数的等号。' + (r.fraction === '1' ? '全9的无限重复展式等于1，不能说它小于1。' : '');
      $('own-repeat-compare').hidden = false;
    });
  });
  reset();
})();
