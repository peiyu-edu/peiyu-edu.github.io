// 8.1 基本立体图形 · 3D 舞台页（PY-331 试点）
import { createStage, tabs, slider, quiz, renderMath, courseStrip, expose, noteShow, DUR } from './stage.js';
import { buildPrism, buildPyramid, buildFrustumPoly, buildRound, buildSphere, colors } from './solids.js';

const $ = (s) => document.querySelector(s);
const fmt1 = (x) => x.toFixed(1);

const S = createStage($('#stage'), { onHot: (id) => applyHot(id), ariaLabel: '可拖动旋转的基本立体图形' });
tabs($('#info'));
courseStrip($('#course'), 'b2-8-1');

let anchors = {};
let parts = {};
const A = (k) => () => anchors[k];

// ---------- 各几何体 ----------
const SHAPES = {
  prism: {
    name: '棱柱', kind: 'poly',
    params: { n: 4, a: 1.4, h: 1.8, shear: 0 },
    build: (p) => buildPrism(S, p),
    callouts: [
      { id: 'base', part: 'base', title: '底面', text: '两个互相平行的面', at: A('top'), dx: -130, dy: -70 },
      { id: 'side', part: 'side', title: '侧面', text: '其余各面，都是平行四边形', at: A('face'), dx: 120, dy: 70 },
      { id: 'edge', title: '侧棱', text: '相邻侧面的公共边，都平行且相等', at: A('edge'), dx: -150, dy: 60 },
      { id: 'vertex', title: '顶点', text: '侧面与底面的公共顶点', at: A('vertex'), dx: 120, dy: -60 },
    ],
    def: `<h3>棱柱</h3>
      <p class="def">有两个面互相平行，其余各面都是四边形，并且相邻两个四边形的公共边都互相平行，由这些面所围成的多面体叫做<b>棱柱</b>。</p>
      <ol class="l3-steps">
        <li>两个互相平行的面叫 <span class="l3-term" data-co="base">底面</span>，其余各面叫 <span class="l3-term" data-co="side">侧面</span>。</li>
        <li>相邻侧面的公共边叫 <span class="l3-term" data-co="edge">侧棱</span>；它们<b>互相平行</b>，这是棱柱和棱台的分水岭。</li>
        <li>底面是几边形就叫几棱柱。点「变成斜棱柱」：侧棱斜了，但仍互相平行，所以还是棱柱。</li>
      </ol>`,
    controls: (c) => {
      c.slider({ key: 'n', label: '底面边数', min: 3, max: 8, step: 1, value: 4 });
      c.slider({ key: 'h', label: '高', min: 0.8, max: 2.6, step: 0.1, value: 1.8, fmt: fmt1 });
      c.toggle('shear', '变成斜棱柱', 1);
    },
    readout: (p) => countPoly(2 * p.n, 3 * p.n, p.n + 2, `${p.n} 棱柱`),
  },
  pyramid: {
    name: '棱锥', kind: 'poly',
    params: { n: 4, a: 1.6, h: 1.9 },
    build: (p) => buildPyramid(S, p),
    callouts: [
      { id: 'apex', title: '顶点', text: '各侧面的公共顶点', at: A('apex'), dx: 110, dy: -40 },
      { id: 'side', part: 'side', title: '侧面', text: '有公共顶点的三角形', at: A('face'), dx: 130, dy: 60 },
      { id: 'edge', title: '侧棱', text: '相邻侧面的公共边', at: A('edge'), dx: -150, dy: -40 },
      { id: 'base', part: 'base', title: '底面', text: '一个多边形', at: A('bottom'), dx: -150, dy: 80 },
    ],
    def: `<h3>棱锥</h3>
      <p class="def">有一个面是多边形，其余各面都是有一个公共顶点的三角形，由这些面所围成的多面体叫做<b>棱锥</b>。</p>
      <ol class="l3-steps">
        <li>这个多边形面叫 <span class="l3-term" data-co="base">底面</span>，有公共顶点的各个三角形面叫 <span class="l3-term" data-co="side">侧面</span>。</li>
        <li>各侧面的公共顶点叫棱锥的 <span class="l3-term" data-co="apex">顶点</span>，相邻侧面的公共边叫 <span class="l3-term" data-co="edge">侧棱</span>。</li>
        <li>关键词是「<b>有一个公共顶点</b>」：只说「其余各面都是三角形」不够。</li>
      </ol>`,
    controls: (c) => {
      c.slider({ key: 'n', label: '底面边数', min: 3, max: 8, step: 1, value: 4 });
      c.slider({ key: 'h', label: '高', min: 0.8, max: 2.8, step: 0.1, value: 1.9, fmt: fmt1 });
    },
    readout: (p) => countPoly(p.n + 1, 2 * p.n, p.n + 1, `${p.n} 棱锥`),
  },
  frustum: {
    name: '棱台', kind: 'poly',
    params: { n: 4, a: 1.8, k: 0.5, h: 1.2, ext: false },
    build: (p) => buildFrustumPoly(S, p),
    callouts: [
      { id: 'base', part: 'base', title: '上底面 · 下底面', text: '原棱锥的截面和底面，互相平行', at: A('bottom'), dx: -150, dy: 70 },
      { id: 'side', part: 'side', title: '侧面', text: '都是梯形', at: A('face'), dx: 130, dy: 60 },
      { id: 'edge', title: '侧棱', text: '延长后交于一点', at: A('edge'), dx: -150, dy: -40 },
      { id: 'S', title: '点 S', text: '侧棱延长线的交点，就是原棱锥的顶点', at: A('apex'), dx: 120, dy: -20, when: () => cur().params.ext },
    ],
    def: `<h3>棱台</h3>
      <p class="def">用一个平行于棱锥底面的平面去截棱锥，底面与截面之间那部分多面体叫做<b>棱台</b>。</p>
      <ol class="l3-steps">
        <li>原棱锥的底面和截面分别叫 <span class="l3-term" data-co="base">下底面、上底面</span>。</li>
        <li>棱台的 <span class="l3-term" data-co="side">侧面</span> 都是梯形，<span class="l3-term" data-co="edge">侧棱</span> 延长后<b>交于一点</b>。</li>
        <li>它也满足「两个面平行、其余各面是四边形」，但侧棱不平行，所以<b>不是棱柱</b>。点「延长侧棱」看看。</li>
      </ol>`,
    controls: (c) => {
      c.slider({ key: 'n', label: '底面边数', min: 3, max: 8, step: 1, value: 4 });
      c.slider({ key: 'k', label: '上下底比', min: 0.2, max: 0.8, step: 0.05, value: 0.5, fmt: (x) => x.toFixed(2) });
      c.toggle('ext', '延长侧棱', true, false, () => S.frameObject(S.root, true, 1.0));
    },
    readout: (p) => countPoly(2 * p.n, 3 * p.n, p.n + 2, `${p.n} 棱台`),
  },
  cyl: {
    name: '圆柱', kind: 'round',
    params: { R: 1, r: 1, h: 2, spin: 1 },
    build: (p) => buildRound(S, p),
    gen: '矩形',
    callouts: [
      { id: 'axis', title: '轴', text: '旋转轴所在直线', at: A('axis'), dx: 110, dy: -30 },
      { id: 'base', part: 'base', title: '底面', text: '垂直于轴的边旋转而成的圆面', at: A('bottom'), dx: -150, dy: 70 },
      { id: 'side', part: 'side', title: '侧面', text: '平行于轴的边旋转而成的曲面', at: A('genFace'), dx: -150, dy: -60, when: () => cur().params.spin >= 0.999 },
      { id: 'gen', title: '母线', text: '平行于轴的那条边，转到哪儿都叫母线', at: A('gen'), dx: 130, dy: 50 },
    ],
    def: `<h3>圆柱</h3>
      <p class="def">以<b>矩形</b>的一边所在直线为旋转轴，其余三边旋转一周形成的面所围成的旋转体叫做<b>圆柱</b>。</p>
      <ol class="l3-steps">
        <li>旋转轴叫圆柱的 <span class="l3-term" data-co="axis">轴</span>；垂直于轴的边旋转而成的圆面叫 <span class="l3-term" data-co="base">底面</span>。</li>
        <li>平行于轴的边旋转而成的曲面叫 <span class="l3-term" data-co="side">侧面</span>；这条边无论转到什么位置，都叫侧面的 <span class="l3-term" data-co="gen">母线</span>。</li>
        <li>所以圆柱的任意两条母线<b>平行且相等</b>。</li>
      </ol>`,
    controls: roundControls({ R: [0.5, 1.6, 1], h: [0.8, 2.8, 2] }, (p) => { p.r = p.R; }),
    readout: (p) => roundRead(p, `母线长 \\(l=h\\)`),
  },
  cone: {
    name: '圆锥', kind: 'round',
    params: { R: 1.1, r: 0, h: 2, spin: 1 },
    build: (p) => buildRound(S, p),
    gen: '直角三角形',
    callouts: [
      { id: 'apex', title: '顶点', text: '母线的公共点', at: A('apex'), dx: 110, dy: -30 },
      { id: 'axis', title: '轴', text: '一条直角边所在直线', at: A('axis'), dx: -130, dy: -30 },
      { id: 'base', part: 'base', title: '底面', text: '另一条直角边旋转而成的圆面', at: A('bottom'), dx: -150, dy: 70 },
      { id: 'gen', title: '母线', text: '斜边，转到哪儿都叫母线', at: A('gen'), dx: 130, dy: 50 },
    ],
    def: `<h3>圆锥</h3>
      <p class="def">以<b>直角三角形</b>的一条直角边所在直线为旋转轴，其余两边旋转一周形成的面所围成的旋转体叫做<b>圆锥</b>。</p>
      <ol class="l3-steps">
        <li><span class="l3-term" data-co="axis">轴</span> 是一条直角边；另一条直角边转出 <span class="l3-term" data-co="base">底面</span>。</li>
        <li>斜边转出侧面，斜边就是 <span class="l3-term" data-co="gen">母线</span>，所有母线交于 <span class="l3-term" data-co="apex">顶点</span>。</li>
        <li>注意必须绕<b>直角边</b>：绕斜边转，得到的是两个圆锥底对底拼起来的组合体。</li>
      </ol>`,
    controls: roundControls({ R: [0.5, 1.6, 1.1], h: [0.8, 2.8, 2] }),
    readout: (p) => roundRead(p, `母线长 \\(l=\\sqrt{r^2+h^2}\\)`),
  },
  frustumR: {
    name: '圆台', kind: 'round',
    params: { R: 1.2, r: 0.6, h: 1.4, spin: 1 },
    build: (p) => buildRound(S, p),
    gen: '直角梯形',
    callouts: [
      { id: 'axis', title: '轴', text: '垂直于两底的腰所在直线', at: A('axis'), dx: 110, dy: -30 },
      { id: 'base', part: 'base', title: '上底面 · 下底面', text: '两个平行的圆面', at: A('bottom'), dx: -150, dy: 70 },
      { id: 'gen', title: '母线', text: '另一条腰，延长后都交于一点', at: A('gen'), dx: 130, dy: 50 },
    ],
    def: `<h3>圆台</h3>
      <p class="def">用平行于圆锥底面的平面去截圆锥，底面与截面之间的部分叫做<b>圆台</b>。</p>
      <ol class="l3-steps">
        <li>也可以看成<b>直角梯形</b>绕垂直于底边的腰所在直线（<span class="l3-term" data-co="axis">轴</span>）旋转一周而成。</li>
        <li>有上、下两个 <span class="l3-term" data-co="base">底面</span>；<span class="l3-term" data-co="gen">母线</span> 延长后交于一点（原圆锥的顶点）。</li>
      </ol>`,
    controls: roundControls({ R: [0.8, 1.6, 1.2], r: [0.2, 0.7, 0.6], h: [0.6, 2.4, 1.4] }),
    readout: (p) => roundRead(p, `母线长 \\(l=\\sqrt{(R-r)^2+h^2}\\)`),
  },
  sphere: {
    name: '球', kind: 'round',
    params: { R: 1.2, spin: 1 },
    build: (p) => buildSphere(S, p),
    gen: '半圆',
    callouts: [
      { id: 'center', title: '球心', text: '半圆的圆心', at: A('center'), dx: -140, dy: -60 },
      { id: 'radius', title: '半径', text: '连接球心和球面上任意一点的线段', at: A('radius'), dx: -150, dy: 70 },
      { id: 'side', part: 'side', title: '球面', text: '半圆弧旋转形成的曲面', at: A('surf'), dx: 120, dy: -50 },
    ],
    def: `<h3>球</h3>
      <p class="def">半圆以它的直径所在直线为旋转轴，旋转一周形成的曲面叫做<b>球面</b>，球面所围成的旋转体叫做<b>球体</b>，简称<b>球</b>。</p>
      <ol class="l3-steps">
        <li>半圆的圆心叫 <span class="l3-term" data-co="center">球心</span>，连接球心和球面上任意一点的线段叫 <span class="l3-term" data-co="radius">半径</span>。</li>
        <li><span class="l3-term" data-co="side">球面</span> 是曲面，球是实心的立体，两个词不要混。</li>
      </ol>`,
    controls: roundControls({ R: [0.6, 1.6, 1.2] }),
    readout: (p) => `<dt>半径 \\(R\\)</dt><dd data-k="R" data-v="${p.R}"><b>${p.R.toFixed(1)}</b></dd><dt>直径</dt><dd data-k="d" data-v="${2 * p.R}"><b>${(2 * p.R).toFixed(1)}</b></dd>`,
  },
};

