import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {doc,getFirestore,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {freshWallet,purchaseChanges,cosmeticChanges,publicCosmetics,earnedChanges} from './shop-model.js?v=1';
const db=getFirestore(getApp()),auth=getAuth(getApp());
export const localShopPreview=['127.0.0.1','localhost',''].includes(location.hostname);
function requireUser(uid){
  if(auth.currentUser?.uid!==uid)throw Error('Sign in again before using the shop.');
  if(localShopPreview)throw Error('Local preview only. Account purchases and coins are disabled here.');
}
export async function initializeWallet(uid){
  requireUser(uid);
  await runTransaction(db,async tx=>{
    requireUser(uid);const ref=doc(db,'shopWallets',uid),snap=await tx.get(ref);
    if(!snap.exists())tx.set(ref,{...freshWallet(),createdAt:serverTimestamp(),lastEarnAt:serverTimestamp(),updatedAt:serverTimestamp()});
  });
}
export async function shopAction(uid,action,id,color,enabled=true){
  requireUser(uid);
  await runTransaction(db,async tx=>{
    requireUser(uid);const ref=doc(db,'shopWallets',uid),snap=await tx.get(ref);
    if(!snap.exists())throw Error('Open the shop to initialize your wallet first.');
    const wallet=snap.data();
    const changes=action==='buy'?purchaseChanges(wallet,id):action==='earn'?{...earnedChanges(wallet),lastEarnAt:serverTimestamp()}:cosmeticChanges(wallet,id,color,enabled);
    tx.update(ref,{...changes,updatedAt:serverTimestamp()});
    if(action==='cosmetic')tx.set(doc(db,'shopProfiles',uid),{...publicCosmetics({...wallet,...changes}),updatedAt:serverTimestamp()});
  });
}
