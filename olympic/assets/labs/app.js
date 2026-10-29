(function () {
  'use strict';
  const $ = id => document.getElementById(id), M = globalThis.LabMath;
  const kind = document.querySelector('[data-lab]').dataset.lab;
  const fmt = n => Math.abs(n) < 1e-12 ? '0.000' : Math.abs(n) < 0.0005 ? n.toExponential(2) : n.toFixed(3);
  const val = id => Number($(id).value);
  const line = (x1,y1,x2,y2,cls='axis') => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const text = (x,y,s,anchor='middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
  const point = (x,y) => `<circle class="point" cx="${x}" cy="${y}" r="5"/>`;
  const path = (points,cls) => `<path class="${cls}" d="${points.map((p,i) => `${i?'L':'M'}${p.join(',')}`).join(' ')}"/>`;
  let expected;
  const target = html => `<div data-target-readout hidden>${html}</div>`;
  function syncTangentControls(reset=false) {
    if (kind !== 'tangent') return;
    if (!M.functions[$('kind').value]) $('kind').value = 'square';
    const fn=M.functions[$('kind').value];
    for (const id of ['a','x']) {
      const input=$(id), previous=Number(input.value);
      input.min=fn.min; input.max=fn.max;
      input.value=reset ? (id==='a'?1:2) : Math.max(fn.min,Math.min(fn.max,Number.isFinite(previous)?previous:1));
    }
  }
  function render() {
    syncTangentControls();
    $('feedback').textContent = '';
    for (const input of document.querySelectorAll('input[type=range]')) $(input.id+'-value').textContent = input.value;
    let graphic = '', read = '', legend = '';
    if (kind === 'tangent') {
      const fn = M.functions[$('kind').value], a=val('a'), x=val('x'), k=$('kind').value;
      const q=M.tangent(k,a,x);
      const extrema=[fn.f(fn.min),fn.f(fn.max),q.fa+q.slope*(fn.min-a),q.fa+q.slope*(fn.max-a),0];
      const low=Math.floor(Math.min(...extrema)-0.5), high=Math.ceil(Math.max(...extrema)+0.5);
      const px=t=>35+290*(t-fn.min)/(fn.max-fn.min), py=t=>280-240*(t-low)/(high-low);
      graphic = `<defs><clipPath id="plot"><rect x="35" y="40" width="290" height="240"/></clipPath></defs>`;
      graphic += line(35,py(0),325,py(0))+line(px(k==='square'?0:fn.min),40,px(k==='square'?0:fn.min),280,k==='log'?'axis dashed':'axis');
      graphic += `<g clip-path="url(#plot)">`+path(Array.from({length:201},(_,i)=>{const t=fn.min+(fn.max-fn.min)*i/200;return [px(t),py(fn.f(t))];}),'curve');
      graphic += line(px(fn.min),py(q.fa+q.slope*(fn.min-a)),px(fn.max),py(q.fa+q.slope*(fn.max-a)),'tangent');
      graphic += line(px(x),py(q.fx),px(x),py(q.tx),'secondary dashed')+`</g>`+point(px(a),py(q.fa))+point(px(x),py(q.fx));
      graphic += text(35,305,fn.min)+text(325,305,fn.max)+text(339,py(0)+5,'x')+text(25,44,high,'end')+text(25,279,low,'end');
      if(k==='log') graphic+=text(35,22,'左边界 x=0.25','start');
      read=`<p class="formula">${k==='square'?'x² ≥ a²+2a(x−a)':'ln x ≤ ln a+(x−a)/a'}</p><p>Tₐ(x) = ${fmt(q.fa)} + (${fmt(q.slope)})·(x − (${fmt(a)}))</p><p>f(x)=${fmt(q.fx)}；Tₐ(x)=${fmt(q.tx)}</p>${target(`<p>f(x)−Tₐ(x)=${fmt(q.gap)}</p>`)}<p>等号条件：x=a。当前${Math.abs(x-a)<1e-9?'取等':'不取等'}。</p>`;
      legend='绿色实线：函数；棕色直线：切线；蓝色虚线：比较点的差。圆点分别表示接触点和函数比较点。纵向范围随接触点与函数自动调整。'+(k==='log'?'虚竖线是显示窗口的左边界 x=0.25，不是 y 轴。':'')+'目标差值在核对预测后显示。';
      expected = fn.f(x) - (fn.f(a)+fn.df(a)*(x-a));
    } else if (kind === 'cauchy') {
      const q=M.vectors(val('r'),val('s'),val('angle')), px=x=>180+43*x;
      // Equal coordinate scale is essential for angles and lengths.
      const sy=y=>245-43*y;
      graphic=line(25,245,335,245)+line(180,35,180,280);
      graphic+=line(180,245,px(q.u[0]),sy(q.u[1]),'curve')+line(180,245,px(q.v[0]),sy(q.v[1]),'secondary');
      graphic+=line(px(q.v[0]),sy(q.v[1]),px(q.v[0]),245,'secondary dashed');
      graphic+=point(px(q.u[0]),sy(q.u[1]))+point(px(q.v[0]),sy(q.v[1]));
      graphic+=text(px(q.u[0]),272,'u')+text(px(q.v[0]),sy(q.v[1])-14,'v')+text(162,303,'O（共同原点）')+text(338,240,'x')+text(180,27,'y');
      read=`<p>u=(${fmt(q.u[0])}, 0)<br>v=(${fmt(q.v[0])}, ${fmt(q.v[1])})</p><p>|u|=${fmt(q.nu)}；|v|=${fmt(q.nv)}<br>|u||v|=${fmt(q.product)}</p>${q.cosine===null?'<p>零向量：夹角无定义。</p>':''}${target(`<p>u·v=${fmt(q.dot)}</p><p class="formula">|u·v|=${fmt(Math.abs(q.dot))} ≤ ${fmt(q.product)}=|u||v|</p><p>平方差=${fmt(q.product*q.product-q.dot*q.dot)}。${q.cosine===null?'零向量：等号成立。':`cos θ=${fmt(q.cosine)}；${Math.abs(q.determinant)<1e-8?'线性相关，取等。':'不共线，严格不等。'}`}</p>`)}`;
      legend='绿色：u；蓝色：v；蓝色虚线：v 到横轴的投影。两坐标轴等比例；短向量仍按实际长度画出，零向量为原点圆点。';
      const dot=q.u.reduce((sum,t,i)=>sum+t*q.v[i],0);
      expected=Math.abs(dot)<1e-9?'zero':dot<0?'negative':'positive';
    } else {
      const angles=[0,val('b'),val('c'),val('d')], q=M.ptolemy(angles), p=q.points.map(([x,y])=>[180+108*x,160-108*y]);
      graphic='<circle class="axis" fill="none" cx="180" cy="160" r="108"/>';
      graphic+=path([...p,p[0]],'curve')+line(...p[0],...p[2],'secondary dashed')+line(...p[1],...p[3],'secondary dashed');
      p.forEach(([x,y],i)=>{graphic+=point(x,y)+text(180+(x-180)*1.23,166+(y-160)*1.23,'ABCD'[i]);});
      read=`<p>半径 R=1；逆时针 A→B→C→D</p><p>AB=${fmt(q.ab)}；BC=${fmt(q.bc)}<br>CD=${fmt(q.cd)}；DA=${fmt(q.da)}<br>AC=${fmt(q.ac)}；BD=${fmt(q.bd)}</p>${target(`<p class="formula">AC·BD = ${fmt(q.lhs)}<br>AB·CD+BC·DA = ${fmt(q.rhs)}</p><p>数值残差：${(q.lhs-q.rhs).toExponential(2)}</p>`)}`;
      legend='绿色实线：四条边；蓝色虚线：两条对角线。标签顺序固定，角度区间保证相邻点不重合。';
      const dist=(a,b)=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2);
      expected=dist(q.points[0],q.points[1])*dist(q.points[2],q.points[3])+dist(q.points[1],q.points[2])*dist(q.points[3],q.points[0]);
    }
    $('drawing').innerHTML=graphic; $('readout').innerHTML=read; $('legend').textContent=legend;
    document.documentElement.dataset.ready='true';
  }
  $('kind')?.addEventListener('change',()=>{
    syncTangentControls(true);
    render();
  });
  document.querySelectorAll('input[type=range]').forEach(input=>input.addEventListener('input',render));
  $('answer').addEventListener('input',()=>{ $('feedback').textContent=''; });
  $('check').addEventListener('click',()=>{
    const raw=$('answer').value;
    if(raw.trim()==='' || (kind!=='cauchy' && !Number.isFinite(Number(raw)))) { $('feedback').textContent='请先输入有效预测。'; return; }
    const correct=kind==='cauchy'?raw===expected:Math.abs(Number(raw)-expected)<=0.02;
    document.querySelectorAll('[data-target-readout]').forEach(el=>{el.hidden=false;});
    const result=kind==='cauchy'?({positive:'正',negative:'负',zero:'零'})[expected]:fmt(expected);
    $('feedback').textContent=`${correct?'预测吻合':'再比较一下'}：独立按${kind==='ptolemy'?'四条边的乘积和':kind==='tangent'?'函数值减切线值':'坐标数量积'}计算，结果为 ${result}。`;
  });
  $('theme').addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme=dark?'light':'dark';
  });
  window.addEventListener('pageshow',render);
  render();
})();
