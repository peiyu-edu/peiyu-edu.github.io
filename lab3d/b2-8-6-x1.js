// 8.6 例 1 鳖臑 · 例题舞台（PY-377）
// 三棱锥 P-ABC：PA ⊥ 底面 ABC，∠ABC = 90°。A 在原点，AB 沿 x，BC 沿 y，PA 沿 z。
// 「证 BC⊥PB」分四步作图；「二面角 P-BC-A」先作平面角 ∠PBA，再用两个法向量验算。
// 所有角度都按当前坐标现算：几何法量 ∠PBA，法向量法算 |n₁·n₂|/(|n₁||n₂|)，两者由质检逐姿态比对。
import { makeLab, dg, snap } from './rlab.js';
import * as G from './geom3.js';

const DIMS = [['a', 'AB', 0.8, 2, 0.1], ['b', 'BC', 0.8, 2, 0.1], ['h', 'PA', 0.4, 2.2, 0.1]];
const pts = (p) => ({ A: [0, 0, 0], B: [p.a, 0, 0], C: [p.a, p.b, 0], P: [0, 0, p.h] });
const FACES = [['A', 'B', 'C'], ['P', 'A', 'B'], ['P', 'B', 'C'], ['P', 'A', 'C']];
/** 顶点 O 处 ∠XOY（弧度） */
const angAt = (O, X, Y) => Math.acos(Math.max(-1, Math.min(1, G.dot(G.sub(X, O), G.sub(Y, O)) / (G.dist(X, O) * G.dist(Y, O)))));
const at = (n) => (p) => +p.st >= n;

