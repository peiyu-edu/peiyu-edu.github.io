// 1.1 空间向量及其运算 · 3D 舞台页（PY-355）
// 三个实验：平行六面体法则（a + b + c）、共面向量（p = x a + y b 何时成立）、长方体里的数量积与夹角。
// 所有长度、数量积、角度都由 geom3.js 按当前坐标现算。
import { makeLab, snap, dg } from './rlab.js';
import * as G from './geom3.js';

/** 显示 4 位小数，并把 -0.0000 写成 0.0000 */
const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
const V = (k) => `\\(\\boldsymbol ${k}\\)`;
const FACES = G.cuboid(1, 1, 1).F;
/** 平行六面体 ABCD-A1B1C1D1：A 在原点，AB = a，AD = b，AA1 = c */
function para(a, b, c) {
  const A = [0, 0, 0], B = a, D = b, A1 = c, C = G.add(a, b);
  return { A, B, C, D, A1, B1: G.add(a, c), C1: G.add(C, c), D1: G.add(b, c) };
}

// 长方体里的两个向量：u = 起点→终点，v = 起点→终点
const PAIRS = {
  'AB1-BC1': { label: 'AB₁ 与 BC₁', u: ['A', 'B1'], v: ['B', 'C1'] },
  'AC1-BD': { label: 'AC₁ 与 BD', u: ['A', 'C1'], v: ['B', 'D'] },
  'A1C-AB': { label: 'A₁C 与 AB', u: ['A1', 'C'], v: ['A', 'B'] },
  'A1B-CD1': { label: 'A₁B 与 CD₁', u: ['A1', 'B'], v: ['C', 'D1'] },
};
const TEXV = (s) => `\\overrightarrow{${s[0].replace(/(\d)/, '_$1')}${s[1].replace(/(\d)/, '_$1')}}`;
const DIMS = [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];

// 共面实验里固定的三个向量（a、b 在底面，c 指向底面外）
const CA = [1.6, 0, 0], CB = [0.6, 1.3, 0], CC = [0.3, 0.2, 1.2];

