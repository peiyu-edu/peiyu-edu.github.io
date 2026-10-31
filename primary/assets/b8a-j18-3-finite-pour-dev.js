/* Optional finite-pour activity. This file belongs only to junior lesson j18-3. */
(function () {
  "use strict";
  var root = document.getElementById("finite-pour-lab");
  if (!document.body || document.body.getAttribute("data-sec") !== "j18-3" || !root || !root.querySelector("#pour-setup") || root.dataset.pourReady) return;
  root.dataset.pourReady = "1";
  function $(id) { return root.querySelector("#pour-" + id); }
  function abs(n) { return n < 0n ? -n : n; }
  function rat(n, d) {
    if (!d) throw Error("分母不能为0。");
    if (d < 0n) { n = -n; d = -d; }
    var a = abs(n), b = d;
    while (b) { var remainder = a % b; a = b; b = remainder; }
    return { n: n / a, d: d / a };
  }
  function num(raw) {
    var s = raw.replace(/[０-９]/g, function (c) { return String(c.charCodeAt(0) - 65296); }).replace(/[−－]/g, "-").replace(/＋/g, "+").replace(/／/g, "/").replace(/．/g, ".").trim();
    if (!s || s.length > 80) throw Error("请按说明填写不超过80字符的精确数值。");
    var parts = s.split("/"), m;
    if (parts.length === 2 && /^[+-]?\d{1,12}$/.test(parts[0].trim()) && /^\+?\d{1,12}$/.test(parts[1].trim())) return rat(BigInt(parts[0].trim()), BigInt(parts[1].trim()));
    if (parts.length !== 1 || !(m = /^([+-]?)(\d{0,12})(?:\.(\d{1,12}))?$/.exec(s)) || !(m[2] || m[3])) throw Error("格式不符：不要拆开数字或输入逗号、算式、指数和单位。");
    var tail = m[3] || "";
    return rat(BigInt((m[1] === "-" ? "-" : "") + (m[2] || "0") + tail), 10n ** BigInt(tail.length));
  }
  function plus(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function minus(a, b) { return rat(a.n * b.d - b.n * a.d, a.d * b.d); }
  function same(a, b) { return a.n === b.n && a.d === b.d; }
  function show(a) { return a.d === 1n ? String(a.n) : a.n + "/" + a.d; }
  var current = null, records = new Map();
  function message(id, text, state) { $(id).textContent = text; if (state) $(id).dataset.state = state; else delete $(id).dataset.state; }
  function closeProof() { $("proof").hidden = true; $("proof").open = false; message("proof-feedback", ""); }
  function clearRound() { current = null; $("active").hidden = true; $("rows").textContent = ""; $("remaining").value = ""; $("compare").value = ""; message("feedback", ""); closeProof(); }
  function cell(tr, text) { var td = document.createElement("td"); td.textContent = text; tr.appendChild(td); return td; }
  $("setup").onsubmit = function (event) {
    event.preventDefault(); clearRound();
    try {
      var n = num($("n").value);
      if (n.d !== 1n || n.n < 1n || n.n > 12n) throw Error("本表次数须为1—12的正整数，不支持0次或非整数次。");
      if (records.has(String(n.n))) throw Error("这个次数已经记录，请换一个不同的有限次数。");
      var items = [], sum = rat(0n, 1n);
      for (var k = 1n; k <= n.n; k++) {
        var amount = rat(1n, k * (k + 1n)); sum = plus(sum, amount); items.push({ amount: amount, sum: sum });
        var tr = document.createElement("tr"); cell(tr, String(k));
        ["amount", "sum"].forEach(function (part) {
          var input = document.createElement("input"); input.id = "pour-" + part + "-" + k;
          input.setAttribute("aria-label", "第" + k + "次" + (part === "amount" ? "倒出比例" : "后累计倒出比例")); input.setAttribute("aria-describedby", "pour-format"); input.autocomplete = "off";
          input.addEventListener("input", function () { message("feedback", ""); closeProof(); }); cell(tr, "").appendChild(input);
        }); $("rows").appendChild(tr);
      }
      current = { n: String(n.n), items: items, total: sum, left: minus(rat(1n, 1n), sum) };
      $("caption").textContent = "本轮只执行 " + n.n + " 次，逐项填写以初始水量为基准的比例。";
      $("active").hidden = false; message("feedback", "本轮记录表已建立；先自己算各次量、每个累计与余量，再核对。");
    } catch (error) { message("feedback", error.message, "retry"); }
  };
  $("check").onsubmit = function (event) {
    event.preventDefault();
    try {
      if (!current) throw Error("先选择有效次数并建立记录表。");
      if (records.has(current.n)) throw Error("本轮已经核对记录，请建立不同次数的新一轮。");
      current.items.forEach(function (item, i) {
        var k = i + 1;
        if (!same(num($("amount-" + k).value), item.amount)) throw Error("第" + k + "次倒出量还需核对；每次都按初始水量作基准。");
        if (!same(num($("sum-" + k).value), item.sum)) throw Error("第" + k + "次之后的累计不符；把截至这次的各次量相加。");
      });
      if (!same(num($("remaining").value), current.left)) throw Error("本轮余量还需核对：初始整体减去累计倒出量，填写精确比例。");
      var comparison = current.total.n < current.total.d ? "less" : current.total.n === current.total.d ? "equal" : "greater";
      if ($("compare").value !== comparison) throw Error("本轮累计与1的比较还需修改；可结合你算出的余量判断。");
      records.set(current.n, { total: current.total, left: current.left });
      var p = document.createElement("p"); p.textContent = "n=" + current.n + "：累计倒出 " + show(current.total) + "，剩余 " + show(current.left) + "（均为初始水量的比例）。"; $("history").appendChild(p); closeProof();
      message("feedback", "本轮每项、累计和余量均精确核对，已记录。完成不同次数后先写猜想；样本还不是一般说明。", "ok");
    } catch (error) { message("feedback", error.message, "retry"); }
  };
  $("conjecture").onsubmit = function (event) {
    event.preventDefault(); closeProof();
    if (records.size < 2 || !$("guess").value.trim() || !$("reason").value.trim()) { message("proof-feedback", "先记录两个不同次数的完整过程，再写自己的猜想和有限抵消草稿。", "retry"); return; }
    message("proof-feedback", "文字已保存在本页，尚未判定正确；请展开有限抵消说明，逐项对照修改。", "recorded"); $("proof").hidden = false;
  };
  $("n").addEventListener("input", clearRound);
  ["remaining", "compare"].forEach(function (id) { $(id).addEventListener(id === "compare" ? "change" : "input", function () { message("feedback", ""); closeProof(); }); });
  ["guess", "reason"].forEach(function (id) { $(id).addEventListener("input", closeProof); });
  $("reset").onclick = function () { records.clear(); $("history").textContent = ""; $("setup").reset(); $("conjecture").reset(); clearRound(); };
})();
