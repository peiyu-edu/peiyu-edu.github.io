// Pure finite-sum model. Array position k - 1 represents mathematical index k.
export function validate(a, b, m, n) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length > 64) {
    throw new RangeError('两列须等长，最多 64 项。');
  }
  if (![...a, ...b].every(x => Number.isFinite(x) && Math.abs(x) <= 1e6)) {
    throw new RangeError('每项须为绝对值不超过 1000000 的有限实数。');
  }
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < m - 1 || n > a.length) {
    throw new RangeError('须满足 1 ≤ m ≤ n + 1 ≤ N + 1；m = n + 1 表示空和。');
  }
}

export function directSum(a, b, m = 1, n = a.length) {
  validate(a, b, m, n);
  let total = 0;
  for (let k = m; k <= n; k++) total += a[k - 1] * b[k - 1];
  return total;
}

export function abelSum(a, b, m = 1, n = a.length, basis = 'global') {
  validate(a, b, m, n);
  if (!['global', 'local'].includes(basis)) throw new RangeError('未知部分和约定。');
  const prefix = [0];
  for (const x of a) prefix.push(prefix.at(-1) + x);
  const offset = basis === 'local' ? prefix[m - 1] : 0;
  const partial = prefix.map(x => x - offset);
  if (m === n + 1) return { value: 0, prefix, partial, terms: [], empty: true };
  const terms = [{ kind: 'terminal', k: n, value: partial[n] * b[n - 1] }];
  if (basis === 'global') terms.push({ kind: 'initial', k: m, value: -partial[m - 1] * b[m - 1] });
  for (let k = m; k < n; k++) {
    terms.push({ kind: 'difference', k, value: partial[k] * (b[k - 1] - b[k]) });
  }
  return { value: terms.reduce((s, t) => s + t.value, 0), prefix, partial, terms, empty: false };
}

function rectangle(kind, k, x0, x1, y0, y1, coefficient = 1) {
  return { kind, k, x0, x1, y0, y1, coefficient, area: coefficient * (x1 - x0) * (y1 - y0) };
}

export function areaModel(a, b, m = 1, n = a.length, basis = 'global') {
  const abel = abelSum(a, b, m, n, basis);
  const left = [], right = [];
  if (!abel.empty) {
    for (let k = m; k <= n; k++) {
      left.push(rectangle('strip', k, abel.partial[k - 1], abel.partial[k], 0, b[k - 1]));
    }
    right.push(rectangle('terminal', n, 0, abel.partial[n], 0, b[n - 1]));
    if (basis === 'global') right.push(rectangle('initial', m, 0, abel.partial[m - 1], 0, b[m - 1], -1));
    for (let k = m; k < n; k++) {
      right.push(rectangle('difference', k, 0, abel.partial[k], b[k], b[k - 1]));
    }
  }
  return { ...abel, direct: directSum(a, b, m, n), left, right };
}

export function generate({ count, aKind, alpha, delta, bKind, beta, step, ratio }) {
  if (!Number.isInteger(count) || count < 0 || count > 12) throw new RangeError('项数须为 0 至 12。');
  if (!['arithmetic', 'alternating'].includes(aKind) || !['arithmetic', 'geometric', 'reciprocal'].includes(bKind)) {
    throw new RangeError('未知数列类型。');
  }
  if (![alpha, delta, beta, step, ratio].every(Number.isFinite)) throw new RangeError('参数须为有限数。');
  const a = Array.from({ length: count }, (_, j) => aKind === 'alternating' ? alpha * (-1) ** j : alpha + delta * j);
  const b = Array.from({ length: count }, (_, j) => bKind === 'geometric' ? beta * ratio ** j : bKind === 'reciprocal' ? beta / (j + 1) : beta + step * j);
  validate(a, b, 1, count);
  return { a, b };
}

export function parseSequence(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/[\s,，]+/);
  if (!parts.every(x => /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(x))) {
    throw new RangeError('用逗号或空格分隔十进制数，支持科学记数法。');
  }
  return parts.map(Number);
}
