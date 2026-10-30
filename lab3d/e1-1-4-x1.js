// 1.4 例 1–2 平面的法向量与平行、垂直 · 例题舞台（PY-384）
// 和课时页同一套坐标：正方体棱长 s（课本 s = 2），D 为原点，DA、DC、DD₁ 为 x、y、z 轴。
// 平面 A₁BD 的法向量 n = k(1, −1, −1)：k 可以拖，k < 0 时箭头反向，平行/垂直的结论不变；k = 0 是零向量，不能当法向量。
import { makeLab, dg } from './rlab.js';
import * as G from './geom3.js';

const f2 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(2);
const vs = (v) => `(${v.map(f2).join(', ')})`;
const vec = (v) => `<span>${vs(v)}</span>`;
/** data-v 里的数：把 1e-16 这类浮点噪声归零，和显示的 0.00 一致 */
const z = (x) => (Math.abs(x) < 5e-10 ? 0 : x);
const FACES = [['A', 'B', 'C', 'D'], ['A1', 'B1', 'C1', 'D1'], ['A', 'B', 'B1', 'A1'], ['B', 'C', 'C1', 'B1'], ['C', 'D', 'D1', 'C1'], ['D', 'A', 'A1', 'D1']];
const TAGS = ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1'];
const N0 = [1, -1, -1];
const at = (n) => (p) => +p.st >= n;
const SIDE = ['s', '棱长', 1, 3, 0.5];
const KS = ['k', '法向量 n = k(1, −1, −1) 的 k', -2, 2, 0.5];
/** 法向量箭头：从三角形 A₁BD 的重心出发，长度随 k 伸缩，k < 0 反向 */
function nArrow(V, s, k) {
  const M = G.mul(G.add(G.add(V.A1, V.B), V.D), 1 / 3);
  const tip = G.add(M, G.mul(G.unit(N0), 0.45 * s * k));
  return { M, tip, line: k === 0 ? [] : [{ id: 'n', from: M, to: tip, color: 'c', arrow: true, width: 4.4 }] };
}

const LINES = {
  CB1: { label: 'CB₁', from: 'C', to: 'B1' },
  AC1: { label: 'AC₁', from: 'A', to: 'C1' },
  A1B: { label: 'A₁B（在面内）', from: 'A1', to: 'B' },
  DC1: { label: 'DC₁', from: 'D', to: 'C1' },
};
/** 用法向量判断直线 XY 与平面 A₁BD（过 D）的关系 */
function relation(u, X, n) {
  if (G.len(n) < 1e-12) return '判断不了（n 是零向量）';
  const un = G.dot(u, n), on = G.dot(n, X);                    // 平面过原点 D：n·(X − D) = n·X
  if (Math.abs(un) < 1e-9) return Math.abs(on) < 1e-9 ? '在面内' : '平行';
  return G.len(G.cross(u, n)) < 1e-9 * G.len(u) * G.len(n) ? '垂直' : '斜交';
}

