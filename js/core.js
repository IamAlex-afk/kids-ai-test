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

  setTimeout(() => startLessons(), 500);
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
  if (cnt) cnt.textContent = `Lesson ${idx + 1} / ${lessons.length}`;
  const ph = $('lesson-phase-label');
  if (ph) ph.textContent = 'Lesson';

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
          ${lesson.source ? `<p class="step-text mt-sm"><a href="${lesson.sourceUrl || '#'}" target="_blank" rel="noopener" class="text-accent">📚 ${lesson.source}</a></p>` : ''}
        </div>
      </div>
    </div>
    <div class="action-row">
      <button class="btn-primary" id="btn-next-lesson">
        ${hasTest ? '🧪 Quick Check →' : idx === lessons.length - 1 ? '🎮 Ready for the Game!' : 'Got it! Next →'}
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
  if (ph) ph.textContent = 'Quick Check';

  const container = $('lesson-content');
  if (!container) return;

  container.innerHTML = `
    <div class="quiz-wrap anim-fade-up">
      <div class="quiz-progress">
        <div class="quiz-prog-top">
          <span class="quiz-prog-label">Quick Check ${qIdx + 1}/${qs.length}</span>
        </div>
      </div>
      <div class="q-wrap">
        <span class="q-badge">CHECK</span>
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
    fb.innerHTML = `${correct ? '✅' : '❌'} ${q.explanation || (correct ? 'Correct!' : 'Not quite.')}`;
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
      <h3 class="step-title">Lessons Complete!</h3>
      <p class="step-text">You know how AI really works. Now let's see if you can SPOT it!</p>
      <div class="action-row" style="justify-content:center;margin-top:20px;">
        <button class="btn-primary" id="btn-go-game">Play Human vs AI →</button>
      </div>
    </div>
  `;
  $('btn-go-game').addEventListener('click', startGame);
}

/* ─────────────────────────────────────────────
   GAME ENGINE
───────────────────────────────────────────── */
function startGame() {
  const cfg   = AGE_CFG[S.age] || AGE_CFG.child;
  S.game      = { idx: 0, score: 0, rounds: cfg.gameRounds, done: false };
  lsSave();
  show('game');
  scrollTo('game');
  renderGameRound();
}

function renderGameRound() {
  const data   = ageData();
  const rounds = data?.game || [];
  const idx    = S.game.idx;

  if (idx >= S.game.rounds || !rounds[idx]) { onGameDone(); return; }

  const round = rounds[idx];

  const container = $('game-content');
  if (!container) return;

  container.innerHTML = `
    <div class="game-score-row">
      <div class="game-score-box">
        <span class="game-score-num">${S.game.score}</span>
        <span class="game-score-lbl">CORRECT</span>
      </div>
      <div class="game-round-info">Round ${idx + 1} / ${S.game.rounds}</div>
      <div class="game-score-box">
        <span class="game-score-num">${idx - S.game.score}</span>
        <span class="game-score-lbl">WRONG</span>
      </div>
    </div>

    <div class="game-text-card anim-fade-in">
      ${round.text}
    </div>

    <div class="game-buttons">
      <button class="game-btn game-btn-human" id="btn-human">
        👤 Human
      </button>
      <button class="game-btn game-btn-ai" id="btn-ai">
        🤖 AI
      </button>
    </div>

    <div class="game-verdict" id="game-verdict"></div>
  `;

  $('btn-human').addEventListener('click', () => answerGame(true, round));
  $('btn-ai').addEventListener('click',    () => answerGame(false, round));
}

function answerGame(guessedHuman, round) {
  const correct = guessedHuman === round.isHuman;

  $('btn-human').disabled = true;
  $('btn-ai').disabled    = true;

  if (correct) S.game.score++;

  const verdict = $('game-verdict');
  if (verdict) {
    verdict.classList.add(correct ? 'correct' : 'wrong');
    verdict.innerHTML = `
      ${correct ? '✅' : '❌'}
      <strong>${round.isHuman ? '👤 This was written by a HUMAN' : '🤖 This was written by AI'}</strong><br>
      <span style="font-size:.85rem;font-weight:400;">${round.explanation}</span>
      ${round.source ? `<br><a href="${round.sourceUrl || '#'}" target="_blank" rel="noopener" style="font-size:.8rem;opacity:.7">📚 ${round.source}</a>` : ''}
    `;
  }

  S.game.idx++;
  lsSave();

  setTimeout(() => renderGameRound(), 2200);
}

