// 8.2 立体图形的直观图 · 3D 舞台页（PY-337）
// 斜二测画法 = 把进深方向「斜 45°、压一半」的平行投影。这里真的对模型做这个剪切变换，
// 同时把镜头转到正前方：实物（或俯视的平面图形）一步步变成课本上的直观图。
// 所有长度、面积都由当前顶点坐标实时算出（投影后的坐标 + 鞋带公式），不写死。
import { createStage, tabs, slider, quiz, renderMath, courseStrip, readout, expose, THREE, noteShow, DUR } from './stage.js';
import { buildRound, faces, polyEdges, inkSegs, polyline, colors } from './solids.js';

const $ = (s) => document.querySelector(s);
const f2 = (x) => x.toFixed(2);
const deg = THREE.MathUtils.degToRad;

const S = createStage($('#stage'), { onHot: () => applyHot(), onReset: () => setView(cur().params.t), ariaLabel: '可拖动旋转的平面图形与立体图形，可以变成斜二测直观图' });
tabs($('#info'));
courseStrip($('#course'), 'b2-8-2');
renderMath($('#pane-how'));
S.shadow.visible = false;

// 斜二测：进深方向画成与 x′ 轴成 45°、长度为原来一半 → 屏幕上每 1 份进深往右、往上各移 K
const K = 0.5 * Math.cos(Math.PI / 4);
// 课本坐标 (x 横向, y 进深, z 竖直) → 世界坐标（y 朝上，镜头在 +z 一侧）
const W = (x, y, z = 0) => new THREE.Vector3(x, z, -y);
// 进度 t 时的剪切矩阵：x += k·进深，竖直 += k·进深（k = t·K）
const shear = (t) => new THREE.Matrix4().set(1, 0, -t * K, 0, 0, 1, -t * K, 0, 0, 0, 1, 0, 0, 0, 0, 1);
// 直观图（t = 1，从正前方看）里一个点的平面坐标
const draw = ([x, y, z = 0]) => [x + K * y, z + K * y];
const len2 = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const len3 = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1], (b[2] ?? 0) - (a[2] ?? 0));
const shoelace = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

const r3 = Math.sqrt(3);
const hexPts = (a) => [[-a, 0], [-a / 2, -(r3 / 2) * a], [a / 2, -(r3 / 2) * a], [a, 0], [a / 2, (r3 / 2) * a], [-a / 2, (r3 / 2) * a]];

