/* 原型：dsp-rog8，seed 64d6dc72；产品完成：dsp-rog4（rog/codex）。
   比例模型。cfg.mode: ratio-mix（默认）/ scale-rect / work-rate / coord-dir。
   ratio-mix: a=2,b=3,k=2,c=2,operation="multiply"|"divide"；a,b>0，k>0。
   scale-rect: k=2（0.5–3，连续调节；快捷 0.5/1/2/3）。原长方形 3×2 格。
   work-rate: t1=8,t2=12,t=3（天数正数，进度允许超过 1，实际完成量封顶）。
   coord-dir: angle=30（东偏北，15–75°）,distance=4（图上厘米）,scale=2（每厘米千米）。
   例：data-manip="ratio-scale-canvas" data-cfg='{"mode":"scale-rect","k":2}'。
   manip:change.detail 含参数和 result；方向模式含坐标，工程模式含原始与实际完成量。
*/
(function () {
  "use strict";
  var U=PeiyuManip.util,scope='.manip[data-manip="ratio-scale-canvas"]';
  var style=document.createElement("style");
  style.textContent=scope+' {min-width:0;max-width:100%}'+
    scope+' .fig-scroll {overflow-x:auto;max-width:100%}'+
    scope+' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;height:auto}'+
    scope+' svg text {font-size:17px;fill:var(--fg)}'+
    scope+' .num-controls {display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}'+
    scope+' label {display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}'+
    scope+' input {width:100%;min-height:44px;accent-color:var(--a)}'+
    scope+' .read {overflow-wrap:anywhere}'+scope+' :focus-visible {outline:3px solid var(--hl)}';
  document.head.appendChild(style);
  function num(v,f,lo,hi) {v=Number(v);return Math.max(lo,Math.min(hi,Number.isFinite(v)?v:f));}
  function fmt(v) {return String(Number(v.toFixed(4)));}
  function fr(n,d) {return '<span class="fr" aria-label="'+d+'分之'+n+'"><span>'+n+'</span><span class="bar"></span><span>'+d+'</span></span>';}
  function text(svg,x,y,value,anchor) {var t=U.el("text",{x:x,y:y,"text-anchor":anchor||"start"},svg);t.textContent=value;}
  function line(svg,x1,y1,x2,y2,tone,width) {return U.el("line",{x1:x1,y1:y1,x2:x2,y2:y2,stroke:"var(--"+(tone||"fg")+")","stroke-width":width||2},svg);}
  function box(svg,x,y,w,h,tone) {return U.el("rect",{x:x,y:y,width:Math.max(0,w),height:h,fill:"var(--"+tone+")","fill-opacity":0.55,stroke:"var(--fg)"},svg);}
  PeiyuManip.register("ratio-scale-canvas", function (root,cfg) {
    var modes=["ratio-mix","scale-rect","work-rate","coord-dir"],mode=modes.indexOf(cfg.mode)>=0?cfg.mode:modes[0];
    var st={a:num(cfg.a,2,1,12),b:num(cfg.b,3,1,12),k:num(cfg.k,2,0.5,mode==="scale-rect"?3:6),c:num(cfg.c,2,0,12),
      operation:cfg.operation==="divide"?"divide":"multiply",t1:num(cfg.t1,8,2,30),t2:num(cfg.t2,12,2,30),t:num(cfg.t,3,0,20),
      angle:num(cfg.angle,30,15,75),distance:num(cfg.distance,4,1,6),scale:num(cfg.scale,2,1,10),north:false};
    var initial=Object.assign({},st),inputs={};
    var wrap=root.appendChild(U.h("div","fig-scroll"));wrap.setAttribute("role","region");wrap.setAttribute("aria-label","图示（窄屏可左右滑动）");wrap.tabIndex=0;
    var svg=U.el("svg",{class:"stage",viewBox:"0 0 460 220",role:"img","aria-label":"比例与单位量图示"},wrap);
    var controls=root.appendChild(U.h("div","num-controls")),buttons=root.appendChild(U.h("div","ctrls")),read=root.appendChild(U.h("p","read"));read.setAttribute("aria-live","polite");
    function range(key,label,lo,hi,step) {
      var l=controls.appendChild(U.h("label")),title=l.appendChild(U.h("span")),input=l.appendChild(U.h("input"));
      input.type="range";input.min=lo;input.max=hi;input.step=step||1;input.dataset.key=key;input.setAttribute("aria-label",label);
      // Let the native input normalize configured values before recording the initial state.
      input.value=st[key];st[key]=Number(input.value);
      inputs[key]={input:input,title:title,label:label};input.addEventListener("input",function(){st[key]=Number(input.value);draw();});
    }
    function button(label,fn) {buttons.appendChild(U.btn(label,function(){fn();draw();}));}
    if(mode==="ratio-mix") {
      range("a","原汁 a",1,12);range("b","水 b",1,12);range("k","倍数 k",0.5,6,0.1);range("c","同时增加 c",0,12);
      button("同时乘 k",function(){st.operation="multiply";});button("同时除以 k",function(){st.operation="divide";});
    } else if(mode==="scale-rect") {
      range("k","边长缩放因子 k",0.5,3,0.05);[0.5,1,2,3].forEach(function(k){button("缩放 "+k+" 倍",function(){st.k=k;});});
    } else if(mode==="work-rate") {
      range("t1","甲独做天数",2,30);range("t2","乙独做天数",2,30);range("t","合做天数",0,20,"any");
      button("恰好完成",function(){st.t=st.t1*st.t2/(st.t1+st.t2);});
    } else {
      range("angle","东偏北角度",15,75);range("distance","图上距离（厘米）",1,6,0.1);range("scale","每厘米表示千米",1,10,0.5);
      button("切换角度基准",function(){st.north=!st.north;});
    }
    initial=Object.assign({},st);
    button("重来",function(){st=Object.assign({},initial);});
    function draw() {
      svg.replaceChildren();var result=0,msg="",extra={};
      if(mode==="ratio-mix") {
        var factor=st.operation==="divide"?1/st.k:st.k,aa=st.a*factor,bb=st.b*factor,addedA=st.a+st.c,addedB=st.b+st.c;
        [[st.a,st.b,"原配"],[aa,bb,"同乘除"],[addedA,addedB,"同加"]].forEach(function(row,i){
          var width=290*row[0]/(row[0]+row[1]),y=30+i*58;text(svg,25,y+23,row[2]);box(svg,120,y,width,30,"a");box(svg,120+width,y,290-width,30,"b");
        });
        text(svg,30,213,"同宽杯中：原汁占比决定浓度");
        result=st.a/st.b;var same=st.c===0||st.a===st.b;
        msg="原汁 : 水 = "+fmt(st.a)+" : "+fmt(st.b)+"；同时"+(st.operation==="divide"?"除以 ":"乘 ")+fmt(st.k)+" → "+fmt(aa)+" : "+fmt(bb)+"，比值仍为 "+fr(st.a,st.b)+"。原汁占总量的 "+fr(st.a,st.a+st.b)+"，浓度不变。"+
          "同时加 "+fmt(st.c)+" → "+fmt(addedA)+" : "+fmt(addedB)+"，比值为 "+fr(addedA,addedB)+(same?"，本例恰好不变（c = 0 或 a = b）；一般不能用同加保持比值。":"，比值改变，浓度也改变。");
        extra={scaledA:aa,scaledB:bb,addedRatio:addedA/addedB};
      } else if(mode==="scale-rect") {
        var u=18,w=3*u,h=2*u,k=st.k;
        for(var gx=26;gx<=422;gx+=u)line(svg,gx,30,gx,174,"line",1);
        for(var gy=30;gy<=174;gy+=u)line(svg,26,gy,422,gy,"line",1);
        box(svg,44,48,w,h,"a");box(svg,224,48,w*k,h*k,"b");
        [[44,w,h],[224,w*k,h*k]].forEach(function(shape){
          for(var dx=u;dx<shape[1];dx+=u)line(svg,shape[0]+dx,48,shape[0]+dx,48+shape[2],"fg",1);
          for(var dy=u;dy<shape[2];dy+=u)line(svg,shape[0],48+dy,shape[0]+shape[1],48+dy,"fg",1);
        });
        text(svg,44,24,"原图 3 × 2");text(svg,224,24,"每条边 × "+fmt(k));
        text(svg,44,196,"面积 6 格");text(svg,224,196,"面积 "+fmt(6*k*k)+" 格");
        result=k*k;extra={originalArea:6,scaledArea:6*k*k};
        msg="边长比 = "+fmt(k)+" : 1；面积格数比 = "+fmt(k*k)+" : 1，因为长和宽各乘 "+fmt(k)+"，面积乘 "+fmt(k)+"²。"+(k===1?"不缩放时两种比都为 1。":"边长缩放与面积缩放要分清；例如边长 ×2，面积 ×4。");
      } else if(mode==="work-rate") {
        var rate=1/st.t1+1/st.t2,raw=st.t*rate,done=Math.min(1,raw),time=Math.min(st.t,1/rate),partA=time/st.t1,partB=time/st.t2,beyond=raw>1+1e-10;
        text(svg,30,27,"总工程量 = 1；两人同时从两端推进");
        box(svg,30,48,400,36,"card");box(svg,30,48,400*partA,36,"a");box(svg,430-400*partB,48,400*partB,36,"b");
        text(svg,30,112,"甲 → "+fmt(partA*100)+"%");text(svg,430,112,fmt(partB*100)+"% ← 乙","end");
        box(svg,30,142,400,18,"card");box(svg,30,142,400*done,18,"c");
        text(svg,30,207,"实际完成 "+fmt(done*100)+"%"+(beyond?"，完成后停止施工":""));
        result=raw;extra={rate:rate,done:done,partA:partA,partB:partB,finishTime:1/rate};
        msg="每天合做 "+fr(1,st.t1)+" + "+fr(1,st.t2)+" = "+fr(st.t1+st.t2,st.t1*st.t2)+"。合做约 "+fmt(st.t)+" 天，理论进度 = t ×（"+fr(1,st.t1)+" + "+fr(1,st.t2)+"）≈ "+fmt(raw)+"。恰好完成需 "+fr(st.t1*st.t2,st.t1+st.t2)+" 天（约 "+fmt(1/rate)+" 天）。"+(beyond?"理论值超过 1，实际已完成，进度条封顶。":"同色分段与各人的工作量对应。");
      } else {
        var theta=st.angle*Math.PI/180,r=st.distance*22,px=100+r*Math.cos(theta),py=177-r*Math.sin(theta),distance=st.distance*st.scale;
        var x=distance*Math.cos(theta),y=distance*Math.sin(theta);
        line(svg,50,177,270,177);line(svg,100,201,100,31);text(svg,275,183,"东");text(svg,92,24,"北");text(svg,77,201,"O");
        line(svg,100,177,px,177,"b").setAttribute("stroke-dasharray","5 4");line(svg,px,177,px,py,"b").setAttribute("stroke-dasharray","5 4");line(svg,100,177,px,py,"a",3);
        U.el("circle",{cx:px,cy:py,r:6,fill:"var(--c)"},svg);text(svg,px+9,py-8,"P");
        var endX=100+35*Math.cos(theta),endY=177-35*Math.sin(theta);
        U.el("path",{d:st.north?"M100 142 A35 35 0 0 1 "+endX+" "+endY:"M135 177 A35 35 0 0 0 "+endX+" "+endY,fill:"none",stroke:"var(--c)","stroke-width":2},svg);
        text(svg,305,47,st.north?"北偏东":"东偏北");text(svg,305,81,fmt(st.north?90-st.angle:st.angle)+"°");text(svg,305,121,"实际 "+fmt(distance)+" 千米");
        result=distance;extra={x:x,y:y,mapX:st.distance*Math.cos(theta),mapY:st.distance*Math.sin(theta)};
        msg="从 O 向"+(st.north?"北偏东 "+fmt(90-st.angle):"东偏北 "+fmt(st.angle))+"° 直行 "+fmt(distance)+" 千米到 P。东偏北 "+fmt(st.angle)+"° ↔ 北偏东 "+fmt(90-st.angle)+"°，是同一方向。图上 "+fmt(st.distance)+" 厘米，每厘米表示 "+fmt(st.scale)+" 千米。目标坐标约为（东 "+fmt(x)+"，北 "+fmt(y)+"）千米；虚线段的分向行走：先向东 "+fmt(x)+"，再向北 "+fmt(y)+" 千米，其路程大于直线距离。";
      }
      Object.keys(inputs).forEach(function(key){var o=inputs[key];o.input.value=st[key];o.title.textContent=o.label+"："+fmt(st[key]);});
      read.innerHTML=msg;svg.setAttribute("aria-label",read.textContent);U.emit(root,Object.assign({mode:mode,result:result},st,extra));
    }
    draw();
  });
})();
