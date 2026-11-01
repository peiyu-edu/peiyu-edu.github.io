import {analyze, residue, ring, powerMod} from './math.mjs';

const $ = id => document.getElementById(id);
const fields = ['m', 'a', 'b', 'operation', 'shift'];
let state, revealed = false;
const svgNS = 'http://www.w3.org/2000/svg';
function element(tag, attrs, content) {
  const node = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (content !== undefined) node.textContent = content;
  return node;
}

function draw() {
  const {m, group, orbit} = state;
  const svg = $('wheel');
  svg.replaceChildren();
  svg.append(element('title', {id: 'wheel-title'}, `模 ${m} 的余数轮盘`));
  svg.append(element('desc', {id: 'wheel-desc'}, revealed
    ? '绿色为单位，橙色箭头为幂轨道，当前幂的余数有橙色外圈。精确值和轨道列在下方。'
    : '绿色为单位，其余点为非单位。预测验证后才显示幂轨道。'));
  const defs = element('defs', {}), marker = element('marker', {id:'arrow', viewBox:'0 0 10 10', refX:9, refY:5, markerWidth:5, markerHeight:5, orient:'auto-start-reverse'});
  marker.append(element('path', {d:'M 0 0 L 10 5 L 0 10 z'}));
  defs.append(marker); svg.append(defs, element('circle', {cx:260,cy:260,r:196,class:'rim'}));
  const point = r => [260 + 196 * Math.sin(2*Math.PI*r/m), 260 - 196 * Math.cos(2*Math.PI*r/m)];
  if (revealed) {
    const sequence = [...orbit.values, orbit.repeated];
    for (let i=1; i<sequence.length; i++) {
      const [x,y] = point(sequence[i-1]), [u,v] = point(sequence[i]);
      const length = Math.hypot(u-x,v-y), inset = Math.min(8,length/3);
      const d = length === 0 ? `M ${x-5} ${y} c -24 -35 34 -35 10 0`
        : `M ${x+(u-x)*inset/length} ${y+(v-y)*inset/length} L ${u-(u-x)*inset/length} ${v-(v-y)*inset/length}`;
      svg.append(element('path', {d,class:'trail','marker-end':'url(#arrow)'}));
    }
  }
  const current = revealed ? powerMod(state.base, Number($('exponent').value), m) : null;
  for (let r=0; r<m; r++) {
    const [cx,cy] = point(r), isUnit = group.includes(r);
    svg.append(element('circle', {cx,cy,r:m>60?3:5,class:`node${isUnit?' unit':''}${r===current?' active':''}`}));
    // All states remain drawn; a sparse label set keeps large moduli legible.
    const nearCurrent = current!==null && Math.min((r-current+m)%m,(current-r+m)%m)<Math.ceil(m/48);
    if (m<=30 || r===current || (r%Math.ceil(m/24)===0 && !nearCurrent)) {
      const [x,y] = [260+(cx-260)*1.115,260+(cy-260)*1.115];
      svg.append(element('text', {x,y}, r));
    }
  }
  svg.append(element('text', {x:260,y:250,class:'center'}, `mod ${m}`));
  svg.append(element('text', {x:260,y:285}, `${m} 个余数 / ${group.length} 个单位`));
}

function updatePower() {
  const k = Number($('exponent').value);
  $('power-result').textContent = `k = ${k}：${state.base}^${k} ≡ ${powerMod(state.base,k,state.m)} (mod ${state.m})`;
  $('previous').disabled = k===0;
  $('next').disabled = k===Number($('exponent').max);
  draw();
}

