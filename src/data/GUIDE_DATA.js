// GUIDE_DATA.js — Source unique de vérité pour la formation CMS Langues Ivoire
// Utilisé par UserGuidePage et PageHelp (tutoriels contextuels par module)

export const GUIDE_SECTIONS = [
  { id: 'dashboard', label: 'Général', color: 'slate' },
  { id: 'contenu', label: 'Contenu Principal', color: 'indigo' },
  { id: 'sos', label: 'SOS & Santé', color: 'red' },
  { id: 'medias', label: 'Médias & Audio', color: 'purple' },
  { id: 'communaute', label: 'Communauté', color: 'orange' },
  { id: 'ia', label: 'Intelligence Artificielle', color: 'cyan' },
  { id: 'app', label: 'Paramètres Application', color: 'green' },
  { id: 'education', label: 'Éducation & Vie Pratique', color: 'teal' },
  { id: 'partenaires', label: 'Partenaires', color: 'emerald' },
  { id: 'finance', label: 'Finance', color: 'amber' },
  { id: 'admin', label: 'Administration', color: 'gray' },
];

export const GUIDE_MODULES = [
  // ─────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────
  {
    id: 'dashboard',
    route: '/',
    section: 'dashboard',
    icon: '📊',
    title: 'Tableau de Bord',
    subtitle: 'Vue d\'ensemble de l\'activité',
    color: 'slate',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le tableau de bord offre une vue d\'ensemble de toute l\'activité du CMS : statistiques clés en temps réel, contributions récentes à modérer et indicateurs de santé du contenu. C\'est le point d\'entrée quotidien pour piloter la plateforme.',
    objectifs: [
      'Surveiller l\'activité globale de la plateforme en un coup d\'œil',
      'Détecter rapidement les contenus en attente de modération',
      'Suivre la croissance du corpus linguistique et des utilisateurs',
    ],
    features: [
      'Compteurs en temps réel : mots, leçons, utilisateurs, contributions',
      'Graphique d\'activité sur les 7 derniers jours',
      'Liste des contributions récentes avec statut et action rapide',
      'Accès rapide aux modules les plus utilisés',
    ],
    steps: [
      { title: 'Lire les statistiques clés', desc: 'Consultez les compteurs principaux (mots, leçons, utilisateurs actifs, contributions en attente) pour évaluer l\'état général de la plateforme.', warning: null },
      { title: 'Vérifier les contributions en attente', desc: 'Repérez dans la liste les contributions soumises par la communauté qui nécessitent une validation ou un rejet.', warning: null },
      { title: 'Accéder aux modules prioritaires', desc: 'Utilisez les raccourcis du tableau de bord pour naviguer directement vers les modules nécessitant une action urgente.', warning: null },
    ],
    workflows: [
      {
        title: 'Routine matinale de modération',
        steps: [
          'Ouvrir le tableau de bord dès la connexion',
          'Vérifier le compteur de contributions en attente',
          'Si contributions > 0, aller dans le module Contributions pour modérer',
          'Consulter le graphique d\'activité pour détecter toute anomalie',
          'Revenir au tableau de bord en fin de session pour vérifier les indicateurs',
        ],
      },
    ],
    tip: 'Consultez le tableau de bord chaque matin avant de travailler sur d\'autres modules. C\'est le meilleur moyen de détecter rapidement ce qui nécessite une action prioritaire.',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : CONTENU PRINCIPAL
  // ─────────────────────────────────────────────
  {
    id: 'dictionnaire',
    route: '/dictionary',
    section: 'contenu',
    icon: '📖',
    title: 'Dictionnaire',
    subtitle: 'Base de données lexicale principale',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le dictionnaire est la base de données principale des mots en langues ivoiriennes. Chaque entrée contient la traduction française, la phonétique, des exemples d\'usage et jusqu\'à 4 enregistrements audio distincts (locuteur masculin local, locutrice féminine locale, locuteur masculin français, locutrice féminine française). C\'est le cœur du corpus linguistique.',
    objectifs: [
      'Enrichir progressivement le lexique de chaque langue ivoirienne',
      'Maintenir la qualité et la cohérence de chaque entrée',
      'Associer les 4 audios M/F (local et français) à chaque mot',
      'Documenter la phonétique pour les langues à tons',
      'Permettre la recherche et le filtrage efficaces du corpus',
    ],
    features: [
      'Filtres par langue, catégorie grammaticale et niveau',
      'Formulaire d\'ajout complet : langue, mot local, traduction, phonétique, catégorie, exemple',
      '4 champs audio distincts : 👨 locuteur local, 👩 locutrice locale, 👨 locuteur français, 👩 locutrice française',
      'Génération audio assistée par IA pour compléter les enregistrements manquants',
      'Recherche en temps réel dans tout le corpus',
      'Export du lexique possible pour archivage',
    ],
    steps: [
      { title: 'Ajouter un nouveau mot', desc: 'Cliquer sur "+ Ajouter un mot", sélectionner la langue, saisir le mot en langue locale, sa traduction française, sa catégorie grammaticale et un exemple d\'usage en contexte.', warning: null },
      { title: 'Renseigner la phonétique', desc: 'Saisir la transcription phonétique entre crochets [ ] en utilisant les caractères API disponibles (ɛ, ɔ, ŋ, ɲ, etc.). Indispensable pour les langues à tons.', warning: 'Toujours noter la phonétique entre crochets [ ] pour les langues à tons telles que le Baoulé ou le Dioula. Une phonétique incomplète nuit à l\'apprentissage de la prononciation.' },
      { title: 'Uploader les 4 audios', desc: 'Pour chaque mot, importer les 4 enregistrements : 👨 locuteur natif masculin, 👩 locutrice native féminine, 👨 traducteur français masculin, 👩 traductrice française féminine. Utiliser le module Import Audio pour les uploads en masse.', warning: null },
      { title: 'Vérifier la prononciation', desc: 'Écouter chaque audio importé pour confirmer la qualité sonore, l\'absence de bruit de fond et la justesse de la prononciation du mot.', warning: null },
      { title: 'Publier l\'entrée', desc: 'Une fois tous les champs validés, passer le statut en "Publié". L\'entrée sera immédiatement disponible dans l\'application mobile.', warning: null },
    ],
    workflows: [
      {
        title: 'Ajout d\'un lot de mots avec un tuteur natif',
        steps: [
          'Préparer la liste de mots avec le tuteur natif de la langue',
          'Enregistrer les 4 audios par mot (tuteur masc. local, tuteure fém. locale, voix française masc., voix française fém.)',
          'Nommer les fichiers selon la convention : [code_langue]_[mot]_[genre]_[numéro].mp3',
          'Importer les audios en masse via le module Import Audio',
          'Créer chaque entrée dans le Dictionnaire en copiant les URLs audio',
          'Vérifier 3 entrées au hasard avant de publier le lot',
        ],
      },
    ],
    tip: 'Un mot sans audio est deux fois moins utilisable dans l\'application. Priorisez toujours l\'enregistrement avec les tuteurs de la langue, même si cela signifie publier moins de mots mais avec une qualité complète.',
    warnings: [
      'Toujours noter la phonétique entre crochets [ ] pour les langues à tons.',
    ],
    audioNaming: null,
  },

  {
    id: 'conjugaison',
    route: '/conjugation',
    section: 'contenu',
    icon: '🔤',
    title: 'Conjugaison',
    subtitle: 'Tables verbales par aspect',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Conjugaison documente les tables verbales des langues ivoiriennes, organisées par aspect (accompli / inaccompli) plutôt que par temps grammaticaux comme en français. Chaque forme conjuguée peut être associée à un enregistrement audio pour faciliter l\'apprentissage de la prononciation.',
    objectifs: [
      'Documenter la grammaire verbale de chaque langue ivoirienne',
      'Expliquer le concept d\'aspect (accompli/inaccompli) aux apprenants',
      'Associer des audios de prononciation à chaque forme conjuguée',
      'Fournir des exemples d\'usage en contexte pour chaque aspect',
    ],
    features: [
      'Création de fiches de verbes avec nom, traduction et langue associée',
      'Formes conjuguées organisées par aspect (accompli, inaccompli, impératif)',
      'Support des diacritiques phonétiques : ɛ, ɔ, ŋ, ɲ, tons haut/bas',
      'Association d\'un audio de prononciation par forme conjuguée',
      'Filtrage par langue et aspect',
    ],
    steps: [
      { title: 'Créer un verbe', desc: 'Cliquer sur "+ Nouveau verbe", saisir le nom du verbe en langue locale, sa traduction française et sélectionner la langue d\'appartenance.', warning: null },
      { title: 'Remplir les formes par aspect', desc: 'Pour chaque aspect (accompli, inaccompli), saisir les formes conjuguées à chaque personne grammaticale disponible dans la langue. Utiliser les touches diacritiques disponibles.', warning: null },
      { title: 'Associer les audios de prononciation', desc: 'Pour les formes les plus utilisées, uploader un enregistrement audio d\'un locuteur natif prononçant la forme complète.', warning: null },
    ],
    workflows: [
      {
        title: 'Documentation complète d\'un verbe courant',
        steps: [
          'Choisir un verbe fréquent avec le tuteur natif (ex : manger, aller, parler)',
          'Créer la fiche verbe avec nom local et traduction',
          'Remplir toutes les formes accompli avec le tuteur',
          'Remplir toutes les formes inaccompli',
          'Enregistrer les audios des formes les plus courantes',
          'Publier la fiche',
        ],
      },
    ],
    tip: 'Les langues ivoiriennes n\'ont pas de temps grammaticaux mais des aspects. Expliquez toujours dans la description la différence entre l\'accompli (action terminée) et l\'inaccompli (action en cours ou répétée) pour aider les apprenants francophones.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'vocabulaire',
    route: '/vocabulary',
    section: 'contenu',
    icon: '📝',
    title: 'Vocabulaire',
    subtitle: 'Listes thématiques illustrées',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Vocabulaire organise des listes thématiques de mots associées aux leçons et galeries d\'images de l\'application mobile. Chaque thème (animaux, couleurs, corps humain, aliments...) regroupe des entrées avec image et audio pour un apprentissage visuel et auditif.',
    objectifs: [
      'Organiser le lexique en thèmes cohérents pour l\'apprentissage',
      'Associer chaque mot à une image et un audio pour mémorisation efficace',
      'Lier les listes de vocabulaire aux leçons correspondantes',
    ],
    features: [
      'Organisation par thèmes (animaux, couleurs, corps, aliments, lieux, objets...)',
      'Association aux leçons et niveaux (A1-C1)',
      'Import CSV pour les listes volumineuses',
      'Audio + image par entrée',
      'Filtrage par langue, thème et niveau',
    ],
    steps: [
      { title: 'Créer un thème', desc: 'Cliquer sur "+ Nouveau thème", saisir le nom du thème en français, choisir la langue et le niveau cible.', warning: null },
      { title: 'Ajouter les mots du thème', desc: 'Pour chaque mot, saisir le terme en langue locale, la traduction, la phonétique, uploader une image représentative et un audio de prononciation.', warning: null },
      { title: 'Lier aux leçons', desc: 'Dans les paramètres du thème, associer la liste aux leçons correspondantes pour qu\'elle apparaisse dans les exercices de vocabulaire.', warning: null },
    ],
    workflows: [
      {
        title: 'Création d\'un thème "Les animaux" en Dioula',
        steps: [
          'Créer le thème "Les animaux" pour la langue Dioula, niveau A1',
          'Lister 10-15 animaux courants avec le tuteur natif',
          'Photographier ou sourcer des images libres de droits',
          'Enregistrer les audios de prononciation',
          'Importer via CSV ou saisie manuelle',
          'Associer la liste à la leçon A1 correspondante',
        ],
      },
    ],
    tip: 'Priorisez les thèmes les plus utiles en A1 : salutations, chiffres, couleurs, corps humain, famille, aliments. Ces thèmes couvrent 80% des besoins des débutants.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'lecons',
    route: '/lessons',
    section: 'contenu',
    icon: '🎓',
    title: 'Leçons',
    subtitle: 'Parcours pédagogiques A1-C1',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Leçons permet de créer des parcours pédagogiques complets structurés par langue et niveau (A1 à C1). Chaque leçon est composée d\'étapes interactives de types variés (vocabulaire, dialogue, grammaire, exercice) organisées par glisser-déposer.',
    objectifs: [
      'Créer des parcours pédagogiques complets et progressifs',
      'Structurer le contenu par niveau selon le Cadre Européen Commun (A1-C1)',
      'Définir des exercices interactifs variés pour maintenir l\'engagement',
      'Organiser les étapes de manière logique et pédagogique',
    ],
    features: [
      'Niveaux A1, A2, B1, B2, C1 conformes au CECRL',
      'Types d\'étapes : Vocabulaire, Dialogue, Grammaire, Exercice (QCM, traduction, association)',
      'Éditeur d\'étapes avec drag & drop pour réorganiser',
      'Durée estimée de la leçon',
      'Publication et dépublication à la demande',
      'Filtrage par langue, niveau et statut',
    ],
    steps: [
      { title: 'Créer la leçon', desc: 'Cliquer sur "+ Nouvelle leçon", saisir le titre, sélectionner la langue, le niveau (A1-C1) et estimer la durée (en minutes).', warning: null },
      { title: 'Ajouter des étapes', desc: 'Dans l\'éditeur de la leçon, cliquer sur "+ Ajouter une étape" et choisir le type parmi Vocabulaire, Dialogue, Grammaire ou Exercice.', warning: null },
      { title: 'Configurer chaque étape', desc: 'Vocabulaire : sélectionner les mots depuis le dictionnaire. Dialogue : créer les échanges entre personnages. Grammaire : saisir la règle et les exemples. Exercice : définir le type (QCM, traduction, association) et les questions.', warning: null },
      { title: 'Réorganiser par drag & drop', desc: 'Glisser les étapes dans l\'ordre pédagogique optimal : commencer par le vocabulaire, enchaîner avec le dialogue, consolider avec la grammaire, terminer par l\'exercice.', warning: null },
      { title: 'Publier', desc: 'Une fois toutes les étapes validées, cliquer sur "Publier". La leçon sera visible dans l\'application mobile pour le niveau et la langue correspondants.', warning: null },
    ],
    workflows: [
      {
        title: 'Création d\'une leçon A1 "Les salutations en Baoulé"',
        steps: [
          'Créer la leçon : titre "Les salutations", langue Baoulé, niveau A1, durée 12 min',
          'Étape 1 Vocabulaire : sélectionner 6 mots (bonjour, bonsoir, merci, au revoir, comment allez-vous, bien)',
          'Étape 2 Dialogue : créer un échange de 4 répliques entre Kouadio et Zélé',
          'Étape 3 Grammaire : documenter la règle de politesse (ton de respect)',
          'Étape 4 Exercice QCM : 5 questions sur les salutations vues',
          'Relire le parcours complet, réorganiser si besoin',
          'Publier la leçon',
        ],
      },
    ],
    tip: 'Une bonne leçon suit la structure : 5-10 mots de vocabulaire → 1 dialogue court → 1 point de grammaire → 1 exercice de consolidation. Visez 10-15 minutes de durée pour maintenir l\'attention.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'culture',
    route: '/cultural',
    section: 'contenu',
    icon: '🌍',
    title: 'Culture & Traditions',
    subtitle: 'Contenus culturels quotidiens',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module gère les contenus culturels qui apparaissent quotidiennement sur l\'écran d\'accueil de l\'application : proverbes, traditions, coutumes, gastronomie et événements. Chaque contenu est disponible en langue locale avec traduction française et, idéalement, accompagné de 4 audios M/F.',
    objectifs: [
      'Proposer une immersion culturelle quotidienne aux apprenants',
      'Documenter le patrimoine immatériel ivoirien (proverbes, coutumes, gastronomie)',
      'Couvrir toutes les langues de manière équilibrée',
    ],
    features: [
      'Types multiples : Proverbe, Tradition, Coutume, Gastronomie, Événement culturel',
      'Texte en langue locale + traduction française + explication contextuelle',
      '4 champs audio M/F (locuteur local masculin, local féminin, français masculin, français féminin)',
      'Image optionnelle illustrant le contenu',
      'Publication programmée (date et heure)',
      'Filtrage par langue, type et statut',
    ],
    steps: [
      { title: 'Créer un contenu culturel', desc: 'Cliquer sur "+ Ajouter", choisir le type (Proverbe, Tradition...), sélectionner la langue, saisir le texte en langue locale.', warning: null },
      { title: 'Compléter la traduction et l\'explication', desc: 'Ajouter la traduction française littérale et une explication culturelle qui donne le contexte et la signification profonde.', warning: null },
      { title: 'Uploader les médias', desc: 'Ajouter les 4 audios M/F et une image représentative si disponible.', warning: null },
      { title: 'Programmer la publication', desc: 'Définir la date à laquelle ce contenu apparaîtra sur l\'écran d\'accueil de l\'application, ou publier immédiatement.', warning: null },
    ],
    workflows: [
      {
        title: 'Publication d\'un proverbe Sénoufo',
        steps: [
          'Recueillir le proverbe auprès du tuteur natif Sénoufo',
          'Transcrire le texte en Sénoufo avec phonétique',
          'Rédiger la traduction française et l\'explication culturelle',
          'Enregistrer les 4 audios avec le tuteur et une voix française',
          'Programmer la publication pour le lendemain matin',
        ],
      },
    ],
    tip: 'Variez les langues et les types de contenus pour offrir une diversité culturelle chaque jour sur l\'écran d\'accueil mobile. Idéalement, planifiez 2 semaines de contenus à l\'avance.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'textes',
    route: '/textes-recits',
    section: 'contenu',
    icon: '📜',
    title: 'Textes & Récits',
    subtitle: 'Patrimoine oral numérisé',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module permet de numériser et archiver le patrimoine oral ivoirien : contes, chansons traditionnelles, proverbes développés, poèmes, légendes, discours traditionnels et récits historiques. Chaque texte est accompagné de sa traduction, de l\'audio d\'un lecteur natif et de ses informations de source.',
    objectifs: [
      'Numériser et préserver le patrimoine oral ivoirien',
      'Rendre accessible aux apprenants des textes authentiques',
      'Documenter les sources pour respecter les droits culturels',
    ],
    features: [
      'Types de textes : Conte, Chanson, Histoire, Proverbe, Poème, Récit, Légende, Discours traditionnel',
      'Texte complet en langue locale avec traduction française',
      'Audio d\'un lecteur natif lisant le texte complet',
      'Champs auteur, ethnie d\'origine et source (tradition orale, griot, institution)',
      'Filtrage par langue, type et ethnie',
    ],
    steps: [
      { title: 'Sélectionner le type de texte', desc: 'Choisir parmi Conte, Chanson, Histoire, Proverbe, Poème, Récit, Légende ou Discours.', warning: null },
      { title: 'Saisir le texte complet', desc: 'Transcrire le texte en langue locale dans l\'éditeur, puis ajouter la traduction française paragraphe par paragraphe.', warning: null },
      { title: 'Renseigner les métadonnées de source', desc: 'Indiquer l\'auteur ou le conteur, l\'ethnie d\'origine, la région et la source (tradition orale transmise par..., Institution des Langues...).', warning: 'Indiquer toujours la source (tradition orale, ethnie, auteur ou conteur) pour respecter le patrimoine culturel et les droits des communautés.' },
      { title: 'Uploader l\'audio de lecture', desc: 'Importer l\'enregistrement d\'un lecteur natif lisant l\'intégralité du texte. Ce fichier peut être long (plusieurs minutes pour les contes).', warning: null },
    ],
    workflows: [
      {
        title: 'Numérisation d\'un conte Guéré',
        steps: [
          'Identifier un conteur Guéré reconnu dans la communauté',
          'Enregistrer la narration orale complète',
          'Transcrire le texte en langue Guéré avec le tuteur natif',
          'Traduire paragraphe par paragraphe en français',
          'Documenter le nom du conteur, son village et son ethnie',
          'Importer l\'audio et publier la fiche',
        ],
      },
    ],
    tip: 'Priorisez les contes et légendes : ce sont les textes les plus engageants pour les apprenants. Commencez par les textes courts (proverbes développés) avant d\'attaquer les contes longs.',
    warnings: [
      'Indiquer toujours la source (tradition orale, ethnie, auteur) pour respecter le patrimoine culturel et les droits des communautés.',
    ],
    audioNaming: null,
  },

  {
    id: 'galeries',
    route: '/image-galleries',
    section: 'contenu',
    icon: '🖼️',
    title: 'Galeries d\'Images',
    subtitle: 'Collections visuelles thématiques',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Galeries d\'Images gère les collections d\'images thématiques utilisées pour le vocabulaire visuel dans l\'application. Chaque image est associée à un mot du dictionnaire et peut être accompagnée d\'un audio de prononciation, formant ainsi un ensemble multimédia cohérent.',
    objectifs: [
      'Illustrer visuellement le vocabulaire pour faciliter la mémorisation',
      'Organiser les images par thèmes et langues',
      'Associer chaque image à son mot et à son audio correspondant',
    ],
    features: [
      'Galeries organisées par thème et par langue',
      'Upload d\'images directement depuis le CMS (JPEG, PNG, WebP)',
      'Association mot ↔ image ↔ audio pour chaque entrée',
      'Organisation par rubriques et sous-rubriques thématiques',
      'Filtrage par langue et thème',
    ],
    steps: [
      { title: 'Créer une galerie', desc: 'Cliquer sur "+ Nouvelle galerie", saisir le nom du thème, sélectionner la langue cible.', warning: null },
      { title: 'Uploader les images', desc: 'Glisser les images dans la zone d\'upload ou cliquer pour sélectionner les fichiers. Formats acceptés : JPEG, PNG, WebP. Résolution recommandée : 800×600px minimum.', warning: null },
      { title: 'Associer les mots et audios', desc: 'Pour chaque image uploadée, renseigner le mot du dictionnaire correspondant et, si disponible, copier l\'URL de l\'audio de prononciation.', warning: null },
    ],
    workflows: [],
    tip: 'Utilisez des images claires, bien éclairées et sur fond uni ou blanc pour les objets. Les images floues ou surchargées nuisent à l\'apprentissage du vocabulaire visuel.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'sens-des-mots',
    route: '/sens-mots',
    section: 'contenu',
    icon: '🔍',
    title: 'Sens des Mots',
    subtitle: 'Rectification des sens historiques',
    color: 'indigo',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Module pédagogique unique qui documente les divergences entre les traductions coloniales historiques et les significations culturelles réelles des mots ivoiriens. Chaque fiche met en regard le sens historique souvent erroné et le sens véritable validé par des locuteurs natifs ou des institutions linguistiques.',
    objectifs: [
      'Corriger les erreurs de traduction issues de la période coloniale',
      'Valoriser et restituer la signification culturelle authentique des mots',
      'Éduquer les apprenants sur l\'histoire linguistique de la Côte d\'Ivoire',
      'Constituer un corpus de référence validé par des autorités linguistiques',
    ],
    features: [
      'Fiche par mot : terme source, phonétique, sens historique barré, sens véritable mis en valeur',
      'Champ contextuel expliquant l\'origine de la divergence historique',
      'Champ source / validateur (locuteur natif, Institut des Langues, académicien)',
      '1 audio de prononciation native uploadable par fiche',
      'Filtres par langue et statut de publication',
      'Statuts : Brouillon, Publié, Archivé',
    ],
    steps: [
      { title: 'Créer une nouvelle fiche', desc: 'Cliquer sur "+ Ajouter une fiche" pour ouvrir le formulaire de création.', warning: null },
      { title: 'Sélectionner la langue', desc: 'Choisir la langue ivoirienne concernée par la divergence sémantique.', warning: null },
      { title: 'Saisir le mot et sa phonétique', desc: 'Entrer le mot source en langue locale et sa transcription phonétique entre crochets [ ].', warning: null },
      { title: 'Documenter le sens historique erroné', desc: 'Renseigner la traduction coloniale ou historiquement inexacte. Ce sens apparaîtra barré dans l\'interface pour signifier qu\'il est à corriger.', warning: null },
      { title: 'Renseigner le sens véritable', desc: 'Saisir la signification culturelle réelle du mot, validée par des locuteurs natifs ou une autorité linguistique.', warning: null },
      { title: 'Expliquer le contexte de la divergence', desc: 'Rédiger un texte expliquant pourquoi et comment cette erreur de sens est apparue dans l\'histoire (contexte colonial, mauvaise transcription, etc.).', warning: null },
      { title: 'Indiquer la source', desc: 'Renseigner le nom du locuteur natif, de l\'institution ou de l\'académicien qui a validé le sens véritable.', warning: null },
      { title: 'Uploader l\'audio de prononciation', desc: 'Importer l\'enregistrement d\'un locuteur natif prononçant le mot correctement.', warning: null },
      { title: 'Publier', desc: 'Changer le statut de Brouillon à Publié pour rendre la fiche accessible dans l\'application.', warning: null },
    ],
    workflows: [
      {
        title: 'Création d\'une fiche de rectification sémantique',
        steps: [
          'Identifier un mot avec une divergence connue (ex. via un griot ou un linguiste)',
          'Rechercher les sources historiques de la traduction erronée',
          'Rencontrer un locuteur natif reconnu ou contacter l\'Institut des Langues',
          'Créer la fiche avec les deux sens et le contexte explicatif',
          'Faire valider la fiche par la source avant publication',
          'Publier après validation',
        ],
      },
    ],
    tip: 'Chaque fiche doit être validée par un locuteur natif ou une autorité linguistique reconnue (Institut des Langues de Côte d\'Ivoire, linguiste universitaire) avant publication. La rigueur scientifique est essentielle pour ce module.',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : SOS & SANTÉ
  // ─────────────────────────────────────────────
  {
    id: 'phrases-sos',
    route: '/phrases-sos',
    section: 'sos',
    icon: '🆘',
    title: 'Phrases SOS',
    subtitle: 'Phrases d\'urgence médicale',
    color: 'red',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module gère les phrases vitales pour les situations d\'urgence médicale ainsi que les localisations corporelles douloureuses ("Où j\'ai mal ?"). Ces phrases sont disponibles dans les 9 langues ivoiriennes MVP et chacune dispose de 2 enregistrements audio : langue locale et narration française.',
    objectifs: [
      'Couvrir toutes les situations d\'urgence médicale courantes',
      'Fournir les 2 audios (langue locale + narration française) pour chaque phrase d\'urgence',
      'Couvrir les 8 parties du corps les plus fréquemment douloureuses',
      'Assurer la disponibilité dans les 9 langues dont le Yacouba',
    ],
    features: [
      'Deux onglets dédiés : Phrases d\'urgence et Où j\'ai mal ?',
      'Support des 9 langues dont le Yacouba',
      'Sélecteur d\'emoji illustrant chaque situation d\'urgence',
      '2 champs audio : 🌍 langue locale + 🇫🇷 narration française',
      'Sélecteur de genre du locuteur (M / F / non renseigné)',
      'Statuts de publication : PUBLISHED / DRAFT',
    ],
    steps: [
      { title: 'Choisir l\'onglet approprié', desc: 'Sélectionner "Urgences" pour les phrases médicales critiques ou "Corps" pour les localisations de douleur.', warning: null },
      { title: 'Créer une nouvelle phrase', desc: 'Cliquer sur "+ Ajouter", sélectionner la langue et choisir la situation d\'urgence ou la partie du corps concernée.', warning: null },
      { title: 'Saisir la phrase', desc: 'Renseigner la phrase en langue locale, sa phonétique et sa traduction française.', warning: null },
      { title: 'Uploader les 2 audios', desc: 'Importer l\'audio en langue locale (enregistrement natif) puis l\'audio de narration française du même locuteur. Utiliser le sélecteur de genre pour préciser M ou F.', warning: 'Ces phrases sont utilisées dans des situations médicales critiques. Vérifier impérativement la traduction et la prononciation avec un locuteur natif AVANT publication.' },
      { title: 'Publier immédiatement', desc: 'Ces contenus sont prioritaires. Publier dès que la vérification est faite pour qu\'ils soient disponibles dans l\'application.', warning: null },
    ],
    workflows: [
      {
        title: 'Couverture complète en Dioula',
        steps: [
          'Lister les 15 situations d\'urgence les plus fréquentes avec le tuteur Dioula',
          'Enregistrer les 2 audios par phrase (langue locale + narration française)',
          'Vérifier chaque traduction avec un professionnel de santé bilingue si possible',
          'Créer et publier toutes les fiches Dioula',
          'Répéter pour les 8 autres langues',
        ],
      },
    ],
    tip: 'Priorisez les phrases les plus vitales : "Appelez une ambulance", "Je n\'arrive pas à respirer", "J\'ai une douleur dans la poitrine", "Je saigne beaucoup". Ces 4 phrases peuvent sauver des vies.',
    warnings: [
      'Ces phrases sont utilisées dans des situations médicales critiques. Vérifier impérativement la traduction avec un locuteur natif avant publication.',
    ],
    audioNaming: null,
  },

  {
    id: 'phrases-utiles',
    route: '/phrases-utiles',
    section: 'sos',
    icon: '💬',
    title: 'Phrases Utiles',
    subtitle: 'Phrasebook multilingue du quotidien',
    color: 'red',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Phrasebook multilingue couvrant les expressions de la vie quotidienne : salutations, expressions courantes, nourriture, lieux, vie sociale et plus. Chaque phrase dispose de 2 audios (langue locale + narration française) et d\'informations de contexte d\'usage pour aider les apprenants à employer les expressions de manière appropriée.',
    objectifs: [
      'Constituer un phrasebook pratique pour la vie quotidienne en Côte d\'Ivoire',
      'Couvrir les situations sociales les plus fréquentes',
      'Fournir un contexte d\'usage pour chaque expression',
    ],
    features: [
      'Catégories : Expressions, Salutations, Nourriture, Vie quotidienne, Vie sociale, Corps, Lieux',
      '2 audios par phrase : 🌍 langue locale + 🇫🇷 narration française',
      'Sélecteur de genre du locuteur (M / F / non renseigné)',
      'Champ contexte d\'usage (quand et comment utiliser la phrase)',
      'Filtres par langue, catégorie et statut',
    ],
    steps: [
      { title: 'Créer une nouvelle phrase', desc: 'Cliquer sur "+ Ajouter une phrase" pour ouvrir le formulaire.', warning: null },
      { title: 'Sélectionner langue et catégorie', desc: 'Choisir la langue ivoirienne et la catégorie thématique parmi les 7 disponibles.', warning: null },
      { title: 'Saisir la phrase', desc: 'Entrer la phrase en langue locale, ajouter la phonétique entre crochets [ ] et la traduction française.', warning: null },
      { title: 'Préciser le contexte d\'usage', desc: 'Renseigner quand et comment utiliser cette expression (ex. : "Utilisé uniquement entre amis proches", "Formule de politesse formelle").', warning: null },
      { title: 'Uploader les 2 audios', desc: 'Importer l\'audio en langue locale (enregistrement natif) puis l\'audio de narration française. Le sélecteur de genre permet de préciser si le locuteur est masculin, féminin ou non renseigné.', warning: null },
      { title: 'Indiquer le genre du locuteur', desc: 'Préciser si la phrase s\'adresse ou est prononcée par un homme, une femme ou les deux indifféremment.', warning: null },
      { title: 'Publier', desc: 'Changer le statut en Publié pour rendre la phrase accessible dans le phrasebook de l\'application.', warning: null },
    ],
    workflows: [
      {
        title: 'Constitution du phrasebook "Salutations" pour toutes les langues',
        steps: [
          'Lister les 10 salutations essentielles (bonjour matin, bonjour soir, comment vas-tu, merci, au revoir, etc.)',
          'Pour chaque langue, recueillir les 10 salutations avec le tuteur natif',
          'Enregistrer les 2 audios par salutation (langue locale + narration française)',
          'Créer les 90 fiches (10 phrases × 9 langues)',
          'Vérifier les contextes d\'usage (formelle/informelle, matinal/vespéral)',
        ],
      },
    ],
    tip: 'Commencez par la catégorie Salutations dans toutes les langues — c\'est la première chose qu\'un apprenant cherche à utiliser et cela donne une bonne première impression de l\'application.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'premiers-secours',
    route: '/premiers-secours',
    section: 'sos',
    icon: '🏥',
    title: 'Premiers Secours',
    subtitle: 'Protocoles médicaux traduits',
    color: 'red',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module contient les protocoles de premiers secours traduits dans les langues ivoiriennes. Chaque situation (étouffement, arrêt cardiaque, fracture, brûlure...) est documentée avec des consignes étape par étape, des schémas illustratifs et les 4 audios M/F pour une utilisation en situation d\'urgence même sans lecture.',
    objectifs: [
      'Fournir des protocoles de premiers secours accessibles dans toutes les langues',
      'Structurer les consignes de manière claire et chronologique',
      'Permettre l\'utilisation audio en situation d\'urgence',
    ],
    features: [
      '11 situations couvertes : étouffement, arrêt cardiaque, fracture, brûlure, plaie, convulsion, noyade, intoxication, choc, morsure, accouchement d\'urgence',
      'Consignes étape par étape numérotées',
      'Images schématiques illustrant les gestes',
      '4 audios M/F par protocole',
      'Niveaux de priorité visuels : Information, Important, Vital',
    ],
    steps: [
      { title: 'Sélectionner la situation', desc: 'Choisir parmi les 11 situations de premiers secours prédéfinies.', warning: null },
      { title: 'Rédiger les consignes', desc: 'Saisir chaque étape du protocole en langue locale et en français. Utiliser des phrases courtes, des verbes à l\'impératif, numéroter chaque geste.', warning: 'Contenu médical sensible. Faire valider le protocole par un professionnel de santé avant publication.' },
      { title: 'Définir les niveaux de priorité', desc: 'Marquer les étapes critiques comme "Vital" (rouge), les mises en garde importantes comme "Important" (orange) et les informations de contexte comme "Information" (bleu).', warning: null },
      { title: 'Uploader les schémas et audios', desc: 'Ajouter les images illustrant les gestes et les 4 enregistrements audio M/F du protocole complet.', warning: null },
    ],
    workflows: [],
    tip: 'Rédigez les consignes dans un langage simple et direct. En situation d\'urgence, le lecteur est sous stress — chaque étape doit être comprise immédiatement sans ambiguïté.',
    warnings: [
      'Contenu médical sensible. Faire valider par un professionnel de santé (médecin, infirmier, secouriste certifié) avant toute publication.',
    ],
    audioNaming: null,
  },

  {
    id: 'civisme',
    route: '/civisme',
    section: 'sos',
    icon: '🏛️',
    title: 'Civisme',
    subtitle: 'Éducation citoyenne multilingue',
    color: 'red',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Civisme gère les contenus civiques et institutionnels destinés à l\'éducation citoyenne dans les langues ivoiriennes : droits et devoirs du citoyen, institutions de l\'État, procédures administratives courantes, hygiène publique et vie en communauté.',
    objectifs: [
      'Éduquer les citoyens sur leurs droits et devoirs dans leur langue maternelle',
      'Rendre accessibles les institutions et procédures administratives ivoiriennes',
    ],
    features: [
      'Types de contenus civiques variés (droits, devoirs, institutions, procédures)',
      'Texte en langue locale + traduction française',
      'Images et pictogrammes illustratifs',
      'Audios de lecture pour les populations peu alphabétisées',
      'Publication et gestion des statuts',
    ],
    steps: [
      { title: 'Choisir le type de contenu civique', desc: 'Sélectionner parmi les catégories disponibles : droits du citoyen, devoirs civiques, institutions de l\'État, procédures, hygiène publique.', warning: null },
      { title: 'Rédiger le contenu', desc: 'Écrire en langue locale avec la traduction française. Utiliser un langage simple et accessible.', warning: null },
      { title: 'Ajouter les médias', desc: 'Uploader images et audios pour rendre le contenu accessible aux personnes peu alphabétisées.', warning: null },
      { title: 'Publier', desc: 'Vérifier le contenu et publier.', warning: null },
    ],
    workflows: [],
    tip: 'Privilégiez les contenus les plus pratiques pour les citoyens : comment voter, comment déclarer une naissance, les droits en garde à vue. Ces informations ont un impact direct sur la vie quotidienne.',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : MÉDIAS & AUDIO
  // ─────────────────────────────────────────────
  {
    id: 'videos',
    route: '/videos',
    section: 'medias',
    icon: '🎬',
    title: 'Vidéos',
    subtitle: 'Contenus vidéo pédagogiques',
    color: 'purple',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module gère les vidéos pédagogiques intégrées à l\'application : tutoriels de prononciation, interviews de locuteurs natifs, démonstrations de gestes culturels, chansons traditionnelles filmées. Les vidéos enrichissent l\'expérience d\'apprentissage au-delà du texte et de l\'audio.',
    objectifs: [
      'Enrichir le corpus pédagogique avec des contenus vidéo authentiques',
      'Documenter les expressions culturelles qui ne peuvent être décrites en texte',
    ],
    features: [
      'Upload direct de fichiers vidéo ou intégration via URL YouTube/Vimeo',
      'Titre, description et langue associée',
      'Catégories : Tutoriel, Interview, Démonstration culturelle, Chanson, Conte filmé',
      'Génération ou upload d\'une miniature personnalisée',
      'Filtrage par langue et catégorie',
    ],
    steps: [
      { title: 'Choisir la source vidéo', desc: 'Uploader un fichier vidéo directement ou coller l\'URL d\'une vidéo YouTube ou Vimeo déjà publiée.', warning: null },
      { title: 'Renseigner les métadonnées', desc: 'Saisir le titre, une description, sélectionner la langue et la catégorie.', warning: null },
      { title: 'Ajouter une miniature', desc: 'Uploader une image de miniature représentative ou laisser le système en générer une automatiquement.', warning: null },
      { title: 'Publier', desc: 'Activer la vidéo pour qu\'elle soit visible dans l\'application.', warning: null },
    ],
    workflows: [],
    tip: 'Les vidéos d\'interviews de locuteurs natifs sont les plus appréciées des apprenants. Filmez les tuteurs dans leur environnement naturel (village, marché) pour un contenu authentique.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'import-audio',
    route: '/voix-audio',
    section: 'medias',
    icon: '🎵',
    title: 'Import Audio',
    subtitle: 'Hub centralisé des enregistrements',
    color: 'purple',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Hub de gestion centralisé pour l\'importation, la validation et l\'organisation de tous les enregistrements audio du CMS. Ce module est le point de passage obligatoire pour tous les fichiers audio avant qu\'ils soient associés aux modules cibles (Dictionnaire, Culturel, Phrases, Leçons...).',
    objectifs: [
      'Importer des enregistrements audio en masse de manière organisée',
      'Valider la qualité sonore avant intégration dans les modules',
      'Copier les URLs générées vers les modules cibles correspondants',
    ],
    features: [
      '6 onglets sources : Contributions, Dictionnaire, Culturel, Phrases, Premiers Secours, Leçons',
      'Import de fichiers locaux MP3, WAV, M4A (taille max 20 MB par fichier)',
      'Contrôle qualité : écoute directe avant validation',
      'Sélection du genre de voix M/F pour chaque fichier',
      'Champ audio français (narration 🇫🇷) disponible à l\'ajout ET à la modification pour toutes les sources',
      'Import en masse avec sélecteur de genre commun à tous les fichiers de la session',
      'Génération d\'une URL permanente après upload',
      'Copie en un clic de l\'URL vers le presse-papier',
    ],
    steps: [
      { title: 'Sélectionner l\'onglet source', desc: 'Choisir l\'onglet correspondant au module cible : Dictionnaire pour les audios de mots, Culturel pour les contenus culturels, Phrases pour le phrasebook, etc.', warning: null },
      { title: 'Démarrer l\'import', desc: 'Cliquer sur "+ Ajouter", sélectionner la langue, la catégorie, le genre du locuteur (optionnel), puis choisir le(s) fichier(s) audio depuis votre ordinateur.', warning: null },
      { title: 'Ajouter la narration française (optionnel)', desc: 'Dans le formulaire "+ Ajouter", renseigner également le champ "🇫🇷 Audio français (narration)" si vous disposez de la version française correspondante.', warning: null },
      { title: 'Nommer selon la convention', desc: 'Vérifier que chaque fichier est nommé selon la convention officielle : [code_langue]_[mot]_[genre]_[numéro].mp3. Exemple : dioula_akwaba_M_001.mp3', warning: 'Nommez les fichiers AVANT d\'uploader. Un renommage après upload est laborieux. Un bon nom permet de retrouver l\'audio facilement dans 6 mois.' },
      { title: 'Uploader et vérifier', desc: 'Uploader les fichiers, puis écouter chaque audio pour valider la qualité (absence de bruit de fond, prononciation nette, volume correct).', warning: null },
      { title: 'Copier l\'URL générée', desc: 'Une fois uploadé et validé, cliquer sur l\'icône de copie pour copier l\'URL permanente de l\'audio dans le presse-papier.', warning: null },
      { title: 'Coller dans le module cible', desc: 'Naviguer vers le module cible (ex. Dictionnaire) et coller l\'URL dans le champ audio correspondant de l\'entrée.', warning: null },
    ],
    workflows: [
      {
        title: 'Session d\'enregistrement avec un tuteur natif',
        steps: [
          'Préparer la liste des mots à enregistrer avant la session',
          'Enregistrer avec le tuteur masculin tous les mots en langue locale',
          'Enregistrer avec la tuteure féminine les mêmes mots',
          'Nommer tous les fichiers selon la convention avant d\'ouvrir le CMS',
          'Importer tous les fichiers via l\'onglet Dictionnaire de l\'Import Audio',
          'Écouter 10% des fichiers au hasard pour contrôle qualité',
          'Copier les URLs et compléter les entrées dans le Dictionnaire',
        ],
      },
    ],
    tip: 'Nommez les fichiers audio AVANT d\'uploader. Un bon nom de fichier permet de retrouver et réutiliser l\'audio facilement, même plusieurs mois plus tard.',
    warnings: [],
    audioNaming: {
      pattern: '[code_langue]_[mot]_[genre]_[numéro].mp3',
      examples: [
        { file: 'dioula_akwaba_M_001.mp3', meaning: 'Mot "akwaba" en Dioula — locuteur masculin' },
        { file: 'baoule_me_F_001.mp3', meaning: 'Mot "me" en Baoulé — locutrice féminine' },
        { file: 'senoufo_poro_M_002.mp3', meaning: 'Mot "poro" en Sénoufo — locuteur masculin, 2e prise' },
      ],
    },
  },

  {
    id: 'bienvenue',
    route: '/bienvenue-sons',
    section: 'medias',
    icon: '🎶',
    title: 'Bienvenue & Sons',
    subtitle: 'Messages d\'accueil par langue',
    color: 'purple',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Configuration des messages de bienvenue et des sons traditionnels joués lors du choix d\'une langue dans l\'application mobile. Chaque langue dispose de sa propre carte avec un message de bienvenue personnalisé et un court son musical traditionnel représentatif de la culture.',
    objectifs: [
      'Créer une expérience d\'accueil immersive pour chaque langue',
      'Associer un son traditionnel authentique à chaque culture',
      'Rédiger des messages de bienvenue chaleureux dans la langue locale',
    ],
    features: [
      'Carte dédiée par langue (9 langues + Yacouba)',
      'Upload du son traditionnel (instrument local, ~3-5 secondes)',
      'Upload du son français de la langue locale (narration française, optionnel)',
      'Sélecteur de genre du locuteur (M / F / non renseigné) pour chaque message',
      'Message de bienvenue textuel lu en TTS ou remplacé par un audio uploadé',
      'Bouton "Simuler" pour prévisualiser l\'expérience complète',
      'Bouton "+ Nouveau message" pour création rapide d\'une variante',
      'Sauvegarde par langue indépendamment',
    ],
    steps: [
      { title: 'Sélectionner la langue', desc: 'Cliquer sur la carte de la langue souhaitée pour la déplier et afficher ses paramètres de bienvenue.', warning: null },
      { title: 'Uploader le son traditionnel', desc: 'Importer un enregistrement court (3-5 secondes) d\'un instrument traditionnel représentatif de la culture de cette langue.', warning: null },
      { title: 'Rédiger le message de bienvenue', desc: 'Saisir le message de bienvenue dans la langue locale et en français. Ce texte sera lu par la synthèse vocale ou peut être remplacé par un audio enregistré.', warning: null },
      { title: 'Simuler l\'expérience', desc: 'Cliquer sur "Simuler" pour entendre l\'enchaînement son traditionnel + message de bienvenue, tel que l\'utilisateur l\'entendra dans l\'application.', warning: null },
      { title: 'Sauvegarder', desc: 'Cliquer sur "Sauvegarder" pour enregistrer les modifications de cette langue.', warning: null },
    ],
    workflows: [
      {
        title: 'Configuration complète d\'une langue (ex. Sénoufo)',
        steps: [
          'Enregistrer 3-5 secondes de balafon sénoufo (instrument traditionnel)',
          'Nommer le fichier : senoufo_bienvenue_son.mp3',
          'Rédiger avec le tuteur Sénoufo : "Sénangi ! Bonne arrivée en Sénoufo"',
          'Uploader le son dans la carte Sénoufo',
          'Saisir le message de bienvenue',
          'Simuler l\'expérience pour validation',
          'Sauvegarder',
        ],
      },
    ],
    tip: 'Le son traditionnel doit durer 3-5 secondes maximum et représenter fidèlement la culture musicale de la langue. Instruments recommandés : balafon (Sénoufo), kora (Dioula), tam-tam (Guéré), djembé (Bété).',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : COMMUNAUTÉ
  // ─────────────────────────────────────────────
  {
    id: 'contributions',
    route: '/contributions',
    section: 'communaute',
    icon: '🤝',
    title: 'Contributions',
    subtitle: 'Modération des contenus communautaires',
    color: 'orange',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Contributions centralise la modération des contenus soumis spontanément par les utilisateurs de l\'application mobile. Mots, phrases, corrections, suggestions — chaque soumission communautaire passe par ce module avant d\'être intégrée ou rejetée dans le corpus officiel.',
    objectifs: [
      'Modérer efficacement les contenus soumis par la communauté',
      'Valoriser les contributions de qualité en les intégrant au corpus',
      'Maintenir la traçabilité des décisions de modération',
    ],
    features: [
      'Fiche détaillée par contribution avec contenu complet',
      'Actions de modération : Approuver, Rejeter, Mettre en attente',
      'Filtres par statut (en attente, approuvé, rejeté) et par langue',
      'Historique de modération avec date et décision',
      'Notification automatique à l\'utilisateur après décision',
    ],
    steps: [
      { title: 'Consulter la liste des contributions en attente', desc: 'Filtrer par statut "En attente" pour afficher les soumissions non encore traitées.', warning: null },
      { title: 'Examiner chaque contribution', desc: 'Cliquer sur une contribution pour voir son contenu complet : mot ou phrase soumis, langue, traduction proposée, contexte fourni par l\'utilisateur.', warning: null },
      { title: 'Vérifier avec un locuteur natif si nécessaire', desc: 'Pour les contributions douteuses ou complexes, consulter le tuteur natif de la langue avant de décider.', warning: null },
      { title: 'Prendre une décision', desc: 'Approuver si la contribution est correcte et utile, Rejeter si elle est inexacte ou hors sujet, Mettre en attente si une vérification supplémentaire est nécessaire.', warning: null },
    ],
    workflows: [
      {
        title: 'Session de modération hebdomadaire',
        steps: [
          'Filtrer par statut "En attente"',
          'Traiter chaque contribution en commençant par les langues les plus actives',
          'Pour les contributions complexes, annoter la raison du rejet ou de la mise en attente',
          'Intégrer les contributions approuvées dans le Dictionnaire ou les modules concernés',
          'Vérifier que le compteur "En attente" atteint zéro en fin de session',
        ],
      },
    ],
    tip: 'Moderez au minimum une fois par semaine. Les contributions non traitées restent en attente dans l\'application et peuvent frustrer les utilisateurs qui ne reçoivent pas de retour.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'messages',
    route: '/messages',
    section: 'communaute',
    icon: '✉️',
    title: 'Messages',
    subtitle: 'Support utilisateurs de l\'application',
    color: 'orange',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Module de support utilisateurs permettant de gérer les messages envoyés depuis l\'application mobile. Les messages sont organisés en deux onglets (Ouvert / Résolu) avec un badge de comptage des non-lus pour un suivi immédiat.',
    objectifs: [
      'Répondre rapidement aux utilisateurs de l\'application mobile',
      'Maintenir un taux de résolution élevé pour la satisfaction utilisateur',
      'Détecter les problèmes récurrents qui nécessitent des correctifs',
    ],
    features: [
      'Deux onglets : Ouvert (messages actifs) et Résolu (historique)',
      'Badge de comptage des messages non lus',
      'Fiche message complète avec historique de la conversation',
      'Réponse directe depuis le CMS',
      'Marquage Résolu ou Réouverture d\'un ticket',
    ],
    steps: [
      { title: 'Vérifier les messages non lus', desc: 'Le badge rouge sur l\'onglet Messages indique le nombre de messages non lus. Traiter les messages non lus en priorité.', warning: null },
      { title: 'Lire le message complet', desc: 'Cliquer sur un message pour voir le contenu complet, l\'historique de la conversation et les informations sur l\'utilisateur.', warning: null },
      { title: 'Rédiger et envoyer une réponse', desc: 'Saisir la réponse dans le champ dédié et envoyer. L\'utilisateur reçoit la réponse via notification dans l\'application.', warning: null },
      { title: 'Marquer comme résolu', desc: 'Une fois le problème traité, cliquer sur "Marquer comme résolu" pour déplacer le ticket dans l\'onglet Résolu.', warning: null },
    ],
    workflows: [],
    tip: 'Visez une première réponse dans les 24 heures. Une réponse rapide, même pour dire que la demande est bien reçue et en cours de traitement, renforce la confiance des utilisateurs dans la plateforme.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'certificats',
    route: '/certificates',
    section: 'communaute',
    icon: '🏆',
    title: 'Certificats',
    subtitle: 'Diplômes et reconnaissances de niveau',
    color: 'orange',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Certificats gère l\'émission et le suivi des certificats de niveau (A1 à C1) et des diplômes d\'honneur remis aux apprenants ayant validé un parcours. Il permet également de créer et uploader des modèles de certificats personnalisés conçus sur Photoshop ou Canva.',
    objectifs: [
      'Émettre des certificats de niveau officiels aux apprenants méritants',
      'Gérer les modèles graphiques de certificats et diplômes',
      'Suivre l\'historique d\'émission par utilisateur et par langue',
    ],
    features: [
      'Onglets dédiés : Certificats, Diplômes, Modèles',
      'Émission manuelle ciblée (recherche utilisateur + langue + niveau)',
      'Filtres par langue, niveau et date d\'émission',
      'Module Modèles : upload de maquettes PNG/JPG (Photoshop ou Canva)',
      'Aperçu en direct du rendu final du certificat',
    ],
    steps: [
      { title: 'Émettre un certificat', desc: 'Aller dans l\'onglet "Certificats", cliquer sur "+ Émettre un certificat", rechercher l\'utilisateur par nom ou email, puis sélectionner la langue et le niveau validé.', warning: null },
      { title: 'Confirmer l\'émission', desc: 'Vérifier les informations (nom de l\'utilisateur, langue, niveau, date) et confirmer. Le certificat est envoyé à l\'utilisateur dans l\'application.', warning: null },
      { title: 'Gérer les modèles graphiques', desc: 'Dans l\'onglet "Modèles", uploader une maquette PNG ou JPG conçue sur Photoshop ou Canva. Elle remplace l\'aperçu automatique et sera utilisée pour tous les nouveaux certificats.', warning: null },
    ],
    workflows: [
      {
        title: 'Émission d\'un lot de certificats A1 Dioula',
        steps: [
          'Identifier les apprenants ayant validé le niveau A1 Dioula',
          'Aller dans Certificats > "+ Émettre"',
          'Rechercher chaque apprenant et émettre son certificat',
          'Vérifier dans l\'historique que tous les certificats ont bien été émis',
        ],
      },
    ],
    tip: 'Créez les modèles de certificats avec les couleurs et le logo officiel de Langues Ivoire pour un rendu professionnel. Concevez les maquettes sur Canva (plus simple) ou Photoshop (plus précis).',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'badges',
    route: '/badges',
    section: 'communaute',
    icon: '🎖️',
    title: 'Badges & XP',
    subtitle: 'Système de gamification',
    color: 'orange',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Badges & XP gère le système de gamification de l\'application : création des badges de récompense, définition des seuils d\'XP déclencheurs et gestion des récompenses. Les badges motivent les apprenants à progresser régulièrement.',
    objectifs: [
      'Créer des badges motivants alignés sur les objectifs pédagogiques',
      'Définir des seuils XP cohérents et progressifs',
      'Maintenir l\'engagement des apprenants sur la durée',
    ],
    features: [
      'Création de badges (nom, emoji représentatif, description de l\'exploit)',
      'Définition du seuil XP déclencheur',
      'Sélection de la couleur et du style visuel',
      'Activation / désactivation de chaque badge',
      'Prévisualisation du badge tel qu\'il apparaîtra dans l\'application',
    ],
    steps: [
      { title: 'Créer un nouveau badge', desc: 'Cliquer sur "+ Nouveau badge", saisir le nom, choisir un emoji représentatif et rédiger une description courte de l\'exploit récompensé.', warning: null },
      { title: 'Définir le seuil XP', desc: 'Renseigner le nombre de points XP que l\'apprenant doit accumuler pour débloquer ce badge.', warning: null },
      { title: 'Personnaliser l\'apparence', desc: 'Choisir la couleur du badge et vérifier la prévisualisation.', warning: null },
      { title: 'Activer le badge', desc: 'Basculer le toggle sur "Actif" pour que le badge soit attribuable dans l\'application.', warning: null },
    ],
    workflows: [],
    tip: 'Créez des badges pour les jalons progressifs (premier mot appris, 10 mots, 50 mots, première leçon complète, premier niveau validé). Les petites victoires fréquentes sont plus motivantes qu\'un seul grand objectif lointain.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'notifications',
    route: '/notifications',
    section: 'communaute',
    icon: '🔔',
    title: 'Notifications',
    subtitle: 'Push vers l\'application mobile',
    color: 'orange',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Notifications permet d\'envoyer des notifications push vers l\'application mobile pour informer, rappeler ou annoncer du contenu aux utilisateurs. Les notifications peuvent être ciblées (tous les utilisateurs, une langue spécifique, un utilisateur précis) et programmées à l\'avance.',
    objectifs: [
      'Informer les utilisateurs des nouveaux contenus disponibles',
      'Relancer les apprenants inactifs avec des rappels d\'apprentissage',
      'Annoncer les événements et actualités de la plateforme',
    ],
    features: [
      'Types de notifications : Système, Badge, Rappel, Annonce, Publicité',
      'Ciblage : tous les utilisateurs, par langue sélectionnée, ou utilisateur individuel',
      'Programmation à une date et heure future',
      'Historique des notifications envoyées avec taux de lecture',
    ],
    steps: [
      { title: 'Créer une notification', desc: 'Cliquer sur "+ Nouvelle notification", choisir le type et rédiger le titre et le message.', warning: null },
      { title: 'Définir le ciblage', desc: 'Sélectionner l\'audience : tous les utilisateurs, les apprenants d\'une langue spécifique, ou un utilisateur ciblé par son identifiant.', warning: null },
      { title: 'Programmer ou envoyer immédiatement', desc: 'Choisir d\'envoyer immédiatement ou de programmer la notification pour une date et heure précise.', warning: 'Les notifications push sont un canal limité en termes de fréquence acceptable. Ne dépassez pas 2-3 notifications par semaine pour éviter la fatigue des utilisateurs et les désabonnements.' },
    ],
    workflows: [],
    tip: 'Programmez les rappels d\'apprentissage le soir (18h-20h) quand les utilisateurs sont disponibles. Évitez les envois pendant les heures de travail et la nuit.',
    warnings: [
      'Les notifications push sont limitées en fréquence acceptable. Ne dépassez pas 2-3 notifications par semaine pour éviter la fatigue des utilisateurs et les désabonnements.',
    ],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : INTELLIGENCE ARTIFICIELLE
  // ─────────────────────────────────────────────
  {
    id: 'tuteurs-ia',
    route: '/tutors',
    section: 'ia',
    icon: '🤖',
    title: 'Tuteurs IA',
    subtitle: 'Configuration des avatars pédagogiques',
    color: 'cyan',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module permet de configurer les tuteurs virtuels ethniques qui guident les apprenants dans l\'application. Chaque langue dispose d\'un tuteur masculin et d\'une tuteure féminine avec une personnalité définie, une voix configurée et un portrait illustratif. L\'objectif est de créer 18 tuteurs au total (2 par langue × 9 langues).',
    objectifs: [
      'Créer et configurer les 18 tuteurs IA (2 par langue × 9 langues)',
      'Uploader les avatars portraits représentatifs de chaque tuteur',
      'Définir des personnalités cohérentes avec la culture de chaque langue',
      'Configurer les paramètres vocaux (vitesse, tonalité) pour chaque tuteur',
    ],
    features: [
      'Fiche tuteur complète : nom du personnage, langue, genre M/F',
      'Sélection et personnalisation de la personnalité (chaleureux, pédagogue, humoristique...)',
      'Paramètres vocaux : vitesse de parole et hauteur de voix (pitch)',
      'Upload du portrait illustratif du tuteur',
      'Tri automatique des tuteurs par langue dans l\'interface',
      'Activation / désactivation de chaque tuteur',
    ],
    steps: [
      { title: 'Créer un nouveau tuteur', desc: 'Cliquer sur "+ Nouveau tuteur" pour ouvrir la fiche de configuration.', warning: null },
      { title: 'Définir l\'identité', desc: 'Saisir le nom du personnage ethnique (ex. Kouadio pour un tuteur Baoulé masculin), sélectionner la langue et le genre (M/F).', warning: null },
      { title: 'Configurer la personnalité', desc: 'Choisir un profil de personnalité parmi les options prédéfinies ou personnaliser la description pour définir le ton et le style pédagogique du tuteur.', warning: null },
      { title: 'Uploader le portrait', desc: 'Importer l\'illustration ou la photo du tuteur. Format recommandé : image carrée 400×400px minimum, fond uni ou transparent.', warning: null },
      { title: 'Régler les paramètres vocaux', desc: 'Ajuster la vitesse de parole (lent pour les débutants, normal pour les avancés) et le pitch pour correspondre au genre et à la personnalité.', warning: null },
      { title: 'Activer le tuteur', desc: 'Basculer le toggle sur "Actif" pour que le tuteur soit disponible dans l\'application pour la langue correspondante.', warning: null },
    ],
    workflows: [
      {
        title: 'Création du duo de tuteurs pour le Dioula',
        steps: [
          'Créer le tuteur masculin Dioula : nom "Ibrahim", genre M, langue Dioula',
          'Choisir une personnalité "Sage et patient"',
          'Uploader le portrait d\'Ibrahim',
          'Régler la voix : vitesse normale, pitch grave',
          'Activer Ibrahim',
          'Créer la tuteure féminine Dioula : nom "Mariam", genre F, langue Dioula',
          'Choisir une personnalité "Chaleureuse et encourageante"',
          'Uploader le portrait de Mariam',
          'Régler la voix : vitesse légèrement lente, pitch féminin',
          'Activer Mariam',
        ],
      },
    ],
    tip: 'Choisissez des noms de tuteurs authentiquement représentatifs de chaque ethnie. Le tuteur devient le compagnon d\'apprentissage de l\'utilisateur — son nom et son visage doivent inspirer confiance et appartenance culturelle.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'ia-linguistique',
    route: '/ia-linguistique',
    section: 'ia',
    icon: '🧠',
    title: 'IA Linguistique',
    subtitle: 'Assistance IA pour la génération de contenu',
    color: 'cyan',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Interface de gestion du module d\'intelligence artificielle linguistique pour accélérer la création de contenus et l\'analyse phonétique. L\'IA peut suggérer des mots manquants dans le corpus, générer des phonétiques, proposer des traductions et analyser la distribution du contenu par langue. Le module inclut également un formulaire d\'ajout d\'enregistrement individuel et un import audio en masse.',
    objectifs: [
      'Accélérer la création de contenu avec l\'assistance de l\'IA',
      'Identifier les lacunes dans le corpus par langue',
      'Valider les phonétiques avec l\'analyse automatique',
      'Importer des enregistrements audio individuels ou en masse',
    ],
    features: [
      'Génération de contenu assistée par IA (mots, phrases, exemples)',
      'Analyse phonétique automatique et suggestions de correction',
      'Détection des mots manquants par thème et langue',
      'Formulaire "Ajouter un enregistrement" : audio langue locale + 🇫🇷 audio narration française',
      'Option "Voix officielle" pour marquer un enregistrement comme référence canonique',
      'Sélecteur de genre du locuteur par enregistrement',
      'Import audio en masse avec sélecteur de genre commun à toute la session',
    ],
    steps: [
      { title: 'Sélectionner le type d\'assistance IA', desc: 'Choisir entre génération de contenu, analyse phonétique, suggestions de mots manquants ou transcription audio.', warning: null },
      { title: 'Paramétrer la langue cible', desc: 'Sélectionner la langue ivoirienne pour laquelle l\'IA doit générer ou analyser du contenu.', warning: null },
      { title: 'Ajouter un enregistrement individuel', desc: 'Cliquer sur "+ Ajouter un audio", renseigner la langue, le mot, la traduction, la catégorie, puis uploader le fichier audio (langue locale). Optionnellement, ajouter le champ "Audio français (narration)" et sélectionner le genre du locuteur.', warning: null },
      { title: 'Importer en masse', desc: 'Utiliser "Import en masse" pour uploader plusieurs fichiers d\'un coup. Sélectionner la langue, la catégorie et le genre du locuteur qui s\'appliqueront à tous les fichiers de la session.', warning: null },
      { title: 'Valider les suggestions IA', desc: 'L\'IA génère des suggestions — toujours les valider avec un tuteur natif avant d\'intégrer le contenu dans les modules officiels.', warning: null },
    ],
    workflows: [],
    tip: 'L\'IA est un assistant, pas une source de vérité. Toute génération de contenu linguistique doit être validée par un locuteur natif avant publication. Utilisez l\'IA pour accélérer, pas pour remplacer l\'expertise humaine.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'test-agents',
    route: '/test-agents',
    section: 'ia',
    icon: '🧪',
    title: 'Test Agents IA',
    subtitle: 'Simulation des tuteurs conversationnels',
    color: 'cyan',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Environnement de test des agents conversationnels Kouadio et Zélé. Ce module permet de simuler des conversations avec les tuteurs IA pour valider le comportement conversationnel, tester les réponses pédagogiques et identifier les situations qui nécessitent des ajustements de configuration.',
    objectifs: [
      'Valider le comportement conversationnel des tuteurs IA avant déploiement',
      'Tester les réponses dans des situations pédagogiques variées',
      'Identifier et corriger les réponses inadaptées ou incorrectes',
    ],
    features: [
      'Interface de chat simulé avec Kouadio (👨 tuteur Baoulé)',
      'Interface de chat simulé avec Zélé (👩 tuteure Dioula)',
      'Test des réponses pédagogiques en temps réel',
      'Validation du comportement conversationnel',
      'Log des interactions pour analyse',
    ],
    steps: [
      { title: 'Choisir le tuteur à tester', desc: 'Sélectionner Kouadio (Baoulé masculin) ou Zélé (Dioula féminine) dans l\'interface de test.', warning: null },
      { title: 'Simuler des scénarios pédagogiques', desc: 'Engager une conversation comme si vous étiez un apprenant débutant. Testez les questions sur le vocabulaire, la grammaire, les corrections.', warning: null },
      { title: 'Évaluer les réponses', desc: 'Vérifier que les réponses sont pédagogiquement correctes, culturellement appropriées et formulées dans un langage accessible.', warning: null },
      { title: 'Documenter les anomalies', desc: 'Noter les réponses problématiques et signaler aux développeurs pour correction de la configuration de l\'agent.', warning: null },
    ],
    workflows: [],
    tip: 'Testez au minimum 20 scénarios variés avant de considérer un tuteur prêt pour le déploiement : débutant absolu, questions de grammaire, demande de répétition, erreur de l\'apprenant, félicitations.',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : PARAMÈTRES APPLICATION
  // ─────────────────────────────────────────────
  {
    id: 'langues',
    route: '/langues',
    section: 'app',
    icon: '🗣️',
    title: 'Langues',
    subtitle: 'Catalogue des langues ivoiriennes',
    color: 'green',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Catalogue complet des 60+ langues ivoiriennes référencées dans le système. Ce module permet de gérer les informations de chaque langue : statut d\'activation (MVP ou à venir), ordre d\'affichage dans l\'application, coordonnées géographiques pour la carte, emoji représentatif et image culturelle associée.',
    objectifs: [
      'Gérer le catalogue officiel des langues ivoiriennes',
      'Distinguer clairement les langues MVP des langues à venir',
      'Associer des coordonnées géographiques précises à chaque langue',
    ],
    features: [
      'Liste complète avec emoji/drapeau par langue',
      'Toggle isActive pour distinguer MVP (visible dans l\'app) et à venir',
      'Ordre d\'affichage personnalisable dans l\'application mobile',
      'Coordonnées géographiques (latitude/longitude) avec drag & drop sur la carte',
      'Sélecteur d\'emoji représentatif',
      'Upload d\'une image culturelle associée à la langue',
    ],
    steps: [
      { title: 'Sélectionner une langue à modifier', desc: 'Trouver la langue dans la liste complète (filtrer si nécessaire) et cliquer sur "Modifier".', warning: null },
      { title: 'Configurer le statut MVP', desc: 'Activer ou désactiver le toggle "isActive" pour déterminer si la langue est visible dans l\'application mobile ou marquée comme "Prochainement disponible".', warning: null },
      { title: 'Définir l\'ordre d\'affichage', desc: 'Renseigner la valeur numérique d\'ordre d\'affichage pour contrôler la position de la langue dans les listes de l\'application.', warning: null },
      { title: 'Placer sur la carte', desc: 'Utiliser le sélecteur de coordonnées ou naviguer vers le module Carte CI pour placer le marqueur par drag & drop.', warning: null },
      { title: 'Uploader l\'emoji et l\'image', desc: 'Choisir un emoji représentatif de la culture et uploader une image illustrant la langue (tissus, instruments, architecture traditionnelle...).', warning: null },
    ],
    workflows: [],
    tip: 'Vérifiez les coordonnées géographiques en croisant avec une carte officielle de Côte d\'Ivoire. Un marqueur mal placé sur la carte donne une mauvaise impression aux utilisateurs qui connaissent la géographie du pays.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'carte',
    route: '/carte-ci',
    section: 'app',
    icon: '🗺️',
    title: 'Carte CI',
    subtitle: 'Carte interactive de Côte d\'Ivoire',
    color: 'green',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Interface de gestion de la carte interactive de Côte d\'Ivoire avec les marqueurs géolocalisés de chaque langue. La carte permet de positionner visuellement chaque langue sur son territoire culturel par un simple glisser-déposer des marqueurs.',
    objectifs: [
      'Positionner précisément chaque langue sur son territoire culturel',
      'Visualiser la distribution géographique des langues ivoiriennes',
      'Maintenir la cohérence entre la carte et les coordonnées du module Langues',
    ],
    features: [
      'Carte PNG de la Côte d\'Ivoire en plein écran',
      'Zoom à la molette de la souris et via les boutons +/-',
      'Drag & drop des marqueurs pour repositionner une langue',
      'Couleurs distinctives par statut : vert pour les langues MVP actives, gris pour les langues à venir',
      'Synchronisation automatique avec le module Langues',
    ],
    steps: [
      { title: 'Localiser le marqueur à déplacer', desc: 'Zoomer sur la région souhaitée et identifier le marqueur de la langue à repositionner.', warning: null },
      { title: 'Glisser-déposer le marqueur', desc: 'Cliquer sur le marqueur et le faire glisser jusqu\'à la position correcte sur la carte, puis relâcher.', warning: null },
      { title: 'Vérifier la position', desc: 'Dézoomer pour vérifier que le marqueur est cohérent avec la distribution géographique des autres langues.', warning: null },
      { title: 'Sauvegarder', desc: 'Les coordonnées sont automatiquement mises à jour dans le module Langues après repositionnement.', warning: null },
    ],
    workflows: [],
    tip: 'Utilisez une carte physique ou politique officielle de Côte d\'Ivoire en parallèle pour valider visuellement la position de chaque marqueur. La précision géographique renforce la crédibilité de l\'application.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'alphabet',
    route: '/alphabet-langues',
    section: 'app',
    icon: '🔡',
    title: 'Alphabet des Langues',
    subtitle: 'Systèmes phonétiques par langue',
    color: 'green',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module gère les alphabets et systèmes phonétiques propres à chaque langue ivoirienne. Chaque lettre ou son est documenté avec sa prononciation et peut être associé à un enregistrement audio d\'un locuteur natif pour guider les apprenants.',
    objectifs: [
      'Documenter l\'alphabet complet de chaque langue ivoirienne',
      'Associer un audio de prononciation à chaque lettre ou phonème',
      'Expliquer les diacritiques spécifiques aux langues à tons',
    ],
    features: [
      'Lettres et sons organisés par langue',
      'Audio de prononciation de chaque lettre ou phonème',
      'Support des diacritiques : ɛ, ɔ, ŋ, ɲ, tons haut/bas',
      'Regroupement par type : voyelles, consonnes, diacritiques, tons',
    ],
    steps: [
      { title: 'Sélectionner la langue', desc: 'Choisir la langue ivoirienne pour laquelle documenter l\'alphabet.', warning: null },
      { title: 'Ajouter les lettres et phonèmes', desc: 'Pour chaque lettre ou son, saisir le caractère, sa description phonétique et un exemple de mot l\'utilisant.', warning: null },
      { title: 'Uploader les audios', desc: 'Enregistrer et importer un locuteur natif prononçant chaque lettre isolément pour que l\'apprenant puisse l\'écouter dans l\'application.', warning: null },
    ],
    workflows: [],
    tip: 'Commencez par les diacritiques spéciaux (ɛ, ɔ, ŋ) qui sont les plus déstabilisants pour les apprenants francophones. Un audio clair de la différence entre "e" et "ɛ" est plus utile que vingt explications textuelles.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'musee',
    route: '/musee-tresors',
    section: 'app',
    icon: '🏺',
    title: 'Musée des Trésors',
    subtitle: 'Objets culturels du musée numérique',
    color: 'green',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le Musée des Trésors est le musée numérique de Langues Ivoire. Ce module gère les objets culturels précieux qui sont débloqués par les apprenants selon leur niveau d\'XP. Chaque objet représente le patrimoine matériel d\'une ethnie ivoirienne (dont les Yacouba) avec sa description, son histoire et ses audios.',
    objectifs: [
      'Constituer un musée numérique du patrimoine matériel ivoirien',
      'Récompenser la progression des apprenants avec du contenu culturel exclusif',
      'Documenter chaque objet avec précision et authenticité',
    ],
    features: [
      'Objets organisés par ethnie (dont Yacouba)',
      'Seuils XP de déblocage : Starter, Bronze, Argent, Or',
      'Image haute qualité de l\'objet',
      'Audio de description en langue locale',
      'Audio de description en français',
      'Matière et type d\'objet documentés',
    ],
    steps: [
      { title: 'Créer un objet du musée', desc: 'Cliquer sur "+ Nouvel objet", saisir le nom de l\'objet, sélectionner l\'ethnie d\'origine et le type (bijou, instrument, tissu, ustensile...).', warning: null },
      { title: 'Renseigner les métadonnées culturelles', desc: 'Documenter la matière, le contexte d\'usage traditionnel, l\'époque et la signification culturelle de l\'objet.', warning: null },
      { title: 'Définir le seuil XP', desc: 'Choisir le niveau de déblocage (Starter pour les objets communs, Or pour les plus rares et précieux).', warning: null },
      { title: 'Uploader image et audios', desc: 'Importer une image haute définition de l\'objet et les deux audios de description (langue locale + français).', warning: null },
    ],
    workflows: [],
    tip: 'Répartissez les objets équitablement entre toutes les ethnies et tous les niveaux XP. Une ethnie sur-représentée ou un niveau XP vide nuit à l\'équité et à la progression perçue.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'arbre-palabres',
    route: '/arbre-vocabulaire',
    section: 'app',
    icon: '🌳',
    title: 'Arbre à Palabres',
    subtitle: 'Dialogues philosophiques culturels',
    color: 'green',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'L\'Arbre à Palabres est l\'espace de dialogue culturel de l\'application, inspiré de l\'institution africaine traditionnelle. Ce module structure les échanges philosophiques, proverbes développés et réflexions sur la vie en arbre de conversation, disponibles dans toutes les langues ivoiriennes.',
    objectifs: [
      'Documenter les échanges philosophiques traditionnels en langue locale',
      'Enrichir l\'application avec du contenu culturel profond et authentique',
    ],
    features: [
      'Entrées par langue avec catégories thématiques',
      'Texte en langue locale + traduction française',
      'Audio des deux locuteurs dialoguant',
      'Organisation en arbres de conversation',
    ],
    steps: [
      { title: 'Créer une entrée de palabre', desc: 'Sélectionner la langue et la catégorie thématique (sagesse, nature, famille, communauté...).', warning: null },
      { title: 'Saisir l\'échange', desc: 'Rédiger le dialogue entre les deux participants en langue locale avec la traduction française.', warning: null },
      { title: 'Uploader les audios', desc: 'Enregistrer les deux locuteurs prononçant leurs répliques et importer les fichiers audio.', warning: null },
    ],
    workflows: [],
    tip: 'Collaborez avec les anciens et les griots de chaque communauté pour recueillir des palabres authentiques. Ce contenu ne peut pas être inventé ou généré par IA — son authenticité est sa valeur principale.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'marche',
    route: '/marche-dialogues',
    section: 'app',
    icon: '🛒',
    title: 'Au Marché',
    subtitle: 'Scènes de marché et marchandage',
    color: 'green',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Au Marché simule des scènes de marché ivoirien pour enseigner le vocabulaire commercial et les expressions de marchandage dans un contexte culturel authentique. Chaque fiche représente un vendeur avec ses répliques typiques de marché.',
    objectifs: [
      'Enseigner le vocabulaire commercial en contexte réel',
      'Documenter les expressions de marchandage propres à chaque culture',
      'Couvrir les 9 ethnies dont les Yacouba',
    ],
    features: [
      'Fiches vendeur : nom, description, ethnie, spécialité de marché',
      'Salutation d\'accueil dans la langue locale',
      'Répliques de marchandage typiques',
      'Audio de la salutation principale',
      'Couverture des 9 ethnies dont le Yacouba',
    ],
    steps: [
      { title: 'Créer une fiche vendeur', desc: 'Cliquer sur "+ Nouveau vendeur", saisir le nom du personnage, son ethnie, sa spécialité de marché (tissu, légumes, poisson...).', warning: null },
      { title: 'Rédiger les répliques', desc: 'Avec le tuteur natif de la langue, rédiger la salutation d\'accueil et 4-6 répliques de marchandage typiques en langue locale avec leur traduction.', warning: null },
      { title: 'Enregistrer et uploader l\'audio', desc: 'Enregistrer au minimum l\'audio de la salutation principale et l\'importer.', warning: null },
    ],
    workflows: [],
    tip: 'Rendez-vous sur un marché local avec un enregistreur pour capter des échanges authentiques. Les expressions de marchandage réel sont bien plus vivantes que des répliques inventées.',
    warnings: [],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : ÉDUCATION & VIE PRATIQUE
  // ─────────────────────────────────────────────
  {
    id: 'mathematique',
    route: '/mathematiques',
    section: 'education',
    icon: '🔢',
    title: 'Module Mathématique',
    subtitle: 'Calculs et chiffres en langues locales',
    color: 'cyan',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Mathématique permet de créer et gérer des exercices de calcul mental enseignés dans les langues ethniques ivoiriennes : comptage de 0 à 10, additions, soustractions, tables de multiplication, et distinction nombres pairs / impairs. Chaque contenu peut être universel (sans langue) ou spécifique à une langue.',
    objectifs: [
      'Publier les chiffres de 0 à 10 dans chaque langue locale',
      'Créer des exercices d\'addition et de soustraction avec les mots natifs',
      'Mettre à disposition les tables de multiplication (×2, ×3, ×5, ×10)',
      'Distinguer visuellement les nombres pairs et impairs dans chaque langue',
    ],
    features: [
      '6 types de contenus : Comptage, Addition, Soustraction, Multiplication, Division, Pairs/Impairs',
      'Association optionnelle à une langue (ou contenu universel)',
      'Système de niveaux A1 → B2 et de points XP',
      'Formulaire visuel intégré — aucune connaissance JSON requise',
      'Onglet 🔊 Audios pour associer des fichiers audio à chaque fiche',
      'Calcul automatique des résultats (a + b = ?, a × b = ? calculés en temps réel)',
      'Filtre par langue et par type dans la liste des contenus',
      'Affichage du contenu en accordéon (▼) sur chaque fiche',
      'Activation / désactivation individuelle des contenus',
    ],
    steps: [
      {
        title: 'Choisir le type d\'exercice',
        desc: 'Cliquer sur "+ Nouveau contenu". Sélectionner le type dans la liste : Comptage, Addition, Soustraction, Multiplication, Division ou Pairs/Impairs. Le formulaire visuel s\'adapte automatiquement au type choisi.',
        warning: null,
      },
      {
        title: 'Associer une langue (ou non)',
        desc: 'Sélectionner la langue concernée dans le menu déroulant. Laisser "— Sans langue (universel) —" pour les tables de multiplication ou autres contenus indépendants de la langue.',
        warning: null,
      },
      {
        title: 'Saisir le contenu avec le formulaire visuel',
        desc: 'L\'onglet "{ } JSON" est remplacé par un formulaire visuel selon le type : pour COMPTAGE, saisir le mot en langue et sa transcription pour chaque chiffre ; pour ADDITION/SOUSTRACTION, renseigner les deux opérandes — le résultat est calculé automatiquement ; pour MULTIPLICATION, saisir la table et les facteurs avec suggestion automatique du second facteur ; pour PAIRS/IMPAIRS, grouper les chiffres en colonnes pairs et impairs.',
        warning: null,
      },
      {
        title: 'Ajouter des audios (optionnel)',
        desc: 'Cliquer sur l\'onglet "🔊 Audios" pour associer des fichiers audio à la fiche. Chaque audio peut être lié à un texte précis (chiffre, expression, question). Le bouton audio 🔊 dans l\'app mobile utilisera ce fichier.',
        warning: null,
      },
      {
        title: 'Définir XP et ordre',
        desc: 'Renseigner les points XP (20 par défaut pour comptage, 30 pour multiplication) et l\'ordre d\'affichage (0 = premier affiché dans l\'app mobile).',
        warning: null,
      },
      {
        title: 'Vérifier et activer',
        desc: 'Depuis la liste, utiliser le filtre "Langue" pour vérifier que la fiche apparaît bien sous la bonne langue. Cliquer sur la flèche ▼ pour voir l\'aperçu du contenu. Le contenu est actif par défaut — utiliser ⏸ pour désactiver temporairement.',
        warning: null,
      },
    ],
    workflows: [
      {
        title: 'Ajouter les chiffres d\'une nouvelle langue',
        steps: [
          'Créer un contenu de type COMPTAGE associé à la langue',
          'Dans le formulaire visuel, saisir le mot et la transcription pour chaque chiffre de 0 à 10',
          'Cliquer sur "+ Ajouter un chiffre" pour les chiffres suivants (11, 20, 50, 100…)',
          'Vérifier l\'aperçu dans la liste (filtre sur la langue)',
          'Créer ensuite un contenu ADDITION et un contenu PAIR_IMPAIR pour compléter la langue',
        ],
      },
      {
        title: 'Créer une table de multiplication',
        steps: [
          'Créer un contenu de type MULTIPLICATION sans langue (contenu universel)',
          'Dans le formulaire visuel, saisir le premier facteur (ex: 3)',
          'Les lignes ×1, ×2, ×3… apparaissent avec le second facteur pré-suggéré',
          'Le résultat est calculé automatiquement — vérifier qu\'il est correct',
          'Définir les XP à 30 et l\'ordre souhaité',
        ],
      },
    ],
    tip: 'Demandez à un locuteur natif de valider la prononciation des chiffres avant de publier. La transcription phonétique est essentielle pour les utilisateurs non familiers avec la langue. Pour les utilisateurs avancés, un bouton "⚙️ Mode JSON avancé" permet d\'accéder directement au JSON brut.',
    warnings: [
      'Les tables de multiplication doivent être créées en contenu universel (sans langue) pour éviter la duplication.',
      'Si vous passez en mode JSON avancé, veillez à ne pas casser la structure : accolades fermées, guillemets doubles, virgules entre les éléments.',
    ],
    audioNaming: null,
  },

  {
    id: 'monnaie',
    route: '/monnaie',
    section: 'education',
    icon: '💰',
    title: 'Module Monnaie FCFA',
    subtitle: 'Pièces, billets et calculs du marché',
    color: 'amber',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Monnaie FCFA permet de créer des exercices pratiques de gestion de l\'argent : reconnaître visuellement les pièces (5 à 200 FCFA) et les billets (500 à 10 000 FCFA), calculer des sommes, rendre la monnaie au marché, et pratiquer les transactions commerciales en langue locale (notamment en Dioula, langue véhiculaire des marchés ivoiriens).',
    objectifs: [
      'Apprendre à reconnaître toutes les coupures FCFA',
      'Pratiquer les additions de pièces et billets',
      'Calculer la monnaie à rendre dans des scènes de marché réalistes',
      'Enrichir avec le vocabulaire commercial en langues locales',
    ],
    features: [
      '4 types : Reconnaissance, Calcul, Rendu monnaie, Conversion',
      'Référence visuelle des 11 coupures FCFA intégrée dans la page',
      'Formulaire visuel : sélecteur de coupures par clic (chips pièces/billets)',
      'Calcul automatique — CALCUL : somme des coupures ; RENDU : donne − prix',
      'Contenu universel (FCFA, indépendant de la langue) ou lié à une langue',
      'Onglet 🔊 Audios pour associer des fichiers audio à chaque fiche',
      'Filtre par langue et par type de contenu dans la liste',
      'Activation / désactivation individuelle',
    ],
    steps: [
      {
        title: 'Sélectionner le type d\'exercice',
        desc: 'Cliquer sur "+ Nouveau contenu" et choisir : Reconnaissance (identifier une coupure), Calcul (additionner des pièces), Rendu monnaie (calculer ce qu\'on rend), ou Conversion. Le formulaire visuel s\'adapte au type.',
        warning: null,
      },
      {
        title: 'Saisir le contenu avec le formulaire visuel',
        desc: 'Pour RECONNAISSANCE : cliquer sur les chips de pièces (5, 10, 25, 50, 100, 200 F) et de billets (500, 1 000, 2 000, 5 000, 10 000 F) pour sélectionner les coupures à afficher. Pour CALCUL : renseigner le montant de chaque coupure — le total est calculé automatiquement. Pour RENDU MONNAIE : saisir le prix et le montant donné — le rendu est calculé automatiquement (donné − prix).',
        warning: null,
      },
      {
        title: 'Adapter les exercices au marché local',
        desc: 'Pour les exercices de rendu de monnaie, utiliser des prix réalistes du marché ivoirien (pain à 150 F, eau à 300 F, oranges à 750 F…). Pour les contenus en langue, renseigner le champ "Question / contexte" avec la phrase en langue locale.',
        warning: null,
      },
      {
        title: 'Ajouter des audios (optionnel)',
        desc: 'Cliquer sur l\'onglet "🔊 Audios" pour associer des enregistrements audio au contenu. Par exemple : un locuteur natif qui prononce le montant en Dioula ("Wari kelen" pour 1 000 FCFA).',
        warning: null,
      },
      {
        title: 'Activer et vérifier',
        desc: 'Les nouveaux contenus sont actifs par défaut. Utiliser le filtre "Langue" pour vérifier que la fiche apparaît dans la bonne catégorie. Cliquer sur ▼ pour voir l\'aperçu. Désactiver les contenus incomplets avec ⏸.',
        warning: null,
      },
    ],
    workflows: [
      {
        title: 'Créer un exercice de marché en Dioula',
        steps: [
          'Créer un contenu de type CALCUL associé à la langue Dioula',
          'Dans le formulaire visuel, saisir les coupures de l\'exercice',
          'Le total FCFA est calculé automatiquement — vérifier qu\'il est correct',
          'Dans le champ "Question", rédiger la mise en situation en Dioula (ex: "I b\'a sɔrɔ jɔli?")',
          'Définir les points XP à 35 pour refléter la complexité',
          'Ajouter un audio dans l\'onglet 🔊 si un enregistrement est disponible',
        ],
      },
      {
        title: 'Créer un exercice de rendu de monnaie',
        steps: [
          'Créer un contenu de type RENDU_MONNAIE',
          'Saisir le prix de l\'article (ex: 150 pour un pain)',
          'Saisir le montant donné (ex: 500)',
          'Le rendu est calculé automatiquement (500 − 150 = 350)',
          'Renseigner la question de contexte (ex: "Tu achètes un pain. Tu donnes 500 F.")',
          'Optionnel : associer la langue Dioula pour afficher le dialogue au marché',
        ],
      },
    ],
    tip: 'La carte de référence FCFA en haut de la page est toujours visible. Utilisez-la pour vérifier les valeurs avant de saisir vos exercices. Les billets les plus utilisés au marché sont 500, 1 000 et 2 000 FCFA. En Dioula : Kɛmɛ = 100 F, Wari kelen = 1 000 F, Wari duuru = 5 000 F.',
    warnings: [
      'Créez les contenus de base (Reconnaissance, Calcul, Rendu monnaie) en mode universel avant d\'ajouter des variantes en langue.',
      'Le montant "donné" dans un exercice RENDU doit être supérieur ou égal au prix — sinon le rendu affiché sera 0.',
    ],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : PARTENAIRES
  // ─────────────────────────────────────────────
  {
    id: 'institutions',
    route: '/institutions',
    section: 'partenaires',
    icon: '🤝',
    title: 'Institutions & Partenaires',
    subtitle: 'Gestion des partenaires institutionnels',
    color: 'green',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module permet de gérer la liste des organisations, institutions et entreprises partenaires qui accompagnent le projet Langues Ivoire. Les partenaires actifs sont affichés dans la section Profil de l\'application mobile. Chaque partenaire peut être désactivé temporairement si ses engagements ne sont pas respectés, ou supprimé définitivement.',
    objectifs: [
      'Publier et maintenir la liste des partenaires institutionnels du projet',
      'Afficher les logos, descriptions et liens dans l\'application mobile',
      'Retirer rapidement un partenaire en cas de manquement à ses engagements',
      'Contrôler l\'ordre d\'affichage des partenaires dans l\'app',
    ],
    features: [
      'Création : nom, logo (upload PC ou URL), description, site web, catégorie, pays',
      'Import de logo depuis le PC par glisser-déposer ou bouton parcourir',
      'Aperçu du logo en temps réel dans le formulaire',
      'Activation / désactivation (retrait sans suppression)',
      'Suppression définitive avec confirmation',
      'Réordonnancement ↑↓ pour contrôler l\'ordre d\'affichage mobile',
      'Badge "⭐ Premier affiché" pour le partenaire en position 0',
    ],
    steps: [
      {
        title: 'Ajouter un partenaire',
        desc: 'Cliquer sur "+ Ajouter un partenaire". Saisir le nom de l\'institution. Le nom est le seul champ obligatoire.',
        warning: null,
      },
      {
        title: 'Importer le logo',
        desc: 'Glisser le fichier logo depuis le PC dans la zone pointillée, ou cliquer sur "Importer depuis le PC" pour ouvrir le sélecteur de fichiers. Formats acceptés : PNG, JPG, WEBP, SVG, GIF (max 5 Mo). Le logo est automatiquement envoyé sur Cloudinary et l\'URL est enregistrée.',
        warning: null,
      },
      {
        title: 'Rédiger la description',
        desc: 'Écrire une description claire du rôle du partenaire dans le projet : type d\'organisation, nature du partenariat, contribution au projet Langues Ivoire.',
        warning: null,
      },
      {
        title: 'Définir l\'ordre d\'affichage',
        desc: 'Utiliser les boutons ↑↓ pour changer la position du partenaire dans la liste. Le premier de la liste (ordre 0) apparaît en tête dans l\'application mobile.',
        warning: null,
      },
      {
        title: 'Désactiver en cas de manquement',
        desc: 'Si un partenaire ne respecte pas ses engagements, cliquer sur le bouton ⏸ (Désactiver). Le partenaire disparaît de l\'app mobile mais reste dans la base de données pour référence. Réactiver à tout moment avec ✅.',
        warning: 'La désactivation est préférable à la suppression définitive car elle préserve l\'historique du partenariat.',
      },
    ],
    workflows: [
      {
        title: 'Ajouter un nouveau partenaire institutionnel',
        steps: [
          'Obtenir le logo officiel de l\'institution (PNG ou SVG de haute qualité)',
          'Créer la fiche partenaire avec nom, catégorie et pays',
          'Importer le logo depuis le PC via drag-and-drop',
          'Rédiger une description de 2 à 4 phrases sur le rôle du partenaire',
          'Ajouter le site web officiel',
          'Positionner avec ↑↓ selon l\'ordre de priorité convenu',
          'Vérifier l\'affichage dans l\'app mobile (section Profil)',
        ],
      },
      {
        title: 'Retirer un partenaire en cas de litige',
        steps: [
          'Localiser le partenaire dans la liste',
          'Cliquer sur ⏸ Désactiver — il disparaît immédiatement de l\'app mobile',
          'Documenter la raison du retrait (en dehors du CMS : email, note interne)',
          'Si le litige est résolu, cliquer sur ✅ Réactiver',
          'Si définitivement terminé, cliquer sur 🗑 Supprimer avec confirmation',
        ],
      },
    ],
    tip: 'Classez le premier partenaire fondateur (Anthropic / Claude AI) toujours en position 0. Pour les autres, ordonnez par date d\'engagement ou par niveau de contribution au projet.',
    warnings: [
      'La suppression définitive est irréversible. Préférez la désactivation pour conserver l\'historique.',
      'Un logo de mauvaise qualité (pixelisé ou trop petit) nuit à l\'image de l\'application. Utilisez des logos vectoriels (SVG) ou PNG haute résolution (min 200×200 px).',
    ],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : FINANCE
  // ─────────────────────────────────────────────
  {
    id: 'finance',
    route: '/finance',
    section: 'finance',
    icon: '💰',
    title: 'Finance',
    subtitle: 'Gestion financière et abonnements',
    color: 'amber',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Module de gestion financière réservé aux Administrateurs et Super-Administrateurs. Il centralise le suivi des paiements, la gestion des abonnements Premium et la comptabilité de la plateforme. Les opérations financières sensibles (activation manuelle Premium, révocation) nécessitent un rôle Admin.',
    objectifs: [
      'Suivre les revenus et paiements de la plateforme',
      'Gérer les abonnements Premium des utilisateurs',
      'Exporter les données financières pour la comptabilité',
    ],
    features: [
      'Onglet Paiements : historique complet des transactions',
      'Onglet Abonnements Premium : liste des abonnés actifs avec date d\'expiration',
      'Activation manuelle du statut Premium pour un utilisateur',
      'Révocation du statut Premium',
      'Export des données financières (CSV)',
    ],
    steps: [
      { title: 'Consulter les paiements', desc: 'Aller dans l\'onglet "Paiements" pour voir l\'historique des transactions avec montant, date, mode de paiement et statut.', warning: null },
      { title: 'Gérer les abonnements Premium', desc: 'Aller dans l\'onglet "Abonnements Premium" pour voir la liste des utilisateurs Premium actifs, leurs dates d\'abonnement et d\'expiration.', warning: null },
      { title: 'Activer ou révoquer un Premium', desc: 'Rechercher l\'utilisateur, cliquer sur "Activer Premium" ou "Révoquer" selon le cas. Indiquer la raison (paiement validé, geste commercial, erreur technique...).', warning: 'Accès restreint aux rôles Admin et Super-Admin uniquement. Toute activation ou révocation manuelle doit être documentée avec sa justification.' },
      { title: 'Exporter les données', desc: 'Cliquer sur "Exporter" pour télécharger un fichier CSV des transactions ou des abonnements pour la comptabilité.', warning: null },
    ],
    workflows: [],
    tip: 'Effectuez un export mensuel des données financières et archivez-le. En cas de litige utilisateur sur un paiement, cet historique est indispensable.',
    warnings: [
      'Accès restreint aux rôles Admin et Super-Admin uniquement.',
      'Toute activation ou révocation manuelle de statut Premium doit être documentée avec sa justification.',
    ],
    audioNaming: null,
  },

  // ─────────────────────────────────────────────
  // SECTION : ADMINISTRATION
  // ─────────────────────────────────────────────
  {
    id: 'utilisateurs',
    route: '/users',
    section: 'admin',
    icon: '👥',
    title: 'Utilisateurs',
    subtitle: 'Gestion des accès CMS',
    color: 'gray',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Ce module gère les comptes d\'accès au CMS Langues Ivoire — créateurs de contenu, éditeurs, contributeurs et administrateurs. Il ne concerne pas les utilisateurs de l\'application mobile mais uniquement les personnes ayant accès au back-office.',
    objectifs: [
      'Créer et gérer les comptes d\'accès CMS de l\'équipe éditoriale',
      'Attribuer les rôles appropriés selon les responsabilités',
      'Contrôler l\'accès aux modules sensibles',
    ],
    features: [
      'Liste des comptes CMS avec rôle et dernier accès',
      'Création de nouveaux comptes (nom, email, rôle)',
      'Rôles disponibles : Éditeur, Contributeur, Admin',
      'Sélection des modules accessibles par compte',
      'Désactivation d\'un compte sans suppression',
    ],
    steps: [
      { title: 'Créer un nouveau compte CMS', desc: 'Cliquer sur "+ Nouveau compte", saisir le nom complet, l\'adresse email et définir le rôle.', warning: null },
      { title: 'Définir les permissions de modules', desc: 'Sélectionner les modules auxquels ce compte aura accès. Un Éditeur peut ne pas avoir accès aux modules Finance ou Administration.', warning: null },
      { title: 'Envoyer les accès', desc: 'Le nouveau membre reçoit un email d\'invitation avec ses identifiants de connexion au CMS.', warning: 'Ne pas confondre avec les utilisateurs de l\'application mobile. Ce module gère uniquement les accès CMS.' },
    ],
    workflows: [
      {
        title: 'Onboarding d\'un nouvel éditeur de contenu',
        steps: [
          'Créer le compte avec le rôle "Éditeur"',
          'Activer les modules : Dictionnaire, Vocabulaire, Leçons, Culture, Textes',
          'Désactiver les modules : Finance, Utilisateurs, Notifications',
          'Envoyer l\'invitation par email',
          'Planifier une session de formation avec le guide d\'utilisation',
        ],
      },
    ],
    tip: 'Appliquez le principe du moindre privilège : donnez à chaque membre uniquement les accès aux modules nécessaires à ses missions. Cela réduit les risques d\'erreurs involontaires.',
    warnings: [
      'Ne pas confondre avec les utilisateurs de l\'application mobile. Ce module gère uniquement les comptes d\'accès au CMS.',
    ],
    audioNaming: null,
  },

  {
    id: 'profil',
    route: '/profile',
    section: 'admin',
    icon: '👤',
    title: 'Mon Profil',
    subtitle: 'Gestion du compte personnel',
    color: 'gray',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le module Mon Profil permet à chaque membre de l\'équipe CMS de gérer ses informations personnelles de compte : nom, prénom, adresse email et mot de passe. Le rôle attribué y est également visible.',
    objectifs: [
      'Maintenir des informations de compte à jour',
      'Sécuriser son compte avec un mot de passe fort',
    ],
    features: [
      'Modification du nom et prénom',
      'Modification de l\'adresse email',
      'Changement de mot de passe (confirmation requise)',
      'Affichage du rôle attribué (lecture seule)',
    ],
    steps: [
      { title: 'Accéder au profil', desc: 'Cliquer sur son nom ou l\'icône de profil en haut à droite du CMS, puis sélectionner "Mon Profil".', warning: null },
      { title: 'Modifier les informations', desc: 'Mettre à jour le nom, prénom ou email selon les besoins et cliquer sur "Sauvegarder".', warning: null },
      { title: 'Changer le mot de passe', desc: 'Saisir le mot de passe actuel, le nouveau mot de passe et le confirmer. Utiliser un mot de passe d\'au moins 12 caractères avec majuscules, chiffres et caractères spéciaux.', warning: null },
    ],
    workflows: [],
    tip: 'Changez votre mot de passe tous les 3 à 6 mois. N\'utilisez jamais le même mot de passe que pour d\'autres services. En cas de compromission suspectée, changez-le immédiatement et prévenez l\'administrateur.',
    warnings: [],
    audioNaming: null,
  },

  {
    id: 'guide',
    route: '/guide',
    section: 'admin',
    icon: '📚',
    title: 'Guide d\'Utilisation',
    subtitle: 'Formation complète au CMS',
    color: 'gray',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Guide de formation complet au CMS Langues Ivoire. Cette page centralise les tutoriels détaillés de tous les modules pour former les nouveaux membres de l\'équipe et servir de référence documentaire pour les membres expérimentés.',
    objectifs: [
      'Former les nouveaux membres de l\'équipe éditoriale',
      'Servir de référence documentaire consultable à tout moment',
      'Standardiser les pratiques de création de contenu',
    ],
    features: [
      'Tutoriels détaillés pour chaque module du CMS',
      'Filtrage par section et par module',
      'Aide contextuelle disponible dans chaque module (bouton ?)',
      'Workflows complets pour les cas d\'usage les plus courants',
      'Conseils et avertissements pour éviter les erreurs fréquentes',
    ],
    steps: [
      { title: 'Explorer les sections', desc: 'Parcourir les sections thématiques (Contenu, Médias, Communauté, IA...) pour trouver le module concerné.', warning: null },
      { title: 'Lire le tutoriel complet', desc: 'Chaque module dispose d\'une description, d\'objectifs clairs, de fonctionnalités, d\'étapes détaillées et de workflows pratiques.', warning: null },
      { title: 'Utiliser l\'aide contextuelle', desc: 'Dans chaque module du CMS, cliquer sur le bouton "?" en haut à droite pour afficher directement le tutoriel du module en cours.', warning: null },
    ],
    workflows: [],
    tip: 'Commencez par lire le tutoriel du Tableau de Bord, puis les modules de votre section principale. L\'aide contextuelle (bouton ?) disponible dans chaque module vous évite de revenir au guide général.',
    warnings: [],
    audioNaming: null,
  },
];
