// 培玉数学 · 立体书宣传页（PY-503）
// 一本摊开的书，四个跨页按学段排；每翻一页，右页立起一件可以拨弄的数学立体件。
// 书和翻页在这里，各跨页的内容在 spreads.js，画风在 ink.js。
import * as THREE from 'three';
import { OrbitControls } from '../lab3d/vendor/OrbitControls.js';
import {
  C, V, useRenderer, inkMaterial, lineMat, edges, setLineResolution,
  tween, runTweens, ease, wait, reduceMotion,
} from './ink.js';
import { leftPage, rightPage } from './pages.js';
import { SPREADS } from './spreads.js';

const $ = (s) => document.querySelector(s);

// ---------- 渲染器 ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  $('#fallback').hidden = false;
  $('.panel').hidden = true;
  throw e;
}
useRenderer(renderer);
const stage = $('#stage');
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 14, 26);

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = 1.25;
controls.minAzimuthAngle = -1.0;
controls.maxAzimuthAngle = 1.0;

scene.add(new THREE.AmbientLight(0xffffff, 0.42 * Math.PI));
const sun = new THREE.DirectionalLight(0xffffff, 0.72 * Math.PI);
sun.position.set(-4.5, 8, 3.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 25 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);

// ---------- 书页贴图（用到才画，缓存） ----------
const texCache = new Map();
function pageTex(i, side) {
  const key = `${i}${side}`;
  if (!texCache.has(key)) texCache.set(key, side === 'L' ? leftPage(SPREADS[i].left) : rightPage(SPREADS[i].right));
  return texCache.get(key);
}

// ---------- 书 ----------
const PW = 3.0, PD = 4.0, T = 0.2;                       // 页宽、页高、书页厚
const pageTop = (x) => T * (1 - Math.exp(-Math.abs(x) * 4.5)); // 靠书脊处下陷
const PIVOT = 0.012;
const SEG = 48;

function pageHalf(sign) {
  const g = new THREE.Group();
  const coverGeo = new THREE.BoxGeometry(PW + 0.1, 0.06, PD + 0.2);
  coverGeo.translate(sign * (PW + 0.1) / 2, -0.03, 0);
  const cover = new THREE.Mesh(coverGeo, inkMaterial({ color: C.c }));
  cover.castShadow = cover.receiveShadow = true;
  g.add(cover, edges(coverGeo, lineMat(C.ink, 1.4)));
  // 书页块：截面是一条下陷曲线，沿 z 挤出
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  for (let i = 0; i <= SEG; i++) { const x = PW * i / SEG; shape.lineTo(sign * x, pageTop(x)); }
  shape.lineTo(sign * PW, 0);
  shape.closePath();
  const blockGeo = new THREE.ExtrudeGeometry(shape, { depth: PD, bevelEnabled: false, curveSegments: 1 });
  blockGeo.translate(0, 0, -PD / 2);
  const block = new THREE.Mesh(blockGeo, inkMaterial({ color: '#F1EBDD', side: THREE.DoubleSide }));
  block.castShadow = block.receiveShadow = true;
  g.add(block, edges(blockGeo, lineMat(C.ink, 1.2), 30));
  // 印了字的页面
  const topGeo = new THREE.PlaneGeometry(PW, PD, SEG, 1);
  topGeo.rotateX(-Math.PI / 2);
  topGeo.translate(sign * PW / 2, 0, 0);
  const pos = topGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, pageTop(pos.getX(i)) + 0.002);
  topGeo.computeVertexNormals();
  const top = new THREE.Mesh(topGeo, inkMaterial({ color: '#ffffff' }));
  top.receiveShadow = true;
  g.add(top);
  return { group: g, top };
}

const book = new THREE.Group();
scene.add(book);
const left = pageHalf(-1);
book.add(left.group);
const hinge = new THREE.Group();                // 右半本绕书脊翻开
hinge.position.y = T + PIVOT;
book.add(hinge);
const right = pageHalf(1);
right.group.position.y = -(T + PIVOT);
hinge.add(right.group);

const spineGeo = new THREE.CylinderGeometry(0.09, 0.09, PD + 0.2, 24, 1, false, Math.PI / 2, Math.PI);
spineGeo.rotateX(Math.PI / 2);
spineGeo.translate(0, -0.03, 0);
book.add(new THREE.Mesh(spineGeo, inkMaterial({ color: C.c })));

const tableGeo = new THREE.PlaneGeometry(40, 40);
tableGeo.rotateX(-Math.PI / 2);
const table = new THREE.Mesh(tableGeo, inkMaterial({ color: C.table }));
table.position.y = -0.065;
table.receiveShadow = true;
scene.add(table);

