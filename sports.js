(() => {
  const panel = document.createElement('section');
  panel.className = 'sports-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Live Sports');
  const style = document.createElement('style');
  style.textContent = '.sports-panel{position:fixed;inset:0;background:#000;z-index:550;display:flex;flex-direction:column}.sports-panel[hidden]{display:none}.sports-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #222;background:#000;color:#fff}.sports-bar strong{margin-right:auto}.sports-note{margin:0;padding:8px 18px;color:#aaa;font-size:12px;background:#000}.sports-frame{width:100%;flex:1;min-height:0;border:0;background:#000}';
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'sports-bar';
  const home = document.createElement('button');
  home.className = 'secondary-button';
  home.textContent = '← Home';
  const title = document.createElement('strong');
  title.textContent = 'Live Sports';
  const retry = document.createElement('button');
  retry.className = 'secondary-button';
  retry.textContent = 'Reload';
  const note = document.createElement('p');
  note.className = 'sports-note';
  const frame = document.createElement('iframe');
  frame.className = 'sports-frame';
  frame.title = 'External sports website';
  frame.referrerPolicy = 'no-referrer';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
  frame.setAttribute('allow', 'autoplay; fullscreen; encrypted-media');
  frame.allowFullscreen = true;
  const url = 'https://reedstreams.to/';
  let timer;
  function load() {
    clearTimeout(timer);
    note.textContent = 'Loading external sports website…';
    frame.src = url;
    timer = setTimeout(() => {
      note.textContent = 'Taking a while? The provider may block embedded playback. Try Reload.';
    }, 15000);
  }
  frame.onload = () => {
    clearTimeout(timer);
    note.textContent = 'External provider · Playback depends on their site. Pop-up windows are blocked.';
  };
  frame.onerror = () => {
    clearTimeout(timer);
    note.textContent = 'The external website could not load. Try Reload.';
  };
  function close() {
    clearTimeout(timer);
    panel.hidden = true;
    frame.src = 'about:blank';
    document.querySelector('.rail-link[href="/"]')?.click();
  }
  function open() { panel.hidden = false; load(); home.focus(); }
  home.onclick = close;
  retry.onclick = load;
  document.querySelector('#sports-open').onclick = open;
  document.querySelector('#sports-home-open').onclick = open;
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) close();
  });
  bar.append(home, title, retry);
  panel.append(bar, note, frame);
  document.body.append(panel);
})();
