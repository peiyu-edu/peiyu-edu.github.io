import { areaModel, generate, parseSequence } from './math.mjs';

const $ = id => document.getElementById(id);
const fmt = x => x === 0 ? '0' : Math.abs(x) < 0.0001 || Math.abs(x) >= 1e7 ? x.toExponential(6) : Number(x.toPrecision(9)).toString();
let a = [], b = [], model, revealed = false;
const names = { terminal: '末边界', initial: '起点扣除', difference: '差分横层', strip: '竖条' };

function invalidate() {
  revealed = false;
  $('answer').value = '';
  $('feedback').textContent = '';
  $('results').hidden = true;
  for (const id of ['direct-value', 'abel-value', 'residual-value', 'decomposition']) $(id).textContent = '';
}

function parameters() {
  const p = {};
  for (const id of ['count', 'alpha', 'delta', 'beta', 'step', 'ratio']) {
    p[id] = Number($(id).value);
    $(`${id}-value`).value = $(id).value;
  }
  p.aKind = $('a-kind').value;
  p.bKind = $('b-kind').value;
  return p;
}

function loadGenerated(resetInterval = false) {
  const p = parameters();
  ({ a, b } = generate(p));
  $('a-input').value = a.join(', ');
  $('b-input').value = b.join(', ');
  $('delta').disabled = p.aKind !== 'arithmetic';
  $('step').disabled = p.bKind !== 'arithmetic';
  $('ratio').disabled = p.bKind !== 'geometric';
  $('input-error').textContent = '';
  $('source-note').textContent = `当前为参数数列，共 ${a.length} 项。q = 0 时，等比列首项取 β，其余项取 0。`;
  updateInterval(resetInterval);
}

function updateInterval(reset = false) {
  const N = a.length;
  $('start').max = N + 1;
  const m = reset ? 1 : Math.max(1, Math.min(N + 1, Math.round(Number($('start').value) || 1)));
  const n = reset ? N : Math.max(m - 1, Math.min(N, Math.round(Number($('end').value) || 0)));
  $('start').value = m;
  $('end').value = n;
  $('end').min = m - 1;
  $('end').max = N;
  invalidate();
  render();
}

function node(tag, attrs = {}, content) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  if (content !== undefined) el.textContent = content;
  return el;
}

function draw(svg, rectangles, transform, focus) {
  svg.querySelectorAll('g').forEach(g => g.remove());
  const g = node('g');
  const { X, Y, lowX, highX, lowY, highY } = transform;
  g.append(node('line', { x1: X(lowX), y1: Y(0), x2: X(highX), y2: Y(0), class: 'axis' }));
  g.append(node('line', { x1: X(0), y1: Y(lowY), x2: X(0), y2: Y(highY), class: 'axis' }));
  for (const r of rectangles) {
    const x0 = X(r.x0), x1 = X(r.x1), y0 = Y(r.y0), y1 = Y(r.y1);
    const color = r.area > 0 ? 'pos' : r.area < 0 ? 'neg' : 'zero';
    const selected = r.k === focus;
    const shape = node('rect', { x: Math.min(x0, x1), y: Math.min(y0, y1), width: Math.abs(x1 - x0), height: Math.abs(y1 - y0), class: `area ${color}${selected ? ' focused' : ''}` });
    // A zero-width/height rectangle still needs a visible outline, without inventing area.
    if (x0 === x1 || y0 === y1) {
      g.append(node('line', { x1: x0, y1: y0, x2: x1, y2: y1, class: `area zero${selected ? ' focused' : ''}` }));
    } else g.append(shape);
    if (selected) {
      const direction = node('g', { class: 'direction' });
      for (const [u, v, s, t] of [[x0, y0, x1, y0], [x1, y0, x1, y1]]) {
        if (u === s && v === t) continue;
        direction.append(node('line', { x1: u, y1: v, x2: s, y2: t }));
        const angle = Math.atan2(t - v, s - u), len = Math.min(7, Math.hypot(s - u, t - v) / 3);
        direction.append(node('path', { d: `M ${s - len * Math.cos(angle - .5)} ${t - len * Math.sin(angle - .5)} L ${s} ${t} L ${s - len * Math.cos(angle + .5)} ${t - len * Math.sin(angle + .5)}` }));
      }
      g.append(direction);
    }
  }
  g.append(node('text', { x: 20, y: 26 }, `横轴 ${$('basis').value === 'global' ? 'A' : 'B'}；纵轴 b`));
  g.append(node('text', { x: 20, y: 325 }, `横向范围 ${fmt(lowX)} 至 ${fmt(highX)}`));
  g.append(node('text', { x: 20, y: 345 }, `纵向范围 ${fmt(lowY)} 至 ${fmt(highY)}`));
  svg.append(g);
}

