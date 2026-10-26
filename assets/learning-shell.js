(function () {
  'use strict';
  var D=window.PeiyuLearningData, S=window.PeiyuLearningState, esc=D.escape;
  var page=document.body.dataset.learningPage || (document.body.dataset.sec?'courses':'resources');
  var nav=[['home','index.html','首页'],['courses','courses.html','课程'],['knowledge','knowledge.html','知识库'],['practice','practice.html','练习'],['record','learning.html','我的学习']];
  function currentContext(){var sec=document.body.dataset.sec;if(!D.lesson(sec))return D.context();var steps=Array.from(document.querySelectorAll('section.step')),step=steps.findIndex(function(s){return s.classList.contains('on');})+1;var q=document.activeElement&&document.activeElement.closest('.predict[data-id]');var saved=new URLSearchParams(location.search).get('focus');if(!q&&saved)q=Array.from(document.querySelectorAll('.predict[data-id]')).find(function(n){return n.dataset.id===saved;});if(q&&q.closest('section.step')!==steps[step-1])q=null;return {from:sec,step:step||1,question:q?q.dataset.id:''};}
  function contextualHref(path){return D.withContext(path,currentContext());}
  function navHTML() { return nav.map(function(n){return '<a class="hci-link" href="'+esc(n[0]==='knowledge'||n[0]==='practice'?contextualHref(n[1]):D.url(n[1]))+'"'+(page===n[0]?' aria-current="page"':'')+'>'+n[2]+'</a>';}).join(''); }
  function installNav() {
    var header=document.querySelector('header.top,header.lf-top'); if(!header)return;
    var n=header.querySelector('.hci-nav,.lf-nav');
    if(!n){n=document.createElement('nav');header.appendChild(n);}
    n.className='hci-nav lf-nav';n.setAttribute('aria-label','主要导航');n.innerHTML=navHTML();
    header.querySelectorAll('a.home,a.rec,a.wk-topbtn:not(.hci-link)').forEach(function(a){a.remove();});
    if(!header.querySelector('[data-lf-theme]')) {
      var b=document.createElement('button');b.type='button';b.className='lf-theme';b.dataset.lfTheme='';
      b.setAttribute('role','switch');b.setAttribute('aria-label','深色模式');
      b.innerHTML='<span class="lf-theme-icon lf-theme-sun" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"/></svg></span><span class="lf-theme-icon lf-theme-moon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z"/></svg></span>';
      header.insertBefore(b,n);
      function syncTheme(){var dark=getComputedStyle(document.documentElement).colorScheme==='dark';b.setAttribute('aria-checked',String(dark));b.title=dark?'当前深色，切换为浅色':'当前浅色，切换为深色';}
      b.addEventListener('click',function(){var theme=b.getAttribute('aria-checked')==='true'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('peiyu.hs.theme',theme);}catch(e){}syncTheme();});
      new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTheme);
      window.addEventListener('storage',function(e){if(e.key!=='peiyu.hs.theme'&&e.key!==null)return;if(e.newValue==='dark'||e.newValue==='light')document.documentElement.dataset.theme=e.newValue;else document.documentElement.removeAttribute('data-theme');syncTheme();});
      syncTheme();
    }
  }
  function searchUI(host, data) {
    host.innerHTML='<form role="search"><input type="search" aria-label="搜索课程、知识点、方法和实验" placeholder="搜索知识点、课程或方法，如：补集" autocomplete="off"><button type="submit">搜索</button></form><div class="lf-search-results" hidden aria-live="polite"></div>';
    var input=host.querySelector('input'),results=host.querySelector('.lf-search-results');
    function search(){var q=input.value.trim().toLowerCase();results.hidden=!q;if(!q){results.replaceChildren();return;}
      var matches=data.index.search.filter(function(x){return [x.title,x.subtitle].concat(x.terms||[]).join(' ').toLowerCase().includes(q);});
      var groups=[['course','课程'],['point','知识点'],['method','方法'],['experiment','实验']];
      results.innerHTML=matches.length?groups.map(function(g){var list=matches.filter(function(x){return x.kind===g[0];});return list.length?'<h3>'+g[1]+' · '+list.length+'</h3>'+list.slice(0,8).map(function(x){return '<a href="'+esc(x.kind==='course'?D.url(x.href):contextualHref(x.href))+'">'+esc(x.title)+'<span>'+esc(x.subtitle||g[1])+'</span></a>';}).join(''):'';}).join(''):'<p>暂时没有找到。试试更短的词，或到课程目录按章节查找。</p>';
    }
    host.querySelector('form').addEventListener('submit',function(e){e.preventDefault();search();});input.addEventListener('input',search);
    input.addEventListener('keydown',function(e){if(e.key==='Escape'){results.hidden=true;input.focus();}});
  }
  function ensureSearch(){if(document.querySelector('[data-learning-search]'))return;var top=document.querySelector('header.top');if(!top)return;var details=document.createElement('details');details.className='lf-global-search';details.innerHTML='<summary>搜索全站</summary><div class="lf-search" data-learning-search></div>';top.after(details);}
  function topic(title,domain,section,desc){return '<article class="lf-topic"><h3>'+title+'</h3><p>'+desc+'</p><div><a href="'+D.url('lessons/'+section+'.html#step1')+'">开始课程</a><a href="'+D.url('knowledge.html?domain='+domain)+'">查看知识树</a></div></article>';}
  function home(data) {
    var host=document.querySelector('#learning-app'), snap=S.snapshot(), resume=snap.resume;
    var sec=resume&&(resume.sectionId||resume.section), l=sec&&D.lesson(sec), step=resume&&resume.step||1;
    host.innerHTML='<p class="lf-eyebrow">培玉高中数学</p><h1 class="lf-heading">'+(l?'接着上次，往前学一步。':'从一个问题开始，把数学想明白。')+'</h1><p class="lf-intro">顺着课程理解概念，遇到不清楚的地方查知识树，再用一道题检查自己的想法。</p><div class="lf-start"><section class="lf-current"><p class="lf-eyebrow">'+(l?'继续学习':'从这里开始')+'</p><h2>'+esc(l?l.title:'集合的概念')+'</h2><p class="lf-note">'+(l?'上次停在第 '+step+' 步。你可以继续，也可以先复习一道题。':'先分清“哪些对象放在一起”，再认识集合与元素。')+'</p><div class="lf-actions"><a class="lf-button" href="'+esc(l?D.returnHref({from:l.id,step:step,question:resume.questionId||''}):D.url('lessons/b1-1-1.html#step1'))+'">'+(l?'继续这一节':'开始集合第一课')+'</a><a class="lf-button secondary" href="'+D.url('courses.html')+'">选择其他课程</a></div></section><aside class="lf-next"><h2>学到哪里不清楚，就从哪里接上</h2><ol><li>在课程里想一想、试一试。</li><li>查知识卡，把使用条件看清楚。</li><li>答题后回看原因，隔一段时间再检验。</li></ol><a href="'+D.url('learning.html')+'">查看我的作答与复习记录</a></aside></div><section><h2>先看这三个部分</h2><div class="lf-topic-list">'+topic('集合与逻辑','sets','b1-1-1','元素、集合关系、运算与条件判断。')+topic('函数','functions','b1-3-1','定义域、对应关系、性质与图象。')+topic('概率统计','probability-statistics','b2-9-1','从数据到结论，从随机现象到概率。')+'</div><p><a href="'+D.url('knowledge.html')+'">打开完整知识库</a>　<a href="'+D.url('practice.html')+'">选一个知识点练习</a></p></section>'+tools();
  }
  function tools(){var t=[['wiki.html','lf-tool-wiki','概念与方法卡','做题卡壳时速查：定义、公式、解题套路和易错红线。','<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="12" height="15" rx="2"/><path d="M8 7.5h4M8 11h4M8 14.5h2.5"/><path d="M19 7v12.5a1.5 1.5 0 0 1-1.5 1.5H8"/></svg>'],['textbook-map.html','lf-tool-map','教材路线图','按人教 A 版的册、章、节排好，看清每一节在全书的位置。','<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 6h4a4 4 0 0 1 4 4v0M16 14v0a4 4 0 0 1-4 4H8"/></svg>'],['anatomy.html','lf-tool-lab','数学实验台','拖动滑块看立体图形怎么变，每节配一份可打印的 A4 讲义。','<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>']];return '<section class="lf-tools" aria-labelledby="lf-tools-title"><h2 id="lf-tools-title">学习工具</h2><div class="lf-tool-list">'+t.map(function(x){return '<a class="lf-tool '+x[1]+'" href="'+D.url(x[0])+'"><span class="lf-tool-icon">'+x[4]+'</span><span class="lf-tool-body"><strong>'+x[2]+'</strong><span>'+x[3]+'</span></span><span class="lf-tool-go" aria-hidden="true">→</span></a>';}).join('')+'</div></section>';}
  function resources(){return '<nav class="lf-resources" aria-label="补充学习资源"><a href="'+D.url('wiki.html')+'">概念与方法卡</a><a href="'+D.url('textbook-map.html')+'">教材路线图</a><a href="'+D.url('anatomy.html')+'">数学实验台</a></nav>';}
  function courses(data){
    var host=document.querySelector('#learning-app'), books=[];data.index.lessons.forEach(function(l){if(!books.some(function(b){return b.id===l.bookId;}))books.push({id:l.bookId,title:l.bookTitle});});
    var selected=new URLSearchParams(location.search).get('book');if(!books.some(function(b){return b.id===selected;}))selected=books[0].id;
    function draw(book){selected=book;var lessons=data.index.lessons.filter(function(l){return l.bookId===book;}), chapters=[];lessons.forEach(function(l){if(!chapters.includes(l.chapterId))chapters.push(l.chapterId);});
      host.innerHTML='<h1 class="lf-heading">按课程，一步一步学</h1><p class="lf-intro">每节都可以从原来的位置继续，也可以先查知识点或直接练习。</p><div class="lf-courses"><nav class="lf-book-nav" aria-label="教材册别">'+books.map(function(b){return '<a href="?book='+b.id+'" data-book="'+b.id+'"'+(b.id===book?' aria-current="page"':'')+'>'+esc(b.title)+'</a>';}).join('')+'</nav><div>'+chapters.map(function(ch){var ls=lessons.filter(function(l){return l.chapterId===ch;});return '<section class="lf-chapter"><h2>'+esc(ls[0].chapterTitle)+'</h2>'+ls.map(function(l){return '<div class="lf-lesson-row"><a href="'+D.url('lessons/'+l.id+'.html')+'">'+esc(l.title)+'<p>'+l.pointIds.length+' 个关联知识点</p></a><div class="lf-lesson-actions"><a href="'+D.url('knowledge.html?section='+l.id)+'">知识点</a><a href="'+D.url('practice.html?section='+l.id)+'">练习</a></div></div>';}).join('')+'</section>';}).join('')+'</div></div>'+resources();
      host.querySelectorAll('[data-book]').forEach(function(a){a.addEventListener('click',function(e){if(e.ctrlKey||e.metaKey)return;e.preventDefault();history.replaceState(null,'','?book='+a.dataset.book);draw(a.dataset.book);});});
    }draw(selected);
  }
  // Knowledge core retains its compatibility store; new evidence keeps the full answer history.
  function knowledgeEvidence(data) {
    var seen=new Set();
    document.addEventListener('submit',function(e){var form=e.target.closest('[data-kquiz]');if(!form)return;var article=form.closest('[data-knowledge-id]'),p=article&&D.point(article.dataset.knowledgeId),choice=form.querySelector('input:checked'),submit=form.querySelector('[data-kquiz-submit]');if(!p||!choice||choice.disabled||!submit||submit.hidden||submit.disabled)return;
      var meta=data.index.points.find(function(x){return x.id===p.id;}), identity={source:'knowledge',pointId:p.id,sectionId:D.context()?.from||p.first_section,questionId:p.diagnostic.id,questionType:'diagnostic',contentVersion:meta.diagnosticVersion};
      S.record(Object.assign({},identity,{kind:'answer',choice:choice.value,correct:choice.value===p.diagnostic.correct}));S.record(Object.assign({},identity,{kind:'feedback'}));
    },true);
    function views(){document.querySelectorAll('[data-knowledge-id]').forEach(function(a){var id=a.dataset.knowledgeId;if(seen.has(id)||!D.point(id))return;seen.add(id);var p=D.point(id),meta=data.index.points.find(function(x){return x.id===id;});S.record({kind:'view',source:'knowledge',pointId:id,sectionId:D.context()?.from||p.first_section});var reset=a.querySelector('[data-kquiz-reset]'),disabled=a.querySelector('input[type=radio]:disabled');if(reset&&!reset.hidden&&disabled)S.record({kind:'feedback',source:'knowledge',pointId:id,sectionId:D.context()?.from||p.first_section,questionId:p.diagnostic.id,questionType:'diagnostic',contentVersion:meta.diagnosticVersion});});}
    new MutationObserver(views).observe(document.body,{childList:true,subtree:true});views();
  }
  try{var theme=localStorage.getItem('peiyu.hs.theme');if(theme==='dark'||theme==='light')document.documentElement.dataset.theme=theme;}catch(e){}
  document.querySelectorAll('.lf-skip').forEach(function(a){a.addEventListener('click',function(e){var target=document.getElementById('learning-app');if(target){e.preventDefault();target.focus();target.scrollIntoView({block:'start'});}});});
  installNav();window.addEventListener('load',installNav);
  function refreshNavTarget(event){var a=event.target.closest&&event.target.closest('.lf-nav a');if(!a)return;var name=new URL(a.href).pathname.split('/').pop();if(name==='knowledge.html'||name==='practice.html')a.href=contextualHref(name);}
  ['pointerdown','focusin','click','auxclick','contextmenu'].forEach(function(type){document.addEventListener(type,refreshNavTarget,true);});
  function storageNotice(snapshot){var warning=document.querySelector('.lf-memory-warning');if(!snapshot.storage.memoryOnly){if(warning)warning.hidden=true;return;}if(!warning){warning=document.createElement('p');warning.className='lf-memory-warning';warning.setAttribute('role','status');var top=document.querySelector('header');if(top)top.after(warning);else document.body.prepend(warning);}warning.hidden=false;warning.textContent='浏览器暂时无法保存新记录。本页仍可练习，但刷新或离开后，本次新记录可能丢失。';}
  D.load().then(function(data){storageNotice(S.load());S.subscribe(storageNotice);installNav();ensureSearch();document.addEventListener('step',function(){installNav();});document.querySelectorAll('[data-learning-search]').forEach(function(h){searchUI(h,data);});if(page==='home')home(data);if(page==='courses'&&!document.body.dataset.sec)courses(data);knowledgeEvidence(data);}).catch(function(e){var h=document.querySelector('#learning-app');if(h){h.innerHTML='<p role="alert">'+esc(e.message)+'</p><p><a href="'+D.url('lessons/b1-1-1.html')+'">先打开集合课程</a>，或刷新后重试。</p>';}});
})();
