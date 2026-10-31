/* j12-2 only: transient construction workspace, no learning-record writes. */
(function () {
  'use strict';
  var root = document.getElementById('j12-own-charts');
  if (!root || document.body.dataset.sec !== 'j12-2' || root.dataset.ready) return;
  root.dataset.ready = '1';
  var style = document.createElement('style');
  style.textContent = '#j12-own-charts input,#j12-own-charts select,#j12-own-charts textarea{font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:4px;max-width:100%;padding:5px;box-sizing:border-box}#j12-own-charts input{width:5.2em}#j12-own-charts textarea{display:block;width:100%;min-height:5em}#j12-own-charts label{display:inline-block;margin:5px}#j12-own-charts .oc-row{border-bottom:1px solid var(--line);padding:8px 0}#j12-own-charts .oc-scroll{overflow-x:auto}#j12-own-charts svg{display:block;width:100%;max-width:400px;height:auto;color:var(--fg);touch-action:manipulation}#j12-own-charts button{margin:4px;white-space:normal}#j12-own-charts output{display:block;min-height:1.8em;overflow-wrap:anywhere}';
  root.appendChild(style);
  function node(tag, text, parent) { var e = document.createElement(tag); if (text !== null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
  function field(parent, title, key, text) {
    var l = node('label', title + ' ', parent), e = node('input', null, l);
    e.type = 'text'; e.inputMode = text ? 'text' : 'decimal'; e.dataset.field = key;
    e.setAttribute('aria-label', title);
    if (!text) e.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return;
      var v = number(e, -10000, 10000); if (v === null) v = 0;
      e.value = String(v + (ev.key === 'ArrowUp' ? 1 : -1));
      e.dispatchEvent(new Event('input', {bubbles:true})); ev.preventDefault();
    });
    return e;
  }
  function button(p, title, f) { var b = node('button', title, p); b.type = 'button'; b.className = 'btn ghost'; b.onclick = f; return b; }
  function select(p, title, options) { var l = node('label', title + ' ', p), e = node('select', null, l); options.forEach(function (s, i) { var o = node('option', s, e); o.value = String(i); }); return e; }
  function output(p) { var e = node('output', '', p); e.setAttribute('aria-live', 'polite'); return e; }
  function svg(p, label) { var e = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); e.setAttribute('viewBox', '0 0 400 300'); e.setAttribute('role', 'img'); e.setAttribute('aria-label', label); p.appendChild(e); return e; }
  function shape(p, tag, attrs, text) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (text !== undefined) e.textContent = text; p.appendChild(e); return e; }
  function label(p, x, y, text) { return shape(p, 'text', { x:x, y:y, fill:'currentColor', 'font-size':22, 'text-anchor':'middle' }, text); }
  function line(p, x1, y1, x2, y2) { shape(p, 'line', {x1:x1,y1:y1,x2:x2,y2:y2,stroke:'currentColor','stroke-width':1.5}); }
  // Closed grammar: decimal literals only. No Unicode folding, whitespace joining,
  // expressions, exponents, units or percent symbols; trim only outside the token.
  function number(e, lo, hi, integer) { var s = e.value.trim(); if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s)) return null; var n = Number(s); return Number.isFinite(n) && n >= lo && n <= hi && (!integer || Number.isInteger(n)) ? n : null; }
  function near(a,b,t) { return a !== null && Math.abs(a-b) <= (t || 1e-8); }
  function displayed(a,b) { return near(a,b) || near(a,Math.round(b*10)/10); }
  function clear(p, out, pictures) { p.addEventListener('input', function () { out.textContent = ''; pictures.forEach(function (s) { s.replaceChildren(); delete s.dataset.drawn; }); }); }
  var colors = ['var(--a)', 'var(--b)', 'var(--no)'];
  function bars(p, vals, names, continuous) {
    p.replaceChildren(); var max = Math.max(1, Math.max.apply(null, vals)), w = 300 / vals.length;
    line(p,50,240,350,240); line(p,50,240,50,35); label(p,30,245,'0'); label(p,30,55,max); label(p,80,23,'频数/个');
    vals.forEach(function(v,i) { var h = v / max * 180; shape(p,'rect',{x:50+i*w+(continuous?0:w*.15),y:240-h,width:w*(continuous?1:.7),height:h,fill:colors[i%3],stroke:'var(--card)','stroke-width':1}); if (!continuous) label(p,50+(i+.5)*w,275,names[i]); });
    if (continuous) names.forEach(function(n,i) { if(vals.length<=5||i%2===0||i===vals.length) label(p,50+i*w,275,n); });
  }
  // 1. Students calculate the table and place cumulative rays on a protractor.
  var pieBox = node('div',null,root); pieBox.className='card';
  node('h3','A. 列表、量角，自己画扇形图和条形图',pieBox);
  var pieSet = select(pieBox,'练习数据',['常规','含零类','全一类','需舍入']);
  var pieRaw = node('p','',pieBox), pieRows = node('div',null,pieBox);
  node('p','填频数、百分数数值（不带%）、圆心角数值（不带°）。比例与角度若需近似，统一保留一位小数；原始计数不改。作图从正上方的0°射线顺时针量起，逐类输入累计终边角；零类终边不前进，全一类画满圆。每类自己标类别名和百分比。',pieBox);
  var activeRay = select(pieBox,'量哪条终边',['甲类终边','乙类终边','丙类终边']);
  var pieFig = svg(pieBox,'学生量角构成的扇形图'), pieLegend=node('div','',pieBox), barFig = svg(pieBox,'学生设置柱高的条形图');
  var pieOut = output(pieBox), pf = [], pv;
  pieFig.addEventListener('pointerdown', function (ev) {
    var rect=pieFig.getBoundingClientRect(), x=(ev.clientX-rect.left)*400/rect.width-200, y=(ev.clientY-rect.top)*300/rect.height-145;
    if (Math.hypot(x,y)<30 || Math.hypot(x,y)>135) return;
    var a=(Math.atan2(x,-y)*180/Math.PI+360)%360;
    var e=pf[Number(activeRay.value)].end; e.value=String(Math.round(a));
    e.dispatchEvent(new Event('input',{bubbles:true}));protractor();
    line(pieFig,200,145,200+100*Math.sin(a*Math.PI/180),145-100*Math.cos(a*Math.PI/180));
  });
  node('p','也可选终边后点按量角圆；精确角度和360°请用输入框，方向键可增减1°。图只按输入绘制，核对时不会替你改角。',pieBox);
  function protractor() {
    pieFig.replaceChildren(); shape(pieFig,'circle',{cx:200,cy:145,r:100,fill:'none',stroke:'currentColor'});
    for(var a=0;a<360;a+=10) { var t=a*Math.PI/180; line(pieFig,200+96*Math.sin(t),145-96*Math.cos(t),200+100*Math.sin(t),145-100*Math.cos(t)); if(a%90===0) label(pieFig,200+125*Math.sin(t),151-125*Math.cos(t),a+'°'); }
  }
  function loadPie() {
    var sets = [['甲','乙','甲','丙','甲','乙','甲','丙'],['甲','甲','乙','甲'],['甲','甲','甲'],['甲','乙','丙']];
    pv=sets[Number(pieSet.value)]; pieRaw.textContent='社团徽章类别记录（单位：个）：'+pv.join('、'); pieRows.replaceChildren(); pf=[];
    ['甲','乙','丙'].forEach(function(n,i) { var r=node('div',null,pieRows); r.className='oc-row'; node('b',n+'类',r); var f={}; [['count','频数'],['pct','百分数'],['angle','圆心角'],['end','累计终边角'],['height','条形柱高'],['name','图上类名'],['mark','图上百分数']].forEach(function(k){f[k[0]]=field(r,n+'类'+k[1],k[0],k[0]==='name');}); pf.push(f); });
    pieOut.textContent=''; pieLegend.replaceChildren(); if(reason) reason.querySelector('textarea').value=''; activeRay.value='0'; protractor(); barFig.replaceChildren(); delete pieFig.dataset.drawn; delete barFig.dataset.drawn;
  }
  button(pieBox,'按我的角度和柱高绘制',function(){
    var ends=pf.map(function(f){return number(f.end,0,360);}), heights=pf.map(function(f){return number(f.height,0,100,true);});
    if(ends.some(function(x){return x===null;}) || heights.some(function(x){return x===null;}) || ends.some(function(x,i){return i&&x<ends[i-1];})) { pieOut.textContent='请用递增或相等的0至360数值填写累计终边角；柱高用0至100整数。';return; }
    protractor(); var start=0;
    ends.forEach(function(end,i){ var span=end-start,t1=start*Math.PI/180,t2=end*Math.PI/180;
      if(span===360) shape(pieFig,'circle',{cx:200,cy:145,r:100,fill:colors[i],opacity:.65});
      else if(span>0) shape(pieFig,'path',{d:'M200 145 L'+(200+100*Math.sin(t1))+' '+(145-100*Math.cos(t1))+' A100 100 0 '+(span>180?1:0)+' 1 '+(200+100*Math.sin(t2))+' '+(145-100*Math.cos(t2))+' Z',fill:colors[i],opacity:.65,stroke:'currentColor'});
      start=end;
    });
    bars(barFig,heights,['甲','乙','丙'],false);
    // Labels outside the circle stay legible, including a zero-size sector.
    pieLegend.replaceChildren();pf.forEach(function(f,i){var l=node('p',f.name.value+' '+f.mark.value+'%',pieLegend); l.style.borderLeft='12px solid '+colors[i];l.style.paddingLeft='8px';});
    pieFig.dataset.drawn=barFig.dataset.drawn='1';
    pieOut.textContent='已按你的输入绘制；再核对表、扇形与柱高。';
  });
  button(pieBox,'核对我的表和两张图',function(){
    var counts=['甲','乙','丙'].map(function(n){return pv.filter(function(v){return v===n;}).length;}), cumulative=0, issues=[];
    pf.forEach(function(f,i){var c=counts[i],p=100*c/pv.length,a=360*c/pv.length;cumulative+=a;
      if(!near(number(f.count,0,100,true),c)) issues.push('第'+(i+1)+'类频数');
      if(!displayed(number(f.pct,0,100),p)||!displayed(number(f.angle,0,360),a)) issues.push('第'+(i+1)+'类比例或角度');
      if(!displayed(number(f.end,0,360),cumulative)||!near(number(f.height,0,100,true),c)) issues.push('第'+(i+1)+'类终边或柱高');
      if(f.name.value.trim()!==['甲','乙','丙'][i]||!displayed(number(f.mark,0,100),p)) issues.push('第'+(i+1)+'类图注');
    });
    if(number(pf[2].end,0,360)!==360) issues.push('最后终边须回到360°');
    if(!pieFig.dataset.drawn||!barFig.dataset.drawn) issues.push('请先绘制当前两张图');
    pieOut.textContent=issues.length?'请重查：'+issues.join('、')+'。频数÷总数×100求百分数，再乘360÷100求角度；终边要累计。':'表与构图数值一致。精确比例合计100%、角度360°；显示舍入允许微小差额，不改变原始数据。还须检查图上的类别与标注。';
  });
  button(pieBox,'重做本组',loadPie); pieSet.onchange=loadPie; clear(pieRows,pieOut,[pieFig,barFig]);pieRows.addEventListener('input',function(){pieLegend.replaceChildren();protractor();}); loadPie();
  var reason=node('div',null,pieBox); node('label','同一数据两张图：若要比较数量／显示构成，你各选哪张？联系分类数据的性质，写出理由。',reason); node('textarea','',reason);
  // 2. Full four-step grouping, manual assignment, table and independent heights.
  var histBox=node('div',null,root); histBox.className='card';node('h3','B. 从逐个划记到等组距直方图',histBox);
  var histSet=select(histBox,'练习数据',['边界与空组','全部相同']), histRaw=node('p','',histBox), plan=node('div',null,histBox);
  node('p','数据为练习中的测量长度（cm）。写最大最小之差；自行定整数起点、正整数组距和1至8组。各组统一左闭右开，最后右端必须大于最大值。此处只画等组距、纵轴频数的直方图。',histBox);
  var diff=field(plan,'最大最小之差','diff'), start=field(plan,'起点','start'), width=field(plan,'组距','width'), groups=field(plan,'组数','groups');
  var work=node('div',null,histBox), histFig=svg(histBox,'学生逐组设置柱高的直方图'), histOut=output(histBox), hd, assignment=[], hf=[], hp=null;
  function loadHist(){hd=histSet.value==='0'?[10,12,14,14,18,20,20,22]:[7,7,7,7];histRaw.textContent='原始长度/cm：'+hd.join('、');[diff,start,width,groups].forEach(function(e){e.value='';});work.replaceChildren();histFig.replaceChildren();delete histFig.dataset.drawn;histOut.textContent='';hp=null;}
  button(plan,'建立我的空表',function(){
    var s=number(start,0,30,true),w=number(width,1,20,true),k=number(groups,1,8,true);
    if(s===null||w===null||k===null){histOut.textContent='起点用0至30整数，组距用1至20整数，组数用1至8整数。';return;}
    hp={s:s,w:w,k:k};assignment=hd.map(function(){return null;});hf=[];work.replaceChildren();histFig.replaceChildren();delete histFig.dataset.drawn;histOut.textContent='';
    node('p','每个原始数据先选一组划记。改选会移去旧记号，不会重复计数；表中再自行填频数，另设柱高，最后写合计。',work);
    var marks=node('div',null,work), table=node('div',null,work);
    for(var i=0;i<k;i++){var r=node('div',null,table);r.className='oc-row';node('b',(s+i*w)+' ≤ x < '+(s+(i+1)*w),r); var tally=node('span',' 尚未划记',r);hf.push({tally:tally,count:field(r,'第'+(i+1)+'组频数','freq'),height:field(r,'第'+(i+1)+'组柱高','histheight')});}
    hd.forEach(function(v,j){var opts=['未划记'];for(var g=0;g<k;g++)opts.push('第'+(g+1)+'组');var e=select(marks,'第'+(j+1)+'项 '+v+' cm',opts);e.dataset.item=j;e.onchange=function(){assignment[j]=e.value==='0'?null:Number(e.value)-1;hf.forEach(function(f,g){var n=assignment.filter(function(x){return x===g;}).length;f.tally.textContent=' 划记：'+('|'.repeat(n)||'无');});};});
    hf.total=field(table,'频数合计','total');
  });
  button(histBox,'按我的柱高绘图',function(){if(!hp){histOut.textContent='先建立空表。';return;}var vals=hf.map(function(f){return number(f.height,0,100,true);});if(vals.some(function(x){return x===null;})){histOut.textContent='每组柱高都需填写0至100整数，包括零频组。';return;}var names=[];for(var i=0;i<=hp.k;i++)names.push(hp.s+i*hp.w);bars(histFig,vals,names,true);label(histFig,365,290,'cm');histFig.dataset.drawn='1';histOut.textContent='已按你的柱高画等宽、相邻的柱。';});
  button(histBox,'核对四步',function(){
    if(!hp){histOut.textContent='先填写分组计划、建立空表。';return;}
    var min=Math.min.apply(null,hd),max=Math.max.apply(null,hd),issues=[];
    if(!near(number(diff,0,100,true),max-min))issues.push('最大最小之差');
    if(hp.s>min||hp.s+hp.w*hp.k<=max)issues.push('分组覆盖：起点不大于最小值，最后右端严格大于最大值');
    if(assignment.some(function(g,i){return g===null||hd[i]<hp.s+g*hp.w||hd[i]>=hp.s+(g+1)*hp.w;}))issues.push('逐项划记：边界只归后一组，不重不漏');
    var total=0;hf.forEach(function(f,i){var n=hd.filter(function(v){return v>=hp.s+i*hp.w&&v<hp.s+(i+1)*hp.w;}).length;var c=number(f.count,0,100,true);total+=c===null?0:c;if(!near(c,n)||!near(number(f.height,0,100,true),n))issues.push('第'+(i+1)+'组频数或柱高');});
    if(!near(number(hf.total,0,100,true),hd.length)||total!==hd.length)issues.push('合计与数据总数');
    if(!histFig.dataset.drawn)issues.push('请先绘制当前柱图');
    histOut.textContent=issues.length?'请重查：'+issues.join('；')+'。':'四步数值与逐项归组一致。图上相邻组等宽，零频组仍占一个组距；高表示频数。改变组距可重做比较，不能把不同宽的柱都按频数高度理解面积。';
  });
  button(histBox,'重做本组',loadHist);histSet.onchange=loadHist;
  plan.addEventListener('input',function(){hp=null;work.replaceChildren();histFig.replaceChildren();delete histFig.dataset.drawn;histOut.textContent='';});clear(work,histOut,[histFig]);loadHist();
  // Open responses: explicit self-review, never classified by keywords/length.
  var reflect=node('div',null,root);reflect.className='card';node('h3','C. 自订趋势标准，纸笔复画',reflect);
  node('p','先写你怎样判断一条线“靠近”散点，以及为什么这样选；再到下方原有趋势线实验调整两个端点，记录一次修改前后的读数，按你自己的标准比较。数据只支持估计，不证明一般规律，也不保证只有一条线。',reflect);
  node('textarea','',reflect).setAttribute('aria-label','我的趋势标准、理由与修改前后比较');
  node('p','拿纸、圆规和量角器，不看屏幕重画A中的一个简单扇形图；再画B的表和直方图。纸上核对量角器中心与圆心、0刻度与起始边重合，逐段量角，标类名和百分比；直方图写轴名、单位、组界与频数。这里只提供作品准则，网页不能核验纸笔作品或同伴讨论是否发生。',reflect);
  var self=output(reflect);button(reflect,'展开自核准则',function(){self.textContent='自核：两图是否对应同一数据？选图理由是否联系数量/占比与分类性质？趋势标准是否能比较两次画线，理由和读数是否相符？纸笔作品是否标全、每项不重不漏？请据作品修订或请老师查看；文字未被自动判对。';});
  button(reflect,'清空说明',function(){root.querySelectorAll('textarea').forEach(function(t){t.value='';});self.textContent='';});root.querySelectorAll('textarea').forEach(function(t){t.addEventListener('input',function(){self.textContent='';});});
  // 3. Visible counterexamples plus numerical checks, with legitimate alternatives.
  var misleading=node('div',null,root);misleading.className='card';node('h3','D. 两幅有问题的图：算一算，再解释',misleading);
  node('p','图一：两天借书100册、120册，下图纵轴从80开始。图二：第0、1、5天株高为10、12、14 cm，却把三个时间标签画成等间距。分别判断能否直接用柱长比当数量比、用两段相同斜率断言每天长高一样快。',misleading);
  var m1=svg(misleading,'借书数量条形图，纵轴起点80'),m2=svg(misleading,'天数0、1、5等间距的株高折线图');
  line(m1,70,240,340,240);line(m1,70,240,70,35);[80,100,120].forEach(function(v){label(m1,40,245-(v-80)*4,v);});[100,120].forEach(function(v,i){shape(m1,'rect',{x:110+i*130,y:240-(v-80)*4,width:65,height:(v-80)*4,fill:colors[i]});label(m1,142+i*130,275,['第一天','第二天'][i]);});label(m1,210,25,'借书/册');
  line(m2,65,240,350,240);line(m2,65,240,65,35);[10,12,14].forEach(function(v,i){var x=90+i*120,y=220-i*70;label(m2,40,y+5,v);shape(m2,'circle',{cx:x,cy:y,r:5,fill:'var(--a)'});if(i)line(m2,x-120,y+70,x,y);label(m2,x,275,[0,1,5][i]);});label(m2,210,25,'株高/cm');label(m2,365,295,'天');
  var actual=field(misleading,'图一实际数量比（第二天÷第一天）','actual'), visual=field(misleading,'图一可见柱长比','visual'), early=field(misleading,'图二前段每天增长/cm','early'), late=field(misleading,'图二后段每天增长/cm','late');
  var judgment=select(misleading,'对两句断言的判断',['请选择','两句都可直接成立','两句都不能直接成立','仅图一句成立','仅图二句成立']);
  node('textarea','',misleading).setAttribute('aria-label','我对两幅图误导的解释与改图办法');var misOut=output(misleading);
  button(misleading,'核对计算并看解释',function(){var ok=near(number(actual,0,10),1.2)&&near(number(visual,0,10),2)&&near(number(early,0,10),2)&&near(number(late,0,10),.5)&&judgment.value==='2';misOut.textContent=ok?'计算与判断一致：柱长比2不等于实际比1.2；前后每天增长2和0.5 cm，并非同速。条形图可从0重画；时间轴按0、1、5真实距离重画。非0纵轴并非在所有图中都错，清楚标明尺度的变化图可以使用；真实时间比例下的不均匀点间距合法。你的文字仍需依据这些准则自核。':'先据坐标计算：柱长应减去轴起点；每天增长需除以各段实际天数。修改后可再次核对。';});
  clear(misleading,misOut,[]);button(misleading,'重新判断',function(){misleading.querySelectorAll('input,textarea').forEach(function(e){e.value='';});judgment.value='0';misOut.textContent='';});
})();
