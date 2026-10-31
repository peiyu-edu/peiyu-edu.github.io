/* 线段式子、等价天平、单位“1”。加载 manip.js 后使用。
   cfg.mode: tape-expr（默认）/ balance-eq / unit-one-tape。
   tape-expr: relation=add|multiple|plus|minus|total|distance|price，a=10,d=18,k=3,b=5。
   balance-eq: form=add|mul|mixed|nonstandard，a=3,b=6,c=30,m=8,n=9,k=5。
   unit-one-tape: whole=120,n=3,d=5,unknown=false。所有量非负，分率为正数（最高 200%）。
   例：data-manip="algebra-balance-tape" data-cfg='{"mode":"balance-eq","form":"mixed"}'。
   原型：PY-141-2 / dsp-rog8 / 64d6dc72；当前交付：dsp-rog12 (rog/codex)。
   单位“1”未知时用部分量 part（1–400）逆推整体；result 是当前求出的量。
   manip:change 包含当前参数、result；天平还包含左右质量、移除量和均分因子。
*/
(function () {
  "use strict";
  var U=PeiyuManip.util,scope='.manip[data-manip="algebra-balance-tape"]';
  var style=document.createElement("style");
  style.textContent=scope+' {min-width:0;max-width:100%}'+
    scope+' .fig-scroll {overflow-x:auto;max-width:100%}'+
    scope+' svg.stage {width:420px;min-width:420px;max-width:420px;max-height:240px;height:auto}'+
    scope+' svg text {font-size:17px;fill:var(--fg)}'+
    scope+' .num-controls {display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}'+
    scope+' label {display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}'+
    scope+' input {width:100%;min-height:44px;accent-color:var(--a)}'+
    scope+' [hidden] {display:none}'+scope+' .read {overflow-wrap:anywhere}'+scope+' .boundary {color:var(--no);font-weight:700}'+scope+' :focus-visible {outline:3px solid var(--hl)}';
  document.head.appendChild(style);
  function num(v,f,lo,hi) {v=Number(v);return Math.max(lo,Math.min(hi,Number.isFinite(v)?Math.round(v):f));}
  function fmt(v) {return String(Number(v.toFixed(3)));}
  function fr(n,d) {return '<span class="fr" aria-label="'+d+'分之'+n+'"><span>'+n+'</span><span class="bar"></span><span>'+d+'</span></span>';}
  function exact(n,d) {
    var a=Math.abs(n),b=d;while(b){var t=a%b;a=b;b=t;}
    return d/a===1?String(n/a):fr(n/a,d/a);
  }
  function text(svg,x,y,value,anchor) {var t=U.el("text",{x:x,y:y,"text-anchor":anchor||"start"},svg);t.textContent=value;}
  function line(svg,x1,y1,x2,y2,tone) {return U.el("line",{x1:x1,y1:y1,x2:x2,y2:y2,stroke:"var(--"+(tone||"fg")+")","stroke-width":3},svg);}
  function box(svg,x,y,w,tone) {return U.el("rect",{x:x,y:y,width:Math.max(0,w),height:26,fill:"var(--"+tone+")","fill-opacity":0.45,stroke:"var(--fg)"},svg);}
  PeiyuManip.register("algebra-balance-tape", function (root,cfg) {
    var modes=["tape-expr","balance-eq","unit-one-tape"],mode=modes.indexOf(cfg.mode)>=0?cfg.mode:modes[0];
    var st={a:num(cfg.a,10,0,200),d:num(cfg.d,18,2,40),k:num(cfg.k,3,1,6),b:num(cfg.b,5,0,40),
      relation:cfg.relation||"add",form:cfg.form||"mixed",c:num(cfg.c,30,1,90),m:num(cfg.m,8,1,30),n:num(cfg.n,9,1,30),
      whole:num(cfg.whole,120,20,200),part:1,unknown:cfg.unknown===true,remove:0,divide:0,oneSide:false};
    if(["add","multiple","plus","minus","total","distance","price"].indexOf(st.relation)<0) st.relation="add";
    if(["add","mul","mixed","nonstandard"].indexOf(st.form)<0) st.form="mixed";
    if(mode==="balance-eq") {st.a=num(cfg.a,3,1,6);st.b=num(cfg.b,6,0,18);st.k=num(cfg.k,5,0,15);}
    if(mode==="unit-one-tape") {st.d=num(cfg.d,5,2,12);st.n=num(cfg.n,3,1,2*st.d);}
    st.part=num(cfg.part,Math.round(st.whole*st.n/st.d),1,400);
    var initial=Object.assign({},st),inputs={},actions={};
    var wrap=root.appendChild(U.h("div","fig-scroll"));wrap.setAttribute("role","region");wrap.setAttribute("aria-label","图示（窄屏可左右滑动）");wrap.tabIndex=0;
    var svg=U.el("svg",{class:"stage",viewBox:"0 0 460 220",role:"img","aria-label":"线段与等量关系"},wrap);
    var controls=root.appendChild(U.h("div","num-controls")),buttons=root.appendChild(U.h("div","ctrls"));
    var read=root.appendChild(U.h("p","read"));read.setAttribute("aria-live","polite");
    function resetSteps() {st.remove=0;st.divide=0;st.oneSide=false;}
    function range(key,label,lo,hi,step) {
      var l=controls.appendChild(U.h("label")),title=l.appendChild(U.h("span")),input=l.appendChild(U.h("input"));
      input.type="range";input.min=lo;input.max=hi;input.step=step||1;input.dataset.key=key;input.setAttribute("aria-label",label);
      inputs[key]={input:input,title:title,label:label};input.addEventListener("input",function () {st[key]=Number(input.value);if(mode==="balance-eq"&&key!=="remove"&&key!=="divide")resetSteps();draw();});
    }
    function button(label,fn,key) {
      var b=buttons.appendChild(U.btn(label,function () {fn();draw();}));
      if(key) {b.dataset.action=key;actions[key]=b;}return b;
    }
    if(mode==="tape-expr") {
      range("a","未知量 a 的试值",0,200);range("d","差 d",2,40);range("k","倍数或时间 k",1,6);range("b","部分量 b",0,40);
      [["add","和差（年龄）"],["multiple","倍数"],["plus","倍数加部分"],["minus","倍数减部分"],["total","总量与分量"],["distance","速度与路程"],["price","单价与总价"]].forEach(function(p){button(p[1],function(){st.relation=p[0];},p[0]);});
      button("试 a = 200",function(){st.a=200;st.relation="add";},"age-boundary");
    } else if(mode==="balance-eq") {
      range("a","系数 a",1,6);range("b","常数 b",0,18);range("c","总质量 c",1,90);range("m","左项 m",1,30);range("n","左项 n",1,30);range("k","右项 k",0,15);
      range("remove","拿走进度（%）",0,100);range("divide","均分进度（%）",0,100);
      [["add","x + b = c"],["mul","a·x = c"],["mixed","a·x + b = c"],["nonstandard","m + n = x + k"]].forEach(function(p){button(p[1],function(){st.form=p[0];resetSteps();},p[0]);});
      button("两边同时拿走一步",function(){st.remove=Math.min(100,st.remove+25);},"remove-step");
      button("两边同时均分一步",function(){if(st.remove===100)st.divide=Math.min(100,st.divide+25);},"divide-step");
      button("只对左边执行当前操作",function(){st.oneSide=!st.oneSide;},"one-side");
    } else {
      range("whole","已知整体量",20,200);range("part","已知对应量",1,400);range("d","分率的分母",2,12);range("n","分率的分子",1,2*st.d);
      button("单位“1”已知",function(){st.unknown=false;},"known");button("单位“1”未知",function(){st.unknown=true;},"unknown");
    }
    button("重来",function(){st=Object.assign({},initial);},"reset");
    function visible(keys) {Object.keys(inputs).forEach(function(key){inputs[key].input.closest("label").hidden=keys.indexOf(key)<0;});}
    function draw() {
      svg.replaceChildren();var result=0,msg="",extra={};
      if(mode==="tape-expr") {
        var r=st.relation,expr=r==="add"?"a + d":r==="multiple"?"k·a":r==="plus"?"k·a + b":r==="minus"?"k·a − b":r==="total"?"a + b":"a·k";
        result=r==="add"?st.a+st.d:r==="plus"?st.k*st.a+st.b:r==="minus"?st.k*st.a-st.b:r==="total"?st.a+st.b:st.a*st.k;
        visible(["a"].concat(r==="add"?["d"]:r==="total"?["b"]:r==="plus"||r==="minus"?["k","b"]:["k"]));
        var max=Math.max(1,st.a,r==="add"||r==="total"?0:st.k*st.a,r==="add"||r==="total"?result:0,result),unit=390/max;
        text(svg,30,28,"基准量 a = "+fmt(st.a));
        box(svg,30,44,st.a*unit,"a").dataset.role="base";
        var segments=U.el("g",{"data-role":"quantity"},svg);
        text(svg,30,105,expr+" = "+fmt(result));
        if(r==="add"||r==="total") {box(segments,30,122,st.a*unit,"a");box(segments,30+st.a*unit,122,(result-st.a)*unit,"b");}
        else if(result>=0) {for(var i=0;i<st.k;i++) {
          var kept=r==="minus"?Math.max(0,Math.min(st.a,result-i*st.a)):st.a;
          box(segments,30+i*st.a*unit,122,kept*unit,"a");
        }
          if(r==="plus")box(segments,30+st.k*st.a*unit,122,st.b*unit,"b");
          if(r==="minus"&&result>=0) {var removed=box(segments,30+result*unit,122,st.b*unit,"no");removed.setAttribute("fill-opacity",0.65);removed.dataset.role="removed";
            line(svg,30+result*unit,116,30+result*unit,156,"no");}}
        var substitution=r==="add"?fmt(st.a)+" + "+st.d:r==="total"?fmt(st.a)+" + "+st.b:st.k+" × "+fmt(st.a)+(r==="plus"?" + "+st.b:r==="minus"?" − "+st.b:"");
        if(result<0) text(svg,30,148,"数量不足，不能画非负剩余线段");
        var boundary=(r==="add"&&(st.a>120||result>120))||result<0;
        text(svg,30,176,boundary?"超出本情境的实际取值范围":"");
        read.classList.toggle("boundary",boundary);
        extra={valid:!boundary,scale:unit};
        text(svg,30,205,r==="distance"?"路程 = 速度 × 时间":r==="price"?"总价 = 单价 × 数量":"同色段表示同一个 a");
        msg=expr+"，代入 a = "+fmt(st.a)+"："+substitution+" = "+fmt(result)+"。";
        if(r==="distance")msg+="速度 "+fmt(st.a)+" 千米每时，走 "+st.k+" 小时，路程 "+fmt(result)+" 千米。";
        else if(r==="price")msg+="单价 "+fmt(st.a)+" 元，买 "+st.k+" 件，总价 "+fmt(result)+" 元。";
        else if(r==="add")msg+=st.a>120||result>120?"实际意义边界：算式仍能计算，但本情境约定双方年龄均不超过 120 岁，应有 0 ≤ a ≤ "+(120-st.d)+"；当前取值超出范围。":"年龄相差 "+st.d+" 岁，双方每年同增一岁，差保持不变。";
        else if(result<0)msg+="实际意义边界：要拿走的量大于原量，不能用非负数量的线段表示；算式值为负。";
        else if(r==="minus")msg+="红段表示拿走的 b，不计入剩余线段。";
      } else if(mode==="balance-eq") {
        var ns=st.form==="nonstandard",a=st.form==="add"||ns?1:st.a,b=st.form==="mul"?0:ns?st.k:st.b;
        if(ns) {st.k=Math.min(st.k,st.m+st.n);b=st.k;}
        else st.c=Math.max(st.c,b);
        if(b===0)st.remove=100;
        var c=ns?st.m+st.n:st.c,x=(c-b)/a,removed=b*st.remove/100;
        if(st.remove<100)st.divide=0;
        var divisor=1+(a-1)*st.divide/100;
        // The failed operation applies the same removal/division to the left only.
        var rightRemoved=st.oneSide?0:removed,rightDivisor=st.oneSide?1:divisor;
        var left=(c-removed)/divisor,right=(c-rightRemoved)/rightDivisor;
        var equal=Math.abs(left-right)<1e-9,tilt=equal?0:left>right?12:-12;
        U.el("path",{d:"M210 194 L250 194 L230 105 Z",fill:"var(--line)",stroke:"var(--fg)"},svg);
        var beam=line(svg,110,100+tilt,350,100-tilt,equal?"a":"no");beam.dataset.role="beam";
        line(svg,110,100+tilt,110,153+tilt);line(svg,350,100-tilt,350,153-tilt);
        line(svg,25,156+tilt,195,156+tilt);line(svg,265,156-tilt,435,156-tilt);
        var unit=170/Math.max(1,c);
        function load(side,start,y,div,rem,symbolic) {
          var g=U.el("g",{"data-role":side+"-load"},svg);
          if(symbolic) {
            for(var j=0;j<a;j++)box(g,start+j*x*unit/div,y,x*unit/div,"a");
            box(g,start+a*x*unit/div,y,(b-rem)*unit/div,"b");
          } else box(g,start,y,(c-rem)*unit/div,"b");
          var mass=(c-rem)/div;
          text(svg,start+85,y-8,(Number.isInteger(mass)?"":"≈ ")+fmt(mass)+" 克","middle");
        }
        load("left",25,127+tilt,divisor,removed,!ns);
        load("right",265,127-tilt,rightDivisor,rightRemoved,ns);
        text(svg,110,68+tilt,ns?"数值总量":"x 项 + 常数","middle");
        text(svg,350,68-tilt,ns?"x 项 + 常数":"数值总量","middle");
        text(svg,230,28,equal?"= 两边相等":"≠ 质量不同","middle");
        text(svg,230,215,equal?"等号表示两边的量相等":"较重的一边下降","middle");
        var original=ns?st.m+" + "+st.n+" = x + "+b:a===1?"x + "+b+" = "+c:b===0?a+"x = "+c:a+"x + "+b+" = "+c;
        var denominator=100+(a-1)*st.divide;
        function expression(symbolic,rem,den) {
          return symbolic?exact(a*100,den)+"x"+(b-rem>1e-9?" + "+exact(Math.round((b-rem)*100),den):"")
            :exact(Math.round((c-rem)*100),den);
        }
        var currentLeft=expression(!ns,removed,denominator);
        var currentRight=expression(ns,rightRemoved,st.oneSide?100:denominator);
        msg="原式："+original+"。"+(st.oneSide?"仅左边":"两边同时")+"拿走 "+fmt(removed)+" 克，再"+(st.oneSide?"仅左边":"两边同时")+"除以 "+fmt(divisor)+"。";
        msg+="当前："+currentLeft+(equal?" = ":" ≠ ")+currentRight+"。";
        if(ns)msg+=equal?"等号左右可以交换，仍表示相同的量。":"原等式的左右可以交换；当前单边操作破坏了原来的相等关系。";
        if(!equal)msg+="报警：只动左边，原来的 x 已不能使当前两边相等。";
        else if(st.oneSide)msg+="当前操作未改变质量；再调拿走或均分进度，观察会怎样。";
        else if(st.remove<100)msg+="先完整拿走常数，才能进入均分。";
        else if(st.divide<100&&a>1)msg+="常数已拿完，继续把两边平均分成 "+a+" 份。";
        else msg+="x = "+exact(c-b,a)+"；代回原式，两边都为 "+c+"。";
        result=x;extra={left:left,right:right,removed:removed,rightRemoved:rightRemoved,divisor:divisor,rightDivisor:rightDivisor,
          coefficient:a/divisor,constant:(b-removed)/divisor,equal:equal,scale:unit};
        visible(ns?["m","n","k","remove"]:st.form==="add"?["b","c","remove"]:st.form==="mul"?["a","c","divide"]:["a","b","c","remove","divide"]);
        inputs.c.input.min=b;inputs.k.input.max=Math.min(15,st.m+st.n);
        inputs.divide.input.disabled=st.remove<100||a===1;
        actions["remove-step"].disabled=st.remove===100;
        actions["divide-step"].disabled=inputs.divide.input.disabled||st.divide===100;
        actions["one-side"].setAttribute("aria-pressed",String(st.oneSide));
        actions["one-side"].textContent=st.oneSide?"恢复两边同时操作":"只对左边执行当前操作";

      } else {
        st.n=Math.min(st.n,2*st.d);inputs.n.input.max=2*st.d;
        var whole=st.unknown?st.part*st.d/st.n:st.whole;
        var part=st.unknown?st.part:st.whole*st.n/st.d;
        result=st.unknown?whole:part;
        var unitWidth=390/Math.max(st.d,st.n);
        text(svg,30,28,st.unknown?"整体 x：单位“1”未知":"整体 "+st.whole+"：单位“1”已知");
        var wholeBar=U.el("g",{"data-role":"whole"},svg);
        for(var j=0;j<st.d;j++)box(wholeBar,30+unitWidth*j,46,unitWidth,"a");
        text(svg,30,109,"对应量"+(Number.isInteger(part)?" ":"约 ")+fmt(part)+"，占整体的 "+st.d+"分之"+st.n);
        var partBar=U.el("g",{"data-role":"part"},svg);
        for(j=0;j<st.n;j++)box(partBar,30+unitWidth*j,126,unitWidth,"b");
        text(svg,30,201,st.unknown?"从对应量逆推整体":"从整体顺向求对应量");
        var partExact=st.unknown?String(st.part):exact(st.whole*st.n,st.d);
        msg=st.unknown?"设单位“1”为 x：x × "+fr(st.n,st.d)+" = "+partExact+"，所以 x = "+partExact+" ÷ "+fr(st.n,st.d)+" = "+exact(st.part*st.d,st.n)+"。":"单位“1”已知："+st.whole+" × "+fr(st.n,st.d)+" = "+partExact+"。";
        msg+="两段用同一长度单位；对应量可以大于整体，分率最高为 200%。";
        extra={wholeValue:whole,partValue:part};
        visible([st.unknown?"part":"whole","d","n"]);
        actions.known.setAttribute("aria-pressed",String(!st.unknown));
        actions.unknown.setAttribute("aria-pressed",String(st.unknown));
      }
      Object.keys(inputs).forEach(function(key){var o=inputs[key];o.input.value=st[key];o.title.textContent=o.label+"："+fmt(st[key]);});
      Object.keys(actions).forEach(function(key){
        if(mode==="tape-expr"&&key!=="reset"&&key!=="age-boundary")actions[key].setAttribute("aria-pressed",String(key===st.relation));
        if(mode==="balance-eq"&&["add","mul","mixed","nonstandard"].indexOf(key)>=0)actions[key].setAttribute("aria-pressed",String(key===st.form));
      });
      read.innerHTML=msg;
      // Preserve fraction pronunciation when flattening the readout into an image label.
      var spoken=read.cloneNode(true);
      spoken.querySelectorAll(".fr").forEach(function(f){f.replaceWith(document.createTextNode(f.getAttribute("aria-label")));});
      svg.setAttribute("aria-label",spoken.textContent);
      U.emit(root,Object.assign({mode:mode,result:result},st,extra));
    }
    draw();
  });
})();
