/* j29-2 only: local practice; no ledger writes or proof certification. */
(function () {
  'use strict';
  function mount() {
    if (document.body.dataset.sec !== 'j29-2') return;
    const root = document.getElementById('j292-workshop');
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = '1';
    root.innerHTML = String.raw`
<h3>证明工作坊：先特殊，再用和、差化归</h3>
<p>先在纸上写理由，再核对。图形只帮助找关系，有限次测量不能证明一般定理。以下角均为普通角，圆周角在0°与180°之间；A、B、P是圆上互异点，O是圆心，PD是直径。Θ专指<b>不经过P的弧AB</b>的角度数，范围0°＜Θ＜360°；所对优弧时Θ大于180°，不能把它写成普通∠AOB。</p>
<div class="card" id="j292-angle">
<div class="entry-bar" role="group" aria-label="证明图形位置">
<button type="button" data-case="edge" aria-pressed="true">圆心在一边</button>
<button type="button" data-case="inside" aria-pressed="false">圆心在角内</button>
<button type="button" data-case="outside" aria-pressed="false">圆心在角外</button>
<button type="button" data-case="major" aria-pressed="false">角内：所对优弧</button></div>
<svg id="j292-angle-fig" viewBox="0 0 360 320" role="img" aria-label="圆周角证明辅助图"></svg>
<p id="j292-case-note"></p>
<form id="j292-chain"><p>把∠APB和Θ分别分解成图中较小的角，再填Θ是∠APB的几倍。封闭写法：三字母角名（不写∠），至多用一个+或-连接；只收大写ASCII字母，不删内部空白、不拼接词元。角的两端可倒写，加法可交换；减法保留次序。倍数只收整数。</p>
<label>∠APB的角式 <textarea rows="1" name="part" autocomplete="off" spellcheck="false"></textarea></label><br>
<label>Θ的角式 <textarea rows="1" name="whole" autocomplete="off" spellcheck="false"></textarea></label><br>
<label>倍数 <textarea rows="1" name="factor" inputmode="numeric" autocomplete="off"></textarea></label>
<p><button type="submit">核对这组三个关系</button> <button type="reset">清空重试</button></p>
<p class="result" role="status" id="j292-chain-result"></p></form>
<details class="more" id="j292-chain-help"><summary>写完再展开：逐类证明链</summary><div id="j292-chain-proof"></div></details>
<p><label>用自己的话补上每一步的依据（也可在纸上写）：<br><textarea id="j292-angle-writing" rows="3"></textarea></label></p>
<details class="more"><summary>自由证明自核准则</summary><p>①指出半径相等产生的等腰三角形；②特殊情形用外角定理，而不是反用待证的圆周角定理；③一般情形加直径，逐项写圆周角及对应弧角度的和或差，再代入特殊情形；④说明所对弧不含P。数值或角式核对通过不代表你的整段证明已获判定。请与同伴逐句互核理由。</p></details>
</div>
<div class="card" id="j292-diameter">
<h3>自己证明垂径定理，而不先引用它</h3>
<p>在纸上画圆O，画一条<b>非直径弦</b>AB及垂直于AB的直径CD，交AB于H，C、D分别在弦两侧。连OA、OB。先猜AH与BH、弧AC与弧BC、弧AD与弧BD的关系，再从已学的等腰三角形或全等性质给出证明。不要把待证结论当理由。</p>
<label>我的证明 <textarea rows="3" data-proof="diameter"></textarea></label>
<details class="more"><summary>展开核对证明链和边界</summary><p>OA=OB，故等腰△OAB的顶角到底边的高OH也是中线（也可用Rt△OHA与Rt△OHB的HL全等），得AH=BH。关于直线CD反射时，O、C、D固定，A与B互换，圆因到O距离不变而重合。因此不经过D的弧AC与弧BC互换、不经过C的弧AD与弧BD互换；两组对应弧分别相等。这没有用圆周角定理，也没有先用垂径定理。</p><p>自核：是否先证弦平分，再借圆的轴对称说明<b>两条</b>弧都平分？若AB本身是直径，H=O，上述两个直角三角形退化，应另用两条垂直直径的四个直角及对称性说明结论。反向“平分弦的直径垂直于弦”必须排除被平分的弦为直径；斜交的两条直径就是反例。文字仅供自核，不自动判证明正确。</p></details>
</div>
<div class="card" id="j292-cyclic">
<h3>由条件判四点共圆，再完成全等证明</h3>
<p>这里使用逆向判定：<b>凸四边形</b>一组对角互补，则四点共圆。它与“已经共圆则对角互补”方向相反，不能只把性质倒读当作证明。本活动将逆向判定作为给定工具。</p>
<p>原创任务：凸四边形ABCD满足∠ABC=68°、∠ADC=112°、AB=CD，对角线AC、BD相交于X。题设<b>没有</b>给出内接圆。先判定四点能否共圆，再证明△ABX≌△DCX。请画出非退化草图并写下“条件→共圆→角相等→全等依据”的完整链。</p>
<label>我的论证 <textarea rows="4" data-proof="cyclic"></textarea></label>
<details class="more"><summary>写完再核对完整应用</summary><p>68°+112°=180°，且ABCD凸，由给定的逆向判定知A、B、C、D共圆。X在两条对角线的内部，所以∠BAX=∠BAC，∠CDX=∠CDB；后两角同对不含各自顶点的弧BC，故∠BAX=∠CDX。同理，同弧AD给出∠ABX=∠DCX。又AB=DC，所以△ABX≌△DCX（ASA），对应为A↔D、B↔C、X↔X。不是用对角互补把两角直接判相等。</p><p>自核：逆向判定使用前有无四点互异、凸性与互补条件？共圆后是否逐对点出同弧？ASA的边是否为两个已知角的夹边？没有AB=CD时这里只能得到相等角，不能签全等。若只知68°与111°，不满足判定；非凸或三点共线不能照搬本题。自由文字只准则自核。</p></details>
<details class="more"><summary>再证明正向性质：不借逆向判定</summary><p>对已知内接的凸四边形ABCD，∠ABC和∠ADC所对的是AC的两条互补弧，弧角度和为360°。各圆周角等于各自所对弧角度的一半，故两角和180°。先由特殊及和差证明圆周角定理，再得正向性质；逆向判定是本活动额外给定的工具，两者不互相循环作依据。</p></details>
</div>
<div class="card" id="j292-chords">
<h3>两条平行弦：同侧与异侧都要画</h3>
<p>圆半径13 cm，两条<b>不同且平行</b>的弦AB、CD分别长10 cm、24 cm。连半径，作弦心距OH、OK；分别画两弦在圆心同侧、异侧的图。用勾股求两弦心距，再求两条平行弦之间的距离。先作答，图中暂不显示距离数值。</p>
<div class="entry-bar" role="group" aria-label="两弦位置"><button type="button" data-side="same" aria-pressed="true">同侧</button><button type="button" data-side="opposite" aria-pressed="false">异侧</button></div>
<svg id="j292-chord-fig" viewBox="0 0 360 320" role="img" aria-label="两条平行弦及弦心距"></svg>
<form id="j292-distance"><p>输入cm数值，允许十进小数，不收单位、指数式、空白或表达式；误差不超过0.000001 cm。</p>
<label>OH <textarea rows="1" name="d1" inputmode="decimal" autocomplete="off"></textarea></label><br>
<label>OK <textarea rows="1" name="d2" inputmode="decimal" autocomplete="off"></textarea></label><br>
<label>两弦距离 <textarea rows="1" name="gap" inputmode="decimal" autocomplete="off"></textarea></label>
<p><button type="submit">核对当前位置的计算</button> <button type="reset">清空重试</button></p><p class="result" role="status" id="j292-distance-result"></p></form>
<details class="more" id="j292-distance-help"><summary>作答后核对两解与水面迁移</summary><p>OH²=13²−(10/2)²=144，OH=12；OK²=13²−(24/2)²=25，OK=5。平行弦的公垂线经过圆心，同侧距离为|OH−OK|=7 cm，异侧为OH+OK=17 cm。两幅图的<b>弦长和半径全相同</b>，位置条件不同，才有两种距离；一条弦的滑块并不是双弦分类。</p><p>同圆水槽若水面弦长24 cm，圆心到水面5 cm。未指明水面在圆心上、下时，水深分别为13+5=18 cm、13−5=8 cm；明确位置后只留对应一解。半径r＞0，非零弦长0＜a≤2r，弦心距d=√(r²−(a/2)²)满足0≤d＜r；a=2r时d=0，是直径，两个位置重合，不应重复计解。a=0退化成点，不再是本任务的弦；a＞2r不存在。若两弦等长且同侧，则重合，须从“两条不同弦”中排除。</p></details>
</div>`;
    const styles = document.createElement('style');
    styles.textContent = '#j292-workshop input,#j292-workshop textarea{box-sizing:border-box;max-width:100%;background:var(--card);color:var(--fg);border:1px solid var(--line);border-radius:5px;padding:8px;font:inherit}#j292-workshop textarea{width:100%}#j292-workshop label{display:inline-block;max-width:100%;margin:5px 0}#j292-workshop svg{display:block;width:100%;max-width:400px;margin:auto}#j292-workshop .card{margin:18px 0;overflow-wrap:anywhere}#j292-workshop button{background:var(--card);color:var(--fg);border:1px solid var(--muted);padding:8px;min-height:44px;transition:none}#j292-workshop button[aria-pressed="true"]{background:var(--fg);color:var(--card);outline:2px solid var(--b);outline-offset:2px}';
    root.appendChild(styles);
    const $ = s => root.querySelector(s);
    function point(deg) { const a = deg * Math.PI / 180; return [180 + 112 * Math.cos(a), 156 + 112 * Math.sin(a)]; }
    function line(a, b, color) { return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${color}" stroke-width="2"/>`; }
    function dot(p, name, dx, dy) { return `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--fg)"/><text x="${p[0]+dx}" y="${p[1]+dy}" fill="var(--fg)" font-size="18">${name}</text>`; }
    const cases = {
      edge: {a:90,b:0,part:['OPB','BPO'],whole:['DOB','BOD','AOB','BOA'],note:'本图A与D重合，O在PA上。令x=∠OPB，找等腰三角形和外角。',proof:'OB=OP，所以∠OPB=∠PBO=x。OD是OP在O处的反向延长线，外角∠DOB=x+x=2x。A=D，故Θ=∠DOB=2∠APB。先证这一特殊情形，不引用待证定理。'},
      inside: {a:150,b:30,part:['APD+DPB','DPB+APD'],whole:['AOD+DOB','DOB+AOD'],note:'本图D在不含P的劣弧AB上，射线PD在∠APB内。分别找两边与直径组成的特殊情形。',proof:'令α=∠APD，β=∠DPB。由特殊情形∠AOD=2α、∠DOB=2β。∠APB=α+β，Θ=∠AOD+∠DOB=2α+2β=2∠APB。本图Θ小于180°，恰好也等于普通∠AOB。'},
      outside: {a:20,b:65,part:['APD-BPD'],whole:['AOD-BOD'],note:'O在角外；本图射线PB在PA与PD之间，OB在OA与OD之间。应取哪两个角的差？',proof:'令α=∠APD，β=∠BPD，本图α＞β。由特殊情形∠AOD=2α、∠BOD=2β。∠APB=α−β，Θ=∠AOD−∠BOD=2α−2β=2∠APB。交换A、B或镜像图时，先判断大小再写较大角减较小角，不能照抄负角。'},
      major: {a:235,b:305,part:['APD+DPB','DPB+APD'],whole:['AOD+DOB','DOB+AOD'],note:'O仍在角内，但P在劣弧AB上，所对的是经过D的优弧AB；这次Θ不是普通∠AOB。',proof:'令α=∠APD，β=∠DPB。同样由特殊情形∠AOD=2α、∠DOB=2β。∠APB=α+β，Θ=∠AOD+∠DOB=2(α+β)。本图所对优弧角度290°，圆周角145°，普通∠AOB却是70°；不能把普通角70°再除以2当作本图的圆周角。'}
    };
    let current = 'edge', side = 'same';
    function clear(form, result) { form.reset(); result.textContent = ''; }
    function drawCase() {
      const c = cases[current], o=[180,156], p=point(-90), d=point(90), a=point(c.a), b=point(c.b);
      $('#j292-angle-fig').innerHTML = `<circle cx="180" cy="156" r="112" fill="none" stroke="var(--fg)"/>` + line(p,d,'var(--muted)') + line(p,a,'var(--b)') + line(p,b,'var(--b)') + line(o,a,'var(--a)') + line(o,b,'var(--a)') + dot(p,'P',-6,-15) + dot(o,'O',-26,5) + dot(d,current==='edge'?'A=D':'D',-10,26) + (current==='edge'?'':dot(a,'A',c.a>90?-24:12,-8)) + dot(b,'B',12,15);
      $('#j292-case-note').textContent = c.note;
      $('#j292-chain-proof').textContent = c.proof;
      $('#j292-chain-help').open = false;
      $('#j292-angle-writing').value = '';
      clear($('#j292-chain'), $('#j292-chain-result'));
      root.querySelectorAll('[data-case]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.case===current)));
    }
    root.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click',()=>{current=b.dataset.case;drawCase();}));
    function canonical(expr) {
      const pieces = expr.split(/([+-])/);
      const angle = name => [name, name[2]+name[1]+name[0]].sort()[0];
      if (pieces.length === 1) return angle(pieces[0]);
      const terms = [angle(pieces[0]), angle(pieces[2])];
      if (pieces[1] === '+') terms.sort();
      return terms.join(pieces[1]);
    }
    const chain=$('#j292-chain'), chainResult=$('#j292-chain-result');
    chain.addEventListener('submit', e => {
      e.preventDefault(); const c=cases[current], part=chain.elements.part.value, whole=chain.elements.whole.value, factor=chain.elements.factor.value;
      if (!/^[A-Z]{3}([+-][A-Z]{3})?$/.test(part) || !/^[A-Z]{3}([+-][A-Z]{3})?$/.test(whole) || !/^[0-9]+$/.test(factor)) { chainResult.textContent='请按声明的封闭写法填写三项；空白或其他词元不作角式解释。'; return; }
      chainResult.textContent = c.part.some(v=>canonical(v)===canonical(part)) && c.whole.some(v=>canonical(v)===canonical(whole)) && Number(factor)===2 ? '这三个角关系吻合。请继续写等腰、外角与和差的理由；角式核对不等于证明判真。' : '关系尚未吻合：先判断射线次序，再检查和、差及对应的弧。可展开证明链逐项比对后重试。';
    });
    chain.addEventListener('input',()=>{chainResult.textContent='';});
    chain.addEventListener('reset',()=>{chainResult.textContent='';$('#j292-chain-help').open=false;});
    function drawChords() {
      const o=[180,156], k=8, y1=156+12*k, y2=156+(side==='same'?5:-5)*k;
      const a=[140,y1], b=[220,y1], c=[84,y2], d=[276,y2], h=[180,y1], q=[180,y2];
      $('#j292-chord-fig').innerHTML=`<circle cx="180" cy="156" r="104" fill="none" stroke="var(--fg)"/>`+line(a,b,'var(--b)')+line(c,d,'var(--a)')+line(o,h,'var(--muted)')+line(o,q,'var(--muted)')+line(o,a,'var(--muted)')+line(o,c,'var(--muted)')+dot(o,'O',12,-8)+dot(a,'A',-20,8)+dot(b,'B',12,8)+dot(c,'C',-22,5)+dot(d,'D',12,5)+dot(h,'H',-6,25)+dot(q,'K',12,-8);
      root.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.side===side)));
      clear($('#j292-distance'),$('#j292-distance-result'));$('#j292-distance-help').open=false;
    }
    root.querySelectorAll('[data-side]').forEach(b=>b.addEventListener('click',()=>{side=b.dataset.side;drawChords();}));
    const distance=$('#j292-distance'), distanceResult=$('#j292-distance-result');
    distance.addEventListener('submit',e=>{
      e.preventDefault(); const raw=['d1','d2','gap'].map(n=>distance.elements[n].value);
      if (raw.some(v=>! /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(v) || !Number.isFinite(Number(v)))) {distanceResult.textContent='请完整输入有限非负十进数，不收空白、单位或表达式。';return;}
      const expected=[12,5,side==='same'?7:17];
      distanceResult.textContent=raw.every((v,i)=>Math.abs(Number(v)-expected[i])<=0.000001)?'当前位置的三项计算吻合。请说明为什么取和或差，再切换位置重画核算；这只核对计算。':'尚未吻合：先用半弦长求弦心距，再沿公垂线判断两弦的位置。';
    });
    distance.addEventListener('input',()=>{distanceResult.textContent='';});
    distance.addEventListener('reset',()=>{distanceResult.textContent='';$('#j292-distance-help').open=false;});
    drawCase();drawChords();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
