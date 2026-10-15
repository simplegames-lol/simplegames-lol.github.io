window.addEventListener('DOMContentLoaded',async()=>{
 const status=document.querySelector('#player-status');
 try{const player=window.RufflePlayer.newest().createPlayer();player.config={allowScriptAccess:false,allowNetworking:'none',openUrlMode:'deny',showSwfDownload:false,contextMenu:'off',autoplay:'on',backgroundColor:'#ffffff',letterbox:'on'};document.querySelector('#line-rider-player').append(player);await player.ruffle().load({url:'line-rider.swf',allowScriptAccess:false,allowNetworking:'none',openUrlMode:'deny'});status.hidden=true}catch{status.textContent='Line Rider could not load. Check that Blackjack Battle’s runtime folder is uploaded, then reload.'}
});
