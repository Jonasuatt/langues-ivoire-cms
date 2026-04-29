import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon, BookOpenIcon, ChatBubbleLeftRightIcon, AcademicCapIcon,
  UserGroupIcon, UsersIcon, ArrowRightOnRectangleIcon,
  MusicalNoteIcon, VideoCameraIcon, MicrophoneIcon, ShieldCheckIcon,
  TrophyIcon, BellIcon, GlobeAltIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

// Labels en français pour chaque rôle
export const ROLE_LABELS = {
  USER: 'Utilisateur',
  CONTRIBUTOR: 'Contributeur',
  EDITOR: 'Éditeur',
  ADMIN: 'Administrateur',
  SUPER_ADMIN: 'Super-Administrateur',
};

// Couleur du badge de rôle
export const ROLE_COLORS = {
  USER: 'bg-gray-100 text-gray-600',
  CONTRIBUTOR: 'bg-blue-100 text-blue-700',
  EDITOR: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
  SUPER_ADMIN: 'bg-amber-100 text-amber-800',
};

const isAdmin = (role) => ['ADMIN', 'SUPER_ADMIN'].includes(role);
const isSuperAdmin = (role) => role === 'SUPER_ADMIN';

const NAV_SECTIONS = [
  {
    title: 'Contenu',
    items: [
      { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true },
      { to: '/vocabulary', label: 'Vocabulaire', icon: BookOpenIcon },
      { to: '/lessons', label: 'Leçons', icon: AcademicCapIcon },
      { to: '/cultural', label: 'Culture & Traditions', icon: SparklesIcon },
      { to: '/videos', label: 'Vidéos', icon: VideoCameraIcon },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/contributions', label: 'Contributions', icon: ChatBubbleLeftRightIcon },
      { to: '/audio-contributions', label: 'IA Linguistique', icon: MicrophoneIcon },
      { to: '/audio-upload', label: 'Import Audio', icon: MusicalNoteIcon },
    ],
  },
  {
    title: 'Intelligence Artificielle',
    items: [
      { to: '/tutors',           label: 'Tuteurs IA',       icon: UserGroupIcon },
      { to: '/agents-test',      label: 'Test Agents IA',   icon: SparklesIcon },
      { to: '/welcome-settings', label: 'Bienvenue & Sons', icon: MusicalNoteIcon },
    ],
  },
  {
    title: 'Paramètres App',
    items: [
      { to: '/langues',      label: 'Langues',          icon: GlobeAltIcon },
      { to: '/badges',       label: 'Badges & XP',      icon: TrophyIcon },
      { to: '/sos-phrases',  label: 'Phrases SOS',      icon: ExclamationTriangleIcon },
      { to: '/notifications',label: 'Notifications',    icon: BellIcon },
    ],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [
      { to: '/users', label: 'Utilisateurs', icon: UsersIcon },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const visibleSections = NAV_SECTIONS.filter(s => !s.adminOnly || isAdmin(user?.role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-primary-500 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Langues Ivoire" className="w-12 h-12 object-contain rounded-lg" />
            <div>
              <p className="font-bold text-sm leading-tight">LANGUES IVOIRE</p>
              <p className="text-xs text-white/60">Back-Office CMS</p>
            </div>
          </div>
        </div>

        {/* Navigation par sections */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {visibleSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-3 mb-1">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, exact }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Utilisateur connecté */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.prenom} {user?.nom}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {isSuperAdmin(user?.role) && <ShieldCheckIcon className="w-3 h-3 text-amber-300" />}
                <p className="text-xs text-white/60 truncate">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
