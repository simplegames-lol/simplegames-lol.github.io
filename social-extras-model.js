export const REACTION_EMOJIS=['👍','❤️','😂','🔥','😮','😢'];
export function presenceState(data,now=Date.now()){
 const last=data?.lastActive?.toMillis?.()??((data?.lastActive?.seconds||0)*1000);
 if(!data||data.hideOnline)return {kind:'private',label:'Activity private'};
 const recent=Number.isFinite(last)&&last>0&&now-last<75000&&last<=now+30000;
 if(!recent||!['online','away'].includes(data.status))return {kind:'offline',label:'Offline'};
 if(data.status==='away')return {kind:'away',label:'Away'};
 if(data.doNotDisturb)return {kind:'dnd',label:'Do Not Disturb'};
 if(!data.privateActivity&&data.currentGame?.title)return {kind:data.currentGame.kind==='media'?'watching':'playing',label:data.currentGame.kind==='media'?data.currentGame.title:'Playing '+data.currentGame.title};
 return {kind:'online',label:'Online'};
}
export function togglePin(existing,id){const pins=Array.isArray(existing)?existing.filter(x=>typeof x==='string'):[];if(pins.includes(id))return pins.filter(x=>x!==id);if(pins.length>=20)throw Error('You can pin up to 20 conversations.');return [id,...pins]}
export function reactionValue(current,emoji){if(!REACTION_EMOJIS.includes(emoji))throw Error('Invalid reaction.');return current===emoji?null:emoji}
