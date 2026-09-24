const storage = {
  read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

const root = document.documentElement;
const cards = [...document.querySelectorAll(".game-card")];
const search = document.querySelector("#game-search");
const favoritesFilter = document.querySelector("#favorites-filter");
const resultCount = document.querySelector("#result-count");
const infoOverlay = document.querySelector("#info-overlay");
const infoTitle = document.querySelector("#info-title");
const infoContent = document.querySelector("#info-content");
const settingsPanel = document.querySelector("#settings-panel");
const themeSelect = document.querySelector("#theme-select");
const cardSize = document.querySelector("#card-size");
const reduceMotion = document.querySelector("#reduce-motion");
const loader = document.querySelector("#game-loader");
const player = document.querySelector("#game-player");

let favorites = new Set(storage.read("sg-favorites", []));
let favoritesOnly = false;

const newGames = new Set([
  "/bouncy-basketball/",
  "/speed-stars/",
  "/tomb-of-the-mask/", "/crossy-road/", "/stickman-hook/", "/gunspin/",
  "/golf-orbit/", "/polytrack/", "/drift-boss/", "/block-blast/", "/escape-road/"
]);

cards.forEach((card) => {
  const link = card.querySelector("a[href]");
  const path = new URL(link.href, location.href).pathname;
  const name = card.querySelector("h2")?.textContent.trim() || "Game";
  card.dataset.path = path;
  card.dataset.name = name.toLowerCase();

  const favorite = document.createElement("button");
  favorite.className = "favorite-button";
  favorite.type = "button";
  favorite.setAttribute("aria-label", `Favorite ${name}`);
  favorite.setAttribute("aria-pressed", favorites.has(path) ? "true" : "false");
  favorite.textContent = favorites.has(path) ? "★" : "☆";
  favorite.addEventListener("click", () => {
    favorites.has(path) ? favorites.delete(path) : favorites.add(path);
    storage.write("sg-favorites", [...favorites]);
    favorite.setAttribute("aria-pressed", favorites.has(path) ? "true" : "false");
    favorite.textContent = favorites.has(path) ? "★" : "☆";
    filterGames();
  });
  card.prepend(favorite);

  if (newGames.has(path)) {
    const badge = document.createElement("span");
    badge.className = "new-badge";
    badge.textContent = "NEW";
    card.querySelector(".game-card__image-link")?.append(badge);
  }
});

function filterGames() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  cards.forEach((card) => {
    const show = card.dataset.name.includes(query) && (!favoritesOnly || favorites.has(card.dataset.path));
    card.hidden = !show;
    if (show) visible += 1;
  });
  resultCount.textContent = `${visible} game${visible === 1 ? "" : "s"}`;
}

search?.addEventListener("input", filterGames);
favoritesFilter?.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesFilter.setAttribute("aria-pressed", String(favoritesOnly));
  favoritesFilter.textContent = favoritesOnly ? "★ Favorites" : "☆ Favorites";
  filterGames();
});
filterGames();

function applyTheme(choice) {
  const effective = choice === "system"
    ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : choice;
  root.dataset.theme = effective;
  document.querySelector("#theme-toggle").textContent = effective === "dark" ? "☀" : "☾";
}

const savedTheme = storage.read("sg-theme", "dark");
themeSelect.value = savedTheme;
applyTheme(savedTheme);
document.querySelector("#theme-toggle")?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  themeSelect.value = next;
  storage.write("sg-theme", next);
  applyTheme(next);
});
themeSelect?.addEventListener("change", () => {
  storage.write("sg-theme", themeSelect.value);
  applyTheme(themeSelect.value);
});

const savedSize = storage.read("sg-card-size", "normal");
cardSize.value = savedSize;
root.dataset.cardSize = savedSize;
cardSize?.addEventListener("change", () => {
  root.dataset.cardSize = cardSize.value;
  storage.write("sg-card-size", cardSize.value);
});

reduceMotion.checked = storage.read("sg-reduce-motion", false);
root.classList.toggle("reduce-motion", reduceMotion.checked);
reduceMotion?.addEventListener("change", () => {
  root.classList.toggle("reduce-motion", reduceMotion.checked);
  storage.write("sg-reduce-motion", reduceMotion.checked);
});

