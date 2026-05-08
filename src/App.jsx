import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';
import ContributionsPage from './pages/ContributionsPage';
import LessonsPage from './pages/LessonsPage';
import TutorsPage from './pages/TutorsPage';
import CulturalPage from './pages/CulturalPage';
import UsersPage from './pages/UsersPage';
import VoixAudioPage from './pages/VoixAudioPage';
import PremierSecoursPage from './pages/PremierSecoursPage';
import CivismePage from './pages/CivismePage';
import VideosPage from './pages/VideosPage';
import IALinguistiquePage from './pages/IALinguistiquePage';
import TestAgentsPage from './pages/TestAgentsPage';
import BienvenueEtSonsPage from './pages/BienvenueEtSonsPage';
import LanguesPage from './pages/LanguesPage';
import BadgesPage from './pages/BadgesPage';
import PhrasesSOSPage from './pages/PhrasesSOSPage';
import PhrasesUtilesPage from './pages/PhrasesUtilesPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR']}><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="vocabulary" element={<VocabularyPage />} />
          <Route path="contributions" element={<ContributionsPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="tutors" element={<TutorsPage />} />
          <Route path="cultural" element={<CulturalPage />} />
          <Route path="voix-audio" element={<VoixAudioPage />} />
          <Route path="premiers-secours" element={<PremierSecoursPage />} />
          <Route path="civisme" element={<CivismePage />} />
          {/* Nouvelles routes */}
          <Route path="videos" element={<VideosPage />} />
          <Route path="ia-linguistique" element={<IALinguistiquePage />} />
          <Route path="test-agents" element={<TestAgentsPage />} />
          <Route path="bienvenue-sons" element={<BienvenueEtSonsPage />} />
          <Route path="langues" element={<LanguesPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="phrases-sos" element={<PhrasesSOSPage />} />
          <Route path="phrases-utiles" element={<PhrasesUtilesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          {/* Admin only */}
          <Route path="users" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}><UsersPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
