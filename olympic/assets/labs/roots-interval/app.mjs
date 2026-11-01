import {analyze,evaluate} from './math.mjs';
const $=id=>document.getElementById(id);
const presets=[
  [1,0,-1,0,-2,2], [0,1,0,-1,-2,2], [0,1,-2,1,0,2],
  [1,-3,3,-1,0,2], [0,1,0,1,-2,2], [0,0,2,-2,1,3],
  [0,0,0,2,-2,2], [0,0,0,0,-2,2]
];
const specs=[['a','三次项系数 a',-8,8],['b','二次项系数 b',-8,8],['c','一次项系数 c',-8,8],['d','常数项 d',-8,8],['left','左端点 L',-6,6],['right','右端点 R',-6,6]];
for(const [id,label,min,max] of specs) {
  const box=document.createElement('div');box.className='slider';
  const lab=document.createElement('label');lab.htmlFor=id;lab.textContent=label+'：';
  const output=document.createElement('output');output.id=id+'-value';output.htmlFor=id;lab.append(output);
  const input=document.createElement('input');Object.assign(input,{id,type:'range',min:String(min),max:String(max),step:'0.25'});
  box.append(lab,input);$('controls').append(box);
}
const inputs=specs.map(([id])=>$(id));
let current=null,revealed=false;
const fmt=n=>Number.isFinite(n)?Number(n.toFixed(7)).toString():'无穷多';
function element(name,attrs,parent=$('plot')) {const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);parent.append(e);return e;}
function draw(coeff,L,R) {
  const svg=$('plot');svg.querySelectorAll(':not(title):not(desc)').forEach(e=>e.remove());
  const X=x=>38+(x+6)/12*524;
  const values=Array.from({length:601},(_,i)=>evaluate(coeff,-6+i/50));
  const ymax=Math.max(1,...values.map(Math.abs))*1.08,Y=y=>164-y/ymax*132;
  const shade=element('rect',{x:X(Math.min(L,R)),y:25,width:Math.abs(X(R)-X(L)),height:278,fill:'var(--shade)'});if(L>R)shade.setAttribute('fill','none');
  element('path',{d:`M38 164H562 M300 25V303`,stroke:'var(--border)',fill:'none'});
  element('path',{d:values.map((y,i)=>`${i?'L':'M'}${X(-6+i/50).toFixed(2)} ${Y(y).toFixed(2)}`).join(' '),stroke:'var(--line)','stroke-width':2.5,fill:'none'});
  for(const x of [-6,-3,0,3,6]) {const t=element('text',{x:X(x),y:326,'text-anchor':'middle',fill:'currentColor','font-size':16});t.textContent=x;}
  const scale=element('text',{x:42,y:20,fill:'currentColor','font-size':14});scale.textContent=`纵轴 ±${fmt(ymax)}`;
  for(const [x,closed,name]of [[L,$('lc').checked,'L'],[R,$('rc').checked,'R']]) {
    element('path',{d:`M${X(x)} 30V300`,stroke:'var(--accent)','stroke-dasharray':'5 4'});
    element('circle',{cx:X(x),cy:Y(evaluate(coeff,x)),r:5,stroke:'var(--accent)',fill:closed?'var(--accent)':'var(--panel)','stroke-width':2});
    const t=element('text',{x:X(x)+(name==='L'?-5:5),y:name==='L'?45:65,'text-anchor':name==='L'?'end':'start',fill:'var(--accent)','font-size':16});t.textContent=name;
  }
  if(revealed&&current)for(const r of current.roots.filter(r=>r.x>=-6&&r.x<=6))element('circle',{cx:X(r.x),cy:164,r:4,fill:'var(--line)'});
}
function refresh() {
  revealed=false;current=null;$('feedback').textContent='';$('result').hidden=true;$('result').textContent='';$('guess').value='';
  inputs.forEach(e=>$(e.id+'-value').textContent=e.value);
  const [a,b,c,d,L,R]=inputs.map(e=>Number(e.value)),coeff=[a,b,c,d];
  $('formula').textContent=`f(x) = (${a})x³ + (${b})x² + (${c})x + (${d})`;
  $('condition').textContent=`区间：${$('lc').checked?'[':'('}${L}, ${R}${$('rc').checked?']':')'}`;
  try {
    current=analyze(coeff,L,R,$('lc').checked,$('rc').checked);
    $('signs').textContent=`f(L) 的符号：${['负','零','正'][current.endpointSigns[0]+1]}；f(R) 的符号：${['负','零','正'][current.endpointSigns[1]+1]}。实际次数：${current.degree<0?'零多项式':current.degree}。`;
    $('check').disabled=false;
  }catch(e){$('signs').textContent=e.message+'；请调整端点后预测。';$('check').disabled=true;}
  draw(coeff,L,R);
}
function load() {inputs.forEach((e,i)=>e.value=presets[Number($('preset').value)][i]);$('lc').checked=true;$('rc').checked=true;refresh();}
for(const e of [...inputs,$('lc'),$('rc')])e.addEventListener('input',refresh);
$('preset').addEventListener('change',load);
$('theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.dataset.theme=dark?'light':'dark';});
$('prediction').addEventListener('submit',e=>{
  e.preventDefault();if(!current||$('guess').value==='')return;
  revealed=true;const correct=Number($('guess').value)===current.distinct;
  $('feedback').textContent=correct?'预测吻合。继续改变一个条件，检验你的理由。':'再看一次：端点符号仅给出部分信息，检查切触、穿越与端点归属。';
  $('result').hidden=false;
  const roots=current.kind==='zero'?'零多项式没有有限重数定义。':`全部实根（不限于所选区间；坐标为近似值）：${current.roots.map(r=>`${fmt(r.x)}（${r.multiplicity} 重）`).join('；')||'无'}。`;
  $('result').textContent=`区间内不同实根：${fmt(current.distinct)}；按重数计：${current.kind==='zero'?'不定义':current.total}。${roots}`;
  draw(inputs.slice(0,4).map(e=>Number(e.value)),Number($('left').value),Number($('right').value));
});
window.addEventListener('pageshow',refresh);load();
