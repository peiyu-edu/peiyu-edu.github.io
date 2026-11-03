// 培玉立体书 · 四个跨页：小学分数、初中勾股定理、高中圆锥曲线、竞赛正方体截面（PY-503）
// 每个跨页：左右页内容、右页上的立体件、面板控件。
// 约定：build(group) 搭立体件；reset() 回到未展开状态；pose(r) 按 0..1 立起；
// enter() 立起后的入场动画；bind(root, panel) 绑定控件；tick() 每帧调用。
import * as THREE from 'three';
import {
  C, V, Cut, inkMaterial, hullMaterial, lineMat, edges, segments, disposeTree,
  tween, stopTweens, ease, reduceMotion,
} from './ink.js';
import { figures } from './pages.js';

const fmt = (x) => String(Math.round(x * 100) / 100);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const frac = (k, n) => `<span class="frac"><span>${k}</span><span>${n}</span></span>`;
const chipsHTML = (items) => `<div class="chips" role="group" aria-label="快速切换">${
  items.map(([label, v]) => `<button data-v="${v}">${label}</button>`).join('')}</div>`;
const sliderHTML = (id, label, min, max, step, value, unit = '') =>
  `<label class="ctl"><span>${label}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output id="${id}-v">${value}${unit}</output></label>`;

/** 把世界坐标里的射线换到 obj 的本地坐标。 */
function localRay(ray, obj) { return ray.clone().applyMatrix4(obj.matrixWorld.clone().invert()); }
/** 射线与本地水平面 y = h 的交点（射线平行时为 null）。 */
function hitY(ray, h) { return ray.intersectPlane(new THREE.Plane(V(0, 1, 0), -h), V()); }

function popScale(group, r) {
  const s = Math.max(0.02, r);
  group.scale.set(0.6 + 0.4 * Math.min(1, s), s, 0.6 + 0.4 * Math.min(1, s));
}

