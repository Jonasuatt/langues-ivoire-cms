import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, contributionsAPI, supportAPI, certificatesAPI, tutorsAPI, repetitorAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon, BookOpenIcon, ClockIcon, ArrowTrendingUpIcon,
  EnvelopeIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';


const NIVEAU_LABELS = { A1: 'Débutant', A2: 'Élémentaire', B1: 'Intermédiaire', B2: 'Inter. avancé', C1: 'Avancé' };
const NIVEAU_COLORS = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-cyan-100 text-cyan-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-orange-100 text-orange-700',
};

// ─── Sections de modules ──────────────────────────────────────────────────────
const MODULE_SECTIONS = [
  {
    label: 'Contenu linguistique',
    color: 'text-indigo-700',
    dot: 'bg-indigo-500',
    items: [
      { emoji: '📖', label: 'Dictionnaire',      color: 'bg-sky-600',     key: 'dictionary',    unit: 'entrées',   to: '/dictionary' },
      { emoji: '🔤', label: 'Alphabet',           color: 'bg-indigo-500',  key: 'alphabet',      unit: 'entrées',   to: '/alphabet-langues' },
      { emoji: '✏️', label: 'Conjugaison',        color: 'bg-violet-600',  key: 'conjugation',   unit: 'fiches',    to: '/conjugation' },
      { emoji: '📚', label: 'Vocabulaire',        color: 'bg-blue-600',    key: 'vocabulary',    unit: 'mots',      to: '/vocabulary' },
      { emoji: '🎓', label: 'Leçons',             color: 'bg-green-600',   key: 'lessons',       unit: 'leçons',    to: '/lessons' },
      { emoji: '🌍', label: 'Culture & Traditions',color: 'bg-purple-600', key: 'cultural',      unit: 'éléments',  to: '/cultural' },
      { emoji: '📄', label: 'Textes & Récits',    color: 'bg-indigo-600',  key: 'textContents',  unit: 'textes',    to: '/textes-recits' },
      { emoji: '🖼️', label: 'Galeries d\'Images', color: 'bg-pink-600',    key: 'images',        unit: 'images',    to: '/image-galleries' },
      { emoji: '🔠', label: 'Sens des Mots',      color: 'bg-cyan-600',    key: 'sensMots',      unit: 'fiches',    to: '/sens-mots' },
      { emoji: '🎬', label: 'Vidéos',             color: 'bg-red-500',     key: 'videos',        unit: 'vidéos',    to: '/videos' },
    ],
  },
  {
    label: 'SOS & Santé & Société',
    color: 'text-red-700',
    dot: 'bg-red-500',
    items: [
      { emoji: '🚨', label: 'Phrases SOS',        color: 'bg-red-600',     key: 'phrases',        unit: 'phrases',  to: '/phrases-sos' },
      { emoji: '💬', label: 'Phrases Utiles',     color: 'bg-teal-500',    key: 'phrasesUtiles',  unit: 'phrases',  to: '/phrases-utiles' },
      { emoji: '🏥', label: 'Premiers Secours',   color: 'bg-rose-700',    key: 'premierSecours', unit: 'fiches',   to: '/premiers-secours' },
      { emoji: '🏛️', label: 'Civisme',            color: 'bg-teal-600',    key: 'civisme',        unit: 'contenus', to: '/civisme' },
    ],
  },
  {
    label: 'Médias & Audio',
    color: 'text-purple-700',
    dot: 'bg-purple-500',
    items: [
      { emoji: '🎙️', label: 'Import Audio',       color: 'bg-orange-600',  key: 'audioContribs', unit: 'fichiers', to: '/voix-audio' },
      { emoji: '🤖', label: 'IA Linguistique',    color: 'bg-cyan-700',    key: 'iaLinguistique',unit: 'modèles',  to: '/ia-linguistique' },
    ],
  },
  {
    label: 'Communauté',
    color: 'text-orange-700',
    dot: 'bg-orange-500',
    items: [
      { emoji: '🎯', label: 'Contributions',      color: 'bg-accent',      key: 'contributions', unit: 'soumises', to: '/contributions' },
      { emoji: '✉️', label: 'Messages',           color: 'bg-indigo-600',  key: 'messages',      unit: 'messages', to: '/messages' },
      { emoji: '🏆', label: 'Certificats',        color: 'bg-yellow-500',  key: 'certs',         unit: 'délivrés', to: '/certificates' },
    ],
  },
  {
    label: 'Éducation & Vie Pratique',
    color: 'text-emerald-700',
    dot: 'bg-emerald-500',
    items: [
      { emoji: '🔢', label: 'Mathématiques',   color: 'bg-emerald-600', key: 'math',        unit: 'contenus',   to: '/mathematiques' },
      { emoji: '💵', label: 'Monnaie FCFA',    color: 'bg-yellow-600',  key: 'monnaie',     unit: 'contenus',   to: '/monnaie' },
      { emoji: '🤝', label: 'Partenaires',     color: 'bg-teal-600',    key: 'partenaires', unit: 'partenaires', to: '/partenaire' },
    ],
  },
  {
    label: 'Intelligence Artificielle',
    color: 'text-cyan-700',
    dot: 'bg-cyan-500',
    items: [
      { emoji: '🧑‍🏫', label: 'Tuteurs IA',       color: 'bg-primary-500', key: 'tutors',        unit: 'tuteurs',  to: '/tutors' },
      { emoji: '🧪', label: 'Test Agents IA',     color: 'bg-emerald-600', key: 'testAgents',    unit: 'agents',   to: '/test-agents' },
      { emoji: '🎵', label: 'Bienvenue & Sons',   color: 'bg-pink-500',    key: 'bienvenue',     unit: 'messages', to: '/bienvenue-sons' },
      { emoji: '🦜', label: 'RÉPÉTO',             color: 'bg-teal-600',    key: 'repetitor',     unit: 'mots actifs', to: '/repetitor', adminOnly: true },
    ],
  },
  {
    label: 'Paramètres Application',
    color: 'text-green-700',
    dot: 'bg-green-500',
    items: [
      { emoji: '🌐', label: 'Langues',            color: 'bg-green-600',   key: 'langues',       unit: 'langues',  to: '/langues' },
      { emoji: '📍', label: 'Carte CI',           color: 'bg-lime-600',    key: 'carte',         unit: 'lieux',    to: '/carte-ci' },
      { emoji: '🏅', label: 'Badges & XP',        color: 'bg-amber-500',   key: 'badges',        unit: 'badges',   to: '/badges' },
      { emoji: '🔔', label: 'Notifications',      color: 'bg-sky-500',     key: 'notifications', unit: 'envoyées', to: '/notifications' },
      { emoji: '🏺', label: 'Musée des Trésors',  color: 'bg-amber-700',   key: 'musee',         unit: 'objets',   to: '/musee-tresors' },
      { emoji: '🌳', label: 'Arbre à Palabres',   color: 'bg-green-700',   key: 'arbre',         unit: 'mots',     to: '/arbre-vocabulaire' },
      { emoji: '🛒', label: 'Au Marché',          color: 'bg-orange-500',  key: 'marche',        unit: 'dialogues',to: '/marche-dialogues' },
    ],
  },
  {
    label: 'Finance',
    color: 'text-amber-700',
    dot: 'bg-amber-500',
    adminOnly: true,
    items: [
      { emoji: '💰', label: 'Finance',            color: 'bg-amber-600',   key: 'finance',       unit: 'entrées',  to: '/finance' },
    ],
  },
  {
    label: 'Administration',
    color: 'text-gray-700',
    dot: 'bg-gray-500',
    adminOnly: true,
    items: [
      { emoji: '👥', label: 'Utilisateurs',       color: 'bg-gray-600',    key: 'users',         unit: 'comptes',  to: '/users' },
    ],
  },
];

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function ModuleCard({ emoji, label, color, value, unit, to }) {
  return (
    <Link to={to}>
      <div className="card flex items-center gap-4 transition-shadow hover:shadow-md cursor-pointer">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl flex-shrink-0`}>
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
          <p className="text-xs text-gray-500">{unit}</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [stats, setStats]               = useState(null);
  const [pending, setPending]           = useState([]);
  const [messages, setMessages]         = useState([]);
  const [certs, setCerts]               = useState([]);
  const [tutors, setTutors]             = useState([]);
  const [repetitorStats, setRepetitorStats] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      contributionsAPI.getAll({ status: 'PENDING', limit: 5 }),
      supportAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
      certificatesAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
      tutorsAPI.getAll().catch(() => ({ data: [] })),
      repetitorAPI.getStats().catch(() => ({ data: null })),
    ]).then(([s, c, msg, cert, tut, rep]) => {
      setStats(s.data);
      const pList = c.data?.data ?? c.data;
      const mList = msg.data?.data ?? msg.data;
      const ctList = cert.data?.data ?? cert.data;
      setPending(Array.isArray(pList) ? pList : []);
      setMessages(Array.isArray(mList) ? mList : []);
      setCerts(Array.isArray(ctList) ? ctList : []);
      if (rep.data) setRepetitorStats(rep.data);
      setTutors(Array.isArray(tut.data) ? tut.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* ── Messages ── */
  const msgOpen     = messages.filter(m => m.status === 'OPEN' || m.status === 'OUVERT').length;
  const msgProgress = messages.filter(m => m.status === 'IN_PROGRESS' || m.status === 'EN_COURS').length;
  const msgResolved = messages.filter(m => m.status === 'RESOLVED' || m.status === 'RESOLU').length;

  /* ── Certificats ── */
  const certTotal   = certs.length;
  const certByLevel = ['A1', 'A2', 'B1', 'B2', 'C1'].map(n => ({
    niveau: n, count: certs.filter(c => c.niveau === n).length,
  }));

  /* ── Agents IA ── */
  const nameCount      = tutors.reduce((acc, t) => { acc[t.nomAvatar] = (acc[t.nomAvatar] || 0) + 1; return acc; }, {});
  const iaNames        = new Set(Object.entries(nameCount).filter(([, v]) => v > 1).map(([k]) => k));
  const iaAgents       = [
    ...new Map(tutors.filter(t => iaNames.has(t.nomAvatar) && t.genre === 'F').map(t => [t.nomAvatar, t])).values(),
    ...new Map(tutors.filter(t => iaNames.has(t.nomAvatar) && t.genre === 'M').map(t => [t.nomAvatar, t])).values(),
  ];
  const culturalTutors = [...new Map(tutors.filter(t => !iaNames.has(t.nomAvatar)).map(t => [t.nomAvatar, t])).values()];
  const tutorsMale     = culturalTutors.filter(t => t.genre === 'M');
  const tutorsFemale   = culturalTutors.filter(t => t.genre === 'F');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme Langues Ivoire</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Utilisateurs totaux" value={stats?.users?.total}
          subtitle={`+${stats?.users?.newUsersD7 ?? 0} nouveaux cette semaine · ${stats?.users?.activeD1 ?? 0} actifs aujourd'hui`} icon={UsersIcon} color="bg-primary-500" />
        <StatCard title="Mots publiés" value={stats?.content?.totalWords}
          subtitle={`${stats?.content?.totalPhrases ?? 0} phrases SOS`} icon={BookOpenIcon} color="bg-blue-600" />
        <StatCard title="Contributions en attente" value={stats?.contributions?.pending}
          subtitle="À modérer" icon={ClockIcon} color="bg-accent" />
        <StatCard title="Leçons complétées" value={stats?.content?.totalLessonsCompleted}
          icon={ArrowTrendingUpIcon} color="bg-green-600" />
      </div>

      {/* KPIs Messages + Certificats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Messages utilisateurs"
          value={messages.length || '—'}
          subtitle={`${msgOpen} ouvert(s) · ${msgProgress} en cours · ${msgResolved} résolu(s)`}
          icon={EnvelopeIcon} color="bg-indigo-600"
        />
        <StatCard
          title="Certificats & Diplômes"
          value={certTotal || '—'}
          subtitle={certTotal > 0
            ? certByLevel.filter(l => l.count > 0).map(l => `${l.count} ${l.niveau}`).join(' · ')
            : 'Aucun certificat délivré'}
          icon={AcademicCapIcon} color="bg-yellow-500"
        />
      </div>

      {/* Modules de contenu — filtrés selon le rôle et les modules attribués */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Modules de contenu</h2>
          {!isAdmin && user?.modules?.length > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {user.modules.length} module{user.modules.length > 1 ? 's' : ''} attribué{user.modules.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {(() => {
          // Partenaires : afficher uniquement le module Partenaire
          if (user?.role === 'PARTNER') return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-4xl mb-2">🤝</p>
              <p className="text-base font-bold text-emerald-800">Tableau de bord Partenaires</p>
              <p className="text-sm text-emerald-600 mt-1 mb-4">Consultez vos statistiques, performances et indicateurs clés.</p>
              <Link to="/partenaire" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">
                Accéder au tableau Partenaire →
              </Link>
            </div>
          );

          // Filtre par modules assignés pour Éditeur/Contributeur
          const userModules = user?.modules ?? [];
          const sections = MODULE_SECTIONS
            .filter(section => !section.adminOnly || isAdmin)
            .map(section => ({
              ...section,
              items: isAdmin
                ? section.items
                : section.items.filter(m => userModules.includes(m.key)),
            }))
            .filter(section => section.items.length > 0);

          if (sections.length === 0) return (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm">Aucun module attribué. Contactez votre administrateur.</p>
            </div>
          );

          return (
            <div className="space-y-6">
              {sections.map(section => (
                <div key={section.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${section.dot}`} />
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${section.color}`}>
                      {section.label}
                    </h3>
                    <span className="text-xs text-gray-400">({section.items.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {section.items
                      .filter(m => !m.adminOnly || isAdmin)
                      .map(m => (
                      <ModuleCard
                        key={m.key}
                        emoji={m.emoji}
                        label={m.label}
                        color={m.color}
                        value={m.key === 'repetitor'
                          ? repetitorStats?.totalMots
                          : stats?.modules?.[m.key]}
                        unit={m.unit}
                        to={m.to}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── Bannière RÉPÉTO Phase 1 (admin seulement) ── */}
      {isAdmin && (
        <div className="mb-8">
          <Link to="/repetitor">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                  🦜
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-base">RÉPÉTO</span>
                    <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                      Phase 1 — Mode Écho
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Corpus en construction · {repetitorStats?.totalSessions ?? 0} session{(repetitorStats?.totalSessions ?? 0) > 1 ? 's' : ''} enregistrée{(repetitorStats?.totalSessions ?? 0) > 1 ? 's' : ''} · {repetitorStats?.totalMots ?? 0} mot{(repetitorStats?.totalMots ?? 0) > 1 ? 's' : ''} actif{(repetitorStats?.totalMots ?? 0) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 flex-shrink-0">
                {[
                  { label: 'Sessions', val: repetitorStats?.totalSessions ?? 0 },
                  { label: 'Mots actifs', val: repetitorStats?.totalMots ?? 0 },
                  { label: 'Langues', val: repetitorStats?.languesActives ?? 0 },
                  { label: 'Pipeline ILA', val: repetitorStats?.soumisILA ?? 0 },
                ].map(k => (
                  <div key={k.label} className="text-center">
                    <p className="text-white font-black text-xl">{k.val}</p>
                    <p className="text-white/70 text-xs">{k.label}</p>
                  </div>
                ))}
              </div>
              <div className="text-white/50 text-sm hidden sm:block">→</div>
            </div>
          </Link>
        </div>
      )}

      {/* Graphique + Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Activité utilisateurs (7 jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats?.dailyActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#F47920" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Contributions en attente</h3>
            <Link to="/contributions" className="text-sm text-accent hover:underline">Voir tout →</Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
            </div>
          ) : pending.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune contribution en attente</p>
          ) : (
            <div className="space-y-2">
              {pending.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`badge ${c.type === 'WORD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {c.type === 'WORD' ? 'Mot' : c.type === 'PHRASE' ? 'Phrase' : 'Image'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.contenu?.mot || c.contenu?.phrase || 'Contribution'}
                    </p>
                    <p className="text-xs text-gray-400">{c.user?.prenom} {c.user?.nom}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{c.language?.nom}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top langues + Utilisateurs actifs */}
      {stats?.topLanguages?.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top langues — leçons complétées</h3>
            <Link to="/lessons" className="text-sm text-accent hover:underline">Voir les leçons →</Link>
          </div>
          <div className="space-y-3">
            {stats.topLanguages.map((lang, i) => {
              const max = stats.topLanguages[0]?.count || 1;
              const pct = Math.round((lang.count / max) * 100);
              return (
                <div key={lang.code} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-lg">{lang.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800 w-28 truncate">{lang.nom}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-10 text-right">{lang.count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-6 text-xs text-gray-400">
            <span>Actifs J7 : <strong className="text-gray-700">{stats?.users?.activeD7 ?? '—'}</strong></span>
            <span>Actifs J30 : <strong className="text-gray-700">{stats?.users?.activeD30 ?? '—'}</strong></span>
          </div>
        </div>
      )}

      {/* Messages par statut + Certificats par niveau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Messages par statut</h3>
            <Link to="/messages" className="text-sm text-accent hover:underline">Gérer →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Ouvert',   count: msgOpen,     color: 'bg-red-100 text-red-700',       bar: 'bg-red-400' },
              { label: 'En cours', count: msgProgress, color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
              { label: 'Résolu',   count: msgResolved, color: 'bg-green-100 text-green-700',   bar: 'bg-green-400' },
            ].map(row => {
              const pct = Math.round((row.count / (messages.length || 1)) * 100);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.color}`}>{row.label}</span>
                    <span className="text-sm font-bold text-gray-700">{row.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${row.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Aucun message reçu</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Certificats par niveau</h3>
            <Link to="/certificates" className="text-sm text-accent hover:underline">Gérer →</Link>
          </div>
          <div className="space-y-2">
            {certByLevel.map(({ niveau, count }) => {
              const pct = Math.round((count / (certTotal || 1)) * 100);
              return (
                <div key={niveau} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-28 text-center ${NIVEAU_COLORS[niveau]}`}>
                    {niveau} — {NIVEAU_LABELS[niveau]}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
            {certTotal === 0 && <p className="text-gray-400 text-sm text-center py-4">Aucun certificat délivré</p>}
          </div>
        </div>
      </div>

      {/* Agents IA + Tuteurs culturels */}
      {tutors.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Agents IA par genre</h3>
            <Link to="/tutors" className="text-sm text-accent hover:underline">Gérer les agents →</Link>
          </div>

          {iaAgents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🤖</span>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">IA Linguistiques</span>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold ml-1">Toutes langues</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {iaAgents.map(t => (
                  <div key={t.nomAvatar}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${t.genre === 'F' ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${t.genre === 'F' ? 'bg-pink-300 text-pink-900' : 'bg-blue-300 text-blue-900'}`}>
                      {t.genre === 'F' ? '♀' : '♂'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800">{t.nomAvatar}</p>
                      <p className="text-xs text-gray-500 italic truncate">{t.personalite?.split('.')[0] || (t.genre === 'F' ? 'Douce et patiente' : 'Dynamique et encourageant')}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.genre === 'F' ? 'bg-pink-200 text-pink-800' : 'bg-blue-200 text-blue-800'}`}>
                      {t.genre === 'F' ? 'Féminin' : 'Masculin'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🎭</span>
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tuteurs Culturels</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold ml-1">{culturalTutors.length} tuteurs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Masculin ({tutorsMale.length})
                </p>
                <div className="space-y-1.5">
                  {tutorsMale.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                        {t.nomAvatar?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{t.nomAvatar}</p>
                        <p className="text-xs text-gray-400 truncate">{t.language?.nom || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-pink-600 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" /> Féminin ({tutorsFemale.length})
                </p>
                <div className="space-y-1.5">
                  {tutorsFemale.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-pink-800 font-bold text-xs flex-shrink-0">
                        {t.nomAvatar?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{t.nomAvatar}</p>
                        <p className="text-xs text-gray-400 truncate">{t.language?.nom || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>🤖 <strong className="text-gray-800">{iaAgents.length}</strong> IA linguistiques</span>
            <span>🎭 <strong className="text-gray-800">{culturalTutors.length}</strong> tuteurs culturels</span>
            <span className="text-blue-600">♂ {tutorsMale.length + iaAgents.filter(t => t.genre === 'M').length}</span>
            <span className="text-pink-600">♀ {tutorsFemale.length + iaAgents.filter(t => t.genre === 'F').length}</span>
            <span className="ml-auto">Langues : <strong className="text-gray-800">
              {[...new Set(tutors.map(t => t.language?.nom).filter(Boolean))].length}
            </strong></span>
          </div>
        </div>
      )}

      {/* Rétention */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Rétention J1',  value: `${stats?.retentionD1  ?? 0}%` },
          { label: 'Rétention J7',  value: `${stats?.retentionD7  ?? 0}%` },
          { label: 'Rétention J30', value: `${stats?.retentionD30 ?? 0}%` },
        ].map(r => (
          <div key={r.label} className="card text-center">
            <p className="text-3xl font-bold text-primary-500">{r.value}</p>
            <p className="text-sm text-gray-500 mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      {/* ── Bannière Vision Panafricaine ─────────────────────── */}
      <Link to="/mission" className="block rounded-2xl overflow-hidden shadow-lg hover:shadow-orange-900/30 hover:shadow-xl transition-shadow cursor-pointer" style={{ background: '#060C0A' }}>
        <div className="flex flex-col md:flex-row items-center gap-0">
          {/* Logo Afrique */}
          <div className="flex-shrink-0 flex items-center justify-center p-4 md:p-6" style={{ minWidth: 200 }}>
            <img
              src="/logo-afrique.png"
              alt="Langues Ivoire — Vision Afrique"
              className="w-48 md:w-56 object-contain"
              style={{ filter: 'drop-shadow(0 0 18px rgba(244,121,32,0.35))' }}
            />
          </div>
          {/* Texte */}
          <div className="flex-1 px-6 py-6 md:py-8 border-t md:border-t-0 md:border-l border-white/10">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-400 mb-2">
              Vision 2027
            </p>
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug mb-3">
              De la Côte d'Ivoire à l'Afrique
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-4" style={{ maxWidth: 480 }}>
              Préserver les langues ethniques ivoiriennes n'est que le début. Notre ambition est
              de devenir la plateforme de référence pour toutes les langues menacées d'Afrique
              de l'Ouest et centrale.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { val: 'Phase 1', label: 'Côte d\'Ivoire — 9 langues', done: true },
                { val: 'Phase 2', label: 'Afrique de l\'Ouest — 2026', done: false },
                { val: 'Phase 3', label: 'Panafricain — 2027+', done: false },
              ].map(p => (
                <div
                  key={p.val}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    p.done
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 border border-white/20'
                  }`}
                >
                  {p.done && <span>✓</span>}
                  <span>{p.val}</span>
                  <span className="opacity-70">· {p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-white/10 text-center flex items-center justify-center gap-2">
          <p className="text-xs text-gray-500 italic">
            "Préserver les langues, bâtir l'avenir" — LANGUES IVOIRE
          </p>
          <span className="text-xs text-orange-400 font-semibold">· Voir la page complète →</span>
        </div>
      </Link>

    </div>
  );
}
