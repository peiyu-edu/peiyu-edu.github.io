/* Offline practice navigation. This module never writes learning records. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root.document) root.document.addEventListener("DOMContentLoaded", function () { api.init(root); });
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function filterQuestions(questions, filters, records) {
    records = records || {};
    return questions.filter(function (q) {
      var p = records[q.id] || {};
      return (!filters.topic || q.fr === filters.topic) &&
        (!filters.level || String(q.level) === String(filters.level)) &&
        (!filters.type || q.type === filters.type) &&
        (!filters.method || q.methods.indexOf(filters.method) >= 0) &&
        (filters.status !== "wrong" || !!p.first && (p.status || p.first) !== "ok") &&
        (filters.status !== "new" || !p.first);
    });
  }
  function compose(questions, count, random) {
    if (!Number.isInteger(count) || count < 1 || count > 50) return [];
    var list = questions.slice(), rng = random || Math.random;
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list.slice(0, count).map(function (q) { return q.id; });
  }
  function restoreList(hash, questions) {
    var raw = new URLSearchParams(String(hash || "").replace(/^#/, "")).get("list") || "";
    var allowed = new Set(questions.map(function (q) { return q.id; })), seen = new Set();
    return raw.split(",").filter(function (id) {
      if (!/^P\d{6}$/.test(id) || !allowed.has(id) || seen.has(id) || seen.size >= 50) return false;
      seen.add(id); return true;
    });
  }
  function methodAfterTopicChange(method, topic) {
    // Global core-* survives topic changes and is intersected by filterQuestions.
    // Only another topic's original FR:card gets cleared.
    return topic && /^FR\d{3}:/.test(method) && method.split(":")[0] !== topic ? "" : method;
  }
  function init(root) {
    var document = root.document, node = document.getElementById("practice-data");
    if (!node) return;
    var meta = JSON.parse(node.textContent), questions = meta.questions, byId = new Map();
    questions.forEach(function (q) { byId.set(q.id, q); });
    var fields = {}, keys = ["topic", "level", "type", "method", "status"];
    keys.forEach(function (k) { fields[k] = document.getElementById("practice-" + k); });
    var params = new URLSearchParams(root.location.search);
    keys.forEach(function (k) {
      var value = params.get(k) || "";
      if (Array.from(fields[k].options).some(function (o) { return o.value === value; })) fields[k].value = value;
    });
    var blind = document.getElementById("practice-blind"), count = document.getElementById("practice-count");
    blind.checked = params.get("blind") !== "0";
    var message = document.getElementById("practice-message"), results = document.getElementById("practice-results");
    var selectedNode = document.getElementById("practice-selected"), selectedList = document.getElementById("practice-selected-list");
    var selectedMessage = document.getElementById("practice-selected-message"), more = document.getElementById("practice-more");
    var matches = [], selected = [], limit = 100;
    function filters() { var f = {}; keys.forEach(function (k) { f[k] = fields[k].value; }); return f; }
    function records() {
      try { return root.PeiyuOlympic ? root.PeiyuOlympic.load().problems || {} : {}; }
      catch (e) { return {}; }
    }
    function text(tag, value, parent) { var n = document.createElement(tag); n.textContent = value; parent.appendChild(n); return n; }
    function questionLink(q, label, parent) {
      var a = text("a", label, parent);
      a.href = "p/" + q.id + ".html" + (blind.checked ? "?practice=1" : "");
      return a;
    }
    function address() {
      var query = new URLSearchParams(), f = filters();
      keys.forEach(function (k) { if (f[k]) query.set(k, f[k]); });
      if (!blind.checked) query.set("blind", "0");
      var hash = selected.length ? "#list=" + selected.join(",") : "";
      try { root.history.replaceState(null, "", root.location.pathname + (query.toString() ? "?" + query : "") + hash); }
      catch (e) { /* Filtering still works when the browser disallows file URL history. */ }
    }
    function renderSelected() {
      selectedList.replaceChildren(); selectedNode.hidden = !selected.length;
      selected.forEach(function (id, i) {
        var q = byId.get(id), li = document.createElement("li");
        questionLink(q, blind.checked ? "练习 " + (i + 1) : q.label, li);
        if (!blind.checked) text("span", " · " + q.topic + " · F" + q.level, li);
        selectedList.appendChild(li);
      });
      selectedMessage.textContent = "共 " + selected.length + " 题。逐题打开后可用浏览器返回本清单；本页地址可保留这组题。";
    }
    function renderResults() {
      results.replaceChildren();
      matches.slice(0, limit).forEach(function (q, i) {
        var li = document.createElement("li"), a = questionLink(q, "", li);
        a.style.overflowWrap = "anywhere";
        var label = text("span", blind.checked ? "练习 " + (i + 1) : q.label, a); label.className = "name";
        if (!blind.checked) {
          var detail = text("span", "F" + q.level + " · " + ({ choice: "选择", blank: "填空", proof: "解答" })[q.type], a);
          detail.className = "meta";
        }
        results.appendChild(li);
      });
      message.textContent = matches.length ? "符合条件 " + matches.length + " 题，当前显示 " + Math.min(limit, matches.length) + " 题。" : "没有符合这些条件的题，请放宽筛选。";
      more.hidden = matches.length <= limit;
    }
    function refresh(clear) {
      matches = filterQuestions(questions, filters(), records()); limit = 100;
      if (clear) selected = [];
      renderResults(); renderSelected();
    }
    keys.forEach(function (k) {
      fields[k].addEventListener("change", function () {
        if (k === "topic") fields.method.value = methodAfterTopicChange(fields.method.value, fields.topic.value);
        refresh(true); address();
      });
    });
    blind.addEventListener("change", function () { renderResults(); renderSelected(); address(); });
    document.getElementById("practice-compose").addEventListener("click", function () {
      var n = Number(count.value);
      if (!Number.isInteger(n) || n < 1 || n > 50) { message.textContent = "请输入1至50之间的整数题数。"; return; }
      selected = compose(matches, n); renderSelected(); address();
      if (!selected.length) message.textContent = "没有可选题目，请先放宽筛选。";
    });
    document.getElementById("practice-reset").addEventListener("click", function () {
      keys.forEach(function (k) { fields[k].value = ""; }); refresh(true); address();
    });
    more.addEventListener("click", function () { limit += 100; renderResults(); });
    document.addEventListener("peiyu-record", function () { refresh(false); });
    root.addEventListener("storage", function (e) { if (e.key === "peiyu.olympic.v1" || e.key === null) refresh(false); });
    // A completed item stays in its saved group even when its learning status changes.
    refresh(false); selected = restoreList(root.location.hash, questions); renderSelected();
  }
  return { filterQuestions: filterQuestions, compose: compose, restoreList: restoreList, methodAfterTopicChange: methodAfterTopicChange, init: init };
});
