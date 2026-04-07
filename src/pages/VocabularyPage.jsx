import { useEffect, useState } from 'react';
import { dictionaryAPI, languagesAPI } from '../services/api';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

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

const EMPTY_FORM = { mot: '', traduction: '', transcription: '', categorie: '', exemplePhrase: '' };

export default function VocabularyPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const LIMIT = 20;

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) setSelectedLang(data[0].code);
    });
  }, []);

  const loadEntries = () => {
    if (!selectedLang) return;
    setLoading(true);
    dictionaryAPI.get(selectedLang, { page, limit: LIMIT })
      .then(({ data }) => { setEntries(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEntries(); }, [selectedLang, page]);

  const handleSearch = (q) => {
    setSearch(q);
    if (q.length < 2) { loadEntries(); return; }
    dictionaryAPI.search({ q, langue: selectedLang })
      .then(({ data }) => { setEntries(data); setTotal(data.length); });
  };

  const openAdd = () => {
    setEditEntry(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditEntry(entry);
    setForm({
      mot: entry.mot || '',
      traduction: entry.traduction || '',
      transcription: entry.transcription || '',
      categorie: entry.categorie || '',
      exemplePhrase: entry.exemplePhrase || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.mot || !form.traduction) { toast.error('Mot et traduction obligatoires'); return; }
    setSaving(true);
    try {
      if (editEntry) {
        await api.patch(`/dictionary/admin/word/${editEntry.id}`, form);
        toast.success('Mot mis à jour !');
      } else {
        await api.post('/dictionary/admin/word', { ...form, langueCode: selectedLang });
        toast.success('Mot ajouté !');
      }
      setShowModal(false);
      loadEntries();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!confirm(`Supprimer "${entry.mot}" ?`)) return;
    try {
      await api.delete(`/dictionary/admin/word/${entry.id}`);
      toast.success('Mot supprimé');
      loadEntries();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulaire</h1>
          <p className="text-gray-500 text-sm mt-1">{total} entrées au total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Ajouter un mot
        </button>
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
                {['Mot', 'Phonétique', 'Traduction', 'Catégorie', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucune entrée</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-primary-500">{entry.mot}</td>
                  <td className="px-4 py-3 text-gray-500 italic text-xs">{entry.transcription || '—'}</td>
                  <td className="px-4 py-3 text-gray-900">{entry.traduction}</td>
                  <td className="px-4 py-3">
                    {entry.categorie && <span className="badge bg-orange-50 text-orange-600">{entry.categorie}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[entry.status]}`}>{STATUS_LABELS[entry.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(entry)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(entry)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Précédent</button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Suivant →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajouter / Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editEntry ? 'Modifier le mot' : `Ajouter un mot — ${selectedLang.toUpperCase()}`}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot *</label>
                <input className="input" value={form.mot} onChange={e => setForm({...form, mot: e.target.value})} placeholder="Ex: Akwaba" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction *</label>
                <input className="input" value={form.traduction} onChange={e => setForm({...form, traduction: e.target.value})} placeholder="Ex: Bienvenue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phonétique</label>
                <input className="input" value={form.transcription} onChange={e => setForm({...form, transcription: e.target.value})} placeholder="Ex: akwaba" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select className="input" value={form.categorie} onChange={e => setForm({...form, categorie: e.target.value})}>
                  <option value="">-- Choisir --</option>
                  {['salutations','famille','nourriture','nature','habitat','transport','vie_quotidienne','expressions','verbes','spiritualite','vie_sociale','chiffres','couleurs'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exemple de phrase</label>
                <input className="input" value={form.exemplePhrase} onChange={e => setForm({...form, exemplePhrase: e.target.value})} placeholder="Ex: Akwaba Abidjan !" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editEntry ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