const ORDER = [['prism', 'pyramid', 'frustum'], ['cyl', 'cone', 'frustumR', 'sphere']];
let curKey = new URLSearchParams(location.hash.slice(1)).get('s') || 'prism';
if (!SHAPES[curKey]) curKey = 'prism';
const cur = () => SHAPES[curKey];

// ---------- 读数 ----------
function countPoly(V, E, F, name) {
  $('#ro-title').textContent = '数一数';
  $('#ro-note').innerHTML = `${name}：顶点数 − 棱数 + 面数 = ${V} − ${E} + ${F} = <b>${V - E + F}</b>。换个边数再数一次，结果变不变？（欧拉公式，选学）`;
  return `<dt>顶点数 \\(V\\)</dt><dd data-k="V" data-v="${V}"><b>${V}</b></dd><dt>棱数 \\(E\\)</dt><dd data-k="E" data-v="${E}"><b>${E}</b></dd><dt>面数 \\(F\\)</dt><dd data-k="F" data-v="${F}"><b>${F}</b></dd>`;
}
function roundRead(p, lFormula) {
  $('#ro-title').textContent = '量一量';
  const l = Math.hypot(p.R - (p.r ?? 0), p.h);
  $('#ro-note').innerHTML = lFormula;
  return `${p.r > 0 && p.r !== p.R ? `<dt>上底半径 \\(r\\)</dt><dd><b>${p.r.toFixed(1)}</b></dd><dt>下底半径 \\(R\\)</dt>` : '<dt>底面半径 \\(r\\)</dt>'}<dd><b>${p.R.toFixed(1)}</b></dd>
    <dt>高 \\(h\\)</dt><dd><b>${p.h.toFixed(1)}</b></dd><dt>母线长 \\(l\\)</dt><dd data-k="l" data-v="${l}"><b>${l.toFixed(2)}</b></dd>`;
}

