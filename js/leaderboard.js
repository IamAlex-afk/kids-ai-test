'use strict';

/* ═══════════════════════════════════════════════════════════════════
   KAT LEADERBOARD — local, device-only high scores.
   No server, no account, nothing leaves the browser — consistent with
   this site's "zero-data-collection" stance (see robots.txt).
═══════════════════════════════════════════════════════════════════ */

(function () {
  const LS_KEY = 'kat_leaderboard_v1';

  // Via KAT_Store (js/storage.js): tab memory unless device saving is switched on.
  function readJSON(key, fallback) { return window.KAT_Store ? window.KAT_Store.readJSON(key, fallback) : fallback; }
  function writeJSON(key, val) { if (window.KAT_Store) window.KAT_Store.writeJSON(key, val); }
  function key(ageGroup, difficulty) { return ageGroup + '_' + difficulty; }

  /**
   * Save a score. Returns { list, isRecord }.
   * playerName is optional — defaults to "Аноним" per spec (site is RU-primary;
   * callers in other languages may pass their own localized fallback instead).
   */
  function saveScore(ageGroup, difficulty, score, playerName) {
    const all = readJSON(LS_KEY, {});
    const k = key(ageGroup, difficulty);
    const list = all[k] || [];
    const isRecord = !list.length || score > list[0].score;
    list.push({
      name: (playerName || 'Аноним').slice(0, 16),
      score: Math.round(score),
      date: new Date().toISOString().slice(0, 10),
    });
    list.sort((a, b) => b.score - a.score);
    all[k] = list.slice(0, 10);
    writeJSON(LS_KEY, all);
    return { list: all[k], isRecord };
  }

  function getTopScores(ageGroup, difficulty, limit) {
    limit = limit || 10;
    const all = readJSON(LS_KEY, {});
    return (all[key(ageGroup, difficulty)] || []).slice(0, limit);
  }

  function getBest(ageGroup, difficulty) {
    const list = getTopScores(ageGroup, difficulty, 1);
    const n = list.length ? Number(list[0].score) : 0;   // stored data may be tampered: numbers only
    return Number.isFinite(n) ? n : 0;
  }

  window.KAT_Leaderboard = { saveScore, getTopScores, getBest };
})();
