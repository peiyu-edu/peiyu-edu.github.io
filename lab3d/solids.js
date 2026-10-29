// 立体几何道具库（PY-331）。坐标：y 朝上，底面放在 y = 0。
// 每个 build* 返回 { group, anchors }，anchors 是各部件上用于标注的点（世界坐标）。
// 所有尺寸都由参数按公式算出，不写死。
import { THREE } from './stage.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;

export function tint(S, color, amt) {
  return new THREE.Color(color).lerp(new THREE.Color(S.pal.dark ? '#1D2622' : '#ffffff'), amt);
}
export const colors = (S) => ({
  side: tint(S, S.pal.a, S.pal.dark ? 0.25 : 0.42),
  base: tint(S, S.pal.hl, S.pal.dark ? 0.25 : 0.32),
  gen: tint(S, S.pal.b, S.pal.dark ? 0.2 : 0.35),
  hot: new THREE.Color(S.pal.hl),
});

// ---------- 基础件 ----------
function polysGeometry(polys) {
  const pos = [];
  for (const p of polys) {
    for (let i = 1; i < p.length - 1; i++) pos.push(p[0].x, p[0].y, p[0].z, p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}
function faces(S, polys, color, name) {
  const m = new THREE.Mesh(polysGeometry(polys), S.toon(color, { side: THREE.DoubleSide }));
  m.name = name;
  return m;
}
function polyEdges(polys) {
  const seen = new Map();
  const key = (p) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
  for (const p of polys) {
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const k = [key(a), key(b)].sort().join('|');
      if (!seen.has(k)) seen.set(k, [a, b]);
    }
  }
  return [...seen.values()];
}
function inkSegs(S, segs, color, o) {
  const g = S.ink(color, o);
  g.userData.set(segs);
  return g;
}
function polyline(pts, closed = false) {
  const s = [];
  for (let i = 0; i < pts.length - 1; i++) s.push([pts[i], pts[i + 1]]);
  if (closed && pts.length > 2) s.push([pts[pts.length - 1], pts[0]]);
  return s;
}
// 底面正多边形：一条边正对 +z（正对镜头）
export function ngon(n, R, y = 0, scale = 1, shift = V(0, 0, 0)) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const t = Math.PI / n + (TAU * k) / n; // 第 0 条边以 0 为中心
    pts.push(V(R * scale * Math.sin(t) + shift.x, y, R * scale * Math.cos(t) + shift.z));
  }
  return pts.reverse(); // 从上往下看逆时针
}
const circR = (n, a) => a / (2 * Math.sin(Math.PI / n));
const apo = (n, a) => a / (2 * Math.tan(Math.PI / n));
const avg = (pts) => pts.reduce((s, p) => s.add(p), V(0, 0, 0)).multiplyScalar(1 / pts.length);
const mid = (a, b) => a.clone().add(b).multiplyScalar(0.5);
// 离镜头最近的那个顶点（用于把标注放在看得见的地方）
function frontIdx(pts, cam) {
  const d = cam ? cam.position.clone().setY(0).normalize() : V(0.6, 0, 0.8);
  let bi = 0, bv = -Infinity;
  pts.forEach((p, i) => { const s = p.x * d.x + p.z * d.z; if (s > bv) { bv = s; bi = i; } });
  return bi;
}

// ---------- 多面体 ----------
// 棱柱：n 边形底面，边长 a，高 h；shear 让它变成斜棱柱（侧棱仍平行）
export function buildPrism(S, { n = 4, a = 1.4, h = 1.8, shear = 0 }) {
  const C = colors(S);
  const R = circR(n, a);
  const sh = V(shear * R * 0.9, 0, -shear * R * 0.35);
  const bot = ngon(n, R, 0);
  const top = bot.map((p) => p.clone().add(V(sh.x, h, sh.z)));
  const sides = bot.map((p, i) => [p, bot[(i + 1) % n], top[(i + 1) % n], top[i]]);
  const group = new THREE.Group();
  const mSide = faces(S, sides, C.side, 'side');
  const mBase = faces(S, [bot, top], C.base, 'base');
  group.add(mSide, mBase, inkSegs(S, polyEdges([bot, top, ...sides]), S.pal.fg));
  const fi = frontIdx(bot, S.camera);
  const fj = (fi + 1) % n;
  return {
    group, parts: { side: mSide, base: mBase },
    anchors: {
      top: avg(top), bottom: avg(bot), vertex: top[fi].clone(),
      edge: mid(bot[fi], top[fi]), face: avg([bot[fi], bot[fj], top[fj], top[fi]]),
      height: V(sh.x, h * 0.5, sh.z),
    },
  };
}

