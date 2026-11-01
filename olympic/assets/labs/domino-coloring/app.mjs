import {board,color,solve,preset} from './math.mjs';
const $ = id => document.getElementById(id);
let b = board(8,8), solution = null;
const coord = i => `(${Math.floor(i/b.cols)+1},${i%b.cols+1})`;
function render() {
  const grid=$('board'); grid.replaceChildren(); grid.style.gridTemplateColumns=`repeat(${b.cols},1fr)`;
  const live=new Set(b.cells), marks=new Map();
  if(solution?.tileable) solution.pairs.forEach((pair,k)=>pair.forEach(i=>marks.set(i,String(k+1))));
  for(let i=0;i<b.rows*b.cols;i++) {
    const button=document.createElement('button'), present=live.has(i);
    button.type='button'; button.className=present?(color(b,i)?'white':'black'):'hole';
    button.textContent=present?(marks.get(i)||'·'):'×';
    button.setAttribute('aria-label',`${coord(i)} ${present?(color(b,i)?'白格':'黑格'):'洞'}，点击切换`);
    button.setAttribute('aria-pressed',String(!present));
    if(solution?.certificate?.S?.includes(i)) button.classList.add('s');
    if(solution?.certificate?.N?.includes(i)) button.classList.add('n');
    button.addEventListener('click',()=>{const holes=Array.from({length:b.rows*b.cols},(_,j)=>j).filter(j=>j===i?present:!live.has(j)); b=board(b.rows,b.cols,holes); invalidate(); $('board').children[i].focus();});
    grid.append(button);
  }
}
function invalidate(){solution=null;$('theory').hidden=true;$('prediction').value='';$('result').textContent='';$('error').textContent='';render();}
function sync(){ $('rows').value=b.rows;$('cols').value=b.cols;invalidate(); }
$('resize').addEventListener('click',()=>{try{b=board(Number($('rows').value),Number($('cols').value));sync();}catch(e){$('error').textContent=e.message;}});
$('load').addEventListener('click',()=>{try{b=preset($('preset').value,Number($('rows').value),Number($('cols').value));sync();}catch(e){$('error').textContent=e.message;}});
$('prediction').addEventListener('change',()=>{solution=null;$('theory').hidden=true;$('result').textContent='';render();});
$('check').addEventListener('click',()=>{
  if(!$('prediction').value){$('result').textContent='请先选择预测。';return;}
  solution=solve(b);
  const correct=($('prediction').value==='yes')===solution.tileable;
  let text=`${correct?'预测正确':'再想一想'}。黑格 ${solution.black}，白格 ${solution.white}。`;
  if(solution.tileable) text+=`可覆盖：${solution.pairs.length} 块骨牌。配对坐标：${solution.pairs.map(p=>p.map(coord).join('–')).join('；')||'空棋盘，无需骨牌'}。`;
  else if(solution.certificate.type==='color') text+='不能覆盖：黑白数目不同，而每块骨牌必须覆盖一黑一白。';
  else { const {S,N}=solution.certificate;text+=`不能覆盖：S = ${S.map(coord).join('、')}；N(S) = ${N.map(coord).join('、')||'空集'}。|S| = ${S.length} > |N(S)| = ${N.length}，邻居不足。`; }
  $('result').textContent=text;$('theory').hidden=false;render();
});
render();
