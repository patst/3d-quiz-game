import { describe, expect, it } from 'vitest';
import { createProfile, MAX_PROFILES } from '../profile/profile';
import { addProfile, emptySave, migrateSave, removeProfile, SAVE_VERSION, updateProfile } from './save';

const profile = (id: string) =>
  createProfile({ id, name: `  Kind ${id}  `, avatar: { animal: 'bunny', color: '#f4a3c0' }, now: 0 });

describe('save document', () => {
  it('migrates garbage to an empty save', () => {
    expect(migrateSave(undefined)).toEqual(emptySave());
    expect(migrateSave('nope')).toEqual(emptySave());
    expect(migrateSave({ version: 999, profiles: [] })).toEqual(emptySave());
  });

  it('keeps a valid save and drops a dangling active id', () => {
    const doc = addProfile(emptySave(), profile('a'));
    expect(migrateSave(doc)).toEqual(doc);
    expect(migrateSave({ ...doc, activeProfileId: 'x' }).activeProfileId).toBeNull();
  });

  it('migrates v1 saves: existing stars fill the jar and give rewards', () => {
    const v1 = {
      version: 1,
      activeProfileId: 'a',
      profiles: [{ id: 'a', name: 'A', avatar: { animal: 'cat', color: '#f4a3c0' }, createdAt: 0, stars: 23, mazesCompleted: 2 }],
    };
    const doc = migrateSave(v1);
    expect(doc.version).toBe(SAVE_VERSION);
    expect(doc.profiles[0]?.treehouse).toEqual({});
    expect(doc.profiles[0]?.levels).toEqual({ forest: 2 });
    expect(doc.profiles[0]?.disabledChallenges).toEqual([]);
    expect(doc.profiles[0]?.skills).toEqual({});
    expect(doc.settings).toEqual({ speech: true, sessionMinutes: 0, sfx: true });
    expect(doc.activeProfileId).toBe('a');
    expect(doc.profiles[0]).toMatchObject({ stars: 23, jar: 3, pendingRewards: 2, inventory: [], equipped: {} });
    // v2 → v3: finished mazes mean the chick was rescued.
    expect(doc.profiles[0]).toMatchObject({ rescued: ['chick'], pet: 'chick' });
  });

  it('migrates v8 saves: stage unknown, asked once (ADR-0009)', () => {
    const v8profile: Record<string, unknown> = { ...profile('a') };
    delete v8profile.learner;
    delete v8profile.stageAsked;
    const doc = migrateSave({ version: 8, profiles: [v8profile], activeProfileId: 'a', settings: {} });
    expect(doc.profiles[0]).toMatchObject({ learner: null, stageAsked: false });
  });

  it('adds, updates and removes profiles', () => {
    let doc = addProfile(emptySave(), profile('a'));
    doc = addProfile(doc, profile('b'));
    expect(doc.activeProfileId).toBe('b');
    expect(doc.profiles[0]?.name).toBe('Kind a');
    doc = updateProfile(doc, 'a', (p) => ({ ...p, stars: p.stars + 3 }));
    expect(doc.profiles[0]?.stars).toBe(3);
    doc = removeProfile(doc, 'b');
    expect(doc.profiles.map((p) => p.id)).toEqual(['a']);
    expect(doc.activeProfileId).toBeNull();
  });

  it('limits the number of profiles', () => {
    let doc = emptySave();
    for (let i = 0; i < MAX_PROFILES; i++) doc = addProfile(doc, profile(String(i)));
    expect(() => addProfile(doc, profile('x'))).toThrow();
  });
});
