// This lesson's approved construction activities; no shared runtime changes.
(function () {
  "use strict";
  const root = document.getElementById("angle-work");
  if (document.body?.dataset.sec !== "j6-3" || !root || root.dataset.constructionReady === "yes") return;
  const required = ["pro-offset", "angle-read", "seconds-form", "equal-form", "count-angle-form", "direction-form"];
  if (!required.every(id => document.getElementById(id))) return;
  root.dataset.constructionReady = "yes";
  // BEGIN approved 4fe13446c math (byte-preserved)

(function(){
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',rad=Math.PI/180;
 function el(s,t,a,text){const e=document.createElementNS(NS,t);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;s.appendChild(e);return e;}
 function line(s,x,y,X,Y,c='var(--fg)'){el(s,'line',{x1:x,y1:y,x2:X,y2:Y,stroke:c,'stroke-width':2});}
 function text(s,x,y,t){el(s,'text',{x,y,fill:'var(--fg)','font-size':16,'text-anchor':'middle'},t);}
 function pt(x,y,r,a){return [x+r*Math.cos(a*rad),y-r*Math.sin(a*rad)];}
 function ray(s,x,y,a,r,c){const p=pt(x,y,r,a);line(s,x,y,...p,c);}
 function n(id){const v=$(id).value.trim();return v===''?NaN:Number(v);}
 let target=72,idx=0,readOK=false;
 function angleDraw(){const s=$('angle-work-fig'),off=+$('pro-offset').value,turn=+$('pro-turn').value,h=+$('half-angle').value;s.replaceChildren();const x=170+off,y=230;
 for(let a=0;a<=180;a++){const p=pt(x,y,a%10===0?125:a%5===0?129:132,a+turn),q=pt(x,y,135,a+turn);line(s,...p,...q,'var(--muted)');if(a%30===0){const z=pt(x,y,107,a+turn);text(s,z[0],z[1]+5,String(a));}}
 const p=pt(x,y,135,turn),q=pt(x,y,135,180+turn);el(s,'path',{d:`M${p} A135 135 0 0 0 ${q}`,fill:'none',stroke:'var(--muted)','stroke-width':2});ray(s,x,y,turn,135,'var(--b)');ray(s,x,y,turn+180,135,'var(--b)');el(s,'path',{d:`M${x-5} ${y} h10 M${x} ${y-5} v10`,stroke:'var(--b)','stroke-width':2});
 ray(s,170,230,0,180);ray(s,170,230,target,180);ray(s,170,230,h,145,'var(--a)');text(s,165,260,'O');text(s,367,275,'A');const b=pt(170,230,198,target);text(s,b[0],b[1],'B');}
 function invalidate(){readOK=false;angleDraw();$('angle-work-out').textContent='摆放已变化，请重新核对读数。';}
 $('pro-offset').oninput=$('pro-turn').oninput=invalidate;$('half-angle').oninput=()=>{angleDraw();$('angle-work-out').textContent='OC 已按你的角度移动；尚未核对。';};
 $('angle-read-form').onsubmit=e=>{e.preventDefault();readOK=false;if(+$('pro-offset').value!==0||+$('pro-turn').value!==0){$('angle-work-out').textContent='尚未对中或对零线：中心须与 O 重合，0刻度线须沿 OA。';return;}const v=n('angle-read');readOK=Number.isFinite(v)&&Math.abs(v-target)<=0.500000001;$('angle-work-out').textContent=readOK?'读数符合（允许半度估读误差）。现在自己取半，调整 OC，再核对两边夹角。':'从 OA 所在的0刻度读到 OB，别从另一头读补角；可以重试。';};
 $('half-check').onclick=()=>{const h=+$('half-angle').value;let t;if(!readOK)t='先对准量角器并提交符合的读数，再核对自己画的射线。';else if(h<=0||h>=target)t='OC 须在角内，不能与边重合或落在角外。';else if(Math.abs(h-(target-h))>1.000000001)t='两部分不接近相等。把量得的角除以2，从 OA 的0刻度起标半角。';else t=`核对符合：∠AOC=${h}°，∠COB=${target-h}°，相差不超过1°。OC 从 O 出发且在角内。这里是度量误差核对，不把近似相等当严格证明。`;$('angle-work-out').textContent=t;};
 function reset(){readOK=false;$('pro-offset').value=30;$('pro-turn').value=20;$('half-angle').value=20;$('angle-read-form').reset();angleDraw();$('angle-work-out').textContent='请对中、对零线，重新量角并画自己的半角射线。';}
 $('angle-retry').onclick=reset;$('angle-next').onclick=()=>{target=[72,95,126][++idx%3];reset();};angleDraw();
 $('seconds-form').onsubmit=e=>{e.preventDefault();const ids=['sec-total','sec-sum','sec-carry','min-sum','dms-d','dms-m','dms-s'],vals=ids.map(n),ans=[135,75,1,65,16,5,15];let i=vals.findIndex((v,k)=>v!==ans[k]);$('seconds-out').textContent=i<0?'逐步核对通过：2×60+15=135″；45+30=75″=1′15″；18+46+1=65′=1°5′；12+3+1=16°，结果16°5′15″。秒、分均已归到0至59。':['分化秒先乘60，再添剩余的秒。','先把秒列45与30相加。','每60秒进1分，剩余秒留在秒列。','分列18与46相加，还要加秒列的进位。','度列还要接收满60分的进位。','分列进位后留下不足60的余数。','秒列进位后留下不足60的余数。'][i];};
 $('seconds-form').onreset=()=>{$('seconds-out').textContent='已重试，请重新填竖式和进位。';};
 function equalDraw(){const a=+$('equal-base').value,b=a+($('equal-kind').value==='same'?0:10),s=$('equal-fig');s.replaceChildren();[[a,80,'α'],[b,280,'β']].forEach(([v,x,t])=>{ray(s,x,125,0,85);ray(s,x,125,v,85,'var(--a)');text(s,x,153,t);});$('equal-givens').textContent=`α=${a}°，β=${b}°；分别求它们的`+(+$('equal-target').value===90?'余角。':'补角。');$('equal-form').reset();$('equal-out').textContent='条件已更新。先记录两组结果并作猜想，再核对。';}
 ['equal-base','equal-kind','equal-target'].forEach(id=>$(id).addEventListener('input',equalDraw));equalDraw();
 $('equal-form').onsubmit=e=>{e.preventDefault();const a=+$('equal-base').value,b=a+($('equal-kind').value==='same'?0:10),total=+$('equal-target').value,claim=a===b?'same':'different';if(!Number.isFinite(n('equal-first'))||!Number.isFinite(n('equal-second'))||Math.abs(n('equal-first')-(total-a))>1e-8||Math.abs(n('equal-second')-(total-b))>1e-8||$('equal-claim').value!==claim){$('equal-out').textContent='用总角度分别减 α、β，再比较两结果；检查是不是把余角、补角的总数用反。';return;}$('equal-out').textContent=a===b?`记录符合：两结果都是${total-a}°。理由：α=β，在同一个${total}°中减去相等的角，${total}°−α=${total}°−β。把两个角画在不同位置也不改变结果。同角可看成α、β就是同一个角。换另一个α，再试补角，检验猜想。`:`记录符合：${total-a}°与${total-b}°不等。α与β不等，就不能套用“等角的余角（补角）相等”；位置分离不是导致差异的原因。`;};
 $('count-angle-form').onsubmit=e=>{e.preventDefault();$('count-angle-out').textContent=n('count-angle')===6?'符合：从 OA 起有 AOB、AOC、AOD；从 OB 起有 BOC、BOD；从 OC 起有 COD，共6个。倒写如 BOA 是同一个角，不另计。':'从 OA 起依次配对，再从 OB 起，只与其后面的射线配对，避免重数。';};
 $('direction-form').onsubmit=e=>{e.preventDefault();$('direction-out').textContent=Number.isFinite(n('direction-value'))&&Math.abs(n('direction-value')-120)<1e-8?'符合：OP 距正东55°，OQ 距正东65°，两边在正东两侧，夹角55°+65°=120°；也可180°−35°−25°。':'检查北偏东从北向东量，南偏东从南向东量，两方向线在正东两侧。';};
})();

  // END approved 4fe13446c math
  // Editing an answer invalidates the previous result, without changing its math.
  document.getElementById("angle-read").addEventListener("input", () => {
    document.getElementById("pro-offset").oninput();
    document.getElementById("angle-work-out").textContent = "读数已修改，请重新核对。";
  });
  [
    ["seconds-form", "seconds-out"],
    ["equal-form", "equal-out"],
    ["count-angle-form", "count-angle-out"],
    ["direction-form", "direction-out"]
  ].forEach(([form, output]) => {
    document.getElementById(form).addEventListener("input", () => {
      document.getElementById(output).textContent = "回答已修改，请重新核对。";
    });
  });
})();
