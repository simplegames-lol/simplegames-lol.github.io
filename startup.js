(() => {
  const loader = document.querySelector("#startup-loader");
  const bar = document.querySelector("#startup-progress-bar");
  const status = document.querySelector("#startup-status");
  const enter = document.querySelector("#startup-enter");
  if (!loader) return;

  if(Date.now()<Date.UTC(2026,10,2,5)){
    loader.classList.add('startup-halloween');
    const greeting=document.createElement('div');greeting.className='startup-season-greeting';greeting.innerHTML='<h2>🎃 Halloween is here! 👻</h2>';
    loader.querySelector('.startup-card').prepend(greeting);
    const scenery=document.createElement('div');scenery.className='startup-halloween-scenery';scenery.setAttribute('aria-hidden','true');
    scenery.innerHTML='<svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" focusable="false"><path fill="#17111d" d="M0 180 70 160 150 190 240 155 330 193 470 170 600 200 770 160 910 185 1060 158 1200 180V260H0Z"/><path fill="#0a090d" d="M0 217h75v-72l-15 10 40-49 40 49-15-10v72h42v-45l-9 5 23-34 24 34-9-5v45h30v-12h12v-49h-19v-12h19v-15h12v15h19v12h-19v49h12v12h690v-75l-16 9 41-49 41 49-16-9v75h48v-36l-11 7 29-40 28 40-11-7v36h105v43H0Z"/><g fill="#a9662b" opacity=".6"><path d="M91 164h9v15h-9zm16 0h9v15h-9zm867-1h9v15h-9zm18 0h9v15h-9z"/></g></svg>';
    loader.prepend(scenery);
  }
  document.body.classList.add("startup-is-open");
  let progress = 0;
  const timer = setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 16));
    bar.style.width = `${progress}%`;
    status.textContent = progress < 100 ? "Loading" : "Ready";
    if (progress === 100) {
      clearInterval(timer);
      status.textContent = "Ready";
      enter.disabled = false;
      enter.textContent = "Enter";
      enter.focus();
    }
  }, 70);

  function tone(frequency, start, duration) {
    try {
      const context = tone.context ||= new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.055, context.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + start);
      oscillator.stop(context.currentTime + start + duration);
    } catch {}
  }

  function enterSite() {
    if (enter.disabled) return;
    tone(420, 0, .14);
    tone(630, .1, .18);
    loader.classList.add("leaving");
    setTimeout(() => {
      loader.remove();
      document.body.classList.remove("startup-is-open");
    }, 320);
  }

  enter.addEventListener("click", enterSite);
  document.addEventListener("keydown", event => {
    if (event.key === "Enter" && !enter.disabled) enterSite();
  });
})();
