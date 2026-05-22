/**
 * UserGuidePage.jsx — Guide de formation complet du CMS Langues Ivoire
 * Utilise GUIDE_DATA.js comme source unique de vérité.
 */

import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon,
  LightBulbIcon, ExclamationTriangleIcon, CheckCircleIcon,
  PlayCircleIcon, BookOpenIcon, AcademicCapIcon, UserGroupIcon,
  ArrowRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { GUIDE_SECTIONS, GUIDE_MODULES } from '../data/GUIDE_DATA';

// ─── Config couleurs ───────────────────────────────────────────────────────────
const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800', tab: 'bg-indigo-600 text-white', tabInactive: 'text-indigo-600 hover:bg-indigo-50' },
  purple: { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', tab: 'bg-purple-600 text-white', tabInactive: 'text-purple-600 hover:bg-purple-50' },
  red:    { bg: 'bg-red-600',    light: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    badge: 'bg-red-100 text-red-800',    tab: 'bg-red-600 text-white',    tabInactive: 'text-red-600 hover:bg-red-50' },
  orange: { bg: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', tab: 'bg-orange-600 text-white', tabInactive: 'text-orange-600 hover:bg-orange-50' },
  amber:  { bg: 'bg-amber-600',  light: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800',  tab: 'bg-amber-600 text-white',  tabInactive: 'text-amber-600 hover:bg-amber-50' },
  cyan:   { bg: 'bg-cyan-600',   light: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-800',   tab: 'bg-cyan-600 text-white',   tabInactive: 'text-cyan-600 hover:bg-cyan-50' },
  green:    { bg: 'bg-green-600',    light: 'bg-green-50',    text: 'text-green-700',    border: 'border-green-200',    badge: 'bg-green-100 text-green-800',    tab: 'bg-green-600 text-white',    tabInactive: 'text-green-600 hover:bg-green-50' },
  teal:     { bg: 'bg-teal-600',     light: 'bg-teal-50',     text: 'text-teal-700',     border: 'border-teal-200',     badge: 'bg-teal-100 text-teal-800',     tab: 'bg-teal-600 text-white',     tabInactive: 'text-teal-600 hover:bg-teal-50' },
  emerald:  { bg: 'bg-emerald-600',  light: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200',  badge: 'bg-emerald-100 text-emerald-800',  tab: 'bg-emerald-600 text-white',  tabInactive: 'text-emerald-600 hover:bg-emerald-50' },
  slate:    { bg: 'bg-slate-600',    light: 'bg-slate-50',    text: 'text-slate-700',    border: 'border-slate-200',    badge: 'bg-slate-100 text-slate-800',    tab: 'bg-slate-600 text-white',    tabInactive: 'text-slate-600 hover:bg-slate-50' },
  gray:     { bg: 'bg-gray-600',     light: 'bg-gray-50',     text: 'text-gray-700',     border: 'border-gray-200',     badge: 'bg-gray-100 text-gray-800',     tab: 'bg-gray-600 text-white',     tabInactive: 'text-gray-600 hover:bg-gray-50' },
};

// ─── Parcours de formation par rôle ───────────────────────────────────────────
const ROLE_PATHS = {
  CONTRIBUTOR: {
    label: 'Contributeur',
    color: 'blue',
    icon: '✍️',
    desc: 'Vous contribuez en soumettant du contenu linguistique pour relecture par les éditeurs.',
    modules: ['dashboard', 'dictionnaire', 'vocabulaire', 'contributions', 'voix-audio'],
    priority: ['contributions', 'dictionnaire', 'voix-audio'],
  },
  EDITOR: {
    label: 'Éditeur',
    color: 'purple',
    icon: '📝',
    desc: 'Vous créez, modifiez et publiez le contenu sur tous les modules. Vous validez les contributions.',
    modules: ['dashboard', 'dictionnaire', 'conjugaison', 'vocabulaire', 'lecons', 'cultural', 'textes-recits', 'image-galleries', 'sens-mots', 'videos', 'contributions', 'messages', 'certificats', 'ia-linguistique', 'voix-audio', 'tuteurs', 'test-agents', 'bienvenue-sons', 'langues', 'carte-ci', 'badges', 'phrases-sos', 'phrases-utiles', 'notifications', 'premiers-secours', 'civisme', 'musee-tresors', 'alphabet', 'arbre-vocabulaire', 'marche-dialogues', 'mathematique', 'monnaie', 'institutions'],
    priority: ['dashboard', 'contributions', 'dictionnaire', 'voix-audio', 'messages'],
  },
  ADMIN: {
    label: 'Administrateur',
    color: 'red',
    icon: '⚙️',
    desc: 'Vous gérez la plateforme dans son ensemble, les utilisateurs, les finances et tous les contenus.',
    modules: 'all',
    priority: ['dashboard', 'users', 'finance', 'contributions', 'messages', 'certificats'],
  },
  SUPER_ADMIN: {
    label: 'Super-Administrateur',
    color: 'amber',
    icon: '👑',
    desc: 'Accès complet à toutes les fonctionnalités du CMS, y compris la configuration système.',
    modules: 'all',
    priority: ['dashboard', 'users', 'finance', 'contributions', 'messages'],
  },
};

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Collapsible({ title, children, defaultOpen = false, accent = 'text-gray-700' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className={`text-sm font-semibold ${accent}`}>{title}</span>
        {open ? <ChevronUpIcon className="w-4 h-4 text-gray-400" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

// Carte résumée d'un module (liste)
function ModuleCard({ module, isSelected, onClick }) {
  const colors = COLOR_MAP[module.color] || COLOR_MAP.slate;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
        isSelected
          ? `${colors.light} ${colors.border} border-2 shadow-sm`
          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{module.icon}</span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${isSelected ? colors.text : 'text-gray-800'} leading-tight`}>
            {module.title}
          </p>
          {module.subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{module.subtitle}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// Fiche complète d'un module (panneau droit)
function ModuleDetail({ module }) {
  const navigate = useNavigate();
  const colors = COLOR_MAP[module.color] || COLOR_MAP.slate;

  return (
    <div className="h-full overflow-y-auto">
      {/* En-tête */}
      <div className={`${colors.bg} px-6 py-5`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{module.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{module.title}</h2>
                {module.subtitle && <p className="text-white/70 text-sm">{module.subtitle}</p>}
              </div>
            </div>
            {module.roles && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {module.roles.map(r => (
                  <span key={r} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                    {r === 'SUPER_ADMIN' ? '👑 Super-Admin' : r === 'ADMIN' ? '⚙️ Admin' : r === 'EDITOR' ? '📝 Éditeur' : '✍️ Contributeur'}
                  </span>
                ))}
              </div>
            )}
          </div>
          {module.route && module.route !== '/guide' && (
            <button
              onClick={() => navigate(module.route)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Ouvrir <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Corps */}
      <div className="px-6 py-5 space-y-4">
        {/* Description */}
        <div className={`${colors.light} border ${colors.border} rounded-xl p-4`}>
          <p className="text-sm text-gray-700 leading-relaxed">{module.description}</p>
        </div>

        {/* Objectifs */}
        {module.objectifs && module.objectifs.length > 0 && (
          <Collapsible title="🎯 Objectifs de formation" defaultOpen accent={colors.text}>
            <ul className="space-y-2">
              {module.objectifs.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.text}`} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Fonctionnalités */}
        {module.features && module.features.length > 0 && (
          <Collapsible title="⚙️ Fonctionnalités disponibles" defaultOpen={false}>
            <ul className="space-y-1.5">
              {module.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Étapes */}
        {module.steps && module.steps.length > 0 && (
          <Collapsible title="📋 Guide étape par étape" defaultOpen accent={colors.text}>
            <ol className="space-y-4">
              {module.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full ${colors.bg} text-white text-sm font-bold flex items-center justify-center`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{step.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                    {step.warning && (
                      <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Collapsible>
        )}

        {/* Workflows */}
        {module.workflows && module.workflows.length > 0 && (
          <Collapsible title="🔄 Workflows pratiques" defaultOpen={false}>
            <div className="space-y-5">
              {module.workflows.map((wf, wi) => (
                <div key={wi}>
                  <div className="flex items-center gap-2 mb-3">
                    <PlayCircleIcon className={`w-5 h-5 ${colors.text}`} />
                    <p className="text-sm font-bold text-gray-800">{wf.title}</p>
                  </div>
                  <ol className="space-y-2 ml-2">
                    {wf.steps.map((s, si) => (
                      <li key={si} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full ${colors.bg} text-white text-xs font-bold flex items-center justify-center`}>{si + 1}</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        {/* Convention audio */}
        {module.audioNaming && (
          <Collapsible title="🎙️ Convention de nommage des fichiers audio" defaultOpen accent="text-purple-700">
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-xl px-5 py-3">
                <code className="text-green-400 text-sm font-mono">{module.audioNaming.pattern}</code>
              </div>
              {module.audioNaming.codes && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Codes de langues</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {module.audioNaming.codes.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <code className="text-xs font-mono font-bold text-purple-700">{c.code}</code>
                        <span className="text-xs text-gray-600">→ {c.lang}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {module.audioNaming.examples && module.audioNaming.examples.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Exemples</p>
                  <div className="space-y-1.5">
                    {module.audioNaming.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-3 py-2">
                        <code className="text-xs font-mono text-gray-800 font-semibold whitespace-nowrap">{ex.file}</code>
                        <span className="text-xs text-gray-500">{ex.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {module.audioNaming.specs && module.audioNaming.specs.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Spécifications techniques</p>
                  <ul className="space-y-1">
                    {module.audioNaming.specs.map((s, i) => (
                      <li key={i} className="text-xs text-blue-700 flex items-center gap-1.5">
                        <span>✓</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Collapsible>
        )}

        {/* Avertissements */}
        {module.warnings && module.warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">Points d'attention importants</p>
            </div>
            <ul className="space-y-1.5">
              {module.warnings.map((w, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conseil */}
        {module.tip && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
            <div className="flex items-start gap-3">
              <LightBulbIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">💡 Conseil de l'équipe</p>
                <p className="text-sm text-amber-900 leading-relaxed">{module.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Aide contextuelle reminder */}
        {module.id !== 'guide' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">❓</span>
            <p className="text-xs text-gray-600">
              <strong className="text-gray-800">Aide rapide :</strong> Lorsque vous êtes sur la page de ce module, cliquez sur le bouton flottant{' '}
              <span className="inline-flex items-center gap-1 bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Aide</span>{' '}
              en bas à droite pour accéder directement à ce tutoriel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Parcours de formation ────────────────────────────────────────────────────
function TrainingPath({ userRole }) {
  const path = ROLE_PATHS[userRole];
  if (!path) return null;

  const priorityModules = GUIDE_MODULES.filter(m => path.priority.includes(m.id));
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const done = Object.values(checked).filter(Boolean).length;

  const colorClasses = {
    blue:   { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
    purple: { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
    red:    { bg: 'bg-red-600', light: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    amber:  { bg: 'bg-amber-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  };
  const c = colorClasses[path.color] || colorClasses.blue;

  return (
    <div className={`${c.light} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{path.icon}</span>
            <h3 className="text-base font-bold text-gray-800">Parcours {path.label}</h3>
          </div>
          <p className="text-xs text-gray-600 max-w-lg">{path.desc}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={`text-2xl font-bold ${c.text}`}>{done}/{priorityModules.length}</div>
          <div className="text-xs text-gray-500">modules vus</div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-white rounded-full h-2 mb-4">
        <div
          className={`${c.bg} h-2 rounded-full transition-all`}
          style={{ width: `${priorityModules.length ? (done / priorityModules.length) * 100 : 0}%` }}
        />
      </div>

      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Modules prioritaires pour vous :</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {priorityModules.map(m => (
          <label key={m.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 cursor-pointer hover:shadow-sm transition-shadow border border-gray-100">
            <input
              type="checkbox"
              checked={!!checked[m.id]}
              onChange={() => toggle(m.id)}
              className="w-4 h-4 rounded accent-current"
            />
            <span className="text-lg">{m.icon}</span>
            <div>
              <p className={`text-sm font-medium ${checked[m.id] ? 'line-through text-gray-400' : 'text-gray-800'}`}>{m.title}</p>
              {m.subtitle && <p className="text-xs text-gray-400">{m.subtitle}</p>}
            </div>
          </label>
        ))}
      </div>

      {done === priorityModules.length && priorityModules.length > 0 && (
        <div className={`mt-4 flex items-center gap-2 ${c.light} border ${c.border} rounded-xl px-4 py-3`}>
          <CheckCircleIcon className={`w-5 h-5 ${c.text}`} />
          <p className={`text-sm font-semibold ${c.text}`}>
            🎉 Félicitations ! Vous avez parcouru tous les modules prioritaires pour votre rôle.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function UserGuidePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'parcours'
  const searchRef = useRef(null);

  // Filtrer les modules
  const filteredModules = useMemo(() => {
    let list = GUIDE_MODULES;
    if (activeSection !== 'all') {
      list = list.filter(m => m.section === activeSection);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.features?.some(f => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, activeSection]);

  // Grouper par section pour affichage
  const grouped = useMemo(() => {
    if (activeSection !== 'all') return null; // pas besoin de grouper
    const map = {};
    GUIDE_SECTIONS.forEach(s => { map[s.id] = []; });
    filteredModules.forEach(m => {
      if (map[m.section]) map[m.section].push(m);
      else map['dashboard'] = [...(map['dashboard'] || []), m];
    });
    return map;
  }, [filteredModules, activeSection]);

  const currentModule = selectedModule ? GUIDE_MODULES.find(m => m.id === selectedModule) : null;

  const sectionColorDot = {
    dashboard: 'bg-slate-500',
    contenu: 'bg-indigo-500',
    sos: 'bg-red-500',
    medias: 'bg-purple-500',
    communaute: 'bg-orange-500',
    ia: 'bg-cyan-500',
    app: 'bg-green-500',
    finance: 'bg-amber-500',
    admin: 'bg-gray-500',
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50">
      {/* ─── En-tête ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-6 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpenIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Guide de Formation CMS</h1>
                  <p className="text-white/70 text-sm">Langues Ivoire — Back-Office</p>
                </div>
              </div>
              <p className="text-white/80 text-sm max-w-xl">
                Formation complète à tous les modules du CMS. {GUIDE_MODULES.length} modules documentés, étapes détaillées, workflows pratiques et conseils d'experts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold text-white">{GUIDE_MODULES.length}</div>
                <div className="text-xs text-white/60">modules</div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
                <div className="text-2xl font-bold text-white">{GUIDE_SECTIONS.length}</div>
                <div className="text-xs text-white/60">sections</div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'guide' ? 'bg-white text-primary-700' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            >
              <BookOpenIcon className="w-4 h-4" />
              Guide complet
            </button>
            <button
              onClick={() => setActiveTab('parcours')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'parcours' ? 'bg-white text-primary-700' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            >
              <AcademicCapIcon className="w-4 h-4" />
              Mon parcours
            </button>
          </div>
        </div>
      </div>

      {/* ─── Contenu selon onglet ──────────────────────────────────────── */}
      {activeTab === 'parcours' ? (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <UserGroupIcon className="w-5 h-5 text-primary-600" />
                <h2 className="text-base font-bold text-gray-800">Formation par rôle</h2>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Chaque rôle a ses responsabilités et ses modules prioritaires. Cochez les modules au fur et à mesure de votre formation.
              </p>

              {user && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                    <p className="text-sm font-semibold text-gray-800">
                      Votre parcours ({user.prenom} — {ROLE_PATHS[user.role]?.label || user.role})
                    </p>
                  </div>
                  <TrainingPath userRole={user.role} />
                </div>
              )}

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Tous les parcours</p>
                <div className="space-y-4">
                  {Object.entries(ROLE_PATHS)
                    .filter(([role]) => role !== user?.role)
                    .map(([role, path]) => (
                      <details key={role} className="border border-gray-100 rounded-xl overflow-hidden">
                        <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-700">
                          <span className="text-lg">{path.icon}</span>
                          <span>Parcours {path.label}</span>
                          <span className="ml-auto text-xs text-gray-400">
                            {path.modules === 'all' ? `${GUIDE_MODULES.length} modules` : `${path.priority.length} modules prioritaires`}
                          </span>
                        </summary>
                        <div className="px-4 pb-4 pt-2">
                          <p className="text-xs text-gray-600 mb-3">{path.desc}</p>
                          <TrainingPath userRole={role} />
                        </div>
                      </details>
                    ))}
                </div>
              </div>
            </div>

            {/* Bonnes pratiques générales */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">Bonnes pratiques générales</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Consultez le tableau de bord chaque matin pour surveiller l\'activité.',
                  'Utilisez le bouton "Aide" (?) flottant sur chaque page pour accéder au tutoriel du module.',
                  'Toujours vérifier la qualité audio avant de publier un enregistrement.',
                  'Ne supprimez jamais un contenu sans l\'avoir archivé ou signalé à un supérieur.',
                  'Respectez la convention de nommage des fichiers audio pour faciliter l\'import en masse.',
                  'En cas de doute sur un contenu linguistique, consultez d\'abord le tuteur natif de la langue.',
                ].map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
                    <CheckCircleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Guide complet (layout 2 colonnes) ─────────────────────── */
        <div className="flex-1 flex overflow-hidden">
          {/* Colonne gauche : filtres + liste */}
          <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
            {/* Recherche */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un module…"
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtres section */}
            <div className="p-2 border-b border-gray-100 flex flex-wrap gap-1">
              <button
                onClick={() => { setActiveSection('all'); setSelectedModule(null); }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${activeSection === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Tous ({GUIDE_MODULES.length})
              </button>
              {GUIDE_SECTIONS.map(s => {
                const count = GUIDE_MODULES.filter(m => m.section === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSection(s.id); setSelectedModule(null); }}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${activeSection === s.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {s.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Liste de modules */}
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {search && filteredModules.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">Aucun module trouvé pour "{search}"</div>
              )}

              {activeSection !== 'all' ? (
                /* Mode section unique */
                <div className="space-y-1">
                  {filteredModules.map(m => (
                    <ModuleCard key={m.id} module={m} isSelected={selectedModule === m.id} onClick={() => setSelectedModule(m.id)} />
                  ))}
                </div>
              ) : (
                /* Mode tous : grouper par section */
                GUIDE_SECTIONS.map(sec => {
                  const mods = (grouped?.[sec.id] || []).filter(m =>
                    !search || filteredModules.find(fm => fm.id === m.id)
                  );
                  if (mods.length === 0) return null;
                  return (
                    <div key={sec.id}>
                      <div className="flex items-center gap-2 px-2 mb-1.5">
                        <div className={`w-2 h-2 rounded-full ${sectionColorDot[sec.id] || 'bg-gray-400'}`} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{sec.label}</p>
                      </div>
                      <div className="space-y-1">
                        {mods.map(m => (
                          <ModuleCard key={m.id} module={m} isSelected={selectedModule === m.id} onClick={() => setSelectedModule(m.id)} />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Colonne droite : détail du module */}
          <div className="flex-1 overflow-hidden bg-white">
            {currentModule ? (
              <ModuleDetail module={currentModule} />
            ) : (
              /* État vide : sélectionner un module */
              <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <BookOpenIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-2">Sélectionnez un module</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  Choisissez un module dans la liste à gauche pour afficher son guide de formation complet : objectifs, étapes, workflows et conseils.
                </p>
                {GUIDE_MODULES.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {GUIDE_MODULES.slice(0, 5).map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModule(m.id)}
                        className="flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 transition-colors"
                      >
                        <span>{m.icon}</span>
                        <span>{m.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
