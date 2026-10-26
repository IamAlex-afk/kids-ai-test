/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  lesson.js
   Static lesson pages and lesson catalogs (tools/gen-lessons.mjs).
   - language menu in the header
   - "Check yourself": answer, calm explanation, try again; never moves
     to another screen by itself
   - "Listen" / "Stop the voice": only on a tap, only with a voice that
     is installed on the device (no hidden online speech service)
   Stores nothing and sends nothing. The page works without this file:
   the answer is then in the "Show the answer" block.
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ── Language menu ── */
  const globe = $('#lang-globe'), menu = $('#lang-dropdown');
  if (globe && menu) {
    const close = () => { menu.classList.remove('open'); globe.setAttribute('aria-expanded', 'false'); };
    globe.addEventListener('click', (e) => {
      e.stopPropagation();
      globe.setAttribute('aria-expanded', String(menu.classList.toggle('open')));
    });
    document.addEventListener('click', close, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) { close(); globe.focus(); }
    });
  }

  /* ── Check yourself ── */
  const msg = document.body.dataset;   // data-right / data-wrong: texts from the page
  $$('.wk-q-block').forEach((block) => {
    const correct = Number(block.dataset.correct);
    const opts = $$('.wk-opt', block);
    const fb = $('.wk-fb', block), retry = $('.wk-retry', block), reveal = $('.wk-reveal', block);
    const explain = $('.wk-explain', block)?.textContent || '';
    reveal.hidden = true;                // the buttons explain the answer instead
    opts.forEach((b) => {
      b.disabled = false;
      b.addEventListener('click', () => {
        const ok = Number(b.dataset.i) === correct;
        opts.forEach((o) => { o.disabled = true; });
        b.classList.add(ok ? 'is-right' : 'is-wrong');
        b.setAttribute('aria-describedby', fb.id);
        if (ok) opts[correct].classList.add('is-right');
        fb.className = 'wk-fb ' + (ok ? 'fb-right' : 'fb-wrong');
        fb.textContent = (ok ? msg.right : msg.wrong) + (explain ? ' ' + explain : '');
        retry.hidden = ok;
        if (!ok) retry.focus();
      });
    });
    retry.addEventListener('click', () => {
      opts.forEach((o) => { o.disabled = false; o.classList.remove('is-right', 'is-wrong'); o.removeAttribute('aria-describedby'); });
      fb.className = 'wk-fb'; fb.textContent = '';
      retry.hidden = true;
      opts[0].focus();
    });
  });

  /* ── Listen / stop ── */
  const voiceBox = $('.wk-voice'), noVoice = $('.wk-novoice');
  if (!voiceBox) return;
  const synth = window.speechSynthesis;
  const tag = document.documentElement.lang || 'en';
  const TAGS = { en: 'en-US', ru: 'ru-RU', de: 'de-DE', es: 'es-ES', fr: 'fr-FR', hi: 'hi-IN', id: 'id-ID', pt: 'pt-BR', tr: 'tr-TR', vi: 'vi-VN' };
  const want = tag.includes('-') ? tag : (TAGS[tag] || tag);
  const prefix = want.split('-')[0];

  // Installed voices only: localService === false means an online service.
  const findVoice = () => {
    const vs = synth.getVoices().filter((v) => v.localService !== false);
    return vs.find((v) => v.lang === want) || vs.find((v) => v.lang.replace('_', '-').startsWith(prefix)) || null;
  };
  const decide = (voice) => {
    if (voice) { voiceBox.hidden = false; noVoice.hidden = true; } else { voiceBox.hidden = true; noVoice.hidden = false; }
    return voice;
  };
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { decide(null); return; }

  let voice = findVoice();
  if (voice || synth.getVoices().length) decide(voice);
  else {
    // Chrome fills the list a moment after load.
    let done = false;
    const finish = () => { if (done) return; done = true; voice = decide(findVoice()); };
    synth.addEventListener?.('voiceschanged', finish);
    setTimeout(finish, 1200);
  }

  const listen = $('.wk-listen', voiceBox), stop = $('.wk-stop', voiceBox);
  const idle = () => { stop.disabled = true; listen.disabled = false; };
  listen.addEventListener('click', () => {
    voice = voice || findVoice();
    if (!voice) { decide(null); return; }
    synth.cancel();
    const text = $$('[data-speak]').map((el) => el.textContent.trim()).filter(Boolean).join('. ');
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = document.body.dataset.age === 'tiny' ? 0.85 : 0.95;
    u.onend = u.onerror = idle;
    stop.disabled = false; listen.disabled = true;
    synth.speak(u);
    stop.focus();
  });
  stop.addEventListener('click', () => { synth.cancel(); idle(); listen.focus(); });
  window.addEventListener('pagehide', () => synth.cancel());
})();
