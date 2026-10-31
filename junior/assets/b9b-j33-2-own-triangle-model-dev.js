/* j33-2 独占有限工作单；不解析任意三角形，不存储学生资料。 */
(function () {
  'use strict';
  if (!document.body || document.body.dataset.sec !== 'j33-2') return;
  const root = document.getElementById('own-triangle-model');
  if (!root) return;
  const get = id => root.querySelector('#ot-' + id);
  const sqrt = Math.sqrt;
  // 每项均有明确构型与单位。特殊值保留根式，非特殊角只用题给近似。
  const tasks = [
    {id:'legs', title:'两条直角边', shape:'right', prompt:'Rt△ABC，∠C=90°，a=BC=6 m，b=AC=8 m。求c=AB、∠A、∠B。计算器给出：tan A=0.75 时 A≈36.86989765°。', line:'none', right:'C', rel:'legs', fields:[['AB',10],['∠A',36.86989765,'angle'],['∠B',53.13010235,'angle']], solution:'由勾股定理 AB=√(6²+8²)=10 m；tan A=6/8=0.75，A≈36.9°，B=90°−A≈53.1°。10大于6和8。'},
    {id:'hyp', title:'斜边和直角边', shape:'right', prompt:'Rt△ABC，∠C=90°，c=AB=10 m，a=BC=6 m。求b=AC、∠A、∠B。计算器给出：sin A=0.6 时 A≈36.86989765°。', line:'none', right:'C', rel:'hyp', fields:[['AC',8],['∠A',36.86989765,'angle'],['∠B',53.13010235,'angle']], solution:'0<6<10，条件有效。AC=√(10²−6²)=8 m，sin A=6/10，A≈36.9°，B≈53.1°。'},
    {id:'angle', title:'一边一锐角', shape:'right', prompt:'Rt△ABC，∠C=90°，b=AC=7 m，∠A=30°。求a=BC、c=AB、∠B。用特殊角准确值，最后取近似。', line:'none', right:'C', rel:'angle', fields:[['BC',7/sqrt(3)],['AB',14/sqrt(3)],['∠B',60,'angle']], solution:'BC=7tan30°=7√3/3≈4.0 m；AB=7/cos30°=14√3/3≈8.1 m；B=60.0°。两个边分别直接用原始的7计算。'},
    {id:'up', title:'仰角与眼高', shape:'up', prompt:'楼底B、楼顶T，眼睛E高出水平地面1.6 m。E到楼的水平距离24 m，仰角35°。求楼高BT。题给tan35°≈0.7002075382，按此近似计算。', line:'horizontal', right:'H', rel:'up', fields:[['BT',1.6+24*0.7002075382]], solution:'过E作水平线EH交BT于H，EH⊥BT，BH=1.6 m。tan35°=HT/EH，BT=BH+HT≈1.6+24×0.7002075382≈18.4 m。不是仅算HT。'},
    {id:'down', title:'俯角测距', shape:'down', prompt:'塔顶T距水平地面42 m，塔底B。T看地面点Q的俯角30°，求BQ。用特殊角准确值，最后取近似。', line:'top', right:'B', rel:'down', fields:[['BQ',42*sqrt(3)]], solution:'过T画水平线，与BQ平行。俯角等于∠TQB=30°，直角在B。BQ=42/tan30°=42√3≈72.7 m。T处三角形内角是60°，不是俯角。'},
    {id:'north', title:'北偏东', shape:'north', prompt:'P在O的北偏东30°方向，OP=18海里。求P到过O南北线的距离PQ，以及沿正北方向的距离OQ。', line:'axis', right:'Q', rel:'direction', unit:'mile', fields:[['PQ',9],['OQ',9*sqrt(3)]], solution:'方向角从正北量。作PQ⊥南北线于Q，PQ=18sin30°=9.0海里，OQ=18cos30°=9√3≈15.6海里。'},
    {id:'south', title:'南偏西', shape:'south', prompt:'P在O的南偏西60°方向，OP=14海里。求P到过O南北线的距离PQ，以及沿正南方向的距离OQ。', line:'axis', right:'Q', rel:'direction', unit:'mile', fields:[['PQ',7*sqrt(3)],['OQ',7]], solution:'从正南向西转60°。PQ=14sin60°=7√3≈12.1海里，OQ=14cos60°=7.0海里。所求均为正距离，不能按东西坐标写负数。'},
    {id:'slope', title:'坡道的长度与坡度', shape:'right', prompt:'坡道从A升到B，C是B在水平地面上的垂足。坡度BC/AC=1:2.4，坡面AB长26 m。求高度BC、水平宽AC。', line:'none', right:'C', rel:'slope', fields:[['BC',10],['AC',24]], solution:'设BC=x>0，则AC=2.4x。x²+(2.4x)²=26²，x=10，故BC=10.0 m、AC=24.0 m。高÷坡长=10/26，不是坡度10/24。'},
    {id:'altitude', title:'一般三角形求边', shape:'oblique', prompt:'△ABC中，∠B=45°，∠C=30°，AB=6√2 m。求BC、AC。请先自行决定作哪条高，D是候选垂足。', line:'height', right:'D', rel:'sum', fields:[['BC',6+6*sqrt(3)],['AC',12]], solution:'作AD⊥BC，B、C均为锐角所以D在BC内。AD=ABsin45°=6，BD=ABcos45°=6，DC=AD/tan30°=6√3。BC=BD+DC=6+6√3≈16.4 m，AC=AD/sin30°=12.0 m。'},
    {id:'two', title:'同侧两次观测', shape:'two', prompt:'水平地面上C、D、塔底B依次共线，CD=18 m；在C、D看塔顶T的仰角依次30°、60°（仪器均在地面）。求BT。', line:'none', right:'B', rel:'difference', fields:[['BT',9*sqrt(3)]], solution:'两个直角三角形的公共高BT=x>0。CB=x/tan30°，DB=x/tan60°；CB−DB=18，得x=9√3≈15.6 m。同侧的两段距离取差，不能取和。'},
    {id:'scale', title:'条件检查 · 两个锐角', shape:'right', state:'scale', prompt:'Rt△ABC，∠C=90°，∠A=30°，∠B=60°。能否求出唯一的BC（m）？', rel:'scale', fields:[['BC',null]], solution:'不能定大小。BC=k、AC=√3k、AB=2k，对任意k>0都有相同的角。缺少至少一条边长；数值和单位留空。'},
    {id:'bad-hyp', title:'条件检查 · 两条边', shape:'right', state:'invalid', prompt:'声称Rt△ABC中∠C=90°，斜边AB=6 m，直角边BC=8 m。能求AC吗？', rel:'badside', fields:[['AC',null]], solution:'不能：直角边必须小于斜边，6²−8²<0。不是得到负的边长，也不能交换题给的边名。'},
    {id:'zero', title:'条件检查 · 零长度', shape:'right', state:'invalid', prompt:'声称Rt△ABC中∠C=90°，BC=0 m，AC=8 m。能作为非退化直角三角形求AB吗？', rel:'badside', fields:[['AB',null]], solution:'BC=0，三角形退化，不满足边长为正。不能只算√(0²+8²)后就宣布解出了直角三角形。'},
    {id:'zero-angle', title:'条件检查 · 0°', shape:'up', state:'invalid', prompt:'按E、H、T构成非退化直角三角形建模：EH=24 m，声称仰角∠TEH=0°，且T严格高于E。能求正的HT吗？', rel:'badangle', fields:[['HT',null]], solution:'0°不是锐角，与T严格高于E矛盾。此时不能使用本节非退化直角三角形模型。'},
    {id:'right-angle', title:'条件检查 · 90°', shape:'up', state:'invalid', prompt:'按E、H、T构成非退化直角三角形建模：EH=24 m，声称仰角∠TEH=90°。能求有限的正HT吗？', rel:'badangle', fields:[['HT',null]], solution:'90°不是锐角。EH>0时视线ET不可能竖直；tan90°在此模型无定义，不能输出无限楼高。'},
    {id:'parallel', title:'条件检查 · 两次等角', shape:'two', state:'invalid', prompt:'C、D、塔底B依次在水平直线上，CD=18 m，两处仪器在地面。看同一塔顶T的仰角都是30°。能求正且有限的塔高吗？', rel:'badpair', fields:[['BT',null]], solution:'两条视线平行；若设公共高x，则CB=DB而CD=18，与CB−DB=18矛盾。不能除以0。'},
    {id:'reverse', title:'条件检查 · 近处角更小', shape:'two', state:'invalid', prompt:'C、D、塔底B依次在水平直线上，CD=18 m；看同一塔顶T的仰角远处C为60°、近处D为30°，仪器在地面。能求正塔高吗？', rel:'badpair', fields:[['BT',null]], solution:'近处仰角应大于远处。设x>0，CB=x/tan60°小于DB=x/tan30°，与C-D-B顺序矛盾。算出的负数不是塔高。'}
  ];
  const relations = [
    ['legs','c²=a²+b²；tan A=a/b；B=90°−A'],
    ['hyp','b²=c²−a²；sin A=a/c；B=90°−A'],
    ['angle','a=b·tan A；c=b/cos A；B=90°−A'],
    ['up','HT=EH·tan θ；BT=BH+HT'],
    ['down','BQ=BT/tan θ（θ为俯角）'],
    ['direction','PQ=OP·sin θ；OQ=OP·cos θ（θ从南/北量）'],
    ['slope','BC=x，AC=2.4x；x²+(2.4x)²=AB²'],
    ['sum','AD=AB·sin B；BD=AB·cos B；DC=AD/tan C；BC=BD+DC；AC=AD/sin C'],
    ['difference','CB=x/tan α；DB=x/tan β；CB−DB=CD'],
    ['wrong-slope','BC/AB=坡度'],['wrong-dir','PQ=OP·cos θ；OQ=OP·sin θ'],
    ['wrong-sum','CB=x/tan α；DB=x/tan β；CB+DB=CD'],
    ['wrong-up','BT=EH·tan θ（忽略眼高）'],
    ['scale','两角无边，不能确定尺度'],['badside','存在零边长或斜边不大于直角边'],
    ['badangle','仰角不在0°与90°之间，与非退化构型不符'],
    ['badpair','同侧向塔走近，近处仰角未大于远处']
  ];
  function options(select, rows) {
    select.replaceChildren();
    [['','请选择'], ...rows].forEach(([value, text]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option);
    });
  }
  // 不按比例的基础示意；只有用户选择才添加辅助线及直角符号。
  function draw(t) {
    const svg = get('fig'); svg.replaceChildren();
    const NS = 'http://www.w3.org/2000/svg';
    const points = {};
    function node(tag, attrs) { const e=document.createElementNS(NS,tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); svg.append(e); return e; }
    function point(name,x,y) { points[name]=[x,y]; node('text',{x:x+8,y:y+6,fill:'var(--fg)','font-size':18}).textContent=name; }
    function line(a,b,dash=false) { node('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:'var(--fg)','stroke-width':2,'stroke-dasharray':dash?'6 4':'none'}); }
    function named(a,b,dash=false) {line(points[a],points[b],dash);}
    if(t.shape==='right') {point('A',40,180);point('C',280,180);point('B',280,40);named('A','B');named('A','C');named('B','C');}
    if(t.shape==='up') {point('E',40,150);point('B',280,200);point('T',280,40);named('B','T');named('E','T');line([20,200],[320,200]);}
    if(t.shape==='down') {point('T',50,45);point('B',50,190);point('Q',300,190);named('T','B');named('B','Q');named('T','Q');}
    if(t.shape==='north'||t.shape==='south') {const south=t.shape==='south';point('O',south?290:70,south?40:190);point('P',south?90:270,south?190:40);named('O','P');node('text',{x:20,y:20,fill:'var(--fg)','font-size':18}).textContent='北 ↑';}
    if(t.shape==='oblique') {point('A',145,35);point('B',35,190);point('C',320,190);named('A','B');named('A','C');named('B','C');}
    if(t.shape==='two') {point('C',30,190);point('D',150,190);point('B',300,190);point('T',300,35);named('C','B');named('B','T');named('C','T');named('D','T');}
    const choice=get('line').value;
    if(choice==='height'&&points.A&&points.B&&points.C) {
      const [ax,ay]=points.A, [bx,by]=points.B, [cx,cy]=points.C;
      const k=((ax-bx)*(cx-bx)+(ay-by)*(cy-by))/((cx-bx)**2+(cy-by)**2);
      const dx=bx+k*(cx-bx), dy=by+k*(cy-by);
      if(Math.hypot(dx-cx,dy-cy)<0.1) {
        points.D=[cx,cy];
        [...svg.querySelectorAll('text')].find(e=>e.textContent==='C').textContent='C=D';
      } else point('D',dx,dy);
      named('A','D',true);
    }
    if(choice==='horizontal'&&points.E) {point('H',280,points.E[1]);named('E','H',true);}
    if(choice==='top'&&points.T) line(points.T,[335,points.T[1]],true);
    if(choice==='axis'&&points.O&&points.P) {point('Q',points.O[0],points.P[1]);line([points.O[0],20],[points.O[0],215],true);named('P','Q',true);}
    if(choice==='vertical'&&points.E) line([points.E[0],20],[points.E[0],210],true);
    const mark=points[get('right').value];
    if(mark) {
      const dx=(t.shape==='down'||t.shape==='north')?12:-12;
      const dy=t.shape==='north'?12:-12;
      node('path',{d:`M${mark[0]+dx},${mark[1]} v${dy} h${-dx}`,fill:'none',stroke:'var(--no)','stroke-width':2});
    }
  }
  let current=tasks[0];
  function clearFeedback() {get('feedback').textContent='待你尝试（修改后需重新核对）。';get('explain').hidden=true;get('explain').open=false;get('solution').textContent='';}
  function load() {
    current=tasks.find(t=>t.id===get('case').value)||tasks[0];
    get('case').value=current.id;
    ['state','line','right','unit'].forEach(id=>get(id).value='');get('notes').value='';
    options(get('relation'),relations);
    get('prompt').textContent=current.prompt;
    get('values').replaceChildren();
    current.fields.forEach(([name,,kind],i)=>{
      const label=document.createElement('label');label.textContent=name+(kind==='angle'?'（°）':'（长度）')+' ';
      const input=document.createElement('input');input.id='ot-value-'+i;input.type='text';input.inputMode='decimal';input.autocomplete='off';input.setAttribute('aria-label',name+(kind==='angle'?' 度':' 长度'));label.append(input);get('values').append(label);
    });
    clearFeedback();draw(current);
  }
  function check() {
    const state=get('state').value, unique=state==='unique';
    const values=current.fields.map((_,i)=>get('value-'+i).value.trim());
    if(!state||!get('relation').value||(unique&&(!get('line').value||!get('right').value||!get('unit').value||values.some(v=>!v)))) {
      get('feedback').textContent='先完成自己的判断与理由；若判断能唯一求解，还须选择补线、直角、关系并填完数值和单位。';return;
    }
    const expected=current.state||'unique';
    const errors=[];
    if(state!==expected) errors.push('存在性 / 唯一性判断');
    if(get('relation').value!==current.rel) errors.push('关系组或条件理由');
    if(expected==='unique') {
      if(get('line').value!==current.line) errors.push('本工作单的补线方案');
      if(get('right').value!==current.right) errors.push('直角位置');
      if(get('unit').value!==(current.unit||'m')) errors.push('长度单位');
      current.fields.forEach(([name,target],i)=>{
        // 精确到0.1：只接受应写出的舍入值，不用宽容区间掩盖精度错误。
        const v=values[i];const rounded=Number(target.toFixed(1));
        if(!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v)||Number(v)!==rounded) errors.push(name+'的数值 / 末步精度');
      });
    } else if(values.some(Boolean)||get('unit').value) errors.push('不能求解时应留空的数值 / 单位');
    get('feedback').textContent=errors.length?'本次仍需检查：'+errors.join('、')+'。可展开解说，再修改重试。':'本题有限结构与数值核对通过；纸笔图、完整推理和测量尚须按准则自核。';
    get('solution').textContent=current.solution+' 本工作单只收所列补线方案；其他等价作法请按准则自核，不作自动否定。';
    get('explain').hidden=false;
  }
  options(get('case'),tasks.map(t=>[t.id,t.title]));
  get('case').addEventListener('change',load);
  get('reset').addEventListener('click',load);
  get('check').addEventListener('click',check);
  root.addEventListener('input',e=>{if(e.target.matches('input,textarea,select')) {clearFeedback();draw(current);}});
  root.addEventListener('change',e=>{if(e.target.id!=='ot-case'&&e.target.matches('select')) {clearFeedback();draw(current);}});
  load();
})();
