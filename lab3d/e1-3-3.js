// 3.3 抛物线 · 3D 舞台页（PY-362）
// 两个实验：平行于一条母线的平面截圆锥得到抛物线（焦点、准线、p 从几何里实量）；单个丹德林球证明 |PF| = P 到准线的距离。
// 圆锥顶点在原点、轴是 z 轴，半顶角 α；截面倾角 β = 90° − α（和 x = 0 里的一条母线平行），到顶点的距离 H。约定见 conic.js。
import { makeLab } from './rlab.js';
import { DUR } from './stage.js';
import * as G from './geom3.js';
import { f4, ring, coneSurface, generators, frame, quad, onGen } from './conic.js';

const H = 1;            // 顶点到截面的距离
const TM = 1.2;         // P 的横向坐标范围 t ∈ [−TM, TM]
const NB = 64;

function conic(p) {
  const F = frame(p.al, 90 - p.al, H), { u, w, sa } = F;
  const A = F.hit(1);                                    // 抛物线顶点（另一条母线与截面平行，碰不到）
  const B = F.ball(H / (2 * sa));                        // 唯一的丹德林球
  const f = G.dist(A, B.F);                              // 顶点到焦点
  // 准线：截面与切圆所在水平面 z = zc 的交线；D0 是它在对称轴上的点
  const D0 = G.add(A, G.mul(u, (B.zc - A[2]) / u[2]));
  const toDir = (X) => { const d = G.sub(X, D0); return G.len(G.sub(d, G.mul(w, G.dot(d, w)))); };
  const p2 = toDir(B.F);                                 // 焦点到准线的距离 p
  // 抛物线：从顶点沿 −u 走 s、横向走 t，t² = 4f·s
  const pt = (t) => G.add(A, G.add(G.mul(u, (-t * t) / (4 * f)), G.mul(w, t)));
  return { ...F, A, B, f, D0, toDir, p: p2, pt };
}

function scene0(p) {
  const K = conic(p), sb = Math.sin(K.be);
  const sMax = (TM * TM) / (4 * K.f);
  const Z = Math.max(-(K.A[2] - sMax * sb), K.B.k * (1 + K.sa)) * 1.12;
  const Tc = Math.sqrt(4 * K.f * ((Z + K.A[2]) / sb));    // 抛物线画到口沿
  const par = Array.from({ length: NB + 1 }, (_, i) => K.pt(-Tc + (2 * Tc * i) / NB));
  const sDir = G.dot(G.sub(K.D0, K.A), K.u);              // 准线在顶点「上方」sDir 处
  const sLo = -((Z + K.A[2]) / sb), ew = Tc + 0.2;
  const mid = G.add(K.A, G.mul(K.u, (sDir + 0.25 + sLo) / 2));
  const eu = (sDir + 0.25 - sLo) / 2;
  const dir = { id: 'dir', from: G.add(K.D0, G.mul(K.w, -ew)), to: G.add(K.D0, G.mul(K.w, ew)), color: 'c', width: 3, dashed: true };
  const R = Z * Math.tan(K.al);
  return { K, Z, cone: coneSurface(K.al, Z), par, plane: quad(mid, K.u, K.w, eu, ew), dir, rimP: { r1: [R, 0, -Z], r2: [-R, 0, -Z] }, gens: generators(K.al, Z) };
}

