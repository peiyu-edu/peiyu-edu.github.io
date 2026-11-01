import {model,target,judge,weighted} from './math.mjs';
const $=id=>document.getElementById(id),ids=['alpha','beta','gamma'];
let q;
const fmt=x=>Math.abs(x)<1e-12?'0':x.toPrecision(7);
const pair=p=>'('+p.map(fmt).join(', ')+')';
function draw(){
 const [A,B,C]=q.vertices;
 const pts=q.valid?[...q.vertices,q.H,q.I,q.G,[0,0]]:[...q.vertices,[0,0]];
 const extentX=Math.max(1.25,...pts.map(p=>Math.abs(p[0]))),extentY=Math.max(1.25,...pts.map(p=>Math.abs(p[1])));
 const scale=Math.min(245/extentX,185/extentY),xy=p=>[300+scale*p[0],240-scale*p[1]];
 const ns='http://www.w3.org/2000/svg',g=$('drawing');g.replaceChildren();
 function el(tag,attrs,text){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;g.append(e);return e;}
 function line(p,r,cls){const [x1,y1]=xy(p),[x2,y2]=xy(r);el('line',{x1,y1,x2,y2,class:cls});}
 el('line',{x1:20,y1:240,x2:580,y2:240,class:'axis'});el('line',{x1:300,y1:20,x2:300,y2:460,class:'axis'});
 el('text',{x:567,y:230},'x');el('text',{x:310,y:24},'y');
 el('circle',{cx:300,cy:240,r:scale,class:'circle'});
 el('polygon',{points:[A,B,C].map(p=>xy(p).join(',')).join(' '),class:'triangle'});
 line([0,0],A,'vector');line([0,0],B,'vector');
 if(q.valid)for(const P of q.vertices)line(P,q.H,'altitude');
 const labels=[['A',A],['B',B],['C',C],['O',[0,0]]];
 if(q.valid)labels.push(['H',q.H],['I',q.I],['G',q.G]);
 const groups=[];
 for(const [name,p]of labels){const [x,y]=xy(p);el('circle',{cx:x,cy:y,r:4,class:['H','I','G'].includes(name)?'center':'vertex'});const same=groups.find(t=>Math.hypot(t.x-x,t.y-y)<28);if(same)same.names.push(name);else groups.push({x,y,names:[name]});}
 for(const t of groups){const label=t.names.join('/');el('text',{x:Math.min(578-label.length*11,Math.max(12,t.x+8)),y:Math.max(46,Math.min(453,t.y-10))},label);}
 $('scale').textContent=`圆的半径为 1；每单位约 ${scale.toFixed(1)} 个 SVG 像素，横纵比例相同。`;
}
function update(){
 q=model(...ids.map(id=>+$ (id).value));
 for(const id of ids)$(id+'-value').textContent=' '+$(id).value+'°';
 $('feedback').textContent='';$('feedback').removeAttribute('data-result');$('answer').value='';
 $('readout').textContent='核对预测后显示精确坐标、恒等式两侧与有向权重。';
 $('status').textContent=q.valid?(q.right?'直角三角形：中心权重采用不含 tan 的形式。':q.obtuse?'钝角三角形：观察中心在三角形外时的有向权重。':'锐角三角形：比较四种中心。'):q.reason;
 draw();
}
function reveal(){
 const [a,b,c]=q.vertices;
 const rows=[`A=${pair(a)}；B=${pair(b)}；C=${pair(c)}`,`OA⃗·OB⃗ = cos(β−α) = ${fmt(q.trig.dot)}`,`det(OA⃗,OB⃗) = sin(β−α) = ${fmt(q.trig.det)}`,`sin(α+β) = sin α cos β+cos α sin β = ${fmt(q.trig.sumSin)}`,`cos(α+β) = cos α cos β−sin α sin β = ${fmt(q.trig.sumCos)}`];
 if(q.valid){rows.push(`内角 A,B,C（°）= ${q.angles.map(x=>fmt(x*180/Math.PI)).join(', ')}`,`H=OA⃗+OB⃗+OC⃗=${pair(q.H)}；三角权重构造 H=${pair(weighted(q.vertices,q.weights.H))}`,`O=${pair(q.O)}；I=${pair(q.I)}；G=${pair(q.G)}`);for(const k of ['O','H','I','G'])rows.push(`${k} 的归一化权重 = [${q.weights[k].map(fmt).join(', ')}]`);rows.push(`外心加权顶点和 = ${pair(weighted(q.vertices,q.weights.O))}`);}else rows.push(q.reason);
 $('readout').textContent=rows.join('\n');
}
for(const id of [...ids,'task'])$(id).addEventListener('input',update);
$('presets').addEventListener('click',e=>{const angles=e.target.dataset.angles;if(!angles)return;angles.split(',').forEach((x,i)=>$(ids[i]).value=x);update();});
$('prediction').addEventListener('submit',e=>{e.preventDefault();const result=judge($('answer').value,target(q,$('task').value));$('feedback').textContent=result.text;$('feedback').dataset.result=result.kind;if(['correct','incorrect'].includes(result.kind))reveal();});
$('reset').addEventListener('click',()=>{[10,140,260].forEach((v,i)=>$(ids[i]).value=v);$('task').value='dot';update();});
$('theme').addEventListener('click',()=>{const root=document.documentElement;const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;root.dataset.theme=dark?'light':'dark';});
window.addEventListener('pageshow',update);update();
