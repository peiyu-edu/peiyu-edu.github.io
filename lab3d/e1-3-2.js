// 3.2 双曲线 · 3D 舞台页（PY-362）
// 两个实验：比母线还陡的平面截两叶圆锥得到双曲线（a、c 从截口实量）；丹德林双球（两叶各一个）证明 |PF₁ − PF₂| 是定值。
// 圆锥顶点在原点、轴是 z 轴，半顶角 α；截面与水平面成 β 角（β > 90° − α），到顶点的距离 H。几何约定见 conic.js。
import { makeLab } from './rlab.js';
import { DUR } from './stage.js';
import * as G from './geom3.js';
import { RAD, f4, ring, coneSurface, generators, frame, quad, onGen } from './conic.js';

const H = 0.5;          // 顶点到截面的距离
const TH = 1.2;         // P 在一支上走的范围：θ ∈ [−TH, TH]
const NB = 48;          // 每支的采样点数

/** 圆锥 + 截面的全部几何量 */
function conic(p) {
  const F = frame(p.al, p.be, H), { u, w, sa, cb } = F;
  const A1 = F.hit(1), A2 = F.hit(-1);                  // 下叶、上叶上的顶点（实轴端点）
  const M = G.lerp(A1, A2, 0.5), a = G.dist(A1, A2) / 2;
  const B1 = F.ball(H / (cb + sa)), B2 = F.ball(H / (cb - sa));   // 下叶小球、上叶大球（k < 0）
  const c = G.dist(B1.F, B2.F) / 2, b = Math.sqrt(Math.max(0, c * c - a * a));
  // 双曲线上的点：σ = −1 下支（靠近 A₁、F₁），σ = +1 上支
  const pt = (sg, th) => G.add(M, G.add(G.mul(u, sg * a * Math.cosh(th)), G.mul(w, b * Math.sinh(th))));
  return { ...F, A1, A2, M, a, b, c, B1, B2, pt };
}

function scene0(p) {
  const K = conic(p), sb = Math.sin(K.be), ch = Math.cosh(TH);
  const zLo = K.M[2] - K.a * ch * sb, zHi = K.M[2] + K.a * ch * sb;
  const Z = Math.max(-zLo, zHi, -K.B2.k * (1 + K.sa), K.B1.k * (1 + K.sa)) * 1.12;
  const cone = coneSurface(K.al, Z, Z);
  // 两支画到圆锥口沿为止
  const branch = (sg) => {
    const zEnd = sg < 0 ? -Z : Z, m = (sg * (zEnd - K.M[2])) / (K.a * sb);
    const T = Math.acosh(Math.max(1, m));
    return Array.from({ length: NB + 1 }, (_, i) => K.pt(sg, -T + (2 * T * i) / NB));
  };
  const br = [branch(-1), branch(1)];
  const ends = br.flat().map((q) => G.sub(q, K.M));
  const eu = Math.max(...ends.map((d) => Math.abs(G.dot(d, K.u)))) + 0.15;
  const ew = Math.max(...ends.map((d) => Math.abs(G.dot(d, K.w)))) + 0.15;
  const R = Z * Math.tan(K.al);
  const rimP = { r1: [R, 0, -Z], r2: [-R, 0, -Z], r3: [R, 0, Z], r4: [-R, 0, Z] };
  // 渐近线：过中心 M，方向 a·u ± b·w
  const L = Math.hypot(eu, ew);
  const asy = [1, -1].map((s) => G.unit(G.add(G.mul(K.u, K.a), G.mul(K.w, s * K.b))))
    .map((d, i) => ({ id: `as${i + 1}`, from: G.add(K.M, G.mul(d, -L)), to: G.add(K.M, G.mul(d, L)), color: 'c', width: 2.2, dashed: true }));
  return { K, Z, cone, br, plane: quad(K.M, K.u, K.w, eu, ew), rimP, asy, gens: generators(K.al, Z, Z) };
}

