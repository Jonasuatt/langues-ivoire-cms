import { useState } from 'react';
import { CheckIcon, ClipboardDocumentIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// ─── Données complètes — tous les caractères des langues ivoiriennes ────────

const ALPHABET = [
  // ── VOYELLES ──────────────────────────────────────────────────────────────
  {
    id: 'A', base: 'A / a', categorie: 'voyelle', special: false,
    description: 'Voyelle ouverte centrale, identique au français.',
    phonetique: '/a/',
    exemple: { mot: 'aba', sens: 'père (Baoulé)' },
    chars: [
      { c: 'a',  label: 'a standard' },
      { c: 'á',  label: 'a ton haut' },
      { c: 'à',  label: 'a ton bas' },
      { c: 'â',  label: 'a ton descendant' },
      { c: 'ā',  label: 'a ton médian' },
      { c: 'ǎ',  label: 'a ton montant' },
      { c: 'ã',  label: 'a nasalisé' },
    ],
  },
  {
    id: 'E', base: 'E / e', categorie: 'voyelle', special: false,
    description: 'Voyelle antérieure mi-fermée, comme en français.',
    phonetique: '/e/',
    exemple: { mot: 'ebi', sens: 'enfant (Agni)' },
    chars: [
      { c: 'e',  label: 'e standard' },
      { c: 'é',  label: 'e ton haut' },
      { c: 'è',  label: 'e ton bas' },
      { c: 'ê',  label: 'e ton descendant' },
      { c: 'ē',  label: 'e ton médian' },
      { c: 'ě',  label: 'e ton montant' },
      { c: 'ẽ',  label: 'e nasalisé' },
    ],
  },
  {
    id: 'EPS', base: 'Ɛ / ɛ', categorie: 'voyelle', special: true,
    description: 'Voyelle antérieure mi-ouverte. N\'existe pas en français — proche du "è" très ouvert dans "fête".',
    phonetique: '/ɛ/',
    exemple: { mot: 'ɛ', sens: 'lui/elle (Dioula)' },
    chars: [
      { c: 'ɛ',  label: 'ɛ standard' },
      { c: 'ɛ́',  label: 'ɛ ton haut' },
      { c: 'ɛ̀',  label: 'ɛ ton bas' },
      { c: 'ɛ̂',  label: 'ɛ ton descendant' },
      { c: 'ɛ̄',  label: 'ɛ ton médian' },
      { c: 'ɛ̌',  label: 'ɛ ton montant' },
      { c: 'ɛ̃',  label: 'ɛ nasalisé' },
    ],
  },
  {
    id: 'I', base: 'I / i', categorie: 'voyelle', special: false,
    description: 'Voyelle antérieure fermée, identique au français.',
    phonetique: '/i/',
    exemple: { mot: 'i', sens: 'il/elle (Baoulé)' },
    chars: [
      { c: 'i',  label: 'i standard' },
      { c: 'í',  label: 'i ton haut' },
      { c: 'ì',  label: 'i ton bas' },
      { c: 'î',  label: 'i ton descendant' },
      { c: 'ī',  label: 'i ton médian' },
      { c: 'ǐ',  label: 'i ton montant' },
      { c: 'ĩ',  label: 'i nasalisé' },
    ],
  },
  {
    id: 'O', base: 'O / o', categorie: 'voyelle', special: false,
    description: 'Voyelle postérieure mi-fermée, identique au français.',
    phonetique: '/o/',
    exemple: { mot: 'olo', sens: 'eau (Senoufo)' },
    chars: [
      { c: 'o',  label: 'o standard' },
      { c: 'ó',  label: 'o ton haut' },
      { c: 'ò',  label: 'o ton bas' },
      { c: 'ô',  label: 'o ton descendant' },
      { c: 'ō',  label: 'o ton médian' },
      { c: 'ǒ',  label: 'o ton montant' },
      { c: 'õ',  label: 'o nasalisé' },
    ],
  },
  {
    id: 'OPE', base: 'Ɔ / ɔ', categorie: 'voyelle', special: true,
    description: 'Voyelle postérieure mi-ouverte. N\'existe pas en français — proche du "o" ouvert dans "or".',
    phonetique: '/ɔ/',
    exemple: { mot: 'ɔ', sens: 'lui/elle (Sénoufo)' },
    chars: [
      { c: 'ɔ',  label: 'ɔ standard' },
      { c: 'ɔ́',  label: 'ɔ ton haut' },
      { c: 'ɔ̀',  label: 'ɔ ton bas' },
      { c: 'ɔ̂',  label: 'ɔ ton descendant' },
      { c: 'ɔ̄',  label: 'ɔ ton médian' },
      { c: 'ɔ̌',  label: 'ɔ ton montant' },
      { c: 'ɔ̃',  label: 'ɔ nasalisé' },
    ],
  },
  {
    id: 'U', base: 'U / u', categorie: 'voyelle', special: false,
    description: 'Voyelle postérieure fermée, identique au français.',
    phonetique: '/u/',
    exemple: { mot: 'umu', sens: 'eau (Guéré)' },
    chars: [
      { c: 'u',  label: 'u standard' },
      { c: 'ú',  label: 'u ton haut' },
      { c: 'ù',  label: 'u ton bas' },
      { c: 'û',  label: 'u ton descendant' },
      { c: 'ū',  label: 'u ton médian' },
      { c: 'ǔ',  label: 'u ton montant' },
      { c: 'ũ',  label: 'u nasalisé' },
    ],
  },
  {
    id: 'SCH', base: 'Ə / ə', categorie: 'voyelle', special: true,
    description: 'Schwa — voyelle centrale neutre. Proche du "e" muet français dans "le".',
    phonetique: '/ə/',
    exemple: { mot: 'də', sens: 'tomber (Gouro)' },
    chars: [
      { c: 'ə',  label: 'ə standard' },
      { c: 'ə́',  label: 'ə ton haut' },
      { c: 'ə̀',  label: 'ə ton bas' },
      { c: 'ə̃',  label: 'ə nasalisé' },
    ],
  },

  // ── CONSONNES STANDARD ────────────────────────────────────────────────────
  {
    id: 'B', base: 'B / b', categorie: 'consonne', special: false,
    description: 'Consonne bilabiale occlusive voisée, comme en français.',
    phonetique: '/b/',
    exemple: { mot: 'ba', sens: 'venir (Dioula)' },
    chars: [{ c: 'b', label: 'b standard' }],
  },
  {
    id: 'BIM', base: 'Ɓ / ɓ', categorie: 'consonne', special: true,
    description: 'B implosif — prononcé avec une aspiration vers l\'intérieur. Son spécifique aux langues africaines.',
    phonetique: '/ɓ/',
    exemple: { mot: 'ɓa', sens: 'père (Dioula)' },
    chars: [{ c: 'ɓ', label: 'ɓ implosif' }],
  },
  {
    id: 'D', base: 'D / d', categorie: 'consonne', special: false,
    description: 'Consonne alvéolaire occlusive voisée, comme en français.',
    phonetique: '/d/',
    exemple: { mot: 'da', sens: 'bouche (Baoulé)' },
    chars: [{ c: 'd', label: 'd standard' }],
  },
  {
    id: 'DIM', base: 'Ɗ / ɗ', categorie: 'consonne', special: true,
    description: 'D implosif — prononcé avec une aspiration vers l\'intérieur.',
    phonetique: '/ɗ/',
    exemple: { mot: 'ɗa', sens: 'faire (Dioula)' },
    chars: [{ c: 'ɗ', label: 'ɗ implosif' }],
  },
  {
    id: 'F', base: 'F / f', categorie: 'consonne', special: false,
    description: 'Consonne labiodentale fricative sourde, comme en français.',
    phonetique: '/f/',
    exemple: { mot: 'fa', sens: 'prendre (Dioula)' },
    chars: [{ c: 'f', label: 'f standard' }],
  },
  {
    id: 'G', base: 'G / g', categorie: 'consonne', special: false,
    description: 'Consonne vélaire occlusive voisée. Inclut le digraphe "gb" (labio-vélaire).',
    phonetique: '/g/ /gb/',
    exemple: { mot: 'gba', sens: 'guerre (Bété)' },
    chars: [
      { c: 'g',  label: 'g standard' },
      { c: 'gb', label: 'gb labio-vélaire' },
    ],
  },
  {
    id: 'GFR', base: 'Ɣ / ɣ', categorie: 'consonne', special: true,
    description: 'G fricatif voisé — produit loin dans la gorge, comme le "r" parisien mais voisé.',
    phonetique: '/ɣ/',
    exemple: { mot: 'ɣan', sens: 'ciel (Sénoufo)' },
    chars: [{ c: 'ɣ', label: 'ɣ fricatif' }],
  },
  {
    id: 'GIM', base: 'Ɠ / ɠ', categorie: 'consonne', special: true,
    description: 'G implosif — rare, utilisé dans certaines langues Kru.',
    phonetique: '/ɠ/',
    exemple: { mot: '—', sens: 'rare' },
    chars: [{ c: 'ɠ', label: 'ɠ implosif' }],
  },
  {
    id: 'H', base: 'H / h', categorie: 'consonne', special: false,
    description: 'Fricative glottale, souvent aspirée en langues africaines.',
    phonetique: '/h/',
    exemple: { mot: 'ha', sens: 'oui (Gouro)' },
    chars: [{ c: 'h', label: 'h standard' }],
  },
  {
    id: 'J', base: 'J / j', categorie: 'consonne', special: false,
    description: 'Consonne palatale, comme en français.',
    phonetique: '/dʒ/',
    exemple: { mot: 'ji', sens: 'eau (Dioula)' },
    chars: [{ c: 'j', label: 'j standard' }],
  },
  {
    id: 'ZH', base: 'Ʒ / ʒ', categorie: 'consonne', special: true,
    description: 'J africain — son "zh" comme dans "je" en français, mais distinctif en tant que phonème propre.',
    phonetique: '/ʒ/',
    exemple: { mot: 'ʒa', sens: 'manger (Bété)' },
    chars: [{ c: 'ʒ', label: 'ʒ africain' }],
  },
  {
    id: 'K', base: 'K / k', categorie: 'consonne', special: false,
    description: 'Consonne vélaire occlusive sourde. Inclut le digraphe "kp" (labio-vélaire).',
    phonetique: '/k/ /kp/',
    exemple: { mot: 'kpan', sens: 'feu (Guéré)' },
    chars: [
      { c: 'k',  label: 'k standard' },
      { c: 'kp', label: 'kp labio-vélaire' },
    ],
  },
  {
    id: 'L', base: 'L / l', categorie: 'consonne', special: false,
    description: 'Consonne latérale alvéolaire, comme en français.',
    phonetique: '/l/',
    exemple: { mot: 'la', sens: 'être (Baoulé)' },
    chars: [{ c: 'l', label: 'l standard' }],
  },
  {
    id: 'M', base: 'M / m', categorie: 'consonne', special: false,
    description: 'Consonne nasale bilabiale, comme en français.',
    phonetique: '/m/',
    exemple: { mot: 'ma', sens: 'donner (Agni)' },
    chars: [{ c: 'm', label: 'm standard' }],
  },
  {
    id: 'N', base: 'N / n', categorie: 'consonne', special: false,
    description: 'Consonne nasale alvéolaire, comme en français.',
    phonetique: '/n/',
    exemple: { mot: 'na', sens: 'mère (Dioula)' },
    chars: [{ c: 'n', label: 'n standard' }],
  },
  {
    id: 'ENG', base: 'Ŋ / ŋ', categorie: 'consonne', special: true,
    description: 'Ng nasal vélaire — son "ng" de l\'anglais "sing". Très fréquent dans toutes les langues ivoiriennes.',
    phonetique: '/ŋ/',
    exemple: { mot: 'ŋana', sens: 'force (Dioula)' },
    chars: [{ c: 'ŋ', label: 'ŋ nasal vélaire' }],
  },
  {
    id: 'PAL', base: 'Ɲ / ɲ', categorie: 'consonne', special: true,
    description: 'Gn nasal palatal — son "gn" français de "agneau". Très fréquent.',
    phonetique: '/ɲ/',
    exemple: { mot: 'ɲa', sens: 'visage (Baoulé)' },
    chars: [{ c: 'ɲ', label: 'ɲ nasal palatal' }],
  },
  {
    id: 'P', base: 'P / p', categorie: 'consonne', special: false,
    description: 'Consonne bilabiale occlusive sourde, comme en français.',
    phonetique: '/p/',
    exemple: { mot: 'pa', sens: 'aller (Agni)' },
    chars: [{ c: 'p', label: 'p standard' }],
  },
  {
    id: 'R', base: 'R / r', categorie: 'consonne', special: false,
    description: 'Consonne rhotique, souvent roulée (battue) dans les langues africaines.',
    phonetique: '/r/',
    exemple: { mot: 'ra', sens: 'venir (Bété)' },
    chars: [{ c: 'r', label: 'r standard' }],
  },
  {
    id: 'S', base: 'S / s', categorie: 'consonne', special: false,
    description: 'Consonne sifflante sourde, comme en français.',
    phonetique: '/s/',
    exemple: { mot: 'sa', sens: 'partir (Dioula)' },
    chars: [{ c: 's', label: 's standard' }],
  },
  {
    id: 'SH', base: 'Ʃ / ʃ', categorie: 'consonne', special: true,
    description: 'Son "ch" — chuintante sourde comme dans "chat". Distinctif de certaines langues Akan.',
    phonetique: '/ʃ/',
    exemple: { mot: 'ʃu', sens: 'chien (Baoulé)' },
    chars: [{ c: 'ʃ', label: 'ʃ chuintante' }],
  },
  {
    id: 'T', base: 'T / t', categorie: 'consonne', special: false,
    description: 'Consonne alvéolaire occlusive sourde, comme en français.',
    phonetique: '/t/',
    exemple: { mot: 'ti', sens: 'arbre (Dioula)' },
    chars: [{ c: 't', label: 't standard' }],
  },
  {
    id: 'V', base: 'V / v', categorie: 'consonne', special: false,
    description: 'Consonne labiodentale fricative voisée, comme en français.',
    phonetique: '/v/',
    exemple: { mot: 'va', sens: 'grand (Gouro)' },
    chars: [{ c: 'v', label: 'v standard' }],
  },
  {
    id: 'BFR', base: 'β / β', categorie: 'consonne', special: true,
    description: 'V bilabial fricatif voisé — entre "b" et "v", produit avec les deux lèvres.',
    phonetique: '/β/',
    exemple: { mot: 'βa', sens: 'tomber (Kru)' },
    chars: [{ c: 'β', label: 'β bilabial' }],
  },
  {
    id: 'W', base: 'W / w', categorie: 'consonne', special: false,
    description: 'Semi-voyelle labio-vélaire, comme en anglais "water".',
    phonetique: '/w/',
    exemple: { mot: 'wa', sens: 'toi (Dioula)' },
    chars: [{ c: 'w', label: 'w standard' }],
  },
  {
    id: 'Y', base: 'Y / y', categorie: 'consonne', special: false,
    description: 'Semi-voyelle palatale, comme dans "yeux".',
    phonetique: '/j/',
    exemple: { mot: 'ya', sens: 'maison (Senoufo)' },
    chars: [{ c: 'y', label: 'y standard' }],
  },
  {
    id: 'Z', base: 'Z / z', categorie: 'consonne', special: false,
    description: 'Consonne sifflante voisée, comme en français.',
    phonetique: '/z/',
    exemple: { mot: 'za', sens: 'courir (Bété)' },
    chars: [{ c: 'z', label: 'z standard' }],
  },

  // ── CARACTÈRES SPÉCIAUX SANS ÉQUIVALENT FRANÇAIS ─────────────────────────
  {
    id: 'GLO', base: 'ʔ', categorie: 'special', special: true,
    description: 'Occlusion glottale — coup de glotte. Pause brusque au niveau de la gorge.',
    phonetique: '/ʔ/',
    exemple: { mot: 'a ʔa', sens: 'rupture (Dida)' },
    chars: [{ c: 'ʔ', label: 'occlusion glottale' }],
  },
  {
    id: 'EJE', base: 'ʼ', categorie: 'special', special: true,
    description: 'Marque éjective — consonne produite avec expulsion d\'air.',
    phonetique: '/ʼ/',
    exemple: { mot: 'tʼa', sens: '(marque éjective)' },
    chars: [{ c: 'ʼ', label: 'marque éjective' }],
  },

  // ── MARQUES TONALES ───────────────────────────────────────────────────────
  {
    id: 'TONS', base: 'Tons', categorie: 'ton', special: true,
    description: 'Les langues ivoiriennes sont toutes tonales : la hauteur de la voix change le sens du mot.',
    phonetique: '',
    exemple: { mot: 'bá / bà', sens: 'deux sens différents selon le ton' },
    chars: [
      { c: '´', label: 'Ton haut — voix haute' },
      { c: '`', label: 'Ton bas — voix basse' },
      { c: '^', label: 'Ton descendant — voix descend' },
      { c: '¯', label: 'Ton médian — voix stable' },
      { c: 'ˇ', label: 'Ton montant — voix monte' },
      { c: '~', label: 'Nasalisation — voyelle nasale' },
    ],
  },
];

const CATEGORIES = [
  { key: 'all',      label: 'Tous' },
  { key: 'voyelle',  label: 'Voyelles' },
  { key: 'consonne', label: 'Consonnes' },
  { key: 'special',  label: 'Sans équivalent' },
  { key: 'ton',      label: 'Marques tonales' },
];

// ─── Composant principal ─────────────────────────────────────────────────────

export default function AlphabetPage() {
  const [filtre, setFiltre]       = useState('all');
  const [copied, setCopied]       = useState(null); // char copié
  const [search, setSearch]       = useState('');

  const copyChar = (char) => {
    navigator.clipboard?.writeText(char).catch(() => {});
    setCopied(char);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = ALPHABET
    .filter(g => filtre === 'all' || g.categorie === filtre)
    .filter(g =>
      !search ||
      g.base.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.chars.some(ch => ch.c.includes(search))
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── En-tête ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alphabet des Langues</h1>
        <p className="text-gray-500 mt-1">
          Tous les caractères utilisés dans les langues ivoiriennes, organisés par groupe.
          Cliquez sur un caractère pour le copier.
        </p>
      </div>

      {/* ── Légende ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-800">
          <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
          Commun avec le français
        </div>
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5 text-sm text-purple-800">
          <span className="w-3 h-3 rounded-sm bg-purple-200 inline-block" />
          Spécifique aux langues africaines
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm text-amber-800">
          <span className="w-3 h-3 rounded-sm bg-amber-200 inline-block" />
          Marques tonales
        </div>
      </div>

      {/* ── Filtres + Recherche ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFiltre(cat.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                ${filtre === cat.key
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Chercher un caractère…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* ── Grille des groupes ───────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.map(groupe => (
          <GroupCard
            key={groupe.id}
            groupe={groupe}
            copied={copied}
            onCopy={copyChar}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Aucun résultat pour « {search} »</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Carte de groupe ─────────────────────────────────────────────────────────

function GroupCard({ groupe, copied, onCopy }) {
  const bgClass = groupe.categorie === 'ton'
    ? 'bg-amber-50 border-amber-200'
    : groupe.special
      ? 'bg-purple-50 border-purple-200'
      : 'bg-blue-50 border-blue-200';

  const tagClass = groupe.categorie === 'ton'
    ? 'bg-amber-100 text-amber-800'
    : groupe.special
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';

  const charBg = groupe.categorie === 'ton'
    ? 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900'
    : groupe.special
      ? 'bg-purple-100 border-purple-300 hover:bg-purple-200 text-purple-900'
      : 'bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-900';

  return (
    <div className={`border rounded-xl p-5 ${bgClass}`}>
      <div className="flex flex-wrap items-start gap-4">

        {/* Titre + infos */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-gray-900">{groupe.base}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagClass}`}>
              {groupe.special ? 'Spécifique langues africaines' :
               groupe.categorie === 'ton' ? 'Marque tonale' : 'Commun avec le français'}
            </span>
          </div>
          {groupe.phonetique && (
            <span className="text-sm font-mono text-gray-500">{groupe.phonetique}</span>
          )}
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{groupe.description}</p>
          {groupe.exemple?.mot !== '—' && (
            <p className="text-xs text-gray-500 mt-1.5 italic">
              Ex : <strong className="text-gray-800 not-italic">{groupe.exemple.mot}</strong>
              {groupe.exemple.sens && ` — ${groupe.exemple.sens}`}
            </p>
          )}
        </div>

        {/* Tuiles de caractères */}
        <div className="flex flex-wrap gap-2 items-start">
          {groupe.chars.map((ch, i) => {
            const isCopied = copied === ch.c;
            return (
              <button
                key={i}
                onClick={() => onCopy(ch.c)}
                title={`Copier : ${ch.label}`}
                className={`relative group flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 font-bold text-2xl transition-all cursor-pointer select-none
                  ${charBg}
                  ${isCopied ? 'ring-2 ring-green-500 scale-105' : 'hover:scale-105'}`}
              >
                {isCopied ? (
                  <CheckIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <>
                    <span>{ch.c}</span>
                    <ClipboardDocumentIcon className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                  </>
                )}
                {/* Tooltip */}
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {isCopied ? 'Copié !' : ch.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
