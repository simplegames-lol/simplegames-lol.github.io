(() => {
 const welcome=document.querySelector('#personal-welcome'),timer=document.querySelector('#session-timer');
 if(!welcome||!timer)return;
 document.addEventListener('simplegames:profile',event=>{const profile=event.detail?.profile||{},name=profile.displayName||profile.username;welcome.textContent=name?`Welcome back, ${name}.`:'Welcome to Simple Games.'});
 document.addEventListener('simplegames:auth',()=>{welcome.textContent='Welcome to Simple Games.'});
 let elapsed=0;try{const value=Number(sessionStorage.getItem('sg-visible-session-ms'));if(Number.isFinite(value)&&value>=0)elapsed=value}catch{}
 let last=performance.now(),visible=!document.hidden;
 function update(){const now=performance.now();if(visible)elapsed+=Math.max(0,now-last);last=now;const minutes=Math.floor(elapsed/60000);timer.textContent=minutes?`Playing for ${minutes} minute${minutes===1?'':'s'}`:'Playing for less than a minute';try{sessionStorage.setItem('sg-visible-session-ms',String(Math.floor(elapsed)))}catch{}}
 document.addEventListener('visibilitychange',()=>{update();visible=!document.hidden});
 window.addEventListener('pagehide',update);setInterval(update,1000);update();
})();
