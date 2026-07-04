'use strict';

(function () {

  /* ─── AGE CONFIG ─────────────────────────────────────────────────── */
  const AGE_CFG = {
    tiny:  { cell: 42, cols: 9,  rows: 7, speed: 500, wrap: true,  decoys: 1 },
    child: { cell: 38, cols: 10, rows: 8, speed: 390, wrap: true,  decoys: 2 },
    teen:  { cell: 34, cols: 11, rows: 8, speed: 275, wrap: false, decoys: 2 },
    adult: { cell: 30, cols: 12, rows: 9, speed: 215, wrap: false, decoys: 3 },
  };

  const STR = {
    en: { ready:'Get Ready!', spell:'Spell', build:'Build', round:'Round', start:'Start ▶', cont:'Continue →', hint:'Arrows / swipe / buttons. Grab the glowing target!', combo2:'x2 Combo!', combo3:'🔥 On Fire!', combo5:'⚡ Unstoppable!' },
    ru: { ready:'Приготовься!', spell:'Собери слово', build:'Собери фразу', round:'Раунд', start:'Старт ▶', cont:'Дальше →', hint:'Стрелки / свайп / кнопки. Хватай светящуюся цель!', combo2:'x2 Комбо!', combo3:'🔥 В огне!', combo5:'⚡ Неудержим!' },
    de: { ready:'Fertig!', spell:'Buchstabiere', build:'Bilde', round:'Runde', start:'Start ▶', cont:'Weiter →', hint:'Pfeile / Wischen / Tasten. Schnapp das leuchtende Ziel!', combo2:'x2 Kombo!', combo3:'🔥 Brennt!', combo5:'⚡ Unaufhaltbar!' },
    es: { ready:'¡Listo!', spell:'Deletrea', build:'Construye', round:'Ronda', start:'Comenzar ▶', cont:'Continuar →', hint:'Flechas / desliza / botones. ¡Atrapa el objetivo!', combo2:'¡x2 Combo!', combo3:'🔥 ¡En llamas!', combo5:'⚡ ¡Imparable!' },
    fr: { ready:'Prêt !', spell:'Épelle', build:'Construis', round:'Manche', start:'Commencer ▶', cont:'Continuer →', hint:'Flèches / glisse / boutons. Attrape la cible !', combo2:'x2 Combo !', combo3:'🔥 En feu !', combo5:'⚡ Inarrêtable !' },
    hi: { ready:'तैयार!', spell:'शब्द बनाओ', build:'वाक्य बनाओ', round:'राउंड', start:'शुरू ▶', cont:'आगे →', hint:'तीर / स्वाइप / बटन। चमकते लक्ष्य को पकड़ो!', combo2:'x2 कॉम्बो!', combo3:'🔥 जोश में!', combo5:'⚡ अजेय!' },
    id: { ready:'Siap!', spell:'Eja', build:'Buat', round:'Babak', start:'Mulai ▶', cont:'Lanjutkan →', hint:'Panah / gesek / tombol. Ambil target!', combo2:'x2 Kombo!', combo3:'🔥 Membara!', combo5:'⚡ Tak Terhentikan!' },
    pt: { ready:'Pronto!', spell:'Soletrar', build:'Construir', round:'Rodada', start:'Iniciar ▶', cont:'Continuar →', hint:'Setas / deslize / botões. Pegue o alvo!', combo2:'x2 Combo!', combo3:'🔥 Em chamas!', combo5:'⚡ Imparável!' },
    tr: { ready:'Hazır!', spell:'Yaz', build:'İnşa Et', round:'Tur', start:'Başla ▶', cont:'Devam →', hint:'Oklar / kaydır / düğmeler. Parlayan hedefi yakala!', combo2:'x2 Kombo!', combo3:'🔥 Alev aldı!', combo5:'⚡ Durdurulamaz!' },
    vi: { ready:'Sẵn sàng!', spell:'Đánh vần', build:'Xây dựng', round:'Vòng', start:'Bắt đầu ▶', cont:'Tiếp tục →', hint:'Mũi tên / vuốt / nút. Bắt mục tiêu sáng!', combo2:'x2 Combo!', combo3:'🔥 Bốc lửa!', combo5:'⚡ Không thể cản!' },
  };
  function t(lang, key) { return (STR[lang] || STR.en)[key] || key; }

  /* ─── AUDIO ENGINE ────────────────────────────────────────────────── */
  let _actx = null;
  function ac() {
    if (!_actx) { try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} }
    if (_actx && _actx.state === 'suspended') _actx.resume();
    return _actx;
  }

  function tone(freq, start, dur, type, vol) {
    const ctx = ac(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.04);
  }

  const sndPop    = () => { tone(880, 0, 0.07, 'sine', 0.18); tone(1320, 0.03, 0.06, 'triangle', 0.12); };
  const sndError  = () => { tone(200, 0, 0.14, 'sawtooth', 0.13); tone(130, 0.10, 0.18, 'sawtooth', 0.10); };
  const sndStreak = () => { tone(1047, 0, 0.06, 'sine', 0.20); tone(1319, 0.05, 0.06, 'sine', 0.18); };
  const sndWin    = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.20, 'triangle', 0.16));

  /* ─── HAPTICS ─────────────────────────────────────────────────────── */
  const haptic = (p) => navigator.vibrate && navigator.vibrate(p);

  /* ─── HELPERS ─────────────────────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * Math.min(1, Math.max(0, t)); }

  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function cssv(name, fb) {
    const v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fb;
  }

  /* ─── PARTICLES ───────────────────────────────────────────────────── */
  function spawnBurst(particles, cx, cy, color, count) {
    count = count || 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.9;
      const spd   = 1.8 + Math.random() * 3.2;
      particles.push({ x: cx, y: cy, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, alpha: 1, sz: 2 + Math.random() * 4, color });
    }
  }

  function tickParticles(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.90; p.vy *= 0.90;
      p.alpha -= 0.028;
      if (p.alpha <= 0) arr.splice(i, 1);
    }
  }

  function drawParticles(ctx, arr) {
    ctx.save();
    arr.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowBlur  = 8; ctx.shadowColor = p.color;
      ctx.fillStyle   = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore(); ctx.shadowBlur = 0;
  }

  /* ─── FLOATING TEXT ───────────────────────────────────────────────── */
  function spawnFloat(floats, x, y, text, color) {
    floats.push({ x, y, text, color: color || '#ffd700', alpha: 1.3, vy: -1.4 });
  }

  function tickFloats(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      arr[i].y += arr[i].vy; arr[i].alpha -= 0.024;
      if (arr[i].alpha <= 0) arr.splice(i, 1);
    }
  }

  function drawFloats(ctx, arr, cell) {
    ctx.save(); ctx.textAlign = 'center';
    arr.forEach(f => {
      const a = Math.min(1, Math.max(0, f.alpha));
      ctx.globalAlpha = a;
      ctx.font = `900 ${Math.round(cell * 0.7)}px system-ui, sans-serif`;
      ctx.shadowBlur = 14; ctx.shadowColor = f.color;
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    });
    ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  /* ═══════════════════════════════════════════════════════════════════
     MAIN GAME CLASS
  ═══════════════════════════════════════════════════════════════════ */
  function KatSnake(container, opts) {
    const age    = AGE_CFG[opts.age] ? opts.age : 'child';
    const cfg    = AGE_CFG[age];
    const lang   = opts.lang || 'en';
    const rounds = opts.rounds || [];

    let alive   = true;
    let roundIdx = 0;
    let rafId   = null;
    let els     = {};
    let cleanupFns = [];
    let currentRound = null;

    // Visual effects state
    let particles  = [];
    let floats     = [];
    let hitStopEnd = 0;
    let flashEnd   = 0;

    // Game logic state
    let dir, pendingDir, snake, prevSnake, lastMoveTs, target, decoyList, tick, sess;
    let streak = 0;

    const VEC = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };

    function on(el, ev, fn, o2) { el.addEventListener(ev, fn, o2); cleanupFns.push(() => el.removeEventListener(ev, fn, o2)); }

    function teardown() {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(tick);
      cleanupFns.forEach(fn => { try { fn(); } catch (_) {} });
      cleanupFns = [];
    }
    container.__katSnakeTeardown && container.__katSnakeTeardown();
    container.__katSnakeTeardown = teardown;

    buildFrame();
    rafId = requestAnimationFrame(renderLoop);
    playRound(0);

    function renderLoop() {
      if (!alive) return;
      draw();
      rafId = requestAnimationFrame(renderLoop);
    }

    /* ─── DOM ─────────────────────────────────────────────────────── */
    function buildFrame() {
      container.innerHTML = `
        <div class="snake-hud">
          <div class="game-score-box">
            <span class="game-score-num" id="sk-score">0</span>
            <span class="game-score-lbl">DONE</span>
          </div>
          <div class="game-round-info" id="sk-round"></div>
          <div class="game-score-box">
            <span class="game-score-num" id="sk-miss">0</span>
            <span class="game-score-lbl">OOPS</span>
          </div>
        </div>
        <div class="snake-progress" id="sk-progress"></div>
        <div class="snake-canvas-wrap">
          <canvas id="sk-canvas"></canvas>
          <div class="snake-overlay hidden" id="sk-overlay"></div>
        </div>
        <div class="snake-dpad" id="sk-dpad">
          <button class="sk-dbtn sk-dbtn-up"    data-dir="up"    aria-label="Up">▲</button>
          <button class="sk-dbtn sk-dbtn-left"  data-dir="left"  aria-label="Left">◀</button>
          <button class="sk-dbtn sk-dbtn-right" data-dir="right" aria-label="Right">▶</button>
          <button class="sk-dbtn sk-dbtn-down"  data-dir="down"  aria-label="Down">▼</button>
        </div>
        <p class="snake-hint">${t(lang, 'hint')}</p>`;

      els.score    = container.querySelector('#sk-score');
      els.miss     = container.querySelector('#sk-miss');
      els.roundLbl = container.querySelector('#sk-round');
      els.progress = container.querySelector('#sk-progress');
      els.canvas   = container.querySelector('#sk-canvas');
      els.overlay  = container.querySelector('#sk-overlay');
      els.ctx      = els.canvas.getContext('2d');

      els.canvas.width  = cfg.cols * cfg.cell;
      els.canvas.height = cfg.rows * cfg.cell;
      els.canvas.style.width = '100%';
      els.canvas.style.maxWidth = (cfg.cols * cfg.cell) + 'px';

      container.querySelectorAll('.sk-dbtn').forEach(btn =>
        on(btn, 'pointerdown', (e) => { e.preventDefault(); setDir(btn.dataset.dir); })
      );

      on(document, 'keydown', (e) => {
        const map = { ArrowUp:'up', w:'up', W:'up', ArrowDown:'down', s:'down', S:'down', ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right' };
        if (map[e.key]) { e.preventDefault(); setDir(map[e.key]); }
      });

      let tx0 = 0, ty0 = 0;
      on(els.canvas, 'touchstart', (e) => { const t0 = e.changedTouches[0]; tx0 = t0.clientX; ty0 = t0.clientY; }, { passive: true });
      on(els.canvas, 'touchend', (e) => {
        const t0 = e.changedTouches[0];
        const dx = t0.clientX - tx0, dy = t0.clientY - ty0;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left');
        else setDir(dy > 0 ? 'down' : 'up');
      }, { passive: true });
    }

    /* ─── INPUT ───────────────────────────────────────────────────── */
    function setDir(name) {
      const v = VEC[name];
      if (!v || !sess) return;
      if (snake && snake.length > 1 && v.x === -dir.x && v.y === -dir.y) return;
      if (pendingDir !== v) haptic([15]);
      pendingDir = v;
    }

    /* ─── ROUNDS ──────────────────────────────────────────────────── */
    function playRound(idx) {
      roundIdx = idx;
      const round = rounds[idx];
      if (!round) { finishAll(); return; }
      els.roundLbl.textContent = `${t(lang, 'round')} ${idx + 1} / ${rounds.length}`;
      renderProgress(round, 0);
      showIntro(round, () => runRound(round));
    }

    function renderProgress(round, n) {
      const label = round.unit === 'letter' ? t(lang, 'spell') : t(lang, 'build');
      const chunks = round.targets.map((tok, i) => i < n ? tok : '·'.repeat(Math.max(1, Math.min(tok.length, 3))));
      els.progress.innerHTML = `<span class="snake-progress-label">${label}:</span> ` +
        chunks.map((c, i) => `<span class="snake-chip ${i < n ? 'done' : ''}">${c}</span>`).join(' ');
    }

    function showIntro(round, cb) {
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card" style="backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);">
          <p class="snake-overlay-kicker">${t(lang, 'ready')}</p>
          <p class="snake-overlay-target">${round.targets.join(round.unit === 'letter' ? ' ' : '  ')}</p>
          <button class="btn-primary" id="sk-start-btn">${t(lang, 'start')}</button>
        </div>`;
      els.overlay.querySelector('#sk-start-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); cb();
      }, { once: true });
    }

    function emptyCells(occ) {
      const cells = [];
      for (let x = 0; x < cfg.cols; x++)
        for (let y = 0; y < cfg.rows; y++)
          if (!occ.has(x + ',' + y)) cells.push({ x, y });
      return cells;
    }

    function freeCell(occ) {
      const cells = emptyCells(occ);
      return cells.length ? cells[Math.floor(Math.random() * cells.length)] : { x: 0, y: 0 };
    }

    function spawnFood(round) {
      const occ = new Set(snake.map(s => s.x + ',' + s.y));
      target = { ...freeCell(occ), text: round.targets[sess.collected] };
      occ.add(target.x + ',' + target.y);
      const pool = round.decoys || [];
      decoyList = [];
      const n = Math.min(cfg.decoys, pool.length);
      const used = new Set();
      while (decoyList.length < n && used.size < pool.length) {
        const w = pool[Math.floor(Math.random() * pool.length)];
        if (used.has(w)) continue; used.add(w);
        const c = freeCell(occ); decoyList.push({ ...c, text: w }); occ.add(c.x + ',' + c.y);
      }
    }

    function runRound(round) {
      currentRound = round;
      dir = { x: 1, y: 0 }; pendingDir = dir;
      const cx = Math.floor(cfg.cols / 2), cy = Math.floor(cfg.rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      prevSnake = snake.map(s => ({ ...s }));
      lastMoveTs = Date.now();
      streak = 0; particles = []; floats = [];
      sess = { collected: 0, misses: 0, speed: Math.max(cfg.speed * 0.55, cfg.speed - roundIdx * 14) };
      spawnFood(round);
      loop(round);
    }

    /* ─── GAME LOOP ───────────────────────────────────────────────── */
    function loop(round) {
      clearTimeout(tick);
      if (!alive) return;

      // Save prev positions for interpolation
      // Each body segment[i] will move to where segment[i-1] was
      const snapPrev = snake.map(s => ({ ...s }));

      dir = pendingDir;
      const hx = snake[0].x + dir.x, hy = snake[0].y + dir.y;
      let nx = hx, ny = hy;

      if (cfg.wrap) {
        nx = (hx + cfg.cols) % cfg.cols;
        ny = (hy + cfg.rows) % cfg.rows;
      } else if (hx < 0 || hx >= cfg.cols || hy < 0 || hy >= cfg.rows) {
        doFail(round); return;
      }

      if (!cfg.wrap && snake.some((s, i) => i > 0 && s.x === nx && s.y === ny)) {
        doFail(round); return;
      }

      snake.unshift({ x: nx, y: ny });
      lastMoveTs = Date.now();

      // prevSnake: for each NEW segment index i, its visual "from" position
      // new snake[0] came from snapPrev[0]; new snake[i>0] is same as snapPrev[i-1]
      prevSnake = [snapPrev[0], ...snapPrev];

      let ate = false;
      if (nx === target.x && ny === target.y) {
        ate = true;
        sess.collected++;
        streak++;

        // Hit-stop — freeze snake render 45ms for impact feel
        hitStopEnd = Date.now() + 45;
        sndPop(); haptic([50]);

        // Particle burst at eaten cell center
        spawnBurst(particles, nx * cfg.cell + cfg.cell / 2, ny * cfg.cell + cfg.cell / 2, '#00ff88');

        // Floating combo label
        if (streak === 2) spawnFloat(floats, nx * cfg.cell + cfg.cell / 2, ny * cfg.cell, t(lang, 'combo2'), '#ffd700');
        else if (streak === 3) { spawnFloat(floats, nx * cfg.cell + cfg.cell / 2, ny * cfg.cell, t(lang, 'combo3'), '#ff9500'); sndStreak(); }
        else if (streak >= 5 && streak % 5 === 0) { spawnFloat(floats, nx * cfg.cell + cfg.cell / 2, ny * cfg.cell, t(lang, 'combo5'), '#22d3ee'); sndStreak(); }

        onProgress(round);
      } else {
        const di = decoyList.findIndex(d => d.x === nx && d.y === ny);
        if (di >= 0) {
          sess.misses++; streak = 0;
          els.miss.textContent = sess.misses;
          sndError(); haptic([50, 30, 50]);
          flashEnd = Date.now() + 220;
          spawnBurst(particles, nx * cfg.cell + cfg.cell / 2, ny * cfg.cell + cfg.cell / 2, '#f87171', 12);
          decoyList.splice(di, 1);
          if (snake.length > 3) snake.pop();
        }
      }

      if (!ate) { snake.pop(); prevSnake.pop(); }
      if (sess.collected >= round.targets.length) { roundComplete(round); return; }

      const speedMult = Math.max(0.78, 1 - streak * 0.022);
      tick = setTimeout(() => loop(round), sess.speed * speedMult);
    }

    function onProgress(round) {
      renderProgress(round, sess.collected);
      if (sess.collected < round.targets.length) spawnFood(round);
    }

    function doFail(round) {
      sndError(); haptic([100, 50, 100]); streak = 0;
      flashEnd = Date.now() + 320;
      // Scatter death particles along body
      (snake || []).forEach((seg, i) => {
        if (i % 2 === 0) spawnBurst(particles, seg.x * cfg.cell + cfg.cell / 2, seg.y * cfg.cell + cfg.cell / 2, '#f87171', 6);
      });
      const cx = Math.floor(cfg.cols / 2), cy = Math.floor(cfg.rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      prevSnake = snake.map(s => ({ ...s }));
      dir = { x: 1, y: 0 }; pendingDir = dir;
      lastMoveTs = Date.now();
      spawnFood(round);
      tick = setTimeout(() => loop(round), sess.speed);
    }

    function roundComplete(round) {
      clearTimeout(tick); streak = 0;
      sndWin(); haptic([50, 30, 100]);
      els.score.textContent = roundIdx + 1;
      if (opts.onRoundComplete) opts.onRoundComplete(roundIdx, rounds.length, sess.misses);
      const wordDisplay = round.unit === 'letter' ? round.targets.join('') : round.targets.join(' ');
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card" style="backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);">
          <p class="snake-word-reveal snake-word-reveal-${round.unit}">${wordDisplay}</p>
          <p class="snake-overlay-icon">${round.icon || '💡'}</p>
          <p class="snake-overlay-fact">${round.fact || ''}</p>
          <button class="btn-primary" id="sk-cont-btn">${t(lang, 'cont')}</button>
        </div>`;
      els.overlay.querySelector('#sk-cont-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); playRound(roundIdx + 1);
      }, { once: true });
    }

    function finishAll() { teardown(); if (opts.onAllDone) opts.onAllDone(); }

    /* ─── RENDER ──────────────────────────────────────────────────── */
    function draw() {
      if (!els.ctx) return;
      const ctx  = els.ctx;
      const cell = cfg.cell;
      const W    = els.canvas.width, H = els.canvas.height;
      const now  = Date.now();

      const CYAN = cssv('--accent',  '#22d3ee');
      const PURP = cssv('--accent2', '#a855f7');
      const GREN = '#00ff88';
      const RED  = '#f87171';
      const BG   = cssv('--bg2', '#0d1117');

      // ── Background
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let x = cell; x < W; x += cell)
        for (let y = cell; y < H; y += cell) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
      ctx.restore();

      // Flash overlay on error
      if (now < flashEnd) {
        ctx.fillStyle = 'rgba(248,113,113,0.14)';
        ctx.fillRect(0, 0, W, H);
      }

      if (!snake || !prevSnake) {
        // Still draw particles during pre-round
        tickParticles(particles); drawParticles(ctx, particles);
        tickFloats(floats); drawFloats(ctx, floats, cell);
        return;
      }

      // Interpolation factor: 0 = just moved, 1 = about to move
      const isHitStop = now < hitStopEnd;
      const lerpT = isHitStop
        ? 1
        : Math.min(1, (now - lastMoveTs) / sess.speed);

      // ── Snake body (back to front for correct layering)
      for (let i = snake.length - 1; i >= 0; i--) {
        const cur  = snake[i];
        const prev = prevSnake[i] || cur;
        const isHead = i === 0;

        // Interpolate between prev position and current
        let fx = prev.x, fy = prev.y;
        const tx2 = cur.x, ty2 = cur.y;
        // Handle wrap-around teleport — don't lerp across the whole grid
        if (cfg.wrap) {
          if (tx2 - fx >  cfg.cols / 2) fx += cfg.cols;
          if (fx - tx2 >  cfg.cols / 2) fx -= cfg.cols;
          if (ty2 - fy >  cfg.rows / 2) fy += cfg.rows;
          if (fy - ty2 >  cfg.rows / 2) fy -= cfg.rows;
        }
        const lx = lerp(fx, tx2, lerpT) * cell;
        const ly = lerp(fy, ty2, lerpT) * cell;

        const pct  = i / Math.max(1, snake.length - 1);
        const pad  = isHead ? 1.5 : 2 + pct * 2.5;
        const size = cell - pad * 2;
        const r    = size * (isHead ? 0.42 : 0.32);

        // Glow
        const glowR = isHead ? 24 : Math.max(6, 18 - pct * 14);
        ctx.shadowBlur  = glowR;
        ctx.shadowColor = isHead ? CYAN : PURP;
        ctx.globalAlpha = Math.max(0.18, 1 - pct * 0.68);
        ctx.fillStyle   = isHead ? CYAN : PURP;

        rrect(ctx, lx + pad, ly + pad, size, size, r);
        ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;

      // Head highlight (inner bright core)
      {
        const cur  = snake[0];
        const prev = prevSnake[0] || cur;
        let fx = prev.x, fy = prev.y;
        if (cfg.wrap) {
          if (cur.x - fx > cfg.cols/2) fx += cfg.cols;
          if (fx - cur.x > cfg.cols/2) fx -= cfg.cols;
          if (cur.y - fy > cfg.rows/2) fy += cfg.rows;
          if (fy - cur.y > cfg.rows/2) fy -= cfg.rows;
        }
        const lx = lerp(fx, cur.x, lerpT) * cell;
        const ly = lerp(fy, cur.y, lerpT) * cell;
        const pad = 1.5, size = cell - pad * 2;

        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
        rrect(ctx, lx + pad + 2, ly + pad + 2, size - 4, (size - 4) * 0.38, 4);
        ctx.fill();
        ctx.restore();

        // LED eyes
        const eyeOff = cell * 0.22, eyeR = Math.max(1.5, cell * 0.09);
        const perp   = { x: -dir.y, y: dir.x };
        const ecx = lx + cell / 2 + dir.x * eyeOff;
        const ecy = ly + cell / 2 + dir.y * eyeOff;
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = '#fff'; ctx.fillStyle = '#ffffff';
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.arc(ecx + perp.x * eyeOff * side, ecy + perp.y * eyeOff * side, eyeR, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // ── Tokens
      const unit = (currentRound && currentRound.unit) || 'letter';
      const sizing = unit === 'phrase' ? { maxW: cell * 4.6, baseMult: 0.38, minFont: 7 }
                   : unit === 'word'   ? { maxW: cell * 3.2, baseMult: 0.42, minFont: 8 }
                   :                     { maxW: cell * 2.2, baseMult: 0.5,  minFont: 10 };

      if (target) drawToken(ctx, target, cell, GREN, true, sizing, now);
      (decoyList || []).forEach(d => drawToken(ctx, d, cell, RED, false, sizing, now));

      // ── Particles & floats
      tickParticles(particles); drawParticles(ctx, particles);
      tickFloats(floats);       drawFloats(ctx, floats, cell);
    }

    /* ─── TOKEN DRAW ──────────────────────────────────────────────── */
    function drawToken(ctx, tok, cell, color, glow, sizing, now) {
      const x = tok.x * cell, y = tok.y * cell;
      ctx.save();

      if (glow) {
        const pulse = 0.55 + 0.40 * Math.sin(now / 190);

        // Outer halo (lighter blend)
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.20 * pulse;
        ctx.shadowBlur = 22 + 10 * pulse; ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.68, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

        // Pulsing ring
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.28 + 0.28 * pulse;
        ctx.shadowBlur = 10; ctx.shadowColor = color;
        ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.46, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Text
      ctx.fillStyle = color;
      ctx.globalAlpha = glow ? 1 : 0.48;
      ctx.shadowBlur = glow ? 14 : 3;
      ctx.shadowColor = color;

      let fs = Math.round(cell * sizing.baseMult);
      ctx.font = `800 ${fs}px system-ui, sans-serif`;
      while (ctx.measureText(tok.text).width > sizing.maxW && fs > sizing.minFont) {
        fs--; ctx.font = `800 ${fs}px system-ui, sans-serif`;
      }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tok.text, x + cell / 2, y + cell / 2);
      ctx.restore();
    }

  } // end KatSnake

  window.KAT_Snake = {
    start(container, opts) { return new KatSnake(container, opts); },
  };
})();
