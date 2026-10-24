/* 学生版教材路线层：只显示自编导航，不复制教材正文。 */
(function () {
  "use strict";
  if (!document.body || !window.fetch) return;
  var sid = document.body.getAttribute("data-sec");
  if (!sid) return;
  var current = document.currentScript;
  var base = current && current.src ? current.src : "../assets/student-textbook.js";
  var mapUrl = new URL("../data/textbook-route.json", base).href;
  var DEFAULT_ROUTE = ["生活或图形问题", "概念与表示", "性质/公式及条件", "示范例题", "自己练习", "回看前置并反思"].join("|");
  function list(value) { return Array.isArray(value) ? value : []; }
  function addStyle() {
    if (document.getElementById("student-route-style")) return;
    var style = document.createElement("style");
    style.id = "student-route-style";
    style.textContent = [
      ".student-route{margin:14px 0 20px;padding:14px 16px;border:1px solid var(--line);border-left:4px solid var(--a);border-radius:var(--radius);background:var(--card);color:var(--fg)}",
      ".student-route h2{font-size:17px;margin:0 0 8px}",
      ".student-route p{margin:6px 0;line-height:1.6}",
      ".student-route .route-meta{color:var(--muted);font-size:14px}",
      ".student-route .route-row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}",
      ".student-route .route-pill{display:inline-block;padding:3px 8px;border:1px solid var(--line);border-radius:999px;background:var(--bg);font-size:14px}",
      ".student-route .route-pill.optional{border-color:var(--hl);color:var(--hl)}",
      ".student-route ul{margin:6px 0 0;padding-left:20px}",
      ".student-route .route-actions{margin-top:8px;font-size:14px}",
      ".student-route a{color:var(--a)}"
    ].join("");
    document.head.appendChild(style);
  }
  function render(data) {
    var sections = {};
    if (Array.isArray(data)) {
      data.forEach(function (row) { if (row && row.id) sections[row.id] = row; });
    } else {
      sections = data && data.sections ? data.sections : (data || {});
    }
    var item = sections[sid];
    if (!item || document.querySelector("[data-student-route]")) return;
    addStyle();
    var aside = document.createElement("aside");
    aside.className = "student-route";
    aside.setAttribute("data-student-route", "true");
    aside.setAttribute("aria-label", "本节学习路线");
    var heading = document.createElement("h2");
    heading.textContent = "本节路线" + (item.optional || item.level === "optional" ? " · 选学" : "");
    aside.appendChild(heading);
    // 大多数节的路线都一样，页面上方已经有步骤；只在路线与众不同时才列出来。
    var steps = list(item.route);
    if (steps.length && steps.join("|") !== DEFAULT_ROUTE) {
      var route = document.createElement("div");
      route.className = "route-row";
      steps.forEach(function (label) {
        var pill = document.createElement("span");
        pill.className = "route-pill";
        pill.textContent = label;
        route.appendChild(pill);
      });
      aside.appendChild(route);
    }
    if (list(item.concepts).length) {
      var focus = document.createElement("p");
      focus.textContent = "本节先抓住：" + list(item.concepts).slice(0, 4).join("、");
      aside.appendChild(focus);
    }
    var optional = list(item.core_vs_optional && item.core_vs_optional.optional);
    if (optional.length) {
      var extension = document.createElement("p");
      extension.className = "route-meta";
      extension.textContent = "可选延伸：" + optional.slice(0, 2).join("、");
      aside.appendChild(extension);
    }
    // 前置节已写在每节「要用到」一行里，这里不再重复。
    if (list(item.student_checks).length) {
      var checks = document.createElement("p");
      checks.className = "route-meta";
      checks.textContent = "学完自检：" + list(item.student_checks).slice(0, 2).join("；");
      aside.appendChild(checks);
    }
    var actions = document.createElement("p");
    actions.className = "route-actions";
    var map = document.createElement("a");
    map.href = "../textbook-map.html#" + encodeURIComponent(sid);
    map.textContent = "查看全册路线 →";
    actions.appendChild(map);
    aside.appendChild(actions);
    var lead = document.querySelector(".lead");
    var firstStep = document.querySelector("section.step");
    var parent = (lead && lead.parentNode) || (firstStep && firstStep.parentNode);
    if (!parent) return;
    if (lead && lead.nextSibling) parent.insertBefore(aside, lead.nextSibling);
    else if (firstStep) parent.insertBefore(aside, firstStep);
    else parent.appendChild(aside);
  }
  fetch(mapUrl).then(function (response) {
    if (!response.ok) throw new Error("student textbook map: " + response.status);
    return response.json();
  }).then(render).catch(function () {
    /* 导航层缺失时不阻断原有课程页。 */
  });
}());