// ---------- 平面图形（水平放置） ----------
const PLANE = {
  square: {
    name: '正方形', params: { a: 1.8, t: 0 }, sliders: [['a', '边长', 1, 2.4, 0.1]],
    poly: (p) => [[0, 0], [p.a, 0], [p.a, p.a], [0, p.a]], names: ['O', 'A', 'B', 'C'],
    xseg: (p) => [[0, 0], [p.a, 0]], yseg: (p) => [[0, 0], [0, p.a]],
    note: '边 \\(OA\\) 在 \\(x\\) 轴上，边 \\(OC\\) 在 \\(y\\) 轴上。直观图是一个有 \\(45^\\circ\\) 角的平行四边形，<b>不再是正方形</b>。',
  },
  rect: {
    name: '矩形', params: { a: 2.2, b: 1.4, t: 0 }, sliders: [['a', '长（x 方向）', 1, 2.6, 0.1], ['b', '宽（y 方向）', 0.8, 2.2, 0.1]],
    poly: (p) => [[0, 0], [p.a, 0], [p.a, p.b], [0, p.b]], names: ['O', 'A', 'B', 'C'],
    xseg: (p) => [[0, 0], [p.a, 0]], yseg: (p) => [[0, 0], [0, p.b]],
    note: '长在 \\(x\\) 轴上不变，宽在 \\(y\\) 轴上画成一半。',
  },
  tri: {
    name: '正三角形', params: { a: 2, t: 0 }, sliders: [['a', '边长', 1.2, 2.6, 0.1]],
    poly: (p) => [[-p.a / 2, 0], [p.a / 2, 0], [0, (r3 / 2) * p.a]], names: ['A', 'B', 'C'], origin: true,
    xseg: (p) => [[-p.a / 2, 0], [p.a / 2, 0]], yseg: (p) => [[0, 0], [0, (r3 / 2) * p.a]],
    note: '取边 \\(AB\\) 所在直线为 \\(x\\) 轴、\\(AB\\) 边上的高 \\(OC\\) 所在直线为 \\(y\\) 轴。高 \\(\\tfrac{\\sqrt3}{2}a\\) 画成 \\(\\tfrac{\\sqrt3}{4}a\\)。',
  },
  hex: {
    name: '正六边形', params: { a: 1.1, t: 0 }, sliders: [['a', '边长', 0.6, 1.3, 0.05]],
    poly: (p) => hexPts(p.a), names: ['A', 'B', 'C', 'D', 'E', 'F'], origin: true, mn: true,
    xseg: (p) => [[-p.a, 0], [p.a, 0]], yseg: (p) => [[0, -(r3 / 2) * p.a], [0, (r3 / 2) * p.a]],
    note: '课本例 1 的取法：对角线 \\(AD\\) 在 \\(x\\) 轴上（长 \\(2a\\) 不变），对边中点连线 \\(MN\\) 在 \\(y\\) 轴上（长 \\(\\sqrt3a\\)，画成 \\(\\tfrac{\\sqrt3}{2}a\\)）。',
  },
  trap: {
    name: '直角梯形', params: { a: 2.2, c: 1, b: 1.4, t: 0 },
    sliders: [['a', '下底', 1.6, 2.6, 0.1], ['c', '上底', 0.6, 1.4, 0.1], ['b', '高（y 方向）', 0.8, 2, 0.1]],
    poly: (p) => [[0, 0], [p.a, 0], [p.c, p.b], [0, p.b]], names: ['O', 'A', 'B', 'C'],
    xseg: (p) => [[0, 0], [p.a, 0]], yseg: (p) => [[0, 0], [0, p.b]],
    note: '下底 \\(OA\\) 在 \\(x\\) 轴上，直角腰 \\(OC\\) 在 \\(y\\) 轴上。上底 \\(CB\\) 平行于 \\(x\\) 轴，画出来也不变。',
  },
};

