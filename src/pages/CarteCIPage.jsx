/**
 * CarteCIPage — Gestion du module "Carte de Côte d'Ivoire"
 *
 * CMS  : visualisation et gestion des langues positionnées sur la carte
 * Mobile : alimente le module "Carte CI" de l'application mobile Langues Ivoire
 */
import { useState, useEffect, useCallback } from 'react';
import PageHelp from '../components/PageHelp';
import { languagesAPI } from '../services/api';
import { CarteCI } from './LanguesPage';
import {
  MapPinIcon, PencilIcon, EyeIcon, EyeSlashIcon,
  GlobeAltIcon, MagnifyingGlassIcon, CheckCircleIcon,
  ExclamationTriangleIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ── Familles linguistiques (correspondance par couleur dominante) ─────────────
const FAMILLES = [
  { key: 'akan',       nom: 'Akan',               couleur: '#D4A017', bg: 'bg-yellow-50',  border: 'border-yellow-300', text: 'text-yellow-800',  dot: 'bg-yellow-400',  emoji: '🟡' },
  { key: 'krou',       nom: 'Krou',               couleur: '#2E7D32', bg: 'bg-green-50',   border: 'border-green-300',  text: 'text-green-800',   dot: 'bg-green-500',   emoji: '🟢' },
  { key: 'gur',        nom: 'Gur / Voltaïque',    couleur: '#E65100', bg: 'bg-orange-50',  border: 'border-orange-300', text: 'text-orange-800',  dot: 'bg-orange-500',  emoji: '🟠' },
  { key: 'mande-n',    nom: 'Mandé Nord',          couleur: '#1565C0', bg: 'bg-blue-50',    border: 'border-blue-300',   text: 'text-blue-800',    dot: 'bg-blue-500',    emoji: '🔵' },
  { key: 'mande-s',    nom: 'Mandé Sud',           couleur: '#6A1B9A', bg: 'bg-purple-50',  border: 'border-purple-300', text: 'text-purple-800',  dot: 'bg-purple-500',  emoji: '🟣' },
  { key: 'vehiculaire',nom: 'Véhiculaire / Créole',couleur: '#C62828', bg: 'bg-red-50',     border: 'border-red-300',    text: 'text-red-800',     dot: 'bg-red-500',     emoji: '🔴' },
];

// Correspondance couleur → famille (approximation par proximité)
function detectFamille(couleur) {
  if (!couleur) return null;
  const hex = couleur.toLowerCase();
  if (hex.startsWith('#d4') || hex.startsWith('#c6') || hex.startsWith('#b5') || hex.startsWith('#a4')) return 'akan';
  if (hex.startsWith('#2e') || hex.startsWith('#1c') || hex.startsWith('#25')) return 'krou';
  if (hex.startsWith('#e6') || hex.startsWith('#d4') && hex.includes('51')) return 'gur';
  if (hex.startsWith('#15') || hex.startsWith('#12') || hex.startsWith('#0f') || hex.startsWith('#0c')) return 'mande-n';
  if (hex.startsWith('#6a') || hex.startsWith('#5e') || hex.startsWith('#52') || hex.startsWith('#46')) return 'mande-s';
  if (hex.startsWith('#c6') || hex.startsWith('#b7')) return 'vehiculaire';
  return null;
}

export default function CarteCIPage() {
  const [langues, setLangues]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedLang, setSelectedLang] = useState(null);
  const [search, setSearch]         = useState('');
  const [famFiltre, setFamFiltre]   = useState(new Set(FAMILLES.map(f => f.key)));
  const [modeEdition, setModeEdition] = useState(false);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    languagesAPI.getAll()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setLangues(list);
      })
      .catch(() => toast.error('Impossible de charger les langues'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Basculer une famille dans les filtres ──
  const toggleFamille = (key) => {
    setFamFiltre(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Toggle visibilité mobile (isActive) ──
  const handleToggleActive = async (lang) => {
    setSaving(true);
    try {
      await languagesAPI.update(lang.id, { isActive: !lang.isActive });
      toast.success(lang.isActive ? `${lang.nom} masquée sur la carte mobile` : `${lang.nom} affichée sur la carte mobile`);
      load();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  // ── Filtres ──
  const languesFiltrees = langues.filter(l => {
    const fam = detectFamille(l.couleur);
    const matchFam = fam ? famFiltre.has(fam) : true;
    const matchSearch = search.trim() === '' ||
      l.nom?.toLowerCase().includes(search.toLowerCase()) ||
      l.region?.toLowerCase().includes(search.toLowerCase()) ||
      l.code?.toLowerCase().includes(search.toLowerCase());
    return matchFam && matchSearch;
  });

  const avecCoords    = langues.filter(l => l.lat && l.lng);
  const sansCoords    = langues.filter(l => !l.lat || !l.lng);
  const actives       = langues.filter(l => l.isActive !== false);
  const inactives     = langues.filter(l => l.isActive === false);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <img src="/carte-ci.png" alt="Carte CI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🗺️ Carte de Côte d'Ivoire
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Module mobile <span className="font-semibold text-primary-600">Carte CI</span> — gestion des langues et de leur position géographique
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModeEdition(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
              modeEdition
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}>
            <PencilIcon className="w-4 h-4" />
            {modeEdition ? 'Mode édition actif' : 'Mode édition'}
          </button>
        </div>
      </div>

      {/* ── Bannière info mobile ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Module mobile "Carte CI"</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Cette carte est affichée dans l'application mobile. Les langues marquées <strong>actives</strong> apparaissent
            avec un marqueur coloré. Cliquez sur un marqueur pour voir les détails de la langue,
            ses leçons et sons disponibles.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Langues enregistrées', value: langues.length, color: 'text-gray-700', bg: 'bg-white', border: 'border-gray-100' },
            { label: '📍 Positionnées sur carte', value: avecCoords.length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: '🟢 Actives (visibles)', value: actives.length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: '⚠️ Sans coordonnées', value: sansCoords.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 shadow-sm`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Layout principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Carte ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Barre d'outils de la carte */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une langue…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setFamFiltre(famFiltre.size === FAMILLES.length ? new Set() : new Set(FAMILLES.map(f => f.key)))}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  {famFiltre.size === FAMILLES.length ? 'Masquer tout' : 'Tout afficher'}
                </button>
                {FAMILLES.map(f => (
                  <button key={f.key}
                    onClick={() => toggleFamille(f.key)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      famFiltre.has(f.key)
                        ? `${f.bg} ${f.text} ${f.border}`
                        : 'bg-white text-gray-400 border-gray-200'
                    }`}>
                    {f.emoji} {f.nom.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Carte PNG */}
            {loading ? (
              <div className="flex items-center justify-center py-32 bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                <span className="ml-3 text-gray-500 text-sm">Chargement…</span>
              </div>
            ) : (
              <CarteCI
                langues={languesFiltrees}
                selectedId={selectedLang?.id}
                onMarkerClick={lang => setSelectedLang(l => l?.id === lang.id ? null : lang)}
                onMapClick={() => setSelectedLang(null)}
                style={{ width: '100%' }}
              />
            )}

            <p className="text-xs text-gray-400 text-center py-2 border-t border-gray-50">
              Carte de Côte d'Ivoire · {languesFiltrees.filter(l => l.lat && l.lng).length} langue{languesFiltrees.filter(l => l.lat && l.lng).length !== 1 ? 's' : ''} affichée{languesFiltrees.filter(l => l.lat && l.lng).length !== 1 ? 's' : ''}
              {modeEdition && <span className="text-amber-600 ml-2 font-medium">✏️ Mode édition — modifiez la position via la page Langues</span>}
            </p>
          </div>
        </div>

        {/* ── Panneau latéral ── */}
        <div className="space-y-4">

          {/* Langue sélectionnée */}
          {selectedLang && (
            <div className="bg-white rounded-2xl border-2 shadow-sm p-4 transition-all"
              style={{ borderColor: selectedLang.couleur || '#0B7A52' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md"
                  style={{ background: selectedLang.couleur || '#0B7A52' }}>
                  {selectedLang.emoji || selectedLang.code?.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base">{selectedLang.nom}</h3>
                  <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{selectedLang.code}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    selectedLang.isActive !== false
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedLang.isActive !== false ? '🟢 Active' : '🔜 À venir'}
                  </span>
                </div>
              </div>

              {selectedLang.region && (
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                  {selectedLang.region}
                </p>
              )}
              {selectedLang.description && (
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{selectedLang.description}</p>
              )}
              {selectedLang.lat && selectedLang.lng && (
                <p className="text-xs text-gray-400 mb-3">
                  📍 {parseFloat(selectedLang.lat).toFixed(4)}°N, {parseFloat(selectedLang.lng).toFixed(4)}°W
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(selectedLang)}
                  disabled={saving}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    selectedLang.isActive !== false
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  }`}>
                  {selectedLang.isActive !== false
                    ? <><EyeSlashIcon className="w-3.5 h-3.5" /> Masquer sur carte</>
                    : <><EyeIcon className="w-3.5 h-3.5" /> Afficher sur carte</>
                  }
                </button>
                <a href="/langues"
                  className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors flex items-center gap-1">
                  <PencilIcon className="w-3.5 h-3.5" /> Éditer
                </a>
                <button onClick={() => setSelectedLang(null)}
                  className="px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Légende familles */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Familles linguistiques
            </h4>
            <div className="space-y-2">
              {FAMILLES.map(f => {
                const count = langues.filter(l => detectFamille(l.couleur) === f.key).length;
                const visible = famFiltre.has(f.key);
                return (
                  <button key={f.key}
                    onClick={() => toggleFamille(f.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      visible ? f.bg : 'bg-gray-50 opacity-50'
                    }`}>
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${visible ? f.dot : 'bg-gray-300'}`} />
                    <span className={`flex-1 text-xs font-semibold ${visible ? f.text : 'text-gray-400'}`}>{f.emoji} {f.nom}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${visible ? `${f.bg} ${f.text}` : 'bg-gray-100 text-gray-400'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Langues sans coordonnées */}
          {sansCoords.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Non positionnées ({sansCoords.length})
                </h4>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {sansCoords.map(lang => (
                  <div key={lang.id} className="flex items-center justify-between py-1 border-b border-amber-100 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: lang.couleur || '#ccc' }} />
                      <span className="text-xs text-gray-700 truncate">{lang.emoji} {lang.nom}</span>
                    </div>
                    <a href="/langues"
                      className="text-xs text-green-600 hover:underline font-semibold flex-shrink-0 ml-2">
                      Positionner →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toutes les langues actives */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Sur la carte mobile
              </h4>
              <span className="text-xs text-gray-400">{actives.length} active{actives.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {langues.map(lang => (
                <div key={lang.id}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedLang?.id === lang.id ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => lang.lat && lang.lng
                    ? setSelectedLang(l => l?.id === lang.id ? null : lang)
                    : null}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: lang.couleur || '#ccc' }} />
                  <span className="flex-1 text-xs text-gray-700 truncate">{lang.emoji} {lang.nom}</span>
                  {lang.isActive !== false
                    ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    : <span className="text-xs text-amber-400 flex-shrink-0">—</span>}
                  {lang.lat && lang.lng
                    ? <MapPinIcon className="w-3 h-3 text-green-400 flex-shrink-0" />
                    : <MapPinIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <PageHelp pageId="carte-ci" />
    </div>
  );
}
