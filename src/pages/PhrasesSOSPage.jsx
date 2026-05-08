/**
 * PhrasesSOSPage — Gestion du module S.O.S. LANGUES
 *
 * Deux onglets :
 *  1. Phrases vitales (catégorie "urgence") — remplacent les 10 phrases hardcodées si présentes en API
 *  2. Où j'ai mal ? (catégorie "corps")     — 8 parties du corps × 8 langues
 */
import { useEffect, useState, useRef } from 'react';
import { phrasesAdminAPI, languagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FileUploadField from '../components/FileUploadField';
import {
  ExclamationTriangleIcon, PlusIcon, PencilIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon,
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
];

// ─── Catégories d'emojis pour le sélecteur ───────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    label: '🆘 Urgences',
    emojis: ['🆘','🚨','⚠️','🔥','💥','🚑','🚒','🚓','🆘','📢','❗','🛑'],
  },
  {
    label: '🏥 Santé',
    emojis: ['🤕','🩺','💊','🏥','👨‍⚕️','🩹','🩻','🧬','💉','🌡️','😷','🫀'],
  },
  {
    label: '💧 Besoins vitaux',
    emojis: ['💧','🌊','🍞','🍽️','🛏️','🌡️','❄️','☀️','⚡','🌪️','🌧️','🏠'],
  },
  {
    label: '🗺️ Localisation',
    emojis: ['🗺️','📍','📌','🧭','✈️','🚗','🚌','🚢','🏔️','🏝️','🌆','🏕️'],
  },
  {
    label: '👥 Personnes',
    emojis: ['👨‍👩‍👧','👫','👨','👩','👶','🧑‍🤝‍🧑','👴','👵','👮','🧑‍⚕️','🧑‍🚒','🧑‍✈️'],
  },
  {
    label: '📞 Communication',
    emojis: ['📞','📱','📣','🔔','💬','✉️','🆘','🏳️','🏴','🚩','📡','🔍'],
  },
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

const EMPTY_URGENCE_FORM = { languageId: '', phrase: '', transcription: '', traduction: '', contexte: '🆘', audioUrl: '', status: 'PUBLISHED' };
const EMPTY_CORPS_FORM   = { languageId: '', bodyPartId: 'tete', phrase: '', transcription: '', audioUrl: '', status: 'PUBLISHED' };

