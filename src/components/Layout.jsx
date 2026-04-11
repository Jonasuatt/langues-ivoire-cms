import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon, BookOpenIcon, ChatBubbleLeftRightIcon, AcademicCapIcon,
  UserGroupIcon, SparklesIcon, GlobeAltIcon, UsersIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true },
  { to: '/vocabulary', label: 'Vocabulaire', icon: BookOpenIcon },
  { to: '/contributions', label: 'Contributions', icon: ChatBubbleLeftRightIcon },
  { to: '/lessons', label: 'Leçons', icon: AcademicCapIcon },
  { to: '/tutors', label: 'Tuteurs IA', icon: UserGroupIcon },
  { to: '/cultural', label: 'Culture', icon: SparklesIcon },
  { to: '/users', label: 'Utilisateurs', icon: UsersIcon, adminOnly: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

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

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.filter(n => !n.adminOnly || user?.role === 'ADMIN').map(({ to, label, icon: Icon, exact }) => (
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
