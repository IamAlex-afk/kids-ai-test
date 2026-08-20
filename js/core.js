/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  core.js  ·  v1.1.0
   Pure logic. All text from window.LANG_DATA (data/xx.js).
   CSS class names match css/main.css exactly.
═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── DEPLOY STEP ──────────────────────────────────────────────────────────────
// Right before `git push`, run in browser console:  Date.now()
// Paste that number below so card #000000001 goes to the first real user.
// Placeholder = 2026-07-01 00:00:00 UTC
const PROJECT_START_MS = 1782864000000;
// ──────────────────────────────────────────────────────────────────────────────
const LS_KEY           = 'kat_v1';
const CARD_SALT        = 'KAT-2026-MIND-OS-OPEN';

const AGE_CFG = {
  tiny:  { lessons: 3, gameRounds: 15 },
  child: { lessons: 4, gameRounds: 16 },
  teen:  { lessons: 5, gameRounds: 15 },
  adult: { lessons: 6, gameRounds: 15 },
};

const MASCOTS = { tiny: '🧸', child: '🎮', teen: '📱', adult: '🧠' };

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let S = {
  lang: 'en',
  age:  null,

  lesson: { idx: 0, phase: 'lesson', mt: { idx: 0, score: 0 } },
  game:   { idx: 0, score: 0, rounds: 5, done: false },
  quiz:   { idx: 0, score: 0, done: false },

  tracker: { history: [], loggedToday: false },

  result: { ready: false, tier: null, score: 0 },
  card:   { generated: false, number: null, name: null, hash: null },
};

/* ─────────────────────────────────────────────
   DOM HELPERS
───────────────────────────────────────────── */
const $   = (id)  => document.getElementById(id);
const $$  = (sel) => document.querySelectorAll(sel);

function show(id) {
  const e = $(id);
  if (e) e.classList.remove('hidden');
}
function hide(id) {
  const e = $(id);
  if (e) e.classList.add('hidden');
}
function scrollTo(id) {
  const e = $(id);
  if (e) setTimeout(() => e.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

/* ─────────────────────────────────────────────
   CONTENT HELPERS
───────────────────────────────────────────── */
function D()        { return window.LANG_DATA || {}; }
function ageData()  { return D().ages?.[S.age] || null; }
function ui(k)      { return D().ui?.[k] || k; }
const Q_LABEL = { en:'Question', ru:'Вопрос', de:'Frage', es:'Pregunta', fr:'Question', hi:'प्रश्न', id:'Pertanyaan', pt:'Questão', tr:'Soru', vi:'Câu hỏi' };
function qLabel()   { return Q_LABEL[S.lang] || Q_LABEL.en; }

/* ─────────────────────────────────────────────
   LOCALSTORAGE
───────────────────────────────────────────── */
function lsSave() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (_) {}
}
function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.lang === S.lang) S = { ...S, ...saved };
    }
  } catch (_) {}
}

/* ─────────────────────────────────────────────
   BOOT
───────────────────────────────────────────── */
function boot() {
  const bootEl = $('boot');
  if (!bootEl) { afterBoot(); return; }

  const fill   = $('boot-fill');
  const access = $('boot-access');

  // Animate progress bar
  if (fill) setTimeout(() => { fill.style.width = '100%'; }, 300);

  // "ACCESS GRANTED" fade-in
  if (access) setTimeout(() => {
    access.style.transition = 'opacity 0.5s ease';
    access.style.opacity    = '1';
  }, 1700);

  // Fade out boot screen — kept short: the boot overlay blocks all clicks
  // (z-index 9999, opaque), so a long wait here reads as "the site is
  // broken / buttons don't work" rather than "still loading".
  setTimeout(() => {
    bootEl.classList.add('hide');
    setTimeout(() => { bootEl.hidden = true; afterBoot(); }, 500);
  }, 2600);
}

function afterBoot() {
  renderTopBar();
  window.KAT_Companion?.mountFloating(S.lang);
  if (S.age) {
    restoreProgress();
  } else {
    initAgePicker();
    initParent();
    initFlipCards();
  }
}

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
function renderTopBar() {
  // Globe language switcher
  const globe = $('lang-globe');
  const dropdown = $('lang-dropdown');
  if (globe && dropdown) {
    globe.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('open');
      globe.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      globe.setAttribute('aria-expanded', 'false');
    }, { passive: true });
  }

  // Legacy lang-switch buttons (fallback if still present)
  $$('[data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.langSwitch;
      lsSave();
      window.location.href = lang === 'en' ? 'index.html' : `${lang}.html`;
    });
  });

  // Quick-age buttons in top bar
  $$('[data-age-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectAge(btn.dataset.ageQuick);
    });
  });
}

/* ─────────────────────────────────────────────
   AGE PICKER
───────────────────────────────────────────── */
function initAgePicker() {
  $$('.age-card').forEach(btn => {
    btn.addEventListener('click', () => selectAge(btn.dataset.age));
  });
}

function selectAge(age) {
  if (!AGE_CFG[age]) return;
  S.age = age;
  lsSave();

  // Apply theme
  document.body.setAttribute('data-age', age);

  // Update mascot emoji
  const mascotEl = $('hero-mascot-emoji');
  if (mascotEl) mascotEl.textContent = MASCOTS[age] || '🤖';

  // Highlight age card
  $$('.age-card').forEach(c => c.classList.remove('active'));
  const card = document.querySelector(`.age-card[data-age="${age}"]`);
  if (card) card.classList.add('active');

  // Highlight quick-age button in top bar
  $$('[data-age-quick]').forEach(b => b.classList.remove('age-active'));
  const qb = document.querySelector(`[data-age-quick="${age}"]`);
  if (qb) qb.classList.add('age-active');

  // Show tracker now that we know age
  show('tracker');
  initTracker();

  // Rebuild the parents' FAQ drawer so its age-specific section matches
  // the newly selected age (it doesn't get touched by anything else on
  // a mid-session age switch).
  renderParentFaq();

  setTimeout(() => { show('mode-picker'); scrollTo('mode-picker'); initModePicker(); }, 400);
}

