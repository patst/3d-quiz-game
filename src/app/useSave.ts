import { useCallback, useEffect, useRef, useState } from 'react';
import { emptySave, migrateSave, type SaveDoc, type SaveStore } from '../core/save/save';

/** Loads the save document once and persists every change. */
export function useSave(store: SaveStore) {
  const [doc, setDoc] = useState<SaveDoc | null>(null);
  const docRef = useRef<SaveDoc | null>(null);

  useEffect(() => {
    let cancelled = false;
    store
      .load()
      .then(migrateSave)
      .catch(() => emptySave())
      .then((loaded) => {
        if (cancelled) return;
        docRef.current = loaded;
        setDoc(loaded);
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const update = useCallback(
    (change: (d: SaveDoc) => SaveDoc) => {
      const current = docRef.current;
      if (!current) return;
      const next = change(current);
      docRef.current = next;
      setDoc(next);
      store.save(next).catch((e: unknown) => console.error('Saving failed', e));
    },
    [store],
  );

  return { doc, update };
}