// ---------- 立体图形 ----------
// 顶点用课本坐标 [x, y(进深), z(竖直)]
const prismFaces = (base, h) => {
  const top = base.map(([x, y]) => [x, y, h]);
  const bot = base.map(([x, y]) => [x, y, 0]);
  return { base: [bot, top], side: bot.map((p, i) => [p, bot[(i + 1) % bot.length], top[(i + 1) % bot.length], top[i]]) };
};
const SOLID = {
  box: {
    name: '长方体', params: { a: 1.8, b: 1.4, c: 1.2, t: 0 },
    sliders: [['a', '长（x）', 1, 2.2, 0.1], ['b', '宽（y）', 0.8, 2, 0.1], ['c', '高（z）', 0.8, 2, 0.1]],
    faces: (p) => prismFaces([[0, 0], [p.a, 0], [p.a, p.b], [0, p.b]], p.c),
    xseg: (p) => [[0, 0, 0], [p.a, 0, 0]], yseg: (p) => [[p.a, 0, 0], [p.a, p.b, 0]], zseg: (p) => [[p.a, 0, 0], [p.a, 0, p.c]],
    front: (p) => [[0, 0, 0], [p.a, 0, 0], [p.a, 0, p.c], [0, 0, p.c]],
    note: '正面（平行于 \\(xOz\\) 的面）画出来是<b>真实形状</b>；上下底面变成 \\(45^\\circ\\) 的平行四边形。',
  },
  hexprism: {
    name: '正六棱柱', params: { a: 0.9, h: 1.6, t: 0 }, sliders: [['a', '底面边长', 0.6, 1.2, 0.05], ['h', '高', 0.8, 2, 0.1]],
    faces: (p) => prismFaces(hexPts(p.a), p.h),
    xseg: (p) => [[-p.a, 0, 0], [p.a, 0, 0]], yseg: (p) => [[0, -(r3 / 2) * p.a, 0], [0, (r3 / 2) * p.a, 0]], zseg: (p) => [[0, 0, 0], [0, 0, p.h]],
    note: '先按平面图形的画法画底面正六边形，再在每个顶点画竖直的侧棱（长度不变），最后连上底面。',
  },
  pyr: {
    name: '正四棱锥', params: { a: 1.6, h: 1.8, t: 0 }, sliders: [['a', '底面边长', 1, 2.2, 0.1], ['h', '高', 1, 2.4, 0.1]],
    faces: (p) => {
      const s = p.a / 2, bot = [[-s, -s, 0], [s, -s, 0], [s, s, 0], [-s, s, 0]], top = [0, 0, p.h];
      return { base: [bot], side: bot.map((q, i) => [q, bot[(i + 1) % 4], top]) };
    },
    xseg: (p) => [[-p.a / 2, -p.a / 2, 0], [p.a / 2, -p.a / 2, 0]], yseg: (p) => [[p.a / 2, -p.a / 2, 0], [p.a / 2, p.a / 2, 0]], zseg: (p) => [[0, 0, 0], [0, 0, p.h]],
    note: '底面正方形按平面画法画；过底面中心 \\(O\\) 画竖直的 \\(z\\) 轴，在上面截取高 \\(h\\)（不变）得到顶点。',
  },
  cone: {
    name: '圆锥', params: { R: 1, h: 1.9, t: 0 }, sliders: [['R', '底面半径', 0.6, 1.3, 0.05], ['h', '高', 1, 2.4, 0.1]],
    round: true,
    xseg: (p) => [[-p.R, 0, 0], [p.R, 0, 0]], yseg: (p) => [[0, -p.R, 0], [0, p.R, 0]], zseg: (p) => [[0, 0, 0], [0, 0, p.h]],
    note: '底面的圆画出来变扁：横向直径 \\(2R\\) 不变，进深方向直径画成 \\(R\\)，课本用椭圆模板画。',
  },
};
const SHAPES = { ...PLANE, ...SOLID };
const isPlane = (k = curKey) => k in PLANE;
const ORDER = [Object.keys(PLANE), Object.keys(SOLID)];
let curKey = new URLSearchParams(location.hash.slice(1)).get('s') || 'square';
if (!SHAPES[curKey]) curKey = 'square';
const cur = () => SHAPES[curKey];

// ---------- 画 ----------
let anchors = {};
let segInks = {};
const RULES = String.raw`<p class="def">① 在已知图形中取互相垂直的 \(x\) 轴和 \(y\) 轴，交于点 \(O\)；画成 \(x'\) 轴和 \(y'\) 轴，交于 \(O'\)，使 \(\angle x'O'y'=45^\circ\)（或 \(135^\circ\)）。<br>
② 平行于 \(x\) 轴或 \(y\) 轴的线段，画成平行于 \(x'\) 轴或 \(y'\) 轴的线段。<br>
③ 平行于 \(x\) 轴的线段<b>长度不变</b>；平行于 \(y\) 轴的线段<b>长度变为原来的一半</b>。</p>`;

const AREA = String.raw`<p class="l3-note">面积关系：底不变，高 \(h\) 画成斜 \(45^\circ\) 的 \(\tfrac h2\)，它的竖直高度只剩 \(\tfrac h2\sin45^\circ=\tfrac{\sqrt2}{4}h\)，所以 \(S'=\tfrac{\sqrt2}{4}S\)。</p>`;

function axesSegs(ext) {
  const s = [[W(ext.x0, 0), W(ext.x1, 0)], [W(0, ext.y0), W(0, ext.y1)]];
  if (ext.z1) s.push([W(0, 0, 0), W(0, 0, ext.z1)]);
  return s;
}
function extents(pts, solid) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), zs = pts.map((p) => p[2] ?? 0);
  return { x0: Math.min(0, ...xs) - 0.35, x1: Math.max(...xs) + 0.6, y0: Math.min(0, ...ys) - 0.3, y1: Math.max(...ys) + 0.6, z1: solid ? Math.max(...zs) + 0.6 : 0 };
}

