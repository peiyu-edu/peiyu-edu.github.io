// 8.6 空间直线、平面的垂直 · 3D 舞台页（PY-337）
// 四个实验都放在长方体 ABCD-A1B1C1D1 里：线面垂直的判定、线面角、二面角 C1-BD-C、面面垂直。
// 长度、正切、角度全部由 geom3.js 按当前坐标现算；直角处自动画小方块。
import { makeLab, relRow, dg, snap } from './rlab.js';
import * as G from './geom3.js';

const DIMS = [['a', '长 AB', 1, 2.2, 0.1], ['b', '宽 AD', 1, 2.2, 0.1], ['c', '高 AA₁', 0.8, 2, 0.1]];
const square = { label: '▶ 底面变正方形', primary: true, to: (p) => { const s = snap((p.a + p.b) / 2); return { a: s, b: s }; } };

// 线面角的三组：斜线 PX（X 是斜足），F 是 P 在平面上的射影
const SLANT = {
  'A1C-ABCD': { label: 'A₁C 与平面 ABCD', P: 'A1', X: 'C', F: 'A', plane: ['A', 'B', 'C', 'D'] },
  'BC1-ABB1A1': { label: 'BC₁ 与平面 ABB₁A₁', P: 'C1', X: 'B', F: 'B1', plane: ['A', 'B', 'B1', 'A1'] },
  'A1C-BCC1B1': { label: 'A₁C 与平面 BCC₁B₁', P: 'A1', X: 'C', F: 'B1', plane: ['B', 'C', 'C1', 'B1'] },
};

