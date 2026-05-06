import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, contributionsAPI } from '../services/api';
import {
  UsersIcon, BookOpenIcon, ChatBubbleLeftRightIcon,
  ClockIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MOCK_CHART = [
  { name: 'Lun', users: 12 }, { name: 'Mar', users: 28 }, { name: 'Mer', users: 19 },
  { name: 'Jeu', users: 35 }, { name: 'Ven', users: 42 }, { name: 'Sam', users: 38 }, { name: 'Dim', users: 25 },
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

const MODULES = [
  { emoji: '📚', label: 'Vocabulaire', color: 'bg-blue-600', key: 'vocabulary', unit: 'mots', to: '/vocabulary' },
  { emoji: '🎯', label: 'Contributions', color: 'bg-accent', key: 'contributions', unit: 'contributions', to: '/contributions' },
  { emoji: '🎓', label: 'Leçons', color: 'bg-green-600', key: 'lessons', unit: 'leçons', to: '/lessons' },
  { emoji: '🤖', label: 'Tuteurs IA', color: 'bg-primary-500', key: 'tutors', unit: 'tuteurs', to: '/tutors' },
  { emoji: '🌍', label: 'Culture', color: 'bg-purple-600', key: 'cultural', unit: 'éléments', to: '/cultural' },
  { emoji: '📄', label: 'Textes & Récits', color: 'bg-indigo-600', key: 'textContents', unit: 'textes', to: '#', disabled: true },
  { emoji: '🖼️', label: 'Galeries Images', color: 'bg-pink-600', key: 'images', unit: 'images', to: '#', disabled: true },
  { emoji: '🚨', label: 'Phrases SOS', color: 'bg-red-600', key: 'phrases', unit: 'phrases', to: '#', disabled: true },
  { emoji: '🎙️', label: 'Voix Audio', color: 'bg-orange-600', key: 'audioContribs', unit: 'enregistrements', to: '/voix-audio' },
  { emoji: '🏥', label: 'Premiers Secours', color: 'bg-rose-700', key: 'premierSecours', unit: 'fiches', to: '/premiers-secours' },
  { emoji: '🏛️', label: 'Civisme', color: 'bg-teal-600', key: 'civisme', unit: 'contenus', to: '/civisme' },
];

function ModuleCard({ emoji, label, color, value, unit, to, disabled }) {
  const inner = (
    <div className={`card flex items-center gap-4 transition-shadow ${disabled ? 'opacity-60' : 'hover:shadow-md cursor-pointer'}`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl flex-shrink-0`}>
        {emoji}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500">{unit}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      </div>
      {disabled && <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Bientôt</span>}
    </div>
  );

  if (disabled || to === '#') return inner;
  return <Link to={to}>{inner}</Link>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      contributionsAPI.getAll({ status: 'PENDING', limit: 5 }),
    ]).then(([s, c]) => {
      setStats(s.data);
      setPending(c.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme Langues Ivoire</p>
      </div>

      {/* Section 1 — KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Utilisateurs totaux" value={stats?.users?.total}
          subtitle={`+${stats?.users?.activeD1 ?? 0} actifs aujourd'hui`} icon={UsersIcon} color="bg-primary-500" />
        <StatCard title="Mots publiés" value={stats?.content?.totalWords}
          subtitle={`${stats?.content?.totalPhrases ?? 0} phrases SOS`} icon={BookOpenIcon} color="bg-blue-600" />
        <StatCard title="Contributions en attente" value={stats?.contributions?.pending}
          subtitle="À modérer" icon={ClockIcon} color="bg-accent" />
        <StatCard title="Leçons complétées" value={stats?.content?.totalLessonsCompleted}
          icon={ArrowTrendingUpIcon} color="bg-green-600" />
      </div>

      {/* Section 2 — Grille de modules */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules de contenu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MODULES.map(m => (
            <ModuleCard
              key={m.key}
              emoji={m.emoji}
              label={m.label}
              color={m.color}
              value={stats?.modules?.[m.key]}
              unit={m.unit}
              to={m.to}
              disabled={m.disabled}
            />
          ))}
        </div>
      </div>

      {/* Section 3 — Graphique activité + Contributions en attente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Activité utilisateurs (7 jours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_CHART}>
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

      {/* Section 4 — Rétention J1 / J7 / J30 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Rétention J1', value: `${stats?.retentionD1 ?? 0}%` },
          { label: 'Rétention J7', value: `${stats?.retentionD7 ?? 0}%` },
          { label: 'Rétention J30', value: `${stats?.retentionD30 ?? 0}%` },
        ].map(r => (
          <div key={r.label} className="card text-center">
            <p className="text-3xl font-bold text-primary-500">{r.value}</p>
            <p className="text-sm text-gray-500 mt-1">{r.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
