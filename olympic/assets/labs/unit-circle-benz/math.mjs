// Unit circle radius 1. Public API angles are degrees; all internal angles radians.
export const dot = (a,b) => a[0]*b[0]+a[1]*b[1];
export const cross = (a,b) => a[0]*b[1]-a[1]*b[0];
export const sub = (a,b) => [a[0]-b[0],a[1]-b[1]];
export const add = (a,b) => [a[0]+b[0],a[1]+b[1]];
export const norm = a => Math.hypot(...a);
export const rad = degree => (degree%360)*Math.PI/180;
export const point = degree => [Math.cos(rad(degree)),Math.sin(rad(degree))];
export function normalize(w) {
  const sum=w.reduce((s,x)=>s+x,0);
  if(!Number.isFinite(sum)||Math.abs(sum)<1e-14)return null;
  return w.map(x=>x/sum);
}
export function weighted(points,w) {
  return points.reduce((p,q,i)=>add(p,q.map(x=>x*w[i])),[0,0]);
}
// Signed double areas, a general barycentric identity, not a triangle-center lookup.
export function areaWeights(points,P) {
  const [A,B,C]=points,den=cross(sub(B,A),sub(C,A));
  if(Math.abs(den)<=1e-10)return null;
  // Compute two signed area ratios in translated coordinates; enforce the affine sum
  // rather than independently subtracting far-away P in all three determinants.
  const b=cross(sub(P,A),sub(C,A))/den,c=cross(sub(B,A),sub(P,A))/den;
  return [1-b-c,b,c];
}
export function model(alpha,beta,gamma) {
  if(![alpha,beta,gamma].every(Number.isFinite))throw new RangeError('Angles must be finite degrees');
  const vertices=[alpha,beta,gamma].map(point),[A,B,C]=vertices;
  const trig={dot:dot(A,B),det:cross(A,B),sumSin:A[1]*B[0]+A[0]*B[1],sumCos:A[0]*B[0]-A[1]*B[1]};
  const area2=cross(sub(B,A),sub(C,A));
  const sides=[norm(sub(B,C)),norm(sub(C,A)),norm(sub(A,B))];
  if(Math.min(...sides)<=1e-10||Math.abs(area2)<=1e-10) return {vertices,trig,valid:false,area2,sides,reason:'顶点重合或面积过小：当前姿态停用三角形中心及重心坐标计算。单位圆及三角恒等式仍有效。'};
  const sines=[],cosines=[];
  const angles=vertices.map((P,i)=>{
    const u=sub(vertices[(i+1)%3],P),v=sub(vertices[(i+2)%3],P);
    const d=norm(u)*norm(v);
    sines.push(Math.abs(cross(u,v))/d);cosines.push(dot(u,v)/d);
    return Math.atan2(Math.abs(cross(u,v)),dot(u,v));
  });
  const sins=sines;
  const product=sins.reduce((p,x)=>p*x,1);
  const rawO=sins.map((s,i)=>2*s*cosines[i]);
  // Multiplying tan weights by cos A cos B cos C gives this continuous extension at right angles.
  const rawH=sins.map((s,i)=>s*cosines[(i+1)%3]*cosines[(i+2)%3]);
  // Analytically known positive sums avoid cancellation near a flat triangle.
  const weights={O:rawO.map(x=>x/(4*product)),H:rawH.map(x=>x/product),I:normalize(sides),G:[1/3,1/3,1/3]};
  const H=add(add(A,B),C),I=weighted(vertices,weights.I),G=weighted(vertices,weights.G);
  const right=cosines.some(x=>Math.abs(x)<1e-10),obtuse=cosines.some(x=>x< -1e-10);
  return {vertices,trig,valid:true,area2,sides,angles,rawO,rawH,weights,O:[0,0],H,I,G,right,obtuse};
}
export function target(q,task) {
  if(task==='dot')return q.trig.dot;
  if(!q.valid)return null;
  if(task==='hx')return q.H[0];
  if(task==='ow')return q.weights.O[0];
  throw new RangeError('Unknown prediction task');
}
export function judge(value,expected) {
  if(expected===null)return {kind:'undefined',text:'当前姿态退化或触发数值保护，此目标暂不可计算；请先改变顶点。'};
  if(typeof value!=='string'||!value.trim()||!Number.isFinite(Number(value)))return {kind:'empty',text:'请输入有限实数，再核对预测。'};
  const pass=Math.abs(Number(value)-expected)<=.02+1e-12;
  return {kind:pass?'correct':'incorrect',text:pass?'预测符合（绝对误差不超过 0.02）。':'预测不符。用坐标、数量积或有向权重再算一次。'};
}
