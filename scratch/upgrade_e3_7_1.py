# upgrade_e3_7_1.py
import re
import os

filepath = 'highSchool/site/lessons/e3-7-1.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：必修二 10.1 概率与事件（<a href="b2-10-1.html">回看 10.1</a>）；10.2 互斥事件与加法公式（<a href="b2-10-2.html">回看 10.2</a>）。条件概率是信息更新后样本空间的收缩。</p>

  <div class="card">
    <p><b>条件概率 \(P(B|A)\)（缩小的样本空间）</b>：在「事件 \(A\) 已经发生」的既定前提下，事件 \(B\) 发生的概率，读作「在 \(A\) 条件下 \(B\) 的条件概率」。</p>
    <p>为什么分母会变：一旦已知 \(A\) 发生，不在 \(A\) 里的所有可能结果全部被排除！<b>整个样本空间从全局 \(\Omega\) 瞬间缩小为 \(A\)</b>。在新世界 \(A\) 里，只有 \(AB\) 这部分对 \(B\) 有贡献，因此：</p>
    <p>$$P(B|A) = \dfrac{P(AB)}{P(A)} = \dfrac{n(AB)}{n(A)}$$</p>
  </div>

  <div class="card">
    <p><b>联合概率 \(P(AB)\) 与乘法公式</b>：在全局样本空间中事件 \(A\) 与 \(B\) <b>同时发生</b>的概率。两者的桥梁是乘法公式：</p>
    <p>$$P(AB) = P(A) \cdot P(B|A) = P(B) \cdot P(A|B)$$</p>
  </div>

  <div class="card">
    <p><b>完备事件群（划分）与全概率公式</b>：若事件 \(A_1, A_2, \dots, A_n\) 两两互斥且它们的并不漏掉任何可能（\(\bigcup A_i = \Omega\)），就像把样本空间切成一块块拼图。任何事件 \(B\) 都可以被这组拼图分割，化整为零：</p>
    <p>$$P(B) = \sum_{i=1}^n P(A_i) P(B|A_i)$$</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-cond">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">条件概率与全概率微图解：缩小的样本空间、拼图全概率与贝叶斯逆推</span>
      <div class="micro-tabs" id="m-cond-tabs">
        <button class="micro-tab active" data-tab="1">① 缩小的样本空间（韦恩图视角）</button>
        <button class="micro-tab" data-tab="2">② 全概率公式（拼图化整为零）</button>
        <button class="micro-tab" data-tab="3">③ 贝叶斯逆推（由果溯因）</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-cond-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-cond-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">条件概率 \(P(B|A)\)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">局部世界</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>参照基准</b>：以已知条件 \(A\) 为全集（分母为 \(P(A)\) 或 \(n(A)\)）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>提问方式</b>：「已知甲先中奖，乙再中奖的概率是多少？」</p>
      <p class="small" style="margin:0;"><b>算式形态</b>：\(P(B|A) = \dfrac{P(AB)}{P(A)}\)</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">联合概率 \(P(AB)\)</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">全局世界</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>参照基准</b>：以最初的大样本空间 \(\Omega\) 为全集（分母为 \(1\) 或 \(n(\Omega)\)）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>提问方式</b>：「甲和乙两个人都中奖的概率是多少？」</p>
      <p class="small" style="margin:0;"><b>算式形态</b>：\(P(AB) = P(A) \cdot P(B|A)\)</p>
    </div>
  </div>

  <h3>2. 条件概率、全概率与贝叶斯主公式</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">核心公式全家桶：</p>
    <p style="margin:0 0 6px 0;">条件概率定义：\(P(B|A) = \color{#1976d2}{\dfrac{P(AB)}{P(A)}} = \color{#1976d2}{\dfrac{n(AB)}{n(A)}}\quad (\color{#1976d2}{\text{分母换成新世界 } A})\)</p>
    <p style="margin:0 0 6px 0;">乘法公式：\(P(AB) = \color{#1976d2}{P(A)} \cdot \color{#2e7d32}{P(B|A)}\)</p>
    <p style="margin:0 0 6px 0;">全概率公式（化整为零）：\(P(B) = \sum_{i=1}^n \color{#1976d2}{P(A_i)} \cdot \color{#2e7d32}{P(B|A_i)}\quad (\text{划分 } A_1,\dots,A_n \text{ 互斥且穷尽})\)</p>
    <p style="margin:0;">贝叶斯公式（由果溯因）：\(P(A_k|B) = \dfrac{\color{#1976d2}{P(A_k)} \cdot \color{#2e7d32}{P(B|A_k)}}{\sum_{i=1}^n \color{#1976d2}{P(A_i)} \cdot \color{#2e7d32}{P(B|A_i)}} = \dfrac{\text{该条分支概率}}{\text{全概率综合}}\)</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：掷一颗均匀的骰子，已知点数大于 \(2\)，点数是偶数的概率是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac12\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac13\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac23\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac14\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。已知大于 \(2\)，只剩 \(\{3,4,5,6\}\)，其中偶数 \(4,6\)，概率 \(\dfrac24=\dfrac12\)。选 B 的同学用了 \(\dfrac26\)，那是「大于 \(2\) 并且是偶数」的概率，分母没换成 \(4\)。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\(10\) 张奖券里有 \(2\) 张中奖。甲先抽一张，乙再抽一张（不放回）。两人都中奖的概率是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac1{45}\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac1{25}\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac2{45}\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac15\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\dfrac2{10}\times\dfrac19=\dfrac1{45}\)：甲中奖后只剩 \(9\) 张、其中 \(1\) 张中奖。选 B 的同学算成 \(\dfrac2{10}\times\dfrac2{10}\)，那是抽完放回去的情形。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：某工厂甲、乙两车间生产同一种产品。甲车间产量占全厂的 \(60\%\)，次品率为 \(2\%\)；乙车间产量占 \(40\%\)，次品率为 \(1\%\)。<br>
    ① 从全厂产品中任取一件，求它是次品的概率；<br>
    ② 若已知取出的这一件是次品，求它是由甲车间生产的概率。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">设事件 \(A_1\) = 甲车间生产，\(A_2\) = 乙车间生产，\(B\) = 产品是次品。注意到 \(A_1, A_2\) 构成全集的完备划分（互斥且和为 1）。问①是<b>正向求整体结果 \(P(B)\)（全概率公式）</b>；问②是<b>已知结果 \(B\) 反推原因 \(A_1\)（贝叶斯公式）</b>！</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步两阶段套公式求解</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 全概率公式计算综合次品率 \(P(B)\)</b>：<br>
          $$P(B) = P(A_1)P(B|A_1) + P(A_2)P(B|A_2) = 0.6 \times 0.02 + 0.4 \times 0.01 = 0.012 + 0.004 = 0.016$$
          • <b>② 贝叶斯公式逆推归因 \(P(A_1|B)\)</b>：<br>
          $$P(A_1|B) = \dfrac{P(A_1 B)}{P(B)} = \dfrac{P(A_1)P(B|A_1)}{P(B)} = \dfrac{0.012}{0.016} = \dfrac{3}{4} = 0.75$$
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步防坑结论核查</b>：
        <span class="small">全厂总体次品率是 \(1.6\%\)；一旦发现次品，它来自甲车间的后验概率高达 \(75\%\)（甲车间不仅产量多，次品率还是乙车间的 2 倍）。防坑：切勿把 \(P(A_1|B)\)（已知次品求来自甲）与 \(P(B|A_1)\)（甲车间次品率 2%）颠倒！</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="C">
    <p>自己试试：回到例 2 的盒子（\(3\) 红 \(2\) 白，不放回摸两次）。<b>第二次</b>摸到红球的概率是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac3{10}\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac12\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac35\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac34\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。按第一次的颜色分两种情况：\(\dfrac35\times\dfrac24+\dfrac25\times\dfrac34=\dfrac6{20}+\dfrac6{20}=\dfrac35\)，和第一次一样。选 A 的同学只算了「第一次红」那一块，漏了「第一次白、第二次红」。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：分母未缩小，将条件概率 \(P(B|A)\) 错算成联合概率 \(P(AB)\)</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：投掷骰子，已知点数大于 2，求是偶数的概率。直接写 \(2/6 = 1/3\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：条件概率分母必须换成新世界！已知点数大于 2，样本空间缩小为 \(\{3,4,5,6\}\) 共 4 种可能，偶数是 4, 6 两种，条件概率是 \(2/4 = 1/2\)！\(2/6\) 是「点数既大于 2 又是偶数」的联合概率 \(P(AB)\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：因果倒置，混淆 \(P(B|A)\) 与 \(P(A|B)\)（经典检测悖论）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：某疾病检出率为 99%（真病人呈阳性概率 \(P(+|D) = 0.99\)），便误以为「某人体检呈阳性，他有病的概率 \(P(D|+)\) 也是 99%」。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：因果方向不可逆！若人群患病率很低（如 0.1%），绝大多数阳性其实是健康人的假阳性。必须使用贝叶斯公式将先验概率与假阳性率综合折算，\(P(D|+)\) 往往只有百分之十几，绝非 99%！</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：全概率公式漏掉「未发生」的分支，划分不完备</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：不放回摸球，算第二次摸出红球的概率，只算「第一次摸红、第二次摸红」的概率，漏掉「第一次摸白、第二次摸红」。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：全概率公式必须做到<b>不重不漏穷尽全集</b>！第一次摸球的结果只有红和白两种，必须把两支全部加起来：\(P(B) = P(A_1)P(B|A_1) + P(A_2)P(B|A_2)\)。抽签、摸奖中，不论第几个抽，中奖概率完全均等！</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：缩小的样本空间与分母置换直觉</div>
    <svg class="micro-fig" id="m-cond-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      全集 Ω 压缩为 A，分母从整个矩形面积缩减为 A 的面积，P(B|A) 是交集 AB 占 A 的面积比。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-7-1
script_code = r'''
  // === e3-7-1 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-cond-fig");
    var desc = document.getElementById("m-cond-desc");
    var trapFig = document.getElementById("m-cond-trap-fig");
    var tabs = document.querySelectorAll("#m-cond-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 缩小的样本空间 韦恩图 (全集 Omega -> 事件 A)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "已知 A 发生：样本空间从全集 Ω 压缩为 A（分母置换）"));

      // Omega bounding box (dimmed)
      fig.appendChild(el("rect", {x: 60, y: 35, width: 500, height: 145, rx: 10, fill: "#f9fafb", stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 80, y: 55, "font-size": "12", "font-weight": "700", fill: "var(--muted)"}, "全集 Ω (原世界)"));

      // Circle A (Known condition)
      fig.appendChild(el("circle", {cx: 240, cy: 110, r: 55, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("text", {x: 200, y: 115, "font-size": "13", "font-weight": "700", fill: "#1976d2"}, "A (新分母)"));

      // Circle B (Target event)
      fig.appendChild(el("circle", {cx: 340, cy: 110, r: 55, fill: "none", stroke: "#10b981", "stroke-width": "2", "stroke-dasharray": "4 2"}));
      fig.appendChild(el("text", {x: 375, y: 115, "font-size": "13", "font-weight": "700", fill: "#10b981"}, "B"));

      // Overlap AB
      fig.appendChild(el("path", {d: "M 290 67 A 55 55 0 0 1 290 153 A 55 55 0 0 1 290 67 Z", fill: "#f59e0b", opacity: "0.85"}));
      fig.appendChild(el("text", {x: 290, y: 114, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#fff"}, "AB"));

      // Right Explanation card
      fig.appendChild(el("rect", {x: 430, y: 50, width: 120, height: 115, rx: 6, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 490, y: 72, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#1976d2"}, "P(B|A) 测量比"));
      fig.appendChild(el("text", {x: 490, y: 95, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#f59e0b"}, "n(AB) / n(A)"));
      fig.appendChild(el("text", {x: 490, y: 120, "text-anchor": "middle", "font-size": "10", fill: "var(--muted)"}, "非 A 区域全部淘汰"));
      fig.appendChild(el("text", {x: 490, y: 142, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#ef4444"}, "分母不再是 Ω！"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "P(B|A) 是交集 AB 在新世界 A 内部占据的相对比例"));
      desc.innerHTML = "<b>① 缩小的样本空间直觉</b>：当已知事件 A 发生时，样本空间瞬间坍缩为集合 A（非 A 部分被信息过滤排除）。此时事件 B 能够发生的唯一可能就是交集 AB，因此条件概率就是交集面积除以 A 的面积：<b>P(B|A) = P(AB) / P(A)</b>。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 全概率公式（拼图分割化整为零）
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "全概率公式：把目标事件 B 按照完备划分 A₁, A₂, A₃ 化整为零相加"));

      // Omega divided into 3 pieces
      fig.appendChild(el("rect", {x: 70, y: 40, width: 160, height: 130, fill: "#e3f2fd", stroke: "var(--line)", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 150, y: 65, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "A₁ 块 (40%)"));

      fig.appendChild(el("rect", {x: 230, y: 40, width: 160, height: 130, fill: "#e8f5e9", stroke: "var(--line)", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 310, y: 65, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "A₂ 块 (35%)"));

      fig.appendChild(el("rect", {x: 390, y: 40, width: 160, height: 130, fill: "#fef3c7", stroke: "var(--line)", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 470, y: 65, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#d97706"}, "A₃ 块 (25%)"));

      // Event B passing through all 3 pieces
      fig.appendChild(el("ellipse", {cx: 310, cy: 120, rx: 200, ry: 35, fill: "#ef4444", opacity: "0.25", stroke: "#ef4444", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 150, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "BA₁ 瓣"));
      fig.appendChild(el("text", {x: 310, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "BA₂ 瓣"));
      fig.appendChild(el("text", {x: 470, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "BA₃ 瓣"));

      fig.appendChild(el("text", {x: 310, y: 198, "text-anchor": "middle", "font-size": "12.5", "font-weight": "700", fill: "#ef4444"}, "P(B) = P(A₁)P(B|A₁) + P(A₂)P(B|A₂) + P(A₃)P(B|A₃)"));
      desc.innerHTML = "<b>② 全概率公式直觉</b>：当直接求事件 B 的概率很困难时，可以利用互斥且穷尽的划分 \(A_1, A_2, A_3\)（就像把土地划片），把 B 切割成各小瓣 \(BA_1, BA_2, BA_3\)。各小瓣概率用乘法公式算出，最后相加得到整体概率。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 贝叶斯逆推（由果溯因）
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "贝叶斯逆推：已知结果 B 发生，反查出自原因 Aₖ 的后验概率"));

      // Tree from Root to A1/A2, then to B
      // Root (x=80, y=105)
      fig.appendChild(el("circle", {cx: 80, cy: 105, r: 6, fill: "var(--fg)"}));
      fig.appendChild(el("text", {x: 80, y: 130, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--fg)"}, "产品起点"));

      // Branch A1 (甲机 60%)
      fig.appendChild(el("line", {x1: 80, y1: 105, x2: 240, y2: 65, stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("text", {x: 160, y: 75, "font-size": "10.5", "font-weight": "700", fill: "#1976d2"}, "甲车间 P(A₁)=0.6"));

      // Branch A2 (乙机 40%)
      fig.appendChild(el("line", {x1: 80, y1: 105, x2: 240, y2: 145, stroke: "#2e7d32", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 160, y: 140, "font-size": "10.5", "font-weight": "700", fill: "#2e7d32"}, "乙车间 P(A₂)=0.4"));

      // Sub-branch to Defect B
      // A1 -> Defect (2%) -> P(A1 B) = 0.012
      fig.appendChild(el("line", {x1: 240, y1: 65, x2: 400, y2: 65, stroke: "#ef4444", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 320, y: 55, "font-size": "10.5", fill: "#ef4444"}, "次品率 2%"));
      fig.appendChild(el("rect", {x: 400, y: 50, width: 130, height: 30, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 465, y: 70, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "甲次品 = 0.012 (75%)"));

      // A2 -> Defect (1%) -> P(A2 B) = 0.004
      fig.appendChild(el("line", {x1: 240, y1: 145, x2: 400, y2: 145, stroke: "#ef4444", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 320, y: 135, "font-size": "10.5", fill: "#ef4444"}, "次品率 1%"));
      fig.appendChild(el("rect", {x: 400, y: 130, width: 130, height: 30, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 465, y: 150, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "乙次品 = 0.004 (25%)"));

      fig.appendChild(el("text", {x: 310, y: 198, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "已知是次品(总量 0.016)：来自甲的概率 = 0.012 / 0.016 = 75%！"));
      desc.innerHTML = "<b>③ 贝叶斯逆推直觉</b>：全厂次品总概率为 0.012 + 0.004 = 0.016。当质检查出某件是次品时，我们在所有的次品堆中反查来源：甲车间贡献了 0.012（占 75%），乙车间贡献了 0.004（占 25%）。所以该次品来自甲车间的后验概率高达 <b>75%</b>。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#1976d2"}, "条件概率 P(B|A) = n(AB) / n(A)"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "联合概率 P(AB) = n(AB) / n(Ω)"));

      // Left: A is the base
      trapFig.appendChild(el("rect", {x: 50, y: 40, width: 180, height: 60, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2"}));
      trapFig.appendChild(el("text", {x: 90, y: 75, "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "新基准 A"));
      trapFig.appendChild(el("rect", {x: 150, y: 45, width: 70, height: 50, rx: 4, fill: "#f59e0b", opacity: "0.85"}));
      trapFig.appendChild(el("text", {x: 185, y: 75, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#fff"}, "AB"));
      trapFig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "分母是 A 的面积（如掷骰点数>2，分母为4）"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Omega is the base
      trapFig.appendChild(el("rect", {x: 300, y: 40, width: 200, height: 60, rx: 6, fill: "#f3f4f6", stroke: "var(--line)", "stroke-width": "1.5"}));
      trapFig.appendChild(el("text", {x: 330, y: 60, "font-size": "10", fill: "var(--muted)"}, "全集 Ω"));
      trapFig.appendChild(el("rect", {x: 430, y: 55, width: 45, height: 35, rx: 4, fill: "#f59e0b", opacity: "0.5"}));
      trapFig.appendChild(el("text", {x: 452, y: 77, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#d97706"}, "AB"));
      trapFig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "分母是整个 Ω（分母为 6，算成了 2/6 = 1/3）"));
    }

    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        tabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var idx = tab.getAttribute("data-tab");
        if (idx === "1") drawTab1();
        else if (idx === "2") drawTab2();
        else if (idx === "3") drawTab3();
      });
    });

    drawTab1();
    drawTrap();
  })();
'''

# Insert script before the last </script>
last_script_close = html.rfind('</script>')
assert last_script_close != -1, 'No </script> found'
html = html[:last_script_close] + script_code + '\n' + html[last_script_close:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)

print('Upgrade e3-7-1 completed! File size:', len(html.encode('utf-8')), 'bytes')
