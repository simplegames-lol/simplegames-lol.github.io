(()=>{
 const panel=document.createElement('section');panel.className='movies-panel';panel.hidden=true;panel.setAttribute('aria-label','Movies');
 panel.innerHTML='<header class="movies-bar"><button class="secondary-button" type="button">← Home</button><strong>🎬 Movies</strong><button class="secondary-button" type="button">Reload</button></header><p class="movies-note">External provider · Playback depends on their site.</p>';
 const style=document.createElement('style');style.textContent='.movies-panel{position:fixed;inset:0;z-index:550;background:var(--background);color:var(--text);display:flex;flex-direction:column}.movies-panel[hidden]{display:none!important}.movies-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border)}.movies-bar strong{margin-right:auto}.movies-note{margin:0;padding:8px 18px;color:var(--muted);font-size:12px}.movies-frame{width:100%;flex:1;min-height:0;border:0;background:var(--background)}';document.head.append(style);
 const frame=document.createElement('iframe');frame.className='movies-frame';frame.title='Movies';frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');frame.setAttribute('allow','fullscreen; encrypted-media');frame.allowFullscreen=true;
 function load(){frame.src='https://www.lookmovie2.to/movies/page/717'}
 function open(){if(!panel.hidden)return;panel.hidden=false;load();window.dispatchEvent(new CustomEvent('simplegames:media-start',{detail:{title:'Watching movies'}}))}
 function close(){panel.hidden=true;frame.src='about:blank';window.dispatchEvent(new Event('simplegames:media-stop'))}
 panel.querySelectorAll('button')[0].onclick=close;panel.querySelectorAll('button')[1].onclick=load;
 document.querySelector('#movies-open').onclick=open;document.querySelector('#movies-home-open').onclick=open;
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});panel.append(frame);document.body.append(panel);
})();
