/* Read-only review links. Evidence and scheduling are owned by PeiyuMastery. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PeiyuReviewBadges = api;
  var doc = root.document, stage = doc && doc.body.dataset.stage;
  if (!api.configs[stage] || doc.body.hasAttribute("data-learning-readonly")) return;
  Promise.all([root.PeiyuLearningData.load(), root.fetch(root.PeiyuLearningData.url("data/wrongbook-index.json"), { cache: "no-store" }).then(function (response) {
    if (!response.ok) throw Error("Review index unavailable");
    return response.json();
  })]).then(function (all) {
    api.mount({ document: doc, data: all[0].index, contentIndex: all[1], store: root.PeiyuLearningState,
      dataAPI: root.PeiyuLearningData, mastery: root.PeiyuMastery, config: api.configs[stage] });
  }).catch(function () { /* Optional badges must not replace a working course. */ });
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var configs = {
    primary: { stage: "primary", dailyLimit: 5, staleDays: 45, destination: "learning.html#lw-wrongbook", today: "今天复习", action: "再练一练",
      labels: { unseen: "○ 还没做", wrong: "↻ 再练练", practicing: "△ 练习中", learned: "✓ 学过了", secure: "★ 记牢了" } },
    junior: { stage: "junior", dailyLimit: 10, staleDays: 60, destination: "learning.html#lw-wrongbook", today: "待巩固", action: "去复习",
      labels: { unseen: "○ 未开始", wrong: "↻ 待巩固", practicing: "△ 练习中", learned: "✓ 已学会", secure: "★ 已巩固" } }
  };
  function list(value) { return Array.isArray(value) ? value : []; }
  function metadata(index, data, stage) {
    var lessons = list(data.lessons).concat(list(data.units));
    function enrich(row) {
      var owner; try { owner = JSON.parse(row.base)[1]; } catch (_) { owner = ""; }
      var pid = row.pointId || row.id || (row.questionType === "diagnostic" ? owner : "");
      var point = list(data.points).find(function (p) { return p.id === pid; }) || {};
      var sid = row.sectionId || (row.questionType === "predict" || row.questionType === "exam" ? owner : "") || point.first_section || point.firstSection || list(point.lessonIds)[0];
      var lesson = lessons.find(function (l) { return l.id === sid; }) || {};
      var unitMatch = /^(p[1-6][ab]-u\d+)(?:-|$)/.exec(sid || owner || "");
      return Object.assign({}, row, { sectionId: sid, unitId: row.unitId || point.unitId || lesson.unitId || (unitMatch && unitMatch[1]),
        unitTitle: row.unitTitle || lesson.unitTitle, chapterId: row.chapterId || lesson.chapterId, chapterTitle: row.chapterTitle || lesson.chapterTitle });
    }
    return Object.assign({}, index, { points: list(index.points).concat(list(data.points)).map(enrich),
      lessons: list(data.lessons), items: list(index.items).map(enrich), stage: stage });
  }
  function mount(options) {
    var config = options.config, stage = config && config.stage, doc = options.document, win = doc.defaultView;
    if (!configs[stage] || doc.body.dataset.stage !== stage || doc.body.hasAttribute("data-learning-readonly")) throw Error("Unsupported badge stage");
    if (!options.contentIndex || options.contentIndex.version !== 1 || options.contentIndex.stage !== stage || !Array.isArray(options.contentIndex.items)) throw Error("Invalid review index");
    var store = options.store, api = options.dataAPI, data = options.data || {}, now = options.now || Date.now;
    if (!store || typeof store.answers !== "function" || (store.stage && store.stage !== stage)) throw Error("Invalid review evidence");
    var content = metadata(options.contentIndex, data, stage), rows = new Map(content.items.map(function (r) { return [r.base, r]; }));
    var model, destroyed = false, pending = false;
    function href() { return api.withContext ? api.withContext(api.url(config.destination)) : api.url(config.destination); }
    function setBadge(parent, key, text, link) {
      if (!parent) return;
      var node = Array.from(parent.children).find(function (n) { return n.dataset.reviewBadge === key; });
      if (!text) { if (node) node.remove(); return; }
      if (!node) { node = doc.createElement(link ? "a" : "span"); node.className = "lrb-badge"; node.dataset.reviewBadge = key; parent.appendChild(node); }
      if (node.textContent !== text) node.textContent = text;
      if (link && node.getAttribute("href") !== href()) node.setAttribute("href", href());
    }
    function row(q) { return rows.get(q.base) || {}; }
    function belongs(q, key, id) {
      if (key === "sectionId") return q.sectionId === id || row(q).sectionId === id;
      if (key === "pointId") return list(q.pointIds).indexOf(id) >= 0;
      var lesson = list(data.lessons).concat(list(data.units)).find(function (l) { return l.id === q.sectionId; });
      return (row(q)[key] || (lesson && lesson[key])) === id;
    }
    function openCount(key, id) { return model.wrongbook.filter(function (q) { return q.group !== "corrected" && (!key || belongs(q, key, id)); }).length; }
    function stateFor(key, id) {
      var point = key === "pointId" && model.points.find(function (p) { return p.pointId === id; });
      if (point) return point.state;
      var qs = model.questions.filter(function (q) { return q.current && q.questionType !== "lab" && belongs(q, key, id); });
      if (qs.some(function (q) { return q.state === "wrong"; })) return "wrong";
      if (qs.length && qs.every(function (q) { return q.state === "secure"; })) return "secure";
      if (qs.some(function (q) { return q.state === "learned" || q.state === "secure"; })) return "learned";
      return qs.some(function (q) { return q.answered; }) ? "practicing" : "unseen";
    }
    function paint() {
      if (destroyed) return;
      var page = doc.body.dataset.learningPage, sid = doc.body.dataset.sec;
      doc.querySelectorAll(".lf-chapter[id]").forEach(function (chapter) {
        var id = chapter.id, key = stage === "primary" ? "unitId" : "chapterId";
        var heading = chapter.querySelector(".lf-unit-head") || chapter.querySelector("h2");
        if (stage === "primary") {
          var unit = list(data.units).find(function (u) { return u.id === id; });
          var available = unit && unit.ready || list(data.lessons).some(function (l) { return l.unitId === id && l.ready !== false; });
          if (!available) { setBadge(heading, "group", "", true); return; }
        }
        var n = openCount(key, id);
        setBadge(heading, "group", stage === "primary" ? config.labels[stateFor(key, id)] : n ? "↻ 待巩固 " + n : "", true);
      });
      if (page === "home" && stage === "primary") {
        var home = doc.querySelector(".lf-current") || doc.querySelector("#learning-app");
        var count = model.today.items.length;
        setBadge(home, "today", count ? "↻ " + config.today + " " + count + " 题" : "", true);
      }
      if (sid && stage === "primary" && list(data.units).some(function (u) { return u.id === sid; })) {
        doc.querySelectorAll('a[href]').forEach(function (a) {
          if (a.hasAttribute("data-review-badge")) return;
          var target; try { target = new URL(a.href); } catch (_) { return; }
          var lesson = list(data.lessons).find(function (l) { return l.unitId === sid && target.pathname.endsWith("/lessons/" + l.id + ".html"); });
          if (lesson) setBadge(a, "lesson", config.labels[stateFor("sectionId", lesson.id)], false);
        });
      }
      var panel = doc.getElementById("route-continue");
      if (panel) paintContinue(panel);
      if (sid && stage === "junior") {
        var toolbar = doc.querySelector(".lc-toolbar"), pendingCount = openCount("sectionId", sid);
        setBadge(toolbar, "lesson", pendingCount ? "↻ 待巩固 " + pendingCount : "", true);
      }
      if (page === "knowledge" && stage === "junior") {
        var pid = new URLSearchParams(win.location.hash.slice(1)).get("point"), detail = doc.getElementById("learning-tree-detail");
        setBadge(detail, "point-state", pid ? config.labels[stateFor("pointId", pid)] : "", false);
        setBadge(detail, "point-review", pid && stateFor("pointId", pid) !== "unseen" ? "↻ " + config.action : "", true);
      }
    }
    // Overview pages (PY-324 C): where to continue and how many to review today. The count is the same
    // derived queue as 我的学习, so both pages always agree; the resume spot is the ledger's own.
    function paintContinue(panel) {
      var snap = store.snapshot(), resume = snap && snap.resume;
      var all = list(data.lessons).concat(list(data.units));
      var lesson = resume && all.find(function (l) { return l.id === resume.sectionId && l.ready !== false; });
      var step = resume && Number.isInteger(resume.step) && resume.step >= 1 ? resume.step : 1;
      var question = resume && typeof resume.questionId === "string" ? resume.questionId : "";
      var count = model.today.items.length, signature = [lesson && lesson.id, step, question, count, model.today.remaining].join("|");
      if (panel.dataset.reviewSignature === signature) return;
      panel.dataset.reviewSignature = signature;
      panel.replaceChildren();
      function line(cls) { var p = doc.createElement("p"); p.className = cls; panel.appendChild(p); return p; }
      function anchor(parent, text, target) { var a = doc.createElement("a"); a.className = "lrb-badge"; a.dataset.reviewBadge = "overview"; a.textContent = text; a.setAttribute("href", target); parent.appendChild(a); return a; }
      var go = line("route-continue-go");
      // Same return link as the stage home page: lesson, step and the question the student was on.
      var back = api.returnHref ? api.returnHref({ from: lesson && lesson.id, step: step, question: question }) :
        api.url("lessons/" + (lesson && lesson.id) + ".html#step" + step);
      if (lesson) anchor(go, "继续学习：" + (lesson.title || lesson.id), back);
      else { go.appendChild(doc.createTextNode("还没有学习记录。")); anchor(go, "从课程目录开始", api.url("courses.html")); }
      var due = line("route-continue-due"), label = stage === "primary" ? "今天复习" : "今日复习";
      if (count) anchor(due, label + " " + count + " 题" + (model.today.remaining ? "（还有 " + model.today.remaining + " 题）" : ""), href());
      else due.textContent = label + "：今天没有要复习的题。";
    }
    function refresh() {
      if (destroyed) return;
      model = options.mastery.derive(store.snapshot(), store.answersReader ? store.answersReader() : function (id) { return store.answers(id); }, content, now(), config);
      paint();
    }
    // Renderers replace their DOM on book/point changes. Ignore our own updates
    // and coalesce the remaining mutations without observing the entire body.
    var observer = new win.MutationObserver(function (records) {
      if (pending || !records.some(function (r) {
        return !r.target.closest("[data-review-badge]") && Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(function (n) { return n.nodeType !== 1 || !n.hasAttribute("data-review-badge"); });
      })) return;
      pending = true; win.queueMicrotask(function () { pending = false; paint(); });
    });
    refresh();
    observer.observe(doc.querySelector("#learning-app") || doc.querySelector(".wrap") || doc.body, { childList: true, subtree: true });
    var unsubscribe = store.subscribe ? store.subscribe(refresh) : function () {};
    win.addEventListener("hashchange", paint); win.addEventListener("popstate", paint);
    var timer = win.setInterval(refresh, 60000);
    return { refresh: refresh, snapshot: function () { return model; }, destroy: function () {
      destroyed = true; observer.disconnect(); unsubscribe(); win.clearInterval(timer); win.removeEventListener("hashchange", paint); win.removeEventListener("popstate", paint);
    } };
  }
  return { configs: configs, mount: mount };
});
