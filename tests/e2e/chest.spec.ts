import { expect, test } from '@playwright/test';

// Software WebGL in CI is slow; walking takes a while.
test.describe.configure({ timeout: 120_000 });

const KEYS: Record<string, string> = { U: 'ArrowUp', R: 'ArrowRight', D: 'ArrowDown', L: 'ArrowLeft' };

test('walk to a chest, solve the challenge and earn stars', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('./?seed=11');
  await page.getByRole('button', { name: "Los geht's!" }).click();
  const canvas = page.getByTestId('game-canvas');
  await expect(canvas).toHaveAttribute('data-test-route-chest', /^[URDL]+$/);
  const route = (await canvas.getAttribute('data-test-route-chest'))!;

  for (const step of route) {
    const before = await canvas.getAttribute('data-avatar-tile');
    await page.keyboard.press(KEYS[step]!);
    await expect(canvas).not.toHaveAttribute('data-avatar-tile', before!, { timeout: 15_000 });
  }

  const challenge = page.getByTestId('challenge');
  await expect(challenge).toBeVisible();
  await expect(page.getByTestId('star-counter')).toContainText('0');

  // Tap number buttons until the challenge is finished (correct or revealed).
  const next = challenge.getByRole('button', { name: 'Weiter' });
  for (let i = 0; i < 4 && !(await next.isVisible()); i++) {
    await challenge.locator('.number-button:not([disabled])').first().click();
  }
  await next.click();
  await expect(challenge).toBeHidden();
  await expect(page.getByTestId('star-counter')).not.toContainText(/^\s*⭐\s*0\s*$/);
  expect(errors).toEqual([]);
});

test('skipping a challenge asks for confirmation', async ({ page }) => {
  await page.goto('./?seed=11');
  await page.getByRole('button', { name: "Los geht's!" }).click();
  const canvas = page.getByTestId('game-canvas');
  const route = (await canvas.getAttribute('data-test-route-chest'))!;
  for (const step of route) {
    const before = await canvas.getAttribute('data-avatar-tile');
    await page.keyboard.press(KEYS[step]!);
    await expect(canvas).not.toHaveAttribute('data-avatar-tile', before!, { timeout: 15_000 });
  }
  const challenge = page.getByTestId('challenge');
  await challenge.getByRole('button', { name: 'Überspringen' }).click();
  await page.getByRole('button', { name: 'Nein, weiter rechnen' }).click();
  await expect(challenge).toBeVisible();
  await challenge.getByRole('button', { name: 'Überspringen' }).click();
  await page.getByRole('button', { name: 'Ja, überspringen' }).click();
  await expect(challenge).toBeHidden();
});
