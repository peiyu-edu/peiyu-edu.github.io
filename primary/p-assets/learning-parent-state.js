/* Local learning evidence. Never writes legacy keys or infers mastery from a view/answer. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.document) { root.PeiyuLearningStateAPI = api; return;
    var storage;
    try { storage = root.localStorage; } catch (_) { storage = null; }
    // 学段：初中页（body data-stage="junior" 或 data-sec 为 j<章>-<节>）、小学页（data-stage="primary" 或 p[1-6][ab]-…）的证据单独存，不混进高中记录
    var body = root.document.body, junior = !!body && (body.getAttribute("data-stage") === "junior" || /^j(?:\d+-\d+|[789][ab]-p\d+)$/.test(body.getAttribute("data-sec") || ""));
    var primary = !!body && (body.getAttribute("data-stage") === "primary" || /^p[1-6][ab]-/.test(body.getAttribute("data-sec") || ""));
    var stage = primary ? "primary" : (junior ? "junior" : "high");
    root.PeiyuLearningState = api.createStore({ storage: storage, eventTarget: root, stage: stage });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var KEY = "peiyu.hs.learning.v1", DAY = 86400000;
  var KINDS = ["view", "answer", "feedback", "resume", "self-rating", "review"];
  var TYPES = ["diagnostic", "predict", "exam", "card", "lab", "cue"];
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function dict() { return Object.create(null); }
  function str(v, max) { return typeof v === "string" && v.length <= (max || 200) ? v : null; }
  function time(v) { return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0; }
  function copy(v) { return JSON.parse(JSON.stringify(v)); }
  function canonical(value) {
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    if (obj(value)) return "{" + Object.keys(value).sort().map(function (k) { return JSON.stringify(k) + ":" + canonical(value[k]); }).join(",") + "}";
    return JSON.stringify(value);
  }
  function stableChoice(a, b) { return canonical(a) <= canonical(b) ? a : b; }
  function hash(v) {
    var text = typeof v === "string" ? v : JSON.stringify(v), a = 2166136261, b = 3339675911;
    for (var i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b ^ text.charCodeAt(i), 2246822519); }
    return (a >>> 0).toString(36) + "-" + (b >>> 0).toString(36);
  }
  function identifiers(input) {
    var pointId = str(input.pointId), sectionId = str(input.sectionId);
    var questionType = TYPES.indexOf(input.questionType) >= 0 ? input.questionType : (pointId ? "diagnostic" : "predict");
    var questionId = str(input.questionId), contentVersion = str(input.contentVersion);
    var owner = questionType === "diagnostic" ? pointId : questionType === "card" ? "global" : sectionId;
    var base = JSON.stringify([questionType, owner || "", questionId || ""]);
    return { pointId: pointId, sectionId: sectionId, questionId: questionId, questionType: questionType,
      contentVersion: contentVersion, base: base, identity: questionId ? JSON.stringify([questionType, owner || "", questionId, contentVersion || "?"]) : null };
  }
  // identity is JSON [questionType, owner, questionId, contentVersion]; anything else is not a question identity.
  function identityParts(identity) {
    var parts; try { parts = JSON.parse(identity); } catch (err) { return null; }
    return Array.isArray(parts) && parts.length === 4 && parts.every(function (p) { return typeof p === "string"; }) && TYPES.indexOf(parts[0]) >= 0 && parts[2] ? parts : null;
  }
  function normalize(input, now, legacy) {
    if (!obj(input) || KINDS.indexOf(input.kind) < 0) return null;
    var ids = identifiers(input), t = time(input.time === undefined ? now : input.time);
    if ((input.kind === "answer" || input.kind === "feedback") && !ids.questionId) return null;
    if (input.kind === "answer" && !legacy && typeof input.correct !== "boolean") return null;
    var rating = { "need-help": "no", "practice-more": "fuzzy", "can-explain": "know" }[input.rating] || input.rating;
    var e = Object.assign(ids, { kind: input.kind, source: str(input.source, 80) || "unknown", time: t,
      choice: str(input.choice, 300), correct: typeof input.correct === "boolean" ? input.correct : null,
      feedbackSeen: input.feedbackSeen === true, step: Number.isInteger(input.step) && input.step >= 1 && input.step <= 5 ? input.step : null,
      rating: ["know", "fuzzy", "no"].indexOf(rating) >= 0 ? rating : null,
      legacy: !!legacy, independent: legacy ? null : false, attemptKind: null });
    if (input.kind === "self-rating" && !e.rating) return null;
    if (input.kind !== "answer") e.correct = null;
    // Explicit ids are scoped to an identity. The default also deduplicates duplicate listeners.
    e.id = (legacy ? "legacy:" : "native:") + hash(input.dedupeKey ? [ids.identity, input.kind, String(input.dedupeKey)] :
      [e.kind, e.identity, e.sectionId, e.pointId, e.choice, e.correct, e.feedbackSeen, e.step, e.rating, e.time]);
    return e;
  }
  function blank() { return { version: 1, events: [], questions: dict(), marks: dict(), guards: dict(), resume: null, historyIncomplete: false, compacted: false }; }
  function earlier(a, b) { if (!a) return b; if (!b) return a; if (a.time === b.time && a.id === b.id) return stableChoice(a, b); return a.time < b.time || (a.time === b.time && a.id < b.id) ? a : b; }
  function later(a, b) { if (!a) return b; if (!b) return a; if (a.time === b.time && a.id === b.id) return stableChoice(a, b); return a.time > b.time || (a.time === b.time && a.id > b.id) ? a : b; }
  function newQuestion(e) { return Object.assign(identifiers(e), { firstAnswer: null, lastAnswer: null, feedbackSeen: false, legacyExposure: false, lastReview: null, reviewConsumedId: null, reviewDueAt: null, reviewReason: null, reviewScheduledAt: 0, reviewScheduleId: null }); }
  function merge(a, b) {
    var out = blank(), events = dict();
    [a, b].forEach(function (s) {
      out.historyIncomplete = out.historyIncomplete || s.historyIncomplete;
      out.compacted = out.compacted || s.compacted;
      Object.keys(s.guards).forEach(function (k) { out.guards[k] = true; });
      Object.keys(s.marks).forEach(function (k) { out.marks[k] = Object.assign({}, out.marks[k] ? stableChoice(out.marks[k], s.marks[k]) : s.marks[k]); });
      s.events.forEach(function (e) { events[e.id] = events[e.id] ? stableChoice(events[e.id], e) : e; });
      Object.keys(s.questions).forEach(function (k) {
        var q = s.questions[k], dest = out.questions[k] || (out.questions[k] = newQuestion(q));
        dest.firstAnswer = earlier(dest.firstAnswer, q.firstAnswer); dest.lastAnswer = later(dest.lastAnswer, q.lastAnswer);
        dest.feedbackSeen = dest.feedbackSeen || q.feedbackSeen; dest.legacyExposure = dest.legacyExposure || q.legacyExposure;
        dest.lastReview = later(dest.lastReview, q.lastReview);
        if (q.reviewDueAt !== null && (dest.reviewDueAt === null || q.reviewScheduledAt > dest.reviewScheduledAt ||
          (q.reviewScheduledAt === dest.reviewScheduledAt && q.reviewScheduleId > dest.reviewScheduleId))) {
          dest.reviewDueAt = q.reviewDueAt; dest.reviewReason = q.reviewReason;
          dest.reviewScheduledAt = q.reviewScheduledAt; dest.reviewScheduleId = q.reviewScheduleId; dest.reviewConsumedId = q.reviewConsumedId;
        }
      });
      out.resume = later(out.resume, s.resume);
    });
    out.events = Object.keys(events).map(function (k) { return events[k]; }).sort(function (x, y) { return x.time - y.time || x.id.localeCompare(y.id); });
    // Concurrent first submissions can both have been labelled independent. Earlier feedback from
    // another tab also invalidates independence. Equal timestamps preserve normal answer-then-feedback.
    var earliestFeedback = dict();
    Object.keys(out.marks).forEach(function (id) {
      var m = out.marks[id];
      if (m.kind === "feedback" && (!Object.prototype.hasOwnProperty.call(earliestFeedback, m.identity) || m.time < earliestFeedback[m.identity])) earliestFeedback[m.identity] = m.time;
    });
    Object.keys(out.marks).forEach(function (id) {
      var mark = out.marks[id], q = out.questions[mark.identity], first = q && q.firstAnswer;
      if (mark.attemptKind === "independent") {
        if (Object.prototype.hasOwnProperty.call(earliestFeedback, mark.identity) && earliestFeedback[mark.identity] < mark.time) mark.attemptKind = "retry";
        else if (first && first.id !== id) mark.attemptKind = "repeat";
      }
    });
    function reconcile(e) {
      var mark = e && out.marks[e.id];
      if (mark && e.kind === "answer") {
        e.attemptKind = mark.attemptKind; e.independent = e.legacy ? null : mark.attemptKind === "independent";
      }
    }
    out.events.forEach(reconcile);
    Object.keys(out.questions).forEach(function (k) {
      var q = out.questions[k]; reconcile(q.firstAnswer); reconcile(q.lastAnswer);
      var scheduled = q.reviewScheduleId && out.marks[q.reviewScheduleId];
      if (q.reviewReason === "independent-answer" && scheduled && scheduled.attemptKind !== "independent") {
        q.reviewDueAt = q.reviewScheduledAt + DAY; q.reviewReason = "familiar-question";
      }
    });
    return out;
  }
  function parse(raw) {
    if (!raw) return { state: blank(), corrupt: false };
    var s;
    try { s = JSON.parse(raw); } catch (_) { return { state: blank(), corrupt: true }; }
    if (!obj(s) || s.version !== 1 || !Array.isArray(s.events) || !obj(s.questions) || !obj(s.marks) || !obj(s.guards)) return { state: blank(), corrupt: true };
    var out = blank();
    out.historyIncomplete = s.historyIncomplete === true; out.compacted = s.compacted === true;
    Object.keys(s.guards).forEach(function (k) { if (k.length < 700 && s.guards[k] === true) out.guards[k] = true; });
    function event(e) {
      if (!obj(e) || !str(e.id, 100) || KINDS.indexOf(e.kind) < 0) return null;
      var n = normalize(e, 0, e.legacy === true);
      if (!n) return null;
      n.id = e.id; n.attemptKind = ["independent", "retry", "repeat", "legacy", "unknown"].indexOf(e.attemptKind) >= 0 ? e.attemptKind : null;
      n.independent = n.legacy ? null : n.attemptKind === "independent";
      return n;
    }
    s.events.forEach(function (e) { var n = event(e); if (n) out.events.push(n); });
    Object.keys(s.questions).forEach(function (k) {
      var q = s.questions[k]; if (!obj(q)) return;
      var n = newQuestion(q); if (n.identity !== k) return;
      n.firstAnswer = event(q.firstAnswer); n.lastAnswer = event(q.lastAnswer);
      n.feedbackSeen = q.feedbackSeen === true; n.legacyExposure = q.legacyExposure === true;
      n.reviewDueAt = typeof q.reviewDueAt === "number" && q.reviewDueAt >= 0 ? q.reviewDueAt : null;
      n.reviewReason = str(q.reviewReason, 80); n.lastReview = event(q.lastReview); n.reviewConsumedId = str(q.reviewConsumedId, 100);
      n.reviewScheduledAt = time(q.reviewScheduledAt); n.reviewScheduleId = str(q.reviewScheduleId, 100); out.questions[k] = n;
    });
    Object.keys(s.marks).forEach(function (k) {
      var m = s.marks[k]; if (!obj(m) || k.length > 100 || KINDS.indexOf(m.kind) < 0) return;
      out.marks[k] = { kind: m.kind, identity: identityParts(str(m.identity, 1000)) ? m.identity : null, base: str(m.base, 700), time: time(m.time), choice: str(m.choice, 300), sectionId: str(m.sectionId), pointId: str(m.pointId),
        correct: typeof m.correct === "boolean" ? m.correct : null, attemptKind: str(m.attemptKind, 20), legacy: m.legacy === true };
      if (m.kind === "answer" && (!out.questions[m.identity] || !out.questions[m.identity].firstAnswer)) out.historyIncomplete = true;
    });
    out.resume = event(s.resume);
    return { state: out, corrupt: false };
  }
  function createStore(options) {
    options = options || {};
    var stage = options.stage === "primary" ? "primary" : options.stage === "junior" ? "junior" : "high";
    var KEY = stage === "primary" ? "peiyu.ps.learning.v1" : stage === "junior" ? "peiyu.jh.learning.v1" : "peiyu.hs.learning.v1";
    var LOG = stage === "primary" ? "peiyu.ps.log" : stage === "junior" ? "peiyu.jh.log" : "peiyu.hs.log";
    function sectionStage(sec) {
      return /^p[1-6][ab]-/.test(sec) ? "primary" : /^j(?:\d+-(?:\d+|test)|[789][ab]-p\d+)$/.test(sec) ? "junior" : "high";
    }
    function ownSection(sec) { return typeof sec !== "string" || !sec || sectionStage(sec) === stage; }
    var storage = options.storage || null, now = options.now || Date.now, maxEvents = Number.isInteger(options.maxEvents) ? Math.max(1, options.maxEvents) : 1500;
    var state = blank(), loaded = false, blockedWrite = false, memoryOnly = !storage, problems = [], listeners = [], updating = false;
    // PY-382: answers() runs once per content item (thousands per page). Skip re-parsing an unchanged
    // stored ledger, and group marks by identity once per ledger change instead of rescanning per call.
    var syncedRaw = null, dirty = true, marksByIdentity = null;
    function problem(msg) { if (problems.indexOf(msg) < 0) problems.push(msg); }
    function read(key) {
      try { return storage ? storage.getItem(key) : null; } catch (_) { memoryOnly = true; state.historyIncomplete = true; problem("storage-unavailable"); return null; }
    }
    function json(key) { var raw = read(key); if (!raw) return null; try { return JSON.parse(raw); } catch (_) { problem("legacy-corrupt:" + key); state.historyIncomplete = true; return null; } }
    function sync() {
      var raw = read(KEY);
      if (!dirty && raw !== null && raw === syncedRaw) return;
      var parsed = parse(raw);
      if (parsed.corrupt) { blockedWrite = true; memoryOnly = true; state.historyIncomplete = true; problem("learning-storage-corrupt"); syncedRaw = null; return; }
      state = merge(state, parsed.state); marksByIdentity = null;
      syncedRaw = raw; dirty = false;
    }
    function write() {
      var serialized = canonical(state);
      if (storage.getItem(KEY) !== serialized) storage.setItem(KEY, serialized);
    }
    function persist() {
      state.events.sort(function (a, b) { return a.time - b.time || a.id.localeCompare(b.id); });
      if (state.events.length > maxEvents) { state.events = state.events.slice(-maxEvents); state.compacted = true; }
      if (!storage || blockedWrite) { memoryOnly = true; return; }
      try { write(); memoryOnly = false; return; } catch (_) { /* Keep every exposure guard, shorten only the recent detailed timeline. */ }
      var detailed = state.events;
      for (var count = Math.floor(detailed.length / 2); ; count = Math.floor(count / 2)) {
        state.events = count ? detailed.slice(-count) : []; state.compacted = true;
        try { write(); memoryOnly = false; problem("timeline-compacted"); return; } catch (_) { if (!count) break; }
      }
      state.events = detailed; memoryOnly = true; problem("storage-full");
      // A quota-sized store normally still accepts a shorter replacement. Preserve old evidence while
      // persisting a fail-closed flag, so an unsaved answer cannot become "first" after a reload.
      state.historyIncomplete = true;
      try {
        var previous = storage.getItem(KEY), parsed = parse(previous);
        if (previous && !parsed.corrupt) {
          var closed = previous.replace('"historyIncomplete":false', '"historyIncomplete":true');
          if (closed !== previous) storage.setItem(KEY, closed);
        }
      } catch (_) { /* Fully unavailable storage cannot promise persistence; the UI reports memoryOnly. */ }
    }
    function guard(q) { return !!(state.guards[q.base] || state.guards[JSON.stringify([q.questionType, q.questionType === "diagnostic" ? q.pointId : q.sectionId, "*"])]); }
    function insert(e) {
      if (state.marks[e.id]) return state.events.find(function (old) { return old.id === e.id; }) || e;
      var q = e.identity && (state.questions[e.identity] || (state.questions[e.identity] = newQuestion(e)));
      if (e.kind === "answer") {
        var pastLegacy = guard(e);
        e.attemptKind = e.legacy ? "legacy" : q.feedbackSeen || e.feedbackSeen || pastLegacy ? "retry" :
          q.firstAnswer ? "repeat" : state.historyIncomplete || !e.contentVersion ? "unknown" : "independent";
        e.independent = e.legacy ? null : e.attemptKind === "independent";
        var reviewing = q.lastReview && q.lastReview.id !== q.reviewConsumedId && e.time >= q.lastReview.time &&
          (!q.lastAnswer || q.lastReview.time >= q.lastAnswer.time);
        q.firstAnswer = earlier(q.firstAnswer, e); q.lastAnswer = later(q.lastAnswer, e);
        q.feedbackSeen = q.feedbackSeen || e.feedbackSeen; q.legacyExposure = q.legacyExposure || e.legacy || pastLegacy;
        if (e.legacy) state.guards[e.base] = true;
        var due = (e.time || now()) + (e.independent && e.correct ? 7 : 1) * DAY;
        if (q.reviewDueAt === null || reviewing) {
          q.reviewDueAt = due; q.reviewScheduledAt = e.time; q.reviewScheduleId = e.id;
          if (reviewing) q.reviewConsumedId = q.lastReview.id;
          q.reviewReason = e.legacy ? "legacy-evidence" : e.correct === false ? "incorrect-answer" : reviewing ? "reviewed-familiar-question" : e.independent ? "independent-answer" : "familiar-question";
        }
      }
      if (e.kind === "feedback" && q) { q.feedbackSeen = true; if (e.legacy) state.guards[e.base] = true; }
      if (e.kind === "review" && q) q.lastReview = later(q.lastReview, e);
      if (e.kind === "resume" && e.sectionId) state.resume = later(state.resume, e);
      state.events.push(e); dirty = true; marksByIdentity = null;
      state.marks[e.id] = { kind: e.kind, identity: e.identity, base: e.base, time: e.time, choice: e.choice, sectionId: e.sectionId, pointId: e.pointId, correct: e.correct, attemptKind: e.attemptKind, legacy: e.legacy };
      return e;
    }
    // Marks keep the persisted schema (no questionId field); type and id come from identity [type, owner, questionId, version].
    // Old peiyu.ps.log entries carry no question type, so the cross-type fallback only pairs kinds that can record that type.
    var LOG_KIND_TYPES = { fill: ["predict", "lab"], eq: ["lab"], lab: ["lab"], predict: ["predict"], peek: ["predict"] };
    function primaryFallback(n, ids, logKind) {
      var parts = identityParts(n.identity), types = LOG_KIND_TYPES[logKind] || [ids.questionType];
      return !!parts && n.sectionId === ids.sectionId && parts[2] === ids.questionId && types.indexOf(parts[0]) >= 0;
    }
    function legacyNativeMatch(e) {
      if (e.kind !== "answer") return false;
      var ids = identifiers(e);
      return Object.keys(state.marks).some(function (id) {
        var n = state.marks[id];
        return !n.legacy && n.kind === "answer" &&
          (n.base === ids.base || (stage === "primary" && primaryFallback(n, ids, e.logKind))) &&
          n.choice === (e.choice || null) && n.correct === e.correct && Math.abs(n.time - e.time) <= 2000;
      });
    }
    function nativeKnowledgeHistory(h) {
      return Object.keys(state.marks).some(function (id) {
        var n = state.marks[id];
        if (n.legacy || n.kind !== "answer" || n.pointId !== h.pointId) return false;
        return h.kind === "reset" ? n.time <= time(h.t) : n.correct === h.correct && Math.abs(n.time - time(h.t)) <= 2000;
      });
    }
    function legacy(input, key) {
      if (legacyNativeMatch(input)) return;
      var e = normalize(Object.assign({}, input, { contentVersion: null, dedupeKey: key }), 0, true);
      if (e) insert(e);
    }
    function importLegacy() {
      var high = stage === "high";
      var log = json(LOG), knowledge = high ? json("peiyu.hs.knowledge.v1") : null, cards = high ? json("peiyu.hs.cards") : null;
      if (Array.isArray(log)) log.forEach(function (e) {
        if (!obj(e) || !ownSection(e.sec)) return;
        if (e.kind === "fill" && e.hint === "tip") return;
        var isLabFill = e.kind === "fill" && (e.slot !== undefined || e.first !== undefined);
        var t = time(e.t), type = { predict: "predict", fill: isLabFill ? "lab" : "predict", eq: "lab", answer: "exam", lab: "lab", cue: "cue", card: "card", peek: stage === "primary" ? "predict" : null }[e.kind];
        var choice = e.choice !== undefined ? e.choice : (e.value !== undefined ? String(e.value) : (e.v !== undefined ? String(e.v) : undefined));
        var item = { source: "legacy-log", logKind: e.kind, sectionId: str(e.sec), questionId: str(e.id), questionType: type, time: t,
          correct: e.correct, choice: choice, step: e.step, rating: e.grade, feedbackSeen: !!type };
        if (e.kind === "peek" && type) { item.kind = "feedback"; item.source = "legacy-peek"; }
        else if (type === "card") { item.kind = "self-rating"; item.correct = null; }
        else if (type) item.kind = "answer";
        else if (e.kind === "open" || e.kind === "step") item.kind = "view";
        else return;
        legacy(item, type === "card" ? ["card", e.id, t, e.grade].join("|") : ["log", e.kind, e.sec, e.id, t, choice, e.correct, e.grade].join("|"));
      });
      if (obj(knowledge) && knowledge.version === 1 && obj(knowledge.points)) {
        Object.keys(knowledge.points).forEach(function (id) {
          var p = knowledge.points[id]; if (!obj(p)) return;
          if (p.viewedAt) legacy({ kind: "view", source: "legacy-knowledge", pointId: id, time: time(p.viewedAt) }, "knowledge-view:" + id);
          var a = p.attempt;
          if (obj(a) && str(a.diagnosticId)) legacy({ kind: "answer", source: "legacy-knowledge", questionType: "diagnostic", pointId: id,
            questionId: a.diagnosticId, choice: a.choice, correct: a.correct, time: time(a.submittedAt), feedbackSeen: true },
          ["knowledge-answer", id, a.diagnosticId, a.submittedAt, a.choice].join("|"));
        });
        if (Array.isArray(knowledge.history)) knowledge.history.forEach(function (h) {
          if (!obj(h) || !str(h.pointId) || ["attempt", "reset"].indexOf(h.kind) < 0) return;
          // Native evidence already accounts for matching legacy-writer entries, even after timeline compaction.
          if (nativeKnowledgeHistory(h)) return;
          // History carries no diagnostic ID/version and is truncated by the old UI. It cannot establish independence.
          state.guards[JSON.stringify(["diagnostic", h.pointId, "*"])] = true;
          var p = knowledge.points[h.pointId], a = p && p.attempt;
          if (h.kind === "attempt" && !(a && time(a.submittedAt) === time(h.t) && a.correct === h.correct))
            legacy({ kind: "answer", source: "legacy-knowledge-history", questionType: "diagnostic", pointId: h.pointId,
              questionId: "unknown-diagnostic", correct: h.correct, feedbackSeen: true, time: time(h.t) }, ["knowledge-history", h.pointId, h.kind, h.t, h.correct].join("|"));
        });
      }
      if (obj(cards)) Object.keys(cards).forEach(function (id) {
        var c = cards[id]; if (!obj(c)) return;
        legacy({ kind: "self-rating", source: "legacy-cards", questionType: "card", questionId: id, rating: c.g, time: time(c.t) }, ["card", id, c.t, c.g].join("|"));
      });
      var keys = [];
      try { if (storage) { for (var i = 0; i < storage.length; i++) keys.push(storage.key(i)); } } catch (_) { problem("legacy-keys-unavailable"); }
      keys.forEach(function (key) {
        var match = /^peiyu\.hs\.hci\.ans\.(.+)$/.exec(key || ""); if (!match || !ownSection(match[1])) return;
        var saved = json(key); if (!obj(saved)) return;
        Object.keys(saved).forEach(function (id) {
          var qid = id.replace(/#\d+$/, ""), base = identifiers({ questionType: "predict", sectionId: match[1], questionId: qid }).base;
          // HCI is a restoration cache, often duplicating an already retained legacy/native answer.
          if (Object.keys(state.questions).some(function (k) { return state.questions[k].base === base && state.questions[k].firstAnswer; })) return;
          state.guards[base] = true;
          legacy({ kind: "answer", source: "legacy-hci", questionType: "predict", sectionId: match[1], questionId: qid,
            choice: saved[id], feedbackSeen: true, time: 0 }, [key, id, saved[id]].join("|"));
        });
      });
      var last = json("peiyu.hs.hci.last");
      if (obj(last) && ownSection(last.sec)) legacy({ kind: "resume", source: "legacy-hci", sectionId: last.sec, step: last.step, time: time(last.t) }, "hci-last:" + last.t + ":" + last.sec);
    }
    function ensure() {
      if (loaded) return;
      loaded = true; if (!storage) { state.historyIncomplete = true; problem("storage-unavailable"); }
      sync(); importLegacy(); if (!options.readOnly) persist();
    }
    function notify() {
      if (updating) return;
      updating = true;
      try { listeners.slice().forEach(function (fn) { try { fn(snapshot()); } catch (_) { /* One view must not break other subscribers. */ } }); }
      finally { updating = false; }
    }
    function question(input, counts) {
      ensure(); var ids = identifiers(input), stored = state.questions[ids.identity], q = stored ? copy(stored) : newQuestion(ids);
      q.hasAnswered = !!q.firstAnswer; q.legacyExposure = q.legacyExposure || guard(ids);
      q.feedbackSeen = q.feedbackSeen || q.legacyExposure;
      q.canAnswerIndependently = !state.historyIncomplete && !!q.contentVersion && !q.hasAnswered && !q.feedbackSeen && !q.legacyExposure;
      q.independentCount = 0; q.retryCount = 0; q.otherAnswerCount = 0; q.legacyCount = 0;
      if (counts) {
        q.independentCount = counts.independentAnswers; q.retryCount = counts.retries;
        q.otherAnswerCount = counts.otherAnswers; q.legacyCount = counts.legacyAnswers;
      } else Object.keys(state.marks).forEach(function (id) {
        var m = state.marks[id]; if (m.identity !== q.identity || m.kind !== "answer") return;
        if (m.legacy) q.legacyCount++; else if (m.attemptKind === "independent") q.independentCount++;
        else if (m.attemptKind === "retry") q.retryCount++; else q.otherAnswerCount++;
      });
      return q;
    }
    function emptyCounts() { return { views: 0, independentAnswers: 0, independentCorrect: 0, retries: 0, otherAnswers: 0, legacyAnswers: 0, selfRatings: 0, reviewVisits: 0 }; }
    function answerMarks(identity) {
      if (!marksByIdentity) {
        marksByIdentity = new Map();
        Object.keys(state.marks).forEach(function (id, order) {
          var mark = state.marks[id];
          if (typeof mark.identity !== "string" || (mark.kind !== "answer" && mark.kind !== "review")) return;
          var list = marksByIdentity.get(mark.identity);
          if (!list) marksByIdentity.set(mark.identity, list = []);
          list.push({ id: id, mark: mark, order: order });
        });
        marksByIdentity.forEach(function (list) { list.sort(function (a, b) { return a.mark.time - b.mark.time || a.order - b.order; }); });
      }
      return marksByIdentity.get(identity) || [];
    }
    function answers(identity) { ensure(); sync(); return answersNow(identity); }
    // One sync for a batch of lookups (mastery derive calls this once per content item).
    function answersReader() { ensure(); sync(); return answersNow; }
    function answersNow(identity) {
      if (typeof identity !== "string" || !identity) return [];
      var marks = answerMarks(identity);
      var q = state.questions[identity], consumed = q && state.marks[q.reviewConsumedId], priorReview = false, result = [];
      for (var start = 0; start < marks.length;) {
        var end = start, reviewAtTime = false, answerCount = 0;
        while (end < marks.length && marks[end].mark.time === marks[start].mark.time) {
          if (marks[end].mark.kind === "review") reviewAtTime = true; else answerCount++;
          end++;
        }
        for (var i = start; i < end; i++) {
          var entry = marks[i], m = entry.mark, afterReview = null;
          if (m.kind !== "answer") continue;
          // Marks retain history, but neither their key order nor timestamps prove cross-tab causality.
          // Only the existing schedule/consumption pair can confirm a review; ties remain unknown.
          if (!m.legacy && !state.historyIncomplete && !reviewAtTime) {
            if (!priorReview) afterReview = false;
            else if (answerCount === 1 && q && q.reviewScheduleId === entry.id && consumed &&
              consumed.kind === "review" && consumed.identity === identity && consumed.time < m.time) afterReview = true;
          }
          result.push({ time: m.time, correct: m.correct, attemptKind: m.attemptKind, afterReview: afterReview });
        }
        priorReview = priorReview || reviewAtTime; start = end;
      }
      return result;
    }
    function addCount(c, m) {
      if (m.kind === "view") c.views++;
      if (m.kind === "self-rating") c.selfRatings++;
      if (m.kind === "review") c.reviewVisits++;
      if (m.kind !== "answer") return;
      if (m.legacy) c.legacyAnswers++;
      else if (m.attemptKind === "independent") { c.independentAnswers++; if (m.correct) c.independentCorrect++; }
      else if (m.attemptKind === "retry") c.retries++; else c.otherAnswers++;
    }
    function snapshot() {
      ensure(); sync();
      var totals = emptyCounts(), points = dict(), sections = dict(), questionCounts = dict();
      Object.keys(state.marks).forEach(function (id) {
        var m = state.marks[id]; addCount(totals, m);
        if (m.identity) addCount(questionCounts[m.identity] || (questionCounts[m.identity] = emptyCounts()), m);
        if (m.pointId) addCount(points[m.pointId] || (points[m.pointId] = emptyCounts()), m);
        if (m.sectionId) addCount(sections[m.sectionId] || (sections[m.sectionId] = emptyCounts()), m);
      });
      var questions = Object.keys(state.questions).map(function (k) { return question(state.questions[k], questionCounts[k] || emptyCounts()); });
      var review = questions.filter(function (q) { return q.reviewDueAt !== null; }).map(function (q) {
        return Object.assign({}, q, { dueAt: q.reviewDueAt, reason: q.reviewReason, due: q.reviewDueAt <= now() });
      }).sort(function (a, b) { return a.dueAt - b.dueAt; });
      return copy({ version: 1, events: state.events, questions: questions, points: points, sections: sections, totals: totals, summary: totals,
        resume: state.resume, review: review, storage: { memoryOnly: memoryOnly, historyIncomplete: state.historyIncomplete,
          compacted: state.compacted, problems: problems, retainedEvents: state.events.length } });
    }
    function record(input) {
      ensure(); sync(); var e = normalize(input, now(), false);
      if (!e) return null;
      var recorded = insert(e); persist(); notify(); return copy(recorded);
    }
    function exportJSON() {
      var s = snapshot();
      // The export is whitelisted evidence, never raw localStorage, names, URLs or teacher/student identity.
      return JSON.stringify({ format: "peiyu-learning-evidence", version: 1, exportedAt: now(),
        note: "Local evidence only. Views and single correct answers do not establish completion or mastery. Legacy independence/content versions are unknown.",
        evidence: s }, null, 2);
    }
    if (options.eventTarget && options.eventTarget.addEventListener) options.eventTarget.addEventListener("storage", function (e) {
      if (e.key !== KEY && e.key !== null && !(typeof e.key === "string" && (e.key === LOG || /^peiyu\.hs\.(knowledge\.v1|cards|hci\.)/.test(e.key)))) return;
      ensure(); sync(); if (e.key !== KEY) importLegacy(); persist(); notify();
    });
    return { marks: function () { ensure(); sync(); return copy(Object.values(state.marks)); }, key: KEY, stage: stage, load: function () { ensure(); return snapshot(); }, record: record, snapshot: snapshot, question: question, answers: answers, answersReader: answersReader,
      exportJSON: exportJSON, subscribe: function (fn) { if (typeof fn !== "function") return function () {}; listeners.push(fn);
        return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; } };
  }
  return { createReader: function (options) {
    var storage = options.storage && { getItem: function (key) { return options.storage.getItem(key); } };
    var store = createStore({ storage: storage, stage: options.stage, now: options.now, readOnly: true });
    return { snapshot: store.snapshot, answers: store.answers, marks: store.marks };
  } };
});
