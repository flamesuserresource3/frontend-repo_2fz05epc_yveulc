import React, { useMemo, useState } from 'react';

const defaultTabs = [
  { id: 'general', label: 'General' },
  { id: 'network', label: 'Networking' },
  { id: 'notes', label: 'Notes' },
];

export default function RoleSidebar({ roles, visibility, selectedRole, onSelect, onAddRole, onRemoveRole }) {
  const [query, setQuery] = useState('');
  const [newRole, setNewRole] = useState('');

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .filter((r) => (q ? r.toLowerCase().includes(q) : true));
  }, [roles, query]);

  return (
    <aside className="md:col-span-4 lg:col-span-3">
      <div className="sticky top-4 space-y-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <div className="mb-2 text-sm font-semibold">Roles</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roles"
            className="mb-2 w-full rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="max-h-72 overflow-auto rounded-md border border-neutral-100">
            {filteredRoles.length === 0 && (
              <div className="p-2 text-sm text-neutral-500">No roles</div>
            )}
            {filteredRoles.map((r) => (
              <button
                key={r}
                onClick={() => onSelect(r)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm capitalize hover:bg-neutral-50 ${
                  selectedRole === r ? 'bg-neutral-100' : ''
                }`}
              >
                <span className="truncate">{r}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRole(r);
                  }}
                  className="ml-2 cursor-pointer text-neutral-500 hover:text-red-600"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-xs text-neutral-500">Add a new role</div>
            <div className="mt-1 flex gap-2">
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g., radar"
                className="flex-1 rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newRole.trim()) onAddRole(newRole.trim().toLowerCase());
                  setNewRole('');
                }}
                className="rounded-md bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {selectedRole && (
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <div className="mb-2 text-sm font-semibold">Device editor tabs</div>
            <div className="space-y-2">
              {defaultTabs.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span>{t.label}</span>
                  <input type="checkbox" checked={!!visibility?.[selectedRole]?.[t.id]} readOnly />
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-neutral-500">Edit in the main panel</div>
          </div>
        )}
      </div>
    </aside>
  );
}
