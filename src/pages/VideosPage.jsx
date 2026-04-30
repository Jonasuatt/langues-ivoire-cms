import { useEffect, useState } from 'react';
import { videosAPI, languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, PlayIcon, LinkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CategorySelect from '../components/CategorySelect';

const CATEGORIES = ['prononciation', 'culturel', 'tutoriel', 'musique', 'documentaire'];
const CAT_LABELS = { prononciation: 'Prononciation', culturel: 'Culturel', tutoriel: 'Tutoriel', musique: 'Musique', documentaire: 'Documentaire' };
const CAT_COLORS = {
  prononciation: 'bg-blue-100 text-blue-700',
  culturel: 'bg-purple-100 text-purple-700',
  tutoriel: 'bg-green-100 text-green-700',
  musique: 'bg-pink-100 text-pink-700',
  documentaire: 'bg-orange-100 text-orange-700',
};

const EMPTY_FORM = { titre: '', description: '', url: '', thumbnailUrl: '', duree: '', categorie: 'culturel', languageId: '', ordre: 0 };

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatDuration(seconds) {
  if (!seconds) return '--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = { limit: 50 };
    if (filterCat) params.categorie = filterCat;
    if (filterLang) params.langue = filterLang;
    videosAPI.getAll(params)
      .then(({ data }) => setVideos(data.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterCat, filterLang]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (v) => {
    setEditItem(v);
    setForm({
      titre: v.titre || '', description: v.description || '', url: v.url || '',
      thumbnailUrl: v.thumbnailUrl || '', duree: v.duree || '', categorie: v.categorie || 'culturel',
      languageId: v.languageId || '', ordre: v.ordre || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre || !form.url) { toast.error('Titre et URL requis'); return; }
    setSaving(true);
    try {
      const payload = { ...form, duree: form.duree ? parseInt(form.duree) : null, ordre: parseInt(form.ordre) || 0 };
      if (editItem) {
        await videosAPI.update(editItem.id, payload);
        toast.success('Vidéo mise à jour !');
      } else {
        await videosAPI.create(payload);
        toast.success('Vidéo ajoutée !');
      }
      setShowModal(false);
      load();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Supprimer "${v.titre}" ?`)) return;
    try {
      await videosAPI.delete(v.id);
      toast.success('Vidéo supprimée');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleToggleActive = async (v) => {
    try {
      await videosAPI.update(v.id, { isActive: !v.isActive });
      toast.success(v.isActive ? 'Vidéo désactivée' : 'Vidéo activée');
      load();
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vidéos</h1>
          <p className="text-gray-500 text-sm mt-1">{videos.length} vidéo{videos.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <PlusIcon className="w-4 h-4" /> Ajouter une vidéo
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <CategorySelect
          value={filterCat}
          onChange={setFilterCat}
          options={CATEGORIES.map(c => ({ value: c, label: CAT_LABELS[c] || c }))}
          storageKey="videos"
          placeholder="Toutes catégories"
          className="input max-w-[200px]"
        />
        <select className="input max-w-[180px]" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.code}>{l.nom}</option>)}
        </select>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map(v => {
            const ytId = extractYoutubeId(v.url);
            const thumb = v.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
            return (
              <div key={v.id} className={`card ${!v.isActive ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                    onClick={() => setPreviewId(previewId === v.id ? null : v.id)}>
                    {thumb ? (
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <PlayIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                    {v.duree && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(v.duree)}
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{v.titre}</h3>
                      <span className={`badge flex-shrink-0 ${CAT_COLORS[v.categorie] || 'bg-gray-100 text-gray-600'}`}>
                        {CAT_LABELS[v.categorie] || v.categorie}
                      </span>
                    </div>
                    {v.description && <p className="text-sm text-gray-500 line-clamp-1">{v.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      {v.language && <span className="text-accent font-medium">{v.language.nom}</span>}
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {v.source}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleToggleActive(v)}
                      className={`p-1.5 rounded-lg transition-colors ${v.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={v.isActive ? 'Désactiver' : 'Activer'}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>
                    </button>
                    <button onClick={() => openEdit(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Preview YouTube inline */}
                {previewId === v.id && ytId && (
                  <div className="mt-3 rounded-lg overflow-hidden aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            );
          })}
          {videos.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              Aucune vidéo pour ce filtre. Cliquez sur "Ajouter une vidéo" pour commencer.
            </div>
          )}
        </div>
      )}

      {/* Modal Ajout / Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editItem ? 'Modifier la vidéo' : 'Nouvelle vidéo'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input className="input" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})}
                  placeholder="ex: Salutations en Baoulé" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo *</label>
                <input className="input" value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..." />
                {form.url && extractYoutubeId(form.url) && (
                  <div className="mt-2 rounded-lg overflow-hidden aspect-video bg-gray-100">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYoutubeId(form.url)}`}
                      className="w-full h-full"
                      allow="encrypted-media"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <CategorySelect
                    value={form.categorie}
                    onChange={v => setForm(f => ({ ...f, categorie: v }))}
                    options={CATEGORIES.map(c => ({ value: c, label: CAT_LABELS[c] || c }))}
                    storageKey="videos"
                    placeholder={null}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select className="input" value={form.languageId} onChange={e => setForm({...form, languageId: e.target.value})}>
                    <option value="">-- Toutes --</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input h-20 resize-none" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Description optionnelle..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (secondes)</label>
                  <input type="number" className="input" value={form.duree}
                    onChange={e => setForm({...form, duree: e.target.value})} placeholder="ex: 180" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                  <input type="number" className="input" value={form.ordre}
                    onChange={e => setForm({...form, ordre: e.target.value})} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail (optionnel)</label>
                <input className="input" value={form.thumbnailUrl}
                  onChange={e => setForm({...form, thumbnailUrl: e.target.value})}
                  placeholder="Auto-extrait pour YouTube" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde...' : editItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
