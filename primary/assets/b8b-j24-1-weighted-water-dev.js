(function () {
  "use strict";
  var root = document.getElementById("weighted-water-lab");
  if (!root || !document.body || document.body.getAttribute("data-sec") !== "j24-1") return;
  function $(id) { return root.querySelector("#ww-" + id); }
  function abs(n) { return n < 0n ? -n : n; }
  function rat(n, d) { if (!d) throw Error("分母不能为0。"); if (d < 0n) { n = -n; d = -d; } var a = abs(n), b = d; while (b) { var r = a % b; a = b; b = r; } return { n: n / a, d: d / a }; }
  function num(raw) {
    var s = raw.replace(/[０-９]/g, function (c) { return String(c.charCodeAt(0) - 65296); }).replace(/[−－]/g, "-").replace(/＋/g, "+").replace(/／/g, "/").replace(/．/g, ".").trim(), p = s.split("/"), m;
    if (!s || s.length > 300) throw Error("请按说明填写不超过300字符的精确数值。");
    if (p.length === 2 && p.every(function (v) { return /^[+-]?\d{1,120}$/.test(v.trim()); })) return rat(BigInt(p[0].trim()), BigInt(p[1].trim()));
    if (p.length !== 1 || !(m = /^([+-]?)(\d{0,120})(?:\.(\d{1,100}))?$/.exec(s)) || !(m[2] || m[3])) throw Error("数值格式不符；不能拆开数字、输入算式、指数或单位。");
    var tail = m[3] || ""; return rat(BigInt((m[1] === "-" ? "-" : "") + (m[2] || "0") + tail), 10n ** BigInt(tail.length));
  }
  function add(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function mul(a, b) { return rat(a.n * b.n, a.d * b.d); }
  function over(a, n) { return rat(a.n, a.d * n); }
  function same(a, b) { return a.n === b.n && a.d === b.d; }
  function cmp(a, b) { var c = a.n * b.d - b.n * a.d; return c < 0n ? -1 : c > 0n ? 1 : 0; }
  function show(a) { return a.d === 1n ? String(a.n) : a.n + "/" + a.d; }
  function count(raw, max) { var a = num(raw); if (a.d !== 1n || a.n < 0n || a.n > max) throw Error("频数须为规定范围内的非负整数，不能用负数或非整数。"); return a.n; }
  function water(raw) { var a = num(raw); if (a.n < 0n || a.n > 10000n * a.d || a.d > 100n) throw Error("水量须在0—10000之间，约分后分母不超过100；零频行也不能填负水量。"); return a; }
  function unit(v) { return v === "L" ? "L" : "m³"; }
  function message(id, s, state) { $(id).textContent = s; if (state) $(id).dataset.state = state; else delete $(id).dataset.state; }
  var current = null, groups = [], calculatorReady = false;
  function closeGuide() { $("guide").hidden = true; $("guide").open = false; message("merge-feedback", ""); }
  function clearCalc() { current = null; $("calc").hidden = true; $("rows").textContent = ""; ["count", "total", "mean", "min", "max"].forEach(function (id) { $(id).value = ""; }); message("feedback", ""); closeGuide(); }
  function stats(rows) {
    var n = 0n, total = rat(0n, 1n), active = [];
    rows.forEach(function (r) { n += r.f; total = add(total, mul(r.v, rat(r.f, 1n))); if (r.f > 0n) active.push(r.v); });
    if (!n) throw Error("总频数必须大于0；全部零频时没有可计算的平均数。");
    active.sort(cmp); return { rows: rows, n: n, total: total, mean: over(total, n), min: active[0], max: active[active.length - 1], distinct: new Set(active.map(show)).size };
  }
  function addCell(tr, text) { var td = document.createElement("td"); td.textContent = text; tr.appendChild(td); return td; }
  function renderGroups() {
    $("groups").textContent = $("picks").textContent = "";
    groups.forEach(function (g, i) {
      var p = document.createElement("p"); p.className = "small"; p.textContent = "组" + (i + 1) + "：" + g.n + "次，总水量" + show(g.total) + unit(g.unit) + "，平均" + show(g.mean) + unit(g.unit) + "；实际范围" + show(g.min) + "至" + show(g.max) + unit(g.unit) + "；" + (g.origin === "calculator" ? "计算器参考，不认证独立手算" : g.calculatorChecked ? "逐项填写后用计算器复核" : "逐项填写核对") + "。"; $("groups").appendChild(p);
      var label = document.createElement("label"), input = document.createElement("input"); input.type = "checkbox"; input.name = "ww-pick"; input.value = i; input.onchange = closeGuide; label.append(input, document.createTextNode(" 选组" + (i + 1) + " ")); $("picks").appendChild(label);
    });
    ["combined", "naive", "equality"].forEach(function (id) { $(id).value = ""; }); closeGuide();
  }
  $("load").onsubmit = function (e) {
    e.preventDefault(); clearCalc();
    try {
      var raw = $("data").value.trim().replace(/\r\n?/g, "\n"), rows;
      if ($("mode").value === "raw") {
        var parts = raw.split(/[,，\n]/), byValue = new Map(); if (parts.length > 20 || parts.some(function (s) { return !s.trim(); })) throw Error("原始数据须1—20项，不能有空项或尾逗号。");
        parts.forEach(function (s) { var v = water(s), key = show(v); if (!byValue.has(key)) byValue.set(key, { v: v, f: 0n }); byValue.get(key).f++; }); rows = Array.from(byValue.values());
      } else {
        var lines = raw.split("\n"); if (lines.length > 20 || lines.some(function (s) { return !s.trim(); })) throw Error("频数表须1—20行，每行水量和频数之间用一个逗号。");
        rows = lines.map(function (line) { var p = line.split(/[,，]/); if (p.length !== 2) throw Error("频数表每行恰有水量、频数两个值。"); return { v: water(p[0]), f: count(p[1], 1000n) }; });
      }
      current = stats(rows); current.unit = $("unit").value; current.reference = false; current.index = null;
      $("caption").textContent = "本组已建立" + rows.length + "行；水量单位" + unit(current.unit) + "，请填写自己的精确计算。";
      rows.forEach(function (r, i) { var tr = document.createElement("tr"); addCell(tr, show(r.v)); ["f", "p"].forEach(function (kind) { var input = document.createElement("input"); input.id = "ww-" + kind + "-" + i; input.setAttribute("aria-label", "第" + (i + 1) + "行" + (kind === "f" ? "复核频数" : "总水量")); input.oninput = function () { message("feedback", ""); }; addCell(tr, "").appendChild(input); }); $("rows").appendChild(tr); });
      $("calc").hidden = false; $("calculator").disabled = !calculatorReady; message("feedback", "表已建立；频数与计算框都由你填写，完成后再核对。");
    } catch (err) { message("feedback", err.message, "retry"); }
  };
  function fillReference() { ["count", "total", "mean", "min", "max"].forEach(function (id) { $(id).value = id === "count" ? String(current.n) : show(current[id]); }); current.rows.forEach(function (r, i) { $("f-" + i).value = r.f; $("p-" + i).value = show(mul(r.v, rat(r.f, 1n))); }); }
  $("calculator").onclick = function () { try { if (!current || !calculatorReady) throw Error("先完成2—5行且至少两种频数为正的水量的逐项核对，再使用计算器。"); fillReference(); current.reference = true; if (current.index !== null) { groups[current.index].calculatorChecked = true; renderGroups(); } message("feedback", "计算器已按当前数据列出精确参考。已记录的组不重复添加；后续参考记录不会被当成独立手算。", "reference"); } catch (err) { message("feedback", err.message, "retry"); } };
  $("check").onsubmit = function (e) {
    e.preventDefault(); try {
      if (!current) throw Error("先建立当前计算表。"); if (current.index !== null) throw Error("本组已经记录；请修改数据另建组，或用计算器复核已记录组。"); if (groups.length >= 8) throw Error("本轮最多8组，请先清空再做新一轮。");
      current.rows.forEach(function (r, i) { if (count($("f-" + i).value, 1000n) !== r.f || !same(num($("p-" + i).value), mul(r.v, rat(r.f, 1n)))) throw Error("第" + (i + 1) + "行的频数或总水量需核对；零频的贡献为零。"); });
      if (count($("count").value, 20000n) !== current.n || !same(num($("total").value), current.total) || !same(num($("mean").value), current.mean)) throw Error("总次数、总水量或平均数需核对；平均数用总水量除总次数，不是除表格行数。");
      if (!same(num($("min").value), current.min) || !same(num($("max").value), current.max)) throw Error("实际最小、最大值只看频数为正的行，不能把零频水量算进去。");
      if (!current.reference && current.rows.length >= 2 && current.rows.length <= 5 && current.distinct >= 2) calculatorReady = true;
      current.index = groups.length; groups.push({ n: current.n, total: current.total, mean: current.mean, min: current.min, max: current.max, unit: current.unit, origin: current.reference ? "calculator" : "manual", calculatorChecked: false }); renderGroups(); $("calculator").disabled = !calculatorReady;
      message("feedback", "本组数值核对并记录；只核计算，不认证采集经历。可以用计算器复核，或修改数据建立下一组。", "ok");
    } catch (err) { message("feedback", err.message, "retry"); }
  };
  $("merge").onsubmit = function (e) {
    e.preventDefault(); closeGuide(); try {
      var selected = Array.from(root.querySelectorAll('input[name="ww-pick"]:checked')).map(function (c) { return groups[Number(c.value)]; });
      if (selected.length < 2 || selected.length > 6) throw Error("请勾选2—6个已记录组。"); if (selected.some(function (g) { return g.unit !== selected[0].unit; })) throw Error("单位不同，先换算到同单位并重新录入，不能直接合并。");
      var n = selected.reduce(function (s, g) { return s + g.n; }, 0n), total = selected.reduce(function (s, g) { return add(s, g.total); }, rat(0n, 1n)), combined = over(total, n), naive = over(selected.reduce(function (s, g) { return add(s, g.mean); }, rat(0n, 1n)), BigInt(selected.length)), equal = same(combined, naive);
      if (!same(num($("combined").value), combined) || !same(num($("naive").value), naive) || $("equality").value !== (equal ? "same" : "different")) throw Error("合并平均数、组均值直接平均或相等判断需重算；组观察次数必须用真实次数。");
      if (!$("explain").value.trim()) throw Error("先写出实际意义和条件，再对照自检准则。");
      message("merge-feedback", "两个数值与相等判断核对一致；自由解释只记录，尚未判定正确。" + (selected.length === 2 ? "本次是两组，直接平均同值的条件是观察次数相等或均值相等。" : "本次至少三组，不能套用两组相等的条件；即使观察次数与均值都不全相同，也可能相消同值。") + "请展开准则自查单位、口径和结论。", "recorded"); $("guide").hidden = false;
    } catch (err) { message("merge-feedback", err.message, "retry"); }
  };
  $("data").addEventListener("input", clearCalc); ["mode", "unit"].forEach(function (id) { $(id).addEventListener("change", clearCalc); });
  ["count", "total", "mean", "min", "max"].forEach(function (id) { $(id).addEventListener("input", function () { message("feedback", ""); }); });
  ["combined", "naive", "explain"].forEach(function (id) { $(id).addEventListener("input", closeGuide); }); $("equality").addEventListener("change", closeGuide);
  $("reset").onclick = function () { groups = []; calculatorReady = false; ["load", "check", "merge"].forEach(function (id) { $(id).reset(); }); renderGroups(); clearCalc(); $("calculator").disabled = true; };
})();
