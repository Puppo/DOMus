import { useTemporalState } from '../store/useTemporalState';
import { useRoomStore } from '../store/useRoomStore';

/** Undo/redo controls + history depth indicator. */
export default function HistoryPanel() {
  const { pastCount, futureCount, undo, redo } = useTemporalState();
  const reset = useRoomStore((s) => s.reset);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">History</h3>

      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={pastCount === 0}
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded px-3 py-1.5 text-xs font-medium"
        >
          ← Undo ({pastCount})
        </button>
        <button
          onClick={redo}
          disabled={futureCount === 0}
          className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed rounded px-3 py-1.5 text-xs font-medium"
        >
          Redo ({futureCount}) →
        </button>
      </div>

      <button
        onClick={() => {
          if (confirm('Reset the entire room?')) reset();
        }}
        className="w-full text-xs bg-red-900 hover:bg-red-800 rounded px-3 py-1.5"
      >
        Reset Room
      </button>
    </div>
  );
}
