import type { FurnitureColors } from '../../store/types';

interface Props {
  colors: FurnitureColors;
  hovered?: boolean;
  selected?: boolean;
}

/** A Scandinavian-friendly bed: low frame, mattress, headboard, two pillows. All parametric. */
export default function Bed({ colors, hovered, selected }: Props) {
  const frame = colors.primary ?? '#E5D5C1';
  const mattress = colors.secondary ?? '#A88B6B';
  const headboard = colors.accent ?? '#2E3440';
  const outline = selected ? '#60a5fa' : hovered ? '#fbbf24' : 'transparent';

  // Footprint is 1.6 x 0.5 x 2.0 (W,H,D). The component receives no transform —
  // its parent applies position/rotation/scale. Local origin at floor center.
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.3, 2.0]} />
        <meshStandardMaterial color={frame} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.95]} />
        <meshStandardMaterial color={mattress} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.55, -0.95]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.0, 0.1]} />
        <meshStandardMaterial color={headboard} />
      </mesh>
      {/* Two pillows */}
      <mesh position={[-0.4, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.4, 0.55, -0.7]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {outline !== 'transparent' && (
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.62, 0.52, 2.02]} />
          <meshBasicMaterial color={outline} wireframe />
        </mesh>
      )}
    </group>
  );
}
