/* This lesson only: a student's finite forward-view draft, never a 3D engine. */
(function () {
  'use strict';
  if (!document.body || document.body.dataset.stage !== 'junior' || document.body.dataset.sec !== 'j34-2') return;
  const root = document.getElementById('j34-forward-views');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const shapes = {rect:'矩形',left:'直角三角形（直角左下）',right:'直角三角形（直角右下）',iso:'等腰三角形（顶点向上）',circle:'圆',dot:'圆及顶点投影的圆心点'};
  const tasks = [
    {title:'直三棱柱',given:'两个底面是竖直且平行的直角三角形。前底面直角顶点 A 在左下，AB 水平向右长6 cm，AC 竖直向上长8 cm；三条侧棱从前底面向正后方伸出4 cm，垂直于底面。从正面正对前底面观察；左视从物体左方看，俯视从正上方看。',answer:[['left',6,8],['rect',4,8],['rect',6,4]],why:'主视保留前底面的横向6和竖直8，直角在左下；从左面看到一个矩形侧面，后方到前方宽4、高8；俯视保留横向6和前后4。背后的重合投影不另添虚线。'},
    {title:'竖直圆柱',given:'不透明实心圆柱竖直放置，底面水平，底面半径3 cm，高10 cm。从正面、左面水平观察，俯视从正上方看。',answer:[['rect',6,10],['rect',6,10],['circle',6,6]],why:'两侧视图横向都是底面直径2×3=6，竖直都是高10；俯视为直径6的圆。圆柱没有顶点，不另加顶点投影点。'},
    {title:'竖直圆锥',given:'不透明实心正圆锥竖直放置，底面水平、顶点在底面圆心正上方；底面半径4 cm，高6 cm。从正面、左面水平观察，俯视从正上方看。还要标出顶点的俯视投影。',answer:[['iso',8,6],['iso',8,6],['dot',8,8]],why:'两侧视图是底边直径2×4=8、高6的等腰三角形，不能把母线当作高。俯视为直径8的圆，顶点正投影在圆心。'},
    {title:'球',given:'不透明实心球，半径2.5 cm。从正面、左面和正上方作正投影。球面没有另标的点或棱。',answer:[['circle',5,5],['circle',5,5],['circle',5,5]],why:'球的每个方向正投影都是直径2×2.5=5的圆；三个圆全等。不需要球的表面积或体积公式，也不凭空加点或棱。'}
  ];
  const names = ['主视图','左视图','俯视图'];
  const positions = {ul:'甲格（左上）',ur:'乙格（右上）',ll:'丙格（左下）'};
  const slots = {ul:[10,10],ur:[320,10],ll:[10,270]};
  const option = (values) => '<option value="">请选择</option>' + Object.entries(values).map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');
  root.innerHTML = `<h3>先画自己的三视图，再核对</h3><p>这里补做“物体 → 三视图”。先在纸上画草稿，再把你画的轮廓、尺寸、摆位和线型填在下面，点“画出我的草稿”。错误会照画，不会替你改正。核对后才可展开参考图。</p><p class="small">只做下列四个明确物体。所有尺寸统一用 cm；横向跨度、竖向跨度填0.5到20内的整数或最多两位小数，不填单位、算式、分数或e记数。圆的横竖跨度都指直径。只画物体轮廓及题目指定的点，不画尺寸线、辅助线或中心线。三个格子均为同一比例；图会整体缩放以便查看，以自己填写的尺寸为准。</p><label>选择物体<select id="fv-task">${tasks.map((t,i)=>'<option value="'+i+'">'+t.title+'</option>').join('')}</select></label><p id="fv-given"></p><p>纸笔自查：投影方向是否正对？三图的长、宽、高对应到哪两个方向？可见轮廓用实线，被挡住且没有与实线重合的轮廓才用虚线。这里不认证纸上作图实际发生。</p><form id="fv-form" novalidate><div id="fv-fields"></div><div class="ctrl"><button type="button" class="btn" id="fv-draw">画出我的草稿</button><button type="submit" class="btn">核对我的三视图</button><button type="button" class="btn ghost" id="fv-reset">清空本题重试</button></div><p id="fv-feedback" role="status" aria-live="polite"></p></form><div id="fv-draft" hidden></div><details id="fv-guide" class="more" hidden><summary>本次尝试后：展开参考图和自核准则</summary><p id="fv-why"></p><div id="fv-standard"></div><p>纸图上还须自行核查长对正、高平齐、宽相等，以及轮廓的实虚线。坐标和尺寸核对不认证纸图、书写理由或同伴活动。</p></details>`;
  const style = document.createElement('style');
  style.textContent = '#j34-forward-views{overflow-wrap:anywhere;scroll-margin-top:80px}#j34-forward-views label{display:block}#j34-forward-views input,#j34-forward-views select{box-sizing:border-box;max-width:100%;min-height:44px;font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--muted);border-radius:6px;padding:6px}#j34-forward-views input{width:100%;min-width:0}#j34-forward-views fieldset{min-width:0;margin:14px 0;padding:10px;border:1px solid var(--line)}#j34-forward-views .fv-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#j34-forward-views .fv-wide{grid-column:1/-1}#j34-forward-views .ctrl{flex-wrap:wrap}#j34-forward-views button{min-height:44px;font-size:15px}#j34-forward-views .small{font-size:15px}#j34-forward-views svg{display:block;width:100%;max-width:760px;height:auto}#j34-forward-views :focus-visible{outline:3px solid var(--b);outline-offset:3px}#j34-forward-views [hidden]{display:none!important}';
  root.appendChild(style);
  const $ = id => root.querySelector('#fv-'+id);
  $('fields').innerHTML = names.map((name,i)=>`<fieldset><legend>我的${name}</legend><div class="fv-row"><label class="fv-wide">草稿轮廓<select id="fv-${i}-shape" aria-label="我的${name}轮廓">${option(shapes)}</select></label><label>横向跨度（cm）<input id="fv-${i}-w" aria-label="我的${name}横向跨度，cm" type="text" maxlength="12" autocomplete="off"></label><label>竖向跨度（cm）<input id="fv-${i}-h" aria-label="我的${name}竖向跨度，cm" type="text" maxlength="12" autocomplete="off"></label><label>我放的位置<select id="fv-${i}-place" aria-label="我的${name}摆位">${option(positions)}</select></label><label>我画的轮廓线<select id="fv-${i}-line" aria-label="我的${name}线型">${option({solid:'全部实线',dash:'全部虚线',mixed:'实虚混用'})}</select></label></div></fieldset>`).join('');
  let current=0, drawn=false;
  function clear() {
    drawn=false; $('draft').hidden=true; $('draft').replaceChildren();
    $('guide').hidden=true; $('guide').open=false; $('standard').replaceChildren(); $('why').textContent='';
    $('feedback').textContent='草稿尚未核对。先画，再填写并画出自己的草稿。'; delete $('feedback').dataset.result;
    root.querySelectorAll('[aria-invalid]').forEach(n=>n.removeAttribute('aria-invalid'));
  }
  function load() {current=Number($('task').value);$('form').reset();$('given').textContent=tasks[current].given;clear();}
  // Exact integer hundredths in the declared grammar, not parseFloat or tolerance.
  function measure(raw) {
    const s=raw.trim().replace(/^\+/, '');if(!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(s))return null;
    const parts=s.split('.'),n=Number(parts[0]||'0')*100+Number(((parts[1]||'')+'00').slice(0,2));
    return n>=50&&n<=2000?n:null;
  }
  function draft() {
    const rows=[];
    for(let i=0;i<3;i++){
      const shape=$(`${i}-shape`).value,w=measure($(`${i}-w`).value),h=measure($(`${i}-h`).value),place=$(`${i}-place`).value,line=$(`${i}-line`).value;
      if(!Object.hasOwn(shapes,shape)||w===null||h===null||!Object.hasOwn(positions,place)||!['solid','dash','mixed'].includes(line)){
        $('feedback').textContent='请先完成'+names[i]+'的五项草稿。跨度按明示格式填写0.5到20内的数。';
        if(w===null)$(`${i}-w`).setAttribute('aria-invalid','true');if(h===null)$(`${i}-h`).setAttribute('aria-invalid','true');return null;
      }
      rows.push({shape,w,h,place,line});
    }
    return rows;
  }
  function diagram(host,rows,label) {
    host.replaceChildren();
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 620 520');svg.setAttribute('role','img');svg.setAttribute('aria-label',label);host.appendChild(svg);
    function add(tag,attrs,text){const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text!==undefined)n.textContent=text;svg.appendChild(n);return n;}
    Object.entries(slots).forEach(([p,[x,y]])=>{add('rect',{x,y,width:280,height:230,rx:5,fill:'none',stroke:'var(--muted)','stroke-dasharray':'3 6'});add('text',{x:x+8,y:y+30,fill:'var(--muted)','font-size':36},positions[p]);});
    const scale=130/Math.max(...rows.flatMap(r=>[r.w/100,r.h/100]));
    rows.forEach((r,i)=>{
      const [sx,sy]=slots[r.place],w=r.w/100*scale,h=r.h/100*scale,x=sx+58,y=sy+180;
      const attrs={fill:'none',stroke:['var(--a)','var(--b)','var(--no)'][i],'stroke-width':3,'data-view':i,'data-shape':r.shape,'data-w':r.w,'data-h':r.h,'data-place':r.place,'data-line':r.line};
      if(r.line!=='solid')attrs['stroke-dasharray']=r.line==='dash'?'9 7':'20 5 3 5';
      if(r.shape==='rect')add('rect',{...attrs,x,y:y-h,width:w,height:h});
      else if(r.shape==='circle'||r.shape==='dot'){
        add('ellipse',{...attrs,cx:x+w/2,cy:y-h/2,rx:w/2,ry:h/2});
        if(r.shape==='dot')add('circle',{cx:x+w/2,cy:y-h/2,r:4,fill:attrs.stroke,'data-vertex':i});
      }else{
        const tx=r.shape==='left'?x:r.shape==='right'?x+w:x+w/2;
        add('path',{...attrs,d:`M${x} ${y} L${x+w} ${y} L${tx} ${y-h} Z`});
      }
      add('text',{x:sx+8,y:sy+222,fill:attrs.stroke,'font-size':36},names[i]+' '+r.w/100+'×'+r.h/100);
    });
  }
  $('draw').addEventListener('click',()=>{clear();const rows=draft();if(!rows)return;diagram($('draft'),rows,'按学生填写的草稿，未自动改正');$('draft').hidden=false;drawn=true;$('feedback').textContent='已按你的填写画草稿，同格会重叠；“圆”宽高不等时照填值呈椭圆。尚未核对。';});
  $('form').addEventListener('submit',e=>{
    e.preventDefault();delete $('feedback').dataset.result;
    if(!drawn){$('feedback').textContent='请先点“画出我的草稿”，查看自己的三图，再核对。';return;}
    const rows=draft();if(!rows)return;
    const t=tasks[current],messages=[];
    rows.forEach((r,i)=>{const a=t.answer[i];if(r.shape!==a[0])messages.push(names[i]+'轮廓还需检查');if(r.w!==a[1]*100||r.h!==a[2]*100)messages.push(names[i]+'跨度还需检查：半径、直径、高和前后宽不能混用');if(r.place!==['ul','ur','ll'][i])messages.push(names[i]+'摆位不符合规定');if(r.line!=='solid')messages.push(names[i]+'线型还需检查：只考虑本题可见轮廓及重合线');});
    if(rows[0].w!==rows[2].w)messages.push('主、俯的长未对正');if(rows[0].h!==rows[1].h)messages.push('主、左的高未平齐');if(rows[1].w!==rows[2].h)messages.push('左、俯的宽不相等');
    $('feedback').dataset.result=messages.length?'retry':'checked';$('feedback').textContent=messages.length?'草稿还需调整：'+messages.join('；')+'。原草稿保持，修改后重新画出再核。':'本有限任务的三图轮廓、尺寸、摆位与线型核对一致。还须按准则自查你的纸图；程序没有认证纸上作图发生。';
    $('why').textContent=t.why+' 三视图按规定主在左上、左在右上、俯在主的下方。本题没有独立被遮挡的轮廓需要虚线；圆心点只按题给的顶点投影添加。';
    diagram($('standard'),t.answer.map((a,i)=>({shape:a[0],w:a[1]*100,h:a[2]*100,place:['ul','ur','ll'][i],line:'solid'})),'本次尝试后的参考三视图');$('guide').hidden=false;
  });
  root.querySelectorAll('input,select').forEach(n=>{if(n.id!=='fv-task'){n.addEventListener('input',clear);n.addEventListener('change',clear);}});
  $('task').addEventListener('change',load);$('reset').addEventListener('click',load);load();
})();
