// Article pages: one page per article and a catalog per language. Structure
// (which source backs which fact, conclusion level, links per age) comes from
// tools/articles/index.mjs, sources from tools/articles/sources.mjs, texts
// from tools/articles/<lang>.mjs. Facts carry numbered links to the sources;
// the site's own conclusion is labelled and never presented as a fact.
// No scripts on these pages. Never edit the generated files by hand.
//
//   articles/<lang>/index.html     catalog
//   articles/<lang>/<slug>.html    one article
//
// Also rewrites the article part of sitemap.xml (between the ARTICLES markers).
//
//   node tools/gen-articles.mjs           write articles/ and sitemap.xml
//   node tools/gen-articles.mjs --check   exit 1 if anything is out of date
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { header, pageOf, esc } from './gen-entry.mjs';
import { T } from './entry-i18n.mjs';
import { L } from './lesson-i18n.mjs';
import { ARTICLES, ARTICLE_LANGS, ARTICLES_LASTMOD } from './articles/index.mjs';
import { SOURCES } from './articles/sources.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
const AGE_SLUGS = ['5-7', '8-10', '11-13', '14-plus'];
const HTML_LANG = { pt: 'pt-BR' };
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none';";
const url = (l, file = '') => `${SITE}articles/${l}/${file}`;
const ld = (o) => `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

export async function loadTexts() {
  const out = {};
  for (const l of ARTICLE_LANGS) out[l] = (await import(new URL(`./articles/${l}.mjs`, import.meta.url))).default;
  return out;
}

function head(l, { title, desc, file, type = 'website' }) {
  const alt = ARTICLE_LANGS.map((x) => `  <link rel="alternate" hreflang="${x}" href="${url(x, file)}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${HTML_LANG[l] || l}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url(l, file)}">
${alt}
  <link rel="alternate" hreflang="x-default" href="${url('en', file)}">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url(l, file)}">
  <meta property="og:image" content="${SITE}og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../../favicon.ico" sizes="48x48">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="stylesheet" href="../../css/workshop.css">
  <link rel="stylesheet" href="../../css/lesson.css">
  <link rel="stylesheet" href="../../css/article.css">`;
}

function crumbs(l, items, lastIsPage = false) {
  return `    <nav class="wk-crumbs" aria-label="${esc(L[l].crumbs)}">
      <ol>
${items.map(([name, href], i) => `        <li><a href="${href}"${lastIsPage && i === items.length - 1 ? ' aria-current="page"' : ''}>${esc(name)}</a></li>`).join('\n')}
      </ol>
    </nav>`;
}

function footer(l) {
  return `<footer class="wk-foot">
  <div class="wk-foot-in">
    <p>${esc(L[l].privacy)}</p>
    <p><a href="../../lessons/${l}/">${esc(L[l].all)}</a></p>
    <p><a href="../../${pageOf(l)}#about">${esc(T[l].about)}</a></p>
  </div>
</footer>
</body>
</html>
`;
}

function linkFor(l, spec, u) {
  const [kind, a, b] = spec.split(':');
  return kind === 'lesson'
    ? `<a href="../../lessons/${l}/${a}.html">${esc(u.lessonLink)}</a>`
    : `<a href="../../workshop/${l}/${a}.html?age=${b}">${esc(u.workshopLink)}</a>`;
}

function articlePage(l, a, t, u) {
  const file = `${a.slug}.html`;
  const home = `../../${pageOf(l)}`;
  // Sources numbered in order of first use on the page.
  const order = [];
  for (const ids of [...a.facts, ...a.myths]) for (const id of ids) if (!order.includes(id)) order.push(id);
  const ref = (ids) => ids.map((id) => `<a class="ar-ref" href="#src-${order.indexOf(id) + 1}">[${order.indexOf(id) + 1}]</a>`).join('');
  const ages = t.ages.map((x, i) => `    <section class="ar-age" id="age-${AGE_SLUGS[i]}" aria-labelledby="ar-age-${i}">
      <h3 id="ar-age-${i}">${esc(L[l].ages[i])}</h3>
${i === 0 ? `      <p class="wk-tiny-note">${esc(u.tinyNote)}</p>\n` : ''}      <p class="ar-say-h">${esc(u.say)}</p>
      <ul class="ar-say">
${x.say.map((s) => `        <li>${esc(s)}</li>`).join('\n')}
      </ul>
      <p class="ar-try">${esc(u.tryIt)}: ${linkFor(l, a.links[i], u)}</p>
    </section>`).join('\n');
  const adult = t.adult ? `    <section class="wk-card ar-block ar-adult" aria-labelledby="ar-adult">
      <h2 id="ar-adult">${esc(u.adult)}</h2>
      <p><b>${esc(u.adultGoal)}:</b> ${esc(t.adult.goal)}</p>
      <p class="ar-say-h">${esc(u.adultAsk)}</p>
      <ul class="ar-say">
${t.adult.ask.map((s) => `        <li>${esc(s)}</li>`).join('\n')}
      </ul>
      <p><b>${esc(u.adultSigns)}:</b> ${esc(t.adult.signs)}</p>
    </section>\n` : '';
  const myths = t.myths.length ? `  <section class="wk-card ar-block" aria-labelledby="ar-myths">
    <h2 id="ar-myths">${esc(u.myths)}</h2>
    <dl class="ar-myths">
