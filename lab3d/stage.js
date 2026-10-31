// 培玉 · 3D 舞台引擎（PY-331 试点）
// 卡通着色 + 墨线描边；被挡住的棱自动画成虚线（直观图画法）；部件用引线标注卡；
// 正交相机，可拖拽旋转、滚轮缩放。所有几何由调用方按公式生成，这里只管画。
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { LineSegments2 } from './vendor/LineSegments2.js';
import { LineSegmentsGeometry } from './vendor/LineSegmentsGeometry.js';
import { LineMaterial } from './vendor/LineMaterial.js';

export { THREE };

const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion = () => motionQuery.matches;

/** 动画时长统一分 5 档（毫秒）。开着「减少动态」时 tween 一律直接跳到终点。 */
export const DUR = {
  quick: 400,   // 工具条转 45°
  view: 800,    // 抬高/放低视线、转到某个方位
  move: 1600,   // 点、线、截面移动到新位置
  build: 2400,  // 旋转生成、展开、直观图画法
  tour: 4000,   // 动点沿曲线走一圈
};

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function palette() {
  return {
    bg: cssVar('--bg', '#F7F4EE'), card: cssVar('--card', '#fff'), fg: cssVar('--fg', '#1A2822'),
    muted: cssVar('--muted', '#5E6B64'), line: cssVar('--line', '#E2DCD0'),
    a: cssVar('--a', '#2F7A56'), b: cssVar('--b', '#966524'), c: cssVar('--c', '#3E5C76'),
    hl: cssVar('--hl', '#D9A441'), hlSoft: cssVar('--hl-soft', '#F6E7C4'), no: cssVar('--no', '#B5452F'),
    dark: document.documentElement.dataset.theme === 'dark' ||
      (document.documentElement.dataset.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches),
  };
}

