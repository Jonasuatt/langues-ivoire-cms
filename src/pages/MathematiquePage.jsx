/**
 * MathematiquePage.jsx
 * Gestion des contenus Module Mathématique — Langues Ivoire CMS
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { mathAPI, languagesAPI, uploadAPI } from '../services/api';
import {
  PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon,
  PauseCircleIcon, MagnifyingGlassIcon, CalculatorIcon,
  XMarkIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline';
import PageHelp from '../components/PageHelp';

const TYPE_LABELS = {
  COMPTAGE: { label: 'Comptage', emoji: '🔢', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ADDITION: { label: 'Addition', emoji: '➕', color: 'bg-green-100 text-green-700 border-green-200' },
  SOUSTRACTION: { label: 'Soustraction', emoji: '➖', color: 'bg-red-100 text-red-700 border-red-200' },
  MULTIPLICATION: { label: 'Multiplication', emoji: '✖️', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  DIVISION: { label: 'Division', emoji: '➗', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  PAIR_IMPAIR: { label: 'Pairs / Impairs', emoji: '↔️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
};

const TYPES = Object.keys(TYPE_LABELS);
const NIVEAUX = ['A1', 'A2', 'B1', 'B2'];

function TypeBadge({ type }) {
  const cfg = TYPE_LABELS[type] || { label: type, emoji: '📐', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Constructeur de contenu visuel (sans JSON) ─────────────────────────────
function MathContenuBuilder({ type, contenu, onChange }) {
  const c = contenu;
  const inp   = 'border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-400 outline-none';
  const inpSm = 'w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-primary-400 outline-none';

  const updateArr = (key, i, field, val) => {
    const arr = [...(c[key] || [])]; arr[i] = { ...arr[i], [field]: val };
    onChange({ ...c, [key]: arr });
  };
  const removeItem = (key, i) => onChange({ ...c, [key]: (c[key] || []).filter((_, idx) => idx !== i) });
  const addItem    = (key, item) => onChange({ ...c, [key]: [...(c[key] || []), item] });

  const Hint = ({ text }) => (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-700">{text}</div>
  );
  const AddBtn = ({ onClick, label }) => (
    <button type="button" onClick={onClick}
      className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1">
      ＋ {label}
    </button>
  );
  const DelBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} className="text-red-400 hover:text-red-600 text-xs px-1 flex-shrink-0">✕</button>
  );
  const AutoNote = () => (
    <p className="text-xs text-gray-400 italic">⚙️ Les mots en langue locale sont ajoutés automatiquement.</p>
  );

  /* ── COMPTAGE ── */
  if (type === 'COMPTAGE') {
    const chiffres = c.chiffres || [];
    return (
      <div className="space-y-3">
        <Hint text="💡 Listez les chiffres à apprendre avec leur nom en langue locale." />
        <div className="space-y-2">
          {chiffres.map((ch, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
              <input type="number" min={0} value={ch.valeur ?? ''} placeholder="1"
                onChange={e => updateArr('chiffres', i, 'valeur', Number(e.target.value))}
                className={inpSm} />
              <span className="text-gray-400 text-sm">=</span>
              <input type="text" value={ch.mot ?? ''} placeholder="Kelen, Fila, Saba…"
                onChange={e => updateArr('chiffres', i, 'mot', e.target.value)}
                className={`flex-1 ${inp}`} />
              <DelBtn onClick={() => removeItem('chiffres', i)} />
            </div>
          ))}
        </div>
        <AddBtn onClick={() => addItem('chiffres', { valeur: chiffres.length + 1, mot: '' })} label="Ajouter un chiffre" />
      </div>
    );
  }

  /* ── ADDITION / SOUSTRACTION ── */
  if (type === 'ADDITION' || type === 'SOUSTRACTION') {
    const op = type === 'ADDITION' ? '+' : '−';
    const calc = (a, b) => type === 'ADDITION' ? a + b : a - b;
    const exercices = c.exercices || [];
    const updateEx = (i, a, b) => {
      const arr = [...exercices];
      arr[i] = { ...arr[i], a, b, resultat: calc(a, b), question: `${a} ${op} ${b} = ?` };
      onChange({ ...c, exercices: arr });
    };
    return (
      <div className="space-y-3">
        <Hint text={`💡 Saisissez a et b — le résultat et la question se génèrent automatiquement.`} />
        <div className="space-y-2">
          {exercices.map((ex, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
              <input type="number" value={ex.a ?? ''} placeholder="a"
                onChange={e => updateEx(i, Number(e.target.value), ex.b ?? 0)}
                className={inpSm} />
              <span className="font-bold text-gray-500">{op}</span>
              <input type="number" value={ex.b ?? ''} placeholder="b"
                onChange={e => updateEx(i, ex.a ?? 0, Number(e.target.value))}
                className={inpSm} />
              <span className="text-gray-400 text-sm">= <strong className="text-primary-700">{ex.resultat ?? '?'}</strong></span>
              <input type="text" value={ex.question ?? ''} placeholder="Question libre (optionnel)"
                onChange={e => updateArr('exercices', i, 'question', e.target.value)}
                className={`flex-1 ${inp} text-xs text-gray-500`} />
              <DelBtn onClick={() => removeItem('exercices', i)} />
            </div>
          ))}
        </div>
        <AddBtn onClick={() => addItem('exercices', { a: 0, b: 0, resultat: 0, question: `0 ${op} 0 = ?` })} label="Ajouter un exercice" />
        <AutoNote />
      </div>
    );
  }

  /* ── MULTIPLICATION ── */
  if (type === 'MULTIPLICATION') {
    const lignes = c.lignes || [];
    const updateL = (i, a, b) => {
      const arr = [...lignes]; arr[i] = { ...arr[i], a, b, resultat: a * b };
      onChange({ ...c, lignes: arr });
    };
    return (
      <div className="space-y-3">
        <Hint text="💡 Entrez les lignes de la table. Le produit se calcule automatiquement." />
        <div className="space-y-2">
          {lignes.map((l, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
              <input type="number" value={l.a ?? ''} placeholder="a"
                onChange={e => updateL(i, Number(e.target.value), l.b ?? 0)}
                className={inpSm} />
              <span className="font-bold text-gray-500">×</span>
              <input type="number" value={l.b ?? ''} placeholder="b"
                onChange={e => updateL(i, l.a ?? 0, Number(e.target.value))}
                className={inpSm} />
              <span className="text-gray-400 text-sm">= <strong className="text-purple-700">{l.resultat ?? '?'}</strong></span>
              <DelBtn onClick={() => removeItem('lignes', i)} />
            </div>
          ))}
        </div>
        <AddBtn onClick={() => addItem('lignes', { a: lignes[0]?.a ?? 2, b: (lignes.at(-1)?.b ?? 0) + 1, resultat: 0 })} label="Ajouter une ligne" />
        <AutoNote />
      </div>
    );
  }

  /* ── DIVISION ── */
  if (type === 'DIVISION') {
    const exercices = c.exercices || [];
    const updateEx = (i, a, b) => {
      const arr = [...exercices];
      arr[i] = { ...arr[i], a, b, resultat: b > 0 ? Math.round(a / b) : 0 };
      onChange({ ...c, exercices: arr });
    };
    return (
      <div className="space-y-3">
        <Hint text="💡 Saisissez le dividende (a) et le diviseur (b). Le quotient se calcule automatiquement." />
        <div className="space-y-2">
          {exercices.map((ex, i) => (
            <div key={i} className="flex flex-col gap-1.5 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                <input type="number" value={ex.a ?? ''} placeholder="a"
                  onChange={e => updateEx(i, Number(e.target.value), ex.b || 1)}
                  className={inpSm} />
                <span className="font-bold text-gray-500">÷</span>
                <input type="number" value={ex.b ?? ''} placeholder="b"
                  onChange={e => updateEx(i, ex.a ?? 0, Number(e.target.value) || 1)}
                  className={inpSm} />
                <span className="text-gray-400 text-sm">= <strong className="text-orange-700">{ex.resultat ?? '?'}</strong></span>
                <DelBtn onClick={() => removeItem('exercices', i)} />
              </div>
              <input type="text" value={ex.question ?? ''} placeholder="Contexte : ex: Tu partages 10 oranges entre 2 enfants. Combien chacun en reçoit ?"
                onChange={e => updateArr('exercices', i, 'question', e.target.value)}
                className={`${inp} w-full text-xs ml-5`} />
            </div>
          ))}
        </div>
        <AddBtn onClick={() => addItem('exercices', { a: 0, b: 1, resultat: 0, question: '' })} label="Ajouter un exercice" />
        <AutoNote />
      </div>
    );
  }

  /* ── PAIR_IMPAIR ── */
  if (type === 'PAIR_IMPAIR') {
    const pairs   = c.pairs   || [];
    const impairs = c.impairs || [];
    const upd = (group, arr, i, field, val) => {
      const next = [...arr]; next[i] = { ...next[i], [field]: val };
      onChange({ ...c, [group]: next });
    };
    const GroupBlock = ({ label, color, items, group }) => (
      <div>
        <p className="text-xs font-bold mb-2" style={{ color }}>{label}</p>
        <div className="space-y-1.5">
          {items.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
              <input type="number" value={m.valeur ?? ''} placeholder="4"
                onChange={e => upd(group, items, i, 'valeur', Number(e.target.value))}
                className={inpSm} />
              <input type="text" value={m.mot ?? ''} placeholder="Naani"
                onChange={e => upd(group, items, i, 'mot', e.target.value)}
                className={`flex-1 ${inp}`} />
              <DelBtn onClick={() => onChange({ ...c, [group]: items.filter((_, idx) => idx !== i) })} />
            </div>
          ))}
        </div>
        <button type="button"
          onClick={() => onChange({ ...c, [group]: [...items, { valeur: 0, mot: '' }] })}
          className="text-xs font-semibold text-primary-600 hover:text-primary-800 mt-1.5">
          ＋ Ajouter
        </button>
      </div>
    );
    return (
      <div className="space-y-4">
        <GroupBlock label="✦ Nombres Pairs" color="#558B2F" items={pairs} group="pairs" />
        <GroupBlock label="✦ Nombres Impairs" color="#B71C1C" items={impairs} group="impairs" />
      </div>
    );
  }

  return (
    <p className="text-xs text-gray-400 italic py-4 text-center">
      Sélectionnez un type pour configurer le contenu.
    </p>
  );
}

