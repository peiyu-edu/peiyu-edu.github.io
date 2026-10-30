/* Course-side learning flow. Loaded with defer, before lesson DOMContentLoaded setup. */
(function () {
  'use strict';
  var sectionId = document.body.getAttribute('data-sec');
  var dataAPI = window.PeiyuLearningData, stateAPI = window.PeiyuLearningState;
  if (!sectionId || !dataAPI) return;
  var isPrimary = document.body.getAttribute('data-stage') === 'primary' || /^p[1-6][ab]-/.test(sectionId);
  var isJunior = /^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(sectionId);
  function allowedPoint(id) {
    return !!dataAPI.point(id) && (!isJunior || (window.PeiyuKnowledge && window.PeiyuKnowledge.availableInSection(id, sectionId)));
  }
  var steps = Array.from(document.querySelectorAll('section.step'));
  var labels = isPrimary ? steps.map(function (s, i) { return (s.getAttribute && s.getAttribute('data-title')) || ('第 ' + (i + 1) + ' 步'); })
    : ['先想一想', '理解概念', '动手探索', '练一练', '应用与真题'];
  var questionSelector = isPrimary ? '.predict[data-id], .q[data-id]' : '.predict[data-id]';
  var boxes = Array.from(document.querySelectorAll(questionSelector));
  var questions = new Map(), sessionAnswered = new Set(), initialSnapshot = null, ready = false, guideTouched = false;
  var initialHash = location.hash, initialFocus = new URLSearchParams(location.search).get('focus');
  var currentQuestion = '', seenSteps = new Set(), lastSavedStep = 0, toolbar, dialog, dialogContext, dialogPoint;
  var returnFocus, lessonData, knowledgeData, indexData, viewObserver, unavailable = false, pendingResume = null, hasPoints = true;

  // Import legacy exposure before lesson.js writes this page's new interaction log.
  if (stateAPI) {
    stateAPI.load();
    initialSnapshot = stateAPI.snapshot();
  }
  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  // 初中课页手写的「本节导读」整行粗体：拆成和高中导读卡一样的「粗标题 + 灰色说明」，文字不变。
  if (isJunior) Array.prototype.forEach.call(document.querySelectorAll('details.route > summary'), function (summary) {
    var match = !summary.childElementCount && summary.textContent.match(/^\s*(本节导读)[\s\u3000]*([\s\S]*?)\s*$/);
    if (!match) return;
    summary.textContent = '';
    summary.append(el('span', match[1], 'lc-guide-t'), el('span', match[2], 'lc-guide-s'));
    summary.parentNode.classList.add('lc-guide');
  });
  function currentStep() {
    var index = steps.findIndex(function (step) { return step.classList.contains('on'); });
    return index < 0 ? 1 : index + 1;
  }
  function stepOf(box) { return steps.indexOf(box.closest('section.step')) + 1; }
  function focusTarget(id) {
    if (!id) return null;
    var known = questions.get(id);
    if (known) return known;
    if (isPrimary) {
      var manip = Array.from(document.querySelectorAll('.manip')).find(function (item) {
        var mId = item.getAttribute('data-lab-id') || item.id || item.getAttribute('data-manip') || '';
        return mId === id || (mId && id.indexOf(mId + '-') === 0);
      });
      if (manip) return { id: id, box: manip, step: stepOf(manip) };
    }
    var practice = document.getElementById('practice');
    var box = practice && Array.from(practice.querySelectorAll('.prob[data-question-id]')).find(function (item) {
      return item.getAttribute('data-question-id') === id;
    });
    return box ? { id: id, box: box, step: stepOf(box) } : null;
  }
  function visibleFeedback(box) {
    if (isPrimary) {
      if (box.classList && box.classList.contains('done')) return true;
      var fb = box.querySelector && box.querySelector('.fb');
      return !!(fb && fb.textContent.trim() && !fb.classList.contains('tip'));
    }
    var reveal = box.querySelector('.reveal');
    return !!(reveal && !reveal.hidden && box.classList.contains('done'));
  }
  function findSavedResume() {
    var saved = initialSnapshot && initialSnapshot.resume;
    if (saved && saved.sectionId === sectionId) return saved;
    if (isPrimary && initialSnapshot && Array.isArray(initialSnapshot.events)) {
      for (var i = initialSnapshot.events.length - 1; i >= 0; i--) {
        var ev = initialSnapshot.events[i];
        if (ev && ev.sectionId === sectionId && ev.step >= 1 && ev.step <= steps.length) return ev;
      }
    }
    return null;
  }
  function practiceStep() {
    if (!isPrimary) return 4;
    var idx = steps.findIndex(function (s) {
      var t = s.getAttribute && s.getAttribute('data-title');
      return t === '练一练' || t === '单元闯关';
    });
    if (idx >= 0) return idx + 1;
    var lastTitle = steps.length && steps[steps.length - 1].getAttribute && steps[steps.length - 1].getAttribute('data-title');
    if (lastTitle === '在家玩' && steps.length >= 2) return steps.length - 1;
    return Math.min(4, steps.length || 1);
  }
  function answeredCount() {
    var count = 0;
    var snapQuestions = initialSnapshot && Array.isArray(initialSnapshot.questions) ? initialSnapshot.questions : [];
    questions.forEach(function (meta) {
      if (sessionAnswered.has(meta.id) || (meta.box.classList && meta.box.classList.contains('done'))) { count++; return; }
      if (meta.version && stateAPI && stateAPI.question(identifiers(meta)).hasAnswered) { count++; return; }
      if (snapQuestions.some(function (q) { return q.sectionId === sectionId && q.questionId === meta.id && q.firstAnswer; })) count++;
    });
    return count;
  }
  function write(event) {
    if (!stateAPI) return;
    try { stateAPI.record(event); } catch (error) { showUnavailable(); }
  }
  function showUnavailable() {
    unavailable = true;
    if (toolbar) toolbar.querySelector('[data-lc-storage]').hidden = false;
  }
  function resume(question, step) {
    if (!ready) { pendingResume = { questionId: question || '', step: step || currentStep() }; return; }
    currentQuestion = question || '';
    var address = new URL(location.href);
    if (currentQuestion) address.searchParams.set('focus', currentQuestion);
    else address.searchParams.delete('focus');
    if (address.href !== location.href) {
      try { history.replaceState(null, '', address.href); } catch (error) { /* file previews still work */ }
    }
    write({ kind: 'resume', source: 'course', sectionId: sectionId,
      step: step || currentStep(), questionId: currentQuestion || undefined });
    updateToolbar();
  }
  function identifiers(meta) {
    return { source: 'course', sectionId: sectionId, questionType: meta.questionType || 'predict',
      questionId: meta.id, contentVersion: meta.version, step: meta.step };
  }
  function queue(meta, callback) {
    meta.pending = meta.pending.then(function () {
      if (meta.version && stateAPI) callback(identifiers(meta));
    }).catch(showUnavailable);
  }
  function feedback(meta, time) {
    meta.feedbackSeen = true;
    queue(meta, function (ids) {
      var old = stateAPI.question(ids);
      if (!old.feedbackSeen) write(Object.assign({}, ids, { kind: 'feedback', time: time || Date.now() }));
    });
  }
  // Keep the original prompt, options, illustrations, explanation and correct answer in
  // the version. No retry buttons, learning links or rendered KaTeX enter this snapshot.
  boxes.forEach(function (box) {
    var id = box.getAttribute('data-id');
    if (!id || questions.has(id)) return;
    var source = JSON.stringify({ answer: box.getAttribute('data-answer'), html: box.innerHTML });
    var meta = { id: id, box: box, step: stepOf(box), version: null, feedbackSeen: false,
      viewed: false, beforePick: false, pending: Promise.resolve() };
    questions.set(id, meta);
    if (!window.crypto || !window.crypto.subtle) { showUnavailable(); return; }
    var bytes;
    try {
      var authored = (isPrimary || isJunior) && box.getAttribute('data-lc-source');
      bytes = authored ? Uint8Array.from(window.atob(authored), function (c) { return c.charCodeAt(0); }) : new TextEncoder().encode(source);
    } catch (error) { showUnavailable(); return; }
    meta.pending = window.crypto.subtle.digest('SHA-256', bytes).then(function (hash) {
      meta.version = 'sha256:' + Array.from(new Uint8Array(hash), function (n) { return n.toString(16).padStart(2, '0'); }).join('');
    }).catch(showUnavailable);
  });
  function metaFor(target) {
    var box = target && target.closest && target.closest(questionSelector);
    var meta = box && questions.get(box.getAttribute('data-id'));
    return meta && meta.box === box ? meta : null;
  }
  // Capture exposure before the native onclick reveals the answer. The native event
  // below is the source of truth for a successful submission, including correctness.
  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.hci-guide > summary')) guideTouched = true;
    var meta = metaFor(event.target);
    if (!meta) return;
    if (visibleFeedback(meta.box)) feedback(meta);
    var option = event.target.closest('.opt') || (isPrimary && event.target.closest('.pad button'));
    if (option && !meta.box.classList.contains('done')) meta.beforePick = meta.feedbackSeen || visibleFeedback(meta.box);
  }, true);
  document.addEventListener('predict:pick', function (event) {
    var meta = metaFor(event.target), detail = event.detail || {};
    if (!meta || detail.id !== meta.id || typeof detail.correct !== 'boolean') return;
    if (!Array.from(meta.box.querySelectorAll('.opt')).some(function (opt) { return opt.getAttribute('data-v') === detail.choice; })) return;
    var seenBefore = meta.beforePick || meta.feedbackSeen, revealedNow = visibleFeedback(meta.box), time = Date.now();
    sessionAnswered.add(meta.id);
    queue(meta, function (ids) {
      var existing = stateAPI.question(ids);
      write(Object.assign({}, ids, { kind: 'answer', choice: detail.choice,
        correct: detail.correct, feedbackSeen: seenBefore || existing.feedbackSeen, time: time }));
      if (revealedNow) write(Object.assign({}, ids, { kind: 'feedback', time: time }));
      updateToolbar();
      meta.box.dispatchEvent(new CustomEvent('course:answer', { bubbles: true, detail: Object.assign({}, ids, { correct: detail.correct, time: time }) }));
    });
    meta.feedbackSeen = true;
    meta.beforePick = true;
    resume(meta.id, meta.step);
  });
  document.addEventListener('predict:reset', function (event) {
    var meta = metaFor(event.target);
    if (!meta) return;
    // Resetting the UI never erases evidence or makes a feedback-exposed retry independent.
    meta.beforePick = meta.feedbackSeen;
    resume(meta.id, meta.step);
  });
  ['predict:peek', 'fill:peek'].forEach(function (name) {
    document.addEventListener(name, function (event) {
      var meta = metaFor(event.target), detail = event.detail || {};
      if (!isPrimary || !meta || detail.id !== meta.id) return;
      var time = Date.now();
      meta.feedbackSeen = true;
      meta.beforePick = true;
      queue(meta, function (ids) {
        write(Object.assign({}, ids, { kind: 'feedback', source: 'course-peek', time: time }));
      });
    });
  });
  document.addEventListener('fill:submit', function (event) {
    var meta = metaFor(event.target), detail = event.detail || {};
    if (!meta || detail.id !== meta.id || typeof detail.correct !== 'boolean' || typeof detail.value !== 'string' || !detail.value) return;
    var seenBefore = meta.beforePick || meta.feedbackSeen, revealedNow = visibleFeedback(meta.box), time = Date.now();
    sessionAnswered.add(meta.id);
    queue(meta, function (ids) {
      var existing = stateAPI.question(ids);
      write(Object.assign({}, ids, { kind: 'answer', choice: detail.value,
        correct: detail.correct, feedbackSeen: seenBefore || existing.feedbackSeen, time: time }));
      if (revealedNow) write(Object.assign({}, ids, { kind: 'feedback', time: time }));
      updateToolbar();
      meta.box.dispatchEvent(new CustomEvent('course:answer', { bubbles: true, detail: Object.assign({}, ids, { correct: detail.correct, time: time }) }));
    });
    meta.feedbackSeen = true;
    meta.beforePick = true;
    resume(meta.id, meta.step);
  });
  /* manip:answer 的 ID 规则——按 data-manip 真实注册名（PeiyuManip.register / reg）逐条对照生产者，只放行生产者真会产生的 ID：
     基名优先级（取第一个非空）：
       shushi / vsfig / kuai   cfg.id → data-id → root.id    共用 emitAns (kits/shushi.js:97, :271, :282；注册 :734-736)
       eqbuild                 cfg.id → root.id → data-id，再回落 "eqbuild-add|sub|eq"   (kits/lowgrade.js:629, :767；注册 :975)
       其余                    cfg.id → root.id             (manip.js:37; kits/chengfa.js:102（panzi/kancheng/guji/dianzi/koushuan/bianhua/calc/ones，注册 :611-618）;
                                                              lowgrade.js:136（tapcount 等其余 8 个）; fenyifen.js:54（fenyifen/koujue）; circle.js:93; gridmotion.js:122)
     无显式基名时的兜底：kind + (同类第 2 个起 "-N")；
       circle 为 "circle-" + mode（缺省 compass）+ tail（circle.js:93）；gridmotion 为 "gridmotion-" + cfg.mode + tail（gridmotion.js:72, :122，mode 必填、无缺省值）；
       shushi 另有 "shushi-AxB"（shushi.js:271, :282）。
     后缀白名单：只有 shushi（题序号 qi，shushi.js:93-97, :521）和 kancheng（cases 序号 ci，仅 cases 多于 1 题时，chengfa.js:220-224）
       会在基名后加 "-<纯数字>"；其他教具 ID 必须与基名完全相等，任意后缀一律拒绝。 */
  var MANIP_SUFFIX_KINDS = { shushi: 1, kancheng: 1 };
  function manipExpectedIds(node) {
    var kind = (node.getAttribute('data-manip') || '').trim();
    if (!kind) return null;
    var cfg = null;
    try { cfg = JSON.parse(node.getAttribute('data-cfg') || 'null'); } catch (e) { cfg = null; }
    var cfgId = cfg && typeof cfg.id === 'string' ? cfg.id.trim() : '';
    var dataId = (node.getAttribute('data-id') || '').trim();
    var rootId = (node.id || '').trim();
    var shushiGroup = kind === 'shushi' || kind === 'vsfig' || kind === 'kuai';
    var order = shushiGroup ? [cfgId, dataId, rootId] : kind === 'eqbuild' ? [cfgId, rootId, dataId] : [cfgId, rootId];
    var base = order.filter(Boolean)[0] || '';
    var suffixOk = Object.prototype.hasOwnProperty.call(MANIP_SUFFIX_KINDS, kind);
    var exact = [], patterns = [];
    if (base) exact.push(base);
    else {
      var same = Array.from(document.querySelectorAll('.manip[data-manip="' + kind + '"]'));
      var idx = same.indexOf(node);
      var tail = idx > 0 ? '-' + (idx + 1) : '';
      var mode = cfg && typeof cfg.mode === 'string' ? cfg.mode : '';
      exact.push(kind + tail);
      if (kind === 'circle') exact.push('circle-' + (mode || 'compass') + tail);
      if (kind === 'gridmotion' && mode) exact.push('gridmotion-' + mode + tail);
      if (kind === 'eqbuild') ['add', 'sub', 'eq'].forEach(function (k) { exact.push('eqbuild-' + k); });
      if (kind === 'shushi') patterns.push(/^shushi-\d+x\d+$/);
    }
    return { exact: exact, patterns: patterns, suffixOk: suffixOk };
  }
  function matchesManipId(node, id) {
    if (typeof id !== 'string' || !id) return false;
    var exp = manipExpectedIds(node);
    if (!exp) return false;
    function one(v) {
      return exp.exact.indexOf(v) >= 0 || exp.patterns.some(function (re) { return re.test(v); });
    }
    if (one(id)) return true;
    if (!exp.suffixOk) return false;
    var m = /^(.+)-(\d+)$/.exec(id);
    return !!(m && one(m[1]));
  }
  document.addEventListener('manip:answer', function (event) {
    var detail = event && event.detail;
    if (!detail || typeof detail !== 'object') return;
    var rawId = detail.id;
    if (typeof rawId !== 'string') return;
    var id = rawId.trim();
    if (!id || id !== rawId) return;
    if (typeof detail.correct !== 'boolean') return;
    if (typeof detail.value !== 'string' || !detail.value.trim()) return;
    if (detail.first !== undefined && typeof detail.first !== 'boolean') return;
    var target = event.target;
    var root = null;
    if (target === document) {
      /* document 级只认 PeiyuP.log("fill"|"eq") 同步派发的 legacy 事件（primary.js log()）：
         派发期间 _activeLegacyAnswer 就是这次的 detail 对象本身；外部脚本伪造的事件到不了这条通路。 */
      var activeLegacy = window.PeiyuP && window.PeiyuP._activeLegacyAnswer;
      if (!isPrimary || !activeLegacy || activeLegacy !== detail) return;
    } else {
      root = target && target.closest ? target.closest('.manip') : null;
      if (!root || !matchesManipId(root, id)) return;
    }
    if (root && !root.getAttribute('data-lab-id')) root.setAttribute('data-lab-id', id);
    var step = (root && stepOf(root)) || currentStep();
    var ids = { source: 'course', sectionId: sectionId, questionType: 'lab',
      questionId: id, contentVersion: 'manip:' + ((root && root.getAttribute('data-manip')) || 'custom') + ':' + id, step: step };
    var existing = stateAPI ? stateAPI.question(ids) : { feedbackSeen: false };
    var time = Date.now();
    write(Object.assign({}, ids, { kind: 'answer', choice: detail.value,
      correct: detail.correct, feedbackSeen: !!(existing.feedbackSeen || detail.first === false), time: time }));
    write(Object.assign({}, ids, { kind: 'feedback', time: time }));
    updateToolbar();
    resume(id, step);
  });

  function context(question, step) {
    var meta = focusTarget(question || '');
    return { from: sectionId, step: meta ? meta.step : (step || currentStep()), question: meta ? meta.id : '' };
  }
  function href(path, ctx) { return dataAPI.withContext(path, ctx); }
  function pointHref(id, ctx) {
    var out = new URL(href('knowledge.html', ctx));
    out.searchParams.set('section', sectionId);
    if (id) out.hash = 'point=' + encodeURIComponent(id);
    return out.href;
  }
  function practiceHref(point, ctx) {
    if (isJunior && point) return pointHref(point, ctx);
    var out = new URL(href('practice.html', ctx));
    out.searchParams.set(point ? 'point' : 'section', point || sectionId);
    return out.href;
  }
  function goBackHref(ctx) { return dataAPI.returnHref(ctx); }
  function updateToolbar() {
    if (!toolbar) return;
    toolbar.querySelector('[data-lc-stage]').textContent = labels[currentStep() - 1] || '本节';
    var progressNode = toolbar.querySelector('[data-lc-progress]');
    if (progressNode) progressNode.textContent = '本节已做 ' + answeredCount() + '/' + questions.size;
    var resumeNode = toolbar.querySelector('[data-lc-resume]');
    if (resumeNode) {
      var targetStep = lastSavedStep >= 1 && lastSavedStep <= steps.length ? lastSavedStep : 0;
      resumeNode.hidden = !targetStep;
      if (targetStep) resumeNode.href = '#step' + targetStep;
    }
    var pracNode = toolbar.querySelector('[data-lc-practice]');
    if (pracNode) pracNode.href = hasPoints ? practiceHref('', context(currentQuestion)) : ('#step' + practiceStep());
  }
  function decorateTabs() {
    var tabs = Array.from(document.querySelectorAll('nav.steps [role=tab]'));
    if (isPrimary) {
      tabs.forEach(function (tab, index) {
        tab.setAttribute('data-learning-stage', String(index + 1));
      });
      return;
    }
    tabs.forEach(function (tab, index) {
      var title = labels[index];
      if (!title) return;
      var full = tab.querySelector('.hci-t'), short = tab.querySelector('.hci-s');
      if (full && full.textContent !== title) full.textContent = title;
      if (short && short.textContent !== title) short.textContent = title;
      var fallback = (index + 1) + ' ' + title;
      if (!full && !tab.querySelector('.hci-ck') && tab.textContent !== fallback) tab.textContent = fallback;
      var name = '第 ' + (index + 1) + ' 步：' + title + (seenSteps.has(index + 1) ? '（已查看）' : '');
      if (tab.getAttribute('aria-label') !== name) tab.setAttribute('aria-label', name);
      if (tab.classList.contains('hci-done')) tab.classList.remove('hci-done');
      tab.setAttribute('data-learning-stage', String(index + 1));
      var next = steps[index] && steps[index].querySelector(':scope > .next button');
      if (next && labels[index + 1]) next.textContent = '下一步：' + labels[index + 1];
    });
  }
  function buildDialog() {
    dialog = el('dialog', '', 'lc-dialog'); dialog.id = 'lc-knowledge-dialog';
    dialog.setAttribute('aria-labelledby', 'lc-dialog-title');
    var heading = el('div', '', 'lc-dialog-heading');
    var title = el('h2', '本节知识点'); title.id = 'lc-dialog-title';
    var close = el('button', '关闭，继续学习', 'lc-button'); close.type = 'button';
    close.addEventListener('click', closeDialog);
    heading.append(title, close); dialog.appendChild(heading);
    dialog.appendChild(el('p', '这里列出与本节相关的知识点，可按需要选读。', 'lc-note'));
    var list = el('div', '', 'lc-points');
    var optionalList;
    lessonData.pointIds.forEach(function (id) {
      var point = dataAPI.point(id); if (!allowedPoint(id)) return;
      var button = el('button', point.title + (point.course_scope === 'optional' ? '（选学）' : ''), 'lc-point-button'); button.type = 'button';
      button.setAttribute('data-lc-point', id); button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'lc-point-content');
      button.addEventListener('click', function () { renderPoint(id, true); });
      if (isJunior && point.course_scope === 'optional') {
        if (!optionalList) { optionalList = el('details'); optionalList.appendChild(el('summary', '选学知识点')); list.appendChild(optionalList); }
        optionalList.appendChild(button);
      } else list.appendChild(button);
    });
    if (!list.children.length) list.appendChild(el('p', '本节知识点关系仍在整理，可打开知识库目录查找。', 'lc-note'));
    dialog.appendChild(list);
    var actions = el('div', '', 'lc-dialog-links');
    var full = el('a', '在知识库中查看', 'lc-link'); full.setAttribute('data-lc-full', '');
    var practice = el('a', '练习本节', 'lc-link'); practice.setAttribute('data-lc-practice', '');
    actions.append(full, practice); dialog.appendChild(actions);
    var content = el('div', '', 'lc-point-content'); content.id = 'lc-point-content'; dialog.appendChild(content);
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeDialog(); });
    document.body.appendChild(dialog);
  }
  function restoreFocus() {
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    document.querySelectorAll('[data-lc-open]').forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
  }
  function closeDialog() {
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); restoreFocus(); }
  }
  function setDialogLinks() {
    dialog.querySelector('[data-lc-full]').href = pointHref(dialogPoint, dialogContext);
    var link = dialog.querySelector('[data-lc-practice]');
    link.href = practiceHref(dialogPoint, dialogContext);
    link.textContent = dialogPoint ? '练习这个知识点' : '练习本节';
  }
  function renderPoint(id, focus) {
    if (!allowedPoint(id)) return;
    dialogPoint = id;
    var content = dialog.querySelector('.lc-point-content');
    window.PeiyuKnowledge.renderPoint(content, id, { contextSection: sectionId,
      onNavigate: function (next) { renderPoint(next, true); } });
    // Native knowledge rendering remains shared; only its navigation acquires the
    // exact departure context, including links opened in a new tab.
    content.querySelectorAll('[data-knavigate]').forEach(function (link) {
      link.href = pointHref(link.getAttribute('data-knavigate'), dialogContext);
    });
    var links = content.querySelectorAll('.k-lesson-links a');
    if (links[0]) { links[0].href = goBackHref(dialogContext); links[0].textContent = dialogContext.question ? '回到刚才的题目' : '回到当前步骤'; }
    if (links[1]) { links[1].href = practiceHref(id, dialogContext); links[1].textContent = '练习这个知识点'; }
    dialog.querySelectorAll('[data-lc-point]').forEach(function (button) {
      button.setAttribute('aria-expanded', String(button.getAttribute('data-lc-point') === id));
      if (button.getAttribute('data-lc-point') === id && button.closest('details')) button.closest('details').open = true;
    });
    setDialogLinks();
    if (focus) {
      var title = content.querySelector('h2');
      if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); title.scrollIntoView({ block: 'nearest' }); }
    }
  }
  function openDialog(button, question) {
    returnFocus = button; dialogContext = context(question || currentQuestion); dialogPoint = '';
    dialog.querySelector('.lc-point-content').replaceChildren();
    dialog.querySelectorAll('[data-lc-point]').forEach(function (point) { point.setAttribute('aria-expanded', 'false'); });
    setDialogLinks(); button.setAttribute('aria-expanded', 'true');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    dialog.scrollTop = 0;
    dialog.querySelector('button').focus({ preventScroll: true });
    resume(dialogContext.question, dialogContext.step);
  }
  function knowledgeButton(question) {
    var button = el('button', '本节知识点', 'lc-button'); button.type = 'button';
    button.setAttribute('data-lc-open', ''); button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'lc-knowledge-dialog'); button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', function () { openDialog(button, question); });
    return button;
  }
  function buildTools(bar) {
    toolbar = el('aside', '', 'lc-toolbar'); toolbar.setAttribute('aria-label', '当前步骤学习工具');
    var stage = el('span', '', 'lc-stage'); stage.setAttribute('data-lc-stage', '');
    var storage = el('p', '本页暂时无法保存新的答题证据，课程和知识卡仍可使用。', 'lc-note');
    storage.setAttribute('data-lc-storage', ''); storage.hidden = !unavailable;
    // 没有知识点的学段（初中 / 小学）：工具条显示当前步骤（小学还显示本节已做 n/m、回到上次那一步）和本节练一练
    if (!hasPoints) {
      var nextStep = el('a', '本节练一练', 'lc-link'); nextStep.setAttribute('data-lc-practice', '');
      if (isPrimary) {
        var progress = el('span', '', 'lc-progress'); progress.setAttribute('data-lc-progress', '');
        var resumeBtn = el('a', '回到上次那一步', 'lc-link'); resumeBtn.setAttribute('data-lc-resume', '');
        resumeBtn.addEventListener('click', function (e) {
          var target = lastSavedStep >= 1 && lastSavedStep <= steps.length ? lastSavedStep : 1;
          var tab = document.querySelectorAll('nav.steps [role=tab]')[target - 1];
          if (tab) { e.preventDefault(); tab.click(); }
        });
        nextStep.addEventListener('click', function (e) {
          var pStep = practiceStep();
          var tab = document.querySelectorAll('nav.steps [role=tab]')[pStep - 1];
          if (tab) { e.preventDefault(); tab.click(); }
        });
        toolbar.append(stage, progress, resumeBtn, nextStep);
        if (lessonData && lessonData.conceptCards) {
          var cards = el('a', '本课概念卡', 'lc-button'); cards.setAttribute('data-lc-concepts', '');
          var cardsHref = new URL(dataAPI.url('knowledge.html'));
          cardsHref.searchParams.set('section', sectionId); cardsHref.searchParams.set('from', sectionId);
          cards.href = cardsHref.href;
          nextStep.before(cards);
        }
        toolbar.append(storage);
      } else {
        toolbar.append(stage, nextStep, storage);
      }
      bar.after(toolbar); updateToolbar(); return;
    }
    var button = knowledgeButton('');
    var link = el('a', '练习本节', 'lc-link'); link.setAttribute('data-lc-practice', '');
    link.addEventListener('click', function () { resume(currentQuestion); });
    toolbar.append(stage, button, link, storage); bar.after(toolbar);
    document.querySelectorAll('[data-knowledge-course]').forEach(function (slot) { slot.hidden = true; });
    questions.forEach(function (meta) {
      var tools = el('div', '', 'lc-question-tools');
      tools.appendChild(knowledgeButton(meta.id));
      var practice = el('a', '练习本节', 'lc-link'); practice.href = practiceHref('', context(meta.id));
      practice.addEventListener('click', function () { resume(meta.id, meta.step); });
      tools.appendChild(practice); meta.box.appendChild(tools);
    });
    updateToolbar();
  }
  function observeViews() {
    function view(meta) {
      if (document.visibilityState === 'hidden') return;
      if (!meta.viewed) {
        meta.viewed = true;
        queue(meta, function (ids) { write(Object.assign({}, ids, { kind: 'view' })); });
      }
      if (visibleFeedback(meta.box) && !meta.feedbackSeen) feedback(meta);
    }
    if ('IntersectionObserver' in window) {
      viewObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { if (entry.isIntersecting) view(metaFor(entry.target)); });
      }, { threshold: 0.05 });
      questions.forEach(function (meta) { viewObserver.observe(meta.box); });
    } else {
      questions.forEach(function (meta) { if (meta.step === currentStep()) view(meta); });
    }
  }
  function restoreLocation() {
    var match = initialHash.match(/^#step([1-5])$/), step = match ? Number(match[1]) : 0;
    var requestedFocus = initialFocus || '', focus = focusTarget(requestedFocus);
    // Only a known DOM question can choose a focus target; arbitrary selectors and
    // supplied return URLs are never evaluated.
    if (focus) step = focus.step;
    var saved = findSavedResume();
    if (saved && saved.sectionId === sectionId && saved.step >= 1 && saved.step <= steps.length) {
      lastSavedStep = Number(saved.step);
    }
    if (!step && saved && saved.sectionId === sectionId) {
      step = Number(saved.step);
      requestedFocus = saved.questionId || '';
      focus = focusTarget(requestedFocus);
      if (focus) step = focus.step;
    }
    if (pendingResume) {
      step = pendingResume.step;
      requestedFocus = pendingResume.questionId || '';
      focus = focusTarget(requestedFocus);
    }
    if (!(step >= 1 && step <= steps.length)) step = currentStep();
    var tab = document.querySelectorAll('nav.steps [role=tab]')[step - 1];
    if (tab && step !== currentStep()) tab.click();
    function showTarget(target) {
      var targetTab = document.querySelectorAll('nav.steps [role=tab]')[target.step - 1];
      if (targetTab && target.step !== currentStep()) targetTab.click();
      // A reviewed question may live inside the "later chapters" disclosure.
      for (var parent = target.box.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
      currentQuestion = target.id;
      target.box.tabIndex = -1;
      // HCI queues its step-header scroll on the tab click. Focus afterward so
      // that scroll cannot replace the exact question return with the step top.
      setTimeout(function () {
        if (currentStep() !== target.step || currentQuestion !== target.id) return;
        target.box.focus({ preventScroll: true });
        target.box.scrollIntoView({ block: 'start', behavior: 'instant' });
      }, 0);
    }
    if (focus) showTarget(focus);
    else if (requestedFocus) {
      // lesson.js fetches reviewed exam questions asynchronously. Wait for their
      // stable DOM IDs without guessing selectors or moving a student who left.
      var practice = document.getElementById('practice');
      if (!practice) return;
      var observer = new MutationObserver(function () {
        var target = focusTarget(requestedFocus);
        if (!target) return;
        observer.disconnect();
        document.removeEventListener('step', cancel);
        showTarget(target);
        resume(target.id, target.step);
      });
      function cancel() { observer.disconnect(); document.removeEventListener('step', cancel); }
      document.addEventListener('step', cancel);
      observer.observe(practice, { childList: true, subtree: true });
    }
  }
  // 连续学习：按学习目录的顺序找上一节 / 下一节（跳过未上线的节）。
  // 小学按「单元里的课 → 单元首页（小结与闯关）」排；高中、初中按 order。
  function lessonSequence(index) {
    var lessons = (index.lessons || []).slice();
    function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }
    if (isPrimary && Array.isArray(index.units)) {
      var seq = [], placed = new Set();
      index.units.forEach(function (u) {
        lessons.filter(function (l) { return l.unitId === u.id; }).sort(byOrder).forEach(function (l) {
          placed.add(l.id); if (l.ready !== false) seq.push(l);
        });
        if (u.ready) seq.push(u);
      });
      return seq.concat(lessons.filter(function (l) { return !placed.has(l.id) && l.ready !== false; }).sort(byOrder));
    }
    return lessons.filter(function (l) { return l.ready !== false; }).sort(byOrder);
  }
  function lessonName(l) {
    if (l.isUnit) return '单元小结与闯关：' + (l.unitTitle || l.title);
    var m = !isPrimary && !isJunior && /^[a-z]\d+-(\d+)-(\d+)$/.exec(l.id);
    return m && !/^\d/.test(l.title) ? m[1] + '.' + m[2] + ' ' + l.title : l.title;
  }
  function chapterName(l) {
    if (isPrimary) return l.bookTitle + ' · ' + (l.unitTitle || l.chapterTitle || '');
    var m = !isJunior && /^[a-z]\d+-(\d+)-/.exec(l.id);
    var chapter = m && !/^第/.test(l.chapterTitle || '') ? '第 ' + m[1] + ' 章 ' + l.chapterTitle : (l.chapterTitle || '');
    return l.bookTitle + ' · ' + chapter;
  }
  function chapterKey(l) { return isPrimary ? (l.unitId || l.chapterId) : l.chapterId; }
  function coursesHref(l) {
    var u = new URL(dataAPI.url('courses.html'));
    if (isPrimary && l && l.gradeId) u.searchParams.set('grade', l.gradeId);
    else if (isJunior && l && l.bookId) u.searchParams.set('book', l.bookId);
    return u.href;
  }
  var unitWord = isPrimary ? '课' : '节';
  function lessonHref(l) { return dataAPI.url('lessons/' + l.id + '.html#step1'); }
  function pagerLink(l, key, className) {
    var a = el('a', '', className);
    if (l) { a.href = lessonHref(l); a.append(el('span', key, 'lc-pager-k'), el('span', lessonName(l), 'lc-pager-t')); }
    else { a.classList.add('is-empty'); a.setAttribute('aria-hidden', 'true'); }
    return a;
  }
  function buildLessonNav(index) {
    var seq = lessonSequence(index);
    var at = seq.findIndex(function (l) { return l.id === sectionId; });
    if (at < 0) return;
    var here = seq[at], prev = seq[at - 1], next = seq[at + 1];
    // 页底：上一节 · 全部课程 · 下一节（每一步都看得到）
    var back = document.querySelector('nav.back');
    if (!back && steps.length) {
      // 初中课页没有页底返回栏：补一条放在课程正文末尾。
      back = el('nav', '', 'back');
      (steps[steps.length - 1].closest('main') || steps[steps.length - 1].parentNode).appendChild(back);
    }
    if (back) {
      back.classList.add('lc-pager'); back.setAttribute('aria-label', '上一' + unitWord + '和下一' + unitWord);
      back.textContent = '';
      var all = el('a', '全部课程', 'home lc-pager-all'); all.href = coursesHref(here);
      back.append(pagerLink(prev, '← 上一' + unitWord, 'lc-pager-prev'), all, pagerLink(next, '下一' + unitWord + ' →', 'lc-pager-next'));
    }
    // 最后一步末尾：学完本节，直接接下一节。小学单元首页自带「往下学」，不重复。
    var last = steps[steps.length - 1];
    if (!last || (last.getAttribute('data-title') || '') === '往下学') return;
    var card = el('nav', '', 'lc-next-lesson'); card.setAttribute('aria-label', '接着学下一' + unitWord);
    if (next) {
      var newBook = next.bookId !== here.bookId, newChapter = chapterKey(next) !== chapterKey(here);
      var eyebrow = newBook ? '这一册学完了，进入新的一册' : newChapter ? (isPrimary ? '这个单元学完了，进入下一单元' : '这一章学完了，进入下一章')
        : (next.isUnit ? '这个单元的课学完了，做一次单元小结' : '这一' + unitWord + '学完了，接着学');
      card.appendChild(el('p', eyebrow, 'lc-nl-eyebrow'));
      var main = el('a', '', 'lc-nl-main'); main.href = lessonHref(next);
      main.append(el('span', chapterName(next), 'lc-nl-where'), el('strong', lessonName(next), 'lc-nl-title'), el('span', '继续学下一' + unitWord + ' →', 'lc-nl-go'));
      card.appendChild(main);
    } else {
      card.appendChild(el('p', '已经学到目前上线的最后一' + unitWord + '了', 'lc-nl-eyebrow'));
      card.appendChild(el('p', '可以去「我的学习」回看做过的题，或在课程目录里挑一' + unitWord + '复习。', 'lc-nl-note'));
    }
    var links = el('div', '', 'lc-nl-links');
    var rec = el('a', '查看我的学习记录', 'lc-link'); rec.href = dataAPI.url('learning.html');
    var cat = el('a', '全部课程', 'lc-link'); cat.href = coursesHref(here);
    links.append(rec, cat); card.appendChild(links);
    last.appendChild(card);
  }
  function enhance() {
    var bar = document.querySelector('nav.steps');
    if (!bar) return;
    document.body.classList.add('lc-course');
    var guide = document.querySelector('.hci-guide'), preference = null;
    try { preference = localStorage.getItem('peiyu.hs.hci.guide.open'); } catch (error) { /* no preference */ }
    if (guide && preference === null && !guideTouched) guide.open = false;
    buildDialog(); buildTools(bar); restoreLocation();
    if (indexData) { try { buildLessonNav(indexData); } catch (error) { /* 导航出错不影响课程本身 */ } }
    ready = true; seenSteps.add(currentStep()); decorateTabs(); resume(currentQuestion);
    var painting = false;
    new MutationObserver(function () {
      if (painting) return; painting = true;
      queueMicrotask(function () { decorateTabs(); painting = false; });
    }).observe(bar, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'class'] });
    document.addEventListener('step', function () {
      var cs = currentStep();
      if (cs > 1) lastSavedStep = cs;
      seenSteps.add(cs); resume('', cs);
      queueMicrotask(decorateTabs);
      if (dialog.open) closeDialog();
    });
    observeViews();
    var initialPoint = new URLSearchParams(location.search).get('knowledge');
    if (initialPoint && allowedPoint(initialPoint)) {
      openDialog(toolbar.querySelector('[data-lc-open]'), currentQuestion); renderPoint(initialPoint, true);
    }
  }
  var loaded = new Promise(function (resolve) {
    if (document.readyState === 'complete') resolve(); else window.addEventListener('load', resolve, { once: true });
  });
  Promise.all([dataAPI.load(), loaded]).then(function (values) {
    lessonData = dataAPI.lesson(sectionId); knowledgeData = values[0].knowledge; indexData = values[0].index;
    if (lessonData && isJunior) lessonData = Object.assign({}, lessonData, { pointIds: lessonData.pointIds.filter(allowedPoint) });
    if (!lessonData && isPrimary) lessonData = { id: sectionId, pointIds: [] };
    hasPoints = !!(lessonData && lessonData.pointIds && lessonData.pointIds.length);
    if (lessonData && knowledgeData) enhance();
  }).catch(function () {
    if (isPrimary) {
      loaded.then(function () { hasPoints = false; lessonData = { id: sectionId, pointIds: [] }; enhance(); });
      return;
    }
    // Preserve the original aside's direct link and all lesson interactions on failure.
    document.querySelectorAll('[data-knowledge-course]').forEach(function (slot) { slot.hidden = false; });
  });
})();
