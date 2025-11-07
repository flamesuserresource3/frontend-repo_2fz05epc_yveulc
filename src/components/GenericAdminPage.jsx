import React, { useMemo, useState } from 'react';
import RoleSidebar from './RoleSidebar.jsx';
import GenericSettingsPage from './GenericSettingsPage.jsx';

const allTabs = [
  { id: 'general', label: 'General' },
  { id: 'network', label: 'Networking' },
  { id: 'notes', label: 'Notes' },
];

export default function GenericAdminPage({ initialSettings, onSave, onCancel }) {
  const [roles, setRoles] = useState(initialSettings.roles || []);
  const [visibility, setVisibility] = useState(initialSettings.visibility || {});
  const [roleConfigs, setRoleConfigs] = useState(initialSettings.roleConfigs || {});
  const [selectedRole, setSelectedRole] = useState(() => roles[0] || '');

  const addRole = (role) => {
    if (!role || roles.includes(role)) return;
    setRoles((r) => [...r, role]);
    setVisibility((v) => ({ ...v, [role]: { general: true, network: true, notes: true } }));
    setRoleConfigs((rc) => ({ ...rc, [role]: rc[role] || { settings: {}, models: {} } }));
    setSelectedRole(role);
  };

  const removeRole = (role) => {
    setRoles((r) => r.filter((x) => x !== role));
    setVisibility((v) => { const c = { ...v }; delete c[role]; return c; });
    setRoleConfigs((rc) => { const c = { ...rc }; delete c[role]; return c; });
    setSelectedRole((cur) => (cur === role ? '' : cur));
  };

  const toggleTab = (role, tab) => {
    setVisibility((v) => ({
      ...v,
      [role]: { ...v[role], [tab]: !v?.[role]?.[tab] },
    }));
  };

  // Role settings
  const upsertSetting = (role, key, def) => {
    setRoleConfigs((rc) => ({
      ...rc,
      [role]: { settings: { ...(rc[role]?.settings || {}), [key]: def }, models: rc[role]?.models || {} },
    }));
  };
  const deleteSetting = (role, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const next = { ...current.settings }; delete next[key];
      const nextModels = Object.fromEntries(
        Object.entries(current.models || {}).map(([m, cfg]) => {
          const ov = { ...(cfg.overrides || {}) }; delete ov[key];
          return [m, { ...cfg, overrides: ov }];
        })
      );
      return { ...rc, [role]: { settings: next, models: nextModels } };
    });
  };

  // Models
  const upsertModel = (role, name) => {
    const id = name.trim(); if (!id) return;
    setRoleConfigs((rc) => ({
      ...rc,
      [role]: {
        settings: rc[role]?.settings || {},
        models: { ...(rc[role]?.models || {}), [id]: rc[role]?.models?.[id] || { capabilities: {}, overrides: {} } },
      },
    }));
  };
  const deleteModel = (role, name) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const next = { ...(current.models || {}) }; delete next[name];
      return { ...rc, [role]: { ...current, models: next } };
    });
  };

  // Capabilities
  const upsertCapability = (role, model, key, def) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const m = current.models?.[model] || { capabilities: {}, overrides: {} };
      return {
        ...rc,
        [role]: {
          ...current,
          models: { ...current.models, [model]: { ...m, capabilities: { ...(m.capabilities || {}), [key]: def } } },
        },
      };
    });
  };
  const deleteCapability = (role, model, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const m = current.models?.[model] || { capabilities: {}, overrides: {} };
      const next = { ...(m.capabilities || {}) }; delete next[key];
      return { ...rc, [role]: { ...current, models: { ...current.models, [model]: { ...m, capabilities: next } } } };
    });
  };

  // Overrides
  const setOverride = (role, model, key, value) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const m = current.models?.[model] || { capabilities: {}, overrides: {} };
      return { ...rc, [role]: { ...current, models: { ...current.models, [model]: { ...m, overrides: { ...(m.overrides || {}), [key]: value } } } } };
    });
  };
  const removeOverride = (role, model, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const m = current.models?.[model] || { capabilities: {}, overrides: {} };
      const next = { ...(m.overrides || {}) }; delete next[key];
      return { ...rc, [role]: { ...current, models: { ...current.models, [model]: { ...m, overrides: next } } } };
    });
  };

  const save = () => onSave({ roles, visibility, roleConfigs });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-neutral-500">All roles on the left. iPhone-like sections on the right.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-neutral-700 hover:bg-neutral-100">Cancel</button>
          <button onClick={save} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <RoleSidebar
          roles={roles}
          visibility={visibility}
          selectedRole={selectedRole}
          onSelect={setSelectedRole}
          onAddRole={addRole}
          onRemoveRole={removeRole}
        />

        <section className="md:col-span-8 lg:col-span-9">
          {!selectedRole && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-500">Select or add a role to manage settings.</div>
          )}
          {selectedRole && (
            <GenericSettingsPage
              selectedRole={selectedRole}
              visibility={visibility}
              onToggleTab={toggleTab}
              roleSettings={roleConfigs[selectedRole]?.settings || {}}
              onUpsertSetting={(k, d) => upsertSetting(selectedRole, k, d)}
              onDeleteSetting={(k) => deleteSetting(selectedRole, k)}
              models={roleConfigs[selectedRole]?.models || {}}
              onUpsertModel={(name) => upsertModel(selectedRole, name)}
              onDeleteModel={(name) => deleteModel(selectedRole, name)}
              onUpsertCapability={(model, key, def) => upsertCapability(selectedRole, model, key, def)}
              onDeleteCapability={(model, key) => deleteCapability(selectedRole, model, key)}
              onSetOverride={(model, key, value) => setOverride(selectedRole, model, key, value)}
              onRemoveOverride={(model, key) => removeOverride(selectedRole, model, key)}
            />
          )}
        </section>
      </div>
    </div>
  );
}
