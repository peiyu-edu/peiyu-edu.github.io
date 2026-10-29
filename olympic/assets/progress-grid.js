/* 培玉 · 一试站：专题进度格（PY-179）。题目页左栏与专题页标题旁共用。
   只读本机记录 peiyu.olympic.v1，不写任何东西。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1";
  var WORD = { ok: "做对", part: "部分做对", no: "没做出", unsure: "待自评" };

  function records() {
    try { return (JSON.parse(localStorage.getItem(STORE) || "{}").problems) || {}; } catch (e) { return {}; }
  }
  function statusOf(r) {
    if (!r) return "";
    if (r.status === "ok" || r.status === "part" || r.status === "no") return r.status;
    return r.first ? "unsure" : "";
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // items: [{id, lv}]，按页面顺序；opts.current 当前题号；opts.href(id) 链接
  function render(box, items, opts) {
    opts = opts || {};
    var rec = records();
    box.innerHTML = "";
    var done = 0, indep = 0, counts = { ok: 0, part: 0, no: 0, unsure: 0 };
    items.forEach(function (it) {
      var r = rec[it.id], s = statusOf(r);
      it.s = s;
      if (r && r.first) done++;
      if (r && r.first === "ok" && !r.helped) indep++;
      if (s) counts[s]++;
    });
    var head = el("p", "pg-head");
    head.appendChild(el("strong", null, "已做 " + done + " / " + items.length));
    if (indep) head.appendChild(el("span", null, " · 首次独立做对 " + indep));
    box.appendChild(head);
    var bar = el("div", "pg-bar");
    bar.setAttribute("aria-hidden", "true");
    ["ok", "part", "no"].forEach(function (s) {
      if (!counts[s]) return;
      var i = el("i", "pg-" + s);
      i.style.width = (100 * counts[s] / Math.max(1, items.length)) + "%";
      bar.appendChild(i);
    });
    box.appendChild(bar);
    var lvs = [];
    items.forEach(function (it) { if (lvs.indexOf(it.lv) < 0) lvs.push(it.lv); });
    lvs.forEach(function (lv) {
      var rows = items.filter(function (it) { return it.lv === lv; });
      var row = el("div", "pg-row");
      var lab = el("p", "pg-lab");
      lab.appendChild(el("span", null, lv ? "F" + lv : "未评级"));
      lab.appendChild(el("span", null, rows.filter(function (it) { return rec[it.id] && rec[it.id].first; }).length + " / " + rows.length));
      row.appendChild(lab);
      var grid = el("div", "pg-grid");
      rows.forEach(function (it, k) {
        var a = el("a", "pg-cell" + (it.s ? " pg-" + it.s : "") + (it.id === opts.current ? " pg-cur" : ""));
        a.href = opts.href ? opts.href(it.id) : it.id + ".html";
        var name = (lv ? "F" + lv : "未评级") + " 第 " + (k + 1) + " 题" + (it.s ? "，" + WORD[it.s] : "，没做过");
        a.setAttribute("aria-label", name);
        a.title = name;
        if (it.id === opts.current) a.setAttribute("aria-current", "page");
        grid.appendChild(a);
      });
      row.appendChild(grid);
      box.appendChild(row);
    });
    var legend = el("p", "pg-legend");
    legend.innerHTML = '<i class="pg-cell pg-ok"></i>做对 <i class="pg-cell pg-part"></i>部分 <i class="pg-cell pg-no"></i>没做出 <i class="pg-cell"></i>没做过';
    box.appendChild(legend);
    return { done: done, total: items.length };
  }

  function initProblemRail() {
    var rail = document.getElementById("prail");
    var dataEl = document.getElementById("pdata");
    if (!rail || !dataEl) return;
    var P = JSON.parse(dataEl.textContent);
    if (!P.topic_items || !P.topic_items.length) { rail.hidden = true; return; }
    var items = P.topic_items.map(function (x) { return { id: x[0], lv: x[1] }; });
    var body = rail.querySelector(".pg-body");
    var pos = items.findIndex(function (it) { return it.id === P.id; });
    var cur = items[pos] || {};
    var same = items.filter(function (it) { return it.lv === cur.lv; });
    var sum = rail.querySelector("summary .pg-pos");
    if (sum) sum.textContent = (cur.lv ? "F" + cur.lv : "未评级") + " 第 " + (same.indexOf(cur) + 1) + " / " + same.length + " 题";
    function draw() { render(body, items, { current: P.id }); }
    draw();
    document.addEventListener("peiyu-record", function (e) { if (e.detail.id === P.id) draw(); });
    var wide = window.matchMedia ? window.matchMedia("(min-width: 1100px)") : null;
    var det = rail.querySelector("details");
    function sync() { if (det && wide) det.open = wide.matches; }
    if (wide) { if (wide.addEventListener) wide.addEventListener("change", sync); else if (wide.addListener) wide.addListener(sync); }
    sync();
  }

  function initTopicGrid() {
    var box = document.getElementById("topic-progress");
    if (!box) return;
    var items = Array.prototype.map.call(document.querySelectorAll(".lvgroup .plist li[data-id]"), function (li) {
      return { id: li.dataset.id, lv: Number(li.dataset.lv) || 0 };
    });
    if (!items.length) { box.hidden = true; return; }
    var r = render(box.querySelector(".pg-body") || box, items, { href: function (id) { return "../p/" + id + ".html"; } });
    box.hidden = !r.done; // 第一次来的学生不先看到一大片空格子
  }

  window.PeiyuProgress = { render: render };
  function init() { initProblemRail(); initTopicGrid(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.addEventListener("pageshow", function (e) { if (e.persisted) init(); });
}());
