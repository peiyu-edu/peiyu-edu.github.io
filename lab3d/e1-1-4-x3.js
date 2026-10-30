// 1.4 例 4 用向量求三种角 · 例题舞台（PY-384）
// 课本坐标：正方体棱长 s（课本 s = 2），D 为原点；E 在棱 A₁B₁ 上，A₁E = t·A₁B₁（课本 t = 1/2，E 是中点）。
// 线线角取 |cos|；线面角用 sin θ = |cos⟨u, n⟩|；二面角看图定正负：同一组法向量，A₁-BD-C 是钝角，A₁-BD-A 是锐角。
import { makeLab, dg } from './rlab.js';
import * as G from './geom3.js';

const FACES = [['A', 'B', 'C', 'D'], ['A1', 'B1', 'C1', 'D1'], ['A', 'B', 'B1', 'A1'], ['B', 'C', 'C1', 'B1'], ['C', 'D', 'D1', 'C1'], ['D', 'A', 'A1', 'D1']];
const TAGS = ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'E'];
const N = [1, -1, -1];
const f2 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(2);
const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
const vs = (v) => `(${v.map(f2).join(', ')})`;
const vec = (v) => `<span>${vs(v)}</span>`;
/** data-v 里的数：把 1e-16 这类浮点噪声归零，和显示的 0.00 一致 */
const z = (x) => (Math.abs(x) < 5e-10 ? 0 : x);
/** 两直线所成角（0°–90°）：atan2 在 0° 和 90° 附近都不丢精度 */
const lineAng = (x, y) => Math.atan2(G.len(G.cross(x, y)), Math.abs(G.dot(x, y)));
/** 两向量夹角（0°–180°） */
const vecAng = (x, y) => Math.atan2(G.len(G.cross(x, y)), G.dot(x, y));
const SIDE = ['s', '棱长', 1, 3, 0.5];
const TS = ['t', 'E 的位置 A₁E : A₁B₁', 0, 1, 0.05];
const MID = { label: '▶ E 回到中点', primary: true, to: () => ({ t: 0.5 }) };
const withE = (s, t) => { const V = G.cubeD(s); return { ...V, E: G.lerp(V.A1, V.B1, t) }; };