// ---------- 控件 ----------
function roundControls(ranges, fix) {
  return (c) => {
    const lab = { R: curKey === 'frustumR' ? '下底半径' : '半径', r: '上底半径', h: '高' };
    for (const [k, [mn, mx, v]] of Object.entries(ranges)) c.slider({ key: k, label: lab[k], min: mn, max: mx, step: 0.1, value: v, fmt: fmt1 }, fix);
    c.button(`▶ 旋转生成（${cur().gen}绕轴转一周）`, spinPlay, true);
  };
}
async function spinPlay() {
  const p = cur().params;
  p.spin = 0.001;
  rebuild();
  const full = withFull();
  S.frameObject(full, true, 1.0);
  S.dispose(full);   // 临时模型只用来取景（PY-347）
  if (!(await S.tween(DUR.build, (t) => { p.spin = Math.max(0.001, t); rebuild(); }, undefined, () => { p.spin = 1; }))) return;   // 中途被打断
  p.spin = 1;
  rebuild();
}
function withFull() {
  // 用完整的旋转体来定取景范围，避免动画中途镜头乱跳
  const tmp = cur().build({ ...cur().params, spin: 1 });
  return tmp.group;
}

function mountControls() {
  const host = $('#ctl');
  host.innerHTML = '';
  const sh = cur();
  const api = {
    // 滑块初值取这个形体当前的参数（切走再切回来时和模型一致），没有才用默认值
    slider: (spec, fix) => slider(host, { ...spec, value: sh.params[spec.key] ?? spec.value }, (k, v) => {
      sh.params[k] = v;
      fix?.(sh.params);
      if (sh.kind === 'round' && sh.params.r > sh.params.R - 0.1 && curKey === 'frustumR') sh.params.r = sh.params.R - 0.1;
      rebuild();
    }),
    toggle: (key, label, onVal, offVal = 0, after) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'l3-btn'; b.textContent = label;
      const sync = () => b.classList.toggle('on', sh.params[key] === onVal);
      b.addEventListener('click', () => { sh.params[key] = sh.params[key] === onVal ? offVal : onVal; sync(); rebuild(); after?.(); });
      sync();
      row().appendChild(b);
    },
    button: (label, fn, primary) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'l3-btn' + (primary ? ' primary' : ''); b.textContent = label;
      b.addEventListener('click', fn);
      row().appendChild(b);
    },
  };
  const row = () => host.querySelector('.l3-row') || host.appendChild(Object.assign(document.createElement('div'), { className: 'l3-row' }));
  sh.controls(api);
  if (sh.params.r !== undefined && curKey === 'cyl') sh.params.r = sh.params.R;
}

