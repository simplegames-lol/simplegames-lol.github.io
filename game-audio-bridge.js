// Loaded before the engine in supported local players; affects this game only.
(() => {
  if(window.simpleGamesAudio)return;
  const clamp=value=>Number.isFinite(Number(value))?Math.max(0,Math.min(1,Number(value))):1;
  let volume=1;try{volume=clamp(JSON.parse(localStorage.getItem('sg-game-volume')??'1'))}catch{}
  const contexts=new WeakMap(),buses=new Set(),media=new Set(),levels=new WeakMap();
  const proto=window.AudioNode?.prototype,connect=proto?.connect,disconnect=proto?.disconnect;
  if(connect&&disconnect){
    proto.connect=function(destination,...rest){
      const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
      if(Offline&&this.context instanceof Offline)return connect.call(this,destination,...rest);
      if(this.context&&destination===this.context.destination){
        let bus=contexts.get(this.context);
        if(!bus){bus=this.context.createGain();bus.gain.value=volume;connect.call(bus,destination);contexts.set(this.context,bus);buses.add(bus)}
        connect.call(this,bus,...rest);return destination;
      }
      return connect.call(this,destination,...rest);
    };
    proto.disconnect=function(...args){if(args[0]===this.context?.destination&&contexts.has(this.context))args[0]=contexts.get(this.context);return disconnect.apply(this,args)};
  }
  function applyMedia(element){const level=levels.get(element);if(!level)return;level.expected=clamp(level.base*volume);try{element.volume=level.expected}catch{}}
  function register(element){if(media.has(element))return;media.add(element);levels.set(element,{base:element.volume,expected:element.volume});element.addEventListener('volumechange',()=>{const level=levels.get(element);if(Math.abs(element.volume-level.expected)<.0001)return;level.base=element.volume;applyMedia(element)});applyMedia(element)}
  function scan(root){root.querySelectorAll?.('audio,video').forEach(register);if(root.matches?.('audio,video'))register(root)}
  const mediaProto=window.HTMLMediaElement?.prototype,play=mediaProto?.play;
  if(play)mediaProto.play=function(...args){register(this);return play.apply(this,args)};
  scan(document);
  new MutationObserver(changes=>{for(const change of changes)for(const node of change.addedNodes)scan(node)}).observe(document,{childList:true,subtree:true});
  window.simpleGamesAudio={
    set(value){volume=clamp(value);for(const bus of buses){if(bus.context.state==='closed'){buses.delete(bus);continue}try{bus.gain.setTargetAtTime(volume,bus.context.currentTime,.015)}catch{bus.gain.value=volume}}for(const element of media)applyMedia(element)},
    state(){return {supported:buses.size>0||media.size>0,volume}}
  };
})();