${t.myths.map((x, i) => `      <dt><span class="ar-tag">${esc(u.myth)}</span> ${esc(x.m)}</dt>
      <dd><span class="ar-tag ar-tag-ok">${esc(u.truth)}</span> ${esc(x.t)} ${ref(a.myths[i])}</dd>`).join('\n')}
    </dl>
  </section>\n` : '';
  const srcs = order.map((id, i) => {
    const s = SOURCES[id];
    return `      <li id="src-${i + 1}"><a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a> — ${esc(s.by)}, ${s.year}
        <blockquote lang="en"><span class="ar-tag">${esc(u.quote)}</span> “${esc(s.quote)}”</blockquote></li>`;
  }).join('\n');
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: t.title, description: t.desc,
    inLanguage: HTML_LANG[l] || l, datePublished: a.published, dateModified: a.checked, url: url(l, file),
    author: { '@type': 'Person', name: 'Alex Bitkin', url: 'https://github.com/IamAlex-afk' },
    isAccessibleForFree: true,
    citation: order.map((id) => ({ '@type': 'CreativeWork', name: SOURCES[id].title, url: SOURCES[id].url })),
  };
  return `${head(l, { title: `${t.title} | Kids AI Test`, desc: t.desc, file, type: 'article' })}
${ld(jsonld)}
</head>
<body class="wk-home wk-page">
${header(l, { home, langHref: (y) => `../${y}/${file}` })}
<main id="main" class="wk-lesson ar-main">
${crumbs(l, [[L[l].home, home], [u.all, './']])}
  <article class="ar-article" aria-labelledby="ar-title">
    <p class="wk-meta"><span>${esc(u.audience[a.audience])}</span><span>${esc(u.published)}: <time datetime="${a.published}">${a.published}</time> · ${esc(u.checked)}: <time datetime="${a.checked}">${a.checked}</time></span></p>
    <h1 class="wk-lesson-title" id="ar-title">${esc(t.title)}</h1>
    <p class="wk-text ar-lead">${esc(t.lead)}</p>
    <section class="wk-card ar-block" aria-labelledby="ar-facts">
      <h2 id="ar-facts">${esc(u.facts)}</h2>
      <ul class="ar-facts">
${t.facts.map((f, i) => `        <li>${esc(f)} ${ref(a.facts[i])}</li>`).join('\n')}
      </ul>
    </section>
    <section class="wk-card ar-block" aria-labelledby="ar-ages">
      <h2 id="ar-ages">${esc(u.ages)}</h2>
${ages}
    </section>
${adult}${myths}    <section class="wk-card ar-block ar-conclusion" aria-labelledby="ar-concl">
      <h2 id="ar-concl">${esc(u.conclusion)}</h2>
      <p>${esc(t.conclusion)}</p>
      <p class="ar-level">${esc(u.levelLabel)}: <b>${esc(u.levels[a.level])}</b></p>
    </section>
    <section class="ar-block ar-sources" aria-labelledby="ar-src">
      <h2 id="ar-src">${esc(u.sources)}</h2>
      <p class="ar-honesty">${esc(u.honesty)}</p>
      <ol>
${srcs}
      </ol>
    </section>
  </article>
</main>
${footer(l)}`;
}

function catalogPage(l, texts) {
  const u = texts.ui;
  const home = `../../${pageOf(l)}`;
  return `${head(l, { title: `${u.catTitle} | Kids AI Test`, desc: u.catDesc, file: '' })}
</head>
<body class="wk-home wk-page">
${header(l, { home, langHref: (y) => `../${y}/` })}
<main id="main" class="wk-lesson wk-catalog ar-main">
${crumbs(l, [[L[l].home, home], [u.all, './']], true)}
  <h1 class="wk-cat-title">${esc(u.catTitle)}</h1>
  <p class="wk-cat-lead">${esc(u.catLead)}</p>
  <ul class="ar-cat">
${ARTICLES.map((a) => `    <li class="wk-card"><a href="${a.slug}.html"><span class="ar-tag">${esc(u.audience[a.audience])}</span> <b>${esc(texts[a.slug].title)}</b></a><p>${esc(texts[a.slug].desc)}</p></li>`).join('\n')}
  </ul>
</main>
${footer(l)}`;
}

export async function renderAll() {
  const texts = await loadTexts();
  const out = new Map();
  for (const l of ARTICLE_LANGS) {
    out.set(`articles/${l}/index.html`, catalogPage(l, texts[l]));
    for (const a of ARTICLES) out.set(`articles/${l}/${a.slug}.html`, articlePage(l, a, texts[l][a.slug], texts[l].ui));
  }
  return out;
}

export function renderSitemap(xml, files) {
  const re = /(<!-- ARTICLES: generated by tools\/gen-articles\.mjs -->)[\s\S]*?(<!-- \/ARTICLES -->)/;
  if (!re.test(xml)) throw new Error('sitemap.xml: missing ARTICLES markers');
  const block = [...files.keys()].map((f) => `  <url>\n    <loc>${SITE + f.replace(/index\.html$/, '')}</loc>\n    <lastmod>${ARTICLES_LASTMOD}</lastmod>\n  </url>`).join('\n');
  return xml.replace(re, `$1\n${block}\n  $2`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  const files = await renderAll();
  const stale = [];
  const write = (rel, body) => {
    const abs = path.join(ROOT, rel);
    // CRLF from a Windows checkout (core.autocrlf) is not a difference
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null;
    if (cur === body) return;
    if (checkOnly) { stale.push(rel); return; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  };
  for (const [rel, body] of files) write(rel, body);
  for (const l of ARTICLE_LANGS) {
    const dir = path.join(ROOT, 'articles', l);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const rel = `articles/${l}/${name}`;
      if (files.has(rel)) continue;
      if (checkOnly) stale.push(rel + ' (not generated any more)');
      else fs.rmSync(path.join(ROOT, rel));
    }
  }
  write('sitemap.xml', renderSitemap(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').replace(/\r\n/g, '\n'), files));
  if (checkOnly && stale.length) { console.error('Out of date (run node tools/gen-articles.mjs):\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log(checkOnly ? `article pages up to date (${files.size})` : `article pages written (${files.size})`);
}
