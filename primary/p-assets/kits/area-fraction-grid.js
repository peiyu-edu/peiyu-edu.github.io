/* 分数面积 ↔ 一维数轴。加载 manip.js 后使用；所有分数均为正数。
   原型：dsp-rog8，PY-141-2 seed 64d6dc72；产品完成：dsp-rog2（rog/codex）。
   撤回后恢复与滚动回归：dsp-rog21（rog/codex），PY-141 n4。
   cfg.mode: frac-mul-int（默认）/ frac-mul-frac / frac-div / percent-grid。
   cfg: n=2,d=5,k=3；a=2,b=3,c=3,d=5（分数乘分数）；
   division="integer"|"fraction",value=2；p=30,percent="plain"|"discount"|"growth"|"roundtrip"。
   整数分母 3–12（第二因数分母 2–12），真分数分子随分母夹紧，k=1–6，p=0–100。
   例：data-manip="area-fraction-grid" data-cfg='{"mode":"frac-mul-frac"}'。
   manip:change.detail 含输入、result 和数轴范围；重来恢复配置。
*/
(function () {
  "use strict";
  var U = PeiyuManip.util, scope = '.manip[data-manip="area-fraction-grid"]';
  var style = document.createElement("style");
  style.textContent = scope + ' {min-width:0;max-width:100%}' +
    scope + ' .fig-scroll {overflow-x:auto;max-width:100%;outline-offset:2px}' +
    scope + ' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;height:auto}' +
    scope + ' svg text {font-size:17px;fill:var(--fg)}' +
    scope + ' .num-controls {display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}' +
    scope + ' label {display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}' +
    scope + ' input {width:100%;min-height:44px;accent-color:var(--a)}' +
    scope + ' label[hidden] {display:none}' +
    scope + ' .read {overflow-wrap:anywhere}' +
    scope + ' :focus-visible {outline:3px solid var(--hl)}';
  document.head.appendChild(style);
  function num(v, fallback, lo, hi) { v = Number(v); return Math.max(lo, Math.min(hi, Number.isFinite(v) ? Math.round(v) : fallback)); }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function fmt(v) { return String(Number(v.toFixed(4))); }
  function fr(n, d) { return '<span class="fr" aria-label="' + d + '分之' + n + '"><span>' + n + '</span><span class="bar"></span><span>' + d + '</span></span>'; }
  function reduced(n, d) { var g = gcd(n, d); return d / g === 1 ? String(n / g) : fr(n / g, d / g); }
  function text(svg, x, y, value, anchor) { var t = U.el("text", {x:x, y:y, "text-anchor":anchor || "start"}, svg); t.textContent = value; return t; }
  function rect(svg, x, y, w, h, tone, opacity) { return U.el("rect", {x:x,y:y,width:w,height:h,fill:"var(--" + tone + ")", "fill-opacity":opacity == null ? 1 : opacity,stroke:"var(--fg)","stroke-width":1},svg); }
  function line(svg, x1, y1, x2, y2, tone) { return U.el("line", {x1:x1,y1:y1,x2:x2,y2:y2,stroke:"var(--" + (tone || "fg") + ")","stroke-width":2}, svg); }
  PeiyuManip.register("area-fraction-grid", function (root, cfg) {
    cfg = cfg || {};
    var modes = ["frac-mul-int", "frac-mul-frac", "frac-div", "percent-grid"];
    var mode = modes.indexOf(cfg.mode) >= 0 ? cfg.mode : modes[0];
    var st = {d:num(cfg.d,5,mode === "frac-mul-frac" ? 2 : 3,12),n:num(cfg.n,2,1,11),k:num(cfg.k,3,1,6),
      b:num(cfg.b,3,2,12),a:num(cfg.a,2,1,11),c:num(cfg.c,3,1,11),value:num(Number(cfg.value)*4,8,1,24)/4,
      p:num(cfg.p,30,0,100),division:cfg.division === "fraction" ? "fraction" : "integer",
      percent:["plain","discount","growth","roundtrip"].indexOf(cfg.percent) >= 0 ? cfg.percent : "plain",first:true};
    function clamp() { st.n = Math.min(st.n,st.d-1); st.a = Math.min(st.a,st.b-1); st.c = Math.min(st.c,st.d-1); }
    clamp(); var initial = Object.assign({},st), inputs = {}, choices = [];
    var wrap = U.h("div","fig-scroll");
    wrap.setAttribute("role","region"); wrap.setAttribute("aria-label","图示（窄屏可左右滑动）"); wrap.tabIndex = 0;
    var svg = U.el("svg", {class:"stage",viewBox:"0 0 460 220",role:"img","aria-label":"面积与数轴同步图"},wrap);
    root.appendChild(wrap);
    var controls = root.appendChild(U.h("div","num-controls")), buttons = root.appendChild(U.h("div","ctrls"));
    var read = root.appendChild(U.h("p","read")); read.setAttribute("aria-live","polite");
    function range(key,label,lo,hi,step) {
      var l = controls.appendChild(U.h("label")), title = l.appendChild(U.h("span")), input = l.appendChild(U.h("input"));
      input.type="range"; input.min=lo; input.max=hi; input.step=step || 1; input.setAttribute("aria-label",label); input.dataset.key=key;
      inputs[key]={input:input,title:title,label:label};
      input.addEventListener("input",function () { st[key]=Number(input.value); clamp(); draw(); });
    }
    function toggle(label,fn,selected) {
      var button = buttons.appendChild(U.btn(label,function () {fn();draw();}));
      if (selected) choices.push({button:button,selected:selected});
    }
    if (mode === "frac-mul-frac") { range("b","第一分母 b",2,12);range("a","第一分子 a",1,st.b-1);range("d","第二分母 d",2,12);range("c","第二分子 c",1,st.d-1); }
    else if (mode === "percent-grid") {
      range("p","百分率 p",0,100);
      [ ["plain","百分率互化"],["discount","折扣"],["growth","增长"],["roundtrip","先降再涨"] ].forEach(function (pair) {toggle(pair[1],function () {st.percent=pair[0];},function () {return st.percent===pair[0];});});
    } else {
      range("d","分母 d",3,12);range("n","分子 n",1,st.d-1);
      if (mode === "frac-mul-int") {range("k","整数倍 k",1,6);toggle("先约分再乘（切换顺序）",function () {st.first=!st.first;},function () {return st.first;});}
      else {range("k","均分份数 k",1,6);range("value","被除数",0.25,6,0.25);
        toggle("分数除以整数",function () {st.division="integer";},function () {return st.division==="integer";});toggle("一个数除以分数",function () {st.division="fraction";},function () {return st.division==="fraction";});}
    }
    toggle("重来",function () {st=Object.assign({},initial);});
    function axis(max) {
      line(svg,30,185,430,185);
      var count = max <= 6 ? Math.ceil(max) : 4;
      for (var i=0;i<=count;i++) {var v=max*i/count,x=30+400*i/count;line(svg,x,181,x,190);text(svg,x,213,fmt(v),"middle");}
    }
    function dot(v,max,label,y,tone) {
      var x=30+400*v/max; U.el("circle",{class:"point",cx:x,cy:185,r:5,fill:"var(--"+(tone || "a")+")"},svg);
      if(label) text(svg,Math.max(42,Math.min(415,x)),y || 170,label,"middle");
    }
    function draw() {
      clamp(); svg.replaceChildren();
      choices.forEach(function (choice) {choice.button.setAttribute("aria-pressed",String(choice.selected()));});
      if(mode === "frac-mul-int") choices[0].button.textContent=(st.first?"先约分再乘":"先乘后约分")+"（切换顺序）";
      Object.keys(inputs).forEach(function(key) {var obj=inputs[key];if(key === "n" || key === "c") obj.input.max=st.d-1;if(key === "a") obj.input.max=st.b-1;obj.input.value=st[key];obj.title.textContent=obj.label+"："+fmt(st[key]);});
      if (inputs.k) inputs.k.input.closest("label").hidden=mode === "frac-div" && st.division === "fraction";
      if (inputs.value) inputs.value.input.closest("label").hidden=st.division !== "fraction";
      var result,max=1,msg="",n=st.n,d=st.d,k=st.k,i,j;
      if(mode === "frac-mul-int") {
        result=n*k/d;max=Math.max(1,Math.ceil(result));
        text(svg,30,24,"同样一段，连续取 "+k+" 次");
        // Each row is one whole, even when the product exceeds one.
        for(i=0;i<max*d;i++) {
          var cell=rect(svg,30+400*(i%d)/d,36+Math.floor(i/d)*14,400/d,12,i<n*k?"a":"card",i<n*k?0.65:1);
          cell.setAttribute("class",i<n*k?"strip selected":"strip");
          if(i<n*k && i%n===0) line(svg,30+400*(i%d)/d,35+Math.floor(i/d)*14,30+400*(i%d)/d,49+Math.floor(i/d)*14,"b");
        }
        axis(max);
        for(i=1;i<=k;i++) {var x1=30+400*(i-1)*n/(d*max),x2=30+400*i*n/(d*max);
          U.el("path",{d:"M"+x1+" 185 Q"+((x1+x2)/2)+" 119 "+x2+" 185",fill:"none",stroke:"var(--a)","stroke-width":2},svg);dot(i*n/d,max);}
        text(svg,30,139,"每行是 1；每次取的量与每跳相同");
        var ng=gcd(n,d),g=gcd(k,d/ng);
        msg=fr(n,d)+" × "+k+" = "+reduced(n*k,d)+"。"+(st.first ?
          "先约分再乘："+fr(n/ng,d/ng)+" × "+k+"；"+(g>1?"整数与当前分母再约去公因数 "+g:"整数与当前分母互质")+"，得 "+fr((n/ng)*(k/g),d/ng/g)+" = "+reduced(n*k,d) :
          "先乘后约："+fr(n+" × "+k,d)+" = "+fr(n*k,d)+" = "+reduced(n*k,d))+"。分母表示单位，每一跳不改变单位。";
      } else if(mode === "frac-mul-frac") {
        result=st.a*st.c/(st.b*d);
        for(i=0;i<d;i++) for(j=0;j<st.b;j++) {
          var square=rect(svg,35+132*j/st.b,25+132*i/d,132/st.b,132/d,j<st.a?(i<st.c?"c":"a"):(i<st.c?"b":"card"),j<st.a&&i<st.c?0.85:0.35);
          square.setAttribute("class",j<st.a&&i<st.c?"cell selected":"cell");
        }
        text(svg,200,48,"竖切 "+st.b+" 列，取 "+st.a+" 列");text(svg,200,84,"横切 "+d+" 行，取 "+st.c+" 行");
        text(svg,200,120,"交叠 "+(st.a*st.c)+" 格，共 "+(st.b*d)+" 格");
        axis(1);dot(st.a/st.b,1,"被乘数",170,"a");dot(result,1,"积",150,"c");
        msg=fr(st.a,st.b)+" × "+fr(st.c,d)+" = "+fr(st.a*st.c,st.b*d)+" = "+reduced(st.a*st.c,st.b*d)+"。乘正的真分数，积比原来的 "+fr(st.a,st.b)+" 小；乘法不一定变大。";
      } else if(mode === "frac-div" && st.division === "integer") {
        result=n/(d*k);
        for(i=0;i<k;i++) for(j=0;j<d;j++) {
          var part=rect(svg,30+400*j/d,35+65*i/k,400/d,65/k,j<n?(i===0?"c":"a"):"card",j<n?0.6:1);
          part.setAttribute("class",j<n&&i===0?"share selected":"share");
        }
        text(svg,30,128,"横切 "+k+" 份，深色是其中一份");axis(1);dot(n/d,1,"被除数",170);dot(result,1,"商",150,"c");
        msg=fr(n,d)+" ÷ "+k+" = "+fr(n,d)+" × "+fr(1,k)+" = "+reduced(n,d*k)+"。横切均分，取其中一份。";
      } else if(mode === "frac-div") {
        result=st.value/(n/d);max=Math.ceil(st.value);
        text(svg,30,24,"每行是 1，色段跨行连续接读");
        var groups=Math.ceil(result-1e-10);
        for(j=0;j<max;j++) rect(svg,30,36+j*14,400,12,"card").setAttribute("class","unit");
        for(i=0;i<groups;i++) {
          var left=i*n/d,right=Math.min(st.value,(i+1)*n/d);
          for(j=Math.floor(left+1e-10);j<Math.ceil(right-1e-10);j++) {
            var lo=Math.max(left,j),hi=Math.min(right,j+1);
            rect(svg,30+400*(lo-j),36+j*14,400*(hi-lo),12,i%2?"b":"a",0.75).setAttribute("class","measure selected");
          }
        }
        var reference=rect(svg,30,36,400*n/d,12,"card",0);
        reference.setAttribute("class","divisor-reference");
        reference.setAttribute("stroke-dasharray","4 2");
        axis(max);dot(st.value,max,"被除数",163);
        for(i=0;i<=Math.floor(result+1e-10);i++) line(svg,30+400*i*n/(d*max),178,30+400*i*n/(d*max),191,"b").setAttribute("class","measure-tick");
        text(svg,30,139,"包含约 "+fmt(result)+" 个除数（末段可不足）");
        msg=fmt(st.value)+" ÷ "+fr(n,d)+" = "+fmt(st.value)+" × "+fr(d,n)+" = "+reduced(Math.round(st.value*4)*d,4*n)+" ≈ "+fmt(result)+"。第一行虚框是一个完整除数，色段总长是被除数。数轴上的每小段是除数；不足一段也按比例计。正数除以真分数，商比被除数大；除法不一定变小。";
      } else {
        var p=st.p, final=st.percent === "roundtrip" ? 100-p*p/100 : st.percent === "growth" ? 100+p : st.percent === "discount" ? 100-p : p;
        result=final/100;max=2;
        // Two grids share the same unit of 100 cells; partial cells preserve percentage changes exactly.
        for(var block=0;block<2;block++) for(i=0;i<100;i++) {var x=30+block*155+(i%10)*12,y=20+Math.floor(i/10)*10,amount=Math.max(0,Math.min(1,final-block*100-i));
          rect(svg,x,y,12,10,"card").setAttribute("class","percent-cell");if(amount>0) rect(svg,x,y,12*amount,10,"a",0.7).setAttribute("class","percent selected");}
        text(svg,343,48,"每格 1%");text(svg,343,88,"每网 100%");
        axis(max);dot(result,max,"现值",179);dot(1,max,"原值",159,"b");
        if(st.percent === "roundtrip") {dot((100-p)/100,max,"降后",139,"c");msg="原来 100，先降 "+p+"% 得 "+fmt(100-p)+"；再涨 "+p+"% 的基准量是 "+fmt(100-p)+"，增加 "+fmt((100-p)*p/100)+"。最终 100 − "+fr(p+"²",100)+" = "+fmt(final)+(p>0?" < 100。相同百分率不能抵消。":" = 100（p = 0 的边界）。")+(p===100?"降后为 0，0 × 2 仍为 0；不能以 0 为分母计算相对变化率。":"");}
        else msg=(st.percent === "growth"?"增长 "+p+"% 后为原来的 ":st.percent === "discount"?"降价 "+p+"%（"+fmt((100-p)/10)+" 折）后为原来的 ":"")+fmt(final)+"% = "+fr(fmt(final),100)+" = "+fmt(result)+"。两张百格网的每一格和数轴量值使用同一个单位。";
      }
      read.innerHTML=msg;
      var spoken=read.cloneNode(true);
      Array.prototype.forEach.call(spoken.querySelectorAll(".fr"),function (fraction) {fraction.textContent=fraction.getAttribute("aria-label");});
      svg.setAttribute("aria-label",spoken.textContent);
      U.emit(root,Object.assign({mode:mode,result:result,axisMax:max},st));
    }
    draw();
  });
})();
