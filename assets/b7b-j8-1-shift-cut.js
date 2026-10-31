/* j8-1 only: student records and finite edge-parallel paper tasks; no persistence. */
(() => {
  'use strict';
  const root = document.getElementById('j8-shift-cut');
  if (!root || document.body.dataset.sec !== 'j8-1' || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = id => root.querySelector('#sc-' + id);
  const strings = [
    ['0.0441', '4.41', '441', '44100'],
    ['0.1156', '11.56', '1156', '115600'],
    ['0.0025', '0.25', '25', '2500'],
    ['0.06', '6', '600', '60000']
  ];
  const paper = [
    ['5', '9', '36'], ['6', '8', '36'], ['4.9', '6', '24'],
    ['4.898', '6', '24'], ['4.899', '6', '24']
  ];
  const input = (id, label) => `<label>${label}<textarea id="sc-${id}" rows="1" inputmode="decimal" autocomplete="off" maxlength="40"></textarea></label>`;
  const options = labels => '<option value="">请自己选择</option>' + labels.map((s,i) => `<option value="${i}">${s}</option>`).join('');
  root.innerHTML = `
    <h3>先记录，再提出小数点猜想</h3>
    <p>任选一串和观察顺序。结果先空着：用上方已有的√键或自己的计算器，逐行记录。这里复用原计算器的八位小数屏幕；有限小数可省尾零，开不尽时按屏幕八位四舍五入记录。显示有限，不能把近似小数当成精确值。</p>
    <p class="small">本区数值用普通十进制小数，至多8位小数，绝对值不超过1000000；不带单位、分数、算式或科学记数。这个填写格式只用于新记录区，上方原计算器的范围和写法不变。</p>
    <form id="sc-first-form" novalidate>
      <label>第一串<select id="sc-first-case">${options(['数串甲','数串乙','数串丙','数串丁'])}</select></label>
      <label>观察顺序<select id="sc-order"><option value="">请自己选择</option><option value="right">从小数到大数</option><option value="left">从大数到小数</option></select></label>
      <div id="sc-first-table"></div>
      <button class="btn" type="submit">核对第一串记录</button>
      <p id="sc-first-status" role="status" aria-live="polite"></p>
      <fieldset id="sc-guess-fields" disabled style="min-width:0"><legend>先记我的猜想</legend>
        ${input('rad-factor','后一行被开方数是前一行的多少倍？（用小数）')}
        ${input('root-factor','我猜后一行算术平方根是前一行的多少倍？（用小数）')}
        <label>两者小数点的移动方向<select id="sc-guess-direction"><option value="">先作判断</option><option value="same">同向</option><option value="opposite">反向</option></select></label>
        <label>我的小数点规律猜想与依据<textarea id="sc-guess" rows="3" maxlength="1200"></textarea></label>
        <button class="btn" type="button" id="sc-save-guess">先存猜想，再换一串验证</button>
      </fieldset>
    </form>
    <form id="sc-second-form" novalidate hidden>
      <p id="sc-guess-summary"></p>
      <label>另一串（保持刚才的观察顺序）<select id="sc-second-case">${options(['数串甲','数串乙','数串丙','数串丁'])}</select></label>
      <div id="sc-second-table"></div>
      <button class="btn" type="submit">用另一串检验所记猜想</button>
      <p id="sc-second-status" role="status" aria-live="polite"></p>
    </form>
    <output id="sc-tool-screen" aria-live="polite">复用计算器：先选一串，再点某行的√键。</output>
    <p class="small">核对成功只说明这些记录符合本次数串；有限观察不是一般证明。自核文字要说清被开方数与根各移动几位、是否同向，不能只写“变大”。开不尽时，八位显示的末几位不一定能直接按倍数相乘重合。</p>
    <button class="btn ghost" type="button" id="sc-shift-reset">清空两串与猜想</button>
    <h3>裁纸：面积够，还要逐边放得下</h3>
    <p>本台只从一张长方形纸裁一块正方形，<b>正方形四边分别平行于原纸的边</b>。纸边与目标面积均为正，长度统一cm、面积cm²；不讨论斜放、旋转套料、拼接或最优裁法。设目标边长为s，s是目标面积的算术平方根。</p>
    <form id="sc-cut-form" novalidate>
      <label>选一题<select id="sc-cut-case">${options(paper.map((p,i) => `纸${i+1}：${p[0]} cm × ${p[1]} cm，目标面积 ${p[2]} cm²`))}</select></label>
      <p id="sc-cut-given"></p>
      <button class="btn ghost" type="button" id="sc-cut-calc">用上方√键计算目标边长</button>
      ${input('estimate','我的边长估计（四舍五入到千分位，cm）')}
      <p>估计帮助了解大小；接近纸边时不能把估计值当精确边长。请把两条正纸边分别平方，与目标面积比较，再判断s与每条纸边的关系。只比较两种面积不够。</p>
      ${input('width-square','我算的纸边一的平方（cm²，精确值）')}
      ${input('length-square','我算的纸边二的平方（cm²，精确值）')}
      <label>s与纸边一<select id="sc-width-relation"><option value="">先比较</option><option value="less">s小于纸边一</option><option value="equal">s等于纸边一</option><option value="greater">s大于纸边一</option></select></label>
      <label>s与纸边二<select id="sc-length-relation"><option value="">先比较</option><option value="less">s小于纸边二</option><option value="equal">s等于纸边二</option><option value="greater">s大于纸边二</option></select></label>
      <label>按本题限定裁法<select id="sc-fit"><option value="">先判断</option><option value="yes">能裁出</option><option value="no">不能裁出</option></select></label>
      <label>我的逐边依据：比较了哪些平方？哪条边够或不够？<textarea id="sc-cut-reason" rows="3" maxlength="1200"></textarea></label>
      <button class="btn" type="submit">核对估计和逐边判断</button>
      <button class="btn ghost" type="reset">清空裁纸任务</button>
      <p id="sc-cut-status" role="status" aria-live="polite"></p>
      <p id="sc-cut-reference" hidden></p>
    </form>`;
  function decimal(text) {
    const s = text.trim();
    if (!/^[+-]?(?:\d+(?:\.\d{1,8})?|\.\d{1,8})$/.test(s) || s.length > 40) return null;
    const negative = s[0] === '-', p = s.replace(/^[+-]/,'').split('.');
    const q = {n:(negative ? -1n : 1n)*BigInt((p[0] || '0')+(p[1] || '')),d:10n**BigInt((p[1] || '').length)};
    return (q.n < 0n ? -q.n : q.n) <= 1000000n*q.d ? q : null;
  }
  const equal = (a,b) => !!a && !!b && a.n*b.d === b.n*a.d;
  const square = a => ({n:a.n*a.n,d:a.d*a.d});
  const divide = (a,b) => ({n:a.n*b.d,d:a.d*b.n});
  const compare = (a,b) => { const v=a.n*b.d-b.n*a.d; return v<0n ? -1 : v>0n ? 1 : 0; };
  const relation = (a,b) => ['less','equal','greater'][compare(a,b)+1];
  // Candidate interval for exact half-up rounding, not a floating tolerance.
  function rootRecord(answer, a, places) {
    const q = decimal(answer), scale = 10n**BigInt(places);
    if (!q || q.n <= 0n || q.n*scale % q.d !== 0n) return false;
    const k=q.n*scale/q.d, target=4n*a.n*scale*scale;
    return (2n*k-1n)**2n*a.d <= target && target < (2n*k+1n)**2n*a.d;
  }
  function say(id,text,state='notice') { $(id).textContent=text; $(id).dataset.state=state; }
  function clearStatus(id) { $(id).textContent=''; delete $(id).dataset.state; }
  let firstOK=false, saved=null;
  function clearSecond() { $('second-table').replaceChildren(); $('second-case').value=''; clearStatus('second-status'); $('guess-summary').textContent=''; $('second-form').hidden=true; saved=null; }
  function clearFirst() { firstOK=false; $('guess-fields').disabled=true; clearStatus('first-status'); clearSecond(); }
  function values(which) {
    const raw=$(which+'-case').value;
    if(raw==='' || $('order').value==='') return [];
    const row=strings[Number(raw)].slice(); return $('order').value==='left' ? row.reverse() : row;
  }
  function renderTable(which) {
    const box=$(which+'-table'), items=values(which); box.replaceChildren();
    items.forEach((a,i) => {
      const row=document.createElement('div');row.className='root-row';
      row.innerHTML=`<label>√(${a}) 的八位屏幕记录<textarea data-sc-answer rows="1" autocomplete="off" inputmode="decimal" maxlength="40"></textarea></label><button class="btn ghost" type="button" data-sc-calc="${a}">用现有√键算此行</button>`;
      box.appendChild(row);
    });
  }
  function useCalculator(a) {
    const input=document.getElementById('root-a'), key=document.getElementById('root-sqrt');
    if(!input || !key) return say('tool-screen','上方原计算器尚未就绪，请使用自己的计算器记录。');
    input.value=a;input.dispatchEvent(new Event('input',{bubbles:true}));key.click();
    say('tool-screen','复用上方√键，a='+a+'；'+document.getElementById('root-screen').textContent);
  }
  root.addEventListener('click',e=>{const b=e.target.closest('[data-sc-calc]');if(b) useCalculator(b.dataset.scCalc);});
  ['first-case','order'].forEach(id=>$(id).addEventListener('change',()=>{clearFirst();renderTable('first');}));
  $('first-table').addEventListener('input',clearFirst);
  function tableOK(which) {
    const items=values(which), answers=[...$(which+'-table').querySelectorAll('[data-sc-answer]')];
    return items.length===4 && answers.length===4 && answers.every((e,i)=>rootRecord(e.value,decimal(items[i]),8));
  }
  $('first-form').onsubmit=e=>{e.preventDefault();clearFirst();if(!tableOK('first'))return say('first-status','先选数串和顺序，并核对四行非负屏幕记录；按原八位屏幕取值，不直接截位。','retry');firstOK=true;$('guess-fields').disabled=false;say('first-status','第一串记录相符。先写可检验的倍数、方向和文字猜想，再换另一串。','recorded');};
  function editGuess() { clearSecond(); if(firstOK) say('first-status','猜想已编辑；请重新先存猜想，再换串验证。'); else clearStatus('first-status'); }
  ['rad-factor','root-factor','guess-direction','guess'].forEach(id=>$(id).addEventListener('input',editGuess));
  $('guess-direction').addEventListener('change',editGuess);
  $('save-guess').onclick=()=>{
    const a=decimal($('rad-factor').value),r=decimal($('root-factor').value),direction=$('guess-direction').value;
    if(!firstOK || !a || !r || a.n<=0n || r.n<=0n || !direction || !$('guess').value.trim())return say('first-status','先核第一串，填正的倍数、方向和自己的猜想；此处只记录，暂不判一般规律。','retry');
    clearSecond();saved={first:$('first-case').value,a,r,direction,text:$('guess').value};
    $('second-form').hidden=false;$('guess-summary').textContent='待验证的猜想：'+saved.text+'（只记录，尚未认证一般规律。）';
    say('first-status','猜想已先记录。请选择另一串并重新填写，保留相同观察顺序。','hypothesis');
  };
  $('second-case').addEventListener('change',()=>{clearStatus('second-status');renderTable('second');});
  $('second-table').addEventListener('input',()=>{clearStatus('second-status');});
  $('second-form').onsubmit=e=>{
    e.preventDefault();clearStatus('second-status');
    if(!saved || $('second-case').value==='' || $('second-case').value===saved.first)return say('second-status','须先存猜想，再选不同的数串作新记录。','retry');
    if(!tableOK('second'))return say('second-status','另一串的四行屏幕记录还需核对；不自动填答案。','retry');
    const supported=['first','second'].every(which=>{const a=values(which).map(decimal);return a.slice(1).every((v,i)=>equal(divide(v,a[i]),saved.a) && equal(square(saved.r),divide(v,a[i])));}) && saved.direction==='same';
    say('second-status',supported?'两串数值记录支持这次所选的倍数和同向关系。请按准则自核文字中的移动位数；有限观察不是一般证明，也不认证实际按键经历。':'另一串已记录；所写倍数或方向与这些数值关系不符。请回看两串，修改猜想后重新换串验证；文字本身未作自动判分。',supported?'supported':'revise');
  };
  $('shift-reset').onclick=()=>{ $('first-form').reset();$('second-form').reset();clearFirst();$('first-table').replaceChildren();$('guess-summary').textContent='';say('tool-screen','复用计算器：先选一串，再点某行的√键。'); };
  function clearCut() { clearStatus('cut-status');$('cut-reference').hidden=true;$('cut-reference').textContent=''; }
  $('cut-form').addEventListener('input',clearCut);
  $('cut-form').addEventListener('change',clearCut);
  $('cut-case').addEventListener('change',()=>{
    ['estimate','width-square','length-square','cut-reason'].forEach(id=>$(id).value='');
    ['width-relation','length-relation','fit'].forEach(id=>$(id).value='');
    const c=paper[Number($('cut-case').value)];$('cut-given').textContent=$('cut-case').value===''?'':`纸的两条边为${c[0]} cm和${c[1]} cm；目标正方形面积${c[2]} cm²。`;
  });
  $('cut-calc').onclick=()=>{if($('cut-case').value==='')return say('cut-status','先选一题。','retry');useCalculator(paper[Number($('cut-case').value)][2]);};
  $('cut-form').onsubmit=e=>{
    e.preventDefault();clearCut();if($('cut-case').value==='')return say('cut-status','先选一题，再逐项填写。','retry');
    const c=paper[Number($('cut-case').value)].map(decimal),[w,l,a]=c,ws=square(w),ls=square(l),wr=relation(a,ws),lr=relation(a,ls),fit=compare(a,ws)<=0&&compare(a,ls)<=0;
    const complete=decimal($('estimate').value)&&decimal($('width-square').value)&&decimal($('length-square').value)&&$('width-relation').value&&$('length-relation').value&&$('fit').value&&$('cut-reason').value.trim();
    if(!complete)return say('cut-status','先填估计、两平方、两条边的关系、裁法判断和自己的逐边依据。','retry');
    const ok=rootRecord($('estimate').value,a,3)&&equal(decimal($('width-square').value),ws)&&equal(decimal($('length-square').value),ls)&&$('width-relation').value===wr&&$('length-relation').value===lr&&$('fit').value===(fit?'yes':'no');
    say('cut-status',ok?'本题估计、两平方和逐边判断相符。文字依据请按准则自核；不认证已实际裁纸。':'还不相符：估计须按千分位四舍五入；两平方与逐边关系必须用精确值，不能只凭面积或把近似边长当等号。请修改重试。',ok?'matched':'retry');
    $('cut-reference').textContent='自核：s非负，两纸边为正，可用目标面积与两纸边各自的平方比较s。只有两条纸边都不小于s才按本限定裁法放得下；等号允许。若一边不足，即使原纸面积较大也不能裁出。文字需逐边写依据，有限题不代表斜放或其它裁法的结论。';$('cut-reference').hidden=false;
  };
  $('cut-form').addEventListener('reset',()=>{clearCut();$('cut-given').textContent='';});
})();
