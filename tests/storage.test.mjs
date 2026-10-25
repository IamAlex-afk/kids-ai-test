// js/storage.js in a sandbox: consent, revocation from another tab,
// quota/partial writes, corrupted data, legacy saves, foreign keys.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = fs.readFileSync(new URL('../js/storage.js', import.meta.url), 'utf8');
// Objects built inside the vm belong to another realm; compare as plain JSON.
const plain = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));

// Minimal Web Storage. `shared` lets two "tabs" use one localStorage.
function makeStorage({ quota = Infinity, broken = false, shared } = {}) {
  const map = shared || new Map();
  const size = () => [...map].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    _map: map,
    get length() { if (broken) throw new Error('SecurityError'); return map.size; },
    key(i) { return [...map.keys()][i] ?? null; },
    getItem(k) { if (broken) throw new Error('SecurityError'); return map.has(k) ? map.get(k) : null; },
    setItem(k, v) {
      if (broken) throw new Error('SecurityError');
      v = String(v);
      const old = map.get(k);
      map.set(k, v);
      if (size() > quota) { if (old === undefined) map.delete(k); else map.set(k, old); throw new Error('QuotaExceededError'); }
    },
    removeItem(k) { if (broken) throw new Error('SecurityError'); map.delete(k); },
    clear() { throw new Error('clear() must never be called'); },
  };
}

function tab({ ls = makeStorage(), ss = makeStorage() } = {}) {
  const handlers = [];
  const window = {
    localStorage: ls, sessionStorage: ss,
    addEventListener: (t, fn) => { if (t === 'storage') handlers.push(fn); },
  };
  vm.runInNewContext(SRC, { window });
  return { Store: window.KAT_Store, ls, ss, fireStorage: (e) => handlers.forEach(h => h(e)) };
}

test('default: progress goes to tab memory, never to localStorage', () => {
  const { Store, ls, ss } = tab();
  Store.writeJSON('kat_v1', { age: 'child' });
  assert.equal(ls._map.size, 0);
  assert.deepEqual(JSON.parse(ss.getItem('kat_v1')), { age: 'child' });
  assert.deepEqual(plain(Store.readJSON('kat_v1', null)), { age: 'child' });
  assert.equal(Store.status().device, false);
});

test('enable: copies tab progress to the device, writes go there after', () => {
  const { Store, ls } = tab();
  Store.writeJSON('kat_v1', { a: 1 });
  assert.equal(Store.enableDevice(), true);
  assert.equal(ls.getItem('kat_consent_v1'), '1');
  assert.equal(ls.getItem('kat_v1'), '{"a":1}');
  Store.writeJSON('kat_pf_stars_v1', { tiny: { 0: 3 } });
  assert.ok(ls.getItem('kat_pf_stars_v1'));
});

test('disable: deletes only our keys, foreign keys on the shared origin survive', () => {
  const { Store, ls } = tab();
  ls.setItem('ai_lab_progress', 'other project');
  ls.setItem('kat_thing_not_ours', 'unknown key');
  Store.enableDevice();
  Store.writeJSON('kat_v1', { a: 1 });
  Store.writeJSON('kat_race_skin', 'cyan');
  Store.disableDevice();
  assert.equal(ls.getItem('kat_v1'), null);
  assert.equal(ls.getItem('kat_race_skin'), null);
  assert.equal(ls.getItem('kat_consent_v1'), null);
  assert.equal(ls.getItem('ai_lab_progress'), 'other project');
  assert.equal(ls.getItem('kat_thing_not_ours'), 'unknown key');
  // current tab keeps working
  assert.deepEqual(plain(Store.readJSON('kat_v1', null)), { a: 1 });
});

test('revoked in another tab: this tab stops writing to the device', () => {
  const shared = new Map();
  const A = tab({ ls: makeStorage({ shared }) });
  const B = tab({ ls: makeStorage({ shared }) });
  A.Store.enableDevice();
  B.Store.writeJSON('kat_v1', { b: 1 });
  assert.ok(shared.has('kat_v1'), 'B saw consent from A');
  A.Store.disableDevice();
  let changed = 0; B.Store.onChange(() => changed++);
  B.fireStorage({ key: 'kat_consent_v1', newValue: null });
  assert.equal(changed, 1);
  B.Store.writeJSON('kat_v1', { b: 2 });
  assert.equal(shared.has('kat_v1'), false, 'no write after revocation');
  assert.deepEqual(plain(B.Store.readJSON('kat_v1', null)), { b: 2 }, 'kept in tab memory');
});

