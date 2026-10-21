(() => {
  const providers = {
    nubana: {name:'Nubana',logo:'assets/media-providers/nubana.png',url:'https://nubana.cfd/?m=rosin%3A%2F%2Fmovies'},
    lookmovie: {name:'LookMovie2',logo:'assets/media-providers/lookmovie.webp',url:'https://www.lookmovie2.to/movies/page/717'}
  };
  const panel=document.createElement('section');panel.className='movies-panel';panel.hidden=true;panel.setAttribute('aria-label','Movies & TV');
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
    .movies-provider-card img{width:140px;height:80px;object-fit:contain}.movies-provider-card[data-provider="nubana"] img{width:80px;border-radius:14px}
    @media(max-width:600px){.movies-provider-grid{grid-template-columns:1fr;max-width:340px}.movies-choice{align-content:start}.movies-provider-card{flex-direction:row;padding:18px;gap:18px}.movies-provider-card img{width:100px;height:58px}.movies-provider-card[data-provider="nubana"] img{width:58px;margin:0 21px}.movies-bar{padding:10px}.movies-choice h2{font-size:20px}}
  `;document.head.append(style);
  function button(label){const b=document.createElement('button');b.type='button';b.className='secondary-button';b.textContent=label;return b}
  const bar=document.createElement('header');bar.className='movies-bar';
  const home=button('← Home'),change=button('Change provider'),reload=button('Reload');
  const title=document.createElement('strong');title.textContent='🎬 Movies & TV';bar.append(home,title,change,reload);
  const choice=document.createElement('div');choice.className='movies-choice';choice.innerHTML='<h2>Choose where to watch</h2><div class="movies-provider-grid"></div>';
  const frame=document.createElement('iframe');frame.className='movies-frame';frame.hidden=true;frame.title='Movies & TV';frame.referrerPolicy='no-referrer';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');frame.setAttribute('allow','fullscreen; encrypted-media');frame.allowFullscreen=true;
  let selected=null,opener=null;
  function stop(){frame.src='about:blank';frame.hidden=true;window.dispatchEvent(new Event('simplegames:media-stop'))}
  function showChoice(){stop();selected=null;choice.hidden=false;change.hidden=true;reload.hidden=true;title.textContent='🎬 Movies & TV'}
  function load(){
    if(panel.hidden||!selected)return;
    choice.hidden=true;frame.hidden=false;change.hidden=false;reload.hidden=false;
    frame.title=providers[selected].name+' — Movies & TV';frame.src=providers[selected].url;title.textContent='🎬 '+providers[selected].name;
    window.dispatchEvent(new CustomEvent('simplegames:media-start',{detail:{title:'Watching movies & TV'}}));
  }
  for(const [id,provider] of Object.entries(providers)){
    const card=button('');card.className='movies-provider-card';card.dataset.provider=id;card.setAttribute('aria-label','Choose '+provider.name);
    const logo=document.createElement('img');logo.src=provider.logo;logo.alt=provider.name+' logo';
    const name=document.createElement('strong');name.textContent=provider.name;card.append(logo,name);
    card.onclick=()=>{selected=id;load();change.focus()};choice.querySelector('.movies-provider-grid').append(card);
  }
  function open(event){if(!panel.hidden)return;opener=event?.currentTarget;panel.hidden=false;showChoice();choice.querySelector('button').focus()}
  function close(){panel.hidden=true;showChoice();opener?.focus()}
  home.onclick=close;reload.onclick=load;change.onclick=()=>{showChoice();choice.querySelector('button').focus()};
  document.querySelector('#movies-open')?.addEventListener('click',open);document.querySelector('#movies-home-open')?.addEventListener('click',open);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});
  showChoice();panel.append(bar,choice,frame);document.body.append(panel);
})();