const modes = {
  lp: {
    name: '线面垂直', params: { a: 1.8, b: 1.3, c: 1.4 },
    sliders: DIMS, buttons: [square],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const O = G.lerp(V.A, V.C, 0.5), O1 = G.lerp(V.A1, V.C1, 0.5);
      return {
        P: { ...V, O }, solid: { faces: F },
        planes: [{ id: 'pl', pts: ['A', 'C', 'C1', 'A1'], color: 'b' }],
        lines: [{ id: 'bd', from: V.B, to: V.D, color: 'c' }, { id: 'ac', from: V.A, to: V.C, color: 'a', width: 3 }, { id: 'aa', from: O, to: O1, color: 'a', width: 3, dashed: true }],
        arcs: [{ id: 'ac', O, A: V.B, B: V.C, acute: true }, { id: 'aa', O, A: V.D, B: O1, r: 0.12 }],
        dots: [O],
        anchors: { bd: G.lerp(V.B, V.D, 0.25), ac: G.lerp(V.A, V.C, 0.25), aa: G.lerp(O, O1, 0.7), pl: G.lerp(V.A1, V.C1, 0.3) },
        V, n: G.normal(V.A, V.C, V.C1),
      };
    },
    read(p, sc) {
      const { V } = sc, bd = G.sub(V.D, V.B);
      const g1 = G.lineAngle(bd, G.sub(V.A1, V.A)), g2 = G.lineAngle(bd, G.sub(V.C, V.A)), phi = G.linePlaneAngle(bd, sc.n);
      return [
        ['\\(BD\\) 与 \\(AA_1\\) 所成的角', dg(g1), 'g1', G.deg(g1)],
        ['\\(BD\\) 与 \\(AC\\) 所成的角', dg(g2), 'g2', G.deg(g2)],
        ['\\(BD\\) 与平面 \\(ACC_1A_1\\) 所成的角', dg(phi), 'phi', G.deg(phi)],
      ];
    },
    note: (p) => (Math.abs(p.a - p.b) < 1e-9 ? '底面是正方形：\\(BD\\perp AC\\)，又 \\(BD\\perp AA_1\\)，\\(AC\\)、\\(AA_1\\) 相交，所以 \\(BD\\perp\\) 平面 \\(ACC_1A_1\\)。'
      : '\\(BD\\) 只垂直于平面里的一族平行线（与 \\(AA_1\\) 平行的线），不够：还缺一条与它们<b>相交</b>的直线。'),
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'O'],
    callouts: [
      { id: 'bd', title: '直线 BD', text: '', at: 'bd', dx: 120, dy: 60 },
      { id: 'aa', title: 'AA₁ 平移到 OO₁', text: 'BD ⊥ AA₁ 始终成立', at: 'aa', dx: 130, dy: -60 },
      { id: 'ac', title: 'AC', text: '底面是正方形时才 ⊥ BD', at: 'ac', dx: -150, dy: 50 },
    ],
    def: String.raw`<h3>直线与平面垂直的判定</h3>
      <p class="def">如果一条直线与一个平面内的<b>两条相交直线</b>都垂直，那么该直线与此平面垂直。<br>\(m,n\subset\alpha,\ m\cap n=P,\ l\perp m,\ l\perp n\Rightarrow l\perp\alpha\)</p>
      <p>长方体中 \(AA_1\perp\) 底面，所以 \(BD\perp AA_1\)。只有 \(BD\perp AC\)（底面是正方形，对角线互相垂直）时，\(BD\) 才垂直于平面 \(ACC_1A_1\)。</p>
      <p class="l3-note">\(\cos\angle(BD,AC)=\dfrac{|b^2-a^2|}{a^2+b^2}\)，\(a=b\) 时为 0。</p>`,
  },
  ang: {
    name: '线面角', params: { a: 1.8, b: 1.4, c: 1.2, s: 'A1C-ABCD' },
    selects: [{ key: 's', label: '斜线与平面', options: Object.entries(SLANT).map(([k, v]) => [k, v.label]) }],
    sliders: DIMS,
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const d = SLANT[p.s];
      const Pt = V[d.P], n = G.normal(V[d.plane[0]], V[d.plane[1]], V[d.plane[2]]);
      const r = G.linePlane(Pt, G.sub(V[d.X], Pt), V[d.plane[0]], n);
      const Ft = G.footOnPlane(Pt, V[d.plane[0]], n);
      return {
        P: V, solid: { faces: F },
        planes: [{ id: 'pl', pts: d.plane, color: 'b' }],
        lines: [{ id: 'sl', from: Pt, to: r.X, color: 'c' }, { id: 'pr', from: r.X, to: Ft, color: 'no', width: 3 }, { id: 'pf', from: Pt, to: Ft, color: 'a', width: 3 }],
        arcs: [{ id: 'phi', O: r.X, A: Pt, B: Ft, r: 0.18 }, { id: 'pf', O: Ft, A: Pt, B: r.X, r: 0.1 }],
        anchors: { sl: G.lerp(Pt, r.X, 0.45), pr: G.lerp(r.X, Ft, 0.5), pf: G.lerp(Pt, Ft, 0.5), phi: r.X },
        r, d, Pt, X: r.X, Ft,
      };
    },
    read(p, sc) {
      const phi = sc.r.angle;
      const PF = G.dist(sc.Pt, sc.Ft), PX = G.dist(sc.Pt, sc.X), FX = G.dist(sc.Ft, sc.X);
      return [
        ['垂线段长', PF.toFixed(4), 'pf', PF],
        ['斜线段长', PX.toFixed(4), 'px', PX],
        ['射影长', FX.toFixed(4), 'fx', FX],
        ['\\(\\sin\\varphi\\)', Math.sin(phi).toFixed(4), 'sin', Math.sin(phi)],
        ['所成的角 \\(\\varphi\\)', dg(phi), 'phi', G.deg(phi)],
      ];
    },
    note: (p, sc) => `垂足是 \\(${sc.d.F.replace(/(\d)/, '_$1')}\\)，斜足是 \\(${sc.d.X.replace(/(\d)/, '_$1')}\\)。\\(\\sin\\varphi=\\dfrac{\\text{垂线段}}{\\text{斜线段}}\\)。`,
    callouts: [
      { id: 'sl', title: '斜线', text: '与平面相交但不垂直', at: 'sl', dx: -160, dy: -40 },
      { id: 'pf', title: '垂线', text: '从斜线上一点向平面作垂线', at: 'pf', dx: -150, dy: 60 },
      { id: 'pr', title: '射影', text: '连接垂足和斜足', at: 'pr', dx: 130, dy: 60 },
      { id: 'phi', title: '线面角 φ', text: '斜线与射影的夹角', at: 'phi', dx: 130, dy: -60 },
    ],
    def: String.raw`<h3>直线与平面所成的角</h3>
      <p class="def">平面的一条斜线和它在平面上的<b>射影</b>所成的角，叫做这条直线和这个平面所成的角。<br>范围：\(0^\circ\le\varphi\le90^\circ\)（直线在平面内或平行时为 \(0^\circ\)，垂直时为 \(90^\circ\)）。</p>
      <p>三步：<b>找垂足</b>（从斜线上一点向平面作垂线）→ <b>连射影</b>（垂足连斜足）→ <b>解直角三角形</b>。</p>
      <p class="l3-note">例如 \(A_1C\) 与底面：垂足 \(A\)、斜足 \(C\)，\(\tan\varphi=\dfrac{c}{\sqrt{a^2+b^2}}\)。</p>`,
  },
  dih: {
    name: '二面角', params: { a: 1.6, b: 1.6, c: 1.4 },
    sliders: DIMS,
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const O = G.footOnLine(V.C, V.B, G.sub(V.D, V.B));
      return {
        P: { ...V, O }, solid: { faces: F },
        planes: [{ id: 'p1', pts: ['B', 'C', 'D'], color: 'c' }, { id: 'p2', pts: ['B', 'C1', 'D'], color: 'b' }],
        lines: [{ id: 'co', from: V.C, to: O, color: 'a', width: 3 }, { id: 'c1o', from: V.C1, to: O, color: 'no', width: 3 }],
        arcs: [{ id: 'th', O, A: V.C, B: V.C1, r: 0.16 }, { id: 'co', O, A: V.C, B: V.D, r: 0.09 }, { id: 'c1o', O, A: V.C1, B: V.B, r: 0.09 }],
        dots: [O],
        anchors: { co: G.lerp(V.C, O, 0.5), c1o: G.lerp(V.C1, O, 0.5), th: O, p2: G.lerp(V.B, V.C1, 0.5) },
        V, O,
      };
    },
    read(p, sc) {
      const { V, O } = sc;
      const co = G.dist(V.C, O), c1o = G.dist(V.C1, O);
      const th = Math.acos(G.dot(G.sub(V.C, O), G.sub(V.C1, O)) / (co * c1o));
      return [
        ['\\(CO\\)（\\(C\\) 到 \\(BD\\) 的距离）', co.toFixed(4), 'co', co],
        ['\\(C_1O\\)', c1o.toFixed(4), 'c1o', c1o],
        ['\\(\\tan\\angle C_1OC=\\dfrac{CC_1}{CO}\\)', Math.tan(th).toFixed(4), 'tan', Math.tan(th)],
        ['二面角 \\(C_1\\text{-}BD\\text{-}C\\)', dg(th), 'th', G.deg(th)],
      ];
    },
    note: () => '\\(BD\\perp CO\\)，\\(BD\\perp CC_1\\)，所以 \\(BD\\perp\\) 平面 \\(C_1CO\\)，于是 \\(BD\\perp C_1O\\)：\\(\\angle C_1OC\\) 就是二面角的平面角。',
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'O'],
    callouts: [
      { id: 'co', title: 'CO ⊥ BD', text: '在底面内作', at: 'co', dx: 130, dy: 60 },
      { id: 'c1o', title: 'C₁O ⊥ BD', text: '在平面 C₁BD 内', at: 'c1o', dx: 130, dy: -60 },
      { id: 'th', title: '平面角 ∠C₁OC', text: '二面角 C₁-BD-C 的大小', at: 'th', dx: -160, dy: 40 },
    ],
    def: String.raw`<h3>二面角的平面角</h3>
      <p class="def">在二面角的棱上任取一点 \(O\)，在两个半平面内分别作<b>垂直于棱</b>的射线 \(OA\)、\(OB\)，\(\angle AOB\) 叫做二面角的平面角。范围 \(0^\circ\le\theta\le180^\circ\)。</p>
      <p>二面角 \(C_1\text{-}BD\text{-}C\)：在底面作 \(CO\perp BD\) 于 \(O\)，连 \(C_1O\)。因为 \(BD\perp\) 平面 \(C_1CO\)，所以 \(C_1O\perp BD\)，\(\angle C_1OC\) 就是平面角。</p>
      <p class="l3-note">\(CO=\dfrac{ab}{\sqrt{a^2+b^2}}\)（直角三角形斜边上的高），\(\tan\theta=\dfrac{c}{CO}=\dfrac{c\sqrt{a^2+b^2}}{ab}\)。</p>`,
  },
  pp: {
    name: '面面垂直', params: { a: 1.8, b: 1.3, c: 1.4 },
    sliders: DIMS, buttons: [square],
    scene(p) {
      const { V, F } = G.cuboid(p.a, p.b, p.c);
      const O = G.lerp(V.A, V.C, 0.5);
      const n1 = G.normal(V.A1, V.B, V.D), n2 = G.normal(V.A, V.C, V.C1);
      return {
        P: { ...V, O }, solid: { faces: F },
        planes: [{ id: 'p1', pts: ['A1', 'B', 'D'], color: 'b' }, { id: 'p2', pts: ['A', 'C', 'C1', 'A1'], color: 'c' }],
        lines: [{ id: 'cut', from: V.A1, to: O, color: 'no' }, { id: 'bd', from: V.B, to: V.D, color: 'a', width: 3.4 }],
        arcs: [{ id: 'bd', O, A: V.D, B: V.C, acute: true, r: 0.12 }],
        dots: [O],
        anchors: { cut: G.lerp(V.A1, O, 0.4), bd: G.lerp(V.B, V.D, 0.2), p2: G.lerp(V.C, V.C1, 0.5) },
        r: G.planePlane(V.A1, n1, V.A, n2), V, n2,
      };
    },
    read(p, sc) {
      const phi = G.linePlaneAngle(G.sub(sc.V.D, sc.V.B), sc.n2);
      return [
        relRow('两平面', sc.r.rel),
        ['两平面的夹角', dg(sc.r.angle), 'th', G.deg(sc.r.angle)],
        ['\\(BD\\) 与平面 \\(ACC_1A_1\\) 所成的角', dg(phi), 'phi', G.deg(phi)],
      ];
    },
    note: (p) => (Math.abs(p.a - p.b) < 1e-9 ? '\\(BD\\perp\\) 平面 \\(ACC_1A_1\\)，而 \\(BD\\subset\\) 平面 \\(A_1BD\\)，所以平面 \\(A_1BD\\perp\\) 平面 \\(ACC_1A_1\\)。'
      : '底面不是正方形时 \\(BD\\) 不垂直于平面 \\(ACC_1A_1\\)，两平面也不垂直。'),
    tags: ['A', 'B', 'C', 'D', 'A1', 'B1', 'C1', 'D1', 'O'],
    callouts: [
      { id: 'bd', title: 'BD', text: '平面 A₁BD 里的一条线', at: 'bd', dx: 120, dy: 60 },
      { id: 'cut', title: '交线 A₁O', text: '', at: 'cut', dx: -150, dy: -50 },
      { id: 'p2', title: '平面 ACC₁A₁', text: '', at: 'p2', dx: 120, dy: -60 },
    ],
    def: String.raw`<h3>平面与平面垂直的判定</h3>
      <p class="def">如果一个平面过另一个平面的<b>垂线</b>，那么这两个平面垂直。<br>\(l\perp\beta,\ l\subset\alpha\Rightarrow\alpha\perp\beta\)</p>
      <p>平面 \(A_1BD\) 过直线 \(BD\)。底面是正方形时 \(BD\perp\) 平面 \(ACC_1A_1\)（上一个实验），所以平面 \(A_1BD\perp\) 平面 \(ACC_1A_1\)。</p>
      <p><b>性质定理</b>：两个平面垂直，一个平面内垂直于交线的直线与另一个平面垂直。</p>`,
  },
};

