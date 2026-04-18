import { useEffect, useState, useRef } from 'react';
import api, { dictionaryAPI, languagesAPI, uploadAPI } from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PUBLISHED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  ARCHIVED:  'bg-red-100 text-red-700',
  REJECTED:  'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  PUBLISHED: 'Publié', PENDING: 'En validation', DRAFT: 'Brouillon',
  ARCHIVED: 'Archivé', REJECTED: 'Rejeté',
};

const CATEGORIES = ['salutations','famille','nourriture','nature','habitat','transport','vie_quotidienne','expressions','verbes','spiritualite','vie_sociale','chiffres','couleurs'];

const EMPTY_FORM = { mot: '', traduction: '', transcription: '', categorie: '', exemplePhrase: '', exempleTraduction: '', audioUrl: '', imageUrl: '' };

// Composant lecteur audio inline
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
      audioRef.current.play().catch(() => toast.error('Impossible de lire l\'audio'));
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} title={playing ? 'Arrêter' : 'Écouter la prononciation'}
        className={`p-1.5 rounded-lg transition-colors ${playing
          ? 'text-primary-500 bg-primary-50 animate-pulse'
          : 'text-accent hover:text-primary-500 hover:bg-primary-50'}`}>
        {playing ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
      </button>
    </>
  );
}

