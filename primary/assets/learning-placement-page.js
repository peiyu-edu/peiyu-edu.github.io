/* 两段式摸底页（PY-458）：三学段共用，卷的划分在 PeiyuPlacement.stageConfig 里。学生一次选范围，逐份做。作答只在交卷时写入本地账本的 placement 事件，交卷前不显示任何反馈。 */
(function () {
  "use strict";
  var host = document.getElementById("placement-app"), logic = window.PeiyuPlacement, store = window.PeiyuLearningState;
  if (!host || !logic || !store) return;
  var stage = logic.stageConfig(document.body.getAttribute("data-stage")), PAPERS = stage.papers, DRAFT = stage.draftKey, UNIT_SCOPE = !!stage.unitScope, MAP = stage.mapName || "知识图谱";
  var NOTICE = stage.notice ? '<p class="pl-parent" role="note">' + esc(stage.notice) + "</p>" : "";
  var SPEAKER = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm12.5 3a4 4 0 0 0-2-3.5v7a4 4 0 0 0 2-3.5zm-2-7.8v2.1a7 7 0 0 1 0 11.4v2.1a9 9 0 0 0 0-15.6z"/></svg>';
  var papers = {}, files = [], variants = {}, sections = {}, view = { name: "scope" }, draft = null;
  var FEEDBACK_LABEL = { correct: "答对了", wrong: "答错了", "not-yet": "选了我不会" };

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function math(node) { if (window.PeiyuKnowledge && window.PeiyuKnowledge.renderMath) window.PeiyuKnowledge.renderMath(node); }
  function json(path) { return fetch(path, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error(path); return r.json(); }); }
  function readDraft() { try { var d = JSON.parse(sessionStorage.getItem(DRAFT)); if (d && d.answers && !d.book) d.book = "b1"; return d && d.answers ? d : null; } catch (_) { return null; } }
  function saveDraft() { try { if (draft) sessionStorage.setItem(DRAFT, JSON.stringify(draft)); else sessionStorage.removeItem(DRAFT); } catch (_) { /* 这份草稿只为防误刷新。 */ } }
  function attempt(book) { return logic.latestAttempt(store.snapshot(), book); }
  function anyAttempt() { return PAPERS.some(function (p) { return attempt(p.book); }); }
  function paperInfo(book) { return PAPERS.find(function (p) { return p.book === book; }); }
  function inChapters(data, id) { return data.chapters.some(function (ch) { return logic.ownsScope(ch.id, id); }); }
  function secTitle(id) { return sections[id] ? sections[id].name : id; }
  function focusTop() { host.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  function render(html) { host.innerHTML = html; math(host); focusTop(); }
  function storageNote() {
    var s = store.snapshot().storage || {};
    return s.memoryOnly ? '<p class="pl-warn" role="alert">这台设备现在存不下记录，关掉页面后这次结果会丢失。</p>' : "";
  }

  function unitBlock(ch, chosen) {
    return '<label class="pl-check"><input type="checkbox" name="pl-sec" value="' + esc(ch.id) + '"' + (chosen[ch.id] ? " checked" : "") + "><span>" + esc(ch.title) + "</span></label>";
  }
  function bookChapters(chapters, chosen) {
    if (!UNIT_SCOPE) return chapters.map(function (ch) { return chapterBlock(ch, chosen); }).join("");
    var on = chapters.some(function (ch) { return chosen[ch.id]; });
    return '<details class="pl-more"' + (on ? " open" : "") + '><summary>按单元选</summary><div class="pl-sections">' + chapters.map(function (ch) { return unitBlock(ch, chosen); }).join("") + "</div></details>";
  }
  function chapterBlock(ch, chosen) {
    var ids = Object.keys(sections).filter(function (s) { return s.indexOf(ch.id + "-") === 0; });
    var on = ids.filter(function (s) { return chosen[s]; }).length;
    return '<fieldset class="pl-chapter"><legend><label class="pl-check"><input type="checkbox" data-pl-all="' + esc(ch.id) + '"><span>' + esc(ch.title) + "</span></label></legend>" +
      '<details class="pl-more"' + (on && on < ids.length ? " open" : "") + '><summary>按节选</summary><div class="pl-sections">' + ids.map(function (s) {
        return '<label class="pl-check"><input type="checkbox" name="pl-sec" value="' + esc(s) + '"' + (chosen[s] ? " checked" : "") + "><span>" + esc(secTitle(s)) + "</span></label>";
      }).join("") + "</div></details></fieldset>";
  }
  function scopeView() {
    var chosen = {}, saved = anyAttempt();
    // A paper's scope is the whole selection, so only the part inside its own file speaks for that file.
    PAPERS.forEach(function (p) {
      var a = attempt(p.book);
      if (a) a.stage1.scope.forEach(function (s) { if (inChapters(papers[p.book], s)) chosen[s] = true; });
    });
    var groups = PAPERS.map(function (p) {
      return p.groups.map(function (g) {
        var chapters = logic.groupChapters(p, g, papers[p.book]);
        return '<section class="pl-book"><h2><label class="pl-check"><input type="checkbox" data-pl-book="' + esc(g.id) + '"><span>' + esc(g.title) + "</span></label></h2>" +
          bookChapters(chapters, chosen) + "</section>";
      }).join("");
    }).join("");
    var waiting = PAPERS.some(function (p) { return papers[p.book].noPaper; });
    render("<h1>" + esc(stage.name) + '摸底</h1><p class="pl-lead">' + esc(stage.lead || "先选我学到哪了，整册、整章或某几节都行，只测这些内容。每册一份卷，第一段做完交卷才看反馈，不会的题点“我不会”，不用猜。") + "</p>" + NOTICE +
      '<ul class="pl-rules"><li>结果只点亮' + MAP + '，不进错题本，也不进今日复习。</li><li>记录只存在这台设备上。</li>' + (stage.rule ? "<li>" + esc(stage.rule) + "</li>" : "") + (saved ? "<li>这次没勾的册，保留上次的结果。</li>" : "") +
      (waiting ? "<li>有的册摸底题还在准备，这次不出卷；学过就勾上，后面的册回查先修时会用到。</li>" : "") + "</ul>" +
      '<form data-pl-scope>' + groups + '<p class="pl-warn" data-pl-empty hidden role="alert">先勾选至少一' + (UNIT_SCOPE ? "个单元" : "节") + '。</p><p class="pl-warn" data-pl-none hidden role="alert">勾选的' + (UNIT_SCOPE ? "单元" : "节") + "里这次没有摸底题，再多选几" + (UNIT_SCOPE ? "个单元" : "节") + '试试。</p>' +
      '<div class="pl-actions"><button type="submit" class="pl-btn">开始第一段</button>' + (saved ? '<button type="button" class="pl-btn ghost" data-pl-result>看上次结果</button>' : "") + "</div></form>");
    syncAll();
  }
  function syncGroup(box, holder) {
    var items = holder.querySelectorAll('input[name="pl-sec"]'), on = [].filter.call(items, function (i) { return i.checked; }).length;
    box.checked = on === items.length; box.indeterminate = on > 0 && on < items.length;
  }
  function syncAll() {
    [].forEach.call(host.querySelectorAll("[data-pl-all]"), function (box) { syncGroup(box, box.closest("fieldset")); });
    [].forEach.call(host.querySelectorAll("[data-pl-book]"), function (box) { syncGroup(box, box.closest(".pl-book")); });
  }
  /* 低年级题的朗读：data 里有 say 才出按钮，文字原样交给 primary.js 的 say()，有 mp3 放 mp3，没有就用浏览器语音。 */
  function sayButton(text, name) {
    if (!text || !window.PeiyuSay) return "";
    return '<button type="button" class="pl-say" data-pl-say="' + esc(text) + '" aria-label="' + esc(name) + '">' + SPEAKER + "</button>";
  }
  function optionRow(label, say, name) {
    return say ? '<div class="pl-opt-row">' + label + sayButton(say, name) + "</div>" : label;
  }
  function paperView(book, stage, questions, scope, attemptId) {
    draft = draft && draft.book === book && draft.stage === stage && draft.attemptId === attemptId ? draft : { book: book, stage: stage, attemptId: attemptId, scope: scope, answers: {} };
    view = { name: "paper", book: book, stage: stage, questions: questions, scope: scope, attemptId: attemptId };
    saveDraft();
    var head = paperInfo(book).short + " · " + (stage === 1 ? "第一段" : "第二段"), dontKnow = papers[book].dontKnow;
    var lead = stage === 1 ? "交卷后才给反馈。" : "这一段只查没过的章，沿先修往回看一看。";
    render("<h1>" + head + "</h1>" + NOTICE + "<p class=\"pl-lead\">" + lead + "</p><form data-pl-paper>" + questions.map(function (q, i) {
      var v = variants[q.questionId], name = "pl-" + q.questionId, picked = draft.answers[q.questionId], say = q.say;
      var prompt = '<p class="pl-prompt">' + esc(v.prompt) + "</p>";
      return '<fieldset class="pl-q"><legend>第 ' + (i + 1) + " 题</legend>" + (say ? '<div class="pl-opt-row">' + prompt + sayButton(say.prompt, "朗读第 " + (i + 1) + " 题题目") + "</div>" : prompt) + v.options.map(function (o, n) {
        var letter = String.fromCharCode(65 + n);
        return optionRow('<label class="pl-opt"><input type="radio" name="' + esc(name) + '" value="' + esc(o.id) + '"' + (picked === o.id ? " checked" : "") + "><span><b>" + letter + ".</b> " + esc(o.text) + "</span></label>", say && say.options[o.id], "朗读选项 " + letter);
      }).join("") + optionRow('<label class="pl-opt pl-dk"><input type="radio" name="' + esc(name) + '" value="' + esc(dontKnow.id) + '"' + (picked === dontKnow.id ? " checked" : "") + "><span>" + esc(dontKnow.label) + "</span></label>", say && dontKnow.label, "朗读：" + dontKnow.label) + "</fieldset>";
    }).join("") + '<p class="pl-warn" data-pl-missing hidden role="alert"></p><div class="pl-actions"><button type="submit" class="pl-btn">交卷</button><button type="button" class="pl-btn ghost" data-pl-restart>重选范围</button></div></form>');
  }
  function submitPaper() {
    var missing = [];
    view.questions.forEach(function (q, i) { if (!draft.answers[q.questionId]) missing.push(i + 1); });
    if (missing.length) {
      var note = host.querySelector("[data-pl-missing]");
      note.textContent = "第 " + missing.join("、") + " 题还没选。不会的题可以点“我不会”。"; note.hidden = false; note.focus && note.focus();
      return;
    }
    var items = view.questions.map(function (q) {
      var choice = draft.answers[q.questionId];
      return { questionId: q.questionId, pointId: q.pointId, sectionId: q.sectionId, chapterId: q.chapterId, contentVersion: q.contentVersion, choice: choice, response: logic.judge(q, choice, papers[view.book].dontKnow.id) };
    });
    var saved = store.record({ kind: "placement", source: "placement", dedupeKey: view.attemptId + ":" + view.stage,
      placement: { attemptId: view.attemptId, book: view.book, stage: view.stage, scope: view.scope, items: items } });
    if (!saved) { host.querySelector("[data-pl-missing]").textContent = "这份卷子没有存下来，请再交一次。"; host.querySelector("[data-pl-missing]").hidden = false; return; }
    draft = null; saveDraft(); resultView();
  }
  function feedbackList(book, paper) {
    return paper.items.map(function (it, i) {
      var v = variants[it.questionId], q = findQuestion(book, it.questionId);
      if (!v) return "";
      var right = v.options.find(function (o) { return o.id === v.correct; }), mine = v.options.find(function (o) { return o.id === it.choice; });
      return '<details class="pl-fb"><summary><span>第 ' + (i + 1) + " 题 · " + esc(FEEDBACK_LABEL[it.response]) + "</span><small>" + esc(q ? q.tests : "") + "</small></summary>" +
        '<p class="pl-prompt">' + esc(v.prompt) + "</p><p><b>正确答案：</b>" + esc(right.text) + "</p>" + (mine && it.response === "wrong" ? "<p><b>你的选择：</b>" + esc(mine.text) + "</p><p>" + esc(mine.feedback) + "</p>" : "") +
        "<ol>" + (v.reasoning || []).map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ol></details>";
    }).join("");
  }
  function findQuestion(book, id) {
    var hit = null;
    papers[book].chapters.forEach(function (ch) { ch.stage1.concat(ch.stage2).forEach(function (q) { if (q.questionId === id) hit = q; }); });
    return hit;
  }
  function resultRows(results) {
    return '<ul class="pl-results">' + results.map(function (r) {
      return '<li class="pl-row"><span class="pl-name">' + esc(r.title) + '</span><span class="pl-state pl-' + esc(r.state) + '">' + esc(r.label) + (r.provisional ? '<em>' + logic.PROVISIONAL + "</em>" : "") + "</span></li>";
    }).join("") + "</ul>";
  }
  /* 一册一块：已交卷的按卷算；选了还没做的先不下结论，没有卷的按这次选择算出「没学过 / 没测到」。 */
  function bookBlock(p, round, pending) {
    var a = attempt(p.book), waiting = pending.indexOf(p.book) >= 0;
    if (papers[p.book].noPaper) return '<section class="pl-result-book"><h2>' + esc(p.title) + '</h2><p class="pl-note">这一册的摸底题还在准备。</p></section>';
    var body = a ? resultRows(logic.chapterResults(papers[p.book], a.stage1, a.stage2)) : "";
    if (!a && waiting) body = '<p class="pl-note">已选，这份卷还没做。</p>';
    if (!a && !waiting) body = resultRows(logic.chapterResults(papers[p.book], { scope: round ? round.scope : [], items: [] }, null));
    if (a && waiting) body = '<p class="pl-note">这份卷这次还没做，下面是上次的结果。</p>' + body;
    return '<section class="pl-result-book"><h2>' + esc(p.title) + "</h2>" + body + "</section>";
  }
  function nextSteps(pending) {
    var steps = [];
    PAPERS.forEach(function (p) {
      var a = attempt(p.book);
      if (a && !a.stage2 && logic.secondPaper(papers[p.book], a.stage1).length) steps.push('data-pl-second="' + p.book + '">' + esc(p.short) + "第二段");
    });
    pending.forEach(function (book) { steps.push('data-pl-first="' + book + '">' + esc(paperInfo(book).short) + "第一段"); });
    if (!steps.length) return "";
    return '<section class="pl-box"><h2>接着做</h2><p>第二段只查没过的章，沿先修查一查卡在哪里；还没做的册接着做第一段。可以分几次做完。</p><div class="pl-actions">' +
      steps.map(function (s, i) { return '<button type="button" class="pl-btn' + (i ? " ghost" : "") + '" ' + s + "</button>"; }).join("") + "</div></section>";
  }
  function resultView() {
    if (!anyAttempt()) { view = { name: "scope" }; return scopeView(); }
    view = { name: "result" };
    var snap = store.snapshot(), round = logic.currentRound(snap), pending = logic.pendingBooks(snap, files);
    var done = PAPERS.filter(function (p) { return attempt(p.book); });
    var path = logic.repairPath(done.map(function (p) { return attempt(p.book); }), sections);
    render("<h1>摸底结果</h1>" + storageNote() + nextSteps(pending) + PAPERS.map(function (p) { return bookBlock(p, round, pending); }).join("") +
      '<p class="pl-note">“' + logic.PROVISIONAL + "”表示只做过第一段，题少，先当线索看。摸底最多点亮到“基本会了”，要算巩固，还得在练习里隔开时间再答对。</p>" +
      '<section class="pl-box"><h2>先补这里</h2>' + (path.length ? '<ol class="pl-path">' + path.map(function (s) { return '<li><a href="lessons/' + esc(s) + '.html">' + esc(secTitle(s)) + "</a></li>"; }).join("") + "</ol>" : "<p>这次没有要先补的节。</p>") + "</section>" +
      '<div class="pl-actions"><a class="pl-btn" href="wiki.html#tab=map">去' + MAP + '看</a><button type="button" class="pl-btn ghost" data-pl-restart>重新摸底</button></div>' +
      '<section class="pl-box"><h2>逐题反馈</h2>' + done.map(function (p) {
        var a = attempt(p.book);
        return "<h3>" + esc(p.title) + "</h3>" + feedbackList(p.book, a.stage1) + (a.stage2 ? feedbackList(p.book, a.stage2) : "");
      }).join("") + "</section>");
  }
  host.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t.matches("[data-pl-all]")) {
      [].forEach.call(t.closest("fieldset").querySelectorAll('input[name="pl-sec"]'), function (i) { i.checked = t.checked; });
    }
    if (t.matches("[data-pl-book]")) {
      [].forEach.call(t.closest(".pl-book").querySelectorAll('input[name="pl-sec"]'), function (i) { i.checked = t.checked; });
    }
    if (t.name === "pl-sec" || t.matches("[data-pl-all],[data-pl-book]")) syncAll();
    if (view.name === "paper" && t.type === "radio") { draft.answers[t.name.slice(3)] = t.value; saveDraft(); }
  });
  host.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (ev.target.matches("[data-pl-paper]")) return submitPaper();
    var scope = [].filter.call(host.querySelectorAll('input[name="pl-sec"]'), function (i) { return i.checked; }).map(function (i) { return i.value; });
    host.querySelector("[data-pl-empty]").hidden = !!scope.length;
    var first = files.find(function (f) { return logic.firstPaper(f.data, scope).length; });
    host.querySelector("[data-pl-none]").hidden = !scope.length || !!first;
    if (first) paperView(first.book, 1, logic.firstPaper(first.data, scope), scope, logic.paperId("pl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8), first.book));
  });
  host.addEventListener("click", function (ev) {
    var sayIt = ev.target.closest("[data-pl-say]");
    if (sayIt) return window.PeiyuSay.play(sayIt.getAttribute("data-pl-say"), sayIt, { low: true });
    if (ev.target.closest("[data-pl-restart]")) { draft = null; saveDraft(); view = { name: "scope" }; scopeView(); }
    if (ev.target.closest("[data-pl-result]")) resultView();
    var second = ev.target.closest("[data-pl-second]"), next = ev.target.closest("[data-pl-first]");
    if (second) { var book = second.getAttribute("data-pl-second"), a = attempt(book); paperView(book, 2, logic.secondPaper(papers[book], a.stage1), a.stage1.scope, a.attemptId); }
    if (next) {
      var nb = next.getAttribute("data-pl-first"), round = logic.currentRound(store.snapshot());
      paperView(nb, 1, logic.firstPaper(papers[nb], round.scope), round.scope, logic.paperId(round.id, nb));
    }
  });
  store.load();
  var fetched = {};
  function paperFile(p) {
    var name = logic.paperFile(p);
    fetched[name] = fetched[name] || json("data/placement/" + name + ".json");
    return fetched[name].catch(function (err) { if (p.optional) return null; throw err; });
  }
  function chapterTitles(index) {
    var out = {};
    (index ? index.lessons : []).forEach(function (l) { out[l.chapterId] = l.chapterTitle; });
    return out;
  }
  var titlesNeeded = PAPERS.some(function (p) { return p.chapters; });
  Promise.all(PAPERS.map(paperFile).concat([json("data/learning-variants.json"), json(stage.graph || "data/knowledge-graph.json"), titlesNeeded ? json("data/learning-index.json") : null])).then(function (all) {
    var bank = all[PAPERS.length], graph = all[PAPERS.length + 1], titles = chapterTitles(all[PAPERS.length + 2]);
    PAPERS.forEach(function (p, i) { papers[p.book] = logic.paperData(p, all[i], titles); files.push({ book: p.book, data: papers[p.book] }); });
    bank.items.forEach(function (v) { variants[v.id] = v; });
    sections = graph.sections;
    var absent = files.some(function (f) { return f.data.chapters.some(function (ch) { return ch.stage1.concat(ch.stage2).some(function (q) { return !variants[q.questionId]; }); }); });
    if (absent) throw new Error("question missing");
    draft = readDraft();
    if (draft) {
      var d = draft, data = papers[d.book], a = data && attempt(d.book);
      var questions = !data ? [] : d.stage === 1 ? logic.firstPaper(data, d.scope) : a && a.attemptId === d.attemptId ? logic.secondPaper(data, a.stage1) : [];
      if (questions.length) return paperView(d.book, d.stage, questions, d.scope, d.attemptId);
      draft = null; saveDraft();
    }
    return anyAttempt() ? resultView() : scopeView();
  }).catch(function () {
    host.innerHTML = '<p class="pl-warn" role="alert">摸底暂时打不开，请刷新重试。</p>';
  });
})();
