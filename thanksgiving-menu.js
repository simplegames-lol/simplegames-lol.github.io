(() => {
  const home=document.querySelector('.dashboard-hero');
  if(!home)return;
  document.body.classList.add('thanksgiving-menu');
  const symbols='<svg class="harvest-symbols" aria-hidden="true" focusable="false"><defs><symbol id="harvest-maple" viewBox="0 0 64 72"><path d="m32 2 7 17 10-7-2 15 15-2-7 13 8 5-24 10-5 17h-4l3-17L4 44l9-7L5 24l15 3-3-15 10 7Z" fill="currentColor"/><path d="m32 16 1 36-9-16m9 9 12-12m-12 5-10-9" fill="none" stroke="#512c23" stroke-width="1.5" opacity=".5"/></symbol><symbol id="harvest-oak" viewBox="0 0 64 72"><path d="M33 3c12 1 7 12 15 13 12 3 3 12 6 16 12 9 0 13-3 15-3 12-13 8-17 9l-1 13h-4l1-13c-6 1-17 1-17-10-10-3-12-12-4-16-6-9 2-16 10-14C17 8 24 2 33 3Z" fill="currentColor"/><path d="m32 10-1 45m0-27-11-8m11 20 13-14m-13 23-13-9" fill="none" stroke="#452a25" stroke-width="1.5" opacity=".45"/></symbol></defs></svg>';
  const scene=document.createElement('div');scene.className='harvest-scene';scene.setAttribute('aria-hidden','true');
  scene.innerHTML=symbols+'<div class="harvest-glow harvest-glow-amber"></div><div class="harvest-glow harvest-glow-cranberry"></div><div class="harvest-ground"></div>';
  const colors=['#c9863c','#a54c37','#d5a15b','#82643e','#914552'];
  const canopy=document.createElement('div');canopy.className='harvest-canopy';
  for(let i=0;i<14;i++){const leaf=document.createElement('span');leaf.className='harvest-canopy-leaf';leaf.style.cssText=`--canopy-left:${i*7.7-2}%;--canopy-top:${-28+i%4*10}px;--canopy-size:${52+i%4*13}px;--canopy-turn:${i%2?25:-35}deg;color:${colors[i%colors.length]}`;leaf.innerHTML='<svg viewBox="0 0 64 72" focusable="false"><use href="#harvest-'+(i%3?'maple':'oak')+'"/></svg>';canopy.append(leaf)}scene.append(canopy);
  for(let i=0;i<10;i++){
    const leaf=document.createElement('span');leaf.className='harvest-leaf';
    leaf.style.cssText=`--leaf-left:${5+i*10}%;--leaf-duration:${24+i%4*5}s;--leaf-delay:${-i*5.7}s;--leaf-size:${16+i%3*6}px;--leaf-sway:${i%2?-55:65}px;--leaf-turn:${i%2?260:-210}deg;color:${colors[i%colors.length]}`;
    leaf.innerHTML='<svg viewBox="0 0 64 72" focusable="false"><use href="#harvest-'+(i%3?'maple':'oak')+'"/></svg>';scene.append(leaf);
  }
  const sprig='<svg viewBox="0 0 170 140" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M11 134Q78 110 145 14M40 127Q93 83 89 12M25 132Q60 72 32 35"/><path d="m106 64 2-24m-2 24 24-5m-40 25 2-22m-2 22 23-3m-39 21-1-23m1 23 20-1m-36 16-6-20m6 20 22 1M88 38 77 25m11 13 10-13M86 63 72 48m14 15 13-14M73 89 60 76m13 13 18-7M39 79 25 69m14 10 8-16M33 101 20 89m13 12 13-12"/></g><g fill="currentColor"><ellipse cx="113" cy="40" rx="5" ry="10" transform="rotate(25 113 40)"/><ellipse cx="131" cy="58" rx="5" ry="10" transform="rotate(62 131 58)"/><ellipse cx="95" cy="65" rx="5" ry="9" transform="rotate(18 95 65)"/><ellipse cx="114" cy="82" rx="5" ry="10" transform="rotate(68 114 82)"/></g></svg>';
  const left=document.createElement('div');left.className='harvest-sprig harvest-sprig-left';left.innerHTML=sprig;scene.append(left);
  const right=left.cloneNode(true);right.className='harvest-sprig harvest-sprig-right';scene.append(right);
  document.body.prepend(scene);
  const season=document.createElement('div');season.className='harvest-season-label';season.innerHTML='<span aria-hidden="true">🍂</span><span>Autumn season</span><span aria-hidden="true">🍂</span>';home.querySelector('.hero-copy')?.prepend(season);
  const startup=document.querySelector('#startup-loader .startup-card');
  if(startup){const greeting=document.createElement('div');greeting.className='harvest-welcome';greeting.innerHTML='<h2><span aria-hidden="true">🦃</span> Thanksgiving is coming soon....</h2>';startup.prepend(greeting)}
  function pause(){document.body.classList.toggle('harvest-paused',document.hidden)}
  document.addEventListener('visibilitychange',pause);pause();
})();
