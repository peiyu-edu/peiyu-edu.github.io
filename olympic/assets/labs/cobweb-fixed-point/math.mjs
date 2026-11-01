// Original draft: exact rational iteration; no DOM, network or persistence.
const gcd = (a, b) => { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a; };
function fraction(n, d) {
  if (!d) return null;
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d); return { n: n / g, d: d / g };
}
export const value = r => Number(r.n) / Number(r.d);
export const exact = r => r.d === 1n ? String(r.n) : `${r.n}/${r.d}`;
export const defaults = Object.freeze({ family: 'affine', Q: 5, B: 10, X: 20, C: 4, steps: 16 });
export function validate(c) {
  if (!['affine', 'inverse', 'mobius'].includes(c.family)) throw Error('未知递推');
  for (const [k, lo, hi] of [['Q', -20, 20], ['B', -20, 20], ['X', -60, 60], ['C', -16, 16], ['steps', 1, 60]]) {
    if (!Number.isInteger(c[k]) || c[k] < lo || c[k] > hi) throw Error(`参数越界: ${k}`);
  }
}
export function orbit(c) {
  validate(c);
  const Q = BigInt(c.Q), B = BigInt(c.B), C = BigInt(c.C);
  let r = fraction(BigInt(c.X), 20n);
  const terms = [r];
  for (let i = 0; i < c.steps; i++) {
    const { n, d } = r;
    r = c.family === 'affine' ? fraction(Q * n + B * d, 10n * d)
      : c.family === 'inverse' ? fraction(C * d, 4n * n) : fraction(n, d + n);
    if (!r) return { terms, undefinedAt: i + 1 };
    terms.push(r);
  }
  return { terms, undefinedAt: null };
}
export function functionValue(c, x) {
  if (c.family === 'affine') return c.Q / 10 * x + c.B / 10;
  if (c.family === 'inverse') return x === 0 ? null : c.C / (4 * x);
  return x === -1 ? null : x / (1 + x);
}
export const labels = Object.freeze({ converge: '收敛至有限值', cycle: '非恒定二周期', diverge: '绝对值趋于无穷', undefined: '有限步失去定义' });
// Conclusions below use closed forms, never a tolerance on a finite trajectory.
export function classify(c) {
  validate(c);
  if (c.family === 'affine') {
    const { Q, B, X } = c, q = Q / 10, b = B / 10;
    if ((10 - Q) * X === 20 * B) return { kind: 'converge', reason: '初值恰为不动点，所有项相同。', limit: X / 20 };
    if (Q === 10) return { kind: 'diverge', reason: 'q=1 且 b≠0：xₙ=x₀+nb，故 |xₙ|→∞。' };
    if (Q === -10) return { kind: 'cycle', reason: 'q=−1：f(f(x))=x；初值不是 b/2，因此恰为二周期。' };
    const L = b / (1 - q);
    if (Math.abs(Q) < 10) return { kind: 'converge', limit: L, reason: 'xₙ−L=qⁿ(x₀−L)，|q|<1，故对所有实初值收敛。q<0 时误差交替变号（非恒定轨道）。' };
    return { kind: 'diverge', reason: '初值不等于 L，且 |q|>1：|xₙ−L|=|q|ⁿ|x₀−L|→∞，从而 |xₙ|→∞。q<−1 时正负交替发散。' };
  }
  if (c.family === 'inverse') {
    if (c.X === 0) return { kind: 'undefined', reason: 'x₀=0 不属于 f 的定义域，x₁ 无定义。', undefinedAt: 1 };
    if (c.C === 0) return { kind: 'undefined', reason: 'c=0 且 x₀≠0，x₁=0，但 x₂=0/0 无定义。不能把 0/x 在 x=0 延拓后冒充原递推。', undefinedAt: 2 };
    if (c.X * c.X === 100 * c.C) return { kind: 'converge', limit: c.X / 20, reason: 'x₀²=c，初值为实不动点，轨道恒定。' };
    return { kind: 'cycle', reason: 'c≠0、x₀≠0 保证每步非零；f(f(x))=x，且 x₀²≠c，故恰为二周期，并不收敛。' };
  }
  // x_n = X/(20+nX), while every preceding denominator is nonzero.
  if (c.X < 0 && 20 % (-c.X) === 0) {
    const k = 20 / (-c.X);
    return { kind: 'undefined', undefinedAt: k, reason: `xₙ=X/(20+nX) 仅在递推未中断时成立。x${k - 1}=−1，故 x${k} 无定义；不能跳过该项继续用通项。` };
  }
  return { kind: 'converge', limit: 0, reason: c.X === 0 ? '初值为 0，恒为 0。' : '所有整数 n≥0 都有 20+nX≠0；由 xₙ=X/(20+nX)→0 得收敛。负初值可先跨越极点附近，有限大幅跳动不等于发散。' };
}
// Fixed points are independent of the chosen initial value; these plotting values
// may be irrational. Exact iteration/classification above never uses these roots.
export function fixedPoints(c) {
  validate(c);
  if (c.family === 'affine') {
    if (c.Q === 10) return { all: c.B === 0, points: [] };
    return { all: false, points: [{ x: c.B / (10 - c.Q), slope: c.Q / 10 }] };
  }
  if (c.family === 'inverse') return { all: false, points: c.C > 0 ? [-1, 1].map(s => ({ x: s * Math.sqrt(c.C / 4), slope: -1 })) : [] };
  return { all: false, points: [{ x: 0, slope: 1 }] };
}
