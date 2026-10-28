// Renders the shared header and the entry screens (audience → age) into all
// 10 language pages, between these markers:
//   <!-- WK:HEADER --> … <!-- /WK:HEADER -->
//   <!-- WK:ENTRY -->  … <!-- /WK:ENTRY -->
// Text lives in tools/entry-i18n.mjs, behaviour in js/entry.js, styles in
// css/workshop.css. Never edit the generated blocks in the pages by hand.
//
//   node tools/gen-entry.mjs           rewrite the pages
//   node tools/gen-entry.mjs --check   exit 1 if a page is out of date

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { T, LANG_NAMES } from './entry-i18n.mjs';
import { SERIES, SERIES_LANGS } from './series.mjs';
import { UI as SERIES_UI } from './series/ui.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
export const pageOf = (l) => (l === 'en' ? 'index.html' : `${l}.html`);
const AGES = [['tiny', '5–7'], ['child', '8–10'], ['teen', '11–13'], ['adult', '14+']];

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const GLOBE = '<svg class="wk-globe" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';

// home: the brand link; langHref(x): where the language menu leads (the same
// page in language x). Lesson pages (tools/gen-lessons.mjs) pass their own.
export function header(l, { home = pageOf(l), langHref = pageOf } = {}) {
  const t = T[l];
  const opts = LANGS.map((x) => `          <a class="lang-opt${x === l ? ' active' : ''}" href="${langHref(x)}" lang="${x}" hreflang="${x}"${x === l ? ' aria-current="page"' : ''}>${esc(LANG_NAMES[x])}</a>`).join('\n');
  return `<a class="wk-skip" href="#main">${esc(t.skip)}</a>
<header class="wk-header">
  <div class="wk-header-in">
    <a class="wk-brand" href="${home}" data-wk-home>
      <span class="wk-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <span class="wk-brand-txt"><span class="wk-brand-name">kids ai test</span><span class="wk-brand-sub">${esc(t.brandSub)}</span></span>
    </a>
    <div class="wk-actions">
      <div class="lang-switcher" id="lang-switcher">
        <button type="button" class="lang-globe" id="lang-globe" aria-expanded="false" aria-controls="lang-dropdown" aria-label="${esc(t.langLabel)}: ${esc(LANG_NAMES[l])}">${GLOBE}<span class="lang-full">${esc(LANG_NAMES[l])}</span><span class="lang-short">${l.toUpperCase()}</span><span class="lang-arrow" aria-hidden="true">▾</span></button>
        <div class="lang-dropdown" id="lang-dropdown">
${opts}
        </div>
      </div>
    </div>
  </div>
</header>`;
}

const SLUGS = { tiny: '5-7', child: '8-10', teen: '11-13', adult: '14-plus' };
function lessonData(l) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', `${l}.js`), 'utf8'), ctx);
  return ctx.window.LANG_DATA;
}

// Third screen (kids): ONE recommended activity per age with "Start", then
// the other activities, all lessons of the age and the older lessons-with-
// quiz route (core.js). The recommendation comes from the Workshop registry
// where the language has the series, else the first existing lesson.
function route(l) {
  const t = T[l];
  const series = SERIES.filter((s) => s.langs.includes(l));
  const data = series.length ? null : lessonData(l);
  const blocks = AGES.map(([k], i) => {
    const slug = SLUGS[k];
    let title, goal, href;
    if (series.length) {
      const s = series[0], tx = s.text[l];
      title = tx.common.title; goal = (tx[k] && tx[k].goal) || tx.common.goal;
      href = `workshop/${l}/${s.file}?age=${slug}`;
    } else {
      const x = data.ages[k].lessons[0];
      title = x.title; goal = t.ages[i];
      href = `lessons/${l}/${slug}-1.html`;
    }
    const more = series.slice(1).map((s) => `            <li><a href="workshop/${l}/${s.file}?age=${slug}">${esc(s.text[l].common.title)}</a></li>`);
    more.push(`            <li><a href="lessons/${l}/#age-${slug}">${esc(t.ageLessons)}</a></li>`);
    return `      <div class="wk-route-age" data-route-for="${k}" hidden>
        <div class="wk-start">
          <p class="wk-start-badge">${esc(t.startBadge)}</p>
          <h3 class="wk-start-t">${esc(title)}</h3>
          <p class="wk-start-d">${esc(goal)}</p>
          <a class="wk-start-go" href="${href}">${esc(t.startBtn)} →</a>
        </div>
        <h3 class="wk-route-h">${esc(t.otherH)}</h3>
        <ul class="wk-route-list">
${more.join('\n')}
        </ul>
      </div>`;
  }).join('\n');
  return `    <div class="wk-screen" id="wk-route" hidden>
      <button type="button" class="wk-back" data-wk-change>${esc(t.change)}</button>
      <h2 class="wk-q" tabindex="-1">${esc(t.routeQ)}</h2>
      <p class="wk-route-now">${esc(t.ageNow)}: <b data-route-label></b></p>
      <button type="button" class="wk-games-go" data-wk-games>🎮 ${esc(t.allGames)} →</button>
${blocks}
      <p class="wk-route-old"><button type="button" class="wk-link" data-wk-old>${esc(t.oldRoute)} →</button></p>
${t.seriesNote ? `      <p class="wk-note">${esc(t.seriesNote)}</p>\n` : ''}    </div>`;
}

