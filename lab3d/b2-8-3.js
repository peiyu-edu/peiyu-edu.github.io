// 8.3 简单几何体的表面积与体积 · 3D 舞台页（PY-331 试点）
// 面积、体积、展开图的尺寸全部由当前参数按公式算出。
import { createStage, tabs, slider, quiz, renderMath, courseStrip, readout as fillReadout, expose, THREE, noteShow, DUR } from './stage.js';
import { buildPrismUnfold, buildPyramidUnfold, buildCylinderUnfold, buildConeUnfold, buildSphere, colors, geo } from './solids.js';

const $ = (s) => document.querySelector(s);
const fmt1 = (x) => x.toFixed(1);
const num = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : (+x.toFixed(2)).toString());
const pi = (c) => (Math.abs(c) < 1e-9 ? '0' : `${num(c) === '1' ? '' : num(c)}\\pi \\approx ${(c * Math.PI).toFixed(2)}`);

const S = createStage($('#stage'), { onHot: (id) => applyHot(id), ariaLabel: '可拖动旋转、可展开的几何体' });
tabs($('#info'));
courseStrip($('#course'), 'b2-8-3');

let anchors = {};
let parts = {};
let flatNow = false;
const A = (k) => () => anchors[k];
const folded = () => !flatNow && cur().params.e < 0.05;
const flat = () => flatNow;

