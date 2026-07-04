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
  tiny:  { lessons: 3, gameRounds: 3 },
  child: { lessons: 4, gameRounds: 4 },
  teen:  { lessons: 5, gameRounds: 5 },
  adult: { lessons: 6, gameRounds: 5 },
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
  if (fill) setTimeout(() => { fill.style.width = '100%'; }, 400);

  // "ACCESS GRANTED" fade-in
  if (access) setTimeout(() => {
    access.style.transition = 'opacity 0.5s ease';
    access.style.opacity    = '1';
  }, 3400);

  // Fade out boot screen
  setTimeout(() => {
    bootEl.classList.add('hide');
    setTimeout(() => { bootEl.hidden = true; afterBoot(); }, 700);
  }, 5200);
}

function afterBoot() {
  renderTopBar();
  if (S.age) {
    restoreProgress();
  } else {
    initParent();
    initFlipCards();
    showUserTypePicker();
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

  setTimeout(() => { show('mode-picker'); scrollTo('mode-picker'); initModePicker(); }, 400);
}

const MODE_STR = {
  en: { step:'STEP 2', q:'What do you want to do?', lb:'LEARN + TEST', lt:'Lessons & Quiz', ld:'3–6 lessons → quiz → earn your unique card', pb:'GAMES', pt:'Play & Learn', pd:'AI Snake · AI Duel — learn while playing' },
  ru: { step:'ШАГ 2', q:'Что хочешь делать?', lb:'УРОКИ + ТЕСТ', lt:'Учиться и пройти тест', ld:'3–6 уроков → финальный тест → твоя уникальная карточка', pb:'ИГРЫ', pt:'Играть и учиться', pd:'AI Змейка · AI Дуэль — учись в игре' },
  de: { step:'SCHRITT 2', q:'Was möchtest du tun?', lb:'LERNEN + TEST', lt:'Lektionen & Quiz', ld:'3–6 Lektionen → Quiz → verdiene deine einzigartige Karte', pb:'SPIELE', pt:'Spielen & Lernen', pd:'KI-Schlange · KI-Duell — lerne beim Spielen' },
  es: { step:'PASO 2', q:'¿Qué quieres hacer?', lb:'APRENDER + TEST', lt:'Lecciones & Quiz', ld:'3–6 lecciones → quiz → gana tu tarjeta única', pb:'JUEGOS', pt:'Jugar & Aprender', pd:'IA Snake · IA Duelo — aprende jugando' },
  fr: { step:'ÉTAPE 2', q:'Que veux-tu faire ?', lb:'APPRENDRE + TEST', lt:'Leçons & Quiz', ld:'3–6 leçons → quiz → gagne ta carte unique', pb:'JEUX', pt:'Jouer & Apprendre', pd:'IA Serpent · IA Duel — apprends en jouant' },
  hi: { step:'चरण 2', q:'तुम क्या करना चाहते हो?', lb:'सीखो + टेस्ट', lt:'पाठ और प्रश्नोत्तरी', ld:'3–6 पाठ → प्रश्नोत्तरी → अपना अनूठा कार्ड पाओ', pb:'खेल', pt:'खेलो और सीखो', pd:'AI साँप · AI द्वंद्व — खेलते हुए सीखो' },
  id: { step:'LANGKAH 2', q:'Apa yang ingin kamu lakukan?', lb:'BELAJAR + TES', lt:'Pelajaran & Kuis', ld:'3–6 pelajaran → kuis → dapatkan kartumu yang unik', pb:'GAME', pt:'Main & Belajar', pd:'AI Ular · AI Duel — belajar sambil bermain' },
  pt: { step:'PASSO 2', q:'O que você quer fazer?', lb:'APRENDER + TESTE', lt:'Lições & Quiz', ld:'3–6 lições → quiz → ganhe seu cartão único', pb:'JOGOS', pt:'Jogar & Aprender', pd:'IA Cobra · IA Duelo — aprenda jogando' },
  tr: { step:'ADIM 2', q:'Ne yapmak istiyorsun?', lb:'ÖĞREN + TEST', lt:'Dersler & Quiz', ld:'3–6 ders → test → özel kartını kazan', pb:'OYUNLAR', pt:'Oyna & Öğren', pd:'YZ Yılan · YZ Düello — oynayarak öğren' },
  vi: { step:'BƯỚC 2', q:'Bạn muốn làm gì?', lb:'HỌC + KIỂM TRA', lt:'Bài học & Câu hỏi', ld:'3–6 bài học → câu hỏi → nhận thẻ độc đáo của bạn', pb:'TRÒ CHƠI', pt:'Chơi & Học', pd:'AI Rắn · AI Đấu — học qua chơi' },
};

/* ─────────────────────────────────────────────
   USER-TYPE PICKER (shown on first visit)
───────────────────────────────────────────── */
const UT_STR = {
  en: { q:'Who are you?', parent:'Parent / Adult', child:'I am a Child',
        pd:'Lessons · Deep quiz · Unique card', cd:'Games · Stories · Fun quiz',
        age:'How old are you?', back:'← Back' },
  ru: { q:'Кто ты?', parent:'Родитель / Взрослый', child:'Я Ребёнок',
        pd:'Уроки · Тест · Уникальная карточка', cd:'Игры · Истории · Лёгкий тест',
        age:'Сколько тебе лет?', back:'← Назад' },
  de: { q:'Wer bist du?', parent:'Elternteil / Erwachsener', child:'Ich bin ein Kind',
        pd:'Lektionen · Quiz · Einzigartige Karte', cd:'Spiele · Geschichten · Leichtes Quiz',
        age:'Wie alt bist du?', back:'← Zurück' },
  es: { q:'¿Quién eres?', parent:'Padre / Adulto', child:'Soy un Niño',
        pd:'Lecciones · Quiz · Tarjeta única', cd:'Juegos · Historias · Quiz fácil',
        age:'¿Cuántos años tienes?', back:'← Atrás' },
  fr: { q:'Qui es-tu ?', parent:'Parent / Adulte', child:'Je suis un Enfant',
        pd:'Leçons · Quiz · Carte unique', cd:'Jeux · Histoires · Quiz sympa',
        age:'Quel âge as-tu ?', back:'← Retour' },
  hi: { q:'तुम कौन हो?', parent:'माता-पिता / वयस्क', child:'मैं एक बच्चा हूँ',
        pd:'पाठ · प्रश्नोत्तरी · कार्ड', cd:'खेल · कहानियाँ · आसान टेस्ट',
        age:'तुम्हारी उम्र क्या है?', back:'← वापस' },
  id: { q:'Siapa kamu?', parent:'Orang Tua / Dewasa', child:'Saya Anak-anak',
        pd:'Pelajaran · Kuis · Kartu unik', cd:'Game · Cerita · Kuis mudah',
        age:'Berapa umurmu?', back:'← Kembali' },
  pt: { q:'Quem é você?', parent:'Pai / Adulto', child:'Sou uma Criança',
        pd:'Lições · Quiz · Cartão único', cd:'Jogos · Histórias · Quiz fácil',
        age:'Quantos anos você tem?', back:'← Voltar' },
  tr: { q:'Sen kimsin?', parent:'Ebeveyn / Yetişkin', child:'Ben Bir Çocuğum',
        pd:'Dersler · Test · Özel kart', cd:'Oyunlar · Hikayeler · Kolay test',
        age:'Kaç yaşındasın?', back:'← Geri' },
  vi: { q:'Bạn là ai?', parent:'Phụ huynh / Người lớn', child:'Tôi là Trẻ em',
        pd:'Bài học · Câu hỏi · Thẻ độc đáo', cd:'Trò chơi · Câu chuyện · Quiz dễ',
        age:'Bạn bao nhiêu tuổi?', back:'← Quay lại' },
};

const UT_AGES = {
  tiny:  { icon:'🧸', range:'3 – 6' },
  child: { icon:'🎮', range:'7 – 12' },
  teen:  { icon:'📱', range:'13 – 17' },
};

function showUserTypePicker() {
  const existing = $('age-picker');
  if (existing) existing.style.display = 'none';

  const s = UT_STR[S.lang] || UT_STR.en;

  const wrap = document.createElement('div');
  wrap.id = 'user-type-screen';
  wrap.innerHTML = `
    <div id="ut-p1" class="ut-page anim-fade-up">
      <h2 class="ut-title">${s.q}</h2>
      <div class="ut-cards">
        <button class="ut-card ut-parent" id="btn-ut-parent">
          <div class="ut-icon">🧠</div>
          <div class="ut-label">${s.parent}</div>
          <div class="ut-desc">${s.pd}</div>
        </button>
        <button class="ut-card ut-child" id="btn-ut-child">
          <div class="ut-icon">🧒</div>
          <div class="ut-label">${s.child}</div>
          <div class="ut-desc">${s.cd}</div>
        </button>
      </div>
    </div>
    <div id="ut-p2" class="ut-page hidden">
      <button class="ut-back" id="btn-ut-back">${s.back}</button>
      <h2 class="ut-title">${s.age}</h2>
      <div class="ut-child-ages">
        ${Object.entries(UT_AGES).map(([age, d]) => `
          <button class="age-card ut-age-card" data-age="${age}">
            <span class="age-icon">${d.icon}</span>
            <span class="age-label">${d.range}</span>
          </button>`).join('')}
      </div>
    </div>
  `;

  if (existing && existing.parentNode) {
    existing.parentNode.insertBefore(wrap, existing);
  } else {
    (document.querySelector('main') || document.body).prepend(wrap);
  }

  $('btn-ut-parent').addEventListener('click', () =>
    utGo(() => {
      wrap.remove();
      showParentInfo(
        () => { if (existing) existing.style.display = ''; selectAge('adult'); },
        () => showUserTypePicker()
      );
    })
  );
  $('btn-ut-child').addEventListener('click', () => {
    $('ut-p1').classList.add('hidden');
    $('ut-p2').classList.remove('hidden');
    $('ut-p2').classList.add('anim-fade-up');
  });
  $('btn-ut-back').addEventListener('click', () => {
    $('ut-p2').classList.add('hidden');
    $('ut-p1').classList.remove('hidden');
    $('ut-p1').classList.add('anim-fade-up');
  });
  wrap.querySelectorAll('.ut-age-card').forEach(btn => {
    btn.addEventListener('click', () =>
      utGo(() => { wrap.remove(); if (existing) existing.style.display = ''; selectAge(btn.dataset.age); })
    );
  });
}

function utGo(cb) {
  const el = $('user-type-screen');
  if (!el) { cb(); return; }
  el.style.transition = 'opacity .25s ease, transform .25s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(.97)';
  setTimeout(cb, 260);
}

/* ─────────────────────────────────────────────
   PARENT INFO SCREEN
───────────────────────────────────────────── */
const PI_STR = {
  en: {
    title:'For Parents',
    subtitle:'AI literacy for the next generation',
    why_h:'🎯 Why this site?',
    why:'Children interact with AI daily — voice assistants, recommendation algorithms, content filters. This test helps them understand what AI is, what it can and cannot do, and how to think critically. Not just fun — real AI literacy.',
    priv_h:'🔒 Zero data collection',
    priv:'No cookies, no tracking, no registration. Progress is stored only in localStorage — it never leaves the device.',
    card_h:'🃏 About the card number',
    card:'The number = seconds since project launch (July 1 2026, UTC). No server. The hash is SHA-256, publicly verifiable — like a Pokémon serial number.',
    src_h:'📚 Sources',
    src:'Every fact links to a primary source: arXiv papers, UNESCO, MIT Media Lab, EU AI Act. No sensationalism, no anthropomorphizing.',
    q_h:'💬 Questions to discuss with your child',
    questions:['Can Alice miss you? How do you know?','If AI wrote a story — who is the real author?','What can AI do better than people? What do people do better?','If AI says it\'s true — how do you verify it?','Would you trust AI to make an important decision for you?'],
    share_h:'📱 About sharing',
    share:'The Share button uses the standard browser dialog showing Telegram, WhatsApp and other installed apps. The site sends no data to third parties.',
    oss_h:'🌍 Open source · GPL v3',
    oss:'All code is on GitHub. No ads. No paid tier. Supported only by voluntary donations.',
    cta_self:'Take the test yourself →',
    cta_child:'← Set up for child',
    proto_by:'By the same author:',
    proto_desc:'A guide to mindset rebooting in the AI era',
  },
  ru: {
    title:'Для родителей',
    subtitle:'ИИ-грамотность для следующего поколения',
    why_h:'🎯 Зачем этот сайт?',
    why:'Дети взаимодействуют с ИИ каждый день — голосовые помощники, алгоритмы рекомендаций, фильтры контента. Этот тест помогает понять: что такое ИИ, что он умеет и не умеет, как мыслить критически. Не просто развлечение — настоящая ИИ-грамотность.',
    priv_h:'🔒 Ноль сбора данных',
    priv:'Никаких куки, никакого трекинга, никакой регистрации. Прогресс хранится только в localStorage браузера — он никогда не покидает устройство.',
    card_h:'🃏 О номере карточки',
    card:'Номер = секунды с момента запуска проекта (1 июля 2026, UTC). Никакого сервера. Хэш — SHA-256, публично верифицируется. Как серийный номер карточки покемона.',
    src_h:'📚 Источники',
    src:'Каждый факт привязан к первоисточнику: статьи arXiv, ЮНЕСКО, MIT Media Lab, Закон ЕС об ИИ, Яндекс Учебник. Никакой сенсационности, никакой антропоморфизации.',
    q_h:'💬 Вопросы для обсуждения с ребёнком',
    questions:['Может ли Алиса скучать по тебе? Откуда ты знаешь?','Если ИИ написал рассказ — кто настоящий автор?','Что умеет ИИ лучше людей? А что люди делают лучше ИИ?','Если ИИ говорит, что это правда — как проверить?','Доверил бы ты ИИ принять за тебя важное решение? Почему да или нет?'],
    share_h:'📱 О социальных сетях и сервисах',
    share:'Кнопка «Поделиться» использует стандартный браузерный диалог — ВКонтакте, Telegram и другие установленные на устройстве приложения. Сайт не отправляет данные в сторонние сервисы напрямую.',
    oss_h:'🌍 Открытый код · GPL v3',
    oss:'Весь код находится на GitHub. Никакой рекламы. Никакого платного уровня. Поддерживается только добровольными пожертвованиями.',
    cta_self:'Пройти тест самому →',
    cta_child:'← Настроить для ребёнка',
    proto_by:'От того же автора:',
    proto_desc:'Руководство по перезагрузке мышления в эпоху ИИ',
  },
};

function showParentInfo(onSelf, onChild) {
  const d = (window.PARENTS_FAQ || {})[S.lang] || (window.PARENTS_FAQ || {}).en || {};
  const existing = $('parent-info-screen');
  if (existing) existing.remove();

  const faqHtml = (d.faq || []).map(item => `
    <details class="pi-faq-item">
      <summary class="pi-faq-q">${item.q}</summary>
      <div class="pi-faq-a">${item.a}</div>
    </details>`).join('');

  const discussHtml = (d.discuss || []).map(q => `<li>${q}</li>`).join('');

  const wrap = document.createElement('div');
  wrap.id = 'parent-info-screen';
  wrap.className = 'anim-fade-up';
  wrap.innerHTML = `
    <div class="pi-header">
      <div class="pi-title">${d.title || 'For Parents'}</div>
      <div class="pi-subtitle">${d.intro || ''}</div>
    </div>
    <div class="pi-grid">
      <div class="pi-card"><div class="pi-card-h">${d.priv_h||'🔒'}</div><div class="pi-card-t">${d.priv||''}</div></div>
      <div class="pi-card"><div class="pi-card-h">${d.src_h||'📚'}</div><div class="pi-card-t">${d.src||''}</div></div>
      <div class="pi-card pi-card--wide"><div class="pi-card-h">${d.discuss_h||'💬'}</div><ul class="pi-qlist">${discussHtml}</ul></div>
    </div>
    <div class="pi-proto">
      <span class="pi-proto-by">${d.proto_by||''}</span>
      <a class="pi-proto-link" href="https://iamAlex-afk.github.io/human-os-patch-33-protocols/" target="_blank" rel="noopener">AI Biohacking: 33 Protocols ↗</a>
      <div class="pi-proto-desc">${d.proto_desc||''}</div>
    </div>
    <h3 class="pi-faq-title">${d.faq_h||'FAQ'}</h3>
    <div class="pi-faq">${faqHtml}</div>
    <div class="pi-actions">
      <button class="pi-btn-child" id="pi-btn-child">${d.cta_child||'← Back'}</button>
      <button class="pi-btn-self" id="pi-btn-self">${d.cta_self||'Take test →'}</button>
    </div>
  `;

  (document.querySelector('main') || document.body).prepend(wrap);

  function piGo(cb) {
    wrap.style.transition = 'opacity .22s ease';
    wrap.style.opacity = '0';
    setTimeout(() => { wrap.remove(); cb(); }, 240);
  }

  $('pi-btn-self').addEventListener('click', () => piGo(onSelf));
  $('pi-btn-child').addEventListener('click', () => piGo(onChild));
}

/* ─────────────────────────────────────────────
   WEB SPEECH API
───────────────────────────────────────────── */
function speakText(text) {
  if (!('speechSynthesis' in window) || S.age !== 'tiny') return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = { ru:'ru-RU', de:'de-DE', es:'es-ES', fr:'fr-FR', hi:'hi-IN',
                id:'id-ID', pt:'pt-BR', tr:'tr-TR', vi:'vi-VN' }[S.lang] || 'en-US';
  utt.rate  = 0.82;
  utt.pitch = 1.15;
  window.speechSynthesis.speak(utt);
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
      const picker = $('game-picker');
      if (picker) picker.style.display = 'grid';
      updateGamePicker();
      show('game');
      scrollTo('game');
    };
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
          <h3 class="step-title">${lesson.title}</h3>
          <p class="step-text">${lesson.text}</p>
          ${lesson.example ? `<div class="step-example">💡 ${lesson.example}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="action-row">
      <button class="btn-primary" id="btn-next-lesson">
        ${hasTest ? '🧪 ' + (ui('mini_test_label')||'Quick Check') + ' →' : idx === lessons.length - 1 ? ui('lesson_last_btn')||'🎮 Ready for the Game!' : ui('lesson_next_btn')||'Got it! Next →'}
      </button>
    </div>
  `;

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
        <div class="answers" id="mt-options"></div>
        <div id="mt-feedback" class="hidden" style="margin-top:12px;padding:12px;border-radius:10px;font-size:.9rem;line-height:1.6;"></div>
      </div>
    </div>
  `;

  speakText(q.q);

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

function startGame() {
  const cfg   = AGE_CFG[S.age] || AGE_CFG.child;
  S.game      = { idx: 0, score: 0, rounds: cfg.gameRounds, done: false };
  lsSave();
  show('game');
  scrollTo('game');

  const data   = ageData();
  const rounds = (data?.snake || []).slice(0, cfg.gameRounds);
  const container = $('game-content');
  if (!container || !rounds.length || !window.KAT_Snake) { onGameDone(); return; }

  window.KAT_Snake.start(container, {
    age:  S.age,
    lang: S.lang,
    rounds,
    onRoundComplete(idx) {
      S.game.idx   = idx + 1;
      S.game.score = idx + 1;
      lsSave();
    },
    onAllDone() { onGameDone(); },
  });
}

function onGameDone() {
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
      ${answersHtml}
      <div id="q-feedback" class="hidden" style="margin-top:14px;padding:14px;border-radius:10px;font-size:.875rem;line-height:1.6;"></div>
    </div>
  `;

  speakText(q.q);

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
    fb.innerHTML = `${correct ? '✅' : '💡'} ${q.explanation}`;
  }

  setTimeout(() => {
    S.quiz.idx++;
    renderQuestion();
  }, q.explanation ? 2200 : 900);
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
    </div>
  `;

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

function renderBookRec(container) {
  if (!container || container.querySelector('.book-rec')) return;
  const el = document.createElement('div');
  el.className = 'book-rec anim-fade-up';
  el.innerHTML = `
    <div class="book-rec-badge">📚 Recommendation</div>
    <div class="book-rec-title">AI Biohacking: 33 Protocols for Consciousness Reboot</div>
    <div class="book-rec-text">A unique guide written from AI's perspective — 33 protocols to reboot your mindset in the age of artificial intelligence. A systematic approach to cognitive productivity and conscious adaptation to the AI era.</div>
    <a class="book-rec-link" href="https://www.amazon.it/dp/B0G35SBQR3" target="_blank" rel="noopener">
      📖 Read on Amazon →
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
  boot();
}

document.addEventListener('DOMContentLoaded', init);
