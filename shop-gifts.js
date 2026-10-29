import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,getDocFromServer} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {findUser} from './user-lookup.js?v=1';
import {grantOwnerCoins} from './owner-grants.js?v=1';
const auth=getAuth(getApp()),db=getFirestore(getApp());
const section=document.createElement('section');section.hidden=true;section.className='daily-bonus owner-coins';section.style.display='none';
section.innerHTML='<h2>Give coins</h2><p>Owner only · Give coins to yourself or a player.</p><form><label>Player @username<input name="username" required minlength="3" maxlength="20" autocomplete="off"></label><label>Coins (1–10,000)<input name="amount" type="number" min="1" max="10000" step="1" required></label><label>Reason<input name="reason" required minlength="3" maxlength="120"></label><button type="submit">Give coins</button></form><p role="status"></p>';
section.querySelector('form').style.cssText='display:flex;flex-wrap:wrap;gap:12px;align-items:end';
section.querySelectorAll('label').forEach(label=>{label.style.cssText='display:grid;gap:6px'});
section.querySelectorAll('input').forEach(input=>{input.style.cssText='background:var(--background);color:inherit;border:1px solid var(--border);border-radius:8px;padding:10px'});
const shop=document.querySelector('.real-shop');shop?.querySelector('.real-shop-layout')?.before(section);
let owner=false,generation=0,stop=()=>{},busy=false;
const message=section.querySelector('p'),form=section.querySelector('form');
const selfLabel=document.createElement('label');selfLabel.style.cssText='display:flex;align-items:center;gap:8px;margin:12px 0;font-size:12px';const self=document.createElement('input');self.type='checkbox';self.id='owner-give-self';selfLabel.append(self,document.createTextNode('Give to my account'));form.before(selfLabel);
function syncRecipient(){form.elements.username.disabled=self.checked;form.elements.username.required=!self.checked;form.elements.username.placeholder=self.checked?'Your signed-in account':'Exact @username'}
self.onchange=syncRecipient;syncRecipient();
const receiptKey='sg-owner-pending-grant';
function remember(value){try{if(value)sessionStorage.setItem(receiptKey,JSON.stringify(value));else sessionStorage.removeItem(receiptKey)}catch{}}
let pending=null;try{pending=JSON.parse(sessionStorage.getItem(receiptKey)||'null')}catch{}
async function readWithDeadline(promise){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Firebase did not finish the account lookup. No new transfer was submitted. Check your connection and retry.')),12000)})])}finally{clearTimeout(timer)}}
async function checkOwner(){const user=auth.currentUser,version=++generation;owner=false;section.hidden=true;section.style.display='none';if(!user||shop?.hidden)return;try{const snap=await getDocFromServer(doc(db,'supportSettings','access'));if(version!==generation||shop.hidden)return;owner=snap.data()?.ownerUid===user.uid;section.hidden=!owner;section.style.display=owner?'block':'none';if(owner&&pending?.ownerUid===user.uid){const values=JSON.parse(pending.fingerprint);self.checked=values[1]===user.uid;syncRecipient();form.elements.username.value=self.checked?'':pending.username||'';form.elements.amount.value=values[2];form.elements.reason.value=values[3];message.textContent='A previous transfer needs confirmation. Retry the same details to avoid sending twice.'}}catch{owner=false}}
onAuthStateChanged(auth,()=>{generation++;owner=false;section.hidden=true;section.style.display='none';if(!shop?.hidden)void checkOwner()});
if(shop)new MutationObserver(()=>{if(!shop.hidden)void checkOwner();else{generation++;owner=false;section.hidden=true;section.style.display='none'}}).observe(shop,{attributes:true,attributeFilter:['hidden']});
form.onsubmit=async event=>{
 event.preventDefault();if(!owner||!auth.currentUser||busy)return;
 if(['localhost','127.0.0.1'].includes(location.hostname)){message.textContent='Coin gifts are disabled in local preview.';return}
 const amount=Number(form.elements.amount.value),reason=form.elements.reason.value.trim(),uid=auth.currentUser.uid,version=generation;
 if(!Number.isSafeInteger(amount)||amount<1||amount>10000||reason.length<3||reason.length>120){message.textContent='Enter 1–10,000 whole coins and a reason (3–120 characters).';return}
 busy=true;form.querySelector('button').disabled=true;message.textContent='Checking owner access…';let stage='checking owner access',writing=false;const waiting=setTimeout(()=>{if(version===generation)message.textContent=`Still ${stage}. Please wait; do not submit this transfer again.`},8000);
 try{
  const access=await readWithDeadline(getDocFromServer(doc(db,'supportSettings','access')));if(access.data()?.ownerUid!==uid)throw Error('This account is not the configured site owner.');
  stage='finding the recipient';message.textContent='Finding player…';const recipient=self.checked?{uid,username:'your account'}:await readWithDeadline(findUser(db,form.elements.username.value));if(!recipient)throw Error('Username not found. Use their exact @username, not their display name.');
  if(version!==generation||!owner)return;
  const recipientLabel=recipient.uid===uid?'your account':'@'+recipient.username;
  if(!confirm(`Give ${amount.toLocaleString()} coins to ${recipientLabel}?\nReason: ${reason}`))return;
  const fingerprint=JSON.stringify([uid,recipient.uid,amount,reason]);if(pending&&pending.ownerUid!==uid)pending=null;
  if(pending&&pending.fingerprint!==fingerprint)throw Error('A previous transfer may still need confirmation. Retry the same player, amount and reason first so it cannot be sent twice.');
  if(!pending){pending={username:recipient.username,ownerUid:uid,fingerprint,id:crypto.randomUUID()};remember(pending)}
  stage='saving the transfer';message.textContent='Saving coins… Waiting for Firebase confirmation.';writing=true;const result=await grantOwnerCoins(uid,recipient.uid,amount,reason,pending.id);remember(null);pending=null;
  if(version===generation){message.textContent=result.replayed?`Confirmed: ${amount.toLocaleString()} coins were already given to ${recipientLabel}. Not sent twice.`:`Gave ${amount.toLocaleString()} coins to ${recipientLabel}. Saved successfully.`;form.reset();self.checked=false;syncRecipient()}
 }catch(error){if(version===generation)message.textContent=error.code==='permission-denied'?'Firebase blocked this transfer. Publish the owner wallet-update and shopCoinGifts rule blocks from the upload instructions, then retry. No coins were confirmed.':error.code==='resource-exhausted'?'Firebase daily usage limit reached. No transfer was confirmed. Wait for quota recovery, then retry the same details.':error.code==='unavailable'?'Firebase is offline. Check the recipient balance before retrying; use the same details to prevent a duplicate.':error.message||'Transfer could not be confirmed.';if(writing&&['permission-denied','failed-precondition','owner-grant-precondition'].includes(error.code)){remember(null);pending=null}}
 finally{clearTimeout(waiting);busy=false;form.querySelector('button').disabled=false}
};
