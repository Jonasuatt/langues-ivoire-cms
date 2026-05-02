import { useState, useEffect, useRef } from 'react';
import {
  ExclamationTriangleIcon, PlusIcon, PencilIcon, TrashIcon,
  CheckIcon, XMarkIcon, MagnifyingGlassIcon,
  ArrowUpTrayIcon, SpeakerWaveIcon, StopIcon,
} from '@heroicons/react/24/outline';
import { phrasesAdminAPI, languagesAPI, uploadAPI } from '../services/api';
import CategorySelect from '../components/CategorySelect';

const CATEGORIES_SOS = [
  { value: 'urgence', label: '🆘 Urgence / SOS' },
  { value: 'sante',   label: '🏥 Santé / Corps' },
  { value: 'survie',  label: '🌊 Survie' },
  { value: 'social',  label: '👋 Salutations' },
  { value: 'commerce',label: '🛒 Commerce' },
  { value: 'autre',   label: '📝 Autre' },
];

const EMOJI_OPTIONS = ['🆘','🤕','🏥','👨‍⚕️','🚨','💧','⚠️','🗺️','👨‍👩‍👧','💊','🧠','🫁','❤️','🫃','💪','🦵','🦶'];

const EMPTY_FORM = {
  languageId: '', phrase: '', transcription: '', traduction: '',
  audioUrl: '', categorie: 'urgence', contexte: '', status: 'PUBLISHED',
};

