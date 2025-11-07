import React, { useMemo, useState } from 'react';
import { Plus, Ship, Search, Filter, Trash2 } from 'lucide-react';

function CreateVesselModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', length: '', width: '', depth: '' });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Vessel</h3>
          <button className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100" onClick={onClose}>Close</button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input value={form.name} onChange={e=>setForm(v=>({ ...v, name: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Ocean Pioneer" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Length (m)</label>
            <input type="number" value={form.length} onChange={e=>setForm(v=>({ ...v, length: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Width (m)</label>
            <input type="number" value={form.width} onChange={e=>setForm(v=>({ ...v, width: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Depth (m)</label>
            <input type="number" value={form.depth} onChange={e=>setForm(v=>({ ...v, depth: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VesselCard({ vessel, onOpen, onDelete }) {
  return (
    <div className="group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Ship size={20} />
          </div>
          <div>
            <h4 className="font-semibold leading-tight">{vessel.name}</h4>
            <p className="text-sm text-neutral-500">
              {vessel.length}m L × {vessel.width}m W × {vessel.depth}m D
            </p>
          </div>
        </div>
        <button title="Delete" onClick={()=>onDelete(vessel.id)} className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-red-600">
          <Trash2 size={18} />
        </button>
      </div>
      <button onClick={()=>onOpen(vessel.id)} className="mt-4 w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">Open Editor</button>
    </div>
  );
}

export default function VesselList({ vessels, onOpenVessel, onCreateVessel, onDeleteVessel }) {
  const [query, setQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [openCreate, setOpenCreate] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vessels
      .filter(v => (q ? v.name.toLowerCase().includes(q) : true))
      .filter(v => {
        if (sizeFilter === 'all') return true;
        const len = Number(v.length) || 0;
        if (sizeFilter === 'small') return len < 50;
        if (sizeFilter === 'medium') return len >= 50 && len < 80;
        if (sizeFilter === 'large') return len >= 80;
        return true;
      });
  }, [vessels, query, sizeFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vessels</h1>
          <p className="text-sm text-neutral-500">Browse, search, and manage all vessels in your fleet.</p>
        </div>
        <button onClick={()=>setOpenCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          <Plus size={18} />
          New Vessel
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="col-span-2 flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
          <Search size={18} className="text-neutral-400" />
          <input value={query} onChange={e=>setQuery(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Search vessels by name" />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
          <Filter size={18} className="text-neutral-400" />
          <select value={sizeFilter} onChange={e=>setSizeFilter(e.target.value)} className="w-full bg-transparent outline-none">
            <option value="all">All sizes</option>
            <option value="small">Small (&lt;50m)</option>
            <option value="medium">Medium (50-79m)</option>
            <option value="large">Large (80m+)</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
          No vessels found. Try adjusting your search or create a new vessel.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => (
            <VesselCard key={v.id} vessel={v} onOpen={onOpenVessel} onDelete={onDeleteVessel} />
          ))}
        </div>
      )}

      <CreateVesselModal open={openCreate} onClose={()=>setOpenCreate(false)} onSubmit={onCreateVessel} />
    </div>
  );
}
