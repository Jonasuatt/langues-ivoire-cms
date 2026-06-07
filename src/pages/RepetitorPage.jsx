/**
 * RepetitorPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * 🦜 RÉPÉTO — Le Compagnon Vocal ILA
 * Phase 1 : Mode Écho
 *
 * RÉPÉTO est un jeu vocal conçu pour les apprenants — y compris les plus jeunes
 * qui ne savent pas encore lire. L'application joue un mot en langue locale et
 * l'apprenant le répète. Chaque enregistrement alimente un corpus audio unique
 * des langues ethniques ivoiriennes.
 *
 * Notre objectif à long terme : après constitution d'un corpus suffisamment large
 * grâce à nos locuteurs et apprenants, passer à la Phase 2 — Reconnaissance
 * Vocale ILA : une IA entraînée sur nos langues, capable de valider la
 * prononciation en temps réel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  MicrophoneIcon, SpeakerWaveIcon, TrashIcon, PencilIcon,
  PlusIcon, ChartBarIcon, DocumentTextIcon,
  ArrowPathIcon, CheckCircleIcon, ClockIcon,
  ArchiveBoxIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { repetitorAPI, languagesAPI } from '../services/api';
import FileUploadField from '../components/FileUploadField';
import PageHelp from '../components/PageHelp';

// ── Constantes UI ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'dashboard', label: '📊 Tableau de bord', icon: ChartBarIcon },
  { key: 'sessions',  label: '🎙️ Sessions',        icon: MicrophoneIcon },
  { key: 'mots',      label: '📝 Mots du jeu',     icon: DocumentTextIcon },
];

const STATUT_CONFIG = {
  BRUT:       { label: 'Brut',         bg: 'bg-gray-100  text-gray-700',  dot: 'bg-gray-400'   },
  SOUMIS_ILA: { label: 'Soumis ILA',  bg: 'bg-blue-100  text-blue-700',  dot: 'bg-blue-500'   },
  ARCHIVE:    { label: 'Archivé',     bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500'  },
};

const AGE_LABELS = {
  INCONNU:  'Inconnu',
  MOINS5:   '< 5 ans',
  '5_8':    '5-8 ans',
  '9_12':   '9-12 ans',
  '13_18':  '13-18 ans',
  ADULTE:   'Adulte',
};

const NIVEAU_COLORS = {
  debutant:       'bg-green-100 text-green-700',
  intermediaire:  'bg-amber-100 text-amber-700',
  avance:         'bg-red-100   text-red-700',
};

// ── Mini composant AudioPlayer ────────────────────────────────────────────────
function AudioBtn({ url, label = 'Écouter' }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  if (!url) return <span className="text-gray-300 text-xs italic">Aucun audio</span>;
  const toggle = () => {
    if (!audioRef.current) audioRef.current = new Audio(url);
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setPlaying(false);
      setPlaying(true);
    }
  };
  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        playing ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
      }`}
    >
      <SpeakerWaveIcon className="w-3.5 h-3.5" />
      {playing ? 'Stop' : label}
    </button>
  );
}

// ── Badge statut ──────────────────────────────────────────────────────────────
function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] ?? STATUT_CONFIG.BRUT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}

// ── Tableau de bord ───────────────────────────────────────────────────────────
function Dashboard({ stats, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <ArrowPathIcon className="w-7 h-7 text-teal-500 animate-spin" />
    </div>
  );
  if (!stats) return null;

  const kpis = [
    {
      label: 'Sessions totales',
      value: stats.totalSessions,
      icon: MicrophoneIcon,
      color: 'text-teal-600', bg: 'bg-teal-50',
      sub: `${stats.soumisILA} soumises à l'ILA`,
    },
    {
      label: 'Mots actifs',
      value: stats.totalMots,
      icon: DocumentTextIcon,
      color: 'text-indigo-600', bg: 'bg-indigo-50',
      sub: 'dans le catalogue jeu',
    },
    {
      label: 'Langues couvertes',
      value: stats.languesActives,
      icon: ChartBarIcon,
      color: 'text-emerald-600', bg: 'bg-emerald-50',
      sub: 'avec mots ou sessions',
    },
    {
      label: 'Pipeline ILA',
      value: stats.soumisILA,
      icon: CheckCircleIcon,
      color: 'text-blue-600', bg: 'bg-blue-50',
      sub: 'enregistrements à évaluer',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <p className="text-2xl font-black text-gray-900">{k.value ?? 0}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{k.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Répartition par langue */}
      {stats.sessionsByLangue?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Sessions par langue</h3>
          <div className="space-y-3">
            {stats.sessionsByLangue.map(l => {
              const pct = stats.totalSessions > 0
                ? Math.round((l.count / stats.totalSessions) * 100) : 0;
              return (
                <div key={l.languageId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{l.languageNom}</span>
                    <span className="text-xs text-gray-500">{l.count} session{l.count > 1 ? 's' : ''} · {pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sessions récentes */}
      {stats.recentes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">5 dernières sessions</h3>
          <div className="space-y-3">
            {stats.recentes.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <MicrophoneIcon className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">"{s.motCible}"</p>
                  <p className="text-xs text-gray-500">{s.languageNom ?? '—'} · {AGE_LABELS[s.ageGroupe] ?? s.ageGroupe}</p>
                </div>
                <StatutBadge statut={s.statut} />
                <AudioBtn url={s.audioEnfantUrl} label="Écouter" />
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalSessions === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="text-5xl mb-3">🦜</div>
          <p className="text-gray-600 font-semibold">Aucune session pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">
            Les sessions apparaîtront ici dès que les apprenants utiliseront RÉPÉTO sur l'application mobile.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Onglet Sessions ───────────────────────────────────────────────────────────
function SessionsTab({ languages }) {
  const [sessions, setSessions] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [filters, setFilters]   = useState({ languageId: '', statut: '', ageGroupe: '' });
  const [page, setPage]         = useState(0);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: page * LIMIT };
      if (filters.languageId) params.languageId = filters.languageId;
      if (filters.statut)     params.statut = filters.statut;
      if (filters.ageGroupe)  params.ageGroupe = filters.ageGroupe;
      const r = await repetitorAPI.getSessions(params);
      setSessions(r.data.data ?? []);
      setTotal(r.data.total ?? 0);
    } catch { toast.error('Erreur de chargement des sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filters]);

  const handleStatut = async (id, statut) => {
    try {
      await repetitorAPI.updateSession(id, { statut });
      toast.success(`Session marquée : ${STATUT_CONFIG[statut]?.label}`);
      load();
    } catch { toast.error('Erreur de mise à jour'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cette session ?')) return;
    try {
      await repetitorAPI.deleteSession(id);
      toast.success('Session supprimée');
      load();
    } catch { toast.error('Erreur de suppression'); }
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={filters.languageId}
          onChange={e => { setFilters(f => ({ ...f, languageId: e.target.value })); setPage(0); }}
        >
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={filters.statut}
          onChange={e => { setFilters(f => ({ ...f, statut: e.target.value })); setPage(0); }}
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={filters.ageGroupe}
          onChange={e => { setFilters(f => ({ ...f, ageGroupe: e.target.value })); setPage(0); }}
        >
          <option value="">Tous les âges</option>
          {Object.entries(AGE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button onClick={load} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50 rounded-xl transition-colors">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Résumé */}
      <p className="text-sm text-gray-500 px-1">
        {total} session{total > 1 ? 's' : ''} — page {page + 1} / {Math.ceil(total / LIMIT) || 1}
      </p>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <ArrowPathIcon className="w-7 h-7 text-teal-500 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">🎙️</div>
            <p className="text-gray-500">Aucune session trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot cible</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Langue</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Âge</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Audio enfant</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">"{s.motCible}"</div>
                      {s.traduction && <div className="text-xs text-gray-400">{s.traduction}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-gray-700">{s.languageNom ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{AGE_LABELS[s.ageGroupe] ?? s.ageGroupe}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <AudioBtn url={s.audioEnfantUrl} label="Répétition" />
                        {s.audioNatifUrl && <AudioBtn url={s.audioNatifUrl} label="Natif" />}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatutBadge statut={s.statut} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.statut === 'BRUT' && (
                          <button
                            onClick={() => handleStatut(s.id, 'SOUMIS_ILA')}
                            title="Soumettre au comité ILA"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        {s.statut !== 'ARCHIVE' && (
                          <button
                            onClick={() => handleStatut(s.id, 'ARCHIVE')}
                            title="Archiver"
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <ArchiveBoxIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Précédent
          </button>
          <button
            disabled={(page + 1) * LIMIT >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Modal ajout/édition mot ───────────────────────────────────────────────────
function MotModal({ open, onClose, onSave, languages, editData }) {
  const [form, setForm] = useState({
    languageId: '', languageNom: '', mot: '', traduction: '',
    audioUrl: '', emoji: '', categorie: 'general', niveau: 'debutant', ordre: 0,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        languageId:  editData.languageId  ?? '',
        languageNom: editData.languageNom ?? '',
        mot:         editData.mot         ?? '',
        traduction:  editData.traduction  ?? '',
        audioUrl:    editData.audioUrl    ?? '',
        genreVoix:   editData.genreVoix   ?? '',
        emoji:       editData.emoji       ?? '',
        categorie:   editData.categorie   ?? 'general',
        niveau:      editData.niveau      ?? 'debutant',
        ordre:       editData.ordre       ?? 0,
      });
    } else {
      setForm({ languageId: '', languageNom: '', mot: '', traduction: '', audioUrl: '', genreVoix: '', emoji: '', categorie: 'general', niveau: 'debutant', ordre: 0 });
    }
  }, [editData, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLang = (e) => {
    const lang = languages.find(l => l.id === e.target.value);
    set('languageId', e.target.value);
    set('languageNom', lang?.nom ?? '');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 rounded-t-2xl">
          <h2 className="text-white font-bold text-lg">
            {editData ? '✏️ Modifier le mot' : '➕ Ajouter un mot au jeu'}
          </h2>
          <p className="text-white/70 text-sm mt-0.5">Catalogue RÉPÉTO</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Langue *</label>
            <select
              value={form.languageId}
              onChange={handleLang}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="">Sélectionner une langue…</option>
              {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mot (langue locale) *</label>
              <input
                value={form.mot} onChange={e => set('mot', e.target.value)}
                placeholder="ex: ɔba"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Traduction (FR)</label>
              <input
                value={form.traduction} onChange={e => set('traduction', e.target.value)}
                placeholder="ex: roi"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
          {/* Upload audio + genre de voix */}
          <div>
            <FileUploadField
              type="audio"
              label="Audio natif certifié ILA *"
              value={form.audioUrl}
              onChange={url => set('audioUrl', url)}
            />
          </div>

          {/* Genre de voix */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Genre de la voix</label>
            <div className="flex gap-2">
              {[
                { value: '',  label: '— Non précisé', icon: '🎙️' },
                { value: 'M', label: 'Voix masculine', icon: '👨' },
                { value: 'F', label: 'Voix féminine',  icon: '👩' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('genreVoix', opt.value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    form.genreVoix === opt.value
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Emoji illustratif</label>
              <input
                value={form.emoji} onChange={e => set('emoji', e.target.value)}
                placeholder="🌳"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-center text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie</label>
              <select
                value={form.categorie} onChange={e => set('categorie', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {['general', 'animaux', 'nature', 'famille', 'couleurs', 'chiffres', 'corps', 'aliments'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Niveau</label>
              <select
                value={form.niveau} onChange={e => set('niveau', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ordre d'affichage</label>
            <input
              type="number" min="0"
              value={form.ordre} onChange={e => set('ordre', parseInt(e.target.value))}
              className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            {editData ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Onglet Mots du jeu ────────────────────────────────────────────────────────
function MotsTab({ languages }) {
  const [mots,    setMots]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState('');
  const [filterActif, setFilterActif] = useState('');
  const [modal, setModal]     = useState({ open: false, editData: null });

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filterLang)  params.languageId = filterLang;
      if (filterActif !== '') params.actif = filterActif;
      const r = await repetitorAPI.getMots(params);
      setMots(r.data.data ?? []);
      setTotal(r.data.total ?? 0);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterLang, filterActif]);

  const handleSave = async (form) => {
    if (!form.languageId || !form.mot.trim() || !form.audioUrl.trim()) {
      toast.error('Langue, mot et URL audio sont requis.');
      return;
    }
    try {
      if (modal.editData) {
        await repetitorAPI.updateMot(modal.editData.id, form);
        toast.success('Mot mis à jour ✓');
      } else {
        await repetitorAPI.createMot(form);
        toast.success('Mot ajouté au catalogue ✓');
      }
      setModal({ open: false, editData: null });
      load();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  const handleToggle = async (mot) => {
    try {
      await repetitorAPI.updateMot(mot.id, { actif: !mot.actif });
      toast.success(mot.actif ? 'Mot désactivé' : 'Mot activé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement ce mot ?')) return;
    try {
      await repetitorAPI.deleteMot(id);
      toast.success('Mot supprimé');
      load();
    } catch { toast.error('Erreur de suppression'); }
  };

  return (
    <div className="space-y-4">
      {/* Header + filtres */}
      <div className="flex flex-wrap gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm items-center">
        <select
          value={filterLang}
          onChange={e => setFilterLang(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <select
          value={filterActif}
          onChange={e => setFilterActif(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="">Tous (actifs + inactifs)</option>
          <option value="true">Actifs seulement</option>
          <option value="false">Inactifs seulement</option>
        </select>
        <button
          onClick={() => setModal({ open: true, editData: null })}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Ajouter un mot
        </button>
      </div>

      <p className="text-sm text-gray-500 px-1">{total} mot{total > 1 ? 's' : ''} dans le catalogue</p>

      {/* Grille de mots */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <ArrowPathIcon className="w-7 h-7 text-teal-500 animate-spin" />
        </div>
      ) : mots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="text-5xl mb-3">📝</div>
          <p className="text-gray-600 font-semibold">Aucun mot dans le catalogue</p>
          <p className="text-gray-400 text-sm mt-1">
            Ajoutez les premiers mots pour que RÉPÉTO puisse fonctionner sur l'application mobile.
          </p>
          <button
            onClick={() => setModal({ open: true, editData: null })}
            className="mt-4 px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            + Ajouter le premier mot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mots.map(m => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${
                m.actif ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Header carte */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.emoji ?? '🔊'}</span>
                  <div>
                    <p className="font-bold text-gray-800">{m.mot}</p>
                    {m.traduction && <p className="text-xs text-gray-400">{m.traduction}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEAU_COLORS[m.niveau] ?? 'bg-gray-100 text-gray-600'}`}>
                  {m.niveau}
                </span>
              </div>

              {/* Langue + catégorie + genre */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full capitalize font-medium">
                  {m.languageNom ?? m.languageId}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {m.categorie}
                </span>
                {m.genreVoix === 'M' && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    👨 Homme
                  </span>
                )}
                {m.genreVoix === 'F' && (
                  <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                    👩 Femme
                  </span>
                )}
              </div>

              {/* Audio */}
              <div className="mb-3">
                <AudioBtn url={m.audioUrl} label="Écouter l'audio natif" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleToggle(m)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    m.actif
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  }`}
                >
                  {m.actif ? '⏸ Désactiver' : '▶ Activer'}
                </button>
                <button
                  onClick={() => setModal({ open: true, editData: m })}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MotModal
        open={modal.open}
        onClose={() => setModal({ open: false, editData: null })}
        onSave={handleSave}
        languages={languages}
        editData={modal.editData}
      />
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function RepetitorPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [languages, setLanguages] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    languagesAPI.getAllAdmin()
      .then(r => setLanguages(r.data.filter(l => l.isActive)))
      .catch(() => {});
    repetitorAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── En-tête page ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
              🦜
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">RÉPÉTO</h1>
              <p className="text-gray-500 text-sm">Le Compagnon Vocal ILA — Gestion du jeu</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 bg-teal-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Phase 1 — Mode Écho
          </span>
        </div>
      </div>

      {/* ── Bannière Phase 1 / Roadmap ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Parrot en fond décoratif */}
        <div className="absolute -right-4 -top-4 text-[100px] opacity-10 leading-none select-none pointer-events-none">
          🦜
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
              🚀 PHASE 1 — Mode Écho
            </span>
            <span className="text-white/60 text-xs">En cours • Actuelle</span>
          </div>
          <h2 className="text-lg font-black mb-2">
            Le corpus audio ivoirien se constitue maintenant
          </h2>
          <p className="text-white/85 text-sm leading-relaxed max-w-2xl">
            RÉPÉTO enregistre chaque répétition de vos apprenants pour constituer progressivement
            un corpus audio unique en langues ethniques ivoiriennes. Notre objectif : une fois ce
            corpus <strong className="text-white">suffisamment large grâce à nos locuteurs natifs et apprenants</strong>,
            passer à la <strong className="text-white">Phase 2 — Reconnaissance Vocale ILA</strong> :
            une IA entraînée spécifiquement sur nos langues, capable de valider la prononciation
            en temps réel et de guider l'apprenant avec précision.
          </p>

          {/* Roadmap phases */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/30"></span>
              <span className="font-semibold text-white">Phase 1 — Mode Écho</span>
              <span className="text-white/60">(maintenant)</span>
            </div>
            <div className="text-white/30 font-bold">→</div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/30"></span>
              <span className="text-white/70">Phase 2 — Reconnaissance Vocale ILA</span>
            </div>
            <div className="text-white/20 font-bold">→</div>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
              <span className="text-white/50">Phase 3 — IA Entraînée sur corpus ILA</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenu par onglet ────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && <Dashboard stats={stats} loading={statsLoading} />}
      {activeTab === 'sessions'  && <SessionsTab languages={languages} />}
      {activeTab === 'mots'      && <MotsTab languages={languages} />}

      {/* ── Aide contextuelle ─────────────────────────────────────────────── */}
      <PageHelp pageId="repetitor" />
    </div>
  );
}
