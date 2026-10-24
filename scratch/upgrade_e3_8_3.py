import re
import os

with open("highSchool/site/lessons/e3-8-3.html", "r", encoding="utf-8") as f:
    html = f.read()

# Verify predict cards present
assert 'data-id="try-1"' in html
assert 'data-id="try-2"' in html
assert 'data-id="try-3"' in html

new_step2 = '''<section class="step" data-title="讲清楚">
  <div class="vid" data-video="concept"></div>
  <h3>1. 先认识几个词</h3>
  <p class="small">要用到：事件的相互独立 \\(P(AB)=P(A)P(B)\\)（<a href="b2-10-2.html">回看必修二 10.2</a>）；频率和比例；成对数据、两个变量之间的关系（<a href="e3-8-1.html">回看 8.1</a>）。</p>

  <div class="card">
    <p><b>分类变量</b>：取值是几个类别，不是能加减的数。</p>
    <p>例：「性别」取男、女；「打不打篮球」取打、不打。就算把「打」记成 \\(1\\)、「不打」记成 \\(0\\)，这两个数也只是名字。本节的两个分类变量都只取两类。</p>
  </div>

  <div class="card">
    <p><b>\\(2\\times2\\) 列联表</b>：把两个分类变量的四种组合各有多少人填进四个格子，再写上合计。</p>
    <div class="wide-x"><table class="ct">
      <tr><th></th><th>打</th><th>不打</th><th>合计</th></tr>
      <tr><th>男</th><td>\\(a=48\\)</td><td>\\(b=32\\)</td><td class="sum">\\(80\\)</td></tr>
      <tr><th>女</th><td>\\(c=10\\)</td><td>\\(d=40\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>合计</th><td class="sum">\\(58\\)</td><td class="sum">\\(72\\)</td><td class="sum">\\(n=130\\)</td></tr>
    </table></div>
    <p class="small">一般写法：第一行 \\(a,b\\)，第二行 \\(c,d\\)，\\(n=a+b+c+d\\)。</p>
  </div>

  <!-- Component 1: 伴读直觉微图解 -->
  <div class="micro-box" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <span style="font-weight:700;font-size:0.95rem;color:var(--text,#1e293b);">伴读直觉微图解：独立性检验三维直觉透视</span>
      <div style="display:flex;gap:6px;">
        <button type="button" class="btn-tab active" id="btn-chi-ratio" onclick="mChiTab('ratio')" style="padding:4px 10px;font-size:0.8rem;border-radius:6px;border:1px solid #3b82f6;background:#3b82f6;color:#fff;cursor:pointer;">① 比例条形直觉</button>
        <button type="button" class="btn-tab" id="btn-chi-diff" onclick="mChiTab('diff')" style="padding:4px 10px;font-size:0.8rem;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#1e293b);cursor:pointer;">② 频数偏离期望</button>
        <button type="button" class="btn-tab" id="btn-chi-test" onclick="mChiTab('test')" style="padding:4px 10px;font-size:0.8rem;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#1e293b);cursor:pointer;">③ 反证决策拒绝域</button>
      </div>
    </div>
    <div style="width:100%;max-width:540px;margin:0 auto;text-align:center;">
      <svg id="m-chi-fig" viewBox="0 0 540 220" style="width:100%;height:auto;display:block;background:var(--bg-subtle,#f8fafc);border-radius:8px;">
        <!-- Injected by script -->
      </svg>
      <div id="m-chi-readout" style="margin-top:10px;font-size:0.85rem;color:var(--text-muted,#475569);line-height:1.5;"></div>
    </div>
  </div>

  <!-- Component 2: 概念对比双卡 -->
  <div class="concept-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:16px 0;">
    <div class="card" style="margin:0;border-left:4px solid #3b82f6;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <b style="color:#2563eb;">等高堆积条形图 (直观比比例)</b>
        <span class="badge-pill" style="background:#dbeafe;color:#1e40af;font-size:0.75rem;padding:2px 8px;border-radius:10px;">探索性描述</span>
      </div>
      <p style="font-size:0.85rem;margin:4px 0;line-height:1.5;">
        <b>原理</b>：将两组频数归一化为百分比（\\(p_1=\\frac{a}{a+b}\\)，\\(p_2=\\frac{c}{c+d}\\)），观察两柱分界线的高低落差。<br>
        <b>优势与局限</b>：直观形象，能一眼看出两组是否存在倾向性差异；但<b>无法剔除随机抽样波动</b>的影响，样本量太小时容易把偶发差异误当成规律。
      </p>
    </div>
    <div class="card" style="margin:0;border-left:4px solid #10b981;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <b style="color:#059669;">\\(\\chi^2\\) 独立性检验 (严谨统计推断)</b>
        <span class="badge-pill" style="background:#d1fae5;color:#065f46;font-size:0.75rem;padding:2px 8px;border-radius:10px;">反证法决策</span>
      </div>
      <p style="font-size:0.85rem;margin:4px 0;line-height:1.5;">
        <b>原理</b>：假定 \\(H_0\\)（两变量独立），量化「实际观察频数」与「独立理论期望」的总偏离程度 \\(\\chi^2\\)。<br>
        <b>决策机制</b>：若 \\(\\chi^2\\ge k_\\alpha\\)，说明在独立假设下出现这种极端偏离属于<b>小概率事件</b>，从而以不超过 \\(\\alpha\\) 的犯错概率否定 \\(H_0\\)，断定有关联。
      </p>
    </div>
  </div>

  <div class="card">
    <p><b>小概率值 \\(\\alpha\\) 和临界值 \\(x_\\alpha\\)</b>：事先定一个很小的概率 \\(\\alpha\\)，比如 \\(0.05\\)。临界值 \\(x_\\alpha\\) 的意思是：<b>如果 \\(H_0\\) 成立</b>，算出来的 \\(\\chi^2\\ge x_\\alpha\\) 的概率约为 \\(\\alpha\\)。常用的五组：</p>
    <div class="wide-x"><table class="ct">
      <tr><th>\\(\\alpha\\)</th><td>\\(0.1\\)</td><td>\\(0.05\\)</td><td>\\(0.01\\)</td><td>\\(0.005\\)</td><td>\\(0.001\\)</td></tr>
      <tr><th>\\(x_\\alpha\\)</th><td>\\(2.706\\)</td><td>\\(3.841\\)</td><td>\\(6.635\\)</td><td>\\(7.879\\)</td><td>\\(10.828\\)</td></tr>
    </table></div>
    <p>例：\\(\\alpha=0.05\\) 时 \\(x_\\alpha=3.841\\)：两个变量真的独立时，\\(\\chi^2\\) 达到 \\(3.841\\) 的情形大约 \\(20\\) 次里只有 \\(1\\) 次。\\(\\alpha\\) 越小，临界值越大，推断要求越严格。</p>
  </div>

  <h3>2. 先看比例：等高堆积条形图</h3>
  <p>人数多少不能直接比，两行的总人数可能不同。把每一行都换成比例，画成一样高的条，每条按比例分成两段，这叫<b>等高堆积条形图</b>。两条的分界线高度差不多，说明两行比例差不多；差得多，说明可能有关联。</p>
  <div class="card">
    <p class="small">例 1（看一遍怎么做）</p>
    <p>问了 \\(100\\) 名同学「是否常吃早餐」和「上午是否犯困」：常吃早餐的 \\(50\\) 人中 \\(15\\) 人犯困，不常吃的 \\(50\\) 人中 \\(30\\) 人犯困。</p>
    <p>常吃早餐一行：犯困比例 \\(\\dfrac{15}{50}=30\\%\\)；不常吃一行：\\(\\dfrac{30}{50}=60\\%\\)。两条的分界线一个在 \\(30\\%\\)、一个在 \\(60\\%\\)，差得明显，所以怀疑「吃早餐」和「犯困」有关联。到底差得够不够多，下一块用 \\(\\chi^2\\) 判断。</p>
  </div>

  <div class="card predict" data-id="try-1" data-answer="B">
    <p>自己试试：甲组 \\(50\\) 人中 \\(30\\) 人选「是」，乙组 \\(30\\) 人中 \\(18\\) 人选「是」。按比例看两组？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>甲组更高</button>
      <button class="opt" data-v="B"><b>B</b>一样</button>
      <button class="opt" data-v="C"><b>C</b>乙组更高</button>
    </div>
    <div class="reveal"><p><b>B</b>。\\(\\dfrac{30}{50}=60\\%\\)，\\(\\dfrac{18}{30}=60\\%\\)，比例一样，等高条形图里两条的分界线一样高（这时 \\(\\chi^2=0\\)）。选 A 的同学比的是人数 \\(30&gt;18\\)，没看两组总人数不同。</p></div>
  </div>
  <div class="vid" data-video="ex1"></div>

  <h3>3. 算 \\(\\chi^2\\)</h3>
  <p>\\(\\chi^2\\) 把「每个格子实际人数和独立时应有人数差多少」合成一个数。对 \\(2\\times2\\) 表，它化简为核心计算公式：</p>

  <!-- Component 3: 色彩语义主公式 -->
  <div class="key" style="background:#f0fdf4;border-left:4px solid #10b981;padding:12px 16px;border-radius:8px;margin:12px 0;">
    <div style="font-weight:700;color:#047857;margin-bottom:6px;font-size:0.9rem;">\\(\\chi^2\\) 对角交叉乘积差核心公式</div>
    <div style="text-align:center;font-size:1.15rem;margin:8px 0;">
      \\[\\chi^2 = \\dfrac{\\color{#3b82f6}{n}(\\color{#ef4444}{ad}-\\color{#10b981}{bc})^2}{\\color{#8b5cf6}{(a+b)(c+d)(a+c)(b+d)}}\\]
    </div>
    <div style="font-size:0.85rem;line-height:1.6;color:#1e293b;">
      • <b style="color:#3b82f6;">样本总量 \\(n\\)</b>：\\(n = a+b+c+d\\)，倍增放大样本的统计效力；<br>
      • <b style="color:#ef4444;">主对角 \\(ad\\)</b> 与 <b style="color:#10b981;">副对角 \\(bc\\)</b>：交叉乘积之差 \\(|ad-bc|\\) 精确刻画两行两列比例落差；若 \\(ad=bc\\) 则 \\(\\chi^2=0\\)（完全无关联）；<br>
      • <b style="color:#8b5cf6;">分母四项边际合计乘积</b>：第一行合计、第二行合计、第一列合计、第二列合计乘积，作为标准化归一基准。
    </div>
  </div>

  <div class="card">
    <p class="small">例 2（算一遍，留着下块用）</p>
    <p>把例 1 的数据写成列联表：</p>
    <div class="wide-x"><table class="ct">
      <tr><th></th><th>犯困</th><th>不犯困</th><th>合计</th></tr>
      <tr><th>常吃</th><td>\\(a=15\\)</td><td>\\(b=35\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>不常吃</th><td>\\(c=30\\)</td><td>\\(d=20\\)</td><td class="sum">\\(50\\)</td></tr>
      <tr><th>合计</th><td class="sum">\\(45\\)</td><td class="sum">\\(55\\)</td><td class="sum">\\(n=100\\)</td></tr>
    </table></div>
    <p>代入公式：</p>
    <p>\\[ad-bc = 15\\times20 - 35\\times30 = 300 - 1050 = -750\\]</p>
    <p>\\[\\chi^2 = \\dfrac{100\\times(-750)^2}{50\\times50\\times45\\times55} = \\dfrac{100\\times562500}{6187500} = \\dfrac{56250000}{6187500} \\approx 9.091\\]</p>
  </div>

  <div class="card predict" data-id="try-2" data-answer="A">
    <p>自己试试：\\(a=20\\)，\\(b=30\\)，\\(c=30\\)，\\(d=20\\)。\\(\\chi^2=\\)？</p>
    <div class="opts cols">
      <button class="opt" data-v="A"><b>A</b>\\(4\\)</button>
      <button class="opt" data-v="B"><b>B</b>\\(-4\\)</button>
      <button class="opt" data-v="C"><b>C</b>\\(0\\)</button>
    </div>
    <div class="reveal"><p><b>A</b>。\\(n=100\\)，四个合计都是 \\(50\\)，\\(ad-bc=400-900=-500\\)，\\((-500)^2=250000\\)。\\(\\chi^2=\\dfrac{100\\times250000}{50^4}=\\dfrac{25000000}{6250000}=4\\)。选 B 的同学忘了分子有平方，\\(\\chi^2\\) 不会是负数。</p></div>
  </div>
  <div class="vid" data-video="ex2"></div>

  <!-- Component 4: 三步破题思维链例题 -->
  <h3>4. 检验三步，结论怎么说</h3>
  <div class="think-steps" style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:16px;margin:16px 0;">
    <div style="font-weight:700;color:var(--text,#1e293b);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
      <span style="background:#e0e7ff;color:#3730a3;font-size:0.75rem;padding:2px 8px;border-radius:4px;">解题金钥匙</span>
      高考独立性检验三步破题规范思维链
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:1.1rem;line-height:1;">👀</span>
        <div>
          <b style="color:#2563eb;font-size:0.9rem;">第一步·立假设提边际 (破题信号与列联表准备)</b>
          <p style="font-size:0.85rem;margin:2px 0 0;color:var(--text-muted,#475569);line-height:1.5;">
            明确零假设 \\(H_0\\)：「两变量相互独立/无关联」；审清题目要求的小概率值 \\(\\alpha\\)（如 \\(\\alpha=0.01\\)），查表锁定临界值 \\(x_\\alpha\\)（如 \\(6.635\\)）；准确核对列联表 \\(a,b,c,d\\) 及四个边缘合计。
          </p>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:1.1rem;line-height:1;">🔧</span>
        <div>
          <b style="color:#059669;font-size:0.9rem;">第二步·套公式算卡方 (高精度交叉运算防错)</b>
          <p style="font-size:0.85rem;margin:2px 0 0;color:var(--text-muted,#475569);line-height:1.5;">
            套用 \\(\\chi^2=\\frac{n(ad-bc)^2}{(a+b)(c+d)(a+c)(b+d)}\\)。先算主副对角乘积差 \\(ad-bc\\)，再算平方并乘以 \\(n\\)；分母四项相乘，计算过程保留三位小数，防分子漏乘 \\(n\\) 或平方算错。
          </p>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:1.1rem;line-height:1;">🛡️</span>
        <div>
          <b style="color:#d97706;font-size:0.9rem;">第三步·比阈值严谨作答 (规避绝对化严防扣分)</b>
          <p style="font-size:0.85rem;margin:2px 0 0;color:var(--text-muted,#475569);line-height:1.5;">
            • 若 \\(\\chi^2\\ge x_\\alpha\\)：拒绝 \\(H_0\\)，标准作答为「<b>有 \\(100(1-\\alpha)\\%\\) 的把握认为两变量有关联</b>」或「<b>在犯错概率不超过 \\(\\alpha\\) 的前提下认为两变量有关联</b>」；<br>
            • 若 \\(\\chi^2&lt;x_\\alpha\\)：不能拒绝 \\(H_0\\)，作答为「<b>没有充分证据认为两变量有关联</b>」（严禁作答为「证明了两者完全独立」！）。
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <p class="small">例 3（实战演练）</p>
    <p>接例 2，算得 \\(\\chi^2\\approx9.091\\)。</p>
    <p>取 \\(\\alpha=0.01\\)：\\(9.091\\ge6.635\\)，拒绝 \\(H_0\\)。在 \\(\\alpha=0.01\\) 下认为「是否常吃早餐」和「上午是否犯困」有关联，这个推断犯错的概率不超过 \\(0.01\\)（即有 \\(99\\%\\) 的把握认为两者有关联）。</p>
    <p>若事先取的是 \\(\\alpha=0.001\\)：\\(9.091&lt;10.828\\)，不能拒绝 \\(H_0\\)，结论是「没有充分证据认为两者有关联」。同一组数据，规则定得越严，越难下「有关联」的结论；所以 \\(\\alpha\\) 必须事先定好，绝不能算完后再挑合心意的临界值。</p>
  </div>

  <div class="card predict" data-id="try-3" data-answer="B">
    <p>自己试试：取 \\(\\alpha=0.05\\)，算得 \\(\\chi^2=3.2\\)。结论应该写？</p>
    <div class="opts">
      <button class="opt" data-v="A"><b>A</b>认为两个变量有关联，犯错概率不超过 \\(0.05\\)</button>
      <button class="opt" data-v="B"><b>B</b>没有充分证据认为两个变量有关联</button>
      <button class="opt" data-v="C"><b>C</b>证明了两个变量独立</button>
    </div>
    <div class="reveal"><p><b>B</b>。\\(3.2&lt;3.841\\)，没到临界值，不能拒绝 \\(H_0\\)。选 A 是比反了方向；选 C 说过头了：没拒绝只是证据不够，不是证明独立（下一块有反例）。</p></div>
  </div>
  <div class="key" style="text-align:center;">\\(\\chi^2\\ge x_\\alpha\\) 拒绝 \\(H_0\\)：有 \\(100(1-\\alpha)\\%\\) 把握认为有关联；\\(\\chi^2&lt;x_\\alpha\\) 未拒绝：没有充分证据认为有关联（非证明独立）。</div>

  <!-- Component 5: 三大翻车现场红绿对比卡 + 反例微图解 -->
  <h3>5. 用之前，查这几件事（三大翻车现场与防坑指南）</h3>
  <div class="trap-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:16px 0;">
    <div class="trap-card" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;">
      <div style="font-weight:700;color:#991b1b;font-size:0.85rem;margin-bottom:6px;">❌ 翻车现场 1：公式交叉项错配或漏乘 \\(n\\)</div>
      <p style="font-size:0.8rem;color:#7f1d1d;line-height:1.5;margin:0 0 6px;">
        误把 \\(ad-bc\\) 写成同行同列相乘 \\(ab-cd\\)，或分子漏乘样本容量 \\(n\\)，导致算出来的 \\(\\chi^2\\) 缩系数或结果为负。
      </p>
      <div style="font-size:0.8rem;color:#166534;background:#f0fdf4;padding:6px;border-radius:4px;">
        <b>正解防坑</b>：牢记「对角线交叉相乘再相减」；分子必须含 \\(n\\) 且带平方，\\(\\chi^2\\ge 0\\) 恒为非负！
      </div>
    </div>
    <div class="trap-card" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;">
      <div style="font-weight:700;color:#991b1b;font-size:0.85rem;margin-bottom:6px;">❌ 翻车现场 2：结论写成绝对肯定或「证明了独立」</div>
      <p style="font-size:0.8rem;color:#7f1d1d;line-height:1.5;margin:0 0 6px;">
        卡方检验通过时写成「\\(100\\%\\) 肯定有关联」；没达到临界值时写成「证明了两者完全独立」。高考中两类表述均会被严厉扣分！
      </p>
      <div style="font-size:0.8rem;color:#166534;background:#f0fdf4;padding:6px;border-radius:4px;">
        <b>正解防坑</b>：独立性检验是概率推断，永远带有犯错可能！未拒绝只是「无充分证据」，不可妄下肯定结论。
      </div>
    </div>
    <div class="trap-card" style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;">
      <div style="font-weight:700;color:#991b1b;font-size:0.85rem;margin-bottom:6px;">❌ 翻车现场 3：小样本频数不足盲套公式 (伪显著)</div>
      <p style="font-size:0.8rem;color:#7f1d1d;line-height:1.5;margin:0 0 6px;">
        当单元格频数小于 \\(5\\) 时（如仅调查 \\(4\\) 个人算出 \\(\\chi^2=4&gt;3.841\\)），大样本正态逼近完全失效，直接套公式会产生严重伪显著。
      </p>
      <div style="font-size:0.8rem;color:#166534;background:#f0fdf4;padding:6px;border-radius:4px;">
        <b>正解防坑</b>：独立性检验要求样本量足够大且随机抽样，常规要求每个格子的实际频数与期望频数均不小于 \\(5\\)。
      </div>
    </div>
  </div>

  <!-- 反例微图解 -->
  <div style="background:var(--card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:14px;margin:16px 0;">
    <div style="font-weight:700;font-size:0.85rem;color:var(--text,#1e293b);margin-bottom:8px;">反例微图解：两组比例相同 (\\(\\chi^2=0\\)) vs 小样本伪显著 (\\(n=4\\))</div>
    <div style="width:100%;max-width:520px;margin:0 auto;">
      <svg id="m-chi-trap-fig" viewBox="0 0 520 140" style="width:100%;height:auto;display:block;background:var(--bg-subtle,#f8fafc);border-radius:8px;">
        <!-- Injected by script -->
      </svg>
      <div style="margin-top:6px;font-size:0.8rem;color:var(--text-muted,#475569);line-height:1.5;text-align:center;">
        左图：比例完全相同，堆积图分界齐平（\\(ad=bc\\)），\\(\\chi^2=0\\) 绝对独立基准。<br>
        右图：\\(n=4\\) 小样本极端数据，看似 \\(\\chi^2=4&gt;3.841\\)，实属随机抽样假象，大样本前提崩溃！
      </div>
    </div>
  </div>

  <details class="more">
    <summary>再深一点（可以先跳过）</summary>
    <p><b>公式从哪来</b>：独立时每个格子「应有」的人数是 \\(\\dfrac{\\text{行合计}\\times\\text{列合计}}{n}\\)。把四个格子的 \\(\\dfrac{(\\text{实际}-\\text{应有})^2}{\\text{应有}}\\) 加起来，对 \\(2\\times2\\) 表化简后正好是上面的公式。例 2 里，常吃早餐且犯困应有 \\(\\dfrac{50\\times45}{100}=22.5\\) 人，实际 \\(15\\) 人。</p>
    <p><b>和反证法比</b>：反证法是「假设 \\(\\Rightarrow\\) 推出矛盾 \\(\\Rightarrow\\) 假设一定不对」。独立性检验是「假设 \\(H_0\\) \\(\\Rightarrow\\) 这么大的 \\(\\chi^2\\) 很少见 \\(\\Rightarrow\\) 不太相信 \\(H_0\\)」。很少见不是不可能，所以结论可能错，错的概率由 \\(\\alpha\\) 控制。</p>
    <p><b>临界值从哪来</b>：\\(H_0\\) 成立、\\(n\\) 较大时，\\(\\chi^2\\) 近似服从一种叫「自由度为 \\(1\\) 的 \\(\\chi^2\\) 分布」的分布，表里的数就是它右侧概率为 \\(\\alpha\\) 的位置。「动手」③ 可以亲手抽样看到这一点。</p>
  </details>
</section>'''

