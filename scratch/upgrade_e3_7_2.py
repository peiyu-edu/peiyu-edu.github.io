# upgrade_e3_7_2.py
import re
import os

filepath = 'highSchool/site/lessons/e3-7-2.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：必修二 10.1 概率与样本空间（<a href="b2-10-1.html">回看 10.1</a>）；6.2 组合数（<a href="e3-6-2.html">回看 6.2</a>）。离散型随机变量是将随机试验的离散结果数值化。</p>

  <div class="card">
    <p><b>随机变量 \(X\)（结果的实数化映射）</b>：随机试验的结果往往是文字（如「正面」「反面」「红球」「中奖」），为了能用数学公式进行分析，我们将每个样本点映射为一个实数，这个变量就叫<b>随机变量</b>。</p>
    <p>例：抛 2 枚硬币，结果有「正正、正反、反正、反反」4 种，设 \(X\) 为正面朝上的次数，则 \(X\) 的取值为 \(0, 1, 2\)。</p>
  </div>

  <div class="card">
    <p><b>离散型随机变量</b>：所有可能取的值可以<b>一一列举出来</b>（有限个或可列无限个）的随机变量。</p>
    <p>对比：射击命中的环数（\(0,1,\dots,10\)）是离散型；而灯泡的使用寿命（\([0, +\infty)\) 内任意实数）是连续型。</p>
  </div>

  <div class="card">
    <p><b>分布列（概率全貌表）</b>：把随机变量 \(X\) 的<b>全部可能取值</b>与其<b>对应发生的概率</b>一一配对制成的表格。</p>
    <p>两条不可逾越的铁律：<br>
    ① <b>非负性</b>：每个概率 \(p_i \ge 0\)；<br>
    ② <b>归一性</b>：所有取值的概率之和严格等于 \(1\)，即 \(\sum p_i = 1\)（无重无漏全覆盖）。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-dist">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">离散型随机变量直觉微图解：样本空间映射、分布列归一性与超几何模型</span>
      <div class="micro-tabs" id="m-dist-tabs">
        <button class="micro-tab active" data-tab="1">① 样本点到实数轴的映射</button>
        <button class="micro-tab" data-tab="2">② 分布列柱状图与归一性</button>
        <button class="micro-tab" data-tab="3">③ 超几何分布抽取模型</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-dist-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-dist-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">两点分布（0-1 分布）</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">非此即彼</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>场景</b>：试验结果只有对立的两种（成功或失败、中奖或没中）。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>分布列</b>：\(P(X=1) = p,\; P(X=0) = 1-p\)。</p>
      <p class="small" style="margin:0;"><b>特质</b>：最基础的原子分布，是二项分布的砖瓦单元。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">超几何分布（不放回抽样）</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">古典概型</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>场景</b>：总数 \(N\) 件含 \(M\) 件特品，<b>不放回随机抽 \(n\) 件</b>，抽到特品数 \(X\)。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>公式</b>：\(P(X=k) = \dfrac{C_M^k C_{N-M}^{n-k}}{C_N^n}\)。</p>
      <p class="small" style="margin:0;"><b>特质</b>：古典概型组合数的标准化套用，注意极值边界。</p>
    </div>
  </div>

  <h3>2. 分布列表格形态与核心性质公式</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">分布列形态与两大铁律：</p>
    <p style="margin:0 0 6px 0;">标准表格：</p>
    <div style="overflow-x:auto; margin-bottom:8px;">
      <table style="border-collapse:collapse; margin:4px 0; font-size:13px; text-align:center;">
        <tr style="border-bottom:1px solid var(--line);"><td style="padding:4px 12px; font-weight:700;">\(X\)</td><td style="padding:4px 12px;">\(\color{#1976d2}{x_1}\)</td><td style="padding:4px 12px;">\(\color{#1976d2}{x_2}\)</td><td style="padding:4px 12px;">\(\cdots\)</td><td style="padding:4px 12px;">\(\color{#1976d2}{x_n}\)</td></tr>
        <tr><td style="padding:4px 12px; font-weight:700;">\(P\)</td><td style="padding:4px 12px;">\(\color{#2e7d32}{p_1}\)</td><td style="padding:4px 12px;">\(\color{#2e7d32}{p_2}\)</td><td style="padding:4px 12px;">\(\cdots\)</td><td style="padding:4px 12px;">\(\color{#2e7d32}{p_n}\)</td></tr>
      </table>
    </div>
    <p style="margin:0 0 6px 0;">① 非负性：\(\color{#2e7d32}{p_i \ge 0}\qquad (i = 1, 2, \dots, n)\)</p>
    <p style="margin:0;">② 归一性：\(\sum_{i=1}^n \color{#2e7d32}{p_i} = \color{#2e7d32}{p_1 + p_2 + \cdots + p_n = 1}\quad (\text{必查自检项！})\)</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：掷一枚骰子，点数是奇数时记 \(X=1\)，是偶数时记 \(X=0\)。\(X\) 有几个可能的取值？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(2\) 个</button>
      <button class="opt" data-v="B"><b>B</b>\(3\) 个</button>
      <button class="opt" data-v="C"><b>C</b>\(6\) 个</button>
    </div>
    <div class="reveal"><p><b>A</b>。取值只有 \(0\) 和 \(1\)：\(1,3,5\) 三个样本点都对应 \(1\)，\(2,4,6\) 都对应 \(0\)。选 C 的同学数的是样本点，不是取值。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：\(X\) 的分布列中，\(X\) 取 \(-1,0,1\) 的概率分别是 \(0.2,\ a,\ 0.5\)。\(a=\)？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(0.2\)</button>
      <button class="opt" data-v="B"><b>B</b>\(0.3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(0.5\)</button>
      <button class="opt" data-v="D"><b>D</b>\(0.7\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(0.2+a+0.5=1\)，\(a=0.3\)。选 C 的同学只用 \(1\) 减了 \(0.5\)，漏了 \(0.2\)。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：一个袋中装有 5 个大小质地完全相同的小球，其中 3 个红球，2 个白球。从中不放回地随机取出 3 个球，设取出红球的个数为 \(X\)。求 \(X\) 的分布列。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">不放回抽样中特定球的件数 \(\Longrightarrow\) <b>超几何分布</b>！先确定总体参数：\(N = 5\)，红球总数 \(M = 3\)，抽取球数 \(n = 3\)。再排查 \(X\) 的可能取值范围：因为总共才 2 个白球，抽 3 个球必须至少含有 1 个红球（\(3 - 2 = 1\)），最多可抽到 3 个红球，因此 \(X\) 的取值只能是 \(\color{#2563eb}{1, 2, 3}\)（绝不可能为 0）！</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步套用超几何公式逐点计算</b>：
        <div class="small" style="margin-top:4px;">
          基本事件总数：\(C_5^3 = 10\) 种。<br>
          • \(P(X=1) = \dfrac{C_3^1 C_2^2}{C_5^3} = \dfrac{3 \times 1}{10} = \dfrac{3}{10} = 0.3\)；<br>
          • \(P(X=2) = \dfrac{C_3^2 C_2^1}{C_5^3} = \dfrac{3 \times 2}{10} = \dfrac{6}{10} = 0.6\)；<br>
          • \(P(X=3) = \dfrac{C_3^3 C_2^0}{C_5^3} = \dfrac{1 \times 1}{10} = \dfrac{1}{10} = 0.1\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步归一性自查与表格列出</b>：
        <span class="small">求和验证：\(0.3 + 0.6 + 0.1 = 1.0\)，不多不少正好归一！<br>
        列出完整分布列：
        <table style="border-collapse:collapse; margin-top:6px; font-size:12px; text-align:center;">
          <tr style="border-bottom:1px solid var(--line);"><td style="padding:2px 10px; font-weight:700;">\(X\)</td><td style="padding:2px 10px;">1</td><td style="padding:2px 10px;">2</td><td style="padding:2px 10px;">3</td></tr>
          <tr><td style="padding:2px 10px; font-weight:700;">\(P\)</td><td style="padding:2px 10px;">0.3</td><td style="padding:2px 10px;">0.6</td><td style="padding:2px 10px;">0.1</td></tr>
        </table>
        </span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="C">
    <p>自己试试：掷两枚骰子，\(X\) 表示两个点数中较大的那个（相同就取它）。\(P(X=2)=\)？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac1{36}\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac1{18}\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac1{12}\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac16\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。较大点数是 \(2\) 的样本点：\((1,2),(2,1),(2,2)\)，共 \(3\) 个，\(P=\dfrac3{36}=\dfrac1{12}\)。选 B 的同学漏了 \((2,2)\)；选 A 的只想到了 \((2,2)\)。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：盲目照抄惯性取值，写出不存在的边界值（\(X=0\) 陷阱）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：5 球中有 3 红 2 白，抽 3 个球，不假思索认为红球数 \(X\) 可以取 \(0, 1, 2, 3\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：极端值必须做物理可行性检验！袋中总共只有 2 个白球，就算把白球全部抽走，第 3 个也必须是红球。因此<b>红球数至少为 1</b>，\(X\) 取值只有 \(\{1, 2, 3\}\)！若多写 \(X=0\) 会导致分布列整体错乱。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：算完各点概率不做归一性检查，带着错误交卷</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：各点概率算出后，和为 0.9 或 1.1，未做自检直接下笔写后续期望方差，全盘连环扣分。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>\(\sum p_i = 1\) 是大题中免费的天然验算器</b>！一旦求和不等于 1，立刻回溯是漏掉了某个取值，还是组合数分母算错，5 秒钟挽救整道大题！</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：把「样本点个数」与「随机变量取值个数」混淆</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：投掷一颗骰子，记出现奇数为 1，偶数为 0。认为 \(X\) 有 6 个可能取值。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：样本点有 6 个（\(1,2,3,4,5,6\)），但<b>随机变量的取值是映射后的实数</b>，只有 \(0\) 和 \(1\) 这 2 个值！多个样本点可以映射到同一个实数值。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：概率归一性（各柱累加填满 100% 矩形）直觉</div>
    <svg class="micro-fig" id="m-dist-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      归一性检验：各概率条拼合必须严丝合缝填满高度为 1 的单位柱，若出现间隙（<1）或溢出（>1）则必有计算疏漏。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-7-2
script_code = r'''
  // === e3-7-2 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-dist-fig");
    var desc = document.getElementById("m-dist-desc");
    var trapFig = document.getElementById("m-dist-trap-fig");
    var tabs = document.querySelectorAll("#m-dist-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 样本空间到实数轴的映射 (抛2枚硬币)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "随机变量本质：样本点 ω ⟼ 实数 X(ω) 的函数映射"));

      // Left: Sample points
      var samples = [
        {name: "反反 (TT)", y: 55, xVal: 0},
        {name: "正反 (HT)", y: 90, xVal: 1},
        {name: "反正 (TH)", y: 125, xVal: 1},
        {name: "正正 (HH)", y: 160, xVal: 2}
      ];

      fig.appendChild(el("rect", {x: 50, y: 38, width: 140, height: 145, rx: 8, fill: "#f3f4f6", stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 120, y: 50, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--muted)"}, "样本空间 Ω"));

      // Right: Real axis
      var xTargets = [
        {val: 0, y: 65, prob: "P=1/4"},
        {val: 1, y: 110, prob: "P=2/4"},
        {val: 2, y: 155, prob: "P=1/4"}
      ];

      fig.appendChild(el("line", {x1: 440, y1: 45, x2: 440, y2: 180, stroke: "var(--fg)", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 440, y: 35, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--fg)"}, "实数轴 X"));

      xTargets.forEach(function(xt) {
        fig.appendChild(el("circle", {cx: 440, cy: xt.y, r: 6, fill: "#1976d2"}));
        fig.appendChild(el("text", {x: 460, y: xt.y + 4, "font-size": "13", "font-weight": "700", fill: "#1976d2"}, "X = " + xt.val));
        fig.appendChild(el("text", {x: 520, y: xt.y + 4, "font-size": "11", fill: "var(--muted)"}, xt.prob));
      });

      samples.forEach(function(s) {
        fig.appendChild(el("text", {x: 70, y: s.y + 4, "font-size": "11.5", "font-weight": "700", fill: "var(--fg)"}, s.name));
        var targetY = s.xVal === 0 ? 65 : (s.xVal === 1 ? 110 : 155);
        fig.appendChild(el("line", {x1: 170, y1: s.y, x2: 430, y2: targetY, stroke: "#10b981", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      });

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "多个样本点（如正反、反正）可以汇聚映射到同一个实数值 X=1"));
      desc.innerHTML = "<b>① 随机变量映射本质</b>：随机变量并不是一个数值，而是一个<b>函数</b>！它将抽象的物理试验结果（如硬币朝向）量化映射为数轴上的实数点。关注点从复杂的文字描述转化为清晰的数字取值及其概率分配。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 分布列柱状图与归一性
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "分布列柱状图：各条高度非负，累加总面积严丝合缝等于 1"));

      var distData = [
        {val: 0, p: 0.25, name: "X=0"},
        {val: 1, p: 0.50, name: "X=1"},
        {val: 2, p: 0.25, name: "X=2"}
      ];

      // Left bar chart
      distData.forEach(function(d, i) {
        var x = 80 + i * 70;
        var barH = d.p * 180;
        var y = 160 - barH;
        fig.appendChild(el("rect", {x: x, y: y, width: 44, height: barH, rx: 4, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: x + 22, y: y - 6, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "" + d.p));
        fig.appendChild(el("text", {x: x + 22, y: 178, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "var(--fg)"}, d.name));
      });
      fig.appendChild(el("line", {x1: 60, y1: 160, x2: 300, y2: 160, stroke: "var(--line)", "stroke-width": "1.5"}));

      // Separator
      fig.appendChild(el("line", {x1: 330, y1: 35, x2: 330, y2: 185, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: 100% normalized stacked bar
      fig.appendChild(el("text", {x: 470, y: 45, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "归一性拼图：∑ pᵢ = 1.0"));
      // Stack segments
      // 0.25 -> h=35
      // 0.50 -> h=70
      // 0.25 -> h=35
      fig.appendChild(el("rect", {x: 430, y: 60, width: 80, height: 35, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 470, y: 82, "text-anchor": "middle", "font-size": "11", fill: "#1976d2"}, "p₀ = 0.25"));

      fig.appendChild(el("rect", {x: 430, y: 95, width: 80, height: 70, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 470, y: 135, "text-anchor": "middle", "font-size": "11", fill: "#2e7d32"}, "p₁ = 0.50"));

      fig.appendChild(el("rect", {x: 430, y: 165, width: 80, height: 35, fill: "#fef3c7", stroke: "#d97706", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 470, y: 187, "text-anchor": "middle", "font-size": "11", fill: "#d97706"}, "p₂ = 0.25"));

      fig.appendChild(el("text", {x: 310, y: 208, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "任一概率 0 ≤ pᵢ ≤ 1，所有概率求和等于 1 是必须自检的黄金标准"));
      desc.innerHTML = "<b>② 分布列柱状图与归一性</b>：分布列在几何上就是概率质量的柱状图，每根柱子代表一个取值的发生概率。所有可能取值穷尽全样本空间，因此柱子面积之和必须严格为 1。解题后把各概率累加是检查计算疏漏的最强武器。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 超几何分布抽取模型 (5球: 3红 2白，抽 3球)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "超几何分布：总体 N=5，特品 M=3(红)，抽取 n=3(不放回)"));

      // Bag box
      fig.appendChild(el("rect", {x: 50, y: 45, width: 220, height: 125, rx: 10, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 160, y: 68, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "总体 N = 5"));

      // 3 Red balls
      [80, 120, 160].forEach(function(bx) {
        fig.appendChild(el("circle", {cx: bx, cy: 95, r: 12, fill: "#ef4444"}));
        fig.appendChild(el("text", {x: bx, y: 99, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#fff"}, "红"));
      });
      // 2 White balls
      [200, 240].forEach(function(bx) {
        fig.appendChild(el("circle", {cx: bx, cy: 95, r: 12, fill: "#f3f4f6", stroke: "var(--line)", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: bx, y: 99, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "var(--fg)"}, "白"));
      });
      fig.appendChild(el("text", {x: 160, y: 135, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "只有 2 个白球 ⟹ 抽 3 球至少 1 个红球！"));
      fig.appendChild(el("text", {x: 160, y: 155, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "X 只能取 1, 2, 3（不能取 0）"));

      // Right Formula breakdown card
      fig.appendChild(el("rect", {x: 310, y: 45, width: 270, height: 125, rx: 8, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 445, y: 70, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "超几何通用计算公式"));
      fig.appendChild(el("text", {x: 445, y: 98, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "P(X=k) = (C₃ᵏ · C₂³⁻ᵏ) / C₅³"));
      fig.appendChild(el("text", {x: 445, y: 125, "text-anchor": "middle", "font-size": "11", fill: "var(--muted)"}, "k=1: 3/10;  k=2: 6/10;  k=3: 1/10"));
      fig.appendChild(el("text", {x: 445, y: 150, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "总和 = 0.3 + 0.6 + 0.1 = 1.0 (归一)"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "超几何分布的关键是确定 X 的极值取值：max(0, n-(N-M)) ≤ k ≤ min(n, M)"));
      desc.innerHTML = "<b>③ 超几何模型直觉</b>：不放回抽样是生活与质检中最常见的离散模型。分母是从全部 \(N\) 件中任抽 \(n\) 件的组合数 \(C_N^n\)；分子是特品选 \(k\) 件与普通品选 \(n-k\) 件的乘积。特别注意排查极值边界，切勿凭空加一个不可行的 \(X=0\)。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "正确归一：∑ pᵢ = 0.3 + 0.6 + 0.1 = 1.0"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "错误疏漏：求和 ≠ 1（漏项或算错）"));

      // Left bar (1.0 perfect)
      fig = trapFig;
      fig.appendChild(el("rect", {x: 60, y: 40, width: 160, height: 60, rx: 6, fill: "#e8f5e9", stroke: "#10b981", "stroke-width": "2"}));
      fig.appendChild(el("rect", {x: 60, y: 40, width: 48, height: 60, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 84, y: 75, "text-anchor": "middle", "font-size": "11", fill: "#1976d2"}, "0.3"));
      fig.appendChild(el("rect", {x: 108, y: 40, width: 96, height: 60, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 156, y: 75, "text-anchor": "middle", "font-size": "11", fill: "#2e7d32"}, "0.6"));
      fig.appendChild(el("rect", {x: 204, y: 40, width: 16, height: 60, fill: "#fef3c7", stroke: "#d97706", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 212, y: 75, "text-anchor": "middle", "font-size": "9", fill: "#d97706"}, "0.1"));
      fig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "严丝合缝填满 100%"));

      // Separator
      fig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right bar (gap)
      fig.appendChild(el("rect", {x: 320, y: 40, width: 160, height: 60, rx: 6, fill: "#f3f4f6", stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("rect", {x: 320, y: 40, width: 110, height: 60, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 375, y: 75, "text-anchor": "middle", "font-size": "11", fill: "#ef4444"}, "和为 0.85"));
      fig.appendChild(el("rect", {x: 430, y: 40, width: 50, height: 60, fill: "none", stroke: "#ef4444", "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: 455, y: 75, "text-anchor": "middle", "font-size": "10", fill: "#ef4444"}, "缺口 0.15"));
      fig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "存在漏项或组合数计算失误！"));
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

print('Upgrade e3-7-2 completed! File size:', len(html.encode('utf-8')), 'bytes')
