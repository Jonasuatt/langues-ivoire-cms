import { useState, useEffect, useRef } from 'react';
import { languagesAPI, uploadAPI } from '../services/api';
import {
  SpeakerWaveIcon, MusicalNoteIcon, ArrowUpTrayIcon,
  CheckCircleIcon, ExclamationCircleIcon, PlayCircleIcon,
  StopCircleIcon, TrashIcon, PencilSquareIcon,
  ArrowPathIcon, FunnelIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ─── Messages par défaut (fallback si aucun message en base) ──────────────────
const DEFAULT_MESSAGES = {
  baoule:  "Akwaba sou LANGUES IVOIRE. Mêrci d'avoir choisi le Baoulé. Nous allons ensemble approfondir ta connaissance.",
  dioula:  "I nana a sou LANGUES IVOIRE. I ni cɛ Dioula latigɛ la. An bɛna i dɔnni ɲɔgɔn fɛ.",
  bete:    "Bienvenu sur LANGUES IVOIRE. Je te remercie d'avoir choisi le Bété. Nous allons ensemble approfondir ta connaissance.",
  senoufo: "Bienvenu sur LANGUES IVOIRE. Je te remercie d'avoir choisi le Sénoufo. Nous allons ensemble approfondir ta connaissance.",
  agni:    "Akwaba sou LANGUES IVOIRE. Mêrci d'avoir choisi l'Agni. Nous allons ensemble approfondir ta connaissance.",
  gouro:   "Bienvenu sur LANGUES IVOIRE. Je te remercie d'avoir choisi le Gouro. Nous allons ensemble approfondir ta connaissance.",
  guere:   "Bienvenu sur LANGUES IVOIRE. Je te remercie d'avoir choisi le Guéré. Nous allons ensemble approfondir ta connaissance.",
  nouchi:  "Wôy ! Bienvenu sur LANGUES IVOIRE. Mêrci d'avoir choisi le Nouchi. On va s'éclater ensemble !",
};

// Fallback emojis (priorité à lang.emoji venu de l'API)
const FALLBACK_EMOJIS = {
  baoule: '🌿', dioula: '🌊', bete: '🌺', senoufo: '🦅',
  agni: '🌴', gouro: '🎋', guere: '🌄', nouchi: '🏙️',
};

function getLangEmoji(lang) {
  return lang.emoji || FALLBACK_EMOJIS[lang.code] || '🌍';
}

function getDefaultMessage(lang) {
  return DEFAULT_MESSAGES[lang.code] || `Bienvenu sur LANGUES IVOIRE. Merci d'avoir choisi le ${lang.nom}. Nous allons ensemble approfondir ta connaissance.`;
}

// ─── TTS ──────────────────────────────────────────────────────────────────────
function speakText(text, onEnd) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'fr-FR'; utter.pitch = 1.05; utter.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang.startsWith('fr'));
  if (frVoice) utter.voice = frVoice;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

