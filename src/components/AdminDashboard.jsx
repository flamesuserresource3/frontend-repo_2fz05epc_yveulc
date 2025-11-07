import React, { useMemo, useState } from 'react';

// Default roles and tab configuration
const defaultRoles = ['camera', 'plc', 'controller', 'sensor'];
const allTabs = [
  { id: 'general', label: 'General' },
  { id: 'network', label: 'Networking' },
  { id: 'notes', label: 'Notes' },
];

export default function AdminDashboard({ settings, onUpdate, onBack }) {
  const [roles, setRoles] = useState(settings.roles?.length ? settings.roles : defaultRoles);
  const [visibility, setVisibility] = useState(settings.visibility || {
    camera: { general: true, network: true, notes: true },
    plc: { general: true, network: true, notes: true },
    controller: { general: true, network: true, notes: true },
    sensor: { general: true, network: true, notes: true },
  });

  const addRole = (role) => {
    const r = role.trim().toLowerCase();
    if (!r) return;
    if (!roles.includes(r)) {
      const next = [...roles, r];
      setRoles(next);
      setVisibility(v => ({ ...v, [r]: { general: true, network: true, notes: true } }));
    }
  };

  const toggle = (role, tab) => {
    setVisibility(v => ({
      ...v,
      [role]: { ...v[role], [tab]: !v[role]?.[tab] },
    }));
  };

  const save = () => {
    onUpdate({ roles, visibility });
    onBack();
  };

  const removeRole = (role) => {
    const nextRoles = roles.filter(r => r !== role);
    const nextVis = { ...visibility };
    delete nextVis[role];
    setRoles(nextRoles);
    setVisibility(nextVis);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">Configure which tabs are visible in the device editor for each device role.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="rounded-lg px-4 py-2 text-neutral-700 hover:bg-neutral-100">Cancel</button>
          <button onClick={save} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save Settings</button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="mb-3 font-semibold">Device Roles</h3>
        <RoleEditor roles={roles} onAdd={addRole} onRemove={removeRole} />
      </div>

      <div className="space-y-4">
        {roles.map(role => (
          <div key={role} className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold capitalize">{role}</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {allTabs.map(t => (
                <label key={t.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!visibility[role]?.[t.id]} onChange={()=>toggle(role, t.id)} />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleEditor({ roles, onAdd, onRemove }) {
  const [value, setValue] = useState('');
  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Add role (e.g., radar)" className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={()=>{ onAdd(value); setValue(''); }} className="rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {roles.map(r => (
          <span key={r} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm capitalize">
            {r}
            <button onClick={()=>onRemove(r)} className="text-neutral-500 hover:text-red-600">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
