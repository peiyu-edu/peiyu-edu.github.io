(function () {
  "use strict";
  var root = document.getElementById("vieta-workshop");
  if (!root || !document.body || document.body.dataset.sec !== "j25-2" || root.dataset.vietaReady) return;
  root.dataset.vietaReady = "1";
  function $(id) { return root.querySelector("#vw-" + id); }
  function abs(n) { return n < 0n ? -n : n; }
  function rat(n, d) { if (!d) throw Error("分母不能为0。"); if (d < 0n) { n = -n; d = -d; } var a = abs(n), b = d; while (b) { var t = a % b; a = b; b = t; } return { n: n / a, d: d / a }; }
  function num(raw) { var s = raw.replace(/[０-９]/g, function (c) { return String(c.charCodeAt(0) - 65296); }).replace(/[−－]/g, "-").replace(/＋/g, "+").replace(/／/g, "/").replace(/．/g, ".").trim(), m;
    if (!s || s.length > 60) throw Error("请先按声明语法填写精确数值。");
    if ((m = /^([+-]?\d{1,12})\s*\/\s*(\+?\d{1,12})$/.exec(s))) return rat(BigInt(m[1]), BigInt(m[2]));
    if (!(m = /^([+-]?)(\d{0,12})(?:\.(\d{1,12}))?$/.exec(s)) || !(m[2] || m[3])) throw Error("数值格式不符；不要拼数字、写算式、指数或根式。");
    var f = m[3] || ""; return rat(BigInt((m[1] === "-" ? "-" : "") + (m[2] || "0") + f), 10n ** BigInt(f.length));
  }
  function add(a, b) { return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
  function neg(a) { return rat(-a.n, a.d); }
  function sub(a, b) { return add(a, neg(b)); }
  function mul(a, b) { return rat(a.n * b.n, a.d * b.d); }
  function div(a, b) { return rat(a.n * b.d, a.d * b.n); }
  function eq(a, b) { return a.n === b.n && a.d === b.d; }
  function show(a) { return a.d === 1n ? String(a.n) : a.n + "/" + a.d; }
  function polynomial(a, b, c, x) { return add(add(mul(a, mul(x, x)), mul(b, x)), c); }
  function delta(a, b, c) { return sub(mul(b, b), mul(rat(4n, 1n), mul(a, c))); }
  function equation(a, b, c) { return "(" + show(a) + ")x² + (" + show(b) + ")x + (" + show(c) + ") = 0"; }
  function kind(d) { return d.n > 0n ? "distinct" : d.n === 0n ? "repeated" : "none"; }
  function kindText(k) { return k === "distinct" ? "两个不相等实根" : k === "repeated" ? "两个相等实根（一个不同实数值）" : "无实数根"; }
  var construct = null, original = null, records = new Map();
  function message(id, text, state) { $(id).textContent = text; if (state) $(id).dataset.state = state; else delete $(id).dataset.state; }
  function closeGuide() { $("guide").hidden = true; $("guide").open = false; message("guide-feedback", ""); }
  function clearWork(mode) { $(mode + "-work").reset(); message(mode + "-feedback", ""); closeGuide(); }
  function invalid(mode) { if (mode === "construct") construct = null; else original = null; $(mode + "-work").hidden = true; $(mode + "-prompt").textContent = ""; clearWork(mode); }
  function parameters(ids) { var vals = ids.map(function (id) { return num($(id).value); }); if (vals.some(function (v) { return abs(v.n) > 20n * v.d || v.d > 20n; })) throw Error("自选参数绝对值须≤20，约分后分母≤20；结果可超出参数范围。"); return vals; }
  function answer(id, expected, label) { if (!eq(num($(id).value), expected)) throw Error(label + "需重新核对，请沿用本次参数与原符号。"); }
  function record(key, mode, text) { var existed = records.has(key); if (!existed && records.size >= 12) throw Error("本轮最多12条记录，清空后可重新比较。"); records.set(key, { mode: mode, text: text }); $("records").textContent = ""; records.forEach(function (r) { var p = document.createElement("p"); p.className = "small"; p.textContent = r.text; $("records").appendChild(p); }); closeGuide(); return existed; }
  $("construct-setup").onsubmit = function (e) { e.preventDefault(); try { var v = parameters(["u", "v", "scale"]); if (!v[2].n) throw Error("首项系数A不能为0，否则不再是一元二次方程。"); construct = { u: v[0], v: v[1], a: v[2] }; clearWork("construct"); $("construct-work").hidden = false; $("construct-prompt").textContent = "本次 u=" + show(v[0]) + "，v=" + show(v[1]) + "，A=" + show(v[2]) + "；其余系数、检验值与判断由你填写。"; } catch (err) { invalid("construct"); message("construct-feedback", err.message, "retry"); } };
  $("root-setup").onsubmit = function (e) { e.preventDefault(); try { var v = parameters(["a", "b", "c", "r"]); if (!v[0].n) throw Error("原方程a不能为0，否则不再是一元二次方程。"); original = { a: v[0], b: v[1], c: v[2], r: v[3] }; clearWork("root"); $("root-work").hidden = false; $("root-prompt").textContent = "原方程 " + equation(v[0], v[1], v[2]) + "；声称的根r=" + show(v[3]) + "，请先自行检验。"; } catch (err) { invalid("root"); message("root-feedback", err.message, "retry"); } };
  $("construct-work").onsubmit = function (e) { e.preventDefault(); try {
    if (!construct) throw Error("先采用两数与首项系数。"); var q = construct, sum = add(q.u, q.v), product = mul(q.u, q.v), b = num($("build-b").value), c = num($("build-c").value), d = delta(q.a, b, c);
    if (!eq(b, neg(mul(q.a, sum)))) throw Error("一次项系数B与两数及所选A不一致，注意两根之和中的负号。"); if (!eq(c, mul(q.a, product))) throw Error("常数项C与两数之积及所选A不一致。");
    answer("build-sum", sum, "两根之和"); answer("build-product", product, "两根之积"); answer("build-delta", d, "判别式"); var pu = polynomial(q.a, b, c, q.u), pv = polynomial(q.a, b, c, q.v); answer("build-u-value", pu, "u代回的值"); answer("build-v-value", pv, "v代回的值");
    if (pu.n || pv.n || d.n < 0n) throw Error("构造须同时满足两次代回为0且有实根，请重新核对。"); if ($("build-kind").value !== kind(d)) throw Error("实根情况需重查判别式；相等两根也允许，注意重数与不同数值的区别。"); var reason = $("build-reason").value.trim(); if (!reason) throw Error("请记录构造方法和检验理由，文字仅供自检。");
    var existed = record(["construct", show(q.a), show(q.u), show(q.v)].join("|"), "construct", "构造：u=" + show(q.u) + "，v=" + show(q.v) + "；" + equation(q.a, b, c) + "；和=" + show(sum) + "，积=" + show(product) + "，Δ=" + show(d) + "；两次代回均为0；" + kindText(kind(d)) + "。我的理由：" + reason);
    message("construct-feedback", "本次系数、和积、判别式、两次代回与实根判断核对一致，" + (existed ? "已更新记录。" : "已记录。") + "自由理由尚未判定正确，有限记录不代替一般证明。", "recorded");
  } catch (err) { message("construct-feedback", err.message, "retry"); } };
  $("root-work").onsubmit = function (e) { e.preventDefault(); try {
    if (!original) throw Error("先采用原方程和待核的根。"); var q = original, d = delta(q.a, q.b, q.c); answer("find-delta", d, "原方程判别式"); if (d.n < 0n) throw Error("原方程Δ<0，无实数根，不能使用“已知实根”的前提；请更换原方程。");
    var pr = polynomial(q.a, q.b, q.c, q.r); answer("find-r-value", pr, "r代入原方程的值"); if (pr.n) throw Error("r代回原方程不为0，声称的已知根不成立；不能仅凑和积，先修正原方程或r。");
    var sum = neg(div(q.b, q.a)), product = div(q.c, q.a), other = num($("find-other").value); answer("find-sum", sum, "由系数求的两根之和"); answer("find-product", product, "由系数求的两根之积"); if (!eq(other, sub(sum, q.r))) throw Error("另一根s需核对，注意两根之和是−b/a；已知根为0时也可用和求另一根。");
    var ps = polynomial(q.a, q.b, q.c, other); answer("find-s-value", ps, "s代回原方程的值"); if (ps.n || !eq(mul(q.r, other), product)) throw Error("另一根还须满足原方程与根的积，不能只凑根的和。"); if ($("find-kind").value !== kind(d)) throw Error("实根情况与判别式不符，请区分两个不等根和两个相等根。"); var reason = $("find-reason").value.trim(); if (!reason) throw Error("请留下求根与检验前提的理由，文字仅供自检。");
    var existed = record(["root", show(q.a), show(q.b), show(q.c), show(q.r)].join("|"), "root", "迁移：" + equation(q.a, q.b, q.c) + "；r=" + show(q.r) + "，s=" + show(other) + "；和=" + show(sum) + "，积=" + show(product) + "，Δ=" + show(d) + "；两根代回原方程均为0；" + kindText(kind(d)) + "。我的理由：" + reason);
    message("root-feedback", "原方程首项非0、实根条件、已知根与另一根的代回、和积和判断均核对一致，" + (existed ? "已更新记录。" : "已记录。") + "自由理由尚未判定正确，未认证纸笔或同伴经历。", "recorded");
  } catch (err) { message("root-feedback", err.message, "retry"); } };
  ["u", "v", "scale"].forEach(function (id) { $(id).addEventListener("input", function () { invalid("construct"); }); }); ["a", "b", "c", "r"].forEach(function (id) { $(id).addEventListener("input", function () { invalid("root"); }); });
  ["construct", "root"].forEach(function (mode) { $(mode + "-work").addEventListener("input", function () { message(mode + "-feedback", ""); closeGuide(); }); $(mode + "-work").addEventListener("change", function () { message(mode + "-feedback", ""); closeGuide(); }); });
  $("open-guide").onclick = function () { var all = Array.from(records.values()); if (!all.some(function (r) { return r.mode === "construct"; }) || !all.some(function (r) { return r.mode === "root"; })) { message("guide-feedback", "先完成一条构造和一条已知根迁移，再对照一般依据。", "retry"); return; } $("guide").hidden = false; message("guide-feedback", "已开放一般依据供逐条自检；不表示自由文字或一般证明已自动判正确。", "selfcheck"); };
  $("reset").onclick = function () { records.clear(); $("records").textContent = ""; $("construct-setup").reset(); $("root-setup").reset(); invalid("construct"); invalid("root"); };
})();
