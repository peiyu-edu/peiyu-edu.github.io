// 3.1 椭圆 · 3D 舞台页（PY-362）
// 两个实验：平面斜截圆锥得到椭圆（a、b、c、e 从截口实量）；丹德林双球证明 PF₁ + PF₂ 是定值。
// 圆锥顶点在原点、轴朝下（−z），半顶角 α；截面过轴上深度 d 处，向 +y 方向抬起 β 角。
// a 取截口长轴两端点的距离，b 取过中心的水平弦，c 取两个球切点（焦点）的距离，都从几何里现量。
import { makeLab } from './rlab.js';
import { DUR } from './stage.js';
import * as G from './geom3.js';

const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
const RAD = (d) => (d * Math.PI) / 180;
const D0 = 2;   // 截面与轴的交点深度

/** 圆锥 + 截面的全部几何量 */
function conic(p) {
  const al = RAD(p.al), be = RAD(p.be), sa = Math.sin(al), ca = Math.cos(al), tb = Math.tan(be);
  // 截面与轴截面（x = 0）里两条母线的交点：长轴端点
  const s1 = D0 / (ca + sa * tb), s2 = D0 / (ca - sa * tb);
  const A1 = [0, s1 * sa, -s1 * ca], A2 = [0, -s2 * sa, -s2 * ca];
  const M = G.lerp(A1, A2, 0.5), u = G.unit(G.sub(A1, A2)), w = [1, 0, 0];
  const a = G.dist(A1, A2) / 2;
  const b = Math.sqrt(Math.max(0, (M[2] * Math.tan(al)) ** 2 - M[1] ** 2));   // 过中心的水平弦的一半
  // 丹德林球：球心 (0,0,−k)，与圆锥相切 ⇒ 半径 k·sinα；与截面相切 ⇒ |k − d|·cosβ = k·sinα
  const n = [0, Math.sin(be), -Math.cos(be)];   // 截面单位法向量
  const ball = (k) => {
    const C = [0, 0, -k], r = k * sa;
    const F = G.footOnPlane(C, [0, 0, -D0], n);
    const zc = -k * ca * ca, rc = k * sa * ca;   // 球与圆锥相切的圆：深度、半径
    return { C, r, F, k, zc, rc };
  };
  const B1 = ball((D0 * Math.cos(be)) / (sa + Math.cos(be))), B2 = ball((D0 * Math.cos(be)) / (Math.cos(be) - sa));
  const c = G.dist(B1.F, B2.F) / 2;
  const pt = (phi) => G.add(M, G.add(G.mul(u, a * Math.cos(phi)), G.mul(w, b * Math.sin(phi))));
  return { al, be, A1, A2, M, u, w, a, b, c, B1, B2, pt, n };
}

const N = 72;
const ring = (z, r) => Array.from({ length: N }, (_, i) => { const t = (2 * Math.PI * i) / N; return [r * Math.cos(t), r * Math.sin(t), z]; });
/** 圆锥面（顶点在原点，深到 Z），切成 N 个三角形 */
function coneSurface(al, Z) {
  const R = Z * Math.tan(al), rim = ring(-Z, R);
  return { polys: rim.map((q, i) => [[0, 0, 0], q, rim[(i + 1) % N]]), rim, R };
}
function scene0(p) {
  const K = conic(p);
  const Z = Math.max(-K.A2[2], K.B2.k + K.B2.r * 0.2) * 1.08;
  const cone = coneSurface(K.al, Z);
  const ell = Array.from({ length: N }, (_, i) => K.pt((2 * Math.PI * i) / N));
  // 截面画成比椭圆大一圈的矩形
  const ext = 1.25, hw = K.b * ext + 0.3;
  const quad = [G.add(K.A1, G.add(G.mul(K.u, 0.35), G.mul(K.w, hw))), G.add(K.A1, G.add(G.mul(K.u, 0.35), G.mul(K.w, -hw))),
    G.add(K.A2, G.add(G.mul(K.u, -0.35), G.mul(K.w, -hw))), G.add(K.A2, G.add(G.mul(K.u, -0.35), G.mul(K.w, hw)))];
  return { K, Z, cone, ell, quad };
}
const coneLines = (s) => [
  { id: 'g1', from: [0, 0, 0], to: [0, s.cone.R, -s.Z], color: 'fg', width: 1.8 },
  { id: 'g2', from: [0, 0, 0], to: [0, -s.cone.R, -s.Z], color: 'fg', width: 1.8 },
];

