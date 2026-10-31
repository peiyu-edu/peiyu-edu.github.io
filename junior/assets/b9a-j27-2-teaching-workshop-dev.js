/* Private to j27-2. Students supply table, points and both strokes. */
(function () {
  'use strict';
  const root = document.getElementById('inverse-workshop');
  if (!root || !document.body || document.body.dataset.sec !== 'j27-2' || !root.querySelector('#iw-setup') || root.dataset.ready) return;
  root.dataset.ready = '1';
  const $ = id => root.querySelector('#iw-' + id), ns = 'http://www.w3.org/2000/svg';
  const abs = n => n < 0n ? -n : n;
  function rat(n, d = 1n) { if (!d) throw Error('分母不能为0。'); if (d < 0n) { n = -n; d = -d; } let a = abs(n), b = d; while (b) { const r = a % b; a = b; b = r; } return { n: n / a, d: d / a }; }
  function read(raw) {
    const s = raw.replace(/[０-９]/g, c => String(c.charCodeAt(0) - 65296)).replace(/[−－]/g, '-').replace(/＋/g, '+').replace(/／/g, '/').replace(/．/g, '.').trim(); let m;
    if (!s || s.length > 80) throw Error('请按数值格式填写精确值。');
    if ((m = /^([+-]?\d{1,12})\s*\/\s*(\+?\d{1,12})$/.exec(s))) return rat(BigInt(m[1]), BigInt(m[2]));
    if (!(m = /^([+-]?)(\d{0,12})(?:\.(\d{1,12}))?$/.exec(s)) || !(m[2] || m[3])) throw Error('格式不符：不拆数字，不输入逗号、算式、指数、单位或其它数字字形。');
    const tail = m[3] || ''; return rat(BigInt((m[1] === '-' ? '-' : '') + (m[2] || '0') + tail), 10n ** BigInt(tail.length));
  }
  const same = (a, b) => a.n * b.d === b.n * a.d;
  const cmp = (a, b) => a.n * b.d - b.n * a.d;
  const num = a => Number(a.n) / Number(a.d);
  const show = a => String(a.n) + (a.d === 1n ? '' : '/' + a.d);
  const magnitude = a => rat(abs(a.n), a.d), quarter = rat(1n, 4n), six = rat(6n);
  let current = null, tableOK = false, dots = [], pointsOK = false, strokes = { neg: [], pos: [] }, graphOK = false, cursor = null, armed = false, dragging = false;
  const records = new Map();
  function feedback(s, state) { $('feedback').textContent = s; if (state) $('feedback').dataset.state = state; else delete $('feedback').dataset.state; }
  function closeGuide() { $('guide').hidden = true; $('guide').open = false; $('guide-feedback').textContent = ''; }
  function edited() { feedback(''); closeGuide(); }
  function geometryChanged() { graphOK = false; edited(); }
  function clearGeometry() { tableOK = false; dots = []; pointsOK = false; strokes = { neg: [], pos: [] }; graphOK = false; cursor = null; armed = dragging = false; edited(); draw(); }
  function clearObservation() { ['quadrants', 'neg-trend', 'pos-trend', 'axes', 'symmetry', 'reason'].forEach(id => $(id).value = ''); }
  function invalidate() { current = null; $('active').hidden = true; $('rows').replaceChildren(); $('row').replaceChildren(new Option('自行选择', '')); ['px', 'py', 'branch'].forEach(id => $(id).value = ''); clearObservation(); clearGeometry(); }
  ['k', 'a', 'b', 'c'].forEach(id => $(id).addEventListener('input', invalidate));
  $('setup').onsubmit = e => {
    e.preventDefault(); invalidate();
    try {
      const k = read($('k').value), sizes = ['a', 'b', 'c'].map(id => read($(id).value));
      if (!k.n) throw Error('反比例函数要求k不为0；零不是本任务的反比例系数。');
      if ([k, ...sizes].some(v => v.d > 100n)) throw Error('本工具参数约分后的分母不超过100。');
      if (cmp(magnitude(k), quarter) < 0n || cmp(magnitude(k), six) > 0n) throw Error('本屏幕支持1/4≤|k|≤6；这只是工具范围，一般定义仅要求k≠0。');
      if (sizes.some(v => cmp(v, quarter) < 0n || cmp(v, six) > 0n) || cmp(sizes[0], sizes[1]) >= 0n || cmp(sizes[1], sizes[2]) >= 0n) throw Error('请自选1/4≤a<b<c≤6的三个不同正幅值，再配成正负x；不能取0。');
      const xs = [...sizes].reverse().map(v => rat(-v.n, v.d)).concat(sizes), rows = xs.map(x => ({ x, y: rat(k.n * x.d, k.d * x.n) }));
      if (rows.some(r => cmp(magnitude(r.y), quarter) < 0n || cmp(magnitude(r.y), six) > 0n)) throw Error('这组点有|y|不在1/4到6之间；调整k或幅值以放进可读作图窗，不是说函数在窗外无值。');
      current = { k, rows }; dots = Array(6).fill(null);
      rows.forEach((r, i) => { const tr = document.createElement('tr'), name = document.createElement('th'), x = document.createElement('td'), td = document.createElement('td'), input = document.createElement('input'); name.scope = 'row'; name.textContent = 'P' + (i + 1); x.textContent = show(r.x); input.id = 'iw-y' + i; input.autocomplete = 'off'; input.setAttribute('aria-label', 'P' + (i + 1) + '的y值，由你计算'); input.setAttribute('aria-describedby', 'iw-format'); input.addEventListener('input', clearGeometry); td.append(input); tr.append(name, x, td); $('rows').append(tr); $('row').append(new Option('P' + (i + 1), String(i))); });
      $('active').hidden = false; feedback('成对x来自你的选择。六个y尚未填写；先自行计算，再独立描点。'); draw();
    } catch (err) { feedback(err.message, 'retry'); }
  };
  $('table-check').onclick = () => {
    clearGeometry();
    try { if (!current) throw Error('先采用自己的k与成对x。'); current.rows.forEach((r, i) => { if (!same(read($('y' + i).value), r.y)) throw Error('P' + (i + 1) + '的y还需核对，代入你选的k/x并带着符号。'); }); tableOK = true; feedback('六个表值精确核对；尚未自动描点，请逐行自己落点。', 'table'); }
    catch (err) { feedback(err.message, 'retry'); }
  };
  const X = x => 280 + 36 * x, Y = y => 280 - 36 * y;
  function node(tag, attrs, parent = $('fig')) { const e = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.append(e); return e; }
  function label(x, y, s, anchor = 'middle') { const e = node('text', { x, y, fill: 'var(--fg)', 'font-size': 22, 'text-anchor': anchor, 'data-figure-label-fixed': 1 }); e.textContent = s; }
  function draw() {
    $('fig').replaceChildren();
    for (let v = -6; v <= 6; v++) { node('path', { d: 'M' + X(v) + ' 64V496M64 ' + Y(v) + 'H496', fill: 'none', stroke: 'var(--line)' }); if (v && v % 2 === 0) { label(X(v), 524, String(v)); label(32, Y(v) + 7, String(v)); } }
    node('path', { d: 'M64 280H506M280 496V54', stroke: 'var(--fg)', 'stroke-width': 2, fill: 'none' }); label(520, 285, 'x'); label(280, 34, 'y'); label(264, 305, '0');
    for (const branch of ['neg', 'pos']) if (strokes[branch].length) node('path', { d: strokes[branch].map((p, i) => (i ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1])).join(' '), stroke: 'var(--a)', 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round', 'data-branch': branch });
    dots.forEach((p, i) => { if (!p) return; const x = X(num(p.x)), y = Y(num(p.y)); node('circle', { cx: x, cy: y, r: 4.5, fill: 'var(--no)', 'data-point': i }); label(x + (x > 460 ? -17 : 17), y - 12, 'P' + (i + 1)); });
    if (cursor) node('path', { d: 'M' + (X(cursor[0]) - 6) + ' ' + Y(cursor[1]) + 'h12m-6 -6v12', stroke: 'var(--b)', fill: 'none' });
    $('status').textContent = '已独立落点' + dots.filter(Boolean).length + '/6；负x支痕迹' + strokes.neg.length + '点，正x支痕迹' + strokes.pos.length + '点。游标不自动算作落点。';
  }
  $('plot').onclick = () => {
    geometryChanged(); pointsOK = false; strokes = { neg: [], pos: [] }; armed = dragging = false;
    try { const row = $('row').value, x = read($('px').value), y = read($('py').value); if (!tableOK || row === '' || cmp(magnitude(x), six) > 0n || cmp(magnitude(y), six) > 0n) throw Error('先核表、选对应行，再用窗内坐标主动落点。'); dots[+row] = { x, y }; feedback('按你输入的坐标落点，尚未核对与表对应。'); }
    catch (err) { feedback(err.message, 'retry'); } draw();
  };
  $('points-check').onclick = () => { geometryChanged(); pointsOK = false; if (!tableOK || current.rows.some((r, i) => !dots[i] || !same(dots[i].x, r.x) || !same(dots[i].y, r.y))) { feedback('还未与表逐项对应；检查独立点的横纵位置和刻度。', 'retry'); return; } pointsOK = true; feedback('六个点与表一致；请分别手连负x支、正x支，不能借道坐标轴。', 'points'); };
  function canDraw() { if (!pointsOK || !['neg', 'pos'].includes($('branch').value)) { feedback('先核完六点并选择要画的那一支。', 'retry'); return false; } return true; }
  function push(p) { if (p.some(v => !Number.isFinite(v) || Math.abs(v) > 6)) { feedback('路径点须在作图窗内。', 'retry'); return; } const path = strokes[$('branch').value], last = path.at(-1); if (!last || p[0] !== last[0] || p[1] !== last[1]) path.push(p.slice()); geometryChanged(); draw(); }
  $('start').onclick = () => { edited(); if (canDraw()) { armed = true; feedback('已开启所选支手描；按住图格画，或逐次加入自己的路径坐标。'); } };
  $('stop').onclick = () => { armed = dragging = false; edited(); };
  $('vertex').onclick = () => { edited(); if (!canDraw()) return; try { push([num(read($('px').value)), num(read($('py').value))]); } catch (err) { feedback(err.message, 'retry'); } };
  $('clear').onclick = () => { if (!['neg', 'pos'].includes($('branch').value)) { feedback('先选要清掉的支。', 'retry'); return; } strokes[$('branch').value] = []; armed = dragging = false; geometryChanged(); draw(); };
  $('branch').onchange = () => { armed = dragging = false; edited(); };
  // Bound each entire short segment via quadratic inequalities; no sample-only acceptance.
  function range(A, B, C, u, v) { const f = x => (A * x + B) * x + C, values = [f(u), f(v)], vertex = A ? -B / (2 * A) : NaN; if (vertex > u && vertex < v) values.push(f(vertex)); return [Math.min(...values), Math.max(...values)]; }
  $('graph-check').onclick = () => {
    geometryChanged(); armed = dragging = false;
    if (!pointsOK) { feedback('先核完独立描点。', 'retry'); return; }
    const k = num(current.k);
    for (const branch of ['neg', 'pos']) {
      const path = strokes[branch], branchRows = current.rows.slice(branch === 'neg' ? 0 : 3, branch === 'neg' ? 3 : 6), sign = branch === 'neg' ? -1 : 1;
      if (path.length < 3) { feedback('两支都须有你亲自留下的多点曲线痕迹。', 'retry'); return; }
      if (path.some(p => p[0] === 0 || p[1] === 0)) { feedback('画痕碰到了坐标轴；x和y都不能为0。清掉这支再画，不把轴上点当端点。', 'axis'); return; }
      if (path.some(p => p[0] * sign <= 0)) { feedback('所选支越过了x=0或连到另一支；两支必须分别画，不能连穿原点。', 'cross'); return; }
      if (path.some(p => p[0] * p[1] * k <= 0)) { feedback('画痕进入与k符号不合的象限，途中也可能穿过坐标轴；请重画。', 'cross'); return; }
      for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; if (a[0] === b[0] && a[1] !== b[1]) { feedback('画痕含同x异y的竖段，不表示y是x的函数。', 'vertical'); return; } if (b[0] < a[0]) { feedback('请在这一支上按x增大顺序连；回描只说明顺序不合，不能仅据此判非函数。', 'order'); return; } if (b[0] - a[0] > .5 + 1e-9) { feedback('请增加自己的路径点，相邻横向间隔不超过1/2单位，不把疏点用长折段代替曲线。', 'approx-error'); return; } }
      const first = path[0], last = path.at(-1), lo = num(branchRows[0].x), hi = num(branchRows[2].x);
      if (Math.abs(first[0] - lo) > 1e-8 || Math.abs(last[0] - hi) > 1e-8 || Math.abs(first[1] - num(branchRows[0].y)) > 1e-8 || Math.abs(last[1] - num(branchRows[2].y)) > 1e-8) { feedback('每支只画你选的最外到最内三点之间，并接到两端自描点；曲线在这段以外仍继续，不接到轴上。', 'retry'); return; }
      if (branchRows.some(p => { const x = num(p.x), y = num(p.y); return !path.some(q => Math.abs(q[0] - x) < 1e-8 && Math.abs(q[1] - y) < 1e-8) && !path.some((b, i) => { if (!i) return false; const a = path[i - 1]; return a[0] < b[0] && a[0] <= x && x <= b[0] && Math.abs(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]) - y) < 1e-8; }); })) { feedback('这支痕迹还未经过你的每个已描点；靠近自描点可吸附，也可加入该点坐标。', 'retry'); return; }
      for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; if (a[0] === b[0]) continue; const m = (b[1] - a[1]) / (b[0] - a[0]), c = a[1] - m * a[0], plus = range(m, c + .25, -k, a[0], b[0]), minus = range(m, c - .25, -k, a[0], b[0]), relative = range(m, c, -k, a[0], b[0]), eps = 1e-9;
        if ((sign > 0 ? plus[0] < -eps || minus[1] > eps : plus[1] > eps || minus[0] < -eps) || relative[0] < -Math.abs(k) / 4 - eps || relative[1] > Math.abs(k) / 4 + eps) { feedback('这段痕迹偏离题给关系；修正位置或多取路径点，屏幕误差须同时不超过约1/4纵单位与该处|y|的1/4。', 'approx-error'); return; }
      }
    }
    graphOK = true; feedback('两支局部手描近似核验通过，未触轴/跨支；这不是精确双曲线或一般性质的证明。请再写图式观察。', 'approx');
  };
  function cursorInputs() { cursor = cursor || [0, 0]; $('px').value = String(cursor[0]); $('py').value = String(cursor[1]); edited(); if (armed && canDraw()) push(cursor); else draw(); }
  $('fig').onkeydown = e => { if (e.target !== $('fig')) return; const delta = { ArrowLeft: [-.25, 0], ArrowRight: [.25, 0], ArrowDown: [0, -.25], ArrowUp: [0, .25] }[e.key]; if (delta) { e.preventDefault(); cursor = cursor || [0, 0]; cursor = cursor.map((v, i) => Math.max(-6, Math.min(6, v + delta[i]))); edited(); draw(); } else if (e.key === 'Enter') { e.preventDefault(); cursorInputs(); } };
  function pointer(e) { const matrix = $('fig').getScreenCTM(); if (!matrix) return null; const s = $('fig').createSVGPoint(); s.x = e.clientX; s.y = e.clientY; const p = s.matrixTransform(matrix.inverse()), raw = [(p.x - 280) / 36, (280 - p.y) / 36], r = $('fig').getBoundingClientRect(), scale = r.width / 560, own = dots.filter(Boolean).map(p => [num(p.x), num(p.y)]).find(p => Math.hypot((p[0] - raw[0]) * 36 * scale, (p[1] - raw[1]) * 36 * scale) <= 8); return own || (raw.some(v => Math.abs(v) > 6) ? null : raw); }
  $('fig').onpointerdown = e => { const p = pointer(e); if (!p) return; e.preventDefault(); $('fig').focus(); if (armed && canDraw()) { dragging = true; $('fig').setPointerCapture(e.pointerId); push(p); } else { cursor = p.map(v => Math.round(v * 4) / 4); cursorInputs(); } };
  $('fig').onpointermove = e => { if (dragging) { const p = pointer(e); if (p) push(p); } };
  ['pointerup', 'pointercancel'].forEach(id => $('fig').addEventListener(id, () => dragging = false));
  ['px', 'py'].forEach(id => $(id).addEventListener('input', edited)); $('row').onchange = () => { $('px').value = $('py').value = ''; edited(); };
  ['quadrants', 'neg-trend', 'pos-trend', 'axes', 'symmetry'].forEach(id => $(id).onchange = edited); $('reason').oninput = edited;
  $('record').onclick = () => {
    edited(); if (!graphOK) { feedback('先完成两支自己的近似曲线核验。', 'retry'); return; }
    const positive = current.k.n > 0n, trend = positive ? 'down' : 'up';
    if ($('quadrants').value !== (positive ? '13' : '24') || $('neg-trend').value !== trend || $('pos-trend').value !== trend || $('axes').value !== 'no' || $('symmetry').value !== 'origin') { feedback('观察选择还需核对；增减要分别看负x支和正x支，不能跨x=0一刀切。', 'retry'); return; }
    if (!$('reason').value.trim()) { feedback('写自己的图式依据与跨支反例，再记录；文字不会自动判真。', 'retry'); return; }
    records.set(show(current.k) + '|' + current.rows.map(r => show(r.x)).join(), positive);
    $('records').textContent = '已核对' + records.size + '幅局部图；其中正k ' + [...records.values()].filter(Boolean).length + '幅，负k ' + [...records.values()].filter(v => !v).length + '幅。';
    feedback('图与封闭观察选项相符；文字只在本轮输入框保留、尚未判定正确，换参数会清空。有限表和画痕不代替一般说明。', 'recorded');
  };
  $('open-guide').onclick = () => { if (![...records.values()].includes(true) || ![...records.values()].includes(false)) { $('guide-feedback').textContent = '先各完成一幅正k、负k的列表—描点—双支连线与观察，再对照一般说明。'; return; } $('guide').hidden = false; $('guide-feedback').textContent = '请按一般式自核，文字尚未判定正确；不认证纸笔、合作经历或掌握。'; };
  $('reset').onclick = () => { records.clear(); $('records').textContent = ''; $('setup').reset(); ['px', 'py', 'branch'].forEach(id => $(id).value = ''); invalidate(); };
  draw();
})();
