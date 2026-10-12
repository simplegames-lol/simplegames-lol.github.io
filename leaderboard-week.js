const zone='America/New_York';
export const FIRST_WEEK_KEY='2026-10-12';
export const useWeeklyLeaderboard=ms=>leaderboardWeek(ms).key>=FIRST_WEEK_KEY;
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function parts(ms){return Object.fromEntries(formatter.formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]))}
function easternMidnight(day){
  const target=Date.UTC(day.getUTCFullYear(),day.getUTCMonth(),day.getUTCDate());
  let result=target+5*3600000;
  for(let i=0;i<3;i++){const p=parts(result);result+=target-Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)}
  return result;
}
export function leaderboardWeek(ms=Date.now()){
  const p=parts(ms),day=new Date(Date.UTC(p.year,p.month-1,p.day));
  day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);
  const key=day.toISOString().slice(0,10),start=easternMidnight(day);
  day.setUTCDate(day.getUTCDate()+7);
  return {key,start,end:easternMidnight(day)};
}
export function splitLeaderboardWeeks(start,end){
  const result=[];
  while(start<end){const week=leaderboardWeek(start),until=Math.min(end,week.end);result.push({...week,milliseconds:until-start});start=until}
  return result;
}
