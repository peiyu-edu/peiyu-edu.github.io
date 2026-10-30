(function () {
  'use strict';
  const $ = id => document.getElementById(id), M = globalThis.LabMath;
  const kind = document.querySelector('[data-lab]').dataset.lab;
  const fmt = n => Math.abs(n) < 1e-12 ? '0.000' : Math.abs(n) < 0.0005 ? n.toExponential(2) : n.toFixed(3);
  const val = id => Number($(id).value);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const line = (x1, y1, x2, y2, cls = 'axis') => `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const text = (x, y, s, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;
  const safeText = (x, y, s, anchor = 'middle') => {
    const padX = Math.max(22, String(s).length * 5.2 + 8);
    const cx = anchor === 'start' ? clamp(x, 8, 352 - padX * 1.4)
      : anchor === 'end' ? clamp(x, padX * 1.4, 352)
      : clamp(x, padX, 360 - padX);
    const cy = clamp(y, 18, 312);
    return `<text x="${cx}" y="${cy}" text-anchor="${anchor}">${s}</text>`;
  };
  const point = (x, y, cls = 'point', drag = '', extra = '') =>
    `<circle class="${cls}" cx="${x}" cy="${y}" r="5"${drag ? ` data-drag="${drag}"` : ''}${extra}/>`;
  const inPlot = (x, y, pad = 16) => x >= pad && x <= 360 - pad && y >= pad && y <= 320 - pad;
  const path = (points, cls) => `<path class="${cls}" d="${points.map((p, i) => `${i ? 'L' : 'M'}${p.join(',')}`).join(' ')}"/>`;
  let expected;
  let degenerateReason = '';
  let dragContext = null;
  const target = html => `<div data-target-readout hidden>${html}</div>`;

  function fitEqualView(pts, padPx = 32, minSpan = 4.8) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const spanX = Math.max(minSpan, maxX - minX);
    const spanY = Math.max(minSpan * 0.8, maxY - minY);
    const availW = 360 - 2 * padPx, availH = 320 - 2 * padPx;
    const scale = Math.min(availW / spanX, availH / spanY);
    return {
      scale,
      px: x => 180 + (x - cx) * scale,
      py: y => 164 - (y - cy) * scale,
      wx: sx => cx + (sx - 180) / scale,
      wy: sy => cy - (sy - 164) / scale
    };
  }

  function setSliderValue(id, rawValue) {
    const el = $(id);
    if (!el) return;
    const min = Number(el.min), max = Number(el.max), step = Number(el.step) || 0.05;
    const snapped = Math.round((clamp(rawValue, min, max) - min) / step) * step + min;
    const fixed = Number(clamp(snapped, min, max).toFixed(4));
    if (Number(el.value) !== fixed) {
      el.value = String(fixed);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function syncTangentControls(reset = false) {
    if (kind !== 'tangent') return;
    if (!M.functions[$('kind').value]) $('kind').value = 'square';
    const fn = M.functions[$('kind').value];
    for (const id of ['a', 'x']) {
      const input = $(id), previous = Number(input.value);
      input.min = fn.min; input.max = fn.max;
      input.value = reset ? (id === 'a' ? 1 : 2) : Math.max(fn.min, Math.min(fn.max, Number.isFinite(previous) ? previous : 1));
    }
  }

  function render() {
    syncTangentControls();
    $('feedback').textContent = '';
    for (const input of document.querySelectorAll('input[type=range]')) $(input.id + '-value').textContent = input.value;
    let graphic = '', read = '', legend = '';
    dragContext = null;
    degenerateReason = '';
    if (kind === 'tangent') {
      const fn = M.functions[$('kind').value], a = val('a'), x = val('x'), k = $('kind').value;
      const q = M.tangent(k, a, x);
      const extrema = [fn.f(fn.min), fn.f(fn.max), q.fa + q.slope * (fn.min - a), q.fa + q.slope * (fn.max - a), 0];
      const low = Math.floor(Math.min(...extrema) - 0.5), high = Math.ceil(Math.max(...extrema) + 0.5);
      const px = t => 35 + 290 * (t - fn.min) / (fn.max - fn.min), py = t => 280 - 240 * (t - low) / (high - low);
      graphic = `<defs><clipPath id="plot"><rect x="35" y="40" width="290" height="240"/></clipPath></defs>`;
      graphic += line(35, py(0), 325, py(0)) + line(px(k === 'square' ? 0 : fn.min), 40, px(k === 'square' ? 0 : fn.min), 280, k === 'log' ? 'axis dashed' : 'axis');
      graphic += `<g clip-path="url(#plot)">` + path(Array.from({ length: 201 }, (_, i) => { const t = fn.min + (fn.max - fn.min) * i / 200; return [px(t), py(fn.f(t))]; }), 'curve');
      graphic += line(px(fn.min), py(q.fa + q.slope * (fn.min - a)), px(fn.max), py(q.fa + q.slope * (fn.max - a)), 'tangent');
      graphic += line(px(x), py(q.fx), px(x), py(q.tx), 'secondary dashed') + `</g>` + point(px(a), py(q.fa)) + point(px(x), py(q.fx));
      graphic += text(35, 305, fn.min) + text(325, 305, fn.max) + text(339, py(0) + 5, 'x') + text(25, 44, high, 'end') + text(25, 279, low, 'end');
      if (k === 'log') graphic += text(35, 22, '左边界 x=0.25', 'start');
      read = `<p class="formula">${k === 'square' ? 'x² ≥ a²+2a(x−a)' : 'ln x ≤ ln a+(x−a)/a'}</p><p>Tₐ(x) = ${fmt(q.fa)} + (${fmt(q.slope)})·(x − (${fmt(a)}))</p><p>f(x)=${fmt(q.fx)}；Tₐ(x)=${fmt(q.tx)}</p>${target(`<p>f(x)−Tₐ(x)=${fmt(q.gap)}</p>`)}<p>等号条件：x=a。当前${Math.abs(x - a) < 1e-9 ? '取等' : '不取等'}。</p>`;
      legend = '绿色实线：函数；棕色直线：切线；蓝色虚线：比较点的差。圆点分别表示接触点和函数比较点。纵向范围随接触点与函数自动调整。' + (k === 'log' ? '虚竖线是显示窗口的左边界 x=0.25，不是 y 轴。' : '') + '目标差值在核对预测后显示。';
      expected = fn.f(x) - (fn.f(a) + fn.df(a) * (x - a));
    } else if (kind === 'cauchy') {
      const q = M.vectors(val('r'), val('s'), val('angle')), px = x => 180 + 43 * x;
      // Equal coordinate scale is essential for angles and lengths.
      const sy = y => 245 - 43 * y;
      graphic = line(25, 245, 335, 245) + line(180, 35, 180, 280);
      graphic += line(180, 245, px(q.u[0]), sy(q.u[1]), 'curve') + line(180, 245, px(q.v[0]), sy(q.v[1]), 'secondary');
      graphic += line(px(q.v[0]), sy(q.v[1]), px(q.v[0]), 245, 'secondary dashed');
      graphic += point(px(q.u[0]), sy(q.u[1])) + point(px(q.v[0]), sy(q.v[1]));
      graphic += text(px(q.u[0]), 272, 'u') + text(px(q.v[0]), sy(q.v[1]) - 14, 'v') + text(162, 303, 'O（共同原点）') + text(338, 240, 'x') + text(180, 27, 'y');
      read = `<p>u=(${fmt(q.u[0])}, 0)<br>v=(${fmt(q.v[0])}, ${fmt(q.v[1])})</p><p>|u|=${fmt(q.nu)}；|v|=${fmt(q.nv)}<br>|u||v|=${fmt(q.product)}</p>${q.cosine === null ? '<p>零向量：夹角无定义。</p>' : ''}${target(`<p>u·v=${fmt(q.dot)}</p><p class="formula">|u·v|=${fmt(Math.abs(q.dot))} ≤ ${fmt(q.product)}=|u||v|</p><p>平方差=${fmt(q.product * q.product - q.dot * q.dot)}。${q.cosine === null ? '零向量：等号成立。' : `cos θ=${fmt(q.cosine)}；${Math.abs(q.determinant) < 1e-8 ? '线性相关，取等。' : '不共线，严格不等。'}`}</p>`)}`;
      legend = '绿色：u；蓝色：v；蓝色虚线：v 到横轴的投影。两坐标轴等比例；短向量仍按实际长度画出，零向量为原点圆点。';
      const dot = q.u.reduce((sum, t, i) => sum + t * q.v[i], 0);
      expected = Math.abs(dot) < 1e-9 ? 'zero' : dot < 0 ? 'negative' : 'positive';
    } else if (kind === 'ptolemy') {
      const angles = [0, val('b'), val('c'), val('d')], q = M.ptolemy(angles), p = q.points.map(([x, y]) => [180 + 108 * x, 160 - 108 * y]);
      graphic = '<circle class="axis" fill="none" cx="180" cy="160" r="108"/>';
      graphic += path([...p, p[0]], 'curve') + line(...p[0], ...p[2], 'secondary dashed') + line(...p[1], ...p[3], 'secondary dashed');
      p.forEach(([x, y], i) => { graphic += point(x, y) + text(180 + (x - 180) * 1.23, 166 + (y - 160) * 1.23, 'ABCD'[i]); });
      read = `<p>半径 R=1；逆时针 A→B→C→D</p><p>AB=${fmt(q.ab)}；BC=${fmt(q.bc)}<br>CD=${fmt(q.cd)}；DA=${fmt(q.da)}<br>AC=${fmt(q.ac)}；BD=${fmt(q.bd)}</p>${target(`<p class="formula">AC·BD = ${fmt(q.lhs)}<br>AB·CD+BC·DA = ${fmt(q.rhs)}</p><p>数值残差：${(q.lhs - q.rhs).toExponential(2)}</p>`)}`;
      legend = '绿色实线：四条边；蓝色虚线：两条对角线。标签顺序固定，角度区间保证相邻点不重合。';
      const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
      expected = dist(q.points[0], q.points[1]) * dist(q.points[2], q.points[3]) + dist(q.points[1], q.points[2]) * dist(q.points[3], q.points[0]);
    } else if (kind === 'menelaus-ceva') {
      const mode = $('mode').value === 'menelaus' ? 'menelaus' : 'ceva';
      const u = val('u'), v = val('v'), ay = val('ay');
      const q = M.menelausCeva(mode, u, v, ay);
      const basePts = [q.A, q.B, q.C, q.E, q.F, [-3.0, -0.4], [2.8, 3.3]];
      if (q.D && Math.abs(q.D[0]) <= 8.5) basePts.push(q.D);
      const view = fitEqualView(basePts, 34, 5.2);
      const toS = pt => [view.px(pt[0]), view.py(pt[1])];
      const [sA, sB, sC, sE, sF] = [q.A, q.B, q.C, q.E, q.F].map(toS);
      graphic = `<defs><clipPath id="plot"><rect x="10" y="10" width="340" height="300"/></clipPath></defs>`;
      graphic += `<g clip-path="url(#plot)">`;
      graphic += line(10, sB[1], 350, sB[1], 'axis dashed');
      graphic += path([sA, sB, sC, sA], 'curve');
      if (mode === 'ceva' && !q.degenerateTriangle && q.D && q.P) {
        const sD = toS(q.D), sP = toS(q.P);
        graphic += line(sA[0], sA[1], sD[0], sD[1], 'secondary');
        graphic += line(sB[0], sB[1], sE[0], sE[1], 'secondary');
        graphic += line(sC[0], sC[1], sF[0], sF[1], 'secondary');
        graphic += point(sD[0], sD[1], 'point alt', '', ' data-point="D"') + point(sP[0], sP[1], 'point warn', '', ' data-point="P"');
        graphic += `</g>`;
        if (inPlot(sD[0], sD[1])) graphic += safeText(sD[0], sD[1] + 20, 'D');
        if (inPlot(sP[0], sP[1])) graphic += safeText(sP[0] + 14, sP[1] - 8, 'P', 'start');
      } else if (mode === 'menelaus' && !q.degenerateTriangle) {
        const dx = q.F[0] - q.E[0], dy = q.F[1] - q.E[1];
        const p1 = toS([q.E[0] - 6 * dx, q.E[1] - 6 * dy]);
        const p2 = toS([q.F[0] + 6 * dx, q.F[1] + 6 * dy]);
        graphic += line(p1[0], p1[1], p2[0], p2[1], 'tangent');
        if (q.D) {
          const sD = toS(q.D);
          graphic += point(sD[0], sD[1], 'point warn', '', ' data-point="D"');
        }
        graphic += `</g>`;
        if (q.D && inPlot(...toS(q.D))) {
          const sD = toS(q.D);
          graphic += safeText(sD[0], sD[1] + 20, 'D');
        } else if (q.parallel) {
          graphic += safeText(180, 26, 'EF ∥ BC（有限平面无交点 D）');
        } else if (q.D) {
          graphic += safeText(180, 26, `延长线交点 D=(${fmt(q.D[0])}, 0) 位于视窗外`);
        }
      } else {
        graphic += `</g>`;
        graphic += safeText(180, 28, '退化姿态：yₐ=0，三顶点 A, B, C 共线');
      }
      graphic += point(sA[0], sA[1], 'point', 'A', ' data-point="A"') + point(sB[0], sB[1], 'point', '', ' data-point="B"') + point(sC[0], sC[1], 'point', '', ' data-point="C"');
      graphic += point(sE[0], sE[1], 'point alt', 'E', ' data-point="E"') + point(sF[0], sF[1], 'point alt', 'F', ' data-point="F"');
      graphic += safeText(sA[0], sA[1] - 12, 'A') + safeText(sB[0] - 8, sB[1] + 20, 'B') + safeText(sC[0] + 8, sC[1] + 20, 'C');
      graphic += safeText(sE[0] + 12, sE[1] - 6, 'E', 'start') + safeText(sF[0] - 12, sF[1] - 6, 'F', 'end');
      const poseNote = q.degenerateTriangle
        ? '<p>当前 yₐ=0：A、B、C 三点共线，三角形退化为直线段，交点 D 与分比 BD/DC 无定义。</p>'
        : q.parallel
        ? '<p>当前 u·v=1：截线 EF ∥ BC，有限平面内无交点 D，底边分比 BD/DC 无有限值（射影无穷远点处无向长度比 BD/DC 极限趋于 1，有向分比 BD⃗/DC⃗ 极限为 −1）。</p>'
        : `<p>${mode === 'ceva' ? `塞瓦共点 P=(${fmt(q.P[0])}, ${fmt(q.P[1])})` : `梅涅劳斯共线交点 D=(${fmt(q.D[0])}, 0)`}</p>`;
      const targetBody = q.degenerateTriangle
        ? '<p class="formula">共线退化：△ABC 退化为直线段，交点 D 与分比 BD/DC 无定义</p>'
        : q.parallel
        ? '<p class="formula">平行边界：u·v=1 时截线 EF ∥ BC，有限平面内无交点 D（BD/DC 无有限定义）</p>'
        : `<p class="formula">(BD/DC)·(CE/EA)·(AF/FB) = ${fmt(q.product)}</p><p>底边分比 BD/DC = ${fmt(q.bd_dc)}；有向积 = ${fmt(q.signed_product)}</p><p>数值残差：${q.residual.toExponential(2)}</p>`;
      read = `<p>模式：${mode === 'ceva' ? '塞瓦定理（AD, BE, CF 共点）' : '梅涅劳斯定理（D, E, F 共线）'}</p><p>CE/EA = ${fmt(q.ce_ea)}；AF/FB = ${fmt(q.af_fb)}</p>${poseNote}${target(targetBody)}`;
      legend = '绿色：△ABC；蓝点 E, F 与绿点 A 可直接拖动或用滑条调节。塞瓦模式展示三线共点 P；梅涅劳斯模式展示截线 EF 与底边 BC 延长线交点 D。';
      if (q.degenerateTriangle) {
        expected = null;
        degenerateReason = '当前 yₐ=0，三顶点 A、B、C 共线，三角形退化，底边交点 D 与分比 BD/DC 无定义（不存在可核对的有限数值）。';
      } else if (q.parallel) {
        expected = null;
        degenerateReason = '当前 u·v=1，截线 EF ∥ BC，有限平面内无交点 D，底边分比 BD/DC 无有限定义（仅在射影无穷远点处无向长度比极限趋于 1，有向分比极限为 −1）。';
      } else {
        expected = q.bd_dc;
      }
      dragContext = {
        view,
        handles: [
          { id: 'A', sx: sA[0], sy: sA[1] },
          { id: 'E', sx: sE[0], sy: sE[1] },
          { id: 'F', sx: sF[0], sy: sF[1] }
        ],
        onDrag(handleId, sx, sy, vRef) {
          const wx = vRef.wx(sx), wy = vRef.wy(sy);
          if (handleId === 'A') {
            setSliderValue('ay', wy);
          } else if (handleId === 'E') {
            const dx = q.A[0] - q.C[0], dy = q.A[1] - q.C[1], len2 = dx * dx + dy * dy;
            if (len2 > 1e-9) {
              const t = clamp(((wx - q.C[0]) * dx + (wy - q.C[1]) * dy) / len2, 0.2, 0.78);
              setSliderValue('u', t / (1 - t));
            }
          } else if (handleId === 'F') {
            const dx = q.B[0] - q.A[0], dy = q.B[1] - q.A[1], len2 = dx * dx + dy * dy;
            if (len2 > 1e-9) {
              const t = clamp(((wx - q.A[0]) * dx + (wy - q.A[1]) * dy) / len2, 0.2, 0.78);
              setSliderValue('v', t / (1 - t));
            }
          }
        }
      };
    } else if (kind === 'radical-axis') {
      const d = val('d'), r1 = val('r1'), r2 = val('r2'), pyVal = val('py');
      const q = M.radicalAxis(d, r1, r2, pyVal);
      const fitPts = [
        [q.O1[0] - r1, -r1], [q.O1[0] + r1, r1],
        [q.O2[0] - r2, -r2], [q.O2[0] + r2, r2],
        [q.O3[0] - q.r3, q.O3[1] - q.r3], [q.O3[0] + q.r3, q.O3[1] + q.r3],
        [-3.2, -2.4], [3.2, 3.2]
      ];
      if (!q.concentric) {
        fitPts.push([q.radicalX, -2.2], [q.radicalX, 2.2]);
      }
      const view = fitEqualView(fitPts, 34, 5.2);
      const px = x => view.px(x), py = y => view.py(y);
      const sO1 = [px(q.O1[0]), py(q.O1[1])], sO2 = [px(q.O2[0]), py(q.O2[1])], sO3 = [px(q.O3[0]), py(q.O3[1])];
      const sP = [px(q.P[0]), py(q.P[1])];
      graphic = `<defs><clipPath id="plot"><rect x="10" y="10" width="340" height="300"/></clipPath></defs>`;
      graphic += line(15, py(0), 345, py(0), 'axis') + line(px(0), 15, px(0), 305, 'axis');
      graphic += `<g clip-path="url(#plot)">`;
      graphic += `<circle data-circle="O1" class="curve" cx="${sO1[0]}" cy="${sO1[1]}" r="${r1 * view.scale}"/>`;
      graphic += `<circle data-circle="O2" class="secondary" cx="${sO2[0]}" cy="${sO2[1]}" r="${r2 * view.scale}"/>`;
      graphic += `<circle data-circle="O3" class="axis dashed" fill="none" cx="${sO3[0]}" cy="${sO3[1]}" r="${q.r3 * view.scale}"/>`;
      if (!q.concentric) {
        graphic += line(px(q.radicalX), 12, px(q.radicalX), 308, 'tangent');
        if (q.radicalCenter) {
          const dx13 = -(q.O3[1] - q.O1[1]), dy13 = q.O3[0] - q.O1[0];
          const rc = q.radicalCenter;
          graphic += line(px(rc[0] - 40 * dx13), py(rc[1] - 40 * dy13), px(rc[0] + 40 * dx13), py(rc[1] + 40 * dy13), 'secondary dashed');
          graphic += point(px(rc[0]), py(rc[1]), 'point', '', ' data-point="R"');
        }
      }
      graphic += `</g>`;
      graphic += point(sO1[0], sO1[1], 'point', '', ' data-point="O1"') + point(sO2[0], sO2[1], 'point alt', 'O2', ' data-point="O2"');
      graphic += point(sP[0], sP[1], 'point warn', 'P', ' data-point="P"');
      graphic += safeText(sO1[0] - 10, sO1[1] + 18, 'O₁', 'end') + safeText(sO2[0] + 10, sO2[1] + 18, 'O₂', 'start');
      graphic += safeText(sO3[0], sO3[1] - 10, 'O₃') + safeText(sP[0] + 12, sP[1] - 6, 'P', 'start');
      if (!q.concentric && q.radicalCenter) {
        const sR = [px(q.radicalCenter[0]), py(q.radicalCenter[1])];
        if (inPlot(sR[0], sR[1])) {
          graphic += safeText(sR[0] - 12, sR[1] + 4, 'R', 'end');
        }
      } else if (q.concentric) {
        graphic += safeText(180, 28, q.relation === 'coincident' ? 'd=0 且 r₁=r₂：两圆完全重合（无唯一根轴）' : 'd=0 且 r₁≠r₂：同心圆无有限根轴');
      }
      const relMap = {
        'secant': '相交（根轴为公共弦所在直线）',
        'externally-tangent': '外切（根轴为内公切线）',
        'internally-tangent': '内切（根轴为公切线）',
        'disjoint-external': '外离（根轴仍存在，为等幂点轨迹）',
        'disjoint-internal': '内含（根轴仍存在，为等幂点轨迹）',
        'concentric-none': '同心不重合（幂差恒为 r₂²−r₁² ≠ 0，无有限根轴）',
        'coincident': '同心且等半径（两圆重合，全平面等幂，无唯一根轴）'
      };
      const tangentNote = q.concentric
        ? ''
        : q.tangent1 !== null
        ? `；切线长 PT₁=PT₂=${fmt(q.tangent1)}${q.tangent1 === 0 ? '（P 在圆上，切线长为 0）' : ''}`
        : `；P 在圆内（Pow₁=Pow₂=${fmt(q.pow1)} &lt; 0，无实切线）`;
      const targetBody = q.concentric
        ? `<p class="formula">${q.relation === 'coincident' ? '两圆重合：全平面 Pow₁(P)=Pow₂(P)，不存在唯一根轴（x₀ 无唯一值）' : `同心无根轴：Pow₁(P)−Pow₂(P) = ${fmt(q.powerGap)} ≠ 0（有限平面内不存在根轴 x₀）`}</p>`
        : `<p class="formula">根轴 x₀ = ${fmt(q.radicalX)}；Pow₁(P)=Pow₂(P)=${fmt(q.pow1)}</p><p>幂差 Pow₁(P)−Pow₂(P) = ${fmt(q.powerGap)}${q.radicalCenter ? `<br>三圆根心 R=(${fmt(q.radicalCenter[0])}, ${fmt(q.radicalCenter[1])})，三圆等幂=${fmt(q.centerPowers[0])}` : ''}</p>`;
      read = `<p>圆心 O₁=(${fmt(q.O1[0])}, 0)，O₂=(${fmt(q.O2[0])}, 0)<br>位置关系：${relMap[q.relation]}</p><p>测试点 P=(${fmt(q.P[0])}, ${fmt(q.P[1])})${tangentNote}</p>${target(targetBody)}`;
      legend = '绿圆 ω₁、蓝圆 ω₂、虚线圆 ω₃；棕色竖线为 ω₁ 与 ω₂ 的根轴，R 为三圆根心。可拖动 O₂ 改变圆心距 d，或拖动 P 沿根轴上下移动。';
      if (q.concentric) {
        expected = null;
        degenerateReason = q.relation === 'coincident'
          ? '当前 d=0 且 r₁=r₂，两圆完全重合，全平面每一点对两圆的圆幂都相等，不存在唯一的根轴横坐标 x₀。'
          : '当前 d=0 且 r₁≠r₂，两圆同心且半径不同，幂差恒为非零常数 r₂²−r₁²，有限平面内不存在根轴 x₀。';
      } else {
        expected = q.radicalX;
      }
      dragContext = {
        view,
        handles: [
          { id: 'P', sx: sP[0], sy: sP[1] },
          { id: 'O2', sx: sO2[0], sy: sO2[1] }
        ],
        onDrag(handleId, sx, sy, vRef) {
          if (handleId === 'O2') {
            const wx = Math.max(0, vRef.wx(sx));
            setSliderValue('d', 2 * wx);
          } else if (handleId === 'P') {
            const wy = vRef.wy(sy);
            setSliderValue('py', wy);
          }
        }
      };
    } else if (kind === 'euler-ninepoint') {
      const ax = val('ax'), ay = val('ay'), b = val('b');
      const q = M.eulerNinePoint(ax, ay, b);
      const pts = [q.A, q.B, q.C, q.G, ...q.midpoints, [-2.6, -0.8], [2.6, 3.2]];
      if (!q.collinear) {
        if (Math.abs(q.O[0]) <= 4.5 && Math.abs(q.O[1]) <= 4.5) pts.push(q.O);
        if (Math.abs(q.H[0]) <= 4.5 && Math.abs(q.H[1]) <= 4.5) pts.push(q.H);
        if (Math.abs(q.N[0]) <= 4.5 && Math.abs(q.N[1]) <= 4.5) pts.push(q.N);
        if (q.R9 <= 3.2 && Math.abs(q.N[0]) <= 3.5 && Math.abs(q.N[1]) <= 3.5) {
          pts.push([q.N[0] - q.R9, q.N[1] - q.R9], [q.N[0] + q.R9, q.N[1] + q.R9]);
        }
      }
      const view = fitEqualView(pts, 32, 5.2);
      const toS = pt => [view.px(pt[0]), view.py(pt[1])];
      const [sA, sB, sC, sG] = [q.A, q.B, q.C, q.G].map(toS);
      graphic = `<defs><clipPath id="plot"><rect x="10" y="10" width="340" height="300"/></clipPath></defs>`;
      graphic += `<g clip-path="url(#plot)">`;
      graphic += path([sA, sB, sC, sA], 'curve');
      if (!q.collinear) {
        const sO = toS(q.O), sH = toS(q.H), sN = toS(q.N);
        graphic += `<circle data-circle="O" class="axis dashed" fill="none" cx="${sO[0]}" cy="${sO[1]}" r="${q.R * view.scale}"/>`;
        graphic += `<circle data-circle="N" class="secondary" fill="none" cx="${sN[0]}" cy="${sN[1]}" r="${q.R9 * view.scale}"/>`;
        if (!q.equilateral) {
          const dx = sH[0] - sO[0], dy = sH[1] - sO[1];
          graphic += line(sO[0] - 0.6 * dx, sO[1] - 0.6 * dy, sH[0] + 0.6 * dx, sH[1] + 0.6 * dy, 'tangent');
        }
        for (const mp of [...q.midpoints, ...q.feet, ...q.eulerPoints]) {
          const sm = toS(mp);
          graphic += `<circle class="point alt" cx="${sm[0]}" cy="${sm[1]}" r="3.2"/>`;
        }
        graphic += point(sO[0], sO[1], 'point warn', '', ' data-point="O"') + point(sN[0], sN[1], 'point alt', '', ' data-point="N"') + point(sH[0], sH[1], 'point warn', '', ' data-point="H"');
      }
      graphic += `</g>`;
      graphic += point(sA[0], sA[1], 'point', 'A', ' data-point="A"') + point(sB[0], sB[1], 'point', '', ' data-point="B"') + point(sC[0], sC[1], 'point', 'C', ' data-point="C"');
      graphic += point(sG[0], sG[1], 'point alt', '', ' data-point="G"');
      graphic += safeText(sA[0], sA[1] - 12, 'A') + safeText(sB[0] - 8, sB[1] + 20, 'B') + safeText(sC[0] + 8, sC[1] + 20, 'C');
      graphic += safeText(sG[0] + 10, sG[1] + 14, 'G', 'start');
      if (!q.collinear) {
        const sO = toS(q.O), sH = toS(q.H), sN = toS(q.N);
        if (inPlot(sO[0], sO[1])) graphic += safeText(sO[0] - 10, sO[1] + 15, 'O', 'end');
        if (inPlot(sN[0], sN[1])) graphic += safeText(sN[0] - 10, sN[1] - 8, 'N', 'end');
        if (inPlot(sH[0], sH[1])) graphic += safeText(sH[0] + 10, sH[1] - 8, 'H', 'start');
        if (!inPlot(sO[0], sO[1]) || !inPlot(sH[0], sH[1]) || !inPlot(sN[0], sN[1])) {
          graphic += safeText(180, 26, '扁平姿态：部分四心移出当前视窗（精确坐标见读数）');
        }
      } else {
        graphic += safeText(
          180,
          28,
          q.coincidentEndpoint
            ? '退化姿态：yₐ=0（|xₐ|=b 顶点重合），九点圆无定义'
            : '退化姿态：yₐ=0（三顶点共线），九点圆无定义'
        );
      }
      const specialNote = q.collinear
        ? q.coincidentEndpoint
          ? `<p>当前 yₐ=0 且 |xₐ|=b（端点重合边界）：顶点 A 与底边端点重合，退化为线段，有限九点圆无有效定义（R₉ 无定义）。注意极限路径区分：若固定 |xₐ|=b 令 yₐ=h→0⁺，每个 h&gt;0 均为直角三角形，九点圆半径 R₉=√(4b²+h²)/4→b/2=${fmt(b / 2)} 有限收敛（不发散），但在 yₐ=0 处三点退化，R₉ 仍无定义。</p>`
          : '<p>当前 yₐ=0 且 xₐ²≠b²：A, B, C 三点共线且互异，有限平面内 O、H、N 与九点圆均无有效定义（R₉ 无定义）；固定当前 xₐ 与 b（满足 xₐ²≠b²）令 yₐ→0⁺ 时，外接圆半径 R~|xₐ²−b²|/(2yₐ)、九点圆半径 R₉~|xₐ²−b²|/(4yₐ)，均→+∞ 发散。</p>'
        : q.equilateral
        ? '<p>当前正三角形对称态：O、G、N、H 四心合一（|OH|=0），欧拉线退化为一点，九点圆与内切圆重合。</p>'
        : q.nearEquilateral
        ? `<p>当前接近正三角形姿态（滑条网格近似 yₐ≈√3·b=${fmt(Math.sqrt(3) * b)}）：O、G、N、H 四心高度接近（|OH|=${fmt(q.oh)}），外接圆半径 R=${fmt(q.R)}；精确 yₐ=√3·b 处四心合一（|OH|=0）。</p>`
        : q.rightTriangle
        ? `<p>当前直角三角形姿态：垂心 H 与直角顶点重合，外心 O 落在斜边中点，外接圆半径 R=${fmt(q.R)}。</p>`
        : `<p>外心 O=(${fmt(q.O[0])}, ${fmt(q.O[1])})，重心 G=(${fmt(q.G[0])}, ${fmt(q.G[1])})<br>外接圆半径 R = ${fmt(q.R)}</p>`;
      read = `<p>顶点 A=(${fmt(q.A[0])}, ${fmt(q.A[1])})，B=(−${fmt(b)}, 0)，C=(${fmt(b)}, 0)</p>${specialNote}${target(
        q.collinear
          ? q.coincidentEndpoint
            ? `<p class="formula">端点重合退化（yₐ=0, |xₐ|=b）：有限九点圆无有效定义（沿 |xₐ|=b 令 yₐ→0⁺ 的直角极限 R₉→b/2=${fmt(b / 2)}，但 yₐ=0 处 R₉ 无定义）</p>`
            : '<p class="formula">共线退化（yₐ=0, xₐ²≠b²）：有限九点圆无有效定义（R₉ 无定义；固定 xₐ²≠b² 令 yₐ→0⁺ 时 R₉→+∞ 发散）</p>'
          : `<p class="formula">九点圆半径 R₉ = ${fmt(q.R9)} = R/2</p><p>垂心 H=(${fmt(q.H[0])}, ${fmt(q.H[1])})；九点圆心 N=(${fmt(q.N[0])}, ${fmt(q.N[1])})</p><p>向量关系：GH⃗ = 2·OG⃗ = −2·GO⃗，OH⃗ = 3·OG⃗<br>欧拉线距：|OG|=${fmt(q.og)}，|ON|=${fmt(q.on)}，|OH|=${fmt(q.oh)}（满足 OG:GN:NH = 2:1:3）<br>九点共圆最大径向残差：${q.maxNinePointDeviation.toExponential(2)}</p>`
      )}`;
      legend = '绿线：△ABC；蓝实圆：九点圆（过三边中点、三高垂足、三欧拉点）；棕线：欧拉线 O–G–N–H。可直接拖动顶点 A 或 C。';
      if (q.collinear) {
        expected = null;
        degenerateReason = q.coincidentEndpoint
          ? `当前 yₐ=0 且 |xₐ|=b（顶点 A 与底边端点重合），三角形退化为线段，有限九点圆半径 R₉ 无有效定义（沿 |xₐ|=b 令 yₐ→0⁺ 时直角三角形极限 R₉→b/2=${fmt(b / 2)} 有限收敛，但在 yₐ=0 处 R₉ 无定义，不判数值吻合）。`
          : '当前 yₐ=0 且 xₐ²≠b²，三顶点 A、B、C 共线退化，有限九点圆半径 R₉ 无有效定义（固定当前 xₐ²≠b² 令 yₐ→0⁺ 时 R₉→+∞ 发散）。';
      } else {
        expected = q.R9;
      }
      dragContext = {
        view,
        handles: [
          { id: 'A', sx: sA[0], sy: sA[1] },
          { id: 'C', sx: sC[0], sy: sC[1] }
        ],
        onDrag(handleId, sx, sy, vRef) {
          const wx = vRef.wx(sx), wy = vRef.wy(sy);
          if (handleId === 'A') {
            setSliderValue('ax', wx);
            setSliderValue('ay', Math.max(0, wy));
          } else if (handleId === 'C') {
            setSliderValue('b', Math.abs(wx));
          }
        }
      };
    }
    $('drawing').innerHTML = graphic;
    $('readout').innerHTML = read;
    $('legend').textContent = legend;
    document.documentElement.dataset.ready = 'true';
  }

  const svg = $('diagram');
  let activeDrag = null;
  let activeDragView = null;
  function clientToSvg(evt) {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return [180, 160];
    return [(evt.clientX - rect.left) * 360 / rect.width, (evt.clientY - rect.top) * 320 / rect.height];
  }
  svg.addEventListener('pointerdown', evt => {
    if (!dragContext) return;
    const [sx, sy] = clientToSvg(evt);
    const directId = evt.target && evt.target.dataset ? evt.target.dataset.drag : '';
    let best = directId && dragContext.handles.some(h => h.id === directId) ? directId : null;
    if (!best) {
      let bestDist = 28;
      for (const h of dragContext.handles) {
        const d = Math.hypot(sx - h.sx, sy - h.sy);
        if (d < bestDist) { bestDist = d; best = h.id; }
      }
    }
    if (best) {
      activeDrag = best;
      activeDragView = dragContext.view;
      try { svg.setPointerCapture(evt.pointerId); } catch {}
      evt.preventDefault();
    }
  });
  svg.addEventListener('pointermove', evt => {
    if (!activeDrag || !dragContext) return;
    const [sx, sy] = clientToSvg(evt);
    dragContext.onDrag(activeDrag, sx, sy, activeDragView || dragContext.view);
  });
  const stopDrag = () => { activeDrag = null; activeDragView = null; };
  svg.addEventListener('pointerup', stopDrag);
  svg.addEventListener('pointercancel', stopDrag);

  $('kind')?.addEventListener('change', () => {
    syncTangentControls(true);
    render();
  });
  $('mode')?.addEventListener('change', render);
  document.querySelectorAll('input[type=range]').forEach(input => input.addEventListener('input', render));
  $('answer').addEventListener('input', () => { $('feedback').textContent = ''; });
  $('check').addEventListener('click', () => {
    if (expected === null) {
      document.querySelectorAll('[data-target-readout]').forEach(el => { el.hidden = false; });
      $('feedback').textContent = `当前为退化姿态：${degenerateReason}`;
      return;
    }
    const raw = $('answer').value;
    if (raw.trim() === '' || (kind !== 'cauchy' && !Number.isFinite(Number(raw)))) {
      $('feedback').textContent = '请先输入有效预测。';
      return;
    }
    const correct = kind === 'cauchy' ? raw === expected : Math.abs(Number(raw) - expected) <= 0.02;
    document.querySelectorAll('[data-target-readout]').forEach(el => { el.hidden = false; });
    const result = kind === 'cauchy' ? ({ positive: '正', negative: '负', zero: '零' })[expected] : fmt(expected);
    const methodLabel = {
      'ptolemy': '四条边的乘积和',
      'tangent': '函数值减切线值',
      'cauchy': '坐标数量积',
      'menelaus-ceva': '坐标交点与三边分比乘积等于 1',
      'radical-axis': '两圆方程相减消去二次项',
      'euler-ninepoint': '外接圆半径折半与九点共圆坐标'
    }[kind] || '坐标计算';
    $('feedback').textContent = `${correct ? '预测吻合' : '再比较一下'}：独立按${methodLabel}计算，结果为 ${result}。`;
  });
  $('theme').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
  });
  window.addEventListener('pageshow', render);
  render();
})();
