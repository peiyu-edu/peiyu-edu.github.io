# upgrade_e3_8_2.py
import re
import os

filepath = 'highSchool/site/lessons/e3-8-2.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：8.1 散点图与相关系数（<a href="e3-8-1.html">回看 8.1</a>）；必修一 2.3 二次函数最值（<a href="b1-2-3.html">回看 2.3</a>）。线性回归是用一条最优直线去拟合散点的宏观规律。</p>

  <div class="card">
    <p><b>一元线性回归模型</b>：描述因变量 \(Y\) 随自变量 \(x\) 线性变化并伴随随机波动的数学模型：</p>
    <p>$$Y = bx + a + e$$</p>
    <p>其中 \(a\) 是截距，\(b\) 是斜率（总体真实参数，未知）；\(e\) 是<b>随机误差项</b>（受测量误差、潜变量扰动等不可控因素产生，满足 \(E(e) = 0\)）。</p>
  </div>

  <div class="card">
    <p><b>最小二乘法（残差平方和最小化）</b>：如何在一大群散点中画出「最完美」的一条直线？</p>
    <p>高斯准则：不比水平距离，也不比垂直绝对值，而是比较每个样本点到直线的<b>竖直偏差（残差 \(e_i = y_i - \hat{y}_i\)）的平方和</b>：</p>
    <p>$$Q(a, b) = \sum_{i=1}^n (y_i - (bx_i + a))^2$$</p>
    <p>使这个二次函数达到全域最小值的直线，就是<b>经验回归方程 \(\hat{y} = \hat{b}x + \hat{a}\)</b>！</p>
  </div>

  <div class="card">
    <p><b>样本中心点 \((\bar{x}, \bar{y})\)（回归线的定海神针）</b>：所有样本点的均值构成的坐标点。最小二乘法导出的铁律是：<b>经验回归直线一定穿过样本中心点 \((\bar{x}, \bar{y})\)</b>！</p>
    <p>$$\bar{y} = \hat{b}\bar{x} + \hat{a} \Longrightarrow \hat{a} = \bar{y} - \hat{b}\bar{x}$$</p>
    <p>无论大题怎样出，只要算出斜率 \(\hat{b}\)，截距 \(\hat{a}\) 直接代入样本中心点秒解！</p>
  </div>

  <div class="card">
    <p><b>残差 \(e_i\) 与决定系数 \(R^2\)</b>：</p>
    <p>• <b>残差</b>：真实观测值减去模型预测值：\(e_i = y_i - \hat{y}_i\)（点在线上方残差为正，在下方为负）；</p>
    <p>• <b>决定系数 \(R^2\)</b>：模型解释因变量波动的能力占比，\(R^2\) 越接近 1，拟合精度越高（在一元线性回归中，恰好等于相关系数的平方：\(R^2 = r^2\)）。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-reg">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">线性回归直觉微图解：最小二乘方块面积、样本中心枢轴与残差分析</span>
      <div class="micro-tabs" id="m-reg-tabs">
        <button class="micro-tab active" data-tab="1">① 最小二乘法：竖直残差方块面积最小</button>
        <button class="micro-tab" data-tab="2">② 样本中心点 (x̄, ȳ) 的旋转枢轴</button>
        <button class="micro-tab" data-tab="3">③ 残差图与决定系数 R²</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-reg-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-reg-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">总体回归模型（理论真理）</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">不可直接测</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>形式</b>：\(Y = bx + a + e\)。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>内涵</b>：宇宙规律本身，参数 \(a, b\) 恒定但未知，含随机误差项 \(e\)。</p>
      <p class="small" style="margin:0;"><b>特质</b>：不同人抽样，估计出来的 \(\hat{b}\) 围绕真值 \(b\) 波动。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">经验回归方程（样本估计）</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">实践预报</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>形式</b>：\(\hat{y} = \hat{b}x + \hat{a}\)。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>内涵</b>：带帽子表示估计值，由最小二乘法计算得出。</p>
      <p class="small" style="margin:0;"><b>特质</b>：必定经过样本中心点 \((\bar{x}, \bar{y})\)，用于趋势外推预报。</p>
    </div>
  </div>

  <h3>2. 经验回归主公式与残差计算法则</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">回归方程两步求法与核心公式：</p>
    <p style="margin:0 0 6px 0;">经验回归方程：\(\hat{y} = \color{#1976d2}{\hat{b}}x + \color{#2e7d32}{\hat{a}}\)</p>
    <p style="margin:0 0 6px 0;">第 1 步求斜率：\(\color{#1976d2}{\hat{b}} = \dfrac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^n (x_i - \bar{x})^2} = \dfrac{\sum x_i y_i - n\bar{x}\bar{y}}{\sum x_i^2 - n\bar{x}^2}\)</p>
    <p style="margin:0 0 6px 0;">第 2 步求截距（必过样本中心）：\(\color{#2e7d32}{\hat{a}} = \color{#ef4444}{\bar{y}} - \color{#1976d2}{\hat{b}}\color{#ef4444}{\bar{x}}\)</p>
    <p style="margin:0;">残差定义式：\(e_i = \color{#1976d2}{y_i} - \color{#2e7d32}{\hat{y}_i} = \text{真实观测值} - \text{模型预报值}\)</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：关于例 1 里的 \(0.8\)，哪句对？</p>
    <div class="opts">
      <button class="opt" data-v="A"><b>A</b>它就是模型里的 \(b\)，换一批男生算出来也是 \(0.8\)</button>
      <button class="opt" data-v="B"><b>B</b>它是用这 \(50\) 人估计出的 \(b\)，换一批男生可能略有不同</button>
      <button class="opt" data-v="C"><b>C</b>身高多 \(1\) cm 的人，体重一定多 \(0.8\) kg</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(\hat b\) 带帽子，是样本算出的估计值，样本一变它就变。A 把估计当成了总体参数；C 漏了「平均」：具体两个人之间，体重差多少还受 \(e\) 影响。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：一组数据 \(\bar x=4\)，\(\bar y=10\)，算得 \(\hat b=2\)。\(\hat a\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(2\)</button>
      <button class="opt" data-v="B"><b>B</b>\(18\)</button>
      <button class="opt" data-v="C"><b>C</b>\(6\)</button>
      <button class="opt" data-v="D"><b>D</b>\(10\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\hat a=\bar y-\hat b\bar x=10-2\times4=2\)。可以验：\(x=4\) 时 \(\hat y=2\times4+2=10=\bar y\)，直线过样本中心。选 B 的同学把减号写成了加号；选 C 的同学忘了乘 \(\hat b\)。</p></div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：经验回归方程 \(\hat y=0.5x+3\)，数据点 \((4,6)\) 的残差是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(-1\)</button>
      <button class="opt" data-v="C"><b>C</b>\(5\)</button>
      <button class="opt" data-v="D"><b>D</b>\(6\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\hat y=0.5\times4+3=5\)，残差 \(=y-\hat y=6-5=1\)，点在直线上方。选 B 是减反了（残差是「真实减预测」）；选 C 只算了预测值。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：已知某成对样本数据满足：\(\bar{x} = 5,\; \bar{y} = 12\)，且 \(\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y}) = 30,\; \sum_{i=1}^n (x_i - \bar{x})^2 = 15\)。<br>
    ① 求 \(y\) 关于 \(x\) 的经验回归方程；<br>
    ② 预测当自变量 \(x = 10\) 时，\(y\) 的预报值；<br>
    ③ 样本中包含一个数据点 \((4, 11)\)，求该点的残差 \(e\)。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">解题顺序铁律：<b>先算斜率 \(\hat{b}\)，再代入样本中心点 \((\bar{x}, \bar{y})\) 求截距 \(\hat{a}\)</b>！预报值代入 \(x=10\) 即可；残差严格执行「实际值减去预测值 \(y - \hat{y}\)」。</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步套公式标准化求解</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 求经验回归方程</b>：<br>
          斜率：\(\hat{b} = \dfrac{30}{15} = 2\)；<br>
          截距（代入中心点）：\(\hat{a} = \bar{y} - \hat{b}\bar{x} = 12 - 2 \times 5 = 2\)；<br>
          所求经验回归方程为：\(\hat{y} = 2x + 2\)。<br>
          • <b>② 预报代入</b>：<br>
          当 \(x = 10\) 时，\(\hat{y} = 2 \times 10 + 2 = 22\)；<br>
          • <b>③ 计算点 \((4, 11)\) 的残差</b>：<br>
          当 \(x = 4\) 时，预测值为 \(\hat{y} = 2 \times 4 + 2 = 10\)；<br>
          残差为：\(e = y - \hat{y} = 11 - 10 = +1\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步防坑结论核查</b>：
        <span class="small">核查 1：验证中心点 \((\bar{x}, \bar{y}) = (5, 12)\) 代入方程 \(2 \times 5 + 2 = 12\)，完全成立！核查 2：点 \((4, 11)\) 纵坐标 11 高于直线的预测值 10，点在直线上方，残差必为正数 \(+1\)，切勿算成 \(10 - 11 = -1\)。</span>
      </div>
    </div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：残差减法方向颠倒，正负号搞反</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：真实值是 6，模型预测是 5，残差写成 \(5 - 6 = -1\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>残差公式永远是「真实观测值减去模型估计值」：\(e = y - \hat{y}\)</b>！真实值 6 高于预测值 5，点在直线上方，残差必须为正数 \(+1\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：解截距时忘了移项符号，误写成 \(\hat{a} = \bar{y} + \hat{b}\bar{x}\)</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：\(\bar{x}=4, \bar{y}=10, \hat{b}=2\)，算截距写成 \(10 + 2\times 4 = 18\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：由 \(\bar{y} = \hat{b}\bar{x} + \hat{a}\) 移项得 <b>\(\hat{a} = \bar{y} - \hat{b}\bar{x}\)</b>，中间是减号！正确答案是 \(10 - 2\times 4 = 2\)。算完必须把 \((\bar{x}, \bar{y})\) 代入验算一次。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：把统计估计当成确定数值，或无节制远距离外推</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：由体重身高模型算出 \(\hat{y} = 0.8x - 85\)，得出「身高多 1 cm 的人体重一定正好重 0.8 kg」的确定性断言。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：线性回归是<b>统计平均趋势</b>，每个个体身上都存在随机误差 \(e\)，只能说「身高增加 1 cm，体重平均增加约 0.8 kg」。同时不能把婴儿或姚明的身高代入该经验模型进行无度外推。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：最小二乘准则（竖直残差方块面积之和最小）直觉示意</div>
    <svg class="micro-fig" id="m-reg-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      最小二乘度量的是竖直方向的偏差平方（拼成方块面积），寻找一条让所有残差方块面积总和最小的直线。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-8-2
script_code = r'''
  // === e3-8-2 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-reg-fig");
    var desc = document.getElementById("m-reg-desc");
    var trapFig = document.getElementById("m-reg-trap-fig");
    var tabs = document.querySelectorAll("#m-reg-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 最小二乘法：竖直残差方块面积之和最小
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "最小二乘法准则：每个数据点的垂直残差 eᵢ = yᵢ - ŷᵢ，拼成方块面积总和最小"));

      // Regression line: from (80, 160) to (520, 50)
      fig.appendChild(el("line", {x1: 60, y1: 165, x2: 540, y2: 45, stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("text", {x: 520, y: 35, "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "ŷ = bx + a"));

      // Data points & residual squares
      // Line equation: y_line(x) = 165 - (x-60)*(120/480) = 165 - (x-60)*0.25
      var pts = [
        {x: 140, y: 115}, // line is 165 - 80*0.25 = 145 -> residual = 115 - 145 = -30 (above)
        {x: 240, y: 140}, // line is 165 - 180*0.25 = 120 -> residual = 140 - 120 = +20 (below)
        {x: 360, y: 65},  // line is 165 - 300*0.25 = 90 -> residual = 65 - 90 = -25 (above)
        {x: 460, y: 80}   // line is 165 - 400*0.25 = 65 -> residual = 80 - 65 = +15 (below)
      ];

      pts.forEach(function(p, idx) {
        var lineY = 165 - (p.x - 60) * 0.25;
        var diff = Math.abs(p.y - lineY);

        // Vertical residual line
        fig.appendChild(el("line", {x1: p.x, y1: p.y, x2: p.x, y2: lineY, stroke: "#ef4444", "stroke-width": "1.5"}));

        // Residual square box
        var sqX = p.x;
        var sqY = Math.min(p.y, lineY);
        fig.appendChild(el("rect", {x: sqX, y: sqY, width: diff, height: diff, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1", opacity: "0.6"}));

        // Point dot
        fig.appendChild(el("circle", {cx: p.x, cy: p.y, r: 4.5, fill: "#10b981"}));
      });

      fig.appendChild(el("text", {x: 310, y: 205, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "Q = ∑ eᵢ² = 红色正方形面积总和 ➔ 最小二乘法使 Q 达到全域极小值"));
      desc.innerHTML = "<b>① 最小二乘法几何本质</b>：高斯并不是最小化点到直线的垂线距离，而是度量<b>竖直方向上的预测误差 \(e_i = y_i - \hat{y}_i\)</b>。将每个残差画成一个正方形，经验回归直线恰好是让所有这些红色方块的面积之和达到全局最小的那条最优直线。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 样本中心点 (x̄, ȳ) 旋转枢轴
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "样本中心点 (x̄, ȳ) 是定海神针：无论斜率如何旋转，回归直线必然经过它"));

      var cx = 310, cy = 110;

      // Axis lines crossing at center
      fig.appendChild(el("line", {x1: 80, y1: cy, x2: 540, y2: cy, stroke: "var(--line)", "stroke-width": "1.2", "stroke-dasharray": "3 3"}));
      fig.appendChild(el("line", {x1: cx, y1: 35, x2: cx, y2: 185, stroke: "var(--line)", "stroke-width": "1.2", "stroke-dasharray": "3 3"}));

      // Candidate lines through center
      fig.appendChild(el("line", {x1: cx - 180, y1: cy + 60, x2: cx + 180, y2: cy - 60, stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("line", {x1: cx - 180, y1: cy + 30, x2: cx + 180, y2: cy - 30, stroke: "#9ca3af", "stroke-width": "1.2", "stroke-dasharray": "4 2"}));
      fig.appendChild(el("line", {x1: cx - 180, y1: cy + 90, x2: cx + 180, y2: cy - 90, stroke: "#9ca3af", "stroke-width": "1.2", "stroke-dasharray": "4 2"}));

      // Center Point
      fig.appendChild(el("circle", {cx: cx, cy: cy, r: 8, fill: "#ef4444"}));
      fig.appendChild(el("text", {x: cx, y: cy - 14, "text-anchor": "middle", "font-size": "12.5", "font-weight": "700", fill: "#ef4444"}, "样本中心 (x̄, ȳ) 必过！"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "解题捷径：已知 b̂，截距 â = ȳ - b̂x̄ 代入中心点坐标秒杀！"));
      desc.innerHTML = "<b>② 样本中心点旋转枢轴</b>：由最小二乘一阶导数方程可严格证明，残差之和 \(\sum e_i = 0\)，这必然导致回归直线穿过数据几何重心 \((\bar{x}, \bar{y})\)。在高考做题中，只要看到题目给出平均值，就意味着得到了直线上的一对现成坐标点！";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 残差图与决定系数 R^2
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "残差分析与 R²：残差在 0 刻度线两侧均匀带状分布，说明线性模型拟合优良"));

      var baseCy = 110;
      fig.appendChild(el("line", {x1: 60, y1: baseCy, x2: 560, y2: baseCy, stroke: "#1976d2", "stroke-width": "1.8"}));
      fig.appendChild(el("text", {x: 75, y: baseCy - 6, "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "残差 e = 0 基准线"));

      // Band lines
      fig.appendChild(el("line", {x1: 60, y1: baseCy - 35, x2: 560, y2: baseCy - 35, stroke: "var(--line)", "stroke-width": "1", "stroke-dasharray": "2 2"}));
      fig.appendChild(el("line", {x1: 60, y1: baseCy + 35, x2: 560, y2: baseCy + 35, stroke: "var(--line)", "stroke-width": "1", "stroke-dasharray": "2 2"}));
      fig.appendChild(el("text", {x: 520, y: baseCy - 40, "font-size": "10", fill: "var(--muted)"}, "+水平边界"));
      fig.appendChild(el("text", {x: 520, y: baseCy + 45, "font-size": "10", fill: "var(--muted)"}, "-水平边界"));

      // Random residual dots
      var rVals = [-15, 20, -8, 12, -22, 18, -10, 5, -14, 24, -18, 8];
      rVals.forEach(function(rv, i) {
        var x = 110 + i * 36;
        var y = baseCy - rv;
        fig.appendChild(el("line", {x1: x, y1: baseCy, x2: x, y2: y, stroke: "#ef4444", "stroke-width": "1"}));
        fig.appendChild(el("circle", {cx: x, cy: y, r: 3.5, fill: "#ef4444"}));
      });

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "决定系数 R² = 1 - (∑eᵢ² / ∑(yᵢ-ȳ)²)；带状无弯曲分布表示无需改用曲线模型"));
      desc.innerHTML = "<b>③ 残差图与决定系数直觉</b>：画出每个样本点的残差图。如果所有残差在水平零线上下均匀、随机散布在一个狭窄水平带内，说明线性模型非常健康；若残差呈现喇叭口或 U 型弯曲，则预示需要改用指数或二次曲线模型。\(R^2\) 越逼近 1，模型拟合精度越高。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "正确：竖直残差平方和最小"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "误解：点到直线的垂线距离"));

      // Left: vertical distance
      trapFig.appendChild(el("line", {x1: 40, y1: 110, x2: 230, y2: 50, stroke: "#1976d2", "stroke-width": "2"}));
      trapFig.appendChild(el("circle", {cx: 130, cy: 50, r: 4, fill: "#10b981"}));
      trapFig.appendChild(el("line", {x1: 130, y1: 50, x2: 130, y2: 82, stroke: "#ef4444", "stroke-width": "2"}));
      trapFig.appendChild(el("text", {x: 145, y: 70, "font-size": "10.5", "font-weight": "700", fill: "#ef4444"}, "竖直偏差 eᵢ"));
      trapFig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "因变量预测误差 yᵢ - ŷᵢ"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: perpendicular distance
      trapFig.appendChild(el("line", {x1: 310, y1: 110, x2: 500, y2: 50, stroke: "#1976d2", "stroke-width": "2"}));
      trapFig.appendChild(el("circle", {cx: 400, cy: 50, r: 4, fill: "#ef4444"}));
      trapFig.appendChild(el("line", {x1: 400, y1: 50, x2: 385, y2: 85, stroke: "#ef4444", "stroke-width": "1.5", "stroke-dasharray": "2 2"}));
      trapFig.appendChild(el("text", {x: 415, y: 72, "font-size": "10", fill: "#ef4444"}, "倾斜垂距"));
      trapFig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "普通最小二乘法不量测垂线距离！"));
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

print('Upgrade e3-8-2 completed! File size:', len(html.encode('utf-8')), 'bytes')
