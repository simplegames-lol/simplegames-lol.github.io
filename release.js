(() => {
  const newGames=['blocky-snakes','blade-ball','buildnow-gg','chess-classic','fortzone-battle-royale','boxing-physics-2','candy-crush','tiny-fishing','stickman-hook','soundboard','raft','jelly-drift','speed-stars','stack','rise-higher','fluid-simulation'].map(slug=>'/'+slug+'/');
const content='<ol class="updates-list"><li class="update-entry"><h2>October 8, 2026</h2><p>16 new games: Blocky Snakes, Blade Ball, BuildNow.gg, Chess Classic, Fortzone Battle Royale, Boxing Physics 2, Candy Crush, Tiny Fishing, Stickman Hook, Soundboard, Raft, Jelly Drift, Speed Stars, Stack, Rise Higher, and Fluid Simulation. Added NEW badges, updated Stack and Rise Higher images, and improved sort-menu readability.</p><p>Removed Retro Bowl College and Google Snake. Live Sports is under maintenance. Improved old-message notification handling, account lookup, server member names, and group-message popups showing the sender.</p><p>Added role-controlled server commands: timeout, kick, ban, lock channel, and their undo commands. Incoming calls now have Answer call and Decline controls, with connection errors displayed in the call popup. Removed camera buttons.</p><p>Added browser-side playtime safeguards for hidden, suspended, duplicate, loading, and inactive game tabs. Existing leaderboard totals are unchanged; unexplained increases are still under investigation.</p><p>Chat and calls may be unavailable when Firebase reaches its free daily quota. Call errors now identify backend permission and quota failures. Live calling still needs verification after quota recovery.</p></li><li class="update-entry"><h2>October 7, 2026</h2></li><li class="update-entry"><h2>October 6, 2026</h2></li><li class="update-entry"><h2>September 24, 2026</h2></li></ol>';
  window.simpleGamesRelease={version:'2026-10-08-games-calls-update',newGames,content};
  const board=document.querySelector('main > .updates-list');if(board)board.outerHTML=window.simpleGamesRelease.content;
  const fresh=new Set(newGames);
  document.querySelectorAll('.game-card').forEach(card=>{
    const link=card.querySelector('.game-card__image-link');
    if(!link||!fresh.has(new URL(link.href,location.href).pathname)||card.querySelector('.game-new-badge'))return;
    const badge=document.createElement('span');badge.className='game-new-badge';badge.textContent='NEW';link.append(badge);
  });
  const style=document.createElement('style');style.textContent='.updates-link #update-dot{top:50%;right:9px;transform:translateY(-50%);margin:0;width:7px;height:7px}';document.head.append(style);
})();
