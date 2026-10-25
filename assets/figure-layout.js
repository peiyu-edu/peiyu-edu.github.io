/* 响应式图注：数学图元与坐标不动，长说明移至图下，短标签避让并保留引线。 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", states = new WeakMap(), observers = [], queued = false;
  function internal(el) { return el && el.nodeType === 1 && el.hasAttribute("data-figure-layout"); }
  function rect(el, inv) {
    var r = el.getBoundingClientRect(), ps = [[r.left,r.top],[r.right,r.top],[r.left,r.bottom],[r.right,r.bottom]].map(function (p) { return new DOMPoint(p[0],p[1]).matrixTransform(inv); });
    return { x: Math.min.apply(null,ps.map(function(p){return p.x;})), y: Math.min.apply(null,ps.map(function(p){return p.y;})),
      w: Math.max.apply(null,ps.map(function(p){return p.x;}))-Math.min.apply(null,ps.map(function(p){return p.x;})),
      h: Math.max.apply(null,ps.map(function(p){return p.y;}))-Math.min.apply(null,ps.map(function(p){return p.y;})) };
  }
  function overlap(a,b,pad) { return Math.max(0,Math.min(a.x+a.w+pad,b.x+b.w)-Math.max(a.x-pad,b.x))*Math.max(0,Math.min(a.y+a.h+pad,b.y+b.h)-Math.max(a.y-pad,b.y)); }
  function node(tag, attrs) {
    var el=document.createElementNS(NS,tag); el.setAttribute("data-figure-layout","1");
    Object.keys(attrs).forEach(function(k){el.setAttribute(k,attrs[k]);});return el;
  }
  function state(svg) {
    var s=states.get(svg);if(!s){s={ labels:new WeakMap(),notes:null,nextOrder:0 };states.set(svg,s);}return s;
  }
  function fitCamera(svg) {
    if(!svg.hasAttribute('data-fit-camera')&&!svg.classList.contains('iso-fig'))return;
    var vb=svg.viewBox.baseVal,m=svg.getScreenCTM();if(!m)return;
    var camera=svg.querySelector('g[data-figure-camera]');if(camera)camera.removeAttribute('transform');
    var inv=m.inverse(), boxes=[];
    [].forEach.call(svg.querySelectorAll('path,line,polygon,polyline,circle,ellipse,rect'),function(el){
      if(el.closest('defs,[data-figure-layout]')||el.matches('.peiyu-hit,.hit'))return;
      var cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<0.1||(cs.fill==='none'&&cs.stroke==='none')||cs.fill==='transparent')return;
      var box=rect(el,inv);
      for(var parent=el;parent&&parent!==svg;parent=parent.parentElement){
        var clip=getComputedStyle(parent).clipPath, match=clip&&clip.match(/#([^"')]+)/);
        var definition=match&&document.getElementById(match[1]), region=definition&&definition.querySelector('rect');
        if(region){
          var cm=inv.multiply(parent.getScreenCTM()), x=region.x.baseVal.value,y=region.y.baseVal.value,w=region.width.baseVal.value,h=region.height.baseVal.value;
          var pts=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(function(p){return new DOMPoint(p[0],p[1]).matrixTransform(cm);});
          var cx=Math.min.apply(null,pts.map(function(p){return p.x;})),cy=Math.min.apply(null,pts.map(function(p){return p.y;}));
          var cr=Math.max.apply(null,pts.map(function(p){return p.x;})),cb=Math.max.apply(null,pts.map(function(p){return p.y;}));
          var bx=Math.max(box.x,cx),by=Math.max(box.y,cy),br=Math.min(box.x+box.w,cr),bb=Math.min(box.y+box.h,cb);box={x:bx,y:by,w:Math.max(0,br-bx),h:Math.max(0,bb-by)};
        }
      }
      if(box.w||box.h)boxes.push(box);
    });
    if(!boxes.length)return;
    var left=Math.min.apply(null,boxes.map(function(b){return b.x;})),right=Math.max.apply(null,boxes.map(function(b){return b.x+b.w;}));
    var top=Math.min.apply(null,boxes.map(function(b){return b.y;})),bottom=Math.max.apply(null,boxes.map(function(b){return b.y+b.h;}));
    var pad=22;
    if(left>=vb.x+pad&&right<=vb.x+vb.width-pad&&top>=vb.y+pad&&bottom<=vb.y+vb.height-pad)return;
    var k=Math.min(1,(vb.width-2*pad)/Math.max(1,right-left),(vb.height-2*pad)/Math.max(1,bottom-top));
    if(!camera){camera=document.createElementNS(NS,'g');camera.setAttribute('data-figure-camera','1');
      [].slice.call(svg.children).forEach(function(el){if(el.tagName.toLowerCase()!=='defs'){el.setAttribute('data-figure-camera-part','1');camera.appendChild(el);}});svg.appendChild(camera);}
    var dx=vb.x+vb.width/2-(left+right)*k/2,dy=vb.y+vb.height/2-(top+bottom)*k/2;
    camera.setAttribute('transform','translate('+dx+' '+dy+') scale('+k+')');
  }
  function prepare(svg) {
    var s=state(svg);
    [].forEach.call(svg.querySelectorAll('[data-figure-layout]'),function(el){el.remove();});
    if(s.notes){s.notes.remove();s.notes=null;}
    (s.hidden||[]).forEach(function(old){
      if(old.el.style.visibility==='hidden')old.el.style.visibility=old.visibility;
      if(old.aria===null)old.el.removeAttribute('aria-hidden');else old.el.setAttribute('aria-hidden',old.aria);
    });
    s.hidden=[];
    fitCamera(svg);
  }
  function fit(svg) {
    if(svg.closest('.katex')||!svg.getScreenCTM())return;
    var vb=svg.viewBox.baseVal, sr=svg.getBoundingClientRect();if(!vb.width||!sr.width)return;
    var s=state(svg), m=svg.getScreenCTM(), inv=m.inverse(), scale=Math.hypot(m.a,m.b), pad=3/scale;
    var labels=[], points=[], placed=[], notes=[];
    var layer=node('g',{class:'figure-label-layer'});svg.appendChild(layer);
    [].forEach.call(svg.querySelectorAll('circle'),function(c){
      if(c.closest('defs')||c.matches('.peiyu-hit,.hit'))return;
      var style=getComputedStyle(c);if(style.fill==='transparent'||style.fill==='none'||Number(style.opacity)<0.1)return;
      var b=rect(c,inv);if(b.w<=24/scale&&b.h<=24/scale)points.push({x:b.x+b.w/2,y:b.y+b.h/2,r:Math.max(b.w,b.h)/2});
    });
    [].forEach.call(svg.querySelectorAll('text'),function(t){
      if(t.closest('[data-figure-layout]'))return;
      var style=getComputedStyle(t), content=t.textContent.trim();
      if(!content||t.children.length||style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<0.1||!t.getBoundingClientRect().width)return;
      for(var parent=t.parentElement;parent&&parent!==svg;parent=parent.parentElement){var ps=getComputedStyle(parent);if(ps.display==='none'||ps.visibility==='hidden'||Number(ps.opacity)<0.1)return;}
      if(t.closest('defs,.tri-cell,.hd[data-k="c"],[role="button"]')){if(!t.closest('defs'))placed.push(rect(t,inv));return;}
      var previous=s.labels.get(t), order=previous?previous.order:++s.nextOrder;s.labels.set(t,{order:order});
      var matrix=inv.multiply(t.getScreenCTM()), clone=t.cloneNode(true);
      clone.removeAttribute('id');clone.setAttribute('data-figure-label','1');
      clone.setAttribute('transform','matrix('+[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f].join(' ')+')');
      ['fontSize','fontFamily','fontWeight','fontStyle','fill','fillOpacity','stroke','strokeWidth','strokeOpacity','textAnchor','dominantBaseline','letterSpacing'].forEach(function(k){clone.style[k]=style[k];});
      clone.style.fontSize=Math.max(parseFloat(style.fontSize),12/Math.hypot(t.getScreenCTM().a,t.getScreenCTM().b))+'px';
      clone.style.visibility='visible';clone.style.pointerEvents='none';layer.appendChild(clone);
      var original={text:t.textContent,transform:clone.getAttribute('transform'),marker:null,placedTransform:null,order:order};
      labels.push({el:clone,original:original,base:rect(clone,inv)});
      s.hidden.push({el:t,visibility:t.style.visibility,aria:t.getAttribute('aria-hidden')});t.style.visibility='hidden';t.setAttribute('aria-hidden','true');
    });
    function marker(item) {
      var n=notes.length+1, mark=n<=20?String.fromCharCode(9311+n):'['+n+']';
      notes.push({mark:mark,text:item.original.text});item.original.marker=mark;
      item.el.textContent=mark;item.el.setAttribute('aria-label',item.original.text);item.base=rect(item.el,inv);return item;
    }
    function move(item,dx,dy) {
      var tm=item.el.getScreenCTM(), ti=tm.inverse();
      var a=new DOMPoint(tm.e,tm.f).matrixTransform(ti), b=new DOMPoint(tm.e+m.a*dx+m.c*dy,tm.f+m.b*dx+m.d*dy).matrixTransform(ti);
      var transform=(item.original.transform||'')+' translate('+(b.x-a.x)+' '+(b.y-a.y)+')';
      item.el.setAttribute('transform',transform);item.original.placedTransform=transform;
    }
    labels.sort(function(a,b){return a.original.order-b.original.order;});
    labels.forEach(function(item){
      var b=item.base;
      if((sr.width<480&&b.w*scale>Math.max(120,sr.width*0.42))||b.w>vb.width-pad*2)marker(item);
    });
    // Small, direct labels take precedence over prose. Each displaced label keeps
    // a short leader to its original position; neither axes nor data points move.
    labels.sort(function(a,b){return a.base.w-b.base.w||a.original.order-b.original.order;});
    function choose(base) {
      var step=Math.max(base.h+pad*2,14/scale), choices=[];
      for(var ring=0;ring<=5;ring++){
        var offsets=ring===0?[[0,0]]:[[0,-ring*step],[0,ring*step],[ring*step,0],[-ring*step,0],[ring*step,-ring*step],[-ring*step,-ring*step],[ring*step,ring*step],[-ring*step,ring*step]];
        offsets.forEach(function(o){
          var x=Math.max(vb.x+pad,Math.min(vb.x+vb.width-pad-base.w,base.x+o[0]));
          var y=Math.max(vb.y+pad,Math.min(vb.y+vb.height-pad-base.h,base.y+o[1]));
          var box={x:x,y:y,w:base.w,h:base.h}, score=0;
          placed.forEach(function(p){score+=overlap(box,p,pad)*1000000;});
          points.forEach(function(p){if(p.x>box.x-pad&&p.x<box.x+box.w+pad&&p.y>box.y-pad&&p.y<box.y+box.h+pad)score+=1000000000;});
          score+=(x-base.x)*(x-base.x)+(y-base.y)*(y-base.y);
          choices.push({box:box,score:score});
        });
      }
      choices.sort(function(a,b){return a.score-b.score;});return choices[0];
    }
    labels.forEach(function(item){
      var base=item.base,best=choose(base);
      var collision=placed.some(function(p){return overlap(best.box,p,pad)>0;});
      if(collision&&!item.original.marker&&base.w>36/scale){marker(item);base=item.base;best=choose(base);}
      var dx=best.box.x-base.x,dy=best.box.y-base.y;
      if(Math.abs(dx)+Math.abs(dy)>0.05)move(item,dx,dy);
      var actual=rect(item.el,inv);placed.push(actual);
      if(Math.hypot(dx,dy)*scale>5&&base.x>=vb.x&&base.x+base.w<=vb.x+vb.width&&base.y>=vb.y&&base.y+base.h<=vb.y+vb.height){
        layer.insertBefore(node('line',{x1:base.x+base.w/2,y1:base.y+base.h/2,x2:actual.x+actual.w/2,y2:actual.y+actual.h/2,stroke:'var(--muted)','stroke-width':1,'stroke-dasharray':'2 2','pointer-events':'none'}),layer.firstChild);
      }
      // Match the text's own coordinate system. Opaque backing is visible and is
      // explicitly checked by the auditor before dismissing a covered line.
      var color=item.el.style.fill, card=getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
      function lightness(c){var rgb=c.match(/[0-9.]+/g);if(c[0]==='#'){var h=c.slice(1);if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');rgb=[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}return rgb&&rgb.length>=3?(+rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722)/255:1;}
      var backing=Math.abs(lightness(color)-lightness(card))<0.25?'var(--fg)':'var(--card)';
      var bb=item.el.getBBox(), bg=node('rect',{x:bb.x-2,y:bb.y-1,width:bb.width+4,height:bb.height+2,rx:2,fill:backing,'pointer-events':'none',class:'figure-label-bg'});
      if(item.el.getAttribute('transform'))bg.setAttribute('transform',item.el.getAttribute('transform'));
      var parent=item.el.parentNode;parent.appendChild(bg);parent.appendChild(item.el);
    });
    if(notes.length){
      var list=document.createElement('ol');list.className='figure-notes';list.setAttribute('data-figure-layout','1');list.setAttribute('aria-label','图中编号说明');
      notes.forEach(function(n){var li=document.createElement('li'),mark=document.createElement('b'),text=document.createElement('span');mark.textContent=n.mark;text.textContent=n.text;li.appendChild(mark);li.appendChild(text);list.appendChild(li);});
      svg.parentNode.insertBefore(list,svg.nextSibling);s.notes=list;
    }
    observers.forEach(function(o){o.takeRecords();});
  }
  function request() {if(!queued){queued=true;queueMicrotask(function(){queued=false;if(window.Peiyu&&Peiyu.layoutNow)Peiyu.layoutNow();});}}
  window.PeiyuFigureLayout={prepare:prepare,fit:fit};
  var observer=new MutationObserver(function(records){
    var change=records.some(function(r){return r.target===document.documentElement||(r.target.closest&&r.target.closest('svg')&&!r.target.closest('.katex'))||[].some.call(r.addedNodes,function(n){return n.nodeType===1&&!internal(n)&&(n.matches('svg')||n.querySelector('svg'));});});
    if(change)request();
  });
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['d','x','y','cx','cy','transform','style','class']});
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  observers.push(observer);document.addEventListener('click',request);window.addEventListener('resize',request);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',request);request();
})();
