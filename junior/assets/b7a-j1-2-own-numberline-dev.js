(function () {
  "use strict";
  if (!document.body || document.body.dataset.sec !== "j1-2") return;
  var own = document.getElementById("own-numberline-work"), induction = document.getElementById("numberline-induction-work");
  if (!own || !induction || own.dataset.numberlineReady) return;
  own.dataset.numberlineReady = "1";
  const root = own.parentElement;

  // Author display rules must not expose later phases marked hidden.
  root.classList.add('own-workspace');
  const phaseStyle = document.createElement('style');
  phaseStyle.textContent = '.own-workspace [hidden]{display:none!important}.own-workspace input,.own-workspace select,.own-workspace textarea,.own-workspace button{font:inherit;max-width:100%;box-sizing:border-box}';
  root.append(phaseStyle);
  // Page-local feedback: keep the first correction beside its control.
  let activeField = null;
  function clearErrors() {
    root.querySelectorAll('[data-input-error]').forEach(e => {
      const id=e.id;
      root.querySelectorAll('[aria-describedby]').forEach(input=>{
        const ids=input.getAttribute('aria-describedby').split(/\s+/).filter(v=>v!==id);
        if(ids.length)input.setAttribute('aria-describedby',ids.join(' '));else input.removeAttribute('aria-describedby');
      });e.remove();
    });
    root.querySelectorAll('[aria-invalid="true"]').forEach(e => e.removeAttribute('aria-invalid'));
  }
  function fieldError(input, message) {
    if (!input) return;
    clearErrors();
    for(let parent=input.parentElement;parent&&parent!==root;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    input.setAttribute('aria-invalid', 'true');
    const note = document.createElement('span');
    note.dataset.inputError = 'true'; note.setAttribute('role', 'alert');
    note.id=(input.id||input.name||'own-field')+'-error';
    const described=(input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
    if(!described.includes(note.id))described.push(note.id);
    input.setAttribute('aria-describedby',described.join(' '));
    note.style.cssText = 'display:block;font-size:15px;overflow-wrap:anywhere;color:var(--no)';
    note.textContent = message; input.insertAdjacentElement('afterend', note);
    if (!input.closest('[hidden]')) input.focus();
  }
  function atField(input, run) { activeField = input; return run(); }
  function inputHelp(element) {
    if (!element) return;
    const d = document.createElement('details'); d.className = 'more';
    const s = document.createElement('summary'); s.textContent = '怎么输入？';
    element.before(d); d.append(s, element);
  }
  root.addEventListener('input', clearErrors);
  root.addEventListener('change', clearErrors);
  root.addEventListener('reset', clearErrors);

  var $ = function (id) { return own.querySelector("#on-" + id); }, I = function (id) { return induction.querySelector("#oi-" + id); }, ns = "http://www.w3.org/2000/svg";
  function gcd(a, b) { a = a < 0n ? -a : a; while (b) { var t = a % b; a = b; b = t; } return a || 1n; }
  function rational(n, d) { var g = gcd(n, d); return { n: n / g, d: d / g }; }
  function number(raw) { var s = raw.trim(); if (!/^-?(0|[1-9][0-9]{0,3})(\.[0-9]{1,2}|\/[1-9][0-9]?)?$/.test(s)) return null; var sign = s[0] === "-" ? -1n : 1n, p = s.replace(/^-/, "").split("/"), d = 1n, n;
    if (p.length === 2) { n = BigInt(p[0]); d = BigInt(p[1]); } else { var q = p[0].split("."); d = q[1] ? 10n ** BigInt(q[1].length) : 1n; n = BigInt(q[0]) * d + BigInt(q[1] || "0"); } return rational(sign * n, d); }
  function show(v) { if (v.n === 0n) return "0"; if (100n % v.d !== 0n) return v.n + "/" + v.d; var t = v.n * 100n / v.d, a = t < 0n ? -t : t, f = String(a % 100n).padStart(2, "0").replace(/0+$/, ""); return (t < 0n ? "-" : "") + a / 100n + (f ? "." + f : ""); }
  function eq(a, b) { return a.n === b.n && a.d === b.d; }
  function value(v) { return Number(v.n) / Number(v.d); }
  function node(tag, attrs, p) { var e = document.createElementNS(ns, tag); Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); p.append(e); return e; }
  function line(p, a, b, attrs) { node("line", Object.assign({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "var(--fg)", "stroke-width": 2 }, attrs || {}), p); }
  function text(p, x, y, s, anchor) { var t = node("text", { x: x, y: y, fill: "var(--fg)", "font-size": 19, "text-anchor": anchor || "middle" }, p); t.textContent = s; }
  function axisArrow(svg, y, direction) { line(svg, [32, y], [520, y]); var x = direction === 1 ? 520 : 32; node("path", { d: direction === 1 ? "M520 " + y + " l-12 -6 v12 z" : "M32 " + y + " l12 -6 v12 z", fill: "var(--fg)" }, svg); }
  const settings = document.createElement('details'); settings.className = 'more';
  settings.innerHTML = '<summary>自选数和画轴设置</summary>';
  const target = $("targets").closest('label'), build = $("build");
  target.before(settings);
  let next = target;
  while (next && next !== build) { const following = next.nextElementSibling; if(next !== $("given")) settings.append(next); next = following; }
  settings.before($("given"));
  $("given").textContent = '用 −3、0、2 开始';
  const marking = document.createElement('div'); marking.dataset.marking = 'true';
  build.after(marking);
  next = marking.nextElementSibling;
  while(next && next !== $("feedback")) {const following=next.nextElementSibling;marking.append(next);next=following;}
  marking.hidden = true; induction.hidden = true;
  var state = null, points = [];
  function changed() { clearErrors(); $("feedback").textContent = "轴或点已变化，请重新核对。"; }
  function clearAxis() { marking.hidden = true; induction.hidden = true; state = null; points = []; $("fig").replaceChildren(); $("list").replaceChildren(); $("active").replaceChildren(new Option("先选点", "")); $("plan").textContent = "布局或目标已变化，请重新画轴。"; changed(); }
  $("given").onclick = function () { $("targets").value = "-3,0,2"; $("origin").value = "8"; $("unit").value = "2"; $("direction").value = "1"; clearAxis(); $("build").click(); };
  ["targets", "origin", "unit"].forEach(function (id) { $(id).oninput = clearAxis; }); $("direction").onchange = clearAxis;
  function expected(v) { return rational(BigInt(state.origin) * v.d + BigInt(state.direction * state.unit) * v.n, v.d); }
  function draw() {
    var svg = $("fig"); svg.replaceChildren(); if (!state) return; axisArrow(svg, 420, state.direction);
    for (var g = 0; g <= 16; g++) line(svg, [48 + 28 * g, 412], [48 + 28 * g, 428], { stroke: "var(--muted)", "stroke-width": 1 });
    var every = state.unit === 1 ? 4 : state.unit === 2 ? 2 : 1;
    for (var k = -16; k <= 16; k++) { var col = state.origin + state.direction * state.unit * k; if (col < 0 || col > 16) continue; var x = 48 + 28 * col; line(svg, [x, 409], [x, 431], { "stroke-width": k === 0 ? 3 : 2 }); if (k === 0 || k % every === 0) text(svg, x, 463, String(k), col < 2 ? "start" : col > 14 ? "end" : "middle"); }
    points.forEach(function (p, i) { if (!p) return; var x = 48 + value(p) * 28, y = 106 + i * 50; line(svg, [x, y + 10], [x, 404], { stroke: "var(--muted)", "stroke-width": 1, "stroke-dasharray": "3 5" }); var e = node("g", { tabindex: 0, role: "button", "aria-label": "选择点" + "ABCDEF"[i], "data-own-point": i, style: "cursor:pointer" }, svg); node("circle", { cx: x, cy: y, r: 11, fill: "var(--card)", stroke: "var(--a)", "stroke-width": 3 }, e); text(svg, x < 270 ? x + 18 : x - 18, y + 6, "ABCDEF"[i], x < 270 ? "start" : "end"); function activate() { $("active").value = String(i); $("fig").focus({ preventScroll: true }); } e.onclick = activate; e.onkeydown = function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); activate(); } }; });
    $("plan").textContent = "原点在第" + state.origin + "小格，每单位" + state.unit + "小格，" + (state.direction === 1 ? "向右" : "向左") + "为正。我标的位置（不是数值）：" + points.map(function (p, i) { return "ABCDEF"[i] + "在" + (p ? show(p) : "未标") + "小格处"; }).join("；");
  }
  $("build").onclick = function () {
    var raw = $("targets").value.trim(), values = raw ? raw.split(/[,，\n]/).map(number) : [], o = $("origin").value.trim(), u = $("unit").value.trim(), direction = Number($("direction").value);
    if (values.length < 1 || values.length > 6 || values.some(function (v) { return !v; })) { var bad = values.findIndex(function(v){return !v;}), parts = raw.split(/[,，\n]/); fieldError($("targets"), bad >= 0 ? "第"+(bad+1)+"项“"+parts[bad]+"”不能读成一个数；检查数字、负号或分数线。" : "填1至6个数，用逗号分开。"); return; }
    if (!/^(0|[1-9][0-9]?)$/.test(o) || Number(o) > 16) { fieldError($("origin"), "原点位置填0至16的整数。"); return; }
    if (!/^[1-8]$/.test(u)) { fieldError($("unit"), "每单位占1至8个小格，不能填0。"); return; }
    if (![1,-1].includes(direction)) { fieldError($("direction"), "先选向哪边为正。"); return; }
    var origin = Number(o), unit = Number(u); if (values.some(function (v) { var n = BigInt(origin) * v.d + BigInt(direction * unit) * v.n; return n < 0n || n > 16n * v.d; })) { fieldError($("origin"), "这段尺放不下这些数。展开自选设置，换原点位置或单位长度。"); return; }
    marking.hidden = false; state = { targets: values, origin: origin, unit: unit, direction: direction }; points = values.map(function () { return null; }); $("active").replaceChildren(new Option("先选点", "")); $("list").replaceChildren(); values.forEach(function (v, i) { $("active").append(new Option("点" + "ABCDEF"[i], String(i))); var li = document.createElement("li"); li.textContent = "点" + "ABCDEF"[i] + "要表示 " + show(v); $("list").append(li); }); $("position").value = ""; changed(); draw();
  };
  function place(p) { if (!state || $("active").value === "") { $("feedback").textContent = "先自己画轴并选要标的点。"; return; } if (!p || p.n < 0n || p.n > 16n * p.d) { fieldError($("position"), "位置填0至16之间的数；如需分数，用 /。"); return; } points[Number($("active").value)] = p; changed(); draw(); }
  $("place").onclick = function () { place(number($("position").value)); }; $("position").oninput = changed; $("active").onchange = changed;
  $("remove").onclick = function () { if (!state || $("active").value === "") return; points[Number($("active").value)] = null; changed(); draw(); };
  $("fig").onpointerdown = function (e) { if (!state || e.target.closest("[data-own-point]")) return; var m = $("fig").getScreenCTM(); if (!m) return; var p = $("fig").createSVGPoint(); p.x = e.clientX; p.y = e.clientY; p = p.matrixTransform(m.inverse()); if (p.x < 48 || p.x > 496 || Math.abs(p.y - 420) > 15) return; e.preventDefault(); place(rational(BigInt(Math.round((p.x - 48) / 28 * 100)), 100n)); };
  $("fig").onkeydown = function (e) { if (!state || e.target !== $("fig") || $("active").value === "") return; var p = points[Number($("active").value)] || rational(BigInt(state.origin), 1n), next;
    if (e.key === "Home") next = rational(0n, 1n); else if (e.key === "End") next = rational(16n, 1n); else if (["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(e.key)) { var delta = ["ArrowLeft", "ArrowDown"].includes(e.key) ? -1n : 1n, den = e.shiftKey ? 1n : 100n; next = rational(p.n * den + delta * p.d, p.d * den); if (next.n < 0n) next = rational(0n, 1n); if (next.n > 16n * next.d) next = rational(16n, 1n); } else return; e.preventDefault(); place(next); $("fig").focus({ preventScroll: true }); };
  $("check").onclick = function () { if (!state || points.some(function (p) { return !p; })) { $("feedback").textContent = "先自己定三要素并把目标点标齐。"; return; } var wrong = points.findIndex(function (p, i) { return !eq(p, expected(state.targets[i])); }); if(wrong < 0) induction.hidden=false; else fieldError($("position"), "点"+"ABCDEF"[wrong]+"的位置还不对。选中它，按原点和单位重新数。"); $("feedback").textContent = wrong < 0 ? "本轮标点与声明的原点、正方向、单位长度一致。只核这一幅轴；正向反转不会改数本身、相反数或到原点的单位距离。" : "点" + "ABCDEF"[wrong] + "尚未按本轮三要素标对；按声明的方向重新数单位，不能沿用另一方向的标法。"; };
  function clearAudit() { $("audit-feedback").textContent = "图或回答已变化，请重新判断；文字只自检。"; }
  $("audit").onchange = function () { var svg = $("audit-fig"); svg.replaceChildren(); clearAudit(); $("audit-guess").value = $("audit-why").value = ""; if ($("audit").value === "") return; var k = Number($("audit").value), xs = k === 1 ? [88, 168, 248, 288, 408] : [88, 168, 248, 328, 408], labels = k >= 2 ? [2, 1, 0, -1, -2] : [-2, -1, 0, 1, 2]; axisArrow(svg, 80, k === 3 ? -1 : 1); xs.forEach(function (x, i) { line(svg, [x, 70], [x, 90]); text(svg, x, 128, String(labels[i])); }); };
  $("audit-guess").onchange = clearAudit; $("audit-why").oninput = clearAudit;
  $("audit-check").onclick = function () { if ($("audit").value === "" || !$("audit-guess").value || !$("audit-why").value.trim()) { $("audit-feedback").textContent = "先选图、判断并写依据。"; return; } var k = Number($("audit").value), ok = k === 0 || k === 3; $("audit-feedback").textContent = ($("audit-guess").value === (ok ? "yes" : "no") ? "本图判断核对一致。" : "本图判断还不一致。") + (k === 1 ? "同样相差1的相邻标数，刻度距离却不相等。" : k === 2 ? "箭头向右，标数却沿正向减小，反标了。" : "原点、正方向和等距单位一致，沿正向数值增大。") + "这里只核本图结构，自由依据未自动判正确。"; };
  $("reset").onclick = function () { ["targets", "origin", "unit", "direction", "position", "audit", "audit-guess", "audit-why"].forEach(function (id) { $(id).value = ""; }); clearAxis(); $("audit-fig").replaceChildren(); $("audit-feedback").textContent = ""; };
  // Finite observations are checked exactly; written generalisations are only self-reviewed.
  var examples = [{ a: "-3", b: "-1", numbers: ["-3", "-1", "0", "3"] }, { a: "0", b: "-2", numbers: ["-2", "0", "2"] }, { a: "1/2", b: "-1/2", numbers: ["-1/2", "0", "1/2"] }, { a: "-1/2", b: "-3/2", numbers: ["-3/2", "-1/2", "0", "1/2"] }], drafts = examples.map(function () { return ["", "", "", ""]; }), done = examples.map(function () { return false; });
  function criteriaOff() { I("criteria").hidden = true; I("criteria").replaceChildren(); I("feedback").textContent = "观察或归纳已变化；先重新核观察，再逐条自检文字。"; }
  function progress() { I("rules").hidden = !done.every(Boolean); Array.from(I("case").options).forEach(function(o,i){o.disabled=i>1&&!done.slice(0,i-1).every(Boolean);}); [0, 1, 2].forEach(function (i) { I("rule-" + i).disabled = !done.every(Boolean); }); I("progress").textContent = "已核对自己的有限观察：" + done.filter(Boolean).length + "/4组。数值通过不代表文字或一般规律已被认证。"; }
  function observationDraw() { var svg = I("fig"); svg.replaceChildren(); if (I("case").value === "") { I("prompt").textContent = ""; return; } var ex = examples[Number(I("case").value)]; axisArrow(svg, 250, 1); for (var j = -4; j <= 4; j++) { var x = 280 + j * 52; line(svg, [x, 245], [x, 255]); if (j % 2 === 0) text(svg, x, 294, String(j)); } ex.numbers.forEach(function (s, i) { var v = number(s), x = 280 + value(v) * 52, y = 34 + i * 50; line(svg, [x, y + 8], [x, 242], { stroke: "var(--muted)", "stroke-width": 1, "stroke-dasharray": "3 5" }); node("rect", { x: x - 4, y: y - 6, width: 8, height: 12, fill: "var(--a)" }, svg); node("rect", { x: x - 4, y: 242, width: 8, height: 16, fill: "var(--a)" }, svg); text(svg, x < 270 ? x + 16 : x - 16, y + 6, show(v), x < 270 ? "start" : "end"); }); I("prompt").textContent = "本图向右为正。观察数 " + show(number(ex.a)) + "：记录它的相反数、到原点的单位距离；再比较 " + show(number(ex.a)) + " 与 " + show(number(ex.b)) + "（前数在前）。"; }
  I("case").onchange = function () { var k = I("case").value; ["opposite", "distance", "compare", "note"].forEach(function (id, i) { I(id).value = k === "" ? "" : drafts[Number(k)][i]; }); criteriaOff(); observationDraw(); };
  ["opposite", "distance", "compare", "note"].forEach(function (id, j) { I(id).addEventListener(id === "compare" ? "change" : "input", function () { if (I("case").value !== "") { var k = Number(I("case").value); drafts[k][j] = I(id).value; done[k] = false; } criteriaOff(); progress(); }); });
  I("record").onclick = function () { clearErrors(); if (I("case").value === "") { fieldError(I("case"), "先选一组，再留下自己的观察。"); I("feedback").textContent = "先选一组，再留下自己的观察。"; return; } var k = Number(I("case").value), ex = examples[k], a = number(ex.a), b = number(ex.b), opposite = number(I("opposite").value), distance = number(I("distance").value), compare = a.n * b.d < b.n * a.d ? "<" : a.n * b.d > b.n * a.d ? ">" : "=";
    var missing = !opposite ? "opposite" : !distance ? "distance" : !I("compare").value ? "compare" : !I("note").value.trim() ? "note" : null;
    if (missing) { var hint = missing === "opposite" || missing === "distance" ? "这一项填一个数，如 -3 或 1/2；不带单位、字母。" : missing === "compare" ? "先选两数之间的比较符号。" : "写一句你从图上观察到的位置或距离。"; fieldError(I(missing), hint); I("feedback").textContent = hint; return; }
    if (!eq(opposite, rational(-a.n,a.d))) { fieldError(I("opposite"), "看原点另一侧，找离原点一样远的数。"); I("feedback").textContent="相反数尚不一致，请看输入框旁的提示。"; return; }
    if (!eq(distance,rational(a.n<0n?-a.n:a.n,a.d))) { fieldError(I("distance"), "数一数到原点有几个单位；距离不能为负。"); I("feedback").textContent="距离尚不一致，请看输入框旁的提示。"; return; }
    if (I("compare").value!==compare) { fieldError(I("compare"), "图上向右为正，右边的数更大。"); return; } done[k] = true; progress(); I("feedback").textContent = "本组有限数值观察核对一致；位置说明仍须自己核依据，不自动判文字正确。"; };
  [0, 1, 2].forEach(function (i) { I("rule-" + i).oninput = criteriaOff; });
  I("check").onclick = function () { if (!done.every(Boolean) || [0, 1, 2].some(function (i) { return !I("rule-" + i).value.trim(); })) { I("feedback").textContent = "先完成四组自己的观察，再用自己的话写齐三条归纳。"; return; } var box = I("criteria"); box.replaceChildren(); ["相反数：非零数和它的相反数在原点两侧且到原点等距；0的相反数仍是0。相反数可以正、负或0。", "绝对值是到原点的单位距离，不能为负；正数取本身、负数取它的相反数、0的绝对值是0。", "沿声明的正方向数值增大；常用右正时越右越大。两个负数，离原点远、绝对值大的反而小。", "把有限观察当作发现线索，再按定义解释；不是对所有有理数的一般证明。请逐条核自己的话，系统未判断归纳文字正确。"].forEach(function (s) { var p = document.createElement("p"), label = document.createElement("label"), c = document.createElement("input"); c.type = "checkbox"; label.append(c, document.createTextNode(" 我自检：" + s)); p.append(label); box.append(p); }); box.hidden = false; I("feedback").textContent = "仅打开归纳自检准则，未自动认证自由文字、一般证明或实际经历。"; };
  progress();
  I("reset").onclick = function () { drafts = examples.map(function () { return ["", "", "", ""]; }); done = examples.map(function () { return false; }); I("case").value = ""; ["opposite", "distance", "compare", "note", "rule-0", "rule-1", "rule-2"].forEach(function (id) { I(id).value = ""; }); criteriaOff(); progress(); observationDraw(); };
})();
