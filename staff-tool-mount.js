// Move live controls, never clone them: IDs, handlers, and permissions stay intact.
export function mountStaffTool(host,resource,onHidden=()=>{}){
 const element=resource.element,marker=element.parentNode?document.createComment('staff tool original location'):null;
 if(marker)element.before(marker);element.classList.add('staff-embedded-tool');host.append(element);resource.mount?.();let disposed=false;
 const observer=new MutationObserver(()=>{if(!disposed&&element.hidden)onHidden()});observer.observe(element,{attributes:true,attributeFilter:['hidden']});
 return ()=>{if(disposed)return;disposed=true;observer.disconnect();try{resource.close?.()}finally{element.classList.remove('staff-embedded-tool');if(marker?.parentNode){marker.before(element);marker.remove()}else element.remove()}};
}