const modes = {
  prove: {
    name: '证 BC⊥PB', params: { a: 1.4, b: 1.2, h: 1.6, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 读题：PA⊥底面，AB⊥BC'], ['2', '② PA⊥BC'], ['3', '③ BC⊥平面 PAB'], ['4', '④ 结论 BC⊥PB']] }],
    sliders: DIMS,
    scene(p) {
      const V = pts(p), s = +p.st;
      const lines = [{ id: 'pa', from: V.P, to: V.A, color: 'a', width: 3.4 }, { id: 'bc', from: V.B, to: V.C, color: s >= 2 ? 'c' : undefined, width: s >= 2 ? 3.4 : 2.2 }];
      const arcs = [{ id: 'pa', O: V.A, A: V.P, B: V.B, r: 0.08 }, { id: 'abc', O: V.B, A: V.A, B: V.C, r: 0.08 }];
      if (s >= 2) arcs.push({ id: 'pac', O: V.A, A: V.P, B: V.C, r: 0.08 });
      if (s >= 4) { lines.push({ id: 'pb', from: V.P, to: V.B, color: 'no', width: 3.4 }); arcs.push({ id: 'pbc', O: V.B, A: V.P, B: V.C, r: 0.1 }); }
      return {
        P: V, solid: { faces: FACES },
        planes: s >= 3 ? [{ id: 'pab', pts: ['P', 'A', 'B'], color: 'b' }] : [],
        lines, arcs,
        anchors: { pa: G.lerp(V.P, V.A, 0.45), bc: G.lerp(V.B, V.C, 0.55), pab: G.lerp(G.lerp(V.P, V.A, 0.5), V.B, 0.35), pb: G.lerp(V.P, V.B, 0.5), pbc: V.B },
        V,
      };
    },
    read(p, { V }) {
      const right = FACES.filter((f) => [0, 1, 2].some((i) => Math.abs(angAt(V[f[i]], V[f[(i + 1) % 3]], V[f[(i + 2) % 3]]) - Math.PI / 2) < 1e-9)).length;
      const pb = G.dist(V.P, V.B);
      return [
        ['\\(\\angle PAB\\)', dg(angAt(V.A, V.P, V.B)), 'pab', G.deg(angAt(V.A, V.P, V.B))],
        ['\\(\\angle PAC\\)', dg(angAt(V.A, V.P, V.C)), 'pac', G.deg(angAt(V.A, V.P, V.C))],
        ['\\(\\angle ABC\\)', dg(angAt(V.B, V.A, V.C)), 'abc', G.deg(angAt(V.B, V.A, V.C))],
        ['\\(\\angle PBC\\)', dg(angAt(V.B, V.P, V.C)), 'pbc', G.deg(angAt(V.B, V.P, V.C))],
        ['\\(PB=\\sqrt{PA^2+AB^2}\\)', pb.toFixed(4), 'pb', pb],
        ['直角三角形的面', `<span>${right} 个</span>`, 'faces', right],
      ];
    },
    note: (p) => [
      '已知 \\(PA\\perp\\) 底面 \\(ABC\\)，\\(\\angle ABC=90^\\circ\\)。要证 \\(BC\\perp PB\\)：先证 \\(BC\\) 垂直于 \\(PB\\) 所在的平面 \\(PAB\\)。',
      '① \\(PA\\perp\\) 底面，\\(BC\\subset\\) 底面，所以 \\(PA\\perp BC\\)（线面垂直的性质）。',
      '② 又 \\(BC\\perp AB\\)，且 \\(PA\\cap AB=A\\)，所以 \\(BC\\perp\\) 平面 \\(PAB\\)（判定：垂直于面内两条<b>相交</b>直线）。',
      '③ \\(PB\\subset\\) 平面 \\(PAB\\)，所以 \\(BC\\perp PB\\)。四个面都是直角三角形，这就是「鳖臑」。',
    ][+p.st - 1],
    tags: ['A', 'B', 'C', 'P'],
    callouts: [
      { id: 'pa', title: 'PA ⊥ 底面', text: '垂直于底面里每一条线', at: 'pa', dx: -160, dy: -30 },
      { id: 'bc', title: 'BC', text: '先证它 ⊥ PA', at: 'bc', dx: 120, dy: 60, when: at(2) },
      { id: 'pab', title: '平面 PAB', text: 'BC 垂直于它', at: 'pab', dx: -160, dy: 60, when: at(3) },
      { id: 'pbc', title: '∠PBC = 90°', text: 'BC ⊥ PB', at: 'pbc', dx: 130, dy: -50, when: at(4) },
    ],
    def: String.raw`<h3>例 1 鳖臑模型</h3>
      <p class="def">三棱锥 \(P\text{-}ABC\) 中，\(PA\perp\) 底面 \(ABC\)，\(\angle ABC=90^\circ\)。求证：\(BC\perp PB\)。</p>
      <p>思路：要证线线垂直，先证线面垂直。\(BC\) 同时垂直于 \(PA\) 和 \(AB\)，这两条线相交于 \(A\)，所以 \(BC\perp\) 平面 \(PAB\)，从而垂直于面内的 \(PB\)。</p>
      <p class="l3-note">《九章算术》把四个面都是直角三角形的四面体叫「鳖臑」（biē nào）。拖动三条棱的长度，四个直角始终都在。</p>`,
  },
  dih: {
    name: '二面角 P-BC-A', params: { a: 1.4, b: 1.2, h: 1.6, st: '1' },
    selects: [{ key: 'st', label: '作图步骤', options: [['1', '① 找棱 BC 和两个半平面'], ['2', '② 底面内 AB⊥BC'], ['3', '③ 面 PBC 内 PB⊥BC'], ['4', '④ ∠PBA 是平面角'], ['5', '⑤ 用法向量验算（选必一）']] }],
    sliders: DIMS,
    buttons: [{ label: '▶ PA = AB（45°）', primary: true, to: (p) => ({ h: snap(p.a) }) }],
    scene(p) {
      const V = pts(p), s = +p.st;
      const lines = [{ id: 'bc', from: V.B, to: V.C, color: 'fg', width: 3.4 }];
      const arcs = [];
      if (s >= 2) { lines.push({ id: 'ab', from: V.B, to: V.A, color: 'a', width: 3.4 }); arcs.push({ id: 'ab', O: V.B, A: V.A, B: V.C, r: 0.08 }); }
      if (s >= 3) { lines.push({ id: 'pb', from: V.B, to: V.P, color: 'no', width: 3.4 }); arcs.push({ id: 'pb', O: V.B, A: V.P, B: V.C, r: 0.08 }); }
      if (s >= 4) arcs.push({ id: 'th', O: V.B, A: V.A, B: V.P, r: 0.2 });
      const n1 = [0, 0, 1], n2 = G.unit(G.normal(V.B, V.C, V.P));   // 底面 ABC、平面 PBC
      const L = 0.45 * Math.max(p.a, p.b);
      const M = G.lerp(V.B, V.C, 0.5);
      if (s >= 5) {
        lines.push({ id: 'n1', from: M, to: G.add(M, G.mul(n1, L)), color: 'c', arrow: true, width: 3 });
        lines.push({ id: 'n2', from: M, to: G.add(M, G.mul(n2, L)), color: 'b', arrow: true, width: 3 });
      }
      return {
        P: V, solid: { faces: FACES },
        planes: [{ id: 'abc', pts: ['A', 'B', 'C'], color: 'c' }, { id: 'pbc', pts: ['P', 'B', 'C'], color: 'b' }],
        lines, arcs,
        anchors: { bc: G.lerp(V.B, V.C, 0.6), ab: G.lerp(V.B, V.A, 0.5), pb: G.lerp(V.B, V.P, 0.55), th: V.B, n1: G.add(M, G.mul(n1, L)), n2: G.add(M, G.mul(n2, L)) },
        V, n1: G.normal(V.A, V.B, V.C), n2: G.normal(V.B, V.C, V.P),
      };
    },
    read(p, sc) {
      const { V } = sc;
      const th = angAt(V.B, V.A, V.P);                                        // 几何法：平面角 ∠PBA
      const cosN = Math.abs(G.dot(sc.n1, sc.n2)) / (G.len(sc.n1) * G.len(sc.n2));   // 法向量法
      const thN = Math.acos(Math.min(1, cosN));
      return [
        ['\\(\\tan\\angle PBA=\\dfrac{PA}{AB}\\)', Math.tan(th).toFixed(4), 'tan', Math.tan(th)],
        ['平面角 \\(\\angle PBA\\)（几何法）', dg(th), 'th', G.deg(th)],
        ['\\(\\dfrac{|\\boldsymbol n_1\\cdot\\boldsymbol n_2|}{|\\boldsymbol n_1||\\boldsymbol n_2|}\\)', cosN.toFixed(4), 'cosN', cosN],
        ['法向量算出的角', dg(thN), 'thN', G.deg(thN)],
      ];
    },
    note: (p) => [
      '二面角 \\(P\\text{-}BC\\text{-}A\\)：棱是 \\(BC\\)，两个半平面是底面 \\(ABC\\) 和平面 \\(PBC\\)。平面角要在两个半平面里各作一条<b>垂直于棱</b>的射线。',
      '底面内：\\(\\angle ABC=90^\\circ\\)，所以 \\(BA\\perp BC\\)，射线 \\(BA\\) 就是底面里的那一条。',
      '平面 \\(PBC\\) 内：上一问已证 \\(BC\\perp PB\\)，射线 \\(BP\\) 就是另一条。',
      '所以 \\(\\angle PBA\\) 就是二面角的平面角，\\(\\tan\\angle PBA=\\dfrac{PA}{AB}\\)。\\(P\\) 在底面的射影 \\(A\\) 落在半平面 \\(ABC\\) 里，二面角是锐角。',
      '底面法向量 \\(\\boldsymbol n_1=(0,0,1)\\)，平面 \\(PBC\\) 的法向量 \\(\\boldsymbol n_2\\parallel(PA,0,AB)\\)。法向量的夹角余弦等于 \\(\\cos\\angle PBA\\)：两种算法给出同一个角。',
    ][+p.st - 1],
    tags: ['A', 'B', 'C', 'P'],
    callouts: [
      { id: 'bc', title: '棱 BC', text: '', at: 'bc', dx: 130, dy: 50 },
      { id: 'ab', title: 'BA ⊥ BC', text: '在底面内', at: 'ab', dx: -60, dy: 80, when: at(2) },
      { id: 'pb', title: 'BP ⊥ BC', text: '在平面 PBC 内', at: 'pb', dx: 140, dy: -40, when: at(3) },
      { id: 'th', title: '平面角 ∠PBA', text: '', at: 'th', dx: 120, dy: 90, when: at(4) },
      { id: 'n2', title: '法向量 n₂', text: '平面 PBC', at: 'n2', dx: 130, dy: -60, when: at(5) },
    ],
    def: String.raw`<h3>延伸：二面角 \(P\text{-}BC\text{-}A\)</h3>
      <p class="def">在棱上一点，两个半平面内各作一条<b>垂直于棱</b>的射线，它们的夹角就是二面角的平面角。</p>
      <p>鳖臑里两条垂线现成：\(BA\perp BC\)（已知），\(BP\perp BC\)（例 1 刚证的）。所以 \(\angle PBA\) 就是平面角，\(\tan\angle PBA=\dfrac{PA}{AB}\)。</p>
      <p class="l3-note">法向量法：\(\cos\theta=\dfrac{|\boldsymbol n_1\cdot\boldsymbol n_2|}{|\boldsymbol n_1||\boldsymbol n_2|}\) 只给出锐角。二面角是锐角还是钝角，要看图：这里 \(P\) 的射影 \(A\) 在半平面 \(ABC\) 内，所以是锐角。</p>`,
  },
};

makeLab({
  page: 'b2-8-6-x1', modes,
  aria: '可拖动旋转的三棱锥 P-ABC（鳖臑），分步作图证明 BC 垂直于 PB，并求二面角 P-BC-A',
  quizItems: (show) => [
    {
      q: '例 1 中证 \\(BC\\perp\\) 平面 \\(PAB\\)，用到的两条面内直线是？',
      opts: ['\\(PA\\) 和 \\(AB\\)', '\\(PB\\) 和 \\(AB\\)', '\\(PA\\) 和 \\(PB\\)'], answer: 0,
      why: '\\(BC\\perp PA\\)（\\(PA\\perp\\) 底面）、\\(BC\\perp AB\\)（已知直角），\\(PA\\) 与 \\(AB\\) 交于 \\(A\\)。\\(BC\\perp PB\\) 是要证的结论，不能拿来用。',
      show: show('prove', { st: '3' }), showLabel: '看第 ③ 步',
    },
    {
      q: '鳖臑 \\(P\\text{-}ABC\\) 的四个面中，直角三角形有几个？',
      opts: ['2 个', '3 个', '4 个'], answer: 2,
      why: '\\(\\triangle PAB\\)、\\(\\triangle PAC\\)（\\(PA\\perp\\) 底面）、\\(\\triangle ABC\\)（已知）、\\(\\triangle PBC\\)（刚证的 \\(BC\\perp PB\\)）。',
      show: show('prove', { st: '4' }), showLabel: '在模型上看',
    },
    {
      q: '\\(PA=AB\\) 时，二面角 \\(P\\text{-}BC\\text{-}A\\) 是多少度？',
      opts: ['\\(30^\\circ\\)', '\\(45^\\circ\\)', '\\(60^\\circ\\)'], answer: 1,
      why: '平面角是 \\(\\angle PBA\\)，\\(\\tan\\angle PBA=\\dfrac{PA}{AB}=1\\)，所以是 \\(45^\\circ\\)。',
      show: show('dih', { a: 1.4, h: 1.4, st: '4' }), showLabel: '在模型上看',
    },
    {
      q: '用两个法向量算出 \\(\\dfrac{|\\boldsymbol n_1\\cdot\\boldsymbol n_2|}{|\\boldsymbol n_1||\\boldsymbol n_2|}=\\dfrac{\\sqrt2}{2}\\)，二面角一定是 \\(45^\\circ\\) 吗？',
      opts: ['一定', '不一定，也可能是 \\(135^\\circ\\)'], answer: 1,
      why: '取了绝对值，只能得到锐角 \\(45^\\circ\\)。二面角还可能是它的补角 \\(135^\\circ\\)，要看图判断。本题 \\(P\\) 的射影落在半平面 \\(ABC\\) 内，是锐角。',
      show: show('dih', { a: 1.4, h: 1.4, st: '5' }), showLabel: '看法向量',
    },
  ],
});
