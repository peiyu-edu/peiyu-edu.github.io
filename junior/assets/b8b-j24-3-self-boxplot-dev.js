(function () {
  "use strict";
  if (!document.body || document.body.dataset.sec !== "j24-3") return;
  var root = document.getElementById("self-boxplot-work");
  if (!root || root.dataset.selfBoxplotReady) return;
  root.dataset.selfBoxplotReady = "1";
  var $ = function (id) { return root.querySelector("#sb-" + id); }, names = ["最小值", "Q₁", "Q₂", "Q₃", "最大值"], fiveIds = ["min", "q1", "q2", "q3", "max"], state = null, points = [], parts = {}, pending = [];
  var partNames = { box: "箱体", median: "中位线", left: "左须线", right: "右须线" }, ns = "http://www.w3.org/2000/svg";
  function number(raw) { var s = raw.trim(); if (!/^-?(0|[1-9][0-9]{0,2})(\.[0-9]{1,2})?$/.test(s)) return null; var p = s.replace(/^-/, "").split("."), v = Number(p[0]) * 100 + Number(((p[1] || "") + "00").slice(0, 2)); return s[0] === "-" ? -v : v; }
  function show(v) { if (v === 0) return "0"; var a = Math.abs(v), f = String(a % 100).padStart(2, "0").replace(/0+$/, ""); return (v < 0 ? "-" : "") + Math.floor(a / 100) + (f ? "." + f : ""); }
  function feedback(s) { $("feedback").textContent = s; }
  function changed() { feedback("图或说明已变化，请重新核对；自由文字不自动判正确。"); }
  function node(tag, attrs, parent) { var e = document.createElementNS(ns, tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); parent.append(e); return e; }
  function line(parent, a, b, attrs) { return node("line", Object.assign({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--fg)", "stroke-width": 2.5 }, attrs || {}), parent); }
  function text(parent, x, y, s, anchor) { var t = node("text", { x: x, y: y, fill: "var(--fg)", "font-size": 18, "text-anchor": anchor || "middle" }, parent); t.textContent = s; }
  function X(v) { return 48 + (v - state.lo) * 464 / (state.hi - state.lo); }
  function eraseGraph() { state = null; points = []; parts = {}; pending = []; $("fig").replaceChildren(); $("plan").textContent = "五数或刻度已变化，请重新建立刻度。"; changed(); }
  fiveIds.forEach(function (id, i) { var label = document.createElement("label"), input = document.createElement("input"); label.textContent = names[i] + " "; input.id = "sb-" + id; input.size = 7; input.maxLength = 8; input.inputMode = "decimal"; input.autocomplete = "off"; input.oninput = eraseGraph; label.append(input); $("five").append(label); });
  ["lo", "hi", "step"].forEach(function (id) { $(id).oninput = eraseGraph; });
  function given(values) { values.forEach(function (v, i) { $(fiveIds[i]).value = v; }); eraseGraph(); }
  $("given").onclick = function () { given(["-4", "-1.5", "0", "2.5", "6"]); };
  $("flat").onclick = function () { given(["0", "3", "3", "3", "7"]); };
  $("equal").onclick = function () { given(["2", "2", "2", "2", "2"]); };
  function draw() {
    var svg = $("fig"); svg.replaceChildren(); if (!state) return;
    line(svg, [48, 430], [512, 430]);
    for (var k = 0; k <= state.intervals; k++) { var v = state.lo + k * state.step, x = X(v); line(svg, [x, 425], [x, 435], { "stroke-width": 1.5 }); if (k === 0 || k === state.intervals || k === Math.floor(state.intervals / 2)) text(svg, x, 474, show(v), k === 0 ? "start" : k === state.intervals ? "end" : "middle"); }
    Object.keys(parts).forEach(function (kind) {
      var values = parts[kind].map(function (i) { return points[i]; }), a = X(Math.min.apply(null, values)), b = X(Math.max.apply(null, values));
      if (kind === "box" && a === b) line(svg, [a, 42], [a, 84], { stroke: "var(--a)", "stroke-width": 3, "data-part": kind });
      else if (kind === "box") { node("rect", { x: a, y: 42, width: b - a, height: 42, fill: "var(--a)", "fill-opacity": 0.15, stroke: "var(--a)", "stroke-width": 3, "data-part": kind }, svg); }
      else if (kind === "median") line(svg, [a, 42], [a, 84], { stroke: "var(--no)", "stroke-width": 3, "data-part": kind });
      else { line(svg, [a, 63], [b, 63], { stroke: "var(--a)", "data-part": kind }); var end = kind === "left" ? a : b; line(svg, [end, 45], [end, 81], { stroke: "var(--a)" }); }
    });
    points.forEach(function (v, i) { if (v === null || v === undefined) return; var x = X(v), y = 130 + i * 56;
      line(svg, [x, y + 10], [x, 419], { stroke: "var(--muted)", "stroke-dasharray": "3 5", "stroke-width": 1 });
      var g = node("g", { tabindex: 0, role: "button", "aria-label": "选用" + names[i] + "标记", "data-marker": i, "aria-pressed": String(pending.includes(i)), style: "cursor:pointer" }, svg);
      node("circle", { cx: x, cy: y, r: 11, fill: "var(--card)", stroke: "var(--a)", "stroke-width": 3 }, g);
      text(svg, x < 260 ? x + 19 : x - 19, y + 6, names[i], x < 260 ? "start" : "end");
      g.onclick = function (e) { e.stopPropagation(); choose(i); }; g.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); choose(i); } };
    });
    $("plan").textContent = "每小格 " + show(state.step) + "；我已描：" + names.map(function (name, i) { return name + "=" + (points[i] === null ? "未描" : show(points[i])); }).join("，") + "。已画：" + (Object.keys(parts).map(function (k) { return partNames[k] + "(" + parts[k].map(function (i) { return names[i]; }).join("、") + ")"; }).join("；") || "无") + (pending.length ? "；已选端点：" + pending.map(function (i) { return names[i]; }).join("、") : "");
  }
  $("axis").onclick = function () {
    var values = fiveIds.map(function (id) { return number($(id).value); }), lo = number($("lo").value), hi = number($("hi").value), step = number($("step").value);
    if (values.some(function (v) { return v === null; }) || lo === null || hi === null || step === null) { feedback("五数和刻度都须符合上方整数/小数语法，尚未建立图。"); return; }
    if (values.some(function (v, i) { return i && v < values[i - 1]; })) { feedback("五数顺序错误：须从最小值到最大值不减，允许相等；请修正，不自动排序。"); return; }
    if (lo >= hi || step <= 0 || (hi - lo) % step !== 0 || (hi - lo) / step > 20) { feedback("刻度须起点小于终点、间隔为正，并正好分成1～20个等长小格。"); return; }
    if (lo > values[0] || hi < values[4]) { feedback("这条数轴没有覆盖五数，请扩大起止范围。"); return; }
    state = { values: values, lo: lo, hi: hi, step: step, intervals: (hi - lo) / step }; points = [null, null, null, null, null]; parts = {}; pending = []; $("marker").value = $("part").value = $("position").value = ""; changed(); draw();
  };
  function place(v) { if (!state || $("marker").value === "") { feedback("先建立刻度并选择要描的标记。"); return; } if (v === null || v < state.lo || v > state.hi) { feedback("所描位置须符合语法且在本次数轴范围内；图未改。"); return; } points[Number($("marker").value)] = v; pending = []; changed(); draw(); }
  $("place").onclick = function () { place(number($("position").value)); };
  $("unplace").onclick = function () { if (!state || $("marker").value === "") return; var i = Number($("marker").value); points[i] = null; Object.keys(parts).forEach(function (k) { if (parts[k].includes(i)) delete parts[k]; }); pending = []; changed(); draw(); };
  $("fig").onpointerdown = function (e) { if (!state || e.target.closest("[data-marker]")) return; var m = $("fig").getScreenCTM(); if (!m) return; var p = $("fig").createSVGPoint(); p.x = e.clientX; p.y = e.clientY; p = p.matrixTransform(m.inverse()); if (p.x < 48 || p.x > 512 || Math.abs(p.y - 430) > 15) return; e.preventDefault(); place(Math.round(state.lo + (p.x - 48) * (state.hi - state.lo) / 464)); };
  $("fig").onkeydown = function (e) { if (e.target !== $("fig") || !state || $("marker").value === "") return; var i = Number($("marker").value), old = points[i] === null ? state.lo : points[i], delta = e.shiftKey ? state.step : 1, v;
    if (e.key === "Home") v = state.lo; else if (e.key === "End") v = state.hi; else if (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(e.key)) v = old + (["ArrowLeft", "ArrowDown"].includes(e.key) ? -delta : delta); else return; e.preventDefault(); place(Math.max(state.lo, Math.min(state.hi, v))); $("fig").focus({ preventScroll: true }); };
  function choose(i) { var kind = $("part").value; if (!kind) { feedback("先选要画的构件，再点已描标记。"); return; } pending.push(i); changed(); if (pending.length === (kind === "median" ? 1 : 2)) { parts[kind] = pending.slice(); pending = []; } draw(); var button = $("fig").querySelector('[data-marker="' + i + '"]'); if (button) button.focus({ preventScroll: true }); }
  $("part").onchange = function () { pending = []; changed(); draw(); }; $("marker").onchange = function () { changed(); }; $("position").oninput = changed; $("why").oninput = changed;
  $("erase").onclick = function () { delete parts[$("part").value]; pending = []; changed(); draw(); };
  $("check").onclick = function () {
    if (!state || points.length !== 5 || points.some(function (v) { return v === null; })) { feedback("先定刻度并亲自描齐五个标记，再核对。"); return; }
    var wrong = points.findIndex(function (v, i) { return v !== state.values[i]; }); if (wrong >= 0) { feedback(names[wrong] + "的描点位置与给定值不一致，请沿同一数轴重查刻度。"); return; }
    var expected = { box: [1, 3], median: [2], left: [0, 1], right: [3, 4] };
    for (var kind of Object.keys(expected)) { if (!parts[kind]) { feedback("还未亲自画出" + partNames[kind] + "，请选构件和标记。"); return; } var got = parts[kind].map(function (i) { return points[i]; }).sort(function (a, b) { return a - b; }), want = expected[kind].map(function (i) { return state.values[i]; }); if (got.some(function (v, i) { return v !== want[i]; })) { feedback(partNames[kind] + "的端点位置不对，请重画；相同位置允许重合。"); return; } }
    if (!$("why").value.trim()) { feedback("先写自己的定刻度、重合处理与五数限制说明，再核对。"); return; }
    feedback("本轮五点和箱须位置核对一致；只核对你采用的五数与绘图，不核原数据的四分位数求法。" + (state.values[0] === state.values[4] ? "若这是真五数，最小值等于最大值，说明原数据全等。" : state.values[1] === state.values[3] ? "箱体宽为0但最大最小不同，不能说原数据全等。" : "箱体只表示Q₁到Q₃。") + "不能把排序四等分位置当作每段恰25%的观测比例；本工坊不依据图形的对称外观认证完整分布对称。自由文字请自行逐条核依据，系统未判正确。");
  };
  $("reset").onclick = function () { fiveIds.concat(["lo", "hi", "step", "position", "why", "marker", "part"]).forEach(function (id) { $(id).value = ""; }); eraseGraph(); };
})();
