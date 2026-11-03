// 培玉立体书 · 公共件：配色、铅笔排线材质、墨线、补间动画（PY-503）
import * as THREE from 'three';
import { LineSegments2 } from '../lab3d/vendor/LineSegments2.js';
import { LineSegmentsGeometry } from '../lab3d/vendor/LineSegmentsGeometry.js';
import { LineMaterial } from '../lab3d/vendor/LineMaterial.js';

export const C = {
  bg: '#EFE9DD', table: '#E3DACA', paper: '#FBF8F1', ink: '#1A2822', muted: '#5E6B64',
  a: '#2F7A56', b: '#966524', c: '#3E5C76', hl: '#D9A441', hlSoft: '#F6E7C4', hlMark: '#E8C27A',
  jade: '#B2CEB3', sage: '#93B89C', mist: '#C3D0DC',
};
export const SERIF = '"Songti SC","Noto Serif CJK SC","Source Han Serif SC","STSong",serif';
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer = null;
export function useRenderer(r) { renderer = r; }
export const maxAnisotropy = () => renderer.capabilities.getMaxAnisotropy();

// ---------- 铅笔排线 ----------
// 亮度 v = 受光颜色 / 固有色；越暗叠的排线越多（斜线 → 交叉线 → 加密）。
const HATCH = /* glsl */`
uniform vec3 uInk;
uniform float uPx;
float hline(float c, float s, float w) {
  float d = abs(fract(c / s) - 0.5) * s;
  return 1.0 - smoothstep(w * 0.5, w * 0.5 + 1.0, d);
}
float layer(float c, float s, float v, float thr) {
  float k = clamp((thr - v) / 0.22, 0.0, 1.0);
  return k > 0.0 ? hline(c, s, 0.4 + k) * min(1.0, k * 1.6) : 0.0;
}
float hatch(float v, vec2 p) {
  float s = 6.0;
  float ink = layer(p.x + p.y, s, v, 0.9);
  ink = max(ink, layer(p.x - p.y, s, v, 0.66));
  ink = max(ink, layer(p.x + p.y + s * 0.5, s, v, 0.42));
  return ink;
}`;

export function inkMaterial({ color = C.paper, map = null, opacity = 1, side = THREE.FrontSide, clip = null } = {}) {
  const m = new THREE.MeshLambertMaterial({ color, map, side, transparent: opacity < 1, opacity });
  if (opacity < 1) m.depthWrite = false;
  if (clip) { m.clippingPlanes = clip; m.clipShadows = true; }
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uInk = { value: new THREE.Color(C.ink) };
    sh.uniforms.uPx = { value: renderer.getPixelRatio() };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${HATCH}`)
      .replace('#include <opaque_fragment>', `
        {
          vec3 lw = vec3(0.299, 0.587, 0.114);
          float v = dot(outgoingLight, lw) / max(dot(diffuseColor.rgb, lw), 1e-3);
          float ink = hatch(v, gl_FragCoord.xy / uPx);
          vec3 tone = diffuseColor.rgb * (0.84 + 0.16 * clamp(v, 0.0, 1.0));
          outgoingLight = mix(tone, uInk, ink * 0.78);
        }
        #include <opaque_fragment>`);
  };
  m.customProgramCacheKey = () => 'ink';
  return m;
}

// 背面沿法线外扩一圈，画成墨色：光滑曲面的轮廓线随视角自动出现。
export function hullMaterial(width, { clip = null, opacity = 1 } = {}) {
  const m = new THREE.MeshBasicMaterial({ color: C.ink, side: THREE.BackSide, transparent: opacity < 1, opacity });
  if (clip) m.clippingPlanes = clip;
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>',
      `vec3 transformed = position + normal * ${width.toFixed(4)};`);
  };
  m.customProgramCacheKey = () => `hull${width}`;
  return m;
}

// ---------- 墨线 ----------
const lineMats = [];
export function lineMat(color = C.ink, width = 1.6, opacity = 1, clip = null) {
  const m = new LineMaterial({ color: new THREE.Color(color), linewidth: width, transparent: opacity < 1, opacity });
  if (clip) m.clippingPlanes = clip;
  lineMats.push(m);
  return m;
}
export function setLineResolution(w, h) { for (const m of lineMats) m.resolution.set(w, h); }

export function edges(geometry, mat, threshold = 25) {
  const g = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry, threshold));
  return new LineSegments2(g, mat);
}
export function segments(arr, mat) {
  const g = new LineSegmentsGeometry();
  if (arr.length) g.setPositions(arr);
  return new LineSegments2(g, mat);
}
export function polyline(points, closed, mat) {
  const arr = [];
  const n = closed ? points.length : points.length - 1;
  for (let i = 0; i < n; i++) {
    const p = points[i], q = points[(i + 1) % points.length];
    arr.push(p.x, p.y, p.z, q.x, q.y, q.z);
  }
  return segments(arr, mat);
}

