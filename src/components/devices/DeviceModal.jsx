import React, { useEffect, useMemo, useState } from 'react';

const BASE_TABS = [
  { id: 'general', name: 'General' },
  { id: 'network', name: 'Networking' },
  { id: 'notes', name: 'Notes' },
];

export default function DeviceModal({ open, onClose, initial, onSave, settings }) {
  const [active, setActive] = useState('general');
  const [form, setForm] = useState({ id: null, name: '', ip: '', mac: '', notes: '', type: '' });

  useEffect(() => {
    if (open) {
      setActive('general');
      setForm({ id: initial?.id || null, name: initial?.name || '', ip: initial?.ip || '', mac: initial?.mac || '', notes: initial?.notes || '', type: initial?.type || '' });
    }
  }, [open, initial]);

  const allowedTabs = useMemo(() => {
    const role = (form.type || '').toLowerCase();
    const visibility = settings?.visibility?.[role];
    if (!visibility) return BASE_TABS; // no restrictions for unknown role or missing settings
    return BASE_TABS.filter(t => visibility[t.id]);
  }, [form.type, settings]);

  useEffect(() => {
    if (open) {
      const ids = allowedTabs.map(t => t.id);
      if (!ids.includes(active)) setActive(ids[0] || 'general');
    }
  }, [allowedTabs, active, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="text-lg font-semibold">{form.id ? 'Edit Device' : 'Add Device'}</h3>
          <button className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100" onClick={onClose}>Close</button>
        </div>
        <div className="flex">
          <div className="w-48 border-r border-neutral-200 bg-neutral-50">
            {allowedTabs.map(t => (
              <button key={t.id} onClick={()=>setActive(t.id)} className={`block w-full px-4 py-3 text-left text-sm hover:bg-neutral-100 ${active===t.id ? 'bg-neutral-100 font-medium' : ''}`}>
                {t.name}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex-1 p-5">
            {active === 'general' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">Device Name</label>
                  <input value={form.name} onChange={e=>setForm(v=>({ ...v, name: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Bridge Cam" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Type (Role)</label>
                  <input value={form.type} onChange={e=>setForm(v=>({ ...v, type: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="camera, plc, controller, sensor" />
                  <p className="mt-1 text-xs text-neutral-500">Tabs adapt based on role visibility set in Admin.</p>
                </div>
              </div>
            )}
            {active === 'network' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">IP Address</label>
                  <input value={form.ip} onChange={e=>setForm(v=>({ ...v, ip: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="10.0.0.10" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">MAC Address</label>
                  <input value={form.mac} onChange={e=>setForm(v=>({ ...v, mac: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="AA:BB:CC:DD:EE:FF" />
                </div>
              </div>
            )}
            {active === 'notes' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(v=>({ ...v, notes: e.target.value }))} rows={6} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes about this device..." />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
