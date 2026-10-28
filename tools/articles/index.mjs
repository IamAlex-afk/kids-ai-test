// Article structure shared by all 10 languages: which source backs each fact
// and myth, how sure the conclusion is, where each age section leads. The
// texts live in tools/articles/<lang>.mjs and must match these lengths.
//   level: proven (research agrees) · data (there is evidence) ·
//          experts (expert guidance) · unknown (not known yet)
export const ARTICLE_LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
export const ARTICLES_LASTMOD = '2026-10-28';

export const ARTICLES = [
  {
    slug: 'what-is-ai',
    published: '2026-10-28',
    checked: '2026-10-28',
    audience: 'family',
    facts: [['lecun2015'], ['ai4k12'], ['ji2023'], ['euai50'], ['druga2017']],
    myths: [],
    level: 'data',
    // per age (5–7, 8–10, 11–13, 14+): a lesson or a Workshop activity
    links: ['lesson:5-7-1', 'lesson:8-10-1', 'lesson:11-13-1', 'lesson:14-plus-1'],
  },
  {
    slug: 'explain-ai-to-a-child',
    published: '2026-10-28',
    checked: '2026-10-28',
    audience: 'parents',
    facts: [['druga2017'], ['unicef2025'], ['unesco2024'], ['ji2023'], ['euai50']],
    myths: [['druga2017'], ['ji2023'], ['unicef2025'], ['unicef2025', 'unesco2024']],
    level: 'experts',
    links: ['workshop:sorter:5-7', 'workshop:sorter:8-10', 'workshop:check:11-13', 'workshop:share:14-plus'],
  },
];
