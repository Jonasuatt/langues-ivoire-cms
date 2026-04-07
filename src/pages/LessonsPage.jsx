import { useEffect, useState } from 'react';
import { lessonsAPI, languagesAPI } from '../services/api';
import api from '../services/api';
import { PlusIcon, AcademicCapIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_COLORS = { A1: 'bg-green-100 text-green-700', A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700', B2: 'bg-purple-100 text-purple-700', C1: 'bg-red-100 text-red-700' };

const EMPTY_FORM = { titre: '', description: '', niveau: 'A1', ordre: 1, pointsXp: 50, dureeEstimee: 10 };

export default function LessonsPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLangId, setSelectedLangId] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) { setSelectedLang(data[0].code); setSelectedLangId(data[0].id); }
    });
  }, []);

  const loadLessons = () => {
    if (!selectedLang) return;
    setLoading(true);
    lessonsAPI.getByLanguage(selectedLang)
      .then(({ data }) => setLessons(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLessons(); }, [selectedLang]);

  const selectLang = (lang) => {
    setSelectedLang(lang.code);
    setSelectedLangId(lang.id);
  };

  const openAdd = () => {
    setEditLesson(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setForm({
      titre: lesson.titre || '',
      description: lesson.description || '',
      niveau: lesson.niveau || 'A1',
      ordre: lesson.ordre || 1,
      pointsXp: lesson.pointsXp || 50,
      dureeEstimee: lesson.dureeEstimee || 10,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.titre) { toast.error('Titre obligatoire'); return; }
    setSaving(true);
    try {
      if (editLesson) {
        await lessonsAPI.update(editLesson.id, form);
        toast.success('Leçon mise à jour !');
      } else {
        await lessonsAPI.create({ ...form, languageId: selectedLangId, langueCode: selectedLang, isActive: true });
        toast.success('Leçon créée !');
      }
      setShowModal(false);
      loadLessons();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  const handleDelete = async (lesson) => {
    if (!confirm(`Supprimer "${lesson.titre}" ?`)) return;
    try {
      await api.delete(`/lessons/${lesson.id}`);
      toast.success('Leçon supprimée');
      loadLessons();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const byLevel = lessons.reduce((acc, l) => {
    if (!acc[l.niveau]) acc[l.niveau] = [];
    acc[l.niveau].push(l);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leçons</h1>
          <p className="text-gray-500 text-sm mt-1">{lessons.length} leçon(s) au total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouvelle leçon
        </button>
      </div>

      {/* Sélecteur de langue */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {languages.map(l => (
          <button key={l.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLang === l.code ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => selectLang(l)}>
            {l.nom}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="card text-center py-16">
          <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucune leçon pour cette langue</p>
          <button onClick={openAdd} className="btn-primary mt-4 mx-auto">+ Créer la première leçon</button>
        </div>
      ) : (
        <div className="space-y-6">
          {LEVELS.filter(l => byLevel[l]?.length > 0).map(niveau => (
            <div key={niveau}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Niveau {niveau}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {byLevel[niveau].map(lesson => (
                  <div key={lesson.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${LEVEL_COLORS[lesson.niveau]}`}>{lesson.niveau}</span>
                          <span className="text-xs text-gray-400">#{lesson.ordre}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{lesson.titre}</h4>
                        {lesson.description && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-lg font-bold text-accent">{lesson.pointsXp} XP</p>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(lesson)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(lesson)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editLesson ? 'Modifier la leçon' : `Nouvelle leçon — ${selectedLang.toUpperCase()}`}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input className="input" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} placeholder="Ex: Les Salutations en Baoulé" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description de la leçon..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select className="input" value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input type="number" className="input" value={form.ordre} onChange={e => setForm({...form, ordre: parseInt(e.target.value)})} min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" className="input" value={form.pointsXp} onChange={e => setForm({...form, pointsXp: parseInt(e.target.value)})} min="0" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editLesson ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
