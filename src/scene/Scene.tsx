import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRoomStore } from '../store/useRoomStore';
import RoomShell from './RoomShell';
import FurnitureMesh from './FurnitureMesh';
import CameraRig from './CameraRig';

export default function Scene() {
  const room = useRoomStore((s) => s.room);
  const items = useRoomStore((s) => s.items);

  return (
    <Canvas
      shadows
      camera={{ position: [room.width / 2, room.height * 1.2, room.length / 2 + 8], fov: 45 }}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
    >
      {/* Clicking empty space deselects */}
      <mesh
        position={[room.width / 2, 0, room.length / 2]}
        onClick={(e) => {
          // Only deselect when the floor itself was clicked, not bubbled from furniture.
          if ((e as any).object?.geometry?.type === 'BoxGeometry') {
            useRoomStore.getState().selectFurniture(null);
          }
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[room.width, room.height * 2, room.length]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-room.width, room.height, -room.length]} intensity={0.3} />

      <RoomShell room={room} />

      {items.map((item) => (
        <FurnitureMesh key={item.id} item={item} />
      ))}

      <OrbitControls makeDefault target={[room.width / 2, room.height / 2, room.length / 2]} />
      <CameraRig />
    </Canvas>
  );
}
