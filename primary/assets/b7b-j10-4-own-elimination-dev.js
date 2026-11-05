/* Page-local finite equation families, exact rational steps, no persistence. */
(function () {
  'use strict';
  const root = document.getElementById('own-elimination');
  if (!document.body || document.body.dataset.sec !== 'j10-4' || !root || root.dataset.ready) return;
  root.dataset.ready = '1';

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
    const panel=input.closest('[data-phase]');
    if(panel) setPhase(Number(panel.dataset.phase));
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

  const $ = id => { const e = root.querySelector('#oe-' + id); if(e?.matches('input,select,textarea')) activeField = e; return e; }, names = ['x','y','z'], records = new Map(), comparisons = new Map();
  function abs(n) { return n < 0n ? -n : n; }
  function rat(n,d=1n) { if (!d) throw Error('分母不能为0。'); if(d<0n){n=-n;d=-d;}let a=abs(n),b=d;while(b){const t=a%b;a=b;b=t;}return{n:n/a,d:d/a}; }
  function num(raw) {const s=raw.trim();let m;if(!s||s.length>60)throw Error('先按说明填写精确数值。');if((m=/^([+-]?(?:0|[1-9]\d{0,5}))\s*\/\s*([1-9]\d{0,5})$/.exec(s)))return rat(BigInt(m[1]),BigInt(m[2]));if(!(m=/^([+-]?)(0|[1-9]\d{0,5})(?:\.(\d{1,6}))?$/.exec(s)))throw Error('这里不能读成一个数。填整数、小数或用 / 写的分数；不要加单位或算式。');const f=m[3]||'';return rat(BigInt((m[1]==='-'?'-':'')+m[2]+f),10n**BigInt(f.length));}
  function integer(id,bound) {const s=$(id).value.trim();if(!/^[+-]?(0|[1-9]\d?)$/.test(s))throw Error('这里填整数，前面可以加负号。');const n=Number(s);if(Math.abs(n)>bound)throw Error('本步骤倍数范围为−'+bound+'到'+bound+'。');return rat(BigInt(n));}
  const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d),mul=(a,b)=>rat(a.n*b.n,a.d*b.d),eq=(a,b)=>a.n===b.n&&a.d===b.d,show=a=>a.d===1n?String(a.n):a.n+'/'+a.d;
  const data={a:[[1,1,1,1],[2,-1,1,0],[1,2,-1,-3]],b:[[1,1,1,1],[2,-1,1,'9/2'],[1,2,-1,'-9/2']],c:[[1,1,0,1],[1,-1,1,3],[2,1,-1,3]],d:[[1,1,0,'1/2'],[1,-1,1,0],[2,1,-1,'-3/2']]};
  let current=null;
  const sourceNames={k1:'保留①',k2:'保留②',k3:'保留③',p12:'①与②',p13:'①与③',p23:'②与③'};
  function message(id,text,state) {$(id).textContent=text;if(state)$(id).dataset.state=state;else delete $(id).dataset.state;}
  function closeGuide() {$('guide').hidden=true;message('compare-feedback','');}
  function clearFeedback(){message('feedback','');closeGuide();}
  function equation(row){return row.slice(0,3).map((v,i)=>v.n?'('+show(v)+')'+names[i]:'').filter(Boolean).join(' + ')+' = '+show(row[3]);}
  function combine(a,b,u,v){return a.map((x,i)=>add(mul(u,x),mul(v,b[i])));}
  function expect(id,v,label){if(!eq(num($(id).value),v))throw Error(label+'与所写来源/倍数不一致，请逐项核算，符号与右边都不能漏。');}
  function renderRecords(){const all=records.get($('case').value)||new Map();$('records').replaceChildren();for(const r of all.values()){const p=document.createElement('p');p.className='small';p.textContent=r.text;$('records').append(p);}for(const id of ['first','second']){const old=$(id).value;$(id).replaceChildren(new Option('先选已保存草稿',''));for(const[e]of all)$(id).append(new Option('先消'+e+'的已核草稿',e));$(id).value=all.has(old)?old:'';}}
  for(let i=0;i<2;i++){const box=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=i?'关系⑤':'关系④';box.append(legend);const fields=document.createElement('div');fields.className='oe-fields';for(const[id,title]of [['source','来源'],['m','第一倍数 m'],['n','第二倍数 n'],['c0','新式x系数'],['c1','新式y系数'],['c2','新式z系数'],['c3','新式右边']]){const label=document.createElement('label');label.append(document.createTextNode(title));const input=document.createElement(id==='source'?'select':'input');input.id='oe-r'+i+'-'+id;if(id==='source'){input.append(new Option('先选来源',''));for(const[k,v]of Object.entries(sourceNames))input.append(new Option(v,k));}else{input.autocomplete='off';input.setAttribute('aria-describedby','oe-syntax');}label.append(input);fields.append(label);}box.append(fields);$('relations').append(box);}
  const savedWork=document.createElement('details');savedWork.className='more';
  const savedSummary=document.createElement('summary');savedSummary.textContent='回看已核草稿';
  $('records').previousElementSibling.before(savedWork);
  savedWork.append(savedSummary,$('records').previousElementSibling,$('records'));
  savedWork.append(savedWork.nextElementSibling);savedWork.hidden=true;
  const comparisonNote=$('comparison-record').nextElementSibling;
  inputHelp(comparisonNote);
  let phase = 0;
  const final = root.querySelector('[data-phase="3"]'), valuesBox = $('x').closest('.oe-fields');
  const backBox = document.createElement('div'); backBox.dataset.phase = '4';
  valuesBox.after(backBox);
  ['back0','back1','back2'].forEach(id => backBox.append($(id).closest('label')));
  backBox.append($('reason').closest('label')); final.after(backBox);
  const back = document.createElement('button'); back.type = 'button'; back.textContent = '返回上一步';
  $('work').append(back); back.onclick = () => setPhase(Math.max(0,phase-1));
  root.querySelectorAll('[id$="-m"],[id$="-n"]').forEach(e => e.closest('label').append(document.createTextNode('（−4至4）')));
  ['u','v'].forEach(id => $(id).closest('label').append(document.createTextNode('（−12至12）')));
  function setPhase(n) {
    phase=n; root.querySelectorAll('[data-phase]').forEach(e=>e.hidden=Number(e.dataset.phase)!==n);
    back.hidden=n===0; clearErrors();
  }
  function compareVisibility() {
    const all=records.get($('case').value)||new Map();
    $('compare').hidden=all.size<2;savedWork.hidden=all.size===0;comparisonNote.parentElement.hidden=all.size<2;
  }
  setPhase(0); compareVisibility();
  function selected(){const key=$('case').value;if(!Object.hasOwn(data,key))return null;return data[key].map(r=>r.map(v=>num(String(v))));}
  $('case').onchange=()=>{current=selected();$('work').reset();$('compare').reset();$('work').hidden=!current;$('equations').replaceChildren();if(current)current.forEach((r,i)=>{const p=document.createElement('p');p.textContent=['① ','② ','③ '][i]+equation(r);$('equations').append(p);});clearFeedback();setPhase(0);renderRecords();compareVisibility();const saved=comparisons.get($('case').value);$('comparison-record').textContent=saved?saved.text:'';if(saved)for(const id of ['first','second','comparison','peer','summary'])$(id).value=saved[id];};
  $('eliminate').onchange=()=>{const chosen=$('eliminate').value;$('work').reset();$('eliminate').value=chosen;clearFeedback();setPhase(0);};
  function relation(i,e){const src=$('r'+i+'-source').value,m=integer('r'+i+'-m',4),n=integer('r'+i+'-n',4);let row,used;
    if(/^k[123]$/.test(src)){const j=Number(src[1])-1;if(!m.n||n.n)throw Error('保留原式时第一倍数须非0，第二倍数写0。');if(current[j][e].n)throw Error('只能保留已经缺少本次所消未知数的原式。');row=current[j].map(v=>mul(m,v));used=[j];}
    else if(/^p(12|13|23)$/.test(src)){if(!m.n||!n.n)throw Error('两式组合的两个倍数都须非0；已缺元原式请选保留。');used=[Number(src[1])-1,Number(src[2])-1];row=combine(current[used[0]],current[used[1]],m,n);}
    else throw Error('先为两个关系选择来源。');
    if(row[e].n)throw Error('关系'+(i?'⑤':'④')+'没有消掉你所选的同一个未知数，请重选倍数。');if(row.slice(0,3).every(v=>!v.n))throw Error('这个关系未留下可求未知数的信息，请重选。');row.forEach((v,j)=>expect('r'+i+'-c'+j,v,'关系'+(i?'⑤':'④')+'的'+(j===3?'右边':names[j]+'系数')));return{src,m,n,row,used};}
  $('work').onsubmit=event=>{event.preventDefault();try{if(!current)throw Error('先选一道题。');const e=names.indexOf($('eliminate').value);if(e<0)throw Error('先选择第一次消去的未知数。');if(phase===0){setPhase(1);message('feedback','现在写两个都消去'+names[e]+'的关系。');return;}const one=relation(0,e),two=relation(1,e);if(one.src===two.src)throw Error('两关系不能重复同一对或同一保留式，要把三个原式的信息都用上。');if(new Set([...one.used,...two.used]).size!==3)throw Error('两个关系合起来须用上三个原方程，不能漏掉第三式。');
    if(phase===1){setPhase(2);message('feedback','两个关系通过。接着把它们合成只含一个未知数的式子。');return;}
    const u=integer('u',12),v=integer('v',12),t=names.indexOf($('target').value);if(!u.n&&!v.n)throw Error('继续消元的两倍数不能同时为0。');if(t<0||t===e)throw Error('最后选一个尚未消去的未知数来求值。');const last=combine(one.row,two.row,u,v);if(!last[t].n||last.slice(0,3).some((a,i)=>i!==t&&a.n)){activeField=$('u');throw Error('继续组合后须只剩所选的一个未知数，且它的系数非0。');}expect('h',last[t],'一元式系数H');expect('j',last[3],'一元式右边J');
    if(phase===2){setPhase(3);message('feedback','一元式通过。求出这个值，再回代求齐三个值。');return;}
    const values=names.map(n=>num($(n).value));if(!eq(mul(last[t],values[t]),last[3]))throw Error('所填未知数值不满足你的这一元式，请先解一元式再回代。');current.forEach((r,i)=>{const lhs=r.slice(0,3).reduce((a,b,j)=>add(a,mul(b,values[j])),rat(0n));if(!eq(lhs,r[3])){activeField=$('x');throw Error('这三个值代入原式'+['①','②','③'][i]+'还不相等，请回查求值与回代。');}});
    if(phase===3){setPhase(4);message('feedback','接着把三个值代入全部原式，逐式核对。');return;}
    const backs=current.map((r,i)=>{const lhs=r.slice(0,3).reduce((a,b,j)=>add(a,mul(b,values[j])),rat(0n));expect('back'+i,lhs,'代入原式'+['①','②','③'][i]+'的左边');if(!eq(lhs,r[3]))throw Error('三个值未同时满足原方程'+['①','②','③'][i]+'；须求齐并逐式回代。');return lhs;});const reason=$('reason').value.trim();if(!reason){activeField=$('reason');throw Error('请留下具体消元与回代顺序的理由；文字仅记录，不自动判真。');}
    const key=$('case').value,all=records.get(key)||new Map(),label=names[e],text='先消'+label+'：④ '+sourceNames[one.src]+'，倍数('+show(one.m)+','+show(one.n)+')，'+equation(one.row)+'；⑤ '+sourceNames[two.src]+'，倍数('+show(two.m)+','+show(two.n)+')，'+equation(two.row)+'；继续用('+show(u)+')④+('+show(v)+')⑤，得('+show(last[t])+')'+names[t]+'='+show(last[3])+'；解为{x='+show(values[0])+', y='+show(values[1])+', z='+show(values[2])+'}；三式代回左边依次'+backs.map(show).join('、')+'。我的理由：'+reason;all.set(label,{text});records.set(key,all);comparisons.delete(key);$('comparison-record').textContent='';renderRecords();compareVisibility();closeGuide();message('feedback','消元、求值和三式回代通过，草稿已保存。文字理由仍请自核。','saved');
  }catch(err){fieldError(activeField,err.message);message('feedback',err.message,'retry');}};
  $('work').addEventListener('input',clearFeedback);$('work').addEventListener('change',clearFeedback);
  $('compare').onsubmit=event=>{event.preventDefault();try{const all=records.get($('case').value),a=$('first').value,b=$('second').value;if(!all||!all.has(a)||!all.has(b)||a===b)throw Error('先在同一道题保存两份不同先消元的草稿，再分别选择。');if(['comparison','peer','summary'].some(id=>!$(id).value.trim()))throw Error('请写具体比较、同伴追问或尚未交流的计划，以及自己的总结。');const saved={first:a,second:b,comparison:$('comparison').value.trim(),peer:$('peer').value.trim(),summary:$('summary').value.trim()};saved.text='本题已保存的比较（文字未判真）：先消'+a+'与先消'+b+'；'+saved.comparison+'；同伴追问/计划：'+saved.peer+'；总结：'+saved.summary;comparisons.set($('case').value,saved);$('comparison-record').textContent=saved.text;$('guide').hidden=false;message('compare-feedback','已记录你对两份已核草稿的比较文字；仅开放自检，尚未判定解释正确，也未认证同伴交流。','selfcheck');}catch(err){fieldError(activeField,err.message);message('compare-feedback',err.message,'retry');}};
  $('compare').addEventListener('input',closeGuide);$('compare').addEventListener('change',closeGuide);
  $('reset').onclick=()=>{records.clear();comparisons.clear();$('comparison-record').textContent='';$('case').value='';current=null;$('work').reset();$('compare').reset();$('work').hidden=true;$('equations').replaceChildren();renderRecords();clearFeedback();setPhase(0);compareVisibility();};
})();
