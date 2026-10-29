/* Read-only projections. The owner's stores compute legacy evidence in private memory. */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("../assets/learning-state.js"), require("../../../olympic/site/assets/learning.js"));
  } else root.PeiyuStageOverview = factory(root.PeiyuOverviewEvidence, root.PeiyuOverviewOlympic);
})(typeof globalThis !== "undefined" ? globalThis : this, function (evidence, olympic) {
  "use strict";
  function object(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function own(map, key) { return object(map) && Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null; }
  function numericTime(x) { return typeof x === "number" && Number.isFinite(x) && x > 0 && x <= 8640000000000000 ? x : 0; }
  function isoTime(x) { var t = typeof x === "string" ? Date.parse(x) : NaN; return Number.isFinite(t) && t > 0 ? t : 0; }
  function memoryProjection(storage, errors) {
    var cache = new Map();
    return {
      getItem: function (key) {
        if (!cache.has(key)) {
          try { cache.set(key, storage.getItem(key)); }
          catch (_) { errors.add(key); throw new Error("Storage cannot be read"); }
        }
        return cache.get(key);
      },
      // Legacy import/persist is confined to this snapshot, never the browser's store.
      setItem: function (key, value) { cache.set(key, String(value)); },
      removeItem: function (key) { cache.set(key, null); }
    };
  }
  function recent(candidates) {
    return candidates.filter(Boolean).sort(function (a, b) { return b.time - a.time || a.href.localeCompare(b.href); })[0] || null;
  }
  function course(stage, storage, now) {
    var errors = new Set(), projection = memoryProjection(storage, errors);
    var snapshot = evidence.createStore({storage: projection, stage: stage.id, now: function () { return now; }}).load();
    var lessons = stage.lessons || {}, points = stage.points || {};
    function location(item) {
      if (!object(item) || !numericTime(item.time)) return null;
      var lesson = own(lessons, item.sectionId), point = own(points, item.pointId);
      if (lesson) {
        var step = Number.isInteger(item.step) ? Math.max(1, Math.min(lesson.steps, item.step)) : 1;
        return {title: lesson.title, href: stage.prefix + "lessons/" + item.sectionId + ".html#step" + step, time: item.time};
      }
      if (point) return {title: point.title, href: stage.prefix + "knowledge.html#point=" + encodeURIComponent(item.pointId), time: item.time};
      return null;
    }
    var review = snapshot.review.filter(function (item) {
      return own(points, item.pointId) || (stage.id !== "high" && own(lessons, item.sectionId));
    });
    var candidates = snapshot.events.map(location).concat([location(snapshot.resume)]);
    snapshot.questions.forEach(function (q) { candidates.push(location(q.lastAnswer)); });
    var partial = snapshot.storage.historyIncomplete || errors.size > 0;
    return {recent: recent(candidates), due: review.filter(function (q) { return q.due; }).length,
      status: errors.size ? "unreadable" : partial ? "partial" : "ready"};
  }
  function contest(stage, storage, now) {
    var raw;
    try { raw = storage.getItem("peiyu.olympic.v1"); } catch (_) { return {recent: null, due: null, status: "unreadable"}; }
    var data;
    try { data = raw ? JSON.parse(raw) : {problems: {}, log: []}; }
    catch (_) { return {recent: null, due: null, status: "unreadable"}; }
    if (!object(data) || !object(data.problems) || (data.log !== undefined && !Array.isArray(data.log)))
      return {recent: null, due: null, status: "unreadable"};
    var meta = stage.problems || {}, candidates = [], partial = false;
    Object.keys(data.problems).forEach(function (id) {
      var p = data.problems[id], m = own(meta, id);
      if (!m) return;
      if (!object(p)) { partial = true; return; }
      var t = isoTime(p.at) || isoTime(p.firstAt);
      if (t) candidates.push({time: t, title: m.topic + " · " + m.label, href: stage.prefix + "index.html"});
    });
    function route(position, fr) {
      if (!object(position) || !own(stage.topics, fr) || !isoTime(position.at)) return;
      candidates.push({time: isoTime(position.at), title: stage.topics[fr] + " · 学习活动", href: stage.prefix + "index.html"});
    }
    if (object(data.studyPosition)) route(data.studyPosition, data.studyPosition.fr);
    var graphs = object(data.graphStudy) && data.graphStudy.graphs;
    if (object(graphs)) Object.keys(graphs).forEach(function (fr) {
      if (object(graphs[fr]) && Array.isArray(graphs[fr].runs)) graphs[fr].runs.forEach(function (run) { route(run, fr); });
    });
    if (object(data.graphStudy) && data.graphStudy.version === 1 && Array.isArray(data.graphStudy.runs))
      data.graphStudy.runs.forEach(function (run) { route(run, "FR008"); });
    var training = object(data.goalTraining) && data.goalTraining.routes;
    if (object(training)) Object.keys(training).forEach(function (id) {
      var entry = training[id];
      var config = own(stage.training, id);
      if (config && object(entry) && Array.isArray(entry.runs)) entry.runs.forEach(function (run) { route(run, config.fr); });
    });
    var clean = {problems: {}, log: Array.isArray(data.log) ? data.log : []};
    Object.keys(data.problems).forEach(function (id) {
      if (own(meta, id) && object(data.problems[id])) clean.problems[id] = data.problems[id];
    });
    return {recent: recent(candidates), due: olympic.plan(meta, clean, now, 8).due, status: partial ? "partial" : "ready"};
  }
  function summarize(catalog, storage, now) {
    return catalog.stages.map(function (stage) {
      var base = {id: stage.id, title: stage.title, available: stage.available, home: stage.prefix + "index.html",
        record: stage.prefix + (stage.id === "olympiad" ? "record.html" : "learning.html")};
      if (!stage.available) return Object.assign(base, {recent: null, due: null, status: "unavailable"});
      if (!storage) return Object.assign(base, {recent: null, due: null, status: "unreadable"});
      var info = stage.id === "olympiad" ? contest(stage, storage, now) : course(stage, storage, now);
      if (info.status === "unreadable") info.due = null;
      return Object.assign(base, info);
    });
  }
  return {summarize: summarize};
});
