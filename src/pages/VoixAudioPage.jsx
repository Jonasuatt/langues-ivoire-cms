import { useEffect, useState, useRef } from 'react';
import api, { languagesAPI } from '../services/api';
import { SpeakerWaveIcon, SpeakerXMarkIcon, MicrophoneIcon, CheckCircleIcon, XCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const GENRE_OPTIONS = [
  { value: '', label: 'Tous les genres' },
  { value: 'M', label: '♂ Masculin' },
  { value: 'F', label: '♀ Féminin' },
];

function AudioPlayer({ src }) {
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
    <>
      <audio ref={audioRef} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} title={playing ? 'Arrêter' : 'Écouter'}
        className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium ${
          playing
            ? 'text-primary-500 bg-primary-50 animate-pulse'
            : 'text-accent hover:text-primary-500 hover:bg-primary-50 border border-accent/30'
        }`}>
        {playing ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
        {playing ? 'Stop' : 'Écouter'}
      </button>
    </>
  );
}

export default function VoixAudioPage() {
  const [contributions, setContributions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterLang, setFilterLang] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterValidated, setFilterValidated] = useState('');
  const [stats, setStats] = useState({ M: 0, F: 0, untagged: 0 });

  const LIMIT = 20;

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterLang) params.langue = filterLang;
    if (filterGenre) params.genreVoix = filterGenre;
    if (filterValidated !== '') params.validated = filterValidated;

    api.get('/audio-contributions', { params })
      .then(({ data }) => {
        setContributions(data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  const loadStats = () => {
    api.get('/audio-contributions', { params: { limit: 500 } })
      .then(({ data }) => {
        const items = data.data || [];
        setStats({
          M: items.filter(i => i.genreVoix === 'M').length,
          F: items.filter(i => i.genreVoix === 'F').length,
          untagged: items.filter(i => !i.genreVoix).length,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
    loadStats();
  }, []);

  useEffect(() => { load(); }, [page, filterLang, filterGenre, filterValidated]);

  const handleUpdateGenre = async (contrib, genre) => {
    try {
      await api.patch(`/audio-contributions/${contrib.id}`, { genreVoix: genre });
      setContributions(prev => prev.map(c => c.id === contrib.id ? { ...c, genreVoix: genre } : c));
      toast.success('Genre mis à jour');
      loadStats();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleOfficielle = async (contrib) => {
    try {
      const newVal = !contrib.estVoixOfficielle;
      await api.patch(`/audio-contributions/${contrib.id}`, { estVoixOfficielle: newVal });
      setContributions(prev => prev.map(c => c.id === contrib.id ? { ...c, estVoixOfficielle: newVal } : c));
      toast.success(newVal ? 'Marqué comme voix officielle' : 'Retiré des voix officielles');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleToggleValidated = async (contrib) => {
    try {
      const newVal = !contrib.isValidated;
      await api.patch(`/audio-contributions/${contrib.id}/validate`, { isValidated: newVal });
      setContributions(prev => prev.map(c => c.id === contrib.id ? { ...c, isValidated: newVal } : c));
      toast.success(newVal ? 'Contribution validée' : 'Validation retirée');
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MicrophoneIcon className="w-7 h-7 text-orange-500" />
            Voix Audio
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des contributions audio et taguage des genres de voix</p>
        </div>
        <div className="flex gap-3">
          <div className="card py-2 px-4 text-center">
            <p className="text-lg font-bold text-blue-600">{stats.M}</p>
            <p className="text-xs text-gray-500">♂ Masculin</p>
          </div>
          <div className="card py-2 px-4 text-center">
            <p className="text-lg font-bold text-pink-500">{stats.F}</p>
            <p className="text-xs text-gray-500">♀ Féminin</p>
          </div>
          <div className="card py-2 px-4 text-center">
            <p className="text-lg font-bold text-gray-400">{stats.untagged}</p>
            <p className="text-xs text-gray-500">Non taguées</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterLang} onChange={e => { setFilterLang(e.target.value); setPage(1); }}
          className="input w-auto">
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
        <select value={filterGenre} onChange={e => { setFilterGenre(e.target.value); setPage(1); }}
          className="input w-auto">
          {GENRE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <select value={filterValidated} onChange={e => { setFilterValidated(e.target.value); setPage(1); }}
          className="input w-auto">
          <option value="">Tous les statuts</option>
          <option value="true">Validées</option>
          <option value="false">En attente</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 self-center">{total} enregistrement(s)</span>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
      ) : contributions.length === 0 ? (
        <div className="card text-center py-16">
          <MicrophoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucune contribution audio trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contributions.map(contrib => (
            <div key={contrib.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Mot + Langue */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{contrib.mot}</span>
                    {contrib.language && (
                      <span className="badge bg-orange-50 text-orange-600">{contrib.language.nom}</span>
                    )}
                    {contrib.traduction && (
                      <span className="text-xs text-gray-400 italic">{contrib.traduction}</span>
                    )}
                  </div>

                  {/* Player audio */}
                  <div className="mb-3">
                    <AudioPlayer src={contrib.audioUrl} />
                  </div>

                  {/* Boutons genre */}
                  <div className="flex gap-1.5 mb-3">
                    {[{v:'M',l:'♂ M',active:'bg-blue-600 text-white border-blue-600'},{v:'F',l:'♀ F',active:'bg-pink-500 text-white border-pink-500'}].map(g => (
                      <button key={g.v} type="button"
                        onClick={() => handleUpdateGenre(contrib, contrib.genreVoix === g.v ? '' : g.v)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-colors ${
                          contrib.genreVoix === g.v ? g.active : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}>
                        {g.l}
                      </button>
                    ))}
                    {!contrib.genreVoix && (
                      <span className="px-2 py-1 rounded-lg text-xs text-gray-400 bg-gray-100">Non taguée</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {/* Voix officielle */}
                    <button onClick={() => handleToggleOfficielle(contrib)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                        contrib.estVoixOfficielle ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-500'
                      }`}>
                      {contrib.estVoixOfficielle
                        ? <StarSolid className="w-4 h-4" />
                        : <StarIcon className="w-4 h-4" />
                      }
                      Voix officielle
                    </button>

                    {/* Validation */}
                    <button onClick={() => handleToggleValidated(contrib)}
                      className={`flex items-center gap-1 text-xs font-medium ml-auto transition-colors ${
                        contrib.isValidated
                          ? 'text-green-600 hover:text-red-500'
                          : 'text-gray-400 hover:text-green-600'
                      }`}>
                      {contrib.isValidated
                        ? <><CheckCircleIcon className="w-4 h-4" /> Validé</>
                        : <><XCircleIcon className="w-4 h-4" /> Valider</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Précédent</button>
            <button className="btn-secondary text-sm py-1.5 px-3"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}