const SHAPES = {
  prism: {
    name: '正棱柱', params: { n: 6, a: 0.9, h: 1.8, e: 0 },
    build: (p) => buildPrismUnfold(S, p),
    sliders: [['n', '底面边数', 3, 8, 1], ['a', '底面边长', 0.5, 1.4, 0.1], ['h', '高', 0.8, 2.4, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '侧面', text: 'n 个全等的矩形', at: A('side'), dx: 140, dy: -50, when: folded },
      { id: 'flatSide', part: 'side', title: '侧面展开图：一个大矩形', text: '长 = 底面周长 na，宽 = 高 h', at: A('side'), dx: 120, dy: -80, when: flat },
    ],
    formula: String.raw`<h3>正棱柱</h3>
      <p>侧面展开是一个矩形：长是底面周长 \(na\)，宽是高 \(h\)。</p>
      <p class="def">\(S_{\text{侧}}=nah\)<br>\(S_{\text{表}}=S_{\text{侧}}+2S_{\text{底}}\)<br>\(V=S_{\text{底}}\,h\)</p>
      <p class="l3-note">正 \(n\) 边形面积 \(S_{\text{底}}=\dfrac{na^2}{4\tan\frac{\pi}{n}}\)（\(n=4\) 时就是 \(a^2\)）。</p>`,
    read: (p) => {
      const Sb = (p.n * p.a * p.a) / (4 * Math.tan(Math.PI / p.n));
      const Sl = p.n * p.a * p.h;
      return [['底面积', `${Sb.toFixed(2)}`, 'Sb', Sb], ['侧面积 \\(nah\\)', `${num(p.n)}\\times${num(p.a)}\\times${num(p.h)}=${Sl.toFixed(2)}`, 'Sl', Sl],
        ['表面积', (Sl + 2 * Sb).toFixed(2), 'St', Sl + 2 * Sb], ['体积 \\(S_{\\text{底}}h\\)', (Sb * p.h).toFixed(2), 'V', Sb * p.h]];
    },
  },
  pyramid: {
    name: '正棱锥', params: { n: 4, a: 1.6, h: 1.6, e: 0 },
    build: (p) => buildPyramidUnfold(S, p),
    sliders: [['n', '底面边数', 3, 8, 1], ['a', '底面边长', 0.8, 2, 0.1], ['h', '高', 0.8, 2.4, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '侧面', text: 'n 个全等的等腰三角形', at: A('side'), dx: 140, dy: -50, when: folded },
      { id: 'base', part: 'base', title: '底面', text: '正 n 边形', at: A('bottom'), dx: -150, dy: 60 },
      { id: 'slant', title: '斜高 h′', text: '侧面三角形底边上的高', at: A('slant'), dx: 120, dy: 60 },
      { id: 'flatSide', part: 'side', title: '展开图', text: '底面周围摊开 n 个等腰三角形，像一朵花', at: A('side'), dx: 120, dy: -80, when: flat },
    ],
    formula: String.raw`<h3>正棱锥</h3>
      <p>每个侧面都是底边为 \(a\)、高为斜高 \(h'\) 的等腰三角形。</p>
      <p class="def">\(h'=\sqrt{h^2+r_{\text{内}}^2}\)（\(r_{\text{内}}\) 是底面中心到边的距离）<br>\(S_{\text{侧}}=\tfrac12\,na\,h'\)<br>\(V=\tfrac13 S_{\text{底}}\,h\)</p>`,
    read: (p) => {
      const ap = geo.apo(p.n, p.a);
      const Sb = (p.n * p.a * ap) / 2;
      const hs = Math.hypot(p.h, ap);
      const Sl = (p.n * p.a * hs) / 2;
      return [['斜高 \\(h\'\\)', hs.toFixed(2), 'hs', hs], ['底面积', Sb.toFixed(2), 'Sb', Sb], ['侧面积 \\(\\tfrac12nah\'\\)', Sl.toFixed(2), 'Sl', Sl],
        ['表面积', (Sl + Sb).toFixed(2), 'St', Sl + Sb], ['体积 \\(\\tfrac13S_{\\text{底}}h\\)', ((Sb * p.h) / 3).toFixed(2), 'V', (Sb * p.h) / 3]];
    },
  },
  cyl: {
    name: '圆柱', params: { R: 1, h: 2, e: 0 },
    build: (p) => buildCylinderUnfold(S, p),
    sliders: [['R', '底面半径', 0.5, 1.4, 0.1], ['h', '高', 0.8, 2.6, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '侧面', text: '沿一条母线剪开', at: A('side'), dx: 140, dy: -50, when: folded },
      { id: 'base', part: 'base', title: '底面', text: '两个等圆', at: A('top'), dx: -150, dy: -40 },
      { id: 'flatSide', part: 'side', title: '侧面展开图：矩形', text: '长 = 底面周长 2πr，宽 = 高 h', at: A('side'), dx: 120, dy: -90, when: flat },
    ],
    formula: String.raw`<h3>圆柱</h3>
      <p>侧面沿母线剪开铺平，是长为 \(2\pi r\)、宽为 \(h\) 的矩形。</p>
      <p class="def">\(S_{\text{侧}}=2\pi r h\)<br>\(S_{\text{表}}=2\pi r^2+2\pi r h=2\pi r(r+h)\)<br>\(V=\pi r^2 h\)</p>`,
    read: (p) => [['展开矩形', `${num(2 * p.R)}\\pi \\times ${num(p.h)}`], ['侧面积 \\(2\\pi rh\\)', pi(2 * p.R * p.h), 'Sl', 2 * Math.PI * p.R * p.h],
      ['表面积', pi(2 * p.R * (p.R + p.h)), 'St', 2 * Math.PI * p.R * (p.R + p.h)], ['体积 \\(\\pi r^2h\\)', pi(p.R * p.R * p.h), 'V', Math.PI * p.R * p.R * p.h]],
  },
  cone: {
    name: '圆锥', params: { R: 1.2, r: 0, h: 1.8, e: 0 },
    build: (p) => buildConeUnfold(S, p),
    sliders: [['R', '底面半径', 0.5, 1.6, 0.1], ['h', '高', 0.8, 2.6, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '侧面', text: '沿一条母线剪开', at: A('side'), dx: 140, dy: -50, when: folded },
      { id: 'base', part: 'base', title: '底面', text: '半径为 r 的圆', at: A('bottom'), dx: -150, dy: 60 },
      { id: 'flatSide', part: 'side', title: '侧面展开图：扇形', text: '半径 = 母线长 l', at: A('gen'), dx: -150, dy: -60, when: flat },
      { id: 'arc', title: '扇形的弧', text: '弧长 = 底面周长 2πr', at: A('arc'), dx: 120, dy: 40, when: flat },
    ],
    formula: String.raw`<h3>圆锥</h3>
      <p>侧面展开是扇形：半径是母线长 \(l\)，弧长是底面周长 \(2\pi r\)。</p>
      <p class="def">\(l=\sqrt{r^2+h^2}\)<br>圆心角 \(\theta=\dfrac{2\pi r}{l}=\dfrac{r}{l}\cdot 360^\circ\)<br>\(S_{\text{侧}}=\tfrac12\cdot 2\pi r\cdot l=\pi r l\)<br>\(V=\tfrac13\pi r^2 h\)</p>`,
    read: (p) => {
      const l = Math.hypot(p.R, p.h);
      return [['母线长 \\(l\\)', l.toFixed(2), 'l', l], ['扇形圆心角', `${((360 * p.R) / l).toFixed(1)}^\\circ`, 'theta', (360 * p.R) / l], ['侧面积 \\(\\pi rl\\)', pi(p.R * l), 'Sl', Math.PI * p.R * l],
        ['表面积', pi(p.R * (p.R + l)), 'St', Math.PI * p.R * (p.R + l)], ['体积 \\(\\tfrac13\\pi r^2h\\)', pi((p.R * p.R * p.h) / 3), 'V', (Math.PI * p.R * p.R * p.h) / 3]];
    },
  },
  frustum: {
    name: '圆台', params: { R: 1.4, r: 0.7, h: 1.4, e: 0 },
    build: (p) => buildConeUnfold(S, p),
    sliders: [['R', '下底半径', 0.9, 2, 0.1], ['r', '上底半径', 0.3, 1.2, 0.1], ['h', '高', 0.6, 2.2, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '侧面', text: '沿一条母线剪开', at: A('side'), dx: 140, dy: -50, when: folded },
      { id: 'base', part: 'base', title: '两个底面', text: '半径 r 和 R 的圆', at: A('bottom'), dx: -150, dy: 60 },
      { id: 'flatSide', part: 'side', title: '侧面展开图：扇环', text: '大扇形挖去小扇形，宽 = 母线长 l', at: A('gen'), dx: -150, dy: -60, when: flat },
      { id: 'arc', title: '外弧', text: '长 = 下底周长 2πR', at: A('arc'), dx: 120, dy: 40, when: flat },
    ],
    formula: String.raw`<h3>圆台</h3>
      <p>侧面展开是扇环：两条弧长分别是 \(2\pi r\) 和 \(2\pi R\)，宽是母线长 \(l\)。</p>
      <p class="def">\(l=\sqrt{(R-r)^2+h^2}\)<br>\(S_{\text{侧}}=\pi(r+R)\,l\)<br>\(V=\tfrac13\pi h\,(r^2+rR+R^2)\)</p>
      <p class="l3-note">\(r=R\) 时变成圆柱，\(r=0\) 时变成圆锥，三个公式都能对上。</p>`,
    read: (p) => {
      const l = Math.hypot(p.R - p.r, p.h);
      const St = p.r * p.r + p.R * p.R + (p.r + p.R) * l, Vc = (p.h * (p.r * p.r + p.r * p.R + p.R * p.R)) / 3;
      return [['母线长 \\(l\\)', l.toFixed(2), 'l', l], ['侧面积 \\(\\pi(r+R)l\\)', pi((p.r + p.R) * l), 'Sl', Math.PI * (p.r + p.R) * l],
        ['表面积', pi(St), 'St', Math.PI * St], ['体积', pi(Vc), 'V', Math.PI * Vc]];
    },
  },
  sphere: {
    name: '球', params: { R: 1.2, e: 0, spin: 1 }, noUnfold: true,
    build: (p) => buildSphere(S, p),
    sliders: [['R', '半径', 0.5, 1.6, 0.1]],
    callouts: [
      { id: 'side', part: 'side', title: '球面', text: '不能展开成平面图形', at: A('surf'), dx: 130, dy: -50 },
      { id: 'radius', title: '半径 R', at: A('radius'), dx: -150, dy: 70 },
    ],
    formula: String.raw`<h3>球</h3>
      <p>球面是弯的，<b>不能</b>像圆柱、圆锥那样剪开铺平，所以它的面积公式要用别的办法推（课本用的是"分割—求近似和"）。</p>
      <p class="def">\(S=4\pi R^2\)<br>\(V=\tfrac43\pi R^3\)</p>
      <p class="l3-note">半径变成原来的 2 倍，表面积变成 4 倍，体积变成 8 倍。拉一下滑块验证。</p>`,
    read: (p) => [['表面积 \\(4\\pi R^2\\)', pi(4 * p.R * p.R), 'St', 4 * Math.PI * p.R * p.R], ['体积 \\(\\tfrac43\\pi R^3\\)', pi((4 * p.R ** 3) / 3), 'V', (4 * Math.PI * p.R ** 3) / 3]],
  },
};
const ORDER = [['prism', 'pyramid'], ['cyl', 'cone', 'frustum', 'sphere']];
let curKey = new URLSearchParams(location.hash.slice(1)).get('s') || 'cone';
if (!SHAPES[curKey]) curKey = 'cone';
const cur = () => SHAPES[curKey];

