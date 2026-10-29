// 8.4 空间点、直线、平面之间的位置关系 · 3D 舞台页（PY-337）
// 在长方体 ABCD-A1B1C1D1 里任选两条线、一线一面或两个面，位置关系和角度都由 geom3.js 按当前坐标现算。
// 异面直线可以「平移」：在长方体里找一条与 l₂ 平行、且和 l₁ 相交的线段，把 l₂ 平移过去，角就看出来了。
import { makeLab, relRow, TEX, NAME, dg, REL } from './rlab.js';
import * as G from './geom3.js';

const LINES = ['AB', 'BC', 'CD', 'DA', 'A1B1', 'B1C1', 'C1D1', 'D1A1', 'AA1', 'BB1', 'CC1', 'DD1',
  'AC', 'BD', 'A1C1', 'B1D1', 'A1B', 'AB1', 'BC1', 'B1C', 'CD1', 'C1D', 'AD1', 'A1D', 'AC1', 'A1C', 'BD1', 'B1D'];
const PLANES = ['ABCD', 'A1B1C1D1', 'ABB1A1', 'BCC1B1', 'CDD1C1', 'ADD1A1', 'ACC1A1', 'BDD1B1', 'ABC1D1', 'A1BD', 'CB1D1', 'AB1D1'];
const pts = (name) => name.match(/[A-D]1?/g);
const lineOpts = LINES.map((l) => [l, NAME(l)]);
const planeOpts = PLANES.map((p) => [p, `平面 ${NAME(p)}`]);
const DIMS = [['a', '长 AB', 1, 2.4, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];

const seg = (V, name) => { const [p, q] = pts(name); return { P: V[p], Q: V[q], u: G.sub(V[q], V[p]) }; };
const plane = (V, name) => { const [p, q, r] = pts(name); return { P: V[p], n: G.normal(V[p], V[q], V[r]), poly: pts(name) }; };

// 异面时：找一条与 l2 平行、和 l1 在两条线段上都相交的棱或对角线，作为平移的目标
function partner(V, l1, l2) {
  const A = seg(V, l1), B = seg(V, l2);
  for (const name of LINES) {
    const C = seg(V, name);
    if (G.lineLine(B.P, B.u, C.P, C.u).rel !== 'parallel') continue;
    const r = G.lineLine(A.P, A.u, C.P, C.u);
    if (r.rel === 'intersect' && r.s > -1e-9 && r.s < 1 + 1e-9 && r.t > -1e-9 && r.t < 1 + 1e-9) {
      // 平移向量：让 l2 的方向和 C 一致后，起点对起点
      const same = G.dot(B.u, C.u) > 0;
      return { name, T: G.sub(same ? C.P : G.add(C.P, C.u), B.P) };
    }
  }
  return { name: null, T: G.sub(A.P, B.P) };
}

const modes = {
  ll: {
    name: '两条直线', params: { a: 1.8, b: 1.4, c: 1.2, l1: 'AD1', l2: 'BD', m: 0 },
    selects: [{ key: 'l1', label: '直线 l₁', options: lineOpts }, { key: 'l2', label: '直线 l₂', options: lineOpts }],
    sliders: [...DIMS, ['m', '平移 l₂', 0, 1, 0.05]],
    buttons: [{ label: '▶ 平移求角 / 移回', primary: true, to: (p) => ({ m: p.m > 0.5 ? 0 : 1 }) }],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const A = seg(V, p.l1), B = seg(V, p.l2);
      const r = G.lineLine(A.P, A.u, B.P, B.u);
      const P = { ...V };
      const lines = [{ id: 'l1', from: A.P, to: A.Q, color: 'c' }, { id: 'l2', from: B.P, to: B.Q, color: 'b' }];
      const arcs = [];
      const dots = [];
      const anchors = { l1: G.lerp(A.P, A.Q, 0.5), l2: G.lerp(B.P, B.Q, 0.5) };
      let X = null, dir2 = B.u, pt = null;
      if (r.rel === 'intersect') X = r.X;
      if (r.rel === 'skew') {
        pt = partner(V, p.l1, p.l2);
        const T = G.mul(pt.T, p.m);
        if (p.m > 0) lines.push({ id: 'l2m', from: G.add(B.P, T), to: G.add(B.Q, T), color: 'b', dashed: true, width: 3 });
        anchors.l2m = G.lerp(G.add(B.P, T), G.add(B.Q, T), 0.5);
        if (p.m > 0.999) X = G.lineLine(A.P, A.u, G.add(B.P, pt.T), B.u).X;
      }
      if (X) {
        // 角画在 l₁ 较长的那一侧，并取锐角（或直角）
        const end = G.dist(A.P, X) > G.dist(A.Q, X) ? A.P : A.Q;
        const u = G.sub(end, X);
        const v = G.dot(u, dir2) >= 0 ? dir2 : G.mul(dir2, -1);
        arcs.push({ id: 'ang', O: X, A: end, B: G.add(X, G.mul(G.unit(v), G.len(u))) });
        dots.push(X);
        anchors.ang = X;
      }
      return { P, solid: { faces: F }, lines, arcs, dots, anchors, r, pt };
    },
    read(p, sc) {
      const th = sc.r.angle;
      const rows = [relRow('位置关系', sc.r.rel), ['所成的角 \\(\\theta\\)', dg(th), 'theta', G.deg(th)], ['\\(\\cos\\theta\\)', Math.cos(th).toFixed(4), 'cos', Math.cos(th)]];
      return rows;
    },
    note(p, sc) {
      if (sc.r.rel !== 'skew') return sc.r.rel === 'parallel' ? '平行的两条直线所成的角规定为 \\(0^\\circ\\)。' : '';
      return sc.pt.name ? `把 \\(${TEX(p.l2)}\\) 平移到 \\(${TEX(sc.pt.name)}\\)，它和 \\(${TEX(p.l1)}\\) 相交，夹出的锐角（或直角）就是所成的角。拖「平移 l₂」或点按钮看。`
        : `把 \\(${TEX(p.l2)}\\) 平移到过 \\(${TEX(pts(p.l1)[0])}\\) 的位置，夹出的锐角（或直角）就是所成的角。`;
    },
    callouts: [
      { id: 'l1', title: 'l₁', text: '第一条直线', at: 'l1', dx: -150, dy: -60 },
      { id: 'l2', title: 'l₂', text: '第二条直线', at: 'l2', dx: 120, dy: 70 },
      { id: 'ang', title: '所成的角 θ', text: '平移到相交后取锐角或直角', at: 'ang', dx: 130, dy: -70, when: (p, sc) => !!sc.anchors.ang },
    ],
    def: String.raw`<h3>空间两条直线</h3>
      <p class="def">① <b>平行</b>：在同一平面内，没有公共点；<br>② <b>相交</b>：在同一平面内，有且只有一个公共点；<br>③ <b>异面</b>：不同在任何一个平面内（既不平行也不相交）。</p>
      <p><b>基本事实 4</b>：平行于同一条直线的两条直线平行。<br><b>等角定理</b>：空间中两个角的两边分别对应平行，这两个角相等或互补。</p>
      <p>异面直线 \(a,b\) 所成的角：过空间任一点 \(O\) 作 \(a'\parallel a\)、\(b'\parallel b\)，\(a'\) 与 \(b'\) 所成的锐角（或直角）。范围 \(0^\circ<\theta\le90^\circ\)；夹角为 \(90^\circ\) 时说两条异面直线<b>互相垂直</b>。</p>
      <p class="l3-note">读数里的 \(\theta\) 用方向向量现算：\(\cos\theta=\dfrac{|\vec u\cdot\vec v|}{|\vec u||\vec v|}\)。</p>`,
  },
  lp: {
    name: '直线与平面', params: { a: 1.8, b: 1.4, c: 1.2, l: 'AC1', pl: 'A1BD' },
    selects: [{ key: 'l', label: '直线', options: lineOpts }, { key: 'pl', label: '平面', options: planeOpts }],
    sliders: DIMS,
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const L = seg(V, p.l), Pl = plane(V, p.pl);
      const r = G.linePlane(L.P, L.u, Pl.P, Pl.n);
      const lines = [{ id: 'l', from: L.P, to: L.Q, color: 'c' }];
      const dots = [];
      const anchors = { l: G.lerp(L.P, L.Q, 0.5), pl: Pl.poly.map((n) => V[n]).reduce((s, q) => G.add(s, G.mul(q, 1 / Pl.poly.length)), [0, 0, 0]) };
      if (r.rel === 'intersect') {
        dots.push(r.X);
        anchors.X = r.X;
        // 交点在线段外：把线段延长过去（虚线）
        if (r.s < -1e-9) lines.push({ id: 'ext', from: r.X, to: L.P, color: 'c', dashed: true, width: 2 });
        if (r.s > 1 + 1e-9) lines.push({ id: 'ext', from: L.Q, to: r.X, color: 'c', dashed: true, width: 2 });
      }
      return { P: { ...V, ...(r.X ? { X: r.X } : {}) }, solid: { faces: F }, planes: [{ id: 'pl', pts: Pl.poly, color: 'b' }], lines, dots, anchors, r };
    },
    read(p, sc) {
      const phi = sc.r.angle;
      return [relRow('位置关系', sc.r.rel), ['所成的角 \\(\\varphi\\)', dg(phi), 'phi', G.deg(phi)], ['\\(\\sin\\varphi\\)', Math.sin(phi).toFixed(4), 'sin', Math.sin(phi)]];
    },
    note: (p, sc) => (sc.r.rel === 'intersect' ? (sc.r.s < -1e-9 || sc.r.s > 1 + 1e-9 ? '交点 \\(X\\) 在线段的延长线上（虚线）。' : '交点记作 \\(X\\)。') + '线面角在 8.6 细讲。'
      : '直线在平面内或与平面平行时，所成的角规定为 \\(0^\\circ\\)。'),
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'X'],
    callouts: [
      { id: 'l', title: '直线', text: '', at: 'l', dx: -150, dy: -60 },
      { id: 'pl', title: '平面', text: '只画出长方体里的一块', at: 'pl', dx: 130, dy: 70 },
    ],
    def: String.raw`<h3>直线与平面</h3>
      <p class="def">① <b>直线在平面内</b>：有无数个公共点；<br>② <b>直线与平面相交</b>：有且只有一个公共点；<br>③ <b>直线与平面平行</b>：没有公共点。<br>②③ 合称<b>直线在平面外</b>。</p>
      <p><b>基本事实 2</b>：如果一条直线上的两个点在一个平面内，那么这条直线在这个平面内。</p>
      <p class="l3-note">判断方法（读数现算）：方向向量 \(\vec u\) 与平面法向量 \(\vec n\) 垂直时，直线在平面内或与平面平行，再看直线上一点在不在平面上；不垂直就相交。</p>`,
  },
  pp: {
    name: '两个平面', params: { a: 1.8, b: 1.4, c: 1.2, p1: 'ACC1A1', p2: 'BDD1B1' },
    selects: [{ key: 'p1', label: '平面 α', options: planeOpts }, { key: 'p2', label: '平面 β', options: planeOpts }],
    sliders: DIMS,
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const A = plane(V, p.p1), B = plane(V, p.p2);
      const r = G.planePlane(A.P, A.n, B.P, B.n);
      const lines = [];
      const anchors = {
        p1: A.poly.map((n) => V[n]).reduce((s, q) => G.add(s, G.mul(q, 1 / A.poly.length)), [0, 0, 0]),
        p2: B.poly.map((n) => V[n]).reduce((s, q) => G.add(s, G.mul(q, 1 / B.poly.length)), [0, 0, 0]),
      };
      if (r.rel === 'intersect') {
        const cut = G.clipToBox(r.X, r.dir, [p.a, p.b, p.c]);
        if (cut) { lines.push({ id: 'cut', from: cut[0], to: cut[1], color: 'no' }); anchors.cut = G.lerp(cut[0], cut[1], 0.3); }
      }
      return { P: V, solid: { faces: F }, planes: [{ id: 'p1', pts: A.poly, color: 'c' }, { id: 'p2', pts: B.poly, color: 'b' }], lines, anchors, r };
    },
    read(p, sc) {
      const rows = [relRow('位置关系', sc.r.rel)];
      if (sc.r.rel === 'intersect') rows.push(['两平面的夹角', dg(sc.r.angle), 'ang', G.deg(sc.r.angle)]);
      if (sc.r.rel === 'parallel') rows.push(['两平面间的距离', sc.r.dist.toFixed(4), 'd', sc.r.dist]);
      return rows;
    },
    note: (p, sc) => (sc.r.rel === 'intersect' ? '红线是交线（只画出长方体里的一段）。夹角在 8.6 二面角里细讲。' : sc.r.rel === 'parallel' ? '两个平面没有公共点。' : '选了同一个平面。'),
    callouts: [
      { id: 'p1', title: '平面 α', text: '', at: 'p1', dx: -150, dy: -60 },
      { id: 'p2', title: '平面 β', text: '', at: 'p2', dx: 130, dy: 70 },
      { id: 'cut', title: '交线', text: '两个平面相交于一条直线', at: 'cut', dx: 120, dy: -80, when: (p, sc) => !!sc.anchors.cut },
    ],
    def: String.raw`<h3>两个平面</h3>
      <p class="def">① <b>两个平面平行</b>：没有公共点；<br>② <b>两个平面相交</b>：有一条公共直线。</p>
      <p><b>基本事实 1</b>：过不在一条直线上的三个点，有且只有一个平面。<br><b>基本事实 3</b>：如果两个不重合的平面有一个公共点，那么它们有且只有一条过该点的公共直线。</p>
      <p class="l3-note">读数现算：两平面法向量平行则两平面平行（或重合），否则相交，交线方向是两法向量的叉积。</p>`,
  },
};

