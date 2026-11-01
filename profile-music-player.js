import {validProfileMusic,musicTime,CLIP_SECONDS} from './profile-music-model.js?v=1';
let apiPromise=null,active=null;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{let settled=false;const previous=window.onYouTubeIframeAPIReady;
  const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);if(error){apiPromise=null;script.remove();reject(error)}else resolve(window.YT)};
  const timer=setTimeout(()=>finish(Error('The song player could not load. Check your connection or try another song.')),15000);
  window.onYouTubeIframeAPIReady=()=>{try{previous?.()}catch{}finish()};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=()=>finish(Error('The song player is blocked or offline.'));document.head.append(script);
 });return apiPromise;
}
export function stopProfileMusic(message=''){
 const session=active;if(!session)return;active=null;clearInterval(session.timer);try{session.player?.destroy()}catch{}session.host.replaceChildren();session.host.hidden=true;session.play.textContent='Play 30-second clip';session.play.disabled=false;if(message)session.status.textContent=message;
}
export function createProfileMusicCard(value,{onVerified}={}){
 if(!validProfileMusic(value))return null;
 const card=document.createElement('section');card.className='profile-music-card';const heading=document.createElement('small'),title=document.createElement('strong'),range=document.createElement('span'),actions=document.createElement('div'),play=document.createElement('button'),stop=document.createElement('button'),status=document.createElement('p'),host=document.createElement('div');
 heading.textContent='Profile song';title.textContent=value.title;range.textContent=musicTime(value.start)+'–'+musicTime(value.start+CLIP_SECONDS)+' · 30 seconds';play.type=stop.type='button';play.textContent='Play 30-second clip';stop.textContent='Stop';status.setAttribute('role','status');host.className='profile-music-player';host.hidden=true;actions.className='profile-music-actions';actions.append(play,stop);card.append(heading,title,range,actions,status,host);
 play.onclick=async()=>{
  stopProfileMusic();if(!card.isConnected||card.closest('[hidden]'))return;
  const session={card,host,play,status,player:null,timer:0};active=session;play.disabled=true;status.textContent='Loading song…';
  try{const YT=await youtubeAPI();if(active!==session||!card.isConnected||card.closest('[hidden]')){if(active===session)stopProfileMusic();return}
   host.hidden=false;const mount=document.createElement('div');host.append(mount);
   session.player=new YT.Player(mount,{width:'100%',height:200,videoId:value.videoId,playerVars:{start:value.start,end:value.start+CLIP_SECONDS,playsinline:1,controls:1,origin:location.origin},events:{
    onReady:event=>{if(active!==session)return;play.disabled=false;play.textContent='Restart clip';status.textContent='Press Play in the player if playback does not start.';event.target.playVideo()},
    onAutoplayBlocked:()=>{if(active===session)status.textContent='Press Play in the player to hear the clip.'},
    onError:()=>{if(active===session)stopProfileMusic('This song cannot play here. It may be blocked, private, or unavailable for embedding. Try another song.')},
    onStateChange:event=>{if(active!==session)return;clearInterval(session.timer);if(event.data===0){stopProfileMusic('Clip finished.');return}if(event.data!==1)return;
     const duration=event.target.getDuration();if(duration&&value.start+CLIP_SECONDS>duration+.1){stopProfileMusic('Choose an earlier start time so the full 30 seconds fit in the song.');return}
     if(duration>=value.start+CLIP_SECONDS){onVerified?.();status.textContent='Playing your 30-second clip.'}
     session.timer=setInterval(()=>{if(active!==session)return;try{const time=session.player.getCurrentTime();if(time>=value.start+CLIP_SECONDS-.05){stopProfileMusic('Clip finished.');return}if(time<value.start-.5)session.player.seekTo(value.start,true)}catch{stopProfileMusic('Playback stopped. Try again.')}},200);
    }
   }});
  }catch(error){if(active===session)stopProfileMusic(error.message)}
 };
 stop.onclick=()=>{if(active?.card===card)stopProfileMusic('Stopped.')};card.preview=()=>play.click();return card;
}
function checkVisible(){if(active&&(!active.card.isConnected||active.card.closest('[hidden]')||document.hidden))stopProfileMusic()}
new MutationObserver(checkVisible).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('visibilitychange',checkVisible);document.addEventListener('simplegames:auth',()=>stopProfileMusic());window.addEventListener('simplegames:play',()=>stopProfileMusic());window.addEventListener('simplegames:media-start',()=>stopProfileMusic());window.addEventListener('pagehide',()=>stopProfileMusic());
