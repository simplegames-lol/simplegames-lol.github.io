export function canReadChannel(server, channel, uid) {
  if (!uid || !server?.members?.includes(uid) || server.banned?.includes(uid) || !server.channels?.includes(channel)) return false;
  if (server.ownerUid === uid) return true;
  const config=server.channelSettings?.[channel]||{}, role=server.memberRoles?.[uid]||'member';
  const restricted=config.private ?? !!config.roles?.length;
  return !restricted || (config.roles||[]).includes(role) || (config.members||[]).includes(uid);
}
export function canSendChannel(server,channel,uid) {
  if(!canReadChannel(server,channel,uid))return false;
  if(server.ownerUid===uid)return true;
  const config=server.channelSettings?.[channel]||{},role=server.memberRoles?.[uid]||'member',permissions=server.rolePermissions?.[role]||{};
  if(config.locked && permissions.manageMessages!==true)return false;
  if(permissions.sendMessages===false)return false;
  return !config.restrictSend || (config.sendRoles||[]).includes(role) || (config.sendMembers||[]).includes(uid);
}
export function channelEditor(server,name,card,profiles) {
  const config=server.channelSettings?.[name]||{},controls={},selections={roles:[],members:[],sendRoles:[],sendMembers:[]};
  for(const [key,text,checked]of [['private','Private channel — only selected roles or people can see it',config.private??!!config.roles?.length],['restrictSend','Only selected roles or people can send messages',!!config.restrictSend]]) {
    const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=checked;label.append(input,text);card.append(label);controls[key]=input;
  }
  const help=document.createElement('p');help.textContent='Visibility and sending are separate. Nobody selected on a private channel means owner-only. Sending still requires visibility and is blocked during lockdown (except owner/moderators).';card.append(help);
  for(const [key,title,entries]of [
    ['roles','Roles that can view',(server.roles||[]).filter(r=>r.id!=='owner').map(r=>[r.id,r.name])],
    ['members','People that can view',(server.members||[]).filter(uid=>uid!==server.ownerUid).map(uid=>[uid,profiles.get(uid)?.displayName||profiles.get(uid)?.username||uid])],
    ['sendRoles','Roles that can send',(server.roles||[]).filter(r=>r.id!=='owner').map(r=>[r.id,r.name])],
    ['sendMembers','People that can send',(server.members||[]).filter(uid=>uid!==server.ownerUid).map(uid=>[uid,profiles.get(uid)?.displayName||profiles.get(uid)?.username||uid])]
  ]) { const heading=document.createElement('strong');heading.textContent=title;card.append(heading);for(const [id,labelText]of entries){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=(config[key]||[]).includes(id);label.append(input,labelText);card.append(label);selections[key].push({id,input});} }
  return ()=>Object.fromEntries([...Object.entries(controls).map(([key,input])=>[key,input.checked]),...Object.entries(selections).map(([key,items])=>[key,items.filter(item=>item.input.checked).map(item=>item.id)])]);
}
