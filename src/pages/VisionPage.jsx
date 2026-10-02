import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon, CheckCircleIcon, ClockIcon, SparklesIcon, MapPinIcon, AcademicCapIcon,
  GlobeAltIcon, BookOpenIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';

/**
 * Page publique « De la Côte d'Ivoire à l'Afrique » (languesivoire.ci/vision).
 * Dérivée de la page interne /mission, sans mention « document interne » ni détail du fonctionnement du CMS.
 */
const PHASES = [
  {
    num: 1, label: 'Phase 1 — Actuelle', year: '2024–2026', done: true,
    desc: 'Côte d’Ivoire : 9 langues, dictionnaire, leçons, tuteurs virtuels et contenus culturels, dans une application mobile.',
    items: ['Baoulé', 'Dioula', 'Bété', 'Sénoufo', 'Agni', 'Gouro', 'Guéré', 'Nouchi', 'Yacouba'],
  },
  {
    num: 2, label: 'Phase 2 — Extension', year: '2026–2027', done: false,
    desc: 'Afrique de l’Ouest francophone : Mali, Burkina Faso, Guinée, Sénégal, Niger, Togo, Bénin.',
    items: ['Bambara (Mali)', 'Mooré (Burkina)', 'Pular (Guinée)', 'Wolof (Sénégal)', 'Haoussa (Niger)', '+ autres'],
  },
  {
    num: 3, label: 'Phase 3 — Panafricain', year: '2027+', done: false,
    desc: 'Couverture panafricaine : Afrique centrale, orientale et australe. Ambition : préserver des centaines de langues africaines.',
    items: ['Lingala (RDC/Congo)', 'Swahili (Afrique de l’Est)', 'Zulu (Afrique du Sud)', 'Amharique (Éthiopie)', '+ d’autres langues'],
  },
];

const STATS = [
  { Icon: BookOpenIcon, val: '9', label: 'langues actives aujourd’hui' },
  { Icon: MapPinIcon, val: '60+', label: 'langues parlées en Côte d’Ivoire' },
  { Icon: GlobeAltIcon, val: '2 000+', label: 'langues en Afrique' },
];

const LANGUES = [
  ['Baoulé', 'Centre'], ['Dioula', 'Nord et national'], ['Bété', 'Ouest'],
  ['Sénoufo', 'Nord (Korhogo)'], ['Agni', 'Est'], ['Gouro', 'Centre-Ouest'],
  ['Guéré', 'Ouest'], ['Nouchi', 'Abidjan et national'], ['Yacouba', 'Ouest (Man, Danané, Biankouma)'],
];