const modes = {
  cut: {
    name: '平面截两叶圆锥', params: { al: 30, be: 80 },
    sliders: [['al', '圆锥半顶角 α（°）', 25, 40, 1], ['be', '截面倾角 β（°）', 75, 90, 1]],
    buttons: [{ label: '▶ 竖直截（平行于轴）', primary: true, to: () => ({ be: 90 }) }, { label: '▶ 接近母线', to: () => ({ be: 75 }) }],
    scene(p) {
      const s = scene0(p), { K } = s;
      return {
        P: { V: [0, 0, 0], A1: K.A1, A2: K.A2, O: K.M, ...s.rimP },
        K,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.2 }],
        planes: [{ id: 'pl', pts: s.plane, color: 'b' }],
        curves: [
          ...s.cone.rims.map((pts, i) => ({ id: `rim${i}`, pts, closed: true, color: 'fg', width: 2 })),
          { id: 'h1', pts: s.br[0], color: 'no', width: 4 },
          { id: 'h2', pts: s.br[1], color: 'no', width: 4 },
        ],
        lines: [...s.gens, ...s.asy, { id: 'ax', from: K.A1, to: K.A2, color: 'c', width: 2.6 }],
        dots: [K.B1.F, K.B2.F],
        anchors: { h2: s.br[1][Math.round(NB * 0.8)], as1: s.asy[0].to, pl: s.plane[1] },
      };
    },
    read(p, sc) {
      const { a, b, c } = sc.K;
      return [
        ['实半轴 \\(a\\)', f4(a), 'a', a],
        ['虚半轴 \\(b=\\sqrt{c^2-a^2}\\)', f4(b), 'b', b],
        ['半焦距 \\(c\\)', f4(c), 'c', c],
        ['离心率 \\(e=\\dfrac ca\\)', f4(c / a), 'e', c / a],
      ];
    },
    note: (p) => (p.be === 90
      ? '截面平行于轴：两支一样大，\\(e=\\dfrac{1}{\\cos\\alpha}\\)。'
      : '截面比母线还陡，同时截到上、下两叶，截口分成两支。可以验证 \\(e=\\dfrac{\\sin\\beta}{\\cos\\alpha}>1\\)；β 减小到 \\(90^\\circ-\\alpha\\) 时截面平行于母线，上面一支跑到无穷远，就变成抛物线。'),
    tags: ['V', 'A1', 'A2', 'O'],
    callouts: [
      { id: 'h2', title: '截口：双曲线', text: '上、下两支', at: 'h2', dx: 140, dy: -30 },
      { id: 'as1', title: '渐近线', text: '平行于截面里的两条母线方向', at: 'as1', dx: -160, dy: -40 },
    ],
    def: String.raw`<h3>双曲线从哪里来</h3>
      <p class="def">平面内与两个定点 \(F_1,F_2\) 的距离之差的绝对值等于非零常数（小于 \(|F_1F_2|\)）的点的轨迹叫做<b>双曲线</b>。两个定点叫做焦点，两焦点间的距离叫做焦距。</p>
      <p>圆锥要看成上下两叶。截面不过顶点、又比母线陡（\(\beta>90^\circ-\alpha\)）时，它同时截到两叶，截口是双曲线的两支。</p>
      <p class="l3-note">\(a\) 是两顶点 \(A_1A_2\) 距离的一半，\(c\) 是两个焦点（下一个实验里两个球与截面的切点）距离的一半，都从几何里实量；\(b\) 按 \(c^2=a^2+b^2\) 算出。虚线是渐近线。</p>`,
  },
  dand: {
    name: '丹德林双球', params: { al: 30, be: 80, br: 'lo', th: 1.1 },
    sliders: [['th', '点 P 沿这一支的位置', -TH, TH, 0.05], ['be', '截面倾角 β（°）', 75, 90, 1]],
    selects: [{ key: 'br', label: 'P 在哪一支', options: [['lo', '下面一支（靠近 F₁）'], ['up', '上面一支（靠近 F₂）']] }],
    buttons: [
      { label: '▶ P 沿这一支走', primary: true, ms: DUR.tour, to: (p) => ({ th: p.th >= 0 ? -TH : TH }) },
      { label: '▶ 换一支', to: (p) => ({ br: p.br === 'lo' ? 'up' : 'lo' }) },
    ],
    scene(p) {
      const s = scene0(p), { K } = s, P = K.pt(p.br === 'lo' ? -1 : 1, p.th);
      const Q1 = onGen(P, K.B1.zc), Q2 = onGen(P, K.B2.zc);
      const far = onGen(P, P[2] < 0 ? s.Z : -s.Z);   // 过 P 的母线穿过顶点一直画到另一叶
      return {
        P: { V: [0, 0, 0], P, F1: K.B1.F, F2: K.B2.F, Q1, Q2, ...s.rimP },
        K, Pt: P, Q1, Q2,
        surfaces: [{ id: 'cone', polys: s.cone.polys, color: 'a', opacity: 0.14 }],
        spheres: [{ id: 's1', c: K.B1.C, r: K.B1.r, color: 'c' }, { id: 's2', c: K.B2.C, r: K.B2.r, color: 'c' }],
        planes: [{ id: 'pl', pts: s.plane, color: 'b' }],
        curves: [
          ...s.cone.rims.map((pts, i) => ({ id: `rim${i}`, pts, closed: true, color: 'fg', width: 1.6 })),
          { id: 'h1', pts: s.br[0], color: 'no', width: 3 },
          { id: 'h2', pts: s.br[1], color: 'no', width: 3 },
          { id: 'c1', pts: ring(K.B1.zc, K.B1.rc), closed: true, color: 'c', width: 2.4 },
          { id: 'c2', pts: ring(K.B2.zc, K.B2.rc), closed: true, color: 'c', width: 2.4 },
        ],
        lines: [...s.gens,
          { id: 'gen', from: P, to: far, color: 'fg', width: 1.8, dashed: true },
          { id: 'pq', from: Q1, to: Q2, color: 'hl', width: 4 },
          { id: 'pf1', from: P, to: K.B1.F, color: 'a', width: 4 },
          { id: 'pf2', from: P, to: K.B2.F, color: 'b', width: 4 },
        ],
        dots: [P, K.B1.F, K.B2.F, Q1, Q2],
        anchors: { pq: G.lerp(Q1, [0, 0, 0], 0.5), s2: K.B2.C, pf2: G.lerp(P, K.B2.F, 0.5) },
      };
    },
    read(p, sc) {
      const P = sc.Pt, pf1 = G.dist(P, sc.K.B1.F), pf2 = G.dist(P, sc.K.B2.F);
      const pq1 = G.dist(P, sc.Q1), pq2 = G.dist(P, sc.Q2), gen = G.dist(sc.Q1, sc.Q2);
      return [
        ['\\(|PF_1|\\)', f4(pf1), 'pf1', pf1],
        ['\\(|PQ_1|\\)（切线长）', f4(pq1), 'pq1', pq1],
        ['\\(|PF_2|\\)', f4(pf2), 'pf2', pf2],
        ['\\(|PQ_2|\\)（切线长）', f4(pq2), 'pq2', pq2],
        ['\\(\\big||PF_1|-|PF_2|\\big|\\)', f4(Math.abs(pf1 - pf2)), 'diff', Math.abs(pf1 - pf2)],
        ['两切圆间的母线长 \\(|Q_1Q_2|\\)', f4(gen), 'gen', gen],
      ];
    },
    note: () => '切线长相等：\\(|PF_1|=|PQ_1|\\)，\\(|PF_2|=|PQ_2|\\)。两个切圆在顶点两侧，\\(Q_1,Q_2\\) 一个在 \\(P\\) 和顶点之间、一个在顶点另一边，所以 \\(\\big||PF_1|-|PF_2|\\big|=|Q_1Q_2|\\)，是穿过顶点的一段母线，和 \\(P\\) 在哪无关。',
    tags: ['V', 'P', 'F1', 'F2', 'Q1', 'Q2'],
    callouts: [
      { id: 'pq', title: 'Q₁Q₂', text: '穿过顶点的一段母线', at: 'pq', dx: -170, dy: -20 },
      { id: 's2', title: '上叶的球', text: '切圆锥，也切截面', at: 's2', dx: 150, dy: -40 },
      { id: 'pf2', title: 'PF₂ = PQ₂', text: '切线长相等', at: 'pf2', dx: 150, dy: 40 },
    ],
    def: String.raw`<h3>丹德林双球：为什么距离之差是定值</h3>
      <p>在下叶、上叶里各放一个球，都和圆锥相切（切出两个圆），也都和截面相切，切点就是 \(F_1\)、\(F_2\)。</p>
      <p class="def">设 \(P\) 是截口上任一点，过 \(P\) 的母线交两个切圆于 \(Q_1,Q_2\)。\(|PF_1|=|PQ_1|\)，\(|PF_2|=|PQ_2|\)（切线长相等）。<br>\(Q_1,Q_2\) 在顶点两侧，所以 \(\big||PF_1|-|PF_2|\big|=\big||PQ_1|-|PQ_2|\big|=|Q_1Q_2|\)，是定值。</p>
      <p class="l3-note">这就证明了截口是以 \(F_1,F_2\) 为焦点、\(2a=|Q_1Q_2|\) 的双曲线。P 在下支时离 \(F_1\) 近，在上支时离 \(F_2\) 近。</p>`,
  },
};

