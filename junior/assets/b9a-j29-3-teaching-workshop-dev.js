/* J29:176 — only j29-3; no learning ledger or network writes. */
(function () {
  'use strict';
  const root = document.getElementById('cone-paper-workshop');
  if (!root || document.body.dataset.sec !== 'j29-3' || root.dataset.mounted) return;
  root.dataset.mounted = 'true';
  root.innerHTML = `
    <style>
      #cone-paper-workshop { margin-top:24px; color:var(--fg); overflow-wrap:anywhere }
      #cone-paper-workshop .cp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr)); gap:12px }
      #cone-paper-workshop label { display:block; margin:10px 0 }
      #cone-paper-workshop input:not([type=checkbox]), #cone-paper-workshop select, #cone-paper-workshop textarea { display:block; box-sizing:border-box; width:100%; font:inherit; color:var(--fg); background:var(--bg); border:1px solid var(--fg); border-radius:6px; padding:9px }
      #cone-paper-workshop button { min-height:44px; padding:9px 12px; margin:4px; font:inherit; color:var(--fg); background:var(--card); border:1px solid var(--fg); border-radius:6px; cursor:pointer }
      #cone-paper-workshop button:disabled { opacity:.6; cursor:default }
      #cone-paper-workshop :focus-visible { outline:3px solid var(--fg); outline-offset:3px }
      #cone-paper-workshop svg { display:block; width:100%; max-width:400px; height:auto; margin:auto; color:var(--fg) }
      #cone-paper-workshop [hidden] { display:none !important }
      #cone-paper-workshop output { display:block; margin:10px 0; min-height:2em; white-space:pre-line }
    </style>
    <h3>亲手做一个圆锥：我的展开、标记与剪拼单</h3>
    <p>先设计，再用纸、圆规、量角器、直尺、细绳、彩笔和胶带制作。小心使用剪刀。这里记录的是你的设计与自述；网页不能认证你已亲剪、测量或粘好实物，刷新后本活动记录清空。</p>
    <div class="card">
      <h4>① 选定自己的正圆锥</h4>
      <p>长度单位 cm。本工具每个已知长度限 0.1～8；一般数学条件是 r&gt;0、h&gt;0、l&gt;r，且 l²=r²+h²。r 是底面半径，l 是母线，h 是垂直于底面的高。</p>
      <p>输入语法：只收半角十进制数（最多六位小数），可有正负号和首尾空白；不收分数、根式、单位、全角数或科学计数。其它合法数学写法请在纸上核算，不会被当作已判错的数学命题。</p>
      <form id="cp-design">
        <div class="cp-grid">
          <label>底面半径 r（cm）<input id="cp-r" inputmode="decimal" autocomplete="off"></label>
          <label>另一个已知量<select id="cp-mode"><option value="l">母线 l</option><option value="h">高 h</option></select></label>
          <label>所选已知量的长度（cm）<input id="cp-other" inputmode="decimal" autocomplete="off"></label>
        </div>
        <button type="submit">采用这组尺寸</button><button type="button" id="cp-reset">清空重做</button>
      </form>
      <output id="cp-design-result" aria-live="polite"></output>
    </div>
    <div id="cp-work" hidden>
      <div class="card">
        <h4>② 先提交自己的展开计算</h4>
        <p>本题中的 c 表示扇形弧长，l 始终表示母线。先在纸上用弧长公式写等量关系，再填写近似数值。请保留至少两位小数（有需要可更多）。</p>
        <form id="cp-plan">
          <div class="cp-grid">
            <label>展开扇形半径（cm）<input id="cp-radius" inputmode="decimal" autocomplete="off"></label>
            <label>展开圆心角（度）<input id="cp-angle" inputmode="decimal" autocomplete="off"></label>
            <label>弧长 c=kπ 中的 k（cm）<input id="cp-coeff" inputmode="decimal" autocomplete="off"></label>
          </div>
          <label>我的等量关系与理由（仅供本人/同伴核读）<textarea id="cp-reason" rows="3"></textarea></label>
          <button type="submit">核对这次数值并预览我的提案</button>
        </form>
        <output id="cp-plan-result" aria-live="polite"></output>
        <div id="cp-proposal"></div>
        <details class="more"><summary>写完再看：一般关系与反例</summary>
          <p>沿母线剪开时，不伸缩的侧面展开为扇形，扇形半径是 l，弧长 c 是底面周长 2πr。由 nπl/180=2πr，得到 n=360r/l；这是一般关系，不是靠几次数字试验得出的证明。母线由 l²=r²+h² 求得。侧面积为 c·l/2=πrl。</p>
          <p>l=r 时 h=0，展开角为360°，只剩平面圆，不能叫非退化立体圆锥；l&lt;r 时不存在这样的实高。高 h 不能代替扇形半径 l，底面圆的半径 r 也不能代替 l。</p>
        </details>
      </div>
      <div class="card">
        <h4>③ 自己标出对应边界</h4>
        <p>图上先用 A 表示扇形两条直边，B 表示扇形弯边，C 表示底面圆边界，D 表示底面圆心到边界的线段。选好含义再提交，图上会采用你的标记；不能只凭颜色判断。</p>
        <form id="cp-mark">
          <div class="cp-grid" id="cp-mark-fields"></div>
          <button type="submit">提交我的四处标记</button>
        </form>
        <output id="cp-mark-result" aria-live="polite"></output>
        <div id="cp-model"></div>
        <button type="button" id="cp-flat" aria-pressed="true">看我的展开标记</button>
        <button type="button" id="cp-roll" aria-pressed="false">看卷合后的对应</button>
        <p id="cp-view-note">屏幕图自适应缩放，不是实物比例。卷合图只是示意，打印用精确扇形。</p>
      </div>
      <div class="card">
        <h4>④ 导出并亲手剪、卷、再展开</h4>
        <ol>
          <li>数值与标记核对后导出两页剪拼单，用浏览器打开下载的 HTML，再打印 A4 纵向、实际大小100%，关闭“适合页面”和页眉页脚。用尺检查每页50mm校准线；不符则先改打印设置。</li>
          <li>按所列比例，在纸上用圆规画母线长对应的扇形半径，量角器量出圆心角，画弧；另一张纸按底面半径画圆。也可直接剪导出的实线轮廓。用尺检查两条直边。</li>
          <li>沿扇形两直边与弧剪下。两条直边对缝，不重叠、不拉伸，用外侧胶带固定；图纸未含胶舌。底圆可用外侧胶带暂接，接缝材料不计数学面积。</li>
          <li>在圆锥侧面用一种颜色标出一条母线，用另一颜色标底周；取下底圆，沿该母线剪开铺平，再把同色标记转到扇形两半径与弧上，并在底圆标 r。若只制作无底侧面，也要保留底圆作比较。</li>
          <li>用细绳量扇形弧、卷合后的底圈及底圆周长，用尺量两条母线；填实测值，检查差异。修订剪线或接缝后可以重新测量，保留纸上前后记录。</li>
        </ol>
        <button type="button" id="cp-export" disabled>导出我的两页剪拼单（HTML）</button>
        <output id="cp-export-result" aria-live="polite"></output>
        <h4>⑤ 填自己的测量记录（mm）</h4>
        <p id="cp-scale-note"></p>
        <p>尺量的是打印缩放后的纸片。长度误差限请自己声明为0.1～5mm；这个范围只核对你报告的数字，不能证明实物精确吻合或测量真实发生。弧与圆周请用细绳贴边量，不量弦。</p>
        <form id="cp-measure">
          <div class="cp-grid">
            <label>扇形弧的实测长度（mm）<input id="cp-ma" inputmode="decimal" autocomplete="off"></label>
            <label>卷合底圈的实测周长（mm）<input id="cp-mc" inputmode="decimal" autocomplete="off"></label>
            <label>底面纸圆的实测周长（mm）<input id="cp-mb" inputmode="decimal" autocomplete="off"></label>
            <label>第一条直边实测长（mm）<input id="cp-ml1" inputmode="decimal" autocomplete="off"></label>
            <label>第二条直边实测长（mm）<input id="cp-ml2" inputmode="decimal" autocomplete="off"></label>
            <label>声明的长度误差限（mm）<input id="cp-tol" inputmode="decimal" autocomplete="off"></label>
          </div>
          <label>我发现的差异、接缝处理与重测计划<textarea id="cp-notes" rows="3"></textarea></label>
          <label><input type="checkbox" id="cp-self"> 我已按上述准则自行检查纸上制作和标色（仅为我的自述）</label>
          <button type="submit">比较本次报告数字</button>
        </form>
        <output id="cp-measure-result" aria-live="polite"></output>
        <p>准则自核：是否沿母线剪开？是否两半径都标 l，而底圆半径标 r？弧与原底周是否同色且等长？缝是否对齐、无重叠？把一般公式解释给同伴听，再请对方检查你的纸片。可以带着剪拼单和测量记录请教师核读。</p>
      </div>
    </div>`;
  const $ = id => root.querySelector('#cp-' + id);
  const number = text => {
    const s = text.trim();
    return /^[+-]?(?:\d+(?:\.\d{1,6})?|\.\d{1,6})$/.test(s) && Number.isFinite(Number(s)) ? Number(s) : NaN;
  };
  const fmt = n => Number(n.toFixed(6)).toString();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let model = null, planOK = false, markOK = false, marks = null, rolled = false;
  const labels = ['母线 l', '底面周长', '底面半径 r', '高 h'];
  ['A','B','C','D'].forEach(letter => {
    const label = document.createElement('label');
    label.textContent = letter + ' 的含义';
    const select = document.createElement('select'); select.id = 'cp-mark-' + letter;
    select.innerHTML = '<option value="">请选择</option>' + labels.map((s, i) => `<option value="${i}">${s}</option>`).join('');
    label.append(select); $('mark-fields').append(label);
  });
  function design(r, v, mode) {
    if (![r,v].every(x => Number.isFinite(x) && x >= .1 && x <= 8)) return null;
    const l = mode === 'h' ? Math.hypot(r,v) : v;
    const h = mode === 'h' ? v : Math.sqrt((l-r)*(l+r));
    const n = 360*r/l;
    if (!(l > r && h > 0 && n > 0 && n < 360 && 360-n > 1e-9)) return null;
    return {r,l,h,n,c:2*Math.PI*r, scale:Math.min(1,8.5/l)};
  }
  // All angles below are internal drawing coordinates, not a student method.
  function sector(radius, angle, cx, cy) {
    const a = (-90-angle/2)*Math.PI/180, b = a+angle*Math.PI/180;
    const x1=cx+radius*Math.cos(a), y1=cy+radius*Math.sin(a);
    const x2=cx+radius*Math.cos(b), y2=cy+radius*Math.sin(b);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${angle>180?1:0} 1 ${x2} ${y2} Z`;
  }
  function flat(m, own) {
    const radius = 112, br=radius*m.r/m.l;
    const names = own ? own.map(x => x === '' ? '未标' : labels[Number(x)]) : ['A','B','C','D'];
    return `<svg viewBox="0 0 400 420" role="img" aria-label="自定圆锥的展开标记图">
      <path d="${sector(radius,m.n,200,140)}" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="200" cy="318" r="${br*0.5}" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M 200 318 h ${br*.5}" stroke="currentColor" stroke-width="2"/>
      <text x="16" y="24" fill="currentColor" font-size="18">A：${esc(names[0])}</text>
      <text x="16" y="272" fill="currentColor" font-size="18">B：${esc(names[1])}</text>
      <text x="16" y="390" fill="currentColor" font-size="18">C：${esc(names[2])}</text>
      <text x="230" y="350" fill="currentColor" font-size="18">D：${esc(names[3])}</text>
      <text x="200" y="165" text-anchor="middle" fill="currentColor" font-size="20">S</text>
    </svg>`;
  }
  function draw() {
    if (!model) return;
    $('flat').setAttribute('aria-pressed', String(!rolled)); $('roll').setAttribute('aria-pressed',String(rolled));
    if (!rolled) $('model').innerHTML=flat(model,marks);
    else {
      const rx=95*model.r/model.l, height=150*model.h/model.l;
      $('model').innerHTML=`<svg viewBox="0 0 400 320" role="img" aria-label="卷合对应示意，非实物比例">
        <ellipse cx="200" cy="220" rx="${rx}" ry="${rx*.3}" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M ${200-rx} 220 L 200 ${220-height} L ${200+rx} 220 M 200 ${220-height} V 220 h ${rx}" fill="none" stroke="currentColor" stroke-width="2"/>
        <text x="16" y="30" font-size="18" fill="currentColor">A 两直边对缝</text>
        <text x="16" y="270" font-size="18" fill="currentColor">B 与 C 接合；D 是底面内线段</text>
      </svg>`;
    }
  }
  const unlock = () => { $('export').disabled=!(model && planOK && markOK); };
  function clearMeasurements() { $('measure-result').textContent=''; $('export-result').textContent=''; }
  function clearDerived() {
    model=null; planOK=false; markOK=false; marks=null; rolled=false;
    $('work').hidden=true;
    ['plan-result','mark-result','proposal','model','scale-note'].forEach(id=>$(id).textContent='');
    $('plan').reset(); $('mark').reset(); $('measure').reset(); clearMeasurements(); unlock();
  }
  $('design').addEventListener('input',()=>{clearDerived(); $('design-result').textContent='尺寸已修改，请重新采用；旧设计与核查已清除。';});
  $('design').addEventListener('submit',e=>{
    e.preventDefault(); clearDerived();
    model=design(number($('r').value),number($('other').value),$('mode').value);
    if (!model) { $('design-result').textContent='未采用：请输入范围内的正长度；母线模式必须 l>r。l=r 是平面退化，l<r 不能形成这样的圆锥。'; return; }
    $('design-result').textContent='已采用你的尺寸。请先计算展开半径、圆心角和弧长，再标记边界。';
    $('work').hidden=false;
    $('scale-note').textContent=`打印比例 s=${fmt(model.scale)}（纸上长度=设计长度×s）。每页校准线应为50mm；本页屏幕示意不按此比例。`;
    draw();
  });
  $('reset').addEventListener('click',()=>{$('design').reset(); clearDerived(); $('design-result').textContent='已清空，请重新设计。';});
  $('plan').addEventListener('input',()=>{planOK=false; $('plan-result').textContent='提案已修改，请重新核对。'; $('proposal').textContent=''; clearMeasurements(); unlock();});
  $('plan').addEventListener('submit',e=>{
    e.preventDefault(); if (!model) return;
    planOK=false; unlock(); $('proposal').textContent='';
    const radius=number($('radius').value), angle=number($('angle').value), coeff=number($('coeff').value);
    if (!(radius>0 && radius<=16 && angle>0 && angle<360 && coeff>0 && coeff<=32)) {
      $('plan-result').textContent='请填写三个有效数值：正半径≤16cm、0<角度<360°、正π系数≤32。'; return;
    }
    // Draw the student's proposal, even when it does not match the target cone.
    const drawnRadius=112*radius/Math.max(radius,model.l);
    $('proposal').innerHTML=`<p>我的提案：半径 ${fmt(radius)}cm，角度 ${fmt(angle)}°；这张扇形按图所得弧长约 ${fmt(angle*radius/180)}π cm（需与填写的系数及目标底周同时核对）。</p><svg viewBox="0 0 400 290" role="img" aria-label="学生提交的扇形提案"><path d="${sector(drawnRadius,angle,200,145)}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
    const a=Math.abs(radius-model.l)<=.005, b=Math.abs(angle-model.n)<=.05, c=Math.abs(coeff-2*model.r)<=.005;
    planOK=a&&b&&c;
    $('plan-result').textContent=`本次数值：半径${a?'吻合':'需修订'}；角度${b?'吻合':'需修订'}；弧长π系数${c?'吻合':'需修订'}。\n当前目标近似值：扇形半径 ${fmt(model.l)}cm，圆心角 ${fmt(model.n)}°，弧长 ${fmt(2*model.r)}π cm。容差依次0.005cm、0.05°、0.005cm。只核本次数值；文字理由请按一般关系自行或请同伴核读。预览是你的提案，尺寸不吻合时不可当作目标剪线。`;
    unlock();
  });
  $('mark').addEventListener('change',()=>{markOK=false; marks=null; $('mark-result').textContent='标记已修改，请重新提交。'; draw(); clearMeasurements(); unlock();});
  $('mark').addEventListener('submit',e=>{
    e.preventDefault(); if (!model) return;
    marks=['A','B','C','D'].map(s=>$('mark-'+s).value);
    markOK=marks.every((v,i)=>v===['0','1','1','2'][i]);
    $('mark-result').textContent=marks.some(v=>v==='')?'请先标完四处。':markOK?'四处对应吻合。请把标记亲自转到纸上，同色之外也写量名。':'这是你的标记，尚有不吻合：两直边卷合后从顶点通到底圈；扇形弧与底圈接合；底面内那条线从圆心出发。请据此修订。';
    draw(); unlock();
  });
  $('flat').addEventListener('click',()=>{rolled=false; draw();});
  $('roll').addEventListener('click',()=>{rolled=true; draw();});
  function printDocument() {
    const m=model, k=10*m.scale, R=m.l*k, r=m.r*k;
    const calibrate='<path d="M 15 188 v 4 M 15 190 h 50 M 65 188 v 4" fill="none" stroke="black" stroke-width=".3"/><text x="15" y="198" font-size="4">50mm 校准线</text>';
    const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" width="190mm" height="200mm" viewBox="0 0 190 200">${body}${calibrate}</svg>`;
    const measurement=['ma','mc','mb','ml1','ml2','tol'].map(id=>esc($(id).value || '未填')).join(' / ');
    const title=`r=${fmt(m.r)}cm；l=${fmt(m.l)}cm；h≈${fmt(m.h)}cm；n≈${fmt(m.n)}°；c=${fmt(2*m.r)}π cm；打印比例s=${fmt(m.scale)}`;
    return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>我的圆锥剪拼单</title><style>@page{size:A4 portrait;margin:10mm}body{font:10pt sans-serif;color:black;background:white;margin:0}section{break-after:page}section:last-child{break-after:auto}svg{display:block}h2{font-size:14pt;margin:0 0 3mm}p{line-height:1.25;margin:2mm 0;overflow-wrap:anywhere}</style>
      <section><h2>我的圆锥侧面扇形</h2><p>${title}</p><p>打印100%实际大小，关闭适合页面及页眉页脚，先量50mm校准线。屏幕显示非实物尺寸。图不含胶舌；沿实线剪，直边对缝，用外侧胶带固定，不重叠。</p>
      ${svg(`<path d="${sector(R,m.n,95,95)}" fill="none" stroke="black" stroke-width=".3"/>`)}
      <p>本次提交标记：A=${esc(labels[Number(marks[0])])}；B=${esc(labels[Number(marks[1])])}；C=${esc(labels[Number(marks[2])])}；D=${esc(labels[Number(marks[3])])}。亲自标：两直边各写母线l，弧写底周2πr；与实物同色。纸上直边≈${fmt(R)}mm，弧≈${fmt(m.c*k)}mm。角度按未舍入值绘制。</p></section>
      <section><h2>我的底面与核查记录</h2><p>${title}</p>
      ${svg(`<circle cx="95" cy="95" r="${r}" fill="none" stroke="black" stroke-width=".3"/><path d="M 95 95 h ${r}" stroke="black" stroke-width=".3"/><text x="95" y="90" font-size="4">r</text>`)}
      <p>弧实测____mm；卷合底圈____mm；底圆周____mm；两母线____/____mm；声明误差限____mm。底圆周目标≈${fmt(m.c*k)}mm。沿母线剪开并重新标色，比较三条曲边长度；记录接缝与重测。</p>
      <p>本次自报（mm，依次弧/底圈/底圆周/两直边/误差限）：${measurement}。本人准则自核：${$('self').checked?'已勾选，仅自述':'未勾选'}。</p><p>我的理由：${esc($('reason').value)}</p><p>我的记录：${esc($('notes').value)}</p><p>网页只核设计；实物经历、测量与解释由本人/同伴/教师核读，不自动认证。</p></section></html>`;
  }
  $('export').addEventListener('click',()=>{
    if (!(model&&planOK&&markOK)) return;
    const blob=new Blob([printDocument()],{type:'text/html;charset=utf-8'}), url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='my-cone-paper-workshop.html'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('export-result').textContent='已导出当前设计。打开下载的HTML打印两页；校准线须实测50mm。标记核对仅为设计核对，不认证实物制作。';
  });
  $('measure').addEventListener('input',()=>{$('measure-result').textContent='记录已修改，请重新比较报告数字。'; $('export-result').textContent='';});
  $('measure').addEventListener('submit',e=>{
    e.preventDefault(); if (!model) return;
    const values=['ma','mc','mb','ml1','ml2','tol'].map(s=>number($(s).value));
    if (!values.every(v=>v>0&&Number.isFinite(v)) || values[5]<.1 || values[5]>5) {
      $('measure-result').textContent='请填齐正的实测长度，误差限须在0.1～5mm内。'; return;
    }
    const [a,c,b,l1,l2,t]=values, targetC=model.c*10*model.scale, targetL=model.l*10*model.scale;
    const ok=[a,c,b].every(v=>Math.abs(v-targetC)<=t)&&[l1,l2].every(v=>Math.abs(v-targetL)<=t)&&Math.max(a,c,b)-Math.min(a,c,b)<=t&&Math.abs(l1-l2)<=t;
    $('measure-result').textContent=`你报告的五个长度${ok?'在声明误差限内与设计及彼此吻合':'尚有偏差，请检查打印比例、细绳贴边、剪线或接缝，修订后重测'}。纸上目标：曲边≈${fmt(targetC)}mm，两直边各≈${fmt(targetL)}mm。\n${$('self').checked?'已附本人准则自核自述。':'尚未勾选本人准则自核。'}这些数字比较不能证明实物已制作或测量真实发生。`;
  });
}());
