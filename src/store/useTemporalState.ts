// React-reactive read of zundo history depth + actions.
// zundo exposes a separate store on `useRoomStore.temporal`; we subscribe
// directly to its `pastStates` and `futureStates` arrays.

import { useEffect, useState } from 'react';
import { useRoomStore } from './useRoomStore';

interface TemporalInfo {
  pastCount: number;
  futureCount: number;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export function useTemporalState(): TemporalInfo {
  const [info, setInfo] = useState<TemporalInfo>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (useRoomStore as any).temporal.getState();
    return {
      pastCount: t.pastStates.length,
      futureCount: t.futureStates.length,
      undo: () => t.undo(),
      redo: () => t.redo(),
      clear: () => t.clear(),
    };
  });

  useEffect(() => {
    // Subscribe to the temporal store. zundo's store triggers updates on undo/redo/state changes.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const temporalStore = (useRoomStore as any).temporal;
    const unsub = temporalStore.subscribe((s: { pastStates: unknown[]; futureStates: unknown[] }) => {
      setInfo((prev) => ({
        pastCount: s.pastStates.length,
        futureCount: s.futureStates.length,
        undo: prev.undo,
        redo: prev.redo,
        clear: prev.clear,
      }));
    });
    return unsub;
  }, []);

  return info;
}
