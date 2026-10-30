// 空间向量小工具（PY-337）。纯函数、不依赖 three.js，点和向量都是 [x, y, z] 数组，
// 可以直接在 node 里测：node -e "import('./geom3.js').then(g => …)"。
// 课本坐标：x 向右，y 向里（进深），z 竖直向上。

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => mul(a, 1 / len(a));
export const lerp = (a, b, t) => add(a, mul(sub(b, a), t));
export const dist = (a, b) => len(sub(a, b));
export const deg = (r) => (r * 180) / Math.PI;
const clamp1 = (x) => Math.max(-1, Math.min(1, x));
// 「几乎为 0」：按参与运算的长度放缩，避免浮点误差把平行判成相交
const tiny = (x, scale) => Math.abs(x) <= 1e-9 * Math.max(1, scale);

/** 两条直线所成的角（弧度，0 ~ π/2）。 */
export const lineAngle = (u, v) => Math.acos(clamp1(Math.abs(dot(u, v)) / (len(u) * len(v))));
/** 直线（方向 u）与平面（法向 n）所成的角（弧度，0 ~ π/2）。 */
export const linePlaneAngle = (u, n) => Math.asin(clamp1(Math.abs(dot(u, n)) / (len(u) * len(n))));
/** 三点 P、Q、R 所在平面的法向量。 */
export const normal = (P, Q, R) => cross(sub(Q, P), sub(R, P));
/** 点 X 到平面（过 P、法向 n）的距离。 */
export const distPointPlane = (X, P, n) => Math.abs(dot(sub(X, P), n)) / len(n);
/** 点 X 在平面（过 P、法向 n）上的垂足。 */
export const footOnPlane = (X, P, n) => sub(X, mul(n, dot(sub(X, P), n) / dot(n, n)));
/** 点 X 在直线（过 P、方向 u）上的垂足。 */
export const footOnLine = (X, P, u) => add(P, mul(u, dot(sub(X, P), u) / dot(u, u)));

/**
 * 两条直线 P + s·u 与 Q + t·v 的位置关系。
 * 返回 { rel: 'same' | 'parallel' | 'intersect' | 'skew', angle（弧度）, X（交点，相交时）, s, t }。
 */
export function lineLine(P, u, Q, v) {
  const w = sub(Q, P), c = cross(u, v), sc = len(u) * len(v);
  if (tiny(len(c), sc)) {
    return { rel: tiny(len(cross(w, u)), len(w) * len(u)) ? 'same' : 'parallel', angle: 0 };
  }
  const vol = dot(w, c);
  if (!tiny(vol, len(w) * sc)) return { rel: 'skew', angle: lineAngle(u, v), dist: Math.abs(vol) / len(c) };
  const cc = dot(c, c);
  const s = dot(cross(w, v), c) / cc, t = dot(cross(w, u), c) / cc;
  return { rel: 'intersect', angle: lineAngle(u, v), X: add(P, mul(u, s)), s, t };
}

/**
 * 直线 P + s·u 与平面（过 Q、法向 n）的位置关系。
 * 返回 { rel: 'in' | 'parallel' | 'intersect', angle（弧度）, X（交点）, s }。
 */
export function linePlane(P, u, Q, n) {
  const un = dot(u, n), d = dot(sub(Q, P), n);
  if (tiny(un, len(u) * len(n))) return { rel: tiny(d, len(sub(Q, P)) * len(n)) ? 'in' : 'parallel', angle: 0 };
  const s = d / un;
  return { rel: 'intersect', angle: linePlaneAngle(u, n), X: add(P, mul(u, s)), s };
}

/**
 * 两个平面（过 P、法向 m；过 Q、法向 n）的位置关系。
 * 返回 { rel: 'same' | 'parallel' | 'intersect', angle（两平面所成角，弧度 0 ~ π/2）, dist（平行时）, X、dir（交线） }。
 */
export function planePlane(P, m, Q, n) {
  const c = cross(m, n), sc = len(m) * len(n);
  if (tiny(len(c), sc)) {
    const d = distPointPlane(Q, P, m);
    return { rel: tiny(d, len(sub(Q, P))) ? 'same' : 'parallel', angle: 0, dist: d };
  }
  // 交线上的一点：同时满足 m·X = m·P、n·X = n·Q，取在 m、n 张成的方向里
  const d1 = dot(m, P), d2 = dot(n, Q), mm = dot(m, m), nn = dot(n, n), mn = dot(m, n), cc = dot(c, c);
  const X = add(mul(m, (d1 * nn - d2 * mn) / cc), mul(n, (d2 * mm - d1 * mn) / cc));
  return { rel: 'intersect', angle: lineAngle(m, n), X, dir: c };
}

/** 直线 P + s·u 被长方体 [0,a]×[0,b]×[0,c] 截下的线段（两端点），不相交时返回 null。 */
export function clipToBox(P, u, [a, b, c]) {
  let lo = -Infinity, hi = Infinity;
  const max = [a, b, c];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(u[i]) < 1e-12) {
      if (P[i] < -1e-9 || P[i] > max[i] + 1e-9) return null;
      continue;
    }
    let t0 = (0 - P[i]) / u[i], t1 = (max[i] - P[i]) / u[i];
    if (t0 > t1) [t0, t1] = [t1, t0];
    lo = Math.max(lo, t0); hi = Math.min(hi, t1);
  }
  if (!(hi > lo + 1e-9)) return null;
  return [add(P, mul(u, lo)), add(P, mul(u, hi))];
}

// 长方体 ABCD-A1B1C1D1：A 在原点，AB 沿 x（长 a），AD 沿 y（宽 b），AA1 沿 z（高 c）
export function cuboid(a, b, c) {
  const V = {
    A: [0, 0, 0], B: [a, 0, 0], C: [a, b, 0], D: [0, b, 0],
    A1: [0, 0, c], B1: [a, 0, c], C1: [a, b, c], D1: [0, b, c],
  };
  const F = [['A', 'B', 'C', 'D'], ['A1', 'B1', 'C1', 'D1'], ['A', 'B', 'B1', 'A1'], ['B', 'C', 'C1', 'B1'], ['C', 'D', 'D1', 'C1'], ['D', 'A', 'A1', 'D1']];
  return { V, F };
}

/** 课本建系的正方体（选必一 1.4 例题）：棱长 s，D 为原点，DA、DC、DD₁ 为 x、y、z 轴 */
export function cubeD(s) {
  return {
    D: [0, 0, 0], A: [s, 0, 0], B: [s, s, 0], C: [0, s, 0],
    D1: [0, 0, s], A1: [s, 0, s], B1: [s, s, s], C1: [0, s, s],
  };
}
