// 1.2 空间向量基本定理 · 3D 舞台页（PY-355）
// 三个实验：用不共面的 e1、e2、e3 分解定点 P（e3 越贴近底面系数越大）、单位正交分解、三个向量能不能做基底。
// 系数用克拉默法则、体积用混合积，都由 geom3.js 按当前坐标现算。
import { makeLab } from './rlab.js';
import * as G from './geom3.js';

const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
const det = (a, b, c) => G.dot(a, G.cross(b, c));
const FACES = G.cuboid(1, 1, 1).F;
/** 平行六面体 ABCD-A1B1C1D1：A 在原点，AB = a，AD = b，AA1 = c */
function para(a, b, c) {
  const C = G.add(a, b);
  return { A: [0, 0, 0], B: a, C, D: b, A1: c, B1: G.add(a, c), C1: G.add(C, c), D1: G.add(b, c) };
}

// 分解实验：底面两个基向量固定，e3 与底面成 ψ 角，P 是固定的「吊灯」
const E1 = [1.4, 0, 0], E2 = [0.5, 1.2, 0], PT = [1.5, 1.3, 1.1];
const e3 = (psi) => { const r = (psi * Math.PI) / 180; return [-0.72 * Math.cos(r), 0.96 * Math.cos(r), 1.2 * Math.sin(r)]; };

const TRIPLES = {
  'AB-AD-AA1': { label: 'AB、AD、AA₁', v: [['A', 'B'], ['A', 'D'], ['A', 'A1']] },
  'AB-AD-AC': { label: 'AB、AD、AC', v: [['A', 'B'], ['A', 'D'], ['A', 'C']] },
  'AC-AB1-AD1': { label: 'AC、AB₁、AD₁', v: [['A', 'C'], ['A', 'B1'], ['A', 'D1']] },
  'A1B-A1D-BD': { label: 'A₁B、A₁D、BD', v: [['A1', 'B'], ['A1', 'D'], ['B', 'D']] },
};
const VT = (s) => `\\overrightarrow{${s[0].replace(/(\d)/, '_$1')}${s[1].replace(/(\d)/, '_$1')}}`;
const DIMS = [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];

