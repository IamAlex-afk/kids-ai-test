// Teacher materials (tools/gen-teachers.mjs): pages match the generator; every description is used
// in full (a text over 160 characters gets silently cut to its first sentence); same structure as RU.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');
const { renderAll, TEACHERS_LANGS } = await import(new URL('tools/gen-teachers.mjs', root));
const { TT, AGE_SLUGS } = await import(new URL('tools/teachers/texts.mjs', root));
const { metaDesc, fitTitle } = await import(new URL('tools/gen-entry.mjs', root));

test('teachers: pages match tools/gen-teachers.mjs', () => {
  for (const [rel, body] of renderAll()) assert.equal(read(rel), body, `${rel} is out of date: run node tools/gen-teachers.mjs`);
});

test('teachers: every title and description is used in full, not cut', () => {
  for (const l of TEACHERS_LANGS) {
    const items = [['hub', TT[l].hub], ...AGE_SLUGS.map((s) => [s, TT[l].plans[s]])];
    for (const [k, x] of items) {
      assert.equal(metaDesc(x.desc, x.h1), x.desc.replace(/\s+/g, ' ').trim(), `${l} ${k}: description is cut — shorten it to 70–160 characters`);
      assert.equal(fitTitle(x.title), x.title, `${l} ${k}: title`);
      assert.ok([...x.title].length <= 60, `${l} ${k}: title ${[...x.title].length} > 60`);
    }
  }
});

test('teachers: same structure in every language as RU; lesson links exist; AI-made line present', () => {
  const ref = TT.ru;
  for (const l of TEACHERS_LANGS) {
    const t = TT[l];
    assert.deepEqual(Object.keys(t.ui).sort(), Object.keys(ref.ui).sort(), `${l}: ui keys`);
    assert.equal(t.hub.basis.length, ref.hub.basis.length, `${l}: basis`);
    for (const s of AGE_SLUGS) {
      const p = t.plans[s], r = ref.plans[s];
      assert.ok(p, `${l}: plan ${s}`);
      assert.equal(p.lesson, r.lesson, `${l} ${s}: same site lesson`);
      assert.ok(fs.existsSync(new URL(`lessons/${l}/${p.lesson}.html`, root)), `${l} ${s}: lesson page exists`);
      assert.equal(p.steps.reduce((n, [m]) => n + Number(m), 0), 45, `${l} ${s}: steps add up to 45 minutes`);
      assert.deepEqual(p.sources.map((x) => x.url), r.sources.map((x) => x.url), `${l} ${s}: same sources as RU`);
    }
    const h = read(`teachers/${l}/index.html`);
    assert.ok(h.includes('class="tc-made"') && h.includes('class="tc-disclaimer"'), `${l}: how-it-was-made line and disclaimer`);
  }
});
