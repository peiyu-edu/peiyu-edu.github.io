// 1.3 空间向量运算的坐标表示 · 3D 舞台页（PY-355）
// 三个实验：点的坐标与七种对称点、两点间距离（沿 x、y、z 三步走）、用坐标判断两个向量垂直。
// 坐标、长度、数量积、角度都由 geom3.js 按当前坐标现算。
import { makeLab, dg } from './rlab.js';
import * as G from './geom3.js';

const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
/** 坐标显示：一位小数，-0.0 写成 0.0 */
const c1 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(1);
const pt = (q, f = c1) => `(${q.map(f).join(', ')})`;

// 对称：每种对称把 (x, y, z) 的哪几个坐标变号
const SYM = {
  xOy: { label: '关于 xOy 平面', s: [1, 1, -1] },
  yOz: { label: '关于 yOz 平面', s: [-1, 1, 1] },
  xOz: { label: '关于 xOz 平面', s: [1, -1, 1] },
  x: { label: '关于 x 轴', s: [1, -1, -1] },
  y: { label: '关于 y 轴', s: [-1, 1, -1] },
  z: { label: '关于 z 轴', s: [-1, -1, 1] },
  O: { label: '关于原点', s: [-1, -1, -1] },
};
const AX = 2.2;

// 长方体里的两点：M 是 AB 中点，N 是 B₁C₁ 中点
const PAIRS = {
  'A-C1': { label: 'A 与 C₁', p: 'A', q: 'C1' },
  'M-C1': { label: 'M 与 C₁（M 是 AB 中点）', p: 'M', q: 'C1' },
  'M-N': { label: 'M 与 N（N 是 B₁C₁ 中点）', p: 'M', q: 'N' },
  'D-B1': { label: 'D 与 B₁', p: 'D', q: 'B1' },
};
const DIMS = [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];
const FACES = G.cuboid(1, 1, 1).F;
function box(a, b, c) {
  const { V } = G.cuboid(a, b, c);
  return { ...V, M: [a / 2, 0, 0], N: [a, b / 2, c] };
}

// 垂直实验：正方体棱长 2，E 在 CC₁ 上（CE = t），F 是 A₁B₁ 中点
const CUBE = G.cuboid(2, 2, 2).V;
const F_PT = [1, 0, 2];

