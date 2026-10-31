import { MAX_PROFILES, type Profile } from '../profile/profile';
import { JAR_SIZE } from '../rewards/rewards';

/**
 * The persisted save document for one device (all local profiles).
 * Bump SAVE_VERSION and add a migration whenever the shape changes.
 */
export const SAVE_VERSION = 3;

export interface SaveDoc {
  version: typeof SAVE_VERSION;
  profiles: Profile[];
  activeProfileId: string | null;
}

/** Storage backend. Implemented outside core (IndexedDB in app/, in-memory in tests). */
export interface SaveStore {
  load(): Promise<unknown>;
  save(doc: SaveDoc): Promise<void>;
}

export function emptySave(): SaveDoc {
  return { version: SAVE_VERSION, profiles: [], activeProfileId: null };
}

/** Migrations keyed by the version they upgrade *from*. */
const migrations: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>> = {
  // v1 → v2: star jar and rewards. Stars earned before get converted into jar + rewards.
  1: (doc) => ({
    ...doc,
    version: 2,
    profiles: (Array.isArray(doc.profiles) ? doc.profiles : []).map((p: Record<string, unknown>) => {
      const stars = typeof p.stars === 'number' ? p.stars : 0;
      return {
        ...p,
        jar: stars % JAR_SIZE,
        pendingRewards: Math.floor(stars / JAR_SIZE),
        inventory: [],
        equipped: {},
      };
    }),
  }),
  // v2 → v3: rescued animal friends. Everyone who finished a maze has rescued the chick.
  2: (doc) => ({
    ...doc,
    version: 3,
    profiles: (Array.isArray(doc.profiles) ? doc.profiles : []).map((p: Record<string, unknown>) => {
      const done = typeof p.mazesCompleted === 'number' && p.mazesCompleted > 0;
      return { ...p, rescued: done ? ['chick'] : [], pet: done ? 'chick' : null };
    }),
  }),
};

/** Turns whatever was stored into a valid current SaveDoc; never throws. */
export function migrateSave(raw: unknown): SaveDoc {
  if (!raw || typeof raw !== 'object') return emptySave();
  let doc = raw as Record<string, unknown>;
  let version = typeof doc.version === 'number' ? doc.version : 0;
  while (version < SAVE_VERSION) {
    const migrate = migrations[version];
    if (!migrate) return emptySave();
    doc = migrate(doc);
    version++;
  }
  if (version !== SAVE_VERSION || !Array.isArray(doc.profiles)) return emptySave();
  const profiles = doc.profiles as Profile[];
  const active = typeof doc.activeProfileId === 'string' ? doc.activeProfileId : null;
  return {
    version: SAVE_VERSION,
    profiles,
    activeProfileId: profiles.some((p) => p.id === active) ? active : null,
  };
}

export function addProfile(doc: SaveDoc, profile: Profile): SaveDoc {
  if (doc.profiles.length >= MAX_PROFILES) throw new Error('Too many profiles');
  return { ...doc, profiles: [...doc.profiles, profile], activeProfileId: profile.id };
}

export function removeProfile(doc: SaveDoc, id: string): SaveDoc {
  return {
    ...doc,
    profiles: doc.profiles.filter((p) => p.id !== id),
    activeProfileId: doc.activeProfileId === id ? null : doc.activeProfileId,
  };
}

export function updateProfile(doc: SaveDoc, id: string, change: (p: Profile) => Profile): SaveDoc {
  return { ...doc, profiles: doc.profiles.map((p) => (p.id === id ? change(p) : p)) };
}

export function setActiveProfile(doc: SaveDoc, id: string | null): SaveDoc {
  return { ...doc, activeProfileId: id };
}
