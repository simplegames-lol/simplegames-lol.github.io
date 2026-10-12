const stamp=value=>value?.toMillis?.()??((value?.seconds||0)*1000+(value?.nanoseconds||0)/1e6);
export function createFriendPresenceDetector({now=()=>Date.now(),since=now(),timeout=75000,cooldown=120000}={}){
  const seen=new Map();
  const recent=(data,time)=>{const at=stamp(data?.lastActive);return at>0&&time-at<timeout&&at<=time+30000};
  return {
    observe(uid,data,{fromCache=false,baseline=false}={}){
      if(fromCache)return false;
      const time=now(),previous=seen.get(uid);
      seen.set(uid,{data,lastAlert:previous?.lastAlert??-Infinity});
      if(!previous||baseline||!data||data.hideOnline||data.status!=='online'||!recent(data,time))return false;
      if(previous.data?.hideOnline)return false;
      if(['online','away'].includes(previous.data?.status)&&recent(previous.data,time))return false;
      const at=stamp(data.lastActive);
      if(at<=since||at<=stamp(previous.data?.lastActive)||time-previous.lastAlert<cooldown)return false;
      seen.get(uid).lastAlert=time;return true;
    },
    retain(uids){for(const uid of seen.keys())if(!uids.includes(uid))seen.delete(uid)},
    clear(){seen.clear()}
  };
}