// ---------- 翻页用的那一张纸 ----------
// 正面是当前右页，背面是下一张左页；绕书脊转 π，外缘稍慢一点，纸就卷起来了。
function leafGeometry(flipU) {
  const g = new THREE.PlaneGeometry(PW, PD, SEG, 4);
  g.rotateX(-Math.PI / 2);
  g.translate(PW / 2, 0, 0);
  if (flipU) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  }
  g.userData.x0 = Float32Array.from({ length: g.attributes.position.count }, (_, i) => g.attributes.position.getX(i));
  return g;
}
const leafFront = new THREE.Mesh(leafGeometry(false), inkMaterial({ color: '#ffffff', side: THREE.FrontSide }));
const leafBack = new THREE.Mesh(leafGeometry(true), inkMaterial({ color: '#ffffff', side: THREE.BackSide }));
leafFront.castShadow = leafBack.castShadow = true;
const leaf = new THREE.Group();
leaf.add(leafFront, leafBack);
leaf.visible = false;
book.add(leaf);

function bendLeaf(p) {
  for (const mesh of [leafFront, leafBack]) {
    const g = mesh.geometry, pos = g.attributes.position, x0 = g.userData.x0;
    for (let i = 0; i < pos.count; i++) {
      const x = x0[i];
      const th = Math.PI * p - 0.55 * Math.sin(Math.PI * p) * (x / PW);
      const d = pageTop(x) - T;
      pos.setX(i, x * Math.cos(th));
      pos.setY(i, T + x * Math.sin(th) + d * Math.abs(Math.cos(th)) + 0.006);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
  }
}

// ---------- 每个跨页的立体件 ----------
const POPUP_AT = V(1.6, pageTop(1.6), -0.05);
const popups = SPREADS.map((s) => {
  const g = new THREE.Group();
  g.position.copy(POPUP_AT);
  g.visible = false;
  right.group.add(g);
  s.build(g);
  return g;
});

// ---------- 面板 ----------
const tabs = $('#tabs');
tabs.innerHTML = SPREADS.map((s, i) => `<button data-i="${i}">${s.tab}</button>`).join('');
const panelApi = {
  set(kindHTML, why) { $('#kind').innerHTML = kindHTML; $('#why').textContent = why; },
  press(match) {
    for (const b of document.querySelectorAll('#controls .chips button')) b.setAttribute('aria-pressed', String(match(b.dataset.v)));
  },
};
function showPanel(i) {
  const s = SPREADS[i];
  for (const b of tabs.children) b.setAttribute('aria-current', String(Number(b.dataset.i) === i));
  $('#kicker').textContent = s.kicker;
  $('#kind').innerHTML = '&nbsp;';
  $('#why').textContent = '';
  $('#controls').innerHTML = s.controls;
  $('#legend').textContent = s.legend;
  $('#go').href = s.link.href;
  $('#go').textContent = s.link.text;
  $('#prev').disabled = i === 0;
  $('#next').disabled = i === SPREADS.length - 1;
  s.bind($('#controls'), panelApi);
}

// ---------- 流程：开书、翻页 ----------
const st = { open: 0, rise: 0, leaf: 0 };
let current = 0, busy = false;

function applyPose() {
  hinge.rotation.z = Math.PI * (1 - st.open);
  SPREADS[current].pose(st.rise);
  popups[current].visible = st.open > 0.6 && st.rise > 0.01;
}

async function enterSpread(i) {
  current = i;
  popups.forEach((g) => { g.visible = false; });
  SPREADS[i].reset();
  showPanel(i);
  st.rise = 0; applyPose();
  await tween(st, 'rise', 1, 1100, applyPose, { fn: ease.back });
  $('.panel').classList.add('on');
  await SPREADS[i].enter();
}

async function openBook(i) {
  busy = true;
  Object.assign(st, { open: 0, rise: 0 });
  current = i;
  left.top.material.map = pageTex(i, 'L');
  right.top.material.map = pageTex(i, 'R');
  left.top.material.needsUpdate = right.top.material.needsUpdate = true;
  applyPose();
  await wait(250);
  await tween(st, 'open', 1, 1500, applyPose);
  await enterSpread(i);
  busy = false;
}

async function turnTo(j) {
  if (busy || j === current || j < 0 || j >= SPREADS.length) return;
  busy = true;
  const i = current, forward = j > i;
  endDrag(true);
  setHover(false);
  history.replaceState(null, '', `#${SPREADS[j].id}`);
  await tween(st, 'rise', 0, 450, applyPose);
  popups[i].visible = false;
  // 向前翻：纸的正面是当前右页、背面是目标左页；向后翻反过来，纸从左边翻回右边
  leafFront.material.map = forward ? pageTex(i, 'R') : pageTex(j, 'R');
  leafBack.material.map = forward ? pageTex(j, 'L') : pageTex(i, 'L');
  leafFront.material.needsUpdate = leafBack.material.needsUpdate = true;
  if (forward) right.top.material.map = pageTex(j, 'R');
  else left.top.material.map = pageTex(j, 'L');
  st.leaf = forward ? 0 : 1;
  bendLeaf(st.leaf);
  leaf.visible = true;
  await tween(st, 'leaf', forward ? 1 : 0, 1200, () => bendLeaf(st.leaf));
  if (forward) left.top.material.map = pageTex(j, 'L');
  else right.top.material.map = pageTex(j, 'R');
  leaf.visible = false;
  await enterSpread(j);
  busy = false;
}

// ---------- 直接拖立体件 ----------
// 按在跨页的可拖部件上（截面、蛋糕块、三角形顶点）就交给跨页处理，书本不转；别处照旧转书。
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let dragging = null, hovering = false;
function rayAt(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  return raycaster.ray;
}
function hitAt(e) {
  const d = SPREADS[current].drag;
  if (!d || busy || !popups[current].visible) return null;
  const targets = d.targets();
  if (!targets.length) return null;
  rayAt(e);
  return raycaster.intersectObjects(targets, false)[0] || null;
}
function setHover(on) {
  if (on === hovering) return;
  hovering = on;
  SPREADS[current].drag?.highlight(on);
  renderer.domElement.style.cursor = on ? (dragging ? 'grabbing' : SPREADS[current].drag.cursor) : '';
}
// 捕获阶段挂在画布外层，赶在 OrbitControls 之前拦下。拖动记住发起它的跨页，
// 翻页、松手、系统取消（触屏被打断）或窗口失焦时都由 endDrag 收尾。
stage.addEventListener('pointerdown', (e) => {
  const hit = hitAt(e);
  if (!hit) return;
  e.stopPropagation();
  e.preventDefault();
  const spread = SPREADS[current];
  dragging = { spread, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  try { renderer.domElement.setPointerCapture(e.pointerId); } catch { /* 没有捕获也能用 */ }
  controls.enabled = false;
  setHover(true);
  spread.drag.start(hit, rayAt(e).clone());
}, { capture: true });
addEventListener('pointermove', (e) => {
  if (dragging) {
    if (e.pointerId !== dragging.id) return;
    if (Math.hypot(e.clientX - dragging.x, e.clientY - dragging.y) > 4) dragging.moved = true;
    if (dragging.moved) dragging.spread.drag.move(rayAt(e).clone());
    dragging.spread.drag.highlight(true);
    return;
  }
  setHover(e.target === renderer.domElement && !!hitAt(e));
});
/** 结束拖动。cancelled 为真时（翻页、取消、失焦）不当成一次点击。 */
function endDrag(cancelled) {
  if (!dragging) return;
  const { spread, id, moved } = dragging;
  dragging = null;
  try { renderer.domElement.releasePointerCapture(id); } catch { /* 已释放 */ }
  spread.drag.end(moved || cancelled);
  spread.drag.highlight(false);
  controls.enabled = true;
  hovering = false;
  renderer.domElement.style.cursor = '';
}
addEventListener('pointerup', (e) => { if (dragging && e.pointerId === dragging.id) endDrag(false); });
addEventListener('pointercancel', () => endDrag(true));
addEventListener('blur', () => endDrag(true));

tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) turnTo(Number(b.dataset.i)); });
$('#prev').addEventListener('click', () => turnTo(current - 1));
$('#next').addEventListener('click', () => turnTo(current + 1));
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input')) return;
  if (e.key === 'ArrowRight') turnTo(current + 1);
  if (e.key === 'ArrowLeft') turnTo(current - 1);
});

// ---------- 相机与尺寸 ----------
const TARGET = V();
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // 宽屏左下角有面板：把书往右上挪；窄屏面板在画布下方，书居中
  if (w > 760) TARGET.set(-0.45, 0.45, 0.5); else TARGET.set(0.1, 0.45, 0.15);
  const far = Math.max(1, (w > 760 ? 1.3 : 1.5) / camera.aspect);        // 竖屏拉远，整本书都在画面里
  camera.position.set(TARGET.x + 0.6 * far, TARGET.y + 6.6 * far, TARGET.z + 7.4 * far);
  camera.updateProjectionMatrix();
  controls.target.copy(TARGET);
  controls.minDistance = 5 * far;
  controls.maxDistance = 16 * far;
  controls.update();
  setLineResolution(w, h);
}
addEventListener('resize', resize);
resize();

function frame(now) {
  runTweens(now);
  controls.update();
  scene.updateMatrixWorld();
  SPREADS[current].tick();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(frame);

const fromHash = () => SPREADS.findIndex((s) => `#${s.id}` === location.hash);
openBook(Math.max(0, fromHash()));
addEventListener('hashchange', () => { const j = fromHash(); if (j >= 0) turnTo(j); });
if (reduceMotion) $('.panel').classList.add('on');
