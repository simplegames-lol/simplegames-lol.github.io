import {app} from './firebase-client.js?v=1';
import {getAuth} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
const auth=getAuth(app),API='https://simple-games-backend.maylarpp.workers.dev';
export const localShopPreview=['localhost','127.0.0.1',''].includes(location.hostname),giftPreview=localShopPreview;
function account(uid){if(localShopPreview)throw Error('Real account changes are disabled in local preview.');const user=auth.currentUser;if(!user||user.uid!==uid)throw Error('Sign in again.');return user}
export async function economyRequest(path,body,uid=auth.currentUser?.uid){const user=account(uid),headers={Authorization:'Bearer '+await user.getIdToken()},options={headers,signal:AbortSignal.timeout(20000)};if(body!==undefined){options.method='POST';headers['Content-Type']='application/json';options.body=JSON.stringify(body)}const r=await fetch(API+path,options);let data;try{data=await r.json()}catch{throw Error('Cloudflare shop is not ready yet.')}if(!r.ok){const error=Error(data.error||'Shop could not connect.');error.retryable=data.retryable;throw error}return data}
function stampWallet(w){for(const key of ['createdAt','lastEarnAt','updatedAt','lastDailyAt'])if(typeof w[key]==='number'){const value=w[key];w[key]={toMillis:()=>value}}return w}
const pending=new Map();
async function write(path,body,uid){
 const key=JSON.stringify([uid,path,body]);let op=pending.get(key);
 if(!op){try{op=sessionStorage.getItem('sg-economy-pending:'+key)}catch{}}
 if(!op){op=crypto.randomUUID();pending.set(key,op);try{sessionStorage.setItem('sg-economy-pending:'+key,op)}catch{}}
 try{const result=await economyRequest(path,{...body,op},uid);pending.delete(key);try{sessionStorage.removeItem('sg-economy-pending:'+key)}catch{}window.dispatchEvent(new CustomEvent('simplegames:economy-changed'));return result}catch(e){if(e.retryable===false){pending.delete(key);try{sessionStorage.removeItem('sg-economy-pending:'+key)}catch{}}throw e}
}
export const initializeWallet=uid=>economyRequest('/economy/init',{},uid);
export const shopAction=(uid,action,id,color,enabled=true)=>write('/economy/action',{action,...(id?{id}:{}),...(color===undefined?{}:{color}),enabled},uid);
export const findCloudUser=(_db,value)=>economyRequest('/economy/find?username='+encodeURIComponent(value)).then(x=>x.user);
export const sendGiftBox=(uid,recipientUid,kind,value,message,username)=>write('/economy/send',{username,recipientUid,kind,value,message},uid).then(x=>x.id);
export const openGiftBox=(uid,id)=>write('/economy/open',{id},uid);
export const grantCoins=(uid,username,amount,reason,recipientUid)=>write('/economy/grant',{username,recipientUid,amount,reason},uid);
// Shared visibility-aware subscriptions replace wallet/profile/gift snapshots.
export function subscribe(path,onData,onError,uid=auth.currentUser?.uid){let closed=false,inflight=false;const tick=async()=>{if(closed||inflight||document.hidden)return;inflight=true;try{const result=await economyRequest(path,undefined,uid);if(!closed)onData(result)}catch(e){if(!closed)onError?.(e)}finally{inflight=false}};const timer=setInterval(tick,30000);window.addEventListener('simplegames:economy-changed',tick);document.addEventListener('visibilitychange',tick);tick();return()=>{closed=true;clearInterval(timer);window.removeEventListener('simplegames:economy-changed',tick);document.removeEventListener('visibilitychange',tick)}}
export function watchWallet(uid,options,onData,onError){return subscribe('/economy/wallet',w=>onData({exists:()=>true,data:()=>stampWallet(w),metadata:{fromCache:false}}),async e=>{if(e.message==='Open Shop to initialize this account first.'){try{await initializeWallet(uid);const w=await economyRequest('/economy/wallet',undefined,uid);onData({exists:()=>true,data:()=>stampWallet(w),metadata:{fromCache:false}})}catch(error){onError(error)}}else onError(e)},uid)}
export function watchGifts(uid,onData,onError){return subscribe('/economy/inbox',data=>onData({docs:data.gifts.map(g=>({id:g.id,data:()=>({...g,createdAt:{toMillis:()=>g.createdAt}})}))}),onError,uid)}
export const watchCosmetics=(uid,onData)=>subscribe('/economy/profile?uid='+encodeURIComponent(uid),data=>onData({data:()=>data}),()=>{});
