import { useState, useRef } from 'react';
import {
  BookOpenIcon, HomeIcon, LanguageIcon, AcademicCapIcon, SparklesIcon,
  VideoCameraIcon, ChatBubbleLeftRightIcon, CpuChipIcon, MicrophoneIcon,
  UserGroupIcon, BeakerIcon, MusicalNoteIcon, GlobeAltIcon, TrophyIcon,
  BellIcon, HeartIcon, BuildingLibraryIcon, UsersIcon,
  ExclamationTriangleIcon, PhotoIcon, EnvelopeIcon, LightBulbIcon,
  ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

// ─── Données du guide ─────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'contenu',
    label: 'Contenu Principal',
    color: 'indigo',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    badge: 'bg-indigo-100 text-indigo-700',
    modules: [
      {
        id: 'dashboard',
        route: '/',
        icon: HomeIcon,
        title: 'Tableau de bord',
        color: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
        description: 'Vue d\'ensemble de l\'activité de la plateforme : statistiques, dernières contributions, indicateurs clés.',
        features: [
          'Compteurs en temps réel : mots, leçons, utilisateurs inscrits, contributions en attente.',
          'Graphique de l\'activité récente (7 derniers jours).',
          'Liste des dernières contributions soumises par les utilisateurs.',
          'Accès rapide aux modules les plus utilisés.',
        ],
        steps: [
          { title: 'Consulter les statistiques', desc: 'Les 4 cartes en haut résument les chiffres clés. Un chiffre en rouge indique un élément nécessitant une action.' },
          { title: 'Voir les contributions en attente', desc: 'Le tableau du bas liste les dernières soumissions. Cliquez sur « Contributions » dans le menu pour les modérer.' },
        ],
        tip: 'Consultez le tableau de bord chaque matin pour détecter rapidement les contributions en attente de modération.',
      },
      {
        id: 'dictionary',
        route: '/dictionary',
        icon: LanguageIcon,
        title: 'Dictionnaire',
        color: 'text-purple-600',
        iconBg: 'bg-purple-50',
        description: 'Gestion complète des entrées du dictionnaire multilingue : ajout, modification, génération audio.',
        features: [
          'Filtrage par langue (Dioula, Baoulé, Bété, Guéré, Agni, Attié, Sénoufo, Nouchi).',
          'Filtrage par catégorie (salutations, famille, animaux…) et par niveau.',
          'Ajout d\'un nouveau mot avec : mot local, traduction, phonétique, exemple, catégorie, niveau.',
          'Génération automatique de l\'audio via l\'IA (bouton « Générer Audio »).',
          'Recherche en temps réel dans les entrées existantes.',
        ],
        steps: [
          { title: 'Ajouter un mot', desc: 'Cliquez sur « + Ajouter un mot ». Remplissez : mot en langue locale, traduction française, phonétique, exemple de phrase. Sélectionnez la langue et la catégorie. Cliquez sur « Enregistrer ».' },
          { title: 'Générer l\'audio', desc: 'Sur une fiche de mot existante, cliquez sur « Générer Audio ». L\'IA produit un fichier audio. Vérifiez la prononciation avant de valider.' },
          { title: 'Modifier un mot', desc: 'Cliquez sur l\'icône crayon à droite de l\'entrée. Modifiez les champs souhaités. Enregistrez.' },
        ],
        tip: 'Ajoutez toujours la phonétique entre crochets [  ] pour aider les apprenants non-francophones.',
      },
      {
        id: 'conjugation',
        route: '/conjugation',
        icon: BookOpenIcon,
        title: 'Conjugaison',
        color: 'text-violet-600',
        iconBg: 'bg-violet-50',
        description: 'Gestion des tables de conjugaison des verbes dans chaque langue ivoirienne.',
        features: [
          'Ajout de verbes avec leurs formes conjuguées (aspect accompli / inaccompli).',
          'Gestion des diacritiques (ɛ, ɔ, ŋ…) et des tons.',
          'Association à une langue et une catégorie grammaticale.',
          'Audio pour chaque forme conjuguée.',
        ],
        steps: [
          { title: 'Ajouter un verbe', desc: 'Cliquez sur « + Nouveau verbe ». Saisissez le verbe en langue locale et sa traduction. Remplissez les formes conjuguées selon les aspects.' },
          { title: 'Associer un audio', desc: 'Après la création, utilisez le bouton audio pour importer ou générer la prononciation de chaque forme.' },
        ],
        tip: 'Les langues ivoiriennes utilisent des aspects (accompli/inaccompli) plutôt que des temps. Précisez cela dans la description.',
      },
      {
        id: 'vocabulary',
        route: '/vocabulary',
        icon: BookOpenIcon,
        title: 'Vocabulaire',
        color: 'text-blue-600',
        iconBg: 'bg-blue-50',
        description: 'Listes de vocabulaire thématiques associées aux leçons et aux galeries d\'images.',
        features: [
          'Organisation par thèmes (animaux, couleurs, chiffres, corps humain…).',
          'Association directe aux leçons et aux niveaux.',
          'Import en lot possible via fichier CSV.',
          'Gestion des audios et des images pour chaque entrée.',
        ],
        steps: [
          { title: 'Créer une liste thématique', desc: 'Sélectionnez une langue et un thème. Ajoutez les mots un à un ou importez un fichier CSV préformaté.' },
          { title: 'Lier à une leçon', desc: 'Dans le formulaire d\'une liste, sélectionnez la leçon associée dans le menu déroulant.' },
        ],
        tip: 'Limitez chaque liste thématique à 20–30 mots pour ne pas surcharger l\'apprenant.',
      },
      {
        id: 'lessons',
        route: '/lessons',
        icon: AcademicCapIcon,
        title: 'Leçons',
        color: 'text-teal-600',
        iconBg: 'bg-teal-50',
        description: 'Création et gestion des leçons structurées par langue et par niveau (A1 à C1).',
        features: [
          'Filtrage par langue et par niveau (A1 à C1).',
          'Création de leçons avec titre, description, objectifs, durée estimée.',
          'Éditeur de leçon (/lessons/:id) : ajout d\'étapes (Vocabulaire, Dialogue, Grammaire, Exercice).',
          'Réorganisation par glisser-déposer.',
          'Publication / dépublication d\'une leçon.',
        ],
        steps: [
          { title: 'Créer une leçon', desc: 'Cliquez sur « + Nouvelle leçon ». Renseignez : titre, langue, niveau (A1–C1), description, durée estimée. Enregistrez.' },
          { title: 'Ajouter des étapes', desc: 'Depuis la liste, cliquez sur la leçon pour ouvrir l\'éditeur. Ajoutez des étapes : Vocabulaire → liste de mots, Dialogue → conversation, Grammaire → règle + exemples, Exercice → QCM / association / traduction.' },
          { title: 'Publier', desc: 'Activez le bouton « Publié » pour rendre la leçon visible dans l\'application mobile.' },
        ],
        tip: 'Une bonne leçon commence par du vocabulaire (5–10 mots), puis un dialogue, puis un exercice. Durée idéale : 10–15 minutes.',
      },
      {
        id: 'cultural',
        route: '/cultural',
        icon: SparklesIcon,
        title: 'Culture & Traditions',
        color: 'text-amber-600',
        iconBg: 'bg-amber-50',
        description: 'Gestion des contenus culturels affichés sur l\'Accueil de l\'application : proverbes, traditions, points culturels.',
        features: [
          'Types de contenus : proverbe, tradition, coutume, événement, gastronomie.',
          'Texte en langue locale + traduction française + explication.',
          'Audio optionnel pour la version en langue locale.',
          'Publication programmée ou immédiate.',
          'Le contenu du jour est sélectionné automatiquement sur l\'Accueil mobile.',
        ],
        steps: [
          { title: 'Ajouter un contenu culturel', desc: 'Cliquez sur « + Nouveau contenu ». Choisissez le type, la langue, saisissez le texte et sa traduction. Ajoutez une explication contextuelle.' },
          { title: 'Programmer la publication', desc: 'Activez « Publié » et définissez une date de mise en avant si vous souhaitez que ce contenu apparaisse à une date précise sur l\'Accueil.' },
        ],
        tip: 'Variez les langues et les types de contenus pour offrir une diversité culturelle chaque jour.',
      },
      {
        id: 'textes-recits',
        route: '/textes-recits',
        icon: BookOpenIcon,
        title: 'Textes & Récits',
        color: 'text-fuchsia-600',
        iconBg: 'bg-fuchsia-50',
        description: 'Gestion du patrimoine oral ivoirien : contes, chansons, proverbes, poèmes, légendes, discours.',
        features: [
          'Types : Conte, Chanson, Histoire, Proverbe, Poème, Récit, Légende, Discours.',
          'Langue, niveau de lecture, durée estimée, auteur / source.',
          'Texte complet + traduction française.',
          'Audio associé (lecture par un locuteur natif).',
          'Publication avec tag de langue et badge de type.',
        ],
        steps: [
          { title: 'Créer un texte', desc: 'Cliquez sur « + Nouveau texte ». Sélectionnez le type et la langue. Rédigez le texte en langue locale et sa traduction. Renseignez l\'auteur ou la source ethnique.' },
          { title: 'Associer un audio', desc: 'Cliquez sur « Importer Audio » pour uploader le fichier sonore ou entrez l\'URL d\'un fichier hébergé.' },
        ],
        tip: 'Indiquez toujours la source (tradition orale, auteur, ethnie) pour respecter le patrimoine culturel.',
      },
      {
        id: 'image-galleries',
        route: '/image-galleries',
        icon: PhotoIcon,
        title: 'Galeries d\'Images',
        color: 'text-pink-600',
        iconBg: 'bg-pink-50',
        description: 'Organisation des images thématiques associées au vocabulaire visuel de l\'application.',
        features: [
          'Création de galeries par thème (Animaux, Nourriture, Corps…) et par langue.',
          'Upload d\'images directement depuis le CMS.',
          'Association mot ↔ image ↔ audio pour chaque entrée.',
          'Réorganisation de l\'ordre des images dans une galerie.',
        ],
        steps: [
          { title: 'Créer une galerie', desc: 'Cliquez sur « + Nouvelle galerie ». Choisissez la catégorie et la langue. Donnez un titre et une description.' },
          { title: 'Ajouter des images', desc: 'Ouvrez la galerie. Cliquez sur « + Ajouter des images ». Dans la modale, une grille de 8 images Unsplash est disponible pour démarrer rapidement : cliquez sur une image pour la sélectionner, ou uploadez vos propres fichiers PNG/JPG. Saisissez le mot en langue locale, sa phonétique et sa traduction pour chaque image.' },
          { title: 'Supprimer une image', desc: 'Survolez l\'image. Cliquez sur l\'icône corbeille qui apparaît. Confirmez la suppression.' },
        ],
        tip: 'La grille d\'images Unsplash proposée au démarrage est idéale pour créer rapidement une galerie de démonstration. Remplacez-les par vos propres visuels pour la production.',
      },
      {
        id: 'videos',
        route: '/videos',
        icon: VideoCameraIcon,
        title: 'Vidéos',
        color: 'text-red-600',
        iconBg: 'bg-red-50',
        description: 'Médiathèque vidéo : intégration de vidéos YouTube et gestion des catégories.',
        features: [
          'Catégories : Prononciation, Culturel, Tutoriel, Musique, Documentaire.',
          'Intégration par URL YouTube (pas d\'upload direct).',
          'Titre, description, langue, durée, miniature automatique depuis YouTube.',
          'Import d\'une miniature personnalisée depuis l\'ordinateur (bouton « 📁 Importer ») avec prévisualisation.',
          'Publication / archivage d\'une vidéo.',
        ],
        steps: [
          { title: 'Ajouter une vidéo', desc: 'Cliquez sur « + Nouvelle vidéo ». Collez l\'URL YouTube. Le titre et la miniature se remplissent automatiquement. Sélectionnez la catégorie et la langue. Enregistrez.' },
          { title: 'Personnaliser la miniature', desc: 'Dans le formulaire d\'ajout, cliquez sur « 📁 Importer » pour sélectionner une image depuis votre ordinateur. Une prévisualisation s\'affiche immédiatement avant l\'enregistrement.' },
          { title: 'Archiver', desc: 'Désactivez le bouton « Publié » pour masquer la vidéo sans la supprimer.' },
        ],
        tip: 'Préférez des vidéos sous licence Creative Commons ou produites en interne pour éviter les problèmes de droits.',
      },
      {
        id: 'alphabet-langues',
        route: '/alphabet-langues',
        icon: LanguageIcon,
        title: 'Alphabet des Langues',
        color: 'text-blue-700',
        iconBg: 'bg-blue-50',
        description: 'Référentiel complet des 35 groupes de caractères ivoiriens : voyelles, consonnes, caractères spéciaux africains, digraphes et marques tonales.',
        features: [
          'Voyelles communes : A E Ɛ I O Ɔ U Ə.',
          'Consonnes standard et caractères spécifiques africains : ŋ ɲ ɓ ɗ ɣ ʃ ʒ β.',
          'Digraphes : gb, kp.',
          'Marques tonales (tons haut, bas, modulé).',
          'Code couleur : bleu = commun français, violet = spécifique africain, orange = tons.',
          'Filtre par catégorie (Voyelles / Consonnes / Spéciaux / Tons).',
          'Barre de recherche pour trouver un caractère précis.',
          'Clic sur un caractère pour le copier dans le presse-papier.',
        ],
        steps: [
          { title: 'Parcourir l\'alphabet', desc: 'Accédez à /alphabet-langues. Utilisez les filtres de catégorie pour afficher uniquement les voyelles, consonnes, caractères spéciaux ou tons.' },
          { title: 'Copier un caractère', desc: 'Cliquez sur n\'importe quel groupe de caractères pour le copier automatiquement dans le presse-papier. Vous pouvez ensuite le coller dans n\'importe quel champ du CMS.' },
          { title: 'Rechercher un caractère', desc: 'Utilisez la barre de recherche pour retrouver rapidement un caractère ou un groupe par son nom ou sa valeur.' },
        ],
        tip: 'Utilisez ce module comme référence lors de la saisie de mots dans le dictionnaire ou la conjugaison pour garantir la bonne écriture des diacritiques africains.',
      },
    ],
  },
  {
    id: 'communaute',
    label: 'Communauté',
    color: 'green',
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-700',
    modules: [
      {
        id: 'contributions',
        route: '/contributions',
        icon: ChatBubbleLeftRightIcon,
        title: 'Contributions',
        color: 'text-green-600',
        iconBg: 'bg-green-50',
        description: 'Modération des mots et phrases soumis par la communauté d\'apprenants et de locuteurs natifs.',
        features: [
          'Liste des contributions en attente, approuvées ou rejetées.',
          'Filtrage par statut, langue et date.',
          'Fiche de chaque contribution : mot, traduction, phonétique, audio soumis.',
          'Lecteur audio intégré dans la fiche pour écouter directement l\'enregistrement soumis.',
          'Actions : Approuver ✓ | Rejeter ✗ | Ajouter au dictionnaire.',
        ],
        steps: [
          { title: 'Modérer une contribution', desc: 'Cliquez sur une contribution pour l\'ouvrir. Vérifiez le mot, la traduction et utilisez le lecteur audio intégré pour écouter l\'enregistrement. Cliquez sur « Approuver » ou « Rejeter ». Un motif de rejet peut être envoyé à l\'utilisateur.' },
          { title: 'Ajouter au dictionnaire', desc: 'Après approbation, cliquez sur « Ajouter au dictionnaire » pour intégrer directement l\'entrée validée.' },
        ],
        tip: 'Le lecteur audio est maintenant pleinement fonctionnel dans chaque fiche de contribution. Écoutez toujours l\'audio avant d\'approuver pour vérifier la qualité de la prononciation.',
      },
      {
        id: 'messages',
        route: '/messages',
        icon: EnvelopeIcon,
        title: 'Messages / Support',
        color: 'text-sky-600',
        iconBg: 'bg-sky-50',
        description: 'Gestion des messages d\'assistance envoyés par les utilisateurs depuis l\'application mobile.',
        features: [
          'Badge rouge sur l\'entrée du menu latéral indiquant le nombre de messages ouverts (mis à jour toutes les 60 secondes).',
          'Liste des tickets de support : ouverts, en cours, résolus.',
          'Filtrage par statut et par date.',
          'Zone de réponse toujours visible dans le fil de conversation (même pour les tickets résolus).',
          'Bouton « ↩ Continuer » sur les messages résolus pour reprendre la conversation.',
          'Réponse directe depuis le CMS visible dans l\'application mobile de l\'utilisateur.',
          'Clôture manuelle du ticket.',
        ],
        steps: [
          { title: 'Repérer les nouveaux messages', desc: 'Le badge rouge sur « Messages » dans le menu latéral indique le nombre de tickets ouverts en attente de réponse. Il se met à jour automatiquement toutes les 60 secondes.' },
          { title: 'Répondre à un message', desc: 'Cliquez sur un ticket. La zone de réponse est toujours visible en bas du fil de conversation. Rédigez votre réponse et cliquez sur « Envoyer ». Le ticket passe automatiquement en statut « En cours ».' },
          { title: 'Reprendre un message résolu', desc: 'Sur un ticket marqué « Résolu », cliquez sur « ↩ Continuer » pour rouvrir la conversation et envoyer un nouveau message à l\'utilisateur.' },
          { title: 'Clôturer un ticket', desc: 'Une fois le problème résolu, cliquez sur « Marquer comme résolu ».' },
        ],
        tip: 'Le badge de messages vous permet de détecter immédiatement les nouvelles demandes sans quitter votre module de travail. Répondez dans les 48 heures ouvrables.',
      },
      {
        id: 'certificates',
        route: '/certificates',
        icon: AcademicCapIcon,
        title: 'Certificats',
        color: 'text-yellow-600',
        iconBg: 'bg-yellow-50',
        description: 'Génération, personnalisation et gestion des certificats de complétion remis aux apprenants.',
        features: [
          'Liste de tous les certificats générés avec la date, l\'utilisateur et la langue.',
          'Émission manuelle d\'un certificat pour un utilisateur spécifique.',
          'Émission automatique dès qu\'un utilisateur complète toutes les leçons d\'un niveau.',
          'Téléchargement PDF du certificat.',
          'Onglet « 🎨 Modèles » : personnalisation du modèle de Certificat et de Diplôme (couleurs, texte, émoji). Modifications sauvegardées en local.',
        ],
        steps: [
          { title: 'Personnaliser le modèle', desc: 'Cliquez sur l\'onglet « 🎨 Modèles ». Choisissez entre le modèle Certificat et le modèle Diplôme. Modifiez les couleurs, les textes et les émojis selon votre charte graphique. Cliquez sur « Enregistrer » — les préférences sont conservées dans le navigateur.' },
          { title: 'Émettre un certificat', desc: 'Cliquez sur « + Émettre un certificat ». Sélectionnez l\'utilisateur et la langue / le niveau. Cliquez sur « Générer ».' },
          { title: 'Télécharger un certificat', desc: 'Trouvez le certificat dans la liste. Cliquez sur l\'icône de téléchargement pour obtenir le PDF.' },
        ],
        tip: 'Les certificats sont automatiquement générés quand un utilisateur complète toutes les leçons d\'un niveau. Personnalisez le modèle avant d\'émettre les premiers certificats pour garantir une présentation soignée.',
      },
      {
        id: 'ia-linguistique',
        route: '/ia-linguistique',
        icon: CpuChipIcon,
        title: 'IA Linguistique',
        color: 'text-cyan-600',
        iconBg: 'bg-cyan-50',
        description: 'Gestion des données d\'entraînement et du contenu généré par l\'IA pour les langues ivoiriennes.',
        features: [
          'Consultation des corpus linguistiques par langue.',
          'Validation ou correction des traductions proposées par l\'IA.',
          'Statistiques de précision par langue.',
          'Lancement de sessions de génération de contenu (mots, phrases, exemples).',
        ],
        steps: [
          { title: 'Valider du contenu IA', desc: 'Accédez à la liste des propositions générées. Pour chaque entrée, validez ou corrigez la traduction/phonétique. Cliquez sur « Confirmer » pour intégrer l\'entrée validée.' },
          { title: 'Générer du contenu', desc: 'Sélectionnez une langue et un thème. Cliquez sur « Générer ». L\'IA propose un lot de mots/phrases. Validez ou rejetez chaque proposition.' },
        ],
        tip: 'Toujours faire vérifier le contenu généré par un locuteur natif avant publication.',
      },
      {
        id: 'voix-audio',
        route: '/voix-audio',
        icon: MicrophoneIcon,
        title: 'Import Audio',
        color: 'text-orange-600',
        iconBg: 'bg-orange-50',
        description: 'Import et validation des contributions audio enregistrées par les locuteurs natifs.',
        features: [
          'Liste des fichiers audio soumis avec statut (en attente, validé, rejeté).',
          'Lecteur audio intégré pour vérifier la qualité.',
          'Import en lot (bulk import) depuis un fichier CSV + dossier d\'audios.',
          'Association automatique de l\'audio au mot correspondant.',
        ],
        steps: [
          { title: 'Valider un audio', desc: 'Cliquez sur l\'icône de lecture pour écouter l\'enregistrement. Si la qualité est bonne, cliquez sur « Valider ». L\'audio est immédiatement associé au mot dans le dictionnaire.' },
          { title: 'Import en lot', desc: 'Préparez un CSV avec les colonnes : mot_id, fichier_audio. Cliquez sur « Import en lot ». Sélectionnez le CSV et le dossier d\'audios compressé (ZIP). Lancez l\'import.' },
        ],
        tip: 'Un bon audio de référence : pièce silencieuse, microphone à 15 cm de la bouche, débit naturel sans coupure.',
      },
    ],
  },
  {
    id: 'ia',
    label: 'Intelligence Artificielle',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    modules: [
      {
        id: 'tutors',
        route: '/tutors',
        icon: UserGroupIcon,
        title: 'Tuteurs IA',
        color: 'text-blue-600',
        iconBg: 'bg-blue-50',
        description: 'Gestion des 20 tuteurs IA : personnalités, langues, avatars, disponibilité.',
        features: [
          '20 tuteurs avec nom, avatar, langue cible, style pédagogique.',
          'Activation / désactivation d\'un tuteur.',
          'Modification de la biographie et des spécialités.',
          'Association à une ou plusieurs langues.',
        ],
        steps: [
          { title: 'Modifier un tuteur', desc: 'Cliquez sur la carte du tuteur. Modifiez la biographie, les spécialités ou l\'avatar. Cliquez sur « Enregistrer ».' },
          { title: 'Activer / Désactiver', desc: 'Basculez le bouton « Actif » sur la carte du tuteur. Un tuteur inactif n\'apparaît pas dans l\'application mobile.' },
          { title: 'Ajouter un tuteur', desc: 'Cliquez sur « + Nouveau tuteur ». Remplissez : nom, biographie, langue(s), spécialité. Uploadez un avatar. Enregistrez.' },
        ],
        tip: 'Chaque tuteur doit avoir une personnalité distincte pour varier l\'expérience d\'apprentissage. Évitez les doublons de style.',
      },
      {
        id: 'test-agents',
        route: '/test-agents',
        icon: BeakerIcon,
        title: 'Test Agents IA',
        color: 'text-violet-600',
        iconBg: 'bg-violet-50',
        description: 'Interface de test pour dialoguer directement avec les agents IA avant leur déploiement.',
        features: [
          'Sélection d\'un tuteur parmi les tuteurs actifs.',
          'Zone de chat en temps réel.',
          'Affichage du prompt système utilisé par l\'agent.',
          'Historique de la session de test.',
        ],
        steps: [
          { title: 'Tester un agent', desc: 'Sélectionnez un tuteur dans la liste déroulante. Tapez un message dans la zone de chat. L\'agent répond en temps réel. Évaluez la qualité des réponses (traductions, phonétique, pédagogie).' },
          { title: 'Analyser le prompt', desc: 'Cliquez sur « Voir le prompt » pour afficher le prompt système injecté à l\'agent. Signalez les problèmes à l\'équipe technique.' },
        ],
        tip: 'Testez avec des phrases simples d\'abord, puis des phrases complexes avec des fautes intentionnelles pour vérifier la robustesse.',
      },
      {
        id: 'bienvenue-sons',
        route: '/bienvenue-sons',
        icon: MusicalNoteIcon,
        title: 'Bienvenue & Sons',
        color: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
        description: 'Gestion des sons de bienvenue et des messages d\'accueil prononcés par les tuteurs IA au démarrage.',
        features: [
          'Bannière d\'information indiquant que tous les éditeurs peuvent modifier les messages et ajouter des sons.',
          'Pour ajouter une nouvelle langue : Paramètres APP → Langues (lien direct depuis ce module).',
          'Enregistrement ou upload d\'un message de bienvenue par langue.',
          'Texte du message + version audio.',
          'Test de lecture directement dans le CMS.',
          'Activation du message par défaut ou personnalisé.',
        ],
        steps: [
          { title: 'Définir un message de bienvenue', desc: 'Sélectionnez la langue. Saisissez le texte du message. Uploadez l\'audio ou générez-le via l\'IA. Activez le message.' },
          { title: 'Tester le son', desc: 'Cliquez sur l\'icône de lecture pour entendre le message tel qu\'il sera diffusé dans l\'application.' },
          { title: 'Ajouter une nouvelle langue', desc: 'Pour qu\'une langue apparaisse dans ce module, elle doit d\'abord être créée et activée dans Paramètres APP → Langues. La bannière d\'information vous rappelle ce prérequis.' },
        ],
        tip: 'Le message de bienvenue est la première chose qu\'entend un nouvel apprenant. Soignez le ton : chaleureux, encourageant et clair.',
      },
    ],
  },
  {
    id: 'parametres',
    label: 'Paramètres App',
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
    modules: [
      {
        id: 'langues',
        route: '/langues',
        icon: GlobeAltIcon,
        title: 'Langues',
        color: 'text-teal-600',
        iconBg: 'bg-teal-50',
        description: 'Gestion des langues disponibles dans l\'application mobile.',
        features: [
          'Liste des langues actives : Dioula, Baoulé, Bété, Guéré, Agni, Attié, Sénoufo, Nouchi.',
          'Activation / désactivation d\'une langue dans l\'application.',
          'Informations linguistiques : famille, région, locuteurs estimés.',
          'Ajout de nouvelles langues pour les futures versions.',
        ],
        steps: [
          { title: 'Activer une langue', desc: 'Trouvez la langue dans la liste. Basculez le bouton « Active ». La langue apparaît immédiatement dans les filtres de l\'application mobile.' },
          { title: 'Ajouter une langue', desc: 'Cliquez sur « + Nouvelle langue ». Saisissez le nom, le code ISO, la région, la famille linguistique. Enregistrez. La langue sera inactive par défaut.' },
        ],
        tip: 'N\'activez une langue que lorsqu\'elle dispose d\'au moins 50 mots dans le dictionnaire et d\'une leçon A1 complète.',
      },
      {
        id: 'badges',
        route: '/badges',
        icon: TrophyIcon,
        title: 'Badges & XP',
        color: 'text-yellow-600',
        iconBg: 'bg-yellow-50',
        description: 'Gestion des badges de récompense et du système de points XP pour gamifier l\'apprentissage.',
        features: [
          'Création de badges avec : nom, icône, description, condition de déclenchement.',
          'Conditions disponibles : premier mot, 7 jours de streak, 100 XP, 10 leçons…',
          'Attribution manuelle d\'un badge à un utilisateur.',
          'Valeur XP de chaque action (leçon = +10 XP, contribution validée = +20 XP…).',
        ],
        steps: [
          { title: 'Créer un badge', desc: 'Cliquez sur « + Nouveau badge ». Saisissez le nom, la description. Choisissez l\'icône et la couleur. Définissez la condition de déclenchement automatique. Enregistrez.' },
          { title: 'Attribuer manuellement', desc: 'Trouvez le badge. Cliquez sur « Attribuer ». Recherchez l\'utilisateur par nom ou e-mail. Confirmez.' },
        ],
        tip: 'Créez des badges progressifs (Bronze / Argent / Or) pour maintenir la motivation sur le long terme.',
      },
      {
        id: 'phrases-sos',
        route: '/phrases-sos',
        icon: ExclamationTriangleIcon,
        title: 'Phrases SOS',
        color: 'text-red-600',
        iconBg: 'bg-red-50',
        description: 'Gestion des phrases d\'urgence disponibles hors ligne dans l\'application mobile.',
        features: [
          'Catégories : Urgence, Santé, Survie, Social, Commerce, Autre.',
          'Phrase en langue locale + traduction + phonétique + audio.',
          'Marquage comme « disponible hors ligne ».',
          'Priorité d\'affichage (les phrases vitales apparaissent en premier).',
        ],
        steps: [
          { title: 'Ajouter une phrase SOS', desc: 'Cliquez sur « + Nouvelle phrase ». Sélectionnez la langue et la catégorie. Saisissez la phrase en langue locale, la traduction et la phonétique. Uploadez ou générez l\'audio. Activez « Hors ligne ».' },
          { title: 'Définir la priorité', desc: 'Dans le formulaire, sélectionnez la priorité : Haute (rouge), Moyenne (orange), Basse (gris). Les phrases Haute priorité apparaissent en haut de la liste.' },
        ],
        tip: 'Vérifiez avec un locuteur natif que la prononciation est correcte — ces phrases sont utilisées dans des situations d\'urgence réelles.',
      },
      {
        id: 'phrases-utiles',
        route: '/phrases-utiles',
        icon: ChatBubbleLeftRightIcon,
        title: 'Phrases Utiles',
        color: 'text-purple-600',
        iconBg: 'bg-purple-50',
        description: 'Gestion des expressions du quotidien : salutations, nourriture, vie sociale, lieux…',
        features: [
          'Catégories : Salutations, Expressions, Nourriture, Vie quotidienne, Vie sociale, Corps, Lieux, Autre.',
          'Phrase en langue locale + phonétique + traduction + contexte d\'utilisation.',
          'Filtrage par langue et par catégorie.',
          'Activation / désactivation de chaque phrase.',
        ],
        steps: [
          { title: 'Ajouter une phrase', desc: 'Cliquez sur « + Nouvelle phrase ». Choisissez la langue et la catégorie. Saisissez la phrase, la phonétique, la traduction et une note contextuelle (quand utiliser cette phrase).' },
          { title: 'Gérer les phrases existantes', desc: 'Utilisez les filtres langue + catégorie pour trouver les phrases. Cliquez sur l\'icône crayon pour modifier, ou la corbeille pour supprimer.' },
        ],
        tip: 'Le champ « Contexte » est précieux : il indique à l\'apprenant dans quelle situation utiliser la phrase (ex. : "Au marché, pour négocier un prix").',
      },
      {
        id: 'notifications',
        route: '/notifications',
        icon: BellIcon,
        title: 'Notifications',
        color: 'text-indigo-600',
        iconBg: 'bg-indigo-50',
        description: 'Envoi de notifications push aux utilisateurs de l\'application mobile.',
        features: [
          'Types : Système, Nouvelle leçon, Rappel d\'apprentissage, Badge, Événement culturel.',
          'Envoi à tous les utilisateurs ou à un utilisateur ciblé.',
          'Aperçu de la notification avant envoi.',
          'Historique complet des notifications envoyées.',
        ],
        steps: [
          { title: 'Envoyer une notification', desc: 'Choisissez le type. Saisissez le titre et le corps du message. Sélectionnez « Tous les utilisateurs » ou un utilisateur spécifique. Cliquez sur « Aperçu » pour vérifier le rendu, puis sur « Envoyer ».' },
          { title: 'Consulter l\'historique', desc: 'Faites défiler vers le bas pour voir toutes les notifications envoyées avec la date, le type et le nombre de destinataires.' },
        ],
        tip: 'Limitez les notifications à 2–3 par semaine pour éviter que les utilisateurs ne les désactivent.',
      },
      {
        id: 'premiers-secours',
        route: '/premiers-secours',
        icon: HeartIcon,
        title: 'Premiers Secours',
        color: 'text-red-700',
        iconBg: 'bg-red-50',
        description: 'Contenu de premiers secours en langues locales : consignes d\'urgence médicale traduites et enregistrées.',
        features: [
          'Situations : Appel secours, Arrêt cardiaque, Étouffement, Noyade, Brûlure, Fracture, Saignement, Malaise, Évaluation.',
          'Consigne en langue locale + traduction + transcription phonétique.',
          'Niveau de priorité : Vitale (2) / Urgente (1) / Info (0).',
          'Audio de chaque consigne.',
          'Filtrage par langue et par situation.',
        ],
        steps: [
          { title: 'Ajouter une consigne', desc: 'Cliquez sur « + Nouvelle consigne ». Sélectionnez la situation et la langue. Rédigez la consigne en langue locale et sa traduction. Définissez le niveau de priorité. Uploadez l\'audio.' },
          { title: 'Vérifier la cohérence', desc: 'Filtrez par situation pour vérifier que chaque situation couvre toutes les langues actives.' },
        ],
        tip: 'Faites valider chaque consigne par un professionnel de santé ET un locuteur natif avant publication. Ces contenus peuvent sauver des vies.',
      },
      {
        id: 'musee-tresors',
        route: '/musee-tresors',
        icon: BuildingLibraryIcon,
        title: 'Musée des Trésors',
        color: 'text-violet-700',
        iconBg: 'bg-violet-50',
        description: 'Gestion du patrimoine culturel ivoirien : artisanat, masques, tissus, musique et instruments.',
        features: [
          'Type de contenu unique : TRESOR.',
          'Titre en français + description en langue locale + traduction française.',
          'Audio optionnel pour la description en langue locale.',
          'Image du trésor (upload depuis le CMS).',
          'Source ethnique : association du trésor à une ethnie ou une région.',
          'Filtrage par langue dans l\'application mobile.',
        ],
        steps: [
          { title: 'Ajouter un trésor', desc: 'Cliquez sur « + Nouveau trésor ». Saisissez le titre et la description en langue locale. Ajoutez la traduction française. Sélectionnez l\'ethnie / la région source. Uploadez une image et un audio si disponible. Enregistrez.' },
          { title: 'Modifier un trésor', desc: 'Cliquez sur la fiche du trésor existant. Modifiez les champs souhaités. Enregistrez.' },
        ],
        tip: 'Indiquez toujours la source ethnique précise pour chaque trésor. Cela renforce la crédibilité culturelle et aide les apprenants à contextualiser le patrimoine.',
      },
      {
        id: 'arbre-vocabulaire',
        route: '/arbre-vocabulaire',
        icon: UserGroupIcon,
        title: 'Arbre à Palabres',
        color: 'text-green-700',
        iconBg: 'bg-green-50',
        description: 'Gestion du vocabulaire familial en langues locales : mots de la famille avec audio et filtrage par langue.',
        features: [
          'Mots de la famille : père, mère, frère, sœur, enfant, oncle, tante, grand-père, grand-mère…',
          'Mot en langue locale + traduction française + phonétique.',
          'Audio pour chaque mot (prononciation par un locuteur natif).',
          'Filtrage par langue dans l\'application mobile.',
        ],
        steps: [
          { title: 'Ajouter un mot de la famille', desc: 'Cliquez sur « + Nouveau mot ». Sélectionnez la langue. Saisissez le mot en langue locale, sa phonétique et sa traduction. Uploadez ou générez l\'audio. Enregistrez.' },
          { title: 'Vérifier la couverture', desc: 'Filtrez par langue pour vérifier que les termes essentiels de la famille sont couverts dans chaque langue active.' },
        ],
        tip: 'Le vocabulaire familial est souvent le premier apprentissage pour un débutant. Priorisez les termes les plus courants (père, mère, frère, enfant) dans chaque langue.',
      },
      {
        id: 'marche-dialogues',
        route: '/marche-dialogues',
        icon: ChatBubbleLeftRightIcon,
        title: 'Au Marché',
        color: 'text-orange-600',
        iconBg: 'bg-orange-50',
        description: 'Gestion des dialogues de négociation au marché : phrases pour marchander, demander le prix et comparer.',
        features: [
          'Phrases pratiques pour le marché en langues locales.',
          'Thèmes : demander un prix, négocier, comparer, remercier, saluer un vendeur.',
          'Phrase en langue locale + phonétique + traduction française.',
          'Audio pour chaque phrase.',
          'Filtrage par langue dans l\'application mobile.',
        ],
        steps: [
          { title: 'Ajouter une phrase', desc: 'Cliquez sur « + Nouvelle phrase ». Sélectionnez la langue. Saisissez la phrase en langue locale, la phonétique et la traduction. Uploadez l\'audio. Enregistrez.' },
          { title: 'Organiser par thème', desc: 'Renseignez le champ thème lors de la création pour permettre à l\'application mobile de grouper les phrases de façon logique (salutations au vendeur, négociation, clôture de la vente).' },
        ],
        tip: 'Ajoutez des phrases courtes et naturelles, telles qu\'elles seraient prononcées au marché. Évitez un langage trop formel ou littéraire.',
      },
      {
        id: 'carte-ci',
        route: '/carte-ci',
        icon: GlobeAltIcon,
        title: 'Carte de Côte d\'Ivoire',
        color: 'text-teal-700',
        iconBg: 'bg-teal-50',
        description: 'Carte interactive des langues par région : chaque région ivoirienne est associée à ses langues locales.',
        features: [
          'Carte interactive de Côte d\'Ivoire (PNG cliquable).',
          'Chaque région est associée à une ou plusieurs langues locales.',
          'Zoom molette et déplacement (drag) de la carte.',
          'Clic sur une région pour voir les langues parlées.',
          'Placement de marqueurs par glisser-déposer pour positionner les langues sur la carte.',
          'Sélecteur d\'émoji pour personnaliser les marqueurs.',
          'Vue plein écran disponible.',
        ],
        steps: [
          { title: 'Explorer la carte', desc: 'Accédez à /carte-ci. Utilisez la molette ou les boutons de zoom pour naviguer. Cliquez sur une région pour afficher les langues associées.' },
          { title: 'Ajouter ou déplacer un marqueur', desc: 'Faites glisser un marqueur de langue sur la carte pour ajuster sa position géographique. La position est sauvegardée automatiquement.' },
          { title: 'Personnaliser un marqueur', desc: 'Cliquez sur un marqueur existant. Utilisez le sélecteur d\'émoji pour choisir l\'icône associée à cette langue. Confirmez.' },
        ],
        tip: 'La carte est un outil pédagogique puissant pour les apprenants qui souhaitent comprendre la répartition géographique des langues ivoiriennes.',
      },
      {
        id: 'civisme',
        route: '/civisme',
        icon: BuildingLibraryIcon,
        title: 'Civisme',
        color: 'text-blue-800',
        iconBg: 'bg-blue-50',
        description: 'Contenu civique en langues locales : proverbes civiques, symboles de l\'État, droits & devoirs, institutions.',
        features: [
          'Types : Proverbe civique, Symbole de l\'État, Sensibilisation, Droits & Devoirs, Institution.',
          'Titre + contenu en langue locale + traduction + explication + valeur civique.',
          'Filtrage par type et par langue.',
          'Activation / désactivation de chaque entrée.',
        ],
        steps: [
          { title: 'Ajouter un contenu civique', desc: 'Cliquez sur « + Nouveau contenu ». Choisissez le type, la langue. Saisissez le titre, le contenu en langue locale, la traduction, l\'explication et la valeur promue (ex. : Solidarité, Respect, Démocratie).' },
          { title: 'Organiser par type', desc: 'Filtrez par type pour vérifier l\'équilibre entre Proverbes, Symboles et Droits & Devoirs.' },
        ],
        tip: 'Associez toujours un contenu civique à une valeur concrète (champ Valeur). Cela aide l\'apprenant à contextualiser le message.',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    color: 'gray',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-200 text-gray-700',
    modules: [
      {
        id: 'users',
        route: '/users',
        icon: UsersIcon,
        title: 'Utilisateurs',
        color: 'text-gray-700',
        iconBg: 'bg-gray-100',
        description: 'Gestion des comptes utilisateurs et des rôles d\'accès au CMS. Réservé aux administrateurs.',
        features: [
          'Liste complète des utilisateurs avec rôle, date d\'inscription, statut.',
          'Rôles disponibles : Utilisateur, Contributeur, Éditeur, Administrateur, Super-Administrateur.',
          'Modification du rôle d\'un utilisateur.',
          'Création de comptes éditeurs ou administrateurs.',
          'Suspension / réactivation d\'un compte.',
        ],
        steps: [
          { title: 'Modifier le rôle d\'un utilisateur', desc: 'Trouvez l\'utilisateur par son nom ou e-mail. Cliquez sur le badge de rôle. Sélectionnez le nouveau rôle dans le menu. Confirmez.' },
          { title: 'Créer un compte éditeur', desc: 'Cliquez sur « + Créer un compte ». Saisissez prénom, nom, e-mail. Sélectionnez le rôle « Éditeur ». Un e-mail d\'invitation est envoyé automatiquement.' },
          { title: 'Suspendre un compte', desc: 'Cliquez sur l\'utilisateur. Basculez « Compte actif » sur inactif. L\'utilisateur ne pourra plus se connecter au CMS ni à l\'application.' },
        ],
        tip: 'Principe du moindre privilège : attribuez le rôle le plus bas permettant d\'effectuer les tâches requises. Ne donnez le rôle Admin qu\'en cas de stricte nécessité.',
        adminOnly: true,
      },
      {
        id: 'profile',
        route: '/profile',
        icon: UsersIcon,
        title: 'Mon Profil',
        color: 'text-slate-600',
        iconBg: 'bg-slate-50',
        description: 'Modification des informations personnelles et du mot de passe du compte CMS connecté.',
        features: [
          'Modification du prénom, nom et e-mail.',
          'Changement de mot de passe.',
          'Affichage du rôle attribué.',
        ],
        steps: [
          { title: 'Modifier ses informations', desc: 'Cliquez sur votre nom en bas du menu latéral, puis « Profil ». Modifiez les champs souhaités. Cliquez sur « Enregistrer ».' },
          { title: 'Changer de mot de passe', desc: 'Dans la section mot de passe, entrez votre mot de passe actuel, puis le nouveau (min. 8 caractères). Confirmez et enregistrez.' },
        ],
        tip: 'Changez votre mot de passe tous les 3 mois et n\'utilisez pas le même que votre compte personnel.',
      },
    ],
  },
];

const ROLES = [
  { label: 'Super-Administrateur', color: 'bg-amber-100 text-amber-800', access: 'Accès complet à tous les modules.' },
  { label: 'Administrateur', color: 'bg-red-100 text-red-700', access: 'Accès complet sauf la gestion avancée des rôles.' },
  { label: 'Éditeur', color: 'bg-purple-100 text-purple-700', access: 'Création et modification de contenu. Pas d\'accès au module Utilisateurs.' },
  { label: 'Contributeur', color: 'bg-blue-100 text-blue-700', access: 'Soumission de contributions. Accès limité en lecture.' },
];

// ─── Composants ────────────────────────────────────────────────────────────────

function ModuleCard({ mod }) {
  const [open, setOpen] = useState(false);
  const [openSteps, setOpenSteps] = useState(false);
  const Icon = mod.icon;

  return (
    <div id={mod.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${mod.iconBg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${mod.color}`} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{mod.route}</p>
          <p className="text-[15px] font-semibold text-gray-800 truncate">{mod.title}</p>
        </div>
        {mod.adminOnly && (
          <span className="text-[10px] font-bold bg-red-100 text-red-600 rounded-full px-2 py-0.5 flex-shrink-0">Admin</span>
        )}
        {open
          ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{mod.description}</p>

          {/* Fonctionnalités */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fonctionnalités</p>
            <ul className="space-y-1.5">
              {mod.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${mod.iconBg} border ${mod.color.replace('text-', 'border-')}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Étapes */}
          <div>
            <button
              onClick={() => setOpenSteps(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
            >
              {openSteps ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
              Comment utiliser ce module ({mod.steps.length} étapes)
            </button>

            {openSteps && (
              <ol className="mt-3 space-y-3">
                {mod.steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${mod.iconBg} ${mod.color} flex items-center justify-center text-xs font-bold`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                      <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Conseil */}
          {mod.tip && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <LightBulbIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Conseil : </strong>{mod.tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section, searchQuery }) {
  const filtered = searchQuery
    ? section.modules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : section.modules;

  if (filtered.length === 0) return null;

  return (
    <div>
      <div className={`flex items-center gap-2 mb-3 pl-1`}>
        <span className={`inline-block w-2 h-5 rounded-sm ${section.bg} border ${section.border}`} />
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{section.label}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${section.badge}`}>
          {filtered.length} module{filtered.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-2 mb-6">
        {filtered.map(mod => <ModuleCard key={mod.id} mod={mod} />)}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function UserGuidePage() {
  const [search, setSearch] = useState('');
  const totalModules = SECTIONS.reduce((sum, s) => sum + s.modules.length, 0);
  const filteredCount = SECTIONS.reduce((sum, s) =>
    sum + s.modules.filter(m =>
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.features.some(f => f.toLowerCase().includes(search.toLowerCase()))
    ).length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B3D2E] to-[#1a5c45] px-6 py-10 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10">
              <BookOpenIcon className="w-7 h-7 text-white" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Guide d'utilisation du CMS</h1>
              <p className="text-green-200 text-sm">Langues Ivoire — Back-Office Éditorial</p>
            </div>
          </div>
          <p className="text-green-100 text-sm leading-relaxed mb-6 max-w-xl">
            Ce guide détaille tous les modules du CMS : fonctionnalités, étapes d'utilisation et conseils pratiques
            pour les éditeurs, administrateurs et contributeurs.
          </p>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Modules', value: totalModules },
              { label: 'Sections', value: SECTIONS.length },
              { label: 'Rôles', value: ROLES.length },
              { label: 'Routes', value: totalModules },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-green-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Rôles & Accès */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Rôles & Niveaux d'accès</h2>
          <div className="space-y-2">
            {ROLES.map(role => (
              <div key={role.label} className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${role.color}`}>
                  {role.label}
                </span>
                <p className="text-sm text-gray-600">{role.access}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Rechercher parmi les ${totalModules} modules…`}
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {search && (
          <p className="text-sm text-gray-500 -mt-4">
            {filteredCount} résultat{filteredCount > 1 ? 's' : ''} pour <strong>"{search}"</strong>
          </p>
        )}

        {/* Modules par section */}
        {SECTIONS.map(section => (
          <SectionBlock key={section.id} section={section} searchQuery={search} />
        ))}

        {/* Raccourcis clavier */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Raccourcis & Astuces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { keys: ['Ctrl', 'K'], desc: 'Ouvrir la recherche rapide (si disponible)' },
              { keys: ['Tab'], desc: 'Naviguer entre les champs d\'un formulaire' },
              { keys: ['Échap'], desc: 'Fermer une modale ou annuler' },
              { keys: ['Entrée'], desc: 'Valider un formulaire' },
            ].map(k => (
              <div key={k.desc} className="flex items-center gap-2">
                <div className="flex gap-1">
                  {k.keys.map(key => (
                    <kbd key={key} className="px-2 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded text-gray-700">{key}</kbd>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{k.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#0B3D2E] rounded-xl p-5 text-white">
          <h2 className="font-bold text-base mb-1">Assistance technique</h2>
          <p className="text-green-200 text-sm mb-3">En cas de problème avec le CMS, contactez l'équipe technique.</p>
          <div className="space-y-1.5">
            {[
              ['✉', 'support@langues-ivoire.com'],
              ['🌐', 'www.langues-ivoire.com'],
            ].map(([icon, val]) => (
              <p key={val} className="text-sm text-green-100">{icon} {val}</p>
            ))}
          </div>
          <p className="text-xs text-green-300 mt-3 italic">Réponse sous 48 heures ouvrables.</p>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
