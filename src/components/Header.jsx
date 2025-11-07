import React from 'react';
import { Settings, Ship } from 'lucide-react';

export default function Header({ onGoHome, onGoAdmin }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button onClick={onGoHome} className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-neutral-800 hover:bg-neutral-100">
          <Ship size={18} />
          <span className="font-semibold">Vessel Manager</span>
        </button>
        <nav className="flex items-center gap-2">
          <button onClick={onGoAdmin} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
            <Settings size={18} /> Admin
          </button>
        </nav>
      </div>
    </header>
  );
}
