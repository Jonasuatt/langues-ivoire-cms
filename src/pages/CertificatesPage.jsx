import { useEffect, useState, useCallback } from 'react';
import { certificatesAPI, languagesAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import LanguageSelect from '../components/LanguageSelect';
import FileUploadField from '../components/FileUploadField';
import {
  AcademicCapIcon, PlusIcon, MagnifyingGlassIcon,
  InformationCircleIcon, XMarkIcon, StarIcon,
  DocumentTextIcon, TrophyIcon, PencilIcon, CheckIcon, SwatchIcon,
  PhotoIcon, ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

// ── Certificats ─────────────────────────────────────────────────────────────
const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1'];
const NIVEAU_LABELS = {
  A1: 'Débutant', A2: 'Élémentaire',
  B1: 'Intermédiaire', B2: 'Intermédiaire avancé', C1: 'Avancé',
};
const NIVEAU_COLORS = {
  A1: { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  ring: 'ring-green-300'  },
  A2: { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-300',   ring: 'ring-teal-300'   },
  B1: { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300',   ring: 'ring-blue-300'   },
  B2: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', ring: 'ring-purple-300' },
  C1: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300',  ring: 'ring-amber-300'  },
};

// ── Diplômes ─────────────────────────────────────────────────────────────────
const DIPLOME_TYPES = [
  {
    cle:         'MAITRISE',
    nom:         'Diplôme de Maîtrise',
    description: 'Tous les niveaux A1→C1 complétés pour une langue',
    emoji:       '🏆',
    auto:        true,
    couleur:     { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-400', badge: 'bg-amber-100 text-amber-800' },
  },
  {
    cle:         'EXCELLENCE',
    nom:         'Mention Excellence',
    description: 'Résultats exceptionnels et progression remarquable',
    emoji:       '⭐',
    auto:        false,
    couleur:     { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-400', badge: 'bg-yellow-100 text-yellow-800' },
  },
  {
    cle:         'CONTRIBUTION',
    nom:         'Diplôme de Contribution',
    description: 'Contribution active au dictionnaire ou aux ressources',
    emoji:       '✍️',
    auto:        false,
    couleur:     { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-400', badge: 'bg-blue-100 text-blue-800' },
  },
  {
    cle:         'AMBASSADEUR',
    nom:         'Diplôme Ambassadeur',
    description: 'Promotion exemplaire des langues ivoiriennes',
    emoji:       '🌍',
    auto:        false,
    couleur:     { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-400', badge: 'bg-green-100 text-green-800' },
  },
  {
    cle:         'PARTICIPATION',
    nom:         'Attestation de Participation',
    description: 'Participation à un événement ou programme officiel',
    emoji:       '📜',
    auto:        false,
    couleur:     { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-400', badge: 'bg-gray-100 text-gray-700' },
  },
];

function diplomeOf(cle) {
  return DIPLOME_TYPES.find(d => d.cle === cle) || DIPLOME_TYPES[0];
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Recherche utilisateur (partagée) ────────────────────────────────────────
function UserPicker({ value, onChange }) {
  const [search,  setSearch]  = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      adminAPI.getUsers({ search, limit: 8 })
        .then(({ data }) => setResults(data.data || data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  if (value) {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {value.prenom?.[0]}{value.nom?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{value.prenom} {value.nom}</p>
          <p className="text-xs text-gray-500 truncate">{value.email}</p>
        </div>
        <button onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500 p-1">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
      <input
        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
        placeholder="Rechercher par nom ou email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
      />
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
          {results.map(u => (
            <button key={u.id}
              onClick={() => { onChange(u); setSearch(''); setResults([]); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                {u.prenom?.[0]}{u.nom?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{u.prenom} {u.nom}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal — Émettre un certificat ────────────────────────────────────────────
function ModalCertificat({ languages, onSave, onClose }) {
  const [user,    setUser]    = useState(null);
  const [langId,  setLangId]  = useState(languages[0]?.id || '');
  const [niveau,  setNiveau]  = useState('A1');
  const [saving,  setSaving]  = useState(false);

  async function submit() {
    if (!user)   { toast.error('Sélectionnez un utilisateur'); return; }
    if (!langId) { toast.error('Sélectionnez une langue');     return; }
    setSaving(true);
    try {
      await certificatesAPI.issue({
        userId: user.id, languageId: langId, niveau, type: 'CERTIFICAT',
      });
      toast.success(`Certificat ${niveau} émis pour ${user.prenom} ${user.nom}`);
      onSave();
    } catch (err) {
      if (err.response?.status === 409)
        toast.error('Ce certificat existe déjà pour cet utilisateur');
      else
        toast.error(err.response?.data?.error || 'Erreur lors de l\'émission');
    } finally { setSaving(false); }
  }

  const lang = languages.find(l => l.id === langId);
  const col  = NIVEAU_COLORS[niveau];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-primary-600" /> Émettre un certificat
          </h2>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur *</label>
            <UserPicker value={user} onChange={setUser} />
          </div>

          {/* Langue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
            <LanguageSelect
              languages={languages}
              value={langId || ''}
              onChange={setLangId}
              allLabel="— Choisir —"
              showAll={false}
              className="w-full"
            />
          </div>

          {/* Niveau */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
            <div className="grid grid-cols-5 gap-2">
              {NIVEAUX.map(n => {
                const c = NIVEAU_COLORS[n];
                return (
                  <button key={n} onClick={() => setNiveau(n)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      niveau === n
                        ? `${c.bg} ${c.text} ${c.border}`
                        : 'border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}>
                    {n}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">{NIVEAU_LABELS[niveau]}</p>
          </div>

          {/* Aperçu */}
          {user && langId && (
            <div className={`p-4 rounded-xl border-2 ${col.bg} ${col.border} text-center`}>
              <AcademicCapIcon className={`w-7 h-7 mx-auto mb-1.5 ${col.text}`} />
              <p className={`text-xs uppercase tracking-widest mb-0.5 ${col.text} opacity-70`}>Langues Ivoire</p>
              <p className={`font-bold text-base ${col.text}`}>{user.prenom} {user.nom}</p>
              <p className={`text-sm mt-1 ${col.text} opacity-80`}>Niveau {niveau} — {NIVEAU_LABELS[niveau]}</p>
              <p className={`text-sm ${col.text} opacity-80`}>{lang?.nom}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit} disabled={saving || !user || !langId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
            <AcademicCapIcon className="w-4 h-4" />
            {saving ? 'Émission…' : 'Émettre'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal — Émettre un diplôme ───────────────────────────────────────────────
function ModalDiplome({ languages, onSave, onClose }) {
  const [user,       setUser]       = useState(null);
  const [typeKey,    setTypeKey]    = useState('MAITRISE');
  const [langId,     setLangId]     = useState('');
  const [mention,    setMention]    = useState('');
  const [saving,     setSaving]     = useState(false);

  const diplomeType = diplomeOf(typeKey);
  const needsLang   = ['MAITRISE', 'EXCELLENCE'].includes(typeKey);

  async function submit() {
    if (!user) { toast.error('Sélectionnez un utilisateur'); return; }
    if (needsLang && !langId) { toast.error('Sélectionnez une langue'); return; }
    setSaving(true);
    try {
      await certificatesAPI.issue({
        userId:      user.id,
        languageId:  langId || null,
        type:        'DIPLOME',
        specialite:  typeKey,
        mention:     mention.trim() || null,
        niveau:      null,
      });
      toast.success(`${diplomeType.nom} émis pour ${user.prenom} ${user.nom} 🎓`);
      onSave();
    } catch (err) {
      if (err.response?.status === 409)
        toast.error('Ce diplôme existe déjà pour cet utilisateur');
      else
        toast.error(err.response?.data?.error || 'Erreur lors de l\'émission');
    } finally { setSaving(false); }
  }

  const c = diplomeType.couleur;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-amber-500" /> Émettre un diplôme
          </h2>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">

          {/* Utilisateur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire *</label>
            <UserPicker value={user} onChange={setUser} />
          </div>

          {/* Type de diplôme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de diplôme *</label>
            <div className="space-y-2">
              {DIPLOME_TYPES.map(dt => (
                <button
                  key={dt.cle}
                  onClick={() => { setTypeKey(dt.cle); if (!['MAITRISE','EXCELLENCE'].includes(dt.cle)) setLangId(''); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    typeKey === dt.cle
                      ? `${dt.couleur.bg} ${dt.couleur.border}`
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{dt.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${typeKey === dt.cle ? dt.couleur.text : 'text-gray-800'}`}>
                        {dt.nom}
                      </span>
                      {dt.auto && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{dt.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    typeKey === dt.cle ? `${dt.couleur.border} bg-white` : 'border-gray-300'
                  }`}>
                    {typeKey === dt.cle && (
                      <div className={`w-full h-full rounded-full scale-50 ${dt.couleur.bg}`} style={{ transform: 'scale(0.55)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Langue (si nécessaire) */}
          {needsLang && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Langue concernée *
              </label>
              <LanguageSelect
                languages={languages}
                value={langId || ''}
                onChange={setLangId}
                allLabel="— Choisir une langue —"
                showAll={false}
                className="w-full"
              />
              {typeKey === 'MAITRISE' && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Le Diplôme de Maîtrise est normalement attribué automatiquement quand tous les niveaux A1→C1 sont validés.
                </p>
              )}
            </div>
          )}

          {/* Mention personnalisée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mention personnalisée <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              value={mention}
              onChange={e => setMention(e.target.value)}
              placeholder="ex: Pour excellence en contribution lexicale…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Aperçu diplôme */}
          {user && (
            <div className={`p-5 rounded-xl border-2 ${c.bg} ${c.border} text-center relative overflow-hidden`}>
              {/* Décoration */}
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
              <p className="text-xs uppercase tracking-[0.2em] mb-2 opacity-60" style={{ color: 'currentColor' }}>
                Langues Ivoire · République de Côte d'Ivoire
              </p>
              <p className="text-3xl mb-2">{diplomeType.emoji}</p>
              <p className={`text-lg font-bold ${c.text}`}>{diplomeType.nom}</p>
              <p className={`text-base font-semibold mt-1 ${c.text}`}>{user.prenom} {user.nom}</p>
              {langId && (
                <p className={`text-sm mt-1 opacity-80 ${c.text}`}>
                  {languages.find(l => l.id === langId)?.nom}
                </p>
              )}
              {mention && <p className={`text-xs italic mt-2 opacity-70 ${c.text}`}>« {mention} »</p>}
              <p className={`text-xs mt-3 opacity-50 ${c.text}`}>
                {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit} disabled={saving || !user || (needsLang && !langId)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
            <TrophyIcon className="w-4 h-4" />
            {saving ? 'Émission…' : 'Émettre le diplôme'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Panneau de gestion des modèles ──────────────────────────────────────────
const TEMPLATE_STORAGE_KEY = 'cert_templates_v1';

const DEFAULT_CERT_TEMPLATE = {
  accentColor: '#2563eb',
  bgColor: '#eff6ff',
  borderColor: '#93c5fd',
  organisationName: 'LANGUES IVOIRE',
  organisationSubtitle: 'République de Côte d\'Ivoire',
  certTitle: 'CERTIFICAT DE NIVEAU',
  footerText: 'Ce certificat atteste de la validation du niveau par notre système d\'évaluation.',
  signatureName: 'Direction Pédagogique',
  logoEmoji: '🎓',
  maquetteUrl: '', // URL de la maquette importée (Photoshop, Canva…)
};

const DEFAULT_DIPL_TEMPLATE = {
  accentColor: '#d97706',
  bgColor: '#fffbeb',
  borderColor: '#fcd34d',
  organisationName: 'LANGUES IVOIRE',
  organisationSubtitle: 'République de Côte d\'Ivoire',
  diplTitle: 'DIPLÔME D\'HONNEUR',
  footerText: 'Ce diplôme est décerné en reconnaissance des mérites exceptionnels.',
  signatureName: 'Direction Générale',
  logoEmoji: '🏆',
  maquetteUrl: '', // URL de la maquette importée (Photoshop, Canva…)
};

function loadTemplates() {
  try {
    const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        cert: { ...DEFAULT_CERT_TEMPLATE, ...parsed.cert },
        dipl: { ...DEFAULT_DIPL_TEMPLATE, ...parsed.dipl },
      };
    }
  } catch {}
  return { cert: { ...DEFAULT_CERT_TEMPLATE }, dipl: { ...DEFAULT_DIPL_TEMPLATE } };
}

function TemplatesPanel() {
  const [activeTpl, setActiveTpl] = useState('cert'); // 'cert' | 'dipl'
  const [templates, setTemplates] = useState(loadTemplates);
  const [saved, setSaved] = useState(false);

  const tpl = templates[activeTpl];
  const setTpl = (updates) => setTemplates(t => ({ ...t, [activeTpl]: { ...t[activeTpl], ...updates } }));

  const handleSave = () => {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    setSaved(true);
    toast.success('Modèle sauvegardé !');
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const def = activeTpl === 'cert' ? DEFAULT_CERT_TEMPLATE : DEFAULT_DIPL_TEMPLATE;
    setTemplates(t => ({ ...t, [activeTpl]: { ...def } }));
    toast.success('Modèle réinitialisé');
  };

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === 'color' ? (
        <div className="flex items-center gap-2">
          <input type="color" value={tpl[field]} onChange={e => setTpl({ [field]: e.target.value })}
            className="h-8 w-12 rounded border border-gray-200 cursor-pointer" />
          <input type="text" value={tpl[field]} onChange={e => setTpl({ [field]: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
      ) : (
        <input type={type} value={tpl[field]} placeholder={placeholder}
          onChange={e => setTpl({ [field]: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-400" />
      )}
    </div>
  );

  // Aperçu certificat
  const CertPreview = () => (
    <div className="rounded-2xl border-4 p-6 text-center relative overflow-hidden"
      style={{ backgroundColor: tpl.bgColor, borderColor: tpl.borderColor }}>
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: tpl.accentColor }} />
      <p className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold" style={{ color: tpl.accentColor, opacity: 0.7 }}>
        {tpl.organisationSubtitle}
      </p>
      <div className="text-4xl mb-2">{tpl.logoEmoji}</div>
      <p className="text-xs uppercase tracking-[0.2em] font-bold mb-1" style={{ color: tpl.accentColor }}>
        {tpl.organisationName}
      </p>
      <p className="text-lg font-bold uppercase tracking-wider mt-3 mb-1" style={{ color: tpl.accentColor }}>
        {activeTpl === 'cert' ? tpl.certTitle : tpl.diplTitle}
      </p>
      <p className="text-sm font-medium text-gray-700 mt-2">décerné à</p>
      <p className="text-xl font-bold text-gray-900 mt-1">Prénom Nom</p>
      <p className="text-sm text-gray-600 mt-1">Niveau B1 — Intermédiaire · Baoulé</p>
      <p className="text-xs text-gray-400 mt-4 leading-relaxed max-w-xs mx-auto">{tpl.footerText}</p>
      <div className="mt-4 pt-3 border-t" style={{ borderColor: tpl.borderColor }}>
        <p className="text-xs font-semibold" style={{ color: tpl.accentColor }}>{tpl.signatureName}</p>
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3">
        <SwatchIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-900">
          <p className="font-semibold mb-0.5">Personnalisation des modèles</p>
          <p className="text-xs leading-relaxed">
            Importez une maquette conçue sur Photoshop, Canva ou toute autre application graphique (PNG, JPG).
            Elle remplace l'aperçu généré. Sans maquette, l'aperçu automatique est utilisé.
          </p>
        </div>
      </div>

      {/* Onglets cert / diplôme */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[['cert', '🎓 Certificat'], ['dipl', '🏆 Diplôme']].map(([k, label]) => (
          <button key={k} onClick={() => setActiveTpl(k)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTpl === k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <PencilIcon className="w-4 h-4" /> Paramètres du modèle
          </h3>

          {/* Upload maquette */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-amber-800 flex items-center gap-2">
              <PhotoIcon className="w-4 h-4" />
              Maquette personnalisée {activeTpl === 'cert' ? '(Certificat)' : '(Diplôme)'}
            </p>
            <p className="text-xs text-amber-700">
              Importez un fichier PNG, JPG conçu sur Photoshop, Canva, Illustrator, etc.
              Il s'affichera dans l'aperçu à droite.
            </p>
            <FileUploadField
              type="image"
              value={tpl.maquetteUrl}
              onChange={url => setTpl({ maquetteUrl: url })}
            />
            {tpl.maquetteUrl && (
              <button
                onClick={() => setTpl({ maquetteUrl: '' })}
                className="text-xs text-red-500 hover:text-red-700 underline">
                Supprimer la maquette → utiliser l'aperçu automatique
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Paramètres de l'aperçu automatique</p>
            <Field label="Emoji / Logo" field="logoEmoji" placeholder="🎓" />
            <Field label="Nom de l'organisation" field="organisationName" />
            <Field label="Sous-titre organisation" field="organisationSubtitle" />
            <Field label={activeTpl === 'cert' ? "Titre du certificat" : "Titre du diplôme"} field={activeTpl === 'cert' ? 'certTitle' : 'diplTitle'} />
            <Field label="Couleur principale" field="accentColor" type="color" />
            <Field label="Couleur de fond" field="bgColor" type="color" />
            <Field label="Couleur de bordure" field="borderColor" type="color" />
            <Field label="Texte de bas de page" field="footerText" />
            <Field label="Nom du signataire" field="signatureName" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
              Réinitialiser
            </button>
            <button onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
              <CheckIcon className="w-4 h-4" />
              {saved ? 'Sauvegardé !' : 'Sauvegarder le modèle'}
            </button>
          </div>
        </div>

        {/* Aperçu en direct */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            Aperçu en direct
            {tpl.maquetteUrl && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-normal">
                Maquette importée
              </span>
            )}
          </h3>
          {tpl.maquetteUrl ? (
            <div className="relative rounded-2xl overflow-hidden border-4 border-amber-300 shadow-lg">
              <img
                src={tpl.maquetteUrl}
                alt={`Maquette ${activeTpl === 'cert' ? 'Certificat' : 'Diplôme'}`}
                className="w-full object-contain"
                style={{ maxHeight: 480 }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-2 font-medium">
                {activeTpl === 'cert' ? '🎓 Maquette Certificat' : '🏆 Maquette Diplôme'} — Conçue sur application graphique
              </div>
            </div>
          ) : (
            <CertPreview />
          )}
          <p className="text-xs text-gray-400 text-center mt-3">
            {tpl.maquetteUrl
              ? 'Maquette personnalisée active — supprimez-la pour revenir à l\'aperçu automatique'
              : 'Aperçu automatique — importez une maquette ci-contre pour la remplacer'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function CertificatesPage() {
  const [tab,       setTab]       = useState('certificats'); // 'certificats' | 'diplomes'
  const [certs,     setCerts]     = useState([]);
  const [diplomes,  setDiplomes]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [languages, setLanguages] = useState([]);
  const [loading,   setLoading]   = useState(true);

  // Filtres
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterNiveau,   setFilterNiveau]   = useState('');
  const [filterType,     setFilterType]     = useState('');

  // Modaux
  const [modalCert,   setModalCert]   = useState(false);
  const [modalDiplome,setModalDiplome]= useState(false);

  useEffect(() => {
    languagesAPI.getAll()
      .then(({ data }) => setLanguages(Array.isArray(data) ? data : data?.data ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    // Charger certificats
    const paramsCert = { type: 'CERTIFICAT' };
    if (filterLanguage) paramsCert.languageId = filterLanguage;
    if (filterNiveau)   paramsCert.niveau     = filterNiveau;

    // Charger diplômes
    const paramsDipl = { type: 'DIPLOME' };
    if (filterType) paramsDipl.specialite = filterType;

    Promise.all([
      certificatesAPI.getAll(paramsCert).catch(() => ({ data: { data: [], total: 0 } })),
      certificatesAPI.getAll(paramsDipl).catch(() => ({ data: { data: [], total: 0 } })),
    ]).then(([r1, r2]) => {
      const c = Array.isArray(r1.data) ? r1.data : r1.data?.data ?? [];
      const d = Array.isArray(r2.data) ? r2.data : r2.data?.data ?? [];
      setCerts(c);
      setDiplomes(d);
      setTotal(c.length + d.length);
    }).finally(() => setLoading(false));
  }, [filterLanguage, filterNiveau, filterType]);

  useEffect(() => { load(); }, [load]);

  // Stats
  const countByNiveau = NIVEAUX.reduce((acc, n) => {
    acc[n] = certs.filter(c => c.niveau === n).length;
    return acc;
  }, {});
  const countByDiplome = DIPLOME_TYPES.reduce((acc, d) => {
    acc[d.cle] = diplomes.filter(x => x.specialite === d.cle || x.niveau === d.cle).length;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificats & Diplômes</h1>
            <p className="text-sm text-gray-500">
              {certs.length} certificat{certs.length !== 1 ? 's' : ''} · {diplomes.length} diplôme{diplomes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalCert(true)}
            className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 bg-primary-50 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <AcademicCapIcon className="w-4 h-4" /> Certificat
          </button>
          <button
            onClick={() => setModalDiplome(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            <TrophyIcon className="w-4 h-4" /> Diplôme
          </button>
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          ['certificats', '🎓 Certificats', certs.length],
          ['diplomes',    '🏆 Diplômes',    diplomes.length],
          ['modeles',     '🎨 Modèles',     null],
        ].map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
            {count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'
              }`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ CERTIFICATS ══════════════ */}
      {tab === 'certificats' && (
        <>
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-0.5">À propos des certificats</p>
              <p className="text-xs leading-relaxed">
                Émis <strong>manuellement</strong> ici ou <strong>automatiquement</strong> quand un utilisateur complète toutes les leçons d'un niveau.
                L'utilisateur reçoit une <strong>notification push</strong> et accède à son certificat depuis son profil.
                Quand les 5 niveaux A1→C1 sont validés, un <strong>Diplôme de Maîtrise</strong> est généré automatiquement.
              </p>
            </div>
          </div>

          {/* Stats niveaux */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            {NIVEAUX.map(n => {
              const col = NIVEAU_COLORS[n];
              return (
                <div key={n} className={`rounded-xl p-4 border ${col.bg} ${col.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wide ${col.text}`}>{n}</span>
                    <AcademicCapIcon className={`w-4 h-4 ${col.text}`} />
                  </div>
                  <p className={`text-2xl font-bold ${col.text}`}>{countByNiveau[n]}</p>
                  <p className={`text-xs ${col.text} opacity-70`}>{NIVEAU_LABELS[n]}</p>
                </div>
              );
            })}
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <LanguageSelect
              languages={languages}
              value={filterLanguage}
              onChange={setFilterLanguage}
              className="w-48"
            />
            <select
              value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="">Tous les niveaux</option>
              {NIVEAUX.map(n => <option key={n} value={n}>{n} — {NIVEAU_LABELS[n]}</option>)}
            </select>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : certs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">Aucun certificat dans ce filtre</p>
              <button onClick={() => setModalCert(true)}
                className="mt-4 text-sm text-primary-600 hover:underline">
                Émettre le premier certificat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map(c => {
                const col = NIVEAU_COLORS[c.niveau] || NIVEAU_COLORS.A1;
                return (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${col.bg} ${col.border}`}>
                      <span className={`text-lg font-bold ${col.text}`}>{c.niveau}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{c.user?.prenom} {c.user?.nom}</span>
                        <span className="text-xs text-gray-400 truncate">{c.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.bg} ${col.text}`}>
                          {c.niveau} — {NIVEAU_LABELS[c.niveau]}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {c.language?.nom}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Émis le</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(c.issuedAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════ DIPLÔMES ══════════════ */}
      {tab === 'diplomes' && (
        <>
          {/* Info génération automatique */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-3">
            <TrophyIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">🏆 Comment sont générés les diplômes ?</p>
              <div className="text-xs leading-relaxed space-y-1">
                <p>
                  <strong>🤖 Automatiquement</strong> — Le <em>Diplôme de Maîtrise</em> est généré par le système
                  dès qu'un utilisateur obtient les 5 certificats A1, A2, B1, B2 et C1 pour une même langue.
                  L'utilisateur reçoit une notification push et trouve son diplôme dans son profil.
                </p>
                <p>
                  <strong>✋ Manuellement</strong> — Les autres types (Excellence, Contribution, Ambassadeur, Participation)
                  sont émis ici par un administrateur pour récompenser des mérites spécifiques.
                </p>
              </div>
            </div>
          </div>

          {/* Stats par type */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            {DIPLOME_TYPES.map(dt => {
              const c  = dt.couleur;
              const nb = countByDiplome[dt.cle] ?? 0;
              return (
                <div key={dt.cle} className={`rounded-xl p-3 border ${c.bg} ${c.border}`}>
                  <p className="text-2xl mb-1">{dt.emoji}</p>
                  <p className={`text-xl font-bold ${c.text}`}>{nb}</p>
                  <p className={`text-xs ${c.text} opacity-80 leading-tight mt-0.5`}>{dt.nom}</p>
                  {dt.auto && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full mt-1 inline-block">Auto</span>}
                </div>
              );
            })}
          </div>

          {/* Filtre type */}
          <div className="flex gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setFilterType('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !filterType ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tous ({diplomes.length})
            </button>
            {DIPLOME_TYPES.map(dt => (
              <button key={dt.cle}
                onClick={() => setFilterType(filterType === dt.cle ? '' : dt.cle)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === dt.cle
                    ? 'bg-amber-500 text-white'
                    : `${dt.couleur.badge} hover:opacity-80`
                }`}
              >
                {dt.emoji} {dt.nom.replace('Diplôme de ', '').replace('Diplôme ', '').replace('Mention ', '').replace('Attestation de ', '')}
              </button>
            ))}
          </div>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : diplomes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <TrophyIcon className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">Aucun diplôme émis pour l'instant</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Le premier sera généré automatiquement quand un utilisateur<br />obtiendra les 5 certificats A1→C1 d'une langue.
              </p>
              <button onClick={() => setModalDiplome(true)}
                className="text-sm text-amber-600 hover:underline">
                Ou émettre manuellement
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {diplomes.map(d => {
                const dt  = diplomeOf(d.specialite || d.niveau);
                const col = dt.couleur;
                return (
                  <div key={d.id} className={`bg-white rounded-xl border-l-4 shadow-sm p-4 flex items-center gap-4 ${col.border}`}>
                    {/* Médaillon */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-2xl border-2 ${col.bg} ${col.border}`}>
                      {dt.emoji}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{d.user?.prenom} {d.user?.nom}</span>
                        <span className="text-xs text-gray-400">{d.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.badge}`}>
                          {dt.emoji} {dt.nom}
                        </span>
                        {d.language && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {d.language.nom}
                          </span>
                        )}
                        {d.mention && (
                          <span className="text-xs italic text-gray-400">« {d.mention} »</span>
                        )}
                      </div>
                    </div>

                    {/* Date + source */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">Émis le</p>
                      <p className="text-sm font-medium text-gray-700">{formatDate(d.issuedAt)}</p>
                      {dt.auto && (
                        <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                          🤖 Auto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════ MODÈLES ══════════════ */}
      {tab === 'modeles' && <TemplatesPanel />}

      {/* ══════════════ MODAUX ══════════════ */}
      {modalCert && (
        <ModalCertificat
          languages={languages}
          onSave={() => { setModalCert(false); load(); }}
          onClose={() => setModalCert(false)}
        />
      )}
      {modalDiplome && (
        <ModalDiplome
          languages={languages}
          onSave={() => { setModalDiplome(false); load(); }}
          onClose={() => setModalDiplome(false)}
        />
      )}
    </div>
  );
}
