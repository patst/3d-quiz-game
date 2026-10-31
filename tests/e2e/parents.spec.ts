import { expect, test } from '@playwright/test';
import { profileFixture, seedSave } from './helpers';

import { numberWord } from '../../src/content/de/numbers';

test('parent gate, rename and delete a profile, toggle speech', async ({ page }) => {
  await seedSave(page, {
    version: 4,
    activeProfileId: null,
    settings: { speech: true },
    profiles: [profileFixture({ pendingRewards: 0 }), profileFixture({ id: 'p2', name: 'Zweites', pendingRewards: 0 })],
  });
  await page.getByRole('button', { name: /Eltern/ }).click();
  const gate = page.getByTestId('parent-gate');
  // Wrong answer first.
  await gate.getByRole('button', { name: '0', exact: true }).click();
  await gate.getByRole('button', { name: '0', exact: true }).click();
  await expect(gate.getByText('Das war leider nicht richtig.')).toBeVisible();

  // Translate the number word back like a parent would.
  const word = await gate.locator('.gate-question').getAttribute('data-target-word');
  const target = Array.from({ length: 100 }, (_, n) => n).find((n) => numberWord(n) === word)!;
  for (const digit of String(target)) await gate.getByRole('button', { name: digit, exact: true }).click();

  const area = page.getByTestId('parents-area');
  await expect(area).toBeVisible();
  await expect(area.getByTestId('parents-profile')).toHaveCount(2);

  const name = area.getByRole('textbox', { name: 'Name' }).first();
  await name.fill('Mia');
  await name.blur();

  await area.getByRole('button', { name: 'Löschen' }).nth(1).click();
  await page.getByRole('button', { name: 'Ja, löschen' }).click();
  await expect(area.getByTestId('parents-profile')).toHaveCount(1);

  const speech = area.getByRole('checkbox', { name: 'Aufgaben vorlesen' });
  await speech.uncheck();
  await expect(speech).not.toBeChecked();

  await area.getByRole('button', { name: 'Zurück' }).click();
  await expect(page.getByRole('button', { name: /Mia/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Zweites/ })).toHaveCount(0);

  // Settings persist.
  await page.reload();
  await page.getByRole('button', { name: /Eltern/ }).click();
  await expect(page.getByTestId('parent-gate')).toBeVisible();
});
