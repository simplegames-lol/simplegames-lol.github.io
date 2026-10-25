import './firebase-client.js?v=1';
import{leaderboardWeek,splitLeaderboardWeeks}from'./leaderboard-week.js?v=1';
import{getApp}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import{collection,deleteDoc,doc,getDoc,getDocs,getFirestore,increment,onSnapshot,serverTimestamp,setDoc,updateDoc,runTransaction,Timestamp}from"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import{createPlaytimeTracker}from'./playtime.js?v=3';
import{createPlaytimeGate}from'./playtime-gate.js?v=1';
import{eligiblePlaytime}from'./playtime-activity.js?v=2';

const auth=getAuth(getApp()),db=getFirestore(getApp()),$=s=>document.querySelector(s);
let currentUser=null,currentProfile=null,syncTimer=0,ratings=[];
const preferenceKeys=["sg-theme","sg-card-size","sg-timezone","sg-accent","sg-background","sg-background-image","sg-background-style","sg-show-menu-time","sg-show-game-time","sg-click-sound","sg-message-popups","sg-friend-online-notifications","sg-server-notifications","sg-sidebar-closed"];
const ratingPanel=document.createElement("section");
ratingPanel.className="settings-panel game-ratings-panel";ratingPanel.hidden=true;ratingPanel.innerHTML='<div class="settings-card"><div class="settings-heading"><h2 id="rating-title">Rate game</h2><button id="rating-close" type="button" aria-label="Close ratings">×</button></div><div class="rating-picker" id="rating-picker"></div><p class="social-status" id="rating-status"></p></div>';
document.body.append(ratingPanel);
$("#rating-close").onclick=()=>ratingPanel.hidden=true;
ratingPanel.onclick=e=>{if(e.target===ratingPanel)ratingPanel.hidden=true};

