export function serverNotificationMode(serverId,modes={},fallback='pings') {
 const valid=value=>['pings','all','off'].includes(value);
 const selected=Object.hasOwn(modes,serverId)?modes[serverId]:null;
 return valid(selected)?selected:valid(fallback)?fallback:'pings';
}
