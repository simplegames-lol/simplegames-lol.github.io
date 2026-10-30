(() => {
 const end=Date.UTC(2026,10,2,5),start=Date.UTC(2026,9,31,4);
 if(Date.now()>=end)return;
 const home=document.querySelector('.dashboard-hero'),reduced=matchMedia('(prefers-reduced-motion:reduce)');if(!home)return;
 const read=key=>{try{return JSON.parse(localStorage.getItem(key))!==false}catch{return true}};
 const box=document.querySelector('#message-popups')?.closest('label');
 for(const [id,text] of [['halloween-motion','Halloween animations'],['pumpkin-trail','Pumpkin cursor trail']]){
  const label=document.createElement('label');label.className='check-setting';const input=document.createElement('input');input.type='checkbox';input.id=id;input.checked=read('sg-'+id);label.append(input,document.createTextNode(' '+text));box?.before(label);
  input.addEventListener('change',()=>{try{localStorage.setItem('sg-'+id,JSON.stringify(input.checked))}catch{}sync()});
 }
 let motion=true,trail=true;
 function sync(){motion=read('sg-halloween-motion')&&!reduced.matches;trail=read('sg-pumpkin-trail')&&motion;document.body.classList.toggle('halloween-still',!motion)}
 reduced.addEventListener('change',sync);sync();
 document.addEventListener('simplegames:settings-reset',()=>{for(const id of ['halloween-motion','pumpkin-trail']){try{localStorage.removeItem('sg-'+id)}catch{}const input=document.getElementById(id);if(input)input.checked=true}sync()});
 window.addEventListener('storage',e=>{if(['sg-halloween-motion','sg-pumpkin-trail'].includes(e.key)){for(const id of ['halloween-motion','pumpkin-trail'])document.getElementById(id).checked=read('sg-'+id);sync()}});
 const countdown=document.createElement('p');countdown.className='halloween-countdown';home.querySelector('.hero-copy')?.append(countdown);
 function tick(){const now=Date.now(),left=start-now;if(now>=end){countdown.remove();return}if(left<=0){countdown.textContent=now<Date.UTC(2026,10,1,4)?'Happy Halloween 🎃':'Halloween weekend 🎃';return}const hours=Math.floor(left/3600000),days=Math.floor(hours/24);countdown.textContent='Halloween in '+(days?days+'d ':'')+(hours%24)+'h '+Math.floor(left/60000)%60+'m'}
 let timer;function clock(){document.body.classList.toggle('halloween-page-hidden',document.hidden);clearInterval(timer);tick();if(!document.hidden)timer=setInterval(tick,60000)}document.addEventListener('visibilitychange',clock);clock();
 const tiles=[...home.querySelectorAll('.dashboard-shortcuts>button')];for(const [i,tile] of tiles.entries()){if(i!==1&&i!==5)continue;const ghost=document.createElement('i');ghost.className='halloween-ghost';ghost.setAttribute('aria-hidden','true');ghost.style.animationDelay=(i===1?'-8s':'-23s');tile.append(ghost)}
 let last=0;
 document.addEventListener('pointermove',e=>{
  if(!trail||e.pointerType!=='mouse'||document.hidden||document.body.classList.contains('game-is-open')||performance.now()-last<100||document.querySelector('.real-shop:not([hidden]),.social-panel:not([hidden]),#settings-panel:not([hidden]),#info-overlay:not([hidden]),#server-panel:not([hidden]),.movies-panel:not([hidden]),.music-panel:not([hidden])'))return;
  if(document.querySelectorAll('.pumpkin-trail-dot').length>=9)return;last=performance.now();const dot=document.createElement('span');dot.className='pumpkin-trail-dot';dot.setAttribute('aria-hidden','true');dot.textContent='🎃';dot.style.left=(e.clientX+12)+'px';dot.style.top=(e.clientY+12)+'px';document.body.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});setTimeout(()=>dot.remove(),900);
 },{passive:true});
})();