/** 凸多边形扇形三角化（开口曲线用首尾连线封口）。 */
export function fanGeometry(pts) {
  const c = pts.reduce((s, p) => s.add(p), V()).divideScalar(pts.length);
  const arr = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    arr.push(c.x, c.y, c.z, p.x, p.y, p.z, q.x, q.y, q.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  return g;
}

export function disposeTree(obj) {
  obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  obj.removeFromParent();
}

// ---------- 截切：下半实体 + 抬起的半透明上半截 + 截面填色 ----------
const fillMat = new THREE.MeshBasicMaterial({
  color: C.hl, transparent: true, opacity: 0.82, side: THREE.DoubleSide,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
});

// 拾取用的透明面：不画颜色、不写深度，只给射线检测用。
const pickMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });

export class Cut {
  constructor(parent, geometry, { color, hull = 0.016, edgeThreshold = 30, lidEdges = false } = {}) {
    this.parent = parent;
    this.clipLow = [new THREE.Plane()];
    this.clipLid = [new THREE.Plane()];
    this.localLow = new THREE.Plane();
    this.localLid = new THREE.Plane();
    const body = new THREE.Mesh(geometry, inkMaterial({ color, side: THREE.DoubleSide, clip: this.clipLow }));
    body.castShadow = body.receiveShadow = true;
    parent.add(body);
    if (hull) parent.add(new THREE.Mesh(geometry, hullMaterial(hull, { clip: this.clipLow })));
    parent.add(edges(geometry, lineMat(C.ink, 1.6, 1, this.clipLow), edgeThreshold));
    this.lid = new THREE.Group();
    this.lid.add(new THREE.Mesh(geometry, inkMaterial({ color, opacity: 0.32, clip: this.clipLid })));
    if (hull) this.lid.add(new THREE.Mesh(geometry, hullMaterial(hull * 0.75, { clip: this.clipLid, opacity: 0.35 })));
    if (lidEdges) this.lid.add(edges(geometry, lineMat(C.ink, 1.2, 0.45, this.clipLid), edgeThreshold));
    parent.add(this.lid);
    this.curveMat = lineMat(C.b, 3.6);
    this.frameMat = lineMat(C.c, 1.4, 0.7);
    this.extra = [];
    this.picks = [];
  }

  /** 截面上能按住拖的东西：示意框围成的透明面和截口填色。 */
  targets() { return this.picks; }

  /** 鼠标停在截面上或正在拖：示意框变金色加粗。 */
  highlight(on) {
    this.frameMat.color.set(on ? C.hl : C.c);
    this.frameMat.linewidth = on ? 3 : 1.4;
    this.frameMat.opacity = on ? 1 : 0.7;
  }

  /** n：截面法向（指向抬起的一侧）；pts：截口点列；frame：示意框四角（可为空）。 */
  set({ n, P0, gap, pts, closed, frame }) {
    this.localLow.setFromNormalAndCoplanarPoint(n.clone().negate(), P0);
    this.localLid.setFromNormalAndCoplanarPoint(n, P0.clone().addScaledVector(n, gap));
    this.lid.position.copy(n).multiplyScalar(gap);
    for (const o of this.extra) disposeTree(o);
    this.extra = [];
    this.picks = [];
    if (pts.length > 2) {
      const fill = new THREE.Mesh(fanGeometry(pts), fillMat);
      this.extra.push(fill, polyline(pts, closed, this.curveMat));
      this.picks.push(fill);
    }
    if (frame) {
      const mid = frame.map((p) => p.clone().addScaledVector(n, gap * 0.5));
      const pick = new THREE.Mesh(fanGeometry(mid), pickMat);
      this.extra.push(polyline(mid, true, this.frameMat), pick);
      this.picks.push(pick);
    }
    for (const o of this.extra) this.parent.add(o);
  }

  tick() {
    this.clipLow[0].copy(this.localLow).applyMatrix4(this.parent.matrixWorld);
    this.clipLid[0].copy(this.localLid).applyMatrix4(this.parent.matrixWorld);
  }
}

// ---------- 补间 ----------
export const tweens = [];
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  out: (t) => 1 - (1 - t) ** 3,
  back: (t) => { const c = 1.5; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
};
/** 把 obj[key] 补间到 to；返回 Promise，动画结束时 resolve。减少动态时直接跳到终点。 */
export function tween(obj, key, to, ms, onStep, { delay = 0, fn = ease.inOut } = {}) {
  return new Promise((resolve) => {
    if (reduceMotion) { obj[key] = to; onStep?.(); resolve(); return; }
    let from = null;
    const start = performance.now() + delay;
    tweens.push({ obj, key, step(now) {
      if (now < start) return false;
      if (from === null) from = obj[key];
      const k = Math.min(1, (now - start) / ms);
      obj[key] = from + (to - from) * fn(k);
      onStep?.();
      if (k >= 1) resolve();
      return k >= 1;
    } });
  });
}
export function stopTweens(obj, key) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    if (tweens[i].obj === obj && (key === undefined || tweens[i].key === key)) tweens.splice(i, 1);
  }
}
export function runTweens(now) {
  for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].step(now)) tweens.splice(i, 1);
}
export const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
