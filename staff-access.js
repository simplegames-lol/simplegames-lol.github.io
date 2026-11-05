import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getFirestore,doc,getDocFromServer} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
export async function panelAccess(uid) {
 if(!uid)return false;
 const db=getFirestore(getApp());
 const access=await getDocFromServer(doc(db,'supportSettings','access'));
 if(access.data()?.ownerUid===uid)return true;
 const role=await getDocFromServer(doc(db,'supportStaff',uid));
 return role.data()?.role==='panel';
}
