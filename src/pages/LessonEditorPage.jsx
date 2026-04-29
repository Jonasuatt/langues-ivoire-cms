import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import {
  ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon,
  AcademicCapIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon,
  BookOpenIcon, PuzzlePieceIcon, ChevronUpIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STEP_TYPES = ['VOCABULARY', 'DIALOGUE', 'GRAMMAR', 'EXERCISE'];
const EXERCISE_TYPES = ['VOCABULARY', 'TRANSLATION', 'GRAMMAR', 'LISTENING', 'GAME', 'IMAGE_WORD'];
const STEP_LABELS = { VOCABULARY: 'Vocabulaire', DIALOGUE: 'Dialogue', GRAMMAR: 'Grammaire', EXERCISE: 'Exercice' };
const EX_LABELS   = { VOCABULARY: 'QCM Vocabulaire', TRANSLATION: 'Traduction', GRAMMAR: 'Grammaire', LISTENING: 'Écoute', GAME: 'Jeu', IMAGE_WORD: 'Image & Mot' };

const STEP_ICONS = {
  VOCABULARY: <SpeakerWaveIcon className="w-4 h-4" />,
  DIALOGUE:   <ChatBubbleLeftRightIcon className="w-4 h-4" />,
  GRAMMAR:    <BookOpenIcon className="w-4 h-4" />,
  EXERCISE:   <PuzzlePieceIcon className="w-4 h-4" />,
};
const STEP_COLORS = {
  VOCABULARY: 'bg-blue-100 text-blue-700',
  DIALOGUE:   'bg-purple-100 text-purple-700',
  GRAMMAR:    'bg-green-100 text-green-700',
  EXERCISE:   'bg-orange-100 text-orange-700',
};

// ─── Valeurs initiales par type ───────────────────────────────────────────
function defaultContenu(type) {
  if (type === 'VOCABULARY') return { titre: '', mots: [{ mot: '', traduction: '', transcription: '', audioUrl: '' }] };
  if (type === 'DIALOGUE')   return { titre: '', dialogue: [{ locuteur: '', texte: '', traduction: '' }] };
  if (type === 'GRAMMAR')    return { titre: '', explication: '', exemples: [{ phrase: '', traduction: '' }] };
  return { titre: '', description: '' };
}

// ─── Formulaire Vocabulaire ──────────────────────────────────────────────
function VocabularyForm({ contenu, onChange }) {
  const mots = contenu.mots || [];

  const updateMot = (i, field, val) => {
    const updated = mots.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    onChange({ ...contenu, mots: updated });
  };
  const addMot = () => onChange({ ...contenu, mots: [...mots, { mot: '', traduction: '', transcription: '', audioUrl: '' }] });
  const removeMot = (i) => onChange({ ...contenu, mots: mots.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'étape</label>
        <input className="input" value={contenu.titre || ''} onChange={e => onChange({ ...contenu, titre: e.target.value })} placeholder="Ex : Les salutations de base" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Mots ({mots.length})</label>
          <button onClick={addMot} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <PlusIcon className="w-3 h-3" /> Ajouter un mot
          </button>
        </div>
        <div className="space-y-3">
          {mots.map((mot, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50 relative">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Mot en langue *</label>
                  <input className="input text-sm" value={mot.mot} onChange={e => updateMot(i, 'mot', e.target.value)} placeholder="Akwaba" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Traduction *</label>
                  <input className="input text-sm" value={mot.traduction} onChange={e => updateMot(i, 'traduction', e.target.value)} placeholder="Bienvenue" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">Transcription phonétique</label>
                  <input className="input text-sm" value={mot.transcription || ''} onChange={e => updateMot(i, 'transcription', e.target.value)} placeholder="ak-wa-ba" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-0.5 block">URL Audio (optionnel)</label>
                  <input className="input text-sm" value={mot.audioUrl || ''} onChange={e => updateMot(i, 'audioUrl', e.target.value)} placeholder="https://..." />
                </div>
              </div>
              {mots.length > 1 && (
                <button onClick={() => removeMot(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire Dialogue ─────────────────────────────────────────────────
function DialogueForm({ contenu, onChange }) {
  const lignes = contenu.dialogue || [];

  const updateLigne = (i, field, val) => {
    const updated = lignes.map((l, idx) => idx === i ? { ...l, [field]: val } : l);
    onChange({ ...contenu, dialogue: updated });
  };
  const addLigne = () => onChange({ ...contenu, dialogue: [...lignes, { locuteur: '', texte: '', traduction: '' }] });
  const removeLigne = (i) => onChange({ ...contenu, dialogue: lignes.filter((_, idx) => idx !== i) });
  const moveLigne = (i, dir) => {
    const arr = [...lignes];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ ...contenu, dialogue: arr });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du dialogue</label>
        <input className="input" value={contenu.titre || ''} onChange={e => onChange({ ...contenu, titre: e.target.value })} placeholder="Ex : Au marché avec Aya" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Répliques ({lignes.length})</label>
          <button onClick={addLigne} className="text-xs text-purple-600 hover:underline flex items-center gap-1">
            <PlusIcon className="w-3 h-3" /> Ajouter une réplique
          </button>
        </div>
        <div className="space-y-2">
          {lignes.map((ligne, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50 relative">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Locuteur *</label>
                    <input className="input text-sm" value={ligne.locuteur} onChange={e => updateLigne(i, 'locuteur', e.target.value)} placeholder="Aya" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Texte en langue *</label>
                    <input className="input text-sm" value={ligne.texte} onChange={e => updateLigne(i, 'texte', e.target.value)} placeholder="Akwaba !" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-0.5 block">Traduction *</label>
                    <input className="input text-sm" value={ligne.traduction} onChange={e => updateLigne(i, 'traduction', e.target.value)} placeholder="Bienvenue !" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 ml-1">
                  <button onClick={() => moveLigne(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveLigne(i, 1)} disabled={i === lignes.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20">
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                {lignes.length > 1 && (
                  <button onClick={() => removeLigne(i)} className="text-gray-300 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire Grammaire ────────────────────────────────────────────────
function GrammarForm({ contenu, onChange }) {
  const exemples = contenu.exemples || [];

  const updateEx = (i, field, val) => {
    const updated = exemples.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
    onChange({ ...contenu, exemples: updated });
  };
  const addEx = () => onChange({ ...contenu, exemples: [...exemples, { phrase: '', traduction: '' }] });
  const removeEx = (i) => onChange({ ...contenu, exemples: exemples.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la règle</label>
        <input className="input" value={contenu.titre || ''} onChange={e => onChange({ ...contenu, titre: e.target.value })} placeholder="Ex : La construction du salut formel" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Explication</label>
        <textarea className="input h-24 resize-none" value={contenu.explication || ''} onChange={e => onChange({ ...contenu, explication: e.target.value })} placeholder="Expliquez la règle grammaticale en français simple..." />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Exemples ({exemples.length})</label>
          <button onClick={addEx} className="text-xs text-green-600 hover:underline flex items-center gap-1">
            <PlusIcon className="w-3 h-3" /> Ajouter un exemple
          </button>
        </div>
        <div className="space-y-2">
          {exemples.map((ex, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border border-gray-200 rounded-xl p-3 bg-gray-50 relative">
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Phrase en langue *</label>
                <input className="input text-sm" value={ex.phrase} onChange={e => updateEx(i, 'phrase', e.target.value)} placeholder="N zra min ?" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-0.5 block">Traduction *</label>
                <input className="input text-sm" value={ex.traduction} onChange={e => updateEx(i, 'traduction', e.target.value)} placeholder="Comment t'appelles-tu ?" />
              </div>
              {exemples.length > 1 && (
                <button onClick={() => removeEx(i)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire Exercice (type d'étape) ─────────────────────────────────
function ExerciseStepForm({ contenu, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'étape</label>
        <input className="input" value={contenu.titre || ''} onChange={e => onChange({ ...contenu, titre: e.target.value })} placeholder="Ex : Mise en pratique" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
        <textarea className="input h-20 resize-none" value={contenu.description || ''} onChange={e => onChange({ ...contenu, description: e.target.value })} placeholder="Testez vos connaissances avec ces exercices..." />
      </div>
      <p className="text-xs text-gray-400 bg-orange-50 border border-orange-100 rounded-lg p-3">
        💡 Après avoir créé cette étape, ajoutez des exercices QCM depuis l'éditeur de leçon.
      </p>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────
export default function LessonEditorPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showExModal, setShowExModal]     = useState(false);
  const [editStep, setEditStep]     = useState(null);
  const [editExercise, setEditExercise]   = useState(null);
  const [activeStepId, setActiveStepId]   = useState(null);
  const [saving, setSaving]         = useState(false);

  // Step form — contenu est un objet JS, pas du JSON brut
  const [stepType, setStepType]     = useState('VOCABULARY');
  const [stepOrdre, setStepOrdre]   = useState(1);
  const [stepContenu, setStepContenu] = useState(defaultContenu('VOCABULARY'));

  // Exercise form
  const [exForm, setExForm] = useState({
    type: 'VOCABULARY', question: '', choix: '', reponse: '', pointsXp: 10, explication: '',
  });

  const load = () => {
    setLoading(true);
    lessonsAPI.getLesson(lessonId)
      .then(({ data }) => setLesson(data))
      .catch(() => toast.error('Impossible de charger la leçon'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [lessonId]);

  // Quand le type change dans le modal, réinitialiser le contenu
  const handleTypeChange = (type) => {
    setStepType(type);
    setStepContenu(defaultContenu(type));
  };

  // ─── Ouvrir le modal d'ajout / édition d'étape ──────────────────────
  const openAddStep = () => {
    setEditStep(null);
    const maxOrdre = lesson?.steps?.length ? Math.max(...lesson.steps.map(s => s.ordre)) + 1 : 1;
    setStepType('VOCABULARY');
    setStepOrdre(maxOrdre);
    setStepContenu(defaultContenu('VOCABULARY'));
    setShowStepModal(true);
  };

  const openEditStep = (step) => {
    setEditStep(step);
    setStepType(step.type);
    setStepOrdre(step.ordre);
    // Remplir le formulaire depuis le contenu existant
    setStepContenu(step.contenu || defaultContenu(step.type));
    setShowStepModal(true);
  };

  const saveStep = async () => {
    // Validation minimale
    if (!stepContenu.titre?.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (stepType === 'VOCABULARY' && (!stepContenu.mots || stepContenu.mots.length === 0 || !stepContenu.mots[0].mot)) {
      toast.error('Ajoutez au moins un mot');
      return;
    }
    if (stepType === 'DIALOGUE' && (!stepContenu.dialogue || stepContenu.dialogue.length === 0)) {
      toast.error('Ajoutez au moins une réplique');
      return;
    }

    setSaving(true);
    try {
      const data = { type: stepType, ordre: stepOrdre, contenu: stepContenu };
      if (editStep) {
        await lessonsAPI.updateStep(editStep.id, data);
        toast.success('Étape mise à jour ✓');
      } else {
        await lessonsAPI.createStep(lessonId, data);
        toast.success('Étape créée ✓');
      }
      setShowStepModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  const deleteStep = async (stepId) => {
    if (!confirm('Supprimer cette étape et ses exercices ?')) return;
    try {
      await lessonsAPI.deleteStep(stepId);
      toast.success('Étape supprimée');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  // ─── Exercices ──────────────────────────────────────────────────────
  const openAddExercise = (stepId) => {
    setActiveStepId(stepId);
    setEditExercise(null);
    setExForm({ type: 'VOCABULARY', question: '', choix: '', reponse: '', pointsXp: 10, explication: '' });
    setShowExModal(true);
  };

  const openEditExercise = (exercise, stepId) => {
    setActiveStepId(stepId);
    setEditExercise(exercise);
    setExForm({
      type: exercise.type,
      question: exercise.donnees?.question || '',
      choix: (exercise.donnees?.choix || []).join(', '),
      reponse: exercise.solution?.reponse || '',
      pointsXp: exercise.pointsXp || 10,
      explication: exercise.explication || '',
    });
    setShowExModal(true);
  };

  const saveExercise = async () => {
    if (!exForm.question || !exForm.choix || !exForm.reponse) {
      toast.error('Question, choix et réponse sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      const choixArray = exForm.choix.split(',').map(c => c.trim()).filter(Boolean);
      const data = {
        type: exForm.type,
        donnees: { question: exForm.question, choix: choixArray },
        solution: { reponse: exForm.reponse },
        pointsXp: exForm.pointsXp,
        explication: exForm.explication || null,
      };
      if (editExercise) {
        await lessonsAPI.updateExercise(editExercise.id, data);
        toast.success('Exercice mis à jour ✓');
      } else {
        await lessonsAPI.createExercise(activeStepId, data);
        toast.success('Exercice créé ✓');
      }
      setShowExModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally { setSaving(false); }
  };

  const deleteExercise = async (exerciseId) => {
    if (!confirm('Supprimer cet exercice ?')) return;
    try {
      await lessonsAPI.deleteExercise(exerciseId);
      toast.success('Exercice supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  // ─── Render ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-40 bg-gray-100 rounded-xl" />
      <div className="h-40 bg-gray-100 rounded-xl" />
    </div>
  );

  if (!lesson) return <div className="p-8 text-gray-500">Leçon introuvable</div>;

  const steps = [...(lesson.steps || [])].sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm">
        <ArrowLeftIcon className="w-4 h-4" /> Retour aux leçons
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.titre}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {lesson.language?.nom} · Niveau {lesson.niveau} · {lesson.pointsXp} XP · {steps.length} étape(s)
          </p>
        </div>
        <button onClick={openAddStep} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Ajouter une étape
        </button>
      </div>

      {/* Steps */}
      {steps.length === 0 ? (
        <div className="card text-center py-16">
          <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Aucune étape pour cette leçon.</p>
          <button onClick={openAddStep} className="btn-primary mx-auto">
            <PlusIcon className="w-4 h-4 mr-1" /> Créer la première étape
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="card">
              {/* En-tête de l'étape */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`badge flex items-center gap-1 ${STEP_COLORS[step.type] || 'bg-gray-100 text-gray-700'}`}>
                      {STEP_ICONS[step.type]}
                      {STEP_LABELS[step.type] || step.type}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{step.contenu?.titre || ''}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditStep(step)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50" title="Modifier">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteStep(step.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50" title="Supprimer">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aperçu du contenu */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-3">
                {step.type === 'VOCABULARY' && step.contenu?.mots && (
                  <div className="flex flex-wrap gap-1">
                    {step.contenu.mots.slice(0, 6).map((m, i) => (
                      <span key={i} className="bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                        {m.mot} = {m.traduction}
                      </span>
                    ))}
                    {step.contenu.mots.length > 6 && <span className="text-gray-400 text-xs">+{step.contenu.mots.length - 6} mots</span>}
                  </div>
                )}
                {step.type === 'DIALOGUE' && step.contenu?.dialogue && (
                  <div className="space-y-1">
                    {step.contenu.dialogue.slice(0, 3).map((l, i) => (
                      <p key={i}><span className="font-medium text-purple-700">{l.locuteur} :</span> {l.texte}</p>
                    ))}
                    {step.contenu.dialogue.length > 3 && <p className="text-gray-400">+{step.contenu.dialogue.length - 3} répliques</p>}
                  </div>
                )}
                {step.type === 'GRAMMAR' && (
                  <p className="text-gray-600 line-clamp-2">{step.contenu?.explication || '—'}</p>
                )}
                {step.type === 'EXERCISE' && (
                  <p className="text-gray-400 italic">{step.contenu?.description || 'Étape d\'exercices'}</p>
                )}
              </div>

              {/* Exercices */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Exercices ({step.exercises?.length || 0})
                  </span>
                  <button onClick={() => openAddExercise(step.id)} className="text-xs text-accent hover:underline flex items-center gap-1">
                    <PlusIcon className="w-3 h-3" /> Ajouter un exercice
                  </button>
                </div>
                {step.exercises?.length > 0 && (
                  <div className="space-y-1">
                    {step.exercises.map((ex) => (
                      <div key={ex.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <span className={`badge mr-2 text-xs ${STEP_COLORS[ex.type] || 'bg-gray-100 text-gray-700'}`}>
                            {EX_LABELS[ex.type] || ex.type}
                          </span>
                          <span className="text-sm text-gray-700 truncate">{ex.donnees?.question || '—'}</span>
                          <span className="text-xs text-yellow-600 ml-2 font-medium">{ex.pointsXp} XP</span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEditExercise(ex, step.id)} className="p-1 text-gray-400 hover:text-primary-500">
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteExercise(ex.id)} className="p-1 text-gray-400 hover:text-red-500">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal Étape ──────────────────────────────────────────────── */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editStep ? 'Modifier l\'étape' : 'Nouvelle étape'}
            </h2>

            {/* Sélecteur de type (avec icônes) */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'étape</label>
              <div className="grid grid-cols-4 gap-2">
                {STEP_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      stepType === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${stepType === t ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {STEP_ICONS[t]}
                    </span>
                    {STEP_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordre */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position dans la leçon</label>
              <input
                type="number" min="1" className="input w-24"
                value={stepOrdre}
                onChange={e => setStepOrdre(parseInt(e.target.value) || 1)}
              />
            </div>

            {/* Formulaire selon le type */}
            <div className="border-t border-gray-100 pt-5">
              {stepType === 'VOCABULARY' && <VocabularyForm contenu={stepContenu} onChange={setStepContenu} />}
              {stepType === 'DIALOGUE'   && <DialogueForm   contenu={stepContenu} onChange={setStepContenu} />}
              {stepType === 'GRAMMAR'    && <GrammarForm    contenu={stepContenu} onChange={setStepContenu} />}
              {stepType === 'EXERCISE'   && <ExerciseStepForm contenu={stepContenu} onChange={setStepContenu} />}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStepModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={saveStep} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editStep ? 'Mettre à jour' : 'Créer l\'étape'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Exercice ──────────────────────────────────────────── */}
      {showExModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type d'exercice</label>
                  <select className="input" value={exForm.type} onChange={e => setExForm({...exForm, type: e.target.value})}>
                    {EXERCISE_TYPES.map(t => <option key={t} value={t}>{EX_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" className="input" value={exForm.pointsXp}
                    onChange={e => setExForm({...exForm, pointsXp: parseInt(e.target.value)})} min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input className="input" value={exForm.question}
                  onChange={e => setExForm({...exForm, question: e.target.value})}
                  placeholder='Comment dit-on "Bonjour" en Baoulé ?' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choix * <span className="text-gray-400 font-normal">(séparés par des virgules)</span>
                </label>
                <input className="input" value={exForm.choix}
                  onChange={e => setExForm({...exForm, choix: e.target.value})}
                  placeholder="Akwaba, Meda w'o, N'zrè, Kouassi" />
                <p className="text-xs text-gray-400 mt-1">
                  Exemple : <code>Option A, Option B, Option C, Option D</code>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte *</label>
                <input className="input" value={exForm.reponse}
                  onChange={e => setExForm({...exForm, reponse: e.target.value})}
                  placeholder="Doit correspondre exactement à l'un des choix" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explication <span className="text-gray-400 font-normal">(affichée après la réponse)</span>
                </label>
                <textarea className="input h-20 resize-none" value={exForm.explication}
                  onChange={e => setExForm({...exForm, explication: e.target.value})}
                  placeholder="Ex : Akwaba signifie Bienvenue en Baoulé et s'utilise pour accueillir chaleureusement." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={saveExercise} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editExercise ? 'Mettre à jour' : 'Créer l\'exercice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
