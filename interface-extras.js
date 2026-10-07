(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,tagline=document.querySelector('.dashboard-hero p'),phrases=['What are we playing today?','One more round?','Find your next favorite.','Games are better together.'];let phrase=0,letter=0,erasing=false;
 if(tagline&&!reduced){tagline.setAttribute('aria-label',phrases[0]);const tick=()=>{const text=phrases[phrase];letter+=erasing?-1:1;tagline.textContent=text.slice(0,letter)||'\u00a0';let delay=erasing?35:80;if(letter===text.length&&!erasing){erasing=true;delay=2400}else if(letter===0){erasing=false;phrase=(phrase+1)%phrases.length;delay=500}setTimeout(tick,delay)};tick()}
 const toggle=document.createElement('button');toggle.className='sidebar-toggle';toggle.type='button';toggle.textContent='☰';toggle.setAttribute('aria-label','Toggle sidebar');document.body.append(toggle);let closed=false;try{closed=JSON.parse(localStorage.getItem('sg-sidebar-closed')||'false')===true}catch{}function apply(){document.body.classList.toggle('sidebar-collapsed',closed);toggle.setAttribute('aria-expanded',String(!closed))}apply();document.addEventListener('simplegames:settings-reset',()=>{closed=false;apply()});toggle.onclick=()=>{closed=!closed;try{localStorage.setItem('sg-sidebar-closed',JSON.stringify(closed))}catch{}apply()};
 if(!reduced){
   let n=0;setInterval(()=>{n=(n+1)%16;document.title='Simple Games'.slice(0,n)||'\u200b'},450);
   const image=new Image();
   image.onload=()=>{
     const canvas=document.createElement('canvas');canvas.width=canvas.height=32;
     const ctx=canvas.getContext('2d'),frames=[];
     // Pre-render the same 1.8-second rotation and gentle scale as the website cat.
     for(let frame=0;frame<18;frame++){
       const progress=frame/18,angle=progress<=.45?progress/.45*Math.PI:Math.PI+(progress-.45)/.55*Math.PI;
       const scale=progress<=.45?1+.07*progress/.45:1.07-.07*(progress-.45)/.55;
       ctx.clearRect(0,0,32,32);ctx.save();ctx.translate(16,16);ctx.rotate(angle);ctx.scale(scale,scale);
       ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.clip();ctx.drawImage(image,-14,-14,28,28);ctx.restore();frames.push(canvas.toDataURL('image/png'));
     }
     // Keep one icon candidate; competing static icons can win browser selection.
     document.querySelectorAll('link[rel="icon"]').forEach(link=>link.remove());
     const icon=document.createElement('link');icon.rel='icon';icon.type='image/png';icon.sizes='32x32';icon.href=frames[0];document.head.append(icon);
     // Leave each frame enough time to decode before requesting the next icon.
     let frame=0;setInterval(()=>{frame=(frame+1)%frames.length;icon.remove();icon.href=frames[frame];document.head.append(icon)},100);
   };
   image.src='assets/cat-logo-original.jpg';
 }
})();
