// 8.6 例 3 正四面体的二面角 · 例题舞台（PY-377）
// 棱 AB 的中点 D 放在原点，AB 沿 x；底面 ABC 在 z = 0，C = (0, m, 0)，m = √3a/2；
// 面 PAB 绕 AB 折起，P = (0, m cosθ, m sinθ)，θ 就是二面角 P-AB-C。正四面体时 cosθ = 1/3。
// 「折叠」把 θ 从锐角拖到钝角：两个外法向量的夹角始终是 180° − θ；
// 法向量公式取绝对值只给出两平面所成的角（≤ 90°），二面角是锐是钝要另看图。
import { makeLab, dg } from './rlab.js';
import * as G from './geom3.js';

const RAD = (d) => (d * Math.PI) / 180;
const REG = Math.acos(1 / 3);
function tetra(a, th) {
  const m = (Math.sqrt(3) / 2) * a;
  return { A: [-a / 2, 0, 0], B: [a / 2, 0, 0], C: [0, m, 0], P: [0, m * Math.cos(th), m * Math.sin(th)], D: [0, 0, 0] };
}
/** 两个面的外法向量：底面 ABC 的指离 P 那一侧，面 PAB 的指离 C 那一侧 */
function outward(V) {
  let n1 = G.normal(V.A, V.B, V.C), n2 = G.normal(V.A, V.B, V.P);
  if (G.dot(n1, G.sub(V.P, V.D)) > 0) n1 = G.mul(n1, -1);
  if (G.dot(n2, G.sub(V.C, V.D)) > 0) n2 = G.mul(n2, -1);
  return [n1, n2];
}
const FACES = [['A', 'B', 'C'], ['P', 'A', 'B'], ['P', 'B', 'C'], ['P', 'A', 'C']];
const at = (n) => (p) => +p.st >= n;
/** 平面角 ∠PDC（弧度），由坐标现算 */
const planeAngle = (V) => Math.acos(Math.max(-1, Math.min(1, G.dot(G.sub(V.P, V.D), G.sub(V.C, V.D)) / (G.dist(V.P, V.D) * G.dist(V.C, V.D)))));

function normalLines(V, n1, n2, L) {
  const M1 = G.lerp(V.D, V.C, 0.45), M2 = G.lerp(V.D, V.P, 0.45);
  return [
    { id: 'n1', from: M1, to: G.add(M1, G.mul(G.unit(n1), L)), color: 'c', arrow: true, width: 3 },
    { id: 'n2', from: M2, to: G.add(M2, G.mul(G.unit(n2), L)), color: 'b', arrow: true, width: 3 },
  ];
}

