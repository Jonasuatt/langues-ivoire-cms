import { useEffect, useState, useRef, useCallback } from 'react';
import { audioContribAPI, languagesAPI } from '../services/api';
import CategorySelect from '../components/CategorySelect';
import {
  CheckIcon, XMarkIcon, TrashIcon, PlayIcon, StopIcon,
  InformationCircleIcon, ArrowUpTrayIcon, PlusIcon, MusicalNoteIcon,
  PencilSquareIcon, StarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_LABELS = { all: 'Toutes', pending: 'En attente', validated: 'Validées' };
const CATEGORIES = ['salutations', 'famille', 'nourriture', 'marché', 'couleurs', 'chiffres', 'corps', 'animaux', 'nature', 'culture'];

export default function AudioContributionsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLang, setFilterLang] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  // --- Modal modification ---
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ mot: '', traduction: '', transcription: '', categorie: '', estVoixOfficielle: false, genreVoix: '' });
  const [editSaving, setEditSaving] = useState(false);

  const openEditModal = (item) => {
    setEditTarget(item);
    setEditForm({
      mot: item.mot || '',
      traduction: item.traduction || '',
      transcription: item.transcription || '',
      categorie: item.categorie || '',
      estVoixOfficielle: item.estVoixOfficielle || false,
      genreVoix: item.genreVoix || '',
    });
  };

  const handleEditSave = async () => {
    if (!editForm.mot.trim()) { toast.error('Le mot ou la phrase ne peut pas être vide'); return; }
    setEditSaving(true);
    try {
      await audioContribAPI.update(editTarget.id, editForm);
      toast.success('✅ Enregistrement modifié');
      setEditTarget(null);
      load();
    } catch { toast.error('Erreur lors de la modification'); }
    finally { setEditSaving(false); }
  };

  // --- Modal ajout unique ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ languageId: '', mot: '', traduction: '', transcription: '', categorie: '', type: 'mot', estVoixOfficielle: false, genreVoix: '', file: null });
  const [addSaving, setAddSaving] = useState(false);

  // --- Modal retrait de validation ---
  const [unvalidateTarget, setUnvalidateTarget] = useState(null); // item à retirer
  const [unvalidateReason, setUnvalidateReason] = useState('');   // raison sélectionnée
  const [unvalidateCustom, setUnvalidateCustom] = useState('');   // texte libre si "Autre raison"
  const [unvalidateSaving, setUnvalidateSaving] = useState(false);

  const UNVALIDATE_REASONS = [
    'Prononciation incorrecte',
    'Bruit de fond / qualité insuffisante',
    'Traduction erronée',
    'Contenu inapproprié',
    'Doublon avec un autre enregistrement',
    'Autre raison',
  ];

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
      load(); loadStats();
    } catch { toast.error('Erreur lors du retrait'); }
    finally { setUnvalidateSaving(false); }
  };

  // --- Import en masse ---
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLang, setBulkLang] = useState('');
  const [bulkCategorie, setBulkCategorie] = useState('');
  const [bulkType, setBulkType] = useState('mot');
  // bulkFiles = [{ file: File, text: string }]
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkDragOver, setBulkDragOver] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const bulkInputRef = useRef(null);

  const loadStats = () => audioContribAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});

  const load = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (filterStatus === 'pending') params.validated = 'false';
    if (filterStatus === 'validated') params.validated = 'true';
    if (filterLang) params.langue = filterLang;
    audioContribAPI.getAll(params)
      .then(({ data }) => setItems(data.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) {
        setAddForm(f => ({ ...f, languageId: data[0].id }));
        setBulkLang(data[0].id);
      }
    }).catch(() => {});
    loadStats();
  }, []);

  useEffect(() => { load(); }, [filterStatus, filterLang]);

  const handleValidate = async (item, isValid) => {
    try {
      await audioContribAPI.validate(item.id, { isValidated: isValid, qualityScore: isValid ? 4 : 0 });
      toast.success(isValid ? '✅ Contribution validée !' : 'Contribution invalidée');
      load(); loadStats();
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer l'enregistrement de "${item.mot}" ?`)) return;
    try {
      await audioContribAPI.delete(item.id);
      toast.success('Supprimé');
      load(); loadStats();
    } catch { toast.error('Erreur'); }
  };

  const playAudio = (item) => {
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(item.audioUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(item.id);
  };

  // ── Ajout unique ──
  const handleAddSubmit = async () => {
    if (!addForm.mot || !addForm.languageId || !addForm.file) {
      toast.error('Mot, langue et fichier audio sont requis');
      return;
    }
    setAddSaving(true);
    try {
      const fd = new FormData();
      fd.append('audio', addForm.file);
      fd.append('languageId', addForm.languageId);
      fd.append('mot', addForm.mot);
      fd.append('traduction', addForm.traduction);
      fd.append('transcription', addForm.transcription);
      fd.append('categorie', addForm.categorie);
      const saved = await audioContribAPI.create(fd);
      // Si voix officielle, mettre à jour les champs après création
      if (addForm.estVoixOfficielle) {
        await audioContribAPI.update(saved.data.id, {
          estVoixOfficielle: true,
          genreVoix: addForm.genreVoix,
        });
      }
      toast.success(`✅ "${addForm.mot}" importé et validé automatiquement !`);
      setShowAddModal(false);
      setAddForm(f => ({ ...f, mot: '', traduction: '', transcription: '', file: null, estVoixOfficielle: false, genreVoix: '' }));
      load(); loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'import');
    } finally { setAddSaving(false); }
  };

  // ── Import en masse ──
  const addBulkFiles = (newFiles) => {
    const audioFiles = newFiles.filter(f =>
      f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i)
    );
    setBulkFiles(prev => {
      const names = new Set(prev.map(e => e.file.name));
      const toAdd = audioFiles
        .filter(f => !names.has(f.name))
        .map(f => ({
          file: f,
          // texte par défaut = nom du fichier sans extension + tirets en espaces
          text: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').trim(),
        }));
      return [...prev, ...toAdd];
    });
  };

  const handleBulkDrop = useCallback((e) => {
    e.preventDefault();
    setBulkDragOver(false);
    addBulkFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleBulkUpload = async () => {
    if (!bulkLang || bulkFiles.length === 0) {
      toast.error('Sélectionnez une langue et au moins un fichier');
      return;
    }
    // Vérifier que tous les textes sont remplis
    const empty = bulkFiles.filter(e => !e.text.trim());
    if (empty.length > 0) {
      toast.error(`${empty.length} fichier(s) sans texte — remplissez le mot/phrase pour chacun`);
      return;
    }
    setBulkUploading(true);
    setBulkResult(null);
    try {
      const fd = new FormData();
      fd.append('languageId', bulkLang);
      if (bulkCategorie) fd.append('categorie', bulkCategorie);
      // Envoyer les textes personnalisés dans un champ JSON
      fd.append('texts', JSON.stringify(bulkFiles.map(e => e.text)));
      bulkFiles.forEach(e => fd.append('audios', e.file));
      const { data } = await audioContribAPI.bulkImport(fd);
      setBulkResult(data);
      toast.success(data.message);
      load(); loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'import');
    } finally { setBulkUploading(false); }
  };

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎙️ Contributions Audio — IA Linguistique</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enregistrements vocaux qui enrichissent l'IA
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import en masse
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Ajouter un audio
          </button>
        </div>
      </div>

      {/* Aide */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-900">
          <p className="font-semibold mb-1">🤖 Alimenter l'IA Linguistique</p>
          <p>
            Importez des enregistrements audio pour <strong>accélérer l'apprentissage de l'IA</strong>.
            Vos imports sont <strong>automatiquement validés</strong> (confiance admin).
            Les utilisateurs peuvent aussi contribuer via l'app mobile → <em>Pratiquer avec l'IA</em>.
            Plus il y a d'enregistrements, plus l'IA reconnaît les prononciations avec précision.
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-primary-500">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total enregistrements</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-green-600">{stats.validated}</p>
            <p className="text-sm text-gray-500 mt-1">✅ Validés pour l'IA</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">⏳ En attente de validation</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button key={key}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setFilterStatus(key)}
          >{label}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <select className="input max-w-[180px]" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
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
                    {item.language && <span className="badge bg-primary-100 text-primary-700">{item.language.nom}</span>}
                    {item.categorie && <span className="badge bg-gray-100 text-gray-600">{item.categorie}</span>}
                    {item.isValidated
                      ? <span className="badge bg-green-100 text-green-700">✓ Validé · IA active</span>
                      : <span className="badge bg-orange-100 text-orange-700">⏳ En attente</span>
                    }
                    {item.estVoixOfficielle && (
                      <span className={`badge flex items-center gap-1 ${item.genreVoix === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                        <StarIcon className="w-3 h-3" />
                        Voix officielle {item.genreVoix === 'F' ? '♀' : item.genreVoix === 'M' ? '♂' : ''}
                      </span>
                    )}
                  </div>
                  {item.traduction && <p className="text-sm text-gray-500">{item.traduction}</p>}
                  {item.transcription && <p className="text-xs text-indigo-500 font-mono">[{item.transcription}]</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Par {item.user?.prenom} {item.user?.nom}</span>
                    {item.duree && <span>• {(item.duree / 1000).toFixed(1)}s</span>}
                    <span>• Utilisé {item.timesPlayed}x par l'IA</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors" title="Modifier">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  {!item.isValidated && (
                    <button onClick={() => handleValidate(item, true)}
                      className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition-colors" title="Valider pour l'IA">
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  )}
                  {item.isValidated && (
                    <button onClick={() => openUnvalidateModal(item)}
                      className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors" title="Retirer de l'IA">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(item)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-5xl mb-4">🎙️</p>
              <p className="text-gray-500 font-medium text-lg">Aucun enregistrement pour l'instant</p>
              <p className="text-sm mt-2 text-gray-400 max-w-sm mx-auto">
                Commencez par importer vos propres enregistrements pour alimenter l'IA rapidement.
              </p>
              <div className="flex gap-3 justify-center mt-5">
                <button onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                  <ArrowUpTrayIcon className="w-4 h-4" /> Import en masse
                </button>
                <button onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" /> Ajouter un audio
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL MODIFICATION ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier l'enregistrement</h2>
                <p className="text-xs text-gray-400 mt-0.5">Langue : {editTarget.language?.nom} • Fichier audio inchangé</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Mot / Phrase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot ou phrase *</label>
                <textarea className="input h-20 resize-none font-medium" value={editForm.mot}
                  onChange={e => setEditForm(f => ({ ...f, mot: e.target.value }))}
                  placeholder="Écrivez exactement ce qui est prononcé dans l'enregistrement" />
              </div>

              {/* Traduction + Transcription */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                  <input className="input" value={editForm.traduction}
                    onChange={e => setEditForm(f => ({ ...f, traduction: e.target.value }))}
                    placeholder="ex: Bienvenue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                  <input className="input font-mono text-sm" value={editForm.transcription}
                    onChange={e => setEditForm(f => ({ ...f, transcription: e.target.value }))}
                    placeholder="ex: [a.kwa.ba]" />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <CategorySelect
                  value={editForm.categorie}
                  onChange={v => setEditForm(f => ({ ...f, categorie: v }))}
                  options={CATEGORIES}
                  storageKey="audio"
                  className="input"
                />
              </div>

              {/* Voix officielle */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="estVoixOfficielle"
                    checked={editForm.estVoixOfficielle}
                    onChange={e => setEditForm(f => ({ ...f, estVoixOfficielle: e.target.checked }))}
                    className="mt-0.5 accent-indigo-600 w-4 h-4" />
                  <div className="flex-1">
                    <label htmlFor="estVoixOfficielle" className="text-sm font-semibold text-indigo-900 cursor-pointer flex items-center gap-2">
                      <StarIcon className="w-4 h-4 text-indigo-500" />
                      Voix officielle de référence
                    </label>
                    <p className="text-xs text-indigo-700 mt-1">
                      Cochez si cet enregistrement a été réalisé par un locuteur professionnel engagé pour cette langue.
                      L'IA donnera la priorité à ces voix pour l'apprentissage.
                    </p>
                  </div>
                </div>

                {editForm.estVoixOfficielle && (
                  <div className="mt-3 ml-7">
                    <label className="block text-xs font-medium text-indigo-800 mb-2">Genre du locuteur</label>
                    <div className="flex gap-2">
                      {[['F', '♀ Voix féminine', 'bg-pink-100 text-pink-700 border-pink-300'],
                        ['M', '♂ Voix masculine', 'bg-blue-100 text-blue-700 border-blue-300']].map(([val, label, cls]) => (
                        <button key={val}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                            editForm.genreVoix === val ? cls + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-white text-gray-600 border-gray-200'
                          }`}
                          onClick={() => setEditForm(f => ({ ...f, genreVoix: val }))}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="btn-primary flex-1 justify-center disabled:opacity-50">
                {editSaving ? 'Enregistrement…' : '💾 Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL RETRAIT DE VALIDATION ── */}
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
                  L'enregistrement <strong>"{unvalidateTarget.mot}"</strong> ({unvalidateTarget.language?.nom}) ne sera plus utilisé par l'IA linguistique.
                  Il restera dans la liste en statut <em>En attente</em> et pourra être revalidé plus tard.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du retrait <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {UNVALIDATE_REASONS.map(reason => (
                  <label key={reason}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      unvalidateReason === reason
                        ? 'border-orange-400 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}>
                    <input type="radio" name="reason" value={reason}
                      checked={unvalidateReason === reason}
                      onChange={() => setUnvalidateReason(reason)}
                      className="accent-orange-500" />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
              {unvalidateReason === 'Autre raison' && (
                <textarea
                  className="input h-20 resize-none mt-2"
                  placeholder="Précisez le motif…"
                  value={unvalidateCustom}
                  onChange={e => setUnvalidateCustom(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setUnvalidateTarget(null)} className="btn-secondary flex-1">
                Annuler
              </button>
              <button onClick={confirmUnvalidate} disabled={unvalidateSaving}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                {unvalidateSaving ? 'Retrait en cours…' : '⏸ Retirer de l\'IA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL AJOUT UNIQUE ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Ajouter un enregistrement</h2>
            <p className="text-sm text-gray-400 mb-4">Votre import sera automatiquement validé pour l'IA.</p>

            {/* Toggle Mot / Phrase */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
              {[['mot', '📝 Mot'], ['phrase', '💬 Phrase']].map(([val, label]) => (
                <button key={val}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    addForm.type === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setAddForm(f => ({ ...f, type: val }))}>
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={addForm.languageId} onChange={e => setAddForm(f => ({ ...f, languageId: e.target.value }))}>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <CategorySelect
                    value={addForm.categorie}
                    onChange={v => setAddForm(f => ({ ...f, categorie: v }))}
                    options={CATEGORIES}
                    storageKey="audio"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {addForm.type === 'phrase' ? 'Phrase complète *' : 'Mot *'}
                </label>
                {addForm.type === 'phrase' ? (
                  <textarea className="input h-20 resize-none" value={addForm.mot}
                    onChange={e => setAddForm(f => ({ ...f, mot: e.target.value }))}
                    placeholder="ex: Comment vas-tu aujourd'hui ? / Akwaba na ɔsɛ ?" />
                ) : (
                  <input className="input" value={addForm.mot}
                    onChange={e => setAddForm(f => ({ ...f, mot: e.target.value }))}
                    placeholder="ex: Akwaba, Bonjour, Merci…" />
                )}
                {addForm.type === 'phrase' && (
                  <p className="text-xs text-gray-400 mt-1">Écrivez la phrase exactement comme elle est prononcée dans l'enregistrement.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traduction française {addForm.type === 'phrase' && <span className="text-gray-400">(recommandée)</span>}
                </label>
                <input className="input" value={addForm.traduction}
                  onChange={e => setAddForm(f => ({ ...f, traduction: e.target.value }))}
                  placeholder={addForm.type === 'phrase' ? "ex: Comment vas-tu aujourd'hui ?" : "ex: Bienvenue"} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fichier audio *</label>
                <label className={`flex flex-col items-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${addForm.file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'}`}>
                  <MusicalNoteIcon className={`w-8 h-8 ${addForm.file ? 'text-green-500' : 'text-gray-400'}`} />
                  {addForm.file
                    ? <span className="text-sm font-medium text-green-700">✓ {addForm.file.name}</span>
                    : <span className="text-sm text-gray-500 text-center">Cliquez pour choisir un fichier audio<br /><span className="text-xs text-gray-400">MP3, WAV, OGG, M4A — max 10 Mo</span></span>
                  }
                  <input type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,.aac,audio/*" className="hidden"
                    onChange={e => { if (e.target.files[0]) setAddForm(f => ({ ...f, file: e.target.files[0] })); }} />
                </label>
              </div>
            </div>

            {/* Voix officielle */}
            <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="addVoixOfficielle"
                  checked={addForm.estVoixOfficielle}
                  onChange={e => setAddForm(f => ({ ...f, estVoixOfficielle: e.target.checked }))}
                  className="mt-0.5 accent-indigo-600 w-4 h-4" />
                <div className="flex-1">
                  <label htmlFor="addVoixOfficielle" className="text-sm font-semibold text-indigo-900 cursor-pointer flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-indigo-500" />
                    Voix officielle de référence
                  </label>
                  <p className="text-xs text-indigo-700 mt-1">
                    Cochez si cet enregistrement est réalisé par un locuteur professionnel engagé pour cette langue.
                  </p>
                </div>
              </div>
              {addForm.estVoixOfficielle && (
                <div className="mt-3 ml-7 flex gap-2">
                  {[['F', '♀ Voix féminine'], ['M', '♂ Voix masculine']].map(([val, label]) => (
                    <button key={val}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        addForm.genreVoix === val
                          ? (val === 'F' ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-blue-100 text-blue-700 border-blue-300') + ' ring-2 ring-offset-1 ring-indigo-400'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                      onClick={() => setAddForm(f => ({ ...f, genreVoix: val }))}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleAddSubmit} disabled={addSaving} className="btn-primary flex-1 justify-center">
                {addSaving ? 'Import en cours…' : '✅ Importer et valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL IMPORT EN MASSE ── */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Import en masse</h2>
            <p className="text-sm text-gray-400 mb-5">
              Importez plusieurs fichiers audio d'un coup. Le texte est extrait automatiquement du nom de fichier —
              vous pouvez <span className="font-medium text-gray-600">modifier chaque ligne</span> pour saisir un mot ou une phrase complète.
              Tous les imports sont auto-validés pour l'IA.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                <select className="input" value={bulkLang} onChange={e => setBulkLang(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie (optionnel)</label>
                <CategorySelect
                  value={bulkCategorie}
                  onChange={setBulkCategorie}
                  options={CATEGORIES}
                  storageKey="audio"
                  className="input"
                />
              </div>
            </div>

            {/* Zone drag & drop */}
            <div
              onDragOver={e => { e.preventDefault(); setBulkDragOver(true); }}
              onDragLeave={() => setBulkDragOver(false)}
              onDrop={handleBulkDrop}
              onClick={() => bulkInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${
                bulkDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}>
              <ArrowUpTrayIcon className="w-10 h-10 text-indigo-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Glissez vos fichiers ici ou cliquez pour choisir</p>
                <p className="text-xs text-gray-400 mt-1">MP3, WAV, OGG, M4A — jusqu'à 50 fichiers</p>
              </div>
              <input ref={bulkInputRef} type="file" multiple accept=".mp3,.wav,.ogg,.m4a,.webm,.aac,audio/*" className="hidden"
                onChange={e => {
                  addBulkFiles(Array.from(e.target.files));
                  e.target.value = '';
                }} />
            </div>

            {/* Liste des fichiers sélectionnés — tableau éditable */}
            {bulkFiles.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    {bulkFiles.length} fichier(s) — <span className="text-gray-400 font-normal">corrigez le texte si besoin</span>
                  </p>
                  <button onClick={() => { setBulkFiles([]); setBulkResult(null); }}
                    className="text-xs text-red-500 hover:underline">Tout effacer</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {bulkFiles.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <MusicalNoteIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-xs text-gray-400 truncate max-w-[120px] flex-shrink-0" title={entry.file.name}>
                        {entry.file.name}
                      </span>
                      <span className="text-gray-300 flex-shrink-0">→</span>
                      <input
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white min-w-0"
                        value={entry.text}
                        onChange={e => setBulkFiles(prev => prev.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
                        placeholder="Mot ou phrase prononcé…"
                      />
                      <button onClick={() => setBulkFiles(prev => prev.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultat */}
            {bulkResult && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-800 mb-2">✅ {bulkResult.message}</p>
                {bulkResult.errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-600 mb-1">Erreurs ({bulkResult.errors.length}) :</p>
                    {bulkResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-red-500">{e.file} : {e.error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setShowBulkModal(false); setBulkFiles([]); setBulkResult(null); }}
                className="btn-secondary flex-1">Fermer</button>
              <button onClick={handleBulkUpload} disabled={bulkUploading || bulkFiles.length === 0}
                className="btn-primary flex-1 justify-center disabled:opacity-50">
                {bulkUploading
                  ? `Import en cours… (${bulkFiles.length} fichiers)`
                  : `🚀 Importer ${bulkFiles.length} fichier(s)`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