function rebuild() {
  S.clear();
  const sh = cur(), p = sh.params, C = colors(S);
  const M = shear(p.t);
  const obj = new THREE.Group();
  obj.matrixAutoUpdate = false;
  obj.matrix.copy(M);
  S.root.add(obj);
  const at = (q) => W(...q).applyMatrix4(M);
  let all;
  segInks = {};
  if (isPlane()) {
    const poly = sh.poly(p);
    all = poly;
    const pts = poly.map((q) => W(...q));
    obj.add(faces(S, [pts], C.side, 'side'));
    obj.add(inkSegs(S, polyline(pts, true), S.pal.fg, { width: 2.6, hidden: false }));
    if (sh.origin) obj.add(inkSegs(S, [sh.yseg(p).map((q) => W(...q))].map(([a, b]) => [a, b]), S.pal.b, { width: 2, dashed: true, hidden: false }));
  } else if (sh.round) {
    const m = buildRound(S, { R: p.R, r: 0, h: p.h, spin: 1 });
    m.group.traverse((o) => { if (o.material?.isLineMaterial && o.material.color.getHexString() === new THREE.Color(S.pal.c).getHexString()) o.visible = false; }); // 去掉自带的轴
    obj.add(m.group);
    all = [[-p.R, -p.R, 0], [p.R, p.R, p.h]];
    obj.add(inkSegs(S, [sh.zseg(p).map((q) => W(...q))], S.pal.fg, { width: 1.6, dashed: true, hidden: false }));
  } else {
    const fs = sh.faces(p);
    const toW = (poly) => poly.map((q) => W(...q));
    const side = fs.side.map(toW), base = fs.base.map(toW);
    obj.add(faces(S, side, C.side, 'side'), faces(S, base, C.base, 'base'));
    obj.add(inkSegs(S, polyEdges([...base, ...side]), S.pal.fg));
    all = [...fs.base.flat(), ...fs.side.flat()];
    if (curKey === 'pyr') obj.add(inkSegs(S, [sh.zseg(p).map((q) => W(...q))], S.pal.fg, { width: 1.6, dashed: true, hidden: false }));
  }
  // 坐标轴（穿过物体也画出来，像课本作图时那样）
  const ext = extents(all, !isPlane());
  const axes = inkSegs(S, axesSegs(ext), S.pal.muted, { width: 1.3, hidden: false });
  axes.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 8; } });
  obj.add(axes);
  // 平行于 x、y（、z）轴的那几条线段，加粗上色
  for (const [k, color] of [['x', S.pal.c], ['y', S.pal.b], ['z', S.pal.a]]) {
    const seg = sh[`${k}seg`]?.(p);
    if (!seg) continue;
    const g = inkSegs(S, [seg.map((q) => W(...q))], color, { width: 4, hidden: false });
    g.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 9; } });
    obj.add(g);
    segInks[k] = { g, color };
  }
  // 原图里两轴的直角记号（快画完时消失）
  if (p.t < 0.5) {
    const s = 0.18;
    obj.add(inkSegs(S, polyline([W(s, 0), W(s, s), W(0, s)]), S.pal.muted, { width: 1.4, hidden: false }));
  }
  // 画完后：∠x′O′y′ = 45° 的角弧（在画纸平面里，不随模型剪切）
  if (p.t > 0.98) {
    const r = 0.42, arc = [];
    for (let i = 0; i <= 24; i++) { const th = (Math.PI / 4) * (i / 24); arc.push(new THREE.Vector3(r * Math.cos(th), r * Math.sin(th), 0.01)); }
    const g = inkSegs(S, polyline(arc), S.pal.no, { width: 2.2, hidden: false });
    g.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 10; } });
    S.root.add(g);
  }
  const mid = (seg) => at([(seg[0][0] + seg[1][0]) / 2, (seg[0][1] + seg[1][1]) / 2, ((seg[0][2] ?? 0) + (seg[1][2] ?? 0)) / 2]);
  anchors = {
    x: mid(sh.xseg(p)), y: mid(sh.yseg(p)), z: sh.zseg ? mid(sh.zseg(p)) : null,
    arc: new THREE.Vector3(0.42 * Math.cos(Math.PI / 8), 0.42 * Math.sin(Math.PI / 8), 0),
    shape: at(all.reduce((s, q) => [s[0] + q[0] / all.length, s[1] + q[1] / all.length, s[2] + (q[2] ?? 0) / all.length], [0, 0, 0])),
    O: at([0, 0, 0]), X: at([ext.x1, 0, 0]), Y: at([0, ext.y1, 0]), Z: ext.z1 ? at([0, 0, ext.z1]) : null,
    verts: isPlane() ? sh.poly(p).map(at) : [],
    M: sh.mn ? at(sh.yseg(p)[0]) : null, N: sh.mn ? at(sh.yseg(p)[1]) : null,
  };
  applyHot();
}