function onGameDone() {
  S.game.done = true;
  lsSave();

  const pct = Math.round((S.game.score / S.game.rounds) * 100);
  const msg = pct >= 80 ? '🏆 Excellent! You can spot AI almost every time!'
            : pct >= 50 ? '👍 Good work! You\'re getting better at spotting patterns.'
            : '🧠 AI is tricky! That\'s exactly why learning about it matters.';

  const container = $('game-content');
  if (!container) return;

  container.innerHTML = `
    <div class="card green anim-scale-in" style="text-align:center;padding:28px;">
      <div class="game-score-box" style="display:inline-block;margin-bottom:16px;">
        <span class="game-score-num">${S.game.score}/${S.game.rounds}</span>
        <span class="game-score-lbl">SCORE</span>
      </div>
      <p class="step-text">${msg}</p>
      <div class="action-row" style="justify-content:center;margin-top:20px;">
        <button class="btn-primary" id="btn-go-quiz">Final Quiz →</button>
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
          <span class="ans-word">YES</span>
        </button>
        <button class="ans-tiny" data-v="0">
          <span class="ans-big">👎</span>
          <span class="ans-word">NO</span>
        </button>
      </div>`;
  } else if (q.type === 'likert') {
    const scaleLabels = ['Strongly<br>Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly<br>Agree'];
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
        <span class="quiz-prog-label">Question ${idx + 1} / ${qs.length}</span>
        <span class="quiz-prog-score">Score: ${S.quiz.score}</span>
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
    fb.innerHTML = `${correct ? '✅' : '💡'} ${q.explanation}
      ${q.source ? `<br><a href="${q.sourceUrl || '#'}" target="_blank" rel="noopener" class="text-accent" style="font-size:.8rem">📚 ${q.source}</a>` : ''}`;
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
  const ranks   = ['AI Curious', 'AI Aware', 'AI Literate'];

  const container = $('result-summary');
  if (!container) return;

  container.innerHTML = `
    <div class="result-hero anim-fade-up">
      <span class="result-emoji">${medals[S.result.tier]}</span>
      <p class="result-rank">${ranks[S.result.tier] || ''}</p>
      <h2 class="result-title">${tier.title || 'You completed the test!'}</h2>
      <div class="result-score">Score: ${S.result.score}%</div>
      <p class="result-desc">${tier.description || ''}</p>

      <div class="axes-grid" style="margin-top:20px;text-align:left;">
        <div class="axis-row">
          <div class="axis-top">
            <span class="axis-name">🎮 Game (Human vs AI)</span>
            <span class="axis-pct">${S.game.score}/${S.game.rounds}</span>
          </div>
          <div class="axis-bar">
            <div class="axis-fill" style="width:${Math.round(S.game.score/S.game.rounds*100)}%"></div>
          </div>
        </div>
        <div class="axis-row">
          <div class="axis-top">
            <span class="axis-name">🧠 Final Quiz</span>
            <span class="axis-pct">${S.result.score}%</span>
          </div>
          <div class="axis-bar">
            <div class="axis-fill" style="width:${S.result.score}%"></div>
          </div>
        </div>
      </div>

      <div class="action-row" style="margin-top:24px;">
        <button class="btn-primary" id="btn-get-card">🃏 Generate My Card</button>
        <button class="btn-outline" id="btn-see-protocols">📋 What to Do Now</button>
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
  if (logBtn) { logBtn.textContent = '✓ Logged!'; logBtn.disabled = true; }
}

function renderTracker() {
  const chart = $('tracker-chart');
  if (!chart) return;

  const days  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
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