const modes = {
  cut: {
    name: '平面截圆锥', params: { al: 30, be: 25 },
    sliders: [['al', '圆锥半顶角 α（°）', 20, 40, 1], ['be', '截面倾角 β（°）', 0, 45, 1]],
    buttons: [{ label: '▶ 放平（截口是圆）', primary: true, to: () => ({ be: 0 }) }, { label: '▶ 斜一些', to: () => ({ be: 40 }) }],
    scene(p) {
      const s = scene0(p), { K } = s;
      return {
        P: { V: [0, 0, 0], A1: K.A1, A2: K.A2, O: K.M, rim: [s.cone.R, 0, -s.Z], rim2: [-s.cone.R, 0, -s.Z] },
        K,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.22 }],
        planes: [{ id: 'pl', pts: s.quad, color: 'b' }],
        curves: [{ id: 'rim', pts: s.cone.rim, closed: true, color: 'fg', width: 2 }, { id: 'ell', pts: s.ell, closed: true, color: 'no', width: 4 }],
        lines: [...coneLines(s),
          { id: 'ax', from: K.A2, to: K.A1, color: 'c', width: 2.6, dashed: true },
          { id: 'bx', from: G.add(K.M, G.mul(K.w, -K.b)), to: G.add(K.M, G.mul(K.w, K.b)), color: 'c', width: 2.6, dashed: true }],
        dots: [K.B1.F, K.B2.F],
        anchors: { ell: G.add(K.M, G.mul(K.w, K.b)), pl: s.quad[0] },
      };
    },
    read(p, sc) {
      const { a, b, c } = sc.K;
      return [
        ['长半轴 \\(a\\)', f4(a), 'a', a],
        ['短半轴 \\(b\\)', f4(b), 'b', b],
        ['半焦距 \\(c\\)', f4(c), 'c', c],
        ['离心率 \\(e=\\dfrac ca\\)', f4(c / a), 'e', c / a],
      ];
    },
    note: (p) => (p.be === 0
      ? '截面垂直于轴：截口是圆，\\(a=b\\)，两个焦点重合，\\(e=0\\)。'
      : `截面越斜，椭圆越扁，\\(e\\) 越大。可以验证 \\(e=\\dfrac{\\sin\\beta}{\\cos\\alpha}\\)；β 增大到 \\(90^\\circ-\\alpha\\) 时截面平行于母线，就不再是椭圆了。`),
    tags: ['V', 'A1', 'A2', 'O'],
    callouts: [
      { id: 'ell', title: '截口：椭圆', text: '红色曲线', at: 'ell', dx: 140, dy: -40 },
      { id: 'pl', title: '截面', text: '与水平面成 β 角', at: 'pl', dx: 120, dy: -60 },
    ],
    def: String.raw`<h3>椭圆从哪里来</h3>
      <p class="def">平面内与两个定点 \(F_1,F_2\) 的距离之和等于常数（大于 \(|F_1F_2|\)）的点的轨迹叫做<b>椭圆</b>。两个定点叫做焦点，两焦点间的距离叫做焦距。</p>
      <p>用一个不过顶点、和轴不垂直、又比母线「平」的平面去截圆锥，截口就是椭圆；截面垂直于轴时截口是圆。</p>
      <p class="l3-note">读数都是从截口实际量出来的：\(a\) 是长轴 \(A_1A_2\) 的一半，\(b\) 是过中心的水平弦的一半，\(c\) 是两个焦点（下一个实验里两个球与截面的切点）距离的一半。可以验证 \(a^2=b^2+c^2\)。</p>`,
  },
  dand: {
    name: '丹德林双球', params: { al: 30, be: 25, phi: 60 },
    sliders: [['phi', '点 P 在椭圆上的位置（°）', 0, 360, 5], ['be', '截面倾角 β（°）', 0, 45, 1]],
    buttons: [{ label: '▶ P 绕椭圆走一圈', primary: true, ms: DUR.tour, to: (p) => ({ phi: p.phi >= 180 ? 0 : 360 }) }],
    scene(p) {
      const s = scene0(p), { K } = s, P = K.pt(RAD(p.phi));
      const t = (z) => G.mul(P, z / P[2]);   // 母线 VP 上深度为 z 的点
      const Q1 = t(K.B1.zc), Q2 = t(K.B2.zc);
      return {
        P: { V: [0, 0, 0], P, F1: K.B1.F, F2: K.B2.F, Q1, Q2, rim: [s.cone.R, 0, -s.Z], rim2: [-s.cone.R, 0, -s.Z] },
        K, Pt: P, Q1, Q2,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.16 }],
        spheres: [{ id: 's1', c: K.B1.C, r: K.B1.r, color: 'c' }, { id: 's2', c: K.B2.C, r: K.B2.r, color: 'c' }],
        planes: [{ id: 'pl', pts: s.quad, color: 'b' }],
        curves: [
          { id: 'ell', pts: s.ell, closed: true, color: 'no', width: 3 },
          { id: 'c1', pts: ring(K.B1.zc, K.B1.rc), closed: true, color: 'c', width: 2.4 },
          { id: 'c2', pts: ring(K.B2.zc, K.B2.rc), closed: true, color: 'c', width: 2.4 },
        ],
        lines: [
          { id: 'gen', from: [0, 0, 0], to: t(-s.Z), color: 'fg', width: 1.8, dashed: true },
          { id: 'pq', from: Q1, to: Q2, color: 'hl', width: 4 },
          { id: 'pf1', from: P, to: K.B1.F, color: 'a', width: 4 },
          { id: 'pf2', from: P, to: K.B2.F, color: 'b', width: 4 },
        ],
        dots: [P, K.B1.F, K.B2.F, Q1, Q2],
        anchors: { pf1: G.lerp(P, K.B1.F, 0.5), pq: G.lerp(Q1, Q2, 0.5), s1: K.B1.C },
      };
    },
    read(p, sc) {
      const P = sc.Pt, F1 = sc.K.B1.F, F2 = sc.K.B2.F;
      const pf1 = G.dist(P, F1), pf2 = G.dist(P, F2), pq1 = G.dist(P, sc.Q1), pq2 = G.dist(P, sc.Q2);
      return [
        ['\\(|PF_1|\\)', f4(pf1), 'pf1', pf1],
        ['\\(|PQ_1|\\)（切线长）', f4(pq1), 'pq1', pq1],
        ['\\(|PF_2|\\)', f4(pf2), 'pf2', pf2],
        ['\\(|PQ_2|\\)（切线长）', f4(pq2), 'pq2', pq2],
        ['\\(|PF_1|+|PF_2|\\)', f4(pf1 + pf2), 'sum', pf1 + pf2],
        ['两切圆间的母线长 \\(|Q_1Q_2|\\)', f4(G.dist(sc.Q1, sc.Q2)), 'gen', G.dist(sc.Q1, sc.Q2)],
      ];
    },
    note: () => '从球外一点到球的切线长都相等：\\(|PF_1|=|PQ_1|\\)，\\(|PF_2|=|PQ_2|\\)。所以 \\(|PF_1|+|PF_2|=|Q_1Q_2|\\)，是两个切圆之间的一段母线，不管 \\(P\\) 走到哪里都一样长。',
    tags: ['V', 'P', 'F1', 'F2', 'Q1', 'Q2'],
    callouts: [
      { id: 'pq', title: 'Q₁Q₂', text: '两切圆之间的母线', at: 'pq', dx: -170, dy: -30 },
      { id: 's1', title: '小球', text: '同时切圆锥和截面', at: 's1', dx: 150, dy: -40 },
      { id: 'pf1', title: 'PF₁ = PQ₁', text: '切线长相等', at: 'pf1', dx: 150, dy: 50 },
    ],
    def: String.raw`<h3>丹德林双球：为什么距离之和是定值</h3>
      <p>在圆锥里放两个球，都和圆锥相切（切出两个圆），也都和截面相切，切点就是 \(F_1\)、\(F_2\)。</p>
      <p class="def">设 \(P\) 是截口上任一点，过 \(P\) 的母线交两个切圆于 \(Q_1,Q_2\)。<br>\(PF_1\)、\(PQ_1\) 都是从 \(P\) 到小球的切线，所以 \(|PF_1|=|PQ_1|\)；同理 \(|PF_2|=|PQ_2|\)。<br>于是 \(|PF_1|+|PF_2|=|Q_1Q_2|\)，是定值。</p>
      <p class="l3-note">这就证明了截口是以 \(F_1,F_2\) 为焦点、\(2a=|Q_1Q_2|\) 的椭圆。</p>`,
  },
};

