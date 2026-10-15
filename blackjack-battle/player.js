window.addEventListener('DOMContentLoaded',async()=>{
 const status=document.querySelector('#player-status');
 try{
  const player=window.RufflePlayer.newest().createPlayer();
  player.config={allowScriptAccess:false,allowNetworking:'none',openUrlMode:'deny',showSwfDownload:false,contextMenu:'off',autoplay:'on',unmuteOverlay:'visible',backgroundColor:'#000000',letterbox:'on'};
  document.querySelector('#blackjack-player').append(player);
  await player.ruffle().load({url:'blackjack.swf',allowScriptAccess:false,allowNetworking:'none',openUrlMode:'deny'});status.hidden=true;
 }catch{status.textContent='Blackjack Battle could not load. Reload the game to try again.'}
});
