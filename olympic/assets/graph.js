/* 局部知识图谱：显式路线、可返回的补救、带背景的换题证据。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1", api, D, catalog = [], base, activeId = null, activePhase = null, temporary = null, pageProblem = null;
  var params = new URLSearchParams(location.search), localNode = null;
  function object(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function now() { return new Date().toISOString(); }
  function problem(id, doc) { return (doc || D).problems.find(function (p) { return p.id === id; }); }
  function node(id, doc) { return (doc || D).nodes.find(function (n) { return n.id === id; }); }
  function validRun(r, doc) {
    doc = doc || D;
    return object(r) && /^g[a-z0-9]{8,60}$/.test(r.id) && r.revision === doc.revision && problem(r.origin, doc) &&
      ["guided", "challenge"].includes(r.mode) && ["origin", "verify"].includes(r.phase) &&
      (r.phase === "origin" ? r.target === r.origin : problem(r.origin, doc).verify.includes(r.target)) &&
      object(r.help) && object(r.prior) && object(r.background) && object(r.attempts) &&
      [r.help, r.prior, r.background].every(function (flags) { return typeof flags[r.phase] === "boolean"; }) &&
      (r.opened === undefined || (Array.isArray(r.opened) && r.opened.every(function (id) { return !!node(id, doc); }))) &&
      (r.draft === undefined || object(r.draft)) && (r.checks === undefined || object(r.checks)) &&
      Array.isArray(r.attempts.origin) && Array.isArray(r.attempts.verify) && Number.isFinite(Date.parse(r.at)) &&
      [r.attempts.origin, r.attempts.verify].every(function (list) {
        return list.length <= 30 && list.every(function (a) { return object(a) && ["ok", "no", "part", "unsure"].includes(a.result); });
      });
  }
  function graphRoot(data) {
    var old = data.graphStudy, graphs = {};
    if (object(old) && old.version === 2 && object(old.graphs)) {
      Object.keys(old.graphs).filter(function (fr) { return /^FR\d{3}$/.test(fr); }).forEach(function (fr) { graphs[fr] = old.graphs[fr]; });
    } else if (object(old) && old.version === 1 && typeof old.revision === "string") {
      // 旧版唯一图谱属于FR008；保留其路线、阅读背景和草稿，不牵动真题记录。
      graphs.FR008 = old;
    }
    return { version: 2, graphs: graphs };
  }
  function state(data, doc) {
    doc = doc || D;
    var s = graphRoot(data).graphs[doc.fr];
    if (!object(s) || s.revision !== doc.revision || s.version !== 1) return { version: 1, revision: doc.revision, runs: [], exposed: {} };
    return { version: 1, revision: doc.revision, runs: (Array.isArray(s.runs) ? s.runs : []).filter(function (r) { return validRun(r, doc); }).slice(-20),
      exposed: object(s.exposed) ? s.exposed : {}, last: typeof s.last === "string" ? s.last : null };
  }
  function writeState(data, s) { var root = graphRoot(data); root.graphs[D.fr] = s; data.graphStudy = root; }
  function current() {
    var r = temporary && temporary.id === activeId ? temporary :
      state(api.load()).runs.find(function (r) { return r.id === activeId; });
    // 每次操作都重新核对，避免另一标签页换题后，旧页向新阶段写入草稿或成绩。
    if (!r || (activePhase && r.phase !== activePhase) || (pageProblem && r.target !== pageProblem)) return null;
    return r;
  }
  function saveRun(r) {
    r.at = now();
    if (temporary) { temporary = r; return false; }
    var data = api.load(), s = state(data);
    s.runs = s.runs.filter(function (x) { return x.id !== r.id; }).concat([r]).slice(-20);
    s.last = r.id; writeState(data, s);
    if (!api.save(data)) { temporary = r; return false; }
    return true;
  }
  function change(fn) {
    var r = current();
    if (!r) { render(); return null; }
    fn(r); saveRun(r); return r;
  }
  function seen(id) { var p = api.load().problems[id]; return object(p) && Object.keys(p).length > 0; }
  function background(id) {
    var data = api.load(), s = state(data), oldStudy = data.studyPosition;
    return (object(oldStudy) && oldStudy.fr === D.fr && ["example", "checks", "transfer", "practice"].includes(oldStudy.step)) ||
      problem(id).nodes.some(function (n) { return !!s.exposed[n]; });
  }
  function keepDraft(r) {
    r.draft = r.draft || {};
    var input = document.querySelector(".answer input.ans");
    if (input) r.draft[r.phase] = input.value.slice(0, 2000);
    else if (document.querySelector(".answer [data-letter]")) {
      r.draft[r.phase] = { type: "choice", letters: Array.from(document.querySelectorAll('.answer [data-letter][aria-pressed="true"]')).map(function (b) { return b.dataset.letter; }) };
    }
  }
  function context(id) {
    var r = current();
    if (!r || r.target !== id) return null;
    return { graph: D.fr, revision: D.revision, run: r.id, mode: r.mode, phase: r.phase,
      topicKnown: true, previouslySeen: !!(r.prior || {})[r.phase],
      foundationViewed: !!r.help[r.phase], methodBackground: !!(r.background || {})[r.phase], temporary: !!temporary };
  }
  function routeURL(r, where, selectedNode, doc) {
    doc = doc || D;
    var u = new URL(where === "graph" ? "g/" + doc.fr + ".html" : "p/" + r.target + ".html", base);
    u.searchParams.set("graph", doc.fr); u.searchParams.set("run", r.id);
    u.searchParams.set("phase", r.phase);
    if (where === "problem") u.searchParams.set("practice", "1");
    if (selectedNode && node(selectedNode, doc)) u.searchParams.set("node", selectedNode);
    if (temporary && temporary.id === r.id) {
      u.searchParams.set("temp", "1"); u.searchParams.set("rev", doc.revision);
      u.searchParams.set("origin", r.origin); u.searchParams.set("target", r.target); u.searchParams.set("mode", r.mode);
    }
    return u.href;
  }
  function setLocation(r, where, selectedNode) { location.href = routeURL(r, where, selectedNode); }
  function start(mode, origin) {
    origin = problem(origin) ? origin : D.default_problem;
    temporary = null;
    var r = { id: "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10), revision: D.revision,
      origin: origin, target: origin, mode: mode, phase: "origin", createdAt: now(), at: now(),
      help: { origin: mode === "guided", verify: false },
      prior: { origin: seen(origin) }, background: { origin: mode === "guided" || background(origin) },
      attempts: { origin: [], verify: [] }, checks: {}, opened: [], draft: {}, place: mode === "guided" ? "graph" : "problem" };
    activeId = r.id; activePhase = "origin"; saveRun(r);
    if (mode === "challenge") setLocation(r, "problem");
    else { updateURL(r); openNode(D.entry_node || "sign", true); render(); }
  }
  function updateURL(r) {
    // 只从受验证的题号构造站内路径，不采纳 return/href 等任意参数。
    try { history.replaceState(null, "", routeURL(r, "graph", localNode)); } catch (e) { /* file: 浏览器仍可用实际按钮返回 */ }
  }
  function rememberExposure(id) {
    var data = api.load(), s = state(data); s.exposed[id] = now(); writeState(data, s); api.save(data);
  }
  function markHelp(kind) {
    var r = change(function (r) { r.help[r.phase] = true; });
    if (r) api.record(r.target, kind || "view-graph-foundation");
  }
  function openNode(id, focus) {
    if (!node(id)) return;
    localNode = id; rememberExposure(id);
    var r = change(function (r) {
      r.node = id; r.place = "graph"; r.help[r.phase] = true;
      r.opened = Array.from(new Set((r.opened || []).concat([id])));
    });
    if (r) { api.record(r.target, "view-graph-foundation"); updateURL(r); }
    document.querySelectorAll("[data-node-panel]").forEach(function (p) { p.hidden = p.dataset.nodePanel !== id; });
    document.querySelectorAll("[data-graph-node]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.graphNode === id));
      b.setAttribute("aria-expanded", String(b.dataset.graphNode === id));
    });
    var panel = document.querySelector('[data-node-panel="' + id + '"]');
    var savedCheck = r && r.checks && r.checks[id] && r.checks[id].latest;
    if (panel && savedCheck && Number.isInteger(savedCheck.choice)) {
      var input = panel.querySelector('input[value="' + savedCheck.choice + '"]');
      if (input) {
        input.checked = true;
        panel.querySelectorAll("[data-graph-feedback]").forEach(function (f) { f.hidden = f.dataset.graphFeedback !== input.value; });
        panel.querySelector(".graph-quiz-result").dataset.correct = String(input.value === panel.querySelector("form").dataset.correct);
      }
    }
    if (panel) {
      var practice = panel.querySelector(".graph-node-practice");
      if (!practice) {
        practice = document.createElement("section"); practice.className = "graph-node-practice";
        var title = document.createElement("h3"); title.textContent = "把这一点用到题目里"; practice.append(title);
        var tasks = D.problems.filter(function (p) { return p.nodes.includes(id); });
        var explanation = document.createElement("p"); explanation.className = "hint-text";
        explanation.textContent = tasks.length ? "带着刚学的基础试题，会保留相关学习背景；不会算作完全未提示方法的挑战。" :
          "这个节点先用上面的条件辨析检查。本样板暂未配置直接对应的真题。";
        practice.append(explanation);
        tasks.forEach(function (p) {
          var row = document.createElement("div"); row.className = "graph-node-task";
          var taskButton = button(p.label, function () { start("challenge", p.id); });
          taskButton.dataset.graphPractice = p.id; row.append(taskButton);
          var why = document.createElement("p"); why.className = "hint-text"; why.textContent = p.reason; row.append(why);
          practice.append(row);
        });
        panel.append(practice);
      }
      practice.hidden = !!r;
    }
    if (panel && focus) { panel.scrollIntoView({ block: "start", behavior: "auto" }); panel.querySelector("h2").focus({ preventScroll: true }); }
    render();
  }
  function outcome(r, phase) {
    var a = r.attempts[phase]; return a.length ? a[a.length - 1] : null;
  }
  function canVerify(r) { var a = outcome(r, "origin"); return a && ["ok", "no", "part"].includes(a.result); }
  function verify() {
    var r = current();
    if (!r || !canVerify(r)) return;
    if (r.phase === "verify") { setLocation(r, "problem"); return; }
    var choices = problem(r.origin).verify, next = choices.find(function (id) { return !seen(id); }) || choices[0];
    r.phase = "verify"; activePhase = "verify"; r.target = next; r.place = "problem";
    r.prior.verify = seen(next); r.background.verify = background(next) || r.mode === "guided";
    saveRun(r); setLocation(r, "problem");
  }
  function description(r, phase) {
    var a = outcome(r, phase);
    if (!a) return "尚未提交作答";
    var result = { ok: "完成", no: "未做出", part: "部分完成", unsure: "等待自评" }[a.result] || "等待自评";
    if (a.self) result += "（自评）";
    var prefix = a.helped ? "借助帮助" : "本次未用额外帮助";
    if (a.prior) prefix += " · 已接触过此题";
    if (a.background) prefix += " · 已有相关学习背景";
    return prefix + "：" + result;
  }
  function put(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function button(text, fn, className) { var b = document.createElement("button"); b.type = "button"; b.className = className || "pill"; b.textContent = text; b.addEventListener("click", fn); return b; }
  function anchor(text, href) { var a = document.createElement("a"); a.className = "pill"; a.textContent = text; a.href = href; return a; }
  function evidence(container, r, doc) {
    doc = doc || D;
    container.replaceChildren();
    var h = document.createElement("h3"); h.textContent = "这次练习留下的证据"; container.append(h);
    ["origin", "verify"].forEach(function (phase) {
      var p = document.createElement("p");
      p.textContent = (phase === "origin" ? "原题：" : "换题：") + description(r, phase); container.append(p);
    });
    var note = document.createElement("p"); note.className = "hint-text";
    note.textContent = "带练与直接挑战分开记录；本组已知" + (doc.topic_title || doc.title_text || "当前") + "专题。阅读和辨析不计真题做对率，换题完成也不代表整个知识点已掌握。";
    container.append(note);
  }
  function render() {
    if (!D) return;
    var r = current(), graph = document.getElementById("knowledge-graph");
    if (graph) {
      document.getElementById("graph-context").hidden = !r && !activeId;
      put("graph-context", r ? (r.mode === "guided" ? "带练" : "直接挑战") + " · " +
        (r.phase === "verify" ? "正在为换题补基础" : "补完后回到原题") + "：" + problem(r.target).label :
        activeId ? "这条路线的记录已清除或内容已更新。可以重新选择带练或挑战。" : "选择一个节点探索，或选一种方式开始。节点之间可以自由切换。" );
      put("graph-save-message", temporary ? "当前无法保存路线。仍可用下方按钮返回题目；刷新后练习证据可能丢失。" :
        r ? "路线与基础辨析保存在本机，可从首页或我的学习继续。" : "阅读与辨析不会增加真题成绩。" );
      var ret = document.getElementById("graph-return");
      if (ret) { ret.hidden = !r; if (r) { ret.href = routeURL(r, "problem"); ret.textContent = r.phase === "verify" ? "返回正在验证的题" : r.mode === "guided" && !outcome(r, "origin") ? "回到原题，自己试一试" : "返回原题继续"; } }
      var v = document.getElementById("graph-verify");
      if (v) { v.hidden = !r || !canVerify(r); v.textContent = r && r.phase === "verify" ? "继续这道验证题" : "换一道题验证"; }
      var ev = document.getElementById("graph-evidence"); if (ev) { ev.hidden = !r; if (r) evidence(ev, r); }
    }
    renderProblem(r); renderResume();
  }
  function renderProblem(r) {
    var box = document.getElementById("graph-problem-support"); if (!box) return;
    box.replaceChildren();
    var h = document.createElement("h2"); h.textContent = "卡住时，补一块基础"; box.append(h);
    var p = document.createElement("p"); p.className = "hint-text";
    p.textContent = r ? (r.mode === "guided" ? "带练" : "直接挑战") + " · " + (r.phase === "verify" ?
      (r.prior.verify ? "换题重做：这道题已有接触记录。" : "换题验证：这道题尚无站内接触记录。") : "原题") +
      "。先自己尝试，选择基础节点会记录为使用帮助。" : "选择卡点后，带着当前题进入图谱；补完可以回来继续。";
    box.append(p);
    if (activeId && !r) {
      p.textContent = "原路线已清除、失效或与当前页面不符。重新开始会建立一条新路线。";
      var live = state(api.load()).runs.find(function (x) { return x.id === activeId; });
      if (live) box.append(anchor("继续这条路线的当前题", routeURL(live, "problem")));
      box.append(button("从当前题重新挑战", function () { start("challenge", pageProblem); }));
      return;
    }
    var detail = document.createElement("details"), summary = document.createElement("summary");
    summary.textContent = "选择我想补的基础（会提供方向）"; detail.append(summary);
    // 折叠前不出现适用方法名；展开本身就是请求帮助。
    var choices = document.createElement("div"); choices.className = "graph-support-choices";
    problem(pageProblem).nodes.forEach(function (id) {
      choices.append(button(node(id).title, function () {
        var run = current();
        if (!run) {
          startLocal(pageProblem); run = current();
        }
        if (!run) return;
        keepDraft(run);
        run.node = id; run.place = "graph"; run.help[run.phase] = true; saveRun(run);
        api.record(pageProblem, "view-graph-foundation"); setLocation(current() || run, "graph", id);
      }));
    });
    detail.append(choices);
    detail.addEventListener("toggle", function () {
      if (!detail.open) return;
      if (!current()) startLocal(pageProblem);
      markHelp("view-graph-directions");
    });
    box.append(detail);
    if (r) {
      var ev = document.createElement("div"); evidence(ev, r); box.append(ev);
      var actions = document.createElement("div"); actions.className = "row";
      var v = button(r.phase === "verify" ? "继续当前验证题" : "换一道题验证", verify, "btn"); v.id = "graph-verify-next";
      v.disabled = !canVerify(r); v.hidden = r.phase === "verify"; actions.append(v);
      if (r.phase === "verify") {
        // 普通题页回看不改变验证任务，也不会把原题成绩误记为验证结果。
        var a = anchor("回看原题", new URL("p/" + r.origin + ".html", base).href); a.id = "graph-return-origin";
        actions.append(a);
      }
      actions.append(anchor("查看本次图谱与记录", routeURL(r, "graph", r.node)));
      box.append(actions);
      if (!canVerify(r)) { var n = document.createElement("p"); n.className = "hint-text"; n.textContent = "提交原题并完成核对后，就可以换题验证；未做出也可以继续。"; box.append(n); }
    }
  }
  function startLocal(id) {
    var r = { id: "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10), revision: D.revision,
      origin: id, target: id, mode: "challenge", phase: "origin", createdAt: now(), at: now(),
      help: { origin: true, verify: false }, prior: { origin: seen(id) }, background: { origin: background(id) },
      attempts: { origin: [], verify: [] }, checks: {}, opened: [], draft: {}, place: "problem" };
    activeId = r.id; activePhase = "origin"; temporary = null; saveRun(r);
  }
  function renderResume() {
    var data = api.load(), runs = [];
    catalog.forEach(function (doc) {
      state(data, doc).runs.forEach(function (r) { runs.push({ run: r, doc: doc }); });
    });
    runs.sort(function (a, b) { return String(b.run.at).localeCompare(String(a.run.at)); });
    ["graph-resume", "graph-home-resume", "graph-record"].forEach(function (id) {
      var box = document.getElementById(id); if (!box) return;
      var available = id === "graph-resume" ? runs.filter(function (x) { return x.doc.fr === D.fr && x.run.id !== activeId; }) : runs;
      if (id === "graph-home-resume") {
        var included = new Set();
        available = available.filter(function (x) { if (included.has(x.doc.fr)) return false; included.add(x.doc.fr); return true; });
      }
      box.replaceChildren(); box.hidden = !available.length;
      available.slice(0, id === "graph-record" ? 30 : id === "graph-home-resume" ? catalog.length : 1).forEach(function (x) {
        var r = x.run, doc = x.doc;
        var section = document.createElement("section"), h = document.createElement("h3");
        section.dataset.graphRecord = doc.fr;
        h.textContent = (doc.topic_title || doc.title_text) + (r.mode === "guided" ? "带练" : "挑战") + " · " + new Date(r.at).toLocaleDateString("zh-CN"); section.append(h);
        section.append(anchor(r.place === "graph" ? "继续补基础" : r.phase === "verify" ? "继续换题验证" : "回到原题", routeURL(r, r.place === "graph" ? "graph" : "problem", r.node, doc)));
        if (id === "graph-record") { var ev = document.createElement("div"); evidence(ev, r, doc); section.append(ev); }
        box.append(section);
      });
    });
  }
  function restore() {
    activeId = /^g[a-z0-9]{8,60}$/.test(params.get("run") || "") ? params.get("run") : null;
    activePhase = params.get("phase");
    if (activeId && params.get("temp") === "1" && params.get("rev") === D.revision) {
      var origin = params.get("origin"), target = params.get("target"), phase = params.get("phase"), mode = params.get("mode");
      var r = { id: activeId, revision: D.revision, origin: origin, target: target, phase: phase, mode: mode,
        createdAt: now(), at: now(), help: { origin: true, verify: true }, prior: { origin: true, verify: true },
        background: { origin: true, verify: true }, attempts: { origin: [], verify: [] }, checks: {}, draft: {}, place: "graph" };
      if (validRun(r)) temporary = r;
    }
    var live = current();
    if (live && (params.get("graph") !== D.fr || params.get("phase") !== live.phase || (pageProblem && live.target !== pageProblem))) {
      activeId = "invalid"; temporary = null;
    }
    if (pageProblem && current()) {
      var r2 = current(), input = document.querySelector("input.ans");
      if (input && r2.draft && typeof r2.draft[r2.phase] === "string") input.value = r2.draft[r2.phase].slice(0, 2000);
      var draft = r2.draft && r2.draft[r2.phase];
      if (!input && object(draft) && draft.type === "choice" && Array.isArray(draft.letters)) {
        document.querySelectorAll(".answer [data-letter]").forEach(function (b) {
          if (draft.letters.includes(b.dataset.letter) && b.getAttribute("aria-pressed") !== "true") b.click();
        });
      }
      change(function (r) { r.place = "problem"; });
      if (r2.mode === "guided" || r2.background[r2.phase] || r2.help[r2.phase]) api.record(pageProblem, "view-graph-background");
    }
  }
  function onRecord(event) {
    var r = current(), e = event.detail;
    if (!r || e.id !== r.target) return;
    if (e.kind === "attempt" || e.kind === "self") {
      change(function (r) {
        var last = outcome(r, r.phase), pending = e.kind === "self" && last && last.pending &&
          Date.now() - Date.parse(last.at) < 86400000;
        r.attempts[r.phase].push({ at: now(), result: e.result || "unsure", self: e.kind === "self",
          pending: e.kind === "attempt" && (!e.result || e.result === "unsure"),
          helped: pending ? last.helped : !!r.help[r.phase], prior: pending ? last.prior : !!r.prior[r.phase],
          background: pending ? last.background : !!r.background[r.phase] });
        r.attempts[r.phase] = r.attempts[r.phase].slice(-30);
      });
      render();
    } else if ((e.kind.indexOf("view-") === 0 || e.kind === "reveal-link" || e.kind === "compare") && e.kind !== "view-graph-background") {
      change(function (r) { r.help[r.phase] = true; });
      // 不重建正在展开的 details，以免中断学生的选择。
    }
  }
  function init() {
    var data = document.getElementById("graph-data"); api = window.PeiyuOlympic;
    if (!data || !api) return;
    var parsed = JSON.parse(data.textContent);
    catalog = Array.isArray(parsed.graphs) ? parsed.graphs : [parsed];
    if (!catalog.length) return;
    D = catalog[0];
    var script = Array.from(document.scripts).find(function (s) { return /\/graph\.js(?:\?|$)/.test(s.src); });
    base = new URL("../", script.src);
    if (Array.isArray(parsed.graphs)) {
      renderResume();
      window.addEventListener("pageshow", renderResume);
      window.addEventListener("storage", function (e) { if (e.key === STORE || e.key === null) renderResume(); });
      return;
    }
    var pd = document.getElementById("pdata"); pageProblem = pd ? JSON.parse(pd.textContent).id : null;
    if (pageProblem && !problem(pageProblem)) return;
    window.PeiyuGraph = { context: context };
    restore();
    document.addEventListener("peiyu-record", onRecord);
    if (pageProblem) {
      var support = document.createElement("section"); support.id = "graph-problem-support"; support.className = "card graph-support";
      document.querySelector(".answer-box, .answer")?.after(support);
      if (!support.isConnected) document.querySelector(".ladder").before(support);
      var draftInput = document.querySelector("input.ans");
      if (draftInput) draftInput.addEventListener("input", function () {
        if (!current()) return;
        change(keepDraft);
      });
      document.querySelector(".answer")?.addEventListener("click", function (e) {
        if (e.target.closest("[data-letter]") && current()) change(keepDraft);
      });
    }
    document.querySelectorAll("[data-graph-node]").forEach(function (b) { b.addEventListener("click", function () { openNode(b.dataset.graphNode, true); }); });
    document.querySelectorAll("[data-graph-quiz]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault(); var chosen = form.querySelector("input:checked"); if (!chosen) return;
        form.querySelectorAll("[data-graph-feedback]").forEach(function (f) { f.hidden = f.dataset.graphFeedback !== chosen.value; });
        form.querySelector(".graph-quiz-result").dataset.correct = String(chosen.value === form.dataset.correct);
        change(function (r) {
          r.checks = r.checks || {}; var key = form.dataset.graphQuiz;
          var value = { choice: Number(chosen.value), correct: chosen.value === form.dataset.correct, at: now() };
          r.checks[key] = { first: (r.checks[key] || {}).first || value, latest: value };
        }); render();
      });
    });
    document.getElementById("graph-start-guided")?.addEventListener("click", function () { start("guided"); });
    document.getElementById("graph-start-challenge")?.addEventListener("click", function () { start("challenge"); });
    document.getElementById("graph-verify")?.addEventListener("click", verify);
    if (params.get("start") === "challenge" && document.getElementById("knowledge-graph")) { start("challenge"); return; }
    if (params.get("start") === "guided" && document.getElementById("knowledge-graph")) start("guided");
    else if (node(params.get("node")) && document.getElementById("knowledge-graph")) openNode(params.get("node"), false);
    render();
    function sync(e) {
      if (e.type === "storage" && e.key !== STORE && e.key !== null) return;
      if (e.type === "storage" && (e.key === null || e.newValue === null)) temporary = null;
      render();
    }
    window.addEventListener("pageshow", sync); window.addEventListener("storage", sync);
  }
  // 本脚本以defer加载；等app.js的作答控件初始化后再恢复选择，避免只恢复外观而未恢复作答状态。
  if (document.readyState === "complete") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