function render() {
  const m = Number($('start').value), n = Number($('end').value), basis = $('basis').value;
  model = areaModel(a, b, m, n, basis);
  $('formula').textContent = basis === 'global'
    ? 'Σₖ₌ₘⁿ aₖbₖ = Aₙbₙ − Aₘ₋₁bₘ + Σₖ₌ₘⁿ⁻¹ Aₖ(bₖ − bₖ₊₁)'
    : 'Σₖ₌ₘⁿ aₖbₖ = Bₙbₙ + Σₖ₌ₘⁿ⁻¹ Bₖ(bₖ − bₖ₊₁)';
  $('formula').hidden = model.empty;
  $('empty-note').textContent = model.empty ? '当前为空区间：不画矩形，不套用非空边界公式。' : `当前区间 [${m}, ${n}]；${basis === 'global' ? 'A₀ = 0，起点之前的项仍计入 A。' : 'Bₘ₋₁ = 0，横轴相对起点平移。'}`;
  $('focus').disabled = model.empty;
  $('focus').min = m;
  $('focus').max = Math.max(m, n);
  $('focus').value = Math.max(m, Math.min(n, Number($('focus').value)));
  const k = Number($('focus').value);
  $('focus-value').value = model.empty ? '空区间' : k;
  $('focus-note').textContent = model.empty ? '没有可选竖条。' : `高亮 k = ${k}：竖条有向宽 ${fmt(a[k - 1])}，有向高 ${fmt(b[k - 1])}。` + (k < n ? ` 对应横层从 bₖ₊₁ = ${fmt(b[k])} 走到 bₖ = ${fmt(b[k - 1])}。` : ' 这是末项，对应末边界；不再使用 bₙ₊₁。');
  $('boundary-note').textContent = model.empty ? '' : basis === 'global'
    ? `右图始终包含末边界，及系数 −1 的起点矩形（Aₘ₋₁ = ${fmt(model.prefix[m - 1])}，bₘ = ${fmt(b[m - 1])}）；重合时也须按系数算。箭头只标高亮下标。`
    : '右图包含末边界与差分横层；区间部分和的起点为零，无起点扣除矩形。箭头只标高亮下标。';
  const rs = [...model.left, ...model.right];
  const xs = [0, ...rs.flatMap(r => [r.x0, r.x1])], ys = [0, ...rs.flatMap(r => [r.y0, r.y1])];
  const lowX = Math.min(...xs), highX = Math.max(...xs), lowY = Math.min(...ys), highY = Math.max(...ys);
  const scale = Math.min(440 / Math.max(1, highX - lowX), 245 / Math.max(1, highY - lowY));
  const X = x => 260 + (x - (lowX + highX) / 2) * scale;
  const Y = y => 175 - (y - (lowY + highY) / 2) * scale;
  const transform = { X, Y, lowX, highX, lowY, highY };
  draw($('direct-plot'), model.left, transform, k);
  draw($('abel-plot'), model.right, transform, k);
  $('partial-heading').textContent = basis === 'global' ? 'Aₖ' : 'Bₖ';
  $('sequence-rows').replaceChildren();
  for (let j = 1; j <= a.length; j++) {
    const row = document.createElement('tr');
    if (j >= m && j <= n) row.className = 'active';
    // B is defined only from m - 1 onward; do not label earlier prefixes as B.
    for (const text of [j, fmt(a[j - 1]), fmt(b[j - 1]), basis === 'local' && j < m - 1 ? '—' : fmt(model.partial[j]), revealed && j >= m && j <= n ? fmt(a[j - 1] * b[j - 1]) : '待核对']) {
      const cell = document.createElement('td'); cell.textContent = text; row.append(cell);
    }
    $('sequence-rows').append(row);
  }
}

$('parameters').addEventListener('input', () => loadGenerated());
$('parameters').addEventListener('change', () => loadGenerated());
$('parameters').addEventListener('submit', e => e.preventDefault());
$('parameters').addEventListener('reset', () => { invalidate(); setTimeout(() => loadGenerated(true), 0); });
$('custom').addEventListener('submit', e => {
  e.preventDefault();
  try {
    const nextA = parseSequence($('a-input').value), nextB = parseSequence($('b-input').value);
    if (nextA.length !== nextB.length || nextA.length > 12 || ![...nextA, ...nextB].every(x => Number.isFinite(x) && Math.abs(x) <= 1000)) {
      throw new RangeError('两列须等长，最多 12 项，每项绝对值不超过 1000。');
    }
    a = nextA; b = nextB;
    $('input-error').textContent = '';
    $('source-note').textContent = `当前为自定义数列，共 ${a.length} 项。移动上方参数将重新生成两列。`;
    updateInterval(true);
  } catch (err) { $('input-error').textContent = err.message; }
});
for (const id of ['start', 'end']) $(id).addEventListener('change', () => updateInterval());
$('basis').addEventListener('change', () => { invalidate(); render(); });
$('focus').addEventListener('input', render);
$('prediction').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('answer').value.trim();
  let guess;
  try { const parsed = parseSequence(text); if (parsed.length === 1) guess = parsed[0]; } catch { /* Invalid answers receive the same format feedback. */ }
  if (!Number.isFinite(guess)) {
    $('feedback').textContent = '请先输入一个有限数值。';
    return;
  }
  if (Math.abs(guess - model.direct) > 1e-7 * Math.max(1, Math.abs(model.direct))) {
    $('feedback').textContent = '还不吻合。检查求和上下标、起点扣除项，以及宽高的方向；负贡献不能取绝对值。';
    return;
  }
  revealed = true;
  $('feedback').textContent = '预测吻合。现在对照两种算法和每一块的有向贡献。';
  $('results').hidden = false;
  $('direct-value').textContent = fmt(model.direct);
  $('abel-value').textContent = fmt(model.value);
  $('residual-value').textContent = fmt(model.direct - model.value);
  $('decomposition').textContent = model.empty ? '空和：两种算法均返回 0，无边界取值。' : model.right.map(r => `${names[r.kind]} k=${r.k}：(${r.coefficient}) × (${fmt(r.x1 - r.x0)}) × (${fmt(r.y1 - r.y0)}) = ${fmt(r.area)}`).join('；');
  render();
});
$('theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
});
loadGenerated(true);
