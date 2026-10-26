// Registry of the Workshop series — the single source for its pages,
// navigation, language links and sitemap (tools/gen-series.mjs) and for the
// "Start" card after the age choice (tools/gen-entry.mjs).
//
// Each entry: id, file, kind (engine module), skill, langs, review status,
// data (language-independent), sources [{url, title, supports{lang}}], text
// per language: common + age blocks (tiny, child, teen, adult) with goal,
// the new example (self-task) and the adult block.
//
// Honesty rules: review flags stay false until that review really happened;
// a language is listed in `langs` only when its text is complete.

import { sorter } from './series/sorter.mjs';
import { ru as sorterRu } from './series/sorter-ru.mjs';
import { en as sorterEn } from './series/sorter-en.mjs';
import { check } from './series/check.mjs';
import { ru as checkRu } from './series/check-ru.mjs';
import { en as checkEn } from './series/check-en.mjs';
import { share } from './series/share.mjs';
import { ru as shareRu } from './series/share-ru.mjs';
import { en as shareEn } from './series/share-en.mjs';

const SCENARIO = { scripts: ['workshop.js', 'workshop-scenario.js'], staticKeys: ['explain1', 'explain2', 'explain3', 'doneText'] };

// Date the series pages last changed in substance. Set by hand.
export const SERIES_LASTMOD = '2026-10-26';
export const SERIES_LANGS = ['ru', 'en'];

const withText = (entry, text, extra) => ({ ...entry, text, ...extra });

export const SERIES = [
  withText(sorter, { ru: sorterRu, en: sorterEn }, {
    scripts: ['sorter-model.js', 'workshop.js', 'workshop-sorter.js'],
    staticKeys: ['how', 'wrongWhy', 'tieNote', 'fixedWhy', 'sameWhy', 'doneText'],
    sample: false,
  }),
  withText(check, { ru: checkRu, en: checkEn }, SCENARIO),
  withText(share, { ru: shareRu, en: shareEn }, SCENARIO),
];

// Self-check of the registry (also run by tests): every listed language has
// every field the pages and the engine need, for every age.
export function validate(series = SERIES) {
  const problems = [];
  const need = ['title', 'desc', 'goal', 'noJs', 'adult'];
  for (const s of series) {
    for (const l of s.langs) {
      const t = s.text[l];
      if (!t) { problems.push(`${s.id}: no text for ${l}`); continue; }
      for (const k of need) if (!(k in t.common) && !['tiny', 'child', 'teen', 'adult'].every((a) => t[a] && k in t[a])) problems.push(`${s.id}/${l}: missing ${k}`);
      for (const a of ['tiny', 'child', 'teen', 'adult']) if (!(t[a] && t[a].goal) && !t.common.goal) problems.push(`${s.id}/${l}/${a}: no goal`);
      const ad = t.common.adult || {};
      for (const k of ['goal', 'questions', 'misconception', 'signs', 'method', 'print']) if (!(k in ad)) problems.push(`${s.id}/${l}: adult.${k}`);
      for (const k of s.staticKeys) if (!t.common[k]) problems.push(`${s.id}/${l}: static ${k}`);
      for (const src of s.sources) if (!src.supports[l]) problems.push(`${s.id}/${l}: source without "supports"`);
    }
    if (s.review.native || s.review.teacher || s.review.children) problems.push(`${s.id}: review flag set — only allowed after a real review`);
  }
  return problems;
}
