// 1.4 空间向量的应用 · 3D 舞台页（PY-355）
// 三个实验：平面 A₁BD 的法向量与点到平面的距离、直线与平面 A₁BD 所成的角、二面角 P-BD-A。
// 法向量用叉积，距离、角度都由 geom3.js 按当前坐标现算。
import { makeLab, snap, dg } from './rlab.js';
import * as G from './geom3.js';

const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
const c2 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(2);
const DIMS = [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 1, 2.2, 0.1]];
const FACES = G.cuboid(1, 1, 1).F;
const CUBE_BTN = { label: '▶ 变成正方体', to: (p) => { const s = snap((p.a + p.b + p.c) / 3); return { a: s, b: s, c: s }; } };
/** 平面 A₁BD 的法向量：x/a + y/b + z/c = 1 ⇒ n = (bc, ca, ab) */
const nA1BD = (p) => [p.b * p.c, p.c * p.a, p.a * p.b];

const POINTS = { A: { label: '点 A' }, C: { label: '点 C' }, C1: { label: '点 C₁' } };
const LINES = {
  AC1: { label: 'AC₁', from: 'A', to: 'C1' },
  BC1: { label: 'BC₁', from: 'B', to: 'C1' },
  DC1: { label: 'DC₁', from: 'D', to: 'C1' },
  A1C: { label: 'A₁C', from: 'A1', to: 'C' },
};