// 三阶色调的卡通渐变
function toonRamp() {
  const data = new Uint8Array([105, 105, 105, 255, 185, 185, 185, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

// 背面外扩的描边（只给曲面用；多面体靠棱线）
function outlineMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uWidth: { value: 0.02 } },
    vertexShader: `uniform float uWidth;
      void main(){ vec3 p = position + normal * uWidth; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
    fragmentShader: `uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor,1.0); }`,
    side: THREE.BackSide,
  });
}

export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  lin: (t) => t,
};

const ICON = {
  left: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/>',
  right: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/>',
  minus: '<path d="M6 12h12"/>',
  plus: '<path d="M6 12h12M12 6v12"/>',
  reset: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  label: '<path d="M4 6h10l6 6-6 6H4z"/><circle cx="8.5" cy="12" r="1.3"/>',
  dash: '<path d="M3 12h3M9 12h3M15 12h3M21 12h0"/><path d="M4 18l8-12 8 12"/>',
};

export function createStage(el, opts = {}) {
  const pal = palette();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);
  // 读屏：舞台是一个能用键盘操作的「应用」区，说明文字写键盘操作，再接上标注图例
  const cv = renderer.domElement;
  const uid = `l3-${Math.random().toString(36).slice(2, 8)}`;
  cv.tabIndex = 0;
  cv.setAttribute('role', 'application');
  cv.setAttribute('aria-roledescription', '3D 舞台');
  cv.setAttribute('aria-label', opts.ariaLabel || '可拖动旋转的立体图形');
  const desc = document.createElement('p');
  desc.className = 'l3-sr';
  desc.id = `${uid}-desc`;
  desc.textContent = '键盘操作：左右方向键转动视角，上下方向键抬高或放低视线，加号、减号放大缩小，Home 键复位。';
  el.appendChild(desc);
  const live = document.createElement('p');
  live.className = 'l3-sr';
  live.setAttribute('aria-live', 'polite');
  el.appendChild(live);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('l3-leaders');
  el.appendChild(svg);
  const coLayer = document.createElement('div');
  coLayer.className = 'l3-callouts';
  el.appendChild(coLayer);
  const tagLayer = document.createElement('div');
  tagLayer.className = 'l3-tags';
  el.appendChild(tagLayer);
  // 手机上标注卡收成编号圆点，说明文字排在舞台下方的图例里
  const legend = document.createElement('ol');
  legend.className = 'l3-legend';
  legend.setAttribute('aria-label', '标注');
  legend.id = `${uid}-legend`;
  el.after(legend);
  cv.setAttribute('aria-describedby', `${desc.id} ${legend.id}`);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  // 拖动后的惯性滑行也算动态：开着「减少动态」就关掉，运行中改设置也跟着变
  controls.enableDamping = !reduceMotion();
  motionQuery.addEventListener?.('change', () => { controls.enableDamping = !reduceMotion(); });
  controls.dampingFactor = 0.09;
  controls.minZoom = 0.45;
  controls.maxZoom = 3.2;
  controls.maxPolarAngle = Math.PI * 0.53;
  controls.screenSpacePanning = true;
  controls.keys = { LEFT: 'KeyA', UP: 'KeyW', RIGHT: 'KeyD', BOTTOM: 'KeyS' };
  controls.listenToKeyEvents(renderer.domElement);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x999999, 1.25);
  const sun = new THREE.DirectionalLight(0xffffff, 2.0);
  sun.position.set(3, 7, 9);
  scene.add(hemi, sun);

  const root = new THREE.Group();
  scene.add(root);

  // 落地的柔和影子
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, 'rgba(0,0,0,0.22)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.002;
  shadow.renderOrder = -1;
  scene.add(shadow);

  const ramp = toonRamp();
  const lineMats = new Set();
  const outlineMats = new Set();
  let hiddenOn = true;
  let labelsOn = true;
  let frameHooks = [];

  // ---------- 材质与几何辅助 ----------
  function toon(color, extra = {}) {
    return new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: ramp,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...extra });
  }

  // 一组线段：看得见的部分画实线，被挡住的部分画虚线
  function ink(color = pal.fg, { width = 2.4, hidden = true, dashed = false } = {}) {
    const g = new THREE.Group();
    const geoV = new LineSegmentsGeometry();
    const matV = new LineMaterial({ color: new THREE.Color(color).getHex(), linewidth: width,
      dashed, dashSize: 0.09, gapSize: 0.07, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
    const vis = new LineSegments2(geoV, matV);
    matV.resolution.set(el.clientWidth || 1, el.clientHeight || 1);
    lineMats.add(matV);
    g.add(vis);
    let hid = null;
    if (hidden) {
      const geoH = new LineSegmentsGeometry();
      const matH = new LineMaterial({ color: new THREE.Color(color).getHex(), linewidth: width * 0.62,
        dashed: true, dashSize: 0.08, gapSize: 0.07, depthFunc: THREE.GreaterDepth, depthWrite: false,
        transparent: true, opacity: 0.75, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8 });
      hid = new LineSegments2(geoH, matH);
      hid.renderOrder = 5;
      hid.userData.isHidden = true;
      hid.visible = hiddenOn;
      matH.resolution.set(el.clientWidth || 1, el.clientHeight || 1);
      lineMats.add(matH);
      g.add(hid);
    }
    g.userData.set = (segs) => {
      // segs: [[Vector3, Vector3], ...]
      const arr = new Float32Array(Math.max(segs.length, 1) * 6);
      segs.forEach(([a, b], i) => { arr.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); });
      for (const l of [vis, hid]) {
        if (!l) continue;
        l.geometry.dispose();
        l.geometry = new LineSegmentsGeometry();
        l.geometry.setPositions(arr);
        l.computeLineDistances();
        l.visible = segs.length > 0 && (l === vis || hiddenOn);
      }
    };
    g.userData.setColor = (c) => { matV.color.set(c); if (hid) hid.material.color.set(c); };
    return g;
  }

  function outline(mesh, color = pal.fg) {
    const m = outlineMaterial(color);
    outlineMats.add(m);
    const o = new THREE.Mesh(mesh.geometry, m);
    o.userData.isOutline = true;
    mesh.add(o);
    return o;
  }

  // ---------- 相机 ----------
  let fit = { center: new THREE.Vector3(), radius: 2 };
  const az0 = THREE.MathUtils.degToRad(opts.azimuth ?? 38);
  const el0 = THREE.MathUtils.degToRad(opts.elevation ?? 28);

  function frame(center, radius, keepView = false) {
    fit = { center: center.clone(), radius };
    if (!keepView) {
      const d = new THREE.Vector3(Math.sin(az0) * Math.cos(el0), Math.sin(el0), Math.cos(az0) * Math.cos(el0));
      camera.position.copy(center).addScaledVector(d, 20);
      controls.target.copy(center);
      camera.zoom = 1;
    } else {
      const off = camera.position.clone().sub(controls.target);
      controls.target.copy(center);
      camera.position.copy(center).add(off);
    }
    resize();
    controls.update();
  }

  function frameObject(obj, keepView = false, pad = 1.0) {
    const box = new THREE.Box3().setFromObject(obj, true);
    if (box.isEmpty()) return;
    const s = box.getBoundingSphere(new THREE.Sphere());
    frame(s.center, s.radius * pad, keepView);
    shadow.scale.set(s.radius * 2.6, s.radius * 2.6, 1);
    shadow.position.x = s.center.x;
    shadow.position.z = s.center.z;
  }

  function resize() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const aspect = w / h;
    // 竖屏时按宽度放，横屏按高度放；宽屏右侧留一点给标注卡，手机上标注是小圆点，边距可以小一些
    const r = fit.radius * (w < 640 ? 1.3 : 1.45);
    const halfH = aspect >= 1 ? r : r / aspect;
    camera.left = -halfH * aspect; camera.right = halfH * aspect;
    camera.top = halfH; camera.bottom = -halfH;
    camera.updateProjectionMatrix();
    for (const m of lineMats) m.resolution.set(w, h);
    el.classList.toggle('compact', w < 640);
    for (const c of callouts) c.card.tabIndex = w < 640 ? -1 : 0;
    legend.classList.toggle('on', w < 640);
  }
  new ResizeObserver(resize).observe(el);

  // ---------- 标注卡 ----------
  let callouts = [];
  const compactNow = () => (el.clientWidth || 1) < 640;
  // 两种高亮分开记：hotId 是「按下」的那张（点击、Enter、空格切换，aria-pressed 只跟它走）；
  // peekId 是鼠标悬停的临时预览。显示时预览优先，移开就回到按下的那张。获得焦点只给焦点框，不改按下状态。
  let hotId = null, peekId = null, painted = null;
  function setCallouts(list) {
    // 换模式时标注卡整组重建：上一组的按下 / 悬停状态一并清掉，并通知页面熄掉模型上的高亮（PY-366 复审 P2）
    hotId = null;
    peekId = null;
    coLayer.innerHTML = '';
    svg.innerHTML = '';
    legend.innerHTML = '';
    callouts = list.map((c, i) => {
      const card = document.createElement('div');
      card.className = 'l3-co';
      card.innerHTML = `<i class="n">${i + 1}</i><b>${c.title}</b>${c.text ? `<span>${c.text}</span>` : ''}`;
      // 键盘：标注卡是开关按钮，Tab 到只给焦点框，Enter / 空格切换高亮，离开焦点高亮保留；
      // 手机上标注卡收成圆点，改由下方图例的按钮接键盘
      card.setAttribute('role', 'button');
      card.tabIndex = compactNow() ? -1 : 0;
      card.setAttribute('aria-pressed', 'false');
      card.addEventListener('mouseenter', () => peekHot(c.id));
      card.addEventListener('mouseleave', () => peekHot(null));
      card.addEventListener('click', () => setHot(hotId === c.id ? null : c.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHot(hotId === c.id ? null : c.id); }
      });
      coLayer.appendChild(card);
      const li = document.createElement('li');
      li.innerHTML = `<button type="button"><i class="n">${i + 1}</i><b>${c.title}</b>${c.text ? `<span>${c.text}</span>` : ''}</button>`;
      li.firstChild.setAttribute('aria-pressed', 'false');
      li.firstChild.addEventListener('click', () => setHot(hotId === c.id ? null : c.id));
      legend.appendChild(li);
      card.li = li;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '5');
      svg.append(path, dot);
      return { ...c, card, path, dot };
    });
    paintHot();
  }
  function paintHot() {
    const id = peekId ?? hotId;
    for (const c of callouts) {
      c.card.classList.toggle('hot', c.id === id);
      c.card.li.classList.toggle('hot', c.id === id);
      c.card.setAttribute('aria-pressed', String(c.id === hotId));
      c.card.li.firstChild.setAttribute('aria-pressed', String(c.id === hotId));
      c.dot.classList.toggle('hot', c.id === id);
    }
    painted = id;
    opts.onHot?.(id);
  }
  /** 按下 / 松开某个标注（null = 全部松开） */
  function setHot(id) { hotId = id; paintHot(); }
  /** 悬停预览（null = 结束预览，回到按下的那张） */
  function peekHot(id) { peekId = id; paintHot(); }
  const v = new THREE.Vector3();
  function placeCallouts() {
    const w = el.clientWidth, h = el.clientHeight;
    const compact = w < 640;
    // 芯片条和工具条也当成障碍物，标注卡不压它们
    const er = el.getBoundingClientRect();
    const rel = (n) => { const r = n.getBoundingClientRect(); return { x: r.left - er.left, y: r.top - er.top, w: r.width, h: r.height }; };
    const chipEls = [...el.querySelectorAll('.l3-chips button')];
    const top = chipEls.length ? Math.max(...chipEls.map((b) => rel(b).y + rel(b).h)) + 8 : 12;
    const placed = [rel(tools), ...(hint.offsetParent ? [rel(hint)] : [])];
    for (const c of callouts) {
      const show = labelsOn && (c.when ? c.when() : true);
      c.card.classList.toggle('hidden', !show);
      c.card.li.classList.toggle('hidden', !show);
      c.card.tabIndex = show && !compact ? 0 : -1;
      if (!show) { c.path.setAttribute('d', ''); c.dot.setAttribute('r', '0'); continue; }
      const p = typeof c.at === 'function' ? c.at() : c.at;
      v.copy(p).project(camera);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      const cw = c.card.offsetWidth, ch = c.card.offsetHeight;
      const k = compact ? 0.32 : 1;
      let dx = (c.dx ?? 120) * k, dy = (c.dy ?? -60) * k;
      let cx = x + dx - (dx < 0 ? cw : 0);
      let cy = y + dy - ch / 2;
      const lo = top, hi = h - ch - 8;
      cx = Math.max(8, Math.min(w - cw - 8, cx));
      cy = Math.max(lo, Math.min(hi, cy));
      // 避让：在原位附近找一个不压已放卡片、工具条的位置——先上下挪，再换到点的另一侧
      const free = (x, y) => !placed.some((q) => x < q.x + q.w + 6 && x + cw + 6 > q.x && y < q.y + q.h + 6 && y + ch + 6 > q.y);
      if (!free(cx, cy)) {
        const flip = Math.max(8, Math.min(w - cw - 8, dx < 0 ? x - dx : x - dx - cw));
        let best = null;
        for (const xx of [cx, flip]) {
          for (let k = 1; k <= 60 && !best; k++) {
            const yy = cy + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 10;
            if (yy >= lo && yy <= hi && free(xx, yy)) best = [xx, yy];
          }
          if (best) break;
        }
        if (best) [cx, cy] = best;
      }
      placed.push({ x: cx, y: cy, w: cw, h: ch });
      c.card.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
      const ax = cx + (x < cx ? 0 : x > cx + cw ? cw : cw / 2);
      const ay = (x >= cx && x <= cx + cw) ? (y < cy ? cy : cy + ch) : cy + ch / 2;
      const ex = ax, ey = y;
      c.path.setAttribute('d', `M${x.toFixed(1)},${y.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${ax.toFixed(1)},${ay.toFixed(1)}`);
      c.dot.setAttribute('cx', x.toFixed(1));
      c.dot.setAttribute('cy', y.toFixed(1));
      c.dot.setAttribute('r', '5');
    }
  }

  // ---------- 名字标签（点 A、平面 α 等，不带引线） ----------
  let tags = [];
  function setTags(list) {
    tagLayer.innerHTML = '';
    tags = list.map((t) => {
      const d = document.createElement('span');
      d.className = 'l3-tag' + (t.cls ? ` ${t.cls}` : '');
      d.innerHTML = t.text;
      tagLayer.appendChild(d);
      return { ...t, d };
    });
  }
  function placeTags() {
    const w = el.clientWidth, h = el.clientHeight;
    for (const t of tags) {
      const show = t.when ? t.when() : true;
      const p = show && (typeof t.at === 'function' ? t.at() : t.at);
      if (!p) { t.d.classList.add('hidden'); continue; }
      t.d.classList.remove('hidden');
      v.copy(p).project(camera);
      const x = (v.x * 0.5 + 0.5) * w + (t.dx ?? 6), y = (-v.y * 0.5 + 0.5) * h + (t.dy ?? -6);
      const tw = t.d.offsetWidth, th = t.d.offsetHeight;
      // 默认放在点的右上方；dx < 0 时放左边
      const lx = (t.dx ?? 6) < 0 ? x - tw : x;
      t.d.style.transform = `translate(${Math.max(2, Math.min(w - tw - 2, lx)).toFixed(1)}px, ${Math.max(2, Math.min(h - th - 2, y - th)).toFixed(1)}px)`;
    }
  }

  // ---------- 动画 ----------
  // 动画返回 Promise<boolean>：播完为 true；中途被 cancelTweens()（切换形体/模式、「在模型上看」）打断为 false，之后不再回调。
  // onCancel 在 cancelTweens() 里**同步**调用（例如把参数记到终点），这样调用方随后写入的新参数不会被它覆盖。
  let tweenGen = 0;
  const cancelHooks = new Set();
  function cancelTweens() {
    tweenGen++;
    const hooks = [...cancelHooks];
    cancelHooks.clear();
    for (const h of hooks) h();
  }
  function tween(ms, fn, e = ease.inOut, onCancel = null) {
    return new Promise((res) => {
      if (reduceMotion() || ms <= 0) { fn(1); res(true); return; }
      // 播到一半打开「减少动态」：直接跳到终点
      const t0 = performance.now(), gen = tweenGen;
      if (onCancel) cancelHooks.add(onCancel);
      const finish = (ok) => { if (onCancel) cancelHooks.delete(onCancel); res(ok); };
      const step = (now) => {
        if (gen !== tweenGen) { finish(false); return; }
        const t = reduceMotion() ? 1 : Math.min(1, (now - t0) / ms);
        fn(e(t));
        if (t < 1) requestAnimationFrame(step); else finish(true);
      };
      requestAnimationFrame(step);
    });
  }

  // ---------- 工具条 ----------
  const tools = document.createElement('div');
  tools.className = 'l3-tools';
  const mk = (icon, title, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.title = title; b.setAttribute('aria-label', title);
    b.innerHTML = `<svg viewBox="0 0 24 24">${ICON[icon]}</svg>`;
    b.addEventListener('click', fn);
    tools.appendChild(b);
    return b;
  };
  const sep = () => { const s = document.createElement('span'); s.className = 'sep'; tools.appendChild(s); };
  const spin = (deg) => {
    const off = camera.position.clone().sub(controls.target);
    const start = off.clone();
    return tween(DUR.quick, (t) => {
      off.copy(start).applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(deg) * t);
      camera.position.copy(controls.target).add(off);
    });
  };
  const zoomBy = (k) => {
    camera.zoom = Math.min(controls.maxZoom, Math.max(controls.minZoom, camera.zoom * k));
    camera.updateProjectionMatrix();
  };
  // 工具条的转动、缩放、复位也在 live 区域报一句视角（say 在下面键盘一节定义，点击时早已就绪）
  mk('left', '向左转 45°', () => spin(-45).then(() => say()));
  mk('right', '向右转 45°', () => spin(45).then(() => say()));
  sep();
  mk('minus', '缩小', () => { zoomBy(1 / 1.2); say(); });
  mk('plus', '放大', () => { zoomBy(1.2); say(); });
  // 复位：回到取景时的默认视角；页面若有自己的视角规则（如 8.2 随画法进度从俯视转到斜视），由 onReset 接着摆
  const reset = () => { frame(fit.center, fit.radius); opts.onReset?.(); controls.update(); };
  mk('reset', '复位视角', () => { reset(); say(); });
  sep();
  const bLabel = mk('label', '显示标注', () => { labelsOn = !labelsOn; bLabel.classList.toggle('on', labelsOn); bLabel.setAttribute('aria-pressed', String(labelsOn)); });
  bLabel.classList.add('on');
  bLabel.setAttribute('aria-pressed', 'true');
  const bDash = mk('dash', '被挡住的棱画虚线', () => {
    hiddenOn = !hiddenOn; bDash.classList.toggle('on', hiddenOn); bDash.setAttribute('aria-pressed', String(hiddenOn));
    root.traverse((o) => { if (o.userData.isHidden) o.visible = hiddenOn; });
  });
  bDash.classList.add('on');
  bDash.setAttribute('aria-pressed', 'true');
  tools.setAttribute('role', 'toolbar');
  tools.setAttribute('aria-label', '视角工具');
  el.appendChild(tools);
  const hint = document.createElement('div');
  hint.className = 'l3-hint';
  const HINT = '拖动旋转 · 右键平移 · 滚轮缩放';
  hint.textContent = HINT;
  hint.setAttribute('aria-hidden', 'true');
  el.appendChild(hint);

  // ---------- 键盘 ----------
  // 方向键一次转 15° / 抬 10°，直接到位（按住会连续转），转完用 live 区域报一句现在的视角
  const view = () => {
    const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    const az = (Math.round(THREE.MathUtils.radToDeg(sph.theta)) % 360 + 360) % 360;
    return { az, elev: Math.round(90 - THREE.MathUtils.radToDeg(sph.phi)), zoom: camera.zoom };
  };
  const say = () => { const q = view(); live.textContent = `方位 ${q.az} 度，仰角 ${q.elev} 度，放大 ${q.zoom.toFixed(1)} 倍`; };
  const step = (dAz, dElev) => {
    const off = camera.position.clone().sub(controls.target);
    const sph = new THREE.Spherical().setFromVector3(off);
    sph.theta += THREE.MathUtils.degToRad(dAz);
    // 上限 85°（再高就成了正俯视、方位转不动）；但当前已经更高（如 8.2 的俯视 89.5°）时按左右键不能把视线压下来
    const cur = Math.PI / 2 - sph.phi;
    const lo = Math.PI / 2 - controls.maxPolarAngle + 1e-3, hi = Math.max(THREE.MathUtils.degToRad(85), cur);
    const elev = dElev ? Math.min(hi, Math.max(lo, cur + THREE.MathUtils.degToRad(dElev))) : cur;
    sph.phi = Math.PI / 2 - elev;
    off.setFromSpherical(sph);
    camera.position.copy(controls.target).add(off);
    controls.update();
  };
  cv.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const act = {
      ArrowLeft: () => step(-15, 0), ArrowRight: () => step(15, 0),
      ArrowUp: () => step(0, 10), ArrowDown: () => step(0, -10),
      '+': () => zoomBy(1.2), '=': () => zoomBy(1.2), '-': () => zoomBy(1 / 1.2), _: () => zoomBy(1 / 1.2),
      Home: reset, 0: reset,
    }[e.key];
    if (!act) return;
    e.preventDefault();
    act();
    say();
  });
  cv.addEventListener('focus', () => { if (cv.matches(':focus-visible')) hint.textContent = '方向键旋转 · +/− 缩放 · Home 复位'; });
  cv.addEventListener('blur', () => { hint.textContent = HINT; });

  // 芯片（选形体/模式）各页自己用 .on 标当前项，这里统一同步成 aria-pressed 给读屏
  const syncChips = () => {
    for (const b of el.querySelectorAll('.l3-chips button')) {
      const on = String(b.classList.contains('on'));
      if (b.getAttribute('aria-pressed') !== on) b.setAttribute('aria-pressed', on);
    }
  };
  new MutationObserver(syncChips).observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  const chipBar = el.querySelector('.l3-chips');
  if (chipBar) { chipBar.setAttribute('role', 'group'); chipBar.setAttribute('aria-label', '选择图形'); }

  // ---------- 主循环 ----------
  function loop() {
    controls.update();
    const unitsPerPx = (camera.top - camera.bottom) / camera.zoom / (el.clientHeight || 1);
    for (const m of outlineMats) m.uniforms.uWidth.value = unitsPerPx * 2.2;
    for (const f of frameHooks) f();
    renderer.render(scene, camera);
    placeCallouts();
    placeTags();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // 平滑地把视线抬高/放低到指定仰角（度）
  function orbitTo(elevDeg, ms = DUR.view, azDeg = null) {
    const off = camera.position.clone().sub(controls.target);
    const sph = new THREE.Spherical().setFromVector3(off);
    const p0 = sph.phi, p1 = THREE.MathUtils.degToRad(90 - elevDeg);
    const t0 = sph.theta;
    let dt = azDeg === null ? 0 : THREE.MathUtils.degToRad(azDeg) - t0;
    dt = Math.atan2(Math.sin(dt), Math.cos(dt));
    return tween(ms, (t) => { sph.phi = p0 + (p1 - p0) * t; sph.theta = t0 + dt * t; off.setFromSpherical(sph); camera.position.copy(controls.target).add(off); });
  }

  return {
    THREE, scene, camera, controls, root, renderer, el, pal, shadow,
    toon, ink, outline, tween, cancelTweens, frame, frameObject, setCallouts, setHot, peekHot, setTags, orbitTo, legend, view,
    /** 正在显示的高亮（悬停预览优先）；pinned 是按下的那张，切换开关时用它判断 */
    get hot() { return peekId ?? hotId; },
    get pinned() { return hotId; },
    /** 最近一次交给页面 onHot 的部件（质检用：模型上实际亮着的是谁） */
    get painted() { return painted; },
    onFrame(f) { frameHooks.push(f); return () => { frameHooks = frameHooks.filter((x) => x !== f); }; },
    clear() {
      for (const c of [...root.children]) { root.remove(c); this.dispose(c); }
    },
    // 释放一个不再用的模型：材质（每次重建都新建、不跨帧共用）连同登记表、几何体一起释放；渐变贴图等纹理是共用的，不随材质释放。
    // clear() 用它，只拿来取景、从没挂进场景的临时模型也要用它（PY-347）
    dispose(obj) {
      obj.traverse((o) => {
        for (const m of [].concat(o.material || [])) { lineMats.delete(m); outlineMats.delete(m); m.dispose(); }
        if (o.geometry && !o.userData.isOutline) o.geometry.dispose();
      });
    },
    // 质检用：登记着要每帧更新的线/描边材质
    registeredMaterials: () => [...lineMats, ...outlineMats],
    trackLineMaterials(obj) { obj.traverse((o) => { if (o.material?.isLineMaterial) { lineMats.add(o.material); o.material.resolution.set(el.clientWidth, el.clientHeight); } }); },
  };
}

// ---------- 页面公共件 ----------
// 选项卡：按 WAI-ARIA tabs 模式，焦点只停在当前选项卡，左右方向键 / Home / End 切换
export function tabs(card) {
  const btns = [...card.querySelectorAll('.l3-tabs button')];
  const panes = [...card.querySelectorAll('.l3-pane')];
  const bar = card.querySelector('.l3-tabs');
  bar?.setAttribute('role', 'tablist');
  btns.forEach((b, i) => {
    const p = panes.find((x) => x.dataset.tab === b.dataset.tab);
    b.id ||= `${card.id || 'l3'}-tab-${i}`;
    b.setAttribute('role', 'tab');
    if (p) {
      p.id ||= `${card.id || 'l3'}-pane-${i}`;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', b.id);
      p.tabIndex = 0;
      b.setAttribute('aria-controls', p.id);
    }
  });
  const show = (k) => {
    btns.forEach((b) => {
      const on = b.dataset.tab === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    panes.forEach((p) => p.classList.toggle('on', p.dataset.tab === k));
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => show(b.dataset.tab));
    b.addEventListener('keydown', (e) => {
      const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: btns.length - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      const t = btns[(j + btns.length) % btns.length];
      show(t.dataset.tab);
      t.focus();
    });
  });
  show((btns.find((b) => b.classList.contains('on')) || btns[0])?.dataset.tab);
  return show;
}

export function slider(host, { key, label, min, max, step, value, fmt = (x) => x }, onChange) {
  const row = document.createElement('label');
  row.className = 'l3-ctl';
  row.innerHTML = `<span>${label}</span><input type="range" name="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><output></output>`;
  const input = row.querySelector('input');
  const out = row.querySelector('output');
  // 读屏念 aria-valuetext：跟旁边显示的读数一致（比如「45%」而不是 0.45）
  const show = (v) => { out.textContent = fmt(v); input.setAttribute('aria-valuetext', out.textContent); };
  const upd = () => { show(+input.value); onChange(key, +input.value); };
  input.addEventListener('input', upd);
  host.appendChild(row);
  show(+value);
  return { row, input, set(v) { input.value = v; show(+v); } };
}

