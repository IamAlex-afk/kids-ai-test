// Shared helpers for the browser checks. Expected texts come from explicit
// language sets: the entry screens from tools/entry-i18n.mjs (the generator's
// own source), the game names from js/core.js GAME_PICKER_STR (copied below,
// without the emoji). A renamed game must be updated here on purpose.
import { expect } from '@playwright/test';
import { T } from '../../tools/entry-i18n.mjs';

export { T };
export const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
export const AGES = [['tiny', '5–7'], ['child', '8–10'], ['teen', '11–13'], ['adult', '14+']];
export const pageOf = (l) => (l === 'en' ? 'index.html' : `${l}.html`);

export const GAME_NAMES = {
  en: { snake: 'AI Snake', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  ru: { snake: 'AI Змейка', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  de: { snake: 'KI-Schlange', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  es: { snake: 'Serpiente IA', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  fr: { snake: 'Serpent IA', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  hi: { snake: 'AI साँप', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  id: { snake: 'Ular AI', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  pt: { snake: 'Cobra IA', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  tr: { snake: 'AI Yılanı', runner: 'Circuit Runner', racer: 'Circuit Racer' },
  vi: { snake: 'Rắn AI', runner: 'Circuit Runner', racer: 'Circuit Racer' },
};

// Collects uncaught page errors and failed requests to our own origin.
// Aborted requests (audio/navigation cancelled on purpose) are not failures.
export function watchErrors(page) {
  const errors = [];
  const own = (url) => url.startsWith('http://127.0.0.1:');
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => { if (own(r.url()) && r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText || '';
    if (own(r.url()) && !/ERR_ABORTED/.test(f)) errors.push(`request failed (${f}): ${r.url()}`);
  });
  return errors;
}

export async function noHorizontalOverflow(page, where) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw, `${where}: horizontal overflow (scrollWidth ${sw} > clientWidth ${cw})`).toBeLessThanOrEqual(cw + 1);
}

// Home → For kids → age → route screen
export async function toRoute(page, lang, age) {
  await page.goto(pageOf(lang));
  await page.locator('[data-audience="kids"]').click();
  await expect(page.locator('#wk-age')).toBeVisible();
  await page.locator(`.wk-age[data-age="${age}"]`).click();
  await expect(page.locator('#wk-route')).toBeVisible();
  await expect(page.locator(`#wk-route [data-route-for="${age}"]`)).toBeVisible();
}

export const catalog = (page) => page.locator('#game-content #gp-grid');

export async function expectCatalog(page, lang) {
  await expect(catalog(page)).toBeVisible();
  for (const name of Object.values(GAME_NAMES[lang])) {
    await expect(catalog(page).locator('.pf-world-card', { hasText: name }), `${lang}: "${name}" in the catalog`).toBeVisible();
  }
}

// A game is "working" when its canvas has a real size AND its pixels change
// over time after a key press (the game loop draws) — not just a <canvas>.
async function canvasLives(page, sel) {
  const canvas = page.locator(sel);
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box && box.width > 50 && box.height > 50, `${sel} has a real size`).toBeTruthy();
  const hash = () => page.evaluate((s) => {
    const d = document.querySelector(s).toDataURL();
    let h = 0; for (let i = 0; i < d.length; i += 5) h = (h * 31 + d.charCodeAt(i)) | 0;
    return h;
  }, sel);
  const first = await hash();
  await page.keyboard.press('ArrowRight');
  await expect.poll(hash, { message: `${sel}: picture changes (game loop runs)`, timeout: 6_000 }).not.toBe(first);
}

// Opens each of the three games from the catalog, checks it runs, leaves it
// and comes back to the catalog.
export async function playEachGame(page, lang) {
  const names = GAME_NAMES[lang];
  const card = (n) => catalog(page).locator('.pf-world-card', { hasText: n });

  await card(names.snake).click();
  await canvasLives(page, '#sk-canvas');
  await page.locator('#sk-exit').click();
  await expectCatalog(page, lang);

  await card(names.runner).click();
  await page.locator('#pf-world-grid .pf-world-card:not(.locked)').first().click();
  await canvasLives(page, '#pf-canvas');
  await page.locator('#pf-exit').click();
  await expect(page.locator('#pf-world-grid')).toBeVisible();
  await page.locator('#pf-back-games').click();
  await expectCatalog(page, lang);

  await card(names.racer).click();
  await page.locator('#rc-world-grid .pf-world-card:not(.locked)').first().click();
  await canvasLives(page, '#rc-canvas');
  await page.locator('#rc-exit').click();
  await expect(page.locator('#rc-world-grid')).toBeVisible();
  await page.locator('#rc-back-games').click();
  await expectCatalog(page, lang);
}
