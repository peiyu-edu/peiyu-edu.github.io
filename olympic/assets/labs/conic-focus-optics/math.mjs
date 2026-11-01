// Pure numerical model. All coordinates are in the same Euclidean scale.
export const add = (a,b) => a.map((v,i)=>v+b[i]);
export const sub = (a,b) => a.map((v,i)=>v-b[i]);
export const mul = (a,k) => a.map(v=>v*k);
export const dot = (a,b) => a.reduce((s,v,i)=>s+v*b[i],0);
export const norm = a => Math.hypot(...a);
export function unit(a) { const n=norm(a); return n>1e-12 && Number.isFinite(n)?mul(a,1/n):null; }
export function reflect(v,n) {
  const u=unit(v), w=unit(n);
  return u && w ? sub(u,mul(w,2*dot(u,w))) : null;
}
export function model(kind,s,e) {
  if (!['ellipse','hyperbola','parabola'].includes(kind) || !Number.isFinite(s) || s<.1 || s>10 ||
      !Number.isFinite(e) || (kind==='ellipse' && !(e>=.05 && e<=.99)) ||
      (kind==='hyperbola' && !(e>=1.01 && e<=4)) || (kind==='parabola' && e!==1))
    return {ok:false,reason:'参数无效：0.1≤尺度≤10；椭圆 0.05≤e≤0.99；双曲线 1.01≤e≤4；抛物线 e=1。'};
  if (kind==='parabola') return {ok:true,kind,s,e,F1:[s,0],F2:null,directrices:[-s],b:null,c:null};
  const c=s*e, b=s*Math.sqrt(Math.abs(1-e*e));
  return {ok:true,kind,s,e,b,c,F1:[-c,0],F2:[c,0],directrices:[-s/e,s/e]};
}
export function point(m,t,branch=1) {
  if (!m.ok || !Number.isFinite(t) || Math.abs(t)>100 || ![1,-1].includes(branch)) return null;
  if(m.kind==='ellipse') return [m.s*Math.cos(t),m.b*Math.sin(t)];
  if(m.kind==='hyperbola') return [branch*m.s*Math.cosh(t),m.b*Math.sinh(t)];
  return [m.s*t*t,2*m.s*t];
}
export function normal(m,P) {
  if (!m.ok || !P || !P.every(Number.isFinite)) return null;
  if(m.kind==='parabola') return [-4*m.s,2*P[1]];
  return [2*P[0]/m.s**2,(m.kind==='ellipse'?2:-2)*P[1]/m.b**2];
}
export function state(m,t,branch=1,focus=0) {
  const P=point(m,t,branch);
  if(!P || ![0,1].includes(focus) || (m.kind==='parabola' && focus!==0)) return {ok:false,reason:'点参数或焦点选择无效。'};
  const F=focus===0?m.F1:m.F2, d=m.directrices[focus];
  const incoming=m.kind==='parabola'?[-1,0]:unit(sub(P,m.F1));
  const n=unit(normal(m,P)), outgoing=incoming&&reflect(incoming,n);
  if(!outgoing) return {ok:false,reason:'入射方向或法线无定义（例如点与光源重合）。'};
  return {ok:true,P,F,d,focusDistance:norm(sub(P,F)),lineDistance:Math.abs(P[0]-d),
    normal:n,tangent:[-n[1],n[0]],incoming,outgoing};
}
// Intersect the full line F+lambda*(cos alpha,sin alpha). A≈0 means one finite endpoint.
export function chord(m,alpha,focus=0) {
  if(!m.ok || !Number.isFinite(alpha) || ![0,1].includes(focus) || (m.kind==='parabola'&&focus!==0)) return {ok:false,reason:'焦点弦参数无效。'};
  const F=focus===0?m.F1:m.F2, v=[Math.cos(alpha),Math.sin(alpha)];
  let A,B,C;
  if(m.kind==='parabola') {A=v[1]**2;B=-4*m.s*v[0];C=-4*m.s**2;}
  else {
    // Factored Cartesian coefficient avoids catastrophic cancellation near an asymptote.
    A=(1-m.e*v[0])*(1+m.e*v[0])/(m.s**2*(1-m.e**2));
    B=2*F[0]*v[0]/m.s**2; C=m.e**2-1;
  }
  let roots;
  const linear = m.kind==='parabola' ? Math.abs(v[1])<8*Number.EPSILON
    : Math.abs(A)<=8*Number.EPSILON*(v[0]**2/m.s**2+v[1]**2/m.b**2);
  if(linear) {
    if(B===0) return {ok:false,reason:'交点方程退化，无可用有限交点。'};
    roots=[-C/B];
  } else {
    const D=B*B-4*A*C;
    if(D<0) return {ok:false,reason:'无实交点。'};
    const q=-.5*(B+(B>=0?1:-1)*Math.sqrt(D));
    roots=q===0?[-B/(2*A)]:[q/A,C/q];
  }
  return {ok:true,F,v,roots,points:roots.map(r=>add(F,mul(v,r))),infinite:roots.length===1};
}