// 棱锥
export function buildPyramid(S, { n = 4, a = 1.6, h = 1.9 }) {
  const C = colors(S);
  const R = circR(n, a);
  const bot = ngon(n, R, 0);
  const apex = V(0, h, 0);
  const sides = bot.map((p, i) => [p, bot[(i + 1) % n], apex]);
  const group = new THREE.Group();
  const mSide = faces(S, sides, C.side, 'side');
  const mBase = faces(S, [bot], C.base, 'base');
  group.add(mSide, mBase, inkSegs(S, polyEdges([bot, ...sides]), S.pal.fg));
  const fi = frontIdx(bot, S.camera);
  const fj = (fi + 1) % n;
  return {
    group, parts: { side: mSide, base: mBase },
    anchors: { apex, bottom: avg(bot), edge: mid(bot[fi], apex), face: avg([bot[fi], bot[fj], apex]) },
  };
}

// 棱台：由棱锥截得，k = 上底边长 / 下底边长；ext 时把侧棱延长到交点 S
export function buildFrustumPoly(S, { n = 4, a = 1.8, k = 0.5, h = 1.2, ext = false }) {
  const C = colors(S);
  const R = circR(n, a);
  const H = h / (1 - k); // 原棱锥的高
  const bot = ngon(n, R, 0);
  const top = ngon(n, R, h, k);
  const apex = V(0, H, 0);
  const sides = bot.map((p, i) => [p, bot[(i + 1) % n], top[(i + 1) % n], top[i]]);
  const group = new THREE.Group();
  const mSide = faces(S, sides, C.side, 'side');
  const mBase = faces(S, [bot, top], C.base, 'base');
  group.add(mSide, mBase, inkSegs(S, polyEdges([bot, top, ...sides]), S.pal.fg));
  if (ext) {
    group.add(inkSegs(S, top.map((p) => [p, apex]), S.pal.no, { width: 1.8, dashed: true, hidden: false }));
    const cap = faces(S, top.map((p, i) => [p, top[(i + 1) % n], apex]), tint(S, S.pal.no, 0.8), 'cap');
    cap.material.transparent = true; cap.material.opacity = 0.35; cap.material.depthWrite = false;
    group.add(cap);
  }
  const fi = frontIdx(bot, S.camera);
  const fj = (fi + 1) % n;
  return {
    group, parts: { side: mSide, base: mBase },
    anchors: { top: avg(top), bottom: avg(bot), edge: mid(bot[fi], top[fi]), face: avg([bot[fi], bot[fj], top[fj], top[fi]]), apex },
  };
}

// ---------- 旋转体 ----------
// profile：旋转体在过轴平面里的截线 [{r, y}]；t = 已经转过的比例（0..1）
function revolveRims(rings, t0, len, seg = 96) {
  const segs = [];
  for (const { r, y } of rings) {
    if (r <= 1e-6) continue;
    const m = Math.max(2, Math.round((seg * len) / TAU));
    const pts = [];
    for (let i = 0; i <= m; i++) { const th = t0 + (len * i) / m; pts.push(V(r * Math.sin(th), y, r * Math.cos(th))); }
    segs.push(...polyline(pts));
  }
  return segs;
}
const at = (r, y, th) => V(r * Math.sin(th), y, r * Math.cos(th));

