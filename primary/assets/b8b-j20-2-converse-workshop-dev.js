/* j20-2 only. Page-memory workshops; no learning-record or mastery schema. */
(function () {
  'use strict';
  function rational(n, d = 1n) {
    if (d === 0n) throw Error('分母不能为零；暂未核对，请改写。');
    if (d < 0n) { n = -n; d = -d; }
    let a = n < 0n ? -n : n, b = d;
    while (b) { const t = a % b; a = b; b = t; }
    return {n: n / a, d: d / a};
  }
  function parse(source) {
    if (typeof source !== 'string' || source.length > 120) throw Error('输入过长，暂未核对。');
    const parts = source.trim().split('/').map(s => s.trim());
    const decimal = s => {
      if (!/^[+-]?(?:\d{1,9}(?:\.\d{1,6})?|\.\d{1,6})$/.test(s)) throw Error('格式暂未核对：用ASCII整数、小数或分数；每个数字词元写完整，仅斜线两侧可留空白。整数部至多9位，小数至多6位。');
      const k = (s.split('.')[1] || '').length;
      return rational(BigInt(s.replace('.', '')), 10n ** BigInt(k));
    };
    if (parts.length > 2) throw Error('只支持一个分数斜线，暂未核对。');
    const a = decimal(parts[0]), b = parts.length === 2 ? decimal(parts[1]) : rational(1n);
    return rational(a.n * b.d, a.d * b.n);
  }
  const add = (a,b) => rational(a.n*b.d+b.n*a.d,a.d*b.d);
  const sub = (a,b) => rational(a.n*b.d-b.n*a.d,a.d*b.d);
  const square = a => rational(a.n*a.n,a.d*a.d);
  const compare = (a,b) => { const v = a.n*b.d-b.n*a.d; return v < 0n ? -1 : v > 0n ? 1 : 0; };
  const number = a => Number(a.n) / Number(a.d);
  const show = a => a.d === 1n ? String(a.n) : `${a.n}/${a.d}`;
  function triangle(sides) {
    if (sides.length !== 3 || sides.some(a => a.n <= 0n)) return {kind:'nonpositive'};
    const order = [0,1,2].sort((i,j) => compare(sides[i],sides[j]));
    const [i,j,k] = order, bound = compare(add(sides[i],sides[j]),sides[k]);
    if (bound <= 0) return {kind:bound === 0 ? 'degenerate' : 'impossible'};
    const sum = add(square(sides[i]),square(sides[j])), largestSquare = square(sides[k]);
    const residual = sub(sum,largestSquare);
    return {kind:residual.n === 0n ? 'right' : 'nonright',sides,order,sum,largestSquare,residual,maximum:[0,1,2].filter(i=>compare(sides[i],sides[k])===0)};
  }
  function model(info) {
    if (!['right','nonright'].includes(info.kind)) throw Error('须先严格组成三角形。');
    const scale = number(info.sides[info.order[2]]), [a,b,c] = info.sides.map(x=>number(x)/scale);
    const x = ((b-a)*(b+a)+c*c)/(2*c), h2 = (b-x)*(b+x);
    return {a,b,c,scale,supported:Math.min(a,b,c)>=.05 && h2>=.02*.02};
  }
  function fit(m,p) {
    return Number.isFinite(p.x) && Number.isFinite(p.y) && p.y >= .02 && Math.abs(Math.hypot(p.x,p.y)-m.b)<=.002 && Math.abs(Math.hypot(p.x-m.c,p.y)-m.a)<=.002;
  }
  function angles(m,p) {
    return [Math.atan2(p.y,p.x),Math.atan2(p.y,m.c-p.x),Math.atan2(m.c*p.y,p.x*(p.x-m.c)+p.y*p.y)].map(v=>v*180/Math.PI);
  }
  function proofAnchors(values) {
    if (values.pythagoras !== 'forward') return '新三角形的平方等式须用已经证明的勾股定理。若用待证逆定理，或只靠量角，就没有给出这一步的依据。';
    if (values.positive !== 'lengths') return '平方相等后还要用两条线段长度都为正，才能取同一个正值。';
    if (values.congruence !== 'SSS') return '原三角形尚未证明有直角；这里已有三组对应边相等，应据SSS。不能先把原三角形当直角使用HL。';
    if (values.vertex !== 'C') return '请按BC↔B′C′、CA↔C′A′、AB↔A′B′核对应顶点，再找与C′对应的角。';
    return null;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {parse,number,show,triangle,model,fit,angles,proofAnchors};
  if (typeof document === 'undefined') return;
  const root = document.getElementById('j202-workshop');
  if (!root || document.body.dataset.sec !== 'j20-2') return;
  const $ = id => root.querySelector('#j202-'+id), rope = $('rope'), proof = $('proof');
  const field = (form,name) => form.elements.namedItem(name), value = (form,name) => field(form,name).value;
  const say = (id,text) => { $(id).textContent = text; };
  const fmt = n => n.toLocaleString('en-US',{useGrouping:false,maximumSignificantDigits:8});
  const svgNode = (svg,tag,attrs,text) => { const n = document.createElementNS('http://www.w3.org/2000/svg',tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v)); if(text !== undefined)n.textContent=text; svg.appendChild(n); return n; };
  const line = (svg,a,b,col='var(--fg)') => svgNode(svg,'line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:col,'stroke-width':3});
  const label = (svg,p,text,dy=-18) => svgNode(svg,'text',{x:p[0],y:p[1]+dy,fill:'var(--fg)','font-size':20,'text-anchor':'middle'},text);
  let info = null, shape = null, point = {x:0,y:.25}, operated = false, fitted = false, record = null;
  function clearRecord() {
    record = null; $('guess').disabled = true; say('measure-out',''); say('guess-out','');
  }
  function clearFit() {
    fitted = false; $('measure').disabled = true; clearRecord(); say('protractor',''); say('fit-out','');
  }
  function drawRope(refocus = false) {
    const svg = $('rope-fig'); svg.replaceChildren();
    if (!shape) { say('ruler',''); return; }
    const xy = (x,y) => [200+160*x,270-160*y];
    const A=xy(0,0),B=xy(shape.c,0),C=xy(point.x,point.y);
    line(svg,A,B);line(svg,A,C,'var(--a)');line(svg,B,C,'var(--b)');label(svg,A,'A',27);label(svg,B,'B',27);label(svg,C,'C',-22);
    const handle=svgNode(svg,'circle',{id:'j202-rope-handle',cx:C[0],cy:C[1],r:12,fill:'var(--card)',stroke:'var(--a)','stroke-width':4,tabindex:0,role:'group','aria-label':'可移动结点C，左右上下方向键调整','aria-roledescription':'二维拖动结点',style:'cursor:grab;touch-action:none'});
    handle.addEventListener('keydown',event=>{
      const moves={ArrowLeft:[-.001,0],ArrowRight:[.001,0],ArrowUp:[0,.001],ArrowDown:[0,-.001]};
      if (!moves[event.key]) return; event.preventDefault(); const [x,y]=moves[event.key];movePoint(point.x+x,point.y+y,true);
    });
    handle.addEventListener('pointerdown',event=>{
      event.preventDefault();
      const move=event=>{const q=svg.createSVGPoint();q.x=event.clientX;q.y=event.clientY;const local=q.matrixTransform(svg.getScreenCTM().inverse());movePoint((local.x-200)/160,(270-local.y)/160);};
      const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
    });
    field(rope,'cx').value=Math.round(point.x*1000);field(rope,'cy').value=Math.round(point.y*1000);
    say('ruler',`当前读尺：CA≈${fmt(Math.hypot(point.x,point.y)*shape.scale)}，CB≈${fmt(Math.hypot(point.x-shape.c,point.y)*shape.scale)}；给定CA=${show(info.sides[1])}、CB=${show(info.sides[0])}、AB=${show(info.sides[2])}。图上测量为近似。`);
    if(refocus)handle.focus({preventScroll:true});
  }
  function movePoint(x,y,refocus=false) {
    if(!shape)return;
    point={x:Math.round(Math.max(-1,Math.min(2,x))*1000)/1000,y:Math.round(Math.max(0,Math.min(1.2,y))*1000)/1000};operated=true;clearFit();drawRope(refocus);
  }
  rope.addEventListener('input',event=>{
    if(['a','b','c'].includes(event.target.name)) {
      info=null;shape=null;operated=false;clearFit();$('build').disabled=true;drawRope();say('side-out','边长已改，请重新取绳并搭接。');
    } else if(['cx','cy'].includes(event.target.name)) movePoint(Number(value(rope,'cx'))/1000,Number(value(rope,'cy'))/1000);
    else if(['maximum','angle'].includes(event.target.name)) clearRecord();
    else if(['guess','physical'].includes(event.target.name)) say('guess-out','记录已修改，请重新核算并自检。');
  });
  field(rope,'maximum').addEventListener('change',clearRecord);
  $('prepare').addEventListener('click',()=>{
    info=null;shape=null;operated=false;clearFit();$('build').disabled=true;drawRope();
    try {
      const result=triangle(['a','b','c'].map(n=>parse(value(rope,n))));
      if(result.kind==='nonpositive')throw Error('三段长度都须为正；不能把零长或负长用于三角形。');
      if(result.kind==='degenerate')throw Error('两较短边之和等于最大边，只能共线，不能成为非退化三角形。');
      if(result.kind==='impossible')throw Error('两较短边之和小于最大边，三段不能闭成三角形。');
      info=result;const m=model(info);
      if(!m.supported){say('side-out','精确三边关系满足严格三角形条件；但比例过细或过扁，当前图台分辨率不足以核搭接。请换更合适的图尺或纸笔作图；这不表示三角形不存在。');return;}
      shape=m;point={x:Math.round(.35*m.c*1000)/1000,y:.25};$('build').disabled=false;
      say('side-out','三边均为正，且两较短边之和严格大于最大边，可以搭三角形。现在先移动C，把两侧接好。');drawRope();
    }catch(error){say('side-out',error.message);}
  });
  $('fit').addEventListener('click',()=>{
    clearFit();
    if(!shape||!operated){say('fit-out','先自己移动结点C，再核搭接。');return;}
    if(!fit(shape,point)){say('fit-out','还没接齐两侧长度，或结点仍太贴近底边。请看读尺，继续移动；不能把共线搭法当三角形。');return;}
    fitted=true;$('measure').disabled=false;
    say('fit-out','本图两侧在所示读尺误差内搭接，进入近似量角。搭接测量不是一般证明。');
    const a=angles(shape,point);say('protractor',`本图量角器读数：∠A≈${a[0].toFixed(1)}°，∠B≈${a[1].toFixed(1)}°，∠C≈${a[2].toFixed(1)}°。记录核对允许2°读数误差，不把近似量角当精确直角。`);
  });
  $('record').addEventListener('click',()=>{
    clearRecord();
    try {
      if(!fitted)throw Error('请先完成本图搭接。');
      const choice=value(rope,'maximum');if(choice===''||!info.maximum.includes(Number(choice)))throw Error('请先比较三边，选出最大边；字母顺序不代表大小。');
      const reading=number(parse(value(rope,'angle'))),actual=angles(shape,point)[Number(choice)];
      if(!(reading>0&&reading<180))throw Error('三角形的角读数应在0°与180°之间。');
      if(Math.abs(reading-actual)>2)throw Error('所填读数与当前所选角的量角器读数相差较大，请重读。本按钮只核网页量角，实物原始数据请另记。');
      record={reading,choice:Number(choice)};$('guess').disabled=false;say('measure-out',`已留本图记录：最大边所对角读作${fmt(reading)}°。这是近似记录；接着写猜想，再用精确边长核算。`);
    }catch(error){say('measure-out',error.message);}
  });
  rope.addEventListener('submit',event=>{
    event.preventDefault();
    if(!info||!fitted||!record){say('guess-out','先搭接并留下本图量角记录。');return;}
    if(!value(rope,'guess').trim()||!value(rope,'physical').trim()){say('guess-out','先写猜想，并说明实物计划或实测记录；未实做就如实说明。');return;}
    const [i,j,k]=info.order,names=['a','b','c'];
    say('guess-out',`精确边长核算：${names[i]}²+${names[j]}²=${show(info.sum)}，${names[k]}²=${show(info.largestSquare)}。${info.kind==='right'?'两者精确相等。是否由此必得直角，要靠下面的一般证明，不能只靠本例量角。':'两者不相等。即使量角器四舍五入显示约90°，也不能据此判为精确直角；由已证勾股定理，直角三角形须满足该平方关系。'}\n自检猜想：是否说明三边先成非退化三角形、比较的是最大边、直角对应哪个顶点？多个测量例子仍不是一般证明。网页只核本图记录与算术，未自动判自由猜想、实物记录或同伴操作正确。`);
  });
  rope.addEventListener('reset',()=>{info=null;shape=null;operated=false;clearFit();$('build').disabled=true;say('side-out','尚未取绳。');drawRope();});
  let constructed=false,constructionOperated=false;
  function drawConstruction() {
    const svg=$('proof-fig');svg.replaceChildren();const theta=Number(value(proof,'turn')),a=Number(value(proof,'legA')),b=Number(value(proof,'legB'));
    const C=[70,230],A=[70,230-28*b],B=[70+28*a*Math.sin(theta*Math.PI/180),230-28*a*Math.cos(theta*Math.PI/180)];
    line(svg,C,A,'var(--a)');line(svg,C,B,'var(--b)');line(svg,A,B);label(svg,C,'C′',27);label(svg,A,'A′');label(svg,B,'B′',-17);
    if(constructed){line(svg,[70,208],[92,208]);line(svg,[92,208],[92,230]);}
    say('construction-read',`当前∠C′=${theta}°，C′B′=${a}，C′A′=${b}。第三边由之后的推理计算，不作为构造条件。`);
  }
  proof.addEventListener('input',event=>{
    if(['turn','legA','legB'].includes(event.target.name)){constructionOperated=true;constructed=false;$('reasons').disabled=true;say('construction-out','构造已改，请重新保存。');drawConstruction();}
    say('proof-out','内容已变化，请重新核对结构并自检。');
  });
  $('save-construction').addEventListener('click',()=>{
    if(!constructionOperated||Number(value(proof,'turn'))!==90||Number(value(proof,'legA'))!==3||Number(value(proof,'legB'))!==4){say('construction-out','演练尚未按给定两条边和直角构造；请亲自调整夹角与两条边，不预设第三边。');return;}
    constructed=true;$('reasons').disabled=false;say('construction-out','演练构造已按两条给定边与直角保存。接下来写任意正a、b的一般理由；本图不是一般证明。');drawConstruction();
  });
  proof.addEventListener('submit',event=>{
    event.preventDefault();
    if(!constructed){say('proof-out','先自行构造并保存新的直角三角形。');return;}
    if(!value(proof,'argument').trim()){say('proof-out','先写自己的完整一般证明，再核结构；可以保留不确定处供自查。');return;}
    const error=proofAnchors(Object.fromEntries(['pythagoras','positive','congruence','vertex'].map(n=>[n,value(proof,n)])));
    if(error){say('proof-out',error);return;}
    say('proof-out','结构选择已核对，一般证明文字仍须逐句自检：\n另作Rt△A′B′C′，C′B′=a、C′A′=b。由已证勾股定理，A′B′²=a²+b²=c²。两条长度均为正，故A′B′=c。于是BC=B′C′、CA=C′A′、AB=A′B′，由SSS得△ABC≌△A′B′C′，对应角∠C=∠C′=90°。\n请检查自己的文字是否在任意正a、b、c及题设平方关系下逐步成立，是否先假设了待证结论。网页不自动签一般证明、纸笔作图或实物活动已完成。');
  });
  proof.addEventListener('reset',()=>{constructed=false;constructionOperated=false;$('reasons').disabled=true;say('proof-out','');say('construction-out','');setTimeout(drawConstruction,0);});
  drawRope();drawConstruction();
})();
