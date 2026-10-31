/* Shared local review view. State and scheduling belong exclusively to the ledger/derive. */
(function (root, factory) {
  "use strict";
  var api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PeiyuWrongbook = api;
  // High-school pages carry no data-stage attribute (high is the default stage elsewhere too).
  var pageStage = root.document && root.document.body ? root.document.body.dataset.stage || "high" : null;
  if (pageStage && ["primary", "junior", "high"].indexOf(pageStage) >= 0 && root.document.body.dataset.learningPage === "record") {
    var host = root.document.getElementById("learning-wrongbook");
    if (!host) return;
    Promise.all([root.PeiyuLearningData.load(), root.fetch(root.PeiyuLearningData.url("data/wrongbook-index.json"), { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw Error("review index unavailable");
      return response.json();
    })]).then(function (all) {
      api.mount({ host: host, data: all[0].index, contentIndex: all[1], store: root.PeiyuLearningState,
        dataAPI: root.PeiyuLearningData, config: api[pageStage], mastery: root.PeiyuMastery,
        recordsHost: root.document.getElementById("lw-records") });
    }).catch(function () { host.textContent = "复习内容暂时没打开。请刷新重试。下方的学习记录仍可查看。"; });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";
  var primary = { stage: "primary", listTitle: "再练一练", dailyLimit: 5, staleDays: 45,
    phonetics: true, readAloud: true, layout: "sections", preferenceKey: "peiyu.ps.wrongbook.v1",
    pointPrefix: "pyps.", labels: { unseen: "○ 还没做", wrong: "↻ 再练练", practicing: "△ 练习中", learned: "✓ 学过了", secure: "★ 记牢了" } };
  var junior = { stage: "junior", listTitle: "错题本", todayTitle: "今日复习", learnedTitle: "掌握度", dailyLimit: 10, staleDays: 60,
    phonetics: false, readAloud: false, layout: "tabs", preferenceKey: "peiyu.jh.wrongbook.v1", pointPrefix: "pyjh.",
    reviewLabel: "回到讲解", labels: { unseen: "未作答", wrong: "待巩固", practicing: "练习中", learned: "初步掌握", secure: "已巩固" } };
  // PY-328: high school reuses the junior layout; mastery shows three tiers only (no counts per state, no percentages).
  var high = { stage: "high", listTitle: "错题本", todayTitle: "今日复习", learnedTitle: "掌握情况", dailyLimit: 8, staleDays: 30,
    phonetics: false, readAloud: false, layout: "tabs", preferenceKey: "peiyu.hs.wrongbook.v1", pointPrefix: "pyhs.",
    reviewLabel: "回到课时", tiers: true, labels: { unseen: "还没做", wrong: "还要练", practicing: "还要练", learned: "基本会了", secure: "基本会了" } };
  var readings = { "今天复习": "jīn tiān fù xí", "再练一练": "zài liàn yí liàn", "我学会了哪些": "wǒ xué huì le nǎ xiē" };
  function list(value) { return Array.isArray(value) ? value : []; }
  function parts(identity) { try { var p = JSON.parse(identity); return Array.isArray(p) && p.length === 4 && p.every(function (v) { return typeof v === "string"; }) ? p : null; } catch (_) { return null; } }
  function metadata(raw, data, stage) {
    var lessons = list(data.lessons).concat(list(data.units)), points = list(data.points), units = list(data.units);
    function lesson(id) { return lessons.find(function (l) { return l.id === id; }); }
    function enrich(row) {
      var base; try { base = JSON.parse(row.base || "[]"); } catch (_) { base = []; }
      var owner = row.owner || base[1], pid = row.pointId || row.id || (row.questionType === "diagnostic" ? owner : null);
      var point = points.find(function (p) { return p.id === pid; }) || {};
      var section = row.sectionId || (row.questionType === "predict" || row.questionType === "exam" ? owner : null) || point.first_section || point.firstSection || list(point.lessonIds)[0];
      var course = lesson(section) || {}, unitId = row.unitId || point.unitId || course.unitId;
      if (!unitId && stage === "primary") { var match = /^(p[1-6][ab]-u\d+)(?:-|$)/.exec(section || owner || ""); if (match) unitId = match[1]; }
      var unit = units.find(function (u) { return u.id === unitId; }) || {};
      var chapterId = row.chapterId || point.chapterId || course.chapterId;
      if (!chapterId && stage === "junior") { var chapter = /^(j\d+)-(?:\d+|test)$/.exec(section || owner || ""); if (chapter) chapterId = chapter[1]; }
      var chapterCourse = lessons.find(function (l) { return l.chapterId === chapterId; }) || {};
      return Object.assign({}, row, { sectionId: section, unitId: unitId, unitTitle: row.unitTitle || unit.unitTitle || course.unitTitle || unit.title || unitId,
        chapterId: chapterId, chapterTitle: row.chapterTitle || course.chapterTitle || chapterCourse.chapterTitle || chapterId,
        reviewHref: row.reviewHref || (section ? "lessons/" + section + ".html#step2" : null) });
    }
    return Object.assign({}, raw, { points: list(raw.points).concat(points).map(enrich),
      lessons: list(data.lessons), items: list(raw.items).map(enrich) });
  }
  function mount(options) {
    var config = Object.assign({}, options.config), stage = config.stage;
    if (["primary", "junior", "high"].indexOf(stage) < 0) throw Error("Unsupported learning stage");
    var chapters = stage !== "primary"; // junior and high group by chapter and share the tabbed wrongbook UI
    var host = options.host, doc = host.ownerDocument, win = doc.defaultView || root;
    var store = options.store, mastery = options.mastery || root.PeiyuMastery, api = options.dataAPI;
    if (store && store.stage && store.stage !== stage) throw Error("Learning ledger stage mismatch");
    var data = options.data || {}, index = options.contentIndex, now = options.now || Date.now;
    if (!index || index.version !== 1 || index.stage !== stage || !Array.isArray(index.items)) throw Error("Invalid review index");
    if (!store || typeof store.answers !== "function" || !mastery) throw Error("Review evidence unavailable");
    var content = metadata(index, data, stage), rows = new Map(content.items.map(function (r) { return [r.base, r]; }));
    var key = config.preferenceKey, storage = options.storage, preferenceFailed = false, hidden = Object.create(null);
    if (!key) throw Error("Missing stage preference key");
    if (storage === undefined) { try { storage = win.localStorage; } catch (_) { storage = null; } }
    var filter = "all", unit = "", source = "", sort = "recent", activeTab = chapters ? "wrongbook" : "today";
    // PY-336: a chapter-test result page links here with ?chapter=j<N>; junior pre-selects that chapter (unknown ids fall back to all).
    try { unit = new win.URLSearchParams(options.search !== undefined ? options.search : win.location.search).get(chapters ? "chapter" : "unit") || ""; } catch (_) { unit = ""; }
    var recordsHost = options.recordsHost, model, destroyed = false, timer, signature;
    var fragmentId = null, fragmentTimer;
    var fragmentInputs = ["wheel", "touchmove", "keydown", "pointerdown"];
    function stopFollowingFragment() {
      fragmentId = null; win.clearTimeout(fragmentTimer);
      fragmentInputs.forEach(function (type) { win.removeEventListener(type, stopFollowingFragment, true); });
    }
    function alignFragment(id) {
      var target = doc.getElementById(id);
      if (!target || !(host.contains(target) || target === recordsHost)) return;
      var scrollTarget = config.layout === "tabs" ? host.querySelector(".lw-tabs") || target : target;
      if (typeof scrollTarget.scrollIntoView === "function") scrollTarget.scrollIntoView({ block: "start" });
    }
    function el(tag, text, className) { var node = doc.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
    function append(parent) { Array.prototype.slice.call(arguments, 1).forEach(function (n) { parent.appendChild(n); }); return parent; }
    function readHidden() {
      if (!storage) return hidden;
      try {
        var raw = JSON.parse(storage.getItem(key) || "null"), result = Object.create(null);
        if (raw && raw.version === 1 && raw.hidden && typeof raw.hidden === "object" && !Array.isArray(raw.hidden)) {
          Object.keys(raw.hidden).forEach(function (id) { if (parts(id) && Number.isFinite(raw.hidden[id]) && raw.hidden[id] > 0) result[id] = raw.hidden[id]; });
        }
        return result;
      } catch (_) { preferenceFailed = true; return hidden; }
    }
    hidden = readHidden();
    function button(text, action) { var b = el("button", text); b.type = "button"; b.addEventListener("click", action); return b; }
    function heading(text) {
      var h = el("h2");
      if (config.phonetics && readings[text]) append(h, append(el("ruby", text), el("rt", readings[text])));
      else h.textContent = text;
      return h;
    }
    function voice() {
      if (!config.readAloud || !win.speechSynthesis || !win.SpeechSynthesisUtterance || typeof win.speechSynthesis.getVoices !== "function") return null;
      try { return list(win.speechSynthesis.getVoices()).find(function (v) { return v.localService && /^zh/.test(v.lang); }) || null; }
      catch (_) { return null; }
    }
    function say(text) {
      if (!voice()) return null;
      return button("听一听", function () {
        try {
          var localVoice = voice(); if (!localVoice) throw Error("local voice unavailable");
          var speech = new win.SpeechSynthesisUtterance(text); speech.lang = "zh-CN"; speech.rate = .85; speech.voice = localVoice;
          win.speechSynthesis.cancel(); win.speechSynthesis.speak(speech);
        } catch (_) { announce("这次没有朗读出来，可以看拼音。"); }
      });
    }
    function safeHref(href, explanation) {
      if (!href) return null;
      try {
        var base = new URL(api.root || doc.baseURI), target = new URL(href, base);
        if (!/^https?:$/.test(target.protocol) || target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return null;
        var context = api.context ? api.context() : null;
        if (context && api.withContext) target = new URL(api.withContext(target.href, context));
        if (explanation) target.searchParams.delete("focus");
        return target.href;
      } catch (_) { return null; }
    }
    function reviewLink(text, href, question, explanation) {
      var target = safeHref(href, explanation);
      if (!target || !question) return null;
      // E3 course links identify the step; focus belongs to the current question action.
      if (!explanation && question.questionType === "predict") {
        var focused = new URL(target); focused.searchParams.set("focus", question.questionId); target = focused.href;
      }
      var a = el("a", text); a.href = target;
      a.addEventListener("click", function (event) {
        var ids = parts(question.identity);
        if (!ids) { event.preventDefault(); return; }
        try {
          var step = /^#step([1-5])$/.exec(new URL(target).hash);
          var recorded = store.record({ kind: "review", source: "wrongbook", questionType: ids[0], questionId: ids[2], contentVersion: ids[3],
            sectionId: question.sectionId || (ids[0] !== "diagnostic" && ids[0] !== "card" ? ids[1] : undefined),
            pointId: ids[0] === "diagnostic" ? ids[1] : undefined, step: step ? Number(step[1]) : undefined });
          if (!recorded) throw Error("review not recorded");
        } catch (_) { event.preventDefault(); announce("复习记录暂时没存好，请再试一次。"); }
      });
      return a;
    }
    var live = el("p", "", "lw-live"); live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite"); live.setAttribute("aria-atomic", "true");
    function announce(message) { live.textContent = message; }
    function setHidden(identity, value) {
      var next = Object.assign(Object.create(null), preferenceFailed ? hidden : readHidden());
      if (value) next[identity] = now(); else delete next[identity];
      hidden = next;
      try { if (!storage) throw Error("memory only"); storage.setItem(key, JSON.stringify({ version: 1, hidden: hidden })); }
      catch (_) { preferenceFailed = true; }
      render(); announce(value ? "已先收起。复习安排不变，可在已收起中恢复。" : "已恢复。复习安排不变。");
      var select = host.querySelector("[data-lw-status]"); if (select) select.focus();
    }
    function rowMeta(q) { return rows.get(q.base) || {}; }
    function groupId(q) { var r = rowMeta(q); return stage === "primary" ? r.unitId || "other" : r.chapterId || "other"; }
    function stateText(q) { return config.labels && config.labels[q.state] || q.stateLabel; }
    function wrongStatus(q) {
      return hidden[q.identity] ? "hidden" : q.group === "corrected" ? "corrected" : q.streakWrong >= 2 ? "review" : q.fixedByRetry ? "feedback" : "wrong";
    }
    var statusLabels = { wrong: "待巩固", feedback: "反馈后已改对", review: "需要回看", corrected: "已改正", hidden: "已收起" };
    function sourceText(q) { return { predict: "课内", card: "课内", diagnostic: stage === "high" ? "练习" : "诊断", exam: stage === "primary" ? "单元测评" : "章末测验" }[q.questionType] || "课内"; }
    function item(q) {
      var li = el("li", undefined, "lw-item"); li.dataset.identity = q.identity;
      append(li, el("h3", q.title), el("p", chapters ? statusLabels[wrongStatus(q)] : stateText(q), "lw-state"));
      var r = rowMeta(q), title = stage === "primary" ? r.unitTitle : r.chapterTitle;
      if (stage === "primary" && r.prompt) li.appendChild(el("p", r.prompt, "lw-prompt"));
      if (title) li.appendChild(el("p", title, "lw-note"));
      if (chapters) {
        li.appendChild(el("p", "来源：" + sourceText(q) + " · 错 " + q.wrongCount + " 次", "lw-note"));
        // Show point names only; ids that have no published title (e.g. draft points) are dropped rather than leaked as internal ids.
        var pointNames = q.pointIds.map(function (pid) {
          var point = content.points.find(function (p) { return (p.pointId || p.id) === pid; });
          return point && point.title || (r.pointTitles && typeof r.pointTitles === "object" && typeof r.pointTitles[pid] === "string" ? r.pointTitles[pid] : null);
        }).filter(Boolean);
        if (pointNames.length) li.appendChild(el("p", "知识点：" + pointNames.join("、"), "lw-note"));
      }
      // Option ids a/b/c are shown to students as A/B/C (option order matches id order); other answers stay as typed.
      if (typeof q.lastChoice === "string" && q.lastChoice) {
        var filled = r.inputType && r.inputType !== "choice";
        li.appendChild(el("p", (filled ? "你上次填了 " : "你上次选了 ") + (!filled && /^[a-z]$/.test(q.lastChoice) ? q.lastChoice.toUpperCase() : q.lastChoice)));
      }
      if (q.wrongCount) li.appendChild(el("p", q.selfCheck ? (q.selfCorrected ? "自评已改对（不计掌握证据）" : "自评不对，请重做后再核对") : "改正 " + q.fixes + "/2"));
      if (q.incomplete) li.appendChild(el("p", "这道题的早期记录不完整。", "lw-note"));
      if (q.nextStrongAt && now() < q.nextStrongAt) li.appendChild(el("p", "满 20 小时后再试。", "lw-note"));
      var actions = el("div", undefined, "lw-actions"), action;
      if (q.versionStale || q.unavailable) {
        li.appendChild(el("p", "题目已更新。旧记录保留。"));
        var current = model.questions.find(function (entry) { return entry.base === q.base && entry.current; });
        action = current && reviewLink("去看看新版", current.href, current, false);
      } else if (q.streakWrong >= 2) {
        li.appendChild(el("p", "先回课时看看讲解。"));
        action = reviewLink(config.reviewLabel || "回课时看一看", q.reviewHref, q, true);
      } else {
        // Knowledge-card families retry on an unanswered variant first (E7); others keep their own question.
        var retry = q.retryIdentity && model.questions.find(function (p) { return p.identity === q.retryIdentity; });
        action = retry && retry.identity !== q.identity ? reviewLink("去做这道题", q.retryHref, retry, false) : reviewLink("去做这道题", q.href, q, false);
      }
      if (action) actions.appendChild(action);
      if (q.current && q.streakWrong < 2) {
        var hint = el("p", "", "lw-hint"); hint.hidden = true;
        var toggle = button("看提示", function () {
          var feedback = r.feedback && Object.prototype.hasOwnProperty.call(r.feedback, q.lastChoice) ? r.feedback[q.lastChoice] : null;
          hint.textContent = typeof feedback === "string" && feedback ? feedback : "这次没有对应的提示。可以回课时看看。";
          hint.hidden = !hint.hidden; toggle.setAttribute("aria-expanded", String(!hint.hidden));
        });
        toggle.setAttribute("aria-expanded", "false"); actions.appendChild(toggle); li.appendChild(hint);
      }
      actions.appendChild(button(hidden[q.identity] ? "恢复" : "先收起", function () { setHidden(q.identity, !hidden[q.identity]); }));
      var speech = say(q.title + (stage === "primary" && r.prompt ? "。" + r.prompt : "")); if (speech) actions.appendChild(speech);
      li.appendChild(actions); return li;
    }
    function today() {
      var section = el("section", undefined, "lw-today"); section.id = "lw-today";
      append(section, heading(config.todayTitle || "今天复习"), el("p", (config.layout === "tabs" ? "共" : (config.todayTitle || "今天复习")) + " " + model.today.items.length + " 题", "lw-count"));
      if (model.today.remaining) section.appendChild(el("p", "还有 " + model.today.remaining + " 题"));
      if (!model.today.items.length) section.appendChild(el("p", "今天没有要复习的题。"));
      var items = el("ol");
      model.today.items.forEach(function (entry) {
        var q = model.questions.find(function (p) { return p.identity === entry.questionIdentity; });
        var original = model.questions.find(function (p) { return p.identity === entry.identity; });
        var row = el("li"), action = reviewLink(entry.needsReview ? config.reviewLabel || "回课时看一看" : "去做这道题", entry.href, entry.needsReview ? original : q, entry.needsReview);
        var prompt = original && stage === "primary" && rowMeta(original).prompt;
        append(row, el("span", original ? original.title + (prompt ? " · " + prompt : "") : "复习题")); if (action) row.appendChild(action); items.appendChild(row);
      });
      section.appendChild(items); return section;
    }
    function wrongbook() {
      var section = el("section"); section.id = "lw-wrongbook"; section.appendChild(heading(config.listTitle));
      var controls = el("div", undefined, "lw-filters"), groupSelect = el("select"), status = el("select");
      groupSelect.setAttribute("aria-label", stage === "primary" ? "按单元筛选" : "按章筛选");
      groupSelect.appendChild(new win.Option(stage === "primary" ? "全部单元" : "全部章节", ""));
      var groups = new Map(); model.wrongbook.forEach(function (q) { var r = rowMeta(q); groups.set(groupId(q), (stage === "primary" ? r.unitTitle : r.chapterTitle) || "其他记录"); });
      Array.from(groups).sort(function (a, b) { return a[0].localeCompare(b[0], undefined, { numeric: true }); })
        .forEach(function (entry) { groupSelect.appendChild(new win.Option(entry[1], entry[0])); });
      if (unit && !groups.has(unit)) unit = "";
      groupSelect.value = unit;
      groupSelect.addEventListener("change", function () { unit = groupSelect.value; render(); host.querySelector("[aria-label='" + groupSelect.getAttribute("aria-label") + "']").focus(); });
      var statuses = stage === "primary" ? [["all", "全部"], ["open", "还没改对"], ["corrected", "已改对"], ["hidden", "已收起"]] : [["all", "全部状态"]].concat(Object.keys(statusLabels).map(function (id) { return [id, statusLabels[id]]; }));
      statuses.forEach(function (entry) { status.appendChild(new win.Option(entry[1], entry[0])); });
      status.dataset.lwStatus = ""; status.setAttribute("aria-label", "按状态筛选"); status.value = filter;
      status.addEventListener("change", function () { filter = status.value; render(); host.querySelector("[data-lw-status]").focus(); });
      append(controls, groupSelect, status); section.appendChild(controls);
      if (chapters) {
        function selectControl(label, entries, value, onChange) {
          var select = el("select"); select.setAttribute("aria-label", label);
          entries.forEach(function (entry) { select.appendChild(new win.Option(entry[1], entry[0])); }); select.value = value;
          select.addEventListener("change", function () { onChange(select.value); render(); host.querySelector('[aria-label="' + label + '"]').focus(); });
          controls.appendChild(select);
        }
        // High school only indexes practice questions, so a source filter would have one option.
        if (stage === "junior") selectControl("按来源筛选", [["", "全部来源"], ["predict", "课内"], ["diagnostic", "诊断"], ["exam", "章末测验"]], source, function (value) { source = value; });
        selectControl("错题排序", [["recent", "最近错"], ["oldest", "最早错"], ["count", "错误次数"], ["due", "复习到期"]], sort, function (value) { sort = value; });
      }
      var shown = model.wrongbook.filter(function (q) {
        if (unit && groupId(q) !== unit) return false;
        if (chapters) return (!source || (source === "predict" ? sourceText(q) === "课内" : q.questionType === source)) && (filter === "all" ? !hidden[q.identity] : wrongStatus(q) === filter);
        return filter === "hidden" ? !!hidden[q.identity] : !hidden[q.identity] && (filter === "all" || (filter === "corrected" ? q.group === "corrected" : q.group !== "corrected"));
      });
      if (chapters) shown.sort(function (a, b) {
        var delta = sort === "oldest" ? a.firstWrongAt - b.firstWrongAt : sort === "count" ? b.wrongCount - a.wrongCount : sort === "due" ? (a.dueAt || Infinity) - (b.dueAt || Infinity) : b.lastWrongAt - a.lastWrongAt;
        return delta || (a.identity < b.identity ? -1 : a.identity > b.identity ? 1 : 0);
      });
      var ul = el("ul", undefined, "lw-list"); shown.forEach(function (q) { ul.appendChild(item(q)); });
      section.appendChild(shown.length ? ul : el("p", "这里暂时没有题。做过练习后再来看看。", "lw-note")); return section;
    }
    function tier(p) {
      if (p.state === "unseen") return null;
      if (p.state === "learned" || p.state === "secure") return p.stale ? "stale" : "ok";
      return "practice";
    }
    function tierList(entries) {
      // Each tier is a disclosure whose body lists the points and the evidence behind them; no scores or percentages.
      var wrap = el("div", undefined, "lw-tiers");
      [["practice", "还要练"], ["ok", "基本会了"], ["stale", "有点生疏"]].forEach(function (t) {
        var members = entries.filter(function (p) { return tier(p) === t[0]; });
        if (!members.length) return;
        var box = el("details", undefined, "lw-tier lw-tier-" + t[0]); box.dataset.lwTier = t[0];
        box.appendChild(el("summary", t[1] + "（" + members.length + " 个知识点）"));
        var ul = el("ul");
        members.forEach(function (p) {
          var meta = content.points.find(function (x) { return (x.pointId || x.id) === p.pointId; }), li = el("li");
          append(li, el("strong", meta && meta.title || "知识点"),
            el("span", " · 已作答 " + p.answered + " 题" + (p.wrongOpen ? " · 待巩固 " + p.wrongOpen + " 题" : "") +
              " · 最近计入 " + (p.lastStrongAt ? new Date(p.lastStrongAt).toLocaleDateString("zh-CN") : "暂无"), "lw-note"));
          ul.appendChild(li);
        });
        box.appendChild(ul); wrap.appendChild(box);
      });
      return wrap;
    }
    function learned() {
      var section = el("section"); section.id = "lw-learned"; section.appendChild(heading(config.learnedTitle || "我学会了哪些"));
      var points = model.points.filter(function (p) { return !config.pointPrefix || p.pointId.startsWith(config.pointPrefix); });
      var groups = new Map();
      points.forEach(function (p) { list(p.groupIds).forEach(function (id) { if (!groups.has(id)) groups.set(id, []); groups.get(id).push(p); }); });
      var groupIds = Array.from(groups.keys());
      if (chapters) groupIds.sort(function (a, b) { return a.localeCompare(b, "en", { numeric: true }); });
      var shownGroups = 0;
      groupIds.forEach(function (id) {
        var entries = groups.get(id);
        // High school has dozens of chapters; only chapters with answers are listed.
        if (config.tiers && !entries.some(function (p) { return p.state !== "unseen"; })) return;
        shownGroups++;
        var group = model.groups.find(function (g) { return g.id === id; }), detail = el("details", undefined, "lw-group");
        detail.appendChild(el("summary", group ? group.title : id));
        if (config.tiers) { detail.appendChild(tierList(entries)); section.appendChild(detail); return; }
        var counts = el("ul", undefined, "lw-states");
        ["secure", "learned", "wrong", "practicing", "unseen"].forEach(function (state) { counts.appendChild(el("li", (config.labels[state] || state) + " " + entries.filter(function (p) { return p.state === state; }).length)); });
        detail.appendChild(counts);
        if (stage === "junior") {
          // E6 may later admit chapter-test rows. Until then no score is invented.
          var exams = model.questions.filter(function (q) { return q.current && q.questionType === "exam" && /^j\d+-test$/.test(q.owner) && groupId(q) === id; });
          var firsts = exams.map(function (q) { return list(store.answers(q.identity))[0]; });
          if (exams.length && firsts.every(function (a) { return a && !a.legacy && a.attemptKind === "independent" && typeof a.correct === "boolean" && a.time > 0 && a.time <= now(); })) {
            detail.appendChild(el("p", "章末测验首次：" + firsts.filter(function (a) { return a.correct; }).length + "/" + exams.length, "lw-first-score"));
          }
          var table = el("table", undefined, "lw-mastery"), thead = el("thead"), header = el("tr"), body = el("tbody");
          table.appendChild(el("caption", (group ? group.title : id) + "知识点状态"));
          ["知识点", "状态", "作答证据", "最近计入"].forEach(function (text) { var th = el("th", text); th.scope = "col"; header.appendChild(th); });
          thead.appendChild(header); table.appendChild(thead);
          entries.forEach(function (p) {
            var meta = content.points.find(function (x) { return (x.pointId || x.id) === p.pointId; }), row = el("tr"), name = el("th", meta && meta.title || p.pointId); name.scope = "row";
            append(row, name, el("td", stateText(p)), el("td", "已作答 " + p.answered + " 题 · 待巩固 " + p.wrongOpen + " 题"), el("td", p.lastStrongAt ? new Date(p.lastStrongAt).toLocaleDateString("zh-CN") : "暂无")); body.appendChild(row);
          });
          table.appendChild(body); var scroll = el("div", undefined, "lw-table-wrap"); scroll.appendChild(table); detail.appendChild(scroll);
        } else entries.forEach(function (p) { var meta = content.points.find(function (x) { return (x.pointId || x.id) === p.pointId; }); detail.appendChild(el("p", (meta && meta.title || "知识点") + " · " + stateText(p))); });
        section.appendChild(detail);
      });
      if (!shownGroups) section.appendChild(el("p", "做过知识点自测后，这里会显示学习记录。", "lw-note"));
      if (config.tiers) section.appendChild(el("p", "还要练：有错题还没改对，或还没有计入的答对。基本会了：有计入的答对。有点生疏：会过，但已超过 " + (config.staleDays || 30) + " 天没有计入新的答对。", "lw-note"));
      if (stage === "junior") section.appendChild(el("p", "初步掌握：有一次计入的答对。已巩固：有两次计入的答对，两次间隔满 20 小时。", "lw-note"));
      return section;
    }
    function render() {
      if (destroyed) return;
      var focusedTab = doc.activeElement && doc.activeElement.getAttribute("data-lw-tab");
      var snapshot = store.snapshot();
      model = mastery.derive(snapshot, store.answersReader ? store.answersReader() : function (id) { return store.answers(id); }, content, now(), { stage: stage, dailyLimit: Math.min(config.dailyLimit || (stage === "primary" ? 5 : 10), stage === "primary" ? 5 : 10), staleDays: config.staleDays });
      var page = el("div", undefined, "lw-page"); page.appendChild(el("h1", "我的学习"));
      page.appendChild(el("p", "记录只保存在这台设备的浏览器里，不会上传。", "lw-note"));
      if (snapshot.storage && snapshot.storage.memoryOnly) page.appendChild(el("p", "这次的记录可能保存不下来。", "lw-alert"));
      if (snapshot.storage && snapshot.storage.historyIncomplete) page.appendChild(el("p", "部分早期记录不完整，个别题的状态可能偏保守。", "lw-alert"));
      if (preferenceFailed || !storage) page.appendChild(el("p", "收起设置可能只在这次打开时有效。", "lw-alert"));
      if (config.readAloud && !voice()) page.appendChild(el("p", "这台设备暂不支持本地朗读，可以看拼音。", "lw-note"));
      var sections = [today(), wrongbook(), learned()];
      if (config.layout === "tabs") {
        var nav = el("nav", undefined, "lw-tabs"), tabs = [], panels = [sections[1], sections[2], sections[0]];
        nav.setAttribute("aria-label", "学习记录分区"); nav.setAttribute("role", "tablist"); nav.setAttribute("aria-orientation", "horizontal");
        // The original record renderer owns its subtree, including export handlers.
        // Keep that node outside replaceChildren and only change its tab visibility.
        var records = recordsHost || el("section", "学习记录在下方保留。", "lw-records"); records.id = "lw-records"; panels.push(records);
        if (!recordsHost) sections.push(records);
        var ids = ["wrongbook", "learned", "today", "records"];
        function activate(id, focus) {
          activeTab = id;
          tabs.forEach(function (tab, i) {
            var selected = ids[i] === id; tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1; panels[i].hidden = !selected;
          });
          if (focus) tabs[ids.indexOf(id)].focus();
        }
        var count = model.wrongbook.filter(function (q) { return q.group !== "corrected" && !hidden[q.identity]; }).length;
        var labels = [config.listTitle + " (" + count + ")", config.learnedTitle || "我学会了哪些", (config.todayTitle || "今天复习") + " (" + model.today.items.length + ")", "记录"];
        ids.forEach(function (id, i) {
          var tab = button(labels[i], function () { activate(id, false); }); tab.id = "lw-tab-" + id; tab.dataset.lwTab = id;
          tab.setAttribute("role", "tab"); tab.setAttribute("aria-controls", panels[i].id);
          panels[i].setAttribute("role", "tabpanel"); panels[i].setAttribute("aria-labelledby", tab.id); panels[i].tabIndex = 0;
          tab.addEventListener("keydown", function (event) {
            var next = event.key === "ArrowRight" ? (i + 1) % ids.length : event.key === "ArrowLeft" ? (i + ids.length - 1) % ids.length : event.key === "Home" ? 0 : event.key === "End" ? ids.length - 1 : event.key === "Enter" || event.key === " " ? i : -1;
            if (next < 0) return; event.preventDefault(); activate(ids[next], true);
          });
          tabs.push(tab); nav.appendChild(tab);
        });
        activate(activeTab, false);
        page.appendChild(nav);
      }
      sections.forEach(function (s) { page.appendChild(s); }); page.appendChild(live); host.replaceChildren(page);
      if (focusedTab) { var focusTarget = host.querySelector('[data-lw-tab="' + focusedTab + '"]'); if (focusTarget) focusTarget.focus(); }
      var nextSignature = JSON.stringify(model.questions.map(function (q) { return [q.identity, q.state, q.fixes]; }));
      if (signature !== undefined && signature !== nextSignature) announce("学习记录已更新。今天可以复习 " + model.today.items.length + " 题。");
      signature = nextSignature;
      // Late voice discovery can shrink the content above the fragment. Follow
      // until its first render completes, the reader takes control, or 4s elapse.
      if (fragmentId) alignFragment(fragmentId);
    }
    function followFragment() {
      if (destroyed) return false;
      stopFollowingFragment();
      var match = /^#lw-(wrongbook|learned|today|records)$/.exec(win.location.hash);
      if (!match) return false;
      if (config.layout === "tabs") activeTab = match[1];
      render();
      // The async fragment needs explicit scrolling; keep its tab choices in view.
      fragmentId = "lw-" + match[1];
      alignFragment(fragmentId);
      fragmentInputs.forEach(function (type) { win.addEventListener(type, stopFollowingFragment, { capture: true, passive: true }); });
      fragmentTimer = win.setTimeout(stopFollowingFragment, 4000);
      return true;
    }
    if (!followFragment()) render();
    var unsubscribe = store.subscribe ? store.subscribe(render) : function () {};
    function storageEvent(event) { if (event.key === key || event.key === null) { hidden = readHidden(); render(); } }
    win.addEventListener("storage", storageEvent);
    win.addEventListener("hashchange", followFragment);
    // A4 print: the mastery chapters are collapsed <details>; open them for the page and restore afterwards.
    var printOpened = [];
    function beforePrint() { host.querySelectorAll("#lw-learned details").forEach(function (d) { if (!d.open) { d.open = true; printOpened.push(d); } }); }
    function afterPrint() { printOpened.forEach(function (d) { d.open = false; }); printOpened = []; }
    win.addEventListener("beforeprint", beforePrint); win.addEventListener("afterprint", afterPrint);
    // Browsers may fire voiceschanged before any Chinese voice exists (Chromium does on load);
    // keep following until the voice render that actually removes the no-voice note (PY-360).
    function voicesChanged() { render(); if (!config.readAloud || voice()) stopFollowingFragment(); }
    if (win.speechSynthesis && win.speechSynthesis.addEventListener) win.speechSynthesis.addEventListener("voiceschanged", voicesChanged);
    timer = win.setInterval(function () { if (!host.contains(doc.activeElement)) render(); }, 60000);
    return { refresh: render, snapshot: function () { return model; }, destroy: function () { destroyed = true; stopFollowingFragment(); afterPrint(); unsubscribe(); win.clearInterval(timer); win.removeEventListener("storage", storageEvent); win.removeEventListener("hashchange", followFragment); win.removeEventListener("beforeprint", beforePrint); win.removeEventListener("afterprint", afterPrint); if (win.speechSynthesis && win.speechSynthesis.removeEventListener) win.speechSynthesis.removeEventListener("voiceschanged", voicesChanged); } };
  }
  return { primary: primary, junior: junior, high: high, mount: mount };
});