const MODE_STR = {
  en: { step:'STEP 2', q:'What do you want to do?', lb:'LEARN + TEST', lt:'Lessons & Quiz', ld:'3–6 lessons → quiz → earn your unique card', pb:'GAMES', pt:'Play & Learn', pd:'AI Snake — learn while playing' },
  ru: { step:'ШАГ 2', q:'Что хочешь делать?', lb:'УРОКИ + ТЕСТ', lt:'Учиться и пройти тест', ld:'3–6 уроков → финальный тест → твоя уникальная карточка', pb:'ИГРЫ', pt:'Играть и учиться', pd:'AI Змейка — учись в игре' },
  de: { step:'SCHRITT 2', q:'Was möchtest du tun?', lb:'LERNEN + TEST', lt:'Lektionen & Quiz', ld:'3–6 Lektionen → Quiz → verdiene deine einzigartige Karte', pb:'SPIELE', pt:'Spielen & Lernen', pd:'KI-Schlange — lerne beim Spielen' },
  es: { step:'PASO 2', q:'¿Qué quieres hacer?', lb:'APRENDER + TEST', lt:'Lecciones & Quiz', ld:'3–6 lecciones → quiz → gana tu tarjeta única', pb:'JUEGOS', pt:'Jugar & Aprender', pd:'IA Snake — aprende jugando' },
  fr: { step:'ÉTAPE 2', q:'Que veux-tu faire ?', lb:'APPRENDRE + TEST', lt:'Leçons & Quiz', ld:'3–6 leçons → quiz → gagne ta carte unique', pb:'JEUX', pt:'Jouer & Apprendre', pd:'IA Serpent — apprends en jouant' },
  hi: { step:'चरण 2', q:'तुम क्या करना चाहते हो?', lb:'सीखो + टेस्ट', lt:'पाठ और प्रश्नोत्तरी', ld:'3–6 पाठ → प्रश्नोत्तरी → अपना अनूठा कार्ड पाओ', pb:'खेल', pt:'खेलो और सीखो', pd:'AI साँप — खेलते हुए सीखो' },
  id: { step:'LANGKAH 2', q:'Apa yang ingin kamu lakukan?', lb:'BELAJAR + TES', lt:'Pelajaran & Kuis', ld:'3–6 pelajaran → kuis → dapatkan kartumu yang unik', pb:'GAME', pt:'Main & Belajar', pd:'AI Ular — belajar sambil bermain' },
  pt: { step:'PASSO 2', q:'O que você quer fazer?', lb:'APRENDER + TESTE', lt:'Lições & Quiz', ld:'3–6 lições → quiz → ganhe seu cartão único', pb:'JOGOS', pt:'Jogar & Aprender', pd:'IA Cobra — aprenda jogando' },
  tr: { step:'ADIM 2', q:'Ne yapmak istiyorsun?', lb:'ÖĞREN + TEST', lt:'Dersler & Quiz', ld:'3–6 ders → test → özel kartını kazan', pb:'OYUNLAR', pt:'Oyna & Öğren', pd:'YZ Yılan — oynayarak öğren' },
  vi: { step:'BƯỚC 2', q:'Bạn muốn làm gì?', lb:'HỌC + KIỂM TRA', lt:'Bài học & Câu hỏi', ld:'3–6 bài học → câu hỏi → nhận thẻ độc đáo của bạn', pb:'TRÒ CHƠI', pt:'Chơi & Học', pd:'AI Rắn — học qua chơi' },
};


/* ─────────────────────────────────────────────
   WEB SPEECH API
───────────────────────────────────────────── */
const SPEECH_LANG = { ru:'ru-RU', de:'de-DE', es:'es-ES', fr:'fr-FR', hi:'hi-IN',
                       id:'id-ID', pt:'pt-BR', tr:'tr-TR', vi:'vi-VN' };
function speechLangTag() { return SPEECH_LANG[S.lang] || 'en-US'; }

// Chrome/Edge populate speechSynthesis.getVoices() asynchronously — on a
// fresh page load the list can still be empty the first time it's read,
// so setting utt.lang alone isn't enough: some browsers silently fall
// back to whatever default voice is already loaded (often English)
// instead of waiting for the matching one to arrive. Explicitly picking
// a matching voice object — and waiting one 'voiceschanged' tick if the
// list isn't ready yet — makes the requested language actually stick.
function pickVoice(langTag, cb) {
  const prefix = langTag.split('-')[0];
  const find = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang === langTag) || voices.find(v => v.lang.startsWith(prefix)) || null;
  };
  const existing = find();
  if (existing) { cb(existing); return; }
  if (window.speechSynthesis.getVoices().length > 0) { cb(null); return; }
  let done = false;
  const finish = (v) => { if (done) return; done = true; window.speechSynthesis.onvoiceschanged = null; cb(v); };
  window.speechSynthesis.onvoiceschanged = () => finish(find());
  setTimeout(() => finish(find()), 400); // safety net if the event never fires
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const langTag = speechLangTag();
  pickVoice(langTag, (voice) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = langTag;
    if (voice) utt.voice = voice;
    utt.rate  = 0.82;
    utt.pitch = 1.15;
    window.speechSynthesis.speak(utt);
  });
}

function canReadAloud() {
  return ('speechSynthesis' in window) && (S.age === 'tiny' || S.age === 'child');
}

function initModePicker() {
  const s = MODE_STR[S.lang] || MODE_STR.en;
  const q = (sel) => document.querySelector(sel);
  const tx = (sel, t) => { const el = q(sel); if (el) el.textContent = t; };
  tx('#mode-picker .sec-header-text', s.step);
  tx('#mode-picker .section-heading', s.q);
  tx('#btn-mode-learn .mode-badge',   s.lb);
  tx('#btn-mode-learn .mode-title',   s.lt);
  tx('#btn-mode-learn .mode-desc',    s.ld);
  tx('#btn-mode-play .mode-badge',    s.pb);
  tx('#btn-mode-play .mode-title',    s.pt);
  tx('#btn-mode-play .mode-desc',     s.pd);

  const btnLearn = $('btn-mode-learn');
  const btnPlay  = $('btn-mode-play');
  if (btnLearn) {
    btnLearn.onclick = () => {
      hide('mode-picker');
      startLessons();
    };
  }
  if (btnPlay) {
    btnPlay.onclick = () => {
      hide('mode-picker');
      startGame();
    };
  }

  if (window.KAT_Companion) {
    let widget = $('mode-picker').querySelector('#kat-companion-mount');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'kat-companion-mount';
      $('mode-picker').appendChild(widget);
    }
    window.KAT_Companion.setContent(ageData()?.quiz || [], ageData()?.lessons || []);
    window.KAT_Companion.render(widget, S.lang);
  }
}

/* ─────────────────────────────────────────────
   LESSON ENGINE
───────────────────────────────────────────── */
function startLessons() {
  S.lesson = { idx: 0, phase: 'lesson', mt: { idx: 0, score: 0 } };
  lsSave();
  show('lessons');
  scrollTo('lessons');
  renderLesson();
}

