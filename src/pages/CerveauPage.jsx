import { useEffect, useState } from 'react';
import api from '../services/api';
import PageHelp from '../components/PageHelp';

/**
 * 🧠 Cerveau Numérique — la mémoire centrale de LANGUES IVOIRE.
 * Vue unifiée de toutes les connaissances : chaque module de l'application
 * écrit dans cette mémoire commune, le Cerveau la mesure et la rend visible.
 */

const DOMAINES = [
  { key: 'mots',      label: 'Mots',        emoji: '📖' },
  { key: 'phrases',   label: 'Phrases',     emoji: '💬' },
  { key: 'lecons',    label: 'Leçons',      emoji: '🎓' },
  { key: 'culture',   label: 'Culture',     emoji: '🏺' },
  { key: 'textes',    label: 'Textes',      emoji: '📜' },
  { key: 'videos',    label: 'Vidéos',      emoji: '🎬' },
  { key: 'sensMots',  label: 'Sens',        emoji: '🔠' },
  { key: 'math',      label: 'Math',        emoji: '🔢' },
  { key: 'monnaie',   label: 'Monnaie',     emoji: '💰' },
  { key: 'marche',    label: 'Marché',      emoji: '🛒' },
  { key: 'secours',   label: 'Secours',     emoji: '🚨' },
  { key: 'civisme',   label: 'Civisme',     emoji: '🏛️' },
  { key: 'tuteurs',   label: 'Tuteurs',     emoji: '🤖' },
  { key: 'audios',    label: 'Audios',      emoji: '🎙️' },
];

function StatTile({ emoji, label, value, accent }) {
  return (
    <div className={`rounded-2xl p-4 border ${accent ?? 'bg-white border-gray-100'} shadow-sm`}>
      <div className="text-2xl">{emoji}</div>
      <div className="text-2xl font-black text-gray-900 mt-1">{value?.toLocaleString('fr-FR') ?? '—'}</div>
      <div className="text-xs font-semibold text-gray-500">{label}</div>
    </div>
  );
}

export default function CerveauPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/brain/overview')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const doSearch = async (e) => {
    e?.preventDefault();
    const q = search.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const { data } = await api.get('/search', { params: { q, limit: 8 } });
      setResults(data);
    } catch { setResults(null); }
    finally { setSearching(false); }
  };

  const g = data?.global;
  const tauxCertif = g?.audios ? Math.round((g.audiosCertifies / g.audios) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white p-6 md:p-8 mb-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">🧠 Cerveau Numérique</h1>
        <p className="text-emerald-100 text-sm mt-2 max-w-3xl leading-relaxed">
          La mémoire centrale de LANGUES IVOIRE. Chaque mot du dictionnaire, chaque audio certifié,
          chaque leçon, chaque conte enrichit une seule et même base de connaissances — celle dans
          laquelle puisent l'application mobile, les tuteurs IA, l'école numérique et les révisions.
          Ce tableau mesure, langue par langue, le patrimoine déjà numérisé et ce qu'il reste à nourrir.
        </p>
        {g && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-bold">
            ⚡ {g.totalNeurones.toLocaleString('fr-FR')} connaissances enregistrées
            <span className="text-emerald-200 font-medium">· {g.langues} langues actives</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement de la mémoire centrale…</div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">Impossible de charger le Cerveau. Réessayez.</div>
      ) : (
        <>
          {/* Recherche transversale — le « rappel » du cerveau */}
          <form onSubmit={doSearch} className="flex gap-2 mb-6">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Interroger la mémoire (mot, leçon, contenu culturel…)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button type="submit" disabled={searching}
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition disabled:opacity-50">
              {searching ? '…' : 'Rechercher'}
            </button>
          </form>

          {results && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Rappel de la mémoire — « {search} »
              </p>
              {results.total === 0 && (
                <p className="text-sm text-gray-400">Aucun souvenir ne correspond — cette connaissance reste à enregistrer.</p>
              )}
              {['mots', 'lecons', 'culture'].map(k => {
                const items = results[k] ?? [];
                if (!Array.isArray(items) || items.length === 0) return null;
                const label = k === 'mots' ? '📖 Dictionnaire' : k === 'lecons' ? '🎓 Leçons' : '🏺 Culture';
                return (
                  <div key={k} className="mb-3">
                    <p className="text-sm font-bold text-gray-700 mb-1">{label}</p>
                    <ul className="text-sm text-gray-600 space-y-0.5">
                      {items.slice(0, 5).map((it, i) => (
                        <li key={i} className="truncate">
                          • {it.mot ?? it.titre ?? it.contenu} {it.traduction ? <span className="text-gray-400">— {it.traduction}</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Signes vitaux globaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
            <StatTile emoji="📖" label="Mots"              value={g.mots} />
            <StatTile emoji="💬" label="Phrases"           value={g.phrases} />
            <StatTile emoji="🎓" label="Leçons"            value={g.lecons} />
            <StatTile emoji="🎙️" label={`Audios (${tauxCertif}% certifiés ILA)`} value={g.audios} />
            <StatTile emoji="👥" label="Utilisateurs"      value={g.utilisateurs} />
            <StatTile emoji="🔁" label="Cartes de révision" value={g.cartesRevision} />
          </div>

          {/* La matrice — connaissances par langue et par domaine */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-gray-800">Matrice des connaissances par langue</h2>
            <button onClick={load} className="text-sm text-emerald-700 font-semibold hover:underline">Actualiser</button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-50">Langue</th>
                  <th className="px-2 py-3 text-center" title="Code ISO 639-3">ISO</th>
                  {DOMAINES.map(d => (
                    <th key={d.key} className="px-2 py-3 text-center" title={d.label}>{d.emoji}</th>
                  ))}
                  <th className="px-3 py-3 text-center">✅ Certifiés</th>
                  <th className="px-3 py-3 text-right font-black">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.parLangue.map(row => (
                  <tr key={row.langue.id} className="hover:bg-emerald-50/40 transition">
                    <td className="px-4 py-2.5 font-bold text-gray-800 sticky left-0 bg-white">
                      {row.langue.emoji ?? '📚'} {row.langue.nom}
                      {row.langue.isInMvp && <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-black">MVP</span>}
                    </td>
                    <td className="px-2 py-2.5 text-center text-xs font-mono text-gray-400">{row.langue.iso639_3 ?? '—'}</td>
                    {DOMAINES.map(d => (
                      <td key={d.key} className={`px-2 py-2.5 text-center ${row[d.key] ? 'text-gray-700 font-semibold' : 'text-gray-200'}`}>
                        {row[d.key] || '·'}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold text-teal-700">{row.audiosCertifies || '·'}</td>
                    <td className="px-3 py-2.5 text-right font-black text-emerald-800">{row.totalNeurones.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Un « · » signale un domaine encore vide pour cette langue — c'est la carte des prochains chantiers de contenu.
            Les contenus universels (sans langue) ne figurent pas dans la matrice mais comptent dans les totaux globaux.
          </p>
        </>
      )}

      <PageHelp pageId="cerveau" />
    </div>
  );
}
