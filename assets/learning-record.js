/* A local evidence notebook; no completion percentage or mastery inference. */
(function () {
  "use strict";
  if (document.body.dataset.learningPage !== "record") return;
  var host = document.getElementById("learning-app");
  if (!host) return;
  var dataAPI = window.PeiyuLearningData, state = window.PeiyuLearningState, index, knowledge, variants = [];
  var query = new URLSearchParams(location.search), context = { from: "", step: 4, question: "" };
  var ratingNames = { "need-help": "还需帮助", "practice-more": "还想再练", "can-explain": "能解释理由", no: "还需帮助", fuzzy: "还想再练", know: "能解释理由", unsure: "还不确定", developing: "还想再练", confident: "能解释理由" };
  var sourceNames = { practice: "练习页", knowledge: "知识库", course: "课时", lesson: "课时", legacy: "本地记录", import: "本地记录", "legacy-log": "学习日志", "legacy-knowledge": "知识库", "legacy-knowledge-history": "知识库", "legacy-hci": "课时", "legacy-cards": "卡片自评" };
  function esc(value) { return dataAPI.escape(value); }
  function url(path) { return new URL(path, dataAPI.root || document.baseURI); }
  function point(id) { return index.points.find(function (item) { return item.id === id; }); }
  function lesson(id) { return index.lessons.find(function (item) { return item.id === id; }); }
  function contextual(path) {
    var target = url(path);
    if (context.from) {
      target.searchParams.set("from", context.from); target.searchParams.set("step", String(context.step));
      if (context.question) target.searchParams.set("question", context.question);
    }
    return target;
  }
  function practiceHref(id, item, review) {
    var target = contextual("practice.html");
    if (point(id)) target.searchParams.set("point", id);
    if (item && variants.some(function (variant) { return variant.id === item.questionId && variant.point_id === id; })) target.searchParams.set("variant", item.questionId);
    if (review) target.searchParams.set("review", "1");
    return target.href;
  }
  function knowledgeHref(id, item) {
    var target = contextual("knowledge.html");
    if (point(id)) target.hash = "point=" + encodeURIComponent(id);
    if (item && variants.some(function (variant) { return variant.id === item.questionId && variant.point_id === id; })) target.searchParams.set("variant", item.questionId);
    return target.href;
  }
  function questionLabel(item) {
    if (!item.questionId) return "";
    if (item.questionType === "diagnostic") {
      var supplement = variants.find(function (variant) { return variant.point_id === item.pointId && variant.id === item.questionId; });
      if (supplement && supplement.role === "review") return "复习题";
      var matching = variants.filter(function (variant) { return variant.point_id === item.pointId && variant.role === "parallel"; });
      var position = matching.findIndex(function (variant) { return variant.id === item.questionId; });
      if (position >= 0) return "变式 " + (position + 1);
      var full = knowledge.points.find(function (entry) { return entry.id === item.pointId; });
      if (full && full.diagnostic && full.diagnostic.id === item.questionId) return "原诊断题";
      return item.questionId === "unknown-diagnostic" ? "诊断题（题目不详）" : "历史诊断题（内容已更新）";
    }
    return { predict: "课内预测题", exam: "课内练习题", card: "方法卡", lab: "实验", cue: "课内问题" }[item.questionType] || "课内题目";
  }
  function lessonHref(item) {
    var target = url("lessons/" + item.sectionId + ".html");
    var step = /^[1-5]$/.test(String(item.step || "")) ? item.step : item.questionType === "exam" ? 5 : 1;
    if (/^[A-Za-z0-9_.:-]{1,100}$/.test(item.questionId || item.question || "")) target.searchParams.set("focus", item.questionId || item.question);
    target.hash = "step" + step; return target.href;
  }
  function number(value) { return Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0; }
  function date(time, full) {
    if (!time || !Number.isFinite(Number(time))) return "时间未知";
    return new Date(Number(time)).toLocaleString("zh-CN", full ? { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" } : { month: "long", day: "numeric" });
  }
  function math(node) { if (window.PeiyuKnowledge) window.PeiyuKnowledge.renderMath(node); }
  function eventTitle(event) {
    var p = point(event.pointId), s = lesson(event.sectionId);
    return p ? p.title : s ? s.title : "学习记录";
  }
  function eventHref(event) {
    if (point(event.pointId)) return knowledgeHref(event.pointId, event);
    if (lesson(event.sectionId)) return lessonHref(event);
    return url("courses.html").href;
  }
  function eventMeta(event) {
    var source = sourceNames[event.source] || "本地记录";
    return date(event.time, true) + " · " + source;
  }
  function isLegacy(event) { return event.attemptKind === "legacy" || event.source === "legacy" || event.legacy === true || event.independent === null && event.kind === "answer"; }
  function answerText(event) {
    var result = event.correct === true ? "这次答对" : event.correct === false ? "这次答错" : "作答结果未知";
    if (isLegacy(event)) return result + "；是否独立作答未知。";
    if (event.attemptKind === "retry") return result + "；已看过反馈，作为订正记录。";
    if (event.attemptKind === "independent") return result + "；首次提交前未记录到这道题的反馈。";
    if (event.attemptKind === "unknown") return result + "；记录不完整，独立情况暂不能确认。";
    return result + "；同题再次作答，与首次独立作答分开。";
  }
  function renderEvents(events, type) {
    if (!events.length) return '<p class="lp-note">暂时没有这类记录。</p>';
    var sorted = events.slice().sort(function (a, b) { return number(b.time) - number(a.time); });
    function rows(items) {
      return items.map(function (event) {
        var detail = type === "rating" ? "当时的自评：" + (ratingNames[event.rating] || "已记录自评") + "。自评不替代作答证据。" : type === "view" ? "查看过这项内容；没有据此标记完成。" : type === "review" ? "回到这个知识点复习；是否理解仍要结合具体作答。" : answerText(event);
        var question = questionLabel(event);
        return '<li><div class="lr-event-head"><a href="' + esc(eventHref(event)) + '">' + esc(eventTitle(event)) + '</a><span class="lr-pill">' + esc(type === "rating" ? "自评" : type === "view" ? "查看" : type === "review" ? "复习访问" : isLegacy(event) ? "独立情况未知" : event.attemptKind === "independent" ? "首次独立" : event.attemptKind === "retry" ? "反馈后重做" : "再次作答") + '</span></div>' + (question ? '<p class="lr-question">' + esc(question) + '</p>' : '') + '<p>' + esc(detail) + '</p><p class="lr-meta">' + esc(eventMeta(event)) + '</p></li>';
      }).join("");
    }
    return '<ul class="lr-events">' + rows(sorted.slice(0, 8)) + '</ul>' + (sorted.length > 8 ? '<details class="lr-show-more"><summary>展开另外 ' + (sorted.length - 8) + ' 条近期记录</summary><ul class="lr-events">' + rows(sorted.slice(8)) + '</ul></details>' : '');
  }
  function reviewReason(item) {
    var last = item.lastAnswer;
    if (last && last.correct === false) return "这道题最近一次答错，先回看适用条件，再做一次。";
    if (last && last.attemptKind === "retry") return "已在反馈后重做；保留之前的复习安排，再核对理由。";
    if (item.legacyExposure || last && isLegacy(last)) return "已有作答记录，独立情况未知；回看条件并重新检验。";
    if (item.independentCount > 0) return "曾独立回答过这道题，隔一段时间再检查是否还能解释。";
    return "这个知识点已有作答或反馈记录，可以回看条件再练习。";
  }
  function reviews(items, due) {
    if (!items.length) return '<p class="lp-note">' + (due ? '目前没有到期的复习安排。可以从课程或练习开始，记录会逐步积累。' : '有作答记录后，这里会列出之后的复习安排。') + '</p>';
    return '<ul class="lr-review-list">' + items.map(function (item) {
      var p = point(item.pointId); if (!p) return "";
      return '<li><h3><a href="' + esc(knowledgeHref(p.id, item)) + '">' + esc(p.title) + '</a></h3><p class="lr-question">' + esc(questionLabel(item)) + '</p><p>' + esc(reviewReason(item)) + '</p><p class="lr-meta">' + (due ? '复习已到期' : '计划复习') + '：' + esc(date(item.dueAt || item.reviewDueAt)) + '</p><div class="lp-actions"><a class="lp-button secondary" href="' + esc(practiceHref(p.id, item, true)) + '">回看并练习</a></div></li>';
    }).join("") + '</ul>';
  }
  function group(title, count, hint, content, open) {
    return '<details class="lr-evidence"' + (open ? ' open' : '') + '><summary>' + esc(title) + '（' + number(count) + '）</summary><p class="lp-note">' + esc(hint) + '</p>' + content + '</details>';
  }
  function render() {
    var snapshot = state.snapshot(), totals = snapshot.totals || {}, events = snapshot.events || [];
    var answerEvents = events.filter(function (event) { return event.kind === "answer"; });
    var independent = answerEvents.filter(function (event) { return event.attemptKind === "independent" && !isLegacy(event); });
    var retries = answerEvents.filter(function (event) { return event.attemptKind === "retry" && !isLegacy(event); });
    var other = answerEvents.filter(function (event) { return !isLegacy(event) && event.attemptKind !== "independent" && event.attemptKind !== "retry"; });
    var legacy = answerEvents.filter(isLegacy);
    var views = events.filter(function (event) { return event.kind === "view"; });
    var ratings = events.filter(function (event) { return event.kind === "self-rating"; });
    var visits = events.filter(function (event) { return event.kind === "review"; });
    var review = (snapshot.review || []).filter(function (item) { return point(item.pointId); }).sort(function (a, b) { return number(a.dueAt || a.reviewDueAt) - number(b.dueAt || b.reviewDueAt); });
    var due = review.filter(function (item) { return item.due === true || number(item.dueAt || item.reviewDueAt) <= Date.now(); });
    var future = review.filter(function (item) { return due.indexOf(item) < 0; });
    var resume = snapshot.resume && lesson(snapshot.resume.sectionId) ? snapshot.resume : null;
    var storage = snapshot.storage || {}, storageWarning = storage.memoryOnly || storage.available === false || storage.persistent === false;
    var hasEvidence = events.length || number(totals.views) || number(totals.independentAnswers) || number(totals.legacyAnswers);
    host.innerHTML = '<div class="lp-page"><h1>我的学习</h1><p class="lp-intro">把看过、做过、订正过的内容分开看，再决定下一步学什么。</p>' +
      (context.from ? '<div class="lp-context"><p><a href="' + esc(lessonHref({ sectionId: context.from, step: context.step, questionId: context.question })) + '">回到《' + esc(lesson(context.from).title) + '》第 ' + context.step + ' 步' + (context.question ? '原题' : '') + '</a></p></div>' : '') +
      (storageWarning ? '<p class="lp-alert" role="status">浏览器暂时无法保存到本地。当前页面仍能使用，离开前请导出记录。</p>' : '') +
      (!hasEvidence ? '<div class="lp-empty"><h2>从一次具体的学习开始</h2><p>选一节课、查看一个知识点，或者独立回答一道自测题。这里会保留不同类型的记录，帮助你安排回看。</p><div class="lp-actions"><a class="lp-button" href="' + esc(url("courses.html").href) + '">选择课程</a><a class="lp-button secondary" href="' + esc(practiceHref()) + '">开始练习</a></div></div>' : '') +
      '<dl class="lr-summary"><div><dt>查看次数</dt><dd>' + number(totals.views) + '</dd></div><div><dt>首次独立作答</dt><dd>' + number(totals.independentAnswers) + '</dd></div><div><dt>反馈后重做</dt><dd>' + number(totals.retries) + '</dd></div><div><dt>到期复习</dt><dd>' + due.length + '</dd></div></dl><div class="lr-layout"><div><section class="lr-section"><h2>现在可以复习</h2><p class="lp-note">安排依据具体题目的记录，不把做对一次当作掌握。</p>' + reviews(due, true) + '</section><section class="lr-section"><h2>之后再回看</h2>' + reviews(future, false) + '</section><section class="lr-section"><h2>每一种记录分别看</h2><p class="lp-note">总次数来自保留的证据汇总；下方列出浏览器中保存的近期明细。</p>' +
      group("首次独立作答", totals.independentAnswers, '首次提交前未记录到该题的答案反馈。累计答对 ' + number(totals.independentCorrect) + ' 次；这不是知识点掌握率。', renderEvents(independent, "answer"), true) +
      group("反馈后重做", totals.retries, "已经看过同一道题的反馈。订正成功会保留，但不增加首次独立作答次数。", renderEvents(retries, "answer")) +
      group("其他作答", totals.otherAnswers, "同题再次作答、独立情况暂不能确认的作答单独保存。", renderEvents(other, "answer")) +
      group("查看", totals.views, "进入过内容页面，不表示已经完成学习。", renderEvents(views, "view")) +
      group("自评", totals.selfRatings, "记录当时的感受，与题目表现并列，不替代作答证据。", renderEvents(ratings, "rating")) +
      group("复习访问", totals.reviewVisits, "记录从复习安排返回知识点的行为，不自动表示已经复习完成。", renderEvents(visits, "review")) +
      (number(totals.legacyAnswers) || legacy.length ? group("独立情况未确认的作答", totals.legacyAnswers, "这些记录缺少完整的作答与反馈信息，保留结果，但不计入首次独立作答。", renderEvents(legacy, "answer")) : '') +
      '</section></div><aside><section class="lr-section">' + (resume ? '<h2>继续上次课时</h2><p>' + esc(lesson(resume.sectionId).title) + '</p><p class="lp-note">回到第 ' + esc(resume.step || 1) + ' 步。上次停留不代表该步骤已完成。</p><a class="lp-button" href="' + esc(lessonHref(resume)) + '">继续学习</a>' : '<h2>接着学什么</h2><p>从课程找当前课时，或到知识库核对条件、概念与方法。</p><div class="lp-actions"><a class="lp-button secondary" href="' + esc(url("courses.html").href) + '">查看课程</a><a class="lp-button secondary" href="' + esc(url("knowledge.html").href) + '">打开知识库</a></div>') + '</section><section class="lr-export"><h2>记录只在这台浏览器</h2><p class="lp-note">这里不收集学生姓名，也不上传云端。换设备或清理浏览器后，记录不会自动同步。</p><p class="lp-note">可以下载这台浏览器保存的学习记录，留作备份。</p><button class="lp-button secondary" type="button" data-lr-export>导出本地记录</button><p class="lp-note" role="status" data-lr-export-status></p></section></aside></div></div>';
    host.querySelector("[data-lr-export]").addEventListener("click", function () {
      var result = state.exportJSON();
      var content = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      var blob = new Blob([content], { type: "application/json;charset=utf-8" });
      var objectUrl = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = objectUrl; link.download = "peiyu-learning-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1000);
      host.querySelector("[data-lr-export-status]").textContent = "已生成本地 JSON 文件，请保存下载的记录。";
    });
    math(host);
  }
  if (!dataAPI || !state) { host.textContent = "学习记录暂时无法打开，请刷新页面重试。"; return; }
  dataAPI.load().then(function (data) {
    index = data.index; knowledge = data.knowledge; variants = data.variants && Array.isArray(data.variants.items) ? data.variants.items.filter(function (item) { return item.status === "reviewed" && ["parallel", "review"].indexOf(item.role) >= 0; }) : []; state.load();
    if (lesson(query.get("from"))) {
      context.from = query.get("from"); context.step = /^[1-5]$/.test(query.get("step") || "") ? Number(query.get("step")) : 4;
      if (/^[A-Za-z0-9_.:-]{1,100}$/.test(query.get("question") || "")) context.question = query.get("question");
    }
    render();
    window.addEventListener("storage", function (event) { if (event.key === "peiyu.hs.learning.v1") render(); });
  }).catch(function () {
    host.innerHTML = '<div class="lp-page"><h1>学习记录暂时没有加载成功</h1><p>请刷新页面重试。已有的本地记录不会受到影响。</p><button class="lp-button" type="button" data-lr-reload>重新加载</button></div>';
    host.querySelector("[data-lr-reload]").addEventListener("click", function () { location.reload(); });
  });
})();
