/* Standalone theme control extracted from learning-shell (5f66d48e). */
(function () {
  'use strict';
  var header=document.querySelector('header.top,header.lf-top');
  if(!header||header.querySelector('[data-lf-theme]'))return;
  var n=header.querySelector('.hci-nav,.lf-nav');
  try{var theme=localStorage.getItem('peiyu.hs.theme');if(theme==='dark'||theme==='light')document.documentElement.dataset.theme=theme;}catch(e){}
  header.classList.add('theme-top');
  var b=document.createElement('button');b.type='button';b.className='lf-theme';b.dataset.lfTheme='';
  b.setAttribute('role','switch');b.setAttribute('aria-label','深色模式');
  b.innerHTML='<span class="lf-theme-icon lf-theme-sun" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42m0-14.14-1.42 1.42m-11.3 11.3-1.42 1.42"/></svg></span><span class="lf-theme-icon lf-theme-moon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z"/></svg></span>';
  header.insertBefore(b,n);
  function syncTheme(){var dark=getComputedStyle(document.documentElement).colorScheme==='dark';b.setAttribute('aria-checked',String(dark));b.title=dark?'当前深色，切换为浅色':'当前浅色，切换为深色';}
  b.addEventListener('click',function(){var theme=b.getAttribute('aria-checked')==='true'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('peiyu.hs.theme',theme);}catch(e){}syncTheme();});
  new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTheme);
  window.addEventListener('storage',function(e){if(e.key!=='peiyu.hs.theme'&&e.key!==null)return;if(e.newValue==='dark'||e.newValue==='light')document.documentElement.dataset.theme=e.newValue;else document.documentElement.removeAttribute('data-theme');syncTheme();});
  syncTheme();
})();
