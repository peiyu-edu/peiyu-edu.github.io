/* 培玉 · 高中数学互动站 — 讲解视频（点了才加载）。
   页面里放占位 <div class="vid" data-video="concept"></div>，并引入本脚本。
   视频清单在 ../data/videos.json：sections[<节 id>][<占位名>] = {label, title, src, dur}。
   src 相对 base，base 相对 videos.json。清单里没有的占位直接去掉，页面照常。
   播放记进 lesson.js 同一个做题记录（kind "video"，choice 为 "play" 或 "watch:<看到第几秒>/<总秒数>"）。 */
(function () {
  "use strict";

  var LOG_KEY = "peiyu.hs.log";
  var sec = document.body.getAttribute("data-sec") || "";
  function log(id, choice) {
    try {
      var all = JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
      all.push({ t: Date.now(), sec: sec, kind: "video", id: id, choice: choice });
      if (all.length > 5000) all = all.slice(-5000);
      localStorage.setItem(LOG_KEY, JSON.stringify(all));
    } catch (e) { /* 存不了就不记 */ }
  }

  var css = document.createElement("style");
  css.textContent = [
    ".vid { margin: 12px 0 16px; }",
    ".vid-btn { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; font: inherit; color: var(--fg);",
    "  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 10px 14px; cursor: pointer; min-height: 56px; }",
    ".vid-btn:hover { border-color: var(--c); }",
    ".vid-btn:focus-visible { outline: 3px solid var(--hl); outline-offset: 2px; }",
    ".vid-play { flex: none; width: 36px; height: 36px; border-radius: 50%; background: var(--c); color: #fff;",
    "  display: flex; align-items: center; justify-content: center; font-size: 15px; padding-left: 3px; box-sizing: border-box; }",
    ".vid-txt { display: flex; flex-direction: column; min-width: 0; }",
    ".vid-txt b { font-size: 16px; }",
    ".vid-txt span { font-size: 15px; color: var(--muted); }",
    ".vid-txt i { font-style: normal; white-space: nowrap; }",
    ".vid-box { border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; background: #000; }",
    ".vid-box video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; background: #000; }",
    ".vid-bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 6px; font-size: 15px; color: var(--muted); }",
    ".vid-bar button { font: inherit; font-size: 15px; color: var(--c); background: none; border: none; cursor: pointer; padding: 4px 0; min-height: 36px; }",
    ".vid-err { color: var(--no); font-size: 15px; margin: 6px 0 0; }"
  ].join("\n");
  document.head.appendChild(css);

  function minutes(s) { return s ? "约 " + Math.max(1, Math.round(s / 60)) + " 分钟" : ""; }

  function button(box, id, v, url) {
    box.innerHTML = "";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "vid-btn";
    b.innerHTML = '<span class="vid-play" aria-hidden="true">▶</span><span class="vid-txt"><b></b><span></span></span>';
    b.querySelector("b").textContent = v.label || "看讲解视频";
    var sub = b.querySelector(".vid-txt span");
    sub.textContent = v.title || "";
    if (v.dur) {
      var m = document.createElement("i");
      m.textContent = (v.title ? " · " : "") + minutes(v.dur);
      sub.appendChild(m);
    }
    b.onclick = function () { player(box, id, v, url); };
    box.appendChild(b);
  }

  function player(box, id, v, url) {
    box.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "vid-box";
    var el = document.createElement("video");
    el.controls = true;
    el.playsInline = true;
    el.setAttribute("playsinline", "");
    el.preload = "metadata";
    el.src = url;
    wrap.appendChild(el);
    box.appendChild(wrap);

    var bar = document.createElement("div");
    bar.className = "vid-bar";
    bar.innerHTML = "<span></span><button type=\"button\">收起视频</button>";
    bar.querySelector("span").textContent = v.title || "";
    box.appendChild(bar);

    var maxT = 0, logged = 0, started = false;
    // 只记「看到第几秒」：暂停时比上次多 10 秒以上才记；播完、收起、离开页面时都记
    function watched(force) {
      var t = Math.round(maxT);
      if (t > logged && (force === true || t - logged >= 10)) { logged = t; log(id, "watch:" + t + "/" + Math.round(el.duration || v.dur || 0)); }
    }
    function done() { watched(true); }
    el.addEventListener("play", function () { if (!started) { started = true; log(id, "play"); } });
    el.addEventListener("timeupdate", function () { if (el.currentTime > maxT) maxT = el.currentTime; });
    el.addEventListener("pause", watched);
    el.addEventListener("ended", done);
    window.addEventListener("pagehide", done);
    el.addEventListener("error", function () {
      if (box.querySelector(".vid-err")) return;
      var p = document.createElement("p");
      p.className = "vid-err";
      p.textContent = "视频暂时打不开，先看下面的文字讲解。";
      box.appendChild(p);
    });
    bar.querySelector("button").onclick = function () {
      done();
      window.removeEventListener("pagehide", done);
      el.pause();
      el.removeAttribute("src");
      el.load();
      button(box, id, v, url);
    };

    var p = el.play();
    if (p && p.catch) p.catch(function () { /* 浏览器不让自动播放，学生再点一下即可 */ });
  }

  function init() {
    var slots = document.querySelectorAll(".vid[data-video]");
    if (!slots.length) return;
    var listUrl = new URL("../data/videos.json", document.baseURI).href;
    fetch(listUrl).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (data) {
      var mine = (data.sections || {})[sec] || {};
      var base = new URL(data.base || "", listUrl).href;
      Array.prototype.forEach.call(slots, function (box) {
        var id = box.getAttribute("data-video"), v = mine[id];
        if (!v || !v.src) { box.remove(); return; }
        button(box, id, v, new URL(v.src, base).href);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
