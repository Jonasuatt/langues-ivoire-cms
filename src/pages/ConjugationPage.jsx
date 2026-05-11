import { useEffect, useState, useCallback } from 'react';
import api, { languagesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  CheckIcon, PencilIcon, PlusIcon, TrashIcon, XMarkIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

// ── Données par défaut (initiales) ─────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { nom: 'Base',          emoji: '🔤', couleur: 'blue'   },
  { nom: 'Mouvement',     emoji: '🚶', couleur: 'orange' },
  { nom: 'Action',        emoji: '✋', couleur: 'green'  },
  { nom: 'Communication', emoji: '💬', couleur: 'purple' },
  { nom: 'Quotidien',     emoji: '🏠', couleur: 'teal'   },
  { nom: 'Sentiment',     emoji: '❤️', couleur: 'pink'   },
  { nom: 'Commerce',      emoji: '🛒', couleur: 'amber'  },
  { nom: 'Culture',       emoji: '🎭', couleur: 'stone'  },
  { nom: 'Perception',    emoji: '👁️', couleur: 'slate'  },
];

const DEFAULT_VERBES = [
  { fr: 'être',        cat: 'Base'          },
  { fr: 'avoir',       cat: 'Base'          },
  { fr: 'aller',       cat: 'Mouvement'     },
  { fr: 'venir',       cat: 'Mouvement'     },
  { fr: 'faire',       cat: 'Action'        },
  { fr: 'dire',        cat: 'Communication' },
  { fr: 'manger',      cat: 'Quotidien'     },
  { fr: 'boire',       cat: 'Quotidien'     },
  { fr: 'dormir',      cat: 'Quotidien'     },
  { fr: 'voir',        cat: 'Perception'    },
  { fr: 'entendre',    cat: 'Perception'    },
  { fr: 'parler',      cat: 'Communication' },
  { fr: 'donner',      cat: 'Action'        },
  { fr: 'prendre',     cat: 'Action'        },
  { fr: 'aimer',       cat: 'Sentiment'     },
  { fr: 'vouloir',     cat: 'Sentiment'     },
  { fr: 'pouvoir',     cat: 'Base'          },
  { fr: 'savoir',      cat: 'Base'          },
  { fr: 'travailler',  cat: 'Quotidien'     },
  { fr: 'acheter',     cat: 'Commerce'      },
  { fr: 'vendre',      cat: 'Commerce'      },
  { fr: 'saluer',      cat: 'Communication' },
  { fr: 'danser',      cat: 'Culture'       },
  { fr: 'chanter',     cat: 'Culture'       },
];

