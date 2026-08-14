/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · js/glossary.js
   Tap a highlighted term inside a lesson to get a plain-language
   definition + example, in the current language. Additive only —
   if a term isn't found in the running text nothing is linked, so
   this can never break lesson rendering.
═══════════════════════════════════════════════════════════════════ */
(function () {
  const TERMS = {
    en: [
      { key: 'hallucination', match: 'hallucination', label: 'AI hallucination', def: 'When AI confidently says something that sounds true but isn\'t. It happens because AI predicts likely-sounding words, not verified facts.', example: 'Like a classmate who guesses on a test instead of saying "I don\'t know" — but sounds 100% sure either way.' },
      { key: 'deepfake', match: 'deepfake', label: 'Deepfake', def: 'A fake photo, video, or voice made by AI to look or sound like a real person doing or saying something they never did.', example: 'A video of a celebrity "saying" something they never actually said.' },
      { key: 'neuralnet', match: 'neural network', label: 'Neural network', def: 'A type of AI loosely inspired by how brain cells connect, built from layers of simple math units that learn patterns from examples.', example: 'It doesn\'t "think" like a brain — it adjusts millions of numbers until its guesses get closer to correct.' },
      { key: 'algorithm', match: 'algorithm', label: 'Algorithm', def: 'A step-by-step set of rules a computer follows to solve a problem or make a decision.', example: 'A recipe is an algorithm for cooking — an AI algorithm is a recipe for a decision.' },
      { key: 'chatbot', match: 'chatbot', label: 'Chatbot', def: 'A computer program designed to hold a conversation with you by predicting likely next words, not by understanding like a person does.', example: 'ChatGPT and similar assistants are chatbots.' },
      { key: 'datacenter', match: 'data center', label: 'Data center', def: 'A large building full of powerful computers that actually run AI models — AI is not "in the cloud" in any magical sense.', example: 'Answering your question uses real electricity in a real building somewhere in the world.' },
      { key: 'trainingdata', match: 'training data', label: 'Training data', def: 'The huge collection of text, images, or examples an AI studied to learn its patterns before you ever used it.', example: 'If the training data is unbalanced or unfair, the AI\'s answers can be too.' },
      { key: 'prompt', match: 'prompt', label: 'Prompt', def: 'The question or instruction you type to an AI. What you write shapes the answer you get.', example: 'A specific, clear prompt usually gets a much more useful answer than a vague one.' },
      { key: 'bias', match: 'bias', label: 'AI bias', def: 'When an AI treats some people or groups unfairly because the examples it learned from weren\'t balanced.', example: 'A face-recognition tool trained mostly on light skin tones can be less accurate for dark skin tones.' },
      { key: 'llm', match: 'large language model', label: 'Large language model (LLM)', def: 'A type of AI trained on huge amounts of text to predict the next word — the technology behind chatbots like ChatGPT.', example: 'It\'s called "large" because it learned from an enormous amount of text and has billions of internal settings.' },
    ],
    ru: [
      { key: 'hallucination', match: 'галлюцинаци', label: 'Галлюцинация ИИ', def: 'Когда ИИ уверенно говорит то, что звучит правдоподобно, но на самом деле неверно. Это происходит, потому что ИИ предсказывает правдоподобные слова, а не проверенные факты.', example: 'Как одноклассник, который угадывает ответ на контрольной, вместо того чтобы сказать «я не знаю» — но звучит при этом очень уверенно.' },
      { key: 'deepfake', match: 'дипфейк', label: 'Дипфейк', def: 'Поддельное фото, видео или голос, сделанные ИИ так, чтобы выглядеть или звучать как настоящий человек, делающий или говорящий то, чего он никогда не делал.', example: 'Видео, где знаменитость «говорит» то, чего она на самом деле никогда не говорила.' },
      { key: 'neuralnet', match: 'нейросет', label: 'Нейросеть', def: 'Тип ИИ, вдохновлённый тем, как связаны клетки мозга, — она состоит из слоёв простых математических элементов, которые учатся на примерах.', example: 'Она не «думает» как мозг — она подстраивает миллионы чисел, пока её ответы не становятся точнее.' },
      { key: 'algorithm', match: 'алгоритм', label: 'Алгоритм', def: 'Пошаговый набор правил, по которым компьютер решает задачу или принимает решение.', example: 'Рецепт — это алгоритм для готовки; алгоритм ИИ — это рецепт для решения.' },
      { key: 'chatbot', match: 'чат-бот', label: 'Чат-бот', def: 'Программа, созданная для общения с тобой — она предсказывает вероятные слова, а не понимает тебя как человек.', example: 'ChatGPT и похожие помощники — это чат-боты.' },
      { key: 'datacenter', match: 'дата-центр', label: 'Дата-центр', def: 'Огромное здание, полное мощных компьютеров, которые и запускают модели ИИ — ИИ не живёт в «облаке» в магическом смысле.', example: 'Ответ на твой вопрос тратит настоящее электричество в настоящем здании где-то в мире.' },
      { key: 'trainingdata', match: 'обучающих данных', label: 'Обучающие данные', def: 'Огромный набор текстов, картинок или примеров, на которых ИИ учился, прежде чем ты им воспользовался.', example: 'Если обучающие данные несбалансированы, ответы ИИ тоже могут быть несправедливыми.' },
      { key: 'prompt', match: 'промпт', label: 'Промпт', def: 'Вопрос или инструкция, которую ты пишешь ИИ. То, как ты спрашиваешь, влияет на то, какой ответ ты получишь.', example: 'Конкретный, чёткий промпт обычно даёт гораздо более полезный ответ, чем расплывчатый.' },
      { key: 'bias', match: 'предвзят', label: 'Предвзятость ИИ', def: 'Когда ИИ относится к некоторым людям или группам несправедливо, потому что примеры, на которых он учился, были несбалансированы.', example: 'Система распознавания лиц, обученная главным образом на светлой коже, может хуже работать с тёмной.' },
      { key: 'llm', match: 'языковая модел', label: 'Большая языковая модель (LLM)', def: 'Тип ИИ, обученный на огромном количестве текста, чтобы предсказывать следующее слово — технология за чат-ботами вроде ChatGPT.', example: 'Её называют «большой», потому что она училась на огромном объёме текста и имеет миллиарды внутренних настроек.' },
    ],
  };
  // Fallback: languages without a native list yet reuse EN definitions so the
  // feature is present everywhere; native lists can replace this over time.
  ['de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'].forEach(l => { if (!TERMS[l]) TERMS[l] = TERMS.en; });

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function linkify(html, lang) {
    if (!html) return html;
    const terms = TERMS[lang] || TERMS.en;
    let out = html;
    terms.forEach(term => {
      if (out.indexOf('data-term="' + term.key + '"') !== -1) return; // already linked once
      const re = new RegExp('(' + escapeRe(term.match) + ')', 'i');
      if (re.test(out)) {
        out = out.replace(re, `<span class="kat-term" data-term="${term.key}" data-lang="${lang}" role="button" tabindex="0">$1</span>`);
      }
    });
    return out;
  }

  function showPopup(key, lang) {
    const terms = TERMS[lang] || TERMS.en;
    const term = terms.find(t => t.key === key);
    if (!term) return;
    let modal = document.getElementById('kat-term-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'kat-term-modal';
      modal.className = 'kat-term-modal hidden';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="kat-term-card">
        <button class="kat-term-close" id="kat-term-close" aria-label="Close">✕</button>
        <p class="kat-term-label">📖 ${term.label}</p>
        <p class="kat-term-def">${term.def}</p>
        ${term.example ? `<p class="kat-term-example">💡 ${term.example}</p>` : ''}
      </div>`;
    modal.classList.remove('hidden');
    const close = () => modal.classList.add('hidden');
    modal.querySelector('#kat-term-close').addEventListener('click', close, { once: true });
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); }, { once: true });
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('.kat-term');
    if (!el) return;
    showPopup(el.dataset.term, el.dataset.lang);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest && e.target.closest('.kat-term');
    if (!el) return;
    e.preventDefault();
    showPopup(el.dataset.term, el.dataset.lang);
  });

  window.KAT_Glossary = { linkify, TERMS };
})();