// ---------- 渲染 ----------
function rebuild() {
  S.clear();
  const m = cur().build(cur().params);
  S.root.add(m.group);
  anchors = m.anchors;
  parts = m.parts || {};
  flatNow = !!m.flat;
  S.shadow.visible = cur().params.e < 0.05;
  applyHot(S.hot);
}
function readout() {
  fillReadout($('#ro'), cur().read(cur().params));
  $('#ro-note').textContent = '';
}
function applyHot(id) {
  const C = colors(S);
  const co = cur().callouts.find((c) => c.id === id);
  S.root.traverse((o) => {
    if (!o.material?.isMeshToonMaterial) return;
    const base = o.name === 'base' ? C.base : o.name === 'side' ? C.side : null;
    if (!base) return;
    o.material.color.copy(co?.part === o.name ? C.hot : base);
  });
}

// 展开 / 合上
let busy = false;
async function toggleUnfold(btn) {
  if (busy) return;
  busy = true;
  const p = cur().params;
  const from = p.e, to = p.e > 0.5 ? 0 : 1;
  // 取景：合起来和展开后的范围都要装得下
  const g = new THREE.Group();
  g.add(cur().build({ ...p, e: 0 }).group, cur().build({ ...p, e: 1 }).group);
  S.frameObject(g, true, 0.85);
  S.dispose(g);   // 临时模型只用来取景（PY-347）
  if (!to) S.orbitTo(28, DUR.view);
  if (!(await S.tween(DUR.build, (t) => { p.e = from + (to - from) * t; rebuild(); }, undefined, () => { p.e = to; }))) return;   // 中途被打断
  p.e = to;
  rebuild();
  if (to) {
    const upright = curKey === 'cyl' || curKey === 'prism'; // 展开图竖着立 → 正面看；平铺 → 俯视
    S.frameObject(S.root, true, 0.9);
    if (!(await (upright ? S.orbitTo(14, DUR.view, 0) : S.orbitTo(64, DUR.view)))) return;
  }
  else S.frameObject(S.root, true, 1.0);
  btn.textContent = to ? '↺ 合上' : '✂ 剪开、展开';
  busy = false;
}