function applyHot() {
  for (const [k, { g, color }] of Object.entries(segInks)) g.userData.setColor(S.hot === k ? S.pal.hl : color);
}

function setView(t) {
  const plane = isPlane();
  const elev = plane ? 89.5 * (1 - t) : 26 * (1 - t);
  const az = plane ? 0 : 36 * (1 - t);
  const off = new THREE.Vector3().setFromSpherical(new THREE.Spherical(20, deg(90 - elev), deg(az)));
  S.camera.position.copy(S.controls.target).add(off);
  S.camera.lookAt(S.controls.target);
}

// 取景：原图和直观图都要装得下
function frameAll() {
  const sh = cur(), p = sh.params;
  let pts;
  if (isPlane()) pts = sh.poly(p).map((q) => [...q, 0]);
  else if (sh.round) pts = [[-p.R, -p.R, 0], [p.R, p.R, 0], [0, 0, p.h]];
  else pts = Object.values(sh.faces(p)).flat(2);
  const ext = extents(pts, !isPlane());
  pts = [...pts, [ext.x0, 0, 0], [ext.x1, 0, 0], [0, ext.y0, 0], [0, ext.y1, 0], [0, 0, ext.z1]];
  const box = new THREE.Box3();
  for (const t of [0, 1]) for (const q of pts) box.expandByPoint(W(...q).applyMatrix4(shear(t)));
  const sph = box.getBoundingSphere(new THREE.Sphere());
  S.frame(sph.center, sph.radius * 0.82, true);
  setView(p.t);
}

// ---------- 读数 ----------
function measure() {
  const sh = cur(), p = sh.params;
  const lenRow = (label, key, seg) => {
    const a = seg(p), o = len3(a[0], a[1]), d = len2(draw(a[0]), draw(a[1]));
    return [label, `${f2(o)} \\to ${f2(d)}`, key, d];
  };
  const rows = [lenRow('平行于 \\(x\\) 轴', 'a2', sh.xseg), lenRow('平行于 \\(y\\) 轴', 'b2', sh.yseg)];
  if (isPlane()) {
    const poly = sh.poly(p);
    const S0 = shoelace(poly), S1 = shoelace(poly.map(draw));
    rows.push(['原图面积 \\(S\\)', f2(S0), 'S', S0], ['直观图面积 \\(S\'\\)', f2(S1), 'S2', S1],
      ['\\(S\'\\div S\\)', `${(S1 / S0).toFixed(4)}\\approx\\tfrac{\\sqrt2}{4}`, 'ratio', S1 / S0]);
  } else {
    rows.push(lenRow('竖直（\\(z\\) 轴）', 'c2', sh.zseg));
    if (sh.front) { const fr = shoelace(sh.front(p).map(([x, , z]) => [x, z])); rows.push(['正面画出的面积', f2(fr), 'front', fr]); }
    // 底面画出来的面积：多边形用投影后的坐标算；圆用剪切变换的行列式（面积放缩倍数）
    const det = 1 * K - K * 0;
    const top2 = sh.round ? Math.PI * p.R * p.R * det : shoelace(sh.faces(p).base[0].map(draw));
    rows.push(['底面画出的面积', f2(top2), 'top2', top2]);
  }
  readout($('#ro'), rows);
  $('#ro-note').innerHTML = '「→」左边是原图里的长度，右边是直观图里画出来的长度。';
}

