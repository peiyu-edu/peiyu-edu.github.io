/**
 * highSchool/site/assets/iso-bench.js
 *
 * 培玉等距数学实验台微内核 (Isometric Math Bench Kit)
 * 吸收自 wheresryan22/anatomy (MIT License: kit/iso-kit.mjs, kit/lathe.mjs, kit/audit.mjs)
 * 零外部依赖，100% 适配培玉 site.css 深浅色主题变量。
 */
(function (global) {
  "use strict";

  const RAD = Math.PI / 180;
  const UNIT = Math.sqrt(1.6);
  const SHADES = 4;

  function injectStyles() {
    if (typeof document === "undefined" || !document.head || document.getElementById("iso-bench-css")) return;
    const style = document.createElement("style");
    style.id = "iso-bench-css";
    style.textContent = `
      .iso-fig {
        --iso-bg: var(--paper, #fbfaf6);
        --iso-card: var(--card, #ffffff);
        --iso-lo: var(--rule, #d8d3c8);
        --iso-mid: var(--ink-3, #6e6a63);
        --iso-hi: var(--ink, #1d1c1a);
        --iso-faint: color-mix(in srgb, var(--ink-3, #6e6a63) 26%, transparent);
        --iso-accent: var(--accent, #1f5f5b);
        --iso-accent-soft: var(--accent-soft, #e3efed);
        --iso-warn: var(--warn, #b84a27);
        --iso-s0: color-mix(in srgb, var(--ink, #1d1c1a) 22%, var(--card, #ffffff));
        --iso-s1: color-mix(in srgb, var(--ink, #1d1c1a) 15%, var(--card, #ffffff));
        --iso-s2: color-mix(in srgb, var(--ink, #1d1c1a) 9%, var(--card, #ffffff));
        --iso-s3: color-mix(in srgb, var(--ink, #1d1c1a) 4%, var(--card, #ffffff));
        --iso-top: var(--card, #ffffff);
        user-select: none;
      }
      .iso-solid-fill { fill: var(--iso-s2); }
      .iso-solid-top { fill: var(--iso-top); }
      .iso-shade-0 { fill: var(--iso-s0); }
      .iso-shade-1 { fill: var(--iso-s1); }
      .iso-shade-2 { fill: var(--iso-s2); }
      .iso-shade-3 { fill: var(--iso-s3); }
      .iso-solid-accent .iso-solid-top { fill: color-mix(in srgb, var(--iso-accent) 16%, var(--card, #ffffff)); }
      .iso-solid-accent .iso-shade-0 { fill: color-mix(in srgb, var(--iso-accent) 42%, var(--card, #ffffff)); }
      .iso-solid-accent .iso-shade-1 { fill: color-mix(in srgb, var(--iso-accent) 32%, var(--card, #ffffff)); }
      .iso-solid-accent .iso-shade-2 { fill: color-mix(in srgb, var(--iso-accent) 24%, var(--card, #ffffff)); }
      .iso-solid-accent .iso-shade-3 { fill: color-mix(in srgb, var(--iso-accent) 18%, var(--card, #ffffff)); }
      .iso-solid-warn .iso-solid-top { fill: color-mix(in srgb, var(--iso-warn) 18%, var(--card, #ffffff)); }
      .iso-solid-warn .iso-shade-0 { fill: color-mix(in srgb, var(--iso-warn) 42%, var(--card, #ffffff)); }
      .iso-solid-warn .iso-shade-1 { fill: color-mix(in srgb, var(--iso-warn) 32%, var(--card, #ffffff)); }
      .iso-solid-warn .iso-shade-2 { fill: color-mix(in srgb, var(--iso-warn) 24%, var(--card, #ffffff)); }
      .iso-solid-warn .iso-shade-3 { fill: color-mix(in srgb, var(--iso-warn) 18%, var(--card, #ffffff)); }
      .iso-crease { fill: none; stroke: var(--iso-faint); stroke-width: 0.85; stroke-linecap: round; stroke-linejoin: round; }
      .iso-outline { fill: none; stroke: var(--iso-mid); stroke-width: 1.15; stroke-linecap: round; stroke-linejoin: round; }
      .iso-tone-lo .iso-outline { stroke: var(--iso-lo); stroke-width: 1.0; }
      .iso-tone-hi .iso-outline { stroke: var(--iso-hi); stroke-width: 1.3; }
      .iso-solid-accent .iso-outline { stroke: var(--iso-accent); stroke-width: 1.45; }
      .iso-solid-warn .iso-outline { stroke: var(--iso-warn); stroke-width: 1.45; }
      .iso-bevel { fill: none; stroke: var(--iso-card); stroke-opacity: 0.7; stroke-width: 0.8; }
    `;
    document.head.appendChild(style);
  }

  function tenth(v) {
    const t = (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
    return t === "-0" ? "0" : t;
  }

  function cameraOf(proj) {
    const a = (proj.azimuth ?? 45) * RAD;
    const e = (proj.elevation ?? 30) * RAD;
    return {
      sinA: Math.sin(a),
      cosA: Math.cos(a),
      sinE: Math.sin(e),
      cosE: Math.cos(e),
      k: (proj.scale ?? 1) * UNIT,
    };
  }

  function iso(pt, proj) {
    const [x, y, z] = pt;
    const ox = proj.origin ? proj.origin[0] : 0;
    const oy = proj.origin ? proj.origin[1] : 0;
    const { sinA, cosA, sinE, cosE, k } = cameraOf(proj);
    return [ox + (x * sinA - y * cosA) * k, oy + ((x * cosA + y * sinA) * sinE - z * cosE) * k];
  }

  function towardViewer(proj) {
    const { sinA, cosA } = cameraOf(proj);
    return [cosA, sinA];
  }

  function depthOf(pt, proj) {
    const [x, y, z] = pt;
    const { sinA, cosA, sinE, cosE } = cameraOf(proj);
    return (x * cosA + y * sinA) * cosE + z * sinE;
  }

  function fitProjection(points, width, height, opts = {}) {
    const azimuth = opts.azimuth ?? 42;
    const elevation = opts.elevation ?? 28;
    const pad = opts.pad ?? 28;
    const unitProj = { scale: 1, origin: [0, 0], azimuth, elevation };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of points) {
      const [sx, sy] = iso(p, unitProj);
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const availW = Math.max(40, width - pad * 2);
    const availH = Math.max(40, height - pad * 2);
    const scale = Math.min(availW / spanX, availH / spanY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      scale,
      azimuth,
      elevation,
      origin: [width / 2 - cx * scale, height / 2 - cy * scale],
    };
  }

  function pathOf(points, closed = false) {
    if (!points || !points.length) return "";
    return points.map(([x, y], i) => `${i ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("") + (closed ? "Z" : "");
  }

  function signedArea(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      a += ax * by - bx * ay;
    }
    return a / 2;
  }

  function oriented(pts) {
    return signedArea(pts) < 0 ? [...pts].reverse() : pts;
  }

  function convexHull(points) {
    const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (sorted.length < 3) return sorted;
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    return [...lower.slice(0, -1), ...upper.slice(0, -1)];
  }

  function runsOf(flags, want) {
    const count = flags.length;
    const runs = [];
    const start = flags.findIndex((f, i) => f !== flags[(i + count - 1) % count]);
    if (start < 0) return flags[0] === want ? [Array.from({ length: count + 1 }, (_, i) => i % count)] : [];
    let run = null;
    for (let s = 0; s < count; s++) {
      const idx = (start + s) % count;
      if (flags[idx] === want) {
        if (!run) run = [idx];
        run.push((idx + 1) % count);
      } else if (run) {
        runs.push(run);
        run = null;
      }
    }
    if (run) runs.push(run);
    return runs;
  }

  function roundedPlan({ x, y, w, d, r = 0 }, steps = 6) {
    const radius = Math.max(0, Math.min(r, w / 2, d / 2));
    const corners = [
      [x + w - radius, y + radius, -90],
      [x + w - radius, y + d - radius, 0],
      [x + radius, y + d - radius, 90],
      [x + radius, y + radius, 180],
    ];
    const out = [];
    for (const [cx, cy, start] of corners) {
      const cnt = radius > 0 ? steps : 0;
      for (let s = 0; s <= cnt; s++) {
        const ang = (start + (cnt ? (90 * s) / cnt : 45)) * RAD;
        out.push([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)]);
      }
    }
    return out;
  }

  function circleRing(cx, cy, radius, steps = 36) {
    return Array.from({ length: steps }, (_, s) => {
      const ang = (s / steps) * Math.PI * 2;
      return [cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)];
    });
  }

  function extrude(ring, z, height, proj, opts = {}) {
    const convex = opts.convex ?? true;
    const count = ring.length;
    const counter = signedArea(ring) > 0;
    const [vx, vy] = towardViewer(proj);
    const { sinA, cosA } = cameraOf(proj);
    const normals = ring.map(([ax, ay], i) => {
      const [bx, by] = ring[(i + 1) % count];
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      return counter ? [dy / len, -dx / len] : [-dy / len, dx / len];
    });
    const facing = normals.map(([nx, ny]) => nx * vx + ny * vy > 1e-9);
    const top = ring.map(([x, y]) => iso([x, y, z + height], proj));
    const bottom = ring.map(([x, y]) => iso([x, y, z], proj));
    const outline = [];
    const crease = [];
    for (const run of runsOf(facing, false)) outline.push(pathOf(run.map((i) => top[i])));
    for (const run of runsOf(facing, true)) {
      crease.push(pathOf(run.map((i) => top[i])));
      if (height > 0) outline.push(pathOf(run.map((i) => bottom[i])));
    }
    if (height > 0) {
      for (let i = 0; i < count; i++) {
        if (facing[(i + count - 1) % count] !== facing[i]) outline.push(pathOf([top[i], bottom[i]]));
      }
    }
    let fill;
    if (convex) {
      fill = pathOf(convexHull([...top, ...bottom]), true);
    } else {
      const parts = [pathOf(oriented(top), true), pathOf(oriented(bottom), true)];
      for (let i = 0; i < count; i++) {
        if (!facing[i]) continue;
        const nxt = (i + 1) % count;
        parts.push(pathOf(oriented([top[i], top[nxt], bottom[nxt], bottom[i]]), true));
      }
      fill = parts.join("");
    }
    const buckets = Array.from({ length: SHADES }, () => []);
    if (height > 0) {
      const [lx, ly] = [-sinA, cosA];
      for (let i = 0; i < count; i++) {
        if (!facing[i]) continue;
        const [nx, ny] = normals[i];
        const lit = (nx * lx + ny * ly + 1) / 2;
        const shade = Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
        const nxt = (i + 1) % count;
        buckets[shade].push(pathOf(oriented([top[i], top[nxt], bottom[nxt], bottom[i]]), true));
      }
    }
    let bevel = "";
    if (opts.bevel && opts.bevel > 0) {
      const by = opts.bevel;
      const inset = ring.map(([x, y], i) => {
        const [ax, ay] = normals[(i + count - 1) % count];
        const [bx, by2] = normals[i];
        const mx = ax + bx;
        const my = ay + by2;
        const len = Math.hypot(mx, my) || 1;
        return [x - (mx / len) * by, y - (my / len) * by];
      });
      const insetTop = inset.map(([x, y]) => iso([x, y, z + height], proj));
      bevel = runsOf(facing, true)
        .map((run) => pathOf([top[run[0]], ...run.slice(1, -1).map((i) => insetTop[i]), top[run[run.length - 1]]]))
        .join("");
    }
    return {
      fill,
      outline: outline.join(""),
      crease: crease.join(""),
      top: pathOf(oriented(top), true),
      shades: buckets.map((p) => p.join("")),
      bevel,
    };
  }

  function slabOf(plan, z, height, proj, steps = 6, bevel = 0.6) {
    return extrude(roundedPlan(plan, steps), z, height, proj, { convex: true, bevel });
  }

  function cylinder(cx, cy, radius, z, height, proj, steps = 36, bevel = 0) {
    return extrude(circleRing(cx, cy, radius, steps), z, height, proj, { convex: true, bevel });
  }

  function coneFrustum(cx, cy, r0, r1, z, height, proj, steps = 36) {
    const ring0 = circleRing(cx, cy, Math.max(0.01, r0), steps);
    const ring1 = circleRing(cx, cy, Math.max(0.01, r1), steps);
    const [vx, vy] = towardViewer(proj);
    const { sinA, cosA } = cameraOf(proj);
    const [lx, ly] = [-sinA, cosA];
    const top = ring1.map(([x, y]) => iso([x, y, z + height], proj));
    const bottom = ring0.map(([x, y]) => iso([x, y, z], proj));
    const facing = ring0.map((_, i) => {
      const ang = ((i + 0.5) / steps) * Math.PI * 2;
      return Math.cos(ang) * vx + Math.sin(ang) * vy > -0.05;
    });
    const buckets = Array.from({ length: SHADES }, () => []);
    for (let i = 0; i < steps; i++) {
      if (!facing[i]) continue;
      const nxt = (i + 1) % steps;
      const ang = ((i + 0.5) / steps) * Math.PI * 2;
      const lit = (Math.cos(ang) * lx + Math.sin(ang) * ly + 1) / 2;
      const shade = Math.min(SHADES - 1, Math.max(0, Math.floor(lit * SHADES)));
      buckets[shade].push(pathOf(oriented([top[i], top[nxt], bottom[nxt], bottom[i]]), true));
    }
    const hull = pathOf(convexHull([...top, ...bottom]), true);
    return {
      fill: hull,
      outline: hull,
      crease: r1 > 0.2 ? pathOf(top, true) : "",
      top: r1 > 0.2 ? pathOf(oriented(top), true) : "",
      shades: buckets.map((p) => p.join("")),
      bevel: "",
    };
  }

  function ringOnZ(cx, cy, radius, z, proj, steps = 36) {
    return pathOf(circleRing(cx, cy, radius, steps).map(([x, y]) => iso([x, y, z], proj)), true);
  }

  function annulusSvg(cx, cy, rOuter, rInner, z, proj, opts = {}) {
    const outerPts = circleRing(cx, cy, Math.max(0.01, rOuter), 40).map(([x, y]) => iso([x, y, z], proj));
    const outerD = pathOf(oriented(outerPts), true);
    let innerD = "";
    if (rInner > 0.1) {
      const innerPts = circleRing(cx, cy, rInner, 40).map(([x, y]) => iso([x, y, z], proj));
      innerD = pathOf([...oriented(innerPts)].reverse(), true);
    }
    const fillColor = opts.warn ? "var(--iso-warn)" : "var(--iso-accent)";
    const fillOp = opts.opacity ?? 0.34;
    return `<g class="iso-annulus">
      <path d="${outerD}${innerD}" fill="${fillColor}" fill-opacity="${fillOp}" fill-rule="evenodd" stroke="${fillColor}" stroke-width="1.5"/>
    </g>`;
  }

  function sideTicks(fromZ, toZ, step, every, x, y, proj, dir = [1, 0]) {
    const minor = [];
    const major = [];
    for (let idx = 0, z = fromZ; z <= toZ + 1e-6; idx++, z += step) {
      const len = idx % every === 0 ? 4.2 : 2.4;
      const p0 = iso([x, y, z], proj);
      const p1 = iso([x + dir[0] * len, y + dir[1] * len, z], proj);
      (idx % every === 0 ? major : minor).push(pathOf([p0, p1]));
    }
    return { minor: minor.join(""), major: major.join("") };
  }

  function solidSvg(paths, opts = {}) {
    injectStyles();
    const cls = [
      "iso-solid",
      `iso-tone-${opts.tone || "mid"}`,
      opts.accent ? "iso-solid-accent" : "",
      opts.warn ? "iso-solid-warn" : "",
      opts.className || "",
    ]
      .filter(Boolean)
      .join(" ");
    const op = opts.opacity !== undefined && opts.opacity < 1 ? ` opacity="${opts.opacity}"` : "";
    const shadesHtml = (paths.shades || [])
      .map((d, i) => (d ? `<path class="iso-shade-${i}" d="${d}"/>` : ""))
      .join("");
    return `<g class="${cls}"${op}>
      ${paths.fill ? `<path class="iso-solid-fill" d="${paths.fill}"/>` : ""}
      ${shadesHtml}
      ${paths.top ? `<path class="iso-solid-top" d="${paths.top}"/>` : ""}
      ${paths.crease ? `<path class="iso-crease" d="${paths.crease}"/>` : ""}
      ${paths.bevel ? `<path class="iso-bevel" d="${paths.bevel}"/>` : ""}
      ${opts.inner || ""}
      ${paths.outline ? `<path class="iso-outline" d="${paths.outline}"/>` : ""}
    </g>`;
  }

  function lineSvg(d, opts = {}) {
    if (!d) return "";
    const stroke = opts.warn ? "var(--iso-warn)" : opts.accent ? "var(--iso-accent)" : opts.tone === "hi" ? "var(--iso-hi)" : opts.tone === "lo" ? "var(--iso-lo)" : "var(--iso-mid)";
    const dash = opts.dashed ? ' stroke-dasharray="5 3.5"' : opts.dotted ? ' stroke-dasharray="1.8 2.8"' : "";
    const w = opts.width ?? 1.25;
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"${dash}/>`;
  }

  function segmentSvg(p0, p1, proj, opts = {}) {
    return lineSvg(pathOf([iso(p0, proj), iso(p1, proj)]), opts);
  }

  function labelSvg(pt3, text, proj, opts = {}) {
    const [sx, sy] = iso(pt3, proj);
    const x = sx + (opts.dx ?? 0);
    const y = sy + (opts.dy ?? 0);
    const anchor = opts.anchor || "middle";
    const fill = opts.warn ? "var(--iso-warn)" : opts.accent ? "var(--iso-accent)" : opts.tone === "muted" ? "var(--iso-mid)" : "var(--iso-hi)";
    const weight = opts.bold !== false ? "600" : "500";
    const size = opts.size || 12.5;
    const strokeHalo = opts.halo !== false ? ` paint-order="stroke" stroke="var(--iso-card)" stroke-width="3.5" stroke-linejoin="round"` : "";
    return `<text x="${tenth(x)}" y="${tenth(y)}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}"${strokeHalo}>${text}</text>`;
  }

  function dialGaugeSvg(cx, cy, r, value, maxVal, title, unit = "") {
    const ratio = Math.max(0, Math.min(1, maxVal > 0 ? value / maxVal : 0));
    const startAng = -210 * RAD;
    const spanAng = 240 * RAD;
    const needleAng = startAng + ratio * spanAng;
    const ticks = [];
    for (let i = 0; i <= 20; i++) {
      const a = startAng + (i / 20) * spanAng;
      const r0 = i % 5 === 0 ? r - 6.5 : r - 4;
      const r1 = r - 1.5;
      ticks.push(`M${tenth(cx + r0 * Math.cos(a))} ${tenth(cy + r0 * Math.sin(a))}L${tenth(cx + r1 * Math.cos(a))} ${tenth(cy + r1 * Math.sin(a))}`);
    }
    const nx = cx + (r - 7) * Math.cos(needleAng);
    const ny = cy + (r - 7) * Math.sin(needleAng);
    return `<g class="iso-dial">
      <circle cx="${tenth(cx)}" cy="${tenth(cy)}" r="${tenth(r + 2.5)}" fill="var(--iso-s1)" stroke="var(--iso-mid)" stroke-width="1.2"/>
      <circle cx="${tenth(cx)}" cy="${tenth(cy)}" r="${tenth(r)}" fill="var(--iso-card)" stroke="var(--iso-lo)" stroke-width="0.9"/>
      <path d="${ticks.join("")}" fill="none" stroke="var(--iso-mid)" stroke-width="1"/>
      <line x1="${tenth(cx)}" y1="${tenth(cy)}" x2="${tenth(nx)}" y2="${tenth(ny)}" stroke="var(--iso-accent)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="${tenth(cx)}" cy="${tenth(cy)}" r="2.6" fill="var(--iso-hi)"/>
      <text x="${tenth(cx)}" y="${tenth(cy + r - 5)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--iso-accent)">${value.toFixed(1)}${unit}</text>
      <text x="${tenth(cx)}" y="${tenth(cy + r + 14)}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--iso-mid)">${title}</text>
    </g>`;
  }

  /**
   * 祖暅原理等高截面测厚实验台 (Cavalieri's Principle Isometric Bench)
   * 左侧：半径 R 的半球，在高度 z = h 处截面为半径 sqrt(R^2 - h^2) 的圆；
   * 右侧：底面半径 R、高 R 的圆柱挖去倒立圆锥，在高度 z = h 处截面为外径 R、内径 h 的圆环；
   * 右栏：双千分表实时读出两截面面积 S_球截 = S_环截 = π(R^2 - h^2)。
   */
  function renderCavalieriBench(svg, desc, outA, outB, valA, valB, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const R = valA / 10; // 2.0 .. 4.5
    const ratio = Math.max(0, Math.min(0.98, valB / 100)); // 0 .. 0.98
    const h = R * ratio;
    const rSphereSec = Math.sqrt(Math.max(0, R * R - h * h));
    const areaSec = Math.PI * (R * R - h * h);
    const maxArea = Math.PI * R * R;
    const vHemi = (2 / 3) * Math.PI * Math.pow(R, 3);

    if (outA) outA.textContent = R.toFixed(1);
    if (outB) outB.textContent = h.toFixed(2) + " (" + Math.round(ratio * 100) + "%)";

    const P = { scale: 1.42, origin: [210, 194], azimuth: 38, elevation: 26 };
    const W = R * 12.2; // world radius ~ 24..55
    const H = W;
    const Zh = ratio * H;
    const rSecW = Math.sqrt(Math.max(0, W * W - Zh * Zh));

    const parts = [];
    // 1. 精密实验台底座 (Base Plate + Feet + Corner Screws)
    const basePlan = { x: -82, y: -44, w: 164, d: 88, r: 6 };
    parts.push(solidSvg(slabOf(basePlan, -8, 8, P, 6, 1.0), { tone: "lo" }));

    // 2. 立柱标尺 (Vertical Height Ruler Post at back-center)
    const postPlan = { x: -4, y: -38, w: 8, d: 8, r: 1.5 };
    parts.push(solidSvg(slabOf(postPlan, 0, H + 10, P, 4, 0.4), { tone: "mid" }));
    const ticks = sideTicks(0, H, H / 10, 5, 4, -34, P, [1, 0]);
    parts.push(lineSvg(ticks.minor, { tone: "lo", width: 0.9 }));
    parts.push(lineSvg(ticks.major, { tone: "hi", width: 1.3 }));

    // 3. 左工位：半球体 (分层车削近似 + 截面圆盘)
    const cx1 = -42, cy1 = 4;
    const bands = 8;
    for (let b = 0; b < bands; b++) {
      const z0 = (b / bands) * H;
      const z1 = ((b + 1) / bands) * H;
      const rb0 = Math.sqrt(Math.max(0.1, W * W - z0 * z0));
      const rb1 = Math.sqrt(Math.max(0.05, W * W - z1 * z1));
      const isBelow = z1 <= Zh + 0.5;
      parts.push(
        solidSvg(coneFrustum(cx1, cy1, rb0, rb1, z0, z1 - z0, P, 32), {
          tone: isBelow ? "mid" : "lo",
          opacity: isBelow ? 0.86 : 0.25,
        })
      );
    }

    // 4. 右工位：圆柱挖去倒圆锥 (外圆柱半透明 + 内部倒锥虚线 + 截面圆环)
    const cx2 = 42, cy2 = 4;
    if (Zh > 0.5) {
      parts.push(solidSvg(cylinder(cx2, cy2, W, 0, Zh, P, 36, 0), { tone: "mid", opacity: 0.78 }));
    }
    parts.push(solidSvg(cylinder(cx2, cy2, W, Zh, Math.max(0.2, H - Zh), P, 36, 0), { tone: "lo", opacity: 0.22 }));
    // 倒圆锥内壁示意线
    parts.push(segmentSvg([cx2, cy2, 0], [cx2 - W, cy2, H], P, { warn: true, dashed: true, width: 1.3 }));
    parts.push(segmentSvg([cx2, cy2, 0], [cx2 + W, cy2, H], P, { warn: true, dashed: true, width: 1.3 }));

    // 5. 激光等高切面框 (Horizontal Laser Slicing Frame at Z = Zh)
    const slicePts = roundedPlan({ x: -76, y: -34, w: 152, d: 76, r: 4 }, 4).map(([x, y]) => iso([x, y, Zh], P));
    parts.push(`<path d="${pathOf(slicePts, true)}" fill="var(--iso-accent)" fill-opacity="0.08" stroke="var(--iso-accent)" stroke-width="1.3" stroke-dasharray="4 3"/>`);

    // 6. 左截面（实心圆盘）与右截面（同面积圆环）高亮
    parts.push(annulusSvg(cx1, cy1, rSecW, 0, Zh, P, { opacity: 0.52 }));
    parts.push(annulusSvg(cx2, cy2, W, Zh, Zh, P, { warn: true, opacity: 0.52 }));

    // 7. 标签与尺寸引线（固定在安全视口内，防止大半径时越界）
    parts.push(`<text x="135" y="264" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--iso-hi)">半球体 (半径 R=${R.toFixed(1)})</text>`);
    parts.push(`<text x="285" y="264" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--iso-hi)">圆柱挖倒圆锥</text>`);
    parts.push(labelSvg([0, -36, Zh], `截面高 h=${h.toFixed(1)}`, P, { dy: -8, accent: true, size: 12 }));

    // 8. 右侧双千分表盘 (Dial Gauges for Live Area Comparison)
    parts.push(dialGaugeSvg(486, 60, 32, areaSec, maxArea, "左：圆截面 S₁", ""));
    parts.push(dialGaugeSvg(486, 198, 32, areaSec, maxArea, "右：圆环面 S₂", ""));
    parts.push(`<text x="486" y="138" text-anchor="middle" font-size="12" font-weight="800" fill="var(--iso-accent)">S₁ = S₂ 恒成立</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>祖暅原理等距实验台（「幂势既同，则积不容异」）</b>：半径 \\(R = ${R.toFixed(1)}\\)，当前截面高度 \\(h = ${h.toFixed(2)}\\)。<br>` +
        `① <b>左工位（半球截面）</b>：由勾股定理，截面圆半径 \\(r_1 = \\sqrt{R^2 - h^2} = ${rSphereSec.toFixed(2)}\\)，面积 \\(S_1 = \\pi(R^2 - h^2) = ${areaSec.toFixed(2)}\\)；<br>` +
        `② <b>右工位（圆柱挖圆锥截面）</b>：外圆半径 \\(R\\)，内圆锥在高度 \\(h\\) 处半径恰为 \\(h\\)，圆环面积 \\(S_2 = \\pi R^2 - \\pi h^2 = \\pi(R^2 - h^2) = ${areaSec.toFixed(2)}\\)；<br>` +
        `③ <b>体积定论</b>：任一高度 \\(h \\in [0, R]\\) 处两截面面积严格相等（右侧双表盘读数同步），故 \\(V_{\\text{半球}} = V_{\\text{柱}} - V_{\\text{锥}} = \\pi R^3 - \\dfrac{1}{3}\\pi R^3 = \\dfrac{2}{3}\\pi R^3 = ${vHemi.toFixed(2)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.6 二面角铰链翻折与三垂线测角仪 (Isometric Dihedral Hinge & Three-Perpendiculars Rig)
   * viewBox: 0 0 560 330
   */
  function renderDihedralBench(svg, desc, thetaOut, thetaVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const rawDeg = Number(thetaVal);
    const deg = Math.max(0, Math.min(180, Number.isFinite(rawDeg) ? rawDeg : 60));
    const rad = deg * RAD;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);
    if (thetaOut) thetaOut.textContent = Math.round(deg) + "°";

    const P = { scale: 1.5, origin: [215, 224], azimuth: 36, elevation: 26 };
    const parts = [];

    // 1. 精密实验台底座
    const basePlan = { x: -78, y: -46, w: 156, d: 92, r: 6 };
    parts.push(solidSvg(slabOf(basePlan, -8, 8, P, 6, 1.0), { tone: "lo" }));

    // 2. 固定水平半平面 α (X ∈ [0, 64], Y ∈ [-36, 36])
    const alphaPlan = { x: 0, y: -36, w: 64, d: 72, r: 2 };
    parts.push(solidSvg(slabOf(alphaPlan, 0, 3, P, 4, 0.4), { tone: "mid", opacity: 0.88 }));

    // 3. 翻转半平面 β (绕铰链轴 X=0, Z=3 旋转 deg)
    const Wb = 62;
    const bx = Wb * cosT;
    const bz = 3 + Wb * sinT;
    const betaCorners = [
      iso([0, -36, 3], P),
      iso([bx, -36, bz], P),
      iso([bx, 36, bz], P),
      iso([0, 36, 3], P),
    ];
    parts.push(
      `<path d="${pathOf(betaCorners, true)}" fill="var(--iso-accent)" fill-opacity="0.22" stroke="var(--iso-accent)" stroke-width="1.8"/>`
    );

    // 4. 铰链公共棱 l (沿 Y 轴)
    parts.push(segmentSvg([0, -42, 3], [0, 42, 3], P, { width: 2.8 }));

    // 5. 二面角平面角 ∠AOB 与三垂线直角三角形 △BOB' (在 Y = 0 截面)
    const Lr = 48;
    const ax = Lr, az = 3;
    const px = Lr * cosT, pz = 3 + Lr * sinT;
    // 射线 OA ⊥ l (在平面 α 内)
    parts.push(segmentSvg([0, 0, 3], [ax, 0, az], P, { accent: true, width: 2.2 }));
    // 射线 OB ⊥ l (在平面 β 内)
    parts.push(segmentSvg([0, 0, 3], [px, 0, pz], P, { warn: true, width: 2.4 }));
    // 铅垂投影线 BB' (点 B 到平面 α 的垂线)
    if (deg > 4 && deg < 176) {
      parts.push(segmentSvg([px, 0, pz], [px, 0, 3], P, { warn: true, dashed: true, width: 1.5 }));
      parts.push(segmentSvg([0, 0, 3], [px, 0, 3], P, { dashed: true, width: 1.3 }));
    }

    // 6. 3D 量角弧线 (从 0 到 deg)
    if (deg >= 3) {
      const arcSteps = 20;
      const arcPts = [];
      for (let i = 0; i <= arcSteps; i++) {
        const a = (deg * i / arcSteps) * RAD;
        arcPts.push(iso([24 * Math.cos(a), 0, 3 + 24 * Math.sin(a)], P));
      }
      parts.push(`<path d="${pathOf(arcPts)}" fill="none" stroke="var(--iso-warn)" stroke-width="2"/>`);
    }

    // 7. 固定安全区标注（绝不随滑块极端值重叠或越界）
    parts.push(`<text x="215" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">等距双平板铰链台 · 二面角平面角 ∠AOB = ${Math.round(deg)}°</text>`);
    parts.push(`<text x="115" y="298" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--iso-hi)">公共棱 l (OA⊥l, OB⊥l)</text>`);
    parts.push(`<text x="295" y="298" text-anchor="middle" font-size="12.5" font-weight="700" fill="var(--iso-accent)">固定基准半平面 α</text>`);

    // 8. 右侧双表盘：二面角 θ 与射影面积比 |cos θ|
    parts.push(dialGaugeSvg(486, 82, 34, deg, 180, "二面角 θ", "°"));
    parts.push(dialGaugeSvg(486, 224, 34, Math.abs(cosT), 1, "射影面积比 |cosθ|", ""));
    parts.push(`<text x="486" y="156" text-anchor="middle" font-size="12" font-weight="800" fill="var(--iso-accent)">S' = S·|cosθ|</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      const kind = deg === 90 ? "直二面角 (α ⊥ β)" : (deg < 90 ? "锐二面角" : "钝二面角");
      desc.innerHTML =
        `<b>等距铰链翻折测角台（${kind}）</b>：当前翻折角 \\(\\theta = ${Math.round(deg)}^\\circ\\)，\\(\\cos\\theta = ${cosT.toFixed(3)}\\)。<br>` +
        `① <b>平面角三要素</b>：棱 \\(l\\) 上公共垂足 \\(O\\)，\\(OA \\subset \\alpha\\) 且 \\(OA \\perp l\\)，\\(OB \\subset \\beta\\) 且 \\(OB \\perp l\\)，则 \\(\\angle AOB = \\theta\\)；<br>` +
        `② <b>三垂线与射影面积</b>：点 \\(B\\) 到平面 \\(\\alpha\\) 的铅垂高 \\(h = OB\\sin\\theta\\)，射影面积比 \\(S'/S = |\\cos\\theta| = ${Math.abs(cosT).toFixed(3)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.1 旋转体车削成型与轴截面实验台 (Isometric Lathe & Solids of Revolution Bench)
   * viewBox: 0 0 560 320
   */
  function renderLatheBench(svg, desc, outY, outX, rotYVal, rotXVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const az = Number.isFinite(Number(rotYVal)) ? Number(rotYVal) : 35;
    const elRaw = Number.isFinite(Number(rotXVal)) ? Number(rotXVal) : 20;
    const el = Math.max(14, Math.min(52, Math.abs(elRaw) < 14 ? 22 : Math.abs(elRaw)));
    if (outY) outY.textContent = Math.round(az) + "°";
    if (outX) outX.textContent = Math.round(elRaw) + "°";

    const P = { scale: 1.38, origin: [216, 206], azimuth: az, elevation: el };
    const parts = [];

    // 1. 精密车床等距底座
    const bedPlan = { x: -96, y: -34, w: 192, d: 68, r: 6 };
    parts.push(solidSvg(slabOf(bedPlan, -8, 8, P, 6, 1.0), { tone: "lo" }));

    // 2. 左工位 (X = -58)：矩形绕直角边旋转生成【圆柱】
    const cx1 = -58, r1 = 20, h1 = 48;
    parts.push(solidSvg(cylinder(cx1, 0, r1, 0, h1, P, 32, 0.4), { tone: "mid", opacity: 0.78 }));
    parts.push(segmentSvg([cx1, 0, -4], [cx1, 0, h1 + 8], P, { accent: true, dashed: true, width: 1.5 }));
    const rectGen = [[cx1, 0, 0], [cx1 + r1, 0, 0], [cx1 + r1, 0, h1], [cx1, 0, h1]].map((pt) => iso(pt, P));
    parts.push(`<path d="${pathOf(rectGen, true)}" fill="var(--iso-accent)" fill-opacity="0.28" stroke="var(--iso-accent)" stroke-width="1.8"/>`);

    // 3. 中工位 (X = 0)：直角三角形绕直角边旋转生成【圆锥】
    const cx2 = 0, r2 = 22, h2 = 52;
    parts.push(solidSvg(coneFrustum(cx2, 0, r2, 0.2, 0, h2, P, 32), { tone: "mid", opacity: 0.80 }));
    parts.push(segmentSvg([cx2, 0, -4], [cx2, 0, h2 + 8], P, { warn: true, dashed: true, width: 1.5 }));
    const triGen = [[cx2, 0, 0], [cx2 + r2, 0, 0], [cx2, 0, h2]].map((pt) => iso(pt, P));
    parts.push(`<path d="${pathOf(triGen, true)}" fill="var(--iso-warn)" fill-opacity="0.28" stroke="var(--iso-warn)" stroke-width="1.8"/>`);

    // 4. 右工位 (X = 58)：直角梯形绕垂直于底边的腰旋转生成【圆台】
    const cx3 = 58, r3b = 22, r3t = 11, h3 = 46;
    parts.push(solidSvg(coneFrustum(cx3, 0, r3b, r3t, 0, h3, P, 32), { tone: "mid", opacity: 0.80 }));
    parts.push(segmentSvg([cx3, 0, -4], [cx3, 0, h3 + 8], P, { accent: true, dashed: true, width: 1.5 }));
    const trapGen = [[cx3, 0, 0], [cx3 + r3b, 0, 0], [cx3 + r3t, 0, h3], [cx3, 0, h3]].map((pt) => iso(pt, P));
    parts.push(`<path d="${pathOf(trapGen, true)}" fill="var(--iso-accent)" fill-opacity="0.26" stroke="var(--iso-accent)" stroke-width="1.8"/>`);

    // 5. 顶部与底部固定安全区标注
    parts.push(`<text x="216" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">旋转体车削成型实验台 · 母线旋转一周生成曲面</text>`);
    parts.push(`<text x="92" y="296" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">① 矩形绕边 → 圆柱</text>`);
    parts.push(`<text x="216" y="296" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">② 直角三角形 → 圆锥</text>`);
    parts.push(`<text x="340" y="296" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">③ 直角梯形 → 圆台</text>`);

    // 6. 右侧双表盘：水平旋转角 θ 与俯仰观察角
    parts.push(dialGaugeSvg(492, 78, 33, az, 360, "方位角 θ", "°"));
    parts.push(dialGaugeSvg(492, 218, 33, el, 60, "俯仰角 |φ|", "°"));
    parts.push(`<text x="492" y="150" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">三工位同轴车削</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>旋转体车削成型实验台（方位角 \\(\\theta = ${Math.round(az)}^\\circ\\)）</b>：<br>` +
        `① <b>圆柱工位</b>：矩形绕其一边所在直线旋转一周，平行于轴的边生成圆柱侧面（母线平行且相等），垂直于轴的边生成上下平行圆面；<br>` +
        `② <b>圆锥工位</b>：直角三角形绕一条<b>直角边</b>旋转一周（绝不可绕斜边，绕斜边生成同底双圆锥！），斜边生成圆锥侧面；<br>` +
        `③ <b>圆台工位</b>：直角梯形绕<b>垂直于两底的腰</b>旋转一周，斜腰生成圆台侧面，各母线延长后必交于旋转轴上同一点。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 6.2 平面向量的运算：滑轨拉车向量数量积测功台 (Isometric Linear Track & Dot-Product Work Rig)
   * viewBox: 0 0 560 380 (or 0 0 560 320)
   */
  function renderWorkBench(svg, thetaVal, forceVal, dispVal) {
    injectStyles();
    svg.classList.add("iso-fig");
    const deg = Math.max(0, Math.min(180, Number.isFinite(Number(thetaVal)) ? Number(thetaVal) : 40));
    const F = Math.max(0.5, Math.min(6, Number(forceVal) || 4.0));
    const S = Math.max(0.5, Math.min(6, Number(dispVal) || 4.0));
    const rad = deg * RAD;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);
    const projVal = F * cosT;
    const projLen = Math.abs(projVal);
    const work = F * S * cosT;

    const vb = (svg.getAttribute("viewBox") || "0 0 560 380").trim().split(/\s+/).map(Number);
    const vh = vb[3] || 380;
    const oy = vh > 340 ? 226 : 198;
    const P = { scale: 1.48, origin: [216, oy], azimuth: 35, elevation: 25 };
    const parts = [];

    // 1. 精密导轨基座 (Base Plate + Linear Guide Rail along X)
    parts.push(solidSvg(slabOf({ x: -86, y: -36, w: 172, d: 72, r: 6 }, -8, 8, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -76, y: -8, w: 152, d: 16, r: 2 }, 0, 4, P, 4, 0.3), { tone: "mid" }));

    // 2. 滑块小车 (Carriage at origin X = -24, moving +S along +X)
    const ox = -24;
    const sx = ox + S * 15;
    parts.push(solidSvg(slabOf({ x: ox - 12, y: -14, w: 24, d: 28, r: 3 }, 4, 10, P, 4, 0.5), { tone: "mid" }));

    // 3. 位移向量 b (沿导轨 +X 方向)
    parts.push(segmentSvg([ox, 0, 14], [sx, 0, 14], P, { accent: true, width: 2.8 }));

    // 4. 拉力向量 a (从滑块中心 [ox, 0, 14] 以夹角 deg 斜拉，位于 X-Z 平面)
    const fScale = 15;
    const fx = ox + F * fScale * cosT;
    const fz = 14 + F * fScale * sinT;
    parts.push(segmentSvg([ox, 0, 14], [fx, 0, fz], P, { warn: true, width: 2.8 }));

    // 5. 铅垂正交投影线与有向投影段 (|a| cos θ)
    if (Math.abs(sinT) > 0.04) {
      parts.push(segmentSvg([fx, 0, fz], [fx, 0, 14], P, { warn: true, dashed: true, width: 1.5 }));
    }
    parts.push(segmentSvg([ox, 0, 11], [fx, 0, 11], P, { warn: cosT < 0, accent: cosT >= 0, width: 3.2 }));

    // 6. 夹角量角弧
    if (deg >= 3) {
      const arcPts = [];
      for (let i = 0; i <= 18; i++) {
        const a = (deg * i / 18) * RAD;
        arcPts.push(iso([ox + 18 * Math.cos(a), 0, 14 + 18 * Math.sin(a)], P));
      }
      parts.push(`<path d="${pathOf(arcPts)}" fill="none" stroke="var(--iso-warn)" stroke-width="1.8"/>`);
    }

    // 7. 固定安全区文字标注
    const kind = Math.abs(deg - 90) < 1 ? "垂直零功 (W = 0)" : (deg < 90 ? "锐角正功 (W > 0)" : "钝角负功 (W < 0)");
    parts.push(`<text x="216" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">滑轨拉车向量数量积测功台 · ${kind}</text>`);
    parts.push(`<text x="115" y="${vh - 22}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">拉力 |a|=${F.toFixed(1)}, 夹角 θ=${Math.round(deg)}°</text>`);
    parts.push(`<text x="305" y="${vh - 22}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">有向投影 |a|cosθ=${projVal.toFixed(2)} (投影长 ${projLen.toFixed(2)})</text>`);

    // 8. 右侧双千分表：有向投影与数量积做功
    parts.push(dialGaugeSvg(490, 82, 34, projVal, F, "有向投影 |a|cosθ", ""));
    parts.push(dialGaugeSvg(490, 226, 34, work, F * S, "数量积 a·b (功 W)", ""));
    parts.push(`<text x="490" y="156" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">W = |a||b|cosθ</text>`);

    svg.innerHTML = parts.join("\n");
  }

  /**
   * 1.1 空间向量及其运算：空间向量三维平行六面体合成台 (Isometric 3D Parallelepiped Vector Rig)
   * viewBox: 0 0 560 330
   */
  function renderParallelepipedBench(svg, desc, axVal, ayVal, azVal, bxVal, byVal, bzVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const ax = Number.isFinite(Number(axVal)) ? Number(axVal) : 3;
    const ay = Number.isFinite(Number(ayVal)) ? Number(ayVal) : 1;
    const az = Number.isFinite(Number(azVal)) ? Number(azVal) : 3;
    const bx = Number.isFinite(Number(bxVal)) ? Number(bxVal) : 2;
    const by = Number.isFinite(Number(byVal)) ? Number(byVal) : 4;
    const bz = Number.isFinite(Number(bzVal)) ? Number(bzVal) : 0;

    const sx = ax + bx, sy = ay + by, sz = az + bz;
    const lenA = Math.hypot(ax, ay, az);
    const lenB = Math.hypot(bx, by, bz);
    const lenS = Math.hypot(sx, sy, sz);
    const dot = ax * bx + ay * by + az * bz;

    const P = { scale: 1.44, origin: [208, 212], azimuth: 36, elevation: 26 };
    const k = 9.5; // world units per vector unit
    const parts = [];

    // 1. 等距实验台基座与 Z 轴立柱标尺
    parts.push(solidSvg(slabOf({ x: -64, y: -54, w: 156, d: 118, r: 6 }, -8, 8, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -58, y: -48, w: 7, d: 7, r: 1.2 }, 0, 62, P, 4, 0.3), { tone: "mid" }));

    const O = [0, 0, 2];
    const A = [ax * k, ay * k, 2 + az * k];
    const B = [bx * k, by * k, 2 + bz * k];
    const S = [sx * k, sy * k, 2 + sz * k];
    const G = [sx * k, sy * k, 2]; // 地面投影点

    // 2. 地面投影平行四边形与铅垂高度柱
    const groundPoly = [O, [ax * k, ay * k, 2], G, [bx * k, by * k, 2]].map((pt) => iso(pt, P));
    parts.push(`<path d="${pathOf(groundPoly, true)}" fill="var(--iso-accent)" fill-opacity="0.14" stroke="var(--iso-lo)" stroke-width="1.2" stroke-dasharray="3 3"/>`);
    parts.push(segmentSvg(A, S, P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg(B, S, P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg(G, S, P, { warn: true, dashed: true, width: 1.5 }));

    // 3. 向量 a、向量 b 与体对角线合向量 a+b
    parts.push(segmentSvg(O, A, P, { accent: true, width: 2.6 }));
    parts.push(segmentSvg(O, B, P, { width: 2.6 }));
    parts.push(segmentSvg(O, S, P, { warn: true, width: 3.2 }));

    // 4. 固定安全区标注
    parts.push(`<text x="212" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">三维平行六面体合成台 · a+b = (${sx}, ${sy}, ${sz})</text>`);
    parts.push(`<text x="112" y="306" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">向量 a=(${ax},${ay},${az}), |a|=${lenA.toFixed(2)}</text>`);
    parts.push(`<text x="304" y="306" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">合向量 |a+b|=${lenS.toFixed(2)}, a·b=${dot.toFixed(1)}</text>`);

    // 5. 右侧双千分表：合向量模长与数量积
    parts.push(dialGaugeSvg(490, 80, 34, lenS, 14, "合模长 |a+b|", ""));
    parts.push(dialGaugeSvg(490, 224, 34, dot, 40, "数量积 a·b", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">空间平行四边形/体对角线</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>等距平行六面体合成台</b>：\\(\\boldsymbol{a}=(${ax},${ay},${az})\\)，\\(\\boldsymbol{b}=(${bx},${by},${bz})\\)。<br>` +
        `① <b>三维对角线合成</b>：\\(\\boldsymbol{a}+\\boldsymbol{b}=(${sx},${sy},${sz})\\)，模长 \\(|\\boldsymbol{a}+\\boldsymbol{b}|=\\sqrt{${sx}^2+${sy}^2+${sz}^2}=${lenS.toFixed(2)}\\)；<br>` +
        `② <b>空间数量积验证</b>：\\(\\boldsymbol{a}\\cdot\\boldsymbol{b}=${dot.toFixed(2)}\\)，满足 \\(|\\boldsymbol{a}+\\boldsymbol{b}|^2 = |\\boldsymbol{a}|^2 + |\\boldsymbol{b}|^2 + 2\\boldsymbol{a}\\cdot\\boldsymbol{b} = ${(lenS * lenS).toFixed(1)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 1.2 空间向量基本定理：三维正交基底 Gantry 龙门定位仪 (Isometric XYZ Gantry Plotter & Coplanarity Rig)
   * viewBox: 0 0 560 320
   */
  function renderGantryBench(svg, desc, xVal, yVal, zVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const x = Number.isFinite(Number(xVal)) ? Number(xVal) : 0.35;
    const y = Number.isFinite(Number(yVal)) ? Number(yVal) : 0.35;
    const z = Number.isFinite(Number(zVal)) ? Number(zVal) : 0.30;
    const sum = x + y + z;
    const isCop = Math.abs(sum - 1.0) <= 0.025;
    const normP = Math.hypot(x, y, z);

    const P = { scale: 1.42, origin: [206, 214], azimuth: 38, elevation: 26 };
    const L = 58; // basis unit length in world coords
    const parts = [];

    // 1. 花岗岩精密三坐标测量机底座 (CMM / Gantry Base)
    parts.push(solidSvg(slabOf({ x: -24, y: -24, w: 108, d: 108, r: 5 }, -8, 8, P, 6, 1.0), { tone: "lo" }));

    // 2. 三个基向量端点 A(L,0,0), B(0,L,0), C(0,0,L) 与四点共面斜面 △ABC
    const ptO = [0, 0, 0];
    const ptA = [L, 0, 0];
    const ptB = [0, L, 0];
    const ptC = [0, 0, L];
    const triABC = [ptA, ptB, ptC].map((pt) => iso(pt, P));
    parts.push(
      `<path d="${pathOf(triABC, true)}" fill="${isCop ? "var(--iso-accent)" : "var(--iso-s2)"}" fill-opacity="${isCop ? "0.28" : "0.14"}" stroke="${isCop ? "var(--iso-accent)" : "var(--iso-mid)"}" stroke-width="${isCop ? "2.2" : "1.3"}" stroke-dasharray="${isCop ? "" : "4 3"}"/>`
    );

    // 3. 龙门三轴正交阶梯导轨：O -> Px(xL,0,0) -> Pxy(xL,yL,0) -> P(xL,yL,zL)
    const px = x * L, py = y * L, pz = z * L;
    const ptPx = [px, 0, 0];
    const ptPxy = [px, py, 0];
    const ptP = [px, py, pz];

    // X 轴导轨梁 + Y 轴横梁 + Z 轴探针立柱
    parts.push(segmentSvg(ptO, ptA, P, { width: 2.0 }));
    parts.push(segmentSvg(ptO, ptB, P, { width: 2.0 }));
    parts.push(segmentSvg(ptO, ptC, P, { width: 2.0 }));
    parts.push(segmentSvg(ptO, ptPx, P, { accent: true, width: 2.8 }));
    parts.push(segmentSvg(ptPx, ptPxy, P, { accent: true, dashed: true, width: 2.2 }));
    parts.push(segmentSvg(ptPxy, ptP, P, { warn: true, dashed: true, width: 2.2 }));
    // 合向量 OP
    parts.push(segmentSvg(ptO, ptP, P, { warn: true, width: 3.0 }));

    // 探针球头
    const p2d = iso(ptP, P);
    parts.push(`<circle cx="${tenth(p2d[0])}" cy="${tenth(p2d[1])}" r="5" fill="var(--iso-warn)" stroke="var(--iso-card)" stroke-width="1.6"/>`);

    // 4. 固定安全区文字标注
    parts.push(`<text x="210" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">三维基底 Gantry 龙门定位仪 · OP = ${x.toFixed(2)}e₁ + ${y.toFixed(2)}e₂ + ${z.toFixed(2)}e₃</text>`);
    parts.push(`<text x="115" y="298" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">三轴滑台阶梯：(x,y,z)=(${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)})</text>`);
    parts.push(`<text x="310" y="298" text-anchor="middle" font-size="12" font-weight="700" fill="${isCop ? "var(--iso-accent)" : "var(--iso-warn)"}">系数和 x+y+z = ${sum.toFixed(2)} ${isCop ? "✓ 四点共面" : "✗ 不共面"}</text>`);

    // 5. 右侧双表盘：系数和 x+y+z 与正交模长
    parts.push(dialGaugeSvg(490, 78, 33, sum, 2.0, "系数和 x+y+z", ""));
    parts.push(dialGaugeSvg(490, 218, 33, normP, 2.0, "正交模长 |OP|", ""));
    parts.push(`<text x="490" y="150" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">x+y+z=1 ⇔ P∈面ABC</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>三维龙门基底定位台</b>：探针坐标唯一分解为 \\(\\overrightarrow{OP} = ${x.toFixed(2)}\\boldsymbol{e}_1 + ${y.toFixed(2)}\\boldsymbol{e}_2 + ${z.toFixed(2)}\\boldsymbol{e}_3\\)。<br>` +
        `<b>四点共面判据</b>：系数和 \\(x + y + z = ${sum.toFixed(2)}\\) — ` +
        (isCop
          ? `<span class="badge ok">✔ 恰好等于 1：探针端点 P 严格落在斜面 △ABC 上（P, A, B, C 四点共面）！</span>`
          : `<span class="badge bad">● 不等于 1：探针端点 P 偏离斜面 △ABC（四点不共面）。</span>`);
      if (renderMath) renderMath();
    }
  }

  /**
   * 1.4 空间向量的应用：空间法向量与点面距离激光测距台 (Isometric Normal Vector & Point-to-Plane Laser Rig)
   * viewBox: 0 0 560 320
   */
  function renderNormalDistBench(svg, desc, hVal, offXVal, ptA, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const h = Number.isFinite(Number(hVal)) ? Number(hVal) : 2.5;
    const offX = Number.isFinite(Number(offXVal)) ? Number(offXVal) : 0.5;
    const ax = Array.isArray(ptA) ? Number(ptA[0]) || 0 : 0;
    const ay = Array.isArray(ptA) ? Number(ptA[1]) || 0 : 0;
    const px = offX, py = 0.4, pz = h;
    const dx = px - ax, dy = py - ay, dz = pz;
    const lenAP = Math.hypot(dx, dy, dz);

    const P = { scale: 1.48, origin: [212, 206], azimuth: 36, elevation: 25 };
    const k = 16; // world units per math unit
    const parts = [];

    // 1. 等距精密基准平板 α (z = 0)
    parts.push(solidSvg(slabOf({ x: -72, y: -56, w: 148, d: 116, r: 6 }, -10, 0, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -64, y: -48, w: 132, d: 100, r: 4 }, 0, 4, P, 6, 0.5), { tone: "mid" }));

    // 2. 面内参考点 A(ax, ay, 0) 上的法向量激光立柱 n = (0,0,1) 与投影游标 Q(ax, ay, h)
    const wA = [ax * k, ay * k, 4];
    const wNTop = [ax * k, ay * k, 4 + 3.9 * k];
    const wQ = [ax * k, ay * k, 4 + h * k];
    const wH = [px * k, py * k, 4];
    const wP = [px * k, py * k, 4 + h * k];

    // 法向量立柱基座与刻度尺
    parts.push(solidSvg(cylinder(wA[0], wA[1], 4, 10, 6.5, P, 14), { tone: "hi", accent: true }));
    parts.push(segmentSvg(wA, wNTop, P, { accent: true, width: 2.8 }));
    // 投影套环 Q
    parts.push(solidSvg(cylinder(wQ[0], wQ[1], wQ[2] - 2.5, wQ[2] + 2.5, 5.2, P, 14), { tone: "hi", accent: true }));

    // 3. 垂足 H 靶标、真实垂线 PH 与水平等高激光线 QP
    parts.push(solidSvg(cylinder(wH[0], wH[1], 4, 6.5, 5.5, P, 14), { tone: "mid" }));
    parts.push(segmentSvg(wA, wH, P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg(wH, wP, P, { warn: true, dashed: true, width: 2.2 }));
    parts.push(segmentSvg(wQ, wP, P, { accent: true, dashed: true, width: 1.8 }));

    // 4. 斜向量 AP 与空间被测探针球 P
    parts.push(segmentSvg(wA, wP, P, { warn: true, width: 2.8 }));
    const p2d = iso(wP, P);
    parts.push(`<circle cx="${tenth(p2d[0])}" cy="${tenth(p2d[1])}" r="5.5" fill="var(--iso-warn)" stroke="var(--iso-card)" stroke-width="1.8"/>`);

    // 5. 固定安全区文字标注
    parts.push(`<text x="210" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">空间法向量激光测距台 · d = |AP·n| / |n| = ${h.toFixed(1)}</text>`);
    parts.push(`<text x="108" y="298" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">参考点 A(${ax},${ay},0), 法向量 n=(0,0,1)</text>`);
    parts.push(`<text x="308" y="298" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">斜向量 |AP|=${lenAP.toFixed(2)} → 法向投影高 d=${h.toFixed(1)}</text>`);

    // 6. 右侧双千分表：点面距离 d 与斜向量模长 |AP|
    parts.push(dialGaugeSvg(490, 78, 33, h, 4.0, "点面距离 d", ""));
    parts.push(dialGaugeSvg(490, 218, 33, lenAP, 5.0, "斜向量模 |AP|", ""));
    parts.push(`<text x="490" y="150" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">换点 A 投影高 d 恒不变</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>空间法向量激光测距台</b>：面内任取参考点 \\(A(${ax}, ${ay}, 0)\\)，斜向量 \\(\\overrightarrow{AP} = (${dx.toFixed(1)}, ${dy.toFixed(1)}, ${dz.toFixed(1)})\\)，模长 \\(|\\overrightarrow{AP}| = ${lenAP.toFixed(2)}\\)。<br>` +
        `<b>免找垂足原理</b>：将 \\(\\overrightarrow{AP}\\) 投影到单位法向量 \\(\\boldsymbol{n}=(0,0,1)\\) 立柱上，激光游标高度 \\(d = \\dfrac{|\\overrightarrow{AP}\\cdot\\boldsymbol{n}|}{|\\boldsymbol{n}|} = ${h.toFixed(1)}\\)，与垂线段 \\(|PH|\\) 严格等高！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 5.1 导数的概念及其意义：割线逼近切线与瞬时变化率千分表 (Isometric Secant-to-Tangent Cam & Rate Gauge Rig)
   * viewBox: 0 0 560 300
   */
  function renderSecantBench(svg, desc, dxVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const rawDx = Number.isFinite(Number(dxVal)) ? Number(dxVal) : 1.5;
    const dx = Math.max(0.05, rawDx);
    const x0 = 1.0, y0 = 0.5 * x0 * x0; // P(1, 0.5)
    const x1 = x0 + dx, y1 = 0.5 * x1 * x1;
    const dy = y1 - y0;
    const kSec = dy / dx; // 1 + 0.5 * dx
    const kTan = 1.0;
    const err = kSec - kTan;

    const P = { scale: 1.45, origin: [118, 224], azimuth: 28, elevation: 22 };
    const sx = 46, sy = 22; // world scaling for x and f(x)
    const parts = [];

    // 1. 等距仪器底板与立式坐标背板
    parts.push(solidSvg(slabOf({ x: -16, y: -18, w: 196, d: 38, r: 5 }, -8, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -12, y: -14, w: 188, d: 5, r: 2 }, 4, 118, P, 4, 0.5), { tone: "mid" }));

    // 2. 抛物线凸轮导轨 f(x) = 0.5x^2 (x in [0, 3.6])
    const camPts = [];
    for (let xv = 0; xv <= 3.6; xv += 0.12) {
      camPts.push(iso([xv * sx, 0, 8 + 0.5 * xv * xv * sy], P));
    }
    parts.push(`<path d="${pathOf(camPts, false)}" fill="none" stroke="var(--iso-hi)" stroke-width="2.6"/>`);

    const wP = [x0 * sx, 0, 8 + y0 * sy];
    const wQ = [x1 * sx, 0, 8 + y1 * sy];
    const wCorner = [x1 * sx, 0, 8 + y0 * sy];

    // 3. 固定切点滑块 P(1, 0.5) 与激光基准切线 (k = 1.0)
    const wTan1 = [0.1 * sx, 0, 8 + (y0 + (0.1 - x0) * kTan) * sy];
    const wTan2 = [3.5 * sx, 0, 8 + (y0 + (3.5 - x0) * kTan) * sy];
    parts.push(segmentSvg(wTan1, wTan2, P, { accent: true, dashed: true, width: 2.0 }));

    // 4. Δx 水平游标与 Δy 竖直量块 + 割线连杆 PQ
    parts.push(segmentSvg(wP, wCorner, P, { dashed: true, width: 1.5 }));
    parts.push(segmentSvg(wCorner, wQ, P, { dashed: true, width: 1.5 }));
    const wSec1 = [Math.max(0, x0 - 0.55) * sx, 0, 8 + (y0 - 0.55 * kSec) * sy];
    const wSec2 = [Math.min(3.65, x1 + 0.35) * sx, 0, 8 + (y0 + (Math.min(3.65, x1 + 0.35) - x0) * kSec) * sy];
    parts.push(segmentSvg(wSec1, wSec2, P, { warn: true, width: 2.8 }));

    // P 与 Q 精密滑块轴承
    parts.push(solidSvg(cylinder(wP[0], wP[1], wP[2] - 4, wP[2] + 4, 4.8, P, 12), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wQ[0], wQ[1], wQ[2] - 4, wQ[2] + 4, 4.8, P, 12), { tone: "hi" }));

    // 5. 固定安全区文字标注
    parts.push(`<text x="212" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">割线逼近切线千分表台 · Δx=${dx.toFixed(2)}, k割=${kSec.toFixed(3)}</text>`);
    parts.push(`<text x="112" y="282" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">切点 P(1, 0.5), 极限导数 f'(1)=1.000</text>`);
    parts.push(`<text x="312" y="282" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">Δy=${dy.toFixed(2)}, 斜率差 k割-f'(1)=+${err.toFixed(3)}</text>`);

    // 6. 右侧双千分表：割线斜率 k割 与 斜率逼近误差
    parts.push(dialGaugeSvg(490, 74, 32, kSec, 2.5, "割线斜率 k割=Δy/Δx", ""));
    parts.push(dialGaugeSvg(490, 210, 32, err, 1.5, "逼近误差 k割-f'(1)", ""));
    parts.push(`<text x="490" y="144" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">Δx→0 ⇒ k割→1.00</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>等距凸轮导轨与瞬时变化率千分表</b>：当自变量增量 \\(\\Delta x = ${dx.toFixed(2)}\\) 时，函数增量 \\(\\Delta y = f(1+\\Delta x)-f(1) = ${dy.toFixed(3)}\\)。<br>` +
        `<b>极限逼近读数</b>：割线连杆斜率 \\(k_{\\text{割}} = \\dfrac{\\Delta y}{\\Delta x} = 1 + 0.5\\Delta x = ${kSec.toFixed(3)}\\)，与切线斜率 \\(f'(1)=1.000\\) 仅差 <b>+${err.toFixed(3)}</b>！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 3.1 椭圆：双焦柱定长绳绘图仪与离心率台 (Isometric Two-Focus Peg & Taut-Cord Ellipsograph Rig)
   * viewBox: 0 0 560 340
   */
  function renderEllipseBench(svg, desc, aVal, cVal, thetaRad, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const a = Number.isFinite(Number(aVal)) ? Math.max(1, Number(aVal)) : 6;
    const rawC = Number.isFinite(Number(cVal)) ? Math.max(0, Number(cVal)) : 4;
    const c = Math.min(a, rawC);
    const isDegen = Math.abs(a - c) < 1e-4;
    const isCircle = c < 1e-4;
    const b = isDegen ? 0 : Math.sqrt(Math.max(0, a * a - c * c));
    const e = c / a;
    const th = Number.isFinite(Number(thetaRad)) ? Number(thetaRad) : Math.PI / 3;

    const P = { scale: 1.44, origin: [212, 178], azimuth: 32, elevation: 28 };
    const k = 11.2; // world units per math unit
    const parts = [];

    // 1. 等距绘图仪底座与横向焦距滑槽 (T-slot)
    parts.push(solidSvg(slabOf({ x: -92, y: -74, w: 184, d: 148, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -84, y: -5, w: 168, d: 10, r: 2 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 椭圆轨迹刻槽（或退化线段）
    if (isDegen) {
      parts.push(segmentSvg([-c * k, 0, 7], [c * k, 0, 7], P, { warn: true, width: 4.0 }));
    } else {
      const ellPts = [];
      for (let i = 0; i <= 64; i++) {
        const ang = (i / 64) * Math.PI * 2;
        ellPts.push(iso([a * k * Math.cos(ang), b * k * Math.sin(ang), 6.5], P));
      }
      parts.push(`<path d="${pathOf(ellPts, true)}" fill="var(--iso-accent)" fill-opacity="0.12" stroke="var(--iso-accent)" stroke-width="2.4"/>`);
    }

    // 3. 双黄铜焦柱 F1(-c,0), F2(c,0) 与绷紧弦线 F1-P-F2 + 描迹画笔立柱 P
    const px = a * Math.cos(th), py = isDegen ? 0 : b * Math.sin(th);
    const d1 = Math.hypot(px + c, py), d2 = Math.hypot(px - c, py);
    const wF1 = [-c * k, 0, 12];
    const wF2 = [c * k, 0, 12];
    const wP = [px * k, py * k, 12];

    parts.push(solidSvg(cylinder(-c * k, 0, 6, 20, 4.5, P, 14), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(c * k, 0, 6, 20, 4.5, P, 14), { tone: "hi", accent: true }));
    parts.push(segmentSvg(wF1, wP, P, { accent: true, width: 2.6 }));
    parts.push(segmentSvg(wF2, wP, P, { warn: true, width: 2.6 }));
    parts.push(solidSvg(cylinder(px * k, py * k, 6, 28, 4.2, P, 14), { tone: "hi" }));

    // 4. 固定安全区文字标注
    const stateTag = isDegen ? "2a=2c 退化为线段 F₁F₂" : (isCircle ? "c=0 正圆极限 (e=0)" : `椭圆轨迹 b=${b.toFixed(2)}, e=${e.toFixed(2)}`);
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">双焦柱定长绳椭圆绘图仪 · ${stateTag}</text>`);
    parts.push(`<text x="112" y="316" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-accent)">焦半径 |PF₁|=${d1.toFixed(2)}, |PF₂|=${d2.toFixed(2)}</text>`);
    parts.push(`<text x="312" y="316" text-anchor="middle" font-size="12" font-weight="700" fill="var(--iso-warn)">定长绳和 |PF₁|+|PF₂| = ${(d1 + d2).toFixed(2)} = 2a</text>`);

    // 5. 右侧双千分表：离心率 e = c/a 与 定长绳总长 2a
    parts.push(dialGaugeSvg(490, 82, 34, e, 1.0, "离心率 e = c/a", ""));
    parts.push(dialGaugeSvg(490, 232, 34, d1 + d2, 16.0, "绳长 |PF₁|+|PF₂|=2a", ""));
    parts.push(`<text x="490" y="158" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">a² = b² + c²</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>双焦柱定长绳椭圆绘图仪</b>：半长轴 \\(a=${a.toFixed(1)}\\)，半焦距 \\(c=${c.toFixed(1)}\\)，半短轴 \\(b=\\sqrt{a^2-c^2}=${b.toFixed(2)}\\)，离心率 \\(e=\\dfrac{c}{a}=${e.toFixed(2)}\\)。<br>` +
        `<b>定长绳守恒</b>：两根焦柱间绷紧绳长 \\(|PF_1|+|PF_2| = ${d1.toFixed(2)} + ${d2.toFixed(2)} = ${(d1 + d2).toFixed(1)} = 2a\\)` +
        (isDegen ? ` — <span class="warn-box">⚠️ 当 \\(2a=2c\\) 时绳子被两焦柱彻底绷直，轨迹退化为线段 \\(F_1F_2\\)！</span>` : `。`);
      if (renderMath) renderMath();
    }
  }

  /**
   * 10.1 随机事件与概率：等距分流抽样机与合成类别不等可能实验台 (Isometric Binary Chute Sampling & Combinatorial Bin Rig)
   * viewBox: 0 0 560 330
   */
  function renderSamplingBench(svg, desc, nVal, kVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const n = Math.max(1, Math.min(6, Math.round(Number(nVal) || 2)));
    const k = Math.max(0, Math.min(n, Math.round(Number.isFinite(Number(kVal)) ? Number(kVal) : 1)));

    function comb(a, b) {
      let r = 1;
      for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i;
      return Math.round(r);
    }

    const total = Math.pow(2, n);
    const maxC = comb(n, Math.floor(n / 2));
    const ck = comb(n, k);
    const pReal = ck / total;
    const pWrong = 1 / (n + 1);
    const same = ck * (n + 1) === total;

    const P = { scale: 1.44, origin: [210, 224], azimuth: 32, elevation: 25 };
    const parts = [];

    // 1. 等距实验台基座 (Granite Base Plate)
    parts.push(solidSvg(slabOf({ x: -94, y: -38, w: 188, d: 76, r: 6 }, -10, 4, P, 6, 1.0), { tone: "lo" }));

    // 2. 顶部二元分流漏斗与级联分流导轨 (Hopper + Splitter Network)
    parts.push(solidSvg(coneFrustum(0, -6, 86, 100, 12, 6, P, 14), { tone: "hi", accent: true }));
    const spanX = 148;
    const slotW = spanX / (n + 1);
    const barW = Math.min(18, slotW * 0.64);
    const maxH = 66;

    for (let j = 0; j <= n; j++) {
      const cj = comb(n, j);
      const h = Math.max(4, (cj / maxC) * maxH);
      const cx = -spanX / 2 + slotW * (j + 0.5);
      const isSel = j === k;
      // 分流支管：从漏斗底部连向各收集槽顶部
      parts.push(segmentSvg([0, -6, 86], [cx, 0, 4 + h], P, { accent: isSel, dashed: !isSel, width: isSel ? 2.2 : 1.2 }));
      // 3D 等距样本收集柱 (Combinatorial Collector Bin)
      parts.push(
        solidSvg(
          slabOf({ x: cx - barW / 2, y: -barW / 2, w: barW, d: barW, r: 2.2 }, 4, 4 + h, P, 4, 0.5),
          { tone: isSel ? "hi" : "mid", accent: isSel }
        )
      );
    }

    // 3. 「每类等可能」错误均分激光警戒线 (Naive 1/(n+1) Reference Laser)
    const hUniform = (total / (n + 1) / maxC) * maxH;
    parts.push(segmentSvg([-82, 8, 4 + hUniform], [82, 8, 4 + hUniform], P, { warn: true, dashed: true, width: 2.2 }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="210" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">等距二元分流抽样机 · Ω 共 2^${n} = ${total} 条等可能路径</text>`);
    parts.push(`<text x="102" y="308" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">k=${k} 正面：C(${n},${k})=${ck} 条路径</text>`);
    parts.push(`<text x="320" y="308" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">P=${ck}/${total}=${pReal.toFixed(3)} vs 均分 1/${n + 1}=${pWrong.toFixed(3)}</text>`);

    // 5. 右侧双千分表：真实概率 P 与 均分误算 1/(n+1)
    parts.push(dialGaugeSvg(490, 80, 33, pReal, 1.0, "真实概率 C(n,k)/2ⁿ", ""));
    parts.push(dialGaugeSvg(490, 222, 33, pWrong, 1.0, "等分误算 1/(n+1)", ""));
    parts.push(`<text x="490" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">合成类别必重查等可能</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>等距二元分流抽样机</b>：抛 \\(${n}\\) 枚硬币共有 \\(2^{${n}}=${total}\\) 条等可能分流路径；落入第 \\(k=${k}\\) 号槽（正面 \\(${k}\\) 枚）的路径有 \\(\\mathrm{C}_{${n}}^{${k}}=${ck}\\) 条。<br>` +
        `<b>真实概率 vs 均分误算</b>：真实概率 \\(P=\\dfrac{${ck}}{${total}}\\approx ${pReal.toFixed(3)}\\)；若把 \\(${n + 1}\\) 个槽当成等可能则会误算为 \\(\\dfrac{1}{${n + 1}}\\approx ${pWrong.toFixed(3)}\\)` +
        (same ? `，<span class="eq">此处恰好相等</span>（仅 \\(n=1\\) 时每槽路径数相同）。` : `，<span class="bad">明显不等</span>（橙色虚线为均分高度）。`);
      if (renderMath) renderMath();
    }
  }

  /**
   * 7.5 正态分布：高尔顿钉板等距正态落球仪与 3σ 质量控制闸门 (Isometric Galton Pegboard & Normal Curve Rig)
   * viewBox: 0 0 560 334
   */
  function renderGaltonBench(svg, desc, muVal, sgVal, loVal, hiVal, modeVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const mu = Number.isFinite(Number(muVal)) ? Number(muVal) : 0;
    const sg = Math.max(0.2, Number(sgVal) || 1.0);
    const rawLo = Number(loVal), rawHi = Number(hiVal);
    const loValue = Number.isFinite(rawLo) ? rawLo : -1, hiValue = Number.isFinite(rawHi) ? rawHi : 1;
    const lo = Math.min(loValue, hiValue);
    const hi = Math.max(loValue, hiValue);
    const mode = Number(modeVal) || 0;
    const peak = 1 / (sg * Math.sqrt(2 * Math.PI));

    function erf(x) {
      const s = x < 0 ? -1 : 1;
      const ax = Math.abs(x);
      const t = 1 / (1 + 0.3275911 * ax);
      const y = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-ax * ax);
      return s * y;
    }
    function Phi(z) {
      return 0.5 * (1 + erf(z / Math.SQRT2));
    }
    const prob = hi > lo ? Math.max(0, Phi((hi - mu) / sg) - Phi((lo - mu) / sg)) : 0;

    const P = { scale: 1.44, origin: [212, 228], azimuth: 30, elevation: 24 };
    const kX = 10.5; // world units per math x unit (x in [-8, 8])
    const zScale = 58 / Math.max(0.42, peak);
    const parts = [];

    // 1. 等距仪器底座与背板 (Galton Base & Peg Backboard)
    parts.push(solidSvg(slabOf({ x: -94, y: -32, w: 188, d: 64, r: 6 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -88, y: -26, w: 176, d: 6, r: 3 }, 4, 86, P, 4, 0.5), { tone: "mid" }));

    // 2. 背板上半部的高尔顿黄铜交错钉阵 (Galton Peg Lattice centered around mu)
    const muClamped = Math.max(-4.5, Math.min(4.5, mu));
    for (let row = 0; row < 4; row++) {
      const zPeg = 80 - row * 7;
      for (let col = -row; col <= row; col++) {
        const px = (muClamped + col * 0.65) * kX;
        const p2d = iso([px, -18, zPeg], P);
        parts.push(`<circle cx="${tenth(p2d[0])}" cy="${tenth(p2d[1])}" r="2.2" fill="var(--iso-warn)"/>`);
      }
    }

    // 3. 15 根等距正态集球柱 (3D Histogram Accumulator Columns)
    const numBins = 15;
    const xMin = -7.0, xMax = 7.0;
    const stepX = (xMax - xMin) / numBins;
    for (let i = 0; i < numBins; i++) {
      const xc = xMin + (i + 0.5) * stepX;
      const z = (xc - mu) / sg;
      const dens = peak * Math.exp(-0.5 * z * z);
      const h = Math.max(2.5, dens * zScale);
      const inRange = hi > lo && xc >= lo && xc <= hi;
      const wx = xc * kX;
      const bw = stepX * kX * 0.72;
      parts.push(
        solidSvg(
          slabOf({ x: wx - bw / 2, y: -7, w: bw, d: 14, r: 1.6 }, 4, 4 + h, P, 4, 0.4),
          { tone: inRange ? "hi" : "mid", accent: inRange }
        )
      );
    }

    // 4. 光滑正态密度包络线与区间激光闸门 a, b
    const curvePts = [];
    for (let j = 0; j <= 64; j++) {
      const xv = -7.6 + (15.2 * j) / 64;
      const z = (xv - mu) / sg;
      const dens = peak * Math.exp(-0.5 * z * z);
      curvePts.push(iso([xv * kX, 2, 5 + dens * zScale], P));
    }
    parts.push(`<path d="${pathOf(curvePts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="2.6"/>`);

    // 均值中心轴与 a, b 闸门立柱
    parts.push(segmentSvg([muClamped * kX, 4, 4], [muClamped * kX, 4, 8 + peak * zScale], P, { accent: true, dashed: true, width: 1.8 }));
    const loC = Math.max(-7.6, Math.min(7.6, lo));
    const hiC = Math.max(-7.6, Math.min(7.6, hi));
    parts.push(segmentSvg([loC * kX, 8, 4], [loC * kX, 8, 52], P, { warn: true, width: 2.4 }));
    parts.push(segmentSvg([hiC * kX, 8, 4], [hiC * kX, 8, 52], P, { warn: true, width: 2.4 }));

    // 5. 固定安全区文字标注
    const modeTag = mode ? `μ±${mode === 1 ? "" : mode}σ 黄金法则` : `区间 [${lo.toFixed(1)}, ${hi.toFixed(1)}]`;
    parts.push(`<text x="212" y="22" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">高尔顿钉板等距正态落球仪 · N(${mu.toFixed(1)}, ${sg.toFixed(1)}²) · ${modeTag}</text>`);
    parts.push(`<text x="102" y="310" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">μ=${mu.toFixed(1)}, σ=${sg.toFixed(1)} (峰值 ${peak.toFixed(2)})</text>`);
    parts.push(`<text x="318" y="310" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">闸门 P(${lo.toFixed(1)}&lt;X&lt;${hi.toFixed(1)}) ≈ ${prob.toFixed(4)}</text>`);

    // 6. 右侧双千分表：区间概率面积 P 与 峰值密度 f(μ)
    parts.push(dialGaugeSvg(490, 80, 33, prob, 1.0, "区间概率 P(a,b)", ""));
    parts.push(dialGaugeSvg(490, 224, 33, peak, 2.0, "峰值密度 1/(√2πσ)", ""));
    parts.push(`<text x="490" y="152" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">面积是概率 · 高度不是</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>高尔顿钉板等距正态落球仪</b>：\\(X\\sim N(${mu.toFixed(1)},\\,${sg.toFixed(1)}^2)\\)，最高点密度 \\(f(\\mu)\\approx ${peak.toFixed(2)}\\)（当 \\(\\sigma=0.2\\) 时高达 \\(1.99>1\\)，证明<b>高度不是概率，柱群围成的面积才是概率</b>）。<br>` +
        `<b>激光闸门读数</b>：区间 \\([${lo.toFixed(1)},\\,${hi.toFixed(1)}]\\) 内亮绿色集球柱占比 \\(P(${lo.toFixed(1)} < X < ${hi.toFixed(1)}) \\approx ${prob.toFixed(4)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 3.2 双曲线：双焦柱差值拉线与渐近线激光框实验台 (Isometric Two-Focus Differential Cord & Asymptote Laser Frame Rig)
   * viewBox: 0 0 560 360
   */
  function renderHyperbolaBench(svg, desc, aVal, bVal, tVal, axisVal, branchVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const a = Math.max(1.5, Math.min(6.0, Number(aVal) || 3.0));
    const b = Math.max(1.5, Math.min(6.0, Number(bVal) || 4.0));
    const t = Math.max(-1.6, Math.min(1.6, Number.isFinite(Number(tVal)) ? Number(tVal) : 1.0));
    const axis = axisVal === "y" ? "y" : "x";
    const sgn = branchVal === "left" ? -1 : 1;

    const c = Math.hypot(a, b);
    const e = c / a;
    const ch = (Math.exp(t) + Math.exp(-t)) / 2;
    const sh = (Math.exp(t) - Math.exp(-t)) / 2;

    const px = axis === "x" ? sgn * a * ch : b * sh;
    const py = axis === "x" ? b * sh : sgn * a * ch;
    const f1 = axis === "x" ? [-c, 0] : [0, -c];
    const f2 = axis === "x" ? [c, 0] : [0, c];
    const r1 = Math.hypot(px - f1[0], py - f1[1]);
    const r2 = Math.hypot(px - f2[0], py - f2[1]);
    const diff = Math.abs(r1 - r2);
    // 点 P 到最近渐近线 bx - ay = 0 (或 ax - by = 0) 的垂直距离 d = ab / sqrt(a^2+b^2) * exp(-|t|)... 精确值：
    const asymDist = (a * b) / Math.hypot(px, py);

    const P = { scale: 1.42, origin: [212, 188], azimuth: 32, elevation: 27 };
    const k = 7.4; // world units per math unit
    const parts = [];

    // 1. 等距花岗岩底座与特征矩形黄铜导轨框 (2a × 2b Characteristic Box)
    parts.push(solidSvg(slabOf({ x: -94, y: -76, w: 188, d: 152, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    const rx = (axis === "x" ? a : b) * k;
    const ry = (axis === "x" ? b : a) * k;
    parts.push(solidSvg(slabOf({ x: -rx, y: -ry, w: 2 * rx, d: 2 * ry, r: 2 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 两条对角渐近线激光束 (Asymptotes y = ±(b/a)x or ±(a/b)x)
    const mSlope = ry / rx;
    const xLim = Math.min(84, 70 / Math.max(0.4, mSlope));
    const yLim = xLim * mSlope;
    parts.push(segmentSvg([-xLim, -yLim, 7], [xLim, yLim, 7], P, { warn: true, dashed: true, width: 1.6 }));
    parts.push(segmentSvg([-xLim, yLim, 7], [xLim, -yLim, 7], P, { warn: true, dashed: true, width: 1.6 }));

    // 3. 双曲线两支刻槽轨迹
    [-1, 1].forEach((br) => {
      const pts = [];
      for (let tv = -1.55; tv <= 1.55; tv += 0.1) {
        const chT = (Math.exp(tv) + Math.exp(-tv)) / 2;
        const shT = (Math.exp(tv) - Math.exp(-tv)) / 2;
        const wx = (axis === "x" ? br * a * chT : b * shT) * k;
        const wy = (axis === "x" ? b * shT : br * a * chT) * k;
        if (Math.abs(wx) <= 88 && Math.abs(wy) <= 72) {
          pts.push(iso([wx, wy, 7.5], P));
        }
      }
      if (pts.length > 1) {
        parts.push(`<path d="${pathOf(pts, false)}" fill="none" stroke="${br === sgn ? "var(--iso-accent)" : "var(--iso-mid)"}" stroke-width="${br === sgn ? "2.6" : "1.8"}"/>`);
      }
    });

    // 4. 双焦柱 F1, F2 与差值拉线 PF1, PF2 + 动点立柱 P
    const wF1 = [f1[0] * k, f1[1] * k, 12];
    const wF2 = [f2[0] * k, f2[1] * k, 12];
    const wP = [px * k, py * k, 12];
    parts.push(solidSvg(cylinder(wF1[0], wF1[1], 5, 19, 4.2, P, 12), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wF2[0], wF2[1], 5, 19, 4.2, P, 12), { tone: "hi", accent: true }));
    parts.push(segmentSvg(wF1, wP, P, { accent: true, width: 2.4 }));
    parts.push(segmentSvg(wF2, wP, P, { warn: true, width: 2.4 }));
    parts.push(solidSvg(cylinder(wP[0], wP[1], 5, 25, 4.0, P, 12), { tone: "hi" }));

    // 5. 固定安全区文字标注
    const eqTag = axis === "x" ? `x²/${(a * a).toFixed(0)} - y²/${(b * b).toFixed(0)} = 1` : `y²/${(a * a).toFixed(0)} - x²/${(b * b).toFixed(0)} = 1`;
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">双焦柱渐近线激光实验台 · ${eqTag} · c=${c.toFixed(2)}</text>`);
    parts.push(`<text x="102" y="336" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">||PF₁|-|PF₂|| = ${diff.toFixed(1)} = 2a</text>`);
    parts.push(`<text x="318" y="336" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">离心率 e=${e.toFixed(2)}, 渐近线间隙 d=${asymDist.toFixed(2)}</text>`);

    // 6. 右侧双千分表：离心率 e = c/a 与 渐近线逼近间距 d
    parts.push(dialGaugeSvg(490, 86, 34, e, 3.0, "离心率 e = c/a", ""));
    parts.push(dialGaugeSvg(490, 242, 34, asymDist, 3.0, "渐近线间隙 d", ""));
    parts.push(`<text x="490" y="164" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">c² = a² + b² (e &gt; 1)</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      const slopeTex = axis === "x" ? `\\pm\\dfrac{${b.toFixed(1)}}{${a.toFixed(1)}}x` : `\\pm\\dfrac{${a.toFixed(1)}}{${b.toFixed(1)}}x`;
      desc.innerHTML =
        `<b>双焦柱差值拉线与渐近线激光框台</b>：实半轴 \\(a=${a.toFixed(1)}\\)，虚半轴 \\(b=${b.toFixed(1)}\\)，半焦距 \\(c=\\sqrt{a^2+b^2}=${c.toFixed(2)}\\)，离心率 \\(e=\\dfrac{c}{a}=${e.toFixed(2)}\\)。<br>` +
        `<b>差值守恒与渐近逼近</b>：\\(\\big||PF_1|-|PF_2|\\big|=${diff.toFixed(2)}=2a\\)；特征矩形对角激光线 \\(y=${slopeTex}\\)，当前动点 \\(P\\) 到渐近线距离 \\(d\\approx ${asymDist.toFixed(3)}\\)（随 \\(|t|\\) 增大无限趋近于 \\(0\\) 但永不相交）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 3.3 抛物线：准线滑轨三角尺、焦点定长拉线与光学平行反射实验台 (Isometric Directrix T-Square & Parabolic Reflector Rig)
   * viewBox: 0 0 560 350
   */
  function renderParabolaBench(svg, desc, pVal, y0Val, optOn, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const p = Math.max(1.0, Math.min(4.0, Number(pVal) || 2.0));
    const y0 = Math.max(-3.2, Math.min(3.2, Number.isFinite(Number(y0Val)) ? Number(y0Val) : 2.0));
    const x0 = (y0 * y0) / (2 * p);
    const fx = p / 2;
    const dx = -p / 2;
    const dPF = x0 + p / 2; // = |PH|

    const P = { scale: 1.44, origin: [192, 184], azimuth: 32, elevation: 27 };
    const k = 15.0; // world units per math unit
    const parts = [];

    // 1. 等距精密仪器底座与准线导轨 x = -p/2 (Granite Base + Directrix Guide Rail)
    parts.push(solidSvg(slabOf({ x: -58, y: -74, w: 176, d: 148, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    const wDx = dx * k;
    parts.push(solidSvg(slabOf({ x: wDx - 4, y: -64, w: 8, d: 128, r: 2 }, 4, 11, P, 4, 0.4), { tone: "mid" }));

    // 2. 抛物面反射镜弧 y^2 = 2px
    const parPts = [];
    for (let yv = -3.4; yv <= 3.4; yv += 0.17) {
      const xv = (yv * yv) / (2 * p);
      if (xv * k <= 108) {
        parPts.push(iso([xv * k, yv * k, 8], P));
      }
    }
    parts.push(`<path d="${pathOf(parPts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="2.8"/>`);

    // 3. 准线滑块 H(-p/2, y0)、焦点黄铜柱 F(p/2, 0) 与描迹笔立柱 P(x0, y0)
    const wH = [wDx, y0 * k, 12];
    const wF = [fx * k, 0, 12];
    const wP = [x0 * k, y0 * k, 12];

    parts.push(solidSvg(slabOf({ x: wDx - 6, y: y0 * k - 7, w: 12, d: 14, r: 2 }, 8, 16, P, 4, 0.3), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wF[0], wF[1], 5, 22, 4.8, P, 14), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wP[0], wP[1], 5, 26, 4.2, P, 14), { tone: "hi" }));

    // 4. 等长焦半径拉线 PF 与准线垂尺 PH (|PF| = |PH| = x0 + p/2)
    parts.push(segmentSvg(wH, wP, P, { accent: true, width: 2.6 }));
    parts.push(segmentSvg(wF, wP, P, { warn: true, width: 2.6 }));

    // 5. 平行轴入射激光束与反射会聚光路
    if (optOn !== false) {
      const wRayIn = [104, y0 * k, 12];
      parts.push(segmentSvg(wRayIn, wP, P, { warn: true, dashed: true, width: 1.8 }));
    }

    // 6. 固定安全区文字标注
    parts.push(`<text x="210" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">抛物线准线滑轨与光学反射实验台 · y²=${(2 * p).toFixed(0)}x · F(${fx.toFixed(2)}, 0)</text>`);
    parts.push(`<text x="102" y="328" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">P(${x0.toFixed(2)}, ${y0.toFixed(1)}) · 准线 x=-${fx.toFixed(2)}</text>`);
    parts.push(`<text x="318" y="328" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">焦半径 |PF| = 准线距 |PH| = ${dPF.toFixed(2)}</text>`);

    // 7. 右侧双千分表：焦半径 |PF| 与 准线垂距 |PH|
    parts.push(dialGaugeSvg(490, 82, 33, dPF, 8.0, "焦半径 |PF|=x₀+p/2", ""));
    parts.push(dialGaugeSvg(490, 232, 33, dPF, 8.0, "准线距 |PH|=x₀+p/2", ""));
    parts.push(`<text x="490" y="158" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">|PF| ≡ |PH| (e = 1)</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>准线滑轨-焦点定长光学反射台</b>：焦准距 \\(p=${p.toFixed(1)}\\)，焦点 \\(F(${fx.toFixed(2)},0)\\)，准线 \\(l:x=-${fx.toFixed(2)}\\)。<br>` +
        `<b>焦半径焦准转化</b>：动点 \\(P(${x0.toFixed(2)},${y0.toFixed(1)})\\) 到焦点的拉线长 \\(|PF| = x_0 + \\dfrac{p}{2} = ${dPF.toFixed(2)}\\)，与准线滑块垂尺 \\(|PH|=${dPF.toFixed(2)}\\) 恒等（离心率 \\(e=1\\)，平行入射激光经抛物面反射必过焦点 \\(F\\)）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 7.2 复数的四则运算：复平面乘 i 逆时针旋转 90° 相位陀螺与共轭镜像台 (Isometric Complex Rotor & Conjugate Rig)
   * viewBox: 0 0 560 350
   */
  function renderComplexRotorBench(svg, desc, rVal, degVal, kPowVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const r = Math.max(1.0, Math.min(3.5, Number(rVal) || 2.5));
    const deg = Number.isFinite(Number(degVal)) ? Number(degVal) : 35;
    const kPow = Math.max(0, Math.min(4, Math.round(Number.isFinite(Number(kPowVal)) ? Number(kPowVal) : 1)));

    const rad1 = deg * RAD;
    const rotDeg = deg + kPow * 90;
    const rad2 = rotDeg * RAD;
    const a1 = r * Math.cos(rad1), b1 = r * Math.sin(rad1);
    const a2 = r * Math.cos(rad2), b2 = r * Math.sin(rad2);

    const P = { scale: 1.44, origin: [212, 186], azimuth: 35, elevation: 27 };
    const k = 21.0; // world units per math unit
    const parts = [];

    // 1. 等距仪器底板与圆形复平面分度转盘 (Granite Base + Graduated Complex Turntable)
    parts.push(solidSvg(slabOf({ x: -88, y: -82, w: 176, d: 164, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(annulusSvg(0, 0, r * k, 0, 5, P, 40, { tone: "mid" }));

    // 实轴 Re 与虚轴 Im 基准刻线
    parts.push(segmentSvg([-78, 0, 6], [78, 0, 6], P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg([0, -74, 6], [0, 74, 6], P, { dashed: true, width: 1.4 }));

    // 2. 原点主轴 O、初始复向量 z、共轭镜像 z̄ 与旋转后复向量 z·i^k
    const wO = [0, 0, 10];
    const wZ1 = [a1 * k, b1 * k, 10];
    const wZConj = [a1 * k, -b1 * k, 10];
    const wZ2 = [a2 * k, b2 * k, 12];

    parts.push(solidSvg(cylinder(0, 0, 5, 18, 5.2, P, 14), { tone: "hi" }));
    // 共轭复数向量 z̄ (关于实轴对称)
    parts.push(segmentSvg(wO, wZConj, P, { dashed: true, width: 1.8 }));
    // 初始复数向量 z
    parts.push(segmentSvg(wO, wZ1, P, { accent: true, width: 2.8 }));
    parts.push(solidSvg(cylinder(wZ1[0], wZ1[1], 5, 19, 4.2, P, 12), { tone: "hi", accent: true }));
    // 乘 i^k 旋转后向量 z·i^k
    parts.push(segmentSvg(wO, wZ2, P, { warn: true, width: 3.0 }));
    parts.push(solidSvg(cylinder(wZ2[0], wZ2[1], 5, 23, 4.5, P, 12), { tone: "hi" }));

    // 3. 逆时针旋转 k×90° 轨迹弧
    if (kPow > 0) {
      const arcPts = [];
      const steps = kPow * 12;
      for (let s = 0; s <= steps; s++) {
        const ang = (deg + (kPow * 90 * s) / steps) * RAD;
        arcPts.push(iso([0.62 * r * k * Math.cos(ang), 0.62 * r * k * Math.sin(ang), 11], P));
      }
      parts.push(`<path d="${pathOf(arcPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="2.2"/>`);
    }

    // 4. 固定安全区文字标注
    const fmtC = (re, im) => `${re.toFixed(2)}${im >= 0 ? "+" : ""}${im.toFixed(2)}i`;
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">复平面乘 i 旋转陀螺台 · z·i^${kPow} 逆时针旋转 ${kPow * 90}°</text>`);
    parts.push(`<text x="102" y="328" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">初始 z=${fmtC(a1, b1)} (|z|=${r.toFixed(1)})</text>`);
    parts.push(`<text x="318" y="328" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">旋转后 z·i^${kPow}=${fmtC(a2, b2)}</text>`);

    // 5. 右侧双千分表：模长守恒 |z·i^k| 与 旋转角 k×90°
    parts.push(dialGaugeSvg(490, 82, 33, r, 4.0, "模长守恒 |z·iᵏ|", ""));
    parts.push(dialGaugeSvg(490, 232, 33, kPow * 90, 360, "旋转角 k×90°", "°"));
    parts.push(`<text x="490" y="158" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">i⁴ = 1 · 周期为 4</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>复平面乘 \\(\\mathrm{i}\\) 相位陀螺台</b>：初始复数 \\(z = ${fmtC(a1, b1)}\\)（模长 \\(|z|=${r.toFixed(2)}\\)，辐角 \\(${Math.round(deg)}^\\circ\\)），共轭复数 \\(\\overline{z} = ${fmtC(a1, -b1)}\\)。<br>` +
        `<b>几何旋转定律</b>：每乘一次虚数单位 \\(\\mathrm{i}\\)，模长保持 \\(|z\\cdot\\mathrm{i}^{${kPow}}|=${r.toFixed(2)}\\) 不变，向量逆时针旋转 \\(${kPow}\\times 90^\\circ = ${kPow * 90}^\\circ\\) 至 \\(z\\cdot\\mathrm{i}^{${kPow}} = ${fmtC(a2, b2)}\\)（当 \\(k=4\\) 时转满 \\(360^\\circ\\) 回到 \\(z\\)）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 5.4 三角函数的图象与性质：匀速单位圆转盘与简谐卷纸相位投影仪 (Isometric Unit-Circle Phasor & Chart-Recorder Rig)
   * viewBox: 0 0 560 340
   */
  function renderTrigPhasorBench(svg, desc, degVal, fnModeVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const deg = Math.max(0, Math.min(360, Number.isFinite(Number(degVal)) ? Number(degVal) : 60));
    const isCos = fnModeVal === "cos";
    const rad = deg * RAD;
    const val = isCos ? Math.cos(rad) : Math.sin(rad);

    const P = { scale: 1.42, origin: [198, 184], azimuth: 28, elevation: 25 };
    const R = 32; // unit circle radius in world units
    const parts = [];

    // 1. 等距联合机座：左侧单位圆飞轮座 + 右侧卷纸记录台 (Dual-Workstation Base)
    parts.push(solidSvg(slabOf({ x: -96, y: -56, w: 204, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    // 卷纸记录平板 (x in [-18, 98])
    parts.push(solidSvg(slabOf({ x: -18, y: -44, w: 118, d: 88, r: 3 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 左侧工位：单位圆黄铜飞轮 (centered at cx = -58, cy = 0)
    const cx = -58;
    parts.push(annulusSvg(cx, 0, R, 0, 6.5, P, 32, { tone: "mid" }));
    const px = cx + R * Math.cos(rad);
    const py = R * Math.sin(rad);
    const wCenter = [cx, 0, 9];
    const wPin = [px, py, 9];
    parts.push(segmentSvg(wCenter, wPin, P, { accent: true, width: 2.6 }));
    parts.push(solidSvg(cylinder(px, py, 6, 17, 3.8, P, 12), { tone: "hi", accent: true }));

    // 3. 右侧工位：正弦/余弦卷纸波形与同步描迹针 (x Wave from -12 to +92 for [0, 2π])
    const waveX0 = -12, waveSpan = 100;
    const wavePts = [];
    for (let i = 0; i <= 48; i++) {
      const th = (i / 48) * Math.PI * 2;
      const wx = waveX0 + (i / 48) * waveSpan;
      const wy = (isCos ? Math.cos(th) : Math.sin(th)) * R;
      wavePts.push(iso([wx, wy, 7.5], P));
    }
    parts.push(segmentSvg([waveX0, 0, 7], [waveX0 + waveSpan, 0, 7], P, { dashed: true, width: 1.4 }));
    parts.push(`<path d="${pathOf(wavePts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="2.6"/>`);

    // 当前相位角对应的卷纸坐标点 Q 與横向投影连杆 PQ
    const curWx = waveX0 + (deg / 360) * waveSpan;
    const curWy = val * R;
    const wStylus = [curWx, curWy, 9];
    parts.push(segmentSvg(wPin, wStylus, P, { warn: true, dashed: true, width: 2.0 }));
    parts.push(segmentSvg([curWx, 0, 7.5], wStylus, P, { warn: true, width: 2.8 }));
    parts.push(solidSvg(cylinder(curWx, curWy, 6, 22, 4.0, P, 12), { tone: "hi" }));

    // 4. 固定安全区文字标注
    const fnName = isCos ? "cos" : "sin";
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">单位圆飞轮与简谐卷纸相位投影仪 · y = ${fnName} θ (T = 2π)</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">飞轮转角 θ=${Math.round(deg)}° (${(rad / Math.PI).toFixed(2)}π rad)</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">瞬时投影值 ${fnName}(${Math.round(deg)}°) = ${val.toFixed(3)}</text>`);

    // 5. 右侧双千分表：瞬时函数值 f(θ) 与 相位弧度 θ
    parts.push(dialGaugeSvg(490, 80, 33, val, 1.0, `瞬时值 ${fnName}(θ)`, ""));
    parts.push(dialGaugeSvg(490, 226, 33, rad, 6.28, "相位角 θ (rad)", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">最值 ±1 处为对称轴</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>单位圆飞轮与简谐卷纸记录仪</b>：当左侧单位圆曲柄转过 \\(\\theta=${Math.round(deg)}^\\circ\\)（即 \\(${(rad / Math.PI).toFixed(2)}\\pi\\text{ rad}\\)）时，横向连杆将高度实时传导至右侧匀速卷纸，描出 \\(y=\\${fnName}\\theta=${val.toFixed(3)}\\)。<br>` +
        `<b>周期与对称性质</b>：飞轮每转一圈（最小正周期 \\(T=2\\pi\\)）波形完全重复；波峰波谷（取最值 \\(\\pm 1\\) 处）对应<b>对称轴</b>，零点（与横轴交点 \\(0\\) 处）对应<b>对称中心</b>。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.2 立体图形的直观图：斜二测画法 45° 投影框与 y'=y/2 半倍压缩夹具台 (Isometric Oblique-Projection 45° Half-Scale Rig)
   * viewBox: 0 0 560 340
   */
  function renderObliqueBench(svg, desc, sideVal, degVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const a = Math.max(2.0, Math.min(5.0, Number.isFinite(Number(sideVal)) ? Number(sideVal) : 4.0));
    const deg = Math.max(30, Math.min(135, Number.isFinite(Number(degVal)) ? Number(degVal) : 45));
    const rad = deg * RAD;
    const sinA = Math.sin(rad);
    const cosA = Math.cos(rad);
    const areaOrig = a * a;
    const ratio = 0.5 * sinA;
    const areaObl = areaOrig * ratio;

    const P = { scale: 1.42, origin: [198, 188], azimuth: 28, elevation: 25 };
    const k = 14;
    const parts = [];

    // 1. 等距双工位底座：左侧原图形正交台 + 右侧斜二测直观图夹具台
    parts.push(solidSvg(slabOf({ x: -96, y: -56, w: 204, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));

    // 2. 左侧工位 (cx = -54)：真实正方形原图 (x = a, y = a)
    const ox = -78, oy = -24, wA = a * k;
    const origPoly = [[ox, oy], [ox + wA, oy], [ox + wA, oy + wA], [ox, oy + wA]];
    parts.push(solidSvg(extrude(origPoly, 4, 13, P, 0.2), { tone: "mid", accent: true }));
    parts.push(segmentSvg([ox, oy - 4, 5], [ox + wA, oy - 4, 5], P, { accent: true, width: 2.2 }));
    parts.push(segmentSvg([ox - 4, oy, 5], [ox - 4, oy + wA, 5], P, { accent: true, width: 2.2 }));

    // 3. 右侧工位 (cx = +34)：斜二测平行四边形直观图 (x' = a, y' = a/2, ∠x'O'y' = deg)
    const bx = 8, by = -20;
    const yPrime = 0.5 * wA;
    const dx = yPrime * cosA, dy = yPrime * sinA;
    const oblPoly = [
      [bx, by],
      [bx + wA, by],
      [bx + wA + dx, by + dy],
      [bx + dx, by + dy]
    ];
    parts.push(solidSvg(extrude(oblPoly, 4, 13, P, 0.2), { tone: "hi", accent: true }));
    // 高 h' = (a/2) sin α 虚线标尺与顶点立柱
    parts.push(segmentSvg([bx + dx, by, 14], [bx + dx, by + dy, 14], P, { warn: true, dashed: true, width: 2.4 }));
    parts.push(solidSvg(cylinder(bx, by, 4, 18, 2.8, P, 10), { tone: "hi" }));
    parts.push(solidSvg(cylinder(bx + dx, by + dy, 4, 18, 2.8, P, 10), { tone: "hi", accent: true }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">斜二测画法投影夹具台 · x'=x, y'=y/2, ∠x'O'y'=${Math.round(deg)}°</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">原图边长 a=${a.toFixed(1)}, S原=${areaOrig.toFixed(2)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">直观图 S'=${areaObl.toFixed(2)} (比值 ${ratio.toFixed(3)})</text>`);

    // 5. 右侧双千分表：直观图面积 S' 与 面积换算比 S'/S
    parts.push(dialGaugeSvg(490, 80, 33, areaObl, 12.5, "直观图面积 S'", ""));
    parts.push(dialGaugeSvg(490, 226, 33, ratio, 0.5, "面积比 S'/S", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">S' = √2/4·S</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>斜二测画法三规则夹具台</b>：横轴平行且长度不变（\\(x'=a=${a.toFixed(1)}\\)），纵轴夹角 \\(\\angle x'O'y'=${Math.round(deg)}^\\circ\\) 且<b>长度折半</b>（\\(y'=\\dfrac{a}{2}=${(a / 2).toFixed(2)}\\)），直观图高 \\(h'=y'\\sin ${Math.round(deg)}^\\circ=${(0.5 * a * sinA).toFixed(2)}\\)。<br>` +
        `<b>面积换算公式</b>：原图面积 \\(S_{\\text{原}}=${areaOrig.toFixed(2)}\\)，直观图面积 \\(S_{\\text{直观}}=${areaObl.toFixed(2)}\\)。标准 \\(45^\\circ\\)（或 \\(135^\\circ\\)）下恒有 \\(S_{\\text{直观}}=\\dfrac{\\sqrt{2}}{4}S_{\\text{原}}\\approx 0.354 S_{\\text{原}}\\)，逆求原图面积必乘 \\(2\\sqrt{2}\\approx 2.828\\)！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.4 空间点、直线、平面之间的位置关系：异面直线平移造角与公垂线距离三维机架 (Isometric Skew-Lines Translation & Common-Perpendicular Rig)
   * viewBox: 0 0 560 340
   */
  function renderSkewLinesBench(svg, desc, degVal, distVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const rawDeg = Math.max(15, Math.min(165, Number.isFinite(Number(degVal)) ? Number(degVal) : 120));
    const d = Math.max(1.0, Math.min(4.5, Number.isFinite(Number(distVal)) ? Number(distVal) : 3.0));
    const skewDeg = rawDeg > 90 ? 180 - rawDeg : rawDeg;
    const isObtuseRaw = rawDeg > 90;
    const rad = rawDeg * RAD;

    const P = { scale: 1.42, origin: [198, 196], azimuth: 32, elevation: 25 };
    const k = 13;
    const parts = [];

    // 1. 底面平面 α 与机座
    parts.push(solidSvg(slabOf({ x: -86, y: -62, w: 172, d: 124, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -72, y: -50, w: 144, d: 100, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 底面直线 a (沿 x 轴, z = 7.5)
    const L = 58;
    parts.push(segmentSvg([-L, 0, 7.5], [L, 0, 7.5], P, { accent: true, width: 3.0 }));

    // 3. 公垂线立柱 (x=0, y=0, z from 7.5 to zTop)
    const zTop = 7.5 + d * k;
    parts.push(solidSvg(cylinder(0, 0, 6.5, zTop, 3.2, P, 12), { tone: "mid" }));
    parts.push(segmentSvg([0, 0, 7.5], [0, 0, zTop], P, { warn: true, width: 2.6 }));

    // 4. 上方异面直线 b (在高度 zTop 处，方向角 rawDeg) 與底面平移虚线 b' (在 z=7.5 处)
    const dx = L * Math.cos(rad), dy = L * Math.sin(rad);
    parts.push(segmentSvg([-dx, -dy, 7.5], [dx, dy, 7.5], P, { warn: true, dashed: true, width: 2.2 }));
    parts.push(segmentSvg([-dx, -dy, zTop], [dx, dy, zTop], P, { accent: true, width: 3.2 }));
    parts.push(solidSvg(cylinder(0, 0, zTop - 2, zTop + 4, 4.5, P, 12), { tone: "hi", accent: true }));

    // 5. 平移交点 O 处的锐角/直角扇形弧 (取锐角或直角 skewDeg)
    const arcPts = [];
    const startAng = isObtuseRaw ? rad : 0;
    const endAng = isObtuseRaw ? Math.PI : rad;
    for (let s = 0; s <= 16; s++) {
      const a0 = startAng + ((endAng - startAng) * s) / 16;
      arcPts.push(iso([22 * Math.cos(a0), 22 * Math.sin(a0), 8], P));
    }
    parts.push(`<path d="${pathOf(arcPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="2.4"/>`);

    // 6. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">异面直线平移造角与公垂线台 · 方向角 ${Math.round(rawDeg)}° → 异面角 ${Math.round(skewDeg)}°</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">公垂线段距离 d = ${d.toFixed(1)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">${isObtuseRaw ? `钝角 ${Math.round(rawDeg)}° 必取补角 ${Math.round(skewDeg)}°!` : `锐角/直角 θ = ${Math.round(skewDeg)}° ≤ 90°`}</text>`);

    // 7. 右侧双千分表：异面直线所成角 θ 与 公垂线距离 d
    parts.push(dialGaugeSvg(490, 80, 33, skewDeg, 90, "异面直线角 θ", "°"));
    parts.push(dialGaugeSvg(490, 226, 33, d, 4.5, "公垂线距离 d", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">范围 θ ∈ (0°, 90°]</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>异面直线平移造角机架</b>：上方直线 \\(b\\) 与底面直线 \\(a\\) 不同在任何平面内（公垂线段距离 \\(d=${d.toFixed(1)}>0\\)）。将 \\(b\\) 沿公垂线平移至底面得 \\(b'\\)（虚线），使 \\(a\\) 与 \\(b'\\) 相交于点 \\(O\\)。<br>` +
        `<b>易错红线（必取锐角或直角）</b>：两直线方向向量夹角为 \\(${Math.round(rawDeg)}^\\circ\\)，${isObtuseRaw ? `因超过 \\(90^\\circ\\)，<b>必须取其补角</b> \\(180^\\circ-${Math.round(rawDeg)}^\\circ=${Math.round(skewDeg)}^\\circ\\)` : `异面直线所成角 \\(\\theta=${Math.round(skewDeg)}^\\circ\\)`}，异面直线夹角严格满足 \\(\\theta\\in(0^\\circ,90^\\circ]\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.5 空间直线、平面的平行：线面平行与面面平行「两条相交直线」双激光验证台 (Isometric Parallel Plane Laser Verification Rig)
   * viewBox: 0 0 560 340
   */
  function renderParallelBench(svg, desc, spreadDegVal, tiltDegVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const spread = Math.max(0, Math.min(90, Number.isFinite(Number(spreadDegVal)) ? Number(spreadDegVal) : 60));
    const rawTilt = Math.max(-20, Math.min(20, Number.isFinite(Number(tiltDegVal)) ? Number(tiltDegVal) : 0));
    const isIntersecting = spread >= 5;
    // 若两线相交 (a ∩ b = P) 且均平行于底面 β，则平面 α 被锁死平行 (有效倾角 0°)；若 spread=0 (两线平行)，平面 α 可绕直线翻折倾斜 rawTilt!
    const effTilt = isIntersecting ? 0 : rawTilt;
    const tiltRad = effTilt * RAD;
    const halfSpread = (spread * 0.5) * RAD;

    const P = { scale: 1.42, origin: [198, 198], azimuth: 30, elevation: 25 };
    const parts = [];

    // 1. 底部基准平面 β 与四角定位柱
    parts.push(solidSvg(slabOf({ x: -84, y: -58, w: 168, d: 116, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -68, y: -44, w: 136, d: 88, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 底面 β 内的两条基准影线 a', b'
    const L = 48;
    const dx1 = L * Math.cos(halfSpread), dy1 = L * Math.sin(halfSpread);
    const dx2 = L * Math.cos(-halfSpread), dy2 = isIntersecting ? L * Math.sin(-halfSpread) : 16;
    parts.push(segmentSvg([-dx1, -dy1, 7], [dx1, dy1, 7], P, { dashed: true, width: 1.8 }));
    parts.push(segmentSvg([-dx2, isIntersecting ? -dy2 : 16, 7], [dx2, dy2, 7], P, { dashed: true, width: 1.8 }));

    // 2. 上方浮动平面 α (zCenter = 42, 当 spread=0 时允许绕 x 轴倾斜 effTilt)
    const zC = 42;
    const zOfY = (y) => zC + y * Math.sin(tiltRad);
    const topCorners = [
      [-64, -40, zOfY(-40)],
      [64, -40, zOfY(-40)],
      [64, 40, zOfY(40)],
      [-64, 40, zOfY(40)]
    ];
    const screenCorners = topCorners.map((pt) => iso(pt, P));
    parts.push(`<path d="${pathOf(screenCorners, true)}" fill="var(--iso-accent-soft)" stroke="${effTilt === 0 ? "var(--iso-accent)" : "var(--iso-warn)"}" stroke-width="2.2"/>`);

    // 上方平面 α 内的两条直线 a, b
    parts.push(segmentSvg([-dx1, -dy1, zOfY(-dy1)], [dx1, dy1, zOfY(dy1)], P, { accent: true, width: 3.0 }));
    if (isIntersecting) {
      parts.push(segmentSvg([-dx2, -dy2, zOfY(-dy2)], [dx2, dy2, zOfY(dy2)], P, { warn: true, width: 3.0 }));
      parts.push(solidSvg(cylinder(0, 0, zC - 2, zC + 5, 4.2, P, 12), { tone: "hi", accent: true }));
    } else {
      // 两平行线情形 (a // b, 无交点 P)
      parts.push(segmentSvg([-dx1, 18, zOfY(18)], [dx1, 18, zOfY(18)], P, { warn: true, width: 3.0 }));
    }

    // 3. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">线面与面面平行激光台 · 两线夹角 ${Math.round(spread)}° (${isIntersecting ? "相交 a∩b=P" : "平行无交点!"})</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">${isIntersecting ? "两相交线平行于 β ⇒ α∥β 锁定" : "两平行线平行于 β ⇒ α 可倾斜!"}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">平面实际倾角 |τ| = ${Math.abs(effTilt).toFixed(0)}°</text>`);

    // 4. 右侧双千分表：面内两线夹角 γ 与 平面失稳倾角 |τ|
    parts.push(dialGaugeSvg(490, 80, 33, spread, 90, "面内两线夹角", "°"));
    parts.push(dialGaugeSvg(490, 226, 33, Math.abs(effTilt), 20, "平面失稳倾角", "°"));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">必写 a∩b=P</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>面面平行判定激光验证台</b>：当平面 \\(\\alpha\\) 内两条直线夹角为 \\(${Math.round(spread)}^\\circ\\) 时，${isIntersecting ? `两直线<b>相交于点 \\(P\\)</b>（\\(a\\cap b=P\\)），且 \\(a\\parallel\\beta,\\ b\\parallel\\beta\\)，平面 \\(\\alpha\\) 的两个自由度被完全锁死（实际倾角 \\(0^\\circ\\)），严格保证 \\(\\alpha\\parallel\\beta\\)` : `两直线<b>互相平行（无交点）</b>，此时即便 \\(a\\parallel\\beta\\) 且 \\(b\\parallel\\beta\\)，平面 \\(\\alpha\\) 仍可绕直线翻折倾斜 \\(${Math.round(effTilt)}^\\circ\\) 与 \\(\\beta\\) 相交！`}<br>` +
        `<b>考场规范红线</b>：线面平行判定必写「<b>\\(a\\not\\subset\\alpha\\)</b>」；面面平行判定必写「<b>\\(a\\cap b=P\\)（两条相交直线）</b>」，漏写相交条件必扣分！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 1.3 空间向量及其运算的坐标表示：空间直角坐标系右手八卦限与对称点/距离卡尺台 (Isometric 3D Coordinate Box & Symmetry Caliper Rig)
   * viewBox: 0 0 560 340
   */
  function renderOctantBench(svg, desc, xVal, yVal, zVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const x = Math.max(-3.0, Math.min(3.0, Number.isFinite(Number(xVal)) ? Number(xVal) : 2.0));
    const y = Math.max(-3.0, Math.min(3.0, Number.isFinite(Number(yVal)) ? Number(yVal) : 2.5));
    const z = Math.max(-2.5, Math.min(2.5, Number.isFinite(Number(zVal)) ? Number(zVal) : 2.0));
    const norm = Math.hypot(x, y, z);
    const symDist = 2 * Math.abs(z);

    const P = { scale: 1.42, origin: [198, 182], azimuth: 32, elevation: 24 };
    const k = 15;
    const parts = [];

    // 1. 等距基准机座与 xOy 坐标透明圆盘 (z = 0)
    parts.push(solidSvg(slabOf({ x: -86, y: -62, w: 172, d: 124, r: 7 }, -46, -40, P, 6, 1.0), { tone: "lo" }));
    parts.push(annulusSvg(0, 0, 56, 0, 0, P, 32, { tone: "mid" }));

    // 2. 右手空间直角坐标轴 Ox, Oy, Oz
    parts.push(segmentSvg([-54, 0, 0], [58, 0, 0], P, { width: 1.8 }));
    parts.push(segmentSvg([0, -54, 0], [0, 58, 0], P, { width: 1.8 }));
    parts.push(segmentSvg([0, 0, -40], [0, 0, 48], P, { width: 1.8 }));

    // 3. 空间点 P(x,y,z)、xOy 射影点 H(x,y,0) 与关于 xOy 对称点 P'(x,y,-z)
    const wx = x * k, wy = y * k, wz = z * k;
    const wO = [0, 0, 0], wP = [wx, wy, wz], wH = [wx, wy, 0], wSym = [wx, wy, -wz];
    // 坐标长方体虚线框
    parts.push(segmentSvg([wx, 0, 0], wH, P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg([0, wy, 0], wH, P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg(wH, wP, P, { accent: true, dashed: true, width: 2.2 }));
    parts.push(segmentSvg(wH, wSym, P, { warn: true, dashed: true, width: 2.2 }));
    // 主向量 OP 与 对称点探针
    parts.push(segmentSvg(wO, wP, P, { accent: true, width: 3.0 }));
    parts.push(solidSvg(cylinder(wx, wy, wz - 2, wz + 4, 4.0, P, 12), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wx, wy, -wz - 2, -wz + 4, 3.6, P, 12), { tone: "mid" }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">空间直角坐标系与对称点卡尺台 · P(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">模长 |OP| = √(x²+y²+z²) = ${norm.toFixed(2)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">关于xOy对称 P'(${x.toFixed(1)},${y.toFixed(1)},${(-z).toFixed(1)})</text>`);

    // 5. 右侧双千分表：向量模长 |OP| 与 对称点间距 |PP'|
    parts.push(dialGaugeSvg(490, 80, 33, norm, 5.2, "空间模长 |OP|", ""));
    parts.push(dialGaugeSvg(490, 226, 33, symDist, 5.0, "对称间距 |PP'|", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">关于谁对称谁不变</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>空间直角坐标与对称点卡尺台</b>：点 \\(P(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})\\) 在 \\(xOy\\) 平面上的正射影为 \\(H(${x.toFixed(1)}, ${y.toFixed(1)}, 0)\\)，空间模长 \\(|\\vec{OP}|=\\sqrt{x^2+y^2+z^2}=${norm.toFixed(2)}\\)。<br>` +
        `<b>空间对称口诀（关于谁对称，谁的坐标不变，其余变相反数）</b>：关于 \\(xOy\\) 平面对称点为 \\(P'(${x.toFixed(1)}, ${y.toFixed(1)}, ${(-z).toFixed(1)})\\)（间距 \\(2|z|=${symDist.toFixed(2)}\\)）；关于 \\(x\\) 轴对称点为 \\((${x.toFixed(1)}, ${(-y).toFixed(1)}, ${(-z).toFixed(1)})\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 1.3 集合的基本运算：多层透明 Venn 布尔光栅叠合与摩根定律实验台 (Isometric Multi-Layer Venn Boolean Filter & De Morgan Rig)
   * viewBox: 0 0 560 340
   */
  function renderVennBench(svg, desc, sepVal, opModeVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const d = Math.max(0, Math.min(52, Number.isFinite(Number(sepVal)) ? Number(sepVal) : 22));
    const mode = Math.max(0, Math.min(3, Math.round(Number(opModeVal) || 0)));
    const R = 28;
    // 归一化面积：全集 |U| = 100, |A| = 35, |B| = 35
    const ratioOverlap = d >= 2 * R ? 0 : (2 * R * R * Math.acos(d / (2 * R)) - 0.5 * d * Math.sqrt(Math.max(0, 4 * R * R - d * d))) / (Math.PI * R * R);
    const cardA = 35, cardB = 35;
    const cardInter = +(35 * ratioOverlap).toFixed(1);
    const cardUnion = +(cardA + cardB - cardInter).toFixed(1);
    const cardCompUnion = +(100 - cardUnion).toFixed(1);
    const cardCompInter = +(100 - cardInter).toFixed(1);

    const modeNames = ["交集 A∩B", "并集 A∪B", "并之补 ∁U(A∪B)", "交之补 ∁U(A∩B)"];
    const modeVals = [cardInter, cardUnion, cardCompUnion, cardCompInter];
    const curVal = modeVals[mode];

    const P = { scale: 1.42, origin: [198, 190], azimuth: 28, elevation: 26 };
    const parts = [];

    // 1. 全集 U 光学实验底座 (|U| = 100)
    parts.push(solidSvg(slabOf({ x: -88, y: -56, w: 176, d: 112, r: 8 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -78, y: -46, w: 156, d: 92, r: 5 }, 4, 7, P, 4, 0.3), { tone: mode >= 2 ? "hi" : "mid", accent: mode === 2 }));

    // 2. 集合 A 与 集合 B 双圆光栅盘
    const cxA = -d * 0.5, cxB = d * 0.5;
    parts.push(solidSvg(cylinder(cxA, 0, 7, 15, R, P, 28), { tone: mode === 1 ? "hi" : "mid", accent: mode === 1 }));
    parts.push(solidSvg(cylinder(cxB, 0, 11, 19, R, P, 28), { tone: mode === 1 ? "hi" : "mid", accent: mode === 1 }));

    // 3. 交集透镜高亮柱 (当 d < 2R 时绘制重叠核心区)
    if (d < 2 * R - 1) {
      const rx = Math.max(3, R - d * 0.5);
      const ry = Math.sqrt(Math.max(9, R * R - (d * 0.5) * (d * 0.5)));
      const lensRing = [];
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        lensRing.push([rx * Math.cos(a), ry * Math.sin(a)]);
      }
      parts.push(solidSvg(extrude(lensRing, 15, 25, P, 0.2), { tone: "hi", accent: mode === 0 }));
    }

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">Venn 布尔光栅与摩根定律台 · ${modeNames[mode]}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">|A∩B|=${cardInter.toFixed(1)}, |A∪B|=${cardUnion.toFixed(1)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">当前运算测度 = ${curVal.toFixed(1)} (全集 |U|=100)</text>`);

    // 5. 右侧双千分表：当前运算测度 与 交集重叠度 |A∩B|
    parts.push(dialGaugeSvg(490, 80, 33, curVal, 100, "当前区域测度", ""));
    parts.push(dialGaugeSvg(490, 226, 33, cardInter, 35, "交集重叠 |A∩B|", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">并之补 = 补之交</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>Venn 布尔光栅叠合台</b>：全集 \\(|U|=100\\)，光栅圆盘 \\(|A|=35,\\ |B|=35\\)。容斥原理恒成立：\\(|A\\cup B|=|A|+|B|-|A\\cap B|=35+35-${cardInter.toFixed(1)}=${cardUnion.toFixed(1)}\\)。<br>` +
        `<b>德·摩根定律（De Morgan）验证</b>：<b>并之补等于补之交</b> \\(|\\complement_U(A\\cup B)|=|\\complement_U A\\cap\\complement_U B|=${cardCompUnion.toFixed(1)}\\)；<b>交之补等于补之并</b> \\(|\\complement_U(A\\cap B)|=|\\complement_U A\\cup\\complement_U B|=${cardCompInter.toFixed(1)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 2.2 基本不等式：赵爽弦图三维升降块与均值不等式链 (H≤G≤A≤Q) 天平台 (Isometric Zhao Shuang Windmill & Mean-Chain Pillar Rig)
   * viewBox: 0 0 560 340
   */
  function renderAmGmBench(svg, desc, aVal, bVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const a = Math.max(1.0, Math.min(5.0, Number.isFinite(Number(aVal)) ? Number(aVal) : 4.0));
    const b = Math.max(1.0, Math.min(5.0, Number.isFinite(Number(bVal)) ? Number(bVal) : 1.5));
    const H = (2 * a * b) / (a + b);
    const G = Math.sqrt(a * b);
    const A = 0.5 * (a + b);
    const Q = Math.sqrt(0.5 * (a * a + b * b));
    const sqGap = (a - b) * (a - b);

    const P = { scale: 1.42, origin: [198, 194], azimuth: 28, elevation: 25 };
    const parts = [];

    // 1. 等距双工位底座：左侧赵爽弦图台 + 右侧四均值测高柱台
    parts.push(solidSvg(slabOf({ x: -96, y: -56, w: 204, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));

    // 2. 左侧工位 (cx = -52)：赵爽弦图外正方形 (边长 √(a²+b²) 缩放适配) 与 中心差方柱 |a-b|²
    const kS = 6.8;
    const cSide = Math.hypot(a, b) * kS;
    const holeSide = Math.abs(a - b) * kS;
    const cx = -50, cy = 0;
    const outerPoly = [
      [cx - cSide * 0.5, cy - cSide * 0.5],
      [cx + cSide * 0.5, cy - cSide * 0.5],
      [cx + cSide * 0.5, cy + cSide * 0.5],
      [cx - cSide * 0.5, cy + cSide * 0.5]
    ];
    parts.push(solidSvg(extrude(outerPoly, 4, 15, P, 0.2), { tone: "mid", accent: true }));
    if (holeSide > 1.2) {
      const holePoly = [
        [cx - holeSide * 0.5, cy - holeSide * 0.5],
        [cx + holeSide * 0.5, cy - holeSide * 0.5],
        [cx + holeSide * 0.5, cy + holeSide * 0.5],
        [cx - holeSide * 0.5, cy + holeSide * 0.5]
      ];
      parts.push(solidSvg(extrude(holePoly, 15, 28, P, 0.2), { tone: "hi" }));
    }

    // 3. 右侧工位 (x from 14 to 86)：四根均值测量立柱 H ≤ G ≤ A ≤ Q
    const means = [
      { v: H, x: 18, tone: "mid" },
      { v: G, x: 40, tone: "hi", accent: true },
      { v: A, x: 62, tone: "hi", accent: true },
      { v: Q, x: 84, tone: "mid" }
    ];
    const hScale = 11.5;
    for (const m of means) {
      parts.push(solidSvg(cylinder(m.x, 0, 4, 4 + m.v * hScale, 6.8, P, 16), { tone: m.tone, accent: m.accent }));
    }
    // 阶梯包络线连接四柱顶心
    const topPts = means.map((m) => iso([m.x, 0, 4 + m.v * hScale + 2], P));
    parts.push(`<path d="${pathOf(topPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="2.4"/>`);

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">赵爽弦图与均值不等式链实验台 · H ≤ G ≤ A ≤ Q (${Math.abs(a - b) < 1e-6 ? "a=b 取等锁死!" : "a≠b 严格不等"})</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">弦图差方 (a-b)² = ${sqGap.toFixed(2)} ≥ 0</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">H=${H.toFixed(2)} ≤ G=${G.toFixed(2)} ≤ A=${A.toFixed(2)} ≤ Q=${Q.toFixed(2)}</text>`);

    // 5. 右侧双千分表：算术平均 A=(a+b)/2 与 几何平均 G=√(ab)
    parts.push(dialGaugeSvg(490, 80, 33, A, 5.0, "算术均值 A", ""));
    parts.push(dialGaugeSvg(490, 226, 33, G, 5.0, "几何均值 G", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">一正二定三相等</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>赵爽弦图与均值链测高台</b>：左侧外正方形面积 \\(a^2+b^2=${(a * a + b * b).toFixed(2)}\\)，四个全等直角三角形面积和 \\(2ab=${(2 * a * b).toFixed(2)}\\)，中心凸起小正方形面积即为差值 \\((a-b)^2=${sqGap.toFixed(2)}\\ge 0\\)。<br>` +
        `<b>均值不等式链</b>：调和均值 \\(H=${H.toFixed(2)}\\le\\) 几何均值 \\(G=\\sqrt{ab}=${G.toFixed(2)}\\le\\) 算术均值 \\(A=\\dfrac{a+b}{2}=${A.toFixed(2)}\\le\\) 平方均值 \\(Q=${Q.toFixed(2)}\\)，当且仅当 \\(a=b\\) 时中心小正方形消失、四柱平齐取等号！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 3.2 函数的基本性质：奇函数 180° 中心旋转台与偶函数轴对称折叠镜台 (Isometric Parity Fold-Leaf & 180° Rotor Rig)
   * viewBox: 0 0 560 340
   */
  function renderParityBench(svg, desc, degVal, modeVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const deg = Math.max(0, Math.min(180, Number.isFinite(Number(degVal)) ? Number(degVal) : 180));
    const isOdd = Math.round(Number(modeVal) || 0) === 1;
    const rad = deg * RAD;
    const x0 = 2.0;
    const yRight = isOdd ? 0.25 * x0 * x0 * x0 : 0.35 * x0 * x0 - 1.2;
    const yLeft = isOdd ? -yRight : yRight;

    const P = { scale: 1.42, origin: [198, 192], azimuth: 28, elevation: 25 };
    const kX = 22, kY = 18;
    const parts = [];

    // 1. 等距对称检验底座与坐标轴
    parts.push(solidSvg(slabOf({ x: -86, y: -56, w: 172, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -74, y: -44, w: 148, d: 88, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));
    parts.push(segmentSvg([-68, 0, 7.2], [68, 0, 7.2], P, { width: 1.6 }));
    parts.push(segmentSvg([0, -40, 7.2], [0, 40, 7.2], P, { accent: !isOdd, width: 2.2 }));

    // 2. 绘制左半支目标基准曲线 (x in [-2.6, 0], dashed) 与 右半支原曲线 (x in [0, 2.6], solid)
    const leftPts = [], rightPts = [], movPts = [];
    for (let i = 0; i <= 24; i++) {
      const u = (i / 24) * 2.5;
      const fu = isOdd ? 0.25 * u * u * u : 0.35 * u * u - 1.2;
      const fl = isOdd ? -fu : fu;
      rightPts.push(iso([u * kX, fu * kY, 8], P));
      leftPts.push(iso([-u * kX, fl * kY, 8], P));
      if (!isOdd) {
        // 偶函数：绕 y 轴在三维空间翻折角 deg
        const mx = u * kX * Math.cos(rad);
        const my = fu * kY;
        const mz = 8 + u * kX * Math.sin(rad) * 0.65;
        movPts.push(iso([mx, my, mz], P));
      } else {
        // 奇函数：绕原点 O 在平面内中心旋转角 deg
        const mx = u * kX * Math.cos(rad) - fu * kY * Math.sin(rad);
        const my = u * kX * Math.sin(rad) + fu * kY * Math.cos(rad);
        movPts.push(iso([mx, my, 9], P));
      }
    }
    parts.push(`<path d="${pathOf(leftPts, false)}" fill="none" stroke="var(--iso-ink-muted)" stroke-width="2.2" stroke-dasharray="4 3"/>`);
    parts.push(`<path d="${pathOf(rightPts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="2.8"/>`);
    parts.push(`<path d="${pathOf(movPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="3.0"/>`);
    parts.push(solidSvg(cylinder(0, 0, 6.5, 16, 4.0, P, 12), { tone: "hi", accent: isOdd }));

    // 3. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">${isOdd ? "奇函数 180° 中心旋转台 · f(-x) = -f(x)" : "偶函数 y 轴对称三维折叠镜台 · f(-x) = f(x)"}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">右支 f(2)=${yRight.toFixed(2)} ↔ 左支 f(-2)=${yLeft.toFixed(2)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">当前${isOdd ? "旋转" : "翻折"}角 θ=${Math.round(deg)}° (${Math.round(deg) === 180 ? "100% 重合!" : "未到位"})</text>`);

    // 4. 右侧双千分表：旋转/翻折角 θ 与 重合误差角 |180°-θ|
    parts.push(dialGaugeSvg(490, 80, 33, deg, 180, isOdd ? "中心旋转角 θ" : "轴翻折角 θ", "°"));
    parts.push(dialGaugeSvg(490, 226, 33, 180 - deg, 180, "重合余角 180-θ", "°"));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">定义域必关于0对称</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>${isOdd ? "奇函数中心旋转检验台" : "偶函数轴对称折叠检验台"}</b>：将右半支图象（\\(x\\ge 0\\)）${isOdd ? "绕坐标原点 \\(O(0,0)\\) 旋转" : "沿 \\(y\\) 轴在三维空间翻折"} \\(\\theta=${Math.round(deg)}^\\circ\\)。当 \\(\\theta=180^\\circ\\) 时，右半支与左半支严丝合缝完全重合（\\(f(-x)=${isOdd ? "-f(x)" : "f(x)"}\\)）。<br>` +
        `<b>第一铁律</b>：判断奇偶性前<b>必须先看定义域是否关于原点对称</b>！若奇函数在 \\(x=0\\) 处有定义，则必有 \\(f(0)=0\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 4.4 对数函数：指对互为反函数 y=x 45° 半透反射镜对称台 (Isometric Exponential-Logarithmic y=x Mirror Rig)
   * viewBox: 0 0 560 340
   */
  function renderExpLogBench(svg, desc, baseVal, x0Val, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const a = Math.max(1.4, Math.min(3.0, Number.isFinite(Number(baseVal)) ? Number(baseVal) : 2.0));
    const x0 = Math.max(-1.0, Math.min(1.6, Number.isFinite(Number(x0Val)) ? Number(x0Val) : 1.0));
    const y0 = Math.pow(a, x0);
    const chordDist = Math.SQRT2 * Math.abs(y0 - x0);

    const P = { scale: 1.42, origin: [198, 196], azimuth: 28, elevation: 25 };
    const k = 14;
    const parts = [];

    // 1. 等距坐标底板
    parts.push(solidSvg(slabOf({ x: -84, y: -58, w: 168, d: 116, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -72, y: -46, w: 144, d: 92, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));
    const ox = -24, oy = -18;
    parts.push(segmentSvg([ox - 36, oy, 7], [ox + 84, oy, 7], P, { width: 1.6 }));
    parts.push(segmentSvg([ox, oy - 24, 7], [ox, oy + 58, 7], P, { width: 1.6 }));

    // 2. 沿 y = x 竖立的 45° 半透光学反射镜板
    const m0 = [ox - 20, oy - 20], m1 = [ox + 54, oy + 54];
    const mirrorBase = [m0, [m0[0] + 1.5, m0[1] - 1.5], [m1[0] + 1.5, m1[1] - 1.5], m1];
    parts.push(solidSvg(extrude(mirrorBase, 6.5, 22, P, 0.1), { tone: "hi" }));

    // 3. 指数曲线 y = a^x 与 对数曲线 y = log_a(x)
    const expPts = [], logPts = [];
    for (let i = 0; i <= 24; i++) {
      const u = -1.2 + (i / 24) * 2.9;
      const v = Math.pow(a, u);
      if (v <= 4.0) {
        expPts.push(iso([ox + u * k, oy + v * k, 8], P));
        logPts.push(iso([ox + v * k, oy + u * k, 8], P));
      }
    }
    parts.push(`<path d="${pathOf(expPts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="2.8"/>`);
    parts.push(`<path d="${pathOf(logPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="2.8"/>`);

    // 4. 对称点对 P(x0, a^x0) 与 P'(a^x0, x0) 及垂直对称弦
    const wP = [ox + x0 * k, oy + y0 * k, 10];
    const wQ = [ox + y0 * k, oy + x0 * k, 10];
    parts.push(segmentSvg(wP, wQ, P, { warn: true, dashed: true, width: 2.2 }));
    parts.push(solidSvg(cylinder(wP[0], wP[1], 6.5, 16, 3.4, P, 10), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wQ[0], wQ[1], 6.5, 16, 3.4, P, 10), { tone: "hi" }));

    // 5. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">指对反函数 y=x 反射镜台 · 底数 a=${a.toFixed(1)} (y=a^x ↔ y=log_a x)</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">指数点 P(${x0.toFixed(1)}, ${y0.toFixed(2)})</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">镜像对数点 P'(${y0.toFixed(2)}, ${x0.toFixed(1)})</text>`);

    // 6. 右侧双千分表：指数值 y0=a^x0 与 镜像弦长 |PP'|
    parts.push(dialGaugeSvg(490, 80, 33, y0, 6.0, "函数值 y₀=aˣ⁰", ""));
    parts.push(dialGaugeSvg(490, 226, 33, chordDist, 6.0, "镜像弦长 |PP'|", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">关于直线 y=x 对称</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>指对反函数 \\(y=x\\) 半透反射镜台</b>：同底数的指数函数 \\(y=${a.toFixed(1)}^x\\)（必过定点 \\((0,1)\\)）与对数函数 \\(y=\\log_{${a.toFixed(1)}}x\\)（必过定点 \\((1,0)\\)）互为反函数，图象关于 \\(45^\\circ\\) 反射镜 \\(y=x\\) 严格对称。<br>` +
        `<b>坐标互换定律</b>：指数曲线上点 \\(P(${x0.toFixed(1)}, ${y0.toFixed(2)})\\) 经 \\(y=x\\) 镜面反射后，横纵坐标互换落在对数曲线点 \\(P'(${y0.toFixed(2)}, ${x0.toFixed(1)})\\)，连线 \\(PP'\\) 被直线 \\(y=x\\) 垂直平分（弦长 \\(${chordDist.toFixed(2)}\\)）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 5.6 函数 y=Asin(ωx+φ)：「先平移后伸缩」vs「先伸缩后平移」双轨变速齿轮对比台 (Isometric Dual-Track Phase-Shift & Scale Rig)
   * viewBox: 0 0 560 340
   */
  function renderAsinBench(svg, desc, omgVal, phiDegVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const omg = Math.max(1.0, Math.min(3.0, Number.isFinite(Number(omgVal)) ? Number(omgVal) : 2.0));
    const phiDeg = Math.max(-90, Math.min(90, Number.isFinite(Number(phiDegVal)) ? Number(phiDegVal) : 60));
    const phiRad = phiDeg * RAD;
    const trueShiftDeg = -phiDeg / omg;
    const wrongShiftDeg = -phiDeg;
    const errDeg = Math.abs(trueShiftDeg - wrongShiftDeg);

    const P = { scale: 1.42, origin: [198, 190], azimuth: 28, elevation: 25 };
    const parts = [];

    // 1. 双轨波槽底座：前轨 = 正确变换 sin(ωx+φ) = sin[ω(x + φ/ω)]；后轨 = 常见错解 sin[ω(x+φ)]
    parts.push(solidSvg(slabOf({ x: -94, y: -56, w: 196, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -84, y: -46, w: 176, d: 92, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 绘制前轨正确波形 (y = -18) 与 后轨错误波形 (y = +20)
    const x0 = -76, span = 156, R = 18;
    const okPts = [], badPts = [];
    for (let i = 0; i <= 54; i++) {
      const t = (i / 54) * Math.PI * 2;
      const wx = x0 + (i / 54) * span;
      const zOk = 14 + R * Math.sin(omg * t + phiRad);
      const zBad = 14 + R * Math.sin(omg * (t + phiRad));
      okPts.push(iso([wx, -18, zOk], P));
      badPts.push(iso([wx, 20, zBad], P));
    }
    parts.push(segmentSvg([x0, -18, 14], [x0 + span, -18, 14], P, { dashed: true, width: 1.4 }));
    parts.push(segmentSvg([x0, 20, 14], [x0 + span, 20, 14], P, { dashed: true, width: 1.4 }));
    parts.push(`<path d="${pathOf(badPts, false)}" fill="none" stroke="var(--iso-warn)" stroke-width="2.4" stroke-dasharray="5 3"/>`);
    parts.push(`<path d="${pathOf(okPts, false)}" fill="none" stroke="var(--iso-accent)" stroke-width="3.0"/>`);

    // 3. 零相位参考销钉对比 (标出正确起点 x = -φ/ω 与 错误起点 x = -φ)
    const wxOk = x0 + ((0.5 * Math.PI - phiRad / omg) / (2 * Math.PI)) * span;
    const wxBad = x0 + ((0.5 * Math.PI - phiRad) / (2 * Math.PI)) * span;
    parts.push(solidSvg(cylinder(wxOk, -18, 6.5, 24, 3.8, P, 12), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wxBad, 20, 6.5, 24, 3.8, P, 12), { tone: "mid" }));
    parts.push(segmentSvg([wxOk, -18, 22], [wxBad, 20, 22], P, { warn: true, width: 2.2 }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">三角图象伸缩平移双轨对比台 · ω=${omg.toFixed(1)}, φ=${Math.round(phiDeg)}°</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">正确平移量 -φ/ω = ${trueShiftDeg.toFixed(1)}°</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">漏除 ω 误移 -φ = ${wrongShiftDeg.toFixed(0)}° (差 ${errDeg.toFixed(1)}°)</text>`);

    // 5. 右侧双千分表：正确平移角 |-φ/ω| 与 漏除 ω 产生的相位偏差
    parts.push(dialGaugeSvg(490, 80, 33, Math.abs(trueShiftDeg), 90, "正确位移 |φ/ω|", "°"));
    parts.push(dialGaugeSvg(490, 226, 33, errDeg, 60, "漏除ω误差 Δx", "°"));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">平移只针对单个 x</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>双轨变速齿轮对比台</b>：将 \\(y=\\sin(\\omega x)\\) 变换为 \\(y=\\sin(${omg.toFixed(1)}x ${phiDeg >= 0 ? "+" : ""}${Math.round(phiDeg)}^\\circ)=\\sin\\left[${omg.toFixed(1)}\\left(x ${phiDeg >= 0 ? "+" : ""}${Math.abs(trueShiftDeg).toFixed(1)}^\\circ\\right)\\right]\\)。<br>` +
        `<b>头号易错红线（平移永远只针对单个 \\(x\\) 而言）</b>：前轨（实线）提取系数 \\(\\omega=${omg.toFixed(1)}\\) 后，真实平移量为 \\(-\\dfrac{\\varphi}{\\omega}=${trueShiftDeg.toFixed(1)}^\\circ\\)；后轨（虚线）错移了 \\(-\\varphi=${wrongShiftDeg.toFixed(0)}^\\circ\\)，产生 \\(${errDeg.toFixed(1)}^\\circ\\) 的机械相位偏差！`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 6.4 平面向量的应用：余弦定理铰链臂与正弦定理外接圆 2R 定径卡尺台 (Isometric Law of Cosines Hinge & Circumcircle 2R Rig)
   * viewBox: 0 0 560 340
   */
  function renderCosineSineBench(svg, desc, bVal, cVal, degAVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const b = Math.max(2.0, Math.min(4.5, Number.isFinite(Number(bVal)) ? Number(bVal) : 3.5));
    const c = Math.max(2.0, Math.min(4.5, Number.isFinite(Number(cVal)) ? Number(cVal) : 4.0));
    const degA = Math.max(30, Math.min(135, Number.isFinite(Number(degAVal)) ? Number(degAVal) : 60));
    const radA = degA * RAD;
    const a = Math.sqrt(Math.max(0.01, b * b + c * c - 2 * b * c * Math.cos(radA)));
    const twoR = a / Math.sin(radA);
    const R = 0.5 * twoR;

    const P = { scale: 1.42, origin: [198, 192], azimuth: 28, elevation: 25 };
    const k = 12.5;
    const parts = [];

    // 1. 等距解三角形底座
    parts.push(solidSvg(slabOf({ x: -88, y: -58, w: 176, d: 116, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -76, y: -46, w: 152, d: 92, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 计算 △ABC 顶点与外接圆圆心 O（将外接圆圆心置于世界原点附近以稳居底板中央）
    // 在局部坐标：A_loc = (0,0), B_loc = (c, 0), C_loc = (b cos A, b sin A)
    // 外心 O_loc: ox = c/2, oy = (b cos A - c/2) / tan A + (b sin A)/2 = (b - c cos A) / (2 sin A)
    const oxLoc = 0.5 * c;
    const oyLoc = (b - c * Math.cos(radA)) / (2 * Math.sin(radA));
    const toW = (lx, ly, z) => [(lx - oxLoc) * k, (ly - oyLoc) * k, z];

    // 3. 外接圆黄铜定径环 (半径 R*k，圆心在 (0,0,7))
    const rWorld = Math.min(46, R * k);
    const scaleFit = rWorld / (R * k);
    const fitW = (lx, ly, z) => [(lx - oxLoc) * k * scaleFit, (ly - oyLoc) * k * scaleFit, z];
    parts.push(annulusSvg(0, 0, rWorld, Math.max(0, rWorld - 2.6), 7.2, P, 36, { tone: "mid" }));

    const wA = fitW(0, 0, 10);
    const wB = fitW(c, 0, 10);
    const wC = fitW(b * Math.cos(radA), b * Math.sin(radA), 10);

    // 铰链双臂 b, c 与 余弦对边 a
    parts.push(segmentSvg(wA, wB, P, { accent: true, width: 3.0 }));
    parts.push(segmentSvg(wA, wC, P, { accent: true, width: 3.0 }));
    parts.push(segmentSvg(wB, wC, P, { warn: true, width: 3.2 }));
    parts.push(solidSvg(cylinder(wA[0], wA[1], 6.5, 16, 4.0, P, 12), { tone: "hi", accent: true }));
    parts.push(solidSvg(cylinder(wB[0], wB[1], 6.5, 15, 3.4, P, 10), { tone: "hi" }));
    parts.push(solidSvg(cylinder(wC[0], wC[1], 6.5, 15, 3.4, P, 10), { tone: "hi" }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">正余弦定理铰链与外接圆卡尺台 · b=${b.toFixed(1)}, c=${c.toFixed(1)}, A=${Math.round(degA)}°</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">余弦对边 a = ${a.toFixed(2)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">外接圆直径 2R = a/sinA = ${twoR.toFixed(2)}</text>`);

    // 5. 右侧双千分表：对边长 a 与 外接圆直径 2R
    parts.push(dialGaugeSvg(490, 80, 33, a, 8.0, "对边长度 a", ""));
    parts.push(dialGaugeSvg(490, 226, 33, twoR, 9.0, "外接圆直径 2R", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">a/sinA = 2R</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>余弦定理铰链臂与外接圆卡尺台</b>：已知两边 \\(b=${b.toFixed(1)},\\ c=${c.toFixed(1)}\\) 及夹角 \\(A=${Math.round(degA)}^\\circ\\)，由<b>余弦定理</b>实时解出对边 \\(a=\\sqrt{b^2+c^2-2bc\\cos A}=${a.toFixed(2)}\\)。<br>` +
        `<b>正弦定理外接圆定径</b>：由 \\(\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R\\)，锁定外接圆直径 \\(2R=\\dfrac{${a.toFixed(2)}}{\\sin ${Math.round(degA)}^\\circ}=${twoR.toFixed(2)}\\)（半径 \\(R=${R.toFixed(2)}\\)），三角形面积 \\(S=\\dfrac{1}{2}bc\\sin A=${(0.5 * b * c * Math.sin(radA)).toFixed(2)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 9.2 用样本估计总体：样本百分位数与五数箱线图游标分拣台 (Isometric 5-Number Boxplot & Outlier Robustness Rig)
   * viewBox: 0 0 560 340
   */
  function renderBoxplotBench(svg, desc, outlierVal, spreadVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const xMax = Math.max(2.0, Math.min(8.0, Number.isFinite(Number(outlierVal)) ? Number(outlierVal) : 2.5));
    const s = Math.max(0.6, Math.min(1.5, Number.isFinite(Number(spreadVal)) ? Number(spreadVal) : 1.0));
    // 9 个升序样本：[-2s, -1.5s, -1s, -0.5s, 0, 0.5s, 1s, 1.5s, xMax]
    const data = [-2 * s, -1.5 * s, -1 * s, -0.5 * s, 0, 0.5 * s, 1 * s, 1.5 * s, xMax];
    const q1 = data[2]; // 9×25% = 2.25 → 第 3 项 (-s)
    const q2 = data[4]; // 9×50% = 4.5  → 第 5 项 (0)
    const q3 = data[6]; // 9×75% = 6.75 → 第 7 项 (+s)
    const mean = data.reduce((acc, v) => acc + v, 0) / data.length;
    const variance = data.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / data.length;
    const sd = Math.sqrt(variance);

    const P = { scale: 1.42, origin: [190, 192], azimuth: 28, elevation: 25 };
    const k = 12;
    const parts = [];

    // 1. 等距分拣滑轨底座
    parts.push(solidSvg(slabOf({ x: -78, y: -54, w: 188, d: 108, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -68, y: -42, w: 168, d: 84, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 四分位箱体 [Q1, Q3] 三维透明盒 + 中位数 Q2 激光切面
    const wxMin = data[0] * k, wxQ1 = q1 * k, wxQ2 = q2 * k, wxQ3 = q3 * k, wxMax = xMax * k;
    parts.push(segmentSvg([wxMin, 0, 12], [wxMax, 0, 12], P, { width: 2.2 }));
    parts.push(solidSvg(slabOf({ x: wxQ1, y: -22, w: Math.max(4, wxQ3 - wxQ1), d: 44, r: 3 }, 6.5, 22, P, 4, 0.2), { tone: "hi", accent: true }));
    // 中位数 Q2 = 0 切刀片
    parts.push(segmentSvg([wxQ2, -26, 24], [wxQ2, 26, 24], P, { accent: true, width: 3.2 }));

    // 3. 样本点立柱与均值 x̄ 偏移游标
    for (let i = 0; i < data.length; i++) {
      const isOut = i === 8 && xMax > 3.5;
      parts.push(solidSvg(cylinder(data[i] * k, -30, 6.5, isOut ? 25 : 15, isOut ? 3.8 : 2.6, P, 10), { tone: isOut ? "hi" : "mid" }));
    }
    const wxMean = mean * k;
    parts.push(solidSvg(coneFrustum(wxMean, 28, 6.5, 6.5, 0.5, 22, P, 12), { tone: "hi" }));
    parts.push(segmentSvg([wxQ2, 28, 16], [wxMean, 28, 16], P, { warn: true, width: 2.6 }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">百分位数与五数箱线图分拣台 · 极大值 x₉=${xMax.toFixed(1)}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">中位数 Q₂=${q2.toFixed(2)} (稳健不动!)</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">均值 x̄=${mean.toFixed(2)}, 标准差 s=${sd.toFixed(2)}</text>`);

    // 5. 右侧双千分表：样本均值 x̄ 与 样本标准差 s
    parts.push(dialGaugeSvg(490, 80, 33, mean, 1.5, "样本均值 x̄", ""));
    parts.push(dialGaugeSvg(490, 226, 33, sd, 3.0, "样本标准差 s", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">中位数抗极端值</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>五数箱线图与百分位数分拣台</b>：9 个升序样本的 25%、50%、75% 分位数分别为 \\(Q_1=${q1.toFixed(2)},\\ Q_2=${q2.toFixed(2)},\\ Q_3=${q3.toFixed(2)}\\)（四分位距 \\(\\text{IQR}=Q_3-Q_1=${(q3 - q1).toFixed(2)}\\)）。<br>` +
        `<b>统计稳健性对比</b>：当右侧极端值拉大至 \\(x_9=${xMax.toFixed(1)}\\) 时，<b>中位数 \\(Q_2=0\\) 与四分位盒纹丝不动</b>，而样本均值被拉偏至 \\(\\bar{x}=${mean.toFixed(2)}\\)、标准差膨胀至 \\(s=${sd.toFixed(2)}\\)（有偏数据优先用中位数代表中心位置！）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 2.5 直线与圆、圆与圆的位置关系：双圆心滑轨距 |O1O2| 与 R±r 五档啮合及公切线实验台 (Isometric Two-Circles Gear Track & Common-Tangent Rig)
   * viewBox: 0 0 560 340
   */
  function renderTwoCirclesBench(svg, desc, dVal, r1Val, r2Val, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const d = Math.max(0.0, Math.min(6.5, Number.isFinite(Number(dVal)) ? Number(dVal) : 3.5));
    const R = Math.max(2.0, Math.min(3.2, Number.isFinite(Number(r1Val)) ? Number(r1Val) : 2.5));
    const r = Math.max(0.8, Math.min(1.8, Number.isFinite(Number(r2Val)) ? Number(r2Val) : 1.5));
    const sumR = R + r;
    const diffR = Math.abs(R - r);

    let stateName = "相交", tanCount = 2;
    if (d > sumR + 0.08) { stateName = "外离"; tanCount = 4; }
    else if (Math.abs(d - sumR) <= 0.08) { stateName = "外切"; tanCount = 3; }
    else if (d > diffR + 0.08) { stateName = "相交"; tanCount = 2; }
    else if (Math.abs(d - diffR) <= 0.08 && d > 0) { stateName = "内切"; tanCount = 1; }
    else { stateName = "内含"; tanCount = 0; }

    const P = { scale: 1.42, origin: [192, 192], azimuth: 28, elevation: 25 };
    const k = 12.5;
    const parts = [];

    // 1. 等距线性滑轨机座
    parts.push(solidSvg(slabOf({ x: -86, y: -56, w: 184, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -76, y: -44, w: 164, d: 88, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 圆 O1 (固定于 x1 = -28) 与 滑块圆 O2 (x2 = x1 + d*k)
    const x1 = -28, x2 = x1 + d * k;
    const wR = R * k, wr = r * k;
    parts.push(annulusSvg(x1, 0, wR, Math.max(0, wR - 3), 8, P, 32, { tone: "mid" }));
    parts.push(annulusSvg(x2, 0, wr, Math.max(0, wr - 3), 10, P, 28, { tone: "hi", accent: true }));
    parts.push(segmentSvg([x1, 0, 11], [x2, 0, 11], P, { accent: true, width: 2.2 }));
    parts.push(solidSvg(cylinder(x1, 0, 6.5, 16, 3.2, P, 10), { tone: "hi" }));
    parts.push(solidSvg(cylinder(x2, 0, 6.5, 18, 3.2, P, 10), { tone: "hi", accent: true }));

    // 3. 公切线或公共弦激光线绘制
    if (tanCount >= 2 && d > diffR) {
      // 两条外公切线
      const sinAlpha = Math.min(0.99, (R - r) / Math.max(0.1, d));
      const cosAlpha = Math.sqrt(Math.max(0, 1 - sinAlpha * sinAlpha));
      for (const sgn of [-1, 1]) {
        const p1 = [x1 + wR * sinAlpha, sgn * wR * cosAlpha, 11];
        const p2 = [x2 + wr * sinAlpha, sgn * wr * cosAlpha, 11];
        parts.push(segmentSvg(p1, p2, P, { warn: true, width: 2.0 }));
      }
    }
    if (stateName === "相交" && d > 0.05) {
      // 公共弦长垂径定理勾股
      const xChord = (d * d + R * R - r * r) / (2 * d);
      const halfChord = Math.sqrt(Math.max(0, R * R - xChord * xChord));
      const wxC = x1 + xChord * k, wyC = halfChord * k;
      parts.push(segmentSvg([wxC, -wyC, 12], [wxC, wyC, 12], P, { accent: true, width: 3.0 }));
    }

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">双圆位置关系与公切线滑轨台 · d=${d.toFixed(1)}, R+r=${sumR.toFixed(1)}, |R-r|=${diffR.toFixed(1)}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">当前位置：${stateName} (圆心距 d=${d.toFixed(1)})</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">公切线条数 = ${tanCount} 条</text>`);

    // 5. 右侧双千分表：圆心距 d 与 公切线条数
    parts.push(dialGaugeSvg(490, 80, 33, d, 6.5, "圆心距 |O₁O₂|", ""));
    parts.push(dialGaugeSvg(490, 226, 33, tanCount, 4, "公切线条数", "条"));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">比对 |R-r| 与 R+r</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>双圆心滑轨五档啮合台</b>：大圆半径 \\(R=${R.toFixed(1)}\\)，小圆半径 \\(r=${r.toFixed(1)}\\)，两分界阈值为 \\(|R-r|=${diffR.toFixed(1)}\\) 与 \\(R+r=${sumR.toFixed(1)}\\)。<br>` +
        `<b>五档判定与公切线</b>：当前圆心距 \\(d=|O_1O_2|=${d.toFixed(1)}\\)，两圆处于<b>${stateName}</b>状态，共有 <b>${tanCount} 条</b>公切线（外离 4 条、外切 3 条、相交 2 条、内切 1 条、内含 0 条；相交时两圆方程相减即得公共弦所在直线方程）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 4.2 等差数列：高斯倒序相加以高补低三维阶梯拼合台 (Isometric Gauss Staircase-Inversion Block Rig)
   * viewBox: 0 0 560 340
   */
  function renderArithmeticBench(svg, desc, nVal, dVal, joinVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const n = Math.max(3, Math.min(6, Math.round(Number(nVal) || 5)));
    const d = Math.max(0.5, Math.min(2.0, Number.isFinite(Number(dVal)) ? Number(dVal) : 1.0));
    const join = Math.max(0, Math.min(1, Number.isFinite(Number(joinVal)) ? Number(joinVal) : 1.0));
    const a1 = 1.0;
    const an = a1 + (n - 1) * d;
    const colSum = a1 + an;
    const Sn = 0.5 * n * colSum;

    const P = { scale: 1.42, origin: [198, 210], azimuth: 28, elevation: 24 };
    const parts = [];

    // 1. 等距阶梯拼合底座
    parts.push(solidSvg(slabOf({ x: -84, y: -48, w: 168, d: 96, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));

    // 2. 绘制 n 列正放阶梯 a_k 与 倒扣阶梯 a_{n+1-k}
    const colW = Math.min(22, 120 / n);
    const startX = -0.5 * n * colW;
    const hScale = Math.min(8.2, 64 / Math.max(2, colSum));
    const liftZ = (1 - join) * 20;

    for (let i = 0; i < n; i++) {
      const ak = a1 + i * d;
      const aRev = an - i * d;
      const x0 = startX + i * colW;
      const h1 = ak * hScale;
      const h2 = aRev * hScale;
      // 下层正放阶梯柱 (z from 4 to 4 + h1)
      parts.push(solidSvg(slabOf({ x: x0 + 1, y: -16, w: colW - 2, d: 32, r: 2 }, 4, 4 + h1, P, 3, 0.2), { tone: "mid", accent: true }));
      // 上层倒扣阶梯柱 (z from 4 + h1 + liftZ to 4 + h1 + h2 + liftZ)
      parts.push(solidSvg(slabOf({ x: x0 + 1, y: -16, w: colW - 2, d: 32, r: 2 }, 4 + h1 + liftZ, 4 + h1 + h2 + liftZ, P, 3, 0.2), { tone: "hi" }));
    }

    // 3. 拼合后的等高顶面激光基准线 (高度 a1 + an)
    const topZ = 4 + colSum * hScale + liftZ + 1;
    parts.push(segmentSvg([startX - 6, 0, topZ], [startX + n * colW + 6, 0, topZ], P, { warn: true, width: 2.6 }));

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">等差数列倒序相加三维阶梯台 · n=${n}, a₁=${a1.toFixed(1)}, d=${d.toFixed(1)}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">每列等高 a₁+aₙ = ${colSum.toFixed(1)}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">前n项和 Sₙ = n(a₁+aₙ)/2 = ${Sn.toFixed(2)}</text>`);

    // 5. 右侧双千分表：前 n 项和 Sn 与 单列齐平总高 a1+an
    parts.push(dialGaugeSvg(490, 80, 33, Sn, 33, "前n项和 Sₙ", ""));
    parts.push(dialGaugeSvg(490, 226, 33, colSum, 11, "单列总高 a₁+aₙ", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">2Sₙ = n(a₁+aₙ)</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>高斯倒序相加以高补低拼合台</b>：下层正放阶梯为 \\(a_1, a_2, \\dots, a_${n}\\)（末项 \\(a_${n}=${an.toFixed(1)}\\)），上层倒扣阶梯为 \\(a_${n}, a_${n - 1}, \\dots, a_1\\)。<br>` +
        `<b>对称下标和定律</b>：拼合后每一列高度恒等于 \\(a_k+a_{${n + 1}-k}=a_1+a_${n}=${colSum.toFixed(1)}\\)，合拼长方体总体积 \\(2S_${n}=${n}\\times ${colSum.toFixed(1)}=${(2 * Sn).toFixed(1)}\\)，故前 \\(n\\) 项和 \\(S_${n}=\\dfrac{n(a_1+a_n)}{2}=${Sn.toFixed(2)}\\)。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 6.3 二项式定理：杨辉三角三维帕斯卡分流金字塔与系数和实验台 (Isometric 3D Pascal Pyramid & Binomial Sum Rig)
   * viewBox: 0 0 560 340
   */
  function renderPascalBench(svg, desc, nVal, rVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const n = Math.max(2, Math.min(6, Math.round(Number(nVal) || 5)));
    const rawR = Number(rVal);
    const r = Math.max(0, Math.min(n, Math.round(Number.isFinite(rawR) ? rawR : 2)));

    function comb(nn, kk) {
      if (kk < 0 || kk > nn) return 0;
      let res = 1;
      for (let i = 1; i <= kk; i++) res = (res * (nn - i + 1)) / i;
      return Math.round(res);
    }

    const cnr = comb(n, r);
    const pLeft = comb(n - 1, r - 1);
    const pRight = comb(n - 1, r);
    const rowSum = Math.pow(2, n);
    const maxC = comb(n, Math.floor(n / 2));

    const P = { scale: 1.42, origin: [198, 204], azimuth: 28, elevation: 25 };
    const parts = [];

    // 1. 等距金字塔底座
    parts.push(solidSvg(slabOf({ x: -86, y: -56, w: 172, d: 112, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));

    // 2. 绘制第 n-1 层（父层，后排 y = -18）与 第 n 层（当前层，前排 y = +18）组合数立柱
    const stepX = Math.min(22, 126 / Math.max(2, n));
    const hScale = 52 / Math.max(2, maxC);

    // 父层 n-1
    const startPrev = -0.5 * (n - 1) * stepX;
    for (let k = 0; k <= n - 1; k++) {
      const val = comb(n - 1, k);
      const isParent = k === r - 1 || k === r;
      const xk = startPrev + k * stepX;
      parts.push(solidSvg(cylinder(xk, -18, 4, 6 + val * hScale, 6.2, P, 14), { tone: isParent ? "hi" : "mid", accent: isParent }));
    }

    // 当前层 n
    const startCur = -0.5 * n * stepX;
    for (let k = 0; k <= n; k++) {
      const val = comb(n, k);
      const isTarget = k === r;
      const xk = startCur + k * stepX;
      parts.push(solidSvg(cylinder(xk, 18, 4, 6 + val * hScale, 6.8, P, 14), { tone: isTarget ? "hi" : "mid", accent: isTarget }));
    }

    // 3. 帕斯卡递推分流连杆：C(n-1, r-1) + C(n-1, r) -> C(n, r)
    const xTarget = startCur + r * stepX;
    const zTarget = 7 + cnr * hScale;
    if (r - 1 >= 0) {
      const xL = startPrev + (r - 1) * stepX;
      parts.push(segmentSvg([xL, -18, 7 + pLeft * hScale], [xTarget, 18, zTarget], P, { warn: true, width: 2.6 }));
    }
    if (r <= n - 1) {
      const xR = startPrev + r * stepX;
      parts.push(segmentSvg([xR, -18, 7 + pRight * hScale], [xTarget, 18, zTarget], P, { warn: true, width: 2.6 }));
    }

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">杨辉三角三维帕斯卡分流台 · 第 T_${r + 1} 项系数 C(${n},${r}) = ${cnr}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">递推：${pLeft} + ${pRight} = ${cnr}</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">二项式系数和 ∑C(${n},k) = 2^${n} = ${rowSum}</text>`);

    // 5. 右侧双千分表：当前二项式系数 C(n,r) 与 二项式系数总和 2^n
    parts.push(dialGaugeSvg(490, 80, 33, cnr, 20, `系数 C(${n},${r})`, ""));
    parts.push(dialGaugeSvg(490, 226, 33, rowSum, 64, `系数总和 2^${n}`, ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">通项 T_{r+1}</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>杨辉三角三维帕斯卡分流台</b>：展开式第 \\(r+1=${r + 1}\\) 项的二项式系数为 \\(\\mathrm{C}_{${n}}^{${r}}=${cnr}\\)（与对称项 \\(\\mathrm{C}_{${n}}^{${n - r}}=${cnr}\\) 高度相等）。<br>` +
        `<b>帕斯卡递推与赋值法</b>：后排两父柱之和恰好汇流为前排目标柱 \\(\\mathrm{C}_{${n - 1}}^{${r - 1}}+\\mathrm{C}_{${n - 1}}^{${r}}=${pLeft}+${pRight}=${cnr}=\\mathrm{C}_{${n}}^{${r}}\\)；令 \\(x=1\\) 得第 \\(${n}\\) 层所有二项式系数之和恒为 \\(2^{${n}}=${rowSum}\\)（奇数项系数和 = 偶数项系数和 = \\(2^{${n - 1}}=${rowSum / 2}\\)）。`;
      if (renderMath) renderMath();
    }
  }

  /**
   * 8.1 成对数据的统计相关性：最小二乘回归「残差弹簧平方和」物理平衡杆实验台 (Isometric Least-Squares Residual-Spring Balance Rig)
   * viewBox: 0 0 560 340
   */
  function renderRegressionBench(svg, desc, slopeVal, shiftVal, renderMath) {
    injectStyles();
    svg.classList.add("iso-fig");
    const b = Math.max(0.0, Math.min(1.4, Number.isFinite(Number(slopeVal)) ? Number(slopeVal) : 0.73));
    const da = Math.max(-1.0, Math.min(1.0, Number.isFinite(Number(shiftVal)) ? Number(shiftVal) : 0.0));

    // 5 个中心化样本点 (x̄ = 0, ȳ = 0)，最优斜率 b̂ = 0.73, 最优截距偏移 Δa = 0
    const pts = [
      [-2.0, -1.5],
      [-1.0, -0.8],
      [0.0, 0.1],
      [1.0, 0.9],
      [2.0, 1.3]
    ];
    let rss = 0;
    for (const [xi, yi] of pts) {
      const ei = yi - (b * xi + da);
      rss += ei * ei;
    }

    const P = { scale: 1.42, origin: [198, 192], azimuth: 28, elevation: 25 };
    const kX = 26, kZ = 16;
    const parts = [];

    // 1. 等距散点回归底座
    parts.push(solidSvg(slabOf({ x: -86, y: -54, w: 172, d: 108, r: 7 }, -10, 4, P, 6, 1.0), { tone: "lo" }));
    parts.push(solidSvg(slabOf({ x: -74, y: -42, w: 148, d: 84, r: 4 }, 4, 6.5, P, 4, 0.3), { tone: "mid" }));

    // 2. 样本中心支点 (x̄, ȳ) = (0, 0) 黄铜轴承座
    const zBase = 32;
    parts.push(solidSvg(cylinder(0, 0, 6.5, zBase, 4.2, P, 12), { tone: "hi", accent: Math.abs(da) < 0.05 }));

    // 3. 候选回归平衡杆 y = b x + da 与 5 根残差拉伸弹簧 e_i
    const wLeft = [-2.4 * kX, 0, zBase + (-2.4 * b + da) * kZ];
    const wRight = [2.4 * kX, 0, zBase + (2.4 * b + da) * kZ];
    parts.push(segmentSvg(wLeft, wRight, P, { accent: true, width: 3.2 }));

    for (const [xi, yi] of pts) {
      const wx = xi * kX;
      const wzData = zBase + yi * kZ;
      const wzHat = zBase + (b * xi + da) * kZ;
      parts.push(solidSvg(cylinder(wx, 0, wzData - 2, wzData + 2, 3.2, P, 10), { tone: "hi" }));
      parts.push(segmentSvg([wx, 0, wzData], [wx, 0, wzHat], P, { warn: true, width: 2.4 }));
    }

    // 4. 固定安全区文字标注
    parts.push(`<text x="212" y="24" text-anchor="middle" font-size="13.5" font-weight="700" fill="var(--iso-hi)">最小二乘残差弹簧平衡杆台 · 斜率 b=${b.toFixed(2)}, 中心偏离 Δa=${da.toFixed(2)}</text>`);
    parts.push(`<text x="102" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-accent)">最优回归斜率 b̂ = 0.73 (过样本中心)</text>`);
    parts.push(`<text x="318" y="318" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--iso-warn)">残差平方和 RSS = ∑eᵢ² = ${rss.toFixed(3)}</text>`);

    // 5. 右侧双千分表：残差平方和 RSS 与 回归斜率 b
    parts.push(dialGaugeSvg(490, 80, 33, rss, 6.0, "残差平方和 RSS", ""));
    parts.push(dialGaugeSvg(490, 226, 33, b, 1.4, "回归斜率 b", ""));
    parts.push(`<text x="490" y="154" text-anchor="middle" font-size="11.5" font-weight="800" fill="var(--iso-accent)">必过中心 (x̄, ȳ)</text>`);

    svg.innerHTML = parts.join("\n");

    if (desc) {
      desc.innerHTML =
        `<b>最小二乘「残差弹簧平方和」平衡杆台</b>：每个样本点 \\((x_i,y_i)\\) 与回归直线 \\(\\hat{y}=bx+\\hat{a}\\) 之间挂有竖直残差弹簧 \\(e_i=y_i-\\hat{y}_i\\)，总势能正比于残差平方和 \\(\\text{RSS}=\\sum e_i^2=${rss.toFixed(3)}\\)。<br>` +
        `<b>两大核心铁律</b>：① 经验回归直线<b>必过样本中心点 \\((\\bar{x},\\bar{y})\\)</b>（当偏离 \\(\\Delta a\\ne 0\\) 时 \\(\\text{RSS}\\) 立即增大）；② 当且仅当 \\(b=\\hat{b}=0.73,\\ \\Delta a=0\\) 时，残差平方和达到全局极小值 \\(\\text{RSS}_{\\min}\\approx 0.041\\)！`;
      if (renderMath) renderMath();
    }
  }

  global.IsoBench = {
    isReal: true,
    cameraOf,
    iso,
    towardViewer,
    depthOf,
    fitProjection,
    pathOf,
    roundedPlan,
    circleRing,
    extrude,
    slabOf,
    cylinder,
    coneFrustum,
    ringOnZ,
    annulusSvg,
    sideTicks,
    solidSvg,
    lineSvg,
    segmentSvg,
    labelSvg,
    dialGaugeSvg,
    renderCavalieriBench,
    renderDihedralBench,
    renderLatheBench,
    renderWorkBench,
    renderParallelepipedBench,
    renderGantryBench,
    renderNormalDistBench,
    renderSecantBench,
    renderEllipseBench,
    renderSamplingBench,
    renderGaltonBench,
    renderHyperbolaBench,
    renderParabolaBench,
    renderComplexRotorBench,
    renderTrigPhasorBench,
    renderObliqueBench,
    renderSkewLinesBench,
    renderParallelBench,
    renderOctantBench,
    renderVennBench,
    renderAmGmBench,
    renderParityBench,
    renderExpLogBench,
    renderAsinBench,
    renderCosineSineBench,
    renderBoxplotBench,
    renderTwoCirclesBench,
    renderArithmeticBench,
    renderPascalBench,
    renderRegressionBench,
  };
})(typeof window !== "undefined" ? window : globalThis);