function lateral(S, rTop, rBot, h, t0, len, color) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, 96, 1, true, t0, len);
  g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, S.toon(color, { side: THREE.DoubleSide }));
  m.name = 'side';
  return m;
}
function cap(S, r, y, up, t0, len, color) {
  if (r <= 1e-6) return null;
  const start = up ? t0 - Math.PI / 2 : Math.PI / 2 - t0 - len;
  const g = new THREE.CircleGeometry(r, 96, start, len);
  g.rotateX(up ? -Math.PI / 2 : Math.PI / 2);
  g.translate(0, y, 0);
  const m = new THREE.Mesh(g, S.toon(color, { side: THREE.DoubleSide }));
  m.name = 'base';
  return m;
}

// 圆柱 / 圆锥 / 圆台统一：下底半径 R，上底半径 r（r = R 圆柱，r = 0 圆锥）
// spin（0..1）：旋转生成的进度；1 表示完整的旋转体
export function buildRound(S, { R = 1, r = 1, h = 2, spin = 1, showGen = false }) {
  const C = colors(S);
  const len = Math.max(1e-3, spin * TAU);
  const t0 = 0;
  const group = new THREE.Group();
  const side = lateral(S, r, R, h, t0, len, C.side);
  group.add(side);
  if (spin >= 0.999) S.outline(side);
  const bot = cap(S, R, 0, false, t0, len, C.base);
  const top = cap(S, r, h, true, t0, len, C.base);
  if (bot) group.add(bot);
  if (top) group.add(top);
  group.add(inkSegs(S, revolveRims([{ r: R, y: 0 }, { r, y: h }], t0, len), S.pal.fg));
  const thE = t0 + len;
  const gen = [V(0, 0, 0), at(R, 0, thE), at(r, h, thE), V(0, h, 0)];
  if (showGen || spin < 0.999) {
    const pts = r > 1e-6 ? gen : [gen[0], gen[1], gen[3]];
    const gm = faces(S, [pts], C.gen, 'gen');
    gm.material.transparent = true; gm.material.opacity = 0.85;
    group.add(gm, inkSegs(S, polyline(pts, true), S.pal.b, { width: 2.6 }));
    if (spin < 0.999) {
      const g0 = r > 1e-6 ? [V(0, 0, 0), at(R, 0, t0), at(r, h, t0), V(0, h, 0)] : [V(0, 0, 0), at(R, 0, t0), V(0, h, 0)];
      group.add(inkSegs(S, polyline(g0), S.pal.b, { width: 1.4, dashed: true, hidden: false }));
    }
  }
  // 轴
  group.add(inkSegs(S, [[V(0, -0.35, 0), V(0, h + 0.45, 0)]], S.pal.c, { width: 1.6, dashed: true, hidden: false }));
  const fr = Math.atan2(S.camera.position.x, S.camera.position.z); // 正对镜头的方向
  const thF = spin >= 0.999 ? fr : thE;
  const thG = spin >= 0.999 ? fr + 0.85 : thE; // 画出来的那条母线
  if (spin >= 0.999) group.add(inkSegs(S, [[at(R, 0, thG), at(r, h, thG)]], S.pal.b, { width: 3.4 }));
  return {
    group, parts: { side, base: bot },
    anchors: {
      axis: V(0, h + 0.3, 0), bottom: at(R, 0, thF - 0.5), top: V(0, h, 0),
      gen: mid(at(R, 0, thG), at(r, h, thG)), apex: V(0, h, 0), genFace: spin >= 0.999 ? at((R + r) / 2, h / 2, fr - 0.6) : avg(gen),
    },
  };
}

