// Local-only replacement for the original YouTube host bridge.
// Saves stay in this browser; scores, advertising and account coins are not connected.
const saveKey='sg-8-ball-classic-local-save';
window.ytgame={SDK_VERSION:'SimpleGames-local-1',IN_PLAYABLES_ENV:false,
 game:{firstFrameReady(){},gameReady(){},async loadData(){try{return localStorage.getItem(saveKey)||''}catch{return''}},async saveData(value){try{localStorage.setItem(saveKey,value)}catch{}}},
 system:{isAudioEnabled:()=>true,onAudioEnabledChange:()=>()=>{},onPause:callback=>{window.addEventListener('blur',callback);return()=>window.removeEventListener('blur',callback)},onResume:callback=>{window.addEventListener('focus',callback);return()=>window.removeEventListener('focus',callback)}},
 engagement:{sendScore:async()=>{}},ads:{AdResult:{UNKNOWN:0,SHOWED:1,REJECTED:3,DISMISSED:2},requestAd:async()=>3}};
