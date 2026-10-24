# upgrade_e3_8_1.py
import re
import os

filepath = 'highSchool/site/lessons/e3-8-1.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：必修二 9.2 样本均值与方差（<a href="b2-9-2.html">回看 9.2</a>）；7.3 协方差与离散度（<a href="e3-7-3.html">回看 7.3</a>）。成对数据研究的是两个变量之间的联动共变趋势。</p>

  <div class="card">
    <p><b>成对数据与散点图</b>：对同一个个体同时观测两个变量得到的数据对 \((x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)\)。在直角坐标系中将这些数据对画成点，得到的图形叫<b>散点图</b>。</p>
    <p>散点图是洞察两变量关系的望远镜：若散点从左下向右上延展，呈<b>正相关</b>（一多俱多）；若从左上向右下延展，呈<b>负相关</b>（此消彼长）；若散点弥散成团，呈<b>零相关</b>。</p>
  </div>

  <div class="card">
    <p><b>样本相关系数 \(r\)（线性紧密度的纯数标尺）</b>：定量度量两个变量之间<b>线性相关程度</b>的无量纲数值：</p>
    <p>$$r = \dfrac{\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^n (x_i - \bar{x})^2} \sqrt{\sum_{i=1}^n (y_i - \bar{y})^2}}$$</p>
    <p>两条铁律：<br>
    ① <b>有界性</b>：\(-1 \le r \le 1\)；<br>
    ② <b>符号管方向，绝对值管强弱</b>：\(r &gt; 0\) 为正相关，\(r &lt; 0\) 为负相关；\(|r|\) 越接近 \(1\)，散点越紧密贴合一条直线；\(|r|\) 越接近 \(0\)，散点越松散。</p>
  </div>

  <div class="card">
    <p><b>相关性 \(\ne\) 因果性（潜变量陷阱）</b>：两个变量具有高度线性相关，<b>并不意味着一个变量是另一个变量发生的原因</b>！</p>
    <p>例：统计发现「冰淇淋销量」与「溺水人数」高度正相关（\(r = 0.9\)）。但这绝不意味着吃冰淇淋会导致溺水！真实原因是炎热的夏天（第三个潜变量）导致同时吃冰淇淋的人多、游泳的人也多。</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-corr">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">统计相关性直觉微图解：散点图方向与紧密度、强弱标尺与因果辨析</span>
      <div class="micro-tabs" id="m-corr-tabs">
        <button class="micro-tab active" data-tab="1">① 散点图与相关系数方向 (正/负/零)</button>
        <button class="micro-tab" data-tab="2">② 相关系数绝对值 |r| 的强弱度量</button>
        <button class="micro-tab" data-tab="3">③ r = 0 不代表没关系（非线性陷阱）</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-corr-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-corr-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">相关关系（不确定性统计规律）</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">趋势伴随</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>特征</b>：自变量确定后，因变量带有随机扰动，但宏观呈现趋势。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>实例</b>：父亲身高与儿子身高、复习时长与考试成绩。</p>
      <p class="small" style="margin:0;"><b>度量</b>：用相关系数 \(r\) 度量线性趋势的紧密程度。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">函数关系（确定性刚性法则）</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">完全确定</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>特征</b>：自变量取定后，因变量有唯一确定的数值相对应。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>实例</b>：圆的半径与面积 \(S = \pi r^2\)、自由落体距离 \(h = \frac{1}{2}gt^2\)。</p>
      <p class="small" style="margin:0;"><b>特质</b>：零随机扰动，散点全部严密落在函数曲线上。</p>
    </div>
  </div>

  <h3>2. 相关系数色彩语义主公式与分级</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">样本相关系数主公式：</p>
    <p style="margin:0 0 6px 0;">$$r = \dfrac{\sum_{i=1}^n (\color{#1976d2}{x_i - \bar{x}})(\color{#2e7d32}{y_i - \bar{y}})}{\sqrt{\sum_{i=1}^n (\color{#1976d2}{x_i - \bar{x}})^2} \sqrt{\sum_{i=1}^n (\color{#2e7d32}{y_i - \bar{y}})^2}}\qquad (-1 \le r \le 1)$$</p>
    <p style="margin:0 0 4px 0;">• \(|r| \ge 0.75\)：<b>强线性相关</b>（散点紧密聚拢在直线带状区域）；</p>
    <p style="margin:0 0 4px 0;">• \(0.25 \le |r| &lt; 0.75\)：<b>中度线性相关</b>；</p>
    <p style="margin:0 0 4px 0;">• \(|r| &lt; 0.25\)：<b>弱线性相关</b>；</p>
    <p style="margin:0;">• \(r = 0\)：<b>无线性相关</b>（注意：不等于无任何关系，可能存在完美的非线性抛物线等关系！）。</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="A">
    <p>自己试试：\(3\) 对数据 \((1,1)\)、\((2,3)\)、\((3,2)\)。\(r\) 等于？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(0.5\)</button>
      <button class="opt" data-v="B"><b>B</b>\(0.25\)</button>
      <button class="opt" data-v="C"><b>C</b>\(1\)</button>
      <button class="opt" data-v="D"><b>D</b>\(2\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\(\bar x=\bar y=2\)；偏离 \(-1,0,1\) 和 \(-1,1,0\)；乘积和 \(1+0+0=1\)；两个平方和都是 \(2\)。\(r=\dfrac{1}{\sqrt{2\times2}}=0.5\)。选 B 的同学忘了开根号，算成 \(\dfrac{1}{2\times2}\)。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：\(r_1=0.8\)，\(r_2=-0.9\)。哪组数据的点更贴近一条直线？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>第 1 组</button>
      <button class="opt" data-v="B"><b>B</b>第 2 组</button>
      <button class="opt" data-v="C"><b>C</b>一样</button>
    </div>
    <div class="reveal"><p><b>B</b>。\(|-0.9|=0.9&gt;0.8\)。选 A 的同学按 \(-0.9&lt;0.8\) 比了大小。负号只说方向（一个大另一个小），不说强弱。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：两组变量的相关系数分别为 \(r_1 = 0.82\) 和 \(r_2 = -0.91\)。<br>
    ① 比较两组变量线性相关关系的强弱，并描述各自散点图的形态特征；<br>
    ② 若将第 1 组数据进行线性变换：\(x'_i = x_i + 10,\; y'_i = 2y_i\)，求变换后新数据集的相关系数 \(r'\)。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">比较强弱看<b>绝对值 \(|r|\)</b>，负号只管方向（左上到右下）；线性变换若系数为正，相关系数保持不变（尺度与平移不变性）！</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步量化对比与性质应用</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 强弱判定与散点特征</b>：<br>
          \(|r_2| = |-0.91| = 0.91 &gt; |r_1| = 0.82\)。<br>
          因此<b>第 2 组数据的线性相关程度更强</b>！<br>
          – 第 1 组（\(r_1 = 0.82\)）：正相关，散点带从左下向右上延伸，分布较为紧凑；<br>
          – 第 2 组（\(r_2 = -0.91\)）：负相关，散点带从左上向右下延伸，且散点更加狭窄紧贴一条直线。<br>
          • <b>② 线性变换的尺度不变性</b>：<br>
          平移 \(+10\) 在离均差 \((x'_i - \bar{x}') = (x_i + 10 - (\bar{x} + 10)) = (x_i - \bar{x})\) 中完全相互抵消；<br>
          放大 \(2\) 倍在分子提出 \(2\)，在分母 \(\sqrt{2^2}\) 同样提出 \(2\)，分子分母完美约去：<br>
          $$r' = r_1 = 0.82$$
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步防坑结论核查</b>：
        <span class="small">防坑 1：切忌把 \(-0.91 &lt; 0.82\) 当作「第 2 组更弱」，负号是方向，绝对值才是紧密度！防坑 2：平移加常数、正比例缩放不改变相关系数 \(r\) 的绝对大小。</span>
      </div>
    </div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：见负号误判为弱相关，按代数大小排强弱</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：对比 \(r_1 = 0.5\) 与 \(r_2 = -0.9\)，因为 \(-0.9 &lt; 0.5\)，误判第 1 组相关性更强。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>符号只表示走向（正向同步还是反向互斥），强弱只看绝对值 \(|r|\)</b>！\(|-0.9| = 0.9 &gt; 0.5\)，第 2 组的点远远比第 1 组更贴近直线，属于极强线性相关。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：将相关系数 \(r=0\) 等同于两变量「没有任何关系」</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：算得 \(r=0\)，得出结论「变量 \(X\) 与 \(Y\) 毫无关联」。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：\(r\) 只是<b>线性相关</b>的度量标尺！若变量满足严格的非线性关系（如对称抛物线 \(y = x^2\)），算出来的 \(r\) 恰好是 \(0\)。两者具有 100% 确定性的函数关系，只是不能用直线去拟合而已。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：把相关性直接当因果性做出荒谬推断</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：发现学生穿鞋码数与词汇量呈现强正相关，得出「买大码鞋能提高语文成绩」的荒谬结论。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：相关性说明两者有统计关联，但背后往往潜藏着真正的共因（这里是年龄增长，随着年龄长大，脚变大且词汇量自然增多）。<b>相关不等于因果，更不能指导控制手段</b>。</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：y = x² 严格确定函数关系，但线性相关系数 r = 0 直觉示意</div>
    <svg class="micro-fig" id="m-corr-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      散点完全落在抛物线上，但正负离均差乘积刚好相互抵消为 0，r = 0 仅代表无线性关系，绝非无关系！
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-8-1
script_code = r'''
  // === e3-8-1 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-corr-fig");
    var desc = document.getElementById("m-corr-desc");
    var trapFig = document.getElementById("m-corr-trap-fig");
    var tabs = document.querySelectorAll("#m-corr-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 正相关 (r=0.9), 负相关 (r=-0.9), 零相关 (r=0)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "相关系数方向：正相关 (r>0 左下到右上) vs 负相关 (r<0 左上到右下)"));

      // 3 boxes
      var panels = [
        {title: "正相关 r ≈ 0.9", col: "#1976d2", x0: 40, pts: [[20,80],[35,65],[50,70],[65,45],[80,50],[95,30],[110,35],[125,20]]},
        {title: "负相关 r ≈ -0.9", col: "#ef4444", x0: 230, pts: [[20,25],[35,35],[50,30],[65,55],[80,50],[95,70],[110,65],[125,80]]},
        {title: "零相关 r ≈ 0", col: "#6b7280", x0: 420, pts: [[25,30],[40,75],[60,25],[75,80],[90,40],[105,70],[120,35],[70,55]]}
      ];

      panels.forEach(function(p) {
        fig.appendChild(el("rect", {x: p.x0, y: 40, width: 160, height: 130, rx: 8, fill: "var(--card)", stroke: p.col, "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: p.x0 + 80, y: 62, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: p.col}, p.title));

        // Draw scatter dots
        p.pts.forEach(function(pt) {
          fig.appendChild(el("circle", {cx: p.x0 + pt[0], cy: 40 + pt[1], r: 3.5, fill: p.col}));
        });

        // Fitted line indicator
        if (p.col === "#1976d2") {
          fig.appendChild(el("line", {x1: p.x0 + 15, y1: 130, x2: p.x0 + 140, y2: 65, stroke: p.col, "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
        } else if (p.col === "#ef4444") {
          fig.appendChild(el("line", {x1: p.x0 + 15, y1: 65, x2: p.x0 + 140, y2: 130, stroke: p.col, "stroke-width": "1.5", "stroke-dasharray": "3 2"}));
        }
      });

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "符号决定散点走向：r>0 倾斜向上；r<0 倾斜向下；r=0 弥散无规律"));
      desc.innerHTML = "<b>① 散点图与相关系数方向</b>：相关系数 \(r\) 的正负号严格对应散点图的走势。正相关表示两个变量同步升降；负相关表示一个变大另一个反向变小；零相关表示散点均匀漫散，两者之间不存在直线倾向。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 强弱度量 |r|
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "强弱判定看绝对值 |r|：|r| 越接近 1，点越紧贴直线，带状区域越窄"));

      var levels = [
        {title: "|r| = 0.95 (极强)", x0: 40, col: "#10b981", spread: 4},
        {title: "|r| = 0.70 (中度)", x0: 230, col: "#f59e0b", spread: 14},
        {title: "|r| = 0.20 (极弱)", x0: 420, col: "#ef4444", spread: 26}
      ];

      levels.forEach(function(lv) {
        fig.appendChild(el("rect", {x: lv.x0, y: 40, width: 160, height: 130, rx: 8, fill: "var(--card)", stroke: lv.col, "stroke-width": "1.5"}));
        fig.appendChild(el("text", {x: lv.x0 + 80, y: 62, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: lv.col}, lv.title));

        // Center line
        fig.appendChild(el("line", {x1: lv.x0 + 20, y1: 140, x2: lv.x0 + 140, y2: 70, stroke: "var(--line)", "stroke-width": "1.2"}));

        // Dots around line
        for (var i = 1; i <= 9; i++) {
          var t = i / 10;
          var lx = 20 + t * 120;
          var ly = 140 - t * 70;
          var noise = ((i * 7) % 5 - 2) * (lv.spread / 2);
          fig.appendChild(el("circle", {cx: lv.x0 + lx, cy: ly + noise, r: 3, fill: lv.col}));
        }
      });

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "注意：r = -0.91 的线性紧密程度远大于 r = 0.82！千万不可按代数大小比较"));
      desc.innerHTML = "<b>② 相关系数绝对值强弱度量</b>：相关程度的强弱与正负号完全无关！\(|-0.91| = 0.91 > 0.82\)，因此 \(-0.91\) 的点比 \(0.82\) 的点更紧凑地汇聚在一条直线上。绝对值越大，散点带越狭窄，线性模型预测精度越高。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: r = 0 但有严格非线性关系 (y = x^2)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "r = 0 仅代表无「线性」关系：y = x² 具有完美的确定性抛物线关系！"));

      var cx = 310, cy = 160;
      fig.appendChild(el("line", {x1: 110, y1: cy, x2: 510, y2: cy, stroke: "var(--line)", "stroke-width": "1.5"}));
      fig.appendChild(el("line", {x1: cx, y1: 45, x2: cx, y2: cy + 10, stroke: "var(--line)", "stroke-width": "1.5"}));

      // Parabola y = x^2 for x in [-2, 2]
      var paraPts = [];
      for (var x = -20; x <= 20; x++) {
        var rx = x / 10;
        var ry = rx * rx;
        var px = cx + rx * 60;
        var py = cy - ry * 24;
        paraPts.push(px.toFixed(1) + "," + py.toFixed(1));
        if (x % 5 === 0) {
          fig.appendChild(el("circle", {cx: px, cy: py, r: 4, fill: "#ef4444"}));
        }
      }
      fig.appendChild(el("polyline", {points: paraPts.join(" "), fill: "none", stroke: "#1976d2", "stroke-width": "2.5"}));

      fig.appendChild(el("text", {x: cx + 130, y: 75, "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "确定函数 y = x²"));
      fig.appendChild(el("text", {x: cx + 130, y: 95, "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "相关系数 r = 0！"));
      fig.appendChild(el("text", {x: cx + 130, y: 115, "font-size": "10.5", fill: "var(--muted)"}, "左半边负相关抵消右半边正相关"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "r 只能测量直线拟合能力，无法检测曲线关系；r=0 绝不能断言两变量无关"));
      desc.innerHTML = "<b>③ 非线性关系盲区陷阱</b>：当散点完全落在一条轴对称的抛物线上时，\(x\) 的正偏差与负偏差恰好关于 \(y\) 轴对称抵消，算出 \(r = 0\)。两变量具有 100% 确定的非线性关系，只是不存在一条直线能穿过它们。切勿将 \(r=0\) 误解为无关。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "抛物线 y=x²：100% 确定关系"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "荒谬推断：因为 r=0 所以它们毫无关系"));

      // Left: Symmetric curve dots
      var cx1 = 140, cy1 = 110;
      trapFig.appendChild(el("line", {x1: 50, y1: cy1, x2: 230, y2: cy1, stroke: "var(--line)", "stroke-width": "1"}));
      [-1.5, -1, -0.5, 0, 0.5, 1, 1.5].forEach(function(v) {
        var x = cx1 + v * 35;
        var y = cy1 - v * v * 20;
        trapFig.appendChild(el("circle", {cx: x, cy: y, r: 3.5, fill: "#1976d2"}));
      });
      trapFig.appendChild(el("text", {x: 140, y: 128, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#10b981"}, "对称抵消致使 r = 0（非线性）"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Warning text
      trapFig.appendChild(el("rect", {x: 310, y: 45, width: 190, height: 50, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"}));
      trapFig.appendChild(el("text", {x: 405, y: 68, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "r = 0 仅代表无「线性」关系"));
      trapFig.appendChild(el("text", {x: 405, y: 84, "text-anchor": "middle", "font-size": "10", fill: "#ef4444"}, "绝不代表没有非线性函数关系！"));
      trapFig.appendChild(el("text", {x: 400, y: 128, "text-anchor": "middle", "font-size": "10.5", fill: "var(--muted)"}, "统计审题陷阱：切勿把「无相关」等同于「独立」"));
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

print('Upgrade e3-8-1 completed! File size:', len(html.encode('utf-8')), 'bytes')
