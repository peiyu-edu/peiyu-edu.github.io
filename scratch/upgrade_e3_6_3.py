# upgrade_e3_6_3.py
import re
import os

filepath = 'highSchool/site/lessons/e3-6-3.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-expand', 'try-const', 'try-1', 'try-assign']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：6.2 排列与组合（<a href="e3-6-2.html">回看 6.2</a>），二项式定理的本质是乘法分配律与组合计数的结合。</p>

  <div class="card">
    <p><b>二项式定理</b>：多项式 \((a+b)^n\) 展开后由若干项相加组成的公式：</p>
    <p>$$(a+b)^n = C_n^0 a^n + C_n^1 a^{n-1}b + \cdots + C_n^r a^{n-r}b^r + \cdots + C_n^n b^n$$</p>
    <p>为什么是组合数：展开式相当于 \(n\) 个括号 \((a+b)\) 相乘，每一项都必须从每个括号中<b>选且仅选一个字母</b>（选 \(a\) 或选 \(b\)）。若选了 \(r\) 个 \(b\)，剩下 \(n-r\) 个就必须选 \(a\)，选法数即为从 \(n\) 个括号中挑出 \(r\) 个括号选 \(b\)，共 \(C_n^r\) 种。</p>
  </div>

  <div class="card">
    <p><b>通项公式（第 \(r+1\) 项）</b>：展开式中第 \(r+1\) 项记作 \(T_{r+1}\)：</p>
    <p>$$T_{r+1} = C_n^r a^{n-r} b^r\quad (r = 0, 1, 2, \dots, n)$$</p>
    <p><b>致命细节</b>：通项的角标是 \(r+1\)，而组合数的上标和 \(b\) 的指数是 \(r\)。例如：求「第 3 项」时，对应的是 \(r = 2\)！</p>
  </div>

  <div class="card">
    <p><b>二项式系数 vs 项的系数</b>：</p>
    <p>• <b>二项式系数</b>：仅指组合数 \(C_n^r\)，只由指数 \(n\) 与位次 \(r\) 决定，<b>全为正数且两端对称</b>，与 \(a, b\) 是什么完全无关；</p>
    <p>• <b>项的系数</b>：化简后未知数前面的全部数值乘数（包含负号与底数自带的系数，如 \((-2)^r C_n^r\)），可正可负，不对称。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-binom">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">二项式直觉微图解：括号选取模型、杨辉三角递推与系数辨析</span>
      <div class="micro-tabs" id="m-binom-tabs">
        <button class="micro-tab active" data-tab="1">① 括号选取模型直觉</button>
        <button class="micro-tab" data-tab="2">② 杨辉三角几何结构</button>
        <button class="micro-tab" data-tab="3">③ 二项式系数 vs 项的系数</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-binom-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-binom-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">二项式系数 \(C_n^r\)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">纯组合数</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>定义</b>：仅由 \(C_n^r\) 决定的系数，不含底数参数。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>性质</b>：恒为正数；两端对称；中间最大；总和 \(\sum C_n^r = 2^n\)。</p>
      <p class="small" style="margin:0;"><b>例</b>：\((2x - 1)^5\) 第 3 项的二项式系数是 \(C_5^2 = 10\)。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">项的系数</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">完整数值</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>定义</b>：单项式化简后，字母变量前面的全部数字常数乘数。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>性质</b>：受底数常数与符号影响，可正可负，不对称；求和用赋值法。</p>
      <p class="small" style="margin:0;"><b>例</b>：\((2x - 1)^5\) 第 3 项的系数是 \(C_5^2 \cdot 2^3 \cdot (-1)^2 = 80\)。</p>
    </div>
  </div>

  <h3>2. 二项式色彩语义主公式与赋值法</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">通项与二项式定理主公式：</p>
    <p style="margin:0 0 6px 0;">展开式：\((a+b)^n = \sum_{r=0}^n \color{#d97706}{C_n^r} \cdot \color{#1976d2}{a^{n-r}} \cdot \color{#2e7d32}{b^r}\)</p>
    <p style="margin:0 0 8px 0;">通项公式：\(T_{\color{#ef4444}{r+1}} = \color{#d97706}{C_n^r} \cdot \color{#1976d2}{a^{n-r}} \cdot \color{#2e7d32}{b^r}\quad (\color{#ef4444}{\text{第 } r+1 \text{ 项对应 } b \text{ 的 } r \text{ 次方}})\)</p>
    <p style="margin:0 0 6px 0;"><b>赋值法三绝技（设 \(f(x) = (ax+b)^n = a_0 + a_1 x + \cdots + a_n x^n\)）</b>：</p>
    <p style="margin:0 0 4px 0;">① 所有项系数和：令 \(x = 1 \Longrightarrow f(1) = a_0 + a_1 + a_2 + \cdots + a_n\)</p>
    <p style="margin:0 0 4px 0;">② 常数项：令 \(x = 0 \Longrightarrow a_0 = f(0)\)</p>
    <p style="margin:0;">③ 偶次项与奇次项和：令 \(x = -1\) 算 \(f(-1)\)，则偶次和为 \(\dfrac{f(1)+f(-1)}{2}\)，奇次和为 \(\dfrac{f(1)-f(-1)}{2}\)。</p>
  </div>

  <div class="card predict" data-id="try-expand" data-answer="A">
    <p>自己试试：\((1+2x)^5\) 展开式的第 \(3\) 项是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(40x^2\)</button>
      <button class="opt" data-v="B"><b>B</b>\(80x^3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(10x^2\)</button>
      <button class="opt" data-v="D"><b>D</b>\(20x^2\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。第 \(3\) 项对应 \(r=2\)：\(T_3=C_5^2\cdot1^3\cdot(2x)^2=10\times4x^2=40x^2\)。选 B 是把 \(r\) 取成了 \(3\)（那是第 \(4\) 项）；选 C 是忘了 \(2x\) 里的 \(2\) 也要平方；选 D 是 \(2\) 只乘了一次。</p></div>
  </div>

  <div class="card predict" data-id="try-const" data-answer="A">
    <p>自己试试：\(\left(x-\dfrac{2}{x^2}\right)^6\) 展开式的常数项是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(60\)</button>
      <button class="opt" data-v="B"><b>B</b>\(15\)</button>
      <button class="opt" data-v="C"><b>C</b>\(-60\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-160\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(T_{r+1}=C_6^r\,x^{6-r}\left(-2x^{-2}\right)^r=(-2)^r C_6^r\,x^{6-3r}\)。令 \(6-3r=0\)，\(r=2\)，常数项 \(=(-2)^2\times C_6^2=4\times15=60\)。选 B 是忘了乘 \((-2)^2\)；选 C 是负号没跟着平方；选 D 是把 \(x^{-2}\) 的 \(r\) 次方算成了 \(x^{-r}\)，次数写成 \(6-2r\)，解出 \(r=3\)。</p></div>
  </div>

  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：在 \((2x - 1)^5\) 的展开式中，第 3 项的「二项式系数」与该项的「系数」分别是：</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>二项式系数为 \(10\)，项的系数为 \(80\)</button>
      <button class="opt" data-v="B"><b>B</b>二项式系数为 \(10\)，项的系数为 \(-80\)</button>
      <button class="opt" data-v="C"><b>C</b>二项式系数为 \(20\)，项的系数为 \(80\)</button>
      <button class="opt" data-v="D"><b>D</b>二项式系数为 \(80\)，项的系数为 \(10\)</button>
    </div>
    <div class="reveal">
      <p><b>A</b>。通项是 \(T_{r+1} = C_5^r (2x)^{5-r}(-1)^r\)，第 3 项对应 \(r=2\)。</p>
      <p>二项式系数只看组合数：\(C_5^2 = 10\)。</p>
      <p>项：\(T_3 = 10\times(2x)^3\times(-1)^2 = 80x^3\)，系数 \(80\)，\((-1)^2=1\) 所以是正的。</p>
      <p>选 B 是把 \((-1)^2\) 的符号算成了负；选 C 是把 \(C_5^2\) 算成了 \(5\times4=20\)，忘了除以 \(2\)；选 D 是把两个词弄反了。</p>
    </div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：在 \(\left(x - \dfrac{2}{x^2}\right)^6\) 的展开式中，求：<br>
    ① 展开式中的常数项；<br>
    ② 第 3 项的二项式系数与该项的系数。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">无论求特定项还是求常数项，破题第一步必须且只能是<b>写出规范通项 \(T_{r+1}\)</b>，严格把常数因数、负号与未知数 \(x\) 的指数幂剥离拆开！</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步通项分离与指数列方程</b>：
        <div class="small" style="margin-top:4px;">
          • <b>写出通项</b>：\(T_{r+1} = C_6^r \cdot x^{6-r} \cdot \left(-2x^{-2}\right)^r = (-2)^r C_6^r \cdot x^{6 - 3r}\)；<br>
          • <b>① 求常数项</b>：常数项即 \(x\) 的指数为 \(0\)，令 \(6 - 3r = 0 \Longrightarrow r = 2\)。<br>
          代入通项得：常数项为 \(T_3 = (-2)^2 C_6^2 \cdot x^0 = 4 \times 15 = 60\)；<br>
          • <b>② 分析第 3 项</b>：第 3 项对应 \(r = 3 - 1 = 2\)：<br>
          – 二项式系数仅为组合数：\(C_6^2 = 15\)；<br>
          – 该项的系数为全部数值因数：\((-2)^2 C_6^2 = 4 \times 15 = 60\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步防坑结论核查</b>：
        <span class="small">防坑 1：常数项中负号参与偶数次方变正（\((-2)^2 = 4\) 不是 \(-4\)）；防坑 2：二项式系数是 15，绝不能带上 4 算成 60，二者概念严格分明！</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-assign" data-answer="C">
    <p>自己试试：设 \((2x+1)^4=a_0+a_1x+a_2x^2+a_3x^3+a_4x^4\)，则 \(a_0+a_2+a_4=\)？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(81\)</button>
      <button class="opt" data-v="B"><b>B</b>\(40\)</button>
      <button class="opt" data-v="C"><b>C</b>\(41\)</button>
      <button class="opt" data-v="D"><b>D</b>\(8\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。令 \(x=1\) 得 \(f(1)=3^4=81\)，令 \(x=-1\) 得 \(f(-1)=(-1)^4=1\)。偶次项系数和 \(=\dfrac{81+1}{2}=41\)（展开式是 \(16x^4+32x^3+24x^2+8x+1\)，\(1+24+16=41\)）。选 A 是所有系数都加了；选 B 是用了减号，算成了奇次项系数和；选 D 是套了二项式系数的 \(2^{n-1}\)，可这里问的是项的系数。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：通项角标错位（求第 \(k\) 项却取 \(r = k\)）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：求展开式中的第 3 项，直接把 \(r=3\) 代入，算成 \(T_4\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：通项是 \(T_{r+1}\)！<b>第 \(k\) 项对应 \(r = k - 1\)</b>。第 1 项是 \(r=0\)，第 2 项是 \(r=1\)，第 3 项是 \(r=2\)！</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：漏乘底数的负号或系数，或负号指数运算出错</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：在 \(\left(x - \dfrac{2}{x^2}\right)^6\) 中，算常数项写成 \(C_6^2 = 15\) 或算成 \(-60\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：二项式是 \(a + b\)，这里 \(b = -2x^{-2}\)，负号和常数 2 是一体的！必须写成 \((-2)^r\)。当 \(r=2\) 时，\((-2)^2 = 4\)，常数项为 \(4 \times 15 = 60\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：混淆「二项式系数和」与「各项系数和」</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：求 \((2x - 1)^5\) 的各项系数和，直接套公式写 \(2^5 = 32\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：二项式系数和是 \(\sum C_5^r = 2^5 = 32\)；而<b>各项系数和必须使用赋值法令 \(x = 1\)</b>！代入得 \((2 \times 1 - 1)^5 = 1^5 = 1\)！两者的值天差地别。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：(2x-1)⁵ 的二项式系数（全正对称）vs 项的系数（正负剧烈震荡）直觉对比</div>
    <svg class="micro-fig" id="m-binom-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      二项式系数是完美的帕斯卡钟形曲线（和为 32）；项的系数因含 (-1)^r 2^(5-r) 呈现正负交错跳变（和为 1）。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-6-3
script_code = r'''
  // === e3-6-3 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-binom-fig");
    var desc = document.getElementById("m-binom-desc");
    var trapFig = document.getElementById("m-binom-trap-fig");
    var tabs = document.querySelectorAll("#m-binom-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 括号选取模型直觉 (a+b)⁴
      // 4 个括号排开，每个括号选 a 或 b
      fig.appendChild(el("text", {x: 310, y: 24, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "(a+b)⁴ = (a+b)(a+b)(a+b)(a+b)：每个括号选且仅选 1 个字母"));

      var brackets = [
        {name: "第1个 (a+b)", x: 50, pick: "a"},
        {name: "第2个 (a+b)", x: 190, pick: "b"},
        {name: "第3个 (a+b)", x: 330, pick: "a"},
        {name: "第4个 (a+b)", x: 470, pick: "b"}
      ];

      brackets.forEach(function(b) {
        fig.appendChild(el("rect", {x: b.x, y: 45, width: 100, height: 60, rx: 8, fill: "var(--card)", stroke: "var(--line)", "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: b.x + 50, y: 68, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "var(--fg)"}, b.name));

        // Choice badges inside
        var aFill = b.pick === "a" ? "#e3f2fd" : "#f3f4f6";
        var aCol = b.pick === "a" ? "#1976d2" : "#9ca3af";
        var bFill = b.pick === "b" ? "#e8f5e9" : "#f3f4f6";
        var bCol = b.pick === "b" ? "#2e7d32" : "#9ca3af";

        fig.appendChild(el("rect", {x: b.x + 12, y: 78, width: 34, height: 20, rx: 4, fill: aFill, stroke: aCol, "stroke-width": "1"}));
        fig.appendChild(el("text", {x: b.x + 29, y: 92, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: aCol}, "选 a"));

        fig.appendChild(el("rect", {x: b.x + 54, y: 78, width: 34, height: 20, rx: 4, fill: bFill, stroke: bCol, "stroke-width": "1"}));
        fig.appendChild(el("text", {x: b.x + 71, y: 92, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: bCol}, "选 b"));

        // Arrow pointing down to result
        fig.appendChild(el("line", {x1: b.x + 50, y1: 110, x2: 310, y2: 145, stroke: "var(--line)", "stroke-width": "1", "stroke-dasharray": "2 2"}));
      });

      // Synthesis card
      fig.appendChild(el("rect", {x: 180, y: 145, width: 260, height: 35, rx: 8, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 310, y: 168, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#d97706"}, "本条选取路径乘积：a · b · a · b = a²b²"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "从 4 个括号里挑 2 个选 b，方法数就是 C₄² = 6 种，故 a²b² 的系数是 6！"));
      desc.innerHTML = "<b>① 括号选取模型直觉</b>：展开多项式并非机械死算，本质是从每个 \((a+b)\) 括号中挑选一个字母相乘。要求产生 \(a^{n-r}b^r\) 项，必须且只需在 \(n\) 个括号中任挑 \(r\) 个选 \(b\)（其余选 \(a\)），方法数恰好为组合数 <b>Cₙʳ</b>。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 杨辉三角几何结构
      fig.appendChild(el("text", {x: 310, y: 20, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "杨辉三角：对称性 Cₙʳ = Cₙⁿ⁻ʳ 与递推性 Cₙ₊₁ʳ = Cₙʳ + Cₙʳ⁻¹"));

      var rows = [
        [1],
        [1, 1],
        [1, 2, 1],
        [1, 3, 3, 1],
        [1, 4, 6, 4, 1]
      ];

      rows.forEach(function(row, rIdx) {
        var y = 45 + rIdx * 30;
        var startX = 310 - (row.length - 1) * 26;
        row.forEach(function(val, cIdx) {
          var x = startX + cIdx * 52;
          var isHighlight = (rIdx === 3 && (cIdx === 1 || cIdx === 2)) || (rIdx === 4 && cIdx === 2);
          var fillCol = isHighlight ? "#fef3c7" : "var(--card)";
          var strokeCol = isHighlight ? "#f59e0b" : "var(--line)";
          var textCol = isHighlight ? "#d97706" : "var(--fg)";

          fig.appendChild(el("rect", {x: x - 18, y: y - 12, width: 36, height: 24, rx: 6, fill: fillCol, stroke: strokeCol, "stroke-width": "1.5"}));
          fig.appendChild(el("text", {x: x, y: y + 4, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: textCol}, "" + val));
        });
      });

      // Highlight arrows connecting 3 + 3 = 6
      fig.appendChild(el("line", {x1: 284, y1: 147, x2: 300, y2: 155, stroke: "#f59e0b", "stroke-width": "2"}));
      fig.appendChild(el("line", {x1: 336, y1: 147, x2: 320, y2: 155, stroke: "#f59e0b", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 480, y: 155, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#f59e0b"}, "两肩相加：3 + 3 = 6"));

      fig.appendChild(el("text", {x: 310, y: 205, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "第 n 行各项之和 = 2ⁿ；任意两肩之数相加等于正下方之数"));
      desc.innerHTML = "<b>② 杨辉三角几何直觉</b>：第 \(n\) 行的数字就是 \((a+b)^n\) 的各二项式系数。轴对称展现了 \(C_n^r = C_n^{n-r}\)；倒三角两肩相加展现了递推公式 \(C_{n+1}^r = C_n^r + C_n^{r-1}\)；每行数字之和依次为 1, 2, 4, 8, 16 ... 正好是 \(2^n\)。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 二项式系数 vs 项的系数对比曲线
      fig.appendChild(el("text", {x: 310, y: 20, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "(2x-1)⁵ 展开式中：二项式系数 C₅ʳ（全正）vs 项的系数（交错震荡）"));

      // Left: Binomial coeffs C_5^r: 1, 5, 10, 10, 5, 1
      fig.appendChild(el("text", {x: 160, y: 44, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#1976d2"}, "二项式系数 C₅ʳ（完美钟形全正）"));
      var bCoeffs = [1, 5, 10, 10, 5, 1];
      bCoeffs.forEach(function(val, r) {
        var x = 60 + r * 40;
        var barH = val * 8;
        var y = 140 - barH;
        fig.appendChild(el("rect", {x: x - 10, y: y, width: 20, height: barH, rx: 3, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
        fig.appendChild(el("text", {x: x, y: y - 4, "text-anchor": "middle", "font-size": "10", "font-weight": "700", fill: "#1976d2"}, "" + val));
        fig.appendChild(el("text", {x: x, y: 154, "text-anchor": "middle", "font-size": "9.5", fill: "var(--muted)"}, "r=" + r));
      });
      fig.appendChild(el("line", {x1: 40, y1: 140, x2: 280, y2: 140, stroke: "var(--line)", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 160, y: 175, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "总和：∑ C₅ʳ = 2⁵ = 32"));

      // Separator
      fig.appendChild(el("line", {x1: 310, y1: 35, x2: 310, y2: 185, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Term coeffs: T_{r+1} coeff = C_5^r * 2^(5-r) * (-1)^r
      // r=0: 1 * 32 * 1 = 32
      // r=1: 5 * 16 * (-1) = -80
      // r=2: 10 * 8 * 1 = 80
      // r=3: 10 * 4 * (-1) = -40
      // r=4: 5 * 2 * 1 = 10
      // r=5: 1 * 1 * (-1) = -1
      fig.appendChild(el("text", {x: 460, y: 44, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#2e7d32"}, "项的系数 (-1)ʳ 2⁵⁻ʳ C₅ʳ（大幅震荡）"));
      var tCoeffs = [32, -80, 80, -40, 10, -1];
      tCoeffs.forEach(function(val, r) {
        var x = 345 + r * 38;
        var isPos = val >= 0;
        var barH = Math.min(65, Math.abs(val) * 0.7);
        var y = isPos ? (115 - barH) : 115;
        var col = isPos ? "#10b981" : "#ef4444";
        var fill = isPos ? "#e8f5e9" : "#fee2e2";

        fig.appendChild(el("rect", {x: x - 8, y: y, width: 16, height: barH, rx: 2, fill: fill, stroke: col, "stroke-width": "1"}));
        var textY = isPos ? (y - 3) : (y + barH + 10);
        fig.appendChild(el("text", {x: x, y: textY, "text-anchor": "middle", "font-size": "9", "font-weight": "700", fill: col}, "" + val));
        fig.appendChild(el("text", {x: x, y: 154, "text-anchor": "middle", "font-size": "9.5", fill: "var(--muted)"}, "r=" + r));
      });
      fig.appendChild(el("line", {x1: 330, y1: 115, x2: 590, y2: 115, stroke: "var(--line)", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 460, y: 175, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#2e7d32"}, "赋值法总和：(2·1-1)⁵ = 1⁵ = 1"));

      fig.appendChild(el("text", {x: 310, y: 205, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "求二项式系数和是 2ⁿ，求项的系数和必须用赋值法令 x=1"));
      desc.innerHTML = "<b>③ 二项式系数 vs 项的系数直觉</b>：二项式系数仅由组合数决定，永远是左右对称的正数，总和为 \(2^n = 32\)；而项的系数将底数的系数与负号融合，呈现剧烈正负交错跳变，总和必须令 \(x=1\) 得 \((2-1)^5 = 1\)。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#1976d2"}, "二项式系数：∑ C₅ʳ = 2⁵ = 32"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#2e7d32"}, "项的系数和：令 x=1 得 (2-1)⁵ = 1"));

      // Left bars (all positive)
      [1, 5, 10, 10, 5, 1].forEach(function(v, i) {
        var x = 50 + i * 32;
        var h = v * 5;
        trapFig.appendChild(el("rect", {x: x - 6, y: 95 - h, width: 12, height: h, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      });
      trapFig.appendChild(el("line", {x1: 40, y1: 95, x2: 240, y2: 95, stroke: "var(--line)", "stroke-width": "1"}));
      trapFig.appendChild(el("text", {x: 140, y: 120, "text-anchor": "middle", "font-size": "10.5", fill: "#1976d2"}, "全为正数，完全对称"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right bars (alternating)
      [32, -80, 80, -40, 10, -1].forEach(function(v, i) {
        var x = 320 + i * 30;
        var isP = v >= 0;
        var h = Math.min(45, Math.abs(v) * 0.5);
        var y = isP ? (80 - h) : 80;
        var col = isP ? "#10b981" : "#ef4444";
        trapFig.appendChild(el("rect", {x: x - 6, y: y, width: 12, height: h, fill: col, opacity: "0.8"}));
      });
      trapFig.appendChild(el("line", {x1: 300, y1: 80, x2: 500, y2: 80, stroke: "var(--line)", "stroke-width": "1"}));
      trapFig.appendChild(el("text", {x: 400, y: 120, "text-anchor": "middle", "font-size": "10.5", fill: "#ef4444"}, "正负抵消，总和为 1（切勿当成 32 混淆！）"));
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

print('Upgrade e3-6-3 completed! File size:', len(html.encode('utf-8')), 'bytes')
