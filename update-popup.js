(() => {
  const release = window.simpleGamesRelease;
  if (!release || !document.querySelector('.dashboard-hero')) return;
  const version = release.popup?.version || release.version;
  const key = 'sg-dismissed-release';
  function wasDismissed() {
    try { return localStorage.getItem(key) === version; } catch { return false; }
  }
  if (wasDismissed()) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'release-popup';
  dialog.setAttribute('aria-labelledby', 'release-popup-title');
  const heading = document.createElement('h2');
  heading.id = 'release-popup-title';
  heading.textContent = 'A new update is here!';
  const notes = document.createElement('div');
  notes.className = 'release-popup-notes';
  if (release.popup) {
    const date = document.createElement('small');
    date.textContent = release.popup.date;
    notes.append(date);
    const list = document.createElement('ul');
    for (const text of release.popup.notes) {
      const item = document.createElement('li');
      item.textContent = text;
      list.append(item);
    }
    notes.append(list);
  } else {
    const source = document.createElement('template');
    source.innerHTML = release.content;
    const entry = source.content.querySelector('.update-entry');
    if (entry) notes.append(entry.cloneNode(true));
    else notes.textContent = 'Check Updates to see what’s new.';
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Got it';
  button.autofocus = true;
  dialog.append(heading, notes, button);
  document.body.append(dialog);
  let previousFocus;
  function dismiss() {
    try { localStorage.setItem(key, version); } catch {}
    dialog.close();
    previousFocus?.focus?.();
  }
  button.addEventListener('click', dismiss);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  window.addEventListener('storage', event => {
    if (event.key === key && event.newValue === version && dialog.open) dialog.close();
  });
  const startup = document.querySelector('#startup-loader');
  function show() {
    if (startup && !startup.hidden && getComputedStyle(startup).display !== 'none') return;
    observer?.disconnect();
    if (wasDismissed()) return;
    previousFocus = document.activeElement;
    dialog.showModal();
  }
  const observer = startup ? new MutationObserver(show) : null;
  observer?.observe(startup, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
  show();
})();