/** 32 位字符串哈希（FNV-1a），给选项打乱当种子 */
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** 选项的显示顺序（原始下标的排列）：干扰项按种子打乱，正确项放在第 (种子 + 题号) % n 位，
 *  同一页刷新顺序不变，各题正确项的位置轮换，不会总在第一个。 */
function seeded(seed) {
  // FNV 对只差一个字的页面 id 区分不开，先过一遍 murmur3 的收尾混合
  let h = hash32(seed);
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; h >>>= 0;
  return () => { h = (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) + 0x6d2b79f5) >>> 0; return h / 4294967296; };
}
function shuffle(a, rnd) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* 一页各题正确项放在第几个：每题各自随机（前面几题推不出后面一题），
   只排除「全页都在同一个位置」这一种情况，抽到了就接着往下抽。种子是页面 id，刷新后不变。 */
export function answerSlots(page, ns) {
  const rnd = seeded(`${page}#slots`);
  // 只有一道题有得选（或都只有一个选项）时「全在同一位置」躲不开，直接抽一次返回，免得死循环
  if (ns.filter((n) => n >= 2).length < 2) return ns.map((n) => Math.floor(rnd() * n));
  for (;;) {
    const s = ns.map((n) => Math.floor(rnd() * n));
    if (s.length < 2 || s.some((x) => x !== s[0])) return s;
  }
}

