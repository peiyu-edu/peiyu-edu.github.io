(function(){
"use strict";
var currentTab="dist";
var svg=document.getElementById("geoSvg");
var desc=document.getElementById("labDesc");
var tabBtns=document.querySelectorAll("#labTabs button");
var ctrlDist=document.getElementById("ctrlDist");
var ctrlLineAngle=document.getElementById("ctrlLineAngle");
var ctrlDihedral=document.getElementById("ctrlDihedral");
var heightRange=document.getElementById("heightRange");
var heightOut=document.getElementById("heightOut");
var offsetRange=document.getElementById("offsetRange");
var offsetOut=document.getElementById("offsetOut");
var thetaLineRange=document.getElementById("thetaLineRange");
var thetaLineOut=document.getElementById("thetaLineOut");
var invertLineCheck=document.getElementById("invertLineCheck");
var dihedralRange=document.getElementById("dihedralRange");
var dihedralOut=document.getElementById("dihedralOut");
var resetBtn=document.getElementById("resetBtn");
var resetBtn2=document.getElementById("resetBtn2");
var resetBtn3=document.getElementById("resetBtn3");
var btnA1=document.getElementById("btnA1");
var btnA2=document.getElementById("btnA2");
var btnA3=document.getElementById("btnA3");
var currentPtA=[0,0,0];
function createSvgEl(tag,attrs){
var el=document.createElementNS("http://www.w3.org/2000/svg",tag);
for(var k in attrs){
if(Object.prototype.hasOwnProperty.call(attrs,k)){
el.setAttribute(k,attrs[k]);
}
}
return el;
}
var KX=0.6*0.81915;
var KY=0.6*0.57357;
function proj(x,y,z){
return{
x:260+x*40+y*40*KX,
y:200+y*40*KY-z*40,
world:[x,y,z]
};
}
function addDefs(){
var defs=createSvgEl("defs");
var markers=[
{id:"m-arr-a",color:"var(--a)"},
{id:"m-arr-c",color:"var(--c)"},
{id:"m-arr-no",color:"var(--no)"},
{id:"m-arr-b",color:"var(--b)"}
];
markers.forEach(function(m){
var marker=createSvgEl("marker",{
id:m.id,
viewBox:"0 0 10 10",
refX:"7",
refY:"5",
markerWidth:"6",
markerHeight:"6",
orient:"auto-start-reverse"
});
var path=createSvgEl("path",{
d:"M 0 1.5 L 8 5 L 0 8.5 z",
fill:m.color
});
marker.appendChild(path);
defs.appendChild(marker);
});
svg.appendChild(defs);
}
function drawLine(p1,p2,color,w,dash,markerEnd){
var attrs={
x1:p1.x.toFixed(4),
y1:p1.y.toFixed(4),
x2:p2.x.toFixed(4),
y2:p2.y.toFixed(4),
stroke:color,
"stroke-width":w||"1.8"
};
if(dash)attrs["stroke-dasharray"]=dash;
if(markerEnd)attrs["marker-end"]="url(#"+markerEnd+")";
if(p1.world&&p2.world){attrs["data-world-start"]=JSON.stringify(p1.world);attrs["data-world-end"]=JSON.stringify(p2.world);}
var line=createSvgEl("line",attrs);
svg.appendChild(line);
return line;
}
function drawPolygon(pts,fill,stroke,w,dash){
var ptStr=pts.map(function(p){return p.x.toFixed(1)+","+p.y.toFixed(1);}).join(" ");
var attrs={
points:ptStr,
fill:fill||"none",
stroke:stroke||"none",
"stroke-width":w||"1.5"
};
if(dash)attrs["stroke-dasharray"]=dash;
if(pts.every(function(p){return p.world;}))attrs["data-world-points"]=JSON.stringify(pts.map(function(p){return p.world;}));
var poly=createSvgEl("polygon",attrs);
svg.appendChild(poly);
return poly;
}
function drawCircle(p,r,fill,stroke){
var c=createSvgEl("circle",{
cx:p.x.toFixed(1),
cy:p.y.toFixed(1),
r:r||"4",
fill:fill||"var(--fg)",
stroke:stroke||"none"
});
svg.appendChild(c);
return c;
}
function drawText(p,text,color,dx,dy,fontSize,fontWeight){
var t=createSvgEl("text",{
x:(p.x+(dx||0)).toFixed(1),
y:(p.y+(dy||0)).toFixed(1),
fill:color||"var(--fg)",
"font-size":fontSize||"22",
"font-weight":fontWeight||"600"
});
t.textContent=text;
svg.appendChild(t);
return t;
}


function role(el,name){el.setAttribute("data-angle-role",name);return el;}
function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function length3(a){return Math.hypot(a[0],a[1],a[2]);}
function angle3(a,b){return Math.acos(Math.max(-1,Math.min(1,dot3(a,b)/(length3(a)*length3(b)))))*180/Math.PI;}
function clean(x){return Math.abs(x)<1e-12?0:x;}
function arc3(origin,u,v,r,start,end,name,color){
var path="";for(var j=0;j<=48;j++){var t=(start+(end-start)*j/48)*Math.PI/180,p=proj(origin[0]+r*(u[0]*Math.cos(t)+v[0]*Math.sin(t)),origin[1]+r*(u[1]*Math.cos(t)+v[1]*Math.sin(t)),origin[2]+r*(u[2]*Math.cos(t)+v[2]*Math.sin(t)));path+=(j?" L ":"M ")+p.x+" "+p.y;}
var el=createSvgEl("path",{d:path,fill:"none",stroke:color,"stroke-width":1.8,"data-angle-role":name});svg.appendChild(el);return el;
}
function beginMain(){svg.innerHTML="";svg.setAttribute("viewBox","0 0 560 370");addDefs();}

function renderDist(){
beginMain();
var h=parseFloat(heightRange?heightRange.value:25)/10,offX=parseFloat(offsetRange?offsetRange.value:5)/10;
if(!isFinite(h))h=2.5;if(!isFinite(offX))offX=.5;
if(heightOut)heightOut.textContent=h.toFixed(1);if(offsetOut)offsetOut.textContent=offX.toFixed(1);
role(drawPolygon([proj(-3.2,-1.8,0),proj(3.2,-1.8,0),proj(2.6,2.2,0),proj(-3.8,2.2,0)],"var(--ok-soft)","var(--a)",1.8),"distance-plane");
drawText(proj(-3.1,-1.5,0),"α","var(--a)",8,12,22);
var A=currentPtA,P=[offX,.4,h],H=[offX,.4,0],N=[A[0],A[1],1.8],pa=proj.apply(null,A),pp=proj.apply(null,P),ph=proj.apply(null,H),pn=proj.apply(null,N);
role(drawLine(pa,ph,"var(--muted)",1.4,"3,3"),"distance-horizontal");
role(drawLine(pa,pp,"var(--c)",2.6,null,"m-arr-c"),"distance-vector");
role(drawLine(pa,pn,"var(--a)",2.8,null,"m-arr-a"),"distance-normal");
if(Math.abs(h)>1e-10){role(drawLine(pp,ph,"var(--no)",2.6,"4,3"),"distance-perpendicular");var s=h>0?1:-1;role(drawLine(proj(P[0]+.22,P[1],0),proj(P[0]+.22,P[1],s*.22),"var(--no)",1.2),"distance-right");role(drawLine(proj(P[0]+.22,P[1],s*.22),proj(P[0],P[1],s*.22),"var(--no)",1.2),"distance-right");}
drawCircle(pa,4.5,"var(--c)");drawText(pa,"A","var(--c)",-25,24,22);drawCircle(pp,5,"var(--no)");drawText(pp,Math.abs(h)<1e-10?"P=H":"P","var(--no)",10,-9,22);if(Math.abs(h)>1e-10){drawCircle(ph,4,"var(--no)");drawText(ph,"H","var(--no)",10,25,22);}
drawText(pn,"n","var(--a)",10,-8,22);drawText(proj((A[0]+P[0])/2,(A[1]+P[1])/2,h/2),"AP","var(--c)",-30,-10,22);drawText(proj(P[0],P[1],h/2),"d="+Math.abs(h).toFixed(1),"var(--no)",20,12,22);
if(desc){var dx=P[0]-A[0],dy=P[1]-A[1],nDot=1.8*h;desc.innerHTML="<b>点面距离代数验算</b>：面内参考点 \\(A("+A[0]+","+A[1]+",0)\\)，点 \\(P("+P[0].toFixed(1)+",0.4,"+h.toFixed(1)+")\\)，垂足 \\(H("+P[0].toFixed(1)+",0.4,0)\\)。<br>图中法向量与计算均取 \\(\\boldsymbol n=(0,0,1.8)\\)，\\(\\overrightarrow{AP}=("+dx.toFixed(1)+","+dy.toFixed(1)+","+h.toFixed(1)+")\\)。<br>\\(d=\\dfrac{|\\overrightarrow{AP}\\cdot\\boldsymbol n|}{|\\boldsymbol n|}=\\dfrac{|"+nDot.toFixed(2)+"|}{1.8}="+Math.abs(h).toFixed(1)+"\\)。"+(Math.abs(h)<1e-10?"<br><b>P已在平面内，P=H、距离0；零垂线段不再画直角记号。</b>":"<br>PH沿法向量方向，故H是真正垂足。")+"<br>切换A只改变AP的水平分量，不改变法向投影高；无需先求H的坐标也能算距离。";if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);}
}

function renderLineAngle(){
beginMain();var deg=parseFloat(thetaLineRange?thetaLineRange.value:30);if(!isFinite(deg))deg=30;deg=Math.max(0,Math.min(90,deg));
var invert=!!(invertLineCheck&&invertLineCheck.checked),sign=invert?-1:1,rad=deg*Math.PI/180,len=3.4,hn=Math.hypot(.9,.43),u=[clean(sign*len*Math.cos(rad)*.9/hn),clean(sign*len*Math.cos(rad)*.43/hn),clean(sign*len*Math.sin(rad))],n=[0,0,2.6],O=[0,0,0],H=[u[0],u[1],0],horizontal=Math.hypot(H[0],H[1]);
var phi=angle3(u,n),ratio=clean(Math.abs(dot3(u,n))/(length3(u)*length3(n))),theta=Math.asin(Math.min(1,ratio))*180/Math.PI,small=Math.min(phi,180-phi);
if(thetaLineOut)thetaLineOut.textContent=Math.round(theta)+"°";
role(drawPolygon([proj(-3.2,-1.8,0),proj(3.2,-1.8,0),proj(2.6,2.2,0),proj(-3.8,2.2,0)],"var(--ok-soft)","var(--a)",1.8),"line-plane");drawText(proj(2.7,-1.5,0),"α","var(--a)",4,-4,22);
var po=proj(0,0,0),pu=proj.apply(null,u),pn=proj.apply(null,n);drawCircle(po,4.5,"var(--fg)");drawText(po,"O","var(--fg)",-28,14,22);
role(drawLine(po,pn,"var(--a)",2.8,null,"m-arr-a"),"line-normal");drawText(pn,"n","var(--a)",10,-5,22);
role(drawLine(proj(-u[0],-u[1],-u[2]),pu,"var(--muted)",1.2,"3,4"),"line-support");
if(horizontal>1e-10){role(drawLine(po,proj.apply(null,H),"var(--muted)",1.6,"4,3"),"line-projection");drawText(proj.apply(null,H),"H","var(--muted)",u[0]<0?-24:10,25,22);var uh=[u[0]/horizontal,u[1]/horizontal,0];if(theta>1e-10)arc3(O,uh,[0,0,sign],.7,0,theta,"line-theta-arc","var(--b)");}
if(Math.abs(u[2])>1e-10)role(drawLine(pu,proj.apply(null,H),"var(--no)",1.6,"3,3"),"line-drop");
role(drawLine(po,pu,"var(--b)",3,null,"m-arr-b"),"line-direction");drawCircle(pu,4.5,"var(--b)");role(drawText(pu,invert?"−u":"u","var(--b)",u[0]<0?-38:12,u[2]<0?25:-8,24),"line-direction-label");
var tangent=horizontal>1e-10?[u[0]/horizontal,u[1]/horizontal,0]:[sign*.9/hn,sign*.43/hn,0];if(phi>1e-10)arc3(O,[0,0,1],tangent,.95,0,phi,"line-phi-arc","var(--c)");
drawText({x:370,y:315},"θ="+Math.round(theta)+"°","var(--b)",0,0,22);drawText({x:370,y:345},"φ="+Math.round(phi)+"°","var(--c)",0,0,22);
if(desc){desc.innerHTML="<b>线面角与有向向量夹角</b>：\\(\\theta="+Math.round(theta)+"^\\circ\\)，\\(\\varphi=\\langle"+(invert?"-\\boldsymbol u":"\\boldsymbol u")+",\\boldsymbol n\\rangle="+Math.round(phi)+"^\\circ\\)。<br>方向向量实际坐标为 \\(("+u.map(function(x){return x.toFixed(3);}).join(",")+")\\)，长度恒为3.4；勾选反向时三个分量同时变号，仍是同一直线。<br>\\(\\sin\\theta=\\dfrac{|\\boldsymbol u\\cdot\\boldsymbol n|}{|\\boldsymbol u||\\boldsymbol n|}="+ratio.toFixed(3)+"=|\\cos\\varphi|\\)。<br>取较小夹角 \\(\\psi=\\min(\\varphi,180^\\circ-\\varphi)="+Math.round(small)+"^\\circ\\)，恒有 \\(\\theta+\\psi=90^\\circ\\)。"+(phi<=90?"本态φ≤90°，θ与φ互余。":"本态φ>90°，θ与180°−φ互余，不能写θ+φ=90°。")+(horizontal<1e-10?"<br><b>θ=90°时射影H与O重合，射影向量为零，不能用它和u求夹角；直线垂直平面。</b>":theta<1e-10?"<br>θ=0°，方向平行平面；因图中经过O，这条直线在平面内。":"<br>H是u端点在平面内的射影；3D斜投影中的屏幕角不代表真实空间角。")+"<br>直线方向或法向量朝向取反后，绝对值保证线面角的正弦不变。";if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);}
}

