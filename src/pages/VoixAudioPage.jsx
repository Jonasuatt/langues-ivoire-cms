import { useEffect, useState, useRef, useCallback } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI, uploadAPI } from '../services/api';
import LanguageSelect from '../components/LanguageSelect';
import FileUploadField from '../components/FileUploadField';
import {
  SpeakerWaveIcon, SpeakerXMarkIcon, MicrophoneIcon,
  CheckCircleIcon, XCircleIcon, StarIcon, PlusIcon,
  PencilSquareIcon, TrashIcon, MagnifyingGlassIcon,
  MusicalNoteIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ─── Sources définitions ───────────────────────────────────────────────────────
const SOURCES = [
  {
    key: 'contributions',
    label: 'Contributions',
    emoji: '🎙️',
    colorCls: 'text-orange-600 bg-orange-50 border-orange-200',
    activeCls: 'bg-orange-500 text-white border-orange-500',
    canAdd: true,
    canDelete: true,
    canValidate: true,
    canOfficial: true,
    canGenre: true,
    getItems: (params) => api.get('/audio-contributions', { params }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.mot || '—',
      soustitre: item.traduction || '',
      audioUrl: item.audioUrl,
      audioUrlFr: null,
      langue: item.language,
      genreVoix: item.genreVoix,
      isValidated: item.isValidated,
      estVoixOfficielle: item.estVoixOfficielle,
      contributor: item.user ? `${item.user.prenom || ''} ${item.user.nom || ''}`.trim() : null,
      _source: 'contributions',
    }),
    updateItem: (id, data) => api.patch(`/audio-contributions/${id}`, data),
    deleteItem: (id) => api.delete(`/audio-contributions/${id}`),
    validateItem: (id, val) => api.patch(`/audio-contributions/${id}/validate`, { isValidated: val }),
  },
  {
    key: 'dictionnaire',
    label: 'Dictionnaire',
    emoji: '📖',
    colorCls: 'text-blue-600 bg-blue-50 border-blue-200',
    activeCls: 'bg-blue-600 text-white border-blue-600',
    canAdd: false,
    canDelete: false,
    canValidate: false,
    canOfficial: false,
    canGenre: false,
    getItems: (params) => api.get('/dictionary/search', { params: { ...params, hasAudio: true } }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.mot || '—',
      soustitre: item.traduction_fr || item.traduction || '',
      audioUrl: item.audioUrl,
      audioUrlFr: null,
      langue: item.language,
      _source: 'dictionnaire',
    }),
    updateItem: (id, data) => api.patch(`/dictionary/${id}`, data),
  },
  {
    key: 'cultural',
    label: 'Culturel',
    emoji: '🏛️',
    colorCls: 'text-purple-600 bg-purple-50 border-purple-200',
    activeCls: 'bg-purple-600 text-white border-purple-600',
    canAdd: false,
    canDelete: false,
    canValidate: false,
    canOfficial: false,
    canGenre: false,
    getItems: (params) => api.get('/cultural', { params: { ...params, hasAudio: true } }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.contenu ? item.contenu.substring(0, 70) + (item.contenu.length > 70 ? '…' : '') : '—',
      soustitre: item.traduction ? item.traduction.substring(0, 60) + (item.traduction.length > 60 ? '…' : '') : '',
      audioUrl: item.audioUrl,
      audioUrlFr: item.audioUrlFr,
      langue: item.language,
      badge: item.type,
      _source: 'cultural',
    }),
    updateItem: (id, data) => api.patch(`/cultural/${id}`, data),
  },
  {
    key: 'phrases',
    label: 'Phrases',
    emoji: '💬',
    colorCls: 'text-teal-600 bg-teal-50 border-teal-200',
    activeCls: 'bg-teal-600 text-white border-teal-600',
    canAdd: false,
    canDelete: false,
    canValidate: false,
    canOfficial: false,
    canGenre: false,
    getItems: (params) => api.get('/admin/phrases', { params: { ...params, hasAudio: true } }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.texte || item.phrase || item.contenu || '—',
      soustitre: item.traduction || '',
      audioUrl: item.audioUrl,
      audioUrlFr: null,
      langue: item.language || (item.langue ? { nom: item.langue } : null),
      badge: item.categorie,
      _source: 'phrases',
    }),
    updateItem: (id, data) => api.patch(`/admin/phrases/${id}`, data),
  },
  {
    key: 'premiers-secours',
    label: 'Premiers Secours',
    emoji: '🏥',
    colorCls: 'text-red-600 bg-red-50 border-red-200',
    activeCls: 'bg-red-600 text-white border-red-600',
    canAdd: false,
    canDelete: false,
    canValidate: false,
    canOfficial: false,
    canGenre: false,
    getItems: (params) => api.get('/premiers-secours', { params: { ...params, hasAudio: true } }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.situation || item.titre || item.texte || '—',
      soustitre: item.traduction || item.description || '',
      audioUrl: item.audioUrl,
      audioUrlFr: null,
      langue: item.language,
      badge: item.categorie,
      _source: 'premiers-secours',
    }),
    updateItem: (id, data) => api.patch(`/premiers-secours/${id}`, data),
  },
  {
    key: 'civisme',
    label: 'Civisme',
    emoji: '🌍',
    colorCls: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    activeCls: 'bg-indigo-600 text-white border-indigo-600',
    canAdd: false,
    canDelete: false,
    canValidate: false,
    canOfficial: false,
    canGenre: false,
    getItems: (params) => api.get('/civisme', { params: { ...params, hasAudio: true } }),
    getNorm: (item) => ({
      id: item.id,
      titre: item.titre || item.texte || item.contenu || '—',
      soustitre: (item.description || item.traduction || '').substring(0, 60),
      audioUrl: item.audioUrl,
      audioUrlFr: null,
      langue: item.language,
      badge: item.categorie,
      _source: 'civisme',
    }),
    updateItem: (id, data) => api.patch(`/civisme/${id}`, data),
  },
];

