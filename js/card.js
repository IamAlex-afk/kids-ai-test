/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  card.js  ·  v1.0.0
   Generates the unique, unforgeable participant card.

   Algorithm:
   1. Get trusted timestamp from worldtimeapi.org (falls back to Date.now)
   2. Compute card number = seconds since PROJECT_START_MS
   3. Pick random AI name from window.KAT_NAMES
   4. Compute SHA-256 fingerprint over all fields + SALT
   5. Render to Canvas → PNG download button
   6. Optional: QR code pointing to verification page
   7. Notify core.js via window.KAT.onCardGenerated()

   Verification (anyone can check):
   hash = SHA-256( lang + "#" + number + "#" + timestamp + "#" + age
                 + "#" + score + "#" + name + "#" + SALT )
   Published in README and Zenodo DOI snapshot.
═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   CONFIGURATION
───────────────────────────────────────────── */

const TIME_API = 'https://worldtimeapi.org/api/timezone/UTC';

/* ─────────────────────────────────────────────
   SHA-256 via WebCrypto (no library needed)
───────────────────────────────────────────── */

async function sha256(message) {
  const enc  = new TextEncoder();
  const data = enc.encode(message);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ─────────────────────────────────────────────
   TRUSTED TIME
   Tries worldtimeapi.org first; falls back to
   server-time via Date (user can't easily fake)
───────────────────────────────────────────── */

async function getTrustedTimestamp() {
  try {
    const res  = await fetch(TIME_API, { cache: 'no-store' });
    if (!res.ok) throw new Error('time api fail');
    const json = await res.json();
    // Returns ISO string like "2025-07-01T12:34:56.789000+00:00"
    return new Date(json.datetime).getTime();
  } catch (_) {
    // Fallback: browser clock (still valid, just slightly less trusted)
    return Date.now();
  }
}

/* ─────────────────────────────────────────────
   CARD NUMBER
   = seconds elapsed since project launch
   Format: 9-digit zero-padded string
───────────────────────────────────────────── */

function computeCardNumber(timestampMs, projectStartMs) {
  const seconds = Math.max(0, Math.floor((timestampMs - projectStartMs) / 1000));
  return String(seconds).padStart(9, '0');
}

/* ─────────────────────────────────────────────
   RANDOM AI NAME
   Pulled from window.KAT_NAMES (loaded by js/names.js)
   Falls back to inline micro-pool.
───────────────────────────────────────────── */

const FALLBACK_NAMES = [
  'NeuralSpark','DataDreamer','QuantumKid','LogicLion',
  'ByteWatcher','SignalSage','MatrixMinor','TokenTiger',
  'EpochEagle','GradientGuru','LayerLynx','VectorViper',
  'TensorTurtle','BiasBird','WeightWolf','NodeNomad',
];

function randomName() {
  const pool = (window.KAT_NAMES && window.KAT_NAMES.length > 0)
    ? window.KAT_NAMES
    : FALLBACK_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─────────────────────────────────────────────
   CANVAS CARD RENDERER
   Produces a 900×540 px PNG (3:5 aspect — trading card)
───────────────────────────────────────────── */

const CANVAS_W = 900;
const CANVAS_H = 540;

// Theme colours per age group
const AGE_THEME = {
  tiny:  { bg: '#fff0f6', accent: '#ff4d94', text: '#2a0015' },
  child: { bg: '#fffbe0', accent: '#f5c400', text: '#1a1200' },
  teen:  { bg: '#e0faff', accent: '#00c8e0', text: '#00151a' },
  adult: { bg: '#1a0030', accent: '#8b5cf6', text: '#f0e6ff' },
};

function renderCanvas(card, langData) {
  const canvas = document.getElementById('result-canvas');
  if (!canvas) return null;

  canvas.width  = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');

  const theme = AGE_THEME[card.age] || AGE_THEME.adult;
  const ui    = (k) => langData?.ui?.[k] || k;

  // ── Background ──
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── Decorative gradient strip (top) ──
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
  grad.addColorStop(0, theme.accent + 'cc');
  grad.addColorStop(1, theme.accent + '33');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, 8);

  // ── Title ──
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('KIDS AI TEST', 40, 50);

  // ── Watermark ──
  ctx.fillStyle = theme.accent + '22';
  ctx.font = 'bold 160px system-ui, sans-serif';
  ctx.fillText('AI', CANVAS_W / 2 - 80, CANVAS_H / 2 + 60);

  // ── Name ──
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 52px system-ui, sans-serif';
  ctx.fillText(card.name, 40, 140);

  // ── Card number ──
  ctx.fillStyle = theme.text;
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`#${card.number}`, 40, 180);

  // ── Score badge ──
  const badgeX = CANVAS_W - 200;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.roundRect(badgeX, 80, 160, 80, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 42px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${card.score}%`, badgeX + 80, 130);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(ui('card_score_label'), badgeX + 80, 152);
  ctx.textAlign = 'left';

  // ── Tier label ──
  const tierLabels = [ui('result_tier_0'), ui('result_tier_1'), ui('result_tier_2')];
  const medals = ['🥉', '🥈', '🥇'];
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = theme.text;
  ctx.fillText(`${medals[card.tier] || ''} ${tierLabels[card.tier] || ''}`, 40, 230);

  // ── Language + Age ──
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = theme.text + 'aa';
  ctx.fillText(`${card.lang.toUpperCase()}  ·  ${card.age}`, 40, 270);

  // ── Issued date ──
  const issuedDate = new Date(card.timestampMs).toISOString().slice(0, 10);
  ctx.fillText(`${ui('card_issued')}: ${issuedDate}`, 40, 300);

  // ── Hash fingerprint (short) ──
  ctx.font = '12px monospace';
  ctx.fillStyle = theme.text + '88';
  const shortHash = card.hash.slice(0, 8) + '…' + card.hash.slice(-8);
  ctx.fillText(`SHA-256: ${shortHash}`, 40, CANVAS_H - 60);

  // ── Domain (verification anchor) ──
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = theme.accent;
  ctx.fillText('iamalex-afk.github.io/kids-ai-test/', 40, CANVAS_H - 35);

  // ── Bottom strip ──
  ctx.fillStyle = theme.accent + 'cc';
  ctx.fillRect(0, CANVAS_H - 8, CANVAS_W, 8);

  return canvas;
}

/* ─────────────────────────────────────────────
   QR CODE
   Uses qrcode-generator (tiny MIT lib) if loaded.
   Renders into #card-qr div.
───────────────────────────────────────────── */

function renderQR(verifyUrl) {
  const container = document.getElementById('card-qr');
  if (!container) return;

  if (typeof qrcode === 'function') {
    const qr = qrcode(0, 'M');
    qr.addData(verifyUrl);
    qr.make();
    container.innerHTML = qr.createSvgTag({ scalable: true });
  } else {
    // Fallback: link only
    container.innerHTML = `<a href="${verifyUrl}" target="_blank" rel="noopener">${verifyUrl}</a>`;
  }
}

/* ─────────────────────────────────────────────
   DOWNLOAD BUTTON
───────────────────────────────────────────── */

function enableDownload(canvas, card) {
  const btn = document.getElementById('btn-download-card');
  if (!btn || !canvas) return;

  btn.hidden = false;
  btn.addEventListener('click', () => {
    const link    = document.createElement('a');
    link.download = `kids-ai-test-${card.number}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  });
}

