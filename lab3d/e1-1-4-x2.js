// 1.4 例 3 点到平面的距离 · 例题舞台（PY-384）
// 课本坐标：正方体棱长 s（课本 s = 2），D 为原点。平面 A₁BD 的法向量 n = (1, −1, −1)。
// 「求距离」：面内的点 Q = D + u·DB + v·DA₁ 随便取，d = |QC₁·n| / |n| 都是 2s/√3；
// 「换一个点」：A、C、B₁ 到平面的距离都是 s/√3，C₁ 是它们的 2 倍。
import { makeLab } from './rlab.js';
import * as G from './geom3.js';

const FACES = [['A', 'B', 'C', 'D'], ['A1', 'B1', 'C1', 'D1'], ['A', 'B', 'B1', 'A1'], ['B', 'C', 'C1', 'B1'], ['C', 'D', 'D1', 'C1'], ['D', 'A', 'A1', 'D1']];
const TAGS = ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'];
const N = [1, -1, -1];
const f2 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(2);
const vs = (v) => `(${v.map(f2).join(', ')})`;
const vec = (v) => `<span>${vs(v)}</span>`;
/** data-v 里的数：把 1e-16 这类浮点噪声归零，和显示的 0.00 一致 */
const z = (x) => (Math.abs(x) < 5e-10 ? 0 : x);
const at = (n) => (p) => +p.st >= n;
const SIDE = ['s', '棱长', 1, 3, 0.5];

/** 投影段：从 Q 沿 n 方向量出 QX 在 n 上的投影，终点 R 与 X 同高（R − Q ∥ n） */
function projection(Q, X) {
  const t = G.dot(G.sub(X, Q), N) / G.dot(N, N);
  return G.add(Q, G.mul(N, t));
}

