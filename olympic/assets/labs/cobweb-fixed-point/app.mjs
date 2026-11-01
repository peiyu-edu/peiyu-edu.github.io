import { defaults, orbit, value, exact, functionValue, classify, labels, fixedPoints } from './math.mjs';
const $ = id => document.getElementById(id);
const fields = ['Q', 'B', 'X', 'C', 'steps'];
const config = () => Object.fromEntries([['family', $('family').value], ...fields.map(k => [k, Number($(k).value)])]);
const fmt = x => Number.isInteger(x) ? String(x) : Number(x.toPrecision(8)).toString();
function update() {
  const c = config();
  for (const k of fields) $(`${k}-out`).textContent = fmt(c[k] / ({ Q: 10, B: 10, X: 20, C: 4 }[k] || 1));
  document.querySelectorAll('[data-family]').forEach(el => { el.hidden = el.dataset.family !== c.family; });
  $('formula').textContent = c.family === 'affine' ? `xₙ₊₁=(${fmt(c.Q / 10)})xₙ+(${fmt(c.B / 10)})；x₀=${fmt(c.X / 20)}；定义域 ℝ。`
    : c.family === 'inverse' ? `xₙ₊₁=(${fmt(c.C / 4)})/xₙ；x₀=${fmt(c.X / 20)}；当前值不能为 0。`
      : `xₙ₊₁=xₙ/(1+xₙ)；x₀=${fmt(c.X / 20)}；当前值不能为 −1。`;
  $('results').hidden = true; $('terms').replaceChildren(); $('plot').querySelectorAll('g,defs').forEach(el => el.remove());
  $('feedback').textContent = ''; $('guess').value = '';
}
const NS = 'http://www.w3.org/2000/svg';
function element(tag, attrs, text) {
  const el = document.createElementNS(NS, tag);
  for (const [key, v] of Object.entries(attrs)) el.setAttribute(key, v);
  if (text !== undefined) el.textContent = text;
  return el;
}
function draw(c, terms) {
  const svg = $('plot'); svg.querySelectorAll('g,defs').forEach(el => el.remove());
  const defs = element('defs', {}), clip = element('clipPath', { id: 'window' });
  clip.append(element('rect', { x: 32, y: 18, width: 348, height: 348 })); defs.append(clip); svg.append(defs);
  const px = x => 206 + 43.5 * x, py = y => 192 - 43.5 * y;
  const g = element('g', { 'clip-path': 'url(#window)' });
  const line = (a, b, cls, more = {}) => g.append(element('line', { x1: px(a[0]), y1: py(a[1]), x2: px(b[0]), y2: py(b[1]), class: cls, 'stroke-width': 1.8, ...more }));
  line([-4, 0], [4, 0], 'axis'); line([0, -4], [0, 4], 'axis'); line([-4, -4], [4, 4], 'axis', { 'stroke-dasharray': '5 5' });
  let prev = null;
  for (let i = 0; i <= 1600; i++) {
    const x = -4 + i / 200, y = functionValue(c, x);
    const pole = c.family === 'inverse' ? 0 : c.family === 'mobius' ? -1 : null;
    if (prev && y !== null && Number.isFinite(y) && !(pole !== null && prev[0] <= pole && x >= pole)) line(prev, [x, y], 'curve');
    prev = y === null || !Number.isFinite(y) ? null : [x, y];
  }
  for (let n = 0; n < terms.length - 1; n++) {
    const x = value(terms[n]), y = value(terms[n + 1]);
    line([x, n === 0 ? 0 : x], [x, y], 'web'); line([x, y], [y, y], 'web');
  }
  for (const point of fixedPoints(c).points) g.append(element('circle', { cx: px(point.x), cy: py(point.x), r: 4, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 2 }));
  svg.append(g);
  const marks = element('g', {});
  for (const x of [-4, -2, 0, 2, 4]) marks.append(element('text', { x: px(x), y: 385, 'text-anchor': 'middle' }, String(x)));
  for (const y of [-4, -2, 0, 2, 4]) marks.append(element('text', { x: 26, y: py(y) + 4, 'text-anchor': 'end' }, String(y)));
  marks.append(element('text', { x: 389, y: 208 }, 'x'), element('text', { x: 213, y: 13 }, 'y')); svg.append(marks);
}
$('prediction').addEventListener('submit', event => {
  event.preventDefault();
  if (!$('guess').value) { $('feedback').textContent = '请先选择一个判断。'; return; }
  const c = config(), result = classify(c), run = orbit(c);
  $('feedback').textContent = $('guess').value === result.kind ? '判断正确。请核对下面的解析理由。' : '需要修正。请比较当前初值、定义域与解析理由。';
  $('conclusion').textContent = labels[result.kind] + (result.limit === undefined ? '' : `；极限为 ${fmt(result.limit)}。`);
  $('reason').textContent = result.reason;
  const fp = fixedPoints(c);
  $('fixed').textContent = fp.all ? '每个实数都是不动点（整条 y=x）。' : fp.points.length
    ? '定义域内不动点：' + fp.points.map(p => `L≈${fmt(p.x)}，f′(L)=${fmt(p.slope)}`).join('；') + '。导数的局部含义见下方说明。'
    : '定义域内没有实不动点。';
  $('finite-note').textContent = run.undefinedAt !== null ? `递推在 x${run.undefinedAt} 失去定义，后续不再绘制。`
    : `这里只计算到 x${c.steps}；有限步不构成证明。${result.undefinedAt ? `解析式预告 x${result.undefinedAt} 失去定义（可增加步数观察）。` : ''}`;
  $('terms').replaceChildren();
  for (const [n, r] of run.terms.entries()) {
    const row = document.createElement('tr');
    for (const text of [String(n), exact(r), fmt(value(r))]) { const td = document.createElement('td'); td.textContent = text; row.append(td); }
    $('terms').append(row);
  }
  draw(c, run.terms); $('results').hidden = false;
});
for (const id of ['family', ...fields]) $(id).addEventListener('input', update);
$('reset').addEventListener('click', () => { for (const [key, val] of Object.entries(defaults)) $(key).value = val; update(); });
$('theme').addEventListener('click', () => {
  const root = document.documentElement, dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
});
window.addEventListener('pageshow', update);
update();