const modes = {
  cut: {
    name: '平行于母线去截', params: { al: 30 },
    sliders: [['al', '圆锥半顶角 α（°），截面倾角 β = 90° − α', 20, 40, 1]],
    buttons: [{ label: '▶ 圆锥变尖', primary: true, to: () => ({ al: 20 }) }, { label: '▶ 圆锥变钝', to: () => ({ al: 40 }) }],
    scene(p) {
      const s = scene0(p), { K } = s;
      return {
        P: { V: [0, 0, 0], A: K.A, F: K.B.F, ...s.rimP },
        K,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.2 }],
        planes: [{ id: 'pl', pts: s.plane, color: 'b' }],
        curves: [
          { id: 'rim', pts: s.cone.rims[0], closed: true, color: 'fg', width: 2 },
          { id: 'par', pts: s.par, color: 'no', width: 4 },
        ],
        lines: [s.gens[0], { ...s.gens[1], id: 'para', color: 'hl', width: 3.4 }, s.dir,
          { id: 'axis', from: K.D0, to: G.sub(K.A, G.mul(K.u, (s.Z + K.A[2]) / Math.sin(K.be))), color: 'c', width: 2 }],
        dots: [K.B.F, K.D0],
        anchors: { par: s.par[Math.round(NB * 0.88)], para: G.mul(s.gens[1].to, 0.6), dir: s.dir.to },
      };
    },
    read(p, sc) {
      const { f, p: pp, be } = sc.K, e = Math.sin(be) / Math.cos(sc.K.al);
      return [
        ['截面倾角 \\(\\beta=90^\\circ-\\alpha\\)', `${90 - p.al}°`, 'be', 90 - p.al],
        ['顶点到焦点 \\(|AF|\\)', f4(f), 'f', f],
        ['焦点到准线 \\(p\\)', f4(pp), 'p', pp],
        ['\\(\\dfrac{\\sin\\beta}{\\cos\\alpha}\\)（离心率）', f4(e), 'e', e],
      ];
    },
    note: () => '截面和一条母线平行，只截到一叶，截口不封口，是抛物线。焦点到准线的距离 \\(p\\) 正好是顶点到焦点的 2 倍；\\(\\dfrac{\\sin\\beta}{\\cos\\alpha}=1\\)，所以抛物线的离心率是 1。',
    tags: ['V', 'A', 'F'],
    callouts: [
      { id: 'par', title: '截口：抛物线', text: '只有一支，不封口', at: 'par', dx: 130, dy: 20 },
      { id: 'para', title: '这条母线', text: '和截面平行', at: 'para', dx: -170, dy: -30 },
      { id: 'dir', title: '准线', text: '虚线', at: 'dir', dx: 120, dy: -50 },
    ],
    def: String.raw`<h3>抛物线从哪里来</h3>
      <p class="def">平面内与一个定点 \(F\) 和一条定直线 \(l\)（\(l\) 不经过点 \(F\)）的距离相等的点的轨迹叫做<b>抛物线</b>。点 \(F\) 叫做焦点，直线 \(l\) 叫做准线。</p>
      <p>截面恰好和圆锥的一条母线平行（\(\beta=90^\circ-\alpha\)）时，它只截到一叶，而且永远追不上那条母线，截口就是抛物线。它是椭圆和双曲线之间的分界。</p>
      <p class="l3-note">焦点是下一个实验里球与截面的切点，准线是截面和球的切圆所在平面的交线。\(|AF|\) 和 \(p\) 都从几何里实量。</p>`,
  },
  dand: {
    name: '丹德林球与准线', params: { al: 30, t: 0.8 },
    sliders: [['t', '点 P 的位置', -TM, TM, 0.05], ['al', '圆锥半顶角 α（°）', 20, 40, 1]],
    buttons: [{ label: '▶ P 沿抛物线走', primary: true, ms: DUR.tour, to: (p) => ({ t: p.t >= 0 ? -TM : TM }) }],
    scene(p) {
      const s = scene0(p), { K } = s, P = K.pt(p.t);
      const Q = onGen(P, K.B.zc), D = G.add(K.D0, G.mul(K.w, p.t));   // D 是 P 在准线上的垂足
      return {
        P: { V: [0, 0, 0], P, F: K.B.F, Q, D, ...s.rimP },
        K, Pt: P, Q, D,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.14 }],
        spheres: [{ id: 'sp', c: K.B.C, r: K.B.r, color: 'c' }],
        planes: [{ id: 'pl', pts: s.plane, color: 'b' }],
        curves: [
          { id: 'rim', pts: s.cone.rims[0], closed: true, color: 'fg', width: 1.6 },
          { id: 'par', pts: s.par, color: 'no', width: 3 },
          { id: 'cc', pts: ring(K.B.zc, K.B.rc), closed: true, color: 'c', width: 2.4 },
        ],
        lines: [...s.gens,
          s.dir,
          { id: 'gen', from: [0, 0, 0], to: onGen(P, -s.Z), color: 'fg', width: 1.8, dashed: true },
          { id: 'pf', from: P, to: K.B.F, color: 'a', width: 4 },
          { id: 'pq', from: P, to: Q, color: 'hl', width: 4 },
          { id: 'pd', from: P, to: D, color: 'b', width: 4 },
        ],
        dots: [P, K.B.F, Q, D],
        anchors: { pq: G.lerp(P, Q, 0.5), pd: G.lerp(P, D, 0.5), sp: K.B.C },
      };
    },
    read(p, sc) {
      const P = sc.Pt, pf = G.dist(P, sc.K.B.F), pq = G.dist(P, sc.Q), pd = sc.K.toDir(P);
      return [
        ['\\(|PF|\\)', f4(pf), 'pf', pf],
        ['\\(|PQ|\\)（切线长）', f4(pq), 'pq', pq],
        ['\\(P\\) 到准线的距离 \\(d\\)', f4(pd), 'pd', pd],
        ['\\(|PF|-d\\)', f4(pf - pd), 'diff', pf - pd],
      ];
    },
    note: () => '\\(|PF|=|PQ|\\)（切线长相等）。\\(PQ\\) 沿母线、\\(PD\\) 在截面里，两者都从 \\(P\\) 落到切圆所在的水平面，和水平面的夹角都是 \\(90^\\circ-\\alpha\\)，所以一样长：\\(|PF|=|PD|\\)。',
    tags: ['V', 'P', 'F', 'Q', 'D'],
    callouts: [
      { id: 'pq', title: 'PF = PQ', text: '切线长相等', at: 'pq', dx: -170, dy: -20 },
      { id: 'pd', title: 'PQ = PD', text: '和水平面夹角一样', at: 'pd', dx: 150, dy: 40 },
      { id: 'sp', title: '丹德林球', text: '切圆锥，也切截面', at: 'sp', dx: -60, dy: -120 },
    ],
    def: String.raw`<h3>一个球就够了：焦点和准线</h3>
      <p>截面和母线平行时，只能放进一个既切圆锥（切出一个圆）、又切截面的球，切点是焦点 \(F\)。切圆所在的水平面和截面交成一条直线 \(l\)，就是准线。</p>
      <p class="def">设 \(P\) 是截口上任一点，过 \(P\) 的母线交切圆于 \(Q\)，\(PD\perp l\) 于 \(D\)。<br>\(|PF|=|PQ|\)（切线长相等）；<br>\(PQ\) 是母线，与水平面成 \(90^\circ-\alpha\)；\(PD\) 在截面里垂直于水平线 \(l\)，与水平面成 \(\beta=90^\circ-\alpha\)。两条线段从 \(P\) 落到同一个水平面，倾角又相同，所以 \(|PQ|=|PD|\)。</p>
      <p class="l3-note">于是 \(|PF|=|PD|\)：截口上每一点到焦点和到准线的距离相等，正是抛物线。</p>`,
  },
};

