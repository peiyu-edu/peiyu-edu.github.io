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
y:200+y*40*KY-z*40
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
x1:p1.x.toFixed(1),
y1:p1.y.toFixed(1),
x2:p2.x.toFixed(1),
y2:p2.y.toFixed(1),
stroke:color,
"stroke-width":w||"1.8"
};
if(dash)attrs["stroke-dasharray"]=dash;
if(markerEnd)attrs["marker-end"]="url(#"+markerEnd+")";
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
"font-size":fontSize||"13",
"font-weight":fontWeight||"600"
});
t.textContent=text;
svg.appendChild(t);
return t;
}

function renderDist(){
svg.innerHTML="";
addDefs();
var h=parseFloat(heightRange?heightRange.value:25)/10;
var offX=parseFloat(offsetRange?offsetRange.value:5)/10;
if(isNaN(h))h=2.5;
if(isNaN(offX))offX=0.5;
if(heightOut)heightOut.textContent=h.toFixed(1);
if(offsetOut)offsetOut.textContent=offX.toFixed(1);
var pM1=proj(-3.2,-1.8,0);
var pM2=proj(3.2,-1.8,0);
var pM3=proj(2.6,2.2,0);
var pM4=proj(-3.8,2.2,0);
drawPolygon([pM1,pM2,pM3,pM4],"rgba(47, 122, 86, 0.08)","var(--a)","1.8");
drawText(proj(-3.1,-1.5,0),"平面 α (z = 0)","var(--a)",8,12,"13","700");
var ax=currentPtA[0],ay=currentPtA[1],az=0;
var ptA=proj(ax,ay,az);
var px=offX,py=0.4,pz=h;
var ptP=proj(px,py,pz);
var ptH=proj(px,py,0);//真正垂足
drawLine(ptP,ptH,"var(--no)","2.6","4,3");
var r1=proj(px+0.25,py,0);
var r2=proj(px+0.25,py,0.25);
var r3=proj(px,py,0.25);
drawLine(r1,r2,"var(--no)","1.2");
drawLine(r2,r3,"var(--no)","1.2");
drawLine(ptA,ptH,"var(--muted)","1.4","3,3");
drawLine(ptA,ptP,"var(--c)","2.6",null,"m-arr-c");
var ptN=proj(ax,ay,az+1.8);
drawLine(ptA,ptN,"var(--a)","2.8",null,"m-arr-a");
var n1=proj(ax+0.22,ay,az);
var n2=proj(ax+0.22,ay,az+0.22);
var n3=proj(ax,ay,az+0.22);
drawLine(n1,n2,"var(--a)","1.2");
drawLine(n2,n3,"var(--a)","1.2");
var hOnLeft=px<ax-0.1;
drawCircle(ptA,4.5,"var(--c)");
drawText(ptA,"A("+ax+","+ay+",0)","var(--c)",-78,20);
drawCircle(ptP,5,"var(--no)");
drawText(ptP,"P("+px.toFixed(1)+","+py.toFixed(1)+","+pz.toFixed(1)+")","var(--no)",10,-8);
drawCircle(ptH,4,"var(--no)");
drawText(ptH,"垂足 H","var(--no)",hOnLeft?-52:12,20);
drawText(ptN,"法向量 n = (0, 0, 1.8)","var(--a)",-148,-18);
drawText(proj(ax+(px-ax)*0.35,ay+(py-ay)*0.35,pz*0.35),"斜向量 AP","var(--c)",hOnLeft?12:-74,-4);
drawText(proj(px,py,pz/2),"距离 d = "+h.toFixed(1),"var(--no)",hOnLeft?-88:14,10,"13","700");
if(desc){
var dx=(px-ax).toFixed(1);
var dy=(py-ay).toFixed(1);
var dz=pz.toFixed(1);
desc.innerHTML=
"<b>点面距离代数验算</b>：<br>"+
"当前选定面内参考点 \\(A("+ax+", "+ay+", 0)\\)，斜向量 \\(\\overrightarrow{AP} = ("+dx+", "+dy+", "+dz+")\\)。<br>"+
"取法向量 \\(\\boldsymbol{n} = (0, 0, 1)\\)，数量积 \\(\\overrightarrow{AP}\\cdot\\boldsymbol{n} = "+dx+"\\times 0 + "+dy+"\\times 0 + "+dz+"\\times 1 = "+dz+"\\)。<br>"+
"点面距离公式：\\(d = \\dfrac{|\\overrightarrow{AP}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{n}|} = \\dfrac{|"+dz+"|}{1} = "+h.toFixed(1)+"\\)。<br>"+
"<span class=\"small\" style=\"color:var(--a);font-weight:600\">★ 核心发现：切换不同的参考点 A，向量 AP 的水平分量会变化，但在法向量上的投影高恒为 "+h.toFixed(1)+"，完全不需要寻找垂足 H！</span>";
if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);
}
}

