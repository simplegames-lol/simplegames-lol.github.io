const clocks = document.querySelectorAll('.local-time');

let favicon = document.querySelector('link[rel="icon"]');
if (!favicon) {
  favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/svg+xml';
  favicon.href = 'assets/favicon.svg';
  document.head.appendChild(favicon);
}

function updateClocks() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  clocks.forEach((clock) => {
    clock.textContent = time;
    clock.dateTime = now.toISOString();
  });
}

updateClocks();
setInterval(updateClocks, 1000);
