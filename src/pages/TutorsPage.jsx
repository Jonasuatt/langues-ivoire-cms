import { useEffect, useState } from 'react';
import { tutorsAPI, languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, ChatBubbleLeftRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ImageUploadInput from '../components/ImageUploadInput';
import { getAvatarPortrait } from '../utils/getAvatar';

const AVATAR_COLORS = ['#0B3D2E','#1565C0','#6A1B9A','#E65100','#00695C','#AD1457','#4E342E','#37474F'];

const PERSONALITIES = [
  { value: 'sage', label: 'Sage & Patient', desc: 'Proverbes, sagesse ancestrale' },
  { value: 'marchand', label: 'Marchand Jovial', desc: 'Énergique, expressions du marché' },
  { value: 'noble', label: 'Noble & Fier', desc: 'Dignité, traditions royales' },
  { value: 'artisan', label: 'Artisan Créatif', desc: 'Métiers, savoir-faire' },
  { value: 'princesse', label: 'Princesse Élégante', desc: 'Raffinement, cour royale' },
  { value: 'cultivateur', label: 'Cultivateur Généreux', desc: 'Nature, cycles, partage' },
  { value: 'chasseur', label: 'Chasseur Brave', desc: 'Forêt, courage, initiation' },
  { value: 'jeune', label: 'Jeune Moderne', desc: 'Urbain, fun, mélange culturel' },
];

const EMPTY_FORM = {
  nomAvatar: '',
  languageId: '',
  genre: 'M',
  personalite: '',
  voixConfig: { vitesse: 1.0, pitch: 1.0 },
  imageUrl: '',
  isActive: true,
};

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTutor, setEditTutor] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([tutorsAPI.getAll(), languagesAPI.getAll()])
      .then(([tutorsRes, langsRes]) => {
        setTutors(tutorsRes.data);
        setLanguages(langsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Langues qui n'ont pas encore de tuteur (pour la création)
  const availableLanguages = languages.filter(
    lang => !tutors.some(t => t.languageId === lang.id) || (editTutor && editTutor.languageId === lang.id)
  );

  const openAdd = () => {
    setEditTutor(null);
    setForm({ ...EMPTY_FORM, languageId: availableLanguages[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (tutor) => {
    setEditTutor(tutor);
    setForm({
      nomAvatar: tutor.nomAvatar || '',
      languageId: tutor.languageId || '',
      genre: tutor.genre || 'M',
      personalite: tutor.personalite || '',
      voixConfig: tutor.voixConfig || { vitesse: 1.0, pitch: 1.0 },
      imageUrl: tutor.imageUrl || '',
      isActive: tutor.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nomAvatar) { toast.error("Nom d'avatar obligatoire"); return; }
    if (!form.languageId) { toast.error('Langue obligatoire'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        voixConfig: typeof form.voixConfig === 'string' ? JSON.parse(form.voixConfig) : form.voixConfig,
      };
      if (editTutor) {
        await tutorsAPI.update(editTutor.id, payload);
        toast.success('Tuteur mis à jour !');
      } else {
        await tutorsAPI.create(payload);
        toast.success('Tuteur créé !');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  const handleDelete = async (tutor) => {
    if (!confirm(`Supprimer le tuteur "${tutor.nomAvatar}" ?`)) return;
    try {
      await tutorsAPI.delete(tutor.id);
      toast.success('Tuteur supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const toggleActive = async (tutor) => {
    try {
      await tutorsAPI.update(tutor.id, { isActive: !tutor.isActive });
      toast.success(tutor.isActive ? 'Tuteur désactivé' : 'Tuteur activé');
      load();
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tuteurs IA</h1>
          <p className="text-gray-500 text-sm mt-1">{tutors.length} Tuteur(s) Ethnique(s) Virtuel(s)</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Créer un tuteur
        </button>
      </div>

      {/* Aide */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-900">
          <p className="font-semibold mb-1">🤖 À quoi servent les Tuteurs IA ?</p>
          <p>Les tuteurs sont des <strong>personnages virtuels</strong> avec lesquels les utilisateurs conversent pour pratiquer la langue. Chaque tuteur a une personnalité, une langue et une voix propres. Idéalement, créez <strong>un tuteur par langue</strong> disponible dans l'application.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
        </div>
      ) : tutors.length === 0 ? (
        <div className="card text-center py-16">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucun tuteur configuré</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">+ Créer le premier tuteur</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor, i) => {
            const localPortrait = getAvatarPortrait(tutor.nomAvatar);
            return (
            <div key={tutor.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {localPortrait ? (
                  <img src={localPortrait} alt={tutor.nomAvatar}
                    className="w-14 h-14 rounded-xl flex-shrink-0 object-cover" />
                ) : tutor.imageUrl ? (
                  <img src={tutor.imageUrl} alt={tutor.nomAvatar}
                    className="w-14 h-14 rounded-xl flex-shrink-0 object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {tutor.nomAvatar[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{tutor.nomAvatar}</h3>
                    <span className={`badge ${tutor.genre === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                      {tutor.genre === 'F' ? '♀' : '♂'}
                    </span>
                    <span className="badge bg-accent/10 text-accent">{tutor.language?.nom}</span>
                    <button onClick={() => toggleActive(tutor)}
                      className={`badge ml-auto cursor-pointer transition-colors ${tutor.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {tutor.isActive ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                  {tutor.personalite && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tutor.personalite}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Voix : {tutor.voixConfig?.vitesse ?? 1.0}x</span>
                      <span>Pitch : {tutor.voixConfig?.pitch ?? 1.0}</span>
                      <span>Code : {tutor.language?.code}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(tutor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(tutor)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editTutor ? `Modifier — ${editTutor.nomAvatar}` : 'Nouveau Tuteur IA'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'avatar *</label>
                  <input className="input" value={form.nomAvatar}
                    onChange={e => setForm({...form, nomAvatar: e.target.value})}
                    placeholder="ex: Koffi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={form.languageId}
                    onChange={e => setForm({...form, languageId: e.target.value})}>
                    <option value="">-- Choisir --</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.nom} ({l.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select className="input" value={form.genre}
                    onChange={e => setForm({...form, genre: e.target.value})}>
                    <option value="M">Homme ♂</option>
                    <option value="F">Femme ♀</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnalité</label>
                <select className="input" value={PERSONALITIES.find(p => form.personalite?.includes(p.label))?.value || 'custom'}
                  onChange={e => {
                    const p = PERSONALITIES.find(x => x.value === e.target.value);
                    if (p) setForm({...form, personalite: `${p.label} — ${p.desc}`});
                  }}>
                  <option value="custom">Personnalisé</option>
                  {PERSONALITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description personnalité</label>
                <textarea className="input h-20 resize-none" value={form.personalite}
                  onChange={e => setForm({...form, personalite: e.target.value})}
                  placeholder="Description de la personnalité du tuteur..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitesse de la voix — <span className="text-primary-600 font-semibold">{form.voixConfig?.vitesse ?? 1.0}x</span>
                  </label>
                  <input type="range" step="0.1" min="0.5" max="2.0" className="w-full accent-primary-500"
                    value={form.voixConfig?.vitesse ?? 1.0}
                    onChange={e => setForm({...form, voixConfig: {...form.voixConfig, vitesse: parseFloat(e.target.value)}})} />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Lent (0.5)</span><span>Normal (1.0)</span><span>Rapide (2.0)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tonalité de la voix — <span className="text-primary-600 font-semibold">{form.voixConfig?.pitch ?? 1.0}</span>
                  </label>
                  <input type="range" step="0.1" min="0.5" max="2.0" className="w-full accent-primary-500"
                    value={form.voixConfig?.pitch ?? 1.0}
                    onChange={e => setForm({...form, voixConfig: {...form.voixConfig, pitch: parseFloat(e.target.value)}})} />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Grave (0.5)</span><span>Normal (1.0)</span><span>Aigu (2.0)</span>
                  </div>
                </div>
              </div>

              <ImageUploadInput
                value={form.imageUrl}
                onChange={url => setForm({ ...form, imageUrl: url })}
                label="Photo de l'avatar"
                hint="Laissez vide pour utiliser la lettre initiale comme avatar."
                previewClass="w-16 h-16 rounded-xl object-cover border-2 border-primary-200"
              />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="w-4 h-4 rounded text-primary-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Tuteur actif</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde...' : editTutor ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