makeLab({
  page: 'e1-3-1', modes,
  aria: '可拖动旋转的圆锥、截面与两个内切球，演示椭圆是圆锥的截口以及焦点的来历',
  quizItems: (show) => [
    {
      q: '用垂直于圆锥轴的平面去截圆锥（不过顶点），截口是？',
      opts: ['圆', '椭圆', '抛物线'], answer: 0,
      why: '截面与轴垂直时，截口上每点到轴的距离相同，是圆，可以看成 \\(e=0\\) 的特殊椭圆。',
      show: show('cut', { al: 30, be: 0 }), showLabel: '在模型上看',
    },
    {
      q: '丹德林双球中，\\(|PF_1|+|PF_2|\\) 等于？',
      opts: ['两个切圆之间的一段母线长', '两个球的半径之和', '两球心的距离'], answer: 0,
      why: '\\(|PF_1|=|PQ_1|\\)，\\(|PF_2|=|PQ_2|\\)（切线长相等），相加就是 \\(|Q_1Q_2|\\)。',
      show: show('dand', { al: 30, be: 25, phi: 60 }), showLabel: '在模型上看',
    },
    {
      q: '圆锥不变，截面倾角 \\(\\beta\\) 增大（仍截出椭圆），离心率 \\(e\\) 怎样变化？',
      opts: ['变大', '变小', '不变'], answer: 0,
      why: '截面越斜，椭圆越扁；\\(e=\\dfrac{\\sin\\beta}{\\cos\\alpha}\\)，\\(\\beta\\) 越大 \\(e\\) 越大。',
      show: show('cut', { al: 30, be: 40 }), showLabel: '在模型上看',
    },
    {
      q: '\\(\\alpha=30^\\circ\\)，\\(\\beta=30^\\circ\\) 时，截口椭圆的离心率是？',
      opts: ['\\(\\dfrac{\\sqrt3}{3}\\)', '\\(\\dfrac12\\)', '\\(\\dfrac{\\sqrt3}{2}\\)'], answer: 0,
      why: '\\(e=\\dfrac{\\sin30^\\circ}{\\cos30^\\circ}=\\dfrac{1/2}{\\sqrt3/2}=\\dfrac{\\sqrt3}{3}\\)。',
      show: show('cut', { al: 30, be: 30 }), showLabel: '在模型上看',
    },
  ],
});