function renderLineAngle(){
svg.innerHTML="";
addDefs();
var deg=parseFloat(thetaLineRange?thetaLineRange.value:30);
if(isNaN(deg))deg=30;
if(thetaLineOut)thetaLineOut.textContent=Math.round(deg)+"°";
var invert=invertLineCheck&&invertLineCheck.checked;
var rad=deg*Math.PI/180;
var len=3.4;
var pM1=proj(-3.2,-1.8,0);
var pM2=proj(3.2,-1.8,0);
var pM3=proj(2.6,2.2,0);
var pM4=proj(-3.8,2.2,0);
drawPolygon([pM1,pM2,pM3,pM4],"rgba(47, 122, 86, 0.08)","var(--a)","1.8");
drawText(proj(2.7,-1.5,0),"平面 α","var(--a)",4,-4,"13","700");
var ptO=proj(0,0,0);
drawCircle(ptO,4.5,"var(--fg)");
drawText(ptO,"O (交点)","var(--fg)",-72,6);
var ptN=proj(0,0,2.6);
drawLine(ptO,ptN,"var(--a)","2.8",null,"m-arr-a");
drawText(ptN,"法向量 n","var(--a)",8,-2);
var n1=proj(0.24,0,0);
var n2=proj(0.24,0,0.24);
var n3=proj(0,0,0.24);
drawLine(n1,n2,"var(--a)","1.2");
drawLine(n2,n3,"var(--a)","1.2");
var sign=invert?-1:1;
var ux=len*Math.cos(rad)*0.9;
var uy=len*Math.cos(rad)*0.43;
var uz=sign*len*Math.sin(rad);
var ptU=proj(ux,uy,uz);
var ptProjH=proj(ux,uy,0);
drawLine(ptO,ptProjH,"var(--muted)","1.6","4,3");
drawText(proj(Math.max(1.2,ux*0.65),Math.max(0.55,uy*0.65),0),"斜线在平面内的射影","var(--muted)",10,22,"12");
drawLine(ptU,ptProjH,"var(--no)","2.0","3,3");
drawLine(ptO,ptU,"var(--b)","3.0",null,"m-arr-b");
drawCircle(ptU,4.5,"var(--b)");
drawText(ptU,invert?"方向向量 u (反向指入下方)":"方向向量 u (斜线 l)","var(--b)",10,invert?14:-6);
var phiDeg=invert?(90+deg):(90-deg);
var sinTheta=Math.sin(rad);
var cosPhi=Math.cos(phiDeg*Math.PI/180);
if(desc){
desc.innerHTML=
"<b>线面角与法向量互余关系实时解析</b>：<br>"+
"① 斜线与平面所成角：\\(\\theta = "+Math.round(deg)+"^\\circ\\)（范围 \\([0, 90^\\circ]\\)），其正弦值 \\(\\sin\\theta = "+sinTheta.toFixed(3)+"\\)。<br>"+
"② 方向向量 \\(\\boldsymbol{u}\\) 与法向量 \\(\\boldsymbol{n}\\) 的夹角：\\(\\varphi = "+Math.round(phiDeg)+"^\\circ\\)，其余弦值 \\(\\cos\\varphi = "+cosPhi.toFixed(3)+"\\)。<br>"+
"③ 数量积绝对值计算：\\(\\dfrac{|\\boldsymbol{u}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{u}||\\boldsymbol{n}|} = |"+cosPhi.toFixed(3)+"| = "+Math.abs(cosPhi).toFixed(3)+" = \\sin\\theta\\)！<br>"+
"<span style=\"color:var(--no);font-weight:600\">★ 极度警惕：法向量与平面垂直，因此 \\(\\langle\\boldsymbol{u},\\boldsymbol{n}\\rangle\\) 与 \\(\\theta\\) 互余，计算出的是 \\(\\sin\\theta\\) 而非 \\(\\cos\\theta\\)！</span>";
if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);
}
}

