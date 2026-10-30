// 位置关系实验台的公共骨架（PY-337，8.4 / 8.5 / 8.6 共用）。
// 每页只写「模式」：参数、滑块、下拉框、按钮，以及 scene(p) 给出的点、线、面、角，
// 和 read(p, sc) 给出的读数行。所有读数都在 read 里由 geom3.js 按当前坐标现算。
import { createStage, tabs, slider, quiz, renderMath, courseStrip, readout, expose, THREE, noteShow, DUR } from './stage.js';
import { faces, polyEdges, inkSegs, polyline, tint } from './solids.js';
import * as G from './geom3.js';

const $ = (s) => document.querySelector(s);
// 课本坐标 (x 向右, y 进深, z 竖直) → 世界坐标（y 朝上）
export const W = (q) => new THREE.Vector3(q[0], q[2], -q[1]);
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** 点名显示用：A1 → A₁ */
export const NAME = (k) => k.replace(/\d/g, (d) => SUB[d]);
/** 点名写进 TeX：A1B → A_1B */
export const TEX = (k) => k.replace(/([A-Z])(\d)/g, '$1_$2');
export const f2 = (x) => x.toFixed(2);
/** 预设目标值吸附到滑块步长上（否则滑块显示 1.6、读数却按 1.55 算） */
export const snap = (x, step = 0.1) => +(Math.round(x / step) * step).toFixed(6);
export const dg = (r) => `${G.deg(r).toFixed(2)}^\\circ`;
export const REL = { same: '重合', parallel: '平行', intersect: '相交', skew: '异面', in: '直线在平面内' };
/** 关系读数行：值是中文关系词，质检按字面比对 */
export const relRow = (label, rel, extra = '') => [label, `<span>${REL[rel]}${extra}</span>`, 'rel', REL[rel]];

