import type { FurnitureColors } from '../../store/types';

interface Props {
  colors: FurnitureColors;
  hovered?: boolean;
  selected?: boolean;
}

/** Footprint 1.2 x 2.0 x 0.6. Tall box with two door panels and handles. */
export default function Wardrobe({ colors, hovered, selected }: Props) {
  const body = colors.primary ?? '#2E3440';
  const doors = colors.accent ?? '#4C566A';
  const handle = '#C0C0C0';
  const outline = selected ? '#60a5fa' : hovered ? '#fbbf24' : 'transparent';

  return (
    <group>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.0, 0.6]} />
        <meshStandardMaterial color={body} />
      </mesh>
      {/* Doors */}
      <mesh position={[-0.3, 1.0, 0.301]} castShadow>
        <boxGeometry args={[0.58, 1.85, 0.01]} />
        <meshStandardMaterial color={doors} />
      </mesh>
      <mesh position={[0.3, 1.0, 0.301]} castShadow>
        <boxGeometry args={[0.58, 1.85, 0.01]} />
        <meshStandardMaterial color={doors} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.05, 1.0, 0.31]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={handle} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.05, 1.0, 0.31]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={handle} metalness={0.8} roughness={0.2} />
      </mesh>

      {outline !== 'transparent' && (
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.22, 2.02, 0.62]} />
          <meshBasicMaterial color={outline} wireframe />
        </mesh>
      )}
    </group>
  );
}
