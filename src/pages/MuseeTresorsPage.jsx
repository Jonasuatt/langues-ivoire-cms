/**
 * MuseeTresorsPage — Gestion des trésors culturels du Musée
 * Alimente MuseeScreen.js sur le mobile.
 * Chaque trésor = un CulturalItem de type TRESOR.
 */
import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI } from '../services/api';
import {
  PlusIcon, PencilIcon, TrashIcon,
  MagnifyingGlassIcon, SpeakerWaveIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';

// ─── Constantes ───────────────────────────────────────────────────────────────
const ETHNIES = [
  { value: 'baoule',  label: '🌺 Baoulé'  },
  { value: 'dioula',  label: '🌿 Dioula'  },
  { value: 'bete',    label: '🌳 Bété'    },
  { value: 'senoufo', label: '🦅 Sénoufo' },
  { value: 'agni',    label: '👑 Agni'    },
  { value: 'gouro',   label: '🦁 Gouro'   },
  { value: 'guere',   label: '🌊 Guéré'   },
  { value: 'nouchi',  label: '🎧 Nouchi'  },
  { value: 'yacouba', label: '🌲 Yacouba' },
];

const TIER_INFO = [
  { seuil: 0,   label: 'Starter',         short: '🟢 Starter', color: 'bg-green-100 text-green-700',  border: 'border-green-400' },
  { seuil: 80,  label: 'Bronze (80 XP)',  short: '🥉 Bronze',  color: 'bg-amber-100 text-amber-700',  border: 'border-amber-400' },
  { seuil: 200, label: 'Argent (200 XP)', short: '🥈 Argent',  color: 'bg-gray-100 text-gray-600',    border: 'border-gray-400'  },
  { seuil: 400, label: 'Or (400 XP)',     short: '🥇 Or',      color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-400' },
];

function getTier(seuil) {
  if (seuil === 0)   return TIER_INFO[0];
  if (seuil <= 100)  return TIER_INFO[1];
  if (seuil <= 250)  return TIER_INFO[2];
  return TIER_INFO[3];
}

const EMPTY_FORM = {
  titre: '', contenu: '', traduction: '', sourceEthnique: 'baoule',
  seuilXp: 0, matiere: '', typeObjet: '', emoji: '🏺',
  imageUrl: '', audioUrl: '', audioUrlFr: '', isActive: true,
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MuseeTresorsPage() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterEthnie, setFilterEthnie] = useState('');
  const [filterTier, setFilterTier]     = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // ─── Chargement ────────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    api.get('/cultural', { params: { type: 'TRESOR', limit: 500 } })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ─── Filtrage côté client ──────────────────────────────────────────────────
  const q = search.toLowerCase();
  const filtered = items.filter(item => {
    if (filterEthnie && item.sourceEthnique !== filterEthnie) return false;
    if (filterStatut === 'actif'   && item.isActive === false) return false;
    if (filterStatut === 'inactif' && item.isActive !== false) return false;
    if (filterTier) {
      const t = TIER_INFO.find(t => String(t.seuil) === filterTier);
      if (t) {
        const next = TIER_INFO[TIER_INFO.indexOf(t) + 1];
        if (!(item.seuilXp >= t.seuil && (!next || item.seuilXp < next.seuil))) return false;
      }
    }
    if (q && ![item.titre, item.contenu, item.typeObjet, item.matiere]
      .filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
    return true;
  });

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const total      = items.length;
  const actifs     = items.filter(i => i.isActive !== false).length;
  const avecImage  = items.filter(i => i.imageUrl).length;
  const avecAudio  = items.filter(i => i.audioUrl || i.audioUrlFr).length;

  // ─── Grouper par ethnie ────────────────────────────────────────────────────
  const grouped = ETHNIES.map(e => ({
    ...e,
    tresors: filtered
      .filter(i => i.sourceEthnique === e.value)
      .sort((a, b) => (a.seuilXp ?? 0) - (b.seuilXp ?? 0)),
  })).filter(g => g.tresors.length > 0 || (!filterEthnie && !q && !filterTier && !filterStatut));

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const openCreate = (defaultEthnie) => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, sourceEthnique: defaultEthnie || filterEthnie || 'baoule' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      titre: item.titre || '', contenu: item.contenu || '', traduction: item.traduction || '',
      sourceEthnique: item.sourceEthnique || 'baoule', seuilXp: item.seuilXp ?? 0,
      matiere: item.matiere || '', typeObjet: item.typeObjet || '',
      emoji: item.emoji || '🏺', imageUrl: item.imageUrl || '',
      audioUrl: item.audioUrl || '', audioUrlFr: item.audioUrlFr || '',
      isActive: item.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre.trim())   return toast.error('Le titre est obligatoire');
    if (!form.contenu.trim()) return toast.error("L'histoire est obligatoire");
    setSaving(true);
    const payload = {
      type: 'TRESOR',
      titre: form.titre.trim(), contenu: form.contenu.trim(),
      traduction: form.traduction.trim() || null,
      sourceEthnique: form.sourceEthnique,
      seuilXp: parseInt(form.seuilXp) || 0,
      matiere: form.matiere.trim() || null, typeObjet: form.typeObjet.trim() || null,
      emoji: form.emoji.trim() || null, imageUrl: form.imageUrl.trim() || null,
      audioUrl: form.audioUrl.trim() || null, audioUrlFr: form.audioUrlFr.trim() || null,
      isActive: form.isActive,
    };
    try {
      if (editItem) {
        await api.patch(`/cultural/${editItem.id}`, payload);
        toast.success('Trésor mis à jour');
      } else {
        await api.post('/cultural', payload);
        toast.success('Trésor créé');
      }
      setShowModal(false); load();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce trésor ?')) return;
    try { await api.delete(`/cultural/${id}`); toast.success('Trésor supprimé'); load(); }
    catch { toast.error('Erreur lors de la suppression'); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛️ Musée des Trésors</h1>
          <p className="text-gray-500 text-sm mt-1">
            Objets &amp; artefacts culturels ivoiriens — alimente <strong>MuseeScreen</strong> sur mobile
          </p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouveau trésor
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <p className="text-sm text-gray-500">Trésors total</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-green-600">{actifs}</p>
          <p className="text-sm text-gray-500">Trésors actifs</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-blue-600">{avecImage}</p>
          <p className="text-sm text-gray-500">Avec image</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-purple-600">{avecAudio}</p>
          <p className="text-sm text-gray-500">Avec audio</p>
        </div>
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────── */}
      <div className="space-y-3 mb-6">
        {/* Ligne 1 : recherche + dropdowns */}
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un trésor…"
              className="input pl-9 w-56" />
          </div>
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className="input w-auto">
            <option value="">Tous les tiers XP</option>
            {TIER_INFO.map(t => <option key={t.seuil} value={String(t.seuil)}>{t.short}</option>)}
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input w-auto">
            <option value="">Tous les statuts</option>
            <option value="actif">✅ Actifs</option>
            <option value="inactif">⭕ Inactifs</option>
          </select>
          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} trésor{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Ligne 2 : pills ethnies */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterEthnie('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !filterEthnie ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}>
            Toutes les ethnies
          </button>
          {ETHNIES.map(e => (
            <button key={e.value}
              onClick={() => setFilterEthnie(filterEthnie === e.value ? '' : e.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterEthnie === e.value ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Conseil tiers XP ─────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-6">
        <strong>Tiers XP :</strong> 🟢 Starter = 0 XP · 🥉 Bronze ≈ 80 XP · 🥈 Argent ≈ 200 XP · 🥇 Or ≈ 400 XP
        — Ces seuils déterminent quand l'utilisateur débloque le trésor dans l'application.
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-6 w-40 bg-gray-200 rounded-lg mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(j => <div key={j} className="h-52 bg-gray-100 rounded-xl"/>)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-gray-500 font-medium">Aucun trésor pour ces filtres</p>
          <p className="text-sm text-gray-400 mt-1">Modifiez les filtres ou ajoutez un nouveau trésor</p>
          <button onClick={() => openCreate()} className="btn-primary mt-5 mx-auto flex items-center gap-2 w-fit">
            <PlusIcon className="w-4 h-4" /> Nouveau trésor
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(g => {
            if (g.tresors.length === 0) return null;
            return (
              <div key={g.value}>
                {/* En-tête groupe */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-gray-800">
                    {g.label}
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({g.tresors.length} trésor{g.tresors.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                  <button
                    onClick={() => openCreate(g.value)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors">
                    <PlusIcon className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {g.tresors.map(item => {
                    const tier = getTier(item.seuilXp ?? 0);
                    return (
                      <div key={item.id}
                        className={`card overflow-hidden p-0 hover:shadow-md transition-shadow ${item.isActive === false ? 'opacity-60' : ''}`}>
                        {/* Image */}
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.titre}
                            className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-28 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                            <span className="text-4xl">{item.emoji || '🏺'}</span>
                          </div>
                        )}

                        {/* Corps de la carte */}
                        <div className="p-3">
                          {/* Titre + tier */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {item.imageUrl && (
                                <span className="text-xl flex-shrink-0">{item.emoji || '🏺'}</span>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-gray-900 leading-tight truncate">
                                  {item.titre}
                                </p>
                                {item.typeObjet && (
                                  <p className="text-xs text-gray-400 truncate">{item.typeObjet}</p>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${tier.color}`}>
                              {tier.short}
                            </span>
                          </div>

                          {/* Matière */}
                          {item.matiere && (
                            <p className="text-xs text-gray-500 mb-1">🪵 {item.matiere}</p>
                          )}

                          {/* Aperçu contenu */}
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                            {item.traduction || item.contenu}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${item.isActive !== false ? 'text-green-600' : 'text-gray-400'}`}>
                                {item.isActive !== false ? '● Actif' : '○ Inactif'}
                              </span>
                              {item.audioUrl && (
                                <SpeakerWaveIcon className="w-3.5 h-3.5 text-purple-400" title="Audio disponible"/>
                              )}
                              {item.imageUrl && (
                                <PhotoIcon className="w-3.5 h-3.5 text-blue-400" title="Image disponible"/>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                                <PencilIcon className="w-4 h-4"/>
                              </button>
                              <button onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <TrashIcon className="w-4 h-4"/>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Carte d'ajout rapide */}
                  <button
                    onClick={() => openCreate(g.value)}
                    className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors min-h-[160px]">
                    <PlusIcon className="w-6 h-6"/>
                    <span className="text-sm font-medium">Ajouter un trésor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Création / édition
      ════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* En-tête modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editItem ? 'Modifier le trésor' : 'Nouveau trésor'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">

              {/* Ethnie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ethnie *</label>
                <select className="input" value={form.sourceEthnique} onChange={e => f('sourceEthnique', e.target.value)}>
                  {ETHNIES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>

              {/* Emoji + Titre */}
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                  <input className="input text-center text-2xl" value={form.emoji}
                    onChange={e => f('emoji', e.target.value)} placeholder="🏺"/>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du trésor *</label>
                  <input className="input" value={form.titre}
                    onChange={e => f('titre', e.target.value)} placeholder="ex: Masque Goli"/>
                </div>
              </div>

              {/* Type + Matière */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'objet</label>
                  <input className="input" value={form.typeObjet}
                    onChange={e => f('typeObjet', e.target.value)} placeholder="ex: Masque cérémoniel"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <input className="input" value={form.matiere}
                    onChange={e => f('matiere', e.target.value)} placeholder="ex: Bois de fromager peint"/>
                </div>
              </div>

              {/* Seuil XP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seuil XP pour débloquer</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {TIER_INFO.map(t => (
                    <button key={t.seuil} type="button" onClick={() => f('seuilXp', t.seuil)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-colors ${
                        parseInt(form.seuilXp) === t.seuil
                          ? `${t.color} ${t.border}`
                          : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                      }`}>
                      {t.short}<br/>
                      <span className="font-normal opacity-70">{t.seuil > 0 ? `${t.seuil} XP` : 'Gratuit'}</span>
                    </button>
                  ))}
                </div>
                <input type="number" className="input" value={form.seuilXp}
                  onChange={e => f('seuilXp', e.target.value)}
                  placeholder="Ou saisir un seuil personnalisé…"/>
              </div>

              {/* Histoire en langue locale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Histoire &amp; signification en langue locale *
                </label>
                <textarea className="input resize-none" rows={4} value={form.contenu}
                  onChange={e => f('contenu', e.target.value)}
                  placeholder="Racontez l'histoire et la signification culturelle de cet objet en langue locale…"/>
              </div>

              {/* Traduction française */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🇫🇷 Traduction française de l'histoire
                </label>
                <textarea className="input resize-none" rows={4} value={form.traduction}
                  onChange={e => f('traduction', e.target.value)}
                  placeholder="Traduction complète de l'histoire en français…"/>
              </div>

              {/* Image */}
              <FileUploadField type="image" label="Image du trésor"
                value={form.imageUrl} onChange={url => f('imageUrl', url)}/>

              {/* Audios */}
              <div className="grid grid-cols-2 gap-4">
                <FileUploadField type="audio" label="🌍 Audio langue locale"
                  value={form.audioUrl} onChange={url => f('audioUrl', url)}/>
                <FileUploadField type="audio" label="🇫🇷 Audio français"
                  value={form.audioUrlFr} onChange={url => f('audioUrlFr', url)}/>
              </div>

              {/* Actif */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => f('isActive', e.target.checked)}
                  className="w-4 h-4 accent-primary-500"/>
                <div>
                  <p className="text-sm font-medium text-gray-700">Trésor actif</p>
                  <p className="text-xs text-gray-400">Visible dans l'application mobile</p>
                </div>
              </label>
            </div>

            {/* Footer modal */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Sauvegarde…' : editItem ? 'Mettre à jour' : 'Créer le trésor'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHelp pageId="musee" />
    </div>
  );
}
