import { useRoomStore } from '../store/useRoomStore';
import NumberSlider from './NumberSlider';
import ColorInput from './ColorInput';

/** Panel for room-level dimensions + wall/floor colors. */
export default function RoomPanel() {
  const room = useRoomStore((s) => s.room);
  const setRoom = useRoomStore((s) => s.setRoom);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Room</h3>

      <NumberSlider label="Width"  value={room.width}  min={2} max={20} step={0.1} unit="m" onChange={(width)  => setRoom({ width })} />
      <NumberSlider label="Length" value={room.length} min={2} max={20} step={0.1} unit="m" onChange={(length) => setRoom({ length })} />
      <NumberSlider label="Height" value={room.height} min={2} max={4}  step={0.05} unit="m" onChange={(height) => setRoom({ height })} />

      <div className="space-y-2 pt-2">
        <ColorInput label="Walls"  value={room.wallColor}  onChange={(wallColor)  => setRoom({ wallColor })} />
        <ColorInput label="Floor"  value={room.floorColor} onChange={(floorColor) => setRoom({ floorColor })} />
      </div>
    </div>
  );
}
