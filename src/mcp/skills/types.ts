export interface StyleMeta {
  id: string;
  label: string;
  tagline: string;
}

/** Style ids exposed to the LLM. Order matters: shown in `list_room_styles`. */
export const STYLE_IDS = ['scandinavian', 'japandi', 'boho', 'industrial', 'minimalist'] as const;
export type StyleId = (typeof STYLE_IDS)[number];
