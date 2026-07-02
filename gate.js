// ── SITE GATE ──
// Shows lock screen ONCE per session (not on every page navigation).
// Code: 1304
// Uses sessionStorage — clears when browser/tab is closed.

(function () {
  const GATE_CODE = '1304';
  const SESSION_KEY = 'gargi-unlocked';

  // If already unlocked this session, skip gate entirely
  try {
    if (sessionStorage.getItem(SESSION_KEY) === 'yes') return;
  } catch(e) {}

  // Hide page immediately until gate is dismissed
  document.documentElement.style.visibility = 'hidden';

  document.addEventListener('DOMContentLoaded', buildGate);
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
        overflow: hidden;
      }
      #site-gate .gate-icon { font-size: 3.2rem; margin-bottom: 1rem; animation: gfloat 3s ease-in-out infinite; }
      @keyframes gfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      #site-gate h1 { font-family:'Playfair Display',Georgia,serif; color:#fff; font-size:clamp(1.6rem,5vw,2.4rem); margin-bottom:0.5rem; }
      #site-gate h1 span { color:#d4558a; }
      #site-gate .gate-sub { font-family:'Playfair Display',Georgia,serif; font-style:italic; color:#9a6a7a; font-size:0.95rem; max-width:340px; margin-bottom:2rem; line-height:1.7; }
      #site-gate .gate-code-wrap { background:rgba(255,255,255,0.03); border:1px solid rgba(212,168,90,0.25); border-radius:20px; padding:1.6rem 2rem; max-width:300px; width:100%; }
      #site-gate .gate-code-label { font-size:0.68rem; letter-spacing:2px; text-transform:uppercase; color:#9a6a7a; display:block; margin-bottom:0.9rem; }
      #site-gate .gate-dots { display:flex; justify-content:center; gap:0.7rem; margin-bottom:1.2rem; }
      #site-gate .gate-dot { width:14px; height:14px; border-radius:50%; border:1.5px solid rgba(212,168,90,0.4); background:transparent; transition:all 0.3s; }
      #site-gate .gate-dot.filled { background:#d4a85a; border-color:#d4a85a; box-shadow:0 0 8px rgba(212,168,90,0.4); }
      #site-gate .gate-numpad { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; max-width:210px; margin:0 auto; }
      #site-gate .gnbtn { aspect-ratio:1; border-radius:50%; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:#fff; font-size:1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; font-family:'Lato',sans-serif; }
      #site-gate .gnbtn:hover { background:rgba(212,168,90,0.12); border-color:rgba(212,168,90,0.4); }
      #site-gate .gnbtn:active { transform:scale(0.92); }
      #site-gate .gnbtn.gzero { grid-column:2; }
      #site-gate .gnbtn.gdel { font-size:1.1rem; color:#9a6a7a; }
      #site-gate .gate-error { color:#d4558a; font-size:0.78rem; margin-top:0.7rem; min-height:1.1rem; font-style:italic; }
      #site-gate.gate-shake { animation:gshake 0.4s ease; }
      @keyframes gshake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
    `;
    document.head.appendChild(style);

    const gate = document.createElement('div');
    gate.id = 'site-gate';
    gate.innerHTML = `
      <span class="gate-icon">🔒</span>
      <h1>Sirf <span>Teri</span> Liye 🌸</h1>
      <p class="gate-sub">"Yeh page ek khaas insaan ke liye bana hai — code daalo aur andar aao."</p>
      <div class="gate-code-wrap">
        <span class="gate-code-label">Enter the secret code</span>
        <div class="gate-dots">
          <div class="gate-dot" id="gd0"></div>
          <div class="gate-dot" id="gd1"></div>
          <div class="gate-dot" id="gd2"></div>
          <div class="gate-dot" id="gd3"></div>
        </div>
        <div class="gate-numpad" id="gate-numpad">
          <button class="gnbtn" data-n="1">1</button>
          <button class="gnbtn" data-n="2">2</button>
          <button class="gnbtn" data-n="3">3</button>
          <button class="gnbtn" data-n="4">4</button>
          <button class="gnbtn" data-n="5">5</button>
          <button class="gnbtn" data-n="6">6</button>
          <button class="gnbtn" data-n="7">7</button>
          <button class="gnbtn" data-n="8">8</button>
          <button class="gnbtn" data-n="9">9</button>
          <button class="gnbtn gzero" data-n="0">0</button>
          <button class="gnbtn gdel" data-n="del">⌫</button>
        </div>
        <p class="gate-error" id="gate-error"></p>
      </div>
    `;
    document.body.appendChild(gate);
    document.documentElement.style.visibility = 'visible';

    let entered = '';

    function updateDots() {
      for (let i = 0; i < 4; i++) {
        const dot = document.getElementById('gd' + i);
        if (dot) dot.classList.toggle('filled', i < entered.length);
      }
    }

    function checkGateCode() {
      if (entered === GATE_CODE) {
        try { sessionStorage.setItem(SESSION_KEY, 'yes'); } catch(e) {}
        gate.style.transition = 'opacity 0.5s';
        gate.style.opacity = '0';
        setTimeout(() => gate.remove(), 550);
      } else {
        gate.classList.add('gate-shake');
        document.getElementById('gate-error').textContent = '✗ Galat code — phir try karo 🙈';
        setTimeout(() => {
          entered = '';
          updateDots();
          gate.classList.remove('gate-shake');
          document.getElementById('gate-error').textContent = '';
        }, 1000);
      }
    }

    gate.querySelectorAll('.gnbtn').forEach(btn => {
      btn.addEventListener('click', function() {
        const n = this.dataset.n;
        if (n === 'del') {
          entered = entered.slice(0, -1);
          document.getElementById('gate-error').textContent = '';
        } else if (entered.length < 4) {
          entered += n;
        }
        updateDots();
        if (entered.length === 4) {
          setTimeout(checkGateCode, 150);
        }
      });
    });
  }
})();
