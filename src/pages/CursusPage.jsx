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
import { curriculumAPI, lessonsAPI, languagesAPI } from '../services/api';
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

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement du cursus…</div>;

  const TABS = [
    { id: 'classes', label: '🏫 Classes' },
    { id: 'modules', label: '🔒 Modules' },
    { id: 'lessons', label: '📚 Leçons' },
    ...(isAdmin ? [{ id: 'stats', label: '📊 Statistiques' }] : []),
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
          <div className="flex items-center gap-3 mb-4">
            <BookOpenIcon className="w-5 h-5 text-gray-500" />
            <select
              value={lessonLangFilter}
              onChange={e => setLessonLangFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Toutes les langues</option>
              {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
            <span className="text-xs text-gray-400">
              Seules les leçons rattachées à une classe comptent pour le passage de classe.
            </span>
          </div>
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Leçon</th>
                  <th className="px-4 py-3 text-left">Langue</th>
                  <th className="px-4 py-3 text-left">Classe</th>
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
                        onChange={e => assignLesson(l, { gradeLevelId: e.target.value || null, pilier: l.pilier, isObligatoire: l.isObligatoire ?? true })}
                        className="border rounded-lg px-2 py-1 text-xs"
                      >
                        <option value="">Hors cursus</option>
                        {grades.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={l.pilier ?? ''}
                        disabled={!isAdmin || !l.gradeLevelId}
                        onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: e.target.value || null, isObligatoire: l.isObligatoire ?? true })}
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
                        onChange={e => assignLesson(l, { gradeLevelId: l.gradeLevelId, pilier: l.pilier, isObligatoire: e.target.checked })}
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
