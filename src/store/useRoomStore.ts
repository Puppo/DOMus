// Single source of truth for the bedroom scene. Both UI components and
// WebMCP execute handlers call into this store; that's the whole point.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { v4 as uuid } from 'uuid';

import { CATALOG } from './catalog';
import type { FurnitureColors, FurnitureItem, FurnitureKind, Room, Vec3 } from './types';

// ---------- helpers ----------

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Clamp the center of an item so its full footprint stays inside the room. */
function clampPosition(pos: Vec3, footprint: [number, number, number], room: Room): Vec3 {
  const [w, , d] = footprint;
  // Treat the catalog footprint as full-world extent. We assume the mesh is
  // drawn centered at `position`, so the half-extent on each axis is w/2, d/2.
  const halfW = w / 2;
  const halfD = d / 2;
  return {
    x: clamp(pos.x, halfW, room.width - halfW),
    y: Math.max(0, pos.y), // never below the floor
    z: clamp(pos.z, halfD, room.length - halfD),
  };
}

function clampScale(scale: Vec3, kind: FurnitureKind): Vec3 {
  const { min, max } = CATALOG[kind].scaleRange;
  return {
    x: clamp(scale.x, min, max),
    y: clamp(scale.y, min, max),
    z: clamp(scale.z, min, max),
  };
}

// ---------- store ----------

export interface RoomState {
  room: Room;
  items: FurnitureItem[];
  selectedId: string | null;

  // actions — same API for UI and WebMCP
  setRoom: (patch: Partial<Room>) => void;
  addFurniture: (
    kind: FurnitureKind,
    init?: {
      position?: Vec3;
      rotationY?: number;
      scale?: Vec3;
      colors?: FurnitureColors;
    },
  ) => string;
  removeFurniture: (id: string) => void;
  /** Full update — used by TransformControls (drag) which mutates many fields per frame. */
  updateFurniture: (id: string, patch: Partial<FurnitureItem>) => void;
  /** Discrete move event for zundo granularity. */
  moveFurniture: (id: string, position: Vec3) => void;
  /** Discrete rotate event for zundo granularity. */
  rotateFurniture: (id: string, rotationY: number) => void;
  setFurnitureColor: (id: string, slot: keyof FurnitureColors, hex: string) => void;
  setFurnitureScale: (id: string, scale: Partial<Vec3>) => void;
  selectFurniture: (id: string | null) => void;
  reset: () => void;
}

const DEFAULT_ROOM: Room = {
  width: 4,
  length: 4,
  height: 2.7,
  wallColor: '#F5F1EA',
  floorColor: '#C9A77A',
};

export const useRoomStore = create<RoomState>()(
  persist(
    temporal(
      immer((set) => ({
        room: { ...DEFAULT_ROOM },
        items: [],
        selectedId: null,

        setRoom: (patch) =>
          set((state) => {
            state.room = { ...state.room, ...patch };
            // If the room shrank, re-clamp any items now outside the bounds.
            for (const item of state.items) {
              const fp = CATALOG[item.kind].footprint;
              item.position = clampPosition(item.position, fp, state.room);
            }
          }),

        addFurniture: (kind, init = {}) => {
          const id = uuid();
          set((state) => {
            const def = CATALOG[kind];
            const scale = init.scale ?? { x: 1, y: 1, z: 1 };
            const position = init.position ?? {
              // Default placement: room center on the chosen floor.
              x: state.room.width / 2,
              y: 0,
              z: state.room.length / 2,
            };
            const item: FurnitureItem = {
              id,
              kind,
              position: clampPosition(position, def.footprint, state.room),
              rotationY: init.rotationY ?? 0,
              scale: clampScale(scale, kind),
              colors: { ...def.defaultColors, ...(init.colors ?? {}) },
            };
            state.items.push(item);
            state.selectedId = id;
          });
          return id;
        },

        removeFurniture: (id) =>
          set((state) => {
            state.items = state.items.filter((i) => i.id !== id);
            if (state.selectedId === id) state.selectedId = null;
          }),

        updateFurniture: (id, patch) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (!item) return;
            if (patch.position) {
              item.position = clampPosition(patch.position, CATALOG[item.kind].footprint, state.room);
            }
            if (patch.scale) {
              const next = { ...item.scale, ...patch.scale };
              item.scale = clampScale(next, item.kind);
            }
            if (patch.rotationY !== undefined) item.rotationY = patch.rotationY;
            if (patch.colors) item.colors = { ...item.colors, ...patch.colors };
          }),

        moveFurniture: (id, position) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (!item) return;
            item.position = clampPosition(position, CATALOG[item.kind].footprint, state.room);
          }),

        rotateFurniture: (id, rotationY) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (!item) return;
            item.rotationY = ((rotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          }),

        setFurnitureColor: (id, slot, hex) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (!item) return;
            item.colors[slot] = hex;
          }),

        setFurnitureScale: (id, scale) =>
          set((state) => {
            const item = state.items.find((i) => i.id === id);
            if (!item) return;
            const next = { ...item.scale, ...scale };
            item.scale = clampScale(next, item.kind);
          }),

        selectFurniture: (id) =>
          set((state) => {
            state.selectedId = id;
          }),

        reset: () =>
          set((state) => {
            state.room = { ...DEFAULT_ROOM };
            state.items = [];
            state.selectedId = null;
          }),
      })),
      // Don't track the ephemeral selection in history.
      { partialize: (state) => ({ room: state.room, items: state.items }) as any },
    ),
    {
      name: 'domus:v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ room: state.room, items: state.items }) as any,
    },
  ),
);

/** Imperative undo/redo. Safe to call from anywhere — including WebMCP handlers. */
export function undo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useRoomStore as any).temporal.getState().undo();
}
export function redo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useRoomStore as any).temporal.getState().redo();
}
export function clearHistory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useRoomStore as any).temporal.getState().clear();
}
