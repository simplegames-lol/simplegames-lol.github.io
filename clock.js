const clocks = document.querySelectorAll('.local-time');

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
