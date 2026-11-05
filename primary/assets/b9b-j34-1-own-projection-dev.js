/* j34-1 only: finite coordinate constructions, no learning-record writes. */
(function () {
  'use strict';
  const root = document.getElementById('j34-own-projection');
  if (!root || document.body.dataset.sec !== 'j34-1' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  const sources = [
    {name:'两影均向右', pts:[[2,2],[3,0],[4,2],[6,0]], kind:'center', source:[0,6], why:'AE：z=−2x+6；BF：z=−x+6。交于(0,6)，高于两杆。两影同向仍是中心投影。'},
    {name:'第二组观测', pts:[[2,2],[4,0],[5,3],[8,0]], kind:'parallel', why:'两条直线斜率均为−1，截距分别为4与8，互平行且不重合；符合平行光模型，不能给有限点光源坐标。'},
    {name:'第三组观测', pts:[[2,4],[4,0],[3,2],[4,0]], kind:'overlap', why:'两线都为z=−2x+8，重合；(0,8)与(1,6)都能作高于物体的光源，不能唯一定位。'},
    {name:'第四组观测', pts:[[2,3],[5,0],[6,2],[4,0]], kind:'invalid', why:'两线交于(4.5,0.5)，交点低于两杆，不满足本题光源高于物体的条件，不能当作合法点光源。'}
  ];
  const shadows = [
    {name:'点光源', top:[4,2], source:[0,6], end:6, len:2, given:'点光源 S=(0,6)，杆顶 T=(4,2)，杆脚 (4,0)。', why:'连接S、T并沿S→T延长到地面，交于(6,0)。相似比例 2/(4+2)=2/6，影长2 m。'},
    {name:'平行光', top:[5,3], end:8, len:3, given:'已知同一平行光下，参考杆顶 (1,2) 的影端为 (3,0)；新杆顶 T=(5,3)，杆脚 (5,0)。', why:'过T作平行于参考光线的直线，每下降2 m向右2 m；下降3 m到(8,0)，影长3 m。也可由影长比等于物高比求得。'},
    {name:'杆在灯正下方', top:[3,2], source:[3,6], end:3, len:0, given:'点光源 S=(3,6)，杆顶 T=(3,2)，杆脚 (3,0)。', why:'S、T与杆脚在同一竖线上，影端(3,0)，影长0 m，投影是一个点；0不是无法作图。'}
  ];
  const options = (items) => items.map((t,i)=>`<option value="${i}">${t}</option>`).join('');
  const blankSelect = (id,label,items) => `<label>${label} <select id="${id}"><option value="">请选择</option>${items}</select></label>`;
  const number = (id,label) => `<label>${label} <textarea id="${id}" rows="1" inputmode="decimal" autocomplete="off" maxlength="40" style="width:6em;max-width:100%;vertical-align:middle"></textarea></label>`;
  const reason = (id) => `<label style="display:block">我的几何依据（仅供自核）<textarea id="${id}" rows="2" maxlength="1200" style="display:block;width:100%;box-sizing:border-box"></textarea></label>`;
  const response = (id) => `<p id="${id}-result" role="status" aria-live="polite"></p><details class="more" id="${id}-explain" hidden><summary>本次尝试后核对作法</summary><p></p></details>`;
  const figure = (id,label) => `<svg id="${id}" viewBox="0 0 380 280" data-figure-label-fixed="1" role="img" aria-label="${label}" style="display:block;width:100%;max-width:560px;background:var(--card)"></svg>`;
  root.innerHTML = `
    <h3>自己作图：每次做一件事</h3>
    <details class="more"><summary>图里的条件与怎么输入？</summary><p>这是有限坐标作图区，不是任意空间作图器。每格1 m，地面水平；物体是竖杆。点光源须高于所有物体，平行光向下照射。先在纸上作线，再在这里选点或填坐标，把自己的图画出来。</p>
    <p class="small">数值只填十进制数，最多两位小数，单位统一为m，不填单位字符。本题结果可精确表示，不作近似容差判对。文字依据由你对照准则自核，系统只检查有限构型的作线、坐标、类型和长度，不认证纸笔活动或证明已完成；不保存本区资料。</p></details><p>每格1米，灯要高于杆顶。先选两条线并延长，看看它们在哪里相交。</p>
    <fieldset style="min-width:0"><legend>一、由两组杆顶与影端寻找光源</legend>
      <label>观测组 <select id="op-source-case">${options(sources.map(x=>x.name))}</select></label>
      <p id="op-source-given"></p>
      <p>图是竖直截面，横轴x、纵轴高度z，地面z=0；A、B是杆顶，E、F是相应影端。两组观测已知来自同一种理想光源模型，第四组用于检验条件是否矛盾。</p>
      <div id="op-rays"></div>
      <button type="button" id="op-draw-rays" class="btn ghost">画我的两条延长线</button>
      ${figure('op-source-fig','竖直截面的观测点与学生作线')}
      ${blankSelect('op-kind','我的判断','<option value="center">唯一且符合条件的点光源</option><option value="parallel">两条光线互平行且不同线</option><option value="overlap">光线重合，不能唯一定位</option><option value="invalid">相交但不满足高于物体的条件</option>')}
      <div id="op-source-coords">${number('op-sx','光源x')}${number('op-sz','光源高度z')}</div>
      <p class="small">只有判断为唯一合法点光源时才填坐标；其余留空。</p>
      ${reason('op-source-reason')}
      <button type="button" id="op-check-source" class="btn">核对寻源</button> <button type="button" id="op-reset-source" class="btn ghost">重做寻源</button>
      ${response('op-source')}
    </fieldset>
    <fieldset style="min-width:0;margin-top:18px"><legend>二、独立作出一根杆的影子</legend>
      <label>题组 <select id="op-shadow-case">${options(shadows.map(x=>x.name))}</select></label><p id="op-shadow-given"></p>
      <p>竖直截面仍用(x,z)。影端在地面；先输入影端，再点作图。图只连接你填的影端，不自动填正确影端。影子为杆脚与影端之间的地面部分。</p>
      ${number('op-ex','影端x')} ${number('op-ez','影端z')} ${number('op-length','影长（m）')}
      ${figure('op-shadow-fig','竖杆、光源或参考光线及学生影端')}
      ${reason('op-shadow-reason')}
      <button type="button" id="op-check-shadow" class="btn">画我的影子并核对</button> <button type="button" id="op-reset-shadow" class="btn ghost">重做影子</button>
      ${response('op-shadow')}
    </fieldset>
    <fieldset style="min-width:0;margin-top:18px"><legend>三、先填垂足，再连正投影轮廓</legend>
      <label>限定构型 <select id="op-ortho-case">${options(['线段·平放','线段·倾斜','线段·竖直','矩形纸片·平放','矩形纸片·倾斜','矩形纸片·竖直'])}</select></label>
      <p>地面上有互相垂直的x、y方向，高度z垂直地面。表中用三个长度读数描述位置；光线竖直向下。只做这一条边在竖直截面中转动、另一条边沿地面y方向且宽3 m的矩形，不用透视画法。</p>
      <div style="overflow-x:auto"><table><thead><tr><th>原顶点</th><th>地面x</th><th>地面y</th><th>高度z</th></tr></thead><tbody id="op-vertices"></tbody></table></div>
      <p>纸上从每个顶点向地面作垂线；在下面填各垂足(x,y)。显示的是从上往下看的地面图，按顶点次序连线；垂足重合时允许填相同坐标。</p>
      <div id="op-feet"></div>
      ${blankSelect('op-shape','投影形状','<option value="point">点</option><option value="line">线段</option><option value="rect">矩形（含正方形）</option>')}
      ${number('op-width','AB正投影长（m）')}
      ${figure('op-ortho-fig','地面网格和学生填写的正投影轮廓')}
      ${reason('op-ortho-reason')}
      <button type="button" id="op-check-ortho" class="btn">画我的轮廓并核对</button> <button type="button" id="op-reset-ortho" class="btn ghost">重做正投影</button>
      ${response('op-ortho')}
    </fieldset>`;
  const $ = id => document.getElementById(id);

  // Author display rules must not expose later phases marked hidden.
  root.classList.add('own-workspace');
  const phaseStyle = document.createElement('style');
  phaseStyle.textContent = '.own-workspace [hidden]{display:none!important}.own-workspace input,.own-workspace select,.own-workspace textarea,.own-workspace button{font:inherit;max-width:100%;box-sizing:border-box}';
  root.append(phaseStyle);
  // Page-local feedback: keep the first correction beside its control.
  let activeField = null;
  function clearErrors() {
    root.querySelectorAll('[data-input-error]').forEach(e => {
      const id=e.id;
      root.querySelectorAll('[aria-describedby]').forEach(input=>{
        const ids=input.getAttribute('aria-describedby').split(/\s+/).filter(v=>v!==id);
        if(ids.length)input.setAttribute('aria-describedby',ids.join(' '));else input.removeAttribute('aria-describedby');
      });e.remove();
    });
    root.querySelectorAll('[aria-invalid="true"]').forEach(e => e.removeAttribute('aria-invalid'));
  }
  function fieldError(input, message) {
    if (!input) return;
    clearErrors();
    for(let parent=input.parentElement;parent&&parent!==root;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    input.setAttribute('aria-invalid', 'true');
    const note = document.createElement('span');
    note.dataset.inputError = 'true'; note.setAttribute('role', 'alert');
    note.id=(input.id||input.name||'own-field')+'-error';
    const described=(input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
    if(!described.includes(note.id))described.push(note.id);
    input.setAttribute('aria-describedby',described.join(' '));
    note.style.cssText = 'display:block;font-size:15px;overflow-wrap:anywhere;color:var(--no)';
    note.textContent = message; input.insertAdjacentElement('afterend', note);
    if (!input.closest('[hidden]')) input.focus();
  }
  function atField(input, run) { activeField = input; return run(); }
  function inputHelp(element) {
    if (!element) return;
    const d = document.createElement('details'); d.className = 'more';
    const s = document.createElement('summary'); s.textContent = '怎么输入？';
    element.before(d); d.append(s, element);
  }
  root.addEventListener('input', clearErrors);
  root.addEventListener('change', clearErrors);
  root.addEventListener('reset', clearErrors);

  const activities=Array.from(root.children).filter(e=>e.tagName==='FIELDSET');
  const menu=document.createElement('label');menu.textContent='选一个活动 ';
  const activity=document.createElement('select');activity.id='op-activity-case';activity.setAttribute('aria-label','选一个作图活动');
  ['找光源','画影子','画正投影'].forEach((name,i)=>activity.append(new Option(name,String(i))));
  menu.append(activity);activities[0].before(menu);
  function chooseActivity(){activities.forEach((e,i)=>e.hidden=i!==Number(activity.value));clearErrors();}
  activity.onchange=chooseActivity;chooseActivity();
  function wrapAfter(start,end) {
    const box=document.createElement('div');start.before(box);
    let n=start;while(n&&n!==end){const next=n.nextElementSibling;box.append(n);n=next;}
    box.hidden=true;return box;
  }
  const sourceAnswer=wrapAfter($('op-kind').closest('label'),$('op-reset-source').nextElementSibling);
  // Keep checking/reset buttons inside the revealed answer panel.
  const shadowAnswer=wrapAfter($('op-length').closest('label'),$('op-check-shadow'));
  $('op-length').closest('div').before($('op-shadow-fig'));
  const orthoAnswer=wrapAfter($('op-shape').closest('label'),$('op-check-ortho'));
  inputHelp($('op-rays').previousElementSibling);
  activities[2].querySelectorAll(':scope > p:not([role])').forEach(inputHelp);
  const rawRead=read;
  function numeric(id) {
    activeField=$(id);const n=rawRead(id);
    if(n===null) fieldError(activeField,'这里填−20至20的数，最多两位小数；不带单位或换行。');
    return n;
  }
  // Exact hundredths; reject internal/edge newlines, units, exponents and hidden text.
  function read(id) {
    const raw=$(id).value;
    if (!/^[ ]*[+-]?(?:\d+(?:\.\d{1,2})?|\.\d{1,2})[ ]*$/.test(raw)) return null;
    const n=Number(raw); return Number.isFinite(n) && n>=-20 && n<=20 ? Math.round(n*100) : null;
  }
  const val = id => {const n=read(id);return n===null?null:n/100;};
  function clear(group) {
    $(group+'-result').textContent=''; const d=$(group+'-explain');d.hidden=true;d.open=false;d.querySelector('p').textContent='';
  }
  function report(group,ready,ok,why) {
    clear(group);
    $(group+'-result').textContent= !ready ? '先补好旁边提示的这一项，再核对。' : ok ? '本题作线或数值核对相符。文字依据仍请按下面准则自核。' : '这一项还不相符，请按输入框旁的提示改一改。';
    if (ready) {const d=$(group+'-explain');d.hidden=false;d.querySelector('p').textContent=why+' 自核：说明共线/平行或垂直关系，列相似比例或说明垂足位置；不是只写答案。';}
  }
  function hasReason(id) {return $(id).value.trim().length>0;}
  const NS='http://www.w3.org/2000/svg';
  function el(svg,tag,attrs,text) {const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;svg.append(n);return n;}
  const xy=p=>[36+32*p[0],244-32*p[1]];
  function line(svg,a,b,dash=false) {const p=xy(a),q=xy(b);el(svg,'line',{x1:p[0],y1:p[1],x2:q[0],y2:q[1],stroke:'var(--fg)','stroke-width':2,...(dash?{'stroke-dasharray':'5 4'}:{})});}
  function point(svg,p,label) {const q=xy(p);el(svg,'circle',{cx:q[0],cy:q[1],r:4,fill:'var(--fg)'});if(label)el(svg,'text',{x:q[0]+6,y:q[1]-8,fill:'var(--fg)','font-size':20},label);}
  function grid(id,vertical) {
    const svg=$(id);svg.replaceChildren();
    for(let x=0;x<=10;x++) {const p=xy([x,0]),q=xy([x,7]);el(svg,'line',{x1:p[0],x2:q[0],y1:p[1],y2:q[1],stroke:'var(--line)'});if(x%2===0)el(svg,'text',{x:p[0],y:268,fill:'var(--fg)','font-size':20,'text-anchor':'middle'},x);}
    for(let y=0;y<=7;y++){const p=xy([0,y]),q=xy([10,y]);el(svg,'line',{x1:p[0],x2:q[0],y1:p[1],y2:q[1],stroke:'var(--line)'});if(y%2===0)el(svg,'text',{x:22,y:p[1]+5,fill:'var(--fg)','font-size':20,'text-anchor':'end'},y);}
    line(svg,[0,0],[10,0]);el(svg,'text',{x:374,y:238,'text-anchor':'end',fill:'var(--fg)','font-size':20},'x');el(svg,'text',{x:12,y:24,fill:'var(--fg)','font-size':20},vertical?'z':'y');return svg;
  }
  function extended(svg,a,b) {
    // Clip student lines to this finite workspace, including vertical lines.
    const dx=b[0]-a[0],dy=b[1]-a[1];if(dx===0&&dy===0)return;
    let low=-Infinity,high=Infinity;
    for(const [p,d,max] of [[a[0],dx,10],[a[1],dy,7]]) {
      if(d===0){if(p<0||p>max)return;continue;}
      const t0=-p/d,t1=(max-p)/d;low=Math.max(low,Math.min(t0,t1));high=Math.min(high,Math.max(t0,t1));
    }
    if(low<=high)line(svg,[a[0]+low*dx,a[1]+low*dy],[a[0]+high*dx,a[1]+high*dy],true);
  }
  let drawn=false;
  function sourceBase(){const c=sources[+$('op-source-case').value],svg=grid('op-source-fig',true);line(svg,[c.pts[0][0],0],c.pts[0]);line(svg,[c.pts[2][0],0],c.pts[2]);c.pts.forEach((p,i)=>{if(c.pts.findIndex(q=>q[0]===p[0]&&q[1]===p[1])===i)point(svg,p,c.pts.map((q,j)=>q[0]===p[0]&&q[1]===p[1]?['A','E','B','F'][j]:'').filter(Boolean).join('/'));});return svg;}
  function sourceReset(){clear('op-source');sourceAnswer.hidden=true;clearErrors();drawn=false;const c=sources[+$('op-source-case').value];$('op-source-given').textContent=c.pts.map((p,i)=>['A','E','B','F'][i]+'=('+p.join(',')+')').join('；');$('op-rays').innerHTML=[0,1].map(i=>`<p>直线${i+1}：${blankSelect('op-r'+i+'a','第一点',options(['A','E','B','F']))} ${blankSelect('op-r'+i+'b','第二点',options(['A','E','B','F']))}</p>`).join('');['op-kind','op-sx','op-sz','op-source-reason'].forEach(id=>$(id).value='');sourceBase();}
  $('op-draw-rays').onclick=()=>{clear('op-source');const c=sources[+$('op-source-case').value],svg=sourceBase();drawn=[0,1].every(i=>$('op-r'+i+'a').value!==''&&$('op-r'+i+'b').value!==''&&c.pts[+$('op-r'+i+'a').value].some((n,j)=>n!==c.pts[+$('op-r'+i+'b').value][j]));if(drawn) {
      [0,1].forEach(i=>extended(svg,c.pts[+$('op-r'+i+'a').value],c.pts[+$('op-r'+i+'b').value]));
      const pairs=[0,1].map(i=>[c.pts[+$('op-r'+i+'a').value],c.pts[+$('op-r'+i+'b').value]]);
      const valid=(sameLine(...pairs[0],c.pts[0],c.pts[1])&&sameLine(...pairs[1],c.pts[2],c.pts[3]))||(sameLine(...pairs[1],c.pts[0],c.pts[1])&&sameLine(...pairs[0],c.pts[2],c.pts[3]));
      sourceAnswer.hidden=!valid;
      if(!valid)fieldError($('op-r0a'),'两条线要分别经过每根杆顶和它的影端；回图上检查配对。');
      else $('op-source-result').textContent='两条线通过。现在判断光线相交、平行还是重合。';
    } else {sourceAnswer.hidden=true;const missing=[0,1].flatMap(i=>['op-r'+i+'a','op-r'+i+'b']).find(id=>$(id).value==='');fieldError($(missing||'op-r0b'),'每条线先选两个不同位置的点。');}};
  function sameLine(a,b,c,d) {const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);return (a[0]!==b[0]||a[1]!==b[1])&&cross(a,b,c)===0&&cross(a,b,d)===0;}
  $('op-check-source').onclick=()=>{
    const c=sources[+$('op-source-case').value],k=$('op-kind').value;
    const ready=drawn&&k!==''&&hasReason('op-source-reason')&&(k!=='center'||(read('op-sx')!==null&&read('op-sz')!==null));
    const pairs=[0,1].map(i=>[c.pts[+$('op-r'+i+'a').value],c.pts[+$('op-r'+i+'b').value]]);
    const valid=drawn&&((sameLine(...pairs[0],c.pts[0],c.pts[1])&&sameLine(...pairs[1],c.pts[2],c.pts[3]))||(sameLine(...pairs[1],c.pts[0],c.pts[1])&&sameLine(...pairs[0],c.pts[2],c.pts[3])));
    const coords=k==='center' ? c.source&&read('op-sx')===c.source[0]*100&&read('op-sz')===c.source[1]*100 : $('op-sx').value===''&&$('op-sz').value==='';
    const svg=sourceBase();if(drawn)[0,1].forEach(i=>extended(svg,...pairs[i]));
    if(k==='center'){const x=val('op-sx'),z=val('op-sz');if(x!==null&&z!==null&&x>=0&&x<=10&&z>=0&&z<=7)point($('op-source-fig'),[x,z],'S');}
    report('op-source',ready,valid&&k===c.kind&&coords,c.why);
    if(!drawn)fieldError($('op-r0a'),'先选点，点“画我的两条延长线”。');
    else if(!valid)fieldError($('op-r0a'),'两条线应分别穿过对应的杆顶与影端。');
    else if(k!==c.kind)fieldError($('op-kind'),'再看两条线：是否平行或重合？交点是否高于两杆？');
    else if(k==='center'&&read('op-sx')!==c.source[0]*100)fieldError($('op-sx'),'交点的横坐标还不符，请沿网格读数。');
    else if(k==='center'&&read('op-sz')!==c.source[1]*100)fieldError($('op-sz'),'交点的高度还不符，请沿网格读数。');
    else if(k!=='center'&&!coords)fieldError($('op-sx'),'这组不能定位唯一合法光源，两个坐标框留空。');
    else if(!hasReason('op-source-reason'))fieldError($('op-source-reason'),'写一句你怎样从两条线得到判断；文字请自核。');
  };
  function shadowBase(){const c=shadows[+$('op-shadow-case').value],svg=grid('op-shadow-fig',true);$('op-shadow-given').textContent=c.given;line(svg,[c.top[0],0],c.top);point(svg,c.top,'T');if(c.source)point(svg,c.source,'S');else{line(svg,[1,2],[3,0],true);point(svg,[1,2],'R');}return svg;}
  function shadowReset(){clear('op-shadow');shadowAnswer.hidden=true;clearErrors();['op-ex','op-ez','op-length','op-shadow-reason'].forEach(id=>$(id).value='');shadowBase();}
  $('op-check-shadow').onclick=()=>{const c=shadows[+$('op-shadow-case').value],x=val('op-ex'),z=val('op-ez'),len=val('op-length');if(x===null){numeric('op-ex');return;}if(z===null){numeric('op-ez');return;}
    if(x!==c.end){fieldError($('op-ex'),'把光线延长到地面，重新读影端的横坐标。');return;}
    if(z!==0){fieldError($('op-ez'),'影端在地面上，检查高度坐标。');return;}
    if(shadowAnswer.hidden){shadowAnswer.hidden=false;$('op-shadow-result').textContent='影端通过。接着求杆脚到影端的距离。';return;}
    const ready=x!==null&&z!==null&&len!==null&&hasReason('op-shadow-reason');const svg=shadowBase();if(x!==null&&z!==null&&x>=0&&x<=10&&z>=0&&z<=7){point(svg,[x,z],'E');line(svg,c.top,[x,z],true);line(svg,[c.top[0],0],[x,z]);}report('op-shadow',ready,x===c.end&&z===0&&len===c.len,c.why);if(len!==c.len)fieldError($('op-length'),'影长是杆脚到影端的距离；竖直照射时可以为0。');else if(!hasReason('op-shadow-reason'))fieldError($('op-shadow-reason'),'写一句作图依据；文字仍请自核。');};
  function orthoData(){const i=+$('op-ortho-case').value,t=i%3,sheet=i>=3,bx=[5,4,1][t],bz=[2,6,7][t];return{t,sheet,verts:[[1,0,2],[bx,0,bz],...(sheet?[[bx,3,bz],[1,3,2]]:[])],width:bx-1,shape:sheet?(t===2?'line':'rect'):(t===2?'point':'line')};}
  function orthoReset(){clear('op-ortho');orthoAnswer.hidden=true;clearErrors();const c=orthoData();$('op-vertices').innerHTML=c.verts.map((p,i)=>`<tr><th>${'ABCD'[i]}</th>${p.map(n=>`<td>${n} m</td>`).join('')}</tr>`).join('');$('op-feet').innerHTML=c.verts.map((p,i)=>`<p>${'ABCD'[i]}′：${number('op-f'+i+'x','x')} ${number('op-f'+i+'y','y')}</p>`).join('');['op-shape','op-width','op-ortho-reason'].forEach(id=>$(id).value='');grid('op-ortho-fig',false);}
  $('op-check-ortho').onclick=()=>{const c=orthoData(),feet=c.verts.map((p,i)=>[val('op-f'+i+'x'),val('op-f'+i+'y')]),width=val('op-width');for(let i=0;i<feet.length;i++)for(let j=0;j<2;j++)if(feet[i][j]!==c.verts[i][j]){fieldError($('op-f'+i+['x','y'][j]),'顶点'+'ABCD'[i]+'的垂足这一项还不对。竖直落到地面时，地面方向的读数不变。');return;}
    if(orthoAnswer.hidden){orthoAnswer.hidden=false;$('op-ortho-result').textContent='垂足通过。接着判断连成的形状和AB投影长。';return;}
    const ready=feet.flat().every(n=>n!==null)&&width!==null&&$('op-shape').value!==''&&hasReason('op-ortho-reason');const svg=grid('op-ortho-fig',false);if(feet.flat().every(n=>n!==null&&n>=0&&n<=7)){feet.forEach((p,i)=>point(svg,p));feet.slice(1).forEach((p,i)=>line(svg,feet[i],p));if(c.sheet)line(svg,feet[3],feet[0]);}const ok=feet.every((p,i)=>p[0]===c.verts[i][0]&&p[1]===c.verts[i][1])&&width===c.width&&$('op-shape').value===c.shape;report('op-ortho',ready,ok,'竖直垂线落地时，地面x、y读数不变。各垂足为'+c.verts.map((p,i)=>'ABCD'[i]+'′('+p.slice(0,2).join(',')+')').join('、')+'。AB投影长'+c.width+' m；'+(c.t===0?'与原AB等长。':c.t===1?'原AB长5 m，投影缩短。':c.sheet?'纸片退化为长3 m的线段，仍可作图。':'AB两垂足重合，投影为点，长度0，仍可作图。'));};
  const checkOrtho=$('op-check-ortho').onclick;
  $('op-check-ortho').onclick=()=>{
    const wasHidden=orthoAnswer.hidden;checkOrtho();if(wasHidden&&!orthoAnswer.hidden)return;if(orthoAnswer.hidden||root.querySelector('[data-input-error]'))return;
    const c=orthoData();
    if($('op-shape').value!==c.shape)fieldError($('op-shape'),'把垂足按顺序连起来；重合时可能只剩线段或点。');
    else if(val('op-width')!==c.width)fieldError($('op-width'),'只算A、B两个垂足之间的距离，投影长可以为0。');
    else if(!hasReason('op-ortho-reason'))fieldError($('op-ortho-reason'),'写一句垂足或垂直关系的依据；文字请自核。');
  };
  [['source',sourceReset],['shadow',shadowReset],['ortho',orthoReset]].forEach(([part,reset])=>{$('op-'+part+'-case').onchange=reset;$('op-reset-'+part).onclick=reset;});
  root.addEventListener('input',e=>{const fs=e.target.closest('fieldset');if(!fs)return;const group=fs.querySelector('[role="status"]').id.replace('-result','');clear(group);if(group==='op-source'){if(/^op-r[01][ab]$/.test(e.target.id)){drawn=false;sourceAnswer.hidden=true;}const svg=sourceBase();if(drawn){const c=sources[+$('op-source-case').value];[0,1].forEach(i=>extended(svg,c.pts[+$('op-r'+i+'a').value],c.pts[+$('op-r'+i+'b').value]));}}if(group==='op-shadow'){shadowBase();if(['op-ex','op-ez'].includes(e.target.id))shadowAnswer.hidden=true;}if(group==='op-ortho'){if(e.target.id.startsWith('op-f'))orthoAnswer.hidden=true;}if(group==='op-ortho')grid('op-ortho-fig',false);});
  // Select change also invalidates stale construction, including programmatic accessibility change events.
  root.addEventListener('change',e=>{if(e.target.matches('select')&&!e.target.id.endsWith('-case'))e.target.dispatchEvent(new Event('input',{bubbles:true}));});
  sourceReset();shadowReset();orthoReset();
  $('op-kind').addEventListener('change',()=>{$('op-source-coords').hidden=$('op-kind').value!=='center';});
}());