test('quota while enabling: partial copy rolled back, no consent flag left', () => {
  const ls = makeStorage({ quota: 40 });
  const { Store } = tab({ ls });
  Store.writeJSON('kat_v1', { big: 'x'.repeat(10) });
  Store.writeJSON('kat_stats', [{ more: 'y'.repeat(30) }]);
  assert.equal(Store.enableDevice(), false);
  assert.equal(ls._map.size, 0);
  assert.equal(Store.status().error, 'quota');
});

test('quota during normal device saving: value kept in tab, error reported', () => {
  const ls = makeStorage({ quota: 60 });
  const { Store } = tab({ ls });
  Store.enableDevice();
  Store.writeJSON('kat_v1', { big: 'z'.repeat(80) });
  assert.equal(Store.status().error, 'quota');
  assert.deepEqual(plain(Store.readJSON('kat_v1', null)), { big: 'z'.repeat(80) });
});

test('storage unavailable: no crash, tab memory only', () => {
  const { Store } = tab({ ls: makeStorage({ broken: true }), ss: makeStorage({ broken: true }) });
  Store.writeJSON('kat_v1', { a: 1 });
  assert.deepEqual(plain(Store.readJSON('kat_v1', null)), { a: 1 });
  assert.equal(Store.enableDevice(), false);
  const s = Store.status();
  assert.equal(s.available, false);
  assert.equal(s.tabOnly, true);
});

test('corrupted saved value → fallback, no exception', () => {
  const ls = makeStorage();
  ls.setItem('kat_consent_v1', '1');
  ls.setItem('kat_v1', '{"broken');
  const { Store } = tab({ ls });
  assert.equal(Store.readJSON('kat_v1', 'fallback'), 'fallback');
});

test('legacy saves (no consent) are neither read nor overwritten until a choice', () => {
  const ls = makeStorage();
  ls.setItem('kat_v1', '{"age":"teen"}');
  const { Store } = tab({ ls });
  assert.equal(Store.status().legacy, true);
  assert.equal(Store.readJSON('kat_v1', null), null);
  Store.writeJSON('kat_v1', { age: 'tiny' });
  assert.equal(ls.getItem('kat_v1'), '{"age":"teen"}');
  Store.keepLegacy();
  assert.equal(Store.status().device, true);
  assert.equal(Store.readJSON('kat_v1', null).age, 'teen');
});

test('markup injected into storage by another site on the origin is neutralised', () => {
  const ls = makeStorage();
  ls.setItem('kat_consent_v1', '1');
  ls.setItem('kat_leaderboard_v1', JSON.stringify({ child_1: [{ name: '<img src=x onerror=alert(1)>', score: '<b>9</b>' }], __proto__x: 1 }));
  ls.setItem('kat_pf_streak_v1', '{"__proto__":{"polluted":true},"count":3}');
  const { Store } = tab({ ls });
  const lb = Store.readJSON('kat_leaderboard_v1', {});
  assert.equal(lb.child_1[0].name.includes('<'), false);
  assert.equal(String(lb.child_1[0].score).includes('<'), false);
  const st = Store.readJSON('kat_pf_streak_v1', {});
  assert.equal(st.count, 3);
  assert.equal(({}).polluted, undefined);
});

test('legacy delete removes device keys only', () => {
  const ls = makeStorage();
  ls.setItem('kat_v1', '{"age":"teen"}');
  ls.setItem('ai_lab_progress', 'x');
  const { Store } = tab({ ls });
  Store.deleteDevice();
  assert.equal(ls.getItem('kat_v1'), null);
  assert.equal(ls.getItem('ai_lab_progress'), 'x');
  assert.equal(Store.status().legacy, false);
});
