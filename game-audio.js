(() => {
  const player=document.querySelector('#game-player'),overlay=document.querySelector('#game-overlay'),open=document.querySelector('#game-audio-open');if(!player||!open)return;
  const read=()=>{try{const v=JSON.parse(localStorage.getItem('sg-game-volume')??'1');return typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1,v)):1}catch{return 1}};
  let volume=read(),previous=volume||1,timer=null;
  const dialog=document.createElement('dialog');dialog.className='game-audio-panel';dialog.setAttribute('aria-labelledby','game-audio-title');
  dialog.innerHTML='<header><strong id="game-audio-title">Game volume</strong><button type="button" aria-label="Close game volume">×</button></header><label for="game-volume">Volume<output id="game-volume-value">100%</output></label><input id="game-volume" type="range" min="0" max="100" step="1" disabled /><button id="game-volume-mute" class="secondary-button" type="button" disabled>Mute</button><p role="status">Start the game to check audio support.</p>';
  overlay.append(dialog);const slider=dialog.querySelector('input'),value=dialog.querySelector('output'),mute=dialog.querySelector('#game-volume-mute'),status=dialog.querySelector('[role="status"]');
  function bridges(){const found=[],seen=new Set();let external=false;function visit(frame,depth){if(depth>4||seen.has(frame))return;seen.add(frame);try{const win=frame.contentWindow,doc=win?.document;if(!doc)return;if(win.simpleGamesAudio)found.push(win.simpleGamesAudio);doc.querySelectorAll('iframe').forEach(child=>visit(child,depth+1))}catch{external=true}}visit(player,0);return {found,external}}
  function refresh(){const {found,external}=bridges();let supported=false;for(const bridge of found){try{bridge.set(volume);supported=bridge.state().supported||supported}catch{}}
    slider.disabled=mute.disabled=!supported;slider.value=String(Math.round(volume*100));value.textContent=Math.round(volume*100)+'%';mute.textContent=volume===0?'Unmute':'Mute';mute.setAttribute('aria-pressed',String(volume===0));
    status.textContent=supported?'Controls this game only—not messages, Music, or calls.':external?'This external game does not expose audio controls. Use its own sound settings.':found.length?'Waiting for game audio. Start playing first.':'Volume control is not supported by this player. Use its own sound settings.';
  }
  function save(){try{localStorage.setItem('sg-game-volume',JSON.stringify(volume))}catch{}refresh()}
  slider.addEventListener('input',()=>{volume=Number(slider.value)/100;if(volume>0)previous=volume;save()});
  mute.onclick=()=>{if(volume>0){previous=volume;volume=0}else volume=previous;save()};
  open.onclick=()=>{refresh();dialog.showModal()};dialog.querySelector('header button').onclick=()=>dialog.close();
  function lifecycle(){clearInterval(timer);timer=null;if(overlay.hidden||document.hidden){if(dialog.open)dialog.close();return}refresh();timer=setInterval(refresh,1000)}
  new MutationObserver(lifecycle).observe(overlay,{attributes:true,attributeFilter:['hidden']});
  player.addEventListener('load',refresh);document.addEventListener('visibilitychange',lifecycle);
  document.addEventListener('simplegames:settings-reset',()=>{volume=previous=1;save()});
  document.addEventListener('simplegames:preferences-loaded',()=>{volume=read();refresh()});
})();