function openSettings() {
  settingsPanel.hidden = false;
  document.querySelector("#settings-close").focus();
}
function closeSettings() { settingsPanel.hidden = true; }
document.querySelector("#settings-open")?.addEventListener("click", openSettings);
document.querySelector("#settings-close")?.addEventListener("click", closeSettings);
settingsPanel?.addEventListener("click", (event) => { if (event.target === settingsPanel) closeSettings(); });
document.querySelector("#reset-settings")?.addEventListener("click", () => {
  ["sg-theme", "sg-card-size", "sg-reduce-motion", "sg-favorites"].forEach((key) => localStorage.removeItem(key));
  location.reload();
});

if (!sessionStorage.getItem("sg-session-counted")) {
  storage.write("sg-sessions", storage.read("sg-sessions", 0) + 1);
  sessionStorage.setItem("sg-session-counted", "yes");
}
document.querySelector("#session-stat").textContent = `Visits on this device: ${storage.read("sg-sessions", 1)}`;
document.querySelector("#play-stat").textContent = `Games opened on this device: ${storage.read("sg-plays", 0)}`;

window.addEventListener("simplegames:play", () => {
  const plays = storage.read("sg-plays", 0) + 1;
  storage.write("sg-plays", plays);
  document.querySelector("#play-stat").textContent = `Games opened on this device: ${plays}`;
  loader.hidden = false;
});
player?.addEventListener("load", () => { loader.hidden = true; });

function updateConnection() {
  const status = document.querySelector("#connection-status");
  status.textContent = navigator.onLine ? "Online" : "Offline";
  status.classList.toggle("offline", !navigator.onLine);
}
addEventListener("online", updateConnection);
addEventListener("offline", updateConnection);
updateConnection();

const updateVersion = "2026-09-24-features";
const updateDot = document.querySelector("#update-dot");
updateDot.hidden = storage.read("sg-seen-update", "") === updateVersion;
document.querySelector("[data-page='updates']")?.addEventListener("click", () => {
  storage.write("sg-seen-update", updateVersion);
  updateDot.hidden = true;
});

function formMarkup(type) {
  const isRequest = type === "request";
  return `<section class="intro"><h1>${isRequest ? "Request a game" : "Report a bug"}</h1></section>
    <form class="form-card" id="site-form" data-kind="${type}">
      <label class="form-field">${isRequest ? "Game name" : "What is broken?"}<input name="subject" required maxlength="100"></label>
      <label class="form-field">${isRequest ? "Game link" : "Game or page"}<input name="link" type="url" placeholder="https://"></label>
      <label class="form-field">Details<textarea name="details" required maxlength="1500"></textarea></label>
      <button class="submit-button" type="submit">Open GitHub request</button>
      <p class="result-count">This opens a pre-filled GitHub Issue so the site owner can see it.</p>
    </form>`;
}

document.querySelector(".header-right")?.addEventListener("click", (event) => {
  const link = event.target.closest("[data-form]");
  if (!link) return;
  event.preventDefault();
  const kind = link.dataset.form;
  infoTitle.textContent = kind === "request" ? "Game Request" : "Bug Report";
  infoContent.innerHTML = formMarkup(kind);
  infoOverlay.hidden = false;
  document.body.classList.add("game-is-open");
  infoContent.querySelector("input")?.focus();
});

infoContent?.addEventListener("submit", (event) => {
  const form = event.target.closest("#site-form");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const kind = form.dataset.kind;
  const subject = data.get("subject");
  const link = data.get("link") || "Not provided";
  const details = data.get("details");
  const title = kind === "request" ? `Game request: ${subject}` : `Bug report: ${subject}`;
  const body = `Link/page: ${link}\n\nDetails:\n${details}`;
  window.open(`https://github.com/vjaxxon/vjaxxon.github.io/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`, "_blank", "noopener");
});

const menu = document.querySelector(".header-right");
const menuToggle = document.querySelector("#menu-toggle");
menuToggle?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
    event.preventDefault();
    search.focus();
  }
  if (event.key.toLowerCase() === "f" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
    favoritesFilter.click();
  }
  if (event.key === "Escape") closeSettings();
});
