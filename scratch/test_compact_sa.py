script_addition = '''
  // === e3-8-3 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-chi-fig"), desc = document.getElementById("m-chi-desc"), trapFig = document.getElementById("m-chi-trap-fig"), tabs = document.querySelectorAll("#m-chi-tabs .micro-tab");
    if (!fig || !desc) return;
    function a_el(p, t, at, s) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in at) e.setAttribute(k, at[k]);
      if (s) e.textContent = s;
      p.appendChild(e);
      return e;
    }
    function txt(p, x, y, s, col, sz, w, anc) {
      var a = {x: x, y: y, fill: col || "var(--fg)", "font-size": sz || "11"};
      if (w) a["font-weight"] = w;
      if (anc) a["text-anchor"] = anc;
      return a_el(p, "text", a, s);
    }
    function line(p, x1, y1, x2, y2, strk, w, dash) {
      var a = {x1: x1, y1: y1, x2: x2, y2: y2, stroke: strk || "var(--line)", "stroke-width": w || "1.5"};
      if (dash) a["stroke-dasharray"] = dash;
      return a_el(p, "line", a);
    }
    function rect(p, x, y, w, h, fill, strk, rx) {
      var a = {x: x, y: y, width: w, height: h, fill: fill || "none"};
      if (strk) { a.stroke = strk; a["stroke-width"] = "1.5"; }
      if (rx) a.rx = rx;
      return a_el(p, "rect", a);
    }

    function drawTab1() {
      fig.innerHTML = "";
      txt(fig, 310, 22, "等高堆积条形图：按比例归一化，观察两柱分界台阶落差", "var(--fg)", 13, "700", "middle");
      line(fig, 80, 170, 520, 170); line(fig, 80, 170, 80, 35);
      txt(fig, 70, 174, "0%", "var(--muted)", 11, null, "end");
      txt(fig, 70, 105, "50%", "var(--muted)", 11, null, "end");
      txt(fig, 70, 40, "100%", "var(--muted)", 11, null, "end");

      rect(fig, 160, 40, 90, 130, "#e2e8f0", null, 4);
      rect(fig, 160, 131, 90, 39, "#f87171", null, 4);
      txt(fig, 205, 190, "常吃早餐 (50人)", "var(--fg)", 12, "700", "middle");
      txt(fig, 205, 154, "30% 困", "#fff", 11, "700", "middle");
      txt(fig, 205, 90, "70% 不困", "var(--muted)", 11, null, "middle");

      rect(fig, 350, 40, 90, 130, "#e2e8f0", null, 4);
      rect(fig, 350, 92, 90, 78, "#ef4444", null, 4);
      txt(fig, 395, 190, "不常吃早餐 (50人)", "var(--fg)", 12, "700", "middle");
      txt(fig, 395, 135, "60% 困", "#fff", 11, "700", "middle");
      txt(fig, 395, 68, "40% 不困", "var(--muted)", 11, null, "middle");

      line(fig, 250, 131, 350, 131, "#f87171", 1.5, "3 2");
      line(fig, 350, 92, 450, 92, "#ef4444", 1.5, "3 2");
      a_el(fig, "path", {d: "M 455,92 L 465,92 L 465,131 L 455,131", fill: "none", stroke: "#ef4444", "stroke-width": "1.5"});
      txt(fig, 472, 115, "落差 Δ = 30%", "#ef4444", 11, "700");
      desc.innerHTML = "<b>① 比例条形直觉</b>：将各组人数按 100% 归一化。「不常吃」犯困比例高达 60%，「常吃」仅 30%，两者分界线出现 30% 显著台阶落差，直观提示两变量存在关联倾向。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      txt(fig, 310, 22, "频数偏离理论期望：实际观察值与独立期望值的偏离量", "var(--fg)", 13, "700", "middle");
      var cells = [
        {x: 100, y: 40, t: "常吃 且 犯困 (a)", s: "实际: 15 | 期望: 22.5 (Δ = -7.5)", bg: "#fef2f2", bdr: "#fca5a5", tc: "#991b1b"},
        {x: 320, y: 40, t: "常吃 且 不困 (b)", s: "实际: 35 | 期望: 27.5 (Δ = +7.5)", bg: "#f0fdf4", bdr: "#86efac", tc: "#166534"},
        {x: 100, y: 110, t: "不常吃 且 犯困 (c)", s: "实际: 30 | 期望: 22.5 (Δ = +7.5)", bg: "#f0fdf4", bdr: "#86efac", tc: "#166534"},
        {x: 320, y: 110, t: "不常吃 且 不困 (d)", s: "实际: 20 | 期望: 27.5 (Δ = -7.5)", bg: "#fef2f2", bdr: "#fca5a5", tc: "#991b1b"}
      ];
      cells.forEach(function(c) {
        rect(fig, c.x, c.y, 200, 60, c.bg, c.bdr, 6);
        txt(fig, c.x + 12, c.y + 20, c.t, c.tc, 11.5, "700");
        txt(fig, c.x + 12, c.y + 40, c.s, "var(--fg)", 11);
      });
      line(fig, 200, 70, 420, 140, "#ef4444", 2, "3 2");
      line(fig, 420, 70, 200, 140, "#1976d2", 2, "3 2");
      a_el(fig, "circle", {cx: 310, cy: 105, r: 16, fill: "var(--fg)"});
      txt(fig, 310, 109, "|Δ|=750", "var(--card)", 10, "700", "middle");
      desc.innerHTML = "<b>② 频数偏离期望</b>：若独立，理论期望为 (行和×列和)/n。四个格子观察值均偏离期望达 7.5 人。交叉乘积差 |ad-bc| = |300-1050| = 750，平方后强力放大总偏离！";
    }

    function drawTab3() {
      fig.innerHTML = "";
      txt(fig, 310, 22, "反证决策拒绝域：小概率事件发生，推翻独立零假设", "var(--fg)", 13, "700", "middle");
      line(fig, 60, 170, 560, 170);
      txt(fig, 60, 188, "0", "var(--muted)", 11, null, "middle");
      txt(fig, 200, 188, "3.841(5%)", "var(--muted)", 11, null, "middle");
      txt(fig, 300, 188, "6.635(1%)", "var(--muted)", 11, null, "middle");
      txt(fig, 430, 188, "10.828(0.1%)", "#ef4444", 11, null, "middle");
      a_el(fig, "path", {d: "M 65,40 Q 100,130 160,155 T 320,167 T 540,170", fill: "none", stroke: "#1976d2", "stroke-width": "2.5"});
      a_el(fig, "path", {d: "M 300,166 L 300,170 L 550,170 L 540,170 Z", fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"});
      line(fig, 300, 100, 300, 170, "#ef4444", 1.5, "3 2");
      txt(fig, 320, 120, "拒绝域 (α=0.01)", "#b91c1c", 11, "700");
      line(fig, 380, 50, 380, 170, "#dc2626", 2);
      a_el(fig, "circle", {cx: 380, cy: 168, r: 5, fill: "#dc2626"});
      rect(fig, 335, 35, 90, 24, "#dc2626", null, 4);
      txt(fig, 380, 51, "χ² ≈ 9.091", "#fff", 11, "700", "middle");
      txt(fig, 380, 80, "深陷拒绝域！", "#dc2626", 10.5, "700", "middle");
      desc.innerHTML = "<b>③ 反证决策拒绝域</b>：若 H₀ 为真，χ² ≥ 6.635 的概率不足 1%（小概率事件）。实算 χ² = 9.091 &gt; 6.635 强势落入拒绝域，反证法确立结论：<b>有 99% 的把握认为两者有关联</b>！";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      txt(trapFig, 135, 22, "基准：比例完全相等 (ad=bc)", "#10b981", 11.5, "700", "middle");
      txt(trapFig, 405, 22, "陷阱：n=4 样本极小伪显著", "#ef4444", 11.5, "700", "middle");
      rect(trapFig, 60, 35, 50, 75, "#e2e8f0", null, 3);
      rect(trapFig, 60, 65, 50, 45, "#1976d2", null, 3);
      txt(trapFig, 85, 92, "60%", "#fff", 10, "700", "middle");
      rect(trapFig, 160, 35, 50, 75, "#e2e8f0", null, 3);
      rect(trapFig, 160, 65, 50, 45, "#1976d2", null, 3);
      txt(trapFig, 185, 92, "60%", "#fff", 10, "700", "middle");
      line(trapFig, 110, 65, 160, 65, "#10b981", 2, "2");
      txt(trapFig, 135, 126, "分界齐平 ➜ χ² = 0 (独立)", "#10b981", 10.5, "700", "middle");
      line(trapFig, 270, 15, 270, 135);
      rect(trapFig, 335, 35, 50, 75, "#e2e8f0", null, 3);
      rect(trapFig, 335, 35, 50, 75, "#ef4444", null, 3);
      txt(trapFig, 360, 76, "100%", "#fff", 10, "700", "middle");
      rect(trapFig, 430, 35, 50, 75, "#e2e8f0", null, 3);
      txt(trapFig, 455, 76, "0%", "var(--muted)", 10, null, "middle");
      txt(trapFig, 405, 126, "频数仅2人 ➜ 算得χ²=4不可信！", "#ef4444", 10.5, "700", "middle");
    }

    tabs.forEach(function(btn) {
      btn.addEventListener("click", function() {
        tabs.forEach(function(b) {
          b.classList.remove("active");
          b.style.background = "transparent";
          b.style.color = "var(--fg)";
        });
        btn.classList.add("active");
        btn.style.background = "var(--accent)";
        btn.style.color = "#fff";
        var tab = btn.getAttribute("data-tab");
        if (tab === "1") drawTab1();
        else if (tab === "2") drawTab2();
        else if (tab === "3") drawTab3();
      });
    });
    drawTab1();
    drawTrap();
  })();
'''

print("New compact script bytes:", len(script_addition.encode('utf-8')))