// ─── Modal Confirmation Réinitialiser ─────────────────────────────────────────
function ModalReset({ lang, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ArrowPathIcon className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Réinitialiser {lang.nom} ?</p>
            <p className="text-sm text-gray-500 mt-1">
              Le son traditionnel et le message de bienvenue personnalisé seront supprimés.
              Le message par défaut sera rétabli.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={onClose}>
              Annuler
            </button>
            <button className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              onClick={onConfirm}>
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Carte Langue ──────────────────────────────────────────────────────────────
function LangCard({ lang, onSaved, onReset }) {
  const [form, setForm] = useState({
    welcomeMessage:      lang.welcomeMessage      || getDefaultMessage(lang),
    traditionalAudioUrl: lang.traditionalAudioUrl || '',
  });
  const [saving, setSaving]           = useState(false);
  const [resetting, setResetting]     = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [saved, setSaved]             = useState(false);
  const [error, setError]             = useState('');
  const [speaking, setSpeaking]       = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [expanded, setExpanded]       = useState(false);
  const [showReset, setShowReset]     = useState(false);
  const fileRef  = useRef(null);
  const audioRef = useRef(null);

  // Sync si lang change extérieurement (après reset global)
  useEffect(() => {
    setForm({
      welcomeMessage:      lang.welcomeMessage      || getDefaultMessage(lang),
      traditionalAudioUrl: lang.traditionalAudioUrl || '',
    });
  }, [lang.welcomeMessage, lang.traditionalAudioUrl]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Seuls les fichiers audio sont acceptés (mp3, wav, m4a…)');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('langCode', lang.code);
      formData.append('type', 'traditional_welcome');
      const { data } = await uploadAPI.uploadAudio(formData);
      const url = data.audioUrl || data.url || data.fileUrl || '';
      setForm(f => ({ ...f, traditionalAudioUrl: url }));
    } catch (err) {
      setError('Erreur lors de l\'upload : ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await languagesAPI.update(lang.id, {
        welcomeMessage:      form.welcomeMessage      || null,
        traditionalAudioUrl: form.traditionalAudioUrl || null,
      });
      setSaved(true);
      onSaved?.({ ...lang, welcomeMessage: form.welcomeMessage, traditionalAudioUrl: form.traditionalAudioUrl });
      toast.success(`${lang.nom} sauvegardé !`);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Erreur : ' + (err.response?.data?.error || err.message));
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    setShowReset(false);
    setResetting(true);
    try {
      await languagesAPI.update(lang.id, { welcomeMessage: null, traditionalAudioUrl: null });
      const freshMsg = getDefaultMessage(lang);
      setForm({ welcomeMessage: freshMsg, traditionalAudioUrl: '' });
      onReset?.({ ...lang, welcomeMessage: null, traditionalAudioUrl: null });
      toast.success(`Configuration de "${lang.nom}" réinitialisée`);
    } catch (err) {
      toast.error('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setResetting(false);
    }
  };

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    if (!form.welcomeMessage.trim()) return;
    setSpeaking(true);
    speakText(form.welcomeMessage, () => setSpeaking(false));
  };

  const handlePlayTraditional = () => {
    if (!form.traditionalAudioUrl) return;
    if (playingAudio) {
      audioRef.current?.pause();
      setPlayingAudio(false);
      return;
    }
    try {
      audioRef.current = new Audio(form.traditionalAudioUrl);
      audioRef.current.onended = () => setPlayingAudio(false);
      audioRef.current.play();
      setPlayingAudio(true);
    } catch (_) { setError('Impossible de lire cet audio.'); }
  };

  const isConfigured = !!(lang.traditionalAudioUrl || lang.welcomeMessage);
  const hasChanges =
    form.welcomeMessage      !== (lang.welcomeMessage      || getDefaultMessage(lang)) ||
    form.traditionalAudioUrl !== (lang.traditionalAudioUrl || '');

  return (
    <>
      <div className={`bg-white rounded-2xl border transition-all duration-200 ${
        expanded ? 'border-primary-300 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'
      }`}>
        {/* ── En-tête (clic pour déplier) ── */}
        <div className="flex items-center gap-4 p-5">
          <button className="flex items-center gap-4 flex-1 text-left min-w-0"
            onClick={() => setExpanded(e => !e)}>
            <span className="text-3xl flex-shrink-0">{getLangEmoji(lang)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-lg">{lang.nom}</h3>
                {lang.isActive === false && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold border border-amber-200">
                    Bientôt
                  </span>
                )}
                {lang.traditionalAudioUrl && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                    <MusicalNoteIcon className="w-3 h-3" /> Son traditionnel
                  </span>
                )}
                {lang.welcomeMessage && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    <SpeakerWaveIcon className="w-3 h-3" /> Message perso
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {form.welcomeMessage || 'Aucun message défini'}
              </p>
            </div>
            <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {/* ── Boutons de gestion rapide ── */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isConfigured && (
              <button
                onClick={() => setShowReset(true)}
                disabled={resetting}
                title="Réinitialiser la configuration"
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                {resetting
                  ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                  : <ArrowPathIcon className="w-4 h-4" />
                }
              </button>
            )}
          </div>
        </div>

        {/* ── Corps déplié ── */}
        {expanded && (
          <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-5">

            {/* Son traditionnel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MusicalNoteIcon className="w-4 h-4 text-purple-600" />
                Son traditionnel <span className="font-normal text-gray-400 text-xs">(~5 secondes recommandées)</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Joué avant le message de bienvenue quand l'utilisateur sélectionne cette langue.
                Instruments traditionnels de la région conseillés.
              </p>

              {form.traditionalAudioUrl ? (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <MusicalNoteIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-xs text-purple-700 flex-1 truncate">{form.traditionalAudioUrl}</span>
                  <button onClick={handlePlayTraditional}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium flex-shrink-0">
                    {playingAudio
                      ? <><StopCircleIcon className="w-3.5 h-3.5" /> Stop</>
                      : <><PlayCircleIcon className="w-3.5 h-3.5" /> Écouter</>
                    }
                  </button>
                  <button onClick={() => setForm(f => ({ ...f, traditionalAudioUrl: '' }))}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0"
                    title="Supprimer ce son">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                  onClick={() => fileRef.current?.click()}>
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                      <span className="text-sm text-purple-600">Upload en cours…</span>
                    </div>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Cliquer pour importer le son traditionnel</p>
                      <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A · max 20 MB</p>
                    </>
                  )}
                </div>
              )}

              <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />

              <div className="mt-2">
                <input
                  type="url"
                  placeholder="Ou coller une URL audio directement…"
                  value={form.traditionalAudioUrl}
                  onChange={e => setForm(f => ({ ...f, traditionalAudioUrl: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Message de bienvenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <SpeakerWaveIcon className="w-4 h-4 text-blue-600" />
                Message de bienvenue
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Texte lu à voix haute après le son traditionnel. Idéalement dans la langue locale + français.
              </p>
              <textarea
                rows={4}
                value={form.welcomeMessage}
                onChange={e => setForm(f => ({ ...f, welcomeMessage: e.target.value }))}
                placeholder={getDefaultMessage(lang)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{form.welcomeMessage.length} caractères</span>
                <button
                  onClick={() => setForm(f => ({ ...f, welcomeMessage: getDefaultMessage(lang) }))}
                  className="text-xs text-gray-400 hover:text-gray-600 underline">
                  ↩ Restaurer le message par défaut
                </button>
              </div>
            </div>

            {/* Aperçu + Simuler */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Aperçu de la séquence</p>
                <p className="text-xs text-gray-500">
                  {form.traditionalAudioUrl
                    ? '🎵 Son traditionnel (~5s) → 🔊 Message de bienvenue'
                    : '🔊 Message de bienvenue (pas de son traditionnel configuré)'}
                </p>
              </div>
              <button
                onClick={handleSpeak}
                disabled={!form.welcomeMessage.trim()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                  speaking
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}>
                {speaking
                  ? <><StopCircleIcon className="w-4 h-4" /> Arrêter</>
                  : <><PlayCircleIcon className="w-4 h-4" /> Simuler</>
                }
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
                <ExclamationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-3">
              <button
                onClick={() => setShowReset(true)}
                disabled={resetting || !isConfigured}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowPathIcon className="w-4 h-4" />
                Réinitialiser
              </button>

              <div className="flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                    <CheckCircleIcon className="w-4 h-4" /> Sauvegardé !
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {saving
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sauvegarde…</>
                    : <><PencilSquareIcon className="w-4 h-4" /> Sauvegarder</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Réinitialiser */}
      {showReset && (
        <ModalReset lang={lang} onClose={() => setShowReset(false)} onConfirm={handleResetConfirm} />
      )}
    </>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',           label: 'Toutes' },
  { key: 'configured',    label: '✅ Configurées' },
  { key: 'unconfigured',  label: '⚠️ À configurer' },
  { key: 'active',        label: '🟢 Actives' },
  { key: 'future',        label: '🔜 À venir' },
];

export default function BienvenueEtSonsPage() {
  const [languages, setLanguages]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter]         = useState('all');

  useEffect(() => {
    languagesAPI.getAll()
      .then(({ data }) => setLanguages(Array.isArray(data) ? data : data.languages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated) => {
    setLanguages(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
  };

  const handleReset = (updated) => {
    setLanguages(prev => prev.map(l => l.id === updated.id ? { ...l, welcomeMessage: null, traditionalAudioUrl: null } : l));
  };

  // ── Filtrage ──
  const filtered = languages.filter(l => {
    const matchSearch = l.nom.toLowerCase().includes(searchTerm.toLowerCase())
      || l.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    const isConfigured = !!(l.traditionalAudioUrl || l.welcomeMessage);
    const isActive = l.isActive !== false;

    if (filter === 'configured')   return isConfigured;
    if (filter === 'unconfigured') return !isConfigured;
    if (filter === 'active')       return isActive;
    if (filter === 'future')       return !isActive;
    return true;
  });

  // ── Stats ──
  const configured  = languages.filter(l => l.traditionalAudioUrl || l.welcomeMessage).length;
  const withAudio   = languages.filter(l => l.traditionalAudioUrl).length;
  const withMessage = languages.filter(l => l.welcomeMessage).length;
  const actives     = languages.filter(l => l.isActive !== false).length;
  const futures     = languages.filter(l => l.isActive === false).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">

      {/* ── En-tête ── */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0 mt-0.5">
          <MusicalNoteIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue & Sons</h1>
          <p className="text-sm text-gray-500">
            Gérez le son traditionnel et le message lu à la sélection de chaque langue dans l'app.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Configurées',       value: configured,  total: languages.length, color: 'text-primary-700', bg: 'bg-primary-50',  icon: SparklesIcon },
          { label: 'Son traditionnel',  value: withAudio,   total: languages.length, color: 'text-purple-700',  bg: 'bg-purple-50',   icon: MusicalNoteIcon },
          { label: 'Message perso',     value: withMessage, total: languages.length, color: 'text-blue-700',    bg: 'bg-blue-50',     icon: SpeakerWaveIcon },
          { label: 'Langues actives',   value: actives,     total: languages.length, color: 'text-green-700',   bg: 'bg-green-50',    icon: CheckCircleIcon },
          { label: 'Langues à venir',   value: futures,     total: languages.length, color: 'text-amber-700',   bg: 'bg-amber-50',    icon: ExclamationCircleIcon },
        ].map(({ label, value, total, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-xl p-3 flex flex-col gap-1`}>
            <Icon className={`w-4 h-4 ${color}`} />
            <div className={`text-xl font-bold ${color}`}>
              {value}<span className="text-sm font-normal text-gray-400">/{total}</span>
            </div>
            <div className="text-xs text-gray-500 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Bandeau info ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
        <MusicalNoteIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
        <div className="space-y-1">
          <p><strong>Comment ça fonctionne ?</strong> Quand un utilisateur sélectionne une langue pendant
          l'inscription, l'app joue le son traditionnel (~5 s), puis lit le message de bienvenue à voix haute.
          Utilisez le bouton <strong>Simuler</strong> pour tester la séquence.
          Le bouton <strong>⟳ Réinitialiser</strong> efface la configuration personnalisée et remet le message par défaut.</p>
          <p className="text-xs text-amber-700">
            <strong>✅ Accessible aux éditeurs :</strong> Tous les éditeurs, agents et administrateurs peuvent modifier
            les messages et ajouter des sons. Pour ajouter une nouvelle langue, rendez-vous dans
            <strong> Paramètres APP → Langues</strong>.
          </p>
        </div>
      </div>

      {/* ── Barre Recherche + Filtres ── */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une langue…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <FunnelIcon className="w-4 h-4 text-gray-400 self-center flex-shrink-0" />
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                filter === f.key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filtered.length} langue{filtered.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MusicalNoteIcon className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">Aucune langue trouvée</p>
          <p className="text-sm mt-1">Modifiez le filtre ou la recherche</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lang => (
            <LangCard key={lang.id} lang={lang} onSaved={handleSaved} onReset={handleReset} />
          ))}
        </div>
      )}
    </div>
  );
}
