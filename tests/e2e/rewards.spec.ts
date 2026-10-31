import { expect, test } from '@playwright/test';
import { profileFixture, seedSave } from './helpers';

test('a full star jar lets the child pick a reward, which is worn in the wardrobe', async ({ page }) => {
  await seedSave(page, { version: 2, activeProfileId: 'p1', profiles: [profileFixture()] });
  await page.getByRole('button', { name: /Testkind/ }).click();

  const picker = page.getByTestId('reward-picker');
  await expect(picker).toBeVisible();
  const cards = picker.locator('.reward-card');
  await expect(cards).toHaveCount(3);
  const name = (await cards.first().locator('.reward-name').innerText()).trim();
  await cards.first().click();
  await expect(picker).toBeHidden();

  await page.getByTestId('wardrobe-button').click();
  const wardrobe = page.getByTestId('wardrobe');
  const item = wardrobe.getByRole('button', { name });
  await expect(item).toHaveAttribute('aria-pressed', 'true');
  // Toggle off and on again.
  await item.click();
  await expect(item).toHaveAttribute('aria-pressed', 'false');
  await item.click();
  await expect(item).toHaveAttribute('aria-pressed', 'true');
  await expect(wardrobe.locator('.wardrobe-item.locked')).not.toHaveCount(0);
});
