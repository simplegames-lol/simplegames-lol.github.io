(()=>{
  const opener=document.querySelector('#browser-open');if(!opener)return;
  const origin='https://simple-games-browser.maylarpp.workers.dev';
  const panel=document.createElement('section');panel.id='site-browser-panel';panel.className='site-browser-panel';panel.hidden=true;panel.setAttribute('aria-label','Browser');
  panel.innerHTML='<header class="site-browser-topbar"><button type="button" id="browser-home">← Home</button><h1>Browser</h1></header><p class="site-browser-message" id="browser-status" role="status">Loading browser…</p><iframe class="site-browser-frame" id="site-browser-frame" title="Simple Games Browser" referrerpolicy="no-referrer" allow="fullscreen; autoplay; gamepad" sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-pointer-lock"></iframe>';
  document.body.append(panel);
  const tiktok=document.createElement('button');tiktok.type='button';tiktok.textContent='TikTok · third-party provider';panel.querySelector('header').append(tiktok);
  const frame=panel.querySelector('iframe'),status=panel.querySelector('#browser-status');
  tiktok.onclick=()=>{clearTimeout(timer);loaded=false;status.hidden=false;status.textContent='Loading third-party TikTok browser. Availability depends on that provider.';frame.src='https://d1w7oj52hl4x53.cloudfront.net/search?query=aHR0cHM6Ly93d3cudGlrdG9rLmNvbQ%3D%3D'};
  frame.addEventListener('load',()=>{if(frame.getAttribute('src')?.startsWith('https://d1w7oj52hl4x53.cloudfront.net/'))status.textContent='Third-party TikTok provider · Some features may not work.'});
  const main=document.querySelector('main.page-shell');let previousInert=false;
  let timer,loaded=false;
  function layout(){const header=document.querySelector('.site-header');if(!header)return;const rect=header.getBoundingClientRect(),mobile=window.matchMedia('(max-width:900px)').matches;panel.style.left=mobile||document.body.classList.contains('sidebar-collapsed')?'0px':rect.width+'px';panel.style.top=mobile&&!document.body.classList.contains('sidebar-collapsed')?Math.max(0,rect.bottom)+'px':'0px';}
  window.addEventListener('resize',layout);new MutationObserver(layout).observe(document.body,{attributes:true,attributeFilter:['class']});
  function close(focus=false){clearTimeout(timer);panel.hidden=true;document.body.classList.remove('browser-is-open');opener.classList.remove('active');opener.setAttribute('aria-expanded','false');frame.src='about:blank';loaded=false;if(main)main.inert=previousInert;if(focus)opener.focus();}
  function open(){
    document.querySelector('#game-close')?.click();
    document.querySelectorAll('#info-overlay,#ai-panel,#server-panel,#settings-panel,#social-panel,#support-panel,.real-shop,.server-dialog').forEach(other=>{other.hidden=true});
    if(panel.hidden&&main){previousInert=main.inert;main.inert=true;}
    document.querySelector('.header-right')?.classList.remove('open');document.querySelector('#menu-toggle')?.setAttribute('aria-expanded','false');
    document.body.classList.remove('game-is-open');panel.hidden=false;document.body.classList.add('browser-is-open');opener.classList.add('active');opener.setAttribute('aria-expanded','true');layout();
    status.hidden=false;status.textContent='Loading browser…';loaded=false;frame.src=origin+'/browser?embed=1&release=7';
    clearTimeout(timer);timer=setTimeout(()=>{if(!loaded&&!panel.hidden)status.textContent='Browser is taking longer to load. Try Home, then Browser again.'},18000);
    panel.querySelector('#browser-home').focus();
  }
  opener.setAttribute('aria-controls',panel.id);opener.setAttribute('aria-expanded','false');opener.addEventListener('click',open);
  panel.querySelector('#browser-home').onclick=()=>{close();document.querySelector('.header-right .rail-link[href="/"]')?.click()};
  // Never trust arbitrary messages from the proxied page or another tab.
  window.addEventListener('message',event=>{if(event.origin!==origin||event.source!==frame.contentWindow||event.data?.type!=='simplegames:browser-ready')return;loaded=true;clearTimeout(timer);status.hidden=true;});
  document.querySelector('.header-right')?.addEventListener('click',event=>{const item=event.target.closest('button,a');if(item&&item!==opener&&!panel.hidden)close();},true);
  document.querySelector('.brand')?.addEventListener('click',()=>close());
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close(true)});
})();