const modes = {
  nd: {
    name: '法向量与点面距离', params: { a: 2, b: 1.6, c: 1.4, s: 'C1' },
    selects: [{ key: 's', label: '到平面 A₁BD 的点', options: Object.entries(POINTS).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    buttons: [CUBE_BTN],
    scene(p) {
      const { V } = G.cuboid(p.a, p.b, p.c), n = nA1BD(p);
      const X = V[p.s], H = G.footOnPlane(X, V.B, n);
      const M = G.mul(G.add(G.add(V.A1, V.B), V.D), 1 / 3);
      const tip = G.add(M, G.mul(G.unit(n), 0.8));
      // 垂足处的直角：一边指向 X，另一边沿平面指向离 H 最远的顶点
      const far = [V.A1, V.B, V.D].sort((q, r) => G.dist(r, H) - G.dist(q, H))[0];
      return {
        P: { ...V, H, X }, solid: { faces: FACES }, n, X, H,
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines: [
          { id: 'n', from: M, to: tip, color: 'c', arrow: true, width: 4.4 },
          { id: 'xh', from: X, to: H, color: 'no', width: 3.4, dashed: true },
        ],
        arcs: [{ id: 'rt', O: H, A: X, B: far, r: 0.1 }],
        dots: [X, H],
        anchors: { n: tip, xh: G.lerp(X, H, 0.5), pl: M },
      };
    },
    read(p, sc) {
      const { n } = sc, { V } = G.cuboid(p.a, p.b, p.c);
      const d = G.distPointPlane(sc.X, V.B, n);
      return [
        ['法向量 \\(\\boldsymbol n\\)', `<span>(${n.map(c2).join(', ')})</span>`, 'n', `(${n.map(c2).join(', ')})`],
        ['\\(\\boldsymbol n\\cdot\\overrightarrow{BD}\\)', f4(G.dot(n, G.sub(V.D, V.B))), 'nbd', G.dot(n, G.sub(V.D, V.B))],
        ['\\(\\boldsymbol n\\cdot\\overrightarrow{BA_1}\\)', f4(G.dot(n, G.sub(V.A1, V.B))), 'nba', G.dot(n, G.sub(V.A1, V.B))],
        ['点到平面 \\(A_1BD\\) 的距离', f4(d), 'd', d],
      ];
    },
    note: (p) => `\\(d=\\dfrac{|\\overrightarrow{BX}\\cdot\\boldsymbol n|}{|\\boldsymbol n|}\\)，\\(X\\) 取${POINTS[p.s].label}。\\(A\\)、\\(C\\) 到平面的距离相等，\\(C_1\\) 的距离是它们的 2 倍。`,
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'H'],
    callouts: [
      { id: 'n', title: '法向量 n', text: '与 BD、BA₁ 都垂直', at: 'n', dx: 150, dy: 30 },
      { id: 'xh', title: '距离 = |BX·n| / |n|', text: 'H 是垂足', at: 'xh', dx: -170, dy: 50 },
    ],
    def: String.raw`<h3>平面的法向量与点到平面的距离</h3>
      <p class="def">直线 \(l\perp\alpha\)，取 \(l\) 的方向向量 \(\boldsymbol n\)，\(\boldsymbol n\) 叫做平面 \(\alpha\) 的<b>法向量</b>。求法：设 \(\boldsymbol n=(x,y,z)\)，令它与平面内两个不共线向量的数量积都为 0。</p>
      <p>以 \(A\) 为原点建系，\(\overrightarrow{BD}=(-a,b,0)\)，\(\overrightarrow{BA_1}=(-a,0,c)\)，解得 \(\boldsymbol n=(bc,ca,ab)\)。</p>
      <p class="def">点 \(X\) 到平面的距离 \(d=\dfrac{|\overrightarrow{BX}\cdot\boldsymbol n|}{|\boldsymbol n|}\)（\(B\) 是平面内任一点）：就是 \(\overrightarrow{BX}\) 在法向量方向上投影的长度。</p>`,
  },
  lp: {
    name: '线面角', params: { a: 2, b: 1.6, c: 1.4, s: 'BC1' },
    selects: [{ key: 's', label: '直线（与平面 A₁BD）', options: Object.entries(LINES).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    buttons: [CUBE_BTN],
    scene(p) {
      const { V } = G.cuboid(p.a, p.b, p.c), n = nA1BD(p), L = LINES[p.s];
      const S0 = V[L.from], S1 = V[L.to], u = G.sub(S1, S0);
      // 直线与平面的交点：S0 + t·u 满足 n·(X − B) = 0
      const t = G.dot(n, G.sub(V.B, S0)) / G.dot(n, u), X = G.add(S0, G.mul(u, t));
      const Y = G.dist(S0, X) > G.dist(S1, X) ? S0 : S1;   // 直线上离交点远的一端
      const H = G.footOnPlane(Y, V.B, n);
      const flat = G.dist(H, X) < 1e-6;   // 直线垂直于平面：投影缩成一点
      const far = [V.A1, V.B, V.D].sort((q, r) => G.dist(r, X) - G.dist(q, X))[0];
      return {
        P: { ...V, X, H }, solid: { faces: FACES }, n, u,
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines: [
          { id: 'l', from: S0, to: S1, color: 'a', width: 4.4 },
          { id: 'yh', from: Y, to: H, color: 'c', width: 2.6, dashed: true },
          ...(flat ? [] : [{ id: 'xh', from: X, to: H, color: 'no', width: 3 }]),
        ],
        arcs: [{ id: 'th', O: X, A: Y, B: flat ? far : H, r: 0.2 }],
        dots: [X, H],
        anchors: { l: G.lerp(X, Y, 0.6), th: X, yh: G.lerp(Y, H, 0.5) },
      };
    },
    read(p, sc) {
      const { n, u } = sc, cs = G.dot(u, n) / (G.len(u) * G.len(n)), th = Math.asin(Math.min(1, Math.abs(cs)));
      return [
        ['\\(\\cos\\langle\\boldsymbol u,\\boldsymbol n\\rangle\\)', f4(cs), 'cos', cs],
        ['\\(\\sin\\theta=|\\cos\\langle\\boldsymbol u,\\boldsymbol n\\rangle|\\)', f4(Math.abs(cs)), 'sin', Math.abs(cs)],
        ['线面角 \\(\\theta\\)', dg(th), 'th', G.deg(th)],
      ];
    },
    note: () => '线面角是直线与它在平面内的射影所成的角（红弧）。方向向量 \\(\\boldsymbol u\\) 与法向量 \\(\\boldsymbol n\\) 的夹角和它<b>互余</b>，所以用 \\(\\sin\\theta=|\\cos\\langle\\boldsymbol u,\\boldsymbol n\\rangle|\\)，不是 \\(\\cos\\theta\\)。',
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'H'],
    callouts: [
      { id: 'th', title: '线面角 θ', text: '直线与射影的夹角', at: 'th', dx: -160, dy: 50 },
      { id: 'yh', title: '垂线', text: '端点落到平面上的 H', at: 'yh', dx: 140, dy: -50 },
    ],
    def: String.raw`<h3>直线与平面所成的角</h3>
      <p class="def">设直线 \(l\) 的方向向量为 \(\boldsymbol u\)，平面 \(\alpha\) 的法向量为 \(\boldsymbol n\)，\(l\) 与 \(\alpha\) 所成的角为 \(\theta\)，则 \(\sin\theta=|\cos\langle\boldsymbol u,\boldsymbol n\rangle|=\dfrac{|\boldsymbol u\cdot\boldsymbol n|}{|\boldsymbol u||\boldsymbol n|}\)，\(\theta\in\left[0,\tfrac{\pi}{2}\right]\)。</p>
      <p>平面取 \(A_1BD\)，\(\boldsymbol n=(bc,ca,ab)\)。点「变成正方体」后看 \(AC_1\)：它和法向量同向，线面角是 \(90^\circ\)。</p>`,
  },
  dih: {
    name: '二面角', params: { a: 2, b: 1.6, h: 1.2 },
    sliders: [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['h', 'AP 的高 h', 0.3, 2.2, 0.1]],
    buttons: [{ label: '▶ P 升高', primary: true, to: () => ({ h: 2.2 }) }, { label: '▶ P 降低', to: () => ({ h: 0.3 }) }],
    scene(p) {
      const A = [0, 0, 0], B = [p.a, 0, 0], D = [0, p.b, 0], C = [p.a, p.b, 0], P = [0, 0, p.h];
      const O = G.footOnLine(A, B, G.sub(D, B));   // A 在 BD 上的垂足，也是 P 在 BD 上的垂足
      const n1 = [0, 0, 1], n2 = [p.b * p.h, p.a * p.h, p.a * p.b];
      const k = 0.7;
      return {
        P: { A, B, C, D, P, O }, n1, n2,
        solid: { faces: [['P', 'A', 'B'], ['P', 'A', 'D'], ['P', 'B', 'D'], ['A', 'B', 'D']] },
        planes: [{ id: 'base', pts: ['A', 'B', 'C', 'D'], color: 'b' }, { id: 'pbd', pts: ['P', 'B', 'D'], color: 'c' }],
        lines: [
          { id: 'oa', from: O, to: A, color: 'no', width: 3, dashed: true },
          { id: 'op', from: O, to: P, color: 'no', width: 3 },
          { id: 'n1', from: B, to: G.add(B, G.mul(n1, k)), color: 'b', arrow: true, width: 4 },
          { id: 'n2', from: B, to: G.add(B, G.mul(G.unit(n2), k)), color: 'c', arrow: true, width: 4 },
        ],
        arcs: [{ id: 'th', O, A, B: P, r: 0.14 }],
        anchors: { th: O, n2: G.add(B, G.mul(G.unit(n2), k)), base: C },
      };
    },
    read(p, sc) {
      const { n1, n2 } = sc, cs = G.dot(n1, n2) / (G.len(n1) * G.len(n2)), th = Math.acos(cs);
      const AO = G.len(sc.P.O);
      return [
        ['\\(\\cos\\langle\\boldsymbol n_1,\\boldsymbol n_2\\rangle\\)', f4(cs), 'cos', cs],
        ['二面角 \\(P\\text{-}BD\\text{-}A\\)', dg(th), 'th', G.deg(th)],
        ['\\(\\tan\\angle POA=\\dfrac{AP}{AO}\\)', f4(p.h / AO), 'tan', p.h / AO],
      ];
    },
    note: () => '\\(PO\\perp BD\\)、\\(AO\\perp BD\\)，\\(\\angle POA\\) 是二面角的平面角（红弧）。两个法向量的夹角和它相等或互补，要看图判断二面角是锐角还是钝角；这里是锐角。',
    tags: ['A', 'B', 'C', 'D', 'P', 'O'],
    callouts: [
      { id: 'th', title: '平面角 ∠POA', text: '', at: 'th', dx: -40, dy: 120 },
      { id: 'n2', title: 'n₂ ⊥ 平面 PBD', text: 'n₁ ⊥ 底面', at: 'n2', dx: 140, dy: -50 },
    ],
    def: String.raw`<h3>二面角</h3>
      <p class="def">设平面 \(\alpha,\beta\) 的法向量分别为 \(\boldsymbol n_1,\boldsymbol n_2\)，二面角 \(\alpha\text{-}l\text{-}\beta\) 的大小为 \(\theta\)，则 \(|\cos\theta|=|\cos\langle\boldsymbol n_1,\boldsymbol n_2\rangle|\)。\(\theta\) 是锐角还是钝角，要结合图形判断。</p>
      <p>\(PA\perp\) 底面，\(AP=h\)。底面法向量 \(\boldsymbol n_1=(0,0,1)\)，平面 \(PBD\) 的法向量 \(\boldsymbol n_2=(bh,ah,ab)\)。</p>
      <p class="l3-note">几何法验算：\(AO=\dfrac{ab}{\sqrt{a^2+b^2}}\)，\(\tan\angle POA=\dfrac{h}{AO}\)，和法向量算出的角一致。</p>`,
  },
};

makeLab({
  page: 'e1-1-4', modes,
  aria: '可拖动旋转的长方体与三棱锥，演示平面的法向量、点到平面的距离、线面角和二面角',
  quizItems: (show) => [
    {
      q: '正方体中，直线 \\(AC_1\\) 与平面 \\(A_1BD\\) 是什么关系？',
      opts: ['垂直', '平行', '斜交，成 45°'], answer: 0,
      why: '棱长为 \\(s\\) 时 \\(\\boldsymbol n=(s^2,s^2,s^2)\\)，\\(\\overrightarrow{AC_1}=(s,s,s)\\)，两者平行，所以 \\(AC_1\\perp\\) 平面 \\(A_1BD\\)。',
      show: show('lp', { a: 2, b: 2, c: 2, s: 'AC1' }), showLabel: '在模型上看',
    },
    {
      q: '棱长为 2 的正方体中，\\(C_1\\) 到平面 \\(A_1BD\\) 的距离是？',
      opts: ['\\(\\dfrac{4\\sqrt3}{3}\\)', '\\(\\dfrac{2\\sqrt3}{3}\\)', '\\(2\\sqrt3\\)'], answer: 0,
      why: '\\(\\boldsymbol n=(4,4,4)\\)，\\(\\overrightarrow{BC_1}=(0,2,2)\\)，\\(d=\\dfrac{16}{4\\sqrt3}=\\dfrac{4\\sqrt3}{3}\\)，是体对角线 \\(2\\sqrt3\\) 的 \\(\\tfrac23\\)。',
      show: show('nd', { a: 2, b: 2, c: 2, s: 'C1' }), showLabel: '在模型上看',
    },
    {
      q: '直线的方向向量与平面法向量的夹角是 \\(60^\\circ\\)，直线与平面所成的角是？',
      opts: ['\\(30^\\circ\\)', '\\(60^\\circ\\)', '\\(120^\\circ\\)'], answer: 0,
      why: '\\(\\sin\\theta=|\\cos60^\\circ|=\\tfrac12\\)，\\(\\theta=30^\\circ\\)：线面角与「方向向量和法向量的夹角」互余。',
    },
    {
      q: '\\(PA\\perp\\) 底面，\\(P\\) 沿 \\(AA_1\\) 方向升高时，二面角 \\(P\\text{-}BD\\text{-}A\\) 怎样变化？',
      opts: ['变大', '变小', '不变'], answer: 0,
      why: '\\(\\tan\\angle POA=\\dfrac{h}{AO}\\)，\\(AO\\) 不变，\\(h\\) 越大角越大，但始终小于 \\(90^\\circ\\)。',
      show: show('dih', { a: 2, b: 1.6, h: 2.2 }), showLabel: '在模型上看',
    },
  ],
});
