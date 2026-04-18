import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../services/api';
import {
  ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon,
  ChevronUpIcon, ChevronDownIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const STEP_TYPES = ['VOCABULARY', 'DIALOGUE', 'GRAMMAR', 'EXERCISE'];
const EXERCISE_TYPES = ['VOCABULARY', 'TRANSLATION', 'GRAMMAR', 'LISTENING', 'GAME', 'IMAGE_WORD'];
const STEP_LABELS = { VOCABULARY: 'Vocabulaire', DIALOGUE: 'Dialogue', GRAMMAR: 'Grammaire', EXERCISE: 'Exercice' };
const EX_LABELS = { VOCABULARY: 'QCM Vocabulaire', TRANSLATION: 'Traduction', GRAMMAR: 'Grammaire', LISTENING: 'Écoute', GAME: 'Jeu', IMAGE_WORD: 'Image & Mot' };

export default function LessonEditorPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showExModal, setShowExModal] = useState(false);
  const [editStep, setEditStep] = useState(null);
  const [editExercise, setEditExercise] = useState(null);
  const [activeStepId, setActiveStepId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Step form
  const [stepForm, setStepForm] = useState({ type: 'VOCABULARY', ordre: 1, contenu: '{}' });
  // Exercise form
  const [exForm, setExForm] = useState({ type: 'VOCABULARY', question: '', choix: '', reponse: '', pointsXp: 10, explication: '' });

  const load = () => {
    setLoading(true);
    lessonsAPI.getLesson(lessonId)
      .then(({ data }) => setLesson(data))
      .catch(() => toast.error('Impossible de charger la leçon'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lessonId]);

  // ─── Steps ───

  const openAddStep = () => {
    setEditStep(null);
    const maxOrdre = lesson?.steps?.length ? Math.max(...lesson.steps.map(s => s.ordre)) + 1 : 1;
    setStepForm({ type: 'VOCABULARY', ordre: maxOrdre, contenu: '{\n  "titre": "",\n  "mots": []\n}' });
    setShowStepModal(true);
  };

  const openEditStep = (step) => {
    setEditStep(step);
    setStepForm({
      type: step.type,
      ordre: step.ordre,
      contenu: JSON.stringify(step.contenu, null, 2),
    });
    setShowStepModal(true);
  };

  const saveStep = async () => {
    let contenu;
    try {
      contenu = JSON.parse(stepForm.contenu);
    } catch {
      toast.error('Le contenu JSON est invalide');
      return;
    }
    setSaving(true);
    try {
      const data = { type: stepForm.type, ordre: stepForm.ordre, contenu };
      if (editStep) {
        await lessonsAPI.updateStep(editStep.id, data);
        toast.success('Étape mise à jour');
      } else {
        await lessonsAPI.createStep(lessonId, data);
        toast.success('Étape créée');
      }
      setShowStepModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
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

  // ─── Exercises ───

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
        toast.success('Exercice mis à jour');
      } else {
        await lessonsAPI.createExercise(activeStepId, data);
        toast.success('Exercice créé');
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

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
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
          <p className="text-gray-400">Aucune étape. Ajoutez la première étape de cette leçon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="badge bg-blue-100 text-blue-700 mr-2">{STEP_LABELS[step.type] || step.type}</span>
                    <span className="text-sm text-gray-500">{step.contenu?.titre || ''}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditStep(step)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteStep(step.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aperçu du contenu */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mb-3">
                {step.contenu?.mots && (
                  <p>{step.contenu.mots.length} mot(s) : {step.contenu.mots.slice(0, 4).map(m => m.mot).join(', ')}{step.contenu.mots.length > 4 ? '...' : ''}</p>
                )}
                {step.contenu?.dialogue && (
                  <p>{step.contenu.dialogue.length} réplique(s)</p>
                )}
                {step.contenu?.explication && (
                  <p className="truncate">{step.contenu.explication}</p>
                )}
              </div>

              {/* Exercices */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Exercices ({step.exercises?.length || 0})
                  </span>
                  <button onClick={() => openAddExercise(step.id)} className="text-xs text-accent hover:underline flex items-center gap-1">
                    <PlusIcon className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {step.exercises?.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg mb-1">
                    <div className="flex-1 min-w-0">
                      <span className="badge bg-purple-100 text-purple-700 mr-2 text-xs">{EX_LABELS[ex.type] || ex.type}</span>
                      <span className="text-sm text-gray-700 truncate">{ex.donnees?.question || '—'}</span>
                      <span className="text-xs text-gray-400 ml-2">{ex.pointsXp} XP</span>
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
            </div>
          ))}
        </div>
      )}

      {/* Modal Step */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editStep ? 'Modifier l\'étape' : 'Nouvelle étape'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input" value={stepForm.type} onChange={e => setStepForm({...stepForm, type: e.target.value})}>
                    {STEP_TYPES.map(t => <option key={t} value={t}>{STEP_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input type="number" className="input" value={stepForm.ordre} onChange={e => setStepForm({...stepForm, ordre: parseInt(e.target.value)})} min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu (JSON)</label>
                <textarea
                  className="input font-mono text-sm h-64 resize-y"
                  value={stepForm.contenu}
                  onChange={e => setStepForm({...stepForm, contenu: e.target.value})}
                  placeholder='{"titre": "...", "mots": [{"mot": "...", "traduction": "...", "transcription": "..."}]}'
                />
                <p className="text-xs text-gray-400 mt-1">
                  Vocabulaire : {`{"titre", "mots": [{mot, traduction, transcription}]}`} · Dialogue : {`{"titre", "dialogue": [{locuteur, texte, traduction}]}`} · Grammaire : {`{"titre", "explication", "exemples": [{phrase, traduction}]}`}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowStepModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={saveStep} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editStep ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Exercise */}
      {showExModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input" value={exForm.type} onChange={e => setExForm({...exForm, type: e.target.value})}>
                    {EXERCISE_TYPES.map(t => <option key={t} value={t}>{EX_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points XP</label>
                  <input type="number" className="input" value={exForm.pointsXp} onChange={e => setExForm({...exForm, pointsXp: parseInt(e.target.value)})} min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input className="input" value={exForm.question} onChange={e => setExForm({...exForm, question: e.target.value})} placeholder='Comment dit-on "Bonjour" ?' />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choix * (séparés par des virgules)</label>
                <input className="input" value={exForm.choix} onChange={e => setExForm({...exForm, choix: e.target.value})} placeholder="Option A, Option B, Option C, Option D" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Réponse correcte *</label>
                <input className="input" value={exForm.reponse} onChange={e => setExForm({...exForm, reponse: e.target.value})} placeholder="Option B" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explication</label>
                <textarea className="input h-20 resize-none" value={exForm.explication} onChange={e => setExForm({...exForm, explication: e.target.value})} placeholder="Explication affichée après la réponse..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={saveExercise} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editExercise ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
