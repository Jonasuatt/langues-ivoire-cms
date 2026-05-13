/**
 * LanguageSelect — Liste déroulante de langues avec recherche intégrée
 *
 * Mode simple  (multiple=false) : value = string,   onChange(string)
 * Mode multiple (multiple=true)  : value = string[], onChange(string[])
 */
import { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon, XMarkIcon,
  ChevronDownIcon, CheckIcon,
} from '@heroicons/react/24/outline';

export default function LanguageSelect({
  languages  = [],            // [{ id, nom, code? }]
  value,                      // string | string[]
  onChange,                   // (val) => void
  multiple   = false,
  allLabel   = 'Toutes les langues',
  showAll    = true,          // afficher l'option "Toutes"
  placeholder = '',
  className  = '',
  disabled   = false,
  valueKey   = 'id',          // 'id' ou 'code' — clé utilisée comme valeur de retour
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const containerRef        = useRef(null);
  const inputRef            = useRef(null);

  /* ── Fermer si clic extérieur ── */
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Focus sur le champ recherche à l'ouverture ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch('');
  }, [open]);

  /* ── Valeurs normalisées ── */
  const selected = multiple
    ? (Array.isArray(value) ? value : [])
    : value ?? '';

  /* ── Langues filtrées ── */
  const filtered = languages.filter(l =>
    l.nom.toLowerCase().includes(search.toLowerCase()) ||
    (l.code ?? '').toLowerCase().includes(search.toLowerCase())
  );

  /* ── Helpers ── */
  /* ── Valeur retournée par onChange (id ou code) ── */
  const getVal = (lang) => {
    if (valueKey === 'code') return lang.code ?? lang.id;
    return lang.id ?? lang.code;
  };

  const isSelected = (lang) => {
    const v = getVal(lang);
    return multiple ? selected.includes(v) : selected === v;
  };

  const toggle = (lang) => {
    const v = getVal(lang);
    if (multiple) {
      onChange(selected.includes(v)
        ? selected.filter(s => s !== v)
        : [...selected, v]);
    } else {
      onChange(v);
      setOpen(false);
    }
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  /* ── Label affiché ── */
  const displayLabel = () => {
    if (multiple) {
      if (selected.length === 0) return allLabel;
      if (selected.length === 1) {
        const lang = languages.find(l => l.id === selected[0] || l.code === selected[0]);
        return lang?.nom ?? selected[0];
      }
      return `${selected.length} langue${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''}`;
    }
    if (!selected) return allLabel;
    const lang = languages.find(l => l.id === selected || l.code === selected);
    return lang?.nom ?? selected;
  };

  const hasValue = multiple ? selected.length > 0 : !!selected;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ── Déclencheur ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`input flex items-center gap-2 w-full text-left min-w-[160px] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${hasValue ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="flex-1 truncate text-sm">{displayLabel()}</span>
        {hasValue && !multiple && (
          <button
            type="button"
            onClick={clear}
            className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0"
            title="Effacer">
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        )}
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[220px]">
          {/* Champ recherche */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => e.key === 'Escape' && setOpen(false)}
                placeholder="Rechercher une langue…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 bg-gray-50"
              />
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-60 overflow-y-auto">
            {/* Option "Toutes" */}
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange(multiple ? [] : ''); if (!multiple) setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                  !hasValue
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  !hasValue ? 'bg-primary-500' : 'border border-gray-300'
                }`}>
                  {!hasValue && <CheckIcon className="w-3 h-3 text-white" />}
                </span>
                <span className="italic">{allLabel}</span>
              </button>
            )}

            {/* Séparateur si résultats filtrés */}
            {search && filtered.length > 0 && (
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </p>
            )}

            {/* Langues */}
            {filtered.map(lang => {
              const key = lang.id ?? lang.code;
              const on = isSelected(lang);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggle(lang)}
                  className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    on ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    on ? 'bg-primary-500' : 'border border-gray-300 bg-white'
                  }`}>
                    {on && <CheckIcon className="w-3 h-3 text-white" />}
                  </span>
                  <span className="flex-1">{lang.nom}</span>
                  {lang.code && (
                    <span className="text-[10px] text-gray-400 font-mono">{lang.code}</span>
                  )}
                </button>
              );
            })}

            {/* Aucun résultat */}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucune langue trouvée pour « {search} »
              </p>
            )}
          </div>

          {/* Pied : compteur + effacer (mode multiple) */}
          {multiple && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-500">
                {selected.length} / {languages.length} sélectionnée{selected.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                {selected.length > 0 && (
                  <button type="button" onClick={() => onChange([])}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Effacer
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
