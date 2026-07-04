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
  if (fill) setTimeout(() => { fill.style.width = '100%'; }, 200);

  // "ACCESS GRANTED" fade-in
  if (access) setTimeout(() => {
    access.style.transition = 'opacity 0.5s ease';
    access.style.opacity    = '1';
  }, 1700);

  // Fade out boot screen
  setTimeout(() => {
    bootEl.classList.add('hide');
    setTimeout(() => { bootEl.hidden = true; afterBoot(); }, 700);
  }, 2600);
}

function afterBoot() {
  renderTopBar();
  restoreProgress();
}

/* ─────────────────────────────────────────────
   TOP BAR
───────────────────────────────────────────── */
function renderTopBar() {
  // Language buttons — already in HTML, just wire click
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

  const opts = $('mt-options');
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className   = 'ans';
    btn.innerHTML   = `<span class="ans-icon">◦</span> ${opt}`;
    btn.addEventListener('click', () => answerMiniTest(i, q, btn));
    opts.appendChild(btn);
  });
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

  if (correct) S.lesson.mt.score++;
  lsSave();

  setTimeout(() => {
    S.lesson.mt.idx++;
    const qs = ageData()?.lessons[S.lesson.idx]?.miniTest || [];
    if (S.lesson.mt.idx < qs.length) renderMiniTest();
    else advanceLesson();
  }, 1800);
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
  $('btn-go-game').addEventListener('click', () => {
    const picker = document.getElementById('game-picker');
    if (picker) picker.style.display = 'grid';
    updateGamePicker();
    show('game');
    scrollTo('game');
  });
}

