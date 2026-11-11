// Grammar/spelling report with a LOCAL LanguageTool server (started by .github/workflows/grammar.yml).
// Report only: writes lt-out/report.md (+ job summary); never edits pages, never fails the run.
// Only the languages LanguageTool supports (dev.languagetool.org/languages, checked 2026-11-11):
// en ru de es fr pt. Not supported: hi id tr vi — those need a native reader.
//   node tools/lt-check.mjs [teachers|privacy|lessons|articles|all] [--server http://localhost:8081]
import fs from 'node:fs';
import path from 'node:path';

const scope = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2] : 'teachers';
const si = process.argv.indexOf('--server');
const SERVER = si > 0 ? process.argv[si + 1] : 'http://localhost:8081';
const LT = { en: 'en-US', ru: 'ru-RU', de: 'de-DE', es: 'es', fr: 'fr', pt: 'pt-BR' };
// Formatting rules that only fire on our layout (lists glued into one text), not on language.
const DISABLED = ['WHITESPACE_RULE', 'COMMA_PARENTHESIS_WHITESPACE', 'UPPERCASE_SENTENCE_START', 'PUNCTUATION_PARAGRAPH_END',
  'DOUBLE_PUNCTUATION', 'EN_QUOTES', 'DASH_RULE', 'FRENCH_WHITESPACE', 'TYPOGRAPHY'].join(',');
const DIRS = { teachers: 'teachers', privacy: 'privacy', lessons: 'lessons', articles: 'articles' };
const sections = scope === 'all' ? Object.values(DIRS) : [DIRS[scope]];
if (sections.includes(undefined)) { console.error(`unknown scope: ${scope}`); process.exit(2); }

const ENT = { nbsp: ' ', '#160': ' ', quot: '"', '#39': "'", apos: "'", amp: '&', lt: '<', gt: '>' };
const text = (html) => {
  const main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
  return main.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<\/(p|li|h[1-6]|summary|figcaption|td|th)>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|#160|quot|#39|apos|amp|lt|gt);/g, (_, e) => ENT[e]) // one pass: no double unescaping
    .split('\n').map((s) => s.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
};

async function check(lang, body) {
  const form = new URLSearchParams({ language: LT[lang], text: body, disabledRules: DISABLED });
  const r = await fetch(`${SERVER}/v2/check`, { method: 'POST', body: form });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).matches || [];
}

const rows = [];
let pages = 0;
for (const sec of sections) {
  for (const lang of Object.keys(LT)) {
    const dir = path.join(sec, lang);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html')).sort()) {
      const t = text(fs.readFileSync(path.join(dir, f), 'utf8'));
      let matches;
      try { matches = await check(lang, t); } catch (e) { rows.push([`${dir}/${f}`, '—', 'ERROR', e.message, '']); continue; }
      pages++;
      for (const m of matches) {
        const ctx = m.context.text.slice(Math.max(0, m.context.offset - 30), m.context.offset + m.context.length + 30).replace(/\|/g, '/');
        const fix = (m.replacements || []).slice(0, 3).map((x) => x.value).join(' / ');
        rows.push([`${dir}/${f}`, m.rule.id, m.rule.category?.id || '', ctx, fix]);
      }
    }
  }
}

const out = [`# LanguageTool report (${scope})`, '',
  `Pages checked: ${pages}. Findings: ${rows.length}. Languages: ${Object.keys(LT).join(', ')} (hi, id, tr, vi not supported).`,
  'Many findings are false positives (names, terms, quotes). Each one is checked by hand before any edit.', '',
  '| Page | Rule | Category | Context | Suggestion |', '|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
fs.mkdirSync('lt-out', { recursive: true });
fs.writeFileSync('lt-out/report.md', out + '\n');
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out.slice(0, 900000) + '\n');
console.log(`checked ${pages} pages, ${rows.length} findings → lt-out/report.md`);