const modes = {
  dec: {
    name: '基底分解', params: { psi: 60 },
    sliders: [['psi', 'e₃ 与底面的夹角 ψ（°）', 30, 90, 5]],
    buttons: [{ label: '▶ e₃ 立直', primary: true, to: () => ({ psi: 90 }) }, { label: '▶ e₃ 倒向底面', to: () => ({ psi: 30 }) }],
    scene(p) {
      const E3 = e3(p.psi), D = det(E1, E2, E3);
      const x = det(PT, E2, E3) / D, y = det(E1, PT, E3) / D, z = det(E1, E2, PT) / D;
      const Q = para(G.mul(E1, x), G.mul(E2, y), G.mul(E3, z));
      const O = Q.A;
      return {
        P: { ...Q, O, P: Q.C1 }, solid: { faces: FACES }, x, y, z, D,
        lines: [
          { id: 'xe', from: O, to: Q.B, color: 'a', width: 2.6, dashed: true },
          { id: 'ye', from: Q.B, to: Q.C, color: 'b', width: 2.6, dashed: true },
          { id: 'ze', from: Q.C, to: Q.C1, color: 'c', width: 2.6, dashed: true, arrow: true },
          { id: 'e1', from: O, to: E1, color: 'a', arrow: true, width: 5 },
          { id: 'e2', from: O, to: E2, color: 'b', arrow: true, width: 5 },
          { id: 'e3', from: O, to: E3, color: 'c', arrow: true, width: 5 },
          { id: 'op', from: O, to: Q.C1, color: 'no', arrow: true, width: 4.4 },
        ],
        dots: [Q.C1],
        anchors: { e3: G.lerp(O, E3, 0.7), op: G.lerp(O, Q.C1, 0.6), ze: G.lerp(Q.C, Q.C1, 0.5) },
      };
    },
    read(p, sc) {
      return [
        ['\\(x\\)', f4(sc.x), 'x', sc.x],
        ['\\(y\\)', f4(sc.y), 'y', sc.y],
        ['\\(z\\)', f4(sc.z), 'z', sc.z],
        ['以 \\(\\boldsymbol e_1,\\boldsymbol e_2,\\boldsymbol e_3\\) 为棱的平行六面体体积', f4(Math.abs(sc.D)), 'vol', Math.abs(sc.D)],
      ];
    },
    note: () => '\\(\\overrightarrow{OP}=x\\boldsymbol e_1+y\\boldsymbol e_2+z\\boldsymbol e_3\\)，\\((x,y,z)\\) 唯一。\\(\\boldsymbol e_3\\) 越贴近底面，体积越小，要到达同样高的 \\(P\\)，\\(z\\) 就越大；贴到底面上（共面）时就够不着了。',
    tags: ['O', 'P'],
    callouts: [
      { id: 'op', title: 'OP = xe₁ + ye₂ + ze₃', text: '', at: 'op', dx: -160, dy: -60 },
      { id: 'e3', title: 'e₃', text: '与底面成 ψ 角', at: 'e3', dx: -140, dy: 40 },
      { id: 'ze', title: 'ze₃', text: '只有它能往上走', at: 'ze', dx: 130, dy: -40 },
    ],
    def: String.raw`<h3>空间向量基本定理</h3>
      <p class="def">如果三个向量 \(\boldsymbol a,\boldsymbol b,\boldsymbol c\) <b>不共面</b>，那么对任意一个空间向量 \(\boldsymbol p\)，存在唯一的有序实数组 \((x,y,z)\)，使得 \(\boldsymbol p=x\boldsymbol a+y\boldsymbol b+z\boldsymbol c\)。<br>\(\{\boldsymbol a,\boldsymbol b,\boldsymbol c\}\) 叫做空间的一个<b>基底</b>。</p>
      <p>底面上的 \(\boldsymbol e_1,\boldsymbol e_2\) 只能到达底面上的点；补上一个不在底面内的 \(\boldsymbol e_3\)，就能到达空间任意一点 \(P\)。</p>
      <p class="l3-note">\(\boldsymbol e_3\) 的竖直分量是 \(|\boldsymbol e_3|\sin\psi\)，所以 \(z=\dfrac{P\text{ 的高度}}{|\boldsymbol e_3|\sin\psi}\)。</p>`,
  },
  orth: {
    name: '正交分解', params: { x: 1.6, y: 1.2, z: 1.4 },
    sliders: [['x', 'x', 0.4, 2, 0.1], ['y', 'y', 0.4, 2, 0.1], ['z', 'z', 0.4, 2, 0.1]],
    scene(p) {
      const { V } = G.cuboid(p.x, p.y, p.z);
      const O = V.A, Pt = V.C1;
      return {
        P: { ...V, O, P: Pt }, solid: { faces: FACES }, Pt,
        lines: [
          { id: 'xi', from: O, to: V.B, color: 'a', width: 2.6, dashed: true },
          { id: 'yj', from: V.B, to: V.C, color: 'b', width: 2.6, dashed: true },
          { id: 'zk', from: V.C, to: Pt, color: 'c', width: 2.6, dashed: true, arrow: true },
          { id: 'i', from: O, to: [1, 0, 0], color: 'a', arrow: true, width: 5 },
          { id: 'j', from: O, to: [0, 1, 0], color: 'b', arrow: true, width: 5 },
          { id: 'k', from: O, to: [0, 0, 1], color: 'c', arrow: true, width: 5 },
          { id: 'op', from: O, to: Pt, color: 'no', arrow: true, width: 4.4 },
        ],
        anchors: { op: G.lerp(O, Pt, 0.6), i: [0.5, 0, 0], k: [0, 0, 0.6] },
      };
    },
    read(p, sc) {
      const Pt = sc.Pt, l = G.len(Pt);
      return [
        ['\\(|\\overrightarrow{OP}|\\)', f4(l), 'lop', l],
        ['\\(\\overrightarrow{OP}\\cdot\\boldsymbol i\\)', f4(G.dot(Pt, [1, 0, 0])), 'pi', G.dot(Pt, [1, 0, 0])],
        ['\\(\\overrightarrow{OP}\\cdot\\boldsymbol j\\)', f4(G.dot(Pt, [0, 1, 0])), 'pj', G.dot(Pt, [0, 1, 0])],
        ['\\(\\overrightarrow{OP}\\cdot\\boldsymbol k\\)', f4(G.dot(Pt, [0, 0, 1])), 'pk', G.dot(Pt, [0, 0, 1])],
      ];
    },
    note: () => '\\(\\boldsymbol i,\\boldsymbol j,\\boldsymbol k\\) 两两垂直、长度都是 1。\\(\\overrightarrow{OP}\\cdot\\boldsymbol i\\) 正好等于系数 \\(x\\)：系数就是 \\(\\overrightarrow{OP}\\) 在三个方向上的投影。下一节把 \\((x,y,z)\\) 叫做坐标。',
    tags: ['O', 'P'],
    callouts: [
      { id: 'op', title: 'OP = xi + yj + zk', text: '', at: 'op', dx: -160, dy: -60 },
      { id: 'i', title: 'i', text: '单位向量', at: 'i', dx: 100, dy: 60 },
      { id: 'k', title: 'k', text: '单位向量', at: 'k', dx: -120, dy: 20 },
    ],
    def: String.raw`<h3>单位正交基底与正交分解</h3>
      <p class="def">如果基底的三个基向量两两垂直、长度都是 1，这个基底叫做<b>单位正交基底</b>，常用 \(\{\boldsymbol i,\boldsymbol j,\boldsymbol k\}\) 表示。</p>
      <p>\(\overrightarrow{OP}=x\boldsymbol i+y\boldsymbol j+z\boldsymbol k\)，把向量分解成三个两两垂直的向量，叫做<b>正交分解</b>。</p>
      <p class="l3-note">\(|\overrightarrow{OP}|^2=(x\boldsymbol i+y\boldsymbol j+z\boldsymbol k)^2=x^2+y^2+z^2\)，交叉项 \(\boldsymbol i\cdot\boldsymbol j\) 等都是 0。</p>`,
  },
  base: {
    name: '能否做基底', params: { a: 1.8, b: 1.4, c: 1.2, s: 'AB-AD-AA1' },
    selects: [{ key: 's', label: '三个向量', options: Object.entries(TRIPLES).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    scene(p) {
      const { V } = G.cuboid(p.a, p.b, p.c);
      const d = TRIPLES[p.s];
      const vs = d.v.map(([s, t]) => G.sub(V[t], V[s]));
      const COL = ['a', 'b', 'c'];
      return {
        P: V, solid: { faces: FACES }, vs, d,
        planes: [{ id: 'pl', pts: [d.v[0][0], d.v[0][1], d.v[1][1]], color: 'b' }],
        lines: d.v.map(([s, t], i) => ({ id: `v${i}`, from: V[s], to: V[t], color: COL[i], arrow: true, width: 4.4 })),
        anchors: { v2: G.lerp(V[d.v[2][0]], V[d.v[2][1]], 0.6), pl: G.lerp(V[d.v[0][1]], V[d.v[1][1]], 0.5) },
      };
    },
    read(p, sc) {
      const vol = Math.abs(det(...sc.vs)), ok = vol > 1e-9;
      return [
        ['三个向量', `<span>${ok ? '不共面，能做基底' : '共面，不能做基底'}</span>`, 'basis', ok ? '不共面，能做基底' : '共面，不能做基底'],
        ['以它们为棱的平行六面体体积', f4(vol), 'vol', vol],
      ];
    },
    note: (p, sc) => `第三个向量 \\(${VT(sc.d.v[2])}\\) ${Math.abs(det(...sc.vs)) > 1e-9 ? '不在' : '就在'}前两个向量所在的平面（蓝色）里。`,
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'],
    callouts: [
      { id: 'pl', title: '前两个向量所在平面', text: '', at: 'pl', dx: 130, dy: -60 },
      { id: 'v2', title: '第三个向量', text: '在不在这个平面里？', at: 'v2', dx: -150, dy: 50 },
    ],
    def: String.raw`<h3>什么样的三个向量能做基底</h3>
      <p class="def">空间中任意三个<b>不共面</b>的向量都可以构成空间的一个基底；三个向量共面时，它们只能表示这个平面内的向量。</p>
      <p>判断方法：看第三个向量能不能写成前两个的线性组合。例如 \(\overrightarrow{AC}=\overrightarrow{AB}+\overrightarrow{AD}\)，所以 \(\overrightarrow{AB},\overrightarrow{AD},\overrightarrow{AC}\) 共面；\(\overrightarrow{BD}=\overrightarrow{A_1D}-\overrightarrow{A_1B}\) 同理。</p>
      <p class="l3-note">以三个向量为棱的平行六面体体积为 0，就说明三者共面。</p>`,
  },
};

makeLab({
  page: 'e1-1-2', modes,
  aria: '可拖动旋转的平行六面体与长方体，演示空间向量基本定理、正交分解与基底的判定',
  quizItems: (show) => [
    {
      q: '\\(\\overrightarrow{AB},\\overrightarrow{AD},\\overrightarrow{AC}\\) 能作为空间的一个基底吗？',
      opts: ['能', '不能，三个向量共面'], answer: 1,
      why: '\\(\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}\\)，三个向量都在底面内，共面，表示不出竖直方向的向量。',
      show: show('base', { s: 'AB-AD-AC' }), showLabel: '在模型上看',
    },
    {
      q: '长方体中，\\(\\overrightarrow{AC},\\overrightarrow{AB_1},\\overrightarrow{AD_1}\\) 能作为空间的一个基底吗？',
      opts: ['能', '不能'], answer: 0,
      why: '三条面对角线不共面：以它们为棱的平行六面体体积是 \\(2abc\\ne0\\)。',
      show: show('base', { s: 'AC-AB1-AD1' }), showLabel: '在模型上看',
    },
    {
      q: '单位正交基底下 \\(\\overrightarrow{OP}=2\\boldsymbol i+\\boldsymbol j+2\\boldsymbol k\\)，\\(|\\overrightarrow{OP}|=\\) ？',
      opts: ['\\(3\\)', '\\(5\\)', '\\(\\sqrt5\\)'], answer: 0,
      why: '\\(|\\overrightarrow{OP}|^2=2^2+1^2+2^2=9\\)，交叉项都是 0。',
      show: show('orth', { x: 2, y: 1, z: 2 }), showLabel: '在模型上看',
    },
    {
      q: '分解 \\(\\overrightarrow{OP}=x\\boldsymbol e_1+y\\boldsymbol e_2+z\\boldsymbol e_3\\) 中，\\(\\boldsymbol e_3\\) 越贴近底面，\\(z\\) 怎样变化？',
      opts: ['变大', '变小', '不变'], answer: 0,
      why: '只有 \\(z\\boldsymbol e_3\\) 提供高度：\\(z\\cdot|\\boldsymbol e_3|\\sin\\psi=P\\) 的高度，\\(\\psi\\) 越小 \\(z\\) 越大；\\(\\psi=0\\) 时三个向量共面，到不了 \\(P\\)。',
      show: show('dec', { psi: 30 }), showLabel: '在模型上看',
    },
  ],
});
