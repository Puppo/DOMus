// One Palette per style. The LLM receives these via `suggest_color_palette`
// and can pipe them straight into set_furniture_color calls.

import type { StyleId } from './types';

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  wall: string;
  floor: string;
  /** Short note on each color's role, surfaced to the LLM in `get_style_guide`. */
  roles: Record<keyof Omit<Palette, 'roles'>, string>;
}

export const PALETTES: Record<StyleId, Palette> = {
  scandinavian: {
    primary: '#2E3440', // bed frame, wardrobe
    secondary: '#E5D5C1', // bedding, lampshade
    accent: '#88B0A4', // textiles, plant
    wall: '#F5F1EA',
    floor: '#C9A77A',
    roles: {
      primary: 'charcoal — dark pieces (bed frame, wardrobe)',
      secondary: 'linen — soft surfaces (bedding, lampshade)',
      accent: 'sage — single accent color, used sparingly',
      wall: 'warm off-white — main wall color',
      floor: 'light oak — floor and large wood pieces',
    },
  },
  japandi: {
    primary: '#1F1B16',
    secondary: '#D9CFB8',
    accent: '#7A5C3E',
    wall: '#EFE9DD',
    floor: '#A88465',
    roles: {
      primary: 'near-black — minimal dark anchors',
      secondary: 'warm sand — soft textiles and lampshades',
      accent: 'aged walnut — wood accents and frames',
      wall: 'warm parchment — calm backdrop',
      floor: 'medium walnut — natural wood floor',
    },
  },
  boho: {
    primary: '#8B4513',
    secondary: '#D2B48C',
    accent: '#C04030',
    wall: '#F5E6D3',
    floor: '#A0522D',
    roles: {
      primary: 'saddle brown — wood frames, dresser',
      secondary: 'tan — woven textures, rugs',
      accent: 'terracotta — bold textile accent',
      wall: 'warm cream — soft wall color',
      floor: 'sienna — terracotta-toned floor or rug',
    },
  },
  industrial: {
    primary: '#1C1C1C',
    secondary: '#7A7A7A',
    accent: '#C49A3A',
    wall: '#D5D2CC',
    floor: '#2E2A26',
    roles: {
      primary: 'matte black — metal frames and lamps',
      secondary: 'concrete gray — wardrobes and side tables',
      accent: 'brass — hardware, lamp details',
      wall: 'cool gray — exposed-plaster wall',
      floor: 'charcoal — dark concrete or stained wood',
    },
  },
  minimalist: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    accent: '#888888',
    wall: '#FAFAFA',
    floor: '#F0F0F0',
    roles: {
      primary: 'pure white — large surfaces (bed, wardrobe)',
      secondary: 'soft gray — textiles and shade',
      accent: 'mid gray — subtle accents',
      wall: 'off-white — calm backdrop',
      floor: 'pale gray — bleached wood or polished concrete',
    },
  },
};