/* ─────────────────────────────────────────────
   GAME ENGINE — AI Snake
   Eats letters/words/phrases in order (from ageData().snake) while
   dodging decoy tokens. Engine lives in snake.js (window.KAT_Snake).
───────────────────────────────────────────── */
function updateGamePicker() {
  const age = S.age;
  const lang = S.lang || 'en';
  const isRu = lang === 'ru';

  const snakeDescs = {
    tiny:  { en:'Collect easy AI words — big letters, simple facts!', ru:'Собирай буквы и слова про ИИ, уклоняйся от красных. Простые слова!', de:'Sammle einfache KI-Wörter — große Buchstaben, einfache Fakten!', es:'¡Colecciona palabras de IA fáciles — letras grandes, hechos simples!', fr:'Collecte des mots d\'IA faciles — grandes lettres, faits simples !', hi:'आसान AI शब्द इकट्ठा करो — बड़े अक्षर, सरल तथ्य!', id:'Kumpulkan kata-kata AI mudah — huruf besar, fakta sederhana!', pt:'Colete palavras de IA fáceis — letras grandes, fatos simples!', tr:'Kolay YZ kelimelerini topla — büyük harfler, basit gerçekler!', vi:'Thu thập các từ AI dễ — chữ lớn, sự thật đơn giản!' },
    child: { en:'Collect AI terms in order. Learn how AI really works.', ru:'Собирай термины ИИ по порядку. Узнай как работает ИИ.', de:'Sammle KI-Begriffe der Reihe nach. Lerne wie KI wirklich funktioniert.', es:'Colecciona términos de IA en orden. Aprende cómo funciona la IA.', fr:'Collecte les termes d\'IA en ordre. Apprends comment fonctionne l\'IA.', hi:'क्रम में AI शब्द इकट्ठा करो। जानो AI कैसे काम करता है।', id:'Kumpulkan istilah AI secara berurutan. Pelajari cara kerja AI.', pt:'Colete termos de IA em ordem. Aprenda como a IA funciona.', tr:'YZ terimlerini sırayla topla. YZ\'nin nasıl çalıştığını öğren.', vi:'Thu thập thuật ngữ AI theo thứ tự. Tìm hiểu cách AI hoạt động.' },
    teen:  { en:'Advanced AI terms: gradient, neural net, epoch. For the brave.', ru:'Сложные термины ИИ: градиент, нейросеть, эпоха. Только для смелых.', de:'Fortgeschrittene KI-Begriffe: Gradient, neuronales Netz, Epoche. Für Mutige.', es:'Términos avanzados de IA: gradiente, red neuronal, época. Para los valientes.', fr:'Termes avancés d\'IA : gradient, réseau neuronal, époque. Pour les courageux.', hi:'उन्नत AI शब्द: ग्रेडिएंट, न्यूरल नेट, एपॉक। बहादुरों के लिए।', id:'Istilah AI lanjutan: gradien, jaringan saraf, epoch. Untuk yang berani.', pt:'Termos avançados de IA: gradiente, rede neural, época. Para os corajosos.', tr:'Gelişmiş YZ terimleri: gradyan, sinir ağı, epoch. Yürekli olanlar için.', vi:'Thuật ngữ AI nâng cao: gradient, mạng nơ-ron, epoch. Dành cho người dũng cảm.' },
    adult: { en:'Professional AI terms. For those who want to go deeper.', ru:'Профессиональные термины ИИ. Для тех кто хочет понять глубже.', de:'Professionelle KI-Begriffe. Für alle, die tiefer eintauchen möchten.', es:'Términos profesionales de IA. Para quienes quieren ir más a fondo.', fr:'Termes professionnels d\'IA. Pour ceux qui veulent aller plus loin.', hi:'पेशेवर AI शब्द। उन लोगों के लिए जो गहराई से समझना चाहते हैं।', id:'Istilah AI profesional. Untuk mereka yang ingin memahami lebih dalam.', pt:'Termos profissionais de IA. Para quem quer ir mais fundo.', tr:'Profesyonel YZ terimleri. Daha derine inmek isteyenler için.', vi:'Thuật ngữ AI chuyên nghiệp. Dành cho những ai muốn đi sâu hơn.' },
  };
  const duelDescs = {
    tiny:  { en:'Easy mode for ages 3–6: online safety with pictures.', ru:'Лёгкий режим для малышей 3–6 лет: безопасность в интернете с картинками.', de:'Einfacher Modus für 3–6 Jahre: Online-Sicherheit mit Bildern.', es:'Modo fácil para 3–6 años: seguridad en internet con imágenes.', fr:'Mode facile pour 3–6 ans : sécurité en ligne avec des images.', hi:'3–6 साल के लिए आसान मोड: तस्वीरों के साथ ऑनलाइन सुरक्षा।', id:'Mode mudah untuk usia 3–6: keamanan online dengan gambar.', pt:'Modo fácil para 3–6 anos: segurança online com imagens.', tr:'3–6 yaş için kolay mod: resimlerle çevrimiçi güvenlik.', vi:'Chế độ dễ cho 3–6 tuổi: an toàn trực tuyến với hình ảnh.' },
    child: { en:'Two robots battle with knowledge. AI & online safety. Timer included!', ru:'Два робота дерутся знаниями. Про ИИ и безопасность в сети. Есть таймер!', de:'Zwei Roboter kämpfen mit Wissen. KI & Online-Sicherheit. Mit Timer!', es:'¡Dos robots batallan con conocimiento. IA y seguridad online. ¡Con temporizador!', fr:'Deux robots s\'affrontent avec des connaissances. IA & sécurité en ligne. Avec minuteur !', hi:'दो रोबोट ज्ञान से लड़ते हैं। AI और ऑनलाइन सुरक्षा। टाइमर के साथ!', id:'Dua robot bertarung dengan pengetahuan. AI & keamanan online. Ada timer!', pt:'Dois robôs batalham com conhecimento. IA e segurança online. Com cronômetro!', tr:'İki robot bilgiyle savaşıyor. YZ ve çevrimiçi güvenlik. Sayaç dahil!', vi:'Hai robot đấu tranh bằng kiến thức. AI & an toàn trực tuyến. Có hẹn giờ!' },
    teen:  { en:'Hard questions on AI, phishing, neural nets. Who\'s smarter — you or the rival?', ru:'Сложные вопросы про ИИ, фишинг, нейросети. Кто умнее — ты или соперник?', de:'Schwere Fragen zu KI, Phishing, neuronalen Netzen. Wer ist klüger — du oder der Gegner?', es:'Preguntas difíciles sobre IA, phishing, redes neuronales. ¿Quién es más listo — tú o el rival?', fr:'Questions difficiles sur l\'IA, le phishing, les réseaux neuronaux. Qui est le plus intelligent ?', hi:'AI, फिशिंग, न्यूरल नेट पर कठिन सवाल। कौन स्मार्ट है — तुम या प्रतिद्वंद्वी?', id:'Pertanyaan sulit tentang AI, phishing, jaringan saraf. Siapa yang lebih pintar — kamu atau rival?', pt:'Perguntas difíceis sobre IA, phishing, redes neurais. Quem é mais esperto — você ou o rival?', tr:'YZ, kimlik avı, sinir ağları hakkında zor sorular. Daha akıllı kim — sen mi rakip mi?', vi:'Câu hỏi khó về AI, lừa đảo, mạng nơ-ron. Ai thông minh hơn — bạn hay đối thủ?' },
    adult: { en:'AI & safety knowledge battle. Earn your robot the full armor set!', ru:'Тест знаний по безопасности и ИИ. Заработай доспехи роботу!', de:'KI & Sicherheitswissen-Duell. Verdiene deinem Roboter das volle Rüstungsset!', es:'Batalla de conocimientos sobre IA y seguridad. ¡Gana la armadura completa para tu robot!', fr:'Bataille de connaissances sur l\'IA et la sécurité. Gagne l\'armure complète pour ton robot !', hi:'AI और सुरक्षा ज्ञान की लड़ाई। अपने रोबोट के लिए पूरा कवच जीतो!', id:'Pertarungan pengetahuan AI & keamanan. Dapatkan set armor lengkap untuk robotmu!', pt:'Batalha de conhecimento sobre IA e segurança. Ganhe a armadura completa para o seu robô!', tr:'YZ ve güvenlik bilgisi savaşı. Robotuna tam zırh setini kazan!', vi:'Trận chiến kiến thức AI & an toàn. Kiếm bộ giáp đầy đủ cho robot của bạn!' },
  };
  const snakeDesc = Object.fromEntries(Object.keys(snakeDescs).map(a => [a, snakeDescs[a][lang] || snakeDescs[a].en]));
  const duelDesc  = Object.fromEntries(Object.keys(duelDescs).map(a => [a, duelDescs[a][lang] || duelDescs[a].en]));

  const snEl = document.getElementById('snake-desc');
  const duEl = document.getElementById('duel-desc');
  const duGo = document.getElementById('duel-go');
  const btnSnake = document.getElementById('btn-start-snake');

  const GAME_BTN = { en:'Play Snake →', ru:'Играть в Змейку →', de:'Schlange spielen →', es:'Jugar Serpiente →', fr:'Jouer au Serpent →', hi:'साँप खेलो →', id:'Main Ular →', pt:'Jogar Cobra →', tr:'Yılan Oyna →', vi:'Chơi Rắn →' };
  const DUEL_BTN = { en:'Play Duel →', ru:'Играть в Дуэль →', de:'Duell spielen →', es:'Jugar Duelo →', fr:'Jouer au Duel →', hi:'दुएल खेलो →', id:'Main Duel →', pt:'Jogar Duelo →', tr:'Düello Oyna →', vi:'Chơi Đấu →' };

  if (snEl) snEl.textContent = snakeDesc[age] || snakeDesc.child;
  if (duEl) duEl.textContent = duelDesc[age] || duelDesc.child;
  if (duGo) { duGo.href = isRu ? 'duel/ru.html' : 'duel/'; duGo.textContent = DUEL_BTN[lang] || DUEL_BTN.en; }
  if (btnSnake) {
    btnSnake.textContent = GAME_BTN[lang] || GAME_BTN.en;
    btnSnake.removeEventListener('click', startGame);
    btnSnake.addEventListener('click', startGame);
  }
}

