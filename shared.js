// ── PETAL CANVAS ──
(function () {
  const canvas = document.getElementById('petal-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let petals = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#f9d0e4','#e8a0c5','#fde8f0','#f5c8dc','#fbd5e8','#f0b8ce'];

  function newPetal() {
    return {
      x: Math.random() * window.innerWidth,
      y: -20,
      size: Math.random() * 9 + 4,
      speedY: Math.random() * 1.1 + 0.4,
      driftX: Math.random() * 1.4 - 0.7,
      rot: Math.random() * 360,
      rotV: Math.random() * 2 - 1,
      alpha: Math.random() * 0.45 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rx: 1, ry: 0.55 + Math.random() * 0.2
    };
  }

  for (let i = 0; i < 35; i++) {
    const p = newPetal();
    p.y = Math.random() * window.innerHeight;
    petals.push(p);
  }

  setInterval(() => { if (petals.length < 55) petals.push(newPetal()); }, 400);

  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach((p, i) => {
      p.y   += p.speedY;
      p.x   += p.driftX;
      p.rot += p.rotV;
      if (p.y > canvas.height + 20) petals[i] = newPetal();

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * p.rx, p.size * p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(frame);
  })();
})();

// ── SCROLL REVEAL ──
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
})();

// ── ACTIVE NAV LINK ──
(function () {
  const links = document.querySelectorAll('.nav-links a');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
})();

// ── BACKGROUND MUSIC (persists across pages via sessionStorage) ──
// Drop your own mp3 files into the /music folder (see music/README.txt)
// and list them below — the player will move through them on every page.
const PLAYLIST = [
  'music/song1.mp3',
  'music/song2.mp3',
  'music/song3.mp3',
  'music/song4.mp3',
  'music/song5.mp3'
];

(function () {
  const STORAGE_KEY = 'gargi-music-state';

  function readState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { track: 0, time: 0, playing: false };
  }

  function writeState(state) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // Build floating player UI
  const bar = document.createElement('div');
  bar.id = 'music-bar';
  bar.innerHTML = `
    <button id="music-toggle" title="Play/pause music" aria-label="Play or pause music">▶</button>
    <span id="music-label">Tap to play our song 🎵</span>
  `;
  document.body.appendChild(bar);

  const style = document.createElement('style');
  style.textContent = `
    #music-bar {
      position: fixed; bottom: 1.2rem; right: 1.2rem; z-index: 500;
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(13,6,16,0.88);
      border: 1px solid rgba(212,168,90,0.35);
      border-radius: 30px;
      padding: 0.55rem 1.1rem 0.55rem 0.55rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.35);
      transition: transform 0.25s, border-color 0.25s;
    }
    #music-bar:hover { border-color: rgba(212,168,90,0.6); }
    #music-toggle {
      width: 34px; height: 34px; border-radius: 50%;
      border: none; background: var(--rose, #d4558a); color: #fff;
      font-size: 0.85rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.2s, transform 0.2s;
    }
    #music-toggle:hover { background: var(--rose-dark, #8b1f4e); transform: scale(1.07); }
    #music-toggle.playing { animation: music-pulse 1.6s ease-in-out infinite; }
    @keyframes music-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,85,138,0.45); }
      50% { box-shadow: 0 0 0 8px rgba(212,85,138,0); }
    }
    #music-label {
      font-family: 'Dancing Script', cursive, sans-serif;
      font-size: 0.85rem;
      color: var(--gold-light, #f5e0b8);
      white-space: nowrap;
      max-width: 160px; overflow: hidden; text-overflow: ellipsis;
    }
    @media (max-width: 640px) {
      #music-bar { bottom: 0.8rem; right: 0.8rem; padding: 0.5rem; }
      #music-label { display: none; }
    }
  `;
  document.head.appendChild(style);

  const audio = new Audio();
  audio.volume = 0.55;
  audio.loop = false;

  let state = readState();
  if (state.track == null || state.track >= PLAYLIST.length) state.track = 0;

  const toggleBtn = document.getElementById('music-toggle');
  const label = document.getElementById('music-label');

  audio.addEventListener('error', () => {
    label.textContent = 'Add mp3s to /music folder 🎵';
  });

  function loadTrack(index, resumeTime, autoplay) {
    if (!PLAYLIST.length) {
      label.textContent = 'Add songs to /music folder 🎵';
      return;
    }
    audio.src = PLAYLIST[index];
    audio.currentTime = resumeTime || 0;
    if (autoplay) {
      audio.play().catch(() => { /* needs user gesture first */ });
    }
  }

  function setPlayingUI(isPlaying) {
    toggleBtn.textContent = isPlaying ? '❚❚' : '▶';
    toggleBtn.classList.toggle('playing', isPlaying);
    label.textContent = isPlaying ? 'Our song is playing 🎶' : 'Tap to play our song 🎵';
    document.dispatchEvent(new CustomEvent('gargi-music-state', {
      detail: { track: state.track, playing: isPlaying }
    }));
  }

  loadTrack(state.track, state.time, state.playing);
  setPlayingUI(state.playing && !audio.paused);

  audio.addEventListener('play', () => { state.playing = true; writeState(state); setPlayingUI(true); });
  audio.addEventListener('pause', () => { state.playing = false; writeState(state); setPlayingUI(false); });

  audio.addEventListener('ended', () => {
    state.track = (state.track + 1) % PLAYLIST.length;
    state.time = 0;
    writeState(state);
    loadTrack(state.track, 0, true);
  });

  // Save progress periodically so navigating pages resumes near the right spot
  setInterval(() => {
    if (!audio.paused) {
      state.time = audio.currentTime;
      writeState(state);
    }
  }, 1000);

  toggleBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        label.textContent = 'Add mp3s to /music folder 🎵';
      });
    } else {
      audio.pause();
    }
  });

  // Browsers block autoplay with sound until the user interacts with the
  // page at least once. If music was playing on the previous page, the
  // very first click/tap anywhere resumes it automatically.
  if (state.playing) {
    const resumeOnce = () => {
      if (audio.paused) audio.play().catch(() => {});
      document.removeEventListener('click', resumeOnce);
      document.removeEventListener('touchstart', resumeOnce);
    };
    document.addEventListener('click', resumeOnce, { once: true });
    document.addEventListener('touchstart', resumeOnce, { once: true });
  }

  window.addEventListener('beforeunload', () => {
    state.time = audio.currentTime;
    writeState(state);
  });

  // ── Public control surface for song-list pages (e.g. songs.html) ──
  // Lets a page play a *specific* track by index when its card is clicked.
  window.gargiMusic = {
    playTrack(index) {
      if (index < 0 || index >= PLAYLIST.length) return;
      state.track = index;
      state.time = 0;
      writeState(state);
      loadTrack(index, 0, true);
    },
    pause() {
      audio.pause();
    },
    getState() {
      return { track: state.track, playing: !audio.paused };
    }
  };
})();

