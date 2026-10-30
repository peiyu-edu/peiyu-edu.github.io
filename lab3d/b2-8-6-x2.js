// 8.6 例 2 正方体体对角线与底面的线面角 · 例题舞台（PY-377）
// 长方体 ABCD-A1B1C1D1（拖成正方体就是课本原题）。「求线面角」分四步作图 + 法向量验算；
// 「最小角」在底面内过斜足 C 转一条直线 l：斜线与 l 的夹角在 l 与射影重合时最小，等于线面角。
import { makeLab, dg, snap } from './rlab.js';
import * as G from './geom3.js';

const DIMS = [['a', '长 AB', 0.8, 2, 0.1], ['b', '宽 AD', 0.8, 2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];
const cube = { label: '▶ 变成正方体', primary: true, to: (p) => { const s = snap((p.a + p.b + p.c) / 3); return { a: s, b: s, c: s }; } };
const TAGS = ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'];
const at = (n) => (p) => +p.st >= n;

const modes = {
  ang: {
    name: '求线面角', params: { a: 1.4, b: 1.4, c: 1.4, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 斜线 A₁C 与底面'], ['2', '② 找垂足：A₁A⊥底面'], ['3', '③ 连射影 AC'], ['4', '④ 解 Rt△A₁AC'], ['5', '⑤ 用法向量验算（选必一）']] }],
    sliders: DIMS, buttons: [cube],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c), s = +p.st;
      const lines = [{ id: 'sl', from: V.A1, to: V.C, color: 'c', width: 3.4 }];
      const arcs = [];
      if (s >= 2) { lines.push({ id: 'pf', from: V.A1, to: V.A, color: 'a', width: 3.4 }); arcs.push({ id: 'pf', O: V.A, A: V.A1, B: V.C, r: 0.08 }); }
      if (s >= 3) lines.push({ id: 'pr', from: V.A, to: V.C, color: 'no', width: 3.4 });
      if (s >= 4) arcs.push({ id: 'phi', O: V.C, A: V.A1, B: V.A, r: 0.2 });
      const L = 0.5 * Math.max(p.a, p.b, p.c);
      if (s >= 5) lines.push({ id: 'n', from: V.C, to: G.add(V.C, [0, 0, L]), color: 'b', arrow: true, width: 3 });
      return {
        P: V, solid: { faces: F },
        planes: [{ id: 'base', pts: ['A', 'B', 'C', 'D'], color: 'b' }],
        lines, arcs,
        anchors: { sl: G.lerp(V.A1, V.C, 0.4), pf: G.lerp(V.A1, V.A, 0.5), pr: G.lerp(V.A, V.C, 0.6), phi: V.C, n: G.add(V.C, [0, 0, L]) },
        V,
      };
    },
    read(p, { V }) {
      const pf = G.dist(V.A1, V.A), fx = G.dist(V.A, V.C), px = G.dist(V.A1, V.C);
      const phi = Math.atan2(pf, fx);                                   // 几何法：Rt△A₁AC
      const u = G.sub(V.C, V.A1), n = G.normal(V.A, V.B, V.C);           // 法向量法：sinφ = |u·n|/(|u||n|)
      const sinN = Math.abs(G.dot(u, n)) / (G.len(u) * G.len(n));
      return [
        ['垂线段 \\(A_1A\\)', pf.toFixed(4), 'pf', pf],
        ['射影 \\(AC\\)', fx.toFixed(4), 'fx', fx],
        ['斜线段 \\(A_1C\\)', px.toFixed(4), 'px', px],
        ['\\(\\tan\\varphi=\\dfrac{A_1A}{AC}\\)', Math.tan(phi).toFixed(4), 'tan', Math.tan(phi)],
        ['线面角 \\(\\varphi\\)（几何法）', dg(phi), 'phi', G.deg(phi)],
        ['\\(\\sin\\varphi=\\dfrac{|\\overrightarrow{A_1C}\\cdot\\boldsymbol n|}{|\\overrightarrow{A_1C}||\\boldsymbol n|}\\)', sinN.toFixed(4), 'sinN', sinN],
        ['法向量算出的角', dg(Math.asin(sinN)), 'phiN', G.deg(Math.asin(sinN))],
      ];
    },
    note: (p) => [
      '求斜线 \\(A_1C\\) 与底面 \\(ABCD\\) 所成的角：斜足是 \\(C\\)，还要找到斜线上一点在底面的垂足。',
      '\\(A_1A\\perp\\) 底面，垂足是 \\(A\\)。',
      '连接垂足 \\(A\\) 和斜足 \\(C\\)：\\(AC\\) 是 \\(A_1C\\) 在底面的射影，\\(\\angle A_1CA\\) 就是所求的角。',
      '在 \\(\\text{Rt}\\triangle A_1AC\\) 中，\\(\\tan\\varphi=\\dfrac{A_1A}{AC}\\)。正方体（棱长 1）时 \\(AC=\\sqrt2\\)，\\(\\tan\\varphi=\\dfrac{\\sqrt2}{2}\\)。',
      '底面法向量 \\(\\boldsymbol n=(0,0,1)\\)。线面角是斜线与<b>法向量所在直线</b>所成角（不超过 \\(90^\\circ\\)）的余角，所以用 \\(\\sin\\varphi\\)，不是 \\(\\cos\\)。',
    ][+p.st - 1],
    tags: TAGS,
    callouts: [
      { id: 'sl', title: '斜线 A₁C', text: '', at: 'sl', dx: -160, dy: -40 },
      { id: 'pf', title: '垂线 A₁A', text: '垂足 A', at: 'pf', dx: -150, dy: 50, when: at(2) },
      { id: 'pr', title: '射影 AC', text: '', at: 'pr', dx: 120, dy: 70, when: at(3) },
      { id: 'phi', title: '线面角 φ', text: '∠A₁CA', at: 'phi', dx: 130, dy: -40, when: at(4) },
    ],
    def: String.raw`<h3>例 2 正方体的线面角</h3>
      <p class="def">正方体 \(ABCD\text{-}A_1B_1C_1D_1\) 棱长为 \(1\)，求体对角线 \(A_1C\) 与底面 \(ABCD\) 所成角的正切值。</p>
      <p>三步：<b>找垂足</b>（\(A_1A\perp\) 底面，垂足 \(A\)）→ <b>连射影</b>（\(AC\)）→ <b>解直角三角形</b>（\(\tan\varphi=\dfrac{1}{\sqrt2}=\dfrac{\sqrt2}{2}\)）。</p>
      <p class="l3-note">拖成长方体：\(\tan\varphi=\dfrac{c}{\sqrt{a^2+b^2}}\)。读数里的「法向量算出的角」用的是 \(\sin\varphi=\dfrac{|\boldsymbol u\cdot\boldsymbol n|}{|\boldsymbol u||\boldsymbol n|}\)，两种算法一直相等。</p>`,
  },
  min: {
    name: '最小角', params: { a: 1.4, b: 1.4, c: 1.4, t: 40 },
    sliders: [...DIMS, ['t', 'l 的转动角 t（°）', 0, 180, 5]],
    buttons: [
      { label: '▶ l 转到射影方向', primary: true, to: () => ({ t: 0 }) },
      { label: '▶ l ⊥ 射影', to: () => ({ t: 90 }) },
    ],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const e1 = G.unit(G.sub(V.A, V.C)), e2 = [-e1[1], e1[0], 0];       // 底面内：射影方向、与它垂直的方向
      const r = (p.t * Math.PI) / 180, u = G.add(G.mul(e1, Math.cos(r)), G.mul(e2, Math.sin(r)));
      const L = 0.55 * Math.hypot(p.a, p.b);
      const E = G.add(V.C, G.mul(u, L)), E0 = G.sub(V.C, G.mul(u, L));
      return {
        P: { ...V, E }, solid: { faces: F },
        planes: [{ id: 'base', pts: ['A', 'B', 'C', 'D'], color: 'b' }],
        lines: [{ id: 'sl', from: V.A1, to: V.C, color: 'c', width: 3.4 }, { id: 'pr', from: V.A, to: V.C, color: 'no', width: 2.4, dashed: true },
          { id: 'l', from: E0, to: E, color: 'a', width: 3.4 }],
        arcs: [{ id: 'g', O: V.C, A: V.A1, B: E, r: 0.22, color: 'a', acute: true }, { id: 'phi', O: V.C, A: V.A1, B: V.A, r: 0.14 }],
        anchors: { sl: G.lerp(V.A1, V.C, 0.4), l: G.lerp(V.C, E, 0.8), g: V.C },
        V, u,
      };
    },
    read(p, { V, u }) {
      const s = G.sub(V.C, V.A1);
      const phi = G.linePlaneAngle(s, [0, 0, 1]);
      // 两直线所成角用 atan2(|u×w|, |u·w|)：acos 在 1 附近会把 0° 算成 1e-6°
      const ang = (x, y) => Math.atan2(G.len(G.cross(x, y)), Math.abs(G.dot(x, y)));
      const al = ang(u, G.sub(V.A, V.C)), g = ang(s, u);
      return [
        ['线面角 \\(\\varphi\\)', dg(phi), 'phi', G.deg(phi)],
        ['\\(l\\) 与射影所成的角 \\(\\alpha\\)', dg(al), 'al', G.deg(al)],
        ['斜线与 \\(l\\) 所成的角 \\(\\gamma\\)', dg(g), 'g', G.deg(g)],
        ['\\(\\cos\\varphi\\cos\\alpha\\)', (Math.cos(phi) * Math.cos(al)).toFixed(4), 'cc', Math.cos(phi) * Math.cos(al)],
        ['\\(\\cos\\gamma\\)', Math.cos(g).toFixed(4), 'cg', Math.cos(g)],
      ];
    },
    note: (p) => (p.t % 180 === 0 ? '\\(l\\) 与射影重合：\\(\\gamma=\\varphi\\)，取到最小。线面角是斜线与平面内所有直线所成角中<b>最小</b>的那个。'
      : p.t === 90 ? '\\(l\\perp\\) 射影，于是 \\(l\\perp\\) 斜线（三垂线定理）：\\(\\gamma=90^\\circ\\)，最大。'
        : '\\(\\cos\\gamma=\\cos\\varphi\\cos\\alpha\\le\\cos\\varphi\\)，所以 \\(\\gamma\\ge\\varphi\\)：转动 \\(l\\)，\\(\\gamma\\) 从不小于线面角。'),
    tags: TAGS,
    callouts: [
      { id: 'sl', title: '斜线 A₁C', text: '', at: 'sl', dx: -160, dy: -40 },
      { id: 'l', title: '底面内的直线 l', text: '过斜足 C', at: 'l', dx: 120, dy: 60 },
      { id: 'g', title: '夹角 γ', text: '', at: 'g', dx: 130, dy: -60 },
    ],
    def: String.raw`<h3>为什么用射影：最小角定理</h3>
      <p class="def">斜线与它在平面上的射影所成的角，是斜线与平面内<b>所有直线</b>所成角中最小的。</p>
      <p>平面内过斜足的直线 \(l\) 从射影方向绕斜足转过 \(t\)（\(0^\circ\le t\le180^\circ\)），它与射影所成的角是 \(\alpha=\min(t,\,180^\circ-t)\)。设斜线与 \(l\) 成角 \(\gamma\)，斜线与 \(l\) 成角 \(\gamma\)，则 \(\cos\gamma=\cos\varphi\cos\alpha\)。\(\cos\alpha\le1\)，所以 \(\gamma\ge\varphi\)，\(\alpha=0^\circ\) 时取等号。</p>
      <p class="l3-note">拖动转动角 \(t\)：\(t=0^\circ\) 或 \(180^\circ\) 时 \(\alpha=0^\circ\)，\(\gamma=\varphi\) 最小；\(t=90^\circ\) 时 \(\alpha=90^\circ\)，\(l\perp\) 斜线，\(\gamma=90^\circ\)。读数里的 \(\alpha\) 是两直线所成的角，不超过 \(90^\circ\)。</p>`,
  },
};