script_block = '''<script>
function mChiTab(mode) {
  var fig = document.getElementById('m-chi-fig');
  var ro = document.getElementById('m-chi-readout');
  var bRatio = document.getElementById('btn-chi-ratio');
  var bDiff = document.getElementById('btn-chi-diff');
  var bTest = document.getElementById('btn-chi-test');
  if (!fig || !ro) return;

  var activeStyle = 'padding:4px 10px;font-size:0.8rem;border-radius:6px;border:1px solid #3b82f6;background:#3b82f6;color:#fff;cursor:pointer;';
  var inactiveStyle = 'padding:4px 10px;font-size:0.8rem;border-radius:6px;border:1px solid var(--border,#cbd5e1);background:transparent;color:var(--text,#1e293b);cursor:pointer;';
  if (bRatio) bRatio.style = (mode === 'ratio') ? activeStyle : inactiveStyle;
  if (bDiff) bDiff.style = (mode === 'diff') ? activeStyle : inactiveStyle;
  if (bTest) bTest.style = (mode === 'test') ? activeStyle : inactiveStyle;

  if (mode === 'ratio') {
    fig.innerHTML = `
      <g transform="translate(60, 20)">
        <!-- Axes -->
        <line x1="0" y1="160" x2="400" y2="160" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="0" y1="160" x2="0" y2="10" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="-10" y="165" font-size="11" text-anchor="end" fill="#64748b">0%</text>
        <line x1="-3" y1="160" x2="0" y2="160" stroke="#94a3b8"/>
        <text x="-10" y="90" font-size="11" text-anchor="end" fill="#64748b">50%</text>
        <line x1="-3" y1="85" x2="0" y2="85" stroke="#94a3b8"/>
        <text x="-10" y="15" font-size="11" text-anchor="end" fill="#64748b">100%</text>
        <line x1="-3" y1="10" x2="0" y2="10" stroke="#94a3b8"/>

        <!-- Bar 1: 常吃早餐 (30% 犯困, 70% 不犯困) -->
        <rect x="80" y="10" width="70" height="150" fill="#cbd5e1" rx="4"/>
        <rect x="80" y="115" width="70" height="45" fill="#f87171" rx="4"/>
        <text x="115" y="180" font-size="12" text-anchor="middle" font-weight="700" fill="#1e293b">常吃早餐 (50人)</text>
        <text x="115" y="142" font-size="11" text-anchor="middle" font-weight="700" fill="#fff">30% 困</text>
        <text x="115" y="65" font-size="11" text-anchor="middle" fill="#475569">70% 不困</text>

        <!-- Bar 2: 不常吃早餐 (60% 犯困, 40% 不犯困) -->
        <rect x="230" y="10" width="70" height="150" fill="#cbd5e1" rx="4"/>
        <rect x="230" y="70" width="70" height="90" fill="#ef4444" rx="4"/>
        <text x="265" y="180" font-size="12" text-anchor="middle" font-weight="700" fill="#1e293b">不常吃早餐 (50人)</text>
        <text x="265" y="120" font-size="11" text-anchor="middle" font-weight="700" fill="#fff">60% 困</text>
        <text x="265" y="45" font-size="11" text-anchor="middle" fill="#475569">40% 不困</text>

        <!-- Comparison dashed line and gap indicator -->
        <line x1="150" y1="115" x2="230" y2="115" stroke="#f87171" stroke-dasharray="4" stroke-width="1.5"/>
        <line x1="230" y1="70" x2="310" y2="70" stroke="#ef4444" stroke-dasharray="4" stroke-width="1.5"/>
        <path d="M 315,70 L 325,70 L 325,115 L 315,115" fill="none" stroke="#ef4444" stroke-width="1.5"/>
        <text x="332" y="96" font-size="11" font-weight="700" fill="#ef4444">落差 Δ=30%</text>
      </g>
    `;
    ro.innerHTML = '<b>等高堆积条形图视角</b>：两组总人数不同时直接比比例。「不常吃」犯困比例高达 60%，「常吃」仅 30%，两者分界线出现 30% 显著台阶落差，直观提示两变量高度关联。';
  } else if (mode === 'diff') {
    fig.innerHTML = `
      <g transform="translate(40, 20)">
        <!-- 2x2 grid representing deviation -->
        <rect x="50" y="20" width="160" height="60" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5" rx="6"/>
        <text x="60" y="42" font-size="11" fill="#991b1b" font-weight="700">常吃 且 犯困 (a)</text>
        <text x="60" y="62" font-size="11" fill="#7f1d1d">实际: 15 | 期望: 22.5 (偏离 -7.5)</text>

        <rect x="230" y="20" width="160" height="60" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" rx="6"/>
        <text x="240" y="42" font-size="11" fill="#166534" font-weight="700">常吃 且 不困 (b)</text>
        <text x="240" y="62" font-size="11" fill="#14532d">实际: 35 | 期望: 27.5 (偏离 +7.5)</text>

        <rect x="50" y="95" width="160" height="60" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5" rx="6"/>
        <text x="60" y="117" font-size="11" fill="#166534" font-weight="700">不常吃 且 犯困 (c)</text>
        <text x="60" y="137" font-size="11" fill="#14532d">实际: 30 | 期望: 22.5 (偏离 +7.5)</text>

        <rect x="230" y="95" width="160" height="60" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5" rx="6"/>
        <text x="240" y="117" font-size="11" fill="#991b1b" font-weight="700">不常吃 且 不困 (d)</text>
        <text x="240" y="137" font-size="11" fill="#7f1d1d">实际: 20 | 期望: 27.5 (偏离 -7.5)</text>

        <!-- Cross arrows showing ad vs bc -->
        <line x1="130" y1="50" x2="310" y2="125" stroke="#ef4444" stroke-width="2" stroke-dasharray="3"/>
        <line x1="310" y1="50" x2="130" y2="125" stroke="#3b82f6" stroke-width="2" stroke-dasharray="3"/>
        <circle cx="220" cy="87" r="14" fill="#1e293b"/>
        <text x="220" y="91" font-size="10" fill="#fff" font-weight="700" text-anchor="middle">|Δ|=750</text>
      </g>
    `;
    ro.innerHTML = '<b>频数偏离理论期望视角</b>：若独立，每个单元格理论人数为 (行合计×列合计)/n。四个格子实际观察值均与独立期望偏离达 7.5 人。交叉积之差 |ad-bc| = |300-1050| = 750，平方后放大偏离量！';
  } else {
    fig.innerHTML = `
      <g transform="translate(50, 15)">
        <!-- Axis -->
        <line x1="20" y1="150" x2="420" y2="150" stroke="#94a3b8" stroke-width="1.5"/>
        <text x="20" y="168" font-size="11" text-anchor="middle" fill="#64748b">0</text>
        <text x="140" y="168" font-size="11" text-anchor="middle" fill="#64748b">3.841(5%)</text>
        <text x="220" y="168" font-size="11" text-anchor="middle" fill="#64748b">6.635(1%)</text>
        <text x="320" y="168" font-size="11" text-anchor="middle" fill="#ef4444">10.828(0.1%)</text>

        <!-- Distribution curve of Chi-squared (df=1) -->
        <path d="M 25,25 Q 50,110 100,135 T 220,147 T 400,150" fill="none" stroke="#3b82f6" stroke-width="2.5"/>

        <!-- Shaded Rejection Region >= 6.635 (alpha=0.01) -->
        <path d="M 220,147 L 220,150 L 410,150 L 410,150 Z" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
        <line x1="220" y1="90" x2="220" y2="150" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/>
        <text x="235" y="110" font-size="10" fill="#b91c1c" font-weight="700">拒绝域 (α=0.01)</text>

        <!-- Sample point at 9.091 -->
        <line x1="280" y1="40" x2="280" y2="150" stroke="#dc2626" stroke-width="2"/>
        <circle cx="280" cy="148" r="5" fill="#dc2626"/>
        <rect x="250" y="20" width="80" height="24" rx="4" fill="#dc2626"/>
        <text x="290" y="36" font-size="11" fill="#fff" font-weight="700" text-anchor="middle">χ² ≈ 9.091</text>
        <text x="290" y="70" font-size="10" fill="#dc2626" font-weight="700" text-anchor="middle">落在拒绝域内！</text>
      </g>
    `;
    ro.innerHTML = '<b>小概率反证决策规则</b>：若 H₀ 为真，χ² ≥ 6.635 的概率不足 1%（小概率事件）。实算 χ² = 9.091 &gt; 6.635 强势落入拒绝域，反证法确立结论：<b>有 99% 的把握认为两者有关联</b>！';
  }
}

function initChiTrapFig() {
  var fig = document.getElementById('m-chi-trap-fig');
  if (!fig) return;
  fig.innerHTML = `
    <g transform="translate(30, 15)">
      <!-- Left: 比例一致，χ²=0 -->
      <g transform="translate(0, 0)">
        <text x="90" y="14" font-size="11" font-weight="700" fill="#166534" text-anchor="middle">基准：比例完全相等 (ad=bc)</text>
        <rect x="30" y="25" width="45" height="75" fill="#cbd5e1" rx="3"/>
        <rect x="30" y="55" width="45" height="45" fill="#3b82f6" rx="3"/>
        <text x="52" y="80" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">60%</text>

        <rect x="105" y="25" width="45" height="75" fill="#cbd5e1" rx="3"/>
        <rect x="105" y="55" width="45" height="45" fill="#3b82f6" rx="3"/>
        <text x="127" y="80" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">60%</text>

        <line x1="75" y1="55" x2="105" y2="55" stroke="#166534" stroke-width="2" stroke-dasharray="2"/>
        <text x="90" y="115" font-size="10" fill="#166534" font-weight="700" text-anchor="middle">分界完全齐平 ➜ χ² = 0 (独立)</text>
      </g>

      <!-- Center divider -->
      <line x1="225" y1="10" x2="225" y2="120" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4"/>

      <!-- Right: n=4 小样本伪显著 -->
      <g transform="translate(250, 0)">
        <text x="100" y="14" font-size="11" font-weight="700" fill="#991b1b" text-anchor="middle">陷阱：n=4 样本极小伪显著</text>
        <rect x="40" y="25" width="45" height="75" fill="#cbd5e1" rx="3"/>
        <rect x="40" y="25" width="45" height="75" fill="#ef4444" rx="3"/>
        <text x="62" y="65" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">100%</text>

        <rect x="115" y="25" width="45" height="75" fill="#cbd5e1" rx="3"/>
        <text x="137" y="65" font-size="10" fill="#475569" text-anchor="middle">0%</text>

        <text x="100" y="115" font-size="10" fill="#991b1b" font-weight="700" text-anchor="middle">频数仅2人 ➜ 算得χ²=4不可信！</text>
      </g>
    </g>
  `;
}

// Auto init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    mChiTab('ratio');
    initChiTrapFig();
  });
} else {
  mChiTab('ratio');
  initChiTrapFig();
}
</script>
'''

step2_pattern = re.compile(r'<section class="step" data-title="讲清楚">.*?</section>', re.DOTALL)
assert step2_pattern.search(html), "Could not find Step 2"

# Replace step 2 using lambda to avoid backslash escaping issues
updated_html = step2_pattern.sub(lambda m: new_step2, html)

# Inject script before </body> or right before </section> of step 2 or before </body>
# Let's see where script tag normally is placed
if '</body>' in updated_html:
    updated_html = updated_html.replace('</body>', script_block + '\n</body>')
else:
    updated_html += '\n' + script_block

# Write to e3-8-3.html
with open("highSchool/site/lessons/e3-8-3.html", "w", encoding="utf-8") as f:
    f.write(updated_html)

print("Upgrade written successfully!")
