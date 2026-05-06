import { useState, useEffect } from 'react';
import { GlobeAltIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { languagesAPI } from '../services/api';

export default function LanguesPage() {
  const [langues, setLangues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    languagesAPI
      .getAll()
      .then(({ data }) => {
        // L'API peut retourner un tableau directement ou { data: [...] }
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLangues(list);
      })
      .catch(() => setError('Impossible de charger les langues. Vérifiez la connexion à l\'API.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Langues</h1>
            <p className="text-sm text-gray-500">Liste des langues ethniques ivoiriennes configurées dans l'application</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{langues.length}</p>
            <p className="text-sm text-gray-500 mt-1">Langues enregistrées</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {langues.filter(l => l.isActive !== false).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Langues actives</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-400">
              {langues.filter(l => l.isActive === false).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Langues inactives</p>
          </div>
        </div>
      )}

      {/* États */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          <span className="ml-3 text-gray-500 text-sm">Chargement des langues…</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && langues.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <GlobeAltIcon className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Aucune langue configurée</p>
          <p className="text-sm mt-1">Les langues seront affichées ici une fois ajoutées via l'API.</p>
        </div>
      )}

      {!loading && !error && langues.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Région</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Mots</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {langues.map((lang, idx) => (
                <tr
                  key={lang.id ?? idx}
                  className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">{lang.nom}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">
                      {lang.code ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{lang.region ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {lang._count?.mots ?? lang.nombreMots ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    {lang.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                        <XCircleIcon className="w-3.5 h-3.5" />
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
