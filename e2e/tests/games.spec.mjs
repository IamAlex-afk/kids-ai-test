// Step 1: one Russian path — home → For kids → age → All games → each of the
// three games starts and exits → back to the activities screen.
import { test, expect } from '@playwright/test';
import { T, watchErrors, toRoute, expectCatalog, playEachGame, noHorizontalOverflow } from './helpers.mjs';

test('ru, 8–10: All games → Snake, Runner, Racer start and exit', async ({ page }) => {
  const errors = watchErrors(page);
  await toRoute(page, 'ru', 'child');
  await noHorizontalOverflow(page, 'route');

  await page.locator('#wk-route').getByRole('button', { name: T.ru.allGames }).click();
  await expectCatalog(page, 'ru');
  await noHorizontalOverflow(page, 'catalog');
  await playEachGame(page, 'ru');

  await page.locator('#gp-exit').click();
  await expect(page.locator('#wk-route')).toBeVisible();
  await expect(page.locator('#wk-route [data-route-label]')).toHaveText('8–10');
  expect(errors, 'page errors / failed own requests').toEqual([]);
});
