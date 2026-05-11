import { useState, useEffect, useCallback } from 'react';
import {
  GlobeAltIcon, CheckCircleIcon, XCircleIcon,
  MapPinIcon, PlusIcon, PencilIcon,
} from '@heroicons/react/24/outline';
import { languagesAPI } from '../services/api';

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

// Contour simplifié de la Côte d'Ivoire (sens horaire depuis NW)
const CI_PATH =
  'M0,7 L39,0 L105,0 L171,7 L236,0 L269,0 ' +
  'L336,17 L369,83 L393,149 L400,215 ' +
  'L393,281 L373,335 L353,375 L353,408 ' +
  'L313,428 L269,428 L202,415 L136,402 L84,389 L52,383 ' +
  'L39,350 L7,284 L0,215 L0,149 L7,83 L0,49 Z';

// Villes de référence
const CITIES = [
  { nom: 'Abidjan',       lat: 5.35, lng: -4.00 },
  { nom: 'Yamoussoukro',  lat: 6.82, lng: -5.28 },
  { nom: 'Bouaké',        lat: 7.69, lng: -5.03 },
  { nom: 'Korhogo',       lat: 9.46, lng: -5.63 },
  { nom: 'San Pedro',     lat: 4.75, lng: -6.64 },
  { nom: 'Daloa',         lat: 6.89, lng: -6.45 },
  { nom: 'Man',           lat: 7.41, lng: -7.55 },
  { nom: 'Abengourou',    lat: 6.72, lng: -3.49 },
];

const EMPTY_FORM = {
  nom: '', code: '', region: '', description: '',
  couleur: '#0B7A52', emoji: '', lat: '', lng: '', isActive: true,
};

