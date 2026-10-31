import { expect, test } from '@playwright/test';

const KEYS: Record<string, string> = { U: 'ArrowUp', R: 'ArrowRight', D: 'ArrowDown', L: 'ArrowLeft' };

// The full walk is long with software WebGL; one viewport is enough.
test.describe.configure({ timeout: 240_000 });

test('walk through the whole maze, skipping chests, and rescue the chick', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'long walk runs on desktop only');
  await page.goto('./?seed=3');
  await page.getByRole('button', { name: "Los geht's!" }).click();
  const canvas = page.getByTestId('game-canvas');
  await expect(canvas).toHaveAttribute('data-test-route-goal', /^[URDL]+$/);
  const route = (await canvas.getAttribute('data-test-route-goal'))!;
  const challenge = page.getByTestId('challenge');

  for (const step of route) {
    if (await challenge.isVisible()) {
      await challenge.getByRole('button', { name: 'Überspringen' }).click();
      await page.getByRole('button', { name: 'Ja, überspringen' }).click();
      await expect(challenge).toBeHidden();
    }
    const before = await canvas.getAttribute('data-avatar-tile');
    await page.keyboard.press(KEYS[step]!);
    await expect(canvas).not.toHaveAttribute('data-avatar-tile', before!, { timeout: 15_000 });
  }

  await expect(page.getByRole('heading', { name: 'Juhu!' })).toBeVisible();
  await expect(page.getByText('Du hast das Küken gefunden!')).toBeVisible();
  await page.getByRole('button', { name: 'Neues Labyrinth' }).click();
  await expect(page.getByRole('heading', { name: 'Juhu!' })).toBeHidden();
  await expect(canvas).toHaveAttribute('data-avatar-tile', '1,1');
});
