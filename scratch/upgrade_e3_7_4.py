# upgrade_e3_7_4.py
import re
import os

filepath = 'highSchool/site/lessons/e3-7-4.html'
with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Verify original predict cards
for pid in ['try-1', 'try-2', 'try-3']:
    assert f'data-id="{pid}"' in html, f'Missing {pid}'

new_step2 = r'''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>

  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：6.3 二项式定理（<a href="e3-6-3.html">回看 6.3</a>）；7.2 离散型随机变量与超几何分布（<a href="e3-7-2.html">回看 7.2</a>）；7.3 期望与方差（<a href="e3-7-3.html">回看 7.3</a>）。二项分布与超几何分布是高中概率大题最常考的两大经典离散分布。</p>

  <div class="card">
    <p><b>伯努利试验（独立重复二项试验）</b>：只可能出现两个对立结果（成功或失败）的单次试验称为伯努利试验。在<b>完全相同的条件下重复进行 \(n\) 次相互独立的试验</b>，各次试验互不影响，每次试验中成功的概率恒为 \(p\)。</p>
    <p>例：掷骰子 5 次每次看是否为 6 点；射击 10 次每次看是否命中；有放回抽样 4 次每次看是否为次品。</p>
  </div>

  <div class="card">
    <p><b>二项分布 \(X \sim B(n, p)\)</b>：在 \(n\) 重伯努利试验中，成功的次数 \(X\) 服从二项分布。其概率公式恰为二项式展开式的一项：</p>
    <p>$$P(X=k) = C_n^k p^k (1-p)^{n-k}\quad (k = 0, 1, 2, \dots, n)$$</p>
    <p>为什么有 \(C_n^k\)：在 \(n\) 次试验中，恰好有 \(k\) 次成功、\(n-k\) 次失败。这 \(k\) 次成功可以出现在任意 \(k\) 个位次上，组合数为 \(C_n^k\)，每种具体路径的概率均为 \(p^k (1-p)^{n-k}\)。</p>
  </div>

  <div class="card">
    <p><b>超几何分布与大样本近似</b>：</p>
    <p>• <b>超几何分布</b>：有限总体（共 \(N\) 件含 \(M\) 件特品），<b>不放回抽样 \(n\) 件</b>，抽到的特品数服从超几何分布；</p>
    <p>• <b>大样本近似</b>：当总体容量 \(N\) 极大（如批量 \(N \ge 1000\)）且抽样比很小（\(n/N \le 0.1\)）时，抽走几件产品对剩下的总体比例几乎毫无影响，<b>不放回抽样可直接近似看作有放回的二项分布</b>！</p>
  </div>

  <!-- 伴读直觉微图解 -->
  <div class="micro-box" id="micro-binom-hyper">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-weight:700; color:var(--primary); font-size:14px;">二项分布与超几何分布直觉微图解：抽样机理、大样本近似与期望方差对比</span>
      <div class="micro-tabs" id="m-bh-tabs">
        <button class="micro-tab active" data-tab="1">① 有放回 (独立) vs 不放回 (牵连)</button>
        <button class="micro-tab" data-tab="2">② 大样本近似逼近机理</button>
        <button class="micro-tab" data-tab="3">③ 期望完全一致 vs 方差修正系数</button>
      </div>
    </div>
    <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:12px; text-align:center;">
      <svg class="micro-fig" id="m-bh-fig" viewBox="0 0 620 220" style="width:100%; max-width:620px; height:auto; display:block; margin:0 auto;"></svg>
    </div>
    <div class="micro-desc" id="m-bh-desc" style="margin-top:8px; font-size:12.5px; color:var(--muted); line-height:1.55;">
      加载中...
    </div>
  </div>

  <div class="concept-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
    <div class="card" style="border-top:3px solid #1976d2; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#1976d2;">二项分布 \(B(n, p)\)</b>
        <span class="badge-pill" style="background:#e3f2fd; color:#1976d2; font-size:11px; padding:2px 8px; border-radius:10px;">有放回 / 独立</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>抽样机理</b>：有放回抽样，各次试验独立，\(p\) 恒定不变。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>概率公式</b>：\(P(X=k) = C_n^k p^k (1-p)^{n-k}\)。</p>
      <p class="small" style="margin:0;"><b>期望与方差</b>：\(E(X) = np,\quad D(X) = np(1-p)\)。</p>
    </div>
    <div class="card" style="border-top:3px solid #2e7d32; margin:0;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <b style="color:#2e7d32;">超几何分布 \(H(N, M, n)\)</b>
        <span class="badge-pill" style="background:#e8f5e9; color:#2e7d32; font-size:11px; padding:2px 8px; border-radius:10px;">不放回 / 牵连</span>
      </div>
      <p class="small" style="margin:0 0 4px 0;"><b>抽样机理</b>：不放回抽样，各次试验非独立，各步概率动态变化。</p>
      <p class="small" style="margin:0 0 4px 0;"><b>概率公式</b>：\(P(X=k) = \dfrac{C_M^k C_{N-M}^{n-k}}{C_N^n}\)。</p>
      <p class="small" style="margin:0;"><b>期望与方差</b>：\(E(X) = n\dfrac{M}{N} = np,\quad D(X) = np(1-p)\dfrac{N-n}{N-1}\)。</p>
    </div>
  </div>

  <h3>2. 两大分布核心主公式与特征对比</h3>
  <div class="key" style="background:var(--card); border-left:4px solid var(--primary); padding:12px 16px; margin:14px 0;">
    <p style="margin:0 0 8px 0; font-weight:700;">二项分布与超几何分布核心对照表：</p>
    <p style="margin:0 0 6px 0;">二项分布公式：\(P(X=k) = \color{#d97706}{C_n^k} \cdot \color{#1976d2}{p^k} \cdot \color{#2e7d32}{(1-p)^{n-k}},\qquad E(X) = \color{#1976d2}{np},\quad D(X) = \color{#2e7d32}{np(1-p)}\)</p>
    <p style="margin:0 0 6px 0;">超几何分布公式：\(P(X=k) = \dfrac{\color{#1976d2}{C_M^k} \cdot \color{#2e7d32}{C_{N-M}^{n-k}}}{\color{#d97706}{C_N^n}},\qquad E(X) = \color{#1976d2}{n \cdot \dfrac{M}{N}} = \color{#1976d2}{np}\)</p>
    <p style="margin:0;">方差关系：超几何分布方差比二项分布<b>更小</b>（乘上了修正因子 \(\dfrac{N-n}{N-1} < 1\)），因为不放回抽样锁定了部分结果，减小了离散波动！</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="C">
    <p>自己试试：掷一颗均匀的骰子 \(3\) 次，恰好有 \(1\) 次是 \(6\) 点的概率是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(\dfrac16\)</button>
      <button class="opt" data-v="B"><b>B</b>\(\dfrac{25}{216}\)</button>
      <button class="opt" data-v="C"><b>C</b>\(\dfrac{25}{72}\)</button>
      <button class="opt" data-v="D"><b>D</b>\(\dfrac12\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。\(X\sim B\left(3,\dfrac16\right)\)，\(P(X=1)=C_3^1\cdot\dfrac16\cdot\left(\dfrac56\right)^2=3\times\dfrac{25}{216}=\dfrac{25}{72}\)。选 B 的同学只算了一种排法「第 \(1\) 次是 \(6\)、后两次不是」，漏乘了 \(C_3^1=3\)：那个 \(6\) 点可以出现在第 \(1\)、\(2\)、\(3\) 次。</p></div>
  </div>

  <div class="card predict" data-id="try-2" data-answer="B">
    <p>自己试试：一批灯泡的合格率是 \(0.9\)，从中随机抽 \(10\) 个（看作 \(10\) 次独立试验）。不合格的个数 \(Y\) 的均值和方差是？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(E=9\)，\(D=0.9\)</button>
      <button class="opt" data-v="B"><b>B</b>\(E=1\)，\(D=0.9\)</button>
      <button class="opt" data-v="C"><b>C</b>\(E=1\)，\(D=0.09\)</button>
      <button class="opt" data-v="D"><b>D</b>\(E=1\)，\(D=1\)</button>
    </div>
    <div class="reveal"><p><b>B</b>。数的是不合格的，「成功」就是「不合格」，\(p=0.1\)，\(Y\sim B(10,0.1)\)。\(E=10\times0.1=1\)，\(D=10\times0.1\times0.9=0.9\)。选 A 的同学把 \(0.9\) 当成了 \(p\)，算出的是合格个数的均值；选 C 的同学漏乘了 \(n\)。</p></div>
  </div>

  <h3>3. 三步破题思维链例题</h3>
  <div class="card" style="border-left:4px solid #10b981;">
    <p><b>典型例题</b>：某箱中有 10 件产品，其中 3 件次品，7 件正品。从中随机抽取 3 件产品。<br>
    ① 若「有放回地连续抽取 3 次」，求抽到的次品件数 \(X\) 的期望与方差；<br>
    ② 若「一次性不放回抽取 3 件」，求抽到的次品件数 \(Y\) 的期望与方差，并对比两者的离散稳定性。</p>
    <div class="think-steps" style="margin-top:10px;">
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #2563eb;">
        <b style="color:#2563eb;">👀 第一眼破题信号</b>：
        <span class="small">有放回 \(\Longrightarrow\) 独立重复试验，\(X \sim B(3, 0.3)\) 二项分布；不放回 \(\Longrightarrow\) 古典组合抽样，\(Y \sim H(10, 3, 3)\) 超几何分布。</span>
      </div>
      <div class="think-step" style="margin-bottom:8px; padding-left:12px; border-left:2px solid #10b981;">
        <b style="color:#10b981;">🔧 第二步套公式分别求解</b>：
        <div class="small" style="margin-top:4px;">
          • <b>① 有放回（二项分布）</b>：\(n = 3,\; p = \dfrac{3}{10} = 0.3\)。<br>
          期望：\(E(X) = np = 3 \times 0.3 = 0.9\)；<br>
          方差：\(D(X) = np(1-p) = 3 \times 0.3 \times 0.7 = 0.63\)。<br>
          • <b>② 不放回（超几何分布）</b>：\(N = 10,\; M = 3,\; n = 3\)。<br>
          期望：\(E(Y) = n \dfrac{M}{N} = 3 \times \dfrac{3}{10} = 0.9\)；<br>
          方差：\(D(Y) = np(1-p) \times \dfrac{N-n}{N-1} = 0.63 \times \dfrac{10-3}{10-1} = 0.63 \times \dfrac{7}{9} = 0.49\)。
        </div>
      </div>
      <div class="think-step" style="padding-left:12px; border-left:2px solid #f59e0b;">
        <b style="color:#f59e0b;">🛡️ 第三步本质洞察与防坑核查</b>：
        <span class="small">对比惊人规律：\(E(X) = E(Y) = 0.9\)（两种抽样期望完全一样！）；而方差 \(D(Y) = 0.49 < D(X) = 0.63\)！不放回抽样由于每抽走一件就缩减了后期的不确定性，方差恒小于有放回抽样。防坑：切勿把不放回的方差直接套用 \(np(1-p)\)！</span>
      </div>
    </div>
  </div>

  <div class="card predict" data-id="try-3" data-answer="C">
    <p>自己试试：\(7\) 名同学里有 \(5\) 名男生、\(2\) 名女生，随机选 \(4\) 人。选中的男生人数 \(X\) 可能取哪些值？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\(0,1,2,3,4\)</button>
      <button class="opt" data-v="B"><b>B</b>\(1,2,3,4\)</button>
      <button class="opt" data-v="C"><b>C</b>\(2,3,4\)</button>
      <button class="opt" data-v="D"><b>D</b>\(2,3,4,5\)</button>
    </div>
    <div class="reveal"><p><b>C</b>。女生只有 \(2\) 名，选 \(4\) 人至少有 \(2\) 名男生：\(\max(0,4-7+5)=2\)；最多 \(\min(4,5)=4\)。选 A 的同学忘了女生不够；选 D 的同学忘了一共只选 \(4\) 人。</p></div>
  </div>

  <h3>4. 三大翻车现场红绿对比卡</h3>
  <div class="trap-grid" style="display:grid; grid-template-columns:1fr; gap:12px; margin:14px 0;">
    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 1：审题漏看「放回」字眼，二项与超几何模型错配</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：题目写「不放回抽取 3 件」，却套用二项分布写 \(P(X=k) = C_3^k p^k (1-p)^{3-k}\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：严格圈画题眼！<b>「不放回 / 一次性抽取」走超几何分布（组合数之比）；「有放回 / 独立重复进行」走二项分布</b>！模型一旦用反，整题概率算错零分。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 2：二项分布公式漏乘组合数 \(C_n^k\)（只算了一种固定次序）</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：掷 3 次骰子恰有 1 次得 6 点，直接写成 \(\dfrac{1}{6} \times \left(\dfrac{5}{6}\right)^2 = \dfrac{25}{216}\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：这个 6 点可以出现在第 1 次、第 2 次或第 3 次，共有 \(C_3^1 = 3\) 种互斥位置！必须乘上组合数：\(P = C_3^1 \cdot \dfrac{1}{6} \cdot \left(\dfrac{5}{6}\right)^2 = \dfrac{25}{72}\)。</p>
    </div>

    <div class="trap-card" style="background:var(--card); border:1px solid var(--line); border-left:4px solid #ef4444; border-radius:6px; padding:10px 14px;">
      <b style="color:#ef4444;">翻车现场 3：成功概率 \(p\) 与失败概率 \(1-p\) 颠倒</b>
      <p class="small" style="margin:4px 0;"><span style="color:#ef4444;">❌ 翻车</span>：合格率 0.9，求「不合格产品数」的期望，直接写 \(E = 10 \times 0.9 = 9\)。</p>
      <p class="small" style="margin:4px 0;"><span style="color:#10b981;">✔ 正确</span>：<b>随机变量 \(X\) 统计的是什么，什么就是「成功」</b>！题目统计不合格品数，单次试验成功的概率是 \(p = 1 - 0.9 = 0.1\)，因此期望是 \(10 \times 0.1 = 1\) 个，绝非 9 个！</p>
    </div>
  </div>

  <div style="background:var(--card); border:1px solid var(--line); border-radius:8px; padding:10px; margin:12px 0;">
    <div style="font-weight:700; font-size:12.5px; color:var(--fg); margin-bottom:6px;">反例微图解：有放回独立抽样 vs 不放回动态关联抽样对比</div>
    <svg class="micro-fig" id="m-bh-trap-fig" viewBox="0 0 540 140" style="width:100%; max-width:540px; height:auto; display:block; margin:0 auto;"></svg>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px; text-align:center;">
      有放回：球摸出后放回，袋内永远 3:7，每次概率恒定 0.3；不放回：球取出一只少一只，第二只概率随第一只改变。
    </div>
  </div>
</section>'''

