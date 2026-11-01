import {model,state,point,chord,add,sub,mul} from './math.mjs';
const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
let current;
const fmt=n=>Number(n).toFixed(4);
function node(tag,attrs={},text='') {const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,v);n.textContent=text;return n;}
function configure() {
  const k=$('kind').value;
  Object.assign($('ecc'),k==='ellipse'?{min:.15,max:.95,step:.01,value:.6}:k==='hyperbola'?{min:1.1,max:2.5,step:.01,value:1.5}:{min:1,max:1,step:1,value:1});
  $('ecc').disabled=k==='parabola';$('branch').disabled=k!=='hyperbola';
  Object.assign($('param'),k==='ellipse'?{min:-180,max:180,step:1,value:55}:{min:-2,max:2,step:.02,value:.7});
  // Hyperbolic values limited to keep both branches readable.
  if(k==='hyperbola') Object.assign($('param'),{min:-1.3,max:1.3});
  $('focus').value='0';$('focus').disabled=k==='parabola';
  $('focus').options[0].textContent=k==='parabola'?'F（唯一焦点）':'F₁（左焦点）';
}
function update() {
  $('feedback').textContent='';$('answer').value='';$('readout').textContent='核对预测后显示精确距离与光路坐标。';
  for(const [id,out] of [['scale','scale-value'],['ecc','ecc-value'],['param','param-value'],['angle','angle-value']]) $(out).textContent=$(id).value;
  const m=model($('kind').value,+$('scale').value,+$('ecc').value), t=+$('param').value*(m.kind==='ellipse'?Math.PI/180:1);
  const s=state(m,t,+$('branch').value,+$('focus').value), ch=chord(m,+$('angle').value*Math.PI/180,+$('focus').value);
  current={m,s,ch};
  $('status').textContent=!m.ok?m.reason:!s.ok?s.reason:!ch.ok?ch.reason:ch.infinite?'此方向只有一个有限交点；另一端在无穷远，不定义有限弦长。':'两个有限交点已计算；图窗外端点仅裁剪，不改变坐标。';
  if(m.ok&&s.ok) draw(m,s,ch);else $('plot').replaceChildren(node('title',{},'参数无效，图形暂停'));
}
function draw(m,s,ch) {
  const svg=$('plot');svg.replaceChildren(node('title',{id:'plot-title'},'圆锥曲线、切法线与单次反射'),node('desc',{id:'plot-desc'},'P 为反射点，F 为焦点；实线箭头表示实际传播，虚线表示反向延长。'));
  const defs=node('defs'),clip=node('clipPath',{id:'window'});clip.append(node('rect',{x:30,y:30,width:660,height:440}));defs.append(clip);svg.append(defs);
  const extent=Math.max(m.s*3,Math.abs(s.P[0])*1.3,Math.abs(s.P[1])*1.6,...m.directrices.map(Math.abs),m.c||m.s)*1.15;
  const scale=Math.min(620/(2*extent),400/(2*extent));
  const screen=P=>[360+P[0]*scale,250-P[1]*scale], g=node('g',{'clip-path':'url(#window)'});svg.append(g);
  const line=(A,B,cls,width=2)=>{const a=screen(A),b=screen(B);g.append(node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:cls,'stroke-width':width}));};
  const ray=(A,B,cls)=>{line(A,B,cls,3);const a=screen(A),b=screen(B),dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);if(n<1)return;const x=a[0]+.68*dx,y=a[1]+.68*dy,u=[dx/n,dy/n];g.append(node('path',{d:`M${x-9*u[0]+5*u[1]},${y-9*u[1]-5*u[0]} L${x},${y} L${x-9*u[0]-5*u[1]},${y-9*u[1]+5*u[0]}`,class:cls,fill:'none','stroke-width':3}));};
  line([-extent,0],[extent,0],'guide');line([0,-extent],[0,extent],'guide');
  for(const d of m.directrices)line([d,-extent],[d,extent],'guide');
  const path=(branch)=>{let d='';for(let i=0;i<=360;i++){const t=m.kind==='ellipse'?2*Math.PI*i/360:m.kind==='hyperbola'?-3+6*i/360:-5+10*i/360;const p=screen(point(m,t,branch));d+=`${i?'L':'M'}${p[0]},${p[1]} `;}g.append(node('path',{d,class:'curve',fill:'none','stroke-width':2.5}));};path(1);if(m.kind==='hyperbola')path(-1);
  if(ch.ok) line(add(ch.F,mul(ch.v,-3*extent)),add(ch.F,mul(ch.v,3*extent)),'chord');
  line(add(s.P,mul(s.tangent,-extent)),add(s.P,mul(s.tangent,extent)),'tangent');
  line(add(s.P,mul(s.normal,-extent*.4)),add(s.P,mul(s.normal,extent*.4)),'normal');
  line(s.P,[s.d,s.P[1]],'guide');line(s.P,s.F,'guide');
  const travel=extent*.8;
  ray(m.kind==='parabola'?add(s.P,[travel,0]):m.F1,s.P,'incoming');
  ray(s.P,add(s.P,mul(s.outgoing,travel)),'outgoing');
  if(m.kind==='hyperbola')line(s.P,m.F2,'extension',3);
  const labelBoxes=[];
  const dot=(P,label)=>{
    const [x,y]=screen(P);if(x<35||x>685||y<35||y>465)return;
    g.append(node('circle',{cx:x,cy:y,r:4,fill:'var(--fg)'}));
    const text=node('text',{},label);svg.append(text);
    let chosen=false;
    for(const [dx,dy] of [[8,-12],[8,28],[-48,-12],[-48,28],[8,-44],[8,60],[-80,-12],[-80,60]]) {
      text.setAttribute('x',Math.min(650,Math.max(35,x+dx)));text.setAttribute('y',Math.min(460,Math.max(70,y+dy)));
      const b=text.getBBox();
      if(b.x+b.width>700||b.y<35||b.y+b.height>475||labelBoxes.some(a=>b.x<a.x+a.width+4&&b.x+b.width+4>a.x&&b.y<a.y+a.height+4&&b.y+b.height+4>a.y))continue;
      labelBoxes.push({x:b.x,y:b.y,width:b.width,height:b.height});chosen=true;break;
    }
    // The coordinate marker stays exact; leaders associate labels offset from crowded vertices.
    if(chosen)g.append(node('line',{x1:x,y1:y,x2:+text.getAttribute('x'),y2:+text.getAttribute('y')-5,stroke:'var(--line)','stroke-width':.7}));
  };
  dot(m.F1,m.kind==='parabola'?'F':'F₁');if(m.F2)dot(m.F2,'F₂');dot(s.P,'P');
  if(ch.ok)ch.points.forEach((P,i)=>dot(P,`Q${i+1}`));
  svg.append(node('text',{x:35,y:32},'切线：黑/白实线；法线：灰实线'));
}
$('prediction').addEventListener('submit',ev=>{
  ev.preventDefault();const raw=$('answer').value.trim(),a=Number(raw),{m,s,ch}=current;
  if(!m.ok||!s.ok||s.lineDistance<=1e-12){$('feedback').textContent='当前状态无可用焦点距离，不判答。';return;}
  if(raw===''||!Number.isFinite(a)){$('feedback').textContent='请输入有限数值。';return;}
  const r=s.focusDistance;
  $('feedback').textContent=Math.abs(a-r)<=.02?'预测符合当前模型。':'请按 P 与所选焦点的坐标计算欧氏距离，再修正预测。';
  const len=ch.ok&&!ch.infinite?Math.hypot(...sub(ch.points[0],ch.points[1])):null;
  $('readout').textContent=`PF=${fmt(s.focusDistance)}；d=${fmt(s.lineDistance)}；比值=${fmt(r/s.lineDistance)}。P=(${s.P.map(fmt).join(', ')})；准线 x=${fmt(s.d)}。反射单位方向=(${s.outgoing.map(fmt).join(', ')})。${len===null?'无有限弦长。':`弦长=${fmt(len)}；两端 λ=${ch.roots.map(fmt).join(', ')}。`}`;
});
for(const id of ['scale','ecc','param','branch','focus','angle']) $(id).addEventListener('input',update);
$('kind').addEventListener('change',()=>{configure();update();});
$('theme').addEventListener('click',()=>{const root=document.documentElement;root.dataset.theme=(root.dataset.theme|| (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'))==='dark'?'light':'dark';});
configure();update();