// ── Carte SVG réutilisable ─────────────────────────────────────────────────
function CarteCI({ langues = [], selectedId = null, onMarkerClick, onMapClick, editingMarker = null, style = {} }) {
  return (
    <svg
      viewBox={`0 0 ${GEO.W} ${GEO.H}`}
      style={{ background: '#D6EAF8', borderRadius: 10, cursor: onMapClick ? 'crosshair' : 'default', ...style }}
      onClick={e => {
        if (!onMapClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left)  / rect.width)  * GEO.W;
        const svgY = ((e.clientY - rect.top)   / rect.height) * GEO.H;
        onMapClick(svgToGeo(svgX, svgY));
      }}
    >
      {/* Fond pays */}
      <path d={CI_PATH} fill="#C8E6C9" stroke="#43A047" strokeWidth="1.5" />

      {/* Villes de référence */}
      {CITIES.map(c => {
        const { x, y } = geoToSVG(c.lat, c.lng);
        return (
          <g key={c.nom}>
            <circle cx={x} cy={y} r="2.5" fill="#90A4AE" opacity="0.7" />
            <text x={x + 4} y={y + 1} fontSize="7" fill="#546E7A" fontFamily="Arial">{c.nom}</text>
          </g>
        );
      })}

      {/* Marqueurs de langues */}
      {langues.filter(l => l.lat && l.lng).map(lang => {
        const { x, y } = geoToSVG(parseFloat(lang.lat), parseFloat(lang.lng));
        const isSelected = selectedId === lang.id;
        const color = lang.couleur || '#0B7A52';
        return (
          <g
            key={lang.id}
            style={{ cursor: onMarkerClick ? 'pointer' : 'default' }}
            onClick={e => { e.stopPropagation(); onMarkerClick?.(lang); }}
          >
            {/* Ombre */}
            <circle cx={x + 1} cy={y + 2} r={isSelected ? 15 : 11} fill="#000" opacity="0.12" />
            {/* Cercle principal */}
            <circle cx={x} cy={y} r={isSelected ? 14 : 10}
              fill={color} stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.4)'}
              strokeWidth={isSelected ? 2.5 : 1} />
            {/* Emoji ou code */}
            <text x={x} y={y + 1} fontSize={isSelected ? 9 : 7.5} fill="#fff"
              textAnchor="middle" dominantBaseline="middle" fontWeight="bold" fontFamily="Arial">
              {lang.emoji || lang.code?.slice(0, 3).toUpperCase()}
            </text>
            {/* Nom affiché si sélectionné */}
            {isSelected && (
              <>
                <rect x={x - 28} y={y + 17} width="56" height="13" rx="3" fill="white" opacity="0.9" />
                <text x={x} y={y + 24} fontSize="8" fill={color}
                  textAnchor="middle" fontWeight="bold" fontFamily="Arial">
                  {lang.nom}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Marqueur en cours d'édition (position temporaire) */}
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

// ── Page principale ────────────────────────────────────────────────────────
export default function LanguesPage() {
  const [langues, setLangues]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [tab, setTab]           = useState('liste');
  const [modal, setModal]       = useState(null);   // { mode, data }
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [selectedLang, setSelectedLang] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    languagesAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLangues(list);
      })
      .catch(() => setError("Impossible de charger les langues. Vérifiez la connexion à l'API."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Ouvrir modal ──
  function openCreate() {
    setSaveError(null);
    setModal({ mode: 'create', data: { ...EMPTY_FORM } });
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
      }
    });
  }

  const set = (key, val) => setModal(m => ({ ...m, data: { ...m.data, [key]: val } }));

  // ── Sauvegarder ──
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
      } else {
        await languagesAPI.update(d._id, payload);
      }
      setModal(null);
      load();
    } catch (e) {
      setSaveError(e.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  const languesAvecCoords = langues.filter(l => l.lat && l.lng);

  // ── Render ──
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Langues</h1>
            <p className="text-sm text-gray-500">Langues ethniques ivoiriennes de l'application</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Nouvelle langue
        </button>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{langues.length}</p>
            <p className="text-sm text-gray-500 mt-1">Langues enregistrées</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {langues.filter(l => l.isActive !== false).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Actives</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{languesAvecCoords.length}</p>
            <p className="text-sm text-gray-500 mt-1">Positionnées sur la carte</p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[['liste', '📋 Liste'], ['carte', '🗺️ Carte']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          <span className="ml-3 text-gray-500 text-sm">Chargement des langues…</span>
        </div>
      )}

      {/* ══════════════════ TAB LISTE ══════════════════ */}
      {!loading && !error && tab === 'liste' && (
        langues.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <GlobeAltIcon className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Aucune langue configurée</p>
            <button onClick={openCreate} className="mt-4 text-sm text-green-600 underline">
              Ajouter la première langue
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Langue</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Région</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Mots</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Position</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {langues.map((lang, idx) => (
                  <tr
                    key={lang.id ?? idx}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: lang.couleur || '#ccc' }}
                        />
                        <span className="font-medium text-gray-900">
                          {lang.emoji} {lang.nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-xs">
                        {lang.code ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{lang.region ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {lang._count?.mots ?? lang.nombreMots ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {lang.lat && lang.lng ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          {parseFloat(lang.lat).toFixed(2)}°N,&nbsp;
                          {parseFloat(lang.lng).toFixed(2)}°
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-xs">Non positionnée</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {lang.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
                          <XCircleIcon className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEdit(lang)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5" /> Éditer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ══════════════════ TAB CARTE ══════════════════ */}
      {!loading && !error && tab === 'carte' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Carte principale */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  🗺️ Carte de Côte d'Ivoire
                </h3>
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
                Cliquez sur un marqueur pour voir les détails — Éditez la langue pour modifier sa position
              </p>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">

            {/* Fiche langue sélectionnée */}
            {selectedLang && (
              <div
                className="bg-white rounded-xl border-2 shadow-sm p-4"
                style={{ borderColor: selectedLang.couleur || '#0B7A52' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ background: selectedLang.couleur || '#0B7A52' }}
                  >
                    {selectedLang.emoji || selectedLang.code?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedLang.nom}</h4>
                    <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {selectedLang.code}
                    </span>
                  </div>
                </div>
                {selectedLang.region && (
                  <p className="text-sm text-gray-600 mb-1">📍 {selectedLang.region}</p>
                )}
                {selectedLang.description && (
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{selectedLang.description}</p>
                )}
                {selectedLang.lat && selectedLang.lng && (
                  <p className="text-xs text-gray-400 font-mono mb-3">
                    {parseFloat(selectedLang.lat).toFixed(4)}°N, {parseFloat(selectedLang.lng).toFixed(4)}°
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { openEdit(selectedLang); setSelectedLang(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" /> Éditer
                  </button>
                  <button
                    onClick={() => setSelectedLang(null)}
                    className="px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Langues non positionnées */}
            {langues.filter(l => !l.lat || !l.lng).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                  ⚠️ Non positionnées ({langues.filter(l => !l.lat || !l.lng).length})
                </p>
                {langues.filter(l => !l.lat || !l.lng).map(lang => (
                  <div key={lang.id} className="flex items-center justify-between py-1.5 border-b border-yellow-100 last:border-0">
                    <span className="text-sm text-gray-700">{lang.emoji} {lang.nom}</span>
                    <button
                      onClick={() => openEdit(lang)}
                      className="text-xs text-green-600 hover:underline font-medium"
                    >
                      Positionner →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Liste complète */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Toutes les langues
              </p>
              <div className="space-y-1">
                {langues.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => lang.lat && lang.lng
                      ? setSelectedLang(l => l?.id === lang.id ? null : lang)
                      : openEdit(lang)
                    }
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedLang?.id === lang.id ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: lang.couleur || '#ccc' }}
                    />
                    <span className="flex-1 text-gray-800 truncate">
                      {lang.emoji} {lang.nom}
                    </span>
                    {lang.lat && lang.lng
                      ? <MapPinIcon className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      : <span className="text-xs text-yellow-400 flex-shrink-0">—</span>
                    }
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════ MODAL CRÉER / ÉDITER ══════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Header modal */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {modal.mode === 'create' ? '➕ Nouvelle langue' : `✏️ Modifier — ${modal.data.nom || '…'}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            {/* Corps */}
            <div className="p-6 space-y-5">

              {/* Nom + Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modal.data.nom}
                    onChange={e => set('nom', e.target.value)}
                    placeholder="ex: Baoulé"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code <span className="text-red-500">*</span>
                    <span className="ml-1 text-gray-400 font-normal">(ex: bci, dyu)</span>
                  </label>
                  <input
                    type="text"
                    value={modal.data.code}
                    onChange={e => set('code', e.target.value.toLowerCase())}
                    maxLength={5}
                    placeholder="bci"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Région + Emoji */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                  <input
                    type="text"
                    value={modal.data.region}
                    onChange={e => set('region', e.target.value)}
                    placeholder="ex: Centre, Nord, Ouest…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji <span className="text-gray-400 font-normal">(affiché sur la carte)</span>
                  </label>
                  <input
                    type="text"
                    value={modal.data.emoji}
                    onChange={e => set('emoji', e.target.value)}
                    placeholder="🌍"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={modal.data.description}
                  onChange={e => set('description', e.target.value)}
                  rows={2}
                  placeholder="Courte description de la langue (origines, locuteurs…)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>

              {/* Couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur <span className="text-gray-400 font-normal">(marqueur sur la carte)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={modal.data.couleur}
                    onChange={e => set('couleur', e.target.value)}
                    className="h-10 w-14 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                  />
                  <input
                    type="text"
                    value={modal.data.couleur}
                    onChange={e => set('couleur', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <div
                    className="w-9 h-9 rounded-full border-2 border-white shadow flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: modal.data.couleur }}
                  >
                    {modal.data.emoji || modal.data.code?.slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Position géographique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position géographique
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Cliquez directement sur la carte ci-dessous pour positionner la langue automatiquement.
                </p>
                {/* Mini carte cliquable */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                  <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    Cliquez sur la carte pour positionner — glissez ensuite si besoin
                  </div>
                  <CarteCI
                    langues={langues.filter(l => l.id !== modal.data._id)}
                    editingMarker={{
                      lat:    modal.data.lat,
                      lng:    modal.data.lng,
                      emoji:  modal.data.emoji,
                      code:   modal.data.code,
                      couleur: modal.data.couleur,
                    }}
                    onMapClick={({ lat, lng }) => {
                      set('lat', String(lat));
                      set('lng', String(lng));
                    }}
                    style={{ width: '100%', maxHeight: '220px' }}
                  />
                </div>
                {/* Champs manuels */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Latitude (°N)</label>
                    <input
                      type="number" step="0.0001"
                      value={modal.data.lat}
                      onChange={e => set('lat', e.target.value)}
                      placeholder="ex: 7.6900"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Longitude (°W)</label>
                    <input
                      type="number" step="0.0001"
                      value={modal.data.lng}
                      onChange={e => set('lng', e.target.value)}
                      placeholder="ex: -5.0300"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle actif */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => set('isActive', !modal.data.isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    modal.data.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    modal.data.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <label className="text-sm text-gray-700">
                  Langue <strong>{modal.data.isActive ? 'active' : 'inactive'}</strong> dans l'application mobile
                </label>
              </div>

              {/* Erreur sauvegarde */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setModal(null)}
                disabled={saving}
                className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Enregistrement…' : modal.mode === 'create' ? '✓ Créer la langue' : '✓ Enregistrer'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