// ─── Formulaire principal ────────────────────────────────────────────────────
function ContenuForm({ initial, languages, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    languageId: initial?.languageId || '',
    type: initial?.type || 'COMPTAGE',
    titre: initial?.titre || '',
    description: initial?.description || '',
    niveau: initial?.niveau || 'A1',
    pointsXp: initial?.pointsXp || 20,
    ordre: initial?.ordre || 0,
    contenu: initial?.contenu ? JSON.stringify(initial.contenu, null, 2) : '{}',
  });
  const [jsonError, setJsonError] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(form.contenu);
      onSave({ ...form, contenu: parsed, languageId: form.languageId || null });
    } catch {
      setJsonError('JSON invalide — corrigez le champ "Contenu JSON"');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Langue (optionnel)</label>
          <select
            value={form.languageId}
            onChange={e => set('languageId', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          >
            <option value="">— Sans langue (universel) —</option>
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.emoji || '🌍'} {l.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Type *</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          >
            {TYPES.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t].emoji} {TYPE_LABELS[t].label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Titre *</label>
        <input
          type="text"
          value={form.titre}
          onChange={e => set('titre', e.target.value)}
          required
          placeholder="ex: Compter en Dioula"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={2}
          placeholder="Description courte de l'exercice..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Niveau</label>
          <select
            value={form.niveau}
            onChange={e => set('niveau', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          >
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Points XP</label>
          <input
            type="number"
            min={5}
            max={200}
            value={form.pointsXp}
            onChange={e => set('pointsXp', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Ordre</label>
          <input
            type="number"
            min={0}
            value={form.ordre}
            onChange={e => set('ordre', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-600">Contenu</label>
          <button type="button" onClick={() => setAdvancedMode(m => !m)}
            className="text-xs text-gray-400 hover:text-gray-700 underline">
            {advancedMode ? '← Formulaire simple' : '⚙️ Mode JSON avancé'}
          </button>
        </div>
        {advancedMode ? (
          <div>
            <textarea
              value={form.contenu}
              onChange={e => { set('contenu', e.target.value); setJsonError(''); }}
              rows={8} spellCheck={false}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary-400 outline-none resize-y"
              placeholder='{ "chiffres": [], "exercices": [] }'
            />
            {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 min-h-[80px]">
            <MathContenuBuilder
              type={form.type}
              contenu={(() => { try { return JSON.parse(form.contenu) || {}; } catch { return {}; } })()}
              onChange={(obj) => { set('contenu', JSON.stringify(obj, null, 2)); setJsonError(''); }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors">
          {loading ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

/**
 * Panneau d'import audio par exercice — glisse un fichier depuis le PC
 * vers Cloudinary puis enregistre l'URL dans contenu[arrayKey][i].audioUrl / resultAudioUrl
 */
function AudioUploadPanel({ item, onUpdate }) {
  const contenu = item.contenu || {};
  const inputRef = useRef(null);
  const [target, setTarget] = useState(null); // { arrayKey, idx, field }
  const [uploading, setUploading] = useState(false);
  const [statuses, setStatuses] = useState({}); // key → 'ok' | 'err'

  const startUpload = (arrayKey, idx, field) => {
    setTarget({ arrayKey, idx, field });
    // Déclencher le file picker après mise à jour du state
    setTimeout(() => inputRef.current?.click(), 0);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !target) return;
    setUploading(true);
    const { arrayKey, idx, field } = target;
    const statusKey = `${arrayKey}-${idx}-${field}`;
    try {
      const fd = new FormData();
      fd.append('audio', file);
      const { data } = await uploadAPI.uploadAudio(fd);
      const url = data.audioUrl;
      const arr = [...(contenu[arrayKey] || [])];
      arr[idx] = { ...arr[idx], [field]: url };
      await mathAPI.update(item.id, { contenu: { ...contenu, [arrayKey]: arr } });
      setStatuses(s => ({ ...s, [statusKey]: 'ok' }));
      setTimeout(() => setStatuses(s => ({ ...s, [statusKey]: null })), 2500);
      onUpdate();
    } catch {
      setStatuses(s => ({ ...s, [statusKey]: 'err' }));
      setTimeout(() => setStatuses(s => ({ ...s, [statusKey]: null })), 3000);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const renderRows = (arrayKey, arr) => arr.map((ex, i) => {
    const qKey = `${arrayKey}-${i}-audioUrl`;
    const rKey = `${arrayKey}-${i}-resultAudioUrl`;
    const hasResult = ex.resultat !== undefined || ex.rendu !== undefined || ex.mot !== undefined || ex.valeur !== undefined;
    const btnClass = (key, existingUrl) => `text-xs px-2 py-0.5 rounded-md border font-semibold whitespace-nowrap transition-colors ${
      statuses[key] === 'ok' ? 'bg-green-50 border-green-300 text-green-700' :
      statuses[key] === 'err' ? 'bg-red-50 border-red-300 text-red-600' :
      existingUrl ? 'bg-sky-50 border-sky-300 text-sky-700' :
      'bg-white border-gray-200 text-gray-500 hover:border-primary-400 hover:text-primary-600'
    }`;
    return (
      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-400 font-mono w-5 flex-shrink-0 text-right">{i + 1}.</span>
        <p className="text-xs text-gray-600 flex-1 min-w-0 truncate">
          {ex.question || ex.expression || ex.mot || ex.label || String(ex.valeur || `Item ${i + 1}`)}
        </p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => startUpload(arrayKey, i, 'audioUrl')}
            disabled={uploading}
            title="Importer audio de la question"
            className={btnClass(qKey, ex.audioUrl)}
          >
            {statuses[qKey] === 'ok' ? '✅' : statuses[qKey] === 'err' ? '❌' : ex.audioUrl ? '🔊 ✓' : '🔊 Question'}
          </button>
          {hasResult && (
            <button
              onClick={() => startUpload(arrayKey, i, 'resultAudioUrl')}
              disabled={uploading}
              title="Importer audio de la réponse"
              className={btnClass(rKey, ex.resultAudioUrl)}
            >
              {statuses[rKey] === 'ok' ? '✅' : statuses[rKey] === 'err' ? '❌' : ex.resultAudioUrl ? '🎯 ✓' : '🎯 Réponse'}
            </button>
          )}
        </div>
      </div>
    );
  });

  const anyContent = (contenu.exercices?.length || 0) + (contenu.chiffres?.length || 0)
    + (contenu.lignes?.length || 0) + (contenu.items?.length || 0);

  return (
    <div className="space-y-1">
      <input ref={inputRef} type="file" accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg" className="hidden" onChange={handleFile} />
      {uploading && <p className="text-xs text-primary-600 font-semibold animate-pulse py-1">⏳ Upload en cours…</p>}
      {anyContent === 0 && <p className="text-xs text-gray-400 italic py-1">Aucun élément détecté dans le contenu JSON.</p>}
      {contenu.exercices?.length > 0 && <div className="space-y-1">{renderRows('exercices', contenu.exercices)}</div>}
      {contenu.chiffres?.length > 0 && <div className="space-y-1">{renderRows('chiffres', contenu.chiffres)}</div>}
      {contenu.lignes?.length > 0 && <div className="space-y-1">{renderRows('lignes', contenu.lignes)}</div>}
      {contenu.items?.length > 0 && <div className="space-y-1">{renderRows('items', contenu.items)}</div>}
    </div>
  );
}

function ContenuCard({ item, onEdit, onToggle, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState('audio'); // 'audio' | 'json'
  const langNom = item.language?.nom;
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${item.isActive ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200 opacity-70'}`}>
      <div className="p-4 flex items-start gap-3">
        {/* Statut */}
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <TypeBadge type={item.type} />
            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
              {item.niveau}
            </span>
            {langNom && (
              <span className="text-xs text-gray-500 font-medium">
                {item.language?.emoji || '🌍'} {langNom}
              </span>
            )}
            {!item.languageId && (
              <span className="text-xs text-gray-400 italic">Universel</span>
            )}
          </div>
          <p className="font-bold text-gray-900 text-sm">{item.titre}</p>
          {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span>⚡ {item.pointsXp} XP</span>
            <span>#{item.ordre}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="Voir le contenu JSON">
            {expanded ? <ChevronUpIcon className="w-4 h-4 text-gray-500" /> : <ChevronDownIcon className="w-4 h-4 text-gray-500" />}
          </button>
          <button onClick={() => onEdit(item)}
            className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors" title="Modifier">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onToggle(item)}
            className={`p-2 rounded-xl transition-colors ${item.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}
            title={item.isActive ? 'Désactiver' : 'Activer'}>
            {item.isActive ? <PauseCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(item)}
            className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Supprimer">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setTab('audio')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${tab === 'audio' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              🔊 Audios
            </button>
            <button
              onClick={() => setTab('json')}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${tab === 'json' ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {'{ }'} JSON
            </button>
          </div>
          {tab === 'json' ? (
            <pre className="text-xs bg-gray-50 rounded-xl p-3 overflow-x-auto border border-gray-100 max-h-48">
              {JSON.stringify(item.contenu, null, 2)}
            </pre>
          ) : (
            <AudioUploadPanel item={item} onUpdate={onUpdate} />
          )}
        </div>
      )}
    </div>
  );
}

export default function MathematiquePage() {
  const [contenus, setContenus] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | { item }
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([
        mathAPI.getAll(),
        languagesAPI.getAll(),
      ]);
      setContenus(c.data || []);
      setLanguages(Array.isArray(l.data) ? l.data : l.data?.data || []);
    } catch {
      showToast('❌ Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal?.item) {
        await mathAPI.update(modal.item.id, data);
        showToast('✅ Contenu modifié');
      } else {
        await mathAPI.create(data);
        showToast('✅ Contenu créé');
      }
      setModal(null);
      load();
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.error || 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await mathAPI.toggle(item.id);
      showToast(item.isActive ? '⏸ Désactivé' : '✅ Activé');
      load();
    } catch { showToast('❌ Erreur'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.titre}" ?`)) return;
    try {
      await mathAPI.delete(item.id);
      showToast('🗑 Supprimé');
      load();
    } catch { showToast('❌ Erreur de suppression'); }
  };

  const filtered = contenus.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.titre?.toLowerCase().includes(q) || c.language?.nom?.toLowerCase().includes(q);
    const matchType = !filterType || c.type === filterType;
    const matchLang = !filterLang || c.languageId === filterLang || (filterLang === '__universal__' && !c.languageId);
    return matchSearch && matchType && matchLang;
  });

  const activeCount = contenus.filter(c => c.isActive).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CalculatorIcon className="w-7 h-7 text-primary-600" />
            Mathématiques
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {contenus.length} contenu{contenus.length > 1 ? 's' : ''} ·{' '}
            <span className="text-green-600 font-semibold">{activeCount} actif{activeCount > 1 ? 's' : ''}</span>
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau contenu
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        >
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t].emoji} {TYPE_LABELS[t].label}</option>)}
        </select>
        <select
          value={filterLang}
          onChange={e => setFilterLang(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        >
          <option value="">Toutes les langues</option>
          <option value="__universal__">— Universel —</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.emoji || '🌍'} {l.nom}</option>)}
        </select>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {TYPES.map(t => {
          const count = contenus.filter(c => c.type === t).length;
          const cfg = TYPE_LABELS[t];
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`text-center p-3 rounded-xl border-2 transition-all ${
                filterType === t ? 'border-primary-400 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <p className="text-xl">{cfg.emoji}</p>
              <p className="text-lg font-black text-gray-900">{count}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalculatorIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">Aucun contenu trouvé</p>
          <p className="text-sm mt-1">Modifiez les filtres ou créez un nouveau contenu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <ContenuCard
              key={item.id}
              item={item}
              onEdit={(i) => setModal({ item: i })}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={load}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'Nouveau contenu mathématique' : `Modifier — ${modal.item?.titre}`}
          onClose={() => setModal(null)}
        >
          <ContenuForm
            initial={modal === 'create' ? null : modal.item}
            languages={languages}
            onSave={handleSave}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      <PageHelp pageId="mathematique" />
    </div>
  );
}