/* 第 k 题的选项顺序：干扰项按「页面 id + 题号」洗，正确项插到 slot 位。判对错仍用原始下标。 */
export function optionOrder(page, k, n, answer, slot) {
  const rest = shuffle([...Array(n).keys()].filter((i) => i !== answer), seeded(`${page}#${k}`));
  rest.splice(slot, 0, answer);
  return rest;
}

export function quiz(host, items) {
  host.classList.add('l3-quiz');
  const page = document.body.dataset.sec || location.pathname;
  const slots = answerSlots(page, items.map((it) => it.opts.length));
  items.forEach((it, k) => {
    const box = document.createElement('div');
    const qid = `${String(page).replace(/[^\w-]/g, '_')}-q${k}`;
    box.innerHTML = `<p class="q" id="${qid}">${it.q}</p><div class="opts" role="group" aria-labelledby="${qid}"></div><div class="why" aria-live="polite"></div>`;
    const opts = box.querySelector('.opts');
    const why = box.querySelector('.why');
    optionOrder(page, k, it.opts.length, it.answer, slots[k]).forEach((i) => {
      const o = it.opts[i];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.innerHTML = o;
      if (i === it.answer) b.dataset.ok = '1';
      b.addEventListener('click', () => {
        opts.querySelectorAll('.opt').forEach((x) => x.classList.remove('ok', 'no'));
        b.classList.add(i === it.answer ? 'ok' : 'no');
        why.innerHTML = (i === it.answer ? '✓ 对。' : '✗ 再想想。') + it.why;
        if (it.show) {
          const s = document.createElement('button');
          s.type = 'button'; s.className = 'l3-btn show-btn'; s.textContent = it.showLabel || '在模型上看';
          s.addEventListener('click', it.show);
          why.appendChild(document.createElement('br'));
          why.appendChild(s);
        }
        why.classList.add('on');
        renderMath(why);
      });
      opts.appendChild(b);
    });
    host.appendChild(box);
  });
}