makeLab({
  page: 'e1-3-2', modes,
  aria: '可拖动旋转的两叶圆锥、截面与两个内切球，演示双曲线是圆锥的截口以及焦点的来历',
  quizItems: (show) => [
    {
      q: '截面比母线还陡（\\(\\beta>90^\\circ-\\alpha\\)）、又不过顶点，截口是？',
      opts: ['双曲线', '椭圆', '抛物线'], answer: 0,
      why: '这样的平面同时截到圆锥的上、下两叶，截口分成两支，是双曲线；\\(e=\\dfrac{\\sin\\beta}{\\cos\\alpha}>1\\)。',
      show: show('cut', { al: 30, be: 80 }), showLabel: '在模型上看',
    },
    {
      q: '丹德林双球中，\\(\\big||PF_1|-|PF_2|\\big|\\) 等于？',
      opts: ['两个切圆之间、穿过顶点的一段母线长', '两个球的半径之差', '两球心的距离'], answer: 0,
      why: '\\(|PF_1|=|PQ_1|\\)，\\(|PF_2|=|PQ_2|\\)，\\(Q_1,Q_2\\) 在顶点两侧，相减得 \\(|Q_1Q_2|\\)。',
      show: show('dand', { al: 30, be: 80, br: 'lo', th: 1.1 }), showLabel: '在模型上看',
    },
    {
      q: '\\(\\alpha=30^\\circ\\)，截面平行于轴（\\(\\beta=90^\\circ\\)），截口双曲线的离心率是？',
      opts: ['\\(\\dfrac{2\\sqrt3}{3}\\)', '\\(2\\)', '\\(\\sqrt2\\)'], answer: 0,
      why: '\\(e=\\dfrac{\\sin90^\\circ}{\\cos30^\\circ}=\\dfrac{2}{\\sqrt3}=\\dfrac{2\\sqrt3}{3}\\)。',
      show: show('cut', { al: 30, be: 90 }), showLabel: '在模型上看',
    },
    {
      q: 'P 在上面一支（靠近 \\(F_2\\)）时，哪个更长？',
      opts: ['\\(|PF_1|\\)', '\\(|PF_2|\\)', '一样长'], answer: 0,
      why: 'P 离 \\(F_2\\) 那一支近，\\(|PF_1|-|PF_2|=2a>0\\)。',
      show: show('dand', { al: 30, be: 80, br: 'up', th: 0.3 }), showLabel: '在模型上看',
    },
  ],
});