makeLab({
  page: 'e1-3-3', modes,
  aria: '可拖动旋转的圆锥、与母线平行的截面和一个内切球，演示抛物线是圆锥的截口以及焦点、准线的来历',
  quizItems: (show) => [
    {
      q: '截面与圆锥的一条母线平行（不过顶点），截口是？',
      opts: ['抛物线', '椭圆', '双曲线的一支'], answer: 0,
      why: '这时 \\(\\beta=90^\\circ-\\alpha\\)，截面只截到一叶、截口不封口，是抛物线，\\(e=1\\)。',
      show: show('cut', { al: 30 }), showLabel: '在模型上看',
    },
    {
      q: '抛物线的准线在圆锥模型里是？',
      opts: ['截面与切圆所在平面的交线', '与截面平行的那条母线', '圆锥的轴'], answer: 0,
      why: '球与圆锥切出一个水平圆，这个圆所在的平面与截面的交线就是准线。',
      show: show('dand', { al: 30, t: 0.8 }), showLabel: '在模型上看',
    },
    {
      q: '为什么 \\(|PQ|=|PD|\\)？',
      opts: ['两条线段落到同一水平面，倾角都是 \\(90^\\circ-\\alpha\\)', '它们都是球的切线', '它们在同一条母线上'], answer: 0,
      why: '\\(PQ\\) 沿母线，\\(PD\\) 在截面里，与水平面的夹角都等于 \\(90^\\circ-\\alpha\\)，高度差相同，所以长度相等。',
      show: show('dand', { al: 30, t: -0.6 }), showLabel: '在模型上看',
    },
    {
      q: '在截口抛物线上，焦点到准线的距离 \\(p\\) 与顶点到焦点的距离 \\(|AF|\\) 的关系是？',
      opts: ['\\(p=2|AF|\\)', '\\(p=|AF|\\)', '\\(p=4|AF|\\)'], answer: 0,
      why: '顶点 \\(A\\) 也在抛物线上，到焦点和到准线的距离相等，所以 \\(A\\) 是焦点和准线的中点，\\(p=2|AF|\\)。',
    },
  ],
});
