import { useEffect, useState, useRef } from 'react';
import api, { uploadAPI } from '../services/api';
import {
  BookOpenIcon, PlusIcon, TrashIcon, PencilIcon,
  XMarkIcon, SpeakerWaveIcon, MusicalNoteIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import FileUploadField from '../components/FileUploadField';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TYPES = [
  { key: 'CONTE',         label: 'Conte',       emoji: '📖', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'HISTOIRE',      label: 'Histoire',    emoji: '🏛️',  color: 'bg-blue-100 text-blue-700' },
  { key: 'CHANSON',       label: 'Chanson',     emoji: '🎵', color: 'bg-pink-100 text-pink-700' },
  { key: 'RECIT',         label: 'Récit',       emoji: '📜', color: 'bg-amber-100 text-amber-700' },
  { key: 'DESCRIPTION',   label: 'Description', emoji: '📝', color: 'bg-teal-100 text-teal-700' },
  { key: 'LEGENDE',       label: 'Légende',     emoji: '⭐', color: 'bg-orange-100 text-orange-700' },
  { key: 'PROVERBE_LONG', label: 'Proverbe',    emoji: '💡', color: 'bg-green-100 text-green-700' },
];

const STORAGE_KEY = 'textContentCustomTypes';

function loadCustomTypes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveCustomTypes(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1'];

const NIVEAU_COLORS = {
  A1: 'bg-emerald-100 text-emerald-700',
  A2: 'bg-green-100 text-green-700',
  B1: 'bg-yellow-100 text-yellow-700',
  B2: 'bg-orange-100 text-orange-700',
  C1: 'bg-red-100 text-red-700',
};

const STATUS_META = {
  DRAFT:     { label: 'Brouillon',  color: 'bg-gray-100 text-gray-600' },
  PUBLISHED: { label: 'Publié',     color: 'bg-green-100 text-green-700' },
};

const EMPTY_FORM = {
  languageId: '',
  type: 'CONTE',
  titre: '',
  contenu: '',
  traduction: '',
  transcription: '',
  resume: '',
  audioUrl: '',
  audioUrlFr: '',
  imageUrl: '',
  niveau: 'A1',
  auteur: '',
  sourceEthnique: '',
  tags: [],
  dureeMin: '',
  status: 'DRAFT',
};

// ─── Audio Player ─────────────────────────────────────────────────────────────

function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => toast.error("Impossible de lire l'audio"));
      setPlaying(true);
    }
  };
  return (
    <>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button
        onClick={toggle}
        title={playing ? 'Arrêter' : 'Écouter'}
        className={`p-1 rounded-lg transition-colors ${
          playing
            ? 'text-violet-500 bg-violet-50 animate-pulse'
            : 'text-gray-400 hover:text-violet-500 hover:bg-violet-50'
        }`}
      >
        <SpeakerWaveIcon className="w-4 h-4" />
      </button>
    </>
  );
}

