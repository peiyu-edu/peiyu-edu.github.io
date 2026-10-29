/* 培玉 · 一试站：专题页目录与方法卡折叠（PY-179）。
   顶部目录随页面滚动固定，并高亮当前所在小节；跳到某张方法卡时自动展开它。 */
(function () {
  "use strict";
  function openCard(hash) {
    if (!hash || hash.length < 2) return;
    var target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return; }
    if (!target) return;
    var fold = target.classList.contains("mcard") ? target.querySelector("details.mfold") : null;
    if (fold && !fold.open) { fold.open = true; target.scrollIntoView(); }
  }
  function init() {
    var toc = document.querySelector("nav.topic-toc");
    if (toc) {
      toc.classList.add("is-sticky");
      var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
      var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
      var spy = function () {
        var y = toc.getBoundingClientRect().bottom + 8, cur = -1;
        targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= y) cur = i; });
        links.forEach(function (a, i) {
          if (i === cur) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
        });
      };
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { ticking = false; spy(); });
      }, { passive: true });
      spy();
    }
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function () { openCard(a.getAttribute("href")); });
    });
    window.addEventListener("hashchange", function () { openCard(location.hash); });
    openCard(location.hash);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
}());
