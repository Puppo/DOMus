import { useEffect } from 'react';
import Sidebar from './ui/Sidebar';
import Scene from './scene/Scene';
import { useSkillTools } from './mcp/useSkillTools';
import { useActionTools } from './mcp/useActionTools';

export default function App() {
  // Register WebMCP tools — both runs during render are valid because
  // useWebMCP uses an effect internally. Calling these unconditionally
  // ensures tools are exposed whether the LLM host or the UI is the "first".
  useSkillTools();
  useActionTools();

  useEffect(() => {
    document.title = 'DOMus — 3D Bedroom Configurator';
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950">
      <Sidebar />
      <main className="flex-1 relative">
        <Scene />
      </main>
    </div>
  );
}
