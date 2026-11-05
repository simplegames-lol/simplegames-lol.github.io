(() => {
 const select=document.querySelector('#season-select');
 if(!select)return;
 function update(){
  const fall=document.documentElement.dataset.season!=='normal';
  select.value=fall?'fall':'normal';
  for(const id of ['accent-color','background-color','background-image-file','background-style','remove-background','theme-select']){
   const control=document.getElementById(id);if(!control)continue;
   control.disabled=fall;control.setAttribute('aria-describedby','season-note');
  }
  if(fall){document.querySelector('#accent-color').value='#d28a42';document.querySelector('#background-color').value='#100c09';document.querySelector('#theme-select').value='dark'}
  document.querySelector('#season-note').textContent=fall?'Fall uses an orange accent and a fixed autumn background. Switch to Normal to customize your appearance.':'Choose your own colors, background, and light or dark appearance.';
 }
 select.addEventListener('change',()=>{
  try{localStorage.setItem('sg-season',JSON.stringify(select.value))}catch{}
  window.SimpleGamesAppearance?.apply();
  // Refresh the existing color and background controls from saved normal choices.
  document.dispatchEvent(new Event('simplegames:preferences-loaded'));
  document.dispatchEvent(new Event('simplegames:preferences-changed'));
 });
 document.addEventListener('simplegames:appearance-applied',update);
 document.addEventListener('simplegames:settings-reset',()=>{window.SimpleGamesAppearance?.apply();update()});
 update();
})();
