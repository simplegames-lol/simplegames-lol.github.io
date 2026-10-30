import {leaderboardWeek} from './leaderboard-week.js?v=1';
export function completedSpotlightWeek(now=Date.now()){
  const current=leaderboardWeek(now);
  return now<current.start+120000?null:leaderboardWeek(current.start-1);
}
