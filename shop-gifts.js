import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,getDoc,onSnapshot,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {findUser} from './user-lookup.js?v=1';
const auth=getAuth(getApp()),db=getFirestore(getApp());
const section=document.createElement('section');section.hidden=true;section.className='daily-bonus';section.style.display='none';
section.innerHTML='<h2>Owner: Give coins</h2><form><label>Player @username<input name="username" required minlength="3" maxlength="20" autocomplete="off"></label><label>Coins (1–10,000)<input name="amount" type="number" min="1" max="10000" step="1" required></label><label>Reason<input name="reason" required minlength="3" maxlength="120"></label><button type="submit">Give coins</button></form><p role="status"></p>';
section.querySelector('form').style.cssText='display:flex;flex-wrap:wrap;gap:12px;align-items:end';
section.querySelectorAll('label').forEach(label=>{label.style.cssText='display:grid;gap:6px'});
section.querySelectorAll('input').forEach(input=>{input.style.cssText='background:#080a0d;color:inherit;border:1px solid #343943;border-radius:8px;padding:10px'});
const shop=document.querySelector('.real-shop');shop?.querySelector('.real-shop-layout')?.before(section);
let owner=false,generation=0,stop=()=>{},busy=false;
const message=section.querySelector('p'),form=section.querySelector('form');
onAuthStateChanged(auth,user=>{const version=++generation;stop();owner=false;section.hidden=true;section.style.display='none';form.reset();message.textContent='';if(!user)return;stop=onSnapshot(doc(db,'supportSettings','access'),snap=>{if(version!==generation)return;owner=snap.data()?.ownerUid===user.uid;section.hidden=!owner;section.style.display=owner?'block':'none'},()=>{owner=false;section.hidden=true;section.style.display='none'})});
form.onsubmit=async event=>{
 event.preventDefault();if(!owner||!auth.currentUser||busy)return;
 if(['localhost','127.0.0.1'].includes(location.hostname)){message.textContent='Coin gifts are disabled in local preview.';return}
 const amount=Number(form.elements.amount.value),reason=form.elements.reason.value.trim(),uid=auth.currentUser.uid,version=generation;
 if(!Number.isSafeInteger(amount)||amount<1||amount>10000||reason.length<3||reason.length>120){message.textContent='Enter 1–10,000 whole coins and a reason (3–120 characters).';return}
 busy=true;form.querySelector('button').disabled=true;
 try{
  const recipient=await findUser(db,form.elements.username.value);if(!recipient)throw Error('Username not found.');
  if(version!==generation||!owner)return;
  if(!confirm(`Give ${amount.toLocaleString()} coins to @${recipient.username}?\nReason: ${reason}`))return;
  const gift=doc(collection(db,'shopCoinGifts')),wallet=doc(db,'shopWallets',recipient.uid);
  await runTransaction(db,async tx=>{
   if(auth.currentUser?.uid!==uid)throw Error('Sign in again.');
   const access=await tx.get(doc(db,'supportSettings','access')),current=await tx.get(wallet);
   if(access.data()?.ownerUid!==uid)throw Error('Only the site owner can give coins.');
   if(!current.exists())throw Error('Ask this player to open Shop once before giving them coins.');
   const data=current.data();
   tx.update(wallet,{coins:data.coins+amount,giftedCoins:(data.giftedCoins||0)+amount,lastGiftId:gift.id,updatedAt:serverTimestamp()});
   tx.set(gift,{ownerUid:uid,recipientUid:recipient.uid,amount,reason,createdAt:serverTimestamp()});
  });
  if(version===generation){message.textContent=`Gave ${amount.toLocaleString()} coins to @${recipient.username}. Gift recorded.`;form.reset()}
 }catch(error){if(version===generation)message.textContent=error.code==='permission-denied'?'Gift blocked. Publish the updated owner-gift Firebase rules.':error.code==='resource-exhausted'?'Firebase quota exceeded. Try again after quota recovery.':error.message||'Gift could not save.'}
 finally{busy=false;form.querySelector('button').disabled=false}
};
