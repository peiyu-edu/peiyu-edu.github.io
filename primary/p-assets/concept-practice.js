/* Concept-card questions in the primary learning ledger (PY-223). No mastery is inferred here. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PeiyuConceptPractice = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var DAY = 86400000;
  var LABELS = { diagnostic: "自测题", parallel: "变式题", review: "复习题" };
  // Diagnostic first; the parallel question follows a first try, the review question needs a day's gap.
  function questions(card) {
    return [{ role: "diagnostic", question: card.diagnostic }].concat((card.practice || []).map(function (q) { return { role: q.role, question: q }; }));
  }
  function find(card, id) { return questions(card).find(function (entry) { return entry.question.id === id; }) || null; }
  function ref(card, question) {
    return { questionType: "diagnostic", pointId: card.id, questionId: question.id, contentVersion: question.contentVersion, contentVersions: question.contentVersions, source: "knowledge" };
  }
  function tagged(card, question, extra) { return Object.assign(ref(card, question), extra); }
  // An answer is recorded before its feedback is shown; a later answer to the same question is a retry.
  function answer(store, card, question, choice) {
    var event = store.record(tagged(card, question, { kind: "answer", choice: choice, correct: choice === question.correct, feedbackSeen: false }));
    store.record(tagged(card, question, { kind: "feedback" }));
    return event;
  }
  // Opening "看答案和理由" is feedback exposure; any answer afterwards is not independent.
  function reveal(store, card, question) { return store.record(tagged(card, question, { kind: "feedback" })); }
  function review(store, card, question) { return store.record(tagged(card, question, { kind: "review" })); }
  function own(snapshot, card) {
    return (snapshot && snapshot.questions || []).filter(function (q) { return q.questionType === "diagnostic" && q.pointId === card.id; });
  }
  // Only records of the question's current version count; older versions stay in the ledger untouched.
  function isCurrent(card, q) { var entry = find(card, q.questionId); return !!entry && (entry.question.contentVersion === q.contentVersion || (entry.question.contentVersions || []).indexOf(q.contentVersion) >= 0); }
  function touched(q) { return !!(q.firstAnswer || q.feedbackSeen); }
  function available(snapshot, card, now, session) {
    var mine = own(snapshot, card).filter(function (q) { return isCurrent(card, q); }), seen = function (id) {
      return (session && session.has(id)) || mine.some(function (q) { return q.questionId === id && touched(q); });
    };
    var firsts = mine.map(function (q) { return q.firstAnswer && q.firstAnswer.time; }).filter(function (t) { return t > 0; });
    var reviewQuestion = (card.practice || []).find(function (q) { return q.role === "review"; });
    return {
      diagnostic: true,
      parallel: seen(card.diagnostic.id),
      review: !!reviewQuestion && (seen(reviewQuestion.id) || (firsts.length > 0 && now - Math.min.apply(null, firsts) >= DAY))
    };
  }
  function cardHref(card, unit, question, isReview) {
    var hash = "card=" + encodeURIComponent(card.id) + (question ? "&q=" + encodeURIComponent(question.id) : "") + (isReview ? "&review=1" : "");
    return "knowledge.html?grade=" + unit.grade + "&unit=" + encodeURIComponent(unit.id) + "#" + hash;
  }
  // Groups the ledger's own schedule by knowledge point and by lesson. Due dates are the ledger's.
  function plan(snapshot, concepts, lessons, now) {
    var cards = concepts.cards, units = {}, titles = {}, byCard = {};
    concepts.units.forEach(function (u) { units[u.id] = u; });
    (lessons || []).forEach(function (l) { titles[l.id] = l.title; });
    (snapshot && snapshot.review || []).forEach(function (item) {
      if (item.questionType !== "diagnostic") return;
      var card = cards.find(function (c) { return c.id === item.pointId; });
      if (!card) return;
      var entry = find(card, item.questionId), current = !!entry && (entry.question.contentVersion === item.contentVersion || (entry.question.contentVersions || []).indexOf(item.contentVersion) >= 0);
      var due = item.dueAt <= now, unit = units[card.unitId];
      (byCard[card.id] = byCard[card.id] || []).push({ questionId: item.questionId, dueAt: item.dueAt, due: due, current: current,
        label: current ? LABELS[entry.role] : "题目已更新", lastCorrect: item.lastAnswer ? item.lastAnswer.correct : null,
        href: cardHref(card, unit, current ? entry.question : null, due && current) });
    });
    var points = cards.filter(function (c) { return byCard[c.id]; }).map(function (card) {
      var items = byCard[card.id].sort(function (a, b) { return a.dueAt - b.dueAt || a.questionId.localeCompare(b.questionId); });
      var open = available(snapshot, card, now), fresh = (card.practice || []).find(function (q) { return q.role === "review"; });
      var unanswered = fresh && open.review && !own(snapshot, card).some(function (q) { return q.questionId === fresh.id && isCurrent(card, q) && q.firstAnswer; });
      return { id: card.id, title: card.title, unitId: card.unitId, unit: units[card.unitId], lessonIds: card.lessonIds, items: items,
        due: items.filter(function (i) { return i.due; }).length, nextDue: items[0].dueAt,
        freshReview: unanswered ? { label: LABELS.review, href: cardHref(card, units[card.unitId], fresh, false) } : null };
    });
    var order = [];
    points.forEach(function (p) { p.lessonIds.forEach(function (id) { if (order.indexOf(id) < 0) order.push(id); }); });
    order.sort(function (a, b) { return a.localeCompare(b, "en", { numeric: true }); });
    var byLesson = order.map(function (id) {
      var linked = points.filter(function (p) { return p.lessonIds.indexOf(id) >= 0; });
      return { id: id, title: titles[id] || id, points: linked, due: linked.reduce(function (n, p) { return n + p.due; }, 0),
        nextDue: Math.min.apply(null, linked.map(function (p) { return p.nextDue; })) };
    });
    return { points: points, lessons: byLesson, due: points.reduce(function (n, p) { return n + p.due; }, 0) };
  }
  return { DAY: DAY, LABELS: LABELS, questions: questions, find: find, ref: ref, answer: answer, reveal: reveal, review: review,
    available: available, plan: plan, cardHref: cardHref };
});
