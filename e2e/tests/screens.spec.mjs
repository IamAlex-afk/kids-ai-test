// Screenshots for a human/visual review (not a pixel diff): home, route with
// the "All games" button, games catalog — 10 languages × desktop and 390 px.
// Saved under results/screens/ and uploaded with the report artifact.
import { test, expect } from '@playwright/test';
import { LANGS, pageOf, toRoute, expectCatalog } from './helpers.mjs';

for (const lang of LANGS) {
  test(`${lang}: screenshots home, route, games`, async ({ page }, info) => {
    const dir = `results/screens/${info.project.name}`;
    await page.goto(pageOf(lang));
    await page.screenshot({ path: `${dir}/${lang}-1-home.png` });
    await toRoute(page, lang, 'child');
    const go = page.locator('#wk-route .wk-games-go');
    await expect(go).toBeVisible();
    await page.screenshot({ path: `${dir}/${lang}-2-route.png` });
    await go.click();
    await expectCatalog(page, lang);
    await page.screenshot({ path: `${dir}/${lang}-3-games.png` });
  });
}