// ---------- 标注、标签 ----------
function setLabels() {
  const sh = cur();
  const A = (k) => () => anchors[k];
  const plane = isPlane();
  S.setCallouts([
    { id: 'x', title: '平行于 x 轴', text: '画出来长度不变', at: A('x'), dx: 90, dy: 70 },
    { id: 'y', title: '平行于 y 轴', text: '斜成 45°，长度减半', at: A('y'), dx: -150, dy: -50 },
    ...(plane ? [] : [{ id: 'z', title: '竖直的线段', text: '仍竖直，长度不变', at: A('z'), dx: 120, dy: -70 }]),
    { id: 'ang', title: '∠x′O′y′ = 45°', text: '画纸上 x′ 轴与 y′ 轴的夹角', at: A('arc'), dx: 110, dy: 60, when: () => sh.params.t > 0.98 },
    ...(plane ? [{ id: 'true', title: '从正上方看', text: '这是原图的真实形状', at: A('shape'), dx: 120, dy: -80, when: () => sh.params.t < 0.02 }] : []),
  ]);
  S.setTags([
    ...(plane && sh.names[0] === 'O' ? [] : [{ text: 'O', at: A('O'), dx: -16, dy: 20 }]),   // 顶点就叫 O 时不重复
    { text: 'x', at: A('X'), cls: 'c' },
    { text: 'y', at: A('Y'), cls: 'b' },
    ...(plane ? [] : [{ text: 'z', at: A('Z'), cls: 'a' }]),
    ...(plane ? sh.names.map((n, i) => ({ text: n, at: () => anchors.verts[i], dx: i === 0 && !sh.origin ? -16 : 6, dy: i === 0 && !sh.origin ? 20 : -4 })) : []),
    ...(sh.mn ? [{ text: 'M', at: A('M'), dx: 6, dy: 20 }, { text: 'N', at: A('N') }] : []),
  ]);
  primeTags();
}
// 画完后名字加撇：O → O′
function primeTags() {
  const t = cur().params.t;
  for (const el of document.querySelectorAll('.l3-tag')) {
    const base = el.dataset.base || (el.dataset.base = el.textContent);
    el.textContent = t > 0.5 ? `${base}′` : base;
  }
}

// ---------- 控件 ----------
let tSlider = null;
let busy = false;
async function play(btn) {
  if (busy) return;
  busy = true;
  const p = cur().params, from = p.t, to = p.t > 0.5 ? 0 : 1;
  // 被打断（切形体、「在模型上看」）时：同步把原形体记到终点，之后不碰任何控件（busy 已在 select 里放开）
  const done = await S.tween(DUR.build, (u) => { p.t = from + (to - from) * u; tSlider.set(p.t); rebuild(); setView(p.t); primeTags(); }, undefined, () => { p.t = to; });
  if (!done) return;
  p.t = to;
  tSlider.set(to);
  rebuild(); setView(to); primeTags();
  btn.textContent = to ? '↺ 回到实物' : '▶ 画成直观图';
  busy = false;
}
function mountControls() {
  const host = $('#ctl');
  host.innerHTML = '';
  const sh = cur();
  for (const [key, label, min, max, step] of sh.sliders) {
    slider(host, { key, label, min, max, step, value: sh.params[key], fmt: (x) => (step < 0.1 ? x.toFixed(2) : x.toFixed(1)) }, (k, v) => {
      sh.params[k] = v;
      rebuild(); frameAll(); measure();
    });
  }
  tSlider = slider(host, { key: 't', label: '画法进度', min: 0, max: 1, step: 0.01, value: sh.params.t, fmt: (x) => `${Math.round(x * 100)}%` }, (k, v) => {
    sh.params.t = v;
    rebuild(); setView(v); primeTags();
    btn.textContent = v > 0.5 ? '↺ 回到实物' : '▶ 画成直观图';
  });
  const row = host.appendChild(Object.assign(document.createElement('div'), { className: 'l3-row' }));
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'l3-btn primary';
  btn.textContent = sh.params.t > 0.5 ? '↺ 回到实物' : '▶ 画成直观图';
  btn.addEventListener('click', () => play(btn));
  row.appendChild(btn);
}

function select(key) {
  S.cancelTweens();   // 动画播到一半切形体：停掉旧动画，免得它继续改新形体的滑块
  busy = false;
  curKey = key;
  history.replaceState(null, '', `#s=${key}`);
  for (const c of document.querySelectorAll('#chips button')) c.classList.toggle('on', c.dataset.k === key);
  const sh = cur();
  $('#pane-def').innerHTML = `<h3>${sh.name}${isPlane() ? '（水平放置）' : ''}</h3>${RULES}${isPlane() ? '' : String.raw`<p class="def" style="margin-top:8px">④ 立体图形再加竖直的 \(z\) 轴，画成 \(z'\) 轴，垂直于 \(x'\) 轴；平行于 \(z\) 轴的线段，方向和<b>长度都不变</b>。</p>`}
    <p>${sh.note}</p>
    ${AREA}`;
  renderMath($('#pane-def'));
  mountControls();
  setLabels();
  rebuild();
  measure();
  frameAll();
}

