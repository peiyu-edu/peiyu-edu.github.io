import {model,incident} from './math.mjs';
const $=s=>document.querySelector(s), ids=['a','b','px','py','angle','witness'];
const fmt=x=>Math.abs(x)<1e-10?'0':Math.abs(x)>1e5?x.toExponential(3):Number(x.toFixed(4)).toString();
const svg=$('#diagram'), NS='http://www.w3.org/2000/svg';
let current;
function add(tag,attrs={},text='') {const n=document.createElementNS(NS,tag); for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=text;svg.append(n);return n;}
const xy=p=>[300+45*p[0],250-45*p[1]];
function line(l,cls) {
  if(!l||Math.hypot(l[0],l[1])===0)return;
  const [a,b,c]=l, pts=[];
  for(const x of [-6,6])if(b!==0){const y=-(a*x+c)/b;if(y>=-4.8&&y<=4.8)pts.push([x,y]);}
  for(const y of [-4.8,4.8])if(a!==0){const x=-(b*y+c)/a;if(x>=-6&&x<=6)pts.push([x,y]);}
  const unique=pts.filter((p,i)=>!pts.slice(0,i).some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-9));
  if(unique.length>=2){const [p,q]=[xy(unique[0]),xy(unique[1])];add('line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],class:cls});}
}
function draw(m) {
  svg.querySelectorAll(':scope > :not(title):not(desc)').forEach(n=>n.remove());
  line([1,0,0],'axis');line([0,1,0],'axis');
  add('ellipse',{cx:300,cy:250,rx:45*m.a,ry:45*m.b,class:'conic'});
  line(m.l,'polar');line(m.reciprocal,'reciprocal');
  line([-m.u[1],m.u[0],m.u[1]*m.P[0]-m.u[0]*m.P[1]],'secant');
  const points=[{p:[0,0],name:'O',color:'var(--muted)'},{p:m.P,name:'P',color:'var(--purple)'}];
  if(m.Q)points.push({p:m.Q,name:'Q',color:'var(--orange)'});
  m.roots.forEach((t,i)=>points.push({p:[m.P[0]+t*m.u[0],m.P[1]+t*m.u[1]],name:m.kind==='tangent'?'A/B':i?'B':'A',color:'var(--blue)'}));
  m.tangencies.forEach((p,i)=>points.push({p,name:`T${i+1}`,color:'var(--purple)'}));
  if(m.D&&m.D[1]!==0){const t=m.D[0]/m.D[1];points.push({p:[m.P[0]+t*m.u[0],m.P[1]+t*m.u[1]],name:'D',color:'var(--purple)'});}
  const merged=[],omitted=[];
  for(const p of points){if(Math.abs(p.p[0])>6||Math.abs(p.p[1])>4.8){omitted.push(p.name);continue;}const q=merged.find(q=>Math.hypot(q.p[0]-p.p[0],q.p[1]-p.p[1])<1e-8);if(q)q.name+='/'+p.name;else merged.push({...p});}
  const boxes=[];
  for(const p of merged){const [x,y]=xy(p.p);add('circle',{cx:x,cy:y,r:4.5,fill:p.color});const label=add('text',{},p.name);
    let best=null;
    for(const [dx,dy]of [[9,-9],[9,23],[-60,-9],[-60,23],[9,-29],[-60,43],[9,43],[-60,-29]]){
      label.setAttribute('x',Math.min(540,Math.max(8,x+dx)));label.setAttribute('y',Math.min(480,Math.max(20,y+dy)));
      let b=label.getBBox();if(b.x+b.width>590)label.setAttribute('x',590-b.width);b=label.getBBox();
      const score=boxes.filter(r=>!(b.x>r.x+r.width+3||b.x+b.width+3<r.x||b.y>r.y+r.height+3||b.y+b.height+3<r.y)).length;
      if(!best||score<best.score)best={x:label.getAttribute('x'),y:label.getAttribute('y'),score};if(score===0)break;
    }
    label.setAttribute('x',best.x);label.setAttribute('y',best.y);boxes.push(label.getBBox());
  }
  $('#clipped').textContent=`固定同尺度窗口 x∈[−6,6]，y∈[−4.8,4.8]。${omitted.length?'窗外点未画：'+omitted.join('、')+'；坐标未夹到边界。':''}${m.D&&m.D[1]===0?'D 在无穷远，不画有限点。':''}`;
}
function parameters(){const v=Object.fromEntries(ids.map(id=>[id,Number($('#'+id).value)]));if($('#shape').value==='circle')v.b=v.a;return v;}
function update() {
  const p=parameters();$('#b').disabled=$('#shape').value==='circle';if($('#b').disabled)$('#b').value=p.b;
  for(const id of ids)$('#'+id+'-value').textContent=fmt(p[id]);
  current=model(p);$('#witness').disabled=current.infinity;draw(current);
  $('#status').textContent=current.infinity?'polar(P) 是无穷远直线 z=0，仿射窗口内不画有限极线。':'polar(P)：'+fmt(current.l[0])+'x + '+fmt(current.l[1])+'y + '+fmt(current.l[2])+' = 0';
  $('#geometry').textContent=`P=(${fmt(p.px)}, ${fmt(p.py)})。`+(current.Q?`Q=(${fmt(current.Q[0])}, ${fmt(current.Q[1])}) 位于紫色极线上；橙线是 polar(Q)，经过 P。`:'无穷远极线上没有有限见证点 Q。');
  $('#feedback').textContent='';$('#result').hidden=true;$('#result').textContent='';$('#proof').hidden=true;$('#proof').open=false;$('#answer').value='';$('#answer-kind').value='number';$('#answer').disabled=false;
  svg.dataset.kind=current.kind;document.body.dataset.ready='true';
}
$('#controls').addEventListener('input',update);$('#controls').addEventListener('change',update);
$('#controls').addEventListener('reset',()=>setTimeout(update,0));
for(const b of document.querySelectorAll('[data-preset]')) b.addEventListener('click',()=>{
  const presets={center:[0,0,0],inside:[1,0,0],on:[2,0,0],outside:[3,0,0],tangent:[2,0,90],miss:[3,0,90],midpoint:[1,0,90]};
  $('#shape').value='circle';$('#a').value='2';$('#witness').value='0';
  const [x,y,t]=presets[b.dataset.preset];$('#px').value=x;$('#py').value=y;$('#angle').value=t;update();
});
$('#answer-kind').addEventListener('change',()=>{$('#answer').disabled=$('#answer-kind').value==='undefined';$('#feedback').textContent='';$('#result').hidden=true;$('#proof').hidden=true;$('#proof').open=false;});
$('#answer').addEventListener('input',()=>{$('#feedback').textContent='';$('#result').hidden=true;$('#proof').hidden=true;$('#proof').open=false;});
$('#prediction').addEventListener('submit',e=>{
  e.preventDefault(); const r=current.ratio, kind=$('#answer-kind').value;
  if(kind==='number'&&($('#answer').value.trim()===''||!Number.isFinite(Number($('#answer').value)))){$('#feedback').textContent='请先输入一个有限实数，或选择无定义。';$('#feedback').className='bad';return;}
  const correct=r.defined?kind==='number'&&Math.abs(Number($('#answer').value)-r.value)<=0.02:kind==='undefined';
  $('#feedback').className=correct?'ok':'bad';$('#feedback').textContent=correct?'预测正确。请对照下面的推导。':'预测还需调整。请检查两实交点、四点互异与有向比。';
  $('#result').hidden=false;$('#proof').hidden=false;
  $('#result').textContent=(r.defined?`当前交比 = ${fmt(r.value)}。`:`当前交比无定义：${r.reason}。`)+`P ${ {inside:'在椭圆内部',on:'在椭圆上',outside:'在椭圆外部'}[current.position]}；实切点数 ${current.tangencies.length}。`+(current.Q?`互易残差 |polar(Q)ᵀP|=${fmt(Math.abs(incident(current.reciprocal,current.P)))}。`:'')+(current.D&&current.D[1]!==0?`D 的直线参数 t=${fmt(current.D[0]/current.D[1])}。`:'');
});
$('#theme').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'light':'dark';});
update();
