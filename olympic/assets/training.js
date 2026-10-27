/* 按目标训练：独立任务背景、按需补救、证据复盘，复用真题到期日期。 */
(function () {
  "use strict";
  var api, D, base, pd, active = null, bound = null, temporary = null, lastNotice = "";
  var qs = new URLSearchParams(location.search), STORE = "peiyu.olympic.v1";
  function obj(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function date() { return new Date().toISOString(); }
  function meta(id) { return D.problems.find(function (p) { return p.id === id; }); }
  function stage(id) { return D.stages.find(function (s) { return s.id === id; }); }
  function node(id) { return D.foundation.find(function (n) { return n.id === id; }); }
  function events(r, step) {
    return (r.attempts[step] || []).filter(function (a) {
      return a.pid === r.selected[step] && (step !== "review" || !r.reviewStartedAt || Date.parse(a.at) >= Date.parse(r.reviewStartedAt));
    });
  }
  function result(r, step) { var items = events(r, step); return items.length ? items[items.length - 1] : null; }
  function done(r, step) { var a = result(r, step); return !!a && ["ok", "no", "part"].includes(a.result); }
  var CHECKS = { bound: "界的依据是否成立", equality: "取等条件是否完整", feasible: "取等条件是否满足原约束" };
  function ready(r, step) { var check = r.explanations[step]; return done(r, step) && obj(check) && check.pid === r.selected[step]; }
  function valid(r) {
    if (!obj(r) || !/^t[a-z0-9]{8,60}$/.test(r.id) || r.revision !== D.revision ||
      !["guided", "challenge"].includes(r.mode) || ![2, 3].includes(r.maxLevel) ||
      ![...D.stages.map(function (s) { return s.id; }), "review"].includes(r.stage) ||
      ![r.selected, r.attempts, r.help, r.prior, r.background, r.draft, r.usedNodes, r.explanations].every(obj) ||
      !Number.isFinite(Date.parse(r.at))) return false;
    if (!Object.keys(r.selected).every(function (s) {
      var p = meta(r.selected[s]);
      return p && p.lv <= r.maxLevel && (s === "review" ? D.stages.some(function (x) { return r.selected[x.id] === p.id; }) : p.stage === s);
    })) return false;
    if (!meta(r.selected[r.stage]) || typeof r.help[r.stage] !== "boolean" ||
        typeof r.prior[r.stage] !== "boolean" || typeof r.background[r.stage] !== "boolean") return false;
    if (!Object.values(r.attempts).every(function (a) {
      return Array.isArray(a) && a.length <= 30 && a.every(function (v) { return obj(v) && meta(v.pid) && ["ok", "no", "part", "unsure"].includes(v.result); });
    }) || !Object.values(r.usedNodes).every(function (a) { return Array.isArray(a) && a.every(function (id) { return !!node(id); }); })) return false;
    if (!Object.values(r.explanations).every(function (c) { return obj(c) && meta(c.pid) && Array.isArray(c.keys) && c.keys.every(function (k) { return Object.hasOwn(CHECKS, k); }); })) return false;
    if (r.finished && !r.partial && !D.stages.every(function (s) { return ready(r, s.id); })) return false;
    return r.stage !== "review" || !!r.finished;
  }
  function state(data) {
    var root = data.goalTraining, s = obj(root) && root.version === 1 && obj(root.routes) ? root.routes[D.id] : null;
    return { revision: D.revision, runs: obj(s) && s.revision === D.revision && Array.isArray(s.runs) ? s.runs.filter(valid).slice(-15) : [] };
  }
  function live() {
    var r = temporary || state(api.load()).runs.find(function (r) { return r.id === active; });
    if (!r || r.id !== active || (bound && bound !== r.stage) || (pd && pd.id !== r.selected[r.stage])) return null;
    return r;
  }
  function writable(r) { return !!r && (!r.finished || (r.stage === "review" && !r.reviewCompletedAt)); }
  function persist(r) {
    r.at = date();
    if (temporary) { temporary = r; return false; }
    var d = api.load(), s = state(d);
    s.runs = s.runs.filter(function (x) { return x.id !== r.id; }).concat([r]).slice(-15);
    if (!obj(d.goalTraining) || d.goalTraining.version !== 1 || !obj(d.goalTraining.routes)) d.goalTraining = { version: 1, routes: {} };
    d.goalTraining.routes[D.id] = s;
    if (!api.save(d)) { temporary = r; return false; }
    return true;
  }
  function update(fn) { var r = live(); if (!r) { render(); return null; } fn(r); persist(r); return r; }
  function seen(id) { var p = api.load().problems[id]; return obj(p) && Object.keys(p).length > 0; }
  function background() {
    var d = api.load(), g = d.graphStudy, s = d.studyPosition;
    if (obj(s) && s.fr === D.fr && ["example", "checks", "transfer", "practice"].includes(s.step)) return true;
    var graph = obj(g) && (g.version === 1 && D.fr === "FR008" ? g : g.version === 2 && obj(g.graphs) ? g.graphs[D.fr] : null);
    return !!(obj(graph) && obj(graph.exposed) && Object.keys(graph.exposed).some(function (id) { return !!node(id); }));
  }
  function context(id) {
    var r = live();
    if (!writable(r) || r.selected[r.stage] !== id) return null;
    return { source: "goal-training", route: D.id, graph: D.fr, revision: D.revision, run: r.id, step: r.stage,
      mode: r.mode, topicKnown: true, goalKnown: true, previouslySeen: r.prior[r.stage] || events(r, r.stage).length > 0,
      foundationViewed: r.help[r.stage], methodBackground: r.background[r.stage], temporary: !!temporary };
  }
  function url(r, where, n) {
    var path = where === "foundation" ? "g/" + D.fr + ".html" : where === "task" ? "p/" + r.selected[r.stage] + ".html" : "train/" + D.id + ".html";
    var u = new URL(path, base);
    u.searchParams.set("training", D.id); u.searchParams.set("run", r.id); u.searchParams.set("step", r.stage);
    if (where === "task") u.searchParams.set("practice", "1");
    if (n && node(n)) u.searchParams.set("node", n);
    if (temporary && temporary.id === r.id) {
      u.searchParams.set("temp", "1"); u.searchParams.set("rev", D.revision);
      u.searchParams.set("task", r.selected[r.stage]); u.searchParams.set("mode", r.mode); u.searchParams.set("level", r.maxLevel);
      u.searchParams.set("helped", Number(r.help[r.stage])); u.searchParams.set("prior", Number(r.prior[r.stage])); u.searchParams.set("background", Number(r.background[r.stage]));
    }
    return u.href;
  }
  function go(r, where, n) { r.place = where; persist(r); location.href = url(r, where, n); }
  function choose(r, step) {
    var candidates = D.problems.filter(function (p) { return p.stage === step && p.lv <= r.maxLevel; });
    return (candidates.find(function (p) { return !seen(p.id); }) || candidates[0]).id;
  }
  function assign(r, step, pid) {
    r.stage = step; bound = step; r.selected[step] = pid;
    r.help[step] = false; r.prior[step] = seen(pid); r.background[step] = background() || r.mode === "guided";
    r.attempts[step] = r.attempts[step] || []; r.usedNodes[step] = r.usedNodes[step] || [];
    delete r.explanations[step];
  }
  function start(mode) {
    temporary = null;
    var r = { id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10), revision: D.revision,
      mode: mode, maxLevel: document.getElementById("training-advanced")?.checked ? 3 : 2, createdAt: date(), at: date(),
      selected: {}, attempts: {}, help: {}, prior: {}, background: {}, draft: {}, usedNodes: {}, explanations: {}, reflection: "", finished: false };
    assign(r, D.stages[0].id, choose(r, D.stages[0].id)); bound = null; persist(r); render();
    go(r, mode === "guided" ? "foundation" : "task", mode === "guided" ? D.entry_node : null);
  }
  function next() {
    var r = live(); if (!r || !ready(r, r.stage)) return;
    if (r.stage === "review") { r.reviewCompletedAt = date(); go(r, "recap"); return; }
    var i = D.stages.findIndex(function (s) { return s.id === r.stage; });
    if (i + 1 === D.stages.length) {
      r.finished = true; r.completedAt = r.completedAt || date(); go(r, "recap");
    } else {
      var step = D.stages[i + 1].id; assign(r, step, choose(r, step)); go(r, "task");
    }
  }
  function due(r) {
    if (!r.finished || r.partial) return null;
    var ps = api.load().problems;
    return D.stages.map(function (s) {
      var pid = r.selected[s.id], p = ps[pid], at = p && Date.parse(p.reviewDueAt);
      return Number.isFinite(at) && !p.reviewAwaitingSelf ? { pid: pid, at: at } : null;
    }).filter(Boolean).sort(function (a, b) { return a.at - b.at || a.pid.localeCompare(b.pid); })[0] || null;
  }
  function review() {
    var r = live(), d = r && due(r);
    if (!d || d.at > Date.now() || (r.stage === "review" && !r.reviewCompletedAt)) return;
    assign(r, "review", d.pid); r.prior.review = true; r.background.review = true;
    r.reviewStartedAt = date(); r.reviewCompletedAt = null; go(r, "task");
  }
  function keepDraft(r) {
    var input = document.querySelector(".answer input.ans");
    if (input) r.draft[r.stage] = input.value.slice(0, 2000);
    else if (document.querySelector(".answer [data-letter]")) r.draft[r.stage] = {
      type: "choice", letters: Array.from(document.querySelectorAll('.answer [data-letter][aria-pressed="true"]')).map(function (b) { return b.dataset.letter; }) };
  }
  function restoreDraft(r) {
    var d = r.draft[r.stage], input = document.querySelector(".answer input.ans");
    if (input && typeof d === "string") input.value = d.slice(0, 2000);
    else if (obj(d) && d.type === "choice" && Array.isArray(d.letters)) {
      document.querySelectorAll(".answer [data-letter]").forEach(function (b) { if (d.letters.includes(b.dataset.letter) && b.getAttribute("aria-pressed") !== "true") b.click(); });
    }
  }
  function help(id) {
    if (!writable(live())) return;
    var r = update(function (r) {
      r.help[r.stage] = true;
      if (node(id)) r.usedNodes[r.stage] = Array.from(new Set((r.usedNodes[r.stage] || []).concat([id])));
    });
    if (r) api.record(r.selected[r.stage], "view-training-foundation");
  }
  function el(tag, text, cls) { var n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; }
  function link(text, href, id) { var a = el("a", text, "pill"); a.href = href; if (id) a.id = id; return a; }
  function button(text, action, id, cls) { var b = el("button", text, cls || "btn"); b.type = "button"; b.addEventListener("click", action); if (id) b.id = id; return b; }
  function desc(a) {
    if (!a) return "尚未提交";
    var s = { ok: "完成", no: "未做出", part: "部分完成", unsure: "待自评" }[a.result];
    return (a.helped ? "使用帮助" : "本次未用额外帮助") + (a.background ? " · 有相关学习背景" : "") +
      (a.prior ? " · 已接触过此题" : "") + "：" + s + (a.kind === "self" ? "（自评）" : "");
  }
  function evidenceText(r, step) {
    var items = events(r, step).filter(function (a) { return a.result !== "unsure"; });
    return items.length > 1 ? "本轮首次核对：" + desc(items[0]) + "；最近一次：" + desc(items[items.length - 1]) : desc(result(r, step));
  }
  function summary(r) {
    var lines = ["目标训练：" + D.title_text, "目标：" + D.goal, "模式：" + (r.mode === "guided" ? "带练" : "直接挑战")];
    D.stages.forEach(function (s) {
      var p = meta(r.selected[s.id]); lines.push(s.title + "：" + (p ? p.label + "；" + evidenceText(r, s.id) : "尚未安排"));
      if (p && done(r, s.id)) lines.push("  本题用途：" + p.focus);
      var check = r.explanations[s.id];
      if (check) lines.push("  学生自检：" + Object.keys(CHECKS).map(function (k) { return (check.keys.includes(k) ? "已核对：" : "仍有缺口：") + CHECKS[k]; }).join("；"));
      var nodes = (r.usedNodes[s.id] || []).map(function (id) { return node(id).title; });
      if (nodes.length) lines.push("  补过：" + nodes.join("、"));
    });
    var d = due(r);
    lines.push("下一步：" + (r.finished ? d ? "按已有复习安排于 " + new Date(d.at).toLocaleString("zh-CN") + " 后重做 " + meta(d.pid).label : "查看今日练习" : "继续当前任务"));
    if (r.attempts.review?.length) lines.push("延后重做：" + desc(result(r, "review")));
    if (r.reflection) lines.push("我的提醒：" + r.reflection);
    if (r.partial || temporary) lines.push("当前为浏览器临时记录，刷新后可能丢失。");
    lines.push("小结里分别列出了用过的帮助、自评和重做。");
    return lines.join("\n");
  }
  function copy(r, box) {
    var text = summary(r);
    function fallback() { var ta = el("textarea"); ta.rows = 10; ta.value = text; ta.setAttribute("aria-label", "本次训练小结"); box.append(ta); ta.select(); }
    var status = el("p", "", "hint-text"); status.setAttribute("role", "status"); box.append(status);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(function () { status.textContent = "已复制本次训练小结。"; }, function () { fallback(); status.textContent = "请手动复制下面的小结。"; });
    else { fallback(); status.textContent = "请手动复制下面的小结。"; }
  }
  function recap(box, r) {
    box.replaceChildren(); box.hidden = false;
    box.append(el("h2", r.finished && !r.partial && !temporary ? "本次训练复盘" : "当前训练小结"));
    var list = el("ol", undefined, "training-evidence");
    D.stages.forEach(function (s) {
      var li = el("li"), p = meta(r.selected[s.id]); li.append(el("h3", s.title));
      if (p) { li.append(link(p.label, new URL("p/" + p.id + ".html?practice=1", base).href)); li.append(el("p", evidenceText(r, s.id))); }
      else li.append(el("p", "尚未安排"));
      if (p && done(r, s.id)) li.append(el("p", p.focus, "hint-text"));
      var check = r.explanations[s.id];
      if (check) li.append(el("p", "学生自检：" + Object.keys(CHECKS).map(function (k) { return (check.keys.includes(k) ? "已核对：" : "仍有缺口：") + CHECKS[k]; }).join("；"), "hint-text"));
      var ns = (r.usedNodes[s.id] || []).map(function (id) { return node(id).title; });
      if (ns.length) li.append(el("p", "补过：" + ns.join("、"), "hint-text"));
      list.append(li);
    }); box.append(list);
    if (r.attempts.review?.length) box.append(el("p", "延后重做：" + desc(result(r, "review"))));
    var label = el("label", "下次我先检查什么？（可选）"), input = el("textarea");
    input.id = "training-reflection"; input.maxLength = 600; input.rows = 3; input.value = typeof r.reflection === "string" ? r.reflection : "";
    label.htmlFor = input.id; input.addEventListener("change", function () { update(function (r) { r.reflection = input.value.slice(0, 600); }); }); box.append(label, input);
    box.append(button("复制本次训练小结", function () { var current = live(); if (current) copy(current, box); }, "training-copy", "btn ghost"));
    var d = due(r);
    if (r.stage === "review" && !r.reviewCompletedAt) {
      box.append(link("继续当前重做", url(r, "task"), "training-resume-review"));
    } else if (r.finished && d) {
      box.append(el("h3", "下一次：延后重做"));
      box.append(el("p", meta(d.pid).label + "，到期时间：" + new Date(d.at).toLocaleString("zh-CN") + "。沿用该题已有的复习日期，这是重做，不是陌生新题。", "hint-text"));
      var b = button("开始到期重做", review, "training-review"); b.disabled = d.at > Date.now(); box.append(b);
    } else if (!r.finished) box.append(link("继续当前任务", url(r, "task"), "training-resume-task"));
    box.append(link("查看今日练习", new URL("today.html", base).href));
    box.append(el("p", "小结里保留了自评、用过的帮助和重做记录；完整记录可在「我的学习」下载。", "hint-text"));
  }
  function renderTask(r) {
    var box = document.getElementById("training-task"); if (!box) return;
    box.replaceChildren();
    if (!r) {
      var details = el("details"), sm = el("summary", active ? "这条目标训练已清除或失效" : "按目标训练（会提示目标）");
      details.append(sm, link("去目标训练：" + D.title_text, new URL("train/" + D.id + ".html", base).href)); box.append(details);
      document.body.classList.remove("training-active"); return;
    }
    document.body.classList.add("training-active");
    if (!writable(r)) {
      box.append(el("h2", "本轮已核对并保存"), link("查看训练复盘", url(r, "recap")));
      return;
    }
    var s = stage(r.stage); box.append(el("h2", r.stage === "review" ? "延后重做" : s.title));
    box.append(el("p", "本次目标：" + D.goal));
    box.append(el("p", (r.prior[r.stage] ? "这道题已有接触记录。" : "这道题尚无站内接触记录。") + "目标已知，先自己判断方法。", "hint-text"));
    var detail = el("details"), sm = el("summary", "卡住了，补一块基础（会提供方向）"); detail.append(sm);
    var row = el("div", undefined, "row");
    meta(pd.id).nodes.forEach(function (id) {
      row.append(button(node(id).title, function () {
        var current = update(keepDraft); if (!current) return; help(id);
        go(live(), "foundation", id);
      }, undefined, "pill"));
    }); detail.append(row);
    detail.addEventListener("toggle", function () { if (detail.open) help(); }); box.append(detail);
    box.append(el("p", evidenceText(r, r.stage), "hint-text"));
    if (lastNotice) box.append(el("p", lastNotice, "hint-text"), link("重新打开当前题作答", url(r, "task"), "training-retry"));
    if (done(r, r.stage)) {
      var form = el("form", undefined, "training-explanation"), fs = el("fieldset");
      fs.append(el("legend", "除了答案，再对照下面三步检查自己的过程"));
      Object.keys(CHECKS).forEach(function (key) {
        var lab = el("label"), input = el("input"); input.type = "checkbox"; input.value = key;
        input.checked = !!r.explanations[r.stage]?.keys.includes(key); lab.append(input, document.createTextNode(" 我已检查" + CHECKS[key])); fs.append(lab);
      });
      var save = el("button", "记下自检（有缺口也可继续）", "btn ghost"); save.type = "submit"; save.id = "training-save-check";
      form.append(fs, save); form.addEventListener("submit", function (e) {
        e.preventDefault(); var keys = Array.from(form.querySelectorAll("input:checked")).map(function (n) { return n.value; });
        update(function (r) { r.explanations[r.stage] = { pid: r.selected[r.stage], keys: keys, at: date() }; }); render();
      }); box.append(form);
    }
    var b = button(r.stage === "transfer" || r.stage === "review" ? "查看训练复盘" : "核对完了，继续下一题", next, "training-next");
    b.disabled = !ready(r, r.stage); box.append(b, link("查看当前训练小结", url(r, "recap"), "training-open-recap"));
  }
  function renderFoundation(r) {
    var box = document.getElementById("training-foundation"); if (!box) return;
    box.replaceChildren(); box.hidden = !r;
    if (!r) { document.body.classList.remove("training-foundation-active"); return; }
    document.body.classList.add("training-foundation-active");
    box.append(el("p", "正在为「" + D.title_text + "」补基础：" + meta(r.selected[r.stage]).label));
    box.append(link("返回当前训练题", url(r, "task"), "training-return"));
  }
  function recent(data) {
    return state(data).runs.filter(function (r) { return !r.finished || (r.stage === "review" && !r.reviewCompletedAt); })
      .map(function (r) {
        return { at: r.at, fr: D.fr, href: url(r, r.place === "foundation" ? "foundation" : "task"),
          text: D.title_text + " · " + (r.stage === "review" ? "延后重做" : "第 " + (D.stages.findIndex(function (s) { return s.id === r.stage; }) + 1) + " / " + D.stages.length + " 题") };
      });
  }
  function renderHistory() {
    var runs = state(api.load()).runs.slice().sort(function (a, b) { return b.at.localeCompare(a.at); });
    ["training-history", "training-record", "training-today"].forEach(function (id) {
      var box = document.getElementById(id); if (!box) return;
      box.replaceChildren(); box.hidden = !runs.length;
      runs.slice(0, id === "training-record" ? 8 : 1).forEach(function (r) {
        var article = el("article"); article.append(el("h3", D.title_text + " · " + new Date(r.at).toLocaleDateString("zh-CN")));
        var d = due(r), action = r.finished ? "查看复盘" : "继续目标训练";
        if (r.finished && d && d.at <= Date.now()) action = "有任务到期，查看复盘并重做";
        article.append(link(action, url(r, r.finished ? "recap" : r.place === "foundation" ? "foundation" : "task")));
        if (id === "training-record") article.append(el("p", "已完成 " + D.stages.filter(function (s) { return done(r, s.id); }).length + "/4 个任务的核对。", "hint-text"));
        box.append(article);
      });
    });
  }
  function render() {
    var r = live(), box = document.getElementById("training-current");
    if (box) {
      box.replaceChildren(); box.hidden = !active;
      if (active && !r) box.append(el("p", "这条训练已清除、内容已更新或阶段不匹配。可以从上方重新开始。"));
      else if (r) {
        box.append(el("h2", r.partial || temporary ? "临时训练记录" : r.finished ? "已完成四个任务的核对" : "当前任务：" + (stage(r.stage)?.title || "延后重做")));
        box.append(el("p", meta(r.selected[r.stage]).label));
        if (!r.finished || (r.stage === "review" && !r.reviewCompletedAt)) box.append(link("回到当前题继续", url(r, "task"), "training-continue"));
        if (r.partial) box.append(el("p", "当前为临时记录，仅保留本页刚做的内容。", "hint-text"));
      }
    }
    var rc = document.getElementById("training-recap");
    if (rc) { rc.hidden = !r; if (r) recap(rc, r); }
    renderTask(r); renderFoundation(r); renderHistory();
    var msg = document.getElementById("training-save-message");
    if (msg) msg.textContent = temporary ? "当前无法保存训练。仍可继续当前题或返回；离开或刷新可能丢失本页记录。" : r ? "训练路线、草稿和练习记录保存在本机。" : "";
  }
  function record(event) {
    var r = live(), e = event.detail; if (!writable(r) || e.id !== r.selected[r.stage]) return;
    if (e.kind === "attempt" || e.kind === "self") {
      var c = e.training;
      if (!c || c.route !== D.id || c.run !== r.id || c.step !== r.stage) {
        lastNotice = "这次核对属于先前的提交，未计入本轮。重新打开当前题再作答，可记录本轮训练。"; render(); return;
      }
      update(function (r) {
        var a = r.attempts[r.stage] || [];
        a.push({ pid: e.id, result: e.result || "unsure", kind: e.kind, at: date(),
          helped: !!c.foundationViewed, prior: !!c.previouslySeen, background: !!c.methodBackground });
        r.attempts[r.stage] = a.slice(-30);
        delete r.explanations[r.stage];
      }); lastNotice = ""; render();
    } else if (e.kind !== "view-training-background" && (e.kind.startsWith("view-") || e.kind === "reveal-link" || e.kind === "compare")) {
      update(function (r) { r.help[r.stage] = true; });
    }
  }
  function init() {
    var raw = document.getElementById("training-data"); api = window.PeiyuOlympic; if (!raw || !api) return;
    D = JSON.parse(raw.textContent);
    var script = Array.from(document.scripts).find(function (s) { return /\/training\.js(?:\?|$)/.test(s.src); });
    base = new URL("../", script.src); var data = document.getElementById("pdata"); pd = data ? JSON.parse(data.textContent) : null;
    active = qs.get("training") === D.id && /^t[a-z0-9]{8,60}$/.test(qs.get("run") || "") ? qs.get("run") : null;
    bound = qs.get("step");
    var temporaryTask = meta(qs.get("task"));
    if (active && !state(api.load()).runs.some(function (r) { return r.id === active; }) && qs.get("temp") === "1" && qs.get("rev") === D.revision && temporaryTask &&
        ["helped", "prior", "background"].every(function (k) { return ["0", "1"].includes(qs.get(k)); }) &&
        (bound === "review" || (stage(bound) && temporaryTask.stage === bound))) {
      var temp = { id: active, revision: D.revision, stage: bound, mode: qs.get("mode"), maxLevel: Number(qs.get("level")),
        at: date(), createdAt: date(), selected: {}, attempts: {}, help: {}, prior: {}, background: {}, draft: {}, usedNodes: {}, explanations: {}, partial: true, finished: false };
      if (bound === "review") { temp.finished = true; temp.selected[temporaryTask.stage] = temporaryTask.id; }
      assign(temp, bound, temporaryTask.id); temp.help[bound] = qs.get("helped") === "1"; temp.prior[bound] = qs.get("prior") === "1"; temp.background[bound] = qs.get("background") === "1";
      if (valid(temp)) temporary = temp;
    }
    window.PeiyuTraining = { context: context, recent: recent };
    document.addEventListener("peiyu-record", record);
    if (pd && meta(pd.id)) {
      var taskBox = el("section", undefined, "card"); taskBox.id = "training-task"; document.querySelector(".answer").after(taskBox);
      var r = live(); if (writable(r)) { restoreDraft(r); update(function (r) { r.place = "task"; }); }
      document.querySelector(".answer input.ans")?.addEventListener("input", function () { if (writable(live())) update(keepDraft); });
      document.querySelector(".answer")?.addEventListener("click", function (e) { if (e.target.closest("[data-letter]") && writable(live())) update(keepDraft); });
      // 延后重做本就有学习背景；不把过去学过误记为本次又看了提示，否则会重置原复习阶梯。
      if (writable(r) && r.stage !== "review" && r.background[r.stage]) api.record(pd.id, "view-training-background");
    }
    var graph = document.getElementById("knowledge-graph");
    if (graph) {
      var fb = el("nav", undefined, "graph-flow-actions training-foundation-actions"); fb.id = "training-foundation"; graph.append(fb);
      if (live()) help(qs.get("node"));
      graph.addEventListener("click", function (e) { var b = e.target.closest("[data-graph-node]"); if (b && live()) help(b.dataset.graphNode); });
    }
    document.getElementById("training-guided")?.addEventListener("click", function () { start("guided"); });
    document.getElementById("training-challenge")?.addEventListener("click", function () { start("challenge"); });
    window.addEventListener("pageshow", render);
    window.addEventListener("storage", function (e) {
      if (e.key !== STORE && e.key !== null) return;
      if (e.key === null || e.newValue === null) temporary = null;
      render();
    });
    var startMode = qs.get("start");
    if (document.getElementById("goal-training") && ["guided", "challenge"].includes(startMode)) {
      qs.delete("start");
      var clean = new URL(location.href);
      clean.search = qs.toString();
      try {
        history.replaceState(null, "", clean.href);
        if (document.readyState !== "complete") history.pushState(null, "", clean.href);
      } catch (e) {}
      start(startMode);
      return;
    }
    render();
  }
  if (document.readyState === "complete") init(); else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
