import { useEffect, useState, useRef } from 'react';
import api, { uploadAPI } from '../services/api';
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  Squares2X2Icon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EMPTY_GALLERY_FORM = {
  languageId: '',
  rubrique: '',
  titre: '',
  description: '',
  coverUrl: '',
  ordre: 0,
  status: 'DRAFT',
};

const EMPTY_IMAGE_FORM = {
  imageUrl: '',
  legende: '',
  transcription: '',
  traduction: '',
  ordre: 1,
};

export default function ImageGalleryPage() {
  /* ── State ─────────────────────────────────────────────── */
  const [languages, setLanguages] = useState([]);
  const [rubriques, setRubriques] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterLang, setFilterLang] = useState('');
  const [filterRubrique, setFilterRubrique] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Gallery modal (create / edit)
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [editGallery, setEditGallery] = useState(null);
  const [galleryForm, setGalleryForm] = useState(EMPTY_GALLERY_FORM);
  const [savingGallery, setSavingGallery] = useState(false);
  const [rubriqueSuggestions, setRubriqueSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Images modal
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageForm, setImageForm] = useState(EMPTY_IMAGE_FORM);
  const [savingImage, setSavingImage] = useState(false);

  // Upload state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  // File input refs
  const coverFileRef = useRef(null);
  const galleryImageFileRef = useRef(null);
  const rubriquesRef = useRef(null);

  /* ── Toast helpers ─────────────────────────────────────── */
  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 5000);
  };
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  /* ── Upload handlers ───────────────────────────────────── */
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await uploadAPI.uploadImage(formData);
      setGalleryForm((prev) => ({ ...prev, coverUrl: data.imageUrl }));
      toast.success('Image uploadée !');
    } catch {
      toast.error("Erreur upload image");
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleGalleryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGalleryImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await uploadAPI.uploadImage(formData);
      setImageForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Image uploadée !');
    } catch {
      toast.error("Erreur upload image");
    } finally {
      setUploadingGalleryImage(false);
      e.target.value = '';
    }
  };

  /* ── Initial data load ─────────────────────────────────── */
  useEffect(() => {
    api.get('/languages')
      .then(({ data }) => setLanguages(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.get('/image-galleries/rubriques')
      .then(({ data }) => setRubriques(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* ── Load galleries ────────────────────────────────────── */
  const loadGalleries = () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page });
    if (filterLang) params.set('langue', filterLang);
    if (filterRubrique) params.set('rubrique', filterRubrique);
    if (filterStatus) params.set('status', filterStatus);

    api.get(`/image-galleries/admin/list?${params.toString()}`)
      .then(({ data }) => {
        setGalleries(data.data || data.galleries || []);
        const tp = data.totalPages || Math.ceil((data.total || 0) / 12) || 1;
        setTotalPages(tp);
      })
      .catch((err) => showError(err.response?.data?.error || 'Erreur lors du chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGalleries(); }, [filterLang, filterRubrique, filterStatus, page]);

  /* ── Gallery modal ─────────────────────────────────────── */
  const openAddGallery = () => {
    setEditGallery(null);
    setGalleryForm(EMPTY_GALLERY_FORM);
    setShowGalleryModal(true);
  };

  const openEditGallery = (g) => {
    setEditGallery(g);
    setGalleryForm({
      languageId: g.languageId || g.language?.id || '',
      rubrique: g.rubrique || '',
      titre: g.titre || '',
      description: g.description || '',
      coverUrl: g.coverUrl || '',
      ordre: g.ordre ?? 0,
      status: g.status || 'DRAFT',
    });
    setShowGalleryModal(true);
  };

  const handleSaveGallery = async () => {
    if (!galleryForm.titre.trim()) { showError('Le titre est obligatoire'); return; }
    setSavingGallery(true);
    try {
      if (editGallery) {
        await api.patch(`/image-galleries/admin/${editGallery.id}`, galleryForm);
        showSuccess('Galerie mise à jour !');
      } else {
        await api.post('/image-galleries/admin', galleryForm);
        showSuccess('Galerie créée !');
      }
      setShowGalleryModal(false);
      loadGalleries();
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSavingGallery(false);
    }
  };

  const handleDeleteGallery = async (g) => {
    if (!confirm(`Supprimer la galerie "${g.titre}" ?`)) return;
    try {
      await api.delete(`/image-galleries/admin/${g.id}`);
      showSuccess('Galerie supprimée');
      loadGalleries();
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  /* ── Rubrique autocomplete ─────────────────────────────── */
  const handleRubriqueChange = (val) => {
    setGalleryForm((f) => ({ ...f, rubrique: val }));
    if (val.length > 0) {
      const filtered = rubriques.filter((r) =>
        r.toLowerCase().includes(val.toLowerCase())
      );
      setRubriqueSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  /* ── Images modal ──────────────────────────────────────── */
  const openImagesModal = async (g) => {
    setCurrentGallery(g);
    setShowImagesModal(true);
    setGalleryImages([]);
    setLoadingImages(true);
    setImageForm({ ...EMPTY_IMAGE_FORM, ordre: 1 });
    try {
      const { data } = await api.get(`/image-galleries/${g.id}`);
      const imgs = data.images || data.GalleryImage || [];
      setGalleryImages(imgs);
      setImageForm((f) => ({ ...f, ordre: imgs.length + 1 }));
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur lors du chargement des images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAddImage = async () => {
    if (!imageForm.imageUrl.trim()) { showError("L'URL de l'image est obligatoire"); return; }
    setSavingImage(true);
    try {
      await api.post(`/image-galleries/admin/${currentGallery.id}/images`, imageForm);
      showSuccess('Image ajoutée !');
      setImageForm({ ...EMPTY_IMAGE_FORM, ordre: galleryImages.length + 2 });
      // Refresh images
      const { data } = await api.get(`/image-galleries/${currentGallery.id}`);
      const imgs = data.images || data.GalleryImage || [];
      setGalleryImages(imgs);
      loadGalleries();
    } catch (err) {
      showError(err.response?.data?.error || "Erreur lors de l'ajout");
    } finally {
      setSavingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      await api.delete(`/image-galleries/admin/${currentGallery.id}/images/${imageId}`);
      showSuccess('Image supprimée');
      const { data } = await api.get(`/image-galleries/${currentGallery.id}`);
      const imgs = data.images || data.GalleryImage || [];
      setGalleryImages(imgs);
      loadGalleries();
    } catch (err) {
      showError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Galeries d'Images</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Gérez les galeries photographiques par langue et rubrique
            </p>
          </div>
          <button
            onClick={openAddGallery}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow"
          >
            <PlusIcon className="w-5 h-5" />
            Nouvelle galerie
          </button>
        </div>
      </div>

      <div className="px-8 py-6">

        {/* ── Toast messages ──────────────────────────────────── */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError('')}><XMarkIcon className="w-4 h-4" /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-sm">{success}</span>
            <button onClick={() => setSuccess('')}><XMarkIcon className="w-4 h-4" /></button>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            value={filterLang}
            onChange={(e) => { setFilterLang(e.target.value); setPage(1); }}
          >
            <option value="">Toutes les langues</option>
            {languages.map((l) => (
              <option key={l.id} value={l.code}>{l.nom}</option>
            ))}
          </select>

          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            placeholder="Filtrer par rubrique..."
            value={filterRubrique}
            onChange={(e) => { setFilterRubrique(e.target.value); setPage(1); }}
          />

          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {[
              { label: 'Tout', value: '' },
              { label: 'Brouillon', value: 'DRAFT' },
              { label: 'Publié', value: 'PUBLISHED' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilterStatus(opt.value); setPage(1); }}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Gallery grid ────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse h-64" />
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 text-gray-400">
            <PhotoIcon className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-base font-medium">Aucune galerie trouvée</p>
            <p className="text-sm mt-1">Créez votre première galerie d'images</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleries.map((g) => (
              <div key={g.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover image */}
                <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                  {g.coverUrl ? (
                    <img
                      src={g.coverUrl}
                      alt={g.titre}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-300" />
                  )}
                  {/* Rubrique badge */}
                  {g.rubrique && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {g.rubrique}
                    </span>
                  )}
                  {/* Language badge */}
                  {(g.language?.nom || g.langue) && (
                    <span className="absolute top-2 right-2 bg-gray-800/70 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {g.language?.nom || g.langue}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-2">{g.titre}</h3>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      g.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {g.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {g._count?.images ?? g.imageCount ?? g.images?.length ?? 0} photo(s)
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditGallery(g)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => openImagesModal(g)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      title="Gérer les images"
                    >
                      <Squares2X2Icon className="w-3.5 h-3.5" />
                      Images
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(g)}
                      className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white border border-gray-200 rounded-xl px-4 py-3">
            <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          Modal 1 — Create / Edit Gallery
      ══════════════════════════════════════════════════════ */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editGallery ? 'Modifier la galerie' : 'Nouvelle galerie'}
              </h2>
              <button onClick={() => setShowGalleryModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Langue + Rubrique */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={galleryForm.languageId}
                    onChange={(e) => setGalleryForm((f) => ({ ...f, languageId: e.target.value }))}
                  >
                    <option value="">-- Choisir --</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="relative" ref={rubriquesRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rubrique</label>
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="ex: Cérémonies, Paysages..."
                    value={galleryForm.rubrique}
                    onChange={(e) => handleRubriqueChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => {
                      if (galleryForm.rubrique && rubriqueSuggestions.length > 0) setShowSuggestions(true);
                    }}
                  />
                  {showSuggestions && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                      {rubriqueSuggestions.map((r) => (
                        <button
                          key={r}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          onMouseDown={() => {
                            setGalleryForm((f) => ({ ...f, rubrique: r }));
                            setShowSuggestions(false);
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ex: Fête des ignames 2023"
                  value={galleryForm.titre}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, titre: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                  placeholder="Description de la galerie..."
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Cover URL + upload + preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de couverture</label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://... ou uploader ci-contre"
                    value={galleryForm.coverUrl}
                    onChange={(e) => setGalleryForm((f) => ({ ...f, coverUrl: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => coverFileRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors whitespace-nowrap"
                  >
                    <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                    {uploadingCover ? 'Upload...' : 'Parcourir'}
                  </button>
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </div>
                {galleryForm.coverUrl && (
                  <div className="mt-2 flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-2">
                    <img
                      src={galleryForm.coverUrl}
                      alt="Aperçu couverture"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}
                    />
                    <span className="text-xs text-gray-400">Aperçu de la couverture</span>
                  </div>
                )}
              </div>

              {/* Ordre + Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input
                    type="number"
                    min="0"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={galleryForm.ordre}
                    onChange={(e) => setGalleryForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={galleryForm.status}
                    onChange={(e) => setGalleryForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setShowGalleryModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveGallery}
                disabled={savingGallery}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingGallery ? 'Sauvegarde...' : editGallery ? 'Mettre à jour' : 'Créer la galerie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          Modal 2 — Manage Images
      ══════════════════════════════════════════════════════ */}
      {showImagesModal && currentGallery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Images de la galerie</h2>
                <p className="text-sm text-gray-500 mt-0.5">{currentGallery.titre}</p>
              </div>
              <button onClick={() => setShowImagesModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* ── Add image form ──────────────────────────── */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  Ajouter une image
                </h3>

                <div className="space-y-3">
                  {/* Image URL + upload */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL de l'image *</label>
                    <div className="flex gap-2">
                      <input
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="https://... ou uploader ci-contre"
                        value={imageForm.imageUrl}
                        onChange={(e) => setImageForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => galleryImageFileRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors whitespace-nowrap"
                      >
                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                        {uploadingGalleryImage ? 'Upload...' : 'Parcourir'}
                      </button>
                      <input
                        ref={galleryImageFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryImageUpload}
                      />
                    </div>
                    {imageForm.imageUrl && (
                      <div className="mt-1.5 flex items-center gap-2 bg-white border border-gray-100 rounded-lg p-1.5">
                        <img
                          src={imageForm.imageUrl}
                          alt="Aperçu"
                          className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="text-xs text-gray-400">Aperçu</span>
                      </div>
                    )}
                  </div>

                  {/* Légende */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Légende</label>
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="Courte description de l'image"
                      value={imageForm.legende}
                      onChange={(e) => setImageForm((f) => ({ ...f, legende: e.target.value }))}
                    />
                  </div>

                  {/* Transcription + Traduction */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Transcription (langue locale)</label>
                      <input
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="Ex: Akwaba..."
                        value={imageForm.transcription}
                        onChange={(e) => setImageForm((f) => ({ ...f, transcription: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Traduction</label>
                      <input
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        placeholder="Traduction en français"
                        value={imageForm.traduction}
                        onChange={(e) => setImageForm((f) => ({ ...f, traduction: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Ordre */}
                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                      <input
                        type="number"
                        min="1"
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        value={imageForm.ordre}
                        onChange={(e) => setImageForm((f) => ({ ...f, ordre: parseInt(e.target.value, 10) || 1 }))}
                      />
                    </div>
                    <div className="flex-1 flex items-end">
                      <button
                        onClick={handleAddImage}
                        disabled={savingImage}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        {savingImage ? 'Ajout...' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Images list ─────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  {galleryImages.length} image(s) dans la galerie
                </h3>

                {loadingImages ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <PhotoIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucune image dans cette galerie</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {galleryImages
                      .slice()
                      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
                      .map((img) => (
                        <div
                          key={img.id}
                          className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors"
                        >
                          {/* Order number */}
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full text-xs font-bold text-gray-600 flex items-center justify-center">
                            {img.ordre ?? '—'}
                          </span>

                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                            {img.imageUrl ? (
                              <img
                                src={img.imageUrl}
                                alt={img.legende || ''}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <PhotoIcon className="w-5 h-5 text-gray-300" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {img.legende || <span className="text-gray-400 italic">Sans légende</span>}
                            </p>
                            {img.transcription && (
                              <p className="text-xs text-gray-500 truncate italic">{img.transcription}</p>
                            )}
                            {img.traduction && (
                              <p className="text-xs text-gray-400 truncate">{img.traduction}</p>
                            )}
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer l'image"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setShowImagesModal(false)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
