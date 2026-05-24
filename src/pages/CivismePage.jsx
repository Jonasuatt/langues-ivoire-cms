import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, SpeakerWaveIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';
import LanguageSelect from '../components/LanguageSelect';

const TYPES_CIVISME = [
  { value: 'proverbe_civique', label: '💬 Proverbe civique', color: 'bg-purple-100 text-purple-700' },
  { value: 'symbole_etat', label: '🏛️ Symbole de l\'État', color: 'bg-blue-100 text-blue-700' },
  { value: 'sensibilisation', label: '📢 Sensibilisation', color: 'bg-green-100 text-green-700' },
];

const VALEURS = [
  { value: 'respect', label: 'Respect' },
  { value: 'solidarite', label: 'Solidarité' },
  { value: 'proprete', label: 'Propreté' },
  { value: 'securite_routiere', label: 'Sécurité routière' },
  { value: 'environnement', label: 'Environnement' },
  { value: 'patriotisme', label: 'Patriotisme' },
  { value: 'etat', label: 'État & institutions' },
];

const EMPTY_FORM = {
  type: 'proverbe_civique', titre: '', contenu: '', traduction: '', explication: '',
  audioUrl: '', audioUrlFr: '', imageUrl: '', genreVoix: '', valeur: '', languageId: '',
};

export default function CivismePage() {
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (filterType) params.type = filterType;
    if (filterLang) params.languageId = filterLang;
    api.get('/civisme', { params })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterType, filterLang]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      type: item.type,
      titre: item.titre,
      contenu: item.contenu,
      traduction: item.traduction || '',
      explication: item.explication || '',
      audioUrl: item.audioUrl || '',
      audioUrlFr: item.audioUrlFr || '',
      imageUrl: item.imageUrl || '',
      genreVoix: item.genreVoix || '',
      valeur: item.valeur || '',
      languageId: item.languageId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre || !form.contenu) {
      toast.error('Titre et contenu obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/civisme/${editItem.id}`, form);
        toast.success('Contenu mis à jour !');
      } else {
        await api.post('/civisme', form);
        toast.success('Contenu créé !');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Supprimer "${item.titre}" ?`)) return;
    try {
      await api.delete(`/civisme/${item.id}`);
      toast.success('Supprimé');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const getTypeInfo = (typeVal) => TYPES_CIVISME.find(t => t.value === typeVal) || { label: typeVal, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏛️ Civisme</h1>
          <p className="text-gray-500 text-sm mt-1">Proverbes civiques, symboles de l'État et contenus de sensibilisation</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouveau contenu
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
          <option value="">Tous les types</option>
          {TYPES_CIVISME.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-48" />
        <span className="ml-auto text-sm text-gray-500 self-center">{items.length} contenu(s)</span>
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="text-gray-400">Aucun contenu civique</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">Créer le premier contenu</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const typeInfo = getTypeInfo(item.type);
            const valeurInfo = VALEURS.find(v => v.value === item.valeur);
            return (
              <div key={item.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${typeInfo.color}`}>{typeInfo.label}</span>
                      {item.language && (
                        <span className="badge bg-gray-100 text-gray-600">{item.language.nom}</span>
                      )}
                      {valeurInfo && (
                        <span className="badge bg-teal-100 text-teal-700">{valeurInfo.label}</span>
                      )}
                      {item.genreVoix && (
                        <span className={`badge ${item.genreVoix === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.genreVoix === 'F' ? '♀' : '♂'}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.titre}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{item.contenu}</p>
                    {item.traduction && (
                      <p className="text-xs text-gray-400 mt-1 italic">{item.traduction}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {item.audioUrl && (
                        <div className="flex items-center gap-1">
                          <SpeakerWaveIcon className="w-4 h-4 text-accent" />
                          <span className="text-xs text-accent">Audio</span>
                        </div>
                      )}
                      {item.imageUrl && (
                        <div className="flex items-center gap-1">
                          <PhotoIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-blue-500">Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="illustration" className="w-14 h-14 object-cover rounded-lg border border-gray-100 mb-1" />
                    )}
                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <PencilIcon className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              {editItem ? 'Modifier' : 'Nouveau contenu'} — Civisme
            </h2>
            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <div className="flex gap-2 flex-wrap">
                  {TYPES_CIVISME.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm(f => ({...f, type: t.value}))}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        form.type === t.value
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                <LanguageSelect
                  languages={languages}
                  value={form.languageId || ''}
                  onChange={v => setForm(f => ({...f, languageId: v}))}
                  allLabel="Toutes langues / Français"
                  className="w-full"
                />
              </div>

              {/* Valeur civique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valeur civique</label>
                <select value={form.valeur}
                  onChange={e => setForm(f => ({...f, valeur: e.target.value}))}
                  className="input w-full">
                  <option value="">-- Choisir une valeur --</option>
                  {VALEURS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input value={form.titre}
                  onChange={e => setForm(f => ({...f, titre: e.target.value}))}
                  className="input w-full" placeholder="Ex: Le respect de l'aîné" />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea value={form.contenu}
                  onChange={e => setForm(f => ({...f, contenu: e.target.value}))}
                  className="input w-full" rows={3}
                  placeholder="Le proverbe, la règle ou le message en langue locale ou en français..." />
              </div>

              {/* Traduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                <textarea value={form.traduction}
                  onChange={e => setForm(f => ({...f, traduction: e.target.value}))}
                  className="input w-full" rows={2}
                  placeholder="Traduction si le contenu est en langue locale" />
              </div>

              {/* Explication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explication / contexte</label>
                <textarea value={form.explication}
                  onChange={e => setForm(f => ({...f, explication: e.target.value}))}
                  className="input w-full" rows={2}
                  placeholder="Sens profond, contexte culturel, usage..." />
              </div>

              {/* Audio */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🎵 Fichiers audio</p>
                <FileUploadField
                  type="audio"
                  label="🌍 Audio langue locale (lecture du contenu)"
                  value={form.audioUrl}
                  onChange={url => setForm(f => ({...f, audioUrl: url}))}
                  disabled={saving}
                />
                <FileUploadField
                  type="audio"
                  label="🇫🇷 Audio français (narration)"
                  value={form.audioUrlFr}
                  onChange={url => setForm(f => ({...f, audioUrlFr: url}))}
                  disabled={saving}
                />
              </div>

              {/* Genre de la voix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre de la voix audio</label>
                <div className="flex gap-2">
                  {[{v:'',l:'Non défini'},{v:'M',l:'♂ Masculin'},{v:'F',l:'♀ Féminin'}].map(g => (
                    <button key={g.v} type="button"
                      onClick={() => setForm(f => ({...f, genreVoix: g.v}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.genreVoix === g.v
                          ? g.v === 'M' ? 'bg-blue-600 text-white border-blue-600'
                            : g.v === 'F' ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-gray-600 text-white border-gray-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image */}
              <FileUploadField
                type="image"
                label="Image illustrative (photo, symbole, infographie)"
                value={form.imageUrl}
                onChange={url => setForm(f => ({...f, imageUrl: url}))}
                disabled={saving}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHelp pageId="civisme" />
    </div>
  );
}
