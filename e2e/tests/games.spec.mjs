// Every language × every age: home → For kids → age → All games → Snake,
// Circuit Runner and Circuit Racer each start (canvas drawn and changing)
// and exit → back to the activities screen of the same age.
import { test, expect } from '@playwright/test';
import { T, LANGS, AGES, watchErrors, toRoute, expectCatalog, playEachGame, noHorizontalOverflow } from './helpers.mjs';

for (const lang of LANGS) {
  for (const [age, label] of AGES) {
    test(`${lang}, ${label}: All games → Snake, Runner, Racer start and exit`, async ({ page }) => {
      const errors = watchErrors(page);
      await toRoute(page, lang, age);
      await noHorizontalOverflow(page, 'route');

      const go = page.locator('#wk-route .wk-games-go');   // the owner's pill button (the card below has the same label)
      await expect(go).toContainText(T[lang].allGames);
      await go.click();
      await expectCatalog(page, lang);
      await noHorizontalOverflow(page, 'catalog');
      await playEachGame(page, lang);

      await page.locator('#gp-exit').click();
      await expect(page.locator('#wk-route')).toBeVisible();
      await expect(page.locator('#wk-route [data-route-label]')).toHaveText(label);
      expect(errors, 'page errors / failed own requests').toEqual([]);
    });
  }
}
