// Unit tests for the room store. Node environment — we do NOT render React.
// The persist middleware needs a localStorage shim because Node has none.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Silence the noisy zustand persist warning that fires from the default
// createJSONStorage(() => window.localStorage) path — irrelevant in Node.
vi.spyOn(console, 'warn').mockImplementation(() => {});

// In-memory localStorage shim BEFORE the store import fires persist.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number { return this.store.size; }
  clear(): void { this.store.clear(); }
  getItem(key: string): string | null { return this.store.get(key) ?? null; }
  key(i: number): string | null { return [...this.store.keys()][i] ?? null; }
  removeItem(key: string): void { this.store.delete(key); }
  setItem(key: string, value: string): void { this.store.set(key, value); }
}
(globalThis as any).localStorage = new MemoryStorage();

import { useRoomStore, undo, redo, clearHistory } from '../src/store/useRoomStore';
import { CATALOG } from '../src/store/catalog';

const initial = () => useRoomStore.getState();

beforeEach(() => {
  initial().reset();
});

describe('setRoom', () => {
  it('patches dimensions and colors', () => {
    initial().setRoom({ width: 5, height: 3.2, wallColor: '#111111' });
    const s = initial();
    expect(s.room.width).toBe(5);
    expect(s.room.height).toBe(3.2);
    expect(s.room.wallColor).toBe('#111111');
    expect(s.room.length).toBe(4); // untouched
  });

  it('re-clamps in-bounds items when the room shrinks', () => {
    const id = initial().addFurniture('bed', { position: { x: 3.5, y: 0, z: 3.5 } });
    initial().setRoom({ width: 2, length: 2 });
    const item = initial().items.find((i) => i.id === id)!;
    expect(item.position.x).toBeLessThanOrEqual(2);
    expect(item.position.z).toBeLessThanOrEqual(2);
  });
});

describe('addFurniture', () => {
  it('returns a uuid, adds to items, and selects the new item', () => {
    const id = initial().addFurniture('wardrobe', { position: { x: 1, y: 0, z: 1 } });
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);
    expect(initial().items).toHaveLength(1);
    expect(initial().selectedId).toBe(id);
  });

  it('clamps out-of-bounds X/Z to the room edge', () => {
    const id = initial().addFurniture('lamp', { position: { x: 99, y: 0, z: -50 } });
    const item = initial().items.find((i) => i.id === id)!;
    expect(item.position.x).toBeLessThanOrEqual(4); // room width 4
    expect(item.position.z).toBeGreaterThanOrEqual(0);
  });

  it('clamps negative Y to 0 (floor)', () => {
    const id = initial().addFurniture('lamp', { position: { x: 2, y: -10, z: 2 } });
    expect(initial().items.find((i) => i.id === id)!.position.y).toBe(0);
  });

  it('applies scale range from the catalog', () => {
    const id = initial().addFurniture('bed', { position: { x: 2, y: 0, z: 1 }, scale: { x: 10, y: 10, z: 10 } });
    const item = initial().items.find((i) => i.id === id)!;
    const { min, max } = CATALOG.bed.scaleRange;
    expect(item.scale.x).toBeLessThanOrEqual(max);
    expect(item.scale.x).toBeGreaterThanOrEqual(min);
  });

  it('clamps the footprint half-extent at the room boundary', () => {
    // Bed footprint is 1.6 × 2.0 — half-extents 0.8 on x, 1.0 on z.
    // Try to place its center exactly at (0, 0, 0); it must snap inward to (0.8, 0, 1.0).
    const id = initial().addFurniture('bed', { position: { x: 0, y: 0, z: 0 } });
    const item = initial().items.find((i) => i.id === id)!;
    expect(item.position.x).toBeCloseTo(0.8, 5);
    expect(item.position.z).toBeCloseTo(1.0, 5);
  });
});

describe('moveFurniture', () => {
  it('updates only the targeted item', () => {
    const a = initial().addFurniture('lamp', { position: { x: 1, y: 0, z: 1 } });
    const b = initial().addFurniture('lamp', { position: { x: 3, y: 0, z: 3 } });
    initial().moveFurniture(a, { x: 2, y: 0, z: 2 });
    const moved = initial().items.find((i) => i.id === a)!;
    const other = initial().items.find((i) => i.id === b)!;
    expect(moved.position).toEqual({ x: 2, y: 0, z: 2 });
    expect(other.position).toEqual({ x: 3, y: 0, z: 3 });
  });
});

describe('rotateFurniture', () => {
  it('normalizes the rotation into [0, 2π)', () => {
    const id = initial().addFurniture('bed', { position: { x: 2, y: 0, z: 1 } });
    initial().rotateFurniture(id, 3 * Math.PI); // > 2π
    const item = initial().items.find((i) => i.id === id)!;
    expect(item.rotationY).toBeGreaterThanOrEqual(0);
    expect(item.rotationY).toBeLessThan(2 * Math.PI);
    expect(item.rotationY).toBeCloseTo(Math.PI, 5);
  });
});

describe('setFurnitureColor', () => {
  it('is a no-op for an unknown id', () => {
    const before = JSON.stringify(initial().items);
    initial().setFurnitureColor('not-a-uuid', 'primary', '#000000');
    expect(JSON.stringify(initial().items)).toBe(before);
  });
});

describe('removeFurniture', () => {
  it('decrements items.length and clears selectedId if it was removed', () => {
    const id = initial().addFurniture('lamp', { position: { x: 2, y: 0, z: 2 } });
    expect(initial().selectedId).toBe(id);
    initial().removeFurniture(id);
    expect(initial().items).toHaveLength(0);
    expect(initial().selectedId).toBeNull();
  });

  it('keeps selectedId when a different item is removed', () => {
    const a = initial().addFurniture('lamp', { position: { x: 1, y: 0, z: 1 } });
    initial().addFurniture('lamp', { position: { x: 3, y: 0, z: 3 } });
    initial().selectFurniture(a);
    initial().removeFurniture(initial().items[1].id);
    expect(initial().selectedId).toBe(a);
    expect(initial().items).toHaveLength(1);
  });
});

describe('selectFurniture', () => {
  it('sets and clears selectedId', () => {
    expect(initial().selectedId).toBeNull();
    const id = initial().addFurniture('lamp', { position: { x: 1, y: 0, z: 1 } });
    // addFurniture auto-selects the new item.
    expect(initial().selectedId).toBe(id);
    initial().selectFurniture(null);
    expect(initial().selectedId).toBeNull();
    initial().selectFurniture(id);
    expect(initial().selectedId).toBe(id);
  });
});

describe('undo / redo', () => {
  beforeEach(() => {
    // The temporal store accumulates across tests. Clear history between
    // runs so each test starts from a known undo stack.
    clearHistory();
  });

  it('undo reverses the last mutation; redo replays it', () => {
    const before = initial().items.length;
    initial().addFurniture('lamp', { position: { x: 1, y: 0, z: 1 } });
    expect(initial().items).toHaveLength(before + 1);
    undo();
    expect(initial().items).toHaveLength(before);
    redo();
    expect(initial().items).toHaveLength(before + 1);
  });

  it('undo on an empty history is a no-op', () => {
    const lenBefore = initial().items.length;
    // zundo's undo on empty stack is a no-op — just verify it does not throw.
    expect(() => undo()).not.toThrow();
    expect(initial().items).toHaveLength(lenBefore);
  });
});