export default function VisionPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'De la Côte d’Ivoire à l’Afrique — LANGUES IVOIRE';
    window.scrollTo(0, 0);
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: '#060C0A', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 px-5 py-4 backdrop-blur" style={{ background: 'rgba(6,12,10,.92)' }}>
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white">
          <ArrowLeftIcon className="h-4 w-4" /> Retour au site
        </Link>
        <span className="h-4 w-px bg-white/20" />
        <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Vision 2027</p>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        {/* Héros */}
        <div className="mb-14 flex flex-col items-center gap-8 lg:flex-row">
          <img src="/landing/afrique.webp" alt="Carte de l’Afrique avec le logo LANGUES IVOIRE"
            className="w-64 shrink-0 rounded-2xl object-contain lg:w-72" style={{ filter: 'drop-shadow(0 0 28px rgba(244,121,32,0.45))' }} />
          <div>
            <h1 className="mb-4 text-3xl font-extrabold leading-tight lg:text-5xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              De la Côte d’Ivoire<br /><span className="text-orange-400">à l’Afrique</span>
            </h1>
            <p className="mb-6 max-w-lg text-base leading-relaxed text-gray-300">
              Préserver les langues ethniques ivoiriennes n’est que le début. Notre ambition est de devenir la plateforme de
              référence pour toutes les langues menacées d’Afrique, en partant de la lumière de la Côte d’Ivoire pour
              éclairer tout le continent.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-orange-500 px-4 py-2 font-bold text-white">✓ Phase 1 active — Côte d’Ivoire</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold text-gray-300">Phase 2 — 2026 · Afrique de l’Ouest</span>
            </div>
          </div>
        </div>

        {/* Devise */}
        <div className="mb-14 rounded-2xl border border-white/10 px-4 py-6 text-center" style={{ background: 'rgba(11,61,46,0.4)' }}>
          <p className="text-xl font-extrabold italic leading-relaxed lg:text-2xl">« Préserver les langues, bâtir l’avenir »</p>
          <p className="mt-2 text-sm text-gray-400">— LANGUES IVOIRE</p>
        </div>

        {/* Chiffres */}
        <div className="mb-14 grid gap-4 sm:grid-cols-3">
          {STATS.map(({ Icon, val, label }) => (
            <div key={label} className="rounded-2xl border border-white/10 p-5 text-center" style={{ background: '#0F1F18' }}>
              <Icon className="mx-auto mb-2 h-7 w-7 text-orange-400" />
              <p className="mb-1 text-3xl font-extrabold text-orange-400">{val}</p>
              <p className="text-xs leading-snug text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Feuille de route */}
        <section className="mb-14">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold"><SparklesIcon className="h-5 w-5 text-orange-400" /> Feuille de route d’expansion</h2>
          <div className="space-y-4">
            {PHASES.map((p) => (
              <div key={p.num} className={`rounded-2xl border p-6 ${p.done ? 'border-orange-400' : 'border-gray-600'}`}
                style={{ background: p.done ? 'rgba(244,121,32,0.08)' : '#0F1F18' }}>
                <div className="flex items-start gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${p.done ? 'bg-orange-500' : 'bg-gray-600'}`}>
                    {p.done ? <CheckCircleIcon className="h-5 w-5" /> : <ClockIcon className="h-5 w-5" />}
                  </span>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="font-bold">{p.label}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">{p.year}</span>
                      {p.done && <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-400">En cours ✓</span>}
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-300">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.items.map((it) => (
                        <span key={it} className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ background: 'rgba(255,255,255,0.07)', color: p.done ? '#fdba74' : '#9CA3AF' }}>{it}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Langues de la phase 1 */}
        <section className="mb-14 rounded-2xl border border-white/10 p-6" style={{ background: '#0F1F18' }}>
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><MapPinIcon className="h-5 w-5 text-orange-400" /> Langues ivoiriennes — Phase 1</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUES.map(([nom, region]) => (
              <div key={nom} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(244,121,32,0.06)', border: '1px solid rgba(244,121,32,0.15)' }}>
                <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                <div><p className="text-sm font-semibold">{nom}</p><p className="text-xs text-gray-500">{region}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* Pourquoi */}
        <section className="mb-10 rounded-2xl border border-white/10 p-6" style={{ background: '#0F1F18' }}>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><AcademicCapIcon className="h-5 w-5 text-orange-400" /> Pourquoi c’est urgent</h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-300">
            <p>🔴 <strong className="text-white">Les langues disparaissent</strong> : selon plusieurs estimations, une langue s’éteint environ toutes les deux semaines dans le monde, et l’Afrique, avec plus de 2 000 langues, est en première ligne.</p>
            <p>🟡 En Côte d’Ivoire, <strong className="text-white">plus de 60 langues</strong> sont parlées, mais beaucoup ne sont ni écrites, ni enseignées, ni documentées numériquement.</p>
            <p>🟢 LANGUES IVOIRE construit l’outil numérique pour <strong className="text-white">enregistrer, préserver, enseigner et transmettre</strong> ces langues aux nouvelles générations, avec les communautés et des experts.</p>
          </div>
        </section>

        <div className="border-t border-white/10 pt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour à la présentation
          </Link>
          <p className="mt-5 text-xs text-gray-500">© 2026 LANGUES IVOIRE · languesivoire.ci · Idée et mise en œuvre : Ouattara Nogolourgo Jonas</p>
          <Link to="/login" className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400"><LockClosedIcon className="h-3.5 w-3.5" /> Espace équipe</Link>
        </div>
      </main>
    </div>
  );
}
