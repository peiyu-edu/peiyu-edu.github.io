/* j29-1 only: a local construction sketch, no learning-store writes. */
(function () {
  'use strict';
  const configs = {
    acute: [[-3, -1], [3, -1], [0, 3]],
    right: [[-3, -1], [3, -1], [-3, 3]],
    obtuse: [[-3, -1], [3, -1], [0, 0]],
    collinear: [[-3, -1], [3, -1], [1, -1]],
    repeat: [[-3, -1], [3, -1], [-3, -1]],
    same: [[-3, -1], [-3, -1], [-3, -1]],
    near: [[-3, -1], [3, -1], [1, -0.99]]
  };
  const names = ['A', 'B', 'C'];
  // Deliberately no trim/NFKC/eval or removal of interior whitespace.
  function number(raw) {
    if (typeof raw !== 'string' || /\s/.test(raw) || !/^-?(?:0|[1-9]\d{0,3})(?:\.\d{1,3})?$/.test(raw)) return null;
    const value = Number(raw);
    return Number.isFinite(value) && Math.abs(value) <= 1000 ? value : null;
  }
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  function classify(points) {
    const unique = points.filter((p, i) => !points.slice(0, i).some(q => same(p, q)));
    if (unique.length < 3) return {kind: 'infinite', distinct: unique.length};
    // The finite preset coordinates have at most two decimals. Integer
    // arithmetic here distinguishes exact collinearity from display proximity.
    const [a, b, c] = points.map(p => p.map(x => Math.round(x * 100)));
    const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    return {kind: cross === 0 ? 'none' : 'unique', distinct: 3};
  }
  function bisector(a, b) {
    if (same(a, b)) return null;
    return {nx: 2 * (b[0] - a[0]), ny: 2 * (b[1] - a[1]),
      k: b[0] ** 2 + b[1] ** 2 - a[0] ** 2 - a[1] ** 2};
  }
  function intersect(l, m) {
    const det = l.nx * m.ny - l.ny * m.nx;
    if (det === 0) return {kind: l.nx * m.k === m.nx * l.k && l.ny * m.k === m.ny * l.k ? 'coincident' : 'parallel'};
    return {kind: 'point', point: [(l.k * m.ny - l.ny * m.k) / det, (l.nx * m.k - l.k * m.nx) / det]};
  }
  function compass(a, b, radius) {
    const d = distance(a, b);
    if (d === 0) return {kind: 'same'};
    if (!(radius > d / 2)) return {kind: radius === d / 2 ? 'tangent' : 'short'};
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const h = Math.sqrt(radius * radius - d * d / 4);
    const dx = -(b[1] - a[1]) * h / d, dy = (b[0] - a[0]) * h / d;
    return {kind: 'two', U: [mid[0] + dx, mid[1] + dy], V: [mid[0] - dx, mid[1] - dy]};
  }
  function checkCircle(points, center, radius) {
    if (!Array.isArray(center) || center.length !== 2 || !center.every(Number.isFinite) || !Number.isFinite(radius) || radius <= 0) return null;
    return points.map(p => {const d = distance(center, p); return {d, near: Math.abs(d - radius) <= 0.002,
      side: d < radius ? '圆内' : d > radius ? '圆外' : '圆上'};});
  }
  function mount(doc) {
    const root = doc.getElementById('circle-workshop');
    if (!root || doc.body?.dataset.sec !== 'j29-1' || root.dataset.cwMounted) return;
    root.dataset.cwMounted = '1';
    const $ = id => root.querySelector('#cw-' + id);
    const ns = 'http://www.w3.org/2000/svg';
    let state;
    const coord = v => String(Object.is(v, -0) ? 0 : Math.round(v * 1000) / 1000);
    const readCenter = () => {const x = number($('x').value), y = number($('y').value); return x === null || y === null ? null : [x, y];};
    const points = () => configs[$('shape').value].slice(0, Number($('count').value));
    function message(text) { $('feedback').textContent = text; }
    function invalidate(text) {state.circle = null; message(text || '作图条件已改，旧核对已清除；请重新操作。');}
    function el(tag, attrs, parent, text) {
      const e = doc.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
      if (text) e.textContent = text;
      parent.append(e); return e;
    }
    const px = p => [200 + 24 * p[0], 190 - 24 * p[1]];
    const visible = p => {const [x, y] = px(p); return x >= 22 && x <= 378 && y >= 22 && y <= 298;};
    function render() {
      const svg = $('fig'); svg.replaceChildren();
      const defs = el('defs', {}, svg);
      const clip = el('clipPath', {id: 'cw-clip'}, defs);
      el('rect', {x: 8, y: 8, width: 384, height: 304}, clip);
      el('rect', {x: 8, y: 8, width: 384, height: 304, rx: 5, fill: 'var(--card)', stroke: 'var(--line)'}, svg);
      const g = el('g', {'clip-path': 'url(#cw-clip)'}, svg);
      for (let x = -7; x <= 7; x++) el('path', {d: `M${200 + 24 * x} 8V312`, stroke: 'var(--line)', opacity: '.5'}, g);
      for (let y = -4; y <= 7; y++) el('path', {d: `M8 ${190 - 24 * y}H392`, stroke: 'var(--line)', opacity: '.5'}, g);
      function circle(p, r, color, dash) {
        const [x, y] = px(p);
        el('circle', {cx: x, cy: y, r: 24 * r, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-dasharray': dash || ''}, g);
      }
      function mark(p, name, color) {
        if (!visible(p)) return;
        const [x, y] = px(p);
        el('rect', {x: x - 3, y: y - 3, width: 6, height: 6, fill: color}, g);
        el('text', {x: x + (x > 340 ? -10 : 10), y: y - 10, 'text-anchor': x > 340 ? 'end' : 'start', 'font-size': 20, fill: color}, g, name);
      }
      function line(l, color, dash) {
        const hits = [];
        [-8, 8].forEach(x => {if (l.ny) {const y = (l.k - l.nx * x) / l.ny; if (y >= -6 && y <= 8) hits.push([x, y]);}});
        [-6, 8].forEach(y => {if (l.nx) {const x = (l.k - l.ny * y) / l.nx; if (x >= -8 && x <= 8) hits.push([x, y]);}});
        if (hits.length >= 2) {const a = px(hits[0]), b = px(hits.find(p => !same(p, hits[0])) || hits[1]);
          el('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: color, 'stroke-width': 2, 'stroke-dasharray': dash || ''}, g);}
      }
      state.lines.forEach(l => line(l, 'var(--a)'));
      if (state.trial) line(state.trial, 'var(--no)', '4 4');
      if (state.arc) {
        circle(state.arc.a, state.arc.r, 'var(--muted)', '4 4');
        circle(state.arc.b, state.arc.r, 'var(--muted)', '4 4');
        mark(state.arc.U, 'U', 'var(--fg)'); mark(state.arc.V, 'V', 'var(--fg)');
      }
      if (state.circle) circle(state.circle.center, state.circle.r, 'var(--a)');
      const ps = points();
      ps.forEach((p, i) => {if (!ps.slice(0, i).some(q => same(p, q))) mark(p, ps.map((q, j) => same(p, q) ? names[j] : '').filter(Boolean).join('/'), 'var(--fg)');});
      const center = readCenter(); if (center) mark(center, 'O', 'var(--no)');
      $('lines').textContent = state.lines.length ? '已作中垂线：' + state.lines.map(l => l.pair).join('、') + '。改配置或重做会清空。' : '尚未作出中垂线。';
    }
    function reset() {
      state = {lines: [], arc: null, circle: null, trial: null};
      ['x', 'y', 'r', 'opening', 'proof', 'pair', 'from', 'to'].forEach(id => {$(id).value = '';});
      const ps = points();
      $('givens').textContent = ps.map((p, i) => `${names[i]}(${p.join(', ')})`).join('；') + '。每格 1 单位。';
      $('tools').disabled = ps.length < 2;
      [...$('pair').options].forEach(o => {o.disabled = o.value && [...o.value].some(n => names.indexOf(n) >= ps.length);});
      ['from', 'to'].forEach(id => [...$(id).options].forEach(o => {o.disabled = o.value === 'C' && ps.length < 3;}));
      message('还没有作图。先自己选圆心，或从尺规作弧开始。'); render();
    }
    ['count', 'shape'].forEach(id => $(id).addEventListener('change', reset));
    $('reset').addEventListener('click', reset);
    ['x', 'y', 'r'].forEach(id => $(id).addEventListener('input', () => {invalidate(); render();}));
    $('proof').addEventListener('input', () => message('文字已修改；请按展开的准则自核，本页不自动判定证明。'));
    ['pair', 'opening'].forEach(id => $(id).addEventListener(id === 'pair' ? 'change' : 'input', () => {
      state.arc = state.trial = null; $('from').value = $('to').value = ''; invalidate(); render();
    }));
    ['from', 'to'].forEach(id => $(id).addEventListener('change', () => {state.trial = null; invalidate(); render();}));
    $('arcs').addEventListener('click', () => {
      state.arc = state.trial = null; $('from').value = $('to').value = ''; invalidate();
      const pair = $('pair').value, r = number($('opening').value), ps = points();
      if (!pair || r === null || r <= 0) {message('请选线段并按约定输入正的圆规开口。'); render(); return;}
      const a = ps[names.indexOf(pair[0])], b = ps[names.indexOf(pair[1])];
      if (!a || !b) {message('这条线段不在当前条件中。'); render(); return;}
      const result = compass(a, b, r);
      if (result.kind !== 'two') {
        message(result.kind === 'same' ? '两端点重合，不能据此作线段中垂线；须改用两个不同位置的点。' :
          result.kind === 'tangent' ? '开口恰为半线段长，两弧仅有一个交点，不能由两交点连线。' : '开口小于半线段长，两弧无交点。');
      } else {
        state.arc = {...result, a, b, r, pair};
        message('已作两条等半径弧。请选择要连的两个点。' + (!visible(result.U) || !visible(result.V) ? '部分弧交点在画板外，仍可在过点列表选取；也可减小开口。' : ''));
      }
      render();
    });
    $('line').addEventListener('click', () => {
      state.trial = null; invalidate();
      const arc = state.arc, from = $('from').value, to = $('to').value;
      if (!arc || !from || !to) {message('请先作弧，再选两个不同的过点。'); render(); return;}
      const get = n => n === 'U' || n === 'V' ? arc[n] : points()[names.indexOf(n)];
      const a = get(from), b = get(to);
      if (!a || !b || same(a, b)) {message('所选点没有两个不同位置，不能确定直线。'); render(); return;}
      if ([from, to].sort().join('') !== 'UV') {
        state.trial = {nx: b[1] - a[1], ny: a[0] - b[0], k: (b[1] - a[1]) * a[0] + (a[0] - b[0]) * a[1]};
        message('已画出这条试线（虚线）；本次两弧的两个交点尚未同时用上，不能据此认作所选线段的中垂线。');
      } else {
        const l = {...bisector(arc.a, arc.b), pair: arc.pair};
        if (state.lines.some(m => m.pair === l.pair)) message('这条边的中垂线已作过；重复作同一条线没有增加条件。');
        else {state.lines.push(l); message('已连接两弧交点，得到 ' + l.pair + ' 的中垂线。两交点各自到线段两端等距，中垂线经过这两个点。');}
      }
      render();
    });
    $('intersection').addEventListener('click', () => {
      invalidate();
      if (state.lines.length < 2) {message('还需作另一条边的中垂线；只有一条线不能唯一选出圆心。'); return;}
      const result = intersect(state.lines[0], state.lines[1]);
      if (result.kind === 'parallel') message('两条中垂线平行且不同，没有交点。三个不同共线点不能同在一个圆上。');
      else if (result.kind === 'coincident') message('两条中垂线重合，交点不唯一；重复位置只提供了两点条件，仍有无数个圆。');
      else {
        const p = result.point;
        if (p.some(v => !Number.isFinite(v) || Math.abs(v) > 1000)) message('交点超出本工具的坐标输入范围；这是工具范围限制，不是圆不存在。请用纸笔延长中垂线。');
        else {
          $('x').value = coord(p[0]); $('y').value = coord(p[1]); $('r').value = '';
          message('已取两线交点为 O（输入框至多三位小数）。请自行量取半径并作圆。' + (!visible(p) ? 'O 在画板外；近共线而不共线时仍有唯一圆，不能按像素判断共线。' : ''));
        }
      }
      render();
    });
    $('radius').addEventListener('click', () => {
      invalidate(); const center = readCenter();
      if (!center) message('请先按约定输入或在图上选圆心。');
      else {const r = distance(center, points()[0]);
        if (r === 0) { $('r').value = ''; message('OA 为零，不能作为圆的正半径。请另选圆心。'); }
        else if (r > 1000) { $('r').value = ''; message('OA 超过工具半径输入范围；请改用纸笔，此限制不表示没有圆。'); }
        else { $('r').value = coord(r); message('已量取 OA 的近似长度；还须作圆并核对所有给定点。'); }
      }
      render();
    });
    $('circle').addEventListener('click', () => {
      invalidate(); const center = readCenter(), r = number($('r').value);
      const checks = checkCircle(points(), center, r);
      if (r === null || !checks) {message('请按约定填圆心坐标和正半径；零半径不是圆。'); render(); return;}
      state.circle = {center, r};
      const text = checks.map((c, i) => `${names[i]}：O${names[i]}≈${c.d.toFixed(4)}，${c.near ? '与半径的差在容差内' : '按本次输入在' + c.side}`).join('；');
      const kind = classify(points());
      message('本次数值核对，r=' + r + '。' + text + '。' + (checks.every(c => c.near) ? '数值接近仅说明本次近似作图，不能证明一般命题。' : '至少一个点未通过本次数值核对，请重试。') +
        (kind.kind === 'none' ? '三个不同共线点在精确几何中无圆，近似画图即使看似通过也不能改变它。' : kind.kind === 'infinite' ? '当前只有 ' + kind.distinct + ' 个不同位置，符合条件的圆不唯一。' : '这三个点确实不共线；唯一性要用两条中垂线说明。'));
      render();
    });
    function choose(p) {
      $('x').value = coord(p[0]); $('y').value = coord(p[1]); invalidate('候选圆心已移动，旧圆与核对已清除；请重新定半径、作圆。'); render();
    }
    const svg = $('fig'); let dragging = false;
    function pointer(event) {
      const pt = svg.createSVGPoint(); pt.x = event.clientX; pt.y = event.clientY;
      const m = svg.getScreenCTM(); if (!m) return;
      const p = pt.matrixTransform(m.inverse());
      choose([Math.max(-7, Math.min(7, Math.round((p.x - 200) / 6) / 4)), Math.max(-4, Math.min(7, Math.round((190 - p.y) / 6) / 4))]);
    }
    svg.addEventListener('pointerdown', event => {if (event.button !== 0) return; event.preventDefault(); dragging = true; svg.focus(); svg.setPointerCapture(event.pointerId); pointer(event);});
    svg.addEventListener('pointermove', event => {if (dragging) pointer(event);});
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => svg.addEventListener(type, () => {dragging = false;}));
    svg.addEventListener('keydown', event => {
      const shifts = {ArrowLeft: [-.25, 0], ArrowRight: [.25, 0], ArrowUp: [0, .25], ArrowDown: [0, -.25]};
      if (!shifts[event.key]) return;
      event.preventDefault(); const p = readCenter() || [0, 0], d = shifts[event.key];
      choose([Math.max(-1000, Math.min(1000, p[0] + d[0])), Math.max(-1000, Math.min(1000, p[1] + d[1]))]);
    });
    reset();
  }
  if (typeof module === 'object' && module.exports) module.exports = {number, configs, distance, classify, bisector, intersect, compass, checkCircle, mount};
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mount(document), {once: true});
    else mount(document);
  }
}());
