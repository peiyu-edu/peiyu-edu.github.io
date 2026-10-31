/* Page-local paper construction and exact half-grid coordinate check. */
(function () {
  "use strict";
  if (!document.body || document.body.dataset.stage !== "junior" || document.body.dataset.sec !== "j32-3") return;
  var root = document.getElementById("b9b-own-homothety");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "true";
  root.querySelector("#own-domain").textContent += " O 选 [−2,2] 的整数格点；正比 k 选 1/2、1、3/2、2。坐标可带正负号，填整数、小数（最多4位）或整数分数（分子及正分母最多4位），须在半单位网格内，不填单位或算式。";
  var style = document.createElement("style");
  style.textContent = `  #b9b-own-homothety { overflow-wrap: anywhere; scroll-margin-top:80px; }
  #b9b-own-homothety .own-settings { display:flex; flex-wrap:wrap; gap:12px; }
  #b9b-own-homothety label { display:block; }
  #b9b-own-homothety input, #b9b-own-homothety select { box-sizing:border-box; max-width:100%; min-height:44px; font:inherit; color:var(--fg); background:var(--card); border:1px solid var(--muted); border-radius:6px; padding:6px; }
  #b9b-own-homothety input { width:100%; min-width:0; }
  #b9b-own-homothety fieldset { min-width:0; margin:14px 0; padding:10px; border:1px solid var(--line); }
  #b9b-own-homothety .own-point { display:grid; grid-template-columns:2em minmax(0,1fr) minmax(0,1fr); gap:8px; align-items:center; margin:8px 0; }
  #b9b-own-homothety .ctrl { flex-wrap:wrap; }
  #b9b-own-homothety .small, #b9b-own-homothety button { font-size:15px; }
  #b9b-own-homothety button { min-height:44px; }
  #b9b-own-homothety :focus-visible { outline:3px solid var(--b); outline-offset:3px; }
  #b9b-own-homothety [hidden] { display:none !important; }
`;
  root.appendChild(style);
  root.querySelector("#own-controls").innerHTML = `      <div class="own-settings">
        <label>中心 O 的 x<select id="own-ox"><option value="-2" selected>-2</option><option value="-1">-1</option><option value="0">0</option><option value="1">1</option><option value="2">2</option></select></label>
        <label>中心 O 的 y<select id="own-oy"><option value="-2">-2</option><option value="-1">-1</option><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option></select></label>
        <label>位似比 k<select id="own-k"><option value="1/2">1/2</option><option value="1">1</option><option value="3/2" selected>3/2</option><option value="2">2</option></select></label>
        <label>题目位置要求<select id="own-side"><option value="both" selected>未指定：交两种位置</option><option value="same">同侧</option><option value="opposite">异侧</option></select></label>
      </div>
      <p id="own-task">按当前中心、正比 k 作图。未指定同异侧：同侧和异侧各交一幅，图1、图2顺序不限。</p>
      <fieldset id="own-figure-1"><legend>图1：你的三个对应点</legend>
        <div class="own-point"><b>A′</b><label>x<input id="own-1-A-x" name="own-1-A-x" aria-label="图1 A′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-1-A-y" name="own-1-A-y" aria-label="图1 A′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
        <div class="own-point"><b>B′</b><label>x<input id="own-1-B-x" name="own-1-B-x" aria-label="图1 B′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-1-B-y" name="own-1-B-y" aria-label="图1 B′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
        <div class="own-point"><b>C′</b><label>x<input id="own-1-C-x" name="own-1-C-x" aria-label="图1 C′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-1-C-y" name="own-1-C-y" aria-label="图1 C′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
      </fieldset>
      <fieldset id="own-figure-2"><legend>图2：你的三个对应点</legend>
        <div class="own-point"><b>A′</b><label>x<input id="own-2-A-x" name="own-2-A-x" aria-label="图2 A′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-2-A-y" name="own-2-A-y" aria-label="图2 A′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
        <div class="own-point"><b>B′</b><label>x<input id="own-2-B-x" name="own-2-B-x" aria-label="图2 B′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-2-B-y" name="own-2-B-y" aria-label="图2 B′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
        <div class="own-point"><b>C′</b><label>x<input id="own-2-C-x" name="own-2-C-x" aria-label="图2 C′的x坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label><label>y<input id="own-2-C-y" name="own-2-C-y" aria-label="图2 C′的y坐标" aria-describedby="own-domain" type="text" maxlength="24" autocomplete="off" spellcheck="false"></label></div>
      </fieldset>
`;
  root.querySelector("#own-guide").insertAdjacentHTML("beforeend", `      <p>对每个顶点，先数从 O 出发的横、竖位移，按 k 倍走；同侧方向不变，异侧方向全部反过来。中心不是原点时，不能直接把顶点坐标乘 k。中心若和顶点重合，该点保持不动，不列距离之比。</p>
      <p>检查每组对应点是否与 O 共线，到 O 的距离比是否为 k，整幅图是否统一在同侧或异侧；再检查对应边是否平行或共线。k=1 时，同侧为原图，异侧为中心对称图。未指定位置时，两幅都要画。坐标核验不能代替纸图自查。</p>
`);
  var form = root.querySelector("#own-form"), feedback = root.querySelector("#own-feedback");
  var guide = root.querySelector("#own-guide"), second = root.querySelector("#own-figure-2");
  var ox = root.querySelector("#own-ox"), oy = root.querySelector("#own-oy");
  var ratio = root.querySelector("#own-k"), side = root.querySelector("#own-side");
  var names = ["A", "B", "C"], original = [[-2, 2], [4, 0], [0, 6]]; // doubled coordinates
  var ratios = { "1/2": [1, 2], "1": [1, 1], "3/2": [3, 2], "2": [2, 1] };
  function inputs() { return Array.from(root.querySelectorAll("input")); }
  function invalidate(message) {
    feedback.textContent = message || "作图稿已编辑，请重新核验。";
    delete feedback.dataset.result;
    guide.open = false;
    guide.hidden = true;
    inputs().forEach(function (input) { input.removeAttribute("aria-invalid"); });
  }
  function settingsChanged() {
    inputs().forEach(function (input) { input.value = ""; });
    second.hidden = side.value !== "both";
    second.disabled = second.hidden;
    root.querySelector("#own-task").textContent = side.value === "both" ?
      "按当前中心、正比 k 作图。未指定同异侧：同侧和异侧各交一幅，图1、图2顺序不限。" :
      "按当前中心、正比 k 作图。只交一幅" + (side.value === "same" ? "同侧" : "异侧") + "图；与中心重合的顶点保持不动。";
    invalidate("条件已更新，坐标已清空。请重新在纸上作图并填写。");
  }
  // Return an exact integer in half-units. Never round a near-grid input.
  function halfUnits(raw) {
    var text = raw.trim().replace(/−/g, "-"), n, d, match;
    if (text.length > 24) return null;
    if ((match = text.match(/^([+-]?\d{1,4})\s*\/\s*(\d{1,4})$/))) {
      n = Number(match[1]); d = Number(match[2]);
    } else if (/^[+-]?(?:\d{1,4}(?:\.\d{1,4})?|\.\d{1,4})$/.test(text)) {
      var decimals = (text.split(".")[1] || "").length;
      d = Math.pow(10, decimals); n = Number(text.replace(".", ""));
    } else return null;
    if (!d || (2 * n) % d !== 0 || Math.abs(2 * n / d) > 24) return null;
    return 2 * n / d;
  }
  function config() {
    if (![ox.value, oy.value].every(function (v) { return /^(?:-2|-1|0|1|2)$/.test(v); }) ||
        !Object.prototype.hasOwnProperty.call(ratios, ratio.value) ||
        !["same", "opposite", "both"].includes(side.value)) return null;
    return { o: [2 * Number(ox.value), 2 * Number(oy.value)], k: ratios[ratio.value], side: side.value };
  }
  function checkFigure(points, cfg) {
    var direction = 0, failures = [];
    points.forEach(function (q, i) {
      var u = [original[i][0] - cfg.o[0], original[i][1] - cfg.o[1]];
      var v = [q[0] - cfg.o[0], q[1] - cfg.o[1]];
      if (u[0] === 0 && u[1] === 0) {
        if (v[0] !== 0 || v[1] !== 0) failures.push(names[i] + "′：与中心重合的顶点应保持不动");
        return;
      }
      var dot = u[0] * v[0] + u[1] * v[1], sign = Math.sign(dot);
      if (u[0] * v[1] - u[1] * v[0] !== 0) failures.push(names[i] + "′：对应点与中心不共线");
      else if (cfg.k[1] * cfg.k[1] * (v[0] * v[0] + v[1] * v[1]) !==
               cfg.k[0] * cfg.k[0] * (u[0] * u[0] + u[1] * u[1])) failures.push(names[i] + "′：到中心的距离比不符合 k");
      else if ((cfg.side === "same" && sign !== 1) || (cfg.side === "opposite" && sign !== -1)) failures.push(names[i] + "′：位置不符合题目指定的侧别");
      if (sign) {
        if (direction && direction !== sign) failures.push("三个对应点必须统一选同侧或异侧，不能逐点混用");
        direction = direction || sign;
      }
    });
    return { direction: direction, failures: failures };
  }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    invalidate();
    var cfg = config();
    if (!cfg) { feedback.textContent = "条件超出本工作区范围，请重置后重新选择。"; return; }
    var figures = [], error = null, count = cfg.side === "both" ? 2 : 1;
    for (var f = 1; f <= count; f++) {
      var points = names.map(function (name) {
        return ["x", "y"].map(function (axis) {
          var input = root.querySelector("#own-" + f + "-" + name + "-" + axis), value = halfUnits(input.value);
          if (value === null) {
            input.setAttribute("aria-invalid", "true");
            if (!error) error = { input: input, label: "图" + f + " " + name + "′的" + axis + "坐标" };
          }
          return value;
        });
      });
      figures.push(points);
    }
    if (error) {
      feedback.textContent = "请检查" + error.label + "：填 −12 到 12 内的半单位网格数，可用整数、小数或整数分数；不能留空。";
      error.input.focus();
      return;
    }
    var results = figures.map(function (points) { return checkFigure(points, cfg); });
    var messages = [];
    results.forEach(function (result, i) {
      if (result.failures.length) messages.push("图" + (i + 1) + "：" + result.failures.join("；"));
    });
    if (!messages.length && count === 2 && results[0].direction === results[1].direction)
      messages.push("未指定位置时需同侧、异侧各一幅，不能重复提交同一种位置。");
    feedback.dataset.result = messages.length ? "retry" : "pass";
    feedback.textContent = messages.length ? "还需调整。" + messages.join("。") + "。修改后可再次核验。" :
      "坐标核验通过：对应点共线、距离比及整幅图的位置均符合条件。请在纸图上逐一核对这些条件并顺次连边；纸上作图由你自查。";
    guide.hidden = false;
  });
  inputs().forEach(function (input) { input.addEventListener("input", function () { invalidate(); }); });
  [ox, oy, ratio, side].forEach(function (select) {
    select.addEventListener("input", settingsChanged);
    select.addEventListener("change", settingsChanged);
  });
  root.querySelector("#own-reset").addEventListener("click", function () {
    form.reset();
    settingsChanged();
    feedback.textContent = "已重置。先在纸上尝试，再填写坐标。";
  });
})();
