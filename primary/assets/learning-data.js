/* Public learning routes and index. Math content remains in the knowledge catalog. */
(function () {
  'use strict';
  var root = new URL('../', document.currentScript.src), cached, pending;
  function url(path) { return new URL(path, root).href; }
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function load() {
    if (cached) return Promise.resolve(cached);
    // 初中页不加载 knowledge-core（初中还没有知识库），这时知识卡和配套练习都是空的，也不去请求。
    var hasKnowledge = !!window.PeiyuKnowledge;
    if (!pending) pending = Promise.all([
      fetch(url('data/learning-index.json'), {cache:'no-store'}).then(function (r) { if (!r.ok) throw new Error('学习目录暂时无法打开，请刷新重试。'); return r.json(); }),
      hasKnowledge ? window.PeiyuKnowledge.load() : {points:[]},
      hasKnowledge ? fetch(url('data/learning-variants.json'), {cache:'no-store'}).then(function(r){if(r.status===404)return {version:1,items:[]};if(!r.ok)throw new Error('配套练习暂时无法打开，请刷新重试。');return r.json();}) : {version:1,items:[]}
    ]).then(function (all) {
      if (all[0].version !== 1 || !Array.isArray(all[0].lessons) || !Array.isArray(all[0].points)) throw new Error('学习目录格式不完整。');
      cached = {index:all[0], knowledge:all[1],variants:all[2]}; return cached;
    }).catch(function (e) { pending = null; throw e; });
    return pending;
  }
  function lesson(id) { return cached && (cached.index.lessons.find(function (x) { return x.id === id; }) || (Array.isArray(cached.index.units) && cached.index.units.find(function (x) { return x.id === id; }))); }
  function point(id) { return cached && cached.knowledge.points.find(function (x) { return x.id === id; }); }
  function context(search) {
    var p = new URLSearchParams(search === undefined ? location.search : search), from = p.get('from');
    if (!lesson(from)) return null;
    var step = Number(p.get('step')), q = p.get('question') || p.get('focus') || '';
    return {from:from, step:step >= 1 && step <= 5 && Number.isInteger(step) ? step : 2, question:/^[a-zA-Z0-9_.:-]{1,100}$/.test(q) ? q : ''};
  }
  function withContext(path, ctx) {
    var out = new URL(path, root); ctx = ctx === undefined ? context() : ctx;
    if (ctx && lesson(ctx.from)) { out.searchParams.set('from',ctx.from); out.searchParams.set('step',String(ctx.step)); if (ctx.question) out.searchParams.set('question',ctx.question); }
    return out.href;
  }
  function returnHref(ctx) {
    ctx = ctx === undefined ? context() : ctx;
    if (!ctx || !lesson(ctx.from)) return url('courses.html');
    var out = new URL('lessons/'+ctx.from+'.html',root);
    if (ctx.question && /^[a-zA-Z0-9_.:-]{1,100}$/.test(ctx.question)) out.searchParams.set('focus',ctx.question);
    out.hash = 'step'+ctx.step; return out.href;
  }
  function stage() { return cached && cached.index.stage === 'primary' ? 'primary' : cached && cached.index.stage === 'junior' ? 'junior' : 'high'; }
  window.PeiyuLearningData = {load:load,stage:stage,root:root,url:url,escape:escape,lesson:lesson,point:point,context:context,withContext:withContext,returnHref:returnHref};
})();
