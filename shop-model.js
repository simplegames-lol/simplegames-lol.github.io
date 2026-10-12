export const START_COINS=100,COINS_PER_MINUTE=10,UNLOCK_PRICE=500;
export const items=[
  {id:'custom-outline',type:'frames',name:'Custom PFP outline',price:UNLOCK_PRICE},
  {id:'custom-name',type:'names',name:'Custom name color',price:UNLOCK_PRICE}
];
export const validColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export const freshWallet=()=>({coins:START_COINS,earnedMinutes:0,owned:[],equipped:{frames:null,names:null},colors:{frames:'#9dbbd9',names:'#9dbbd9'}});
export function walletView(data){if(!data||!Number.isInteger(data.coins))throw Error('Your wallet could not be read.');return data}
export function purchaseChanges(wallet,id){
  const item=items.find(item=>item.id===id);if(!item)throw Error('Item not found.');
  if(wallet.owned.includes(id))throw Error('Already unlocked.');
  if(wallet.coins<UNLOCK_PRICE)throw Error('You need '+(UNLOCK_PRICE-wallet.coins)+' more coins.');
  return {coins:wallet.coins-UNLOCK_PRICE,owned:[...wallet.owned,id]};
}
export function cosmeticChanges(wallet,id,color,enabled=true){
  const item=items.find(item=>item.id===id);if(!item||!wallet.owned.includes(id))throw Error('Unlock this item first.');
  if(color!==undefined&&!validColor(color))throw Error('Enter a color like #9DBBD9.');
  return {equipped:{...wallet.equipped,[item.type]:enabled?id:null},colors:{...wallet.colors,...(color===undefined?{}:{[item.type]:color.toLowerCase()})}};
}
export function publicCosmetics(wallet){return {nameColor:wallet.equipped.names?wallet.colors.names:'',outlineColor:wallet.equipped.frames?wallet.colors.frames:''}}
export function earnedChanges(wallet){return {coins:wallet.coins+COINS_PER_MINUTE,earnedMinutes:wallet.earnedMinutes+1}}
