/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  storage.js
   One place for all progress storage.

   Default: TAB MEMORY. Progress lives in sessionStorage (this tab only,
   gone when the tab is closed); if sessionStorage is unavailable, in a
   plain in-memory Map (gone on reload).

   Device saving (localStorage) happens ONLY after an explicit choice in
   the 💾 panel. Switching it off deletes this project's keys only —
   never a full wipe of the storage: other apps share the github.io origin.

   Edge cases handled:
   - storage blocked / throws (private mode, disabled) → tab memory
   - quota exceeded / partial write while enabling → rolled back
   - switched off in another tab → this tab stops writing to the device
     (consent is re-read on every write, plus the 'storage' event)
   - saves from older versions (written before consent existed) are
     neither read nor overwritten until the user keeps or deletes them
═══════════════════════════════════════════════════════════════════ */

'use strict';

(function () {
  const CONSENT = 'kat_consent_v1';
  // Every key this project has ever written. Exact keys + per-game prefixes.
  const OUR_KEYS = ['kat_v1', 'kat_v1_tracker', 'kat_stats', 'kat_companion_v2',
    'kat_companion_intro_seen', 'kat_leaderboard_v1', 'kat_snake_muted'];
  const OUR_PREFIXES = ['kat_race_', 'kat_pf_', 'kat_island_'];
  const isOurs = (k) => typeof k === 'string' &&
    (OUR_KEYS.includes(k) || OUR_PREFIXES.some(p => k.startsWith(p)));

  function probe(type) {
    try {
      const s = window[type];
      const t = 'kat__probe';
      s.setItem(t, '1'); s.removeItem(t);
      return s;
    } catch (_) { return null; }
  }
  const ls = probe('localStorage');
  const ss = probe('sessionStorage');
  const mem = new Map();

  let lastError = null;           // 'quota' | 'unavailable' | null
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn(status()); } catch (_) {} });

  /* ── tab memory ── */
  const tab = {
    get(k)    { if (ss) { try { return ss.getItem(k); } catch (_) {} } return mem.has(k) ? mem.get(k) : null; },
    set(k, v) { if (ss) { try { ss.setItem(k, v); return; } catch (_) {} } mem.set(k, v); },
    del(k)    { if (ss) { try { ss.removeItem(k); } catch (_) {} } mem.delete(k); },
    keys()    {
      const out = new Set(mem.keys());
      if (ss) { try { for (let i = 0; i < ss.length; i++) out.add(ss.key(i)); } catch (_) {} }
      return [...out].filter(isOurs);
    },
  };

  /* ── device storage helpers ── */
  function deviceOn() {
    if (!ls) return false;
    try { return ls.getItem(CONSENT) === '1'; } catch (_) { return false; }
  }
  function deviceKeys() {
    if (!ls) return [];
    const out = [];
    try { for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (isOurs(k)) out.push(k); } } catch (_) {}
    return out;
  }

  /* ── public read/write (string level) ── */
  function get(k) {
    if (deviceOn()) {
      try { const v = ls.getItem(k); if (v !== null) return v; } catch (_) {}
    }
    return tab.get(k);
  }
  function set(k, v) {
    v = String(v);
    tab.set(k, v);                // always mirrored: survives a failed device write
    if (!deviceOn()) return;      // consent re-read every time (other tab may have revoked)
    try { ls.setItem(k, v); if (lastError) { lastError = null; emit(); } }
    catch (_) { lastError = 'quota'; emit(); }
  }
  function remove(k) {
    tab.del(k);
    if (deviceOn()) { try { ls.removeItem(k); } catch (_) {} }
  }

  /* ── JSON helpers used by every module ── */
  // Modules re-render stored values via innerHTML, and other sites on the
  // shared github.io origin can write to the same storage. None of our data
  // needs markup, so strip < > from every stored string on the way in.
  function clean(v, depth) {
    if (depth > 8) return null;
    if (typeof v === 'string') return v.replace(/[<>]/g, '');
    if (Array.isArray(v)) return v.map(x => clean(x, depth + 1));
    if (v && typeof v === 'object') {
      const out = {};
      for (const key of Object.keys(v)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        out[clean(key, depth + 1)] = clean(v[key], depth + 1);
      }
      return out;
    }
    return v;
  }
  function readJSON(k, fallback) {
    const raw = get(k);
    if (raw === null || raw === undefined) return fallback;
    try { return clean(JSON.parse(raw), 0); } catch (_) { return fallback; } // corrupted/partial → ignore
  }
  function writeJSON(k, val) {
    let s; try { s = JSON.stringify(val); } catch (_) { return; }
    set(k, s);
  }

  /* ── consent actions ── */
  function enableDevice() {
    if (!ls) { lastError = 'unavailable'; emit(); return false; }
    const keys = tab.keys();
    const written = [];
    try {
      for (const k of keys) { ls.setItem(k, tab.get(k)); written.push(k); }
      ls.setItem(CONSENT, '1');   // written last: no consent flag over a half-copied set
    } catch (_) {
      written.forEach(k => { try { ls.removeItem(k); } catch (_) {} });
      try { ls.removeItem(CONSENT); } catch (_) {}
      lastError = 'quota'; emit();
      return false;
    }
    lastError = null; emit();
    return true;
  }
  // Off = stop device saving and delete this project's device keys.
  // The current tab keeps working from tab memory.
  function disableDevice() {
    if (ls) {
      deviceKeys().forEach(k => {
        try { const v = ls.getItem(k); if (v !== null && tab.get(k) === null) tab.set(k, v); } catch (_) {}
      });
      try { ls.removeItem(CONSENT); } catch (_) {}
      deviceKeys().forEach(k => { try { ls.removeItem(k); } catch (_) {} });
    }
    lastError = null; emit();
  }
  // Delete this project's device keys only (this tab keeps working).
  function deleteDevice() {
    if (ls) {
      deviceKeys().forEach(k => { try { ls.removeItem(k); } catch (_) {} });
      try { ls.removeItem(CONSENT); } catch (_) {}
    }
    lastError = null; emit();
  }
  // Delete everything this project stored: device + this tab.
  function deleteAll() {
    tab.keys().forEach(k => tab.del(k));
    deleteDevice();
  }
  // Older versions saved without asking. Keep = turn device saving on.
  function keepLegacy() {
    if (!ls) return false;
    try { ls.setItem(CONSENT, '1'); } catch (_) { lastError = 'quota'; emit(); return false; }
    lastError = null; emit();
    return true;
  }

  function status() {
    const on = deviceOn();
    return {
      available: !!ls,
      device: on,
      legacy: !on && deviceKeys().length > 0,
      tabOnly: !ss,               // no sessionStorage → lost on reload
      error: lastError,
    };
  }

  // Revoked or granted in another tab.
  window.addEventListener('storage', (e) => {
    if (e.key === CONSENT || e.key === null) emit();
  });

  window.KAT_Store = {
    get, set, remove, readJSON, writeJSON,
    enableDevice, disableDevice, deleteDevice, deleteAll, keepLegacy,
    status, onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    _isOurs: isOurs,
  };
})();