function mountControls() {
  const host = $('#ctl');
  host.innerHTML = '';
  const sh = cur();
  for (const [key, label, min, max, step] of sh.sliders) {
    slider(host, { key, label, min, max, step, value: sh.params[key], fmt: step >= 1 ? (x) => x : fmt1 }, (k, v) => {
      sh.params[k] = v;
      if (curKey === 'frustum' && sh.params.r > sh.params.R - 0.2) sh.params.r = +(sh.params.R - 0.2).toFixed(1);
      rebuild();
      readout();
    });
  }
  const row = host.appendChild(Object.assign(document.createElement('div'), { className: 'l3-row' }));
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'l3-btn primary';
  if (sh.noUnfold) { b.textContent = '✂ 球面不能展开'; b.disabled = true; } else {
    b.textContent = sh.params.e > 0.5 ? '↺ 合上' : '✂ 剪开、展开';
    b.addEventListener('click', () => toggleUnfold(b));
  }
  row.appendChild(b);
}

function select(key, keepParams) {
  S.cancelTweens();
  busy = false;
  curKey = key;
  history.replaceState(null, '', `#s=${key}`);
  for (const c of document.querySelectorAll('#chips button')) c.classList.toggle('on', c.dataset.k === key);
  const sh = cur();
  if (!keepParams) sh.params.e = 0;
  $('#pane-def').innerHTML = sh.formula;
  renderMath($('#pane-def'));
  mountControls();
  S.setCallouts(sh.callouts);
  rebuild();
  readout();
  S.frameObject(S.root, false, 1.0);
}

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

