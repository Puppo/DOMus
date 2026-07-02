// WebMCP "skills" — read-only advisor tools that return text guidance to the LLM.
//
// Each `useWebMCP` here registers a tool with `readOnlyHint: true` annotation
// (where the hook supports it), so an LLM host can call them freely without
// risk. None of these tools ever mutate the Zustand store.

import { useWebMCP } from '@mcp-b/react-webmcp';
import { z } from 'zod';

import {
  listStyles,
  getStyleGuide,
  suggestPalette,
  furnitureCombo,
  getPrinciple,
  suggestLayout,
} from './skills';

export function useSkillTools() {
  useWebMCP({
    name: 'list_room_styles',
    description:
      'List the bedroom design styles available in DOMus, each with a one-line tagline. Call this first when the user wants a designed room without naming a style.',
    inputSchema: {},
    outputSchema: { styles: z.string() },
    handler: async () => ({ styles: listStyles() }),
  });

  useWebMCP({
    name: 'get_style_guide',
    description:
      'Get the full design guide for one bedroom style — palette, rules, recommended furniture composition, and placement hints. Pass one of: scandinavian, japandi, boho, industrial, minimalist.',
    inputSchema: { style: z.string() },
    outputSchema: { guide: z.string() },
    handler: async ({ style }) => {
      const guide = getStyleGuide(style);
      return guide
        ? { guide }
        : { guide: `Unknown style "${style}". Available: scandinavian, japandi, boho, industrial, minimalist.` };
    },
  });

  useWebMCP({
    name: 'suggest_color_palette',
    description:
      'Return a 5-color coordinated palette (hex codes) for a given style. The keys are primary/secondary/accent/wall/floor and can be passed straight to set_room_colors and set_furniture_color.',
    inputSchema: {
      style: z.string(),
      baseHex: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .describe('Optional anchor hex color; the palette stays style-faithful either way.'),
    },
    outputSchema: { palette_json: z.string() },
    handler: async ({ style }) => {
      const p = suggestPalette(style);
      return p
        ? { palette_json: JSON.stringify(p, null, 2) }
        : { palette_json: `Unknown style "${style}".` };
    },
  });

  useWebMCP({
    name: 'suggest_layout',
    description:
      'Suggest an arrangement plan (in plain text with sample coordinates) tailored to a given style and the current room dimensions. Always call get_room_state first to read the current dimensions.',
    inputSchema: {
      style: z.string(),
      room: z.object({ width: z.number(), length: z.number() }),
    },
    outputSchema: { layout: z.string() },
    handler: async ({ style, room }) => {
      const layout = suggestLayout(style, room);
      return layout ? { layout } : { layout: `Unknown style "${style}".` };
    },
  });

  useWebMCP({
    name: 'furniture_combo_for_style',
    description:
      'Return a list of recommended furniture pieces (kind, target placement notes, palette) for a given style. Use this to plan the sequence of add_furniture calls.',
    inputSchema: { style: z.string() },
    outputSchema: { combo_json: z.string() },
    handler: async ({ style }) => {
      const c = furnitureCombo(style);
      return c
        ? { combo_json: JSON.stringify(c, null, 2) }
        : { combo_json: `Unknown style "${style}".` };
    },
  });

  useWebMCP({
    name: 'get_design_principles',
    description:
      'Return a short text on a single design principle. Useful for deepening a specific aspect (balance, rhythm, focal_point, lighting, proportion).',
    inputSchema: {
      topic: z.enum(['balance', 'rhythm', 'focal_point', 'lighting', 'proportion']),
    },
    outputSchema: { text: z.string() },
    handler: async ({ topic }) => {
      const text = getPrinciple(topic);
      return { text: text ?? `Unknown topic "${topic}".` };
    },
  });
}
