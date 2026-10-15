(()=>{
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
 const color=value=>typeof value==='string'&&/^#[a-f0-9]{6}$/i.test(value);
 const media=matchMedia('(prefers-color-scheme: light)');
 function apply(){
  const root=document.documentElement,choice=read('sg-theme','dark'),light=choice==='light'||choice==='system'&&media.matches;
  root.dataset.theme=light?'light':'dark';root.style.colorScheme=light?'light':'dark';
  const accent=read('sg-accent','#153a63');root.style.setProperty('--accent',color(accent)?accent:'#153a63');
  const background=read('sg-background',null);
  if(color(background)&&!(light&&['#000000','#000','#050608','#202225'].includes(background.toLowerCase())))root.style.setProperty('--background',background);else root.style.removeProperty('--background');
  const image=read('sg-background-image',''),size=read('sg-background-style','cover');
  root.style.setProperty('--custom-background-image',typeof image==='string'&&image.startsWith('data:image/')?`url("${image.replaceAll('"','%22')}")`:'none');
  root.style.setProperty('--custom-background-size',['cover','contain','repeat'].includes(size)?size==='repeat'?'auto':size:'cover');
  root.style.setProperty('--custom-background-repeat',size==='repeat'?'repeat':'no-repeat');
  const toggle=document.querySelector('#theme-toggle .rail-icon');if(toggle)toggle.textContent=light?'☾':'☀';
 }
 window.SimpleGamesAppearance={apply};apply();media.addEventListener('change',apply);
 window.addEventListener('storage',apply);document.addEventListener('simplegames:preferences-loaded',apply);
})();
