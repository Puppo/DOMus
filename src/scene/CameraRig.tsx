import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useRoomStore } from '../store/useRoomStore';
import { getDefaultCameraPosition, getDefaultCameraTarget } from './cameraUtils';

/**
 * Keeps the camera framed on the room when dimensions change drastically.
 * Simple heuristic: position the camera so the room fits inside the view.
 */
export default function CameraRig() {
  const room = useRoomStore((s) => s.room);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    camera.position.copy(getDefaultCameraPosition(room));
    camera.lookAt(getDefaultCameraTarget(room));
  }, [room.width, room.length, room.height, camera]);

  return null;
}