export default function SOSPhrasesPage() {
  const [phrases, setPhrases] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const [filterLang, setFilterLang] = useState('');
  const [filterCat, setFilterCat] = useState('urgence');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (filterLang) params.languageId = filterLang;
      if (filterCat)  params.categorie  = filterCat;
      const [pRes, lRes] = await Promise.all([
        phrasesAdminAPI.getAll(params),
        languagesAPI.getAll(),
      ]);
      setPhrases(pRes.data.data || []);
      setLanguages(lRes.data || []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterLang, filterCat]);

  const closeModal = () => {
    setShowModal(false);
    setAudioPlaying(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
  };

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, languageId: filterLang || (languages[0]?.id || '') });
    setEditingId(null);
    setAudioPlaying(false);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      languageId: p.languageId,
      phrase: p.phrase,
      transcription: p.transcription || '',
      traduction: p.traduction,
      audioUrl: p.audioUrl || '',
      categorie: p.categorie || 'urgence',
      contexte: p.contexte || '',
      status: p.status,
    });
    setEditingId(p.id);
    setAudioPlaying(false);
    setShowModal(true);
  };

  const handleAudioUpload = async (file) => {
    if (!file) return;
    // Vérification type et taille (max 20 MB)
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/webm'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a|mp4|webm)$/i)) {
      alert('Format non supporté. Utilisez MP3, WAV, OGG, M4A ou WebM.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 20 MB).');
      return;
    }
    setUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const { data } = await uploadAPI.uploadAudio(formData);
      const url = data.audioUrl || data.url || data.secure_url;
      if (!url) throw new Error('URL manquante dans la réponse');
      setForm(f => ({ ...f, audioUrl: url }));
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de l\'upload audio.');
    } finally {
      setUploadingAudio(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const togglePreviewAudio = () => {
    if (!form.audioUrl) return;
    if (audioPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
    } else {
      if (audioRef.current) audioRef.current.src = form.audioUrl;
      audioRef.current?.play();
      setAudioPlaying(true);
    }
  };

  const handleSave = async () => {
    if (!form.languageId || !form.phrase || !form.traduction) return;
    setSaving(true);
    try {
      if (editingId) {
        await phrasesAdminAPI.update(editingId, form);
      } else {
        await phrasesAdminAPI.create(form);
      }
      closeModal();
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await phrasesAdminAPI.delete(id);
      setDeleteConfirm(null);
      await load();
    } catch { alert('Erreur lors de la suppression'); }
  };

  const getLangName = (id) => languages.find(l => l.id === id)?.nom || '?';
  const getLangCode = (id) => languages.find(l => l.id === id)?.code || '?';

  const filtered = phrases.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.phrase.toLowerCase().includes(q) || p.traduction.toLowerCase().includes(q);
  });

  // Grouper par langue
  const grouped = filtered.reduce((acc, p) => {
    const key = p.languageId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phrases SOS & Utiles</h1>
            <p className="text-sm text-gray-500">{phrases.length} phrase{phrases.length !== 1 ? 's' : ''} · Module S.O.S. de l'application</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Nouvelle phrase
        </button>
      </div>

      {/* Info */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
        <p className="text-sm text-red-800">
          <strong>ℹ️ Module S.O.S. Langues</strong> — Ces phrases apparaissent dans l'écran d'urgence de l'application mobile.
          La catégorie <strong>🆘 Urgence / SOS</strong> correspond aux 10 phrases vitales. La catégorie <strong>🏥 Santé / Corps</strong> correspond aux parties du corps.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher une phrase..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={filterLang} onChange={e => setFilterLang(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <CategorySelect
          value={filterCat}
          onChange={setFilterCat}
          options={CATEGORIES_SOS}
          storageKey="sos"
          placeholder="Toutes catégories"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucune phrase trouvée</p>
          <p className="text-sm mt-1">Créez des phrases SOS pour les langues actives.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([langId, langPhrases]) => (
            <div key={langId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{getLangName(langId)}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{getLangCode(langId)}</span>
                  <span className="text-xs text-gray-400">{langPhrases.length} phrase{langPhrases.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {langPhrases.map(p => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-red-800 truncate">{p.phrase}</p>
                        {p.transcription && (
                          <span className="text-xs text-gray-400 font-mono">[{p.transcription}]</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{p.traduction}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.audioUrl && (
                        <button onClick={() => new Audio(p.audioUrl).play()}
                          className="text-xs text-primary-600 hover:underline">▶ Audio</button>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status === 'PUBLISHED' ? 'Publié' : p.status}
                      </span>
                      <button onClick={() => openEdit(p)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(p)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Modifier la phrase' : 'Nouvelle phrase SOS'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Langue *</label>
                  <select value={form.languageId} onChange={e => setForm(f => ({ ...f, languageId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Choisir...</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                  <CategorySelect
                    value={form.categorie}
                    onChange={v => setForm(f => ({ ...f, categorie: v }))}
                    options={CATEGORIES_SOS}
                    storageKey="sos"
                    placeholder={null}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phrase dans la langue locale *</label>
                <input type="text" value={form.phrase} onChange={e => setForm(f => ({ ...f, phrase: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: A dɛmɛ n'na !" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Traduction en français *</label>
                <input type="text" value={form.traduction} onChange={e => setForm(f => ({ ...f, traduction: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Aidez-moi ! Au secours !" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Transcription phonétique</label>
                <input type="text" value={form.transcription} onChange={e => setForm(f => ({ ...f, transcription: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="notation phonétique..." />
              </div>

              {/* ── Audio : upload fichier OU URL manuelle ── */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Audio</label>

                {/* Bouton import fichier */}
                <div className="flex gap-2 mb-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={e => handleAudioUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAudio}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium border-2 border-dashed border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 flex-1 justify-center"
                  >
                    {uploadingAudio ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-400/40 border-t-primary-600 rounded-full animate-spin" />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        Importer depuis l'ordinateur
                      </>
                    )}
                  </button>

                  {/* Bouton lecture si URL présente */}
                  {form.audioUrl && (
                    <button
                      type="button"
                      onClick={togglePreviewAudio}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        audioPlaying
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {audioPlaying
                        ? <><StopIcon className="w-4 h-4" /> Stop</>
                        : <><SpeakerWaveIcon className="w-4 h-4" /> Écouter</>
                      }
                    </button>
                  )}
                </div>

                {/* Indications format */}
                <p className="text-xs text-gray-400 mb-2">MP3, WAV, OGG, M4A · max 20 MB</p>

                {/* URL résultante (lecture seule si uploadée, éditable sinon) */}
                {form.audioUrl ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <SpeakerWaveIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-green-700 truncate flex-1 font-mono">{form.audioUrl}</span>
                    <button
                      type="button"
                      onClick={() => { setForm(f => ({ ...f, audioUrl: '' })); setAudioPlaying(false); }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      title="Supprimer l'audio"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={form.audioUrl}
                    onChange={e => setForm(f => ({ ...f, audioUrl: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                    placeholder="Ou collez une URL Cloudinary directement…"
                  />
                )}

                {/* Lecteur audio caché */}
                <audio
                  ref={audioRef}
                  onEnded={() => setAudioPlaying(false)}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contexte / Emoji</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, contexte: e }))}
                      className={`text-xl p-1 rounded transition-colors ${form.contexte === e ? 'bg-primary-100' : 'hover:bg-gray-100'}`}>
                      {e}
                    </button>
                  ))}
                </div>
                <input type="text" value={form.contexte} onChange={e => setForm(f => ({ ...f, contexte: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Emoji ou contexte..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Statut</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="PUBLISHED">Publié (visible dans l'app)</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="PENDING">En attente</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={handleSave}
                disabled={saving || !form.languageId || !form.phrase || !form.traduction}
                className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer cette phrase ?</h3>
            <p className="text-sm text-gray-600 mb-1 font-medium text-red-800">{deleteConfirm.phrase}</p>
            <p className="text-sm text-gray-500 mb-4">{deleteConfirm.traduction}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
