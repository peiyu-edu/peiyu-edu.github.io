/* Original numerical kernel; no DOM, network or persistence. */
(function (root) {
  'use strict';
  const functions = {
    square: { f: x => x * x, df: x => 2 * x, min: -2, max: 2 },
    log: { f: Math.log, df: x => 1 / x, min: 0.25, max: 4 }
  };
  function tangent(kind, a, x) {
    const fn = functions[kind];
    if (!fn || ![a, x].every(v => Number.isFinite(v) && v >= fn.min && v <= fn.max)) throw new RangeError('Outside displayed domain');
    const fa = fn.f(a), slope = fn.df(a), tx = fa + slope * (x - a);
    return { fa, slope, tx, fx: fn.f(x), gap: fn.f(x) - tx };
  }
  function vectors(r, s, degrees) {
    if (![r, s, degrees].every(Number.isFinite) || r < 0 || s < 0) throw new RangeError('Invalid vector');
    const u = [r, 0], v = [s * Math.cos(degrees * Math.PI / 180), s * Math.sin(degrees * Math.PI / 180)];
    const dot = u[0] * v[0] + u[1] * v[1], nu = Math.hypot(...u), nv = Math.hypot(...v);
    return { u, v, dot, nu, nv, product: nu * nv, cosine: nu * nv === 0 ? null : dot / (nu * nv), determinant: u[0] * v[1] - u[1] * v[0] };
  }
  function ptolemy(angles, radius = 1) {
    if (angles.length !== 4 || !angles.every(Number.isFinite) || !Number.isFinite(radius) || radius <= 0) throw new RangeError('Invalid circle');
    if (!angles.every((a, i) => a >= 0 && a < 360 && (i === 0 || a > angles[i - 1]))) throw new RangeError('Require distinct cyclic order');
    const points = angles.map(a => [radius * Math.cos(a * Math.PI / 180), radius * Math.sin(a * Math.PI / 180)]);
    const length = (i, j) => Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]);
    const [ab, bc, cd, da, ac, bd] = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]].map(([i,j]) => length(i,j));
    return { points, ab, bc, cd, da, ac, bd, lhs: ac * bd, rhs: ab * cd + bc * da };
  }
  root.LabMath = Object.freeze({ functions, tangent, vectors, ptolemy });
})(globalThis);
