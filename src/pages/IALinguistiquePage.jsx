import { useEffect, useState, useRef, useCallback } from 'react';
import PageHelp from '../components/PageHelp';
import api, { audioContribAPI, languagesAPI, phrasesAdminAPI, premierSecoursAPI, civismeAPI, uploadAPI } from '../services/api';
import LanguageSelect from '../components/LanguageSelect';
import CategorySelect from '../components/CategorySelect';
import {
  CheckIcon, XMarkIcon, TrashIcon, PlayIcon, StopIcon,
  InformationCircleIcon, ArrowUpTrayIcon, PlusIcon, MusicalNoteIcon,
  PencilSquareIcon, StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── ONGLETS MODULES ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'audio',   emoji: '🎙️', label: 'Audio IA',       route: null,              desc: 'Enregistrements vocaux pour l\'IA' },
  { id: 'dict',    emoji: '📚', label: 'Dictionnaire',     route: '/dictionary',     desc: 'Mots et phrases de la langue' },
  { id: 'phrases', emoji: '💬', label: 'Phrases Utiles',   route: '/phrases-utiles', desc: 'Expressions du quotidien' },
  { id: 'secours', emoji: '🚨', label: 'Premiers Secours', route: '/premiers-secours', desc: 'Consignes d\'urgence' },
  { id: 'civisme', emoji: '🏛️', label: 'Civisme',          route: '/civisme',        desc: 'Valeurs et symboles civiques' },
  { id: 'sens',    emoji: '📖', label: 'Sens des Mots',    route: '/sens-mots',      desc: 'Vraies significations des mots' },
];

// ─── CATÉGORIES ───────────────────────────────────────────────────────────────
const AUDIO_CATS   = ['salutations','famille','nourriture','marché','couleurs','chiffres','corps','animaux','nature','culture'];
const DICT_CATS    = ['salutations','famille','nourriture','nature','habitat','transport','vie_quotidienne','expressions','verbes','spiritualite','vie_sociale','chiffres','couleurs'];
const PHRASES_CATS = ['salutations','expressions','nourriture','vie_quotidienne','vie_sociale','corps','lieux','autre'];
const SITUATIONS   = ['appel_secours','arret_cardiaque','etouffement','mise_en_securite','noyade','brulure','fracture','saignement','malaise','evaluation'];
const CIVISME_TYPES = ['proverbe_civique','symbole_etat','sensibilisation','droit_devoir','institution'];
const AUDIO_STATUS_LABELS = { all: 'Toutes', pending: 'En attente', validated: 'Validées' };
const UNVALIDATE_REASONS  = ['Prononciation incorrecte','Bruit de fond / qualité insuffisante','Traduction erronée','Contenu inapproprié','Doublon','Autre raison'];

// ─── FORMULAIRES VIDES ────────────────────────────────────────────────────────
const EMPTY = {
  audio:   { languageId: '', mot: '', traduction: '', transcription: '', categorie: '', type: 'mot', estVoixOfficielle: false, genreVoix: '', file: null },
  dict:    { langueCode: '', languageId: '', mot: '', traduction: '', transcription: '', categorie: '', file: null },
  phrases: { languageId: '', phrase: '', traduction: '', transcription: '', categorie: 'salutations', contexte: '', file: null, fileFr: null },
  secours: { languageId: '', consigne: '', traduction: '', transcription: '', situation: 'appel_secours', priorite: 2, file: null, fileFr: null },
  civisme: { languageId: '', type: 'proverbe_civique', titre: '', contenu: '', traduction: '', explication: '', valeur: '', file: null, fileFr: null },
  sens:    { languageId: '', motSource: '', transcription: '', sensHistoriqueFr: '', sensVeritable: '', contexteErreur: '', file: null },
};

