import { useMemo } from 'react';
import type { Room } from '../store/types';

interface Props {
  room: Room;
}

/**
 * Parametric room: floor + ceiling + 4 walls drawn as thin boxes positioned
 * along the room edges. The room is anchored at (0, 0, 0) on the floor corner.
 */
export default function RoomShell({ room }: Props) {
  const { width: w, length: l, height: h, wallColor, floorColor } = room;

  // Thickness used for walls. 0.05 m feels right for visual presence.
  const T = 0.05;

  const ceilingColor = useMemo(() => darken(wallColor, 0.85), [wallColor]);

  return (
    <group>
      {/* Floor */}
      <mesh position={[w / 2, -T / 2, l / 2]} receiveShadow>
        <boxGeometry args={[w, T, l]} />
        <meshStandardMaterial color={floorColor} roughness={0.85} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[w / 2, h + T / 2, l / 2]} receiveShadow>
        <boxGeometry args={[w, T, l]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} />
      </mesh>

      {/* Walls — two long (Z-aligned) and two short (X-aligned). */}
      {/* Wall along X = 0 (left) */}
      <mesh position={[-T / 2, h / 2, l / 2]} castShadow receiveShadow>
        <boxGeometry args={[T, h, l]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Wall along X = width (right) */}
      <mesh position={[w + T / 2, h / 2, l / 2]} castShadow receiveShadow>
        <boxGeometry args={[T, h, l]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Wall along Z = 0 (front) */}
      <mesh position={[w / 2, h / 2, -T / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, T]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Wall along Z = length (back) */}
      <mesh position={[w / 2, h / 2, l + T / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, T]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Tiny color darkening without pulling in a dependency. Only used for the ceiling. */
function darken(hex: string, factor: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  const r = Math.round(parseInt(m[1], 16) * factor);
  const g = Math.round(parseInt(m[2], 16) * factor);
  const b = Math.round(parseInt(m[3], 16) * factor);
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}