function entry(l) {
  const t = T[l];
  const at = t.h1b.indexOf(t.hl);
  if (at < 0) throw new Error(`${l}: h1b does not contain hl`);
  const h1b = esc(t.h1b.slice(0, at)) + `<em>${esc(t.hl)}</em>` + esc(t.h1b.slice(at + t.hl.length));
  const steps = t.steps.map((s, i) => `      <li data-step="${i + 1}"${i === 0 ? ' aria-current="step"' : ''}><b>${i + 1}</b><span>${esc(s)}</span></li>`).join('\n');
  const ages = AGES.map(([k, label], i) => `        <button type="button" class="wk-age" data-age="${k}">
          <span class="age-label">${label}</span>
          <span class="wk-age-d">${esc(t.ages[i])}</span>
        </button>`).join('\n');
  return `<section id="entry" class="wk-entry" data-screen="audience" aria-labelledby="wk-title">
    <div class="wk-hero">
      <div class="wk-hero-text">
        <p class="wk-eyebrow">${esc(t.eyebrow)}</p>
        <h1 class="wk-title" id="wk-title">${esc(t.h1a)}<br>${h1b}</h1>
        <p class="wk-lead">${esc(t.lead)}</p>
      </div>
      <figure class="wk-hero-art">
        <picture>
          <source media="(max-width: 760px)" srcset="assets/workshop/hero-small.webp" width="660" height="440">
          <img src="assets/workshop/hero.webp" width="1200" height="800" alt="" decoding="async" fetchpriority="high">
        </picture>
        <figcaption>${esc(t.caption)}</figcaption>
      </figure>
    </div>

    <ol class="wk-steps" aria-label="${esc(t.path)}">
${steps}
    </ol>

    <div class="wk-screen" id="wk-audience">
      <h2 class="wk-q" tabindex="-1">${esc(t.q)}</h2>
      <div class="wk-aud-grid">
        <button type="button" class="wk-aud wk-aud-kids" data-audience="kids">
          <span class="wk-aud-t">${esc(t.kidsT)}</span>
          <span class="wk-aud-d">${esc(t.kidsD)}</span>
          <span class="wk-aud-a">${esc(t.kidsA)}</span>
        </button>
        <button type="button" class="wk-aud wk-aud-parents" data-audience="parents">
          <span class="wk-aud-t">${esc(t.parT)}</span>
          <span class="wk-aud-d">${esc(t.parD)}</span>
          <span class="wk-aud-a">${esc(t.parA)}</span>
        </button>
      </div>
      <ul class="wk-facts">
${t.facts.map((f) => `        <li>${esc(f)}</li>`).join('\n')}
      </ul>
      <p class="wk-about">${SERIES_LANGS.includes(l) ? `<a href="workshop/${l}/">${esc(SERIES_UI[l].catalog)}</a>` : ''}<a href="lessons/${l}/">${esc(t.allLessons)}</a><a href="#about">${esc(t.about)}</a></p>
    </div>

    <div class="wk-screen" id="wk-age" hidden>
      <button type="button" class="wk-back" data-wk-back>${esc(t.back)}</button>
      <h2 class="wk-q" tabindex="-1"><span data-for="kids">${esc(t.ageKid)}</span><span data-for="parents" hidden>${esc(t.agePar)}</span></h2>
      <div class="wk-age-grid">
${ages}
      </div>
      <p class="wk-note">${esc(t.note)}</p>
      <p class="wk-under5" data-for="parents" hidden>${esc(t.u5q)} <button type="button" class="wk-link" data-wk-under5>${esc(t.u5a)}</button></p>
    </div>

${route(l)}
  </section>

  <nav class="wk-hubbar" id="wk-hubbar" aria-label="${esc(t.path)}" hidden>
    <button type="button" class="wk-back" data-wk-change>${esc(t.change)}</button>
    <span class="wk-hub-age" hidden>${esc(t.ageNow)}: <b></b></span>
    <a class="wk-home-link" href="${pageOf(l)}" data-wk-home>${esc(t.home)}</a>
  </nav>`;
}

function replaceBlock(html, name, body, file) {
  const re = new RegExp(`(<!-- WK:${name} -->)[\\s\\S]*?(<!-- /WK:${name} -->)`);
  if (!re.test(html)) throw new Error(`${file}: missing <!-- WK:${name} --> markers`);
  return html.replace(re, `$1\n${body}\n$2`);
}

export function render(l, html) {
  const file = pageOf(l);
  html = replaceBlock(html, 'HEADER', header(l), file);
  return replaceBlock(html, 'ENTRY', '  ' + entry(l) + '\n  ', file);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  let stale = [];
  for (const l of LANGS) {
    const file = path.join(ROOT, pageOf(l));
    // CRLF from a Windows checkout (core.autocrlf) is not a difference
    const html = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const out = render(l, html);
    if (out === html) continue;
    if (check) stale.push(pageOf(l)); else fs.writeFileSync(file, out);
  }
  if (check && stale.length) { console.error('Out of date (run node tools/gen-entry.mjs): ' + stale.join(', ')); process.exit(1); }
  console.log(check ? 'entry blocks up to date' : 'entry blocks written');
}
