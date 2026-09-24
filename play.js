const games = {
  "/monkey-mart/": "https://gaming-escape.github.io/public/assets/games/monkey-mart/",
  "/drive-mad/": "https://gaming-escape.github.io/public/assets/games/drive-mad/",
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
  player.src = gameUrl;
  overlay.hidden = false;
  document.body.classList.add("game-is-open");
  closeButton.focus();
});

function closeGame() {
  overlay.hidden = true;
  player.src = "about:blank";
  document.body.classList.remove("game-is-open");
}

closeButton?.addEventListener("click", closeGame);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) closeGame();
});