const gameCards=[...document.querySelectorAll(".game-card")];
let voterRequest=0;
async function openVoters(path,title){
  await refreshRatings();
  const request=++voterRequest;$("#rating-title").textContent=title+' ratings';$("#rating-picker").replaceChildren();const list=document.createElement('div');list.className='rating-voters';$("#rating-picker").append(list);ratingPanel.hidden=false;
  if(!currentUser){$("#rating-status").textContent='Log in to see who rated this game.';return}
  $("#rating-status").textContent='Loading voters…';const uid=currentUser.uid;
  let canModerate=false;try{const access=await getDoc(doc(db,'supportSettings','access'));canModerate=access.data()?.ownerUid===uid}catch{}
  const votes=ratings.filter(vote=>vote.gamePath===path);
await Promise.all(votes.map(async vote=>{let person;try{const snap=await getDoc(doc(db,'users',vote.userId));person=snap.exists()?snap.data():null}catch{}if(request!==voterRequest||currentUser?.uid!==uid)return;const row=document.createElement('div');row.className='rating-voter';const name=document.createElement('strong'),stars=document.createElement('span');name.className='rating-author';stars.className='rating-stars';name.textContent=person?.displayName||person?.username||'Unavailable profile';stars.textContent='★'.repeat(vote.rating)+'☆'.repeat(5-vote.rating);stars.setAttribute('aria-label',vote.rating+' out of 5 stars');row.append(name,stars);if(typeof vote.comment==='string'&&vote.comment.trim()){const comment=document.createElement('p');comment.textContent=vote.comment;comment.className='rating-comment';row.append(comment)}if(canModerate||vote.userId===uid){const remove=document.createElement('button');remove.type='button';remove.className='secondary-button';remove.textContent='Remove rating';remove.onclick=async()=>{if(!confirm('Remove this rating and its comment?'))return;remove.disabled=true;try{await deleteDoc(doc(db,'ratings',vote.id));await refreshRatings(true);await openVoters(path,title)}catch(error){remove.disabled=false;$('#rating-status').textContent=error.code==='permission-denied'?'Removal blocked. Publish the updated ratings rule first.':error.message}};row.append(remove)}list.append(row)}));
  if(request===voterRequest)$("#rating-status").textContent=votes.length?votes.length+' ratings':'No ratings yet.';
}
function pathKey(path){return path.replace(/^\/+|\/+$/g,"").replace(/[^a-z0-9-]/gi,"-")}
function ratingStats(path){const votes=ratings.filter(r=>r.gamePath===path);return{count:votes.length,average:votes.length?votes.reduce((n,r)=>n+r.rating,0)/votes.length:0}}
function sendCommunityData(){const ratingMap={},playMap={};gameCards.forEach(card=>{const path=card.dataset.path||new URL(card.querySelector("a[href]").href,location.href).pathname;ratingMap[path]=ratingStats(path).average;playMap[path]=currentProfile?.stats?.games?.[pathKey(path)]||0});window.dispatchEvent(new CustomEvent("simplegames:community-data",{detail:{ratings:ratingMap,plays:playMap}}))}
function renderRatings(){gameCards.forEach(card=>{const path=card.dataset.path||new URL(card.querySelector("a[href]").href,location.href).pathname,title=card.querySelector("h2").textContent.trim(),stats=ratingStats(path);let row=card.querySelector(".rating-row");if(!row){row=document.createElement("div");row.className="rating-row";row.innerHTML='<button class="rating-button" type="button"></button><button class="rating-count" type="button"></button>';card.querySelector(".game-card__body").append(row);row.querySelector(".rating-button").onclick=()=>openRating(path,title);row.querySelector(".rating-count").onclick=()=>openVoters(path,title)}row.querySelector("button").textContent=stats.count?`★ ${stats.average.toFixed(1)}`:"☆ Rate";row.querySelector(".rating-count").textContent=`${stats.count} rating${stats.count===1?"":"s"}`});sendCommunityData()}
function openRating(path,title){void refreshRatings();$("#rating-title").textContent=`Rate ${title}`;$("#rating-status").textContent=currentUser?"Choose stars and optionally leave a public comment.":"Log in to rate games.";const picker=$("#rating-picker");picker.replaceChildren();const form=document.createElement('form'),select=document.createElement('select'),comment=document.createElement('textarea'),save=document.createElement('button');select.setAttribute('aria-label','Stars');for(let value=1;value<=5;value++)select.add(new Option('★'.repeat(value)+' ('+value+'/5)',String(value)));const previous=ratings.find(r=>r.gamePath===path&&r.userId===currentUser?.uid);select.value=String(previous?.rating||5);comment.maxLength=500;comment.rows=3;comment.placeholder='What did you think of this game?';comment.setAttribute('aria-label','Public game comment');comment.value=previous?.comment||'';save.className='rating-save';save.type='submit';save.textContent='Save rating';save.disabled=!currentUser;form.className='rating-form';const starsLabel=document.createElement('label'),commentLabel=document.createElement('label'),hint=document.createElement('small');starsLabel.textContent='Your rating';starsLabel.htmlFor='game-rating-stars';select.id='game-rating-stars';commentLabel.textContent='Public comment (optional)';commentLabel.htmlFor='game-rating-comment';comment.id='game-rating-comment';hint.className='rating-comment-hint';hint.textContent='Visible to other players · Up to 500 characters';form.append(starsLabel,select,commentLabel,comment,hint,save);form.onsubmit=async event=>{event.preventDefault();if(!currentUser)return;const uid=currentUser.uid;save.disabled=true;try{await setDoc(doc(db,"ratings",`${pathKey(path)}_${uid}`),{gamePath:path,userId:uid,rating:Number(select.value),comment:comment.value.trim(),updatedAt:serverTimestamp()});$("#rating-status").textContent='Rating and comment saved.';await refreshRatings(true)}catch(error){$("#rating-status").textContent=error.code==='resource-exhausted'?'Firebase quota exceeded. Your comment could not save yet.':error.message}finally{save.disabled=!currentUser}};picker.append(form);ratingPanel.hidden=false}
let ratingRead=null,lastRatingRead=0;
async function refreshRatings(force=false){if(ratingRead)return ratingRead;if(!force&&Date.now()-lastRatingRead<300000)return;ratingRead=getDocs(collection(db,"ratings")).then(snap=>{ratings=snap.docs.map(x=>({id:x.id,...x.data()}));lastRatingRead=Date.now();renderRatings()}).catch(()=>renderRatings()).finally(()=>{ratingRead=null});return ratingRead}
const ratingsGrid=document.querySelector('.game-grid');
if(ratingsGrid)new MutationObserver(()=>{if(!ratingsGrid.hidden&&!document.hidden)void refreshRatings()}).observe(ratingsGrid,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!ratingsGrid?.hidden)void refreshRatings()});

