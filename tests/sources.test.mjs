// A source has to be the document that backs the claim, not the home page of
// a website. These were found as home pages and replaced (2026-10-28):
// the EU AI Act -> its official text (EUR-Lex), the Stanford AI Index -> the
// 2024 report, the US Copyright Office -> report Part 2 (2025), MIT Media
// Lab -> the study on children and voice assistants.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const HOME_PAGES = /sourceUrl:\s*['"]https?:\/\/(artificialintelligenceact\.eu\/|aiindex\.stanford\.edu\/?|www\.copyright\.gov\/ai\/|www\.media\.mit\.edu\/)['"]/;

test('sources: no website home page in place of a document', () => {
  for (const l of LANGS) assert.doesNotMatch(read(`data/${l}.js`), HOME_PAGES, `data/${l}.js`);
});

test('sources: the AI-art lesson follows the US Copyright Office report (2025)', () => {
  for (const l of LANGS) {
    const s = read(`data/${l}.js`);
    assert.match(s, /Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report\.pdf/, `data/${l}.js: Part 2 source`);
    assert.match(s, /2025/, `data/${l}.js`);
  }
});
