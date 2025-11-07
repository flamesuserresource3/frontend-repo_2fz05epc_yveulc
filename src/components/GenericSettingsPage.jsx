import React, { useState } from 'react';

function Section({ title, description, children }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-neutral-500">{hint}</div>}
      </div>
      <label className="inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <div className="peer h-6 w-10 rounded-full bg-neutral-300 after:absolute after:ml-1 after:mt-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-4 relative"></div>
      </label>
    </div>
  );
}

function KeyValueEditor({
  items,
  onAdd,
  onEdit,
  onRemove,
  emptyLabel = 'No items',
  addLabel = 'Add',
  valueRenderer,
}) {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key" className="rounded-lg border border-neutral-200 px-3 py-2 outline-none" />
        <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" className="rounded-lg border border-neutral-200 px-3 py-2 outline-none md:col-span-1" />
        <button
          onClick={() => {
            if (!keyInput.trim()) return;
            onAdd(keyInput.trim(), valueInput);
            setKeyInput('');
            setValueInput('');
          }}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800"
        >
          {addLabel}
        </button>
      </div>

      <div className="divide-y divide-neutral-200">
        {Object.keys(items || {}).length === 0 && (
          <div className="p-2 text-sm text-neutral-500">{emptyLabel}</div>
        )}
        {Object.entries(items || {}).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">{k}</div>
              <div className="text-xs text-neutral-500">{valueRenderer ? valueRenderer(v) : String(v)}</div>
            </div>
            <div className="space-x-2">
              <button onClick={() => onEdit(k, v)} className="rounded-md px-3 py-1 text-sm text-blue-600 hover:bg-blue-50">Edit</button>
              <button onClick={() => onRemove(k)} className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GenericSettingsPage({
  selectedRole,
  visibility,
  onToggleTab,
  roleSettings,
  onUpsertSetting,
  onDeleteSetting,
  models,
  onUpsertModel,
  onDeleteModel,
  onUpsertCapability,
  onDeleteCapability,
  onSetOverride,
  onRemoveOverride,
}) {
  const [modelName, setModelName] = useState('');

  return (
    <div className="space-y-6">
      {/* Device Editor Section */}
      <Section title="Device Editor" description="Control which sections appear when editing devices for this role.">
        <div className="space-y-2">
          <ToggleRow label="General" checked={!!visibility?.[selectedRole]?.general} onChange={() => onToggleTab(selectedRole, 'general')} />
          <ToggleRow label="Networking" checked={!!visibility?.[selectedRole]?.network} onChange={() => onToggleTab(selectedRole, 'network')} />
          <ToggleRow label="Notes" checked={!!visibility?.[selectedRole]?.notes} onChange={() => onToggleTab(selectedRole, 'notes')} />
        </div>
      </Section>

      {/* Capabilities Section */}
      <Section title="Capabilities" description="Define model-specific capability fields for this role.">
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Add model</label>
              <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="e.g., Sony-XYZ" className="w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none" />
            </div>
            <button onClick={() => { if (modelName.trim()) onUpsertModel(modelName.trim()); setModelName(''); }} className="h-10 rounded-lg bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-800">Add</button>
          </div>

          {Object.keys(models || {}).length === 0 && (
            <div className="rounded-md border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">No models yet. Add one above.</div>
          )}

          {Object.entries(models || {}).map(([name, cfg]) => (
            <div key={name} className="rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-200 p-3">
                <div className="font-medium">{name}</div>
                <button onClick={() => onDeleteModel(name)} className="rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
              <div className="grid gap-4 p-3 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold">Capability fields</div>
                  <KeyValueEditor
                    items={cfg.capabilities || {}}
                    onAdd={(k, v) => onUpsertCapability(name, k, { type: 'boolean', defaultValue: v === 'true' })}
                    onEdit={(k, v) => onUpsertCapability(name, k, v)}
                    onRemove={(k) => onDeleteCapability(name, k)}
                    emptyLabel="No capabilities"
                    addLabel="Add capability"
                    valueRenderer={(val) => `Type: ${val.type ?? 'boolean'} · Default: ${String(val.defaultValue)}`}
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold">Model overrides</div>
                  <KeyValueEditor
                    items={cfg.overrides || {}}
                    onAdd={(k, v) => onSetOverride(name, k, v)}
                    onEdit={(k, v) => onSetOverride(name, k, v)}
                    onRemove={(k) => onRemoveOverride(name, k)}
                    emptyLabel="No overrides"
                    addLabel="Add override"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Model Overrides Section (Role settings) */}
      <Section title="Model Overrides" description="Define default configuration values per model, overriding role-level settings.">
        <div className="text-sm text-neutral-500">Use the per-model override editors above to set specific values that replace role defaults when that model is selected.</div>
      </Section>
    </div>
  );
}
