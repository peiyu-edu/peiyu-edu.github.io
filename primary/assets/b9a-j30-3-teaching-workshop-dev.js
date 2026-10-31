/* j30-3 only. No learning-record writes: constructions and drafts stay in memory. */
(function () {
  'use strict';
  const root = document.getElementById('b9a-workshop');
  if (!root || document.body.dataset.sec !== 'j30-3' || root.dataset.mounted) return;
  root.dataset.mounted = '1';
  const $ = id => root.querySelector('#b9a-' + id);
  const style = document.createElement('style');
  style.textContent = `#b9a-workshop {overflow-wrap:anywhere} #b9a-workshop label {display:block;margin-top:10px} #b9a-workshop input,#b9a-workshop select,#b9a-workshop textarea {font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--muted);border-radius:6px;padding:8px;max-width:100%;box-sizing:border-box} #b9a-workshop textarea {width:100%} #b9a-workshop button {font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--muted);border-radius:6px;padding:8px 12px;min-height:44px;margin:5px 5px 5px 0;cursor:pointer} #b9a-workshop button:focus-visible,#b9a-workshop input:focus-visible,#b9a-workshop select:focus-visible,#b9a-workshop textarea:focus-visible {outline:3px solid var(--fg);outline-offset:2px} #b9a-workshop .b9a-row {display:flex;flex-wrap:wrap;gap:8px;align-items:end} #b9a-workshop svg {display:block;width:100%;max-width:520px;height:auto;margin:10px auto} #b9a-workshop .b9a-note {min-height:2em} #b9a-workshop table {border-collapse:collapse;width:100%;font-size:14px} #b9a-workshop td,#b9a-workshop th {border:1px solid var(--line);padding:6px;text-align:left} #b9a-workshop .b9a-scroll {overflow:auto} #b9a-workshop .b9a-numeric {width:100px} #b9a-workshop .b9a-status {min-height:1.6em}`;
  root.prepend(style);
  const input = (id, label) => `<label for="b9a-${id}">${label}<input id="b9a-${id}" inputmode="decimal" autocomplete="off" class="b9a-numeric"></label>`;
  const select = (id, label, options) => `<label for="b9a-${id}">${label}<select id="b9a-${id}">${options.map(([v,t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
  const button = (id, text) => `<button type="button" id="b9a-${id}">${text}</button>`;
  const note = id => `<p id="b9a-${id}" class="b9a-note" role="status"></p>`;
  const on = (id, action) => $(id).addEventListener('click', action);
  // Deliberately closed grammar: ASCII nonnegative decimals, at most six places.
  // Only outer spaces are trimmed; no NFKC, token joining, exponent or expression evaluation.
  function decimal(raw) {
    const s = raw.trim();
    if (!/^(?:0|[1-9][0-9]{0,5})(?:\.[0-9]{1,6})?$/.test(s)) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const grammar = '数值只收半角非负整数或小数（至多六位小数），不用单位、算式或科学记数法；内部不能加空格。';
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const O = {x:0,y:0}, A = {x:0,y:-1};
  const xy = p => `${(200+85*p.x).toFixed(3)},${(150+85*p.y).toFixed(3)}`;
  function line(a,b,color='var(--fg)') {
    const [x1,y1]=xy(a).split(','), [x2,y2]=xy(b).split(',');
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5"/>`;
  }
  function dot(p,label) {
    const [x,y]=xy(p).split(',').map(Number);
    return `<circle cx="${x}" cy="${y}" r="3" fill="var(--fg)"/><text x="${x+7}" y="${y-7}" font-size="14" fill="var(--fg)">${label}</text>`;
  }
  const circle = '<circle cx="200" cy="150" r="85" fill="none" stroke="var(--muted)" stroke-width="1.5"/>';
  function picture(id, content, label) {
    $(id).innerHTML=`<svg viewBox="0 0 400 300" role="img" aria-label="${label}">${content}</svg>`;
  }
  function arc(c,p,q) {
    const angle=Math.atan2(p.y-c.y,p.x-c.x), pts=[];
    for(let k=-4;k<=4;k++) {
      const t=angle+k*0.025; pts.push(xy({x:c.x+q*Math.cos(t),y:c.y+q*Math.sin(t)}));
    }
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--fg)" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  }
  function order(raw) {
    const s=raw.trim();
    return /^[A-F](?:[ ,]+[A-F])*$/.test(s) ? s.split(/[ ,]+/) : null;
  }
  function regular(points) {
    const n=points.length;
    if(n<3 || new Set(points.map(p=>xy(p))).size!==n) return false;
    // Equal positive circular gaps in either direction also reject star/crossed orderings.
    return [1,-1].some(direction=>points.every((p,i)=>{
      const q=points[(i+1)%n];
      const gap=((direction*(Math.atan2(q.y,q.x)-Math.atan2(p.y,p.x)))%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
      return Math.abs(gap-2*Math.PI/n)<0.008;
    }));
  }

  $('construct').innerHTML=select('mode','本次作品',[['6','正六边形'],['3','正三角形'],['4','正方形']])+`<p>${grammar} 顶点次序只收 A–F，用半角空格或逗号分隔，不重复写起点。</p><div id="b9a-con-board"></div><div id="b9a-tools"></div>`+input('order','依次连接的顶点（按你的构图填写）')+button('join','依次连边并核对')+button('con-reset','重画本件作品')+note('con-note');
  $('order').inputMode='text';$('order').style.width='100%';
  let mode=6, pts, candidates, compassCenter, compassQ, traces, closed, polygon, squareReady, uv, squareLine;
  function conReset() {
    pts={A}; candidates=[]; compassCenter=null; polygon=[]; traces=[]; closed=false; squareReady=false; uv=null; squareLine=null;
    $('order').value=''; $('con-note').textContent=''; renderTools(); drawCon();
  }
  function renderTools() {
    if(mode===4) {
      $('tools').innerHTML=button('diameter','过 A、O 作直径')+input('square-q','两组等半径交弧的开口（cm；画板限大于 5、小于等于 9）')+button('square-arcs','以 A、D 为圆心各画交弧')+select('from','直尺端点一',[['','请选择'],...['O',...Object.keys(pts),...(uv?['U','V']:[])].map(v=>[v,v])])+select('to','直尺端点二',[['','请选择'],...['O',...Object.keys(pts),...(uv?['U','V']:[])].map(v=>[v,v])])+button('square-line','连接两点并延长');
      on('diameter',()=>{pts={A,D:{x:0,y:1}};uv=null;squareLine=null;squareReady=false;polygon=[]; $('con-note').textContent='直径已画。接着用等半径交弧作它的垂直平分线。'; renderTools(); drawCon();});
      on('square-arcs',()=>{
        const q=decimal($('square-q').value);
        polygon=[]; squareReady=false; delete pts.B; delete pts.C; squareLine=null;
        if(!pts.D || q===null || q<=5 || q>9) {uv=null; renderTools(); $('con-note').textContent='先作直径；交弧开口须大于 5 cm、小于等于 9 cm。等于 5 时两弧相切，不能确定垂直平分线。'; drawCon(); return;}
        uv=[{x:Math.sqrt((q/5)**2-1),y:0},{x:-Math.sqrt((q/5)**2-1),y:0}];
        compassQ=q/5; $('con-note').textContent='两侧交点为 U、V。选择直尺的两个端点。';renderTools();drawCon();
      });
      on('square-line',()=>{
        const f=$('from').value,t=$('to').value, all={O,...pts,...(uv?{U:uv[0],V:uv[1]}:{})};
        polygon=[];
        if(!f||!t||f===t) {$('con-note').textContent='请选择两个不同的已作点。';return;}
        squareLine=[all[f],all[t]];
        squareReady=!!uv && ((f==='U'&&t==='V')||(f==='V'&&t==='U'));
        if(squareReady) {pts.B={x:1,y:0};pts.C={x:-1,y:0};$('con-note').textContent='直线交原圆得到 B、C。请自己填写圆周上的连边次序。';}
        else {delete pts.B;delete pts.C;$('con-note').textContent='这条线尚未由两组交弧确定为 AD 的垂直平分线。重新选择端点。';}
        renderTools();drawCon();
      });
    } else {
      $('tools').innerHTML=select('center','本次圆心',[['','请选择'],...Object.keys(pts).map(v=>[v,v])])+input('opening','本次圆规开口（cm）')+button('compass','画弧')+`<div id="b9a-candidates"></div>`;
      on('compass',()=>{
        const c=$('center').value,q=decimal($('opening').value);
        polygon=[];candidates=[];$('candidates').innerHTML='';
                if(!c || c!==Object.keys(pts).at(-1)) {$('con-note').textContent='从上一次新取的点继续截弦，避免回走。第一次从 A 开始。';drawCon();return;}
        if(q===null || q<=0 || q>=10) {$('con-note').textContent='开口须大于 0、小于直径 10 cm。零开口或直径开口不能产生两个不同交点。';drawCon();return;}
        closed=false;compassCenter=pts[c];compassQ=q/5;
        const t=1-compassQ**2/2,s=Math.sqrt(1-t*t),p=compassCenter;
        candidates=[{x:t*p.x-s*p.y,y:t*p.y+s*p.x},{x:t*p.x+s*p.y,y:t*p.y-s*p.x}];
        $('con-note').textContent='弧与圆的交点标为 X、Y。选择沿同一方向前进的新点；注意检查开口是否仍为给定半径。';
        $('candidates').innerHTML=button('take-x','取交点 X')+button('take-y','取交点 Y');
        ['take-x','take-y'].forEach((id,k)=>on(id,()=>{
          const p=candidates[k];
          if(Object.keys(pts).length===6) {
            if(dist(p,A)<0.005) {closed=true;traces.push({c:compassCenter,p,q:compassQ});candidates=[];$('con-note').textContent='第六次截弧在画板精度内回到 A，闭合痕迹已保留。现在决定连边次序。';renderTools();drawCon();}
            else {$('con-note').textContent='第六次应回到起点，而非取第七个点或回走。检查开口和累积误差后重试。';}
            return;
          }
          if(Object.values(pts).some(v=>dist(v,p)<0.005)) {$('con-note').textContent='这个交点与已有点重合或过近。请选择另一个交点，或重新画弧。';return;}
          traces.push({c:compassCenter,p,q:compassQ});
          pts[String.fromCharCode(65+Object.keys(pts).length)]=p;
          candidates=[];polygon=[];$('con-note').textContent='已取新点。继续保持开口截弦；取满六点后检查闭合与连边。'; renderTools();drawCon();
        }));
        drawCon();
      });
    }
    $('tools').querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>{candidates=[];polygon=[];const pending=$('candidates');if(pending) pending.innerHTML='';$('con-note').textContent='参数已编辑；请重新执行作图操作。';drawCon();}));
  }
  function drawCon() {
    let h=circle+dot(O,'O');
    traces.forEach(v=>{h+=arc(v.c,v.p,v.q);});
    if(pts.D && mode===4) h+=line(A,pts.D);
    if(uv && mode===4) for(const c of [A,pts.D]) for(const p of uv) h+=arc(c,p,compassQ);
    if(squareLine) h+=line(...squareLine);
    if(squareReady) h+=line({x:-1.3,y:0},{x:1.3,y:0});
    if(compassCenter && mode!==4) for(const p of candidates) h+=arc(compassCenter,p,compassQ);
    candidates.forEach((p,i)=>{h+=dot(p,i?'Y':'X');});
    if(uv) uv.forEach((p,i)=>{h+=dot(p,i?'V':'U');});
    Object.entries(pts).forEach(([label,p])=>{h+=dot(p,label);});
    polygon.forEach((p,i)=>{h+=line(p,polygon[(i+1)%polygon.length]);});
    picture('con-board',h,'你的尺规作图过程');
  }
  on('join',()=>{
    polygon=[]; const labels=order($('order').value);
    if(!labels || labels.length!==mode || new Set(labels).size!==mode || labels.some(v=>!pts[v])) {$('con-note').textContent='填写本件作品所需个数的不同已作顶点，用半角空格或逗号分隔。';drawCon();return;}
    if((mode===4&&!squareReady)||(mode!==4&&(Object.keys(pts).length!==6||!closed))) {$('con-note').textContent='请先完成垂直直径或六次等半径截弦的构图。';drawCon();return;}
    polygon=labels.map(v=>pts[v]);drawCon();
    const lengths=polygon.map((p,i)=>5*dist(p,polygon[(i+1)%mode]));
    const spread=Math.max(...lengths)-Math.min(...lengths);
    const closing=mode===4?null:Math.abs(5*dist(pts.F,A)-5);
    const valid=regular(polygon) && (mode===4||regular(Object.values(pts))) && (closing===null||closing<=0.04) && spread<=0.04;
    $('con-note').textContent=(valid?'画板数值符合本件等分构图（容差 0.04 cm）；':'当前连线未满足本件等分构图；检查开口、方向与次序。')+` 边长极差约 ${spread.toFixed(4)} cm。`+(closing===null?'':` 末弦 FA 与半径的差约 ${closing.toFixed(4)} cm。`)+(valid?'请在纸上独立重画，并用等弧、等弦与角的性质说明各边各角相等；数值符合不代替证明。':'');
  });
  $('order').addEventListener('input',()=>{polygon=[];$('con-note').textContent='次序已编辑，旧核对失效。';drawCon();});
  $('mode').addEventListener('change',()=>{mode=Number($('mode').value);conReset();});
  on('con-reset',conReset);

  $('auxiliary').innerHTML=select('aux-n','给定正多边形',[['6','六边形'],['3','三角形'],['4','四边形'],['8','八边形（只作图和推理）']])+button('rotate','换一幅方向不同的图')+`<div id="b9a-aux-board"></div><p>H 的位置按从 A 到 B 的全长百分比输入，0% 在 A，100% 在 B；你也可先在纸上作垂线再估计填写。此数只用于放点，不代替作图依据；位置比较的容差为 0.01 个百分点。</p>`+input('foot','H 的位置（%）')+button('place','放置 H')+select('aux-from','画线端点一',[['','请选择'],...['O','A','B','H'].map(v=>[v,v])])+select('aux-to','画线端点二',[['','请选择'],...['O','A','B','H'].map(v=>[v,v])])+button('aux-line','画这条线段')+button('aux-check','检查画板中的三角形')+button('aux-reset','清除本幅辅助线')+note('aux-note');
  let auxN=6,rotation=0,foot=null,edges=new Set();
  function auxPoints() {
    return Array.from({length:auxN},(_,i)=>({x:Math.cos(rotation+i*2*Math.PI/auxN),y:Math.sin(rotation+i*2*Math.PI/auxN)}));
  }
  function auxReset() {foot=null;edges.clear();$('foot').value='';$('aux-from').value='';$('aux-to').value='';$('aux-note').textContent='';$('reason-note').textContent='';drawAux();}
  function drawAux() {
    const p=auxPoints(),all={O,A:p[0],B:p[1]};
    if(foot!==null) all.H={x:p[0].x+(p[1].x-p[0].x)*foot,y:p[0].y+(p[1].y-p[0].y)*foot};
    let h=circle+`<polygon points="${p.map(xy).join(' ')}" fill="none" stroke="var(--muted)" stroke-width="2"/>`;
    edges.forEach(key=>{const [a,b]=key.split('');h+=line(all[a],all[b]);});
    Object.entries(all).forEach(([name,point])=>{h+=dot(point,name);});picture('aux-board',h,'给定正多边形与自己所画辅助线');
  }
  on('place',()=>{
    const f=decimal($('foot').value);edges.clear();
    if(f===null||f<0||f>100) {foot=null;$('aux-note').textContent='请输入 0 到 100 的位置。'+grammar;}
    else {foot=f/100;$('aux-note').textContent='H 已放置。自己选择端点画线，并判断是否得到所需直角三角形。';}
    $('reason-note').textContent='';drawAux();
  });
  on('aux-line',()=>{
    const a=$('aux-from').value,b=$('aux-to').value;
    if(!a||!b||a===b||(foot===null&&(a==='H'||b==='H'))) {$('aux-note').textContent='选择两个不同的已存在点；需要 H 时先放置 H。';return;}
    edges.add([a,b].sort().join(''));$('aux-note').textContent='线段已画；可继续添线，再检查。';drawAux();
  });
  on('aux-check',()=>{
    const first=['AO','HO','AH'].every(k=>edges.has(k)),second=['BO','HO','BH'].every(k=>edges.has(k));
    if(foot===null||Math.abs(foot-0.5)>0.0001) {$('aux-note').textContent='目前 H 位置未得到垂直于 AB 的 OH；端点处还会退化。回到纸图检查垂足，不要仅凭图看起来像直角。';return;}
    if(!first&&!second) {$('aux-note').textContent='还没有用自己所画的线围出所需三角形。检查半径、边心距和半弦是否都已画出。';return;}
    const p=auxPoints(),r=dist(O,{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}),half=dist(p[0],p[1])/2;
    $('aux-note').textContent=`画板中已围出所需直角三角形，归一化长度约 R=1，OH=${r.toFixed(4)}，半弦=${half.toFixed(4)}；平方和约 ${(r*r+half*half).toFixed(4)}。这是有限精度检查；请另写垂直、半弦及勾股依据。`;
  });
  $('foot').addEventListener('input',()=>{foot=null;edges.clear();$('aux-note').textContent='位置已编辑，旧图和核对已清除；重新放点。';$('reason-note').textContent='';drawAux();});
  ['aux-from','aux-to'].forEach(id=>$(id).addEventListener('input',()=>{$('aux-note').textContent='端点已编辑，画线后重新检查。';}));
  $('aux-n').addEventListener('change',()=>{auxN=Number($('aux-n').value);auxReset();});
  on('rotate',()=>{rotation+=0.73;auxReset();});on('aux-reset',auxReset);

  $('doubling').innerHTML=select('start','同半径比较路线',[['3','从三边形开始'],['4','从四边形开始']])+`<p>R 始终为 1，长度用同一单位，面积用其平方单位。按 P = na、S = Pr/2 计算，填到小数点后三位（允许绝对误差 0.002）。显示数据保留六位小数，只用来近似观察。${grammar}</p><div id="b9a-double-board"></div><div class="b9a-scroll"><table><thead><tr><th>边数与测算数据</th><th>自己计算</th><th>核对</th></tr></thead><tbody id="b9a-rows"></tbody></table></div>`+button('double','角平分，加倍边数')+button('double-reset','重做本路线')+select('trend','对已核对各行的观察',[['','先选择你的观察'],['both','周长、面积均增大，且仍小于圆的近似值'],['same','两者不变'],['equal','已经等于圆']])+button('compare','检查有限表格中的比较')+note('double-note');
  let rows=[];
  function startRows() {
    const n=Number($('start').value);
    rows=[n===3?{n:3,a:Math.sqrt(3),r:0.5}:{n:4,a:Math.sqrt(2),r:Math.SQRT1_2}];
    $('trend').value='';$('double-note').textContent='';$('history-note').textContent='';renderRows();
  }
  function renderRows() {
    $('rows').innerHTML=rows.map((v,i)=>`<tr><td>n=${v.n}<br>a≈${v.a.toFixed(6)}<br>r≈${v.r.toFixed(6)}</td><td>${input('p-'+i,`第 ${i+1} 行周长`)}${input('s-'+i,`第 ${i+1} 行面积`)}</td><td>${button('row-'+i,'核对本行')}<p id="b9a-row-note-${i}" class="b9a-status" role="status"></p></td></tr>`).join('');
    rows.forEach((v,i)=>{
      $('p-'+i).value=v.pRaw||'';$('s-'+i).value=v.sRaw||'';
      const invalidate=()=>{v.pRaw=$('p-'+i).value;v.sRaw=$('s-'+i).value;v.ok=false;$('row-note-'+i).textContent='已编辑，请重新核对。';$('double-note').textContent='表格已编辑，旧比较失效。';$('history-note').textContent='';};
      $('p-'+i).addEventListener('input',invalidate);$('s-'+i).addEventListener('input',invalidate);
      on('row-'+i,()=>{
        const p=decimal($('p-'+i).value),s=decimal($('s-'+i).value),P=v.n*v.a,S=P*v.r/2;
        v.ok=p!==null&&s!==null&&Math.abs(p-P)<=0.002+1e-12&&Math.abs(s-S)<=0.002+1e-12;
        $('row-note-'+i).textContent=v.ok?'本行近似计算符合。':`尚未符合；检查乘边数、面积的一半和精度。${grammar}`;
        $('double-note').textContent='';
      });
      $('row-note-'+i).textContent=v.ok?'本行近似计算符合。':'';
    });
    const v=rows.at(-1),vertices=Array.from({length:v.n},(_,i)=>({x:Math.cos(i*2*Math.PI/v.n),y:Math.sin(i*2*Math.PI/v.n)}));
    picture('double-board',circle+`<polygon points="${vertices.map(xy).join(' ')}" fill="none" stroke="var(--fg)" stroke-width="2"/>`+dot(O,'O'),'同半径边数倍增的当前内接正多边形');
  }
  on('double',()=>{
    if(rows.length>=4) {$('double-note').textContent='本活动只比较这四行。有限数值表不是对无限过程的证明。';return;}
    const v=rows.at(-1),a=Math.hypot(v.a/2,1-v.r),r=Math.sqrt(1-(a/2)**2);
    rows.push({n:v.n*2,a,r});$('double-note').textContent='新增一行，圆的半径保持为 1；请计算后比较。';$('history-note').textContent='';renderRows();
  });
  on('compare',()=>{
    if(rows.length<3||rows.some(v=>!v.ok)) {$('double-note').textContent='先完成至少三行并逐行核对；空白和未核对数据不能作为比较依据。';return;}
    if($('trend').value!=='both') {$('double-note').textContent='再比较相邻两行，并和圆周长约 6.283185、圆面积约 3.141593 对照。不能把“接近”说成“已经相等”。';return;}
    $('double-note').textContent='所列有限行符合这一观察。圆周长约 6.283185，圆面积约 3.141593；相应差距逐行缩小。保持相同半径才能这样比较；这几行不是一般极限结论的证明。';
  });
  $('trend').addEventListener('change',()=>{$('double-note').textContent='观察已修改，请重新检查。';});
  $('start').addEventListener('change',startRows);on('double-reset',startRows);
  const rubrics={
    paper:'只供本人或同伴自核，不自动判真：核对三件纸上作品的截弧/垂直直径痕迹、绕行次序、各边各角的理由；记录边长极差和闭合偏差及重画后的变化。没有纸上产物时，不能仅凭画板称为完成尺规作图。',
    reason:'只供推理自核，不自动判真：连接中心与顶点得到半径；过 O 作 OH⊥AB，H 是垂足。由垂径定理得 AH=HB；也可用 OA=OB 与等腰三角形三线合一说明。故直角在 H，OA 是斜边，OH 是边心距，AH 是半弦，勾股得 OA²=OH²+AH²。任意正多边形的这条辅助线思路相同；八边形这里不要求用三角函数求精确边长。',
    history:'只供观察记录自核，不自动判真：是否始终同半径？是否用勾股和分割三角形算出各行？是否比较周长、面积及与圆的差距？有限倍边数据支持越来越接近的观察，不等于证明所有边数，更不能把多边形直接当圆。'
  };
  Object.entries(rubrics).forEach(([id,text])=>{
    on(id+'-check',()=>{$(id+'-note').textContent=text;});
    $(id).addEventListener('input',()=>{$(id+'-note').textContent='草稿已编辑，自核说明已清除；请按新作品重新自核。';});
  });
  on('reset',()=>{
    $('mode').value='6';mode=6;conReset();$('aux-n').value='6';auxN=6;rotation=0;auxReset();$('start').value='3';startRows();
    ['paper','reason','history'].forEach(id=>{$(id).value='';$(id+'-note').textContent='';});
  });
  conReset();auxReset();startRows();
})();
