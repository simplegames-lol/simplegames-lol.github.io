(() => {
  const setting=document.querySelector('#update-popups'),preview=document.querySelector('#update-popup-preview');
  if(!setting)return;
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  let current=null,timer=null,shown=false,dnd=false,pending=null,authReady=false;
  const notice=window.simpleGamesAnnouncement;
  setting.checked=read('sg-update-popups',true)!==false;
  function dismiss(){clearTimeout(timer);current?.remove();current=null}
  function canShow(){return authReady&&!document.hidden&&!dnd&&!(document.querySelector('#startup-loader')?.getClientRects().length)&&![...document.querySelectorAll('#settings-panel,#game-overlay,#info-overlay,#social-panel,#server-panel,#support-panel,.real-shop,.movies-panel,.music-panel')].some(p=>!p.hidden)}
  function show(data,isPreview=false){
    dismiss();const card=document.createElement('section');card.className='site-update-popup';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
    const tag=document.createElement('small');tag.textContent=isPreview?'Preview':'Simple Games';
    const title=document.createElement('strong');title.textContent=data.title;
    const text=document.createElement('p');text.textContent=data.message;
    const close=document.createElement('button');close.type='button';close.className='site-update-close';close.textContent='×';close.setAttribute('aria-label','Dismiss update');close.onclick=dismiss;
    const actions=document.createElement('div'),open=document.createElement('button'),off=document.createElement('button');
    open.type=off.type='button';open.className=off.className='secondary-button';open.textContent='See updates';off.textContent='Turn these off';
    open.onclick=()=>{dismiss();document.querySelector('[data-page="updates"]')?.click()};
    off.onclick=()=>{setting.checked=false;save('sg-update-popups',false);setting.dispatchEvent(new Event('change',{bubbles:true}));dismiss()};
    actions.append(open,off);card.append(tag,title,text,close,actions);document.body.append(card);current=card;
    const expire=()=>{if(current!==card)return;if(card.matches(':hover')||card.contains(document.activeElement)){timer=setTimeout(expire,5000);return}dismiss()};timer=setTimeout(expire,16000);
  }
  function maybeShow(){
    if(shown||!setting.checked||!notice||typeof notice.id!=='string'||!notice.id||typeof notice.title!=='string'||typeof notice.message!=='string'||read('sg-last-site-notice',null)===notice.id||!canShow())return;
    shown=true;save('sg-last-site-notice',notice.id);show(notice);
  }
  function queue(){clearTimeout(pending);pending=setTimeout(maybeShow,300)}
  setting.addEventListener('change',()=>{save('sg-update-popups',setting.checked);if(!setting.checked)dismiss();else queue()});
  preview?.addEventListener('click',()=>show(notice||{title:'New games are available',message:'This is an example update popup.'},true));
  document.addEventListener('click',queue);document.addEventListener('visibilitychange',queue);
  document.addEventListener('simplegames:auth',event=>{authReady=!event.detail.user;queue()});
  document.addEventListener('simplegames:profile',event=>{authReady=true;dnd=!!event.detail.profile?.doNotDisturb;if(dnd)dismiss();else queue()});
  document.addEventListener('simplegames:preferences-loaded',()=>{setting.checked=read('sg-update-popups',true)!==false;if(!setting.checked)dismiss();else queue()});
  document.addEventListener('simplegames:settings-reset',()=>{setting.checked=true;save('sg-update-popups',true);dismiss()});
  window.addEventListener('storage',event=>{if(event.key==='sg-update-popups'){setting.checked=read('sg-update-popups',true)!==false;if(!setting.checked)dismiss()}if(event.key==='sg-last-site-notice'&&current)dismiss()});
  queue();
})();
