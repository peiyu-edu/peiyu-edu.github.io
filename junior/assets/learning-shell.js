(function () {
  'use strict';
  var D=window.PeiyuLearningData, S=window.PeiyuLearningState, esc=D.escape;
  var page=document.body.dataset.learningPage || (document.body.dataset.sec?'courses':'resources');
  // 初中知识导航由已审核学习索引决定；小学继续使用课程导航。
  var PRIMARY=document.body.dataset.stage==='primary'||/^p[1-6][ab]-/.test(document.body.dataset.sec||'');
  var JUNIOR=document.body.dataset.stage==='junior'||/^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(document.body.dataset.sec||'');
  var NO_KNOWLEDGE=JUNIOR||PRIMARY;
  var nav=NO_KNOWLEDGE?[['home','index.html','首页'],['courses','courses.html','课程'],['practice','practice.html','练习'],['record','learning.html','我的学习']]
    :[['home','index.html','首页'],['courses','courses.html','课程'],['knowledge','knowledge.html','知识库'],['practice','practice.html','练习'],['record','learning.html','我的学习']];
  function currentContext(){var sec=document.body.dataset.sec;if(!D.lesson(sec))return D.context();var steps=Array.from(document.querySelectorAll('section.step')),step=steps.findIndex(function(s){return s.classList.contains('on');})+1;var q=document.activeElement&&document.activeElement.closest('.predict[data-id],.q[data-id]');var saved=new URLSearchParams(location.search).get('focus');if(!q&&saved)q=Array.from(document.querySelectorAll('.predict[data-id],.q[data-id]')).find(function(n){return n.dataset.id===saved;});if(q&&q.closest('section.step')!==steps[step-1])q=null;return {from:sec,step:step||1,question:q?q.dataset.id:''};}
  function contextualHref(path){return D.withContext(path,currentContext());}
  function navHTML() { return nav.map(function(n){return '<a class="hci-link" href="'+esc(!NO_KNOWLEDGE&&(n[0]==='knowledge'||n[0]==='practice')?contextualHref(n[1]):D.url(n[1]))+'"'+(page===n[0]?' aria-current="page"':'')+'>'+n[2]+'</a>';}).join(''); }
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
    host.innerHTML='<form role="search"><input type="search" aria-label="搜索课程、知识点、方法和实验" placeholder="'+(PRIMARY?'搜索课程，如：分数、乘法、圆':JUNIOR?'搜索课程，如：负数、方程':'搜索知识点、课程或方法，如：补集')+'" autocomplete="off"><button type="submit">搜索</button></form><div class="lf-search-results" hidden aria-live="polite"></div>';
    var input=host.querySelector('input'),results=host.querySelector('.lf-search-results');
    function search(){var q=input.value.trim().toLowerCase();results.hidden=!q;if(!q){results.replaceChildren();return;}
      var matches=data.index.search.filter(function(x){var ctx=currentContext();if(JUNIOR&&x.kind==='point'&&ctx&&ctx.from&&window.PeiyuKnowledge&&!window.PeiyuKnowledge.availableInSection(x.id,ctx.from))return false;return [x.title,x.subtitle].concat(x.terms||[]).join(' ').toLowerCase().includes(q);});
      var groups=[['course','课程'],['point','知识点'],['method','方法'],['experiment','实验']];
      results.innerHTML=matches.length?groups.map(function(g){var list=matches.filter(function(x){return x.kind===g[0];});return list.length?'<h3>'+g[1]+' · '+list.length+'</h3>'+list.slice(0,8).map(function(x){return '<a href="'+esc(x.kind==='course'?D.url(x.href):contextualHref(x.href))+'">'+esc(x.title)+'<span>'+esc(x.subtitle||g[1])+'</span></a>';}).join(''):'';}).join(''):'<p>暂时没有找到。试试更短的词，或到课程目录按章节查找。</p>';
    }
    host.querySelector('form').addEventListener('submit',function(e){e.preventDefault();search();});input.addEventListener('input',search);
    input.addEventListener('keydown',function(e){if(e.key==='Escape'){results.hidden=true;input.focus();}});
  }
  function ensureSearch(){if(document.querySelector('[data-learning-search]'))return;var top=document.querySelector('header.top');if(!top)return;var details=document.createElement('details');details.className='lf-global-search';details.innerHTML='<summary>搜索全站</summary><div class="lf-search" data-learning-search></div>';top.after(details);}
  var FIG={wiki:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect class="lf-back" x="15" y="6" width="24" height="32" rx="3"/><g class="lf-flip"><rect x="9" y="11" width="24" height="31" rx="3"/><path class="lf-draw" pathLength="1" style="--d:.55s" d="M15 20H27M15 26H27M15 32H22"/></g></svg>',route:'<svg viewBox="0 0 48 48" aria-hidden="true"><path class="lf-draw" pathLength="1" d="M12 12H26A8 8 0 0 1 26 28H22A8 8 0 0 0 22 44H36" transform="translate(0 -4)"/><circle class="lf-node" style="--d:.05s" cx="12" cy="8" r="3.5"/><circle class="lf-node" style="--d:.5s" cx="34" cy="16" r="3.5"/><circle class="lf-node" style="--d:.95s" cx="36" cy="40" r="3.5"/></svg>',lab:'<svg viewBox="0 0 48 48" aria-hidden="true"><path class="lf-solid" d="M24 6L37 13V29L24 36L11 29V13Z"/><path class="lf-edge" d="M11 13L24 20L37 13M24 20V36"/><path class="lf-cut" d="M11 25L24 32L37 25L24 18Z"/><path class="lf-axis" d="M10 43H38"/><circle class="lf-knob" cx="24" cy="43" r="3"/></svg>'};
  function clip(n,hero){return '<div class="lf-clip'+(/^(primary|junior)-/.test(n)?' lf-stage-clip':'')+(hero?' lf-clip-hero':'')+'" style="background-image:url('+D.url('assets/home/'+n+'.jpg')+')"><video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" poster="'+D.url('assets/home/'+n+'.jpg')+'" data-src="'+D.url('assets/home/'+n+'.mp4')+'"></video></div>';}
  // One controller per render: grade switching releases old videos/listeners.
  // Posters remain visible when motion is reduced, media fails or autoplay is blocked.
  function clips(root){
    if(root._lfClips)root._lfClips();
    var vs=Array.from(root.querySelectorAll('.lf-clip video')),buttons=root.querySelectorAll('[data-home-motion]');
    if(!vs.length)return;
    var reduced=matchMedia('(prefers-reduced-motion: reduce)'),visible=new Set(),failed=new Set(),paused=false,disposed=false;
    var io,handlers=[];
    function stop(v){v.pause();v.classList.remove('is-playing');}
    function fallback(v){failed.add(v);stop(v);v.removeAttribute('src');v.load();}
    function update(){
      buttons.forEach(function(b){b.hidden=reduced.matches||!io;b.textContent=paused?'播放动画':'暂停动画';b.setAttribute('aria-label',paused?'播放本页动画':'暂停本页动画');});
      vs.forEach(function(v){
        if(disposed||paused||reduced.matches||document.hidden||!visible.has(v)||failed.has(v)){stop(v);return;}
        if(!v.getAttribute('src'))v.src=v.dataset.src;
        var promise=v.play();if(promise&&promise.catch)promise.catch(function(error){if(!disposed&&error.name!=='AbortError')fallback(v);});
      });
    }
    function toggle(){paused=!paused;update();}
    vs.forEach(function(v){var playing=function(){if(disposed||paused||reduced.matches||document.hidden||!visible.has(v))stop(v);else v.classList.add('is-playing');},error=function(){if(!disposed)fallback(v);};v.addEventListener('playing',playing);v.addEventListener('error',error);handlers.push([v,playing,error]);});
    if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)visible.add(e.target);else visible.delete(e.target);});update();},{threshold:.4});vs.forEach(function(v){io.observe(v);});}
    buttons.forEach(function(b){b.addEventListener('click',toggle);});
    document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);update();
    root._lfClips=function(){disposed=true;if(io)io.disconnect();document.removeEventListener('visibilitychange',update);reduced.removeEventListener('change',update);buttons.forEach(function(b){b.removeEventListener('click',toggle);});handlers.forEach(function(h){h[0].removeEventListener('playing',h[1]);h[0].removeEventListener('error',h[2]);stop(h[0]);h[0].removeAttribute('src');h[0].load();});};
  }
  function stageHero(name,eyebrow,title,id){return '<figure class="lf-hero-fig">'+clip(name,true)+'<figcaption><span class="lf-eyebrow">'+esc(eyebrow)+'</span><strong>'+esc(title)+'</strong><a href="'+jLessonHref(id,2)+'">看这一课 →</a><button type="button" class="lf-home-motion" data-home-motion>暂停动画</button></figcaption></figure>';}
  // Play each tool icon once when it first scrolls into view; static final frame otherwise.
  FIG.practice='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="7" width="28" height="35" rx="3"/><path d="M16 18L19 21L24 15M16 30L19 33L24 27M28 19H33M28 31H33"/></svg>';
  function motion(root){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var items=root.querySelectorAll('.lf-tool');if(!items.length)return;root.classList.add('lf-motion');var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},{threshold:.35});items.forEach(function(el){io.observe(el);if(el.classList.contains('lf-tool'))el.addEventListener('mouseenter',function(){if(!el.classList.contains('is-in'))return;el.classList.remove('is-in');void el.offsetWidth;el.classList.add('is-in');});});}
  function topic(title,domain,section,desc,fig){return '<article class="lf-topic">'+(fig||'')+'<h3>'+title+'</h3><p>'+desc+'</p><div><a href="'+D.url('lessons/'+section+'.html#step1')+'">开始课程</a><a href="'+D.url('knowledge.html?domain='+domain)+'">查看知识树</a></div></article>';}
  // Hand-drawn ink stroke under the key phrase of the heading.
  function ink(t){return '<span class="lf-ink">'+t+'<svg viewBox="0 0 200 16" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M3 10C38 4 70 13 104 8S168 3 197 9"/></svg></span>';}
  function heroClip(){return '<figure class="lf-hero-fig"><div class="lf-clip lf-clip-hero" style="background-image:url('+D.url('assets/home/hero.jpg')+')"><video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" poster="'+D.url('assets/home/hero.jpg')+'" data-src="'+D.url('assets/home/hero.mp4')+'"></video></div><figcaption><span class="lf-eyebrow">讲解视频 · 复数</span><strong>乘以 <i>i</i>，就是转 90°</strong><a href="'+D.url('lessons/b2-7-1.html#step1')+'">看这一课 →</a></figcaption></figure>';}
  function home(data) {
    var host=document.querySelector('#learning-app'), snap=S.snapshot(), resume=snap.resume;
    var sec=resume&&(resume.sectionId||resume.section), l=sec&&D.lesson(sec), step=resume&&resume.step||1;
    host.innerHTML='<div class="lf-hero"><div class="lf-hero-text"><p class="lf-eyebrow">培玉高中数学</p><h1 class="lf-heading">'+(l?'接着上次，'+ink('往前学一步')+'。':'从一个问题开始，把数学'+ink('想明白')+'。')+'</h1><p class="lf-intro">顺着课程理解概念，遇到不清楚的地方查知识树，再用一道题检查自己的想法。</p><section class="lf-current"><p class="lf-eyebrow">'+(l?'继续学习':'从这里开始')+'</p><h2>'+esc(l?l.title:'集合的概念')+'</h2><p class="lf-note">'+(l?'上次停在第 '+step+' 步。你可以继续，也可以先复习一道题。':'先分清“哪些对象放在一起”，再认识集合与元素。')+'</p><div class="lf-actions"><a class="lf-button" href="'+esc(l?D.returnHref({from:l.id,step:step,question:resume.questionId||''}):D.url('lessons/b1-1-1.html#step1'))+'">'+(l?'继续这一节':'开始集合第一课')+'</a><a class="lf-button secondary" href="'+D.url('courses.html')+'">选择其他课程</a></div></section></div>'+heroClip()+'</div><section class="lf-next"><h2>学到哪里不清楚，就从哪里接上</h2><ol><li><b>想</b>在课程里想一想、试一试。</li><li><b>查</b>查知识卡，把使用条件看清楚。</li><li><b>验</b>答题后回看原因，隔一段时间再检验。</li></ol><a href="'+D.url('learning.html')+'">查看我的作答与复习记录 →</a></section><section><h2>先看这三个部分</h2><div class="lf-topic-list">'+topic('集合与逻辑','sets','b1-1-1','元素、集合关系、运算与条件判断。',clip('sets'))+topic('函数','functions','b1-3-1','定义域、对应关系、性质与图象。',clip('func'))+topic('概率统计','probability-statistics','b2-9-1','从数据到结论，从随机现象到概率。',clip('stats'))+'</div><p><a href="'+D.url('knowledge.html')+'">打开完整知识库</a>　<a href="'+D.url('practice.html')+'">选一个知识点练习</a></p></section>'+tools();motion(host);clips(host);
  }
  // 初中、小学首页的「学习工具」：卡片、图标与高中同一套，只换成本学段已有的工具。
  function jTools(){return tools([!NO_KNOWLEDGE?['knowledge.html','lf-tool-wiki','知识点卡','按册、章、节查定义、条件和易错点，带着问题回到课里。',FIG.wiki]:['practice.html','lf-tool-wiki','练一练与中考真题','每节第 4 步从易到难，第 5 步是中考真题。',FIG.practice],['textbook-map.html','lf-tool-map','教材路线图','按人教版（2024 新版）的册、章、节排好，看清每一节在全书的位置。',FIG.route],['lessons/j6-1.html','lf-tool-lab','数学实验台','拖动滑块折正方体、拼勾股立柱、展开圆锥，在课里动手看。',FIG.lab]]);}
  function pConceptHref(data,gradeNo){var cards=(data.index.search||[]).filter(function(x){return x.kind==='point';});function atGrade(n){return cards.find(function(x){return new URL(x.href,location.href).searchParams.get('grade')===String(n);});}var match=atGrade(gradeNo),hit=match,g;for(g=gradeNo-1;!hit&&g>=1;g--)hit=atGrade(g);for(g=gradeNo+1;!hit&&g<=6;g++)hit=atGrade(g);return {href:hit?hit.href.split('#')[0]:'knowledge.html',fallback:!match,hasCard:!!hit};}
  function pTools(data,gradeNo){var t=[['courses.html?grade=g'+gradeNo,'lf-tool-map','课程目录','按年级、册、单元排好，每课都能从上次那一步继续。',FIG.route],['practice.html?grade=g'+gradeNo,'lf-tool-lab','练一练与单元闯关','每课的练一练和每单元 10 道闯关题。',FIG.practice]];if(data.index.conceptCards){var concept=pConceptHref(data,gradeNo);t.unshift([concept.href,'lf-tool-wiki','概念与易错卡',concept.fallback?(concept.hasCard?'暂无本年级卡，先看看已有年级的示例。':'暂无本年级卡。'):'看图把容易混的地方说清，再试一题；低年级可以听一听。',FIG.wiki]);}return tools(t);}
  // 外壳渲染的课程树说明里可能有 \( \) 公式，和课页一样交给 KaTeX。
  function typeset(root){if(window.renderMathInElement)try{window.renderMathInElement(root,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],throwOnError:false});}catch(e){}}
  /* ---------- 初中学段 ---------- */
  function jLessonHref(id,step){return D.url('lessons/'+id+'.html'+(step?'#step'+step:''));}
  function jDone(snap){var by={};Object.keys(snap.sections||{}).forEach(function(id){by[id]=true;});(snap.events||[]).forEach(function(e){if(e&&e.sectionId)by[e.sectionId]=true;});return by;}
  function jBooks(data){var books=[];data.index.lessons.forEach(function(l){var b=books.find(function(x){return x.id===l.bookId;});if(!b){b={id:l.bookId,title:l.bookTitle,lessons:[]};books.push(b);}b.lessons.push(l);});return books;}
  function jHeroFig(){return stageHero('junior-hero','讲解视频 · 正数和负数','先规定方向，再用正负数记下来','j1-1');}
  function jTree(data,done,withActions){
    return jBooks(data).map(function(b){var chapters=[];b.lessons.forEach(function(l){if(!chapters.includes(l.chapterId))chapters.push(l.chapterId);});
      return chapters.map(function(ch){var ls=b.lessons.filter(function(l){return l.chapterId===ch;});return '<section class="lf-chapter" id="'+esc(ch)+'"><h2>'+esc(ls[0].chapterTitle)+'</h2>'+ls.map(function(l){
        var name=esc(l.title)+(done&&done[l.id]?' <span class="lf-jh-seen">学过</span>':'');
        if(!l.ready)return '<div class="lf-lesson-row lf-jh-todo"><span>'+esc(l.title)+'<p>待上线</p></span></div>';
        return '<div class="lf-lesson-row"><a href="'+jLessonHref(l.id)+'">'+name+'<p>'+esc(l.summary||'例子 · 讲解 · 动手 · 练一练 · 中考真题')+'</p></a>'+(withActions?'<div class="lf-lesson-actions">'+(!NO_KNOWLEDGE&&l.pointIds.length?'<a href="'+D.url('knowledge.html?section='+l.id)+'">知识点</a>':'')+'<a href="'+jLessonHref(l.id,4)+'">练一练</a><a href="'+jLessonHref(l.id,5)+'">中考真题</a></div>':'')+'</div>';}).join('')+'</section>';}).join('');
    }).join('');
  }
  function jBookNav(data,book){return '<nav class="lf-book-nav" aria-label="教材册别">'+jBooks(data).map(function(b){var n=b.lessons.filter(function(l){return l.ready;}).length;return '<a href="?book='+esc(b.id)+'" data-book="'+esc(b.id)+'"'+(b.id===book?' aria-current="page"':'')+'>'+esc(b.title)+(n?'':' · 待上线')+'</a>';}).join('')+'</nav>';}
  function jBookPage(data,heading,intro,withActions){
    var host=document.querySelector('#learning-app'),books=jBooks(data),done=jDone(S.snapshot()),selected=new URLSearchParams(location.search).get('book');
    if(!books.some(function(b){return b.id===selected;}))selected=books[0].id;
    function draw(book){selected=book;var one={index:{lessons:data.index.lessons.filter(function(l){return l.bookId===book;})}};
      host.innerHTML='<h1 class="lf-heading">'+heading+'</h1><p class="lf-intro">'+intro+'</p><div class="lf-courses">'+jBookNav(data,book)+'<div>'+jTree(one,done,withActions)+'</div></div>';typeset(host);
      host.querySelectorAll('[data-book]').forEach(function(a){a.addEventListener('click',function(e){if(e.ctrlKey||e.metaKey)return;e.preventDefault();history.replaceState(null,'','?book='+a.dataset.book);draw(a.dataset.book);});});
    }draw(selected);
  }
  function jHome(data){
    var host=document.querySelector('#learning-app'),snap=S.snapshot(),resume=snap.resume,done=jDone(snap);
    var sec=resume&&(resume.sectionId||resume.section),l=sec&&D.lesson(sec),step=resume&&resume.step||1;
    var ready=data.index.lessons.filter(function(x){return x.ready;}),seen=ready.filter(function(x){return done[x.id];}).length;
    var parts=[['数与式','j1-2','从数轴看相反数，再学有理数的运算与代数式。','junior-numbers'],['方程与不等式','j5-1','从天平的平衡，看等式两边怎样一起变。','junior-equations'],['图形与坐标','j6-1','从立体图形出发，认识点、线、面与平面图形。','junior-geometry']];
    host.innerHTML='<div class="lf-hero"><div class="lf-hero-text"><p class="lf-eyebrow">培玉初中数学 · 人教版</p><h1 class="lf-heading">'+(l?'接着上次，'+ink('往前学一步')+'。':'从身边的例子开始，把数学'+ink('想明白')+'。')+'</h1><p class="lf-intro">每一节都从一个人人能答的例子进入，讲清楚之后自己动手拖一拖，再用练一练和中考真题检验。</p><section class="lf-current"><p class="lf-eyebrow">'+(l?'继续学习':'从这里开始')+'</p><h2>'+esc(l?l.title:'1.1 正数和负数')+'</h2><p class="lf-note">'+(l?'上次停在第 '+step+' 步。你可以继续，也可以换一节。':'零上和零下、收入和支出——意思相反的两个量，怎样用数一眼分开？')+'</p><div class="lf-actions"><a class="lf-button" href="'+esc(l?D.returnHref({from:l.id,step:step,question:resume.questionId||''}):jLessonHref('j1-1',1))+'">'+(l?'继续这一节':'开始第一课')+'</a><a class="lf-button secondary" href="'+D.url('courses.html')+'">选择其他课程</a></div></section></div>'+jHeroFig()+'</div>'
      +'<section class="lf-next"><h2>每一节都是五步</h2><ol><li><b>例</b>从例子进入，先猜一猜。</li><li><b>讲</b>讲清楚，再自己试试。</li><li><b>验</b>动手、练一练、中考真题。</li></ol><a href="'+D.url('learning.html')+'">查看我的作答记录 →</a></section>'
      +'<section><h2>先看这三个部分</h2><div class="lf-topic-list">'+parts.map(function(p){var x=D.lesson(p[1]);return '<article class="lf-topic">'+clip(p[3])+'<h3>'+p[0]+'</h3><p>'+p[2]+'</p><div><a href="'+jLessonHref(p[1],1)+'">从'+esc(x?x.title.replace(/^[\d.]+\s*/,''):'第一节')+'开始</a></div></article>';}).join('')+'</div>'+(!NO_KNOWLEDGE?'<p><a href="'+D.url('knowledge.html')+'">按册、章、节查知识点 →</a></p>':'')+'</section>'
      +'<section class="lf-jh-tree"><h2>全部课程</h2><p class="lf-note">已上线 '+ready.length+' / '+data.index.lessons.length+' 节'+(seen?'，你学过其中 '+seen+' 节':'')+'。按人教版（2024 新版）教材顺序。</p><div class="lf-courses">'+jBookNav(data,'')+'<div>'+jTree({index:{lessons:data.index.lessons.filter(function(x){return x.bookId===(jBooks(data)[0]||{}).id;})}},done,false)+'<p><a href="'+D.url('courses.html')+'">看全部册别 →</a></p></div></div></section>'+jTools();
    host.querySelectorAll('.lf-book-nav a').forEach(function(a){a.href=D.url('courses.html?book='+a.dataset.book);});typeset(host);motion(host);clips(host);
  }
  function jKnowledge(data){if(data.index.knowledge&&data.index.points.length)return;var host=document.querySelector('#learning-app');host.innerHTML='<h1 class="lf-heading">初中知识库建设中</h1><p class="lf-intro">初中的概念卡和知识树还在整理。现在可以按课程学习，每节都有「讲清楚」和练习。</p><p><a class="lf-button" href="'+D.url('courses.html')+'">去课程目录</a></p>';}
  /* ---------- 小学学段 ---------- */
  var P_GRADES=[['g1','一年级',1],['g2','二年级',2],['g3','三年级',3],['g4','四年级',4],['g5','五年级',5],['g6','六年级',6]];
  function pGetGrade(data,snap){
    var q=new URLSearchParams(location.search).get('grade');
    if(P_GRADES.some(function(g){return g[0]===q;}))return q;
    var bq=new URLSearchParams(location.search).get('book');
    if(bq&&/^p[1-6][ab]$/.test(bq))return 'g'+bq[1];
    try{var saved=localStorage.getItem('peiyu.ps.grade');if(P_GRADES.some(function(g){return g[0]===saved;}))return saved;}catch(e){}
    var sec=snap&&snap.resume&&(snap.resume.sectionId||snap.resume.section),l=sec&&D.lesson(sec);
    if(l&&l.gradeId)return l.gradeId;
    return 'g1';
  }
  function pSetGrade(g){try{localStorage.setItem('peiyu.ps.grade',g);}catch(e){}}
  function pGradeNav(selected){
    return '<nav class="lf-grade-nav" aria-label="选择年级">'+P_GRADES.map(function(g){
      var on=g[0]===selected;
      return '<button type="button" class="lf-grade-btn" data-grade="'+g[0]+'" aria-pressed="'+(on?'true':'false')+'">'+g[1]+'</button>';
    }).join('')+'</nav>';
  }
  function pParentNote(gradeId){
    var low=gradeId==='g1'||gradeId==='g2';
    return '<div class="lf-parent-note'+(low?' is-low':'')+'" data-ps-parent-note><strong>这一页给家长和孩子一起用</strong><span>'+(low?'一、二年级配有拼音与「🔊 读题」，每课顶部有「给家长的一句话」，最后一步「在家玩」可打印出来陪孩子动手玩。':'先选孩子的年级，顺着「想一想 → 摆一摆 → 说一说 → 练一练」一步步动手想明白。')+'</span></div>';
  }
  function pUnitMap(data){var m={};(data.index.units||[]).forEach(function(u){m[u.id]=u;});return m;}
  function pGradeResume(data,snap,gradeId){
    var sec=snap&&snap.resume&&(snap.resume.sectionId||snap.resume.section),l=sec&&D.lesson(sec);
    if(l&&l.gradeId===gradeId)return {lesson:l,step:snap.resume.step||1,question:snap.resume.questionId||''};
    var events=(snap&&snap.events||[]).slice().reverse();
    for(var i=0;i<events.length;i++){
      var ev=events[i],el=ev&&ev.sectionId&&D.lesson(ev.sectionId);
      if(el&&el.gradeId===gradeId&&el.ready)return {lesson:el,step:ev.step||1,question:ev.questionId||''};
    }
    return null;
  }
  function pFirstReady(data,gradeId){
    var upper=data.index.lessons.find(function(l){return l.gradeId===gradeId&&l.bookId==='p'+gradeId[1]+'a'&&l.ready;});
    if(upper)return upper;
    return data.index.lessons.find(function(l){return l.gradeId===gradeId&&l.ready;})||data.index.lessons.find(function(l){return l.gradeId===gradeId;});
  }
  var P_HOME_CLIPS={g1:['加法','把两盘苹果合在一起','p1a-u1-5'],g2:['认识乘法','每盘同样多，几盘一共多少','p2a-u2-1'],g3:['几分之一','分一张饼，认识几分之一','p3a-u6-1'],g4:['角的再认识','扇子打开，角也变大','p4a-u2-1'],g5:['平行四边形的面积','剪一剪，拼成长方形','p5a-u6-1'],g6:['认识圆','固定一个中心，慢慢画一圈','p6a-u4-1']};
  function pHeroFig(gradeId){var item=P_HOME_CLIPS[gradeId]||P_HOME_CLIPS.g1;return stageHero('primary-'+gradeId+'-slow','动画看一看 · '+gradeId[1]+'年级 · '+item[0],item[1],item[2]);}
  function pHomeTopics(){return '<section><h2>跟着动画，看一看数学</h2><div class="lf-topic-list">'+[['数与运算','primary-g1-slow','p1a-u1-5','一年级起：把两盘苹果合起来，数一数一共有几个。'],['分数的初步认识','primary-g3-slow','p3a-u6-1','三年级起：把一张饼平均分，拿出其中的一份。'],['图形与几何','primary-g6-slow','p6a-u4-1','六年级：固定一端、拉紧绳子，慢慢画出一个圆。']].map(function(p){return '<article class="lf-topic">'+clip(p[1])+'<h3>'+p[0]+'</h3><p>'+p[3]+'</p><div><a href="'+jLessonHref(p[2],2)+'">看这一课 →</a></div></article>';}).join('')+'</div></section>';}
  function pUnitTree(lessons,unitMap,done,mode,bookId){
    var units=Object.values(unitMap).filter(function(u){return u.bookId===bookId;}).map(function(u){return u.id;});
    return units.map(function(uid){
      var ls=lessons.filter(function(l){return l.unitId===uid;}),u=unitMap[uid]||{id:uid,unitTitle:ls[0].unitTitle,ready:false};
      if(u.isActivity){
        var activityRow=u.ready?'<div class="lf-lesson-row lf-unit-row"><a href="'+jLessonHref(u.id,1)+'">'+esc(u.unitTitle)+'<p>'+esc(u.summary||'综合实践')+'</p></a></div>':'<div class="lf-lesson-row lf-jh-todo"><span>'+esc(u.unitTitle)+'<p>待上线</p></span></div>';
        return '<section class="lf-chapter" id="'+esc(uid)+'"><div class="lf-unit-head"><h2>'+esc(u.unitTitle)+'</h2></div>'+activityRow+ls.map(function(l){return l.ready?'<div class="lf-lesson-row"><a href="'+jLessonHref(l.id,mode==='practice'?l.practiceStep:1)+'">'+esc(l.title)+'<p>'+esc(l.summary||'综合实践')+'</p></a></div>':'<div class="lf-lesson-row lf-jh-todo"><span>'+esc(l.title)+'<p>待上线</p></span></div>';}).join('')+'</section>';
      }
      var uBadge=u.ready?'<a class="lf-unit-badge" href="'+jLessonHref(u.id,mode==='practice'?2:1)+'">'+(mode==='practice'?'单元闯关 10 题 →':'单元首页 · 小结与闯关 →')+'</a>':'<span class="lf-unit-badge is-todo">单元首页待上线</span>';
      var uRow='';
      if(u.ready){
        uRow='<div class="lf-lesson-row lf-unit-row"><a href="'+jLessonHref(u.id,mode==='practice'?2:1)+'">'+esc(u.unitTitle)+' · '+(mode==='practice'?'单元闯关（10 题）':'单元首页（小结图 + 单元闯关）')+(done&&done[u.id]?' <span class="lf-jh-seen">学过</span>':'')+'<p>'+esc(u.summary||'一张图串起全单元 + 10 道闯关题检验')+'</p></a><div class="lf-lesson-actions"><a href="'+jLessonHref(u.id,1)+'">单元小结</a><a href="'+jLessonHref(u.id,2)+'">单元闯关</a></div></div>';
      }else if(mode==='practice'){
        uRow='<div class="lf-lesson-row lf-unit-row lf-jh-todo"><span>'+esc(u.unitTitle)+' · 单元闯关<p>单元首页待上线</p></span></div>';
      }
      return '<section class="lf-chapter" id="'+esc(uid)+'"><div class="lf-unit-head"><h2>'+esc(u.unitTitle)+'</h2>'+uBadge+'</div>'+uRow+ls.map(function(l){
        var seen=done&&done[l.id]?' <span class="lf-jh-seen">学过</span>':'';
        var pStep=l.practiceStep||(l.grade<=2?3:4);
        if(!l.ready)return '<div class="lf-lesson-row lf-jh-todo"><span>'+esc(l.title)+'<p>待上线</p></span></div>';
        if(mode==='practice'){
          return '<div class="lf-lesson-row"><a href="'+jLessonHref(l.id,pStep)+'">'+esc(l.title)+' · 练一练'+seen+'<p>'+esc(l.summary||'想一想 · 摆一摆 · 说一说 · 练一练')+'</p></a><div class="lf-lesson-actions"><a href="'+jLessonHref(l.id,pStep)+'">练一练</a><a href="'+jLessonHref(l.id,1)+'">看课程</a></div></div>';
        }
        return '<div class="lf-lesson-row"><a href="'+jLessonHref(l.id)+'">'+esc(l.title)+seen+'<p>'+esc(l.summary||(l.grade<=2?'想一想 · 动手做 · 练一练 · 在家玩':'想一想 · 摆一摆 · 说一说 · 练一练'))+'</p></a><div class="lf-lesson-actions">'+(u.ready?'<a href="'+jLessonHref(u.id,2)+'">单元闯关</a>':'')+'<a href="'+jLessonHref(l.id,pStep)+'">练一练</a></div></div>';
      }).join('')+'</section>';
    }).join('');
  }
  function pHome(data){
    var host=document.querySelector('#learning-app'),snap=S.snapshot(),done=jDone(snap),unitMap=pUnitMap(data);
    var gradeId=pGetGrade(data,snap);
    function draw(gId){
      gradeId=gId;pSetGrade(gId);
      var gInfo=P_GRADES.find(function(g){return g[0]===gId;})||P_GRADES[0],gTitle=gInfo[1];
      var gRes=pGradeResume(data,snap,gId),first=pFirstReady(data,gId);
      var globalSec=snap.resume&&(snap.resume.sectionId||snap.resume.section),globalL=globalSec&&D.lesson(globalSec);
      var gradeLessons=data.index.lessons.filter(function(x){return x.gradeId===gId;});
      var books=[];gradeLessons.forEach(function(l){if(!books.some(function(b){return b.id===l.bookId;}))books.push({id:l.bookId,title:l.bookTitle});});
      var activeBook=books[0]?books[0].id:('p'+gInfo[2]+'a');
      var readyCount=data.index.lessons.filter(function(x){return x.ready;}).length,seenCount=data.index.lessons.filter(function(x){return x.ready&&done[x.id];}).length;
      var curEyebrow=gRes?'继续上次 · '+gTitle:'这学期学到这里 · '+(first?first.bookTitle+' '+first.unitTitle:gTitle);
      var curTitle=gRes?gRes.lesson.title:(first?first.title:gTitle+'第一课');
      var curNote=gRes?('上次停在第 '+gRes.step+' 步。你可以接着往下学，也可以先做几道题。'):(first&&first.summary?first.summary:'先动手摆一摆、分一分，自己看清道理。');
      var curHref=gRes?D.returnHref({from:gRes.lesson.id,step:gRes.step,question:gRes.question}):(first?jLessonHref(first.id,1):D.url('courses.html?grade='+gId));
      var curBtn=gRes?'继续这一课':'从这一课开始';
      var secBtn=gRes&&first&&first.id!==gRes.lesson.id
        ?'<a class="lf-button secondary" href="'+jLessonHref(first.id,1)+'">这学期学到这里（'+esc(first.rawTitle||first.title)+'）</a>'
        :(globalL&&globalL.gradeId!==gId?'<a class="lf-button secondary" href="'+esc(D.returnHref({from:globalL.id,step:snap.resume.step||1,question:snap.resume.questionId||''}))+'">继续上次（'+esc(globalL.gradeTitle+' · '+(globalL.rawTitle||globalL.title))+'）</a>':'<a class="lf-button secondary" href="'+D.url('courses.html?grade='+gId)+'">看'+gTitle+'全部课程</a>');
      host.innerHTML='<div class="lf-hero"><div class="lf-hero-text"><p class="lf-eyebrow">培玉小学数学 · 人教版</p><h1 class="lf-heading">'+(gRes?'接着上次，'+ink('往前学一步')+'。':'先选年级，动手把数学'+ink('想明白')+'。')+'</h1><p class="lf-intro">先选孩子的年级。每一课都能亲手摆学具、画图、填数，做完一道马上知道对不对。</p>'
        +pGradeNav(gId)+pParentNote(gId)
        +'<section class="lf-current"><p class="lf-eyebrow">'+esc(curEyebrow)+'</p><h2>'+esc(curTitle)+'</h2><p class="lf-note">'+esc(curNote)+'</p><div class="lf-actions"><a class="lf-button" href="'+esc(curHref)+'">'+curBtn+'</a>'+secBtn+'<a class="lf-button secondary" href="'+D.url('practice.html?grade='+gId)+'">去单元练习</a></div></section></div>'+pHeroFig(gId)+'</div>'
        +'<section class="lf-next"><h2>每一课都是四步</h2><ol><li><b>想</b>从生活例子猜一猜。</li><li><b>摆</b>动手摆学具，看清道理。</li><li><b>说</b>把关键一句话说清楚。</li><li><b>练</b>当堂练一练，低年级还有「在家玩」。</li></ol><a href="'+D.url('learning.html')+'">查看我的作答与复习记录 →</a></section>'
        +pHomeTopics()+'<section class="lf-jh-tree"><h2>'+gTitle+'课程目录</h2><p class="lf-note">全站已上线 '+readyCount+' / '+data.index.lessons.length+' 课'+(seenCount?'，已学过 '+seenCount+' 课':'')+'。点击上方年级按钮可切换一至六年级。</p><div class="lf-courses"><nav class="lf-book-nav" aria-label="教材册别">'+books.map(function(b){var n=gradeLessons.filter(function(l){return l.bookId===b.id&&l.ready;}).length;return '<a href="?grade='+gId+'&book='+b.id+'" data-book="'+b.id+'"'+(b.id===activeBook?' aria-current="page"':'')+'>'+esc(b.title)+(n?'（已上线 '+n+' 课）':' · 待上线')+'</a>';}).join('')+'</nav><div data-ps-home-tree>'+pUnitTree(gradeLessons.filter(function(l){return l.bookId===activeBook;}),unitMap,done,'courses',activeBook)+'<p><a href="'+D.url('courses.html?grade='+gId)+'">打开完整课程页 →</a></p></div></div></section>'+pTools(data,gInfo[2]);motion(host);clips(host);
      host.querySelectorAll('[data-grade]').forEach(function(btn){btn.addEventListener('click',function(){history.replaceState(null,'','?grade='+btn.dataset.grade);draw(btn.dataset.grade);});});
      host.querySelectorAll('[data-book]').forEach(function(a){a.addEventListener('click',function(e){if(e.ctrlKey||e.metaKey)return;e.preventDefault();activeBook=a.dataset.book;host.querySelectorAll('[data-book]').forEach(function(x){if(x.dataset.book===activeBook)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});host.querySelector('[data-ps-home-tree]').innerHTML=pUnitTree(gradeLessons.filter(function(l){return l.bookId===activeBook;}),unitMap,done,'courses',activeBook)+'<p><a href="'+D.url('courses.html?grade='+gId+'&book='+activeBook)+'">打开完整课程页 →</a></p>';});});
    }
    draw(gradeId);
  }
  function pBookPage(data,heading,intro,mode){
    var host=document.querySelector('#learning-app'),snap=S.snapshot(),done=jDone(snap),unitMap=pUnitMap(data);
    var gradeId=pGetGrade(data,snap);
    var initBook=new URLSearchParams(location.search).get('book');
    function draw(gId,bookId){
      gradeId=gId;pSetGrade(gId);
      var gradeLessons=data.index.lessons.filter(function(l){return l.gradeId===gId;});
      var books=[];gradeLessons.forEach(function(l){if(!books.some(function(b){return b.id===l.bookId;}))books.push({id:l.bookId,title:l.bookTitle});});
      var selectedBook=books.some(function(b){return b.id===bookId;})?bookId:(books[0]?books[0].id:'p1a');
      var bookLessons=gradeLessons.filter(function(l){return l.bookId===selectedBook;});
      host.innerHTML='<h1 class="lf-heading">'+heading+'</h1><p class="lf-intro">'+intro+'</p>'+pGradeNav(gId)+pParentNote(gId)+'<div class="lf-courses"><nav class="lf-book-nav" aria-label="教材册别">'+books.map(function(b){var n=gradeLessons.filter(function(l){return l.bookId===b.id&&l.ready;}).length;return '<a href="?grade='+gId+'&book='+b.id+'" data-book="'+b.id+'"'+(b.id===selectedBook?' aria-current="page"':'')+'>'+esc(b.title)+(n?'（'+n+' 课）':' · 待上线')+'</a>';}).join('')+'</nav><div>'+pUnitTree(bookLessons,unitMap,done,mode,selectedBook)+'</div></div>';
      host.querySelectorAll('[data-grade]').forEach(function(btn){btn.addEventListener('click',function(){var nextG=btn.dataset.grade;history.replaceState(null,'','?grade='+nextG);draw(nextG,null);});});
      host.querySelectorAll('[data-book]').forEach(function(a){a.addEventListener('click',function(e){if(e.ctrlKey||e.metaKey)return;e.preventDefault();history.replaceState(null,'','?grade='+gId+'&book='+a.dataset.book);draw(gId,a.dataset.book);});});
    }
    draw(gradeId,initBook);
  }
  function pKnowledge(){var host=document.querySelector('#learning-app');host.innerHTML='<h1 class="lf-heading">小学知识库建设中</h1><p class="lf-intro">小学的概念卡和知识梳理还在整理。现在可以按年级和单元学习，每课都有动手教具和练习。</p><p><a class="lf-button" href="'+D.url('courses.html')+'">去课程目录</a></p>';}
  function tools(t){t=t||[['wiki.html','lf-tool-wiki','概念与方法卡','做题卡壳时速查：定义、公式、解题套路和易错红线。',FIG.wiki],['textbook-map.html','lf-tool-map','教材路线图','按人教 A 版的册、章、节排好，看清每一节在全书的位置。',FIG.route],['anatomy.html','lf-tool-lab','数学实验台','拖动滑块看立体图形怎么变，每节配一份可打印的 A4 讲义。',FIG.lab]];return '<section class="lf-tools" aria-labelledby="lf-tools-title"><h2 id="lf-tools-title">学习工具</h2><div class="lf-tool-list">'+t.map(function(x){return '<a class="lf-tool '+x[1]+'" href="'+D.url(x[0])+'"><span class="lf-tool-icon">'+x[4]+'</span><span class="lf-tool-body"><strong>'+x[2]+'</strong><span>'+x[3]+'</span></span><span class="lf-tool-go" aria-hidden="true">→</span></a>';}).join('')+'</div></section>';}
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
  D.load().then(function(data){if(JUNIOR&&data.index.knowledge&&data.index.points.length){NO_KNOWLEDGE=false;nav=[['home','index.html','首页'],['courses','courses.html','课程'],['knowledge','knowledge.html','知识库'],['practice','practice.html','练习'],['record','learning.html','我的学习']];}if(PRIMARY&&data.index.conceptCards){nav=[['home','index.html','首页'],['courses','courses.html','课程'],['knowledge','knowledge.html','知识库'],['practice','practice.html','练习'],['record','learning.html','我的学习']];}storageNotice(S.load());S.subscribe(storageNotice);installNav();ensureSearch();document.addEventListener('step',function(){installNav();});document.querySelectorAll('[data-learning-search]').forEach(function(h){searchUI(h,data);});if(PRIMARY){if(page==='home')pHome(data);if(page==='courses'&&!document.body.dataset.sec)pBookPage(data,'按年级和单元，一步一步学','人教版教材顺序。先选年级，再选册别与单元，每课都能从上次那一步继续。','courses');if(page==='practice')pBookPage(data,'选一单元或一课练习','按单元列各课时的「练一练」和单元闯关入口。','practice');if(page==='knowledge'&&!data.index.conceptCards)pKnowledge();return;}if(JUNIOR){if(page==='home')jHome(data);if(page==='courses'&&!document.body.dataset.sec)jBookPage(data,'按课程，一步一步学','人教版（2024 新版）教材顺序。每节都可以从原来的位置继续。',true);if(page==='practice')jBookPage(data,'选一节练习','每节第 4 步「练一练」从易到难，第 5 步是中考真题。',true);if(page==='knowledge')jKnowledge(data);if(!NO_KNOWLEDGE)knowledgeEvidence(data);return;}
    if(page==='home')home(data);if(page==='courses'&&!document.body.dataset.sec)courses(data);knowledgeEvidence(data);}).catch(function(e){var h=document.querySelector('#learning-app');if(h){var first=PRIMARY?'lessons/p1a-u2-1.html':JUNIOR?'lessons/j1-1.html':'lessons/b1-1-1.html';h.innerHTML='<p role="alert">'+esc(e.message)+'</p><p><a href="'+D.url(first)+'">'+(PRIMARY||JUNIOR?'先打开第一课':'先打开集合课程')+'</a>，或刷新后重试。</p>';}});
})();
