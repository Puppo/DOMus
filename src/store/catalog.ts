// Static catalog of bedroom furniture. Single source of truth for:
//   - what furniture kinds exist
//   - default dimensions (the footprint for in-bounds placement)
//   - default colors per kind
//   - default scale per axis and acceptable scale ranges
//
// UI, the WebMCP add_furniture schema description, and the store validator
// all import from here. To add a new furniture kind, add an entry and a
// matching component in src/scene/furniture/.

import type { FurnitureColors, FurnitureKind } from './types';

export interface FurnitureDefinition {
  kind: FurnitureKind;
  label: string;
  /** Footprint in meters: [width, height, depth]. height = vertical extent. */
  footprint: [number, number, number];
  /** Per-axis scale ranges. Items scale uniformly via Vec3, so independent bounds matter. */
  scaleRange: { min: number; max: number };
  /** Default colors per slot. */
  defaultColors: FurnitureColors;
}

export const CATALOG: Record<FurnitureKind, FurnitureDefinition> = {
  bed: {
    kind: 'bed',
    label: 'Bed',
    footprint: [1.6, 0.5, 2.0],
    scaleRange: { min: 0.8, max: 1.6 },
    defaultColors: { primary: '#E5D5C1', secondary: '#A88B6B', accent: '#2E3440' },
  },
  nightstand: {
    kind: 'nightstand',
    label: 'Nightstand',
    footprint: [0.5, 0.55, 0.4],
    scaleRange: { min: 0.7, max: 1.4 },
    defaultColors: { primary: '#A88B6B', accent: '#C0A98C' },
  },
  wardrobe: {
    kind: 'wardrobe',
    label: 'Wardrobe',
    footprint: [1.2, 2.0, 0.6],
    scaleRange: { min: 0.7, max: 1.5 },
    defaultColors: { primary: '#2E3440', accent: '#4C566A' },
  },
  dresser: {
    kind: 'dresser',
    label: 'Dresser',
    footprint: [1.4, 0.85, 0.5],
    scaleRange: { min: 0.7, max: 1.5 },
    defaultColors: { primary: '#A88B6B', secondary: '#8B7355' },
  },
  lamp: {
    kind: 'lamp',
    label: 'Lamp',
    footprint: [0.3, 1.6, 0.3],
    scaleRange: { min: 0.6, max: 1.6 },
    defaultColors: { primary: '#1A1A1A', secondary: '#F0E6D2' },
  },
};

export const CATALOG_LIST: FurnitureDefinition[] = Object.values(CATALOG);
