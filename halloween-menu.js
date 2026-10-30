(() => {
  const home=document.querySelector('.dashboard-hero');
  // Halloween weekend ends at midnight Eastern after November 1.
  if(!home||Date.now()>=Date.UTC(2026,10,2,5))return;
  const layer=document.createElement('div');
  layer.className='halloween-menu';layer.setAttribute('aria-hidden','true');
  const bat='<svg viewBox="0 0 100 64" focusable="false"><path class="bat-wing bat-right" fill="#302b38" d="M55 34Q38 5 13 9L22 22Q30 18 35 31Q43 25 55 36Z"/><path d="m28 38-14 8 7-12c13-9 28-13 44-8l5-14 7 11 9 3 7 8-10 5c-11 11-31 8-55-1Z"/><path class="bat-wing bat-left" d="M55 34Q37-1 6 3L15 19Q24 12 31 31Q41 22 55 38Z"/><circle cx="79" cy="29" r="1.3" fill="#ffac52"/></svg>';
  const pumpkin='<svg viewBox="0 0 100 90" focusable="false"><path fill="#5f7441" d="m47 20 3-17 10 2-7 18Z"/><path fill="#b44b1c" d="M50 20C12 6 0 42 12 69c12 23 26 12 38 14 17-3 30 9 40-16C102 39 85 8 50 20Z"/><ellipse cx="36" cy="51" rx="20" ry="32" fill="#d56b25"/><ellipse cx="63" cy="51" rx="21" ry="32" fill="#dc7028"/><ellipse cx="50" cy="51" rx="15" ry="33" fill="#ed8631"/><g class="pumpkin-face"><path d="m24 43 15-11 3 16Zm33 5 3-16 15 11ZM28 59l12 5 4-5 7 8 7-8 4 5 12-5c-8 21-36 23-46 0Z"/></g></svg>';
  layer.innerHTML='<div class="halloween-fog fog-back"></div><div class="halloween-fog fog-middle"></div><div class="halloween-fog fog-floor"></div><span class="halloween-pumpkin pumpkin-left">'+pumpkin+'</span><span class="halloween-pumpkin pumpkin-right">'+pumpkin+'</span>'+[0,1,2].map(n=>'<span class="halloween-bat bat-'+n+'"><span class="bat-reaction">'+bat+'</span></span>').join('');
  home.append(layer);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const bats=[...layer.querySelectorAll('.halloween-bat')],pumpkins=[...layer.querySelectorAll('.halloween-pumpkin')];
  let frame=0,point=null;
  function reset(){
    cancelAnimationFrame(frame);frame=0;point=null;
    bats.forEach(b=>{b.style.setProperty('--scatter-x','0px');b.style.setProperty('--scatter-y','0px')});
    pumpkins.forEach(p=>p.classList.remove('is-near'));
  }
  function react(){
    frame=0;
    if(!point||document.hidden||reduced.matches||document.body.classList.contains('game-is-open')||!home.getClientRects().length){reset();return}
    for(const bat of bats){
      const r=bat.getBoundingClientRect(),dx=r.left+r.width/2-point.x,dy=r.top+r.height/2-point.y,d=Math.hypot(dx,dy),near=d<140;
      bat.style.setProperty('--scatter-x',near?(dx<0?-90:90)+'px':'0px');
      bat.style.setProperty('--scatter-y',near?(dy<0?-65:65)+'px':'0px');
    }
    for(const pumpkin of pumpkins){const r=pumpkin.getBoundingClientRect();pumpkin.classList.toggle('is-near',Math.hypot(r.left+r.width/2-point.x,r.top+r.height/2-point.y)<95)}
  }
  document.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||document.hidden||reduced.matches)return;point={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(react)},{passive:true});
  document.documentElement.addEventListener('pointerleave',reset);
  window.addEventListener('blur',reset);reduced.addEventListener('change',reset);
  const pause=()=>{layer.classList.toggle('is-paused',document.hidden);if(document.hidden)reset()};
  document.addEventListener('visibilitychange',pause);pause();
})();
