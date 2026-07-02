// Core types shared across the store, UI, scene, and WebMCP layers.
//
// IMPORTANT: these types are the contract between UI and LLM-callable tools.
// Changing field names here is a breaking change for any persisted state and
// for any agent that has memorized the schema.

export type Vec3 = { x: number; y: number; z: number };

export type FurnitureKind = 'bed' | 'nightstand' | 'wardrobe' | 'dresser' | 'lamp';

/** Color slots used by parametric furniture. All optional; missing slots fall back to catalog defaults. */
export interface FurnitureColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export interface FurnitureItem {
  id: string;            // uuid
  kind: FurnitureKind;
  position: Vec3;        // meters, room-local
  rotationY: number;     // radians
  scale: Vec3;           // 1.0 default; per-kind min/max enforced by the store
  colors: FurnitureColors;
}

export interface Room {
  width: number;    // meters, X axis
  length: number;   // meters, Z axis
  height: number;   // meters, Y axis
  wallColor: string;
  floorColor: string;
}
