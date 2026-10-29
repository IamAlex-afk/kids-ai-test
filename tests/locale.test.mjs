// Examples must work where the language is spoken: a voice assistant named on
// a page has to understand that language. Alexa does not speak Vietnamese,
// Indonesian or Turkish; Siri is not used as an example in Vietnamese and
// Indonesian. Checked 2026-10-28 (Google Assistant speaks Vietnamese since
// 2019; Kiki by Zalo is a Vietnamese voice assistant).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const NOT_HERE = { vi: /Alexa|Siri/, id: /Alexa|Siri/, tr: /Alexa/ };

test('locale: named voice assistants speak the language of the page', () => {
  for (const [l, re] of Object.entries(NOT_HERE)) {
    for (const f of [`${l}.html`, `data/${l}.js`, `js/parents-faq/${l}.js`]) assert.doesNotMatch(read(f), re, f);
    for (const n of fs.readdirSync(new URL(`lessons/${l}/`, root))) assert.doesNotMatch(read(`lessons/${l}/${n}`), re, `lessons/${l}/${n}`);
  }
});

test('locale: no source that only points to a company home page', () => {
  for (const l of ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'])
    assert.doesNotMatch(read(`data/${l}.js`), /Apple Siri Technical Overview|sourceUrl:\s*['"]https:\/\/machinelearning\.apple\.com\/['"]/, `data/${l}.js`);
});
