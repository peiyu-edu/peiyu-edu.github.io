// Homogeneous points/lines are nonzero triples; Q is a symmetric 3×3 matrix.
export const EPS = 1e-12;
const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
const mul = (q,p) => q.map(r=>dot(r,p));
const finite = a => Array.isArray(a) && a.every(Number.isFinite);
export function homogeneous(v) {
  if (!finite(v) || !v.some(x=>x!==0)) throw new RangeError('齐次坐标须有限且非零');
  const k=Math.max(...v.map(Math.abs)); return v.map(x=>x/k);
}
export function conic(matrix) {
  if (!Array.isArray(matrix)||matrix.length!==3||matrix.some(r=>!finite(r)||r.length!==3)) throw new RangeError('需要有限3×3矩阵');
  const k=Math.max(...matrix.flat().map(Math.abs));
  if (!k) throw new RangeError('零二次型');
  const q=matrix.map(r=>r.map(x=>x/k));
  for(let i=0;i<3;i++) for(let j=0;j<3;j++) if(Math.abs(q[i][j]-q[j][i])>EPS) throw new RangeError('二次型矩阵须对称');
  const [[a,b,c],[,d,e],[,,f]]=q;
  const adj=[[d*f-e*e,c*e-b*f,b*e-c*d],[c*e-b*f,a*f-c*c,b*c-a*e],[b*e-c*d,b*c-a*e,a*d-b*b]];
  const det=a*adj[0][0]+b*adj[0][1]+c*adj[0][2];
  if(Math.abs(det)<=EPS) throw new RangeError('退化或数值病态二次型：不建立极性');
  return {q,adj,det};
}
export function polar(matrix,p) { if(p?.length!==3) throw new RangeError('点须为三维齐次坐标'); return homogeneous(mul(conic(matrix).q,homogeneous(p))); }
export function pole(matrix,l) { if(l?.length!==3) throw new RangeError('直线须为三维齐次坐标'); return homogeneous(mul(conic(matrix).adj,homogeneous(l))); }
export function incident(l,p) { return dot(homogeneous(l),homogeneous(p)); }
export function ellipseMatrix(a,b) {
  if(!Number.isFinite(a)||!Number.isFinite(b)||a<=0||b<=0) throw new RangeError('半轴必须为正');
  return [[1/a**2,0,0],[0,1/b**2,0],[0,0,-1]];
}
const det2=(a,b)=>a[0]*b[1]-a[1]*b[0];
export function crossRatio(a,b,c,d) {
  // 1D projective coordinates [t:w], with [1:0] the unique point at infinity.
  const ps=[a,b,c,d].map(homogeneous);
  if(ps.some(p=>p.length!==2)) throw new RangeError('交比需要直线上二维齐次坐标');
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if(Math.abs(det2(ps[i],ps[j]))<=EPS) return {defined:false,reason:'重合点（或数值不可分辨）不构成四个互异点'};
  const [A,B,C,D]=ps, den=det2(C,B)*det2(D,A);
  if(Math.abs(den)<=EPS) return {defined:false,reason:'交比分母为零或数值病态'};
  const value=det2(C,A)*det2(D,B)/den;
  return Number.isFinite(value)?{defined:true,value}:{defined:false,reason:'交比数值溢出'};
}
export function model({a=2,b=2,px=3,py=0,angle=0,witness=0}={}) {
  if(![a,b,px,py,angle,witness].every(Number.isFinite)) throw new RangeError('参数须为有限数');
  const matrix=ellipseMatrix(a,b), P=[px,py,1], l=polar(matrix,P);
  // Snap floating representations of exact quadrantal directions to zero.
  const u=[Math.cos(angle*Math.PI/180),Math.sin(angle*Math.PI/180)].map(x=>Math.abs(x)<1e-15?0:x);
  const alpha=(u[0]/a)**2+(u[1]/b)**2;
  const beta=px*u[0]/a**2+py*u[1]/b**2;
  const gamma=(px/a)**2+(py/b)**2-1;
  const disc=beta**2-alpha*gamma, tol=EPS*Math.max(1,beta**2,Math.abs(alpha*gamma));
  const s=gamma+1;
  const tangencies=[];
  if(gamma>EPS) {
    const v=[px/a,py/b], h=Math.sqrt(gamma);
    for(const sign of [-1,1]) tangencies.push([a*(v[0]-sign*v[1]*h)/s,b*(v[1]+sign*v[0]*h)/s]);
  } else if(Math.abs(gamma)<=EPS) tangencies.push([px,py]);
  const normal=[l[0],l[1]], nn=dot(normal,normal);
  const infinity=normal.every(x=>x===0);
  const Q=infinity?null:[-l[2]*normal[0]/nn-witness*normal[1]/Math.sqrt(nn),-l[2]*normal[1]/nn+witness*normal[0]/Math.sqrt(nn),1];
  const reciprocal=Q?polar(matrix,Q):null;
  const out={a,b,P,l,u,alpha,beta,gamma,disc,tangencies,infinity,Q,reciprocal,position:gamma>EPS?'outside':gamma< -EPS?'inside':'on'};
  const D=Math.abs(gamma)<=EPS&&Math.abs(beta)<=EPS?null:homogeneous([-gamma,beta]);
  if(disc< -tol) return {...out,kind:'no-real',D,roots:[],ratio:{defined:false,reason:'此方向没有两个实交点'}};
  if(Math.abs(disc)<=tol) return {...out,kind:'tangent',D,roots:[-beta/alpha],ratio:{defined:false,reason:'相切时A、B重合'}};
  const h=Math.sqrt(disc), q=-beta-(beta>=0?h:-h);
  const roots=[q/alpha,gamma/q].sort((x,y)=>x-y);
  // If P is on the conic and beta=0, this was the tangent branch above.
  const ratio=Math.abs(gamma)<=EPS?{defined:false,reason:'P在二次曲线上，与一个割线端点重合'}:crossRatio([roots[0],1],[roots[1],1],[0,1],D);
  return {...out,kind:'secant',D,roots,ratio};
}
