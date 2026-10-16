import {watchCosmetics} from './economy-client.js?v=1';
import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,onSnapshot} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {validColor} from './shop-model.js?v=1';
let auth,db;const watchers=new Map(),bindings=new Map(),cache=new Map();
function paint(uid){
  const data=cache.get(uid)||{},rows=bindings.get(uid)||[];
  // Rows may be bound just before their parent is attached to the page.
  // Keep them until the next bind prunes older, detached render results.
  for(const row of rows){
    if(row.avatar){if(validColor(data.outlineColor)){row.avatar.style.outline='2px solid '+data.outlineColor;row.avatar.style.outlineOffset='2px'}else{row.avatar.style.outline=row.outline;row.avatar.style.outlineOffset=row.offset}}
    if(row.name)row.name.style.color=validColor(data.nameColor)?data.nameColor:row.color;
  }
}
function watch(uid){
  if(watchers.has(uid)||!auth?.currentUser)return;
  watchers.set(uid,watchCosmetics(uid,snapshot=>{cache.set(uid,snapshot.data()||{});paint(uid)},()=>{}));
}
export function bindCosmetics(uid,avatar,name){
  if(!uid)return;
  if(!auth){auth=getAuth(getApp());db=getFirestore(getApp());onAuthStateChanged(auth,user=>{watchers.forEach(stop=>stop());watchers.clear();cache.clear();for(const key of bindings.keys()){paint(key);if(user)watch(key)}})}
  const rows=(bindings.get(uid)||[]).filter(row=>row.avatar?.isConnected||row.name?.isConnected);
  if(!rows.some(row=>row.avatar===avatar&&row.name===name))rows.push({avatar,name,color:name?.style.color||'',outline:avatar?.style.outline||'',offset:avatar?.style.outlineOffset||''});
  bindings.set(uid,rows);watch(uid);paint(uid);
}
