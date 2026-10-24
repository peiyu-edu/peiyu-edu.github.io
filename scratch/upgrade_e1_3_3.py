# coding: utf-8
import os
import re

file_path = "highSchool/site/lessons/e1-3-3.html"

# Reset file first from git to get clean base
os.system(f"git checkout {file_path}")

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Verify existing predict cards
assert 'data-id="try-def"' in html
assert 'data-id="try-1"' in html
assert 'data-id="try-focal"' in html

# Step 2 replacement
step2_old_match = re.search(r'<section class="step" data-title="讲清楚">.*?</section>', html, re.DOTALL)
assert step2_old_match is not None, "Step 2 not found"

step2_new = '''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：两点间距离公式、点到直线的距离（<a href="e1-2-3.html">回看 2.3</a>）。下面几个词都拿同一组例子说：定点 \(F(1,0)\)，定直线 \(l:\ x=-1\)。</p>

  <div class="card">
    <p><b>焦点 \(F\)、准线 \(l\)</b>：抛物线定义里的那个定点叫焦点，那条定直线叫准线。焦点不在准线上。</p>
    <p>例：\(F(1,0)\) 不在 \(x=-1\) 上，可以做焦点和准线。</p>
  </div>

  <div class="card">
    <p><b>点到准线的距离</b>：从点向准线作垂线，垂线段的长。准线是竖直线 \(x=a\) 时，就是横坐标之差的绝对值 \(|x_0-a|\)。</p>
    <p>例：点 \((4,4)\) 到 \(x=-1\) 的距离是 \(|4-(-1)|=5\)。</p>
  </div>

  <div class="card">
    <p><b>焦准距 \(p\) 与焦半径 \(|PF|\)</b>：焦点到准线的距离为 \(p\)（\(p&gt;0\)）；顶点在正中间，离焦点、准线各 \(\dfrac{p}{2}\)。抛物线上一点 \(P\) 到焦点的距离叫焦半径，根据定义恒等于它到准线的距离。</p>
    <p>例：\(F(1,0)\) 到 \(x=-1\) 的距离 \(p=2\)，点 \(P(4,4)\) 到准线距离 \(5\)，则焦半径 \(|PF|=5\)。</p>
  </div>

  <!-- 组件一：伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <div style="font-weight:700;font-size:15px;color:var(--text,#1e293b);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#0284c7"></span>抛物线核心几何特征与焦半径拉直
      </div>
      <div style="display:flex;gap:6px" id="m-parab-tabs">
        <button class="btn btn-sm" onclick="setMParabTab(0)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid #0284c7;background:#0284c7;color:#fff;cursor:pointer">① 定义与等距</button>
        <button class="btn btn-sm" onclick="setMParabTab(1)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">② 四种标准方程</button>
        <button class="btn btn-sm" onclick="setMParabTab(2)" style="padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#475569);cursor:pointer">③ 折线拉直最值</button>
      </div>
    </div>
    <div style="position:relative;width:100%;height:220px;background:var(--bg-subtle,#f8fafc);border-radius:8px;overflow:hidden">
      <svg id="m-parab-fig" viewBox="0 0 540 220" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div id="m-parab-desc" style="font-size:13px;color:var(--text-subtle,#64748b);margin-top:10px;line-height:1.6"></div>
  </div>

  <!-- 组件二：概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin:16px 0">
    <div class="concept-card" style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#0284c7;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">定义临界</span>
        <b style="color:#0369a1;font-size:14px">定点与定直线关系</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>\(F \notin l\)（正统抛物线）</b>：到焦点距离等于到准线距离，离心率 \(e=1\)。</li>
        <li><b>\(F \in l\)（临界退化）</b>：轨迹退化为过 \(F\) 垂直于 \(l\) 的<b>一条直线</b>。</li>
        <li><b>顶点位置</b>：恒在焦点与准线的正中点，到焦点与到准线距离均为 \(\dfrac{p}{2}\)。</li>
      </ul>
    </div>
    <div class="concept-card" style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span class="badge-pill" style="background:#16a34a;color:#fff;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600">方程定位</span>
        <b style="color:#15803d;font-size:14px">一次项定轴与除以4定点</b>
      </div>
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#0f172a;line-height:1.7">
        <li><b>一次项定轴</b>：一次项是 \(x\) 则轴为 \(x\) 轴；一次项是 \(y\) 则轴为 \(y\) 轴。</li>
        <li><b>符号定开口</b>：正数开口向正半轴；负数开口向负半轴。</li>
        <li><b>系数除以4定焦点</b>：一次项系数为 \(2p\)，焦点坐标非零项等于系数除以 4。</li>
      </ul>
    </div>
  </div>

  <!-- 组件三：色彩语义主公式 -->
  <h3>2. 定义与色彩语义主公式</h3>
  <p>平面内，到定点 \(F\) 和到定直线 \(l\)（\(F\) 不在 \(l\) 上）距离相等的点的轨迹叫<b>抛物线</b>。</p>
  <div class="key" style="text-align:center;padding:12px;background:#f8fafc;border-left:4px solid #0284c7;border-radius:6px;margin:12px 0">
    <div>\(P\) 在抛物线上 \(\iff |PF| = d(P, l)\)（焦半径等于准线距）</div>
    <div style="margin-top:6px;font-size:15px">
      \(y^2 = \color{#0284c7}{2p}x \iff F\left(\color{#0284c7}{\frac{p}{2}}, 0\right),\quad l:\ x = -\color{#0284c7}{\frac{p}{2}}\quad (|PF| = x_0 + \color{#0284c7}{\frac{p}{2}})\)
    </div>
    <div style="margin-top:4px;font-size:15px">
      \(x^2 = \color{#16a34a}{2p}y \iff F\left(0, \color{#16a34a}{\frac{p}{2}}\right),\quad l:\ y = -\color{#16a34a}{\frac{p}{2}}\quad (|PF| = y_0 + \color{#16a34a}{\frac{p}{2}})\)
    </div>
  </div>

  <div class="card">
    <p class="small">例 1（看一遍怎么写）</p>
    <p>到点 \(F(0,2)\) 和到直线 \(y=-2\) 距离相等的点，轨迹方程是什么？</p>
    <p>设 \(P(x,y)\)。到 \(F\) 距离 \(\sqrt{x^2+(y-2)^2}\)；到直线 \(y=-2\) 距离 \(|y+2|\)。令两式相等并平方：</p>
    <p style="text-align:center">\(x^2+y^2-4y+4=y^2+4y+4 \implies x^2=8y\)。焦点在上方，开口向上。</p>
  </div>
  <div class="card predict" data-id="try-def" data-answer="A">
    <p>自己试试：到点 \(F(0,1)\) 和到直线 \(y=-1\) 距离相等的点，轨迹方程是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(x^2=4y\)</button>
      <button class="opt" data-v="B"><b>B</b>\(x^2=2y\)</button>
      <button class="opt" data-v="C"><b>C</b>\(y^2=4x\)</button>
      <button class="opt" data-v="D"><b>D</b>\(x^2=-4y\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\sqrt{x^2+(y-1)^2}=|y+1|\)，平方得 \(x^2-2y+1=2y+1\)，即 \(x^2=4y\)。选 B 是把焦点到原点距离当成了 \(p\)；选 C 是轴搞反了；选 D 是开口方向反了。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <!-- 组件四：三步破题思维链例题 -->
  <h3>3. 四种标准方程与三步破题链</h3>
  <div class="think-steps" style="border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:16px;background:var(--card,#fff);margin:14px 0">
    <div style="font-weight:700;color:#0369a1;margin-bottom:10px;font-size:14px">🧩 典型例题：求抛物线焦点准线与标准方程</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#e0f2fe;color:#0284c7;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">👀 信号</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          观察方程中<b>一次项是谁</b>（决定对称轴）以及<b>系数正负</b>（决定开口朝向）；已知焦点反推标准方程。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#fef3c7;color:#d97706;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🔧 步骤</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          1. <b>化二次项为 1</b>：确保标准形式；<br>
          2. <b>除以 4 得焦点</b>：一次项系数绝对值是 \(2p\)，焦点坐标为系数除以 4；<br>
          3. <b>准线与焦点反号</b>：如焦点为 \((0, \frac{p}{2})\) 则准线为 \(y = -\frac{p}{2}\)。
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start">
        <span style="background:#dcfce7;color:#16a34a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap">🛡️ 防坑</span>
        <div style="font-size:13px;color:var(--text,#1e293b);line-height:1.6">
          焦点坐标是系数除以 4，切忌误除以 2；平方项系数不为 1 时必须先移项化简。
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（正反双向练习）</p>
    <p>（1）求 \(y^2 = 12x\) 的焦点和准线。</p>
    <p>一次项是 \(x\)，系数 \(12&gt;0\)，开口向右。\(2p=12 \implies \dfrac{p}{2}=3\)。故焦点 \(F(3,0)\)，准线 \(x=-3\)。</p>
    <p>（2）焦点是 \((0,-3)\)，求抛物线的标准方程。</p>
    <p>焦点在 \(y\) 轴负半轴，开口向下，设 \(x^2=-2py\)。由 \(\dfrac{p}{2}=3\) 得 \(2p=12\)，方程为 \(x^2=-12y\)。</p>
  </div>
  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：抛物线 \(x^2 = -8y\) 的焦点坐标是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b> \((-2, 0)\)</button>
      <button class="opt" data-v="B"><b>B</b> \((0, -2)\)</button>
      <button class="opt" data-v="C"><b>C</b> \((0, -4)\)</button>
      <button class="opt" data-v="D"><b>D</b> \((0, -8)\)</button>
    </div>
    <div class="reveal">
      <p><b>B</b>。一次项是 \(y\)，对称轴是 \(y\) 轴；系数 \(-8&lt;0\)，开口向下。\(2p=8 \implies \dfrac p2=2\)，焦点 \((0,-2)\)。</p>
      <p>选 A 是轴搞错了；选 C 是只除了 \(2\)；选 D 是直接抄了一次项系数。</p>
    </div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <h3>4. 焦半径转化与折线拉直</h3>
  <p>抛物线上的点，到焦点的距离要开根号算，到准线的距离只需做减法。<b>把到焦点的距离换成到准线的距离</b>，常常能把复杂的折线求最值变成垂线段最短。</p>

  <div class="card">
    <p class="small">例 3（折线拉直经典题）</p>
    <p>点 \(A(3,2)\)，抛物线 \(y^2=4x\)，焦点是 \(F(1,0)\)，准线 \(l:\ x=-1\)。抛物线上一点 \(P\)，求 \(|PA|+|PF|\) 的最小值。</p>
    <p>依定义，\(|PF|\) 等于 \(P\) 到准线的距离 \(|PH|\)，故 \(|PA| + |PF| = |PA| + |PH|\)。</p>
    <p>先看 \(A\) 在哪：\(y_A^2=4 &lt; 4\times 3=12\)，\(A\) 在抛物线内部。从 \(A\) 经 \(P\) 走到准线的折线长，不小于 \(A\) 到准线的垂直距离：\(3 - (-1) = 4\)。取等条件为 \(A, P, H\) 三点共线，此时 \(P(1,2)\)，故最小值为 \(4\)。</p>
  </div>
  <div class="card predict" data-id="try-focal" data-answer="A">
    <p>自己试试：抛物线 \(y^2 = 6x\) 上一点 \(P\) 到焦点的距离是 \(5\)，\(P\) 的横坐标是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac72\)</button>
      <button class="opt" data-v="B"><b>B</b>\(2\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac{13}2\)</button>
      <button class="opt" data-v="D"><b>D</b>\(5\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(2p=6 \implies p=3\)，准线 \(x=-\dfrac32\)。焦半径 \(|PF|=x_0+\dfrac32=5 \implies x_0=\dfrac72\)。选 B 是减了 \(p=3\)；选 C 是加反了；选 D 是把距离直接当横坐标。</p></div>
  </div>

  <!-- 组件五：三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0">
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区一：系数除以2当焦点</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(y^2 = 12x\) 误得焦点 \((6, 0)\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：一次项系数为 \(2p\)，焦点坐标为一次项系数<b>除以 4</b>！焦点为 \((3,0)\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区二：平方项系数非 1 未化简</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：\(y = \dfrac{1}{4}x^2\) 直接将 \(\dfrac{1}{4}\) 除以 4 得 \(\dfrac{1}{16}\)</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：标准方程二次项系数必为 1！必须先化为 \(x^2 = 4y\)，再定焦点 \((0, 1)\)。
      </div>
    </div>
    <div class="trap-card" style="border:1px solid #fecaca;background:#fff5f5;border-radius:10px;padding:14px">
      <div style="font-weight:700;color:#dc2626;font-size:14px;margin-bottom:6px">⚠️ 误区三：折线拉直忽略点A在外部</div>
      <div style="font-size:12px;color:#991b1b;margin-bottom:4px">❌ 错误：求 \(|PA|+|PF|\) 最小值一律直接做准线垂线</div>
      <div style="font-size:12px;color:#166534;background:#dcfce7;padding:6px;border-radius:6px">
        ✅ 正确：若 \(A\) 在抛物线外部，垂线段交不到抛物线；此时由 \(|PA|+|PF| \ge |AF|\)，最小值为 \(|AF|\)！
      </div>
    </div>
  </div>

  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:12px 0">
    <div style="font-weight:700;font-size:13px;color:var(--text,#1e293b);margin-bottom:8px">🔍 反例微图解：点 A 在内部 vs 外部的破题分流</div>
    <div style="width:100%;height:150px;background:var(--bg-subtle,#f8fafc);border-radius:6px;overflow:hidden">
      <svg id="m-parab-trap-fig" viewBox="0 0 540 150" style="width:100%;height:100%;display:block"></svg>
    </div>
    <div style="font-size:12px;color:var(--text-subtle,#64748b);margin-top:6px">
      点 \(A\) 在内部时，折线 \(A \to P \to H\) 可拉直为垂直准线的线段（最小值 \(x_A + \frac{p}{2}\)）；点 \(A\) 在外部时，直线 \(AF\) 与抛物线相交取到最小值 \(|AF|\)。
    </div>
  </div>

  <div class="key">一句话：抛物线上点到焦点的距离，等于到准线的距离。定方程看开口和 \(p\)，算距离换成到准线。</div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>离心率</b>：抛物线到焦点距离与到准线距离相等，故 \(e=1\)。</p>
    <p><b>通径</b>：过焦点且垂直于对称轴的弦，长为 \(2p\)。\(p\) 越大，开口越宽。</p>
    <p><b>光学性质（阅读）</b>：平行于对称轴射来的光，在抛物线上反射后都经过焦点；反之焦点光源反射后成平行光（探照灯原理）。</p>
  </details>
</section>'''

