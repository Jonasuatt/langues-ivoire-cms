import { useState, useEffect, useRef } from 'react';
import { languagesAPI, uploadAPI } from '../services/api';
import {
  SpeakerWaveIcon, MusicalNoteIcon, ArrowUpTrayIcon,
  CheckCircleIcon, ExclamationCircleIcon, PlayCircleIcon,
  StopCircleIcon, TrashIcon, PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

// ── Messages par défaut (reprise du mobile) ──────────────────────────────────
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

const LANG_EMOJIS = {
  baoule: '🌿', dioula: '🌊', bete: '🌺', senoufo: '🦅',
  agni: '🌴', gouro: '🎋', guere: '🌄', nouchi: '🏙️',
};

// ── TTS navigateur ────────────────────────────────────────────────────────────
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

// ── Carte d'une langue ────────────────────────────────────────────────────────
function LangCard({ lang, onSaved }) {
  const [form, setForm]         = useState({
    welcomeMessage:      lang.welcomeMessage      || DEFAULT_MESSAGES[lang.code] || '',
    traditionalAudioUrl: lang.traditionalAudioUrl || '',
  });
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');
  const [speaking, setSpeaking]     = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const fileRef  = useRef(null);
  const audioRef = useRef(null);

  // ── Upload son traditionnel ──────────────────────────────────────────────
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
      formData.append('file', file);
      formData.append('langCode', lang.code);
      formData.append('type', 'traditional_welcome');
      // Utilise l'endpoint upload existant (Cloudinary)
      const { data } = await uploadAPI.contributeImage(formData);
      const url = data.url || data.audioUrl || data.fileUrl || '';
      setForm(f => ({ ...f, traditionalAudioUrl: url }));
    } catch (err) {
      setError('Erreur lors de l\'upload : ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Sauvegarder ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await languagesAPI.update(lang.id, {
        welcomeMessage:      form.welcomeMessage      || null,
        traditionalAudioUrl: form.traditionalAudioUrl || null,
      });
      setSaved(true);
      onSaved?.({ ...lang, ...form });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Preview TTS ─────────────────────────────────────────────────────────
  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    if (!form.welcomeMessage.trim()) return;
    setSpeaking(true);
    // Si son traditionnel → simuler 2s de délai, puis TTS
    const delay = form.traditionalAudioUrl ? 2000 : 0;
    setTimeout(() => {
      speakText(form.welcomeMessage, () => setSpeaking(false));
    }, delay);
  };

  // ── Preview son traditionnel ─────────────────────────────────────────────
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

  const hasChanges =
    form.welcomeMessage      !== (lang.welcomeMessage      || DEFAULT_MESSAGES[lang.code] || '') ||
    form.traditionalAudioUrl !== (lang.traditionalAudioUrl || '');

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      expanded ? 'border-primary-300 shadow-lg' : 'border-gray-200 shadow-sm hover:shadow-md'
    }`}>
      {/* En-tête de la carte */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-3xl">{LANG_EMOJIS[lang.code] || '🌍'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-lg">{lang.nom}</h3>
            {lang.traditionalAudioUrl && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                <MusicalNoteIcon className="w-3 h-3" /> Son traditionnel
              </span>
            )}
            {lang.welcomeMessage && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                <SpeakerWaveIcon className="w-3 h-3" /> Message personnalisé
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">
            {form.welcomeMessage || 'Aucun message défini'}
          </p>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {/* Contenu expandé */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-5">

          {/* ─ Son traditionnel ─────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MusicalNoteIcon className="w-4 h-4 text-purple-600" />
              Son traditionnel (~5 secondes)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Joué avant le message de bienvenue dès que l'utilisateur sélectionne cette langue.
              Recommandé : instruments traditionnels de la région (durée idéale : 5 s).
            </p>

            {form.traditionalAudioUrl ? (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                <MusicalNoteIcon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-xs text-purple-700 flex-1 truncate">{form.traditionalAudioUrl}</span>
                <button onClick={handlePlayTraditional}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium">
                  {playingAudio
                    ? <><StopCircleIcon className="w-3.5 h-3.5" /> Stop</>
                    : <><PlayCircleIcon className="w-3.5 h-3.5" /> Écouter</>
                  }
                </button>
                <button onClick={() => setForm(f => ({ ...f, traditionalAudioUrl: '' }))}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                    <span className="text-sm text-purple-600">Upload en cours…</span>
                  </div>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Cliquer pour uploader le son traditionnel</p>
                    <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A · 5 secondes recommandées</p>
                  </>
                )}
              </div>
            )}

            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />

            {/* URL manuelle */}
            <div className="mt-2">
              <input
                type="url"
                placeholder="Ou coller une URL Cloudinary directement…"
                value={form.traditionalAudioUrl}
                onChange={e => setForm(f => ({ ...f, traditionalAudioUrl: e.target.value }))}
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-600 placeholder-gray-400"
              />
            </div>
          </div>

          {/* ─ Message de bienvenue ──────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <SpeakerWaveIcon className="w-4 h-4 text-blue-600" />
              Message de bienvenue
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Texte lu à voix haute après le son traditionnel. Idéalement dans la langue locale + français.
              Le TTS le lira automatiquement sur l'application mobile.
            </p>
            <textarea
              rows={4}
              value={form.welcomeMessage}
              onChange={e => setForm(f => ({ ...f, welcomeMessage: e.target.value }))}
              placeholder={DEFAULT_MESSAGES[lang.code] || 'Saisissez le message de bienvenue…'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">{form.welcomeMessage.length} caractères</span>
              <button
                onClick={() => setForm(f => ({ ...f, welcomeMessage: DEFAULT_MESSAGES[lang.code] || '' }))}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Restaurer le message par défaut
              </button>
            </div>
          </div>

          {/* ─ Preview complet ────────────────────────────────────────── */}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                speaking
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {speaking
                ? <><StopCircleIcon className="w-4 h-4" /> Arrêter</>
                : <><PlayCircleIcon className="w-4 h-4" /> Simuler</>
              }
            </button>
          </div>

          {/* ─ Erreur ────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-sm">
              <ExclamationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ─ Bouton sauvegarder ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircleIcon className="w-4 h-4" /> Sauvegardé !
              </span>
            )}
            {!saved && <span />}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving
                ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sauvegarde…</>
                : <><PencilSquareIcon className="w-4 h-4" /> Sauvegarder</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function WelcomeSettingsPage() {
  const [languages, setLanguages]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    languagesAPI.getAll()
      .then(({ data }) => setLanguages(Array.isArray(data) ? data : data.languages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated) => {
    setLanguages(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
  };

  const filtered = languages.filter(l =>
    l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const configured   = languages.filter(l => l.traditionalAudioUrl || l.welcomeMessage).length;
  const withAudio    = languages.filter(l => l.traditionalAudioUrl).length;
  const withMessage  = languages.filter(l => l.welcomeMessage).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-purple-100 rounded-xl">
            <MusicalNoteIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue & Sons</h1>
            <p className="text-sm text-gray-500">
              Gérez le son traditionnel et le message lu à la sélection de chaque langue dans l'app.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Langues configurées', value: configured, total: languages.length, color: 'primary', icon: SparklesIcon },
          { label: 'Avec son traditionnel', value: withAudio,   total: languages.length, color: 'purple', icon: MusicalNoteIcon },
          { label: 'Avec message perso',   value: withMessage, total: languages.length, color: 'blue',   icon: SpeakerWaveIcon },
        ].map(({ label, value, total, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-100`}>
              <Icon className={`w-4 h-4 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}<span className="text-base font-normal text-gray-400">/{total}</span></div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Barre d'info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-800">
        <MusicalNoteIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <strong>Comment ça fonctionne ?</strong> Quand un utilisateur sélectionne une langue pendant l'inscription,
          l'app joue d'abord le son traditionnel (~5s), puis lit le message de bienvenue à voix haute.
          Si aucun son n'est configuré, seul le message est lu.
          Le bouton <strong>Simuler</strong> vous permet de tester la séquence directement ici.
        </div>
      </div>

      {/* Recherche */}
      {languages.length > 4 && (
        <input
          type="text"
          placeholder="Rechercher une langue…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
      )}

      {/* Liste des langues */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lang => (
            <LangCard key={lang.id} lang={lang} onSaved={handleSaved} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">Aucune langue trouvée.</div>
          )}
        </div>
      )}
    </div>
  );
}
