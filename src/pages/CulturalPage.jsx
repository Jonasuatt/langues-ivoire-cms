import { useEffect, useState } from 'react';
import { culturalAPI } from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TYPES = ['PROVERB','TRADITION','ANECDOTE','TALE','MUSIC','DANCE'];
const TYPE_LABELS = { PROVERB:'Proverbe', TRADITION:'Tradition', ANECDOTE:'Anecdote', TALE:'Conte', MUSIC:'Musique', DANCE:'Danse' };
const TYPE_COLORS = { PROVERB:'bg-purple-100 text-purple-700', TRADITION:'bg-green-100 text-green-700',
  ANECDOTE:'bg-blue-100 text-blue-700', TALE:'bg-orange-100 text-orange-700',
  MUSIC:'bg-pink-100 text-pink-700', DANCE:'bg-teal-100 text-teal-700' };

export default function CulturalPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'PROVERB', contenu: '', traduction: '', sourceEthnique: '' });

  const load = () => {
    setLoading(true);
    const params = { limit: 30 };
    if (filterType) params.type = filterType;
    culturalAPI.getAll(params)
      .then(({ data }) => setItems(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await culturalAPI.create({ ...form, isActive: true });
      toast.success('Contenu culturel ajouté !');
      setShowForm(false);
      setForm({ type: 'PROVERB', contenu: '', traduction: '', sourceEthnique: '' });
      load();
    } catch { toast.error('Erreur lors de l\'ajout.'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenu Culturel</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} éléments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusIcon className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="card mb-6 border border-accent/30">
          <h3 className="font-semibold text-gray-900 mb-4">Nouveau contenu culturel</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source ethnique</label>
              <input className="input" value={form.sourceEthnique}
                onChange={e => setForm(f => ({ ...f, sourceEthnique: e.target.value }))} placeholder="ex: Baoulé" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
              <textarea className="input h-24 resize-none" value={form.contenu} required
                onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                placeholder="Proverbe, tradition, anecdote..." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Traduction (français)</label>
              <input className="input" value={form.traduction}
                onChange={e => setForm(f => ({ ...f, traduction: e.target.value }))} />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterType ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setFilterType('')}>Tout</button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t === filterType ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === t ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-start gap-3">
                <span className={`badge flex-shrink-0 mt-0.5 ${TYPE_COLORS[item.type]}`}>{TYPE_LABELS[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 italic">"{item.contenu}"</p>
                  {item.traduction && <p className="text-sm text-gray-500 mt-1">{item.traduction}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  {item.sourceEthnique && <p className="text-xs text-gray-400">— {item.sourceEthnique}</p>}
                  {item.language && <p className="text-xs text-accent font-medium mt-0.5">{item.language.nom}</p>}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="card text-center py-12 text-gray-400">Aucun contenu pour ce filtre</div>}
        </div>
      )}
    </div>
  );
}
