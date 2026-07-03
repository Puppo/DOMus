import { Vector3 } from 'three';
import type { Room } from '../store/types';

const AZIMUTH_DEG = 35; // rotate around Y from +Z axis — puts camera over a corner
const POLAR_DEG = 55; // angle from vertical; 0 = straight down, 90 = horizon

export function getDefaultCameraTarget(room: Room): Vector3 {
  return new Vector3(room.width / 2, room.height / 2, room.length / 2);
}

export function getDefaultCameraPosition(room: Room): Vector3 {
  const target = getDefaultCameraTarget(room);
  const diag = Math.hypot(room.width, room.length);
  const dist = Math.max(diag, room.height) * 1.4;
  const azimuth = (AZIMUTH_DEG * Math.PI) / 180;
  const polar = (POLAR_DEG * Math.PI) / 180;

  return new Vector3(
    target.x + dist * Math.sin(polar) * Math.sin(azimuth),
    target.y + dist * Math.cos(polar) + room.height * 0.3,
    target.z + dist * Math.sin(polar) * Math.cos(azimuth)
  );
}
