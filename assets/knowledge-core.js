/* 独立知识点详情与自测；不读写旧卡片、旧日志的存储。 */
(function () {
  "use strict";
  var body = document.body, junior = !!body && (body.getAttribute("data-stage") === "junior" || /^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(body.getAttribute("data-sec") || ""));
  if (junior) body.classList.add("knowledge-junior");
  var script = document.currentScript;
  var root = new URL("../", script && script.src ? script.src : new URL("assets/knowledge-core.js", document.baseURI));
  // A junior page may load the shared script through /assets/ or /junior/assets/.
  // Resolve its data and deep links from the page's site root in either case.
  if (junior) root = new URL(/^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(body.getAttribute("data-sec") || "") ? "../" : "./", document.baseURI);
  var STORAGE_KEY = junior ? "peiyu.jh.knowledge.v1" : "peiyu.hs.knowledge.v1", HISTORY_LIMIT = 120;
  var data = null, loading = null, memoryOnly = false;
  var renderedHosts = new Map();
  var scopeLabels = { required: "本节核心", selective_required: "选必内容", optional: "选学", enrichment: "拓展 · 可以跳过", teacher_reference: "教师参考" };
  var statusLabels = { untouched: "还未查看", viewed: "已查看 · 尚未自测", passed: "本次自测通过", review: "建议再练" };

  function blank() { return { version: 1, points: {}, history: [] }; }
  function validId(id) { return (junior ? /^pyjh\.[a-z]+\.\d{3}$/ : /^pyhs\.[a-z]+\.\d{3}$/).test(id || ""); }
  function sectionId(id) { return data && data.sections.some(function (s) { return s.id === id; }) ? id : null; }
  function parseState(raw) {
    var out = blank();
    try {
      var v = JSON.parse(raw || "null");
      if (!v || v.version !== 1 || !v.points || typeof v.points !== "object") return out;
      Object.keys(v.points).slice(0, 2000).forEach(function (id) {
        var p = v.points[id];
        if (!validId(id) || !p || typeof p !== "object") return;
        var clean = { viewedAt: Number(p.viewedAt) || 0 };
        var a = p.attempt;
        if (a && typeof a.diagnosticId === "string" && typeof a.choice === "string" && /^[a-z0-9-]{1,40}$/.test(a.choice) && typeof a.correct === "boolean") {
          clean.attempt = { diagnosticId: a.diagnosticId.slice(0, 80), choice: a.choice, correct: a.correct, submittedAt: Number(a.submittedAt) || 0 };
        }
        out.points[id] = clean;
      });
      if (Array.isArray(v.history)) out.history = v.history.filter(function (e) { return e && validId(e.pointId); }).slice(-HISTORY_LIMIT).map(function (e) {
        return { pointId: e.pointId, kind: e.kind === "reset" ? "reset" : "attempt", correct: e.correct === true, t: Number(e.t) || 0 };
      });
    } catch (e) { /* 损坏或旧版本的存储使用空状态，页面仍可用。 */ }
    return out;
  }
  var state;
  try { state = parseState(localStorage.getItem(STORAGE_KEY)); } catch (e) { memoryOnly = true; state = blank(); }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); memoryOnly = false; }
    catch (e) { memoryOnly = true; }
  }
  function notify(id) { window.dispatchEvent(new CustomEvent("peiyu-knowledge-change", { detail: { pointId: id } })); }
  function record(id, kind, correct) {
    state.history.push({ pointId: id, kind: kind, correct: correct === true, t: Date.now() });
    state.history = state.history.slice(-HISTORY_LIMIT);
  }
  function pointById(id) { return validId(id) && data && data.points.find(function (p) { return p.id === id; }); }
  function currentAttempt(id) {
    var entry = state.points[id], p = pointById(id);
    var a = entry && entry.attempt;
    if (!a || (data && !p) || (p && (!p.diagnostic || a.diagnosticId !== p.diagnostic.id))) return null;
    if (p && !p.diagnostic.options.some(function (o) { return o.id === a.choice; })) return null;
    return a;
  }
  function getStatus(id) {
    if (!validId(id) || (data && !pointById(id))) return "untouched";
    var a = currentAttempt(id);
    if (a) return a.correct ? "passed" : "review";
    return state.points[id] && state.points[id].viewedAt ? "viewed" : "untouched";
  }
  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(new URL("data/knowledge/catalog.json", root).href).then(function (r) {
      if (junior && (r.status === 404 || r.status === 410)) return null;
      // 老的集合样板仍可独立运行；服务器故障不静默回退为较小题库。
      if (r.status === 404 || r.status === 410) return fetch(new URL("data/knowledge/sets.json", root).href);
      return r;
    }).then(function (r) {
      if (!r) return null;
      if (!r.ok) throw new Error("知识点暂时没有加载成功。");
      return r.json();
    }).then(function (v) {
      if (junior && v === null) {
        data = { version: 1, domain: "junior-math", title: "初中知识库", domains: [], sections: [], points: [], unavailable: true };
        return data;
      }
      if (!v || (junior ? v.domain !== "junior-math" : (v.domain !== "sets" && v.domain !== "senior-math")) || !Array.isArray(v.points) || !Array.isArray(v.sections)) throw new Error("知识点数据格式不完整。");
      if (junior && v.sections.some(function (s) { return !/^j\d+-\d+$/.test(s.id); })) throw new Error("知识点数据格式不完整。");
      var domains = Array.isArray(v.domains) ? v.domains : [{ id: "sets", title: v.title || "集合与逻辑" }];
      var allowedScopes = junior ? ["required", "optional", "enrichment"] : ["required", "selective_required", "optional", "enrichment"];
      var points = v.points.filter(function (p) { return p && validId(p.id) && allowedScopes.indexOf(p.course_scope) >= 0; }).map(function (p) {
        return Object.assign({}, p, { domain: p.domain || (v.domain === "sets" ? "sets" : "") });
      });
      var domainIds = domains.map(function (d) { return d.id; });
      if (!points.length || points.some(function (p) { return domainIds.indexOf(p.domain) < 0 || !v.sections.some(function (s) { return s.id === p.first_section; }); })) throw new Error("知识点数据格式不完整。");
      data = Object.assign({}, v, { points: points, domains: domains.filter(function (d) { return points.some(function (p) { return p.domain === d.id; }); }) });
      return data;
    }).catch(function (e) { loading = null; throw e; });
    return loading;
  }
  function availableInSection(id, context) {
    if (!junior || !context) return !!pointById(id);
    var p = pointById(id), ids = data ? data.sections.map(function (s) { return s.id; }) : [];
    var current = ids.indexOf(context), first = p ? ids.indexOf(p.first_section) : -1;
    if (current >= 0) return first >= 0 && first <= current;
    // 已上线课时可能尚未收录知识点。只用同学段已加载的课程索引补足顺序；未知课时仍不可见。
    var source = window.PeiyuLearningData;
    if (!p || !source || typeof source.stage !== "function" || typeof source.lesson !== "function" || source.stage() !== "junior") return false;
    var original = source.lesson(context), initial = source.lesson(p.first_section);
    return !!(original && initial && Number.isFinite(original.order) && Number.isFinite(initial.order) && initial.order <= original.order);
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function list(items, tag) { return "<" + (tag || "ul") + ">" + (items || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</" + (tag || "ul") + ">"; }
  function renderMath(host) {
    if (typeof window.renderMathInElement !== "function") return;
    window.renderMathInElement(host, { delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false }
    ], throwOnError: false, strict: "ignore", trust: false });
  }
  function pointHref(id, context) {
    var url = new URL("knowledge.html", root);
    if (sectionId(context)) url.searchParams.set("from", context);
    if (pointById(id)) url.hash = "point=" + encodeURIComponent(id);
    return url.href;
  }
  function lessonHref(id, step) { return sectionId(id) ? new URL("lessons/" + id + ".html#" + step, root).href : new URL("index.html", root).href; }
  function sectionTitle(id) {
    var found = data && data.sections.find(function (s) { return s.id === id; });
    return found ? found.title : (id || "本节");
  }
  function pointLinks(ids, context) {
    return ids.map(function (id) { var p = availableInSection(id, context) && pointById(id); return p ? '<a href="' + esc(pointHref(id, context)) + '" data-knavigate="' + esc(id) + '">' + esc(p.title) + "</a>" : ""; }).join("");
  }
  function complementHTML() {
    return '<div class="k-complement"><h3>在 U 里，才谈补集</h3><p class="k-note">$U=\\{1,2,3,4\\}$，$A=\\{1,4\\}$。点一个数，看它是否属于 $\\complement_U A$。</p>' +
      '<div class="k-set-play"><div class="k-universe"><div class="k-universe-label">全集 U</div><div class="k-set-interior"><div class="k-set-a"><span>A</span><button class="k-set-token" type="button" data-k-complement="1" aria-pressed="false">1</button><button class="k-set-token" type="button" data-k-complement="4" aria-pressed="false">4</button></div><button class="k-set-token" type="button" data-k-complement="2" aria-pressed="false">2</button><button class="k-set-token" type="button" data-k-complement="3" aria-pressed="false">3</button></div></div>' +
      '<div class="k-set-outside"><button class="k-set-token" type="button" data-k-complement="5" aria-pressed="false">5</button><span>U 外面</span></div></div><p class="k-set-answer" aria-live="polite" data-k-complement-result>不在 A 中，还要检查是否在 U 中。</p></div>';
  }
  function renderPoint(host, id, options) {
    options = options || {};
    var p = pointById(id);
    // Even a direct render on a lesson must respect its current teaching boundary.
    if (junior && /^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(body.getAttribute("data-sec") || "") && !availableInSection(id, body.getAttribute("data-sec"))) p = null;
    renderedHosts.delete(host);
    host.replaceChildren();
    if (!p) { host.innerHTML = '<p class="k-empty">没有找到这个知识点。请从目录选择。</p>'; return; }
    renderedHosts.set(host, { pointId: id, options: options });
    var context = sectionId(options.contextSection), returnSection = context || sectionId(p.first_section);
    var extra = p.course_scope !== "required" && p.course_scope !== "selective_required";
    var later = data.points.filter(function (q) { return q.prerequisites.indexOf(id) >= 0; }).map(function (q) { return q.id; });
    var quiz = p.diagnostic;
    var domain = data.domains.find(function (d) { return d.id === p.domain; });
    var html = '<article class="k-point" data-knowledge-id="' + esc(id) + '"><div class="k-point-head"><span>' + esc((domain ? domain.title + " / " : "") + sectionTitle(p.first_section)) + '</span><span class="k-scope' + (extra ? " enrichment" : "") + '">' + esc(scopeLabels[p.course_scope] || "拓展") + '</span><span class="k-point-status" data-kpoint-status></span></div>' +
      '<h2 class="k-point-title">' + esc(p.title) + '</h2>' + (extra ? '<p class="k-optional">' + (junior && p.course_scope === "optional" ? "这是选学内容，可以先跳过。" : "这是拓展内容，可以先跳过。") + '读过或通过这道题，都不会改变核心课的学习要求。</p>' : "") +
      '<p class="k-definition">' + esc(p.definition) + '</p>' + (id === "pyhs.set.012" ? complementHTML() : "") +
      '<section class="k-conditions"><h3>用之前，先确认</h3>' + list(p.conditions) + '</section><section><h3>容易混在哪里</h3>' +
      p.misconceptions.map(function (m) { return '<div class="k-misconception"><p class="k-error"><b>常见误解：</b>' + esc(m.error) + '</p><p class="k-correction"><b>这样分清：</b>' + esc(m.correction) + '</p></div>'; }).join("") + '</section>';
    if (quiz) {
      html += '<form class="k-quiz" data-kquiz="' + esc(quiz.id) + '"><fieldset><legend>用一道题检验</legend><p class="k-quiz-prompt">' + esc(quiz.prompt) + '</p><div class="k-options">' +
        quiz.options.map(function (o, i) { return '<label class="k-option" data-koption="' + esc(o.id) + '"><input type="radio" name="kquiz-' + esc(quiz.id) + '" value="' + esc(o.id) + '"><span><b>' + String.fromCharCode(65 + i) + '.</b> ' + esc(o.text) + '</span></label>'; }).join("") +
        '</div></fieldset><div class="k-quiz-actions"><button type="submit" class="btn" data-kquiz-submit>核对答案</button><button type="button" class="btn ghost" data-kquiz-reset hidden>重新做这题</button></div><div class="k-quiz-feedback" data-kquiz-feedback aria-live="polite" hidden></div><p class="k-note">只记录这道题的表现；查看知识点不等于已经掌握。</p></form>';
    } else html += '<p class="k-note">这个知识点的自测题还在整理，可以先回课时练习。</p>';
    html += '<p class="k-storage" data-k-storage hidden>浏览器未能保存记录，本次页面内仍可继续自测。</p><details class="k-more"><summary>学完可以做什么</summary>' + list(p.outcomes) + '</details>' +
      '<details class="k-more"><summary>学习范围与可用方法</summary><h3>可以这样做</h3>' + list(p.boundary.allowed) + '<h3>这里不默认要求</h3>' + list(p.boundary.not_assumed) + '</details>';
    if (p.prerequisite_notes.length) html += '<details class="k-more"><summary>开始前还会用到</summary>' + list(p.prerequisite_notes) + '</details>';
    html += '<section><h3>把知识接起来</h3><p class="k-relation-label">先把这些分清</p><div class="k-links">' + (pointLinks(p.prerequisites, context) || '<span class="k-note">本模块没有额外的知识点先修。</span>') + '</div><p class="k-relation-label">接着可以看</p><div class="k-links">' + (pointLinks(later, context) || '<span class="k-note">可以回课时练习，把这个点用起来。</span>') + '</div></section>';
    if (!junior && p.legacy_cards.length) html += '<section><h3>相关方法与红线卡</h3><div class="k-links">' + p.legacy_cards.map(function (card) { return '<a href="' + esc(new URL("wiki.html#card-" + encodeURIComponent(card.id), root).href) + '">' + esc(card.title) + '</a>'; }).join("") + '</div></section>';
    html += '<footer class="k-lesson-links"><a class="btn ghost" href="' + esc(lessonHref(returnSection, "step2")) + '">回到' + esc(sectionTitle(returnSection)) + '讲解</a><a class="btn" href="' + esc(lessonHref(returnSection, "step4")) + '">去课时练习</a></footer></article>';
    host.innerHTML = html;
    var entry = state.points[id] || (state.points[id] = { viewedAt: 0 });
    if (!entry.viewedAt) { entry.viewedAt = Date.now(); save(); notify(id); }
    function refreshStatus() {
      var status = getStatus(id), el = host.querySelector("[data-kpoint-status]");
      el.textContent = statusLabels[status]; el.className = "k-point-status " + status;
      host.querySelector("[data-k-storage]").hidden = !memoryOnly;
    }
    function paintAttempt() {
      var attempt = currentAttempt(id), form = host.querySelector("[data-kquiz]");
      if (!form) return;
      form.querySelectorAll("input[type=radio]").forEach(function (input) {
        input.checked = !!attempt && input.value === attempt.choice;
        input.disabled = !!attempt;
        var label = input.closest(".k-option");
        label.classList.toggle("correct", !!attempt && input.value === quiz.correct);
        label.classList.toggle("incorrect", !!attempt && input.value === attempt.choice && !attempt.correct);
      });
      form.querySelector("[data-kquiz-submit]").hidden = !!attempt;
      form.querySelector("[data-kquiz-reset]").hidden = !attempt;
      var feedback = form.querySelector("[data-kquiz-feedback]");
      feedback.hidden = !attempt; feedback.className = "k-quiz-feedback" + (attempt && !attempt.correct ? " review" : "");
      if (attempt) {
        var chosen = quiz.options.find(function (o) { return o.id === attempt.choice; });
        feedback.innerHTML = '<p><b>' + (attempt.correct ? "本次自测通过。" : "这题建议再练。") + '</b></p><p>' + esc(chosen.feedback) + '</p>' + list(quiz.reasoning, "ol");
        renderMath(feedback);
      } else feedback.replaceChildren();
      refreshStatus();
    }
    host.querySelectorAll("[data-knavigate]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (!options.onNavigate || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault(); options.onNavigate(link.getAttribute("data-knavigate"));
      });
    });
    host.querySelectorAll("[data-k-complement]").forEach(function (button) {
      button.addEventListener("click", function () {
        var n = button.getAttribute("data-k-complement");
        host.querySelectorAll("[data-k-complement]").forEach(function (b) { b.setAttribute("aria-pressed", b === button ? "true" : "false"); });
        host.querySelector("[data-k-complement-result]").textContent = n === "5" ? "5 不在 U 中，所以不属于 A 在 U 中的补集。只看“不在 A 中”还不够。" : (n === "1" || n === "4" ? n + " 已经在 A 中，所以不属于补集。" : n + " 在 U 中，而且不在 A 中，所以属于补集。");
      });
    });
    if (quiz) {
      var form = host.querySelector("[data-kquiz]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (currentAttempt(id)) return;
        var selected = form.querySelector("input[type=radio]:checked");
        if (!selected) {
          var warning = form.querySelector("[data-kquiz-feedback]"); warning.hidden = false; warning.textContent = "先选一个答案，再来核对。";
          form.querySelector("input[type=radio]").focus(); return;
        }
        var liveEntry = state.points[id] || (state.points[id] = { viewedAt: Date.now() });
        liveEntry.attempt = { diagnosticId: quiz.id, choice: selected.value, correct: selected.value === quiz.correct, submittedAt: Date.now() };
        record(id, "attempt", liveEntry.attempt.correct); save(); paintAttempt(); notify(id);
        form.querySelector("[data-kquiz-reset]").focus({ preventScroll: true });
      });
      form.querySelector("[data-kquiz-reset]").addEventListener("click", function () {
        var liveEntry = state.points[id] || (state.points[id] = { viewedAt: Date.now() });
        delete liveEntry.attempt; record(id, "reset", false); save(); paintAttempt(); notify(id);
        form.querySelector("input[type=radio]").focus({ preventScroll: true });
      });
      paintAttempt();
    }
    refreshStatus(); renderMath(host);
  }
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    var previous = state;
    state = parseState(e.key === null ? null : e.newValue);
    Array.from(renderedHosts.entries()).forEach(function (pair) {
      var host = pair[0], view = pair[1];
      if (!host.isConnected) { renderedHosts.delete(host); return; }
      if (JSON.stringify(previous.points[view.pointId]) === JSON.stringify(state.points[view.pointId])) return;
      var hadFocus = host.contains(document.activeElement);
      renderPoint(host, view.pointId, view.options);
      if (hadFocus) {
        var nextFocus = host.querySelector(currentAttempt(view.pointId) ? "[data-kquiz-reset]" : "[data-kquiz-submit]");
        if (nextFocus) nextFocus.focus({ preventScroll: true });
      }
    });
    notify(null);
  });
  window.PeiyuKnowledge = { stage: junior ? "junior" : "high", availableInSection: availableInSection, load: load, renderPoint: renderPoint, getStatus: getStatus, pointHref: pointHref, renderMath: renderMath };
})();
