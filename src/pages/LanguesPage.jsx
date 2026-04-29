import { useState, useEffect } from 'react';
import {
  GlobeAltIcon, PencilIcon, CheckIcon, XMarkIcon,
  UsersIcon, BookOpenIcon, AcademicCapIcon, StarIcon,
  EyeIcon, EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { languagesAPI } from '../services/api';

const REGIONS = ['Lagunes', 'Vallée du Bandama', 'Zanzan', 'Montagnes', 'Savanes', 'Haut-Sassandra', 'Bas-Sassandra', 'Marahoué', 'N\'Zi-Comoé', 'Sud-Bandama', 'Worodougou'];
const FAMILLES = ['Mandé', 'Kwa', 'Gur', 'Krou', 'Créole urbain'];

export default function LanguesPage() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      // Charger toutes les langues (pas seulement actives)
      const res = await languagesAPI.getAll();
      setLanguages(res.data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (lang) => {
    setForm({
      nom: lang.nom,
      code: lang.code,
      famille: lang.famille || '',
      region: lang.region || '',
      locuteurs: lang.locuteurs || '',
      description: lang.description || '',
      imageDrapeau: lang.imageDrapeau || '',
      ordreAffichage: lang.ordreAffichage ?? 0,
      isActive: lang.isActive,
      isInMvp: lang.isInMvp,
    });
    setEditingId(lang.id);
    setSavedId(null);
  };

  const cancelEdit = () => { setEditingId(null); setForm({}); };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const payload = { ...form, ordreAffichage: parseInt(form.ordreAffichage) || 0 };
      await languagesAPI.update(id, payload);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (lang) => {
    try {
      await languagesAPI.update(lang.id, { isActive: !lang.isActive });
      await load();
    } catch { alert('Erreur'); }
  };

  const toggleMvp = async (lang) => {
    try {
      await languagesAPI.update(lang.id, { isInMvp: !lang.isInMvp });
      await load();
    } catch { alert('Erreur'); }
  };

  const mvpCount = languages.filter(l => l.isInMvp).length;
  const activeCount = languages.filter(l => l.isActive).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Langues</h1>
            <p className="text-sm text-gray-500">
              {activeCount} langue{activeCount !== 1 ? 's' : ''} active{activeCount !== 1 ? 's' : ''} · {mvpCount} en MVP
            </p>
          </div>
        </div>
      </div>

      {/* Résumé statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{languages.length}</p>
          <p className="text-xs text-gray-500 mt-1">Langues au total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Langues actives</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{mvpCount}</p>
          <p className="text-xs text-gray-500 mt-1">Dans le MVP</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {languages
            .sort((a, b) => a.ordreAffichage - b.ordreAffichage)
            .map(lang => (
              <div key={lang.id} className={`bg-white rounded-2xl border shadow-sm transition-all ${editingId === lang.id ? 'border-primary-200 shadow-md' : 'border-gray-100'}`}>
                {/* Mode affichage */}
                {editingId !== lang.id && (
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Drapeau */}
                      {lang.imageDrapeau ? (
                        <img src={lang.imageDrapeau} alt={lang.nom} className="w-14 h-10 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      {/* Infos principales */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{lang.nom}</h3>
                          <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lang.code}</span>
                          {lang.famille && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{lang.famille}</span>}
                          {lang.region && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{lang.region}</span>}
                        </div>
                        {lang.locuteurs && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" />
                            {lang.locuteurs} locuteurs
                          </p>
                        )}
                      </div>

                      {/* Stats contenu */}
                      <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <BookOpenIcon className="w-3.5 h-3.5" />
                          <span>{lang._count?.dictEntries || 0} mots</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AcademicCapIcon className="w-3.5 h-3.5" />
                          <span>{lang._count?.lessons || 0} leçons</span>
                        </div>
                      </div>

                      {/* Badges état */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleMvp(lang)}
                          title={lang.isInMvp ? 'Retirer du MVP' : 'Ajouter au MVP'}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${lang.isInMvp ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                          <SparklesIcon className="w-3 h-3" />
                          MVP
                        </button>
                        <button onClick={() => toggleActive(lang)}
                          title={lang.isActive ? 'Désactiver' : 'Activer'}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${lang.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}>
                          {lang.isActive ? <EyeIcon className="w-3 h-3" /> : <EyeSlashIcon className="w-3 h-3" />}
                          {lang.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => openEdit(lang)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors">
                          <PencilIcon className="w-3 h-3" />
                          Modifier
                        </button>
                      </div>
                    </div>

                    {lang.description && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{lang.description}</p>
                    )}

                    {savedId === lang.id && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Sauvegardé
                      </p>
                    )}
                  </div>
                )}

                {/* Mode édition */}
                {editingId === lang.id && (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-primary-600">Modifier : {lang.nom}</h3>
                      <button onClick={cancelEdit} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <XMarkIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                        <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
                        <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Famille linguistique</label>
                        <select value={form.famille} onChange={e => setForm(f => ({ ...f, famille: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="">— Non renseigné —</option>
                          {FAMILLES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Région</label>
                        <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="">— Non renseignée —</option>
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nombre de locuteurs</label>
                        <input value={form.locuteurs} onChange={e => setForm(f => ({ ...f, locuteurs: e.target.value }))}
                          placeholder="Ex: 2 000 000"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Ordre d'affichage</label>
                        <input type="number" value={form.ordreAffichage} onChange={e => setForm(f => ({ ...f, ordreAffichage: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">URL du drapeau</label>
                        <input type="url" value={form.imageDrapeau} onChange={e => setForm(f => ({ ...f, imageDrapeau: e.target.value }))}
                          placeholder="https://..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                      </div>

                      {/* Toggles */}
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                            className="w-4 h-4 accent-primary-500" />
                          <span className="text-sm text-gray-700">Langue active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.isInMvp} onChange={e => setForm(f => ({ ...f, isInMvp: e.target.checked }))}
                            className="w-4 h-4 accent-amber-500" />
                          <span className="text-sm text-gray-700">Dans le MVP</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-5">
                      <button onClick={cancelEdit}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        Annuler
                      </button>
                      <button onClick={() => handleSave(lang.id)} disabled={saving}
                        className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
