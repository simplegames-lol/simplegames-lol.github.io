import {leaderboardWeek} from './leaderboard-week.js?v=1';
export function completedSpotlightWeek(now=Date.now()){
  const current=leaderboardWeek(now);
  return now<current.start+120000?null:leaderboardWeek(current.start-1);
}

export function spotlightPeriodLabel(period){
 const format=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric'});
 const year=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric'}).format(new Date(period.end-1));
 return format.format(new Date(period.start))+' – '+format.format(new Date(period.end-1))+', '+year+' · ET';
}