const modes = {
  reg: {
    name: '求二面角', params: { a: 1.6, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 棱 AB 和两个面'], ['2', '② 取 AB 的中点 D'], ['3', '③ 连 PD、CD，都 ⊥ AB'], ['4', '④ 解 △PDC'], ['5', '⑤ 用法向量验算（选必一）']] }],
    sliders: [['a', '棱长 a', 1, 2.2, 0.1]],
    scene(p) {
      const V = tetra(p.a, REG), s = +p.st;
      const [n1, n2] = outward(V);
      const lines = [{ id: 'ab', from: V.A, to: V.B, color: 'fg', width: 3.4 }];
      const arcs = [];
      if (s >= 3) {
        lines.push({ id: 'pd', from: V.P, to: V.D, color: 'b', width: 3.4 }, { id: 'cd', from: V.C, to: V.D, color: 'c', width: 3.4 });
        arcs.push({ id: 'pd', O: V.D, A: V.P, B: V.B, r: 0.07 }, { id: 'cd', O: V.D, A: V.C, B: V.B, r: 0.07 });
      }
      if (s >= 4) { lines.push({ id: 'pc', from: V.P, to: V.C, color: 'no', width: 3 }); arcs.push({ id: 'th', O: V.D, A: V.P, B: V.C, r: 0.16 }); }
      if (s >= 5) lines.push(...normalLines(V, n1, n2, 0.5 * p.a));
      return {
        P: V, solid: { faces: FACES },
        planes: [{ id: 'abc', pts: ['A', 'B', 'C'], color: 'c' }, { id: 'pab', pts: ['P', 'A', 'B'], color: 'b' }],
        lines, arcs, dots: s >= 2 ? [V.D] : [],
        anchors: { ab: G.lerp(V.D, V.B, 0.6), pd: G.lerp(V.P, V.D, 0.5), cd: G.lerp(V.C, V.D, 0.5), th: V.D, pc: G.lerp(V.P, V.C, 0.5) },
        V, n1, n2,
      };
    },
    read(p, { V, n1, n2 }) {
      const pd = G.dist(V.P, V.D), cd = G.dist(V.C, V.D), pc = G.dist(V.P, V.C);
      const cos = (pd * pd + cd * cd - pc * pc) / (2 * pd * cd);              // 几何法：余弦定理
      const cosN = -G.dot(n1, n2) / (G.len(n1) * G.len(n2));                // 法向量法（两个外法向量）
      return [
        ['\\(PD=CD=\\dfrac{\\sqrt3}{2}a\\)', pd.toFixed(4), 'pd', pd],
        ['\\(PC=a\\)', pc.toFixed(4), 'pc', pc],
        ['\\(\\cos\\angle PDC\\)（余弦定理）', cos.toFixed(4), 'cos', cos],
        ['二面角 \\(\\theta\\)（几何法）', dg(Math.acos(cos)), 'th', G.deg(Math.acos(cos))],
        ['\\(-\\dfrac{\\boldsymbol n_1\\cdot\\boldsymbol n_2}{|\\boldsymbol n_1||\\boldsymbol n_2|}\\)（外法向量）', cosN.toFixed(4), 'cosN', cosN],
        ['法向量算出的角', dg(Math.acos(cosN)), 'thN', G.deg(Math.acos(cosN))],
      ];
    },
    note: (p) => [
      '二面角 \\(P\\text{-}AB\\text{-}C\\)：棱 \\(AB\\)，两个面是 \\(PAB\\) 和 \\(CAB\\)，都是等边三角形。',
      '取棱 \\(AB\\) 的中点 \\(D\\)。',
      '等边三角形三线合一：\\(PD\\perp AB\\)，\\(CD\\perp AB\\)。所以 \\(\\angle PDC\\) 就是二面角的平面角。',
      '\\(\\triangle PDC\\) 中 \\(PD=CD=\\dfrac{\\sqrt3}{2}a\\)，\\(PC=a\\)，由余弦定理 \\(\\cos\\theta=\\dfrac{\\frac34a^2+\\frac34a^2-a^2}{2\\cdot\\frac34a^2}=\\dfrac13\\)。',
      '两个面各取<b>朝外</b>的法向量，它们的夹角是 \\(180^\\circ-\\theta\\)，所以 \\(\\cos\\theta=-\\dfrac{\\boldsymbol n_1\\cdot\\boldsymbol n_2}{|\\boldsymbol n_1||\\boldsymbol n_2|}\\)。',
    ][+p.st - 1],
    tags: ['A', 'B', 'C', 'P', 'D'],
    callouts: [
      { id: 'ab', title: '棱 AB', text: '', at: 'ab', dx: 120, dy: 60 },
      { id: 'pd', title: 'PD ⊥ AB', text: '三线合一', at: 'pd', dx: -160, dy: -30, when: at(3) },
      { id: 'cd', title: 'CD ⊥ AB', text: '三线合一', at: 'cd', dx: 130, dy: 40, when: at(3) },
      { id: 'th', title: '平面角 ∠PDC', text: 'cos θ = 1/3', at: 'th', dx: -150, dy: 70, when: at(4) },
    ],
    def: String.raw`<h3>例 3 正四面体的二面角</h3>
      <p class="def">正四面体 \(P\text{-}ABC\) 的棱长都是 \(a\)，求二面角 \(P\text{-}AB\text{-}C\) 的平面角的余弦值。</p>
      <p>取 \(AB\) 中点 \(D\)：等边三角形三线合一，\(PD\perp AB\)、\(CD\perp AB\)，\(\angle PDC\) 就是平面角。再用余弦定理：\(\cos\theta=\dfrac13\)，\(\theta\approx70.53^\circ\)。</p>
      <p class="l3-note">拖动棱长 \(a\)：长度都变，\(\cos\theta=\dfrac13\) 不变。二面角只看形状，不看大小。</p>`,
  },
  fold: {
    name: '折叠：锐角还是钝角', params: { a: 1.6, th: 60 },
    sliders: [['a', '棱长 a', 1, 2.2, 0.1], ['th', '二面角 θ（°）', 30, 150, 1]],
    buttons: [{ label: '▶ 折到 60°', primary: true, to: () => ({ th: 60 }) }, { label: '▶ 折到 120°', to: () => ({ th: 120 }) }],
    scene(p) {
      const V = tetra(p.a, RAD(p.th));
      const [n1, n2] = outward(V);
      return {
        P: V, solid: { faces: FACES },
        planes: [{ id: 'abc', pts: ['A', 'B', 'C'], color: 'c' }, { id: 'pab', pts: ['P', 'A', 'B'], color: 'b' }],
        lines: [{ id: 'pd', from: V.P, to: V.D, color: 'b', width: 3.4 }, { id: 'cd', from: V.C, to: V.D, color: 'c', width: 3.4 }, ...normalLines(V, n1, n2, 0.5 * p.a)],
        arcs: [{ id: 'th', O: V.D, A: V.P, B: V.C, r: 0.16 }],
        dots: [V.D],
        anchors: { th: V.D, n1: G.add(G.lerp(V.D, V.C, 0.45), G.mul(G.unit(n1), 0.5 * p.a)), n2: G.add(G.lerp(V.D, V.P, 0.45), G.mul(G.unit(n2), 0.5 * p.a)) },
        V, n1, n2,
      };
    },
    read(p, { V, n1, n2 }) {
      const th = planeAngle(V);
      const c = G.dot(n1, n2) / (G.len(n1) * G.len(n2));
      const nn = Math.acos(Math.max(-1, Math.min(1, c)));
      const kind = Math.abs(Math.cos(th)) < 1e-9 ? '直角' : th < Math.PI / 2 ? '锐角' : '钝角';
      return [
        ['二面角 \\(\\theta=\\angle PDC\\)', dg(th), 'th', G.deg(th)],
        ['\\(\\cos\\theta\\)', Math.cos(th).toFixed(4), 'cos', Math.cos(th)],
        ['二面角是', `<span>${kind}</span>`, 'kind', kind],
        ['两个外法向量的夹角', dg(nn), 'nn', G.deg(nn)],
        ['\\(\\dfrac{|\\boldsymbol n_1\\cdot\\boldsymbol n_2|}{|\\boldsymbol n_1||\\boldsymbol n_2|}\\)', Math.abs(c).toFixed(4), 'cabs', Math.abs(c)],
        ['两个平面所成的角', dg(Math.acos(Math.abs(c))), 'pp', G.deg(Math.acos(Math.abs(c)))],
      ];
    },
    note: (p) => { const t = Math.round(p.th); return t === 90 ? '\\(\\theta=90^\\circ\\)：两个面互相垂直，外法向量也互相垂直。'
      : `外法向量夹角 \\(=180^\\circ-\\theta\\)。取绝对值的公式只给出 \\(${Math.min(t, 180 - t)}^\\circ\\)：\\(\\theta=${t}^\\circ\\) 与 \\(\\theta=${180 - t}^\\circ\\) 算出的是同一个数，二面角是${t < 90 ? '锐' : '钝'}角要看图。`; },
    tags: ['A', 'B', 'C', 'P', 'D'],
    callouts: [
      { id: 'th', title: '二面角 θ', text: '可以是钝角', at: 'th', dx: -150, dy: 70 },
      { id: 'n1', title: '外法向量 n₁', text: '底面 ABC', at: 'n1', dx: 130, dy: 60 },
      { id: 'n2', title: '外法向量 n₂', text: '面 PAB', at: 'n2', dx: 130, dy: -60 },
    ],
    def: String.raw`<h3>二面角取锐角还是钝角</h3>
      <p class="def">二面角的范围是 \(0^\circ\le\theta\le180^\circ\)，可以是钝角；两个平面所成的角范围是 \(0^\circ\le\varphi\le90^\circ\)。</p>
      <p>两个面都取<b>朝外</b>（或都取朝里）的法向量，它们的夹角是 \(180^\circ-\theta\)；一个朝外一个朝里，夹角就是 \(\theta\)。公式 \(\cos\varphi=\dfrac{|\boldsymbol n_1\cdot\boldsymbol n_2|}{|\boldsymbol n_1||\boldsymbol n_2|}\) 给出的是余弦；取了绝对值，所以 \(\varphi=\arccos\dfrac{|\boldsymbol n_1\cdot\boldsymbol n_2|}{|\boldsymbol n_1||\boldsymbol n_2|}=\min(\theta,\,180^\circ-\theta)\)，是两个平面所成的角。</p>
      <p class="l3-note">把 \(\theta\) 拖过 \(90^\circ\)：\(\cos\theta\) 由正变负，但取绝对值的读数不变号。考题问「二面角」时，要看图判断是锐角还是钝角。</p>`,
  },
};

makeLab({
  page: 'b2-8-6-x3', modes,
  aria: '可拖动旋转的正四面体 P-ABC，分步作出二面角 P-AB-C 的平面角，并把侧面折成锐角、直角、钝角',
  quizItems: (show) => [
    {
      q: '正四面体中，二面角 \\(P\\text{-}AB\\text{-}C\\) 的平面角是哪个角？',
      opts: ['\\(\\angle PDC\\)（\\(D\\) 是 \\(AB\\) 中点）', '\\(\\angle PAC\\)', '\\(\\angle PCD\\)'], answer: 0,
      why: '\\(PD\\)、\\(CD\\) 都垂直于棱 \\(AB\\)（三线合一），分别在两个面里。\\(\\angle PAC=60^\\circ\\) 是面 \\(PAC\\) 的内角，与二面角无关。',
      show: show('reg', { st: '3' }), showLabel: '看第 ③ 步',
    },
    {
      q: '正四面体的二面角 \\(\\theta\\) 满足？',
      opts: ['\\(\\cos\\theta=\\dfrac13\\)', '\\(\\cos\\theta=\\dfrac12\\)', '\\(\\cos\\theta=\\dfrac{\\sqrt3}{3}\\)'], answer: 0,
      why: '\\(PD=CD=\\dfrac{\\sqrt3}{2}a\\)，\\(PC=a\\)，余弦定理得 \\(\\cos\\theta=\\dfrac{\\frac32a^2-a^2}{\\frac32a^2}=\\dfrac13\\)。',
      show: show('reg', { st: '4' }), showLabel: '看第 ④ 步',
    },
    {
      q: '两个面都取朝外的法向量，夹角是 \\(60^\\circ\\)。二面角是多少？',
      opts: ['\\(120^\\circ\\)', '\\(60^\\circ\\)', '\\(30^\\circ\\)'], answer: 0,
      why: '两个外法向量的夹角是 \\(180^\\circ-\\theta\\)，所以 \\(\\theta=180^\\circ-60^\\circ=120^\\circ\\)。',
      show: show('fold', { th: 120 }), showLabel: '折到 120° 看',
    },
    {
      q: '二面角 \\(60^\\circ\\) 和 \\(120^\\circ\\) 时，\\(\\dfrac{|\\boldsymbol n_1\\cdot\\boldsymbol n_2|}{|\\boldsymbol n_1||\\boldsymbol n_2|}\\) 的值？',
      opts: ['相等', '互为相反数', '一个是另一个的 2 倍'], answer: 0,
      why: '都是 \\(\\dfrac12\\)。取了绝对值，分不出锐角和钝角，只能得到两平面所成的角 \\(60^\\circ\\)。',
      show: show('fold', { th: 60 }), showLabel: '折到 60° 看',
    },
  ],
});
