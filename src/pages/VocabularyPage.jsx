import { useEffect, useState } from 'react';
import { dictionaryAPI, languagesAPI } from '../services/api';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const STATUS_STYLES = {
  PUBLISHED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  ARCHIVED:  'bg-red-100 text-red-700',
  REJECTED:  'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  PUBLISHED: 'Publié', PENDING: 'En validation', DRAFT: 'Brouillon',
  ARCHIVED: 'Archivé', REJECTED: 'Rejeté',
};

export default function VocabularyPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) setSelectedLang(data[0].code);
    });
  }, []);

  useEffect(() => {
    if (!selectedLang) return;
    setLoading(true);
    dictionaryAPI.get(selectedLang, { page, limit: LIMIT })
      .then(({ data }) => { setEntries(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedLang, page]);

  const handleSearch = (q) => {
    setSearch(q);
    if (q.length < 2) return;
    dictionaryAPI.search({ q, langue: selectedLang })
      .then(({ data }) => { setEntries(data); setTotal(data.length); });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulaire</h1>
          <p className="text-gray-500 text-sm mt-1">{total} entrées au total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <select className="input max-w-[180px]" value={selectedLang}
          onChange={e => { setSelectedLang(e.target.value); setPage(1); }}>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher un mot…"
            value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Mot', 'Phonétique', 'Traduction', 'Catégorie', 'Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Aucune entrée</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-primary-500">{entry.mot}</td>
                  <td className="px-4 py-3 text-gray-500 italic text-xs">{entry.transcription || '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{entry.traduction}</td>
                  <td className="px-4 py-3">
                    {entry.categorie && (
                      <span className="badge bg-orange-50 text-orange-600">{entry.categorie}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← Précédent
              </button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
