import {app} from './firebase-client.js?v=1';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
const API='https://simple-games-backend.maylarpp.workers.dev',auth=getAuth(app),$=id=>document.getElementById(id),keys=['a','b','c'];
let user=null,poll=null,choice=null,staff=false,owner=false,busy=false,loading=false,generation=0,readReady=false,teamBusy=false;
const say=text=>$('poll-status').textContent=text;
async function api(path,{body,account=null}={}){
 const headers={},options={headers,signal:AbortSignal.timeout(12000)};
 if(account)headers.Authorization='Bearer '+await account.getIdToken();
 if(body!==undefined){options.method='POST';headers['Content-Type']='application/json';options.body=JSON.stringify(body)}
 const response=await fetch(API+path,options);let data;try{data=await response.json()}catch{throw Error('Cloudflare polls are not deployed yet. Please finish the Worker setup.')}
 if(!response.ok)throw Error(data.error||'Polls are temporarily unavailable.');return data;
}
function render(){
 const list=$('poll-choices');list.replaceChildren();$('site-polls').hidden=!poll&&!staff;$('poll-tools').hidden=!staff;$('poll-staff-manager').hidden=!owner;$('poll-close').disabled=!poll||poll.closed||busy;$('poll-create').querySelector('button').disabled=busy;$('poll-hide').disabled=!poll||busy;$('poll-hide').textContent=poll?.hidden?'Show poll':'Hide poll';$('poll-timer').hidden=!poll;
 $('poll-timer-note').textContent=poll?.endsAt?'Ends '+new Date(poll.endsAt).toLocaleString()+(poll.closed?' · Voting closed':''):poll?'No automatic end time.':'';
 if(!poll){$('poll-question').textContent='No poll is published.';say('Create a poll below when you’re ready.');return}
 $('poll-question').textContent=poll.question;const total=keys.reduce((sum,k)=>sum+poll.counts[k],0);
 if(!poll.hidden)for(const k of keys){const button=document.createElement('button'),fill=document.createElement('span'),label=document.createElement('span'),result=document.createElement('span');button.type='button';button.className='poll-choice';button.disabled=!user||!readReady||!!choice||poll.closed||busy;button.setAttribute('aria-pressed',String(choice===k));fill.className='poll-fill';const percent=total?Math.round(poll.counts[k]/total*100):0;fill.style.width=percent+'%';label.textContent=poll.options[k]+(choice===k?' ✓':'');result.textContent=percent+'% · '+poll.counts[k];button.append(fill,label,result);button.onclick=()=>vote(k);list.append(button)}
 say(poll.hidden?'Hidden from visitors · Only staff can see these controls.':`${total} vote${total===1?'':'s'} · ${poll.closed?'Voting closed':choice?'Thanks for voting!':user?readReady?'Choose one answer. One vote per account.':'Checking your vote…':'Sign in to vote.'}`);
}
async function refresh(){
 if(loading||busy)return;loading=true;const version=generation,account=user,staffMode=staff;
 try{
  const data=await api(staffMode?'/polls/manage':'/polls/current',staffMode?{body:{},account}:{});if(version!==generation)return;
  const changed=data.poll?.id!==poll?.id;poll=data.poll;
  if(changed){choice=null;readReady=false}
  if(account&&poll){const own=await api('/polls/me?poll='+encodeURIComponent(poll.id),{account});if(version!==generation)return;choice=own.choice;readReady=true}
  render();
 }catch(e){if(version===generation)say(e.message||'Could not connect to Cloudflare polls.')}
 finally{loading=false;if(version!==generation||staffMode!==staff)refresh()}
}
async function vote(k){
 if(!user||!poll||!readReady||busy||choice)return;const account=user,id=poll.id,version=generation;busy=true;render();let failure=null;
 try{await api('/polls/vote',{body:{id,choice:k},account});if(version===generation&&poll?.id===id)choice=k}catch(e){failure=e}
 finally{busy=false;if(version===generation){render();if(failure)say(failure.message);else refresh()}}
}
onAuthStateChanged(auth,async next=>{
 user=next;const version=++generation;staff=owner=false;choice=null;readReady=false;$('poll-staff-status').textContent='';$('poll-team-status').textContent='';$('poll-staff-list').replaceChildren();$('poll-account').hidden=!next;$('poll-account-id').value=next?.uid||'';render();refresh();
 if(!next)return;
 try{const result=await api('/polls/staff',{body:{},account:next});if(version!==generation)return;staff=result.staff;owner=result.owner;render();refresh();if(!result.configured)$('poll-staff-status').textContent='Poll owner setup is pending in Cloudflare. Voting is available.'}catch(e){if(version===generation){$('poll-tools').hidden=true;$('poll-staff-status').textContent='Staff controls unavailable: '+e.message}}
});
async function teamList(){
 if(!owner||!user)return;const account=user,version=generation;
 const data=await api('/polls/staff/list',{body:{},account});if(version!==generation)return;
 const list=$('poll-staff-list');list.replaceChildren();
 if(!data.members.length){list.textContent='No additional poll staff yet.';return}
 for(const member of data.members){const row=document.createElement('div'),copy=document.createElement('span'),remove=document.createElement('button');row.className='poll-staff-row';copy.textContent=member.label+' · '+member.uid;remove.type='button';remove.textContent='Remove access';remove.onclick=()=>changeTeam('/polls/staff/remove',{uid:member.uid},`Remove poll access for ${member.label}?`);row.append(copy,remove);list.append(row)}
}
async function changeTeam(path,body,confirmation){
 if(!owner||!user||teamBusy||!confirm(confirmation))return;teamBusy=true;const version=generation,account=user;
 try{await api(path,{body,account});if(version!==generation)return;$('poll-team-status').textContent='Poll staff updated.';await teamList()}catch(e){if(version===generation)$('poll-team-status').textContent=e.message}finally{teamBusy=false}
}
$('poll-staff-grant').onsubmit=event=>{event.preventDefault();const form=event.currentTarget;changeTeam('/polls/staff/grant',{uid:form.elements.uid.value.trim(),label:form.elements.label.value.trim()},'Give poll access to this exact account ID? Check the ID before confirming.')};
$('poll-staff-refresh').onclick=()=>teamList().catch(e=>$('poll-team-status').textContent=e.message);
$('poll-tools').addEventListener('toggle',()=>{if($('poll-tools').open&&owner)teamList().catch(e=>$('poll-team-status').textContent=e.message)});
$('poll-copy-id').onclick=async()=>{if(!user)return;try{await navigator.clipboard.writeText(user.uid);$('poll-staff-status').textContent='Account ID copied.'}catch{$('poll-account-id').select();$('poll-staff-status').textContent='Select and copy your account ID above.'}};
$('poll-create').onsubmit=async event=>{
 event.preventDefault();if(!staff||!user||busy)return;const form=event.currentTarget,question=form.elements.question.value.trim(),options=Object.fromEntries(keys.map(k=>[k,form.elements[k].value.trim()]));
 if(!question||keys.some(k=>!options[k])||new Set(Object.values(options)).size!==3)return say('Enter a question and three different choices.');
 if(!confirm('Publish a new poll? It replaces the displayed poll and starts with zero votes.'))return;
 const account=user,version=generation;busy=true;render();let failure=null;
 try{await api('/polls/create',{body:{question,options,minutes:form.elements.minutes.value?Number(form.elements.minutes.value):null},account})}catch(e){failure=e}
 finally{busy=false;if(version===generation){render();if(failure)say(failure.message);else refresh()}}
};
$('poll-close').onclick=async()=>{
 if(!staff||!user||!poll||busy||!confirm('Close voting on this poll?'))return;
 const id=poll.id,account=user,version=generation;busy=true;render();let failure=null;
 try{await api('/polls/close',{body:{id},account})}catch(e){failure=e}
 finally{busy=false;if(version===generation){render();if(failure)say(failure.message);else refresh()}}
};
$('poll-hide').onclick=()=>saveSettings({hidden:!poll?.hidden},poll?.hidden?'Show this poll again?':'Hide this poll from visitors? Votes will be kept.');
$('poll-timer').onsubmit=event=>{event.preventDefault();const value=event.currentTarget.elements.minutes.value;saveSettings({minutes:value?Number(value):null},'Save the voting timer starting now? A manually closed poll stays closed.')};
async function saveSettings(changes,confirmation){if(!staff||!user||!poll||busy||!confirm(confirmation))return;const account=user,id=poll.id,version=generation;busy=true;render();let failure=null;try{await api('/polls/settings',{body:{id,...changes},account})}catch(e){failure=e}finally{busy=false;if(version===generation){render();if(failure)say(failure.message);else refresh()}}}
function visible(){return !document.hidden&&document.querySelector('.dashboard-hero').getClientRects().length>0}
// No Firestore reads for vote/status updates. Stop background-tab refreshes.
setInterval(()=>{if(visible())refresh()},30000);
document.addEventListener('visibilitychange',()=>{if(visible())refresh()});
document.addEventListener('simplegames:moderation-changed',()=>{if(visible())refresh()});
