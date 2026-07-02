// Dispatchers used by useSkillTools. Keep these pure so they can run safely
// inside readOnly skill tools.

import { STYLE_IDS, type StyleId } from './types';
import { PALETTES, type Palette } from './palettes';

import { SCANDINAVIAN_GUIDE } from './guides/ScandinavianGuide';
import { JAPANDI_GUIDE } from './guides/JapandiGuide';
import { BOHO_GUIDE } from './guides/BohoGuide';
import { INDUSTRIAL_GUIDE } from './guides/IndustrialGuide';
import { MINIMALIST_GUIDE } from './guides/MinimalistGuide';

const GUIDES: Record<StyleId, string> = {
  scandinavian: SCANDINAVIAN_GUIDE,
  japandi: JAPANDI_GUIDE,
  boho: BOHO_GUIDE,
  industrial: INDUSTRIAL_GUIDE,
  minimalist: MINIMALIST_GUIDE,
};

const TAGLINES: Record<StyleId, string> = {
  scandinavian: 'Warm minimalism, light wood, soft textiles, sage accent',
  japandi: 'Japanese restraint + Scandinavian warmth; asymmetric, negative space',
  boho: 'Layered textures, warm earth tones, mixed patterns, cozy corners',
  industrial: 'Matte black metal, weathered wood, exposed bulb, concrete',
  minimalist: 'Almost-empty room, white + gray, hidden storage, very calm',
};

export function listStyles(): string {
  return STYLE_IDS.map((id) => `${id}: ${TAGLINES[id]}`).join('\n');
}

export function getStyleGuide(style: string): string | null {
  if (!(STYLE_IDS as readonly string[]).includes(style)) return null;
  const guide = GUIDES[style as StyleId];
  const palette = PALETTES[style as StyleId];
  const paletteBlock = Object.entries(palette)
    .filter(([k]) => k !== 'roles')
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  const rolesBlock = Object.entries(palette.roles)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');
  return `${guide}\n\n## Palette roles (for reference)\n${rolesBlock}\n\n## Palette (hex)\n${paletteBlock}`;
}

export function suggestPalette(style: string, _baseHex?: string): Palette | null {
  if (!(STYLE_IDS as readonly string[]).includes(style)) return null;
  return PALETTES[style as StyleId];
}

export interface ComboEntry {
  kind: 'bed' | 'nightstand' | 'wardrobe' | 'dresser' | 'lamp';
  /** Suggested relative placement notes; the LLM translates these into exact coords. */
  placement: string;
  colors: Palette;
}

export function furnitureCombo(style: string): ComboEntry[] | null {
  if (!(STYLE_IDS as readonly string[]).includes(style)) return null;
  const palette = PALETTES[style as StyleId];
  switch (style as StyleId) {
    case 'scandinavian':
      return [
        { kind: 'bed',        placement: 'centered against back wall (z ≈ 0.4), headboard flush', colors: palette },
        { kind: 'nightstand', placement: 'left of bed (x ≈ room.width/2 − 1.1, z same as bed)', colors: palette },
        { kind: 'nightstand', placement: 'right of bed (x ≈ room.width/2 + 1.1, z same as bed)', colors: palette },
        { kind: 'wardrobe',   placement: 'right wall (x ≈ room.width − 0.3, z ≈ room.length/2)', colors: palette },
        { kind: 'lamp',       placement: 'on one of the nightstands (same x/z as that nightstand)', colors: palette },
      ];
    case 'japandi':
      return [
        { kind: 'bed',        placement: 'offset slightly off-center against back wall', colors: palette },
        { kind: 'nightstand', placement: 'ONE only, on one side, low and wide', colors: palette },
        { kind: 'wardrobe',   placement: 'tight into a back corner, dark walnut', colors: palette },
        { kind: 'dresser',    placement: 'opposite the bed, parallel to it', colors: palette },
      ];
    case 'boho':
      return [
        { kind: 'bed',        placement: 'centered against back wall', colors: palette },
        { kind: 'nightstand', placement: 'left of bed, slightly smaller than its pair', colors: palette },
        { kind: 'nightstand', placement: 'right of bed, taller and offset toward the room', colors: palette },
        { kind: 'wardrobe',   placement: 'front-right corner', colors: palette },
        { kind: 'dresser',    placement: 'parallel to the bed on the opposite wall', colors: palette },
        { kind: 'lamp',       placement: 'one floor lamp in an empty corner', colors: palette },
      ];
    case 'industrial':
      return [
        { kind: 'bed',        placement: 'centered against back wall, low metal frame', colors: palette },
        { kind: 'nightstand', placement: 'ONE nightstand, metal + wood, offset to one side', colors: palette },
        { kind: 'wardrobe',   placement: 'tight into a back corner, concrete gray', colors: palette },
        { kind: 'dresser',    placement: 'opposite the bed, low and long', colors: palette },
        { kind: 'lamp',       placement: 'exposed-bulb lamp on the nightstand', colors: palette },
      ];
    case 'minimalist':
      return [
        { kind: 'bed',        placement: 'centered against back wall, very low', colors: palette },
        // intentionally no nightstands
        { kind: 'wardrobe',   placement: 'opposite the bed, centered on that wall', colors: palette },
        { kind: 'dresser',    placement: 'parallel to the bed, on the opposite wall', colors: palette },
      ];
  }
}

