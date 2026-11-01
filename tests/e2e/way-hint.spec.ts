import { expect, test } from '@playwright/test';

test('"Olli zeigt den Weg" highlights the next steps towards the goal', async ({ page }) => {
  await page.goto('./?seed=3');
  await page.getByRole('button', { name: "Los geht's!" }).click();
  const canvas = page.getByTestId('game-canvas');
  await expect(canvas).toHaveAttribute('data-avatar-tile', '1,1');
  await page.getByTestId('way-hint').click();
  await expect(canvas).toHaveAttribute('data-way-hint', /^\d+,\d+(;\d+,\d+){0,5}$/);
  const first = (await canvas.getAttribute('data-way-hint'))!.split(';')[0]!.split(',').map(Number);
  // The first highlighted tile is right next to the avatar.
  expect(Math.abs(first[0]! - 1) + Math.abs(first[1]! - 1)).toBe(1);
  // Cool-down: the button looks inactive for a while.
  await expect(page.getByTestId('way-hint')).toHaveClass(/cooling/);
});