export function buildSphere(S, { R = 1.2, spin = 1, showGen = false }) {
  const C = colors(S);
  const len = Math.max(1e-3, spin * TAU);
  const group = new THREE.Group();
  const g = new THREE.SphereGeometry(R, 72, 48, Math.PI / 2, len);
  g.translate(0, R, 0);
  const m = new THREE.Mesh(g, S.toon(C.side, { side: THREE.DoubleSide }));
  m.name = 'side';
  group.add(m);
  if (spin >= 0.999) S.outline(m);
  const thE = len;
  const semi = [];
  for (let i = 0; i <= 48; i++) { const b = -Math.PI / 2 + (Math.PI * i) / 48; semi.push(at(R * Math.cos(b), R + R * Math.sin(b), thE)); }
  if (showGen || spin < 0.999) {
    const gm = faces(S, [[V(0, 0, 0), ...semi, V(0, 2 * R, 0)]], C.gen, 'gen');
    gm.material.transparent = true; gm.material.opacity = 0.85;
    group.add(gm, inkSegs(S, polyline([...semi, V(0, 0, 0)]), S.pal.b, { width: 2.6 }));
  }
  group.add(inkSegs(S, revolveRims([{ r: R, y: R }], 0, len), S.pal.fg, { width: 1.8 }));
  group.add(inkSegs(S, [[V(0, -0.35, 0), V(0, 2 * R + 0.45, 0)]], S.pal.c, { width: 1.6, dashed: true, hidden: false }));
  const fr = Math.atan2(S.camera.position.x, S.camera.position.z);
  return {
    group, parts: { side: m },
    anchors: { center: V(0, R, 0), surf: at(R * Math.cos(0.5), R + R * Math.sin(0.5), fr), radius: at(R / 2, R, fr), axis: V(0, 2 * R + 0.3, 0) },
  };
}

