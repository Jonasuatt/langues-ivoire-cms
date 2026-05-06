import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function PhrasesSOSPage() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get('/phrases', { params: { categorie: 'sos', limit: 200 } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setPhrases(list);
      })
      .catch(() => {
        // Fallback sans filtre categorie
        api
          .get('/phrases', { params: { limit: 200 } })
          .then(({ data }) => {
            const list = Array.isArray(data) ? data : data?.data ?? [];
            setPhrases(list);
          })
          .catch(() => setError('Impossible de charger les phrases SOS. Vérifiez la connexion à l\'API.'))
          .finally(() => setLoading(false));
      })
      .finally(() => setLoading(false));
  }, []);

  const urgenceColor = (urgence) => {
    if (!urgence) return 'bg-gray-100 text-gray-600';
    const lvl = String(urgence).toLowerCase();
    if (lvl === 'critique' || lvl === 'high' || lvl === '3') return 'bg-red-100 text-red-700';
    if (lvl === 'moyen' || lvl === 'medium' || lvl === '2') return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phrases SOS</h1>
            <p className="text-sm text-gray-500">Phrases d'urgence multilingues pour situations critiques</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{phrases.length}</p>
            <p className="text-sm text-gray-500 mt-1">Phrases enregistrées</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {phrases.filter(p => p.isActive !== false).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Phrases actives</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-600">
              {[...new Set(phrases.map(p => p.languageId ?? p.language?.id).filter(Boolean))].length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Langues couvertes</p>
          </div>
        </div>
      )}

      {/* États */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          <span className="ml-3 text-gray-500 text-sm">Chargement des phrases SOS…</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && phrases.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Aucune phrase SOS disponible</p>
          <p className="text-sm mt-1">Les phrases seront affichées ici une fois ajoutées via l'API.</p>
        </div>
      )}

      {!loading && !error && phrases.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Phrase / Consigne</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Traduction</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Langue</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Urgence</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {phrases.map((phrase, idx) => (
                <tr
                  key={phrase.id ?? idx}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 max-w-xs">
                    <span className="line-clamp-2">{phrase.consigne ?? phrase.texte ?? phrase.phrase ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 italic max-w-xs">
                    <span className="line-clamp-2">{phrase.traduction ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {phrase.language?.nom ?? phrase.langue ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    {phrase.urgence || phrase.niveauUrgence ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${urgenceColor(phrase.urgence ?? phrase.niveauUrgence)}`}>
                        {phrase.urgence ?? phrase.niveauUrgence}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {phrase.isActive !== false ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100 text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