const modes = {
  pt: {
    name: '点的坐标与对称', params: { x: 1.2, y: -0.8, z: 1, s: 'xOy' },
    selects: [{ key: 's', label: '对称方式', options: Object.entries(SYM).map(([k, v]) => [k, v.label]) }],
    sliders: [['x', 'x', -2, 2, 0.1], ['y', 'y', -2, 2, 0.1], ['z', 'z', -2, 2, 0.1]],
    scene(p) {
      const P = [p.x, p.y, p.z], s = SYM[p.s].s, Q = P.map((v, i) => v * s[i]);
      const O = [0, 0, 0], foot = [p.x, p.y, 0];
      const pts = { O, P, 'P′': Q, x: [AX, 0, 0], y: [0, AX, 0], z: [0, 0, AX], xn: [-AX, 0, 0], yn: [0, -AX, 0], zn: [0, 0, -AX] };
      return {
        P: pts, P0: P, Q,
        lines: [
          { id: 'ax', from: [-AX, 0, 0], to: [AX, 0, 0], color: 'fg', arrow: true, width: 2.2 },
          { id: 'ay', from: [0, -AX, 0], to: [0, AX, 0], color: 'fg', arrow: true, width: 2.2 },
          { id: 'az', from: [0, 0, -AX], to: [0, 0, AX], color: 'fg', arrow: true, width: 2.2 },
          { id: 'pz', from: P, to: foot, color: 'c', width: 2.2, dashed: true },
          { id: 'px', from: foot, to: [p.x, 0, 0], color: 'b', width: 2.2, dashed: true },
          { id: 'py', from: foot, to: [0, p.y, 0], color: 'a', width: 2.2, dashed: true },
          { id: 'op', from: O, to: P, color: 'a', arrow: true, width: 4 },
          { id: 'oq', from: O, to: Q, color: 'b', arrow: true, width: 4 },
          { id: 'pq', from: P, to: Q, color: 'no', width: 3, dashed: true },
        ],
        dots: [P, Q],
        anchors: { pq: G.lerp(P, Q, 0.5), foot },
      };
    },
    read(p, sc) {
      const d = G.dist(sc.P0, sc.Q);
      return [
        ['\\(P\\) 的坐标', `<span>${pt(sc.P0)}</span>`, 'p', pt(sc.P0)],
        ['对称点 \\(P\'\\) 的坐标', `<span>${pt(sc.Q)}</span>`, 'q', pt(sc.Q)],
        ['\\(|PP\'|\\)', f4(d), 'd', d],
      ];
    },
    note: (p) => {
      const s = SYM[p.s].s, keep = ['x', 'y', 'z'].filter((_, i) => s[i] > 0);
      return `${SYM[p.s].label}对称：${keep.length ? `${keep.join('、')} 不变，` : ''}其余坐标变号。口诀「关于谁对称，谁不变」。`;
    },
    tags: ['O', 'P', 'P′', 'x', 'y', 'z'],
    callouts: [
      { id: 'pq', title: 'PP′ 的中点', text: '落在对称平面、轴或原点上', at: 'pq', dx: 140, dy: -50 },
      { id: 'foot', title: '(x, y, 0)', text: 'P 在 xOy 平面上的投影', at: 'foot', dx: 130, dy: 50 },
    ],
    def: String.raw`<h3>空间直角坐标系与点的坐标</h3>
      <p class="def">以单位正交基底 \(\{\boldsymbol i,\boldsymbol j,\boldsymbol k\}\) 建系，\(\overrightarrow{OP}=x\boldsymbol i+y\boldsymbol j+z\boldsymbol k\)，有序实数组 \((x,y,z)\) 叫做点 \(P\) 的<b>坐标</b>。</p>
      <p>三条虚线是从 \(P\) 往下落到 \(xOy\) 平面、再分别走到 \(x\) 轴和 \(y\) 轴：先竖直走 \(z\)，再在底面里走 \(x\)、\(y\)。</p>
      <p class="l3-note">对称点：关于哪个坐标平面（或坐标轴）对称，那个平面（或轴）上的坐标不变，其余变号；关于原点对称，三个坐标都变号。</p>`,
  },
  dist: {
    name: '两点间距离', params: { a: 2, b: 1.6, c: 1.4, s: 'A-C1' },
    selects: [{ key: 's', label: '两个点', options: Object.entries(PAIRS).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    scene(p) {
      const V = box(p.a, p.b, p.c), d = PAIRS[p.s];
      const A = V[d.p], B = V[d.q];
      const k1 = [B[0], A[1], A[2]], k2 = [B[0], B[1], A[2]];
      return {
        P: V, solid: { faces: FACES }, A, B, d,
        lines: [
          { id: 'lx', from: A, to: k1, color: 'a', width: 2.6, dashed: true },
          { id: 'ly', from: k1, to: k2, color: 'b', width: 2.6, dashed: true },
          { id: 'lz', from: k2, to: B, color: 'c', width: 2.6, dashed: true },
          { id: 'ab', from: A, to: B, color: 'no', arrow: true, width: 4.4 },
        ],
        anchors: { ab: G.lerp(A, B, 0.55), ly: G.lerp(k1, k2, 0.5) },
      };
    },
    read(p, sc) {
      const v = G.sub(sc.B, sc.A), l = G.len(v);
      return [
        ['\\(\\Delta x\\)', f4(v[0]), 'dx', v[0]],
        ['\\(\\Delta y\\)', f4(v[1]), 'dy', v[1]],
        ['\\(\\Delta z\\)', f4(v[2]), 'dz', v[2]],
        ['两点间距离', f4(l), 'd', l],
      ];
    },
    note: () => '沿 \\(x\\)、\\(y\\)、\\(z\\) 三个方向各走一段，三段两两垂直，所以距离 \\(=\\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}\\)，就是两次勾股定理。',
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'M', 'N'],
    callouts: [
      { id: 'ab', title: '|AB| = √(Δx² + Δy² + Δz²)', text: '', at: 'ab', dx: -170, dy: -60 },
      { id: 'ly', title: '三段两两垂直', text: '沿 x、y、z 各走一段', at: 'ly', dx: 130, dy: 50 },
    ],
    def: String.raw`<h3>两点间距离与中点</h3>
      <p class="def">设 \(P_1(x_1,y_1,z_1)\)，\(P_2(x_2,y_2,z_2)\)，则 \(\overrightarrow{P_1P_2}=(x_2-x_1,\,y_2-y_1,\,z_2-z_1)\)，<br>\(|P_1P_2|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}\)。</p>
      <p>以 \(A\) 为原点、\(AB,AD,AA_1\) 为 \(x,y,z\) 轴建系：\(M\) 是 \(AB\) 中点，坐标是两端点坐标的平均 \(\left(\tfrac a2,0,0\right)\)；\(N\) 是 \(B_1C_1\) 中点 \(\left(a,\tfrac b2,c\right)\)。</p>
      <p class="l3-note">长方体体对角线 \(|AC_1|=\sqrt{a^2+b^2+c^2}\) 是这个公式的特例。</p>`,
  },
  perp: {
    name: '坐标判垂直', params: { t: 0.4 },
    sliders: [['t', 'CE 的长 t', 0, 2, 0.1]],
    buttons: [{ label: '▶ 让 AE ⊥ DF', primary: true, to: () => ({ t: 1 }) }],
    scene(p) {
      const E = [2, 2, p.t], A = CUBE.A, D = CUBE.D;
      const u = G.sub(E, A), v = G.sub(F_PT, D), V2 = G.add(A, v);
      return {
        P: { ...CUBE, E, F: F_PT }, solid: { faces: FACES }, u, v,
        lines: [
          { id: 'u', from: A, to: E, color: 'a', arrow: true, width: 4.4 },
          { id: 'v', from: D, to: F_PT, color: 'b', arrow: true, width: 4.4 },
          { id: 'mv', from: A, to: V2, color: 'b', arrow: true, width: 2.6, dashed: true },
        ],
        arcs: [{ id: 'th', O: A, A: E, B: V2, r: 0.14 }],
        dots: [E, F_PT],
        anchors: { u: G.lerp(A, E, 0.6), v: G.lerp(D, F_PT, 0.55), mv: G.lerp(A, V2, 0.55) },
      };
    },
    read(p, sc) {
      const { u, v } = sc, d = G.dot(u, v), th = Math.acos(Math.max(-1, Math.min(1, d / (G.len(u) * G.len(v)))));
      return [
        ['\\(\\overrightarrow{AE}\\)', `<span>${pt(u)}</span>`, 'u', pt(u)],
        ['\\(\\overrightarrow{DF}\\)', `<span>${pt(v)}</span>`, 'v', pt(v)],
        ['\\(\\overrightarrow{AE}\\cdot\\overrightarrow{DF}\\)', f4(d), 'dot', d],
        ['两个向量的夹角', dg(th), 'th', G.deg(th)],
      ];
    },
    note: (p, sc) => {
      const d = G.dot(sc.u, sc.v);
      return Math.abs(d) < 1e-9
        ? '数量积 \\(=0\\)，\\(\\overrightarrow{AE}\\perp\\overrightarrow{DF}\\)：\\(E\\) 正好是 \\(CC_1\\) 的中点。'
        : `\\(2\\cdot1+2\\cdot(-2)+t\\cdot2=2t-2\\)，现在 \\(t=${c1(p.t)}\\)，数量积 \\(${d > 0 ? '>' : '<'}0\\)，夹角是${d > 0 ? '锐' : '钝'}角。`;
    },
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'E', 'F'],
    callouts: [
      { id: 'mv', title: '把 DF 平移到 A', text: '看夹角', at: 'mv', dx: -150, dy: 40 },
      { id: 'u', title: 'AE = (2, 2, t)', text: '', at: 'u', dx: 130, dy: -60 },
    ],
    def: String.raw`<h3>垂直与平行的坐标条件</h3>
      <p class="def">设 \(\boldsymbol a=(a_1,a_2,a_3)\)，\(\boldsymbol b=(b_1,b_2,b_3)\)，则<br>\(\boldsymbol a\perp\boldsymbol b\iff a_1b_1+a_2b_2+a_3b_3=0\)；<br>\(\boldsymbol a\parallel\boldsymbol b\,(\boldsymbol b\ne\boldsymbol0)\iff \boldsymbol a=\lambda\boldsymbol b\)。</p>
      <p>正方体 \(ABCD\text{-}A_1B_1C_1D_1\) 棱长 2，\(E\) 在 \(CC_1\) 上，\(CE=t\)，\(F\) 是 \(A_1B_1\) 的中点。以 \(A\) 为原点建系：\(\overrightarrow{AE}=(2,2,t)\)，\(\overrightarrow{DF}=(1,-2,2)\)。</p>
      <p class="l3-note">数量积 \(=2t-2\)，所以 \(t=1\) 时垂直。不建系就要找辅助线，建系后只是解一个一次方程。</p>`,
  },
};

