# upgrade_e3_7_3.py
import re
import os

filepath = 'highSchool/site/lessons/e3-7-3.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：7.2 分布列与概率性质（<a href="e3-7-2.html">回看 7.2</a>）；必修二 9.2 样本均值与方差（<a href="b2-9-2.html">回看 9.2</a>）。期望与方差是用两个核心数刻画随机变量全貌的指标。</p>

  <div class="card">
    <p><b>数学期望 \(E(X)\)（概率加权平均值 / 物理重心）</b>：随机变量 \(X\) 的所有可能取值与其对应概率乘积的总和，记作 \(E(X)\) 或 \(\mu\)：</p>
    <p>$$E(X) = x_1 p_1 + x_2 p_2 + \cdots + x_n p_n$$</p>
    <p>直觉：就像杠杆原理，每个取值 \(x_i\) 是秤杆上的刻度，概率 \(p_i\) 是挂在该位置的重物，<b>期望 \(E(X)\) 正好就是让杠杆保持绝对平衡的支点位置</b>！</p>
  </div>

  <div class="card">
    <p><b>方差 \(D(X)\) 与标准差 \(\sigma(X)\)（偏离中心的波动与风险）</b>：各可能取值偏离均值的平方的概率加权平均值，记作 \(D(X)\) 或 \(\operatorname{Var}(X)\)：</p>
    <p>$$D(X) = \sum_{i=1}^n (x_i - E(X))^2 p_i = E(X^2) - [E(X)]^2$$</p>
    <p>标准差 \(\sigma(X) = \sqrt{D(X)}\) 是方差的算术平方根（与 \(X\) 具有相同量纲单位）。方差越大，说明数据分布越分散、波动越剧烈、风险越高。</p>
  </div>

  <div class="card">
    <p><b>线性变换法则（平移与放缩）</b>：若 \(Y = aX + b\)（\(a, b\) 为常数）：</p>
    <p>• 期望：\(E(aX + b) = aE(X) + b\)（均值随之同比例拉伸并平移）；<br>
    • 方差：\(D(aX + b) = a^2 D(X)\)（<b>常数 \(b\) 整体平移不改变离散离度，倍数 \(a\) 平方放大</b>）；<br>
    • 标准差：\(\sigma(aX + b) = |a|\sigma(X)\)（恒为非负）。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-stat">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">数字特征直觉微图解：杠杆支点期望、方差波动度量与线性变换</span>
      <div class="micro-tabs" id="m-stat-tabs">
        <button class="micro-tab active" data-tab="1">① 杠杆平衡重心直觉（期望）</button>
        <button class="micro-tab" data-tab="2">② 均值相同但方差悬殊（风险）</button>
        <button class="micro-tab" data-tab="3">③ 线性变换 Y = aX + b 的几何拉伸</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-stat-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-stat-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">数学期望 \(E(X)\)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">中心位置</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>度量对象</b>：随机变量的加权中心平均水平（重心）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>公式</b>：\(E(X) = \sum x_i p_i\)。</p>
      <p class="small" style="margin:0;"><b>运算</b>：\(E(aX+b) = aE(X)+b\)（线性平移放缩）。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">方差 \(D(X)\) 与标准差 \(\sigma\)</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">离散程度</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>度量对象</b>：数据偏离重心的离散波动程度（风险）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>公式</b>：\(D(X) = E(X^2) - [E(X)]^2\)。</p>
      <p class="small" style="margin:0;"><b>运算</b>：\(D(aX+b) = a^2 D(X)\)（常数 \(b\) 平移彻底消失）。</p>
    </div>
  </div>

  <h3>2. 期望与方差主公式与两点分布特征</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">核心公式与特殊分布：</p>
    <p style="margin:0 0 6px 0;">数学期望：\(E(X) = \sum_{i=1}^n \color{#1976d2}{x_i} \cdot \color{#2e7d32}{p_i}\)</p>
    <p style="margin:0 0 6px 0;">方差快捷算法：\(D(X) = \color{#d97706}{E(X^2)} - [\color{#ef4444}{E(X)}]^2 = \sum \color{#1976d2}{x_i^2}\color{#2e7d32}{p_i} - \mu^2\)</p>
    <p style="margin:0 0 6px 0;">线性性质：\(E(aX+b) = aE(X)+b,\quad D(aX+b) = \color{#ef4444}{a^2} D(X),\quad \sigma(aX+b) = \color{#ef4444}{|a|}\sigma(X)\)</p>
    <p style="margin:0;">两点分布 \(X \sim B(1, p)\)：\(E(X) = p,\quad D(X) = p(1-p)\)</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：\(X\) 取 \(1,2,3\) 的概率分别是 \(0.2,0.5,0.3\)。\(E(X)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(2\)</button>
      <button class="opt" data-v="B"><b>B</b>\(2.1\)</button>
      <button class="opt" data-v="C"><b>C</b>\(6\)</button>
      <button class="opt" data-v="D"><b>D</b>\(1\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(1\times0.2+2\times0.5+3\times0.3=0.2+1+0.9=2.1\)。选 A 的同学把 \(1,2,3\) 直接平均了，等于把三个概率都当成 \(\dfrac13\)；可 \(3\) 的概率 \(0.3\) 比 \(1\) 的 \(0.2\) 大，均值要往 \(3\) 那边偏一点。选 C 是只把取值加起来、没乘概率。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\(X\) 取 \(1\) 和 \(3\)，概率各 \(0.5\)。\(D(X)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(2\)</button>
      <button class="opt" data-v="C"><b>C</b>\(3\)</button>
      <button class="opt" data-v="D"><b>D</b>\(5\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(E(X)=2\)，两个值离 \(2\) 都是 \(1\)，\(D(X)=1^2\times0.5+1^2\times0.5=1\)。或者 \(E(X^2)=\dfrac{1+9}2=5\)，\(D(X)=5-2^2=1\)。选 B 是偏离平方后忘了乘概率；选 C 是算成了 \(E(X^2)-E(X)\)，均值忘了平方；选 D 只算了 \(E(X^2)\)。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：某投资人有两种投资方案。方案 A 的年收益率 \(X\)（万元）分布列为：\(P(X=-10)=0.2,\; P(X=10)=0.6,\; P(X=30)=0.2\)；方案 B 的年收益率 \(Y\)（万元）分布列为：\(P(Y=0)=0.3,\; P(Y=10)=0.4,\; P(Y=20)=0.3\)。<br>
    ① 计算两方案的数学期望 \(E(X)\) 与 \(E(Y)\)；<br>
    ② 计算两方案的方差 \(D(X)\) 与 \(D(Y)\)，并给出投资决策建议。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">期望反映<b>平均收益水平</b>，方差反映<b>收益的风险波动度</b>。解题次序：先由定义式算期望，再用定义或捷径公式算方差。</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步求出数字特征数值</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 计算期望</b>：<br>
          \(E(X) = (-10)\times0.2 + 10\times0.6 + 30\times0.2 = -2 + 6 + 6 = 10\text{ 万元}\)；<br>
          \(E(Y) = 0\times0.3 + 10\times0.4 + 20\times0.3 = 0 + 4 + 6 = 10\text{ 万元}\)。<br>
          两方案期望相同，说明长期平均收益完全一致。<br>
          • <b>② 计算方差</b>：<br>
          \(D(X) = (-10-10)^2\times0.2 + (10-10)^2\times0.6 + (30-10)^2\times0.2 = 400\times0.2 + 0 + 400\times0.2 = 160\)；<br>
          \(D(Y) = (0-10)^2\times0.3 + (10-10)^2\times0.4 + (20-10)^2\times0.3 = 100\times0.3 + 0 + 100\times0.3 = 60\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步双维度综合决策与防坑核查</b>：
        <span class="small">两方案期望收益均为 10 万元；但 \(D(X) = 160 > D(Y) = 60\)，说明方案 A 波动剧烈、可能面临亏损（-10 万元），风险极高；方案 B 波动小、不亏损、平稳度高。稳健型投资者应选择方案 B。防坑：切勿只比期望大小，高考大题常考期望相同时比方差！</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="B">
    <p>自己试试：\(E(X)=3\)，\(D(X)=4\)，\(Y=-2X+1\)。\(\sigma(Y)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(-4\)</button>
      <button class="opt" data-v="B"><b>B</b>\(4\)</button>
      <button class="opt" data-v="C"><b>C</b>\(16\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-7\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(\sigma(X)=\sqrt4=2\)，\(\sigma(Y)=|-2|\times2=4\)；或 \(D(Y)=(-2)^2\times4=16\)，开方得 \(4\)。选 A 把 \(-2\) 直接乘上去了，可标准差是非负平方根，不会是负数。C 是 \(D(Y)\)，还没开方。D 是把 \(E\) 的公式套到了 \(D\) 上：\(-2\times4+1\)。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：把数学期望当成各取值的「算术平均数」，直接相加除以 \(n\)</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：\(X\) 取 1, 2, 3，概率分别为 0.2, 0.5, 0.3，直接算 \((1+2+3)/3 = 2\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：数学期望是<b>加权平均数</b>！每个值的权重是它发生的概率：\(E(X) = 1\times0.2 + 2\times0.5 + 3\times0.3 = 2.1\)！只有在各个值发生概率完全相等的特例下，期望才等于算术平均数。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：线性变换算方差时常数项 \(b\) 盲目带入或漏平方</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：已知 \(D(X) = 4\)，求 \(D(3X - 5)\) 时写成 \(3\times4 - 5 = 7\) 或 \(3\times4 = 12\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>平移不改变离散离度，常数 \(b\) 彻底清零！倍数 \(a\) 必须平方！</b>由方差定义，\(D(aX+b) = a^2 D(X)\)，故 \(D(3X-5) = 3^2 \times 4 = 36\)！常数 -5 毫无影响。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：标准差写出负数（符号运算大意）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：\(\sigma(X) = 2\)，算 \(\sigma(-3X + 2)\) 时直接写成 \(-3\times2 = -6\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>标准差作为算术平方根，恒为非负数</b>！线性公式是 \(\sigma(aX+b) = |a|\sigma(X)\)，负号必须取绝对值：\(\sigma(-3X+2) = |-3|\times2 = 6\)。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：方差线性平移不变性（D(X+b) = D(X)）直觉对比</div>
    <svg class="micro-fig" id="m-stat-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      整体平移 +b 只是把整个数据群在数轴上滑动，内部各点之间的相对距离完全不变，因此方差恒定！
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-7-3
script_code = r'''
  // === e3-7-3 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-stat-fig");
    var desc = document.getElementById("m-stat-desc");
    var trapFig = document.getElementById("m-stat-trap-fig");
    var tabs = document.querySelectorAll("#m-stat-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 杠杆平衡重心直觉 (期望 E(X)=2.1)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "数学期望杠杆模型：各点挂上概率质量重物，重心支点即为 E(X)"));

      // Lever bar
      fig.appendChild(el("rect", {x: 80, y: 110, width: 460, height: 10, rx: 5, fill: "#e5e7eb", stroke: "var(--line)", "stroke-width": "1.5"}));

      // Fulcrum triangle at x=2.1 (Map [1, 3] to [120, 500])
      // Range = 2 units = 380px -> 190px per unit
      // 1 -> 120, 2 -> 310, 2.1 -> 329, 3 -> 500
      var fulcrumX = 329;
      fig.appendChild(el("polygon", {points: fulcrumX + ",120 " + (fulcrumX-15) + ",155 " + (fulcrumX+15) + ",155", fill: "#ef4444"}));
      fig.appendChild(el("text", {x: fulcrumX, y: 175, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#ef4444"}, "▲ 支点 E(X) = 2.1"));

      // Weights at 1 (p=0.2), 2 (p=0.5), 3 (p=0.3)
      // Pos 1 (x=120)
      fig.appendChild(el("line", {x1: 120, y1: 110, x2: 120, y2: 70, stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("circle", {cx: 120, cy: 60, r: 14, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 120, y: 64, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#1976d2"}, "0.2"));
      fig.appendChild(el("text", {x: 120, y: 100, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "x=1"));

      // Pos 2 (x=310)
      fig.appendChild(el("line", {x1: 310, y1: 110, x2: 310, y2: 50, stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("circle", {cx: 310, cy: 40, r: 22, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 310, y: 44, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "0.5"));
      fig.appendChild(el("text", {x: 310, y: 100, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "x=2"));

      // Pos 3 (x=500)
      fig.appendChild(el("line", {x1: 500, y1: 110, x2: 500, y2: 60, stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("circle", {cx: 500, cy: 50, r: 18, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 500, y: 54, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "0.3"));
      fig.appendChild(el("text", {x: 500, y: 100, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "x=3"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "力矩平衡：(1-2.1)×0.2 + (2-2.1)×0.5 + (3-2.1)×0.3 = -0.22 - 0.05 + 0.27 = 0"));
      desc.innerHTML = "<b>① 数学期望杠杆模型</b>：期望就是物理系统里的质心/重心坐标。每个可能结果挂上其概率质量，支点正好落在各力矩代数和为 0 的平衡点上：<b>E(X) = ∑ xᵢ pᵢ = 2.1</b>。因为 3 的概率（0.3）大于 1 的概率（0.2），重心比算术中点 2.0 略偏向右侧。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 均值相同但方差悬殊 (方案 A vs 方案 B)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "均值同为 10 万元：方案 A (D=160 高风险大波动) vs 方案 B (D=60 低风险稳健)"));

      // Left: Scheme A (spread out: -10, 10, 30)
      fig.appendChild(el("rect", {x: 40, y: 40, width: 250, height: 135, rx: 8, fill: "var(--card)", stroke: "#ef4444", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 165, y: 62, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#ef4444"}, "方案 A：D(X) = 160（离散度极大）"));

      // Dots on axis
      fig.appendChild(el("line", {x1: 55, y1: 110, x2: 275, y2: 110, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("circle", {cx: 75, cy: 110, r: 8, fill: "#ef4444"}));
      fig.appendChild(el("text", {x: 75, y: 132, "text-anchor": "middle", "font-size": "10", fill: "#ef4444"}, "-10万"));

      fig.appendChild(el("circle", {cx: 165, cy: 110, r: 12, fill: "#1976d2"}));
      fig.appendChild(el("text", {x: 165, y: 132, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#1976d2"}, "均值10"));

      fig.appendChild(el("circle", {cx: 255, cy: 110, r: 8, fill: "#ef4444"}));
      fig.appendChild(el("text", {x: 255, y: 132, "text-anchor": "middle", "font-size": "10", fill: "#ef4444"}, "+30万"));

      fig.appendChild(el("text", {x: 165, y: 160, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "极差跨度达 40 万元，面临亏损"));

      // Right: Scheme B (concentrated: 0, 10, 20)
      fig.appendChild(el("rect", {x: 330, y: 40, width: 250, height: 135, rx: 8, fill: "var(--card)", stroke: "#10b981", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 455, y: 62, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#10b981"}, "方案 B：D(Y) = 60（紧密聚拢）"));

      fig.appendChild(el("line", {x1: 345, y1: 110, x2: 565, y2: 110, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("circle", {cx: 395, cy: 110, r: 9, fill: "#10b981"}));
      fig.appendChild(el("text", {x: 395, y: 132, "text-anchor": "middle", "font-size": "10", fill: "#10b981"}, "0万"));

      fig.appendChild(el("circle", {cx: 455, cy: 110, r: 12, fill: "#1976d2"}));
      fig.appendChild(el("text", {x: 455, y: 132, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#1976d2"}, "均值10"));

      fig.appendChild(el("circle", {cx: 515, cy: 110, r: 9, fill: "#10b981"}));
      fig.appendChild(el("text", {x: 515, y: 132, "text-anchor": "middle", "font-size": "10", fill: "#10b981"}, "+20万"));

      fig.appendChild(el("text", {x: 455, y: 160, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "紧密收拢在均值两侧，不亏损"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "期望决定平均收获，方差决定风险稳定性；理性决策必须期望方差并重"));
      desc.innerHTML = "<b>② 方差度量波动风险</b>：两个方案的期望收益完全相同（都是 10 万元），但方案 A 的数据点极度分散，方差高达 160，甚至有 20% 的概率亏损 10 万元；方案 B 数据聚拢，方差仅为 60，保本稳定。方差是量化不确定性与风险的标尺。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 线性变换几何拉伸 Y = aX + b
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "线性变换 Y = aX + b：加常数整体平移（方差不变），乘常数伸缩放大 a² 倍"));

      // Top original X
      fig.appendChild(el("rect", {x: 80, y: 45, width: 460, height: 45, rx: 6, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 100, y: 72, "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "原始 X"));
      fig.appendChild(el("text", {x: 260, y: 72, "font-size": "12", fill: "var(--fg)"}, "E(X) = 3"));
      fig.appendChild(el("text", {x: 420, y: 72, "font-size": "12", fill: "var(--fg)"}, "D(X) = 4,  σ(X) = 2"));

      // Bottom transformed Y = -2X + 1
      fig.appendChild(el("rect", {x: 80, y: 115, width: 460, height: 60, rx: 6, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 100, y: 142, "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "Y = -2X + 1"));
      fig.appendChild(el("text", {x: 240, y: 142, "font-size": "11.5", fill: "var(--fg)"}, "E(Y) = -2(3)+1 = -5"));
      fig.appendChild(el("text", {x: 390, y: 142, "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "D(Y) = (-2)² × 4 = 16"));
      fig.appendChild(el("text", {x: 390, y: 162, "font-size": "11", "font-weight": "700", fill: "#2e7d32"}, "σ(Y) = |-2| × 2 = 4 (非负)"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "平移 +1 对离散程度无任何影响；拉伸比例 -2 使方差膨胀为 (-2)² = 4 倍"));
      desc.innerHTML = "<b>③ 线性变换核心公式</b>：对于 \(Y = aX + b\)：期望忠实反映平移与放缩 \(E(Y) = aE(X) + b\)；而方差度量内部相对波动，常数平移彻底失效，比例系数平方放大：<b>D(aX+b) = a² D(X)</b>；标准差取绝对值保持非负：<b>σ(aX+b) = |a| σ(X)</b>。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "平移 +5：相对间距不变 ⟹ D(X+5) = D(X)"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "荒谬错误：误把 +5 加进方差 D+5"));

      // Left: 3 dots shifted together
      // X = {2, 4, 6} (mu=4)
      [60, 120, 180].forEach(function(x) {
        trapFig.appendChild(el("circle", {cx: x, cy: 50, r: 6, fill: "#1976d2"}));
      });
      trapFig.appendChild(el("line", {x1: 45, y1: 50, x2: 195, y2: 50, stroke: "var(--line)", "stroke-width": "1"}));
      trapFig.appendChild(el("text", {x: 225, y: 54, "font-size": "10", fill: "var(--muted)"}, "X 原分布"));

      // X+5 = {7, 9, 11} (mu=9)
      [90, 150, 210].forEach(function(x) {
        trapFig.appendChild(el("circle", {cx: x, cy: 85, r: 6, fill: "#10b981"}));
      });
      trapFig.appendChild(el("line", {x1: 75, y1: 85, x2: 225, y2: 85, stroke: "var(--line)", "stroke-width": "1"}));
      trapFig.appendChild(el("text", {x: 245, y: 89, "font-size": "10", fill: "#10b981"}, "X+5 整体平移"));
      trapFig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "内部间距完全一致，方差分毫不变！"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Wrong formula illustration
      trapFig.appendChild(el("rect", {x: 320, y: 40, width: 180, height: 60, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"}));
      trapFig.appendChild(el("text", {x: 410, y: 65, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#ef4444"}, "D(3X - 5) ≠ 3D(X) - 5"));
      trapFig.appendChild(el("text", {x: 410, y: 85, "text-anchor": "middle", "font-size": "11", fill: "#ef4444"}, "正确为 3² · D(X) = 9 D(X)"));
      trapFig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "切记：常数项绝不进入方差公式！"));
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

print('Upgrade e3-7-3 completed! File size:', len(html.encode('utf-8')), 'bytes')
