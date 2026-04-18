import { useEffect, useState, useRef } from 'react';
import { audioContribAPI, languagesAPI } from '../services/api';
import { CheckIcon, XMarkIcon, TrashIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STATUS_LABELS = { all: 'Toutes', pending: 'En attente', validated: 'Validées' };

export default function AudioContributionsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLang, setFilterLang] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
    audioContribAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = { limit: 50 };
    if (filterStatus === 'pending') params.validated = 'false';
    if (filterStatus === 'validated') params.validated = 'true';
    if (filterLang) params.langue = filterLang;
    audioContribAPI.getAll(params)
      .then(({ data }) => setItems(data.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterLang]);

  const handleValidate = async (item, isValid) => {
    try {
      await audioContribAPI.validate(item.id, { isValidated: isValid, qualityScore: isValid ? 4 : 0 });
      toast.success(isValid ? 'Contribution validée !' : 'Contribution rejetée');
      load();
      audioContribAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer l'enregistrement de "${item.mot}" ?`)) return;
    try {
      await audioContribAPI.delete(item.id);
      toast.success('Supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const playAudio = (item) => {
    if (playingId === item.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(item.audioUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingId(item.id);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎙️ Contributions Audio — IA Linguistique</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enregistrements vocaux des utilisateurs qui enrichissent l'IA
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-primary-500">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total enregistrements</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-green-600">{stats.validated}</p>
            <p className="text-sm text-gray-500 mt-1">Validés</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">En attente</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button key={key}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setFilterStatus(key)}
          >{label}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <select className="input max-w-[180px]" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className={`card ${item.isValidated ? 'border-l-4 border-green-400' : 'border-l-4 border-orange-300'}`}>
              <div className="flex items-center gap-4">
                {/* Bouton lecture */}
                <button
                  onClick={() => playAudio(item)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    playingId === item.id ? 'bg-red-500 text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'
                  }`}
                >
                  {playingId === item.id
                    ? <StopIcon className="w-5 h-5" />
                    : <PlayIcon className="w-5 h-5" />
                  }
                </button>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-lg">{item.mot}</p>
                    {item.language && (
                      <span className="badge bg-primary-100 text-primary-700">{item.language.nom}</span>
                    )}
                    {item.isValidated && (
                      <span className="badge bg-green-100 text-green-700">✓ Validé</span>
                    )}
                  </div>
                  {item.traduction && <p className="text-sm text-gray-500">{item.traduction}</p>}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Par {item.user?.prenom} {item.user?.nom}</span>
                    {item.categorie && <span>• {item.categorie}</span>}
                    {item.duree && <span>• {(item.duree / 1000).toFixed(1)}s</span>}
                    <span>• Joué {item.timesPlayed}x</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 flex-shrink-0">
                  {!item.isValidated && (
                    <button onClick={() => handleValidate(item, true)}
                      className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                      title="Valider">
                      <CheckIcon className="w-5 h-5" />
                    </button>
                  )}
                  {item.isValidated && (
                    <button onClick={() => handleValidate(item, false)}
                      className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                      title="Invalider">
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(item)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">🎙️</p>
              <p>Aucune contribution audio pour ce filtre.</p>
              <p className="text-sm mt-2">Les utilisateurs peuvent enregistrer leur voix depuis l'app mobile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
