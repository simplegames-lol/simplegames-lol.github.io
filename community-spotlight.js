import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,collection,query,orderBy,limit,getDocs,doc,getDoc} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {completedSpotlightWeek,spotlightPeriodLabel} from './spotlight-period.js?v=2';
import {bindCosmetics} from './shop-cosmetics.js?v=4';
const host=document.createElement('section');host.id='community-spotlight';host.className='community-spotlight';host.setAttribute('aria-label','Community spotlight');document.querySelector('#site-polls')?.after(host);
const auth=getAuth(getApp()),db=getFirestore(getApp());
let visible=false,loaded='',generation=0,pending=false,retryAt=0,timer;const cache=new Map();
function message(text){host.replaceChildren();const h=document.createElement('h2');h.textContent='Community spotlight';const p=document.createElement('p');p.textContent=text;host.append(h,p)}
async function load(){
 if(!host||!visible||document.hidden||!auth.currentUser||pending||Date.now()<retryAt)return;
 const previous=completedSpotlightWeek();
 // Let the existing two-minute playtime flush window finish before choosing a winner.
 if(!previous){message('Last week is wrapping up. The winner appears shortly.');return}
 if(loaded===previous.key)return;pending=true;const version=generation;
 try{
  let winner=cache.get(previous.key);
  if(winner===undefined){const snap=await getDocs(query(collection(db,'weeklyPlaytime',previous.key,'players'),orderBy('playSeconds','desc'),limit(1)));const entry=snap.docs[0];winner=entry&&entry.data().playSeconds>0?{uid:entry.id,seconds:entry.data().playSeconds}:null;if(winner){const person=await getDoc(doc(db,'users',winner.uid));winner.person=person.exists()?person.data():null}cache.set(previous.key,winner)}
  if(version!==generation||!auth.currentUser)return;loaded=previous.key;
  if(!winner){message('No winner recorded last week. Take the top spot this week.');return}
  const h=document.createElement('h2');h.textContent='Community spotlight';const tag=document.createElement('small');tag.textContent='Last week’s #1 · '+spotlightPeriodLabel(previous);
  const row=document.createElement('div');row.className='spotlight-player';const avatar=document.createElement('span');avatar.className='spotlight-avatar';avatar.textContent=(winner.person?.displayName||winner.person?.username||'P').slice(0,1).toUpperCase();
  const image=winner.person?.avatarImage;if(typeof image==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(image)&&image.length<=180000){const img=document.createElement('img');img.src=image;img.alt='';avatar.replaceChildren(img)}
  const copy=document.createElement('div'),name=document.createElement('strong'),score=document.createElement('p');name.textContent=winner.person?.displayName||winner.person?.username||'Player';score.textContent=Math.floor(winner.seconds/3600)+'h '+Math.floor(winner.seconds%3600/60)+'m played';copy.append(name);if(winner.person?.username){const username=document.createElement('small');username.textContent='@'+winner.person.username;copy.append(username)}copy.append(score);row.append(avatar,copy);
  const open=document.createElement('button');open.type='button';open.textContent='View profile';open.onclick=()=>document.dispatchEvent(new CustomEvent('simplegames:open-profile',{detail:{uid:winner.uid}}));host.replaceChildren(h,tag,row,open);bindCosmetics(winner.uid,avatar,name);
 }catch{if(version===generation){message('Spotlight could not load. Check back in a moment.');retryAt=Date.now()+60000}}finally{pending=false}
}
if(host){
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);void load()}).observe(host);
 onAuthStateChanged(auth,user=>{generation++;loaded='';if(!user){message('Sign in to see last week’s leaderboard winner.')}else{message('Loading last week’s winner…');void load()}});
 function schedule(){clearInterval(timer);if(!document.hidden){void load();timer=setInterval(()=>void load(),60000)}}document.addEventListener('visibilitychange',schedule);schedule();
}