const modes = {
  sum: {
    name: '平行六面体法则', params: { a: 1.6, b: 1.3, h: 1.2, k: 0.4, th: '60' },
    selects: [{ key: 'th', label: 'a 与 b 的夹角', options: [['60', '60°'], ['90', '90°'], ['120', '120°']] }],
    sliders: [['a', '|a|', 1, 2.2, 0.1], ['b', '|b|', 1, 2.2, 0.1], ['h', 'c 的高', 0.8, 2, 0.1], ['k', 'c 的倾斜', -0.6, 0.8, 0.1]],
    buttons: [{ label: '▶ 侧棱立直', primary: true, to: () => ({ k: 0 }) }],
    scene(p) {
      const t = (+p.th * Math.PI) / 180;
      const a = [p.a, 0, 0], b = [p.b * Math.cos(t), p.b * Math.sin(t), 0], c = [p.k, 0, p.h];
      const P = para(a, b, c);
      return {
        P, solid: { faces: FACES }, a, b, c,
        lines: [
          { id: 'a', from: P.A, to: P.B, color: 'a', arrow: true },
          { id: 'b', from: P.A, to: P.D, color: 'b', arrow: true },
          { id: 'c', from: P.A, to: P.A1, color: 'c', arrow: true },
          { id: 'path', from: P.B, to: P.C, color: 'b', arrow: true, width: 2.6, dashed: true },
          { id: 'path2', from: P.C, to: P.C1, color: 'c', arrow: true, width: 2.6, dashed: true },
          { id: 'sum', from: P.A, to: P.C1, color: 'no', arrow: true, width: 4.4 },
        ],
        anchors: { sum: G.lerp(P.A, P.C1, 0.55), path: G.lerp(P.C, P.C1, 0.5), a: G.lerp(P.A, P.B, 0.5), c: G.lerp(P.A, P.A1, 0.6) },
      };
    },
    read(p, sc) {
      const { a, b, c } = sc, s = G.add(G.add(a, b), c);
      return [
        [`${V('a')}\\(\\cdot\\)${V('b')}`, f4(G.dot(a, b)), 'ab', G.dot(a, b)],
        [`${V('b')}\\(\\cdot\\)${V('c')}`, f4(G.dot(b, c)), 'bc', G.dot(b, c)],
        [`${V('c')}\\(\\cdot\\)${V('a')}`, f4(G.dot(c, a)), 'ca', G.dot(c, a)],
        ['\\(|\\boldsymbol c|\\)', f4(G.len(c)), 'lc', G.len(c)],
        ['\\(|\\boldsymbol a+\\boldsymbol b+\\boldsymbol c|=|\\overrightarrow{AC_1}|\\)', f4(G.len(s)), 'ls', G.len(s)],
      ];
    },
    note: () => '\\(|\\boldsymbol a+\\boldsymbol b+\\boldsymbol c|^2=|\\boldsymbol a|^2+|\\boldsymbol b|^2+|\\boldsymbol c|^2+2(\\boldsymbol a\\cdot\\boldsymbol b+\\boldsymbol b\\cdot\\boldsymbol c+\\boldsymbol c\\cdot\\boldsymbol a)\\)：用上面三个数量积可以验算对角线长。',
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'],
    callouts: [
      { id: 'sum', title: '对角线 AC₁', text: '= a + b + c', at: 'sum', dx: -150, dy: -60 },
      { id: 'path', title: '首尾相接', text: 'AB + BC + CC₁', at: 'path', dx: 130, dy: -40 },
      { id: 'a', title: '向量 a', text: '= AB', at: 'a', dx: 110, dy: 60 },
    ],
    def: String.raw`<h3>空间向量的加法：平行六面体法则</h3>
      <p class="def">以同一起点的三个不共面向量 \(\boldsymbol a,\boldsymbol b,\boldsymbol c\) 为棱作平行六面体 \(ABCD\text{-}A_1B_1C_1D_1\)，则体对角线 \(\overrightarrow{AC_1}=\boldsymbol a+\boldsymbol b+\boldsymbol c\)。</p>
      <p>它就是三角形法则用了两次：\(\overrightarrow{AC_1}=\overrightarrow{AB}+\overrightarrow{BC}+\overrightarrow{CC_1}\)，而 \(\overrightarrow{BC}=\boldsymbol b\)、\(\overrightarrow{CC_1}=\boldsymbol c\)（平行且相等的有向线段表示同一个向量）。</p>
      <p class="l3-note">平面向量的加法、数乘、数量积的运算律在空间里全部照样成立。</p>`,
  },
  cop: {
    name: '共面向量', params: { x: 0.6, y: 0.8, z: 0.5 },
    sliders: [['x', 'x', 0.2, 1.2, 0.1], ['y', 'y', 0.2, 1.2, 0.1], ['z', 'z（离开平面）', -0.6, 1, 0.1]],
    buttons: [{ label: '▶ 压回平面', primary: true, to: () => ({ z: 0 }) }],
    scene(p) {
      const O = [0, 0, 0], X = G.mul(CA, p.x), Q = G.add(X, G.mul(CB, p.y)), Pt = G.add(Q, G.mul(CC, p.z));
      const k = 1.35;
      return {
        P: { O, A: CA, B: CB, P: Pt }, Q, Pt,
        planes: [{ id: 'pl', pts: [G.mul(CA, -0.15), G.mul(CA, k), G.add(G.mul(CA, k), G.mul(CB, k)), G.mul(CB, k)], color: 'b' }],
        lines: [
          { id: 'a', from: O, to: CA, color: 'a', arrow: true },
          { id: 'b', from: O, to: CB, color: 'b', arrow: true },
          { id: 'xa', from: O, to: X, color: 'a', width: 2.6, dashed: true },
          { id: 'yb', from: X, to: Q, color: 'b', width: 2.6, dashed: true },
          ...(Math.abs(p.z) > 1e-9 ? [{ id: 'zc', from: Q, to: Pt, color: 'c', width: 3, arrow: true }] : []),
          { id: 'p', from: O, to: Pt, color: 'no', arrow: true, width: 4.4 },
        ],
        dots: [Q],
        anchors: { p: G.lerp(O, Pt, 0.6), zc: G.lerp(Q, Pt, 0.5), pl: G.add(G.mul(CA, 1.2), G.mul(CB, 0.2)) },
      };
    },
    read(p, sc) {
      const d = G.distPointPlane(sc.Pt, [0, 0, 0], G.cross(CA, CB));
      const on = d < 1e-9;
      return [
        [`${V('p')} 与 ${V('a')}、${V('b')}`, `<span>${on ? '共面' : '不共面'}</span>`, 'rel', on ? '共面' : '不共面'],
        ['\\(P\\) 到 \\(\\boldsymbol a,\\boldsymbol b\\) 所在平面的距离', f4(d), 'd', d],
        ['\\(|\\boldsymbol p|=|\\overrightarrow{OP}|\\)', f4(G.len(sc.Pt)), 'lp', G.len(sc.Pt)],
      ];
    },
    note: (p) => (Math.abs(p.z) < 1e-9 ? '\\(z=0\\)：\\(\\boldsymbol p=x\\boldsymbol a+y\\boldsymbol b\\)，\\(\\boldsymbol p\\) 与 \\(\\boldsymbol a,\\boldsymbol b\\) 共面。'
      : '\\(z\\ne0\\)：\\(\\boldsymbol p\\) 多了一段 \\(z\\boldsymbol c\\)，离开了 \\(\\boldsymbol a,\\boldsymbol b\\) 所在的平面，不能只用 \\(\\boldsymbol a,\\boldsymbol b\\) 表示。'),
    tags: ['O', 'A', 'B', 'P'],
    callouts: [
      { id: 'p', title: 'p = xa + yb + zc', text: '', at: 'p', dx: -150, dy: -60 },
      { id: 'zc', title: 'zc', text: '离开平面的那一段', at: 'zc', dx: 130, dy: -40, when: (p) => Math.abs(p.z) > 1e-9 },
      { id: 'pl', title: 'a、b 所在平面', text: '', at: 'pl', dx: 120, dy: 60 },
    ],
    def: String.raw`<h3>共面向量定理</h3>
      <p class="def">如果两个向量 \(\boldsymbol a,\boldsymbol b\) 不共线，那么向量 \(\boldsymbol p\) 与向量 \(\boldsymbol a,\boldsymbol b\) 共面的充要条件是：存在唯一的有序实数对 \((x,y)\)，使 \(\boldsymbol p=x\boldsymbol a+y\boldsymbol b\)。</p>
      <p>这里 \(\boldsymbol p=x\boldsymbol a+y\boldsymbol b+z\boldsymbol c\)，\(\boldsymbol c\) 不在 \(\boldsymbol a,\boldsymbol b\) 所在的平面内。拖 \(z\)：只有 \(z=0\) 时 \(P\) 落回平面。</p>
      <p class="l3-note">推论：点 \(P\) 在平面 \(OAB\) 内 \(\iff\) \(\overrightarrow{OP}=x\overrightarrow{OA}+y\overrightarrow{OB}\)。</p>`,
  },
  dot: {
    name: '数量积与夹角', params: { a: 1.6, b: 1.6, c: 1.6, s: 'AB1-BC1' },
    selects: [{ key: 's', label: '两个向量', options: Object.entries(PAIRS).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    buttons: [{ label: '▶ 变成正方体', primary: true, to: (p) => { const s = snap((p.a + p.b + p.c) / 3); return { a: s, b: s, c: s }; } }],
    scene(p) {
      const { V: Q } = G.cuboid(p.a, p.b, p.c);
      const d = PAIRS[p.s];
      const u = G.sub(Q[d.u[1]], Q[d.u[0]]), v = G.sub(Q[d.v[1]], Q[d.v[0]]);
      const O = Q[d.u[0]], V2 = G.add(O, v);   // 把 v 平移到 u 的起点
      const cs = G.dot(u, v) / (G.len(u) * G.len(v));
      const flat = Math.abs(Math.abs(cs) - 1) < 1e-9;
      return {
        P: Q, solid: { faces: FACES }, u, v, d,
        lines: [
          { id: 'u', from: O, to: Q[d.u[1]], color: 'a', arrow: true, width: 4.4 },
          { id: 'v', from: Q[d.v[0]], to: Q[d.v[1]], color: 'b', arrow: true, width: 4.4 },
          ...(G.dist(Q[d.v[0]], O) > 1e-9 ? [{ id: 'mv', from: O, to: V2, color: 'b', arrow: true, width: 2.6, dashed: true }] : []),
        ],
        arcs: flat ? [] : [{ id: 'th', O, A: Q[d.u[1]], B: V2, r: 0.16 }],
        anchors: { u: G.lerp(O, Q[d.u[1]], 0.6), v: G.lerp(Q[d.v[0]], Q[d.v[1]], 0.6), mv: G.lerp(O, V2, 0.55), th: O },
      };
    },
    read(p, sc) {
      const { u, v } = sc, lu = G.len(u), lv = G.len(v), dt = G.dot(u, v);
      const cs = Math.max(-1, Math.min(1, dt / (lu * lv))), th = Math.acos(cs);
      return [
        [`\\(${TEXV(sc.d.u)}\\cdot${TEXV(sc.d.v)}\\)`, f4(dt), 'dot', dt],
        [`\\(|${TEXV(sc.d.u)}|\\)`, f4(lu), 'lu', lu],
        [`\\(|${TEXV(sc.d.v)}|\\)`, f4(lv), 'lv', lv],
        ['\\(\\cos\\langle\\boldsymbol u,\\boldsymbol v\\rangle\\)', f4(cs), 'cos', cs],
        ['夹角 \\(\\langle\\boldsymbol u,\\boldsymbol v\\rangle\\)', dg(th), 'th', G.deg(th)],
      ];
    },
    note: (p, sc) => `把 \\(${TEXV(sc.d.v)}\\) 平移到 \\(${TEXV(sc.d.u)}\\) 的起点（虚线），两个向量的夹角范围是 \\([0^\\circ,180^\\circ]\\)；\\(\\cos\\langle\\boldsymbol u,\\boldsymbol v\\rangle=\\dfrac{\\boldsymbol u\\cdot\\boldsymbol v}{|\\boldsymbol u||\\boldsymbol v|}\\)。`,
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'],
    callouts: [
      { id: 'u', title: 'u', text: '', at: 'u', dx: -140, dy: -50 },
      { id: 'v', title: 'v', text: '', at: 'v', dx: 130, dy: 60 },
      { id: 'mv', title: 'v 平移到 u 的起点', text: '', at: 'mv', dx: 140, dy: -60, when: (p, sc) => sc.lines.some((l) => l.id === 'mv') },
    ],
    def: String.raw`<h3>空间向量的数量积</h3>
      <p class="def">\(\boldsymbol u\cdot\boldsymbol v=|\boldsymbol u||\boldsymbol v|\cos\langle\boldsymbol u,\boldsymbol v\rangle\)。两个向量的夹角要把它们<b>平移到同一起点</b>再量，范围 \(0^\circ\le\langle\boldsymbol u,\boldsymbol v\rangle\le180^\circ\)。</p>
      <p>\(\boldsymbol u\perp\boldsymbol v\iff\boldsymbol u\cdot\boldsymbol v=0\)；\(|\boldsymbol u|^2=\boldsymbol u\cdot\boldsymbol u\)。</p>
      <p class="l3-note">正方体中 \(\overrightarrow{AB_1}\) 与 \(\overrightarrow{BC_1}\)：\(\overrightarrow{BC_1}=\overrightarrow{AD_1}\)，\(\triangle AB_1D_1\) 是正三角形，所以夹角是 \(60^\circ\)。</p>`,
  },
};

makeLab({
  page: 'e1-1-1', modes,
  aria: '可拖动旋转的平行六面体和长方体，演示空间向量的加法、共面与数量积',
  quizItems: (show) => [
    {
      q: '平行六面体 \\(ABCD\\text{-}A_1B_1C_1D_1\\) 中，\\(\\overrightarrow{AC_1}\\) 等于？',
      opts: ['\\(\\overrightarrow{AB}+\\overrightarrow{AD}+\\overrightarrow{AA_1}\\)', '\\(\\overrightarrow{AB}+\\overrightarrow{AD}-\\overrightarrow{AA_1}\\)', '\\(\\overrightarrow{AB}+\\overrightarrow{BC}\\)'], answer: 0,
      why: '\\(\\overrightarrow{AC_1}=\\overrightarrow{AB}+\\overrightarrow{BC}+\\overrightarrow{CC_1}\\)，而 \\(\\overrightarrow{BC}=\\overrightarrow{AD}\\)，\\(\\overrightarrow{CC_1}=\\overrightarrow{AA_1}\\)。\\(\\overrightarrow{AB}+\\overrightarrow{BC}\\) 只到 \\(C\\)。',
      show: show('sum', { th: '60', k: 0.4 }), showLabel: '在模型上看',
    },
    {
      q: '\\(\\boldsymbol p=x\\boldsymbol a+y\\boldsymbol b+z\\boldsymbol c\\)（\\(\\boldsymbol a,\\boldsymbol b,\\boldsymbol c\\) 不共面），\\(\\boldsymbol p\\) 与 \\(\\boldsymbol a,\\boldsymbol b\\) 共面的条件是？',
      opts: ['\\(z=0\\)', '\\(x=y\\)', '任何时候都共面'], answer: 0,
      why: '\\(z=0\\) 时 \\(\\boldsymbol p=x\\boldsymbol a+y\\boldsymbol b\\)，由共面向量定理共面；\\(z\\ne0\\) 时若共面，\\(\\boldsymbol c\\) 就能用 \\(\\boldsymbol a,\\boldsymbol b,\\boldsymbol p\\) 表示，与三者不共面矛盾。',
      show: show('cop', { x: 0.6, y: 0.8, z: 0 }), showLabel: '在模型上看',
    },
    {
      q: '正方体中，\\(\\overrightarrow{AB_1}\\) 与 \\(\\overrightarrow{BC_1}\\) 的夹角是？',
      opts: ['\\(60^\\circ\\)', '\\(90^\\circ\\)', '\\(45^\\circ\\)'], answer: 0,
      why: '设棱长 1，\\(\\overrightarrow{AB_1}\\cdot\\overrightarrow{BC_1}=1\\)（只有竖直分量相乘），两向量长都是 \\(\\sqrt2\\)，\\(\\cos=\\dfrac{1}{2}\\)，夹角 \\(60^\\circ\\)。',
      show: show('dot', { a: 1.6, b: 1.6, c: 1.6, s: 'AB1-BC1' }), showLabel: '在正方体里看',
    },
    {
      q: '长方体中，\\(\\overrightarrow{A_1B}\\) 与 \\(\\overrightarrow{CD_1}\\) 的夹角是？',
      opts: ['\\(0^\\circ\\)', '\\(90^\\circ\\)', '\\(180^\\circ\\)'], answer: 2,
      why: '\\(A_1B\\) 与 \\(D_1C\\) 平行且相等，所以 \\(\\overrightarrow{CD_1}=-\\overrightarrow{A_1B}\\)，方向相反，夹角 \\(180^\\circ\\)。两条<b>直线</b>所成的角却是 \\(0^\\circ\\)（平行）。',
      show: show('dot', { a: 1.8, b: 1.3, c: 1.2, s: 'A1B-CD1' }), showLabel: '在模型上看',
    },
  ],
});
