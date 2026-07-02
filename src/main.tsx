import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill';
import App from './App';
import './index.css';

// Initialize the WebMCP polyfill. No-op if `navigator.modelContext` is native
// (Chrome 138+); otherwise installs a window.postMessage bridge so MCP-B–aware
// clients can discover and call our tools.
initializeWebMCPPolyfill();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