# Replace Step 2
html_new = html[:step2_old_match.start()] + step2_new + html[step2_old_match.end():]

# Compact JS logic
js_code = '''
/* --- 伴读微图解 JS: 抛物线 --- */
(function(){
  var curTab = 0;
  function el(t, a, txt) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", t);
    for (var k in a) e.setAttribute(k, a[k]);
    if (txt) e.textContent = txt;
    return e;
  }
  function drawTab0(svg) {
    var ox = 220, oy = 110, p = 60, dx = ox - p/2, fx = ox + p/2;
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: 470, y: oy - 6, fill: "#94a3b8", "font-size": 12}, "x"));
    svg.appendChild(el("text", {x: ox + 8, y: 30, fill: "#94a3b8", "font-size": 12}, "y"));
    svg.appendChild(el("line", {x1: dx, y1: 20, x2: dx, y2: 200, stroke: "#dc2626", "stroke-width": 2, "stroke-dasharray": "5,3"}));
    svg.appendChild(el("text", {x: dx - 48, y: 35, fill: "#dc2626", "font-size": 12, "font-weight": "bold"}, "l: x=-p/2"));
    svg.appendChild(el("circle", {cx: fx, cy: oy, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: fx + 6, y: oy + 16, fill: "#0284c7", "font-size": 12, "font-weight": "bold"}, "F(p/2,0)"));
    var d = "M " + (ox + 80*80/120) + " " + (oy - 80);
    for (var y = -80; y <= 80; y += 4) d += " L " + (ox + (y*y)/120) + " " + (oy + y);
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#0284c7", "stroke-width": 2.5}));
    var px = ox + 30, py = oy - 60;
    svg.appendChild(el("circle", {cx: px, cy: py, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: px + 8, y: py - 4, fill: "#16a34a", "font-size": 12, "font-weight": "bold"}, "P(x₀,y₀)"));
    svg.appendChild(el("circle", {cx: dx, cy: py, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: dx - 20, y: py - 4, fill: "#dc2626", "font-size": 11}, "H"));
    svg.appendChild(el("line", {x1: px, y1: py, x2: dx, y2: py, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("line", {x1: px, y1: py, x2: fx, y2: oy, stroke: "#0284c7", "stroke-width": 2, "stroke-dasharray": "4,3"}));
    svg.appendChild(el("path", {d: "M " + (dx + 8) + " " + py + " L " + (dx + 8) + " " + (py + 8) + " L " + dx + " " + (py + 8), fill: "none", stroke: "#dc2626", "stroke-width": 1.5}));
    svg.appendChild(el("text", {x: (px + dx)/2 - 16, y: py - 8, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "|PH|=d"));
    svg.appendChild(el("text", {x: (px + fx)/2 + 8, y: (py + oy)/2, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "|PF|=d"));
  }

  function drawTab1(svg) {
    var cols = [
      {t: "y²=2px", ox: 80, o: "r", eq: "F(p/2,0), x=-p/2"},
      {t: "y²=-2px", ox: 200, o: "l", eq: "F(-p/2,0), x=p/2"},
      {t: "x²=2py", ox: 325, o: "u", eq: "F(0,p/2), y=-p/2"},
      {t: "x²=-2py", ox: 450, o: "d", eq: "F(0,-p/2), y=p/2"}
    ];
    cols.forEach(function(c){
      svg.appendChild(el("text", {x: c.ox, y: 35, "text-anchor": "middle", fill: "#0f172a", "font-size": 12, "font-weight": "bold"}, c.t));
      svg.appendChild(el("line", {x1: c.ox - 45, y1: 110, x2: c.ox + 45, y2: 110, stroke: "#e2e8f0", "stroke-width": 1}));
      svg.appendChild(el("line", {x1: c.ox, y1: 60, x2: c.ox, y2: 160, stroke: "#e2e8f0", "stroke-width": 1}));
      var p = 24, oy = 110;
      if (c.o === "r") {
        svg.appendChild(el("line", {x1: c.ox - p/2, y1: 65, x2: c.ox - p/2, y2: 155, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
        svg.appendChild(el("circle", {cx: c.ox + p/2, cy: oy, r: 3, fill: "#0284c7"}));
        svg.appendChild(el("path", {d: "M " + (c.ox + 35) + " 70 Q " + (c.ox - 5) + " " + oy + " " + (c.ox + 35) + " 150", fill: "none", stroke: "#0284c7", "stroke-width": 2}));
      } else if (c.o === "l") {
        svg.appendChild(el("line", {x1: c.ox + p/2, y1: 65, x2: c.ox + p/2, y2: 155, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
        svg.appendChild(el("circle", {cx: c.ox - p/2, cy: oy, r: 3, fill: "#0284c7"}));
        svg.appendChild(el("path", {d: "M " + (c.ox - 35) + " 70 Q " + (c.ox + 5) + " " + oy + " " + (c.ox - 35) + " 150", fill: "none", stroke: "#0284c7", "stroke-width": 2}));
      } else if (c.o === "u") {
        svg.appendChild(el("line", {x1: c.ox - 45, y1: oy + p/2, x2: c.ox + 45, y2: oy + p/2, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
        svg.appendChild(el("circle", {cx: c.ox, cy: oy - p/2, r: 3, fill: "#16a34a"}));
        svg.appendChild(el("path", {d: "M " + (c.ox - 40) + " 75 Q " + c.ox + " " + (oy + 5) + " " + (c.ox + 40) + " 75", fill: "none", stroke: "#16a34a", "stroke-width": 2}));
      } else {
        svg.appendChild(el("line", {x1: c.ox - 45, y1: oy - p/2, x2: c.ox + 45, y2: oy - p/2, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
        svg.appendChild(el("circle", {cx: c.ox, cy: oy + p/2, r: 3, fill: "#16a34a"}));
        svg.appendChild(el("path", {d: "M " + (c.ox - 40) + " 145 Q " + c.ox + " " + (oy - 5) + " " + (c.ox + 40) + " 145", fill: "none", stroke: "#16a34a", "stroke-width": 2}));
      }
      svg.appendChild(el("text", {x: c.ox, y: 185, "text-anchor": "middle", fill: "#64748b", "font-size": 10}, c.eq));
    });
  }

  function drawTab2(svg) {
    var ox = 200, oy = 110, p = 50, dx = ox - p/2, fx = ox + p/2;
    svg.appendChild(el("line", {x1: 40, y1: oy, x2: 480, y2: oy, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: ox, y1: 20, x2: ox, y2: 200, stroke: "#cbd5e1", "stroke-width": 1.5}));
    svg.appendChild(el("line", {x1: dx, y1: 20, x2: dx, y2: 200, stroke: "#dc2626", "stroke-width": 2, "stroke-dasharray": "5,3"}));
    svg.appendChild(el("circle", {cx: fx, cy: oy, r: 4, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: fx + 6, y: oy + 16, fill: "#0284c7", "font-size": 11, "font-weight": "bold"}, "F(p/2,0)"));
    var d = "M " + (ox + 80*80/100) + " 30";
    for (var y = -80; y <= 80; y += 4) d += " L " + (ox + (y*y)/100) + " " + (oy + y);
    svg.appendChild(el("path", {d: d, fill: "none", stroke: "#0284c7", "stroke-width": 2}));
    var ax = ox + 90, ay = oy - 45, p0x = ox + (45*45)/100;
    svg.appendChild(el("circle", {cx: ax, cy: ay, r: 4, fill: "#d97706"}));
    svg.appendChild(el("text", {x: ax + 6, y: ay - 6, fill: "#d97706", "font-size": 12, "font-weight": "bold"}, "A(内部定点)"));
    svg.appendChild(el("line", {x1: ax, y1: ay, x2: dx, y2: ay, stroke: "#16a34a", "stroke-width": 2.5}));
    svg.appendChild(el("circle", {cx: p0x, cy: ay, r: 4, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: p0x - 8, y: ay + 18, fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "P*(最优点)"));
    svg.appendChild(el("line", {x1: p0x, y1: ay, x2: fx, y2: oy, stroke: "#0284c7", "stroke-width": 1.5, "stroke-dasharray": "3,3"}));
    svg.appendChild(el("rect", {x: 270, y: 155, width: 230, height: 32, rx: 6, fill: "#ecfdf5", stroke: "#10b981", "stroke-width": 1}));
    svg.appendChild(el("text", {x: 385, y: 175, "text-anchor": "middle", fill: "#065f46", "font-size": 12, "font-weight": "bold"}, "min(|PA|+|PF|) = x_A + p/2 (垂线最短)"));
  }

  function renderFig() {
    var svg = document.getElementById("m-parab-fig");
    var desc = document.getElementById("m-parab-desc");
    if (!svg) return;
    svg.innerHTML = "";
    if (curTab === 0) {
      drawTab0(svg);
      if (desc) desc.innerHTML = "<b>① 抛物线定义与等距特征</b>：抛物线上任意点 \(P(x_0, y_0)\) 到焦点 \(F(\\frac{p}{2}, 0)\) 的焦半径 \(|PF|\)，恒等于它到准线 \(l: x=-\\frac{p}{2}\) 的垂线距离 \(|PH| = x_0 + \\frac{p}{2}\)。";
    } else if (curTab === 1) {
      drawTab1(svg);
      if (desc) desc.innerHTML = "<b>② 四种标准方程开口与定位</b>：由一次项定轴、符号定开口。焦点到准线距离恒为 \(p\)，焦点坐标为一次项系数除以 4。";
    } else {
      drawTab2(svg);
      if (desc) desc.innerHTML = "<b>③ 折线拉直与最值定理</b>：求 \(|PA|+|PF|\) 的最小值，将焦半径 \(|PF|\) 换为垂线段 \(|PH|\)，拉直为垂直准线的线段，最小值为 \(x_A + \\frac{p}{2}\)。";
    }
  }

  window.setMParabTab = function(idx) {
    curTab = idx;
    var btns = document.querySelectorAll("#m-parab-tabs button");
    btns.forEach(function(b, i){
      b.style.borderColor = (i === idx) ? "#0284c7" : "var(--border,#cbd5e1)";
      b.style.background = (i === idx) ? "#0284c7" : "transparent";
      b.style.color = (i === idx) ? "#fff" : "var(--text,#475569)";
    });
    renderFig();
  };

  function drawTrapFig() {
    var svg = document.getElementById("m-parab-trap-fig");
    if (!svg) return;
    svg.innerHTML = "";
    svg.appendChild(el("text", {x: 135, y: 22, "text-anchor": "middle", fill: "#0369a1", "font-size": 12, "font-weight": "bold"}, "情况 A: 定点在内部 (向准线垂线)"));
    svg.appendChild(el("line", {x1: 25, y1: 30, x2: 25, y2: 135, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("path", {d: "M 180 40 Q 55 85 180 130", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 85, cy: 85, r: 3, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 85, y: 100, "text-anchor": "middle", fill: "#0284c7", "font-size": 10}, "F"));
    svg.appendChild(el("circle", {cx: 145, cy: 65, r: 3, fill: "#d97706"}));
    svg.appendChild(el("text", {x: 155, y: 68, fill: "#d97706", "font-size": 10}, "A"));
    svg.appendChild(el("line", {x1: 145, y1: 65, x2: 25, y2: 65, stroke: "#16a34a", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 88, cy: 65, r: 3, fill: "#16a34a"}));
    svg.appendChild(el("text", {x: 95, y: 60, fill: "#16a34a", "font-size": 10}, "P*"));
    svg.appendChild(el("text", {x: 135, y: 140, "text-anchor": "middle", fill: "#16a34a", "font-size": 11, "font-weight": "bold"}, "min = x_A + p/2"));

    svg.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 140, stroke: "#e2e8f0", "stroke-width": 1}));

    svg.appendChild(el("text", {x: 405, y: 22, "text-anchor": "middle", fill: "#b91c1c", "font-size": 12, "font-weight": "bold"}, "情况 B: 定点在外部 (|PA|+|PF| >= |AF|)"));
    svg.appendChild(el("line", {x1: 295, y1: 30, x2: 295, y2: 135, stroke: "#dc2626", "stroke-width": 1.5, "stroke-dasharray": "3,2"}));
    svg.appendChild(el("path", {d: "M 450 40 Q 325 85 450 130", fill: "none", stroke: "#0284c7", "stroke-width": 1.5}));
    svg.appendChild(el("circle", {cx: 355, cy: 85, r: 3, fill: "#0284c7"}));
    svg.appendChild(el("text", {x: 355, y: 100, "text-anchor": "middle", fill: "#0284c7", "font-size": 10}, "F"));
    svg.appendChild(el("circle", {cx: 340, cy: 45, r: 3, fill: "#d97706"}));
    svg.appendChild(el("text", {x: 335, y: 40, fill: "#d97706", "font-size": 10}, "A(外部)"));
    svg.appendChild(el("line", {x1: 340, y1: 45, x2: 355, y2: 85, stroke: "#dc2626", "stroke-width": 2}));
    svg.appendChild(el("circle", {cx: 344, cy: 56, r: 3, fill: "#dc2626"}));
    svg.appendChild(el("text", {x: 352, y: 55, fill: "#dc2626", "font-size": 10}, "P*"));
    svg.appendChild(el("text", {x: 405, y: 140, "text-anchor": "middle", fill: "#dc2626", "font-size": 11, "font-weight": "bold"}, "min = |AF| (直线最短)"));
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
