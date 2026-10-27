(() => {
  const enabled = matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const selector = '.game-card,.dashboard-shortcuts>button';
  let active = null, bounds = null, frame = 0, point = null;
  function reset() {
    cancelAnimationFrame(frame); frame = 0;
    if (active) {
      active.removeAttribute('data-tilt-active');
      for (const key of ['--tilt-x','--tilt-y','--shine-x','--shine-y']) active.style.removeProperty(key);
    }
    active = bounds = point = null;
  }
  function paint() {
    frame = 0;
    if (!active?.isConnected || !bounds || !point) { reset(); return; }
    const x = Math.max(0, Math.min(1, (point.x - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (point.y - bounds.top) / bounds.height));
    active.style.setProperty('--tilt-x', ((.5 - y) * 12).toFixed(2) + 'deg');
    active.style.setProperty('--tilt-y', ((x - .5) * 12).toFixed(2) + 'deg');
    active.style.setProperty('--shine-x', (x * 100).toFixed(1) + '%');
    active.style.setProperty('--shine-y', (y * 100).toFixed(1) + '%');
  }
  document.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse') { if (active) reset(); return; }
    const card = event.target.closest?.(selector);
    if (!card) { if (active) reset(); return; }
    if (active !== card) {
      reset(); active = card; bounds = card.getBoundingClientRect();
      if (!bounds.width || !bounds.height) { reset(); return; }
      card.setAttribute('data-tilt-active', '');
    }
    point = {x: event.clientX, y: event.clientY};
    if (!frame) frame = requestAnimationFrame(paint);
  }, {passive:true});
  document.addEventListener('pointerout', event => {
    if (active && !active.contains(event.relatedTarget)) reset();
  }, {passive:true});
  document.addEventListener('scroll', reset, {capture:true,passive:true});
  document.addEventListener('visibilitychange', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset, {passive:true});
  enabled.addEventListener('change', reset);
})();