function startGame() {
  const cfg   = AGE_CFG[S.age] || AGE_CFG.child;
  S.game      = { idx: 0, score: 0, rounds: cfg.gameRounds, done: false };
  lsSave();
  show('game');
  scrollTo('game');
  const picker = document.getElementById('game-picker');
  if (picker) picker.style.display = 'none';

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

  renderDuelCta(container.parentElement);
}

// AI Duel is a bonus robot-battle game for ages 3-12 — surface it for
// tiny/child/teen, skip it for adult (14+), where it would feel out of place.
// Not routed through ui()/data files: duel/ only has en+ru content so far,
// and ui() falls back to the raw key name (not English text) when a key
// is missing from a language's data file.
const DUEL_CTA_STR = {
  en: { text: 'Want more? Battle robots with AI trivia in a bonus game.', btn: 'Play AI Duel →' },
  ru: { text: 'Хочешь ещё? Сразись роботами в викторине про ИИ — бонусная игра.', btn: 'Играть в AI-Дуэль →' },
  de: { text: 'Noch mehr? Kämpfe gegen Roboter mit KI-Trivia in einem Bonusspiel.', btn: 'KI-Duell spielen →' },
  es: { text: '¿Quieres más? Batalla con robots en un juego de trivia de IA.', btn: 'Jugar Duelo IA →' },
  fr: { text: 'Encore plus ? Affronte des robots en trivia IA dans un jeu bonus.', btn: 'Jouer au Duel IA →' },
  hi: { text: 'और चाहते हो? बोनस गेम में AI ट्रिविया के साथ रोबोट से लड़ो।', btn: 'AI दुएल खेलो →' },
  id: { text: 'Mau lebih? Bertarung dengan robot dalam trivia AI di game bonus.', btn: 'Main AI Duel →' },
  pt: { text: 'Quer mais? Batalhe com robôs em trivia de IA em um jogo bônus.', btn: 'Jogar Duelo IA →' },
  tr: { text: 'Daha fazlasını ister misin? Bonus oyunda robotlara karşı YZ bilgi yarışması yap.', btn: 'YZ Düellosu Oyna →' },
  vi: { text: 'Muốn thêm không? Chiến đấu với robot bằng câu đố AI trong trò chơi thưởng.', btn: 'Chơi Đấu AI →' },
};
function renderDuelCta(sectionEl) {
  if (!sectionEl) return;
  const existing = $('duel-cta');
  if (existing) existing.remove();
  if (S.age === 'adult') return;

  const href = S.lang === 'ru' ? 'duel/ru.html' : 'duel/';
  const str  = DUEL_CTA_STR[S.lang] || DUEL_CTA_STR.en;
  const cta = document.createElement('div');
  cta.id = 'duel-cta';
  cta.className = 'card accent2';
  cta.style.cssText = 'margin-top:20px;padding:20px;text-align:center;';
  cta.innerHTML = `
    <p class="step-text">🥊 ${str.text}</p>
    <div class="action-row" style="justify-content:center;margin-top:12px;">
      <a class="btn-outline" href="${href}">${str.btn}</a>
    </div>
  `;
  sectionEl.appendChild(cta);
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