// =====================================================================
// 小学 · 分数：蛋糕平均分成 n 份，取出 k 份
// =====================================================================
const cake = (() => {
  const R = 0.85, SPONGE = 0.3, CREAM = 0.08;
  const st = { n: 8, taken: new Set([0, 1, 2]) };
  let root, wedges = [], grab = null;
  const mats = {
    sponge: inkMaterial({ color: C.hlMark }),
    cream: inkMaterial({ color: C.paper }),
    taken: inkMaterial({ color: C.jade }),
  };
  const inkLine = lineMat(C.ink, 1.5);

  function sector(a0, a1, y0, h) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, R, a0, a1, false);
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 48 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0, 0);
    return g;
  }

  function rebuild() {
    for (const w of wedges) disposeTree(w);
    wedges = [];
    for (let i = 0; i < st.n; i++) {
      const a0 = (i / st.n) * Math.PI * 2 + Math.PI / 2, a1 = ((i + 1) / st.n) * Math.PI * 2 + Math.PI / 2;
      const g = new THREE.Group();
      const sp = sector(a0, a1, 0, SPONGE), cr = sector(a0, a1, SPONGE, CREAM);
      const sponge = new THREE.Mesh(sp, mats.sponge);
      const cream = new THREE.Mesh(cr, mats.cream);
      sponge.castShadow = cream.castShadow = true;
      sponge.receiveShadow = cream.receiveShadow = true;
      g.add(sponge, cream, edges(sp, inkLine, 20), edges(cr, inkLine, 20));
      const m = (a0 + a1) / 2;
      g.userData = { dir: V(Math.cos(m), 0, -Math.sin(m)), o: 0, cream, i };
      sponge.userData.wedge = cream.userData.wedge = i;
      root.add(g);
      wedges.push(g);
    }
    paint();
  }

  function paint() {
    wedges.forEach((w, i) => {
      const on = st.taken.has(i);
      w.userData.target = on ? 1 : 0;
      w.userData.cream.material = on ? mats.taken : mats.cream;
    });
  }
  /** 滑块、按钮只给份数：保留已取的块，多了补最前面没取的，少了去掉最后取的。 */
  function takeCount(k) {
    for (const i of [...st.taken]) if (i >= st.n) st.taken.delete(i);
    for (let i = 0; st.taken.size < k && i < st.n; i++) st.taken.add(i);
    const order = [...st.taken].sort((a, b) => b - a);
    while (st.taken.size > k) st.taken.delete(order.shift());
  }

  let panel, inputs;
  function text() {
    const n = st.n, k = st.taken.size;
    const g = gcd(n, k);
    let why;
    if (k === 0) why = `平均分成 ${n} 份，一份也没取，就是 0。`;
    else if (k === n) why = `平均分成 ${n} 份，${n} 份全取走，正好是 1 个整蛋糕：${n}/${n} = 1。`;
    else {
      why = `平均分成 ${n} 份，取其中 ${k} 份，就是这个蛋糕的 ${k}/${n}。`;
      if (g > 1) why += `把每 ${g} 小份看成一大份，它和 ${k / g}/${n / g} 一样多。`;
    }
    panel.set(frac(k, n), why);
    inputs.n.value = n; inputs.k.max = n; inputs.k.value = k;
    $(`#cake-n-v`).textContent = `${n} 份`;
    $(`#cake-k-v`).textContent = `${k} 份`;
    panel.press((v) => v === `${k}/${n}`);
  }
  const $ = (s) => document.querySelector(s);

  return {
    id: 'primary', tab: '小学', kicker: '小学 · 分数的初步认识',
    legend: '点一块蛋糕把它取走，再点一下放回去；也可以按住往外拖。分母说平均分成了几份，分子说取了几份。',
    link: { href: '../primary/index.html', text: '去小学站 →' },
    left: {
      header: '培玉数学 · 小学 · 三年级', part: '小学篇', title: '分数',
      lead: '把一个整体平均分，就有了分数。',
      paras: [
        '把一个蛋糕平均分成 4 份，每份是它的四分之一，写作 1/4。分母 4 说分成了几份，分子 1 说取了几份。',
        '“平均”两个字最要紧：每份一样大，才能用分数来说。',
      ],
      figure: figures.fractions, caption: '图 1.1　同一个整体，平均分以后才能用分数表示', page: 12,
    },
    right: { section: '1.0　动手', title: '切蛋糕', caption: '图 1.2　点一点：取哪几块都行，分数只看取了几份', page: 13 },
    build(group) { root = new THREE.Group(); group.add(root); rebuild(); },
    reset() { for (const w of wedges) w.userData.o = 0; this.hold = true; },
    pose(r) { popScale(root, r); },
    async enter() { this.hold = false; },
    controls: sliderHTML('cake-n', '分成几份', 2, 12, 1, 8) + sliderHTML('cake-k', '取几份', 0, 8, 1, 3) +
      chipsHTML([['1/2', '1/2'], ['2/4', '2/4'], ['3/8', '3/8'], ['5/6', '5/6']]),
    bind(rootEl, p) {
      panel = p;
      inputs = { n: rootEl.querySelector('#cake-n'), k: rootEl.querySelector('#cake-k') };
      inputs.n.addEventListener('input', () => {
        st.n = Number(inputs.n.value); takeCount(Math.min(st.taken.size, st.n)); rebuild(); text();
      });
      inputs.k.addEventListener('input', () => { takeCount(Number(inputs.k.value)); paint(); text(); });
      for (const b of rootEl.querySelectorAll('.chips button')) {
        b.addEventListener('click', () => {
          const [k, n] = b.dataset.v.split('/').map(Number);
          if (n !== st.n) { st.n = n; st.taken.clear(); takeCount(k); rebuild(); } else { takeCount(k); paint(); }
          text();
        });
      }
      text();
    },
    drag: {
      cursor: 'pointer',
      targets: () => wedges.flatMap((w) => w.children.filter((c) => c.isMesh)),
      highlight() {},
      start(hit) { grab = { i: hit.object.userData.wedge, was: st.taken.has(hit.object.userData.wedge) }; },
      move(ray) {
        if (!grab) return;
        const q = hitY(localRay(ray, root), SPONGE + CREAM);
        if (!q) return;
        const along = q.dot(wedges[grab.i].userData.dir);
        const want = along > R * 0.95 ? true : along < R * 0.55 ? false : grab.was;
        if (want !== st.taken.has(grab.i)) { want ? st.taken.add(grab.i) : st.taken.delete(grab.i); paint(); text(); }
      },
      end(moved) {
        if (grab && !moved) {
          st.taken.has(grab.i) ? st.taken.delete(grab.i) : st.taken.add(grab.i);
          paint(); text();
        }
        grab = null;
      },
    },
    tick() {
      for (const w of wedges) {
        const d = w.userData;
        const target = this.hold ? 0 : d.target;
        d.o = reduceMotion ? target : d.o + (target - d.o) * 0.12;
        w.position.copy(d.dir).multiplyScalar(0.28 * d.o);
        w.position.y = 0.14 * Math.sin(Math.PI * Math.min(1, d.o)) + 0.04 * d.o;
      }
    },
  };
})();

