import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {giftDetails,giftDebit,giftCredit} from './gift-box-model.js?v=1';
import {initializeWallet} from './shop-api.js?v=3';
const db=getFirestore(getApp()),auth=getAuth(getApp());
export const giftPreview=['127.0.0.1','localhost',''].includes(location.hostname);
function check(uid){if(auth.currentUser?.uid!==uid)throw Error('Sign in again.');if(giftPreview)throw Error('Real gifts are disabled in local preview.')}
export async function sendGiftBox(uid,recipientUid,kind,value,message){
 check(uid);if(uid===recipientUid)throw Error('Choose another player, not yourself.');const gift=giftDetails(kind,value,message),ref=doc(collection(db,'shopGiftBoxes'));
 await runTransaction(db,async tx=>{check(uid);const walletRef=doc(db,'shopWallets',uid);const [wallet,profile]=await Promise.all([tx.get(walletRef),tx.get(doc(db,'users',uid))]);if(!wallet.exists())throw Error('Open Shop to load your wallet first.');if(!profile.data()?.username)throw Error('Your username could not load.');
  tx.update(walletRef,{...giftDebit(wallet.data(),gift),lastSentBoxId:ref.id,updatedAt:serverTimestamp()});
  tx.set(ref,{...gift,senderUid:uid,senderUsername:profile.data().username,recipientUid,status:'pending',createdAt:serverTimestamp(),openedAt:null});
 });return ref.id;
}
export async function openGiftBox(uid,id){
 check(uid);await initializeWallet(uid);return runTransaction(db,async tx=>{check(uid);const giftRef=doc(db,'shopGiftBoxes',id),walletRef=doc(db,'shopWallets',uid);const [snapshot,wallet]=await Promise.all([tx.get(giftRef),tx.get(walletRef)]);const gift=snapshot.data();
  if(!gift||gift.recipientUid!==uid||gift.status!=='pending')throw Error('This gift has already been opened or is unavailable.');if(!wallet.exists())throw Error('Open Shop once to load your coins, then try opening this gift again.');
  const result=giftCredit(wallet.data(),gift);tx.update(walletRef,{...result.changes,lastReceivedBoxId:id,updatedAt:serverTimestamp()});tx.update(giftRef,{status:'opened',openedAt:serverTimestamp()});return{...gift,duplicate:result.duplicate};
 });
}
