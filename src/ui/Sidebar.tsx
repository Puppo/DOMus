import { useState } from 'react';
import RoomPanel from './RoomPanel';
import CatalogPanel from './CatalogPanel';
import ItemsPanel from './ItemsPanel';
import HistoryPanel from './HistoryPanel';

type Tab = 'room' | 'catalog' | 'items' | 'history';

const TABS: { id: Tab; label: string }[] = [
  { id: 'room', label: 'Room' },
  { id: 'catalog', label: 'Add' },
  { id: 'items', label: 'Items' },
  { id: 'history', label: 'History' },
];

export default function Sidebar() {
  const [tab, setTab] = useState<Tab>('room');

  return (
    <aside className="w-80 bg-neutral-900 border-r border-neutral-800 flex flex-col">
      <header className="px-4 py-3 border-b border-neutral-800">
        <div className="text-base font-semibold">DOMus</div>
        <div className="text-xs text-neutral-500">3D Bedroom Configurator</div>
      </header>

      <nav className="flex border-b border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium uppercase tracking-wide transition ${
              tab === t.id
                ? 'bg-neutral-800 text-white border-b-2 border-blue-500'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {tab === 'room' && <RoomPanel />}
        {tab === 'catalog' && <CatalogPanel />}
        {tab === 'items' && <ItemsPanel />}
        {tab === 'history' && <HistoryPanel />}
      </div>

      <footer className="px-4 py-2 border-t border-neutral-800 text-xs text-neutral-500">
        State saved automatically · WebMCP tools available
      </footer>
    </aside>
  );
}
