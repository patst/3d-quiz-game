import { expect, test } from '@playwright/test';
import { profileFixture, seedSave } from './helpers';

const save = (levels: Record<string, number>) => ({
  version: 7,
  activeProfileId: null,
  settings: { speech: true, sessionMinutes: 0, sfx: true },
  profiles: [profileFixture({ pendingRewards: 0, levels })],
});

test('before 3 forest mazes the child goes straight into the forest', async ({ page }) => {
  await seedSave(page, save({ forest: 2 }));
  await page.getByRole('button', { name: /Testkind/ }).click();
  await expect(page.getByTestId('game-canvas')).toBeVisible();
  await expect(page.getByTestId('world-select')).toHaveCount(0);
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
  await expect(select.getByRole('button', { name: 'Zauberwald' })).toContainText('Level 4');
  await expect(select.getByRole('button', { name: 'Unterwasserwelt' })).toContainText('Level 2');
});