const modes = {
  ll: {
    name: '(1) 线线角', params: { s: 2, t: 0.5 },
    sliders: [SIDE, TS], buttons: [MID, { label: '▶ E 到 B₁', to: () => ({ t: 1 }) }],
    scene(p) {
      const V = withE(p.s, p.t), w = G.sub(V.B, V.A1);
      const F = G.add(V.E, G.mul(w, 0.5));                       // 把 A₁B 平移到 E 点出发
      return {
        P: V, solid: { faces: FACES },
        lines: [
          { id: 'de', from: V.D, to: V.E, color: 'a', width: 4 },
          { id: 'ab', from: V.A1, to: V.B, color: 'c', width: 4 },
          { id: 'tr', from: V.E, to: F, color: 'c', width: 2.4, dashed: true },
        ],
        arcs: [{ id: 'g', O: V.E, A: V.D, B: F, r: 0.2, acute: true }],
        dots: [V.E],
        anchors: { de: G.lerp(V.D, V.E, 0.45), ab: G.lerp(V.A1, V.B, 0.6), g: V.E },
        u: G.sub(V.E, V.D), w,
      };
    },
    read(p, { u, w }) {
      const d = G.dot(u, w), c = Math.abs(d) / (G.len(u) * G.len(w));
      return [
        ['\\(\\overrightarrow{DE}\\)', vec(u), 'u', vs(u)],
        ['\\(\\overrightarrow{A_1B}\\)', vec(w), 'w', vs(w)],
        ['\\(\\overrightarrow{DE}\\cdot\\overrightarrow{A_1B}\\)', f4(d), 'dot', z(d)],
        ['\\(\\cos\\theta=\\dfrac{|\\overrightarrow{DE}\\cdot\\overrightarrow{A_1B}|}{|\\overrightarrow{DE}||\\overrightarrow{A_1B}|}\\)', f4(c), 'cos', z(c)],
        ['线线角 \\(\\theta\\)', dg(lineAng(u, w)), 'th', z(G.deg(lineAng(u, w)))],
        ['两个向量的夹角', dg(vecAng(u, w)), 'va', z(G.deg(vecAng(u, w)))],
      ];
    },
    note: (p) => (Math.abs(p.t - 1) < 1e-9 ? 'E 到 \\(B_1\\)：\\(\\overrightarrow{DB_1}\\cdot\\overrightarrow{A_1B}=0\\)，两条直线垂直。'
      : '两个<b>向量</b>的夹角是钝角（点积为负），两条<b>直线</b>所成的角取它的补角，所以公式里点积要加绝对值。'),
    tags: TAGS,
    callouts: [
      { id: 'de', title: '直线 DE', text: '', at: 'de', dx: -150, dy: -40 },
      { id: 'ab', title: '直线 A₁B', text: '平移到 E（虚线）', at: 'ab', dx: 140, dy: 60 },
      { id: 'g', title: '线线角 θ', text: '取较小角（≤90°）', at: 'g', dx: 140, dy: -60 },
    ],
    def: String.raw`<h3>例 4 (1) 两条直线所成的角</h3>
      <p class="def">接例 1，\(E\) 是棱 \(A_1B_1\) 的中点。求直线 \(DE\) 与 \(A_1B\) 所成角的余弦。</p>
      <p>\(\overrightarrow{DE}=(2,1,2)\)，\(\overrightarrow{A_1B}=(0,2,-2)\)，点积 \(-2\)：\(\cos\theta=\dfrac{|-2|}{3\times2\sqrt2}=\dfrac{\sqrt2}{6}\)。</p>
      <p class="l3-note">两直线所成的角在 \(0^\circ\) 到 \(90^\circ\) 之间，所以取绝对值。拖动 \(t\) 把 \(E\) 推到 \(B_1\)：点积变成 \(0\)，两直线垂直。</p>`,
  },
  lp: {
    name: '(2) 线面角', params: { s: 2, t: 0.5 },
    sliders: [SIDE, TS], buttons: [MID, { label: '▶ E 到 A₁（在面内）', to: () => ({ t: 0 }) }],
    scene(p) {
      const V = withE(p.s, p.t), H = G.footOnPlane(V.E, V.D, N);
      const M = G.mul(G.add(G.add(V.A1, V.B), V.D), 1 / 3), tip = G.add(M, G.mul(G.unit(N), 0.4 * p.s));
      const flat = G.dist(H, V.E) < 1e-9;
      return {
        P: { ...V, H }, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines: [
          { id: 'de', from: V.D, to: V.E, color: 'a', width: 4 },
          ...(flat ? [] : [{ id: 'eh', from: V.E, to: H, color: 'no', width: 2.6, dashed: true }, { id: 'dh', from: V.D, to: H, color: 'c', width: 3 }]),
          { id: 'n', from: M, to: tip, color: 'c', arrow: true, width: 4 },
        ],
        arcs: flat ? [] : [{ id: 'th', O: V.D, A: V.E, B: H, r: 0.3 }],
        dots: [V.E, H],
        anchors: { de: G.lerp(V.D, V.E, 0.6), th: V.D, n: tip },
        u: G.sub(V.E, V.D), H, V,
      };
    },
    read(p, { u, H, V }) {
      const c = G.dot(u, N) / (G.len(u) * G.len(N)), sn = Math.abs(c), th = Math.asin(Math.min(1, sn));
      const geo = lineAng(u, G.sub(H, V.D));
      return [
        ['\\(\\overrightarrow{DE}\\cdot\\boldsymbol n\\)', f4(G.dot(u, N)), 'un', z(G.dot(u, N))],
        ['\\(\\cos\\langle\\overrightarrow{DE},\\boldsymbol n\\rangle\\)', f4(c), 'cos', z(c)],
        ['\\(\\sin\\theta=|\\cos\\langle\\overrightarrow{DE},\\boldsymbol n\\rangle|\\)', f4(sn), 'sin', z(sn)],
        ['线面角 \\(\\theta\\)', dg(th), 'th', z(G.deg(th))],
        ['\\(90^\\circ-\\)（\\(DE\\) 与法向量所成角）', dg(Math.PI / 2 - lineAng(u, N)), 'comp', z(90 - G.deg(lineAng(u, N)))],
        ['几何法：\\(\\angle EDH\\)（\\(H\\) 是垂足）', dg(geo), 'geo', z(G.deg(geo))],
      ];
    },
    note: (p) => (p.t < 1e-9 ? 'E 到 \\(A_1\\)：\\(DA_1\\) 就在平面里，\\(\\overrightarrow{DE}\\cdot\\boldsymbol n=0\\)，线面角是 \\(0^\\circ\\)。'
      : '直线和法向量所成的角与线面角<b>互余</b>，所以是 \\(\\sin\\theta=|\\cos\\langle\\boldsymbol u,\\boldsymbol n\\rangle|\\)，不是 \\(\\cos\\theta\\)。读数里三种算法一样。'),
    tags: [...TAGS, 'H'],
    callouts: [
      { id: 'th', title: '线面角 θ', text: '∠EDH', at: 'th', dx: -160, dy: 50 },
      { id: 'n', title: '法向量 n', text: '(1, −1, −1)', at: 'n', dx: 140, dy: -50 },
    ],
    def: String.raw`<h3>例 4 (2) 直线与平面所成的角</h3>
      <p class="def">求直线 \(DE\) 与平面 \(A_1BD\) 所成角的正弦。</p>
      <p>\(\overrightarrow{DE}\cdot\boldsymbol n=2-1-2=-1\)，\(\sin\theta=\dfrac{|-1|}{3\times\sqrt3}=\dfrac{\sqrt3}{9}\)。</p>
      <p class="l3-note">常见错误：把「和法向量的夹角」当成线面角，用了 \(\cos\)。看图：法向量垂直于平面，两个角加起来是 \(90^\circ\)。</p>`,
  },
  dih: {
    name: '(3) 二面角定正负', params: { s: 2, q: 'C', nf: '1' },
    selects: [
      { key: 'q', label: '问的是', options: [['C', '二面角 A₁-BD-C'], ['A', '二面角 A₁-BD-A']] },
      { key: 'nf', label: '平面 A₁BD 的法向量', options: [['1', 'n = (1, −1, −1)'], ['-1', 'n = (−1, 1, 1)']] },
    ],
    sliders: [SIDE],
    scene(p) {
      const V = G.cubeD(p.s), O = G.lerp(V.B, V.D, 0.5), X = V[p.q], n = G.mul(N, +p.nf);
      const M = G.mul(G.add(G.add(V.A1, V.B), V.D), 1 / 3), L = 0.4 * p.s;
      return {
        P: { ...V, O }, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }, { id: 'base', pts: ['B', 'D', p.q], color: 'c' }],
        lines: [
          { id: 'oa1', from: O, to: V.A1, color: 'a', width: 3.4 },
          { id: 'ox', from: O, to: X, color: 'c', width: 3.4 },
          { id: 'n', from: M, to: G.add(M, G.mul(G.unit(n), L)), color: 'b', arrow: true, width: 4 },
          { id: 'n0', from: O, to: G.add(O, [0, 0, L]), color: 'fg', arrow: true, width: 3 },
        ],
        arcs: [{ id: 'th', O, A: V.A1, B: X, r: 0.25 }],
        dots: [O],
        anchors: { th: O, n: G.add(M, G.mul(G.unit(n), L)), n0: G.add(O, [0, 0, L]) },
        V, O, X, n,
      };
    },
    read(p, { V, O, X, n }) {
      const n0 = [0, 0, 1], c = G.dot(n, n0) / G.len(n);
      const a = G.sub(V.A1, O), b = G.sub(X, O), cg = G.dot(a, b) / (G.len(a) * G.len(b));
      const kind = Math.abs(cg) < 1e-9 ? '直角' : cg > 0 ? '锐角' : '钝角';
      const sgn = kind === '钝角' ? -1 : 1;                       // 看图定号：钝角取负
      return [
        ['\\(\\cos\\langle\\boldsymbol n,\\boldsymbol n_0\\rangle\\)', f4(c), 'cn', z(c)],
        ['看图：二面角是', `<span>${kind}</span>`, 'kind', kind],
        ['\\(|\\cos\\theta|=|\\cos\\langle\\boldsymbol n,\\boldsymbol n_0\\rangle|\\)', f4(Math.abs(c)), 'cabs', z(Math.abs(c))],
        ['按图定号：\\(\\cos\\theta\\)', f4(sgn * Math.abs(c)), 'cos', z(sgn * Math.abs(c))],
        ['二面角 \\(\\theta\\)', dg(Math.acos(Math.max(-1, Math.min(1, cg)))), 'th', z(G.deg(Math.acos(Math.max(-1, Math.min(1, cg)))))],
        ['几何法：\\(\\cos\\angle A_1O' + p.q + '\\)（\\(O\\) 是 \\(BD\\) 中点）', f4(cg), 'cg', z(cg)],
      ];
    },
    note: (p) => (p.q === 'C'
      ? '\\(A_1\\) 在 \\(A\\) 正上方，\\(A\\) 和 \\(C\\) 在 \\(BD\\) 两侧：半平面 \\(A_1BD\\) 斜向 \\(A\\) 那边，和 \\(C\\) 那侧的底面张开的角大于 \\(90^\\circ\\)，是钝角，\\(\\cos\\theta=-\\dfrac{\\sqrt3}{3}\\)。'
      : '问 \\(A_1\\text{-}BD\\text{-}A\\)：半平面 \\(A_1BD\\) 和 \\(A\\) 那侧的底面张开的角小于 \\(90^\\circ\\)，是锐角，\\(\\cos\\theta=\\dfrac{\\sqrt3}{3}\\)。两个二面角互补。')
      + ' 把法向量换成反方向：\\(\\cos\\langle\\boldsymbol n,\\boldsymbol n_0\\rangle\\) 变号，二面角不变。正负要看图定，不能只看法向量夹角。',
    tags: [...TAGS.filter((t) => t !== 'E'), 'O'],
    callouts: [
      { id: 'th', title: '平面角', text: 'OA₁、OC（或 OA）都 ⊥ BD', at: 'th', dx: -160, dy: 60 },
      { id: 'n', title: '法向量 n', text: '平面 A₁BD', at: 'n', dx: 140, dy: -50 },
      { id: 'n0', title: 'n₀ = (0, 0, 1)', text: '底面', at: 'n0', dx: -150, dy: -60 },
    ],
    def: String.raw`<h3>例 4 (3) 二面角的余弦</h3>
      <p class="def">求二面角 \(A_1\text{-}BD\text{-}C\) 的余弦。</p>
      <p>底面法向量 \(\boldsymbol n_0=(0,0,1)\)，\(\cos\langle\boldsymbol n,\boldsymbol n_0\rangle=\dfrac{-1}{\sqrt3}\)。<b>定正负</b>：二面角 \(A_1\text{-}BD\text{-}C\) 是钝角，\(\cos\theta=-\dfrac{\sqrt3}{3}\)。</p>
      <p class="l3-note">同一组法向量，问 \(A_1\text{-}BD\text{-}A\) 就是锐角，余弦 \(\dfrac{\sqrt3}{3}\)。法向量的方向随手取，二面角的正负要结合图形判断。</p>`,
  },
};

