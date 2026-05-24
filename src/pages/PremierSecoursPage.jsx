import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, SpeakerWaveIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';
import LanguageSelect from '../components/LanguageSelect';

const SITUATIONS = [
  { value: 'appel_secours', label: '📞 Appeler les secours', priorite: 2 },
  { value: 'arret_cardiaque', label: '❤️ Arrêt cardiaque', priorite: 2 },
  { value: 'etouffement', label: '🫁 Étouffement', priorite: 2 },
  { value: 'mise_en_securite', label: '🛡️ Position de sécurité', priorite: 2 },
  { value: 'noyade', label: '🌊 Noyade', priorite: 1 },
  { value: 'brulure', label: '🔥 Brûlure', priorite: 1 },
  { value: 'fracture', label: '🦴 Fracture', priorite: 1 },
  { value: 'saignement', label: '🩸 Saignement', priorite: 1 },
  { value: 'malaise', label: '😮 Malaise', priorite: 1 },
  { value: 'evaluation', label: '🔍 Évaluation de la victime', priorite: 0 },
  { value: 'guide_medical', label: '🏥 Guide médical conversationnel', priorite: 0 },
];

const PRIORITE_LABELS = { 0: 'Information', 1: 'Important', 2: 'Vital' };
const PRIORITE_COLORS = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-orange-100 text-orange-700',
  2: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  situation: 'appel_secours', consigne: '', traduction: '', transcription: '',
  audioUrl: '', audioUrlFr: '', imageUrl: '', genreVoix: '', priorite: 2, languageId: '',
};

export default function PremierSecoursPage() {
  const [items, setItems] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSituation, setFilterSituation] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (filterSituation) params.situation = filterSituation;
    if (filterLang) params.languageId = filterLang;
    api.get('/premiers-secours', { params })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterSituation, filterLang]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      situation: item.situation,
      consigne: item.consigne,
      traduction: item.traduction || '',
      transcription: item.transcription || '',
      audioUrl: item.audioUrl || '',
      audioUrlFr: item.audioUrlFr || '',
      imageUrl: item.imageUrl || '',
      genreVoix: item.genreVoix || '',
      priorite: item.priorite ?? 2,
      languageId: item.languageId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.consigne || !form.situation) {
      toast.error('Consigne et situation obligatoires');
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/premiers-secours/${editItem.id}`, form);
        toast.success('Fiche mise à jour !');
      } else {
        await api.post('/premiers-secours', form);
        toast.success('Fiche créée !');
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
    if (!confirm(`Supprimer cette fiche "${item.situation}" ?`)) return;
    try {
      await api.delete(`/premiers-secours/${item.id}`);
      toast.success('Supprimé');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏥 Premiers Secours</h1>
          <p className="text-gray-500 text-sm mt-1">Fiches de gestes d'urgence traduits en langues ivoiriennes</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouvelle fiche
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={filterSituation} onChange={e => setFilterSituation(e.target.value)}
          className="input w-auto">
          <option value="">Toutes les situations</option>
          {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-48" />
      </div>

      {/* Grille de fiches */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🏥</p>
          <p className="text-gray-400">Aucune fiche de premiers secours</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">Créer la première fiche</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const sit = SITUATIONS.find(s => s.value === item.situation) || { label: item.situation };
            return (
              <div key={item.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${PRIORITE_COLORS[item.priorite ?? 0]}`}>
                        {PRIORITE_LABELS[item.priorite ?? 0]}
                      </span>
                      <span className="badge bg-rose-100 text-rose-700">{sit.label}</span>
                      {item.language && (
                        <span className="badge bg-gray-100 text-gray-600">{item.language.nom}</span>
                      )}
                      {item.genreVoix && (
                        <span className={`badge ${item.genreVoix === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.genreVoix === 'F' ? '♀' : '♂'}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{item.consigne}</p>
                    {item.traduction && (
                      <p className="text-xs text-gray-500 mt-1">{item.traduction}</p>
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
                      <img src={item.imageUrl} alt="schéma" className="w-14 h-14 object-cover rounded-lg border border-gray-100 mb-1" />
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
              {editItem ? 'Modifier' : 'Nouvelle fiche'} — Premiers Secours
            </h2>
            <div className="space-y-4">
              {/* Situation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation *</label>
                <select value={form.situation}
                  onChange={e => setForm(f => ({...f, situation: e.target.value}))}
                  className="input w-full">
                  {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                <LanguageSelect
                  languages={languages}
                  value={form.languageId || ''}
                  onChange={v => setForm(f => ({...f, languageId: v}))}
                  className="w-full"
                />
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <div className="flex gap-2">
                  {[0, 1, 2].map(p => (
                    <button key={p} type="button"
                      onClick={() => setForm(f => ({...f, priorite: p}))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.priorite === p
                          ? p === 2 ? 'bg-red-600 text-white border-red-600'
                            : p === 1 ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-gray-600 text-white border-gray-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {PRIORITE_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consigne */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consigne (langue locale) *</label>
                <textarea value={form.consigne}
                  onChange={e => setForm(f => ({...f, consigne: e.target.value}))}
                  className="input w-full" rows={3}
                  placeholder="Ex: A bla bla yê... (Ne bougez pas en Dioula)" />
              </div>

              {/* Traduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Traduction française</label>
                <textarea value={form.traduction}
                  onChange={e => setForm(f => ({...f, traduction: e.target.value}))}
                  className="input w-full" rows={2}
                  placeholder="Ex: Ne bougez pas, les secours arrivent" />
              </div>

              {/* Transcription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transcription phonétique</label>
                <input value={form.transcription}
                  onChange={e => setForm(f => ({...f, transcription: e.target.value}))}
                  className="input w-full" placeholder="Ex: [a bla bla yɛ]" />
              </div>

              {/* Audio */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🎵 Fichiers audio</p>
                <FileUploadField
                  type="audio"
                  label="🌍 Audio langue locale (lecture de la consigne)"
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
                label="Schéma illustré (geste de secours)"
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
      <PageHelp pageId="premiers-secours" />
    </div>
  );
}
