// Motion standard (owner rule 2026-11-11): animate only transform/opacity; no `transition: all`; no layout or paint
// properties (width/height/top/left/margin/padding/box-shadow/colours) in transitions; short durations; and every
// stylesheet with motion is switched off by prefers-reduced-motion (globally in main.css or locally).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const files = fs.readdirSync(new URL('css/', root)).filter((f) => f.endsWith('.css'));
const read = (f) => fs.readFileSync(new URL(`css/${f}`, root), 'utf8');
const decls = (css) => [...css.matchAll(/(?:^|[;{\s])transition\s*:\s*([^;}]+)/g)].map((m) => m[1].trim());
const ALLOWED = new Set(['transform', 'opacity', 'none', 'visibility']);

test('motion: no `transition: all` and only transform/opacity are animated', () => {
  for (const f of files) {
    for (const d of decls(read(f))) {
      for (const part of d.split(',')) {
        const prop = part.trim().split(/\s+/)[0];
        if (/^(none|var\(|\d|\.)/.test(prop) && !/^var\(/.test(prop)) continue; // "none", bare durations
        assert.ok(ALLOWED.has(prop), `css/${f}: transition on "${prop}" (${d}) — only transform/opacity`);
      }
    }
  }
});

test('motion: transitions are short (≤ 0.55 s; micro-interactions should be 0.1–0.25 s)', () => {
  for (const f of files) {
    for (const d of decls(read(f))) {
      for (const m of d.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
        const sec = m[2] === 'ms' ? Number(m[1]) / 1000 : Number(m[1]);
        assert.ok(sec <= 0.55, `css/${f}: ${d} — ${sec}s is too long`);
      }
    }
  }
});

test('motion: prefers-reduced-motion switches motion off', () => {
  const main = read('main.css');
  assert.match(main, /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\*,\s*\*::before,\s*\*::after\s*\{[^}]*transition-duration:\s*\.01ms/, 'main.css: global reduced-motion rule');
  for (const f of files) {
    const css = read(f);
    if (/@keyframes|transition\s*:/.test(css) && f !== 'main.css') assert.match(css, /prefers-reduced-motion/, `css/${f}: has motion but no reduced-motion rule`);
  }
});
