export const START_COINS=100,COINS_PER_MINUTE=10,UNLOCK_PRICE=500;
export const items=[
  {id:'custom-outline',type:'frames',name:'Custom PFP outline',price:UNLOCK_PRICE},
  {id:'custom-name',type:'names',name:'Custom name color',price:UNLOCK_PRICE},
  {id:'halloween-pumpkin',type:'frames',name:'Pumpkin frame',price:UNLOCK_PRICE,color:'#ff922b',seasonal:true},
  {id:'halloween-phantom',type:'frames',name:'Phantom frame',price:UNLOCK_PRICE,color:'#c4b5fd',seasonal:true},
  {id:'halloween-ember',type:'names',name:'Ember name',price:UNLOCK_PRICE,color:'#ff922b',seasonal:true},
  {id:'halloween-slime',type:'names',name:'Slime name',price:UNLOCK_PRICE,color:'#b5ef63',seasonal:true}
];
export const HALLOWEEN_END=Date.UTC(2026,10,2,5);
export const availableItem=(item,now=Date.now())=>!item.seasonal||now<HALLOWEEN_END;
export const validColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export const freshWallet=()=>({coins:START_COINS,earnedMinutes:0,owned:[],equipped:{frames:null,names:null},colors:{frames:'#9dbbd9',names:'#9dbbd9'}});
export function walletView(data){if(!data||!Number.isInteger(data.coins))throw Error('Your wallet could not be read.');return data}
export function purchaseChanges(wallet,id){
  const item=items.find(item=>item.id===id);if(!item)throw Error('Item not found.');
  if(wallet.owned.includes(id))throw Error('Already unlocked.');
  if(!availableItem(item))throw Error('The Halloween collection has ended.');
  if(wallet.coins<UNLOCK_PRICE)throw Error('You need '+(UNLOCK_PRICE-wallet.coins)+' more coins.');
  return {coins:wallet.coins-UNLOCK_PRICE,owned:[...wallet.owned,id]};
}
export function cosmeticChanges(wallet,id,color,enabled=true){
  const item=items.find(item=>item.id===id);if(!item||!wallet.owned.includes(id))throw Error('Unlock this item first.');
  if(color!==undefined&&!validColor(color))throw Error('Enter a color like #9DBBD9.');
  return {equipped:{...wallet.equipped,[item.type]:enabled?id:null},colors:{...wallet.colors,...(item.color?{[item.type]:item.color}:color===undefined?{}:{[item.type]:color.toLowerCase()})}};
}
export function publicCosmetics(wallet){return {nameColor:wallet.equipped.names?wallet.colors.names:'',outlineColor:wallet.equipped.frames?wallet.colors.frames:'',frameId:wallet.equipped.frames||'',nameId:wallet.equipped.names||''}}
export function earnedChanges(wallet){return {coins:wallet.coins+COINS_PER_MINUTE,earnedMinutes:wallet.earnedMinutes+1}}
export const DAILY_COINS=100,DAILY_WAIT_MS=24*60*60*1000;
export function dailyRemaining(wallet,now=Date.now()){
  const last=wallet?.lastDailyAt?.toMillis?.();
  return last===undefined?0:Math.max(0,last+DAILY_WAIT_MS-now);
}
export function dailyAvailable(wallet,now=Date.now()){
  const last=wallet?.lastDailyAt?.toMillis?.();
  return !!wallet&&(last===undefined||now>=last+DAILY_WAIT_MS);
}
export function dailyChanges(wallet,now=Date.now()){
  if(!dailyAvailable(wallet,now))throw Error('Your next daily bonus is available 24 hours after your last claim.');
  return {coins:wallet.coins+DAILY_COINS,dailyClaims:(wallet.dailyClaims||0)+1};
}