// =====================================================================
// 初中 · 勾股定理：三条边上的正方形像折页一样展开
// =====================================================================
const pythagoras = (() => {
  const S = 0.17, TH = 0.07;
  const st = { a: 3, b: 4, fold: 1 };
  let root, inner, flaps = [], handles = [], grab = null;
  const handleMat = inkMaterial({ color: C.hl });
  const handleGeo = new THREE.SphereGeometry(0.055, 24, 16);
  const triMat = inkMaterial({ color: '#E6E0D2' });
  const sqMats = [inkMaterial({ color: C.jade }), inkMaterial({ color: C.mist }), inkMaterial({ color: C.hlMark })];
  const inkLine = lineMat(C.ink, 1.5);
  const gridLine = lineMat(C.ink, 1, 0.45);

  function labelMesh(text, width) {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 192;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = C.ink;
    ctx.font = `italic 700 120px ${'"Songti SC","Noto Serif CJK SC",serif'}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 100);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const g = new THREE.PlaneGeometry(width, width * 192 / 512);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.userData.tex = tex;
    return m;
  }

  function rebuild() {
    if (inner) { inner.traverse((o) => o.userData.tex?.dispose()); disposeTree(inner); }
    inner = new THREE.Group();
    root.add(inner);
    flaps = [];
    const { a, b } = st;
    // 页面坐标（x 向右、z 向下）：直角顶点 Cc 在原点，A 在 x 轴，B 在 z 轴负方向。
    // 按 a = b = 4 时的范围居中并固定：拖顶点时直角顶点不跟着挪。
    const Cc = V(0, 0, 0), A = V(a, 0, 0), B = V(0, 0, -b);
    inner.position.set(-2 * S, 0, 2 * S);
    // 三角形垫块，比正方形高一点
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(a * S, 0), new THREE.Vector2(0, b * S)]);
    const tg = new THREE.ExtrudeGeometry(shape, { depth: TH * 1.6, bevelEnabled: false });
    tg.rotateX(-Math.PI / 2);
    const tri = new THREE.Mesh(tg, triMat);
    tri.castShadow = tri.receiveShadow = true;
    inner.add(tri, edges(tg, inkLine));
    const m = 0.06, y = TH * 1.6 + 0.003;                  // 直角记号
    inner.add(segments([m, y, 0, m, y, -m, m, y, -m, 0, y, -m], inkLine));
    // 两个锐角顶点上的把手：拖 A 改 a，拖 B 改 b
    handles = [['a', A], ['b', B]].map(([which, P]) => {
      const h = new THREE.Mesh(handleGeo, handleMat);
      h.add(new THREE.Mesh(handleGeo, hullMaterial(0.012)));
      h.position.copy(P).multiplyScalar(S).setY(TH * 1.6 + 0.05);
      h.userData.which = which;
      h.castShadow = true;
      h.visible = st.fold < 0.05;
      inner.add(h);
      return h;
    });
    // 边 P→Q 的外侧正方形：e × 上 = 外法向，所以按 C→A、B→C、A→B 取边
    const sides = [[Cc, A, 'a²', a * a], [B, Cc, 'b²', b * b], [A, B, 'c²', a * a + b * b]];
    sides.forEach(([P, Q, name, area], i) => {
      const L = P.distanceTo(Q);
      const e = V().subVectors(Q, P).normalize();
      const o = V(-e.z, 0, e.x);
      const hinge = new THREE.Group();
      hinge.position.copy(P).multiplyScalar(S);
      hinge.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(e, V(0, 1, 0), o));
      const flap = new THREE.Group();                    // 绕铰链（本地 x 轴）折起
      hinge.add(flap);
      const g = new THREE.BoxGeometry(L * S, TH, L * S);
      g.translate(L * S / 2, TH / 2, L * S / 2);
      const sq = new THREE.Mesh(g, sqMats[i]);
      sq.castShadow = sq.receiveShadow = true;
      flap.add(sq, edges(g, inkLine));
      const grid = [];
      for (let k = 1; k < L - 1e-6; k++) {
        grid.push(k * S, TH + 0.002, 0, k * S, TH + 0.002, L * S);
        grid.push(0, TH + 0.002, k * S, L * S, TH + 0.002, k * S);
      }
      flap.add(segments(grid, gridLine));
      const lab = labelMesh(`${name} = ${fmt(area)}`, Math.min(0.62, L * S * 0.92));
      lab.position.set(L * S / 2, TH + 0.004, L * S / 2);
      // 平放时文字朝向读者：抵消铰链的旋转
      lab.quaternion.copy(hinge.quaternion).invert();
      flap.add(lab);
      inner.add(hinge);
      flaps.push(flap);
    });
    applyFold();
  }

  function applyFold() {
    for (const h of handles) h.visible = st.fold < 0.05;
    flaps.forEach((f, i) => {
      const k = THREE.MathUtils.clamp(st.fold * 1.6 - i * 0.3, 0, 1);  // 依次展开
      f.rotation.x = -Math.PI * 0.97 * ease.inOut(k);
    });
  }

  let panel, inputs;
  const $ = (s) => document.querySelector(s);
  function text() {
    const { a, b } = st, c2 = a * a + b * b, c = Math.sqrt(c2);
    const cs = Number.isInteger(c) ? `${c}` : `√${fmt(c2)} ≈ ${c.toFixed(2)}`;
    panel.set('a² + b² = c²', `${fmt(a)}² + ${fmt(b)}² = ${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}，所以斜边 c = ${cs}。`);
    $('#py-a-v').textContent = fmt(a);
    $('#py-b-v').textContent = fmt(b);
    inputs.a.value = a; inputs.b.value = b;
    panel.press((v) => v === `${a},${b}`);
  }

  return {
    id: 'junior', tab: '初中', kicker: '初中 · 勾股定理',
    legend: '拖三角形两个锐角上的金色圆点改直角边。格子是 1×1 的小方块：两个小正方形的面积加起来，等于大正方形的面积。',
    link: { href: '../junior/index.html', text: '去初中站 →' },
    left: {
      header: '培玉数学 · 初中 · 八年级', part: '初中篇', title: '勾股定理',
      lead: '直角三角形的三条边之间，藏着一个等式。',
      paras: [
        '两条直角边 a、b 的平方和，等于斜边 c 的平方：a² + b² = c²。',
        '古书《周髀算经》里就记着这样的例子：勾是 3、股是 4，弦就是 5。',
        '在每条边上立一个正方形，等式就成了一句关于面积的话。',
      ],
      figure: figures.pythagoras, caption: '图 2.1　三条边上的三个正方形', page: 38,
    },
    right: { section: '2.0　动手', title: '折出三个正方形', caption: '图 2.2　拖动顶点改直角边，数一数格子', page: 39, ring: null },
    build(group) { root = new THREE.Group(); group.add(root); rebuild(); },
    reset() { st.fold = 1; applyFold(); },
    pose(r) { popScale(root, Math.min(1, r * 1.3)); },
    async enter() { await tween(st, 'fold', 0, 1600, applyFold); },
    controls: sliderHTML('py-a', '直角边 a', 1, 4, 0.5, 3) + sliderHTML('py-b', '直角边 b', 1, 4, 0.5, 4) +
      chipsHTML([['勾三股四', '3,4'], ['等腰', '2.5,2.5'], ['1 和 2', '1,2']]),
    bind(rootEl, p) {
      panel = p;
      inputs = { a: rootEl.querySelector('#py-a'), b: rootEl.querySelector('#py-b') };
      for (const key of ['a', 'b']) {
        inputs[key].addEventListener('input', () => { st[key] = Number(inputs[key].value); rebuild(); text(); });
      }
      for (const b of rootEl.querySelectorAll('.chips button')) {
        b.addEventListener('click', () => {
          [st.a, st.b] = b.dataset.v.split(',').map(Number);
          rebuild(); text();
        });
      }
      text();
    },
    drag: {
      cursor: 'grab',
      targets: () => handles.filter((h) => h.visible),
      highlight(on) { for (const h of handles) h.scale.setScalar(on ? 1.35 : 1); },
      start(hit) { grab = hit.object.userData.which ?? hit.object.parent.userData.which; },
      move(ray) {
        if (!grab) return;
        const q = hitY(localRay(ray, inner), TH * 1.6);
        if (!q) return;
        const v = THREE.MathUtils.clamp(Math.round((grab === 'a' ? q.x : -q.z) / S * 2) / 2, 1, 4);
        if (v !== st[grab]) { st[grab] = v; rebuild(); text(); }
      },
      end() { grab = null; },
    },
    tick() {},
  };
})();

// =====================================================================
// 高中 · 圆锥曲线：平面切圆锥
// =====================================================================
const cone = (() => {
  const R = 0.8, H = 1.6;
  const BETA = Math.atan(R / H);                        // 母线与轴的夹角
  const PARA = 90 - THREE.MathUtils.radToDeg(BETA);     // 截面倾角等于它时是抛物线
  const APEX = V(0, H, 0);
  const CUT_H = 0.62 * H;                               // 截面过轴上的这一点
  const GAP = 0.34;
  const st = { alpha: 32, h: CUT_H, gap: GAP, shown: 1 };
  let root, cut;

  function basis(alphaDeg) {
    const r = THREE.MathUtils.degToRad(alphaDeg);
    return { n: V(-Math.sin(r), Math.cos(r), 0), u: V(Math.cos(r), Math.sin(r), 0), w: V(0, 0, 1) };
  }

  // 每条母线 A→B 与截面求交，只留 0 ≤ t ≤ 1 的点（落在这只圆锥上）。
  function sectionPoints(P0, n) {
    const N = 720, pts = [], ok = [];
    for (let i = 0; i < N; i++) {
      const th = (i / N) * Math.PI * 2;
      const d = V(R * Math.cos(th), 0, R * Math.sin(th)).sub(APEX);
      const nd = n.dot(d);
      const t = Math.abs(nd) < 1e-9 ? -1 : n.dot(V().subVectors(P0, APEX)) / nd;
      ok.push(t >= 0 && t <= 1);
      pts.push(APEX.clone().addScaledVector(d, t));
    }
    const firstBad = ok.indexOf(false);
    if (firstBad < 0) return { pts, closed: true };
    let best = [], run = [];
    for (let k = 1; k <= N; k++) {
      const i = (firstBad + k) % N;
      if (ok[i]) run.push(pts[i]);
      else { if (run.length > best.length) best = run; run = []; }
    }
    if (run.length > best.length) best = run;
    return { pts: best, closed: false };
  }

  function classify(alpha, closed) {
    if (alpha < 1) return ['圆', '截面放平，截口处处到轴一样远，是圆。圆是椭圆的特殊情形。'];
    if (Math.abs(alpha - PARA) < 0.6) return ['抛物线', '截面与一条母线平行，截口只朝一边张开，永远合不拢。'];
    if (alpha < PARA) {
      return closed
        ? ['椭圆', '截面比母线平缓，截口绕圆锥一圈，闭合成椭圆。']
        : ['椭圆', '仍是椭圆，只是它太长了，下半截伸出了这只圆锥的底面。'];
    }
    return ['双曲线', '截面比母线还陡，截口张成双曲线。这里只看到一支，另一支在倒过来的对顶圆锥上。'];
  }

  let panel, input, grab = null;
  /** 鼠标射线落在按下点所在的竖直平面 z = grab.z 上，绕 (0, h) 的方位角；离转轴太近时为 null。 */
  function pointerAngle(ray) {
    const q = localRay(ray, root).intersectPlane(new THREE.Plane(V(0, 0, 1), -grab.z), V());
    if (!q) return null;
    const dx = q.x, dy = q.y - st.h;
    return Math.hypot(dx, dy) < 0.12 ? null : Math.atan2(dy, dx);
  }
  function rebuild() {
    const a = Math.abs(st.alpha - PARA) < 0.6 ? PARA : st.alpha;
    const { n, u, w } = basis(a);
    const P0 = V(0, st.h, 0);
    const { pts, closed } = sectionPoints(P0, n);
    const frame = st.shown ? [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) =>
      P0.clone().addScaledVector(u, s * 1.35).addScaledVector(w, t * 1.15)) : null;
    cut.set({ n, P0, gap: st.gap, pts, closed, frame });
    if (panel && st.shown) {
      const [kind, why] = classify(a, closed);
      panel.set(kind, why);
      document.querySelector('#cone-a-v').textContent = `${Math.round(a * 10) / 10}°`;
      input.value = String(st.alpha);
      panel.press((v) => (v === 'para' ? kind === '抛物线' : classify(Number(v), true)[0] === kind && (kind !== '椭圆' || a >= 1)));
    }
  }

  return {
    id: 'high', tab: '高中', kicker: '高中 · 圆锥曲线',
    legend: `按住截面（蓝框）转一转，或拨滑块。这只圆锥的母线倾角约 ${PARA.toFixed(1)}°：α 小于它是椭圆，等于它是抛物线，大于它是双曲线。`,
    link: { href: '../lab3d/e1-3-1.html', text: '去 3D 舞台学椭圆 →' },
    left: {
      header: '培玉数学 · 高中 · 选择性必修第一册', part: '高中篇', title: '圆锥曲线',
      lead: '两千多年前，古希腊人用一个平面去切圆锥，切出了三种曲线。',
      paras: [
        '平面放平，切口是圆；稍稍倾斜，圆被拉长成椭圆；斜到和圆锥的一条母线平行，曲线再也合不拢，成了抛物线；再陡一些，就是双曲线。',
        '它们长得各不相同，却有同一个定义：到一个定点与到一条定直线的距离之比是常数 e。',
      ],
      figure: figures.conics, caption: '图 3.1　离心率 e 决定曲线的样子', page: 62,
    },
    right: { section: '3.0　引子', title: '一刀，四种截口', caption: '图 3.2　平面与圆锥：倾角越大，截口越“张开”', page: 63 },
    build(group) {
      root = new THREE.Group(); group.add(root);
      const g = new THREE.ConeGeometry(R, H, 128, 1, false);
      g.translate(0, H / 2, 0);
      cut = new Cut(root, g, { color: C.jade, hull: 0.016 });
      rebuild();
    },
    reset() { Object.assign(st, { h: H * 1.35, gap: 0, shown: 0 }); rebuild(); },
    pose(r) { popScale(root, r); },
    async enter() {
      st.shown = 1;
      await tween(st, 'h', CUT_H, 1200, rebuild);
      await tween(st, 'gap', GAP, 800, rebuild, { fn: ease.out });
    },
    controls: chipsHTML([['圆', '0'], ['椭圆', '32'], ['抛物线', 'para'], ['双曲线', '76']]) +
      sliderHTML('cone-a', '截面倾角 α', 0, 80, 0.5, 32, '°'),
    bind(rootEl, p) {
      panel = p;
      input = rootEl.querySelector('#cone-a');
      input.addEventListener('input', () => { stopTweens(st, 'alpha'); st.alpha = Number(input.value); rebuild(); });
      for (const b of rootEl.querySelectorAll('.chips button')) {
        b.addEventListener('click', () => {
          stopTweens(st, 'alpha');
          tween(st, 'alpha', b.dataset.v === 'para' ? PARA : Number(b.dataset.v), 700, rebuild);
        });
      }
      rebuild();
    },
    // 截面绕过轴上 P0 的水平线转。按下的点不在 z = 0 上（示意框有宽度、还抬高了半个间隙），
    // 所以在按下点所在的竖直平面里量鼠标绕轴转了多少，只把转角的增量加到 α 上，不会一按就跳。
    drag: {
      cursor: 'move',
      targets: () => (st.shown ? cut.targets() : []),
      highlight(on) { cut.highlight(on); },
      start(hit, ray) {
        stopTweens(st, 'alpha');
        const z = root.worldToLocal(hit.point.clone()).z;
        grab = { z, a0: st.alpha, t0: null };
        grab.t0 = pointerAngle(ray);
      },
      move(ray) {
        if (!grab || grab.t0 === null) return;
        const t = pointerAngle(ray);
        if (t === null) return;
        let d = t - grab.t0;
        d = Math.atan2(Math.sin(d), Math.cos(d));           // 转角增量收到 (-π, π]
        let a = THREE.MathUtils.clamp(grab.a0 + THREE.MathUtils.radToDeg(d), 0, 80);
        if (Math.abs(a - PARA) < 1.5) a = PARA;
        st.alpha = a;
        rebuild();
      },
      end() { grab = null; },
    },
    tick() { cut.tick(); },
  };
})();

// =====================================================================
// 竞赛 · 正方体截面：垂直于体对角线的平面往前推
// =====================================================================
const cube = (() => {
  const L = 1.3, GAP = 0.45;
  const N = V(1, 1, 1).normalize();
  const ORIGIN = V(-L / 2, 0, -L / 2);                  // 体对角线起点
  const st = { k: 1.5, gap: GAP, shown: 1 };            // 截面 x + y + z = k·L（相对 ORIGIN）
  let root, cut, grab = null;
  const corners = [];
  /** 射线（世界坐标）与体对角线 ORIGIN → ORIGIN + (L, L, L) 最近点的参数，0 到 1 是对角线上。 */
  function alongDiagonal(ray) {
    const r = localRay(ray, root), u = V(L, L, L), w0 = V().subVectors(ORIGIN, r.origin);
    const a = u.dot(u), b = u.dot(r.direction), c = r.direction.dot(r.direction);
    const d = u.dot(w0), e = r.direction.dot(w0);
    const den = a * c - b * b;
    return Math.abs(den) < 1e-9 ? 0 : (b * e - c * d) / den;
  }
  for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) corners.push(V(x, y, z).multiplyScalar(L).add(ORIGIN));
  const EDGES = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) if ([1, 2, 4].includes(i ^ j)) EDGES.push([i, j]);

  const snap = (k) => {
    for (const s of [1, 1.5, 2]) if (Math.abs(k - s) < 0.04) return s;
    return k;
  };

  function section(k) {
    const P0 = ORIGIN.clone().addScaledVector(V(1, 1, 1), (k * L) / 3);
    const pts = [];
    for (const [i, j] of EDGES) {
      const p = corners[i], q = corners[j];
      const sp = N.dot(V().subVectors(p, P0)), sq = N.dot(V().subVectors(q, P0));
      if (sp * sq > 0 || sp === sq) continue;
      const x = p.clone().lerp(q, sp / (sp - sq));
      if (!pts.some((o) => o.distanceTo(x) < 1e-6)) pts.push(x);
    }
    const u = V(1, 0, -1).normalize(), w = V().crossVectors(N, u);
    const c = pts.reduce((s, p) => s.add(p), V()).divideScalar(Math.max(1, pts.length));
    pts.sort((p, q) => {
      const a = Math.atan2(w.dot(V().subVectors(p, c)), u.dot(V().subVectors(p, c)));
      const b = Math.atan2(w.dot(V().subVectors(q, c)), u.dot(V().subVectors(q, c)));
      return a - b;
    });
    return { P0, pts, u, w };
  }

  function classify(k) {
    if (k < 1) return ['正三角形', '平面只截到一个顶点旁边的三条棱，截面是正三角形。'];
    if (k === 1) return ['正三角形', '恰好过三个顶点：截面是最大的正三角形，边长是面对角线。'];
    if (k === 1.5) return ['正六边形', '推到正中间，六个顶点都是棱的中点，六条边一样长，是正六边形。'];
    if (k < 2) return ['六边形', '过了三个顶点，平面同时截到六个面，截面变成六边形，长边短边交替。'];
    if (k === 2) return ['正三角形', '又恰好过另一侧的三个顶点：截面变回最大的正三角形。'];
    return ['正三角形', '只剩对面顶点旁边的三条棱，截面又是正三角形。'];
  }

  let panel, input;
  function rebuild() {
    const k = snap(st.k);
    const { P0, pts, u, w } = section(k);
    const frame = st.shown ? [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) =>
      P0.clone().addScaledVector(u, s * L * 0.95).addScaledVector(w, t * L * 0.95)) : null;
    cut.set({ n: N, P0, gap: st.gap, pts, closed: true, frame });
    if (panel && st.shown) {
      const [kind, why] = classify(k);
      panel.set(kind, why);
      document.querySelector('#cube-k-v').textContent = `${Math.round((k / 3) * 100)}%`;
      input.value = String(st.k);
      panel.press((v) => Math.abs(snap(Number(v)) - k) < 1e-9);
    }
  }

  return {
    id: 'olympiad', tab: '竞赛', kicker: '竞赛 · 立体几何 · 截面',
    legend: '按住截面（蓝框或金色截面）沿体对角线推拉，或拨滑块：0% 在一个顶点，100% 在对面的顶点。',
    link: { href: '../olympic/index.html', text: '去竞赛站 →' },
    left: {
      header: '培玉数学 · 竞赛 · 立体几何', part: '竞赛篇', title: '截面',
      lead: '用一个平面去截正方体，截面最多是几边形？',
      paras: [
        '截面的每一条边都落在正方体的某个面上，而且一个面上最多一条。正方体只有六个面，所以截面最多是六边形。',
        '让平面垂直于体对角线往前推：先是三角形，过了三个顶点变成六边形；推到正中间，六个顶点恰好是六条棱的中点。',
      ],
      figure: figures.cubeSection, caption: '图 4.1　垂直于体对角线的中截面是正六边形', page: 96,
    },
    right: { section: '4.0　动手', title: '推一推截面', caption: '图 4.2　截面从一个顶点推到对面的顶点', page: 97, ring: [0.533, 0.49, 300] },
    build(group) {
      root = new THREE.Group();
      root.rotation.y = 0.3;                         // 截面法向朝右上方：上半截往右抬，切口仍朝向读者
      group.add(root);
      const g = new THREE.BoxGeometry(L, L, L);
      g.translate(0, L / 2, 0);
      cut = new Cut(root, g, { color: C.mist, hull: 0, lidEdges: true });
      rebuild();
    },
    reset() { Object.assign(st, { k: 0.02, gap: 0, shown: 0 }); rebuild(); },
    pose(r) { popScale(root, r); },
    async enter() {
      st.shown = 1;
      await tween(st, 'k', 1.5, 1600, rebuild);
      await tween(st, 'gap', GAP, 800, rebuild, { fn: ease.out });
    },
    controls: chipsHTML([['三角形', '0.6'], ['过三顶点', '1'], ['六边形', '1.25'], ['正六边形', '1.5']]) +
      sliderHTML('cube-k', '截面位置', 0.05, 2.95, 0.01, 1.5),
    bind(rootEl, p) {
      panel = p;
      input = rootEl.querySelector('#cube-k');
      input.addEventListener('input', () => { stopTweens(st, 'k'); st.k = Number(input.value); rebuild(); });
      for (const b of rootEl.querySelectorAll('.chips button')) {
        b.addEventListener('click', () => { stopTweens(st, 'k'); tween(st, 'k', Number(b.dataset.v), 700, rebuild); });
      }
      rebuild();
    },
    // 截面沿体对角线移动：取鼠标射线与对角线最近的点，按按下时的位置算增量。
    drag: {
      cursor: 'move',
      targets: () => (st.shown ? cut.targets() : []),
      highlight(on) { cut.highlight(on); },
      start(hit, ray) { stopTweens(st, 'k'); grab = { t0: alongDiagonal(ray), k0: st.k }; },
      move(ray) {
        if (!grab) return;
        st.k = THREE.MathUtils.clamp(grab.k0 + 3 * (alongDiagonal(ray) - grab.t0), 0.05, 2.95);
        rebuild();
      },
      end() { grab = null; },
    },
    tick() { cut.tick(); },
  };
})();

export const SPREADS = [cake, pythagoras, cone, cube];
