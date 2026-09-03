import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// ─── Chargement à la demande ──────────────────────────────────────────────────
// Chaque page est un module séparé, téléchargé au moment où l'on ouvre la page.
// Sur une connexion mobile, l'éditeur ne paie plus le coût des 49 autres pages
// pour afficher celle qu'il consulte. Layout et LoginPage restent chargés
// d'emblée : ce sont la coquille et la porte d'entrée, toujours nécessaires.
const DashboardPage           = lazy(() => import('./pages/DashboardPage'));
const VocabularyPage          = lazy(() => import('./pages/VocabularyPage'));
const ContributionsPage       = lazy(() => import('./pages/ContributionsPage'));
const LessonsPage             = lazy(() => import('./pages/LessonsPage'));
const TutorsPage              = lazy(() => import('./pages/TutorsPage'));
const CulturalPage            = lazy(() => import('./pages/CulturalPage'));
const UsersPage               = lazy(() => import('./pages/UsersPage'));
const VoixAudioPage           = lazy(() => import('./pages/VoixAudioPage'));
const PremierSecoursPage      = lazy(() => import('./pages/PremierSecoursPage'));
const CivismePage             = lazy(() => import('./pages/CivismePage'));
const VideosPage              = lazy(() => import('./pages/VideosPage'));
const IALinguistiquePage      = lazy(() => import('./pages/IALinguistiquePage'));
const TestAgentsPage          = lazy(() => import('./pages/TestAgentsPage'));
const BienvenueEtSonsPage     = lazy(() => import('./pages/BienvenueEtSonsPage'));
const LanguesPage             = lazy(() => import('./pages/LanguesPage'));
const BadgesPage              = lazy(() => import('./pages/BadgesPage'));
const PhrasesSOSPage          = lazy(() => import('./pages/PhrasesSOSPage'));
const PhrasesUtilesPage       = lazy(() => import('./pages/PhrasesUtilesPage'));
const NotificationsPage       = lazy(() => import('./pages/NotificationsPage'));
const TextContentPage         = lazy(() => import('./pages/TextContentPage'));
const DictionaryPage          = lazy(() => import('./pages/DictionaryPage'));
const ConjugationPage         = lazy(() => import('./pages/ConjugationPage'));
const ImageGalleryPage        = lazy(() => import('./pages/ImageGalleryPage'));
const MessagesPage            = lazy(() => import('./pages/MessagesPage'));
const CertificatesPage        = lazy(() => import('./pages/CertificatesPage'));
const LessonEditorPage        = lazy(() => import('./pages/LessonEditorPage'));
const ProfilePage             = lazy(() => import('./pages/ProfilePage'));
const PrivacyPolicyPage       = lazy(() => import('./pages/PrivacyPolicyPage'));
const UserGuidePage           = lazy(() => import('./pages/UserGuidePage'));
const MuseeTresorsPage        = lazy(() => import('./pages/MuseeTresorsPage'));
const FinancePage             = lazy(() => import('./pages/FinancePage'));
const ArbreVocabulairePage    = lazy(() => import('./pages/ArbreVocabulairePage'));
const MarcheDialoguesPage     = lazy(() => import('./pages/MarcheDialoguesPage'));
const CarteCIPage             = lazy(() => import('./pages/CarteCIPage'));
const AlphabetPage            = lazy(() => import('./pages/AlphabetPage'));
const SensMotsPage            = lazy(() => import('./pages/SensMotsPage'));
const PartenairePage          = lazy(() => import('./pages/PartenairePage'));
const MathematiquePage        = lazy(() => import('./pages/MathematiquePage'));
const MonnaiePage             = lazy(() => import('./pages/MonnaiePage'));
const InstitutionsPage        = lazy(() => import('./pages/InstitutionsPage'));
const ValidationCommitteePage = lazy(() => import('./pages/ValidationCommitteePage'));
const RapportEditeursPage     = lazy(() => import('./pages/RapportEditeursPage'));
const RepetitorPage           = lazy(() => import('./pages/RepetitorPage'));
const MissionPage             = lazy(() => import('./pages/MissionPage'));
const CursusPage              = lazy(() => import('./pages/CursusPage'));
const CerveauPage             = lazy(() => import('./pages/CerveauPage'));
const DataDeletionPage        = lazy(() => import('./pages/DataDeletionPage'));
const ProgrammePage           = lazy(() => import('./pages/ProgrammePage'));
const FichesPage              = lazy(() => import('./pages/FichesPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/suppression-donnees" element={<DataDeletionPage />} />
          <Route path="/" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'EXPERT', 'CONTRIBUTOR', 'PARTNER']}><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="cerveau" element={<CerveauPage />} />
            <Route path="dictionary" element={<DictionaryPage />} />
            <Route path="conjugation" element={<ConjugationPage />} />
            <Route path="image-galleries" element={<ImageGalleryPage />} />
            <Route path="sens-mots" element={<SensMotsPage />} />
            <Route path="vocabulary" element={<VocabularyPage />} />
            <Route path="contributions" element={<ContributionsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="lessons" element={<LessonsPage />} />
            <Route path="cursus"    element={<CursusPage />} />
            <Route path="programme" element={<ProgrammePage />} />
            <Route path="fiches"    element={<FichesPage />} />
            <Route path="lessons/:lessonId" element={<LessonEditorPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="tutors" element={<TutorsPage />} />
            <Route path="cultural" element={<CulturalPage />} />
            <Route path="textes-recits" element={<TextContentPage />} />
            <Route path="voix-audio" element={<VoixAudioPage />} />
            <Route path="premiers-secours" element={<PremierSecoursPage />} />
            <Route path="civisme" element={<CivismePage />} />
            {/* Nouvelles routes */}
            <Route path="videos" element={<VideosPage />} />
            <Route path="ia-linguistique" element={<IALinguistiquePage />} />
            <Route path="validation-committee" element={<ValidationCommitteePage />} />
            <Route path="test-agents" element={<TestAgentsPage />} />
            <Route path="bienvenue-sons" element={<BienvenueEtSonsPage />} />
            <Route path="langues" element={<LanguesPage />} />
            <Route path="carte-ci" element={<CarteCIPage />} />
            <Route path="badges" element={<BadgesPage />} />
            <Route path="phrases-sos" element={<PhrasesSOSPage />} />
            <Route path="phrases-utiles" element={<PhrasesUtilesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="musee-tresors" element={<MuseeTresorsPage />} />
            <Route path="arbre-vocabulaire" element={<ArbreVocabulairePage />} />
            <Route path="marche-dialogues" element={<MarcheDialoguesPage />} />
            <Route path="alphabet-langues" element={<AlphabetPage />} />
            <Route path="mathematiques" element={<MathematiquePage />} />
            <Route path="monnaie" element={<MonnaiePage />} />
            <Route path="institutions" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EDITOR']}><InstitutionsPage /></ProtectedRoute>} />
            <Route path="finance" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}><FinancePage /></ProtectedRoute>} />
            <Route path="partenaire" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'PARTNER', 'EXPERT']}><PartenairePage /></ProtectedRoute>} />
            <Route path="guide" element={<UserGuidePage />} />
            {/* Admin only */}
            <Route path="users" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}><UsersPage /></ProtectedRoute>} />
            <Route path="rapport-editeurs" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'EXPERT']}><RapportEditeursPage /></ProtectedRoute>} />
            <Route path="repetitor" element={<ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}><RepetitorPage /></ProtectedRoute>} />
            <Route path="mission" element={<MissionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
