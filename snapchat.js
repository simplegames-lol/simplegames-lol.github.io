(() => {
 const openButton=document.createElement('button');openButton.type='button';openButton.id='snapchat-open';openButton.className='rail-link';openButton.innerHTML='<span class="rail-icon" aria-hidden="true">👻</span><span>Snapchat</span>';
 document.querySelector('#music-open')?.after(openButton);
 const panel=document.createElement('section');panel.className='snapchat-panel';panel.hidden=true;panel.setAttribute('aria-labelledby','snapchat-title');
 panel.innerHTML='<header><button type="button" data-snap-home>← Home</button><strong id="snapchat-title">Snapchat</strong><button type="button" data-snap-reload>Reload</button></header><iframe title="Snapchat through Velara" allow="fullscreen" allowfullscreen></iframe>';
 document.body.append(panel);const frame=panel.querySelector('iframe');let opener;
 const launch='https://velara.cc/browse?to=https%3A%2F%2Fweb.snapchat.com%2F';
 function load(){frame.src=launch}
 function close(){panel.hidden=true;frame.src='about:blank';opener?.focus()}
 openButton.onclick=()=>{opener=document.activeElement;panel.hidden=false;load();panel.querySelector('button').focus()};
 panel.querySelector('[data-snap-home]').onclick=close;panel.querySelector('[data-snap-reload]').onclick=load;
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close()});
})();
