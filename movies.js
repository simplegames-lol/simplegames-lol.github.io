(() => {
  const providers = {
    vidnest: {name:'VidNest',description:'(Movies & TV Shows)',logo:'assets/media-providers/vidnest.ico',url:'https://vidnest.fun/'},
    lookmovie: {name:'LookMovie2',description:'(Movies only)',logo:'assets/media-providers/lookmovie.webp',url:'https://www.lookmovie2.to/movies/page/717'}
  };
  const panel=document.createElement('section');panel.className='movies-panel';panel.hidden=true;panel.setAttribute('aria-label','Movies');
  const style=document.createElement('style');
  style.textContent=`
    .movies-panel{position:fixed;inset:0;z-index:550;background:var(--background);color:var(--text);display:flex;flex-direction:column}
    .movies-panel[hidden],.movies-panel [hidden]{display:none!important}
    .movies-bar{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:12px 18px;border-bottom:1px solid var(--border)}
    .movies-bar strong{margin-right:auto}.movies-frame{width:100%;flex:1;min-height:0;border:0;background:var(--background)}
    .movies-choice{flex:1;min-height:0;overflow:auto;display:grid;align-content:center;justify-items:center;padding:28px 20px;gap:24px}
    .movies-choice h2{margin:0;font-size:22px}.movies-provider-grid{display:grid;grid-template-columns:repeat(2,minmax(0,230px));gap:16px;width:min(100%,476px)}
    .movies-provider-card{min-width:0;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:14px;padding:28px 16px;display:flex;flex-direction:column;align-items:center;gap:20px;font:inherit;cursor:pointer}
    .movies-provider-card:hover{border-color:var(--muted)}.movies-provider-card:focus-visible{outline:2px solid var(--text);outline-offset:3px}
    .movies-provider-label{display:flex;flex-direction:column;align-items:center;gap:6px}.movies-provider-label small{color:var(--muted);font-size:12px;font-weight:400}
    .movies-provider-card img{width:140px;height:80px;object-fit:contain}.movies-provider-card[data-provider="vidnest"] img{width:80px;border-radius:14px}
    @media(max-width:600px){.movies-provider-grid{grid-template-columns:1fr;max-width:340px}.movies-choice{align-content:start}.movies-provider-card{flex-direction:row;padding:18px;gap:18px}.movies-provider-card img{width:100px;height:58px}.movies-provider-card[data-provider="vidnest"] img{width:58px;margin:0 21px}.movies-bar{padding:10px}.movies-choice h2{font-size:20px}}
  `;document.head.append(style);
  const notice=document.createElement('dialog');notice.className='movies-id-notice';notice.setAttribute('aria-labelledby','movies-id-title');
  notice.innerHTML='<h2 id="movies-id-title">Before you watch</h2><p>When loading in, make sure you go to Google and look up “Movie ID (TMDB) (Movie name here)” to find the right movie so you can copy and paste its ID to watch. Do the same for TV shows and other titles.</p><form method="dialog"><button type="submit" value="ok" class="secondary-button">OK</button></form>';
  const noticeStyle=document.createElement('style');noticeStyle.textContent='.movies-id-notice{width:min(480px,calc(100vw - 40px));box-sizing:border-box;padding:24px;border:1px solid var(--border);border-radius:14px;background:var(--surface);color:var(--text);font:inherit}.movies-id-notice::backdrop{background:rgba(0,0,0,.75)}.movies-id-notice h2{font-size:20px;margin:0 0 14px}.movies-id-notice p{color:var(--muted);line-height:1.65;margin:0 0 22px}.movies-id-notice form{display:flex;justify-content:flex-end}.movies-id-notice button{min-width:82px}';document.head.append(noticeStyle);document.body.append(notice);
  function button(label){const b=document.createElement('button');b.type='button';b.className='secondary-button';b.textContent=label;return b}
  const bar=document.createElement('header');bar.className='movies-bar';
  const home=button('← Home'),change=button('Change provider'),reload=button('Reload');
  const title=document.createElement('strong');title.textContent='🎬 Movies';bar.append(home,title,change,reload);
  const choice=document.createElement('div');choice.className='movies-choice';choice.innerHTML='<h2>Choose where to watch</h2><div class="movies-provider-grid"></div>';
  const idForm=document.createElement('form');idForm.className='vidnest-id-form';idForm.hidden=true;
  idForm.innerHTML='<h2>What are we watching?</h2><div class="vidnest-fields"><label>Type<select name="kind"><option value="movie">Movie</option><option value="tv">TV show</option></select></label><label>TMDB ID<input name="tmdb" inputmode="numeric" pattern="[1-9][0-9]{0,8}" maxlength="9" placeholder="Movie or show ID" required /></label><label data-tv hidden>Season<input name="season" inputmode="numeric" value="1" /></label><label data-tv hidden>Episode<input name="episode" inputmode="numeric" value="1" /></label><button type="submit" class="secondary-button">Play</button></div><p role="status"></p>';
  const idStyle=document.createElement('style');idStyle.textContent='.vidnest-id-form{padding:20px;margin:0 auto;width:min(720px,100%);box-sizing:border-box}.vidnest-id-form h2{font-size:18px;margin:0 0 18px}.vidnest-fields{display:flex;flex-wrap:wrap;align-items:end;gap:12px}.vidnest-fields label{display:grid;gap:7px;font-size:12px;color:var(--muted)}.vidnest-fields input,.vidnest-fields select{font:inherit;color:var(--text);background:var(--background);border:1px solid var(--border);border-radius:8px;padding:11px;max-width:190px}.vidnest-id-form [hidden]{display:none!important}.vidnest-id-form p{font-size:12px;color:var(--muted)}';document.head.append(idStyle);
  let vidnestURL=null;
  const editTitle=button('Change title');editTitle.hidden=true;bar.append(editTitle);
  idForm.addEventListener('change',()=>{idForm.querySelectorAll('[data-tv]').forEach(label=>label.hidden=idForm.elements.kind.value!=='tv')});
  idForm.onsubmit=event=>{event.preventDefault();try{const f=idForm.elements;vidnestURL=window.simpleGamesVidNestURL(f.kind.value,f.tmdb.value,f.season.value,f.episode.value);idForm.querySelector('[role="status"]').textContent='';load()}catch(error){idForm.querySelector('[role="status"]').textContent=error.message}};
  editTitle.onclick=()=>{stop();vidnestURL=null;idForm.hidden=false;editTitle.hidden=true;reload.hidden=true;idForm.querySelector('input')?.focus()};
  function createPlayer(provider){
    const player=document.createElement('iframe');player.className='movies-frame';player.hidden=true;player.title='Movies';player.referrerPolicy='no-referrer';
    // VidNest requires an unsandboxed frame; approved for this provider only.
    if(provider!=='vidnest')player.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');
    player.setAttribute('allow','fullscreen; encrypted-media');player.allowFullscreen=true;return player;
  }
  let frame=createPlayer(null);
  let selected=null,opener=null;
  function stop(){frame.src='about:blank';frame.hidden=true;window.dispatchEvent(new Event('simplegames:media-stop'))}
  function showChoice(){stop();selected=null;vidnestURL=null;idForm.hidden=true;editTitle.hidden=true;choice.hidden=false;change.hidden=true;reload.hidden=true;title.textContent='🎬 Movies'}
  function load(){
    if(panel.hidden||!selected)return;
    if(selected==='vidnest'&&!vidnestURL){choice.hidden=true;idForm.hidden=false;change.hidden=false;reload.hidden=true;title.textContent='🎬 VidNest';idForm.querySelector('input')?.focus();return}
    idForm.hidden=true;editTitle.hidden=selected!=='vidnest';
    // A fresh browsing context prevents VidNest's relaxed permissions carrying over.
    const previous=frame;frame=createPlayer(selected);previous.replaceWith(frame);previous.src='about:blank';
    choice.hidden=true;frame.hidden=false;change.hidden=false;reload.hidden=false;
    frame.title=providers[selected].name+' — Movies';frame.src=selected==='vidnest'?vidnestURL:providers[selected].url;title.textContent='🎬 '+providers[selected].name;
    window.dispatchEvent(new CustomEvent('simplegames:media-start',{detail:{title:'Watching movies & TV'}}));
  }
  for(const [id,provider] of Object.entries(providers)){
    const card=button('');card.className='movies-provider-card';card.dataset.provider=id;card.setAttribute('aria-label','Choose '+provider.name);
    const logo=document.createElement('img');logo.src=provider.logo;logo.alt=provider.name+' logo';
    const label=document.createElement('span');label.className='movies-provider-label';
    const name=document.createElement('strong');name.textContent=provider.name;
    const description=document.createElement('small');description.textContent=provider.description;label.append(name,description);card.append(logo,label);
    card.onclick=()=>{selected=id;if(id==='vidnest'){notice.returnValue='';notice.showModal()}else{load();change.focus()}};choice.querySelector('.movies-provider-grid').append(card);
  }
  function open(event){if(!panel.hidden)return;opener=event?.currentTarget;panel.hidden=false;showChoice();choice.querySelector('button').focus()}
  notice.addEventListener('close',()=>{if(notice.returnValue==='ok'&&selected==='vidnest'&&!panel.hidden){load();change.focus()}else if(!panel.hidden){selected=null;choice.querySelector('button').focus()}});
  function close(){panel.hidden=true;if(notice.open)notice.close();showChoice();opener?.focus()}
  home.onclick=close;reload.onclick=load;change.onclick=()=>{showChoice();choice.querySelector('button').focus()};
  document.querySelector('#movies-open')?.addEventListener('click',open);document.querySelector('#movies-home-open')?.addEventListener('click',open);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden&&!notice.open)close()});
  showChoice();panel.append(bar,choice,idForm,frame);document.body.append(panel);
})();
