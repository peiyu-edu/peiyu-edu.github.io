export const MAX_MODULUS = 120;

function integer(value, name) {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${name}: safe integer required`);
  return value;
}

export function modulus(m) {
  integer(m, 'm');
  if (m < 2 || m > MAX_MODULUS) throw new RangeError(`2 <= m <= ${MAX_MODULUS}`);
  return m;
}

export function residue(a, m) {
  modulus(m);
  integer(a, 'a');
  return Number((BigInt(a) % BigInt(m) + BigInt(m)) % BigInt(m));
}

export function gcd(a, b) {
  integer(a, 'a');
  integer(b, 'b');
  let x = BigInt(a), y = BigInt(b);
  while (y !== 0n) [x, y] = [y, x % y];
  return Number(x < 0n ? -x : x);
}

export function powerMod(a, exponent, m) {
  modulus(m);
  integer(exponent, 'exponent');
  if (exponent < 0) throw new RangeError('exponent must be nonnegative');
  let b = BigInt(residue(a, m)), e = BigInt(exponent), r = 1n;
  const mod = BigInt(m);
  while (e > 0n) {
    if (e % 2n) r = r * b % mod;
    b = b * b % mod;
    e /= 2n;
  }
  return Number(r);
}

export function units(m) {
  modulus(m);
  return Array.from({length: m}, (_, a) => a).filter(a => gcd(a, m) === 1);
}

// Start at a^0; the first repeated residue closes the finite-state orbit.
export function powerOrbit(a, m) {
  const base = residue(a, m), seen = new Map(), values = [];
  let x = 1;
  while (!seen.has(x)) {
    seen.set(x, values.length);
    values.push(x);
    x = Number(BigInt(x) * BigInt(base) % BigInt(m));
  }
  const preperiod = seen.get(x);
  return {values, repeated: x, preperiod, period: values.length - preperiod};
}

export function order(a, m) {
  const base = residue(a, m);
  if (gcd(base, m) !== 1) return null;
  return powerOrbit(base, m).period;
}

export function primitiveRoots(m) {
  const group = units(m);
  return group.filter(a => order(a, m) === group.length);
}

export function ring(a, b, m, operation) {
  const x = BigInt(residue(a, m)), y = BigInt(residue(b, m));
  if (!['add', 'multiply'].includes(operation)) throw new RangeError('unknown operation');
  return Number((operation === 'add' ? x + y : x * y) % BigInt(m));
}

export function analyze(a, m) {
  const base = residue(a, m), group = units(m), orbit = powerOrbit(base, m);
  const unit = gcd(base, m) === 1, multiplicativeOrder = unit ? orbit.period : null;
  return {base, m, group, phi: group.length, orbit, unit, order: multiplicativeOrder,
    roots: primitiveRoots(m), primitive: unit && multiplicativeOrder === group.length};
}
