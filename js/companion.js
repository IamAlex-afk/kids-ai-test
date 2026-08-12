'use strict';

/* ═══════════════════════════════════════════════════════════════════
   KAT COMPANION — a persistent AI "pet" that grows with real progress.
   Not a separate feeding minigame: it gains knowledge automatically
   whenever the child actually completes something real (a snake round,
   a world/track clear, a correct quiz answer) in ANY of the 3 games.
   "The more it knows, the more it grows."

   Fully persistent (localStorage), zero server — same stance as
   everything else on this site. Gentle by design for young kids: no
   fail state, no decay, knowledge only ever goes up.

   API (global, callable from any of the game modules regardless of
   load order — always guard with `window.KAT_Companion?.`):
     window.KAT_Companion.addKnowledge(amount, lang)
     window.KAT_Companion.render(container, lang)
═══════════════════════════════════════════════════════════════════ */

(function () {
  function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
    catch (_) { return fallback; }
  }
  function writeJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {} }

  const LS_KEY = 'kat_companion_v1';
  function loadState() { return readJSON(LS_KEY, { knowledge: 0, notifiedStage: 0 }); }
  function saveState(s) { writeJSON(LS_KEY, s); }

  // Thresholds are cumulative "knowledge points" — roughly: a snake round
  // = 1pt, a world/track clear = 2pt, a correct quiz answer = 1pt. Tuned
  // so the first couple of stages come quickly (young kids get visible
  // growth fast) and later ones take real sustained play.
  const STAGES = [
    { min: 0,  icon: '💫', color: '#93c5fd' },
    { min: 5,  icon: '🔌', color: '#22d3ee' },
    { min: 15, icon: '🧩', color: '#34d399' },
    { min: 35, icon: '🧠', color: '#a78bfa' },
    { min: 70, icon: '⭐', color: '#fbbf24' },
  ];
  const STR = {
    en: { title: 'Your AI', names: ['Spark', 'Circuit', 'Processor', 'Neural Net', 'Superintelligence'], knowledge: 'knowledge', next: 'to next stage', maxed: 'Fully grown!', grew: 'grew up!' },
    ru: { title: 'Твой ИИ', names: ['Искра', 'Схема', 'Процессор', 'Нейросеть', 'Суперинтеллект'], knowledge: 'знаний', next: 'до роста', maxed: 'Полностью вырос!', grew: 'вырос!' },
  };
  function t(lang, key) { const d = STR[lang] || STR.en; return d[key]; }

  function stageIndex(k) { let idx = 0; STAGES.forEach((s, i) => { if (k >= s.min) idx = i; }); return idx; }

  function addKnowledge(amount, lang) {
    const s = loadState();
    s.knowledge = Math.max(0, s.knowledge + (amount || 0));
    const stage = stageIndex(s.knowledge);
    const leveledUp = stage > s.notifiedStage;
    if (leveledUp) s.notifiedStage = stage;
    saveState(s);
    if (leveledUp) pingLevelUp(stage, lang);
    refreshAllWidgets();
    return { knowledge: s.knowledge, stage, leveledUp };
  }

  // Any currently-mounted widgets re-render themselves after a knowledge
  // change, even if the change came from a different script (a game).
  const widgets = new Set();
  function refreshAllWidgets() { widgets.forEach(w => { try { w.refresh(); } catch (_) {} }); }

  let levelUpToastEl = null;
  function pingLevelUp(stage, lang) {
    if (!document.body) return;
    if (!levelUpToastEl) {
      levelUpToastEl = document.createElement('div');
      levelUpToastEl.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9999;background:#0d1117;border:1px solid #22d3ee;border-radius:10px;padding:10px 16px;color:#e2e8f0;font:700 14px system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4);transition:opacity .3s;pointer-events:none;';
      document.body.appendChild(levelUpToastEl);
    }
    const names = t(lang, 'names');
    levelUpToastEl.textContent = `${STAGES[stage].icon} ${names[stage] || names[names.length - 1]} ${t(lang, 'grew')}`;
    levelUpToastEl.style.opacity = '1'; levelUpToastEl.style.display = 'block';
    clearTimeout(pingLevelUp._t);
    pingLevelUp._t = setTimeout(() => { if (levelUpToastEl) levelUpToastEl.style.opacity = '0'; }, 2600);
  }

  /* ─── RENDERER ────────────────────────────────────────────────────── */
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

  function drawCreature(ctx, cx, cy, stage, now, poked) {
    const color = STAGES[stage].color;
    const bob = Math.sin(now * 0.003) * 3;
    const y = cy + bob - (poked ? 6 : 0);
    ctx.save();
    ctx.translate(cx, y);

    // Contact shadow
    const shGrad = ctx.createRadialGradient(0, 30 - bob, 0, 0, 30 - bob, 20);
    shGrad.addColorStop(0, 'rgba(0,0,0,0.35)'); shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shGrad;
    ctx.beginPath(); ctx.ellipse(0, 30 - bob, 18, 6, 0, 0, Math.PI * 2); ctx.fill();

    ctx.shadowColor = color; ctx.shadowBlur = 14;

    // Body — round blob, gradient shaded, grows slightly each stage.
    const r = 16 + stage * 2.2;
    const bodyGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r);
    bodyGrad.addColorStop(0, shadeColor(color, 35));
    bodyGrad.addColorStop(0.6, color);
    bodyGrad.addColorStop(1, shadeColor(color, -30));
    ctx.fillStyle = bodyGrad; ctx.strokeStyle = shadeColor(color, -15); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Stage 1+: small antenna
    if (stage >= 1) {
      ctx.strokeStyle = shadeColor(color, -10); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 8); ctx.stroke();
      ctx.fillStyle = '#ffe066'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, -r - 9, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 14;
    }
    // Stage 2+: stubby arms
    if (stage >= 2) {
      ctx.strokeStyle = shadeColor(color, -10); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r + 2, 2); ctx.lineTo(-r - 6, 8 + bob * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(r - 2, 2); ctx.lineTo(r + 6, 8 - bob * 0.3); ctx.stroke();
    }
    // Stage 3+: glowing chest core
    if (stage >= 3) {
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.006);
      ctx.globalAlpha = pulse; ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(0, 4, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Max stage: sparkle particles around it
    if (stage >= STAGES.length - 1) {
      for (let i = 0; i < 3; i++) {
        const a = now * 0.0015 + (i * Math.PI * 2) / 3;
        const px = Math.cos(a) * (r + 12), py = Math.sin(a) * (r + 12);
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(now * 0.004 + i);
        ctx.fillStyle = '#ffe066'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Eyes — always present, simple and friendly.
    ctx.shadowBlur = 6; ctx.shadowColor = '#00ffff'; ctx.fillStyle = '#00ffff';
    const eyeGap = r * 0.35;
    ctx.beginPath(); ctx.arc(-eyeGap, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eyeGap, -2, 2, 0, Math.PI * 2); ctx.fill();

    // Specular highlight
    const hl = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0, -r * 0.35, -r * 0.4, r * 0.5);
    hl.addColorStop(0, 'rgba(255,255,255,0.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.4, r * 0.55, -0.3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  function render(container, lang) {
    lang = lang || 'en';
    let raf = null, poked = 0;
    const wrap = document.createElement('div');
    wrap.className = 'kat-companion';
    wrap.innerHTML = `
      <canvas class="kat-companion-canvas" width="90" height="90"></canvas>
      <div class="kat-companion-info">
        <div class="kat-companion-title" id="kc-title"></div>
        <div class="kat-companion-bar"><div class="kat-companion-fill" id="kc-fill"></div></div>
        <div class="kat-companion-sub" id="kc-sub"></div>
      </div>`;
    container.innerHTML = '';
    container.appendChild(wrap);

    const canvas = wrap.querySelector('.kat-companion-canvas');
    const ctx = canvas.getContext('2d');
    const titleEl = wrap.querySelector('#kc-title');
    const fillEl = wrap.querySelector('#kc-fill');
    const subEl = wrap.querySelector('#kc-sub');

    canvas.addEventListener('pointerdown', () => { poked = Date.now(); });

    function updateText() {
      const s = loadState();
      const stage = stageIndex(s.knowledge);
      const names = t(lang, 'names');
      titleEl.textContent = `${STAGES[stage].icon} ${names[stage] || names[names.length - 1]}`;
      const next = STAGES[stage + 1];
      if (next) {
        const pct = Math.round(((s.knowledge - STAGES[stage].min) / (next.min - STAGES[stage].min)) * 100);
        fillEl.style.width = Math.max(4, pct) + '%';
        subEl.textContent = `${s.knowledge} ${t(lang, 'knowledge')} · ${next.min - s.knowledge} ${t(lang, 'next')}`;
      } else {
        fillEl.style.width = '100%';
        subEl.textContent = `${s.knowledge} ${t(lang, 'knowledge')} · ${t(lang, 'maxed')}`;
      }
    }

    function frame() {
      const now = Date.now();
      ctx.clearRect(0, 0, 90, 90);
      const s = loadState();
      drawCreature(ctx, 45, 48, stageIndex(s.knowledge), now, now - poked < 200);
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

  window.KAT_Companion = { addKnowledge, render, getKnowledge: () => loadState().knowledge };
})();
