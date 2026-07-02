import type { FurnitureColors } from '../../store/types';

interface Props {
  colors: FurnitureColors;
  hovered?: boolean;
  selected?: boolean;
}

/** Footprint 1.4 x 0.85 x 0.5. Long low box with three drawer rows. */
export default function Dresser({ colors, hovered, selected }: Props) {
  const body = colors.primary ?? '#A88B6B';
  const drawer = colors.secondary ?? '#8B7355';
  const outline = selected ? '#60a5fa' : hovered ? '#fbbf24' : 'transparent';

  const rows = [-0.3, 0, 0.3];

  return (
    <group>
      <mesh position={[0, 0.425, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.85, 0.5]} />
        <meshStandardMaterial color={body} />
      </mesh>
      {rows.map((y) => (
        <group key={y}>
          <mesh position={[-0.45, 0.425 + y, 0.251]} castShadow>
            <boxGeometry args={[0.42, 0.22, 0.01]} />
            <meshStandardMaterial color={drawer} />
          </mesh>
          <mesh position={[0, 0.425 + y, 0.251]} castShadow>
            <boxGeometry args={[0.42, 0.22, 0.01]} />
            <meshStandardMaterial color={drawer} />
          </mesh>
          <mesh position={[0.45, 0.425 + y, 0.251]} castShadow>
            <boxGeometry args={[0.42, 0.22, 0.01]} />
            <meshStandardMaterial color={drawer} />
          </mesh>
        </group>
      ))}

      {outline !== 'transparent' && (
        <mesh position={[0, 0.425, 0]}>
          <boxGeometry args={[1.42, 0.87, 0.52]} />
          <meshBasicMaterial color={outline} wireframe />
        </mesh>
      )}
    </group>
  );
}
