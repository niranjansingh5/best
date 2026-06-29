// ── SITE GATE ──
// Locks every page behind a countdown + secret code until midnight,
// 17 July 2026. Include this script FIRST, before anything else in
// <head> or right at the top of <body>, on every page.
//
// Bypass code: 1304 (same meaning as the "Another Chance" page — 13 April).
// Once entered correctly, the bypass is remembered on this device
// (localStorage) so the same person doesn't have to retype it every visit.

(function () {
  const UNLOCK_AT = new Date(2026, 6, 17, 0, 0, 0); // midnight, 17 July 2026
  const BYPASS_CODE = '1304';
  const BYPASS_KEY = 'gargi-gate-bypass';

  function isUnlockedByTime() {
    return new Date() >= UNLOCK_AT;
  }

  function hasBypass() {
    try { return localStorage.getItem(BYPASS_KEY) === 'true'; } catch (e) { return false; }
  }

  function setBypass() {
    try { localStorage.setItem(BYPASS_KEY, 'true'); } catch (e) {}
  }

  // If already unlocked (by time or by saved bypass), do nothing —
  // the page loads completely normally.
  if (isUnlockedByTime() || hasBypass()) return;

  // ── Otherwise: hide the page immediately and show the gate ──
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', buildGate);
  // Fallback in case DOMContentLoaded already fired by the time this runs
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    buildGate();
  }

  function buildGate() {
    if (document.getElementById('site-gate')) return;

    const style = document.createElement('style');
    style.textContent = `
      #site-gate {
        position: fixed; inset: 0; z-index: 99999;
        background: radial-gradient(ellipse at 50% 55%, #1f0920 0%, #0d0610 70%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        text-align: center; padding: 2rem;
        font-family: 'Lato', sans-serif;
      }
      #site-gate .gate-icon {
        font-size: 3.2rem; margin-bottom: 1rem;
        animation: gate-float 3s ease-in-out infinite;
      }
      @keyframes gate-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      #site-gate h1 {
        font-family: 'Playfair Display', Georgia, serif;
        color: #fff; font-size: clamp(1.6rem, 5vw, 2.4rem);
        margin-bottom: 0.5rem; line-height: 1.25;
      }
      #site-gate h1 span { color: #d4558a; }
      #site-gate .gate-sub {
        font-family: 'Playfair Display', Georgia, serif;
        font-style: italic; color: #9a6a7a;
        font-size: 0.95rem; max-width: 380px; margin-bottom: 2rem; line-height: 1.7;
      }
      #site-gate .gate-countdown {
        display: flex; gap: 0.7rem; justify-content: center; flex-wrap: wrap;
        margin-bottom: 2.2rem;
      }
      #site-gate .gate-box {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(212,85,138,0.18);
        border-radius: 16px; padding: 0.9rem 0.4rem; min-width: 70px; text-align: center;
      }
      #site-gate .gate-num {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1.5rem, 4vw, 2rem); color: #f9d0e4; display: block;
        font-variant-numeric: tabular-nums;
      }
      #site-gate .gate-unit {
        font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase;
        color: #9a6a7a; display: block; margin-top: 0.3rem;
      }
      #site-gate .gate-code-wrap {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(212,168,90,0.25);
        border-radius: 20px; padding: 1.6rem 2rem; max-width: 320px; width: 100%;
      }
      #site-gate .gate-code-label {
        font-size: 0.68rem; letter-spacing: 2px; text-transform: uppercase;
        color: #9a6a7a; display: block; margin-bottom: 0.9rem;
      }
      #site-gate .gate-dots { display: flex; justify-content: center; gap: 0.7rem; margin-bottom: 1.2rem; }
      #site-gate .gate-dot {
        width: 14px; height: 14px; border-radius: 50%;
        border: 1.5px solid rgba(212,168,90,0.4); background: transparent; transition: all 0.3s;
      }
      #site-gate .gate-dot.filled {
        background: #d4a85a; border-color: #d4a85a; box-shadow: 0 0 8px rgba(212,168,90,0.4);
      }
      #site-gate .gate-numpad {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;
        max-width: 220px; margin: 0 auto;
      }
      #site-gate .gate-num-btn {
        aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04); color: #fff; font-size: 1rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      }
      #site-gate .gate-num-btn:hover { background: rgba(212,168,90,0.12); border-color: rgba(212,168,90,0.4); }
      #site-gate .gate-num-btn.zero { grid-column: 2; }
      #site-gate .gate-num-btn.del { font-size: 1.1rem; color: #9a6a7a; }
      #site-gate .gate-error {
        color: #d4558a; font-size: 0.78rem; margin-top: 0.7rem; min-height: 1.1rem; font-style: italic;
      }
      #site-gate.gate-error-shake { animation: gate-shake 0.4s ease; }
      @keyframes gate-shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); } 40% { transform: translateX(8px); }
        60% { transform: translateX(-6px); } 80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'site-gate';
    gate.innerHTML = `
      <span class="gate-icon">🔒</span>
      <h1>Not Yet, <span>Patience</span> 🌸</h1>
      <p class="gate-sub">"Yeh page khulega uss raat — jab Gargi ki birthday shuru hogi."</p>
      <div class="gate-countdown">
        <div class="gate-box"><span class="gate-num" id="gate-days">--</span><span class="gate-unit">Days</span></div>
        <div class="gate-box"><span class="gate-num" id="gate-hours">--</span><span class="gate-unit">Hours</span></div>
        <div class="gate-box"><span class="gate-num" id="gate-mins">--</span><span class="gate-unit">Mins</span></div>
        <div class="gate-box"><span class="gate-num" id="gate-secs">--</span><span class="gate-unit">Secs</span></div>
      </div>
      <div class="gate-code-wrap" id="gate-code-wrap">
        <span class="gate-code-label">Have the code?</span>
        <div class="gate-dots">
          <div class="gate-dot" id="gd0"></div>
          <div class="gate-dot" id="gd1"></div>
          <div class="gate-dot" id="gd2"></div>
          <div class="gate-dot" id="gd3"></div>
        </div>
        <div class="gate-numpad">
          <button class="gate-num-btn" data-n="1">1</button>
          <button class="gate-num-btn" data-n="2">2</button>
          <button class="gate-num-btn" data-n="3">3</button>
          <button class="gate-num-btn" data-n="4">4</button>
          <button class="gate-num-btn" data-n="5">5</button>
          <button class="gate-num-btn" data-n="6">6</button>
          <button class="gate-num-btn" data-n="7">7</button>
          <button class="gate-num-btn" data-n="8">8</button>
          <button class="gate-num-btn" data-n="9">9</button>
          <button class="gate-num-btn zero" data-n="0">0</button>
          <button class="gate-num-btn del" data-n="del">⌫</button>
        </div>
        <p class="gate-error" id="gate-error"></p>
      </div>
    `;
    document.body.appendChild(gate);
    document.documentElement.style.visibility = 'visible';

    // Countdown ticking
    function pad(n) { return String(n).padStart(2, '0'); }
    function tick() {
      const diff = UNLOCK_AT - new Date();
      if (diff <= 0) { unlockAndReveal(); return; }
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const secs  = Math.floor((diff % 60000) / 1000);
      document.getElementById('gate-days').textContent  = days;
      document.getElementById('gate-hours').textContent = pad(hours);
      document.getElementById('gate-mins').textContent  = pad(mins);
      document.getElementById('gate-secs').textContent  = pad(secs);
    }
    tick();
    const gateTimer = setInterval(tick, 1000);

    // Code entry
    let entered = '';
    function updateDots() {
      for (let i = 0; i < 4; i++) {
        document.getElementById('gd' + i).classList.toggle('filled', i < entered.length);
      }
    }
    function checkCode() {
      if (entered === BYPASS_CODE) {
        setBypass();
        clearInterval(gateTimer);
        unlockAndReveal();
      } else {
        gate.classList.add('gate-error-shake');
        document.getElementById('gate-error').textContent = '✗ Galat code';
        setTimeout(() => {
          entered = '';
          updateDots();
          gate.classList.remove('gate-error-shake');
          document.getElementById('gate-error').textContent = '';
        }, 1000);
      }
    }
    gate.querySelectorAll('.gate-num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = btn.dataset.n;
        if (n === 'del') {
          entered = entered.slice(0, -1);
        } else if (entered.length < 4) {
          entered += n;
        }
        updateDots();
        document.getElementById('gate-error').textContent = '';
        if (entered.length === 4) setTimeout(checkCode, 150);
      });
    });

    function unlockAndReveal() {
      gate.style.transition = 'opacity 0.5s';
      gate.style.opacity = '0';
      setTimeout(() => gate.remove(), 550);
    }
  }
})();