makeLab({
  page: 'e1-1-4-x3', modes,
  aria: '可拖动旋转的正方体，用向量求直线 DE 与 A₁B 所成的角、DE 与平面 A₁BD 所成的角，以及二面角 A₁-BD-C 并判断锐钝',
  quizItems: (show) => [
    {
      q: '\\(E\\) 是 \\(A_1B_1\\) 中点，直线 \\(DE\\) 与 \\(A_1B\\) 所成角的余弦是？',
      opts: ['\\(\\dfrac{\\sqrt2}{6}\\)', '\\(-\\dfrac{\\sqrt2}{6}\\)', '\\(\\dfrac{\\sqrt2}{3}\\)'], answer: 0,
      why: '点积 \\(-2\\)，\\(|\\overrightarrow{DE}|=3\\)，\\(|\\overrightarrow{A_1B}|=2\\sqrt2\\)，\\(\\cos\\theta=\\dfrac{2}{6\\sqrt2}=\\dfrac{\\sqrt2}{6}\\)。线线角的余弦不会是负数。',
      show: show('ll', { s: 2, t: 0.5 }), showLabel: '在模型上看',
    },
    {
      q: '直线 \\(DE\\) 与平面 \\(A_1BD\\) 所成的角 \\(\\theta\\) 满足？',
      opts: ['\\(\\sin\\theta=\\dfrac{\\sqrt3}{9}\\)', '\\(\\cos\\theta=\\dfrac{\\sqrt3}{9}\\)', '\\(\\sin\\theta=-\\dfrac{\\sqrt3}{9}\\)'], answer: 0,
      why: '\\(|\\cos\\langle\\overrightarrow{DE},\\boldsymbol n\\rangle|\\) 等于线面角的<b>正弦</b>：直线和法向量所成角与线面角互余。',
      show: show('lp', { s: 2, t: 0.5 }), showLabel: '在模型上看',
    },
    {
      q: '二面角 \\(A_1\\text{-}BD\\text{-}C\\) 的余弦是？',
      opts: ['\\(-\\dfrac{\\sqrt3}{3}\\)', '\\(\\dfrac{\\sqrt3}{3}\\)', '\\(\\dfrac{\\sqrt6}{3}\\)'], answer: 0,
      why: '\\(|\\cos\\theta|=\\dfrac{\\sqrt3}{3}\\)。\\(A\\)、\\(C\\) 在 \\(BD\\) 两侧，\\(A_1\\) 在 \\(A\\) 正上方，二面角是钝角，取负。',
      show: show('dih', { q: 'C', nf: '1' }), showLabel: '在模型上看',
    },
    {
      q: '把平面 \\(A_1BD\\) 的法向量换成 \\((-1,1,1)\\)，二面角 \\(A_1\\text{-}BD\\text{-}C\\) 的余弦？',
      opts: ['不变，仍是 \\(-\\dfrac{\\sqrt3}{3}\\)', '变成 \\(\\dfrac{\\sqrt3}{3}\\)', '变成 \\(0\\)'], answer: 0,
      why: '法向量反向只让 \\(\\cos\\langle\\boldsymbol n,\\boldsymbol n_0\\rangle\\) 变号，二面角本身没变。正负靠看图定。',
      show: show('dih', { q: 'C', nf: '-1' }), showLabel: '换法向量看',
    },
  ],
});
