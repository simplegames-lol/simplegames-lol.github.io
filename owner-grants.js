import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
const db=getFirestore(getApp()),auth=getAuth(getApp());
function precondition(message){const error=new Error(message);error.code='owner-grant-precondition';throw error}
export async function grantOwnerCoins(ownerUid,recipientUid,amount,reason,operationId){
 if(auth.currentUser?.uid!==ownerUid)precondition('Sign in again before giving coins.');
 if(['localhost','127.0.0.1',''].includes(location.hostname))throw Error('Owner transfers are disabled in local preview.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>10000||typeof reason!=='string'||reason.trim().length<3||reason.length>120||typeof operationId!=='string'||!/^[A-Za-z0-9_-]{10,100}$/.test(operationId))throw Error('Enter a valid coin amount and reason.');
 return runTransaction(db,async tx=>{
  if(auth.currentUser?.uid!==ownerUid)precondition('Your sign-in changed. No new transfer was submitted.');
  const access=await tx.get(doc(db,'supportSettings','access'));if(access.data()?.ownerUid!==ownerUid)precondition('Only the configured Firebase site owner can give coins.');
  const receiptRef=doc(db,'shopCoinGifts',operationId),receipt=await tx.get(receiptRef);
  if(receipt.exists()){const saved=receipt.data();if(saved.ownerUid!==ownerUid||saved.recipientUid!==recipientUid||saved.amount!==amount||saved.reason!==reason.trim())throw Error('This transfer ID belongs to a different operation.');return {replayed:true}}
  const walletRef=doc(db,'shopWallets',recipientUid),snapshot=await tx.get(walletRef);if(!snapshot.exists())precondition('Ask this player to open Shop once before giving them coins.');const wallet=snapshot.data();
  if(!Number.isSafeInteger(wallet.coins)||wallet.coins<0||!Number.isSafeInteger(wallet.giftedCoins??0)||(wallet.giftedCoins??0)<0)precondition('This wallet needs checking before coins can be added. No balance was changed.');
  tx.update(walletRef,{coins:wallet.coins+amount,giftedCoins:(wallet.giftedCoins||0)+amount,lastGiftId:operationId,updatedAt:serverTimestamp()});
  tx.set(receiptRef,{ownerUid,recipientUid,amount,reason:reason.trim(),createdAt:serverTimestamp()});return {replayed:false};
 });
}
