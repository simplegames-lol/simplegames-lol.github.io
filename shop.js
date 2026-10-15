import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,onSnapshot,getDoc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {items,validColor,dailyAvailable,dailyRemaining} from './shop-model.js?v=3';
import {initializeWallet,shopAction,localShopPreview} from './shop-api.js?v=3';
const auth=getAuth(getApp()),db=getFirestore(getApp());
const panel=document.createElement('section');panel.className='real-shop';panel.hidden=true;panel.setAttribute('aria-label','Shop');
panel.innerHTML='<header><button id="shop-home" type="button">← Home</button><h1>Shop</h1><span class="real-shop-balance"><strong id="real-shop-coins">—</strong> coins</span></header><p class="real-shop-note">Start with 100 coins. Earn 10 per minute of active gameplay. Each unlock costs 500 coins; color changes are free.</p><div class="daily-bonus"><div><h2>Daily bonus</h2><p>100 coins, once every 24 hours.</p><p id="daily-countdown"></p></div><button id="daily-claim" type="button">Claim 100 coins</button></div><p id="real-shop-status" role="status" aria-live="polite"></p><button id="shop-login" type="button" hidden>Sign in</button><div class="real-shop-layout"><div id="real-shop-items"></div><aside><h2>Profile preview</h2><span id="real-shop-avatar" class="profile-avatar"></span><strong id="real-shop-name">Player</strong><p id="real-shop-username"></p></aside></div><dialog id="real-shop-confirm" aria-labelledby="real-shop-confirm-title"><form method="dialog"><h2 id="real-shop-confirm-title"></h2><p>500 coins, paid once. Future color changes are free.</p><div><button value="cancel">Cancel</button><button value="confirm">Unlock</button></div></form></dialog>';
document.body.append(panel);
const $=selector=>panel.querySelector(selector);
const colorDrafts=new Map();
let user=null,wallet=null,person={},loading=false,busy=false,stopWallet=()=>{},stopPerson=()=>{},epoch=0,earnBusy=false,pendingSeconds=0,lastAttempt=0;
function status(message){$('#real-shop-status').textContent=message}
const retry=document.createElement('button');retry.type='button';retry.textContent='Retry loading coins';retry.hidden=true;$('#real-shop-status').after(retry);
let walletAttempt=0,walletTimer=0,initializingUid=null;
retry.onclick=()=>void connect();
function friendly(error){return error.code==='permission-denied'?'Shop setup is incomplete. Publish the included Firebase rules first.':error.code==='unavailable'?'Shop is offline. Try again when connected.':error.message||'Shop could not connect.'}
async function connect(){
  if(!user||localShopPreview||loading)return;
  const me=user.uid,version=epoch,attempt=++walletAttempt;loading=true;stopWallet();clearTimeout(walletTimer);retry.hidden=true;status('Loading your coins…');
  const active=()=>version===epoch&&attempt===walletAttempt;
  const failed=error=>{if(!active())return;clearTimeout(walletTimer);loading=false;retry.hidden=false;status(friendly(error))};
  walletTimer=setTimeout(()=>{if(active()){loading=false;retry.hidden=false;status('Coins are taking longer to load. Check your connection and try Retry. Your saved balance has not been reset.')}},15000);
  stopWallet=onSnapshot(doc(db,'shopWallets',me),{includeMetadataChanges:true},snap=>{
    if(!active())return;
    if(snap.exists()){clearTimeout(walletTimer);wallet=snap.data();loading=false;retry.hidden=true;status('');draw();return}
    // A missing cache entry is not proof that the server wallet is missing.
    if(snap.metadata.fromCache||initializingUid===me)return;
    initializingUid=me;
    void initializeWallet(me).catch(failed).finally(()=>{if(initializingUid===me)initializingUid=null});
  },failed);
}
function open(){panel.hidden=false;draw();if(localShopPreview)status('Local preview: real account coins and purchases are disabled. Use the test shop to try colors.');else if(user)void connect();$('#shop-home').focus()}
function close(){panel.hidden=true;document.querySelector('#shop-open')?.focus()}
$('#shop-home').onclick=close;$('#shop-login').onclick=()=>{close();document.querySelector('#account-open')?.click()};
document.querySelector('#shop-open')?.addEventListener('click',open);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#real-shop-confirm').open)close()});
$('#daily-claim').onclick=()=>void perform('daily');
async function perform(action,id,color,enabled=true){
  if(busy||!user)return;busy=true;draw();const version=epoch,uid=user.uid;
  try{await shopAction(uid,action,id,color,enabled);if(version===epoch)status(action==='daily'?'Daily bonus claimed: +100 coins.':action==='buy'?'Unlocked. Choose a color below.':'Saved. No coins charged.')}
  catch(error){if(version===epoch)status(friendly(error))}
  finally{if(version===epoch){busy=false;draw()}}
}
function draw(){
  updateDailyCountdown();
  $('#real-shop-coins').textContent=wallet?.coins?.toLocaleString()||'—';$('#shop-login').hidden=!!user;
  const host=$('#real-shop-items');
  if(!busy&&host.contains(document.activeElement)&&document.activeElement?.matches('input'))return;
  host.replaceChildren();
  if(!user)status('Sign in to save coins and purchases to your account.');
  for(const item of items){
    const owned=wallet?.owned.includes(item.id),equipped=wallet?.equipped[item.type]===item.id;
    const card=document.createElement('article'),visual=document.createElement('div'),heading=document.createElement('h2'),sample=document.createElement('span');
    card.className='real-shop-item';visual.className='real-shop-item-visual';heading.textContent=item.name;
    sample.textContent=item.type==='frames'?(person.displayName||person.username||'P')[0].toUpperCase():person.displayName||person.username||'Player';
    sample.className=item.type==='frames'?'real-shop-avatar-sample':'real-shop-name-sample';
    const draft=colorDrafts.get(item.id),savedColor=wallet?.colors[item.type]||'#9dbbd9';
    const color=validColor(draft)?draft:savedColor;if(item.type==='frames')sample.style.borderColor=color;else sample.style.color=color;
    visual.append(sample);const note=document.createElement('p');note.textContent='Buy once. Change the color anytime.';
    const row=document.createElement('div');row.className='real-shop-item-action';const price=document.createElement('span');price.textContent=owned?'Unlocked':'500 coins';
    const action=document.createElement('button');action.type='button';action.textContent=owned?(equipped?'Unequip':'Equip'):'Unlock';action.setAttribute('aria-label',action.textContent+' '+item.name);action.disabled=!wallet||busy||localShopPreview;
    action.onclick=()=>{
      if(owned){void perform('cosmetic',item.id,undefined,!equipped);return}
      if(wallet.coins<500)return status('You need '+(500-wallet.coins)+' more coins.');
      const dialog=$('#real-shop-confirm');$('#real-shop-confirm-title').textContent='Unlock '+item.name+'?';dialog.returnValue='';dialog.showModal();
      dialog.addEventListener('close',()=>{if(dialog.returnValue==='confirm')void perform('buy',item.id)},{once:true});
    };row.append(price,action);card.append(visual,heading,note,row);
    if(owned){
      const controls=document.createElement('div');controls.className='real-shop-color-controls';
      const picker=document.createElement('input');picker.type='color';picker.value=color;picker.setAttribute('aria-label',item.name+' picker');
      const hex=document.createElement('input');hex.value=draft??color.toUpperCase();hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label',item.name+' hex code');
      const apply=document.createElement('button');apply.type='button';apply.textContent='Apply';apply.setAttribute('aria-label','Apply '+item.name);apply.disabled=busy||localShopPreview;
      picker.oninput=()=>{hex.value=picker.value.toUpperCase();colorDrafts.set(item.id,hex.value);if(item.type==='frames')sample.style.borderColor=picker.value;else sample.style.color=picker.value};
      hex.oninput=()=>{colorDrafts.set(item.id,hex.value);if(validColor(hex.value)){picker.value=hex.value;if(item.type==='frames')sample.style.borderColor=hex.value;else sample.style.color=hex.value}};
      apply.onclick=()=>{const selected=hex.value.trim();if(!validColor(selected))return status('Enter a color like #9DBBD9.');void perform('cosmetic',item.id,selected,true)};
      controls.append(picker,hex,apply);card.append(controls);
    }host.append(card);
  }
  const avatar=$('#real-shop-avatar');avatar.textContent='';avatar.style.setProperty('--avatar-fallback',JSON.stringify((person.displayName||person.username||'P')[0].toUpperCase()));avatar.classList.toggle('has-image',!!person.avatarImage);
  if(person.avatarImage)avatar.style.setProperty('--avatar-image','url("'+person.avatarImage.replaceAll('"','%22')+'")');else avatar.style.removeProperty('--avatar-image');
  avatar.style.outline=wallet?.equipped.frames?'2px solid '+wallet.colors.frames:'';
  $('#real-shop-name').textContent=person.displayName||person.username||'Player';$('#real-shop-name').style.color=wallet?.equipped.names?wallet.colors.names:'';
  $('#real-shop-username').textContent=person.username?'@'+person.username:'';
}
onAuthStateChanged(auth,next=>{
  colorDrafts.clear();
  epoch++;walletAttempt++;clearTimeout(walletTimer);retry.hidden=true;stopWallet();stopPerson();wallet=null;person={};user=next;loading=false;busy=false;pendingSeconds=0;lastAttempt=0;draw();
  if(user){const version=epoch;stopPerson=onSnapshot(doc(db,'users',user.uid),snap=>{if(version!==epoch)return;person=snap.data()||{};if(!panel.hidden)draw()},()=>{});if(!panel.hidden)void connect()}
});
window.addEventListener('simplegames:playtime-saved',event=>{
  if(localShopPreview||!user||event.detail.uid!==user.uid||!Number.isFinite(event.detail.seconds)||event.detail.seconds<=0)return;
  pendingSeconds+=event.detail.seconds;if(!wallet&&!loading)void connect();void earn();
});
async function earn(){
  if(localShopPreview||!user||!wallet||pendingSeconds<60||earnBusy||Date.now()-lastAttempt<15000)return;
  const uid=user.uid,version=epoch;lastAttempt=Date.now();earnBusy=true;
  try{await shopAction(uid,'earn');if(version===epoch)pendingSeconds-=60}
  catch(error){if(version===epoch&&error.code!=='permission-denied')status(friendly(error))}
  finally{earnBusy=false}
}
function updateDailyCountdown(){
  const claim=$('#daily-claim'),label=$('#daily-countdown');
  const remaining=dailyRemaining(wallet),seconds=Math.ceil(remaining/1000);
  claim.disabled=!wallet||busy||localShopPreview||remaining>0;
  claim.textContent=remaining>0?'Claimed':'Claim 100 coins';
  if(!user)label.textContent='Sign in to claim your daily bonus.';
  else if(localShopPreview)label.textContent='Account rewards are disabled in this preview.';
  else if(!wallet)label.textContent='Loading daily bonus…';
  else if(!remaining)label.textContent='Your 100 coins are ready to claim.';
  else label.textContent=`Next 100 coins in ${Math.floor(seconds/3600)}h ${String(Math.floor(seconds%3600/60)).padStart(2,'0')}m ${String(seconds%60).padStart(2,'0')}s`;
}
setInterval(()=>void earn(),15000);
window.addEventListener('online',()=>{if(user&&!panel.hidden&&!localShopPreview)void connect()});
setInterval(()=>{if(!panel.hidden)updateDailyCountdown()},1000);
draw();
void import('./shop-gifts.js?v=1').catch(error=>console.error('Owner coin tools could not load:',error));
