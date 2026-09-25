import{getApp}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import{collection,doc,getFirestore,increment,onSnapshot,serverTimestamp,setDoc,updateDoc}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth=getAuth(getApp()),db=getFirestore(getApp()),$=s=>document.querySelector(s);
let currentUser=null,currentProfile=null,playSession=null,playTimer=0,syncTimer=0,ratings=[];
const preferenceKeys=["sg-theme","sg-card-size","sg-timezone","sg-accent","sg-background","sg-background-image","sg-background-style","sg-show-menu-time","sg-show-game-time"];
const ratingPanel=document.createElement("section");
ratingPanel.className="settings-panel";ratingPanel.hidden=true;ratingPanel.innerHTML='<div class="settings-card"><div class="settings-heading"><h2 id="rating-title">Rate game</h2><button id="rating-close" type="button" aria-label="Close ratings">×</button></div><div class="rating-picker" id="rating-picker"></div><p class="social-status" id="rating-status"></p></div>';
document.body.append(ratingPanel);
$("#rating-close").onclick=()=>ratingPanel.hidden=true;
ratingPanel.onclick=e=>{if(e.target===ratingPanel)ratingPanel.hidden=true};

const gameCards=[...document.querySelectorAll(".game-card")];
function pathKey(path){return path.replace(/^\/+|\/+$/g,"").replace(/[^a-z0-9-]/gi,"-")}
function ratingStats(path){const votes=ratings.filter(r=>r.gamePath===path);return{count:votes.length,average:votes.length?votes.reduce((n,r)=>n+r.rating,0)/votes.length:0}}
function sendCommunityData(){const ratingMap={},playMap={};gameCards.forEach(card=>{const path=card.dataset.path||new URL(card.querySelector("a[href]").href,location.href).pathname;ratingMap[path]=ratingStats(path).average;playMap[path]=currentProfile?.stats?.games?.[pathKey(path)]||0});window.dispatchEvent(new CustomEvent("simplegames:community-data",{detail:{ratings:ratingMap,plays:playMap}}))}
function renderRatings(){gameCards.forEach(card=>{const path=card.dataset.path||new URL(card.querySelector("a[href]").href,location.href).pathname,title=card.querySelector("h2").textContent.trim(),stats=ratingStats(path);let row=card.querySelector(".rating-row");if(!row){row=document.createElement("div");row.className="rating-row";row.innerHTML='<button class="rating-button" type="button"></button><span class="rating-count"></span>';card.querySelector(".game-card__body").append(row);row.querySelector("button").onclick=()=>openRating(path,title)}row.querySelector("button").textContent=stats.count?`★ ${stats.average.toFixed(1)}`:"☆ Rate";row.querySelector(".rating-count").textContent=`${stats.count} rating${stats.count===1?"":"s"}`});sendCommunityData()}
function openRating(path,title){$("#rating-title").textContent=`Rate ${title}`;$("#rating-status").textContent=currentUser?"Choose 1–5 stars":"Log in to rate games.";const picker=$("#rating-picker");picker.replaceChildren();for(let value=1;value<=5;value++){const b=document.createElement("button");b.type="button";b.textContent="★";b.title=`${value} star${value===1?"":"s"}`;b.disabled=!currentUser;b.onclick=async()=>{try{await setDoc(doc(db,"ratings",`${pathKey(path)}_${currentUser.uid}`),{gamePath:path,userId:currentUser.uid,rating:value,updatedAt:serverTimestamp()});$("#rating-status").textContent=`You rated ${title} ${value}/5.`}catch(e){$("#rating-status").textContent=e.message}};picker.append(b)}ratingPanel.hidden=false}
onSnapshot(collection(db,"ratings"),snap=>{ratings=snap.docs.map(x=>x.data());renderRatings()},()=>renderRatings());

const achievements=[
  {icon:"🎮",name:"First Game",test:s=>(s.gamesOpened||0)>=1},
  {icon:"🧭",name:"Explorer",test:s=>(s.gamesOpened||0)>=5},
  {icon:"🏆",name:"Game Fan",test:s=>(s.gamesOpened||0)>=20},
  {icon:"⏱️",name:"One Hour Club",test:s=>(s.playSeconds||0)>=3600}
];
function renderAchievements(profile={}){const stats=profile.stats||{},total=$("#playtime-total");if(total)total.textContent=`${Math.floor((stats.playSeconds||0)/60)} minutes played`}
async function flushPlaytime(){if(!currentUser||!playSession)return;const seconds=Math.max(1,Math.round((Date.now()-playSession.started)/1000));playSession.started=Date.now();await updateDoc(doc(db,"users",currentUser.uid),{"stats.playSeconds":increment(seconds)}).catch(()=>{})}
window.addEventListener("simplegames:play",async e=>{playSession={...e.detail,started:Date.now()};if(currentUser)await updateDoc(doc(db,"users",currentUser.uid),{"stats.gamesOpened":increment(1),[`stats.games.${pathKey(e.detail.path)}`]:increment(1)}).catch(()=>{});clearInterval(playTimer);playTimer=setInterval(flushPlaytime,60000)});
window.addEventListener("simplegames:stop-playing",async()=>{clearInterval(playTimer);await flushPlaytime();playSession=null});

function localPreferences(){return Object.fromEntries(preferenceKeys.map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null&&v.length<650000))}
function savePreferences(){if(!currentUser)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>updateDoc(doc(db,"users",currentUser.uid),{preferences:localPreferences()}).catch(()=>{}),700)}
$("#settings-panel").addEventListener("change",savePreferences);$("#settings-panel").addEventListener("input",savePreferences);$("#background-image-file").addEventListener("change",()=>setTimeout(savePreferences,2000));$("#theme-toggle").addEventListener("click",savePreferences);
function loadCloudPreferences(profile){if(!currentUser)return;const remote=profile.preferences;if(!remote){updateDoc(doc(db,"users",currentUser.uid),{preferences:localPreferences()}).catch(()=>{});return}const marker=`sg-cloud-loaded-${currentUser.uid}`;if(sessionStorage.getItem(marker))return;let changed=false;for(const[key,value]of Object.entries(remote)){if(preferenceKeys.includes(key)&&value!==null&&localStorage.getItem(key)!==value){localStorage.setItem(key,value);changed=true}}sessionStorage.setItem(marker,"1");if(changed)location.reload()}
document.addEventListener("simplegames:profile",e=>{currentProfile=e.detail.profile;renderAchievements(currentProfile);sendCommunityData();loadCloudPreferences(currentProfile)});
onAuthStateChanged(auth,user=>{currentUser=user;if(!user){currentProfile=null;renderAchievements({})}});
renderRatings();renderAchievements({});
