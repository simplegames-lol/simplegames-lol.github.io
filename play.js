(() => {
const games = {
  "/bouncy-basketball/": "https://trueedu20.github.io/g177/class-282",
  "/speed-stars/": "https://pizzaedition.com/embed/speedstars",
  "/tomb-of-the-mask/": "https://games.pizzaedition.com/tomb-of-the-mask/h/index.html",
  "/crossy-road/": "https://games.pizzaedition.com/crossyroadnormal/g/index.html",
  "/stickman-hook/": "https://games.pizzaedition.com/stickman-hook/i/index.html",
  "/gunspin/": "https://games.pizzaedition.com/gunspin-main/h/index.html",
  "/golf-orbit/": "https://games.pizzaedition.com/golforbit/i/index.html",
  "/polytrack/": "https://poly-track-online.github.io/polytrack/",
  "/drift-boss/": "https://driftbossonline.github.io/file/",
  "/block-blast/": "https://blockblast-2.io/embed/block-blast-unblocked?preroll=0&pub_id=",
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
let loadTimer = 0;
let currentGameUrl = "";

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
  overlay.hidden = true;
  player.src = "about:blank";
  document.querySelector("#game-loader").hidden = true;
  document.body.classList.remove("game-is-open");
  window.dispatchEvent(new CustomEvent("simplegames:stop-playing"));
}

player.addEventListener("load", () => { clearTimeout(loadTimer); loader.hidden = true; });
document.querySelector("#game-retry")?.addEventListener("click", () => {
  loaderStatus.textContent = "Trying again…";
  loaderSpinner.hidden = false;
  loaderActions.hidden = true;
  player.src = "about:blank";
  setTimeout(() => { loader.hidden = false; player.src = currentGameUrl; loadTimer = setTimeout(() => { loader.hidden = false; loaderSpinner.hidden = true; loaderStatus.textContent = "The game still could not load. Try again later."; loaderActions.hidden = false; }, 15000); }, 100);
});
document.querySelector("#game-error-close")?.addEventListener("click", closeGame);

const pages = {
  updates: {
    title: "Update Log",
    content: '<section class="intro"><h1>Update Log</h1></section><ol class="updates-list"><li class="update-entry"><h2>September 24, 2026 — Big Site Update</h2><p>Added Bouncy Basketball, Speed Stars, Escape Road, Block Blast, Drift Boss, PolyTrack, Golf Orbit, Gunspin, Stickman Hook, Tomb of the Mask, Crossy Road, Monkey Mart, and Basketball Stars. Also added accounts, usernames and username changes, searchable friends, pinned conversations, direct profile links, profile statuses, managed group chats, group unread alerts, friend requests and removal, private messaging, emoji reactions, message editing, quoted replies, small image and GIF sharing, message deletion, notification sounds, unread badges, typing indicators, read receipts, friend profiles, profile badges, online and last-active status, friend activity, privacy controls, Do Not Disturb, game ratings, most-played and top-rated sorting, achievements, playtime tracking, cloud-synced customization, account settings, password resets, blocking and reporting, search, favorites, category filters, themes, timezone controls, request and bug forms, shortcuts, improved game loading errors and retries, new-game badges, mobile navigation, and a custom 404 page.</p></li></ol>'
  },
  announcements: {
    title: "Announcements",
    content: '<section class="intro"><h1>Announcements</h1></section><div class="update-entry"><p>More games coming soon!</p></div>'
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
