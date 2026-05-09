import { useEffect, useState, useRef } from 'react';
import api, { dictionaryAPI, languagesAPI, uploadAPI } from '../services/api';
import CategorySelect from '../components/CategorySelect';
import {
  MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon, PhotoIcon,
  BookOpenIcon, ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'salutations','famille','nourriture','nature','habitat','transport',
  'vie_quotidienne','expressions','verbes','spiritualite','vie_sociale',
  'chiffres','couleurs',
];

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

const EMPTY_WORD = {
  mot: '', traduction: '', transcription: '', categorie: '',
  exemplePhrase: '', exempleTraduction: '', audioUrl: '', imageUrl: '',
};
const EMPTY_PHRASE = {
  phrase: '', traduction: '', transcription: '', categorie: '', contexte: '',
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

export default function DictionaryPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [activeTab, setActiveTab] = useState('words'); // 'words' | 'phrases'

  // Words state
  const [words, setWords] = useState([]);
  const [wordTotal, setWordTotal] = useState(0);
  const [wordPage, setWordPage] = useState(1);
  const [wordLoading, setWordLoading] = useState(false);

  // Phrases state
  const [phrases, setPhrases] = useState([]);
  const [phraseTotal, setPhraseTotal] = useState(0);
  const [phrasePage, setPhrasePage] = useState(1);
  const [phraseLoading, setPhraseLoading] = useState(false);

  // Shared
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [wordForm, setWordForm] = useState(EMPTY_WORD);
  const [phraseForm, setPhraseForm] = useState(EMPTY_PHRASE);
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

  // Load words
  const loadWords = () => {
    if (!selectedLang) return;
    setWordLoading(true);
    const params = { page: wordPage, limit: LIMIT, tab: 'words' };
    if (filterCat) params.categorie = filterCat;
    dictionaryAPI.get(selectedLang, params)
      .then(({ data }) => { setWords(data.data); setWordTotal(data.total); })
      .catch(() => {})
      .finally(() => setWordLoading(false));
  };

  // Load phrases
  const loadPhrases = () => {
    if (!selectedLang) return;
    setPhraseLoading(true);
    const params = { page: phrasePage, limit: LIMIT, tab: 'phrases' };
    if (filterCat) params.categorie = filterCat;
    dictionaryAPI.get(selectedLang, params)
      .then(({ data }) => { setPhrases(data.data); setPhraseTotal(data.total); })
      .catch(() => {})
      .finally(() => setPhraseLoading(false));
  };

  useEffect(() => { loadWords(); }, [selectedLang, wordPage, filterCat]);
  useEffect(() => { loadPhrases(); }, [selectedLang, phrasePage, filterCat]);

  const handleSearch = (q) => {
    setSearch(q);
    if (q.length < 2) { loadWords(); loadPhrases(); return; }
    dictionaryAPI.search({ q, langue: selectedLang })
      .then(({ data }) => { setWords(data); setWordTotal(data.length); });
  };

  const resetLang = (code) => {
    setSelectedLang(code);
    setWordPage(1);
    setPhrasePage(1);
    setSearch('');
    setFilterCat('');
  };

  /* ── WORDS CRUD ── */
  const openAddWord = () => { setEditEntry(null); setWordForm(EMPTY_WORD); setShowModal('word'); };
  const openEditWord = (e) => {
    setEditEntry(e);
    setWordForm({ mot: e.mot||'', traduction: e.traduction||'', transcription: e.transcription||'',
      categorie: e.categorie||'', exemplePhrase: e.exemplePhrase||'', exempleTraduction: e.exempleTraduction||'',
      audioUrl: e.audioUrl||'', imageUrl: e.imageUrl||'' });
    setShowModal('word');
  };
  const handleSaveWord = async () => {
    if (!wordForm.mot || !wordForm.traduction) { toast.error('Mot et traduction obligatoires'); return; }
    setSaving(true);
    try {
      if (editEntry) {
        await api.patch(`/dictionary/admin/word/${editEntry.id}`, wordForm);
        toast.success('Mot mis à jour !');
      } else {
        await api.post('/dictionary/admin/word', { ...wordForm, langueCode: selectedLang });
        toast.success('Mot ajouté !');
      }
      setShowModal(false);
      loadWords();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };
  const handleDeleteWord = async (e) => {
    if (!confirm(`Supprimer "${e.mot}" ?`)) return;
    try {
      await api.delete(`/dictionary/admin/word/${e.id}`);
      toast.success('Mot supprimé');
      loadWords();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  /* ── PHRASES CRUD ── */
  const openAddPhrase = () => { setEditEntry(null); setPhraseForm(EMPTY_PHRASE); setShowModal('phrase'); };
  const openEditPhrase = (p) => {
    setEditEntry(p);
    setPhraseForm({ phrase: p.phrase||'', traduction: p.traduction||'', transcription: p.transcription||'',
      categorie: p.categorie||'', contexte: p.contexte||'' });
    setShowModal('phrase');
  };
  const handleSavePhrase = async () => {
    if (!phraseForm.phrase || !phraseForm.traduction) { toast.error('Phrase et traduction obligatoires'); return; }
    setSaving(true);
    try {
      if (editEntry) {
        await api.patch(`/dictionary/admin/word/${editEntry.id}`, phraseForm);
        toast.success('Phrase mise à jour !');
      } else {
        await api.post('/dictionary/admin/word', {
          ...phraseForm, mot: phraseForm.phrase,
          langueCode: selectedLang, type: 'PHRASE'
        });
        toast.success('Phrase ajoutée !');
      }
      setShowModal(false);
      loadPhrases();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };

  /* ── Audio / Image upload ── */
  const handleGenerateAudio = async () => {
    if (!wordForm.mot) { toast.error('Entrez d\'abord le mot'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/dictionary/admin/generate-audio', {
        text: wordForm.mot, languageCode: selectedLang, speed: 1.0,
        entryId: editEntry?.id || undefined,
      });
      setWordForm(f => ({ ...f, audioUrl: data.audioUrl }));
      toast.success('Audio généré !');
    } catch (err) { toast.error(err.response?.data?.error || 'Service TTS indisponible'); }
    finally { setGenerating(false); }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingAudio(true);
    try {
      const fd = new FormData();
      fd.append('audio', file); fd.append('langueCode', selectedLang);
      if (wordForm.mot) fd.append('mot', wordForm.mot);
      if (editEntry?.id) fd.append('entryId', editEntry.id);
      const { data } = await uploadAPI.uploadAudio(fd);
      setWordForm(f => ({ ...f, audioUrl: data.audioUrl }));
      toast.success('Audio uploadé !');
    } catch { toast.error("Erreur d'upload audio"); }
    finally { setUploadingAudio(false); e.target.value = ''; }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file); fd.append('langueCode', selectedLang);
      if (wordForm.mot) fd.append('mot', wordForm.mot);
      if (editEntry?.id) fd.append('entryId', editEntry.id);
      const { data } = await uploadAPI.uploadImage(fd);
      setWordForm(f => ({ ...f, imageUrl: data.imageUrl }));
      toast.success('Image uploadée !');
    } catch { toast.error("Erreur d'upload image"); }
    finally { setUploadingImage(false); e.target.value = ''; }
  };

  const audioCount = words.filter(w => w.audioUrl).length;
  const wordTotalPages = Math.ceil(wordTotal / LIMIT);
  const phraseTotalPages = Math.ceil(phraseTotal / LIMIT);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dictionnaire</h1>
          <p className="text-gray-500 text-sm mt-1">
            <span className="font-medium text-primary-500">{wordTotal}</span> mots ·{' '}
            <span className="font-medium text-accent">{phraseTotal}</span> phrases
            {audioCount > 0 && <span className="ml-2 text-green-600">· {audioCount} avec audio</span>}
          </p>
        </div>
        <button
          onClick={activeTab === 'words' ? openAddWord : openAddPhrase}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          {activeTab === 'words' ? 'Ajouter un mot' : 'Ajouter une phrase'}
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input max-w-[180px]" value={selectedLang}
          onChange={e => resetLang(e.target.value)}>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher..."
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <select className="input max-w-[180px]" value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setWordPage(1); setPhrasePage(1); }}>
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('words')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'words'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <BookOpenIcon className="w-4 h-4" />
          Mots ({wordTotal})
        </button>
        <button
          onClick={() => setActiveTab('phrases')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === 'phrases'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
          Phrases ({phraseTotal})
        </button>
      </div>

      {/* ── TAB MOTS ── */}
      {activeTab === 'words' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['', 'Image', 'Mot', 'Phonétique', 'Traduction', 'Catégorie', 'Statut', 'Actions'].map(h => (
                    <th key={h || 'audio'} className={`px-4 py-3 text-left font-semibold text-gray-600 ${['','Image'].includes(h)?'w-10':''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {wordLoading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chargement...</td></tr>
                ) : words.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Aucun mot trouvé</td></tr>
                ) : words.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {entry.audioUrl
                        ? <AudioPlayer src={entry.audioUrl} />
                        : <SpeakerXMarkIcon className="w-4 h-4 text-gray-200" />}
                    </td>
                    <td className="px-4 py-3">
                      {entry.imageUrl
                        ? <img src={entry.imageUrl} alt={entry.mot} className="w-8 h-8 rounded-lg object-cover" />
                        : <PhotoIcon className="w-5 h-5 text-gray-200" />}
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
                        <button onClick={() => openEditWord(entry)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteWord(entry)}
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
          {wordTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {wordPage} / {wordTotalPages}</p>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm py-1.5 px-3"
                  onClick={() => setWordPage(p => Math.max(1, p - 1))} disabled={wordPage === 1}>Précédent</button>
                <button className="btn-secondary text-sm py-1.5 px-3"
                  onClick={() => setWordPage(p => Math.min(wordTotalPages, p + 1))} disabled={wordPage === wordTotalPages}>Suivant</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB PHRASES ── */}
      {activeTab === 'phrases' && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Phrase', 'Phonétique', 'Traduction', 'Catégorie', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {phraseLoading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement...</td></tr>
                ) : phrases.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                    Aucune phrase utile — ajoutez-en via le bouton ci-dessus
                  </td></tr>
                ) : phrases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-500 max-w-xs">{p.phrase}</td>
                    <td className="px-4 py-3 text-gray-500 italic text-xs">{p.transcription || '—'}</td>
                    <td className="px-4 py-3 text-gray-900">{p.traduction}</td>
                    <td className="px-4 py-3">
                      {p.categorie && <span className="badge bg-orange-50 text-orange-600">{p.categorie}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_STYLES[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEditPhrase(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={async () => {
                          if (!confirm(`Supprimer "${p.phrase}" ?`)) return;
                          try { await api.delete(`/dictionary/admin/word/${p.id}`); toast.success('Phrase supprimée'); loadPhrases(); }
                          catch { toast.error('Erreur'); }
                        }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {phraseTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {phrasePage} / {phraseTotalPages}</p>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm py-1.5 px-3"
                  onClick={() => setPhrasePage(p => Math.max(1, p - 1))} disabled={phrasePage === 1}>Précédent</button>
                <button className="btn-secondary text-sm py-1.5 px-3"
                  onClick={() => setPhrasePage(p => Math.min(phraseTotalPages, p + 1))} disabled={phrasePage === phraseTotalPages}>Suivant</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL MOT ── */}
      {showModal === 'word' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editEntry ? 'Modifier le mot' : `Ajouter un mot — ${selectedLang.toUpperCase()}`}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot *</label>
                  <input className="input" value={wordForm.mot}
                    onChange={e => setWordForm(f => ({...f, mot: e.target.value}))} placeholder="Ex: Akwaba" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traduction *</label>
                  <input className="input" value={wordForm.traduction}
                    onChange={e => setWordForm(f => ({...f, traduction: e.target.value}))} placeholder="Ex: Bienvenue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phonétique</label>
                  <input className="input" value={wordForm.transcription}
                    onChange={e => setWordForm(f => ({...f, transcription: e.target.value}))} placeholder="Ex: akwaba" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <CategorySelect value={wordForm.categorie}
                    onChange={v => setWordForm(f => ({...f, categorie: v}))}
                    options={CATEGORIES} storageKey="dictionary" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exemple de phrase</label>
                <input className="input" value={wordForm.exemplePhrase}
                  onChange={e => setWordForm(f => ({...f, exemplePhrase: e.target.value}))} placeholder="Ex: Akwaba Abidjan !" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction de l'exemple</label>
                <input className="input" value={wordForm.exempleTraduction}
                  onChange={e => setWordForm(f => ({...f, exempleTraduction: e.target.value}))} placeholder="Ex: Bienvenue à Abidjan !" />
              </div>

              {/* Image */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4 text-blue-500" /> Image illustration
                </label>
                <input className="input text-sm mb-2" value={wordForm.imageUrl}
                  onChange={e => setWordForm(f => ({...f, imageUrl: e.target.value}))}
                  placeholder="https://... (URL de l'image)" />
                {wordForm.imageUrl && (
                  <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100 mb-2">
                    <img src={wordForm.imageUrl} alt="Aperçu" className="w-16 h-16 rounded-lg object-cover" />
                    <span className="text-xs text-gray-400">Aperçu</span>
                  </div>
                )}
                <input ref={imageFileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button type="button" onClick={() => imageFileRef.current?.click()} disabled={uploadingImage}
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                  bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 disabled:opacity-50">
                  {uploadingImage ? 'Upload…' : '📁 Uploader une image'}
                </button>
              </div>

              {/* Audio */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <SpeakerWaveIcon className="w-4 h-4 text-accent" /> Audio de prononciation
                </label>
                <input className="input text-sm mb-2" value={wordForm.audioUrl}
                  onChange={e => setWordForm(f => ({...f, audioUrl: e.target.value}))}
                  placeholder="https://... ou data:audio/wav;base64,..." />
                {wordForm.audioUrl && (
                  <div className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100 mb-2">
                    <audio controls className="h-8 flex-1" src={wordForm.audioUrl} preload="metadata" />
                  </div>
                )}
                <input ref={audioFileRef} type="file" accept=".mp3,.wav,.ogg,.webm,.m4a" onChange={handleAudioUpload} className="hidden" />
                <div className="space-y-2">
                  <button type="button" onClick={() => audioFileRef.current?.click()} disabled={uploadingAudio}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                    bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 disabled:opacity-50">
                    {uploadingAudio ? 'Upload…' : '🎙️ Uploader un fichier audio'}
                  </button>
                  <button type="button" onClick={handleGenerateAudio} disabled={generating || !wordForm.mot}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                    bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30 disabled:opacity-50">
                    {generating ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Génération…</>
                    ) : <><SpeakerWaveIcon className="w-4 h-4" />Générer via IA (TTS)</>}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSaveWord} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editEntry ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PHRASE ── */}
      {showModal === 'phrase' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editEntry ? 'Modifier la phrase' : `Ajouter une phrase — ${selectedLang.toUpperCase()}`}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phrase *</label>
                <textarea className="input resize-none" rows={2} value={phraseForm.phrase}
                  onChange={e => setPhraseForm(f => ({...f, phrase: e.target.value}))}
                  placeholder="Ex: Akwaba n'ko !" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction *</label>
                <textarea className="input resize-none" rows={2} value={phraseForm.traduction}
                  onChange={e => setPhraseForm(f => ({...f, traduction: e.target.value}))}
                  placeholder="Ex: Soyez les bienvenus !" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phonétique</label>
                  <input className="input" value={phraseForm.transcription}
                    onChange={e => setPhraseForm(f => ({...f, transcription: e.target.value}))}
                    placeholder="Prononciation phonétique" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <CategorySelect value={phraseForm.categorie}
                    onChange={v => setPhraseForm(f => ({...f, categorie: v}))}
                    options={CATEGORIES} storageKey="dictionary-phrase" className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contexte d'utilisation</label>
                <input className="input" value={phraseForm.contexte}
                  onChange={e => setPhraseForm(f => ({...f, contexte: e.target.value}))}
                  placeholder="Ex: Pour accueillir des invités" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSavePhrase} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editEntry ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
