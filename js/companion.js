'use strict';

/* ═══════════════════════════════════════════════════════════════════
   KAT COMPANION — "train your own AI" pet.

   Growth model: the pet's LEVEL is simply the count of distinct real
   things the child has done — a game round/world cleared for the first
   time, a quiz question answered correctly, a lesson article read —
   each counted ONCE ever (answering the same question right again, or
   re-clearing a world you already cleared, adds nothing further). This
   is deliberately literal per spec: "1 correct answer = +1 level,
   can't take the point twice for the same question."

   Growth still happens two ways: passively (hooks in the 3 games) and
   actively (this module's own training screen, where the child reads
   articles or answers questions on purpose — "teaching their model").
   No fail state, ever — a wrong answer just shows the right one.

   API (global, callable from any module regardless of load order —
   always guard with `window.KAT_Companion?.`):
     window.KAT_Companion.recordAccomplishment(key, lang)  -> {leveledUp,...}
     window.KAT_Companion.render(container, lang)
     window.KAT_Companion.setContent(quizArray, lessonsArray)
═══════════════════════════════════════════════════════════════════ */

(function () {
  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (_) { return fallback; }
  }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} }

  const LS_KEY = 'kat_companion_v2';
  function loadState() { return readJSON(LS_KEY, { done: [], notifiedStage: 0 }); }
  function saveState(s) { writeJSON(LS_KEY, s); }
  function doneSet() { return new Set(loadState().done); }

  const STAGES = [
    { icon: '💫', color: '#93c5fd' },
    { icon: '🔌', color: '#22d3ee' },
    { icon: '🧩', color: '#34d399' },
    { icon: '🧠', color: '#a78bfa' },
    { icon: '⭐', color: '#fbbf24' },
  ];
  const STR = {
    en: { title: 'Your AI', names: ['Spark', 'Circuit', 'Processor', 'Neural Net', 'Superintelligence'], level: 'level', learned: 'things learned', next: 'to next level', maxed: 'Fully grown!', grew: 'grew up!', train: 'Train', ask: 'Answer a question', read: 'Read an article', yes: 'Yes', no: 'No', correct: 'It learned that!', wrong: 'Not quite — now it knows the right answer.', already: 'It already knows this one.', again: 'Another', skip: 'Skip', back: '← Back', gotIt: 'Got it!', done: 'Done', noQuiz: 'No questions for this age yet.', noLessons: 'No articles for this age yet.', pickQuestion: 'Pick a question', pickArticle: 'Pick an article', menu: '← Menu' },
    ru: { title: 'Твой ИИ', names: ['Искра', 'Схема', 'Процессор', 'Нейросеть', 'Суперинтеллект'], level: 'уровень', learned: 'выучено', next: 'до уровня', maxed: 'Полностью вырос!', grew: 'вырос!', train: 'Обучить', ask: 'Ответить на вопрос', read: 'Прочитать статью', yes: 'Да', no: 'Нет', correct: 'Он это выучил!', wrong: 'Не совсем — зато теперь знает правильный ответ.', already: 'Он уже это знает.', again: 'Ещё', skip: 'Пропустить', back: '← Назад', gotIt: 'Понял!', done: 'Готово', noQuiz: 'Для этого возраста пока нет вопросов.', noLessons: 'Для этого возраста пока нет статей.', pickQuestion: 'Выбери вопрос', pickArticle: 'Выбери статью', menu: '← Меню' },
    de: { title: 'Deine KI', names: ['Funke', 'Schaltkreis', 'Prozessor', 'Neuronales Netz', 'Superintelligenz'], level: 'Level', learned: 'Gelerntes', next: 'bis zum nächsten Level', maxed: 'Voll ausgewachsen!', grew: 'ist gewachsen!', train: 'Trainieren', ask: 'Frage beantworten', read: 'Artikel lesen', yes: 'Ja', no: 'Nein', correct: 'Das hat es gelernt!', wrong: 'Nicht ganz — jetzt kennt es die richtige Antwort.', already: 'Das weiß es schon.', again: 'Noch eine', skip: 'Überspringen', back: '← Zurück', gotIt: 'Verstanden!', done: 'Fertig', noQuiz: 'Für dieses Alter gibt es noch keine Fragen.', noLessons: 'Für dieses Alter gibt es noch keine Artikel.', pickQuestion: 'Frage auswählen', pickArticle: 'Artikel auswählen', menu: '← Menü' },
    es: { title: 'Tu IA', names: ['Chispa', 'Circuito', 'Procesador', 'Red Neuronal', 'Superinteligencia'], level: 'nivel', learned: 'cosas aprendidas', next: 'para el siguiente nivel', maxed: '¡Completamente crecido!', grew: '¡creció!', train: 'Entrenar', ask: 'Responder una pregunta', read: 'Leer un artículo', yes: 'Sí', no: 'No', correct: '¡Lo aprendió!', wrong: 'No exactamente — ahora ya sabe la respuesta correcta.', already: 'Ya sabe esto.', again: 'Otra', skip: 'Saltar', back: '← Atrás', gotIt: '¡Entendido!', done: 'Hecho', noQuiz: 'Todavía no hay preguntas para esta edad.', noLessons: 'Todavía no hay artículos para esta edad.', pickQuestion: 'Elige una pregunta', pickArticle: 'Elige un artículo', menu: '← Menú' },
    fr: { title: 'Ton IA', names: ['Étincelle', 'Circuit', 'Processeur', 'Réseau de Neurones', 'Superintelligence'], level: 'niveau', learned: 'choses apprises', next: 'avant le niveau suivant', maxed: 'Complètement développé !', grew: 'a grandi !', train: 'Entraîner', ask: 'Répondre à une question', read: 'Lire un article', yes: 'Oui', no: 'Non', correct: 'Il a appris ça !', wrong: 'Pas tout à fait — il connaît maintenant la bonne réponse.', already: 'Il le sait déjà.', again: 'Encore', skip: 'Passer', back: '← Retour', gotIt: 'Compris !', done: 'Terminé', noQuiz: 'Pas encore de questions pour cet âge.', noLessons: "Pas encore d'articles pour cet âge.", pickQuestion: 'Choisis une question', pickArticle: 'Choisis un article', menu: '← Menu' },
    hi: { title: 'आपका AI', names: ['स्पार्क', 'सर्किट', 'प्रोसेसर', 'न्यूरल नेट', 'सुपरइंटेलिजेंस'], level: 'लेवल', learned: 'सीखी गई चीज़ें', next: 'अगले लेवल तक', maxed: 'पूरी तरह बड़ा हो गया!', grew: 'बड़ा हुआ!', train: 'ट्रेन करें', ask: 'सवाल का जवाब दें', read: 'आर्टिकल पढ़ें', yes: 'हां', no: 'नहीं', correct: 'इसने यह सीख लिया!', wrong: 'बिल्कुल नहीं — अब इसे सही जवाब पता है।', already: 'इसे यह पहले से पता है।', again: 'एक और', skip: 'स्किप करें', back: '← वापस', gotIt: 'समझ गया!', done: 'हो गया', noQuiz: 'इस उम्र के लिए अभी कोई सवाल नहीं हैं।', noLessons: 'इस उम्र के लिए अभी कोई आर्टिकल नहीं हैं।', pickQuestion: 'एक सवाल चुनें', pickArticle: 'एक आर्टिकल चुनें', menu: '← मेनू' },
    id: { title: 'AI Kamu', names: ['Spark', 'Sirkuit', 'Prosesor', 'Jaringan Saraf', 'Superintelijensi'], level: 'level', learned: 'hal yang dipelajari', next: 'menuju level berikutnya', maxed: 'Sudah tumbuh penuh!', grew: 'tumbuh!', train: 'Latih', ask: 'Jawab pertanyaan', read: 'Baca artikel', yes: 'Ya', no: 'Tidak', correct: 'Dia mempelajarinya!', wrong: 'Belum tepat — sekarang dia tahu jawaban yang benar.', already: 'Dia sudah tahu ini.', again: 'Lagi', skip: 'Lewati', back: '← Kembali', gotIt: 'Mengerti!', done: 'Selesai', noQuiz: 'Belum ada pertanyaan untuk usia ini.', noLessons: 'Belum ada artikel untuk usia ini.', pickQuestion: 'Pilih pertanyaan', pickArticle: 'Pilih artikel', menu: '← Menu' },
    it: { title: 'La tua IA', names: ['Scintilla', 'Circuito', 'Processore', 'Rete Neurale', 'Superintelligenza'], level: 'livello', learned: 'cose imparate', next: 'al prossimo livello', maxed: 'Completamente cresciuto!', grew: 'è cresciuto!', train: 'Allena', ask: 'Rispondi a una domanda', read: 'Leggi un articolo', yes: 'Sì', no: 'No', correct: 'Lo ha imparato!', wrong: 'Non proprio — ora conosce la risposta giusta.', already: 'Lo sa già.', again: 'Ancora', skip: 'Salta', back: '← Indietro', gotIt: 'Capito!', done: 'Fatto', noQuiz: 'Ancora nessuna domanda per questa età.', noLessons: 'Ancora nessun articolo per questa età.', pickQuestion: 'Scegli una domanda', pickArticle: 'Scegli un articolo', menu: '← Menu' },
    pt: { title: 'Sua IA', names: ['Faísca', 'Circuito', 'Processador', 'Rede Neural', 'Superinteligência'], level: 'nível', learned: 'coisas aprendidas', next: 'para o próximo nível', maxed: 'Totalmente crescido!', grew: 'cresceu!', train: 'Treinar', ask: 'Responder uma pergunta', read: 'Ler um artigo', yes: 'Sim', no: 'Não', correct: 'Ele aprendeu isso!', wrong: 'Quase — agora ele sabe a resposta certa.', already: 'Ele já sabe isso.', again: 'De novo', skip: 'Pular', back: '← Voltar', gotIt: 'Entendi!', done: 'Pronto', noQuiz: 'Ainda não há perguntas para essa idade.', noLessons: 'Ainda não há artigos para essa idade.', pickQuestion: 'Escolha uma pergunta', pickArticle: 'Escolha um artigo', menu: '← Menu' },
    tr: { title: 'Senin Yapay Zekân', names: ['Kıvılcım', 'Devre', 'İşlemci', 'Sinir Ağı', 'Süper Zeka'], level: 'seviye', learned: 'öğrenilen şeyler', next: 'sonraki seviyeye', maxed: 'Tamamen büyüdü!', grew: 'büyüdü!', train: 'Eğit', ask: 'Bir soruyu cevapla', read: 'Bir makale oku', yes: 'Evet', no: 'Hayır', correct: 'Bunu öğrendi!', wrong: 'Tam değil — ama artık doğru cevabı biliyor.', already: 'Bunu zaten biliyor.', again: 'Bir tane daha', skip: 'Geç', back: '← Geri', gotIt: 'Anladım!', done: 'Bitti', noQuiz: 'Bu yaş için henüz soru yok.', noLessons: 'Bu yaş için henüz makale yok.', pickQuestion: 'Bir soru seç', pickArticle: 'Bir makale seç', menu: '← Menü' },
    vi: { title: 'AI của bạn', names: ['Tia Lửa', 'Mạch Điện', 'Bộ Xử Lý', 'Mạng Nơ-ron', 'Siêu Trí Tuệ'], level: 'cấp độ', learned: 'điều đã học', next: 'đến cấp tiếp theo', maxed: 'Đã trưởng thành hoàn toàn!', grew: 'đã lớn lên!', train: 'Huấn luyện', ask: 'Trả lời câu hỏi', read: 'Đọc bài viết', yes: 'Có', no: 'Không', correct: 'Nó đã học được điều đó!', wrong: 'Chưa đúng — giờ nó đã biết câu trả lời đúng.', already: 'Nó đã biết điều này rồi.', again: 'Cái khác', skip: 'Bỏ qua', back: '← Quay lại', gotIt: 'Hiểu rồi!', done: 'Xong', noQuiz: 'Chưa có câu hỏi cho độ tuổi này.', noLessons: 'Chưa có bài viết cho độ tuổi này.', pickQuestion: 'Chọn một câu hỏi', pickArticle: 'Chọn một bài viết', menu: '← Menu' },
  };
  function t(lang, key) { const d = STR[lang] || STR.en; return d[key]; }

  function stageIndex(doneCount) { return Math.max(0, Math.min(STAGES.length - 1, doneCount)); }

  let quizPool = [];
  let lessonPool = [];
  function setContent(quiz, lessons) {
    quizPool = Array.isArray(quiz) ? quiz.filter(q => q.type === 'yesno') : [];
    lessonPool = Array.isArray(lessons) ? lessons.slice() : [];
  }

  // Records ONE accomplishment by a stable key (a question's text, a
  // lesson's title, a "game_age_world" id, ...). Returns whether it was
  // new (and thus whether the level actually moved).
  function recordAccomplishment(key, lang) {
    if (!key) return { isNew: false, level: stageIndex(loadState().done.length), leveledUp: false };
    const s = loadState();
    const already = s.done.includes(key);
    if (!already) s.done.push(key);
    const level = stageIndex(s.done.length);
    const leveledUp = !already && level > s.notifiedStage;
    if (leveledUp) s.notifiedStage = level;
    saveState(s);
    if (leveledUp) pingLevelUp(level, lang);
    refreshAllWidgets();
    return { isNew: !already, level, leveledUp };
  }

  const widgets = new Set();
  function refreshAllWidgets() { widgets.forEach(w => { try { w.refresh(); } catch (_) {} }); }

  let levelUpToastEl = null;
  function pingLevelUp(stage, lang) {
    if (!document.body) return;
    if (!levelUpToastEl) {
      levelUpToastEl = document.createElement('div');
      levelUpToastEl.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99999;background:#0d1117;border:1px solid #22d3ee;border-radius:10px;padding:10px 16px;color:#e2e8f0;font:700 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4);transition:opacity .3s;pointer-events:none;';
      document.body.appendChild(levelUpToastEl);
    }
    const names = t(lang, 'names');
    levelUpToastEl.textContent = `${STAGES[stage].icon} ${names[stage] || names[names.length - 1]} ${t(lang, 'grew')}`;
    levelUpToastEl.style.opacity = '1'; levelUpToastEl.style.display = 'block';
    clearTimeout(pingLevelUp._t);
    pingLevelUp._t = setTimeout(() => { if (levelUpToastEl) levelUpToastEl.style.opacity = '0'; }, 2600);
  }

  /* ─── RENDERER (unchanged visual language from the previous pass) ──── */
  function shadeColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }
  function bodyPath(ctx, r, rough) {
    ctx.beginPath();
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const wobble = rough ? 1 + Math.sin(a * 3) * 0.08 + Math.cos(a * 5) * 0.05 : 1;
      const px = Math.cos(a) * r * wobble, py = Math.sin(a) * r * wobble;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawCreature(ctx, cx, cy, stage, now, poked) {
    const color = STAGES[stage].color;
    const bob = Math.sin(now * 0.003) * 3;
    const y = cy + bob - (poked ? 6 : 0);
    ctx.save();
    ctx.translate(cx, y);

    const shGrad = ctx.createRadialGradient(0, 30 - bob, 0, 0, 30 - bob, 20);
    shGrad.addColorStop(0, 'rgba(0,0,0,0.35)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shGrad;
    ctx.beginPath(); ctx.ellipse(0, 30 - bob, 18, 6, 0, 0, Math.PI * 2); ctx.fill();

    ctx.shadowColor = color; ctx.shadowBlur = 10 + stage * 3;

    const r = 15 + stage * 3;
    const rough = stage < 2;
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r);
    if (stage === 0) {
      bodyGrad.addColorStop(0, shadeColor(color, 12));
      bodyGrad.addColorStop(1, shadeColor(color, -12));
    } else {
      bodyGrad.addColorStop(0, shadeColor(color, 38));
      bodyGrad.addColorStop(0.55, color);
      bodyGrad.addColorStop(1, shadeColor(color, -32));
    }
    ctx.fillStyle = bodyGrad; ctx.strokeStyle = shadeColor(color, -15); ctx.lineWidth = 2;
    bodyPath(ctx, r, rough);
    ctx.fill(); ctx.stroke();

    if (stage >= 1) {
      ctx.strokeStyle = shadeColor(color, -10); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 8); ctx.stroke();
      ctx.fillStyle = '#ffe066'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, -r - 9, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 10 + stage * 3;
    }
    if (stage >= 2) {
      ctx.strokeStyle = shadeColor(color, -10); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r + 2, 2); ctx.lineTo(-r - 6, 8 + bob * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r - 2, 2); ctx.lineTo(r + 6, 8 - bob * 0.3); ctx.stroke();
    }
    if (stage >= 3) {
      ctx.strokeStyle = `${shadeColor(color, -10)}99`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0.3, Math.PI - 0.3); ctx.stroke();
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.006);
      ctx.globalAlpha = pulse; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(0, 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (stage >= STAGES.length - 1) {
      for (let i = 0; i < 4; i++) {
        const a = now * 0.0015 + (i * Math.PI * 2) / 4;
        const px = Math.cos(a) * (r + 14), py = Math.sin(a) * (r + 14);
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(now * 0.004 + i);
        ctx.fillStyle = '#ffe066'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = `${color}55`; ctx.lineWidth = 1.5; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.shadowBlur = stage >= 1 ? 6 : 0; ctx.shadowColor = '#00ffff'; ctx.fillStyle = '#00ffff';
    const eyeGap = r * 0.35;
    const eyeR = stage === 0 ? 1.4 : 2;
    ctx.beginPath(); ctx.arc(-eyeGap, -2, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eyeGap, -2, eyeR, 0, Math.PI * 2); ctx.fill();

    if (stage >= 1) {
      const hl = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0, -r * 0.35, -r * 0.4, r * 0.5);
      hl.addColorStop(0, 'rgba(255,255,255,0.4)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.4, r * 0.55, -0.3, 0, Math.PI * 2); ctx.fill();
      if (stage >= STAGES.length - 1) {
        const hl2 = ctx.createRadialGradient(r * 0.3, r * 0.1, 0, r * 0.3, r * 0.1, r * 0.25);
        hl2.addColorStop(0, 'rgba(255,255,255,0.3)'); hl2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hl2;
        ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.1, r * 0.2, r * 0.28, 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    ctx.restore();
  }

  /* ─── HUB WIDGET ─────────────────────────────────────────────────── */
  function render(container, lang) {
    lang = lang || 'en';
    let raf = null, poked = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kat-companion';
    wrap.innerHTML = `
      <canvas class="kat-companion-canvas" width="90" height="90"></canvas>
      <div class="kat-companion-info">
        <div class="kat-companion-label">${t(lang, 'title')}</div>
        <div class="kat-companion-title" id="kc-title"></div>
        <div class="kat-companion-bar"><div class="kat-companion-fill" id="kc-fill"></div></div>
        <div class="kat-companion-sub" id="kc-sub"></div>
      </div>
      <button class="kat-companion-train-btn" id="kc-train-btn">${t(lang, 'train')} →</button>`;
    container.innerHTML = '';
    container.appendChild(wrap);

    const canvas = wrap.querySelector('.kat-companion-canvas');
    const ctx = canvas.getContext('2d');
    const titleEl = wrap.querySelector('#kc-title');
    const fillEl = wrap.querySelector('#kc-fill');
    const subEl = wrap.querySelector('#kc-sub');

    const openTraining = () => openTrainingScreen(lang);
    canvas.addEventListener('pointerdown', () => { poked = Date.now(); openTraining(); });
    wrap.querySelector('#kc-train-btn').addEventListener('click', openTraining);

    function updateText() {
      const s = loadState();
      const stage = stageIndex(s.done.length);
      const names = t(lang, 'names');
      titleEl.textContent = `${STAGES[stage].icon} ${names[stage] || names[names.length - 1]}`;
      const nextNeed = stage + 1;
      if (stage < STAGES.length - 1) {
        const pct = Math.round((s.done.length / nextNeed) * 100);
        fillEl.style.width = Math.max(4, Math.min(100, pct)) + '%';
        subEl.textContent = `${t(lang,'level')} ${stage} · ${s.done.length} ${t(lang, 'learned')}`;
      } else {
        fillEl.style.width = '100%';
        subEl.textContent = `${s.done.length} ${t(lang, 'learned')} · ${t(lang, 'maxed')}`;
      }
    }

    function frame() {
      const now = Date.now();
      ctx.clearRect(0, 0, 90, 90);
      const s = loadState();
      drawCreature(ctx, 45, 48, stageIndex(s.done.length), now, now - poked < 200);
      raf = requestAnimationFrame(frame);
    }

    updateText();
    raf = requestAnimationFrame(frame);

    const handle = {
      refresh: updateText,
      destroy() { if (raf) cancelAnimationFrame(raf); widgets.delete(handle); },
    };
    widgets.add(handle);
    return handle;
  }

  /* ─── FULL TRAINING SCREEN ──────────────────────────────────────────── */
  function openTrainingScreen(lang) {
    if (document.getElementById('kat-companion-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'kat-companion-overlay';
    overlay.className = 'kat-companion-overlay';
    document.body.appendChild(overlay);

    let raf = null;
    let history = []; // stack of {type:'question'|'article', item} for Back
    let growPulse = 0;

    function close() { if (raf) cancelAnimationFrame(raf); overlay.remove(); }

    function mountCanvas() {
      if (raf) cancelAnimationFrame(raf);
      const canvas = overlay.querySelector('.kat-companion-big-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      function frame() {
        const now = Date.now();
        ctx.clearRect(0, 0, 180, 180);
        const s = loadState();
        drawCreature(ctx, 90, 100, stageIndex(s.done.length), now, now - growPulse < 500);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }

    function header() {
      const s = loadState();
      const stage = stageIndex(s.done.length);
      const names = t(lang, 'names');
      return `
        <button class="pf-icon-btn kat-companion-close" id="kc-close">✕</button>
        <canvas class="kat-companion-big-canvas" width="180" height="180"></canvas>
        <div class="kat-companion-title" style="font-size:1.1rem;text-align:center;">${STAGES[stage].icon} ${names[stage] || names[names.length - 1]} · ${t(lang,'level')} ${stage}</div>
        <div class="kat-companion-sub" style="text-align:center;margin-bottom:12px;">${s.done.length} ${t(lang,'learned')}</div>`;
    }

    function renderMenu() {
      const done = doneSet();
      overlay.innerHTML = `<div class="kat-companion-modal">${header()}
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${quizPool.length ? `<button class="btn-primary" id="kc-go-questions">🎓 ${t(lang,'ask')} (${quizPool.filter(q => !done.has('q_' + q.q)).length}/${quizPool.length})</button>` : `<p class="snake-overlay-fact">${t(lang,'noQuiz')}</p>`}
          ${lessonPool.length ? `<button class="btn-primary" id="kc-go-articles" style="background:var(--card2)">📖 ${t(lang,'read')} (${lessonPool.filter(l => !done.has('a_' + l.title)).length}/${lessonPool.length})</button>` : `<p class="snake-overlay-fact">${t(lang,'noLessons')}</p>`}
        </div></div>`;
      overlay.querySelector('#kc-close').addEventListener('click', close);
      const qBtn = overlay.querySelector('#kc-go-questions');
      if (qBtn) qBtn.addEventListener('click', () => renderQuestionList());
      const aBtn = overlay.querySelector('#kc-go-articles');
      if (aBtn) aBtn.addEventListener('click', () => renderArticleList());
      mountCanvas();
    }

    function renderQuestionList() {
      const done = doneSet();
      overlay.innerHTML = `<div class="kat-companion-modal">${header()}
        <button class="pf-icon-btn" id="kc-menu" style="margin-bottom:8px;">${t(lang,'menu')}</button>
        <p class="kat-companion-label" style="text-align:left;">${t(lang,'pickQuestion')}</p>
        <div class="kat-companion-list" id="kc-list"></div>
      </div>`;
      overlay.querySelector('#kc-close').addEventListener('click', close);
      overlay.querySelector('#kc-menu').addEventListener('click', renderMenu);
      const list = overlay.querySelector('#kc-list');
      quizPool.forEach((q) => {
        const known = done.has('q_' + q.q);
        const row = document.createElement('button');
        row.className = 'kat-companion-list-item' + (known ? ' known' : '');
        row.innerHTML = `<span>${known ? '✅' : '❓'} ${q.q}</span>`;
        row.addEventListener('click', () => { history.push({ type: 'question', item: q }); renderQuestion(q); });
        list.appendChild(row);
      });
      mountCanvas();
    }

    function renderArticleList() {
      const done = doneSet();
      overlay.innerHTML = `<div class="kat-companion-modal">${header()}
        <button class="pf-icon-btn" id="kc-menu" style="margin-bottom:8px;">${t(lang,'menu')}</button>
        <p class="kat-companion-label" style="text-align:left;">${t(lang,'pickArticle')}</p>
        <div class="kat-companion-list" id="kc-list"></div>
      </div>`;
      overlay.querySelector('#kc-close').addEventListener('click', close);
      overlay.querySelector('#kc-menu').addEventListener('click', renderMenu);
      const list = overlay.querySelector('#kc-list');
      lessonPool.forEach((l) => {
        const known = done.has('a_' + l.title);
        const row = document.createElement('button');
        row.className = 'kat-companion-list-item' + (known ? ' known' : '');
        row.innerHTML = `<span>${known ? '✅' : '📄'} ${l.icon || ''} ${l.title}</span>`;
        row.addEventListener('click', () => { history.push({ type: 'article', item: l }); renderArticle(l); });
        list.appendChild(row);
      });
      mountCanvas();
    }

    function backOrMenu() {
      history.pop(); // drop current
      const prev = history.pop();
      if (!prev) { renderMenu(); return; }
      history.push(prev);
      if (prev.type === 'question') renderQuestion(prev.item); else renderArticle(prev.item);
    }

    function renderQuestion(q) {
      const alreadyKnown = doneSet().has('q_' + q.q);
      overlay.innerHTML = `<div class="kat-companion-modal">${header()}
        <p class="pf-lesson-text" style="font-weight:700;">${q.q}</p>
        ${alreadyKnown ? `<p class="snake-overlay-fact" style="color:var(--muted2)">✅ ${t(lang,'already')}</p>` : ''}
        <div class="action-row" style="justify-content:center;gap:10px;">
          <button class="btn-primary" id="kc-yes">👍 ${t(lang,'yes')}</button>
          <button class="btn-primary" id="kc-no" style="background:var(--card2)">👎 ${t(lang,'no')}</button>
        </div>
        <div class="action-row" style="justify-content:center;gap:8px;margin-top:8px;">
          <button class="pf-icon-btn" id="kc-back">${t(lang,'back')}</button>
          <button class="pf-icon-btn" id="kc-skip">${t(lang,'skip')} →</button>
        </div>
      </div>`;
      overlay.querySelector('#kc-close').addEventListener('click', close);
      overlay.querySelector('#kc-back').addEventListener('click', backOrMenu);
      overlay.querySelector('#kc-skip').addEventListener('click', () => {
        const idx = quizPool.indexOf(q);
        const next = quizPool[(idx + 1) % quizPool.length] || q;
        history.push({ type: 'question', item: next });
        renderQuestion(next);
      });
      mountCanvas();

      const answer = (val) => {
        const correct = val === q.correct;
        const result = correct ? recordAccomplishment('q_' + q.q, lang) : { isNew: false };
        if (correct && result.isNew) growPulse = Date.now();
        overlay.innerHTML = `<div class="kat-companion-modal">${header()}
          <p class="snake-overlay-kicker" style="text-align:center;color:${correct ? 'var(--green)' : 'var(--muted2)'}">${correct ? (result.isNew ? '✅' : '✅ (' + t(lang,'already') + ')') : '💡'}</p>
          <p class="snake-overlay-fact" style="text-align:center;">${correct ? t(lang,'correct') : t(lang,'wrong')}</p>
          ${!correct ? `<p class="snake-overlay-fact" style="text-align:center;">${q.explanation || ''}</p>` : ''}
          <div class="action-row" style="justify-content:center;gap:10px;">
            <button class="btn-primary" id="kc-list-btn">${t(lang,'pickQuestion')}</button>
            <button class="btn-primary" id="kc-done" style="background:var(--card2)">${t(lang,'done')}</button>
          </div>
        </div>`;
        overlay.querySelector('#kc-close').addEventListener('click', close);
        overlay.querySelector('#kc-list-btn').addEventListener('click', renderQuestionList);
        overlay.querySelector('#kc-done').addEventListener('click', renderMenu);
        mountCanvas();
      };
      overlay.querySelector('#kc-yes').addEventListener('click', () => answer(1), { once: true });
      overlay.querySelector('#kc-no').addEventListener('click', () => answer(0), { once: true });
    }

    function renderArticle(l) {
      const known = doneSet().has('a_' + l.title);
      overlay.innerHTML = `<div class="kat-companion-modal">${header()}
        <p class="pf-lesson-text" style="font-weight:700;">${l.icon || '📄'} ${l.title}</p>
        <p class="snake-overlay-fact" style="max-height:160px;overflow:auto;">${l.text || ''}</p>
        <div class="action-row" style="justify-content:center;gap:10px;">
          <button class="btn-primary" id="kc-got-it">${t(lang,'gotIt')}</button>
        </div>
        <div class="action-row" style="justify-content:center;gap:8px;margin-top:8px;">
          <button class="pf-icon-btn" id="kc-back">${t(lang,'back')}</button>
          <button class="pf-icon-btn" id="kc-skip">${t(lang,'skip')} →</button>
        </div>
      </div>`;
      overlay.querySelector('#kc-close').addEventListener('click', close);
      overlay.querySelector('#kc-back').addEventListener('click', backOrMenu);
      overlay.querySelector('#kc-skip').addEventListener('click', () => {
        const idx = lessonPool.indexOf(l);
        const next = lessonPool[(idx + 1) % lessonPool.length] || l;
        history.push({ type: 'article', item: next });
        renderArticle(next);
      });
      overlay.querySelector('#kc-got-it').addEventListener('click', () => {
        const result = recordAccomplishment('a_' + l.title, lang);
        if (result.isNew) growPulse = Date.now();
        renderArticleList();
      }, { once: true });
      mountCanvas();
      void known; // (kept for readability at the call site; no separate branch needed)
    }

    renderMenu();
  }


  /* ─── PRAISE / HINT / INTRO PHRASES ──────────────────────────────────── */
  const REACT = {
    en: { praise: ['Nice!', 'You got it!', 'Great job!', 'Exactly right!'],
          hint:   ['So close! Try the next one.', 'Not quite — you’ll get it!', 'Good try! Keep going.'],
          intro:  'Hi! I’m your AI — I grow every time you learn something. Watch me level up!' },
    ru: { praise: ['Отлично!', 'Так держать!', 'Молодец!', 'Точно в цель!'],
          hint:   ['Почти! Дальше получится.', 'Не совсем — но ты справишься!', 'Хорошая попытка! Продолжай.'],
          intro:  'Привет! Я твой ИИ — я расту каждый раз, когда ты учишься. Смотри, как я расту!' },
    de: { praise: ['Super!', 'Genau richtig!', 'Klasse gemacht!', 'Stark!'],
          hint:   ['Fast! Beim nächsten klappt’s.', 'Nicht ganz — du schaffst das!', 'Guter Versuch! Weiter so.'],
          intro:  'Hallo! Ich bin deine KI — ich wachse jedes Mal, wenn du etwas lernst. Schau mir beim Wachsen zu!' },
    es: { praise: ['¡Genial!', '¡Exacto!', '¡Muy bien!', '¡Lo lograste!'],
          hint:   ['¡Casi! El siguiente te sale.', 'No exactamente — ¡tú puedes!', '¡Buen intento! Sigue así.'],
          intro:  '¡Hola! Soy tu IA — crezco cada vez que aprendes algo. ¡Mira cómo subo de nivel!' },
    fr: { praise: ['Génial !', 'Exactement !', 'Bien joué !', 'Super travail !'],
          hint:   ['Presque ! Tu auras le prochain.', 'Pas tout à fait — tu vas y arriver !', 'Bel essai ! Continue.'],
          intro:  'Salut ! Je suis ton IA — je grandis à chaque fois que tu apprends. Regarde-moi évoluer !' },
    hi: { praise: ['शानदार!', 'बिल्कुल सही!', 'बहुत बढ़िया!', 'कमाल है!'],
          hint:   ['बस थोड़ा सा! अगली बार सही होगा।', 'बिल्कुल नहीं — पर तुम कर लोगे!', 'अच्छी कोशिश! आगे बढ़ो।'],
          intro:  'नमस्ते! मैं तुम्हारा एआई हूं — जब भी तुम कुछ सीखते हो, मैं बड़ा होता हूं। मुझे बढ़ते हुए देखो!' },
    id: { praise: ['Mantap!', 'Tepat sekali!', 'Kerja bagus!', 'Hebat!'],
          hint:   ['Hampir! Coba yang berikutnya.', 'Belum tepat — kamu pasti bisa!', 'Usaha bagus! Lanjutkan.'],
          intro:  'Hai! Aku AI kamu — aku tumbuh setiap kali kamu belajar sesuatu. Lihat aku naik level!' },
    pt: { praise: ['Ótimo!', 'Exatamente!', 'Muito bem!', 'Mandou bem!'],
          hint:   ['Quase! A próxima você acerta.', 'Não foi dessa vez — você consegue!', 'Boa tentativa! Continue.'],
          intro:  'Oi! Eu sou sua IA — eu cresço toda vez que você aprende algo. Veja-me subir de nível!' },
    tr: { praise: ['Harika!', 'Tam isabet!', 'Aferin!', 'Süpersin!'],
          hint:   ['Az kaldı! Bir dahakine olur.', 'Tam değil — başaracaksın!', 'Güzel deneme! Devam et.'],
          intro:  'Selam! Ben senin yapay zekânım — bir şey öğrendiğinde büyürüm. Seviye atlamamı izle!' },
    vi: { praise: ['Tuyệt vời!', 'Chính xác!', 'Làm tốt lắm!', 'Giỏi quá!'],
          hint:   ['Gần đúng rồi! Câu sau sẽ được.', 'Chưa đúng — nhưng bạn sẽ làm được!', 'Cố gắng tốt! Tiếp tục nào.'],
          intro:  'Chào bạn! Mình là AI của bạn — mình lớn lên mỗi khi bạn học được điều gì đó. Hãy xem mình lên cấp nhé!' },
  };
  function reactPhrase(lang, kind) {
    const pool = (REACT[lang] || REACT.en)[kind];
    if (!pool) return '';
    if (Array.isArray(pool)) return pool[Math.floor(Math.random() * pool.length)];
    return pool;
  }

  /* ─── FLOATING MASCOT + SPEECH BUBBLE ────────────────────────────────── */
  let floatEl = null, floatCanvas = null, floatRaf = null, floatPoked = 0, floatLang = 'en';
  let bubbleEl = null, bubbleTimer = null, bubbleQueue = [];

  function mountFloating(lang) {
    floatLang = lang || 'en';
    if (floatEl) { updateFloatingLang(floatLang); return; }
    if (!document.body) return;

    floatEl = document.createElement('div');
    floatEl.id = 'kat-float-mascot';
    floatEl.className = 'kat-float-mascot';
    floatEl.innerHTML = `
      <div class="kat-float-bubble hidden" id="kat-float-bubble"></div>
      <canvas class="kat-float-canvas" width="56" height="56"></canvas>`;
    document.body.appendChild(floatEl);

    floatCanvas = floatEl.querySelector('.kat-float-canvas');
    bubbleEl = floatEl.querySelector('#kat-float-bubble');
    const ctx = floatCanvas.getContext('2d');

    floatEl.addEventListener('click', () => {
      floatPoked = Date.now();
      openTrainingScreen(floatLang);
    });

    function frame() {
      const now = Date.now();
      ctx.clearRect(0, 0, 56, 56);
      const s = loadState();
      drawCreature(ctx, 28, 30, stageIndex(s.done.length), now, now - floatPoked < 200);
      floatRaf = requestAnimationFrame(frame);
    }
    floatRaf = requestAnimationFrame(frame);

    try {
      if (!localStorage.getItem('kat_companion_intro_seen')) {
        localStorage.setItem('kat_companion_intro_seen', '1');
        setTimeout(() => say(reactPhrase(floatLang, 'intro'), 'intro'), 900);
      }
    } catch (_) {}
  }

  function updateFloatingLang(lang) { floatLang = lang || floatLang; }

  function setFloatingVisible(visible) {
    if (!floatEl) return;
    floatEl.classList.toggle('kat-float-hidden', !visible);
  }

  function say(text, mood) {
    if (!text || !bubbleEl) return;
    bubbleQueue.push({ text, mood: mood || 'praise' });
    if (!bubbleTimer) drainBubbleQueue();
  }
  function drainBubbleQueue() {
    const next = bubbleQueue.shift();
    if (!next) { bubbleTimer = null; return; }
    bubbleEl.textContent = next.text;
    bubbleEl.className = 'kat-float-bubble kat-float-bubble-' + next.mood;
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add('kat-float-bubble-show');
    bubbleTimer = setTimeout(() => {
      bubbleEl.classList.remove('kat-float-bubble-show');
      bubbleTimer = setTimeout(drainBubbleQueue, 260);
    }, next.mood === 'intro' ? 4200 : 2400);
  }

  function sayReaction(kind, lang) { say(reactPhrase(lang || floatLang, kind), kind); }
  window.KAT_Companion = { recordAccomplishment, render, setContent, getLevel: () => stageIndex(loadState().done.length), mountFloating, say, sayReaction, setFloatingVisible, updateFloatingLang };
})();
