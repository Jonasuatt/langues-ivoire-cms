import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const STORAGE_PREFIX = 'langues_ivoire_cats_';

function loadCustomCats(key) {
  try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key) || '[]'); }
  catch { return []; }
}

function saveCustomCats(key, cats) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(cats));
}

export default function CategorySelect({
  value,
  onChange,
  options = [],
  storageKey = 'default',
  placeholder = '-- Choisir --',
  className = '',
}) {
  const [customCats, setCustomCats] = useState(() => loadCustomCats(storageKey));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const normalized = options.map(o =>
    typeof o === 'string'
      ? { value: o, label: o.charAt(0).toUpperCase() + o.slice(1).replace(/_/g, ' ') }
      : o,
  );

  const existingValues = new Set(normalized.map(o => o.value));
  const extraCats = customCats
    .filter(c => !existingValues.has(c))
    .map(c => ({
      value: c,
      label: c.charAt(0).toUpperCase() + c.slice(1).replace(/_/g, ' '),
    }));

  const allOptions = [...normalized, ...extraCats];

  if (value && !allOptions.some(o => o.value === value)) {
    allOptions.push({ value, label: value });
  }

  const confirm = () => {
    const trimmed = draft.trim();
    if (!trimmed) { setAdding(false); return; }
    const slug = trimmed.toLowerCase().replace(/[\s-]+/g, '_');
    if (!customCats.includes(slug)) {
      const newList = [...customCats, slug];
      setCustomCats(newList);
      saveCustomCats(storageKey, newList);
    }
    onChange(slug);
    setAdding(false);
    setDraft('');
  };

  const cancel = () => { setAdding(false); setDraft(''); };

  if (adding) {
    return (
      <div className={`flex gap-1 ${className}`}>
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel(); }}
          placeholder="Ex: transport, chasse, musique..."
          className="flex-1 border border-primary-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
        />
        <button onClick={confirm} title="Confirmer"
          className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex-shrink-0">
          <CheckIcon className="w-4 h-4" />
        </button>
        <button onClick={cancel} title="Annuler"
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={e => {
        if (e.target.value === '__new__') setAdding(true);
        else onChange(e.target.value);
      }}
      className={className}
    >
      {placeholder !== null && <option value="">{placeholder}</option>}
      {allOptions.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
      <option disabled value="__sep__">──────────────</option>
      <option value="__new__">➕ Nouvelle catégorie...</option>
    </select>
  );
}
