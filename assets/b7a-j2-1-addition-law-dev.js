(function () {
  "use strict";
  var root = document.getElementById("addition-law-lab");
  if (!root || !document.body || document.body.getAttribute("data-sec") !== "j2-1") return;
  function $(id) { return root.querySelector("#al-" + id); }
  function abs(n) { return n < 0n ? -n : n; }
  function rat(n, d) { if (!d) throw Error("分母不能为0。"); if (d < 0n) { n = -n; d = -d; } var a = abs(n), b = d; while (b) { var r = a % b; a = b; b = r; } return { n: n / a, d: d / a }; }
  function num(raw) {
    var s = raw.replace(/[０-９]/g, function (c) { return String(c.charCodeAt(0) - 65296); }).replace(/[−－]/g, "-").replace(/＋/g, "+").replace(/／/g, "/").replace(/．/g, ".").trim(), m;
    if (!s || s.length > 60) throw Error("请按说明填写精确数值。");
    if ((m = /^([+-]?\d{1,12})\s*\/\s*(\+?\d{1,12})$/.exec(s))) return rat(BigInt(m[1]), BigInt(m[2]));
    if (!(m = /^([+-]?)(\d{0,12})(?:\.(\d{1,12}))?$/.exec(s)) || !(m[2] || m[3])) throw Error("数值格式不符；不要拆数字，也不输入算式、指数或单位。");
    var tail = m[3] || ""; return rat(BigInt((m[1] === "-" ? "-" : "") + (m[2] || "0") + tail), 10n ** BigInt(tail.length));
  }
  function add(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function same(a, b) { return a.n === b.n && a.d === b.d; }
  function show(a) { return a.d === 1n ? String(a.n) : a.n + "/" + a.d; }
  var current = null, records = new Map(), names = ["甲", "乙", "丙"], modes = { commute: "交换第一对", associate: "只移括号", free: "自由简算" };
  function message(id, s, state) { $(id).textContent = s; if (state) $(id).dataset.state = state; else delete $(id).dataset.state; }
  function closeGuide() { $("guide").hidden = true; $("guide").open = false; message("guide-feedback", ""); }
  function clearAnswers() { for (var p = 0; p < 2; p++) ["middle", "total"].forEach(function (part) { $("p" + p + "-" + part).value = ""; }); ["prediction", "easier", "reason"].forEach(function (id) { $(id).value = ""; }); message("feedback", ""); closeGuide(); }
  function plan(p) {
    var order = [0, 1, 2].map(function (i) { return Number($("p" + p + "-o" + i).value); }), group = $("p" + p + "-group").value;
    if (new Set(order).size !== 3 || order.some(function (v) { return !Number.isInteger(v) || v < 0 || v > 2; }) || !["left", "right"].includes(group)) throw Error("每个计划都要把甲、乙、丙卡片各用一次，不能重复或漏掉。");
    var values = order.map(function (i) { return current[i]; }), middle = group === "left" ? add(values[0], values[1]) : add(values[1], values[2]), total = group === "left" ? add(middle, values[2]) : add(values[0], middle), s = values.map(function (v) { return "(" + show(v) + ")"; });
    return { order: order, group: group, middle: middle, total: total, expression: group === "left" ? "(" + s[0] + " + " + s[1] + ") + " + s[2] : s[0] + " + (" + s[1] + " + " + s[2] + ")" };
  }
  function drawPlans() {
    $("help").textContent = $("mode").value === "commute" ? "两计划都先合并前两位；计划二只交换这两位，末位不动。请亲自改下拉框。" : $("mode").value === "associate" ? "两计划的卡片顺序保持相同，亲自把先合并的位置改成不同的一对。" : "选两个不同的计划，每张卡片各用一次；先找本组适合凑0或凑整的一对。";
    for (var p = 0; p < 2; p++) { try { $("p" + p + "-expression").textContent = current ? plan(p).expression : "先采用自己的三个数。"; } catch (e) { $("p" + p + "-expression").textContent = e.message; } }
  }
  function resetPlans() { for (var p = 0; p < 2; p++) { for (var i = 0; i < 3; i++) $("p" + p + "-o" + i).value = i; $("p" + p + "-group").value = "left"; } }
  function changedPlan() { clearAnswers(); drawPlans(); }
  for (var p = 0; p < 2; p++) {
    var box = document.createElement("fieldset"), legend = document.createElement("legend"), fields = document.createElement("div"); legend.textContent = "计划" + (p === 0 ? "一" : "二"); box.appendChild(legend); fields.className = "al-fields";
    for (var i = 0; i < 4; i++) {
      var label = document.createElement("label"), select = document.createElement("select"); label.appendChild(document.createTextNode(i < 3 ? "第" + (i + 1) + "位" : "先合并哪一对")); select.id = "al-p" + p + (i < 3 ? "-o" + i : "-group");
      (i < 3 ? names : ["前两位", "后两位"]).forEach(function (s, j) { var option = document.createElement("option"); option.value = i < 3 ? j : j === 0 ? "left" : "right"; option.textContent = s; select.appendChild(option); }); select.value = i < 3 ? i : "left"; select.onchange = changedPlan; label.appendChild(select); fields.appendChild(label);
    }
    box.appendChild(fields); var expression = document.createElement("p"); expression.id = "al-p" + p + "-expression"; expression.setAttribute("aria-live", "polite"); box.appendChild(expression); var answers = document.createElement("div"); answers.className = "al-fields";
    ["middle", "total"].forEach(function (part) { var label = document.createElement("label"), input = document.createElement("input"); label.appendChild(document.createTextNode(part === "middle" ? "先算一对的中间值" : "再合并剩下数的总和")); input.id = "al-p" + p + "-" + part; input.setAttribute("aria-describedby", "al-syntax"); input.autocomplete = "off"; input.oninput = function () { message("feedback", ""); closeGuide(); }; label.appendChild(input); answers.appendChild(label); }); box.appendChild(answers); $("plans").appendChild(box);
  }
  function invalidateParameters() { current = null; $("work").hidden = true; resetPlans(); clearAnswers(); drawPlans(); }
  $("parameters").onsubmit = function (e) { e.preventDefault(); try {
    var values = ["a", "b", "c"].map(function (id) { return num($(id).value); }); if (values.some(function (v) { return abs(v.n) > 100n * v.d || v.d > 100n; })) throw Error("三个参数须在−100到100之间，约分后分母不超过100。");
    current = values; resetPlans(); clearAnswers(); $("work").hidden = false; drawPlans(); message("feedback", "三个数已采用，请亲自设置两种计划；中间值、总和与预测都由你填写。");
  } catch (err) { invalidateParameters(); message("feedback", err.message, "retry"); } };
  $("mode").onchange = function () { resetPlans(); changedPlan(); };
  $("check").onsubmit = function (e) { e.preventDefault(); try {
    if (!current) throw Error("先采用三个数。"); var one = plan(0), two = plan(1), mode = $("mode").value, equalOrder = one.order.join() === two.order.join();
    if (!Object.prototype.hasOwnProperty.call(modes, mode)) throw Error("先选择本次重点。");
    if (mode === "commute" && !(one.group === "left" && two.group === "left" && one.order[0] === two.order[1] && one.order[1] === two.order[0] && one.order[2] === two.order[2])) throw Error("交换第一对时，两计划都先算前两位；第二计划只交换这两位，末位不动。");
    if (mode === "associate" && !(equalOrder && one.group !== two.group)) throw Error("只移动括号时，两计划顺序要相同，先合并的位置要不同。");
    if (mode === "free" && equalOrder && one.group === two.group) throw Error("请实际改变顺序或先合并的位置，不重复同一个计划。");
    [one, two].forEach(function (q, i) { if (!same(num($("p" + i + "-middle").value), q.middle)) throw Error("计划" + (i + 1) + "的中间值需核对；按自己选的那一对相加，带着负号走。"); if (!same(num($("p" + i + "-total").value), q.total)) throw Error("计划" + (i + 1) + "的总和需核对，不能漏掉剩下的加数。"); });
    if (!$("prediction").value) throw Error("先填写你的预测。"); if ($("prediction").value !== "same") throw Error("本次两种正确总和相同，请回看两条加法运算律，再修正预测。");
    if (!$("easier").value || !$("reason").value.trim()) throw Error("先选对你方便的计划，写本组具体的简算理由；文字不会自动判对。");
    var key = [mode, current.map(show).join(), one.order.join(), one.group, two.order.join(), two.group].join("|"), existed = records.has(key);
    if (!existed && records.size >= 12) throw Error("本轮最多12条比较，请清空后另做一轮。");
    records.set(key, { mode: mode, negative: current.some(function (v) { return v.n < 0n; }), values: current.map(show).join("、"), one: one, two: two, easier: $("easier").value, reason: $("reason").value.trim() });
    $("records").textContent = ""; records.forEach(function (r, k) { var p = document.createElement("p"); p.className = "small"; p.textContent = modes[r.mode] + "；甲乙丙=" + r.values + "；一：" + r.one.expression + "，中间" + show(r.one.middle) + "，总和" + show(r.one.total) + "；二：" + r.two.expression + "，中间" + show(r.two.middle) + "，总和" + show(r.two.total) + "；自选" + { one: "计划一", two: "计划二", either: "都方便或无明显差别" }[r.easier] + "，理由：" + r.reason; $("records").appendChild(p); }); closeGuide();
    message("feedback", "两计划的中间值、总和与预测核对一致；" + (existed ? "已更新这条比较。" : "已记录本次比较。") + "方便程度与自由理由只记录，尚未判定正确。算例不代替一般证明。", "recorded");
  } catch (err) { message("feedback", err.message, "retry"); } };
  $("open-guide").onclick = function () { var all = Array.from(records.values()); if (!all.some(function (r) { return r.mode === "commute"; }) || !all.some(function (r) { return r.mode === "associate"; }) || !all.some(function (r) { return r.negative; })) { message("guide-feedback", "先各完成一条交换第一对、只移动括号的比较，且至少一条含真正的负数。负零等于0，不算负数案例。", "retry"); return; } $("guide").hidden = false; message("guide-feedback", "已打开教材运算律与应用准则；简算理由仍需你自己逐条核对，不表示自由文字已判正确。", "selfcheck"); };
  ["a", "b", "c"].forEach(function (id) { $(id).addEventListener("input", invalidateParameters); });
  ["prediction", "easier"].forEach(function (id) { $(id).addEventListener("change", function () { message("feedback", ""); closeGuide(); }); }); $("reason").addEventListener("input", function () { message("feedback", ""); closeGuide(); });
  $("reset").onclick = function () { records.clear(); $("records").textContent = ""; $("parameters").reset(); $("check").reset(); invalidateParameters(); };
  drawPlans();
})();
