import { useEffect, useState } from 'react';
import { badgesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TrophyIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CATEGORIES = ['linguistique', 'social', 'contribution', 'progression', 'special'];
const CAT_COLORS = {
  linguistique: 'bg-blue-100 text-blue-700',
  social: 'bg-green-100 text-green-700',
  contribution: 'bg-purple-100 text-purple-700',
  progression: 'bg-orange-100 text-orange-700',
  special: 'bg-yellow-100 text-yellow-700',
};

const CONDITION_TYPES = [
  { value: 'lessons_completed', label: 'Leçons complétées' },
  { value: 'streak', label: 'Streak (jours consécutifs)' },
  { value: 'contributions', label: 'Contributions soumises' },
  { value: 'vocabulary_learned', label: 'Mots appris' },
  { value: 'first_lesson', label: 'Première leçon' },
  { value: 'profile_complete', label: 'Profil complet' },
];

const EMPTY_FORM = {
  nom: '', description: '', categorie: 'linguistique',
  pointsXp: 100, imageUrl: '',
  conditionType: 'lessons_completed', conditionCount: 10,
};

function conditionLabel(condition) {
  if (!condition) return '—';
  const type = CONDITION_TYPES.find(t => t.value === condition.type);
  const label = type?.label || condition.type;
  return condition.count ? `${label} × ${condition.count}` : label;
}

export default function BadgesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    badgesAPI.getAll()
      .then(({ data }) => setBadges(data))
      .catch(() => toast.error('Erreur de chargement', { id: 'badges-load' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filterCat ? badges.filter(b => b.categorie === filterCat) : badges;
  const totalAttribues = badges.reduce((s, b) => s + (b._count?.users || 0), 0);
  const totalXp = badges.reduce((s, b) => s + b.pointsXp, 0);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (b) => {
    setEditItem(b);
    setForm({
      nom: b.nom, description: b.description, categorie: b.categorie,
      pointsXp: b.pointsXp, imageUrl: b.imageUrl || '',
      conditionType: b.condition?.type || 'lessons_completed',
      conditionCount: b.condition?.count || 10,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.description || !form.categorie) {
      toast.error('Nom, description et catégorie sont requis');
      return;
    }
    setSaving(true);
    const payload = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      categorie: form.categorie,
      pointsXp: parseInt(form.pointsXp) || 0,
      imageUrl: form.imageUrl || null,
      condition: {
        type: form.conditionType,
        ...(form.conditionCount ? { count: parseInt(form.conditionCount) } : {}),
      },
    };
    try {
      if (editItem) {
        await badgesAPI.update(editItem.id, payload);
        toast.success('Badge mis à jour');
      } else {
        await badgesAPI.create(payload);
        toast.success('Badge créé');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!confirm(`Supprimer le badge "${b.nom}" ? Cette action est irréversible.`)) return;
    try {
      await badgesAPI.delete(b.id);
      toast.success('Badge supprimé');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrophyIcon className="w-7 h-7 text-yellow-500" />
            Badges & XP
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des badges de progression et des points d'expérience</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouveau badge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-gray-800">{badges.length}</p>
          <p className="text-sm text-gray-500">Badges créés</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-yellow-600">{totalAttribues}</p>
          <p className="text-sm text-gray-500">Badges attribués</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-orange-500">{totalXp.toLocaleString()}</p>
          <p className="text-sm text-gray-500">XP total disponible</p>
        </div>
      </div>

      {/* Filtres catégorie */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterCat ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Tous ({badges.length})
        </button>
        {CATEGORIES.map(c => {
          const count = badges.filter(b => b.categorie === c).length;
          if (count === 0) return null;
          return (
            <button key={c} onClick={() => setFilterCat(c === filterCat ? '' : c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filterCat === c ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucun badge{filterCat ? ` dans la catégorie "${filterCat}"` : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* Icône / image */}
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  {b.imageUrl
                    ? <img src={b.imageUrl} alt={b.nom} className="w-10 h-10 object-contain rounded-lg" />
                    : <TrophyIcon className="w-6 h-6 text-yellow-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{b.nom}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{b.description}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(b)}
                        className="p-1 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(b)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`badge text-xs ${CAT_COLORS[b.categorie] || 'bg-gray-100 text-gray-600'}`}>
                      {b.categorie}
                    </span>
                    <span className="text-xs font-semibold text-orange-500">+{b.pointsXp} XP</span>
                    <span className="text-xs text-gray-400">🏅 {b._count?.users || 0} utilisateurs</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 italic">{conditionLabel(b.condition)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal création / édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editItem ? 'Modifier le badge' : 'Nouveau badge'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input className="input" value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  placeholder="ex: Apprenti Linguiste" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea className="input h-20 resize-none" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="ex: Complétez 10 leçons pour obtenir ce badge" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select className="input" value={form.categorie}
                    onChange={e => setForm({ ...form, categorie: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" className="input" value={form.pointsXp}
                    onChange={e => setForm({ ...form, pointsXp: e.target.value })}
                    min="0" step="10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition d'obtention</label>
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={form.conditionType}
                    onChange={e => setForm({ ...form, conditionType: e.target.value })}>
                    {CONDITION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input type="number" className="input" value={form.conditionCount}
                    onChange={e => setForm({ ...form, conditionCount: e.target.value })}
                    placeholder="Nombre requis" min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image (optionnel)</label>
                <input className="input" value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde...' : editItem ? 'Mettre à jour' : 'Créer le badge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
