/**
 * MissionPage.jsx
 * Page Vision Panafricaine — De la Côte d'Ivoire à l'Afrique
 */

import { useNavigate } from 'react-router-dom';
import {
  GlobeAltIcon, MapPinIcon, CheckCircleIcon, ClockIcon,
  ArrowLeftIcon, SparklesIcon, MicrophoneIcon, BookOpenIcon,
  UserGroupIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';

const PHASES = [
  {
    num: 1, label: 'Phase 1 — Actuelle', year: '2024–2026', done: true,
    color: 'bg-orange-500', border: 'border-orange-400',
    desc: 'Côte d\'Ivoire : 9 langues, dictionnaire, leçons, tuteurs IA, contributions vocales certifiées ILA-UFHB.',
    items: ['Dioula', 'Baoulé', 'Bété', 'Agni', 'Sénoufo', 'Attié', 'Guéré', 'Malinké', 'Nouchi'],
  },
  {
    num: 2, label: 'Phase 2 — Extension', year: '2026–2027', done: false,
    color: 'bg-gray-600', border: 'border-gray-500',
    desc: 'Afrique de l\'Ouest francophone : Mali, Burkina Faso, Guinée, Sénégal, Niger, Togo, Bénin.',
    items: ['Bambara (Mali)', 'Mooré (Burkina)', 'Pular (Guinée)', 'Wolof (Sénégal)', 'Haoussa (Niger)', '+ autres'],
  },
  {
    num: 3, label: 'Phase 3 — Panafricain', year: '2027+', done: false,
    color: 'bg-gray-700', border: 'border-gray-600',
    desc: 'Couverture panafricaine : Afrique centrale, orientale et australe. Ambition : 200+ langues africaines préservées.',
    items: ['Lingala (RDC/Congo)', 'Swahili (Afrique Est)', 'Zulu (Afrique Sud)', 'Amharique (Éthiopie)', '+ 200 langues'],
  },
];

const STATS = [
  { icon: BookOpenIcon,   val: '70+',   label: 'Langues ivoiriennes',        color: 'text-orange-500' },
  { icon: GlobeAltIcon,   val: '2000+', label: 'Langues menacées en Afrique', color: 'text-red-500'    },
  { icon: MicrophoneIcon, val: '9',     label: 'Langues actives (MVP)',       color: 'text-green-600'  },
  { icon: UserGroupIcon,  val: '25M+',  label: 'Locuteurs potentiels CI',     color: 'text-blue-600'   },
];

const LANGUES_CI = [
  { nom: 'Dioula',   locuteurs: '~12M',  region: 'Ouest & Nord' },
  { nom: 'Baoulé',   locuteurs: '~5M',   region: 'Centre' },
  { nom: 'Bété',     locuteurs: '~1.5M', region: 'Centre-Ouest' },
  { nom: 'Agni',     locuteurs: '~800K', region: 'Est' },
  { nom: 'Sénoufo',  locuteurs: '~1.5M', region: 'Nord' },
  { nom: 'Attié',    locuteurs: '~400K', region: 'Sud-Est' },
  { nom: 'Guéré',    locuteurs: '~500K', region: 'Ouest' },
  { nom: 'Malinké',  locuteurs: '~800K', region: 'Nord-Ouest' },
  { nom: 'Nouchi',   locuteurs: '~4M',   region: 'Urbain (Abidjan)' },
];

export default function MissionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#060C0A' }}>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 border-b border-white/10"
           style={{ background: '#060C0A' }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>
        <div className="h-4 w-px bg-white/20" />
        <p className="text-xs font-bold tracking-widest uppercase text-orange-400">Vision 2027</p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-14">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logo-afrique.png"
              alt="Langues Ivoire — Vision Afrique"
              className="w-72 lg:w-80 object-contain"
              style={{ filter: 'drop-shadow(0 0 28px rgba(244,121,32,0.45))' }}
            />
          </div>
          {/* Texte hero */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              De la Côte d'Ivoire<br />
              <span className="text-orange-400">à l'Afrique</span>
            </h1>
            <p className="text-gray-300 text-base leading-relaxed mb-6" style={{ maxWidth: 480 }}>
              Préserver les langues ethniques ivoiriennes n'est que le début. Notre ambition est
              de devenir la plateforme de référence pour toutes les langues menacées d'Afrique —
              partant de la lumière de la Côte d'Ivoire pour illuminer tout le continent.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-full">
                ✓ Phase 1 active — Côte d'Ivoire
              </span>
              <span className="px-4 py-2 bg-white/10 text-gray-300 text-sm font-semibold rounded-full border border-white/20">
                Phase 2 — 2026 · Afrique de l'Ouest
              </span>
            </div>
          </div>
        </div>

        {/* ── Phrase tagline ────────────────────────────────────────── */}
        <div className="text-center mb-14 px-4 py-6 rounded-2xl border border-white/10"
             style={{ background: 'rgba(11,61,46,0.4)' }}>
          <p className="text-xl lg:text-2xl font-extrabold text-white italic leading-relaxed">
            "Préserver les langues, bâtir l'avenir"
          </p>
          <p className="text-gray-400 text-sm mt-2">— LANGUES IVOIRE</p>
        </div>

        {/* ── Chiffres clés ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {STATS.map((s, i) => (
            <div key={i} className="rounded-2xl p-5 text-center border border-white/10"
                 style={{ background: '#0F1F18' }}>
              <s.icon className={`w-7 h-7 mx-auto mb-2 ${s.color}`} />
              <p className={`text-3xl font-black mb-1 ${s.color}`}>{s.val}</p>
              <p className="text-gray-400 text-xs leading-snug">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Les 3 phases ─────────────────────────────────────────── */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-orange-400" />
            Feuille de route d'expansion
          </h2>
          <div className="space-y-4">
            {PHASES.map((p) => (
              <div key={p.num}
                   className={`rounded-2xl border p-6 ${p.border}`}
                   style={{ background: p.done ? 'rgba(244,121,32,0.08)' : '#0F1F18' }}>
                <div className="flex items-start gap-4">
                  {/* Indicateur */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${p.color} flex items-center justify-center`}>
                    {p.done
                      ? <CheckCircleIcon className="w-5 h-5 text-white" />
                      : <ClockIcon className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-white font-bold">{p.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{p.year}</span>
                      {p.done && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
                          En cours ✓
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.items.map((item, j) => (
                        <span key={j}
                              className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: 'rgba(255,255,255,0.07)', color: p.done ? '#fdba74' : '#9CA3AF' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Langues ivoiriennes couvertes ────────────────────────── */}
        <div className="mb-14 rounded-2xl border border-white/10 p-6" style={{ background: '#0F1F18' }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-orange-400" />
            Langues ivoiriennes — Phase 1
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LANGUES_CI.map((l, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                   style={{ background: 'rgba(244,121,32,0.06)', border: '1px solid rgba(244,121,32,0.15)' }}>
                <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">{l.nom}</p>
                  <p className="text-gray-500 text-xs">{l.region} · {l.locuteurs} locuteurs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pourquoi ça compte ───────────────────────────────────── */}
        <div className="mb-10 rounded-2xl border border-white/10 p-6" style={{ background: '#0F1F18' }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-orange-400" />
            Pourquoi c'est urgent
          </h2>
          <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            <p>
              🔴 <strong className="text-white">Une langue disparaît toutes les 2 semaines</strong> dans le monde.
              Sur les 2000+ langues africaines, plus de la moitié sont considérées menacées.
            </p>
            <p>
              🟡 En Côte d'Ivoire, <strong className="text-white">70+ langues ethniques</strong> existent — mais
              la plupart ne sont ni écrites, ni enseignées, ni documentées numériquement.
            </p>
            <p>
              🟢 LANGUES IVOIRE construit l'infrastructure technologique pour <strong className="text-white">
              enregistrer, préserver, enseigner et transmettre</strong> ces langues aux nouvelles générations —
              grâce à l'IA, aux contributions communautaires et à la certification scientifique ILA-UFHB.
            </p>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-gray-500 text-xs">
            LANGUES IVOIRE · Document interne · Vision 2024–2030
          </p>
        </div>
      </div>
    </div>
  );
}
