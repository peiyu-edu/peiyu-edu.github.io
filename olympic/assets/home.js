/* 首页只读现有记录，合并学习路线、图谱与目标训练的最近未完成位置。 */
(function () {
  "use strict";
  var STORE = "peiyu.olympic.v1";
  function time(x) { var n = Date.parse(x); return Number.isFinite(n) ? n : 0; }
  // 训练外单独打开的题：待自评或还没作答的，首页也给「继续」；训练里的题由训练自己的位置负责。
  function problemPositions(data, meta) {
    var last = {}, done = ["ok", "no", "part"];
    (Array.isArray(data.log) ? data.log : []).forEach(function (e) { if (e && e.id) last[e.id] = e; });
    return Object.keys(data.problems || {}).map(function (id) {
      var p = data.problems[id], m = meta[id];
      if (!m || !p || typeof p !== "object" || !time(p.at) || (last[id] && last[id].training)) return null;
      var base = { at: p.at, fr: m.fr, href: "p/" + id + ".html" };
      // 与 app.js 一致：提交后 24 小时内的自评才接着原次作答。
      var age = Date.now() - time(p.reviewAttemptAt);
      if (p.reviewAwaitingSelf && age >= 0 && age < 86400000) return Object.assign(base, { text: m.topic + "：" + m.label + " · 已提交，待对照解答自评", action: "继续上次自评" });
      if (done.indexOf(p.status) < 0) return Object.assign(base, { text: m.topic + "：" + m.label, action: "回到上次题目" });
      return null;
    }).filter(Boolean);
  }
  function homeState(data, meta, positions) {
    var plan = window.PeiyuLearning.plan(meta, data, Date.now(), 8);
    var pending = positions.filter(function (p) { return p && time(p.at) && meta && /^FR\d{3}$/.test(p.fr); });
    pending.sort(function (a, b) { return time(b.at) - time(a.at); });
    var recent = Object.keys(data.problems || {}).filter(function (id) { return meta[id] && data.problems[id]; })
      .map(function (id) { var p = data.problems[id]; return { fr: meta[id].fr, at: p.at || p.firstAt }; })
      .concat(positions).filter(function (p) { return time(p.at); }).sort(function (a, b) { return time(b.at) - time(a.at); })[0];
    return { returning: plan.studied > 0 || positions.length > 0, resume: pending[0], recent: recent, plan: plan };
  }
  function render() {
    var home = document.getElementById("home-state"), api = window.PeiyuOlympic, meta = window.PEIYU_PROBLEMS;
    if (!home || !api || !meta || !window.PeiyuLearning) return;
    var data = { problems: {}, log: [] }, positions = [];
    try {
      // api.load has a per-page fallback; an unreadable store always gets the new visitor card.
      localStorage.getItem(STORE); data = api.load();
      [window.PeiyuStudy, window.PeiyuGraph, window.PeiyuTraining].forEach(function (provider) {
        if (provider && provider.recent) positions = positions.concat(provider.recent(data));
      });
      positions = positions.concat(problemPositions(data, meta));
    } catch (e) { data = { problems: {}, log: [] }; positions = []; }
    var state = homeState(data, meta, positions);
    document.getElementById("home-new").hidden = state.returning;
    document.getElementById("home-return").hidden = !state.returning;
    var resume = document.getElementById("home-resume"), link = document.getElementById("home-resume-link");
    resume.hidden = !state.resume;
    document.getElementById("home-next-goal").hidden = !!state.resume;
    if (state.resume) {
      document.getElementById("home-resume-description").textContent = state.resume.text;
      link.href = state.resume.href; link.textContent = state.resume.action || "继续";
    } else { link.removeAttribute("href"); }
    var review = document.getElementById("home-review-link"); review.href = "today.html";
    review.className = state.plan.due ? "btn" : "pill";
    review.textContent = state.plan.due ? "开始复习" : "做一组交错练习";
    document.getElementById("home-review-description").textContent = state.plan.due ?
      "有 " + state.plan.due + " 道真题到期了，先试着独立重做。" : "今天没有到期的题，可以做一组交错练习。";
    var recent = document.getElementById("home-recent"), fr = state.recent && state.recent.fr;
    // 「再选一个目标」：最近学的专题排第一，其余按推荐顺序；有题到期时主按钮留给复习。
    var goals = Array.from(document.querySelectorAll("#home-next-goal [data-fr]"));
    goals.sort(function (a, b) { return (a.dataset.fr === fr ? -1 : +a.dataset.order) - (b.dataset.fr === fr ? -1 : +b.dataset.order); })
      .forEach(function (a) { a.className = a.dataset.fr === fr && !state.plan.due ? "btn" : "pill"; a.parentNode.append(a); });
    var card = fr && document.querySelector('[data-topic="' + fr + '"]');
    recent.hidden = !card;
    if (card) {
      document.getElementById("home-recent-name").textContent = card.querySelector('.t').textContent;
      document.getElementById("home-recent-link").href = card.getAttribute("href");
    }
    document.querySelectorAll('[data-topic]').forEach(function (card) {
      var ids = Object.keys(meta).filter(function (id) { return meta[id].fr === card.dataset.topic; });
      var done = ids.filter(function (id) { return data.problems[id] && data.problems[id].first; }).length;
      card.querySelector('.n').textContent = done ? "已做 " + done + " / " + ids.length : card.dataset.topicCount;
    });
  }
  window.PeiyuHome = { state: homeState, problems: problemPositions };
  function init() {
    render(); window.addEventListener("pageshow", render);
    window.addEventListener("storage", function (e) { if (e.key === STORE || e.key === null) render(); });
  }
  if (document.readyState === "complete") init(); else document.addEventListener("DOMContentLoaded", init, { once: true });
})();
