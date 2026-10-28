export const GIF_MAX_BYTES=130*1024;
const PHOTO_TYPES=['image/png','image/jpeg','image/webp'];
function loadImage(url){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('That image could not be read. Try another one.'));image.src=url})}
function readDataURL(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('That image could not be opened.'));reader.readAsDataURL(file)})}
export async function readProfileGif(file){
  if(file.type!=='image/gif')throw Error('Choose a GIF image.');
  if(file.size>GIF_MAX_BYTES)throw Error('Animated GIFs must be 130 KB or smaller. Choose a smaller or shorter GIF.');
  const bytes=new Uint8Array(await file.arrayBuffer()),signature=String.fromCharCode(...bytes.slice(0,6));
  if(bytes.length<14||!['GIF87a','GIF89a'].includes(signature)||bytes[bytes.length-1]!==0x3b)throw Error('That file is not a readable GIF.');
  const width=bytes[6]|bytes[7]<<8,height=bytes[8]|bytes[9]<<8;
  if(!width||!height||width>2048||height>2048)throw Error('GIFs must be 2048 × 2048 pixels or smaller.');
  let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
  return 'data:image/gif;base64,'+btoa(binary);
}
export async function prepareProfileAvatar(file){
  if(file.type==='image/gif'){const url=await readProfileGif(file);await loadImage(url);return url}
  if(!PHOTO_TYPES.includes(file.type)||file.size>5*1024*1024)throw Error('Choose a photo under 5 MB or an animated GIF under 130 KB.');
  const image=await loadImage(await readDataURL(file)),canvas=document.createElement('canvas'),size=256,side=Math.min(image.width,image.height);
  canvas.width=canvas.height=size;canvas.getContext('2d').drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,size,size);
  let result;for(const quality of [.76,.65,.54,.43]){result=canvas.toDataURL('image/webp',quality);if(result.length<=180000)return result}
  throw Error('That picture could not be compressed enough. Try another image.');
}
