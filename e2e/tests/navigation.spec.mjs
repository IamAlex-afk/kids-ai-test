// Navigation around the activities: home Games card, Back without loops,
// changing the age, lessons, the Workshop, keyboard access.
import { test, expect } from '@playwright/test';
import { T, LANGS, pageOf, watchErrors, toRoute, expectCatalog, catalog, noHorizontalOverflow } from './helpers.mjs';

for (const lang of LANGS) {
  test(`${lang}: home Games card → age → catalog → exit lands on the activities of that age`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(pageOf(lang));
    await noHorizontalOverflow(page, 'home');
    // by its attribute: the kids card's text also contains the word "games"
    const games = page.locator('#wk-audience [data-audience="games"]');
    await expect(games).toContainText(T[lang].gamesT);
    await games.click();
    await expect(page.locator('#wk-age')).toBeVisible();
    await noHorizontalOverflow(page, 'age');
    await page.locator('.wk-age[data-age="teen"]').click();
    await expectCatalog(page, lang);
    await expect(page.locator('body')).toHaveAttribute('data-age', 'teen');
    await page.locator('#gp-exit').click();
    await expect(page.locator('#wk-route')).toBeVisible();
    await expect(page.locator('#wk-route [data-route-label]')).toHaveText('11–13');
    expect(errors).toEqual([]);
  });
}

test('ru: browser Back — game → activities → home, no loops', async ({ page }) => {
  const errors = watchErrors(page);
  await toRoute(page, 'ru', 'child');
  await page.locator('#wk-route [data-wk-games]').click();
  await expectCatalog(page, 'ru');

  await page.goBack();                                   // closes the catalog
  await expect(page.locator('#wk-route')).toBeVisible();
  await expect(catalog(page)).toBeHidden();

  await page.goBack();                                   // activities → home
  await expect(page.locator('#wk-audience')).toBeVisible();
  await expect(page.locator('#wk-route')).toBeHidden();
  expect(errors).toEqual([]);
});

test('ru: Change age → new age is used by the games', async ({ page }) => {
  const errors = watchErrors(page);
  await toRoute(page, 'ru', 'child');
  await page.locator('#wk-route [data-wk-change]').click();
  await expect(page.locator('#wk-age')).toBeVisible();
  await page.locator('.wk-age[data-age="adult"]').click();
  await expect(page.locator('#wk-route [data-route-label]')).toHaveText('14+');
  await page.locator('#wk-route [data-wk-games]').click();
  await expectCatalog(page, 'ru');
  await expect(page.locator('body')).toHaveAttribute('data-age', 'adult');
  expect(errors).toEqual([]);
});

test('ru: Lessons and a quiz → exit → all three games still there', async ({ page }) => {
  const errors = watchErrors(page);
  await toRoute(page, 'ru', 'child');
  await page.locator('#wk-route [data-wk-old]').click();
  await expect(page.locator('#lessons')).toBeVisible();
  await page.locator('#lessons-exit-btn').click();
  await expect(page.locator('#wk-route')).toBeVisible();
  await page.locator('#wk-route [data-wk-games]').click();
  await expectCatalog(page, 'ru');
  expect(errors).toEqual([]);
});

for (const lang of LANGS) {
  test(`${lang}: Start opens the Workshop activity for the age`, async ({ page }) => {
    const errors = watchErrors(page);
    await toRoute(page, lang, 'child');
    await page.locator('#wk-route [data-route-for="child"] .wk-start-go').click();
    await expect(page).toHaveURL(new RegExp(`workshop/${lang}/sorter\\.html\\?age=8-10$`));
    await expect(page.locator('h1')).toBeVisible();
    await noHorizontalOverflow(page, 'activity page');
    expect(errors).toEqual([]);
  });
}

test('ru: keyboard only — Games card and age reachable with Tab, focus visible', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(pageOf('ru'));
  const tabTo = async (sel) => {
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate((s) => document.activeElement?.matches(s), sel)) return;
    }
    throw new Error(`Tab never reached ${sel}`);
  };
  const focusVisible = () => page.evaluate(() => {
    const s = getComputedStyle(document.activeElement);
    return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
  });

  await tabTo('[data-audience="games"]');
  expect(await focusVisible(), 'visible focus on the Games card').toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.locator('#wk-age')).toBeVisible();
  await tabTo('.wk-age[data-age="child"]');
  expect(await focusVisible(), 'visible focus on the age button').toBe(true);
  await page.keyboard.press('Enter');
  await expectCatalog(page, 'ru');
  expect(errors).toEqual([]);
});
