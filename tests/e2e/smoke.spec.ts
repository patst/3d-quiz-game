import { expect, test, type Page } from '@playwright/test';

async function createProfile(page: Page) {
  await page.goto('./?seed=1');
  await expect(page.getByRole('heading', { name: 'Wähle dein Tier!' })).toBeVisible();
  await page.getByRole('radio', { name: /Frosch/ }).click();
  await page.getByRole('button', { name: "Los geht's!" }).click();
  // A grown-up answers "Kindergarten oder Schule?" (ADR-0009).
  await page.getByTestId('stage-screen').getByRole('button', { name: /Vorschule/ }).click();
  await expect(page.getByTestId('game-canvas').locator('canvas')).toBeVisible();
}

test('create a profile and walk in the maze', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await createProfile(page);

  const canvas = page.getByTestId('game-canvas');
  await expect(canvas).toHaveAttribute('data-avatar-tile', '1,1');

  // Start is the top-left cell: right or down is always open.
  for (const key of ['ArrowRight', 'ArrowDown']) {
    await page.keyboard.down(key);
    await page.waitForTimeout(500);
    await page.keyboard.up(key);
  }
  await expect(canvas).not.toHaveAttribute('data-avatar-tile', '1,1');
  expect(errors).toEqual([]);
});

test('profile survives a reload', async ({ page }) => {
  await createProfile(page);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Wer spielt?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Frosch/ })).toBeVisible();
});

test('plays a pre-generated voice clip when the game starts', async ({ page }) => {
  const clip = page.waitForRequest((r) => /\/audio\/de\/[0-9a-z]+\.mp3$/.test(r.url()));
  await createProfile(page);
  const request = await clip;
  const response = await request.response();
  // Media elements use range requests (206).
  expect([200, 206]).toContain(response?.status());
});