// ─── COMPOSANTS PARTAGÉS ──────────────────────────────────────────────────────
function InlinePlayer({ src }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); ref.current.currentTime = 0; setPlaying(false); }
    else { ref.current.play().catch(() => {}); setPlaying(true); }
  };
  return (
    <>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle}
        className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${playing ? 'text-red-500 bg-red-50 animate-pulse' : 'text-accent hover:bg-accent/10'}`}>
        {playing ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
    </>
  );
}

/**
 * Champ d'upload audio réutilisable.
 * enrichIA : true  → audio envoyé au corpus IA en plus du module (langue locale)
 *            false → audio uploadé uniquement pour le module (ex : audio français)
 */
function AudioUploadField({ file, onChange, label, sublabel, enrichIA = true }) {
  const borderColor  = enrichIA ? 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50' : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50';
  const iconColor    = enrichIA ? 'text-indigo-400' : 'text-blue-400';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label ?? 'Fichier audio'}
        {sublabel && <span className="text-gray-400 font-normal ml-1">{sublabel}</span>}
      </label>
      <label className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
        file ? 'border-green-400 bg-green-50' : borderColor}`}>
        <MusicalNoteIcon className={`w-5 h-5 flex-shrink-0 ${file ? 'text-green-500' : iconColor}`} />
        <span className={`text-sm ${file ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
          {file ? `✓ ${file.name}` : 'Cliquez pour choisir — MP3, WAV, M4A, OGG'}
        </span>
        <input type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,.aac,audio/*" className="hidden"
          onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); }} />
      </label>
      {file && enrichIA && (
        <p className="text-xs text-indigo-600 mt-1">
          🤖 Cet audio sera aussi envoyé au corpus d'entraînement de l'IA Linguistique.
        </p>
      )}
      {file && !enrichIA && (
        <p className="text-xs text-blue-600 mt-1">
          🇫🇷 Audio français — stocké dans le module, non envoyé au corpus IA local.
        </p>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function IALinguistiquePage() {
  const [languages, setLanguages]       = useState([]);
  const [activeTab, setActiveTab]       = useState('audio');
  const [showModal, setShowModal]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const globalAudioRef                  = useRef(null);

  // ── AUDIO IA — état ────────────────────────────────────────────────────────
  const [audioItems, setAudioItems]             = useState([]);
  const [audioStats, setAudioStats]             = useState(null);
  const [audioLoading, setAudioLoading]         = useState(true);
  const [audioFilterStatus, setAudioFilterStatus] = useState('all');
  const [audioFilterLang, setAudioFilterLang]   = useState('');
  const [playingId, setPlayingId]               = useState(null);

  const [editTarget, setEditTarget]             = useState(null);
  const [editForm, setEditForm]                 = useState({});
  const [editSaving, setEditSaving]             = useState(false);

  const [unvalidateTarget, setUnvalidateTarget] = useState(null);
  const [unvalidateReason, setUnvalidateReason] = useState('');
  const [unvalidateCustom, setUnvalidateCustom] = useState('');
  const [unvalidateSaving, setUnvalidateSaving] = useState(false);

  const [showBulkModal, setShowBulkModal]       = useState(false);
  const [bulkLang, setBulkLang]                 = useState('');
  const [bulkCategorie, setBulkCategorie]       = useState('');
  const [bulkFiles, setBulkFiles]               = useState([]);
  const [bulkDragOver, setBulkDragOver]         = useState(false);
  const [bulkUploading, setBulkUploading]       = useState(false);
  const [bulkResult, setBulkResult]             = useState(null);
  const bulkInputRef                            = useRef(null);

  // ── FORMULAIRES PAR MODULE ─────────────────────────────────────────────────
  const [formAudio,   setFormAudio]   = useState(EMPTY.audio);
  const [formDict,    setFormDict]    = useState(EMPTY.dict);
  const [formPhrases, setFormPhrases] = useState(EMPTY.phrases);
  const [formSecours, setFormSecours] = useState(EMPTY.secours);
  const [formCivisme, setFormCivisme] = useState(EMPTY.civisme);
  const [formSens,    setFormSens]    = useState(EMPTY.sens);

  // ── CHARGEMENT INITIAL ─────────────────────────────────────────────────────
  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => {
      setLanguages(data);
      if (!data.length) return;
      const langId   = data[0].id;
      const langCode = data[0].code;
      setFormAudio(f => ({ ...f, languageId: langId }));
      setFormDict(f => ({ ...f, languageId: langId, langueCode: langCode }));
      setFormPhrases(f => ({ ...f, languageId: langId }));
      setFormSecours(f => ({ ...f, languageId: langId }));
      setFormCivisme(f => ({ ...f, languageId: langId }));
      setFormSens(f => ({ ...f, languageId: langId }));
      setBulkLang(langId);
    }).catch(() => {});
    loadAudioStats();
  }, []);

  // ── AUDIO IA — chargement ──────────────────────────────────────────────────
  const loadAudioStats = () =>
    audioContribAPI.getStats().then(({ data }) => setAudioStats(data)).catch(() => {});

  const loadAudio = useCallback(() => {
    setAudioLoading(true);
    const params = { limit: 100 };
    if (audioFilterStatus === 'pending')   params.validated = 'false';
    if (audioFilterStatus === 'validated') params.validated = 'true';
    if (audioFilterLang) params.langue = audioFilterLang;
    audioContribAPI.getAll(params)
      .then(({ data }) => setAudioItems(data.data))
      .catch(() => toast.error('Erreur de chargement', { id: 'ia-load-err' }))
      .finally(() => setAudioLoading(false));
  }, [audioFilterStatus, audioFilterLang]);

  useEffect(() => { if (activeTab === 'audio') loadAudio(); }, [activeTab, loadAudio]);

  // ── AUDIO IA — actions ─────────────────────────────────────────────────────
  const playAudio = (item) => {
    if (playingId === item.id) { globalAudioRef.current?.pause(); setPlayingId(null); return; }
    globalAudioRef.current?.pause();
    const a = new Audio(item.audioUrl);
    a.onended = () => setPlayingId(null);
    a.play();
    globalAudioRef.current = a;
    setPlayingId(item.id);
  };

  const handleValidate = async (item, isValid) => {
    try {
      await audioContribAPI.validate(item.id, { isValidated: isValid, qualityScore: isValid ? 4 : 0 });
      toast.success(isValid ? '✅ Contribution validée !' : 'Contribution invalidée');
      loadAudio(); loadAudioStats();
    } catch { toast.error('Erreur'); }
  };

  const handleDeleteAudio = async (item) => {
    if (!confirm(`Supprimer l'enregistrement de "${item.mot}" ?`)) return;
    try {
      await audioContribAPI.delete(item.id);
      toast.success('Supprimé');
      loadAudio(); loadAudioStats();
    } catch { toast.error('Erreur'); }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    setEditForm({
      mot: item.mot || '', traduction: item.traduction || '',
      transcription: item.transcription || '', categorie: item.categorie || '',
      estVoixOfficielle: item.estVoixOfficielle || false, genreVoix: item.genreVoix || '',
    });
  };

  const handleEditSave = async () => {
    if (!editForm.mot.trim()) { toast.error('Le mot ne peut pas être vide'); return; }
    setEditSaving(true);
    try {
      await audioContribAPI.update(editTarget.id, editForm);
      toast.success('✅ Enregistrement modifié');
      setEditTarget(null);
      loadAudio();
    } catch { toast.error('Erreur lors de la modification'); }
    finally { setEditSaving(false); }
  };

  const openUnvalidateModal = (item) => {
    setUnvalidateTarget(item);
    setUnvalidateReason('');
    setUnvalidateCustom('');
  };

  const confirmUnvalidate = async () => {
    if (!unvalidateTarget) return;
    setUnvalidateSaving(true);
    try {
      await audioContribAPI.validate(unvalidateTarget.id, { isValidated: false, qualityScore: 0 });
      toast.success(`"${unvalidateTarget.mot}" retiré de l'IA`);
      setUnvalidateTarget(null);
      loadAudio(); loadAudioStats();
    } catch { toast.error('Erreur lors du retrait'); }
    finally { setUnvalidateSaving(false); }
  };

  // ── IMPORT EN MASSE ─────────────────────────────────────────────────────────
  const addBulkFiles = (newFiles) => {
    const audioFiles = newFiles.filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i));
    setBulkFiles(prev => {
      const names = new Set(prev.map(e => e.file.name));
      return [
        ...prev,
        ...audioFiles
          .filter(f => !names.has(f.name))
          .map(f => ({ file: f, text: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim() })),
      ];
    });
  };

  const handleBulkDrop = useCallback((e) => {
    e.preventDefault();
    setBulkDragOver(false);
    addBulkFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleBulkUpload = async () => {
    if (!bulkLang || !bulkFiles.length) { toast.error('Sélectionnez une langue et au moins un fichier'); return; }
    if (bulkFiles.some(e => !e.text.trim())) { toast.error('Tous les fichiers doivent avoir un texte'); return; }
    setBulkUploading(true);
    setBulkResult(null);
    try {
      const fd = new FormData();
      fd.append('languageId', bulkLang);
      if (bulkCategorie) fd.append('categorie', bulkCategorie);
      fd.append('texts', JSON.stringify(bulkFiles.map(e => e.text)));
      bulkFiles.forEach(e => fd.append('audios', e.file));
      const { data } = await audioContribAPI.bulkImport(fd);
      setBulkResult(data);
      toast.success(data.message);
      loadAudio(); loadAudioStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'import');
    } finally { setBulkUploading(false); }
  };

  // ── UPLOAD AUDIO → corpus IA (helper partagé) ──────────────────────────────
  /**
   * Upload un fichier audio en langue locale :
   *   1. Intègre l'audio au corpus d'entraînement de l'IA (auto-validé)
   *   2. Retourne l'audioUrl pour le stocker dans l'entrée du module
   */
  const uploadAudioToIA = async (file, languageId, text) => {
    if (!file || !languageId) return null;
    const fd = new FormData();
    fd.append('audio', file);
    fd.append('languageId', languageId);
    fd.append('mot', text?.trim() || 'enregistrement');
    const { data } = await audioContribAPI.create(fd);
    return data.audioUrl || null;
  };

  /**
   * Upload un fichier audio FRANÇAIS (traduction lue en français).
   * Stocké via upload simple — NE va PAS dans le corpus IA local.
   * Retourne l'audioUrl, ou null si pas de fichier.
   */
  const uploadFrAudio = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('audio', file);
    const { data } = await uploadAPI.uploadAudio(fd);
    return data.url || data.audioUrl || null;
  };

  // ── OUVERTURE MODALE DE CRÉATION ───────────────────────────────────────────
  const openModal = () => {
    const lang0   = languages[0];
    const langId  = lang0?.id   || '';
    const langCode = lang0?.code || '';
    if (activeTab === 'audio')   setFormAudio({ ...EMPTY.audio, languageId: langId });
    if (activeTab === 'dict')    setFormDict({ ...EMPTY.dict, languageId: langId, langueCode: langCode });
    if (activeTab === 'phrases') setFormPhrases({ ...EMPTY.phrases, languageId: langId });
    if (activeTab === 'secours') setFormSecours({ ...EMPTY.secours, languageId: langId });
    if (activeTab === 'civisme') setFormCivisme({ ...EMPTY.civisme, languageId: langId });
    if (activeTab === 'sens')    setFormSens({ ...EMPTY.sens, languageId: langId });
    setShowModal(true);
  };

  // ── SOUMISSIONS PAR MODULE ─────────────────────────────────────────────────
  const handleAudioSubmit = async () => {
    if (!formAudio.mot || !formAudio.languageId || !formAudio.file) {
      toast.error('Langue, mot et fichier audio sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('audio', formAudio.file);
      fd.append('languageId', formAudio.languageId);
      fd.append('mot', formAudio.mot);
      fd.append('traduction', formAudio.traduction);
      fd.append('transcription', formAudio.transcription);
      fd.append('categorie', formAudio.categorie);
      const saved = await audioContribAPI.create(fd);
      if (formAudio.estVoixOfficielle) {
        await audioContribAPI.update(saved.data.id, { estVoixOfficielle: true, genreVoix: formAudio.genreVoix });
      }
      toast.success(`✅ "${formAudio.mot}" importé et validé !`);
      setShowModal(false);
      setFormAudio(f => ({ ...EMPTY.audio, languageId: f.languageId }));
      loadAudio(); loadAudioStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'import');
    } finally { setSaving(false); }
  };

  const handleDictSubmit = async () => {
    if (!formDict.mot.trim() || !formDict.langueCode) {
      toast.error('Langue et mot sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const audioUrl = formDict.file
        ? (await uploadAudioToIA(formDict.file, formDict.languageId, formDict.mot)) || ''
        : '';
      await api.post('/dictionary/admin/word', {
        langueCode: formDict.langueCode,
        mot: formDict.mot,
        traduction: formDict.traduction,
        transcription: formDict.transcription,
        categorie: formDict.categorie,
        audioUrl,
        status: 'PUBLISHED',
      });
      toast.success(`✅ "${formDict.mot}" ajouté au dictionnaire${audioUrl ? ' + audio intégré à l\'IA' : ''} !`);
      setShowModal(false);
      setFormDict(f => ({ ...EMPTY.dict, langueCode: f.langueCode, languageId: f.languageId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handlePhrasesSubmit = async () => {
    if (!formPhrases.phrase.trim() || !formPhrases.languageId) {
      toast.error('Langue et phrase sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const [audioUrl, audioUrlFr] = await Promise.all([
        formPhrases.file   ? uploadAudioToIA(formPhrases.file, formPhrases.languageId, formPhrases.phrase) : null,
        formPhrases.fileFr ? uploadFrAudio(formPhrases.fileFr) : null,
      ]);
      await phrasesAdminAPI.create({
        languageId:   formPhrases.languageId,
        phrase:       formPhrases.phrase,
        traduction:   formPhrases.traduction,
        transcription: formPhrases.transcription,
        categorie:    formPhrases.categorie,
        contexte:     formPhrases.contexte,
        audioUrl:     audioUrl   || '',
        audioUrlFr:   audioUrlFr || '',
        status: 'PUBLISHED',
      });
      const msg = [audioUrl && 'audio local → IA', audioUrlFr && 'audio FR → module'].filter(Boolean).join(', ');
      toast.success(`✅ Phrase ajoutée${msg ? ` (${msg})` : ''} !`);
      setShowModal(false);
      setFormPhrases(f => ({ ...EMPTY.phrases, languageId: f.languageId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleSecoursSubmit = async () => {
    if (!formSecours.consigne.trim() || !formSecours.languageId) {
      toast.error('Langue et consigne sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const [audioUrl, audioUrlFr] = await Promise.all([
        formSecours.file   ? uploadAudioToIA(formSecours.file, formSecours.languageId, formSecours.consigne) : null,
        formSecours.fileFr ? uploadFrAudio(formSecours.fileFr) : null,
      ]);
      await premierSecoursAPI.create({
        languageId:   formSecours.languageId,
        consigne:     formSecours.consigne,
        traduction:   formSecours.traduction,
        transcription: formSecours.transcription,
        situation:    formSecours.situation,
        priorite:     Number(formSecours.priorite),
        audioUrl:     audioUrl   || '',
        audioUrlFr:   audioUrlFr || '',
        isActive: true,
      });
      const msg = [audioUrl && 'audio local → IA', audioUrlFr && 'audio FR → module'].filter(Boolean).join(', ');
      toast.success(`✅ Consigne ajoutée${msg ? ` (${msg})` : ''} !`);
      setShowModal(false);
      setFormSecours(f => ({ ...EMPTY.secours, languageId: f.languageId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleCivismeSubmit = async () => {
    if (!formCivisme.contenu.trim() || !formCivisme.languageId) {
      toast.error('Langue et contenu sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const [audioUrl, audioUrlFr] = await Promise.all([
        formCivisme.file   ? uploadAudioToIA(formCivisme.file, formCivisme.languageId, formCivisme.contenu) : null,
        formCivisme.fileFr ? uploadFrAudio(formCivisme.fileFr) : null,
      ]);
      await civismeAPI.create({
        languageId:  formCivisme.languageId,
        type:        formCivisme.type,
        titre:       formCivisme.titre,
        contenu:     formCivisme.contenu,
        traduction:  formCivisme.traduction,
        explication: formCivisme.explication,
        valeur:      formCivisme.valeur,
        audioUrl:    audioUrl   || '',
        audioUrlFr:  audioUrlFr || '',
        isActive: true,
      });
      const msg = [audioUrl && 'audio local → IA', audioUrlFr && 'audio FR → module'].filter(Boolean).join(', ');
      toast.success(`✅ Contenu civique ajouté${msg ? ` (${msg})` : ''} !`);
      setShowModal(false);
      setFormCivisme(f => ({ ...EMPTY.civisme, languageId: f.languageId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleSensSubmit = async () => {
    if (!formSens.motSource.trim() || !formSens.languageId) {
      toast.error('Langue et mot source sont obligatoires'); return;
    }
    setSaving(true);
    try {
      const audioUrl = formSens.file
        ? (await uploadAudioToIA(formSens.file, formSens.languageId, formSens.motSource)) || ''
        : '';
      await api.post('/sens-mots', {
        languageId: formSens.languageId,
        motSource: formSens.motSource,
        transcription: formSens.transcription,
        sensHistoriqueFr: formSens.sensHistoriqueFr,
        sensVeritable: formSens.sensVeritable,
        contexteErreur: formSens.contexteErreur,
        audioUrl,
        status: 'PUBLISHED',
      });
      toast.success(`✅ "${formSens.motSource}" ajouté${audioUrl ? ' + audio intégré à l\'IA' : ''} !`);
      setShowModal(false);
      setFormSens(f => ({ ...EMPTY.sens, languageId: f.languageId }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleSubmit = () => {
    const handlers = { audio: handleAudioSubmit, dict: handleDictSubmit, phrases: handlePhrasesSubmit, secours: handleSecoursSubmit, civisme: handleCivismeSubmit, sens: handleSensSubmit };
    handlers[activeTab]?.();
  };

  // ── LABELS BOUTON AJOUTER ──────────────────────────────────────────────────
  const addLabel = { audio: 'Ajouter un audio', dict: 'Ajouter un mot', phrases: 'Ajouter une phrase', secours: 'Ajouter une consigne', civisme: 'Ajouter un contenu', sens: 'Ajouter un sens' };
  const currentTab = TABS.find(t => t.id === activeTab);

  // ── RENDU ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* ENTÊTE */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎙️ IA Linguistique — Hub de contenu</h1>
          <p className="text-gray-500 text-sm mt-1">
            Créez du contenu pour tous les modules. Chaque audio enrichit automatiquement le corpus de l'IA.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'audio' && (
            <button onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              <ArrowUpTrayIcon className="w-4 h-4" /> Import en masse
            </button>
          )}
          <button onClick={openModal} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            {addLabel[activeTab]}
          </button>
        </div>
      </div>

      {/* BANNIÈRE INFO */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-900">
          <p className="font-semibold mb-2">🤖 Hub central de création linguistique</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/60 rounded-lg p-2">
              <p className="font-semibold mb-1">📥 Où vont les données ?</p>
              <p>Chaque onglet envoie les données <strong>directement dans le module cible</strong> (Dictionnaire, Phrases, etc.) et les rend visibles sur l'app mobile immédiatement.</p>
            </div>
            <div className="bg-white/60 rounded-lg p-2">
              <p className="font-semibold mb-1">🎙️ Audio en langue locale</p>
              <p>Enrichit le corpus IA pour l'entraînement <strong>ET</strong> est joué sur l'app mobile.</p>
              <p className="mt-1">🇫🇷 Audio français : lu sur l'app uniquement, ne va pas dans le corpus IA.</p>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTIQUES AUDIO IA */}
      {audioStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-primary-500">{audioStats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total enregistrements</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-green-600">{audioStats.validated}</p>
            <p className="text-sm text-gray-500 mt-1">✅ Validés pour l'IA</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-orange-500">{audioStats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">⏳ En attente</p>
          </div>
        </div>
      )}

      {/* ONGLETS MODULES */}
      <div className="flex gap-1 mb-6 flex-wrap bg-gray-100 rounded-2xl p-1.5">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
            }`}
            title={tab.desc}>
            <span>{tab.emoji}</span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ ONGLET AUDIO IA ═══════════════════════════════════════════════════ */}
      {activeTab === 'audio' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.entries(AUDIO_STATUS_LABELS).map(([key, label]) => (
              <button key={key}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  audioFilterStatus === key ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setAudioFilterStatus(key)}>{label}</button>
            ))}
          </div>
          <div className="mb-6">
            <LanguageSelect languages={languages} value={audioFilterLang} onChange={setAudioFilterLang} valueKey="code" className="w-48" />
          </div>

          {audioLoading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {audioItems.map(item => (
                <div key={item.id} className={`card ${item.isValidated ? 'border-l-4 border-green-400' : 'border-l-4 border-orange-300'}`}>
                  <div className="flex items-center gap-4">
                    <button onClick={() => playAudio(item)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        playingId === item.id ? 'bg-red-500 text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
                      }`}>
                      {playingId === item.id ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-bold text-gray-900 text-lg">{item.mot}</p>
                        {item.language  && <span className="badge bg-primary-100 text-primary-700">{item.language.nom}</span>}
                        {item.categorie && <span className="badge bg-gray-100 text-gray-600">{item.categorie}</span>}
                        {item.isValidated
                          ? <span className="badge bg-green-100 text-green-700">✓ Validé · IA active</span>
                          : <span className="badge bg-orange-100 text-orange-700">⏳ En attente</span>}
                        {item.estVoixOfficielle && (
                          <span className={`badge flex items-center gap-1 ${item.genreVoix === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                            <StarIcon className="w-3 h-3" />
                            Voix officielle {item.genreVoix === 'F' ? '♀' : item.genreVoix === 'M' ? '♂' : ''}
                          </span>
                        )}
                      </div>
                      {item.traduction   && <p className="text-sm text-gray-500">{item.traduction}</p>}
                      {item.transcription && <p className="text-xs text-indigo-500 font-mono">[{item.transcription}]</p>}
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>Par {item.user?.prenom} {item.user?.nom}</span>
                        {item.duree && <span>• {(item.duree / 1000).toFixed(1)}s</span>}
                        <span>• Utilisé {item.timesPlayed}x</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEditModal(item)} className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50" title="Modifier">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      {!item.isValidated && (
                        <button onClick={() => handleValidate(item, true)} className="p-2 rounded-lg text-green-500 hover:bg-green-50" title="Valider pour l'IA">
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      )}
                      {item.isValidated && (
                        <button onClick={() => openUnvalidateModal(item)} className="p-2 rounded-lg text-orange-500 hover:bg-orange-50" title="Retirer de l'IA">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteAudio(item)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="Supprimer">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!audioItems.length && (
                <div className="card text-center py-12">
                  <p className="text-5xl mb-4">🎙️</p>
                  <p className="text-gray-500 font-medium text-lg">Aucun enregistrement pour l'instant</p>
                  <p className="text-sm text-gray-400 mt-2 max-w-sm mx-auto">
                    Commencez par importer vos propres enregistrements pour alimenter l'IA rapidement.
                  </p>
                  <div className="flex gap-3 justify-center mt-5">
                    <button onClick={() => setShowBulkModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                      <ArrowUpTrayIcon className="w-4 h-4" /> Import en masse
                    </button>
                    <button onClick={openModal} className="btn-primary flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" /> Ajouter un audio
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ ONGLETS MODULES (landing + bouton créer) ══════════════════════════ */}
      {activeTab !== 'audio' && (
        <div className="card">
          <div className="text-center py-14 px-8">
            <p className="text-6xl mb-4">{currentTab?.emoji}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentTab?.label}</h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">{currentTab?.desc}. Un fichier audio optionnel enrichit simultanément le corpus de l'IA Linguistique et est lu dans l'app mobile.</p>
            <button onClick={openModal} className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
              <PlusIcon className="w-5 h-5" />
              {addLabel[activeTab]}
            </button>
            {currentTab?.route && (
              <p className="text-xs text-gray-400 mt-5">
                Pour modifier des entrées existantes →{' '}
                <a href={currentTab.route} className="text-primary-500 hover:underline font-medium">
                  Module {currentTab.label}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ MODALES ════════════════════════════════════════════ */}

      {/* MODALE MODIFICATION AUDIO */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier l'enregistrement</h2>
                <p className="text-xs text-gray-400 mt-0.5">Langue : {editTarget.language?.nom} · Fichier audio inchangé</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot ou phrase *</label>
                <textarea className="input h-20 resize-none font-medium" value={editForm.mot}
                  onChange={e => setEditForm(f => ({ ...f, mot: e.target.value }))}
                  placeholder="Écrivez exactement ce qui est prononcé" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                  <input className="input" value={editForm.traduction}
                    onChange={e => setEditForm(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Bienvenue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                  <input className="input font-mono text-sm" value={editForm.transcription}
                    onChange={e => setEditForm(f => ({ ...f, transcription: e.target.value }))} placeholder="[a.kwa.ba]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <CategorySelect value={editForm.categorie} onChange={v => setEditForm(f => ({ ...f, categorie: v }))} options={AUDIO_CATS} storageKey="audio-edit" className="input" />
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="editVoixOff" checked={editForm.estVoixOfficielle}
                    onChange={e => setEditForm(f => ({ ...f, estVoixOfficielle: e.target.checked }))}
                    className="mt-0.5 accent-indigo-600 w-4 h-4" />
                  <div className="flex-1">
                    <label htmlFor="editVoixOff" className="text-sm font-semibold text-indigo-900 cursor-pointer flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-indigo-500" /> Voix officielle de référence
                    </label>
                    <p className="text-xs text-indigo-700 mt-1">Locuteur professionnel engagé pour cette langue.</p>
                  </div>
                </div>
                {editForm.estVoixOfficielle && (
                  <div className="mt-3 ml-7 flex gap-2">
                    {[['F','♀ Voix féminine','pink'],['M','♂ Voix masculine','blue']].map(([val,label,color]) => (
                      <button key={val}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          editForm.genreVoix === val
                            ? `bg-${color}-100 text-${color}-700 border-${color}-300 ring-2 ring-offset-1 ring-indigo-400`
                            : 'bg-white text-gray-600 border-gray-200'}`}
                        onClick={() => setEditForm(f => ({ ...f, genreVoix: val }))}>{label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleEditSave} disabled={editSaving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                {editSaving ? 'Enregistrement…' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RETRAIT DE VALIDATION */}
      {unvalidateTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <XMarkIcon className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Retirer de l'IA</h2>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>"{unvalidateTarget.mot}"</strong> ({unvalidateTarget.language?.nom}) ne sera plus utilisé par l'IA.
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motif <span className="text-gray-400 font-normal">(optionnel)</span></label>
              <div className="space-y-2">
                {UNVALIDATE_REASONS.map(reason => (
                  <label key={reason}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      unvalidateReason === reason ? 'border-orange-400 bg-orange-50 text-orange-800' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}>
                    <input type="radio" name="reason" value={reason}
                      checked={unvalidateReason === reason} onChange={() => setUnvalidateReason(reason)}
                      className="accent-orange-500" />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
              {unvalidateReason === 'Autre raison' && (
                <textarea className="input h-20 resize-none mt-2" placeholder="Précisez…"
                  value={unvalidateCustom} onChange={e => setUnvalidateCustom(e.target.value)} />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setUnvalidateTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={confirmUnvalidate} disabled={unvalidateSaving}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                {unvalidateSaving ? 'Retrait en cours…' : '⏸ Retirer de l\'IA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE IMPORT EN MASSE */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Import en masse</h2>
            <p className="text-sm text-gray-400 mb-5">Le texte est extrait du nom de fichier. Tous les imports sont auto-validés pour l'IA.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                <LanguageSelect languages={languages} value={bulkLang} onChange={setBulkLang} allLabel="-- Choisir --" showAll={false} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie (optionnel)</label>
                <CategorySelect value={bulkCategorie} onChange={setBulkCategorie} options={AUDIO_CATS} storageKey="bulk" className="input" />
              </div>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setBulkDragOver(true); }}
              onDragLeave={() => setBulkDragOver(false)}
              onDrop={handleBulkDrop}
              onClick={() => bulkInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${
                bulkDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50'}`}>
              <ArrowUpTrayIcon className="w-10 h-10 text-indigo-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Glissez vos fichiers ici ou cliquez</p>
                <p className="text-xs text-gray-400 mt-1">MP3, WAV, OGG, M4A — jusqu'à 50 fichiers</p>
              </div>
              <input ref={bulkInputRef} type="file" multiple accept=".mp3,.wav,.ogg,.m4a,.webm,.aac,audio/*" className="hidden"
                onChange={e => { addBulkFiles(Array.from(e.target.files)); e.target.value = ''; }} />
            </div>
            {bulkFiles.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">{bulkFiles.length} fichier(s) — <span className="text-gray-400 font-normal">corrigez le texte si besoin</span></p>
                  <button onClick={() => { setBulkFiles([]); setBulkResult(null); }} className="text-xs text-red-500 hover:underline">Tout effacer</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {bulkFiles.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <MusicalNoteIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-xs text-gray-400 truncate max-w-[100px] flex-shrink-0" title={entry.file.name}>{entry.file.name}</span>
                      <span className="text-gray-300 flex-shrink-0">→</span>
                      <input className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-0"
                        value={entry.text}
                        onChange={e => setBulkFiles(prev => prev.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                        placeholder="Mot ou phrase prononcé…" />
                      <button onClick={() => setBulkFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bulkResult && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">✅ {bulkResult.message}</p>
                {bulkResult.errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-600 mb-1">Erreurs ({bulkResult.errors.length}) :</p>
                    {bulkResult.errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e.file} : {e.error}</p>)}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowBulkModal(false); setBulkFiles([]); setBulkResult(null); }} className="btn-secondary flex-1">Fermer</button>
              <button onClick={handleBulkUpload} disabled={bulkUploading || !bulkFiles.length}
                className="btn-primary flex-1 justify-center disabled:opacity-50">
                {bulkUploading ? `Import en cours… (${bulkFiles.length} fichiers)` : `🚀 Importer ${bulkFiles.length} fichier(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CRÉATION (adaptative selon l'onglet actif) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{currentTab?.emoji} {addLabel[activeTab]}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Votre import sera automatiquement publié et indexé.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">

              {/* ── FORMULAIRE AUDIO IA ────────────────────────────────────── */}
              {activeTab === 'audio' && (
                <>
                  <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    {[['mot','📝 Mot'],['phrase','💬 Phrase']].map(([val,label]) => (
                      <button key={val}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formAudio.type === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setFormAudio(f => ({ ...f, type: val }))}>{label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                      <LanguageSelect languages={languages} value={formAudio.languageId} onChange={v => setFormAudio(f => ({ ...f, languageId: v }))} allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <CategorySelect value={formAudio.categorie} onChange={v => setFormAudio(f => ({ ...f, categorie: v }))} options={AUDIO_CATS} storageKey="audio" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{formAudio.type === 'phrase' ? 'Phrase complète *' : 'Mot *'}</label>
                    {formAudio.type === 'phrase'
                      ? <textarea className="input h-20 resize-none" value={formAudio.mot} onChange={e => setFormAudio(f => ({ ...f, mot: e.target.value }))} placeholder="ex: Akwaba na ɔsɛ ?" />
                      : <input className="input" value={formAudio.mot} onChange={e => setFormAudio(f => ({ ...f, mot: e.target.value }))} placeholder="ex: Akwaba" />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                    <input className="input" value={formAudio.traduction} onChange={e => setFormAudio(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Bienvenue" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fichier audio *</label>
                    <label className={`flex flex-col items-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${formAudio.file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'}`}>
                      <MusicalNoteIcon className={`w-8 h-8 ${formAudio.file ? 'text-green-500' : 'text-gray-400'}`} />
                      {formAudio.file ? <span className="text-sm font-medium text-green-700">✓ {formAudio.file.name}</span>
                        : <span className="text-sm text-gray-500 text-center">Cliquez pour choisir<br /><span className="text-xs text-gray-400">MP3, WAV, OGG, M4A</span></span>}
                      <input type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,.aac,audio/*" className="hidden"
                        onChange={e => { if (e.target.files[0]) setFormAudio(f => ({ ...f, file: e.target.files[0] })); }} />
                    </label>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="addVoixOff" checked={formAudio.estVoixOfficielle}
                        onChange={e => setFormAudio(f => ({ ...f, estVoixOfficielle: e.target.checked }))}
                        className="mt-0.5 accent-indigo-600 w-4 h-4" />
                      <div className="flex-1">
                        <label htmlFor="addVoixOff" className="text-sm font-semibold text-indigo-900 cursor-pointer flex items-center gap-2">
                          <StarIcon className="w-4 h-4 text-indigo-500" /> Voix officielle de référence
                        </label>
                        <p className="text-xs text-indigo-700 mt-1">Locuteur professionnel engagé pour cette langue.</p>
                      </div>
                    </div>
                    {formAudio.estVoixOfficielle && (
                      <div className="mt-3 ml-7 flex gap-2">
                        {[['F','♀ Voix féminine'],['M','♂ Voix masculine']].map(([val,label]) => (
                          <button key={val}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                              formAudio.genreVoix === val
                                ? (val==='F' ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-blue-100 text-blue-700 border-blue-300') + ' ring-2 ring-offset-1 ring-indigo-400'
                                : 'bg-white text-gray-600 border-gray-200'}`}
                            onClick={() => setFormAudio(f => ({ ...f, genreVoix: val }))}>{label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── FORMULAIRE DICTIONNAIRE ────────────────────────────────── */}
              {activeTab === 'dict' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                      <LanguageSelect languages={languages} value={formDict.langueCode} valueKey="code"
                        onChange={v => {
                          const lang = languages.find(l => l.code === v);
                          setFormDict(f => ({ ...f, langueCode: v, languageId: lang?.id || '' }));
                        }}
                        allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <CategorySelect value={formDict.categorie} onChange={v => setFormDict(f => ({ ...f, categorie: v }))} options={DICT_CATS} storageKey="dict" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot *</label>
                    <input className="input font-medium" value={formDict.mot}
                      onChange={e => setFormDict(f => ({ ...f, mot: e.target.value }))} placeholder="ex: Akwaba" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                      <input className="input" value={formDict.traduction}
                        onChange={e => setFormDict(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Bienvenue" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                      <input className="input font-mono text-sm" value={formDict.transcription}
                        onChange={e => setFormDict(f => ({ ...f, transcription: e.target.value }))} placeholder="[a.kwa.ba]" />
                    </div>
                  </div>
                  <AudioUploadField file={formDict.file} onChange={file => setFormDict(f => ({ ...f, file }))} />
                </>
              )}

              {/* ── FORMULAIRE PHRASES UTILES ──────────────────────────────── */}
              {activeTab === 'phrases' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                      <LanguageSelect languages={languages} value={formPhrases.languageId}
                        onChange={v => setFormPhrases(f => ({ ...f, languageId: v }))} allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <CategorySelect value={formPhrases.categorie} onChange={v => setFormPhrases(f => ({ ...f, categorie: v }))} options={PHRASES_CATS} storageKey="phrases" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phrase en langue locale *</label>
                    <textarea className="input h-20 resize-none" value={formPhrases.phrase}
                      onChange={e => setFormPhrases(f => ({ ...f, phrase: e.target.value }))} placeholder="ex: Aya foro, i wo ho te sɛn ?" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                      <input className="input" value={formPhrases.traduction}
                        onChange={e => setFormPhrases(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Bonjour, comment allez-vous ?" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                      <input className="input font-mono text-sm" value={formPhrases.transcription}
                        onChange={e => setFormPhrases(f => ({ ...f, transcription: e.target.value }))} placeholder="[a.ya fo.ro]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contexte d'usage</label>
                    <input className="input" value={formPhrases.contexte}
                      onChange={e => setFormPhrases(f => ({ ...f, contexte: e.target.value }))} placeholder="ex: Salutation matinale entre amis" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AudioUploadField
                      file={formPhrases.file}
                      onChange={file => setFormPhrases(f => ({ ...f, file }))}
                      label="🎙️ Audio en langue locale"
                      sublabel="(optionnel — enrichit l'IA)"
                      enrichIA={true}
                    />
                    <AudioUploadField
                      file={formPhrases.fileFr}
                      onChange={fileFr => setFormPhrases(f => ({ ...f, fileFr }))}
                      label="🇫🇷 Audio en français"
                      sublabel="(traduction lue en français)"
                      enrichIA={false}
                    />
                  </div>
                </>
              )}

              {/* ── FORMULAIRE PREMIERS SECOURS ───────────────────────────── */}
              {activeTab === 'secours' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                      <LanguageSelect languages={languages} value={formSecours.languageId}
                        onChange={v => setFormSecours(f => ({ ...f, languageId: v }))} allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                      <select className="input" value={formSecours.priorite} onChange={e => setFormSecours(f => ({ ...f, priorite: e.target.value }))}>
                        <option value={2}>🔴 Critique (vie en danger)</option>
                        <option value={1}>🟡 Important</option>
                        <option value={0}>ℹ️ Information</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Situation *</label>
                    <select className="input" value={formSecours.situation} onChange={e => setFormSecours(f => ({ ...f, situation: e.target.value }))}>
                      {SITUATIONS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consigne en langue locale *</label>
                    <textarea className="input h-20 resize-none" value={formSecours.consigne}
                      onChange={e => setFormSecours(f => ({ ...f, consigne: e.target.value }))} placeholder="ex: À foro a kɔ hospital" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                      <input className="input" value={formSecours.traduction}
                        onChange={e => setFormSecours(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Allez à l'hôpital" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                      <input className="input font-mono text-sm" value={formSecours.transcription}
                        onChange={e => setFormSecours(f => ({ ...f, transcription: e.target.value }))} placeholder="[a fo.ro]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AudioUploadField
                      file={formSecours.file}
                      onChange={file => setFormSecours(f => ({ ...f, file }))}
                      label="🎙️ Audio en langue locale"
                      sublabel="(optionnel — enrichit l'IA)"
                      enrichIA={true}
                    />
                    <AudioUploadField
                      file={formSecours.fileFr}
                      onChange={fileFr => setFormSecours(f => ({ ...f, fileFr }))}
                      label="🇫🇷 Audio en français"
                      sublabel="(traduction lue en français)"
                      enrichIA={false}
                    />
                  </div>
                </>
              )}

              {/* ── FORMULAIRE CIVISME ─────────────────────────────────────── */}
              {activeTab === 'civisme' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                      <LanguageSelect languages={languages} value={formCivisme.languageId}
                        onChange={v => setFormCivisme(f => ({ ...f, languageId: v }))} allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select className="input" value={formCivisme.type} onChange={e => setFormCivisme(f => ({ ...f, type: e.target.value }))}>
                        {CIVISME_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre (optionnel)</label>
                    <input className="input" value={formCivisme.titre}
                      onChange={e => setFormCivisme(f => ({ ...f, titre: e.target.value }))} placeholder="ex: Proverbe de la paix" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenu en langue locale *</label>
                    <textarea className="input h-20 resize-none" value={formCivisme.contenu}
                      onChange={e => setFormCivisme(f => ({ ...f, contenu: e.target.value }))} placeholder="ex: Bra bra tra man…" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                      <input className="input" value={formCivisme.traduction}
                        onChange={e => setFormCivisme(f => ({ ...f, traduction: e.target.value }))} placeholder="ex: Ensemble nous sommes forts" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valeur civique</label>
                      <input className="input" value={formCivisme.valeur}
                        onChange={e => setFormCivisme(f => ({ ...f, valeur: e.target.value }))} placeholder="ex: Solidarité, Paix…" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Explication (optionnel)</label>
                    <textarea className="input h-16 resize-none" value={formCivisme.explication}
                      onChange={e => setFormCivisme(f => ({ ...f, explication: e.target.value }))} placeholder="Contexte ou sens approfondi…" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AudioUploadField
                      file={formCivisme.file}
                      onChange={file => setFormCivisme(f => ({ ...f, file }))}
                      label="🎙️ Audio en langue locale"
                      sublabel="(optionnel — enrichit l'IA)"
                      enrichIA={true}
                    />
                    <AudioUploadField
                      file={formCivisme.fileFr}
                      onChange={fileFr => setFormCivisme(f => ({ ...f, fileFr }))}
                      label="🇫🇷 Audio en français"
                      sublabel="(traduction lue en français)"
                      enrichIA={false}
                    />
                  </div>
                </>
              )}

              {/* ── FORMULAIRE SENS DES MOTS ───────────────────────────────── */}
              {activeTab === 'sens' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                    <LanguageSelect languages={languages} value={formSens.languageId}
                      onChange={v => setFormSens(f => ({ ...f, languageId: v }))} allLabel="-- Sélectionner --" showAll={false} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mot source *</label>
                      <input className="input font-medium" value={formSens.motSource}
                        onChange={e => setFormSens(f => ({ ...f, motSource: e.target.value }))} placeholder="ex: Dioula" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                      <input className="input font-mono text-sm" value={formSens.transcription}
                        onChange={e => setFormSens(f => ({ ...f, transcription: e.target.value }))} placeholder="[dʒu.la]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sens historique (souvent erroné)</label>
                    <textarea className="input h-20 resize-none" value={formSens.sensHistoriqueFr}
                      onChange={e => setFormSens(f => ({ ...f, sensHistoriqueFr: e.target.value }))}
                      placeholder="ex: Ce mot est souvent utilisé pour désigner…" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sens véritable</label>
                    <textarea className="input h-20 resize-none" value={formSens.sensVeritable}
                      onChange={e => setFormSens(f => ({ ...f, sensVeritable: e.target.value }))}
                      placeholder="ex: Son sens originel est en fait…" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contexte d'erreur courante</label>
                    <input className="input" value={formSens.contexteErreur}
                      onChange={e => setFormSens(f => ({ ...f, contexteErreur: e.target.value }))}
                      placeholder="ex: Souvent confondu avec le terme…" />
                  </div>
                  <AudioUploadField file={formSens.file} onChange={file => setFormSens(f => ({ ...f, file }))} />
                </>
              )}

            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
                {saving ? 'Enregistrement…' : '✅ Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHelp pageId="ia-linguistique" />
    </div>
  );
}
