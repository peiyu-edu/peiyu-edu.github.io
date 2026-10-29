/* Read-only mastery derived from local answer evidence; shared by primary/junior. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else if (root) root.PeiyuMastery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var GAP = 20 * 3600000, DAY = 86400000, FUTURE = 5 * 60000;
  var LABELS = { unseen: "未作答", practicing: "练习中", learned: "初步掌握", secure: "已巩固", wrong: "待巩固" };
  var TYPES = ["predict", "diagnostic", "card", "exam"];
  function compare(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
  function sorted(values) { return Array.from(new Set(values.filter(function (v) { return typeof v === "string" && v; }))).sort(compare); }
  function array(value) { return Array.isArray(value) ? value : []; }
  function canonical(value) {
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    if (value && typeof value === "object") return "{" + Object.keys(value).sort(compare).map(function (key) { return JSON.stringify(key) + ":" + canonical(value[key]); }).join(",") + "}";
    return JSON.stringify(value);
  }
  function decode(value) { try { return JSON.parse(value); } catch (_) { return []; } }
  function identity(row) {
    var parts = decode(row.base), type = row.questionType || parts[0];
    var owner = row.owner || parts[1] || (type === "diagnostic" ? row.pointId : type === "card" ? "global" : row.sectionId) || "";
    var id = row.questionId || parts[2], version = typeof row.contentVersion === "string" && row.contentVersion ? row.contentVersion : "?";
    return id && type ? { base: JSON.stringify([type, owner, id]), identity: JSON.stringify([type, owner, id, version]),
      questionType: type, owner: owner, questionId: id, contentVersion: version } : null;
  }
  function withoutFocus(href) {
    if (!href) return null;
    var hash = href.indexOf("#"), suffix = hash < 0 ? "" : href.slice(hash), head = hash < 0 ? href : href.slice(0, hash);
    var query = head.indexOf("?");
    if (query < 0) return href;
    var params = new URLSearchParams(head.slice(query + 1)); params.delete("focus");
    var queryText = params.toString();
    return head.slice(0, query) + (queryText ? "?" + queryText : "") + suffix;
  }
  function empty() { return { questions: [], points: [], groups: [], wrongbook: [], today: { items: [], total: 0, remaining: 0, moreLabel: "" } }; }

  function derive(snapshot, answersFn, contentIndex, now, stageConfig) {
    snapshot = snapshot || {}; contentIndex = contentIndex || {}; stageConfig = stageConfig || {};
    var stage = stageConfig.stage || contentIndex.stage;
    if (["primary", "junior", "high"].indexOf(stage) < 0 || (contentIndex.stage && contentIndex.stage !== stage)) return empty();
    if (!Number.isFinite(now) || now <= 0) throw new TypeError("derive requires an explicit positive timestamp");
    if (typeof answersFn !== "function") throw new TypeError("derive requires a read-only answers(identity) function");
    var limit = stageConfig.dailyLimit === undefined ? (stage === "primary" ? 5 : stage === "high" ? 8 : 10) : stageConfig.dailyLimit;
    var staleDays = stageConfig.staleDays === undefined ? (stage === "primary" ? 45 : stage === "high" ? 30 : 60) : stageConfig.staleDays;
    if (!Number.isInteger(limit) || limit < 1 || !Number.isFinite(staleDays) || staleDays <= 0) throw new TypeError("Invalid stageConfig limits");
    var staleGap = staleDays * DAY, current = new Map(), models = new Map(), families = new Map();
    var pointMeta = new Map(), pointGroups = new Map(), groupMeta = new Map();
    function addGroup(pointId, row) {
      var groupId = stage === "primary" ? row.unitId : row.chapterId;
      if (!groupId) return;
      if (!pointGroups.has(pointId)) pointGroups.set(pointId, new Set());
      pointGroups.get(pointId).add(groupId);
      groupMeta.set(groupId, { id: groupId, title: (stage === "primary" ? row.unitTitle : row.chapterTitle) || groupId });
    }
    array(contentIndex.points).forEach(function (row) { var pid = row.pointId || row.id; if (pid) { pointMeta.set(pid, row); addGroup(pid, row); } });
    array(contentIndex.lessons).forEach(function (row) { array(row.pointIds).forEach(function (pid) { addGroup(pid, row); }); });
    // E3's reviewed index uses items[]. Sorting also makes all derived arrays stable.
    array(contentIndex.items).slice().sort(function (a, b) { return compare(canonical(a), canonical(b)); }).forEach(function (row) {
      var ids = identity(row);
      if (!ids || row.reviewed === false || (row.stage && row.stage !== stage)) return;
      if (current.has(ids.base)) throw new TypeError("Duplicate current question base: " + ids.base);
      current.set(ids.base, { ids: ids, row: row });
    });
    function create(ids, row, stored) {
      var admitted = current.get(ids.base), isCurrent = !!admitted && ids.contentVersion === admitted.ids.contentVersion && ids.contentVersion !== "?";
      var sectionId = row.sectionId || (ids.questionType !== "diagnostic" && ids.questionType !== "card" ? ids.owner : null) || (stored && stored.sectionId) || null;
      var pointIds = ids.questionType === "lab" ? [] : sorted(array(row.pointIds).concat(ids.questionType === "diagnostic" ? [ids.owner] : []));
      pointIds.forEach(function (pid) { addGroup(pid, row); });
      var family = isCurrent && ids.questionType === "diagnostic" && row.familyKey ? JSON.stringify([stage, ids.owner, row.familyKey]) : ids.identity;
      var href = isCurrent ? row.href || null : null;
      var reviewHref = row.reviewHref || row.explanationHref;
      if (!reviewHref && sectionId && /^(?:p[1-6][ab]-u\d+-\d+|j\d+-\d+)$/.test(sectionId)) reviewHref = "lessons/" + sectionId + ".html#step2";
      var q = Object.assign({}, ids, { stage: stage, sectionId: sectionId, pointIds: pointIds, family: family,
        title: row.title || ids.questionId, href: href, reviewHref: withoutFocus(reviewHref || href),
        versionStale: !!admitted && !isCurrent, unavailable: !admitted, current: isCurrent,
        state: "unseen", anchorAt: null, lastStrongAt: null, nextStrongAt: null, fixes: 0, streakWrong: 0,
        firstWrongAt: null, lastWrongAt: null, wrongCount: 0, lastChoice: stored && stored.lastAnswer ? stored.lastAnswer.choice : null,
        fixedByRetry: false, recentWeakWrong: false, weakCorrect: false, incomplete: false, hasLegacy: false,
        clockAnomaly: false, clockAnomalyCount: 0, answered: false, againWrong: false,
        // Unlock inputs mirror primary/site/p-assets/concept-practice.js: the stored first answer (positive time only) and "touched".
        firstFromRow: !!stored && Object.prototype.hasOwnProperty.call(stored, "firstAnswer"),
        firstAnswerAt: stored && stored.firstAnswer && stored.firstAnswer.time > 0 ? stored.firstAnswer.time : null,
        touched: !!(stored && (stored.feedbackSeen || stored.firstAnswer)),
        evidence: { s0: 0, s1Own: 0, s1Family: 0, weak: 0, startWeak: 0, ignored: 0 }, strongEvidence: [] });
      var model = { q: q, row: row, strongWrong: false, ownEligible: false, hasUnknown: false };
      models.set(q.identity, model);
      if (isCurrent && TYPES.indexOf(q.questionType) >= 0) {
        if (!families.has(family)) families.set(family, []);
        families.get(family).push(model);
      }
      return model;
    }
    var stored = new Map();
    array(snapshot.questions).slice().sort(function (a, b) { return compare(canonical(a), canonical(b)); }).forEach(function (row) {
      var ids = identity(row); if (ids && !stored.has(ids.identity)) stored.set(ids.identity, row);
    });
    current.forEach(function (entry) { create(entry.ids, entry.row, stored.get(entry.ids.identity)); });
    stored.forEach(function (row, key) {
      if (!models.has(key)) {
        var ids = identity(row), entry = current.get(ids.base);
        // PY-328: the high index covers practice questions only. Lesson predicts/labs in the high ledger are out of
        // scope, so a stored row with no indexed base is ignored; an indexed base under an old version stays "updated".
        if (!entry && stage === "high") return;
        create(ids, entry ? entry.row : {}, row);
      }
    });

    var events = [];
    models.forEach(function (model) {
      var q = model.q, deduped = new Map();
      array(answersFn(q.identity)).forEach(function (answer) {
        if (!answer || (answer.kind && answer.kind !== "answer")) return;
        // E1 currently omits id/legacy. Its legacy attemptKind is explicit; the
        // content signature is a deterministic fallback, never insertion order.
        var a = { id: typeof answer.id === "string" && answer.id ? answer.id : "signature:" + canonical([q.identity, answer.time, answer.correct, answer.attemptKind]),
          time: answer.time, correct: answer.correct, attemptKind: answer.attemptKind,
          legacy: answer.legacy === true || answer.attemptKind === "legacy", afterReview: answer.afterReview,
          clockAnomaly: answer.clockAnomaly === true,
          version: answer.contentVersion === undefined ? q.contentVersion : answer.contentVersion, model: model };
        var old = deduped.get(a.id);
        var marked = a.clockAnomaly || !!(old && old.answer.clockAnomaly);
        if (!old || canonical(answer) < old.key) deduped.set(a.id, { answer: a, key: canonical(answer) });
        deduped.get(a.id).answer.clockAnomaly = marked;
      });
      deduped.forEach(function (entry) {
        events.push(entry.answer);
        // A snapshot row that carries firstAnswer is authoritative (same as the card page); bare rows fall back to the event stream.
        var at = entry.answer.time; if (!q.firstFromRow && Number.isFinite(at) && at > 0 && (q.firstAnswerAt === null || at < q.firstAnswerAt)) q.firstAnswerAt = at;
      });
    });
    events.sort(function (a, b) {
      var at = Number.isFinite(a.time) ? a.time : 0, bt = Number.isFinite(b.time) ? b.time : 0;
      return at - bt || compare(a.id, b.id) || compare(a.model.q.identity, b.model.q.identity);
    });
    function strong(model, a, strength) {
      var q = model.q;
      if (a.correct) {
        if (q.state === "learned" || q.state === "secure") { q.state = "secure"; if (model.strongWrong) q.fixes = 2; }
        else { q.state = "learned"; if (model.strongWrong) q.fixes = 1; }
        q.streakWrong = 0;
      } else {
        q.againWrong = q.againWrong || q.state === "secure";
        q.state = "wrong"; q.streakWrong++; q.fixes = 0; model.strongWrong = true;
      }
      q.anchorAt = a.time; q.lastStrongAt = a.time;
      q.fixedByRetry = false; q.recentWeakWrong = false; q.weakCorrect = false;
      q.evidence[strength === "S0" ? "s0" : strength === "S1" ? "s1Own" : "s1Family"]++;
      q.strongEvidence.push({ id: a.id, identity: a.model.q.identity, time: a.time, correct: a.correct, strength: strength });
    }
    events.forEach(function (a) {
      // A supplied anomaly mark stays excluded even after wall time catches up.
      var model = a.model, q = model.q, normalTime = !a.clockAnomaly && Number.isFinite(a.time) && a.time > 0 && a.time <= now + FUTURE;
      if (a.legacy) { q.hasLegacy = true; q.evidence.ignored++; return; }
      if (q.questionType !== "lab" && TYPES.indexOf(q.questionType) < 0) { q.evidence.ignored++; return; }
      if (a.correct === false) {
        q.wrongCount++; if (q.firstWrongAt === null) q.firstWrongAt = a.time; q.lastWrongAt = a.time;
      }
      if (q.questionType === "lab") { q.answered = true; q.state = "practicing"; q.evidence.ignored++; return; }
      if (!normalTime) { q.clockAnomaly = true; q.clockAnomalyCount++; q.evidence.weak++; return; }
      var eligible = q.current && a.version === q.contentVersion && TYPES.indexOf(q.questionType) >= 0 &&
        typeof a.correct === "boolean" && ["independent", "repeat", "retry"].indexOf(a.attemptKind) >= 0;
      if (!eligible) {
        if (q.current && a.version === q.contentVersion && a.attemptKind === "unknown" && typeof a.correct === "boolean") {
          model.hasUnknown = true; q.answered = true;
          if (q.state === "unseen") q.state = "practicing";
        }
        q.evidence.ignored++; return;
      }
      model.ownEligible = true; q.answered = true;
      if (q.state === "unseen") q.state = "practicing";
      var strength = q.anchorAt === null ? (a.attemptKind === "independent" ? "S0" : "start-W") : a.time - q.anchorAt >= GAP ? "S1" : "W";
      // Test both sides using pre-event anchors; an own W never feeds family.
      var targets = strength === "S0" || strength === "S1" ? (families.get(q.family) || []).filter(function (target) {
        return target !== model && target.q.anchorAt !== null && a.time - target.q.anchorAt >= GAP;
      }) : [];
      if (strength === "S0" || strength === "S1") strong(model, a, strength);
      else {
        q.evidence.weak++;
        q.fixedByRetry = a.correct && (a.attemptKind === "retry" || a.afterReview === true);
        q.weakCorrect = a.correct; q.recentWeakWrong = !a.correct;
        if (strength === "start-W") { q.anchorAt = a.time; q.evidence.startWeak++; }
      }
      targets.forEach(function (target) { strong(target, a, "family-S1"); });
    });

    var schedules = new Map();
    array(snapshot.review).slice().sort(function (a, b) { return compare(canonical(a), canonical(b)); }).forEach(function (row) {
      if (typeof row.identity === "string" && Number.isFinite(row.dueAt) && !schedules.has(row.identity)) schedules.set(row.identity, row.dueAt);
    });
    var questions = Array.from(models.values()).map(function (model) {
      var q = model.q;
      q.incomplete = model.hasUnknown && !model.ownEligible;
      q.nextStrongAt = q.anchorAt === null ? null : q.anchorAt + GAP;
      q.stale = q.lastStrongAt !== null && now - q.lastStrongAt >= staleGap;
      q.needsReview = q.streakWrong >= 2;
      q.canRetry = q.current && (q.nextStrongAt === null || now >= q.nextStrongAt);
      q.actionHref = q.needsReview && !q.canRetry ? q.reviewHref : q.href;
      q.dueAt = schedules.has(q.identity) ? schedules.get(q.identity) : null;
      q.due = q.dueAt !== null && q.dueAt <= now;
      q.stateLabel = q.state === "practicing" && q.incomplete ? "练习中（记录不完整）" : LABELS[q.state];
      return q;
    }).sort(function (a, b) { return compare(a.identity, b.identity); });
    var byPoint = new Map();
    pointMeta.forEach(function (_, pid) { byPoint.set(pid, []); });
    questions.filter(function (q) { return q.current && q.questionType !== "lab"; }).forEach(function (q) {
      q.pointIds.forEach(function (pid) { if (!byPoint.has(pid)) byPoint.set(pid, []); byPoint.get(pid).push(q); });
    });
    var points = Array.from(byPoint.keys()).sort(compare).map(function (pid) {
      var qs = byPoint.get(pid), answered = qs.filter(function (q) { return q.answered; }).length;
      var learned = qs.filter(function (q) { return q.state === "learned" || q.state === "secure"; }).length;
      var wrong = qs.filter(function (q) { return q.state === "wrong"; }).length;
      var secure = qs.some(function (q) { return q.state === "secure"; });
      var last = qs.reduce(function (t, q) { return q.lastStrongAt === null ? t : Math.max(t || 0, q.lastStrongAt); }, null);
      var state = !answered ? "unseen" : wrong ? "wrong" : secure && learned >= 2 ? "secure" : learned ? "learned" : "practicing";
      return { pointId: pid, state: state, stateLabel: LABELS[state], questions: qs.length, answered: answered,
        wrongOpen: qs.filter(function (q) { return q.wrongCount && q.state !== "secure"; }).length,
        lastStrongAt: last, stale: last !== null && now - last >= staleGap, groupIds: sorted(Array.from(pointGroups.get(pid) || [])) };
    });
    var groups = Array.from(groupMeta.keys()).sort(compare).map(function (gid) {
      var counts = { unseen: 0, wrong: 0, practicing: 0, learned: 0, secure: 0 };
      points.forEach(function (p) { if (p.groupIds.indexOf(gid) >= 0) counts[p.state]++; });
      var group = { id: gid, title: groupMeta.get(gid).title, counts: counts };
      group[stage === "primary" ? "unitId" : "chapterId"] = gid;
      return group;
    });
    // A diagnostic-family retry offers an unanswered current variant first (parallel, then review), then the original.
    // Primary knowledge cards open the review variant only a day after the family's first answer (concept-practice.js), so never point at a locked one.
    function reviewOpen(q) {
      var firsts = questions.filter(function (o) { return o.family === q.family && o.firstAnswerAt !== null; }).map(function (o) { return o.firstAnswerAt; });
      return firsts.length > 0 && now - Math.min.apply(null, firsts) >= DAY;
    }
    function retryTarget(q) {
      if (q.questionType !== "diagnostic") return q;
      return questions.filter(function (other) {
        var row = models.get(other.identity).row;
        return other.identity !== q.identity && other.current && other.family === q.family && !other.answered &&
          ["parallel", "review"].indexOf(row.role) >= 0 && (stage !== "primary" || row.role !== "review" || other.touched || reviewOpen(q));
      }).sort(function (a, b) {
        return compare(models.get(a.identity).row.role === "parallel" ? 0 : 1, models.get(b.identity).row.role === "parallel" ? 0 : 1) || compare(a.identity, b.identity);
      })[0] || q;
    }
    var wrongbook = questions.filter(function (q) { return TYPES.indexOf(q.questionType) >= 0 && q.wrongCount > 0; }).map(function (q) {
      var retry = retryTarget(q);
      return Object.assign({}, q, { group: q.versionStale || q.unavailable ? "updated" : q.state === "secure" ? "corrected" : "open",
        currentHref: current.has(q.base) ? current.get(q.base).row.href || null : null,
        retryIdentity: retry.identity, retryHref: retry.href });
    });
    function priority(q) { return q.needsReview ? 0 : q.wrongCount > 0 ? 1 : q.state === "learned" ? 2 : q.stale ? 3 : 4; }
    var candidates = questions.filter(function (q) {
      return q.current && TYPES.indexOf(q.questionType) >= 0 && q.due && q.canRetry && (q.state !== "secure" || q.stale);
    }).sort(function (a, b) { return priority(a) - priority(b) || a.dueAt - b.dueAt || compare(a.identity, b.identity); });
    var items = candidates.slice(0, limit).map(function (q) {
      var selected = retryTarget(q);
      return { identity: q.identity, state: q.state, dueAt: q.dueAt, needsReview: q.needsReview, reviewHref: q.reviewHref,
        nextStrongAt: q.nextStrongAt, stale: q.stale, questionIdentity: selected.identity, questionHref: selected.href,
        href: q.needsReview ? q.reviewHref : selected.href, action: q.needsReview ? "review" : "answer" };
    });
    var remaining = Math.max(0, candidates.length - limit);
    return { questions: questions, points: points, groups: groups, wrongbook: wrongbook,
      today: { items: items, total: candidates.length, remaining: remaining, moreLabel: remaining ? "还有 " + remaining + " 题" : "" } };
  }
  // UI callers can degrade without exposing exception messages or question IDs.
  function deriveSafe(snapshot, answersFn, contentIndex, now, stageConfig) {
    try {
      return { ok: true, data: derive(snapshot, answersFn, contentIndex, now, stageConfig) };
    } catch (error) {
      return { ok: false, reason: error instanceof TypeError ? "invalid-input" : "derivation-failed" };
    }
  }
  return { derive: derive, deriveSafe: deriveSafe };
});
