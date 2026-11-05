(() => {
 const dock=document.createElement('nav');
 dock.className='floating-dock';dock.setAttribute('aria-label','Page controls');
 dock.innerHTML='<button type="button" data-dock="home" aria-label="Home" title="Home">⌂</button><button type="button" data-dock="back" title="Back">← Back</button><button type="button" data-dock="reload" aria-label="Reload page" title="Reload">↻</button><strong class="dock-title">Simple Games</strong><span class="dock-zoom"><button type="button" data-dock="out" aria-label="Zoom out">−</button><button type="button" data-dock="reset" aria-label="Reset zoom">100%</button><button type="button" data-dock="in" aria-label="Zoom in">+</button></span><button type="button" data-dock="full" aria-label="Toggle fullscreen" title="Fullscreen">⛶</button><button type="button" data-dock="collapse" aria-label="Collapse toolbar" title="Collapse toolbar">⌄</button><span class="dock-status sr-only" role="status"></span>';
 document.body.append(dock);document.body.classList.add('has-floating-dock');
 const definitions=[
  ['#game-overlay','#game-title','#game-close','#game-player'],
  ['.staff-panel','#staff-panel-title','[data-staff-close]'],
  ['.movies-panel','.movies-bar strong','.movies-bar>button:first-child','.movies-frame'],
  ['.music-panel','.music-bar strong','.music-bar>button:first-child','.music-frame'],
  ['#support-panel','.support-heading h1','#support-close'],
  ['#social-panel','#social-title','#social-close'],
  ['#server-panel','.server-topbar h2','#servers-close'],
  ['.real-shop','.real-shop-header h1','#shop-home'],
  ['#settings-panel','.settings-heading h2','#settings-close'],
  ['#info-overlay','#info-title','#info-close']
 ];
 const scales=new WeakMap();let active,frame,closeButton,currentTarget,scheduled=false;
 function visible(element){return element&&!element.hidden&&element.getClientRects().length>0}
 function refresh(){
  scheduled=false;active=null;frame=null;closeButton=null;
  for(const [selector,title,close,player]of definitions){const element=document.querySelector(selector);if(!visible(element))continue;active=element;frame=player?element.querySelector(player):null;if(frame&&!visible(frame))frame=null;closeButton=element.querySelector(close);dock.querySelector('.dock-title').textContent=element.querySelector(title)?.textContent.trim()||element.getAttribute('aria-label')||'Shop';break}
  if(!active)dock.querySelector('.dock-title').textContent=visible(document.querySelector('#game-library'))&&document.querySelector('#game-library').getBoundingClientRect().top<innerHeight*.5?'Games':'Simple Games';
  currentTarget=frame||active||document.querySelector('body>.page-shell');
  dock.querySelector('[data-dock="reset"]').textContent=Math.round((scales.get(currentTarget)||1)*100)+'%';
  dock.hidden=visible(document.querySelector('#startup-loader'));
  const fs=document.fullscreenElement;
  const parent=fs&&fs!==document.documentElement?fs:document.body;
  if(dock.parentNode!==parent)parent.append(dock);
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh)}}
 const observer=new MutationObserver(records=>{if(records.some(record=>record.target!==dock&&!dock.contains(record.target)))schedule()});
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class','src']});
 function zoom(delta){if(!currentTarget)return;const value=delta===0?1:Math.min(1.4,Math.max(.7,Math.round(((scales.get(currentTarget)||1)+delta)*10)/10));scales.set(currentTarget,value);currentTarget.style.zoom=String(value);if(currentTarget===frame)currentTarget.style.width=(100/value)+'%';dock.querySelector('[data-dock="reset"]').textContent=Math.round(value*100)+'%'}
 function home(){for(const [selector,,close]of definitions){const element=document.querySelector(selector);if(visible(element))element.querySelector(close)?.click()}document.querySelector('.brand')?.click();schedule()}
 dock.addEventListener('click',async event=>{
  const action=event.target.closest('[data-dock]')?.dataset.dock;if(!action)return;
  refresh();
  if(dock.classList.contains('dock-collapsed')){dock.classList.remove('dock-collapsed');dock.querySelector('[data-dock="collapse"]').setAttribute('aria-label','Collapse toolbar');return}
  if(action==='home')home();
  if(action==='back'){if(closeButton)closeButton.click();else home()}
  if(action==='reload'){if(frame){if(confirm('Reload this player? Unsaved progress may be lost.')){const reload=active.querySelector('.music-bar>button:last-child,.movies-bar>button:nth-of-type(3)');if(reload&&!reload.hidden)reload.click();else frame.src=frame.src}}else if(confirm('Reload the website? Unsaved changes may be lost.'))location.reload()}
  if(action==='in')zoom(.1);if(action==='out')zoom(-.1);if(action==='reset')zoom(0);
  if(action==='collapse'){dock.classList.add('dock-collapsed');dock.querySelector('[data-dock="collapse"]').setAttribute('aria-label','Expand toolbar');}
  if(action==='full'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{dock.querySelector('.dock-status').textContent='Fullscreen is unavailable in this browser.'}}
  schedule();
 });
 document.addEventListener('fullscreenchange',schedule);window.addEventListener('resize',schedule);window.addEventListener('scroll',schedule,{passive:true});refresh();
})();
