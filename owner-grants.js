import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
const db=getFirestore(getApp()),auth=getAuth(getApp());
function precondition(message){const error=new Error(message);error.code='owner-grant-precondition';throw error}
function walletDiagnostic(wallet,amount){
 if(!wallet)return '';
 const issues=[],required=['coins','earnedMinutes','owned','equipped','colors','createdAt','lastEarnAt','updatedAt'],allowed=[...required,'dailyClaims','lastDailyAt','giftedCoins','lastGiftId','sentGiftCoins','receivedGiftCoins','lastSentBoxId','lastReceivedBoxId'];
 if(required.some(key=>!(key in wallet)))issues.push('required wallet fields are missing');
 if(Object.keys(wallet).some(key=>!allowed.includes(key)))issues.push('the wallet has fields the rules do not allow');
 for(const [key,max]of [['earnedMinutes',1000000],['dailyClaims',1000000],['giftedCoins',100000000],['sentGiftCoins',100000000],['receivedGiftCoins',100000000]]){const value=wallet[key]??0;if(!Number.isSafeInteger(value)||value<0||value>max)issues.push(key+' is outside the allowed range')}
 if((wallet.giftedCoins??0)+amount>100000000)issues.push('this grant exceeds the lifetime owner-grant limit');
 if(Array.isArray(wallet.owned)){if(wallet.owned.length>2||new Set(wallet.owned).size!==wallet.owned.length||wallet.owned.some(id=>!['custom-outline','custom-name'].includes(id)))issues.push('saved unlocks do not match the rules');const expected=100+wallet.earnedMinutes*10+(wallet.dailyClaims??0)*100+(wallet.giftedCoins??0)+(wallet.receivedGiftCoins??0)-(wallet.sentGiftCoins??0)-wallet.owned.length*500;if(wallet.coins!==expected)issues.push('the coin balance does not match its saved earning and purchase history')}
 else issues.push('saved unlocks are not a list');
 return issues.length?' Wallet check: '+issues.join('; ')+'.':' Basic wallet totals match; the deployed wallet/receipt rules still need checking.';
}
export async function grantOwnerCoins(ownerUid,recipientUid,amount,reason,operationId){
 if(auth.currentUser?.uid!==ownerUid)precondition('Sign in again before giving coins.');
 if(['localhost','127.0.0.1',''].includes(location.hostname))throw Error('Owner transfers are disabled in local preview.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>10000||typeof reason!=='string'||reason.trim().length<3||reason.length>120||typeof operationId!=='string'||!/^[A-Za-z0-9_-]{10,100}$/.test(operationId))throw Error('Enter a valid coin amount and reason.');
 let stage='owner access read',lastWallet=null;
 try{return await runTransaction(db,async tx=>{
  if(auth.currentUser?.uid!==ownerUid)precondition('Your sign-in changed. No new transfer was submitted.');
  stage='owner access read';const access=await tx.get(doc(db,'supportSettings','access'));if(access.data()?.ownerUid!==ownerUid)precondition('Only the configured Firebase site owner can give coins.');
  stage='transfer receipt read';const receiptRef=doc(db,'shopCoinGifts',operationId),receipt=await tx.get(receiptRef);
  if(receipt.exists()){const saved=receipt.data();if(saved.ownerUid!==ownerUid||saved.recipientUid!==recipientUid||saved.amount!==amount||saved.reason!==reason.trim())throw Error('This transfer ID belongs to a different operation.');return {replayed:true}}
  stage='recipient wallet read';const walletRef=doc(db,'shopWallets',recipientUid),snapshot=await tx.get(walletRef);if(!snapshot.exists())precondition('Ask this player to open Shop once before giving them coins.');const wallet=snapshot.data();lastWallet=wallet;
  if(!Number.isSafeInteger(wallet.coins)||wallet.coins<0||!Number.isSafeInteger(wallet.giftedCoins??0)||(wallet.giftedCoins??0)<0)precondition('This wallet needs checking before coins can be added. No balance was changed.');
  stage='atomic wallet and receipt save';tx.update(walletRef,{coins:wallet.coins+amount,giftedCoins:(wallet.giftedCoins||0)+amount,lastGiftId:operationId,updatedAt:serverTimestamp()});
  tx.set(receiptRef,{ownerUid,recipientUid,amount,reason:reason.trim(),createdAt:serverTimestamp()});return {replayed:false};
 });}catch(error){if(error.code==='permission-denied'){const detail=new Error('Owner coin check: Firebase blocked the '+stage+'.'+(stage==='atomic wallet and receipt save'?walletDiagnostic(lastWallet,amount):'')+' No coins were confirmed.');detail.code=error.code;throw detail}throw error}
}
