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

  function intersectLines(p1, p2, q1, q2) {
    const r0 = p2[0] - p1[0], r1 = p2[1] - p1[1];
    const s0 = q2[0] - q1[0], s1 = q2[1] - q1[1];
    const det = r0 * s1 - r1 * s0;
    if (Math.abs(det) < 1e-11) return null;
    const qp0 = q1[0] - p1[0], qp1 = q1[1] - p1[1];
    const t = (qp0 * s1 - qp1 * s0) / det;
    return [p1[0] + t * r0, p1[1] + t * r1];
  }

  function projectToLine(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-14) return [a[0], a[1]];
    const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
    return [a[0] + t * dx, a[1] + t * dy];
  }

  function circumcenter2D(a, b, c) {
    const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    if (Math.abs(d) < 1e-18) return null;
    const a2 = a[0] * a[0] + a[1] * a[1];
    const b2 = b[0] * b[0] + b[1] * b[1];
    const c2 = c[0] * c[0] + c[1] * c[1];
    const ux = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
    const uy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
    return [ux, uy];
  }

  function menelausCeva(mode, u, v, ay = 2.4, ax = -0.4) {
    if ((mode !== 'ceva' && mode !== 'menelaus') || ![u, v, ay, ax].every(Number.isFinite) || u <= 0 || v <= 0 || ay < 0) {
      throw new RangeError('Invalid Menelaus/Ceva parameters');
    }
    const B = [-2.6, 0], C = [2.2, 0], A = [ax, ay];
    const E = [(C[0] + u * A[0]) / (1 + u), (C[1] + u * A[1]) / (1 + u)];
    const F = [(A[0] + v * B[0]) / (1 + v), (A[1] + v * B[1]) / (1 + v)];
    const ce = Math.hypot(E[0] - C[0], E[1] - C[1]);
    const ea = Math.hypot(A[0] - E[0], A[1] - E[1]);
    const af = Math.hypot(F[0] - A[0], F[1] - A[1]);
    const fb = Math.hypot(B[0] - F[0], B[1] - F[1]);
    const ce_ea = ce / ea, af_fb = af / fb;
    if (ay < 1e-9) {
      return {
        mode, A, B, C, E, F, D: null, P: null,
        ce, ea, af, fb, bd: null, dc: null,
        ce_ea, af_fb, bd_dc: null,
        signed_bd_dc: null,
        product: null, signed_product: null,
        parallel: false, degenerateTriangle: true, residual: null
      };
    }
    if (mode === 'ceva') {
      const P = intersectLines(B, E, C, F);
      const D = intersectLines(A, P, B, C);
      const bd = Math.hypot(D[0] - B[0], D[1] - B[1]);
      const dc = Math.hypot(C[0] - D[0], C[1] - D[1]);
      const bd_dc = bd / dc;
      const signed_bd_dc = (D[0] - B[0]) / (C[0] - D[0]);
      const product = bd_dc * ce_ea * af_fb;
      const signed_product = signed_bd_dc * ce_ea * af_fb;
      return {
        mode, A, B, C, E, F, D, P,
        ce, ea, af, fb, bd, dc,
        ce_ea, af_fb, bd_dc, signed_bd_dc,
        product, signed_product,
        parallel: false, degenerateTriangle: false,
        residual: Math.abs(product - 1)
      };
    }
    if (Math.abs(u * v - 1) < 1e-9) {
      return {
        mode, A, B, C, E, F, D: null, P: null,
        ce, ea, af, fb, bd: null, dc: null,
        ce_ea, af_fb, bd_dc: null, signed_bd_dc: null,
        product: null, signed_product: null,
        parallel: true, degenerateTriangle: false,
        residual: null
      };
    }
    const D = intersectLines(E, F, B, C);
    const bd = Math.hypot(D[0] - B[0], D[1] - B[1]);
    const dc = Math.hypot(C[0] - D[0], C[1] - D[1]);
    const bd_dc = bd / dc;
    const signed_bd_dc = (D[0] - B[0]) / (C[0] - D[0]);
    const product = bd_dc * ce_ea * af_fb;
    const signed_product = signed_bd_dc * ce_ea * af_fb;
    return {
      mode, A, B, C, E, F, D, P: null,
      ce, ea, af, fb, bd, dc,
      ce_ea, af_fb, bd_dc, signed_bd_dc,
      product, signed_product,
      parallel: false, degenerateTriangle: false,
      residual: Math.abs(product - 1)
    };
  }

  function radicalAxis(d, r1, r2, py = 1.2, c3x = 0.2, c3y = 1.9, r3 = 1.2) {
    if (![d, r1, r2, py, c3x, c3y, r3].every(Number.isFinite) || d < 0 || r1 <= 0 || r2 <= 0 || r3 <= 0 || Math.abs(c3y) < 1e-9) {
      throw new RangeError('Invalid circle parameters');
    }
    const O1 = [-d / 2, 0], O2 = [d / 2, 0], O3 = [c3x, c3y];
    const powerScale = (p, c, r) => Math.max(1, (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2, r * r);
    const power = (p, c, r) => {
      const raw = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 - r * r;
      const eps = 1e-12 * powerScale(p, c, r);
      return Math.abs(raw) <= eps ? 0 : raw;
    };
    const tangentFromPower = (pow, p, c, r) => {
      const eps = 1e-12 * powerScale(p, c, r);
      if (pow < -eps) return null;
      return pow <= eps ? 0 : Math.sqrt(pow);
    };
    if (d < 1e-9) {
      const P = [0, py];
      const pow1 = power(P, O1, r1), pow2 = power(P, O2, r2);
      const relation = Math.abs(r1 - r2) < 1e-9 ? 'coincident' : 'concentric-none';
      return {
        d, r1, r2, O1, O2, O3, r3,
        concentric: true, relation, radicalX: null,
        P, pow1, pow2, powerGap: pow1 - pow2,
        tangent1: tangentFromPower(pow1, P, O1, r1),
        tangent2: tangentFromPower(pow2, P, O2, r2),
        intersections: [], radicalCenter: null, centerPowers: null
      };
    }
    const radicalX = (r1 * r1 - r2 * r2) / (2 * d);
    const sumR = r1 + r2, diffR = Math.abs(r1 - r2);
    const relEps = 1e-9 * Math.max(1, d, sumR);
    let relation = 'secant';
    if (Math.abs(d - sumR) <= relEps) relation = 'externally-tangent';
    else if (Math.abs(d - diffR) <= relEps) relation = 'internally-tangent';
    else if (d > sumR) relation = 'disjoint-external';
    else if (d < diffR) relation = 'disjoint-internal';
    const h2 = r1 * r1 - (radicalX - O1[0]) ** 2;
    const h2Eps = 1e-11 * Math.max(1, r1 * r1, r2 * r2, d * d);
    const intersections = h2 > h2Eps
      ? [[radicalX, Math.sqrt(h2)], [radicalX, -Math.sqrt(h2)]]
      : h2 >= -h2Eps ? [[radicalX, 0]] : [];
    const P = [radicalX, py];
    const pow1 = power(P, O1, r1), pow2 = power(P, O2, r2);
    const rawGap = pow1 - pow2;
    const gapEps = 1e-12 * Math.max(powerScale(P, O1, r1), powerScale(P, O2, r2));
    const powerGap = Math.abs(rawGap) <= gapEps ? 0 : rawGap;
    const c1Const = O1[0] * O1[0] + O1[1] * O1[1] - r1 * r1;
    const c3Const = O3[0] * O3[0] + O3[1] * O3[1] - r3 * r3;
    const yRad = (c3Const - c1Const - 2 * (O3[0] - O1[0]) * radicalX) / (2 * O3[1]);
    const radicalCenter = [radicalX, yRad];
    const cp1 = power(radicalCenter, O1, r1);
    const cp2 = power(radicalCenter, O2, r2);
    const cp3 = power(radicalCenter, O3, r3);
    return {
      d, r1, r2, O1, O2, O3, r3,
      concentric: false, relation, radicalX,
      P, pow1, pow2, powerGap,
      tangent1: tangentFromPower(pow1, P, O1, r1),
      tangent2: tangentFromPower(pow2, P, O2, r2),
      intersections, radicalCenter,
      centerPowers: [cp1, cp2, cp3]
    };
  }

  function eulerNinePoint(ax, ay, b = 2.0) {
    if (![ax, ay, b].every(Number.isFinite) || ay < 0 || b <= 0) {
      throw new RangeError('Invalid triangle parameters');
    }
    const A = [ax, ay], B = [-b, 0], C = [b, 0];
    const G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    const Ma = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2];
    const Mb = [(C[0] + A[0]) / 2, (C[1] + A[1]) / 2];
    const Mc = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const midpoints = [Ma, Mb, Mc];
    const coincidentEndpoint = Math.abs(Math.abs(ax) - b) < 1e-7;
    const limitR9 = coincidentEndpoint ? b / 2 : Infinity;
    if (ay < 1e-9) {
      return {
        A, B, C, G, O: null, H: null, N: null, R: null, R9: null,
        vecOG: null, vecGO: null, vecGH: null, vecOH: null, vecON: null,
        midpoints, feet: null, eulerPoints: null,
        ninePointDistances: null, maxNinePointDeviation: null,
        og: null, gn: null, nh: null, on: null, oh: null,
        eulerCollinearResidual: null,
        collinear: true, coincidentEndpoint, limitR9,
        equilateral: false, nearEquilateral: false, rightTriangle: false
      };
    }
    const O = circumcenter2D(A, B, C);
    const R = Math.hypot(B[0] - O[0], B[1] - O[1]);
    const Da = projectToLine(A, B, C);
    const Db = projectToLine(B, C, A);
    const Dc = projectToLine(C, A, B);
    const feet = [Da, Db, Dc];
    const altA = [A[0] - (C[1] - B[1]), A[1] + (C[0] - B[0])];
    const altB = [B[0] - (A[1] - C[1]), B[1] + (A[0] - C[0])];
    const H = intersectLines(A, altA, B, altB);
    const N = circumcenter2D(Ma, Mb, Mc);
    const R9 = Math.hypot(Ma[0] - N[0], Ma[1] - N[1]);
    const Ea = [(A[0] + H[0]) / 2, (A[1] + H[1]) / 2];
    const Eb = [(B[0] + H[0]) / 2, (B[1] + H[1]) / 2];
    const Ec = [(C[0] + H[0]) / 2, (C[1] + H[1]) / 2];
    const eulerPoints = [Ea, Eb, Ec];
    const ninePoints = [...midpoints, ...feet, ...eulerPoints];
    const ninePointDistances = ninePoints.map(p => Math.hypot(p[0] - N[0], p[1] - N[1]));
    const maxNinePointDeviation = Math.max(...ninePointDistances.map(dist => Math.abs(dist - R9)));
    const vecOG = [G[0] - O[0], G[1] - O[1]];
    const vecGO = [O[0] - G[0], O[1] - G[1]];
    const vecGH = [H[0] - G[0], H[1] - G[1]];
    const vecOH = [H[0] - O[0], H[1] - O[1]];
    const vecON = [N[0] - O[0], N[1] - O[1]];
    const oh = Math.hypot(...vecOH);
    const og = Math.hypot(...vecOG);
    const gn = Math.hypot(N[0] - G[0], N[1] - G[1]);
    const nh = Math.hypot(H[0] - N[0], H[1] - N[1]);
    const on = Math.hypot(...vecON);
    const eulerCollinearResidual = Math.abs(vecOG[0] * vecOH[1] - vecOG[1] * vecOH[0]);
    const equilateral = oh < 1e-7;
    const nearEquilateral = !equilateral && Math.abs(ax) < 1e-7 && Math.abs(ay - Math.sqrt(3) * b) <= 0.025;
    const rightTriangle = Math.abs(ax * ax + ay * ay - b * b) < 1e-7 || Math.abs(Math.abs(ax) - b) < 1e-7;
    return {
      A, B, C, G, O, H, N, R, R9,
      vecOG, vecGO, vecGH, vecOH, vecON,
      midpoints, feet, eulerPoints,
      ninePointDistances, maxNinePointDeviation,
      og, gn, nh, on, oh, eulerCollinearResidual,
      collinear: false, coincidentEndpoint, limitR9,
      equilateral, nearEquilateral, rightTriangle
    };
  }

  root.LabMath = Object.freeze({
    functions,
    tangent,
    vectors,
    ptolemy,
    menelausCeva,
    radicalAxis,
    eulerNinePoint
  });
})(globalThis);
