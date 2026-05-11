/**
 * MuseeTresorsPage — Gestion des trésors culturels du Musée
 * Alimente MuseeScreen.js sur le mobile.
 * Chaque trésor = un CulturalItem de type TRESOR.
 */
import { useEffect, useState } from 'react';
import api, { languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';

const ETHNIES = [
  { value: 'baoule',  label: '🌺 Baoulé' },
  { value: 'dioula',  label: '🌿 Dioula' },
  { value: 'bete',    label: '🌳 Bété' },
  { value: 'senoufo', label: '🦅 Sénoufo' },
  { value: 'agni',    label: '👑 Agni' },
  { value: 'gouro',   label: '🦁 Gouro' },
  { value: 'guere',   label: '🌊 Guéré' },
  { value: 'nouchi',  label: '🎧 Nouchi' },
];

const EMPTY_FORM = {
  titre: '', contenu: '', sourceEthnique: 'baoule',
  seuilXp: 0, matiere: '', typeObjet: '', emoji: '🏺',
  imageUrl: '', audioUrl: '', isActive: true,
};

const TIER_INFO = [
  { seuil: 0,   label: 'Starter (débloqué dès le début)', color: 'bg-green-100 text-green-700' },
  { seuil: 80,  label: 'Bronze (80 XP)', color: 'bg-amber-100 text-amber-700' },
  { seuil: 200, label: 'Argent (200 XP)', color: 'bg-gray-100 text-gray-600' },
  { seuil: 400, label: 'Or (400 XP)', color: 'bg-yellow-100 text-yellow-700' },
];

function getTierLabel(seuil) {
  if (seuil === 0)   return { label: 'Starter', color: 'bg-green-100 text-green-700' };
  if (seuil <= 100)  return { label: 'Bronze', color: 'bg-amber-100 text-amber-700' };
  if (seuil <= 250)  return { label: 'Argent', color: 'bg-gray-100 text-gray-600' };
  return { label: 'Or', color: 'bg-yellow-100 text-yellow-700' };
}

export default function MuseeTresorsPage() {
  const [items, setItems]           = useState([]);
  const [languages, setLanguages]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterEthnie, setFilterEthnie] = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const load = () => {
    setLoading(true);
    const params = { type: 'TRESOR', limit: 200 };
    api.get('/cultural', { params })
      .then(({ data }) => {
        let items = data.data || [];
        if (filterEthnie) items = items.filter(i => i.sourceEthnique === filterEthnie);
        setItems(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterEthnie]);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      titre:          item.titre || '',
      contenu:        item.contenu || '',
      sourceEthnique: item.sourceEthnique || 'baoule',
      seuilXp:        item.seuilXp ?? 0,
      matiere:        item.matiere || '',
      typeObjet:      item.typeObjet || '',
      emoji:          item.emoji || '🏺',
      imageUrl:       item.imageUrl || '',
      audioUrl:       item.audioUrl || '',
      isActive:       item.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre.trim()) return toast.error('Le titre est obligatoire');
    if (!form.contenu.trim()) return toast.error("L'histoire est obligatoire");
    setSaving(true);
    try {
      const payload = {
        type: 'TRESOR',
        titre:          form.titre.trim(),
        contenu:        form.contenu.trim(),
        sourceEthnique: form.sourceEthnique,
        seuilXp:        parseInt(form.seuilXp) || 0,
        matiere:        form.matiere.trim() || null,
        typeObjet:      form.typeObjet.trim() || null,
        emoji:          form.emoji.trim() || null,
        imageUrl:       form.imageUrl.trim() || null,
        audioUrl:       form.audioUrl.trim() || null,
        isActive:       form.isActive,
      };
      if (editItem) {
        await api.patch(`/cultural/${editItem.id}`, payload);
        toast.success('Trésor mis à jour');
      } else {
        await api.post('/cultural', payload);
        toast.success('Trésor créé');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce trésor ?')) return;
    try {
      await api.delete(`/cultural/${id}`);
      toast.success('Trésor supprimé');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Grouper par ethnie
  const grouped = ETHNIES.map(e => ({
    ...e,
    tresors: items.filter(i => i.sourceEthnique === e.value).sort((a, b) => (a.seuilXp ?? 0) - (b.seuilXp ?? 0)),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛 Musée des Trésors</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} trésor{items.length > 1 ? 's' : ''} · Alimente MuseeScreen sur mobile
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouveau trésor
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterEthnie('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${!filterEthnie ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
        >
          Toutes les ethnies
        </button>
        {ETHNIES.map(e => (
          <button
            key={e.value}
            onClick={() => setFilterEthnie(filterEthnie === e.value ? '' : e.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${filterEthnie === e.value ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Conseil de tiers */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>Tiers XP :</strong> Starter = 0 XP · Bronze = ~80 XP · Argent = ~200 XP · Or = ~400 XP — Ces seuils déterminent quand l'utilisateur débloque le trésor dans l'application.
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : (
        <div className="space-y-8">
          {(filterEthnie ? grouped.filter(g => g.value === filterEthnie) : grouped).map(g => (
            g.tresors.length === 0 && filterEthnie ? null : (
              <div key={g.value}>
                <h2 className="text-lg font-bold text-gray-800 mb-3">{g.label}
                  <span className="ml-2 text-sm font-normal text-gray-400">({g.tresors.length} trésor{g.tresors.length > 1 ? 's' : ''})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {g.tresors.map(item => {
                    const tier = getTierLabel(item.seuilXp ?? 0);
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.titre} className="w-full h-32 object-cover" />
                        )}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{item.emoji || '🏺'}</span>
                              <div>
                                <p className="font-bold text-sm text-gray-900 leading-tight">{item.titre}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.typeObjet}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${tier.color}`}>{tier.label}</span>
                          </div>
                          {item.matiere && (
                            <p className="text-xs text-gray-500 mt-2">🪵 {item.matiere}</p>
                          )}
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">{item.contenu}</p>
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                            <span className={`text-xs ${item.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              {item.isActive ? '✓ Actif' : 'Inactif'}
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(item)} className="text-primary-600 hover:text-primary-800">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Bouton d'ajout rapide dans chaque ethnie */}
                  <button
                    onClick={() => { openCreate(); f('sourceEthnique', g.value); }}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors min-h-[120px]"
                  >
                    <PlusIcon className="w-6 h-6" />
                    <span className="text-sm">Ajouter un trésor</span>
                  </button>
                </div>
              </div>
            )
          ))}
          {items.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🏛</p>
              <p className="font-medium">Aucun trésor pour l'instant</p>
              <p className="text-sm mt-1">Créez votre premier trésor culturel</p>
            </div>
          )}
        </div>
      )}

      {/* Modal création / édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editItem ? 'Modifier le trésor' : 'Nouveau trésor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Ethnie */}
              <div>
                <label className="label">Ethnie *</label>
                <select className="input" value={form.sourceEthnique} onChange={e => f('sourceEthnique', e.target.value)}>
                  {ETHNIES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>

              {/* Emoji + Titre */}
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="label">Emoji</label>
                  <input className="input text-center text-2xl" value={form.emoji} onChange={e => f('emoji', e.target.value)} placeholder="🏺" />
                </div>
                <div className="col-span-4">
                  <label className="label">Nom du trésor *</label>
                  <input className="input" value={form.titre} onChange={e => f('titre', e.target.value)} placeholder="ex: Masque Goli" />
                </div>
              </div>

              {/* Type + Matière */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type d'objet</label>
                  <input className="input" value={form.typeObjet} onChange={e => f('typeObjet', e.target.value)} placeholder="ex: Masque cérémoniel" />
                </div>
                <div>
                  <label className="label">Matière</label>
                  <input className="input" value={form.matiere} onChange={e => f('matiere', e.target.value)} placeholder="ex: Bois de fromager peint" />
                </div>
              </div>

              {/* Seuil XP */}
              <div>
                <label className="label">Seuil XP pour débloquer</label>
                <div className="flex gap-2">
                  {TIER_INFO.map(t => (
                    <button
                      key={t.seuil}
                      type="button"
                      onClick={() => f('seuilXp', t.seuil)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition ${parseInt(form.seuilXp) === t.seuil ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-primary-300'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <input type="number" className="input mt-2" value={form.seuilXp} onChange={e => f('seuilXp', e.target.value)} placeholder="Ou saisissez un seuil personnalisé" />
              </div>

              {/* Histoire */}
              <div>
                <label className="label">Histoire & signification *</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  value={form.contenu}
                  onChange={e => f('contenu', e.target.value)}
                  placeholder="Racontez l'histoire et la signification culturelle de cet objet…"
                />
              </div>

              {/* Image */}
              <FileUploadField
                type="image"
                label="Image du trésor"
                value={form.imageUrl}
                onChange={url => f('imageUrl', url)}
              />

              {/* Audio (histoire narrée) */}
              <FileUploadField
                type="audio"
                label="Audio — histoire narrée (optionnel)"
                value={form.audioUrl}
                onChange={url => f('audioUrl', url)}
              />

              {/* Actif */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="w-4 h-4 accent-primary-500" />
                <span className="text-sm font-medium text-gray-700">Trésor actif (visible dans l'app)</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Sauvegarde…' : editItem ? 'Mettre à jour' : 'Créer le trésor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
