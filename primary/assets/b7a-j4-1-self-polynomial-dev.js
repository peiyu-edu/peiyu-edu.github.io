/* Only j4-1: finite, exact signed monomials; no evaluation or sampled identities. */
(function () {
  'use strict';
  const gcd = (a, b) => b ? gcd(b, a % b) : (a < 0n ? -a : a);
  function rat(n, d = 1n) {
    if (!d) throw Error('zero divisor');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d);
    return [n / g, d / g];
  }
  const mul = (a, b) => rat(a[0] * b[0], a[1] * b[1]);
  function decimal(s) {
    const [a, b = ''] = s.split('.');
    return rat(BigInt(a + b), 10n ** BigInt(b.length));
  }
  function parse(source) {
    if (typeof source !== 'string' || !source.trim() || source.length > 160) return null;
    // Keep token boundaries: 1 2 is two numbers, never 12 or 1*2. No NFKC.
    const re = /\s+|\d+(?:\.\d+)?|[a-z+*/^\-]/gy;
    const ts = []; let at = 0;
    while (at < source.length) {
      re.lastIndex = at;
      const m = re.exec(source);
      if (!m) return null;
      at = re.lastIndex;
      if (!/^\s+$/.test(m[0])) ts.push(m[0]);
    }
    const num = t => t !== undefined && /^\d+(?:\.\d+)?$/.test(t);
    const letter = t => t !== undefined && /^[a-z]$/.test(t);
    let i = 0; const terms = [];
    try {
      while (i < ts.length) {
        let sign = 1n;
        if (ts[i] === '+' || ts[i] === '-') sign = ts[i++] === '-' ? -1n : 1n;
        else if (terms.length) return null;
        let c = [sign, 1n], used = false; const powers = {};
        if (num(ts[i])) {
          c = mul(c, decimal(ts[i++])); used = true;
          if (ts[i] === '/' && num(ts[i + 1])) {
            const d = decimal(ts[i + 1]); c = mul(c, rat(d[1], d[0])); i += 2;
          }
        }
        while (letter(ts[i]) || (ts[i] === '*' && letter(ts[i + 1]))) {
          if (ts[i] === '*') { if (!used) return null; i++; }
          const v = ts[i++];
          if (Object.hasOwn(powers, v)) return null; // repeated factors: rewrite using ^
          let exponent = 1;
          if (ts[i] === '^') {
            i++;
            if (!/^[1-9]$/.test(ts[i] || '')) return null;
            exponent = Number(ts[i++]);
          }
          powers[v] = exponent; used = true;
        }
        if (!used) return null;
        if (ts[i] === '/') {
          if (!num(ts[i + 1])) return null;
          const d = decimal(ts[i + 1]); c = mul(c, rat(d[1], d[0])); i += 2;
        }
        if (i < ts.length && ts[i] !== '+' && ts[i] !== '-') return null;
        const letters = Object.keys(powers).filter(v => powers[v]).sort();
        terms.push({c, key: letters.map(v => v + '^' + powers[v]).join('*'), degree: letters.reduce((n, v) => n + powers[v], 0)});
      }
      const nonzero = terms.filter(t => t.c[0]);
      if (new Set(nonzero.map(t => t.key)).size !== nonzero.length) return null;
      return terms.length ? terms : null;
    } catch (_) { return null; }
  }
  function same(a, b) {
    if (!a || !b) return null;
    // Compare exact term multisets; zero terms may be omitted. No like-term algebra here.
    const keys = xs => xs.filter(t => t.c[0]).map(t => t.key + ':' + t.c.join('/')).sort();
    return JSON.stringify(keys(a)) === JSON.stringify(keys(b));
  }
  function numeric(s, expected) {
    const p = parse(s);
    if (!p || p.length !== 1 || p[0].key) return null;
    return same(p, parse(expected));
  }
  const cases = [
    {q: '水位每小时下降 0.4 米。t 小时内匀速下降（t≥0），相对于开始水位的变化量是多少米？上升为正、下降为负。先列单项式，再读系数、次数。', expr: '-0.4t', unit: ['米', 'm'], number: '-2/5', degree: '1', label: '单项式的系数（含符号）'},
    {q: '一个三角形的底是 a 米，高是 b 米（a、b 都大于 0）。用小学的面积公式列面积式（平方米），再读这个单项式的系数、次数。', expr: 'ab/2', unit: ['平方米', 'm²', 'm^2'], number: '1/2', degree: '2', label: '单项式的系数（含符号）'},
    {q: '每包材料 6 元，买 n 包，另付固定运费 9 元（n 是非负整数）。总费用是多少元？先列多项式，再读常数项、次数；自己逐项读出项的符号。', expr: '6n+9', unit: ['元'], number: '9', degree: '1', label: '多项式的常数项（含符号）'},
    {q: '水箱原有 20 升水，每分钟匀速流出 0.4 升；t 分钟后还剩多少升（0≤t≤50）？先列多项式，再读常数项、次数；别把某一时刻剩 0 升当成式子的次数。', expr: '20-0.4t', unit: ['升', 'L', 'l'], number: '20', degree: '1', label: '多项式的常数项（含符号）'}
  ];
  const sorts = [
    {text: '原式 4x − 7 − 3x^3 + 2x^2，按 x 降幂。', up: false, terms: [['+4x', 1], ['−7', 0], ['−3x^3', 3], ['+2x^2', 2]]},
    {text: '原式 −2x^2 + 0x^3 + 5 − x，按 x 升幂。0x^3 不参与排序，可省略；非零常数按 0 次排。这里不规定 0 的次数。', up: true, terms: [['−2x^2', 2], ['+5', 0], ['−x', 1]]},
    {text: '原式 3y − 2x^2 + 4xy − 5 + x^2y，按指定字母 x 降幂。只看 x 的指数；相同指数的项可互换，不合并。', up: false, terms: [['+3y', 0], ['−2x^2', 2], ['+4xy', 1], ['−5', 0], ['+x^2y', 2]]}
  ];
  function ordered(terms, up) { return terms.every((t, i) => !i || (up ? terms[i - 1][1] <= t[1] : terms[i - 1][1] >= t[1])); }
  // Pure functions also serve the page-specific truth tests; no global browser API.
  if (typeof module !== 'undefined' && module.exports) module.exports = {parse, same, numeric, ordered};
  if (typeof document === 'undefined' || document.body?.dataset.sec !== 'j4-1') return;
  const root = document.getElementById('self-polynomial-work');
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = '1';
  const el = id => root.querySelector('#sp-' + id);
  const feedback = (id, text) => { el(id).textContent = text; };
  const done = new Set();
  const records = new Map();
  let active = 0;
  const clearReason = () => { el('criteria').hidden = true; feedback('reason-feedback', ''); };
  function progress() {
    feedback('progress', '当前已核对数量式与数值：' + done.size + '/4。修改已核对题会撤回该题标记；文字仍须自核。');
    el('records').replaceChildren();
    for (let k = 0; k < cases.length; k++) {
      if (!done.has(k)) continue;
      const li = document.createElement('li'); li.textContent = records.get(k); el('records').append(li);
    }
  }
  function loadCase() {
    active = Number(el('case').value);
    el('question').textContent = cases[active].q;
    el('number-label').textContent = cases[active].label;
    for (const k of ['expression', 'unit', 'number', 'degree']) el(k).value = '';
    feedback('model-feedback', ''); clearReason(); progress();
  }
  el('case').addEventListener('change', loadCase);
  el('model-form').addEventListener('input', e => {
    if (e.target === el('case')) return;
    done.delete(active); feedback('model-feedback', ''); clearReason(); progress();
  });
  el('model-form').addEventListener('submit', e => {
    e.preventDefault(); const c = cases[active];
    const values = ['expression', 'unit', 'number', 'degree'].map(k => el(k).value.trim());
    if (values.some(v => !v)) return feedback('model-feedback', '先完成数量式、单位与两个数值，再核对。');
    const equality = same(parse(values[0]), parse(c.expr));
    const number = numeric(values[2], c.number), degree = numeric(values[3], c.degree);
    if (equality === null || number === null || degree === null) return feedback('model-feedback', '暂未核对：请按声明语法改写（数字不可拆开；分母须为非零数）。这不表示数学想法错误。');
    if (!equality) return feedback('model-feedback', '数量式与本题关系尚不一致。检查变化的正负、固定量、面积公式；若用了合并或括号等其它等价写法，请改写成逐项形式再核对。');
    if (!c.unit.includes(values[1])) return feedback('model-feedback', '数量式相符；请检查结果的单位，并用题目中的中文单位填写。');
    if (!number || !degree) return feedback('model-feedback', '数量式与单位相符；再检查数字因数的符号、常数项或字母指数。次数不是把数字因数也数进去。');
    records.set(active, el('case').selectedOptions[0].textContent + '：' + values[0] + '（' + values[1] + '）；' + c.label + ' ' + values[2] + '，次数 ' + values[3]);
    done.add(active); progress(); feedback('model-feedback', '本题数量式、单位及数值核对一致。再用自己的话说明式的结构；不是只试一个字母取值。');
  });
  el('model-form').addEventListener('reset', e => {
    e.preventDefault(); // Keep question and label consistent, regardless of default reset timing.
    for (const k of ['expression', 'unit', 'number', 'degree']) el(k).value = '';
    done.delete(active); clearReason(); feedback('model-feedback', ''); progress();
  });
  el('reason').addEventListener('input', clearReason);
  el('reason-form').addEventListener('reset', clearReason);
  el('reason-form').addEventListener('submit', e => {
    e.preventDefault(); clearReason();
    if (done.size < 4) return feedback('reason-feedback', '先亲自完成四题的数量式与数值核对，再比较结构。');
    if (!el('reason').value.trim()) return feedback('reason-feedback', '先写自己的观察和分类理由，再展开准则。');
    el('criteria').hidden = false;
    feedback('reason-feedback', '请逐条自核并修改；自由文字未自动认证正确。');
  });
  let arrangement = [];
  function renderSort(focus = -1) {
    const list = el('sort-list'); list.replaceChildren();
    arrangement.forEach((term, index) => {
      const li = document.createElement('li');
      li.append(document.createTextNode(term[0] + ' '));
      for (const [delta, label] of [[-1, '前移'], [1, '后移']]) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost';
        b.textContent = label; b.setAttribute('aria-label', term[0] + ' ' + label);
        b.disabled = index + delta < 0 || index + delta >= arrangement.length;
        b.addEventListener('click', () => move(index, delta));
        b.addEventListener('keydown', e => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); move(index, e.key === 'ArrowUp' ? -1 : 1); }
        });
        li.append(b);
      }
      list.append(li);
    });
    if (focus >= 0) {
      const buttons = list.children[focus].querySelectorAll('button');
      [...buttons].find(b => !b.disabled)?.focus();
    }
  }
  function move(i, delta) {
    const j = i + delta;
    if (j < 0 || j >= arrangement.length) return;
    [arrangement[i], arrangement[j]] = [arrangement[j], arrangement[i]];
    feedback('sort-feedback', ''); renderSort(j);
  }
  function resetSort() {
    const s = sorts[Number(el('sort-case').value)];
    arrangement = s.terms.map(t => [...t]); el('sort-question').textContent = s.text;
    feedback('sort-feedback', ''); renderSort();
  }
  el('sort-case').addEventListener('change', resetSort);
  el('sort-reset').addEventListener('click', resetSort);
  el('sort-check').addEventListener('click', () => {
    const s = sorts[Number(el('sort-case').value)];
    feedback('sort-feedback', ordered(arrangement, s.up) ? '排列核对一致：项和符号完整保留。同一 x 指数的项不强排唯一顺序。' : '还需换项：只看指定字母 x 的指数，按要求逐渐变大或变小；项连同符号一起走。');
  });
  loadCase(); resetSort();
}());
