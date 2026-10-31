/* Reviewed diagnostics, with durable separation of first answers and retries. */
(function () {
  "use strict";
  if (document.body.dataset.learningPage !== "practice") return;
  if (document.body.dataset.stage === "primary" && !new URLSearchParams(location.search).has("point") && !new URLSearchParams(location.search).has("section")) return;
  var host = document.getElementById("learning-app");
  if (!host) return;
  var dataAPI = window.PeiyuLearningData, state = window.PeiyuLearningState;
  var index, knowledge, points = [], variants = [], selectedId = "", selectedVariant = "", domain = "", section = "", includeExtras = false, active = null, reviewStarts = {};
  var query = new URLSearchParams(location.search), context = { from: "", step: 4, question: "" };
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 760px)") : { matches: false };
  function esc(value) { return dataAPI.escape(value); }
  function url(path) { return new URL(path, dataAPI.root || document.baseURI); }
  function contextual(path) {
    var target = url(path);
    if (context.from) {
      target.searchParams.set("from", context.from);
      target.searchParams.set("step", String(context.step));
      if (context.question) target.searchParams.set("question", context.question);
    }
    return target;
  }
  function pointHref(id, conditions) {
    var target = contextual("knowledge.html");
    if (conditions) target.searchParams.set("focus", "conditions");
    if (selectedVariant && selectedId === id) target.searchParams.set("variant", selectedVariant);
    target.hash = "point=" + encodeURIComponent(id); return target.href;
  }
  function returnHref() {
    var target = url("lessons/" + context.from + ".html");
    if (context.question) target.searchParams.set("focus", context.question);
    target.hash = "step" + context.step; return target.href;
  }
  function lesson(id) { return index.lessons.find(function (item) { return item.id === id; }); }
  function fullPoint(id) { return knowledge.points.find(function (item) { return item.id === id; }); }
  function pointIndex(id) { return points.find(function (item) { return item.id === id; }); }
  function scope(point) { return point.scope || point.course_scope || (fullPoint(point.id) || {}).course_scope; }
  function isExtra(point) { return ["optional", "enrichment"].indexOf(scope(point)) >= 0; }
  function scopeLabel(point) { return { required: "核心", selective_required: "选必", optional: "选学", enrichment: "拓展" }[scope(point)] || "知识点"; }
  function math(node) { if (window.PeiyuKnowledge) window.PeiyuKnowledge.renderMath(node); }
  function quizFor(point) { return variants.find(function (item) { return item.id === selectedVariant && item.point_id === point.id; }) || point.diagnostic; }
  function purposeLabel(point, quiz) {
    return quiz.id === point.diagnostic.id ? "诊断题" : quiz.role === "review" ? "复习题" : "平行变式";
  }
  function nextSupplement(point, role, exceptId) {
    var available = variants.filter(function (item) { return item.point_id === point.id && item.role === role && item.id !== exceptId; });
    return available.find(function (item) { return question(point, item).canAnswerIndependently; }) || available.find(function (item) { return !question(point, item).hasAnswered; }) || available[0];
  }
  function identity(point, quiz) {
    quiz = quiz || point.diagnostic;
    var metadata = pointIndex(point.id);
    return { pointId: point.id, questionId: quiz.id, questionType: "diagnostic", contentVersion: quiz.id === point.diagnostic.id ? metadata.diagnosticVersion : quiz.contentVersion, contentVersions: quiz.id === point.diagnostic.id ? metadata.diagnosticVersions : quiz.contentVersions, source: "practice", sectionId: context.from || section || point.first_section, step: context.step };
  }
  function question(point, quiz) { return state.question(identity(point, quiz)); }
  function date(time) { return new Date(time).toLocaleDateString("zh-CN", { month: "long", day: "numeric" }); }
  function statusText(point) {
    var item = fullPoint(point.id), summary = question(item);
    if (summary.lastAnswer) return summary.lastAnswer.correct ? "有作答记录 · 可再练" : "上次答错 · 回看条件后再练";
    if (!summary.canAnswerIndependently) return "有旧题目接触记录 · 独立情况未知";
    return "还没有作答记录";
  }
  function filtered() {
    return points.filter(function (point) { return (includeExtras || !isExtra(point)) && (!domain || point.domain === domain) && (!section || point.lessonIds.indexOf(section) >= 0); });
  }
  function updateAddress() {
    var target = new URL(location.href);
    if (selectedId) target.searchParams.set("point", selectedId); else target.searchParams.delete("point");
    if (selectedVariant) target.searchParams.set("variant", selectedVariant); else target.searchParams.delete("variant");
    if (section) target.searchParams.set("section", section); else target.searchParams.delete("section");
    if (domain) target.searchParams.set("domain", domain); else target.searchParams.delete("domain");
    if (includeExtras) target.searchParams.set("extras", "1"); else target.searchParams.delete("extras");
    history.replaceState(null, "", target.href);
  }
  function renderOptions() {
    var select = host.querySelector("[data-lp-section]");
    select.innerHTML = '<option value="">所有课时</option>' + index.lessons.filter(function (item) {
      return !domain || points.some(function (p) { return p.domain === domain && p.lessonIds.indexOf(item.id) >= 0; });
    }).map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.id + " " + item.title) + '</option>'; }).join("");
    select.value = section;
  }
  function renderList() {
    var list = filtered();
    host.querySelector("[data-lp-count]").textContent = list.length + " 个知识点可练习";
    host.querySelector("[data-lp-list]").innerHTML = list.length ? list.map(function (point) {
      return '<button type="button" class="lp-point" data-lp-point="' + esc(point.id) + '" aria-current="' + (point.id === selectedId ? "true" : "false") + '"><span>' + esc(point.title) + '</span><small>' + esc(scopeLabel(point) + " · " + statusText(point)) + '</small></button>';
    }).join("") : '<p class="lp-note">这组条件下还没有已审核的自测题。可以更换专题或课时。</p>';
    var current = host.querySelector("[data-lp-current]");
    current.textContent = selectedId ? "当前：" + pointIndex(selectedId).title : "先选专题或课时，再选知识点";
    math(current);
    math(host.querySelector("[data-lp-list]"));
  }
  function evidenceLabel(summary) {
    if (summary.feedbackSeen) return "本次：反馈后重做";
    if (summary.legacyExposure) return "本次：同题再练 · 首次独立情况未知";
    if (summary.hasAnswered) return "本次：同题再次作答";
    if (!summary.canAnswerIndependently) return "本次独立情况暂不能确认";
    return "本次将记为首次独立作答";
  }
  function eventLabel(event) {
    return event.attemptKind === "independent" ? "首次独立作答" : event.attemptKind === "retry" ? "反馈后重做" : event.attemptKind === "legacy" ? "旧记录 · 独立情况未知" : event.attemptKind === "unknown" ? "独立情况暂不能确认" : "同题再次作答";
  }
  function storageNotice() {
    var snapshot = state.snapshot(), area = host.querySelector("[data-lp-storage]");
    if (!area) return;
    var storage = snapshot.storage || {};
    area.hidden = !(storage.memoryOnly || storage.available === false || storage.persistent === false);
  }
  function selectPoint(id, focus, keepVariant) {
    var point = fullPoint(id);
    if (!point || !point.diagnostic || !pointIndex(id)) return;
    if (!keepVariant) selectedVariant = "";
    selectedId = id; updateAddress(); renderList(); renderQuestion(point);
    if (narrow.matches) host.querySelector("[data-lp-chooser]").open = false;
    if (focus) {
      var title = host.querySelector("[data-lp-title]");
      if (narrow.matches) title.scrollIntoView({ block: "start" });
      title.focus({ preventScroll: true });
    }
  }
  function renderQuestion(point, fresh) {
    var work = host.querySelector("[data-lp-work]"), quiz = quizFor(point), summary = question(point, quiz);
    var unexposedVariant = variants.find(function (item) { return item.point_id === point.id && item.role === "parallel" && item.id !== quiz.id && question(point, item).canAnswerIndependently; });
    active = { pointId: point.id, submitted: !fresh && !!summary.lastAnswer };
    var domainInfo = knowledge.domains.find(function (item) { return item.id === point.domain; });
    work.innerHTML = '<article class="lp-quiz"><header class="lp-quiz-head"><p class="lp-note">' + esc((domainInfo ? domainInfo.title + " / " : "") + point.group) + ' / <span data-lp-purpose>' + esc(purposeLabel(point, quiz)) + '</span></p><h2 data-lp-title tabindex="-1">' + esc(point.title) + '</h2><p class="lp-note">' + esc(scopeLabel(point)) + (isExtra(point) ? '内容，可按需练习，不作为核心课的默认要求。' : '内容') + '</p><a href="' + esc(pointHref(point.id)) + '">查看这个知识点</a><p><span class="lp-evidence-label" data-lp-evidence>' + esc(evidenceLabel(summary)) + '</span></p>' + (quiz.role === "review" ? '<p class="lp-note">复习题用来再次检验这个知识点。是否为首次作答，按这道题自己的记录区分。</p>' : '') + '</header>' +
      (!summary.lastAnswer && !summary.canAnswerIndependently && unexposedVariant ? '<p class="lp-note">这个知识点还有一题尚未作答的平行变式。</p><p><button type="button" class="lp-button secondary" data-lp-fresh-variant>换一道尚未作答的变式</button></p>' : '') +
      '<form data-lp-quiz><fieldset><legend>选择一个答案，再核对理由</legend><p class="lp-prompt lp-katex">' + esc(quiz.prompt) + '</p><div class="lp-options">' + quiz.options.map(function (option, i) {
        return '<label class="lp-option" data-lp-option="' + esc(option.id) + '"><input type="radio" name="practice-answer" value="' + esc(option.id) + '"><span><b>' + String.fromCharCode(65 + i) + '.</b> ' + esc(option.text) + '<small class="lp-option-result" data-lp-result hidden></small></span></label>';
      }).join("") + '</div></fieldset><p class="lp-alert" role="status" data-lp-warning hidden></p><div class="lp-actions"><button class="lp-button" type="submit" data-lp-submit>提交并查看解析</button></div><p class="lp-note">只记录这道题的表现。答对一道题还不足以判断是否掌握。</p></form>' +
      '<section class="lp-feedback" data-lp-feedback aria-live="polite" hidden></section><p class="lp-alert" data-lp-storage hidden>浏览器暂时无法保存记录；本页仍可练习，但刷新或离开后，本次新记录可能丢失。</p>' +
      (context.from ? '<p class="lp-return-line"><a href="' + esc(returnHref()) + '">回到' + esc(lesson(context.from).title) + ' · 第 ' + context.step + ' 步' + (context.question ? '原题' : '') + '</a></p>' : '') + '</article>';
    state.record(Object.assign({}, identity(point, quiz), { kind: "view" }));
    if (query.get("review") === "1" && !reviewStarts[quiz.id]) {
      state.record(Object.assign({}, identity(point, quiz), { kind: "review" })); reviewStarts[quiz.id] = true;
    }
    if (work.querySelector("[data-lp-fresh-variant]")) work.querySelector("[data-lp-fresh-variant]").addEventListener("click", function () {
      selectedVariant = unexposedVariant.id; updateAddress(); renderQuestion(point); work.querySelector("[data-lp-title]").focus({ preventScroll: true });
    });
    work.querySelector("[data-lp-quiz]").addEventListener("submit", function (event) {
      event.preventDefault();
      if (active.submitted) return;
      var selected = work.querySelector('input[name="practice-answer"]:checked');
      if (!selected) {
        var warning = work.querySelector("[data-lp-warning]"); warning.hidden = false; warning.textContent = "先选择一个答案，再核对理由。";
        work.querySelector('input[name="practice-answer"]').focus(); return;
      }
      var current = question(point, quiz);
      var answer = state.record(Object.assign({}, identity(point, quiz), { kind: "answer", choice: selected.value, correct: selected.value === quiz.correct, feedbackSeen: current.feedbackSeen === true }));
      if (!answer) {
        var warning = work.querySelector("[data-lp-warning]"); warning.hidden = false; warning.textContent = "这次记录暂时未能保存，请重新核对。"; return;
      }
      active.submitted = true;
      paintFeedback(point, answer);
      renderList();
      work.querySelector("[data-lp-feedback-title]").focus({ preventScroll: true });
    });
    if (active.submitted) paintFeedback(point, summary.lastAnswer, true);
    math(work); storageNotice();
  }
  function paintFeedback(point, answer, restored) {
    var work = host.querySelector("[data-lp-work]"), quiz = quizFor(point);
    var nextVariant = nextSupplement(point, "parallel", quiz.id);
    var nextReview = nextSupplement(point, "review", quiz.id);
    var chosen = quiz.options.find(function (option) { return option.id === answer.choice; });
    if (!chosen) { renderQuestion(point, true); return; }
    work.querySelectorAll('input[name="practice-answer"]').forEach(function (input) {
      input.checked = input.value === answer.choice; input.disabled = true;
      var label = input.closest("[data-lp-option]"), result = label.querySelector("[data-lp-result]");
      var correct = input.value === quiz.correct, wrong = input.value === answer.choice && !answer.correct;
      label.dataset.result = correct ? "correct" : wrong ? "incorrect" : "";
      result.hidden = !correct && !wrong; result.textContent = correct ? "正确选项" : "你选择的答案";
    });
    work.querySelector("[data-lp-submit]").hidden = true;
    work.querySelector("[data-lp-warning]").hidden = true;
    work.querySelector("[data-lp-evidence]").textContent = (restored ? "上次作答：" : "本次作答：") + eventLabel(answer);
    var feedback = work.querySelector("[data-lp-feedback]"); feedback.hidden = false;
    feedback.innerHTML = '<h3 data-lp-feedback-title tabindex="-1">' + (restored ? "上次作答" : "这次作答") + (answer.correct ? "正确，核对一下理由" : "需要订正，先找出漏掉的条件") + '</h3><p>' + esc(chosen.feedback) + '</p><ol>' + quiz.reasoning.map(function (line) { return '<li>' + esc(line) + '</li>'; }).join("") + '</ol>' +
      '<h3>用这个知识点前，先确认</h3><ul>' + (point.conditions || []).map(function (line) { return '<li>' + esc(line) + '</li>'; }).join("") + '</ul><p><a href="' + esc(pointHref(point.id, true)) + '">回看适用条件与常见误解</a></p>' +
      '<div class="lp-next"><h3>接下来</h3><p class="lp-note">' + (nextVariant ? '可以换一道已审核的平行变式，检查能否在另一组条件中解释理由。' : selectedVariant ? '这组题暂时没有更多平行变式。' : '这道题还没有配套的平行题。') + '重新作答会使用当前这道题，并记为“反馈后重做”，不会增加首次独立作答次数。</p>' + (nextReview ? '<p class="lp-note">复习题单独记录，不会替代当前这道题的复习安排。</p>' : '') + '<div class="lp-actions">' + (nextVariant ? '<button type="button" class="lp-button" data-lp-variant>换一道已审核变式</button>' : '') + (nextReview ? '<button type="button" class="lp-button secondary" data-lp-review-question>做一道复习题</button>' : '') + '<button type="button" class="lp-button secondary" data-lp-retry>重新做这道题</button>' + (selectedVariant ? '<button type="button" class="lp-button secondary" data-lp-original>回到原诊断题</button>' : '') + '<a class="lp-button secondary" href="' + esc(contextual("learning.html").href) + '">查看学习记录</a></div><p class="lp-note" data-lp-review></p>' +
      '<form class="lp-rating" data-lp-rating><fieldset><legend>此刻的自评（与作答结果分别记录）</legend><label><input type="radio" name="self-rating" value="need-help">还需帮助</label><label><input type="radio" name="self-rating" value="practice-more">还想再练</label><label><input type="radio" name="self-rating" value="can-explain">能解释理由</label></fieldset><div class="lp-actions"><button type="submit" class="lp-button secondary">保存自评</button><span class="lp-note" role="status" data-lp-rating-status></span></div></form></div>';
    if (!question(point, quiz).feedbackSeen) state.record(Object.assign({}, identity(point, quiz), { kind: "feedback" }));
    var reviewed = question(point, quiz);
    feedback.querySelector("[data-lp-review]").textContent = reviewed.reviewDueAt ? "已安排 " + date(reviewed.reviewDueAt) + " 再回看这个知识点。重做答对也会保留先前的复习安排。" : "可以稍后在“我的学习”回看这次记录。";
    feedback.querySelector("[data-lp-retry]").addEventListener("click", function () {
      renderQuestion(point, true); work.querySelector('input[name="practice-answer"]').focus({ preventScroll: true });
    });
    if (nextVariant) feedback.querySelector("[data-lp-variant]").addEventListener("click", function () {
      selectedVariant = nextVariant.id; updateAddress(); renderQuestion(point); work.querySelector("[data-lp-title]").focus({ preventScroll: true });
    });
    if (nextReview) feedback.querySelector("[data-lp-review-question]").addEventListener("click", function () {
      selectedVariant = nextReview.id; updateAddress(); renderQuestion(point); work.querySelector("[data-lp-title]").focus({ preventScroll: true });
    });
    if (selectedVariant) feedback.querySelector("[data-lp-original]").addEventListener("click", function () {
      selectedVariant = ""; updateAddress(); renderQuestion(point); work.querySelector("[data-lp-title]").focus({ preventScroll: true });
    });
    feedback.querySelector("[data-lp-rating]").addEventListener("submit", function (event) {
      event.preventDefault(); var selected = feedback.querySelector('input[name="self-rating"]:checked');
      var message = feedback.querySelector("[data-lp-rating-status]");
      if (!selected) { message.textContent = "先选择此刻的感受。"; feedback.querySelector('input[name="self-rating"]').focus(); return; }
      var rating = state.record(Object.assign({}, identity(point, quiz), { kind: "self-rating", rating: selected.value }));
      message.textContent = rating ? "自评已单独记录。" : "自评暂时未能保存，请稍后重试。";
    });
    math(feedback); storageNotice();
  }
  function render() {
    var requested = query.get("point"), requestedSection = query.get("section"), requestedDomain = query.get("domain");
    if (lesson(query.get("from"))) {
      context.from = query.get("from"); context.step = /^[1-5]$/.test(query.get("step") || "") ? Number(query.get("step")) : 4;
      if (/^[A-Za-z0-9_.:-]{1,100}$/.test(query.get("question") || "")) context.question = query.get("question");
    }
    section = lesson(requestedSection) ? requestedSection : "";
    includeExtras = query.get("extras") === "1";
    domain = knowledge.domains.some(function (item) { return item.id === requestedDomain; }) ? requestedDomain : "";
    if (pointIndex(requested)) { selectedId = requested; domain = pointIndex(requested).domain; if (section && pointIndex(requested).lessonIds.indexOf(section) < 0) section = ""; }
    if (selectedId && isExtra(pointIndex(selectedId))) includeExtras = true;
    if (variants.some(function (item) { return item.id === query.get("variant") && item.point_id === selectedId; })) selectedVariant = query.get("variant");
    host.innerHTML = '<div class="lp-page"><h1>练习</h1><p class="lp-intro">选一个知识点，先独立作答，再核对条件与理由。</p>' +
      (context.from ? '<div class="lp-context"><p>从《' + esc(lesson(context.from).title) + '》第 ' + context.step + ' 步来练习。<a href="' + esc(returnHref()) + '">回到原课时' + (context.question ? '原题' : '') + '</a></p></div>' : '') +
      (requested && !selectedId ? '<p class="lp-alert" role="status">没有找到这个知识点的已审核自测题。请从下方重新选择。</p>' : '') +
      '<div class="lp-layout"><details class="lp-choose" data-lp-chooser open><summary>选择练习<span class="lp-chooser-current" data-lp-current>先选专题或课时，再选知识点</span></summary><label class="lp-field"><span>专题</span><select data-lp-domain><option value="">所有专题</option>' + knowledge.domains.map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.title) + '</option>'; }).join("") + '</select></label><label class="lp-field"><span>课时</span><select data-lp-section></select></label><label class="lp-toggle"><input type="checkbox" data-lp-extras' + (includeExtras ? ' checked' : '') + '>包含选学与拓展</label><p class="lp-point-count" data-lp-count></p><div class="lp-point-list" data-lp-list></div></details><div class="lp-work" data-lp-work><div class="lp-empty"><h2>从一个具体的问题开始</h2><p>选择上方或左侧知识点，也可以先用专题、课时缩小范围。</p><p class="lp-note">练习只采用知识库中已经审核的自测题。首次独立作答、反馈后的重做和自评分开记录。</p><a href="' + esc(contextual("learning.html").href) + '">查看需要复习的知识点</a></div></div></div></div>';
    var empty = host.querySelector("[data-lp-work]").innerHTML;
    function clearQuestion() { selectedId = ""; selectedVariant = ""; active = null; host.querySelector("[data-lp-work]").innerHTML = empty; }
    host.querySelector("[data-lp-domain]").value = domain; renderOptions(); renderList();
    host.querySelector("[data-lp-domain]").addEventListener("change", function (event) {
      domain = event.target.value; section = ""; clearQuestion(); renderOptions(); renderList(); updateAddress();
    });
    host.querySelector("[data-lp-section]").addEventListener("change", function (event) { section = event.target.value; clearQuestion(); renderList(); updateAddress(); });
    host.querySelector("[data-lp-extras]").addEventListener("change", function (event) {
      includeExtras = event.target.checked;
      if (!includeExtras && selectedId && isExtra(pointIndex(selectedId))) clearQuestion();
      renderList(); updateAddress();
    });
    host.querySelector("[data-lp-list]").addEventListener("click", function (event) { var button = event.target.closest("[data-lp-point]"); if (button) selectPoint(button.dataset.lpPoint, true); });
    if (selectedId) selectPoint(selectedId, false, true);
    math(host);
  }
  if (!dataAPI || !state) { host.textContent = "练习暂时无法打开，请刷新页面重试。"; return; }
  dataAPI.load().then(function (data) {
    index = data.index; knowledge = data.knowledge; state.load();
    variants = data.variants && Array.isArray(data.variants.items) ? data.variants.items.filter(function (item) { return item.status === "reviewed" && ["parallel", "review"].indexOf(item.role) >= 0 && typeof item.contentVersion === "string" && item.contentVersion && Array.isArray(item.options) && item.options.some(function (option) { return option.id === item.correct; }); }) : [];
    points = index.points.filter(function (p) { var full = fullPoint(p.id); return full && full.diagnostic && p.diagnosticVersion; });
    if (document.body.dataset.stage === "primary" && !index.knowledge) return;
    render();
    if (narrow.addEventListener) narrow.addEventListener("change", function () {
      var chooser = host.querySelector("[data-lp-chooser]");
      if (chooser) chooser.open = !narrow.matches || !selectedId;
    });
    state.subscribe(function () {
      if (!active) return;
      var point = fullPoint(active.pointId), label = host.querySelector("[data-lp-evidence]");
      if (label && !active.submitted) label.textContent = evidenceLabel(question(point, quizFor(point)));
      renderList(); storageNotice();
    });
  }).catch(function () {
    host.innerHTML = '<div class="lp-page"><h1>练习暂时没有加载成功</h1><p>请刷新页面重试。已有的本地学习记录不会受到影响。</p><button class="lp-button" type="button" data-lp-reload>重新加载</button></div>';
    host.querySelector("[data-lp-reload]").addEventListener("click", function () { location.reload(); });
  });
})();
