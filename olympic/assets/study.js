/* 自编学习路线的位置与练习反馈；不把阅读、自测选择记作真题成绩。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1";
  var steps = { try: "先试一题", example: "看想法怎样产生", checks: "辨清条件", transfer: "换题试一试", practice: "接着练真题" };
  function object(x) { return !!x && typeof x === "object" && !Array.isArray(x); }
  function time(x) { var n = Date.parse(x); return Number.isFinite(n) ? n : 0; }

  function recent(data) {
    var position = data.studyPosition, home = document.querySelector("[data-home-study-revision]");
    if (!object(position) || position.fr !== "FR008" || !Object.hasOwn(steps, position.step) ||
        !home || position.revision !== home.dataset.homeStudyRevision || !time(position.at)) return [];
    var ids = home.dataset.studyPractice.split(" ");
    if (position.step === "practice" && ids.every(function (id) { return data.problems[id] && ["ok", "no", "part"].includes(data.problems[id].status); })) return [];
    return [{ at: position.at, fr: position.fr, href: "s/FR008.html#study-" + position.step,
      text: "不等式的证明 · " + steps[position.step] }];
  }
  window.PeiyuStudy = { recent: recent };

  function initRoute(api) {
    var route = document.querySelector("[data-study-route]");
    if (!route) return;
    function remember(step) {
      if (!Object.hasOwn(steps, step)) return;
      var data = api.load();
      data.studyPosition = { fr: route.dataset.studyRoute, revision: route.dataset.studyRevision, step: step, at: new Date().toISOString() };
      var message = document.getElementById("study-save-message");
      try {
        localStorage.setItem(STORE, JSON.stringify(data));
        message.textContent = "已记住位置：" + steps[step] + "，下次可从首页接着看。";
      } catch (e) {
        message.textContent = "当前浏览器无法保存位置。可以继续练习，下次请从学习路线重新进入。";
      }
      route.querySelectorAll(".study-route-nav a").forEach(function (a) {
        if (a.hash === "#study-" + step) a.setAttribute("aria-current", "step");
        else a.removeAttribute("aria-current");
      });
    }
    function saveHash() { var step = location.hash.replace(/^#study-/, ""); if (Object.hasOwn(steps, step)) remember(step); }
    window.addEventListener("hashchange", saveHash);
    route.addEventListener("click", function (e) {
      var section = e.target.closest("[data-study-step]");
      if (section) remember(section.dataset.studyStep);
    });
    route.querySelectorAll("[data-study-quiz]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var choice = form.querySelector("input:checked");
        if (!choice) return;
        form.querySelectorAll("[data-feedback]").forEach(function (feedback) { feedback.hidden = feedback.dataset.feedback !== choice.value; });
        form.querySelector(".study-result").dataset.correct = String(choice.value === form.dataset.correct);
        remember(form.closest("[data-study-step]").dataset.studyStep);
      });
    });
    var slider = document.getElementById("study-bound");
    function explore() {
      var m = Number(slider.value), point = m <= 4 ? 4 : m;
      document.getElementById("study-bound-value").value = String(m);
      var values = { 1: "8", 2: "8", 3: "8", 4: "8", 5: "41/5", 6: "26/3", 7: "65/7", 8: "10" };
      document.getElementById("study-bound-result").textContent = "x ≥ " + m + "：" +
        (m <= 4 ? "x = 4 仍合法" : "原来的 x = 4 已不合法") + "，最小值为 " + values[m] + "，在 x = " + point + " 取得。";
      var line = route.querySelector(".study-numberline");
      line.style.setProperty("--bound", (m / 10 * 100) + "%");
      line.dataset.excluded = String(m > 4);
      line.setAttribute("aria-label", "数轴上，允许范围从" + m + "开始，原等号位置4" + (m > 4 ? "不在" : "位于") + "允许范围内");
    }
    slider.addEventListener("input", function () { explore(); remember("example"); });
    explore();
    saveHash();
  }

  function redirectLegacy() {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.dataset.studyRedirect) {
      location.replace(new URL(target.dataset.studyRedirect, location.href).href);
    }
  }
  window.addEventListener("hashchange", redirectLegacy);

  function init() {
    redirectLegacy();
    var api = window.PeiyuOlympic, meta = window.PEIYU_PROBLEMS;
    if (!api) return;
    initRoute(api);
    if (meta && window.PeiyuLearning) {
      var starter = document.getElementById("today-start");
      if (starter) starter.hidden = window.PeiyuLearning.plan(meta, api.load(), Date.now(), 8).studied > 0;
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
