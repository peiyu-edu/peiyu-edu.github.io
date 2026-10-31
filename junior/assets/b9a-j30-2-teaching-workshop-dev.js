/* Only j30-2. Local practice, no learning-ledger events or persistence. */
(function () {
  'use strict';
  if (document.body.dataset.sec !== 'j30-2') return;
  const root = document.getElementById('j30-workshop');
  if (!root || root.dataset.mounted === 'yes') return;
  root.dataset.mounted = 'yes';
  const $ = id => root.querySelector('#' + id);
  const proof = $('jw-proof'), draw = $('jw-draw');
  const ps = $('jw-proof-status'), ds = $('jw-draw-status');
  const pref = $('jw-proof-ref'), dref = $('jw-draw-ref');
  const edgeTrim = s => s.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  const word = s => /^[A-Z]{3}$/.test(edgeTrim(s)) ? edgeTrim(s) : null;
  // Whitespace is allowed between whole tokens, never removed inside a token.
  function relation(s, size, isTriangle = false) {
    const token = '[A-Z]{' + size + '}';
    const sep = isTriangle ? '[=≌]' : '=';
    const m = new RegExp('^(' + token + ')[ \\t]*' + sep + '[ \\t]*(' + token + ')$').exec(edgeTrim(s));
    return m && [m[1], m[2]];
  }
  const segment = s => s && s.split('').sort().join('');
  const angle = s => s && [s, s[2] + s[1] + s[0]].sort()[0];
  function equalPair(s, size, a, b, canonical) {
    const pair = relation(s, size);
    return !!pair && [canonical(pair[0]), canonical(pair[1])].sort().join(':') ===
      [canonical(a), canonical(b)].sort().join(':');
  }
  function congruent(s) {
    const pair = relation(s, 3, true);
    if (!pair) return false;
    const map = {O: 'O', A: 'B', B: 'A', P: 'P'};
    return ['AOP', 'BOP'].includes(pair[0].split('').sort().join('')) &&
      pair[0].split('').map(c => map[c]).join('') === pair[1];
  }
  function clearProof() {
    ps.textContent = ''; pref.hidden = true;
    proof.elements.proofSelf.checked = false;
  }
  proof.addEventListener('input', e => { if (e.target.name !== 'proofSelf') clearProof(); });
  proof.addEventListener('change', e => { if (e.target.name !== 'proofSelf') clearProof(); });
  proof.addEventListener('reset', clearProof);
  proof.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => proof.elements.namedItem(n).value;
    const checks = [
      [angle(word(v('ra'))) === angle('OAP') && angle(word(v('rb'))) === angle('OBP'), '两处直角角名：顶点应分别是切点 A、B。'],
      [v('rightReason') === 'tangent', '两个直角的依据应来自已知切线，不可倒用待证结论。'],
      [equalPair(v('leg'), 2, 'OA', 'OB', segment) && v('legReason') === 'radius', '直角边及其相等依据还需检查：用同一个圆的条件。'],
      [equalPair(v('hyp'), 2, 'OP', 'OP', segment) && v('hypReason') === 'common', '斜边及其相等依据还需检查：两三角形共有哪一边？'],
      [v('rule') === 'HL', '请把刚列出的直角、斜边和直角边条件与判定对应。'],
      [congruent(v('tri')), '全等顶点对应顺序不一致，或记号不在本栏语法内。'],
      [equalPair(v('length'), 2, 'PA', 'PB', segment), '切线长结论应从全等三角形的对应边得到。'],
      [equalPair(v('angleP'), 3, 'APO', 'BPO', angle), '两切线夹角的对应角须以 P 为顶点。'],
      [equalPair(v('angleO'), 3, 'AOP', 'BOP', angle), '圆心处对应角须以 O 为顶点。']
    ];
    const fail = checks.find(c => !c[0]);
    ps.textContent = fail ? '还需修改：' + fail[1] :
      '指定的 HL 前提、对应顺序及三个结论已核对。自由文字、探索记录与角的内部条件仍须按对照自核，未自动认证一般证明。';
  });
  $('jw-proof-reference').addEventListener('click', () => {
    if (!edgeTrim(proof.elements.explore.value) || !edgeTrim(proof.elements.proofText.value)) {
      ps.textContent = '请先留下探索记录和自己的证明段落，再打开对照；文字仅供自核。'; return;
    }
    pref.hidden = !pref.hidden;
  });

  // Screen coordinates are a rendering implementation, not a student proof method.
  const triangles = {
    acute: [[6, 10], [2, 2], [14, 2]],
    right: [[2, 10], [2, 2], [8, 2]],
    obtuse: [[5, 5], [2, 2], [14, 2]]
  };
  const TOL = 0.18;
  let points = {}, circle = false, compass = {}, aim = [8, 6];
  const board = $('jw-board');
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const mul = (p, n) => [p[0] * n, p[1] * n];
  const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
  const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
  function number(s, lo, hi) {
    const t = edgeTrim(s);
    if (!/^(?:0|[1-9][0-9]{0,2})(?:\.[0-9]{1,2})?$/.test(t)) return null;
    const n = Number(t);
    return Number.isFinite(n) && lo <= n && n <= hi ? n : null;
  }
  const tri = () => triangles[$('jw-shape').value];
  function foot(p, a, b) {
    const d = sub(b, a), t = dot(sub(p, a), d) / dot(d, d);
    return {p: add(a, mul(d, t)), t};
  }
  function inside(p, t) {
    const c = t.map((a, k) => cross(sub(t[(k + 1) % 3], a), sub(p, a)));
    return c.every(n => n > 1e-8) || c.every(n => n < -1e-8);
  }
  function center(t) {
    const weights = t.map((_, k) => dist(t[(k + 1) % 3], t[(k + 2) % 3]));
    return mul(t.reduce((p, a, k) => add(p, mul(a, weights[k])), [0, 0]), 1 / weights.reduce((a, b) => a + b));
  }
  function clearDraw() {
    ds.textContent = ''; dref.hidden = true;
    ['self1', 'self2', 'self3'].forEach(n => { draw.elements[n].checked = false; });
  }
  function resetDrawing() {
    points = {}; compass = {}; circle = false; aim = [8, 6]; clearDraw(); render();
  }
  const xy = p => [44 + 32 * p[0], 440 - 32 * p[1]];
  function line(p, q, dash = false) {
    const a = xy(p), b = xy(q);
    return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="currentColor" stroke-width="2"' + (dash ? ' stroke-dasharray="6 4"' : '') + '/>';
  }
  function ring(p, r, dashed) {
    const a = xy(p);
    return '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="' + r * 32 + '" fill="none" stroke="currentColor" stroke-width="1.5"' + (dashed ? ' stroke-dasharray="3 4"' : '') + '/>';
  }
  function mark(p, name) {
    const a = xy(p);
    return '<circle cx="' + a[0] + '" cy="' + a[1] + '" r="4" fill="currentColor"/><text x="' + (a[0] + 8) + '" y="' + (a[1] - 8) + '" font-size="16" fill="currentColor">' + name + '</text>';
  }
  function render() {
    const t = tri();
    let h = '<title>学生自己的角平分线、交点、垂足和圆</title><g style="color:var(--fg)">';
    for (let x = 0; x <= 16; x += 2) {
      const a = xy([x, 0]), b = xy([x, 12]);
      h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--line)"/><text x="' + (a[0] - 5) + '" y="464" font-size="14" fill="currentColor">' + x + '</text>';
    }
    for (let y = 0; y <= 12; y += 2) {
      const a = xy([0, y]), b = xy([16, y]);
      h += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--line)"/><text x="14" y="' + (a[1] + 5) + '" font-size="14" fill="currentColor">' + y + '</text>';
    }
    t.forEach((p, k) => { h += line(p, t[(k + 1) % 3]); h += mark(p, 'ABC'[k]); });
    ['a', 'b'].forEach((key, k) => {
      if (compass[key] && !circle) {
        const p = t[k], r = compass[key];
        const u = add(p, mul(sub(t[(k + 1) % 3], p), r / dist(p, t[(k + 1) % 3])));
        const v = add(p, mul(sub(t[(k + 2) % 3], p), r / dist(p, t[(k + 2) % 3])));
        h += ring(p, r, true) + ring(u, r, true) + ring(v, r, true);
      }
      if (points[key] && dist(points[key], t[k]) > 1e-8) {
        // Extend the student's ray to the board boundary, never substitute a true bisector.
        const d = sub(points[key], t[k]); let scale = 1e6;
        d.forEach((n, axis) => {
          if (n > 0) scale = Math.min(scale, ([16, 12][axis] - t[k][axis]) / n);
          if (n < 0) scale = Math.min(scale, -t[k][axis] / n);
        });
        h += line(t[k], add(t[k], mul(d, scale)), true) + mark(points[key], '');
      }
    });
    if (points.i) h += mark(points.i, 'I');
    if (points.d) h += mark(points.d, 'D');
    if (points.i && points.d) h += line(points.i, points.d);
    if (circle && points.i && points.d) h += ring(points.i, dist(points.i, points.d), false);
    const a = xy(aim);
    h += '<path d="M' + (a[0] - 7) + ',' + a[1] + 'h14 M' + a[0] + ',' + (a[1] - 7) + 'v14" stroke="currentColor" stroke-width="2"/></g>';
    board.innerHTML = h;
  }
  function place(p) {
    clearDraw();
    const key = $('jw-tool').value;
    if ((key === 'i' && (!points.a || !points.b)) || (key === 'd' && !points.i)) {
      ds.textContent = '请先画两条射线，再标交点 I，最后作垂足 D。'; return;
    }
    if (key === 'a' || key === 'b') { delete points.i; delete points.d; }
    if (key === 'i') delete points.d;
    points[key] = p; circle = false; aim = p.slice(); render();
    ds.textContent = '已记录本次落点，尚未核对。继续作图，或检查后修正。';
  }
  draw.addEventListener('submit', e => {
    e.preventDefault(); clearDraw();
    const x = number($('jw-x').value, 0, 16), y = number($('jw-y').value, 0, 12);
    if (x === null || y === null) { ds.textContent = '坐标不在本活动范围或封闭十进制语法内，请重新输入。'; return; }
    place([x, y]);
  });
  draw.addEventListener('input', e => { if (e.target.type !== 'checkbox') clearDraw(); });
  draw.addEventListener('change', e => { if (e.target.type !== 'checkbox') clearDraw(); });
  draw.addEventListener('reset', () => { resetDrawing(); queueMicrotask(render); });
  $('jw-shape').addEventListener('change', () => {
    $('jw-x').value = ''; $('jw-y').value = ''; $('jw-opening').value = '';
    draw.elements.drawText.value = ''; resetDrawing();
  });
  root.querySelectorAll('[data-compass]').forEach(b => b.addEventListener('click', () => {
    clearDraw();
    const r = number($('jw-opening').value, 0.5, 2);
    if (r === null) { ds.textContent = '请先输入 0.5 到 2 格的圆规开口，最多两位小数。'; return; }
    compass[b.dataset.compass] = r; circle = false;
    $('jw-tool').value = b.dataset.compass; render();
    ds.textContent = '辅助弧已画；请自己找角内的非顶点交点，选它来画射线。辅助弧不代表你已经完成作图。';
  }));
  board.addEventListener('click', e => {
    // SVG aspect ratio can letterbox: invert the actual SVG transformation.
    const p = board.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const ctm = board.getScreenCTM(); if (!ctm) return;
    const local = p.matrixTransform(ctm.inverse());
    const x = Math.round((local.x - 44) / 32 * 10) / 10;
    const y = Math.round((440 - local.y) / 32 * 10) / 10;
    if (x < 0 || x > 16 || y < 0 || y > 12) return;
    $('jw-x').value = String(x); $('jw-y').value = String(y); place([x, y]);
  });
  board.addEventListener('keydown', e => {
    const step = e.shiftKey ? 1 : 0.1;
    const delta = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step]}[e.key];
    if (delta) {
      e.preventDefault(); clearDraw();
      aim = aim.map((n, k) => Math.max(0, Math.min([16, 12][k], Math.round((n + delta[k]) * 10) / 10)));
      $('jw-x').value = String(aim[0]); $('jw-y').value = String(aim[1]); render();
    } else if (e.key === 'Enter') { e.preventDefault(); place(aim.slice()); }
  });
  $('jw-circle').addEventListener('click', () => {
    clearDraw();
    if (!points.i || !points.d || dist(points.i, points.d) <= 1e-8) {
      ds.textContent = '请先标 I 和不同于 I 的垂足 D，再取正半径画圆。'; return;
    }
    circle = true; render(); ds.textContent = '已按你选的 I、D 画圆。请检查它与三边的关系。';
  });
  $('jw-check-draw').addEventListener('click', () => {
    clearDraw();
    if (!['a', 'b', 'i', 'd'].every(k => points[k]) || !circle) {
      ds.textContent = '尚未画全：请亲自画两条射线、标 I、作 D，再取 ID 为半径画圆。'; return;
    }
    const t = tri(), truth = center(t), i = points.i, d = points.d;
    for (const [k, key] of ['a', 'b'].entries()) {
      const end = points[key], dir = sub(end, t[k]);
      if (!inside(end, t) || dist(end, t[k]) < 0.5 || dot(dir, sub(truth, t[k])) <= 0 ||
          dist(foot(truth, t[k], end).p, truth) > TOL) {
        ds.textContent = '请重查 ' + 'AB'[k] + ' 内角平分线的方向；用等距弧找角内交点，不能用边的垂直平分线代替。'; return;
      }
    }
    if (!inside(i, t) || dist(i, truth) > TOL || ['a', 'b'].some((key, k) => dist(foot(i, t[k], points[key]).p, i) > TOL)) {
      ds.textContent = 'I 还不是两条内角平分线在内部的近似交点。请检查交点，内心不按到顶点等距确定。'; return;
    }
    const fd = foot(i, t[1], t[2]);
    if (fd.t <= 0 || fd.t >= 1 || dist(fd.p, d) > TOL) {
      ds.textContent = 'D 还不是 I 到 BC 边段的近似垂足；半径应取垂线段，不取斜线段。'; return;
    }
    const r = dist(i, d);
    if (r <= TOL || t.some((a, k) => {
      const f = foot(i, a, t[(k + 1) % 3]);
      return f.t <= 0 || f.t >= 1 || Math.abs(dist(i, f.p) - r) > TOL;
    })) {
      ds.textContent = '圆还未在容差内同时贴合三边。请检查垂足与半径，不能只检查一边相切。'; return;
    }
    ds.textContent = '本次两线、交点、垂足与三边垂距在 0.18 格容差内相符。这只是近似核图；纸笔尺规痕迹、第三边相切的理由仍须自核，未认证严格作图或证明。';
  });
  $('jw-draw-reference').addEventListener('click', () => {
    if (!edgeTrim(draw.elements.drawText.value)) {
      ds.textContent = '请先写自己的作图理由，再打开准则；任意文字仅供自核。'; return;
    }
    dref.hidden = !dref.hidden;
  });
  render();
}());