# Replace Step 2
step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), 'Step 2 section not found'
html = step2_pattern.sub(lambda m: new_step2, html)

# Interactive script for e3-7-4
script_code = r'''
  // === e3-7-4 Micro-box & Trap Interactive Script ===
  (function () {
    var fig = document.getElementById("m-bh-fig");
    var desc = document.getElementById("m-bh-desc");
    var trapFig = document.getElementById("m-bh-trap-fig");
    var tabs = document.querySelectorAll("#m-bh-tabs .micro-tab");
    if (!fig || !desc) return;

    function el(t, a, txt) {
      var e = document.createElementNS("http://www.w3.org/2000/svg", t);
      for (var k in a) e.setAttribute(k, a[k]);
      if (txt) e.textContent = txt;
      return e;
    }

    function drawTab1() {
      fig.innerHTML = "";
      // Tab 1: 有放回 (二项分布) vs 不放回 (超几何分布)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "抽样机理对比：有放回（独立恒定 p）vs 不放回（动态关联条件概率）"));

      // Left: 有放回 (袋内永远 3红 7白)
      fig.appendChild(el("rect", {x: 35, y: 38, width: 260, height: 138, rx: 8, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 165, y: 60, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#1976d2"}, "有放回抽样 ⟹ 二项分布 B(n, p)"));

      fig.appendChild(el("rect", {x: 55, y: 75, width: 90, height: 40, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 100, y: 95, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "第 1 次摸球"));
      fig.appendChild(el("text", {x: 100, y: 108, "text-anchor": "middle", "font-size": "9.5", fill: "#1976d2"}, "P(红)=3/10"));

      // Curved arrow back to bag
      fig.appendChild(el("path", {d: "M 145 95 Q 185 70 200 90", fill: "none", stroke: "#10b981", "stroke-width": "1.8", "stroke-dasharray": "3 2"}));
      fig.appendChild(el("text", {x: 185, y: 80, "font-size": "9.5", "font-weight": "700", fill: "#10b981"}, "摸后放回"));

      fig.appendChild(el("rect", {x: 185, y: 95, width: 90, height: 40, rx: 6, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 230, y: 95, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#1976d2"}, "第 2 次摸球"));
      fig.appendChild(el("text", {x: 230, y: 108, "text-anchor": "middle", "font-size": "9.5", fill: "#1976d2"}, "P(红)仍=3/10"));

      fig.appendChild(el("text", {x: 165, y: 160, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#1976d2"}, "每次试验独立，p 恒定"));

      // Right: 不放回 (抽走后基数缩减)
      fig.appendChild(el("rect", {x: 325, y: 38, width: 260, height: 138, rx: 8, fill: "var(--card)", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 455, y: 60, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "不放回抽样 ⟹ 超几何分布 H"));

      fig.appendChild(el("rect", {x: 345, y: 75, width: 90, height: 40, rx: 6, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 390, y: 95, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#2e7d32"}, "第 1 次摸球"));
      fig.appendChild(el("text", {x: 390, y: 108, "text-anchor": "middle", "font-size": "9.5", fill: "#2e7d32"}, "P(红)=3/10"));

      fig.appendChild(el("line", {x1: 435, y1: 95, x2: 475, y2: 95, stroke: "#ef4444", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 455, y: 88, "text-anchor": "middle", "font-size": "9.5", "font-weight": "700", fill: "#ef4444"}, "不放回"));

      fig.appendChild(el("rect", {x: 475, y: 75, width: 90, height: 40, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1"}));
      fig.appendChild(el("text", {x: 520, y: 95, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "第 2 次摸球"));
      fig.appendChild(el("text", {x: 520, y: 108, "text-anchor": "middle", "font-size": "9.5", fill: "#ef4444"}, "P(红)=2/9 或 3/9"));

      fig.appendChild(el("text", {x: 455, y: 160, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#2e7d32"}, "样本空间缩水，概率受前一步制约"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "审题第一步：圈出「放回」还是「不放回」，彻底锁死数学模型"));
      desc.innerHTML = "<b>① 抽样机理本质对比</b>：有放回抽样每次抽取后复原，各次试验相互独立，单次成功率 \(p\) 恒定不变，服从二项分布；不放回抽样每抽走一件产品，袋内总体与特品数同时减少，各步试验相互牵连，服从超几何分布。";
    }

    function drawTab2() {
      fig.innerHTML = "";
      // Tab 2: 大样本近似收敛机理 (N=10000 大海捞针)
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "大样本近似：当总体 N 极大（大海捞针）时，超几何分布收敛于二项分布"));

      // Big warehouse pool
      fig.appendChild(el("rect", {x: 60, y: 45, width: 220, height: 125, rx: 10, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "2"}));
      fig.appendChild(el("text", {x: 170, y: 70, "text-anchor": "middle", "font-size": "12.5", "font-weight": "700", fill: "#1976d2"}, "海量产品库 N = 10,000 件"));
      fig.appendChild(el("text", {x: 170, y: 95, "text-anchor": "middle", "font-size": "11", fill: "var(--fg)"}, "含合格品 9,000 件 (90%)"));
      fig.appendChild(el("text", {x: 170, y: 115, "text-anchor": "middle", "font-size": "11", fill: "#ef4444"}, "含次品 1,000 件 (10%)"));
      fig.appendChild(el("text", {x: 170, y: 145, "text-anchor": "middle", "font-size": "10.5", fill: "var(--muted)"}, "抽样比 n/N = 5 / 10000 = 0.05%"));

      // Arrow pointing to extraction
      fig.appendChild(el("line", {x1: 280, y1: 107, x2: 340, y2: 107, stroke: "#10b981", "stroke-width": "3"}));
      fig.appendChild(el("polygon", {points: "340,102 350,107 340,112", fill: "#10b981"}));

      // Right: Comparison of probabilities
      fig.appendChild(el("rect", {x: 360, y: 45, width: 220, height: 125, rx: 8, fill: "#e8f5e9", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 470, y: 70, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "#2e7d32"}, "抽取 1 件后的次品率变化"));
      fig.appendChild(el("text", {x: 470, y: 98, "text-anchor": "middle", "font-size": "11.5", fill: "var(--fg)"}, "抽前：1000 / 10000 = 0.1000"));
      fig.appendChild(el("text", {x: 470, y: 122, "text-anchor": "middle", "font-size": "11.5", fill: "var(--fg)"}, "抽后：999 / 9999 = 0.0999"));
      fig.appendChild(el("text", {x: 470, y: 150, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "误差仅 0.0001，完全可忽略！"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "质检常识：当总体容量极大时，不放回抽样直接按二项分布 B(n, p) 计算"));
      desc.innerHTML = "<b>② 大样本近似原理</b>：在宏观工业质检或全员民调中，总体数量 \(N\) 达上万件。即使不放回抽检 10 件，总体中次品比例从 10% 变成 9.99%，概率波动在万分位以下。此时超几何分布高度逼近二项分布，大幅简化组合数计算。";
    }

    function drawTab3() {
      fig.innerHTML = "";
      // Tab 3: 期望完全一致 vs 方差修正系数
      fig.appendChild(el("text", {x: 310, y: 22, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "var(--fg)"}, "数字特征对比：期望 E(X)=E(Y)=np 恒等；超几何方差多了修正因子 (N-n)/(N-1) < 1"));

      // Expectation box (Identical)
      fig.appendChild(el("rect", {x: 50, y: 45, width: 230, height: 125, rx: 8, fill: "var(--card)", stroke: "#1976d2", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 165, y: 70, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#1976d2"}, "数学期望 E 恒等"));
      fig.appendChild(el("text", {x: 165, y: 98, "text-anchor": "middle", "font-size": "12", fill: "var(--fg)"}, "二项分布：E(X) = np"));
      fig.appendChild(el("text", {x: 165, y: 122, "text-anchor": "middle", "font-size": "12", fill: "var(--fg)"}, "超几何：E(Y) = n(M/N) = np"));
      fig.appendChild(el("text", {x: 165, y: 150, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "两模型平均产出完全相同！"));

      // Variance box (Hyper is smaller)
      fig.appendChild(el("rect", {x: 340, y: 45, width: 230, height: 125, rx: 8, fill: "var(--card)", stroke: "#2e7d32", "stroke-width": "1.5"}));
      fig.appendChild(el("text", {x: 455, y: 70, "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: "#2e7d32"}, "方差 D 超几何更小"));
      fig.appendChild(el("text", {x: 455, y: 98, "text-anchor": "middle", "font-size": "11.5", fill: "var(--fg)"}, "D_超 = D_二 × (N-n)/(N-1)"));
      fig.appendChild(el("text", {x: 455, y: 122, "text-anchor": "middle", "font-size": "11.5", fill: "#ef4444"}, "修正系数 (N-n)/(N-1) < 1"));
      fig.appendChild(el("text", {x: 455, y: 150, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#2e7d32"}, "不放回锁定了不确定性，波动更小"));

      fig.appendChild(el("text", {x: 310, y: 202, "text-anchor": "middle", "font-size": "12", "font-weight": "700", fill: "var(--fg)"}, "例：N=10, n=3 时，修正比为 7/9 ≈ 0.78，超几何方差比二项分布小 22%"));
      desc.innerHTML = "<b>③ 期望方差深刻对比</b>：无论放回与否，平均抽到的件数（期望）完全相等（\(E = np\)）。但由于不放回抽样逐渐耗尽总体，减少了后期的随机摇摆，因此超几何分布的方差恒小于二项分布（相差一个有限总体修正系数 \(\dfrac{N-n}{N-1}\)）。";
    }

    function drawTrap() {
      if (!trapFig) return;
      trapFig.innerHTML = "";
      trapFig.appendChild(el("text", {x: 140, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#10b981"}, "二项分布必须乘组合数 Cₙᵏ"));
      trapFig.appendChild(el("text", {x: 400, y: 22, "text-anchor": "middle", "font-size": "11.5", "font-weight": "700", fill: "#ef4444"}, "漏乘 Cₙᵏ 只算了一种固定序列"));

      // Left: 3 positions for 1 success
      var seqs = ["【正】反 反", "反【正】反", "反 反【正】"];
      seqs.forEach(function(s, i) {
        var y = 45 + i * 24;
        trapFig.appendChild(el("rect", {x: 60, y: y - 8, width: 140, height: 20, rx: 4, fill: "#e3f2fd", stroke: "#1976d2", "stroke-width": "1"}));
        trapFig.appendChild(el("text", {x: 130, y: y + 5, "text-anchor": "middle", "font-size": "10.5", "font-weight": "700", fill: "#1976d2"}, s));
      });
      trapFig.appendChild(el("text", {x: 140, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#10b981"}, "C₃¹ = 3 种排位，乘以 3！"));

      // Separator
      trapFig.appendChild(el("line", {x1: 270, y1: 15, x2: 270, y2: 135, stroke: "var(--line)", "stroke-width": "1"}));

      // Right: Only 1 fixed sequence
      trapFig.appendChild(el("rect", {x: 320, y: 55, width: 160, height: 35, rx: 6, fill: "#fee2e2", stroke: "#ef4444", "stroke-width": "1.5"}));
      trapFig.appendChild(el("text", {x: 400, y: 76, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "只算 (1/6) × (5/6)² = 25/216"));
      trapFig.appendChild(el("text", {x: 400, y: 125, "text-anchor": "middle", "font-size": "11", "font-weight": "700", fill: "#ef4444"}, "严重漏乘 C₃¹ = 3 倍概率！"));
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

print('Upgrade e3-7-4 completed! File size:', len(html.encode('utf-8')), 'bytes')