makeLab({
  page: 'e1-1-3', modes,
  aria: '可拖动旋转的空间直角坐标系与长方体，演示点的坐标、对称点、两点间距离和用坐标判断垂直',
  quizItems: (show) => [
    {
      q: '点 \\(P(1,-1.5,1.2)\\) 关于 \\(x\\) 轴的对称点是？',
      opts: ['\\((1,1.5,-1.2)\\)', '\\((-1,-1.5,-1.2)\\)', '\\((-1,1.5,1.2)\\)'], answer: 0,
      why: '关于 \\(x\\) 轴对称，\\(x\\) 不变，\\(y\\)、\\(z\\) 变号。',
      show: show('pt', { x: 1, y: -1.5, z: 1.2, s: 'x' }), showLabel: '在模型上看',
    },
    {
      q: '点 \\(P(1.2,0.8,1)\\) 关于 \\(xOy\\) 平面的对称点为 \\(P\'\\)，\\(|PP\'|=\\) ？',
      opts: ['\\(2\\)', '\\(1\\)', '\\(2\\sqrt{2.08}\\)'], answer: 0,
      why: '\\(P\'=(1.2,0.8,-1)\\)，只有 \\(z\\) 变号，\\(|PP\'|=2|z|=2\\)。',
      show: show('pt', { x: 1.2, y: 0.8, z: 1, s: 'xOy' }), showLabel: '在模型上看',
    },
    {
      q: '长方体 \\(AB=2\\)，\\(AD=1\\)，\\(AA_1=2\\)，\\(|AC_1|=\\) ？',
      opts: ['\\(3\\)', '\\(5\\)', '\\(\\sqrt5\\)'], answer: 0,
      why: '\\(A(0,0,0)\\)，\\(C_1(2,1,2)\\)，\\(|AC_1|=\\sqrt{4+1+4}=3\\)。',
      show: show('dist', { a: 2, b: 1, c: 2, s: 'A-C1' }), showLabel: '在模型上看',
    },
    {
      q: '正方体棱长 2，\\(E\\) 在 \\(CC_1\\) 上，\\(F\\) 是 \\(A_1B_1\\) 中点。\\(AE\\perp DF\\) 时 \\(CE=\\) ？',
      opts: ['\\(1\\)', '\\(2\\)', '\\(\\tfrac12\\)'], answer: 0,
      why: '\\(\\overrightarrow{AE}\\cdot\\overrightarrow{DF}=(2,2,t)\\cdot(1,-2,2)=2t-2=0\\)，\\(t=1\\)。',
      show: show('perp', { t: 1 }), showLabel: '在模型上看',
    },
  ],
});