/* ─────────────────────────────────────────────
   SHARE CARD
───────────────────────────────────────────── */

function enableShare(card, langData) {
  const btn = document.getElementById('btn-share-card');
  if (!btn) return;

  const ui   = (k) => langData?.ui?.[k] || k;
  const url  = `https://iamalex-afk.github.io/kids-ai-test/verify.html?n=${card.number}&h=${card.hash.slice(0, 16)}&l=${card.lang}`;
  const text = `${ui('share_card_text')} #${card.number} — ${card.name}`;

  btn.hidden = false;
  btn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'Kids AI Test', text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text + '\n' + url);
      btn.textContent = ui('share_copied');
      setTimeout(() => { btn.textContent = ui('share_btn'); }, 2000);
    }
  });
}

/* ─────────────────────────────────────────────
   MAIN ENTRY POINT
   Called by core.js:  window.KAT_Card.generate(state, salt, projectStart)
───────────────────────────────────────────── */

async function generate(state, salt, projectStartMs) {
  // Show loading state
  const btn = document.getElementById('btn-get-card');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }

  const cardArea = document.getElementById('card-display-area');
  if (cardArea) cardArea.hidden = false;

  try {
    // 1. Get trusted time
    const timestampMs = await getTrustedTimestamp();

    // 2. Card number (seconds since launch)
    const number = computeCardNumber(timestampMs, projectStartMs);

    // 3. Random name
    const name = randomName();

    // 4. SHA-256 hash — language is part of the fingerprint
    const langData = window.LANG_DATA || {};
    const lang     = state.lang || 'en';
    const age      = state.age  || 'adult';
    const score    = state.result?.score || 0;
    const tier     = state.result?.tier  || 0;

    const rawInput = `${lang}#${number}#${timestampMs}#${age}#${score}#${name}#${salt}`;
    const hash     = await sha256(rawInput);

    const card = { lang, age, number, name, hash, score, tier, timestampMs };

    // 5. Render canvas
    const canvas = renderCanvas(card, langData);

    // 6. QR code
    const verifyBase = 'https://iamalex-afk.github.io/kids-ai-test/verify.html';
    const verifyUrl  = `${verifyBase}?n=${number}&h=${hash.slice(0, 16)}&l=${lang}`;
    renderQR(verifyUrl);

    // 7. Buttons
    enableDownload(canvas, card);
    enableShare(card, langData);

    // 8. Show the card HTML overlay
    renderCardHTML(card, langData);

    // 9. Notify core.js
    if (window.KAT?.onCardGenerated) window.KAT.onCardGenerated(card);

    if (btn) { btn.disabled = false; btn.textContent = '✅ ' + (langData?.ui?.card_ready || 'Card ready!'); }

  } catch (err) {
    console.error('[KAT Card]', err);
    if (btn) { btn.disabled = false; btn.textContent = '❌ Error — try again'; }
  }
}

