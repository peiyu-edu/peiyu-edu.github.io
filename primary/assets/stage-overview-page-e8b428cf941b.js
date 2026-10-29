(function () {
  "use strict";
  var catalog = JSON.parse(document.getElementById("overview-data").textContent);
  var host = document.getElementById("overview-stages"), storage = null;
  var previous = "";
  try { storage = window.localStorage; } catch (_) { /* Show the explicit unreadable state. */ }
  function element(tag, text, cls) {
    var node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  }
  function link(text, path, cls) { var node = element("a", text, cls); node.href = path; return node; }
  function render() {
    var stages = window.PeiyuStageOverview.summarize(catalog, storage, Date.now());
    var current = JSON.stringify(stages);
    if (current === previous) return;
    previous = current;
    var focused = document.activeElement && host.contains(document.activeElement) && document.activeElement.getAttribute("href");
    host.replaceChildren();
    stages.forEach(function (stage) {
      var card = element("article", undefined, "overview-card"); card.dataset.stage = stage.id;
      var heading = element("div", undefined, "overview-card-head");
      heading.append(element("h2", stage.title));
      if (stage.available) heading.append(link("本学段记录", stage.record));
      card.append(heading);
      if (stage.status === "unavailable") {
        card.append(element("p", "此学段暂未接入本站，接入后会在这里显示。", "overview-note"));
        host.append(card); return;
      }
      if (stage.status === "unreadable") card.append(element("p", "暂时无法读取此学段的本机记录。可以进入学段查看，原记录保持原样。", "overview-note"));
      else if (stage.status === "partial") card.append(element("p", "部分历史记录不完整，以下只列可确认的信息。", "overview-note"));
      var count = stage.due === null ? "暂不能确定" : (stage.status === "partial" ? "至少 " : "") + stage.due + " 道";
      var review = element("p", undefined, "overview-due");
      review.append(element("span", "待复习"), element("strong", count)); card.append(review);
      if (stage.recent) {
        card.append(element("p", "最近学到", "overview-label"), element("h3", stage.recent.title));
        var time = element("time", new Date(stage.recent.time).toLocaleString("zh-CN"));
        time.dateTime = new Date(stage.recent.time).toISOString(); card.append(time);
      } else if (stage.status !== "unreadable") card.append(element("p", "还没有可显示的学习位置。", "overview-note"));
      var actions = element("div", undefined, "overview-actions");
      actions.append(link(stage.recent ? "继续学习" : "进入学段", stage.recent ? stage.recent.href : stage.home, "overview-button"));
      if (stage.due > 0) actions.append(link("查看复习", stage.record));
      card.append(actions); host.append(card);
    });
    if (focused) Array.from(host.querySelectorAll("a")).find(function (a) { return a.getAttribute("href") === focused; })?.focus({preventScroll: true});
  }
  var theme = document.getElementById("overview-theme");
  function readTheme() {
    try {
      var value = storage && storage.getItem("peiyu.hs.theme");
      if (value === "dark" || value === "light") document.documentElement.dataset.theme = value;
    } catch (_) { /* Use the system theme. */ }
    updateTheme();
  }
  function updateTheme() {
    var dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    theme.setAttribute("aria-pressed", String(dark)); theme.textContent = dark ? "浅色模式" : "深色模式";
  }
  theme.addEventListener("click", function () {
    document.documentElement.dataset.theme = theme.getAttribute("aria-pressed") === "true" ? "light" : "dark";
    updateTheme();
  });
  window.addEventListener("pageshow", render);
  window.addEventListener("storage", function (event) {
    if (event.key === "peiyu.hs.theme") readTheme();
    if (event.key === null || /^peiyu\.(ps|jh|hs|olympic)\./.test(event.key || "")) render();
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });
  window.setInterval(render, 60000);
  readTheme(); render();
})();
