// Standalone game: no portal, pop-ups, or third-party network access.
Object.defineProperty(window,'open',{value:()=>null,writable:false,configurable:false});
document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(link&&!link.getAttribute('href').startsWith('#')){event.preventDefault();event.stopImmediatePropagation()}},true);
window.famobi_gameID='8-ball-billiards-classic';
window.famobi_gameJS=['01phaser','02Ball','03contactListener','04billiardPhysics','05levelData','06maths','07vector2d','08render','09sound','10effects','11timer','12load','13mainMenu','14setup','15gameController','16boot'].map(name=>'assets/src/'+name+'.js');
window.famobi_gameJS.push(function(){});
if(window.ytgame?.game?.firstFrameReady)window.ytgame.game.firstFrameReady();
const script=document.createElement('script');script.src='html5games/gameapi/v1.js';document.head.append(script);
