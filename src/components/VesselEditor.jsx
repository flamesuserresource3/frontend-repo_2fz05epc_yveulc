import React, { useMemo, useState } from 'react';
import { ArrowLeft, Info, Camera, Cog, Anchor, Plus } from 'lucide-react';
import DeviceModal from './devices/DeviceModal.jsx';

const tabs = [
  { id: 'basic', name: 'Basic Info', icon: Info },
  { id: 'camera', name: 'Camera System', icon: Camera },
  { id: 'propulsion', name: 'Main Propulsion', icon: Cog },
  { id: 'bowThrusters', name: 'Bow Thrusters', icon: Anchor },
];

function Sidebar({ current, onChange }) {
  return (
    <div className="w-full max-w-[240px] border-r border-neutral-200 bg-white">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-neutral-600">Categories</h3>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {tabs.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-neutral-100 ${current === id ? 'bg-neutral-100 font-medium' : ''}`}
          >
            <Icon size={18} className="text-neutral-500" />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function BasicInfo({ vessel, onUpdate }) {
  const [form, setForm] = useState({ name: vessel.name, length: vessel.length, width: vessel.width, depth: vessel.depth });

  const handleSave = () => {
    const updated = { ...vessel, ...{ name: form.name, length: Number(form.length)||0, width: Number(form.width)||0, depth: Number(form.depth)||0 } };
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input value={form.name} onChange={e=>setForm(v=>({ ...v, name: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
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
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save Changes</button>
      </div>
    </div>
  );
}

function DeviceList({ title, items, onAdd, onEdit }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
          <Plus size={16} /> Add Device
        </button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">No devices yet</div>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          {items.map((d) => (
            <li key={d.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-neutral-500">{d.ip || 'No IP'} {d.mac ? `· ${d.mac}` : ''}</div>
              </div>
              <button onClick={()=>onEdit(d)} className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Edit</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function VesselEditor({ vessel, onBack, onChange }) {
  const [currentTab, setCurrentTab] = useState('basic');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const devicesByTab = useMemo(() => ({
    camera: vessel.devices.camera,
    propulsion: vessel.devices.propulsion,
    bowThrusters: vessel.devices.bowThrusters,
  }), [vessel]);

  const handleAddDevice = () => {
    setEditingDevice({ id: null, name: '' });
    setModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setModalOpen(true);
  };

  const saveDevice = (data) => {
    const id = data.id || ('d' + Math.random().toString(36).slice(2, 8));
    const newDevice = { ...data, id };

    const updatedVessel = { ...vessel, devices: { ...vessel.devices } };
    const listKey = currentTab; // camera | propulsion | bowThrusters
    const list = [...(updatedVessel.devices[listKey] || [])];
    const idx = list.findIndex(d => d.id === id);
    if (idx >= 0) list[idx] = newDevice; else list.push(newDevice);
    updatedVessel.devices[listKey] = list;
    onChange(updatedVessel);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-600 hover:bg-neutral-100">
          <ArrowLeft size={18} /> Back to list
        </button>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Editing</div>
          <div className="text-lg font-semibold">{vessel.name}</div>
        </div>
      </div>

      <div className="flex gap-6">
        <Sidebar current={currentTab} onChange={setCurrentTab} />
        <div className="flex-1">
          {currentTab === 'basic' && (
            <BasicInfo vessel={vessel} onUpdate={onChange} />
          )}
          {currentTab === 'camera' && (
            <DeviceList title="Camera Devices" items={devicesByTab.camera} onAdd={handleAddDevice} onEdit={handleEditDevice} />
          )}
          {currentTab === 'propulsion' && (
            <DeviceList title="Main Propulsion Devices" items={devicesByTab.propulsion} onAdd={handleAddDevice} onEdit={handleEditDevice} />
          )}
          {currentTab === 'bowThrusters' && (
            <DeviceList title="Bow Thruster Devices" items={devicesByTab.bowThrusters} onAdd={handleAddDevice} onEdit={handleEditDevice} />
          )}
        </div>
      </div>

      <DeviceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editingDevice}
        onSave={(data) => { saveDevice(data); setModalOpen(false); }}
      />
    </div>
  );
}