export default function VocabularyPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const audioFileRef = useRef(null);
  const imageFileRef = useRef(null);
  const LIMIT = 20;

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) setSelectedLang(data[0].code);
    });
  }, []);

  const loadEntries = () => {
    if (!selectedLang) return;
    setLoading(true);
    dictionaryAPI.get(selectedLang, { page, limit: LIMIT })
      .then(({ data }) => { setEntries(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEntries(); }, [selectedLang, page]);

  const handleSearch = (q) => {
    setSearch(q);
    if (q.length < 2) { loadEntries(); return; }
    dictionaryAPI.search({ q, langue: selectedLang })
      .then(({ data }) => { setEntries(data); setTotal(data.length); });
  };

  const openAdd = () => {
    setEditEntry(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditEntry(entry);
    setForm({
      mot: entry.mot || '',
      traduction: entry.traduction || '',
      transcription: entry.transcription || '',
      categorie: entry.categorie || '',
      exemplePhrase: entry.exemplePhrase || '',
      exempleTraduction: entry.exempleTraduction || '',
      audioUrl: entry.audioUrl || '',
      imageUrl: entry.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.mot || !form.traduction) { toast.error('Mot et traduction obligatoires'); return; }
    setSaving(true);
    try {
      if (editEntry) {
        await api.patch(`/dictionary/admin/word/${editEntry.id}`, form);
        toast.success('Mot mis à jour !');
      } else {
        await api.post('/dictionary/admin/word', { ...form, langueCode: selectedLang });
        toast.success('Mot ajouté !');
      }
      setShowModal(false);
      loadEntries();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Supprimer "${entry.mot}" ?`)) return;
    try {
      await api.delete(`/dictionary/admin/word/${entry.id}`);
      toast.success('Mot supprimé');
      loadEntries();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Génération audio TTS via le service IA
  const handleGenerateAudio = async () => {
    if (!form.mot) { toast.error('Entrez d\'abord le mot'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/dictionary/admin/generate-audio', {
        text: form.mot,
        languageCode: selectedLang,
        speed: 1.0,
        entryId: editEntry?.id || undefined,
      });
      setForm({ ...form, audioUrl: data.audioUrl });
      toast.success('Audio généré !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Service TTS indisponible');
    } finally {
      setGenerating(false);
    }
  };

  // Upload fichier audio
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('langueCode', selectedLang);
      if (form.mot) formData.append('mot', form.mot);
      if (editEntry?.id) formData.append('entryId', editEntry.id);
      const { data } = await uploadAPI.uploadAudio(formData);
      setForm(prev => ({ ...prev, audioUrl: data.audioUrl }));
      toast.success('Audio uploadé !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'upload audio');
    } finally {
      setUploadingAudio(false);
      e.target.value = '';
    }
  };

  // Upload fichier image
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('langueCode', selectedLang);
      if (form.mot) formData.append('mot', form.mot);
      if (editEntry?.id) formData.append('entryId', editEntry.id);
      const { data } = await uploadAPI.uploadImage(formData);
      setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Image uploadée !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur d\'upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Compteur audio
  const audioCount = entries.filter(e => e.audioUrl).length;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulaire</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} entrées au total
            {audioCount > 0 && <span className="ml-2 text-accent">({audioCount} avec audio)</span>}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Ajouter un mot
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <select className="input max-w-[180px]" value={selectedLang}
          onChange={e => { setSelectedLang(e.target.value); setPage(1); }}>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher un mot..."
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Image', 'Mot', 'Phonétique', 'Traduction', 'Catégorie', 'Statut', 'Actions'].map(h => (
                  <th key={h || 'audio'} className={`px-4 py-3 text-left font-semibold text-gray-600 ${h === '' || h === 'Image' ? 'w-10' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chargement...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Aucune entrée</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {entry.audioUrl ? (
                      <AudioPlayer src={entry.audioUrl} />
                    ) : (
                      <span className="p-1.5 rounded-lg text-gray-200" title="Pas d'audio">
                        <SpeakerXMarkIcon className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt={entry.mot} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <span className="text-gray-200"><PhotoIcon className="w-5 h-5" /></span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary-500">{entry.mot}</td>
                  <td className="px-4 py-3 text-gray-500 italic text-xs">{entry.transcription || '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{entry.traduction}</td>
                  <td className="px-4 py-3">
                    {entry.categorie && <span className="badge bg-orange-50 text-orange-600">{entry.categorie}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[entry.status]}`}>{STATUS_LABELS[entry.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(entry)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry)}
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
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajouter / Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editEntry ? 'Modifier le mot' : `Ajouter un mot — ${selectedLang.toUpperCase()}`}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot *</label>
                  <input className="input" value={form.mot} onChange={e => setForm({...form, mot: e.target.value})} placeholder="Ex: Akwaba" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traduction *</label>
                  <input className="input" value={form.traduction} onChange={e => setForm({...form, traduction: e.target.value})} placeholder="Ex: Bienvenue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phonétique</label>
                  <input className="input" value={form.transcription} onChange={e => setForm({...form, transcription: e.target.value})} placeholder="Ex: akwaba" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="input" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}>
                    <option value="">-- Choisir --</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exemple de phrase</label>
                <input className="input" value={form.exemplePhrase} onChange={e => setForm({...form, exemplePhrase: e.target.value})} placeholder="Ex: Akwaba Abidjan !" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction de l'exemple</label>
                <input className="input" value={form.exempleTraduction} onChange={e => setForm({...form, exempleTraduction: e.target.value})} placeholder="Ex: Bienvenue à Abidjan !" />
              </div>

              {/* Section Image */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4 text-blue-500" />
                  Image illustration
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL de l'image (PNG, JPG, WebP)</label>
                    <input className="input text-sm" value={form.imageUrl}
                      onChange={e => setForm({...form, imageUrl: e.target.value})}
                      placeholder="https://... (URL de l'image)" />
                  </div>
                  {form.imageUrl && (
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100">
                      <img src={form.imageUrl} alt="Aperçu" className="w-16 h-16 rounded-lg object-cover" />
                      <span className="text-xs text-gray-400">Aperçu de l'image</span>
                    </div>
                  )}
                  <input ref={imageFileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageFileUpload} className="hidden" />
                  <button type="button" onClick={() => imageFileRef.current?.click()} disabled={uploadingImage}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${uploadingImage ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                    {uploadingImage ? 'Upload en cours...' : '📁 Uploader une image depuis votre PC'}
                  </button>
                </div>
              </div>

              {/* Section Audio */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <SpeakerWaveIcon className="w-4 h-4 text-accent" />
                  Audio de prononciation
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">URL audio (MP3, WAV, OGG)</label>
                    <input className="input text-sm" value={form.audioUrl}
                      onChange={e => setForm({...form, audioUrl: e.target.value})}
                      placeholder="https://... ou data:audio/wav;base64,..." />
                  </div>

                  {/* Upload fichier audio */}
                  <input ref={audioFileRef} type="file" accept=".mp3,.wav,.ogg,.webm,.m4a" onChange={handleAudioFileUpload} className="hidden" />
                  <button type="button" onClick={() => audioFileRef.current?.click()} disabled={uploadingAudio}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${uploadingAudio ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'}`}>
                    {uploadingAudio ? 'Upload en cours...' : '🎙️ Uploader un fichier audio'}
                  </button>

                  {/* Aperçu audio */}
                  {form.audioUrl && (
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100">
                      <SpeakerWaveIcon className="w-5 h-5 text-accent flex-shrink-0" />
                      <audio controls className="h-8 flex-1" src={form.audioUrl} preload="metadata">
                        Votre navigateur ne supporte pas l'audio.
                      </audio>
                    </div>
                  )}

                  {/* Bouton génération IA */}
                  <button type="button" onClick={handleGenerateAudio} disabled={generating || !form.mot}
                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors
                    ${generating
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30'}`}>
                    {generating ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <SpeakerWaveIcon className="w-4 h-4" />
                        Générer l'audio via IA (TTS)
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Utilise Meta MMS-TTS pour synthétiser la prononciation</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde...' : editEntry ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