// Couleurs disponibles pour les catégories
const PALETTE = [
  { key: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { key: 'orange', bg: 'bg-orange-100', text: 'text-orange-700' },
  { key: 'green',  bg: 'bg-green-100',  text: 'text-green-700'  },
  { key: 'purple', bg: 'bg-purple-100', text: 'text-purple-700' },
  { key: 'teal',   bg: 'bg-teal-100',   text: 'text-teal-700'   },
  { key: 'pink',   bg: 'bg-pink-100',   text: 'text-pink-700'   },
  { key: 'amber',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  { key: 'stone',  bg: 'bg-stone-100',  text: 'text-stone-700'  },
  { key: 'slate',  bg: 'bg-slate-100',  text: 'text-slate-700'  },
  { key: 'red',    bg: 'bg-red-100',    text: 'text-red-700'    },
  { key: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { key: 'lime',   bg: 'bg-lime-100',   text: 'text-lime-700'   },
];

const catStyle = (couleur) => PALETTE.find(p => p.key === couleur) || PALETTE[0];

// ── Temps & pronoms ─────────────────────────────────────────────────────────
const TEMPS = [
  { key: 'present',   label: 'Présent'   },
  { key: 'passe',     label: 'Passé'     },
  { key: 'futur',     label: 'Futur'     },
  { key: 'imperatif', label: 'Impératif' },
];
const PRONOMS = [
  { key: '1s', label: 'Je'          },
  { key: '2s', label: 'Tu'          },
  { key: '3s', label: 'Il / Elle'   },
  { key: '1p', label: 'Nous'        },
  { key: '2p', label: 'Vous'        },
  { key: '3p', label: 'Ils / Elles' },
];
const PRONOMS_IMP = [
  { key: '2s', label: 'Tu'   },
  { key: '1p', label: 'Nous' },
  { key: '2p', label: 'Vous' },
];
const EMPTY_CONJ = {
  present:   { '1s':'','2s':'','3s':'','1p':'','2p':'','3p':'' },
  passe:     { '1s':'','2s':'','3s':'','1p':'','2p':'','3p':'' },
  futur:     { '1s':'','2s':'','3s':'','1p':'','2p':'','3p':'' },
  imperatif: { '2s':'','1p':'','2p':'' },
};

// ── Persistance localStorage ─────────────────────────────────────────────────
const LS_VERBES = 'li_conj_verbes_v2';
const LS_CATS   = 'li_conj_cats_v2';

function loadVerbes()    { try { return JSON.parse(localStorage.getItem(LS_VERBES)) || DEFAULT_VERBES; } catch { return DEFAULT_VERBES; } }
function loadCats()      { try { return JSON.parse(localStorage.getItem(LS_CATS))   || DEFAULT_CATEGORIES; } catch { return DEFAULT_CATEGORIES; } }
function saveVerbes(v)   { localStorage.setItem(LS_VERBES, JSON.stringify(v)); }
function saveCats(c)     { localStorage.setItem(LS_CATS,   JSON.stringify(c)); }

// ── Modaux ──────────────────────────────────────────────────────────────────
function ModalVerbe({ cats, initial, onSave, onClose }) {
  const [fr,  setFr]  = useState(initial?.fr  || '');
  const [cat, setCat] = useState(initial?.cat || (cats[0]?.nom || ''));

  function submit() {
    const val = fr.trim().toLowerCase();
    if (!val) { toast.error('Renseignez l\'infinitif du verbe.'); return; }
    if (!cat)  { toast.error('Choisissez une rubrique.'); return; }
    onSave({ fr: val, cat });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {initial ? '✏️ Modifier le verbe' : '➕ Nouveau verbe'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Infinitif français <span className="text-red-500">*</span>
            </label>
            <input
              type="text" value={fr} onChange={e => setFr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="ex: courir, chasser, planter…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rubrique <span className="text-red-500">*</span>
            </label>
            <select
              value={cat} onChange={e => setCat(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {cats.map(c => (
                <option key={c.nom} value={c.nom}>{c.emoji} {c.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
            {initial ? 'Enregistrer' : 'Ajouter le verbe'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalCategorie({ initial, onSave, onClose }) {
  const [nom,    setNom]    = useState(initial?.nom    || '');
  const [emoji,  setEmoji]  = useState(initial?.emoji  || '📚');
  const [couleur,setCouleur]= useState(initial?.couleur|| 'blue');

  function submit() {
    if (!nom.trim()) { toast.error('Renseignez le nom de la rubrique.'); return; }
    onSave({ nom: nom.trim(), emoji, couleur });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {initial ? '✏️ Modifier la rubrique' : '➕ Nouvelle rubrique'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={nom} onChange={e => setNom(e.target.value)}
                placeholder="ex: Nature, Famille…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
              <input
                type="text" value={emoji} onChange={e => setEmoji(e.target.value)}
                maxLength={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-center text-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map(p => (
                <button
                  key={p.key}
                  onClick={() => setCouleur(p.key)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    couleur === p.key ? 'border-gray-800 scale-110' : 'border-transparent'
                  } ${p.bg}`}
                  title={p.key}
                />
              ))}
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${catStyle(couleur).bg} ${catStyle(couleur).text}`}>
              {emoji} {nom || 'Ma rubrique'}
            </span>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={submit}
            className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
            {initial ? 'Enregistrer' : 'Créer la rubrique'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ─────────────────────────────────────────────────────────
export default function ConjugationPage() {
  const [languages,    setLanguages]    = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedVerbe,setSelectedVerbe]= useState(null);
  const [activeTense,  setActiveTense]  = useState('present');
  const [entriesMap,   setEntriesMap]   = useState({});
  const [loadingMap,   setLoadingMap]   = useState(false);
  const [entryId,      setEntryId]      = useState(null);
  const [motLocal,     setMotLocal]     = useState('');
  const [conj,         setConj]         = useState(EMPTY_CONJ);
  const [saving,       setSaving]       = useState(false);
  const [filterCat,    setFilterCat]    = useState('Tout');
  const [search,       setSearch]       = useState('');

  // ── Données dynamiques ──
  const [verbes, setVerbes] = useState(loadVerbes);
  const [cats,   setCats]   = useState(loadCats);

  // ── Modaux ──
  const [modalVerbe, setModalVerbe] = useState(null); // null | 'create' | verb object (edit)
  const [modalCat,   setModalCat]   = useState(null); // null | 'create' | cat object (edit)
  const [confirmDel, setConfirmDel] = useState(null); // { type: 'verbe'|'cat', item }
  const [viewCats,   setViewCats]   = useState(false);

  // ── Chargement langues ──
  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setLanguages(list);
      if (list.length) setSelectedLang(list[0].code);
    });
  }, []);

  // ── Chargement conjugaisons ──
  const loadEntries = useCallback(async () => {
    if (!selectedLang) return;
    setLoadingMap(true);
    try {
      const { data } = await api.get(`/dictionary/${selectedLang}`, {
        params: { tab: 'words', limit: 500, categorie: 'verbes' },
      });
      const map = {};
      for (const verb of verbes) {
        const found = (data.data || data || []).find(e =>
          e.traduction?.toLowerCase() === verb.fr.toLowerCase()
        );
        map[verb.fr] = found || null;
      }
      setEntriesMap(map);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoadingMap(false);
    }
  }, [selectedLang, verbes]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // ── Ouvrir un verbe ──
  const openVerbe = (verbe) => {
    setSelectedVerbe(verbe);
    setActiveTense('present');
    const entry = entriesMap[verbe.fr];
    if (entry) {
      setEntryId(entry.id);
      setMotLocal(entry.mot || '');
      setConj(entry.conjugaisons ? { ...EMPTY_CONJ, ...entry.conjugaisons } : EMPTY_CONJ);
    } else {
      setEntryId(null);
      setMotLocal('');
      setConj(EMPTY_CONJ);
    }
  };

  const setCell = (tense, pronKey, value) =>
    setConj(c => ({ ...c, [tense]: { ...c[tense], [pronKey]: value } }));

  // ── Sauvegarder conjugaison ──
  const handleSave = async () => {
    if (!motLocal.trim()) { toast.error('Le mot local est obligatoire'); return; }
    setSaving(true);
    try {
      if (entryId) {
        await api.patch(`/dictionary/admin/word/${entryId}`, {
          mot: motLocal, traduction: selectedVerbe.fr,
          categorie: 'verbes', conjugaisons: conj,
        });
        toast.success('Conjugaison sauvegardée !');
      } else {
        const { data: newEntry } = await api.post('/dictionary/admin/word', {
          langueCode: selectedLang, mot: motLocal, traduction: selectedVerbe.fr,
          categorie: 'verbes', conjugaisons: conj,
        });
        setEntryId(newEntry.id);
        toast.success('Entrée créée avec conjugaison !');
      }
      await loadEntries();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  // ── Gestion des verbes ──
  function addVerbe({ fr, cat }) {
    if (verbes.find(v => v.fr === fr)) {
      toast.error(`Le verbe "${fr}" existe déjà.`); return;
    }
    const updated = [...verbes, { fr, cat }];
    setVerbes(updated);
    saveVerbes(updated);
    setModalVerbe(null);
    toast.success(`Verbe "${fr}" ajouté !`);
  }

  function editVerbe(original, { fr, cat }) {
    const updated = verbes.map(v => v.fr === original.fr ? { fr, cat } : v);
    setVerbes(updated);
    saveVerbes(updated);
    if (selectedVerbe?.fr === original.fr) setSelectedVerbe({ fr, cat });
    setModalVerbe(null);
    toast.success('Verbe modifié.');
  }

  function deleteVerbe(verbe) {
    const updated = verbes.filter(v => v.fr !== verbe.fr);
    setVerbes(updated);
    saveVerbes(updated);
    if (selectedVerbe?.fr === verbe.fr) setSelectedVerbe(null);
    setConfirmDel(null);
    toast.success(`Verbe "${verbe.fr}" supprimé.`);
  }

  // ── Gestion des catégories ──
  function addCat({ nom, emoji, couleur }) {
    if (cats.find(c => c.nom.toLowerCase() === nom.toLowerCase())) {
      toast.error(`La rubrique "${nom}" existe déjà.`); return;
    }
    const updated = [...cats, { nom, emoji, couleur }];
    setCats(updated);
    saveCats(updated);
    setModalCat(null);
    toast.success(`Rubrique "${nom}" créée !`);
  }

  function editCat(original, { nom, emoji, couleur }) {
    const updated = cats.map(c => c.nom === original.nom ? { nom, emoji, couleur } : c);
    setCats(updated);
    saveCats(updated);
    // Mettre à jour les verbes qui utilisaient l'ancien nom
    if (original.nom !== nom) {
      const updV = verbes.map(v => v.cat === original.nom ? { ...v, cat: nom } : v);
      setVerbes(updV);
      saveVerbes(updV);
    }
    setModalCat(null);
    toast.success('Rubrique modifiée.');
  }

  function deleteCat(cat) {
    const nbVerbes = verbes.filter(v => v.cat === cat.nom).length;
    if (nbVerbes > 0) {
      toast.error(`Impossible : ${nbVerbes} verbe(s) utilisent cette rubrique.`);
      setConfirmDel(null); return;
    }
    const updated = cats.filter(c => c.nom !== cat.nom);
    setCats(updated);
    saveCats(updated);
    if (filterCat === cat.nom) setFilterCat('Tout');
    setConfirmDel(null);
    toast.success(`Rubrique "${cat.nom}" supprimée.`);
  }

  // ── Filtres + recherche ──
  const allCatNames = ['Tout', ...cats.map(c => c.nom)];
  const withConjCount = Object.values(entriesMap).filter(e => e?.conjugaisons).length;
  const pronoms = activeTense === 'imperatif' ? PRONOMS_IMP : PRONOMS;

  const filteredVerbes = verbes
    .filter(v => filterCat === 'Tout' || v.cat === filterCat)
    .filter(v => !search || v.fr.toLowerCase().includes(search.toLowerCase()));

  const catOf = (nom) => cats.find(c => c.nom === nom);

  return (
    <div className="flex h-full">

      {/* ══════════════ COLONNE GAUCHE ══════════════ */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">

        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900">Conjugaison</h1>
            <button
              onClick={() => setModalVerbe('create')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
              title="Ajouter un verbe"
            >
              <PlusIcon className="w-3.5 h-3.5" /> Verbe
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {withConjCount} / {verbes.length} verbes conjugués
          </p>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: verbes.length ? `${(withConjCount / verbes.length) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Sélecteur de langue */}
        <div className="px-4 py-3 border-b border-gray-100">
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={selectedLang}
            onChange={e => { setSelectedLang(e.target.value); setSelectedVerbe(null); }}
          >
            {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
          </select>
        </div>

        {/* Recherche */}
        <div className="px-4 py-2 border-b border-gray-100">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un verbe…"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* Filtre catégories */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-1 flex-wrap">
            {allCatNames.map(c => {
              const catObj = cats.find(x => x.nom === c);
              const style  = catObj ? catStyle(catObj.couleur) : null;
              return (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    filterCat === c
                      ? 'bg-teal-600 text-white'
                      : style
                        ? `${style.bg} ${style.text} hover:opacity-80`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {catObj?.emoji} {c}
                </button>
              );
            })}
            <button
              onClick={() => setModalCat('create')}
              className="text-xs px-2 py-1 rounded-full bg-gray-50 border border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-600 transition-colors"
              title="Nouvelle rubrique"
            >
              + rubrique
            </button>
          </div>
        </div>

        {/* Liste des verbes */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingMap ? (
            <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
          ) : filteredVerbes.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <p>Aucun verbe trouvé</p>
              <button onClick={() => setModalVerbe('create')}
                className="mt-2 text-teal-600 text-xs hover:underline">
                Ajouter un verbe
              </button>
            </div>
          ) : filteredVerbes.map(verb => {
            const entry    = entriesMap[verb.fr];
            const hasConj  = !!entry?.conjugaisons;
            const hasEntry = !!entry;
            const isActive = selectedVerbe?.fr === verb.fr;
            const cat      = catOf(verb.cat);
            const cs       = catStyle(cat?.couleur || 'blue');
            return (
              <div
                key={verb.fr}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl mb-1 transition-colors ${
                  isActive ? 'bg-teal-50 border border-teal-200' : 'hover:bg-gray-50'
                }`}
              >
                {/* Clic zone principale → ouvre éditeur */}
                <button
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  onClick={() => openVerbe(verb)}
                >
                  <span className="text-lg flex-shrink-0">{cat?.emoji || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold ${isActive ? 'text-teal-700' : 'text-gray-900'}`}>
                        {verb.fr}
                      </span>
                      {entry?.mot && (
                        <span className="text-xs text-gray-400 truncate">({entry.mot})</span>
                      )}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${cs.bg} ${cs.text}`}>
                      {verb.cat}
                    </span>
                  </div>
                </button>

                {/* Statut */}
                <div className="flex-shrink-0">
                  {hasConj ? (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  ) : hasEntry ? (
                    <PencilIcon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 inline-block" />
                  )}
                </div>

                {/* Actions (visible au hover) */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setModalVerbe(verb); }}
                    className="p-1 rounded hover:bg-teal-100 text-teal-500"
                    title="Modifier"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'verbe', item: verb }); }}
                    className="p-1 rounded hover:bg-red-100 text-red-400"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende + bouton rubriques */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Légende</span>
            <button
              onClick={() => setViewCats(true)}
              className="text-xs text-teal-600 hover:underline"
            >
              Gérer les rubriques
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckIcon className="w-3.5 h-3.5 text-green-500" /> Conjugaison complète
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <PencilIcon className="w-3.5 h-3.5 text-amber-400" /> Entrée sans conjugaison
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 inline-block" /> Non créé
          </div>
        </div>
      </div>

      {/* ══════════════ COLONNE DROITE ══════════════ */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">

        {/* ── Vue Gestion des rubriques ── */}
        {viewCats ? (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewCats(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 text-gray-500"
                >
                  ← Retour
                </button>
                <h2 className="text-xl font-bold text-gray-900">Gestion des rubriques</h2>
              </div>
              <button
                onClick={() => setModalCat('create')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <PlusIcon className="w-4 h-4" /> Nouvelle rubrique
              </button>
            </div>

            <div className="space-y-3">
              {cats.map(cat => {
                const cs = catStyle(cat.couleur);
                const nbVerbes = verbes.filter(v => v.cat === cat.nom).length;
                return (
                  <div key={cat.nom}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${cs.bg}`}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${cs.text}`}>{cat.nom}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cs.bg} ${cs.text}`}>
                          {cat.emoji} {cat.nom}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {nbVerbes} verbe{nbVerbes !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalCat(cat)}
                        className="p-2 rounded-lg hover:bg-teal-50 text-teal-500 border border-teal-100"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDel({ type: 'cat', item: cat })}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 border border-red-100"
                        title="Supprimer"
                        disabled={nbVerbes > 0}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        ) : !selectedVerbe ? (
          /* ── Écran d'accueil ── */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sélectionnez un verbe</h2>
            <p className="text-gray-400 text-sm max-w-xs">
              Choisissez un verbe dans la liste à gauche pour saisir ou modifier ses conjugaisons.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setModalVerbe('create')}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <PlusIcon className="w-4 h-4" /> Nouveau verbe
              </button>
              <button
                onClick={() => setViewCats(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                Gérer les rubriques
              </button>
            </div>
          </div>

        ) : (
          /* ── Éditeur de conjugaison ── */
          <>
            {/* Titre */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{catOf(selectedVerbe.cat)?.emoji || '📝'}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">{selectedVerbe.fr}</h2>
                  <p className="text-sm text-gray-500">
                    {languages.find(l => l.code === selectedLang)?.nom}
                    &nbsp;·&nbsp;
                    <span className={`text-xs px-1.5 py-0.5 rounded ${catStyle(catOf(selectedVerbe.cat)?.couleur).bg} ${catStyle(catOf(selectedVerbe.cat)?.couleur).text}`}>
                      {selectedVerbe.cat}
                    </span>
                  </p>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors">
                {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
              </button>
            </div>

            {/* Mot local */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Verbe en {languages.find(l => l.code === selectedLang)?.nom} *
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 max-w-sm"
                value={motLocal}
                onChange={e => setMotLocal(e.target.value)}
                placeholder={`Infinitif de "${selectedVerbe.fr}" dans cette langue…`}
              />
              <p className="text-xs text-gray-400 mt-1">Forme de base (infinitif) du verbe dans cette langue.</p>
            </div>

            {/* Onglets temps */}
            <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
              {TEMPS.map(t => (
                <button key={t.key} onClick={() => setActiveTense(t.key)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTense === t.key
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tableau conjugaison */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-600">
                  {TEMPS.find(t => t.key === activeTense)?.label} de «&nbsp;{motLocal || selectedVerbe.fr}&nbsp;»
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {pronoms.map(pron => (
                  <div key={pron.key} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-500">{pron.label}</span>
                    </div>
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      value={conj[activeTense]?.[pron.key] || ''}
                      onChange={e => setCell(activeTense, pron.key, e.target.value)}
                      placeholder={`Forme pour "${pron.label}"…`}
                    />
                  </div>
                ))}
              </div>
              {activeTense === 'imperatif' && (
                <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                  <p className="text-xs text-amber-700">
                    💡 L'impératif n'a pas de 1ère personne du singulier.
                    Si la langue n'a pas d'impératif distinct, décrivez la construction utilisée.
                  </p>
                </div>
              )}
            </div>

            {/* Conseil langues africaines */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-1">💡 Langues à marqueurs aspectuels</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                En Dioula, Baoulé, etc. la conjugaison utilise souvent <strong>pronom + marqueur + verbe</strong>.
                Saisissez la phrase complète (ex: <em>«&nbsp;N bɛ taa&nbsp;»</em> pour «&nbsp;je vais&nbsp;» en Dioula).
              </p>
            </div>

            {/* Sauvegarder en bas */}
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg text-base font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors">
                {saving ? 'Sauvegarde en cours…' : '💾 Sauvegarder les conjugaisons'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════════════ MODAUX ══════════════ */}

      {/* Modal nouveau / éditer verbe */}
      {modalVerbe && (
        <ModalVerbe
          cats={cats}
          initial={modalVerbe !== 'create' ? modalVerbe : null}
          onSave={data => {
            if (modalVerbe !== 'create') editVerbe(modalVerbe, data);
            else addVerbe(data);
          }}
          onClose={() => setModalVerbe(null)}
        />
      )}

      {/* Modal nouvelle / éditer catégorie */}
      {modalCat && (
        <ModalCategorie
          initial={modalCat !== 'create' ? modalCat : null}
          onSave={data => {
            if (modalCat !== 'create') editCat(modalCat, data);
            else addCat(data);
          }}
          onClose={() => setModalCat(null)}
        />
      )}

      {/* Confirmation suppression */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-6">
              Supprimer{' '}
              {confirmDel.type === 'verbe'
                ? <>le verbe <strong>« {confirmDel.item.fr} »</strong> de la liste ?</>
                : <>la rubrique <strong>« {confirmDel.item.nom} »</strong> ?</>
              }
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                Les données de conjugaison dans l'API ne seront pas supprimées.
              </span>
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDel(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => confirmDel.type === 'verbe'
                  ? deleteVerbe(confirmDel.item)
                  : deleteCat(confirmDel.item)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
