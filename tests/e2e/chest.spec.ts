import { expect, test } from '@playwright/test';

// Software WebGL in CI is slow; walking takes a while.
test.describe.configure({ timeout: 120_000 });

const KEYS: Record<string, string> = { U: 'ArrowUp', R: 'ArrowRight', D: 'ArrowDown', L: 'ArrowLeft' };

// Any answer control: number buttons, compare sides, picture/word cards.
const ANSWERS = '.number-button:not([disabled]), .compare-side:not([disabled]), .picture-button:not([disabled])';

test('walk to a chest, solve the challenge and earn stars', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Pin the challenge type: this test is about the chest flow, not a specific challenge.
  await page.goto('./?seed=11&challenge=math.count');
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
  await expect(page.getByTestId('star-jar')).toHaveAttribute('data-jar', '0');
  await expect(challenge.locator('[data-tier]')).toHaveAttribute('data-tier', /^(bronze|silver|gold)$/);

  // Tap answers until the challenge is finished (correct or revealed).
  const next = challenge.getByRole('button', { name: 'Weiter' });
  for (let i = 0; i < 4 && !(await next.isVisible()); i++) {
    await challenge.locator(ANSWERS).first().click();
  }
  // Either cheerful praise (jingle + confetti) or the explained solution.
  await expect(challenge.locator('[data-testid="praise"], .feedback.reveal')).toBeVisible();
  await next.click();
  await expect(challenge).toBeHidden();
  await expect(page.getByTestId('star-jar')).not.toHaveAttribute('data-jar', '0');
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
