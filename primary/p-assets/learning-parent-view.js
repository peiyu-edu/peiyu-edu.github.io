/* Parent report reads the ledger without exposing storage mutation methods. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else if (root.document) {
    var data = JSON.parse(root.document.getElementById("parent-data").textContent);
    var storage;
    try { storage = root.localStorage; } catch (_) { storage = null; }
    api.mount({ window: root, storage: storage, ledger: root.PeiyuLearningStateAPI,
      mastery: root.PeiyuMastery, data: data, stage: root.document.body.dataset.stage });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function reader(api, source, stage, now) {
    return api.createReader({ storage: source, stage: stage, now: now });
  }
  function metadata(raw, data, stage) {
    var lessons = (data.lessons || []).concat(data.units || []), points = data.points || [], units = data.units || [];
    function enrich(row) {
      var base; try { base = JSON.parse(row.base || "[]"); } catch (_) { base = []; }
      var owner = row.owner || base[1], pid = row.pointId || row.id || (row.questionType === "diagnostic" ? owner : null);
      var point = points.find(function (p) { return p.id === pid; }) || {};
      var section = row.sectionId || (row.questionType === "predict" || row.questionType === "exam" ? owner : null) || point.first_section || point.firstSection || (point.lessonIds || [])[0];
      var course = lessons.find(function (l) { return l.id === section; }) || {}, unitId = row.unitId || point.unitId || course.unitId;
      if (!unitId && stage === "primary") { var match = /^(p[1-6][ab]-u\d+)(?:-|$)/.exec(section || owner || ""); if (match) unitId = match[1]; }
      var unit = units.find(function (u) { return u.id === unitId; }) || {};
      return Object.assign({}, row, { sectionId: section, unitId: unitId, unitTitle: row.unitTitle || unit.unitTitle || course.unitTitle || unit.title || unitId,
        chapterId: row.chapterId || course.chapterId, chapterTitle: row.chapterTitle || course.chapterTitle });
    }
    return Object.assign({}, raw, { points: (raw.points || []).concat(points).map(enrich), lessons: data.lessons || [], items: (raw.items || []).map(enrich) });
  }
  function mount(options) {
    var win = options.window, doc = win.document, host = doc.getElementById("parent-report"), stage = options.stage;
    if (["primary", "junior"].indexOf(stage) < 0) throw Error("Unsupported stage");
    var config = { stage: stage, dailyLimit: stage === "primary" ? 5 : 10, staleDays: stage === "primary" ? 45 : 60 };
    var content = metadata(options.data.review, options.data.learning, stage);
    var items = new Map(content.items.map(function (row) { return [row.base, row]; }));
    function questionLabel(q) {
      var row = items.get(q.base) || {}, title = row.title || q.title;
      if (!title || title === q.questionId || title === q.sectionId || title === q.owner) title = "学习记录";
      var step = /#step(\d+)(?:$|[^\d])/.exec(row.href || q.href || "");
      var number = /^([pq])(\d+)$/.exec(q.questionId || "");
      var kind = { predict: "练习", diagnostic: "小测", exam: "试题", card: "知识卡", lab: "实验" }[q.questionType] || "题目";
      if (number && number[1] === "p") kind = "先想一想";
      var peers = content.items.filter(function (item) { return item.owner === q.owner && item.questionType === q.questionType; });
      var position = peers.findIndex(function (item) { return item.base === q.base; }) + 1;
      var question = kind + "第 " + (number ? Number(number[2]) : position || 1) + " 题";
      return title + (step ? " · 第 " + Number(step[1]) + " 步" : "") + " · " + question + (row.prompt ? " · " + row.prompt : "");
    }
    var key = stage === "primary" ? "peiyu.ps.learning.v1" : "peiyu.jh.learning.v1";
    var pref = stage === "primary" ? "peiyu.ps.wrongbook.v1" : "peiyu.jh.wrongbook.v1";
    function render() {
      var now = Date.now(), read = reader(options.ledger, options.storage, stage, function () { return now; });
      var snapshot = read.snapshot(), marks = read.marks(), model = options.mastery.derive(snapshot, read.answers, content, now, config);
      var hidden = {}, present = false;
      try { present = !!(options.storage && options.storage.getItem(key)); var p = JSON.parse(options.storage && options.storage.getItem(pref) || "null"); hidden = p && p.version === 1 && p.hidden || {}; } catch (_) { /* Reader reports ledger errors. */ }
      host.replaceChildren();
      function add(tag, text, parent) { var node = doc.createElement(tag); node.textContent = text; (parent || host).appendChild(node); return node; }
      add("h1", "学习小结");
      add("p", "这些记录只保存在这台设备的浏览器里，换设备或清除浏览器数据后会看不到。");
      var problems = snapshot.storage.problems;
      if (problems.indexOf("storage-unavailable") >= 0) add("p", "这个浏览器现在读不到本地记录。");
      if (problems.some(function (x) { return x.indexOf("corrupt") >= 0; })) add("p", "记录无法完整读取，本页不会修改它。");
      if (snapshot.storage.historyIncomplete) add("p", "部分早期记录不完整，次数和状态可能偏保守。");
      // Only old answers matter here: page-open views from the legacy log never count towards mastery, and
      // legacy answers that duplicate a current answer are already dropped on import.
      if (marks.some(function (m) { return m.legacy && m.kind === "answer"; })) add("p", "包含旧版记录，旧记录不计入掌握。");
      if (!present && !marks.length && !problems.length) add("p", "这台设备上还没有学习记录。");
      add("h2", "近来的学习");
      [7, 30].forEach(function (days) {
        var count = marks.filter(function (m) { return m.kind === "answer" && m.time > 0 && m.time <= now && m.time >= now - days * 86400000; }).length;
        add("p", "近 " + days + " 天作答 " + (snapshot.storage.historyIncomplete ? "至少 " : "") + count + " 次" + (snapshot.storage.historyIncomplete ? "（记录不完整）" : ""));
      });
      var recent = marks.filter(function (m) { return m.kind === "answer" && m.time > 0 && m.time <= now && m.time >= now - 7 * 86400000; });
      // Combine attempts (including older versions) by question, not by event.
      var activity = new Map(), counts = new Map();
      recent.forEach(function (m) { counts.set(m.identity, (counts.get(m.identity) || 0) + 1); });
      model.questions.forEach(function (q) {
        var count = counts.get(q.identity) || 0;
        if (!count) return;
        var entry = activity.get(q.base);
        if (!entry) activity.set(q.base, { question: q, count: count });
        else { entry.count += count; if (q.current) entry.question = q; }
      });
      activity.forEach(function (entry) { add("p", questionLabel(entry.question) + " · 作答 " + entry.count + " 次"); });
      add("h2", "按单元看知识点");
      model.groups.forEach(function (g) { var c = g.counts; add("p", g.title + "：★ 已巩固 " + c.secure + " · ✓ 初步掌握 " + c.learned + " · ↻ 待巩固 " + c.wrong + " · △ 练习中 " + c.practicing + " · ○ 未作答 " + c.unseen); });
      add("h2", "按单元看题目");
      add("p", "待复习是到期的题，可能同时计入已巩固或在练习。");
      var units = new Map();
      content.items.forEach(function (row) { if (row.unitId) units.set(row.base, { id: row.unitId, title: row.unitTitle || row.unitId }); });
      var totals = new Map();
      model.questions.filter(function (q) { return q.current && q.answered; }).forEach(function (q) {
        var unit = units.get(q.base); if (!unit) return;
        if (!totals.has(unit.id)) totals.set(unit.id, { title: unit.title, secure: 0, practicing: 0, due: 0 });
        var count = totals.get(unit.id);
        if (q.state === "secure") count.secure++; else count.practicing++;
        if (q.due) count.due++;
      });
      totals.forEach(function (c) { add("p", c.title + "：★ 已巩固 " + c.secure + " 题 · △ 在练习 " + c.practicing + " 题 · ↻ 待复习 " + c.due + " 题"); });
      add("h2", stage === "primary" ? "再练一练" : "错题本");
      var open = model.wrongbook.filter(function (q) { return q.group !== "corrected"; });
      if (!open.length) add("p", "暂时没有还没改对的题。");
      open.forEach(function (q) {
        var due = q.dueAt ? new Date(q.dueAt).toLocaleDateString("zh-CN") : "暂无";
        add("p", questionLabel(q) + " · 错 " + q.wrongCount + " 次 · " + (q.selfCheck ? "自评不对，待核对" : "改正 " + q.fixes + "/2") + " · 复习日期 " + due + (q.needsReview ? " · 需要回看讲解" : "") + (hidden[q.identity] ? " · 孩子已收起" : ""));
      });
      add("h2", "反复出错与证据来源");
      var repeated = model.questions.filter(function (q) { return q.wrongCount >= 2; });
      if (!repeated.length) add("p", "暂时没有反复出错的记录。");
      function provenance(q) {
        var answers = read.answers(q.identity), unclassified = answers.filter(function (a) {
          return !a.selfCheck && a.correct === true && ["independent", "retry", "repeat"].indexOf(a.attemptKind) < 0;
        }).length;
        return "独立做对 " + answers.filter(function (a) { return !a.selfCheck && a.correct === true && a.attemptKind === "independent"; }).length +
          " · 看提示或已见过题后做对 " + answers.filter(function (a) { return !a.selfCheck && a.correct === true && (a.attemptKind === "retry" || a.attemptKind === "repeat"); }).length +
          (answers.some(function (a) { return a.selfCheck; }) ? " · 看答案后自评对 " + answers.filter(function (a) { return a.selfCheck && a.correct === true; }).length + "（不计掌握证据）" : "") +
          " · 变式做对 " + q.strongEvidence.filter(function (e) { return e.correct && e.strength === "family-S1"; }).length +
          (unclassified ? " · 来源不明或旧记录做对 " + unclassified + "（不计入上述三项）" : "");
      }
      repeated.forEach(function (q) { add("p", questionLabel(q) + " · 错 " + q.wrongCount + " 次 · " + provenance(q)); });
      add("h2", "学习证据");
      model.questions.filter(function (q) { return q.answered || q.hasLegacy; }).forEach(function (q) { add("p", questionLabel(q) + " · " + q.stateLabel + " · " + provenance(q)); });
    }
    render();
    win.addEventListener("storage", render);
    doc.getElementById("parent-print").addEventListener("click", function () { win.print(); });
    return { refresh: render };
  }
  return { createReader: reader, metadata: metadata, mount: mount };
});
