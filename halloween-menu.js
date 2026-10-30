(() => {
  const home=document.querySelector('.dashboard-hero');
  // Halloween weekend ends at midnight Eastern after November 1.
  if(!home||Date.now()>=Date.UTC(2026,10,2,5))return;
  const layer=document.createElement('div');
  layer.className='halloween-menu';layer.setAttribute('aria-hidden','true');
  const bat='<svg viewBox="0 0 100 48" focusable="false"><path class="bat-wing bat-left" d="M49 23 30 6 28 18 5 10 13 30 24 26 31 39 40 31 49 33Z"/><path class="bat-wing bat-right" d="M51 23 70 6 72 18 95 10 87 30 76 26 69 39 60 31 51 33Z"/><path d="m43 16 1-12 7 8 7-8-1 13c8 12 5 26-7 27-11-2-15-16-7-28Z"/><circle cx="47" cy="20" r="1.4" fill="#ffac52"/><circle cx="54" cy="20" r="1.4" fill="#ffac52"/></svg>';
  layer.innerHTML='<div class="halloween-fog"></div><span class="halloween-pumpkin pumpkin-left">🎃</span><span class="halloween-pumpkin pumpkin-right">🎃</span>'+[0,1,2].map(n=>'<span class="halloween-bat bat-'+n+'">'+bat+'</span>').join('');
  home.append(layer);
  const pause=()=>layer.classList.toggle('is-paused',document.hidden);
  document.addEventListener('visibilitychange',pause);pause();
})();
