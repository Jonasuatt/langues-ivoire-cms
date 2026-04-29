import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DashboardPage from './pages/DashboardPage';
import VocabularyPage from './pages/VocabularyPage';
import ContributionsPage from './pages/ContributionsPage';
import LessonsPage from './pages/LessonsPage';
import LessonEditorPage from './pages/LessonEditorPage';
import TutorsPage from './pages/TutorsPage';
import CulturalPage from './pages/CulturalPage';
import UsersPage from './pages/UsersPage';
import AudioUploadPage from './pages/AudioUploadPage';
import VideosPage from './pages/VideosPage';
import AudioContributionsPage from './pages/AudioContributionsPage';
import AgentsTestPage from './pages/AgentsTestPage';
import WelcomeSettingsPage from './pages/WelcomeSettingsPage';
import BadgesPage from './pages/BadgesPage';
import NotificationsPage from './pages/NotificationsPage';
import LanguesPage from './pages/LanguesPage';
import SOSPhrasesPage from './pages/SOSPhrasesPage';

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
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/" element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'CONTRIBUTOR']}><Layout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="vocabulary" element={<VocabularyPage />} />
          <Route path="contributions" element={<ContributionsPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:lessonId" element={<LessonEditorPage />} />
          <Route path="tutors" element={<TutorsPage />} />
          <Route path="cultural" element={<CulturalPage />} />
          <Route path="audio-upload" element={<AudioUploadPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="audio-contributions" element={<AudioContributionsPage />} />
          <Route path="agents-test" element={<AgentsTestPage />} />
          <Route path="welcome-settings" element={<WelcomeSettingsPage />} />
          <Route path="badges" element={<BadgesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="langues" element={<LanguesPage />} />
          <Route path="sos-phrases" element={<SOSPhrasesPage />} />
          <Route path="users" element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}><UsersPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
