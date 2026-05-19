import { useEffect, useState, useCallback } from 'react';
import PageHelp from '../components/PageHelp';
import { culturalAPI, languagesAPI } from '../services/api';
import api from '../services/api';
import {
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon,
  SparklesIcon, Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';

// ── Rubriques par défaut ────────────────────────────────────────────────────
const DEFAULT_RUBRIQUES = [
  { cle: 'PROVERB',   nom: 'Proverbe',   emoji: '💬', couleur: 'purple' },
  { cle: 'TRADITION', nom: 'Tradition',   emoji: '🏛️', couleur: 'green'  },
  { cle: 'ANECDOTE',  nom: 'Anecdote',   emoji: '📖', couleur: 'blue'   },
  { cle: 'TALE',      nom: 'Conte',      emoji: '🌙', couleur: 'orange' },
  { cle: 'MUSIC',     nom: 'Musique',    emoji: '🎵', couleur: 'pink'   },
  { cle: 'DANCE',     nom: 'Danse',      emoji: '💃', couleur: 'teal'   },
];

// Palette couleurs disponibles
const PALETTE = [
  { key: 'purple', bg: 'bg-purple-100', text: 'text-purple-700', dot: '#9333ea' },
  { key: 'green',  bg: 'bg-green-100',  text: 'text-green-700',  dot: '#16a34a' },
  { key: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700',   dot: '#2563eb' },
  { key: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', dot: '#ea580c' },
  { key: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700',   dot: '#db2777' },
  { key: 'teal',   bg: 'bg-teal-100',   text: 'text-teal-700',   dot: '#0d9488' },
  { key: 'amber',  bg: 'bg-amber-100',  text: 'text-amber-700',  dot: '#d97706' },
  { key: 'red',    bg: 'bg-red-100',    text: 'text-red-700',    dot: '#dc2626' },
  { key: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700', dot: '#4f46e5' },
  { key: 'lime',   bg: 'bg-lime-100',   text: 'text-lime-700',   dot: '#65a30d' },
  { key: 'stone',  bg: 'bg-stone-100',  text: 'text-stone-700',  dot: '#78716c' },
  { key: 'cyan',   bg: 'bg-cyan-100',   text: 'text-cyan-700',   dot: '#0891b2' },
];

const paletteOf = (couleur) => PALETTE.find(p => p.key === couleur) || PALETTE[0];

// ── Persistance localStorage ─────────────────────────────────────────────────
const LS_KEY = 'li_cultural_rubriques_v1';
function loadRubriques() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || DEFAULT_RUBRIQUES; }
  catch { return DEFAULT_RUBRIQUES; }
}
function saveRubriques(r) { localStorage.setItem(LS_KEY, JSON.stringify(r)); }

// Génère une clé API depuis un nom (ex: "Mariage" → "MARIAGE")
function toApiKey(nom) {
  return nom.trim().toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // retire accents
    .replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
}

// ── Modal Rubrique ───────────────────────────────────────────────────────────
function ModalRubrique({ initial, rubriques, onSave, onClose }) {
  const [nom,     setNom]     = useState(initial?.nom     || '');
  const [emoji,   setEmoji]   = useState(initial?.emoji   || '✨');
  const [couleur, setCouleur] = useState(initial?.couleur || 'purple');

  function submit() {
    if (!nom.trim()) { toast.error('Le nom de la rubrique est obligatoire.'); return; }
    const cle = initial?.cle || toApiKey(nom);
    if (!initial && rubriques.find(r => r.cle === cle)) {
      toast.error('Une rubrique avec ce nom existe déjà.'); return;
    }
    onSave({ cle, nom: nom.trim(), emoji, couleur });
  }

  const p = paletteOf(couleur);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {initial ? '✏️ Modifier la rubrique' : '➕ Nouvelle rubrique'}
          </h3>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nom + Emoji */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={nom} onChange={e => setNom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="ex: Mariage, Cérémonie, Sport…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input
                type="text" value={emoji} onChange={e => setEmoji(e.target.value)}
                maxLength={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Clé API (lecture seule à l'édition) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clé API <span className="text-gray-400 font-normal">(générée automatiquement)</span>
            </label>
            <input
              type="text" readOnly
              value={initial?.cle || toApiKey(nom) || '…'}
              className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm font-mono text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du badge</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map(pal => (
                <button
                  key={pal.key}
                  onClick={() => setCouleur(pal.key)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    couleur === pal.key ? 'border-gray-800 scale-110' : 'border-transparent'
                  } ${pal.bg}`}
                  title={pal.key}
                />
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2">Aperçu du badge :</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${p.bg} ${p.text}`}>
              {emoji} {nom || 'Ma rubrique'}
            </span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit}
            className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            {initial ? 'Enregistrer' : 'Créer la rubrique'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Contenu ────────────────────────────────────────────────────────────
function ModalContenu({ initial, rubriques, languages, onSave, onClose }) {
  const [form, setForm] = useState({
    type:           initial?.type           || rubriques[0]?.cle || '',
    contenu:        initial?.contenu        || '',
    traduction:     initial?.traduction     || '',
    sourceEthnique: initial?.sourceEthnique || '',
    langueCode:     initial?.language?.code || '',
    audioUrl:       initial?.audioUrl       || '',
    audioUrlFr:     initial?.audioUrlFr     || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    if (!form.contenu.trim()) { toast.error('Le contenu est obligatoire.'); return; }
    setSaving(true);
    try {
      const payload = {
        type:           form.type,
        contenu:        form.contenu.trim(),
        traduction:     form.traduction.trim()     || null,
        sourceEthnique: form.sourceEthnique.trim() || null,
        langueCode:     form.langueCode            || null,
        audioUrl:       form.audioUrl              || null,
        audioUrlFr:     form.audioUrlFr            || null,
        isActive:       true,
      };
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {initial ? '✏️ Modifier le contenu' : '➕ Nouveau contenu culturel'}
          </h3>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">

          {/* Rubrique + Langue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rubrique <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {rubriques.map(r => (
                  <option key={r.cle} value={r.cle}>{r.emoji} {r.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
              <select
                value={form.langueCode} onChange={e => set('langueCode', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">— Toutes les langues —</option>
                {languages.map(l => (
                  <option key={l.id} value={l.code}>{l.nom}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Source ethnique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source ethnique</label>
            <input
              type="text" value={form.sourceEthnique} onChange={e => set('sourceEthnique', e.target.value)}
              placeholder="ex: Baoulé, Dioula, Bété…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu <span className="text-red-500">*</span>
              <span className="ml-2 text-xs text-gray-400 font-normal">
                (en langue locale ou en français selon le type)
              </span>
            </label>
            <textarea
              value={form.contenu} onChange={e => set('contenu', e.target.value)}
              rows={4} placeholder="Proverbe, conte, description de tradition…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* Traduction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traduction française
            </label>
            <textarea
              value={form.traduction} onChange={e => set('traduction', e.target.value)}
              rows={2} placeholder="Traduction ou explication en français…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* ── Audio ── */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🎵 Fichiers audio
              <span className="text-xs font-normal text-gray-400">MP3, WAV, M4A — max 20 MB</span>
            </p>

            {/* Audio langue locale */}
            <FileUploadField
              type="audio"
              label="🌍 Audio langue locale"
              value={form.audioUrl}
              onChange={url => set('audioUrl', url)}
            />

            {/* Audio français */}
            <FileUploadField
              type="audio"
              label="🇫🇷 Audio français (narration)"
              value={form.audioUrlFr}
              onChange={url => set('audioUrlFr', url)}
            />
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit} disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            {saving ? 'Sauvegarde…' : initial ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function CulturalPage() {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [languages,  setLanguages]  = useState([]);
  const [filterType, setFilterType] = useState('');
  const [rubriques,  setRubriques]  = useState(loadRubriques);

  // Modaux
  const [modalContenu,   setModalContenu]   = useState(null); // null | 'create' | item
  const [modalRubrique,  setModalRubrique]  = useState(null); // null | 'create' | rubrique
  const [viewRubriques,  setViewRubriques]  = useState(false);
  const [confirmDel,     setConfirmDel]     = useState(null); // item à supprimer

  // Charger les langues
  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setLanguages(list);
    }).catch(() => {});
  }, []);

  // Charger le contenu
  const load = useCallback(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (filterType) params.type = filterType;
    culturalAPI.getAll(params)
      .then(({ data }) => setItems(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  // ── CRUD Contenu ──
  async function handleSaveContenu(payload) {
    try {
      if (modalContenu !== 'create') {
        await api.patch(`/cultural/${modalContenu.id}`, payload);
        toast.success('Contenu mis à jour !');
      } else {
        await culturalAPI.create(payload);
        toast.success('Contenu culturel ajouté !');
      }
      setModalContenu(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la sauvegarde');
      throw e;
    }
  }

  async function handleDelete(item) {
    try {
      await api.delete(`/cultural/${item.id}`);
      toast.success('Contenu supprimé');
      setConfirmDel(null);
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  // ── CRUD Rubriques ──
  function addRubrique(data) {
    const updated = [...rubriques, data];
    setRubriques(updated);
    saveRubriques(updated);
    setModalRubrique(null);
    toast.success(`Rubrique « ${data.nom} » créée !`);
  }

  function editRubrique(original, data) {
    const updated = rubriques.map(r => r.cle === original.cle ? { ...r, ...data } : r);
    setRubriques(updated);
    saveRubriques(updated);
    setModalRubrique(null);
    toast.success('Rubrique modifiée.');
  }

  function deleteRubrique(rubrique) {
    const nb = items.filter(i => i.type === rubrique.cle).length;
    if (nb > 0) {
      toast.error(`Impossible : ${nb} contenu(s) utilisent cette rubrique.`);
      setConfirmDel(null); return;
    }
    const updated = rubriques.filter(r => r.cle !== rubrique.cle);
    setRubriques(updated);
    saveRubriques(updated);
    if (filterType === rubrique.cle) setFilterType('');
    setConfirmDel(null);
    toast.success(`Rubrique « ${rubrique.nom} » supprimée.`);
  }

  // Trouver la rubrique d'un item
  const rubOf = (cle) => rubriques.find(r => r.cle === cle);

  // Stats par rubrique
  const countByType = rubriques.reduce((acc, r) => {
    acc[r.cle] = items.filter(i => i.type === r.cle).length;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contenu Culturel</h1>
            <p className="text-sm text-gray-500">{items.length} élément{items.length !== 1 ? 's' : ''} · {rubriques.length} rubrique{rubriques.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewRubriques(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
              viewRubriques
                ? 'bg-gray-800 text-white border-gray-800'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Rubriques
          </button>
          <button
            onClick={() => setModalContenu('create')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> Nouveau contenu
          </button>
        </div>
      </div>

      {/* ── Vue Gestion des rubriques ── */}
      {viewRubriques && (
        <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">🗂️ Gestion des rubriques</h2>
            <button
              onClick={() => setModalRubrique('create')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700"
            >
              <PlusIcon className="w-3.5 h-3.5" /> Nouvelle rubrique
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {rubriques.map(r => {
              const p  = paletteOf(r.couleur);
              const nb = countByType[r.cle] ?? 0;
              const isDefault = DEFAULT_RUBRIQUES.some(d => d.cle === r.cle);
              return (
                <div key={r.cle} className="flex items-center gap-4 px-6 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${p.bg}`}>
                    {r.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{r.nom}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.bg} ${p.text}`}>
                        {r.emoji} {r.nom}
                      </span>
                      {isDefault && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">défaut</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-mono text-gray-400">{r.cle}</span>
                      <span className="text-xs text-gray-500">{nb} contenu{nb !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setModalRubrique(r)}
                      className="p-2 rounded-lg hover:bg-purple-50 text-purple-400 border border-purple-100 transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => nb > 0
                        ? toast.error(`Impossible : ${nb} contenu(s) utilisent cette rubrique.`)
                        : setConfirmDel({ type: 'rubrique', item: r })
                      }
                      className={`p-2 rounded-lg border transition-colors ${
                        nb > 0
                          ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                          : 'hover:bg-red-50 text-red-400 border-red-100'
                      }`}
                      title={nb > 0 ? 'Contient du contenu' : 'Supprimer'}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filtres ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !filterType ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Tout ({items.length})
        </button>
        {rubriques.map(r => {
          const p  = paletteOf(r.couleur);
          const nb = countByType[r.cle] ?? 0;
          return (
            <button
              key={r.cle}
              onClick={() => setFilterType(filterType === r.cle ? '' : r.cle)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === r.cle
                  ? 'bg-primary-500 text-white'
                  : `${p.bg} ${p.text} hover:opacity-80`
              }`}
            >
              {r.emoji} {r.nom}
              <span className={`text-xs ${filterType === r.cle ? 'bg-white/20' : 'bg-white/50'} px-1.5 py-0.5 rounded-full`}>
                {nb}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => { setModalRubrique('create'); setViewRubriques(true); }}
          className="px-3 py-1.5 rounded-lg text-sm border border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
        >
          + rubrique
        </button>
      </div>

      {/* ── Liste des contenus ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <SparklesIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun contenu pour ce filtre</p>
          <button
            onClick={() => setModalContenu('create')}
            className="mt-4 text-sm text-primary-600 hover:underline"
          >
            Ajouter le premier contenu
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const r = rubOf(item.type);
            const p = paletteOf(r?.couleur || 'purple');
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {/* Badge rubrique */}
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 mt-0.5 ${p.bg} ${p.text}`}>
                    {r?.emoji || '✨'} {r?.nom || item.type}
                  </span>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 italic leading-relaxed">"{item.contenu}"</p>
                    {item.traduction && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.traduction}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {item.sourceEthnique && (
                        <span className="text-xs text-gray-400">— {item.sourceEthnique}</span>
                      )}
                      {item.language && (
                        <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                          {item.language.nom}
                        </span>
                      )}
                      {item.audioUrl && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">🌍 Audio</span>
                      )}
                      {item.audioUrlFr && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">🇫🇷 Audio</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => setModalContenu(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDel({ type: 'contenu', item })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════ MODAUX ══════════════ */}

      {/* Modal contenu */}
      {modalContenu && (
        <ModalContenu
          initial={modalContenu !== 'create' ? modalContenu : null}
          rubriques={rubriques}
          languages={languages}
          onSave={handleSaveContenu}
          onClose={() => setModalContenu(null)}
        />
      )}

      {/* Modal rubrique */}
      {modalRubrique && (
        <ModalRubrique
          initial={modalRubrique !== 'create' ? modalRubrique : null}
          rubriques={rubriques}
          onSave={data => {
            if (modalRubrique !== 'create') editRubrique(modalRubrique, data);
            else addRubrique(data);
          }}
          onClose={() => setModalRubrique(null)}
        />
      )}

      {/* Confirmation suppression */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmDel.type === 'rubrique'
                ? <>Supprimer la rubrique <strong>« {confirmDel.item.nom} »</strong> ?</>
                : <>Supprimer ce contenu de type <strong>{rubOf(confirmDel.item.type)?.nom || confirmDel.item.type}</strong> ?</>
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDel(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => confirmDel.type === 'rubrique'
                  ? deleteRubrique(confirmDel.item)
                  : handleDelete(confirmDel.item)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHelp pageId="cultural" />
    </div>
  );
}
