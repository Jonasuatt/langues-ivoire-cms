import { useEffect, useState } from 'react';
import { phrasesAdminAPI, languagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ChatBubbleLeftRightIcon, PlusIcon, PencilIcon, TrashIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CATEGORIES = ['expressions', 'salutations', 'nourriture', 'vie_quotidienne', 'vie_sociale', 'corps', 'lieux', 'autre'];
const CAT_LABELS = {
  expressions: '💬 Expressions', salutations: '👋 Salutations', nourriture: '🍽️ Nourriture',
  vie_quotidienne: '🌅 Vie quotidienne', vie_sociale: '🤝 Vie sociale',
  corps: '💪 Corps', lieux: '📍 Lieux', autre: '📌 Autre',
};
const CAT_COLORS = {
  expressions: 'bg-purple-100 text-purple-700', salutations: 'bg-green-100 text-green-700',
  nourriture: 'bg-yellow-100 text-yellow-700', vie_quotidienne: 'bg-blue-100 text-blue-700',
  vie_sociale: 'bg-pink-100 text-pink-700', corps: 'bg-orange-100 text-orange-700',
  lieux: 'bg-indigo-100 text-indigo-700', autre: 'bg-gray-100 text-gray-600',
};
const EMPTY_FORM = { languageId: '', phrase: '', transcription: '', traduction: '', categorie: 'expressions', contexte: '', audioUrl: '', status: 'PUBLISHED' };

export default function PhrasesUtilesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [phrases, setPhrases] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filterLang, setFilterLang] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const LIMIT = 20;

  useEffect(() => { languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {}); }, []);

  const load = () => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (filterLang) params.languageId = filterLang;
    if (filterCat) params.categorie = filterCat;
    if (filterStatus) params.status = filterStatus;
    phrasesAdminAPI.getAll(params)
      .then(({ data }) => {
        const list = (data.data || []).filter(p => p.categorie !== 'urgence');
        setPhrases(list);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('Erreur de chargement', { id: 'phrases-utiles-load' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [filterLang, filterCat, filterStatus]);
  useEffect(() => { load(); }, [page, filterLang, filterCat, filterStatus]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ languageId: p.languageId || '', phrase: p.phrase || '', transcription: p.transcription || '',
      traduction: p.traduction || '', categorie: p.categorie || 'expressions',
      contexte: p.contexte || '', audioUrl: p.audioUrl || '', status: p.status || 'PUBLISHED' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.languageId || !form.phrase || !form.traduction) { toast.error('Langue, phrase et traduction sont requis'); return; }
    setSaving(true);
    const payload = { languageId: form.languageId, phrase: form.phrase.trim(),
      transcription: form.transcription.trim() || null, traduction: form.traduction.trim(),
      categorie: form.categorie, contexte: form.contexte.trim() || null,
      audioUrl: form.audioUrl.trim() || null, status: form.status };
    try {
      if (editItem) { await phrasesAdminAPI.update(editItem.id, payload); toast.success('Phrase mise à jour'); }
      else { await phrasesAdminAPI.create(payload); toast.success('Phrase ajoutée'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer "${p.phrase}" ?`)) return;
    try { await phrasesAdminAPI.delete(p.id); toast.success('Phrase supprimée'); load(); }
    catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  const toggleStatus = async (p) => {
    const s = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await phrasesAdminAPI.update(p.id, { status: s });
      setPhrases(prev => prev.map(x => x.id === p.id ? { ...x, status: s } : x));
      toast.success(s === 'PUBLISHED' ? 'Publiée' : 'Mise en brouillon');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-purple-500" />
            Phrases Utiles
          </h1>
          <p className="text-gray-500 text-sm mt-1">Phrasebook multilingue — expressions, salutations, vie quotidienne…</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Ajouter une phrase</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-gray-800">{total}</p><p className="text-sm text-gray-500">Total dans la base</p></div>
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-green-600">{phrases.filter(p => p.status === 'PUBLISHED').length}</p><p className="text-sm text-gray-500">Publiées (page)</p></div>
        <div className="card py-3 px-5"><p className="text-2xl font-bold text-blue-600">{[...new Set(phrases.map(p => p.languageId).filter(Boolean))].length}</p><p className="text-sm text-gray-500">Langues (page)</p></div>
      </div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filterLang} onChange={e => setFilterLang(e.target.value)} className="input w-auto">
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input w-auto">
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c] || c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="">Tous les statuts</option>
          <option value="PUBLISHED">Publiées</option>
          <option value="DRAFT">Brouillons</option>
        </select>
        <span className="ml-auto text-sm text-gray-500 self-center">{total} phrase(s)</span>
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}</div>
      ) : phrases.length === 0 ? (
        <div className="card text-center py-16">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucune phrase pour ces filtres</p>
          <button onClick={openAdd} className="mt-4 btn-primary text-sm">Ajouter la première phrase</button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Phrase', 'Transcription', 'Traduction', 'Langue', 'Catégorie', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {phrases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        {p.audioUrl && <SpeakerWaveIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                        <span className="line-clamp-2">{p.phrase}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 italic text-xs max-w-[140px]"><span className="line-clamp-2">{p.transcription || '—'}</span></td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px]"><span className="line-clamp-2">{p.traduction}</span></td>
                    <td className="px-4 py-3 text-xs"><span className="badge bg-orange-50 text-orange-700">{p.language?.nom || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${CAT_COLORS[p.categorie] || 'bg-gray-100 text-gray-600'}`}>{CAT_LABELS[p.categorie] || p.categorie || '—'}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(p)} className={`badge cursor-pointer ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'PUBLISHED' ? '● Publiée' : '○ Brouillon'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                        {isAdmin && <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><TrashIcon className="w-4 h-4" /></button>}
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
                <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Précédent</button>
                <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Suivant →</button>
              </div>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editItem ? 'Modifier la phrase' : 'Nouvelle phrase utile'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={form.languageId} onChange={e => setForm({ ...form, languageId: e.target.value })}>
                    <option value="">-- Sélectionner --</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select className="input" value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c] || c}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phrase (langue locale) *</label><input className="input" value={form.phrase} onChange={e => setForm({ ...form, phrase: e.target.value })} placeholder="ex: On dit quoi mon frère ?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label><input className="input" value={form.transcription} onChange={e => setForm({ ...form, transcription: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Traduction (français) *</label><input className="input" value={form.traduction} onChange={e => setForm({ ...form, traduction: e.target.value })} placeholder="ex: Comment ça va l'ami ?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contexte</label><input className="input" value={form.contexte} onChange={e => setForm({ ...form, contexte: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">URL Audio</label><input className="input" value={form.audioUrl} onChange={e => setForm({ ...form, audioUrl: e.target.value })} placeholder="https://..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="PUBLISHED">Publiée</option><option value="DRAFT">Brouillon</option></select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Sauvegarde...' : editItem ? 'Mettre à jour' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
