import { useEffect, useState } from 'react';
import { analyticsAPI, contributionsAPI } from '../services/api';
import {
  UsersIcon, BookOpenIcon, ChatBubbleLeftRightIcon,
  ClockIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Utilisateurs totaux" value={stats?.users?.total}
          subtitle={`+${stats?.users?.activeD1 ?? 0} actifs aujourd'hui`} icon={UsersIcon} color="bg-primary-500" />
        <StatCard title="Mots publiés" value={stats?.content?.totalWords}
          subtitle={`${stats?.content?.totalPhrases ?? 0} phrases`} icon={BookOpenIcon} color="bg-blue-600" />
        <StatCard title="Contributions en attente" value={stats?.contributions?.pending}
          subtitle="À modérer" icon={ClockIcon} color="bg-accent" />
        <StatCard title="Leçons complétées" value={stats?.content?.totalLessonsCompleted}
          icon={ArrowTrendingUpIcon} color="bg-green-600" />
      </div>

      {/* Rétention */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique activité */}
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

        {/* Contributions en attente */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Contributions en attente</h3>
            <a href="/contributions" className="text-sm text-accent hover:underline">Voir tout →</a>
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
    </div>
  );
}
