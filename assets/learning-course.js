/* Course-side learning flow. Loaded with defer, before lesson DOMContentLoaded setup. */
(function () {
  'use strict';
  var sectionId = document.body.getAttribute('data-sec');
  var dataAPI = window.PeiyuLearningData, stateAPI = window.PeiyuLearningState;
  if (!sectionId || !dataAPI) return;
  var labels = ['先想一想', '理解概念', '动手探索', '练一练', '应用与真题'];
  var steps = Array.from(document.querySelectorAll('section.step'));
  var boxes = Array.from(document.querySelectorAll('.predict[data-id]'));
  var questions = new Map(), initialSnapshot = null, ready = false, guideTouched = false;
  var initialHash = location.hash, initialFocus = new URLSearchParams(location.search).get('focus');
  var currentQuestion = '', seenSteps = new Set(), toolbar, dialog, dialogContext, dialogPoint;
  var returnFocus, lessonData, knowledgeData, viewObserver, unavailable = false, pendingResume = null;

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
  function currentStep() {
    var index = steps.findIndex(function (step) { return step.classList.contains('on'); });
    return index < 0 ? 1 : index + 1;
  }
  function stepOf(box) { return steps.indexOf(box.closest('section.step')) + 1; }
  function focusTarget(id) {
    if (!id) return null;
    var known = questions.get(id);
    if (known) return known;
    var practice = document.getElementById('practice');
    var box = practice && Array.from(practice.querySelectorAll('.prob[data-question-id]')).find(function (item) {
      return item.getAttribute('data-question-id') === id;
    });
    return box ? { id: id, box: box, step: stepOf(box) } : null;
  }
  function visibleFeedback(box) {
    var reveal = box.querySelector('.reveal');
    return !!(reveal && !reveal.hidden && box.classList.contains('done'));
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
    return { source: 'course', sectionId: sectionId, questionType: 'predict',
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
    meta.pending = window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source)).then(function (hash) {
      meta.version = 'sha256:' + Array.from(new Uint8Array(hash), function (n) { return n.toString(16).padStart(2, '0'); }).join('');
    }).catch(showUnavailable);
  });
  function metaFor(target) {
    var box = target && target.closest && target.closest('.predict[data-id]');
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
    var option = event.target.closest('.opt');
    if (option && !meta.box.classList.contains('done')) meta.beforePick = meta.feedbackSeen || visibleFeedback(meta.box);
  }, true);
  document.addEventListener('predict:pick', function (event) {
    var meta = metaFor(event.target), detail = event.detail || {};
    if (!meta || detail.id !== meta.id || typeof detail.correct !== 'boolean') return;
    if (!Array.from(meta.box.querySelectorAll('.opt')).some(function (opt) { return opt.getAttribute('data-v') === detail.choice; })) return;
    var seenBefore = meta.beforePick, revealedNow = visibleFeedback(meta.box), time = Date.now();
    queue(meta, function (ids) {
      var existing = stateAPI.question(ids);
      write(Object.assign({}, ids, { kind: 'answer', choice: detail.choice,
        correct: detail.correct, feedbackSeen: seenBefore || existing.feedbackSeen, time: time }));
      if (revealedNow) write(Object.assign({}, ids, { kind: 'feedback', time: time }));
    });
    meta.feedbackSeen = true;
    resume(meta.id, meta.step);
  });
  document.addEventListener('predict:reset', function (event) {
    var meta = metaFor(event.target);
    if (!meta) return;
    // Resetting the UI never erases evidence or makes a feedback-exposed retry independent.
    meta.beforePick = meta.feedbackSeen;
    resume(meta.id, meta.step);
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
    var out = new URL(href('practice.html', ctx));
    out.searchParams.set(point ? 'point' : 'section', point || sectionId);
    return out.href;
  }
  function goBackHref(ctx) { return dataAPI.returnHref(ctx); }
  function updateToolbar() {
    if (!toolbar) return;
    toolbar.querySelector('[data-lc-stage]').textContent = labels[currentStep() - 1] || '本节';
    toolbar.querySelector('[data-lc-practice]').href = practiceHref('', context(currentQuestion));
  }
  function decorateTabs() {
    var tabs = Array.from(document.querySelectorAll('nav.steps [role=tab]'));
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
    lessonData.pointIds.forEach(function (id) {
      var point = dataAPI.point(id); if (!point) return;
      var button = el('button', point.title, 'lc-point-button'); button.type = 'button';
      button.setAttribute('data-lc-point', id); button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'lc-point-content');
      button.addEventListener('click', function () { renderPoint(id, true); }); list.appendChild(button);
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
    if (!dataAPI.point(id)) return;
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
    var button = knowledgeButton('');
    var link = el('a', '练习本节', 'lc-link'); link.setAttribute('data-lc-practice', '');
    link.addEventListener('click', function () { resume(currentQuestion); });
    var storage = el('p', '本页暂时无法保存新的答题证据，课程和知识卡仍可使用。', 'lc-note');
    storage.setAttribute('data-lc-storage', ''); storage.hidden = !unavailable;
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
    var saved = initialSnapshot && initialSnapshot.resume;
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
  function enhance() {
    var bar = document.querySelector('nav.steps');
    if (!bar) return;
    document.body.classList.add('lc-course');
    var guide = document.querySelector('.hci-guide'), preference = null;
    try { preference = localStorage.getItem('peiyu.hs.hci.guide.open'); } catch (error) { /* no preference */ }
    if (guide && preference === null && !guideTouched) guide.open = false;
    buildDialog(); buildTools(bar); restoreLocation();
    ready = true; seenSteps.add(currentStep()); decorateTabs(); resume(currentQuestion);
    var painting = false;
    new MutationObserver(function () {
      if (painting) return; painting = true;
      queueMicrotask(function () { decorateTabs(); painting = false; });
    }).observe(bar, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'class'] });
    document.addEventListener('step', function () {
      seenSteps.add(currentStep()); resume('', currentStep());
      queueMicrotask(decorateTabs);
      if (dialog.open) closeDialog();
    });
    observeViews();
    var initialPoint = new URLSearchParams(location.search).get('knowledge');
    if (initialPoint && dataAPI.point(initialPoint)) {
      openDialog(toolbar.querySelector('[data-lc-open]'), currentQuestion); renderPoint(initialPoint, true);
    }
  }
  var loaded = new Promise(function (resolve) {
    if (document.readyState === 'complete') resolve(); else window.addEventListener('load', resolve, { once: true });
  });
  Promise.all([dataAPI.load(), loaded]).then(function (values) {
    lessonData = dataAPI.lesson(sectionId); knowledgeData = values[0].knowledge;
    if (lessonData && knowledgeData) enhance();
  }).catch(function () {
    // Preserve the original aside's direct link and all lesson interactions on failure.
    document.querySelectorAll('[data-knowledge-course]').forEach(function (slot) { slot.hidden = false; });
  });
})();
