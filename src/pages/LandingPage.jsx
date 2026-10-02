import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon, ArrowRightIcon, LockClosedIcon, AcademicCapIcon, UserGroupIcon,
  ShieldCheckIcon, EnvelopeIcon, DevicePhoneMobileIcon, GlobeAltIcon, SparklesIcon,
  BuildingLibraryIcon, WifiIcon,
} from '@heroicons/react/24/outline';

/**
 * Page publique de présentation (languesivoire.ci).
 * RÈGLE : aucune capture du CMS ni description de son fonctionnement interne ici (secret de fabrication).
 * Uniquement des écrans de l'application MOBILE et des bénéfices pour l'utilisateur.
 */
const PHONE = '+225 05 65 75 03 03';
const PHONE_HREF = 'tel:+2250565750303';
const MSG_TEST = 'Application en phase de test. Bientôt disponible pour votre téléphone.';
const CONTACT = 'contact@languesivoire.ci';
const img = (n) => `/landing/${n}.webp`;

const GROUPES = [
  {
    id: 'apprendre', titre: 'Apprendre', accroche: 'Des bases solides, à votre rythme.',
    modules: [
      { img: 'lecons', titre: 'Leçons par langue', texte: 'Des leçons progressives, du niveau débutant aux traditions. Choisissez une langue, suivez les étapes et gagnez des points d’expérience.' },
      { img: 'parcours', titre: 'Mon parcours', texte: 'Votre tableau de bord : niveau, régularité, défis de la semaine et badges. Une leçon par jour suffit pour lancer votre série.' },
      { img: 'dictionnaire', titre: 'Dictionnaire', texte: 'Cherchez un mot, lisez sa prononciation et écoutez-le. Passez des mots aux phrases en un geste.' },
      { img: 'conjugaison', titre: 'Conjugaison', texte: 'Choisissez une langue puis un verbe : être, avoir, aller, faire… Classez-les par thème pour mieux les retenir.' },
      { img: 'alphabet', titre: 'Alphabet des langues', texte: 'Découvrez les caractères propres aux langues ivoiriennes (ɛ, ɔ, les tons…), avec exemples et audio.' },
      { img: 'sens-mots', titre: 'Sens des mots', texte: 'Redécouvrez la signification culturelle des mots ivoiriens, au-delà de leur simple traduction.' },
      { img: 'maths', titre: 'Mathématiques', texte: 'Apprenez à compter et à calculer dans votre langue : comptage, addition, soustraction.' },
      { img: 'monnaie', titre: 'Monnaie FCFA', texte: 'Reconnaissez pièces et billets, et dites les prix dans la langue de votre choix.' },
    ],
  },
  {
    id: 'pratiquer', titre: 'Pratiquer', accroche: 'Parler, écouter, répéter, jusqu’à l’aisance.',
    modules: [
      { img: 'quiz', titre: 'Quiz', texte: 'Des cartes à retourner pour réviser le vocabulaire. Touchez pour révéler la réponse et progressez de carte en carte.' },
      { img: 'prononcer', titre: 'Prononciation', texte: 'Écoutez le mot, appuyez sur le micro et répétez. Idéal pour travailler l’accent.' },
      { img: 'repeto', titre: 'RÉPÉTO', texte: 'Le module qui apprend avec vous : choisissez votre tranche d’âge, écoutez, puis répétez à voix haute.' },
      { img: 'tuteurs', titre: 'Tuteurs virtuels', texte: 'Choisissez votre tuteur ou votre tutrice parmi des personnages issus de plusieurs peuples de Côte d’Ivoire.' },
      { img: 'chat', titre: 'Discuter avec un tuteur', texte: 'Posez vos questions ou choisissez un thème : salutations, famille, marché, chiffres. Les réponses de l’IA sont signalées comme non certifiées.' },
      { img: 'traducteur', titre: 'Traducteur', texte: 'Traduisez du français vers une langue ivoirienne. Un badge vous indique d’où vient la réponse.' },
      { img: 'defis', titre: 'Défis de la semaine', texte: 'Trois défis chaque semaine, avec des bonus de points et des badges à la clé.' },
      { img: 'revisions', titre: 'Révisions du jour', texte: 'Un petit rappel quotidien pour mémoriser durablement les mots déjà appris.' },
    ],
  },
  {
    id: 'culture', titre: 'Vivre la culture', accroche: 'Les langues, c’est aussi une histoire et un art de vivre.',
    modules: [
      { img: 'textes', titre: 'Textes & récits', texte: 'Contes, histoires, chansons et traditions, avec le peuple et la région d’origine de chaque récit.' },
      { img: 'musee', titre: 'Musée des Trésors', texte: 'Collectionnez des pièces du patrimoine culturel ivoirien en gagnant des points, peuple par peuple.' },
      { img: 'arbre', titre: 'Arbre à Palabres', texte: 'Un jeu pour apprendre le vocabulaire de la famille en associant chaque mot à son membre de l’arbre.' },
      { img: 'marche', titre: 'Au Marché', texte: 'Négociez le meilleur prix avec les bonnes formules de politesse : chaque mot juste fait baisser le prix.' },
      { img: 'videos', titre: 'Vidéos', texte: 'Documentaires et capsules sur les langues et la culture de Côte d’Ivoire.' },
      { img: 'nouchi', titre: 'Nouchi', texte: 'L’argot d’Abidjan : mots essentiels, phrases, quiz et badges.' },
      { img: 'carte', titre: 'Carte des langues', texte: 'La carte des langues ethniques ivoiriennes : pincez pour zoomer, touchez un marqueur pour découvrir une langue.' },
      { img: 'langues', titre: 'Toutes les langues', texte: 'Baoulé, Dioula, Bété, Sénoufo, Agni, Gouro, Guéré, Nouchi, Yacouba : choisissez votre langue d’apprentissage.' },
    ],
  },
  {
    id: 'quotidien', titre: 'Au quotidien', accroche: 'Les bons mots au bon moment.',
    modules: [
      { img: 'phrases', titre: 'Phrases utiles', texte: 'Salutations, expressions, vie courante : cherchez une phrase et écoutez-la dans la langue choisie.' },
      { img: 'sos', titre: 'Phrases SOS', texte: 'Montrez l’écran à quelqu’un qui parle la langue : phrases vitales et « Où j’ai mal ? ».' },
      { img: 'civisme', titre: 'Civisme', texte: 'Proverbes, symboles et valeurs civiques dans les langues ivoiriennes, avec la traduction et l’audio de chaque message.' },
      { img: 'secours', titre: 'Premiers secours', texte: 'Les phrases essentielles en situation d’urgence, avec audio : appeler au secours, arrêt cardiaque…' },
    ],
  },
];

