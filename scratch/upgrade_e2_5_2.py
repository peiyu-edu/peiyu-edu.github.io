# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e2-5-2.html"

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-1"' in html
assert 'data-id="chk1"' in html
assert 'data-id="try-2"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：5.1 导数的概念和几何意义（<a href="e2-5-1.html">回看 5.1</a>）；必修一的幂、指数、对数函数，弧度制和三角函数。</p>

  <div class="card">
    <p><b>导函数</b>：每个 \(x\) 处的导数 \(f'(x)\) 本身又是 \(x\) 的函数，叫导函数，简称导数。求出导函数后，任意点的切线斜率代入即得。</p>
    <p>例：\(f(x)=x^2\)，算得 \(f'(x)=2x\)。于是 \(f'(3)=6, f'(-1)=-2\)，无需每个点重做极限。</p>
  </div>

  <div class="card">
    <p><b>指数形式幂改写</b>：幂函数求导法则只适用于 \(x^\alpha\) 标准形式，运算前需先化简改写。</p>
    <p>例：\(\dfrac1x=x^{-1}\)，\(\sqrt x=x^{\frac12}\)，\(\dfrac{1}{\sqrt x}=x^{-\frac12}\)，\(x^2\sqrt x=x^{\frac52}\)。</p>
  </div>

  <div class="card">
    <p><b>内层与外层</b>：\(y=\sin(3x+1)\) 包含两步：先算 \(u=3x+1\)（内层），再算 \(y=\sin u\)（外层）。本节重点处理内层为一次式 \(ax+b\) 的情形。</p>
    <p>例：\(e^{2x-5}\) 的内层是 \(2x-5\)（\(a=2\)），外层是 \(e^u\)；\(\ln(4-x)\) 的内层是 \(4-x\)（\(a=-1\)），外层是 \(\ln u\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>导数运算法则几何直觉：矩形增量、商的减序与复合链式
      </div>
      <div style="display:flex;gap:6px" id="m-op-tabs">
        <button class="btn btn-sm" onclick="setMOpTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 乘积矩形增量</button>
        <button class="btn btn-sm" onclick="setMOpTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 商法则减序</button>
        <button class="btn btn-sm" onclick="setMOpTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ 复合链式传动</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-op-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-op-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">法则对照</span>
        <b style="color:#0369a1;font-size:14px">积法则 vs 商法则</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>积求导 \([uv]'\)</b>：轮流求导再「相加」，即 \(u'v+uv'\)，两项对称无所谓先后。</li>
        <li><b>商求导 \([\frac uv]'\)</b>：分母平方，分子必须是「减法」：<b>分子导乘分母 先行</b>（\(u'v-uv'\)）。</li>
        <li><b>颠倒惩罚</b>：商法则若颠倒分子减法顺序，导数符号全部反号，单调极值全错。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">链式要领</span>
        <b style="color:#15803d;font-size:14px">外层套公式，内层补系数</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>外层导数 \(f'(u)\)</b>：把内层 \(ax+b\) 视作整体变量，原样套用基本初等函数导数表。</li>
        <li><b>内层补偿 \(\times a\)</b>：链式传递必然产生伸缩倍数，切勿遗漏乘一次项系数 \(a\)。</li>
        <li><b>负号暗坑</b>：如 \(\ln(1-x)\) 内层系数 \(a=-1\)，导数必含负号 \(-\dfrac{1}{1-x}\)。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 基本初等函数与运算法则主公式</h3>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div style="font-size:15px">
      积法则：\([u(x)v(x)]' = \color{#0284c7}{u'(x)}v(x) + u(x)\color{#16a34a}{v'(x)}\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      商法则：\(\left[\dfrac{u(x)}{v(x)}\right]' = \dfrac{\color{#0284c7}{u'(x)}v(x) - u(x)\color{#16a34a}{v'(x)}}{\color{#d97706}{[v(x)]^2}}\quad (v(x)\ne0)\)
    </div>
    <div style="margin-top:6px;font-size:15px">
      一次复合链式：\([f(ax+b)]' = \color{#dc2626}{a} \cdot f'(ax+b)\)
    </div>
  </div>

  <div class="tbl"><table class="rec">
    <tr><th>\(f(x)\)</th><th>\(f'(x)\)</th></tr>
    <tr><td>\(C\)（常数）</td><td>\(0\)</td></tr>
    <tr><td>\(x^\alpha\)</td><td>\(\alpha x^{\alpha-1}\)</td></tr>
    <tr><td>\(\sin x\)</td><td>\(\cos x\)</td></tr>
    <tr><td>\(\cos x\)</td><td>\(-\sin x\)（带负号）</td></tr>
    <tr><td>\(a^x\)</td><td>\(a^x\ln a\)；特别地 \((e^x)'=e^x\)</td></tr>
    <tr><td>\(\log_a x\)</td><td>\(\dfrac{1}{x\ln a}\)；特别地 \((\ln x)'=\dfrac1x\)</td></tr>
  </table></div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>求导：① \(y=\dfrac{1}{x^3}\)；② \(y=x\sqrt x\)；③ \(y=2^x\)；④ \(y=\log_3 x\)；⑤ \(f(x)=\sin x\)，求 \(f'\!\left(\dfrac\pi3\right)\)。</p>
    <p>① 改写 \(y=x^{-3}\)，\(y'=-3x^{-4}=-\dfrac{3}{x^4}\)。</p>
    <p>② 改写 \(y=x^{\frac32}\)，\(y'=\dfrac32x^{\frac12}=\dfrac32\sqrt x\)。</p>
    <p>③ \(y'=2^x\ln2\)（\(\ln2\) 是常数，不能丢）。</p>
    <p>④ \(y'=\dfrac{1}{x\ln3}\)（\(x&gt;0\)）。</p>
    <p>⑤ \(f'(x)=\cos x\)，\(f'\!\left(\dfrac\pi3\right)=\cos\dfrac\pi3=\dfrac12\)。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：\(y=\dfrac{1}{x^2}\) 的导数是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(-\dfrac{2}{x^3}\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac{1}{2x}\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac{2}{x^3}\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-\dfrac{2}{x}\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(y=x^{-2}\)，\(y'=-2x^{-3}=-\dfrac{2}{x^3}\)。选 B 是把分母直接求导；选 C 丢了负号；选 D 是指数没减 1。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 导数运算与三步破题思维链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：求乘积与商式函数的导数（如 \(y = \dfrac{\ln x}{x}\)）</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          认清函数结构：是积式、商式还是复合函数；明确定义域（如对数 \(x&gt;0\)、分母不为 0）。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>设子函数</b>：设分子 \(u(x)=\ln x\)，分母 \(v(x)=x\)；<br>
          2. <b>分别求导</b>：\(u'(x)=\dfrac1x\)，\(v'(x)=1\)；<br>
          3. <b>套公式化简</b>：套商法则 \(\dfrac{u'v-uv'}{v^2} = \dfrac{\frac1x\cdot x - \ln x\cdot 1}{x^2} = \dfrac{1-\ln x}{x^2}\)。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          商法则分子是 \(u'v - uv'\)，万万不可写成 \(uv' - u'v\)；分母必须平方。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（四则运算与切线结合）</p>
    <p>求导：① \(y=x^3-2x+1\)；② \(y=x\ln x\)；③ \(y=\dfrac{e^x}{x}\)；④ 求曲线 \(y=x\ln x\) 在点 \((1,0)\) 处的切线方程。</p>
    <p>① 逐项求导：\(y'=3x^2-2\)。</p>
    <p>② 积的法则：\(y'=(x)'\ln x+x(\ln x)'=1\cdot\ln x+x\cdot\dfrac1x=\ln x+1\)（\(x&gt;0\)）。</p>
    <p>③ 商的法则：\(y'=\dfrac{(e^x)'x-e^x(x)'}{x^2}=\dfrac{e^x\cdot x-e^x\cdot1}{x^2}=\dfrac{(x-1)e^x}{x^2}\)（\(x\ne0\)）。</p>
    <p>④ 切点是 \((1,0)\)，切线斜率 \(k=y'|_{x=1}=\ln1+1=1\)。点斜式：\(y-0=1\cdot(x-1)\)，即 \(y=x-1\)。</p>
  </div>
  <div class="card predict" data-id="chk1" data-answer="D">
    <p>自己试试：求 \(y=\dfrac{x}{\cos x}\) 的导数时，分子应该整理成？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\cos x - x\sin x\)</button>
      <button class="opt" data-v="B"><b>B</b>\(1\)</button>
      <button class="opt" data-v="C"><b>C</b>\(-\cos x - x\sin x\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\cos x + x\sin x\)</button>
    </div>
    <div class="reveal">
      <p><b>D</b>。分子 \(=(x)'\cos x-x(\cos x)'=\cos x-x(-\sin x)=\cos x+x\sin x\)，所以 \(y'=\dfrac{\cos x+x\sin x}{\cos^2x}\)。</p>
      <p>选 A 忘了 \((\cos x)'=-\sin x\) 的负号；选 B 是分子分母分别求导相除；选 C 是减法顺序反了。</p>
    </div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 简单复合函数 \(f(ax+b)\) 的导数</h3>
  <p>内层是一次式 \(ax+b\) 时，先按外层求导（括号里原样不动），再乘内层的系数 \(a\)：</p>
  <div class="key">$$[f(ax+b)]'=a\,f'(ax+b)$$</div>

  <div class="card">
    <p class="small">例 3</p>
    <p>求导：① \(y=e^{3x-1}\)；② \(y=\cos\left(2x+\dfrac\pi3\right)\)；③ \(y=\ln(1-2x)\)；④ \(y=(2x+1)^3\)。</p>
    <p>① \(a=3\)：\(y'=3e^{3x-1}\)。</p>
    <p>② \(a=2\)，外层 \((\cos u)'=-\sin u\)：\(y'=-2\sin\left(2x+\dfrac\pi3\right)\)。</p>
    <p>③ 定义域 \(1-2x&gt;0 \implies x&lt;\dfrac12\)。\(a=-2\)：\(y'=-2\cdot\dfrac{1}{1-2x}=\dfrac{2}{2x-1}\)。</p>
    <p>④ \(a=2\)，外层 \((u^3)'=3u^2\)：\(y'=2\cdot3(2x+1)^2=6(2x+1)^2\)。</p>
  </div>
  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：\(f(x)=e^{-2x}\)，\(f'(0)\) 等于？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(1\)</button>
      <button class="opt" data-v="B"><b>B</b>\(-2\)</button>
      <button class="opt" data-v="C"><b>C</b>\(2\)</button>
      <button class="opt" data-v="D"><b>D</b>\(-2e\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(a=-2\)，\(f'(x)=-2e^{-2x}\)，\(f'(0)=-2e^0=-2\)。选 A 是忘了乘内层系数；选 C 丢了负号；选 D 是把 \(e^0\) 当成了 \(e\)。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：积与商直接相乘除</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\((x\cdot x)' = x'\cdot x' = 1\)；\((\frac{x}{\cos x})' = \frac{1}{-\sin x}\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：积法则必须交叉求导相加：\(u'v+uv'\)；商法则必须套用除法专用公式！
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：复合求导漏乘内层 a</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\((e^{3x})' = e^{3x}\)；\([\ln(1-2x)]' = \dfrac{1}{1-2x}\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：必须补乘内层系数 \(a\)！\((e^{3x})'=3e^{3x}\)，\([\ln(1-2x)]'=\dfrac{-2}{1-2x}\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：商法则减法顺序颠倒</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(\left(\dfrac{\ln x}{x}\right)'\) 算成分子是 \(\ln x - 1\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：分子导数必须先行！\(u'v - uv' = \frac1x\cdot x - \ln x\cdot 1 = 1-\ln x\)。
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：矩形增量两长条 vs 复合伸缩链</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-op-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      左图：乘积求导增量由两条长方形条带 \(u\Delta v + v\Delta u\) 构成；右图：复合函数链式齿轮放大倍数 \(\times a\)。
    </div>
  </div>

  <div class="key">先写定义域 → 认清结构（和差、积、商，还是 \(f(ax+b)\)）→ 查表、套法则 → 化简。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>内层不是一次式的一般链式法则</b>：\(y=f(g(x))\) 的一般导数为 \(y'=f'(g(x))\cdot g'(x)\)。例如 \([\ln(x^2+1)]'=\dfrac{2x}{x^2+1}\)。</p>
    <p><b>商法则的倒数推导</b>：将 \(\frac uv\) 视为 \(u \cdot \frac1v\)，代入积法则即自然推导得出 \(\frac{u'v-uv'}{v^2}\)。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# JS logic
js_code = '''
/* --- 伴读微图解 JS: 导数运算 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    // Tab 0: 乘积求导矩形增量 u*v
    var ox = 140, oy = 150, uw = 160, vh = 90, du = 40, dv = 30;
    // Main rectangle u x v
    svg.appendChild(el("rect", {x: ox, y: oy - vh, width: uw, height: vh, fill: "#e0f2fe", stroke: "#0284c7", "stroke-width": 2}));
    svg.appendChild(el("text", {x: ox + uw/2, y: oy - vh/2 + 5, "text-anchor": "middle", fill: "#0369a1", "font-size": 14, "font-weight": "bold"}, "原面积 u · v"));

    // Vertical strip du x v
    svg.appendChild(el("rect", {x: ox + uw, y: oy - vh, width: du, height: vh, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: ox + uw + du/2, y: oy - vh/2 + 4, "text-anchor": "middle", fill: "#15803d", "font-size": 11, "font-weight": "bold"}, "v·Δu"));

    // Horizontal strip u x dv
    svg.appendChild(el("rect", {x: ox, y: oy - vh - dv, width: uw, height: dv, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: ox + uw/2, y: oy - vh - dv/2 + 4, "text-anchor": "middle", fill: "#b45309", "font-size": 11, "font-weight": "bold"}, "u·Δv"));

    // Corner patch du x dv
    svg.appendChild(el("rect", {x: ox + uw, y: oy - vh - dv, width: du, height: dv, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": 1, "stroke-dasharray": "2,2"}));
    svg.appendChild(el("text", {x: ox + uw + du/2, y: oy - vh - dv/2 + 4, "text-anchor": "middle", fill: "#dc2626", "font-size": 9}, "高阶小"));

    // Bottom formula summary
    svg.appendChild(el("rect", {x: 80, y: 170, width: 380, height: 32, rx: 6, fill: "#f8fafc", stroke: "#cbd5e1", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 191, "text-anchor": "middle", fill: "#0f172a", "font-size": 12, "font-weight": "bold"}, "Δ(uv) = u·Δv + v·Δu + o -> [uv]' = u'v + uv' (两条增量条相加)"));
  }

  function drawTab1(svg) {
    // Tab 1: 商法则分子减法顺序
    var cy = 90;
    // Step box
    svg.appendChild(el("rect", {x: 50, y: cy - 40, width: 440, height: 80, rx: 8, fill: "#f8fafc", stroke: "#64748b", "stroke-width": 1.5}));
    // Numerator
    svg.appendChild(el("text", {x: 90, y: cy - 8, fill: "#0284c7", "font-size": 15, "font-weight": "bold"}, "u'(x) · v(x)"));
    svg.appendChild(el("text", {x: 200, y: cy - 8, fill: "#dc2626", "font-size": 18, "font-weight": "bold"}, "—"));
    svg.appendChild(el("text", {x: 235, y: cy - 8, fill: "#16a34a", "font-size": 15, "font-weight": "bold"}, "u(x) · v'(x)"));

    // Fraction line
    svg.appendChild(el("line", {x1: 75, y1: cy + 4, x2: 375, y2: cy + 4, stroke: "#334155", "stroke-width": 2}));
    // Denominator
    svg.appendChild(el("text", {x: 225, y: cy + 26, "text-anchor": "middle", fill: "#d97706", "font-size": 14, "font-weight": "bold"}, "[v(x)]²"));

    // Order annotations
    svg.appendChild(el("text", {x: 135, y: cy - 25, "text-anchor": "middle", fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "① 分子先求导！"));
    svg.appendChild(el("text", {x: 285, y: cy - 25, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "② 减去分母求导！"));

    // Bottom warning
    svg.appendChild(el("rect", {x: 80, y: 155, width: 380, height: 35, rx: 6, fill: "#fef2f2", stroke: "#f87171", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 177, "text-anchor": "middle", fill: "#991b1b", "font-size": 12, "font-weight": "bold"}, "⚠️ 严禁颠倒减法顺序！颠倒后正负号完全相反！"));
  }

  function drawTab2(svg) {
    // Tab 2: 复合链式传动
    var cy = 100;
    // Box 1: x
    svg.appendChild(el("rect", {x: 40, y: cy - 30, width: 80, height: 60, rx: 8, fill: "#eff6ff", stroke: "#3b82f6", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 80, y: cy - 6, "text-anchor": "middle", fill: "#1d4ed8", "font-size": 12}, "自变量"));
    svg.appendChild(el("text", {x: 80, y: cy + 16, "text-anchor": "middle", fill: "#1d4ed8", "font-size": 16, "font-weight": "bold"}, "x"));

    // Arrow 1 with *a
    svg.appendChild(el("line", {x1: 125, y1: cy, x2: 195, y2: cy, stroke: "#dc2626", "stroke-width": 2.5}));
    svg.appendChild(el("polygon", {points: "195," + cy + " 185," + (cy-5) + " 185," + (cy+5), fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 160, y: cy - 10, "text-anchor": "middle", fill: "#dc2626", "font-size": 13, "font-weight": "bold"}, "× a"));

    // Box 2: u = ax + b
    svg.appendChild(el("rect", {x: 200, y: cy - 30, width: 110, height: 60, rx: 8, fill: "#fef3c7", stroke: "#f59e0b", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 255, y: cy - 6, "text-anchor": "middle", fill: "#b45309", "font-size": 12}, "内层一次式"));
    svg.appendChild(el("text", {x: 255, y: cy + 16, "text-anchor": "middle", fill: "#b45309", "font-size": 15, "font-weight": "bold"}, "u = ax + b"));

    // Arrow 2 with f'(u)
    svg.appendChild(el("line", {x1: 315, y1: cy, x2: 385, y2: cy, stroke: "#16a34a", "stroke-width": 2.5}));
    svg.appendChild(el("polygon", {points: "385," + cy + " 375," + (cy-5) + " 375," + (cy+5), fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 350, y: cy - 10, "text-anchor": "middle", fill: "#15803d", "font-size": 12, "font-weight": "bold"}, "f'(u)"));

    // Box 3: y = f(u)
    svg.appendChild(el("rect", {x: 390, y: cy - 30, width: 110, height: 60, rx: 8, fill: "#dcfce7", stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("text", {x: 445, y: cy - 6, "text-anchor": "middle", fill: "#15803d", "font-size": 12}, "外层函数"));
    svg.appendChild(el("text", {x: 445, y: cy + 16, "text-anchor": "middle", fill: "#15803d", "font-size": 15, "font-weight": "bold"}, "y = f(u)"));

    // Bottom summary
    svg.appendChild(el("rect", {x: 80, y: 165, width: 380, height: 32, rx: 6, fill: "#ecfdf5", stroke: "#10b981", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 270, y: 186, "text-anchor": "middle", fill: "#065f46", "font-size": 12, "font-weight": "bold"}, "链式传导积：[f(ax+b)]' = a · f'(ax+b)"));
  }

  function renderFig() {
    var svg = document.getElementById("m-op-fig");
    var desc = document.getElementById("m-op-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 乘积求导矩形增量</b>：矩形边长 u 和 v 分别微增时，主要新增两条长条带 u·Δv 与 v·Δu，角上小块为高阶无穷小，故导数为 u'v + uv'。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 商法则分子减序</b>：商的导数分子必须是「分子导乘分母」减去「分子乘分母导」，减法顺序绝对不可颠倒。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 复合链式传导机制</b>：x 变化 1 单位引起内层 u 变化 a 倍，外层再响应 f'(u)，总导数必须乘上内层放大倍数 a。";
    }
  }

  window.setMOpTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-op-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-op-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    // Left: (x^2)' = 2x vs 1
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "误区一：积与商当作直接求导相乘"));
    svg.appendChild(el("rect", {x: 35, y: 40, width: 200, height: 40, rx: 4, fill: "#fef2f2", stroke: "#ef4444", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 135, y: 65, "text-anchor": "middle", fill: "#dc2626", "font-size": 12, "font-weight": "bold"}, "(x · x)' 误算为 1 × 1 = 1 ❌"));

    svg.appendChild(el("rect", {x: 35, y: 90, width: 200, height: 40, rx: 4, fill: "#f0fdf4", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 135, y: 115, "text-anchor": "middle", fill: "#15803d", "font-size": 12, "font-weight": "bold"}, "正解：1·x + x·1 = 2x ✅"));

    // Divider
    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    // Right: composite missing a
    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "误区二：复合求导漏乘内层系数 a"));
    svg.appendChild(el("rect", {x: 305, y: 40, width: 200, height: 40, rx: 4, fill: "#fef2f2", stroke: "#ef4444", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 405, y: 65, "text-anchor": "middle", fill: "#dc2626", "font-size": 12, "font-weight": "bold"}, "[ln(1-2x)]' 误算为 1/(1-2x) ❌"));

    svg.appendChild(el("rect", {x: 305, y: 90, width: 200, height: 40, rx: 4, fill: "#f0fdf4", stroke: "#16a34a", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 405, y: 115, "text-anchor": "middle", fill: "#15803d", "font-size": 12, "font-weight": "bold"}, "正解：补乘 (-2) 得 -2/(1-2x) ✅"));
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