makeLab({
  page: 'b2-8-4', modes,
  aria: '可拖动旋转的长方体，可以选两条直线、一条直线与一个平面、或两个平面看它们的位置关系',
  quizItems: (show) => [
    {
      q: '正方体 \\(ABCD\\text{-}A_1B_1C_1D_1\\) 中，异面直线 \\(A_1B\\) 与 \\(AD_1\\) 所成的角是？',
      opts: ['\\(45^\\circ\\)', '\\(60^\\circ\\)', '\\(90^\\circ\\)'], answer: 1,
      why: '把 \\(AD_1\\) 平移到 \\(BC_1\\)，它和 \\(A_1B\\) 交于 \\(B\\)。\\(\\triangle A_1BC_1\\) 的三边都是面对角线，是等边三角形，所以夹角是 \\(60^\\circ\\)。',
      show: show('ll', { a: 1.6, b: 1.6, c: 1.6, l1: 'A1B', l2: 'AD1', m: 1 }), showLabel: '在正方体里看',
    },
    {
      q: '空间两条直线没有公共点，它们一定平行吗？',
      opts: ['一定平行', '不一定'], answer: 1,
      why: '还可能是<b>异面直线</b>，比如长方体里的 \\(AB\\) 与 \\(CC_1\\)。平行必须先在同一个平面内。',
      show: show('ll', { l1: 'AB', l2: 'CC1', m: 0 }), showLabel: '看 AB 与 CC₁',
    },
    {
      q: '空间中两个角的两边分别对应平行，这两个角？',
      opts: ['一定相等', '一定互补', '相等或互补'], answer: 2,
      why: '等角定理：两边方向都相同或都相反时相等，一边相同一边相反时互补。',
    },
    {
      q: '正方体的 12 条棱中，与棱 \\(AB\\) 异面的有几条？',
      opts: ['2 条', '4 条', '6 条'], answer: 1,
      why: '与 \\(AB\\) 平行的 3 条（\\(CD,A_1B_1,C_1D_1\\)），相交的 4 条（\\(AD,AA_1,BC,BB_1\\)），剩下 \\(12-1-3-4=4\\) 条异面：\\(CC_1,DD_1,A_1D_1,B_1C_1\\)。',
      show: show('ll', { l1: 'AB', l2: 'B1C1', m: 0 }), showLabel: '看 AB 与 B₁C₁',
    },
  ],
});
