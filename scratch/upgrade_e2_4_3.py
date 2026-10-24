# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-4-3.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-1"' in html
assert 'data-id="try-2"' in html
assert 'data-id="try-3"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：数列、通项、\(S_n\) 的记号（<a href="e2-4-1.html">回看 4.1</a>）；等差数列的研究思路，这里把「加 \(d\)」换成「乘 \(q\)」（<a href="e2-4-2.html">回看 4.2</a>）；整数指数幂的运算（<a href="b1-4-1.html">回看 4.1 指数</a>）和指数函数（<a href="b1-4-2.html">回看 4.2 指数函数</a>）。</p>

  <div class="card">
    <p><b>公比 \(q\)</b>：等比数列里，后一项除以前一项得到的那个不变的常数，记作 \(q\)（\(q\ne0\)）。</p>
    <p>例：\(3,6,12,24\) 的公比是 \(2\)；\(8,4,2,1\) 的公比是 \(\dfrac12\)；\(1,-2,4,-8\) 的公比是 \(-2\)。</p>
  </div>

  <div class="card">
    <p><b>正负交替与摆动</b>：公比是负数时，每乘一次负数符号就翻转一次，数列忽正忽负、上下摆动。</p>
    <p>例：\(1,-2,4,-8,16\)：正、负、正、负、正，数列在横轴两侧摆动，不能直接谈单调递增或递减。</p>
  </div>

  <div class="card">
    <p><b>前 \(n\) 项和 \(S_n\)</b>：把第 \(1\) 项到第 \(n\) 项加起来，\(S_n=a_1+a_2+\dots+a_n\)。</p>
    <p>例：数列 \(1,2,4,8,\dots\) 里，\(S_3=1+2+4=7\)，\(S_4=7+8=15\)。注意 \(S_4\) 是四个数的总和，不是第 \(4\) 项。</p>
  </div>

  <div class="card">
    <p><b>一次投入和逐期投入</b>：一次投入是期初一次性存入；逐期投入是每期（如每年）固定存一笔。</p>
    <p>例：年利率 \(5\%\) 复利。年初一次存 \(2000\) 元，两年后是 \(2000\times1.05^2=2205\) 元；每年年末存 \(1000\) 元存两次，第二年末是 \(1000\times1.05+1000=2050\) 元。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>等比核心直觉：指数暴涨与摆动、错位相减对消、公比分流
      </div>
      <div style="display:flex;gap:6px" id="m-gp-tabs">
        <button class="btn btn-sm" onclick="setMGpTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 暴涨与摆动</button>
        <button class="btn btn-sm" onclick="setMGpTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 错位相减</button>
        <button class="btn btn-sm" onclick="setMGpTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ q=1 分流</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-gp-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-gp-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">中项辨析</span>
        <b style="color:#0369a1;font-size:14px">等比中项的双解与符号</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>同号两数等比中项</b>：\(G^2=ab \implies G=\pm\sqrt{ab}\)，通常有<b>正负两个</b>（如 \(1\) 与 \(9\) 的中项是 \(\pm3\)）。</li>
        <li><b>具体数列限制</b>：若在同号数列中（隔两步 \(a_3=a_1q^2\)），符号必与首项一致，负值需舍去。</li>
        <li><b>异号两数无中项</b>：若 \(ab&lt;0\)，实数范围内不存在等比中项。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">机制对偶</span>
        <b style="color:#15803d;font-size:14px">等差 vs 等比 对偶法则</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>步进法则</b>：等差「每步加 \(d\)」\(\longleftrightarrow\) 等比「每步乘 \(q\)」。</li>
        <li><b>下标对称</b>：等差「下标和等则项和等」\(\longleftrightarrow\) 等比「下标和等则项积等」（\(a_ma_n=a_pa_q\)）。</li>
        <li><b>求和机制</b>：等差倒序相加对称配对 \(\longleftrightarrow\) 等比错位相减抵消中段。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 定义与色彩语义主公式</h3>
  <p>一个数列从第 \(2\) 项起，每一项与前一项的<b>比</b>都等于同一个常数 \(q\)，它就是等比数列：\(\dfrac{a_{n+1}}{a_n}=q\)。各项均非零（\(a_1\ne0, q\ne0\)）。</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">定义式：\(\dfrac{a_{n+1}}{a_n} = \color{#0284c7}{q}\quad (a_1\ne0, q\ne0)\)</div>
    <div style="margin-top:6px;font-size:15px">
      通项公式：\(a_n = a_1 \color{#0284c7}{q}^{n-1} = a_m \color{#0284c7}{q}^{n-m}\)（乘 \(n-1\) 次公比）
    </div>
    <div style="margin-top:6px;font-size:15px">
      前 \(n\) 项和（公比分流）：\(S_n = \begin{cases} \color{#0284c7}{\dfrac{a_1(1-q^n)}{1-q}} = \dfrac{a_1 - a_n q}{1-q}, & q \ne 1 \\ \color{#16a34a}{n a_1}, & q = 1 \end{cases}\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>等比数列 \(\{a_n\}\) 中，\(a_2=6\)，\(a_5=48\)。求 \(q\)、\(a_1\) 和通项。</p>
    <p>从 \(a_2\) 到 \(a_5\) 乘了 \(3\) 次 \(q\)：\(a_5=a_2q^3\)，所以 \(q^3=\dfrac{48}{6}=8 \implies q=2\)。</p>
    <p>\(a_1=\dfrac{a_2}{q}=\dfrac62=3\)，通项 \(a_n=3\times2^{n-1}\)。验算：\(a_5=3\times2^4=48\)，完全相符。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：等比数列首项 \(a_1=2\)，公比 \(q=3\)，\(a_4\) 是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(54\)</button>
      <button class="opt" data-v="B"><b>B</b>\(162\)</button>
      <button class="opt" data-v="C"><b>C</b>\(18\)</button>
      <button class="opt" data-v="D"><b>D</b>\(11\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(a_4=2\times3^{3}=54\)：\(2,6,18,54\)。选 B 的同学用了 \(q^4\)，多乘了一次；指数是 \(n-1\)。选 D 是按等差 \(2+3\times3\) 算了。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 等比中项与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：含参数公比等比数列的前 n 项和讨论</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          题目给出首项 \(a_1\) 且公比含有未知字母 \(q\)，要求前 \(n\) 项和 \(S_n\) 的表达式。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>判定公比分界</b>：检查公比是否可能为 1；<br>
          2. <b>分支书写求和</b>：<br>
             - 若 \(q=1\)，数列为常数列，\(S_n = na_1\)；<br>
             - 若 \(q\ne1\)，套用错位相减公式 \(S_n = \dfrac{a_1(1-q^n)}{1-q}\)；<br>
          3. <b>核对指数项数</b>：分子中的指数 \(n\) 严格代表项数，切勿因末项指数误减 1。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          公比为字母时漏掉 \(q=1\) 分类会导致分母为 0 严重失分；数项数从 \(q^0\) 到 \(q^{n-1}\) 共 \(n\) 项。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（等比中项求值）</p>
    <p>等比数列 \(\{a_n\}\) 中，\(a_1=1\)，\(a_5=16\)，求 \(a_3\)。</p>
    <p>\(a_3\) 是 \(a_1\) 与 \(a_5\) 的等比中项：\(a_3^2=a_1a_5=16 \implies a_3=\pm4\)。</p>
    <p>再由 \(a_3=a_1q^2=q^2&gt;0\) 可知，隔两步必同号，所以 \(a_3=4\)，负解 \(-4\) 需舍去。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：\(1\) 和 \(9\) 的等比中项是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(3\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\pm3\)</button>
      <button class="opt" data-v="C"><b>C</b>\(5\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-3\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(G^2=1\times9=9 \implies G=\pm3\)：公比为 \(3\) 或 \(-3\) 均可。选 A 漏了负中项；选 C 是等差中项。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 前 \(n\) 项和：乘 \(q\) 错位相减法</h3>
  <p>将 \(S_n\) 整体乘以 \(q\) 后错开一位相减，中间各项完全对消，直接得出求和公式：</p>
  <div class="card">
    \[\small\begin{aligned} S_n&=a_1+a_1q+\dots+a_1q^{n-1}\\ qS_n&=\phantom{a_1+{}}a_1q+\dots+a_1q^{n-1}+a_1q^n \end{aligned}\]
    <p>上式减下式得：\((1-q)S_n = a_1 - a_1q^n \implies S_n = \dfrac{a_1(1-q^n)}{1-q}\quad (q\ne1)\)。</p>
  </div>

  <div class="card">
    <p class="small">例 3</p>
    <p>求 \(1+2+4+\dots+2^9\) 的和。</p>
    <p>首项 \(a_1=1\)，公比 \(q=2\)。项数：指数从 \(0\) 到 \(9\)，共 \(10\) 项。代入公式：</p>
    <p style="text-align:center">\(S_{10}=\dfrac{1\times(1-2^{10})}{1-2}=\dfrac{1-1024}{-1}=1023\)。</p>
  </div>
  <div class="card predict" data-id="try-3" data-answer="A">
    <p>自己试试：\(3+6+12+24+48=\)？（用公式算，再加一遍核对）</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(93\)</button>
      <button class="opt" data-v="B"><b>B</b>\(189\)</button>
      <button class="opt" data-v="C"><b>C</b>\(96\)</button>
      <button class="opt" data-v="D"><b>D</b>\(45\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(a_1=3, q=2, n=5\)：\(S_5=\dfrac{3(1-2^5)}{1-2}=3\times31=93\)。选 B 的同学项数数成了 \(6\)；选 C 算的是下一项 \(96\)。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：求和遗漏 q=1 分类</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：公比为字母时直接除以 \(1-q\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：当 \(q=1\) 时分母为 0！必须分流：\(q=1 \implies S_n=na_1\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：等比中项漏掉负根</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：问 \(1\) 与 \(9\) 的等比中项只答 \(3\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：\(G^2=ab \implies G=\pm\sqrt{ab}\)，双解 \(\pm3\) 均满足定义！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：项数指数混淆（数漏首项）</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(2^0+2^1+\dots+2^9\) 误代入 \(n=9\) 项</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：从 \(0\) 次幂到 \(9\) 次幂共有 \(9-0+1=10\) 项，公式指数为 \(10\)！
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：中项双解交错 vs 指数项数偏差</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-gp-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：中项 \(G=\pm3\) 对应公比 \(q=3\)（全正）与 \(q=-3\)（摆动）；右图：末项 \(2^9\) 实为第 \(10\) 项（包含 \(2^0=1\)）。
    </div>
  </div>

  <div class="key">先确认是等比数列（\(q\ne0\)、各项非零），求和先看 \(q\) 是不是 \(1\)，实际问题先画时间线数每笔钱存了几期。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>与指数函数的关系</b>：当 \(q&gt;0\) 时，点 \((n, a_n)\) 位于曲线 \(y=\frac{a_1}{q}\cdot q^x\) 上。当 \(q&lt;0\) 时正负震荡，无实数连续函数对照。</p>
    <p><b>下标和与乘积性质</b>：若 \(m+n=p+k\)，则 \(a_m a_n = a_p a_k\)。</p>
    <p><b>项数计数技巧</b>：从 \(a_1 q^k\) 到 \(a_1 q^m\)，总项数为 \(m-k+1\) 项。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 等比数列 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 暴涨 vs 摆动 (q=2 vs q=-1)
    var ox = 50, oy = 110;
    svg.appendChild(el("line", {x1: 30, y1: oy, x2: 500, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 490, y: oy - 6, fill: "#94a3b8", "font-size": 12}, "n"));
    svg.appendChild(el("text", {x: ox + 8, y: 30, fill: "#94a3b8", "font-size": 12}, "a_n"));

    // q=2 positive explosion
    var pts1 = [
      {n: 1, v: 1, y: oy - 12},
      {n: 2, v: 2, y: oy - 24},
      {n: 3, v: 4, y: oy - 48},
      {n: 4, v: 8, y: oy - 85}
    ];
    pts1.forEach(function(p){
      var x = ox + p.n * 55;
      svg.appendChild(el("circle", {cx: x, cy: p.y, r: 4, fill: "#0284c7"}));
      svg.appendChild(el("text", {x: x - 6, y: p.y - 8, fill: "#0284c7", "font-size": 10, "font-weight": "bold"}, "2^" + (p.n-1)));
    });
    // curve line
    svg.appendChild(el("path", {d: "M " + (ox+55) + " " + (oy-12) + " Q " + (ox+165) + " " + (oy-25) + " " + (ox+220) + " " + (oy-85), fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: ox + 180, y: oy - 92, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "q=2 指数爆炸"));

    // q=-1.5 oscillation
    var pts2 = [
      {n: 1, v: 2, y: oy - 20},
      {n: 2, v: -3, y: oy + 30},
      {n: 3, v: 4.5, y: oy - 45},
      {n: 4, v: -6.7, y: oy + 65}
    ];
    var d2 = "M " + (ox + 290) + " " + pts2[0].y;
    pts2.forEach(function(p, i){
      var x = ox + 290 + i * 50;
      svg.appendChild(el("circle", {cx: x, cy: p.y, r: 4, fill: p.y < oy ? "#16a34a" : "#dc2626"}));
      svg.appendChild(el("line", {x1: x, y1: oy, x2: x, y2: p.y, stroke: "#cbd5e1", "stroke-width": 1, "stroke-dasharray": "2,2"}));
      if (i > 0) d2 += " L " + x + " " + p.y;
    });
    svg.appendChild(el("path", {d: d2, fill: "none", stroke: "#eab308", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("text", {x: ox + 360, y: oy + 85, "text-anchor": "middle", fill: "#ca8a04", "font-size": 11, "font-weight": "bold"}, "q < 0 上下交错摆动"));
  }

  function drawTab1(svg) {
    // Tab 1: 错位相减
    var cy1 = 60, cy2 = 115;
    // Row 1: S_n
    svg.appendChild(el("text", {x: 45, y: cy1 + 18, fill: "#0284c7", "font-size": 13, "font-weight": "bold"}, "S_n ="));
    svg.appendChild(el("rect", {x: 85, y: cy1, width: 45, height: 28, rx: 4, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 107, y: cy1 + 18, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "a₁"));
    svg.appendChild(el("text", {x: 140, y: cy1 + 18, fill: "#94a3b8", "font-size": 12}, "+"));
    svg.appendChild(el("rect", {x: 155, y: cy1, width: 220, height: 28, rx: 4, fill: "#f1f5f9", stroke: "#cbd5e1", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 265, y: cy1 + 18, "text-anchor": "middle", fill: "#64748b", "font-size": 11}, "a₁q + a₁q² + … + a₁q^{n-1}"));

    // Row 2: q S_n
    svg.appendChild(el("text", {x: 35, y: cy2 + 18, fill: "#ca8a04", "font-size": 13, "font-weight": "bold"}, "q S_n ="));
    svg.appendChild(el("rect", {x: 155, y: cy2, width: 220, height: 28, rx: 4, fill: "#fef9c3", stroke: "#facc15", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 265, y: cy2 + 18, "text-anchor": "middle", fill: "#854d0e", "font-size": 11}, "a₁q + a₁q² + … + a₁q^{n-1}"));
    svg.appendChild(el("text", {x: 385, y: cy2 + 18, fill: "#94a3b8", "font-size": 12}, "+"));
    svg.appendChild(el("rect", {x: 400, y: cy2, width: 65, height: 28, rx: 4, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 432, y: cy2 + 18, "text-anchor": "middle", fill: "#b91c1c", "font-size": 11, "font-weight": "bold"}, "a₁q^n"));

    // Middle cancel bracket
    svg.appendChild(el("line", {x1: 265, y1: cy1 + 30, x2: 265, y2: cy2 - 2, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "2,2"}));
    svg.appendChild(el("text", {x: 265, y: (cy1 + cy2)/2 + 12, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "一减完全对消！"));

    // Result
    svg.appendChild(el("rect", {x: 90, y: 165, width: 360, height: 35, rx: 6, fill: "#eff6ff", stroke: "#3b82f6", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 270, y: 187, "text-anchor": "middle", fill: "#1d4ed8", "font-size": 13, "font-weight": "bold"}, "(1 - q) S_n = a₁ - a₁q^n -> S_n = a₁(1 - q^n) / (1 - q)"));
  }

  function drawTab2(svg) {
    // Tab 2: q=1 vs q!=1 decision branch
    svg.appendChild(el("rect", {x: 180, y: 25, width: 180, height: 36, rx: 6, fill: "#f8fafc", stroke: "#64748b", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 270, y: 47, "text-anchor": "middle", fill: "#1e293b", "font-size": 13, "font-weight": "bold"}, "求和前先审视公比 q"));

    // Branch left: q != 1
    svg.appendChild(el("line", {x1: 220, y1: 61, x2: 130, y2: 105, stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 160, y: 80, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "q ≠ 1"));
    svg.appendChild(el("rect", {x: 40, y: 105, width: 190, height: 50, rx: 8, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 135, y: 126, "text-anchor": "middle", fill: "#0369a1", "font-size": 11}, "分母非零，套公式："));
    svg.appendChild(el("text", {x: 135, y: 144, "text-anchor": "middle", fill: "#0284c7", "font-size": 13, "font-weight": "bold"}, "S_n = a₁(1-q^n)/(1-q)"));

    // Branch right: q = 1
    svg.appendChild(el("line", {x1: 320, y1: 61, x2: 410, y2: 105, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 375, y: 80, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "q = 1"));
    svg.appendChild(el("rect", {x: 310, y: 105, width: 190, height: 50, rx: 8, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 405, y: 126, "text-anchor": "middle", fill: "#15803d", "font-size": 11}, "退化为常数列 a₁, a₁…："));
    svg.appendChild(el("text", {x: 405, y: 144, "text-anchor": "middle", fill: "#16a34a", "font-size": 13, "font-weight": "bold"}, "S_n = n · a₁"));

    // Warning banner bottom
    svg.appendChild(el("rect", {x: 80, y: 175, width: 380, height: 30, rx: 6, fill: "#fef2f2", stroke: "#f87171", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 194, "text-anchor": "middle", fill: "#991b1b", "font-size": 11, "font-weight": "bold"}, "⚠️ 警示：当公比含有未知字母时，必须分类讨论！"));
  }

  function renderFig() {
    var svg = document.getElementById("m-gp-fig");
    var desc = document.getElementById("m-gp-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 指数爆炸与摆动震荡</b>：q > 1 时数列沿指数轨迹急剧暴涨；而当 q < 0 时符号交替在正负两侧大幅跳跃，无法简单套用递增递减。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 乘 q 错位相减机制</b>：将总和乘 q 后错移一位，首末之间庞大的中间项被整体减尽对消，仅余头项 a₁ 与尾项 a₁q^n。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ q=1 黄金分流法则</b>：q ≠ 1 方可除以 1-q；当 q = 1 时分母为零公式崩溃，必须分流为常数列求和 S_n = na₁。";
    }
  }

  window.setMGpTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-gp-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-gp-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: G = +-3
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：等比中项遗漏负根 G = -3"));
    svg.appendChild(el("rect", {x: 40, y: 45, width: 80, height: 32, rx: 4, fill: "#eff6ff", stroke: "#93c5fd", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 80, y: 65, "text-anchor": "middle", fill: "#1d4ed8", "font-size": 11, "font-weight": "bold"}, "1, 3, 9 (q=3)"));
    svg.appendChild(el("rect", {x: 145, y: 45, width: 90, height: 32, rx: 4, fill: "#fef3c7", stroke: "#fcd34d", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 190, y: 65, "text-anchor": "middle", fill: "#b45309", "font-size": 11, "font-weight": "bold"}, "1, -3, 9 (q=-3)"));
    svg.appendChild(el("text", {x: 135, y: 105, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "G² = 1 × 9 = 9 -> G = ±3"));
    svg.appendChild(el("text", {x: 135, y: 135, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "问两数中项必须兼顾正负两解"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: 2^0 to 2^9 is 10 terms
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：1 + 2 + … + 2^9 误以为 9 项"));
    svg.appendChild(el("text", {x: 300, y: 60, fill: "#64748b", "font-size": 12}, "2^0 + 2^1 + 2^2 + … + 2^9"));
    svg.appendChild(el("line", {x1: 300, y1: 75, x2: 500, y2: 75, stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 400, y: 95, "text-anchor": "middle", fill: "#16a34a", "font-size": 12, "font-weight": "bold"}, "指数从 0 到 9，共 9-0+1 = 10 项！"));
    svg.appendChild(el("text", {x: 405, y: 135, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "公式分子为 1 - 2^{10}，并非 2^9"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ renderFig(); drawTrapFig(); });
  } else {
    renderFig();
    drawTrapFig();
  }
})();
'''

# Find the LAST </script> tag
last_script_idx = html_new.rfind("</script>")
assert last_script_idx != -1, "No </script> tag found"
html_final = html_new[:last_script_idx] + js_code + "\n" + html_new[last_script_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html_final)

print("Upgrade done! New size:", len(html_final.encode("utf-8")), "bytes")
