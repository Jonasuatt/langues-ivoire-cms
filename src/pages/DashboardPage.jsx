import { useEffect, useState } from 'react';
import { analyticsAPI, contributionsAPI, supportAPI, certificatesAPI, tutorsAPI } from '../services/api';
import {
  UsersIcon, BookOpenIcon, ChatBubbleLeftRightIcon,
  ClockIcon, ArrowTrendingUpIcon, EnvelopeIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const MOCK_CHART = [
  { name: 'Lun', users: 12 }, { name: 'Mar', users: 28 }, { name: 'Mer', users: 19 },
  { name: 'Jeu', users: 35 }, { name: 'Ven', users: 42 }, { name: 'Sam', users: 38 }, { name: 'Dim', users: 25 },
];

const NIVEAU_LABELS = { A1: 'Débutant', A2: 'Élémentaire', B1: 'Intermédiaire', B2: 'Inter. avancé', C1: 'Avancé' };
const NIVEAU_COLORS = {
  A1: 'bg-green-100 text-green-700',
  A2: 'bg-cyan-100 text-cyan-700',
  B1: 'bg-blue-100 text-blue-700',
  B2: 'bg-purple-100 text-purple-700',
  C1: 'bg-orange-100 text-orange-700',
};

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
  const [stats, setStats]           = useState(null);
  const [pending, setPending]       = useState([]);
  const [messages, setMessages]     = useState([]);
  const [certs, setCerts]           = useState([]);
  const [tutors, setTutors]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      contributionsAPI.getAll({ status: 'PENDING', limit: 5 }),
      supportAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
      certificatesAPI.getAll({ limit: 200 }).catch(() => ({ data: { data: [] } })),
      tutorsAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([s, c, msg, cert, tut]) => {
      setStats(s.data);
      setPending(c.data.data ?? c.data ?? []);
      setMessages(msg.data.data ?? msg.data ?? []);
      setCerts(cert.data.data ?? cert.data ?? []);
      setTutors(Array.isArray(tut.data) ? tut.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* ── Calculs messages ── */
  const msgOpen     = messages.filter(m => m.status === 'OPEN').length;
  const msgProgress = messages.filter(m => m.status === 'IN_PROGRESS').length;
  const msgResolved = messages.filter(m => m.status === 'RESOLVED').length;

  /* ── Calculs certificats ── */
  const certTotal = certs.length;
  const certByLevel = ['A1', 'A2', 'B1', 'B2', 'C1'].map(n => ({
    niveau: n,
    count: certs.filter(c => c.niveau === n).length,
  }));

  /* ── Calculs agents IA par genre ── */
  // Agents IA linguistiques : couvrent plusieurs langues (Amara F + Kouadio M)
  const nameCount = tutors.reduce((acc, t) => { acc[t.nomAvatar] = (acc[t.nomAvatar] || 0) + 1; return acc; }, {});
  const iaNames   = new Set(Object.entries(nameCount).filter(([, v]) => v > 1).map(([k]) => k));

  const iaAgents      = [...new Map(tutors.filter(t => iaNames.has(t.nomAvatar) && t.genre === 'F').map(t => [t.nomAvatar, t])).values()]
    .concat([...new Map(tutors.filter(t => iaNames.has(t.nomAvatar) && t.genre === 'M').map(t => [t.nomAvatar, t])).values()]);
  const culturalTutors = [...new Map(tutors.filter(t => !iaNames.has(t.nomAvatar)).map(t => [t.nomAvatar, t])).values()];
  const tutorsMale     = culturalTutors.filter(t => t.genre === 'M');
  const tutorsFemale   = culturalTutors.filter(t => t.genre === 'F');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme Langues Ivoire</p>
      </div>

      {/* KPIs — ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Utilisateurs totaux" value={stats?.users?.total}
          subtitle={`+${stats?.users?.activeD1 ?? 0} actifs aujourd'hui`} icon={UsersIcon} color="bg-primary-500" />
        <StatCard title="Mots publiés" value={stats?.content?.totalWords}
          subtitle={`${stats?.content?.totalPhrases ?? 0} phrases`} icon={BookOpenIcon} color="bg-blue-600" />
        <StatCard title="Contributions en attente" value={stats?.contributions?.pending}
          subtitle="À modérer" icon={ClockIcon} color="bg-accent" />
        <StatCard title="Leçons complétées" value={stats?.content?.totalLessonsCompleted}
          icon={ArrowTrendingUpIcon} color="bg-green-600" />
      </div>

      {/* KPIs — ligne 2 (Messages + Certificats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Messages utilisateurs"
          value={messages.length || '—'}
          subtitle={`${msgOpen} ouvert(s) · ${msgProgress} en cours · ${msgResolved} résolu(s)`}
          icon={EnvelopeIcon}
          color="bg-indigo-600"
        />
        <StatCard
          title="Certificats & Diplômes"
          value={certTotal || '—'}
          subtitle={certTotal > 0 ? `${certByLevel.filter(l => l.count > 0).map(l => `${l.count} ${l.niveau}`).join(' · ')}` : 'Aucun certificat délivré'}
          icon={AcademicCapIcon}
          color="bg-yellow-500"
        />
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

      {/* Graphique + Contributions en attente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Messages par statut + Certificats par niveau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Messages par statut */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Messages par statut</h3>
            <a href="/messages" className="text-sm text-accent hover:underline">Gérer →</a>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Ouvert',    count: msgOpen,     color: 'bg-red-100 text-red-700',    bar: 'bg-red-400' },
                { label: 'En cours',  count: msgProgress, color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-400' },
                { label: 'Résolu',    count: msgResolved, color: 'bg-green-100 text-green-700', bar: 'bg-green-400' },
              ].map(row => {
                const total = messages.length || 1;
                const pct   = Math.round((row.count / total) * 100);
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
              {messages.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Aucun message reçu</p>
              )}
            </div>
          )}
        </div>

        {/* Certificats par niveau */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Certificats par niveau</h3>
            <a href="/certificates" className="text-sm text-accent hover:underline">Gérer →</a>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {certByLevel.map(({ niveau, count }) => {
                const pct = Math.round((count / (certTotal || 1)) * 100);
                return (
                  <div key={niveau} className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-20 text-center ${NIVEAU_COLORS[niveau]}`}>
                      {niveau} — {NIVEAU_LABELS[niveau]}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
              {certTotal === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Aucun certificat délivré</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agents IA par genre */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Agents IA par genre</h3>
          <a href="/tutors" className="text-sm text-accent hover:underline">Gérer les agents →</a>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        ) : tutors.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucun agent IA enregistré</p>
        ) : (
          <>
            {/* ── IA Linguistiques ── */}
            {iaAgents.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🤖</span>
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">IA Linguistiques</span>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold ml-1">
                    Toutes langues
                  </span>
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

            {/* ── Tuteurs Culturels ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🎭</span>
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Tuteurs Culturels</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold ml-1">
                  {culturalTutors.length} tuteurs
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Masculin */}
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    Masculin ({tutorsMale.length})
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

                {/* Féminin */}
                <div>
                  <p className="text-xs font-semibold text-pink-600 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                    Féminin ({tutorsFemale.length})
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
          </>
        )}

        {/* Résumé global */}
        {tutors.length > 0 && !loading && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>🤖 <strong className="text-gray-800">{iaAgents.length}</strong> IA linguistiques</span>
            <span>🎭 <strong className="text-gray-800">{culturalTutors.length}</strong> tuteurs culturels</span>
            <span className="text-blue-600">♂ {tutorsMale.length + iaAgents.filter(t => t.genre === 'M').length}</span>
            <span className="text-pink-600">♀ {tutorsFemale.length + iaAgents.filter(t => t.genre === 'F').length}</span>
            <span className="ml-auto">
              Langues : <strong className="text-gray-800">
                {[...new Set(tutors.map(t => t.language?.nom).filter(Boolean))].length}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
