Object.defineProperty(window,'open',{value:()=>null,writable:false,configurable:false});
document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(link){event.preventDefault();event.stopImmediatePropagation()}},true);
window.getIsBannerSupported=()=>'false';
window.showBanner=()=>window.sendMessageToUnity('OnBannerStateChanged','hidden');
window.hideBanner=()=>{};
window.showInterstitial=()=>window.sendMessageToUnity('OnInterstitialStateChanged','closed');
window.showRewarded=()=>window.sendMessageToUnity('OnRewardedStateChanged','failed');
