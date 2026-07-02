import { useRoomStore } from '../store/useRoomStore';
import { CATALOG_LIST } from '../store/catalog';
import type { FurnitureKind } from '../store/types';

/** A list of available furniture kinds. Click "+" to add at room center. */
export default function CatalogPanel() {
  const addFurniture = useRoomStore((s) => s.addFurniture);
  const room = useRoomStore((s) => s.room);

  const onAdd = (kind: FurnitureKind) => {
    addFurniture(kind, {
      position: { x: room.width / 2, y: 0, z: room.length / 2 },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Add Furniture</h3>
      <ul className="space-y-2">
        {CATALOG_LIST.map((def) => (
          <li key={def.kind} className="flex items-center justify-between bg-neutral-800 rounded px-3 py-2">
            <span className="text-sm">{def.label}</span>
            <button
              onClick={() => onAdd(def.kind)}
              className="text-xs bg-blue-600 hover:bg-blue-500 rounded px-2 py-1 font-medium"
            >
              + Add
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-500">
        Click an item in the 3D view or the list on the right to edit it.
      </p>
    </div>
  );
}