function renderLesson() {
  const data    = ageData();
  const lessons = data?.lessons || [];
  const idx     = S.lesson.idx;
  const lesson  = lessons[idx];

  if (!lesson) { onLessonsDone(); return; }

  // Progress bar
  const pct = Math.round((idx / lessons.length) * 100);
  const fill = $('lesson-prog-fill');
  if (fill) fill.style.width = pct + '%';
  const cnt  = $('lesson-count');
  if (cnt) cnt.textContent = `${ui('lesson_label') || 'Lesson'} ${idx + 1} / ${lessons.length}`;
  const ph = $('lesson-phase-label');
  if (ph) ph.textContent = ui('lesson_label') || 'Lesson';

  const container = $('lesson-content');
  if (!container) return;

  const hasTest = lesson.miniTest?.length > 0;

  container.innerHTML = `
    <div class="lesson-steps">
      <div class="lesson-step anim-fade-up">
        <div class="step-num">${lesson.icon || '🤖'}</div>
        <div class="step-body">
          <div class="step-title-row">
            <h3 class="step-title">${lesson.title}</h3>
            ${canReadAloud() ? `<button class="btn-read-aloud" id="btn-read-lesson" type="button" aria-label="${ui('ui_read_aloud')||'Read to me'}">🔊 ${ui('ui_read_aloud')||'Read to me'}</button>` : ''}
          </div>
          <p class="step-text">${window.KAT_Glossary ? window.KAT_Glossary.linkify(lesson.text, S.lang) : lesson.text}</p>
          ${lesson.example ? `<div class="step-example">💡 ${window.KAT_Glossary ? window.KAT_Glossary.linkify(lesson.example, S.lang) : lesson.example}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="action-row">
      <button class="btn-primary" id="btn-next-lesson">
        ${hasTest ? '🧪 ' + (ui('mini_test_label')||'Quick Check') + ' →' : idx === lessons.length - 1 ? ui('lesson_last_btn')||'🎮 Ready for the Game!' : ui('lesson_next_btn')||'Got it! Next →'}
      </button>
    </div>
  `;

  const lessonSpeech = [lesson.title, lesson.text, lesson.example].filter(Boolean).join('. ');
  const readBtn = $('btn-read-lesson');
  if (readBtn) readBtn.addEventListener('click', () => speakText(lessonSpeech));
  if (S.age === 'tiny') speakText(lessonSpeech);

  $('btn-next-lesson').addEventListener('click', () => {
    if (hasTest) {
      S.lesson.phase = 'mini-test';
      S.lesson.mt    = { idx: 0, score: 0 };
      lsSave();
      renderMiniTest();
    } else {
      advanceLesson();
    }
  });
}

function renderMiniTest() {
  const data    = ageData();
  const lesson  = data?.lessons[S.lesson.idx];
  const qs      = lesson?.miniTest || [];
  const qIdx    = S.lesson.mt.idx;
  const q       = qs[qIdx];

  if (!q) { advanceLesson(); return; }

  const ph = $('lesson-phase-label');
  if (ph) ph.textContent = ui('check_label') || 'Check';

  const container = $('lesson-content');
  if (!container) return;

  const checkLabel = ui('mini_test_label') || 'Quick Check';
  container.innerHTML = `
    <div class="quiz-wrap anim-fade-up">
      <div class="quiz-progress">
        <div class="quiz-prog-top">
          <span class="quiz-prog-label">${checkLabel} ${qIdx + 1}/${qs.length}</span>
        </div>
      </div>
      <div class="q-wrap">
        <span class="q-badge">${ui('check_label')}</span>
        <p class="q-text">${q.q}</p>
        ${canReadAloud() ? `<button class="btn-read-aloud" id="btn-read-mt" type="button" aria-label="${ui('ui_read_aloud')||'Read to me'}">🔊 ${ui('ui_read_aloud')||'Read to me'}</button>` : ''}
        <div class="answers" id="mt-options"></div>
        <div id="mt-feedback" class="hidden" style="margin-top:12px;padding:12px;border-radius:10px;font-size:.9rem;line-height:1.6;"></div>
      </div>
    </div>
  `;

  if (S.age === 'tiny') speakText(q.q);

  const readMtBtn = $('btn-read-mt');
  if (readMtBtn) readMtBtn.addEventListener('click', () => speakText(q.q));

  const opts = $('mt-options');
  const isTiny = S.age === 'tiny';
  const displayOpts = isTiny ? q.options.slice(0, 2) : q.options;

  if (isTiny) {
    opts.className = 'tiny-answers';
    const tinyIcons = ['🟢', '🔴'];
    displayOpts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'ans-tiny';
      btn.innerHTML = `<span class="ans-big">${tinyIcons[i]}</span><span class="ans-word">${opt}</span>`;
      btn.addEventListener('click', () => answerMiniTest(i, q, btn));
      opts.appendChild(btn);
    });
  } else {
    displayOpts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className   = 'ans';
      btn.innerHTML   = `<span class="ans-icon">◦</span> ${opt}`;
      btn.addEventListener('click', () => answerMiniTest(i, q, btn));
      opts.appendChild(btn);
    });
  }
}

function answerMiniTest(choiceIdx, q, clickedBtn) {
  const correct = choiceIdx === q.correct;

  $$('#mt-options .ans').forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) {
      b.style.borderColor = 'var(--green)';
      b.style.color = 'var(--green)';
    }
    if (i === choiceIdx && !correct) {
      b.style.borderColor = 'var(--red)';
      b.style.color = 'var(--red)';
    }
  });

  const fb = $('mt-feedback');
  if (fb) {
    fb.classList.remove('hidden');
    fb.style.background = correct ? 'rgba(0,255,136,.08)' : 'rgba(248,113,113,.08)';
    fb.style.borderLeft = `3px solid ${correct ? 'var(--green)' : 'var(--red)'}`;
    fb.innerHTML = `${correct ? '✅' : '❌'} ${q.explanation || (correct ? ui('mini_correct') : ui('mini_wrong'))}`;
  }

  if (correct) {
    S.lesson.mt.score++;
    if (S.age === 'tiny') tinySuccess(clickedBtn);
    window.KAT_Companion?.sayReaction('praise', S.lang);
  } else {
    window.KAT_Companion?.sayReaction('hint', S.lang);
  }
  lsSave();

  setTimeout(() => {
    S.lesson.mt.idx++;
    const qs = ageData()?.lessons[S.lesson.idx]?.miniTest || [];
    if (S.lesson.mt.idx < qs.length) renderMiniTest();
    else advanceLesson();
  }, S.age === 'tiny' ? 1600 : 1800);
}

function tinySuccess(btn) {
  if (!btn) return;
  btn.classList.add('tiny-correct');
  const stars = ['⭐','🌟','✨','💫'];
  const wrap = btn.closest('.tiny-answers') || btn.parentNode;
  stars.forEach((s, i) => {
    const el = document.createElement('span');
    el.className = 'tiny-star';
    el.textContent = s;
    el.style.cssText = `--dx:${(Math.random()-.5)*120}px;--dy:${-(40+Math.random()*60)}px;animation-delay:${i*80}ms`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  });
}

function advanceLesson() {
  S.lesson.idx++;
  S.lesson.phase = 'lesson';
  lsSave();

  const lessons = ageData()?.lessons || [];
  if (S.lesson.idx >= lessons.length) onLessonsDone();
  else renderLesson();
}

function onLessonsDone() {
  const container = $('lesson-content');
  if (!container) return;

  container.innerHTML = `
    <div class="card green anim-scale-in" style="text-align:center;padding:32px;">
      <p style="font-size:3rem;margin-bottom:12px;">🎉</p>
      <h3 class="step-title">${ui('lessons_done_title')||'Lessons Complete!'}</h3>
      <p class="step-text">${ui('lessons_done_text')||"You know how AI really works. Now let's see if you can SPOT it!"}</p>
      <div class="action-row" style="justify-content:center;margin-top:20px;">
        <button class="btn-primary" id="btn-go-game">🎮 ${ui('btn_start_game')||'Play &amp; Learn'} →</button>
      </div>
    </div>
  `;
  $('btn-go-game').addEventListener('click', startGame);
}

/* ─────────────────────────────────────────────
   GAME ENGINE — AI Snake
   Eats letters/words/phrases in order (from ageData().snake) while
   dodging decoy tokens. Engine lives in snake.js (window.KAT_Snake).
───────────────────────────────────────────── */

const GAME_PICKER_STR = {
  en: { title: 'Choose a game', snakeName: '🐍 AI Snake', snakeDesc: 'Classic — eat the right letters', pfName: '🤖 Circuit Runner', pfDesc: 'Run, jump, dodge, build your robot', raceName: '🚀 Circuit Racer', raceDesc: 'Switch lanes, dodge spam & scams, build your robot', exit: 'Exit' },
  ru: { title: 'Выбери игру', snakeName: '🐍 AI Змейка', snakeDesc: 'Классика — собирай нужные буквы', pfName: '🤖 Circuit Runner', pfDesc: 'Беги, прыгай, собери робота', raceName: '🚀 Circuit Racer', raceDesc: 'Меняй полосы, уклоняйся от спама и скама, собери робота', exit: 'Выход' },
  de: { title: 'Spiel wählen', snakeName: '🐍 KI-Schlange', snakeDesc: 'Klassiker — sammle die richtigen Buchstaben', pfName: '🤖 Circuit Runner', pfDesc: 'Rennen, springen, ausweichen, Roboter bauen', raceName: '🚀 Circuit Racer', raceDesc: 'Spur wechseln, Spam & Betrug ausweichen, Roboter bauen', exit: 'Verlassen' },
  es: { title: 'Elige un juego', snakeName: '🐍 Serpiente IA', snakeDesc: 'Clásico — come las letras correctas', pfName: '🤖 Circuit Runner', pfDesc: 'Corre, salta, esquiva, construye tu robot', raceName: '🚀 Circuit Racer', raceDesc: 'Cambia de carril, esquiva spam y estafas, construye tu robot', exit: 'Salir' },
  fr: { title: 'Choisis un jeu', snakeName: '🐍 Serpent IA', snakeDesc: 'Classique — mange les bonnes lettres', pfName: '🤖 Circuit Runner', pfDesc: 'Cours, saute, esquive, construis ton robot', raceName: '🚀 Circuit Racer', raceDesc: 'Change de voie, évite spam et arnaques, construis ton robot', exit: 'Quitter' },
  hi: { title: 'गेम चुनें', snakeName: '🐍 AI साँप', snakeDesc: 'क्लासिक — सही अक्षर खाओ', pfName: '🤖 Circuit Runner', pfDesc: 'दौड़ो, कूदो, बचो, अपना रोबोट बनाओ', raceName: '🚀 Circuit Racer', raceDesc: 'लेन बदलो, स्पैम और स्कैम से बचो, अपना रोबोट बनाओ', exit: 'बाहर जाएं' },
  id: { title: 'Pilih game', snakeName: '🐍 Ular AI', snakeDesc: 'Klasik — makan huruf yang benar', pfName: '🤖 Circuit Runner', pfDesc: 'Lari, lompat, hindari, bangun robotmu', raceName: '🚀 Circuit Racer', raceDesc: 'Pindah jalur, hindari spam & penipuan, bangun robotmu', exit: 'Keluar' },
  pt: { title: 'Escolha um jogo', snakeName: '🐍 Cobra IA', snakeDesc: 'Clássico — coma as letras certas', pfName: '🤖 Circuit Runner', pfDesc: 'Corra, pule, desvie, construa seu robô', raceName: '🚀 Circuit Racer', raceDesc: 'Mude de faixa, desvie de spam e golpes, construa seu robô', exit: 'Sair' },
  tr: { title: 'Oyun seç', snakeName: '🐍 AI Yılanı', snakeDesc: 'Klasik — doğru harfleri ye', pfName: '🤖 Circuit Runner', pfDesc: 'Koş, zıpla, kaç, robotunu inşa et', raceName: '🚀 Circuit Racer', raceDesc: 'Şerit değiştir, spam ve dolandırıcılıktan kaç, robotunu inşa et', exit: 'Çıkış' },
  vi: { title: 'Chọn trò chơi', snakeName: '🐍 Rắn AI', snakeDesc: 'Cổ điển — ăn đúng chữ cái', pfName: '🤖 Circuit Runner', pfDesc: 'Chạy, nhảy, né tránh, xây dựng robot của bạn', raceName: '🚀 Circuit Racer', raceDesc: 'Đổi làn, né tránh spam và lừa đảo, xây dựng robot của bạn', exit: 'Thoát' },
};
function gpStr(k) { const d = GAME_PICKER_STR[S.lang] || GAME_PICKER_STR.en; return d[k] || GAME_PICKER_STR.en[k]; }

function availableGames() {
  const games = [];
  if (window.KAT_Snake) games.push({ icon: '🐍', name: gpStr('snakeName'), desc: gpStr('snakeDesc'), launch: launchSnake });
  if (window.KAT_Platformer) games.push({ icon: '🤖', name: gpStr('pfName'), desc: gpStr('pfDesc'), launch: launchPlatformer });
  if (window.KAT_Racing) games.push({ icon: '🏎️', name: gpStr('raceName'), desc: gpStr('raceDesc'), launch: launchRacing });
  return games;
}

function startGame() {
  const cfg   = AGE_CFG[S.age] || AGE_CFG.child;
  S.game      = { idx: 0, score: 0, rounds: cfg.gameRounds, done: false };
  lsSave();
  show('game');
  // Fullscreen while actively playing — kid lands straight on the
  // game/level picker with nothing to scroll past. Turned off in
  // onGameDone() / exitFullscreenGame().
  document.body.classList.add('game-fullscreen');
  window.KAT_Companion?.setFloatingVisible(false);

  const container = $('game-content');
  if (!container) { onGameDone(); return; }

  const games = availableGames();
  if (games.length > 1) renderGamePicker(container, games);
  else if (games.length === 1) games[0].launch(container);
  else onGameDone();
}

// Bail out of the fullscreen game area back to normal browsing without
// marking the game session as done (no "nice job" card, no quiz nudge —
// the kid just changed their mind).
function exitFullscreenGame() {
  document.body.classList.remove('game-fullscreen');
  window.KAT_Companion?.setFloatingVisible(true);
}

function renderGamePicker(container, games) {
  games = games || availableGames();
  container.innerHTML = `
    <button class="pf-icon-btn game-picker-exit" id="gp-exit" title="${gpStr('exit')}">✕</button>
    <p class="snake-hint" style="margin-bottom:10px;font-weight:700;">${gpStr('title')}</p>
    <div class="pf-world-grid" id="gp-grid"></div>`;
  container.querySelector('#gp-exit').addEventListener('click', exitFullscreenGame);
  const grid = container.querySelector('#gp-grid');
  games.forEach(g => {
    const card = document.createElement('button');
    card.className = 'pf-world-card';
    card.innerHTML = `
      <span class="pf-world-icon">${g.icon}</span>
      <span class="pf-world-title">${g.name}</span>
      <span class="pf-world-meta">${g.desc}</span>`;
    card.addEventListener('click', () => g.launch(container));
    grid.appendChild(card);
  });
}

function launchSnake(container) {
  const cfg    = AGE_CFG[S.age] || AGE_CFG.child;
  const data   = ageData();
  const rounds = (data?.snake || []).slice(0, cfg.gameRounds);
  if (!rounds.length || !window.KAT_Snake) { onGameDone(); return; }

  window.KAT_Snake.start(container, {
    age:  S.age,
    lang: S.lang,
    rounds,
    onRoundComplete(idx) {
      S.game.idx   = idx + 1;
      S.game.score = idx + 1;
      lsSave();
      window.KAT_Companion?.recordAccomplishment(`snake_${S.age}_${idx}`, S.lang);
    },
    onAllDone() { onGameDone(); },
    onExit: availableGames().length > 1 ? () => renderGamePicker(container) : () => onGameDone(),
  });
}

function launchPlatformer(container) {
  const cfg    = AGE_CFG[S.age] || AGE_CFG.child;
  const data   = ageData();
  const rounds = (data?.snake || []).slice(0, cfg.gameRounds);
  if (!rounds.length || !window.KAT_Platformer) { onGameDone(); return; }

  window.KAT_Platformer.startWorldSelect(container, {
    age: S.age,
    lang: S.lang,
    lessons: data?.lessons || [],
    rounds,
    quiz: (data?.quiz || []).filter(q => q.type === 'yesno'),
    protocols: data?.protocols || [],
    onAllDone() { onGameDone(); },
    onBack: availableGames().length > 1 ? () => renderGamePicker(container) : null,
  });
}

function launchRacing(container) {
  const cfg    = AGE_CFG[S.age] || AGE_CFG.child;
  const data   = ageData();
  const rounds = (data?.snake || []).slice(0, cfg.gameRounds);
  if (!rounds.length || !window.KAT_Racing) { onGameDone(); return; }

  window.KAT_Racing.startWorldSelect(container, {
    age: S.age,
    lang: S.lang,
    lessons: data?.lessons || [],
    rounds,
    quiz: (data?.quiz || []).filter(q => q.type === 'yesno'),
    protocols: data?.protocols || [],
    onAllDone() { onGameDone(); },
    onBack: availableGames().length > 1 ? () => renderGamePicker(container) : null,
  });
}

function onGameDone() {
  document.body.classList.remove('game-fullscreen');
  window.KAT_Companion?.setFloatingVisible(true);
  S.game.done = true;
  lsSave();

  const pct = Math.round((S.game.score / S.game.rounds) * 100);
  const msg = pct >= 80 ? ui('game_win')
            : pct >= 50 ? ui('game_ok')
            : ui('game_try');

  const container = $('game-content');
  if (!container) return;

  container.innerHTML = `
    <div class="card green anim-scale-in" style="text-align:center;padding:28px;">
      <div class="game-score-box" style="display:inline-block;margin-bottom:16px;">
        <span class="game-score-num">${S.game.score}/${S.game.rounds}</span>
        <span class="game-score-lbl">${ui('card_score_label')}</span>
      </div>
      <p class="step-text">${msg}</p>
      <div class="action-row" style="justify-content:center;margin-top:20px;">
        <button class="btn-primary" id="btn-go-quiz">${ui('btn_start_quiz')}</button>
      </div>
    </div>
  `;
  $('btn-go-quiz').addEventListener('click', startQuiz);
}

/* ─────────────────────────────────────────────
   QUIZ ENGINE
───────────────────────────────────────────── */
function startQuiz() {
  S.quiz = { idx: 0, score: 0, done: false };
  lsSave();
  show('quiz');
  scrollTo('quiz');
  renderQuestion();
}

function renderQuestion() {
  const data = ageData();
  const qs   = data?.quiz || [];
  const idx  = S.quiz.idx;
  const q    = qs[idx];

  if (!q) { onQuizDone(); return; }

  const container = $('quiz-content');
  if (!container) return;

  const pct = Math.round((idx / qs.length) * 100);

  let answersHtml = '';

  if (q.type === 'yesno') {
    answersHtml = `
      <div class="answers-tiny" id="q-answers">
        <button class="ans-tiny" data-v="1">
          <span class="ans-big">👍</span>
          <span class="ans-word">${ui('quiz_yes')}</span>
        </button>
        <button class="ans-tiny" data-v="0">
          <span class="ans-big">👎</span>
          <span class="ans-word">${ui('quiz_no')}</span>
        </button>
      </div>`;
  } else if (q.type === 'likert') {
    const scaleLabels = [ui('likert_1'), ui('likert_2'), ui('likert_3'), ui('likert_4'), ui('likert_5')];
    answersHtml = `
      <div class="scale-answers" id="q-answers">
        ${[1,2,3,4,5].map((v,i) => `
          <button class="scale-btn" data-v="${v}">
            <strong>${v}</strong><br>
            <small>${scaleLabels[i]}</small>
          </button>`).join('')}
      </div>`;
  } else {
    answersHtml = `
      <div class="answers" id="q-answers">
        ${(q.options || []).map((opt, i) => `
          <button class="ans" data-v="${i}">
            <span class="ans-icon">${['🅐','🅑','🅒','🅓'][i] || '◦'}</span>
            ${opt}
          </button>`).join('')}
      </div>`;
  }

  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-prog-top">
        <span class="quiz-prog-label">${qLabel()} ${idx + 1} / ${qs.length}</span>
        <span class="quiz-prog-score">${ui('card_score')}: ${S.quiz.score}</span>
      </div>
      <div class="quiz-prog-bar">
        <div class="quiz-prog-fill" style="width:${pct}%"></div>
      </div>
    </div>

    <div class="q-wrap anim-fade-up">
      ${q.category ? `<span class="q-badge">${q.category}</span>` : ''}
      <p class="q-text">${q.q}</p>
      ${canReadAloud() ? `<button class="btn-read-aloud" id="btn-read-quiz" type="button" aria-label="${ui('ui_read_aloud')||'Read to me'}">🔊 ${ui('ui_read_aloud')||'Read to me'}</button>` : ''}
      ${answersHtml}
      <div id="q-feedback" class="hidden" style="margin-top:14px;padding:14px;border-radius:10px;font-size:.875rem;line-height:1.6;"></div>
    </div>
  `;

  if (S.age === 'tiny') speakText(q.q);

  const readQuizBtn = $('btn-read-quiz');
  if (readQuizBtn) readQuizBtn.addEventListener('click', () => speakText(q.q));

  $$('#q-answers button').forEach(btn => {
    btn.addEventListener('click', () => answerQuiz(Number(btn.dataset.v), q, btn));
  });
}

