(() => {
const games = {
  "/bouncy-basketball/": "https://trueedu20.github.io/g177/class-282",
  "/polytrack/": "https://poly-track-online.github.io/polytrack/",
  "/drift-boss/": "https://driftbossonline.github.io/file/",
  "/escape-road/": "https://escape-road.global.ssl.fastly.net/",
  "/monkey-mart/": "https://gaming-escape.github.io/public/assets/games/monkey-mart/",
  "/basketball-stars/": "https://gaming-escape.github.io/public/assets/games/basketball-stars/",
  "/drift-hunters/": "https://unblokedgames.github.io/projects/drift-hunters/index.html",
  "/basket-random/": "https://2048taylorswift.github.io/basketrandom/",
  "/subway-surfers/": "https://unblokedgames.github.io/subway-surfers.html",
  "/bitlife/": "https://unblokedgames.github.io/projects/bitlife/index.html",
  "/project-sand/": "https://unblokedgames.github.io/projects/project-sand/index.html",
  "/slope/": "https://unblokedgames.github.io/projects/slope/index.html",
  "/retro-bowl/": "https://unblokedgames.github.io/projects/retro-bowl/index.html"
};

const overlay = document.querySelector("#game-overlay");
const player = document.querySelector("#game-player");
const title = document.querySelector("#game-title");
const closeButton = document.querySelector("#game-close");
const infoOverlay = document.querySelector("#info-overlay");
const infoTitle = document.querySelector("#info-title");
const infoContent = document.querySelector("#info-content");
const infoClose = document.querySelector("#info-close");
const loader = document.querySelector("#game-loader");
const loaderStatus = document.querySelector("#game-loader-status");
const loaderSpinner = document.querySelector("#game-loader-spinner");
const loaderActions = document.querySelector("#loader-actions");
const loaderSound = document.querySelector("#loader-sound");
let loadTimer = 0;
let currentGameUrl = "";
let soundOn = true, soundTimer = 0, audioContext;
function loadingTone(frequency=360){if(!soundOn)return;try{audioContext??=new AudioContext();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.12);oscillator.connect(gain).connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+.13)}catch{}}
function startLoadingSound(){clearInterval(soundTimer);loadingTone(330);soundTimer=setInterval(()=>loadingTone(430),1100)}
function stopLoadingSound(done=false){clearInterval(soundTimer);soundTimer=0;if(done)loadingTone(620)}
loaderSound?.addEventListener("click",()=>{soundOn=!soundOn;loaderSound.setAttribute("aria-pressed",String(soundOn));loaderSound.textContent=soundOn?"🔊 Loading sounds on":"🔇 Loading sounds off";if(soundOn)startLoadingSound();else stopLoadingSound()});

if (window.location.pathname.endsWith("/index.html")) {
  history.replaceState(null, "", "/");
}

document.querySelector(".game-grid")?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const path = new URL(link.href, window.location.href).pathname;
  const gameUrl = games[path];
  if (!gameUrl) return;

  event.preventDefault();
  const cardTitle = link.closest(".game-card")?.querySelector("h2")?.textContent?.trim() || "Game";
  title.textContent = cardTitle;
  player.title = cardTitle;
  currentGameUrl = gameUrl;
  player.src = gameUrl;
  loaderStatus.textContent = "Loading game…";
  loaderSpinner.hidden = false;
  loaderActions.hidden = true;
  loader.hidden = false;
  startLoadingSound();
  clearTimeout(loadTimer);
  loadTimer = setTimeout(() => {
    loader.hidden = false;
    loaderSpinner.hidden = true;
    loaderStatus.textContent = "This game is taking too long to load. It may be blocked or temporarily unavailable.";
    loaderActions.hidden = false;
  }, 15000);
  overlay.hidden = false;
  document.body.classList.add("game-is-open");
  window.dispatchEvent(new CustomEvent("simplegames:play", { detail: { path, title: cardTitle } }));
  closeButton.focus();
});

function closeGame() {
  clearTimeout(loadTimer);
  stopLoadingSound();
  overlay.hidden = true;
  player.src = "about:blank";
  document.querySelector("#game-loader").hidden = true;
  document.body.classList.remove("game-is-open");
  window.dispatchEvent(new CustomEvent("simplegames:stop-playing"));
}

player.addEventListener("load", () => { clearTimeout(loadTimer); loader.hidden = true; stopLoadingSound(true); });
document.querySelector("#game-retry")?.addEventListener("click", () => {
  loaderStatus.textContent = "Trying again…";
  startLoadingSound();
  loaderSpinner.hidden = false;
  loaderActions.hidden = true;
  player.src = "about:blank";
  setTimeout(() => { loader.hidden = false; player.src = currentGameUrl; loadTimer = setTimeout(() => { loader.hidden = false; loaderSpinner.hidden = true; loaderStatus.textContent = "The game still could not load. Try again later."; loaderActions.hidden = false; }, 15000); }, 100);
});
document.querySelector("#game-error-close")?.addEventListener("click", closeGame);

const pages = {
  updates: {
    title: "Update Log",
    content: '<ol class="updates-list"><li class="update-entry"><h2>Big Site Update</h2><p>Redesigned Simple Games with a cleaner dashboard, faster shortcuts, improved browsing, accounts, friends, chat, profiles, live status, ratings, playtime, AI, and community servers.</p></li></ol>'
  },
  announcements: {
    title: "Announcements",
    content: '<div class="update-entry"><h2>More games coming soon</h2><p>New games and server improvements are on the way.</p></div>'
  }
};

document.querySelector(".header-right")?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const page = pages[link.dataset.page];
  if (!page) return;

  event.preventDefault();
  infoTitle.textContent = page.title;
  infoContent.innerHTML = page.content;
  infoOverlay.hidden = false;
  document.body.classList.add("game-is-open");
  infoClose.focus();
});

function closeInfo() {
  infoOverlay.hidden = true;
  document.body.classList.remove("game-is-open");
}

infoClose?.addEventListener("click", closeInfo);

closeButton?.addEventListener("click", closeGame);
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!overlay.hidden) closeGame();
  if (!infoOverlay.hidden) closeInfo();
});
})();
