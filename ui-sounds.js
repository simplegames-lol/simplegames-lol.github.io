(() => {
  let context;
  document.addEventListener("click", event => {
    const control = event.target.closest("button,a,select");
    if (!control || control.disabled || control.id === "startup-enter") return;
    try {
      context ||= new AudioContext();
      if (context.state === "suspended") context.resume();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(720, now);
      oscillator.frequency.exponentialRampToValueAtTime(380, now + .045);
      gain.gain.setValueAtTime(.022, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + .06);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + .065);
    } catch {}
  });
})();
