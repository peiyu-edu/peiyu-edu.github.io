export const MAX_DIGITS = 100;
export const MAX_PRIME = 1_000_000;

export function floorState(x) {
  if (typeof x !== 'number' || !Number.isFinite(x) || Math.abs(x) > 6) {
    throw new RangeError('x 必须是 −6 到 6 之间的有限实数。');
  }
  const floor = Math.floor(x) || 0;
  return { x: x || 0, floor, trunc: Math.trunc(x) || 0, fraction: x - floor };
}

export function parseNatural(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('n 的 Number 输入必须是非负安全整数。');
    value = String(value);
  } else if (typeof value === 'bigint') value = String(value);
  if (typeof value !== 'string' || !/^\d{1,100}$/.test(value)) {
    throw new RangeError('n 必须是 1 到 100 位十进制非负整数，不用小数或科学记数法。');
  }
  return BigInt(value);
}

export function isPrime(p) {
  if (!Number.isSafeInteger(p) || p < 2 || p > MAX_PRIME) return false;
  for (let d = 2; d * d <= p; d += 1) if (p % d === 0) return false;
  return true;
}

export function legendre(nValue, p) {
  const n = parseNatural(nValue);
  if (!isPrime(p)) throw new RangeError('p 必须是 2 到 1 000 000 之间的素数。');
  const base = BigInt(p);
  let quotient = n;
  let power = 1n;
  let total = 0n;
  const rows = [];
  // Repeated division strictly decreases a positive quotient; BigInt avoids overflow.
  do {
    quotient /= base;
    power *= base;
    rows.push({ power, count: quotient });
    total += quotient;
  } while (quotient > 0n);
  return { n, p, total, rows };
}

export function parsePrediction(text) {
  if (typeof text !== 'string' || !/^-?\d{1,101}$/.test(text.trim())) return null;
  return BigInt(text.trim());
}
