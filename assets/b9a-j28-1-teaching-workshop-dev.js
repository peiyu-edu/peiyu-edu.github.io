/* Page-local rotation workshop. No learning-record writes or automatic paper-work grading. */
(() => {
  'use strict';
  function mount() {
    const root = document.getElementById('j28-workshop');
    if (document.body.dataset.sec !== 'j28-1' || !root || root.dataset.mounted) return;
    root.dataset.mounted = 'true';
    const options = (values) => '<option value="">请选择</option>' + values.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
    const select = (id, label, values) => `<label>${label}<select id="jw-${id}">${options(values)}</select></label>`;
    const field = (id, label) => `<label>${label}<input id="jw-${id}" type="text" inputmode="decimal" autocomplete="off"></label>`;
    const note = id => `<p id="jw-${id}" class="jw-feedback" aria-live="polite"></p>`;
    root.innerHTML = `<style>
#j28-workshop { margin:20px 0; color:var(--fg); }
#j28-workshop .jw-panel { border:1px solid var(--line); border-radius:12px; padding:14px; margin:16px 0; background:var(--card); }
#j28-workshop .jw-row { display:flex; flex-wrap:wrap; gap:10px; margin:10px 0; align-items:end; }
#j28-workshop label { display:flex; flex-direction:column; gap:5px; max-width:100%; }
#j28-workshop input, #j28-workshop select, #j28-workshop textarea, #j28-workshop button { font:inherit; color:var(--fg); background:var(--bg); border:1px solid var(--muted); border-radius:5px; padding:8px; max-width:100%; box-sizing:border-box; }
#j28-workshop input { width:112px; } #j28-workshop textarea { width:100%; min-height:90px; }
#j28-workshop button { cursor:pointer; min-height:44px; }
#j28-workshop svg { width:100%; max-width:480px; display:block; background:var(--bg); touch-action:manipulation; }
#j28-workshop .jw-feedback { min-height:2em; overflow-wrap:anywhere; }
#j28-workshop .jw-record { display:grid; grid-template-columns:repeat(auto-fit,minmax(125px,1fr)); gap:10px; }
#j28-workshop .jw-gridline { stroke:var(--muted); opacity:.35; } #j28-workshop svg text { fill:var(--fg); font-size:12px; }
#j28-workshop :focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
</style>
<h3>旋转工作坊：我来作图、找中心和证明</h3>
<p>本工作坊不写入学习记录。新任务均留白；离页前可下载自己的记录。图上每格为1，横向向右、纵向向上。</p>
<div class="jw-panel" id="jw-drawing"><h4>一、逐顶点作图，再连边设计</h4>
<p>以 O(0,0) 为中心。先选任务、方向与转角；选 A′、B′、C′ 后在网格点按，或输入坐标并按“落点”。最后分别添加三条边，不能只交三个点。想象直角转动，用数格和垂直、等距关系定位，无需三角函数。</p>
<div class="jw-row">${select('mode','任务',[['given','给定三角形'],['design','自制三角形图案']])}${select('direction','方向',[['ccw','逆时针'],['cw','顺时针']])}${select('turn','转角',[['0','0°'],['90','90°'],['180','180°'],['270','270°'],['360','360°']])}</div>
<p id="jw-given">给定 A(1,1)、B(3,1)、C(1,2)。自制时先逐一放置原顶点，再放对应点；原顶点限整数网格且不共线。</p>
<div class="jw-row">${select('vertex','本次定位',[['A','原点A（自制）'],['B','原点B（自制）'],['C','原点C（自制）'],['Ap','A′'],['Bp','B′'],['Cp','C′']])}${field('x','横坐标x')}${field('y','纵坐标y')}<button type="button" id="jw-place">落点</button></div>
<svg id="jw-grid" viewBox="0 0 400 400" role="img" aria-label="学生旋转作图网格，支持点按或上方坐标输入"></svg>
<div class="jw-row">${select('edge','逐条连边',[['ApBp','A′B′'],['BpCp','B′C′'],['CpAp','C′A′']])}<button type="button" id="jw-connect">添加这条边</button><button type="button" id="jw-undo-edge">撤销末边</button><button type="button" id="jw-check-drawing">核对本次构图</button><button type="button" id="jw-clear-drawing">清空本次图</button></div>
${note('drawing-result')}
<label>设计说明（自核）：描述中心、方向、转角、原图与新图如何组成图案；若要更多花瓣，换角度后继续手工作图并在纸上组合。<textarea id="jw-design-note"></textarea></label>
<button type="button" id="jw-design-review">查看设计自核准则</button>${note('design-result')}
</div>
<div class="jw-panel" id="jw-centre"><h4>二、自己画中垂线，定位中心</h4>
<p>已知点的对应关系，先连接 A 与 A′、B 与 B′，用尺规思想找中点并作垂线。对每一条中垂线，在网格任选两个不同整点定义直线（延长整条线）。最后选“候选中心”落一点。坐标输入也可操作本图。</p>
<div class="jw-row">${select('case','数据组',[['unique','两组对应点'],['same','重合线反例'],['parallel','平行线反例'],['identity','原点与像点重合']])}${select('tool','本次操作',[['l1','AA′的中垂线两点'],['l2','BB′的中垂线两点'],['centre','候选中心一点']])}${field('cx','本图横坐标')}${field('cy','本图纵坐标')}<button type="button" id="jw-centre-place">在本图落点</button></div>
<p id="jw-case-data"></p><svg id="jw-centre-grid" viewBox="0 0 400 400" role="img" aria-label="对应点与学生所作中垂线网格"></svg>
<div class="jw-row">${select('conclusion','由这两组数据能否定位',[['unique','两条中垂线唯一相交，可检验候选中心'],['same','中垂线重合，此法暂不能定位'],['parallel','中垂线平行，没有共同中心'],['identity','0°或整周，不能唯一确定中心']])}<button type="button" id="jw-check-centre">核对线与结论</button><button type="button" id="jw-clear-centre">清空所作线</button></div>${note('centre-result')}
<p>边界：已知非整周的旋转及明确对应关系时，旋转中心唯一；单凭一个无标号图案的重合不能这样认定。0°或整周的恒等旋转可绕任意点完成。两组非重合对应点的中垂线必须唯一相交才能用此法定位；重合线并非两个独立条件，平行线不能冒认已找到中心。得到交点后还应核对方向和转角一致。中心固定，OO 不是射线；非中心点转270°的普通夹角是90°，不能把普通角当成转过的度数。</p>
</div>
<div class="jw-panel" id="jw-proof"><h4>三、组织一条全等证明</h4>
<p>非退化 △OBC 绕 O 逆时针转90°，B 的像为 D，C 的像为 E。证明 BC=DE。请自己组织对应顺序、两边与夹角，再选判定；这里用一般旋转性质推理，不靠测量某一个三角形签一般证明。</p>
<div class="jw-row">${select('mapping','△OBC 对应的有序三角形',[['ODE','△ODE'],['OED','△OED'],['DOE','△DOE']])}${select('side1','第一组边与依据',[['rotation','OB=OD，旋转保距'],['wrong','OB=OE，旋转保距']])}${select('side2','第二组边与依据',[['rotation','OC=OE，旋转保距'],['wrong','OC=OD，旋转保距']])}${select('angle','两边夹角与依据',[['rotation','∠BOC=∠DOE，旋转保持对应角'],['turn','∠BOC=90°，因为转90°']])}${select('criterion','全等判定',[['SAS','SAS'],['SSA','SSA'],['AAA','AAA']])}${select('finish','最后一步',[['corresponding','全等三角形对应边相等，BC=DE'],['length','图上看起来一样长，BC=DE']])}</div>
<button type="button" id="jw-check-proof">检查推理链</button>${note('proof-result')}
<label>自己重写证明或提出另一证法（自由文字仅供自核）<textarea id="jw-proof-note"></textarea></label>
</div>
<div class="jw-panel" id="jw-measure"><h4>四、透明纸实量：把发现记下来</h4>
<p>材料：白纸、透明纸、铅笔、直尺、圆规、量角器、图钉或可固定的笔尖（安全使用）。本表不预填软件数值。</p>
<ol><li>纸上画不共线的 A、B、C 和中心 O，先描到透明纸上并标出对应字母；至少 A、B 不与 O 重合。</li><li>用尺量 OA、OB、AB，用量角器量 ∠ABC，记录原始读数、单位和估计误差。</li><li>固定 O，把透明纸逆时针转60°，描出 A′、B′、C′。不要拉伸或移动固定点。量 OA′、OB′、A′B′、∠A′B′C′，再量普通角 ∠AOA′、∠BOB′。</li><li>另做一次顺时针240°：分步记录转过的度数，再量始末连线普通夹角。它不会记录方向与整周。若点就在 O 上，填“角无定义”，不要硬量。</li><li>比较差值与误差；用圆规比较两条半径。实量只支持猜想，回到性质/全等说明理由，不能从几次相近读数证明普遍结论。</li></ol>
<div class="jw-record">${['OA/cm','OA′/cm','OB/cm','OB′/cm','AB/cm','A′B′/cm','∠ABC/度','∠A′B′C′/度','60°试验∠AOA′/度','60°试验∠BOB′/度','240°过程记录/度','240°普通夹角/度','长度估计误差/cm','角度估计误差/度'].map((t,i)=>field('measure-'+i,t)).join('')}</div>
<label>观察、差值、误差来源与再次测量方案<textarea id="jw-measure-note"></textarea></label>
<button type="button" id="jw-measure-review">查看实量自核准则</button>${note('measure-result')}
</div>
<div class="jw-row"><button type="button" id="jw-download">下载我的工作记录 TXT</button><button type="button" id="jw-reset">重置整个工作坊</button></div>${note('global-result')}`;
    const $ = id => root.querySelector('#jw-' + id);
    const say = (id, text) => { $(id).textContent = text; };
    // Closed grammar: only ASCII signed integers -4..4. No NFKC or whitespace deletion.
    const parse = text => /^[+-]?(?:0|[1-4])$/.test(text) ? Number(text) : null;
    let original, image, edges, lines, centre;
    const defaultOriginal = () => ({ A:[1,1], B:[3,1], C:[1,2] });
    const sets = {
      unique: [[2,0],[0,2],[0,3],[-3,0]],
      same: [[2,0],[0,2],[4,0],[0,4]],
      parallel: [[0,0],[2,0],[0,2],[4,2]],
      identity: [[1,1],[1,1],[3,1],[3,1]],
    };
    const equal = (a,b) => a && b && a[0] === b[0] && a[1] === b[1];
    function rotate(p, degrees, direction) {
      const steps = ((Number(degrees) / 90 * (direction === 'cw' ? -1 : 1)) % 4 + 4) % 4;
      let [x,y] = p;
      for (let i=0; i<steps; i++) [x,y] = [-y,x];
      return [x,y];
    }
    const pixel = ([x,y]) => [200+40*x,200-40*y];
    function segment(a,b,color='var(--accent)', dashed=false) {
      const p=pixel(a), q=pixel(b);
      return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${color}" stroke-width="2" ${dashed?'stroke-dasharray="4 4"':''}/>`;
    }
    function point(p,label,color='var(--fg)') {
      const [x,y]=pixel(p);
      return `<circle cx="${x}" cy="${y}" r="4" fill="${color}"/><text x="${x+6}" y="${y-7}">${label}</text>`;
    }
    function grid() {
      let h='';
      for(let k=-4;k<=4;k++) {
        const n=200+40*k;
        h+=`<path d="M${n} 40V360 M40 ${n}H360" class="jw-gridline" fill="none"/>`;
        h+=`<text x="${n-5}" y="385">${k}</text><text x="12" y="${400-n+4}">${k}</text>`;
      }
      return h+segment([-4,0],[4,0],'var(--muted)')+segment([0,-4],[0,4],'var(--muted)');
    }
    function draw() {
      let h=grid()+point([0,0],'O');
      ['AB','BC','CA'].forEach(pair => { if(original[pair[0]] && original[pair[1]]) h+=segment(original[pair[0]],original[pair[1]],'var(--muted)'); });
      Object.entries(original).forEach(([name,p])=>h+=point(p,name));
      edges.forEach(e=>h+=segment(image[e.slice(0,2)],image[e.slice(2)]));
      Object.entries(image).forEach(([name,p])=>h+=point(p,name.replace('p','′'),'var(--accent)'));
      $('grid').innerHTML=h;
    }
    function clearDrawing() {
      original=$('mode').value==='design'?{}:defaultOriginal(); image={}; edges=[];
      say('drawing-result',''); say('design-result',''); draw();
    }
    function put(p) {
      const name=$('vertex').value;
      if(!$('mode').value || !name) return say('drawing-result','先选择任务和本次定位的顶点。');
      if(name.length===1 && $('mode').value!=='design') return say('drawing-result','给定任务的原顶点不可移动；请定位对应点。');
      if(name.length===1) { original[name]=p; image={}; edges=[]; }
      else { image[name]=p; edges=edges.filter(e=>!e.includes(name)); }
      say('drawing-result','已记录落点，尚未核对。修改顶点会清除关联边，请重新连接。'); say('design-result',''); draw();
    }
    const area = ps => (ps.B[0]-ps.A[0])*(ps.C[1]-ps.A[1])-(ps.B[1]-ps.A[1])*(ps.C[0]-ps.A[0]);
    function checkDrawing() {
      if(!['mode','turn','direction'].every(id=>$(id).value!=='')) return say('drawing-result','请先选任务、方向和转角。');
      if(!['A','B','C'].every(k=>original[k])) return say('drawing-result','先逐一放置三个原顶点。');
      if(area(original)===0) return say('drawing-result','原顶点重合或共线，不能组成三角形；请重新设计。');
      for(const k of ['A','B','C']) {
        const p=image[k+'p'];
        if(!p) return say('drawing-result',`还缺 ${k}′，请逐顶点作图。`);
        if(!equal(p,rotate(original[k],$('turn').value,$('direction').value))) {
          const opposite=rotate(original[k],$('turn').value,$('direction').value==='cw'?'ccw':'cw');
          return say('drawing-result',equal(p,opposite)?`${k}′ 落在反方向的位置。请先沿指定方向转，再检查距离。`:`${k}′ 位置不符。检查到O的距离与指定方向、转角；不要只交换坐标。`);
        }
      }
      if(edges.length!==3) return say('drawing-result','对应点位置符合要求，还要逐条连齐三边。');
      const angle=Number($('turn').value);
      say('drawing-result',`本次三个顶点与三边符合指定旋转。${angle===0||angle===360?'始末图形重合；0°与整周的过程不同，中心无法由始末位置唯一推定。':'这是当前构图核对，不代替一般性质的证明。'}`);
    }
    function readXY(x,y,result,action) {
      const a=parse($(x).value), b=parse($(y).value);
      if(a===null || b===null) return say(result,'坐标只收 -4 到 4 的半角整数字符（可带+或-）；不收小数、指数、空白、全角或表达式。');
      action([a,b]);
    }
    function gridClick(event,action) {
      const r=event.currentTarget.getBoundingClientRect();
      const x=(event.clientX-r.left)*400/r.width, y=(event.clientY-r.top)*400/r.height;
      const p=[Math.round((x-200)/40),Math.round((200-y)/40)];
      if(p.every(n=>n>=-4&&n<=4)) action(p);
    }
    function drawCentre() {
      let h=grid(); const pts=sets[$('case').value];
      if(pts) {
        h+=segment(pts[0],pts[1],'var(--muted)',true)+segment(pts[2],pts[3],'var(--muted)',true);
        pts.forEach((p,i)=>h+=point(p,['A','A′','B','B′'][i]));
        say('case-data',pts.map((p,i)=>['A','A′','B','B′'][i]+'('+p.join(',')+')').join('；'));
      } else say('case-data','先选一组数据。');
      lines.forEach((line,i)=>{
        line.forEach((p,j)=>h+=point(p,`线${i+1}点${j+1}`,'var(--accent)'));
        if(line.length===2 && !equal(...line)) {
          // Clip an infinite student line to the grid square.
          const [a,b]=line, d=[b[0]-a[0],b[1]-a[1]], hits=[];
          for(let k=0;k<2;k++) if(d[k]!==0) for(const bound of [-4,4]) {
            const t=(bound-a[k])/d[k], p=[a[0]+t*d[0],a[1]+t*d[1]];
            if(p.every(v=>v>=-4-1e-9&&v<=4+1e-9)) hits.push(p);
          }
          if(hits.length>=2) { let best=[hits[0],hits[1]], dist=-1; for(const a of hits)for(const b of hits){const d=(a[0]-b[0])**2+(a[1]-b[1])**2;if(d>dist){dist=d;best=[a,b];}} h+=segment(...best); }
        }
      });
      if(centre) h+=point(centre,'候选中心','var(--accent)');
      $('centre-grid').innerHTML=h;
    }
    function clearCentre() { lines=[[],[]];centre=null; say('centre-result','');drawCentre(); }
    function putCentre(p) {
      if(!$('case').value || !$('tool').value) return say('centre-result','先选数据组与操作。');
      if($('tool').value==='centre') centre=p;
      else { const line=lines[$('tool').value==='l1'?0:1]; if(line.length===2) line.length=0; line.push(p); }
      say('centre-result','已记录；线画满两点后再次落点会重画该线。');drawCentre();
    }
    // Each chosen point must be equidistant from the corresponding pair, exactly on this integer grid.
    function isBisector(line,a,b) {
      return line.length===2 && !equal(...line) && !equal(a,b) && line.every(p=>(p[0]-a[0])**2+(p[1]-a[1])**2===(p[0]-b[0])**2+(p[1]-b[1])**2);
    }
    function checkCentre() {
      const kind=$('case').value;
      if(!kind || !$('conclusion').value) return say('centre-result','先选数据组和你的结论。');
      if(kind==='identity') return say('centre-result',$('conclusion').value===kind?'结论符合恒等旋转边界。点与像点重合，不存在由这条零长度线段确定的中垂线；绕任意中心转整周都可。':'点与像点都重合，先考虑0°或整周，不能由它们唯一找中心。');
      const p=sets[kind];
      if(!isBisector(lines[0],p[0],p[1])) return say('centre-result','第一条线未成为 AA′ 的中垂线。请找中点并作垂线，需两个不同点。');
      if(!isBisector(lines[1],p[2],p[3])) return say('centre-result','第二条线未成为 BB′ 的中垂线。请检查等距与垂直条件，需两个不同点。');
      if($('conclusion').value!==kind) return say('centre-result','两线作法符合要求，但交点情况的判断不符；检查是唯一相交、重合还是平行。');
      if(kind==='same') return say('centre-result','已识别重合线。两组等距只给出同一条直线，仅靠这两条中垂线还不能定位；不能任选线上一点当中心。须增加独立条件，例如再检查两组转角一致，或补一组中垂线不重合的对应点。');
      if(kind==='parallel') return say('centre-result','已识别平行线。这组对应数据没有有限旋转中心，不能因图形相似就冒认已找到。');
      if(!equal(centre,[0,0])) return say('centre-result','两线唯一相交；请自行落下交点作为候选中心。');
      say('centre-result','两条中垂线与候选交点核对通过。由中点及垂直可得两组等距，再检查两对点均绕该点逆时针转90°。这才支持本组的旋转中心。');
    }
    const proofSteps=[['mapping','ODE','先按 O→O、B→D、C→E 排列对应顺序。'],['side1','rotation','OB 对应 OD；不能把不同顶点的半径随意相等。'],['side2','rotation','OC 对应 OE，使用对应点到中心的距离相等。'],['angle','rotation','∠BOC 是原三角形内角，不是转过的90°；用旋转保持对应角。'],['criterion','SAS','两边及其夹角相等用SAS。SSA不成立，AAA只说明形状不能定大小。'],['finish','corresponding','最后写明全等三角形的对应边相等；目测不构成证明。']];
    $('check-proof').onclick=()=>{
      for(const [id,value,hint] of proofSteps) if($(id).value!==value) return say('proof-result',$(id).value?hint:'推理链尚未完成，请补齐各步。');
      say('proof-result','本条符号推理链完整：两边与夹角相等，SAS 得 △OBC≌△ODE，所以对应边 BC=DE。请在下面独立重写；自由文字不自动判真。');
    };
    $('grid').onclick=e=>gridClick(e,put);
    $('place').onclick=()=>readXY('x','y','drawing-result',put);
    $('connect').onclick=()=>{
      const e=$('edge').value;
      if(!e || !image[e.slice(0,2)] || !image[e.slice(2)]) return say('drawing-result','先放置这条边的两个端点，再添加边。');
      if(!edges.includes(e)) edges.push(e);
      say('drawing-result','已添加边，尚未核对。');draw();
    };
    $('undo-edge').onclick=()=>{edges.pop();say('drawing-result','已撤销末边，请重新核对。');draw();};
    $('check-drawing').onclick=checkDrawing; $('clear-drawing').onclick=clearDrawing;
    ['mode','direction','turn'].forEach(id=>$(id).addEventListener('change',clearDrawing));
    $('centre-grid').onclick=e=>gridClick(e,putCentre);
    $('centre-place').onclick=()=>readXY('cx','cy','centre-result',putCentre);
    $('case').onchange=()=>{$('conclusion').value='';clearCentre();};
    $('check-centre').onclick=checkCentre; $('clear-centre').onclick=clearCentre;
    $('design-review').onclick=()=>say('design-result','设计自核（不自动判真）：原图不退化？逐顶点作图并连齐边？说明了中心、方向、转角及组合意图？纸上多次转动是否每次都手工作图？请与同伴互查。');
    $('measure-review').onclick=()=>say('measure-result','实量自核（不自动判真）：确实亲手量过并写单位、误差吗？比较了两半径、边与内角、两组转角吗？240°转过的度数与普通夹角分开了吗？读数差异能否由误差解释？若不能，重新固定中心测量；不能用填表替代实作。');
    root.addEventListener('input',e=>{
      if(e.target.closest('#jw-proof')) say('proof-result','');
      if(e.target.closest('#jw-measure')) say('measure-result','');
      if(e.target.closest('#jw-drawing')) { say('drawing-result','');say('design-result',''); }
      if(e.target.closest('#jw-centre')) say('centre-result','');
      say('global-result','');
    });
    root.addEventListener('change',e=>{
      if(e.target.closest('#jw-proof')) say('proof-result','');
      if(e.target.closest('#jw-drawing')) {say('drawing-result','');say('design-result','');}
      if(e.target.closest('#jw-centre') && e.target!==$('case')) say('centre-result','');
    });
    $('download').onclick=()=>{
      const record=['旋转工作坊个人记录（实量、自由文字与设计仅供自核，未自动认证）',...Array.from(root.querySelectorAll('input,select,textarea')).map(el=>el.id+': '+el.value),'原顶点: '+JSON.stringify(original),'学生像点: '+JSON.stringify(image),'学生边: '+JSON.stringify(edges),'学生中垂线: '+JSON.stringify(lines),'候选中心: '+JSON.stringify(centre)].join('\n');
      const url=URL.createObjectURL(new Blob([record],{type:'text/plain;charset=utf-8'})), a=document.createElement('a');a.href=url;a.download='rotation-workshop.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('global-result','已下载本地记录；未写入学习成绩。');
    };
    $('reset').onclick=()=>{
      root.querySelectorAll('input,select,textarea').forEach(el=>el.value='');
      root.querySelectorAll('.jw-feedback').forEach(el=>el.textContent='');
      clearDrawing();clearCentre();say('global-result','工作坊已重置，旧课页作答与控件不受影响。');
    };
    clearDrawing();clearCentre();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
