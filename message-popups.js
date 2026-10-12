(() => {
 const setting=document.querySelector('#message-popups'),mode=document.querySelector('#server-notifications');
 const friendSetting=document.querySelector('#friend-online-notifications');let doNotDisturb=false;
 document.addEventListener('simplegames:profile',event=>doNotDisturb=!!event.detail.profile?.doNotDisturb);
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
 setting.checked=read('sg-message-popups',true)!==false;
 friendSetting.checked=read('sg-friend-online-notifications',true)!==false;
 mode.value=['pings','all','off'].includes(read('sg-server-notifications','pings'))?read('sg-server-notifications','pings'):'pings';
 const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
 setting.onchange=()=>save('sg-message-popups',setting.checked);mode.onchange=()=>save('sg-server-notifications',mode.value);
 friendSetting.onchange=()=>{save('sg-friend-online-notifications',friendSetting.checked);if(!friendSetting.checked)stack.querySelectorAll('[data-kind="friend-online"]').forEach(card=>card.remove())};
 const stack=document.createElement('div');stack.className='message-popup-stack';stack.setAttribute('aria-live','polite');document.body.append(stack);
 const feedback=document.querySelector('#notification-preview-status');
 document.addEventListener('fullscreenchange',()=>{(document.fullscreenElement||document.body).append(stack)});
 document.addEventListener('simplegames:settings-reset',()=>{setting.checked=true;friendSetting.checked=true;mode.value='pings';stack.replaceChildren()});
 document.querySelector('#friend-online-preview').onclick=()=>{
  if(!friendSetting.checked){feedback.textContent='Enable friend online notifications first.';return}
  if(doNotDisturb){feedback.textContent='Turn off Do Not Disturb to preview this popup.';return}
  feedback.textContent='Preview only. No friend’s status was changed.';
  document.dispatchEvent(new CustomEvent('simplegames:notification',{detail:{kind:'friend-online',name:'Friend',text:'is now online',sound:false}}));
 };
 document.addEventListener('simplegames:notification-error',event=>feedback.textContent=event.detail.message);
 document.querySelector('#notification-preview').onclick=()=>{
  if(!setting.checked){feedback.textContent='Enable message pop-ups first.';return}
  feedback.textContent='This is a preview. Real messages use your selected sound; Do Not Disturb mutes them.';
  document.dispatchEvent(new CustomEvent('simplegames:notification',{detail:{name:'Notification preview',text:'Incoming messages will appear here.',sound:true}}));
 };
 document.addEventListener('simplegames:notification',event=>{
  const data=event.detail;if(!data||!(data.kind==='friend-online'?friendSetting.checked:setting.checked)||data.muted||doNotDisturb)return;
  while(stack.children.length>=3)stack.firstElementChild.remove();
  const card=document.createElement('section');card.className='message-popup';
  if(data.kind==='friend-online')card.dataset.kind='friend-online';
  const name=document.createElement('strong');name.textContent=data.name||'New message';
  const text=document.createElement('p');text.textContent=data.text||'New message';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.className='popup-close';close.setAttribute('aria-label','Dismiss notification');close.onclick=()=>card.remove();
  card.append(name,text,close);
  if(data.reply){
   const form=document.createElement('form'),field=document.createElement('input'),send=document.createElement('button'),error=document.createElement('p');
   field.placeholder='Reply…';field.maxLength=500;field.required=true;field.setAttribute('aria-label','Quick reply');
   send.textContent='Send';send.type='submit';send.className='secondary-button';error.setAttribute('aria-live','polite');form.append(field,send);
   form.onsubmit=async e=>{e.preventDefault();if(!field.value.trim())return;send.disabled=true;try{await data.reply(field.value.trim());card.remove()}catch(problem){error.textContent=problem.message||'Reply failed.';send.disabled=false}};
   card.append(form,error);
  }
  const hint=document.createElement('small');hint.textContent=data.kind==='friend-online'?'Turn off friend online notifications in Settings.':'Turn off message pop-ups in Settings.';card.append(hint);stack.append(card);
  const expire=()=>{if(card.contains(document.activeElement))setTimeout(expire,20000);else card.remove()};setTimeout(expire,data.kind==='friend-online'?7000:20000);
 });
 document.addEventListener('simplegames:auth',()=>{doNotDisturb=false;stack.replaceChildren()});
 const friends=document.querySelector('[data-dashboard-action="account"]'),servers=document.querySelector('[data-dashboard-action="servers"]'),serverRail=document.querySelector('#servers-open');
 for(const button of [friends,servers,serverRail]){const badge=document.createElement('span');badge.className=button===serverRail?'notification-badge':'home-unread-badge';badge.hidden=true;button.append(badge)}
 const update=(badge,count)=>{count=Math.max(0,Math.floor(Number(count)||0));badge.textContent=count;badge.hidden=!count;badge.setAttribute('aria-label',count+' unread messages')};
 const account=document.querySelector('#account-unread');
 const syncFriends=()=>update(friends.querySelector('.home-unread-badge'),account.hidden?0:account.textContent);
 new MutationObserver(syncFriends).observe(account,{attributes:true,childList:true,characterData:true,subtree:true});syncFriends();
 document.addEventListener('simplegames:server-unread',event=>{update(servers.querySelector('.home-unread-badge'),event.detail.count);update(serverRail.querySelector('.notification-badge'),event.detail.count)});
})();
