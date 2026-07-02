import NumberSlider from './NumberSlider';
import ColorInput from './ColorInput';
import { useRoomStore } from '../store/useRoomStore';
import { CATALOG } from '../store/catalog';

/** Editor for the currently selected furniture item. */
export default function ItemsPanel() {
  const items = useRoomStore((s) => s.items);
  const selectedId = useRoomStore((s) => s.selectedId);
  const room = useRoomStore((s) => s.room);
  const selectFurniture = useRoomStore((s) => s.selectFurniture);
  const moveFurniture = useRoomStore((s) => s.moveFurniture);
  const rotateFurniture = useRoomStore((s) => s.rotateFurniture);
  const setFurnitureColor = useRoomStore((s) => s.setFurnitureColor);
  const setFurnitureScale = useRoomStore((s) => s.setFurnitureScale);
  const removeFurniture = useRoomStore((s) => s.removeFurniture);

  if (items.length === 0) {
    return (
      <div className="text-sm text-neutral-500">
        No furniture yet. Add some from the catalog.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Items</h3>

      <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => selectFurniture(item.id === selectedId ? null : item.id)}
              className={`w-full text-left text-sm px-3 py-1.5 rounded transition ${
                item.id === selectedId
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
            >
              <span className="font-medium">{CATALOG[item.kind].label}</span>
              <span className="ml-2 text-xs opacity-70">
                ({item.position.x.toFixed(1)}, {item.position.z.toFixed(1)})
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedId &&
        items
          .filter((i) => i.id === selectedId)
          .map((item) => {
            const def = CATALOG[item.kind];
            const slotKeys: (keyof typeof item.colors)[] = ['primary', 'secondary', 'accent'];
            return (
              <div key={item.id} className="space-y-3 pt-3 border-t border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{def.label}</span>
                  <button
                    onClick={() => {
                      removeFurniture(item.id);
                    }}
                    className="text-xs bg-red-600 hover:bg-red-500 rounded px-2 py-1"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <NumberSlider
                    label="Position X"
                    value={item.position.x}
                    min={0}
                    max={room.width}
                    step={0.05}
                    unit="m"
                    onChange={(x) => moveFurniture(item.id, { ...item.position, x })}
                  />
                  <NumberSlider
                    label="Position Z"
                    value={item.position.z}
                    min={0}
                    max={room.length}
                    step={0.05}
                    unit="m"
                    onChange={(z) => moveFurniture(item.id, { ...item.position, z })}
                  />
                  <NumberSlider
                    label="Rotation"
                    value={(item.rotationY * 180) / Math.PI}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    onChange={(deg) => rotateFurniture(item.id, (deg * Math.PI) / 180)}
                  />
                  <NumberSlider
                    label="Scale X"
                    value={item.scale.x}
                    min={def.scaleRange.min}
                    max={def.scaleRange.max}
                    step={0.05}
                    onChange={(x) => setFurnitureScale(item.id, { x })}
                  />
                  <NumberSlider
                    label="Scale Z"
                    value={item.scale.z}
                    min={def.scaleRange.min}
                    max={def.scaleRange.max}
                    step={0.05}
                    onChange={(z) => setFurnitureScale(item.id, { z })}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs text-neutral-400">Colors</div>
                  {slotKeys.map((slot) => {
                    const v = item.colors[slot];
                    if (!v) return null;
                    return (
                      <ColorInput
                        key={slot}
                        label={slot}
                        value={v}
                        onChange={(hex) => setFurnitureColor(item.id, slot, hex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
    </div>
  );
}