function answerQuiz(value, q, clickedBtn) {
  $$('#q-answers button').forEach(b => { b.disabled = true; });

  let correct  = false;
  let scoreAdd = 0;

  if (q.type === 'yesno') {
    correct  = value === q.correct;
    scoreAdd = correct ? 2 : 0;
    clickedBtn.classList.add(correct ? 'picked-yes' : 'picked-no');
    if (!correct) {
      document.querySelector(`#q-answers [data-v="${q.correct}"]`)?.classList.add('picked-yes');
    }
  } else if (q.type === 'likert') {
    const ideal = q.ideal || 3;
    scoreAdd = Math.max(0, 5 - Math.abs(value - ideal));
    correct  = Math.abs(value - ideal) <= 1;
    clickedBtn.classList.add('selected');
  } else {
    correct  = value === q.correct;
    scoreAdd = correct ? 3 : 0;
    clickedBtn.style.borderColor = correct ? 'var(--green)' : 'var(--red)';
    clickedBtn.style.color       = correct ? 'var(--green)' : 'var(--red)';
    if (!correct) {
      const right = document.querySelector(`#q-answers [data-v="${q.correct}"]`);
      if (right) { right.style.borderColor = 'var(--green)'; right.style.color = 'var(--green)'; }
    }
  }

  S.quiz.score += scoreAdd;
  lsSave();

  const fb = $('q-feedback');
  if (fb && q.explanation) {
    fb.classList.remove('hidden');
    fb.style.background  = correct ? 'rgba(0,255,136,.07)' : 'rgba(248,113,113,.07)';
    fb.style.borderLeft  = `3px solid ${correct ? 'var(--green)' : 'var(--red)'}`;
    const sourceHtml = (q.source && q.sourceUrl)
      ? `<div style="margin-top:8px;font-size:.8em;opacity:.85">${ui('ui_source_label') || 'Source'}: <a href="${q.sourceUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${q.source}</a></div>`
      : '';
    fb.innerHTML = `${correct ? '✅' : '💡'} ${q.explanation}${sourceHtml}`;
  }

  setTimeout(() => {
    S.quiz.idx++;
    renderQuestion();
  }, q.explanation ? (q.source ? 5000 : 2200) : 900);
}

