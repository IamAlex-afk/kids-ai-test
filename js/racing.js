'use strict';

/* ═══════════════════════════════════════════════════════════════════
   KAT RACING — "Circuit Racer"
   Top-down, vertically-scrolling lane racer: the player's car sits near
   the bottom of the screen and switches lanes; traffic and hazards
   scroll DOWN toward it (mirror image of platformer.js's auto-runner,
   which scrolls entities left toward a fixed player).

   Same content model as the other two games: worlds = lessons
   (data.lessons[i]), letters = data.snake rounds, reused as-is across
   all 10 languages and 4 ages — no new content authoring.

   API mirrors snake.js / platformer.js:
     window.KAT_Racing.startWorldSelect(container, {
       age, lang, lessons, rounds, onAllDone
     })
═══════════════════════════════════════════════════════════════════ */

(function () {

  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (_) { return fallback; }
  }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} }

  /* ─── AGE CONFIG ─────────────────────────────────────────────────── */
  const AGE_CFG = {
    // 3 lanes for every age — difficulty comes from speed/gaps/traffic
    // density instead of lane count, so it always reads as a proper
    // 3-lane racing road rather than a cramped 2-lane strip.
    tiny:  { lanes: 3, baseSpeed: 2.4, maxSpeed: 4.6, rampSec: 55, gapMax: 1300, gapMin: 950,  obstacleMax: 2, boost: false, hints: 'always', partStages: 4 },
    child: { lanes: 3, baseSpeed: 3.2, maxSpeed: 6.4, rampSec: 48, gapMax: 1100, gapMin: 800,  obstacleMax: 4, boost: false, hints: 'first3', partStages: 4 },
    teen:  { lanes: 3, baseSpeed: 4.2, maxSpeed: 8.4, rampSec: 42, gapMax: 950,  gapMin: 620,  obstacleMax: 5, boost: true,  hints: 'never',  partStages: 4 },
    adult: { lanes: 3, baseSpeed: 4.6, maxSpeed: 9.2, rampSec: 38, gapMax: 850,  gapMin: 520,  obstacleMax: 6, boost: true,  hints: 'never',  partStages: 4 },
  };

  // Oncoming traffic colour per age (drawn as real car shapes via
  // drawTrafficCar, not emoji) — softer/warmer for the youngest, harsher
  // reds for the oldest, same "own identity per age" principle as before.
  const AGE_HAZARD_COLORS = {
    tiny:  ['#fb923c', '#fbbf24'],
    child: ['#f87171', '#fb923c'],
    teen:  ['#ef4444', '#dc2626'],
    adult: ['#dc2626', '#991b1b'],
  };
  const WORLD_THEMES_BY_AGE = {
    tiny: [
      { name: 'day',   sky: ['#1a1035', '#2d1b54'], accent: '#93c5fd', road: '#2a2050' },
      { name: 'beach', sky: ['#0f2818', '#1a4028'], accent: '#86efac', road: '#1c4028' },
      { name: 'candy', sky: ['#2a0f2e', '#3d1a42'], accent: '#f9a8d4', road: '#3a1f3d' },
      { name: 'farm',  sky: ['#241505', '#3a2408'], accent: '#fde68a', road: '#2e2410' },
    ],
    child: [
      { name: 'city',  sky: ['#05060f', '#0b1030'], accent: '#22d3ee', road: '#161c3a' },
      { name: 'forest',sky: ['#02120a', '#08281a'], accent: '#34d399', road: '#123320' },
      { name: 'neon',  sky: ['#0a0510', '#1d0f30'], accent: '#f472b6', road: '#2a1b3d' },
      { name: 'desert',sky: ['#050b0f', '#0a1e22'], accent: '#fbbf24', road: '#1c2b2f' },
    ],
    teen: [
      { name: 'night', sky: ['#030308', '#0a0a2a'], accent: '#818cf8', road: '#12122e' },
      { name: 'rain',  sky: ['#010c08', '#052018'], accent: '#2dd4bf', road: '#0a2820' },
      { name: 'strip', sky: ['#08030c', '#170a24'], accent: '#e879f9', road: '#20122e' },
      { name: 'canyon',sky: ['#030608', '#071418'], accent: '#facc15', road: '#141f22' },
    ],
    adult: [
      { name: 'storm', sky: ['#020204', '#06061a'], accent: '#6366f1', road: '#0c0c1e' },
      { name: 'fog',   sky: ['#000806', '#031810'], accent: '#14b8a6', road: '#061e18' },
      { name: 'grid',  sky: ['#050208', '#100618'], accent: '#c026d3', road: '#160c1e' },
      { name: 'dusk',  sky: ['#020404', '#0a1214'], accent: '#ca8a04', road: '#0f1719' },
    ],
  };
  function themeFor(age, worldIdx) {
    const set = WORLD_THEMES_BY_AGE[age] || WORLD_THEMES_BY_AGE.child;
    return set[worldIdx % set.length];
  }

  const SKINS = { cyan: '#22d3ee', red: '#f87171', gold: '#fbbf24' };

  const STR = {
    en: { ready: 'Get Ready!', start: 'Start ▶', cont: 'Continue →', hint: 'Tap left/right (or ←/→) to change lanes.', worlds: 'Choose a track', cleared: 'CLEARED', best: 'Best', worldClear: 'Track Clear!', gameOver: 'Run ended', record: 'New record!', back: '← Tracks', backGames: '← Games', again: 'Run Again', letters: 'Letters', score: 'Score', part: 'Car', checkpoint: 'Checkpoint!', shieldOn: 'Shield up!', boostOn: 'Boost!', skin: 'Car colour', exit: 'Exit', mute: 'Sound', left: '◀', right: '▶', boost: 'BOOST', achUnlocked: 'Achievement unlocked!', fakeHit: 'That letter was fake!', locked: 'Needs 2★ in the previous track', streak: 'day streak', streakBonus: 'Streak bonus', achTrack1: 'First track cleared', achTrack5: '5 tracks cleared', achFlawless: 'Flawless run', yes: 'Yes', no: 'No', quizKicker: 'Pit stop!', lockedFinal: 'Needs 3★ on every earlier track', skipQuiz: 'Skip to quiz' },
    ru: { ready: 'Приготовься!', start: 'Старт ▶', cont: 'Дальше →', hint: 'Тап влево/вправо (или ←/→) — смена полосы.', worlds: 'Выбери трассу', cleared: 'ПРОЙДЕНО', best: 'Рекорд', worldClear: 'Трасса пройдена!', gameOver: 'Заезд окончен', record: 'Новый рекорд!', back: '← Трассы', backGames: '← Игры', again: 'Ещё раз', letters: 'Буквы', score: 'Очки', part: 'Машина', checkpoint: 'Чекпоинт!', shieldOn: 'Щит поднят!', boostOn: 'Ускорение!', skin: 'Цвет машины', exit: 'Выход', mute: 'Звук', left: '◀', right: '▶', boost: 'УСКОРЕНИЕ', achUnlocked: 'Новое достижение!', fakeHit: 'Это была подделка!', locked: 'Нужно 2★ на предыдущей трассе', streak: 'дней подряд', streakBonus: 'Бонус за серию', achTrack1: 'Первая трасса пройдена', achTrack5: '5 трасс пройдено', achFlawless: 'Идеальный заезд', yes: 'Да', no: 'Нет', quizKicker: 'Пит-стоп!', lockedFinal: 'Нужно 3★ на всех предыдущих трассах', skipQuiz: 'Пропустить к квизу' },
    de: { ready: 'Bereit machen!', start: 'Start ▶', cont: 'Weiter →', hint: 'Tippe links/rechts (oder ←/→) zum Spurwechsel.', worlds: 'Strecke wählen', cleared: 'GESCHAFFT', best: 'Bestwert', worldClear: 'Strecke geschafft!', gameOver: 'Lauf beendet', record: 'Neuer Rekord!', back: '← Strecken', backGames: '← Spiele', again: 'Nochmal', letters: 'Buchstaben', score: 'Punkte', part: 'Auto', checkpoint: 'Kontrollpunkt!', shieldOn: 'Schild aktiv!', boostOn: 'Boost!', skin: 'Autofarbe', exit: 'Verlassen', mute: 'Ton', left: '◀', right: '▶', boost: 'BOOST', achUnlocked: 'Erfolg freigeschaltet!', fakeHit: 'Dieser Buchstabe war falsch!', locked: 'Braucht 2★ auf der vorherigen Strecke', streak: 'Tage in Folge', streakBonus: 'Serien-Bonus', achTrack1: 'Erste Strecke geschafft', achTrack5: '5 Strecken geschafft', achFlawless: 'Perfekter Lauf', yes: 'Ja', no: 'Nein', quizKicker: 'Boxenstopp!', lockedFinal: 'Braucht 3★ auf jeder vorherigen Strecke', skipQuiz: 'Zum Quiz springen' },
    es: { ready: '¡Prepárate!', start: 'Empezar ▶', cont: 'Continuar →', hint: 'Toca izquierda/derecha (o ←/→) para cambiar de carril.', worlds: 'Elige una pista', cleared: 'SUPERADO', best: 'Mejor', worldClear: '¡Pista superada!', gameOver: 'Carrera terminada', record: '¡Nuevo récord!', back: '← Pistas', backGames: '← Juegos', again: 'Otra vez', letters: 'Letras', score: 'Puntos', part: 'Coche', checkpoint: '¡Punto de control!', shieldOn: '¡Escudo activado!', boostOn: '¡Impulso!', skin: 'Color del coche', exit: 'Salir', mute: 'Sonido', left: '◀', right: '▶', boost: 'IMPULSO', achUnlocked: '¡Logro desbloqueado!', fakeHit: '¡Esa letra era falsa!', locked: 'Necesita 2★ en la pista anterior', streak: 'días seguidos', streakBonus: 'Bono de racha', achTrack1: 'Primera pista superada', achTrack5: '5 pistas superadas', achFlawless: 'Carrera perfecta', yes: 'Sí', no: 'No', quizKicker: '¡Parada en boxes!', lockedFinal: 'Necesita 3★ en todas las pistas anteriores', skipQuiz: 'Saltar al cuestionario' },
    fr: { ready: 'Prépare-toi !', start: 'Départ ▶', cont: 'Continuer →', hint: 'Touchez gauche/droite (ou ←/→) pour changer de voie.', worlds: 'Choisir un circuit', cleared: 'RÉUSSI', best: 'Meilleur', worldClear: 'Circuit réussi !', gameOver: 'Course terminée', record: 'Nouveau record !', back: '← Circuits', backGames: '← Jeux', again: 'Rejouer', letters: 'Lettres', score: 'Score', part: 'Voiture', checkpoint: 'Point de contrôle !', shieldOn: 'Bouclier activé !', boostOn: 'Boost !', skin: 'Couleur de la voiture', exit: 'Quitter', mute: 'Son', left: '◀', right: '▶', boost: 'BOOST', achUnlocked: 'Succès débloqué !', fakeHit: 'Cette lettre était fausse !', locked: 'Nécessite 2★ sur le circuit précédent', streak: 'jours de suite', streakBonus: 'Bonus de série', achTrack1: 'Premier circuit réussi', achTrack5: '5 circuits réussis', achFlawless: 'Course parfaite', yes: 'Oui', no: 'Non', quizKicker: 'Arrêt au stand !', lockedFinal: 'Nécessite 3★ sur tous les circuits précédents', skipQuiz: 'Passer au quiz' },
    hi: { ready: 'तैयार हो जाओ!', start: 'शुरू करें ▶', cont: 'आगे →', hint: 'लेन बदलने के लिए लेफ्ट/राइट (या ←/→) टैप करें।', worlds: 'ट्रैक चुनें', cleared: 'पूरा हुआ', best: 'बेस्ट', worldClear: 'ट्रैक पूरा!', gameOver: 'रन खत्म', record: 'नया रिकॉर्ड!', back: '← ट्रैक्स', backGames: '← गेम्स', again: 'फिर से', letters: 'लेटर्स', score: 'स्कोर', part: 'कार', checkpoint: 'चेकपॉइंट!', shieldOn: 'शील्ड ऑन!', boostOn: 'बूस्ट!', skin: 'कार का रंग', exit: 'बाहर जाएं', mute: 'साउंड', left: '◀', right: '▶', boost: 'बूस्ट', achUnlocked: 'अचीवमेंट अनलॉक!', fakeHit: 'यह लेटर नकली था!', locked: 'पिछले ट्रैक में 2★ चाहिए', streak: 'दिन लगातार', streakBonus: 'स्ट्रीक बोनस', achTrack1: 'पहला ट्रैक पूरा', achTrack5: '5 ट्रैक पूरे', achFlawless: 'परफेक्ट रन', yes: 'हां', no: 'नहीं', quizKicker: 'पिट स्टॉप!', lockedFinal: 'हर पिछले ट्रैक में 3★ चाहिए', skipQuiz: 'क्विज़ पर जाएं' },
    id: { ready: 'Bersiap!', start: 'Mulai ▶', cont: 'Lanjut →', hint: 'Ketuk kiri/kanan (atau ←/→) untuk pindah jalur.', worlds: 'Pilih trek', cleared: 'SELESAI', best: 'Terbaik', worldClear: 'Trek selesai!', gameOver: 'Balapan berakhir', record: 'Rekor baru!', back: '← Trek', backGames: '← Game', again: 'Ulangi', letters: 'Huruf', score: 'Skor', part: 'Mobil', checkpoint: 'Checkpoint!', shieldOn: 'Perisai aktif!', boostOn: 'Boost!', skin: 'Warna mobil', exit: 'Keluar', mute: 'Suara', left: '◀', right: '▶', boost: 'BOOST', achUnlocked: 'Pencapaian terbuka!', fakeHit: 'Huruf itu palsu!', locked: 'Butuh 2★ di trek sebelumnya', streak: 'hari beruntun', streakBonus: 'Bonus beruntun', achTrack1: 'Trek pertama selesai', achTrack5: '5 trek selesai', achFlawless: 'Balapan sempurna', yes: 'Ya', no: 'Tidak', quizKicker: 'Pit stop!', lockedFinal: 'Butuh 3★ di semua trek sebelumnya', skipQuiz: 'Lewati ke kuis' },
    it: { ready: 'Preparati!', start: 'Inizia ▶', cont: 'Continua →', hint: 'Tocca sinistra/destra (o ←/→) per cambiare corsia.', worlds: 'Scegli un circuito', cleared: 'COMPLETATO', best: 'Record', worldClear: 'Circuito completato!', gameOver: 'Corsa terminata', record: 'Nuovo record!', back: '← Circuiti', backGames: '← Giochi', again: 'Ancora', letters: 'Lettere', score: 'Punteggio', part: 'Auto', checkpoint: 'Checkpoint!', shieldOn: 'Scudo attivo!', boostOn: 'Boost!', skin: 'Colore auto', exit: 'Esci', mute: 'Audio', left: '◀', right: '▶', boost: 'BOOST', achUnlocked: 'Obiettivo sbloccato!', fakeHit: 'Quella lettera era falsa!', locked: 'Serve 2★ nel circuito precedente', streak: 'giorni di fila', streakBonus: 'Bonus serie', achTrack1: 'Primo circuito completato', achTrack5: '5 circuiti completati', achFlawless: 'Corsa perfetta', yes: 'Sì', no: 'No', quizKicker: 'Pit stop!', lockedFinal: 'Serve 3★ in tutti i circuiti precedenti', skipQuiz: 'Salta al quiz' },
    pt: { ready: 'Prepare-se!', start: 'Começar ▶', cont: 'Continuar →', hint: 'Toque esquerda/direita (ou ←/→) para mudar de faixa.', worlds: 'Escolha uma pista', cleared: 'CONCLUÍDO', best: 'Melhor', worldClear: 'Pista concluída!', gameOver: 'Corrida encerrada', record: 'Novo recorde!', back: '← Pistas', backGames: '← Jogos', again: 'De novo', letters: 'Letras', score: 'Pontos', part: 'Carro', checkpoint: 'Checkpoint!', shieldOn: 'Escudo ativado!', boostOn: 'Turbo!', skin: 'Cor do carro', exit: 'Sair', mute: 'Som', left: '◀', right: '▶', boost: 'TURBO', achUnlocked: 'Conquista desbloqueada!', fakeHit: 'Essa letra era falsa!', locked: 'Precisa de 2★ na pista anterior', streak: 'dias seguidos', streakBonus: 'Bônus de sequência', achTrack1: 'Primeira pista concluída', achTrack5: '5 pistas concluídas', achFlawless: 'Corrida perfeita', yes: 'Sim', no: 'Não', quizKicker: 'Pit stop!', lockedFinal: 'Precisa de 3★ em todas as pistas anteriores', skipQuiz: 'Pular para o quiz' },
    tr: { ready: 'Hazır ol!', start: 'Başla ▶', cont: 'Devam →', hint: 'Şerit değiştirmek için sol/sağa (veya ←/→) dokun.', worlds: 'Pist seç', cleared: 'TAMAMLANDI', best: 'En iyi', worldClear: 'Pist tamamlandı!', gameOver: 'Yarış bitti', record: 'Yeni rekor!', back: '← Pistler', backGames: '← Oyunlar', again: 'Tekrar', letters: 'Harfler', score: 'Skor', part: 'Araba', checkpoint: 'Kontrol noktası!', shieldOn: 'Kalkan aktif!', boostOn: 'Turbo!', skin: 'Araba rengi', exit: 'Çıkış', mute: 'Ses', left: '◀', right: '▶', boost: 'TURBO', achUnlocked: 'Başarı açıldı!', fakeHit: 'O harf sahteydi!', locked: 'Önceki pistte 2★ gerekiyor', streak: 'gün üst üste', streakBonus: 'Seri bonusu', achTrack1: 'İlk pist tamamlandı', achTrack5: '5 pist tamamlandı', achFlawless: 'Kusursuz yarış', yes: 'Evet', no: 'Hayır', quizKicker: 'Pit stop!', lockedFinal: 'Önceki tüm pistlerde 3★ gerekiyor', skipQuiz: 'Quize geç' },
    vi: { ready: 'Chuẩn bị!', start: 'Bắt đầu ▶', cont: 'Tiếp tục →', hint: 'Chạm trái/phải (hoặc ←/→) để đổi làn.', worlds: 'Chọn đường đua', cleared: 'HOÀN THÀNH', best: 'Tốt nhất', worldClear: 'Hoàn thành đường đua!', gameOver: 'Kết thúc lượt chạy', record: 'Kỷ lục mới!', back: '← Đường đua', backGames: '← Trò chơi', again: 'Chơi lại', letters: 'Chữ cái', score: 'Điểm', part: 'Xe', checkpoint: 'Trạm kiểm soát!', shieldOn: 'Khiên bật!', boostOn: 'Tăng tốc!', skin: 'Màu xe', exit: 'Thoát', mute: 'Âm thanh', left: '◀', right: '▶', boost: 'TĂNG TỐC', achUnlocked: 'Mở khóa thành tích!', fakeHit: 'Chữ cái đó là giả!', locked: 'Cần 2★ ở đường đua trước', streak: 'ngày liên tiếp', streakBonus: 'Thưởng chuỗi', achTrack1: 'Hoàn thành đường đua đầu tiên', achTrack5: 'Hoàn thành 5 đường đua', achFlawless: 'Lượt chạy hoàn hảo', yes: 'Có', no: 'Không', quizKicker: 'Trạm dừng!', lockedFinal: 'Cần 3★ ở mọi đường đua trước', skipQuiz: 'Bỏ qua đến câu đố' },
  };
  function t(lang, key) { const d = STR[lang] || STR.en; return d[key] || STR.en[key] || key; }

  /* ─── AUDIO / HAPTICS ─────────────────────────────────────────────── */
  const LS_MUTE = 'kat_race_muted';
  // Real tree art along the road shoulders (CC0, kenney.nl Racing Pack).
  // Additive/fallback-safe: if unloaded, the shoulders just stay empty as
  // before — draw() checks _treeReady before drawing anything.
  const TREE_IMAGES = { large: 'assets/tree-large.png', small: 'assets/tree-small.png' };
  const _treeImg = {}, _treeReady = {};
  Object.keys(TREE_IMAGES).forEach(key => {
    const img = new Image();
    img.onload = () => { _treeImg[key] = img; _treeReady[key] = true; };
    img.onerror = () => { _treeReady[key] = false; };
    img.src = TREE_IMAGES[key];
  });

  // Real player-car art (CC0, kenney.nl Racing Pack), one image per skin
  // colour. Additive/fallback-safe: draw() checks isCarSpriteReady() before
  // using it, else falls straight through to the existing procedural
  // drawCar() unchanged.
  const CAR_SPRITES = { cyan: 'assets/car-cyan.png', red: 'assets/car-red.png', gold: 'assets/car-gold.png' };
  const _carImg = {}, _carReady = {};
  Object.keys(CAR_SPRITES).forEach(key => {
    const img = new Image();
    img.onload = () => { _carImg[key] = img; _carReady[key] = true; };
    img.onerror = () => { _carReady[key] = false; };
    img.src = CAR_SPRITES[key];
  });
  function isCarSpriteReady(skin) { return !!_carReady[skin]; }

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
  const playSwerveSound = () => sweep(300, 500, 0, 0.08, 'triangle', 0.09);
  const playCollectSound = () => { tone(800, 0, 0.16, 'sine', 0.16); tone(1200, 0.05, 0.1, 'sine', 0.1); };
  const playCoinSound = () => { tone(1046, 0, 0.05, 'triangle', 0.10); tone(1568, 0.04, 0.08, 'triangle', 0.10); };
  const playShieldSound = () => sweep(500, 900, 0, 0.2, 'sine', 0.14);
  const playBoostSound = () => sweep(200, 900, 0, 0.22, 'sawtooth', 0.13);
  const playHitSound = () => tone(90, 0, 0.24, 'sawtooth', 0.17);
  const playWinSound = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.16));
  const playGameOverSound = () => [400, 300, 220, 140].forEach((f, i) => tone(f, i * 0.1, 0.2, 'sawtooth', 0.13));
  const playCheckpointSound = () => { tone(660, 0, 0.08, 'triangle', 0.14); tone(880, 0.08, 0.12, 'triangle', 0.14); };
  const haptic = (p) => navigator.vibrate && navigator.vibrate(p);

  const WORLD_CHORDS = [
    [220.0, 0, 329.6, 0, 261.6, 0, 329.6, 392.0],
    [196.0, 0, 293.7, 0, 246.9, 0, 293.7, 349.2],
    [233.1, 0, 349.2, 0, 277.2, 0, 349.2, 415.3],
    [261.6, 0, 392.0, 0, 329.6, 0, 392.0, 466.2],
  ];
  function MusicLoop(worldIdx) {
    let timer = null, step = 0;
    const pattern = WORLD_CHORDS[worldIdx % WORLD_CHORDS.length];
    function tick() {
      const freq = pattern[step % pattern.length];
      if (!MUTED && freq) {
        const accent = step % 4 === 0;
        tone(freq / 2, 0, 0.55, 'sine', accent ? 0.028 : 0.018);
        tone(freq, 0.03, 0.28, 'triangle', accent ? 0.022 : 0.014);
      }
      step++;
      timer = setTimeout(tick, 640);
    }
    return { start() { if (!timer) tick(); }, stop() { clearTimeout(timer); timer = null; } };
  }

  /* ─── HELPERS ─────────────────────────────────────────────────────── */
  function lerp(a, b, tt) { return a + (b - a) * Math.min(1, Math.max(0, tt)); }
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
  function pickupFont(ctx, text) {
    let size = 16;
    ctx.font = `800 ${size}px system-ui, sans-serif`;
    while (size > 8 && ctx.measureText(text).width > 26) {
      size--; ctx.font = `800 ${size}px system-ui, sans-serif`;
    }
    return ctx.font;
  }

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

  /* ─── PERSISTENCE ─────────────────────────────────────────────────── */
  const LS_CLEARED = 'kat_race_cleared_v1';
  function markCleared(age, worldIdx) {
    const all = readJSON(LS_CLEARED, {}); const set = new Set(all[age] || []);
    set.add(worldIdx); all[age] = Array.from(set); writeJSON(LS_CLEARED, all);
  }
  function isCleared(age, worldIdx) { const all = readJSON(LS_CLEARED, {}); return (all[age] || []).includes(worldIdx); }

  const LS_STARS = 'kat_race_stars_v1';
  function getStars(age, worldIdx) { const all = readJSON(LS_STARS, {}); return (all[age] && all[age][worldIdx]) || 0; }
  function setStarsIfBetter(age, worldIdx, stars) {
    const all = readJSON(LS_STARS, {}); if (!all[age]) all[age] = {};
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

  const LS_STREAK = 'kat_race_streak_v1';
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

  function worldsPlayedCount(age) { return readJSON('kat_race_played_' + age, 0); }
  function bumpWorldsPlayed(age) { writeJSON('kat_race_played_' + age, worldsPlayedCount(age) + 1); }

  const LS_ACH = 'kat_race_achievements_v1';
  function loadAch() { return readJSON(LS_ACH, { collectedLetters: 0, worldsCompleted: 0, flawlessRuns: 0, totalScore: 0, notified: [] }); }
  function saveAch(a) { writeJSON(LS_ACH, a); }
  const ACH_RULES = [
    { id: 'letters50', check: a => a.collectedLetters >= 50, label: (l) => '🔤 50 ' + t(l, 'letters') },
    { id: 'letters200', check: a => a.collectedLetters >= 200, label: (l) => '🔤 200 ' + t(l, 'letters') },
    { id: 'worlds1', check: a => a.worldsCompleted >= 1, label: (l) => '🏁 ' + t(l, 'achTrack1') },
    { id: 'worlds5', check: a => a.worldsCompleted >= 5, label: (l) => '🏁 ' + t(l, 'achTrack5') },
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

  const LS_SKIN = 'kat_race_skin';
  const LS_SKIN_UNLOCKED = 'kat_race_skin_unlocked';
  function getSkin() { return readJSON(LS_SKIN, 'cyan'); }
  function setSkin(name) { if (SKINS[name]) writeJSON(LS_SKIN, name); }
  function skinsUnlocked() { return !!readJSON(LS_SKIN_UNLOCKED, false); }
  function unlockSkins() { writeJSON(LS_SKIN_UNLOCKED, true); }

  /* ─── CAR RENDERER ────────────────────────────────────────────────── */
  // Same principle as the platformer robot: a complete, solid, clearly
  // visible car from stage 0 — collected parts add decoration (spoiler,
  // stripe, headlight glow, exhaust flames) instead of the body
  // "materializing" out of a near-invisible outline.
  // A natural-looking top-down car silhouette shared by the player's car
  // and oncoming traffic: tapered nose, visible wheels poking out past the
  // body (the single biggest visual cue that reads as "a real car" from
  // above), windshield + rear window. Traffic cars call this directly with
  // fixed styling; the player's car layers stage-based extras on top.
  // Lighten (positive) or darken (negative) a '#rrggbb' colour by percent.
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }

  function carBody(ctx, bodyFill, edgeColor) {
    // Soft contact shadow grounds the car instead of it floating over the
    // road — drawn first, underneath everything.
    const shadowGrad = ctx.createRadialGradient(0, 23, 0, 0, 23, 15);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath(); ctx.ellipse(0, 23, 13, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Body: a hexagon-ish tapered shape instead of a plain rounded rect —
    // narrower nose, wider cabin, slightly tapered tail. Filled with a
    // light-to-dark diagonal gradient (single light source, upper-left)
    // instead of a flat colour, so it reads as a rounded painted surface.
    const bodyGrad = ctx.createLinearGradient(-10, -19, 10, 19);
    bodyGrad.addColorStop(0, shadeColor(bodyFill, 32));
    bodyGrad.addColorStop(0.5, bodyFill);
    bodyGrad.addColorStop(1, shadeColor(bodyFill, -28));
    ctx.fillStyle = bodyGrad; ctx.strokeStyle = edgeColor; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.quadraticCurveTo(9, -17, 10, -6);
    ctx.lineTo(10, 10);
    ctx.quadraticCurveTo(10, 17, 5, 19);
    ctx.lineTo(-5, 19);
    ctx.quadraticCurveTo(-10, 17, -10, 10);
    ctx.lineTo(-10, -6);
    ctx.quadraticCurveTo(-9, -17, 0, -19);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Wheels — dark rectangles poking out past the body on both axles,
    // with a faint rim highlight so they don't read as flat black blocks.
    [-12, 12].forEach(wx => {
      [-13, 5].forEach(wy => {
        ctx.fillStyle = '#0d0e12'; ctx.fillRect(wx - 2, wy, 4, 9);
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(wx - 2, wy, 4, 1.5);
      });
    });

    // Windshield (front) + rear window, with a roof strip between them —
    // a subtle gradient instead of a flat tint for a glassy feel.
    const glass = ctx.createLinearGradient(0, -14, 0, -5);
    glass.addColorStop(0, 'rgba(190,230,255,0.55)'); glass.addColorStop(1, 'rgba(140,210,255,0.25)');
    ctx.fillStyle = glass;
    rrect(ctx, -7, -14, 14, 9, 3); ctx.fill();
    ctx.fillStyle = 'rgba(140,210,255,0.22)';
    rrect(ctx, -6, 8, 12, 7, 3); ctx.fill();

    // Specular highlight — soft bright streak on the hood, the single
    // biggest cue that reads as "glossy painted surface" vs flat colour.
    const hl = ctx.createRadialGradient(-3, -11, 0, -3, -11, 7);
    hl.addColorStop(0, 'rgba(255,255,255,0.4)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.beginPath(); ctx.ellipse(-3, -11, 5, 8, -0.3, 0, Math.PI * 2); ctx.fill();
  }

  function drawCar(ctx, x, y, opts) {
    const { partStage, maxStage, hurt, shielded, boosting, skinColor, now } = opts;
    ctx.save();
    ctx.translate(x, y);
    const glow = hurt ? '#f87171' : skinColor;
    const bodyFill = hurt ? '#5a1414' : '#12213f';
    ctx.shadowColor = glow; ctx.shadowBlur = hurt ? 20 : (boosting ? 24 : 14);

    if (boosting) {
      ctx.fillStyle = 'rgba(251,191,36,0.6)';
      ctx.beginPath(); ctx.moveTo(-5, 19); ctx.lineTo(0, 32 + Math.random() * 8); ctx.lineTo(5, 19); ctx.fill();
    }

    carBody(ctx, bodyFill, glow);

    // Headlights (brighter once stage 1+) + taillights.
    ctx.fillStyle = partStage >= 1 ? '#fef08a' : 'rgba(254,240,138,0.4)';
    ctx.shadowBlur = partStage >= 1 ? 8 : 0; ctx.shadowColor = '#fef08a';
    ctx.beginPath(); ctx.arc(-6, -17, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -17, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f87171'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(-6, 17, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 17, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = glow; ctx.shadowBlur = hurt ? 20 : (boosting ? 24 : 14);

    // Racing stripe (stage 2+)
    if (partStage >= 2) {
      ctx.strokeStyle = `${glow}cc`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 16); ctx.stroke();
    }

    // Spoiler (stage 3+)
    if (partStage >= 3) {
      ctx.fillStyle = bodyFill; ctx.strokeStyle = glow; ctx.lineWidth = 1.5;
      rrect(ctx, -9, 15, 18, 4, 2); ctx.fill(); ctx.stroke();
    }

    // Max-stage: pulsing top light
    if (partStage >= maxStage) {
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.01);
      ctx.globalAlpha = pulse; ctx.fillStyle = '#ffe066'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, -21, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (shielded) {
      const pulse = 0.75 + 0.25 * Math.sin(now * 0.01);
      ctx.strokeStyle = `rgba(96,165,250,${0.5 * pulse})`;
      ctx.lineWidth = 2; ctx.shadowBlur = 16; ctx.shadowColor = '#60a5fa';
      ctx.beginPath(); ctx.arc(0, -2, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.restore(); ctx.shadowBlur = 0;
  }

  function drawCarSprite(ctx, x, y, opts) {
    const { hurt, shielded, boosting, skin, now } = opts;
    const img = _carImg[skin] || _carImg.cyan;
    if (!img) return;
    ctx.save();
    ctx.translate(x, y);
    if (boosting) {
      ctx.fillStyle = 'rgba(251,191,36,0.6)';
      ctx.beginPath(); ctx.moveTo(-5, 19); ctx.lineTo(0, 32 + Math.random() * 8); ctx.lineTo(5, 19); ctx.fill();
    }
    ctx.shadowColor = hurt ? '#f87171' : (SKINS[skin] || theme.accent);
    ctx.shadowBlur = hurt ? 20 : (boosting ? 24 : 14);
    if (hurt) ctx.globalAlpha = 0.55 + 0.45 * Math.sin(now * 0.03);
    const w = img.width, h = img.height;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.globalAlpha = 1;
    if (shielded) {
      const pulse = 0.75 + 0.25 * Math.sin(now * 0.01);
      ctx.strokeStyle = `rgba(96,165,250,${0.5 * pulse})`;
      ctx.lineWidth = 2; ctx.shadowBlur = 16; ctx.shadowColor = '#60a5fa';
      ctx.beginPath(); ctx.arc(0, -2, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore(); ctx.shadowBlur = 0;
  }

  // Oncoming traffic — same natural car silhouette, fixed simple styling
  // (no stage upgrades, no shield ring), just recoloured per age.
  function drawTrafficCar(ctx, x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    carBody(ctx, color, 'rgba(0,0,0,0.35)');
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(-6, -17, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -17, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════════
     ONE RUN
  ═══════════════════════════════════════════════════════════════════ */
  function RaceRun(container, opts) {
    const age = AGE_CFG[opts.age] ? opts.age : 'child';
    const cfg = AGE_CFG[age];
    // Visual tier: tiny/child get a calmer, sparser roadside; teen/adult
    // get a busier, denser one — matches the difficulty curve (more
    // traffic/speed) with a matching visual read, same idea as snake.js.
    const tier = (age === 'tiny' || age === 'child') ? 'cute' : 'cyber';
    const lang = opts.lang || 'en';
    const world = opts.world;
    const worldIdx = opts.worldIdx;
    const theme = themeFor(age, worldIdx);
    const hazardColors = AGE_HAZARD_COLORS[age] || AGE_HAZARD_COLORS.child;
    const protocolPool = opts.protocols || [];
    const quizQueue = (opts.quiz || []).slice();
    for (let i = quizQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quizQueue[i], quizQueue[j]] = [quizQueue[j], quizQueue[i]];
    }

    let alive = true, rafId = null, els = {}, cleanupFns = [];

    const letterQueue = [];
    world.rounds.forEach((round, ri) => {
      round.targets.forEach((ch, ci) => letterQueue.push({ text: ch, roundIdx: ri, isLastOfRound: ci === round.targets.length - 1 }));
    });
    const totalLetters = Math.max(1, letterQueue.length);

    const state = {
      startTs: Date.now(),
      collected: 0, parts: 0, coins: 0, shield: false,
      spawned: [],
      nextSpawnAt: 250,
      elapsedMs: 0,
      speed: cfg.baseSpeed,
      roadY: 0,
      over: false, won: false, paused: true,
      everHit: false, everLostPart: false, everRespawned: false,
      shakeUntil: 0, slowUntil: 0,
      checkpointsHit: [], lastCheckpoint: null, pendingQuiz: null,
      lane: Math.floor(cfg.lanes / 2),
      laneVisual: Math.floor(cfg.lanes / 2),
      boostUntil: 0,
    };

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
    container.__katRaceTeardown && container.__katRaceTeardown();
    container.__katRaceTeardown = teardown;

    buildFrame();
    showIntro();
    bumpWorldsPlayed(age);
    rafId = requestAnimationFrame(loop);

    /* ─── DOM ───────────────────────────────────────────────────────── */
    function buildFrame() {
      const showHint = cfg.hints === 'always' || (cfg.hints === 'first3' && worldsPlayedCount(age) < 3);
      container.innerHTML = `
        <div class="snake-hud">
          <div class="game-score-box"><span class="game-score-num" id="rc-parts">0/${cfg.partStages}</span><span class="game-score-lbl">${t(lang,'part')}</span></div>
          <div class="game-round-info">${world.icon} ${world.title}</div>
          <div class="game-score-box"><span class="game-score-num" id="rc-letters">0/${totalLetters}</span><span class="game-score-lbl">${t(lang,'letters')}</span></div>
        </div>
        <div class="pf-subhud">
          <span id="rc-coins">🪙 0</span>
          <span id="rc-shield" class="hidden">🛡️</span>
          <button class="pf-icon-btn" id="rc-mute" title="${t(lang,'mute')}">${MUTED ? '🔇' : '🔊'}</button>
          <button class="pf-icon-btn" id="rc-exit" title="${t(lang,'exit')}">✕</button>
        </div>
        <div class="snake-canvas-wrap">
          <canvas id="rc-canvas"></canvas>
          <div class="snake-overlay hidden" id="rc-overlay"></div>
          <div class="pf-toast hidden" id="rc-toast"></div>
        </div>
        <div class="pf-controls" id="rc-controls">
          <button class="pf-btn" id="rc-left">${t(lang,'left')}</button>
          ${cfg.boost ? `<button class="pf-btn pf-btn-dash" id="rc-boost">⚡ ${t(lang,'boost')}</button>` : '<span></span>'}
          <button class="pf-btn" id="rc-right">${t(lang,'right')}</button>
        </div>
        ${showHint ? `<p class="snake-hint">${t(lang, 'hint')}</p>` : ''}`;

      els.canvas = container.querySelector('#rc-canvas');
      els.ctx = els.canvas.getContext('2d');
      els.overlay = container.querySelector('#rc-overlay');
      els.toast = container.querySelector('#rc-toast');
      els.parts = container.querySelector('#rc-parts');
      els.letters = container.querySelector('#rc-letters');
      els.coins = container.querySelector('#rc-coins');
      els.shieldI = container.querySelector('#rc-shield');

      const avW = Math.min(container.clientWidth || window.innerWidth - 16, window.innerWidth - 16, 680);
      const avH = Math.min(window.innerHeight - 320, 360);
      els.canvas.width = Math.max(280, avW);
      els.canvas.height = Math.max(240, avH);
      els.canvas.style.width = '100%';
      els.canvas.style.maxWidth = els.canvas.width + 'px';

      state.roadX1 = els.canvas.width * 0.08;
      state.roadX2 = els.canvas.width * 0.92;
      state.carY = els.canvas.height * 0.78;

      on(container.querySelector('#rc-left'), 'pointerdown', (e) => { e.preventDefault(); shiftLane(-1); });
      on(container.querySelector('#rc-right'), 'pointerdown', (e) => { e.preventDefault(); shiftLane(1); });
      const boostBtn = container.querySelector('#rc-boost');
      if (boostBtn) on(boostBtn, 'pointerdown', (e) => { e.preventDefault(); doBoost(); });
      on(container.querySelector('#rc-mute'), 'click', (e) => {
        setMuted(!MUTED); e.currentTarget.textContent = MUTED ? '🔇' : '🔊';
        if (MUTED) music.stop(); else if (!state.paused) music.start();
      });
      on(container.querySelector('#rc-exit'), 'click', () => finishRun('exit'));

      on(document, 'keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') shiftLane(-1);
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') shiftLane(1);
        if (cfg.boost && (e.key === ' ' || e.key === 'Shift')) doBoost();
      });
      let tx0 = 0;
      on(els.canvas, 'touchstart', (e) => { tx0 = e.changedTouches[0].clientX; }, { passive: true });
      on(els.canvas, 'touchend', (e) => {
        const dx = e.changedTouches[0].clientX - tx0;
        if (Math.abs(dx) > 24) shiftLane(dx > 0 ? 1 : -1);
      }, { passive: true });
    }

    /* ─── INPUT ───────────────────────────────────────────────────── */
    function shiftLane(delta) {
      if (state.paused || state.over) return;
      const next = Math.max(0, Math.min(cfg.lanes - 1, state.lane + delta));
      if (next === state.lane) return;
      state.lane = next;
      playSwerveSound(); haptic([12]);
    }
    function doBoost() {
      if (state.paused || state.over || !cfg.boost) return;
      const now = Date.now();
      if (now < state.boostUntil) return;
      state.boostUntil = now + 500;
      playBoostSound(); haptic([30]);
      spawnBurst(particles, laneX(state.lane), state.carY + 18, '#fbbf24', 12);
    }
    function laneX(lane) {
      const w = (state.roadX2 - state.roadX1) / cfg.lanes;
      return state.roadX1 + w * (lane + 0.5);
    }

    /* ─── OVERLAYS ────────────────────────────────────────────────── */
    function showIntro() {
      state.paused = true;
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">${world.icon} ${world.title}</p>
          <p class="pf-lesson-text">${world.lessonText || ''}</p>
          <button class="btn-primary" id="rc-start-btn">${t(lang, 'start')}</button>
        </div>`;
      els.overlay.querySelector('#rc-start-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); state.paused = false; state.startTs = Date.now();
        music.start();
        seedOpeningSpawn();
      }, { once: true });
    }

    function seedOpeningSpawn() {
      const nextLetter = letterQueue[0];
      if (nextLetter) state.spawned.push({ kind: 'letter', lane: state.lane, y: els.canvas.height * 0.35, text: nextLetter.text, qidx: 0 });
      const otherLane = (state.lane + 1) % cfg.lanes;
      state.spawned.push({ kind: 'shield', lane: otherLane, y: els.canvas.height * 0.15 });
    }

    function showFact(round) {
      state.paused = true;
      playCollectSound(); haptic([40, 20, 60]);
      const wordDisplay = round.unit === 'letter' ? round.targets.join('') : round.targets.join(' ');
      const sizeClass = round.unit === 'letter' ? 'snake-word-reveal-letter' : 'snake-word-reveal-word';
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-word-reveal ${sizeClass}">${wordDisplay}</p>
          <p class="snake-overlay-icon">${round.icon || '💡'}</p>
          <p class="snake-overlay-fact">${round.fact || ''}</p>
          <button class="btn-primary" id="rc-cont-btn">${t(lang, 'cont')}</button>
        </div>`;
      els.overlay.querySelector('#rc-cont-btn').addEventListener('click', () => {
        if (!alive) return;
        els.overlay.classList.add('hidden'); state.paused = false;
      }, { once: true });
    }

    function toast(msg) {
      els.toast.textContent = msg;
      els.toast.classList.remove('hidden');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => els.toast.classList.add('hidden'), 1600);
    }

    /* ─── SPAWNING ────────────────────────────────────────────────── */
    function scheduleSpawn() {
      const progress = Math.min(1, state.elapsedMs / (cfg.rampSec * 1000));
      const gap = lerp(cfg.gapMax, cfg.gapMin, progress);
      state.nextSpawnAt = state.elapsedMs + gap * (0.75 + Math.random() * 0.5);
    }
    function countKind(kind) { return state.spawned.filter(s => s.kind === kind).length; }
    function randLane() { return Math.floor(Math.random() * cfg.lanes); }
    function wrongLetter(correct) {
      const pool = letterQueue.map(l => l.text).filter(c => c !== correct);
      return pool.length ? pool[Math.floor(Math.random() * pool.length)] : correct;
    }

    function trySpawn() {
      if (state.elapsedMs < state.nextSpawnAt) return;
      scheduleSpawn();
      const nextIdx = state.collected + countKind('letter');
      const nextLetter = letterQueue[nextIdx];
      const roll = Math.random();

      if (nextLetter && countKind('letter') === 0 && roll < 0.42) {
        state.spawned.push({ kind: 'letter', lane: randLane(), y: -30, text: nextLetter.text, qidx: nextIdx });
        if (worldIdx >= 1 && countKind('fake') === 0 && Math.random() < 0.4) {
          state.spawned.push({ kind: 'fake', lane: randLane(), y: -30, text: wrongLetter(nextLetter.text) });
        }
        return;
      }
      if (roll < 0.52) { state.spawned.push({ kind: 'coin', lane: randLane(), y: -30 }); return; }
      if (roll < 0.58) { state.spawned.push({ kind: 'shield', lane: randLane(), y: -30 }); return; }
      if (roll < 0.63) { state.spawned.push({ kind: 'oil', lane: randLane(), y: -30 }); return; } // slick: forces a swerve, no pickup effect besides visual
      // Hazard car — always leave at least one lane free so a run is never
      // mathematically forced into a hit. Picks from an explicit pool of
      // free lanes (not rejection-sampling with random()) so it can never
      // spin forever if most lanes are already occupied near the top.
      const activeHazardLanes = new Set(state.spawned.filter(s => s.kind === 'hazard' && s.y < 60).map(s => s.lane));
      const freeLanes = [];
      for (let l = 0; l < cfg.lanes; l++) if (!activeHazardLanes.has(l)) freeLanes.push(l);
      if (freeLanes.length > 1) {
        for (let i = freeLanes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [freeLanes[i], freeLanes[j]] = [freeLanes[j], freeLanes[i]];
        }
        const wantExtra = Math.random() < (cfg.obstacleMax - 2) * 0.15 ? 2 : 1;
        const count = Math.min(wantExtra, freeLanes.length - 1);
        freeLanes.slice(0, count).forEach(l => state.spawned.push({ kind: 'hazard', lane: l, y: -30, color: hazardColors[Math.floor(Math.random() * hazardColors.length)] }));
      }
    }

    /* ─── COLLECT / DAMAGE ────────────────────────────────────────── */
    function collectLetter(item) {
      state.collected++;
      playCollectSound(); haptic([30]);
      spawnBurst(particles, laneX(item.lane), state.carY, '#00ff88', 14);
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
      spawnBurst(particles, laneX(item.lane), state.carY, '#fbbf24', 8);
      els.coins.textContent = '🪙 ' + state.coins;
    }
    function collectShield() {
      state.shield = true;
      playShieldSound(); haptic([20, 10, 20]);
      els.shieldI.classList.remove('hidden');
      toast('🛡️ ' + t(lang, 'shieldOn'));
    }

    function maybeCheckpoint() {
      const frac = state.collected / totalLetters;
      let newlyHit = null;
      [0.3, 0.6, 0.9].forEach(cp => {
        if (frac >= cp && !state.checkpointsHit.includes(cp)) { state.checkpointsHit.push(cp); newlyHit = cp; }
      });
      if (newlyHit !== null) {
        state.lastCheckpoint = { collected: state.collected, parts: state.parts, elapsedMs: state.elapsedMs, coins: state.coins };
        playCheckpointSound(); haptic([15, 10, 15]);
        toast('🚩 ' + t(lang, 'checkpoint'));
        if (quizQueue.length) state.pendingQuiz = quizQueue.pop();
      }
    }

    function showQuiz(q, cb) {
      state.paused = true;
      els.overlay.classList.remove('hidden');
      els.overlay.innerHTML = `
        <div class="snake-overlay-card">
          <p class="snake-overlay-kicker">🚩 ${t(lang, 'quizKicker')}</p>
          <p class="pf-lesson-text" style="font-weight:700;">${q.q}</p>
          <div class="action-row" style="justify-content:center;gap:10px;margin-bottom:4px;">
            <button class="btn-primary" id="rc-quiz-yes">👍 ${t(lang,'yes')}</button>
            <button class="btn-primary" id="rc-quiz-no" style="background:var(--card2)">👎 ${t(lang,'no')}</button>
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
            <button class="btn-primary" id="rc-quiz-cont">${t(lang,'cont')}</button>
          </div>`;
        els.overlay.querySelector('#rc-quiz-cont').addEventListener('click', () => {
          if (!alive) return;
          els.overlay.classList.add('hidden'); state.paused = false; cb();
        }, { once: true });
      };
      els.overlay.querySelector('#rc-quiz-yes').addEventListener('click', () => answer(1), { once: true });
      els.overlay.querySelector('#rc-quiz-no').addEventListener('click', () => answer(0), { once: true });
    }

    function respawnAtCheckpoint() {
      state.everRespawned = true;
      const cp = state.lastCheckpoint || { collected: 0, parts: 0, elapsedMs: 0, coins: state.coins };
      state.collected = cp.collected; state.parts = cp.parts; state.elapsedMs = cp.elapsedMs; state.coins = cp.coins;
      els.letters.textContent = state.collected + '/' + totalLetters;
      els.parts.textContent = state.parts + '/' + cfg.partStages;
      els.coins.textContent = '🪙 ' + state.coins;
      // Not clearing state.spawned here — this runs from inside the same
      // per-frame collision loop that's iterating it (via takeHit). See
      // js/platformer.js's respawnAtCheckpoint for the exact bug this
      // avoids: reassigning/emptying that array mid-iteration leaves later
      // iterations reading undefined and throws.
      state.hurtUntil = Date.now() + 1400;
      spawnBurst(particles, laneX(state.lane), state.carY, '#f87171', 16);
    }

    function takeHit() {
      const now = Date.now();
      if (now < (state.hurtUntil || 0) || now < state.boostUntil) return; // invulnerable while boosting
      state.everHit = true;
      if (state.shield) {
        state.shield = false; els.shieldI.classList.add('hidden');
        state.hurtUntil = now + 700;
        playShieldSound(); haptic([30]);
        spawnBurst(particles, laneX(state.lane), state.carY, '#60a5fa', 14);
        return;
      }
      state.hurtUntil = now + 900;
      state.shakeUntil = now + 220;
      state.slowUntil = now + 4000;
      playHitSound(); haptic([80, 40, 80]);
      spawnBurst(particles, laneX(state.lane), state.carY, '#f87171', 14);
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
        // 3★ flawless; 2★ took damage but never needed a checkpoint rescue;
        // 1★ needed at least one. See platformer.js for why this replaced
        // the old "every hit must be shield-absorbed" rule.
        stars = !state.everHit ? 3 : (!state.everRespawned ? 2 : 1);
        setStarsIfBetter(age, worldIdx, stars);
        const { streak, bonus } = bumpStreak();
        streakInfo = streak;
        if (bonus) streakBonus = 20;
      }

      const seconds = (Date.now() - state.startTs) / 1000;
      const score = Math.round(seconds * 10) + state.collected * 50 + state.coins + streakBonus;
      if (state.won) { playWinSound(); markCleared(age, worldIdx); window.KAT_Companion?.recordAccomplishment(`race_${age}_w${worldIdx}`, lang); }
      else if (reason !== 'exit') playGameOverSound();

      if (state.parts === cfg.partStages && !skinsUnlocked()) unlockSkins();

      let newAch = [];
      updateAchievements({ score, worldWon: state.won, flawless: state.won && !state.everHit }, lang, (list) => { newAch = list; });

      const board = window.KAT_Leaderboard;
      const raceAgeKey = 'race_' + age; // namespaced so racing scores never mix with the platformer's
      const { isRecord } = board ? board.saveScore(raceAgeKey, worldIdx, score, '') : { isRecord: false };
      const best = board ? board.getBest(raceAgeKey, worldIdx) : score;

      if (reason === 'exit') { teardown(); if (opts.onExit) opts.onExit(); return; }

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
            ${hasNext ? `<button class="btn-primary" id="rc-next-btn">${t(lang,'cont')}</button>` : ''}
            <button class="btn-primary" id="rc-again-btn"${hasNext ? ' style="background:var(--card2)"' : ''}>${t(lang,'again')}</button>
            <button class="btn-primary" id="rc-back-btn" style="background:var(--card2)">${t(lang,'back')}</button>
          </div>
        </div>`;
      if (hasNext) {
        els.overlay.querySelector('#rc-next-btn').addEventListener('click', () => {
          if (!alive) return; teardown(); opts.startWorld(worldIdx + 1);
        }, { once: true });
      }
      els.overlay.querySelector('#rc-again-btn').addEventListener('click', () => {
        if (!alive) return; teardown(); new RaceRun(container, opts);
      }, { once: true });
      els.overlay.querySelector('#rc-back-btn').addEventListener('click', () => {
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
      const boostMult = now < state.boostUntil ? 1.7 : 1;
      const slowMult = now < (state.slowUntil || 0) ? 0.45 : 1;
      state.speed = lerp(cfg.baseSpeed, cfg.maxSpeed, progress) * boostMult * slowMult;
      state.roadY += state.speed * (dt / 16.6);

      // Smoothly interpolate the visual lane position toward the logical one.
      state.laneVisual = lerp(state.laneVisual, state.lane, 0.35);

      trySpawn();

      const dy = state.speed * (dt / 16.6);
      const carY = state.carY;
      for (let i = state.spawned.length - 1; i >= 0; i--) {
        const s = state.spawned[i];
        s.y += dy;
        if (s.y > els.canvas.height + 60) { state.spawned.splice(i, 1); continue; }

        const sameLane = s.lane === state.lane;
        const closeEnough = Math.abs(s.y - carY) < 22;
        if (sameLane && closeEnough) {
          if (s.kind === 'letter') { collectLetter(s); state.spawned.splice(i, 1); }
          else if (s.kind === 'coin') { collectCoin(s); state.spawned.splice(i, 1); }
          else if (s.kind === 'shield') { collectShield(); state.spawned.splice(i, 1); }
          else if (s.kind === 'oil') { state.spawned.splice(i, 1); } // cosmetic-only near-miss
          else if (s.kind === 'fake') { takeHit(); toast('👻 ' + t(lang, 'fakeHit')); state.spawned.splice(i, 1); }
          else if (s.kind === 'hazard') { takeHit(); state.spawned.splice(i, 1); }
        }
      }

      tickParticles(particles);
    }

    /* ─── RENDER ──────────────────────────────────────────────────── */
    function draw(now) {
      const ctx = els.ctx, W = els.canvas.width, H = els.canvas.height;
      ctx.save();
      if (now < state.shakeUntil) ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, theme.sky[0]); grad.addColorStop(1, theme.sky[1]);
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      const hurt = now < (state.hurtUntil || 0) && Math.floor(now / 90) % 2 === 0;
      if (now < (state.hurtUntil || 0)) { ctx.fillStyle = 'rgba(248,113,113,0.10)'; ctx.fillRect(0, 0, W, H); }
      if (now < state.boostUntil) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, 0, W, H); }

      // Roadside trees — real art, tiled vertically with the same scroll
      // as the lane dividers so they read as part of the world, not a
      // static overlay. Alternates small/large for a less uniform tree
      // line; drawn before the road so the road's edge line sits on top.
      if (_treeReady.small && _treeReady.large) {
        // Cute tier: fewer, bigger, more evenly-spaced trees — calm and
        // easy to read. Cyber tier: tighter spacing reads as a busier,
        // faster world to match the higher traffic density/speed.
        const spacing = tier === 'cute' ? 190 : 120;
        const bigW = tier === 'cute' ? 68 : 56, smallW = tier === 'cute' ? 46 : 38;
        const treeOff = state.roadY % spacing;
        for (let y = -treeOff - spacing; y < H + spacing; y += spacing) {
          const big = Math.floor((y + state.roadY) / spacing) % 2 === 0;
          const img = big ? _treeImg.large : _treeImg.small;
          const w = big ? bigW : smallW, h = w * (img.height / img.width);
          ctx.drawImage(img, state.roadX1 * 0.5 - w / 2, y - h / 2, w, h);
          ctx.drawImage(img, state.roadX2 + (W - state.roadX2) * 0.5 - w / 2, y - h / 2, w, h);
        }
      }

      // Road
      ctx.fillStyle = theme.road;
      ctx.fillRect(state.roadX1, 0, state.roadX2 - state.roadX1, H);
      ctx.strokeStyle = theme.accent; ctx.lineWidth = 2; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(state.roadX1, 0); ctx.lineTo(state.roadX1, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(state.roadX2, 0); ctx.lineTo(state.roadX2, H); ctx.stroke();
      ctx.globalAlpha = 1;

      // Lane dividers (scrolling dashes) — thicker/slower-reading dashes
      // for young kids, thinner/tighter stripes for older ages
      const laneW = (state.roadX2 - state.roadX1) / cfg.lanes;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = tier === 'cute' ? 3 : 2;
      const dash = tier === 'cute' ? 32 : 22, gap = tier === 'cute' ? 24 : 16, off = state.roadY % (dash + gap);
      for (let l = 1; l < cfg.lanes; l++) {
        const x = state.roadX1 + laneW * l;
        for (let y = -off; y < H; y += dash + gap) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + dash); ctx.stroke(); }
      }

      // Entities
      state.spawned.forEach(s => {
        const sx = laneX(s.lane);
        ctx.save();
        ctx.translate(sx, s.y);
        if (s.kind === 'letter') {
          const pulse = 0.85 + 0.15 * Math.sin(now * 0.006 + s.y);
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
          ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24'; ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        } else if (s.kind === 'shield') {
          ctx.shadowBlur = 12; ctx.shadowColor = '#60a5fa';
          ctx.fillStyle = 'rgba(96,165,250,0.85)';
          ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
          ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('🛡', 0, 4);
        } else if (s.kind === 'oil') {
          ctx.globalAlpha = 0.6; ctx.fillStyle = '#1e293b';
          ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
        } else if (s.kind === 'hazard') {
          drawTrafficCar(ctx, 0, 0, s.color);
        }
        ctx.restore();
      });

      if (isCarSpriteReady(getSkin())) {
        drawCarSprite(ctx, laneX(state.laneVisual), state.carY, {
          hurt, shielded: state.shield, boosting: now < state.boostUntil,
          skin: getSkin(), now,
        });
      } else {
        drawCar(ctx, laneX(state.laneVisual), state.carY, {
          partStage: state.parts, maxStage: cfg.partStages, hurt,
          shielded: state.shield, boosting: now < state.boostUntil,
          skinColor: SKINS[getSkin()] || theme.accent, now,
        });
      }
      drawParticles(ctx, particles);
      ctx.restore();
    }

  } // end RaceRun

  /* ═══════════════════════════════════════════════════════════════════
     WORLD SELECT
  ═══════════════════════════════════════════════════════════════════ */
  function startWorldSelect(container, opts) {
    const age = AGE_CFG[opts.age] ? opts.age : 'child';
    const lang = opts.lang || 'en';
    const lessons = opts.lessons || [];
    const rounds = opts.rounds || [];
    const chunks = chunkEvenly(rounds, lessons.length || 1);
    const worlds = lessons.map((ls, i) => ({ icon: ls.icon || '🏎️', title: ls.title || ('Track ' + (i + 1)), lessonText: ls.text ? ls.text.slice(0, 90) + '…' : '', rounds: chunks[i] || [] }))
                           .filter(w => w.rounds.length);

    container.__katRaceTeardown && container.__katRaceTeardown();
    container.__katRaceTeardown = null;

    if (!worlds.length) { if (opts.onAllDone) opts.onAllDone(); return; }

    render();

    function render() {
      const ach = loadAch();
      const unlocked = skinsUnlocked();
      const streak = getStreak();
      container.innerHTML = `
        ${opts.onBack ? `<button class="pf-icon-btn" id="rc-back-games" style="margin-bottom:8px;">${t(lang,'backGames')}</button>` : ''}
        <p class="snake-hint" style="margin-bottom:4px;font-weight:700;">${t(lang, 'worlds')}</p>
        <p class="pf-ach-summary">🏆 ${ach.collectedLetters} ${t(lang,'letters').toLowerCase()} · 🏁 ${ach.worldsCompleted} · ⭐ ${ach.totalScore}${streak.count ? ' · 🔥 ' + streak.count : ''}</p>
        <div class="pf-world-grid" id="rc-world-grid"></div>
        ${unlocked ? `<div class="pf-skin-row" id="rc-skin-row"></div>` : ''}`;
      if (opts.onBack) container.querySelector('#rc-back-games').addEventListener('click', opts.onBack);
      function startWorld(i) {
        new RaceRun(container, { age, lang, world: worlds[i], worldIdx: i, onExit: render, quiz: opts.quiz, protocols: opts.protocols, totalWorlds: worlds.length, startWorld });
      }
      const grid = container.querySelector('#rc-world-grid');
      worlds.forEach((w, i) => {
        const cleared = isCleared(age, i);
        const stars = getStars(age, i);
        const isUnlocked = worldUnlocked(age, i, worlds.length);
        const raceAgeKey = 'race_' + age;
        const best = window.KAT_Leaderboard ? window.KAT_Leaderboard.getBest(raceAgeKey, i) : 0;
        const th = themeFor(age, i);
        const card = document.createElement('button');
        card.className = 'pf-world-card' + (cleared ? ' cleared' : '') + (isUnlocked ? '' : ' locked');
        card.style.borderColor = cleared ? 'var(--green)' : th.accent + '55';
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
        const row = container.querySelector('#rc-skin-row');
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

  window.KAT_Racing = { startWorldSelect };

})();
