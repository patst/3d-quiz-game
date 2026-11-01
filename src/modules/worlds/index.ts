import { forestWorld } from './forest';
import { underwaterWorld } from './underwater';
import type { WorldTheme } from './types';

/** Registry of all worlds. Add new worlds here. */
export const worlds: readonly WorldTheme[] = [forestWorld, underwaterWorld];

export function getWorld(id: string): WorldTheme {
  return worlds.find((w) => w.id === id) ?? forestWorld;
}

export type { WorldTheme };
