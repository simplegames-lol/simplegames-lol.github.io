// Keep the game inside Simple Games. No ad loader or external portal is loaded.
Object.defineProperty(window,'open',{value:()=>null,writable:false,configurable:false});
document.addEventListener('click',event=>{if(event.target.closest?.('a[href]')){event.preventDefault();event.stopPropagation()}},true);
