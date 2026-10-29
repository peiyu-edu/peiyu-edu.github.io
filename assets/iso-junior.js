/* Junior lesson adapters use the shared IsoBench projection and four shades. */
(function (global) {
  "use strict";
  const PI = Math.PI;
  const profiles = {
    "j6-1": { title: "等距实验台：把展开图折成正方体", fields: [["fold", "折起角度（度）", 0, 90, 1, 45]], note: "拖到 0° 看六个正方形的展开图，拖到 90° 看闭合的正方体。每个面的边长始终是 1；相对的面不会变成相邻面。" },
    "j20-1": { title: "等距实验台：勾股面积立柱拼图", fields: [["a", "直角边 a", 1, 6, 0.5, 3], ["b", "直角边 b", 1, 6, 0.5, 4]], note: "三根立柱的底面分别是直角三角形三边上的正方形，高度相同。比较底面积：两小正方形面积之和等于斜边上正方形的面积；立体外观帮助观察，等式来自勾股定理。" },
    "j29-3": { title: "等距实验台：圆锥与侧面展开扇形", fields: [["r", "底面半径 r", 1, 6, 0.5, 3], ["ratio", "母线长 l / r", 1.25, 4, 0.25, 2]], note: "上图是圆锥，下图是侧面展开后的扇形（分别缩放便于观察）。扇形半径是母线长 l，弧长等于底面周长 2πr，圆心角 θ = 360° × r/l。" }
  };
  function model(id, p) {
    const fields = profiles[id]?.fields;
    if (!fields || fields.some(([key, , min, max]) => !Number.isFinite(p[key]) || p[key] < min || p[key] > max)) throw new RangeError("Invalid junior bench parameters");
    if (id === "j6-1") {
      const t = p.fold * PI / 180, c = Math.cos(t), s = Math.sin(t);
      const quad = f => [[0, 0], [1, 0], [1, 1], [0, 1]].map(([u, v]) => f(u, v));
      return { fold: p.fold, faces: [
        quad((u, v) => [u - 0.5, v - 0.5, 0]),
        quad((u, v) => [0.5 + u * c, v - 0.5, u * s]),
        quad((u, v) => [-0.5 - u * c, v - 0.5, u * s]),
        quad((u, v) => [u - 0.5, 0.5 + v * c, v * s]),
        quad((u, v) => [u - 0.5, -0.5 - v * c, v * s]),
        quad((u, v) => [u - 0.5, -0.5 - c - v * Math.cos(2 * t), s + v * Math.sin(2 * t)])
      ] };
    }
    if (id === "j20-1") {
      const { a, b } = p, c = Math.hypot(a, b);
      return { a, b, c, areas: [a * a, b * b, c * c], plans: [
        [[0, 0], [a, 0], [a, -a], [0, -a]],
        [[0, 0], [0, b], [-b, b], [-b, 0]],
        [[a, 0], [0, b], [b, a + b], [a + b, a]]
      ] };
    }
    const { r, ratio } = p, l = r * ratio;
    return { r, l, h: Math.sqrt(l * l - r * r), theta: 360 * r / l, arc: 2 * PI * r, area: PI * r * l };
  }
  function render(svg, id, m) {
    const I = global.IsoBench, W = 360, H = id === "j29-3" ? 440 : 310;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    if (id === "j6-1") {
      // Fixed camera framing keeps the unit faces at the same scale while folding.
      const P = I.fitProjection([[-1.5, -2.5, 0], [1.5, 1.5, 0], [-0.5, -0.5, 2]], W, H, { pad: 28, azimuth: 35 });
      const faces = m.faces.map((f, i) => ({ f, i, depth: f.reduce((v, p) => v + I.depthOf(p, P), 0) / 4 })).sort((a, b) => a.depth - b.depth);
      svg.innerHTML = faces.map(({ f, i }) => {
        const d = I.pathOf(f.map(p => I.iso(p, P)), true);
        return I.solidSvg({ fill: d, outline: d, shades: [0, 1, 2, 3].map(k => k === i % 4 ? d : "") }, { accent: i === 0, warn: i === 5 });
      }).join("");
    } else if (id === "j20-1") {
      const points = m.plans.flat().flatMap(([x, y]) => [[x, y, 0], [x, y, 0.35]]);
      const P = I.fitProjection(points, W, H, { pad: 25 });
      const parts = m.plans.map((plan, i) => ({ plan, i, depth: plan.reduce((v, [x, y]) => v + I.depthOf([x, y, 0], P), 0) / 4 })).sort((a, b) => a.depth - b.depth);
      svg.innerHTML = parts.map(({ plan, i }) => I.solidSvg(I.extrude(plan, 0, 0.35, P), { accent: i < 2, warn: i === 2 })).join("") +
        I.lineSvg(I.pathOf([[0, 0, 0], [m.a, 0, 0], [0, m.b, 0]].map(p => I.iso(p, P)), true), { tone: "hi", width: 2 });
    } else {
      const P = I.fitProjection([[-m.r, -m.r, 0], [m.r, m.r, 0], [0, 0, m.h]], W, 210, { pad: 25 });
      const angle = m.theta * PI / 180, radius = 93;
      const arc = Array.from({ length: 73 }, (_, i) => {
        const t = -PI / 2 - angle / 2 + angle * i / 72;
        return [180 + radius * Math.cos(t), 335 + radius * Math.sin(t)];
      });
      svg.innerHTML = I.solidSvg(I.coneFrustum(0, 0, m.r, 0, 0, m.h, P, 64), { accent: true }) +
        I.segmentSvg([0, 0, 0], [m.r, 0, 0], P, { warn: true, width: 2 }) +
        I.segmentSvg([m.r, 0, 0], [0, 0, m.h], P, { warn: true, width: 2 }) +
        `<path d="${I.pathOf([[180, 335], ...arc], true)}" fill="var(--iso-accent-soft)" stroke="var(--iso-accent)" stroke-width="2"/>`;
    }
  }
  const fmt = n => Number(n.toFixed(3)).toString();
  function mount(host) {
    const id = host.dataset.juniorIso, profile = profiles[id];
    if (!profile || !global.IsoBench) return;
    host.classList.add("card", "junior-iso");
    host.innerHTML = `<h3>${profile.title}</h3><p>${profile.note}</p><div class="iso-layout"><svg class="iso-fig" role="img" aria-label="${profile.title}"></svg><div class="iso-controls">` +
      profile.fields.map(([key, label, min, max, step, value]) => `<label for="iso-${key}">${label}<output id="iso-${key}-value"></output><input id="iso-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`).join("") +
      `</div></div><p class="iso-readout" aria-live="polite"></p><div class="iso-actions"><button type="button" class="btn ghost" data-iso-reset>重置实验台</button></div>`;
    const update = () => {
      const p = {};
      profile.fields.forEach(([key]) => { p[key] = Number(host.querySelector(`#iso-${key}`).value); host.querySelector(`#iso-${key}-value`).textContent = fmt(p[key]); });
      const m = model(id, p);
      host.isoModel = m;
      render(host.querySelector("svg"), id, m);
      host.querySelector(".iso-readout").textContent = id === "j6-1" ? `折起 ${fmt(m.fold)}°；6 个面，边长均为 1。底面为青色，相对的顶面为橙色。` : id === "j20-1" ?
        `a = ${fmt(m.a)}，b = ${fmt(m.b)}，c ≈ ${fmt(m.c)}；底面积：${fmt(m.areas[0])} + ${fmt(m.areas[1])} = ${fmt(m.areas[2])}。` :
        `r = ${fmt(m.r)}，l = ${fmt(m.l)}；θ = ${fmt(m.theta)}°；弧长 = 底面周长 ≈ ${fmt(m.arc)}；侧面积 ≈ ${fmt(m.area)}（读数取三位小数）。`;
    };
    host.querySelectorAll("input").forEach(s => s.addEventListener("input", update));
    host.querySelector("[data-iso-reset]").addEventListener("click", () => { profile.fields.forEach(([key, , , , , value]) => { host.querySelector(`#iso-${key}`).value = value; }); update(); });
    update();
  }
  global.JuniorIso = { model, render, profiles, mount };
  if (typeof document !== "undefined" && document.querySelectorAll) document.querySelectorAll("[data-junior-iso]").forEach(mount);
})(typeof window !== "undefined" ? window : globalThis);