// ---------- 渲染 ----------
function rebuild() {
  S.clear();
  const m = cur().build(cur().params);
  S.root.add(m.group);
  anchors = m.anchors;
  parts = m.parts || {};
  applyHot(S.hot);
  $('#ro').innerHTML = cur().readout(cur().params);
  renderMath($('#ro'));
  renderMath($('#ro-note'));
}
function applyHot(id) {
  const C = colors(S);
  const co = cur().callouts.find((c) => c.id === id);
  for (const [name, mesh] of Object.entries(parts)) {
    if (!mesh?.material) continue;
    const base = name === 'base' ? C.base : C.side;
    mesh.material.color.copy(co?.part === name ? C.hot : base);
    mesh.traverse((o) => { if (o !== mesh && o.material?.isMeshToonMaterial) o.material.color.copy(co?.part === name ? C.hot : base); });
  }
}

function select(key) {
  S.cancelTweens();
  curKey = key;
  history.replaceState(null, '', `#s=${key}`);
  for (const b of document.querySelectorAll('#chips button')) b.classList.toggle('on', b.dataset.k === key);
  const sh = cur();
  $('#pane-def').innerHTML = sh.def;
  renderMath($('#pane-def'));
  for (const t of document.querySelectorAll('#pane-def .l3-term')) {
    t.addEventListener('mouseenter', () => S.peekHot(t.dataset.co));
    t.addEventListener('mouseleave', () => S.peekHot(null));
    t.addEventListener('click', () => S.setHot(S.pinned === t.dataset.co ? null : t.dataset.co));
  }
  mountControls();
  S.setCallouts(sh.callouts);
  rebuild();
  S.frameObject(S.root, false, 1.0);
}

