import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supportAPI } from '../services/api';
import {
  HomeIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon, VideoCameraIcon,
  ChatBubbleLeftRightIcon, CpuChipIcon, MicrophoneIcon,
  UserGroupIcon, BeakerIcon, MusicalNoteIcon,
  GlobeAltIcon, TrophyIcon, BellIcon,
  HeartIcon, BuildingLibraryIcon, UsersIcon,
  ArrowRightOnRectangleIcon, ExclamationTriangleIcon,
  LanguageIcon, PhotoIcon, EnvelopeIcon, QuestionMarkCircleIcon,
  BanknotesIcon, MapPinIcon, PresentationChartLineIcon,
  CalculatorIcon, ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export const ROLE_LABELS = {
  USER:        'Utilisateur',
  CONTRIBUTOR: 'Contributeur',
  EDITOR:      'Éditeur',
  EXPERT:      'Expert ILA',
  PARTNER:     'Partenaire',
  ADMIN:       'Administrateur',
  SUPER_ADMIN: 'Super-Administrateur',
};

export const ROLE_COLORS = {
  USER:        'bg-gray-100 text-gray-600',
  CONTRIBUTOR: 'bg-blue-100 text-blue-700',
  EDITOR:      'bg-purple-100 text-purple-700',
  EXPERT:      'bg-teal-100 text-teal-700',
  PARTNER:     'bg-emerald-100 text-emerald-700',
  ADMIN:       'bg-red-100 text-red-700',
  SUPER_ADMIN: 'bg-amber-100 text-amber-800',
};

const NAV_SECTIONS = [
  {
    items: [
      { to: '/', label: 'Tableau de bord', icon: HomeIcon, exact: true },
      { to: '/dictionary', label: 'Dictionnaire', icon: LanguageIcon },
      { to: '/alphabet-langues', label: 'Alphabet des Langues', icon: LanguageIcon },
      { to: '/conjugation', label: 'Conjugaison', icon: BookOpenIcon },
      { to: '/vocabulary', label: 'Vocabulaire', icon: BookOpenIcon },
      { to: '/lessons', label: 'Leçons', icon: AcademicCapIcon },
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
    ],
  },
  {
    group: 'AIDE',
    items: [
      { to: '/guide', label: 'Guide d\'utilisation', icon: QuestionMarkCircleIcon },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const handleLogout = () => { logout(); navigate('/login'); };

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
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
