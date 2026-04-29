import { useState, useEffect } from 'react';
import {
  TrophyIcon, PlusIcon, PencilIcon, TrashIcon,
  StarIcon, XMarkIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { badgesAPI } from '../services/api';

const CATEGORIES = ['linguistique', 'culturel', 'social', 'progression'];

const CONDITION_TEMPLATES = [
  { label: 'Leçons complétées', value: JSON.stringify({ type: 'lessons_completed', count: 10 }) },
  { label: 'Mots appris', value: JSON.stringify({ type: 'words_learned', count: 50 }) },
  { label: 'Streak de jours', value: JSON.stringify({ type: 'streak_days', count: 7 }) },
  { label: 'Contributions', value: JSON.stringify({ type: 'contributions', count: 5 }) },
  { label: 'XP total', value: JSON.stringify({ type: 'total_xp', count: 500 }) },
];

const CAT_COLORS = {
  linguistique: 'bg-blue-100 text-blue-700',
  culturel:     'bg-purple-100 text-purple-700',
  social:       'bg-green-100 text-green-700',
  progression:  'bg-amber-100 text-amber-700',
};

const EMPTY_FORM = {
  nom: '', description: '', imageUrl: '', categorie: 'progression',
  condition: JSON.stringify({ type: 'lessons_completed', count: 1 }),
  pointsXp: 0,
};

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [conditionError, setConditionError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await badgesAPI.getAll();
      setBadges(res.data);
    } catch {
      setError('Impossible de charger les badges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setConditionError('');
    setShowModal(true);
  };

  const openEdit = (badge) => {
    setForm({
      nom: badge.nom,
      description: badge.description,
      imageUrl: badge.imageUrl || '',
      categorie: badge.categorie,
      condition: JSON.stringify(badge.condition, null, 2),
      pointsXp: badge.pointsXp,
    });
    setEditingId(badge.id);
    setConditionError('');
    setShowModal(true);
  };

  const validateCondition = (val) => {
    try { JSON.parse(val); setConditionError(''); return true; }
    catch { setConditionError('JSON invalide'); return false; }
  };

  const handleSave = async () => {
    if (!validateCondition(form.condition)) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        condition: JSON.parse(form.condition),
        pointsXp: parseInt(form.pointsXp) || 0,
      };
      if (editingId) {
        await badgesAPI.update(editingId, payload);
      } else {
        await badgesAPI.create(payload);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await badgesAPI.delete(id);
      setDeleteConfirm(null);
      await load();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const filtered = badges.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.nom.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    const matchCat = !filterCat || b.categorie === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <TrophyIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Badges & Récompenses</h1>
            <p className="text-sm text-gray-500">{badges.length} badge{badges.length !== 1 ? 's' : ''} configuré{badges.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Nouveau badge
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Rechercher un badge..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(badge => (
            <div key={badge.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.nom} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="w-7 h-7 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{badge.nom}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[badge.categorie] || 'bg-gray-100 text-gray-600'}`}>
                      {badge.categorie}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(badge)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(badge)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{badge.description}</p>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-600">
                  <StarIcon className="w-3.5 h-3.5" />
                  <span className="font-semibold">{badge.pointsXp} XP</span>
                </div>
                <span className="text-gray-400">
                  {badge._count?.users || 0} utilisateur{badge._count?.users !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="mt-2 bg-gray-50 rounded-lg px-2 py-1.5">
                <p className="text-xs text-gray-500 font-mono truncate">
                  {JSON.stringify(badge.condition)}
                </p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <TrophyIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun badge trouvé</p>
              <p className="text-sm mt-1">Créez votre premier badge pour récompenser les apprenants.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Modifier le badge' : 'Nouveau badge'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du badge *</label>
                <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Premier pas" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Décrivez comment obtenir ce badge..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" min="0" value={form.pointsXp} onChange={e => setForm(f => ({ ...f, pointsXp: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image (optionnel)</label>
                <input type="url" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..." />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Condition d'obtention (JSON) *</label>
                  <select className="text-xs border border-gray-200 rounded px-2 py-1"
                    onChange={e => { if (e.target.value) { setForm(f => ({ ...f, condition: e.target.value })); setConditionError(''); } }}>
                    <option value="">Modèles...</option>
                    {CONDITION_TEMPLATES.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <textarea value={form.condition}
                  onChange={e => { setForm(f => ({ ...f, condition: e.target.value })); validateCondition(e.target.value); }}
                  rows={4} className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 ${conditionError ? 'border-red-400' : 'border-gray-200'}`} />
                {conditionError && <p className="text-xs text-red-500 mt-1">{conditionError}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  Exemples : <code className="bg-gray-100 px-1 rounded">{"{ \"type\": \"lessons_completed\", \"count\": 10 }"}</code>
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.nom || !form.description || !!conditionError}
                className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                {editingId ? 'Enregistrer' : 'Créer le badge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce badge ?</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>« {deleteConfirm.nom} »</strong> sera supprimé définitivement, ainsi que tous les badges attribués aux utilisateurs.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