const achievements=[
  {icon:"🎮",name:"First Game",test:s=>(s.gamesOpened||0)>=1},
  {icon:"🧭",name:"Explorer",test:s=>(s.gamesOpened||0)>=5},
  {icon:"🏆",name:"Game Fan",test:s=>(s.gamesOpened||0)>=20},
  {icon:"⏱️",name:"One Hour Club",test:s=>(s.playSeconds||0)>=3600}
];
function renderAchievements(profile={}){const stats=profile.stats||{},total=$("#playtime-total");if(total)total.textContent=`${Math.floor((stats.playSeconds||0)/60)} lifetime minutes`}
const syncStatus=document.createElement('p');syncStatus.className='result-count';syncStatus.setAttribute('aria-live','polite');document.querySelector('#leaderboard-view')?.append(syncStatus);
syncStatus.hidden=true;
const trackingStatus=document.createElement('p');trackingStatus.className='result-count';trackingStatus.id='playtime-tracking-status';trackingStatus.setAttribute('role','status');trackingStatus.textContent='Playtime tracker starting…';syncStatus.before(trackingStatus);
trackingStatus.hidden=true;
const tracker=createPlaytimeTracker({
  buckets:splitLeaderboardWeeks,
  send:async(uid,delta)=>{
    const changes={};
    if(delta.seconds)changes['stats.playSeconds']=increment(delta.seconds);
    if(delta.opened)changes['stats.gamesOpened']=increment(delta.opened);
    for(const [path,count]of Object.entries(delta.games))changes[`stats.games.${path}`]=increment(count);
    const weeks=Object.entries(delta.weeks||{}).filter(([,data])=>Date.now()>=data.start&&Date.now()<data.end+120000);
    if(!weeks.length&&delta.opened){const week=leaderboardWeek();weeks.push([week.key,{...week,seconds:0}])}
    await runTransaction(db,async tx=>{
      const entries=[];
      for(const [key,data]of weeks){const ref=doc(db,'weeklyPlaytime',key,'players',uid);entries.push({ref,data,snapshot:await tx.get(ref)})}
      tx.update(doc(db,'users',uid),changes);
      for(const {ref,data,snapshot}of entries){
        if(!data.seconds&&snapshot.exists())continue;
        tx.set(ref,{playSeconds:(snapshot.data()?.playSeconds||0)+data.seconds,periodStart:Timestamp.fromMillis(data.start),periodEnd:Timestamp.fromMillis(data.end),updatedAt:serverTimestamp()});
      }
    });
    if(delta.seconds)window.dispatchEvent(new CustomEvent('simplegames:playtime-saved',{detail:{uid,seconds:delta.seconds}}));
  },
  status:(state,error)=>{syncStatus.textContent=state==='saved'?'Playtime saved · updates about every 15 seconds.':state==='syncing'?'Syncing playtime…':error?.code==='permission-denied'?'Playtime save blocked. Publish the latest Firestore rules.':'Playtime could not sync. Keep this page open; it will retry when connected.';if(error)console.error('Playtime sync:',error)}
});
let playing=false,pageActive=true;
const gameOverlay=$('#game-overlay'),gamePlayer=$('#game-player');
const playtimeGate=createPlaytimeGate({locks:navigator.locks,onActive:active=>tracker.setActive(active)});
function updatePlaytimeGate(){const open=!!gameOverlay&&!gameOverlay.hidden;const loaded=!!gamePlayer?.getAttribute('src')&&gamePlayer.getAttribute('src')!=='about:blank'&&!!$('#game-loader')?.hidden;const eligible=eligiblePlaytime({playing,pageActive,visible:document.visibilityState==='visible',overlayOpen:open,loaded});playtimeGate.update(currentUser?.uid||null,eligible);const message=!currentUser?'Sign in to count and save playtime.':!playtimeGate.supported?'Playtime paused: browser does not support safe counting.':!playing||!open?'Tracker ready: play a game inside this site to count time.':!loaded?'Playtime paused while the game is loading.':document.visibilityState!=='visible'||!pageActive?'Playtime paused while this tab is hidden.':'Game is eligible for counting. Only one game tab can count at a time.';if(trackingStatus.textContent!==message)trackingStatus.textContent=message}
window.addEventListener('simplegames:play',event=>{playing=true;tracker.start(pathKey(event.detail.path));updatePlaytimeGate();void tracker.flush()});
window.addEventListener('simplegames:stop-playing',()=>{playing=false;updatePlaytimeGate();void tracker.stop()});
setInterval(()=>{updatePlaytimeGate();tracker.tick()},1000);
setInterval(()=>void tracker.flush(),15000);
document.addEventListener('visibilitychange',()=>{updatePlaytimeGate();void tracker.flush()});
window.addEventListener('pagehide',()=>{pageActive=false;updatePlaytimeGate();void tracker.flush()});
window.addEventListener('pageshow',()=>{pageActive=true;updatePlaytimeGate()});
window.addEventListener('online',()=>void tracker.flush());

