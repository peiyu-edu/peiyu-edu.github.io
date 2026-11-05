/* Two-stage placement logic (PY-458). Pure functions over the question selection and ledger papers.
   The map state is derived here on every read; nothing about a chapter is stored. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PeiyuPlacement = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  // The highest state a placement can reach is 基本会了; 巩固 stays with the two-answers, 20-hours rule elsewhere.
  var LABELS = { basic: "基本会了", rusty: "有点生疏", "not-yet": "测了不会", "not-learned": "没学过", untested: "这次没测到" };
  var PROVISIONAL = "初步";
  // One entry per paper. A student's scope spans them; each paper goes to the ledger under its own `book`.
  var PAPERS = [
    { book: "b1", title: "必修第一册", short: "必修一", groups: [{ id: "b1", title: "必修第一册" }] },
    { book: "b2", title: "必修第二册", short: "必修二", groups: [{ id: "b2", title: "必修第二册" }] },
    { book: "e", title: "选择性必修", short: "选择性必修", groups: [{ id: "e1", title: "选择性必修第一册" }, { id: "e2", title: "选择性必修第二册" }, { id: "e3", title: "选择性必修第三册" }] }
  ];
  function chapterIds(from, to) { var out = []; for (var n = from; n <= to; n++) out.push("j" + n); return out; }
  // A junior grade file holds two books, and each book is its own paper of at most 15 questions (README-g8, README-g9).
  function juniorPaper(book, file, title, short, from, to, optional) {
    return { book: book, file: file, optional: !!optional, title: title, short: short, groups: [{ id: book, title: title }], chapters: chapterIds(from, to) };
  }
  // A primary grade file holds several fixed sessions; `session` names one, and its position among the book's sessions.
  function primaryPaper(ledger, file, book, part, title, short) {
    return { book: ledger, file: file, session: { book: book, part: part }, title: title, short: short, groups: [{ id: ledger, title: title }] };
  }
  var STAGES = {
    high: { name: "高中", draftKey: "peiyu.hs.placement.draft.v1", papers: PAPERS },
    junior: { name: "初中", draftKey: "peiyu.jr.placement.draft.v1", papers: [
      juniorPaper("jb1", "g7", "七年级上册", "七上", 1, 6, true),
      juniorPaper("jb2", "g7", "七年级下册", "七下", 7, 12, true),
      juniorPaper("jb3", "g8", "八年级上册", "八上", 13, 18),
      juniorPaper("jb4", "g8", "八年级下册", "八下", 19, 24),
      juniorPaper("jb5", "g9", "九年级上册", "九上", 25, 30),
      juniorPaper("jb6", "g9", "九年级下册", "九下", 31, 34)
    ] },
    // 364 lessons would overflow the ledger's 100-entry scope, so a primary selection is by unit (69 at most).
    primary: { name: "小学", draftKey: "peiyu.ps.placement.draft.v1", unitScope: true, say: true, graph: "data/wiki.json", mapName: "单元地图",
      lead: "先选学到哪个单元了，整册或某几个单元都行，只测这些内容。每册一份卷，每次不超过 15 题，第一段做完交卷才看反馈，不会的题点“我不会”，不用猜。",
      notice: "建议家长陪着孩子做。可以帮孩子读题、点“听”，但不要提示答案；孩子不会就选“我不会”。",
      rule: "前面年级学过的单元也勾上，第二段才能往回查先修。",
      papers: [
      primaryPaper("p1a", "g1-3", "p1a", 0, "一年级上册", "一上"), primaryPaper("p1b", "g1-3", "p1b", 0, "一年级下册", "一下"),
      primaryPaper("p2a", "g1-3", "p2a", 0, "二年级上册", "二上"), primaryPaper("p2b", "g1-3", "p2b", 0, "二年级下册", "二下"),
      primaryPaper("p3a", "g1-3", "p3a", 0, "三年级上册", "三上"), primaryPaper("p3b", "g1-3", "p3b", 0, "三年级下册", "三下"),
      primaryPaper("p4a", "g4-6", "p4a", 0, "四年级上册", "四上"),
      primaryPaper("p4b", "g4-6", "p4b", 0, "四年级下册（第一卷）", "四下一卷"), primaryPaper("p4b-2", "g4-6", "p4b", 1, "四年级下册（第二卷）", "四下二卷"),
      primaryPaper("p5a", "g4-6", "p5a", 0, "五年级上册", "五上"), primaryPaper("p5b", "g4-6", "p5b", 0, "五年级下册", "五下"),
      primaryPaper("p6a", "g4-6", "p6a", 0, "六年级上册", "六上"), primaryPaper("p6b", "g4-6", "p6b", 0, "六年级下册", "六下")
    ] }
  };
  function stageConfig(stage) { return STAGES[stage] || STAGES.high; }
  function paperFile(paper) { return paper.file || paper.book; }
  /* The selection for one paper. Without a file (optional, not published yet) its chapters stay selectable, because
     rechecks from later books walk into them, but it has no questions. titles: {chapterId: title}. */
  function paperData(paper, file, titles) {
    if (paper.session) return sessionData(paper.session, file);
    if (!paper.chapters) return file;
    var own = Object.create(null);
    (file ? file.chapters : []).forEach(function (ch) { own[ch.id] = ch; });
    return Object.assign({}, file, { noPaper: !file, chapters: paper.chapters.map(function (id) {
      return own[id] || { id: id, title: (titles && titles[id]) || id, stage1: [], stage2: [] };
    }) });
  }
  function sessionData(session, file) {
    var fixed = file.sessions.filter(function (s) { return s.book === session.book; })[session.part];
    var own = Object.create(null);
    file.chapters.forEach(function (ch) { own[ch.id] = ch; });
    return Object.assign({}, file, { maxQuestions: fixed.maxQuestions, chapters: fixed.chapterIds.map(function (id) { return own[id]; }) });
  }
  function groupChapters(paper, group, data) {
    return paper.chapters || paper.session ? data.chapters : data.chapters.filter(function (ch) { return ch.id.indexOf(group.id + "-") === 0; });
  }
  function scopeSet(scope) { var set = Object.create(null); (scope || []).forEach(function (s) { set[s] = true; }); return set; }
  /* A scope entry is a section, or on primary a whole unit: p3a-u2 covers p3a-u2-5. */
  function inScope(set, section) {
    var unit = /^(p[1-6][ab]-u\d+)-/.exec(section || "");
    return !!(set[section] || (unit && set[unit[1]]));
  }
  function ownsScope(chapterId, entry) { return entry === chapterId || entry.indexOf(chapterId + "-") === 0; }

  function firstPaper(data, scope) {
    var set = scopeSet(scope), out = [];
    data.chapters.forEach(function (ch) {
      ch.stage1.forEach(function (q) { if (inScope(set, q.sectionId)) out.push(Object.assign({ chapterId: ch.id }, q)); });
    });
    return out;
  }
  // Second-stage rechecks walk a prerequisite edge, so both ends must be content the student has reached.
  function secondPaper(data, stage1) {
    var set = scopeSet(stage1.scope), seen = Object.create(null), open = chapterResults(data, stage1, null).filter(function (c) { return c.state === "rusty" || c.state === "not-yet"; });
    stage1.items.forEach(function (it) { seen[it.questionId] = true; });
    var lists = open.map(function (result) {
      var ch = data.chapters.find(function (c) { return c.id === result.id; }), own = [];
      ch.stage2.forEach(function (q) {
        if (!inScope(set, q.fromSection) || !inScope(set, q.recheckSection) || seen[q.questionId]) return;
        seen[q.questionId] = true; own.push(Object.assign({ chapterId: ch.id }, q));
      });
      return own;
    });
    return data.maxQuestions ? takeTurns(lists, data.maxQuestions) : [].concat.apply([], lists);
  }
  // A capped paper deals one question per chapter in turn, so every open chapter is rechecked before any gets a second.
  function takeTurns(lists, limit) {
    var out = [], longest = Math.max.apply(null, [0].concat(lists.map(function (l) { return l.length; })));
    for (var i = 0; i < longest; i++) lists.forEach(function (l) { if (l[i] && out.length < limit) out.push(l[i]); });
    return out;
  }
  function judge(question, choice, dontKnowId) {
    if (!choice || choice === dontKnowId) return "not-yet";
    return choice === question.correct ? "correct" : "wrong";
  }
  function count(items, chapterId) {
    var own = items.filter(function (it) { return it.chapterId === chapterId; });
    return { total: own.length, right: own.filter(function (it) { return it.response === "correct"; }).length };
  }
  function stateFor(first, second) {
    if (!second || !second.total) return first.right === first.total ? "basic" : first.right ? "rusty" : "not-yet";
    var right = first.right + second.right, total = first.total + second.total;
    // One slip across both papers still reads as 基本会了, but the chapter's own paper must have shown something.
    if (first.right && right >= total - 1) return "basic";
    if (!first.right && second.right * 2 < second.total) return "not-yet";
    return "rusty";
  }
  /* -> [{id,title,state,label,provisional}] in chapter order. stage2 may be null. */
  function chapterResults(data, stage1, stage2) {
    var set = scopeSet(stage1.scope);
    return data.chapters.map(function (ch) {
      var state, first = count(stage1.items, ch.id), second = stage2 ? count(stage2.items, ch.id) : null;
      var learned = Object.keys(set).some(function (s) { return ownsScope(ch.id, s); });
      if (!learned) state = "not-learned";
      else if (!first.total) state = "untested";
      else state = stateFor(first, second);
      var settled = !!(second && second.total) || state === "not-learned" || state === "untested";
      return { id: ch.id, title: ch.title, state: state, label: LABELS[state], provisional: !settled };
    });
  }
  /* Latest attempt in a snapshot: {stage1, stage2, time}, or null. Only submitted papers exist in the ledger. */
  function latestAttempt(snapshot, book) {
    var byAttempt = Object.create(null), last = null;
    (snapshot && snapshot.placements || []).forEach(function (e) {
      var p = e.placement;
      if (!p || p.book !== book) return;
      var a = byAttempt[p.attemptId] || (byAttempt[p.attemptId] = { attemptId: p.attemptId, stage1: null, stage2: null, time: 0 });
      a[p.stage === 1 ? "stage1" : "stage2"] = p;
      a.time = Math.max(a.time, e.time);
      if (a.stage1 && (!last || a.time >= last.time)) last = a;
    });
    return last;
  }
  /* One selection is one round, and one round has one paper per file. Rounds exist only inside attempt ids, so the
     ledger format stays as it was. Each paper keeps the whole selection as its scope: rechecks cross into other books. */
  function paperId(round, book) { return round + "-" + book; }
  function roundOf(attemptId, book) {
    var tail = "-" + book;
    return attemptId.slice(-tail.length) === tail ? attemptId.slice(0, -tail.length) : attemptId;
  }
  /* The newest selection: {id, scope}, or null. Stage 2 of an older round does not count as a new selection. */
  function currentRound(snapshot) {
    var last = null;
    (snapshot && snapshot.placements || []).forEach(function (e) {
      var p = e.placement;
      if (p && p.stage === 1 && (!last || e.time >= last.time)) last = { id: roundOf(p.attemptId, p.book), scope: p.scope, time: e.time };
    });
    return last && { id: last.id, scope: last.scope };
  }
  /* files: [{book, data}]. Books the newest selection reaches whose first paper has not been handed in yet. */
  function pendingBooks(snapshot, files) {
    var round = currentRound(snapshot);
    if (!round) return [];
    return files.filter(function (f) {
      var done = latestAttempt(snapshot, f.book);
      return firstPaper(f.data, round.scope).length && !(done && roundOf(done.attemptId, f.book) === round.id);
    }).map(function (f) { return f.book; });
  }
  /* 先补这里 for one attempt or several: missed sections, every prerequisite before what depends on it, then course order. */
  function repairPath(attempts, sections, limit) {
    var missed = Object.create(null), order = Object.keys(sections);
    [].concat(attempts).forEach(function (attempt) {
      [attempt.stage1, attempt.stage2].forEach(function (paper) {
        if (paper) paper.items.forEach(function (it) { if (it.response !== "correct") missed[it.sectionId] = true; });
      });
    });
    var ids = order.filter(function (s) { return missed[s]; }), done = Object.create(null), out = [];
    function visit(id, seen) {
      if (done[id] || seen[id] || !sections[id]) return;
      seen[id] = true;
      (sections[id].prereqs || []).forEach(function (p) { visit(p, seen); });
      if (missed[id]) { done[id] = true; out.push(id); }
    }
    ids.forEach(function (id) { visit(id, Object.create(null)); });
    return out.slice(0, limit || 4);
  }
  /* Section -> chapter result for the map. Only sections the student marked as reached; 没学过/没测到 stay unlit. */
  function mapStates(results, attempt) {
    var out = Object.create(null);
    results.forEach(function (r) {
      if (r.state !== "basic" && r.state !== "rusty" && r.state !== "not-yet") return;
      attempt.stage1.scope.forEach(function (s) { if (ownsScope(r.id, s)) out[s] = r; });
    });
    return out;
  }
  /* The map overlay across files: {books:[{book,title,results}], sections}. Books never attempted are left out. */
  function overlay(snapshot, files) {
    var out = { books: [], sections: Object.create(null) };
    files.forEach(function (f) {
      var attempt = latestAttempt(snapshot, f.book);
      if (!attempt) return;
      var results = chapterResults(f.data, attempt.stage1, attempt.stage2), lit = mapStates(results, attempt);
      out.books.push({ book: f.book, title: f.title, results: results });
      Object.keys(lit).forEach(function (s) { out.sections[s] = lit[s]; });
    });
    return out;
  }
  return { LABELS: LABELS, PROVISIONAL: PROVISIONAL, PAPERS: PAPERS, stageConfig: stageConfig, paperFile: paperFile, paperData: paperData, groupChapters: groupChapters, ownsScope: ownsScope, paperId: paperId, roundOf: roundOf, currentRound: currentRound,
    pendingBooks: pendingBooks, overlay: overlay, firstPaper: firstPaper, secondPaper: secondPaper, judge: judge,
    chapterResults: chapterResults, latestAttempt: latestAttempt, repairPath: repairPath, mapStates: mapStates };
});