const modes = {
  dist: {
    name: '求距离', params: { s: 2, u: 0, v: 0, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 点 C₁ 和平面 A₁BD'], ['2', '② 面内取一点 Q，连 QC₁'], ['3', '③ QC₁ 在 n 上的投影'], ['4', '④ 投影长 = 距离']] }],
    sliders: [SIDE, ['u', 'Q 沿 DB 走 u', 0, 1, 0.05], ['v', 'Q 沿 DA₁ 走 v', 0, 1, 0.05]],
    buttons: [
      { label: '▶ Q 取 D', primary: true, to: () => ({ u: 0, v: 0 }) },
      { label: '▶ Q 取 B', to: () => ({ u: 1, v: 0 }) },
      { label: '▶ Q 取 A₁', to: () => ({ u: 0, v: 1 }) },
    ],
    scene(p) {
      const V = G.cubeD(p.s), s = +p.st;
      const Q = G.add(G.mul(G.sub(V.B, V.D), p.u), G.mul(G.sub(V.A1, V.D), p.v));
      const H = G.footOnPlane(V.C1, V.D, N), R = projection(Q, V.C1);
      const lines = [];
      if (s >= 2) lines.push({ id: 'qx', from: Q, to: V.C1, color: 'a', arrow: true, width: 3.6 });
      if (s >= 3) lines.push({ id: 'qr', from: Q, to: R, color: 'c', width: 4.4 }, { id: 'rx', from: R, to: V.C1, color: 'no', width: 2, dashed: true });
      if (s >= 4) lines.push({ id: 'xh', from: V.C1, to: H, color: 'no', width: 3.4 });
      return {
        P: { ...V, Q, H }, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines, arcs: s >= 4 ? [{ id: 'rt', O: H, A: V.C1, B: G.dist(H, V.D) > 1e-6 ? V.D : V.B, r: 0.1 }] : [],
        dots: s >= 2 ? [Q, V.C1] : [V.C1],
        anchors: { x: V.C1, qx: G.lerp(Q, V.C1, 0.5), qr: G.lerp(Q, R, 0.5), xh: G.lerp(V.C1, H, 0.5), q: Q },
        V, Q, H,
      };
    },
    read(p, { V, Q, H }) {
      const w = G.sub(V.C1, Q), wn = G.dot(w, N), d = Math.abs(wn) / G.len(N);
      return [
        ['面内的点 \\(Q\\)', vec(Q), 'q', vs(Q)],
        ['\\(\\boldsymbol n\\cdot\\overrightarrow{DQ}\\)（\\(Q\\) 在面内）', f2(G.dot(N, Q)), 'qin', z(G.dot(N, Q))],
        ['\\(\\overrightarrow{QC_1}\\)', vec(w), 'w', vs(w)],
        ['\\(\\overrightarrow{QC_1}\\cdot\\boldsymbol n\\)', f2(wn), 'wn', z(wn)],
        ['\\(d=\\dfrac{|\\overrightarrow{QC_1}\\cdot\\boldsymbol n|}{|\\boldsymbol n|}\\)', d.toFixed(4), 'd', z(d)],
        ['垂线段 \\(C_1H\\)（直接量）', G.dist(V.C1, H).toFixed(4), 'ch', z(G.dist(V.C1, H))],
      ];
    },
    note: (p) => [
      `求点 \\(C_1(0,${p.s},${p.s})\\) 到平面 \\(A_1BD\\) 的距离，法向量 \\(\\boldsymbol n=(1,-1,-1)\\)（例 1）。`,
      '面内随便取一点 \\(Q\\)，连 \\(\\overrightarrow{QC_1}\\)。拖 \\(u\\)、\\(v\\) 换 \\(Q\\) 的位置。',
      '\\(\\overrightarrow{QC_1}\\) 在法向量方向上的投影（绿段），就是 \\(C_1\\) 离平面有多远。',
      `\\(d=\\dfrac{|\\overrightarrow{QC_1}\\cdot\\boldsymbol n|}{|\\boldsymbol n|}=\\dfrac{${2 * p.s}}{\\sqrt3}\\)。\\(Q\\) 取哪都一样：\\(Q\\) 在面内移动，\\(\\overrightarrow{QC_1}\\cdot\\boldsymbol n\\) 不变。`,
    ][+p.st - 1],
    tags: [...TAGS, 'Q', 'H'],
    callouts: [
      { id: 'x', title: '点 C₁', text: '', at: 'x', dx: -140, dy: -50 },
      { id: 'qx', title: 'QC₁', text: 'Q 在面内随便取', at: 'qx', dx: -170, dy: 40, when: at(2) },
      { id: 'qr', title: '投影长 = d', text: '|QC₁·n| / |n|', at: 'qr', dx: 150, dy: 60, when: at(3) },
    ],
    def: String.raw`<h3>例 3 点到平面的距离</h3>
      <p class="def">棱长为 \(2\) 的正方体中，求点 \(C_1\) 到平面 \(A_1BD\) 的距离。</p>
      <p>面内取 \(D\)：\(\overrightarrow{DC_1}=(0,2,2)\)，\(\overrightarrow{DC_1}\cdot\boldsymbol n=-4\)，\(d=\dfrac{|-4|}{\sqrt3}=\dfrac{4\sqrt3}{3}\)。换成 \(B\)：\(\overrightarrow{BC_1}=(-2,0,2)\)，点积还是 \(-4\)。</p>
      <p class="l3-note">公式就是「\(\overrightarrow{QC_1}\) 在法向量上投影的长度」。拖动 \(Q\) 看：投影长不变，和直接量的垂线段 \(C_1H\) 一样长。</p>`,
  },
  pts: {
    name: '换一个点', params: { s: 2, x: 'C1' },
    selects: [{ key: 'x', label: '到平面 A₁BD 的点', options: [['C1', '点 C₁'], ['A', '点 A'], ['C', '点 C'], ['B1', '点 B₁'], ['D1', '点 D₁']] }],
    sliders: [SIDE],
    scene(p) {
      const V = G.cubeD(p.s), X = V[p.x], H = G.footOnPlane(X, V.D, N);
      const far = [V.A1, V.B, V.D].sort((q, r) => G.dist(r, H) - G.dist(q, H))[0];
      return {
        P: { ...V, H }, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines: [{ id: 'xh', from: X, to: H, color: 'no', width: 3.6 }, { id: 'dx', from: V.D, to: X, color: 'a', width: 2.4, dashed: true }],
        arcs: [{ id: 'rt', O: H, A: X, B: far, r: 0.1 }],
        dots: [X, H],
        anchors: { xh: G.lerp(X, H, 0.5), x: X },
        V, X, H,
      };
    },
    read(p, { V, X, H }) {
      const wn = G.dot(G.sub(X, V.D), N), d = Math.abs(wn) / G.len(N);
      const side = Math.abs(wn) < 1e-9 ? '在面内' : wn > 0 ? '与 n 同侧' : '与 n 异侧';
      return [
        ['\\(\\overrightarrow{DX}\\cdot\\boldsymbol n\\)', f2(wn), 'wn', z(wn)],
        ['距离 \\(d\\)', d.toFixed(4), 'd', z(d)],
        ['\\(d\\div\\dfrac{s}{\\sqrt3}\\)', (d / (p.s / Math.sqrt(3))).toFixed(4), 'ratio', d / (p.s / Math.sqrt(3))],
        ['垂线段 \\(XH\\)（直接量）', G.dist(X, H).toFixed(4), 'ch', z(G.dist(X, H))],
        ['点在平面的哪一侧', `<span>${side}</span>`, 'side', side],
      ];
    },
    note: () => '\\(A\\)、\\(C\\)、\\(B_1\\) 到平面 \\(A_1BD\\) 一样远，都是 \\(\\dfrac{s}{\\sqrt3}\\)；\\(C_1\\) 是它们的 2 倍。点积的正负只说明点在平面哪一侧，距离要取绝对值。',
    tags: [...TAGS, 'H'],
    callouts: [
      { id: 'xh', title: '距离 d', text: '垂足 H', at: 'xh', dx: 150, dy: 50 },
    ],
    def: String.raw`<h3>换一个点</h3>
      <p class="def">点 \(X\) 到平面的距离 \(d=\dfrac{|\overrightarrow{DX}\cdot\boldsymbol n|}{|\boldsymbol n|}\)，\(D\) 是面内一点。</p>
      <p>点积可能是负的（点在法向量的另一侧），所以要加绝对值。</p>
      <p class="l3-note">比一比：\(\overrightarrow{DA}\cdot\boldsymbol n=s\)，\(\overrightarrow{DC_1}\cdot\boldsymbol n=-2s\)。正负号不同，说明 \(A\) 和 \(C_1\) 在平面两侧。</p>`,
  },
};

makeLab({
  page: 'e1-1-4-x2', modes,
  aria: '可拖动旋转的正方体，用法向量求点 C₁ 到平面 A₁BD 的距离，面内的取点可以移动',
  quizItems: (show) => [
    {
      q: '棱长 2 的正方体中，\\(C_1\\) 到平面 \\(A_1BD\\) 的距离是？',
      opts: ['\\(\\dfrac{4\\sqrt3}{3}\\)', '\\(\\dfrac{2\\sqrt3}{3}\\)', '\\(4\\)'], answer: 0,
      why: '\\(\\overrightarrow{DC_1}\\cdot\\boldsymbol n=-4\\)，\\(|\\boldsymbol n|=\\sqrt3\\)，\\(d=\\dfrac{4}{\\sqrt3}=\\dfrac{4\\sqrt3}{3}\\)。忘了除以 \\(|\\boldsymbol n|\\) 就会得 4。',
      show: show('dist', { s: 2, st: '4' }), showLabel: '看第 ④ 步',
    },
    {
      q: '面内的点从 \\(D\\) 换成 \\(B\\)，\\(\\overrightarrow{BC_1}\\cdot\\boldsymbol n\\) 等于？',
      opts: ['\\(-4\\)，和 \\(D\\) 一样', '\\(4\\)', '\\(0\\)'], answer: 0,
      why: '\\(\\overrightarrow{BC_1}=\\overrightarrow{DC_1}-\\overrightarrow{DB}\\)，而 \\(\\overrightarrow{DB}\\cdot\\boldsymbol n=0\\)，所以点积不变。',
      show: show('dist', { s: 2, u: 1, v: 0, st: '4' }), showLabel: 'Q 取 B',
    },
    {
      q: '平面 \\(\\alpha\\) 过 \\(A(1,0,0)\\)，法向量 \\(\\boldsymbol n=(2,-1,2)\\)，\\(P(0,3,0)\\) 到 \\(\\alpha\\) 的距离？',
      opts: ['\\(\\dfrac53\\)', '\\(-\\dfrac53\\)', '\\(5\\)'], answer: 0,
      why: '\\(\\overrightarrow{AP}=(-1,3,0)\\)，\\(\\overrightarrow{AP}\\cdot\\boldsymbol n=-5\\)，\\(|\\boldsymbol n|=3\\)，\\(d=\\dfrac53\\)。距离不会是负数。',
    },
    {
      q: '正方体中，\\(A\\) 与 \\(C_1\\) 到平面 \\(A_1BD\\) 的距离之比？',
      opts: ['\\(1:2\\)', '\\(1:1\\)', '\\(1:3\\)'], answer: 0,
      why: '\\(\\overrightarrow{DA}\\cdot\\boldsymbol n=s\\)，\\(\\overrightarrow{DC_1}\\cdot\\boldsymbol n=-2s\\)，绝对值之比 \\(1:2\\)。',
      show: show('pts', { x: 'A' }), showLabel: '看点 A',
    },
  ],
});
