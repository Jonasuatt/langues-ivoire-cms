import { useEffect, useState } from 'react';
import api, { languagesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline';

// Les 24 verbes du mobile, dans le même ordre
const VERBES = [
  { fr: 'être',        cat: 'Base' },
  { fr: 'avoir',       cat: 'Base' },
  { fr: 'aller',       cat: 'Mouvement' },
  { fr: 'venir',       cat: 'Mouvement' },
  { fr: 'faire',       cat: 'Action' },
  { fr: 'dire',        cat: 'Communication' },
  { fr: 'manger',      cat: 'Quotidien' },
  { fr: 'boire',       cat: 'Quotidien' },
  { fr: 'dormir',      cat: 'Quotidien' },
  { fr: 'voir',        cat: 'Perception' },
  { fr: 'entendre',    cat: 'Perception' },
  { fr: 'parler',      cat: 'Communication' },
  { fr: 'donner',      cat: 'Action' },
  { fr: 'prendre',     cat: 'Action' },
  { fr: 'aimer',       cat: 'Sentiment' },
  { fr: 'vouloir',     cat: 'Sentiment' },
  { fr: 'pouvoir',     cat: 'Base' },
  { fr: 'savoir',      cat: 'Base' },
  { fr: 'travailler',  cat: 'Quotidien' },
  { fr: 'acheter',     cat: 'Commerce' },
  { fr: 'vendre',      cat: 'Commerce' },
  { fr: 'saluer',      cat: 'Communication' },
  { fr: 'danser',      cat: 'Culture' },
  { fr: 'chanter',     cat: 'Culture' },
];

const CAT_COLORS = {
  Base:          'bg-blue-100 text-blue-700',
  Mouvement:     'bg-orange-100 text-orange-700',
  Action:        'bg-green-100 text-green-700',
  Communication: 'bg-purple-100 text-purple-700',
  Quotidien:     'bg-teal-100 text-teal-700',
  Sentiment:     'bg-pink-100 text-pink-700',
  Commerce:      'bg-amber-100 text-amber-700',
  Culture:       'bg-brown-100 text-stone-700',
  Perception:    'bg-slate-100 text-slate-700',
};

const CAT_EMOJI = {
  Base:'🔤', Mouvement:'🚶', Action:'✋', Communication:'💬',
  Quotidien:'🏠', Sentiment:'❤️', Commerce:'🛒', Culture:'🎭', Perception:'👁️',
};

const TEMPS = [
  { key: 'present',   label: 'Présent' },
  { key: 'passe',     label: 'Passé' },
  { key: 'futur',     label: 'Futur' },
  { key: 'imperatif', label: 'Impératif' },
];

const PRONOMS = [
  { key: '1s', label: 'Je'         },
  { key: '2s', label: 'Tu'         },
  { key: '3s', label: 'Il / Elle'  },
  { key: '1p', label: 'Nous'       },
  { key: '2p', label: 'Vous'       },
  { key: '3p', label: 'Ils / Elles'},
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

export default function ConjugationPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedVerbe, setSelectedVerbe] = useState(null);
  const [activeTense, setActiveTense] = useState('present');

  // Données de la page : { verbeFr → entry | null }
  const [entriesMap, setEntriesMap] = useState({});
  const [loadingMap, setLoadingMap] = useState(false);

  // Formulaire d'édition
  const [entryId, setEntryId]   = useState(null);
  const [motLocal, setMotLocal] = useState('');
  const [conj, setConj]         = useState(EMPTY_CONJ);
  const [saving, setSaving]     = useState(false);
  const [filterCat, setFilterCat] = useState('Tout');

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) setSelectedLang(data[0].code);
    });
  }, []);

  // Charger toutes les entrées "verbes" pour la langue sélectionnée
  const loadEntries = async () => {
    if (!selectedLang) return;
    setLoadingMap(true);
    try {
      const { data } = await api.get(`/dictionary/${selectedLang}`, {
        params: { tab: 'words', limit: 200, categorie: 'verbes' },
      });
      const map = {};
      for (const verb of VERBES) {
        const found = data.data?.find(e =>
          e.traduction?.toLowerCase().includes(verb.fr.toLowerCase()) ||
          e.traduction?.toLowerCase() === verb.fr.toLowerCase()
        );
        map[verb.fr] = found || null;
      }
      setEntriesMap(map);
    } catch {
      toast.error('Erreur chargement');
    } finally {
      setLoadingMap(false);
    }
  };

  useEffect(() => { loadEntries(); }, [selectedLang]);

  const openVerbe = (verbe) => {
    setSelectedVerbe(verbe);
    setActiveTense('present');
    const entry = entriesMap[verbe.fr];
    if (entry) {
      setEntryId(entry.id);
      setMotLocal(entry.mot || '');
      setConj(entry.conjugaisons
        ? { ...EMPTY_CONJ, ...entry.conjugaisons }
        : EMPTY_CONJ
      );
    } else {
      setEntryId(null);
      setMotLocal('');
      setConj(EMPTY_CONJ);
    }
  };

  const setCell = (tense, pronKey, value) => {
    setConj(c => ({ ...c, [tense]: { ...c[tense], [pronKey]: value } }));
  };

  const handleSave = async () => {
    if (!motLocal.trim()) { toast.error('Le mot local est obligatoire'); return; }
    setSaving(true);
    try {
      if (entryId) {
        await api.patch(`/dictionary/admin/word/${entryId}`, {
          mot: motLocal,
          traduction: selectedVerbe.fr,
          categorie: 'verbes',
          conjugaisons: conj,
        });
        toast.success('Conjugaison sauvegardée !');
      } else {
        const { data: newEntry } = await api.post('/dictionary/admin/word', {
          langueCode: selectedLang,
          mot: motLocal,
          traduction: selectedVerbe.fr,
          categorie: 'verbes',
          conjugaisons: conj,
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

  // Compter les verbes avec conjugaison par langue
  const withConjCount = Object.values(entriesMap).filter(e => e?.conjugaisons).length;
  const pronoms = activeTense === 'imperatif' ? PRONOMS_IMP : PRONOMS;
  const cats = ['Tout', ...new Set(VERBES.map(v => v.cat))];
  const filteredVerbes = filterCat === 'Tout' ? VERBES : VERBES.filter(v => v.cat === filterCat);

  return (
    <div className="flex h-full">
      {/* ── Colonne gauche : liste des verbes ── */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Conjugaison</h1>
          <p className="text-sm text-gray-500 mt-1">
            {withConjCount} / {VERBES.length} verbes saisis
          </p>
          {/* Barre de progression */}
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${(withConjCount / VERBES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Langue */}
        <div className="px-4 py-3 border-b border-gray-100">
          <select className="input w-full text-sm" value={selectedLang}
            onChange={e => { setSelectedLang(e.target.value); setSelectedVerbe(null); }}>
            {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
          </select>
        </div>

        {/* Filtre catégorie */}
        <div className="px-3 py-2 border-b border-gray-100 flex gap-1 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${filterCat === c ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingMap ? (
            <div className="text-center py-10 text-gray-400 text-sm">Chargement…</div>
          ) : filteredVerbes.map(verb => {
            const entry = entriesMap[verb.fr];
            const hasConj = !!entry?.conjugaisons;
            const hasEntry = !!entry;
            const isActive = selectedVerbe?.fr === verb.fr;
            return (
              <button key={verb.fr} onClick={() => openVerbe(verb)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left mb-1 transition-colors ${
                  isActive ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
                }`}>
                <span className="text-lg">{CAT_EMOJI[verb.cat]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>
                      {verb.fr}
                    </span>
                    {entry?.mot && (
                      <span className="text-xs text-gray-400 truncate">({entry.mot})</span>
                    )}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${CAT_COLORS[verb.cat]}`}>{verb.cat}</span>
                </div>
                {hasConj ? (
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : hasEntry ? (
                  <PencilIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Légende */}
        <div className="p-3 border-t border-gray-100 space-y-1">
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

      {/* ── Colonne droite : éditeur ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {!selectedVerbe ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Sélectionnez un verbe</h2>
            <p className="text-gray-400 text-sm max-w-xs">
              Choisissez un verbe dans la liste à gauche pour saisir ou modifier ses conjugaisons en {languages.find(l => l.code === selectedLang)?.nom || 'la langue sélectionnée'}.
            </p>
          </div>
        ) : (
          <>
            {/* Titre */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{CAT_EMOJI[selectedVerbe.cat]}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{selectedVerbe.fr}</h2>
                    <p className="text-sm text-gray-500">
                      {languages.find(l => l.code === selectedLang)?.nom} · {selectedVerbe.cat}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 px-6">
                {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
              </button>
            </div>

            {/* Mot local */}
            <div className="card mb-6 p-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mot / verbe en {languages.find(l => l.code === selectedLang)?.nom} *
              </label>
              <input className="input max-w-sm" value={motLocal}
                onChange={e => setMotLocal(e.target.value)}
                placeholder={`Comment dit-on "${selectedVerbe.fr}" en ${languages.find(l => l.code === selectedLang)?.nom || '…'} ?`} />
              <p className="text-xs text-gray-400 mt-1">
                C'est l'infinitif (forme de base) du verbe dans cette langue.
              </p>
            </div>

            {/* Onglets temps */}
            <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
              {TEMPS.map(t => (
                <button key={t.key} onClick={() => setActiveTense(t.key)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTense === t.key
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tableau de conjugaison */}
            <div className="card p-0 overflow-hidden">
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
                      className="flex-1 input text-sm"
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
                    💡 L'impératif n'a pas de 1ère personne du singulier (on ne se commande pas à soi-même).
                    Si la langue n'a pas d'impératif, laissez vide ou expliquez la construction.
                  </p>
                </div>
              )}
            </div>

            {/* Remplissage rapide pour les langues à marqueur aspecto-temporel */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-semibold text-blue-800 mb-2">💡 Conseil pour les langues à marqueurs aspectuels</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                En Dioula, Baoulé, etc., la conjugaison utilise souvent un <strong>pronom + marqueur + verbe</strong>.
                Saisissez la phrase complète (ex: <em>"N bɛ taa"</em> pour "je vais" en Dioula).
                Pour l'impératif, mettez juste le verbe suivi de "!" (ex: <em>"Taa!"</em>).
              </p>
            </div>

            {/* Bouton sauvegarder en bas */}
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-base">
                {saving ? 'Sauvegarde en cours…' : '💾 Sauvegarder les conjugaisons'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
