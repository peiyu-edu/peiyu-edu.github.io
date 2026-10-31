/* Page-private activity. No shared learning-state API or global registration. */
(function () {
  'use strict';
  const root = document.getElementById('b8b-j22-2-self-graph-story-dev');
  if (!root || !document.body || document.body.dataset.sec !== 'j22-2' || root.dataset.ready) return;
  root.dataset.ready = '1';
  const $ = id => root.querySelector('#sg-' + id);
  const NS = 'http://www.w3.org/2000/svg';
  const cases = {
    area: { given: '正方形边长s（cm）连续变化，面积S（cm²）满足S=s²，0<s≤3。这里的关系由正方形面积公式给定，不由有限表猜定。', vars: ['边长s', '面积S'], symbols: ['s', 'S'], units: ['cm', 'cm²'], range: '0<x≤3', kind: 'continuous', lo: 0, hi: 3, left: 'open', right: 'closed', join: 'smooth' },
    mass: { given: '理想称重计价模型：质量m（kg）可在0至4之间连续取值，单价2元/kg，价款p（元）按p=2m计算；两端都可取。中间质量也按同一单价计算是题意给定的。', vars: ['质量m', '价款p'], symbols: ['m', 'p'], units: ['kg', '元'], range: '0≤x≤4', kind: 'continuous', lo: 0, hi: 4, left: 'closed', right: 'closed', join: 'straight' },
    count: { given: '整件物品每件2元，买n件付p元，只能买1、2、3、4件。n是自变量，单位件；p是因变量，单位元。没有买1.5件的情形。', vars: ['件数n', '价款p'], symbols: ['n', 'p'], units: ['件', '元'], range: '{1,2,3,4}', kind: 'discrete', lo: 1, hi: 4, left: 'closed', right: 'closed', join: 'none' },
    sample: { given: '仅有观测：时间t（分）=0、1、2、3、4时，液体量q（L）分别为0、2、4、6、8。这里只知道这些时刻的读数，没有给时刻之间的变化规律，不能据表推定真实连线。', vars: ['观测时间t', '液体量q'], symbols: ['t', 'q'], units: ['分', 'L'], range: '仅已观测{0,1,2,3,4}', kind: 'observed', lo: 0, hi: 4, left: 'closed', right: 'closed', join: 'none' }
  };
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) { const t = a % b; a = b; b = t; } return a || 1n; }
  function rat(n, d = 1n) { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; }
  function read(value) {
    const s = value.trim();
    if (!/^[+-]?(?:\d+(?:\.\d{1,3})?|\.\d{1,3}|\d+\/\d+)$/.test(s)) return null;
    let n, d = 1n;
    if (s.includes('/')) { const p = s.split('/'); n = BigInt(p[0]); d = BigInt(p[1]); if (d < 1n || d > 1000n) return null; }
    else { const p = s.split('.'); d = 10n ** BigInt((p[1] || '').length); n = BigInt(p[0] + (p[1] || '')); }
    return n > 10000n || n < -10000n ? null : rat(n, d);
  }
  const same = (a, b) => !!a && !!b && a.n * b.d === b.n * a.d;
  const number = a => Number(a.n) / Number(a.d);
  const fmt = a => String(a.n) + (a.d === 1n ? '' : '/' + a.d);
  const relation = x => key === 'area' ? rat(x.n * x.n, x.d * x.d) : rat(2n * x.n, x.d);
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('\"', '&quot;');
  const options = values => '<option value="">自行选择</option>' + values.map(([v, label]) => '<option value="' + escape(v) + '">' + escape(label) + '</option>').join('');
  let key = '', info = null, declared = false, table = null, dots = [], pointsOK = false, stroke = [], ends = {}, cursor = null, armed = false, dragging = false, trace = [];
  function message(text, state = 'notice') { $('feedback').textContent = text; $('feedback').dataset.state = state; }
  function clearFeedback() { message(''); }
  function log(text) { trace.push(text); const li = document.createElement('li'); li.textContent = text; $('trace').append(li); }
  function clearGeometry() { table = null; dots = []; pointsOK = false; stroke = []; ends = {}; armed = dragging = false; clearFeedback(); draw(); }
  function rowChoices() { $('row').replaceChildren(new Option('自行选择', ''), ...Array.from($('table').children, (_, i) => new Option('第' + (i + 1) + '行', String(i)))); }
  function addRow() {
    const i = $('table').children.length, row = document.createElement('div'); row.className = 'sg-controls';
    row.innerHTML = '<b>第' + (i + 1) + '行</b><label>x<input data-sg-x inputmode="decimal"></label><label>我算/读的y<input data-sg-y inputmode="decimal"></label>';
    $('table').append(row); rowChoices();
  }
  function reset() {
    key = $('task').value; info = cases[key] || null; declared = false; table = null; dots = []; pointsOK = false; stroke = []; ends = {}; cursor = null; armed = dragging = false; trace = [];
    $('trace').replaceChildren(); $('table').replaceChildren(); for (let i = 0; i < 5; i++) addRow();
    ['px', 'py', 'note'].forEach(k => $(k).value = ''); ['join', 'end', 'kind'].forEach(k => $(k).value = '');
    $('given').textContent = info ? info.given : '先选关系任务。所有新增答案都由你填写。';
    const vars = info ? info.vars.map((v, i) => [String(i), v]) : [];
    $('declarations').innerHTML = [
      ['xvar', '横轴自变量', vars], ['yvar', '纵轴因变量', vars],
      ['xunit', '横轴单位', ['cm', 'cm²', 'kg', '元', '件', '分', 'L'].map(x => [x, x])],
      ['yunit', '纵轴单位', ['cm', 'cm²', 'kg', '元', '件', '分', 'L'].map(x => [x, x])],
      ['direction', '数值增大方向', [['right-up', '横向右、纵向上'], ['left-up', '横向左、纵向上'], ['right-down', '横向右、纵向下']]],
      ['range', '自变量取值范围', ['0<x≤3', '0≤x≤4', '{1,2,3,4}', '仅已观测{0,1,2,3,4}'].map(x => [x, x])],
      ['domain-kind', '点间信息', [['continuous', '按给定关系连续取值'], ['discrete', '只能取给定整数'], ['observed', '只有有限观测，点间未知']]],
      ['left', '左边界能否取到', [['open', '不能'], ['closed', '能']]], ['right', '右边界能否取到', [['open', '不能'], ['closed', '能']]]
    ].map(([id, label, values]) => '<label>' + label + '<select id="sg-' + id + '">' + options(values) + '</select></label>').join('');
    clearFeedback(); draw();
  }
  $('declare').onclick = () => {
    clearFeedback(); declared = !!info && $('xvar').value === '0' && $('yvar').value === '1' && $('xunit').value === info.units[0] && $('yunit').value === info.units[1] && $('direction').value === 'right-up' && $('range').value === info.range && $('domain-kind').value === info.kind && $('left').value === info.left && $('right').value === info.right;
    if (!declared) { clearGeometry(); message('轴、单位、方向、范围或端点声明需按题意复查。', 'error'); }
    else message('作图声明与题意一致；现在由你列表。', 'declared');
    draw();
  };
  $('declarations').addEventListener('change', () => { declared = false; clearGeometry(); });
  $('add-row').onclick = () => { if ($('table').children.length >= 8) { message('至多8行。'); return; } addRow(); clearGeometry(); };
  $('remove-row').onclick = () => { if ($('table').children.length <= 3) { message('至少3行。'); return; } $('table').lastElementChild.remove(); rowChoices(); clearGeometry(); };
  $('table').addEventListener('input', clearGeometry);
  $('table-check').onclick = () => {
    clearFeedback(); table = null; pointsOK = false; stroke = []; ends = {};
    if (!declared) { message('先完成作图声明。', 'error'); draw(); return; }
    const rows = [];
    for (const [i, row] of [...$('table').children].entries()) {
      const x = read(row.querySelector('[data-sg-x]').value), y = read(row.querySelector('[data-sg-y]').value);
      if (!x || !y) { message('第' + (i + 1) + '行数值语法不支持。', 'error'); draw(); return; }
      if (rows.some(p => same(p.x, x) && !same(p.y, y))) { message('同一横坐标出现两个不同纵坐标，不符合函数定义。', 'not-function'); draw(); return; }
      const xn = number(x), valid = xn >= info.lo && xn <= info.hi && !(info.left === 'open' && xn === info.lo) && (info.kind === 'continuous' ? (4n * x.n) % x.d === 0n : x.d === 1n);
      if (!valid) { message('第' + (i + 1) + '行x超出题意范围或本表采样规则。', 'error'); draw(); return; }
      if (!same(y, relation(x))) { message('第' + (i + 1) + '行计算/观测读数不符。', 'error'); draw(); return; }
      rows.push({ x, y });
    }
    const distinct = rows.filter((p, i) => rows.findIndex(q => same(p.x, q.x)) === i);
    const has = n => distinct.some(p => same(p.x, rat(BigInt(n))));
    if (info.kind === 'continuous' ? distinct.length < 3 || !has(info.hi) || (info.left === 'closed' && !has(info.lo)) : Array.from({ length: info.hi - info.lo + 1 }, (_, i) => i + info.lo).some(n => !has(n))) {
      message('还需不同取样点及能取到的边界；整数/观测任务要列全给定值。', 'error'); draw(); return;
    }
    table = rows; message('所列表值均符合给定信息；重复同一点不添新值。现在独立描点。', 'table'); log('核表' + rows.length + '行'); draw();
  };
  const X = x => 65 + x * 105, Y = y => 450 - y * 40;
  function node(svg, tag, attrs) { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); svg.append(n); return n; }
  function text(svg, x, y, value, size = 20) { const n = node(svg, 'text', { x, y, fill: 'var(--fg)', 'font-size': size, 'text-anchor': 'middle', 'data-figure-label-fixed': '1' }); n.textContent = value; }
  function draw() {
    const svg = $('fig'); svg.replaceChildren();
    for (let x = 0; x <= 4; x++) { node(svg, 'line', { x1: X(x), y1: Y(0), x2: X(x), y2: Y(10), stroke: 'var(--line)' }); text(svg, X(x), 480, String(x)); }
    for (let y = 0; y <= 10; y++) { node(svg, 'line', { x1: X(0), y1: Y(y), x2: X(4), y2: Y(y), stroke: 'var(--line)' }); if (y % 2 === 0) text(svg, 34, Y(y) + 7, String(y)); }
    node(svg, 'path', { d: 'M65 35V450H505', fill: 'none', stroke: 'var(--fg)', 'stroke-width': 2 });
    text(svg, 435, 515, declared ? info.symbols[0] + ' / ' + info.units[0] : 'x / 单位待声明');
    text(svg, 150, 28, declared ? info.symbols[1] + ' / ' + info.units[1] : 'y / 单位待声明');
    if (stroke.length) node(svg, 'path', { id: 'sg-stroke', d: stroke.map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), stroke: 'var(--a)', fill: 'none', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    dots.forEach((p, i) => { if (!p) return; const x = number(p.x), y = number(p.y); node(svg, 'circle', { cx: X(x), cy: Y(y), r: 5, fill: 'var(--no)', 'data-point': i, 'data-x': fmt(p.x), 'data-y': fmt(p.y) }); text(svg, X(x) + 12, Y(y) - 12, 'P' + (i + 1)); });
    Object.entries(ends).forEach(([side, p]) => node(svg, 'circle', { cx: X(number(p.x)), cy: Y(number(p.y)), r: 7, fill: p.kind === 'open' ? 'var(--card)' : 'var(--a)', stroke: 'var(--a)', 'stroke-width': 2, 'data-end': side, 'data-kind': p.kind }));
    if (cursor) node(svg, 'path', { d: 'M' + (X(cursor[0]) - 7) + ' ' + Y(cursor[1]) + 'h14m-7 -7v14', stroke: 'var(--b)', 'stroke-width': 2 });
    $('scale').textContent = '横轴每大格1、纵轴每大格1；窗口0≤x≤4、0≤y≤10。图上输入支持精确分数；游标每步x、y各1/4单位。';
  }
  $('plot').onclick = () => {
    clearFeedback(); pointsOK = false; stroke = []; ends = {}; armed = false;
    const i = $('row').value, x = read($('px').value), y = read($('py').value);
    if (!table || i === '' || !x || !y || number(x) < 0 || number(x) > 4 || number(y) < 0 || number(y) > 10) { message('先核表、选表行，再输入窗口内坐标落点。', 'error'); draw(); return; }
    dots[+i] = { x, y }; log('落P' + (+i + 1) + '=(' + fmt(x) + ',' + fmt(y) + ')'); message('按你的坐标落点，尚未核对与该行对应。'); draw();
  };
  $('points-check').onclick = () => {
    clearFeedback(); pointsOK = false;
    if (!table || table.some((p, i) => !dots[i] || !same(p.x, dots[i].x) || !same(p.y, dots[i].y))) { message('描点未与表逐项对应，检查横纵位置与刻度。', 'error'); return; }
    pointsOK = true; message('描点与表相符；接着自己决定能否连线并操作。', 'points');
  };
  function mayDraw() { if (!pointsOK || !info || info.kind !== 'continuous') { message('先核完描点；离散/仅观测任务不能据此连线。', 'error'); return false; } return true; }
  function pushPoint(p) { if (p[0] < 0 || p[0] > 4 || p[1] < 0 || p[1] > 10) { message('连线点须在窗口内。', 'error'); return; } const last = stroke.at(-1); if (!last || last[0] !== p[0] || last[1] !== p[1]) stroke.push(p.slice()); clearFeedback(); draw(); }
  $('start').onclick = () => { clearFeedback(); if (mayDraw()) { armed = true; log('开始亲自连线'); message('手描已开启，按住图格划线或逐次加入路径点；结束后核验。'); } };
  $('stop').onclick = () => { armed = dragging = false; clearFeedback(); log('结束手描（' + stroke.length + '个屏幕取样点）'); };
  $('vertex').onclick = () => { clearFeedback(); if (!mayDraw()) return; const x = read($('px').value), y = read($('py').value); if (!x || !y) { message('先填图上x/y。', 'error'); return; } pushPoint([number(x), number(y)]); log('加入连线点(' + fmt(x) + ',' + fmt(y) + ')'); };
  $('clear-stroke').onclick = () => { stroke = []; ends = {}; armed = dragging = false; clearFeedback(); draw(); };
  $('mark').onclick = () => {
    clearFeedback(); const side = $('end').value, kind = $('kind').value, x = read($('px').value), y = read($('py').value);
    if (!pointsOK || !info || info.kind !== 'continuous' || !side || !kind || !x || !y || number(x) < 0 || number(x) > 4 || number(y) < 0 || number(y) > 10) { message('连续任务核完描点后，填坐标并选边界/样式；离散点本身是实心。', 'error'); return; }
    ends[side] = { x, y, kind }; log('标记' + side + '端点(' + fmt(x) + ',' + fmt(y) + ') ' + kind); draw();
  };
  $('graph-check').onclick = () => {
    clearFeedback(); armed = dragging = false;
    if (!pointsOK) { message('先核完独立描点。', 'error'); return; }
    if ($('join').value !== info.join) { message('点间处理需按连续关系、整数或未知观测信息选择。', 'error'); return; }
    if (info.kind !== 'continuous') { if (stroke.length || Object.keys(ends).length) { message('此任务只保留给定孤立点，清掉推测连线/端点。', 'error'); return; } message('孤立点处理符合已知信息；不从有限观测推定点间真实规律。', 'discrete'); return; }
    if (stroke.length < 2) { message('尚无你的连线痕迹。', 'error'); return; }
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1], b = stroke[i];
      if (a[0] === b[0] && a[1] !== b[1]) { message('痕迹含同x异y的竖段，不表示y是x的函数。', 'not-function'); return; }
      if (b[0] < a[0]) { message('此处横向回描，未按x增大顺序；仅凭回描不能断言图不是函数，请清痕重画。', 'order'); return; }
    }
    if (info.join === 'smooth' && stroke.some((p, i) => i && p[0] - stroke[i - 1][0] > 0.5 + 1e-9)) { message('平滑手描请多取路径点，相邻横向间隔不超过1/2单位；不要只把稀疏表点直连。', 'approx-error'); return; }
    const first = stroke[0], last = stroke.at(-1);
    if (Math.abs(first[0] - info.lo) > 1e-9 || Math.abs(last[0] - info.hi) > 1e-9 || stroke.some(p => p[0] < info.lo || p[0] > info.hi)) { message('连线须覆盖题给范围的两边界，不向范围外延伸。', 'error'); return; }
    const boundaryY = x => key === 'area' ? x * x : 2 * x;
    if (Math.abs(first[1] - boundaryY(info.lo)) > 1e-8 || Math.abs(last[1] - boundaryY(info.hi)) > 1e-8) { message('连线两端须接到边界坐标；可先标端点，再手描吸附或输入路径端点。', 'error'); return; }
    for (const p of dots.filter(Boolean)) {
      const x = number(p.x), y = number(p.y);
      const hit = stroke.some(q => Math.abs(q[0] - x) < 1e-8 && Math.abs(q[1] - y) < 1e-8) || stroke.some((b, i) => { if (!i) return false; const a = stroke[i - 1]; return a[0] < b[0] && x >= a[0] && x <= b[0] && Math.abs(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]) - y) < 1e-8; });
      if (!hit) { message('连线还未经过你的某个已描点；靠近自描点可吸附，或加入该点坐标。', 'error'); return; }
    }
    // Given relation only: certify a bounded screen approximation, never infer a model from samples.
    let gap = 0;
    const model = x => key === 'area' ? x * x : 2 * x;
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1], b = stroke[i]; if (a[0] === b[0]) continue;
      const m = (b[1] - a[1]) / (b[0] - a[0]), c = a[1] - m * a[0], xs = [a[0], b[0]];
      if (key === 'area' && m / 2 > a[0] && m / 2 < b[0]) xs.push(m / 2);
      for (const x of xs) gap = Math.max(gap, Math.abs(m * x + c - model(x)));
    }
    if (gap > 0.25 + 1e-9) { message('手描与题给关系相差超过纵轴1/4单位；多取点、修正点间痕迹。', 'approx-error'); return; }
    for (const side of ['left', 'right']) { const x = rat(BigInt(side === 'left' ? info.lo : info.hi)), p = ends[side]; if (!p || !same(p.x, x) || !same(p.y, relation(x)) || p.kind !== info[side]) { message('端点坐标/空实需按取值范围复查，空心边界不是函数已取到的点。', 'error'); return; } }
    message('手描近似核验通过（纵向误差≤1/4单位），端点声明相符。这不是精确图象或真实模型的证明；关系来自题意。', 'approx');
  };
  function moveCursorToInputs() { cursor = cursor || [0, 0]; $('px').value = String(cursor[0]); $('py').value = String(cursor[1]); clearFeedback(); if (armed) pushPoint(cursor); else draw(); }
  $('fig').addEventListener('keydown', e => { const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] }[e.key]; if (d) { e.preventDefault(); cursor = cursor || [0, 0]; cursor = [Math.max(0, Math.min(4, cursor[0] + d[0])), Math.max(0, Math.min(10, cursor[1] + d[1]))]; clearFeedback(); draw(); } else if (e.key === 'Enter') { e.preventDefault(); moveCursorToInputs(); } });
  function pointer(e) { const r = $('fig').getBoundingClientRect(), x = ((e.clientX - r.left) * 560 / r.width - 65) / 105, y = (450 - (e.clientY - r.top) * 540 / r.height) / 40; const anchors = [...dots.filter(Boolean), ...Object.values(ends)].map(p => [number(p.x), number(p.y)]); const own = anchors.find(p => Math.hypot((p[0] - x) * 105 * r.width / 560, (p[1] - y) * 40 * r.height / 540) <= 8); if (own) return own; if (x < 0 || x > 4 || y < 0 || y > 10) return null; return [x, y]; }
  $('fig').addEventListener('pointerdown', e => { const p = pointer(e); if (!p) return; $('fig').focus(); e.preventDefault(); if (armed && mayDraw()) { dragging = true; $('fig').setPointerCapture(e.pointerId); pushPoint(p); } else { cursor = p.map(v => Math.round(v * 4) / 4); moveCursorToInputs(); } });
  $('fig').addEventListener('pointermove', e => { if (!dragging) return; const p = pointer(e); if (p) pushPoint(p); });
  ['pointerup', 'pointercancel'].forEach(name => $('fig').addEventListener(name, () => { dragging = false; }));
  ['px', 'py', 'join', 'end', 'kind'].forEach(id => { $(id).addEventListener('input', clearFeedback); $(id).addEventListener('change', clearFeedback); });
  $('row').onchange = () => { clearFeedback(); $('px').value = ''; $('py').value = ''; };
  $('task').onchange = reset; $('reset').onclick = reset;

  const storyPoints = [[0, 1], [3, 4], [5, 4], [9, 0], [12, 2]];
  function drawStory() {
    const svg = $('story-fig'); svg.replaceChildren(); const x = n => 65 + 35 * n, y = n => 270 - 40 * n;
    for (let t = 0; t <= 12; t++) { node(svg, 'line', { x1: x(t), y1: y(0), x2: x(t), y2: y(5), stroke: 'var(--line)' }); if (t % 3 === 0) text(svg, x(t), 303, String(t)); }
    for (let q = 0; q <= 5; q++) { node(svg, 'line', { x1: x(0), y1: y(q), x2: x(12), y2: y(q), stroke: 'var(--line)' }); text(svg, 34, y(q) + 6, String(q)); }
    node(svg, 'path', { d: 'M65 50V270H505', fill: 'none', stroke: 'var(--fg)', 'stroke-width': 2 }); text(svg, 465, 335, 't / 分'); text(svg, 145, 30, 'q / ' + ($('unit').value || '单位待声明'));
    node(svg, 'polyline', { points: storyPoints.map(p => x(p[0]) + ',' + y(p[1])).join(' '), fill: 'none', stroke: 'var(--a)', 'stroke-width': 3 });
    storyPoints.forEach((p, i) => { node(svg, 'circle', { cx: x(p[0]), cy: y(p[1]), r: 5, fill: 'var(--no)' }); text(svg, Math.max(100, Math.min(470, x(p[0]))), y(p[1]) - (i % 2 ? 16 : 22), '(' + p.join(',') + ')'); });
  }
  for (let i = 0; i < 4; i++) { const row = document.createElement('fieldset'); row.innerHTML = '<legend>第' + (i + 1) + '段</legend><div class="sg-controls"><label>用时（分）<input data-duration inputmode="decimal"></label><label>末值q<input data-last inputmode="decimal"></label><label>数值变化<select data-trend>' + options([['up', '增大'], ['flat', '不变'], ['down', '减小']]) + '</select></label></div><label>我的这一段过程<textarea rows="2"></textarea></label>'; $('story').append(row); }
  function clearStory() { $('story-feedback').textContent = ''; $('story-feedback').removeAttribute('data-state'); $('story-rubric').hidden = true; }
  $('story').addEventListener('input', clearStory); $('story').addEventListener('change', clearStory); $('quantity').addEventListener('input', clearStory); $('unit').onchange = () => { clearStory(); drawStory(); };
  $('story-check').onclick = () => {
    clearStory(); if (!$('quantity').value.trim() || !$('unit').value) { $('story-feedback').textContent = '先说明q代表的量与单位。'; return; }
    const rows = [...$('story').children];
    for (let i = 0; i < rows.length; i++) { const a = storyPoints[i], b = storyPoints[i + 1], r = rows[i], trend = b[1] > a[1] ? 'up' : b[1] < a[1] ? 'down' : 'flat'; if (!same(read(r.querySelector('[data-duration]').value), rat(BigInt(b[0] - a[0]))) || !same(read(r.querySelector('[data-last]').value), rat(BigInt(b[1]))) || r.querySelector('select').value !== trend || !r.querySelector('textarea').value.trim()) { $('story-feedback').textContent = '第' + (i + 1) + '段的时长/末值/变化或文字记录需补充复查。'; $('story-feedback').dataset.state = 'revise'; return; } }
    $('story-feedback').textContent = '读图数字和变化结构相符；故事文字未自动判真，请按下面准则逐段自核。'; $('story-feedback').dataset.state = 'structure';
    $('story-rubric').textContent = '自核：0～3分q从1增至4；3～5分保持4；5～9分从4减到0；9～12分从0增到2。量与单位必须适合情境，图形不是行走路线。若讲同一直路上离起点距离且不绕路，水平段可写停留，下降是靠近起点，不是下坡或累计路程减少；若讲水量，水平段只要求净变化为0。交界时刻只能有同一个q，不能编成同一时刻两个不同值。上述检查不认证文字情境或实际经历为真。'; $('story-rubric').hidden = false;
  };
  $('save').onclick = () => {
    const lines = ['22.2 我的作图/故事记录（自由文字未自动认证）', info ? info.given : '', ...[...$('declarations').querySelectorAll('label')].map(l => l.textContent.split('自行选择')[0] + ': ' + l.querySelector('select').value), ...[...$('table').children].map(r => [...r.querySelectorAll('input')].map(x => x.value).join(',')), ...trace, '连线痕迹（屏幕坐标对应的量值）', ...stroke.map(p => p.join(',')), $('note').value, '故事量/单位：' + $('quantity').value + '/' + $('unit').value, ...[...$('story').children].map(r => [...r.querySelectorAll('input,select,textarea')].map(e => e.value).join(' | '))];
    const a = document.createElement('a'), url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })); a.href = url; a.download = 'j22-2-我的表图故事.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  reset(); drawStory();
})();
