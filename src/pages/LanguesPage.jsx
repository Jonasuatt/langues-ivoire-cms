import { useState, useEffect, useCallback, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import {
  GlobeAltIcon, CheckCircleIcon, XCircleIcon,
  MapPinIcon, PlusIcon, PencilIcon, BookOpenIcon,
  MagnifyingGlassIcon, ArrowPathIcon, ArrowsPointingOutIcon,
  PhotoIcon, FaceSmileIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { languagesAPI } from '../services/api';
import toast from 'react-hot-toast';

// ── Coordonnées géographiques de la Côte d'Ivoire (calées sur le PNG 1500×1573) ──
const GEO = { west: -8.7, east: -2.3, north: 10.9, south: 4.2, W: 1500, H: 1573 };

function geoToSVG(lat, lng) {
  return {
    x: ((lng - GEO.west)  / (GEO.east  - GEO.west))  * GEO.W,
    y: ((GEO.north - lat) / (GEO.north - GEO.south)) * GEO.H,
  };
}
function svgToGeo(x, y) {
  return {
    lat: parseFloat((GEO.north - (y / GEO.H) * (GEO.north - GEO.south)).toFixed(4)),
    lng: parseFloat((GEO.west  + (x / GEO.W) * (GEO.east  - GEO.west )).toFixed(4)),
  };
}

/** Détecte si la valeur emoji est en réalité une image (data URL ou URL http) */
function emojiIsImage(val) {
  return typeof val === 'string' && val.length > 10 && (val.startsWith('data:image') || val.startsWith('http'));
}

/** Redimensionne un fichier image en un carré 80×80 et retourne un data URL JPEG */
function resizeImageToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 80; canvas.height = 80;
        const ctx = canvas.getContext('2d');
        const side = Math.min(img.width, img.height);
        const sx   = (img.width  - side) / 2;
        const sy   = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 80, 80);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const CITIES = [
  { nom: 'Abidjan',      lat: 5.35, lng: -4.00 },
  { nom: 'Yamoussoukro', lat: 6.82, lng: -5.28 },
  { nom: 'Bouaké',       lat: 7.69, lng: -5.03 },
  { nom: 'Korhogo',      lat: 9.46, lng: -5.63 },
  { nom: 'San Pedro',    lat: 4.75, lng: -6.64 },
  { nom: 'Daloa',        lat: 6.89, lng: -6.45 },
  { nom: 'Man',          lat: 7.41, lng: -7.55 },
  { nom: 'Abengourou',   lat: 6.72, lng: -3.49 },
];

// ── Palette d'emojis par catégorie ───────────────────────────────────────────
const EMOJIS_PALETTE = [
  { cat: '🌿 Nature',    list: ['🌿','🌱','🌾','🌴','🌳','🌲','🌺','🌸','🌻','🌼','🍀','🍃','🌵','🪴','🌊','🌈','☀️','🌙','⭐','🌤️','🌧️','🏵️','🌹','🌷','🍂','🍁'] },
  { cat: '🦅 Animaux',   list: ['🦅','🦁','🐘','🦒','🐊','🦓','🐆','🦜','🦋','🐠','🐚','🦧','🦛','🦏','🐍','🐢','🦎','🦤','🦚','🦩','🐦','🐓','🦃','🕊️','🦈','🐬','🐋','🦀','🦞','🦐'] },
  { cat: '🪘 Culture',   list: ['🪘','🥁','🎋','🏺','🎭','👑','🛡️','⚔️','🏹','🪃','🎪','🎨','🖼️','🏛️','⛩️','📿','🧿','🪬','🎶','🎵','🎷','🎺','🪗','🥋'] },
  { cat: '🍍 Nourriture',list: ['🍍','🥭','🍌','🌽','🥜','🫘','🍵','🥥','🍠','🌶️','🧄','🧅','🥕','🌰','🍫','🍯','🫖','☕'] },
  { cat: '🏔️ Géographie', list: ['🏔️','⛰️','🏞️','🌄','🏜️','🌅','🏖️','⛵','⚓','🗺️','🧭','🏕️','🗻','🌋','🏝️','🏗️','🌉','🗼','🏯'] },
  { cat: '🔵 Symboles',  list: ['🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🔶','🔷','🔸','🔹','⭕','🔮','💠','🌀','✨','💎','🏆','🎯','🎪','♾️'] },
  { cat: '🌍 Drapeaux',  list: ['🇨🇮','🌍','🌏','🌎','🏳️','🏴','🚩','🏁','🎌'] },
];

// ── Catalogue des 60+ langues ivoiriennes ─────────────────────────────────
const FAMILLES = [
  { key: 'akan',       nom: 'Akan',              couleur: '#D4A017', bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-800',  emoji: '🟡' },
  { key: 'krou',       nom: 'Krou',              couleur: '#2E7D32', bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-800',   emoji: '🟢' },
  { key: 'gur',        nom: 'Gur / Voltaïque',   couleur: '#E65100', bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-800',  emoji: '🟠' },
  { key: 'mande-n',    nom: 'Mandé Nord',        couleur: '#1565C0', bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',    emoji: '🔵' },
  { key: 'mande-s',    nom: 'Mandé Sud',         couleur: '#6A1B9A', bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-800',  emoji: '🟣' },
  { key: 'vehiculaire',nom: 'Véhiculaire / Créole', couleur: '#C62828', bg: 'bg-red-50', border: 'border-red-200',    text: 'text-red-800',     emoji: '🔴' },
];

const CATALOGUE_CI = [
  // ─── Akan ───
  { nom: 'Baoulé',    code: 'bci', region: 'Centre (Bouaké, Yamoussoukro)', famille: 'akan',    emoji: '🌿', couleur: '#D4A017', lat: 7.50, lng: -5.20, locuteurs: '~2,5 M' },
  { nom: 'Agni',      code: 'any', region: 'Est (Abengourou)',              famille: 'akan',    emoji: '🌴', couleur: '#C6940E', lat: 6.72, lng: -3.49, locuteurs: '~800 k' },
  { nom: 'Abron',     code: 'abr', region: 'Est (Bondoukou)',               famille: 'akan',    emoji: '🏺', couleur: '#B5820D', lat: 8.04, lng: -2.79, locuteurs: '~250 k' },
  { nom: 'Adjoukrou', code: 'adj', region: 'Sud (Jacqueville)',             famille: 'akan',    emoji: '🌊', couleur: '#A4700C', lat: 5.37, lng: -4.87, locuteurs: '~50 k'  },
  { nom: 'Abidji',    code: 'abi', region: 'Sud (Sikensi)',                 famille: 'akan',    emoji: '🌸', couleur: '#936F12', lat: 5.67, lng: -4.57, locuteurs: '~40 k'  },
  { nom: 'Avikam',    code: 'avi', region: 'Sud (Grand Lahou)',             famille: 'akan',    emoji: '🐚', couleur: '#826011', lat: 5.18, lng: -5.01, locuteurs: '~20 k'  },
  { nom: 'Alladian',  code: 'ald', region: 'Sud (Jacqueville)',             famille: 'akan',    emoji: '🏖️', couleur: '#715010', lat: 5.30, lng: -4.82, locuteurs: '~10 k'  },
  { nom: 'Attié',     code: 'ati', region: 'Sud (Anyama, Agboville)',       famille: 'akan',    emoji: '🌱', couleur: '#D4A017', lat: 5.56, lng: -4.21, locuteurs: '~500 k' },
  { nom: 'Abouré',    code: 'abq', region: 'Sud (Bonoua)',                  famille: 'akan',    emoji: '🌺', couleur: '#D4A017', lat: 5.27, lng: -3.60, locuteurs: '~60 k'  },
  { nom: "M'batto",   code: 'mbt', region: 'Sud (Tiassalé)',                famille: 'akan',    emoji: '🌻', couleur: '#D4A017', lat: 5.89, lng: -4.85, locuteurs: '~30 k'  },
  { nom: 'Vata',      code: 'vat', region: 'Centre (Daoukro)',              famille: 'akan',    emoji: '🪴', couleur: '#D4A017', lat: 7.06, lng: -3.97, locuteurs: '~20 k'  },
  { nom: 'Krobou',    code: 'kro', region: 'Sud (Agboville)',               famille: 'akan',    emoji: '🌾', couleur: '#D4A017', lat: 5.50, lng: -4.20, locuteurs: '~15 k'  },
  { nom: 'Nzima',     code: 'nzi', region: 'Est (Sassandra)',               famille: 'akan',    emoji: '🌿', couleur: '#D4A017', lat: 4.95, lng: -6.08, locuteurs: '~30 k'  },
  { nom: 'Avagnan',   code: 'avg', region: 'Sud (Lahou)',                   famille: 'akan',    emoji: '🌊', couleur: '#D4A017', lat: 5.10, lng: -5.10, locuteurs: '~10 k'  },
  // ─── Krou ───
  { nom: 'Bété',      code: 'bev', region: 'Centre-Ouest (Gagnoa)',         famille: 'krou',    emoji: '🌺', couleur: '#2E7D32', lat: 6.13, lng: -5.95, locuteurs: '~450 k' },
  { nom: 'Dida',      code: 'did', region: 'Centre-Ouest (Lakota)',         famille: 'krou',    emoji: '🌿', couleur: '#257328', lat: 5.85, lng: -5.68, locuteurs: '~200 k' },
  { nom: 'Godié',     code: 'god', region: 'Ouest (Sassandra)',             famille: 'krou',    emoji: '🌴', couleur: '#1C681E', lat: 4.95, lng: -6.08, locuteurs: '~50 k'  },
  { nom: 'Neyo',      code: 'neo', region: 'Ouest (Sassandra)',             famille: 'krou',    emoji: '🐠', couleur: '#135D14', lat: 4.85, lng: -6.20, locuteurs: '~30 k'  },
  { nom: 'Guéré',     code: 'gxx', region: 'Ouest (Guiglo)',                famille: 'krou',    emoji: '🌄', couleur: '#0A520A', lat: 6.54, lng: -7.49, locuteurs: '~300 k' },
  { nom: 'Wobé',      code: 'wob', region: 'Ouest (Toulepleu)',             famille: 'krou',    emoji: '🏔️', couleur: '#2E7D32', lat: 6.57, lng: -8.41, locuteurs: '~100 k' },
  { nom: 'Kroumen',   code: 'kru', region: 'Ouest (San Pedro)',             famille: 'krou',    emoji: '⚓', couleur: '#2E7D32', lat: 4.75, lng: -6.64, locuteurs: '~60 k'  },
  { nom: 'Bakwé',     code: 'bkw', region: 'Ouest (Soubré)',                famille: 'krou',    emoji: '🌲', couleur: '#2E7D32', lat: 5.78, lng: -6.60, locuteurs: '~20 k'  },
  { nom: 'Aizi',      code: 'aiz', region: 'Sud (Jacqueville)',             famille: 'krou',    emoji: '🐚', couleur: '#2E7D32', lat: 5.20, lng: -4.90, locuteurs: '~10 k'  },
  { nom: 'Wé',        code: 'wec', region: 'Ouest (Guiglo)',                famille: 'krou',    emoji: '🌿', couleur: '#2E7D32', lat: 6.54, lng: -7.20, locuteurs: '~250 k' },
  { nom: 'Nyabwa',    code: 'nib', region: 'Ouest (Daloa)',                 famille: 'krou',    emoji: '🌾', couleur: '#2E7D32', lat: 6.89, lng: -6.45, locuteurs: '~20 k'  },
  // ─── Gur / Voltaïque ───
  { nom: 'Sénoufo',   code: 'sen', region: 'Nord (Korhogo)',                famille: 'gur',     emoji: '🦅', couleur: '#E65100', lat: 9.46, lng: -5.63, locuteurs: '~1,5 M' },
  { nom: 'Tagbana',   code: 'tgb', region: 'Centre-Nord (Katiola)',         famille: 'gur',     emoji: '🌵', couleur: '#D44C00', lat: 8.13, lng: -5.10, locuteurs: '~100 k' },
  { nom: 'Djimini',   code: 'dji', region: 'Nord (Dabakala)',               famille: 'gur',     emoji: '🏜️', couleur: '#C34700', lat: 8.38, lng: -4.44, locuteurs: '~100 k' },
  { nom: 'Fodonon',   code: 'fod', region: 'Nord (Korhogo)',                famille: 'gur',     emoji: '🌾', couleur: '#B24200', lat: 9.30, lng: -5.70, locuteurs: '~50 k'  },
  { nom: 'Koulango',  code: 'kzc', region: 'Nord-Est (Bouna)',              famille: 'gur',     emoji: '🐘', couleur: '#A13D00', lat: 9.27, lng: -3.00, locuteurs: '~80 k'  },
  { nom: 'Lobi',      code: 'lob', region: 'Nord-Est (Bouna)',              famille: 'gur',     emoji: '🦓', couleur: '#903800', lat: 9.27, lng: -3.00, locuteurs: '~60 k'  },
  { nom: 'Mahou',     code: 'mxx', region: 'Nord-Ouest (Odienné)',          famille: 'gur',     emoji: '🌄', couleur: '#E65100', lat: 9.51, lng: -7.57, locuteurs: '~30 k'  },
  { nom: 'Niarafolo', code: 'nfa', region: 'Nord-Est (Kong)',               famille: 'gur',     emoji: '🌞', couleur: '#E65100', lat: 8.50, lng: -4.80, locuteurs: '~30 k'  },
  // ─── Mandé Nord ───
  { nom: 'Dioula',    code: 'dyu', region: 'Nord / Langue véhiculaire nationale', famille: 'mande-n', emoji: '🌊', couleur: '#1565C0', lat: 8.50, lng: -5.50, locuteurs: '~12 M (L2)' },
  { nom: 'Bambara',   code: 'bam', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🎺', couleur: '#1254A8', lat: 9.50, lng: -7.50, locuteurs: '~100 k' },
  { nom: 'Malinké',   code: 'mlq', region: 'Nord-Ouest (Odienné)',          famille: 'mande-n', emoji: '🦁', couleur: '#0F4390', lat: 9.00, lng: -7.00, locuteurs: '~200 k' },
  { nom: 'Soninke',   code: 'snk', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🏛️', couleur: '#0C3278', lat: 9.50, lng: -7.50, locuteurs: '~30 k'  },
  { nom: 'Koro',      code: 'kfo', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🌙', couleur: '#1565C0', lat: 9.30, lng: -7.20, locuteurs: '~20 k'  },
  // ─── Mandé Sud ───
  { nom: 'Gouro',     code: 'goa', region: 'Centre-Ouest (Zuénoula)',       famille: 'mande-s', emoji: '🎋', couleur: '#6A1B9A', lat: 7.41, lng: -6.25, locuteurs: '~300 k' },
  { nom: 'Dan (Yacouba)', code: 'dnj', region: 'Ouest (Man)',               famille: 'mande-s', emoji: '🏔️', couleur: '#5E188A', lat: 7.41, lng: -7.55, locuteurs: '~400 k' },
  { nom: 'Mano',      code: 'mev', region: 'Ouest (Danané)',                famille: 'mande-s', emoji: '🌿', couleur: '#52157A', lat: 7.00, lng: -7.80, locuteurs: '~50 k'  },
  { nom: 'Tura',      code: 'tur', region: 'Ouest (Man)',                   famille: 'mande-s', emoji: '⛰️', couleur: '#46126A', lat: 7.40, lng: -7.70, locuteurs: '~20 k'  },
  { nom: 'Gagou',     code: 'ggu', region: 'Centre (Gagnoa)',               famille: 'mande-s', emoji: '🌱', couleur: '#6A1B9A', lat: 6.10, lng: -5.90, locuteurs: '~30 k'  },
  { nom: 'Mwan',      code: 'moa', region: 'Ouest (Bouaflé)',               famille: 'mande-s', emoji: '🌾', couleur: '#6A1B9A', lat: 7.00, lng: -7.00, locuteurs: '~20 k'  },
  { nom: 'Gban',      code: 'gbn', region: 'Ouest (Vavoua)',                famille: 'mande-s', emoji: '🌲', couleur: '#6A1B9A', lat: 7.20, lng: -7.10, locuteurs: '~15 k'  },
  { nom: 'Beng',      code: 'nhb', region: 'Centre (Bouaké)',               famille: 'mande-s', emoji: '🌻', couleur: '#6A1B9A', lat: 7.20, lng: -5.60, locuteurs: '~15 k'  },
  { nom: 'Wan',       code: 'wan', region: 'Ouest (Séguela)',               famille: 'mande-s', emoji: '🌿', couleur: '#6A1B9A', lat: 7.96, lng: -6.67, locuteurs: '~20 k'  },
  // ─── Véhiculaire / Créole ───
  { nom: 'Nouchi',    code: 'nch', region: 'Abidjan (argot urbain)',        famille: 'vehiculaire', emoji: '🏙️', couleur: '#C62828', lat: 5.35, lng: -4.00, locuteurs: '~6 M' },
  { nom: 'Français ivoirien', code: 'fri', region: 'Nationale',            famille: 'vehiculaire', emoji: '🇨🇮', couleur: '#B71C1C', lat: 7.00, lng: -5.50, locuteurs: 'Lingua franca' },
];

const EMPTY_FORM = {
  nom: '', code: '', region: '', description: '',
  couleur: '#0B7A52', emoji: '', lat: '', lng: '', isActive: true,
};

// ── Sélecteur d'emoji ─────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }) {
  const [search,    setSearch]    = useState('');
  const [activeCat, setActiveCat] = useState(EMOJIS_PALETTE[0].cat);

  const displayed = search.trim()
    ? EMOJIS_PALETTE.flatMap(c => c.list).filter(() => true) // all
    : EMOJIS_PALETTE.find(c => c.cat === activeCat)?.list ?? [];

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-xl mt-2 overflow-hidden">
      {/* Barre de recherche */}
      <div className="p-2 border-b border-gray-100 flex items-center gap-2">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          autoFocus
          placeholder="Rechercher un emoji…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Onglets catégories */}
      {!search.trim() && (
        <div className="flex gap-1 px-2 py-1.5 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {EMOJIS_PALETTE.map(cat => (
            <button
              key={cat.cat}
              onClick={() => setActiveCat(cat.cat)}
              className={`px-2 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                activeCat === cat.cat
                  ? 'bg-green-100 text-green-700 font-semibold'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              {cat.cat}
            </button>
          ))}
        </div>
      )}

      {/* Grille emoji */}
      <div className="p-2 grid grid-cols-9 gap-0.5 max-h-44 overflow-y-auto">
        {displayed.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1 hover:bg-green-50 rounded-lg transition-colors text-center leading-none"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Carte SVG avec fond PNG réel + zoom/pan + drag marqueur ──────────────────
export function CarteCI({
  langues = [], selectedId = null,
  onMarkerClick, onMapClick, onMarkerDrag,
  editingMarker = null, style = {},
}) {
  const svgRef          = useRef(null);
  const vbRef           = useRef({ x: 0, y: 0, w: GEO.W, h: GEO.H });
  const [vb, setVb]     = useState(vbRef.current);
  const isDragging      = useRef(false);
  const dragStart       = useRef(null);
  const isDraggingMark  = useRef(false);
  const [hoverEdit, setHoverEdit] = useState(false);

  // Stable ref pour onMarkerDrag (évite les stale closures)
  const onMarkerDragRef = useRef(onMarkerDrag);
  useEffect(() => { onMarkerDragRef.current = onMarkerDrag; }, [onMarkerDrag]);

  const zoom = GEO.W / vb.w;

  const updateVb = useCallback((next) => {
    setVb(v => {
      const n = typeof next === 'function' ? next(v) : next;
      vbRef.current = n;
      return n;
    });
  }, []);

  // ── Zoom molette ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect   = svgRef.current.getBoundingClientRect();
    const v      = vbRef.current;
    const mx     = ((e.clientX - rect.left) / rect.width)  * v.w + v.x;
    const my     = ((e.clientY - rect.top)  / rect.height) * v.h + v.y;
    const factor = e.deltaY < 0 ? 0.8 : 1.25;
    updateVb(v2 => {
      const nw = Math.min(Math.max(v2.w * factor, GEO.W / 10), GEO.W);
      const nh = Math.min(Math.max(v2.h * factor, GEO.H / 10), GEO.H);
      return {
        x: Math.max(0, Math.min(mx - (mx - v2.x) * (nw / v2.w), GEO.W - nw)),
        y: Math.max(0, Math.min(my - (my - v2.y) * (nh / v2.h), GEO.H - nh)),
        w: nw, h: nh,
      };
    });
  }, [updateVb]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── MouseDown : drag marqueur en édition OU pan ──
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    // Détecte clic sur le marqueur en édition → drag du marqueur
    if (editingMarker?.lat && editingMarker?.lng && onMarkerDragRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const v    = vbRef.current;
      const svgX = ((e.clientX - rect.left) / rect.width)  * v.w + v.x;
      const svgY = ((e.clientY - rect.top)  / rect.height) * v.h + v.y;
      const { x: mx, y: my } = geoToSVG(parseFloat(editingMarker.lat), parseFloat(editingMarker.lng));
      const r    = 18 * (v.w / GEO.W);
      const dist = Math.sqrt((svgX - mx) ** 2 + (svgY - my) ** 2);
      if (dist <= r * 2) {
        isDraggingMark.current = true;
        e.preventDefault();
        return;
      }
    }

    // Pan (interdit en mode clic non-zoomé)
    if (onMapClick && zoom <= 1.05) return;
    isDragging.current = true;
    dragStart.current  = { x: e.clientX, y: e.clientY, vb: { ...vbRef.current } };
  };

  // ── MouseMove : drag marqueur OU pan ──
  const handleMouseMove = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const v    = vbRef.current;

    if (isDraggingMark.current && onMarkerDragRef.current) {
      const svgX = Math.max(0, Math.min(GEO.W, ((e.clientX - rect.left) / rect.width)  * v.w + v.x));
      const svgY = Math.max(0, Math.min(GEO.H, ((e.clientY - rect.top)  / rect.height) * v.h + v.y));
      onMarkerDragRef.current(svgToGeo(svgX, svgY));
      return;
    }

    if (!isDragging.current || !dragStart.current) return;
    const dx = (dragStart.current.x - e.clientX) / rect.width  * v.w;
    const dy = (dragStart.current.y - e.clientY) / rect.height * v.h;
    updateVb(v2 => ({
      ...v2,
      x: Math.max(0, Math.min(dragStart.current.vb.x + dx, GEO.W - v2.w)),
      y: Math.max(0, Math.min(dragStart.current.vb.y + dy, GEO.H - v2.h)),
    }));
  }, [updateVb]);

  const handleMouseUp = () => {
    isDragging.current     = false;
    dragStart.current      = null;
    isDraggingMark.current = false;
  };

  // ── Boutons zoom ──
  const zoomIn    = () => updateVb(v => { const nw = Math.max(v.w * 0.65, GEO.W / 10); const nh = Math.max(v.h * 0.65, GEO.H / 10); return { x: Math.min(v.x + (v.w - nw) / 2, GEO.W - nw), y: Math.min(v.y + (v.h - nh) / 2, GEO.H - nh), w: nw, h: nh }; });
  const zoomOut   = () => updateVb(v => { const nw = Math.min(v.w * 1.55, GEO.W); const nh = Math.min(v.h * 1.55, GEO.H); return { x: Math.max(0, v.x - (nw - v.w) / 2), y: Math.max(0, v.y - (nh - v.h) / 2), w: nw, h: nh }; });
  const zoomReset = () => updateVb({ x: 0, y: 0, w: GEO.W, h: GEO.H });

  // ── Clic carte (placement marqueur) ──
  const handleClick = (e) => {
    if (!onMapClick || isDragging.current || isDraggingMark.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width)  * vb.w + vb.x;
    const svgY = ((e.clientY - rect.top)  / rect.height) * vb.h + vb.y;
    onMapClick(svgToGeo(svgX, svgY));
  };

  const cursor = hoverEdit && onMarkerDrag
    ? 'move'
    : onMapClick ? 'crosshair' : zoom > 1.05 ? 'grab' : 'default';

  // ── Rendu d'un marqueur (emoji ou image) ──
  function renderMarkerContent(x, y, r, emoji, code, id) {
    const fs = Math.round(r * 0.8);
    if (emojiIsImage(emoji)) {
      return (
        <>
          <clipPath id={`cp-${id}`}>
            <circle cx={x} cy={y} r={r * 0.88} />
          </clipPath>
          <image
            href={emoji}
            x={x - r * 0.88} y={y - r * 0.88}
            width={r * 1.76}  height={r * 1.76}
            clipPath={`url(#cp-${id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      );
    }
    return (
      <text x={x} y={y + 1} fontSize={fs} fill="#fff"
        textAnchor="middle" dominantBaseline="middle" fontWeight="bold" fontFamily="Arial">
        {emoji || code?.slice(0, 3).toUpperCase()}
      </text>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'block', ...style }}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        style={{ borderRadius: 10, cursor, display: 'block', width: '100%', height: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        {/* ── Fond carte ── */}
        <image href="/carte-ci.png" x="0" y="0" width={GEO.W} height={GEO.H} />

        {/* ── Villes repères ── */}
        {CITIES.map(c => {
          const { x, y } = geoToSVG(c.lat, c.lng);
          const fs = Math.round(14 * (vb.w / GEO.W));
          return (
            <g key={c.nom}>
              <circle cx={x} cy={y} r={fs * 0.35} fill="#37474F" opacity="0.85" />
              <text x={x + fs * 0.6} y={y + fs * 0.15} fontSize={fs} fill="#1A237E"
                fontFamily="Arial" fontWeight="600">{c.nom}</text>
            </g>
          );
        })}

        {/* ── Marqueurs des langues ── */}
        {langues.filter(l => l.lat && l.lng).map(lang => {
          const { x, y } = geoToSVG(parseFloat(lang.lat), parseFloat(lang.lng));
          const isSelected = selectedId === lang.id;
          const color = lang.couleur || '#0B7A52';
          const r  = Math.round((isSelected ? 22 : 16) * (vb.w / GEO.W));
          return (
            <g key={lang.id} style={{ cursor: onMarkerClick ? 'pointer' : 'default' }}
              onClick={e => { e.stopPropagation(); onMarkerClick?.(lang); }}>
              <circle cx={x + 1} cy={y + 2} r={r} fill="#000" opacity="0.15" />
              <circle cx={x} cy={y} r={r}
                fill={color}
                stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.6)'}
                strokeWidth={isSelected ? Math.max(2, r * 0.15) : Math.max(1, r * 0.1)} />
              {renderMarkerContent(x, y, r, lang.emoji, lang.code, lang.id)}
              {isSelected && (
                <>
                  <rect x={x - r * 2.2} y={y + r + 4} width={r * 4.4} height={Math.round(r * 0.9) + 4}
                    rx={Math.round(r * 0.35)} fill="white" opacity="0.92" />
                  <text x={x} y={y + r + Math.round(r * 0.85) + 4} fontSize={Math.round(r * 0.8)}
                    fill={color} textAnchor="middle" fontWeight="bold" fontFamily="Arial">
                    {lang.nom}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* ── Marqueur en cours d'édition (draggable) ── */}
        {editingMarker?.lat && editingMarker?.lng && (() => {
          const { x, y } = geoToSVG(parseFloat(editingMarker.lat), parseFloat(editingMarker.lng));
          const r  = Math.round(20 * (vb.w / GEO.W));
          const da = `${r * 0.4} ${r * 0.2}`;
          return (
            <g
              style={{ cursor: onMarkerDrag ? (hoverEdit ? 'grabbing' : 'move') : 'default' }}
              onMouseEnter={() => onMarkerDrag && setHoverEdit(true)}
              onMouseLeave={() => setHoverEdit(false)}
            >
              <circle cx={x + 1} cy={y + 2} r={r} fill="#000" opacity="0.18" />
              <circle cx={x} cy={y} r={r}
                fill={editingMarker.couleur || '#F47920'}
                stroke="#fff" strokeWidth={Math.max(2, r * 0.12)}
                strokeDasharray={da} opacity="0.95" />
              {renderMarkerContent(x, y, r, editingMarker.emoji, editingMarker.code, 'editing')}
              {onMarkerDrag && (
                <text x={x} y={y + r + Math.round(r * 0.7)} fontSize={Math.round(r * 0.65)}
                  fill="#555" textAnchor="middle" fontFamily="Arial">↕ déplacer</text>
              )}
            </g>
          );
        })()}
      </svg>

      {/* ── Contrôles zoom ── */}
      <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[
          { label: '+',   action: zoomIn,    disabled: false },
          { label: '↺',   action: zoomReset, disabled: zoom <= 1.05, small: true },
          { label: '−',   action: zoomOut,   disabled: zoom <= 1.01 },
        ].filter(b => b.label !== '↺' || zoom > 1.05).map(btn => (
          <button key={btn.label} onClick={btn.action} disabled={btn.disabled}
            style={{
              width: 30, height: 30, borderRadius: 6,
              border: '1px solid rgba(0,0,0,0.15)',
              background: btn.disabled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.92)',
              cursor: btn.disabled ? 'default' : 'pointer',
              fontSize: btn.small ? 10 : 18, fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}>
            {btn.label}
          </button>
        ))}
      </div>
      {zoom > 1.05 && (
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 600 }}>
          ×{zoom.toFixed(1)}
        </div>
      )}
      {onMarkerDrag && editingMarker?.lat && editingMarker?.lng && (
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          ✚ Cliquez · ✥ Faites glisser le marqueur
        </div>
      )}
    </div>
  );
}

// ── Modal Catalogue ───────────────────────────────────────────────────────────
function ModalCatalogue({ languesExistantes, onClose, onSelect }) {
  const [search, setSearch]             = useState('');
  const [familleFilter, setFamilleFilter] = useState('all');
  const codesExistants = new Set(languesExistantes.map(l => l.code?.toLowerCase()));

  const filtrees = CATALOGUE_CI.filter(l => {
    const matchSearch  = search.trim() === '' || l.nom.toLowerCase().includes(search.toLowerCase()) || l.region.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase());
    const matchFamille = familleFilter === 'all' || l.famille === familleFilter;
    return matchSearch && matchFamille;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-green-600" />
                Catalogue des langues de Côte d'Ivoire
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{CATALOGUE_CI.length} langues · {codesExistants.size} déjà dans votre base</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">✕</button>
          </div>
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input autoFocus type="text" placeholder="Rechercher par nom, code, région…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFamilleFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${familleFilter === 'all' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              Toutes ({CATALOGUE_CI.length})
            </button>
            {FAMILLES.map(f => (
              <button key={f.key} onClick={() => setFamilleFilter(familleFilter === f.key ? 'all' : f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${familleFilter === f.key ? `${f.bg} ${f.text} ${f.border}` : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                {f.emoji} {f.nom} ({CATALOGUE_CI.filter(l => l.famille === f.key).length})
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {filtrees.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucune langue trouvée pour « {search} »</p>
            </div>
          ) : (
            <div className="space-y-4">
              {FAMILLES.filter(f => familleFilter === 'all' || familleFilter === f.key).map(famille => {
                const items = filtrees.filter(l => l.famille === famille.key);
                if (items.length === 0) return null;
                return (
                  <div key={famille.key}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${famille.bg} ${famille.border} border mb-2`}>
                      <span>{famille.emoji}</span>
                      <span className={`text-xs font-bold uppercase tracking-wide ${famille.text}`}>{famille.nom}</span>
                      <span className={`ml-auto text-xs ${famille.text} opacity-60`}>{items.length} langue{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                      {items.map(lang => {
                        const existe = codesExistants.has(lang.code.toLowerCase());
                        return (
                          <div key={lang.code}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${existe ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-sm cursor-pointer group'}`}
                            onClick={() => !existe && onSelect(lang)}>
                            <span className="text-xl flex-shrink-0">{lang.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors">{lang.nom}</span>
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{lang.code}</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{lang.region}</p>
                              {lang.locuteurs && <p className="text-xs text-gray-400">👥 {lang.locuteurs}</p>}
                            </div>
                            {existe ? <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    : <PlusIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 transition-colors" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">Cliquez sur une langue pour pré-remplir le formulaire · Les langues déjà ajoutées apparaissent grisées</p>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function LanguesPage() {
  const [langues,   setLangues]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState('liste');
  const [modal,     setModal]     = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const [showCatalogue,    setShowCatalogue]    = useState(false);
  const [showFullscreenMap,setShowFullscreenMap] = useState(false);
  const [showEmojiPicker,  setShowEmojiPicker]  = useState(false);
  const [filterStatut, setFilterStatut] = useState('all');
  const [search,    setSearch]    = useState('');
  const [syncing,   setSyncing]   = useState(false);
  const [activating, setActivating] = useState(null); // id de la langue en cours d'activation

  const fileInputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    languagesAPI.getAllAdmin()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLangues(list);
      })
      .catch(() => setError('Impossible de charger les langues.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate(prefill = {}) {
    setSaveError(null);
    setShowEmojiPicker(false);
    setModal({ mode: 'create', data: { ...EMPTY_FORM, ...prefill } });
  }
  function openEdit(lang) {
    setSaveError(null);
    setShowEmojiPicker(false);
    setModal({
      mode: 'edit',
      data: {
        nom:         lang.nom         || '',
        code:        lang.code        || '',
        region:      lang.region      || '',
        description: lang.description || '',
        couleur:     lang.couleur     || '#0B7A52',
        emoji:       lang.emoji       || '',
        lat:         lang.lat  != null ? String(lang.lat)  : '',
        lng:         lang.lng  != null ? String(lang.lng)  : '',
        isActive:    lang.isActive !== false,
        _id:         lang.id,
      },
    });
  }

  function handleCatalogueSelect(catalogueLang) {
    setShowCatalogue(false);
    openCreate({
      nom:         catalogueLang.nom,
      code:        catalogueLang.code,
      region:      catalogueLang.region,
      emoji:       catalogueLang.emoji,
      couleur:     catalogueLang.couleur || '#0B7A52',
      lat:         catalogueLang.lat != null ? String(catalogueLang.lat) : '',
      lng:         catalogueLang.lng != null ? String(catalogueLang.lng) : '',
      isActive:    false,
      description: catalogueLang.locuteurs ? `Estimé : ${catalogueLang.locuteurs} locuteurs` : '',
    });
  }

  const set = (key, val) => setModal(m => ({ ...m, data: { ...m.data, [key]: val } }));

  // ── Upload image depuis ordinateur ──
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataURL(file);
      set('emoji', dataUrl);
      setShowEmojiPicker(false);
    } catch {
      toast.error('Erreur lors du chargement de l\'image');
    }
    // Reset input pour pouvoir re-sélectionner le même fichier
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Sauvegarde ──
  async function handleSave() {
    const d = modal.data;
    if (!d.nom.trim() || !d.code.trim()) {
      setSaveError('Le Nom et le Code sont obligatoires.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        nom:         d.nom.trim(),
        code:        d.code.trim().toLowerCase(),
        region:      d.region.trim()      || null,
        description: d.description.trim() || null,
        couleur:     d.couleur            || '#0B7A52',
        emoji:       d.emoji              || null,
        lat:         d.lat !== '' ? parseFloat(d.lat) : null,
        lng:         d.lng !== '' ? parseFloat(d.lng) : null,
        isActive:    d.isActive,
      };
      if (modal.mode === 'create') {
        await languagesAPI.create(payload);
        toast.success(`Langue "${payload.nom}" créée !`);
      } else {
        await languagesAPI.update(d._id, payload);
        toast.success(`Langue "${payload.nom}" mise à jour !`);
      }
      setModal(null);
      load();
    } catch (e) {
      setSaveError(e.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  // ── Catalogue lookup ──
  function findInCatalogue(lang) {
    const norm = s => s?.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim() || '';
    return CATALOGUE_CI.find(c =>
      c.code.toLowerCase() === lang.code?.toLowerCase() ||
      norm(c.nom) === norm(lang.nom)
    );
  }

  // ── Sync coordonnées ──
  async function handleSyncCoords() {
    const aSync = langues.filter(l => !l.lat || !l.lng).filter(l => {
      const cat = findInCatalogue(l);
      return cat && cat.lat && cat.lng;
    });
    if (aSync.length === 0) { toast('Toutes les langues ont déjà des coordonnées.'); return; }
    if (!confirm(`Synchroniser automatiquement ${aSync.length} langue${aSync.length > 1 ? 's' : ''} ?\n\n${aSync.map(l => `• ${l.nom}`).join('\n')}`)) return;

    setSyncing(true);
    let updated = 0, failed = 0;
    for (const lang of aSync) {
      const cat = findInCatalogue(lang);
      try {
        const payload = { lat: cat.lat, lng: cat.lng };
        if (!lang.couleur || lang.couleur === '#0B7A52') payload.couleur = cat.couleur;
        if (!lang.emoji) payload.emoji = cat.emoji;
        if (!lang.region) payload.region = cat.region;
        await languagesAPI.update(lang.id, payload);
        updated++;
      } catch { failed++; }
    }
    setSyncing(false);
    if (updated > 0) toast.success(`📍 ${updated} langue${updated > 1 ? 's' : ''} positionnée${updated > 1 ? 's' : ''} !`);
    if (failed  > 0) toast.error(`${failed} mise${failed > 1 ? 's' : ''} à jour échouée${failed > 1 ? 's' : ''}`);
    load();
  }

  // ── Activation en un clic ──
  async function handleActivate(lang) {
    if (activating) return;
    setActivating(lang.id);
    try {
      await languagesAPI.activate(lang.id);
      toast.success(`🎉 "${lang.nom}" est maintenant active dans l'application mobile !`);
      load();
    } catch {
      toast.error("Erreur lors de l'activation.");
    } finally {
      setActivating(null);
    }
  }

  // ── Filtres liste ──
  const languesFiltrees = langues.filter(l => {
    const matchSearch  = search.trim() === '' || l.nom?.toLowerCase().includes(search.toLowerCase()) || l.code?.toLowerCase().includes(search.toLowerCase()) || l.region?.toLowerCase().includes(search.toLowerCase());
    const matchStatut  = filterStatut === 'all' ? true : filterStatut === 'active' ? l.isActive !== false : l.isActive === false;
    return matchSearch && matchStatut;
  });

  const languesAvecCoords = langues.filter(l => l.lat && l.lng);
  const languesActives    = langues.filter(l => l.isActive !== false).length;
  const languesFutures    = langues.filter(l => l.isActive === false).length;
  const dejaAjoutees      = new Set(langues.map(l => l.code?.toLowerCase()));
  const restantCatalogue  = CATALOGUE_CI.filter(l => !dejaAjoutees.has(l.code.toLowerCase())).length;
  const aSynchroniser     = langues.filter(l => (!l.lat || !l.lng) && !!findInCatalogue(l)?.lat);

  // ── Aperçu icône dans le modal ──
  const ModalIconPreview = ({ size = 48 }) => {
    const d = modal?.data;
    if (!d) return null;
    const bg = d.couleur || '#0B7A52';
    return (
      <div style={{ width: size, height: size, borderRadius: size / 2, background: bg, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {emojiIsImage(d.emoji) ? (
          <img src={d.emoji} style={{ width: size * 0.75, height: size * 0.75, borderRadius: '50%', objectFit: 'cover' }} alt="icône" />
        ) : (
          <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{d.emoji || d.code?.slice(0, 1).toUpperCase() || '?'}</span>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Langues</h1>
            <p className="text-sm text-gray-500">Langues ethniques ivoiriennes</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {aSynchroniser.length > 0 && (
            <button onClick={handleSyncCoords} disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-semibold transition-colors shadow-sm disabled:opacity-60">
              <MapPinIcon className="w-4 h-4" />
              {syncing ? 'Sync…' : `📍 Sync positions (${aSynchroniser.length})`}
            </button>
          )}
          <button onClick={() => setShowCatalogue(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-50 text-sm font-semibold transition-colors shadow-sm">
            <BookOpenIcon className="w-4 h-4" />
            📚 Catalogue CI
            {restantCatalogue > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">+{restantCatalogue}</span>
            )}
          </button>
          <button onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm">
            <PlusIcon className="w-4 h-4" />
            Nouvelle langue
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { val: langues.length,            label: 'Enregistrées',      sub: 'sur ~60 en CI',        bg: 'bg-white',        color: 'text-gray-700' },
            { val: languesActives,             label: '🟢 Actives',         sub: 'dans l\'app',          bg: 'bg-green-50',     color: 'text-green-600' },
            { val: languesFutures,             label: '🔜 À venir',          sub: '',                    bg: 'bg-amber-50',     color: 'text-amber-600' },
            { val: languesAvecCoords.length,   label: '📍 Sur la carte',    sub: '',                    bg: 'bg-blue-50',      color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── Bannière sync ── */}
      {aSynchroniser.length > 0 && !loading && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">📍</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{aSynchroniser.length} langue{aSynchroniser.length > 1 ? 's' : ''} sans coordonnées</p>
            <p className="text-xs text-amber-600 mt-0.5">{aSynchroniser.map(l => l.nom).join(', ')}</p>
          </div>
          <button onClick={handleSyncCoords} disabled={syncing}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors">
            <ArrowPathIcon className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronisation…' : 'Synchroniser'}
          </button>
        </div>
      )}

      {/* ── Bannière catalogue ── */}
      {languesFutures > 0 && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">{languesFutures} langue{languesFutures > 1 ? 's' : ''} pré-configurée{languesFutures > 1 ? 's' : ''} en dormance</p>
            <p className="text-xs text-green-600 mt-0.5">Prêtes à l'activation en un clic — aucune saisie requise.</p>
          </div>
          <button onClick={() => setTab('catalogue')}
            className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
            Voir le catalogue
          </button>
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {[['liste', '📋 Liste'], ['catalogue', '✨ Catalogue CI'], ['carte', '🗺️ Carte']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {error  && <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm mb-4">{error}</div>}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          <span className="ml-3 text-gray-500 text-sm">Chargement…</span>
        </div>
      )}

      {/* ══ TAB LISTE ══════════════════════════════════════════════════════════ */}
      {!loading && !error && tab === 'liste' && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Rechercher une langue…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div className="flex gap-2">
              {[{ k: 'all', label: 'Toutes', count: langues.length }, { k: 'active', label: '🟢 Actives', count: languesActives }, { k: 'future', label: '🔜 À venir', count: languesFutures }].map(f => (
                <button key={f.k} onClick={() => setFilterStatut(f.k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${filterStatut === f.k ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {languesFiltrees.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <GlobeAltIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune langue trouvée</p>
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => setShowCatalogue(true)} className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">📚 Choisir dans le catalogue</button>
                <button onClick={() => openCreate()} className="text-sm border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">+ Créer manuellement</button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Langue', 'Code', 'Région', 'Mots', 'Position', 'Statut', ''].map(h => (
                      <th key={h} className={`text-left px-5 py-3 font-semibold text-gray-600 ${['Mots'].includes(h) ? 'hidden md:table-cell' : ''} ${['Position'].includes(h) ? 'hidden lg:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {languesFiltrees.map((lang, idx) => (
                    <tr key={lang.id ?? idx} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lang.couleur || '#ccc' }} />
                          <div className="flex items-center gap-1.5">
                            {emojiIsImage(lang.emoji)
                              ? <img src={lang.emoji} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                              : <span>{lang.emoji}</span>}
                            <span className="font-medium text-gray-900">{lang.nom}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">{lang.code ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{lang.region ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{lang._count?.mots ?? lang.nombreMots ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">
                        {lang.lat && lang.lng
                          ? <span className="flex items-center gap-1 text-green-600"><MapPinIcon className="w-3.5 h-3.5" />{parseFloat(lang.lat).toFixed(2)}°, {parseFloat(lang.lng).toFixed(2)}°</span>
                          : <span className="text-yellow-500">Non positionnée</span>}
                      </td>
                      <td className="px-5 py-3">
                        {lang.isActive !== false
                          ? <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5 text-xs font-medium"><CheckCircleIcon className="w-3.5 h-3.5" /> Active</span>
                          : <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5 text-xs font-medium"><XCircleIcon className="w-3.5 h-3.5" /> À venir</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {lang.isActive === false ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleActivate(lang)}
                              disabled={activating === lang.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors font-semibold"
                            >
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              {activating === lang.id ? 'Activation…' : 'Activer'}
                            </button>
                            <button onClick={() => openEdit(lang)}
                              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => openEdit(lang)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg transition-colors ml-auto">
                            <PencilIcon className="w-3.5 h-3.5" /> Éditer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ TAB CATALOGUE CI ══════════════════════════════════════════════════ */}
      {!loading && !error && tab === 'catalogue' && (() => {
        // Map famille DB string → clé FAMILLES
        const FAMILLE_TO_KEY = {
          'Akan': 'akan', 'Krou': 'krou', 'Gour': 'gur',
          'Mandé Nord': 'mande-n', 'Mandé Sud': 'mande-s',
          'Véhiculaire': 'vehiculaire', 'Véhiculaire / Créole': 'vehiculaire',
          'Argot urbain': 'vehiculaire',
          'Mandé du Sud': 'mande-s', 'Mande du Sud': 'mande-s',
          'Mandé': 'mande-s', 'Gur': 'gur', 'Sénoufo (Gour)': 'gur',
          'Lagounaire': 'akan',
        };
        const languesDormantes = langues.filter(l => l.isActive === false);
        return (
          <div className="space-y-5">
            {/* Bannière info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-2xl">💡</div>
              <div>
                <p className="font-bold text-green-900 text-base">Activation en un clic</p>
                <p className="text-sm text-green-700 mt-1">Toutes ces langues sont pré-configurées en arrière-plan avec leurs données (région, coordonnées, couleur, emoji). Un clic sur <strong>Activer</strong> les rend immédiatement visibles dans l'application mobile.</p>
                <div className="flex gap-4 mt-3 text-xs text-green-600">
                  <span>✅ {langues.filter(l => l.isActive !== false).length} actives</span>
                  <span>⏸ {languesDormantes.length} en dormance</span>
                  <span>🌍 {langues.length} langues au total</span>
                </div>
              </div>
            </div>

            {languesDormantes.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <CheckCircleIcon className="w-14 h-14 mx-auto mb-4 text-green-400" />
                <p className="text-lg font-semibold text-green-700">Toutes les langues sont actives !</p>
                <p className="text-sm mt-1">Le catalogue complet de la Côte d'Ivoire est en ligne dans l'application.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {FAMILLES.map(famille => {
                  const items = languesDormantes.filter(l => {
                    const key = FAMILLE_TO_KEY[l.famille] || l.famille?.toLowerCase().replace(/\s+/g, '-');
                    return key === famille.key;
                  });
                  if (items.length === 0) return null;
                  return (
                    <div key={famille.key}>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${famille.bg} ${famille.border} border mb-3`}>
                        <span className="text-base">{famille.emoji}</span>
                        <span className={`text-xs font-bold uppercase tracking-wide ${famille.text}`}>{famille.nom}</span>
                        <span className={`ml-auto text-xs ${famille.text} opacity-60`}>{items.length} langue{items.length > 1 ? 's' : ''} en dormance</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {items.map(lang => (
                          <div key={lang.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm" style={{ background: lang.couleur || '#0B7A52' }}>
                                  {emojiIsImage(lang.emoji) ? (
                                    <img src={lang.emoji} alt="" className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <span>{lang.emoji || '🌐'}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 text-sm">{lang.nom}</p>
                                  <p className="text-xs text-gray-400 truncate">{lang.region}</p>
                                </div>
                              </div>
                              {lang.locuteurs && (
                                <p className="text-xs text-gray-500 mb-1">👥 {Number(lang.locuteurs).toLocaleString('fr-FR')} locuteurs</p>
                              )}
                              {lang.description && (
                                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{lang.description}</p>
                              )}
                            </div>
                            <div className="px-4 pb-4 flex gap-2">
                              <button
                                onClick={() => handleActivate(lang)}
                                disabled={activating === lang.id}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-wait transition-colors shadow-sm"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                                {activating === lang.id ? 'Activation…' : 'Activer'}
                              </button>
                              <button
                                onClick={() => openEdit(lang)}
                                title="Personnaliser avant d'activer"
                                className="px-3 py-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ══ TAB CARTE ══════════════════════════════════════════════════════════ */}
      {!loading && !error && tab === 'carte' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🗺️ Carte de Côte d'Ivoire</h3>
                <span className="text-xs text-gray-400">{languesAvecCoords.length}/{langues.length} positionnée{languesAvecCoords.length !== 1 ? 's' : ''}</span>
              </div>
              <CarteCI
                langues={langues}
                selectedId={selectedLang?.id}
                onMarkerClick={lang => setSelectedLang(l => l?.id === lang.id ? null : lang)}
                onMapClick={() => setSelectedLang(null)}
                style={{ width: '100%', aspectRatio: '1500/1573' }}
              />
              <p className="text-xs text-gray-400 text-center mt-2">Cliquez sur un marqueur · Éditez la langue pour modifier sa position</p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedLang && (
              <div className="bg-white rounded-xl border-2 shadow-sm p-4" style={{ borderColor: selectedLang.couleur || '#0B7A52' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: selectedLang.couleur || '#0B7A52' }}>
                    {emojiIsImage(selectedLang.emoji)
                      ? <img src={selectedLang.emoji} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                      : (selectedLang.emoji || selectedLang.code?.slice(0, 1).toUpperCase())}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedLang.nom}</h4>
                    <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{selectedLang.code}</span>
                  </div>
                </div>
                {selectedLang.region && <p className="text-sm text-gray-600 mb-1">📍 {selectedLang.region}</p>}
                {selectedLang.description && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{selectedLang.description}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { openEdit(selectedLang); setSelectedLang(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                    <PencilIcon className="w-3.5 h-3.5" /> Éditer
                  </button>
                  <button onClick={() => setSelectedLang(null)}
                    className="px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors">✕</button>
                </div>
              </div>
            )}

            {langues.filter(l => !l.lat || !l.lng).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-yellow-800">⚠️ Non positionnées ({langues.filter(l => !l.lat || !l.lng).length})</p>
                  {aSynchroniser.length > 0 && (
                    <button onClick={handleSyncCoords} disabled={syncing}
                      className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg px-2 py-1 font-semibold transition-colors disabled:opacity-60">
                      <ArrowPathIcon className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? '…' : `Auto (${aSynchroniser.length})`}
                    </button>
                  )}
                </div>
                {langues.filter(l => !l.lat || !l.lng).map(lang => (
                  <div key={lang.id} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-0">
                    <span className="text-sm text-gray-700">{lang.nom}</span>
                    <button onClick={() => openEdit(lang)} className="text-xs text-green-600 hover:underline font-medium">Positionner →</button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Toutes les langues</p>
              <div className="space-y-1">
                {langues.map(lang => (
                  <button key={lang.id}
                    onClick={() => lang.lat && lang.lng ? setSelectedLang(l => l?.id === lang.id ? null : lang) : openEdit(lang)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm transition-colors ${selectedLang?.id === lang.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lang.couleur || '#ccc' }} />
                    <span className="flex-1 text-gray-800 truncate">
                      {emojiIsImage(lang.emoji) ? <img src={lang.emoji} style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', display: 'inline-block', marginRight: 4 }} alt="" /> : lang.emoji + ' '}
                      {lang.nom}
                    </span>
                    {lang.lat && lang.lng ? <MapPinIcon className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> : <span className="text-xs text-yellow-400 flex-shrink-0">—</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL CRÉER / ÉDITER ═══════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Header sticky */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.mode === 'create' ? '➕ Nouvelle langue' : `✏️ Modifier — ${modal.data.nom || '…'}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="p-6 space-y-5">

              {/* Nom + Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                  <input type="text" value={modal.data.nom} onChange={e => set('nom', e.target.value)}
                    placeholder="ex: Baoulé"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code <span className="text-red-500">*</span> <span className="text-gray-400 font-normal text-xs">(ISO 639-3)</span></label>
                  <input type="text" value={modal.data.code} onChange={e => set('code', e.target.value.toLowerCase())}
                    maxLength={5} placeholder="bci"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>

              {/* Région */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                <input type="text" value={modal.data.region} onChange={e => set('region', e.target.value)}
                  placeholder="ex: Centre, Nord, Ouest…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea value={modal.data.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Origines, nombre de locuteurs, particularités…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>

              {/* ── Couleur + Icône ── */}
              <div className="grid grid-cols-2 gap-4">

                {/* Couleur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du marqueur</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={modal.data.couleur} onChange={e => set('couleur', e.target.value)}
                      className="h-9 w-12 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                    <input type="text" value={modal.data.couleur} onChange={e => set('couleur', e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono w-24 focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>

                {/* Aperçu marqueur */}
                <div className="flex items-end gap-3 pb-0.5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
                    <ModalIconPreview size={44} />
                  </div>
                  <p className="text-xs text-gray-400 pb-1">Rendu sur la carte</p>
                </div>
              </div>

              {/* ── Icône / Emoji ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône du marqueur</label>

                {/* Ligne d'actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${showEmojiPicker ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FaceSmileIcon className="w-4 h-4" />
                    Choisir un emoji
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                    <PhotoIcon className="w-4 h-4" />
                    Charger une image
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>

                  {modal.data.emoji && (
                    <button type="button" onClick={() => set('emoji', '')}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                      <XMarkIcon className="w-3.5 h-3.5" /> Effacer
                    </button>
                  )}

                  {modal.data.emoji && !emojiIsImage(modal.data.emoji) && (
                    <span className="text-2xl ml-1" title="Emoji sélectionné">{modal.data.emoji}</span>
                  )}
                  {modal.data.emoji && emojiIsImage(modal.data.emoji) && (
                    <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">📁 Image personnalisée</span>
                  )}
                </div>

                {/* Sélecteur emoji (inline) */}
                {showEmojiPicker && (
                  <EmojiPicker
                    onSelect={e => { set('emoji', e); setShowEmojiPicker(false); }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}

                {/* Si pas d'emoji, champ texte de secours */}
                {!modal.data.emoji && !showEmojiPicker && (
                  <input type="text" value={modal.data.emoji} onChange={e => set('emoji', e.target.value)}
                    placeholder="Ou saisissez directement un emoji : 🌿"
                    className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                )}
              </div>

              {/* ── Position géographique ── */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Position géographique</label>
                  <button
                    type="button"
                    onClick={() => setShowFullscreenMap(true)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium"
                  >
                    <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
                    Ouvrir plein écran
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-3">Cliquez sur la carte · Faites glisser le marqueur pour le repositionner · Zoomez avec la molette.</p>

                {/* Mini carte */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3" style={{ height: 340 }}>
                  <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {modal.data.lat && modal.data.lng
                      ? `Lat ${parseFloat(modal.data.lat).toFixed(4)}° · Lng ${parseFloat(modal.data.lng).toFixed(4)}°`
                      : 'Cliquez sur la carte pour positionner'}
                  </div>
                  <CarteCI
                    langues={langues.filter(l => l.id !== modal.data._id)}
                    editingMarker={{ lat: modal.data.lat, lng: modal.data.lng, emoji: modal.data.emoji, code: modal.data.code, couleur: modal.data.couleur }}
                    onMapClick={({ lat, lng }) => { set('lat', String(lat)); set('lng', String(lng)); }}
                    onMarkerDrag={({ lat, lng }) => { set('lat', String(lat)); set('lng', String(lng)); }}
                    style={{ width: '100%', height: 'calc(340px - 30px)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude (°N)</label>
                    <input type="number" step="0.0001" value={modal.data.lat} onChange={e => set('lat', e.target.value)}
                      placeholder="7.6900"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude (°W)</label>
                    <input type="number" step="0.0001" value={modal.data.lng} onChange={e => set('lng', e.target.value)}
                      placeholder="-5.0300"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                  </div>
                </div>
              </div>

              {/* Statut actif */}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => set('isActive', !modal.data.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${modal.data.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${modal.data.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <label className="text-sm text-gray-700">
                  Langue <strong>{modal.data.isActive ? 'active' : 'inactive (à venir)'}</strong> dans l'application mobile
                </label>
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{saveError}</div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between items-center">
              <button onClick={() => setShowCatalogue(true)}
                className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-800 font-medium">
                <BookOpenIcon className="w-4 h-4" /> Choisir depuis le catalogue
              </button>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} disabled={saving}
                  className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm">
                  {saving ? 'Enregistrement…' : modal.mode === 'create' ? '✓ Créer la langue' : '✓ Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL CARTE PLEIN ÉCRAN ════════════════════════════════════════════ */}
      {showFullscreenMap && modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl flex flex-col" style={{ height: '92vh' }}>

            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">📍 Positionner sur la carte</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ✚ Cliquez pour placer · ✥ Faites glisser le marqueur pour déplacer · 🖱️ Molette pour zoomer
                </p>
              </div>
              <button onClick={() => setShowFullscreenMap(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 leading-none">✕</button>
            </div>

            {/* Carte */}
            <div className="flex-1 p-4 min-h-0">
              <CarteCI
                langues={langues.filter(l => l.id !== modal.data._id)}
                editingMarker={{ lat: modal.data.lat, lng: modal.data.lng, emoji: modal.data.emoji, code: modal.data.code, couleur: modal.data.couleur }}
                onMapClick={({ lat, lng }) => { set('lat', String(lat)); set('lng', String(lng)); }}
                onMarkerDrag={({ lat, lng }) => { set('lat', String(lat)); set('lng', String(lng)); }}
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
              <div className="flex gap-6 text-sm">
                <span className="text-gray-500">
                  Latitude : <strong className="font-mono text-gray-800">{modal.data.lat ? parseFloat(modal.data.lat).toFixed(4) + '°' : '—'}</strong>
                </span>
                <span className="text-gray-500">
                  Longitude : <strong className="font-mono text-gray-800">{modal.data.lng ? parseFloat(modal.data.lng).toFixed(4) + '°' : '—'}</strong>
                </span>
              </div>
              <button
                onClick={() => setShowFullscreenMap(false)}
                className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
              >
                ✓ Confirmer la position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL CATALOGUE ════════════════════════════════════════════════════ */}
      {showCatalogue && (
        <ModalCatalogue
          languesExistantes={langues}
          onClose={() => setShowCatalogue(false)}
          onSelect={handleCatalogueSelect}
        />
      )}
      <PageHelp pageId="langues" />
    </div>
  );
}