// 读数表：每行 [名称, 显示的 TeX, 键, 数值]。数值写进 data-v，供无头质检拿去和独立公式比对。
export function readout(host, rows) {
  host.innerHTML = rows.map(([k, tex, key, val]) =>
    `<dt>${k}</dt><dd${key ? ` data-k="${key}" data-v="${val}"` : ''}><b>${tex.startsWith('<') ? tex : `\\(${tex}\\)`}</b></dd>`).join('');
  renderMath(host);
}

// 无头质检的钩子：页面登记自己的状态与操作（tools/lab3d_audit.mjs 读取）
export function expose(api) { window.__lab3d = api; }
/** 「在模型上看」写入的参数，记给质检核对（不影响页面） */
export function noteShow(key, vals) { if (window.__lab3d) window.__lab3d.lastShow = { key, vals: { ...vals } }; }

export function renderMath(el) {
  const go = () => window.renderMathInElement?.(el, {
    delimiters: [{ left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }],
    throwOnError: false,
  });
  if (window.renderMathInElement) go(); else window.addEventListener('load', go, { once: true });
}

export const CHAPTER8 = [
  { id: 'b2-8-1', no: '8.1', name: '基本立体图形', lab: 'b2-8-1.html', icon: 'prism' },
  { id: 'b2-8-2', no: '8.2', name: '立体图形的直观图', lab: 'b2-8-2.html', icon: 'oblique' },
  { id: 'b2-8-3', no: '8.3', name: '表面积与体积', lab: 'b2-8-3.html', icon: 'cone' },
  { id: 'b2-8-4', no: '8.4', name: '点、直线、平面的位置关系', lab: 'b2-8-4.html', icon: 'plane' },
  { id: 'b2-8-5', no: '8.5', name: '直线、平面的平行', lab: 'b2-8-5.html', icon: 'parallel' },
  { id: 'b2-8-6', no: '8.6', name: '直线、平面的垂直', lab: 'b2-8-6.html', icon: 'perp',
    // 例题舞台（PY-377）：课时页里的例题搬上舞台，分步作图，几何法和法向量法两套读数对照
    ex: [
      { id: 'b2-8-6-x1', no: '例 1', name: '鳖臑与二面角', icon: 'perp' },
      { id: 'b2-8-6-x2', no: '例 2', name: '正方体的线面角', icon: 'prism' },
      { id: 'b2-8-6-x3', no: '例 3', name: '正四面体的二面角', icon: 'plane' },
    ] },
];
// 选必一第 1 章（PY-355）：做了 3D 舞台的节填 lab，其余链到原版课时页
export const CHAPTER_E1_1 = [
  { id: 'e1-1-1', no: '1.1', name: '空间向量及其运算', lab: 'e1-1-1.html', icon: 'vec' },
  { id: 'e1-1-2', no: '1.2', name: '空间向量基本定理', lab: 'e1-1-2.html', icon: 'basis' },
  { id: 'e1-1-3', no: '1.3', name: '空间向量运算的坐标表示', lab: 'e1-1-3.html', icon: 'axes' },
  { id: 'e1-1-4', no: '1.4', name: '空间向量的应用', lab: 'e1-1-4.html', icon: 'perp',
    // 例题舞台（PY-384）：棱长 2 的正方体，D 为原点，和课时页例题同一套坐标
    ex: [
      { id: 'e1-1-4-x1', no: '例 1–2', name: '法向量与平行垂直', icon: 'perp' },
      { id: 'e1-1-4-x2', no: '例 3', name: '点到平面的距离', icon: 'prism' },
      { id: 'e1-1-4-x3', no: '例 4', name: '三种角', icon: 'plane' },
    ] },
];
export const CHAPTER_E1_3 = [
  { id: 'e1-3-1', no: '3.1', name: '椭圆', lab: 'e1-3-1.html', icon: 'ellipse' },
  { id: 'e1-3-2', no: '3.2', name: '双曲线', lab: 'e1-3-2.html', icon: 'hyper' },
  { id: 'e1-3-3', no: '3.3', name: '抛物线', lab: 'e1-3-3.html', icon: 'parab' },
];
const CHAPTERS = [
  { prefix: 'b2-8-', title: '第 8 章 立体几何初步', list: CHAPTER8 },
  { prefix: 'e1-1-', title: '选必一 第 1 章 空间向量与立体几何', list: CHAPTER_E1_1 },
  { prefix: 'e1-3-', title: '选必一 第 3 章 圆锥曲线的方程', list: CHAPTER_E1_3 },
];
const LESSON_ICON = {
  ellipse: '<path d="M14 6L4 36h20z" fill="var(--ok-soft)"/><ellipse cx="17" cy="24" rx="8" ry="4" transform="rotate(-20 17 24)"/>',
  hyper: '<path d="M10 8c8 8 8 24 0 32M38 8c-8 8-8 24 0 32"/><path d="M8 8l32 32M40 8L8 40" stroke-dasharray="2 2"/>',
  parab: '<path d="M8 8c4 30 28 30 32 0"/><circle cx="24" cy="16" r="1.8" fill="currentColor"/>',
  vec: '<path d="M8 32l14-20M8 32h24M8 32l26-10" /><path d="M22 12l-5 1 3 3zM32 32l-4-2v4zM34 22l-5-1 2 4z" fill="currentColor"/>',
  basis: '<path d="M10 32h22l8-10H18z" fill="var(--ok-soft)"/><path d="M14 30V8"/><path d="M14 8l-2 5h4z" fill="currentColor"/>',
  axes: '<path d="M14 32V8M14 32h26M14 32l-8 6"/><circle cx="30" cy="16" r="2" fill="currentColor"/><path d="M30 16v16M30 16H14" stroke-dasharray="2 2"/>',
  prism: '<path d="M10 14l14-6 14 6v16l-14 6-14-6z" fill="var(--ok-soft)"/><path d="M10 14l14 6 14-6M24 20v16"/>',
  oblique: '<path d="M8 30h24l8-12H16z" fill="var(--hl-soft)"/><path d="M8 30l8-12"/>',
  cone: '<ellipse cx="24" cy="32" rx="13" ry="4" fill="var(--hl-soft)"/><path d="M11 32L24 6l13 26" fill="var(--ok-soft)"/>',
  plane: '<path d="M6 28l10-10h26L32 28z" fill="var(--ok-soft)"/><path d="M24 6v28"/><circle cx="24" cy="23" r="1.6" fill="currentColor"/>',
  parallel: '<path d="M6 30l10-8h26l-10 8z" fill="var(--ok-soft)"/><path d="M12 14h22M14 20h22"/>',
  perp: '<path d="M6 30l10-8h26l-10 8z" fill="var(--ok-soft)"/><path d="M24 6v20"/><path d="M24 22h3v4"/>',
};
// 「下载 A4 讲义」入口（PY-372）。讲义由 tools/lab3d_sheet.mjs 导出到 highSchool/out/sheets/lab3d/，
// 4360 上在 /out/sheets/lab3d/（和 219 份课时讲义同一路子）。先探一下文件在不在，不在就不出按钮，免得学生点进 404。
export function sheetLink(id) {
  const top = document.querySelector('.l3-top');
  if (!top || top.querySelector('.l3-sheet')) return Promise.resolve(null);
  const href = `../out/sheets/lab3d/${id}-3d-sheet.pdf`;
  return fetch(href, { method: 'HEAD', cache: 'no-store' }).then((r) => {
    if (!r.ok || !/pdf/i.test(r.headers.get('content-type') || '')) return null;
    const a = document.createElement('a');
    a.className = 'pill l3-sheet';
    a.href = href;
    a.download = `${id}-3d-sheet.pdf`;
    a.title = '下载本页的 A4 讲义（PDF）：每个实验一张图，附练一练答案与解析';
    a.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M4.5 6.8 8 10.3l3.5-3.5M3 13.5h10"/></svg><span>下载 A4 讲义</span>';
    top.insertBefore(a, top.querySelector('a.pill'));
    return a;
  }, () => null);
}
export function courseStrip(host, current) {
  sheetLink(current);
  const ch = CHAPTERS.find((c) => current.startsWith(c.prefix)) || CHAPTERS[0];
  host.innerHTML = `<h2>${ch.title}</h2><div class="l3-strip"></div>`;
  const strip = host.querySelector('.l3-strip');
  for (const l of ch.list) {
    const a = document.createElement('a');
    a.className = 'l3-lesson' + (l.id === current || current.startsWith(l.id + '-') ? ' on' : '');
    a.href = l.lab ? `./${l.lab}` : `../lessons/${l.id}.html`;
    a.innerHTML = `<svg viewBox="0 0 48 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">${LESSON_ICON[l.icon]}</svg>
      <span>${l.no} ${l.name}<small>${l.lab ? '3D 舞台' : '原版课时页'}</small></span>`;
    strip.appendChild(a);
  }
  // 这一节有例题舞台：节页和例题页底下都列出来
  const sec = ch.list.find((l) => current === l.id || current.startsWith(l.id + '-'));
  if (sec?.ex) {
    host.insertAdjacentHTML('beforeend', `<h2>${sec.no} 例题舞台</h2><div class="l3-strip l3-ex"></div>`);
    const row = host.querySelector('.l3-ex');
    for (const e of sec.ex) {
      const a = document.createElement('a');
      a.className = 'l3-lesson' + (e.id === current ? ' on' : '');
      a.href = `./${e.id}.html`;
      a.innerHTML = `<svg viewBox="0 0 48 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">${LESSON_ICON[e.icon]}</svg>
      <span>${e.no} ${e.name}<small>例题舞台</small></span>`;
      row.appendChild(a);
    }
  }
}
