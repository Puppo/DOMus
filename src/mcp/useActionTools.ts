// WebMCP "actions" — mutating tools that drive the same Zustand store the UI uses.
//
// Critical pattern: each `handler` calls `useRoomStore.getState().<action>()`
// directly. No separate API layer, no duplication. The `readOnlyHint: false`
// (default) tells the LLM host these change visible state.

import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

import { useRoomStore, undo, redo, clearHistory } from '../store/useRoomStore';
import { CATALOG } from '../store/catalog';
import type { FurnitureColors, Vec3 } from '../store/types';

// ---- shared zod schemas ----

const Vec3Schema = z.object({
  x: z.number().describe('meters along room width (X) axis'),
  y: z.number().describe('meters above the floor; 0 = on the floor'),
  z: z.number().describe('meters along room length (Z) axis'),
});

const ColorsSchema = z.object({
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const HexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// ---- formatters ----

function itemsSummary(state: ReturnType<typeof useRoomStore.getState>) {
  return state.items.map((i) => ({
    id: i.id,
    kind: i.kind,
    position: i.position,
    rotationY: i.rotationY,
    scale: i.scale,
    colors: i.colors,
  }));
}

// ---- the hook ----

export function useActionTools() {
  // 1. Snapshot
  useWebMCP({
    name: 'get_room_state',
    description:
      'Return the full current room state — dimensions, colors, every furniture item with id/position/colors. Call this before mutating anything to read current values.',
    inputSchema: {},
    outputSchema: { state_json: z.string() },
    handler: async () => {
      const s = useRoomStore.getState();
      const snap = { room: s.room, items: itemsSummary(s), selectedId: s.selectedId };
      return { state_json: JSON.stringify(snap, null, 2) };
    },
  });

  // 2. Room dimensions
  useWebMCP({
    name: 'set_room_dimensions',
    description: 'Set the bedroom dimensions in meters. Width and length 2-20, height 2-4.',
    inputSchema: {
      width: z.number().min(2).max(20),
      length: z.number().min(2).max(20),
      height: z.number().min(2).max(4),
    },
    outputSchema: { message: z.string() },
    handler: async ({ width, length, height }) => {
      useRoomStore.getState().setRoom({ width, length, height });
      return { message: `Room dimensions set to ${width}×${length}×${height} m` };
    },
  });

  // 3. Room colors
  useWebMCP({
    name: 'set_room_colors',
    description: 'Set the wall and/or floor color of the room. Both args are optional 6-digit hex (#RRGGBB).',
    inputSchema: { wallColor: HexColor.optional(), floorColor: HexColor.optional() },
    outputSchema: { message: z.string() },
    handler: async ({ wallColor, floorColor }) => {
      useRoomStore.getState().setRoom({ ...(wallColor && { wallColor }), ...(floorColor && { floorColor }) });
      return { message: `Room colors updated${wallColor ? ` (walls ${wallColor})` : ''}${floorColor ? ` (floor ${floorColor})` : ''}` };
    },
  });

  // 4. Add furniture at exact coordinates
  useWebMCP({
    name: 'add_furniture',
    description:
      `Add a furniture item at exact room-local coordinates (meters). ` +
      `Room origin is at the (0,0,0) floor corner; x along room width, z along room length, y up. ` +
      `The store clamps the footprint to the room bounds — out-of-bounds placements are clamped silently. ` +
      `Returns the new item id, which you need for any later set_furniture_color / move_furniture / rotate_furniture calls.`,
    inputSchema: {
      kind: z.enum(['bed', 'nightstand', 'wardrobe', 'dresser', 'lamp']),
      position: Vec3Schema,
      rotationY: z.number().min(0).max(Math.PI * 2).optional()
        .describe('Rotation around the vertical axis, in radians. 0 = facing +Z, PI/2 = facing +X.'),
      scale: z.object({
        x: z.number().positive(),
        y: z.number().positive(),
        z: z.number().positive(),
      }).optional(),
      colors: ColorsSchema.optional(),
    },
    outputSchema: { id: z.string(), message: z.string() },
    handler: async ({ kind, position, rotationY, scale, colors }) => {
      const id = useRoomStore.getState().addFurniture(kind, {
        position: position as Vec3,
        rotationY,
        scale,
        colors: colors as FurnitureColors | undefined,
      });
      return { id, message: `Added ${kind} at (${position.x.toFixed(2)}, ${position.z.toFixed(2)}) id=${id}` };
    },
  });

  // 5. Remove furniture
  useWebMCP({
    name: 'remove_furniture',
    description: 'Remove a furniture item by id. Call list_furniture first if you need the id.',
    inputSchema: { id: z.string().uuid() },
    outputSchema: { message: z.string() },
    handler: async ({ id }) => {
      const before = useRoomStore.getState().items.length;
      useRoomStore.getState().removeFurniture(id);
      const after = useRoomStore.getState().items.length;
      return { message: after < before ? `Removed ${id}` : `No item with id ${id}` };
    },
  });

  // 6. List furniture (lightweight summary)
  useWebMCP({
    name: 'list_furniture',
    description: 'Return a one-line-per-item summary table (id, kind, position, colors). Use this to discover ids before mutating them.',
    inputSchema: {},
    outputSchema: { items_json: z.string() },
    handler: async () => {
      const items = useRoomStore.getState().items.map((i) => ({
        id: i.id,
        kind: i.kind,
        position: i.position,
        colors: i.colors,
      }));
      return { items_json: JSON.stringify(items, null, 2) };
    },
  });

  // 7. Set a color slot
  useWebMCP({
    name: 'set_furniture_color',
    description: 'Set one color slot of a furniture item. The slot depends on the kind: bed/nightstand/wardrobe/dresser/lamp all accept primary, secondary, accent (some slots may be unused).',
    inputSchema: {
      id: z.string().uuid(),
      slot: z.enum(['primary', 'secondary', 'accent']),
      hex: HexColor,
    },
    outputSchema: { message: z.string() },
    handler: async ({ id, slot, hex }) => {
      const exists = useRoomStore.getState().items.some((i) => i.id === id);
      if (!exists) return { message: `No item with id ${id}` };
      useRoomStore.getState().setFurnitureColor(id, slot, hex);
      return { message: `Set ${slot} of ${id} to ${hex}` };
    },
  });

  // 8. Set scale
  useWebMCP({
    name: 'set_furniture_scale',
    description: 'Set per-axis scale multipliers for a furniture item. Each axis is clamped to the kind-specific range.',
    inputSchema: {
      id: z.string().uuid(),
      x: z.number().positive().optional(),
      y: z.number().positive().optional(),
      z: z.number().positive().optional(),
    },
    outputSchema: { message: z.string() },
    handler: async ({ id, x, y, z }) => {
      const exists = useRoomStore.getState().items.some((i) => i.id === id);
      if (!exists) return { message: `No item with id ${id}` };
      useRoomStore.getState().setFurnitureScale(id, { ...(x !== undefined && { x }), ...(y !== undefined && { y }), ...(z !== undefined && { z }) });
      return { message: `Scaled ${id}` };
    },
  });

  // 9. Move
  useWebMCP({
    name: 'move_furniture',
    description: 'Move a furniture item to new (x, z) coordinates. Y is preserved. Position is clamped to room bounds.',
    inputSchema: {
      id: z.string().uuid(),
      x: z.number().describe('meters'),
      z: z.number().describe('meters'),
    },
    outputSchema: { message: z.string() },
    handler: async ({ id, x, z }) => {
      const item = useRoomStore.getState().items.find((i) => i.id === id);
      if (!item) return { message: `No item with id ${id}` };
      useRoomStore.getState().moveFurniture(id, { x, y: item.position.y, z });
      return { message: `Moved ${item.kind} to (${x.toFixed(2)}, ${z.toFixed(2)})` };
    },
  });

  // 10. Rotate
  useWebMCP({
    name: 'rotate_furniture',
    description: 'Rotate a furniture item around the vertical axis. rotationY is in radians [0, 2π).',
    inputSchema: {
      id: z.string().uuid(),
      rotationY: z.number().min(0).max(Math.PI * 2),
    },
    outputSchema: { message: z.string() },
    handler: async ({ id, rotationY }) => {
      const item = useRoomStore.getState().items.find((i) => i.id === id);
      if (!item) return { message: `No item with id ${id}` };
      useRoomStore.getState().rotateFurniture(id, rotationY);
      return { message: `Rotated ${item.kind} to ${((rotationY * 180) / Math.PI).toFixed(0)}°` };
    },
  });

  // 11. Undo
  useWebMCP({
    name: 'undo',
    description: 'Undo the last mutation. Reverts to the previous state of the scene.',
    inputSchema: {},
    outputSchema: { message: z.string() },
    handler: async () => {
      undo();
      return { message: 'Undid last change.' };
    },
  });

  // 12. Redo
  useWebMCP({
    name: 'redo',
    description: 'Redo the last undone mutation.',
    inputSchema: {},
    outputSchema: { message: z.string() },
    handler: async () => {
      redo();
      return { message: 'Redid last undone change.' };
    },
  });

  // 13. Reset (bonus — clears everything)
  useWebMCP({
    name: 'reset_room',
    description: 'Reset the room to default dimensions and remove all furniture. Cannot be undone except via the global undo stack.',
    inputSchema: {},
    outputSchema: { message: z.string() },
    handler: async () => {
      useRoomStore.getState().reset();
      clearHistory();
      return { message: 'Room reset to defaults, history cleared.' };
    },
  });
}