const PRINCIPLES: Record<string, string> = {
  balance:
    'Balance = visual weight distributed across the room. Anchor one heavy piece (bed or wardrobe) on one wall and counter it with two medium pieces (nightstands + dresser) on the opposite wall. Avoid putting all the heavy pieces on the same side.',
  rhythm:
    'Rhythm = repeating motifs at different scales. Repeat wood tones across bed frame / dresser / wardrobe. Repeat lamp light sources in pairs. Repeat textile colors between bedding and a floor rug.',
  focal_point:
    'One clear focal point per room — usually the bed. Other furniture should support, not compete with it. Lights the focal point: bedside lamp(s) angled toward the headboard.',
  lighting:
    'Layer lighting: ambient (ceiling or window) + task (bedside lamp) + accent (floor lamp or plant light). Avoid a single overhead fixture; it flattens the room.',
  proportion:
    'Bed occupies ~⅓ of the room footprint. Wardrobe height ≈ 2 m max so it does not overpower a 2.7 m ceiling. Nightstand height should be within 5 cm of mattress top.',
};

export function getPrinciple(topic: string): string | null {
  return PRINCIPLES[topic] ?? null;
}

export function suggestLayout(style: string, room: { width: number; length: number }): string | null {
  if (!(STYLE_IDS as readonly string[]).includes(style)) return null;
  const cx = (room.width / 2).toFixed(2);
  const cz = (room.length / 2).toFixed(2);
  const headboardZ = 0.4;
  const lines = [
    `Room is ${room.width}×${room.length} m. Center is (${cx}, ${cz}).`,
    `Bed: position ≈ (${cx}, ${headboardZ}) with headboard against the back wall (z ≈ 0).`,
  ];
  switch (style as StyleId) {
    case 'scandinavian':
      lines.push(
        `Left  nightstand: position ≈ (${(room.width / 2 - 1.1).toFixed(2)}, ${(headboardZ + 0.1).toFixed(2)})`,
        `Right nightstand: position ≈ (${(room.width / 2 + 1.1).toFixed(2)}, ${(headboardZ + 0.1).toFixed(2)})`,
        `Wardrobe: position ≈ (${(room.width - 0.3).toFixed(2)}, ${cz})`,
      );
      break;
    case 'japandi':
      lines.push(
        `Skip one nightstand. Bed is offset slightly to one side.`,
        `Wardrobe: position ≈ (${(room.width - 0.3).toFixed(2)}, 0.3).`,
        `Dresser opposite bed: position ≈ (${cx}, ${(room.length - 0.25).toFixed(2)}).`,
      );
      break;
    case 'boho':
      lines.push(
        `Two nightstands, slightly offset from each other in scale and position.`,
        `Wardrobe in the front corner: position ≈ (${(room.width - 0.3).toFixed(2)}, ${(room.length - 0.3).toFixed(2)}).`,
      );
      break;
    case 'industrial':
      lines.push(
        `One nightstand: position ≈ (${(room.width / 2 - 1.1).toFixed(2)}, ${(headboardZ + 0.1).toFixed(2)}).`,
        `Wardrobe corner: position ≈ (${(room.width - 0.3).toFixed(2)}, 0.3).`,
        `Lamp on the nightstand (same x/z) for the exposed-bulb look.`,
      );
      break;
    case 'minimalist':
      lines.push(
        `Bed only on the back wall. NO nightstands.`,
        `Wardrobe: position ≈ (${cx}, ${(room.length - 0.3).toFixed(2)}) (opposite the bed).`,
        `Dresser parallel to bed: position ≈ (${cx}, ${(room.length - 0.25).toFixed(2)}).`,
      );
      break;
  }
  return lines.join('\n');
}
