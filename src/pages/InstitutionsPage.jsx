/**
 * InstitutionsPage.jsx
 * Gestion des partenaires et institutions — Langues Ivoire CMS
 * CRUD complet : nom, logo, description, site web, activation / retrait
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { institutionsAPI, uploadAPI } from '../services/api';
import {
  PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon,
  PauseCircleIcon, MagnifyingGlassIcon, BuildingLibraryIcon,
  XMarkIcon, GlobeAltIcon, ArrowUpIcon, ArrowDownIcon,
  ArrowUpTrayIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import PageHelp from '../components/PageHelp';

// ─── Composants utilitaires ───────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function PartenaireForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    nom: initial?.nom || '',
    logoUrl: initial?.logoUrl || '',
    description: initial?.description || '',
    siteWeb: initial?.siteWeb || '',
    categorie: initial?.categorie || '',
    pays: initial?.pays || '',
    ordre: initial?.ordre ?? 0,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFile = async (file) => {
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setUploadError('Format non supporté. Utilisez PNG, JPG, WEBP, SVG ou GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Fichier trop lourd (max 5 Mo).');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadAPI.uploadImage(fd);
      const url = res.data?.url || res.data?.secure_url || res.data?.imageUrl;
      if (!url) throw new Error('URL manquante dans la réponse');
      set('logoUrl', url);
    } catch (e) {
      setUploadError('Échec de l\'upload : ' + (e.response?.data?.error || e.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Nom de l'institution *</label>
        <input
          type="text"
          value={form.nom}
          onChange={e => set('nom', e.target.value)}
          required
          placeholder="ex: Anthropic (Claude AI)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      {/* ── Logo ── */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-2">Logo</label>

        {/* Zone de preview / drag-and-drop */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all ${
            dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          {form.logoUrl ? (
            /* Aperçu du logo */
            <div className="flex items-center gap-4 p-4">
              <div className="w-20 h-20 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 font-bold mb-0.5">✅ Logo importé</p>
                <p className="text-xs text-gray-400 break-all line-clamp-2">{form.logoUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => { set('logoUrl', ''); if (fileRef.current) fileRef.current.value = ''; }}
                className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-colors flex-shrink-0"
                title="Supprimer le logo"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Zone vide — invite upload */
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              {uploading ? (
                <>
                  <div className="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm font-semibold text-primary-600">Envoi en cours…</p>
                </>
              ) : (
                <>
                  <PhotoIcon className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-600">
                    Glissez un fichier ici ou{' '}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-primary-600 underline hover:text-primary-700"
                    >
                      parcourez
                    </button>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, SVG · max 5 Mo</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Input fichier caché */}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Boutons d'action logo */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            {uploading ? 'Envoi…' : 'Importer depuis le PC'}
          </button>
          <span className="text-xs text-gray-300">ou</span>
          <input
            type="url"
            value={form.logoUrl}
            onChange={e => set('logoUrl', e.target.value)}
            placeholder="Coller une URL…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>

        {uploadError && (
          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
            ⚠️ {uploadError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          placeholder="Décrivez le rôle et l'engagement de ce partenaire dans le projet..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Site web</label>
        <input
          type="url"
          value={form.siteWeb}
          onChange={e => set('siteWeb', e.target.value)}
          placeholder="https://www.exemple.com"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Catégorie</label>
          <input
            type="text"
            value={form.categorie}
            onChange={e => set('categorie', e.target.value)}
            placeholder="ex: Technologie IA"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Pays</label>
          <input
            type="text"
            value={form.pays}
            onChange={e => set('pays', e.target.value)}
            placeholder="ex: Côte d'Ivoire"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Ordre d'affichage</label>
        <input
          type="number"
          min={0}
          value={form.ordre}
          onChange={e => set('ordre', Number(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">0 = premier affiché dans l'application</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="px-6 py-2 text-sm font-bold bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors">
          {loading ? 'Enregistrement…' : initial ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

function PartenaireCard({ partenaire, onEdit, onToggle, onDelete, onMove, isFirst, isLast }) {
  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${
      partenaire.isActive
        ? 'border-gray-100 shadow-sm hover:shadow-md'
        : 'border-dashed border-gray-200 opacity-60'
    }`}>
      <div className="p-5 flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {partenaire.logoUrl ? (
            <img
              src={partenaire.logoUrl}
              alt={partenaire.nom}
              className="w-full h-full object-contain p-1"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-gray-400 ${partenaire.logoUrl ? 'hidden' : ''}`}
          >
            <BuildingLibraryIcon className="w-8 h-8" />
          </div>
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-black text-gray-900 text-base">{partenaire.nom}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              partenaire.isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              {partenaire.isActive ? '✅ Actif' : '⏸ Inactif'}
            </span>
            {partenaire.categorie && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                {partenaire.categorie}
              </span>
            )}
            {partenaire.pays && (
              <span className="text-xs text-gray-400">🌍 {partenaire.pays}</span>
            )}
          </div>

          {partenaire.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{partenaire.description}</p>
          )}

          {partenaire.siteWeb && (
            <a
              href={partenaire.siteWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-1.5"
            >
              <GlobeAltIcon className="w-3.5 h-3.5" />
              {partenaire.siteWeb.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex gap-1 mb-1">
            <button onClick={() => onMove(partenaire, -1)} disabled={isFirst}
              className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors" title="Monter">
              <ArrowUpIcon className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={() => onMove(partenaire, 1)} disabled={isLast}
              className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors" title="Descendre">
              <ArrowDownIcon className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <button onClick={() => onEdit(partenaire)}
            className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors" title="Modifier">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onToggle(partenaire)}
            className={`p-2 rounded-xl transition-colors ${partenaire.isActive ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}
            title={partenaire.isActive ? 'Désactiver (retirer)' : 'Réactiver'}>
            {partenaire.isActive ? <PauseCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(partenaire)}
            className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Supprimer définitivement">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ordre badge */}
      <div className="px-5 pb-3 flex items-center gap-2">
        <span className="text-xs text-gray-400">Position #{partenaire.ordre}</span>
        {partenaire.ordre === 0 && (
          <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full font-semibold">
            ⭐ Premier affiché
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function InstitutionsPage() {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | { item }
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await institutionsAPI.getAll();
      const data = res.data || [];
      setPartenaires(data.sort((a, b) => a.ordre - b.ordre));
    } catch {
      showToast('❌ Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (modal?.item) {
        await institutionsAPI.update(modal.item.id, data);
        showToast('✅ Partenaire modifié');
      } else {
        await institutionsAPI.create(data);
        showToast('✅ Partenaire ajouté');
      }
      setModal(null);
      load();
    } catch (e) {
      showToast('❌ ' + (e.response?.data?.error || 'Erreur'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await institutionsAPI.toggle(item.id);
      showToast(item.isActive ? '⏸ Partenaire désactivé (retiré de l\'app)' : '✅ Partenaire réactivé');
      load();
    } catch { showToast('❌ Erreur'); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer définitivement "${item.nom}" ?\n\nCette action est irréversible.`)) return;
    try {
      await institutionsAPI.delete(item.id);
      showToast('🗑 Partenaire supprimé');
      load();
    } catch { showToast('❌ Erreur de suppression'); }
  };

  const handleMove = async (item, direction) => {
    // Réordonner localement + persister l'ordre
    const sorted = [...partenaires];
    const idx = sorted.findIndex(p => p.id === item.id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= sorted.length) return;

    [sorted[idx], sorted[newIdx]] = [sorted[newIdx], sorted[idx]];
    const updated = sorted.map((p, i) => ({ ...p, ordre: i }));
    setPartenaires(updated);

    // Persister les deux éléments permutés
    try {
      await Promise.all([
        institutionsAPI.update(updated[idx].id, { ordre: updated[idx].ordre }),
        institutionsAPI.update(updated[newIdx].id, { ordre: updated[newIdx].ordre }),
      ]);
      showToast('↕️ Ordre mis à jour');
    } catch { showToast('❌ Erreur de tri'); load(); }
  };

  const filtered = partenaires.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nom?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.categorie?.toLowerCase().includes(q);
  });

  const activeCount = partenaires.filter(p => p.isActive).length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <BuildingLibraryIcon className="w-7 h-7 text-primary-600" />
            Partenaires & Institutions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {partenaires.length} partenaire{partenaires.length > 1 ? 's' : ''} ·{' '}
            <span className="text-green-600 font-semibold">{activeCount} actif{activeCount > 1 ? 's' : ''} dans l'app</span>
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow"
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter un partenaire
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
        <BuildingLibraryIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-0.5">Gestion des partenaires institutionnels</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            Les partenaires actifs apparaissent dans la section <strong>Profil</strong> de l'application mobile.
            Vous pouvez les <strong>désactiver</strong> temporairement (retraits d'engagement) ou les <strong>supprimer</strong> définitivement.
            Utilisez les flèches ↑↓ pour changer l'ordre d'affichage.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un partenaire..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BuildingLibraryIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          {search ? (
            <p className="font-semibold">Aucun partenaire trouvé pour "{search}"</p>
          ) : (
            <>
              <p className="font-semibold text-lg">Aucun partenaire encore</p>
              <p className="text-sm mt-1">Ajoutez votre premier partenaire institutionnel</p>
              <button
                onClick={() => setModal('create')}
                className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Ajouter un partenaire
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p, idx) => (
            <PartenaireCard
              key={p.id}
              partenaire={p}
              isFirst={idx === 0}
              isLast={idx === filtered.length - 1}
              onEdit={item => setModal({ item })}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === 'create' ? 'Ajouter un partenaire' : `Modifier — ${modal.item?.nom}`}
          onClose={() => setModal(null)}
        >
          <PartenaireForm
            initial={modal === 'create' ? null : modal.item}
            onSave={handleSave}
            onClose={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      <PageHelp pageId="institutions" />
    </div>
  );
}