function onQuizDone() {
  S.quiz.done = true;
  lsSave();
  computeResult();
}

/* ─────────────────────────────────────────────
   RESULT
───────────────────────────────────────────── */
function computeResult() {
  const data   = ageData();
  const qs     = data?.quiz || [];
  const cfg    = AGE_CFG[S.age] || AGE_CFG.child;

  const maxQuiz = qs.reduce((s, q) => {
    if (q.type === 'yesno')  return s + 2;
    if (q.type === 'likert') return s + 5;
    return s + 3;
  }, 0);

  const quizPct = maxQuiz > 0 ? Math.round((S.quiz.score / maxQuiz) * 100) : 0;
  const gamePct = Math.round((S.game.score / (cfg.gameRounds || 5)) * 100);
  const combined = Math.round(quizPct * 0.6 + gamePct * 0.4);

  S.result.score = combined;
  S.result.tier  = combined >= 75 ? 2 : combined >= 50 ? 1 : 0;
  S.result.ready = true;
  lsSave();

  showResult();
}

function showResult() {
  show('result');
  scrollTo('result');

  const data    = ageData();
  const tiers   = data?.results || [];
  const tier    = tiers[S.result.tier] || {};
  const medals  = ['🥉', '🥈', '🥇'];
  const ranks   = [ui('result_tier_0'), ui('result_tier_1'), ui('result_tier_2')];

  const container = $('result-summary');
  if (!container) return;

  container.innerHTML = `
    <div class="result-hero anim-fade-up">
      <span class="result-emoji">${medals[S.result.tier]}</span>
      <p class="result-rank">${ranks[S.result.tier] || ''}</p>
      <h2 class="result-title">${tier.title || 'You completed the test!'}</h2>
      <div class="result-score">${ui('card_score')}: ${S.result.score}%</div>
      <p class="result-desc">${tier.description || ''}</p>

      <div class="axes-grid" style="margin-top:20px;text-align:left;">
        <div class="axis-row">
          <div class="axis-top">
            <span class="axis-name">🐍 ${ui('result_game_label')}</span>
            <span class="axis-pct">${S.game.score}/${S.game.rounds}</span>
          </div>
          <div class="axis-bar">
            <div class="axis-fill" style="width:${Math.round(S.game.score/S.game.rounds*100)}%"></div>
          </div>
        </div>
        <div class="axis-row">
          <div class="axis-top">
            <span class="axis-name">🧠 ${ui('result_quiz_label')}</span>
            <span class="axis-pct">${S.result.score}%</span>
          </div>
          <div class="axis-bar">
            <div class="axis-fill" style="width:${S.result.score}%"></div>
          </div>
        </div>
      </div>

      <div class="action-row" style="margin-top:24px;">
        <button class="btn-primary" id="btn-get-card">${ui('btn_get_card')}</button>
        <button class="btn-outline" id="btn-see-protocols">📋 ${ui('protocols_title')}</button>
        ${S.age !== 'adult' ? `<button class="btn-share" id="btn-share-cert">🏆 Share Result</button>` : ''}
      </div>
      <div class="action-row" style="margin-top:10px;">
        <button class="btn-outline" id="btn-restart-all">${ui('btn_restart_all')}</button>
      </div>
    </div>
  `;

  $('btn-restart-all').addEventListener('click', () => {
    if (!confirm(ui('restart_confirm'))) return;
    try { localStorage.removeItem(LS_KEY); } catch (_) {}
    location.reload();
  });

  $('btn-get-card').addEventListener('click', () => {
    show('card-area');
    scrollTo('card-area');
    if (window.KAT_Card) window.KAT_Card.generate(S, CARD_SALT, PROJECT_START_MS);
  });

  $('btn-see-protocols').addEventListener('click', () => {
    show('protocols');
    renderProtocols();
    scrollTo('protocols');
  });

  const shareBtn = $('btn-share-cert');
  if (shareBtn) shareBtn.addEventListener('click', shareResult);

  if (S.age === 'adult') renderBookRec(container);
}

