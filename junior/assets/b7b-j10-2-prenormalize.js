// j10-2 only: finite exact worksheets; no expression execution or ledger.
(function () {
  'use strict';
  const root = document.getElementById('pn-work');
  if (!root || document.body.dataset.sec !== 'j10-2') return;
  // Each row stores the raw left-side affine coefficients and right-side value.
  const tasks = [
    { title: 'A：括号与两个数字分母', text: ['(x + 2y)/3 − (x − y)/2 = 1', '2(x − y) + 3(y + 1) = 9'],
      rows: [[[-1, 6], [7, 6], [0], [1]], [[2], [1], [3], [9]]], multiples: [6, 1] },
    { title: 'B：减去整个括号', text: ['2(x − 1) − (y + 3)/2 = 2', '(x + y)/3 + (x − 2y)/2 = 11/3'],
      rows: [[[2], [-1, 2], [-7, 2], [2]], [[5, 6], [-2, 3], [0], [11, 3]]], multiples: [2, 6] },
    { title: 'C：右边也有数字分母', text: ['3(x − y) + (x + y)/2 = −5', '(2x − y)/4 − (x + y)/3 = −7/6'],
      rows: [[[7, 2], [-5, 2], [0], [-5]], [[1, 6], [-7, 12], [0], [-7, 6]]], multiples: [2, 12] }
  ];
  const fail = (text, state = 'retry') => { throw { text, state }; };
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; }
  function Q(n, d = 1n) { if (!d) fail('分母不能为零。'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; }
  const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const neg = a => [-a[0], a[1]], sub = (a, b) => add(a, neg(b));
  const mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1], zero = a => a[0] === 0n;
  const integer = a => a[1] === 1n, from = a => Q(BigInt(a[0]), BigInt(a[1] || 1));
  const print = a => a[1] === 1n ? String(a[0]) : a[0] + '/' + a[1];
  const $ = id => document.getElementById('pn-' + id);
  root.innerHTML = `<style>
    #pn-work{overflow-wrap:anywhere}#pn-work label{display:inline-flex;flex-direction:column;gap:4px;margin:6px 8px 6px 0;max-width:100%}
    #pn-work input,#pn-work select,#pn-work textarea{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--muted);border-radius:5px;padding:7px;max-width:100%;box-sizing:border-box}
    #pn-work input{width:6em}#pn-work textarea{width:100%;min-height:75px}#pn-work .pn-writing{display:block}
    #pn-work fieldset{min-width:0;border:1px solid var(--line);padding:10px;margin:12px 0}#pn-work legend{font-weight:700}
    #pn-work .pn-row{display:flex;flex-wrap:wrap;align-items:end}#pn-work :focus-visible{outline:3px solid var(--a);outline-offset:2px}
    #pn-work [hidden]{display:none!important}#pn-work fieldset:disabled{opacity:.65}
  </style>
  <h3>先整理原组，再比较两种消元法</h3>
  <p>原式含括号或数字分母时，先去分母、去括号、移项合并，再选消元路线。先完成一种方法，再换另一种方法，最后比较；不必照同一顺序消元。</p>
  <label>原创原组<select id="pn-task"></select></label> <button type="button" class="btn ghost" id="pn-reset">清空本题全部过程</button>
  <p id="pn-original"></p>
  <p class="small">数值格收精确整数、有限小数或简单分数 a/b（分子、分母可为小数，分母非零）。每格至多40个数字、100字符；可用全角数字与负号“−”，首尾和分数线两侧可留空格，数字内部不留空格。算式、字母、指数、上下标等写法暂未核对，请先算成数。分母仅为已知数字，不用字母作分母。</p>
  <form id="pn-normal" novalidate><fieldset><legend>① 自己整理两式</legend>
  <p>本表先选原式所列数字分母的公倍数：每式左右两边的每一项同乘一个1—60的正整数。再去括号、把字母项放左边、常数放右边，填 a·x+b·y=c。没有数字分母也要填乘数；不在此步另约掉所选乘数。其它合法整理路线可在纸上保留，本表暂未核对。</p>
  <div id="pn-normal-rows"></div>
  <label class="pn-writing">我的整理依据：每项怎样倍乘？括号前负号、常数和移项怎样处理？<textarea id="pn-normal-note"></textarea></label>
  <button class="btn" type="submit">核对整理，再选路线</button></fieldset><p id="pn-normal-result" role="status"></p></form>
  <form id="pn-route" novalidate><fieldset id="pn-route-lock" disabled><legend>② 自选方法与先消去的字母</legend>
  <label>方法<select id="pn-method"><option value="">请选择</option><option value="sub">代入消元</option><option value="add">加减消元</option></select></label>
  <label>先消去<select id="pn-remove"><option value="">请选择</option><option value="0">x</option><option value="1">y</option></select></label>
  <div id="pn-sub" hidden></div><div id="pn-add" hidden></div>
  <button class="btn" type="submit">核对这条消元等式</button></fieldset><p id="pn-route-result" role="status"></p></form>
  <form id="pn-solution" novalidate><fieldset id="pn-solution-lock" disabled><legend>③ 解出、回代，检验两个原式</legend>
  <div id="pn-solution-fields"></div><button class="btn" type="submit">核对本条路线与原式检验</button>
  </fieldset><p id="pn-solution-result" role="status"></p></form>
  <p>本题已核的数值路线（不自动评价文字）：</p><ul id="pn-history"></ul>
  <form id="pn-comparison" novalidate><fieldset id="pn-comparison-lock" disabled><legend>④ 两种方法都做过后，比较与回看</legend>
  <label class="pn-writing">比较两法：各从哪式开始、先消哪个字母、用了哪些倍数或分母？哪一步较省计算，理由是什么？<textarea id="pn-compare-note"></textarea></label>
  <button class="btn" type="submit">保存文字并打开自核准则</button></fieldset><p id="pn-comparison-result" role="status"></p>
  <div id="pn-guide" hidden>自核：整理前后是否每项都受同一个非零乘数作用？两法怎样把两个未知数化为一个？表示一个未知数时是否代入了另一个方程？选较小系数或容易配成相等/相反系数是否减少计算？比较应引用你两次的实际步骤，而非只写方法名。回代后两个值是否使两个原式各自左右相等？自由文字尚未判定正确，可按准则修改；网页不确认纸笔过程已发生。</div></form>`;
  const choices = [['0', '①'], ['1', '②']];
  function fields(parent, items) {
    const line = document.createElement('div'); line.className = 'pn-row'; $(parent).appendChild(line);
    items.forEach(([id, text, options]) => {
      const label = document.createElement('label'), span = document.createElement('span'); span.textContent = text;
      const input = document.createElement(options ? 'select' : 'input'); input.id = 'pn-' + id;
      if (options) [['', '请选择'], ...options].forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; input.appendChild(o); });
      else { input.inputMode = 'decimal'; input.autocomplete = 'off'; }
      label.append(span, input); line.appendChild(label);
    });
  }
  [0, 1].forEach(i => fields('normal-rows', [[`r${i}`, `原${i ? '②' : '①'}乘数`], [`a${i}`, 'a'], [`b${i}`, 'b'], [`c${i}`, 'c']]));
  const sentence = document.createElement('p'); sentence.id = 'pn-sub-line'; $('sub').appendChild(sentence);
  fields('sub', [['source', '由整理后哪式表示', choices], ['target', '代入整理后哪式', choices], ['p', '分子系数 p'], ['q', '分子常数 q'], ['r', '整个分母 r'], ['k', '代入后两边同乘 k'], ['sa', '整理后 A'], ['sb', '整理后 B'], ['sc', '整理后 C']]);
  const addLine = document.createElement('p'); addLine.id = 'pn-add-line'; $('add').appendChild(addLine);
  fields('add', [['m', '整理后①乘 m'], ['n', '整理后②乘 n'], ['op', '两个新式的运算', [['1', '新①＋新②'], ['-1', '新①−新②']]], ['ea', '消元后 A'], ['ec', '消元后 C']]);
  fields('solution-fields', [['first', '先求得的值'], ['back', '回代整理后哪式', choices], ['u', '剩余字母系数 U'], ['v', '已知项 V'], ['w', '右边 W'], ['second', '回代求得的值']]);
  const help = document.createElement('p'); help.textContent = '回代栏按 U·剩余字母+V=W 填，V是先求得的值代入该项后的数，不在这一栏移项或倍乘。最后分别计算两个未经整理的原式左边。'; $('solution-fields').appendChild(help);
  fields('solution-fields', [['left0', '原①左边算得'], ['left1', '原②左边算得']]);
  tasks.forEach((t, i) => { const option = document.createElement('option'); option.value = i; option.textContent = t.title; $('task').appendChild(option); });
  let normalized = null, route = null; const completed = new Map();
  function message(stage, text = '', state = '') { const e = $(stage + '-result'); e.textContent = text; if (state) e.dataset.state = state; else delete e.dataset.state; }
  function clearForm(id) { $(id).querySelectorAll('input,select,textarea').forEach(e => { e.value = ''; }); message(id); }
  function history() {
    $('history').replaceChildren(); completed.forEach(v => { const li = document.createElement('li'); li.textContent = v.summary; $('history').appendChild(li); });
    $('comparison-lock').disabled = new Set([...completed.values()].map(v => v.method)).size < 2;
  }
  function invalidateNormal() { normalized = route = null; completed.clear(); message('normal'); clearForm('route'); clearForm('solution'); clearForm('comparison'); $('route-lock').disabled = $('solution-lock').disabled = true; $('sub').hidden = $('add').hidden = $('guide').hidden = true; history(); }
  function reset() { clearForm('normal'); invalidateNormal(); const t = tasks[Number($('task').value)]; $('original').textContent = '原①：' + t.text[0] + '；原②：' + t.text[1]; }
  function number(id) {
    let raw = $(id).value.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/−/g, '-').trim();
    if (!raw || raw.length > 100 || (raw.match(/\d/g) || []).length > 40) fail('暂未核对：请填数值，每格至多40个数字、100字符。', 'unsupported');
    const parts = raw.split('/').map(x => x.trim());
    if (parts.length > 2 || !parts.every(x => /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x))) fail('暂未核对这种写法：请填精确数值；算式、字母、上下标和数字内部空格不在本表格式内。', 'unsupported');
    const decimal = x => Q(BigInt(x.replace('.', '')), 10n ** BigInt((x.split('.')[1] || '').length));
    const a = decimal(parts[0]), b = parts.length === 1 ? Q(1n) : decimal(parts[1]);
    if (zero(b)) fail('分母不能为零，请修改。'); return div(a, b);
  }
  function choice(id, values) { const v = $(id).value; if (!values.includes(v)) fail('暂未核对：请先选择方法、字母、原式或运算。', 'unsupported'); return v; }
  function expect(id, value, text) { const actual = number(id); if (!same(actual, value)) fail(text); return actual; }
  function attempt(stage, fn) { try { fn(); } catch (e) { if (!e.text) throw e; message(stage, e.text, e.state); } }
  function labels() {
    const s = $('remove').value === '0' ? 'x' : 'y', t = s === 'x' ? 'y' : 'x';
    $('sub-line').textContent = s + '=(p·' + t + '+q)/r；整体代入另一式，再同乘非零k，填A·' + t + '+B=C。本栏A、B、C须为整数，不另移常数。';
    $('add-line').textContent = '每式左右每一项都乘所选非零数，再整体加减；消去' + s + '后，自己填A·' + t + '=C。';
    [['first', '先求得 ' + t], ['second', '回代求得 ' + s], ['u', s + ' 的系数 U']].forEach(([id, text]) => { $(id).previousElementSibling.textContent = text; });
    $('sub').hidden = $('method').value !== 'sub'; $('add').hidden = $('method').value !== 'add';
  }
  $('normal').addEventListener('input', invalidateNormal);
  $('normal').addEventListener('submit', e => { e.preventDefault(); attempt('normal', () => {
    invalidateNormal(); const task = tasks[Number($('task').value)], result = [];
    if (!$('normal-note').value.trim()) fail('请先写下自己的整理依据；文字留作准则自核。', 'unsupported');
    task.rows.forEach((row, i) => {
      const r = number('r' + i); if (zero(r)) fail('同乘零会丢失原方程的信息，请选非零乘数。');
      if (!integer(r) || r[0] < 1n || r[0] > 60n || r[0] % BigInt(task.multiples[i])) fail('暂未按这条路线核对：本表先用1—60正整数、且为原式所列数字分母的公倍数，再整理。其它合法约分或倍乘路线可留纸笔。', 'unsupported');
      const q = row.map(from), wanted = [mul(r, q[0]), mul(r, q[1]), mul(r, sub(q[3], q[2]))];
      result.push(['a', 'b', 'c'].map((key, k) => expect(key + i, wanted[k], '原' + (i ? '②' : '①') + '整理尚不符所填乘数；检查括号前符号、每一项及右边常数是否都倍乘。')));
    });
    normalized = result; $('route-lock').disabled = false; message('normal', '两式整理数值与所填乘数一致。依据文字未自动判分；请自查每项倍乘、去括号和移项，再选消元路线。', 'matched');
  }); });
  $('route').addEventListener('input', e => {
    route = null; message('route'); clearForm('solution'); $('solution-lock').disabled = true; message('comparison'); $('guide').hidden = true;
    if (['pn-method', 'pn-remove'].includes(e.target.id)) { $('route').querySelectorAll('input,select').forEach(x => { if (!['pn-method', 'pn-remove'].includes(x.id)) x.value = ''; }); labels(); }
  });
  $('route').addEventListener('submit', e => { e.preventDefault(); attempt('route', () => {
    route = null; message('route'); $('solution-lock').disabled = true; if (!normalized) fail('先核对两原式的整理。', 'unsupported');
    const method = choice('method', ['sub', 'add']), s = Number(choice('remove', ['0', '1'])), t = 1 - s; let A, B = Q(0n), C, work;
    if (method === 'add') {
      const m = number('m'), n = number('n'), op = from([Number(choice('op', ['1', '-1']))]);
      if (zero(m) || zero(n)) fail('两式倍乘都须非零；乘零不能保留原方程。');
      const line = normalized[0].map((v, i) => add(mul(m, v), mul(op, mul(n, normalized[1][i]))));
      if (!zero(line[s])) fail('所选倍数与加减还没有消去该字母；检查同号相减、异号相加。');
      A = expect('ea', line[t], '消元后系数尚不符，检查两个新式的每一项整体加减。'); C = expect('ec', line[2], '右边也要按所选倍数和运算整体加减。');
      work = '整理①×(' + print(m) + ')' + (op[0] === 1n ? '＋' : '−') + '整理②×(' + print(n) + ')';
    } else {
      const source = Number(choice('source', ['0', '1'])), target = Number(choice('target', ['0', '1']));
      if (source === target) fail('由一式变形后要代入另一式，不能代回自身。');
      const p = number('p'), q = number('q'), r = number('r'), k = number('k'), a = normalized[source], b = normalized[target];
      if (zero(r) || zero(k)) fail('整个分母r和去分母乘数k都不能为零。');
      if (!same(mul(a[s], p), neg(mul(a[t], r))) || !same(mul(a[s], q), mul(a[2], r))) fail('表示未知数的分子或整个分母尚不符；检查移项、同除及括号。');
      const wanted = [mul(k, add(div(mul(b[s], p), r), b[t])), mul(k, div(mul(b[s], q), r)), mul(k, b[2])];
      if (!wanted.every(integer)) fail('暂未按本栏格式核对：请选择能让A、B、C均为整数的非零k。', 'unsupported');
      [A, B, C] = ['sa', 'sb', 'sc'].map((id, i) => expect(id, wanted[i], '整体代入后尚不符；分子加括号，去分母须乘左右每项，本栏先不移常数。'));
      work = '由整理' + (source ? '②' : '①') + '得' + ['x', 'y'][s] + '=((' + print(p) + ')·' + ['x', 'y'][t] + '+(' + print(q) + '))/(' + print(r) + ')，代入另一式后同乘' + print(k);
    }
    if (zero(A)) fail('本栏需得到含一个未知数的一元一次方程，请重查消元过程。');
    route = { method, s, t, A, B, C, work }; $('solution-lock').disabled = false; message('route', '这条消元等式数值匹配；自己解出一个值，再回代、检验两个未经整理的原式。', 'matched');
  }); });
  $('solution').addEventListener('input', () => { message('solution'); message('comparison'); $('guide').hidden = true; });
  $('solution').addEventListener('submit', e => { e.preventDefault(); attempt('solution', () => {
    if (!route) fail('先核对当前消元等式。', 'unsupported'); const r = route, first = number('first');
    if (!same(add(mul(r.A, first), r.B), r.C)) fail('先求得的值还不满足刚写出的一元一次方程。');
    const b = normalized[Number(choice('back', ['0', '1']))], U = expect('u', b[r.s], '回代的未知项系数不符。'), V = expect('v', mul(b[r.t], first), '已知项V应把先求得的值代入该项后算出。'), W = expect('w', b[2], '本栏右边W先保留该整理式的常数。'), second = number('second');
    if (!same(add(mul(U, second), V), W)) fail('回代求得的另一个值尚不满足这条回代等式。');
    const values = []; values[r.t] = first; values[r.s] = second;
    tasks[Number($('task').value)].rows.forEach((row, i) => {
      const q = row.map(from), lhs = add(add(mul(q[0], values[0]), mul(q[1], values[1])), q[2]);
      expect('left' + i, lhs, '原' + (i ? '②' : '①') + '左值尚不符；代入未经整理的整条原式计算。'); if (!same(lhs, q[3])) fail('两个值尚不能同时使两原式左右相等。');
    });
    const summary = (r.method === 'sub' ? '代入' : '加减') + '法先消' + ['x', 'y'][r.s] + '：' + r.work + '；得到(' + print(r.A) + ')·' + ['x', 'y'][r.t] + '+(' + print(r.B) + ')=' + print(r.C) + '，先求得' + print(first) + '；回代' + print(U) + '·' + ['x', 'y'][r.s] + '+(' + print(V) + ')=' + print(W) + '，再得' + print(second) + '；原①/②左值分别为' + print(number('left0')) + '、' + print(number('left1')) + '。本条数值已核，文字未判定。';
    completed.set(r.method + r.s, { method: r.method, s: r.s, summary }); history(); message('solution', '本条数值路线、回代和两原式左值匹配。可换另一种方法再做；两法都完成后写比较，文字仍须自核。', 'matched');
  }); });
  $('comparison').addEventListener('input', () => { message('comparison'); $('guide').hidden = true; });
  $('comparison').addEventListener('submit', e => { e.preventDefault(); attempt('comparison', () => {
    if (new Set([...completed.values()].map(v => v.method)).size < 2) fail('请先完成两种方法各一条已核数值路线。', 'unsupported');
    if (!$('compare-note').value.trim()) fail('先引用自己两次的具体步骤写比较，再打开准则。', 'unsupported');
    $('guide').hidden = false; message('comparison', '比较文字已保留，尚未判定正确。请逐条自核并修改；不认证线下活动已完成。', 'recorded');
  }); });
  $('task').addEventListener('change', reset); $('reset').addEventListener('click', reset); reset(); labels();
})();