const setAndShow = (key, vals) => () => { S.cancelTweens(); Object.assign(SHAPES[key].params, vals, { e: 0 }); noteShow(key, { ...vals, e: 0 }); select(key, true); };
quiz($('#pane-quiz'), [
  {
    q: '圆锥的底面半径是 3，母线长是 5，它的侧面展开图扇形的圆心角是多少度？',
    opts: ['108°', '216°', '270°'], answer: 1,
    why: '弧长 = 底面周长，所以 \\(\\theta=\\frac{r}{l}\\cdot360^\\circ=\\frac35\\cdot360^\\circ=216^\\circ\\)。模型里取 \\(r=1.5,\\ h=2\\)，母线也是 2.5，比例一样。',
    show: setAndShow('cone', { R: 1.5, h: 2 }), showLabel: '在模型上展开看',
  },
  {
    q: '圆柱的底面半径为 1，高为 2，它的表面积是？',
    opts: ['\\(4\\pi\\)', '\\(5\\pi\\)', '\\(6\\pi\\)'], answer: 2,
    why: '\\(S_{\\text{表}}=2\\pi r(r+h)=2\\pi\\cdot1\\cdot3=6\\pi\\)。只算 \\(2\\pi rh=4\\pi\\) 是忘了两个底面。',
    show: setAndShow('cyl', { R: 1, h: 2 }), showLabel: '看看这个圆柱',
  },
  {
    q: '圆台上、下底面半径分别是 1 和 2，高为 \\(\\sqrt3\\)，它的侧面积是？',
    opts: ['\\(3\\pi\\)', '\\(6\\pi\\)', '\\(3\\sqrt3\\,\\pi\\)'], answer: 1,
    why: '先求母线 \\(l=\\sqrt{(2-1)^2+3}=2\\)，再用 \\(S_{\\text{侧}}=\\pi(r+R)l=\\pi\\cdot3\\cdot2=6\\pi\\)。用高代替母线就会错成 \\(3\\sqrt3\\pi\\)。',
    show: setAndShow('frustum', { R: 2, r: 1, h: Math.sqrt(3) }), showLabel: '在模型上看',
  },
  {
    q: '球的半径扩大为原来的 2 倍，体积变为原来的几倍？',
    opts: ['2 倍', '4 倍', '8 倍'], answer: 2,
    why: '\\(V=\\frac43\\pi R^3\\)，半径乘 2，体积乘 \\(2^3=8\\)。表面积只乘 \\(2^2=4\\)。',
  },
]);
renderMath($('#pane-quiz'));

select(curKey);
expose({ page: 'b2-8-3', modes: Object.keys(SHAPES), select: (k) => select(k), key: () => curKey, params: () => cur().params, stage: S });
