import { expect, test } from '@playwright/test';
import { numberWord } from '../../src/content/de/numbers';
import { profileFixture, seedSave } from './helpers';

test('an existing profile is asked for its stage once; it shows in the parents area', async ({ page }) => {
  // A v8 save: profiles from before ADR-0009 have no stage yet.
  const { learner: _learner, stageAsked: _asked, ...v8 } = profileFixture({ pendingRewards: 0 });
  void _learner;
  void _asked;
  await seedSave(page, { version: 8, activeProfileId: null, settings: { speech: true }, profiles: [v8] });

  await page.getByRole('button', { name: /Testkind/ }).click();
  const stage = page.getByTestId('stage-screen');
  await expect(stage).toBeVisible();
  await expect(stage.locator('[data-stage]')).toHaveCount(6);
  await stage.getByRole('button', { name: /1\. Klasse/ }).click();
  await expect(page.getByRole('button', { name: 'Zauberwald', exact: true })).toBeVisible();

  // Not asked again.
  await page.reload();
  await page.getByRole('button', { name: /Testkind/ }).click();
  await expect(page.getByRole('button', { name: 'Zauberwald', exact: true })).toBeVisible();
  await expect(page.getByTestId('stage-screen')).toHaveCount(0);

  // Parents see (and can change) it.
  await page.goto('./');
  await page.getByRole('button', { name: /Eltern/ }).click();
  const gate = page.getByTestId('parent-gate');
  const word = await gate.locator('.gate-question').getAttribute('data-target-word');
  const target = Array.from({ length: 100 }, (_, n) => n).find((n) => numberWord(n) === word)!;
  for (const digit of String(target)) await gate.getByRole('button', { name: digit, exact: true }).click();
  const select = page.getByTestId('parents-area').getByRole('combobox', { name: 'Kindergarten / Klasse' });
  await expect(select).toHaveValue('grade1');
  await select.selectOption('kita');
  await expect(select).toHaveValue('kita');
});
