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

  // Switch off reading for the first child.
  await area.locator('details summary').first().click();
  const reading = area.getByRole('checkbox', { name: 'Wörter lesen' }).first();
  await reading.uncheck();
  await expect(reading).not.toBeChecked();

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

test('parents area shows the learning level per challenge type', async ({ page }) => {
  await seedSave(page, {
    version: 5,
    activeProfileId: null,
    settings: { speech: true },
    profiles: [
      profileFixture({
        pendingRewards: 0,
        skills: { 'math.count': { level: 3, streak: 0, attempts: 9, firstTry: 6, solved: 8, revealed: 1, skipped: 0 } },
      }),
    ],
  });
  await page.getByRole('button', { name: /Eltern/ }).click();
  const gate = page.getByTestId('parent-gate');
  const word = await gate.locator('.gate-question').getAttribute('data-target-word');
  const target = Array.from({ length: 100 }, (_, n) => n).find((n) => numberWord(n) === word)!;
  for (const digit of String(target)) await gate.getByRole('button', { name: digit, exact: true }).click();
  await expect(page.getByText('Zählen: Stufe 3 von 3 · 8 gelöst, davon 6 ohne Fehler')).toBeVisible();
});

test('a parent-set play time shows a friendly break screen', async ({ page }) => {
  await page.clock.install();
  await seedSave(page, {
    version: 6,
    activeProfileId: null,
    settings: { speech: true, sessionMinutes: 15 },
    profiles: [profileFixture({ pendingRewards: 0 })],
  });
  await page.getByRole('button', { name: /Testkind/ }).click();
  // Old save (v6): the stage question comes once; skip it.
  await page.getByTestId('stage-screen').getByRole('button', { name: 'Später' }).click();
  await page.getByRole('button', { name: 'Zauberwald', exact: true }).click();
  await expect(page.getByTestId('game-canvas').locator('canvas')).toBeVisible();
  await expect(page.getByTestId('break')).toHaveCount(0);
  await page.clock.fastForward('16:00');
  await expect(page.getByTestId('break')).toBeVisible();
  await expect(page.getByText('Zeit für eine Pause!')).toBeVisible();
});
