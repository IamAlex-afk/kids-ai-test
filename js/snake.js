/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  snake.js
   Educational snake game: eats letters/words/phrases in order to spell
   a word / build a sentence, while avoiding decoy ("bad data") tokens.
   Difficulty (unit size, speed, grid, walls) scales with age group.
   Pure Canvas 2D, no dependencies. Exposes window.KAT_Snake.start().
═══════════════════════════════════════════════════════════════════ */

'use strict';

(function () {

  // Younger kids (tiny/child) get wrap-around edges — no hard walls, so a
  // wrong turn never feels like a punishment. Walls become real once
  // reflexes catch up (teen/adult), matching how casual vs. classic modern
  // snake games gate difficulty.
  const AGE_CFG = {
    tiny:  { cell: 42, cols: 9,  rows: 7, speed: 480, wrap: true,  decoys: 1 },
    child: { cell: 38, cols: 10, rows: 8, speed: 380, wrap: true,  decoys: 2 },
    teen:  { cell: 34, cols: 11, rows: 8, speed: 270, wrap: false, decoys: 2 },
    adult: { cell: 30, cols: 12, rows: 9, speed: 210, wrap: false, decoys: 3 },
  };

  const STR = {
    en: { ready: 'Get Ready!', spell: 'Spell', build: 'Build', round: 'Round', start: 'Start ▶', cont: 'Continue →', hint: 'Arrows / swipe / buttons to move. Grab the glowing target — dodge the red ones!' },
    ru: { ready: 'Приготовься!', spell: 'Собери слово', build: 'Собери фразу', round: 'Раунд', start: 'Старт ▶', cont: 'Дальше →', hint: 'Стрелки / свайп / кнопки — чтобы двигаться. Хватай светящуюся цель — избегай красных!' },
    de: { ready: 'Fertig!', spell: 'Buchstabiere', build: 'Bilde', round: 'Runde', start: 'Start ▶', cont: 'Weiter →', hint: 'Pfeile / Wischen / Tasten zum Bewegen. Schnapp das leuchtende Ziel — weiche den roten aus!' },
    es: { ready: '¡Listo!', spell: 'Deletrea', build: 'Construye', round: 'Ronda', start: 'Comenzar ▶', cont: 'Continuar →', hint: 'Flechas / desliza / botones para mover. Atrapa el objetivo brillante — ¡esquiva los rojos!' },
    fr: { ready: 'Prêt !', spell: 'Épelle', build: 'Construis', round: 'Manche', start: 'Commencer ▶', cont: 'Continuer →', hint: 'Flèches / glisse / boutons pour bouger. Attrape la cible lumineuse — évite les rouges !' },
    hi: { ready: 'तैयार!', spell: 'शब्द बनाओ', build: 'वाक्य बनाओ', round: 'राउंड', start: 'शुरू ▶', cont: 'आगे →', hint: 'तीर / स्वाइप / बटन से चलो। चमकते लक्ष्य को पकड़ो — लाल से बचो!' },
    id: { ready: 'Siap!', spell: 'Eja', build: 'Buat', round: 'Babak', start: 'Mulai ▶', cont: 'Lanjutkan →', hint: 'Panah / gesek / tombol untuk bergerak. Ambil target bercahaya — hindari yang merah!' },
    pt: { ready: 'Pronto!', spell: 'Soletrar', build: 'Construir', round: 'Rodada', start: 'Iniciar ▶', cont: 'Continuar →', hint: 'Setas / deslize / botões para mover. Pegue o alvo brilhante — desvie dos vermelhos!' },
    tr: { ready: 'Hazır!', spell: 'Yaz', build: 'İnşa Et', round: 'Tur', start: 'Başla ▶', cont: 'Devam →', hint: 'Oklar / kaydır / düğmeler ile hareket et. Parlayan hedefi yakala — kırmızılardan kaç!' },
    vi: { ready: 'Sẵn sàng!', spell: 'Đánh vần', build: 'Xây dựng', round: 'Vòng', start: 'Bắt đầu ▶', cont: 'Tiếp tục →', hint: 'Mũi tên / vuốt / nút để di chuyển. Bắt mục tiêu sáng — tránh những cái đỏ!' },
  };
  function t(lang, key) { return (STR[lang] || STR.en)[key]; }

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }

  function KatSnake(container, opts) {
    const age    = AGE_CFG[opts.age] ? opts.age : 'child';
    const cfg    = AGE_CFG[age];
    const lang   = opts.lang || 'en';
    const rounds = opts.rounds || [];

    let alive = true; // instance guard — invalidated on teardown
    let roundIdx = 0;
    let cleanupFns = [];
    let els = {};

    function on(el, ev, fn, opts2) { el.addEventListener(ev, fn, opts2); cleanupFns.push(() => el.removeEventListener(ev, fn, opts2)); }

    let rafId = null, currentRound = null;
    function teardown() {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      cleanupFns.forEach(fn => { try { fn(); } catch (_) {} });
      cleanupFns = [];
    }
    container.__katSnakeTeardown && container.__katSnakeTeardown();
    container.__katSnakeTeardown = teardown;

    buildFrame();
    playRound(0);

    function renderLoop() {
      if (!alive) return;
      draw(currentRound);
      rafId = requestAnimationFrame(renderLoop);
    }
    rafId = requestAnimationFrame(renderLoop);

    /* ── DOM SCAFFOLD ─────────────────────────────────────────── */
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
        <p class="snake-hint">${t(lang, 'hint')}</p>
      `;
      els.score    = container.querySelector('#sk-score');
      els.miss     = container.querySelector('#sk-miss');
      els.roundLbl = container.querySelector('#sk-round');
      els.progress = container.querySelector('#sk-progress');
      els.canvas   = container.querySelector('#sk-canvas');
      els.overlay  = container.querySelector('#sk-overlay');
      els.ctx      = els.canvas.getContext('2d');

      els.canvas.width  = cfg.cols * cfg.cell;
      els.canvas.height = cfg.rows * cfg.cell;
      els.canvas.style.width  = '100%';
      els.canvas.style.maxWidth = (cfg.cols * cfg.cell) + 'px';

      container.querySelectorAll('.sk-dbtn').forEach(btn => {
        on(btn, 'pointerdown', (e) => { e.preventDefault(); setDir(btn.dataset.dir); });
      });

      on(document, 'keydown', (e) => {
        const map = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
        if (map[e.key]) { e.preventDefault(); setDir(map[e.key]); }
      });

      let tStartX = 0, tStartY = 0;
      on(els.canvas, 'touchstart', (e) => {
        const tt = e.changedTouches[0];
        tStartX = tt.clientX; tStartY = tt.clientY;
      }, { passive: true });
      on(els.canvas, 'touchend', (e) => {
        const tt = e.changedTouches[0];
        const dx = tt.clientX - tStartX, dy = tt.clientY - tStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left');
        else setDir(dy > 0 ? 'down' : 'up');
      }, { passive: true });
    }

    /* ── PER-ROUND STATE ──────────────────────────────────────── */
    let dir, pendingDir, snake, target, decoyList, tick, sess;

    const VEC = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

    function setDir(name) {
      const v = VEC[name];
      if (!v || !sess) return;
      // ignore reversal into itself
      if (snake.length > 1 && v.x === -dir.x && v.y === -dir.y) return;
      pendingDir = v;
    }

    function playRound(idx) {
      roundIdx = idx;
      const round = rounds[idx];
      if (!round) { finishAll(); return; }

      els.roundLbl.textContent = `${t(lang, 'round')} ${idx + 1} / ${rounds.length}`;
      renderProgress(round, 0);
      showIntro(round, () => runRound(round));
    }

    function renderProgress(round, collectedCount) {
      const label = round.unit === 'letter' ? t(lang, 'spell') : t(lang, 'build');
      const chunks = round.targets.map((tok, i) => i < collectedCount ? tok : '·'.repeat(Math.max(1, tok.length > 3 ? 3 : tok.length)));
      els.progress.innerHTML = `<span class="snake-progress-label">${label}:</span> ` +
        chunks.map((c, i) => `<span class="snake-chip ${i < collectedCount ? 'done' : ''}">${c}</span>`).join(' ');
    }

    function showIntro(round, cb) {
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">${t(lang, 'ready')}</p>
          <p class="snake-overlay-target">${round.targets.join(round.unit === 'letter' ? ' ' : '  ')}</p>
          <button class="btn-primary" id="sk-start-btn">${t(lang, 'start')}</button>
        </div>`;
      const btn = els.overlay.querySelector('#sk-start-btn');
      const go = () => { if (!alive) return; els.overlay.classList.add('hidden'); cb(); };
      btn.addEventListener('click', go, { once: true });
    }

    function emptyCells(occupied) {
      const cells = [];
      for (let x = 0; x < cfg.cols; x++) for (let y = 0; y < cfg.rows; y++) {
        if (!occupied.has(x + ',' + y)) cells.push({ x, y });
      }
      return cells;
    }

    function randomFreeCell(occupied) {
      const cells = emptyCells(occupied);
      if (!cells.length) return { x: 0, y: 0 };
      return cells[Math.floor(Math.random() * cells.length)];
    }

    function spawnFood(round) {
      const occ = new Set(snake.map(s => s.x + ',' + s.y));
      const nextTok = round.targets[sess.collected];
      target = { ...randomFreeCell(occ), text: nextTok };
      occ.add(target.x + ',' + target.y);

      const decoyPool = round.decoys || [];
      decoyList = [];
      const n = Math.min(cfg.decoys, decoyPool.length);
      const used = new Set();
      while (decoyList.length < n && used.size < decoyPool.length) {
        const w = decoyPool[Math.floor(Math.random() * decoyPool.length)];
        if (used.has(w)) continue;
        used.add(w);
        const cell = randomFreeCell(occ);
        decoyList.push({ ...cell, text: w });
        occ.add(cell.x + ',' + cell.y);
      }
    }

    function runRound(round) {
      currentRound = round;
      dir = { x: 1, y: 0 };
      pendingDir = dir;
      const cx = Math.floor(cfg.cols / 2), cy = Math.floor(cfg.rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      sess = { collected: 0, misses: 0, speed: Math.max(cfg.speed * 0.55, cfg.speed - roundIdx * 14) };
      spawnFood(round);
      loop(round);
    }

    function loop(round) {
      clearTimeout(tick);
      if (!alive) return;
      dir = pendingDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (cfg.wrap) {
        head.x = (head.x + cfg.cols) % cfg.cols;
        head.y = (head.y + cfg.rows) % cfg.rows;
      } else if (head.x < 0 || head.x >= cfg.cols || head.y < 0 || head.y >= cfg.rows) {
        softFail(round);
        return;
      }

      const hitsSelf = snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y);
      if (hitsSelf && !cfg.wrap) { softFail(round); return; }

      snake.unshift(head);

      let ate = false;
      if (head.x === target.x && head.y === target.y) {
        ate = true;
        sess.collected++;
        onProgress(round);
      } else {
        const dIdx = decoyList.findIndex(d => d.x === head.x && d.y === head.y);
        if (dIdx >= 0) {
          sess.misses++;
          els.miss.textContent = sess.misses;
          flashDecoy();
          decoyList.splice(dIdx, 1);
          if (snake.length > 3) snake.pop();
        }
      }
      if (!ate) snake.pop();

      draw(round);

      if (sess.collected >= round.targets.length) { roundComplete(round); return; }
      tick = setTimeout(() => loop(round), sess.speed);
    }

    function onProgress(round) {
      renderProgress(round, sess.collected);
      if (sess.collected < round.targets.length) spawnFood(round);
    }

    function softFail(round) {
      flashWall();
      const cx = Math.floor(cfg.cols / 2), cy = Math.floor(cfg.rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = { x: 1, y: 0 }; pendingDir = dir;
      spawnFood(round);
      draw(round);
      tick = setTimeout(() => loop(round), sess.speed);
    }

    let flashUntil = 0, flashColor = null;
    function flashDecoy() { flashColor = 'red'; flashUntil = Date.now() + 220; }
    function flashWall()  { flashColor = 'red'; flashUntil = Date.now() + 220; }

    function roundComplete(round) {
      els.score.textContent = roundIdx + 1;
      if (opts.onRoundComplete) opts.onRoundComplete(roundIdx, rounds.length, sess.misses);
      els.overlay.classList.remove('hidden');
      const wordDisplay = round.unit === 'letter' ? round.targets.join('') : round.targets.join(' ');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-word-reveal snake-word-reveal-${round.unit}">${wordDisplay}</p>
          <p class="snake-overlay-icon">${round.icon || '💡'}</p>
          <p class="snake-overlay-fact">${round.fact || ''}</p>
          <button class="btn-primary" id="sk-cont-btn">${t(lang, 'cont')}</button>
        </div>`;
      const btn = els.overlay.querySelector('#sk-cont-btn');
      btn.addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden');
        playRound(roundIdx + 1);
      }, { once: true });
    }

    function finishAll() {
      teardown(); // stop the render loop / listeners — the caller now owns the container
      if (opts.onAllDone) opts.onAllDone();
    }

    /* ── RENDER ───────────────────────────────────────────────── */
    function draw(round) {
      const ctx = els.ctx, cell = cfg.cell;
      const w = els.canvas.width, h = els.canvas.height;
      const bg = cssVar('--bg2', '#0d1117');
      const accent = cssVar('--accent', '#22d3ee');
      const accent2 = cssVar('--accent2', '#a855f7');
      const green = cssVar('--green', '#00ff88');
      const red = cssVar('--red', '#f87171');

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const nowFlash = Date.now() < flashUntil;
      if (nowFlash) {
        ctx.fillStyle = 'rgba(248,113,113,.18)';
        ctx.fillRect(0, 0, w, h);
      }

      if (!snake) return; // nothing to draw yet — before first round starts

      // snake
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      snake.forEach((seg, i) => {
        const pct = i / Math.max(1, snake.length - 1);
        ctx.fillStyle = i === 0 ? accent : accent2;
        ctx.globalAlpha = 1 - pct * 0.55;
        const pad = 2;
        ctx.fillRect(seg.x * cell + pad, seg.y * cell + pad, cell - pad * 2, cell - pad * 2);
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      // LED eyes on the head, facing the direction of travel
      const head = snake[0];
      const hx = head.x * cell, hy = head.y * cell;
      const eyeOffset = cell * 0.22, eyeR = Math.max(1.5, cell * 0.07);
      const perp = { x: -dir.y, y: dir.x };
      const eyeCx = hx + cell / 2 + dir.x * eyeOffset;
      const eyeCy = hy + cell / 2 + dir.y * eyeOffset;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ffffff';
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.arc(eyeCx + perp.x * eyeOffset * side, eyeCy + perp.y * eyeOffset * side, eyeR, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // token sizing scales with unit — phrases are much longer than single letters
      const unit = (round && round.unit) || 'letter';
      const sizing = unit === 'phrase' ? { maxW: cell * 4.6, baseMult: 0.38, minFont: 7 }
                   : unit === 'word'   ? { maxW: cell * 3.2, baseMult: 0.42, minFont: 8 }
                   :                     { maxW: cell * 2.2, baseMult: 0.5,  minFont: 10 };

      // target (glowing, next-needed)
      drawToken(ctx, target, cell, green, true, sizing);
      // decoys (dim red)
      decoyList.forEach(d => drawToken(ctx, d, cell, red, false, sizing));
    }

    function drawToken(ctx, tok, cell, color, glow, sizing) {
      const x = tok.x * cell, y = tok.y * cell;
      ctx.save();
      if (glow) {
        ctx.globalCompositeOperation = 'lighter';
        const pulse = 0.55 + 0.35 * Math.sin(Date.now() / 180);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35 * pulse;
        ctx.beginPath();
        ctx.arc(x + cell / 2, y + cell / 2, cell * 0.62, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = glow ? 1 : 0.55;
      let fontSize = Math.round(cell * sizing.baseMult);
      ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
      while (ctx.measureText(tok.text).width > sizing.maxW && fontSize > sizing.minFont) {
        fontSize -= 1;
        ctx.font = `700 ${fontSize}px system-ui, sans-serif`;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tok.text, x + cell / 2, y + cell / 2);
      ctx.restore();
    }

  }

  window.KAT_Snake = {
    start(container, opts) { return new KatSnake(container, opts); },
  };
})();
