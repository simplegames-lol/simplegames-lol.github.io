(() => {
  function compare(a,b,mode,plays={},ratings={}){
    const name=()=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'});
    const score=(data,key)=>{const value=Number(data[key]);return Number.isFinite(value)&&value>=0?value:0};
    if(mode==='az')return name();if(mode==='za')return -name();
    if(mode==='most-played')return score(plays,b.path)-score(plays,a.path)||name();
    if(mode==='top-rated'){
      const stats=path=>{const value=ratings[path],count=Number(value?.count),average=Number(typeof value==='object'?value?.average:value);return{count:Number.isFinite(count)&&count>=0?count:0,average:Number.isFinite(average)&&average>=0?average:0}};
      const left=stats(a.path),right=stats(b.path);
      return right.count-left.count||right.average-left.average||name();
    }
    return a.order-b.order;
  }
  function category(value){return {racing:'driving',arcade:'action',platformer:'action'}[value]||value||'action'}
  window.simpleGamesSort={compare,category};
})();