// ─── Tags Input ───────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = (val) => {
    const tag = val.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="border border-gray-200 rounded-xl p-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-violet-300 focus-within:border-violet-400 transition-all min-h-[42px]">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="hover:text-violet-900 transition-colors">
            <XMarkIcon className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
        placeholder={tags.length === 0 ? 'Ajouter un tag (Entrée)…' : ''}
        className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TextContentPage() {
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Filters
  const [filterLang, setFilterLang] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Custom types
  const [customTypes, setCustomTypes] = useState(loadCustomTypes);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeEmoji, setNewTypeEmoji] = useState('✨');

  const allTypes = [...DEFAULT_TYPES, ...customTypes];

  const addCustomType = () => {
    const label = newTypeLabel.trim();
    if (!label) return;
    const key = label.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    if (allTypes.some(t => t.key === key)) { toast.error('Ce type existe déjà'); return; }
    const newType = { key, label, emoji: newTypeEmoji, color: 'bg-violet-100 text-violet-700', custom: true };
    const updated = [...customTypes, newType];
    setCustomTypes(updated);
    saveCustomTypes(updated);
    setForm(f => ({ ...f, type: key }));
    setNewTypeLabel('');
    setNewTypeEmoji('✨');
    setShowNewType(false);
    toast.success(`Type "${label}" créé !`);
  };

  const removeCustomType = (key) => {
    const updated = customTypes.filter(t => t.key !== key);
    setCustomTypes(updated);
    saveCustomTypes(updated);
  };

  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // File input refs
  const imageFileRef = useRef(null);
  const audioFileRef = useRef(null);

  // ── Upload handlers ──────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await uploadAPI.uploadImage(formData);
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Image uploadée !');
    } catch {
      toast.error('Erreur upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const { data } = await uploadAPI.uploadAudio(formData);
      setForm(prev => ({ ...prev, audioUrl: data.audioUrl }));
      toast.success('Audio uploadé !');
    } catch {
      toast.error('Erreur upload audio');
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  // ── Load languages once ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/languages')
      .then(({ data }) => setLanguages(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {});
  }, []);

  // ── Load content ─────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterLang) params.langue = filterLang;
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;
    api.get('/text-contents/admin/list', { params })
      .then(({ data }) => {
        setItems(data.data ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [filterLang, filterType, filterNiveau, filterStatus]);
  useEffect(() => { load(); }, [page, filterLang, filterType, filterStatus]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, languageId: filterLang || '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      languageId: item.languageId ?? '',
      type: item.type ?? 'CONTE',
      titre: item.titre ?? '',
      contenu: item.contenu ?? '',
      traduction: item.traduction ?? '',
      transcription: item.transcription ?? '',
      resume: item.resume ?? '',
      audioUrl: item.audioUrl ?? '',
      audioUrlFr: item.audioUrlFr ?? '',
      imageUrl: item.imageUrl ?? '',
      niveau: item.niveau ?? 'A1',
      auteur: item.auteur ?? '',
      sourceEthnique: item.sourceEthnique ?? '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      dureeMin: item.dureeMin ?? '',
      status: item.status ?? 'DRAFT',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditItem(null); };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.titre.trim()) { toast.error('Le titre est obligatoire'); return; }
    if (!form.contenu.trim()) { toast.error('Le contenu en langue locale est obligatoire'); return; }
    if (!form.languageId) { toast.error('Veuillez choisir une langue'); return; }
    setSaving(true);
    const payload = {
      ...form,
      dureeMin: form.dureeMin ? Number(form.dureeMin) : undefined,
    };
    try {
      if (editItem) {
        await api.patch(`/text-contents/admin/${editItem.id}`, payload);
        toast.success('Texte mis à jour !');
      } else {
        await api.post('/text-contents/admin', payload);
        toast.success('Texte créé avec succès !');
      }
      closeModal();
      load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.titre}" ? Cette action est irréversible.`)) return;
    setDeleting(item.id);
    try {
      await api.delete(`/text-contents/admin/${item.id}`);
      toast.success('Texte supprimé');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / LIMIT);
  const filteredItems = filterNiveau
    ? items.filter(it => it.niveau === filterNiveau)
    : items;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-8 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <BookOpenIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Textes & Récits</h1>
              <p className="text-violet-200 text-sm mt-0.5">
                Contes, histoires, chansons, récits et descriptions en langues ivoiriennes
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
          >
            <PlusIcon className="w-5 h-5" />
            Nouveau texte
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-4">
          <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-white">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-violet-200 text-sm ml-2">texte{total !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-4">

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">

          {/* Language + Status */}
          <div className="flex gap-3 flex-wrap">
            <select
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
              value={filterLang}
              onChange={e => setFilterLang(e.target.value)}
            >
              <option value="">Toutes les langues</option>
              {languages.map(l => (
                <option key={l.id} value={l.code ?? l.id}>{l.nom}</option>
              ))}
            </select>

            <select
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
              value={filterNiveau}
              onChange={e => setFilterNiveau(e.target.value)}
            >
              <option value="">Tous niveaux</option>
              {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <select
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Tous statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
          </div>

          {/* Type chips */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setFilterType('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !filterType
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {allTypes.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key === filterType ? '' : t.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterType === t.key
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl shadow-sm border border-gray-100" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 flex flex-col items-center text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">Aucun texte pour ces filtres</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterType || filterLang || filterStatus
                ? 'Essayez de modifier vos filtres ou'
                : 'Commencez par'}{' '}
              <button onClick={openAdd} className="text-violet-600 underline hover:text-violet-700">
                ajouter un nouveau texte
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const meta = allTypes.find(t => t.key === item.type) ?? allTypes[0];
              const statusMeta = STATUS_META[item.status] ?? STATUS_META.DRAFT;
              const lang = languages.find(l => l.id === item.languageId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Left: type emoji */}
                  <div className="flex-shrink-0 text-3xl w-10 flex items-start justify-center pt-0.5">
                    {meta.emoji}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                      {item.niveau && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${NIVEAU_COLORS[item.niveau] ?? 'bg-gray-100 text-gray-600'}`}>
                          {item.niveau}
                        </span>
                      )}
                      {item.audioUrl && (
                        <span className="inline-flex items-center gap-0.5 text-violet-500">
                          <SpeakerWaveIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 truncate">{item.titre}</h3>

                    {/* Resume */}
                    {item.resume && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.resume}</p>
                    )}

                    {/* Bottom meta row */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-400">
                      {lang && (
                        <span className="font-medium text-violet-600">{lang.nom}</span>
                      )}
                      {item.auteur && <span>✍️ {item.auteur}</span>}
                      {item.sourceEthnique && <span>🏺 {item.sourceEthnique}</span>}
                      {item.dureeMin && <span>⏱ {item.dureeMin} min</span>}
                      {Array.isArray(item.tags) && item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex-shrink-0 flex flex-col items-end justify-between gap-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.audioUrl && <AudioPlayer src={item.audioUrl} />}
                      <button
                        onClick={() => openEdit(item)}
                        title="Modifier"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deleting === item.id}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Précédent
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Create / Edit Modal
      ════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editItem ? 'Modifier le texte' : 'Nouveau texte & récit'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body — two columns */}
            <div className="p-6 grid grid-cols-5 gap-6">

              {/* ── Left column (2/5) ── */}
              <div className="col-span-2 space-y-4">

                {/* Langue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Langue <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    value={form.languageId}
                    onChange={e => setForm({ ...form, languageId: e.target.value })}
                  >
                    <option value="">-- Choisir une langue --</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    Type
                    <button
                      type="button"
                      onClick={() => setShowNewType(v => !v)}
                      className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Nouveau type
                    </button>
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    {allTypes.map(t => (
                      <option key={t.key} value={t.key}>{t.emoji} {t.label}</option>
                    ))}
                  </select>

                  {/* Inline new type form */}
                  {showNewType && (
                    <div className="mt-2 p-3 bg-violet-50 rounded-xl border border-violet-200 space-y-2">
                      <p className="text-xs font-semibold text-violet-700">Créer un nouveau type</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTypeEmoji}
                          onChange={e => setNewTypeEmoji(e.target.value)}
                          className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-violet-300 outline-none"
                          placeholder="🎭"
                          maxLength={4}
                        />
                        <input
                          type="text"
                          value={newTypeLabel}
                          onChange={e => setNewTypeLabel(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustomType()}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-violet-300 outline-none"
                          placeholder="Nom du type (ex: Mythe)"
                        />
                        <button
                          type="button"
                          onClick={addCustomType}
                          className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Créer
                        </button>
                      </div>
                      {/* Custom types list with delete */}
                      {customTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {customTypes.map(t => (
                            <span key={t.key} className="inline-flex items-center gap-1 bg-white text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-xs font-medium">
                              {t.emoji} {t.label}
                              <button type="button" onClick={() => removeCustomType(t.key)} className="hover:text-red-500 transition-colors">
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                    value={form.titre}
                    onChange={e => setForm({ ...form, titre: e.target.value })}
                    placeholder="ex: Le conte de l'araignée maligne"
                  />
                </div>

                {/* Résumé */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Résumé
                    <span className="text-gray-400 font-normal ml-2">({form.resume.length}/300)</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all resize-none"
                    value={form.resume}
                    onChange={e => setForm({ ...form, resume: e.target.value })}
                    placeholder="Courte description visible dans la liste…"
                  />
                </div>

                {/* Niveau + Durée */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      value={form.niveau}
                      onChange={e => setForm({ ...form, niveau: e.target.value })}
                    >
                      {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      value={form.dureeMin}
                      onChange={e => setForm({ ...form, dureeMin: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>

                {/* Auteur + Source */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      value={form.auteur}
                      onChange={e => setForm({ ...form, auteur: e.target.value })}
                      placeholder="Nom de l'auteur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source ethnique</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all"
                      value={form.sourceEthnique}
                      onChange={e => setForm({ ...form, sourceEthnique: e.target.value })}
                      placeholder="ex: Baoulé, Dioula…"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <TagsInput
                    tags={form.tags}
                    onChange={tags => setForm({ ...form, tags })}
                  />
                </div>

                {/* Image */}
                <FileUploadField
                  type="image"
                  label="Image illustrative"
                  value={form.imageUrl}
                  onChange={url => setForm({ ...form, imageUrl: url })}
                />

                {/* Audio langue locale */}
                <FileUploadField
                  type="audio"
                  label="🌍 Audio langue locale"
                  value={form.audioUrl}
                  onChange={url => setForm({ ...form, audioUrl: url })}
                />

                {/* Audio français */}
                <FileUploadField
                  type="audio"
                  label="🇫🇷 Audio français (traduction)"
                  value={form.audioUrlFr}
                  onChange={url => setForm({ ...form, audioUrlFr: url })}
                />


                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <div className="flex gap-2">
                    {['DRAFT', 'PUBLISHED'].map(s => {
                      const meta = STATUS_META[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, status: s })}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                            form.status === s
                              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Right column (3/5) — text areas ── */}
              <div className="col-span-3 space-y-5">

                {/* Contenu en langue locale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Texte en langue locale{' '}
                    <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2 text-xs">
                      ({form.contenu.length} caractères)
                    </span>
                  </label>
                  <textarea
                    rows={12}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-800 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all resize-y leading-relaxed"
                    value={form.contenu}
                    onChange={e => setForm({ ...form, contenu: e.target.value })}
                    placeholder="Saisissez le texte complet dans la langue locale…"
                  />
                </div>

                {/* Traduction française */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Traduction française
                  </label>
                  <textarea
                    rows={8}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all resize-y leading-relaxed"
                    value={form.traduction}
                    onChange={e => setForm({ ...form, traduction: e.target.value })}
                    placeholder="Traduction complète en français…"
                  />
                </div>

                {/* Transcription phonétique */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Transcription phonétique
                    <span className="text-gray-400 font-normal ml-2 text-xs">(optionnel)</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono text-gray-700 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all resize-y leading-relaxed"
                    value={form.transcription}
                    onChange={e => setForm({ ...form, transcription: e.target.value })}
                    placeholder="Transcription phonétique ou aide à la prononciation…"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sauvegarde…
                  </>
                ) : editItem ? 'Mettre à jour' : 'Créer le texte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
