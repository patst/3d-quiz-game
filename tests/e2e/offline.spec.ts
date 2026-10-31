import { expect, test } from '@playwright/test';

test('the app is installable and starts offline after the first visit', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'service worker behaviour is viewport independent');
  await page.goto('./');
  // Web app manifest is linked and valid.
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = await (await page.request.get(manifestHref!)).json();
  expect(manifest).toMatchObject({ short_name: 'Labyrinth', lang: 'de', display: 'standalone' });

  // Wait until the service worker controls the page and has precached the app shell.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Wähle dein Tier!' })).toBeVisible();
  await context.setOffline(false);
});
