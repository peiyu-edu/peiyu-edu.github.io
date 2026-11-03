// 培玉立体书 · 书页内容（canvas 画好当贴图，PY-503）
// 左页是正文，右页留出中间给立体件，标题和图注放在页脚上方。
import * as THREE from 'three';
import { C, SERIF, maxAnisotropy } from './ink.js';

export const PAGE_W = 1200, PAGE_H = 1600;

function wrapText(ctx, text, x, y, maxW, lh) {
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = ch;
    } else line += ch;
  }
  if (line) ctx.fillText(line, x, y);
  return y + lh;
}

function blank() {
  const cv = document.createElement('canvas');
  cv.width = PAGE_W; cv.height = PAGE_H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  for (let i = 0; i < 9000; i++) {            // 纸张颗粒
    ctx.fillStyle = `rgba(90,80,60,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * PAGE_W, Math.random() * PAGE_H, 2, 2);
  }
  ctx.fillStyle = C.ink;
  return { cv, ctx };
}

function toTexture(cv) {
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy();
  return tex;
}

/** 左页：页眉、篇名、大标题、导语、正文、一张小插图和图注。 */
export function leftPage({ header, part, title, lead, paras, figure, caption, page }) {
  const { cv, ctx } = blank();
  const L = 130, maxW = PAGE_W - L - 110;
  ctx.fillStyle = C.muted;
  ctx.font = `34px ${SERIF}`;
  ctx.fillText(header, L, 120);
  ctx.fillStyle = C.a;
  ctx.font = `600 48px ${SERIF}`;
  ctx.fillText(part, L, 250);
  ctx.fillStyle = C.ink;
  ctx.font = `700 116px ${SERIF}`;
  ctx.fillText(title, L, 380);
  ctx.fillStyle = C.hl;
  ctx.fillRect(L, 412, 150, 8);
  ctx.fillStyle = C.ink;
  ctx.font = `40px ${SERIF}`;
  let y = wrapText(ctx, lead, L, 510, maxW, 62);
  ctx.font = `34px ${SERIF}`;
  for (const p of paras) y = wrapText(ctx, p, L, y + 20, maxW, 56);
  const fy = y + 36, fh = Math.min(340, PAGE_H - 230 - fy);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.strokeRect(L, fy, maxW, fh);
  ctx.save();
  figure(ctx, L, fy, maxW, fh);
  ctx.restore();
  ctx.fillStyle = C.muted;
  ctx.font = `30px ${SERIF}`;
  ctx.textAlign = 'left';
  ctx.fillText(caption, L, fy + fh + 54);
  ctx.textAlign = 'center';
  ctx.fillText(String(page), PAGE_W / 2, PAGE_H - 70);
  return toTexture(cv);
}

/** 右页：立体件的定位圈（cx、cy 是页面比例坐标）、页脚上方的小节名和图注。 */
export function rightPage({ section, title, caption, page, ring = [0.533, 0.49, 336] }) {
  const { cv, ctx } = blank();
  if (ring) {
    ctx.strokeStyle = 'rgba(26,40,34,.28)'; ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath(); ctx.arc(PAGE_W * ring[0], PAGE_H * ring[1], ring[2], 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = C.muted;
  ctx.font = `34px ${SERIF}`;
  ctx.fillText(section, 110, PAGE_H - 330);
  ctx.fillStyle = C.ink;
  ctx.font = `700 64px ${SERIF}`;
  ctx.fillText(title, 110, PAGE_H - 250);
  ctx.fillStyle = C.muted;
  ctx.font = `32px ${SERIF}`;
  ctx.fillText(caption, 110, PAGE_H - 180);
  ctx.textAlign = 'center';
  ctx.fillText(String(page), PAGE_W / 2, PAGE_H - 70);
  return toTexture(cv);
}

// ---------- 左页小插图 ----------
const label = (ctx, text, x, y, size = 36, italic = false) => {
  ctx.fillStyle = C.ink;
  ctx.font = `${italic ? 'italic ' : ''}${size}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
};

export const figures = {
  fractions(ctx, x, y, w, h) {
    // 圆平均分 4 份取 1 份；长条平均分 8 份取 3 份
    const cx = x + w * 0.25, cy = y + h * 0.45, r = Math.min(110, h * 0.32);
    ctx.fillStyle = C.hlMark;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, -Math.PI / 2, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    label(ctx, '1/4', cx, y + h - 30, 38, true);
    const bx = x + w * 0.5, bw = w * 0.42, bh = 70, by = cy - bh / 2;
    ctx.fillStyle = C.jade;
    ctx.fillRect(bx, by, bw * 3 / 8, bh);
    ctx.strokeRect(bx, by, bw, bh);
    for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(bx + bw * i / 8, by); ctx.lineTo(bx + bw * i / 8, by + bh); ctx.stroke(); }
    label(ctx, '3/8', bx + bw / 2, y + h - 30, 38, true);
  },
  pythagoras(ctx, x, y, w, h) {
    // 3-4-5 直角三角形和三条边上的正方形
    const s = Math.min(w, h) / 13;
    const Cx = x + w * 0.42, Cy = y + h * 0.5 + s * 2;   // 图形纵向范围是 v ∈ [-7, 3]
    const P = (u, v) => [Cx + u * s, Cy + v * s];
    const poly = (pts, fill) => {
      ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.stroke();
    };
    ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    poly([P(0, 0), P(3, 0), P(3, 3), P(0, 3)], C.jade);       // a² 在下
    poly([P(0, 0), P(0, -4), P(-4, -4), P(-4, 0)], C.mist);   // b² 在左
    poly([P(3, 0), P(0, -4), P(4, -7), P(7, -3)], C.hlMark);  // c² 在斜边外
    poly([P(0, 0), P(3, 0), P(0, -4)], C.paper);
    label(ctx, 'a²', ...P(1.5, 1.9), 34, true);
    label(ctx, 'b²', ...P(-2, -1.6), 34, true);
    label(ctx, 'c²', ...P(3.5, -3.2), 34, true);
  },
  conics(ctx, x, y, w, h) {
    const cols = [
      (cx, cy) => { ctx.beginPath(); ctx.ellipse(cx, cy, 120, 72, 0, 0, Math.PI * 2); ctx.stroke(); },
      (cx, cy) => { ctx.beginPath(); for (let t = -1; t <= 1.001; t += 0.05) { const px = cx - 60 + 120 * t * t, py = cy + 110 * t; t === -1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); },
      (cx, cy) => { for (const sg of [-1, 1]) { ctx.beginPath(); for (let t = -1.2; t <= 1.201; t += 0.05) { const px = cx + sg * 34 * Math.cosh(t), py = cy + 60 * Math.sinh(t); t === -1.2 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); } },
    ];
    ['e < 1', 'e = 1', 'e > 1'].forEach((t, i) => {
      const cx = x + w * (i + 0.5) / 3, cy = y + 140;
      ctx.strokeStyle = [C.a, C.b, C.c][i]; ctx.lineWidth = 6;
      cols[i](cx, cy);
      label(ctx, t, cx, y + h - 30, 36, true);
    });
  },
  cubeSection(ctx, x, y, w, h) {
    // 斜二测正方体，六条棱中点连成正六边形
    const a = Math.min(h * 0.62, 200), ox = x + w * 0.5 - a * 0.7, oy = y + h * 0.5 + a * 0.62;
    const d = [a * 0.42, -a * 0.32];           // 后退方向
    const P = (u, v, t) => [ox + u * a + t * d[0], oy - v * a + t * d[1]];
    const pts = {};
    for (const u of [0, 1]) for (const v of [0, 1]) for (const t of [0, 1]) pts[`${u}${v}${t}`] = P(u, v, t);
    const hidden = new Set(['000-001', '001-011', '001-101']);
    const E = [['000', '100'], ['000', '010'], ['000', '001'], ['100', '110'], ['100', '101'], ['010', '110'], ['010', '011'],
      ['001', '101'], ['001', '011'], ['110', '111'], ['101', '111'], ['011', '111']];
    ctx.lineWidth = 3;
    for (const [p, q] of E) {
      ctx.setLineDash(hidden.has(`${p}-${q}`) ? [10, 8] : []);
      ctx.strokeStyle = C.ink;
      ctx.beginPath(); ctx.moveTo(...pts[p]); ctx.lineTo(...pts[q]); ctx.stroke();
    }
    ctx.setLineDash([]);
    // u + v − t = 0.5（棱长 1）经过的六条棱中点；选这条体对角线，斜二测下六边形不会压扁
    const hex = [P(0.5, 0, 0), P(1, 0, 0.5), P(1, 0.5, 1), P(0.5, 1, 1), P(0, 1, 0.5), P(0, 0.5, 0)];
    ctx.fillStyle = 'rgba(217,164,65,.55)'; ctx.strokeStyle = C.b; ctx.lineWidth = 5;
    ctx.beginPath(); hex.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.closePath();
    ctx.fill(); ctx.stroke();
  },
};
