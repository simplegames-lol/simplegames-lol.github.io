// Temporarily withdraw these games without deleting their saved preferences.
const unavailableGames = new Set(['/worldguessr/', '/2d-fortnite/', '/thorns-and-ballons/', '/drift-hunters-pro/', '/moto-x3m/', '/snek-io/']);
document.querySelectorAll('.game-card').forEach(card => {
  const link = card.querySelector('a');
  if (link && unavailableGames.has(new URL(link.href, location.href).pathname)) card.remove();
});
