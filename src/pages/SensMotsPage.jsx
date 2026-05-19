import { useEffect, useState, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import api from '../services/api';
import FileUploadField from '../components/FileUploadField';
import {
  MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  ARCHIVED:  'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  PUBLISHED: 'Publié',
  DRAFT:     'Brouillon',
  ARCHIVED:  'Archivé',
};

const EMPTY_FORM = {
  languageId: '', motSource: '', transcription: '', audioUrl: '',
  sensHistoriqueFr: '', sensVeritable: '', contexteErreur: '', source: '',
  status: 'DRAFT',
};

function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); audioRef.current.currentTime = 0; setPlaying(false); }
    else { audioRef.current.play().catch(() => toast.error("Impossible de lire l'audio")); setPlaying(true); }
  };
  return (
    <>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} title={playing ? 'Arrêter' : 'Écouter'}
        className={`p-1.5 rounded-lg transition-colors ${playing
          ? 'text-primary-500 bg-primary-50 animate-pulse'
          : 'text-accent hover:text-primary-500 hover:bg-primary-50'}`}>
        {playing ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
      </button>
    </>
  );
}

export default function SensMotsPage() {
  const [languages, setLanguages] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const LIMIT = 20;

  // Load languages
  useEffect(() => {
    api.get('/languages').then(({ data }) => {
      setLanguages(Array.isArray(data) ? data : (data.data || []));
    }).catch(() => {});
  }, []);

  // Load sens mots
  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterLang)   params.languageId = filterLang;
    if (filterStatus) params.status     = filterStatus;
    if (search)       params.search     = search;
    api.get('/sens-mots', { params })
      .then(({ data }) => { setItems(data.data); setTotal(data.total); })
      .catch(() => toast.error('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterLang, filterStatus]);

  const handleSearch = (q) => {
    setSearch(q);
    if (q.length === 0 || q.length >= 2) {
      setPage(1);
      setTimeout(() => load(), 0);
    }
  };

  const openAdd = () => { setEditEntry(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditEntry(item);
    setForm({
      languageId:       item.languageId       || '',
      motSource:        item.motSource        || '',
      transcription:    item.transcription    || '',
      audioUrl:         item.audioUrl         || '',
      sensHistoriqueFr: item.sensHistoriqueFr || '',
      sensVeritable:    item.sensVeritable    || '',
      contexteErreur:   item.contexteErreur   || '',
      source:           item.source           || '',
      status:           item.status           || 'DRAFT',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.motSource.trim())        { toast.error('Le mot source est obligatoire'); return; }
    if (!form.sensHistoriqueFr.trim()) { toast.error('Le sens historique FR est obligatoire'); return; }
    if (!form.sensVeritable.trim())    { toast.error('Le sens véritable est obligatoire'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        languageId: form.languageId || null,
      };
      if (editEntry) {
        await api.patch(`/sens-mots/${editEntry.id}`, payload);
        toast.success('Fiche mise à jour !');
      } else {
        await api.post('/sens-mots', payload);
        toast.success('Fiche créée !');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Archiver la fiche "${item.motSource}" ?`)) return;
    try {
      await api.delete(`/sens-mots/${item.id}`);
      toast.success('Fiche archivée');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sens des Mots</h1>
          <p className="text-gray-500 text-sm mt-1">
            Divergences sémantiques entre traductions coloniales et significations culturelles réelles
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            <span className="font-medium text-primary-500">{total}</span> fiches au total
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Ajouter une fiche
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input max-w-[180px]" value={filterLang}
          onChange={e => { setFilterLang(e.target.value); setPage(1); }}>
          <option value="">Toutes les langues</option>
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.nom}</option>
          ))}
        </select>

        <select className="input max-w-[180px]" value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>

        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher un mot, sens…"
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Mot source', 'Sens historique FR', 'Sens véritable', 'Langue', 'Statut', 'Actions'].map(h => (
                  <th key={h || 'audio'} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  Aucune fiche trouvée — ajoutez-en via le bouton ci-dessus
                </td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {item.audioUrl
                      ? <AudioPlayer src={item.audioUrl} />
                      : <SpeakerXMarkIcon className="w-4 h-4 text-gray-200" />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary-500">{item.motSource}</div>
                    {item.transcription && (
                      <div className="text-xs text-gray-400 italic">[{item.transcription}]</div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <span className="line-through text-red-500 text-xs leading-tight block">
                      {item.sensHistoriqueFr}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-green-700 text-xs leading-tight block font-medium">
                      {item.sensVeritable}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.language
                      ? <span className="badge bg-orange-50 text-orange-600">{item.language.nom}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1.5 px-3"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
              <button className="btn-secondary text-sm py-1.5 px-3"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editEntry ? 'Modifier la fiche' : 'Nouvelle fiche — Sens des Mots'}
            </h2>

            <div className="space-y-4">
              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                <select className="input" value={form.languageId}
                  onChange={e => setForm(f => ({ ...f, languageId: e.target.value }))}>
                  <option value="">— Toutes langues —</option>
                  {languages.map(l => (
                    <option key={l.id} value={l.id}>{l.nom}</option>
                  ))}
                </select>
              </div>

              {/* Mot source + phonétique */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot source *</label>
                  <input className="input" value={form.motSource}
                    onChange={e => setForm(f => ({ ...f, motSource: e.target.value }))}
                    placeholder="Ex: Kourouma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phonétique</label>
                  <input className="input" value={form.transcription}
                    onChange={e => setForm(f => ({ ...f, transcription: e.target.value }))}
                    placeholder="Ex: ku-ru-ma" />
                </div>
              </div>

              {/* Sens historique FR */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sens historique FR *
                  <span className="ml-2 text-xs text-red-500 font-normal">(traduction coloniale, souvent erronée)</span>
                </label>
                <textarea className="input resize-none" rows={2} value={form.sensHistoriqueFr}
                  onChange={e => setForm(f => ({ ...f, sensHistoriqueFr: e.target.value }))}
                  placeholder="Traduction française retenue historiquement…" />
              </div>

              {/* Sens véritable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sens véritable *
                  <span className="ml-2 text-xs text-green-600 font-normal">(signification culturelle réelle)</span>
                </label>
                <textarea className="input resize-none" rows={2} value={form.sensVeritable}
                  onChange={e => setForm(f => ({ ...f, sensVeritable: e.target.value }))}
                  placeholder="Signification culturelle authentique…" />
              </div>

              {/* Contexte de l'erreur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contexte de la divergence
                </label>
                <textarea className="input resize-none" rows={3} value={form.contexteErreur}
                  onChange={e => setForm(f => ({ ...f, contexteErreur: e.target.value }))}
                  placeholder="Expliquez l'origine de cette divergence sémantique…" />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source / Validateur</label>
                <input className="input" value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  placeholder="Ex: Locuteur natif, Institut des Langues, …" />
              </div>

              {/* Audio — upload local ou URL */}
              <FileUploadField
                type="audio"
                label="🔊 Audio de prononciation native"
                value={form.audioUrl}
                onChange={url => setForm(f => ({ ...f, audioUrl: url }))}
              />

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select className="input" value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editEntry ? 'Mettre à jour' : 'Créer la fiche'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHelp pageId="sens-mots" />
    </div>
  );
}
