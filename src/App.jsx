import React, { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import GenericAdminPage from './components/GenericAdminPage.jsx';
import VesselList from './components/VesselList.jsx';
import VesselEditor from './components/VesselEditor.jsx';

// Seed data to demonstrate functionality
const initialVessels = [
  {
    id: 'v1',
    name: 'Aurora Explorer',
    length: 72,
    width: 14,
    depth: 6,
    devices: {
      camera: [
        { id: 'd1', name: 'Bridge Cam', ip: '10.0.0.11', mac: 'AA:BB:CC:11:22:33', notes: 'Oversees bow', type: 'camera' },
      ],
      propulsion: [
        { id: 'd2', name: 'Main Engine Control', ip: '10.0.1.2', mac: 'AA:BB:CC:44:55:66', notes: 'Primary control unit', type: 'controller' },
      ],
      bowThrusters: [],
    },
  },
  {
    id: 'v2',
    name: 'Mariner One',
    length: 54,
    width: 11,
    depth: 5,
    devices: {
      camera: [],
      propulsion: [],
      bowThrusters: [
        { id: 'd3', name: 'Bow Thruster PLC', ip: '10.0.2.30', mac: 'AA:BB:CC:77:88:99', notes: 'Port side', type: 'plc' },
      ],
    },
  },
];

// Default admin settings for device editor tab visibility per role + empty roleConfigs
const defaultSettings = {
  roles: ['camera', 'plc', 'controller', 'sensor'],
  visibility: {
    camera: { general: true, network: true, notes: true },
    plc: { general: true, network: true, notes: false },
    controller: { general: true, network: true, notes: true },
    sensor: { general: true, network: false, notes: true },
  },
  roleConfigs: {},
};

export default function App() {
  const [route, setRoute] = useState('admin'); // home | editor | admin
  const [vessels, setVessels] = useState(initialVessels);
  const [activeVesselId, setActiveVesselId] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);

  const activeVessel = useMemo(() => vessels.find(v => v.id === activeVesselId) || null, [vessels, activeVesselId]);

  const handleCreateVessel = (payload) => {
    const id = 'v' + Math.random().toString(36).slice(2, 8);
    const newVessel = {
      id,
      name: payload.name?.trim() || 'Untitled Vessel',
      length: Number(payload.length) || 0,
      width: Number(payload.width) || 0,
      depth: Number(payload.depth) || 0,
      devices: { camera: [], propulsion: [], bowThrusters: [] },
    };
    setVessels(prev => [newVessel, ...prev]);
    setActiveVesselId(id);
    setRoute('editor');
  };

  const handleOpenVessel = (id) => {
    setActiveVesselId(id);
    setRoute('editor');
  };

  const handleUpdateVessel = (updated) => {
    setVessels(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteVessel = (id) => {
    setVessels(prev => prev.filter(v => v.id !== id));
    if (activeVesselId === id) {
      setActiveVesselId(null);
      setRoute('home');
    }
  };

  const goHome = () => { setRoute('home'); };
  const goAdmin = () => { setRoute('admin'); };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header onGoHome={goHome} onGoAdmin={goAdmin} />

      {route === 'home' && (
        <VesselList
          vessels={vessels}
          onOpenVessel={handleOpenVessel}
          onCreateVessel={handleCreateVessel}
          onDeleteVessel={handleDeleteVessel}
        />
      )}

      {route === 'editor' && activeVessel && (
        <VesselEditor
          vessel={activeVessel}
          onBack={() => { setRoute('home'); setActiveVesselId(null); }}
          onChange={handleUpdateVessel}
          settings={settings}
        />
      )}

      {route === 'admin' && (
        <GenericAdminPage
          initialSettings={settings}
          onSave={(s) => { setSettings(s); setRoute('home'); }}
          onCancel={() => setRoute('home')}
        />
      )}
    </div>
  );
}
