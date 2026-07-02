import type { FurnitureColors } from '../../store/types';

interface Props {
  colors: FurnitureColors;
  hovered?: boolean;
  selected?: boolean;
}

/** Footprint 0.3 x 1.6 x 0.3. Cylindrical base + truncated cone shade + bulb glow. */
export default function Lamp({ colors, hovered, selected }: Props) {
  const base = colors.primary ?? '#1A1A1A';
  const shade = colors.secondary ?? '#F0E6D2';
  const outline = selected ? '#60a5fa' : hovered ? '#fbbf24' : 'transparent';

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.04, 24]} />
        <meshStandardMaterial color={base} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.15, 12]} />
        <meshStandardMaterial color={base} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Shade (cone, slightly larger at bottom) */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.22, 0.4, 24, 1, true]} />
        <meshStandardMaterial color={shade} side={2} />
      </mesh>
      {/* Bulb (emits light) */}
      <pointLight position={[0, 1.3, 0]} intensity={2} distance={4} color="#FFE0B2" />
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial emissive="#FFE0B2" emissiveIntensity={1} color="#fff7e6" />
      </mesh>

      {outline !== 'transparent' && (
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.32, 1.62, 0.32]} />
          <meshBasicMaterial color={outline} wireframe />
        </mesh>
      )}
    </group>
  );
}
