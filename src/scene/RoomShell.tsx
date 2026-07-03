import { useMemo } from 'react';
import { DoubleSide } from 'three';
import type { Room } from '../store/types';

interface Props {
  room: Room;
}

/**
 * Parametric room: floor (a thin box) + ceiling and 4 walls (zero-thickness
 * planes, each oriented with its normal pointing INTO the room). Because a
 * plane only has one visible face (default FrontSide renders only the side
 * the normal points toward), each wall/the ceiling is only rendered when the
 * camera is on the room-interior side of it. That makes whichever wall sits
 * between the camera and the room disappear automatically as the camera
 * orbits, while far walls keep showing their interior surface — a "dollhouse"
 * cutaway. (A thin box wouldn't work here: it has two real faces, so toggling
 * `side` just swaps which one draws — the wall stays opaque either way.)
 * The room is anchored at (0, 0, 0) on the floor corner.
 */
export default function RoomShell({ room }: Props) {
  const { width: w, length: l, height: h, wallColor, floorColor } = room;

  // Thickness used for the floor slab only. 0.05 m feels right for visual presence.
  const T = 0.05;

  const ceilingColor = useMemo(() => darken(wallColor, 0.85), [wallColor]);

  return (
    <group>
      {/* Floor */}
      <mesh position={[w / 2, -T / 2, l / 2]} receiveShadow>
        <boxGeometry args={[w, T, l]} />
        <meshStandardMaterial color={floorColor} roughness={0.85} />
      </mesh>

      {/* Ceiling — horizontal plane, normal pointing down (into the room). */}
      <mesh position={[w / 2, h, l / 2]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} />
      </mesh>

      {/* Wall along X = 0 (left) — normal points +X, into the room. */}
      <mesh position={[0, h / 2, l / 2]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[l, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} shadowSide={DoubleSide} />
      </mesh>
      {/* Wall along X = width (right) — normal points -X, into the room. */}
      <mesh position={[w, h / 2, l / 2]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[l, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} shadowSide={DoubleSide} />
      </mesh>
      {/* Wall along Z = 0 (front) — normal points +Z, into the room. */}
      <mesh position={[w / 2, h / 2, 0]} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} shadowSide={DoubleSide} />
      </mesh>
      {/* Wall along Z = length (back) — normal points -Z, into the room. */}
      <mesh position={[w / 2, h / 2, l]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} shadowSide={DoubleSide} />
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