// ─── AudioPlayer ───────────────────────────────────────────────────────────────
function AudioPlayer({ src, label }) {
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
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} title={playing ? 'Arrêter' : `Écouter${label ? ' — ' + label : ''}`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          playing
            ? 'text-primary-600 bg-primary-50 border-primary-200 animate-pulse'
            : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }`}>
        {playing ? <SpeakerXMarkIcon className="w-3.5 h-3.5" /> : <SpeakerWaveIcon className="w-3.5 h-3.5" />}
        {label || (playing ? 'Stop' : 'Écouter')}
      </button>
    </div>
  );
}

// ─── ModalShell ────────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children, maxW = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxW} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 text-lg leading-none">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Modal Ajouter (Contribution seulement) ────────────────────────────────────
function ModalAjouter({ languages, onClose, onCreated }) {
  const [form, setForm] = useState({ langue: '', mot: '', traduction: '', genreVoix: '', audioUrl: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.langue) { toast.error('Sélectionnez une langue'); return; }
    if (!form.mot.trim()) { toast.error('Le mot ou la phrase est requis'); return; }
    if (!form.audioUrl) { toast.error('Veuillez importer un fichier audio'); return; }
    setSaving(true);
    try {
      await api.post('/audio-contributions', {
        langue: form.langue,
        mot: form.mot.trim(),
        traduction: form.traduction.trim() || undefined,
        genreVoix: form.genreVoix || undefined,
        audioUrl: form.audioUrl,
      });
      toast.success('Audio ajouté avec succès !');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="🎙️ Ajouter un audio" onClose={onClose}>
      <div className="space-y-5">
        {/* Langue */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Langue *</label>
          <LanguageSelect
            languages={languages}
            value={form.langue || ''}
            onChange={v => set('langue', v)}
            valueKey="code"
            allLabel="— Sélectionner une langue —"
            showAll={false}
            className="w-full"
          />
        </div>

        {/* Mot / Phrase */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot ou phrase *</label>
          <input className="input w-full" value={form.mot}
            onChange={e => set('mot', e.target.value)}
            placeholder="Ex : Akwaba, Bonjour en dioula…" />
        </div>

        {/* Traduction */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Traduction en français</label>
          <input className="input w-full" value={form.traduction}
            onChange={e => set('traduction', e.target.value)}
            placeholder="Ex : Bienvenue" />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Genre de la voix</label>
          <div className="flex gap-3">
            {[{ v: 'M', l: '♂ Masculin', active: 'bg-blue-600 text-white border-blue-600' },
              { v: 'F', l: '♀ Féminin', active: 'bg-pink-500 text-white border-pink-500' }].map(g => (
              <button key={g.v} type="button"
                onClick={() => set('genreVoix', form.genreVoix === g.v ? '' : g.v)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  form.genreVoix === g.v ? g.active : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                {g.l}
              </button>
            ))}
          </div>
          {!form.genreVoix && <p className="text-xs text-gray-400 mt-1">Optionnel — peut être renseigné plus tard</p>}
        </div>

        {/* Upload audio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fichier audio * <span className="font-normal text-gray-400">(MP3, WAV, M4A — max 20 MB)</span></label>
          <FileUploadField
            type="audio"
            label="🎵 Importer ou glisser un fichier audio"
            value={form.audioUrl}
            onChange={url => set('audioUrl', url)}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button className="btn-secondary flex-1" onClick={onClose}>Annuler</button>
          <button className="btn-primary flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Ajout en cours…' : '+ Ajouter'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Modal Modifier ────────────────────────────────────────────────────────────
function ModalModifier({ item, source, onClose, onUpdated }) {
  const isContrib = source.key === 'contributions';
  const isCulture = source.key === 'cultural';

  const [audioUrl, setAudioUrl] = useState(item.audioUrl || '');
  const [audioUrlFr, setAudioUrlFr] = useState(item.audioUrlFr || '');
  const [mot, setMot] = useState(item.titre || '');
  const [traduction, setTraduction] = useState(item.soustitre || '');
  const [genreVoix, setGenreVoix] = useState(item.genreVoix || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let payload = {};
      if (isContrib) {
        payload = { mot: mot.trim(), traduction: traduction.trim() || undefined, genreVoix: genreVoix || undefined, audioUrl };
      } else if (isCulture) {
        payload = { audioUrl, audioUrlFr };
      } else {
        payload = { audioUrl };
      }
      await source.updateItem(item.id, payload);
      toast.success('Audio mis à jour !');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`✏️ Modifier — ${item.titre.substring(0, 40)}${item.titre.length > 40 ? '…' : ''}`} onClose={onClose}>
      <div className="space-y-5">

        {/* Source badge */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <span className="text-xl">{source.emoji}</span>
          <div>
            <p className="text-xs text-gray-500 font-medium">Source</p>
            <p className="text-sm font-semibold text-gray-800">{source.label}</p>
          </div>
          {item.langue && (
            <span className="ml-auto badge bg-orange-50 text-orange-700">{item.langue.nom || item.langue}</span>
          )}
        </div>

        {/* Champs spécifiques Contributions */}
        {isContrib && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot ou phrase</label>
              <input className="input w-full" value={mot} onChange={e => setMot(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Traduction</label>
              <input className="input w-full" value={traduction} onChange={e => setTraduction(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Genre de la voix</label>
              <div className="flex gap-3">
                {[{ v: 'M', l: '♂ Masculin', active: 'bg-blue-600 text-white border-blue-600' },
                  { v: 'F', l: '♀ Féminin', active: 'bg-pink-500 text-white border-pink-500' }].map(g => (
                  <button key={g.v} type="button"
                    onClick={() => setGenreVoix(prev => prev === g.v ? '' : g.v)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      genreVoix === g.v ? g.active : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>
                    {g.l}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Audio local / principal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {isCulture ? '🌍 Audio langue locale' : '🎵 Fichier audio'}
            <span className="text-xs font-normal text-gray-400 ml-1">(MP3, WAV, M4A — max 20 MB)</span>
          </label>
          <FileUploadField
            type="audio"
            label="Remplacer ou conserver l'audio"
            value={audioUrl}
            onChange={setAudioUrl}
          />
        </div>

        {/* Audio FR (culturel seulement) */}
        {isCulture && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              🇫🇷 Audio narration française
              <span className="text-xs font-normal text-gray-400 ml-1">(MP3, WAV, M4A — max 20 MB)</span>
            </label>
            <FileUploadField
              type="audio"
              label="Narration en français"
              value={audioUrlFr}
              onChange={setAudioUrlFr}
            />
          </div>
        )}

        {/* Aperçu audio actuel */}
        {(item.audioUrl || item.audioUrlFr) && (
          <div className="p-3 bg-gray-50 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audio actuel</p>
            {item.audioUrl && <AudioPlayer src={item.audioUrl} label={isCulture ? '🌍 Langue locale' : '🎵 Écouter'} />}
            {item.audioUrlFr && <AudioPlayer src={item.audioUrlFr} label="🇫🇷 Narration française" />}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button className="btn-secondary flex-1" onClick={onClose}>Annuler</button>
          <button className="btn-primary flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Modal Supprimer ───────────────────────────────────────────────────────────
function ModalSupprimer({ item, source, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await source.deleteItem(item.id);
      toast.success('Audio supprimé');
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  return (
    <ModalShell title="Confirmer la suppression" onClose={onClose} maxW="max-w-sm">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Supprimer cet audio ?</p>
          <p className="text-sm text-gray-500 mt-1">« {item.titre} »</p>
          <p className="text-xs text-red-500 mt-2">Cette action est irréversible.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Annuler</button>
          <button
            className="flex-1 py-2 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Carte Audio ───────────────────────────────────────────────────────────────
function AudioCard({ item, source, onEdit, onDelete, onUpdateLocal }) {
  const handleGenre = async (genre) => {
    const newGenre = item.genreVoix === genre ? '' : genre;
    try {
      await source.updateItem(item.id, { genreVoix: newGenre || null });
      onUpdateLocal({ ...item, genreVoix: newGenre });
      toast.success('Genre mis à jour');
    } catch { toast.error('Erreur'); }
  };

  const handleOfficial = async () => {
    try {
      const val = !item.estVoixOfficielle;
      await source.updateItem(item.id, { estVoixOfficielle: val });
      onUpdateLocal({ ...item, estVoixOfficielle: val });
      toast.success(val ? 'Voix officielle activée' : 'Retirée des voix officielles');
    } catch { toast.error('Erreur'); }
  };

  const handleValidate = async () => {
    try {
      const val = !item.isValidated;
      await source.validateItem(item.id, val);
      onUpdateLocal({ ...item, isValidated: val });
      toast.success(val ? 'Contribution validée' : 'Validation retirée');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className={`card hover:shadow-md transition-all ${item.estVoixOfficielle ? 'ring-1 ring-yellow-300' : ''}`}>
      <div className="flex flex-col gap-3">
        {/* En-tête */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{item.titre}</span>
              {item.langue && (
                <span className="badge bg-orange-50 text-orange-600 shrink-0">{item.langue.nom}</span>
              )}
              {item.badge && (
                <span className="badge bg-gray-100 text-gray-600 shrink-0 text-xs">{item.badge}</span>
              )}
              {item.estVoixOfficielle && (
                <span className="badge bg-yellow-50 text-yellow-600 shrink-0">⭐ Officielle</span>
              )}
            </div>
            {item.soustitre && (
              <p className="text-xs text-gray-400 italic mt-0.5 truncate">{item.soustitre}</p>
            )}
            {item.contributor && (
              <p className="text-xs text-gray-400 mt-0.5">👤 {item.contributor}</p>
            )}
          </div>
          {/* Actions rapides */}
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Modifier">
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            {source.canDelete && (
              <button onClick={() => onDelete(item)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer">
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Players */}
        <div className="flex flex-wrap gap-2">
          {item.audioUrl
            ? <AudioPlayer src={item.audioUrl} label={item.audioUrlFr ? '🌍 Langue locale' : null} />
            : <span className="text-xs text-gray-400 italic flex items-center gap-1"><MusicalNoteIcon className="w-3.5 h-3.5" /> Pas d'audio</span>
          }
          {item.audioUrlFr && <AudioPlayer src={item.audioUrlFr} label="🇫🇷 Narration" />}
        </div>

        {/* Genre (contributions seulement) */}
        {source.canGenre && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Genre :</span>
            {[{ v: 'M', l: '♂ M', cls: 'bg-blue-600 text-white border-blue-600', inact: 'border-gray-200 text-gray-400 hover:bg-gray-50' },
              { v: 'F', l: '♀ F', cls: 'bg-pink-500 text-white border-pink-500', inact: 'border-gray-200 text-gray-400 hover:bg-gray-50' }].map(g => (
              <button key={g.v} type="button" onClick={() => handleGenre(g.v)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border-2 transition-colors ${
                  item.genreVoix === g.v ? g.cls : g.inact
                }`}>
                {g.l}
              </button>
            ))}
            {!item.genreVoix && (
              <span className="px-2 py-0.5 rounded-lg text-xs text-gray-400 bg-gray-100 border border-gray-200">
                Non taguée
              </span>
            )}
          </div>
        )}

        {/* Validation + Officielle (contributions) */}
        {(source.canValidate || source.canOfficial) && (
          <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
            {source.canOfficial && (
              <button onClick={handleOfficial}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                  item.estVoixOfficielle ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                }`}>
                {item.estVoixOfficielle ? <StarSolid className="w-3.5 h-3.5" /> : <StarIcon className="w-3.5 h-3.5" />}
                Voix officielle
              </button>
            )}
            {source.canValidate && (
              <button onClick={handleValidate}
                className={`flex items-center gap-1 text-xs font-medium ml-auto transition-colors ${
                  item.isValidated ? 'text-green-600 hover:text-red-500' : 'text-gray-400 hover:text-green-600'
                }`}>
                {item.isValidated
                  ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Validé</>
                  : <><XCircleIcon className="w-3.5 h-3.5" /> Valider</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function VoixAudioPage() {
  const [activeKey, setActiveKey] = useState('contributions');
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterValidated, setFilterValidated] = useState('');
  const [stats, setStats] = useState({ total: 0, validated: 0, official: 0, untagged: 0 });

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const LIMIT = 20;
  const source = SOURCES.find(s => s.key === activeKey);

  // ── Chargement des items ──
  const loadItems = useCallback(() => {
    let cancelled = false;
    const params = { page, limit: LIMIT };
    if (search.trim()) params.q = search.trim();
    if (filterLang) params.langue = filterLang;
    if (activeKey === 'contributions') {
      if (filterGenre) params.genreVoix = filterGenre;
      if (filterValidated !== '') params.validated = filterValidated;
    }

    setLoading(true);

    source.getItems(params)
      .then(({ data }) => {
        if (cancelled) return;
        const raw = Array.isArray(data) ? data : (data?.data || []);
        setItems(raw.map(source.getNorm));
        setTotal(data?.total ?? raw.length);
        setTotalPages(data?.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        const status = err.response?.status;
        // 400/404 = source ne supporte pas ce filtre ou endpoint absent → état vide silencieux
        if (status !== 400 && status !== 404) {
          toast.error('Erreur de chargement', { id: 'vaload' });
        }
        setItems([]);
        setTotal(0);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeKey, page, search, filterLang, filterGenre, filterValidated]);

  useEffect(() => {
    const cleanup = loadItems();
    return cleanup;
  }, [loadItems]);

  // ── Stats contributions ──
  const loadStats = useCallback(() => {
    if (activeKey !== 'contributions') return;
    api.get('/audio-contributions', { params: { limit: 1000 } })
      .then(({ data }) => {
        const all = data.data || [];
        setStats({
          total: data.total || all.length,
          validated: all.filter(i => i.isValidated).length,
          official: all.filter(i => i.estVoixOfficielle).length,
          untagged: all.filter(i => !i.genreVoix).length,
        });
      }).catch(() => {});
  }, [activeKey]);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  const resetFilters = () => {
    setPage(1);
    setSearch('');
    setFilterLang('');
    setFilterGenre('');
    setFilterValidated('');
  };

  const switchSource = (key) => {
    setActiveKey(key);
    resetFilters();
    setItems([]);
    setTotal(0);
    setTotalPages(1);
  };

  const updateLocal = (updated) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MusicalNoteIcon className="w-7 h-7 text-orange-500" />
            Bibliothèque Audio
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion centralisée de tous les fichiers audio de la plateforme Langues Ivoire
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowGuide(s => !s)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
            📘 Guide d'importation
          </button>
          {source.canAdd && (
            <button className="btn-primary flex items-center gap-2" onClick={() => setShowAdd(true)}>
              <PlusIcon className="w-5 h-5" />
              Ajouter un audio
            </button>
          )}
        </div>
      </div>

      {/* ── Panneau tutoriel import en masse ── */}
      {showGuide && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-bold text-blue-900 flex items-center gap-2">
              📘 Guide d'importation des audios en masse
            </h2>
            <button onClick={() => setShowGuide(false)} className="text-blue-400 hover:text-blue-600 text-xs underline">Fermer</button>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-blue-800 mb-1">📁 Convention de nommage des fichiers</p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 font-mono text-xs text-gray-700 space-y-1">
                  <p className="text-gray-500 mb-2">[code_langue]_[mot]_[genre]_[numéro].mp3</p>
                  <p>✅ dioula_an_se_sama_M_001.mp3</p>
                  <p>✅ baoule_akwaba_F_001.mp3</p>
                  <p>✅ yacouba_dan_M_001.mp3</p>
                  <p>✅ senoufo_poro_F_001.mp3</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-1">🏷️ Codes langues</p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 text-xs grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                  {[['dioula','Dioula'],['baoule','Baoulé'],['bete','Bété'],['senoufo','Sénoufo'],['agni','Agni'],['gouro','Gouro'],['guere','Guéré'],['nouchi','Nouchi'],['yacouba','Yacouba']].map(([code,nom]) => (
                    <span key={code}><span className="font-mono text-blue-700">{code}</span> → {nom}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-blue-800 mb-1">🎙️ Spécifications d'enregistrement</p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 text-xs text-gray-700 space-y-1.5">
                  <p>📏 Format : <strong>MP3</strong> ou WAV, M4A</p>
                  <p>⚖️ Taille max : <strong>20 MB</strong> par fichier</p>
                  <p>🎵 Qualité recommandée : <strong>128 kbps minimum</strong></p>
                  <p>⏱️ Durée : <strong>1 à 5 secondes</strong> par mot/phrase</p>
                  <p>🔇 Silence : <strong>0.2s</strong> avant et après le mot</p>
                  <p>🏠 Environnement : <strong>pièce calme</strong>, pas d'écho</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-1">👥 Genre locuteur</p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 text-xs text-gray-700 space-y-1">
                  <p>👨 <strong>M</strong> = Locuteur masculin (Tuteur langue)</p>
                  <p>👩 <strong>F</strong> = Locutrice féminine (Tuteure langue)</p>
                  <p className="text-gray-400 mt-1">Le genre est automatiquement détecté depuis le nom de fichier</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-1">📋 Étapes d'importation</p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 text-xs text-gray-700 space-y-1.5">
                  <p>1️⃣ Nommer les fichiers selon la convention ci-dessus</p>
                  <p>2️⃣ Sélectionner le module cible (Contributions, Dictionnaire…)</p>
                  <p>3️⃣ Importer via le bouton "+ Ajouter un audio"</p>
                  <p>4️⃣ L'URL générée est copiable vers n'importe quel module</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats (contributions) ── */}
      {activeKey === 'contributions' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50' },
            { label: '✅ Validées', value: stats.validated, color: 'text-green-700', bg: 'bg-green-50' },
            { label: '⭐ Officielles', value: stats.official, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: '🏷️ Sans genre', value: stats.untagged, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Onglets Sources ── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {SOURCES.map(s => (
          <button
            key={s.key}
            onClick={() => switchSource(s.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 shrink-0 transition-all ${
              activeKey === s.key ? s.activeCls : `${s.colorCls} hover:opacity-80`
            }`}>
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Filtres & Recherche ── */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input w-full pl-9"
            placeholder="Rechercher un mot, une phrase…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <LanguageSelect languages={languages} value={filterLang} onChange={v => { setFilterLang(v); setPage(1); }} valueKey="code" className="w-48" />
        {activeKey === 'contributions' && (
          <>
            <select value={filterGenre} onChange={e => { setFilterGenre(e.target.value); setPage(1); }} className="input w-auto">
              <option value="">Tous les genres</option>
              <option value="M">♂ Masculin</option>
              <option value="F">♀ Féminin</option>
            </select>
            <select value={filterValidated} onChange={e => { setFilterValidated(e.target.value); setPage(1); }} className="input w-auto">
              <option value="">Tous les statuts</option>
              <option value="true">✅ Validées</option>
              <option value="false">⏳ En attente</option>
            </select>
          </>
        )}
        <span className="self-center text-sm text-gray-500 ml-auto shrink-0">
          {total} enregistrement{total > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-20">
          <MusicalNoteIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucun audio trouvé</p>
          <p className="text-sm text-gray-300 mt-1">
            {search || filterLang || filterGenre || filterValidated
              ? 'Essayez de modifier vos filtres'
              : `Aucun audio enregistré dans "${source.label}" pour l'instant`}
          </p>
          {source.canAdd && (
            <button className="btn-primary mt-4 mx-auto" onClick={() => setShowAdd(true)}>
              <PlusIcon className="w-4 h-4 inline mr-1" />
              Ajouter le premier audio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <AudioCard
              key={item.id}
              item={item}
              source={source}
              onEdit={setEditItem}
              onDelete={setDeleteItem}
              onUpdateLocal={updateLocal}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page} sur {totalPages}</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ← Précédent
            </button>
            {/* Pages numérotées (5 max) */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const n = start + i;
              return n <= totalPages ? (
                <button key={n}
                  onClick={() => setPage(n)}
                  className={`text-sm py-1.5 px-3 rounded-lg border font-medium transition-colors ${
                    n === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {n}
                </button>
              ) : null;
            })}
            <button className="btn-secondary text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Suivant →
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <ModalAjouter
          languages={languages}
          onClose={() => setShowAdd(false)}
          onCreated={() => { loadItems(); loadStats(); }}
        />
      )}
      {editItem && (
        <ModalModifier
          item={editItem}
          source={source}
          onClose={() => setEditItem(null)}
          onUpdated={() => { loadItems(); loadStats(); setEditItem(null); }}
        />
      )}
      {deleteItem && source.canDelete && (
        <ModalSupprimer
          item={deleteItem}
          source={source}
          onClose={() => setDeleteItem(null)}
          onDeleted={() => { loadItems(); loadStats(); setDeleteItem(null); }}
        />
      )}
      <PageHelp pageId="import-audio" />
    </div>
  );
}
