import type { Page } from '@playwright/test';

/** Writes a save document straight into IndexedDB (idb-keyval layout), then reloads. */
export async function seedSave(page: Page, doc: unknown): Promise<void> {
  await page.goto('./');
  await page.evaluate(async (save) => {
    const key = `save:${new URL(document.baseURI).pathname}`;
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('keyval-store');
      open.onupgradeneeded = () => open.result.createObjectStore('keyval');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const tx = open.result.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').put(save, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }, doc);
  await page.reload();
}

export function profileFixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    name: 'Testkind',
    avatar: { animal: 'cat', color: '#f6c453' },
    createdAt: 0,
    stars: 10,
    mazesCompleted: 0,
    jar: 0,
    pendingRewards: 1,
    inventory: [],
    equipped: {},
    rescued: [],
    pet: null,
    skills: {},
    disabledChallenges: [],
    levels: {},
    treehouse: {},
    ...overrides,
  };
}
