import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, Suspense } from 'react';
import { supportAPI } from '../services/api';
import ErrorBoundary from './ErrorBoundary';
import {
  HomeIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon, VideoCameraIcon,
  ChatBubbleLeftRightIcon, CpuChipIcon, MicrophoneIcon,
  UserGroupIcon, BeakerIcon, MusicalNoteIcon,
  GlobeAltIcon, TrophyIcon, BellIcon,
  HeartIcon, BuildingLibraryIcon, UsersIcon,
  ArrowRightOnRectangleIcon, ExclamationTriangleIcon, UserCircleIcon,
  LanguageIcon, PhotoIcon, EnvelopeIcon, QuestionMarkCircleIcon,
  BanknotesIcon, MapPinIcon, PresentationChartLineIcon,
  CalculatorIcon, ShieldCheckIcon, CircleStackIcon,
} from '@heroicons/react/24/outline';

export const ROLE_LABELS = {
  USER:        'Utilisateur',
  CONTRIBUTOR: 'Contributeur',
  EDITOR:      'Éditeur',
  EXPERT:      'Expert ILA',
  TEACHER:     'Enseignant',
  PARTNER:     'Partenaire',
  ADMIN:       'Administrateur',
  SUPER_ADMIN: 'Super-Administrateur',
};

export const ROLE_COLORS = {
  USER:        'bg-gray-100 text-gray-600',
  CONTRIBUTOR: 'bg-blue-100 text-blue-700',
  EDITOR:      'bg-purple-100 text-purple-700',
  EXPERT:      'bg-teal-100 text-teal-700',
  TEACHER:     'bg-indigo-100 text-indigo-700',
  PARTNER:     'bg-emerald-100 text-emerald-700',
  ADMIN:       'bg-red-100 text-red-700',
  SUPER_ADMIN: 'bg-amber-100 text-amber-800',
};