export function makeLab({ page, aria, modes, quizItems }) {
  const S = createStage($('#stage'), { onHot: () => paint(), ariaLabel: aria });
  S.shadow.visible = false;
  tabs($('#info'));
  courseStrip($('#course'), page);
  renderMath($('#pane-how'));

  let curKey = new URLSearchParams(location.hash.slice(1)).get('s');
  if (!modes[curKey]) curKey = Object.keys(modes)[0];
  const cur = () => modes[curKey];
  let sc = null;            // 当前场景（scene(p) 的结果）
  let inks = [];            // 可高亮的元素 { id, set(color), color }
  const ctl = {};           // 滑块、下拉框，按键名

  const R = (q) => (typeof q === 'string' ? sc.P[q] : q);
  const col = (c) => (c && S.pal[c]) || c || S.pal.fg;

  function rebuild() {
    S.clear();
    inks = [];
    const m = cur();
    sc = m.scene(m.params);
    const size = boxOf().radius;
    if (sc.solid) {
      const polys = sc.solid.faces.map((f) => f.map((n) => W(R(n))));
      // 只写深度、不上色：让后面的棱、线在被挡住时自动画成虚线
      const depth = faces(S, polys, '#000', 'depth');
      depth.material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      depth.renderOrder = -2;
      const fill = faces(S, polys, '#000', 'fill');
      fill.material = new THREE.MeshBasicMaterial({ color: tint(S, S.pal.a, S.pal.dark ? 0.55 : 0.72), transparent: true, opacity: S.pal.dark ? 0.32 : 0.4, depthWrite: false, side: THREE.DoubleSide });
      S.root.add(depth, fill, inkSegs(S, polyEdges(polys), S.pal.fg, { width: 2.2 }));
    }
    for (const pl of sc.planes || []) {
      const pts = pl.pts.map((q) => W(R(q)));
      const mesh = faces(S, [pts], '#000', pl.id);
      const base = col(pl.color);
      mesh.material = new THREE.MeshBasicMaterial({ color: tint(S, base, 0.35), transparent: true, opacity: 0.38, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
      mesh.renderOrder = 3;
      const edge = inkSegs(S, polyline(pts, true), base, { width: 2.4 });
      S.root.add(mesh, edge);
      inks.push({ id: pl.id, color: base, set: (c) => { edge.userData.setColor(c); mesh.material.color.set(tint(S, c, 0.35)); } });
    }
    // 曲面（圆锥面等）：只上半透明色、不描每个小面的边，轮廓另用 curves 画（PY-362）
    for (const sf of sc.surfaces || []) {
      const mesh = faces(S, sf.polys.map((f) => f.map((q) => W(R(q)))), '#000', sf.id);
      mesh.material = new THREE.MeshBasicMaterial({ color: tint(S, col(sf.color), S.pal.dark ? 0.5 : 0.7), transparent: true, opacity: sf.opacity ?? 0.28, depthWrite: false, side: THREE.DoubleSide });
      mesh.renderOrder = 1;
      S.root.add(mesh);
    }
    for (const sp of sc.spheres || []) {
      const c0 = col(sp.color);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(sp.r, 40, 24), new THREE.MeshBasicMaterial({ color: tint(S, c0, S.pal.dark ? 0.45 : 0.6), transparent: true, opacity: 0.42, depthWrite: false }));
      mesh.position.copy(W(R(sp.c)));
      mesh.renderOrder = 2;
      S.root.add(mesh);
      inks.push({ id: sp.id, color: c0, set: (c) => mesh.material.color.set(tint(S, c, S.pal.dark ? 0.45 : 0.6)) });
    }
    for (const cv of sc.curves || []) {
      const c0 = col(cv.color);
      const g = inkSegs(S, polyline(cv.pts.map((q) => W(R(q))), !!cv.closed), c0, { width: cv.width ?? 3, dashed: !!cv.dashed });
      S.root.add(g);
      inks.push({ id: cv.id, color: c0, set: (c) => g.userData.setColor(c) });
    }
    for (const ln of sc.lines || []) {
      const a = W(R(ln.from)), b = W(R(ln.to)), c0 = col(ln.color);
      let end = b, head = null;
      if (ln.arrow) {
        // 向量：线画到箭头底部，再接一个圆锥箭头（PY-355）
        const d = b.clone().sub(a), L = d.length(), h = Math.min(size * 0.075, L * 0.45);
        if (L > 1e-9) {
          d.normalize();
          end = b.clone().addScaledVector(d, -h);
          head = new THREE.Mesh(new THREE.ConeGeometry(h * 0.36, h, 18), new THREE.MeshBasicMaterial({ color: c0, depthTest: false }));
          head.position.copy(b).addScaledVector(d, -h / 2);
          head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
          head.renderOrder = 9;
        }
      }
      const g = inkSegs(S, [[a, end]], c0, { width: ln.width ?? 4, dashed: !!ln.dashed });
      S.root.add(g);
      if (head) S.root.add(head);
      inks.push({ id: ln.id, color: c0, set: (c) => { g.userData.setColor(c); head?.material.color.set(c); } });
    }
    for (const ar of sc.arcs || []) {
      const O = R(ar.O), u = G.unit(G.sub(R(ar.A), O));
      let v0 = G.sub(R(ar.B), O);
      if (ar.acute && G.dot(u, v0) < 0) v0 = G.mul(v0, -1);   // 两直线所成角：取锐角那一侧
      const th = Math.acos(Math.max(-1, Math.min(1, G.dot(u, G.unit(v0)))));
      const wv = G.sub(v0, G.mul(u, G.dot(v0, u)));
      const w = G.len(wv) > 1e-9 ? G.unit(wv) : u;
      const r = (ar.r ?? 0.16) * size;
      let pts;
      if (Math.abs(th - Math.PI / 2) < 1e-6) {
        const s = r * 0.7;   // 直角：画小方块
        pts = polyline([G.add(O, G.mul(u, s)), G.add(O, G.add(G.mul(u, s), G.mul(w, s))), G.add(O, G.mul(w, s))].map(W));
      } else {
        const arc = [];
        for (let i = 0; i <= 28; i++) { const t = (th * i) / 28; arc.push(W(G.add(O, G.add(G.mul(u, r * Math.cos(t)), G.mul(w, r * Math.sin(t)))))); }
        pts = polyline(arc);
      }
      const g = inkSegs(S, pts, col(ar.color ?? 'no'), { width: 2.4, hidden: false });
      g.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 10; } });
      S.root.add(g);
      inks.push({ id: ar.id, color: col(ar.color ?? 'no'), set: (c) => g.userData.setColor(c) });
    }
    for (const d of sc.dots || []) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(size * 0.028, 16, 12), new THREE.MeshBasicMaterial({ color: S.pal.fg, depthTest: false }));
      mesh.position.copy(W(R(d)));
      mesh.renderOrder = 11;
      S.root.add(mesh);
    }
    paint();
  }

  function paint() {
    for (const k of inks) k.set(S.hot && S.hot === k.id ? S.pal.hl : k.color);
  }

  function boxOf() {
    // 球心取包围盒中心，半径取到最远一点的距离（不用包围盒的外接球：三条坐标轴那种「十字」会被放大到 √3 倍）
    // 平面的四个角也算进去，不然像 1.1「共面向量」那块平面会伸出舞台；曲线上的点、线段两端、球（球心 ± 半径）也算（PY-366）。
    // 曲面（圆锥面）不算：它由母线和截口曲线围出来，轮廓已经在 P 和 curves 里
    const pts = [...Object.values(sc.P), ...(sc.planes || []).flatMap((pl) => pl.pts.map(R)),
      ...(sc.curves || []).flatMap((cv) => cv.pts.map(R)), ...(sc.lines || []).flatMap((ln) => [R(ln.from), R(ln.to)])].map(W);
    const balls = (sc.spheres || []).map((sp) => ({ c: W(R(sp.c)), r: sp.r }));
    const box = new THREE.Box3();
    for (const q of pts) box.expandByPoint(q);
    for (const b of balls) box.union(new THREE.Box3().setFromCenterAndSize(b.c, new THREE.Vector3(2 * b.r, 2 * b.r, 2 * b.r)));
    const c = box.getCenter(new THREE.Vector3());
    let r = 0;
    for (const q of pts) r = Math.max(r, q.distanceTo(c));
    for (const b of balls) r = Math.max(r, b.c.distanceTo(c) + b.r);
    return new THREE.Sphere(c, r);
  }
  function frame(keep) {
    const s = boxOf();
    S.frame(s.center, s.radius * 0.9, keep);
  }

  function measure() {
    const m = cur();
    readout($('#ro'), m.read(m.params, sc));
    $('#ro-note').innerHTML = m.note ? m.note(m.params, sc) : '';
    renderMath($('#ro-note'));
  }

  function update(keep = true) {
    rebuild();
    measure();
    frame(keep);
  }

  function setLabels() {
    const m = cur();
    const P0 = m.scene(m.params).P;
    const cx = Object.values(P0).reduce((s, q) => G.add(s, q), [0, 0, 0]).map((v) => v / Object.keys(P0).length);
    S.setCallouts((m.callouts || []).map((c) => ({
      ...c,
      at: () => { const q = sc.anchors?.[c.at] ?? sc.P[c.at]; return q ? W(q) : null; },
      when: c.when ? () => c.when(m.params, sc) : undefined,
    })));
    S.setTags((m.tags || Object.keys(P0)).map((n) => {
      const q = P0[n] || [0, 0, 0];
      return { text: NAME(n), at: () => (sc.P[n] ? W(sc.P[n]) : null), dx: q[0] + q[1] * 0.4 < cx[0] + cx[1] * 0.4 ? -16 : 6, dy: q[2] < cx[2] ? 20 : -4 };
    }));
  }

  // ---------- 控件 ----------
  let busy = false;
  async function animate(target, ms = DUR.move) {
    if (busy) return;
    busy = true;
    const p = cur().params, from = { ...p };
    const done = await S.tween(ms, (u) => {
      for (const [k, v] of Object.entries(target)) { p[k] = from[k] + (v - from[k]) * u; ctl[k]?.set(p[k]); }
      update();
    }, undefined, () => { Object.assign(p, target); });   // 被打断时同步记到终点
    if (!done) return;
    Object.assign(p, target);
    for (const k of Object.keys(target)) ctl[k]?.set(p[k]);
    update();
    busy = false;
  }

  function mountControls() {
    const host = $('#ctl');
    host.innerHTML = '';
    for (const k of Object.keys(ctl)) delete ctl[k];
    const m = cur();
    for (const sel of m.selects || []) {
      const row = document.createElement('label');
      row.className = 'l3-ctl sel';
      row.innerHTML = `<span>${sel.label}</span><select name="${sel.key}">${sel.options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select>`;
      const s = row.querySelector('select');
      s.value = m.params[sel.key];
      s.addEventListener('change', () => { m.params[sel.key] = s.value; update(); });
      host.appendChild(row);
      ctl[sel.key] = { set: (v) => { s.value = v; } };
    }
    for (const [key, label, min, max, step] of m.sliders || []) {
      ctl[key] = slider(host, { key, label, min, max, step, value: m.params[key], fmt: (x) => (step < 0.1 ? x.toFixed(2) : x.toFixed(1)) }, (k, v) => {
        m.params[k] = v;
        update();
      });
    }
    if (m.buttons?.length) {
      const row = host.appendChild(Object.assign(document.createElement('div'), { className: 'l3-row' }));
      for (const bt of m.buttons) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'l3-btn' + (bt.primary ? ' primary' : '');
        b.textContent = bt.label;
        b.addEventListener('click', () => animate(bt.to(m.params), bt.ms));
        row.appendChild(b);
      }
    }
  }

  function select(key) {
    S.cancelTweens();   // 动画播到一半切模式：停掉旧动画，免得它继续改新模式的滑块
    busy = false;
    curKey = key;
    history.replaceState(null, '', `#s=${key}`);
    for (const c of document.querySelectorAll('#chips button')) c.classList.toggle('on', c.dataset.k === key);
    const m = cur();
    $('#pane-def').innerHTML = m.def;
    renderMath($('#pane-def'));
    mountControls();
    rebuild();
    setLabels();
    measure();
    frame(false);
  }

  const chips = $('#chips');
  const grp = chips.appendChild(Object.assign(document.createElement('span'), { className: 'grp' }));
  for (const [k, m] of Object.entries(modes)) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.k = k; b.textContent = m.name;
    b.addEventListener('click', () => select(k));
    grp.appendChild(b);
  }

  /** 「在模型上看」：切到某个模式并设好参数 */
  // 先停掉正在播的动画（它会把自己的模式记到终点），再写入题目的参数
  const show = (key, vals) => () => { S.cancelTweens(); Object.assign(modes[key].params, vals); noteShow(key, vals); select(key); };
  quiz($('#pane-quiz'), quizItems(show));
  renderMath($('#pane-quiz'));

  select(curKey);
  expose({ page, modes: Object.keys(modes), select: (k) => select(k), key: () => curKey, params: () => cur().params, stage: S });
  return { S, select };
}