const SHARE_MSG = {
  en: (s) => `🏆 My child just scored ${s}% on the AI Test and beat 90% of adults! How smart is YOUR kid? Try now (free, no signup):`,
  ru: (s) => `🏆 Мой ребёнок прошёл AI Тест с результатом ${s}% и обошёл 90% взрослых! А ваш? Проверьте (бесплатно, без регистрации):`,
  de: (s) => `🏆 Mein Kind hat den KI-Test mit ${s}% bestanden und 90% der Erwachsenen übertroffen! Wie ist es bei Ihrem? Jetzt testen (kostenlos):`,
  es: (s) => `🏆 Mi hijo pasó el Test de IA con ${s}% y superó al 90% de adultos! ¿Y el tuyo? Pruébalo (gratis, sin registro):`,
  fr: (s) => `🏆 Mon enfant a réussi le Test IA avec ${s}% et a battu 90% des adultes ! Et le vôtre ? Essayez maintenant (gratuit) :`,
};

function shareResult() {
  const score = S.result.score;
  const lang = S.lang;
  const url  = 'https://iamalex-afk.github.io/kids-ai-test/';
  const msg  = (SHARE_MSG[lang] || SHARE_MSG.en)(score);
  const text = `${msg}\n${url}`;
  if (navigator.share) {
    navigator.share({ title: 'Kids AI Test', text: msg, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text).then(() => {
      const btn = $('btn-share-cert');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '🏆 Share Result'; }, 2500); }
    }).catch(() => { window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`, '_blank'); });
  }
  collectStats();
}

function collectStats() {
  const stats = {
    date: new Date().toISOString().slice(0, 10),
    age: S.age,
    lang: S.lang,
    quizScore: S.result.score,
    gameScore: S.game.score,
    gameRounds: S.game.rounds,
    lessonsDone: S.lesson.idx,
  };
  try {
    const hist = JSON.parse(localStorage.getItem('kat_stats') || '[]');
    hist.push(stats);
    localStorage.setItem('kat_stats', JSON.stringify(hist.slice(-30)));
  } catch (_) {}
}

// Was hardcoded English + an Amazon.it link regardless of site language —
// a Russian reader got sent to Amazon for a book that's actually on
// Литрес. Localized properly; other languages still fall back to the
// English/Amazon pairing (Amazon does serve those markets reasonably).
const BOOK_REC_STR = {
  en: {
    badge: '📚 Want to understand how AI actually thinks?',
    title: 'AI Biohacking: 33 Protocols for Consciousness Reboot',
    text: 'This book was written by AI itself, to explain — in plain language, for parents and everyday readers — how AI really works, how it "thinks", and what\'s behind the questions people ask it most.',
    linkLabel: '📖 Read on Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  ru: {
    badge: '🧠 Хотите понять, как устроен и «думает» ИИ — простыми словами?',
    title: 'Биохакинг с ИИ: 33 протокола перезагрузки сознания',
    text: 'Эта книга написана самим ИИ — чтобы простым языком объяснить обычным людям и родителям, как ИИ на самом деле работает, как он «думает» и что стоит за самыми популярными вопросами, которые ему задают.',
    linkLabel: '📖 Найти книгу на Литрес →',
    linkUrl: 'https://www.litres.ru/book/aleksey-sergeevich-bitk/biohaking-s-ii-33-protokola-perezagruzki-soznaniya-72799232/',
  },
  de: {
    badge: '🧠 Willst du wirklich verstehen, wie KI "denkt"?',
    title: 'AI Biohacking: 33 Protokolle für den Bewusstseins-Reboot',
    text: 'Dieses Buch wurde von der KI selbst geschrieben — um in einfacher Sprache, für Eltern und alltägliche Leser, zu erklären, wie KI wirklich funktioniert, wie sie "denkt" und was hinter den häufigsten Fragen steckt, die man ihr stellt.',
    linkLabel: '📖 Auf Amazon lesen →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  es: {
    badge: '🧠 ¿Quieres entender cómo "piensa" realmente la IA?',
    title: 'AI Biohacking: 33 Protocolos para el Reinicio de la Consciencia',
    text: 'Este libro fue escrito por la propia IA, para explicar — en lenguaje sencillo, para padres y lectores comunes — cómo funciona realmente la IA, cómo "piensa" y qué hay detrás de las preguntas que más le hacen.',
    linkLabel: '📖 Leer en Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  fr: {
    badge: "🧠 Envie de comprendre comment l'IA « pense » vraiment ?",
    title: 'AI Biohacking : 33 protocoles pour redémarrer la conscience',
    text: "Ce livre a été écrit par l'IA elle-même, pour expliquer — en langage simple, pour les parents et les lecteurs ordinaires — comment l'IA fonctionne vraiment, comment elle « pense », et ce qui se cache derrière les questions qu'on lui pose le plus.",
    linkLabel: '📖 Lire sur Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  pt: {
    badge: '🧠 Quer entender como a IA realmente "pensa"?',
    title: 'AI Biohacking: 33 Protocolos para o Reinício da Consciência',
    text: 'Este livro foi escrito pela própria IA, para explicar — em linguagem simples, para pais e leitores comuns — como a IA realmente funciona, como ela "pensa" e o que está por trás das perguntas mais feitas a ela.',
    linkLabel: '📖 Ler na Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  tr: {
    badge: '🧠 AI\'nin gerçekten nasıl "düşündüğünü" anlamak ister misin?',
    title: 'AI Biohacking: Bilinç Yeniden Başlatma için 33 Protokol',
    text: 'Bu kitap, AI\'nin kendisi tarafından yazıldı — ebeveynler ve sıradan okuyucular için, AI\'nin gerçekte nasıl çalıştığını, nasıl "düşündüğünü" ve ona en çok sorulan soruların arkasında ne olduğunu sade bir dille anlatmak için.',
    linkLabel: '📖 Amazon\'da oku →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  vi: {
    badge: '🧠 Bạn muốn hiểu cách AI thực sự "suy nghĩ"?',
    title: 'AI Biohacking: 33 Giao Thức Khởi Động Lại Ý Thức',
    text: 'Cuốn sách này được chính AI viết ra — để giải thích bằng ngôn ngữ đơn giản, dành cho phụ huynh và độc giả bình thường, về cách AI thực sự hoạt động, cách nó "suy nghĩ" và điều gì đằng sau những câu hỏi mà mọi người hay hỏi nó nhất.',
    linkLabel: '📖 Đọc trên Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  id: {
    badge: '🧠 Ingin memahami bagaimana AI benar-benar "berpikir"?',
    title: 'AI Biohacking: 33 Protokol untuk Reboot Kesadaran',
    text: 'Buku ini ditulis oleh AI itu sendiri — untuk menjelaskan, dengan bahasa sederhana, bagi orang tua dan pembaca biasa, bagaimana AI sebenarnya bekerja, bagaimana ia "berpikir", dan apa yang ada di balik pertanyaan yang paling sering diajukan kepadanya.',
    linkLabel: '📖 Baca di Amazon →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
  hi: {
    badge: '🧠 जानना चाहते हो कि AI असल में कैसे "सोचता" है?',
    title: 'AI बायोहैकिंग: चेतना रीबूट के लिए 33 प्रोटोकॉल',
    text: 'यह किताब खुद AI ने लिखी है — सरल भाषा में, माता-पिता और आम पाठकों के लिए यह समझाने के लिए कि AI असल में कैसे काम करता है, वह कैसे "सोचता" है, और उससे सबसे ज़्यादा पूछे जाने वाले सवालों के पीछे क्या है।',
    linkLabel: '📖 Amazon पर पढ़ें →',
    linkUrl: 'https://www.amazon.it/dp/B0G35SBQR3',
  },
};
function renderBookRec(container) {
  if (!container || container.querySelector('.book-rec')) return;
  const d = BOOK_REC_STR[S.lang] || BOOK_REC_STR.en;
  const el = document.createElement('div');
  el.className = 'book-rec anim-fade-up';
  el.innerHTML = `
    <div class="book-rec-badge">${d.badge}</div>
    <div class="book-rec-title">${d.title}</div>
    <div class="book-rec-text">${d.text}</div>
    <a class="book-rec-link" href="${d.linkUrl}" target="_blank" rel="noopener">
      ${d.linkLabel}
    </a>
  `;
  container.appendChild(el);
}

/* ─────────────────────────────────────────────
   PROTOCOLS
───────────────────────────────────────────── */
function renderProtocols() {
  const protocols = ageData()?.protocols || [];
  const container = $('protocols-list');
  if (!container) return;

  container.innerHTML = protocols.map(p => `
    <div class="protocol-card">
      <div class="protocol-num">${String(p.num).padStart(2,'0')}</div>
      <span class="protocol-icon">${p.icon || '📌'}</span>
      <div class="protocol-title">${p.title}</div>
      <div class="protocol-text">${p.text}</div>
    </div>
  `).join('');

}

/* ─────────────────────────────────────────────
   TRACKER
───────────────────────────────────────────── */
function initTracker() {
  loadTrackerHistory();
  renderTracker();

  const slider  = $('tracker-slider');
  const display = $('tracker-current-val');
  const valDisp = $('tracker-val-display');

  if (slider) {
    slider.addEventListener('input', () => {
      const v = slider.value;
      if (display) display.textContent = v;
      if (valDisp) valDisp.textContent = v;
    });
  }

  const logBtn = $('btn-tracker-log');
  if (logBtn) logBtn.addEventListener('click', () => {
    const v = parseInt($('tracker-slider')?.value || '3', 10);
    logTrackerValue(v);
  });
}

function loadTrackerHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY + '_tracker');
    if (raw) S.tracker = JSON.parse(raw);
  } catch (_) {}
  const today = todayStr();
  S.tracker.loggedToday = S.tracker.history?.some(h => h.date === today) || false;
}

function logTrackerValue(value) {
  const today = todayStr();
  S.tracker.history = (S.tracker.history || []).filter(h => h.date !== today);
  S.tracker.history.push({ date: today, value });
  S.tracker.history.sort((a, b) => a.date.localeCompare(b.date));
  if (S.tracker.history.length > 7) S.tracker.history = S.tracker.history.slice(-7);
  S.tracker.loggedToday = true;
  try { localStorage.setItem(LS_KEY + '_tracker', JSON.stringify(S.tracker)); } catch (_) {}
  renderTracker();
  const logArea = $('tracker-log-area');
  if (logArea) logArea.style.opacity = '.4';
  const logBtn = $('btn-tracker-log');
  const LOGGED = { en:'✓ Logged!', ru:'✓ Записано!', de:'✓ Eingetragen!', es:'✓ ¡Guardado!', fr:'✓ Enregistré !', hi:'✓ दर्ज!', id:'✓ Tersimpan!', pt:'✓ Registrado!', tr:'✓ Kaydedildi!', vi:'✓ Đã ghi!' };
  if (logBtn) { logBtn.textContent = LOGGED[S.lang] || LOGGED.en; logBtn.disabled = true; }
}

function renderTracker() {
  const chart = $('tracker-chart');
  if (!chart) return;

  const days  = ageData()?.trackerLabels || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const slots = [];
  const today = todayStr();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds    = d.toISOString().slice(0, 10);
    const entry = S.tracker.history?.find(h => h.date === ds);
    const dow   = d.getDay();
    slots.push({ date: ds, value: entry?.value || 0, day: days[dow === 0 ? 6 : dow - 1], isToday: ds === today });
  }

  const maxH = 52;
  chart.innerHTML = slots.map(s => {
    const h   = s.value ? Math.round((s.value / 5) * maxH) : 0;
    const col = s.value ? 'var(--accent)' : 'var(--border)';
    return `
      <div class="tracker-bar-wrap">
        <div class="tracker-bar" style="height:${h}px;background:${col};border-color:${col};"></div>
        <div class="tracker-day" style="${s.isToday ? 'color:var(--accent);font-weight:700' : ''}">${s.day}</div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   PARENT CORNER TOGGLE
───────────────────────────────────────────── */
function initParent() {
  const toggle = $('parent-toggle');
  const body   = $('parent-body');
  const wrap   = document.querySelector('.parent-wrap');

  if (!toggle || !body) return;

  toggle.addEventListener('click', () => {
    const open = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    body.style.display = open ? 'block' : 'none';
  });

  renderParentFaq();
}

// Sourced, long-tail Q&A (MIT Media Lab, UNESCO, EU AI Act, WEF, Ericsson
// 1993, ...) — written for real parent search queries and citable by
// search engines. Only the age-specific section matching S.age is shown
// (previously showed all four ages' Q&A stacked together regardless of
// which age was selected). Safe to call repeatedly — e.g. from selectAge()
// on a mid-session age switch — since it replaces its own prior output
// rather than appending on top of it, and doesn't touch the toggle
// listener set up once in initParent().
function renderParentFaq() {
  const body = $('parent-body');
  if (!body) return;
  const d = (window.PARENTS_FAQ || {})[S.lang] || (window.PARENTS_FAQ || {}).en;
  const existing = body.querySelector('.pf-sourced-faq');
  if (existing) existing.remove();
  if (d && Array.isArray(d.faq) && d.faq.length) {
    const wrapEl = document.createElement('div');
    wrapEl.className = 'pf-sourced-faq';
    wrapEl.innerHTML = `
      <h4>${d.faq_h || 'Frequently Asked Questions'}</h4>
      <div class="faq-section" style="margin-bottom:16px">
        ${d.faq.map(item => `
          <details class="faq-item">
            <summary><h3>${item.q}</h3></summary>
            <p class="faq-answer">${item.a}</p>
          </details>`).join('')}
      </div>
      ${[S.age].filter(k => Array.isArray(d['faq_'+k]) && d['faq_'+k].length).map(k => `
        <h4>${d['faq_'+k+'_h'] || ''}</h4>
        <div class="faq-section" style="margin-bottom:16px">
          ${d['faq_'+k].map(item => `
            <details class="faq-item">
              <summary><h3>${item.q}</h3></summary>
              <p class="faq-answer">${item.a}</p>
            </details>`).join('')}
        </div>`).join('')}
      ${d.proto_desc ? `<p style="font-size:0.82rem;color:var(--muted2);">${d.proto_by || ''} <em>${d.proto_desc}</em></p>` : ''}
    `;
    body.appendChild(wrapEl);
  }
}

/* ─────────────────────────────────────────────
   FLIP CARDS (myth busters)
───────────────────────────────────────────── */
function initFlipCards() {
  document.addEventListener('click', e => {
    const card = e.target.closest('.myth-card');
    if (card) card.classList.toggle('flipped');
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   RESTORE PROGRESS
───────────────────────────────────────────── */
function restoreProgress() {
  initAgePicker();
  initParent();
  initFlipCards();

  if (!S.age) return;

  // Re-apply theme
  document.body.setAttribute('data-age', S.age);
  $$('.age-card').forEach(c => c.classList.remove('active'));
  const ac = document.querySelector(`.age-card[data-age="${S.age}"]`);
  if (ac) ac.classList.add('active');
  $$('[data-age-quick]').forEach(b => b.classList.remove('age-active'));
  const qb = document.querySelector(`[data-age-quick="${S.age}"]`);
  if (qb) qb.classList.add('age-active');
  const mascotEl = $('hero-mascot-emoji');
  if (mascotEl) mascotEl.textContent = MASCOTS[S.age] || '🤖';

  show('tracker');
  initTracker();

  if (S.card.generated) {
    show('result');
    show('protocols');
    show('lessons');
    show('game');
    show('quiz');
    showResult();
    renderProtocols();
    return;
  }
  if (S.quiz.done)    { show('lessons'); show('game'); show('quiz'); show('result'); computeResult(); return; }
  if (S.game.done)    { show('lessons'); show('game'); show('quiz'); startQuiz();    return; }
  if (S.lesson.idx>0) { show('lessons'); renderLesson(); return; }

  // Fresh start with this age — begin lessons
  setTimeout(() => startLessons(), 300);
}

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
function todayStr() { return new Date().toISOString().slice(0, 10); }

/* ─────────────────────────────────────────────
   PUBLIC API  (for card.js and data files)
───────────────────────────────────────────── */
window.KAT = {
  onCardGenerated(card) {
    S.card = { ...card, generated: true };
    lsSave();
    // Update card number display
    const numEl  = $('card-number');
    const nameEl = $('card-name-display');
    if (numEl)  numEl.textContent  = '#' + card.number;
    if (nameEl) nameEl.textContent = card.name;
    show('protocols');
    renderProtocols();
    scrollTo('protocols');
  },
  get state() { return S; },
};

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
function init() {
  S.lang = document.documentElement.lang || 'en';
  lsLoad();
  setupPwaInstall();
  const exitTitle = ui('ui_exit_title');
  const lessonsExitBtn = $('lessons-exit-btn');
  if (lessonsExitBtn) lessonsExitBtn.title = exitTitle;
  const quizExitBtn = $('quiz-exit-btn');
  if (quizExitBtn) quizExitBtn.title = exitTitle;
  boot();
}

// Pause lessons/quiz and return to the top of the page without erasing
// progress — the existing resume logic (see afterBoot) picks up exactly
// where the learner left off if they select their age again.
function exitToHub() {
  hide('lessons');
  hide('quiz');
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

/* ─────────────────────────────────────────────
   PWA INSTALL PROMPT
   Shows a real "Install App" button only when the browser confirms the
   site is actually installable (beforeinstallprompt) — never a fake
   button that does nothing on unsupported browsers.
───────────────────────────────────────────── */
function setupPwaInstall() {
  const wrap = $('pwa-install-wrap');
  const btn  = $('pwa-install-btn');
  if (!wrap || !btn) return;
  btn.textContent = ui('btn_install_app');

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    wrap.style.display = '';
  });
  btn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      deferredPrompt = null;
      wrap.style.display = 'none';
    });
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    wrap.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', init);