// ---------- 展开（8.3） ----------
// 圆柱侧面"伸直"：保持正前方那条母线不动，曲率半径从 R 逐渐变成无穷大（全程不拉伸）
export function buildCylinderUnfold(S, { R = 1, h = 2, e = 0 }) {
  const C = colors(S);
  const capT = Math.min(1, e / 0.4);           // 前 40%：上下底翻开
  const u = ease01((e - 0.3) / 0.7);            // 后 70%：侧面伸直
  const lift = R * capT;
  const group = new THREE.Group();
  const N = 96;
  const Rp = R / Math.max(1 - u, 1e-4);
  const W = TAU * R;
  const pos = [], idx = [];
  const P = (s, y) => { const a = (s - W / 2) / Rp; return V(Rp * Math.sin(a), y + lift, R - 2 * Rp * Math.sin(a / 2) ** 2); };
  for (let i = 0; i <= N; i++) { const s = (W * i) / N; for (const y of [0, h]) { const p = P(s, y); pos.push(p.x, p.y, p.z); } }
  for (let i = 0; i < N; i++) { const a = 2 * i; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const side = new THREE.Mesh(g, S.toon(C.side, { side: THREE.DoubleSide }));
  side.name = 'side';
  group.add(side);
  if (e <= 0.001) S.outline(side);
  const bottomPts = [], topPts = [];
  for (let i = 0; i <= N; i++) { const s = (W * i) / N; bottomPts.push(P(s, 0)); topPts.push(P(s, h)); }
  const segs = [...polyline(bottomPts), ...polyline(topPts)];
  if (u > 0.001) segs.push([P(0, 0), P(0, h)], [P(W, 0), P(W, h)]);
  group.add(inkSegs(S, segs, S.pal.fg));
  // 上下底面绕前方的切线翻开
  const addCap = (y, sign) => {
    const piv = new THREE.Group();
    piv.position.set(0, y + lift, R);
    const cg = new THREE.CircleGeometry(R, 96);
    cg.rotateX(-Math.PI / 2);
    cg.translate(0, 0, -R);
    const m = new THREE.Mesh(cg, S.toon(C.base, { side: THREE.DoubleSide }));
    m.name = 'base';
    const rim = [];
    for (let i = 0; i <= 96; i++) { const t = (TAU * i) / 96; rim.push(V(R * Math.sin(t), 0, R * Math.cos(t) - R)); }
    piv.add(m, inkSegs(S, polyline(rim), S.pal.fg));
    piv.rotation.x = sign * (Math.PI / 2) * capT;
    group.add(piv);
    return m;
  };
  const top = addCap(h, 1);
  addCap(0, -1);
  return {
    group, parts: { side, base: top },
    anchors: { side: P(W * 0.72, h * 0.5), width: P(W * 0.6, 0), height: P(W, h * 0.5), top: V(0, h + lift + R * capT, R - R * Math.cos(capT * Math.PI / 2)), bottom: V(0, lift - R * capT, R - R * Math.cos(capT * Math.PI / 2)) },
    flat: u > 0.999,
  };
}
function ease01(t) { t = Math.min(1, Math.max(0, t)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// 圆锥 / 圆台侧面展开：把它看成"半顶角越来越大的圆锥"，母线长不变，
// 半顶角到 90° 时恰好铺平成扇形（扇环）。正前方那条母线的脚点始终不动。
export function buildConeUnfold(S, { R = 1, r = 0, h = 2, e = 0 }) {
  const C = colors(S);
  const Lf = Math.hypot(R - r, h);              // 母线长
  const L = (Lf * R) / (R - r);                 // 补成完整圆锥后的母线长
  const s0 = L - Lf;
  const Th = (TAU * R) / L;                     // 扇形圆心角
  const capT = Math.min(1, e / 0.4);
  const u = ease01((e - 0.3) / 0.7);
  const rho = R + u * (L - R);
  const sa = Math.min(1, rho / L), ca = Math.sqrt(Math.max(0, 1 - sa * sa));
  const apex = V(0, L * ca, R - L * sa);
  const Pt = (phi, s) => { const p = ((phi - Th / 2) * L) / rho; return apex.clone().add(V(s * sa * Math.sin(p), -s * ca, s * sa * Math.cos(p))); };
  const N = 96, M = 6;
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { const p = Pt((Th * i) / N, s0 + ((L - s0) * j) / M); pos.push(p.x, p.y, p.z); }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const group = new THREE.Group();
  const side = new THREE.Mesh(g, S.toon(C.side, { side: THREE.DoubleSide }));
  side.name = 'side';
  group.add(side);
  if (e <= 0.001) S.outline(side);
  const arc = (s) => { const pts = []; for (let i = 0; i <= N; i++) pts.push(Pt((Th * i) / N, s)); return pts; };
  const segs = [...polyline(arc(L))];
  if (s0 > 1e-6) segs.push(...polyline(arc(s0)));
  if (u > 0.001) segs.push([Pt(0, s0), Pt(0, L)], [Pt(Th, s0), Pt(Th, L)]);
  group.add(inkSegs(S, segs, S.pal.fg));
  // 下底面：绕前方脚点处的切线翻到前面去
  const piv = new THREE.Group();
  piv.position.set(0, 0, R);
  const cg = new THREE.CircleGeometry(R, 96);
  cg.rotateX(Math.PI / 2);
  cg.translate(0, 0, -R);
  const bm = new THREE.Mesh(cg, S.toon(C.base, { side: THREE.DoubleSide }));
  bm.name = 'base';
  const rim = [];
  for (let i = 0; i <= 96; i++) { const t = (TAU * i) / 96; rim.push(V(R * Math.sin(t), 0, R * Math.cos(t) - R)); }
  piv.add(bm, inkSegs(S, polyline(rim), S.pal.fg));
  piv.rotation.x = Math.PI * capT;
  group.add(piv);
  // 圆台的上底面：跟着前方母线的上端走，保持水平
  if (r > 1e-6) {
    const hinge = Pt(Th / 2, s0);
    const tg = new THREE.CircleGeometry(r, 96);
    tg.rotateX(-Math.PI / 2);
    tg.translate(hinge.x, hinge.y + 0.001, hinge.z - r);
    const tm = new THREE.Mesh(tg, S.toon(C.base, { side: THREE.DoubleSide }));
    tm.name = 'base';
    const trim = [];
    for (let i = 0; i <= 96; i++) { const t = (TAU * i) / 96; trim.push(V(hinge.x + r * Math.sin(t), hinge.y, hinge.z - r + r * Math.cos(t))); }
    group.add(tm, inkSegs(S, polyline(trim), S.pal.fg));
  }
  const mid2 = (s) => Pt(Th * 0.72, s);
  return {
    group, parts: { side, base: bm },
    anchors: {
      side: mid2(s0 + (L - s0) * 0.55), gen: Pt(Th, (s0 + L) / 2), arc: Pt(Th * 0.6, L), apex: Pt(0, s0 > 1e-6 ? s0 : 0),
      angle: apex.clone(), bottom: V(0, R * Math.sin(capT * Math.PI), R - R * Math.cos(capT * Math.PI)),
    },
    flat: u > 0.999, sectorDeg: (360 * R) / L, slant: Lf,
  };
}

// 正棱柱展开：侧面像屏风一样拉直，上下底绕正前方那条棱翻开
export function buildPrismUnfold(S, { n = 6, a = 1, h = 2, e = 0 }) {
  const C = colors(S);
  const p = apo(n, a), Rc = circR(n, a);
  const capT = Math.min(1, e / 0.4);
  const u = ease01((e - 0.3) / 0.7);
  const lift = (p + Rc) * capT;
  const beta = ((1 - u) * TAU) / n;
  const m = Math.floor((n - 1) / 2);
  const ring = [V(-a / 2, 0, p), V(a / 2, 0, p)];
  let cur = ring[1].clone();
  const right = [];
  for (let k = 1; k <= m; k++) { cur = cur.clone().add(V(a * Math.cos(k * beta), 0, -a * Math.sin(k * beta))); right.push(cur); }
  cur = ring[0].clone();
  const left = [];
  for (let k = 1; k <= n - 1 - m; k++) { cur = cur.clone().add(V(-a * Math.cos(k * beta), 0, -a * Math.sin(k * beta))); left.push(cur); }
  const chain = [...left.reverse(), ring[0], ring[1], ...right];
  const up = (q, y) => V(q.x, y + lift, q.z);
  const sides = [];
  for (let i = 0; i < chain.length - 1; i++) sides.push([up(chain[i], 0), up(chain[i + 1], 0), up(chain[i + 1], h), up(chain[i], h)]);
  const group = new THREE.Group();
  const ms = faces(S, sides, C.side, 'side');
  group.add(ms, inkSegs(S, polyEdges(sides), S.pal.fg));
  const base = ngon(n, Rc, 0);
  const addCap = (y, sign) => {
    const piv = new THREE.Group();
    piv.position.set(0, y + lift, p);
    const poly = base.map((q) => V(q.x, 0, q.z - p));
    piv.add(faces(S, [poly], C.base, 'base'), inkSegs(S, polyline(poly, true), S.pal.fg));
    piv.rotation.x = sign * (Math.PI / 2) * capT;
    group.add(piv);
  };
  addCap(h, 1);
  addCap(0, -1);
  return { group, parts: { side: ms }, anchors: { side: avg(sides[Math.min(sides.length - 1, left.length + 1)]), width: up(mid(chain[0], chain[chain.length - 1]), 0) }, flat: u > 0.999 };
}

// 正棱锥展开：每个侧面绕自己的底边向外放倒
export function buildPyramidUnfold(S, { n = 4, a = 1.6, h = 1.8, e = 0 }) {
  const C = colors(S);
  const Rc = circR(n, a);
  const bot = ngon(n, Rc, 0);
  const apex = V(0, h, 0);
  const p = apo(n, a);
  const delta = Math.atan2(h, p); // 侧面与底面所成二面角
  const ang = (Math.PI - delta) * ease01(e);
  const sides = [];
  bot.forEach((A, i) => {
    const B = bot[(i + 1) % n];
    const axis = B.clone().sub(A).normalize();
    const rel = apex.clone().sub(A);
    const full = rel.clone().applyAxisAngle(axis, Math.PI - delta).add(A);
    const sgn = Math.abs(full.y) < 1e-4 && full.clone().setY(0).length() > p ? 1 : -1;
    const q = rel.clone().applyAxisAngle(axis, sgn * ang).add(A);
    sides.push([A, B, q]);
  });
  const group = new THREE.Group();
  const ms = faces(S, sides, C.side, 'side');
  const mb = faces(S, [bot], C.base, 'base');
  group.add(ms, mb, inkSegs(S, polyEdges([bot, ...sides]), S.pal.fg));
  const fi = frontIdx(bot, S.camera);
  return { group, parts: { side: ms, base: mb }, anchors: { side: avg(sides[fi]), bottom: avg(bot), slant: mid(mid(bot[fi], bot[(fi + 1) % n]), sides[fi][2]) }, flat: e > 0.999 };
}

export const geo = { circR, apo };

// 给各节页面自己拼道具用的底层件（PY-337）
export { faces, polyEdges, inkSegs, polyline, mid, avg };
