/**
 * Cursus Scolaire — Administration (Phase A)
 * -------------------------------------------
 * 4 onglets :
 *  - Classes        : les 16 niveaux (CP1 → Terminale + Chercheur), seuils et modes de passage
 *  - Modules        : verrouillage des modules pédagogiques vs outils libres
 *  - Leçons         : rattachement des leçons aux classes et matières (3 piliers)
 *  - Statistiques   : répartition des élèves par classe et par langue
 */
import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import { curriculumAPI, lessonsAPI, languagesAPI, notesAPI, cursusCertAPI, filieresAPI, chercheurAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  AcademicCapIcon, LockClosedIcon, LockOpenIcon,
  BookOpenIcon, ChartBarIcon, PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CYCLE_COLORS = {
  PRIMAIRE:  'bg-green-100 text-green-800',
  COLLEGE:   'bg-blue-100 text-blue-800',
  LYCEE:     'bg-purple-100 text-purple-800',
  CHERCHEUR: 'bg-amber-100 text-amber-800',
};
const MODE_LABELS = {
  AUTO:   { label: 'Automatique (score)', cls: 'bg-emerald-100 text-emerald-700' },
  COMITE: { label: "Comité d'experts",    cls: 'bg-red-100 text-red-700' },
};
const PILIER_LABELS = {
  LANGUE_COMMUNICATION: 'Langue & Communication',
  CULTURE_CITOYENNETE:  'Culture & Citoyenneté',
  PRATIQUE_METIERS:     'Pratique & Métiers',
};

export default function CursusPage() {
  const { user } = useAuth();
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  const [tab, setTab] = useState('classes');
  const [grades, setGrades] = useState([]);
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [lessonLangFilter, setLessonLangFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Phase B — Comité
  const [exams, setExams]             = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examFilter, setExamFilter]   = useState('PENDING');
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm]   = useState({ decision: 'APPROVED', commentaire: '' });

  // Phase C — Bulletins
  const [bulletins, setBulletins]           = useState([]);
  const [bulletinsLoading, setBulletinsLoading] = useState(false);
  const [bulletinFilter, setBulletinFilter] = useState({ trimestre: '', annee: '', validated: '' });
  const [genForm, setGenForm]               = useState({ enrollmentId: '', trimestre: 'T1', annee: new Date().getFullYear() });
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [batchLoading, setBatchLoading]       = useState(false);
  const [demoLoading, setDemoLoading]         = useState(false);
  const [elevesLangFilter, setElevesLangFilter]   = useState('');
  const [elevesGradeFilter, setElevesGradeFilter] = useState('');
  const [elevesSearch, setElevesSearch]           = useState('');
  const [validatingId, setValidatingId]     = useState(null);
  const [validateForm, setValidateForm]     = useState({ observations: '' });

  // Certificats de fin de cycle (Phase D3)
  const [certs, setCerts]               = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certFilterLang, setCertFilterLang] = useState('');
  const [certFilterType, setCertFilterType] = useState('');
  // Parcours Chercheur (Phase D2)
  const [objectifsChercheur, setObjectifsChercheur]   = useState([]);
  const [chercheurLoading, setChercheurLoading]       = useState(false);
  const [objModal, setObjModal]                       = useState(null); // null | 'create' | objId
  const [objForm, setObjForm]                         = useState({ gradeLevelId: '', type: 'AUDIO_ENREGISTREMENT', quantite: '', description: '' });
  // Filières (Phase D1)
  const [filieres, setFilieres]               = useState([]);
  const [filieresLoading, setFilieresLoading] = useState(false);
  const [filiereModal, setFiliereModal]       = useState(null); // null | 'create' | filiereObj
  const [filiereForm, setFiliereForm]         = useState({ code: '', nom: '', description: '', emoji: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [g, m, langs] = await Promise.all([
        curriculumAPI.getGrades(),
        curriculumAPI.getModules(),
        languagesAPI.getAll(),
      ]);
      setGrades(g.data);
      setModules(m.data);
      setLanguages(Array.isArray(langs.data) ? langs.data : (langs.data?.data ?? []));
      if (isAdmin) {
        const s = await curriculumAPI.getStats();
        setStats(s.data);
      }
    } catch {
      toast.error('Erreur de chargement du cursus', { id: 'cursus-load' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Charger les leçons quand l'onglet Leçons est ouvert
  useEffect(() => {
    if (tab !== 'lessons') return;
    lessonsAPI.getAllAdmin({ limit: 500 })
      .then(({ data }) => setLessons(Array.isArray(data) ? data : (data?.data ?? data?.lessons ?? [])))
      .catch(() => toast.error('Erreur de chargement des leçons'));
  }, [tab]);

  // Charger les examens quand l'onglet Comité est ouvert ou le filtre change
  useEffect(() => {
    if (tab !== 'comite') return;
    setExamsLoading(true);
    curriculumAPI.listExams({ status: examFilter })
      .then(({ data }) => setExams(data.items ?? []))
      .catch(() => toast.error('Erreur de chargement des examens'))
      .finally(() => setExamsLoading(false));
  }, [tab, examFilter]);

  // Charger les certificats de fin de cycle (Phase D3)
  useEffect(() => {
    if (tab !== 'certificats') return;
    setCertsLoading(true);
    const params = {};
    if (certFilterLang) params.languageId = certFilterLang;
    if (certFilterType) params.type       = certFilterType;
    cursusCertAPI.list(params)
      .then(({ data }) => setCerts(data.certificats ?? []))
      .catch(() => {})
      .finally(() => setCertsLoading(false));
  }, [tab, certFilterLang, certFilterType]);

  // Charger les objectifs Chercheur (Phase D2)
  useEffect(() => {
    if (tab !== 'chercheur') return;
    setChercheurLoading(true);
    chercheurAPI.listObjectifs()
      .then(({ data }) => setObjectifsChercheur(Array.isArray(data) ? data : (data?.objectifs ?? [])))
      .catch(() => {})
      .finally(() => setChercheurLoading(false));
  }, [tab]);

  // Charger les filières (Phase D1)
  useEffect(() => {
    if (tab !== 'filieres') return;
    setFilieresLoading(true);
    filieresAPI.admin()
      .then(({ data }) => setFilieres(Array.isArray(data) ? data : (data?.filieres ?? [])))
      .catch(() => {})
      .finally(() => setFilieresLoading(false));
  }, [tab]);

  // Charger la liste des inscrits quand l'onglet Bulletins ou Élèves est ouvert
  useEffect(() => {
    if (tab !== 'bulletins' && tab !== 'eleves') return;
    curriculumAPI.listEnrollments()
      .then(({ data }) => setAllEnrollments(data.enrollments ?? []))
      .catch(() => {});
  }, [tab]);

  // Charger les bulletins quand l'onglet Bulletins est ouvert ou les filtres changent
  useEffect(() => {
    if (tab !== 'bulletins') return;
    setBulletinsLoading(true);
    const params = {};
    if (bulletinFilter.trimestre) params.trimestre = bulletinFilter.trimestre;
    if (bulletinFilter.annee)     params.annee     = bulletinFilter.annee;
    if (bulletinFilter.validated) params.validated = bulletinFilter.validated;
    notesAPI.listBulletins(params)
      .then(({ data }) => setBulletins(data.bulletins ?? []))
      .catch(() => toast.error('Erreur de chargement des bulletins'))
      .finally(() => setBulletinsLoading(false));
  }, [tab, bulletinFilter]);

  const handleReview = async (examId) => {
    try {
      await curriculumAPI.reviewExam(examId, reviewForm);
      toast.success(reviewForm.decision === 'APPROVED' ? '✅ Passage validé !' : '❌ Demande refusée');
      setReviewingId(null);
      setReviewForm({ decision: 'APPROVED', commentaire: '' });
      // Rafraîchir la liste
      const { data } = await curriculumAPI.listExams({ status: examFilter });
      setExams(data.items ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur lors de la décision');
    }
  };

  const handleTake = async (examId) => {
    try {
      await curriculumAPI.takeExam(examId);
      toast.success('Examen pris en charge');
      const { data } = await curriculumAPI.listExams({ status: examFilter });
      setExams(data.items ?? []);
    } catch { toast.error('Erreur'); }
  };

  const handleGenerateBulletin = async () => {
    if (!genForm.enrollmentId.trim()) { toast.error("L'ID d'inscription est requis."); return; }
    try {
      const { data } = await notesAPI.generateBulletin({
        enrollmentId: genForm.enrollmentId.trim(),
        trimestre: genForm.trimestre,
        annee: parseInt(genForm.annee),
      });
      toast.success(`Bulletin généré — ${data.nbNotes} notes traitées`);
      setGenForm(f => ({ ...f, enrollmentId: '' }));
      // Rafraîchir la liste
      const res = await notesAPI.listBulletins({});
      setBulletins(res.data.bulletins ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur de génération');
    }
  };

  const handleBatch = async () => {
    if (!genForm.trimestre || !genForm.annee) { toast.error('Choisissez un trimestre et une année.'); return; }
    setBatchLoading(true);
    try {
      const { data } = await notesAPI.generateBatch({ trimestre: genForm.trimestre, annee: parseInt(genForm.annee) });
      toast.success(`✅ ${data.generated} bulletins générés, ${data.skipped} ignorés (déjà validés), ${data.errors} erreurs`);
      const res = await notesAPI.listBulletins({});
      setBulletins(res.data.bulletins ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur de génération en masse');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSeedContent = async () => {
    if (!window.confirm('Assigner des leçons démo à CP1, CP2 et CE1 pour toutes les langues actives ?')) return;
    setDemoLoading('seed');
    try {
      const { data } = await curriculumAPI.seedContent();
      toast.success(`✅ ${data.totalAssigned} leçon(s) assignée(s) au cursus`);
      // Recharger les leçons
      const res = await lessonsAPI.getAllAdmin({ limit: 500 });
      setLessons(Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.lessons ?? []));
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur lors du seed');
    } finally { setDemoLoading(false); }
  };

  const handleResetContent = async () => {
    if (!window.confirm('Retirer TOUTES les assignations de classe sur les leçons ? Cette action est réversible (relancez le seed).')) return;
    setDemoLoading('reset');
    try {
      const { data } = await curriculumAPI.resetContent();
      toast.success(`🗑️ ${data.resetCount} leçon(s) réinitialisée(s)`);
      const res = await lessonsAPI.getAllAdmin({ limit: 500 });
      setLessons(Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.lessons ?? []));
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur lors du reset');
    } finally { setDemoLoading(false); }
  };

  const handleValidateBulletin = async (id) => {
    try {
      await notesAPI.validateBulletin(id, { observations: validateForm.observations });
      toast.success('Bulletin validé ✅');
      setValidatingId(null);
      setValidateForm({ observations: '' });
      const res = await notesAPI.listBulletins({});
      setBulletins(res.data.bulletins ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Erreur de validation');
    }
  };

  const saveGrade = async (grade, patch) => {
    try {
      const { data } = await curriculumAPI.updateGrade(grade.id, patch);
      setGrades(gs => gs.map(g => g.id === data.id ? data : g));
      toast.success(`${grade.nom} mis à jour`);
    } catch { toast.error('Échec de la mise à jour'); }
  };

  const saveModule = async (mod, patch) => {
    try {
      const { data } = await curriculumAPI.updateModule(mod.id, patch);
      setModules(ms => ms.map(m => m.id === data.id ? { ...m, ...data } : m));
      toast.success(`${mod.nom} mis à jour`);
    } catch { toast.error('Échec de la mise à jour'); }
  };

  const assignLesson = async (lesson, patch) => {
    try {
      const { data } = await curriculumAPI.assignLesson(lesson.id, patch);
      setLessons(ls => ls.map(l => l.id === lesson.id ? { ...l, ...data } : l));
      toast.success('Leçon rattachée');
    } catch { toast.error('Échec du rattachement'); }
  };

  const gradeName = (ordre) => grades.find(g => g.ordre === ordre)?.nom ?? `Ordre ${ordre}`;

  const initSeed = async () => {
    try {
      const { data } = await curriculumAPI.seed();
      toast.success(data.message);
      load();
    } catch { toast.error("Échec de l'initialisation"); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement du cursus…</div>;

  // Production fraîchement déployée : les niveaux n'existent pas encore
  if (grades.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <AcademicCapIcon className="w-14 h-14 text-emerald-800 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cursus Scolaire</h1>
        <p className="text-sm text-gray-500 mb-6">
          Le cursus n'est pas encore initialisé sur ce serveur. Cliquez ci-dessous pour créer
          les 16 niveaux (CP1 → Terminale + Parcours Chercheur) et la configuration des modules.
        </p>
        {isAdmin ? (
          <button onClick={initSeed} className="bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition">
            🏫 Initialiser le cursus
          </button>
        ) : (
          <p className="text-xs text-gray-400">Demandez à un administrateur d'initialiser le cursus.</p>
        )}
      </div>
    );
  }

  const TABS = [
    { id: 'classes',   label: '🏫 Classes' },
    { id: 'modules',   label: '🔒 Modules' },
    { id: 'lessons',   label: '📚 Leçons' },
    ...(isAdmin ? [
      { id: 'eleves',       label: '👥 Élèves' },
      { id: 'comite',       label: '⚖️ Comité' },
      { id: 'bulletins',    label: '📒 Bulletins' },
      { id: 'certificats',  label: '🎓 Certificats' },
      { id: 'filieres',     label: '🏢 Filières' },
      { id: 'chercheur',    label: '🔬 Chercheur' },
      { id: 'stats',        label: '📊 Statistiques' },
    ] : []),
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <AcademicCapIcon className="w-8 h-8 text-emerald-800" />
        <h1 className="text-2xl font-bold text-gray-800">Cursus Scolaire</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Du CP1 à la Terminale puis le Parcours Chercheur — « L'école est un cursus, la culture est un droit. »
      </p>
      <PageHelp title="Cursus Scolaire">
        <p>Les élèves progressent de classe en classe comme dans le système éducatif ivoirien.</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li><b>Classes</b> : ajustez le seuil de passage (% de moyenne) et le mode (automatique ou comité d'experts).</li>
          <li><b>Modules</b> : choisissez quels modules de l'application font partie du cursus (verrouillés par classe) et lesquels restent libres.</li>
          <li><b>Leçons</b> : rattachez chaque leçon à une classe et à une matière. Seules les leçons rattachées comptent pour le passage de classe.</li>
        </ul>
      </PageHelp>

      {/* Onglets */}
      <div className="flex gap-2 mt-4 mb-6 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              tab === t.id ? 'bg-emerald-800 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ───── Onglet Classes ───── */}
      {tab === 'classes' && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Cycle</th>
                <th className="px-4 py-3 text-left">Mode de passage</th>
                <th className="px-4 py-3 text-center">Seuil (%)</th>
                <th className="px-4 py-3 text-center">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{g.nom}</div>
                    <div className="text-xs text-gray-400">{g.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${CYCLE_COLORS[g.cycle]}`}>
                      {g.cycle}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={g.passageMode}
                        onChange={e => saveGrade(g, { passageMode: e.target.value })}
                        className="border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="AUTO">Automatique (score)</option>
                        <option value="COMITE">Comité d'experts</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${MODE_LABELS[g.passageMode].cls}`}>
                        {MODE_LABELS[g.passageMode].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAdmin ? (
                      <input
                        type="number" min="0" max="100" defaultValue={g.seuilPassage}
                        onBlur={e => {
                          const v = parseInt(e.target.value);
                          if (v !== g.seuilPassage && v >= 0 && v <= 100) saveGrade(g, { seuilPassage: v });
                        }}
                        className="w-16 border rounded-lg px-2 py-1 text-center text-xs"
                      />
                    ) : `${g.seuilPassage}%`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox" checked={g.isActive} disabled={!isAdmin}
                      onChange={e => saveGrade(g, { isActive: e.target.checked })}
                      className="w-4 h-4 accent-emerald-700"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───── Onglet Modules ───── */}
      {tab === 'modules' && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-left">Pilier (matière)</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Débloqué dès</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modules.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{m.nom}
                    <div className="text-xs text-gray-400 font-normal">{m.moduleKey}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{PILIER_LABELS[m.pilier]}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <button
                        onClick={() => saveModule(m, { isCursus: !m.isCursus })}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                          m.isCursus ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {m.isCursus ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
                        {m.isCursus ? 'Cursus (verrouillé)' : 'Libre'}
                      </button>
                    ) : (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                        m.isCursus ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.isCursus ? <LockClosedIcon className="w-3.5 h-3.5" /> : <LockOpenIcon className="w-3.5 h-3.5" />}
                        {m.isCursus ? 'Cursus' : 'Libre'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.isCursus ? (
                      isAdmin ? (
                        <select
                          value={m.minGradeOrdre}
                          onChange={e => saveModule(m, { minGradeOrdre: parseInt(e.target.value) })}
                          className="border rounded-lg px-2 py-1 text-xs"
                        >
                          {grades.map(g => <option key={g.id} value={g.ordre}>{g.nom}</option>)}
                        </select>
                      ) : gradeName(m.minGradeOrdre)
                    ) : <span className="text-xs text-gray-400">Toujours accessible</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───── Onglet Leçons ───── */}
      {tab === 'lessons' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <BookOpenIcon className="w-5 h-5 text-gray-500" />
            <select
              value={lessonLangFilter}
              onChange={e => setLessonLangFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes les langues</option>
              {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
            <span className="text-xs text-gray-400 flex-1">
              Seules les leçons rattachées à une classe comptent pour le passage de classe.
            </span>
            {isAdmin && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleSeedContent}
                  disabled={!!demoLoading}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  {demoLoading === 'seed' ? '⏳…' : '⚡ Charger contenu démo'}
                </button>
                <button
                  onClick={handleResetContent}
                  disabled={!!demoLoading}
                  className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-200 transition disabled:opacity-50"
                >
                  {demoLoading === 'reset' ? '⏳…' : '🗑️ Supprimer contenu démo'}
                </button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Leçon</th>
                  <th className="px-4 py-3 text-left">Langue</th>
                  <th className="px-4 py-3 text-left">Classe</th>
                  <th className="px-4 py-3 text-left">Trimestre</th>
                  <th className="px-4 py-3 text-left">Sem.</th>
                  <th className="px-4 py-3 text-left">Matière (pilier)</th>
                  <th className="px-4 py-3 text-center">Obligatoire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lessons
                  .filter(l => !lessonLangFilter || l.languageId === lessonLangFilter)
                  .map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{l.titre}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{l.language?.nom ?? '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.gradeLevelId ?? ''}
                        disabled={!isAdmin}
                        onChange={e => assignLesson(l, { gradeLevelId: e.target.value || null, pilier: l.pilier, isObligatoire: l.isObligatoire ?? true, trimestre: l.trimestre, semaine: l.semaine })}
                        className="border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="">Hors cursus</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {l.gradeLevelId ? (
                        isAdmin ? (
                          <select
                            value={l.trimestre ?? ''}
                            onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: l.pilier, isObligatoire: l.isObligatoire ?? true, trimestre: e.target.value || null, semaine: l.semaine })}
                            className="border rounded-lg px-2 py-1 text-xs"
                          >
                            <option value="">—</option>
                            <option value="T1">T1 — Sept/Déc</option>
                            <option value="T2">T2 — Janv/Mars</option>
                            <option value="T3">T3 — Avr/Juin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            l.trimestre === 'T1' ? 'bg-blue-100 text-blue-700' :
                            l.trimestre === 'T2' ? 'bg-amber-100 text-amber-700' :
                            l.trimestre === 'T3' ? 'bg-green-100 text-green-700' :
                            'text-gray-400'
                          }`}>{l.trimestre ?? '—'}</span>
                        )
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {l.gradeLevelId && l.trimestre ? (
                        isAdmin ? (
                          <input
                            type="number"
                            min="1" max="12"
                            value={l.semaine ?? ''}
                            onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: l.pilier, isObligatoire: l.isObligatoire ?? true, trimestre: l.trimestre, semaine: e.target.value || null })}
                            className="border rounded-lg px-2 py-1 text-xs w-16"
                            placeholder="1-12"
                          />
                        ) : (l.semaine ?? '—')
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.pilier ?? ''}
                        disabled={!isAdmin || !l.gradeLevelId}
                        onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: e.target.value || null, isObligatoire: l.isObligatoire ?? true, trimestre: l.trimestre, semaine: l.semaine })}
                        className="border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="">—</option>
                        {Object.entries(PILIER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={l.isObligatoire ?? true}
                        disabled={!isAdmin || !l.gradeLevelId}
                        onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: l.pilier, isObligatoire: e.target.checked, trimestre: l.trimestre, semaine: l.semaine })}
                        className="w-4 h-4 accent-emerald-700"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lessons.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">Aucune leçon trouvée.</div>
            )}
          </div>
        </div>
      )}

      {/* ───── Onglet Élèves (Phase J) ───── */}
      {tab === 'eleves' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="🔍 Rechercher un élève…"
              value={elevesSearch}
              onChange={e => setElevesSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-56"
            />
            <select
              value={elevesLangFilter}
              onChange={e => setElevesLangFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes les langues</option>
              {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
            <select
              value={elevesGradeFilter}
              onChange={e => setElevesGradeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes les classes</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
            <span className="text-xs text-gray-400 ml-auto">
              {(() => {
                const filtered = allEnrollments
                  .filter(e => !elevesLangFilter  || e.languageId  === elevesLangFilter)
                  .filter(e => !elevesGradeFilter || e.gradeLevelId === elevesGradeFilter)
                  .filter(e => !elevesSearch || `${e.user.prenom} ${e.user.nom} ${e.user.email}`.toLowerCase().includes(elevesSearch.toLowerCase()));
                return `${filtered.length} inscription${filtered.length !== 1 ? 's' : ''}`;
              })()}
            </span>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Élève</th>
                  <th className="px-4 py-3 text-left">Langue</th>
                  <th className="px-4 py-3 text-left">Classe</th>
                  <th className="px-4 py-3 text-left">Cycle</th>
                  <th className="px-4 py-3 text-center">Principale</th>
                  <th className="px-4 py-3 text-center">Moy.</th>
                  <th className="px-4 py-3 text-left">Inscrit le</th>
                  <th className="px-4 py-3 text-left">Filière</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allEnrollments
                  .filter(e => !elevesLangFilter  || e.languageId   === elevesLangFilter)
                  .filter(e => !elevesGradeFilter || e.gradeLevelId === elevesGradeFilter)
                  .filter(e => !elevesSearch || `${e.user.prenom} ${e.user.nom} ${e.user.email}`.toLowerCase().includes(elevesSearch.toLowerCase()))
                  .map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{e.user.prenom} {e.user.nom}</div>
                        <div className="text-xs text-gray-400">{e.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          {e.language?.emoji ?? '📚'} {e.language?.nom}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{e.gradeLevel?.nom}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CYCLE_COLORS[e.gradeLevel?.cycle] ?? 'bg-gray-100 text-gray-600'}`}>
                          {e.gradeLevel?.cycle}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {e.isPrincipal ? <span className="text-amber-500 font-bold">★</span> : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                        {e.moyenne != null ? `${Math.round(e.moyenne)}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {e.startedAt ? new Date(e.startedAt).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {e.filiere ? (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            {e.filiere.emoji ?? '🏢'} {e.filiere.nom}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {allEnrollments.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400">Aucun élève inscrit au cursus.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───── Onglet Comité (Phase B) ───── */}
      {tab === 'comite' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              {['PENDING','IN_REVIEW','APPROVED','REJECTED'].map(s => (
                <button key={s}
                  onClick={() => setExamFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    examFilter === s
                      ? 'bg-purple-700 text-white shadow'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {{ PENDING: '⏳ En attente', IN_REVIEW: '🔍 En cours', APPROVED: '✅ Validés', REJECTED: '❌ Refusés' }[s]}
                </button>
              ))}
            </div>
          </div>

          {examsLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement…</div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold">Aucune demande dans cette catégorie</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">
                          {exam.user.prenom} {exam.user.nom}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                          {exam.language.nom}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          {exam.gradeLevel.nom}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        Soumis le {new Date(exam.createdAt).toLocaleDateString('fr-FR')}
                        {exam.reviewer && ` · Pris en charge par ${exam.reviewer.prenom} ${exam.reviewer.nom}`}
                      </p>

                      {exam.textContent && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">
                            Production de l'élève
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {exam.textContent}
                          </p>
                        </div>
                      )}

                      {exam.audioUrl && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">
                            Enregistrement audio
                          </p>
                          <audio controls src={exam.audioUrl} className="w-full h-10" />
                        </div>
                      )}

                      {exam.commentaire && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
                          <span className="font-semibold">Commentaire comité :</span> {exam.commentaire}
                        </div>
                      )}
                    </div>

                    {/* Panneau de décision */}
                    {['PENDING','IN_REVIEW'].includes(exam.status) && (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        {exam.status === 'PENDING' && (
                          <button
                            onClick={() => handleTake(exam.id)}
                            className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            🔍 Prendre en charge
                          </button>
                        )}
                        {reviewingId === exam.id ? (
                          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50 space-y-2">
                            <select
                              value={reviewForm.decision}
                              onChange={e => setReviewForm(f => ({ ...f, decision: e.target.value }))}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                            >
                              <option value="APPROVED">✅ Approuver</option>
                              <option value="REJECTED">❌ Refuser</option>
                            </select>
                            <textarea
                              placeholder="Commentaire pour l'élève (optionnel)"
                              value={reviewForm.commentaire}
                              onChange={e => setReviewForm(f => ({ ...f, commentaire: e.target.value }))}
                              rows={3}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReview(exam.id)}
                                className="flex-1 py-1.5 bg-purple-700 text-white rounded text-xs font-bold hover:bg-purple-800"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => setReviewingId(null)}
                                className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReviewingId(exam.id); setReviewForm({ decision: 'APPROVED', commentaire: '' }); }}
                            className="w-full px-3 py-2 bg-purple-700 text-white rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors"
                          >
                            ⚖️ Statuer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── Onglet Bulletins (Phase C) ───── */}
      {tab === 'bulletins' && (
        <div className="space-y-6">

          {/* Formulaire de génération */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4">📒 Générer un bulletin trimestriel</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Élève inscrit au cursus</label>
                <select
                  value={genForm.enrollmentId}
                  onChange={e => setGenForm(f => ({ ...f, enrollmentId: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Choisir un élève —</option>
                  {allEnrollments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.user.prenom} {e.user.nom} — {e.language?.emoji ?? '📚'} {e.language?.nom} — {e.gradeLevel?.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Trimestre</label>
                <select
                  value={genForm.trimestre}
                  onChange={e => setGenForm(f => ({ ...f, trimestre: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="T1">T1 — Sept. / Déc.</option>
                  <option value="T2">T2 — Janv. / Mars</option>
                  <option value="T3">T3 — Avril / Juin</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Année</label>
                <input
                  type="number" min="2024" max="2040"
                  value={genForm.annee}
                  onChange={e => setGenForm(f => ({ ...f, annee: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              <button
                onClick={handleGenerateBulletin}
                className="px-5 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition"
              >
                Générer ce bulletin
              </button>
              <button
                onClick={handleBatch}
                disabled={batchLoading}
                className="px-5 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
              >
                {batchLoading ? '⏳ Génération…' : '⚡ Générer pour tous les élèves'}
              </button>
              <span className="text-xs text-gray-400">
                Génère les bulletins de tous les inscrits pour ce trimestre / cette année (ignore les bulletins déjà validés).
              </span>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={bulletinFilter.trimestre}
              onChange={e => setBulletinFilter(f => ({ ...f, trimestre: e.target.value }))}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Tous les trimestres</option>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
            </select>
            <input
              type="number" placeholder="Année…" min="2024" max="2040"
              value={bulletinFilter.annee}
              onChange={e => setBulletinFilter(f => ({ ...f, annee: e.target.value }))}
              className="border rounded-lg px-3 py-1.5 text-sm w-24"
            />
            <select
              value={bulletinFilter.validated}
              onChange={e => setBulletinFilter(f => ({ ...f, validated: e.target.value }))}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Tous les statuts</option>
              <option value="false">Non validés</option>
              <option value="true">Validés</option>
            </select>
          </div>

          {/* Liste des bulletins */}
          {bulletinsLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement…</div>
          ) : bulletins.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold">Aucun bulletin trouvé</p>
              <p className="text-sm mt-1">Générez un bulletin à partir des notes d'un élève.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bulletins.map(b => (
                <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-bold text-gray-800">
                          {b.enrollment.user.prenom} {b.enrollment.user.nom}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          {b.enrollment.language.nom}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          {b.gradeLevel.nom}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                          {b.trimestre} — {b.annee}
                        </span>
                        {b.validatedAt ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            ✅ Validé
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                            ⏳ En attente
                          </span>
                        )}
                      </div>

                      {/* Moyennes + rang */}
                      <div className="flex flex-wrap gap-4 my-3 text-sm">
                        {b.moyenneLangue   != null && <div><span className="text-gray-500">📖 Langue : </span><span className="font-bold">{b.moyenneLangue}/20</span></div>}
                        {b.moyenneCulture  != null && <div><span className="text-gray-500">🎭 Culture : </span><span className="font-bold">{b.moyenneCulture}/20</span></div>}
                        {b.moyennePratique != null && <div><span className="text-gray-500">🛠️ Pratique : </span><span className="font-bold">{b.moyennePratique}/20</span></div>}
                        {b.moyenneGenerale != null && (
                          <div className="font-bold text-emerald-700">
                            Moy. générale : {b.moyenneGenerale}/20
                            {b.mention && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{b.mention}</span>}
                          </div>
                        )}
                        {b.rang != null && (
                          <div className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold">
                            🏅 {b.rang}{b.rang === 1 ? 'er' : 'e'} / {b.nombreEleves ?? '?'} élèves
                          </div>
                        )}
                      </div>

                      {b.codeVerification && (
                        <p className="text-xs text-gray-400 font-mono">Code : {b.codeVerification}</p>
                      )}
                      {b.observations && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{b.observations}"</p>
                      )}
                    </div>

                    {/* Actions : validation + aperçu */}
                    <div className="flex flex-col gap-2 min-w-[160px]">
                      {/* Bouton Aperçu / Imprimer — toujours visible */}
                      <a
                        href={notesAPI.bulletinHtmlUrl(b.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-200 transition text-center"
                      >
                        🖨️ Aperçu / Imprimer
                      </a>

                      {/* Bouton de validation */}
                      {!b.validatedAt && (
                        validatingId === b.id ? (
                          <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50 space-y-2">
                            <textarea
                              placeholder="Observations (optionnel)"
                              value={validateForm.observations}
                              onChange={e => setValidateForm({ observations: e.target.value })}
                              rows={3}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleValidateBulletin(b.id)}
                                className="flex-1 py-1.5 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => setValidatingId(null)}
                                className="flex-1 py-1.5 bg-gray-100 text-gray-600 rounded text-xs font-bold"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setValidatingId(b.id); setValidateForm({ observations: '' }); }}
                            className="w-full px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition"
                          >
                            ✅ Valider le bulletin
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── Onglet Certificats (Phase D3) ───── */}
      {tab === 'certificats' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={certFilterLang} onChange={e => setCertFilterLang(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
              <option value="">Toutes les langues</option>
              {languages.map(l => <option key={l.id} value={l.id}>{l.emoji ?? '📚'} {l.nom}</option>)}
            </select>
            <select value={certFilterType} onChange={e => setCertFilterType(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
              <option value="">Tous les types</option>
              {[
                { v: 'ETAPE_CP2',             l: '🌱 Certificat de Première Étape' },
                { v: 'PRIMAIRE',              l: '📚 Fin du Cycle Primaire' },
                { v: 'PREMIER_CYCLE',         l: '🏫 Fin du Premier Cycle Secondaire' },
                { v: 'MAITRISE_LINGUISTIQUE', l: '🎓 Certificat National de Maîtrise Linguistique' },
                { v: 'CHERCHEUR',             l: '🔬 Diplôme Chercheur Linguiste ILA' },
              ].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
            <span className="text-sm text-gray-500">{certs.length} certificat{certs.length !== 1 ? 's' : ''}</span>
          </div>

          {certsLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement…</div>
          ) : certs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🎓</div>
              <p className="font-semibold">Aucun certificat émis</p>
              <p className="text-sm mt-1">Les certificats sont générés automatiquement lors des passages de fin de cycle.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map(c => (
                <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl flex-shrink-0">
                      {{ ETAPE_CP2: '🌱', PRIMAIRE: '📚', PREMIER_CYCLE: '🏫', MAITRISE_LINGUISTIQUE: '🎓', CHERCHEUR: '🔬' }[c.type] ?? '🏅'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">
                        {c.user.prenom} {c.user.nom}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          {c.language.emoji ?? '📚'} {c.language.nom}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          {c.gradeLevel.nom}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {new Date(c.issuedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{c.codeVerification}</div>
                    </div>
                  </div>
                  <a
                    href={cursusCertAPI.htmlUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition whitespace-nowrap"
                  >
                    🖨️ Imprimer
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── Onglet Chercheur (Phase D2) ───── */}
      {tab === 'chercheur' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Objectifs de recherche requis pour progresser au sein du cycle <strong>Chercheur I → II → III</strong>. Le passage est bloqué tant que tous les objectifs ne sont pas atteints.
            </p>
            <button
              onClick={() => { setObjForm({ gradeLevelId: '', type: 'AUDIO_ENREGISTREMENT', quantite: '', description: '' }); setObjModal('create'); }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition whitespace-nowrap"
            >
              + Nouvel objectif
            </button>
          </div>

          {chercheurLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement…</div>
          ) : (() => {
            // Grouper par gradeLevel
            const byGrade = {};
            objectifsChercheur.forEach(o => {
              const k = o.gradeLevel?.nom ?? '?';
              if (!byGrade[k]) byGrade[k] = { grade: o.gradeLevel, items: [] };
              byGrade[k].items.push(o);
            });
            return Object.entries(byGrade).map(([nom, { grade, items }]) => (
              <div key={nom} className="bg-white rounded-xl border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
                  <span className="font-bold text-indigo-800">🔬 {nom}</span>
                  <span className="text-xs text-indigo-500 ml-2">{items.length} objectif(s)</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(obj => {
                    const icons = { AUDIO_ENREGISTREMENT: '🎙️', CONTRIBUTION_LANGUE: '📖', LECON_MAITRISEE: '✅' };
                    return (
                      <div key={obj.id} className={`px-4 py-3 flex items-center gap-3 ${obj.isActive ? '' : 'opacity-50'}`}>
                        <span className="text-2xl">{icons[obj.type] ?? '🎯'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm">{obj.description ?? obj.type}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Objectif : <strong>{obj.quantite}</strong> &nbsp;·&nbsp; {obj.isActive ? 'Actif' : 'Inactif'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setObjForm({ gradeLevelId: obj.gradeLevelId, type: obj.type, quantite: String(obj.quantite), description: obj.description ?? '' }); setObjModal(obj.id); }}
                            className="text-xs text-blue-600 hover:underline"
                          >Modifier</button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Supprimer cet objectif ?')) return;
                              await chercheurAPI.deleteObjectif(obj.id);
                              const { data } = await chercheurAPI.listObjectifs();
                              setObjectifsChercheur(data);
                            }}
                            className="text-xs text-red-500 hover:underline"
                          >Suppr.</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}

          {/* Modal créer / modifier objectif */}
          {objModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-bold">{objModal === 'create' ? '+ Nouvel objectif' : 'Modifier objectif'}</h3>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Niveau Chercheur</label>
                  <select value={objForm.gradeLevelId} onChange={e => setObjForm(p => ({ ...p, gradeLevelId: e.target.value }))}
                    disabled={objModal !== 'create'}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 disabled:bg-gray-50">
                    <option value="">— Choisir un niveau —</option>
                    {grades.filter(g => g.cycle === 'CHERCHEUR').map(g => (
                      <option key={g.id} value={g.id}>{g.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Type d'objectif</label>
                  <select value={objForm.type} onChange={e => setObjForm(p => ({ ...p, type: e.target.value }))}
                    disabled={objModal !== 'create'}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 disabled:bg-gray-50">
                    <option value="AUDIO_ENREGISTREMENT">🎙️ Enregistrements audio validés</option>
                    <option value="CONTRIBUTION_LANGUE">📖 Contributions dictionnaire publiées</option>
                    <option value="LECON_MAITRISEE">✅ Leçons maîtrisées (score ≥ 75 %)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Quantité requise</label>
                  <input type="number" min="1" value={objForm.quantite}
                    onChange={e => setObjForm(p => ({ ...p, quantite: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="ex : 20" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Description</label>
                  <input value={objForm.description} onChange={e => setObjForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Description courte de l'objectif" />
                </div>
                {objModal !== 'create' && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox"
                      checked={objectifsChercheur.find(o => o.id === objModal)?.isActive ?? true}
                      onChange={async () => {
                        const cur = objectifsChercheur.find(o => o.id === objModal);
                        await chercheurAPI.updateObjectif(objModal, { isActive: !cur.isActive });
                        const { data } = await chercheurAPI.listObjectifs();
                        setObjectifsChercheur(data);
                        setObjModal(null);
                      }} />
                    Objectif actif
                  </label>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setObjModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                  <button
                    onClick={async () => {
                      if (!objForm.gradeLevelId || !objForm.quantite) return;
                      if (objModal === 'create') {
                        await chercheurAPI.createObjectif({ gradeLevelId: objForm.gradeLevelId, type: objForm.type, quantite: Number(objForm.quantite), description: objForm.description });
                      } else {
                        await chercheurAPI.updateObjectif(objModal, { quantite: Number(objForm.quantite), description: objForm.description });
                      }
                      const { data } = await chercheurAPI.listObjectifs();
                      setObjectifsChercheur(data);
                      setObjModal(null);
                    }}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                  >Enregistrer</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───── Onglet Filières (Phase D1) ───── */}
      {tab === 'filieres' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Spécialisations choisies par les élèves à partir de la <strong>Seconde</strong> (cycle LYCEE).
            </p>
            <button
              onClick={() => { setFiliereForm({ code: '', nom: '', description: '', emoji: '' }); setFiliereModal('create'); }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
            >
              + Nouvelle filière
            </button>
          </div>

          {filieresLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filieres.map(f => (
                <div key={f.id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-2 ${f.isActive ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{f.emoji ?? '🏢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 truncate">{f.nom}</div>
                      <div className="text-xs font-mono text-gray-400">{f.code}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${f.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {f.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {f.description && <p className="text-xs text-gray-500 line-clamp-2">{f.description}</p>}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">👥 {f._count?.enrollments ?? 0} élève(s)</span>
                    <button
                      onClick={() => { setFiliereForm({ code: f.code, nom: f.nom, description: f.description ?? '', emoji: f.emoji ?? '' }); setFiliereModal(f); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal créer / modifier filière */}
          {filiereModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
                <h3 className="text-lg font-bold">{filiereModal === 'create' ? '+ Nouvelle filière' : `Modifier — ${filiereModal.nom}`}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Code</label>
                    <input value={filiereForm.code} onChange={e => setFiliereForm(p => ({ ...p, code: e.target.value }))}
                      disabled={filiereModal !== 'create'}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono uppercase disabled:bg-gray-50" placeholder="MON_CODE" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Emoji</label>
                    <input value={filiereForm.emoji} onChange={e => setFiliereForm(p => ({ ...p, emoji: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="🌾" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Nom</label>
                  <input value={filiereForm.nom} onChange={e => setFiliereForm(p => ({ ...p, nom: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom de la filière" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Description</label>
                  <textarea value={filiereForm.description} onChange={e => setFiliereForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Description courte…" />
                </div>
                {filiereModal !== 'create' && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={filiereModal.isActive}
                      onChange={async () => {
                        await filieresAPI.update(filiereModal.id, { isActive: !filiereModal.isActive });
                        const { data } = await filieresAPI.admin();
                        setFilieres(data);
                        setFiliereModal(null);
                      }} />
                    Filière active
                  </label>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setFiliereModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                  <button
                    onClick={async () => {
                      if (!filiereForm.nom) return;
                      if (filiereModal === 'create') {
                        await filieresAPI.create({ code: filiereForm.code, nom: filiereForm.nom, description: filiereForm.description, emoji: filiereForm.emoji });
                      } else {
                        await filieresAPI.update(filiereModal.id, { nom: filiereForm.nom, description: filiereForm.description, emoji: filiereForm.emoji });
                      }
                      const { data } = await filieresAPI.admin();
                      setFilieres(data);
                      setFiliereModal(null);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───── Onglet Statistiques ───── */}
      {tab === 'stats' && stats && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Élèves inscrits au cursus" value={stats.totals.totalEleves} icon="🎒" />
            <StatCard label="Tests de positionnement" value={stats.totals.totalPlacements} icon="📝" />
            <StatCard label="Passages de classe" value={stats.totals.totalPassages} icon="🎓" />
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Classe</th>
                  <th className="px-4 py-3 text-left">Langue</th>
                  <th className="px-4 py-3 text-center">Élèves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.stats.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400">Aucun élève inscrit pour le moment.</td></tr>
                )}
                {stats.stats.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.grade?.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{row.language?.nom}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-800">{row.eleves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            📊 Ces statistiques constituent l'argumentaire institutionnel : répartition réelle du niveau
            linguistique des utilisateurs, classe par classe et langue par langue.
          </p>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);
