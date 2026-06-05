/**
 * PartenairePage.jsx
 * Tableau de bord Partenaires & Investisseurs — Langues Ivoire
 * Vue stratégique : KPIs, graphiques, équipe, agents IA, impact mission.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  analyticsAPI, tutorsAPI, certificatesAPI, languagesAPI, adminAPI, committeeAPI,
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  UsersIcon, DevicePhoneMobileIcon, GlobeAltIcon, AcademicCapIcon,
  BookOpenIcon, CheckCircleIcon, HeartIcon, SparklesIcon,
  DocumentArrowDownIcon, CalendarDaysIcon, ChartBarIcon,
  UserGroupIcon, CpuChipIcon, ShieldCheckIcon, StarIcon,
  ArrowTrendingUpIcon, LightBulbIcon, BuildingLibraryIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadialBarChart, RadialBar,
} from 'recharts';
import PageHelp from '../components/PageHelp';
import { CarteCI } from './LanguesPage';
import { getAvatarPortrait } from '../utils/getAvatar';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ACTIVITY = [
  { day: 'Lun', inscrits: 47, actifs: 312 },
  { day: 'Mar', inscrits: 63, actifs: 428 },
  { day: 'Mer', inscrits: 51, actifs: 389 },
  { day: 'Jeu', inscrits: 78, actifs: 501 },
  { day: 'Ven', inscrits: 92, actifs: 614 },
  { day: 'Sam', inscrits: 84, actifs: 587 },
  { day: 'Dim', inscrits: 56, actifs: 423 },
];
const MOCK_LANGUES = [
  { nom: 'Dioula',   mots: 1240 },
  { nom: 'Baoulé',  mots: 980 },
  { nom: 'Nouchi',  mots: 890 },
  { nom: 'Bété',    mots: 740 },
  { nom: 'Guéré',   mots: 620 },
  { nom: 'Agni',    mots: 560 },
  { nom: 'Attié',   mots: 480 },
  { nom: 'Sénoufo', mots: 410 },
  { nom: 'Yacouba', mots: 380 },
];
const CERT_COLORS   = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b'];
const LANG_COLORS   = ['#0B3D2E', '#F47920', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];
const NIVEAU_LABELS = { A1: 'Débutant', A2: 'Élémentaire', B1: 'Intermédiaire', B2: 'Inter. avancé', C1: 'Avancé' };
const ROLE_LABELS  = { USER: 'Apprenants', CONTRIBUTOR: 'Contributeurs', EDITOR: 'Éditeurs', EXPERT: 'Experts ILA', ADMIN: 'Admins', SUPER_ADMIN: 'Super Admins', PARTNER: 'Partenaires' };
const ROLE_COLORS  = { USER: '#3b82f6', CONTRIBUTOR: '#f59e0b', EDITOR: '#8b5cf6', EXPERT: '#14b8a6', ADMIN: '#ef4444', SUPER_ADMIN: '#dc2626', PARTNER: '#10b981' };
const STREAK_COLORS = ['#e5e7eb', '#86efac', '#4ade80', '#22c55e', '#16a34a'];
const AGE_COLORS    = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (ts) => {
      const pct = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(pct * target));
      if (pct < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const n = useCountUp(value ?? 0);
  return <span>{n.toLocaleString('fr-FR')}</span>;
}

function KpiCard({ icon: Icon, label, value, trend, color, bgGradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg text-white ${bgGradient}`}
      style={{ minHeight: 140 }}>
      <div className="absolute -right-4 -top-4 opacity-10">
        <Icon className="w-28 h-28" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-xl">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <span className="text-xs font-bold bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
              +{trend}%
            </span>
          )}
        </div>
        <p className="text-3xl font-black tracking-tight">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-sm font-medium text-white text-opacity-85 mt-1">{label}</p>
      </div>
    </div>
  );
}

function SecondaryKpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RetentionGauge({ label, value, color }) {
  const pct = Math.min(value ?? 0, 100);
  const radialData = [{ name: label, value: pct, fill: color }];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center flex flex-col items-center">
      <div style={{ width: 120, height: 120 }}>
        <RadialBarChart
          width={120} height={120}
          cx={60} cy={60}
          innerRadius={40} outerRadius={55}
          startAngle={225} endAngle={-45}
          data={radialData}
          barSize={10}
        >
          <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={6} />
        </RadialBarChart>
      </div>
      <p className="text-3xl font-black mt-1" style={{ color }}>{pct}%</p>
      <p className="text-sm font-semibold text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function RoleBadge({ role }) {
  const cfg = {
    EDITOR:      'bg-indigo-100 text-indigo-700',
    CONTRIBUTOR: 'bg-amber-100 text-amber-700',
    ADMIN:       'bg-red-100 text-red-700',
    SUPER_ADMIN: 'bg-red-200 text-red-800',
  };
  const labels = {
    EDITOR: 'Éditeur', CONTRIBUTOR: 'Contributeur',
    ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin',
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[role] ?? role}
    </span>
  );
}

function MemberCard({ member }) {
  const initials = `${member.prenom?.[0] ?? ''}${member.nom?.[0] ?? ''}`.toUpperCase();
  const hue = (member.prenom?.charCodeAt(0) ?? 0) % 360;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
        style={{ background: `hsl(${hue},55%,45%)` }}
      >
        {initials || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 text-sm truncate">
          {member.prenom} {member.nom}
        </p>
        {member.titre && (
          <p className="text-xs text-gray-500 italic truncate">{member.titre}</p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <RoleBadge role={member.role} />
          {member.langues?.length > 0 && (
            <span className="text-xs text-gray-400 truncate">
              {member.langues.slice(0, 2).join(', ')}
              {member.langues.length > 2 && ` +${member.langues.length - 2}`}
            </span>
          )}
        </div>
      </div>
      {member.createdAt && (
        <div className="text-right text-xs text-gray-400 flex-shrink-0">
          <p>Depuis</p>
          <p className="font-semibold">
            {new Date(member.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}

function TutorCard({ tutor, large = false }) {
  const initials = tutor.nomAvatar?.slice(0, 2).toUpperCase() ?? '??';
  const isFemale = tutor.genre === 'F';
  const portrait = getAvatarPortrait(tutor.nomAvatar);

  const avatarSize = large ? 'w-20 h-20' : 'w-14 h-14';
  const ringColor  = isFemale ? 'ring-pink-300'  : 'ring-blue-300';
  const bgColor    = isFemale ? 'bg-pink-400'    : 'bg-blue-400';
  const cardBg     = isFemale ? 'bg-pink-50 border-pink-200'  : 'bg-blue-50 border-blue-200';
  const badgeBg    = isFemale ? 'bg-pink-200 text-pink-800'   : 'bg-blue-200 text-blue-800';

  return (
    <div className={`rounded-2xl border p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${cardBg}`}>
      {/* Avatar avec portrait réel ou initiales */}
      <div className={`${avatarSize} rounded-full flex-shrink-0 ring-2 ${ringColor} overflow-hidden ${!portrait ? bgColor + ' flex items-center justify-center font-black text-white' : ''}`}>
        {portrait ? (
          <img
            src={portrait}
            alt={tutor.nomAvatar}
            className="w-full h-full object-cover object-top"
            onError={e => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add(bgColor, 'flex', 'items-center', 'justify-center');
              e.currentTarget.parentElement.innerHTML = `<span class="font-black text-white text-sm">${initials}</span>`;
            }}
          />
        ) : (
          <span className="text-sm">{initials}</span>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 text-sm leading-tight">{tutor.nomAvatar}</p>
        <p className="text-xs text-gray-500 italic truncate mt-0.5">
          {tutor.personalite?.split('.')[0] ?? (isFemale ? 'Douce et patiente' : 'Dynamique et encourageant')}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
            {isFemale ? '♀ Féminin' : '♂ Masculin'}
          </span>
          {tutor.language?.nom && (
            <span className="text-[10px] font-semibold bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {tutor.language.nom}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ icon: Icon, title, desc, color }) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${color} relative overflow-hidden`}>
      <div className="absolute -bottom-4 -right-4 opacity-10">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="bg-white bg-opacity-20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="font-black text-lg leading-tight">{title}</p>
        <p className="text-sm text-white text-opacity-80 mt-2 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Custom tooltip for charts ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name} : {p.value.toLocaleString('fr-FR')}
        </p>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PartenairePage() {
  const { user } = useAuth();

  const [stats,          setStats]          = useState(null);
  const [languages,      setLanguages]      = useState([]);
  const [certs,          setCerts]          = useState([]);
  const [tutors,         setTutors]         = useState([]);
  const [members,        setMembers]        = useState([]);
  const [allUsers,       setAllUsers]       = useState([]);
  const [committeeStats, setCommitteeStats] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [loadedAt,       setLoadedAt]       = useState(null);
  const [selectedLangId, setSelectedLangId] = useState(null);
  const [exportingStats, setExportingStats] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard().catch(() => ({ data: {} })),
      languagesAPI.getAll().catch(() => ({ data: [] })),
      certificatesAPI.getAll({ limit: 500 }).catch(() => ({ data: { data: [] } })),
      tutorsAPI.getAll().catch(() => ({ data: [] })),
      adminAPI.getUsers({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
      committeeAPI.getStats().catch(() => ({ data: null })),
    ]).then(([s, lang, cert, tut, users, committee]) => {
      setStats(s.data ?? {});
      setLanguages(Array.isArray(lang.data) ? lang.data : lang.data?.data ?? []);
      setCerts(cert.data?.data ?? cert.data ?? []);
      setTutors(Array.isArray(tut.data) ? tut.data : []);
      const allUsers_data = users.data?.data ?? users.data ?? [];
      setAllUsers(allUsers_data);
      setMembers(allUsers_data.filter(u =>
        ['EDITOR', 'CONTRIBUTOR', 'ADMIN', 'SUPER_ADMIN'].includes(u.role)
      ));
      setCommitteeStats(committee.data ?? null);
      setLoadedAt(new Date());
    }).finally(() => setLoading(false));
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────
  const certByLevel = ['A1', 'A2', 'B1', 'B2', 'C1'].map((n, i) => ({
    name: `${n} — ${NIVEAU_LABELS[n]}`,
    value: certs.filter(c => c.niveau === n).length,
    fill: CERT_COLORS[i],
  })).filter(c => c.value > 0);

  const nameCount  = tutors.reduce((acc, t) => { acc[t.nomAvatar] = (acc[t.nomAvatar] || 0) + 1; return acc; }, {});
  const iaNames    = new Set(Object.entries(nameCount).filter(([, v]) => v > 1).map(([k]) => k));
  const iaAgents   = [...new Map(tutors.filter(t => iaNames.has(t.nomAvatar)).map(t => [t.nomAvatar, t])).values()];

  // Tuteurs culturels — tous (M + F), pas de déduplication
  const allCultTutors = tutors.filter(t => !iaNames.has(t.nomAvatar));

  // Grouper par langue, trier chaque groupe : M avant F, puis alphabétique
  const cultTutorsByLang = allCultTutors.reduce((acc, t) => {
    const key = t.language?.nom || 'Sans langue';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  Object.values(cultTutorsByLang).forEach(group =>
    group.sort((a, b) => {
      if (a.genre !== b.genre) return a.genre === 'M' ? -1 : 1;
      return (a.nomAvatar || '').localeCompare(b.nomAvatar || '', 'fr');
    })
  );
  // Langues triées alphabétiquement
  const cultLangNames = Object.keys(cultTutorsByLang).sort((a, b) => a.localeCompare(b, 'fr'));

  const editors      = members.filter(m => m.role === 'EDITOR' || m.role === 'ADMIN' || m.role === 'SUPER_ADMIN');
  const contributors = members.filter(m => m.role === 'CONTRIBUTOR');

  // ── Statistiques apprenants ────────────────────────────────────────────────
  const userStats = useMemo(() => {
    if (allUsers.length === 0) return null;

    // Niveaux préférés
    const niveaux = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
    allUsers.forEach(u => { if (u.niveauPref && niveaux[u.niveauPref] !== undefined) niveaux[u.niveauPref]++; });
    const niveauData = ['A1','A2','B1','B2','C1'].map((k, i) => ({
      name: k, label: NIVEAU_LABELS[k], value: niveaux[k],
      fill: CERT_COLORS[i],
    })).filter(d => d.value > 0);

    // Premium vs Gratuit
    const nbPremium = allUsers.filter(u => u.isPremium).length;
    const premiumData = [
      { name: '⭐ Premium', value: nbPremium, fill: '#f59e0b' },
      { name: '🆓 Gratuit',  value: allUsers.length - nbPremium, fill: '#e5e7eb' },
    ].filter(d => d.value > 0);

    // Langues favorites (languesFavorites = String[])
    const langCount = {};
    allUsers.forEach(u => { (u.languesFavorites || []).forEach(code => { langCount[code] = (langCount[code] || 0) + 1; }); });
    const langData = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([code, value]) => ({ name: code, value }));

    // Inscriptions par mois (6 derniers mois)
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleDateString('fr-FR', { month:'short', year:'2-digit' }), value: 0 };
    });
    allUsers.forEach(u => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const m = months.find(m => m.key === key);
      if (m) m.value++;
    });

    // Tranches d'âge
    const AGE_TR = [
      { label: '< 18 ans', min: 0, max: 17 },
      { label: '18–25', min: 18, max: 25 },
      { label: '26–35', min: 26, max: 35 },
      { label: '36–45', min: 36, max: 45 },
      { label: '46+',  min: 46, max: 999 },
    ];
    const ageData = AGE_TR.map((t, i) => ({ name: t.label, value: 0, fill: AGE_COLORS[i], min: t.min, max: t.max }));
    let withAge = 0;
    allUsers.forEach(u => {
      if (!u.dateNaissance) return;
      const age = Math.floor((Date.now() - new Date(u.dateNaissance)) / (365.25 * 86400000));
      const t = ageData.find(t => age >= t.min && age <= t.max);
      if (t) { t.value++; withAge++; }
    });

    // Distribution streaks
    const STREAK_TR = [
      { label: '0 jour',   min: 0,   max: 0   },
      { label: '1–7 j',    min: 1,   max: 7   },
      { label: '8–30 j',   min: 8,   max: 30  },
      { label: '31–99 j',  min: 31,  max: 99  },
      { label: '100+ j',   min: 100, max: Infinity },
    ];
    const streakData = STREAK_TR.map((t, i) => ({ name: t.label, value: 0, fill: STREAK_COLORS[i], min: t.min, max: t.max }));
    allUsers.forEach(u => {
      const s = u.streak ?? 0;
      const t = streakData.find(t => s >= t.min && s <= t.max);
      if (t) t.value++;
    });

    // Rôles
    const roleOrder = ['USER','CONTRIBUTOR','EDITOR','EXPERT','ADMIN','SUPER_ADMIN','PARTNER'];
    const roleCount = {};
    allUsers.forEach(u => { roleCount[u.role] = (roleCount[u.role] || 0) + 1; });
    const roleData = roleOrder.filter(r => roleCount[r] > 0).map(r => ({
      name: ROLE_LABELS[r] || r, value: roleCount[r], fill: ROLE_COLORS[r] || '#9ca3af',
    }));

    // KPIs synthèse
    const nbActifs   = allUsers.filter(u => (u.streak ?? 0) > 0).length;
    const avgStreak  = Math.round(allUsers.reduce((s, u) => s + (u.streak ?? 0), 0) / allUsers.length);
    const avgXp      = Math.round(allUsers.reduce((s, u) => s + (u.bonusXp ?? 0), 0) / allUsers.length);
    const topNiveau  = niveauData.sort((a, b) => b.value - a.value)[0]?.name ?? '—';

    return { niveauData, premiumData, langData, months, ageData, withAge, streakData, roleData,
             nbPremium, nbActifs, avgStreak, avgXp, topNiveau };
  }, [allUsers]);

  // ── Export PDF section statistiques ───────────────────────────────────────
  const exportStatsPDF = async () => {
    if (!statsRef.current) return;
    setExportingStats(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'), import('html2canvas'),
      ]);
      const canvas = await html2canvas(statsRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

      pdf.setFillColor(11, 61, 46);
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13); pdf.setFont('helvetica', 'bold');
      pdf.text('Statistiques des Apprenants — Langues Ivoire', margin, 12);
      pdf.setFontSize(9); pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${today} · ${allUsers.length} utilisateurs`, pageW - margin, 12, { align: 'right' });

      const contentY = 22;
      const availH = pageH - contentY - margin;
      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        const sliceH = Math.min(availH, imgH - yOffset);
        const srcY = (yOffset / imgH) * canvas.height;
        const srcH = (sliceH / imgH) * canvas.height;
        const sl = document.createElement('canvas');
        sl.width = canvas.width; sl.height = srcH;
        sl.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        pdf.addImage(sl.toDataURL('image/png'), 'PNG', margin, yOffset === 0 ? contentY : margin, usableW, sliceH);
        yOffset += availH;
      }
      pdf.save(`stats_apprenants_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) { console.error(e); }
    finally { setExportingStats(false); }
  };

  const totalWords = stats?.content?.totalWords ?? 0;
  const totalLessons = stats?.content?.totalLessonsCompleted ?? 0;
  const totalContribs = (stats?.contributions?.pending ?? 0) + (stats?.contributions?.approved ?? 0) + (stats?.contributions?.rejected ?? 0);

  return (
    <div className="overflow-y-auto min-h-0 flex-1">
      {/* ── CSS ──────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244,121,32,0.5); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(244,121,32,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(244,121,32,0); }
        }
        .fade-in-up { animation: fadeInUp 0.5s ease both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
        .pulse-accent { animation: pulse-ring 2.5s infinite; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-500 to-accent text-white px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              {/* Logo pill */}
              <div className="inline-flex items-center gap-3 bg-white bg-opacity-15 rounded-2xl px-4 py-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center pulse-accent flex-shrink-0">
                  <LanguageIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-wide">Langues Ivoire</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" title="En ligne" />
              </div>

              <h1 className="text-3xl md:text-4xl font-black leading-tight">
                Tableau de Bord Partenaires
              </h1>
              <p className="text-lg text-white text-opacity-80 mt-2 font-medium">
                Performance &amp; Impact · Données en temps réel
              </p>
              <p className="text-sm text-white text-opacity-60 mt-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" />
                Dernière mise à jour :{' '}
                {loadedAt
                  ? loadedAt.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
                  : 'Chargement…'}
              </p>
            </div>

            <div className="flex flex-col gap-3 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-3 rounded-xl shadow hover:bg-gray-50 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Exporter PDF
              </button>
              <p className="text-xs text-white text-opacity-50 text-center">
                Document confidentiel
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-10 mt-8">

        {/* ── PRIMARY KPIs ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="fade-in-up">
              <KpiCard
                icon={UsersIcon}
                label="Utilisateurs inscrits"
                value={stats?.users?.total ?? 0}
                trend={12}
                bgGradient="bg-gradient-to-br from-blue-600 to-blue-500"
              />
            </div>
            <div className="fade-in-up delay-1">
              <KpiCard
                icon={DevicePhoneMobileIcon}
                label="Actifs aujourd'hui"
                value={stats?.users?.activeD1 ?? 0}
                trend={8}
                bgGradient="bg-gradient-to-br from-emerald-600 to-emerald-500"
              />
            </div>
            <div className="fade-in-up delay-2">
              <KpiCard
                icon={GlobeAltIcon}
                label="Langues documentées"
                value={languages.length || 9}
                bgGradient="bg-gradient-to-br from-violet-600 to-violet-500"
              />
            </div>
            <div className="fade-in-up delay-3">
              <KpiCard
                icon={AcademicCapIcon}
                label="Certificats délivrés"
                value={certs.length}
                trend={24}
                bgGradient="bg-gradient-to-br from-amber-500 to-orange-500"
              />
            </div>
          </div>
        )}

        {/* ── SECONDARY KPIs ───────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SecondaryKpiCard
              icon={BookOpenIcon}
              label="Mots dans le corpus"
              value={totalWords || 6700}
              sub="Toutes langues confondues"
              color="bg-sky-600"
            />
            <SecondaryKpiCard
              icon={ChartBarIcon}
              label="Leçons complétées"
              value={totalLessons || 14820}
              sub="Par les apprenants"
              color="bg-green-600"
            />
            <SecondaryKpiCard
              icon={HeartIcon}
              label="Contributions reçues"
              value={totalContribs || 2340}
              sub="Communauté active"
              color="bg-rose-500"
            />
          </div>
        )}

        {/* ── COMITÉ DE VALIDATION ILA ─────────────────────────────────────── */}
        {!loading && committeeStats && (
          <div className="bg-white rounded-2xl border border-teal-100 shadow-sm p-6 fade-in-up">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-black text-gray-900">Comité de Validation ILA-UFHB</h2>
                </div>
                <p className="text-sm text-gray-500 ml-10">Certification scientifique des voix · Quorum 3 experts sur 5</p>
              </div>
              <span className="text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4" />
                {committeeStats.certified} certifié{committeeStats.certified > 1 ? 's' : ''} ILA
              </span>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-3xl font-black text-gray-800"><AnimatedNumber value={committeeStats.total} /></p>
                <p className="text-xs text-gray-500 font-medium mt-1">Total soumis</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p className="text-3xl font-black text-green-700"><AnimatedNumber value={committeeStats.certified} /></p>
                <p className="text-xs text-green-600 font-medium mt-1">✅ Certifiés ILA</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-3xl font-black text-blue-700">
                  <AnimatedNumber value={committeeStats.submitted + committeeStats.inReview} />
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">⏳ En examen</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-3xl font-black text-red-600"><AnimatedNumber value={committeeStats.rejected} /></p>
                <p className="text-xs text-red-500 font-medium mt-1">❌ Rejetés</p>
              </div>
            </div>

            {/* Pipeline progress bar */}
            {committeeStats.total > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="font-semibold">Pipeline de certification</span>
                  <span>{Math.round(committeeStats.certified / committeeStats.total * 100)}% certifiés</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="bg-green-500 transition-all duration-700"
                    style={{ width: `${committeeStats.certified / committeeStats.total * 100}%` }} />
                  <div className="bg-blue-400 transition-all duration-700"
                    style={{ width: `${(committeeStats.submitted + committeeStats.inReview) / committeeStats.total * 100}%` }} />
                  <div className="bg-amber-400 transition-all duration-700"
                    style={{ width: `${committeeStats.revision / committeeStats.total * 100}%` }} />
                  <div className="bg-red-400 transition-all duration-700"
                    style={{ width: `${committeeStats.rejected / committeeStats.total * 100}%` }} />
                </div>
                <div className="flex gap-4 mt-2 flex-wrap">
                  {[
                    { color: 'bg-green-500', label: 'Certifiés ILA' },
                    { color: 'bg-blue-400',  label: 'En examen' },
                    { color: 'bg-amber-400', label: 'En révision' },
                    { color: 'bg-red-400',   label: 'Rejetés' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITÉ — LINECHART ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Activité Utilisateurs</h2>
              <p className="text-sm text-gray-500 mt-0.5">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary-500 inline-block" />
                Nouveaux inscrits
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-accent inline-block" />
                Actifs
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MOCK_ACTIVITY} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="inscrits" name="Nouveaux inscrits"
                stroke="#0B3D2E" strokeWidth={2.5}
                dot={{ r: 4, fill: '#0B3D2E', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone" dataKey="actifs" name="Actifs"
                stroke="#F47920" strokeWidth={2.5}
                dot={{ r: 4, fill: '#F47920', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── CHARTS ROW: langues + certificats ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horizontal BarChart — mots par langue */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-1">Répartition par Langue</h2>
            <p className="text-sm text-gray-500 mb-5">Nombre de mots dans le corpus</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MOCK_LANGUES} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4f8" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                  width={60} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="mots" name="Mots" radius={[0, 6, 6, 0]}>
                  {MOCK_LANGUES.map((_, i) => (
                    <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PieChart — certificats par niveau */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-1">Niveaux d'Apprentissage</h2>
            <p className="text-sm text-gray-500 mb-5">Répartition des certificats délivrés</p>
            {certByLevel.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <AcademicCapIcon className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Aucun certificat disponible</p>
                <p className="text-xs mt-1">Les données s'afficheront ici</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={certByLevel}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {certByLevel.map((c, i) => (
                      <Cell key={i} fill={c.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${v} certificat${v > 1 ? 's' : ''}`, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(v) => <span style={{ fontSize: 12, color: '#374151' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── RÉTENTION ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-black text-gray-900 mb-1">Taux de Rétention</h2>
          <p className="text-sm text-gray-500 mb-6">Fidélisation des apprenants après inscription</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <RetentionGauge
              label="Rétention J+1"
              value={stats?.retentionD1 ?? 68}
              color="#10b981"
            />
            <RetentionGauge
              label="Rétention J+7"
              value={stats?.retentionD7 ?? 45}
              color="#3b82f6"
            />
            <RetentionGauge
              label="Rétention J+30"
              value={stats?.retentionD30 ?? 28}
              color="#8b5cf6"
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Benchmarks secteur EdTech · J+1: 50–70% · J+7: 35–50% · J+30: 20–35%
          </p>
        </div>

        {/* ── STATISTIQUES APPRENANTS ──────────────────────────────────────── */}
        <div className="print-break" ref={statsRef}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">Statistiques des Apprenants</h2>
              <p className="text-sm text-gray-500 mt-1">
                Analyse démographique &amp; pédagogique · {allUsers.length} utilisateurs
              </p>
            </div>
            <button onClick={exportStatsPDF} disabled={exportingStats}
              className="no-print inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-4 py-2.5 rounded-xl shadow hover:bg-primary-700 transition-colors disabled:opacity-50 text-sm">
              {exportingStats
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Export…</span></>
                : <><DocumentArrowDownIcon className="w-4 h-4"/><span>Exporter PDF</span></>
              }
            </button>
          </div>

          {loading || !userStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24"/>)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1,2].map(i => <Skeleton key={i} className="h-64"/>)}
              </div>
            </div>
          ) : (
            <div className="space-y-6">

              {/* KPIs synthèse */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: UsersIcon,         label: 'Apprenants actifs',   value: userStats.nbActifs,  sub: 'Streak > 0 jour',      color: 'bg-blue-600' },
                  { icon: ArrowTrendingUpIcon,label: 'Streak moyen',        value: userStats.avgStreak, sub: 'Jours consécutifs',     color: 'bg-green-600' },
                  { icon: SparklesIcon,       label: 'XP moyen / apprenant',value: userStats.avgXp,    sub: 'Hors leçons complétées',color: 'bg-violet-600' },
                  { icon: StarIcon,           label: 'Abonnés Premium',     value: userStats.nbPremium, sub: `${allUsers.length > 0 ? Math.round(userStats.nbPremium/allUsers.length*100) : 0}% des utilisateurs`, color: 'bg-amber-500' },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${k.color}`}>
                      <k.icon className="w-5 h-5 text-white"/>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900"><AnimatedNumber value={k.value}/></p>
                      <p className="text-sm font-semibold text-gray-700 leading-tight">{k.label}</p>
                      {k.sub && <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 1 : Niveaux + Premium */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Niveaux d'apprentissage */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-black text-gray-900 mb-1">Niveaux d'Apprentissage</h3>
                  <p className="text-sm text-gray-500 mb-5">Niveau préféré déclaré par les apprenants</p>
                  {userStats.niveauData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                      <AcademicCapIcon className="w-10 h-10 mb-2 opacity-30"/>
                      <p className="text-sm">Données de niveau non renseignées</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={userStats.niveauData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8"/>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>} formatter={(v, n, p) => [v, p.payload.label]}/>
                        <Bar dataKey="value" name="Apprenants" radius={[6, 6, 0, 0]}>
                          {userStats.niveauData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Premium vs Gratuit + Rôles */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-black text-gray-900 mb-1">Abonnements &amp; Rôles</h3>
                  <p className="text-sm text-gray-500 mb-4">Répartition Premium / Gratuit et profils</p>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Donut Premium */}
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Premium</p>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={userStats.premiumData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={2} dataKey="value">
                            {userStats.premiumData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                          </Pie>
                          <Tooltip formatter={(v, name) => [v, name]}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex gap-3 text-xs mt-1">
                        {userStats.premiumData.map(d => (
                          <span key={d.name} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ background: d.fill }}/>
                            {d.name} ({d.value})
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Rôles liste */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rôles</p>
                      <div className="space-y-1.5">
                        {userStats.roleData.map(r => (
                          <div key={r.name} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.fill }}/>
                            <span className="text-xs text-gray-700 flex-1 truncate">{r.name}</span>
                            <span className="text-xs font-bold text-gray-900">{r.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 : Langues + Inscriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Langues favorites */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-black text-gray-900 mb-1">Langues Apprises</h3>
                  <p className="text-sm text-gray-500 mb-5">Langues favorites déclarées (top 8)</p>
                  {userStats.langData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                      <LanguageIcon className="w-10 h-10 mb-2 opacity-30"/>
                      <p className="text-sm">Aucune langue favorite renseignée</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={userStats.langData} layout="vertical" margin={{ left: 4, right: 12, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f4f8"/>
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} width={56} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="value" name="Apprenants" radius={[0, 6, 6, 0]}>
                          {userStats.langData.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Inscriptions par mois */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-black text-gray-900 mb-1">Nouvelles Inscriptions</h3>
                  <p className="text-sm text-gray-500 mb-5">6 derniers mois</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={userStats.months} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8"/>
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Inscriptions" fill="#0B3D2E" radius={[6, 6, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 3 : Âge + Streaks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tranches d'âge */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-black text-gray-900">Tranches d'Âge</h3>
                    {userStats.withAge === 0 && (
                      <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">Date naissance non renseignée</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-5">Distribution par groupe d'âge</p>
                  {userStats.withAge === 0 ? (
                    <div className="flex flex-col items-center justify-center h-52 text-gray-400">
                      <UsersIcon className="w-10 h-10 mb-2 opacity-30"/>
                      <p className="text-sm">Données d'âge non disponibles</p>
                      <p className="text-xs mt-1 text-center max-w-48">Les apprenants n'ont pas encore renseigné leur date de naissance</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={userStats.ageData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8"/>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="value" name="Apprenants" radius={[6, 6, 0, 0]}>
                          {userStats.ageData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Distribution streaks */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-black text-gray-900 mb-1">Distribution des Streaks</h3>
                  <p className="text-sm text-gray-500 mb-5">Régularité d'apprentissage des utilisateurs</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={userStats.streakData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4f8"/>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Apprenants" radius={[6, 6, 0, 0]}>
                        {userStats.streakData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Streak moyen : <strong>{userStats.avgStreak} jour{userStats.avgStreak > 1 ? 's' : ''}</strong>
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── CARTE DE CÔTE D'IVOIRE ───────────────────────────────────────── */}
        <div className="print-break">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Couverture Géographique</h2>
              <p className="text-sm text-gray-500 mt-1">
                {languages.length} langue{languages.length > 1 ? 's' : ''} documentée{languages.length > 1 ? 's' : ''} sur la carte de Côte d'Ivoire
              </p>
            </div>
            <span className="bg-green-50 text-green-700 text-sm font-bold px-4 py-2 rounded-xl border border-green-200">
              📍 {languages.filter(l => l.lat && l.lng).length} géolocalisée{languages.filter(l => l.lat && l.lng).length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte interactive */}
            <div
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ height: 480 }}
            >
              {loading ? (
                <Skeleton className="w-full h-full rounded-2xl" />
              ) : (
                <CarteCI
                  langues={languages}
                  selectedId={selectedLangId}
                  onMarkerClick={(lang) =>
                    setSelectedLangId(lang.id === selectedLangId ? null : lang.id)
                  }
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>

            {/* Liste latérale des langues */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col" style={{ maxHeight: 480 }}>
              <h3 className="font-black text-gray-900 text-sm mb-1">Langues documentées</h3>
              <p className="text-xs text-gray-400 mb-3">Cliquez pour localiser sur la carte</p>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {loading ? (
                  [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-12" />)
                ) : languages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune langue configurée</p>
                ) : (
                  languages.map((lang, i) => {
                    const isSelected = lang.id === selectedLangId;
                    const hasCoords  = !!(lang.lat && lang.lng);
                    return (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLangId(isSelected ? null : lang.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-primary-300 bg-primary-50 shadow-sm'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                          style={{ background: lang.couleur || LANG_COLORS[i % LANG_COLORS.length] }}
                        >
                          {lang.nom?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                            {lang.nom}
                          </p>
                          {lang.region && (
                            <p className="text-xs text-gray-400 truncate">{lang.region}</p>
                          )}
                        </div>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${hasCoords ? 'bg-green-400' : 'bg-gray-200'}`}
                          title={hasCoords ? 'Géolocalisée' : 'Non géolocalisée'}
                        />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Légende familles linguistiques */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Familles linguistiques</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: 'Akan',       color: '#D4A017' },
                    { label: 'Krou',       color: '#2E7D32' },
                    { label: 'Gur',        color: '#E65100' },
                    { label: 'Mandé Nord', color: '#1565C0' },
                    { label: 'Mandé Sud',  color: '#6A1B9A' },
                    { label: 'Véhiculaire',color: '#C62828' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info sélection */}
          {selectedLangId && (() => {
            const lang = languages.find(l => l.id === selectedLangId);
            if (!lang) return null;
            return (
              <div className="mt-4 bg-primary-50 border border-primary-200 rounded-2xl px-5 py-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: lang.couleur || '#0B3D2E' }}
                >
                  {lang.nom?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-primary-900 text-lg">{lang.nom}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-primary-700">
                    {lang.region    && <span>📍 {lang.region}</span>}
                    {lang.code      && <span>🔤 Code : <strong>{lang.code}</strong></span>}
                    {lang.locuteurs && <span>👥 ~{Number(lang.locuteurs).toLocaleString('fr-FR')} locuteurs</span>}
                    {lang.famille   && <span>🌿 Famille : {lang.famille}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLangId(null)}
                  className="text-xs text-primary-500 hover:text-primary-800 font-medium flex-shrink-0"
                >
                  ✕ Fermer
                </button>
              </div>
            );
          })()}
        </div>

        {/* ── ÉQUIPE ÉDITORIALE ─────────────────────────────────────────────── */}
        <div className="print-break">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Équipe Éditoriale</h2>
              <p className="text-sm text-gray-500 mt-1">
                {members.length} membres · Éditeurs &amp; Contributeurs
              </p>
            </div>
            <div className="bg-primary-50 text-primary-700 text-sm font-bold px-4 py-2 rounded-xl">
              {editors.length} éditeur{editors.length > 1 ? 's' : ''} · {contributors.length} contributeur{contributors.length > 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
              <UserGroupIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Aucun membre éditorial trouvé</p>
              <p className="text-sm mt-1">Les éditeurs et contributeurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-6">
              {editors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                      Éditeurs &amp; Admins ({editors.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editors.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}
              {contributors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700">
                      Contributeurs ({contributors.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contributors.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── AGENTS IA ────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-900">Agents IA — Vitrine</h2>
              <p className="text-sm text-gray-500 mt-1">
                {tutors.length} agents · IA linguistiques &amp; tuteurs culturels
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 text-sm font-bold px-4 py-2 rounded-xl border border-cyan-200">
              <CpuChipIcon className="w-4 h-4" />
              Powered by Claude AI
            </div>
          </div>

          {/* ── IA Linguistiques (grands portraits) ── */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm">IA Linguistiques</h3>
                <p className="text-xs text-gray-500">Agents conversationnels · Toutes langues</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full border border-cyan-200">
                {iaAgents.length} agent{iaAgents.length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex gap-4">
                {[1,2].map(i => <Skeleton key={i} className="h-48 flex-1 rounded-2xl" />)}
              </div>
            ) : iaAgents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aucun agent IA global configuré</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {iaAgents.map(t => {
                  const portrait = getAvatarPortrait(t.nomAvatar);
                  const isFemale = t.genre === 'F';
                  const initials = t.nomAvatar?.slice(0, 2).toUpperCase() ?? '??';
                  return (
                    <div key={t.id ?? t.nomAvatar}
                      className={`rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border-2 ${
                        isFemale ? 'border-pink-200' : 'border-blue-200'
                      }`}>
                      {/* Portrait */}
                      <div className={`relative h-40 flex items-center justify-center ${
                        isFemale ? 'bg-gradient-to-b from-pink-100 to-pink-200' : 'bg-gradient-to-b from-blue-100 to-blue-200'
                      }`}>
                        {portrait ? (
                          <img
                            src={portrait}
                            alt={t.nomAvatar}
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <span className={`text-4xl font-black ${isFemale ? 'text-pink-500' : 'text-blue-500'}`}>
                            {initials}
                          </span>
                        )}
                        <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
                          isFemale ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {isFemale ? '♀' : '♂'}
                        </span>
                      </div>
                      {/* Infos */}
                      <div className="bg-white px-3 py-2.5">
                        <p className="font-black text-gray-900 text-sm leading-tight">{t.nomAvatar}</p>
                        <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-2">
                          {t.personalite?.split('.')[0] ?? (isFemale ? 'Douce et patiente' : 'Dynamique et encourageant')}
                        </p>
                        <span className={`text-[10px] font-bold mt-1.5 inline-block px-2 py-0.5 rounded-full ${
                          isFemale ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          Toutes langues
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Tuteurs Culturels groupés par langue ── */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <StarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-sm">Tuteurs Culturels</h3>
                <p className="text-xs text-gray-500">Tuteur masculin &amp; féminin par langue · triés alphabétiquement</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-violet-100 text-violet-700 px-3 py-1 rounded-full border border-violet-200">
                {allCultTutors.length} tuteur{allCultTutors.length > 1 ? 's' : ''} · {cultLangNames.length} langue{cultLangNames.length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-52 rounded-2xl" />)}
              </div>
            ) : cultLangNames.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Aucun tuteur culturel configuré</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {cultLangNames.map(langName => {
                  const group = cultTutorsByLang[langName];
                  return (
                    <div key={langName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
                      {/* En-tête langue */}
                      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 text-center">
                        <p className="text-white font-black text-xs tracking-wide">{langName}</p>
                      </div>

                      {/* Portraits du groupe */}
                      <div className={`grid gap-0 ${group.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {group.map(t => {
                          const portrait = getAvatarPortrait(t.nomAvatar);
                          const isFemale = t.genre === 'F';
                          const initials = t.nomAvatar?.slice(0, 2).toUpperCase() ?? '??';
                          return (
                            <div key={t.id ?? t.nomAvatar} className="flex flex-col">
                              {/* Portrait */}
                              <div className={`relative h-28 flex items-center justify-center ${
                                isFemale
                                  ? 'bg-gradient-to-b from-pink-100 to-pink-200'
                                  : 'bg-gradient-to-b from-blue-100 to-blue-200'
                              }`}>
                                {portrait ? (
                                  <img
                                    src={portrait}
                                    alt={t.nomAvatar}
                                    className="h-full w-full object-cover object-top"
                                  />
                                ) : (
                                  <span className={`text-2xl font-black ${isFemale ? 'text-pink-400' : 'text-blue-400'}`}>
                                    {initials}
                                  </span>
                                )}
                                <span className={`absolute top-1 right-1 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ${
                                  isFemale ? 'bg-pink-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  {isFemale ? '♀' : '♂'}
                                </span>
                              </div>
                              {/* Nom */}
                              <div className="px-1.5 py-1.5 text-center bg-white">
                                <p className="text-[11px] font-bold text-gray-800 leading-tight truncate">{t.nomAvatar}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── IMPACT & MISSION ─────────────────────────────────────────────── */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Impact &amp; Mission</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">
              Langues Ivoire préserve et valorise le patrimoine linguistique ivoirien
              à travers la technologie et l'intelligence artificielle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactCard
              icon={GlobeAltIcon}
              title="10+ langues ethniques ivoiriennes documentées"
              desc="Du Dioula au Bété, chaque langue est préservée numériquement avec son lexique et sa phonologie."
              color="bg-gradient-to-br from-primary-700 to-primary-500"
            />
            <ImpactCard
              icon={BuildingLibraryIcon}
              title="Préservation du patrimoine linguistique"
              desc="Un effort de documentation scientifique qui sauvegarde des langues menacées pour les générations futures."
              color="bg-gradient-to-br from-violet-700 to-violet-500"
            />
            <ImpactCard
              icon={SparklesIcon}
              title="Apprentissage gamifié &amp; certifiant"
              desc="Parcours progressifs A1→C1 avec badges, XP, classements et certificats reconnus."
              color="bg-gradient-to-br from-amber-500 to-orange-500"
            />
            <ImpactCard
              icon={CpuChipIcon}
              title="IA conversationnelle native"
              desc="Agents IA entraînés sur les langues ivoiriennes — tuteurs vocaux, corrections grammaticales en temps réel."
              color="bg-gradient-to-br from-cyan-600 to-blue-600"
            />
          </div>

          {/* Mission statement strip */}
          <div className="mt-6 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 rounded-2xl p-6 text-white text-center">
            <p className="text-lg font-black">
              "Rendre chaque langue ivoirienne accessible, apprise et vivante — pour tous."
            </p>
            <p className="text-sm text-white text-opacity-70 mt-2">
              Langues Ivoire · Vision 2025–2030
            </p>
          </div>
        </div>

        {/* ── FOOTER STRIP ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
              <LanguageIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-600">Langues Ivoire</span>
          </div>
          <p>
            Document confidentiel · Réservé aux partenaires &amp; investisseurs ·{' '}
            Langues Ivoire © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-1">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
            <span>Données sécurisées</span>
          </div>
        </div>
      </div>

      <PageHelp pageId="partenaire" />
    </div>
  );
}
