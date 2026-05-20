import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import { lessonsAPI, languagesAPI } from '../services/api';
import api from '../services/api';
import { PlusIcon, AcademicCapIcon, PencilIcon, TrashIcon, BoltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_COLORS = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-red-100 text-red-700',
};

const FAMILLE_COLORS = {
  Akan:        'bg-yellow-50 border-yellow-200',
  Krou:        'bg-red-50 border-red-200',
  Gour:        'bg-orange-50 border-orange-200',
  'Mandé Nord': 'bg-green-50 border-green-200',
  'Mandé Sud':  'bg-emerald-50 border-emerald-200',
  Véhiculaire: 'bg-blue-50 border-blue-200',
};

const EMPTY_FORM = { titre: '', description: '', niveau: 'A1', ordre: 1, pointsXp: 50 };

export default function LessonsPage() {
  const [languages, setLanguages]     = useState([]);
  const [selectedLang, setSelectedLang]   = useState('');
  const [selectedLangId, setSelectedLangId] = useState('');
  const [lessons, setLessons]         = useState([]);
  const [dormantLessons, setDormantLessons] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [tab, setTab]                 = useState('actives'); // 'actives' | 'catalogue'
  const [activating, setActivating]   = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [editLesson, setEditLesson]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => {
      setLanguages(data);
      if (data.length) {
        const first = data.find(l => l.isActive) || data[0];
        setSelectedLang(first.code);
        setSelectedLangId(first.id);
      }
    });
  }, []);

  const loadLessons = () => {
    if (!selectedLang) return;
    setLoading(true);

    Promise.all([
      lessonsAPI.getByLanguage(selectedLang),                      // actives (mobile)
      lessonsAPI.getAllAdmin({ languageId: selectedLangId }),        // toutes incl. dormantes
    ])
      .then(([active, all]) => {
        const activeList = active.data || [];
        const allList    = all.data   || [];
        setLessons(activeList);
        setDormantLessons(allList.filter(l => !l.isActive));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadLessons(); }, [selectedLang, selectedLangId]);

  const selectLang = (lang) => {
    setSelectedLang(lang.code);
    setSelectedLangId(lang.id);
  };

  const handleActivate = async (lesson) => {
    if (activating) return;
    setActivating(lesson.id);
    try {
      await lessonsAPI.activate(lesson.id);
      toast.success(`🎓 "${lesson.titre}" est maintenant active !`);
      loadLessons();
    } catch { toast.error("Erreur lors de l'activation."); }
    finally { setActivating(null); }
  };

  const openAdd = () => {
    setEditLesson(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditLesson(lesson);
    setForm({
      titre:       lesson.titre       || '',
      description: lesson.description || '',
      niveau:      lesson.niveau      || 'A1',
      ordre:       lesson.ordre       || 1,
      pointsXp:    lesson.pointsXp    || 50,
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

  const selectedLanguage = languages.find(l => l.code === selectedLang);
  const famille = selectedLanguage?.famille || '';
  const familleStyle = FAMILLE_COLORS[famille] || 'bg-gray-50 border-gray-200';

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leçons</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lessons.length} leçon(s) active(s)
            {dormantLessons.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {dormantLessons.length} en dormance</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {dormantLessons.length > 0 && (
            <button onClick={() => setTab('catalogue')}
              className="btn-secondary flex items-center gap-2 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100">
              ✨ Catalogue ({dormantLessons.length})
            </button>
          )}
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Nouvelle leçon
          </button>
        </div>
      </div>

      {/* Sélecteur de langue */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {languages.map(l => (
          <button key={l.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLang === l.code
                ? 'bg-primary-500 text-white'
                : l.isActive
                  ? 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
            }`}
            onClick={() => selectLang(l)}>
            {l.emoji && <span className="mr-1">{l.emoji}</span>}
            {l.nom}
            {!l.isActive && <span className="ml-1 text-xs opacity-60">⏸</span>}
          </button>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { key: 'actives',   label: `🟢 Actives (${lessons.length})` },
          { key: 'catalogue', label: `✨ Catalogue A1 (${dormantLessons.length})` },
        ].map(t => (
          <button key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.key
                ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : tab === 'actives' ? (
        /* ── Onglet Actives ─────────────────────────── */
        lessons.length === 0 ? (
          <div className="card text-center py-16">
            <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">Aucune leçon active pour cette langue</p>
            {dormantLessons.length > 0 && (
              <button onClick={() => setTab('catalogue')} className="btn-secondary mt-2 mx-auto">
                ✨ Voir les {dormantLessons.length} leçons en dormance
              </button>
            )}
            <button onClick={openAdd} className="btn-primary mt-2 mx-auto">+ Créer une leçon</button>
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
                            {lesson._count?.steps > 0 && (
                              <span className="text-xs text-gray-400">{lesson._count.steps} étape(s)</span>
                            )}
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
        )
      ) : (
        /* ── Onglet Catalogue (dormantes) ───────────── */
        dormantLessons.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400">Toutes les leçons pré-configurées sont déjà actives ! 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-xl border p-4 mb-4 ${familleStyle}`}>
              <p className="text-sm font-medium text-gray-700">
                💡 Ces <strong>{dormantLessons.length} leçon(s)</strong> sont pré-configurées avec vocabulaire et exercices.
                Un clic suffit pour les rendre visibles dans l'app mobile.
              </p>
            </div>

            {LEVELS.filter(lv => dormantLessons.some(l => l.niveau === lv)).map(niveau => (
              <div key={niveau}>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Niveau {niveau}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dormantLessons.filter(l => l.niveau === niveau).map(lesson => (
                    <div key={lesson.id}
                      className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-green-300 hover:bg-green-50/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`badge ${LEVEL_COLORS[lesson.niveau]}`}>{lesson.niveau}</span>
                            <span className="text-xs text-gray-400">#{lesson.ordre}</span>
                            {lesson._count?.steps > 0 && (
                              <span className="text-xs text-emerald-600 font-medium">
                                ✓ {lesson._count.steps} étape(s) prête(s)
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-800">{lesson.titre}</h4>
                          {lesson.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{lesson.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{lesson.pointsXp} XP</p>
                        </div>
                        <button
                          onClick={() => handleActivate(lesson)}
                          disabled={activating === lesson.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex-shrink-0">
                          <BoltIcon className="w-4 h-4" />
                          {activating === lesson.id ? 'Activation…' : 'Activer'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal création / édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editLesson ? 'Modifier la leçon' : `Nouvelle leçon — ${selectedLanguage?.nom || selectedLang}`}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input className="input" value={form.titre}
                  onChange={e => setForm({...form, titre: e.target.value})}
                  placeholder="Ex: Les Salutations en Baoulé" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input h-20 resize-none" value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Description de la leçon..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <select className="input" value={form.niveau}
                    onChange={e => setForm({...form, niveau: e.target.value})}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input type="number" className="input" value={form.ordre}
                    onChange={e => setForm({...form, ordre: parseInt(e.target.value)})} min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" className="input" value={form.pointsXp}
                    onChange={e => setForm({...form, pointsXp: parseInt(e.target.value)})} min="0" />
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
      <PageHelp pageId="lecons" />
    </div>
  );
}