makeLab({
  page: 'b2-8-6', modes,
  aria: '可拖动旋转的长方体，演示线面垂直、线面角、二面角和面面垂直',
  quizItems: (show) => [
    {
      q: '直线 \\(l\\) 垂直于平面 \\(\\alpha\\) 内的两条直线，那么 \\(l\\perp\\alpha\\) 吗？',
      opts: ['一定', '不一定'], answer: 1,
      why: '这两条直线必须<b>相交</b>。长方体中 \\(BD\\) 垂直于平面 \\(ACC_1A_1\\) 内的 \\(AA_1\\) 和 \\(CC_1\\)（两条平行线），但底面不是正方形时 \\(BD\\) 并不垂直于这个平面。',
      show: show('lp', { a: 1.8, b: 1.3 }), showLabel: '在模型上看',
    },
    {
      q: '长方体 \\(ABCD\\text{-}A_1B_1C_1D_1\\) 中，\\(BD\\perp\\) 平面 \\(ACC_1A_1\\) 成立的条件是？',
      opts: ['任何长方体都成立', '底面是正方形', '侧面是正方形'], answer: 1,
      why: '\\(BD\\perp AA_1\\) 总成立，还需要 \\(BD\\perp AC\\)，即底面对角线互相垂直，底面是正方形。',
      show: show('lp', { a: 1.6, b: 1.6 }), showLabel: '看正方形底面',
    },
    {
      q: '正方体中，\\(A_1C\\) 与底面 \\(ABCD\\) 所成角的正切值是？',
      opts: ['\\(\\dfrac{\\sqrt2}{2}\\)', '\\(\\dfrac{\\sqrt3}{3}\\)', '\\(1\\)'], answer: 0,
      why: '垂足 \\(A\\)、斜足 \\(C\\)，射影是 \\(AC=\\sqrt2\\,a\\)，垂线段 \\(AA_1=a\\)，\\(\\tan\\varphi=\\dfrac{a}{\\sqrt2a}=\\dfrac{\\sqrt2}{2}\\)。',
      show: show('ang', { a: 1.6, b: 1.6, c: 1.6, s: 'A1C-ABCD' }), showLabel: '在正方体里看',
    },
    {
      q: '正方体中，二面角 \\(C_1\\text{-}BD\\text{-}C\\) 的正切值是？',
      opts: ['\\(\\sqrt2\\)', '\\(1\\)', '\\(\\dfrac{\\sqrt2}{2}\\)'], answer: 0,
      why: '\\(CO=\\dfrac{\\sqrt2}{2}a\\)，\\(CC_1=a\\)，\\(\\tan\\angle C_1OC=\\dfrac{a}{\\frac{\\sqrt2}{2}a}=\\sqrt2\\)。',
      show: show('dih', { a: 1.6, b: 1.6, c: 1.6 }), showLabel: '在正方体里看',
    },
  ],
});
