import type { FurnitureColors } from '../../store/types';

interface Props {
  colors: FurnitureColors;
  hovered?: boolean;
  selected?: boolean;
}

/** Footprint 0.5 x 0.55 x 0.4. Box with one drawer plane and a tiny knob. */
export default function Nightstand({ colors, hovered, selected }: Props) {
  const body = colors.primary ?? '#A88B6B';
  const drawer = colors.accent ?? '#C0A98C';
  const outline = selected ? '#60a5fa' : hovered ? '#fbbf24' : 'transparent';

  return (
    <group>
      <mesh position={[0, 0.275, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.55, 0.4]} />
        <meshStandardMaterial color={body} />
      </mesh>
      {/* Drawer panel */}
      <mesh position={[0, 0.275, 0.201]} castShadow>
        <boxGeometry args={[0.42, 0.42, 0.01]} />
        <meshStandardMaterial color={drawer} />
      </mesh>
      {/* Knob */}
      <mesh position={[0, 0.275, 0.21]} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
      </mesh>

      {outline !== 'transparent' && (
        <mesh position={[0, 0.275, 0]}>
          <boxGeometry args={[0.52, 0.57, 0.42]} />
          <meshBasicMaterial color={outline} wireframe />
        </mesh>
      )}
    </group>
  );
}