function renderDihedral(){
svg.innerHTML="";
addDefs();
var deg=parseFloat(dihedralRange?dihedralRange.value:120);
if(isNaN(deg))deg=120;
if(dihedralOut)dihedralOut.textContent=Math.round(deg)+"°";
var radios=document.getElementsByName("normDir");
var mode="out";
for(var i=0;i<radios.length;i++){
if(radios[i].checked)mode=radios[i].value;
}
var rad=deg*Math.PI/180;
var cosD=Math.cos(rad);
var sinD=Math.sin(rad);
var pEdge1=proj(0,-1.6,0);
var pEdge2=proj(0,2.0,0);
var pA1=proj(0,-1.6,0);
var pA2=proj(2.6,-1.6,0);
var pA3=proj(2.6,2.0,0);
var pA4=proj(0,2.0,0);
drawPolygon([pA1,pA2,pA3,pA4],"rgba(47, 122, 86, 0.08)","var(--a)","1.8");
drawText(proj(2.3,-1.3,0),"半平面 α","var(--a)",4,14,"13","700");
var bLen=2.6;
var bx=bLen*cosD;
var bz=bLen*sinD;
var pB1=proj(0,-1.6,0);
var pB2=proj(bx,-1.6,bz);
var pB3=proj(bx,2.0,bz);
var pB4=proj(0,2.0,0);
drawPolygon([pB1,pB2,pB3,pB4],"rgba(62, 92, 118, 0.09)","var(--c)","1.8");
drawText(proj(bx*0.9,-1.3,bz*0.9),"半平面 β","var(--c)",-30,-6,"13","700");
drawLine(pEdge1,pEdge2,"var(--fg)","2.6");
drawText(proj(0,2.1,0),"二面角的棱 l","var(--fg)",-20,16);
var ptO=proj(0,0.2,0);
drawCircle(ptO,4.5,"var(--fg)");
var ptRayA=proj(1.8,0.2,0);
drawLine(ptO,ptRayA,"var(--a)","2.0","3,2");
var ptRayB=proj(1.8*cosD,0.2,1.8*sinD);
drawLine(ptO,ptRayB,"var(--c)","2.0","3,2");
var ptN1=proj(0,0.2,1.9);
drawLine(ptO,ptN1,"var(--a)","2.8",null,"m-arr-a");
drawText(ptN1,"n₁ ⊥ α","var(--a)",6,-2);
var n2Sign=(mode==="out")?1:-1;
var n2x=-n2Sign*1.9*sinD;
var n2z=n2Sign*1.9*cosD;
var ptN2=proj(n2x,0.2,n2z);
drawLine(ptO,ptN2,"var(--c)","2.8",null,"m-arr-c");
drawText(ptN2,"n₂ ⊥ β","var(--c)",-36,12);
var isObtuse=deg>90;
var isRight=deg===90;
var angleKind=isRight?"直二面角":(isObtuse?"钝二面角":"锐二面角");
var dot=n2Sign*cosD;
var nAngleRad=Math.acos(Math.max(-1,Math.min(1,dot)));
var nAngleDeg=nAngleRad*180/Math.PI;
if(desc){
desc.innerHTML=
"<div class=\"stat-grid\">"+
"<div class=\"stat-card\"><div class=\"tit\">二面角实际大小</div><div class=\"val\" style=\"color:"+(isObtuse?"var(--no)":"var(--a)")+"\">\\(\\theta = "+Math.round(deg)+"^\\circ\\)（"+angleKind+"）</div></div>"+
"<div class=\"stat-card\"><div class=\"tit\">真实余弦值 \\(\\cos\\theta\\)</div><div class=\"val\">\\("+cosD.toFixed(3)+"\\)</div></div>"+
"<div class=\"stat-card\"><div class=\"tit\">两法向量夹角 \\(\\langle\\boldsymbol{n}_1,\\boldsymbol{n}_2\\rangle\\)</div><div class=\"val\">\\("+Math.round(nAngleDeg)+"^\\circ\\)</div></div>"+
"<div class=\"stat-card\"><div class=\"tit\">法向量数量积比值</div><div class=\"val\">\\("+dot.toFixed(3)+"\\)</div></div>"+
"</div>"+
"<b>二面角符号判定结论</b>：<br>"+
(isObtuse
?"<span style=\"color:var(--no);font-weight:700\">【致命陷阱警示】当前几何图形明显为【钝二面角】（\\(\\theta = "+Math.round(deg)+"^\\circ &gt; 90^\\circ\\)），其实际余弦值必须为负值（\\(\\cos\\theta = "+cosD.toFixed(3)+" &lt; 0\\)）！</span><br>"+
"若直接套用绝对值公式算得 \\(|"+dot.toFixed(3)+"| = "+Math.abs(dot).toFixed(3)+"\\)，就会得出 \\(\\theta = "+(180-Math.round(deg))+"^\\circ\\)，把钝二面角活生生错算为锐角，整道立体几何解答题直接丢分！"
:"<span style=\"color:var(--a);font-weight:700\">当前图形为【锐二面角】（\\(\\theta = "+Math.round(deg)+"^\\circ \\le 90^\\circ\\)），其实际余弦值为正值（\\(\\cos\\theta = "+cosD.toFixed(3)+" &gt; 0\\)）。</span><br>"+
"无论法向量朝向如何，锐二面角余弦值必为正：\\(\\cos\\theta = +\\dfrac{|\\boldsymbol{n}_1\\cdot\\boldsymbol{n}_2|}{|\\boldsymbol{n}_1||\\boldsymbol{n}_2|}\\)。");
if(window.Peiyu&&window.Peiyu.math)window.Peiyu.math(desc);
}
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
var svgEl=document.getElementById("m-app-fig"),capEl=document.getElementById("m-app-cap");
if(!svgEl)return;
var mode="lineplane",NS="http://www.w3.org/2000/svg";
var caps={
lineplane:"法向量与线面角：法向量与平面垂直，直线与法向量夹角与线面角互余，计算结果恒为正弦值 sin θ = |cos φ|。",
dihed:"二面角与法向量：两平面法向量夹角与二面角相等或互补，余弦值正负必须依据图形开口钝锐判定。",
pldist:"点面距离向量射影：在面内任取一点 A，点 P 到平面的垂线段长恒等于斜向量 AP 在法向量 n 上的射影长度。"
};
function s(el,t,a,x){
var e=document.createElementNS(NS,t);
for(var k in a)e.setAttribute(k,a[k]);
if(x)e.textContent=x;
el.appendChild(e);
return e;
}
function ln(el,x1,y1,x2,y2,c,w,d){
var a={x1:x1,y1:y1,x2:x2,y2:y2,stroke:c||"#cbd5e1","stroke-width":w||1.5};
if(d)a["stroke-dasharray"]=d;
return s(el,"line",a);
}
function rc(el,x,y,w,h,f,c,r){return s(el,"rect",{x:x,y:y,width:w,height:h,fill:f||"none",stroke:c||"none",rx:r||0});}
function tx(el,x,y,t,c,sz,b,anch){
var a={x:x,y:y,fill:c||"#0f172a","font-size":sz||"11"};
if(b)a["font-weight"]="bold";
if(anch)a["text-anchor"]=anch;
return s(el,"text",a,t);
}
function draw(){
svgEl.innerHTML="";
if(mode==="lineplane"){
tx(svgEl,270,24,"线面角与法向量互余原理：sin θ = |u · n| / (|u||n|)","#0f172a","12",true,"middle");
s(svgEl,"polygon",{points:"60,160 240,160 300,110 120,110",fill:"rgba(37,99,235,0.08)",stroke:"#93c5fd"});
tx(svgEl,90,125,"平面 α","#1e3a8a","11",true);
ln(svgEl,150,140,150,50,"#dc2626",2.5);tx(svgEl,140,60,"法向量 n","#dc2626","11",true,"end");
rc(svgEl,150,130,10,10,"none","#dc2626");
ln(svgEl,150,140,250,70,"#2563eb",2.5);tx(svgEl,255,75,"方向向量 u","#2563eb","11",true);
ln(svgEl,150,140,250,140,"#059669",2,"3 3");
ln(svgEl,250,70,250,140,"#64748b",1.5,"2 2");
s(svgEl,"path",{d:"M 180 140 A 30 30 0 0 0 175 122",fill:"none",stroke:"#059669","stroke-width":2});
tx(svgEl,188,134,"θ (线面角)","#059669","11",true);
s(svgEl,"path",{d:"M 150 110 A 30 30 0 0 1 172 124",fill:"none",stroke:"#d97706","stroke-width":1.5});
tx(svgEl,166,105,"φ","#d97706","11",true);
rc(svgEl,330,50,185,120,"#f8fafc","#cbd5e1",6);
tx(svgEl,345,78,"互余转换公式","#0f172a","12",true);
tx(svgEl,345,102,"θ + φ = 90°","#dc2626","11.5",true);
tx(svgEl,345,124,"sin θ = |cos φ|","#2563eb","11.5",true);
tx(svgEl,345,146,"牢记：算出来是正弦！","#059669","10.5",true);
}else if(mode==="dihed"){
tx(svgEl,270,24,"二面角与两法向量夹角：cos θ = ± (n1 · n2) / (|n1||n2|)","#0f172a","12",true,"middle");
ln(svgEl,150,40,150,160,"#0f172a",2);
s(svgEl,"polygon",{points:"60,90 150,40 150,160 60,150",fill:"rgba(37,99,235,0.08)",stroke:"#2563eb"});
tx(svgEl,80,120,"平面 α","#2563eb","11",true);
s(svgEl,"polygon",{points:"240,90 150,40 150,160 240,150",fill:"rgba(5,150,105,0.08)",stroke:"#059669"});
tx(svgEl,210,120,"平面 β","#059669","11",true);
ln(svgEl,105,100,80,50,"#2563eb",2);tx(svgEl,70,50,"n1","#2563eb","11",true);
ln(svgEl,195,100,220,50,"#059669",2);tx(svgEl,228,50,"n2","#059669","11",true);
rc(svgEl,330,50,185,120,"#f1f5f9","#cbd5e1",6);
tx(svgEl,345,78,"钝锐定正负","#0f172a","12",true);
tx(svgEl,345,102,"• 锐二面角 ⟹ cos θ > 0","#059669","11");
tx(svgEl,345,124,"• 钝二面角 ⟹ cos θ < 0","#dc2626","11",true);
tx(svgEl,345,146,"切忌无脑加绝对值！","#b91c1c","10.5",true);
}else if(mode==="pldist"){
tx(svgEl,270,24,"点到平面距离公式：d = |AP · n| / |n|","#0f172a","12",true,"middle");
s(svgEl,"polygon",{points:"60,150 250,150 310,110 120,110",fill:"rgba(37,99,235,0.08)",stroke:"#93c5fd"});
tx(svgEl,90,125,"平面 α","#1e3a8a","11",true);
s(svgEl,"circle",{cx:220,cy:45,r:4.5,fill:"#dc2626"});tx(svgEl,228,45,"点 P","#dc2626","11",true);
s(svgEl,"circle",{cx:220,cy:130,r:3.5,fill:"#64748b"});tx(svgEl,228,140,"垂足 H","#64748b","10");
ln(svgEl,220,45,220,130,"#dc2626",2.5);tx(svgEl,235,90,"距离 d","#dc2626","11.5",true);
rc(svgEl,210,120,10,10,"none","#dc2626");
s(svgEl,"circle",{cx:140,cy:135,r:4,fill:"#059669"});tx(svgEl,128,145,"已知点 A","#059669","11",true);
ln(svgEl,140,135,220,45,"#059669",2);tx(svgEl,165,80,"斜向量 AP","#059669","11",true);
ln(svgEl,140,135,140,60,"#2563eb",2);tx(svgEl,125,75,"法向量 n","#2563eb","10.5");
rc(svgEl,330,50,185,120,"#f8fafc","#cbd5e1",6);
tx(svgEl,345,78,"向量射影求距法","#0f172a","12",true);
tx(svgEl,345,102,"免作垂线、免找垂足","#059669","11",true);
tx(svgEl,345,124,"d = |AP · n| / |n|","#dc2626","11.5",true);
tx(svgEl,345,146,"任选面内点 A 即可","#2563eb","10.5");
}
if(capEl)capEl.textContent=caps[mode];
if(window.renderMathInElement)window.renderMathInElement(capEl);
}
var tabs=document.querySelectorAll(".micro-box .micro-tab");
tabs.forEach(function(tab){
tab.addEventListener("click",function(){
tabs.forEach(function(t){t.classList.remove("active");});
tab.classList.add("active");
mode=tab.getAttribute("data-mode");
draw();
});
});
draw();
var trapEl=document.getElementById("m-app-trap-fig");
if(trapEl){
trapEl.innerHTML="";
rc(trapEl,30,20,220,130,"#fef2f2","#fca5a5",6);
tx(trapEl,140,44,"❌ 典型翻车：线面角错当余弦","#dc2626","11.5",true,"middle");
tx(trapEl,140,75,"算得 |u · n| / (|u||n|) = 1/2","#dc2626","10.5",false,"middle");
tx(trapEl,140,98,"误把角写成 60° (把公式当 cos)","#b91c1c","11",true,"middle");
tx(trapEl,140,135,"大题直接扣光答案分！","#64748b","9.5",false,"middle");
rc(trapEl,290,20,220,130,"#f0fdf4","#86efac",6);
tx(trapEl,400,44,"✔ 几何真谛：法向量互余求正弦","#15803d","11.5",true,"middle");
tx(trapEl,400,75,"sin θ = |u · n| / (|u||n|) = 1/2","#059669","11",true,"middle");
tx(trapEl,400,98,"正解：线面角 θ = 30°！","#15803d","12",true,"middle");
tx(trapEl,400,135,"牢记：线面角算出来恒为 sin！","#047857","10",true,"middle");
}
}
initMAppFig();
})();

