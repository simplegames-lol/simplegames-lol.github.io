(() => {
  const panel=document.createElement('section');panel.className='music-panel';panel.hidden=true;panel.setAttribute('aria-label','Music');
  const style=document.createElement('style');style.textContent='.music-panel{position:fixed;inset:0;z-index:550;display:flex;flex-direction:column;background:var(--background);color:var(--text)}.music-panel[hidden]{display:none!important}.music-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border)}.music-bar strong{margin-right:auto}.music-frame{width:100%;flex:1;min-height:0;border:0;background:var(--background)}';document.head.append(style);
  panel.innerHTML='<header class="music-bar"><button type="button" class="secondary-button">← Home</button><strong>🎵 Music</strong><button type="button" class="secondary-button">Reload</button></header>';
  const frame=document.createElement('iframe');frame.className='music-frame';frame.title='Music — Nubana';frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');frame.setAttribute('allow','autoplay; encrypted-media; fullscreen');frame.allowFullscreen=true;
  let opener=null;
  function load(){frame.src='https://nubana.cfd/?m=rosin%3A%2F%2Fmusic'}
  function open(event){if(!panel.hidden)return;opener=event?.currentTarget;panel.hidden=false;load();panel.querySelector('button').focus();window.dispatchEvent(new CustomEvent('simplegames:media-start',{detail:{title:'Listening to music'}}))}
  function close(){panel.hidden=true;frame.src='about:blank';window.dispatchEvent(new Event('simplegames:media-stop'));opener?.focus()}
  panel.querySelectorAll('button')[0].onclick=close;panel.querySelectorAll('button')[1].onclick=load;
  document.querySelector('#music-open')?.addEventListener('click',open);document.querySelector('#music-home-open')?.addEventListener('click',open);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});panel.append(frame);document.body.append(panel);
})();
