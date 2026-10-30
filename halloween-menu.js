(() => {
  const home=document.querySelector('.dashboard-hero');
  // Halloween weekend ends at midnight Eastern after November 1.
  if(!home||Date.now()>=Date.UTC(2026,10,2,5))return;
  const layer=document.createElement('div');
  layer.className='halloween-menu';layer.setAttribute('aria-hidden','true');
  const pumpkin='<svg viewBox="0 0 100 90" focusable="false"><path fill="#5f7441" d="m47 20 3-17 10 2-7 18Z"/><path fill="#b44b1c" d="M50 20C12 6 0 42 12 69c12 23 26 12 38 14 17-3 30 9 40-16C102 39 85 8 50 20Z"/><ellipse cx="36" cy="51" rx="20" ry="32" fill="#d56b25"/><ellipse cx="63" cy="51" rx="21" ry="32" fill="#dc7028"/><ellipse cx="50" cy="51" rx="15" ry="33" fill="#ed8631"/><g class="pumpkin-face"><path d="m24 43 15-11 3 16Zm33 5 3-16 15 11ZM28 59l12 5 4-5 7 8 7-8 4 5 12-5c-8 21-36 23-46 0Z"/></g></svg>';
  const web='<svg viewBox="0 0 120 120" focusable="false"><g fill="none" stroke="currentColor" stroke-width=".8"><path d="M0 0 120 0M0 0 115 35M0 0 90 78M0 0 48 108M0 0 0 120M0 24Q15 18 24 0M0 48Q17 42 21 34Q36 29 43 14Q47 5 48 0M0 76Q23 65 32 58Q51 52 61 31Q68 17 76 0M0 106Q30 96 43 81Q73 70 84 45Q97 25 106 0"/></g></svg>';
  layer.innerHTML='<div class="halloween-fog fog-back"></div><div class="halloween-fog fog-middle"></div><div class="halloween-fog fog-floor"></div><span class="halloween-web web-left">'+web+'</span><span class="halloween-web web-right">'+web+'</span><span class="halloween-pumpkin pumpkin-left">'+pumpkin+'</span><span class="halloween-pumpkin pumpkin-right">'+pumpkin+'</span><div class="halloween-lightning"></div>';
  home.append(layer);
  const railFog=document.createElement('div');railFog.className='halloween-rail-fog';railFog.setAttribute('aria-hidden','true');document.querySelector('.site-header')?.append(railFog);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const pumpkins=[...layer.querySelectorAll('.halloween-pumpkin')];
  let frame=0,point=null;
  function reset(){
    cancelAnimationFrame(frame);frame=0;point=null;
    pumpkins.forEach(p=>p.classList.remove('is-near'));
  }
  function react(){
    frame=0;
    if(!point||document.hidden||reduced.matches||document.body.classList.contains('game-is-open')||!home.getClientRects().length){reset();return}
    for(const pumpkin of pumpkins){const r=pumpkin.getBoundingClientRect();pumpkin.classList.toggle('is-near',Math.hypot(r.left+r.width/2-point.x,r.top+r.height/2-point.y)<95)}
  }
  document.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||document.hidden||reduced.matches)return;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(react)},{passive:true});
  document.documentElement.addEventListener('pointerleave',reset);
  window.addEventListener('blur',reset);reduced.addEventListener('change',reset);
  const pause=()=>{layer.classList.toggle('is-paused',document.hidden);if(document.hidden)reset()};
  document.addEventListener('visibilitychange',pause);pause();
})();
