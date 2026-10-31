import { describe, expect, it } from 'vitest';
import { createProfile, MAX_PROFILES } from '../profile/profile';
import { addProfile, emptySave, migrateSave, removeProfile, updateProfile } from './save';

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
