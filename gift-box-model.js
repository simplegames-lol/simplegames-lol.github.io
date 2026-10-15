import {items,UNLOCK_PRICE} from './shop-model.js?v=3';
export function giftDetails(kind,value,message=''){
 const note=String(message).trim();if(note.length>160)throw Error('Keep the message under 160 characters.');
 if(kind==='coins'){const amount=Number(value);if(!Number.isSafeInteger(amount)||amount<1||amount>10000)throw Error('Choose 1–10,000 whole coins.');return{kind,amount,itemId:'',message:note}}
 if(kind==='item'){const item=items.find(item=>item.id===value);if(!item)throw Error('Choose an existing shop item.');return{kind,amount:UNLOCK_PRICE,itemId:item.id,message:note}}
 throw Error('Choose coins or a shop item.');
}
export function giftDebit(wallet,gift){if(!Number.isSafeInteger(wallet.coins)||wallet.coins<gift.amount)throw Error('You do not have enough coins for this gift.');return{coins:wallet.coins-gift.amount,sentGiftCoins:(wallet.sentGiftCoins||0)+gift.amount}}
export function giftCredit(wallet,gift){
 const valid=giftDetails(gift.kind,gift.kind==='coins'?gift.amount:gift.itemId,gift.message);if(valid.amount!==gift.amount)throw Error('Gift amount is invalid.');
 const owned=[...wallet.owned],duplicate=gift.kind==='item'&&owned.includes(gift.itemId);
 if(gift.kind==='item'&&!duplicate)owned.push(gift.itemId);
 return{changes:{coins:wallet.coins+gift.amount-(owned.length-wallet.owned.length)*500,owned,receivedGiftCoins:(wallet.receivedGiftCoins||0)+gift.amount},duplicate};
}
export function giftDescription(gift){return gift.kind==='coins'?gift.amount.toLocaleString()+' coins':items.find(item=>item.id===gift.itemId)?.name||'Shop item'}