function localPreferences(){return Object.fromEntries(preferenceKeys.map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null&&v.length<650000))}
const preferenceStatus=document.createElement('p');preferenceStatus.className='result-count';preferenceStatus.setAttribute('aria-live','polite');$("#settings-panel .settings-card")?.append(preferenceStatus);
function savePreferences(){
  preferenceStatus.textContent='Saved on this browser.';if(!currentUser)return;
  const uid=currentUser.uid,snapshot=localPreferences();localStorage.setItem(`sg-local-preferences-${uid}`,JSON.stringify(snapshot));
  preferenceStatus.textContent='Saved locally · syncing account…';clearTimeout(syncTimer);
  syncTimer=setTimeout(async()=>{try{await updateDoc(doc(db,'users',uid),{preferences:snapshot});preferenceStatus.textContent='Settings saved to your account.'}catch(error){preferenceStatus.textContent='Saved on this browser. Account sync failed—check your connection or Firebase rules.';console.error('Settings sync:',error)}},300);
}
$("#settings-panel")?.addEventListener("change",savePreferences);$("#settings-panel")?.addEventListener("input",savePreferences);$("#background-image-file")?.addEventListener("change",()=>setTimeout(savePreferences,2000));$("#theme-toggle")?.addEventListener("click",savePreferences);
document.addEventListener('simplegames:settings-reset',savePreferences);
function loadCloudPreferences(profile){
  if(!currentUser)return;const uid=currentUser.uid,marker=`sg-cloud-loaded-${uid}`;if(sessionStorage.getItem(marker))return;
  let local;try{local=JSON.parse(localStorage.getItem(`sg-local-preferences-${uid}`))}catch{}
  const hasLocal=preferenceKeys.some(key=>localStorage.getItem(key)!==null);
  const source=hasLocal?localPreferences():(local||profile.preferences);sessionStorage.setItem(marker,'1');
  if(!source){savePreferences();return}
  let changed=false;for(const[key,value]of Object.entries(source)){if(preferenceKeys.includes(key)&&typeof value==='string'&&localStorage.getItem(key)!==value){localStorage.setItem(key,value);changed=true}}
  if(local||hasLocal){updateDoc(doc(db,'users',uid),{preferences:localPreferences()}).catch(error=>console.error('Settings sync:',error))}
  if(changed)document.dispatchEvent(new Event('simplegames:preferences-loaded'));
}
document.addEventListener("simplegames:profile",e=>{currentProfile=e.detail.profile;renderAchievements(currentProfile);sendCommunityData();loadCloudPreferences(currentProfile)});
onAuthStateChanged(auth,user=>{playtimeGate.dispose();tracker.setUser(user?.uid||null);currentUser=user;updatePlaytimeGate();if(user){if(playtimeGate.supported)void tracker.flush();else syncStatus.textContent='Playtime paused: this browser does not support safe multi-tab counting. Please update your browser.'}else{currentProfile=null;syncStatus.textContent='Sign in to save playtime to the leaderboard.';renderAchievements({})}});
renderRatings();renderAchievements({});
