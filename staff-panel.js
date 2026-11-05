import './firebase-client.js?v=1';
import {getApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {staffCapabilities} from './staff-panel-model.js?v=panel1';
import {mountStaffTool} from './staff-tool-mount.js?v=1';
const auth=getAuth(getApp()),rail=document.createElement('button'),account=document.createElement('button');rail.type=account.type='button';rail.className='header-button staff-panel-open';rail.innerHTML='<span class="rail-icon">🛡️</span><span>Staff panel</span>';account.className='secondary-button';account.textContent='Staff panel';rail.hidden=account.hidden=true;document.querySelector('#settings-open')?.before(rail);document.querySelector('.profile-actions')?.append(account);
const panel=document.createElement('section');panel.className='staff-panel';panel.hidden=true;panel.setAttribute('aria-labelledby','staff-panel-title');panel.innerHTML='<div class="staff-panel-inner"><header><button type="button" data-staff-home>← Home</button><h1 id="staff-panel-title" tabindex="-1">Staff panel</h1><button type="button" data-staff-close aria-label="Close staff panel">×</button></header><p class="staff-panel-description">Use your staff tools here. Full staff access includes every moderation tool. The owner manages access.</p><div class="staff-panel-grid"></div><section class="staff-workspace" hidden><header><button type="button" data-staff-back>← Tools</button><h2 tabindex="-1"></h2></header><div class="staff-tool-host"></div></section><p class="staff-panel-status" role="status"></p></div>';document.body.append(panel);let opener=null,workVersion=0,disposeTool=null,activeTool=null,preparing=false;
const grid=panel.querySelector('.staff-panel-grid'),workspace=panel.querySelector('.staff-workspace'),host=panel.querySelector('.staff-tool-host'),feedback=panel.querySelector('.staff-panel-status');
function permitted(key,a=available()){return key==='support'||key==='closed'?a.support:key==='polls'?a.polls:key==='pollteam'?a.pollOwner:key==='team'?a.owner:a.full}
function clearTool(){workVersion++;disposeTool?.();disposeTool=null;activeTool=null;host.replaceChildren();workspace.hidden=true;grid.hidden=false;feedback.textContent=''}

function closeOtherMenus(){for(const [root,button]of [['#social-panel','#social-close'],['#settings-panel','#settings-close'],['#support-panel','#support-close'],['#server-panel','#servers-close'],['.real-shop','#shop-home'],['#info-overlay','#info-close']]){const element=document.querySelector(root);if(element&&!element.hidden)element.querySelector(button)?.click()}for(const selector of ['.music-panel','.movies-panel']){const element=document.querySelector(selector);if(element&&!element.hidden)element.querySelector('header button')?.click()}}
function close(){clearTool();panel.hidden=true;(opener?.isConnected&&!opener.hidden&&!opener.closest('[hidden]')?opener:document.querySelector('#settings-open'))?.focus()}
function available(){return staffCapabilities(auth.currentUser?.uid,window.simpleGamesStaffAccess)}
function render(){const access=available(),allowed=access.owner||access.support||access.polls;rail.hidden=account.hidden=!allowed;if(!allowed&&!panel.hidden)close();if(activeTool&&!permitted(activeTool,access))clearTool();grid.replaceChildren();if(!allowed)return;if(!activeTool)feedback.textContent=preparing?'Finishing the previous tool load…':'';
 const cards=[];
 if(access.support){cards.push(['Support inbox','Reply to open support tickets.',()=>openTool('support','Support inbox')],['Closed tickets','Review and reopen closed support tickets.',()=>openTool('closed','Closed tickets')])}
 if(access.polls)cards.push(['Manage polls','Create, hide, close, or reopen polls and set voting timers.',()=>openTool('polls','Manage polls')]);
 if(access.full){cards.push(['Announcement banner','Publish or remove the banner on the home menu.',()=>openTool('announcement','Owner announcement')],['Give coins','Give coins directly to a username.',()=>openTool('coins','Give coins')],['Moderate ratings','Choose a game, review ratings, and remove inappropriate comments.',()=>openTool('ratings','Moderate ratings')])}
 if(access.owner)cards.push(['Manage staff access','Grant or remove full Staff panel access by username.',()=>openTool('team','Manage staff access')]);
 for(const [title,description,action]of cards){const button=document.createElement('button'),name=document.createElement('strong'),text=document.createElement('span');button.type='button';button.className='staff-tool-card';name.textContent=title;text.textContent=description;button.append(name,text);button.onclick=action;button.disabled=preparing;grid.append(button)}
}
async function prepareTool(key){
 if(key==='support'||key==='closed'||key==='team'){const tool=await import('./support.js?v=panel2');return tool.prepareSupportForStaff(key==='support'?'staff':key)}
 if(key==='announcement'){const tool=await import('./owner-announcement.js?v=servers1');return tool.prepareAnnouncementForStaff()}
 if(key==='coins'){await import('./shop.js?v=panel1');const tool=await import('./shop-gifts.js?v=panel1');return tool.prepareOwnerCoinsForStaff()}
 if(key==='ratings'){const tool=await import('./community.js?v=servers1');return tool.prepareRatingsForStaff()}
 const element=document.querySelector(key==='pollteam'?'#poll-staff-manager':'#poll-tools');if(!element||element.hidden)throw Error('Poll tools are not available for this account.');const open=element.open;element.open=true;return {element,close:()=>{element.open=open}};
}
async function openTool(key,title){
 if(preparing||!permitted(key))return;clearTool();const version=workVersion,uid=auth.currentUser?.uid;activeTool=key;preparing=true;grid.hidden=true;workspace.hidden=false;workspace.querySelector('h2').textContent=title;feedback.textContent='Loading tool…';
 try{const resource=await prepareTool(key);if(version!==workVersion||panel.hidden||auth.currentUser?.uid!==uid||!permitted(key)){resource.close?.();return}disposeTool=mountStaffTool(host,resource,()=>{clearTool();render()});feedback.textContent='';workspace.querySelector('h2').focus()}
 catch(error){if(version===workVersion)feedback.textContent=error.message||'Could not load this tool. Please try again.'}
 finally{preparing=false;render()}
}
panel.querySelector('[data-staff-back]').onclick=()=>{clearTool();render();panel.querySelector('h1').focus()};
function open(event){render();if(rail.hidden)return;opener=event.currentTarget;closeOtherMenus();panel.hidden=false;panel.querySelector('h1').focus()}
rail.onclick=account.onclick=open;panel.querySelector('[data-staff-home]').onclick=()=>{close();document.querySelector('.brand')?.click()};panel.querySelector('[data-staff-close]').onclick=close;document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close()}});
onAuthStateChanged(auth,()=>{if(!panel.hidden)close();render()});document.addEventListener('simplegames:staff-access',render);
// Keep site appearance separate from account identity and security settings.
const accountLink=document.createElement('button');accountLink.type='button';accountLink.className='secondary-button settings-account-link';accountLink.textContent='Account & security settings';accountLink.onclick=()=>{closeOtherMenus();document.dispatchEvent(new CustomEvent('simplegames:navigate-account',{detail:{view:'settings'}}))};document.querySelector('#settings-panel .settings-heading')?.after(accountLink);
const appearanceLink=document.createElement('button');appearanceLink.type='button';appearanceLink.className='secondary-button account-appearance-link';appearanceLink.textContent='Website appearance & settings';appearanceLink.onclick=()=>{closeOtherMenus();document.querySelector('#settings-open')?.click()};document.querySelector('#account-settings-view')?.append(appearanceLink);render();
