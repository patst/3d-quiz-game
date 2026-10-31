import { expect, test } from '@playwright/test';
import { profileFixture, seedSave } from './helpers';

test('a full star jar lets the child pick a reward, which is worn in the wardrobe', async ({ page }) => {
  await seedSave(page, { version: 5, settings: { speech: true }, activeProfileId: 'p1', profiles: [profileFixture()] });
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

test('rescued friends appear in the wardrobe and can be chosen as pet', async ({ page }) => {
  await seedSave(page, {
    version: 5, settings: { speech: true },
    activeProfileId: 'p1',
    profiles: [profileFixture({ pendingRewards: 0, rescued: ['chick', 'piglet'], pet: 'chick' })],
  });
  await page.getByRole('button', { name: /Testkind/ }).click();
  // Third maze: the next friend to rescue is the puppy.
  await expect(page.getByRole('button', { name: /Finde den verirrten Welpen/ })).toBeVisible();
  await page.getByTestId('wardrobe-button').click();
  const friends = page.getByTestId('friends');
  await expect(friends.getByRole('button', { name: 'Küken' })).toHaveAttribute('aria-pressed', 'true');
  await friends.getByRole('button', { name: 'Ferkel' }).click();
  await expect(friends.getByRole('button', { name: 'Ferkel' })).toHaveAttribute('aria-pressed', 'true');
  await expect(friends.getByRole('button', { name: 'Küken' })).toHaveAttribute('aria-pressed', 'false');
  await expect(friends.locator('.wardrobe-item.locked')).toHaveCount(4);
});