function refresh() {
  revealed = false;
  state = null;
  $('results').hidden = true;
  for (const id of ['feedback','classification','orbit','roots','power-result','explanation']) $(id).textContent = '';
  $('prediction').value = '';
  const invalid = fields.find(id => !$(id).checkValidity());
  $('error').textContent = invalid ? '请输入范围内的整数：m 为 2 至 120；a、b 为 −1000000 至 1000000；q 为 −100 至 100。' : '';
  $('prediction-form').querySelector('button').disabled = Boolean(invalid);
  if (invalid) {
    $('wheel').replaceChildren();
    for (const id of ['ring-result','representatives','unit-list']) $(id).textContent = '';
    return;
  }
  const m = Number($('m').value), a = Number($('a').value), b = Number($('b').value), q = Number($('shift').value);
  state = analyze(a,m);
  const operation = $('operation').value;
  $('ring-result').textContent = `${a} ≡ ${state.base}，${b} ≡ ${residue(b,m)} (mod ${m})；${a} ${operation==='add'?'+':'×'} ${b} ≡ ${ring(a,b,m,operation)} (mod ${m})。`;
  $('representatives').textContent = `完全剩余系（q=${q}）：{${Array.from({length:m},(_,r)=>q*m+r).join(', ')}}；依次对应余数 0 至 ${m-1}。`;
  $('unit-list').textContent = `单位群 U(${m}) = {${state.group.join(', ')}}；φ(${m}) = ${state.phi}。`;
  $('exponent').value = '0';
  $('exponent').max = String(2*m);
  draw();
}

$('prediction-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!state) return;
  const choice = $('prediction').value;
  if (!choice) {
    $('feedback').textContent = '请先选择一个预测。';
    return;
  }
  revealed = true;
  const correct = !state.unit ? 'nonunit' : state.primitive ? 'yes' : 'no';
  $('feedback').textContent = choice===correct ? '预测正确。现在用轨道核对原因。' : '预测需要调整。请核对互素条件和轨道覆盖范围。';
  $('results').hidden = false;
  const {base,m,orbit,order,phi,roots} = state;
  $('classification').textContent = !state.unit ? `gcd(${base},${m}) ≠ 1：不是单位，乘法阶未定义。` : `ord_${m}(${base}) = ${order}，φ(${m}) = ${phi}；${state.primitive?'是原根':'不是原根'}。`;
  $('orbit').textContent = `首次重复前的幂序列（从 k=0 起）：${orbit.values.join(' → ')} → ${orbit.repeated}（重复）；前段长度 ${orbit.preperiod}，周期长度 ${orbit.period}。`;
  $('roots').textContent = roots.length ? `模 ${m} 的全部原根：{${roots.join(', ')}}。` : `模 ${m} 无原根：已逐一检查全部 ${phi} 个单位，没有一个的阶等于 ${phi}。`;
  $('explanation').textContent = !state.unit
    ? '若 a 的某个正整数次幂同余于 1，则 a 乘以低一次幂就是 1，a 必可逆，与非单位矛盾。因此这里不寻找乘法阶；只观察有限状态的前段和循环。'
    : `逆元保证轨道回到 1，首次返回需要 ${order} 步。此前各幂互异，故生成的子群恰有 ${order} 个元素。${state.primitive?'它的大小等于单位群大小，覆盖全部单位。':'它的大小小于单位群大小，未覆盖全部单位。'}`;
  updatePower();
});
for (const id of fields) $(id).addEventListener('input', refresh);
$('prediction').addEventListener('change', () => {
  revealed = false;
  $('results').hidden = true;
  for (const id of ['feedback','classification','orbit','roots','power-result','explanation']) $(id).textContent = '';
  if (state) draw();
});
$('exponent').addEventListener('input', updatePower);
for (const [id,delta] of [['previous',-1],['next',1]]) $(id).addEventListener('click', () => {
  $('exponent').value = String(Number($('exponent').value)+delta);
  updatePower();
});
for (const button of document.querySelectorAll('[data-m]')) button.addEventListener('click', () => {
  $('m').value = button.dataset.m;
  $('a').value = button.dataset.a;
  refresh();
});
$('reset').addEventListener('click', () => {
  for (const [id,value] of Object.entries({m:7,a:3,b:5,operation:'add',shift:0})) $(id).value = value;
  refresh();
});
$('theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'light' : 'dark';
});
refresh();
