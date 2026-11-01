export const CLIP_SECONDS=30;
export function songVideoId(value){
 const text=String(value||'').trim();if(text.length>2048)throw Error('That song link is too long.');
 let url;try{url=new URL(text)}catch{throw Error('Paste the song link copied from Music, or a YouTube song link.')}
 let id='';
 if(url.protocol==='https:'&&url.hostname==='nubana.cfd'){const route=url.searchParams.get('m');if(route)return songVideoId(route)}
 if(url.protocol==='rosin:'&&url.hostname==='music'){id=url.searchParams.get('t')||url.searchParams.get('track')||'';if(/^yt[A-Za-z0-9_-]{11}$/.test(id))id=id.slice(2)}
 else if(url.protocol==='https:'&&url.hostname==='youtu.be')id=url.pathname.slice(1).split('/')[0];
 else if(url.protocol==='https:'&&['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)){id=url.searchParams.get('v')||(/^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1])||''}
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))throw Error('This song source is not supported yet. Choose a YouTube-based song in Music and copy its song link.');return id;
}
export function clipStart(value){
 const text=String(value).trim();let seconds;
 if(/^\d+$/.test(text))seconds=Number(text);else{const match=/^(\d{1,3}):([0-5]\d)$/.exec(text);if(match)seconds=Number(match[1])*60+Number(match[2])}
 if(!Number.isInteger(seconds)||seconds<0||seconds>21570)throw Error('Enter a start time like 0:45, up to 359:30.');return seconds;
}
export function validProfileMusic(value){return !!value&&/^[A-Za-z0-9_-]{11}$/.test(value.videoId)&&typeof value.title==='string'&&value.title.length>0&&value.title.length<=80&&Number.isInteger(value.start)&&value.start>=0&&value.start<=21570&&value.duration===CLIP_SECONDS}
export function musicDraft(link,title,start){const result={videoId:songVideoId(link),title:String(title||'My profile song').trim(),start:clipStart(start),duration:CLIP_SECONDS};if(!validProfileMusic(result))throw Error('Use a song name between 1 and 80 characters.');return result}
export const musicTime=seconds=>Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