function renderDihedral(){
beginMain();var deg=parseFloat(dihedralRange?dihedralRange.value:120);if(!isFinite(deg))deg=120;deg=Math.max(0,Math.min(180,deg));if(dihedralOut)dihedralOut.textContent=Math.round(deg)+"°";
var mode="out",radios=document.getElementsByName("normDir");for(var i=0;i<radios.length;i++)if(radios[i].checked)mode=radios[i].value;
var rad=deg*Math.PI/180,c=clean(Math.cos(rad)),s=clean(Math.sin(rad)),sign=mode==="out"?1:-1,O=[0,.2,0],a=[1.8,0,0],b=[1.8*c,0,1.8*s],n1=[0,0,-1.9],n2=[-sign*1.9*s,0,sign*1.9*c];
role(drawPolygon([proj(0,-1.6,0),proj(2.6,-1.6,0),proj(2.6,2,0),proj(0,2,0)],"var(--ok-soft)","var(--a)",1.8),"dihedral-plane-a");role(drawPolygon([proj(0,-1.6,0),proj(2.6*c,-1.6,2.6*s),proj(2.6*c,2,2.6*s),proj(0,2,0)],"var(--hl-soft)","var(--c)",1.8),"dihedral-plane-b");
drawText(proj(2.3,-1.3,0),"α","var(--a)",4,20,22);drawText(proj(2.3*c,-1.3,2.3*s),"β","var(--c)",-25,-10,22);
role(drawLine(proj(0,-1.6,0),proj(0,2,0),"var(--fg)",2.6),"dihedral-edge");drawText(proj(0,2.1,0),"l","var(--fg)",10,20,22);
function end(v){return proj(O[0]+v[0],O[1]+v[1],O[2]+v[2]);}var po=proj.apply(null,O);drawCircle(po,4.5,"var(--fg)");
role(drawLine(po,end(a),"var(--a)",2,"3,2"),"dihedral-ray-a");role(drawLine(po,end(b),"var(--c)",2,"3,2"),"dihedral-ray-b");
role(drawLine(po,end(n1),"var(--a)",2.8,null,"m-arr-a"),"dihedral-normal-a");drawText(end(n1),"n₁","var(--a)",8,22,22);
role(drawLine(po,end(n2),"var(--c)",2.8,null,"m-arr-c"),"dihedral-normal-b");drawText(end(n2),"n₂","var(--c)",n2[0]<0?-30:12,n2[2]<0?22:-8,22);
if(deg>0)arc3(O,[1,0,0],[0,0,1],.7,0,deg,"dihedral-angle-arc","var(--b)");
var actual=angle3(a,b),normalAngle=angle3(n1,n2),ratio=clean(dot3(n1,n2)/(length3(n1)*length3(n2))),right=Math.abs(actual-90)<1e-9,boundary=actual<1e-9||actual>180-1e-9,kind=boundary?(actual<90?"零角退化边界":"平角边界"):right?"直二面角":actual>90?"钝二面角":"锐二面角";
drawText({x:385,y:315},"θ="+Math.round(actual)+"°","var(--b)",0,0,22);drawText({x:385,y:345},"φ="+Math.round(normalAngle)+"°","var(--c)",0,0,22);
if(desc){desc.innerHTML="<b>二面角符号判定</b>：\\(\\theta="+Math.round(actual)+"^\\circ\\)（"+kind+"），\\(\\cos\\theta="+c.toFixed(3)+"\\)。<br>两条截面射线均从棱上的O出发且垂直于棱l，真实夹角是θ；图中xz截面横纵同单位。<br>\\(\\varphi=\\langle\\boldsymbol n_1,\\boldsymbol n_2\\rangle="+Math.round(normalAngle)+"^\\circ\\)，\\(\\dfrac{\\boldsymbol n_1\\cdot\\boldsymbol n_2}{|\\boldsymbol n_1||\\boldsymbol n_2|}="+ratio.toFixed(3)+"\\)。<br>"+(mode==="out"?"n₁、n₂均指向二面角外侧，法向量夹角与二面角互补。":"n₁指向外侧、n₂指向内侧，法向量夹角与二面角相等。")+(boundary?"<br>0°/180°只展示开合的退化边界，内外朝向按邻近非退化角的极限约定。":right?"<br><b>直二面角余弦为0，既不能称锐角，也不能写cosθ>0。</b>":actual>90?"<br><b>钝二面角的余弦为负；机械取绝对值会误算成"+(180-Math.round(actual))+"°的锐角。</b>":"<br>锐二面角余弦为正，但法向量数量积的符号仍随朝向变化。")+"<br>故二面角不能一律给数量积比值加绝对值，需按所求半平面和法向量朝向判断相等或互补。";if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);}
}
function renderIsoDist(){
var h=parseFloat(heightRange?heightRange.value:25)/10;
var offX=parseFloat(offsetRange?offsetRange.value:5)/10;
if(isNaN(h))h=2.5;
if(isNaN(offX))offX=0.5;
if(heightOut)heightOut.textContent=h.toFixed(1);
if(offsetOut)offsetOut.textContent=offX.toFixed(1);
if(window.IsoBench&&window.IsoBench.isReal===true){
window.IsoBench.renderNormalDistBench(svg,desc,h,offX,currentPtA,function(){
if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);
});
}else{
renderDist();
}
}
function render(){
if(currentTab==="dist")renderDist();
else if(currentTab==="isodist")renderIsoDist();
else if(currentTab==="lineangle")renderLineAngle();
else if(currentTab==="dihedral")renderDihedral();
}
if(tabBtns){
for(var i=0;i<tabBtns.length;i++){
(function(btn){
btn.addEventListener("click",function(){
for(var j=0;j<tabBtns.length;j++)tabBtns[j].classList.remove("on");
btn.classList.add("on");
currentTab=btn.getAttribute("data-tab");
if(ctrlDist)ctrlDist.style.display=(currentTab==="dist"||currentTab==="isodist")?"block":"none";
if(ctrlLineAngle)ctrlLineAngle.style.display=(currentTab==="lineangle")?"block":"none";
if(ctrlDihedral)ctrlDihedral.style.display=(currentTab==="dihedral")?"block":"none";
render();
if(window.Peiyu&&window.Peiyu.log)window.Peiyu.log("tab",{tab:currentTab});
});
})(tabBtns[i]);
}
}
if(heightRange)heightRange.addEventListener("input",render);
if(offsetRange)offsetRange.addEventListener("input",render);
if(btnA1)btnA1.addEventListener("click",function(){currentPtA=[0,0,0];render();});
if(btnA2)btnA2.addEventListener("click",function(){currentPtA=[-1,1,0];render();});
if(btnA3)btnA3.addEventListener("click",function(){currentPtA=[1,-1,0];render();});
if(thetaLineRange)thetaLineRange.addEventListener("input",renderLineAngle);
if(invertLineCheck)invertLineCheck.addEventListener("change",renderLineAngle);
if(dihedralRange)dihedralRange.addEventListener("input",renderDihedral);
var rds=document.getElementsByName("normDir");
for(var k=0;k<rds.length;k++){
rds[k].addEventListener("change",renderDihedral);
}
function resetAll(){
if(heightRange)heightRange.value=25;
if(offsetRange)offsetRange.value=5;
currentPtA=[0,0,0];
if(thetaLineRange)thetaLineRange.value=30;
if(invertLineCheck)invertLineCheck.checked=false;
if(dihedralRange)dihedralRange.value=120;
var r1=document.querySelector('input[name="normDir"][value="out"]');
if(r1)r1.checked=true;
render();
if(window.Peiyu&&window.Peiyu.log)window.Peiyu.log("reset",{tab:currentTab});
}
if(resetBtn)resetBtn.addEventListener("click",resetAll);
if(resetBtn2)resetBtn2.addEventListener("click",resetAll);
if(resetBtn3)resetBtn3.addEventListener("click",resetAll);
render();