/* ─────────────────────────────────────────────
   HTML CARD OVERLAY
   Shown below the canvas in the DOM
───────────────────────────────────────────── */

function renderCardHTML(card, langData) {
  const container = document.getElementById('card-info');
  if (!container) return;

  const ui = (k) => langData?.ui?.[k] || k;
  const tierLabels = [ui('result_tier_0'), ui('result_tier_1'), ui('result_tier_2')];
  const medals = ['🥉', '🥈', '🥇'];

  container.innerHTML = `
    <div class="card-hero">
      <h2 class="card-name">${card.name}</h2>
      <div class="card-number-badge">#${card.number}</div>
    </div>
    <dl class="card-details">
      <dt>${ui('card_tier')}</dt>
      <dd>${medals[card.tier] || ''} ${tierLabels[card.tier] || ''}</dd>
      <dt>${ui('card_score')}</dt>
      <dd>${card.score}%</dd>
      <dt>${ui('card_lang')}</dt>
      <dd>${card.lang.toUpperCase()} · ${card.age}</dd>
      <dt>${ui('card_issued')}</dt>
      <dd>${new Date(card.timestampMs).toISOString().slice(0, 10)}</dd>
    </dl>
    <details class="card-hash-details">
      <summary>${ui('card_verify')}</summary>
      <code class="card-hash">${card.hash}</code>
      <p class="card-hash-note">${ui('card_hash_note')}</p>
    </details>
  `;
}

/* ─────────────────────────────────────────────
   PUBLIC API
───────────────────────────────────────────── */

window.KAT_Card = { generate };
