/* j6-1 only: finite cube workshop and a measured paper cuboid. No persistence. */
(function () {
'use strict';
function blocks(heights) {
  const result = [];
  heights.forEach((row, x) => row.forEach((h, y) => {
    for (let z = 0; z < h; z++) result.push([x, y, z]);
  }));
  return result;
}
// Counterclockwise as seen from above, about the centre of the 3×3 floor.
function turn(list, n) {
  return list.map(p => {
    let [x, y, z] = p;
    for (let i = 0; i < n % 4; i++) [x, y] = [2 - y, x];
    return [x, y, z];
  });
}
function seen(list, view) {
  const unique = new Map();
  list.forEach(([x, y, z]) => {
    const p = view === 'left' ? [2 - y, z] : view === 'right' ? [y, z] : view === 'top' ? [x, y] : [x, z];
    unique.set(p.join(','), p);
  });
  return [...unique.values()];
}
function countToken(value) {
  const s = value.trim();
  return /^(0|[1-9])$/.test(s) ? Number(s) : null;
}
const faces = [
  {id:'A', rect:[0,0,3,2], size:'3×2'},
  {id:'B', rect:[0,-4,3,4], size:'3×4'},
  {id:'C', rect:[0,2,3,4], size:'3×4'},
  {id:'D', rect:[-4,0,4,2], size:'4×2'},
  {id:'E', rect:[3,0,4,2], size:'4×2'},
  {id:'F', rect:[0,6,3,2], size:'3×2'}
];
function rx(p, y0, a) {
  const c = Math.cos(a), s = Math.sin(a), y = p[1] - y0;
  return [p[0], y0 + y*c - p[2]*s, y*s + p[2]*c];
}
function ry(p, x0, a) {
  const c = Math.cos(a), s = Math.sin(a), x = p[0] - x0;
  return [x0 + x*c + p[2]*s, p[1], -x*s + p[2]*c];
}
function folded(degrees) {
  const a = degrees * Math.PI / 180;
  return faces.map((f, i) => {
    const [x,y,w,h] = f.rect;
    return [[x,y,0],[x+w,y,0],[x+w,y+h,0],[x,y+h,0]].map(p => {
      if (i === 1) return rx(p,0,-a);
      if (i === 2) return rx(p,2,a);
      if (i === 3) return ry(p,0,a);
      if (i === 4) return ry(p,3,-a);
      if (i === 5) return rx(rx(p,6,a),2,a);
      return p;
    });
  });
}
function templateSVG() {
  // Coordinates are millimetres. Root A is 30×20; four walls are 40 high.
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="140mm" height="180mm" viewBox="0 0 140 180"><rect width="140" height="180" fill="white"/><g fill="black" font-family="sans-serif" font-size="3.4">';
  svg += '<text x="8" y="7">2 × 3 × 4 cm 长方体纸模 · 100%打印</text>';
  svg += '<text x="8" y="13">实线剪开，虚线折叠；接缝用外贴胶带连接。</text>';
  faces.forEach(f => {
    const [x,y,w,h] = f.rect, X = 50+x*10, Y = 60+y*10;
    svg += '<text text-anchor="middle" x="'+(X+w*5)+'" y="'+(Y+h*5-1)+'">'+f.id+'</text><text text-anchor="middle" x="'+(X+w*5)+'" y="'+(Y+h*5+4)+'">'+f.size+' cm</text>';
  });
  svg += '<path d="M50 20 H80 V60 H120 V80 H80 V140 H50 V80 H10 V60 H50 Z" fill="none" stroke="black" stroke-width="0.4"/>';
  svg += '<path d="M50 60 H80 M50 80 H80 M50 60 V80 M80 60 V80 M50 120 H80" fill="none" stroke="black" stroke-width="0.3" stroke-dasharray="2 1"/>';
  svg += '<path d="M10 150 H60 M10 148 V152 M60 148 V152" stroke="black" stroke-width="0.3"/><text x="65" y="151">先量此线：5 cm</text>';
  svg += '<text x="8" y="160">六面实测边长：A____ B____ C____</text><text x="8" y="166">D____ E____ F____ （cm）</text><text x="8" y="172">折后棱长：____ / ____ / ____ cm</text><text x="8" y="178">另纸记接缝、偏差、修正；保留纸图和模型。</text></g></svg>';
  return svg;
}
if (typeof module !== 'undefined' && module.exports) module.exports = {blocks, turn, seen, countToken, faces, folded, templateSVG};
if (typeof document === 'undefined') return;
const root = document.getElementById('space-workshop');
if (!root || document.body.dataset.sec !== 'j6-1') return;
root.innerHTML = `
<h3>④ 同一个组合体，转身再看</h3>
<div class="card">
<p>在这个搭块台自己搭一件作品，再转它或换到它的左右两侧观察。每格表示一摞，0 表示没有；上方是后排，下方是前排。转动只改变朝向，不换作品、不增减方块。这里练习直观观察，不要求学习投影理论。</p>
<div id="sw-heights" class="sw-heights" role="group" aria-label="设置九摞方块的层数"></div>
<div class="ctrl"><button type="button" class="btn" id="sw-turn">从上往下看逆时针转90°</button><button type="button" class="btn ghost" id="sw-clear">清空搭块</button><button type="button" class="btn ghost" id="sw-reset">重置搭块台</button></div>
<label>观察位置 <select id="sw-view"><option value="front">从前面看</option><option value="left">从左面看</option><option value="right">从右面看</option><option value="top">从上面看</option></select></label>
<p id="sw-state" class="small" aria-live="polite"></p>
<svg id="sw-solid" viewBox="0 0 360 270" role="img" aria-label="当前作品与观察位置"></svg><p id="sw-solid-caption" class="small"></p>
<form id="sw-count-form" novalidate><label>先猜一猜：从所选方向看到几格？<input id="sw-count" type="text" inputmode="numeric" autocomplete="off" aria-describedby="sw-grammar"></label><p id="sw-grammar" class="small">只填0到9的整数，使用半角数字；不写单位、算式或小数。先在纸上画出格子，再核对。</p><button class="btn" type="submit">核对并看格子图</button></form>
<p id="sw-feedback" role="status"></p>
<svg id="sw-flat" viewBox="0 0 360 210" role="img" aria-label="核对当前方向看到的格子" hidden></svg><p id="sw-flat-caption" class="small" hidden></p>
<p class="small">沿同一条视线挡在一起的方块只记一格；从左侧看时，当前物体的后排在图的左边，从右侧看时则在右边。换位置或转动后，重新画、重新猜。还可以用实物搭出同样的作品，绕到两侧观察；网页练习不能替代这段实物经历。</p>
</div>
<h3>⑤ 做一个不是正方体的纸模型</h3>
<div class="card">
<p>这次做一个棱长为2 cm、3 cm、4 cm的长方体，它也是直棱柱的一种。先想象下面的六个长方形怎样围成盒子，再拖滑块验证。每个面都绕共同的棱折动，边长不变。这里的尺寸用于制作，不要求计算表面积。</p>
<svg id="sw-net" viewBox="0 0 390 380" role="img" aria-label="带面编号与尺寸的长方体展开图"></svg><p class="small">图中尺寸单位cm；虚线是共同棱。</p>
<label>折起程度 <input id="sw-fold" type="range" min="0" max="90" step="1" value="0"></label><output id="sw-fold-state" for="sw-fold">0°，铺平</output>
<svg id="sw-folded" viewBox="0 0 360 300" role="img" aria-label="六面沿共同棱折成长方体"></svg>
<div class="ctrl"><button type="button" class="btn ghost" id="sw-fold-reset">重新铺平</button><button type="button" class="btn" id="sw-download-net">下载制作纸图（SVG）</button></div>
<ol>
<li>下载后按实际大小100%打印（不要适合页面）；先用尺量纸图的5 cm校准线。不便打印时，在方格纸上按标注尺寸重画，保留编号和折线。</li>
<li>保留这张带尺寸的纸图或另描一份，再沿实线剪外轮廓，沿虚线折。A是底面，B与C、D与E分别竖起来，F接在C的远边后盖过来；请用胶带从外侧连接未相连的棱，不需要额外粘贴边。用剪刀时注意安全。</li>
<li>制作前逐面测量并记下边长。折好后量出三种棱长，检查六面成对：A和F为3×2，B和C为3×4，D和E为4×2（单位cm）。这些相对面不应贴在一起；相邻面共用的棱要等长、方向衔接，不能重叠、留缺口或把面反折。</li>
<li>保存自己的纸图、模型和测量记录。若合不拢，先查共用棱的长度、再查折叠方向，修改纸图并记录原因；也可请同伴按准则检查。</li>
</ol>
<label for="sw-notes">我的制作与测量记录（只留在本次页面，刷新会清空）</label>
<textarea id="sw-notes" rows="6" aria-describedby="sw-note-guide"></textarea>
<p id="sw-note-guide" class="small">记录纸图六面的实测边长、模型三种棱的实测长度、哪几面对上了、哪里有缝或重叠、怎样修正。未制作就写待做，不要把看动画当成已做实物。</p>
<div class="ctrl"><button type="button" class="btn" id="sw-save-notes">下载我的文字记录</button><button type="button" class="btn ghost" id="sw-review">打开自核准则</button><button type="button" class="btn ghost" id="sw-notes-reset">清空记录</button></div>
<p id="sw-note-status" role="status"></p>
<div id="sw-criteria" hidden><p><b>请拿实物逐项自核：</b>纸图六面尺寸是否对上？共同棱是否等长？A/F、B/C、D/E是否各在两侧？折后是否闭合、没有重叠？三种棱的实测值与纸图是否相符（记录尺的最小刻度和偏差）？保存了纸图和修改记录吗？</p><p>这些是你和同伴检查的依据。网页不会根据文字内容或点击按钮认证模型已制作成功；若尚无实物，请先保留为制作计划。</p></div>
</div>
`;
const style = document.createElement('style'); style.textContent = `
/* 初中站还没有 Wiki、实验台、记录页：先隐藏公共脚本插入的这三个入口 */
.hci-nav a[href$="wiki.html"], .hci-nav a[href$="anatomy.html"], .hci-nav a[href$="record.html"] { display: none !important; }
details.more { margin: 12px 0; border: 1px solid var(--line); border-radius: var(--radius); padding: 8px 14px; background: var(--card); }
details.more summary { cursor: pointer; font-weight: 600; padding: 4px 0; }
.route ol { margin: 6px 0 2px; padding-left: 22px; line-height: 1.8; }
.result { font-size: 16px; margin: 8px 0; min-height: 3.4em; line-height: 1.8; overflow-wrap: anywhere; }
.result .sum { color: var(--no); font-weight: 700; }
.result .ok { color: var(--a); font-weight: 700; }
#space-workshop .sw-heights { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin:12px 0; }
#space-workshop label { display:block; overflow-wrap:anywhere; }
#space-workshop input[type="text"], #space-workshop textarea, #space-workshop select { max-width:100%; box-sizing:border-box; background:var(--card); color:var(--fg); border:1px solid var(--muted); border-radius:6px; font:inherit; padding:6px; }
#space-workshop textarea { width:100%; }
#space-workshop input[type="text"] { width:100px; margin:8px; }
#space-workshop input[type="range"] { width:100%; }
#space-workshop svg { display:block; width:100%; max-width:440px; margin:12px auto; color:var(--fg); }
#space-workshop [hidden] { display:none; }
#space-workshop .ctrl { flex-wrap:wrap; }
#space-workshop button { white-space:normal; min-height:44px; }
#space-workshop :focus-visible { outline:3px solid var(--a); outline-offset:3px; }
`; root.prepend(style);
const $ = id => root.querySelector('#'+id);
const ns = 'http://www.w3.org/2000/svg';
function el(parent, tag, attrs) {
  const e = document.createElementNS(ns,tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,String(v)));
  parent.append(e); return e;
}
function text(parent,x,y,label) {
  const e = el(parent,'text',{x,y,'text-anchor':'middle',fill:'var(--fg)','font-size':16}); e.textContent=label; return e;
}
function polygon(svg, points, shade) {
  const p = points.map(q => q.join(',')).join(' ');
  el(svg,'polygon',{points:p,fill:'var(--card)'});
  el(svg,'polygon',{points:p,fill:shade, 'fill-opacity':0.30,stroke:'var(--fg)','stroke-width':1.4,'stroke-linejoin':'round'});
}
function renderFaces(svg, fs, height, top = false) {
  svg.replaceChildren();
  const project = p => top ? [p[0],-p[1]] : [p[0]+p[1],0.45*(p[0]-p[1])-p[2]];
  const pts = fs.flatMap(f => f.points.map(project));
  if (!pts.length) { text(svg,180,140,'尚无方块'); return; }
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
  const loX=Math.min(...xs), hiX=Math.max(...xs), loY=Math.min(...ys), hiY=Math.max(...ys);
  const scale=Math.min(280/Math.max(hiX-loX,1), (height-65)/Math.max(hiY-loY,1));
  fs.map(f=>({...f,depth:f.points.reduce((s,p)=>s+p[0]-p[1]+0.9*p[2],0)/4})).sort((a,b)=>a.depth-b.depth).forEach(f=>{
    polygon(svg,f.points.map(project).map(p=>[180+(p[0]-(loX+hiX)/2)*scale, (height-25)/2+(p[1]-(loY+hiY)/2)*scale]),f.color);
  });
}
let heights = [[0,0,0],[0,0,0],[0,0,0]], turns = 0;
for (let y=2;y>=0;y--) for (let x=0;x<3;x++) {
  const label=document.createElement('label');
  label.textContent=['左','中','右'][x]+['前','中','后'][y]+'：';
  const select=document.createElement('select'); select.dataset.x=x;select.dataset.y=y;
  for(let h=0;h<=3;h++){const o=document.createElement('option');o.value=h;o.textContent=h+'层';select.append(o);}
  label.append(select);$('sw-heights').append(label);
  select.addEventListener('change',()=>{heights[x][y]=Number(select.value);invalidate();draw();});
}
function invalidate() { $('sw-count').value='';$('sw-feedback').textContent='';$('sw-flat').hidden=true;$('sw-flat-caption').hidden=true;$('sw-flat-caption').hidden=true;$('sw-flat').replaceChildren(); }
function draw() {
  const view=$('sw-view').value;
  const list=turn(blocks(heights),turns), fs=[];
  const cameraList=turn(list,view==='left'?1:view==='right'?3:0);
  const occupied=new Set(cameraList.map(p=>p.join(',')));
  cameraList.forEach(([x,y,z])=>{
    // Only faces pointing towards the oblique viewer, with buried faces removed.
    if(!occupied.has([x+1,y,z].join(',')))fs.push({points:[[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],color:'var(--b)'});
    if(!occupied.has([x,y-1,z].join(',')))fs.push({points:[[x,y,z],[x+1,y,z],[x+1,y,z+1],[x,y,z+1]],color:'var(--a)'});
    if(!occupied.has([x,y,z+1].join(',')))fs.push({points:[[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],color:'var(--muted)'});
  });
  renderFaces($('sw-solid'),view==='top'?fs.filter(f=>f.points.every(p=>p[2]===f.points[0][2])):fs,270,view==='top');
  $('sw-solid-caption').textContent=view==='top'?'上方为后排，下方为前排':'站在所选一侧略向上看；转向后的同一作品';
  $('sw-state').textContent='同一作品，共'+list.length+'块；已逆时针转'+(turns*90)+'°。格子设置始终按搭建时的方向；观察位置按转后方向。当前：'+$('sw-view').selectedOptions[0].textContent+'。';

  $('sw-solid').setAttribute('aria-label','当前作品斜看示意；'+$('sw-view').selectedOptions[0].textContent+'的格子在核对后显示');
  $('sw-solid').dataset.view=view;
}
function reset(empty) {
  heights=empty?[[0,0,0],[0,0,0],[0,0,0]]:[[2,1,0],[1,0,0],[1,0,0]];
  turns=0;
  root.querySelectorAll('#sw-heights select').forEach(e=>{e.value=heights[Number(e.dataset.x)][Number(e.dataset.y)];});
  $('sw-view').value='front';invalidate();draw();
}
$('sw-turn').onclick=()=>{turns=(turns+1)%4;invalidate();draw();};
$('sw-clear').onclick=()=>reset(true);$('sw-reset').onclick=()=>reset(false);
$('sw-view').onchange=()=>{invalidate();draw();};
$('sw-count').oninput=()=>{$('sw-feedback').textContent='';$('sw-flat').hidden=true;$('sw-flat-caption').hidden=true;};
$('sw-count-form').onsubmit=e=>{
  e.preventDefault();const answer=countToken($('sw-count').value);
  if(answer===null){$('sw-feedback').textContent='请按输入约定填一个0到9的整数，再核对。';return;}
  const list=turn(blocks(heights),turns), cells=seen(list,$('sw-view').value);
  $('sw-feedback').textContent=(answer===cells.length?'与格子图一致。':'再看格子图，修改后可以重试。')+'当前方向共有'+cells.length+'格；'+list.length+'是方块总数。沿同一视线重叠只记一格。'+(!list.length?'现在没有方块，请再搭一件作品观察。':'');
  const svg=$('sw-flat');svg.replaceChildren();svg.hidden=false;
  for(let x=0;x<3;x++)for(let z=0;z<3;z++)el(svg,'rect',{x:105+x*50,y:15+(2-z)*50,width:50,height:50,fill:'none',stroke:'var(--line)'});
  cells.forEach(([x,z])=>el(svg,'rect',{x:105+x*50,y:15+(2-z)*50,width:50,height:50,fill:'var(--a)','fill-opacity':0.35,stroke:'var(--fg)','stroke-width':2}));
  $('sw-flat-caption').hidden=false;
  $('sw-flat-caption').textContent=$('sw-view').value==='left'?'左是后排，右是前排':$('sw-view').value==='right'?'左是前排，右是后排':$('sw-view').value==='top'?'上是后排，下是前排':'左是左侧，右是右侧';
};
// Fixed-scale unfolded net: root A 3×2, surrounding height 4, lid F 3×2.
faces.forEach(f=>{
  const [x,y,w,h]=f.rect;
  el($('sw-net'),'rect',{x:145+x*28,y:130+y*28,width:w*28,height:h*28,fill:'var(--card)',stroke:'var(--fg)','stroke-width':1.5});
  text($('sw-net'),145+(x+w/2)*28,130+(y+h/2)*28+6,f.id+' '+f.size);
});
el($('sw-net'),'path',{d:'M145 130 H229 M145 186 H229 M145 130 V186 M229 130 V186 M145 298 H229',stroke:'var(--a)','stroke-width':3,'stroke-dasharray':'6 4'});

function drawFold(){
  const degrees=Number($('sw-fold').value);
  $('sw-fold-state').textContent=degrees+'°，'+(degrees===0?'铺平':degrees===90?'闭合为长方体':'沿共同棱折起');
  renderFaces($('sw-folded'),folded(degrees).map((points,i)=>({points,color:i%2?'var(--b)':'var(--a)'})),300);
}
$('sw-fold').oninput=drawFold;
$('sw-fold-reset').onclick=()=>{$('sw-fold').value=0;drawFold();};
function download(content,type,name){
  const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('sw-download-net').onclick=()=>download(templateSVG(),'image/svg+xml','j6-1-cuboid-2-3-4cm.svg');
$('sw-save-notes').onclick=()=>{
  const notes=$('sw-notes').value;
  if(!notes.trim()){$('sw-note-status').textContent='记录还是空白；请写下自己的测量或待做计划。';return;}
  download('长方体制作记录（本人填写，未经网页认证）\n'+notes,'text/plain;charset=utf-8','j6-1-my-model-notes.txt');
  $('sw-note-status').textContent='已下载本人填写的文字；请与自己的纸图、模型一起保存。网页未判定制作完成。';
};
$('sw-review').onclick=()=>{$('sw-criteria').hidden=false;};
$('sw-notes').oninput=()=>{$('sw-note-status').textContent='';};
$('sw-notes-reset').onclick=()=>{$('sw-notes').value='';$('sw-note-status').textContent='';$('sw-criteria').hidden=true;};
reset(false);drawFold();
})();
