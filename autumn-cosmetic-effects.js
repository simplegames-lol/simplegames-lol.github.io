(() => {
 const selector='[data-cosmetic^="autumn-"]',frames=new Set(['autumn-turkey','autumn-leaves','autumn-pie']);
 function decorate(element){
  const id=element.dataset.cosmetic,existing=[...element.children].filter(child=>child.classList.contains('autumn-decoration'));
  if(existing.length===1&&existing[0].dataset.style===id&&frames.has(id))return;
  existing.forEach(child=>child.remove());if(!frames.has(id))return;
  const shell=document.createElement('span');shell.className='autumn-decoration';shell.dataset.style=id;shell.setAttribute('aria-hidden','true');
  if(id==='autumn-leaves')for(let i=0;i<3;i++){const leaf=document.createElement('i');leaf.className='autumn-leaf-particle autumn-leaf-'+i;shell.append(leaf)}
  element.append(shell);
 }
 const queue=new Set();let scheduled=false;
 function schedule(element){if(!element||element.nodeType!==1)return;queue.add(element);if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;for(const item of queue)if(item.isConnected)decorate(item);queue.clear()})}
 new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'){schedule(record.target);continue}if(record.target.matches?.(selector)||record.target.querySelector?.(':scope > .autumn-decoration'))schedule(record.target);for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches(selector))schedule(node);node.querySelectorAll(selector).forEach(schedule)}}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['data-cosmetic']});
 document.querySelectorAll(selector).forEach(schedule);
})();