// ─── Composant sélecteur d'emoji ─────────────────────────────────────────────
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const ref = useRef(null);

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (emoji) => { onChange(emoji); setOpen(false); };

  const handleCustom = (e) => {
    const val = e.target.value;
    setCustomInput(val);
    // Prendre le dernier caractère unicode "emoji" saisi
    const chars = [...val];
    if (chars.length > 0) onChange(chars[chars.length - 1]);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Contexte (emoji) *</label>

      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 w-full border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-3xl leading-none">{value || '❓'}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-700">Emoji sélectionné</p>
          <p className="text-xs text-gray-400">Cliquez pour changer</p>
        </div>
        {open ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
      </button>

      {/* Panneau de sélection */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          {/* Input personnalisé */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Saisir ou coller un emoji personnalisé</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={handleCustom}
                placeholder="Coller ou taper un emoji…"
                className="input flex-1 text-lg"
              />
              {customInput && (
                <button
                  type="button"
                  onClick={() => select([...customInput].pop())}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  ✓ Utiliser
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            {/* Onglets catégories */}
            <div className="flex gap-1 flex-wrap mb-3">
              {EMOJI_CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveCat(i)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeCat === i ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grille d'emojis */}
            <div className="grid grid-cols-6 gap-1">
              {EMOJI_CATEGORIES[activeCat].emojis.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(e)}
                  className={`text-2xl p-2 rounded-xl hover:bg-gray-100 transition-colors ${
                    value === e ? 'bg-primary-100 ring-2 ring-primary-400' : ''
                  }`}
                >
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

  const [activeTab, setActiveTab]   = useState('urgence');
  const [languages, setLanguages]   = useState([]);
  const [langMap, setLangMap]       = useState({});
  const [loading, setLoading]       = useState(true);

  // ── Urgence ──
  const [urgencePhrases, setUrgencePhrases]   = useState({});
  const [showUrgenceModal, setShowUrgenceModal] = useState(false);
  const [editUrgenceItem, setEditUrgenceItem]   = useState(null);
  const [urgenceForm, setUrgenceForm]           = useState(EMPTY_URGENCE_FORM);
  const [urgenceSaving, setUrgenceSaving]       = useState(false);
  const [selectedLangUrgence, setSelectedLangUrgence] = useState(null);

  // ── Corps ──
  const [corpsPhrases, setCorpsPhrases]   = useState({});
  const [showCorpsModal, setShowCorpsModal] = useState(false);
  const [editCorpsItem, setEditCorpsItem]   = useState(null);
  const [corpsForm, setCorpsForm]           = useState(EMPTY_CORPS_FORM);
  const [corpsSaving, setCorpsSaving]       = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [selectedLangCorps, setSelectedLangCorps] = useState(null);

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    languagesAPI.getAll()
      .then(({ data }) => {
        setLanguages(data);
        const map = {};
        data.forEach(l => { map[l.code] = l; });
        setLangMap(map);
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
      (urgRes.data?.data || []).forEach(p => { const c = p.language?.code; if (c && uByCode[c]) uByCode[c].push(p); });
      (corpsRes.data?.data || []).forEach(p => { const c = p.language?.code; if (c && cByCode[c]) cByCode[c].push(p); });
      setUrgencePhrases(uByCode);
      setCorpsPhrases(cByCode);
    } catch { toast.error('Erreur de chargement', { id: 'sos-load' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (Object.keys(langMap).length > 0) loadAll(); }, [langMap]);

  // ─── Urgence handlers ──────────────────────────────────────────────────────
  const openAddUrgence = (langCode) => {
    const lang = langMap[langCode];
    setEditUrgenceItem(null);
    setUrgenceForm({ ...EMPTY_URGENCE_FORM, languageId: lang?.id || '' });
    setSelectedLangUrgence(SOS_LANGUAGES.find(l => l.code === langCode));
    setShowUrgenceModal(true);
  };

  const openEditUrgence = (p) => {
    setEditUrgenceItem(p);
    setUrgenceForm({
      languageId: p.languageId || '',
      phrase: p.phrase || '',
      transcription: p.transcription || '',
      traduction: p.traduction || '',
      contexte: p.contexte || '🆘',
      audioUrl: p.audioUrl || '',
      status: p.status || 'PUBLISHED',
    });
    setSelectedLangUrgence(SOS_LANGUAGES.find(l => l.code === p.language?.code));
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

  // ─── Corps handlers ────────────────────────────────────────────────────────
  const openAddCorps = (langCode, bodyPart) => {
    const lang = langMap[langCode];
    setEditCorpsItem(null);
    setCorpsForm({ ...EMPTY_CORPS_FORM, languageId: lang?.id || '', bodyPartId: bodyPart.id });
    setSelectedBodyPart(bodyPart);
    setSelectedLangCorps(SOS_LANGUAGES.find(l => l.code === langCode));
    setShowCorpsModal(true);
  };

  const openEditCorps = (p) => {
    const bodyPart = BODY_PARTS.find(b => b.id === p.contexte) || BODY_PARTS[0];
    setEditCorpsItem(p);
    setCorpsForm({
      languageId: p.languageId || '',
      bodyPartId: p.contexte || 'tete',
      phrase: p.phrase || '',
      transcription: p.transcription || '',
      audioUrl: p.audioUrl || '',
      status: p.status || 'PUBLISHED',
    });
    setSelectedBodyPart(bodyPart);
    setSelectedLangCorps(SOS_LANGUAGES.find(l => l.code === p.language?.code));
    setShowCorpsModal(true);
  };

  const handleSaveCorps = async () => {
    if (!corpsForm.languageId || !corpsForm.phrase) { toast.error('Langue et phrase sont requis'); return; }
    const bodyPart = BODY_PARTS.find(b => b.id === corpsForm.bodyPartId) || BODY_PARTS[0];
    setCorpsSaving(true);
    const payload = {
      languageId: corpsForm.languageId,
      phrase: corpsForm.phrase.trim(),
      transcription: corpsForm.transcription.trim() || null,
      traduction: bodyPart.fr,
      categorie: 'corps',
      contexte: corpsForm.bodyPartId,
      audioUrl: corpsForm.audioUrl.trim() || null,
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
    if (!confirm(`Supprimer la phrase pour "${BODY_PARTS.find(b=>b.id===p.contexte)?.label || p.contexte}" ?`)) return;
    try { await phrasesAdminAPI.delete(p.id); toast.success('Supprimée'); loadAll(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const totalUrgence    = Object.values(urgencePhrases).reduce((s, a) => s + a.length, 0);
  const langsWithUrgence = SOS_LANGUAGES.filter(l => (urgencePhrases[l.code]?.length || 0) > 0).length;
  const totalCorps      = Object.values(corpsPhrases).reduce((s, a) => s + a.length, 0);
  const corpsMaxPossible = SOS_LANGUAGES.length * BODY_PARTS.length;
  const corpsCovered    = SOS_LANGUAGES.reduce((s, l) => {
    const ids = new Set((corpsPhrases[l.code] || []).map(p => p.contexte));
    return s + BODY_PARTS.filter(b => ids.has(b.id)).length;
  }, 0);

  const findCorpsPhrase = (langCode, bodyPartId) =>
    (corpsPhrases[langCode] || []).find(p => p.contexte === bodyPartId);

  return (
    <div className="p-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
            Phrases SOS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Contenu de l'écran <strong>S.O.S. LANGUES</strong> — phrases vitales + carte corporelle
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-red-600">{totalUrgence}</p><p className="text-sm text-gray-500">Phrases vitales en DB</p></div>
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-gray-800">{langsWithUrgence}/8</p><p className="text-sm text-gray-500">Langues couvertes (urgence)</p></div>
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-orange-600">{totalCorps}</p><p className="text-sm text-gray-500">Phrases corps en DB</p></div>
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-blue-600">{corpsCovered}/{corpsMaxPossible}</p><p className="text-sm text-gray-500">Combos langue×partie couverts</p></div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: 'urgence', label: '🆘 Phrases vitales' },
          { key: 'corps',   label: '🤕 Où j\'ai mal ?' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors -mb-px ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-gray-200 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i=><div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}</div>
      ) : (
        <>
          {/* ═══ ONGLET URGENCE ═══════════════════════════════════════════ */}
          {activeTab === 'urgence' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <strong>Mécanisme :</strong> si l'API contient des phrases pour une langue, elles <em>remplacent</em> les 10 phrases intégrées dans le mobile.
                Le champ <strong>Contexte</strong> = emoji affiché devant la phrase.
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SOS_LANGUAGES.map(lang => {
                  const phrases = urgencePhrases[lang.code] || [];
                  const hasApi = phrases.length > 0;
                  return (
                    <div key={lang.code} className={`card border-2 transition-colors ${hasApi ? 'border-green-200 bg-green-50/40' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{lang.flag}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{lang.name}</p>
                            <p className="text-xs text-gray-500">{phrases.length} / 10</p>
                          </div>
                        </div>
                        {hasApi ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <XCircleIcon className="w-5 h-5 text-gray-300"/>}
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full mb-3">
                        <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(100,(phrases.length/10)*100)}%` }}/>
                      </div>
                      {phrases.length > 0 && (
                        <div className="space-y-1 mb-2 max-h-28 overflow-y-auto">
                          {phrases.map(p => (
                            <div key={p.id} className="flex items-center gap-1.5 text-xs group">
                              <span>{p.contexte || '🆘'}</span>
                              <span className="flex-1 text-gray-600 truncate">{p.traduction}</span>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                                <button onClick={()=>openEditUrgence(p)} className="p-0.5 text-gray-400 hover:text-primary-500"><PencilIcon className="w-3 h-3"/></button>
                                {isAdmin && <button onClick={()=>handleDeleteUrgence(p)} className="p-0.5 text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3"/></button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!hasApi && <p className="text-xs text-gray-400 italic mb-2">Utilise les 10 phrases intégrées</p>}
                      <button onClick={()=>openAddUrgence(lang.code)} disabled={!langMap[lang.code]}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40">
                        <PlusIcon className="w-3.5 h-3.5"/> Ajouter
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ ONGLET CORPS ═════════════════════════════════════════════ */}
          {activeTab === 'corps' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
                <strong>Carte corporelle :</strong> 8 parties du corps × 8 langues. Le champ <code>contexte</code> = identifiant mobile (tete, gorge…). Seule la phrase en <strong>langue locale</strong> est à saisir.
                <br/><span className="text-orange-500 font-medium">⚠️ Mise à jour mobile requise pour activer l'API (en cours).</span>
              </div>
              <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600 w-36">Partie du corps</th>
                      {SOS_LANGUAGES.map(l=>(
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
                    {BODY_PARTS.map(bp=>(
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
                        {SOS_LANGUAGES.map(lang=>{
                          const existing = findCorpsPhrase(lang.code, bp.id);
                          return (
                            <td key={lang.code} className="px-3 py-3 text-center">
                              {existing ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-xs text-gray-600 max-w-[90px] truncate" title={existing.phrase}>{existing.phrase}</span>
                                  <div className="flex gap-1">
                                    <button onClick={()=>openEditCorps(existing)} className="p-1 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded transition-colors" title="Modifier"><PencilIcon className="w-3.5 h-3.5"/></button>
                                    {isAdmin && <button onClick={()=>handleDeleteCorps(existing)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Supprimer"><TrashIcon className="w-3.5 h-3.5"/></button>}
                                  </div>
                                  {existing.audioUrl && <span className="text-xs text-green-500">🎵</span>}
                                </div>
                              ) : (
                                <button onClick={()=>openAddCorps(lang.code, bp)} disabled={!langMap[lang.code]}
                                  className="inline-flex items-center gap-0.5 px-2 py-1 text-xs text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-30">
                                  <PlusIcon className="w-3 h-3"/> Ajouter
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Barres de couverture par langue */}
              <div className="grid grid-cols-4 gap-2">
                {SOS_LANGUAGES.map(lang=>{
                  const phrases = corpsPhrases[lang.code] || [];
                  const ids = new Set(phrases.map(p=>p.contexte));
                  const count = BODY_PARTS.filter(b=>ids.has(b.id)).length;
                  return (
                    <div key={lang.code} className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{lang.name}</p>
                        <div className="h-1 bg-gray-200 rounded-full mt-1">
                          <div className="h-1 rounded-full bg-orange-400" style={{ width:`${(count/8)*100}%` }}/>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{count}/8</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Phrase vitale (urgence)
      ══════════════════════════════════════════════════════════════════════ */}
      {showUrgenceModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editUrgenceItem ? 'Modifier la phrase vitale' : 'Nouvelle phrase vitale'}
            </h2>
            {selectedLangUrgence && (
              <p className="text-sm text-gray-500 mb-5">
                {selectedLangUrgence.flag} <strong>{selectedLangUrgence.name}</strong>
              </p>
            )}

            <div className="space-y-4">
              {/* Langue (ajout seulement) */}
              {!editUrgenceItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={urgenceForm.languageId} onChange={e=>setUrgenceForm({...urgenceForm,languageId:e.target.value})}>
                    <option value="">-- Sélectionner --</option>
                    {SOS_LANGUAGES.map(l=>langMap[l.code]&&(
                      <option key={l.code} value={langMap[l.code].id}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sélecteur d'emoji */}
              <EmojiPicker value={urgenceForm.contexte} onChange={v=>setUrgenceForm({...urgenceForm,contexte:v})} />

              {/* Phrase locale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phrase en langue locale *</label>
                <input className="input" value={urgenceForm.phrase} onChange={e=>setUrgenceForm({...urgenceForm,phrase:e.target.value})} placeholder="ex: A dɛmɛ n'na !"/>
              </div>

              {/* Transcription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                <input className="input" value={urgenceForm.transcription} onChange={e=>setUrgenceForm({...urgenceForm,transcription:e.target.value})}/>
              </div>

              {/* Traduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française *</label>
                <input className="input" value={urgenceForm.traduction} onChange={e=>setUrgenceForm({...urgenceForm,traduction:e.target.value})} placeholder="ex: Aidez-moi ! Au secours !"/>
              </div>

              {/* Audio upload */}
              <FileUploadField
                type="audio"
                label="Fichier audio"
                value={urgenceForm.audioUrl}
                onChange={url=>setUrgenceForm({...urgenceForm,audioUrl:url})}
              />

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select className="input" value={urgenceForm.status} onChange={e=>setUrgenceForm({...urgenceForm,status:e.target.value})}>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowUrgenceModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSaveUrgence} disabled={urgenceSaving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                {urgenceSaving ? 'Sauvegarde…' : editUrgenceItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — Partie du corps (corps)
      ══════════════════════════════════════════════════════════════════════ */}
      {showCorpsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editCorpsItem ? 'Modifier la phrase corporelle' : 'Nouvelle phrase corporelle'}
            </h2>
            {selectedBodyPart && selectedLangCorps && (
              <p className="text-sm text-gray-500 mb-5">
                {selectedBodyPart.emoji} <strong>{selectedBodyPart.label}</strong> — {selectedLangCorps.flag} <strong>{selectedLangCorps.name}</strong>
              </p>
            )}

            <div className="space-y-4">
              {/* Langue */}
              {!editCorpsItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={corpsForm.languageId} onChange={e=>setCorpsForm({...corpsForm,languageId:e.target.value})}>
                    <option value="">-- Sélectionner --</option>
                    {SOS_LANGUAGES.map(l=>langMap[l.code]&&(
                      <option key={l.code} value={langMap[l.code].id}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sélecteur de partie du corps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partie du corps</label>
                <div className="grid grid-cols-4 gap-2">
                  {BODY_PARTS.map(bp=>(
                    <button key={bp.id} type="button" onClick={()=>setCorpsForm({...corpsForm,bodyPartId:bp.id})}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                        corpsForm.bodyPartId===bp.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}>
                      <span className="text-xl">{bp.emoji}</span>
                      {bp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traduction FR fixe */}
              {corpsForm.bodyPartId && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500">
                  <span className="font-medium">Traduction FR (fixe) :</span>{' '}
                  {BODY_PARTS.find(b=>b.id===corpsForm.bodyPartId)?.fr}
                </div>
              )}

              {/* Phrase locale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phrase en langue locale *</label>
                <input className="input" value={corpsForm.phrase} onChange={e=>setCorpsForm({...corpsForm,phrase:e.target.value})}
                  placeholder="ex: Dimi bɛ n' kun na."/>
                <p className="text-xs text-gray-400 mt-1">Phrase complète prononcée par le mobile</p>
              </div>

              {/* Transcription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                <input className="input" value={corpsForm.transcription} onChange={e=>setCorpsForm({...corpsForm,transcription:e.target.value})}/>
              </div>

              {/* Audio upload */}
              <FileUploadField
                type="audio"
                label="Fichier audio"
                value={corpsForm.audioUrl}
                onChange={url=>setCorpsForm({...corpsForm,audioUrl:url})}
              />

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select className="input" value={corpsForm.status} onChange={e=>setCorpsForm({...corpsForm,status:e.target.value})}>
                  <option value="PUBLISHED">Publiée</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={()=>setShowCorpsModal(false)} className="btn-secondary flex-1">Annuler</button>
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