var epjSvg=document.getElementById("entry-proj"),epjBar=document.getElementById("entry-proj-bar"),epjNote=document.getElementById("entry-proj-note");
function epjDraw(mode){
if(!epjSvg)return;
epjSvg.innerHTML="";
function add(tag,attrs,txt){
var n=createSvgEl(tag,attrs);
if(txt!==undefined)n.textContent=txt;
epjSvg.appendChild(n);
return n;
}
var isVec=mode==="vec";
var A=[156,156],H=[346,156],P=[346,52],Q=[156,52],N=[156,22];
add("polygon",{points:"40,188 416,188 480,122 104,122",fill:"var(--ok-soft)",stroke:"var(--a)","stroke-width":1.8});
add("text",{x:56,y:182,fill:"var(--a)","font-size":13,"font-weight":700},"平面 α");
add("line",{x1:P[0],y1:P[1],x2:H[0],y2:H[1],stroke:"var(--no)","stroke-width":2.6,"stroke-dasharray":"5,3"});
add("polyline",{points:(H[0]-12)+","+H[1]+" "+(H[0]-12)+","+(H[1]-12)+" "+H[0]+","+(H[1]-12),fill:"none",stroke:"var(--no)","stroke-width":1.6});
add("circle",{cx:H[0],cy:H[1],r:4.5,fill:"var(--no)"});
if(!isVec){
add("line",{x1:120,y1:174,x2:430,y2:136,stroke:"var(--muted)","stroke-width":1.5,"stroke-dasharray":"4,3"});
add("line",{x1:230,y1:128,x2:390,y2:180,stroke:"var(--muted)","stroke-width":1.5,"stroke-dasharray":"4,3"});
add("circle",{cx:H[0],cy:H[1],r:16,fill:"var(--no-soft)",stroke:"var(--no)","stroke-width":1.8,"stroke-dasharray":"3,2"});
add("text",{x:H[0],y:H[1]+28,"text-anchor":"middle",fill:"var(--no)","font-size":13.5,"font-weight":700},"垂足 H 落在哪？(坐标未知，极难作辅助线！)");
add("text",{x:H[0]+12,y:108,fill:"var(--no)","font-size":13.5,"font-weight":700},"d = |PH| = ?");
add("text",{x:260,y:24,"text-anchor":"middle",fill:"var(--no)","font-size":13.5,"font-weight":700},"传统几何法痛点：斜平面上找不出垂足 H，无法直接算 |PH|");
epjNote.innerHTML="<b>传统几何法痛点</b>：在倾斜的截面或三棱锥表面上，垂足 <b>H</b> 往往既不在中点也不在特殊位置，硬找 H 的坐标需要繁琐的面面垂直作图！";
}else{
add("polygon",{points:A[0]+","+A[1]+" "+P[0]+","+P[1]+" "+Q[0]+","+Q[1],fill:"rgba(217,140,43,0.15)",stroke:"none"});
add("line",{x1:A[0],y1:A[1],x2:H[0],y2:H[1],stroke:"var(--muted)","stroke-width":1.5,"stroke-dasharray":"4,3"});
add("line",{x1:A[0],y1:A[1],x2:N[0],y2:N[1],stroke:"var(--a)","stroke-width":2.4,"stroke-dasharray":"3,3"});
add("line",{x1:A[0],y1:A[1],x2:Q[0],y2:Q[1],stroke:"var(--b)","stroke-width":4.5});
add("line",{x1:P[0],y1:P[1],x2:Q[0],y2:Q[1],stroke:"var(--b)","stroke-width":1.8,"stroke-dasharray":"4,3"});
add("polyline",{points:(Q[0]+11)+","+Q[1]+" "+(Q[0]+11)+","+(Q[1]+11)+" "+Q[0]+","+(Q[1]+11),fill:"none",stroke:"var(--b)","stroke-width":1.6});
add("line",{x1:A[0],y1:A[1],x2:P[0],y2:P[1],stroke:"var(--c)","stroke-width":3.2});
add("circle",{cx:A[0],cy:A[1],r:5,fill:"var(--c)"});
add("circle",{cx:Q[0],cy:Q[1],r:4.5,fill:"var(--b)"});
add("text",{x:A[0]+10,y:A[1]+20,"text-anchor":"start",fill:"var(--c)","font-size":13,"font-weight":700},"面内任取已知点 A");
add("text",{x:N[0]-8,y:N[1]+8,"text-anchor":"end",fill:"var(--a)","font-size":13.5,"font-weight":700},"法向量 n ⊥ α ↑");
add("text",{x:A[0]-10,y:108,"text-anchor":"end",fill:"var(--b)","font-size":13.5,"font-weight":700},"投影高 = |AP·n|/|n|");
add("text",{x:256,y:118,"text-anchor":"middle",fill:"var(--c)","font-size":13.5,"font-weight":700},"斜向量 AP");
add("text",{x:H[0]+10,y:108,fill:"var(--no)","font-size":13.5,"font-weight":700},"等于 d = |PH| ✓");
add("text",{x:H[0],y:H[1]+18,"text-anchor":"middle",fill:"var(--muted)","font-size":12.5},"垂足 H (无需找坐标!)");
epjNote.innerHTML="<b>空间向量法一步到位</b>：任取面内一个已知顶点 <b>A</b>，算出斜向量 <b>AP</b> 和平面法向量 <b>n</b>；在矩形 AQPH 中，<b>AP 在法向量 n 上的投影高 |AQ| = |AP·n| / |n| 恰好等于垂线段 |PH|</b>，根本不用找垂足 H！";
}
add("circle",{cx:P[0],cy:P[1],r:5.5,fill:"var(--no)",stroke:"var(--card)","stroke-width":2});
add("text",{x:P[0]+10,y:P[1]+4,fill:"var(--no)","font-size":14,"font-weight":700},"空间点 P");
[].forEach.call(epjBar.querySelectorAll("button"),function(b){
b.classList.toggle("on",b.getAttribute("data-mode")===mode);
});
}
[].forEach.call(epjBar.querySelectorAll("button"),function(b){
b.onclick=function(){epjDraw(b.getAttribute("data-mode"));};
});
document.addEventListener("predict:pick",function(ev){
if(ev.detail&&ev.detail.id==="entry"){
epjDraw(ev.detail.choice==="A"?"geo":"vec");
}
});
document.addEventListener("predict:reset",function(ev){
if(ev.detail&&ev.detail.id==="entry")epjDraw("vec");
});
epjDraw("vec");
function initMAppFig(){
var fig=document.getElementById("m-app-fig"),cap=document.getElementById("m-app-cap"),trap=document.getElementById("m-app-trap-fig");if(!fig)return;
function node(parent,tag,attrs,text){var e=createSvgEl(tag,attrs);if(text!==undefined)e.textContent=text;parent.appendChild(e);return e;}
function line(parent,a,b,color,name,dash){var attrs={x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:color,"stroke-width":2.6,"data-angle-role":name};if(dash)attrs["stroke-dasharray"]="4 3";return node(parent,"line",attrs);}
function text(parent,x,y,value,color){return node(parent,"text",{x:x,y:y,fill:color||"var(--fg)","font-size":24,"text-anchor":"middle"},value);}
function arc(parent,O,r,a,b,color,name){var start=[O[0]+r*Math.cos(a),O[1]-r*Math.sin(a)],end=[O[0]+r*Math.cos(b),O[1]-r*Math.sin(b)];return node(parent,"path",{d:"M "+start.join(" ")+" A "+r+" "+r+" 0 "+(b-a>Math.PI?1:0)+" 0 "+end.join(" "),fill:"none",stroke:color,"stroke-width":1.8,"data-angle-role":name,"data-center":JSON.stringify(O)});}
function right(parent,O){node(parent,"polyline",{points:(O[0]-12)+","+O[1]+" "+(O[0]-12)+","+(O[1]-12)+" "+O[0]+","+(O[1]-12),fill:"none",stroke:"var(--no)","stroke-width":1.5,"data-angle-role":"micro-right"});}
function angleFigure(parent){var O=[170,225],r=165,a=Math.PI/6,U=[O[0]+r*Math.cos(a),O[1]-r*Math.sin(a)],N=[170,45],H=[U[0],225];line(parent,[65,225],[440,225],"var(--a)","micro-plane");line(parent,O,N,"var(--a)","micro-normal");line(parent,O,U,"var(--b)","micro-direction");line(parent,O,H,"var(--muted)","micro-projection",true);line(parent,U,H,"var(--no)","micro-drop",true);right(parent,H);arc(parent,O,52,0,a,"var(--b)","micro-theta-arc");arc(parent,O,72,a,Math.PI/2,"var(--c)","micro-phi-arc");text(parent,110,50,"n","var(--a)");text(parent,U[0]+30,U[1]-5,"u","var(--b)");text(parent,230,260,"θ=30°","var(--b)");text(parent,250,110,"φ=60°","var(--c)");text(parent,450,70,"sinθ=1/2","var(--fg)");text(parent,80,260,"α","var(--a)");}
function draw(mode){fig.innerHTML="";fig.setAttribute("viewBox","0 0 560 300");if(mode==="lineplane"){angleFigure(fig);cap.textContent="在包含u和法向量n的正交截面中，平面表现为水平线。图中真实θ=30°、φ=60°，弧的两个端点在实际射线上。一般应取ψ=min(φ,180°−φ)，θ+ψ=90°；φ为钝角时不能直接写θ+φ=90°。";}else if(mode==="dihed"){var O=[260,205],t=2*Math.PI/3,A=[420,205],B=[180,205-80*Math.sqrt(3)],N1=[260,285],N2=[260-80*Math.sqrt(3)/2,245];line(fig,O,A,"var(--a)","micro-dihedral-a");line(fig,O,B,"var(--c)","micro-dihedral-b");line(fig,O,N1,"var(--a)","micro-dihedral-n1",true);line(fig,O,N2,"var(--c)","micro-dihedral-n2",true);arc(fig,O,46,0,t,"var(--b)","micro-dihedral-arc");text(fig,425,235,"α","var(--a)");text(fig,150,65,"β","var(--c)");text(fig,300,280,"n₁","var(--a)");text(fig,160,255,"n₂","var(--c)");text(fig,370,65,"θ=120°","var(--b)");text(fig,385,100,"φ=60°","var(--c)");cap.textContent="取垂直于公共棱l的截面，两半平面给出同顶点两射线，真实开口120°。n₁、n₂都朝外，真实夹角60°，与二面角互补；cos120°=−1/2，不能机械改成正数。";}else{var A=[140,230],H=[290,230],P=[290,80],N=[140,155];line(fig,[65,230],[440,230],"var(--a)","micro-distance-plane");line(fig,A,P,"var(--c)","micro-distance-ap");line(fig,P,H,"var(--no)","micro-distance-ph");line(fig,A,N,"var(--a)","micro-distance-normal");line(fig,A,H,"var(--muted)","micro-distance-ah",true);right(fig,H);text(fig,120,265,"A","var(--c)");text(fig,320,70,"P","var(--no)");text(fig,310,260,"H","var(--no)");text(fig,110,140,"n","var(--a)");text(fig,370,160,"d=2","var(--no)");cap.textContent="截面每单位75px，A=(0,0,0)，H=(2,0,0)，P=(2,0,2)，n=(0,0,1)。AP·n=2、|n|=1，故d=2。H确在线上，PH沿法向量且垂直于平面截线。";}}
document.querySelectorAll(".micro-box .micro-tab").forEach(function(tab){tab.addEventListener("click",function(){document.querySelectorAll(".micro-box .micro-tab").forEach(function(t){t.classList.remove("active");});tab.classList.add("active");draw(tab.getAttribute("data-mode"));});});draw("lineplane");if(cap)cap.style.fontSize="15px";
if(trap){trap.innerHTML="";trap.setAttribute("viewBox","0 0 560 300");angleFigure(trap);}
}
initMAppFig();
})();

