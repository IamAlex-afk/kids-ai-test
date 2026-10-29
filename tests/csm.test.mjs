// Common Sense Media is cited by report, not by its research listing page:
// "Talk, Trust, and Trade-Offs" (AI companions, July 2025) and "Teens, Trust,
// and Technology in the Age of AI" (January 2025), both read 2026-10-28.
// The old label "AI & Children, 2024" matched no report and must not return.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
test('sources: Common Sense Media by report, not by its listing page', () => {
  for (const l of ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi']) {
    const s = read(`data/${l}.js`);
    assert.doesNotMatch(s, /commonsensemedia\.org\/research['"]/, `data/${l}.js: listing page`);
    assert.doesNotMatch(s, /AI & Children|ИИ и дети|AI và Trẻ em/, `data/${l}.js: label of no existing report`);
  }
});
