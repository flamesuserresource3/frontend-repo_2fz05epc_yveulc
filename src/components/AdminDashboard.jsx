import React, { useMemo, useState } from 'react';

// Tabs available in device editor
const allTabs = [
  { id: 'general', label: 'General' },
  { id: 'network', label: 'Networking' },
  { id: 'notes', label: 'Notes' },
];

const TYPE_OPTIONS = [
  { value: 'boolean', label: 'Boolean' },
  { value: 'enum', label: 'Selection (Enum)' },
  { value: 'number', label: 'Number' },
];

export default function AdminDashboard({ settings, onUpdate, onBack }) {
  // Core state
  const [roles, setRoles] = useState(settings.roles?.length ? settings.roles : ['camera', 'plc', 'controller', 'sensor']);
  const [visibility, setVisibility] = useState(
    settings.visibility || {
      camera: { general: true, network: true, notes: true },
      plc: { general: true, network: true, notes: true },
      controller: { general: true, network: true, notes: true },
      sensor: { general: true, network: true, notes: true },
    }
  );

  // roleConfigs holds per-role configurable settings and model info
  // roleConfigs[role] = { settings: { key: def }, models: { [modelName]: { capabilities: { key: def }, overrides: { key: value } } } }
  const [roleConfigs, setRoleConfigs] = useState(settings.roleConfigs || {});

  // Large-scale navigation helpers (100+ roles)
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(() => roles[0] || '');

  const filteredRoles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .filter((r) => (q ? r.toLowerCase().includes(q) : true));
  }, [roles, query]);

  const addRole = (role) => {
    const r = role.trim().toLowerCase();
    if (!r) return;
    if (!roles.includes(r)) {
      const next = [...roles, r];
      setRoles(next);
      setSelectedRole(r);
      setVisibility((v) => ({ ...v, [r]: { general: true, network: true, notes: true } }));
      setRoleConfigs((rc) => ({ ...rc, [r]: rc[r] || { settings: {}, models: {} } }));
    }
  };

  const removeRole = (role) => {
    const nextRoles = roles.filter((r) => r !== role);
    const nextVis = { ...visibility };
    delete nextVis[role];
    const nextConfigs = { ...roleConfigs };
    delete nextConfigs[role];
    setRoles(nextRoles);
    setVisibility(nextVis);
    setRoleConfigs(nextConfigs);
    if (selectedRole === role) setSelectedRole(nextRoles[0] || '');
  };

  const toggleTab = (role, tab) => {
    setVisibility((v) => ({
      ...v,
      [role]: { ...v[role], [tab]: !v[role]?.[tab] },
    }));
  };

  // Role-level setting defs
  const upsertSetting = (role, key, setting) => {
    setRoleConfigs((rc) => ({
      ...rc,
      [role]: {
        settings: { ...(rc[role]?.settings || {}), [key]: setting },
        models: rc[role]?.models || {},
      },
    }));
  };

  const deleteSetting = (role, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const nextSettings = { ...current.settings };
      delete nextSettings[key];
      // Remove any model overrides for this key
      const nextModels = Object.fromEntries(
        Object.entries(current.models || {}).map(([m, cfg]) => {
          const ov = { ...(cfg.overrides || {}) };
          if (ov[key] !== undefined) delete ov[key];
          return [m, { ...cfg, overrides: ov }];
        })
      );
      return { ...rc, [role]: { settings: nextSettings, models: nextModels } };
    });
  };

  // Model management within a role
  const upsertModel = (role, modelName) => {
    const name = modelName.trim();
    if (!name) return;
    setRoleConfigs((rc) => ({
      ...rc,
      [role]: {
        settings: rc[role]?.settings || {},
        models: {
          ...(rc[role]?.models || {}),
          [name]: rc[role]?.models?.[name] || { capabilities: {}, overrides: {} },
        },
      },
    }));
  };

  const deleteModel = (role, modelName) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const nextModels = { ...(current.models || {}) };
      delete nextModels[modelName];
      return { ...rc, [role]: { ...current, models: nextModels } };
    });
  };

  // Model overrides for role settings
  const setModelOverride = (role, modelName, key, value) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const model = current.models?.[modelName] || { capabilities: {}, overrides: {} };
      return {
        ...rc,
        [role]: {
          ...current,
          models: {
            ...current.models,
            [modelName]: { ...model, overrides: { ...(model.overrides || {}), [key]: value } },
          },
        },
      };
    });
  };

  const removeModelOverride = (role, modelName, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const model = current.models?.[modelName] || { capabilities: {}, overrides: {} };
      const nextOverrides = { ...(model.overrides || {}) };
      delete nextOverrides[key];
      return {
        ...rc,
        [role]: {
          ...current,
          models: { ...current.models, [modelName]: { ...model, overrides: nextOverrides } },
        },
      };
    });
  };

  // Model capability definitions
  const upsertCapability = (role, modelName, key, def) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const model = current.models?.[modelName] || { capabilities: {}, overrides: {} };
      return {
        ...rc,
        [role]: {
          ...current,
          models: {
            ...current.models,
            [modelName]: { ...model, capabilities: { ...(model.capabilities || {}), [key]: def } },
          },
        },
      };
    });
  };

  const deleteCapability = (role, modelName, key) => {
    setRoleConfigs((rc) => {
      const current = rc[role] || { settings: {}, models: {} };
      const model = current.models?.[modelName] || { capabilities: {}, overrides: {} };
      const nextCaps = { ...(model.capabilities || {}) };
      delete nextCaps[key];
      return {
        ...rc,
        [role]: {
          ...current,
          models: { ...current.models, [modelName]: { ...model, capabilities: nextCaps } },
        },
      };
    });
  };

  const save = () => {
    onUpdate({ roles, visibility, roleConfigs });
    onBack();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-neutral-500">Manage roles, editor tabs, role configuration settings, and model capabilities/overrides.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="rounded-lg px-4 py-2 text-neutral-700 hover:bg-neutral-100">Cancel</button>
          <button onClick={save} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">Save Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Sidebar for scalable navigation */}
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
                    onClick={() => setSelectedRole(r)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm capitalize hover:bg-neutral-50 ${
                      selectedRole === r ? 'bg-neutral-100' : ''
                    }`}
                  >
                    <span className="truncate">{r}</span>
                    <span onClick={(e) => { e.stopPropagation(); removeRole(r); }} className="ml-2 cursor-pointer text-neutral-500 hover:text-red-600">×</span>
                  </button>
                ))}
              </div>
              <AddRole onAdd={addRole} />
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <div className="mb-2 text-sm font-semibold">Device editor tabs</div>
              {selectedRole ? (
                <div className="space-y-2">
                  {allTabs.map((t) => (
                    <label key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{t.label}</span>
                      <input type="checkbox" checked={!!visibility?.[selectedRole]?.[t.id]} onChange={() => toggleTab(selectedRole, t.id)} />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">Select a role to edit tabs</div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content for selected role */}
        <section className="md:col-span-8 lg:col-span-9">
          {!selectedRole && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-500">Select or add a role from the left to configure.</div>
          )}

          {selectedRole && (
            <div className="space-y-6">
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize">{selectedRole}</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-neutral-700">Role configurable settings</h4>
                    <SettingsEditor
                      settingsMap={roleConfigs[selectedRole]?.settings || {}}
                      onUpsert={(key, def) => upsertSetting(selectedRole, key, def)}
                      onDelete={(key) => deleteSetting(selectedRole, key)}
                    />
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-neutral-700">Models</h4>
                    <ModelsEditor
                      role={selectedRole}
                      settingsMap={roleConfigs[selectedRole]?.settings || {}}
                      modelsMap={roleConfigs[selectedRole]?.models || {}}
                      onUpsertModel={(name) => upsertModel(selectedRole, name)}
                      onDeleteModel={(name) => deleteModel(selectedRole, name)}
                      onSetOverride={(model, key, value) => setModelOverride(selectedRole, model, key, value)}
                      onRemoveOverride={(model, key) => removeModelOverride(selectedRole, model, key)}
                      onUpsertCapability={(model, key, def) => upsertCapability(selectedRole, model, key, def)}
                      onDeleteCapability={(model, key) => deleteCapability(selectedRole, model, key)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AddRole({ onAdd }) {
  const [value, setValue] = useState('');
  return (
    <div className="mt-3">
      <div className="text-xs text-neutral-500">Add a new role</div>
      <div className="mt-1 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., radar"
          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            onAdd(value);
            setValue('');
          }}
          className="rounded-md bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function SettingsEditor({ settingsMap, onUpsert, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    key: '',
    type: 'boolean',
    required: false,
    defaultValue: false,
    description: '',
    category: '',
    enumOptions: '',
    min: '',
    max: '',
  });

  const reset = () =>
    setForm({ key: '', type: 'boolean', required: false, defaultValue: false, description: '', category: '', enumOptions: '', min: '', max: '' });

  const startEdit = (k) => {
    const s = settingsMap[k];
    if (!s) return;
    setOpen(true);
    setForm({
      key: k,
      type: s.type,
      required: !!s.required,
      defaultValue: s.defaultValue ?? (s.type === 'boolean' ? false : s.type === 'number' ? 0 : ''),
      description: s.description || '',
      category: s.category || '',
      enumOptions: Array.isArray(s.enumOptions) ? s.enumOptions.join(',') : '',
      min: s.min ?? '',
      max: s.max ?? '',
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const key = form.key.trim();
    if (!key) return;

    let parsedDefault = form.defaultValue;
    if (form.type === 'boolean') parsedDefault = !!form.defaultValue;
    if (form.type === 'number') parsedDefault = form.defaultValue === '' ? '' : Number(form.defaultValue);

    const payload = {
      type: form.type,
      required: !!form.required,
      defaultValue: parsedDefault,
      description: form.description.trim(),
      category: form.category.trim(),
    };

    if (form.type === 'enum') {
      const opts = form.enumOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      payload.enumOptions = opts;
      if (payload.defaultValue && !opts.includes(payload.defaultValue)) {
        payload.defaultValue = opts[0] || '';
      }
    }
    if (form.type === 'number') {
      if (form.min !== '') payload.min = Number(form.min);
      if (form.max !== '') payload.max = Number(form.max);
    }

    onUpsert(key, payload);
    setOpen(false);
    reset();
  };

  return (
    <div className="rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-200 p-3">
        <div className="text-sm text-neutral-700">Define fields like toggles, enums, and numbers.</div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white hover:bg-neutral-800">
          {open ? 'Close' : 'Add setting'}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="ShowVideo" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Required</label>
            <select value={form.required ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, required: e.target.value === 'true' }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {form.type === 'enum' && (
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Options (comma separated)</label>
              <input value={form.enumOptions} onChange={(e) => setForm((f) => ({ ...f, enumOptions: e.target.value }))} placeholder="Low, Medium, High" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Default Value</label>
            {form.type === 'boolean' && (
              <select value={form.defaultValue ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, defaultValue: e.target.value === 'true' }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            )}
            {form.type === 'enum' && (
              <input value={form.defaultValue} onChange={(e) => setForm((f) => ({ ...f, defaultValue: e.target.value }))} placeholder="Default option" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            )}
            {form.type === 'number' && (
              <input type="number" value={form.defaultValue} onChange={(e) => setForm((f) => ({ ...f, defaultValue: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            )}
          </div>

          {form.type === 'number' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">Min</label>
                <input type="number" value={form.min} onChange={(e) => setForm((f) => ({ ...f, min: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Max</label>
                <input type="number" value={form.max} onChange={(e) => setForm((f) => ({ ...f, max: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Video" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save setting</button>
          </div>
        </form>
      )}

      <div className="divide-y divide-neutral-200">
        {Object.keys(settingsMap).length === 0 && (
          <div className="p-3 text-sm text-neutral-500">No settings yet.</div>
        )}
        {Object.entries(settingsMap).map(([key, s]) => (
          <div key={key} className="flex items-start justify-between gap-4 p-3">
            <div>
              <div className="font-medium">
                {key}{' '}
                <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs uppercase text-neutral-600">{s.type}</span>
              </div>
              <div className="text-xs text-neutral-500">{s.description || '—'}</div>
              <div className="mt-1 text-xs text-neutral-500">
                Required: {s.required ? 'Yes' : 'No'}
                {s.category ? ` · Category: ${s.category}` : ''}
                {s.type === 'enum' && Array.isArray(s.enumOptions) ? ` · Options: ${s.enumOptions.join(', ')}` : ''}
                {s.type === 'number' && (s.min !== undefined || s.max !== undefined) ? ` · Range: ${s.min ?? '—'} to ${s.max ?? '—'}` : ''}
                {' '}· Default: {String(s.defaultValue)}
              </div>
            </div>
            <div className="shrink-0 space-x-2">
              <button onClick={() => startEdit(key)} className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Edit</button>
              <button onClick={() => onDelete(key)} className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelsEditor({ role, settingsMap, modelsMap, onUpsertModel, onDeleteModel, onSetOverride, onRemoveOverride, onUpsertCapability, onDeleteCapability }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [newModelName, setNewModelName] = useState('');

  const [activeTab, setActiveTab] = useState('capabilities'); // capabilities | overrides

  const capabilityKeys = Object.keys(modelsMap[selectedModel]?.capabilities || {});
  const settingKeys = Object.keys(settingsMap || {});

  // Override inputs
  const [overrideKey, setOverrideKey] = useState('');
  const [overrideValue, setOverrideValue] = useState('');

  // Capability form state (reuse field builder)
  const [capFormOpen, setCapFormOpen] = useState(false);
  const [capForm, setCapForm] = useState({
    key: '',
    type: 'boolean',
    required: false,
    defaultValue: false,
    description: '',
    category: '',
    enumOptions: '',
    min: '',
    max: '',
  });

  const currentModel = modelsMap[selectedModel];
  const currentOverrides = currentModel?.overrides || {};
  const currentCapabilities = currentModel?.capabilities || {};

  const addModel = () => {
    if (!newModelName.trim()) return;
    onUpsertModel(newModelName.trim());
    setSelectedModel(newModelName.trim());
    setNewModelName('');
  };

  const addOverride = () => {
    if (!selectedModel || !overrideKey) return;
    const def = settingsMap[overrideKey];
    if (!def) return;

    let value = overrideValue;
    if (def.type === 'boolean') value = overrideValue === 'true' || overrideValue === true;
    if (def.type === 'number') value = overrideValue === '' ? '' : Number(overrideValue);

    onSetOverride(selectedModel, overrideKey, value);
    setOverrideKey('');
    setOverrideValue('');
  };

  const renderOverrideValueInput = () => {
    const def = settingsMap[overrideKey];
    if (!def) return (
      <input disabled className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-400" placeholder="Select a setting first" />
    );
    if (def.type === 'boolean') {
      return (
        <select value={overrideValue ? 'true' : 'false'} onChange={(e) => setOverrideValue(e.target.value === 'true')} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
          <option value="false">False</option>
          <option value="true">True</option>
        </select>
      );
    }
    if (def.type === 'enum') {
      return (
        <select value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
          <option value="">Select option</option>
          {(def.enumOptions || []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    }
    if (def.type === 'number') {
      return (
        <input type="number" value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2" />
      );
    }
    return (
      <input value={overrideValue} onChange={(e) => setOverrideValue(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2" />
    );
  };

  const startEditCap = (k) => {
    const s = currentCapabilities[k];
    if (!s) return;
    setCapFormOpen(true);
    setCapForm({
      key: k,
      type: s.type,
      required: !!s.required,
      defaultValue: s.defaultValue ?? (s.type === 'boolean' ? false : s.type === 'number' ? 0 : ''),
      description: s.description || '',
      category: s.category || '',
      enumOptions: Array.isArray(s.enumOptions) ? s.enumOptions.join(',') : '',
      min: s.min ?? '',
      max: s.max ?? '',
    });
  };

  const submitCap = (e) => {
    e.preventDefault();
    if (!selectedModel) return;
    const key = capForm.key.trim();
    if (!key) return;

    let parsedDefault = capForm.defaultValue;
    if (capForm.type === 'boolean') parsedDefault = !!capForm.defaultValue;
    if (capForm.type === 'number') parsedDefault = capForm.defaultValue === '' ? '' : Number(capForm.defaultValue);

    const payload = {
      type: capForm.type,
      required: !!capForm.required,
      defaultValue: parsedDefault,
      description: capForm.description.trim(),
      category: capForm.category.trim(),
    };

    if (capForm.type === 'enum') {
      const opts = capForm.enumOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      payload.enumOptions = opts;
      if (payload.defaultValue && !opts.includes(payload.defaultValue)) {
        payload.defaultValue = opts[0] || '';
      }
    }
    if (capForm.type === 'number') {
      if (capForm.min !== '') payload.min = Number(capForm.min);
      if (capForm.max !== '') payload.max = Number(capForm.max);
    }

    onUpsertCapability(selectedModel, key, payload);
    setCapFormOpen(false);
    setCapForm({ key: '', type: 'boolean', required: false, defaultValue: false, description: '', category: '', enumOptions: '', min: '', max: '' });
  };

  return (
    <div className="rounded-lg border border-neutral-200">
      <div className="border-b border-neutral-200 p-3">
        <div className="text-sm text-neutral-700">Create models for this role. Define model capabilities and override role defaults.</div>
      </div>

      <div className="space-y-4 p-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Select model</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
              <option value="">—</option>
              {Object.keys(modelsMap).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Add a new model</label>
            <div className="flex gap-2">
              <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="e.g., Sony-XYZ" className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={addModel} className="rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800">Add</button>
            </div>
          </div>
          {selectedModel && (
            <div className="md:self-end">
              <button onClick={() => { onDeleteModel(selectedModel); setSelectedModel(''); }} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete model</button>
            </div>
          )}
        </div>

        {selectedModel && (
          <div className="rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('capabilities')} className={`rounded-md px-3 py-1 text-sm ${activeTab === 'capabilities' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'}`}>Capabilities</button>
                <button onClick={() => setActiveTab('overrides')} className={`rounded-md px-3 py-1 text-sm ${activeTab === 'overrides' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'}`}>Overrides</button>
              </div>
              <div className="text-sm font-medium">{selectedModel}</div>
            </div>

            {activeTab === 'capabilities' && (
              <div className="space-y-3 p-3">
                <div className="rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between border-b border-neutral-200 p-3">
                    <div className="text-sm text-neutral-700">Define capability fields specific to this model.</div>
                    <button onClick={() => setCapFormOpen((v) => !v)} className="rounded-md bg-neutral-900 px-3 py-1 text-sm text-white hover:bg-neutral-800">{capFormOpen ? 'Close' : 'Add capability'}</button>
                  </div>

                  {capFormOpen && (
                    <form onSubmit={submitCap} className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Name</label>
                        <input value={capForm.key} onChange={(e) => setCapForm((f) => ({ ...f, key: e.target.value }))} placeholder="SupportsAudio" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Type</label>
                        <select value={capForm.type} onChange={(e) => setCapForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
                          {TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Required</label>
                        <select value={capForm.required ? 'true' : 'false'} onChange={(e) => setCapForm((f) => ({ ...f, required: e.target.value === 'true' }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
                          <option value="false">No</option>
                          <option value="true">Yes</option>
                        </select>
                      </div>

                      {capForm.type === 'enum' && (
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-sm font-medium">Options (comma separated)</label>
                          <input value={capForm.enumOptions} onChange={(e) => setCapForm((f) => ({ ...f, enumOptions: e.target.value }))} placeholder="On, Off" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      )}

                      <div>
                        <label className="mb-1 block text-sm font-medium">Default Value</label>
                        {capForm.type === 'boolean' && (
                          <select value={capForm.defaultValue ? 'true' : 'false'} onChange={(e) => setCapForm((f) => ({ ...f, defaultValue: e.target.value === 'true' }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none">
                            <option value="false">False</option>
                            <option value="true">True</option>
                          </select>
                        )}
                        {capForm.type === 'enum' && (
                          <input value={capForm.defaultValue} onChange={(e) => setCapForm((f) => ({ ...f, defaultValue: e.target.value }))} placeholder="Default option" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        )}
                        {capForm.type === 'number' && (
                          <input type="number" value={capForm.defaultValue} onChange={(e) => setCapForm((f) => ({ ...f, defaultValue: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                        )}
                      </div>

                      {capForm.type === 'number' && (
                        <>
                          <div>
                            <label className="mb-1 block text-sm font-medium">Min</label>
                            <input type="number" value={capForm.min} onChange={(e) => setCapForm((f) => ({ ...f, min: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium">Max</label>
                            <input type="number" value={capForm.max} onChange={(e) => setCapForm((f) => ({ ...f, max: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Category</label>
                        <input value={capForm.category} onChange={(e) => setCapForm((f) => ({ ...f, category: e.target.value }))} placeholder="Capabilities" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Description</label>
                        <textarea rows={3} value={capForm.description} onChange={(e) => setCapForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2">
                        <button type="button" onClick={() => { setCapFormOpen(false); setCapForm({ key: '', type: 'boolean', required: false, defaultValue: false, description: '', category: '', enumOptions: '', min: '', max: '' }); }} className="rounded-lg px-4 py-2 text-neutral-600 hover:bg-neutral-100">Cancel</button>
                        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save capability</button>
                      </div>
                    </form>
                  )}

                  <div className="divide-y divide-neutral-200">
                    {Object.keys(currentCapabilities).length === 0 && (
                      <div className="p-3 text-sm text-neutral-500">No capabilities yet.</div>
                    )}
                    {Object.entries(currentCapabilities).map(([key, s]) => (
                      <div key={key} className="flex items-start justify-between gap-4 p-3">
                        <div>
                          <div className="font-medium">
                            {key}{' '}
                            <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs uppercase text-neutral-600">{s.type}</span>
                          </div>
                          <div className="text-xs text-neutral-500">{s.description || '—'}</div>
                          <div className="mt-1 text-xs text-neutral-500">
                            Required: {s.required ? 'Yes' : 'No'}
                            {s.category ? ` · Category: ${s.category}` : ''}
                            {s.type === 'enum' && Array.isArray(s.enumOptions) ? ` · Options: ${s.enumOptions.join(', ')}` : ''}
                            {s.type === 'number' && (s.min !== undefined || s.max !== undefined) ? ` · Range: ${s.min ?? '—'} to ${s.max ?? '—'}` : ''}
                            {' '}· Default: {String(s.defaultValue)}
                          </div>
                        </div>
                        <div className="shrink-0 space-x-2">
                          <button onClick={() => startEditCap(key)} className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Edit</button>
                          <button onClick={() => onDeleteCapability(selectedModel, key)} className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'overrides' && (
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Role setting</label>
                    <select value={overrideKey} onChange={(e) => setOverrideKey(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2">
                      <option value="">Select setting</option>
                      {settingKeys.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Override value</label>
                    {renderOverrideValueInput()}
                  </div>
                  <div className="flex items-end">
                    <button onClick={addOverride} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Add override</button>
                  </div>
                </div>

                <div className="divide-y divide-neutral-200">
                  {Object.keys(currentOverrides).length === 0 && (
                    <div className="p-2 text-sm text-neutral-500">No overrides yet.</div>
                  )}
                  {Object.entries(currentOverrides).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between p-2">
                      <div>
                        <div className="font-medium">{k}</div>
                        <div className="text-xs text-neutral-500">Value: {String(v)}</div>
                      </div>
                      <button onClick={() => onRemoveOverride(selectedModel, k)} className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
