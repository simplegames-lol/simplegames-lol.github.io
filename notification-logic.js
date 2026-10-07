// Shared notification filtering used by chats and servers.
export function incomingSummary(before,after,uid){
  if(!after?.lastSenderId||after.lastSenderId===uid)return false;
  const stamp=t=>t?`${t.seconds??t.toMillis?.()??0}:${t.nanoseconds??0}`:'';
  return stamp(after.updatedAt)!==stamp(before?.updatedAt)
    || after.lastSenderId!==before?.lastSenderId
    || (after.unreadCounts?.[uid]||0)>(before?.unreadCounts?.[uid]||0);
}
export function serverNotificationAllowed(mode,text,profile={}){
  if(mode==='off')return false;if(mode==='all')return true;
  const names=[profile.username,'everyone'].filter(Boolean).map(name=>String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return new RegExp(`(^|\\s)@(${names.join('|')})(?=$|\\s|[.,!?:;])`,'i').test(String(text||''));
}
