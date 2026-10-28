// Articles (tools/gen-articles.mjs): pages match the generator; every fact
// and myth rests on a registered, read source; every language has the same
// structure as the shared one; links lead to pages that exist; no scripts.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');
const exists = (p) => fs.existsSync(new URL(p, root));
const { ARTICLES, ARTICLE_LANGS } = await import(new URL('tools/articles/index.mjs', root));
const { SOURCES } = await import(new URL('tools/articles/sources.mjs', root));
const { renderAll, loadTexts } = await import(new URL('tools/gen-articles.mjs', root));
const texts = await loadTexts();
const LEVELS = ['proven', 'data', 'experts', 'unknown'];

test('articles: pages match tools/gen-articles.mjs, nothing extra', async () => {
  const files = await renderAll();
  for (const [rel, body] of files) assert.equal(read(rel), body, `${rel} is out of date: run node tools/gen-articles.mjs`);
  for (const l of ARTICLE_LANGS) for (const name of fs.readdirSync(new URL(`articles/${l}/`, root)))
    assert.ok(files.has(`articles/${l}/${name}`), `articles/${l}/${name}: not generated`);
});

test('articles: every source is registered, read and quoted', () => {
  for (const [id, s] of Object.entries(SOURCES)) {
    for (const k of ['title', 'by', 'year', 'url', 'quote', 'where', 'checked']) assert.ok(s[k], `${id}.${k}`);
    assert.match(s.url, /^https:\/\//, `${id}: https`);
    assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/, `${id}: checked date`);
  }
  for (const a of ARTICLES) {
    assert.ok(LEVELS.includes(a.level), `${a.slug}: level`);
    assert.equal(a.links.length, 4, `${a.slug}: a link for each of the 4 ages`);
    for (const ids of [...a.facts, ...a.myths]) {
      assert.ok(ids.length > 0, `${a.slug}: every fact and myth has a source`);
      for (const id of ids) assert.ok(SOURCES[id], `${a.slug}: unknown source ${id}`);
    }
  }
});

test('articles: same structure and UI keys in every language', () => {
  const uiKeys = Object.keys(texts.en.ui).sort();
  for (const l of ARTICLE_LANGS) {
    assert.deepEqual(Object.keys(texts[l].ui).sort(), uiKeys, `${l}: ui keys`);
    assert.deepEqual(Object.keys(texts[l].ui.levels).sort(), [...LEVELS].sort(), `${l}: level labels`);
    for (const a of ARTICLES) {
      const t = texts[l][a.slug];
      const at = `tools/articles/${l}.mjs ${a.slug}`;
      assert.ok(t, at);
      for (const k of ['title', 'desc', 'lead', 'conclusion']) assert.ok(typeof t[k] === 'string' && t[k].trim(), `${at}: ${k}`);
      assert.equal(t.facts.length, a.facts.length, `${at}: facts`);
      assert.equal(t.myths.length, a.myths.length, `${at}: myths`);
      assert.equal(t.ages.length, 4, `${at}: 4 ages`);
      for (const [i, x] of t.ages.entries()) assert.equal(x.say.length, texts.ru[a.slug].ages[i].say.length, `${at}: age ${i} phrases as in RU`);
      for (const m of t.myths) assert.ok(m.m && m.t, `${at}: myth and answer`);
      assert.ok(t.desc.length <= 230, `${at}: description length ${t.desc.length}`);
    }
  }
});

test('articles: family articles have the adult block (goal, questions, signs) in every language', () => {
  for (const l of ARTICLE_LANGS) for (const a of ARTICLES.filter((x) => x.audience === 'family')) {
    const x = texts[l][a.slug].adult;
    assert.ok(x && x.goal && x.signs && x.ask.length === texts.ru[a.slug].adult.ask.length, `tools/articles/${l}.mjs ${a.slug}: adult block`);
  }
});

// Found in review (docs/CONTENT-REVIEW.md): gendered forms addressed to the
// child, and two overstatements of the sources. They must not come back.
test('articles: corrected wording does not come back', () => {
  const wrong = {
    ru: /ты сам\b|подумай сам|думаешь сам|ещё не понял\b|я научился|легко приписыва|установила возраст/,
    en: /easily give it|sets an age limit of 13/,
    de: /leicht eine „Persönlichkeit“|legt [^.]*Altersgrenze von 13 Jahren[^.]* fest/,
    es: /atribuyen fácilmente|fija una edad mínima/,
    fr: /tout seul|prêtent facilement|celui qui s’est rappelé|fixent un âge minimum/,
    pt: /sozinho|facilmente atribuem|estabelece a idade mínima/,
    id: /mudah memberinya|menetapkan batas usia 13/,
    tr: /kolayca bir "kişilik"|13 yaş sınırı koyar/,
    hi: /आसानी से "व्यक्तित्व"|उम्र-सीमा तय की गई/,
    vi: /dễ gán cho nó|đặt giới hạn độ tuổi 13/,
  };
  for (const l of ARTICLE_LANGS) assert.doesNotMatch(read(`tools/articles/${l}.mjs`), wrong[l], `tools/articles/${l}.mjs`);
});

test('articles: links lead to existing pages; hreflang, canonical, no scripts', () => {
  for (const l of ARTICLE_LANGS) for (const a of ARTICLES) {
    const file = `articles/${l}/${a.slug}.html`;
    const html = read(file);
    for (const [, href] of html.matchAll(/href="(\.\.\/\.\.\/[^"#?]+)/g)) {
      const target = new URL(href.replace(/^\.\.\/\.\.\//, ''), root);
      assert.ok(fs.existsSync(target.pathname.endsWith('/') ? new URL('index.html', target) : target), `${file} → ${href}`);
    }
    assert.match(html, new RegExp(`rel="canonical" href="https://iamalex-afk.github.io/kids-ai-test/${file}"`), `${file}: canonical`);
    for (const x of ARTICLE_LANGS) assert.ok(html.includes(`hreflang="${x}" href="https://iamalex-afk.github.io/kids-ai-test/articles/${x}/${a.slug}.html"`), `${file}: hreflang ${x}`);
    assert.doesNotMatch(html, /<script(?! type="application\/ld\+json")/, `${file}: no scripts`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${file}: one h1`);
    assert.ok(exists(`lessons/${l}/index.html`), `lessons/${l}`);
  }
});

test('home pages link to the articles of their language', () => {
  for (const l of ARTICLE_LANGS) {
    const page = l === 'en' ? 'index.html' : `${l}.html`;
    assert.ok(read(page).includes(`<a href="articles/${l}/">`), `${page} → articles/${l}/`);
  }
});
