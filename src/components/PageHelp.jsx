/**
 * PageHelp.jsx
 * Bouton d'aide contextuel flottant — affiché sur chaque page de module.
 * Lit la fiche de formation depuis GUIDE_DATA.js (par pageId).
 *
 * Usage :
 *   import PageHelp from '../components/PageHelp';
 *   // En bas de votre JSX :
 *   <PageHelp pageId="dictionnaire" />
 */

import { useState, useEffect } from 'react';
import {
  QuestionMarkCircleIcon, XMarkIcon, ChevronDownIcon,
  ChevronUpIcon, LightBulbIcon, ExclamationTriangleIcon,
  CheckCircleIcon, PlayCircleIcon,
} from '@heroicons/react/24/outline';
import { GUIDE_MODULES } from '../data/GUIDE_DATA';

// ─── Couleurs de section ──────────────────────────────────────────────────────
const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-600',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  badge: 'bg-indigo-100 text-indigo-800' },
  purple:  { bg: 'bg-purple-600',  light: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-800' },
  red:     { bg: 'bg-red-600',     light: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     badge: 'bg-red-100 text-red-800' },
  orange:  { bg: 'bg-orange-600',  light: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  badge: 'bg-orange-100 text-orange-800' },
  amber:   { bg: 'bg-amber-600',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-800' },
  cyan:    { bg: 'bg-cyan-600',    light: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    badge: 'bg-cyan-100 text-cyan-800' },
  green:   { bg: 'bg-green-600',   light: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   badge: 'bg-green-100 text-green-800' },
  slate:   { bg: 'bg-slate-600',   light: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   badge: 'bg-slate-100 text-slate-800' },
  gray:    { bg: 'bg-gray-600',    light: 'bg-gray-50',    text: 'text-gray-700',    border: 'border-gray-200',    badge: 'bg-gray-100 text-gray-800' },
};

// ─── Sous-composants internes ─────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className={`text-sm font-semibold ${accent || 'text-gray-700'}`}>{title}</span>
        {open
          ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function StepBadge({ n }) {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  );
}

// ─── Panneau principal ────────────────────────────────────────────────────────

function HelpPanel({ module, colors, onClose }) {
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-50 flex flex-col bg-white shadow-2xl border-l border-gray-200 animate-slide-in-right">
      {/* En-tête */}
      <div className={`${colors.bg} px-5 py-4 flex items-start justify-between flex-shrink-0`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{module.icon}</span>
            <div>
              <p className="font-bold text-white text-base leading-tight">{module.title}</p>
              {module.subtitle && (
                <p className="text-white/70 text-xs">{module.subtitle}</p>
              )}
            </div>
          </div>
          <p className="text-white/80 text-xs mt-1">📘 Guide de formation</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors flex-shrink-0"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Rôles autorisés */}
      {module.roles && module.roles.length > 0 && (
        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 flex-wrap flex-shrink-0">
          <span className="text-xs text-gray-500 font-medium">Accès :</span>
          {module.roles.map(r => (
            <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
              {r === 'EDITOR' ? 'Éditeur' : r === 'ADMIN' ? 'Admin' : r === 'SUPER_ADMIN' ? 'Super-Admin' : r === 'CONTRIBUTOR' ? 'Contributeur' : r}
            </span>
          ))}
        </div>
      )}

      {/* Corps scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0">

        {/* Description */}
        <div className={`${colors.light} border ${colors.border} rounded-xl p-4 mb-3`}>
          <p className="text-sm text-gray-700 leading-relaxed">{module.description}</p>
        </div>

        {/* Objectifs */}
        {module.objectifs && module.objectifs.length > 0 && (
          <Section title="🎯 Objectifs" defaultOpen={true} accent={colors.text}>
            <ul className="space-y-1.5">
              {module.objectifs.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.text}`} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Fonctionnalités */}
        {module.features && module.features.length > 0 && (
          <Section title="⚙️ Fonctionnalités disponibles" defaultOpen={false} accent="text-gray-700">
            <ul className="space-y-1.5">
              {module.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Étapes */}
        {module.steps && module.steps.length > 0 && (
          <Section title="📋 Étapes de travail" defaultOpen={true} accent={colors.text}>
            <ol className="space-y-3">
              {module.steps.map((step, i) => (
                <li key={i}>
                  <div className="flex items-start gap-3">
                    <StepBadge n={i + 1} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{step.desc}</p>
                      {step.warning && (
                        <div className="mt-1.5 flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">{step.warning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Workflows */}
        {module.workflows && module.workflows.length > 0 && (
          <Section title="🔄 Workflows recommandés" defaultOpen={false} accent="text-gray-700">
            <div className="space-y-4">
              {module.workflows.map((wf, wi) => (
                <div key={wi}>
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircleIcon className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-semibold text-gray-800">{wf.title}</p>
                  </div>
                  <ol className="space-y-1 ml-6">
                    {wf.steps.map((s, si) => (
                      <li key={si} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${colors.bg}`}>{si + 1}</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Convention de nommage audio */}
        {module.audioNaming && (
          <Section title="🎙️ Convention nommage audio" defaultOpen={true} accent="text-purple-700">
            <div className="bg-gray-900 rounded-lg px-4 py-3 mb-3">
              <code className="text-green-400 text-xs font-mono">{module.audioNaming.pattern}</code>
            </div>
            {module.audioNaming.examples && module.audioNaming.examples.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Exemples :</p>
                {module.audioNaming.examples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <code className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-mono">{ex.file}</code>
                    <span className="text-xs text-gray-500">{ex.meaning}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Avertissements */}
        {module.warnings && module.warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-800">Points d'attention</p>
            </div>
            <ul className="space-y-1">
              {module.warnings.map((w, i) => (
                <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conseil */}
        {module.tip && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-start gap-2">
              <LightBulbIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-0.5">Conseil pro</p>
                <p className="text-xs text-amber-900 leading-relaxed">{module.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lien vers le guide complet */}
        <div className="text-center pb-4">
          <a
            href="/guide"
            className={`inline-flex items-center gap-2 text-xs ${colors.text} hover:underline font-medium`}
          >
            📘 Voir le Guide complet d'utilisation →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Composant exporté ────────────────────────────────────────────────────────

export default function PageHelp({ pageId }) {
  const [open, setOpen] = useState(false);

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const module = GUIDE_MODULES.find(m => m.id === pageId);
  if (!module) return null;

  const colors = COLOR_MAP[module.color] || COLOR_MAP.slate;

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        title="Aide & Formation"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 ${colors.bg} text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:opacity-90 transition-all text-sm font-semibold`}
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
        <span className="hidden sm:inline">Aide</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panneau d'aide */}
      {open && (
        <HelpPanel module={module} colors={colors} onClose={() => setOpen(false)} />
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
