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
    id: 'validation-committee',
    route: '/validation-committee',
    section: 'communaute',
    icon: '🔬',
    title: 'Comité de Validation ILA',
    subtitle: 'Certification scientifique + Rapport du comité',
    color: 'teal',
    roles: ['EXPERT', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Le Comité de Validation ILA-UFHB certifie les enregistrements audio soumis par les locuteurs natifs. Ce module comprend deux onglets : 🗳️ "À voter" pour soumettre les votes de certification, et 📊 "Rapport" pour analyser l\'activité du comité et exporter un rapport PDF officiel. Le quorum est de 3 votes sur 5 experts.',
    objectifs: [
      'Garantir la qualité phonétique et linguistique des enregistrements audio',
      'Certifier les voix de référence pour les 9 langues MVP',
      'Alimenter les tuteurs IA avec des données audio certifiées ILA',
      'Produire un rapport officiel de l\'activité du comité (par période et par langue)',
    ],
    features: [
      '🗳️ Onglet "À voter" : liste filtrée par statut (À examiner, Certifiés, Révisions, Rejetés)',
      '📊 Onglet "Rapport" : rapport complet filtrable par période et par langue',
      'Lecteur audio intégré ▶ pour écouter chaque contribution avant de voter',
      'Vote en 3 options : ✅ Approuvé, ⚠️ Révision demandée, ❌ Rejeté',
      'Commentaire obligatoire pour Révision ou Rejet',
      'Indicateur de progression du quorum (votes / 5 experts)',
      'Modification du vote possible tant que le quorum n\'est pas atteint',
      'Rapport : 5 KPI cards (certifiés, rejetés, révision, à examiner, total)',
      'Rapport : Répartition par langue avec barres de progression',
      'Rapport : Tableau d\'activité des experts (approuvés / révisions / rejetés par expert)',
      'Rapport : Listes détaillées certifiés, rejetés et en révision avec votes et commentaires',
      'Export PDF multi-pages du rapport complet',
    ],
    steps: [
      { title: 'Onglet À voter — Parcourir les contributions', desc: 'L\'onglet "🗳️ À voter" liste les contributions en statut SUBMITTED ou IN_REVIEW. Utiliser le filtre Langue pour se concentrer sur les langues que vous maîtrisez.', warning: null },
      { title: 'Écouter avant de voter', desc: 'Cliquer sur le bouton ▶ pour lancer la lecture de la contribution. Évaluer : clarté sonore, prononciation correcte, absence de bruit de fond.', warning: null },
      { title: 'Voter', desc: 'Cliquer sur "Voter" pour ouvrir le formulaire de vote. Choisir ✅ Approuvé (enregistrement conforme), ⚠️ Révision (corrections nécessaires) ou ❌ Rejeté (qualité insuffisante). Un commentaire est obligatoire pour Révision et Rejet.', warning: null },
      { title: 'Vérifier le quorum', desc: 'Après votre vote, le compteur indique les votes reçus sur les 5 experts. Dès que 3 votes convergent sur la même décision, le statut change automatiquement.', warning: 'Un vote ne peut pas être modifié une fois le quorum atteint (3/5).' },
      { title: 'Onglet Rapport — Sélectionner la période', desc: 'Basculer sur l\'onglet "📊 Rapport". Choisir la période dans le sélecteur : Ce mois, Ce trimestre, Cette année ou Tout. Sélectionner optionnellement une langue pour filtrer le rapport.', warning: null },
      { title: 'Analyser les KPIs et tableaux', desc: 'Les 5 cartes KPI affichent les volumes de la période. Le bloc "Certifications par langue" montre la répartition. Le tableau "Activité des experts" permet de vérifier que tous les membres du comité votent régulièrement.', warning: null },
      { title: 'Consulter les listes détaillées', desc: 'Faire défiler pour voir la liste des contributions certifiées (avec votes), rejetées (avec motifs) et en révision (avec commentaires des experts). Ces informations permettent de préparer les rapports institutionnels.', warning: null },
      { title: 'Exporter le rapport en PDF', desc: 'Cliquer sur "Exporter PDF" en haut du panneau Rapport. Le fichier est nommé rapport_comite_ila_[période]_[date].pdf et contient toutes les sections avec un en-tête officiel.', warning: null },
    ],
    workflows: [
      {
        title: 'Certifier une série de contributions en Dioula',
        steps: [
          'Aller sur l\'onglet "🗳️ À voter"',
          'Sélectionner le filtre Langue → Dioula',
          'Pour chaque contribution : écouter, vérifier la transcription, voter',
          'Si révision demandée : préciser dans le commentaire la correction attendue',
          'Vérifier l\'onglet "Certifiés ILA" en fin de session pour confirmer les certifications',
        ],
      },
      {
        title: 'Produire le rapport mensuel du comité',
        steps: [
          'Aller sur l\'onglet "📊 Rapport"',
          'Sélectionner la période "Ce mois"',
          'Vérifier les KPIs : nombre de certifiés, rejetés, en révision',
          'Vérifier le tableau des experts — identifier ceux qui n\'ont pas encore voté ce mois',
          'Cliquer sur "Exporter PDF" pour générer le rapport officiel',
          'Partager le PDF avec le coordinateur ILA-UFHB et les autorités institutionnelles',
        ],
      },
    ],
    tip: 'Utilisez le Rapport avec la période "Ce mois" en début de mois pour vérifier que tous les experts ont voté. Si un expert a 0 vote, le quorum 3/5 devient difficile à atteindre — il faut le relancer rapidement.',
    warnings: [
      'Seuls les membres avec le rôle Expert ILA peuvent voter. L\'attribution du rôle se fait dans Administration → Utilisateurs (Super-Admin uniquement).',
      'Un enregistrement rejeté n\'est pas supprimé — il reste visible dans le Rapport et peut être réinitialisé par un Admin si un nouveau locuteur fournit une meilleure version.',
      'Le Rapport n\'affiche que les données de la base de production. Pour les présentations institutionnelles, vérifiez que les données sont bien à jour avant d\'exporter.',
    ],
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
    subtitle: 'Hub centralisé de création de contenu multimodule',
    color: 'cyan',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Centre névralgique de création et d\'import de contenu pour toutes les langues ivoiriennes. Ce module regroupe 8 onglets thématiques permettant d\'alimenter directement chaque section de l\'application mobile sans quitter une interface unique : Audio IA, Dictionnaire, Phrases Utiles, Premiers Secours, Civisme, Sens des Mots, Culture & Traditions, Textes & Récits.',
    objectifs: [
      'Centraliser la création de contenu pour tous les modules depuis une seule interface',
      'Importer et gérer les enregistrements audio soumis au pipeline de certification ILA-UFHB',
      'Ajouter du contenu linguistique et culturel langue par langue',
      'Alimenter les 8 sections de l\'application mobile de manière cohérente',
    ],
    features: [
      'Onglet Audio IA : import audio individuel et en masse — soumission au comité de certification ILA-UFHB',
      'Onglet Dictionnaire : ajout et édition de mots avec phonétique, catégorie, exemple et audio',
      'Onglet Phrases Utiles : ajout de phrases par catégorie (expressions, voyage, commerce…)',
      'Onglet Premiers Secours : fiches de consignes d\'urgence par situation (saignement, malaise, brûlure…)',
      'Onglet Civisme : proverbes civiques, symboles de l\'État, droits et devoirs en langues locales',
      'Onglet Sens des Mots : réhabilitation des significations culturelles authentiques',
      'Onglet Culture & Traditions : proverbes, traditions, danses, anecdotes historiques',
      'Onglet Textes & Récits : contes, légendes, récits du patrimoine oral ivoirien',
      'Sélecteur de langue global appliqué à tous les onglets',
    ],
    steps: [
      { title: 'Choisir la langue cible', desc: 'En haut de page, sélectionner la langue ivoirienne (Baoulé, Dioula, Yacouba…) sur laquelle vous allez travailler. Ce filtre global s\'applique à tous les onglets.', warning: null },
      { title: 'Naviguer vers l\'onglet souhaité', desc: 'Cliquer sur l\'onglet correspondant au type de contenu à créer : Audio IA pour les enregistrements, Dictionnaire pour les mots, Phrases Utiles pour les expressions, etc.', warning: null },
      { title: 'Importer de l\'audio (onglet Audio IA)', desc: 'Pour un enregistrement individuel : cliquer sur "+ Ajouter un audio", renseigner la langue, le mot, la traduction, la catégorie, puis uploader le fichier audio. Pour plusieurs fichiers : utiliser "Import en masse" et définir langue + genre commun à la session. Les enregistrements rejoignent automatiquement le pipeline de certification ILA-UFHB.', warning: 'Seul un fichier par entrée pour l\'import individuel. Nommez les fichiers de l\'import en masse selon la convention : mot_langue_genre.m4a' },
      { title: 'Ajouter un mot (onglet Dictionnaire)', desc: 'Cliquer sur "+ Ajouter un mot", remplir le mot en langue locale (obligatoire), la traduction française (obligatoire), la phonétique, la catégorie et un exemple de phrase. Enregistrer.', warning: null },
      { title: 'Créer un contenu culturel (onglets Culture, Textes, Civisme…)', desc: 'Chaque onglet affiche un formulaire adapté à son type de contenu. Remplir les champs requis (titre, contenu en langue locale, traduction) et sauvegarder. Le contenu devient immédiatement visible dans l\'application mobile.', warning: null },
    ],
    workflows: [
      {
        title: 'Enrichir le corpus d\'une nouvelle langue (ex : Yacouba)',
        steps: [
          'Sélectionner "Yacouba" dans le sélecteur de langue en haut',
          'Onglet Dictionnaire : ajouter les 30 mots de base (salutations, famille, nature)',
          'Onglet Phrases Utiles : ajouter 10 phrases du quotidien avec phonétique',
          'Onglet Culture & Traditions : saisir 3 proverbes et 1 tradition majeure',
          'Onglet Textes & Récits : importer 1 conte et 1 légende fondatrice',
          'Onglet Audio IA : importer les enregistrements natifs correspondants',
          'Vérifier dans l\'app mobile que le contenu s\'affiche correctement',
        ],
      },
    ],
    tip: 'Commencez toujours par enrichir le Dictionnaire (base), puis les Phrases Utiles, puis les contenus culturels. Un dictionnaire solide de 50+ mots rend l\'application immédiatement utilisable pour une langue.',
    warnings: [
      'Les contenus créés ici sont publiés immédiatement dans l\'application mobile. Vérifiez les traductions et phonétiques avec un locuteur natif avant de sauvegarder.',
    ],
    audioNaming: null,
  },

  {
    id: 'test-agents',
    route: '/test-agents',
    section: 'ia',
    icon: '🧪',
    title: 'Test Agents IA',
    subtitle: 'Simulation et validation des tuteurs conversationnels',
    color: 'cyan',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Environnement de test des deux agents conversationnels IA déployés sur l\'application mobile : Zélé (👩 tuteure, voix féminine) et Kouadio (👨 tuteur, voix masculine). Ce module permet de simuler des échanges pédagogiques en temps réel, valider la qualité des réponses et détecter les comportements incorrects avant qu\'ils n\'atteignent les utilisateurs finaux. Les agents répondent dans toutes les langues ivoiriennes disponibles.',
    objectifs: [
      'Valider le comportement conversationnel des tuteurs avant chaque mise en production',
      'Tester les réponses pédagogiques dans des situations variées (débutant, intermédiaire, correction)',
      'Identifier les réponses culturellement inexactes ou pédagogiquement inadaptées',
      'Comparer le comportement des deux agents sur les mêmes questions',
    ],
    features: [
      'Interface de chat temps réel avec Zélé (👩) — tonalité chaleureuse et encourageante',
      'Interface de chat temps réel avec Kouadio (👨) — tonalité posée et méthodique',
      'Sélecteur de langue : tester chaque agent sur toutes les langues disponibles',
      'Réponses incluant traduction, phonétique et exemples de phrases',
      'Indicateur de chargement pendant le traitement de la requête IA',
    ],
    steps: [
      { title: 'Sélectionner la langue de test', desc: 'Choisir la langue ivoirienne sur laquelle tester l\'agent (Baoulé, Dioula, Yacouba, Bété…). Les agents adaptent leurs réponses à la langue sélectionnée.', warning: null },
      { title: 'Choisir l\'agent à tester', desc: 'Cliquer sur "Zélé" ou "Kouadio" pour ouvrir l\'interface de chat avec cet agent. Tester les deux agents sur les mêmes questions pour comparer.', warning: null },
      { title: 'Simuler des scénarios pédagogiques', desc: 'Engager une conversation comme si vous étiez un apprenant débutant. Exemples : "Comment dit-on bonjour en Yacouba ?", "Traduis le mot eau", "Donne-moi un exemple de phrase avec père".', warning: null },
      { title: 'Évaluer la qualité des réponses', desc: 'Vérifier : exactitude linguistique (mot correct dans la bonne langue), phonétique correcte, traduction française fidèle, ton adapté au niveau débutant.', warning: null },
      { title: 'Documenter les anomalies', desc: 'Si une réponse est incorrecte ou culturellement inadaptée, noter le message exact, la langue et la réponse obtenue. Signaler aux développeurs pour ajustement du prompt système de l\'agent.', warning: 'Une réponse incorrecte vue par un apprenant peut créer une mauvaise habitude d\'apprentissage. Traitez les anomalies en priorité.' },
    ],
    workflows: [
      {
        title: 'Protocole de validation avant déploiement d\'une nouvelle langue',
        steps: [
          'Sélectionner la langue nouvellement ajoutée dans le sélecteur',
          'Tester avec Zélé : salutations (5 mots), famille (5 mots), chiffres 1-5',
          'Tester avec Kouadio : mêmes questions pour comparer la cohérence',
          'Tester des questions hors-sujet ("parle-moi de Paris") — l\'agent doit recentrer',
          'Tester une erreur délibérée de l\'apprenant — l\'agent doit corriger poliment',
          'Si toutes les réponses sont correctes : marquer la langue comme "validée agent"',
          'Si anomalies : documenter et corriger avant mise en production',
        ],
      },
    ],
    tip: 'Testez au minimum 20 scénarios variés par agent et par langue : débutant absolu, questions de vocabulaire, demande de répétition, erreur de l\'apprenant, félicitations. Un agent non testé peut diffuser des erreurs linguistiques à grande échelle.',
    warnings: [
      'Les agents utilisent le modèle Claude via API — chaque test a un coût. Priorisez les tests ciblés sur les langues nouvellement enrichies.',
    ],
    audioNaming: null,
  },

  {
    id: 'repetitor',
    route: '/repetitor',
    section: 'ia',
    icon: '🦜',
    title: 'RÉPÉTO',
    subtitle: 'Compagnon Vocal ILA — Phase 1 : Mode Écho',
    color: 'teal',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'RÉPÉTO est un jeu vocal conçu pour tous les apprenants, y compris les plus jeunes qui ne savent pas encore lire. L\'application joue un mot en langue locale et l\'apprenant le répète à voix haute. En Phase 1 (Mode Écho), chaque enregistrement est conservé pour constituer un corpus audio unique des langues ethniques ivoiriennes. Notre objectif : après un corpus suffisamment large grâce à nos locuteurs, passer à la Phase 2 — Reconnaissance Vocale ILA.',
    objectifs: [
      'Rendre l\'apprentissage des langues accessibles aux non-lecteurs et aux très jeunes enfants',
      'Constituer un corpus audio varié (enfants, adultes, dialectes régionaux) pour les langues ivoiriennes',
      'Préparer les données d\'entraînement pour la future IA de reconnaissance vocale ILA',
      'Gamifier la répétition pour maximiser l\'engagement et la rétention',
    ],
    features: [
      '📊 Tableau de bord : KPIs (sessions, mots actifs, langues, pipeline ILA)',
      '📊 Répartition des sessions par langue et par groupe d\'âge',
      '🎙️ Onglet Sessions : liste de toutes les répétitions enregistrées depuis l\'app mobile',
      '🎙️ Écoute des enregistrements enfants + comparaison avec l\'audio natif ILA',
      '🔵 Actions de statut : BRUT → SOUMIS_ILA → ARCHIVÉ',
      '📝 Onglet Mots du jeu : catalogue des mots RÉPÉTO par langue',
      '📝 Ajout/modification/suppression de mots (mot, traduction, audio certifié, emoji, catégorie, niveau)',
      '▶/⏸ Activation/désactivation de mots sans suppression',
      '🚀 Bannière Phase 1 + roadmap Phase 2 et Phase 3 visible dans l\'interface',
      'Filtres par langue, statut, âge sur toutes les listes',
    ],
    steps: [
      {
        title: 'Ajouter les premiers mots du catalogue',
        desc: 'Allez dans l\'onglet "Mots du jeu" → cliquez "+ Ajouter un mot". Choisissez une langue, saisissez le mot en langue locale, sa traduction française et l\'URL audio certifiée ILA. Ajoutez un emoji pour rendre le jeu plus visuels.',
      },
      {
        title: 'Vérifier l\'audio natif',
        desc: 'Sur chaque carte mot, cliquez "Écouter l\'audio natif". C\'est cet audio que les apprenants vont entendre avant de répéter. Il doit être clair, sans bruit de fond, prononcé par un locuteur natif certifié.',
        warning: 'Utilisez uniquement des audios certifiés par le comité ILA. Un audio incorrect enseignera une mauvaise prononciation à grande échelle.',
      },
      {
        title: 'Organiser les mots par niveau et catégorie',
        desc: 'Définissez un niveau (Débutant / Intermédiaire / Avancé) et une catégorie (animaux, famille, couleurs…) pour chaque mot. L\'application mobile utilisera ces métadonnées pour proposer des sessions adaptées à l\'âge et au niveau de l\'apprenant.',
      },
      {
        title: 'Consulter les sessions enregistrées',
        desc: 'Dans l\'onglet "Sessions", écoutez les répétitions des apprenants. Comparez avec l\'audio natif. Identifiez les répétitions de qualité qui pourraient enrichir le corpus ILA.',
      },
      {
        title: 'Soumettre les meilleures sessions au pipeline ILA',
        desc: 'Pour une session de qualité, cliquez l\'icône ✓ (soumettre au comité ILA). La session passe en statut "Soumis ILA" et sera visible dans le module Comité ILA pour évaluation scientifique.',
      },
      {
        title: 'Archiver ou supprimer les sessions inutilisables',
        desc: 'Sessions trop bruyantes, incompréhensibles ou hors-sujet : archivez (⬜) ou supprimez (🗑️). Ne soumettez au comité que des enregistrements de qualité exploitable.',
      },
    ],
    workflows: [
      {
        title: 'Enrichissement mensuel du corpus RÉPÉTO',
        steps: [
          'Consulter l\'onglet Tableau de bord → compter les nouvelles sessions BRUT du mois',
          'Écouter chaque session BRUT — comparer avec l\'audio natif',
          'Sessions de bonne qualité → cliquer ✓ pour soumettre au pipeline ILA',
          'Sessions inutilisables → archiver ou supprimer',
          'Vérifier que les nouvelles langues MVP ont bien leurs mots dans le catalogue',
          'Ajouter 5 à 10 nouveaux mots par langue chaque mois pour diversifier le jeu',
        ],
      },
    ],
    warnings: [
      'Phase 1 uniquement : RÉPÉTO ne fait PAS encore de reconnaissance vocale. C\'est un jeu de répétition simple. L\'IA viendra en Phase 2, après constitution du corpus.',
      'Les enregistrements contiennent des voix d\'enfants. Traitez-les avec confidentialité — ne les partagez jamais en dehors du pipeline ILA.',
      'Un mot sans audio certifié ILA ne peut pas être ajouté. Validez d\'abord l\'audio via le module Comité ILA.',
    ],
    tip: 'Commencez avec 10 à 15 mots simples (couleurs, animaux, chiffres 1 à 5) pour chaque langue MVP. Les mots courts, bien illustrés par un emoji, génèrent les meilleurs taux d\'engagement chez les jeunes apprenants.',
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

  {
    id: 'partenaire',
    route: '/partenaire',
    section: 'partenaires',
    icon: '📊',
    title: 'Tableau de Bord Partenaires',
    subtitle: 'Vue stratégique pour investisseurs et décideurs',
    color: 'emerald',
    roles: ['PARTNER', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Tableau de bord stratégique réservé aux partenaires et investisseurs du projet Langues Ivoire. Il présente les indicateurs clés de performance (KPIs) en temps réel : utilisateurs inscrits, taux d\'engagement, langues couvertes, certificats délivrés et impact de mission. Conçu pour faciliter les présentations institutionnelles et les rapports de suivi.',
    objectifs: [
      'Visualiser l\'impact social et culturel du projet en un coup d\'œil',
      'Suivre la croissance des utilisateurs et l\'engagement dans l\'app mobile',
      'Présenter les tuteurs IA et les données de certification aux décideurs',
    ],
    features: [
      'KPIs en temps réel : utilisateurs, actifs, certifiés, leçons complétées',
      'Graphique d\'activité hebdomadaire (inscriptions vs actifs)',
      'Distribution des langues apprises (camembert interactif)',
      'Présentation des tuteurs IA (Zélé, Kouadio) et leurs statistiques',
      'Carte de Côte d\'Ivoire avec couverture linguistique par région',
      'Section Mission & Impact : chiffres clés pour les rapports officiels',
      'Export PDF du rapport complet (bouton en haut de page)',
    ],
    steps: [
      { title: 'Consulter les KPIs du moment', desc: 'Les 4 cartes de KPIs en haut de page (Utilisateurs, Actifs, Certifiés, Leçons) se mettent à jour automatiquement. Elles reflètent l\'état réel de la base de données.', warning: null },
      { title: 'Lire les graphiques d\'activité', desc: 'Le graphique linéaire "Activité 7 derniers jours" montre la tendance des inscriptions et des connexions actives. Une courbe croissante indique une bonne traction.', warning: null },
      { title: 'Explorer la couverture linguistique', desc: 'La carte CI et le graphique de distribution montrent quelles langues sont les plus apprises. Utile pour justifier les priorités éditoriales auprès des bailleurs.', warning: null },
      { title: 'Exporter pour une présentation', desc: 'Cliquer sur "📄 Exporter PDF" en haut à droite pour générer un rapport complet avec tous les KPIs, graphiques et statistiques de mission.', warning: null },
    ],
    workflows: [
      {
        title: 'Préparer une présentation investisseur',
        steps: [
          'Ouvrir le Tableau Partenaires la veille de la réunion',
          'Vérifier que les KPIs sont à jour (rafraîchir si besoin)',
          'Identifier les 3 chiffres les plus parlants (ex : +1 200 utilisateurs ce mois)',
          'Exporter le PDF et l\'intégrer dans la présentation PowerPoint',
          'Pendant la réunion : montrer le tableau en direct pour l\'aspect dynamique',
        ],
      },
    ],
    tip: 'Pour les réunions institutionnelles (MENET, ILA, mairies), ce tableau remplace avantageusement un rapport statique. Il montre la réalité en temps réel et renforce la crédibilité du projet.',
    warnings: [
      'Les données sont issues de la base de production — elles reflètent l\'état réel de l\'application. Ne pas confondre avec des projections ou des estimations.',
    ],
    audioNaming: null,
  },

  {
    id: 'rapport-editeurs',
    route: '/rapport-editeurs',
    section: 'admin',
    icon: '📈',
    title: 'Rapport d\'activité',
    subtitle: 'Pipeline de certification ILA-UFHB & statistiques éditeurs',
    color: 'gray',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Tableau de bord analytique réservé aux administrateurs pour suivre l\'activité du pipeline de certification audio ILA-UFHB. Ce rapport consolide les données de toutes les contributions audio : volume traité, taux de certification, délai moyen entre soumission et certification, répartition par langue et activité individuelle des experts du comité. Il est exportable en PDF et en CSV pour les réunions institutionnelles.',
    objectifs: [
      'Mesurer l\'efficacité du pipeline de certification audio ILA-UFHB',
      'Identifier les langues les mieux couvertes et celles qui nécessitent plus de contributions',
      'Suivre l\'activité de chaque expert du comité (votes émis, taux d\'approbation)',
      'Exporter les données pour les rapports institutionnels',
    ],
    features: [
      '6 KPIs globaux : total soumis, certifiés ILA, en examen, en révision, rejetés, délai moyen (jours)',
      'Pipeline visuel : barre de progression colorée par statut',
      'Tableau par langue : volume, certifiés, en examen, révision, rejetés, délai moyen, taux de certification',
      'Tableau experts ILA-UFHB : votes approuvés / révision / rejetés par expert, part d\'approbation',
      'Export CSV : rapport complet téléchargeable (langues + experts)',
      'Export PDF : capture haute résolution de toute la page, multi-page automatique',
      'Bouton Actualiser : rechargement des données en temps réel',
    ],
    steps: [
      { title: 'Consulter les KPIs globaux', desc: 'Les 6 cartes en haut de page donnent une vue instantanée du pipeline. Le "Délai moy." indique en jours le temps moyen entre la soumission d\'un audio et sa certification ILA.', warning: null },
      { title: 'Analyser le pipeline visuel', desc: 'La barre colorée montre la répartition : vert = certifiés, bleu = en examen, orange = en révision, rouge = rejetés. Un pipeline sain a > 80 % de vert.', warning: null },
      { title: 'Identifier les langues prioritaires', desc: 'Dans le tableau "Langues couvertes", repérer les langues avec un faible taux de certification ou un délai moyen élevé. Ce sont les langues nécessitant une attention du comité.', warning: null },
      { title: 'Vérifier l\'activité des experts', desc: 'Dans le tableau "Activité des experts ILA-UFHB", vérifier que tous les experts votent régulièrement. Un expert avec 0 vote récent doit être relancé pour maintenir le quorum 3/5.', warning: null },
      { title: 'Exporter pour un rapport', desc: 'Cliquer sur "CSV" pour un export tableur (Excel/Sheets). Cliquer sur "Exporter PDF" pour un rapport complet multi-page au format A4, nommé rapport_ila_YYYY-MM-DD.pdf.', warning: null },
    ],
    workflows: [
      {
        title: 'Préparer le rapport mensuel ILA-UFHB',
        steps: [
          'Ouvrir le Rapport d\'activité en début de mois',
          'Cliquer sur "Actualiser" pour s\'assurer que les données sont à jour',
          'Vérifier le taux de certification global (objectif : > 80 %)',
          'Identifier les langues avec délai > 7 jours — contacter les experts responsables',
          'Exporter le PDF pour archivage mensuel',
          'Partager le CSV avec le coordinateur scientifique ILA-UFHB',
        ],
      },
    ],
    tip: 'Le délai moyen de certification est l\'indicateur clé de santé du comité. Un délai > 14 jours signale un manque de disponibilité des experts — vérifier que le quorum de 3/5 est atteignable.',
    warnings: [
      'Ce rapport affiche uniquement les données audio de certification. Il ne couvre pas les contributions textuelles (dictionnaire, phrases, contenu culturel).',
      'Les experts apparaissent dans le tableau uniquement s\'ils ont voté au moins une fois. Un tableau vide signifie qu\'aucun vote n\'a encore été enregistré.',
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
    subtitle: 'Revenus, dépenses, abonnements & comptabilité',
    color: 'amber',
    roles: ['ADMIN', 'SUPER_ADMIN'],
    description:
      'Module de gestion financière complet réservé aux Administrateurs et Super-Administrateurs. Il centralise 6 onglets : la comptabilité globale, les tarifs, les paiements publicitaires, les contributions financières (dons/parrainages), les abonnements Premium et le rapport des dépenses. Chaque onglet est exportable en PDF.',
    objectifs: [
      'Suivre l\'ensemble des flux financiers entrants et sortants de la plateforme',
      'Gérer les abonnements Premium et les contributions des partenaires',
      'Enregistrer et analyser les dépenses opérationnelles avec pièces justificatives',
      'Exporter des rapports financiers pour la comptabilité et les audits',
    ],
    features: [
      '📊 Onglet Comptabilité : résumé financier global avec revenus vs dépenses, graphique et export PDF',
      '💲 Onglet Tarifs : grille tarifaire des offres Premium et publicités',
      '📢 Onglet Paiements : historique des transactions publicitaires avec statut et montant',
      '🤝 Onglet Contributions : dons, parrainages et contributions financières des partenaires',
      '⭐ Onglet Premium : liste des abonnés actifs, activation et révocation manuelle',
      '💸 Onglet Dépenses : rapport des dépenses opérationnelles (salaires, infra, marketing…)',
      'Dépenses : champs Sujet, Objet/Catégorie (9 types), Montant, Date, Fournisseur, N° facture, Description',
      'Dépenses : upload de pièce jointe PDF / image / Word (via Cloudinary)',
      'Dépenses : 4 KPI cards (total, validées, en attente, catégorie dominante)',
      'Dépenses : répartition par catégorie avec barres de progression',
      'Dépenses : filtres par catégorie, statut, période et recherche',
      'Export PDF de chaque onglet via jsPDF + html2canvas',
    ],
    steps: [
      { title: 'Consulter la comptabilité globale', desc: 'Aller dans l\'onglet "📊 Comptabilité". Les KPIs affichent les revenus totaux, les dépenses totales et le solde net. Le graphique montre l\'évolution dans le temps. Filtrer par période (mois / trimestre / année).', warning: null },
      { title: 'Gérer les paiements publicitaires', desc: 'Aller dans l\'onglet "📢 Paiements" pour voir toutes les transactions liées aux annonces et publicités. Chaque ligne affiche montant, date, statut (validé / en attente / rejeté) et les actions disponibles.', warning: null },
      { title: 'Enregistrer une dépense', desc: 'Aller dans l\'onglet "💸 Dépenses", cliquer sur "+ Nouvelle dépense". Remplir : Sujet (intitulé court), Objet/Catégorie (Salaire, Infrastructure, Matériel, Marketing, Transport, Abonnement, Formation, Juridique ou Autre), Montant (en FCFA), Date, Fournisseur (optionnel), N° Facture (optionnel) et Description.', warning: null },
      { title: 'Joindre une pièce justificative', desc: 'Dans le formulaire Dépense, cliquer sur "Ajouter une pièce jointe" pour uploader la facture PDF, une photo de reçu (JPG/PNG) ou un document Word (max 10 Mo). Le fichier est hébergé sur Cloudinary et lié à la dépense.', warning: 'Conservez toujours une pièce justificative pour chaque dépense. En cas d\'audit fiscal, les dépenses sans justificatif peuvent être contestées.' },
      { title: 'Valider ou mettre en attente une dépense', desc: 'Dans la liste des dépenses, cliquer sur l\'icône d\'édition ✏️ d\'une dépense. Modifier le statut : EN_ATTENTE (à valider), VALIDÉE (approuvée) ou REJETÉE. Un Super-Admin peut valider toute dépense.', warning: null },
      { title: 'Gérer les abonnements Premium', desc: 'Aller dans l\'onglet "⭐ Premium" pour voir les utilisateurs Premium actifs. Cliquer sur "+ Activer Premium" pour attribuer manuellement le statut à un utilisateur (indiquer la raison). Cliquer sur "Révoquer" pour retirer le statut.', warning: 'Toute activation ou révocation manuelle doit être documentée. Indiquer systématiquement la justification.' },
      { title: 'Exporter les données financières', desc: 'Depuis chaque onglet, cliquer sur le bouton "Exporter PDF" pour générer un rapport complet au format A4. Le rapport inclut les KPIs, les graphiques et le tableau de données complet.', warning: null },
    ],
    workflows: [
      {
        title: 'Enregistrement mensuel des dépenses opérationnelles',
        steps: [
          'En fin de mois, collecter toutes les factures et reçus du mois',
          'Aller dans l\'onglet Dépenses > "+ Nouvelle dépense"',
          'Créer une dépense par facture en choisissant la bonne catégorie (Salaire, Infrastructure…)',
          'Uploader la pièce justificative (PDF ou photo) pour chaque dépense',
          'Vérifier les KPIs en haut de l\'onglet pour confirmer le total du mois',
          'Exporter le rapport PDF des dépenses pour archivage comptable',
          'Comparer avec les revenus dans l\'onglet Comptabilité pour calculer le résultat net',
        ],
      },
      {
        title: 'Clôture financière trimestrielle',
        steps: [
          'Aller dans l\'onglet Comptabilité, filtre "Ce trimestre"',
          'Vérifier que toutes les dépenses sont validées (filtre statut EN_ATTENTE)',
          'Exporter le PDF de la Comptabilité trimestrielle',
          'Exporter le PDF des Dépenses trimestrielles',
          'Vérifier les contributions et paiements du trimestre',
          'Transmettre les exports au comptable ou auditeur externe',
        ],
      },
    ],
    tip: 'Utilisez les 9 catégories de dépenses de manière cohérente chaque mois pour que les graphiques de répartition soient significatifs. Une dépense mal catégorisée fausse l\'analyse financière.',
    warnings: [
      'Accès restreint aux rôles Admin et Super-Admin uniquement.',
      'Toute activation ou révocation manuelle de statut Premium doit être documentée avec sa justification.',
      'Conservez toujours la pièce justificative (facture, reçu) pour chaque dépense enregistrée.',
      'L\'upload de pièces jointes utilise Cloudinary — les fichiers sont stockés de façon permanente. Ne pas uploader de documents confidentiels non destinés à être archivés en ligne.',
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
      'Rôles disponibles : Contributeur, Éditeur, Expert ILA, Partenaire, Admin, Super-Admin',
      'Sélection du rôle par compte — accès aux modules correspondants automatiquement filtrés',
      'Désactivation d\'un compte sans suppression',
    ],
    steps: [
      { title: 'Créer un nouveau compte CMS', desc: 'Cliquer sur "+ Nouveau compte", saisir le nom complet, l\'adresse email et définir le rôle approprié.', warning: null },
      { title: 'Choisir le bon rôle', desc: 'Contributeur : soumet du contenu depuis l\'app mobile. Éditeur : crée et édite les contenus CMS. Expert ILA : vote dans le Comité de Validation ILA-UFHB (certification audio). Partenaire : accès au Tableau Partenaires. Admin : accès complet sauf Super-Admin.', warning: null },
      { title: 'Attribuer le rôle Expert ILA (UFHB)', desc: 'Pour un membre du comité scientifique ILA-UFHB, attribuer le rôle "Expert". Cela lui donne accès au module Comité ILA pour voter sur les certifications audio. Le quorum est 3 votes sur 5 experts.', warning: 'Le rôle Expert ILA ne peut être attribué que par un Super-Admin. Ce rôle donne accès à des opérations irréversibles (certification audio). Vérifiez l\'identité du destinataire.' },
      { title: 'Envoyer les accès', desc: 'Le nouveau membre reçoit ses identifiants de connexion. Planifier une session de formation en lui partageant le Guide d\'utilisation CMS.', warning: null },
    ],
    workflows: [
      {
        title: 'Onboarding d\'un expert ILA-UFHB (comité de certification)',
        steps: [
          'Vérifier l\'identité et l\'appartenance à l\'UFHB du candidat',
          'Créer le compte avec le rôle "Expert ILA" (Super-Admin requis)',
          'L\'expert accède au module Comité ILA dans la section Administration',
          'L\'expert peut voter APPROUVÉ / RÉVISION / REJETÉ sur les soumissions audio',
          'Rappeler le quorum : 3 votes sur 5 experts pour qu\'une décision soit définitive',
          'Planifier une session de formation sur le module Comité ILA',
        ],
      },
      {
        title: 'Onboarding d\'un nouvel éditeur de contenu',
        steps: [
          'Créer le compte avec le rôle "Éditeur"',
          'L\'éditeur accède aux modules Dictionnaire, Leçons, Culture, Textes, IA Linguistique',
          'Envoyer les identifiants de connexion',
          'Partager le Guide d\'utilisation CMS pour la formation',
          'Planifier un premier accompagnement sur le module IA Linguistique (hub principal)',
        ],
      },
    ],
    tip: 'Appliquez le principe du moindre privilège : donnez à chaque membre uniquement le rôle minimal nécessaire. Réservez le rôle Expert ILA aux membres du comité scientifique ILA-UFHB dûment identifiés.',
    warnings: [
      'Ne pas confondre avec les utilisateurs de l\'application mobile. Ce module gère uniquement les comptes d\'accès au CMS.',
      'Le rôle Expert ILA donne accès aux décisions de certification audio — irréversibles une fois le quorum atteint. Ne l\'attribuer qu\'à des membres officiels du comité ILA-UFHB.',
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
    subtitle: 'Formation complète au CMS — 30+ modules documentés',
    color: 'gray',
    roles: ['EDITOR', 'ADMIN', 'SUPER_ADMIN'],
    description:
      'Guide de formation complet au CMS Langues Ivoire. Cette page centralise les tutoriels détaillés de tous les modules (30+) organisés en 11 sections thématiques. Chaque module bénéficie également d\'une aide contextuelle accessible via le bouton "❓ Aide" présent en bas à droite de chaque page du CMS.',
    objectifs: [
      'Former les nouveaux membres de l\'équipe éditoriale rapidement',
      'Servir de référence documentaire consultable à tout moment',
      'Standardiser les pratiques de création de contenu à travers toute l\'équipe',
      'Couvrir tous les modules : contenu, médias, communauté, IA, finance, administration',
    ],
    features: [
      '11 sections thématiques : Général, Contenu Principal, SOS & Santé, Médias & Audio, Communauté, IA, Paramètres App, Éducation, Partenaires, Finance, Administration',
      'Tutoriels détaillés pour 30+ modules du CMS',
      'Filtrage par section et recherche par mot-clé',
      'Parcours de formation personnalisé par rôle (Éditeur, Expert ILA, Admin, Super-Admin)',
      'Aide contextuelle ❓ disponible dans chaque module (bouton flottant en bas à droite)',
      'Workflows complets pour les cas d\'usage les plus courants',
      'Conseils "pro" et avertissements pour éviter les erreurs fréquentes',
      'Notation des conventions audio (nommage des fichiers)',
      'Modules récents : Finance → Dépenses, Comité ILA → Rapport, Monnaie FCFA, Mathématique',
    ],
    steps: [
      { title: 'Choisir votre parcours par rôle', desc: 'En haut du guide, sélectionner votre rôle (Éditeur, Expert ILA, Admin…) pour afficher un parcours de formation personnalisé avec les modules prioritaires pour votre poste.', warning: null },
      { title: 'Explorer les sections thématiques', desc: 'Parcourir les 11 sections dans le menu de gauche ou le fil de navigation pour trouver le module concerné. Chaque section regroupe les modules par famille fonctionnelle.', warning: null },
      { title: 'Lire le tutoriel d\'un module', desc: 'Cliquer sur un module pour déplier son tutoriel complet : description, objectifs, fonctionnalités, étapes détaillées, workflows et conseils. Utiliser les accordéons pour naviguer rapidement entre les sections.', warning: null },
      { title: 'Utiliser l\'aide contextuelle ❓', desc: 'Dans n\'importe quelle page du CMS, cliquer sur le bouton "❓ Aide" en bas à droite de l\'écran pour afficher directement le tutoriel du module en cours, sans quitter votre travail.', warning: null },
      { title: 'Rechercher par mot-clé', desc: 'Utiliser la barre de recherche en haut du Guide pour trouver rapidement un module ou une fonctionnalité par son nom. Ex : taper "dépenses", "rapport", "export PDF" ou "vote".', warning: null },
    ],
    workflows: [
      {
        title: 'Onboarding d\'un nouveau membre de l\'équipe',
        steps: [
          'Créer son compte dans Administration → Utilisateurs avec le bon rôle',
          'Lui envoyer le lien vers le Guide d\'utilisation (/guide)',
          'Lui recommander de commencer par son parcours de rôle (en haut du guide)',
          'Planifier une session de formation en direct sur les 3 modules prioritaires de son poste',
          'L\'inviter à utiliser l\'aide contextuelle ❓ dans chaque module au quotidien',
        ],
      },
    ],
    tip: 'L\'aide contextuelle ❓ (bouton flottant en bas à droite) est plus efficace que le guide général pour un usage quotidien — elle s\'ouvre directement sur le tutoriel du module en cours. Le guide complet est utile pour une formation initiale ou une vue d\'ensemble.',
    warnings: [
      'Ce guide est mis à jour à chaque ajout de fonctionnalité. Si un module semble manquant ou incomplet, signalez-le à l\'administrateur.',
    ],
    audioNaming: null,
  },
];
