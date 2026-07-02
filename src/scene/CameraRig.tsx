import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useRoomStore } from '../store/useRoomStore';

/**
 * Keeps the camera framed on the room when dimensions change drastically.
 * Simple heuristic: position the camera so the room fits inside the view.
 */
export default function CameraRig() {
  const room = useRoomStore((s) => s.room);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    const maxDim = Math.max(room.width, room.length);
    const dist = maxDim * 1.8;
    camera.position.set(room.width / 2, room.height * 1.2, room.length / 2 + dist);
    camera.lookAt(room.width / 2, room.height / 2, room.length / 2);
  }, [room.width, room.length, room.height, camera]);

  return null;
}
