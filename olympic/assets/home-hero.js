// 首页主视觉：拖动点 C，看 √ab 与 (a+b)/2 的关系（PY-186）。
// 几何与 tools/home_figure.py 一致：a + b = 4，1 单位 = data-unit px，圆心 (ox, oy)。
(function () {
  "use strict";
  function init() {
    var fig = document.querySelector(".home-figure");
    if (!fig) return;
    var svg = fig.querySelector("svg"), handle = fig.querySelector("#hf-handle");
    var U = +fig.dataset.unit, OX = +fig.dataset.ox, OY = +fig.dataset.oy, R = 2 * U, L = OX - R, RT = OX + R;
    var $ = function (id) { return fig.querySelector("#" + id); };
    var readout = $("hf-readout"), touched = false, a = 1;
    function fmt(x, d) { return String(parseFloat(x.toFixed(d || 2))); }
    function draw(v) {
      a = Math.min(3.9, Math.max(0.1, v));
      var b = 4 - a, cx = L + a * U, g = Math.sqrt(a * b), dy = OY - g * U, eq = Math.abs(a - 2) < 1e-9;
      $("hf-chords").setAttribute("d", "M" + L + " " + OY + "L" + cx + " " + dy + "L" + RT + " " + OY);
      $("hf-cd").setAttribute("d", "M" + cx + " " + OY + "V" + dy);
      $("hf-right").setAttribute("d", "M" + (cx - 10) + " " + OY + "v-10h10");
      $("hf-sa").setAttribute("d", "M" + L + " " + (OY + 22) + "H" + cx);
      $("hf-sb").setAttribute("d", "M" + cx + " " + (OY + 22) + "H" + RT);
      $("hf-la").setAttribute("x", (L + cx) / 2); $("hf-la").style.opacity = a < 0.45 ? 0 : 1;
      $("hf-lb").setAttribute("x", (cx + RT) / 2); $("hf-lb").style.opacity = b < 0.45 ? 0 : 1;
      var lg = $("hf-lg"), right = a > 2.6;
      lg.setAttribute("x", right ? cx + 10 : cx - 10); lg.setAttribute("text-anchor", right ? "start" : "end");
      lg.setAttribute("y", (OY + dy) / 2); lg.style.opacity = g < 0.5 ? 0 : 1;
      $("hf-d").setAttribute("cx", cx); $("hf-d").setAttribute("cy", dy);
      $("hf-nd").setAttribute("x", cx); $("hf-nd").setAttribute("y", dy - 12);
      handle.querySelectorAll("circle").forEach(function (c) { c.setAttribute("cx", cx); });
      handle.querySelector("text").setAttribute("x", cx + 11);
      fig.classList.toggle("is-equal", eq);
      handle.setAttribute("aria-valuenow", fmt(a));
      handle.setAttribute("aria-valuetext", "a = " + fmt(a) + "，b = " + fmt(b));
      readout.textContent = eq ? "a = b = 2：√ab = 2 = (a+b)/2，C 在圆心时取等" :
        "a = " + fmt(a) + "，b = " + fmt(b) + "：√ab ≈ " + fmt(g, 3) + " < 2 = (a+b)/2";
    }
    // 拖动与开场动画在圆心附近吸附，避免把 1.999 显示成取等。
    function snap(v) { return Math.abs(v - 2) < 0.06 ? 2 : v; }
    function toA(evt) {
      var pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
      var m = svg.getScreenCTM(); if (!m) return a;
      return snap((pt.matrixTransform(m.inverse()).x - L) / U);
    }
    var dragging = false;
    svg.addEventListener("pointerdown", function (e) {
      touched = true; dragging = true; svg.setPointerCapture(e.pointerId); draw(toA(e)); e.preventDefault();
    });
    svg.addEventListener("pointermove", function (e) { if (dragging) draw(toA(e)); });
    ["pointerup", "pointercancel"].forEach(function (t) { svg.addEventListener(t, function () { dragging = false; }); });
    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 0.5 : 0.1, map = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step };
      if (e.key in map) { touched = true; draw(Math.round((a + map[e.key]) * 10) / 10); e.preventDefault(); }
      else if (e.key === "Home") { touched = true; draw(0.1); e.preventDefault(); }
      else if (e.key === "End") { touched = true; draw(3.9); e.preventDefault(); }
    });
    draw(1);
    // 首次进入轻轻来回滑一次，提示可以拖；用户一碰就停，减少动效时不动。
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var t0 = null, dur = 4200;
    function tick(ts) {
      if (touched) return;
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), s = (1 - Math.cos(p * 2 * Math.PI)) / 2;
      draw(snap(1 + s));
      if (p < 1) requestAnimationFrame(tick);
    }
    setTimeout(function () { if (!touched) requestAnimationFrame(tick); }, 900);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
