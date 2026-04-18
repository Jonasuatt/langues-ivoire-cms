import { useEffect, useState, useRef } from 'react';
import { analyticsAPI, contributionsAPI } from '../services/api';
import {
  UsersIcon, BookOpenIcon, ClockIcon, ArrowTrendingUpIcon,
  MicrophoneIcon, VideoCameraIcon, TrophyIcon, SparklesIcon,
  ArrowDownTrayIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const LANG_COLORS = [
  '#0B3D2E', '#F47920', '#1565C0', '#6A1B9A',
  '#00897B', '#C62828', '#EF6C00', '#2E7D32',
];

function StatCard({ title, value, subtitle, icon: Icon, color, highlight }) {
  return (
    <div className={`card flex items-start gap-4 ${highlight ? 'ring-2 ring-accent/30' : ''}`}>
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function formatNow() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [dailyActivity, setDailyActivity] = useState([]);
  const [langStats, setLangStats] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityDays, setActivityDays] = useState(14);
  const printRef = useRef(null);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      contributionsAPI.getAll({ status: 'PENDING', limit: 5 }),
      analyticsAPI.getLanguageStats(),
      analyticsAPI.getTopUsers(10),
    ]).then(([s, c, l, u]) => {
      setStats(s.data);
      setPending(c.data.data);
      setLangStats(l.data);
      setTopUsers(u.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    analyticsAPI.getDailyActivity(activityDays)
      .then(r => setDailyActivity(r.data))
      .catch(() => {});
  }, [activityDays]);

  const langPieData = langStats.filter(l => l.learners > 0).map(l => ({ name: l.nom, value: l.learners }));
  const langBarData = langStats.map(l => ({ name: l.nom.slice(0, 6), mots: l.words, leçons: l.lessons }));

  const handleExport = () => window.print();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 print:p-4" ref={printRef}>

      {/* En-tête */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme · {formatNow()}</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 print:hidden">
          <ArrowDownTrayIcon className="w-4 h-4" />
          Exporter (PDF)
        </button>
      </div>

      {/* ── BLOC IMPACT SOCIAL (pour présentation) ── */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 mb-8 text-white print:break-inside-avoid">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-yellow-300" />
          <h2 className="font-bold text-lg">Impact de la plateforme</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Langues couvertes', value: `${stats?.content?.languagesWithContent ?? 8}/8`, sub: 'langues ivoiriennes' },
            { label: 'Apprenants inscrits', value: stats?.users?.total ?? 0, sub: `${stats?.users?.activeD7 ?? 0} actifs cette semaine` },
            { label: 'Leçons disponibles', value: stats?.content?.totalLessons ?? 0, sub: `${stats?.content?.totalLessonsCompleted ?? 0} complétées` },
            { label: 'Mots préservés', value: stats?.content?.totalWords ?? 0, sub: `${stats?.content?.totalPhrases ?? 0} phrases utiles` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm font-medium text-white/90 mt-1">{label}</p>
              <p className="text-xs text-white/60 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPIs principaux ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Utilisateurs totaux" value={stats?.users?.total}
          subtitle={`${stats?.users?.activeD1 ?? 0} actifs aujourd'hui`} icon={UsersIcon} color="bg-primary-500" />
        <StatCard title="Mots publiés" value={stats?.content?.totalWords}
          subtitle={`${stats?.content?.totalPhrases ?? 0} phrases`} icon={BookOpenIcon} color="bg-blue-600" />
        <StatCard title="Contributions en attente" value={stats?.contributions?.pending}
          subtitle={`${stats?.contributions?.total ?? 0} au total`} icon={ClockIcon} color="bg-accent" />
        <StatCard title="Leçons complétées" value={stats?.content?.totalLessonsCompleted}
          subtitle={`${stats?.content?.totalLessons ?? 0} disponibles`} icon={ArrowTrendingUpIcon} color="bg-green-600" />
      </div>

      {/* ── KPIs IA & Multimédia ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Contributions vocales" value={stats?.ia?.audioContributions ?? 0}
          subtitle={`${stats?.ia?.validatedAudio ?? 0} validées pour l'IA`}
          icon={MicrophoneIcon} color="bg-purple-600" highlight />
        <StatCard title="Sessions pratique IA" value={stats?.ia?.practiceSessions ?? 0}
          subtitle="avec Amara & Kouadio" icon={SparklesIcon} color="bg-indigo-600" highlight />
        <StatCard title="Vidéos culturelles" value={stats?.content?.totalVideos ?? 0}
          subtitle="disponibles dans l'app" icon={VideoCameraIcon} color="bg-red-600" />
        <StatCard title="Badges décernés" value={stats?.gamification?.totalBadgesEarned ?? 0}
          subtitle="récompenses gagnées" icon={TrophyIcon} color="bg-yellow-500" />
      </div>

      {/* ── Rétention ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Rétention J1', value: stats?.retentionD1, color: 'text-green-600' },
          { label: 'Rétention J7', value: stats?.retentionD7, color: 'text-blue-600' },
          { label: 'Rétention J30', value: stats?.retentionD30, color: 'text-primary-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className={`text-4xl font-bold ${color}`}>{value ?? 0}%</p>
            <p className="text-sm text-gray-500 mt-2">{label}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-current rounded-full transition-all" style={{ width: `${value ?? 0}%`, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Graphiques : Activité + Pie langues ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 print:break-inside-avoid">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Activité quotidienne</h3>
            <div className="flex gap-1 print:hidden">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setActivityDays(d)}
                  className={`px-3 py-1 text-xs rounded-full ${activityDays === d
                    ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {d}j
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyActivity.map(d => ({ ...d, date: formatDate(d.date) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" name="Utilisateurs actifs" stroke="#F47920" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lessonsCompleted" name="Leçons" stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="contributions" name="Contributions" stroke="#1565C0" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Apprenants par langue</h3>
          {langPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={langPieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={75} innerRadius={35} paddingAngle={2}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}>
                  {langPieData.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <GlobeAltIcon className="w-10 h-10 mb-2" />
              <p className="text-sm">Données en cours de collecte</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Couverture contenu par langue (barres) ── */}
      <div className="card mb-8 print:break-inside-avoid">
        <h3 className="font-semibold text-gray-900 mb-4">Couverture du contenu par langue</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={langBarData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="mots" name="Mots" fill="#0B3D2E" radius={[4,4,0,0]} />
            <Bar dataKey="leçons" name="Leçons" fill="#F47920" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Tableau langues ── */}
      <div className="card mb-8 print:break-inside-avoid">
        <h3 className="font-semibold text-gray-900 mb-4">Contenu par langue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Langue</th>
                <th className="pb-3 font-medium text-center">Mots</th>
                <th className="pb-3 font-medium text-center">Phrases</th>
                <th className="pb-3 font-medium text-center">Leçons</th>
                <th className="pb-3 font-medium text-center">Culture</th>
                <th className="pb-3 font-medium text-center">Apprenants</th>
                <th className="pb-3 font-medium text-center">Complétées</th>
                <th className="pb-3 font-medium text-center">Contribs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {langStats.map((lang, i) => (
                <tr key={lang.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }} />
                      {lang.nom}
                    </div>
                  </td>
                  <td className="py-3 text-center text-gray-600">{lang.words}</td>
                  <td className="py-3 text-center text-gray-600">{lang.phrases}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${lang.lessons > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                      {lang.lessons}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-600">{lang.culturalItems}</td>
                  <td className="py-3 text-center font-semibold text-primary-500">{lang.learners}</td>
                  <td className="py-3 text-center text-gray-600">{lang.lessonsCompleted}</td>
                  <td className="py-3 text-center text-gray-600">{lang.contributions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top apprenants + Contributions en attente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:break-inside-avoid">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">🏆 Top apprenants</h3>
          {topUsers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucun apprenant pour l'instant</p>
          ) : (
            <div className="space-y-2">
              {topUsers.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.prenom} {u.nom}</p>
                    <p className="text-xs text-gray-400">{u.lessonsCompleted} leçons · {u.badges} badge{u.badges > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-500">{u.totalXp} XP</p>
                    <p className="text-xs text-orange-500">🔥 {u.streak}j</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">📋 Contributions en attente</h3>
            <a href="/contributions" className="text-sm text-accent hover:underline print:hidden">Voir tout →</a>
          </div>
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <TrophyIcon className="w-10 h-10 mb-2" />
              <p className="text-sm text-gray-400">Aucune contribution en attente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    c.type === 'WORD' ? 'bg-blue-100 text-blue-700' :
                    c.type === 'PHRASE' ? 'bg-purple-100 text-purple-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {c.type === 'WORD' ? 'Mot' : c.type === 'PHRASE' ? 'Phrase' : 'Photo'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.contenu?.mot || c.contenu?.phrase || 'Contribution'}
                    </p>
                    <p className="text-xs text-gray-400">{c.user?.prenom} {c.user?.nom}</p>
                  </div>
                  <span className="text-xs text-gray-400">{c.language?.nom}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Pied de page rapport (visible à l'impression) ── */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Langues Ivoire · Rapport d'impact · {formatNow()} · langues-ivoire-cms.netlify.app
      </div>

    </div>
  );
}
