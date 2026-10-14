(() => {
  const panel=document.createElement('section');
  panel.className='movies-panel';panel.hidden=true;panel.setAttribute('aria-label','Movies/TV Shows');
  const style=document.createElement('style');
  style.textContent='.movies-panel{position:fixed;inset:0;z-index:550;background:#000;color:#fff;display:flex;flex-direction:column}.movies-panel [hidden],.movies-panel[hidden]{display:none!important}.movies-bar{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:12px 18px;border-bottom:1px solid #282d34}.movies-bar strong{margin-right:auto}.movies-note{margin:0;padding:8px 18px;color:#9ba2ac;font-size:12px}.movies-frame{width:100%;flex:1;min-height:0;border:0;background:#000}.movies-choice{flex:1;display:grid;place-content:center;padding:24px;overflow:auto}.movies-choice h2{font-size:22px;text-align:center;margin:0 0 10px}.movies-choice>p{color:#9ba2ac;text-align:center;margin:0 0 28px}.movies-provider-grid{display:grid;grid-template-columns:repeat(2,minmax(0,260px));gap:18px}.movies-provider-card{background:#000;color:#fff;border:1px solid #30343b;border-radius:12px;padding:26px 20px;display:flex;align-items:center;flex-direction:column;gap:14px;font:inherit;cursor:pointer}.movies-provider-card:hover{background:#0d0d0d;border-color:#626a77}.movies-provider-card:focus-visible{outline:2px solid #8ea9bf;outline-offset:3px}.movies-provider-card img{width:140px;height:80px;object-fit:contain}.movies-provider-card small{color:#9ba2ac}.movies-provider-card span{font-size:12px;border:1px solid #30343b;border-radius:7px;padding:8px 16px}@media(max-width:500px){.movies-provider-grid{grid-template-columns:1fr}.movies-provider-card{padding:18px}.movies-provider-card img{height:60px}}';
  document.head.append(style);
  const bar=document.createElement('div');bar.className='movies-bar';
  const home=document.createElement('button');home.className='secondary-button';home.textContent='← Home';
  const title=document.createElement('strong');title.textContent='🎬 Movies/TV Shows';
  const change=document.createElement('button');change.className='secondary-button';change.textContent='Change provider';change.hidden=true;
  const retry=document.createElement('button');retry.className='secondary-button';retry.textContent='Reload';retry.hidden=true;
  const note=document.createElement('p');note.className='movies-note';
  const choice=document.createElement('div');choice.className='movies-choice';
  choice.innerHTML='<h2>Choose where to watch</h2><p>Pick a provider for movies and TV shows.</p><div class="movies-provider-grid"></div>';
  const providers={
    lookmovie:{name:'LookMovie2',description:'Movies',logo:'assets/media-providers/lookmovie.webp',url:'https://www.lookmovie2.to/movies/page/717'},
    rive:{name:'Rive',description:'TV Shows and Movies',logo:'assets/media-providers/rive.png',url:'https://www.rivestream.app/'}
  };
  const frame=document.createElement('iframe');frame.className='movies-frame';frame.hidden=true;frame.title='External movie and TV website';frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');frame.setAttribute('allow','fullscreen; encrypted-media');frame.allowFullscreen=true;
  let timer,sessionOpen=false,selected=null;
  function load(){
    if(!selected||!sessionOpen)return;
    clearTimeout(timer);choice.hidden=true;frame.hidden=false;change.hidden=false;retry.hidden=false;
    note.textContent='Loading '+providers[selected].name+'…';frame.src=providers[selected].url;
    window.dispatchEvent(new CustomEvent('simplegames:media-start',{detail:{title:'Watching movies/TV'}}));
    timer=setTimeout(()=>{note.textContent='Taking a while? The provider may block embedded playback. Try Reload.'},15000);
  }
  function showChoice(){
    clearTimeout(timer);selected=null;frame.src='about:blank';frame.hidden=true;choice.hidden=false;change.hidden=true;retry.hidden=true;
    note.textContent='External providers · Playback and availability depend on their sites.';
    window.dispatchEvent(new Event('simplegames:media-stop'));
  }
  for(const [id,provider] of Object.entries(providers)){
    const card=document.createElement('button');card.type='button';card.className='movies-provider-card';card.setAttribute('aria-label','Choose '+provider.name);
    const logo=document.createElement('img');logo.src=provider.logo;logo.alt=provider.name+' logo';
    const name=document.createElement('strong');name.textContent=provider.name;
    const description=document.createElement('small');description.textContent=provider.description;
    const label=document.createElement('span');label.textContent='Watch here';
    card.append(logo,name,description,label);card.onclick=()=>{selected=id;load()};choice.querySelector('.movies-provider-grid').append(card);
  }
  frame.onload=()=>{if(!selected||!sessionOpen)return;clearTimeout(timer);note.textContent=providers[selected].name+' · Playback depends on their site. Pop-up windows are blocked.'};
  frame.onerror=()=>{if(!selected)return;clearTimeout(timer);note.textContent='The external website could not load. Try Reload or Change provider.'};
  function close(){panel.hidden=true;sessionOpen=false;showChoice();document.querySelector('.rail-link[href="/"]')?.click()}
  function open(){if(sessionOpen)return;sessionOpen=true;panel.hidden=false;showChoice();choice.querySelector('button').focus()}
  home.onclick=close;retry.onclick=load;change.onclick=()=>{showChoice();choice.querySelector('button').focus()};
  document.querySelector('#movies-open').onclick=open;document.querySelector('#movies-home-open').onclick=open;
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});
  bar.append(home,title,change,retry);panel.append(bar,note,choice,frame);document.body.append(panel);
})();
