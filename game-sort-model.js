(() => {
  function compare(a,b,mode,plays={},ratings={}){
    const name=()=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'});
    const score=(data,key)=>{const value=Number(data[key]);return Number.isFinite(value)&&value>=0?value:0};
    if(mode==='az')return name();if(mode==='za')return -name();
    if(mode==='most-played')return score(plays,b.path)-score(plays,a.path)||name();
    if(mode==='top-rated')return score(ratings,b.path)-score(ratings,a.path)||name();
    return a.order-b.order;
  }
  function category(value){return {racing:'driving',arcade:'action',platformer:'action'}[value]||value||'action'}
  window.simpleGamesSort={compare,category};
})();