// ── FIREWORKS ──
function launchFireworks(canvasId, duration) {
  const fw = document.getElementById(canvasId);
  if (!fw) return;
  fw.style.display = 'block';
  fw.width  = window.innerWidth;
  fw.height = window.innerHeight;
  const fctx = fw.getContext('2d');
  let parts   = [];
  const COLS  = ['#d4558a','#f9d0e4','#d4a85a','#ffffff','#fbd5e8','#f0b8ce'];
  let bursts  = 0;
  const maxB  = Math.floor((duration || 4000) / 350);

  function burst() {
    if (bursts >= maxB) return;
    bursts++;
    const x = 0.2 * fw.width + Math.random() * 0.6 * fw.width;
    const y = 0.1 * fw.height + Math.random() * 0.5 * fw.height;
    for (let i = 0; i < 70; i++) {
      const angle = (Math.PI * 2 / 70) * i;
      const spd   = Math.random() * 6 + 2;
      parts.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd, alpha: 1,
        color: COLS[Math.floor(Math.random() * COLS.length)], size: Math.random()*3+1 });
    }
    setTimeout(burst, 350);
  }
  burst();

  (function draw() {
    fctx.fillStyle = 'rgba(13,6,16,0.18)';
    fctx.fillRect(0, 0, fw.width, fw.height);
    parts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.alpha -= 0.011;
      if (p.alpha <= 0) { parts.splice(i, 1); return; }
      fctx.globalAlpha = p.alpha;
      fctx.fillStyle = p.color;
      fctx.beginPath();
      fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fctx.fill();
    });
    fctx.globalAlpha = 1;
    if (parts.length > 0 || bursts < maxB) requestAnimationFrame(draw);
    else setTimeout(() => { fw.style.display = 'none'; }, 600);
  })();
}
