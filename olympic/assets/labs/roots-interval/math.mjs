// Exact rational arithmetic; coefficients are in descending order at the API boundary.
const abs = n => n < 0n ? -n : n;
function gcd(a,b) { while(b) [a,b]=[b,a%b]; return abs(a); }
function Q(n,d=1n) { if(!d) throw Error('division by zero'); if(d<0n) {n=-n;d=-d;} const g=gcd(n,d); return [n/g,d/g]; }
const add=(a,b)=>Q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]);
const neg=a=>[-a[0],a[1]];
const sub=(a,b)=>add(a,neg(b));
const mul=(a,b)=>Q(a[0]*b[0],a[1]*b[1]);
const div=(a,b)=>Q(a[0]*b[1],a[1]*b[0]);
const zero=[0n,1n], one=[1n,1n];
const sign=a=>a[0]>0n?1:a[0]<0n?-1:0;
const num=a=>Number(a[0])/Number(a[1]);
function rational(x) {
  if(!Number.isFinite(Number(x)) || String(x).trim()==='') throw Error('请输入有限数');
  const match=String(x).match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
  if(!match) throw Error('请输入十进制数');
  const [,s,i,f='',e='0']=match, power=Number(e)-f.length;
  if(Math.abs(power)>30) throw Error('小数位或指数超出原型范围');
  const n=BigInt(i+f)*(s==='-'?-1n:1n);
  return power>=0?Q(n*10n**BigInt(power)):Q(n,10n**BigInt(-power));
}
// Polynomials below are ascending; zero is [].
function trim(p) {p=p.slice();while(p.length&&!sign(p.at(-1))) p.pop();return p;}
function derivative(p) {return trim(p.slice(1).map((v,i)=>mul(v,Q(BigInt(i+1)))));}
function value(p,x) {return p.reduceRight((s,c)=>add(mul(s,x),c),zero);}
function quotient(a,b) {
  if(!b.length) throw Error('zero polynomial divisor');
  a=a.slice(); const q=Array(Math.max(0,a.length-b.length+1)).fill(zero);
  while(a.length>=b.length) {
    const i=a.length-b.length, c=div(a.at(-1),b.at(-1));q[i]=c;
    b.forEach((v,j)=>{a[i+j]=sub(a[i+j],mul(c,v));});a=trim(a);
  }
  return [trim(q),a];
}
function monic(p) {return p.length?p.map(c=>div(c,p.at(-1))):[];}
function polyGcd(a,b) {while(b.length) [a,b]=[b,quotient(a,b)[1]];return monic(a);}
function sturm(p) {
  const out=[p,derivative(p)];
  if(!out[1].length) return [p];
  while(out.at(-1).length) {
    const r=quotient(out.at(-2),out.at(-1))[1];
    if(!r.length) break;
    // Positive scaling only: sign of a Sturm polynomial must not be flipped.
    const scale=Q(abs(r.at(-1)[0]),r.at(-1)[1]);out.push(r.map(c=>div(neg(c),scale)));
  }
  return out;
}
function sideSign(p,x,side) {
  let k=0;
  while(p.length) {const s=sign(value(p,x));if(s)return s*(side===-1&&k%2?-1:1);p=derivative(p);k++;}
  return 0;
}
function variations(chain,x,side) {
  const signs=chain.map(p=>sideSign(p,x,side)).filter(Boolean);
  return signs.slice(1).reduce((n,s,i)=>n+(s!==signs[i]),0);
}
const openCount=(chain,a,b)=>variations(chain,a,1)-variations(chain,b,-1);
function layers(p) {
  const out=[];
  while(p.length>1) {
    const g=polyGcd(p,derivative(p)), squarefree=quotient(p,g)[0];
    out.push({p:squarefree,chain:sturm(squarefree)});p=g;
  }
  return out;
}
function countLayer(layer,a,b,leftClosed,rightClosed) {
  const cmp=sign(sub(a,b));if(cmp>0)throw Error('左端点不能大于右端点');
  const l=!sign(value(layer.p,a)), r=!sign(value(layer.p,b));
  if(cmp===0) return leftClosed&&rightClosed&&l?1:0;
  return openCount(layer.chain,a,b)+(leftClosed&&l?1:0)+(rightClosed&&r?1:0);
}
function rootList(ls,p) {
  if(!ls.length) return [];
  const leading=p.at(-1), max=Math.max(...p.slice(0,-1).map(c=>Math.abs(num(div(c,leading)))));
  const bound=rational(Math.ceil(max)+2), low=neg(bound), sf=ls[0];
  const roots=[];
  function visit(a,b,n,depth=0) {
    if(!n)return;
    if(n===1 && (num(sub(b,a))<1e-10 || depth>90)) {
      const x=num(div(add(a,b),Q(2n)));
      roots.push({x,multiplicity:ls.reduce((m,l)=>m+countLayer(l,a,b,false,false),0)});return;
    }
    if(depth>180)throw Error('根过于接近，无法显示近似坐标');
    const mid=div(add(a,b),Q(2n));
    visit(a,mid,openCount(sf.chain,a,mid),depth+1);
    if(!sign(value(sf.p,mid)))roots.push({x:num(mid),multiplicity:ls.filter(l=>!sign(value(l.p,mid))).length});
    visit(mid,b,openCount(sf.chain,mid,b),depth+1);
  }
  visit(low,bound,openCount(sf.chain,low,bound));return roots;
}
export function analyze(coefficients,left,right,leftClosed=true,rightClosed=true,{withRoots=true}={}) {
  if(!Array.isArray(coefficients)||coefficients.length<1||coefficients.length>4)throw Error('仅支持至多三次多项式');
  const p=trim(coefficients.map(rational).reverse()), a=rational(left),b=rational(right);
  if(sign(sub(a,b))>0)throw Error('左端点不能大于右端点');
  const empty=sign(sub(a,b))===0&&!(leftClosed&&rightClosed);
  const endpointSigns=[sign(value(p,a)),sign(value(p,b))];
  if(!p.length)return {degree:-1,kind:'zero',distinct:empty?0:sign(sub(a,b))===0?1:Infinity,total:null,roots:[],endpointSigns};
  const ls=layers(p),counts=ls.map(l=>countLayer(l,a,b,leftClosed,rightClosed));
  return {degree:p.length-1,kind:p.length===1?'constant':'polynomial',distinct:counts[0]||0,total:counts.reduce((s,n)=>s+n,0),endpointSigns,roots:withRoots?rootList(ls,p):[]};
}
export function evaluate(coefficients,x) {return coefficients.reduce((s,c)=>s*x+Number(c),0);}
