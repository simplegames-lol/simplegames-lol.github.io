(() => {
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
const timezoneSelect = document.querySelector("#timezone-select");
const detectedTimezone = document.querySelector("#detected-timezone");
const accentColor = document.querySelector("#accent-color");
const backgroundColor = document.querySelector("#background-color");
const backgroundImage = document.querySelector("#background-image");
const backgroundStyle = document.querySelector("#background-style");
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

const automaticTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";
detectedTimezone.textContent = `Detected automatically: ${automaticTimezone}`;
const timezoneChoices = typeof Intl.supportedValuesOf === "function"
  ? Intl.supportedValuesOf("timeZone")
  : ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "UTC"];
timezoneSelect.add(new Option(`Automatic (${automaticTimezone})`, "auto"));
timezoneChoices.forEach((zone) => timezoneSelect.add(new Option(zone.replaceAll("_", " "), zone)));
timezoneSelect.value = storage.read("sg-timezone", "auto");
timezoneSelect.addEventListener("change", () => {
  storage.write("sg-timezone", timezoneSelect.value);
  dispatchEvent(new Event("simplegames:timezone"));
});

function applyAppearance() {
  const accent = storage.read("sg-accent", "#173f6d");
  const background = storage.read("sg-background", "#202225");
  const image = storage.read("sg-background-image", "");
  const style = storage.read("sg-background-style", "cover");
  accentColor.value = accent;
  backgroundColor.value = background;
  backgroundImage.value = image;
  backgroundStyle.value = style;
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--background", background);
  root.style.setProperty("--custom-background-image", image ? `url("${image.replaceAll('"', '%22')}")` : "none");
  root.style.setProperty("--custom-background-size", style === "repeat" ? "auto" : style);
  root.style.setProperty("--custom-background-repeat", style === "repeat" ? "repeat" : "no-repeat");
}

accentColor.addEventListener("input", () => { storage.write("sg-accent", accentColor.value); applyAppearance(); });
backgroundColor.addEventListener("input", () => { storage.write("sg-background", backgroundColor.value); applyAppearance(); });
backgroundImage.addEventListener("change", () => { storage.write("sg-background-image", backgroundImage.value.trim()); applyAppearance(); });
backgroundStyle.addEventListener("change", () => { storage.write("sg-background-style", backgroundStyle.value); applyAppearance(); });
applyAppearance();

function openSettings() {
  settingsPanel.hidden = false;
  document.querySelector("#settings-close").focus();
}
function closeSettings() { settingsPanel.hidden = true; }
document.querySelector("#settings-open")?.addEventListener("click", openSettings);
document.querySelector("#settings-close")?.addEventListener("click", closeSettings);
settingsPanel?.addEventListener("click", (event) => { if (event.target === settingsPanel) closeSettings(); });
document.querySelector("#reset-settings")?.addEventListener("click", () => {
  ["sg-theme", "sg-card-size", "sg-favorites", "sg-timezone", "sg-accent", "sg-background", "sg-background-image", "sg-background-style"].forEach((key) => localStorage.removeItem(key));
  location.reload();
});

window.addEventListener("simplegames:play", () => {
  loader.hidden = false;
});
player?.addEventListener("load", () => { loader.hidden = true; });

const batteryStatus = document.querySelector("#battery-status");
const isMac = /Macintosh|Mac OS X/.test(navigator.userAgent);
if (isMac && navigator.getBattery) {
  navigator.getBattery().then((battery) => {
    const updateBattery = () => {
      batteryStatus.textContent = `Battery ${Math.round(battery.level * 100)}%${battery.charging ? " ⚡" : ""}`;
    };
    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
  }).catch(() => { batteryStatus.textContent = "The battery feature only works on Mac"; });
}

const updateVersion = "2026-09-24-customization";
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
      <label class="form-field">Game name<input name="subject" required maxlength="100"></label>
      <label class="form-field">${isRequest ? "Why do you want this game?" : "What is wrong?"}<textarea name="details" required maxlength="1500"></textarea></label>
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
  const details = data.get("details");
  const title = kind === "request" ? `Game request: ${subject}` : `Bug report: ${subject}`;
  const body = `${kind === "request" ? "Why this game" : "What is wrong"}:\n${details}`;
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
})();
