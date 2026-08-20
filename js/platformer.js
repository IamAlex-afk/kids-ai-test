'use strict';

/* ═══════════════════════════════════════════════════════════════════
   KAT PLATFORMER — "Circuit Runner 2.0 — Эволюция"
   Mario-Run-style auto-runner: player is fixed on screen, the world
   scrolls toward them at a rising speed. Jump / double-jump / slide /
   dash to survive; collect the AI-term letters that already live in
   data/*.js `snake` rounds (10 languages, reused as-is).

   Worlds = lessons (data.lessons[i]) — NOT hardcoded words — so the
   whole 10-language / 4-age content system keeps working. Visual
   theme (space/jungle/city/lab) cycles by world INDEX instead.

   Ages are the site's existing 4 buckets (tiny/child/teen/adult) —
   there's no exact-age input anywhere else on the site, so the new
   "3-6 / 7-9 / 10-12+" mechanic grid is mapped onto them:
     tiny  -> 3-6 tier   child -> 7-9 tier   teen & adult -> 10-12+ tier

   API mirrors js/snake.js:
     window.KAT_Platformer.startWorldSelect(container, {
       age, lang, lessons, rounds, onAllDone
     })
═══════════════════════════════════════════════════════════════════ */

(function () {

  /* ─── STORAGE (boolean/0-safe, unlike naive `JSON.parse(x)||fallback`) ─ */
  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (_) { return fallback; }
  }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} }

  /* ─── AGE CONFIG ─────────────────────────────────────────────────── */
  // gapMax/gapMin = time between spawns, in ms. gapMax used to be the
  // starting value (up to 2.7s for tiny) — meaning the game was at its
  // emptiest right at the start, before anything had ramped up, then
  // still had to travel the width of the canvas to reach the player.
  // Difficulty should come from SPEED ramping, not from starving spawns
  // early on — so the gap range is now much tighter and only mildly
  // shrinks with progress, keeping the screen consistently active.
  const AGE_CFG = {
    tiny:  { baseSpeed: 2.1, maxSpeed: 4.2, rampSec: 55, gravity: 0.48, jumpVel: -10.4, gapMax: 1400, gapMin: 1000, obstacleMax: 2, doubleJump: true,  slide: false, dash: false, hints: 'always', partStages: 4, fireRate: 950, fireRange: 220 },
    child: { baseSpeed: 3.0, maxSpeed: 6.0, rampSec: 48, gravity: 0.56, jumpVel: -11.0, gapMax: 1200, gapMin: 850,  obstacleMax: 4, doubleJump: true,  slide: false, dash: false, hints: 'first3', partStages: 4, fireRate: 800, fireRange: 230 },
    teen:  { baseSpeed: 3.9, maxSpeed: 7.8, rampSec: 42, gravity: 0.64, jumpVel: -11.6, gapMax: 1000, gapMin: 650,  obstacleMax: 6, doubleJump: true,  slide: true,  dash: true,  hints: 'never',  partStages: 4, fireRate: 650, fireRange: 240 },
    adult: { baseSpeed: 4.1, maxSpeed: 8.2, rampSec: 38, gravity: 0.68, jumpVel: -11.9, gapMax: 900,  gapMin: 550,  obstacleMax: 6, doubleJump: true,  slide: true,  dash: true,  hints: 'never',  partStages: 4, fireRate: 550, fireRange: 250 },
  };

  // Each age gets its OWN obstacle cast and colour mood — not just a speed
  // multiplier. A 4-year-old and a 16-year-old should recognise their game
  // as different at a glance, not only feel it in the controls.
  const AGE_OBSTACLES = {
    tiny:  ['🫥', '🔌', '🧊', '💤'],   // glitchy-face / unplugged / frozen / sleepy — off, not scary
    child: ['🐛', '🎭', '🦠', '⚠️'],   // bug / fake-mask / virus / warning
    teen:  ['💀', '🌀', '⚡', '🔺'],   // danger / glitch-loop / power-surge / alert
    adult: ['🕳️', '🔻', '💢', '⛔'],   // data-void / corruption / conflict / blocked
  };
  const AGE_OVERHEAD = {
    teen:  ['📡', '💬'],
    adult: ['👁️', '🔻'],
  };

  const WORLD_THEMES_BY_AGE = {
    tiny: [   // bright, warm, toybox — nothing dark or ominous
      { name: 'space',  sky: ['#1a1035', '#2d1b54'], accent: '#93c5fd', ground: '#2a2050', deco: '★' },
      { name: 'jungle', sky: ['#0f2818', '#1a4028'], accent: '#86efac', ground: '#1c4028', deco: '🌿' },
      { name: 'city',   sky: ['#2a0f2e', '#3d1a42'], accent: '#f9a8d4', ground: '#3a1f3d', deco: '▢' },
      { name: 'lab',    sky: ['#241505', '#3a2408'], accent: '#fde68a', ground: '#2e2410', deco: '○' },
    ],
    child: [  // the original neon set
      { name: 'space',  sky: ['#05060f', '#0b1030'], accent: '#22d3ee', ground: '#161c3a', deco: '★' },
      { name: 'jungle', sky: ['#02120a', '#08281a'], accent: '#34d399', ground: '#123320', deco: '🌿' },
      { name: 'city',   sky: ['#0a0510', '#1d0f30'], accent: '#f472b6', ground: '#2a1b3d', deco: '▢' },
      { name: 'lab',    sky: ['#050b0f', '#0a1e22'], accent: '#fbbf24', ground: '#1c2b2f', deco: '○' },
    ],
    teen: [   // cooler, harder-edged neon
      { name: 'space',  sky: ['#030308', '#0a0a2a'], accent: '#818cf8', ground: '#12122e', deco: '★' },
      { name: 'jungle', sky: ['#010c08', '#052018'], accent: '#2dd4bf', ground: '#0a2820', deco: '🌿' },
      { name: 'city',   sky: ['#08030c', '#170a24'], accent: '#e879f9', ground: '#20122e', deco: '▢' },
      { name: 'lab',    sky: ['#030608', '#071418'], accent: '#facc15', ground: '#141f22', deco: '○' },
    ],
    adult: [  // darkest, most technical / muted
      { name: 'space',  sky: ['#020204', '#06061a'], accent: '#6366f1', ground: '#0c0c1e', deco: '★' },
      { name: 'jungle', sky: ['#000806', '#031810'], accent: '#14b8a6', ground: '#061e18', deco: '🌿' },
      { name: 'city',   sky: ['#050208', '#100618'], accent: '#c026d3', ground: '#160c1e', deco: '▢' },
      { name: 'lab',    sky: ['#020404', '#0a1214'], accent: '#ca8a04', ground: '#0f1719', deco: '○' },
    ],
  };
  function themeFor(age, worldIdx) {
    const set = WORLD_THEMES_BY_AGE[age] || WORLD_THEMES_BY_AGE.child;
    return set[worldIdx % set.length];
  }


  /* ═══════════════════════════════════════════════════════════════════
     ROBOT SPRITE SHEET — optional, additive. Fill in ROBOT_SPRITE.src
     once a real asset (CC0/free-licensed) is available and drawRobot()
     will automatically be swapped for the frame-based drawRobotSprite()
     everywhere it's called. Until then src stays null, isSpriteReady()
     returns false, and the game renders the current procedural robot
     exactly as before — this block changes nothing visually by itself.

     Expected sheet layout: a grid of equal-size frames, one row per
     animation. Update frameW/frameH to the sheet's actual per-frame
     pixel size, and each anim's `row` (0-indexed) + `frames` (frame
     count in that row) + `fps` (playback speed) to match.
  ═══════════════════════════════════════════════════════════════════ */
  const ROBOT_SPRITE = {
    src: 'assets/robot-sheet.png',
    frameW: 64,
    frameH: 64,
    anims: {
      idle:  { row: 0, frames: 1, fps: 1 },
      run:   { row: 1, frames: 2, fps: 6 },
      jump:  { row: 2, frames: 1, fps: 1 },
      hurt:  { row: 3, frames: 1, fps: 1 },
      slide: { row: 4, frames: 1, fps: 1 },
    },
  };
  let _robotImg = null, _robotImgReady = false;
  function isSpriteReady() { return _robotImgReady; }
  // Set true only once a sharper, more detailed sheet replaces the
  // current low-res Kenney recolor — see the drawRobot() call site.
  const FORCE_SPRITE_ROBOT = false;
  (function preloadRobotSprite() {
    if (!ROBOT_SPRITE.src) return;
    const img = new Image();
    img.onload = () => { _robotImg = img; _robotImgReady = true; };
    img.onerror = () => { _robotImgReady = false; };
    img.src = ROBOT_SPRITE.src;
  })();

  // Real tiled background art — starfield for teen/adult (space mood),
  // clouds for tiny/child (sky mood). Same additive pattern as the robot
  // sprite: stays null-safe, drawBackground() falls back to the existing
  // procedural gradient + glyph stars if an image hasn't loaded yet.
  const BG_IMAGES = { stars: 'assets/bg-stars.png', clouds: 'assets/bg-clouds.png' };
  const _bgImg = {}, _bgReady = {};
  Object.keys(BG_IMAGES).forEach(key => {
    const img = new Image();
    img.onload = () => { _bgImg[key] = img; _bgReady[key] = true; };
    img.onerror = () => { _bgReady[key] = false; };
    img.src = BG_IMAGES[key];
  });
  function bgModeFor(age) { return (age === 'tiny' || age === 'child') ? 'clouds' : 'stars'; }

  // Picks the right animation name from the same state flags drawRobot()
  // already receives, so callers don't need to change.
  function pickRobotAnim(opts) {
    if (opts.hurt) return 'hurt';
    if (opts.sliding) return 'slide';
    if (!opts.onGround) return 'jump';
    if (opts.moving === false) return 'idle';
    return 'run';
  }

  function drawRobotSprite(ctx, x, y, opts) {
    const animName = pickRobotAnim(opts);
    const anim = ROBOT_SPRITE.anims[animName] || ROBOT_SPRITE.anims.idle;
    const frame = Math.floor((opts.now || 0) / (1000 / anim.fps)) % anim.frames;
    const sx = frame * ROBOT_SPRITE.frameW;
    const sy = anim.row * ROBOT_SPRITE.frameH;
    // 0.85 (was 0.7) — the smaller size read as a pale, half-sized
    // afterthought next to the site's other neon-glow characters.
    const drawW = ROBOT_SPRITE.frameW * 0.85, drawH = ROBOT_SPRITE.frameH * 0.85;
    ctx.save();
    ctx.translate(x, y);

    // Soft contact shadow — same trick as the procedural fallback's
    // drawRobot(): without it the sprite reads as floating/pasted-on
    // rather than standing on the ground.
    const shadowGrad = ctx.createRadialGradient(0, 4, 0, 0, 4, 15);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(0, 4, 14, 4.5, 0, 0, Math.PI * 2); ctx.fill();

    // Dynamic neon rim glow — matches the procedural robot's existing
    // shadowBlur convention instead of baking a fixed glow into the PNG,
    // so it still pulses on hurt/dash the same way.
    ctx.shadowColor = opts.hurt ? '#f87171' : (opts.glowColor || '#22d3ee');
    ctx.shadowBlur = opts.hurt ? 22 : 16;
    if (opts.hurt) { ctx.globalAlpha = 0.6 + 0.4 * Math.sin((opts.now || 0) * 0.03); }
    ctx.drawImage(_robotImg, sx, sy, ROBOT_SPRITE.frameW, ROBOT_SPRITE.frameH, -drawW / 2, -drawH + 6, drawW, drawH);
    ctx.restore();
  }

  const SKINS = { cyan: '#22d3ee', green: '#34d399', gold: '#fbbf24' };

  const STR = {
    en: { ready: 'Get Ready!', start: 'Start ▶', cont: 'Continue →', hint: 'Tap / Space / ↑ to jump. Tap twice for double jump.', worlds: 'Choose a world', cleared: 'CLEARED', best: 'Best', worldClear: 'World Clear!', gameOver: 'Run ended', record: 'New record!', back: '← Worlds', again: 'Run Again', letters: 'Letters', score: 'Score', part: 'Robot', checkpoint: 'Checkpoint!', shieldOn: 'Shield up!', magnetOn: 'Magnet!', skin: 'Robot colour', exit: 'Exit', mute: 'Sound', dash: 'DASH', slide: 'SLIDE', jump: 'JUMP', achUnlocked: 'Achievement unlocked!', fakeHit: 'That letter was fake!', locked: 'Needs 2★ in the previous world', streak: 'day streak', streakBonus: 'Streak bonus', achWorld1: 'First world cleared', achWorld5: '5 worlds cleared', achFlawless: 'Flawless run', backGames: '← Games', yes: 'Yes', no: 'No', quizKicker: 'Quick question!', lockedFinal: 'Needs 3★ on every earlier world', skipQuiz: 'Skip to quiz' },
    ru: { ready: 'Приготовься!', start: 'Старт ▶', cont: 'Дальше →', hint: 'Тап / Пробел / ↑ — прыжок. Два тапа — двойной прыжок.', worlds: 'Выбери мир', cleared: 'ПРОЙДЕНО', best: 'Рекорд', worldClear: 'Мир пройден!', gameOver: 'Забег окончен', record: 'Новый рекорд!', back: '← Миры', again: 'Ещё раз', letters: 'Буквы', score: 'Очки', part: 'Робот', checkpoint: 'Чекпоинт!', shieldOn: 'Щит поднят!', magnetOn: 'Магнит!', skin: 'Цвет робота', exit: 'Выход', mute: 'Звук', dash: 'РЫВОК', slide: 'СКОЛЬЖ', jump: 'ПРЫЖОК', achUnlocked: 'Новое достижение!', fakeHit: 'Это была подделка!', locked: 'Нужно 2★ в предыдущем мире', streak: 'дней подряд', streakBonus: 'Бонус за серию', achWorld1: 'Первый мир пройден', achWorld5: '5 миров пройдено', achFlawless: 'Идеальный забег', backGames: '← Игры', yes: 'Да', no: 'Нет', quizKicker: 'Быстрый вопрос!', lockedFinal: 'Нужно 3★ на всех предыдущих мирах', skipQuiz: 'Пропустить к квизу' },
    de: { ready: 'Bereit machen!', start: 'Start ▶', cont: 'Weiter →', hint: 'Tippen / Leertaste / ↑ zum Springen. Zweimal tippen für Doppelsprung.', worlds: 'Welt wählen', cleared: 'GESCHAFFT', best: 'Bestwert', worldClear: 'Welt geschafft!', gameOver: 'Lauf beendet', record: 'Neuer Rekord!', back: '← Welten', again: 'Nochmal', letters: 'Buchstaben', score: 'Punkte', part: 'Roboter', checkpoint: 'Kontrollpunkt!', shieldOn: 'Schild aktiv!', magnetOn: 'Magnet!', skin: 'Roboterfarbe', exit: 'Verlassen', mute: 'Ton', dash: 'SPRINT', slide: 'RUTSCHEN', jump: 'SPRUNG', achUnlocked: 'Erfolg freigeschaltet!', fakeHit: 'Dieser Buchstabe war falsch!', locked: 'Braucht 2★ in der vorherigen Welt', streak: 'Tage in Folge', streakBonus: 'Serien-Bonus', achWorld1: 'Erste Welt geschafft', achWorld5: '5 Welten geschafft', achFlawless: 'Perfekter Lauf', backGames: '← Spiele', yes: 'Ja', no: 'Nein', quizKicker: 'Schnelle Frage!', lockedFinal: 'Braucht 3★ in jeder vorherigen Welt', skipQuiz: 'Zum Quiz springen' },
    es: { ready: '¡Prepárate!', start: 'Empezar ▶', cont: 'Continuar →', hint: 'Toca / Espacio / ↑ para saltar. Toca dos veces para doble salto.', worlds: 'Elige un mundo', cleared: 'SUPERADO', best: 'Mejor', worldClear: '¡Mundo superado!', gameOver: 'Carrera terminada', record: '¡Nuevo récord!', back: '← Mundos', again: 'Otra vez', letters: 'Letras', score: 'Puntos', part: 'Robot', checkpoint: '¡Punto de control!', shieldOn: '¡Escudo activado!', magnetOn: '¡Imán!', skin: 'Color del robot', exit: 'Salir', mute: 'Sonido', dash: 'IMPULSO', slide: 'DESLIZAR', jump: 'SALTO', achUnlocked: '¡Logro desbloqueado!', fakeHit: '¡Esa letra era falsa!', locked: 'Necesita 2★ en el mundo anterior', streak: 'días seguidos', streakBonus: 'Bono de racha', achWorld1: 'Primer mundo superado', achWorld5: '5 mundos superados', achFlawless: 'Carrera perfecta', backGames: '← Juegos', yes: 'Sí', no: 'No', quizKicker: '¡Pregunta rápida!', lockedFinal: 'Necesita 3★ en todos los mundos anteriores', skipQuiz: 'Saltar al cuestionario' },
    fr: { ready: 'Prépare-toi !', start: 'Départ ▶', cont: 'Continuer →', hint: 'Appui / Espace / ↑ pour sauter. Double appui pour double saut.', worlds: 'Choisir un monde', cleared: 'RÉUSSI', best: 'Meilleur', worldClear: 'Monde réussi !', gameOver: 'Course terminée', record: 'Nouveau record !', back: '← Mondes', again: 'Rejouer', letters: 'Lettres', score: 'Score', part: 'Robot', checkpoint: 'Point de contrôle !', shieldOn: 'Bouclier activé !', magnetOn: 'Aimant !', skin: 'Couleur du robot', exit: 'Quitter', mute: 'Son', dash: 'SPRINT', slide: 'GLISSER', jump: 'SAUT', achUnlocked: 'Succès débloqué !', fakeHit: 'Cette lettre était fausse !', locked: 'Nécessite 2★ dans le monde précédent', streak: 'jours de suite', streakBonus: 'Bonus de série', achWorld1: 'Premier monde réussi', achWorld5: '5 mondes réussis', achFlawless: 'Course parfaite', backGames: '← Jeux', yes: 'Oui', no: 'Non', quizKicker: 'Question rapide !', lockedFinal: 'Nécessite 3★ dans tous les mondes précédents', skipQuiz: 'Passer au quiz' },
    hi: { ready: 'तैयार हो जाओ!', start: 'शुरू करें ▶', cont: 'आगे →', hint: 'कूदने के लिए टैप / स्पेस / ↑ दबाएं। डबल जंप के लिए दो बार टैप करें।', worlds: 'वर्ल्ड चुनें', cleared: 'पूरा हुआ', best: 'बेस्ट', worldClear: 'वर्ल्ड पूरा!', gameOver: 'रन खत्म', record: 'नया रिकॉर्ड!', back: '← वर्ल्ड्स', again: 'फिर से', letters: 'लेटर्स', score: 'स्कोर', part: 'रोबोट', checkpoint: 'चेकपॉइंट!', shieldOn: 'शील्ड ऑन!', magnetOn: 'मैग्नेट!', skin: 'रोबोट का रंग', exit: 'बाहर जाएं', mute: 'साउंड', dash: 'डैश', slide: 'स्लाइड', jump: 'जंप', achUnlocked: 'अचीवमेंट अनलॉक!', fakeHit: 'यह लेटर नकली था!', locked: 'पिछले वर्ल्ड में 2★ चाहिए', streak: 'दिन लगातार', streakBonus: 'स्ट्रीक बोनस', achWorld1: 'पहला वर्ल्ड पूरा', achWorld5: '5 वर्ल्ड पूरे', achFlawless: 'परफेक्ट रन', backGames: '← गेम्स', yes: 'हां', no: 'नहीं', quizKicker: 'क्विक क्वेश्चन!', lockedFinal: 'हर पिछले वर्ल्ड में 3★ चाहिए', skipQuiz: 'क्विज़ पर जाएं' },
    id: { ready: 'Bersiap!', start: 'Mulai ▶', cont: 'Lanjut →', hint: 'Ketuk / Spasi / ↑ untuk lompat. Ketuk dua kali untuk lompat ganda.', worlds: 'Pilih dunia', cleared: 'SELESAI', best: 'Terbaik', worldClear: 'Dunia selesai!', gameOver: 'Lari berakhir', record: 'Rekor baru!', back: '← Dunia', again: 'Ulangi', letters: 'Huruf', score: 'Skor', part: 'Robot', checkpoint: 'Checkpoint!', shieldOn: 'Perisai aktif!', magnetOn: 'Magnet!', skin: 'Warna robot', exit: 'Keluar', mute: 'Suara', dash: 'DASH', slide: 'GESER', jump: 'LOMPAT', achUnlocked: 'Pencapaian terbuka!', fakeHit: 'Huruf itu palsu!', locked: 'Butuh 2★ di dunia sebelumnya', streak: 'hari beruntun', streakBonus: 'Bonus beruntun', achWorld1: 'Dunia pertama selesai', achWorld5: '5 dunia selesai', achFlawless: 'Lari sempurna', backGames: '← Game', yes: 'Ya', no: 'Tidak', quizKicker: 'Pertanyaan cepat!', lockedFinal: 'Butuh 3★ di semua dunia sebelumnya', skipQuiz: 'Lewati ke kuis' },
    it: { ready: 'Preparati!', start: 'Inizia ▶', cont: 'Continua →', hint: 'Tocca / Spazio / ↑ per saltare. Tocca due volte per il doppio salto.', worlds: 'Scegli un mondo', cleared: 'COMPLETATO', best: 'Record', worldClear: 'Mondo completato!', gameOver: 'Corsa terminata', record: 'Nuovo record!', back: '← Mondi', again: 'Ancora', letters: 'Lettere', score: 'Punteggio', part: 'Robot', checkpoint: 'Checkpoint!', shieldOn: 'Scudo attivo!', magnetOn: 'Magnete!', skin: 'Colore robot', exit: 'Esci', mute: 'Audio', dash: 'SCATTO', slide: 'SCIVOLATA', jump: 'SALTO', achUnlocked: 'Obiettivo sbloccato!', fakeHit: 'Quella lettera era falsa!', locked: 'Serve 2★ nel mondo precedente', streak: 'giorni di fila', streakBonus: 'Bonus serie', achWorld1: 'Primo mondo completato', achWorld5: '5 mondi completati', achFlawless: 'Corsa perfetta', backGames: '← Giochi', yes: 'Sì', no: 'No', quizKicker: 'Domanda veloce!', lockedFinal: 'Serve 3★ in tutti i mondi precedenti', skipQuiz: 'Salta al quiz' },
    pt: { ready: 'Prepare-se!', start: 'Começar ▶', cont: 'Continuar →', hint: 'Toque / Espaço / ↑ para pular. Toque duas vezes para pulo duplo.', worlds: 'Escolha um mundo', cleared: 'CONCLUÍDO', best: 'Melhor', worldClear: 'Mundo concluído!', gameOver: 'Corrida encerrada', record: 'Novo recorde!', back: '← Mundos', again: 'De novo', letters: 'Letras', score: 'Pontos', part: 'Robô', checkpoint: 'Checkpoint!', shieldOn: 'Escudo ativado!', magnetOn: 'Ímã!', skin: 'Cor do robô', exit: 'Sair', mute: 'Som', dash: 'ARRANCADA', slide: 'DESLIZAR', jump: 'PULO', achUnlocked: 'Conquista desbloqueada!', fakeHit: 'Essa letra era falsa!', locked: 'Precisa de 2★ no mundo anterior', streak: 'dias seguidos', streakBonus: 'Bônus de sequência', achWorld1: 'Primeiro mundo concluído', achWorld5: '5 mundos concluídos', achFlawless: 'Corrida perfeita', backGames: '← Jogos', yes: 'Sim', no: 'Não', quizKicker: 'Pergunta rápida!', lockedFinal: 'Precisa de 3★ em todos os mundos anteriores', skipQuiz: 'Pular para o quiz' },
    tr: { ready: 'Hazır ol!', start: 'Başla ▶', cont: 'Devam →', hint: 'Zıplamak için Dokun / Boşluk / ↑. Çift zıplama için iki kez dokun.', worlds: 'Dünya seç', cleared: 'TAMAMLANDI', best: 'En iyi', worldClear: 'Dünya tamamlandı!', gameOver: 'Koşu bitti', record: 'Yeni rekor!', back: '← Dünyalar', again: 'Tekrar', letters: 'Harfler', score: 'Skor', part: 'Robot', checkpoint: 'Kontrol noktası!', shieldOn: 'Kalkan aktif!', magnetOn: 'Mıknatıs!', skin: 'Robot rengi', exit: 'Çıkış', mute: 'Ses', dash: 'ATILIM', slide: 'KAYMA', jump: 'ZIPLA', achUnlocked: 'Başarı açıldı!', fakeHit: 'O harf sahteydi!', locked: 'Önceki dünyada 2★ gerekiyor', streak: 'gün üst üste', streakBonus: 'Seri bonusu', achWorld1: 'İlk dünya tamamlandı', achWorld5: '5 dünya tamamlandı', achFlawless: 'Kusursuz koşu', backGames: '← Oyunlar', yes: 'Evet', no: 'Hayır', quizKicker: 'Hızlı soru!', lockedFinal: 'Önceki tüm dünyalarda 3★ gerekiyor', skipQuiz: 'Quize geç' },
    vi: { ready: 'Chuẩn bị!', start: 'Bắt đầu ▶', cont: 'Tiếp tục →', hint: 'Chạm / Phím cách / ↑ để nhảy. Chạm hai lần để nhảy đôi.', worlds: 'Chọn thế giới', cleared: 'HOÀN THÀNH', best: 'Tốt nhất', worldClear: 'Hoàn thành thế giới!', gameOver: 'Kết thúc lượt chạy', record: 'Kỷ lục mới!', back: '← Thế giới', again: 'Chơi lại', letters: 'Chữ cái', score: 'Điểm', part: 'Robot', checkpoint: 'Trạm kiểm soát!', shieldOn: 'Khiên bật!', magnetOn: 'Nam châm!', skin: 'Màu robot', exit: 'Thoát', mute: 'Âm thanh', dash: 'LAO NHANH', slide: 'TRƯỢT', jump: 'NHẢY', achUnlocked: 'Mở khóa thành tích!', fakeHit: 'Chữ cái đó là giả!', locked: 'Cần 2★ ở thế giới trước', streak: 'ngày liên tiếp', streakBonus: 'Thưởng chuỗi', achWorld1: 'Hoàn thành thế giới đầu tiên', achWorld5: 'Hoàn thành 5 thế giới', achFlawless: 'Lượt chạy hoàn hảo', backGames: '← Trò chơi', yes: 'Có', no: 'Không', quizKicker: 'Câu hỏi nhanh!', lockedFinal: 'Cần 3★ ở mọi thế giới trước', skipQuiz: 'Bỏ qua đến câu đố' },
  };
  function t(lang, key) { const d = STR[lang] || STR.en; return d[key] || STR.en[key] || key; }

  /* ─── AUDIO / HAPTICS ─────────────────────────────────────────────── */
  const LS_MUTE = 'kat_pf_muted';
  let MUTED = !!readJSON(LS_MUTE, false);
  function setMuted(v) { MUTED = !!v; writeJSON(LS_MUTE, MUTED); }

  let _actx = null;
  function ac() {
    if (MUTED) return null;
    if (!_actx) { try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {} }
    if (_actx && _actx.state === 'suspended') _actx.resume();
    return _actx;
  }
  function tone(freq, start, dur, type, vol) {
    const ctx = ac(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = Math.min(4200, freq * 5 + 900); f.Q.value = 0.6;
    o.connect(f); f.connect(g); g.connect(ctx.destination);
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.04);
  }
  function sweep(f0, f1, start, dur, type, vol) {
    const ctx = ac(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; f.type = 'lowpass'; f.frequency.value = Math.min(4200, Math.max(f0, f1) * 4 + 900); f.Q.value = 0.6;
    o.connect(f); f.connect(g); g.connect(ctx.destination);
    const t0 = ctx.currentTime + start;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.start(t0); o.stop(t0 + dur + 0.04);
  }
  const playJumpSound   = () => sweep(200, 400, 0, 0.10, 'triangle', 0.10);
  const playJump2Sound  = () => sweep(300, 620, 0, 0.11, 'triangle', 0.11);
  const playCollectSound = () => { tone(800, 0, 0.16, 'sine', 0.16); tone(1200, 0.05, 0.1, 'sine', 0.1); };
  const playCoinSound   = () => { tone(1046, 0, 0.05, 'triangle', 0.10); tone(1568, 0.04, 0.08, 'triangle', 0.10); };
  const playShieldSound = () => sweep(500, 900, 0, 0.2, 'sine', 0.14);
  const playSpringSound = () => sweep(150, 700, 0, 0.18, 'sawtooth', 0.14);
  const playHitSound    = () => tone(100, 0, 0.22, 'sawtooth', 0.16);
  const playWinSound    = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.16));
  const playGameOverSound = () => [400, 300, 220, 140].forEach((f, i) => tone(f, i * 0.1, 0.2, 'sawtooth', 0.13));
  const playCheckpointSound = () => { tone(660, 0, 0.08, 'triangle', 0.14); tone(880, 0.08, 0.12, 'triangle', 0.14); };
  const playDashSound   = () => sweep(400, 900, 0, 0.16, 'sawtooth', 0.12);
  const playZapSound    = () => sweep(900, 300, 0, 0.09, 'triangle', 0.09);
  const playZapHitSound = () => { tone(500, 0, 0.05, 'square', 0.08); tone(220, 0.03, 0.08, 'square', 0.07); };
  const haptic = (p) => navigator.vibrate && navigator.vibrate(p);

  /* ─── CHIPTUNE BACKGROUND LOOP (8-step, per-world, has rests) ────── */
  // A straight 4-note arpeggio repeating every 550ms reads as a dentist's-
  // office loop within a minute. This uses an 8-step pattern with rests
  // and a slower tempo so it sits in the background instead of nagging.
  const WORLD_CHORDS = [
    [220.0, 0, 329.6, 0, 261.6, 0, 329.6, 392.0],   // space
    [196.0, 0, 293.7, 0, 246.9, 0, 293.7, 349.2],   // jungle
    [233.1, 0, 349.2, 0, 277.2, 0, 349.2, 415.3],   // city
    [261.6, 0, 392.0, 0, 329.6, 0, 392.0, 466.2],   // lab
  ];
  function MusicLoop(worldIdx) {
    let timer = null, step = 0;
    const pattern = WORLD_CHORDS[worldIdx % WORLD_CHORDS.length];
    function tick() {
      const freq = pattern[step % pattern.length];
      if (!MUTED && freq) tone(freq, 0, 0.7, 'triangle', 0.02);
      step++;
      timer = setTimeout(tick, 720);
    }
    return {
      start() { if (!timer) tick(); },
      stop() { clearTimeout(timer); timer = null; },
    };
  }

  /* ─── HELPERS ─────────────────────────────────────────────────────── */
  function lerp(a, b, tt) { return a + (b - a) * Math.min(1, Math.max(0, tt)); }
  // Lighten (positive) or darken (negative) a '#rrggbb' colour by percent.
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }
  function rrect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
  function chunkEvenly(arr, n) {
    n = Math.max(1, Math.min(n, arr.length || 1));
    const out = []; let i = 0;
    const base = Math.floor(arr.length / n); let rem = arr.length % n;
    for (let c = 0; c < n; c++) {
      const size = base + (rem > 0 ? 1 : 0); if (rem > 0) rem--;
      out.push(arr.slice(i, i + size)); i += size;
    }
    return out;
  }
  // Pickup orbs are sized for a single letter (16px). 'word'/'phrase'
  // worlds put whole words on them instead — shrink to fit so e.g.
  // "УЧИТСЯ" doesn't spill out past the glow circle.
  function pickupFont(ctx, text) {
    let size = 16;
    ctx.font = `800 ${size}px system-ui, sans-serif`;
    while (size > 8 && ctx.measureText(text).width > 26) {
      size--; ctx.font = `800 ${size}px system-ui, sans-serif`;
    }
    return ctx.font;
  }
  function seededRng(seed) {
    let s = seed >>> 0;
    return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  }

  /* ─── PARTICLES ───────────────────────────────────────────────────── */
  function spawnBurst(particles, cx, cy, color, count) {
    count = count || 16;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.9;
      const spd = 1.6 + Math.random() * 3.0;
      particles.push({ x: cx, y: cy, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, alpha: 1, sz: 2 + Math.random() * 4, color });
    }
  }
  function tickParticles(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.x += p.vx; p.y += p.vy;
      p.vx *= 0.9; p.vy *= 0.9; p.alpha -= 0.03;
      if (p.alpha <= 0) arr.splice(i, 1);
    }
  }
  function drawParticles(ctx, arr) {
    ctx.save();
    arr.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.shadowBlur = 8; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }

  /* ─── CLEARED WORLDS ──────────────────────────────────────────────── */
  const LS_CLEARED = 'kat_pf_cleared_v1';
  function markCleared(age, worldIdx) {
    const all = readJSON(LS_CLEARED, {}); const set = new Set(all[age] || []);
    set.add(worldIdx); all[age] = Array.from(set); writeJSON(LS_CLEARED, all);
  }
  function isCleared(age, worldIdx) {
    const all = readJSON(LS_CLEARED, {}); return (all[age] || []).includes(worldIdx);
  }

  /* ─── STARS (per world, best-of, gates the next world) ──────────── */
  const LS_STARS = 'kat_pf_stars_v1';
  function getStars(age, worldIdx) {
    const all = readJSON(LS_STARS, {});
    return (all[age] && all[age][worldIdx]) || 0;
  }
  function setStarsIfBetter(age, worldIdx, stars) {
    const all = readJSON(LS_STARS, {});
    if (!all[age]) all[age] = {};
    if (stars > (all[age][worldIdx] || 0)) all[age][worldIdx] = stars;
    writeJSON(LS_STARS, all);
  }
  // Intermediate worlds: 2★ in the one right before. The LAST world of an
  // age is a real mastery gate — every earlier world must be 3-starred.
  function worldUnlocked(age, worldIdx, totalWorlds) {
    if (worldIdx === 0) return true;
    if (totalWorlds && worldIdx === totalWorlds - 1) {
      for (let i = 0; i < totalWorlds - 1; i++) if (getStars(age, i) < 3) return false;
      return true;
    }
    return getStars(age, worldIdx - 1) >= 2;
  }

  /* ─── STREAK (soft — a missed day never erases progress) ─────────── */
  const LS_STREAK = 'kat_pf_streak_v1';
  function getStreak() { return readJSON(LS_STREAK, { lastDate: '', count: 0 }); }
  function bumpStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const s = getStreak();
    if (s.lastDate === today) return { streak: s, bonus: false };
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const count = s.lastDate === yesterday ? s.count + 1 : 1;
    const updated = { lastDate: today, count };
    writeJSON(LS_STREAK, updated);
    return { streak: updated, bonus: true };
  }

  /* ─── HINTS-SEEN COUNTER (for "first 3 worlds" hint rule) ─────────── */
  function worldsPlayedCount(age) { return readJSON('kat_pf_played_' + age, 0); }
  function bumpWorldsPlayed(age) { writeJSON('kat_pf_played_' + age, worldsPlayedCount(age) + 1); }

  /* ─── ACHIEVEMENTS ────────────────────────────────────────────────── */
  const LS_ACH = 'kat_pf_achievements_v1';
  function loadAch() { return readJSON(LS_ACH, { collectedLetters: 0, worldsCompleted: 0, flawlessRuns: 0, totalScore: 0, notified: [] }); }
  function saveAch(a) { writeJSON(LS_ACH, a); }
  const ACH_RULES = [
    { id: 'letters50', check: a => a.collectedLetters >= 50, label: (l) => '🔤 50 ' + t(l, 'letters') },
    { id: 'letters200', check: a => a.collectedLetters >= 200, label: (l) => '🔤 200 ' + t(l, 'letters') },
    { id: 'worlds1', check: a => a.worldsCompleted >= 1, label: (l) => '🌍 ' + t(l, 'achWorld1') },
    { id: 'worlds5', check: a => a.worldsCompleted >= 5, label: (l) => '🌍 ' + t(l, 'achWorld5') },
    { id: 'flawless1', check: a => a.flawlessRuns >= 1, label: (l) => '💎 ' + t(l, 'achFlawless') },
    { id: 'score1000', check: a => a.totalScore >= 1000, label: (l) => '⭐ 1000 ' + t(l, 'score') },
  ];
  function updateAchievements(delta, lang, onUnlock) {
    const a = loadAch();
    a.collectedLetters += delta.letters || 0;
    a.totalScore += delta.score || 0;
    if (delta.worldWon) a.worldsCompleted++;
    if (delta.flawless) a.flawlessRuns++;
    const newlyUnlocked = [];
    ACH_RULES.forEach(rule => {
      if (!a.notified.includes(rule.id) && rule.check(a)) { a.notified.push(rule.id); newlyUnlocked.push(rule.label(lang)); }
    });
    saveAch(a);
    if (newlyUnlocked.length && onUnlock) onUnlock(newlyUnlocked);
    return a;
  }

  /* ─── SKINS ───────────────────────────────────────────────────────── */
  const LS_SKIN = 'kat_pf_skin';
  const LS_SKIN_UNLOCKED = 'kat_pf_skin_unlocked';
  function getSkin() { return readJSON(LS_SKIN, 'cyan'); }
  function setSkin(name) { if (SKINS[name]) writeJSON(LS_SKIN, name); }
  function skinsUnlocked() { return !!readJSON(LS_SKIN_UNLOCKED, false); }
  function unlockSkins() { writeJSON(LS_SKIN_UNLOCKED, true); }

  /* ─── ROBOT RENDERER ─────────────────────────────────────────────── */
  // The robot is a COMPLETE, solid, clearly-visible character from the very
  // first frame (stage 0) — collecting parts makes it more decorated/glowy,
  // it never starts as a half-invisible outline waiting to "materialize".
  function drawRobot(ctx, x, y, opts) {
    const { partStage, maxStage, onGround, now, hurt, sliding, shielded, dashing, jumpsUsed, skinColor, firing } = opts;
    ctx.save();
    ctx.translate(x, y);
    const legPhase = onGround ? Math.sin(now * 0.018) : (jumpsUsed >= 2 ? Math.sin(now * 0.05) * 0.6 : 0);
    const bob = onGround ? Math.abs(Math.sin(now * 0.018)) * 2 : 0;
    const glow = hurt ? '#f87171' : skinColor;
    const bodyFill = hurt ? '#5a1414' : '#12213f';
    ctx.shadowColor = glow; ctx.shadowBlur = hurt ? 22 : (dashing ? 26 : 16);

    if (dashing) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-14 - i * 8, -10); ctx.lineTo(-14 - i * 8 - 10, -10); ctx.stroke(); }
    }

    const h = sliding ? 0.55 : 1;

    // Soft contact shadow — grounds the robot instead of it floating.
    const shadowGrad = ctx.createRadialGradient(0, 16 * h, 0, 0, 16 * h, 13);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.38)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(0, 16 * h, 12, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Legs — always solid
    ctx.strokeStyle = glow; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, -6 * h); ctx.lineTo(-6 + legPhase * 5, 14 * h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -6 * h); ctx.lineTo(6 - legPhase * 5, 14 * h); ctx.stroke();

    // Torso — always a solid filled body, from stage 0, with a diagonal
    // light-to-dark gradient (single light source, upper-left) instead of
    // a flat fill so the plating reads as rounded metal. More plating
    // detail (rivets/panel line) once stage 1+ is reached; a lit chest
    // core once any part has been collected.
    const torsoGrad = ctx.createLinearGradient(-11, -22 * h, 11, 8 * h);
    torsoGrad.addColorStop(0, shadeColor(bodyFill, 30));
    torsoGrad.addColorStop(0.5, bodyFill);
    torsoGrad.addColorStop(1, shadeColor(bodyFill, -25));
    ctx.fillStyle = torsoGrad;
    ctx.strokeStyle = glow; ctx.lineWidth = 2.5;
    rrect(ctx, -11, -22 * h, 22, 30 * h, 7); ctx.fill(); ctx.stroke();
    // Specular highlight on the chest plate.
    const torsoHl = ctx.createRadialGradient(-4, -14 * h, 0, -4, -14 * h, 7);
    torsoHl.addColorStop(0, 'rgba(255,255,255,0.3)');
    torsoHl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = torsoHl;
    ctx.beginPath(); ctx.ellipse(-4, -14 * h, 5, 8, -0.2, 0, Math.PI * 2); ctx.fill();
    if (partStage >= 1) {
      ctx.strokeStyle = `${glow}88`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-11, -10 * h); ctx.lineTo(11, -10 * h); ctx.stroke();
      const corePulse = 0.7 + 0.3 * Math.sin(now * 0.008);
      ctx.shadowBlur = 8; ctx.fillStyle = glow; ctx.globalAlpha = corePulse;
      ctx.beginPath(); ctx.arc(0, -14 * h, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.shadowBlur = hurt ? 22 : (dashing ? 26 : 16);
    }

    // Arms — stubby nubs from the start, extend into full arms at stage 2+
    ctx.strokeStyle = glow; ctx.lineWidth = partStage >= 2 ? 3.5 : 3;
    const armLift = !onGround ? -6 : 0;
    const armLen = partStage >= 2 ? 1 : 0.45;
    ctx.beginPath(); ctx.moveTo(-11, -14 * h); ctx.lineTo(-11 - 7 * armLen, -2 * h - legPhase * 4 * armLen + armLift * armLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11, -14 * h); ctx.lineTo(11 + 7 * armLen, -2 * h + legPhase * 4 * armLen + armLift * armLen); ctx.stroke();

    // Slingshot — mounted on the front hand, a simple Y-fork with an
    // elastic band that snaps back toward the hand on fire (recoil), then
    // relaxes forward again. Visual only; actual firing is timed by the
    // game loop's cooldown, this just reacts to the same flag.
    {
      const handX = 11 + 7 * armLen, handY = -2 * h + legPhase * 4 * armLen + armLift * armLen;
      const recoil = firing ? 4 : 0;
      ctx.strokeStyle = shadeColor(bodyFill, 55); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + 5, handY - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(handX, handY); ctx.lineTo(handX + 9, handY - 6); ctx.stroke();
      ctx.strokeStyle = firing ? '#fde047' : (glow + '99'); ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(handX + 5, handY - 8);
      ctx.lineTo(handX + 3 - recoil, handY - 3);
      ctx.lineTo(handX + 9, handY - 6);
      ctx.stroke();
    }

    // Head — always a solid, complete round head with eyes from stage 0.
    // Stage 3+ adds a visor plate; max stage adds the antenna + light.
    const headY = -30 * h - bob;
    const headGrad = ctx.createLinearGradient(-9, headY - 9, 9, headY + 7);
    headGrad.addColorStop(0, shadeColor(bodyFill, 30));
    headGrad.addColorStop(0.5, bodyFill);
    headGrad.addColorStop(1, shadeColor(bodyFill, -25));
    ctx.fillStyle = headGrad;
    ctx.strokeStyle = glow; ctx.lineWidth = 2.5;
    rrect(ctx, -9, headY - 9, 18, 16, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hurt ? '#f87171' : '#00ffff';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(-3.5, headY - 1, partStage >= 3 ? 1.8 : 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3.5, headY - 1, partStage >= 3 ? 1.8 : 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = hurt ? 22 : (dashing ? 26 : 16);
    if (partStage >= 3) {
      ctx.strokeStyle = `${glow}aa`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-9, headY + 3); ctx.lineTo(9, headY + 3); ctx.stroke();
    }
    if (partStage >= maxStage) {
      ctx.strokeStyle = glow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, headY - 9); ctx.lineTo(0, headY - 16); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, headY - 18, 2.4, 0, Math.PI * 2); ctx.fillStyle = '#ffe066'; ctx.fill();
    }

    if (shielded) {
      const pulse = 0.75 + 0.25 * Math.sin(now * 0.01);
      ctx.strokeStyle = `rgba(96,165,250,${0.5 * pulse})`;
      ctx.lineWidth = 2; ctx.shadowBlur = 16; ctx.shadowColor = '#60a5fa';
      ctx.beginPath(); ctx.arc(0, -16, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore(); ctx.shadowBlur = 0;
  }

  /* ═══════════════════════════════════════════════════════════════════
     ONE RUN
  ═══════════════════════════════════════════════════════════════════ */
  function PfRun(container, opts) {
    const age  = AGE_CFG[opts.age] ? opts.age : 'child';
    const cfg  = AGE_CFG[age];
    const lang = opts.lang || 'en';
    const world = opts.world;
    const worldIdx = opts.worldIdx;
    const theme = themeFor(age, worldIdx);
    const obstacleGlyphs = AGE_OBSTACLES[age] || AGE_OBSTACLES.child;
    const overheadGlyphs = AGE_OVERHEAD[age] || AGE_OVERHEAD.teen;
    const rng = seededRng(worldIdx * 7919 + 13);
    const protocolPool = opts.protocols || [];
    // Shuffled once per run so repeat checkpoints don't repeat questions.
    const quizQueue = (opts.quiz || []).slice();
    for (let i = quizQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quizQueue[i], quizQueue[j]] = [quizQueue[j], quizQueue[i]];
    }

    let alive = true, rafId = null, els = {}, cleanupFns = [];
    let bgStars = [];
    for (let i = 0; i < 40; i++) bgStars.push({ x: rng() * 1000, y: rng() * 300, r: rng() * 1.6 + 0.4 });

    const letterQueue = [];
    world.rounds.forEach((round, ri) => {
      round.targets.forEach((ch, ci) => letterQueue.push({ text: ch, roundIdx: ri, isLastOfRound: ci === round.targets.length - 1 }));
    });
    const totalLetters = Math.max(1, letterQueue.length);

    const state = {
      startTs: Date.now(),
      collected: 0,
      parts: 0,
      coins: 0,
      shield: false,
      magnetUntil: 0,
      spawned: [],
      platforms: [],
      nextSpawnAt: 250,
      nextPlatformAt: 4500,
      elapsedMs: 0,
      projectiles: [],
      fireCooldownUntil: 0,
      speed: cfg.baseSpeed,
      worldX: 0,
      over: false,
      won: false,
      paused: true,
      sliding: false,
      shiftHeld: false,
      everHit: false,
      everLostPart: false,
      everRespawned: false,
      shakeUntil: 0,
      checkpointsHit: [],
      lastCheckpoint: null,
      pendingQuiz: null,
    };

    const player = { x: 0, y: 0, prevY: 0, vy: 0, onGround: true, w: 26, h: 30, lastGroundTs: 0, jumpBuffered: 0, hurtUntil: 0, jumpsUsed: 0, dashUntil: 0, onPlatform: null, fireFlashUntil: 0 };

    let particles = [];
    const music = MusicLoop(worldIdx);

    function on(el, ev, fn, o2) { el.addEventListener(ev, fn, o2); cleanupFns.push(() => el.removeEventListener(ev, fn, o2)); }
    function teardown() {
      alive = false;
      if (rafId) cancelAnimationFrame(rafId);
      music.stop();
      cleanupFns.forEach(fn => { try { fn(); } catch (_) {} });
      cleanupFns = [];
    }
    container.__katPfTeardown && container.__katPfTeardown();
    container.__katPfTeardown = teardown;

    buildFrame();
    showIntro();
    bumpWorldsPlayed(age);
    rafId = requestAnimationFrame(loop);

    /* ─── DOM ───────────────────────────────────────────────────────── */
    function buildFrame() {
      const showHint = cfg.hints === 'always' || (cfg.hints === 'first3' && worldsPlayedCount(age) < 3);
      container.innerHTML = `
        <div class="snake-hud">
          <div class="game-score-box"><span class="game-score-num" id="pf-parts">0/${cfg.partStages}</span><span class="game-score-lbl">${t(lang,'part')}</span></div>
          <div class="game-round-info">${world.icon} ${world.title}</div>
          <div class="game-score-box"><span class="game-score-num" id="pf-letters">0/${totalLetters}</span><span class="game-score-lbl">${t(lang,'letters')}</span></div>
        </div>
        <div class="pf-subhud">
          <span id="pf-coins">🪙 0</span>
          <span id="pf-shield" class="hidden">🛡️</span>
          <button class="pf-icon-btn" id="pf-mute" title="${t(lang,'mute')}">${MUTED ? '🔇' : '🔊'}</button>
          <button class="pf-icon-btn" id="pf-exit" title="${t(lang,'exit')}">✕</button>
        </div>
        <div class="snake-canvas-wrap">
          <canvas id="pf-canvas"></canvas>
          <div class="snake-overlay hidden" id="pf-overlay"></div>
          <div class="pf-toast hidden" id="pf-toast"></div>
        </div>
        <div class="pf-controls" id="pf-controls">
          ${cfg.slide ? `<button class="pf-btn pf-btn-slide" id="pf-slide">▼ ${t(lang,'slide')}</button>` : '<span></span>'}
          ${cfg.dash  ? `<button class="pf-btn pf-btn-dash" id="pf-dash">⚡ ${t(lang,'dash')}</button>` : '<span></span>'}
          <button class="pf-btn pf-btn-jump" id="pf-jump">▲ ${t(lang,'jump')}</button>
        </div>
        ${showHint ? `<p class="snake-hint">${t(lang, 'hint')}</p>` : ''}`;

      els.canvas  = container.querySelector('#pf-canvas');
      els.ctx     = els.canvas.getContext('2d');
      els.overlay = container.querySelector('#pf-overlay');
      els.toast   = container.querySelector('#pf-toast');
      els.parts   = container.querySelector('#pf-parts');
      els.letters = container.querySelector('#pf-letters');
      els.coins   = container.querySelector('#pf-coins');
      els.shieldI = container.querySelector('#pf-shield');

      // Measure the real leftover viewport height instead of a fixed
      // cap, so fullscreen mode fills the whole screen on mobile.
      const wrap = container.querySelector('.snake-canvas-wrap');
      const chromeH = Array.from(container.children)
        .filter(el => el !== wrap)
        .reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
      const avW = Math.min(container.clientWidth || window.innerWidth - 16, window.innerWidth - 16, 680);
      const avH = Math.max(280, Math.min(window.innerHeight - chromeH - 32, 760));
      els.canvas.width  = Math.max(280, avW);
      els.canvas.height = Math.max(200, avH);
      els.canvas.style.width = '100%';
      els.canvas.style.maxWidth = els.canvas.width + 'px';

      player.x = els.canvas.width * 0.22;
      state.groundY = els.canvas.height * 0.72;
      player.y = state.groundY; player.prevY = state.groundY;

      on(container.querySelector('#pf-jump'), 'pointerdown', (e) => { e.preventDefault(); doJump(); });
      const slideBtn = container.querySelector('#pf-slide');
      if (slideBtn) {
        on(slideBtn, 'pointerdown', (e) => { e.preventDefault(); state.sliding = true; });
        on(slideBtn, 'pointerup',   () => { state.sliding = false; });
        on(slideBtn, 'pointerleave',() => { state.sliding = false; });
      }
      const dashBtn = container.querySelector('#pf-dash');
      if (dashBtn) on(dashBtn, 'pointerdown', (e) => { e.preventDefault(); doDash(); });
      on(container.querySelector('#pf-mute'), 'click', (e) => {
        setMuted(!MUTED); e.currentTarget.textContent = MUTED ? '🔇' : '🔊';
        if (MUTED) music.stop(); else if (!state.paused) music.start();
      });
      on(container.querySelector('#pf-exit'), 'click', () => finishRun('exit'));

      on(document, 'keydown', (e) => {
        if (e.key === 'Shift') state.shiftHeld = true;
        if (['ArrowUp', 'w', 'W', ' ', 'Spacebar'].includes(e.key)) { e.preventDefault(); state.shiftHeld && cfg.dash ? doDash() : doJump(); }
        if (cfg.slide && (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S')) state.sliding = true;
      });
      on(document, 'keyup', (e) => {
        if (e.key === 'Shift') state.shiftHeld = false;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.sliding = false;
      });
      on(els.canvas, 'pointerdown', (e) => { e.preventDefault(); doJump(); });
    }

    /* ─── INPUT ───────────────────────────────────────────────────── */
    function doJump() {
      if (state.paused || state.over) return;
      const now = Date.now();
      if (player.onGround || now - player.lastGroundTs < 90) {
        player.vy = cfg.jumpVel; player.onGround = false; player.jumpsUsed = 1;
        playJumpSound(); haptic([15]);
      } else if (cfg.doubleJump && player.jumpsUsed < 2) {
        player.vy = cfg.jumpVel * 0.85; player.jumpsUsed = 2;
        playJump2Sound(); haptic([15, 15, 15]);
        spawnBurst(particles, player.x, player.y - 15, theme.accent, 10);
      } else {
        player.jumpBuffered = now;
      }
    }
    function doDash() {
      if (state.paused || state.over || !cfg.dash) return;
      const now = Date.now();
      if (now < player.dashUntil) return;
      player.dashUntil = now + 500;
      playDashSound(); haptic([30]);
      spawnBurst(particles, player.x - 10, player.y - 15, '#ffffff', 12);
    }

    /* ─── OVERLAYS ────────────────────────────────────────────────── */
    function showIntro() {
      state.paused = true;
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">${world.icon} ${world.title}</p>
          <p class="pf-lesson-text">${world.lessonText || ''}</p>
          <button class="btn-primary" id="pf-start-btn">${t(lang, 'start')}</button>
        </div>`;
      els.overlay.querySelector('#pf-start-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); state.paused = false; state.startTs = Date.now();
        music.start();
        seedOpeningSpawn();
      }, { once: true });
    }

    // Without this, the run opens on an empty runway: nothing spawns for
    // ~250ms, then it still has to travel the full canvas width to reach
    // the player — several dead seconds of "nothing happening" before the
    // very first letter/obstacle. Put one letter within easy reach right away.
    function seedOpeningSpawn() {
      const nextLetter = letterQueue[0];
      if (!nextLetter) return;
      state.spawned.push({ kind: 'letter', x: els.canvas.width * 0.62, y: state.groundY - 34, w: 22, h: 22, text: nextLetter.text, qidx: 0 });
      // Also guarantee one working bonus shows up almost immediately —
      // with only a ~16% combined chance per random spawn, it's easy for a
      // short test run to never see one and conclude "bonuses don't work".
      state.spawned.push({ kind: 'shield', x: els.canvas.width * 0.9, y: state.groundY - 34, w: 22, h: 22 });
    }

    function showFact(round) {
      state.paused = true;
      playCollectSound(); haptic([40, 20, 60]);
      // Letters concatenate into one word ('B','O','T' -> "BOT"), but
      // 'word'/'phrase' rounds hold separate tokens that need a real space
      // between them ('ИИ','УЧИТСЯ' -> "ИИ УЧИТСЯ") — joining those with ''
      // welds them into one unbroken, unwrappable string that blows out
      // of the card. Same distinction js/snake.js already makes.
      const wordDisplay = round.unit === 'letter' ? round.targets.join('') : round.targets.join(' ');
      const sizeClass = round.unit === 'letter' ? 'snake-word-reveal-letter' : 'snake-word-reveal-word';
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-word-reveal ${sizeClass}">${wordDisplay}</p>
          <p class="snake-overlay-icon">${round.icon || '💡'}</p>
          <p class="snake-overlay-fact">${round.fact || ''}</p>
          <button class="btn-primary" id="pf-cont-btn">${t(lang, 'cont')}</button>
        </div>`;
      els.overlay.querySelector('#pf-cont-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); state.paused = false;
      }, { once: true });

      // Read the learned word/phrase + fact aloud — the youngest players
      // can't read yet, and this fact is the whole point of the round.
      if ((age === 'tiny' || age === 'child') && window.speakText) {
        window.speakText(`${wordDisplay}. ${round.fact || ''}`);
      }
    }

    function toast(msg) {
      els.toast.textContent = msg;
      els.toast.classList.remove('hidden');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => els.toast.classList.add('hidden'), 1600);
    }

    /* ─── SPAWNING (point pickups / hazards) ─────────────────────── */
    function scheduleSpawn() {
      const progress = Math.min(1, state.elapsedMs / (cfg.rampSec * 1000));
      const gap = lerp(cfg.gapMax, cfg.gapMin, progress);
      state.nextSpawnAt = state.elapsedMs + gap * (0.75 + Math.random() * 0.5);
    }
    function countKind(kind) { return state.spawned.filter(s => s.kind === kind).length; }

    // A wrong letter drawn from this world's own alphabet/script (never a
    // hardcoded Latin pool — that would look broken next to Cyrillic/Hindi/etc).
    function wrongLetter(correct) {
      const pool = letterQueue.map(l => l.text).filter(c => c !== correct);
      if (!pool.length) return correct;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function trySpawn() {
      if (state.elapsedMs < state.nextSpawnAt) return;
      scheduleSpawn();
      const spawnX = els.canvas.width + 40;
      const nextIdx = state.collected + countKind('letter');
      const nextLetter = letterQueue[nextIdx];
      const roll = Math.random();

      if (nextLetter && countKind('letter') === 0 && roll < 0.42) {
        state.spawned.push({ kind: 'letter', x: spawnX, y: state.groundY - 34, w: 22, h: 22, text: nextLetter.text, qidx: nextIdx });
        // From world 2 onward: sometimes a "hallucinated" fake letter rides
        // alongside the real one — same glow, wrong text, subtle glitch.
        // Teaches the site's core lesson (spot the fake) inside the game itself.
        if (worldIdx >= 1 && countKind('fake') === 0 && Math.random() < 0.4) {
          state.spawned.push({ kind: 'fake', x: spawnX + 46, y: state.groundY - 34, w: 22, h: 22, text: wrongLetter(nextLetter.text) });
        }
        return;
      }
      if (roll < 0.52) {
        state.spawned.push({ kind: 'coin', x: spawnX, y: state.groundY - 20, w: 16, h: 16 });
        return;
      }
      if (roll < 0.58) {
        state.spawned.push({ kind: 'shield', x: spawnX, y: state.groundY - 34, w: 22, h: 22 });
        return;
      }
      if (roll < 0.63) {
        state.spawned.push({ kind: 'magnet', x: spawnX, y: state.groundY - 34, w: 22, h: 22 });
        return;
      }
      if (roll < 0.68) {
        state.spawned.push({ kind: 'spring', x: spawnX, y: state.groundY - 10, w: 24, h: 14 });
        return;
      }
      if (cfg.slide && roll < 0.80) {
        state.spawned.push({ kind: 'overhead', x: spawnX, y: state.groundY - 34, w: 22, h: 22, glyph: overheadGlyphs[Math.floor(Math.random() * overheadGlyphs.length)] });
      } else {
        state.spawned.push({ kind: 'obstacle', x: spawnX, y: state.groundY - 14, w: 24, h: 24, glyph: obstacleGlyphs[Math.floor(Math.random() * obstacleGlyphs.length)] });
      }
      // Cluster extra obstacles for older ages (more on-screen at once)
      const activeHazards = countKind('obstacle') + countKind('overhead');
      if (activeHazards < cfg.obstacleMax && Math.random() < (cfg.obstacleMax - 2) * 0.12) {
        state.spawned.push({ kind: 'obstacle', x: spawnX + 90 + Math.random() * 60, y: state.groundY - 14, w: 24, h: 24, glyph: obstacleGlyphs[Math.floor(Math.random() * obstacleGlyphs.length)] });
      }
    }

    /* ─── PLATFORMS (optional elevated bonus path) ───────────────── */
    function schedulePlatform() {
      state.nextPlatformAt = state.elapsedMs + 4200 + Math.random() * 2600;
    }
    function trySpawnPlatform() {
      if (state.elapsedMs < state.nextPlatformAt) return;
      schedulePlatform();
      const width = 150 + Math.random() * 100;
      const x1 = els.canvas.width + 60;
      let kind = 'static';
      if (worldIdx >= 2 && Math.random() < 0.4) kind = 'unstable';
      else if (worldIdx >= 1 && Math.random() < 0.5) kind = 'moving';
      const p = { x1, x2: x1 + width, yOff: 58 + Math.random() * 26, kind, phase: Math.random() * 10, touchedAt: 0, gone: false };
      state.platforms.push(p);
      const coinCount = 2 + Math.floor(Math.random() * 2);
      const baseY = state.groundY - p.yOff - 18;
      for (let i = 0; i < coinCount; i++) {
        state.spawned.push({ kind: 'coin', x: x1 + (width / (coinCount + 1)) * (i + 1), y: baseY, w: 14, h: 14 });
      }
    }
    function platformY(p) {
      const base = state.groundY - p.yOff;
      return p.kind === 'moving' ? base + Math.sin(state.elapsedMs / 420 + p.phase) * 16 : base;
    }

    /* ─── COLLECT / DAMAGE ────────────────────────────────────────── */
    function collectLetter(item) {
      state.collected++;
      playCollectSound(); haptic([30]);
      spawnBurst(particles, item.x, item.y, '#00ff88', 14);
      els.letters.textContent = state.collected + '/' + totalLetters;
      const stage = Math.floor(state.collected * cfg.partStages / totalLetters);
      if (stage > state.parts) { state.parts = stage; els.parts.textContent = state.parts + '/' + cfg.partStages; }

      maybeCheckpoint();
      updateAchievements({ letters: 1 }, lang, (list) => { if (list.length) toast('🏅 ' + list[0]); });

      const entry = letterQueue[item.qidx];
      if (state.collected >= totalLetters) { finishRun('won'); return; }
      const pendingFact = (entry && entry.isLastOfRound) ? world.rounds[entry.roundIdx] : null;
      if (state.pendingQuiz) {
        const q = state.pendingQuiz; state.pendingQuiz = null;
        showQuiz(q, () => { if (pendingFact) showFact(pendingFact); });
      } else if (pendingFact) {
        showFact(pendingFact);
      }
    }
    function collectCoin(item) {
      state.coins += 10;
      playCoinSound(); haptic([12]);
      spawnBurst(particles, item.x, item.y, '#fbbf24', 8);
      els.coins.textContent = '🪙 ' + state.coins;
    }
    function collectShield() {
      state.shield = true;
      playShieldSound(); haptic([20, 10, 20]);
      els.shieldI.classList.remove('hidden');
      toast('🛡️ ' + t(lang, 'shieldOn'));
    }
    function collectMagnet() {
      state.magnetUntil = Date.now() + 3000;
      playShieldSound(); haptic([20]);
      toast('🧲 ' + t(lang, 'magnetOn'));
    }
    function hitSpring() {
      player.vy = cfg.jumpVel * 1.6; player.onGround = false; player.jumpsUsed = 0;
      playSpringSound(); haptic([40]);
      spawnBurst(particles, player.x, player.y, theme.accent, 12);
    }

    function maybeCheckpoint() {
      // On very short worlds a single letter can cross more than one
      // threshold at once (e.g. a 2-letter world jumps 0.5 -> 1.0) — only
      // announce the highest one newly crossed, but still record it as the
      // respawn snapshot either way.
      const frac = state.collected / totalLetters;
      let newlyHit = null;
      [0.3, 0.6, 0.9].forEach(cp => {
        if (frac >= cp && !state.checkpointsHit.includes(cp)) {
          state.checkpointsHit.push(cp);
          newlyHit = cp;
        }
      });
      if (newlyHit !== null) {
        state.lastCheckpoint = { collected: state.collected, parts: state.parts, elapsedMs: state.elapsedMs, coins: state.coins };
        playCheckpointSound(); haptic([15, 10, 15]);
        toast('🚩 ' + t(lang, 'checkpoint'));
        if (quizQueue.length) state.pendingQuiz = quizQueue.pop();
      }
    }

    // A quiz question is real content from data.quiz (yes/no + a written
    // explanation) — not invented here, just surfaced at checkpoints so
    // the three games stop reusing only the same ~15 letter-rounds.
    function showQuiz(q, cb) {
      state.paused = true;
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">🚩 ${t(lang, 'quizKicker')}</p>
          <p class="pf-lesson-text" style="font-weight:700;">${q.q}</p>
          <div class="action-row" style="justify-content:center;gap:10px;margin-bottom:4px;">
            <button class="btn-primary" id="pf-quiz-yes">👍 ${t(lang,'yes')}</button>
            <button class="btn-primary" id="pf-quiz-no" style="background:var(--card2)">👎 ${t(lang,'no')}</button>
          </div>
        </div>`;
      const answer = (val) => {
        const correct = val === q.correct;
        (correct ? playCheckpointSound : playHitSound)();
        if (correct) window.KAT_Companion?.recordAccomplishment('q_' + q.q, lang);
        els.overlay.innerHTML = `
          <div class="snake-overlay-card">
            <p class="snake-overlay-kicker" style="color:${correct ? 'var(--green)' : 'var(--red)'}">${correct ? '✅' : '❌'}</p>
            <p class="snake-overlay-fact">${q.explanation || ''}</p>
            <button class="btn-primary" id="pf-quiz-cont">${t(lang,'cont')}</button>
          </div>`;
        els.overlay.querySelector('#pf-quiz-cont').addEventListener('click', () => {
          if (!alive) return;
          els.overlay.classList.add('hidden'); state.paused = false; cb();
        }, { once: true });
      };
      els.overlay.querySelector('#pf-quiz-yes').addEventListener('click', () => answer(1), { once: true });
      els.overlay.querySelector('#pf-quiz-no').addEventListener('click', () => answer(0), { once: true });
    }

    function respawnAtCheckpoint() {
      state.everRespawned = true;
      const cp = state.lastCheckpoint || { collected: 0, parts: 0, elapsedMs: 0, coins: state.coins };
      state.collected = cp.collected; state.parts = cp.parts; state.elapsedMs = cp.elapsedMs; state.coins = cp.coins;
      els.letters.textContent = state.collected + '/' + totalLetters;
      els.parts.textContent = state.parts + '/' + cfg.partStages;
      els.coins.textContent = '🪙 ' + state.coins;
      // NOT clearing state.spawned/platforms here: this runs from inside
      // the entity-collision loop in update() (via takeHit), which is
      // actively iterating that same array. Reassigning/emptying it mid-loop
      // leaves later iterations reading undefined and throws. The 1.4s
      // invulnerability window below is what actually keeps the player safe.
      player.hurtUntil = Date.now() + 1400;
      spawnBurst(particles, player.x, player.y - 15, '#f87171', 16);
    }

    function takeHit() {
      const now = Date.now();
      if (now < player.hurtUntil || now < player.dashUntil) return; // invulnerable while dashing
      state.everHit = true;
      if (state.shield) {
        state.shield = false; els.shieldI.classList.add('hidden');
        player.hurtUntil = now + 700;
        playShieldSound(); haptic([30]);
        spawnBurst(particles, player.x, player.y - 15, '#60a5fa', 14);
        return;
      }
      player.hurtUntil = now + 900;
      state.shakeUntil = now + 220;
      playHitSound(); haptic([80, 40, 80]);
      spawnBurst(particles, player.x, player.y - 15, '#f87171', 14);
      if (state.parts > 0) {
        state.parts--; state.everLostPart = true;
        els.parts.textContent = state.parts + '/' + cfg.partStages;
      } else {
        respawnAtCheckpoint();
      }
    }

    /* ─── FINISH ──────────────────────────────────────────────────── */
    function finishRun(reason) {
      if (state.over) return;
      state.over = true; state.won = reason === 'won'; state.paused = true;
      music.stop();

      let stars = 0, streakBonus = 0, streakInfo = null;
      if (state.won) {
        // 3★ flawless (never touched); 2★ took damage but never needed a
        // checkpoint rescue; 1★ needed at least one. Previously 2★ required
        // every single hit to be shield-absorbed, which made it nearly
        // unreachable by luck alone — one unshielded scrape dropped straight
        // to 1★ even on an otherwise clean run.
        stars = !state.everHit ? 3 : (!state.everRespawned ? 2 : 1);
        setStarsIfBetter(age, worldIdx, stars);
        const { streak, bonus } = bumpStreak();
        streakInfo = streak;
        if (bonus) streakBonus = 20;
      }

      const seconds = (Date.now() - state.startTs) / 1000;
      const score = Math.round(seconds * 10) + state.collected * 50 + state.coins + streakBonus;
      if (state.won) { playWinSound(); markCleared(age, worldIdx); window.KAT_Companion?.recordAccomplishment(`pf_${age}_w${worldIdx}`, lang); }
      else if (reason !== 'exit') playGameOverSound();

      if (state.parts === cfg.partStages && !skinsUnlocked()) unlockSkins();

      // letters are counted live per-pickup in collectLetter() — not repeated
      // here, or every run would double (triple, ...) count its own letters.
      let newAch = [];
      updateAchievements({ score, worldWon: state.won, flawless: state.won && !state.everHit }, lang, (list) => { newAch = list; });

      const board = window.KAT_Leaderboard;
      const { isRecord } = board ? board.saveScore(age, worldIdx, score, '') : { isRecord: false };
      const best = board ? board.getBest(age, worldIdx) : score;

      if (reason === 'exit') { teardown(); if (opts.onExit) opts.onExit(); return; }

      // A protocol card (real, written safety/practical tip from
      // data.protocols) on every world clear — cycles by world index so
      // repeated clears eventually surface all of them, not just letters.
      const protocol = state.won && protocolPool.length ? protocolPool[worldIdx % protocolPool.length] : null;

      const hasNext = state.won && opts.totalWorlds && (worldIdx + 1) < opts.totalWorlds && worldUnlocked(age, worldIdx + 1, opts.totalWorlds);
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">${state.won ? t(lang,'worldClear') : t(lang,'gameOver')}</p>
          ${state.won ? `<p style="font-size:1.6rem;margin-bottom:6px;">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>` : ''}
          <div class="game-score-box" style="margin:0 auto 10px;"><span class="game-score-num">${score}</span><span class="game-score-lbl">${t(lang,'score')}</span></div>
          ${isRecord ? `<p class="snake-overlay-fact" style="color:var(--green)">🏆 ${t(lang,'record')}</p>` : ''}
          <p class="snake-overlay-fact">${t(lang,'letters')}: ${state.collected}/${totalLetters} · 🪙 ${state.coins} · ${t(lang,'best')}: ${best}</p>
          ${streakInfo ? `<p class="snake-overlay-fact">🔥 ${streakInfo.count} ${t(lang,'streak')}${streakBonus ? ' · +' + streakBonus + ' ' + t(lang,'streakBonus') : ''}</p>` : ''}
          ${protocol ? `<p class="snake-overlay-fact" style="border-top:1px solid var(--border2);padding-top:8px;">${protocol.icon || '📋'} <strong>${protocol.title || ''}</strong><br>${protocol.text || ''}</p>` : ''}
          ${newAch.length ? `<p class="snake-overlay-fact" style="color:var(--yellow)">🏅 ${t(lang,'achUnlocked')}<br>${newAch.join('<br>')}</p>` : ''}
          <div class="action-row" style="justify-content:center;gap:8px;flex-wrap:wrap;">
            ${hasNext ? `<button class="btn-primary" id="pf-next-btn">${t(lang,'cont')}</button>` : ''}
            <button class="btn-primary" id="pf-again-btn"${hasNext ? ' style="background:var(--card2)"' : ''}>${t(lang,'again')}</button>
            <button class="btn-primary" id="pf-back-btn" style="background:var(--card2)">${t(lang,'back')}</button>
          </div>
        </div>`;
      if (hasNext) {
        els.overlay.querySelector('#pf-next-btn').addEventListener('click', () => {
          if (!alive) return; teardown(); opts.startWorld(worldIdx + 1);
        }, { once: true });
      }
      els.overlay.querySelector('#pf-again-btn').addEventListener('click', () => {
        if (!alive) return; teardown(); new PfRun(container, opts);
      }, { once: true });
      els.overlay.querySelector('#pf-back-btn').addEventListener('click', () => {
        if (!alive) return; teardown(); if (opts.onExit) opts.onExit();
      }, { once: true });
    }

    /* ─── LOOP ────────────────────────────────────────────────────── */
    let lastTs = Date.now();
    function loop() {
      if (!alive) return;
      const now = Date.now();
      const dt = Math.min(48, now - lastTs); lastTs = now;
      if (!state.paused && !state.over) update(dt, now);
      draw(now);
      rafId = requestAnimationFrame(loop);
    }

    function update(dt, now) {
      state.elapsedMs += dt;
      const progress = Math.min(1, state.elapsedMs / (cfg.rampSec * 1000));
      const dashMult = now < player.dashUntil ? 1.6 : 1;
      state.speed = lerp(cfg.baseSpeed, cfg.maxSpeed, progress) * dashMult;
      state.worldX += state.speed * (dt / 16.6);

      // Physics
      player.prevY = player.y;
      player.vy += cfg.gravity * (dt / 16.6);
      player.y += player.vy * (dt / 16.6);

      // Platform surfaces (one-way: only solid when approaching from above)
      let landedPlatform = null;
      for (const p of state.platforms) {
        if (p.gone) continue;
        if (player.x >= p.x1 && player.x <= p.x2) {
          const py = platformY(p);
          const wasAbove = player.prevY <= py + 2;
          if (player.vy >= 0 && wasAbove && player.y >= py) { landedPlatform = p; landedPlatform._y = py; break; }
        }
      }
      const jumpBufferReady = player.jumpBuffered && now - player.jumpBuffered < 150;
      if (landedPlatform) {
        if (jumpBufferReady) {
          player.y = landedPlatform._y;
          player.jumpBuffered = 0; player.vy = cfg.jumpVel; player.jumpsUsed = 1; player.onGround = false; player.onPlatform = null;
        } else {
          player.y = landedPlatform._y; player.vy = 0; player.onPlatform = landedPlatform;
          if (!player.onGround) { player.onGround = true; player.lastGroundTs = now; player.jumpsUsed = 0; }
          if (!landedPlatform.touchedAt) landedPlatform.touchedAt = now;
        }
      } else if (player.y >= state.groundY) {
        player.y = state.groundY; player.vy = 0; player.onPlatform = null;
        if (jumpBufferReady) {
          player.jumpBuffered = 0; player.vy = cfg.jumpVel; player.jumpsUsed = 1; player.onGround = false;
        } else {
          player.onGround = true; player.lastGroundTs = now; player.jumpsUsed = 0;
        }
      } else {
        player.onGround = false; player.onPlatform = null;
      }

      // Unstable platforms crumble on a timer once first touched, whether
      // or not the player is still standing on them right now — otherwise
      // one briefly stepped on and left behind shakes forever without ever
      // actually breaking.
      state.platforms.forEach(p => {
        if (!p.gone && p.kind === 'unstable' && p.touchedAt && now - p.touchedAt > 1000) {
          p.gone = true;
          spawnBurst(particles, (p.x1 + p.x2) / 2, platformY(p), '#f59e0b', 10);
          if (player.onPlatform === p) { player.onPlatform = null; player.onGround = false; player.vy = 0.5; }
        }
      });

      // Spawning
      trySpawn();
      trySpawnPlatform();

      // Move + collide entities
      const dx = state.speed * (dt / 16.6);
      const magnetActive = now < state.magnetUntil;
      for (let i = state.spawned.length - 1; i >= 0; i--) {
        const s = state.spawned[i];
        s.x -= dx;
        if (magnetActive && s.kind === 'letter') {
          const d = Math.abs(s.x - player.x);
          if (d < 100) s.x -= Math.sign(s.x - player.x) * Math.min(d, 6 * (dt / 16.6));
        }
        if (s.x < -60) { state.spawned.splice(i, 1); continue; }

        const px = player.x, py = player.y - (state.sliding ? 8 : 22);
        const hitboxH = state.sliding ? 14 : 30;
        const dist = Math.abs(s.x - px);
        const vOverlap = Math.abs(s.y - py) < (hitboxH / 2 + s.h / 2) - 4;
        if (dist < (player.w / 2 + s.w / 2) - 6 && vOverlap) {
          if (s.kind === 'letter') { collectLetter(s); state.spawned.splice(i, 1); }
          else if (s.kind === 'coin') { collectCoin(s); state.spawned.splice(i, 1); }
          else if (s.kind === 'shield') { collectShield(); state.spawned.splice(i, 1); }
          else if (s.kind === 'magnet') { collectMagnet(); state.spawned.splice(i, 1); }
          else if (s.kind === 'spring') { hitSpring(); }
          else if (s.kind === 'overhead' && state.sliding) { /* safely slid under it */ }
          else if (s.kind === 'fake') { takeHit(); toast('👻 ' + t(lang, 'fakeHit')); state.spawned.splice(i, 1); }
          else if (s.kind === 'obstacle' || s.kind === 'overhead') { takeHit(); state.spawned.splice(i, 1); }
        }
      }

      // Slingshot: auto-targets the nearest untouched ground obstacle ahead
      // and fires a pellet at it on a cooldown. Keeps input dead simple
      // (still just tap-to-jump) so it works for the tiny/child bands too —
      // no separate fire button to learn. Only ever targets 'obstacle'
      // (ground hazards), never 'overhead' (those are meant to be slid
      // under) or pickups/letters.
      if (now >= state.fireCooldownUntil) {
        let nearest = null, nearestDx = Infinity;
        for (const s of state.spawned) {
          if (s.kind !== 'obstacle' || s._targeted) continue;
          const ddx = s.x - player.x;
          if (ddx > 0 && ddx < cfg.fireRange && ddx < nearestDx) { nearest = s; nearestDx = ddx; }
        }
        if (nearest) {
          nearest._targeted = true;
          state.projectiles.push({ x: player.x + 14, y: player.y - 20, target: nearest, speed: 13 });
          state.fireCooldownUntil = now + cfg.fireRate;
          player.fireFlashUntil = now + 150;
          playZapSound();
        }
      }

      // Move + collide projectiles against their locked target.
      for (let i = state.projectiles.length - 1; i >= 0; i--) {
        const pr = state.projectiles[i];
        const target = pr.target;
        if (!target || state.spawned.indexOf(target) === -1) { state.projectiles.splice(i, 1); continue; }
        const tdx = target.x - pr.x, tdy = target.y - pr.y;
        const dist = Math.hypot(tdx, tdy);
        if (dist < 14) {
          const oi = state.spawned.indexOf(target);
          if (oi !== -1) state.spawned.splice(oi, 1);
          spawnBurst(particles, pr.x, pr.y, '#facc15', 12);
          playZapHitSound();
          state.coins += 1;
          if (els.coins) els.coins.textContent = '🪙 ' + state.coins;
          state.projectiles.splice(i, 1);
          continue;
        }
        const step = pr.speed * (dt / 16.6);
        pr.x += (tdx / dist) * step - dx; // -dx: world scroll also carries the pellet back
        pr.y += (tdy / dist) * step;
        if (pr.x < -60) state.projectiles.splice(i, 1);
      }

      // Move platforms with the world, drop them once fully passed
      for (let i = state.platforms.length - 1; i >= 0; i--) {
        const p = state.platforms[i];
        p.x1 -= dx; p.x2 -= dx;
        if (p.x2 < -80) state.platforms.splice(i, 1);
      }

      tickParticles(particles);
    }

    /* ─── RENDER ──────────────────────────────────────────────────── */
    function drawTiledBg(ctx, img, W, H, offsetX, alpha) {
      const pattern = ctx.createPattern(img, 'repeat');
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(offsetX % img.width, 0);
      ctx.fillStyle = pattern;
      ctx.fillRect(-img.width, 0, W + img.width * 2, H);
      ctx.restore();
    }

    function drawSun(ctx, W, H) {
      const sx = W * 0.78, sy = H * 0.18, r = Math.min(W, H) * 0.1;
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.4);
      glow.addColorStop(0, 'rgba(255,238,176,0.9)'); glow.addColorStop(0.45, 'rgba(255,205,110,0.45)'); glow.addColorStop(1, 'rgba(255,205,110,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(sx, sy, r * 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff4d6'; ctx.shadowColor = '#ffe9a8'; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawBackground(ctx, W, H, now) {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, theme.sky[0]); grad.addColorStop(0.7, theme.sky[1]); grad.addColorStop(1, theme.sky[1]);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      const mode = bgModeFor(age);
      if (mode === 'clouds') {
        drawSun(ctx, W, H);
        if (_bgReady.clouds) drawTiledBg(ctx, _bgImg.clouds, W, H, -state.worldX * 0.12, 0.5);
      } else if (_bgReady.stars) {
        drawTiledBg(ctx, _bgImg.stars, W, H, -state.worldX * 0.08, 0.8);
      }

      // Soft glow band along the horizon so the sky doesn't just stop dead
      // at the ground line.
      const horizonGrad = ctx.createLinearGradient(0, state.groundY - 60, 0, state.groundY + 22);
      horizonGrad.addColorStop(0, 'rgba(0,0,0,0)'); horizonGrad.addColorStop(1, theme.accent + '22');
      ctx.fillStyle = horizonGrad; ctx.fillRect(0, state.groundY - 60, W, 82);

      ctx.save();
      ctx.fillStyle = theme.accent;
      const parX = (state.worldX * 0.15) % 60;
      bgStars.forEach((s, i) => {
        const x = ((s.x - parX + i * 3) % (W + 40)) - 20;
        ctx.font = Math.round(6 + s.r * 9) + 'px system-ui';
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(now * 0.001 + i);
        ctx.fillText(theme.deco, x, s.y % (H * 0.6));
      });
      ctx.restore();
    }

    function draw(now) {
      const ctx = els.ctx, W = els.canvas.width, H = els.canvas.height;
      ctx.save();
      if (now < state.shakeUntil) {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      }

      drawBackground(ctx, W, H, now);

      const hurt = now < player.hurtUntil && Math.floor(now / 90) % 2 === 0;
      if (now < player.hurtUntil) { ctx.fillStyle = 'rgba(248,113,113,0.10)'; ctx.fillRect(0, 0, W, H); }
      if (now < player.dashUntil) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, 0, W, H); }

      // Ground
      ctx.strokeStyle = theme.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(0, state.groundY + 22); ctx.lineTo(W, state.groundY + 22); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.ground; ctx.globalAlpha = 0.5;
      ctx.fillRect(0, state.groundY + 22, W, H - state.groundY - 22);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      const tick = 30, off = state.worldX % tick;
      for (let x = -off; x < W; x += tick) { ctx.beginPath(); ctx.moveTo(x, state.groundY + 22); ctx.lineTo(x - 10, state.groundY + 32); ctx.stroke(); }

      // A second, wider-spaced row of theme-accent studs for a bit of
      // ground texture instead of one flat tinted rectangle.
      ctx.fillStyle = theme.accent; ctx.globalAlpha = 0.22;
      const studGap = 70, studOff = state.worldX % studGap;
      for (let x = -studOff; x < W; x += studGap) {
        ctx.beginPath(); ctx.arc(x, state.groundY + 46, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Platforms
      state.platforms.forEach(p => {
        if (p.gone) return;
        const py = platformY(p);
        const crumble = p.kind === 'unstable' && p.touchedAt && (Date.now() - p.touchedAt > 500);
        ctx.save();
        if (crumble) ctx.translate((Math.random() - 0.5) * 4, 0);
        ctx.globalAlpha = crumble ? 0.5 : 1;
        ctx.shadowBlur = 10; ctx.shadowColor = p.kind === 'unstable' ? '#f59e0b' : theme.accent;
        ctx.strokeStyle = p.kind === 'unstable' ? '#f59e0b' : theme.accent;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.x1, py); ctx.lineTo(p.x2, py); ctx.stroke();
        ctx.restore();
      });

      // Entities
      state.spawned.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        if (s.kind === 'letter') {
          const pulse = 0.85 + 0.15 * Math.sin(now * 0.006 + s.x);
          ctx.shadowBlur = 14 * pulse; ctx.shadowColor = '#00ff88';
          ctx.fillStyle = 'rgba(0,255,136,0.14)';
          ctx.beginPath(); ctx.arc(0, 0, 15 * pulse, 0, Math.PI * 2); ctx.fill();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = pickupFont(ctx, s.text);
          ctx.fillStyle = '#00ff88'; ctx.fillText(s.text, 0, 1);
        } else if (s.kind === 'fake') {
          const glitch = Math.random() < 0.35;
          ctx.globalAlpha = glitch ? 0.55 : 0.9;
          ctx.shadowBlur = 12; ctx.shadowColor = '#c084fc';
          ctx.fillStyle = 'rgba(192,132,252,0.14)';
          ctx.beginPath(); ctx.arc(glitch ? 2 : 0, 0, 15, 0, Math.PI * 2); ctx.fill();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = pickupFont(ctx, s.text);
          ctx.fillStyle = '#c084fc'; ctx.fillText(s.text, glitch ? 2 : 0, 1);
        } else if (s.kind === 'coin') {
          ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        } else if (s.kind === 'shield') {
          ctx.shadowBlur = 12; ctx.shadowColor = '#60a5fa';
          ctx.fillStyle = 'rgba(96,165,250,0.85)';
          ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
          ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('🛡', 0, 4);
        } else if (s.kind === 'magnet') {
          ctx.shadowBlur = 12; ctx.shadowColor = '#a78bfa';
          ctx.fillStyle = 'rgba(167,139,250,0.85)';
          ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
          ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('🧲', 0, 4);
        } else if (s.kind === 'spring') {
          ctx.shadowBlur = 10; ctx.shadowColor = '#34d399';
          ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-10, 6); ctx.lineTo(-6, -6); ctx.lineTo(0, 6); ctx.lineTo(6, -6); ctx.lineTo(10, 6); ctx.stroke();
        } else {
          // Give hazards the same "glowing badge" treatment as pickups —
          // before, obstacles were a bare emoji floating with just a
          // shadow, which read as unfinished next to the polished pickups.
          const hazPulse = 0.85 + 0.15 * Math.sin(now * 0.008 + s.x);
          ctx.shadowBlur = 10 * hazPulse; ctx.shadowColor = '#f87171';
          ctx.fillStyle = 'rgba(248,113,113,0.16)';
          ctx.beginPath(); ctx.arc(0, 0, 15 * hazPulse, 0, Math.PI * 2); ctx.fill();
          ctx.font = '18px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(s.glyph, 0, 1);
        }
        ctx.restore();
      });

      state.projectiles.forEach(pr => {
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = '#facc15';
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.ellipse(pr.x, pr.y, 5, 3, Math.atan2((pr.target?pr.target.y:pr.y)-pr.y, (pr.target?pr.target.x:pr.x)-pr.x), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // The procedural robot (custom neon glow + shading, matching the
      // site's Snake/Racing art) reads far stronger than the flat,
      // desaturated Kenney sprite sheet at this size — verified side by
      // side, so it's the default now. isSpriteReady() is left wired up
      // for a future higher-detail sheet.
      if (isSpriteReady() && FORCE_SPRITE_ROBOT) {
        drawRobotSprite(ctx, player.x, player.y, {
          onGround: player.onGround, now, hurt, moving: !state.paused && !state.over,
          sliding: state.sliding && cfg.slide,
        });
      } else {
        drawRobot(ctx, player.x, player.y, {
          partStage: state.parts, maxStage: cfg.partStages, onGround: player.onGround, now, hurt,
          sliding: state.sliding && cfg.slide, shielded: state.shield, dashing: now < player.dashUntil,
          jumpsUsed: player.jumpsUsed, skinColor: SKINS[getSkin()] || theme.accent,
          firing: now < player.fireFlashUntil,
        });
      }
      drawParticles(ctx, particles);
      ctx.restore();
    }

  } // end PfRun

  /* ═══════════════════════════════════════════════════════════════════
     WORLD SELECT
  ═══════════════════════════════════════════════════════════════════ */
  function startWorldSelect(container, opts) {
    const age  = AGE_CFG[opts.age] ? opts.age : 'child';
    const lang = opts.lang || 'en';
    const lessons = opts.lessons || [];
    const rounds  = opts.rounds || [];
    const chunks  = chunkEvenly(rounds, lessons.length || 1);
    const worlds  = lessons.map((ls, i) => ({ icon: ls.icon || '🤖', title: ls.title || ('World ' + (i + 1)), lessonText: ls.text ? ls.text.slice(0, 90) + '…' : '', rounds: chunks[i] || [] }))
                            .filter(w => w.rounds.length);

    container.__katPfTeardown && container.__katPfTeardown();
    container.__katPfTeardown = null;

    if (!worlds.length) { if (opts.onAllDone) opts.onAllDone(); return; }

    render();

    function render() {
      const ach = loadAch();
      const unlocked = skinsUnlocked();
      const streak = getStreak();
      container.innerHTML = `
        ${opts.onBack ? `<button class="pf-icon-btn" id="pf-back-games" style="margin-bottom:8px;">${t(lang,'backGames')}</button>` : ''}
        <p class="snake-hint" style="margin-bottom:4px;font-weight:700;">${t(lang, 'worlds')}</p>
        <p class="pf-ach-summary">🏆 ${ach.collectedLetters} ${t(lang,'letters').toLowerCase()} · 🌍 ${ach.worldsCompleted} · ⭐ ${ach.totalScore}${streak.count ? ' · 🔥 ' + streak.count : ''}</p>
        <div class="pf-world-grid" id="pf-world-grid"></div>
        ${unlocked ? `<div class="pf-skin-row" id="pf-skin-row"></div>` : ''}`;
      if (opts.onBack) container.querySelector('#pf-back-games').addEventListener('click', opts.onBack);
      function startWorld(i) {
        new PfRun(container, { age, lang, world: worlds[i], worldIdx: i, onExit: render, quiz: opts.quiz, protocols: opts.protocols, totalWorlds: worlds.length, startWorld });
      }
      const grid = container.querySelector('#pf-world-grid');
      worlds.forEach((w, i) => {
        const cleared = isCleared(age, i);
        const stars = getStars(age, i);
        const isUnlocked = worldUnlocked(age, i, worlds.length);
        const best = window.KAT_Leaderboard ? window.KAT_Leaderboard.getBest(age, i) : 0;
        const theme = themeFor(age, i);
        const card = document.createElement('button');
        card.className = 'pf-world-card' + (cleared ? ' cleared' : '') + (isUnlocked ? '' : ' locked');
        card.style.borderColor = cleared ? 'var(--green)' : theme.accent + '55';
        card.innerHTML = isUnlocked ? `
          <span class="pf-world-icon">${w.icon}</span>
          <span class="pf-world-title">${w.title}</span>
          <span class="pf-world-stars">${cleared ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : ''}</span>
          <span class="pf-world-meta">${best ? t(lang,'best') + ': ' + best : ''}</span>` : `
          <span class="pf-world-icon">🔒</span>
          <span class="pf-world-title">${w.title}</span>
          <span class="pf-world-meta">${i === worlds.length - 1 ? t(lang,'lockedFinal') : t(lang,'locked')}</span>`;
        card.addEventListener('click', () => {
          if (!isUnlocked) return;
          startWorld(i);
        });
        grid.appendChild(card);
      });

      if (unlocked) {
        const row = container.querySelector('#pf-skin-row');
        row.innerHTML = `<span class="pf-skin-label">${t(lang,'skin')}:</span>`;
        Object.keys(SKINS).forEach(name => {
          const b = document.createElement('button');
          b.className = 'pf-skin-dot' + (getSkin() === name ? ' active' : '');
          b.style.background = SKINS[name];
          b.addEventListener('click', () => { setSkin(name); render(); });
          row.appendChild(b);
        });
      }

      const doneBtn = document.createElement('button');
      doneBtn.className = 'btn-primary';
      doneBtn.style.cssText = 'display:block;margin:14px auto 0;';
      doneBtn.textContent = '→';
      doneBtn.title = t(lang, 'skipQuiz');
      doneBtn.addEventListener('click', () => { if (opts.onAllDone) opts.onAllDone(); });
      container.appendChild(doneBtn);
    }
  }

  window.KAT_Platformer = { startWorldSelect };

})();