makeLab({
  page: 'b2-8-6-x2', modes,
  aria: '可拖动旋转的正方体，分步作出体对角线 A1C 与底面所成的角，并演示线面角是最小角',
  quizItems: (show) => [
    {
      q: '正方体中 \\(A_1C\\) 与底面所成角的正切值是？',
      opts: ['\\(\\dfrac{\\sqrt2}{2}\\)', '\\(\\dfrac{\\sqrt3}{3}\\)', '\\(\\sqrt2\\)'], answer: 0,
      why: '垂足 \\(A\\)、射影 \\(AC=\\sqrt2\\)，垂线段 \\(A_1A=1\\)，\\(\\tan\\varphi=\\dfrac{1}{\\sqrt2}=\\dfrac{\\sqrt2}{2}\\)。\\(\\dfrac{\\sqrt3}{3}\\) 是它的正弦。',
      show: show('ang', { a: 1.4, b: 1.4, c: 1.4, st: '4' }), showLabel: '看第 ④ 步',
    },
    {
      q: '用法向量求线面角，\\(\\dfrac{|\\boldsymbol u\\cdot\\boldsymbol n|}{|\\boldsymbol u||\\boldsymbol n|}\\) 等于线面角的？',
      opts: ['正弦', '余弦', '正切'], answer: 0,
      why: '\\(\\boldsymbol n\\) 垂直于平面，斜线与法向量所在直线所成的角（不超过 \\(90^\\circ\\)）是线面角的余角，余角的余弦就是线面角的正弦。',
      show: show('ang', { st: '5' }), showLabel: '看法向量',
    },
    {
      q: '底面内过 \\(C\\) 的直线 \\(l\\) 转一圈，\\(A_1C\\) 与 \\(l\\) 所成的角最小是多少？',
      opts: ['等于线面角', '\\(0^\\circ\\)', '\\(45^\\circ\\)'], answer: 0,
      why: '\\(\\cos\\gamma=\\cos\\varphi\\cos\\alpha\\le\\cos\\varphi\\)，\\(l\\) 与射影重合（\\(\\alpha=0^\\circ\\)）时最小，正好是线面角 \\(\\varphi\\)。',
      show: show('min', { t: 0 }), showLabel: '在模型上看',
    },
    {
      q: '\\(l\\) 在底面内且垂直于射影 \\(AC\\)，那么 \\(l\\) 与 \\(A_1C\\)？',
      opts: ['垂直', '平行', '成 \\(45^\\circ\\) 角'], answer: 0,
      why: '三垂线定理：平面内的直线垂直于斜线的射影，就垂直于斜线。读数里 \\(\\alpha=90^\\circ\\) 时 \\(\\gamma=90^\\circ\\)。',
      show: show('min', { t: 90 }), showLabel: '在模型上看',
    },
  ],
});
