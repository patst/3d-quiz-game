import { expect, test } from '@playwright/test';
import { profileFixture, seedSave, SAVE_VERSION } from './helpers';

const save = (levels: Record<string, number>) => ({
  version: SAVE_VERSION,
  activeProfileId: null,
  settings: { speech: true, sessionMinutes: 0, sfx: true },
  profiles: [profileFixture({ pendingRewards: 0, levels })],
});

test('before 3 forest mazes the underwater world is shown locked', async ({ page }) => {
  await seedSave(page, save({ forest: 2 }));
  await page.getByRole('button', { name: /Testkind/ }).click();
  const select = page.getByTestId('world-select');
  await expect(select.getByRole('button', { name: /Unterwasserwelt: Noch 1 Labyrinth im Zauberwald/ })).toBeVisible();
  await select.getByRole('button', { name: /Unterwasserwelt/ }).click();
  // Locked: nothing happens except a spoken hint.
  await expect(select).toBeVisible();
  await select.getByRole('button', { name: 'Zauberwald', exact: true }).click();
  await expect(page.getByTestId('game-canvas')).toBeVisible();
});

test('after 3 forest mazes the underwater world can be chosen', async ({ page }) => {
  await seedSave(page, save({ forest: 3 }));
  await page.getByRole('button', { name: /Testkind/ }).click();
  const select = page.getByTestId('world-select');
  await expect(select).toBeVisible();
  await select.getByRole('button', { name: 'Unterwasserwelt' }).click();
  await expect(page.getByRole('button', { name: /Finde die verirrte Schildkröte/ })).toBeVisible();
  await expect(page.getByTestId('level')).toHaveText('Level 1');
});

test('world cards show the level per world', async ({ page }) => {
  await seedSave(page, save({ forest: 3, underwater: 1 }));
  await page.getByRole('button', { name: /Testkind/ }).click();
  const select = page.getByTestId('world-select');
  await expect(select.getByRole('button', { name: 'Zauberwald', exact: true })).toContainText('Level 4');
  await expect(select.getByRole('button', { name: 'Unterwasserwelt' })).toContainText('Level 2');
});

test('tree house: a decoration from the star jar is placed and can be moved away', async ({ page }) => {
  await seedSave(page, {
    ...save({ forest: 1 }),
    profiles: [
      profileFixture({ pendingRewards: 0, levels: { forest: 1 }, inventory: ['plant', 'balloons'], treehouse: { s1: 'plant' } }),
    ],
  });
  await page.getByRole('button', { name: /Testkind/ }).click();
  await page.getByRole('button', { name: 'Mein Baumhaus' }).click();
  await expect(page.getByTestId('treehouse')).toBeVisible();
  // The view publishes where each spot is on screen.
  const container = page.getByTestId('treehouse').locator('.game-canvas');
  await expect(container).toHaveAttribute('data-spots', /s3/);
  const spots = JSON.parse((await container.getAttribute('data-spots'))!) as Record<string, [number, number]>;
  const box = (await container.boundingBox())!;
  await page.mouse.click(box.x + spots.s3![0], box.y + spots.s3![1]);
  const picker = page.getByTestId('decor-picker');
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: 'Luftballons' }).click();
  await expect(picker).toBeHidden();
  // Tap the same spot again: the balloons are selected there and can be put away.
  await page.mouse.click(box.x + spots.s3![0], box.y + spots.s3![1]);
  await expect(picker.getByRole('button', { name: 'Luftballons' })).toHaveClass(/worn/);
  await picker.getByRole('button', { name: 'Wegräumen' }).click();
  await expect(picker).toBeHidden();
});
