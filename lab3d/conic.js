// 圆锥曲线三页（3.1 / 3.2 / 3.3）共用的几何（PY-362）。
// 约定：圆锥顶点在原点、轴是 z 轴，半顶角 α；截面与水平面成 β 角、向 +y 方向抬起，到顶点的距离是 h，
// 即截面 n·X = h，n = (0, sinβ, −cosβ)。丹德林球球心在轴上 (0,0,−k)，k < 0 表示在上半叶。
import * as G from './geom3.js';

export const RAD = (d) => (d * Math.PI) / 180;
export const f4 = (x) => (Math.abs(x) < 5e-10 ? 0 : x).toFixed(4);
export const N = 72;

/** 水平圆：深度 −z 处、半径 r */
export const ring = (z, r) => Array.from({ length: N }, (_, i) => { const t = (2 * Math.PI * i) / N; return [r * Math.cos(t), r * Math.sin(t), z]; });

/** 圆锥面：下半叶到深度 down，上半叶到高度 up（0 表示不画），切成三角形；同时给出口沿 */
export function coneSurface(al, down, up = 0) {
  const t = Math.tan(al), polys = [], rims = [];
  for (const z of [-down, up].filter((v) => v !== 0)) {
    const rim = ring(z, Math.abs(z) * t);
    rims.push(rim);
    rim.forEach((q, i) => polys.push([[0, 0, 0], q, rim[(i + 1) % N]]));
  }
  return { polys, rims };
}

/** 两条在 x = 0 轴截面里的母线（画成细线，标出圆锥的「边」） */
export function generators(al, down, up = 0) {
  const t = Math.tan(al);
  const ends = (z) => [[0, Math.abs(z) * t, z], [0, -Math.abs(z) * t, z]];
  const lo = ends(-down), hi = up ? ends(up) : [[0, 0, 0], [0, 0, 0]];
  return [
    { id: 'g1', from: hi[1], to: lo[0], color: 'fg', width: 1.8 },
    { id: 'g2', from: hi[0], to: lo[1], color: 'fg', width: 1.8 },
  ];
}

/** 截面框架与丹德林球 */
export function frame(alDeg, beDeg, h) {
  const al = RAD(alDeg), be = RAD(beDeg), sa = Math.sin(al), ca = Math.cos(al);
  const n = [0, Math.sin(be), -Math.cos(be)];          // 截面单位法向量
  const u = [0, Math.cos(be), Math.sin(be)];            // 截面里沿轴截面方向（向上抬的方向）
  const w = [1, 0, 0];                                  // 截面里的水平方向
  const O = G.mul(n, h);                                // 顶点到截面的垂足
  // 球心 (0,0,−k) 到截面的距离 |k·cosβ − h| 等于半径 |k|·sinα，所以 k = h / (cosβ ± sinα)
  const ball = (k) => {
    const C = [0, 0, -k];
    return { k, C, r: Math.abs(k) * sa, F: G.footOnPlane(C, O, n), zc: -k * ca * ca, rc: Math.abs(k) * sa * ca };
  };
  /** 截面与 x = 0 里一条母线的交点：母线方向 (0, σ·sinα, −cosα)，σ = ±1 */
  const hit = (sg) => {
    const g = [0, sg * sa, -ca], s = h / G.dot(n, g);
    return G.mul(g, s);
  };
  return { al, be, sa, ca, cb: Math.cos(be), n, u, w, O, h, ball, hit };
}

/** 截面画成矩形：中心 M，沿 u 方向 [−eu, eu]，沿 w 方向 [−ew, ew] */
export function quad(M, u, w, eu, ew) {
  const at = (s, t) => G.add(M, G.add(G.mul(u, s), G.mul(w, t)));
  return [at(eu, ew), at(eu, -ew), at(-eu, -ew), at(-eu, ew)];
}

/** 母线 VP 上 z 坐标为 z 的点（V 是原点） */
export const onGen = (P, z) => G.mul(P, z / P[2]);