const chips = $('#chips');
ORDER.forEach((grp, gi) => {
  if (gi) chips.appendChild(Object.assign(document.createElement('span'), { className: 'gap' }));
  const g = document.createElement('span');
  g.className = 'grp';
  for (const k of grp) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.k = k; b.textContent = SHAPES[k].name;
    b.addEventListener('click', () => select(k));
    g.appendChild(b);
  }
  chips.appendChild(g);
});

// 先停掉正在播的动画（它会把自己的形体记到终点），再写入题目的参数，免得被旧动画改回去
const setAndShow = (key, vals) => () => { S.cancelTweens(); Object.assign(SHAPES[key].params, vals); noteShow(key, vals); select(key); };
quiz($('#pane-quiz'), [
  {
    q: '边长为 2 的正三角形水平放置，用斜二测画法画出的直观图面积是？',
    opts: ['\\(\\dfrac{\\sqrt6}{4}\\)', '\\(\\dfrac{\\sqrt3}{4}\\)', '\\(\\dfrac{\\sqrt6}{2}\\)'], answer: 0,
    why: '原图面积 \\(S=\\frac{\\sqrt3}{4}\\times2^2=\\sqrt3\\)，直观图面积 \\(S\'=\\frac{\\sqrt2}{4}S=\\frac{\\sqrt6}{4}\\approx0.61\\)。',
    show: setAndShow('tri', { a: 2, t: 1 }), showLabel: '在模型上看（边长 2）',
  },
  {
    q: '一个平面图形的斜二测直观图是边长为 1 的正方形 \\(O\'A\'B\'C\'\\)（\\(O\'A\'\\) 在 \\(x\'\\) 轴上，正方形在 \\(x\'\\) 轴上方），原图形的面积是？',
    opts: ['\\(\\sqrt2\\)', '\\(2\\sqrt2\\)', '\\(4\\)'], answer: 1,
    why: '反过来用 \\(S=\\frac{4}{\\sqrt2}S\'=2\\sqrt2\\,S\'=2\\sqrt2\\)。也可以直接还原：正方形在 \\(x\'\\) 轴上方，对角线 \\(O\'B\'=\\sqrt2\\) 与 \\(x\'\\) 轴成 \\(45^\\circ\\)，正好落在 \\(y\'\\) 轴上，原图里 \\(OB=2\\sqrt2\\) 且垂直于 \\(OA=1\\)，原图是底 1、高 \\(2\\sqrt2\\) 的平行四边形。',
  },
  {
    q: '原图中两条互相垂直的线段，在斜二测直观图中一定还互相垂直吗？',
    opts: ['一定', '不一定'], answer: 1,
    why: '比如分别平行于 \\(x\\) 轴、\\(y\\) 轴的两条线段，画出来夹角是 \\(45^\\circ\\)。斜二测只保留<b>平行关系</b>和 \\(x\\) 方向的长度，不保留角度。',
    show: setAndShow('square', { t: 1 }), showLabel: '看正方形的直观图',
  },
  {
    q: '原图中平行于 \\(y\\) 轴、长为 4 的线段，在直观图中的长度是？',
    opts: ['4', '2', '\\(\\sqrt2\\)'], answer: 1,
    why: '平行于 \\(y\\) 轴的线段长度变为原来的一半，\\(4\\div2=2\\)。\\(\\sqrt2\\) 是这条斜线段在画面上的<b>竖直高度</b> \\(2\\sin45^\\circ\\)，算面积时才用到，不是它的长度。',
  },
]);
renderMath($('#pane-quiz'));

select(curKey);
expose({ page: 'b2-8-2', modes: Object.keys(SHAPES), select: (k) => select(k), key: () => curKey, params: () => cur().params, stage: S });
