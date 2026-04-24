import { useEffect, useState } from 'react';
import { culturalAPI, languagesAPI } from '../services/api';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TYPES = ['PROVERB','TRADITION','ANECDOTE','TALE','MUSIC','DANCE'];
const TYPE_LABELS = { PROVERB:'Proverbe', TRADITION:'Tradition', ANECDOTE:'Anecdote', TALE:'Conte', MUSIC:'Musique', DANCE:'Danse' };
const TYPE_COLORS = { PROVERB:'bg-purple-100 text-purple-700', TRADITION:'bg-green-100 text-green-700',
  ANECDOTE:'bg-blue-100 text-blue-700', TALE:'bg-orange-100 text-orange-700',
  MUSIC:'bg-pink-100 text-pink-700', DANCE:'bg-teal-100 text-teal-700' };

const EMPTY_FORM = { type: 'PROVERB', contenu: '', traduction: '', sourceEthnique: '', titre: '', languageId: '' };

export default function CulturalPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [filterLang, setFilterLang] = useState('');

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = { limit: 50 };
    if (filterType) params.type = filterType;
    if (filterLang) params.langue = filterLang;
    culturalAPI.getAll(params)
      .then(({ data }) => setItems(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterType, filterLang]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ type: item.type, contenu: item.contenu || '', traduction: item.traduction || '', sourceEthnique: item.sourceEthnique || '', titre: item.titre || '', languageId: item.languageId || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.contenu) { toast.error('Contenu obligatoire'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/cultural/${editItem.id}`, form);
        toast.success('Élément mis à jour !');
      } else {
        await culturalAPI.create({ ...form, isActive: true });
        toast.success('Contenu culturel ajouté !');
      }
      setShowModal(false);
      load();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer ce ${TYPE_LABELS[item.type]} ?`)) return;
    try {
      await api.delete(`/cultural/${item.id}`);
      toast.success('Élément supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Culture & Traditions</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} élément(s) culturel(s)</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <PlusIcon className="w-4 h-4" /> Ajouter un élément
        </button>
      </div>

      {/* Aide contextuelle */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Comment ça marche ?</p>
          <p>Chaque jour, l'application mobile affiche automatiquement <strong>un élément culturel différent</strong> aux utilisateurs (le "Point culturel du jour"). Plus vous ajoutez d'éléments, plus le contenu est varié. Les proverbes, traditions et contes sont particulièrement appréciés.</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterType ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setFilterType('')}>Tout</button>
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t === filterType ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === t ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{TYPE_LABELS[t]}</button>
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
            <div key={item.id} className="card">
              <div className="flex items-start gap-3">
                <span className={`badge flex-shrink-0 mt-0.5 ${TYPE_COLORS[item.type]}`}>{TYPE_LABELS[item.type]}</span>
                <div className="flex-1 min-w-0">
                  {item.titre && <p className="text-sm font-semibold text-gray-900 mb-1">{item.titre}</p>}
                  <p className="text-gray-700 italic">"{item.contenu}"</p>
                  {item.traduction && <p className="text-sm text-gray-500 mt-1">{item.traduction}</p>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="text-right">
                    {item.sourceEthnique && <p className="text-xs text-gray-400">— {item.sourceEthnique}</p>}
                    {item.language && <p className="text-xs text-accent font-medium mt-0.5">{item.language.nom}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="card text-center py-12 text-gray-400">Aucun contenu pour ce filtre</div>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editItem ? 'Modifier l\'élément' : 'Nouveau contenu culturel'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select className="input" value={form.languageId} onChange={e => setForm({...form, languageId: e.target.value})}>
                    <option value="">-- Choisir --</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input className="input" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} placeholder="ex: Le conte de l'araignée" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source ethnique</label>
                  <input className="input" value={form.sourceEthnique} onChange={e => setForm({...form, sourceEthnique: e.target.value})} placeholder="ex: Baoulé" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contenu en langue locale *
                  </label>
                  <span className={`text-xs font-medium ${form.contenu.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                    {form.contenu.length}/280 caractères
                  </span>
                </div>
                <textarea className="input h-24 resize-none" value={form.contenu} required
                  onChange={e => setForm({...form, contenu: e.target.value})}
                  placeholder="Ex: Ɔbaa na ɔwɔ ho a, ɛyɛ ofi (Baoulé — le proverbe dans la langue locale)" />
                {form.contenu.length > 280 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Texte trop long pour l'affichage mobile (max. 280 caractères recommandés)</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traduction en français
                </label>
                <input className="input" value={form.traduction}
                  onChange={e => setForm({...form, traduction: e.target.value})}
                  placeholder="Ex: La femme présente est le foyer de la maison" />
                <p className="text-xs text-gray-400 mt-1">La traduction aide les apprenants à comprendre le sens</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
