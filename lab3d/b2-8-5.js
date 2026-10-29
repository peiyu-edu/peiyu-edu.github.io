// 8.5 空间直线、平面的平行 · 3D 舞台页（PY-337）
// 三个实验：线面平行的判定（四棱锥里 E 在 PC 上滑动）、面面平行的判定（长方体两个对角截面）、
// 面面平行的性质（平行平面被第三个平面所截）。所有角度、距离、面积由 geom3.js 按当前坐标现算。
import { makeLab, relRow, dg, f2, snap } from './rlab.js';
import * as G from './geom3.js';

const modes = {
  lp: {
    name: '线面平行', params: { a: 1.6, h: 1.8, t: 0.3 },
    sliders: [['a', '底面边长', 1.2, 2.2, 0.1], ['h', '高 PA', 1.2, 2.4, 0.1], ['t', 'E 的位置', 0.2, 0.8, 0.05]],
    buttons: [{ label: '▶ 把 E 移到 PC 中点', primary: true, to: () => ({ t: 0.5 }) }],
    scene(p) {
      // 四棱锥 P-ABCD：底面是边长 a 的正方形，PA ⊥ 底面，PA = h；O 是 AC 与 BD 的交点；E = P + t·(C − P)
      const A = [0, 0, 0], B = [p.a, 0, 0], C = [p.a, p.a, 0], D = [0, p.a, 0], P = [0, 0, p.h];
      const O = G.lerp(A, C, 0.5), E = G.lerp(P, C, p.t);
      const n = G.normal(B, D, E);
      const r = G.linePlane(P, G.sub(A, P), B, n);
      return {
        P: { A, B, C, D, P, O, E },
        solid: { faces: [['A', 'B', 'C', 'D'], ['P', 'A', 'B'], ['P', 'B', 'C'], ['P', 'C', 'D'], ['P', 'D', 'A']] },
        planes: [{ id: 'pl', pts: ['B', 'D', 'E'], color: 'b' }],
        lines: [{ id: 'pa', from: P, to: A, color: 'c' }, { id: 'oe', from: O, to: E, color: 'no' }, { id: 'ac', from: A, to: C, color: 'muted', width: 2 }],
        dots: [O, E],
        anchors: { pa: G.lerp(P, A, 0.5), oe: G.lerp(O, E, 0.5), pl: G.lerp(B, D, 0.75) },
        r, OE: G.sub(E, O), PA: G.sub(A, P),
      };
    },
    read(p, sc) {
      const psi = G.lineAngle(sc.OE, sc.PA);
      return [
        ['\\(PE:EC\\)', `${f2(p.t / (1 - p.t))}`, 'ratio', p.t / (1 - p.t)],
        ['\\(OE\\) 与 \\(PA\\) 的夹角', dg(psi), 'psi', G.deg(psi)],
        ['\\(PA\\) 与平面 \\(BDE\\) 所成的角', dg(sc.r.angle), 'phi', G.deg(sc.r.angle)],
        relRow('\\(PA\\) 与平面 \\(BDE\\)', sc.r.rel),
      ];
    },
    note: (p, sc) => (sc.r.rel === 'parallel' ? '\\(E\\) 是 \\(PC\\) 中点：\\(OE\\) 是 \\(\\triangle PAC\\) 的中位线，\\(OE\\parallel PA\\)，所以 \\(PA\\parallel\\) 平面 \\(BDE\\)。'
      : '\\(E\\) 不是中点时 \\(OE\\) 与 \\(PA\\) 不平行，\\(PA\\) 会穿过平面 \\(BDE\\)。'),
    tags: ['P', 'A', 'B', 'C', 'D', 'O', 'E'],
    callouts: [
      { id: 'pa', title: '直线 PA', text: '在平面 BDE 外', at: 'pa', dx: -150, dy: -40 },
      { id: 'oe', title: '直线 OE', text: '在平面 BDE 内', at: 'oe', dx: 130, dy: -70 },
      { id: 'pl', title: '平面 BDE', text: '', at: 'pl', dx: 120, dy: 70 },
    ],
    def: String.raw`<h3>直线与平面平行的判定</h3>
      <p class="def">如果<b>平面外</b>一条直线与此平面<b>内</b>的一条直线平行，那么该直线与此平面平行。<br>\(a\not\subset\alpha,\ b\subset\alpha,\ a\parallel b\Rightarrow a\parallel\alpha\)</p>
      <p>四棱锥 \(P\text{-}ABCD\) 的底面是正方形，\(O\) 是 \(AC\)、\(BD\) 的交点，\(E\) 在 \(PC\) 上。要证 \(PA\parallel\) 平面 \(BDE\)，就在平面 \(BDE\) 里找一条和 \(PA\) 平行的线：\(O\) 是 \(AC\) 中点，只有 \(E\) 也是 \(PC\) 中点时，\(OE\) 才是 \(\triangle PAC\) 的中位线，\(OE\parallel PA\)。</p>
      <p><b>性质定理</b>：一条直线与一个平面平行，如果过该直线的平面与此平面相交，那么该直线与交线平行。</p>`,
  },
  pp: {
    name: '面面平行', params: { a: 1.8, b: 1.4, c: 1.2 },
    sliders: [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 1, 2.2, 0.1]],
    buttons: [{ label: '▶ 变成正方体', primary: true, to: (p) => { const s = snap((p.a + p.b + p.c) / 3); return { a: s, b: s, c: s }; } }],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const G1 = G.lerp(V.A, V.C1, 1 / 3), G2 = G.lerp(V.A, V.C1, 2 / 3);
      const n1 = G.normal(V.A1, V.B, V.D), n2 = G.normal(V.C, V.B1, V.D1);
      return {
        P: { ...V, G1, G2 }, solid: { faces: F },
        planes: [{ id: 'p1', pts: ['A1', 'B', 'D'], color: 'b' }, { id: 'p2', pts: ['C', 'B1', 'D1'], color: 'c' }],
        lines: [
          { id: 'j', from: V.A1, to: V.B, color: 'a', width: 3.4 }, { id: 'j', from: V.D1, to: V.C, color: 'a', width: 3.4 },
          { id: 'k', from: V.A1, to: V.D, color: 'hl', width: 3.4 }, { id: 'k', from: V.B1, to: V.C, color: 'hl', width: 3.4 },
          { id: 'diag', from: V.A, to: V.C1, color: 'no', width: 2.6 },
        ],
        dots: [G1, G2],
        anchors: { p1: G.lerp(V.B, V.D, 0.5), p2: G.lerp(V.B1, V.D1, 0.5), j: G.lerp(V.D1, V.C, 0.5), k: G.lerp(V.A1, V.D, 0.5), diag: G.lerp(V.A, V.C1, 0.15) },
        r: G.planePlane(V.A1, n1, V.C, n2), G1, G2,
      };
    },
    read(p, sc) {
      const l = G.dist(sc.P.A, sc.P.C1);
      return [
        relRow('平面 \\(A_1BD\\) 与平面 \\(CB_1D_1\\)', sc.r.rel),
        ['两平面间的距离 \\(d\\)', sc.r.dist.toFixed(4), 'd', sc.r.dist],
        ['体对角线 \\(AC_1\\)', l.toFixed(4), 'l', l],
        ['\\(AG_1=G_1G_2=G_2C_1\\)', G.dist(sc.G1, sc.G2).toFixed(4), 'g', G.dist(sc.G1, sc.G2)],
      ];
    },
    note: () => String.raw`\(d=\dfrac{1}{\sqrt{\frac1{a^2}+\frac1{b^2}+\frac1{c^2}}}\)。只有正方体时 \(AC_1\) 垂直于两个平面，\(d\) 才等于 \(G_1G_2\)。`,
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'G1', 'G2'],
    callouts: [
      { id: 'j', title: 'A₁B ∥ D₁C', text: '对角面 A₁BCD₁ 是平行四边形', at: 'j', dx: 130, dy: 60 },
      { id: 'k', title: 'A₁D ∥ B₁C', text: '对角面 A₁B₁CD 是平行四边形', at: 'k', dx: -160, dy: 60 },
      { id: 'diag', title: '体对角线 AC₁', text: '被两个平面三等分', at: 'diag', dx: -150, dy: -40 },
    ],
    def: String.raw`<h3>平面与平面平行的判定</h3>
      <p class="def">如果一个平面内的<b>两条相交直线</b>与另一个平面平行，那么这两个平面平行。</p>
      <p>长方体中 \(A_1B\parallel D_1C\)，\(D_1C\subset\) 平面 \(CB_1D_1\)，所以 \(A_1B\parallel\) 平面 \(CB_1D_1\)；同理 \(A_1D\parallel\) 平面 \(CB_1D_1\)。\(A_1B\)、\(A_1D\) 是平面 \(A_1BD\) 内两条相交直线，所以平面 \(A_1BD\parallel\) 平面 \(CB_1D_1\)。</p>
      <p class="l3-note">两个平面的方程是 \(\frac xa+\frac yb+\frac zc=1\) 和 \(=2\)，体对角线 \(AC_1\) 上的点 \((sa,sb,sc)\) 代入得 \(3s=1\)、\(3s=2\)，所以 \(AC_1\) 被三等分。</p>`,
  },
  cut: {
    name: '平行平面被截', params: { a: 1.8, b: 1.6, c: 1.2, q: 0.7 },
    sliders: [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1], ['q', 'E 的位置', 0.2, 0.9, 0.05]],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const E = G.lerp(V.A1, V.D1, p.q), Fp = G.lerp(V.B1, V.C1, p.q);
      return {
        P: { ...V, E, F: Fp }, solid: { faces: F },
        planes: [{ id: 'bot', pts: ['A', 'B', 'C', 'D'], color: 'c' }, { id: 'top', pts: ['A1', 'B1', 'C1', 'D1'], color: 'c' }, { id: 'cut', pts: ['A', 'B', 'F', 'E'], color: 'b' }],
        lines: [{ id: 'ln', from: V.A, to: V.B, color: 'no' }, { id: 'ln', from: E, to: Fp, color: 'no' }],
        arcs: [{ id: 'th', O: V.A, A: V.D, B: E, r: 0.2 }],
        anchors: { ln: G.lerp(E, Fp, 0.5), cut: G.lerp(G.lerp(V.A, V.B, 0.5), G.lerp(E, Fp, 0.5), 0.5), top: G.lerp(V.C1, V.D1, 0.5), th: V.A },
        V, E, Fp,
      };
    },
    read(p, sc) {
      const ang = G.lineAngle(G.sub(sc.V.B, sc.V.A), G.sub(sc.Fp, sc.E));
      const area = G.dist(sc.V.A, sc.V.B) * G.dist(sc.V.A, sc.E);
      const th = G.lineAngle(G.sub(sc.V.D, sc.V.A), G.sub(sc.E, sc.V.A));
      return [
        relRow('交线 \\(AB\\) 与 \\(EF\\)', G.lineLine(sc.V.A, G.sub(sc.V.B, sc.V.A), sc.E, G.sub(sc.Fp, sc.E)).rel),
        ['\\(AB\\) 与 \\(EF\\) 的夹角', dg(ang), 'ang', G.deg(ang)],
        ['截面 \\(ABFE\\) 的面积', area.toFixed(4), 'Ssec', area],
        ['截面与底面的夹角 \\(\\angle DAE\\)', dg(th), 'th', G.deg(th)],
      ];
    },
    note: () => '截面 \\(ABFE\\) 是矩形：\\(AB\\perp\\) 平面 \\(ADD_1A_1\\)，所以 \\(AB\\perp AE\\)。',
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'E', 'F'],
    callouts: [
      { id: 'ln', title: '两条交线 AB ∥ EF', text: '平行平面被第三个平面所截', at: 'ln', dx: 120, dy: -70 },
      { id: 'cut', title: '截面 γ', text: '过 AB 和 A₁D₁ 上的点 E', at: 'cut', dx: -160, dy: -30 },
      { id: 'th', title: '∠DAE', text: '截面与底面的二面角', at: 'th', dx: -140, dy: 50 },
    ],
    def: String.raw`<h3>平面与平面平行的性质</h3>
      <p class="def">两个平面平行，如果另一个平面与这两个平面相交，那么两条交线平行。<br>\(\alpha\parallel\beta,\ \alpha\cap\gamma=a,\ \beta\cap\gamma=b\Rightarrow a\parallel b\)</p>
      <p>长方体的上、下底面互相平行。过棱 \(AB\) 和上底面棱 \(A_1D_1\) 上一点 \(E\) 作截面 \(\gamma\)：它与下底面交于 \(AB\)，与上底面交于 \(EF\)，两条交线平行，不论 \(E\) 在哪里。</p>
      <p class="l3-note">截面面积 \(=AB\cdot AE=a\sqrt{(qb)^2+c^2}\)，其中 \(q=\dfrac{A_1E}{A_1D_1}\)。</p>`,
  },
};

