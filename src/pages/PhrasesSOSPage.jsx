/**
 * PhrasesSOSPage — Gestion du module S.O.S. LANGUES
 *
 * Deux onglets :
 *  1. Phrases vitales (catégorie "urgence") — remplacent les 10 phrases hardcodées si présentes en API
 *  2. Où j'ai mal ? (catégorie "corps")     — 8 parties du corps × N langues
 */
import { useEffect, useState, useRef } from 'react';
import { phrasesAdminAPI, languagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FileUploadField from '../components/FileUploadField';
import QuadAudioField from '../components/QuadAudioField';
import {
  ExclamationTriangleIcon, PlusIcon, PencilIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon,
  MagnifyingGlassIcon, SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Langues du mobile SOS ───────────────────────────────────────────────────
const SOS_LANGUAGES = [
  { code: 'dioula',  name: 'Dioula',  flag: '🌍' },
  { code: 'baoule',  name: 'Baoulé',  flag: '🌿' },
  { code: 'bete',    name: 'Bété',    flag: '🌺' },
  { code: 'senoufo', name: 'Sénoufo', flag: '🌾' },
  { code: 'agni',    name: 'Agni',    flag: '👑' },
  { code: 'gouro',   name: 'Gouro',   flag: '🎨' },
  { code: 'guere',   name: 'Guéré',   flag: '🌳' },
  { code: 'nouchi',  name: 'Nouchi',  flag: '🌆' },
  { code: 'yacouba', name: 'Yacouba', flag: '🌲' },
];

// ─── Catégories d'emojis pour le sélecteur ───────────────────────────────────
const EMOJI_CATEGORIES = [
  { label: '🆘 Urgences',       emojis: ['🆘','🚨','⚠️','🔥','💥','🚑','🚒','🚓','🆘','📢','❗','🛑'] },
  { label: '🏥 Santé',          emojis: ['🤕','🩺','💊','🏥','👨‍⚕️','🩹','🩻','🧬','💉','🌡️','😷','🫀'] },
  { label: '💧 Besoins vitaux', emojis: ['💧','🌊','🍞','🍽️','🛏️','🌡️','❄️','☀️','⚡','🌪️','🌧️','🏠'] },
  { label: '🗺️ Localisation',   emojis: ['🗺️','📍','📌','🧭','✈️','🚗','🚌','🚢','🏔️','🏝️','🌆','🏕️'] },
  { label: '👥 Personnes',      emojis: ['👨‍👩‍👧','👫','👨','👩','👶','🧑‍🤝‍🧑','👴','👵','👮','🧑‍⚕️','🧑‍🚒','🧑‍✈️'] },
  { label: '📞 Communication',  emojis: ['📞','📱','📣','🔔','💬','✉️','🆘','🏳️','🏴','🚩','📡','🔍'] },
];

// ─── 8 parties du corps ──────────────────────────────────────────────────────
const BODY_PARTS = [
  { id: 'tete',     label: 'Tête',     emoji: '🧠', fr: "J'ai mal à la tête." },
  { id: 'gorge',    label: 'Gorge',    emoji: '🫁', fr: "J'ai mal à la gorge." },
  { id: 'poitrine', label: 'Poitrine', emoji: '❤️', fr: "J'ai mal à la poitrine." },
  { id: 'ventre',   label: 'Ventre',   emoji: '🫃', fr: "J'ai mal au ventre." },
  { id: 'bras',     label: 'Bras',     emoji: '💪', fr: "J'ai mal au bras." },
  { id: 'dos',      label: 'Dos',      emoji: '🫀', fr: "J'ai mal au dos." },
  { id: 'jambe',    label: 'Jambe',    emoji: '🦵', fr: "J'ai mal à la jambe." },
  { id: 'pied',     label: 'Pied',     emoji: '🦶', fr: "J'ai mal au pied." },
];

const EMPTY_URGENCE = { languageId: '', phrase: '', transcription: '', traduction: '', contexte: '🆘', audioUrl: '', audioUrlF: '', audioUrlFr: '', audioUrlFrF: '', genreLocuteur: '', status: 'PUBLISHED' };
const EMPTY_CORPS   = { languageId: '', bodyPartId: 'tete', phrase: '', transcription: '', audioUrl: '', audioUrlF: '', audioUrlFr: '', audioUrlFrF: '', genreLocuteur: '', status: 'PUBLISHED' };

// ─── GenrePicker ─────────────────────────────────────────────────────────────
function GenrePicker({ value, onChange }) {
  const opts = [
    { key: '',  label: 'Non renseigné', icon: '—',  color: 'border-gray-200 text-gray-400 bg-white',  ring: 'ring-gray-300' },
    { key: 'M', label: 'Homme',         icon: '👨', color: 'border-blue-300 text-blue-700 bg-blue-50', ring: 'ring-blue-400' },
    { key: 'F', label: 'Femme',         icon: '👩', color: 'border-pink-300 text-pink-700 bg-pink-50', ring: 'ring-pink-400' },
  ];
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Genre du locuteur (audio)</label>
      <div className="flex gap-2">
        {opts.map(o => (
          <button key={o.key} type="button" onClick={() => onChange(o.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-colors ${
              value === o.key ? o.color + ' ring-2 ring-offset-1 ' + o.ring : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
            }`}>
            <span className="text-lg">{o.icon}</span>{o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── EmojiPicker ─────────────────────────────────────────────────────────────
function EmojiPicker({ value, onChange }) {
  const [open, setOpen]         = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [custom, setCustom]     = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const select = (e) => { onChange(e); setOpen(false); };
  const handleCustom = (e) => {
    const v = e.target.value; setCustom(v);
    const chars = [...v];
    if (chars.length > 0) onChange(chars[chars.length - 1]);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Contexte (emoji) *</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
        <span className="text-3xl leading-none">{value || '❓'}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-700">Emoji sélectionné</p>
          <p className="text-xs text-gray-400">Cliquez pour changer</p>
        </div>
        {open ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Saisir ou coller un emoji personnalisé</label>
            <div className="flex items-center gap-2">
              <input type="text" value={custom} onChange={handleCustom}
                placeholder="Coller ou taper un emoji…" className="input flex-1 text-lg" />
              {custom && (
                <button type="button" onClick={() => select([...custom].pop())}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  ✓ Utiliser
                </button>
              )}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <div className="flex gap-1 flex-wrap mb-3">
              {EMOJI_CATEGORIES.map((cat, i) => (
                <button key={i} type="button" onClick={() => setActiveCat(i)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${activeCat === i ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-1">
              {EMOJI_CATEGORIES[activeCat].emojis.map((e, i) => (
                <button key={i} type="button" onClick={() => select(e)}
                  className={`text-2xl p-2 rounded-xl hover:bg-gray-100 transition-colors ${value === e ? 'bg-primary-100 ring-2 ring-primary-400' : ''}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function PhrasesSOSPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('urgence');
  const [languages, setLanguages] = useState([]);
  const [langMap, setLangMap]     = useState({});   // code → langue DB
  const [loading, setLoading]     = useState(true);

  // Filtres
  const [search, setSearch]         = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterBP, setFilterBP]     = useState('');  // filtre partie du corps (onglet corps)

  // ── Urgence ──────────────────────────────────────────────────────────────
  const [urgencePhrases, setUrgencePhrases]     = useState({});   // { langCode: [phrase, ...] }
  const [showUrgenceModal, setShowUrgenceModal] = useState(false);
  const [editUrgenceItem, setEditUrgenceItem]   = useState(null);
  const [urgenceForm, setUrgenceForm]           = useState(EMPTY_URGENCE);
  const [urgenceSaving, setUrgenceSaving]       = useState(false);
  const [selectedLangU, setSelectedLangU]       = useState(null);

  // ── Corps ─────────────────────────────────────────────────────────────────
  const [corpsPhrases, setCorpsPhrases]     = useState({});       // { langCode: [phrase, ...] }
  const [showCorpsModal, setShowCorpsModal] = useState(false);
  const [editCorpsItem, setEditCorpsItem]   = useState(null);
  const [corpsForm, setCorpsForm]           = useState(EMPTY_CORPS);
  const [corpsSaving, setCorpsSaving]       = useState(false);
  const [selectedBP, setSelectedBP]         = useState(null);
  const [selectedLangC, setSelectedLangC]   = useState(null);

  // ─── Chargement initial ───────────────────────────────────────────────────
  useEffect(() => {
    languagesAPI.getAll()
      .then(({ data }) => {
        setLanguages(data);
        const m = {};
        data.forEach(l => { m[l.code] = l; });
        setLangMap(m);
      })
      .catch(() => {});
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [urgRes, corpsRes] = await Promise.all([
        phrasesAdminAPI.getAll({ categorie: 'urgence', limit: 200 }),
        phrasesAdminAPI.getAll({ categorie: 'corps',   limit: 200 }),
      ]);
      const uByCode = {}; const cByCode = {};
      SOS_LANGUAGES.forEach(l => { uByCode[l.code] = []; cByCode[l.code] = []; });
      (urgRes.data?.data  || []).forEach(p => { const c = p.language?.code; if (c && uByCode[c])  uByCode[c].push(p); });
      (corpsRes.data?.data || []).forEach(p => { const c = p.language?.code; if (c && cByCode[c]) cByCode[c].push(p); });
      setUrgencePhrases(uByCode);
      setCorpsPhrases(cByCode);
    } catch { toast.error('Erreur de chargement', { id: 'sos-load' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (Object.keys(langMap).length > 0) loadAll(); }, [langMap]);

  // ─── Handlers Urgence ─────────────────────────────────────────────────────
  const openAddUrgence = (langCode) => {
    const lang = langMap[langCode];
    setEditUrgenceItem(null);
    setUrgenceForm({ ...EMPTY_URGENCE, languageId: lang?.id || '' });
    setSelectedLangU(langCode ? SOS_LANGUAGES.find(l => l.code === langCode) : null);
    setShowUrgenceModal(true);
  };

  const openEditUrgence = (p) => {
    setEditUrgenceItem(p);
    setUrgenceForm({ languageId: p.languageId || '', phrase: p.phrase || '',
      transcription: p.transcription || '', traduction: p.traduction || '',
      contexte: p.contexte || '🆘', audioUrl: p.audioUrl || '',
      audioUrlF: p.audioUrlF || '', audioUrlFr: p.audioUrlFr || '', audioUrlFrF: p.audioUrlFrF || '',
      genreLocuteur: p.genreLocuteur || '', status: p.status || 'PUBLISHED' });
    setSelectedLangU(SOS_LANGUAGES.find(l => l.code === p.language?.code));
    setShowUrgenceModal(true);
  };

  const handleSaveUrgence = async () => {
    if (!urgenceForm.languageId || !urgenceForm.phrase || !urgenceForm.traduction) {
      toast.error('Langue, phrase et traduction sont requis'); return;
    }
    setUrgenceSaving(true);
    const payload = {
      languageId: urgenceForm.languageId,
      phrase: urgenceForm.phrase.trim(),
      transcription: urgenceForm.transcription.trim() || null,
      traduction: urgenceForm.traduction.trim(),
      categorie: 'urgence',
      contexte: urgenceForm.contexte || '🆘',
      audioUrl: urgenceForm.audioUrl.trim() || null,
      audioUrlF: urgenceForm.audioUrlF.trim() || null,
      audioUrlFr: urgenceForm.audioUrlFr.trim() || null,
      audioUrlFrF: urgenceForm.audioUrlFrF.trim() || null,
      genreLocuteur: urgenceForm.genreLocuteur || null,
      status: urgenceForm.status,
    };
    try {
      if (editUrgenceItem) { await phrasesAdminAPI.update(editUrgenceItem.id, payload); toast.success('Phrase mise à jour'); }
      else { await phrasesAdminAPI.create(payload); toast.success('Phrase ajoutée'); }
      setShowUrgenceModal(false); loadAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setUrgenceSaving(false); }
  };

  const handleDeleteUrgence = async (p) => {
    if (!confirm(`Supprimer "${p.phrase}" ?`)) return;
    try { await phrasesAdminAPI.delete(p.id); toast.success('Supprimée'); loadAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  // ─── Handlers Corps ───────────────────────────────────────────────────────
  const openAddCorps = (langCode, bodyPart) => {
    const lang = langMap[langCode];
    setEditCorpsItem(null);
    setCorpsForm({ ...EMPTY_CORPS, languageId: lang?.id || '', bodyPartId: bodyPart?.id || 'tete' });
    setSelectedBP(bodyPart || BODY_PARTS[0]);
    setSelectedLangC(langCode ? SOS_LANGUAGES.find(l => l.code === langCode) : null);
    setShowCorpsModal(true);
  };

  const openEditCorps = (p) => {
    const bp = BODY_PARTS.find(b => b.id === p.contexte) || BODY_PARTS[0];
    setEditCorpsItem(p);
    setCorpsForm({ languageId: p.languageId || '', bodyPartId: p.contexte || 'tete',
      phrase: p.phrase || '', transcription: p.transcription || '',
      audioUrl: p.audioUrl || '', audioUrlF: p.audioUrlF || '', audioUrlFr: p.audioUrlFr || '', audioUrlFrF: p.audioUrlFrF || '',
      genreLocuteur: p.genreLocuteur || '', status: p.status || 'PUBLISHED' });
    setSelectedBP(bp);
    setSelectedLangC(SOS_LANGUAGES.find(l => l.code === p.language?.code));
    setShowCorpsModal(true);
  };

  const handleSaveCorps = async () => {
    if (!corpsForm.languageId || !corpsForm.phrase) { toast.error('Langue et phrase sont requis'); return; }
    const bp = BODY_PARTS.find(b => b.id === corpsForm.bodyPartId) || BODY_PARTS[0];
    setCorpsSaving(true);
    const payload = {
      languageId: corpsForm.languageId,
      phrase: corpsForm.phrase.trim(),
      transcription: corpsForm.transcription.trim() || null,
      traduction: bp.fr,
      categorie: 'corps',
      contexte: corpsForm.bodyPartId,
      audioUrl: corpsForm.audioUrl.trim() || null,
      audioUrlF: corpsForm.audioUrlF.trim() || null,
      audioUrlFr: corpsForm.audioUrlFr.trim() || null,
      audioUrlFrF: corpsForm.audioUrlFrF.trim() || null,
      genreLocuteur: corpsForm.genreLocuteur || null,
      status: corpsForm.status,
    };
    try {
      if (editCorpsItem) { await phrasesAdminAPI.update(editCorpsItem.id, payload); toast.success('Phrase mise à jour'); }
      else { await phrasesAdminAPI.create(payload); toast.success('Phrase ajoutée'); }
      setShowCorpsModal(false); loadAll();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setCorpsSaving(false); }
  };

  const handleDeleteCorps = async (p) => {
    if (!confirm(`Supprimer la phrase pour "${BODY_PARTS.find(b => b.id === p.contexte)?.label || p.contexte}" ?`)) return;
    try { await phrasesAdminAPI.delete(p.id); toast.success('Supprimée'); loadAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalUrgence      = Object.values(urgencePhrases).reduce((s, a) => s + a.length, 0);
  const langsAvecUrgence  = SOS_LANGUAGES.filter(l => (urgencePhrases[l.code]?.length || 0) > 0).length;
  const totalCorps        = Object.values(corpsPhrases).reduce((s, a) => s + a.length, 0);
  const corpsMaxPossible  = SOS_LANGUAGES.length * BODY_PARTS.length;
  const corpsCovered      = SOS_LANGUAGES.reduce((s, l) => {
    const ids = new Set((corpsPhrases[l.code] || []).map(p => p.contexte));
    return s + BODY_PARTS.filter(b => ids.has(b.id)).length;
  }, 0);
  const avecAudio = [
    ...Object.values(urgencePhrases).flat(),
    ...Object.values(corpsPhrases).flat(),
  ].filter(p => p.audioUrl).length;

  // ─── Filtres appliqués ────────────────────────────────────────────────────
  const q = search.toLowerCase();
  const visibleSOSLangs = SOS_LANGUAGES.filter(l => {
    if (filterLang) {
      const dbLang = langMap[l.code];
      if (!dbLang || dbLang.id !== filterLang) return false;
    }
    if (q && !l.name.toLowerCase().includes(q)) return false;
    return true;
  });

  const visibleBodyParts = filterBP ? BODY_PARTS.filter(b => b.id === filterBP) : BODY_PARTS;

  const findCorpsPhrase = (langCode, bpId) =>
    (corpsPhrases[langCode] || []).find(p => p.contexte === bpId);

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
            Phrases SOS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Contenu de l'écran <strong>S.O.S. LANGUES</strong> — phrases vitales &amp; carte corporelle
          </p>
        </div>
        <button
          onClick={() => activeTab === 'urgence' ? openAddUrgence(null) : openAddCorps(null, null)}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          {activeTab === 'urgence' ? 'Phrase vitale' : 'Phrase corporelle'}
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-red-600">{totalUrgence}</p>
          <p className="text-sm text-gray-500">Phrases vitales</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-gray-800">{langsAvecUrgence}/{SOS_LANGUAGES.length}</p>
          <p className="text-sm text-gray-500">Langues couvertes</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-orange-600">{corpsCovered}/{corpsMaxPossible}</p>
          <p className="text-sm text-gray-500">Corps couverts</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-green-600">{avecAudio}</p>
          <p className="text-sm text-gray-500">Avec audio</p>
        </div>
      </div>

      {/* ── Onglets ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 mb-0">
        {[
          { key: 'urgence', label: '🆘 Phrases vitales' },
          { key: 'corps',   label: '🤕 Où j\'ai mal ?' },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearch(''); setFilterLang(''); setFilterBP(''); }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors -mb-px ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-gray-200 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Barre de filtres ────────────────────────────────────────────── */}
      <div className="flex gap-3 my-5 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === 'urgence' ? 'Rechercher une langue…' : 'Rechercher une phrase…'}
            className="input pl-9 w-52"
          />
        </div>

        <select value={filterLang} onChange={e => setFilterLang(e.target.value)} className="input w-auto">
          <option value="">Toutes les langues</option>
          {SOS_LANGUAGES.map(l => langMap[l.code] && (
            <option key={l.code} value={langMap[l.code].id}>{l.flag} {l.name}</option>
          ))}
        </select>

        {activeTab === 'corps' && (
          <select value={filterBP} onChange={e => setFilterBP(e.target.value)} className="input w-auto">
            <option value="">Toutes les parties</option>
            {BODY_PARTS.map(b => <option key={b.id} value={b.id}>{b.emoji} {b.label}</option>)}
          </select>
        )}

        <span className="ml-auto text-sm text-gray-400">
          {activeTab === 'urgence'
            ? `${visibleSOSLangs.length} langue(s) • ${totalUrgence} phrase(s)`
            : `${visibleBodyParts.length} partie(s) • ${totalCorps} phrase(s)`}
        </span>
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl"/>)}
        </div>
      ) : (
        <>

          {/* ══ ONGLET URGENCE ══════════════════════════════════════════════ */}
          {activeTab === 'urgence' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <strong>Mécanisme :</strong> si l'API contient des phrases pour une langue, elles <em>remplacent</em> les 10 phrases intégrées dans le mobile.
                Le champ <strong>Contexte</strong> = emoji affiché devant la phrase.
              </div>

              {visibleSOSLangs.length === 0 ? (
                <div className="card text-center py-14">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="text-gray-400">Aucune langue correspondant aux filtres</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleSOSLangs.map(lang => {
                    const phrases = urgencePhrases[lang.code] || [];
                    const hasApi  = phrases.length > 0;
                    return (
                      <div key={lang.code}
                        className={`card border-2 transition-all ${hasApi ? 'border-green-200 bg-green-50/40' : 'border-gray-200'}`}>
                        {/* En-tête carte */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{lang.flag}</span>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{lang.name}</p>
                              <p className="text-xs text-gray-500">{phrases.length} / 10 phrases</p>
                            </div>
                          </div>
                          {hasApi
                            ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0"/>
                            : <XCircleIcon    className="w-5 h-5 text-gray-300 flex-shrink-0"/>}
                        </div>

                        {/* Barre de progression */}
                        <div className="h-1.5 bg-gray-200 rounded-full mb-3">
                          <div className="h-1.5 rounded-full bg-green-500 transition-all"
                            style={{ width: `${Math.min(100, (phrases.length / 10) * 100)}%` }}/>
                        </div>

                        {/* Liste des phrases */}
                        {phrases.length > 0 ? (
                          <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                            {phrases.map(p => (
                              <div key={p.id} className="flex items-center gap-1.5 text-xs group">
                                <span className="flex-shrink-0">{p.contexte || '🆘'}</span>
                                <span className="flex-1 text-gray-600 truncate">{p.traduction}</span>
                                {p.audioUrl && <SpeakerWaveIcon className="w-3 h-3 text-green-400 flex-shrink-0"/>}
                                {p.genreLocuteur && (
                                  <span className="text-[10px] flex-shrink-0">
                                    {p.genreLocuteur === 'M' ? '👨' : '👩'}
                                  </span>
                                )}
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                  <button onClick={() => openEditUrgence(p)}
                                    className="p-0.5 text-gray-400 hover:text-primary-500">
                                    <PencilIcon className="w-3 h-3"/>
                                  </button>
                                  {isAdmin && (
                                    <button onClick={() => handleDeleteUrgence(p)}
                                      className="p-0.5 text-gray-400 hover:text-red-500">
                                      <TrashIcon className="w-3 h-3"/>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic mb-3">Utilise les 10 phrases intégrées</p>
                        )}

                        {/* Bouton Ajouter */}
                        <button onClick={() => openAddUrgence(lang.code)}
                          disabled={!langMap[lang.code]}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40">
                          <PlusIcon className="w-3.5 h-3.5"/> Ajouter
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ ONGLET CORPS ════════════════════════════════════════════════ */}
          {activeTab === 'corps' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
                <strong>Carte corporelle :</strong> 8 parties du corps × {SOS_LANGUAGES.length} langues.
                Le champ <code>contexte</code> = identifiant mobile (tete, gorge…). Seule la phrase en <strong>langue locale</strong> est à saisir.
                <span className="text-orange-500 font-medium ml-2">⚠️ Mise à jour mobile requise pour activer l'API (en cours).</span>
              </div>

              {/* Tableau matrice */}
              <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-40">Partie du corps</th>
                      {(filterLang
                        ? SOS_LANGUAGES.filter(l => langMap[l.code]?.id === filterLang)
                        : SOS_LANGUAGES
                      ).map(l => (
                        <th key={l.code} className="px-3 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-base">{l.flag}</span>
                            <span className="text-xs">{l.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibleBodyParts.map(bp => {
                      const cols = filterLang
                        ? SOS_LANGUAGES.filter(l => langMap[l.code]?.id === filterLang)
                        : SOS_LANGUAGES;
                      return (
                        <tr key={bp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{bp.emoji}</span>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{bp.label}</p>
                                <p className="text-xs text-gray-400 italic">{bp.fr}</p>
                              </div>
                            </div>
                          </td>
                          {cols.map(lang => {
                            const existing = findCorpsPhrase(lang.code, bp.id);
                            return (
                              <td key={lang.code} className="px-3 py-3 text-center">
                                {existing ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs text-gray-700 max-w-[90px] truncate font-medium"
                                      title={existing.phrase}>{existing.phrase}</span>
                                    <div className="flex items-center gap-1">
                                      {existing.audioUrl && <SpeakerWaveIcon className="w-3 h-3 text-green-500"/>}
                                      {existing.genreLocuteur && (
                                        <span className="text-[10px]">{existing.genreLocuteur === 'M' ? '👨' : '👩'}</span>
                                      )}
                                    </div>
                                    <div className="flex gap-0.5">
                                      <button onClick={() => openEditCorps(existing)}
                                        className="p-1 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors"
                                        title="Modifier">
                                        <PencilIcon className="w-3.5 h-3.5"/>
                                      </button>
                                      {isAdmin && (
                                        <button onClick={() => handleDeleteCorps(existing)}
                                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                          title="Supprimer">
                                          <TrashIcon className="w-3.5 h-3.5"/>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => openAddCorps(lang.code, bp)}
                                    disabled={!langMap[lang.code]}
                                    className="inline-flex items-center gap-0.5 px-2 py-1.5 text-xs text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-30">
                                    <PlusIcon className="w-3 h-3"/> Ajouter
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Barres de couverture par langue */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SOS_LANGUAGES.map(lang => {
                  const phrases = corpsPhrases[lang.code] || [];
                  const ids     = new Set(phrases.map(p => p.contexte));
                  const count   = BODY_PARTS.filter(b => ids.has(b.id)).length;
                  const pct     = Math.round((count / BODY_PARTS.length) * 100);
                  return (
                    <div key={lang.code} className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-700 truncate">{lang.name}</p>
                          <span className="text-xs font-bold text-gray-500 ml-1">{count}/8</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                            style={{ width: `${pct}%` }}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Phrase vitale (urgence)
      ════════════════════════════════════════════════════════════════════ */}
      {showUrgenceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editUrgenceItem ? 'Modifier la phrase vitale' : 'Nouvelle phrase vitale'}
            </h2>
            {selectedLangU && (
              <p className="text-sm text-gray-500 mb-5">
                {selectedLangU.flag} <strong>{selectedLangU.name}</strong>
              </p>
            )}

            <div className="space-y-4">
              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                <select className="input" value={urgenceForm.languageId}
                  onChange={e => setUrgenceForm({ ...urgenceForm, languageId: e.target.value })}
                  disabled={!!editUrgenceItem}>
                  <option value="">-- Sélectionner --</option>
                  {SOS_LANGUAGES.map(l => langMap[l.code] && (
                    <option key={l.code} value={langMap[l.code].id}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              {/* Emoji contexte */}
              <EmojiPicker value={urgenceForm.contexte} onChange={v => setUrgenceForm({ ...urgenceForm, contexte: v })} />

              {/* Phrase locale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phrase en langue locale *</label>
                <input className="input" value={urgenceForm.phrase}
                  onChange={e => setUrgenceForm({ ...urgenceForm, phrase: e.target.value })}
                  placeholder="ex: A dɛmɛ n'na !"/>
              </div>

              {/* Transcription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                <input className="input" value={urgenceForm.transcription}
                  onChange={e => setUrgenceForm({ ...urgenceForm, transcription: e.target.value })}/>
              </div>

              {/* Traduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française *</label>
                <input className="input" value={urgenceForm.traduction}
                  onChange={e => setUrgenceForm({ ...urgenceForm, traduction: e.target.value })}
                  placeholder="ex: Aidez-moi ! Au secours !"/>
              </div>

              {/* Audio */}
              <QuadAudioField
                audioUrl={urgenceForm.audioUrl}
                audioUrlF={urgenceForm.audioUrlF || ''}
                audioUrlFr={urgenceForm.audioUrlFr || ''}
                audioUrlFrF={urgenceForm.audioUrlFrF || ''}
                onChange={(field, url) => setUrgenceForm(f => ({ ...f, [field]: url }))}
              />

              {/* Genre */}
              <GenrePicker value={urgenceForm.genreLocuteur}
                onChange={v => setUrgenceForm({ ...urgenceForm, genreLocuteur: v })}/>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select className="input" value={urgenceForm.status}
                  onChange={e => setUrgenceForm({ ...urgenceForm, status: e.target.value })}>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUrgenceModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSaveUrgence} disabled={urgenceSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                {urgenceSaving ? 'Sauvegarde…' : editUrgenceItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Phrase corporelle (corps)
      ════════════════════════════════════════════════════════════════════ */}
      {showCorpsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editCorpsItem ? 'Modifier la phrase corporelle' : 'Nouvelle phrase corporelle'}
            </h2>
            {selectedBP && selectedLangC && (
              <p className="text-sm text-gray-500 mb-5">
                {selectedBP.emoji} <strong>{selectedBP.label}</strong> — {selectedLangC.flag} <strong>{selectedLangC.name}</strong>
              </p>
            )}

            <div className="space-y-4">
              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                <select className="input" value={corpsForm.languageId}
                  onChange={e => setCorpsForm({ ...corpsForm, languageId: e.target.value })}
                  disabled={!!editCorpsItem}>
                  <option value="">-- Sélectionner --</option>
                  {SOS_LANGUAGES.map(l => langMap[l.code] && (
                    <option key={l.code} value={langMap[l.code].id}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              {/* Partie du corps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partie du corps</label>
                <div className="grid grid-cols-4 gap-2">
                  {BODY_PARTS.map(bp => (
                    <button key={bp.id} type="button"
                      onClick={() => setCorpsForm({ ...corpsForm, bodyPartId: bp.id })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                        corpsForm.bodyPartId === bp.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}>
                      <span className="text-xl">{bp.emoji}</span>{bp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traduction FR fixe */}
              {corpsForm.bodyPartId && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500">
                  <span className="font-medium">Traduction FR (fixe) :</span>{' '}
                  {BODY_PARTS.find(b => b.id === corpsForm.bodyPartId)?.fr}
                </div>
              )}

              {/* Phrase locale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phrase en langue locale *</label>
                <input className="input" value={corpsForm.phrase}
                  onChange={e => setCorpsForm({ ...corpsForm, phrase: e.target.value })}
                  placeholder="ex: Dimi bɛ n' kun na."/>
                <p className="text-xs text-gray-400 mt-1">Phrase complète prononcée par le mobile</p>
              </div>

              {/* Transcription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                <input className="input" value={corpsForm.transcription}
                  onChange={e => setCorpsForm({ ...corpsForm, transcription: e.target.value })}/>
              </div>

              {/* Audio */}
              <QuadAudioField
                audioUrl={corpsForm.audioUrl}
                audioUrlF={corpsForm.audioUrlF || ''}
                audioUrlFr={corpsForm.audioUrlFr || ''}
                audioUrlFrF={corpsForm.audioUrlFrF || ''}
                onChange={(field, url) => setCorpsForm(f => ({ ...f, [field]: url }))}
              />

              {/* Genre */}
              <GenrePicker value={corpsForm.genreLocuteur}
                onChange={v => setCorpsForm({ ...corpsForm, genreLocuteur: v })}/>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select className="input" value={corpsForm.status}
                  onChange={e => setCorpsForm({ ...corpsForm, status: e.target.value })}>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCorpsModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSaveCorps} disabled={corpsSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50">
                {corpsSaving ? 'Sauvegarde…' : editCorpsItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