const modes = {
  nvec: {
    name: '例 1 求法向量', params: { s: 2, k: 1, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 建系，看平面 A₁BD'], ['2', '② 面内两个向量 DA₁、DB'], ['3', '③ 列方程，令 x = 1'], ['4', '④ 验算：n 与两向量都垂直']] }],
    sliders: [SIDE, KS],
    buttons: [{ label: '▶ 取 k = 1', primary: true, to: () => ({ k: 1 }) }, { label: '▶ 反向 k = −1', to: () => ({ k: -1 }) }],
    scene(p) {
      const V = G.cubeD(p.s), s = +p.st, L = 0.35 * p.s;
      const lines = [
        { id: 'x', from: V.D, to: G.add(V.A, [L, 0, 0]), color: 'fg', arrow: true, width: 2.2 },
        { id: 'y', from: V.D, to: G.add(V.C, [0, L, 0]), color: 'fg', arrow: true, width: 2.2 },
        { id: 'z', from: V.D, to: G.add(V.D1, [0, 0, L]), color: 'fg', arrow: true, width: 2.2 },
      ];
      if (s >= 2) lines.push({ id: 'da1', from: V.D, to: V.A1, color: 'a', arrow: true, width: 3.6 }, { id: 'db', from: V.D, to: V.B, color: 'b', arrow: true, width: 3.6 });
      const na = nArrow(V, p.s, p.k);
      if (s >= 3) lines.push(...na.line);
      return {
        P: V, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines, dots: s >= 3 ? [na.M] : [],
        anchors: { x: G.add(V.A, [L, 0, 0]), z: G.add(V.D1, [0, 0, L]), da1: G.lerp(V.D, V.A1, 0.55), db: G.lerp(V.D, V.B, 0.6), n: p.k === 0 ? na.M : na.tip },
        V,
      };
    },
    read(p, { V }) {
      const n = G.mul(N0, p.k), a = G.sub(V.A1, V.D), b = G.sub(V.B, V.D);
      return [
        ['\\(\\overrightarrow{DA_1}\\)', vec(a), 'da1', vs(a)],
        ['\\(\\overrightarrow{DB}\\)', vec(b), 'db', vs(b)],
        ['法向量 \\(\\boldsymbol n\\)', vec(n), 'n', vs(n)],
        ['\\(\\boldsymbol n\\cdot\\overrightarrow{DA_1}\\)', f2(G.dot(n, a)), 'na', z(G.dot(n, a))],
        ['\\(\\boldsymbol n\\cdot\\overrightarrow{DB}\\)', f2(G.dot(n, b)), 'nb', z(G.dot(n, b))],
        ['\\(|\\boldsymbol n|\\)', G.len(n).toFixed(4), 'len', z(G.len(n))],
        ['能当法向量吗', `<span>${p.k === 0 ? '不能（零向量）' : '能'}</span>`, 'ok', p.k === 0 ? '不能' : '能'],
      ];
    },
    note: (p) => (p.k === 0 ? '\\(k=0\\) 时 \\(\\boldsymbol n=\\boldsymbol 0\\)：零向量和什么都「垂直」，但不能当法向量。' : [
      '以 \\(D\\) 为原点，\\(DA,DC,DD_1\\) 为 \\(x,y,z\\) 轴。要找一个垂直于平面 \\(A_1BD\\) 的向量。',
      `面内取两个不共线的向量：\\(\\overrightarrow{DA_1}=(${p.s},0,${p.s})\\)，\\(\\overrightarrow{DB}=(${p.s},${p.s},0)\\)。`,
      '设 \\(\\boldsymbol n=(x,y,z)\\)，\\(\\boldsymbol n\\cdot\\overrightarrow{DA_1}=0\\)、\\(\\boldsymbol n\\cdot\\overrightarrow{DB}=0\\) 得 \\(z=-x\\)、\\(y=-x\\)。方程没逼 \\(x=0\\)，令 \\(x=1\\)，\\(\\boldsymbol n=(1,-1,-1)\\)。',
      '两个点积都是 0，\\(\\boldsymbol n\\) 就垂直于整个平面。拖动 \\(k\\)：\\(k\\boldsymbol n\\)（\\(k\\ne0\\)）也都是法向量，反向的也算。',
    ][+p.st - 1]),
    tags: TAGS,
    callouts: [
      { id: 'pl', title: '平面 A₁BD', text: '', at: 'db', dx: 130, dy: 70 },
      { id: 'da1', title: 'DA₁', text: '面内向量', at: 'da1', dx: -150, dy: -40, when: at(2) },
      { id: 'n', title: '法向量 n', text: '⊥ DA₁，⊥ DB', at: 'n', dx: 140, dy: -50, when: at(3) },
    ],
    def: String.raw`<h3>例 1 求平面的法向量</h3>
      <p class="def">棱长为 \(2\) 的正方体 \(ABCD\text{-}A_1B_1C_1D_1\)，以 \(D\) 为原点，\(DA,DC,DD_1\) 为 \(x,y,z\) 轴建系。求平面 \(A_1BD\) 的一个法向量。</p>
      <p>面内取两个不共线向量，设 \(\boldsymbol n=(x,y,z)\)，令两个数量积都为 \(0\)，解出一组非零解：\(\boldsymbol n=(1,-1,-1)\)。</p>
      <p class="l3-note">法向量不唯一：\(k\boldsymbol n\)（\(k\ne0\)）都行。拖动 \(k\) 看箭头伸缩、反向，两个点积一直是 \(0\)。</p>`,
  },
  pp: {
    name: '例 2 证平行、垂直', params: { s: 2, k: 1, l: 'CB1' },
    selects: [{ key: 'l', label: '直线（与平面 A₁BD）', options: Object.entries(LINES).map(([k, v]) => [k, v.label]) }],
    sliders: [SIDE, KS],
    buttons: [{ label: '▶ 法向量反向', primary: true, to: (p) => ({ k: p.k === 0 ? -1 : -p.k }) }],
    scene(p) {
      const V = G.cubeD(p.s), L = LINES[p.l], X = V[L.from], Y = V[L.to];
      const na = nArrow(V, p.s, p.k);
      return {
        P: V, solid: { faces: FACES },
        planes: [{ id: 'pl', pts: ['A1', 'B', 'D'], color: 'b' }],
        lines: [{ id: 'l', from: X, to: Y, color: 'a', width: 4.4 }, ...na.line],
        dots: [X, na.M],
        anchors: { l: G.lerp(X, Y, 0.5), x: X, n: p.k === 0 ? na.M : na.tip },
        V, X, u: G.sub(Y, X),
      };
    },
    read(p, { X, u }) {
      const n = G.mul(N0, p.k), kind = relation(u, X, n);
      const multiple = p.k === 0 ? '不能判断（n 是零向量）' : kind === '垂直' ? '是' : '否';
      return [
        ['方向向量 \\(\\boldsymbol u\\)', vec(u), 'u', vs(u)],
        ['法向量 \\(\\boldsymbol n\\)', vec(n), 'n', vs(n)],
        ['\\(\\boldsymbol u\\cdot\\boldsymbol n\\)', f2(G.dot(u, n)), 'un', z(G.dot(u, n))],
        ['起点代入：\\(\\boldsymbol n\\cdot\\overrightarrow{DX}\\)', f2(G.dot(n, X)), 'on', z(G.dot(n, X))],
        ['u 是否为 n 的非零倍数', `<span>${multiple}</span>`, 'multiple', multiple],
        ['直线与平面', `<span>${kind}</span>`, 'kind', kind],
      ];
    },
    note: (p) => (p.k === 0
      ? '\\(k=0\\) 时 \\(\\boldsymbol n=\\boldsymbol 0\\)，不能当法向量。它与任意向量的点积为 0，不能用它判断直线与平面的位置关系；请先取 \\(k\\ne0\\)。'
      : {
      CB1: '\\(\\boldsymbol u\\cdot\\boldsymbol n=0\\) 只说明「平行或在面内」。再代入点 \\(C\\)：\\(\\boldsymbol n\\cdot\\overrightarrow{DC}\\ne0\\)，\\(C\\) 不在面内，所以平行。',
      AC1: '\\(k\\ne0\\) 时，\\(\\overrightarrow{AC_1}=(-s,s,s)=-\\dfrac{s}{k}\\boldsymbol n\\)，是非零法向量的非零倍数。两向量共线（反向也共线），所以直线垂直于平面。',
      A1B: '反例：\\(\\boldsymbol u\\cdot\\boldsymbol n=0\\)，起点 \\(A_1\\) 也满足 \\(\\boldsymbol n\\cdot\\overrightarrow{DA_1}=0\\)，直线就在平面里，不能说平行。',
      DC1: '\\(\\boldsymbol u\\cdot\\boldsymbol n\\ne0\\)，又不是 \\(\\boldsymbol n\\) 的倍数：直线和平面斜着相交。',
    }[p.l]),
    tags: TAGS,
    callouts: [
      { id: 'l', title: '直线', text: '方向向量 u', at: 'l', dx: -160, dy: -40 },
      { id: 'n', title: '法向量 n', text: 'k(1, −1, −1)', at: 'n', dx: 140, dy: -50 },
    ],
    def: String.raw`<h3>例 2 用法向量证平行、垂直</h3>
      <p class="def">接例 1，\(\boldsymbol n=(1,-1,-1)\)。证明：(1) \(CB_1\parallel\) 平面 \(A_1BD\)；(2) \(AC_1\perp\) 平面 \(A_1BD\)。</p>
      <p>(1) \(\overrightarrow{CB_1}\cdot\boldsymbol n=0\)，<b>再说明 \(C\) 不在平面内</b>，才能下结论平行。(2) \(\overrightarrow{AC_1}=-2\boldsymbol n\)，与法向量共线，所以垂直。</p>
      <p class="l3-note">切到 \(A_1B\)：点积同样是 \(0\)，但它在面内。点「法向量反向」：结论一个都不变。</p>`,
  },
};

makeLab({
  page: 'e1-1-4-x1', modes,
  aria: '可拖动旋转的正方体，求平面 A₁BD 的法向量，并用它判断直线与平面平行、垂直、在面内或斜交',
  quizItems: (show) => [
    {
      q: '下列哪个是平面 \\(A_1BD\\) 的法向量？',
      opts: ['\\((-2,2,2)\\)', '\\((1,1,1)\\)', '\\((1,0,-1)\\)'], answer: 0,
      why: '\\((-2,2,2)=-2(1,-1,-1)\\)，非零倍数也是法向量。\\((1,0,-1)\\cdot\\overrightarrow{DA_1}=0\\)，但 \\((1,0,-1)\\cdot\\overrightarrow{DB}=2\\ne0\\)。',
      show: show('nvec', { k: -2, st: '4' }), showLabel: '看 k = −2',
    },
    {
      q: '\\(\\overrightarrow{CB_1}\\cdot\\boldsymbol n=0\\)，能直接说 \\(CB_1\\parallel\\) 平面 \\(A_1BD\\) 吗？',
      opts: ['不能，还要说明 \\(C\\) 不在平面内', '能，点积为 0 就平行', '不能，还要算 \\(|\\overrightarrow{CB_1}|\\)'], answer: 0,
      why: '点积为 0 只说明「平行或在面内」。\\(A_1B\\) 的点积也是 0，它就在面内。',
      show: show('pp', { l: 'A1B', k: 1 }), showLabel: '看 A₁B',
    },
    {
      q: '\\(\\overrightarrow{AC_1}=(-2,2,2)\\)，\\(AC_1\\) 与平面 \\(A_1BD\\)？',
      opts: ['垂直', '平行', '斜交'], answer: 0,
      why: '\\(\\overrightarrow{AC_1}=-2\\boldsymbol n\\)，与法向量共线，所以 \\(AC_1\\perp\\) 平面 \\(A_1BD\\)。',
      show: show('pp', { l: 'AC1', k: 1 }), showLabel: '看 AC₁',
    },
    {
      q: '把法向量换成 \\(-3\\boldsymbol n\\)，\\(CB_1\\) 与平面的关系？',
      opts: ['不变，仍平行', '变成垂直', '变成斜交'], answer: 0,
      why: '\\(-3\\boldsymbol n\\) 仍垂直于平面，点积仍为 0，点 \\(C\\) 仍不在面内。结论和法向量取哪个倍数无关。',
      show: show('pp', { l: 'CB1', k: -2 }), showLabel: '看反向的 n',
    },
  ],
});