const NAV_SECTIONS = [
  {
    items: [
      { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true },
      { to: '/cerveau', label: '🧠 Cerveau Numérique', icon: CircleStackIcon },
      { to: '/dictionary', label: 'Dictionnaire', icon: LanguageIcon },
      { to: '/alphabet-langues', label: 'Alphabet des Langues', icon: LanguageIcon },
      { to: '/conjugation', label: 'Conjugaison', icon: BookOpenIcon },
      { to: '/vocabulary', label: 'Vocabulaire', icon: BookOpenIcon },
      { to: '/lessons', label: 'Leçons', icon: AcademicCapIcon },
      { to: '/cursus',    label: '🏫 Cursus Scolaire', icon: AcademicCapIcon },
      { to: '/programme', label: '📋 Programme',       icon: AcademicCapIcon },
      { to: '/fiches',    label: '📄 Fiches Pédag.',   icon: AcademicCapIcon },
      { to: '/cultural', label: 'Culture & Traditions', icon: SparklesIcon },
      { to: '/textes-recits', label: 'Textes & Récits', icon: BookOpenIcon },
      { to: '/image-galleries', label: "Galeries d'Images", icon: PhotoIcon },
      { to: '/sens-mots', label: 'Sens des Mots', icon: LanguageIcon },
      { to: '/videos', label: 'Vidéos', icon: VideoCameraIcon },
    ],
  },
  {
    group: 'COMMUNAUTÉ',
    items: [
      { to: '/contributions', label: 'Contributions', icon: ChatBubbleLeftRightIcon },
      { to: '/messages', label: 'Messages', icon: EnvelopeIcon },
      { to: '/certificates', label: 'Certificats', icon: AcademicCapIcon },
      { to: '/ia-linguistique', label: 'IA Linguistique', icon: CpuChipIcon },
      { to: '/voix-audio', label: 'Import Audio', icon: MicrophoneIcon },
    ],
  },
  {
    group: 'INTELLIGENCE ARTIFICIELLE',
    items: [
      { to: '/tutors', label: 'Tuteurs IA', icon: UserGroupIcon },
      { to: '/test-agents', label: 'Test Agents IA', icon: BeakerIcon },
      { to: '/bienvenue-sons', label: 'Bienvenue & Sons', icon: MusicalNoteIcon },
      { to: '/repetitor', label: '🦜 RÉPÉTO — Vocal ILA', icon: MicrophoneIcon, adminOnly: true },
    ],
  },
  {
    group: 'PARAMÈTRES APP',
    items: [
      { to: '/langues', label: 'Langues', icon: GlobeAltIcon },
      { to: '/carte-ci', label: 'Carte CI', icon: MapPinIcon },
      { to: '/badges', label: 'Badges & XP', icon: TrophyIcon },
      { to: '/phrases-sos', label: 'Phrases SOS', icon: ExclamationTriangleIcon },
      { to: '/phrases-utiles', label: 'Phrases Utiles', icon: ChatBubbleLeftRightIcon },
      { to: '/notifications', label: 'Notifications', icon: BellIcon },
      { to: '/premiers-secours', label: 'Premiers Secours', icon: HeartIcon },
      { to: '/civisme', label: 'Civisme', icon: BuildingLibraryIcon },
      { to: '/musee-tresors', label: 'Musée des Trésors', icon: SparklesIcon },
      { to: '/arbre-vocabulaire', label: 'Arbre à Palabres', icon: UserGroupIcon },
      { to: '/marche-dialogues', label: 'Au Marché', icon: ChatBubbleLeftRightIcon },
      { to: '/mathematiques', label: 'Mathématiques', icon: CalculatorIcon },
      { to: '/monnaie', label: 'Monnaie FCFA', icon: BanknotesIcon },
    ],
  },
  {
    group: 'PARTENAIRES',
    partnerOrAdmin: true,
    items: [
      { to: '/partenaire', label: 'Tableau Partenaires', icon: PresentationChartLineIcon, partnerOrAdmin: true },
      { to: '/institutions', label: 'Institutions & Partenaires', icon: BuildingLibraryIcon },
    ],
  },
  {
    group: 'FINANCE',
    adminOnly: true,
    items: [
      { to: '/finance', label: 'Finance', icon: BanknotesIcon, adminOnly: true },
    ],
  },
  {
    group: 'ADMINISTRATION',
    adminOnly: true,
    items: [
      { to: '/users', label: 'Utilisateurs', icon: UsersIcon, adminOnly: true },
      { to: '/validation-committee', label: 'Comité ILA', icon: ShieldCheckIcon, adminOnly: true },
      { to: '/rapport-editeurs', label: 'Rapport d\'activité', icon: PresentationChartLineIcon, adminOnly: true },
    ],
  },
  {
    group: 'AIDE',
    items: [
      { to: '/guide', label: 'Guide d\'utilisation', icon: QuestionMarkCircleIcon },
      { to: '/privacy', label: 'Politique de Confidentialité', icon: ShieldCheckIcon },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  // Sidebar fermée par défaut sur mobile (< 768px), ouverte sur desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleSidebar = () => setSidebarOpen(v => !v);
  // Ferme la sidebar quand on clique sur un lien (utile sur mobile)
  const handleNavClick = () => { if (window.innerWidth < 768) setSidebarOpen(false); };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isPartnerOrAdmin = isAdmin || user?.role === 'PARTNER';
  const isExpertOrAdmin  = isAdmin || user?.role === 'EXPERT';

  // Charge le nombre de messages non-lus (OUVERT) en polling toutes les 60s
  useEffect(() => {
    const loadUnread = () => {
      supportAPI.getAll({ statut: 'OUVERT', limit: 1 })
        .then(r => setUnreadMessages(r.data.total ?? r.data.data?.length ?? 0))
        .catch(() => {});
    };
    loadUnread();
    const timer = setInterval(loadUnread, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay sombre sur mobile quand le sidebar est ouvert */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 h-full
          w-64 flex-shrink-0 bg-primary-500 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}
      >
        {/* Logo + bouton fermeture */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Langues Ivoire" className="w-12 h-12 object-contain rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">LANGUES IVOIRE</p>
              <p className="text-xs text-white/60">Back-Office CMS</p>
            </div>
            {/* Bouton fermer (croix) — toujours visible dans le sidebar */}
            <button
              onClick={toggleSidebar}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Fermer le menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.filter(section =>
            (!section.adminOnly || isAdmin) &&
            (!section.partnerOrAdmin || isPartnerOrAdmin)
          ).map((section, sIdx) => (
            <div key={sIdx}>
              {section.group && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  {section.group}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items
                  .filter(item =>
                    (!item.adminOnly || isAdmin) &&
                    (!item.partnerOrAdmin || isPartnerOrAdmin) &&
                    (!item.expertOrAdmin || isExpertOrAdmin)
                  )
                  .map(({ to, label, icon: Icon, exact }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={exact}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{label}</span>
                      {to === '/messages' && unreadMessages > 0 && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {unreadMessages > 99 ? '99+' : unreadMessages}
                        </span>
                      )}
                    </NavLink>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Utilisateur connecté */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-white/60">{user?.role}</p>
            </div>
          </div>
          <NavLink
            to="/profile"
            onClick={handleNavClick}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-1"
          >
            <UserCircleIcon className="w-4 h-4" />
            Mon Profil
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Barre supérieure avec bouton hamburger — visible mobile toujours, desktop seulement si sidebar fermé */}
        <div className={`sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 ${sidebarOpen ? 'md:hidden' : ''}`}>
          <button
            onClick={toggleSidebar}
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors"
            title="Ouvrir le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.png" alt="" className="w-7 h-7 object-contain rounded" />
          <span className="font-bold text-sm text-primary-500 truncate">LANGUES IVOIRE CMS</span>
        </div>

        <ErrorBoundary>
          {/* La page arrive dans son propre module : le menu reste en place
              pendant le téléchargement, seul le contenu affiche l'attente. */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
