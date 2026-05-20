/**
 * MonnaiePage.jsx
 * Gestion du Module Monnaie FCFA — Langues Ivoire CMS
 */
import { useState, useEffect, useCallback } from 'react';
import { monnaieAPI, languagesAPI } from '../services/api';
import {
  PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon,
  PauseCircleIcon, MagnifyingGlassIcon, BanknotesIcon,
  XMarkIcon, ChevronDownIcon, ChevronUpIcon,
} from '@heroicons/react/24/outline';
import PageHelp from '../components/PageHelp';

const TYPE_LABELS = {
  RECONNAISSANCE: { label: 'Reconnaissance', emoji: '👁️', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Identifier les pièces et billets FCFA' },
  CALCUL:         { label: 'Calcul',         emoji: '🧮', color: 'bg-green-100 text-green-700 border-green-200', desc: 'Additionner des pièces et billets' },
  RENDU_MONNAIE:  { label: 'Rendu monnaie',  emoji: '🔄', color: 'bg-amber-100 text-amber-700 border-amber-200', desc: 'Calculer la monnaie à rendre' },
  CONVERSION:     { label: 'Conversion',     emoji: '🔢', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Convertir entre coupures' },
};

const TYPES = Object.keys(TYPE_LABELS);

function TypeBadge({ type }) {
  const cfg = TYPE_LABELS[type] || { label: type, emoji: '💰', color: 'bg-gray-100 text-gray-600 border-gray-200' };
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

function ContenuForm({ initial, languages, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    languageId: initial?.languageId || '',
    type: initial?.type || 'RECONNAISSANCE',
    titre: initial?.titre || '',
    description: initial?.description || '',
    pointsXp: initial?.pointsXp || 20,
    ordre: initial?.ordre || 0,
    contenu: initial?.contenu ? JSON.stringify(initial.contenu, null, 2) : '{}',
  });
  const [jsonError, setJsonError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(form.contenu);
      onSave({ ...form, contenu: parsed, languageId: form.languageId || null });
    } catch {
      setJsonError('JSON invalide — vérifiez la syntaxe');
    }
  };

  const selectedType = form.type;
  const exampleJson = {
    RECONNAISSANCE: '{\n  "items": [\n    { "valeur": 100, "label": "100 FCFA", "type": "pièce" },\n    { "valeur": 500, "label": "500 FCFA", "type": "billet" }\n  ],\n  "exercices": []\n}',
    CALCUL: '{\n  "exercices": [\n    { "pieces": [100, 200], "resultat": 300, "question": "100 + 200 = ?" }\n  ]\n}',
    RENDU_MONNAIE: '{\n  "exercices": [\n    { "prix": 150, "donne": 200, "rendu": 50, "question": "Pain: 150F, donné: 200F, rendu: ?" }\n  ]\n}',
    CONVERSION: '{\n  "exercices": []\n}',
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

      {selectedType && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
          💡 {TYPE_LABELS[selectedType]?.desc}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Titre *</label>
        <input
          type="text"
          value={form.titre}
          onChange={e => set('titre', e.target.value)}
          required
          placeholder="ex: Reconnaître les pièces FCFA"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={2}
          placeholder="Courte description de l'exercice..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Points XP</label>
          <input
            type="number" min={5} max={200}
            value={form.pointsXp}
            onChange={e => set('pointsXp', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Ordre d'affichage</label>
          <input
            type="number" min={0}
            value={form.ordre}
            onChange={e => set('ordre', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-gray-600">Contenu JSON</label>
          <button
            type="button"
            onClick={() => { set('contenu', exampleJson[form.type] || '{}'); setJsonError(''); }}
            className="text-xs text-primary-600 hover:underline"
          >
            Charger exemple
          </button>
        </div>
        <textarea
          value={form.contenu}
          onChange={e => { set('contenu', e.target.value); setJsonError(''); }}
          rows={8}
          spellCheck={false}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-primary-400 outline-none resize-y"
        />
        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
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

function ContenuCard({ item, onEdit, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${item.isActive ? 'border-gray-100 shadow-sm' : 'border-dashed border-gray-200 opacity-70'}`}>
      <div className="p-4 flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <TypeBadge type={item.type} />
            {item.language?.nom ? (
              <span className="text-xs text-gray-500 font-medium">{item.language?.emoji || '🌍'} {item.language.nom}</span>
            ) : (
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
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            {expanded ? <ChevronUpIcon className="w-4 h-4 text-gray-500" /> : <ChevronDownIcon className="w-4 h-4 text-gray-500" />}
          </button>
          <button onClick={() => onEdit(item)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors" title="Modifier">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onToggle(item)}
            className={`p-2 rounded-xl transition-colors ${item.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}>
            {item.isActive ? <PauseCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(item)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <pre className="text-xs bg-gray-50 rounded-xl p-3 overflow-x-auto border border-gray-100 max-h-48">
            {JSON.stringify(item.contenu, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// FCFA reference card
function FCFAReferenceCard() {
  const pieces = [5, 10, 25, 50, 100, 200];
  const billets = [500, 1000, 2000, 5000, 10000];
  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <h3 className="font-black text-amber-900 text-sm mb-4 flex items-center gap-2">
        💰 Référence — Pièces et Billets FCFA
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Pièces</p>
          <div className="flex flex-wrap gap-2">
            {pieces.map(v => (
              <span key={v} className="bg-white border border-amber-200 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {v} F
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Billets</p>
          <div className="flex flex-wrap gap-2">
            {billets.map(v => (
              <span key={v} className="bg-amber-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {v.toLocaleString('fr-FR')} F
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonnaiePage() {
  const [contenus, setContenus] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, l] = await Promise.all([monnaieAPI.getAll(), languagesAPI.getAll()]);
      setContenus(c.data || []);
      setLanguages(Array.isArray(l.data) ? l.data : l.data?.data || []);
    } catch { showToast('❌ Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal?.item) { await monnaieAPI.update(modal.item.id, data); showToast('✅ Modifié'); }
      else { await monnaieAPI.create(data); showToast('✅ Créé'); }
      setModal(null);
      load();
    } catch (e) { showToast('❌ ' + (e.response?.data?.error || 'Erreur')); }
    finally { setSaving(false); }
  };

  const handleToggle = async (item) => {
    try { await monnaieAPI.toggle(item.id); showToast(item.isActive ? '⏸ Désactivé' : '✅ Activé'); load(); }
    catch { showToast('❌ Erreur'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.titre}" ?`)) return;
    try { await monnaieAPI.delete(item.id); showToast('🗑 Supprimé'); load(); }
    catch { showToast('❌ Erreur'); }
  };

  const filtered = contenus.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.titre?.toLowerCase().includes(q) || c.language?.nom?.toLowerCase().includes(q)) &&
           (!filterType || c.type === filterType);
  });

  const activeCount = contenus.filter(c => c.isActive).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-amber-500" />
            Module Monnaie FCFA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {contenus.length} contenu{contenus.length > 1 ? 's' : ''} ·{' '}
            <span className="text-green-600 font-semibold">{activeCount} actif{activeCount > 1 ? 's' : ''}</span>
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors shadow"
        >
          <PlusIcon className="w-5 h-5" />
          Nouveau contenu
        </button>
      </div>

      <FCFAReferenceCard />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 outline-none"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none"
        >
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t].emoji} {TYPE_LABELS[t].label}</option>)}
        </select>
      </div>

      {/* Type stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {TYPES.map(t => {
          const count = contenus.filter(c => c.type === t).length;
          const cfg = TYPE_LABELS[t];
          return (
            <button key={t}
              onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`text-center p-3 rounded-xl border-2 transition-all ${
                filterType === t ? 'border-amber-400 bg-amber-50' : 'border-gray-100 bg-white hover:border-gray-200'
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
          <BanknotesIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">Aucun contenu trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <ContenuCard key={item.id} item={item}
              onEdit={i => setModal({ item: i })}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'create' ? 'Nouveau contenu monnaie' : `Modifier — ${modal.item?.titre}`}
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

      <PageHelp pageId="monnaie" />
    </div>
  );
}