const PUBLICS = [
  { Icon: UserGroupIcon, t: 'Familles et diaspora', d: 'Transmettre la langue des grands-parents aux enfants, où qu’ils vivent.' },
  { Icon: AcademicCapIcon, t: 'Élèves et enseignants', d: 'Un cursus scolaire du CP1 à la Terminale, pour apprendre en classe et à la maison.' },
  { Icon: GlobeAltIcon, t: 'Curieux et voyageurs', d: 'Saluer, se repérer, négocier et comprendre la culture avant de partir.' },
  { Icon: BuildingLibraryIcon, t: 'Institutions et partenaires', d: 'Un outil numérique au service de la préservation du patrimoine linguistique national.' },
];

function Phone({ src, alt, className = '' }) {
  return (
    <div className={`relative mx-auto w-full max-w-[250px] rounded-[2.4rem] border-[7px] border-[#101614] bg-[#101614] shadow-2xl shadow-black/30 ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="block w-full rounded-[1.8rem] bg-white" />
    </div>
  );
}

export default function LandingPage() {
  const [groupe, setGroupe] = useState(GROUPES[0].id);
  const actif = GROUPES.find((g) => g.id === groupe);
  const [avis, setAvis] = useState(false);   // message « phase de test » (boutons Android / iOS)

  useEffect(() => {
    const prev = document.title;
    document.title = 'LANGUES IVOIRE — Apprenez et préservez les langues de Côte d’Ivoire';
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.title = prev; document.documentElement.style.scrollBehavior = ''; };
  }, []);

  const nav = [['Pour qui ?', '#pour-qui'], ['Modules', '#modules'], ['Comment ça marche', '#comment'], ['Télécharger', '#telecharger'], ['À propos', '#apropos']];

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1B2420]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* ───────── En-tête ───────── */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#FBF7F0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="flex items-center gap-2.5">
            <img src="/landing/logo.webp" alt="" className="h-9 w-auto" />
            <span className="text-[15px] font-extrabold tracking-wide text-[#0B3D2E]">LANGUES IVOIRE</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#34413b] lg:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="hover:text-[#F47920]">{l}</a>)}
          </nav>
          <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full border border-[#0B3D2E]/25 px-3.5 py-1.5 text-sm font-semibold text-[#0B3D2E] hover:bg-[#0B3D2E] hover:text-white">
            <LockClosedIcon className="h-4 w-4" /> Espace équipe
          </Link>
        </div>
      </header>

      {/* ───────── Héros ───────── */}
      <section id="top" className="relative overflow-hidden bg-[#0B3D2E] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#F47920]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_.85fr] md:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#FFC48C]">
              <SparklesIcon className="h-4 w-4" /> Application mobile
            </p>
            <h1 className="text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Les langues de Côte d’Ivoire, <span className="text-[#F47920]">dans votre poche.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              Apprenez, écoutez et transmettez le Baoulé, le Dioula, le Bété, le Sénoufo, l’Agni, le Gouro, le Guéré, le Yacouba
              et le Nouchi. Leçons, dictionnaire audio, tuteurs virtuels, jeux, contes et culture : tout un patrimoine vivant,
              à portée de main, même sans connexion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#telecharger" className="inline-flex items-center gap-2 rounded-full bg-[#F47920] px-6 py-3 font-bold text-white shadow-lg shadow-black/20 hover:bg-[#e06a14]">
                <ArrowDownTrayIcon className="h-5 w-5" /> Télécharger l’application
              </a>
              <a href="#modules" className="inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3 font-semibold hover:bg-white/10">
                Découvrir les modules <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[['9', 'langues'], ['1 300+', 'mots et phrases'], ['40+', 'leçons']].map(([n, l]) => (
                <div key={l}><dt className="text-2xl font-extrabold text-[#FFC48C]">{n}</dt><dd className="text-sm text-white/70">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <Phone src={img('accueil')} alt="Écran d’accueil de l’application LANGUES IVOIRE" className="rotate-[3deg] md:max-w-[270px]" />
            <div className="absolute -left-2 bottom-10 hidden w-36 sm:block md:-left-8">
              <Phone src={img('traducteur')} alt="Le traducteur de l’application" className="-rotate-[6deg] !border-[5px] !rounded-[1.8rem]" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Pour qui ───────── */}
      <section id="pour-qui" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold text-[#0B3D2E] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Une langue se transmet. Ensemble.</h2>
        <p className="mt-3 max-w-2xl text-[#4a5750]">
          Beaucoup de langues ivoiriennes se transmettent surtout à l’oral, et chaque génération qui s’en éloigne fragilise un héritage.
          LANGUES IVOIRE donne à chacun un moyen simple de les apprendre, de les entendre et de les faire vivre.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PUBLICS.map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B3D2E]/8 text-[#0B3D2E]" style={{ background: '#E8F5EE' }}><Icon className="h-6 w-6" /></span>
              <h3 className="font-bold">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#56635c]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Modules ───────── */}
      <section id="modules" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-[#0B3D2E] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Tout ce que contient l’application</h2>
          <p className="mt-3 max-w-2xl text-[#4a5750]">Quatre grands espaces, et pour chaque module, comment l’utiliser en quelques mots.</p>

          <div role="tablist" className="mt-7 flex flex-wrap gap-2">
            {GROUPES.map((g) => (
              <button key={g.id} role="tab" aria-selected={g.id === groupe} onClick={() => setGroupe(g.id)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${g.id === groupe ? 'bg-[#0B3D2E] text-white shadow' : 'bg-[#F2ECE0] text-[#34413b] hover:bg-[#E9E0CE]'}`}>
                {g.titre} <span className="ml-1 opacity-60">{g.modules.length}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 font-semibold text-[#F47920]">{actif.accroche}</p>

          <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {actif.modules.map((m) => (
              <article key={m.img} className="flex flex-col">
                <Phone src={img(m.img)} alt={`Module ${m.titre}`} className="!max-w-[210px]" />
                <h3 className="mt-5 text-lg font-extrabold text-[#0B3D2E]">{m.titre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#56635c]">{m.texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Comment ça marche ───────── */}
      <section id="comment" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-extrabold text-[#0B3D2E] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Comment ça marche ?</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ['1', 'Installez', 'Téléchargez l’application sur votre téléphone et créez votre compte avec votre e-mail.'],
            ['2', 'Choisissez votre langue', 'Baoulé, Dioula, Bété… Fixez votre objectif quotidien (par exemple 10 minutes par jour).'],
            ['3', 'Apprenez et pratiquez', 'Suivez les leçons, écoutez, répétez, jouez, discutez avec un tuteur et suivez vos progrès.'],
          ].map(([n, t, d]) => (
            <li key={n} className="relative rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <span className="absolute -top-4 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#F47920] font-extrabold text-white shadow">{n}</span>
              <h3 className="mt-3 text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#56635c]">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-[#E8F5EE] p-5 text-sm text-[#0B3D2E]">
          <WifiIcon className="h-6 w-6 shrink-0" />
          <p><strong>Même sans connexion :</strong> téléchargez une langue depuis votre profil et poursuivez vos leçons hors ligne, en brousse comme en ville.</p>
        </div>
      </section>

      {/* ───────── Fiabilité ───────── */}
      <section className="bg-[#0B3D2E] py-14 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-[auto_1fr]">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10"><ShieldCheckIcon className="h-9 w-9 text-[#FFC48C]" /></span>
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Des contenus fiables, et honnêtes sur leur origine</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-white/85">
              Les contenus de l’application sont construits avec des locuteurs et soumis à des experts. Quand une traduction est
              proposée par l’intelligence artificielle, l’application le dit clairement : elle est signalée comme non certifiée.
              Vous savez toujours ce que vous lisez.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Télécharger ───────── */}
      <section id="telecharger" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 rounded-3xl border border-black/5 bg-white p-8 shadow-sm md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0B3D2E] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Télécharger LANGUES IVOIRE</h2>
            <p className="mt-3 max-w-xl text-[#4a5750]">Choisissez la version de votre téléphone.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setAvis(true)} className="inline-flex items-center gap-2 rounded-full bg-[#F47920] px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-[#e06a14]">
                <ArrowDownTrayIcon className="h-5 w-5" /> Télécharger pour Android
              </button>
              <button type="button" onClick={() => setAvis(true)} className="inline-flex items-center gap-2 rounded-full bg-[#0B3D2E] px-7 py-3.5 font-bold text-white shadow-lg shadow-black/20 hover:bg-[#092E23]">
                <ArrowDownTrayIcon className="h-5 w-5" /> Télécharger pour iOS
              </button>
            </div>
            <p className="mt-4 text-sm text-[#56635c]">L’application est actuellement en phase de test.</p>
          </div>
          <div className="hidden md:block"><Phone src={img('accueil')} alt="" className="!max-w-[170px]" /></div>
        </div>
      </section>

      {/* ───────── Vision 2027 ───────── */}
      <section id="vision" className="mx-auto max-w-6xl px-4 pb-16">
        <Link to="/vision" aria-label="Voir la page complète : De la Côte d’Ivoire à l’Afrique" className="group block overflow-hidden rounded-3xl bg-[#060C0A] text-white shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl">
          <div className="grid items-center gap-8 p-6 md:grid-cols-[auto_1fr] md:p-8">
            <img src="/landing/afrique.webp" alt="Carte de l’Afrique avec le logo LANGUES IVOIRE" loading="lazy"
              className="mx-auto h-56 w-auto rounded-xl shadow-[0_0_40px_rgba(244,121,32,0.28)] md:h-64" />
            <div className="md:border-l md:border-white/10 md:pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F47920]">Vision 2027</p>
              <h2 className="mt-2 text-3xl font-extrabold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>De la Côte d’Ivoire à l’Afrique</h2>
              <p className="mt-3 max-w-xl leading-relaxed text-white/80">
                Préserver les langues ethniques ivoiriennes n’est que le début. Notre ambition est de devenir la plateforme de
                référence pour toutes les langues menacées d’Afrique de l’Ouest et centrale.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2.5 text-xs font-semibold">
                <li className="rounded-full bg-[#F47920] px-3.5 py-2 text-white">✓ Phase 1 · Côte d’Ivoire — 9 langues</li>
                <li className="rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-white/80">Phase 2 · Afrique de l’Ouest — 2026</li>
                <li className="rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-white/80">Phase 3 · Panafricain — 2027+</li>
              </ul>
            </div>
          </div>
          <p className="border-t border-white/10 px-6 py-3 text-center text-xs text-white/55">
            <span className="italic">« Préserver les langues, bâtir l’avenir » — LANGUES IVOIRE</span>
            <span className="ml-2 font-bold text-[#F47920] group-hover:underline">· Voir la page complète →</span>
          </p>
        </Link>
      </section>

      {/* ───────── À propos & crédits ───────── */}
      <section id="apropos" className="border-t border-black/5 bg-[#F4EEE2] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold text-[#0B3D2E] sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>À propos</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-[#4a5750]">
            LANGUES IVOIRE est une plateforme numérique pour préserver, enseigner et valoriser les langues de Côte d’Ivoire :
            une application mobile pour les apprenants et un espace de travail réservé aux équipes éditoriales.
          </p>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F47920]">Idée et mise en œuvre</p>
            <p className="mt-1 text-xl font-extrabold text-[#0B3D2E]">Ouattara Nogolourgo Jonas</p>
            <p className="text-sm text-[#56635c]">Copropriétaire de la plateforme LANGUES IVOIRE</p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47920]">Copropriétaire</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#0B3D2E]">SFP — Sans Frontière Properties, LLC</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#56635c]">
                Groupe actif dans l’énergie alternative et renouvelable, l’expertise informatique (sécurité, programmation, robotique),
                la formation professionnelle, la communication et les télécommunications (NTIC), le BTP, l’hydraulique,
                l’import-export, entre autres domaines.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47920]">Copropriétaire du projet</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#0B3D2E]">ONG Africa Global International (ONG AGI)</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#56635c]">
                Organisation non gouvernementale ivoirienne de développement social et humanitaire, active depuis 2014.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-[#56635c]">
            <strong>Technologie d’intelligence artificielle :</strong> Anthropic (Claude). Claude et Anthropic sont des marques de leur propriétaire.
          </p>
        </div>
      </section>

      {/* ───────── Contact & pied de page ───────── */}
      <footer className="bg-[#07241B] text-white/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/landing/logo.webp" alt="" className="h-10 w-auto" />
              <span className="font-extrabold tracking-wide text-white">LANGUES IVOIRE</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/65">Préserver les langues, bâtir l’avenir. De la Côte d’Ivoire à l’Afrique.</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-bold text-white">Contact</p>
            <a href={`mailto:${CONTACT}`} className="inline-flex items-center gap-2 hover:text-[#FFC48C]"><EnvelopeIcon className="h-4 w-4" /> {CONTACT}</a>
            <a href={PHONE_HREF} className="mt-2 inline-flex items-center gap-2 hover:text-[#FFC48C]"><DevicePhoneMobileIcon className="h-4 w-4" /> {PHONE}</a>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-bold text-white">Liens</p>
            <ul className="space-y-1.5">
              <li><Link to="/propositions" className="font-semibold text-[#FFC48C] hover:underline">Une idée ? Écrivez-nous</Link></li>
              <li><Link to="/privacy" className="hover:text-[#FFC48C]">Politique de confidentialité</Link></li>
              <li><Link to="/suppression-donnees" className="hover:text-[#FFC48C]">Suppression des données</Link></li>
              <li><Link to="/login" className="inline-flex items-center gap-1.5 hover:text-[#FFC48C]"><LockClosedIcon className="h-4 w-4" /> Espace équipe (accès réservé)</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55">
          © 2026 LANGUES IVOIRE · languesivoire.ci · Idée et mise en œuvre : Ouattara Nogolourgo Jonas
        </div>
      </footer>
      {avis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={() => setAvis(false)} role="dialog" aria-modal="true" aria-label="Information">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDE0BE] text-[#F47920]"><SparklesIcon className="h-7 w-7" /></span>
            <p className="text-lg font-extrabold text-[#0B3D2E]">{MSG_TEST}</p>
            <button type="button" autoFocus onClick={() => setAvis(false)} className="mt-6 rounded-full bg-[#0B3D2E] px-8 py-2.5 font-bold text-white hover:bg-[#092E23]">Compris</button>
          </div>
        </div>
      )}
    </div>
  );
}
