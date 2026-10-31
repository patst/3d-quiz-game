import { get, set } from 'idb-keyval';
import type { SaveDoc, SaveStore } from '../core/save/save';

/**
 * IndexedDB-backed save store (ADR-0004).
 * The key includes the deployment base path so PR previews on the same origin never touch
 * the main game's save (ADR-0005).
 */
export function createIdbStore(namespace: string = import.meta.env.BASE_URL): SaveStore {
  const key = `save:${namespace}`;
  return {
    load: () => get(key),
    save: (doc: SaveDoc) => set(key, doc),
  };
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
