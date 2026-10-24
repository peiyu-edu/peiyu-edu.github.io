# upgrade_e3_7_5.py
import re
import os

filepath = 'highSchool/site/lessons/e3-7-5.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：必修二 9.2 频率分布直方图（<a href="b2-9-2.html">回看 9.2</a>）；7.3 均值与方差（<a href="e3-7-3.html">回看 7.3</a>）。正态分布是自然界中最普遍、最重要的连续型随机变量分布。</p>

  <div class="card">
    <p><b>正态分布 \(X \sim N(\mu, \sigma^2)\)</b>：当样本量无限扩大、分组组距无限缩小时，直方图的折线逐渐光滑收敛为一条钟形对称曲线，称为<b>高斯正态分布曲线</b>。</p>
    <p>两个核心参数：<br>
    • \(\mu\)：<b>均值 / 位置参数</b>，决定曲线的对称轴位置（\(x = \mu\)）；<br>
    • \(\sigma\)：<b>标准差 / 形状参数</b>，决定曲线的胖瘦分散度（\(\sigma\) 越小曲线越陡峭瘦高，\(\sigma\) 越大曲线越矮胖平坦）。<br>
    <b>致命陷阱</b>：记号 \(N(\mu, \sigma^2)\) 中，<b>第二个参数是方差 \(\sigma^2\)</b>，做题必须先开方求出标准差 \(\sigma\)！</p>
  </div>

  <div class="card">
    <p><b>正态曲线三大几何特征</b>：</p>
    <p>① <b>完美轴对称</b>：关于直线 \(x = \mu\) 镜像对称，在 \(x = \mu\) 处取得最高峰值；<br>
    ② <b>全域总面积为 1</b>：曲线与 \(x\) 轴之间的全部面积恒等于 \(1\)；对称轴两侧面积各为 \(0.5\)：</p>
    <p>$$P(X \le \mu) = P(X \ge \mu) = 0.5$$</p>
    <p>③ <b>落在区间的概率就是曲线下面积</b>：连续型随机变量单点概率为 \(0\)（\(P(X = c) = 0\)），因此带不带等号概率完全相同：\(P(a \le X \le b) = P(a &lt; X &lt; b)\)。</p>
  </div>

  <div class="card">
    <p><b>\(3\sigma\) 原则（高斯法则）</b>：对 \(X \sim N(\mu, \sigma^2)\)，数据落在中心附近的概率具有确定经验数值：</p>
    <p>• \(P(\mu - \sigma \le X \le \mu + \sigma) \approx 68.27\%\)；<br>
    • \(P(\mu - 2\sigma \le X \le \mu + 2\sigma) \approx 95.45\%\)；<br>
    • \(P(\mu - 3\sigma \le X \le \mu + 3\sigma) \approx 99.73\%\)。<br>
    落在 \(3\sigma\) 之外的概率仅有 \(0.27\%\)，属于几乎不可能发生的小概率事件。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-norm">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">正态分布直觉微图解：高斯钟形曲线、3σ原则与轴对称割补计算</span>
      <div class="micro-tabs" id="m-norm-tabs">
        <button class="micro-tab active" data-tab="1">① 钟形曲线形态与参数意义</button>
        <button class="micro-tab" data-tab="2">② 3σ 原则与区间概率分配</button>
        <button class="micro-tab" data-tab="3">③ 轴对称割补几何算法</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-norm-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-norm-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">位置参数 \(\mu\)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">中心对称轴</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>物理意义</b>：均值、期望、中位数三位一体。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>几何表现</b>：决定整条曲线沿数轴左右平移的位置。</p>
      <p class="small" style="margin:0;"><b>对称基石</b>：\(P(X &lt; \mu - c) = P(X &gt; \mu + c)\)。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">形状参数 \(\sigma\)</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">陡峭松散度</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>物理意义</b>：标准差（方差 \(\sigma^2\) 的算术平方根）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>几何表现</b>：\(\sigma\) 小则峰高腰细；\(\sigma\) 大则峰低腰阔。</p>
      <p class="small" style="margin:0;"><b>面积守恒</b>：曲线下总面积始终恒等于 1。</p>
    </div>
  </div>

  <h3>2. 正态分布色彩语义主公式与 3σ 原则</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">核心参数与 \(3\sigma\) 黄金常数：</p>
    <p style="margin:0 0 6px 0;">分布记号：\(X \sim N(\color{#1976d2}{\mu}, \color{#2e7d32}{\sigma^2})\quad (\color{#1976d2}{\mu \text{ 为均值}}, \color{#2e7d32}{\sigma \text{ 为标准差}})\)</p>
    <p style="margin:0 0 6px 0;">\(3\sigma\) 原则区间概率：</p>
    <p style="margin:0 0 4px 0;">• \(P(\color{#1976d2}{\mu}-\color{#2e7d32}{\sigma} \le X \le \color{#1976d2}{\mu}+\color{#2e7d32}{\sigma}) \approx \color{#1976d2}{68.27\%} \approx 0.683\)</p>
    <p style="margin:0 0 4px 0;">• \(P(\color{#1976d2}{\mu}-2\color{#2e7d32}{\sigma} \le X \le \color{#1976d2}{\mu}+2\color{#2e7d32}{\sigma}) \approx \color{#2e7d32}{95.45\%} \approx 0.954\)</p>
    <p style="margin:0 0 8px 0;">• \(P(\color{#1976d2}{\mu}-3\color{#2e7d32}{\sigma} \le X \le \color{#1976d2}{\mu}+3\color{#2e7d32}{\sigma}) \approx \color{#d97706}{99.73\%} \approx 0.997\)</p>
    <p class="small" style="margin:0; color:var(--muted);"><b>对称割补口诀</b>：中轴平分各一半（0.5）；双侧对称算单侧，总面积 1 减中间再除以 2！</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：\(X\sim N(10,9)\)，\(X\) 的标准差是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(9\)</button>
      <button class="opt" data-v="B"><b>B</b>\(3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(10\)</button>
      <button class="opt" data-v="D"><b>D</b>\(81\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。括号里第二个数是<b>方差</b> \(\sigma^2=9\)，标准差 \(\sigma=\sqrt9=3\)。选 A 是把方差当成了标准差，这是最常见的错；\(10\) 是均值。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：\(X\sim N(1,\sigma^2)\)，\(P(X&lt;-1)=0.2\)。\(P(1&lt;X&lt;3)\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(0.2\)</button>
      <button class="opt" data-v="B"><b>B</b>\(0.3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(0.6\)</button>
      <button class="opt" data-v="D"><b>D</b>\(0.8\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(-1\) 和 \(3\) 关于 \(x=1\) 对称，\(P(X&gt;3)=0.2\)；\(P(-1&lt;X&lt;3)=1-0.4=0.6\)；\(1\) 到 \(3\) 是它的一半，\(0.3\)。选 C 的同学停在了 \(0.6\)，忘了只要右半边。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：某市高三年级一模数学考试成绩 \(X\) 服从正态分布 \(N(100, 100)\)。全市共有 10,000 名考生参加考试。<br>
    ① 求数学成绩超过 110 分的考生占比及大约人数；<br>
    ② 若已知 \(P(X &lt; 80) = 0.0228\)，求数学成绩在 \([100, 120]\) 分之间的考生人数。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">审读参数：\(X \sim N(100, 100) \Longrightarrow \mu = 100\)，方差 \(\sigma^2 = 100 \Longrightarrow\) <b>标准差 \(\sigma = \sqrt{100} = 10\)</b>！<br>
        观察关键数字：\(110 = \mu + \sigma\)；\(80 = \mu - 2\sigma\)；\(120 = \mu + 2\sigma\)；\(100 = \mu\)。全部完美吻合对称轴与 \(k\sigma\) 格点！</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步对称性割补求解</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 求 \(P(X &gt; 110)\)</b>：<br>
          \(110 = \mu + \sigma\)。由 \(3\sigma\) 原则，\(P(90 \le X \le 110) \approx 0.6827\)；<br>
          落在两边尾部的概率总和为 \(1 - 0.6827 = 0.3173\)；<br>
          由轴对称性，右侧单尾概率为：<br>
          $$P(X &gt; 110) = \dfrac{0.3173}{2} \approx 0.1587\quad (15.87\%)$$
          超过 110 分的人数约为：\(10000 \times 0.1587 \approx 1587\text{ 人}\)。<br>
          • <b>② 求 \(P(100 \le X \le 120)\)</b>：<br>
          由对称性，\(P(X &gt; 120) = P(X &lt; 80) = 0.0228\)；<br>
          而对称轴右半区总概率为 \(P(X \ge 100) = 0.5\)；<br>
          因此：<br>
          $$P(100 \le X \le 120) = P(X \ge 100) - P(X &gt; 120) = 0.5 - 0.0228 = 0.4772$$
          考生人数为：\(10000 \times 0.4772 = 4772\text{ 人}\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步防坑结论核查</b>：
        <span class="small">防坑 1：标准差是 \(\sqrt{100}=10\)，切勿把 100 直接当 \(\sigma\)；防坑 2：问②求的是 \([100, 120]\)（半边对称区间），绝不能与整体对称区间 \([80, 120]\) 混淆（整体为 \(1 - 2\times 0.0228 = 0.9544\)，除以 2 正好为 0.4772）！</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：\(X\sim N(80,25)\)，\(P(X&gt;85)\) 约是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(0.1587\)</button>
      <button class="opt" data-v="B"><b>B</b>\(0.3173\)</button>
      <button class="opt" data-v="C"><b>C</b>\(0.6827\)</button>
      <button class="opt" data-v="D"><b>D</b>\(0.0228\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\sigma=\sqrt{25}=5\)，\(85=\mu+\sigma\)。\(\mu\pm\sigma\) 外面一共约 \(1-0.6827=0.3173\)，右边一半约 \(0.1587\)。选 B 忘了除以 \(2\)；选 D 是错用了 \(2\sigma\) 那一行。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：把方差 \(\sigma^2\) 误当成标准差 \(\sigma\)，未开方导致格点全盘移位</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：\(X \sim N(80, 25)\)，直接把 \(\sigma\) 当作 25，认为 \(\mu+\sigma = 105\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：正态分布的标准形式是 \(N(\mu, \sigma^2)\)，<b>第二项是方差</b>！必须先开方算出标准差 \(\sigma = \sqrt{25} = 5\)，故 \(\mu+\sigma = 85\)。不开方是高考考场最惨痛的送分失误。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：单侧尾部概率忘记除以 2，两头尾巴当一头</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：求 \(P(X &gt; \mu+\sigma)\)，直接用 \(1 - 0.6827 = 0.3173\) 交卷。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：\(1 - 0.6827 = 0.3173\) 是<b>左右两个单尾的面积总和</b>！因为曲线关于 \(\mu\) 严格对称，右单尾 \(P(X &gt; \mu+\sigma)\) 必须<b>除以 2</b>：\(\dfrac{0.3173}{2} \approx 0.1587\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：把曲线最高峰的高度 \(f(\mu)\) 当成发生概率</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：当 \(\sigma = 0.1\) 时，最高峰高度 \(f(\mu) = \dfrac{1}{\sqrt{2\pi}\times 0.1} \approx 3.99\)，误以为概率超过了 1 或这就是概率值。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>曲线上点的纵坐标是概率密度，绝不是概率值</b>！连续型随机变量在任何单一点的概率都为 0（\(P(X=x_0) = 0\)），只有与 \(x\) 轴围成的<b>面积</b>才代表概率。面积恒等于 1，而高度完全可以大于 1。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：单尾概率除以 2（左右双尾面积对半拆分）直觉对比</div>
    <svg class="micro-fig" id="m-norm-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      两翼总面积 1 - 0.6827 = 0.3173，由于对称轴平分秋色，每一侧尾部面积必须严格除以 2 得 0.1587。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-7-5
script_code = r'''
  // === e3-7-5 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-norm-fig");
    var desc = document.getElementById("m-norm-desc");
    var trapFig = document.getElementById("m-norm-trap-fig");
    var tabs = document.querySelectorAll("#m-norm-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function bellCurvePath(cx, cy, scaleX, scaleY) {
      // Gaussian y = exp(-0.5 * (x/sigma)^2)
      var pts = [];
      for (var i = -40; i <= 40; i++) {
        var x = i / 10;
        var yVal = Math.exp(-0.5 * x * x);
        var px = cx + x * scaleX;
        var py = cy - yVal * scaleY;
        pts.push(px.toFixed(1) + "," + py.toFixed(1));
      }
      return pts.join(" ");
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 钟形曲线形态与参数意义
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "高斯钟形曲线：μ 决定对称中心，σ 决定高瘦/矮胖（面积守恒为 1）"));

      // Base axis
      fig.appendChild(el("line", {x1: 50, y1: 175, x2: 570, y2: 175, stroke: "var(--line)", "stroke-width": "1.5"}));

      // Curve 1: Standard N(0, 1) -> center at 200 (Slim & tall)
      var pSlim = bellCurvePath(200, 175, 28, 120);
      fig.appendChild(el("polygon", {points: "88,175 " + pSlim + " 312,175", fill: "#e3f2fd", opacity: "0.6"}));
      fig.appendChild(el("polyline", {points: pSlim, fill: "none", stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("line", {x1: 200, y1: 50, x2: 200, y2: 175, stroke: "#1976d2", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: 200, y: 45, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "σ 小：瘦高集中"));
      fig.appendChild(el("text", {x: 200, y: 192, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--fg)"}, "x = μ₁"));

      // Curve 2: N(μ2, 2^2) -> center at 420 (Fat & short)
      var pFat = bellCurvePath(420, 175, 45, 75);
      fig.appendChild(el("polygon", {points: "240,175 " + pFat + " 600,175", fill: "#e8f5e9", opacity: "0.5"}));
      fig.appendChild(el("polyline", {points: pFat, fill: "none", stroke: "#2e7d32", "stroke-width": "2.5"}));
      fig.appendChild(el("line", {x1: 420, y1: 95, x2: 420, y2: 175, stroke: "#2e7d32", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: 420, y: 90, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#2e7d32"}, "σ 大：矮胖分散"));
      fig.appendChild(el("text", {x: 420, y: 192, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--fg)"}, "x = μ₂"));

      fig.appendChild(el("text", {x: 310, y: 210, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "两曲线下方总面积完全相等（恒等于 1）；峰高与腰宽呈反比例制约"));
      desc.innerHTML = "<b>① 钟形曲线参数形态直觉</b>：中心对称轴由均值 \(\mu\) 决定（曲线沿轴左右平移）；分散程度由标准差 \(\sigma\) 决定。\(\sigma\) 越小，说明数据紧密团聚在均值周围，峰顶耸拔；\(\sigma\) 越大，数据大幅散开，波峰低伏。总面积始终恒定为 1。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 3σ 原则与区间概率分配
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "3σ 原则：68.27% (1σ) ➔ 95.45% (2σ) ➔ 99.73% (3σ)"));

      var cx = 310, cy = 170, sx = 40, sy = 110;
      // Axis
      fig.appendChild(el("line", {x1: 60, y1: cy, x2: 560, y2: cy, stroke: "var(--line)", "stroke-width": "1.5"}));

      // Shaded 1σ region [-1, 1] -> [cx-40, cx+40]
      var pts1 = [];
      for (var i = -10; i <= 10; i++) {
        var x = i / 10;
        pts1.push((cx + x * sx).toFixed(1) + "," + (cy - Math.exp(-0.5*x*x)*sy).toFixed(1));
      }
      fig.appendChild(el("polygon", {points: (cx-sx) + "," + cy + " " + pts1.join(" ") + " " + (cx+sx) + "," + cy, fill: "#e3f2fd"}));

      // Full curve
      var pFull = bellCurvePath(cx, cy, sx, sy);
      fig.appendChild(el("polyline", {points: pFull, fill: "none", stroke: "#1976d2", "stroke-width": "2.5"}));

      // Mark ticks
      var ticks = [
        {off: -3, label: "μ-3σ"}, {off: -2, label: "μ-2σ"}, {off: -1, label: "μ-σ"},
        {off: 0, label: "μ"},
        {off: 1, label: "μ+σ"}, {off: 2, label: "μ+2σ"}, {off: 3, label: "μ+3σ"}
      ];
      ticks.forEach(function(tk) {
        var px = cx + tk.off * sx;
        fig.appendChild(el("line", {x1: px, y1: cy, x2: px, y2: cy + 6, stroke: "var(--fg)", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: px, y: cy + 18, "text-anchor": "middle", "font-size": "9.5", fill: tk.off === 0 ? "#ef4444" : "var(--muted)"}, tk.label));
      });

      // 1σ bracket
      fig.appendChild(el("line", {x1: cx - sx, y1: 75, x2: cx + sx, y2: 75, stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: cx, y: 70, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "68.27% (1σ 内)"));

      // 2σ label
      fig.appendChild(el("text", {x: cx, y: 198, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#2e7d32"}, "2σ 内占 95.45%；3σ 内占 99.73%；3σ 之外仅占 0.27%（小概率事件）"));
      desc.innerHTML = "<b>② 3σ 原则经验黄金率</b>：数据落在 \([\mu-\sigma, \mu+\sigma]\) 占约 68.3%；落在 \([\mu-2\sigma, \mu+2\sigma]\) 占约 95.5%；落在 \([\mu-3\sigma, \mu+3\sigma]\) 占高达 99.73%。落在 \(3\sigma\) 之外的概率几乎为零，是工业质量控制（六西格玛）与异常检测的核心依据。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 轴对称几何切分割补算法
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "对称性割补算单侧：P(X > μ+c) = P(X < μ-c) = (1 - P(区间)) / 2"));

      var cx = 310, cy = 165, sx = 40, sy = 105;
      fig.appendChild(el("line", {x1: 60, y1: cy, x2: 560, y2: cy, stroke: "var(--line)", "stroke-width": "1.5"}));

      // Shaded left tail (x < -1) -> [60, cx-40]
      var ptsL = [];
      for (var i = -40; i <= -10; i++) {
        var x = i / 10;
        ptsL.push((cx + x * sx).toFixed(1) + "," + (cy - Math.exp(-0.5*x*x)*sy).toFixed(1));
      }
      fig.appendChild(el("polygon", {points: "60," + cy + " " + ptsL.join(" ") + " " + (cx-sx) + "," + cy, fill: "#fee2e2"}));

      // Shaded right tail (x > 1) -> [cx+40, 560]
      var ptsR = [];
      for (var j = 10; j <= 40; j++) {
        var x = j / 10;
        ptsR.push((cx + x * sx).toFixed(1) + "," + (cy - Math.exp(-0.5*x*x)*sy).toFixed(1));
      }
      fig.appendChild(el("polygon", {points: (cx+sx) + "," + cy + " " + ptsR.join(" ") + " 560," + cy, fill: "#fee2e2"}));

      // Full curve
      fig.appendChild(el("polyline", {points: bellCurvePath(cx, cy, sx, sy), fill: "none", stroke: "#1976d2", "stroke-width": "2.5"}));
      fig.appendChild(el("line", {x1: cx, y1: 45, x2: cx, y2: cy, stroke: "#ef4444", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: cx, y: 40, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "对称轴 x = μ"));

      // Labels for tails
      fig.appendChild(el("text", {x: cx - 2*sx, y: 135, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "左单尾 15.87%"));
      fig.appendChild(el("text", {x: cx + 2*sx, y: 135, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "右单尾 15.87%"));

      fig.appendChild(el("text", {x: 310, y: 198, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "求右单尾 P(X > μ+σ)：必须把双尾总和 (1-0.6827) 除以 2 得到 0.1587！"));
      desc.innerHTML = "<b>③ 轴对称割补几何算法</b>：高斯钟形曲线关于对称轴平分秋色（左半 0.5、右半 0.5）。求单侧超过某格点的概率时，先求出对称中心区间的概率，用 1 减去它得到左右双尾的总面积，最后除以 2 得到单侧概率。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "正确：右单尾除以 2 ➔ 0.1587"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "翻车：忘了除以 2 算成 0.3173"));

      // Left: 1 tail shaded
      var cx1 = 140, cy1 = 100, sx1 = 25, sy1 = 55;
      trapFig.appendChild(el("line", {x1: 40, y1: cy1, x2: 240, y2: cy1, stroke: "var(--line)", "stroke-width": "1"}));
      var ptsR1 = [];
      for (var j = 10; j <= 35; j++) {
        var x = j / 10;
        ptsR1.push((cx1 + x * sx1).toFixed(1) + "," + (cy1 - Math.exp(-0.5*x*x)*sy1).toFixed(1));
      }
      trapFig.appendChild(el("polygon", {points: (cx1+sx1) + "," + cy1 + " " + ptsR1.join(" ") + " 240," + cy1, fill: "#e8f5e9"}));
      trapFig.appendChild(el("polyline", {points: bellCurvePath(cx1, cy1, sx1, sy1), fill: "none", stroke: "#10b981", "stroke-width": "1.8"}));
      trapFig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "单侧面积 = 0.3173 ÷ 2 = 0.1587"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Both tails shaded as one
      var cx2 = 400, cy2 = 100, sx2 = 25, sy2 = 55;
      trapFig.appendChild(el("line", {x1: 300, y1: cy2, x2: 500, y2: cy2, stroke: "var(--line)", "stroke-width": "1"}));
      var ptsL2 = [];
      for (var i = -35; i <= -10; i++) {
        var x = i / 10;
        ptsL2.push((cx2 + x * sx2).toFixed(1) + "," + (cy2 - Math.exp(-0.5*x*x)*sy2).toFixed(1));
      }
      trapFig.appendChild(el("polygon", {points: "300," + cy2 + " " + ptsL2.join(" ") + " " + (cx2-sx2) + "," + cy2, fill: "#fee2e2"}));
      var ptsR2 = [];
      for (var j2 = 10; j2 <= 35; j2++) {
        var x2 = j2 / 10;
        ptsR2.push((cx2 + x2 * sx2).toFixed(1) + "," + (cy2 - Math.exp(-0.5*x2*x2)*sy2).toFixed(1));
      }
      trapFig.appendChild(el("polygon", {points: (cx2+sx2) + "," + cy2 + " " + ptsR2.join(" ") + " 500," + cy2, fill: "#fee2e2"}));
      trapFig.appendChild(el("polyline", {points: bellCurvePath(cx2, cy2, sx2, sy2), fill: "none", stroke: "#ef4444", "stroke-width": "1.8"}));
      trapFig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "把左右两头都算进去了（翻倍错误！）"));
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

print('Upgrade e3-7-5 completed! File size:', len(html.encode('utf-8')), 'bytes')
