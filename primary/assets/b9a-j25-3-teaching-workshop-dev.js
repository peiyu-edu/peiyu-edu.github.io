/* Page-local J25 workshop. Exact rational arithmetic; no learning-record writes. */
(function () {
  'use strict';
  const abs = n => n < 0n ? -n : n;
  function gcd(a, b) { a = abs(a); b = abs(b); while (b) [a, b] = [b, a % b]; return a; }
  function rat(n, d = 1n) {
    if (!d) throw Error('分母不能为零');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d); return { n: n / g, d: d / g };
  }
  const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
  const neg = a => rat(-a.n, a.d);
  const sub = (a, b) => add(a, neg(b));
  const mul = (a, b) => rat(a.n * b.n, a.d * b.d);
  const div = (a, b) => rat(a.n * b.d, a.d * b.n);
  const cmp = (a, b) => a.n * b.d < b.n * a.d ? -1 : a.n * b.d > b.n * a.d ? 1 : 0;
  const equal = (a, b) => cmp(a, b) === 0;
  const R = n => rat(BigInt(n));
  const zero = () => [R(0), R(0), R(0)];
  function decimal(s) {
    if (!/^\d{1,6}(?:\.\d{1,6})?$/.test(s)) throw Error('数字须为至多六位整数、六位小数的普通十进制');
    const [a, b = ''] = s.split('.'); return rat(BigInt(a + b), 10n ** BigInt(b.length));
  }
  // Whitespace separates tokens. Never NFKC, join digits, evaluate JS or accept unknown symbols.
  function tokens(s) {
    if (typeof s !== 'string' || !s.trim() || s.length > 240) throw Error('请填写式子（至多240字符）');
    const out = []; let i = 0;
    while (i < s.length) {
      if (/[ \t\r\n]/.test(s[i])) { i++; continue; }
      if (/[0-9]/.test(s[i])) {
        const m = s.slice(i).match(/^\d+(?:\.\d+)?/)[0]; decimal(m); out.push(m); i += m.length;
      } else if ('x+-*/^()='.includes(s[i])) out.push(s[i++]);
      else throw Error('只接受声明的 ASCII 数学语法；请逐个重写不支持的符号');
      if (out.length > 100) throw Error('式子过长，请分步整理');
    }
    return out;
  }
  const padd = (a, b) => a.map((v, i) => add(v, b[i]));
  const pneg = a => a.map(neg);
  function pmul(a, b) {
    const p = Array.from({ length: 5 }, () => R(0));
    a.forEach((v, i) => b.forEach((w, j) => { p[i + j] = add(p[i + j], mul(v, w)); }));
    if (p[3].n || p[4].n) throw Error('中间式最高只能为二次');
    return p.slice(0, 3);
  }
  function parser(ts) {
    let i = 0, depth = 0;
    function atom() {
      if (++depth > 16) throw Error('括号过深');
      let p;
      const t = ts[i++];
      if (t === '(') { p = expr(); if (ts[i++] !== ')') throw Error('括号不配对'); }
      else if (t === 'x') p = [R(0), R(1), R(0)];
      else if (t && /^\d/.test(t)) p = [decimal(t), R(0), R(0)];
      else throw Error('此处需要数字、x 或括号');
      depth--; return p;
    }
    function power() {
      let p = atom();
      if (ts[i] === '^') { i++; if (ts[i++] !== '2') throw Error('只支持 ^2'); p = pmul(p, p); }
      return p;
    }
    function unary() {
      if (ts[i] === '+' || ts[i] === '-') { const sign = ts[i++]; const p = power(); return sign === '-' ? pneg(p) : p; }
      return power();
    }
    function term() {
      let p = unary();
      while (true) {
        const t = ts[i], prev = ts[i - 1];
        const implicit = (t === 'x' && (prev === ')' || /^\d/.test(prev || ''))) ||
          (t === '(' && (prev === ')' || prev === 'x' || /^\d/.test(prev || '')));
        if (t !== '*' && t !== '/' && !implicit) break;
        if (!implicit) i++;
        const q = unary();
        if (t === '/') {
          if (q[1].n || q[2].n || !q[0].n) throw Error('只能除以非零常数');
          p = p.map(v => div(v, q[0]));
        } else p = pmul(p, q);
      }
      return p;
    }
    function expr() {
      let p = term();
      while (ts[i] === '+' || ts[i] === '-') { const sign = ts[i++]; const q = term(); p = padd(p, sign === '+' ? q : pneg(q)); }
      return p;
    }
    return { read() { const p = expr(); if (i !== ts.length) throw Error('有多余词元；数字之间不能用空白拼接'); return p; } };
  }
  function equation(s) {
    const ts = tokens(s), k = ts.indexOf('=');
    if (k < 1 || k === ts.length - 1 || ts.lastIndexOf('=') !== k) throw Error('方程须恰有一个等号，左右都要填写');
    return padd(parser(ts.slice(0, k)).read(), pneg(parser(ts.slice(k + 1)).read()));
  }
  function number(s) {
    if (typeof s !== 'string' || s.length > 60 || !/^[ \t\r\n]*[+-]?\d{1,6}(?:\.\d{1,6})?(?:[ \t\r\n]*\/[ \t\r\n]*[+-]?\d{1,6}(?:\.\d{1,6})?)?[ \t\r\n]*$/.test(s)) {
      throw Error('请填普通十进制或一个分数；不支持百分号、指数、根号或拼接数字');
    }
    const part = t => { t = t.trim(); const sign = t[0] === '-' ? -1n : 1n; return mul(rat(sign), decimal(t.replace(/^[+-]/, ''))); };
    const p = s.trim().split('/'); return p.length === 1 ? part(p[0]) : div(part(p[0]), part(p[1]));
  }
  function proportional(p, q) {
    const k = q.findIndex(v => v.n);
    if (k < 0 || !p[k].n) return false;
    return p.every((v, i) => equal(mul(v, q[k]), mul(q[i], p[k])));
  }
  function frame(L, W, S) {
    if (cmp(L, R(0)) <= 0 || cmp(W, R(0)) <= 0 || cmp(S, R(0)) <= 0 || cmp(S, mul(L, W)) >= 0) throw Error('本模型要求长宽为正，照片面积严格介于零与外框面积之间');
    return [sub(mul(L, W), S), mul(R(-2), add(L, W)), R(4)];
  }
  function frameCheck(model, a, b, kept) {
    const expected = frame(R(18), R(12), R(112));
    if (!proportional(equation(model), expected)) throw Error('方程尚未与题意相符。检查两侧边框、长宽与面积单位；恒等式或退化的一次式不能代替模型');
    const roots = [number(a), number(b)];
    const value = x => expected.reduce((s, c, i) => add(s, mul(c, i === 2 ? mul(x, x) : i === 1 ? x : R(1))), R(0));
    if (equal(roots[0], roots[1]) || roots.some(x => value(x).n)) throw Error('请给出两个不同的数学根，并逐一代回你列的原方程');
    const x = number(kept);
    if (!roots.some(r => equal(r, x)) || cmp(x, R(0)) <= 0 || cmp(mul(R(2), x), R(12)) >= 0) throw Error('实际取值还需核对：边框有宽度，照片的长、宽均须为正；正根也可能超出几何上限');
    return true;
  }
  const evaluate = x => sub(add(mul(x, x), mul(R(2), x)), R(10));
  function tableEntry(branch, xText, yText) {
    if (!['positive', 'negative'].includes(branch)) throw Error('请先选研究区间');
    const x = number(xText), y = number(yText);
    const lo = R(branch === 'positive' ? 2 : -5), hi = R(branch === 'positive' ? 3 : -4);
    if (cmp(x, lo) < 0 || cmp(x, hi) > 0) throw Error('本表只研究所选的闭区间，请在范围内取值');
    if (!equal(evaluate(x), y)) throw Error('代入值不符。先算平方，再加两倍取值，最后减10；负数平方别漏括号');
    return { x, y };
  }
  function bracket(rows) {
    const sorted = [...rows].sort((a, b) => cmp(a.x, b.x));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].y.n * sorted[i].y.n < 0n) return { lo: sorted[i - 1].x, hi: sorted[i].x, width: sub(sorted[i].x, sorted[i - 1].x) };
    }
    return null;
  }
  function format(r) {
    let d = r.d, twos = 0, fives = 0;
    while (d % 2n === 0n) { d /= 2n; twos++; }
    while (d % 5n === 0n) { d /= 5n; fives++; }
    const digits = Math.max(twos, fives);
    if (d !== 1n || digits > 12) return `${r.n}/${r.d}`;
    const n = abs(r.n) * (10n ** BigInt(digits) / r.d), s = n.toString().padStart(digits + 1, '0');
    return (r.n < 0n ? '-' : '') + (digits ? (s.slice(0, -digits) + '.' + s.slice(-digits)).replace(/0+$/, '').replace(/\.$/, '') : s);
  }
  function rounded(r) {
    const n = (2n * abs(r.n) * 100n + r.d) / (2n * r.d);
    const s = n.toString().padStart(3, '0'); return (r.n < 0n && n ? '-' : '') + s.slice(0, -2) + '.' + s.slice(-2);
  }
  function goldenCheck(s) {
    const x = number(s);
    if (cmp(x, number('1/2')) <= 0 || cmp(x, R(1)) >= 0) throw Error('按较长段的定义与线段内部位置核查比例范围；不能只因满足代数式就保留负长度');
    const residual = sub(mul(x, x), sub(R(1), x));
    if (cmp(absRat(residual), number('0.00001')) > 0) throw Error('代入后两边差距尚大。继续核查正根与近似精度');
    return residual;
  }
  function absRat(r) { return rat(abs(r.n), r.d); }
  const api = { number, equation, frame, frameCheck, tableEntry, bracket, goldenCheck, evaluate, proportional, format, rounded, R, add, sub, mul, cmp };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  function mount() {
    const root = document.getElementById('j25-workshop');
    if (!root || document.body.dataset.sec !== 'j25-3' || root.dataset.ready) return;
    root.dataset.ready = 'true';
    const $ = id => root.querySelector('#' + id);
    function say(id, text, state = '') { const el = $(id); el.textContent = text; el.dataset.state = state; }
    function clearReview(kind) {
      $(kind + '-standard').hidden = true;
      $(kind + '-review').querySelectorAll('input[type=checkbox]').forEach(el => { el.checked = false; });
      say(kind + '-review-note', '');
    }
    for (const kind of ['model', 'gold']) {
      const form = $(kind + '-form');
      form.addEventListener('submit', event => {
        event.preventDefault();
        try {
          if (kind === 'model') frameCheck($('model-equation').value, $('model-root-a').value, $('model-root-b').value, $('model-kept').value);
          else goldenCheck($('gold-number').value);
          say(kind + '-feedback', kind === 'model' ? '式子与有限数值核对相符。完整设列解验答及单位仍须按准则自核；未自动认证文字推理。' : '此近似数满足范围且代入残差的绝对值不超过0.00001；这不是精确等式或一般证明，仍须核查根式推导与比例解释。', 'numeric');
        } catch (e) { say(kind + '-feedback', e.message, 'retry'); }
      });
      form.addEventListener('input', () => { say(kind + '-feedback', ''); clearReview(kind); });
      $(kind + '-show').addEventListener('click', () => {
        const filled = [...form.querySelectorAll('textarea')].every(el => el.value.trim());
        if (!filled) { say(kind + '-review-note', '先在每一步写下自己的尝试，再打开核对标准。文字仅作自报，不自动判对。'); return; }
        $(kind + '-standard').hidden = false;
        say(kind + '-review-note', '已展开核对标准。勾选是你的自评记录，仅本次页面保留；未自动认证作答正确。', 'self');
      });
      $(kind + '-review').addEventListener('change', () => {
        const checks = [...$(kind + '-review').querySelectorAll('input[type=checkbox]')];
        say(kind + '-review-note', `已自报核查 ${checks.filter(el => el.checked).length}/${checks.length} 项；不是机器判分。修改作答将清除本次自评。`, 'self');
      });
      $(kind + '-reset').addEventListener('click', () => { form.reset(); say(kind + '-feedback', ''); clearReview(kind); });
    }
    let rows = [];
    function drawTable() {
      const body = $('estimate-rows'); body.replaceChildren();
      [...rows].sort((a, b) => cmp(a.x, b.x)).forEach(r => {
        const tr = document.createElement('tr');
        [format(r.x), format(r.y), r.y.n < 0n ? '负' : r.y.n > 0n ? '正' : '零'].forEach(text => { const td = document.createElement('td'); td.textContent = text; tr.appendChild(td); });
        body.appendChild(tr);
      });
      const bounds = bracket(rows);
      if (!bounds) { say('estimate-bounds', rows.length ? '还需另一侧的代入值，才能定位两端。' : ''); return; }
      const a = rounded(bounds.lo), b = rounded(bounds.hi);
      say('estimate-bounds', `由平方大小比较，所研究的根大于 ${format(bounds.lo)}、小于 ${format(bounds.hi)}；区间宽 ${format(bounds.width)}。` +
        (a === b ? ` 两端四舍五入到百分位均为 ${a}，可报告此根约为 ${a}，不是精确根。` : ' 两端四舍五入到百分位尚不同；区间窄也不能直接声称某个百分位近似数，继续细分。'));
    }
    $('estimate-form').addEventListener('submit', event => {
      event.preventDefault();
      try {
        const row = tableEntry($('estimate-branch').value, $('estimate-x').value, $('estimate-y').value);
        if (rows.some(r => equal(r.x, row.x))) throw Error('此取值已在表中；请选一个新的值');
        if (rows.length >= 32) throw Error('已达32行；可清表后选更精细的一组取值');
        rows.push(row); drawTable();
        say('estimate-feedback', '这一个代入值核对相符，已加入表格；有限行数不代替一般说明。', 'numeric');
      } catch (e) { say('estimate-feedback', e.message, 'retry'); }
    });
    $('estimate-form').addEventListener('input', () => say('estimate-feedback', ''));
    function resetTable() { rows = []; drawTable(); say('estimate-feedback', ''); $('estimate-x').value = ''; $('estimate-y').value = ''; $('estimate-why').value = ''; }
    $('estimate-branch').addEventListener('change', resetTable);
    $('estimate-reset').addEventListener('click', () => { $('estimate-form').reset(); resetTable(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
