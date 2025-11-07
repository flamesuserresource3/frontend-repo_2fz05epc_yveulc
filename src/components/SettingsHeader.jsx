import React from 'react';
import { Settings } from 'lucide-react';

export default function SettingsHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
          <Settings size={18} />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight">Role Settings</h1>
          <p className="text-sm text-neutral-500">Manage device editor sections, model capabilities, and model overrides</p>
        </div>
      </div>
    </header>
  );
}
