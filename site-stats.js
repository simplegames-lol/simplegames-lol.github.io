(() => {
  const card=document.querySelector('.site-stats');if(!card)return;
  const namespace='simplegames-lol.github.io',zone='America/New_York';
  const live=location.hostname===namespace;
  const status=document.querySelector('#site-stats-status'),dateLabel=document.querySelector('#site-stats-date');
  const values={online:document.querySelector('#stats-online'),peak:document.querySelector('#stats-peak'),total:document.querySelector('#stats-total')};
  let id;try{id=localStorage.getItem('sg-stats-browser');if(!id){id=crypto.randomUUID();localStorage.setItem('sg-stats-browser',id)}}catch{id=crypto.randomUUID()}
  let timer,inFlight=false,failures=0,lastDay='',totalAt=0,peakAt=0,total=null,peak=null;
  const dayKey=()=>{const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(p=>[p.type,p.value]));return parts.year+'-'+parts.month+'-'+parts.day};
  async function request(action,key,options={},write=false){
    const url=new URL('https://counterapi.com/api/'+namespace+'/'+action+'/'+key);
    // Omit readOnly when recording: the service treats even "false" as enabled.
    if(!write)url.searchParams.set('readOnly','true');
    Object.entries(options).forEach(([k,v])=>url.searchParams.set(k,String(v)));
    url.searchParams.set('_',String(Date.now()));
    const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});
    // Never silently turn a service error into a zero count.
    if(response.status===404&&!write)return 0;
    if(!response.ok)throw Error('CounterAPI '+action+' '+(write?'recording':'read')+' failed (HTTP '+response.status+')');
    if(write&&options.trackOnly)return 0;
    const data=await response.json(),number=Number(data.value);
    if(!Number.isFinite(number)||number<0)throw Error('Invalid counter response');return number;
  }
  async function visit(day){
    if(!live)return;
    let recorded;try{recorded=localStorage.getItem('sg-stats-visit-day')}catch{}
    if(recorded===day)return;
    await request('view','day-'+day,{userId:id},true);
    try{localStorage.setItem('sg-stats-visit-day',day)}catch{}
  }
  async function raisePeak(day,online){
    let shared=await request('peak','day-'+day);
    if(live&&online>shared){
      await new Promise(resolve=>setTimeout(resolve,300+Math.random()*700));
      shared=await request('peak','day-'+day);
      // CounterAPI only increments: no atomic maximum. Bound requests per cycle;
      // the displayed peak is approximate and may overcount simultaneous updates.
      const steps=Math.min(5,Math.max(0,Math.ceil(online-shared)));
      for(let i=0;i<steps;i++)await request('peak','day-'+day,{userId:id},true);
      if(steps)shared=await request('peak','day-'+day);
    }
    return shared;
  }
  function schedule(){clearTimeout(timer);if(document.visibilityState==='visible')timer=setTimeout(sync,Math.min(300000,45000*2**failures))}
  async function sync(){
    if(inFlight||document.visibilityState!=='visible')return;
    inFlight=true;
    try{
      const day=dayKey();
      if(day!==lastDay){lastDay=day;totalAt=peakAt=0;total=peak=null;Object.values(values).forEach(el=>el.textContent='—')}
      await visit(day);
      if(live)await request('presence','day-'+day,{userId:id,trackOnly:true},true);
      const online=await request('presence','day-'+day,{unique:true,timeline:'2m'});
      if(!totalAt||Date.now()-totalAt>=120000){total=await request('view','day-'+day,{unique:true});totalAt=Date.now()}
      if(!peakAt||Date.now()-peakAt>=90000||online>peak){peak=await raisePeak(day,online);peakAt=Date.now()}
      values.online.textContent=online.toLocaleString();values.total.textContent=total.toLocaleString();values.peak.textContent=peak.toLocaleString();
      status.textContent=live?'Live global stats':'Preview · read only';card.classList.toggle('is-live',live);
      const prettyDate=new Intl.DateTimeFormat('en-US',{timeZone:zone,month:'short',day:'numeric',year:'numeric'}).format(new Date());
      dateLabel.textContent='Today · '+prettyDate+' · Resets at midnight EDT';failures=0;
    }catch(error){failures++;card.classList.remove('is-live');status.textContent='Stats unavailable';status.title=error.message;dateLabel.textContent='Counter service unavailable · retrying automatically';dateLabel.title=error.message;console.warn('Site stats:',error.message)}
    finally{inFlight=false;schedule()}
  }
  document.addEventListener('visibilitychange',()=>{clearTimeout(timer);if(document.visibilityState==='visible')sync()});
  // Keep the card on Home only, alongside the existing dashboard hero.
  const hero=document.querySelector('.dashboard-hero');
  if(hero){const update=()=>card.hidden=hero.hidden||getComputedStyle(hero).display==='none';new MutationObserver(update).observe(hero,{attributes:true,attributeFilter:['hidden','style','class']});update()}
  sync();
})();