makeLab({
  page: 'b2-8-5', modes,
  aria: '可拖动旋转的四棱锥与长方体，演示线面平行、面面平行的判定与性质',
  quizItems: (show) => [
    {
      q: '四棱锥 \\(P\\text{-}ABCD\\) 底面是正方形，\\(O\\) 是 \\(AC\\)、\\(BD\\) 的交点，\\(E\\) 在 \\(PC\\) 上。要使 \\(PA\\parallel\\) 平面 \\(BDE\\)，\\(PE:EC\\) 应为？',
      opts: ['\\(1:1\\)', '\\(1:2\\)', '\\(2:1\\)'], answer: 0,
      why: '平面 \\(BDE\\) 与平面 \\(PAC\\) 的交线是 \\(OE\\)。由线面平行的性质，\\(PA\\parallel OE\\)；\\(O\\) 是 \\(AC\\) 中点，所以 \\(E\\) 是 \\(PC\\) 中点。',
      show: show('lp', { t: 0.5 }), showLabel: '在模型上看',
    },
    {
      q: '平面 \\(\\alpha\\) 内有两条直线都平行于平面 \\(\\beta\\)，那么 \\(\\alpha\\parallel\\beta\\) 吗？',
      opts: ['一定', '不一定'], answer: 1,
      why: '这两条直线必须<b>相交</b>。如果它们互相平行，\\(\\alpha\\) 与 \\(\\beta\\) 仍可能相交（两条直线都平行于交线）。',
    },
    {
      q: '棱长为 1 的正方体中，平面 \\(A_1BD\\) 与平面 \\(CB_1D_1\\) 之间的距离是？',
      opts: ['\\(\\dfrac{\\sqrt3}{3}\\)', '\\(\\dfrac{\\sqrt2}{2}\\)', '\\(\\dfrac12\\)'], answer: 0,
      why: '体对角线 \\(AC_1=\\sqrt3\\) 垂直于这两个平面，且被它们三等分，所以距离是 \\(\\dfrac{\\sqrt3}{3}\\approx0.58\\)。',
      show: show('pp', { a: 1, b: 1, c: 1 }), showLabel: '看棱长为 1 的正方体',
    },
    {
      q: '两个平行平面被第三个平面所截，得到的两条交线？',
      opts: ['平行', '相交', '可能异面'], answer: 0,
      why: '两条交线都在第三个平面内（共面），又分别在两个平行平面内（没有公共点），所以平行。',
      show: show('cut', { q: 0.5 }), showLabel: '在模型上看',
    },
  ],
});
