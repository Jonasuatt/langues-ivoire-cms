import { useState, useEffect, useCallback } from 'react';
import {
  GlobeAltIcon, CheckCircleIcon, XCircleIcon,
  MapPinIcon, PlusIcon, PencilIcon, BookOpenIcon,
  MagnifyingGlassIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import { languagesAPI } from '../services/api';
import toast from 'react-hot-toast';

// ── Coordonnées géographiques de la Côte d'Ivoire ─────────────────────────
const GEO = { west: -8.6, east: -2.5, north: 10.75, south: 4.3, W: 400, H: 430 };

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

const CI_PATH =
  'M0,7 L39,0 L105,0 L171,7 L236,0 L269,0 ' +
  'L336,17 L369,83 L393,149 L400,215 ' +
  'L393,281 L373,335 L353,375 L353,408 ' +
  'L313,428 L269,428 L202,415 L136,402 L84,389 L52,383 ' +
  'L39,350 L7,284 L0,215 L0,149 L7,83 L0,49 Z';

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

// ── Catalogue des 60+ langues ivoiriennes ─────────────────────────────────
const FAMILLES = [
  { key: 'akan',      nom: 'Akan',         couleur: '#D4A017', bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-800',  emoji: '🟡' },
  { key: 'krou',      nom: 'Krou',         couleur: '#2E7D32', bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-800',   emoji: '🟢' },
  { key: 'gur',       nom: 'Gur / Voltaïque', couleur: '#E65100', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', emoji: '🟠' },
  { key: 'mande-n',   nom: 'Mandé Nord',   couleur: '#1565C0', bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',    emoji: '🔵' },
  { key: 'mande-s',   nom: 'Mandé Sud',    couleur: '#6A1B9A', bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-800',  emoji: '🟣' },
  { key: 'vehiculaire', nom: 'Véhiculaire / Créole', couleur: '#C62828', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', emoji: '🔴' },
];

const CATALOGUE_CI = [
  // ─── Akan ───
  { nom: 'Baoulé',     code: 'bci', region: 'Centre (Bouaké, Yamoussoukro)', famille: 'akan',    emoji: '🌿', couleur: '#D4A017', lat: 7.50, lng: -5.20, locuteurs: '~2,5 M' },
  { nom: 'Agni',       code: 'any', region: 'Est (Abengourou)',              famille: 'akan',    emoji: '🌴', couleur: '#C6940E', lat: 6.72, lng: -3.49, locuteurs: '~800 k' },
  { nom: 'Abron',      code: 'abr', region: 'Est (Bondoukou)',               famille: 'akan',    emoji: '🏺', couleur: '#B5820D', lat: 8.04, lng: -2.79, locuteurs: '~250 k' },
  { nom: 'Adjoukrou',  code: 'adj', region: 'Sud (Jacqueville)',             famille: 'akan',    emoji: '🌊', couleur: '#A4700C', lat: 5.37, lng: -4.87, locuteurs: '~50 k'  },
  { nom: 'Abidji',     code: 'abi', region: 'Sud (Sikensi)',                 famille: 'akan',    emoji: '🌸', couleur: '#936F12', lat: 5.67, lng: -4.57, locuteurs: '~40 k'  },
  { nom: 'Avikam',     code: 'avi', region: 'Sud (Grand Lahou)',             famille: 'akan',    emoji: '🐚', couleur: '#826011', lat: 5.18, lng: -5.01, locuteurs: '~20 k'  },
  { nom: 'Alladian',   code: 'ald', region: 'Sud (Jacqueville)',             famille: 'akan',    emoji: '🏖️', couleur: '#715010', lat: 5.30, lng: -4.82, locuteurs: '~10 k'  },
  { nom: 'Attié',      code: 'ati', region: 'Sud (Anyama, Agboville)',       famille: 'akan',    emoji: '🌱', couleur: '#D4A017', lat: 5.56, lng: -4.21, locuteurs: '~500 k' },
  { nom: 'Abouré',     code: 'abq', region: 'Sud (Bonoua)',                  famille: 'akan',    emoji: '🌺', couleur: '#D4A017', lat: 5.27, lng: -3.60, locuteurs: '~60 k'  },
  { nom: 'M\'batto',   code: 'mbt', region: 'Sud (Tiassalé)',                famille: 'akan',    emoji: '🌻', couleur: '#D4A017', lat: 5.89, lng: -4.85, locuteurs: '~30 k'  },
  { nom: 'Vata',       code: 'vat', region: 'Centre (Daoukro)',              famille: 'akan',    emoji: '🪴', couleur: '#D4A017', lat: 7.06, lng: -3.97, locuteurs: '~20 k'  },
  { nom: 'Krobou',     code: 'kro', region: 'Sud (Agboville)',               famille: 'akan',    emoji: '🌾', couleur: '#D4A017', lat: 5.50, lng: -4.20, locuteurs: '~15 k'  },
  { nom: 'Nzima',      code: 'nzi', region: 'Est (Sassandra)',               famille: 'akan',    emoji: '🌿', couleur: '#D4A017', lat: 4.95, lng: -6.08, locuteurs: '~30 k'  },
  { nom: 'Avagnan',    code: 'avg', region: 'Sud (Lahou)',                   famille: 'akan',    emoji: '🌊', couleur: '#D4A017', lat: 5.10, lng: -5.10, locuteurs: '~10 k'  },

  // ─── Krou ───
  { nom: 'Bété',       code: 'bev', region: 'Centre-Ouest (Gagnoa)',         famille: 'krou',    emoji: '🌺', couleur: '#2E7D32', lat: 6.13, lng: -5.95, locuteurs: '~450 k' },
  { nom: 'Dida',       code: 'did', region: 'Centre-Ouest (Lakota)',         famille: 'krou',    emoji: '🌿', couleur: '#257328', lat: 5.85, lng: -5.68, locuteurs: '~200 k' },
  { nom: 'Godié',      code: 'god', region: 'Ouest (Sassandra)',             famille: 'krou',    emoji: '🌴', couleur: '#1C681E', lat: 4.95, lng: -6.08, locuteurs: '~50 k'  },
  { nom: 'Neyo',       code: 'neo', region: 'Ouest (Sassandra)',             famille: 'krou',    emoji: '🐠', couleur: '#135D14', lat: 4.85, lng: -6.20, locuteurs: '~30 k'  },
  { nom: 'Guéré',      code: 'gxx', region: 'Ouest (Guiglo)',                famille: 'krou',    emoji: '🌄', couleur: '#0A520A', lat: 6.54, lng: -7.49, locuteurs: '~300 k' },
  { nom: 'Wobé',       code: 'wob', region: 'Ouest (Toulepleu)',             famille: 'krou',    emoji: '🏔️', couleur: '#2E7D32', lat: 6.57, lng: -8.41, locuteurs: '~100 k' },
  { nom: 'Kroumen',    code: 'kru', region: 'Ouest (San Pedro)',             famille: 'krou',    emoji: '⚓', couleur: '#2E7D32', lat: 4.75, lng: -6.64, locuteurs: '~60 k'  },
  { nom: 'Bakwé',      code: 'bkw', region: 'Ouest (Soubré)',                famille: 'krou',    emoji: '🌲', couleur: '#2E7D32', lat: 5.78, lng: -6.60, locuteurs: '~20 k'  },
  { nom: 'Aizi',       code: 'aiz', region: 'Sud (Jacqueville)',             famille: 'krou',    emoji: '🐚', couleur: '#2E7D32', lat: 5.20, lng: -4.90, locuteurs: '~10 k'  },
  { nom: 'Wé',         code: 'wec', region: 'Ouest (Guiglo)',                famille: 'krou',    emoji: '🌿', couleur: '#2E7D32', lat: 6.54, lng: -7.20, locuteurs: '~250 k' },
  { nom: 'Nyabwa',     code: 'nib', region: 'Ouest (Daloa)',                 famille: 'krou',    emoji: '🌾', couleur: '#2E7D32', lat: 6.89, lng: -6.45, locuteurs: '~20 k'  },
  { nom: 'Kodia',      code: 'kdi', region: 'Ouest (Soubré)',                famille: 'krou',    emoji: '🌳', couleur: '#2E7D32', lat: 5.70, lng: -6.80, locuteurs: '~15 k'  },
  { nom: 'Tepo',       code: 'tpp', region: 'Ouest (Bloléquin)',             famille: 'krou',    emoji: '🏞️', couleur: '#2E7D32', lat: 6.50, lng: -7.80, locuteurs: '~15 k'  },

  // ─── Gur / Voltaïque ───
  { nom: 'Sénoufo',    code: 'sen', region: 'Nord (Korhogo)',                famille: 'gur',     emoji: '🦅', couleur: '#E65100', lat: 9.46, lng: -5.63, locuteurs: '~1,5 M' },
  { nom: 'Tagbana',    code: 'tgb', region: 'Centre-Nord (Katiola)',         famille: 'gur',     emoji: '🌵', couleur: '#D44C00', lat: 8.13, lng: -5.10, locuteurs: '~100 k' },
  { nom: 'Djimini',    code: 'dji', region: 'Nord (Dabakala)',               famille: 'gur',     emoji: '🏜️', couleur: '#C34700', lat: 8.38, lng: -4.44, locuteurs: '~100 k' },
  { nom: 'Fodonon',    code: 'fod', region: 'Nord (Korhogo)',                famille: 'gur',     emoji: '🌾', couleur: '#B24200', lat: 9.30, lng: -5.70, locuteurs: '~50 k'  },
  { nom: 'Koulango',   code: 'kzc', region: 'Nord-Est (Bouna)',              famille: 'gur',     emoji: '🐘', couleur: '#A13D00', lat: 9.27, lng: -3.00, locuteurs: '~80 k'  },
  { nom: 'Lobi',       code: 'lob', region: 'Nord-Est (Bouna)',              famille: 'gur',     emoji: '🦓', couleur: '#903800', lat: 9.27, lng: -3.00, locuteurs: '~60 k'  },
  { nom: 'Mahou',      code: 'mxx', region: 'Nord-Ouest (Odienné)',          famille: 'gur',     emoji: '🌄', couleur: '#E65100', lat: 9.51, lng: -7.57, locuteurs: '~30 k'  },
  { nom: 'Niarafolo',  code: 'nfa', region: 'Nord-Est (Kong)',               famille: 'gur',     emoji: '🌞', couleur: '#E65100', lat: 8.50, lng: -4.80, locuteurs: '~30 k'  },
  { nom: 'Gbäri',      code: 'gba', region: 'Nord (Korhogo)',                famille: 'gur',     emoji: '⛰️', couleur: '#E65100', lat: 9.20, lng: -5.90, locuteurs: '~20 k'  },
  { nom: 'Daho',       code: 'dah', region: 'Nord',                         famille: 'gur',     emoji: '🌻', couleur: '#E65100', lat: 9.00, lng: -5.50, locuteurs: '~15 k'  },
  { nom: 'Niaboua',    code: 'nio', region: 'Centre-Ouest (Daloa)',          famille: 'gur',     emoji: '🌿', couleur: '#E65100', lat: 7.00, lng: -6.50, locuteurs: '~20 k'  },

  // ─── Mandé Nord ───
  { nom: 'Dioula',     code: 'dyu', region: 'Nord / Langue véhiculaire nationale', famille: 'mande-n', emoji: '🌊', couleur: '#1565C0', lat: 8.50, lng: -5.50, locuteurs: '~12 M (L2)' },
  { nom: 'Bambara',    code: 'bam', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🎺', couleur: '#1254A8', lat: 9.50, lng: -7.50, locuteurs: '~100 k' },
  { nom: 'Malinké',    code: 'mlq', region: 'Nord-Ouest (Odienné)',          famille: 'mande-n', emoji: '🦁', couleur: '#0F4390', lat: 9.00, lng: -7.00, locuteurs: '~200 k' },
  { nom: 'Soninke',    code: 'snk', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🏛️', couleur: '#0C3278', lat: 9.50, lng: -7.50, locuteurs: '~30 k'  },
  { nom: 'Koro',       code: 'kfo', region: 'Nord (Odienné)',                famille: 'mande-n', emoji: '🌙', couleur: '#1565C0', lat: 9.30, lng: -7.20, locuteurs: '~20 k'  },

  // ─── Mandé Sud ───
  { nom: 'Gouro',      code: 'goa', region: 'Centre-Ouest (Zuénoula)',       famille: 'mande-s', emoji: '🎋', couleur: '#6A1B9A', lat: 7.41, lng: -6.25, locuteurs: '~300 k' },
  { nom: 'Dan (Yacouba)', code: 'dnj', region: 'Ouest (Man)',               famille: 'mande-s', emoji: '🏔️', couleur: '#5E188A', lat: 7.41, lng: -7.55, locuteurs: '~400 k' },
  { nom: 'Mano',       code: 'mev', region: 'Ouest (Danané)',               famille: 'mande-s', emoji: '🌿', couleur: '#52157A', lat: 7.00, lng: -7.80, locuteurs: '~50 k'  },
  { nom: 'Tura',       code: 'tur', region: 'Ouest (Man)',                   famille: 'mande-s', emoji: '⛰️', couleur: '#46126A', lat: 7.40, lng: -7.70, locuteurs: '~20 k'  },
  { nom: 'Gagou (Gagu)', code: 'ggu', region: 'Centre (Gagnoa)',            famille: 'mande-s', emoji: '🌱', couleur: '#6A1B9A', lat: 6.10, lng: -5.90, locuteurs: '~30 k'  },
  { nom: 'Mwan',       code: 'moa', region: 'Ouest (Bouaflé)',              famille: 'mande-s', emoji: '🌾', couleur: '#6A1B9A', lat: 7.00, lng: -7.00, locuteurs: '~20 k'  },
  { nom: 'Gban',       code: 'gbn', region: 'Ouest (Vavoua)',               famille: 'mande-s', emoji: '🌲', couleur: '#6A1B9A', lat: 7.20, lng: -7.10, locuteurs: '~15 k'  },
  { nom: 'Beng',       code: 'nhb', region: 'Centre (Bouaké)',              famille: 'mande-s', emoji: '🌻', couleur: '#6A1B9A', lat: 7.20, lng: -5.60, locuteurs: '~15 k'  },
  { nom: 'Kouya',      code: 'kyf', region: 'Ouest (Vavoua)',               famille: 'mande-s', emoji: '🍃', couleur: '#6A1B9A', lat: 7.38, lng: -6.47, locuteurs: '~10 k'  },
  { nom: 'Wan',        code: 'wan', region: 'Ouest (Séguela)',              famille: 'mande-s', emoji: '🌿', couleur: '#6A1B9A', lat: 7.96, lng: -6.67, locuteurs: '~20 k'  },
  { nom: 'Guro',       code: 'gur', region: 'Ouest (Bouaflé)',              famille: 'mande-s', emoji: '🎐', couleur: '#6A1B9A', lat: 6.99, lng: -5.74, locuteurs: '~10 k'  },

  // ─── Véhiculaire / Créole ───
  { nom: 'Nouchi',     code: 'nch', region: 'Abidjan (argot urbain)',        famille: 'vehiculaire', emoji: '🏙️', couleur: '#C62828', lat: 5.35, lng: -4.00, locuteurs: '~6 M (Abidjan)' },
  { nom: 'Français ivoirien', code: 'fri', region: 'Nationale',             famille: 'vehiculaire', emoji: '🇨🇮', couleur: '#B71C1C', lat: 7.00, lng: -5.50, locuteurs: 'Lingua franca' },
];

const EMPTY_FORM = {
  nom: '', code: '', region: '', description: '',
  couleur: '#0B7A52', emoji: '', lat: '', lng: '', isActive: true,
};

// ── Carte SVG ─────────────────────────────────────────────────────────────────
function CarteCI({ langues = [], selectedId = null, onMarkerClick, onMapClick, editingMarker = null, style = {} }) {
  return (
    <svg
      viewBox={`0 0 ${GEO.W} ${GEO.H}`}
      style={{ background: '#D6EAF8', borderRadius: 10, cursor: onMapClick ? 'crosshair' : 'default', ...style }}
      onClick={e => {
        if (!onMapClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left) / rect.width)  * GEO.W;
        const svgY = ((e.clientY - rect.top)  / rect.height) * GEO.H;
        onMapClick(svgToGeo(svgX, svgY));
      }}
    >
      <path d={CI_PATH} fill="#C8E6C9" stroke="#43A047" strokeWidth="1.5" />
      {CITIES.map(c => {
        const { x, y } = geoToSVG(c.lat, c.lng);
        return (
          <g key={c.nom}>
            <circle cx={x} cy={y} r="2.5" fill="#90A4AE" opacity="0.7" />
            <text x={x + 4} y={y + 1} fontSize="7" fill="#546E7A" fontFamily="Arial">{c.nom}</text>
          </g>
        );
      })}
      {langues.filter(l => l.lat && l.lng).map(lang => {
        const { x, y } = geoToSVG(parseFloat(lang.lat), parseFloat(lang.lng));
        const isSelected = selectedId === lang.id;
        const color = lang.couleur || '#0B7A52';
        return (
          <g key={lang.id} style={{ cursor: onMarkerClick ? 'pointer' : 'default' }}
            onClick={e => { e.stopPropagation(); onMarkerClick?.(lang); }}>
            <circle cx={x + 1} cy={y + 2} r={isSelected ? 15 : 11} fill="#000" opacity="0.12" />
            <circle cx={x} cy={y} r={isSelected ? 14 : 10}
              fill={color} stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.4)'}
              strokeWidth={isSelected ? 2.5 : 1} />
            <text x={x} y={y + 1} fontSize={isSelected ? 9 : 7.5} fill="#fff"
              textAnchor="middle" dominantBaseline="middle" fontWeight="bold" fontFamily="Arial">
              {lang.emoji || lang.code?.slice(0, 3).toUpperCase()}
            </text>
            {isSelected && (
              <>
                <rect x={x - 28} y={y + 17} width="56" height="13" rx="3" fill="white" opacity="0.9" />
                <text x={x} y={y + 24} fontSize="8" fill={color}
                  textAnchor="middle" fontWeight="bold" fontFamily="Arial">{lang.nom}</text>
              </>
            )}
          </g>
        );
      })}
      {editingMarker?.lat && editingMarker?.lng && (() => {
        const { x, y } = geoToSVG(parseFloat(editingMarker.lat), parseFloat(editingMarker.lng));
        return (
          <g>
            <circle cx={x} cy={y} r="10" fill={editingMarker.couleur || '#F47920'}
              stroke="#fff" strokeWidth="2.5" opacity="0.95" strokeDasharray="4 2" />
            <text x={x} y={y + 1} fontSize="8" fill="#fff" textAnchor="middle"
              dominantBaseline="middle" fontWeight="bold" fontFamily="Arial">
              {editingMarker.emoji || editingMarker.code?.slice(0, 2).toUpperCase() || '?'}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ── Modal Catalogue ───────────────────────────────────────────────────────────
function ModalCatalogue({ languesExistantes, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [familleFilter, setFamilleFilter] = useState('all');

  const codesExistants = new Set(languesExistantes.map(l => l.code?.toLowerCase()));

  const filtrees = CATALOGUE_CI.filter(l => {
    const matchSearch = search.trim() === '' ||
      l.nom.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase());
    const matchFamille = familleFilter === 'all' || l.famille === familleFilter;
    return matchSearch && matchFamille;
  });

  const deja = filtrees.filter(l => codesExistants.has(l.code.toLowerCase())).length;
  const restantes = filtrees.filter(l => !codesExistants.has(l.code.toLowerCase())).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-green-600" />
                Catalogue des langues de Côte d'Ivoire
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {CATALOGUE_CI.length} langues répertoriées · {codesExistants.size} déjà dans votre base
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">✕</button>
          </div>

          {/* Recherche */}
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Rechercher par nom, code, région…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Filtres famille */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFamilleFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${
                familleFilter === 'all' ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              Toutes ({CATALOGUE_CI.length})
            </button>
            {FAMILLES.map(f => {
              const count = CATALOGUE_CI.filter(l => l.famille === f.key).length;
              return (
                <button key={f.key}
                  onClick={() => setFamilleFilter(familleFilter === f.key ? 'all' : f.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-colors ${
                    familleFilter === f.key
                      ? `${f.bg} ${f.text} ${f.border}`
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {f.emoji} {f.nom} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Info résultats */}
        {search.trim() !== '' && (
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex-shrink-0">
            {filtrees.length} résultat{filtrees.length > 1 ? 's' : ''} ·
            <span className="text-green-600 ml-1 font-medium">{restantes} à ajouter</span> ·
            <span className="text-gray-400 ml-1">{deja} déjà présentes</span>
          </div>
        )}

        {/* Liste */}
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
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              existe
                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                : 'border-gray-200 bg-white hover:border-green-400 hover:shadow-sm cursor-pointer group'
                            }`}
                            onClick={() => !existe && onSelect(lang)}
                          >
                            <span className="text-xl flex-shrink-0">{lang.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors">
                                  {lang.nom}
                                </span>
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                  {lang.code}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{lang.region}</p>
                              {lang.locuteurs && (
                                <p className="text-xs text-gray-400">👥 {lang.locuteurs}</p>
                              )}
                            </div>
                            {existe ? (
                              <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <PlusIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 transition-colors" />
                            )}
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            Cliquez sur une langue pour pré-remplir le formulaire de création · Les langues déjà ajoutées apparaissent grisées
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function LanguesPage() {
  const [langues, setLangues]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [tab, setTab]                 = useState('liste');
  const [modal, setModal]             = useState(null);   // { mode, data }
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [filterStatut, setFilterStatut]  = useState('all');
  const [search, setSearch]              = useState('');

  const load = useCallback(() => {
    setLoading(true);
    languagesAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLangues(list);
      })
      .catch(() => setError("Impossible de charger les langues."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate(prefill = {}) {
    setSaveError(null);
    setModal({ mode: 'create', data: { ...EMPTY_FORM, ...prefill } });
  }
  function openEdit(lang) {
    setSaveError(null);
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

  // Sélection depuis le catalogue → pré-remplit le formulaire de création
  function handleCatalogueSelect(catalogueLang) {
    setShowCatalogue(false);
    openCreate({
      nom:      catalogueLang.nom,
      code:     catalogueLang.code,
      region:   catalogueLang.region,
      emoji:    catalogueLang.emoji,
      couleur:  catalogueLang.couleur || '#0B7A52',
      lat:      catalogueLang.lat != null ? String(catalogueLang.lat) : '',
      lng:      catalogueLang.lng != null ? String(catalogueLang.lng) : '',
      isActive: false,  // Inactive par défaut pour les nouvelles langues du catalogue
      description: catalogueLang.locuteurs ? `Estimé : ${catalogueLang.locuteurs} locuteurs` : '',
    });
  }

  const set = (key, val) => setModal(m => ({ ...m, data: { ...m.data, [key]: val } }));

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
        emoji:       d.emoji.trim()       || null,
        lat:         d.lat !== '' ? parseFloat(d.lat)  : null,
        lng:         d.lng !== '' ? parseFloat(d.lng)  : null,
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

  // ── Filtres liste ──
  const languesFiltrees = langues.filter(l => {
    const matchSearch = search.trim() === '' ||
      l.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.code?.toLowerCase().includes(search.toLowerCase()) ||
      l.region?.toLowerCase().includes(search.toLowerCase());
    const matchStatut =
      filterStatut === 'all'    ? true :
      filterStatut === 'active' ? l.isActive !== false :
      filterStatut === 'future' ? l.isActive === false : true;
    return matchSearch && matchStatut;
  });

  const languesAvecCoords   = langues.filter(l => l.lat && l.lng);
  const languesActives      = langues.filter(l => l.isActive !== false).length;
  const languesFutures      = langues.filter(l => l.isActive === false).length;
  const dejaAjoutees        = new Set(langues.map(l => l.code?.toLowerCase()));
  const restantCatalogue    = CATALOGUE_CI.filter(l => !dejaAjoutees.has(l.code.toLowerCase())).length;

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
            <p className="text-sm text-gray-500">Langues ethniques ivoiriennes — phase expérimentale</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCatalogue(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-50 text-sm font-semibold transition-colors shadow-sm"
          >
            <BookOpenIcon className="w-4 h-4" />
            📚 Catalogue CI
            {restantCatalogue > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                +{restantCatalogue}
              </span>
            )}
          </button>
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nouvelle langue
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{langues.length}</p>
            <p className="text-xs text-gray-500 mt-1">Enregistrées</p>
            <p className="text-xs text-gray-400 mt-0.5">sur ~60 en CI</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-100 p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{languesActives}</p>
            <p className="text-xs text-gray-500 mt-1">🟢 Actives dans l'app</p>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{languesFutures}</p>
            <p className="text-xs text-gray-500 mt-1">🔜 À venir</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{languesAvecCoords.length}</p>
            <p className="text-xs text-gray-500 mt-1">📍 Sur la carte</p>
          </div>
        </div>
      )}

      {/* ── Bannière catalogue ── */}
      {restantCatalogue > 0 && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              {restantCatalogue} langue{restantCatalogue > 1 ? 's' : ''} du catalogue non encore ajoutée{restantCatalogue > 1 ? 's'  : ''}
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Côte d'Ivoire compte environ 60 langues ethniques. Ajoutez-les progressivement depuis le catalogue.
            </p>
          </div>
          <button
            onClick={() => setShowCatalogue(true)}
            className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Ouvrir le catalogue
          </button>
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {[['liste', '📋 Liste'], ['carte', '🗺️ Carte']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Erreur / Chargement ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm mb-4">{error}</div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          <span className="ml-3 text-gray-500 text-sm">Chargement…</span>
        </div>
      )}

      {/* ══ TAB LISTE ══════════════════════════════════════════════════════════ */}
      {!loading && !error && tab === 'liste' && (
        <>
          {/* Filtres */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une langue…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex gap-2">
              {[
                { k: 'all',    label: 'Toutes',      count: langues.length },
                { k: 'active', label: '🟢 Actives',   count: languesActives },
                { k: 'future', label: '🔜 À venir',   count: languesFutures },
              ].map(f => (
                <button key={f.k} onClick={() => setFilterStatut(f.k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                    filterStatut === f.k
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}>
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
                <button onClick={() => setShowCatalogue(true)}
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  📚 Choisir dans le catalogue
                </button>
                <button onClick={() => openCreate()}
                  className="text-sm border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
                  + Créer manuellement
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Langue</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Région</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Mots</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Position</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {languesFiltrees.map((lang, idx) => (
                    <tr key={lang.id ?? idx} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lang.couleur || '#ccc' }} />
                          <span className="font-medium text-gray-900">{lang.emoji} {lang.nom}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">{lang.code ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{lang.region ?? '—'}</td>
                      <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                        {lang._count?.mots ?? lang.nombreMots ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">
                        {lang.lat && lang.lng ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <MapPinIcon className="w-3.5 h-3.5" />
                            {parseFloat(lang.lat).toFixed(2)}°, {parseFloat(lang.lng).toFixed(2)}°
                          </span>
                        ) : (
                          <span className="text-yellow-500">Non positionnée</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {lang.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <CheckCircleIcon className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            <XCircleIcon className="w-3.5 h-3.5" /> À venir
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEdit(lang)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg transition-colors ml-auto">
                          <PencilIcon className="w-3.5 h-3.5" /> Éditer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ TAB CARTE ══════════════════════════════════════════════════════════ */}
      {!loading && !error && tab === 'carte' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">🗺️ Carte de Côte d'Ivoire</h3>
                <span className="text-xs text-gray-400">
                  {languesAvecCoords.length}/{langues.length} langue{langues.length !== 1 ? 's' : ''} positionnée{languesAvecCoords.length !== 1 ? 's' : ''}
                </span>
              </div>
              <CarteCI
                langues={langues}
                selectedId={selectedLang?.id}
                onMarkerClick={lang => setSelectedLang(l => l?.id === lang.id ? null : lang)}
                onMapClick={() => setSelectedLang(null)}
                style={{ width: '100%' }}
              />
              <p className="text-xs text-gray-400 text-center mt-2">
                Cliquez sur un marqueur · Éditez la langue pour modifier sa position
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {selectedLang && (
              <div className="bg-white rounded-xl border-2 shadow-sm p-4"
                style={{ borderColor: selectedLang.couleur || '#0B7A52' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: selectedLang.couleur || '#0B7A52' }}>
                    {selectedLang.emoji || selectedLang.code?.slice(0, 1).toUpperCase()}
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
                <p className="text-xs font-semibold text-yellow-800 mb-2">
                  ⚠️ Non positionnées ({langues.filter(l => !l.lat || !l.lng).length})
                </p>
                {langues.filter(l => !l.lat || !l.lng).map(lang => (
                  <div key={lang.id} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-0">
                    <span className="text-sm text-gray-700">{lang.emoji} {lang.nom}</span>
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
                    onClick={() => lang.lat && lang.lng
                      ? setSelectedLang(l => l?.id === lang.id ? null : lang)
                      : openEdit(lang)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedLang?.id === lang.id ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: lang.couleur || '#ccc' }} />
                    <span className="flex-1 text-gray-800 truncate">{lang.emoji} {lang.nom}</span>
                    {lang.lat && lang.lng
                      ? <MapPinIcon className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      : <span className="text-xs text-yellow-400 flex-shrink-0">—</span>}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code <span className="text-red-500">*</span>
                    <span className="ml-1 text-gray-400 font-normal text-xs">(ISO 639-3)</span>
                  </label>
                  <input type="text" value={modal.data.code} onChange={e => set('code', e.target.value.toLowerCase())}
                    maxLength={5} placeholder="bci"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>

              {/* Région + Emoji */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <input type="text" value={modal.data.region} onChange={e => set('region', e.target.value)}
                    placeholder="ex: Centre, Nord, Ouest…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                  <input type="text" value={modal.data.emoji} onChange={e => set('emoji', e.target.value)}
                    placeholder="🌍"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                <textarea value={modal.data.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Origines, nombre de locuteurs, particularités…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
              </div>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du marqueur</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={modal.data.couleur} onChange={e => set('couleur', e.target.value)}
                    className="h-10 w-14 rounded-lg cursor-pointer border border-gray-200 p-0.5" />
                  <input type="text" value={modal.data.couleur} onChange={e => set('couleur', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <div className="w-9 h-9 rounded-full border-2 border-white shadow flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: modal.data.couleur }}>
                    {modal.data.emoji || modal.data.code?.slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Position géographique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position géographique</label>
                <p className="text-xs text-gray-400 mb-3">Cliquez directement sur la carte pour positionner automatiquement.</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                  <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    Cliquez sur la carte pour positionner
                  </div>
                  <CarteCI
                    langues={langues.filter(l => l.id !== modal.data._id)}
                    editingMarker={{ lat: modal.data.lat, lng: modal.data.lng, emoji: modal.data.emoji, code: modal.data.code, couleur: modal.data.couleur }}
                    onMapClick={({ lat, lng }) => { set('lat', String(lat)); set('lng', String(lng)); }}
                    style={{ width: '100%', maxHeight: '220px' }}
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    modal.data.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    modal.data.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
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
                <BookOpenIcon className="w-4 h-4" />
                Choisir depuis le catalogue
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

      {/* ══ MODAL CATALOGUE ════════════════════════════════════════════════════ */}
      {showCatalogue && (
        <ModalCatalogue
          languesExistantes={langues}
          onClose={() => setShowCatalogue(false)}
          onSelect={handleCatalogueSelect}
        />
      )}
    </div>
  );
}