// 形状选择条
const chips = $('#chips');
ORDER.forEach((grp, gi) => {
  if (gi) chips.appendChild(Object.assign(document.createElement('span'), { className: 'gap' }));
  const g = document.createElement('span');
  g.className = 'grp';
  for (const k of grp) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.k = k; b.textContent = SHAPES[k].name;
    b.addEventListener('click', () => select(k));
    g.appendChild(b);
  }
  chips.appendChild(g);
});

// 辨一辨
quiz($('#pane-quiz'), [
  {
    q: '有两个面互相平行，其余各面都是四边形的多面体，一定是棱柱吗？',
    opts: ['一定是', '不一定'], answer: 1,
    why: '还要求「相邻两个四边形的公共边都互相平行」。棱台就满足前两条，但侧棱延长后交于一点。',
    show: () => { S.cancelTweens(); SHAPES.frustum.params.ext = true; noteShow('frustum', { ext: true }); select('frustum'); }, showLabel: '看棱台的侧棱',
  },
  {
    q: '有一个面是多边形，其余各面都是三角形的多面体，一定是棱锥吗？',
    opts: ['一定是', '不一定'], answer: 1,
    why: '这些三角形必须<b>有一个公共顶点</b>。比如两个四棱锥底面对底面拼成的八面体，各面都是三角形，却没有公共顶点。',
  },
  {
    q: '把直角三角形绕它的<b>斜边</b>所在直线旋转一周，得到的是什么？',
    opts: ['一个圆锥', '两个圆锥底面对底面拼成的组合体', '一个圆台'], answer: 1,
    why: '圆锥要求绕<b>直角边</b>旋转。绕斜边转时，斜边上的高转出一个公共底面，两侧各是一个圆锥。',
  },
  {
    q: '圆柱任意两条母线的位置关系是？',
    opts: ['平行且相等', '相交', '异面'], answer: 0,
    why: '母线就是平行于轴的那条边转到的各个位置，它们都平行于轴、长度都等于高。',
    show: () => { S.cancelTweens(); noteShow('cyl', {}); select('cyl'); }, showLabel: '看圆柱的母线',
  },
]);

select(curKey);
expose({ page: 'b2-8-1', modes: Object.keys(SHAPES), select: (k) => select(k), key: () => curKey, params: () => cur().params, stage: S });
