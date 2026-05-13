/**
 * ContributionsPage — Modération des contributions utilisateurs
 *
 * Flux de traitement :
 *  1. Cliquer sur une contribution → fiche détaillée complète
 *  2. Vérifier : mot/phrase, traduction, transcription, contexte, audio, image
 *  3. Approuver (→ publiée dans le dictionnaire) ou Rejeter (avec raison optionnelle)
 */
import { useEffect, useState, useRef } from 'react';
import { contributionsAPI, languagesAPI } from '../services/api';
import LanguageSelect from '../components/LanguageSelect';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon,
  SpeakerWaveIcon, PhotoIcon, UserCircleIcon,
  ClockIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUTS = [
  { key: 'PENDING',   label: '⏳ En attente', color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { key: 'PUBLISHED', label: '✅ Approuvées', color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  { key: 'REJECTED',  label: '❌ Rejetées',   color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200'   },
];

const TYPE_LABELS = {
  WORD:   { label: 'Mot',    color: 'bg-blue-100 text-blue-700'   },
  PHRASE: { label: 'Phrase', color: 'bg-purple-100 text-purple-700' },
  IMAGE:  { label: 'Image',  color: 'bg-orange-100 text-orange-700' },
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Lecteur audio inline ─────────────────────────────────────────────────────
function AudioPlayer({ url, label }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef(null);
  if (!url) return null;
  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  };
  return (
    <div>
      {label && <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
        <button onClick={toggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
            playing ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-primary-50'
          }`}>
          {playing ? '⏸' : '▶'}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{url.split('/').pop()}</p>
        </div>
        <SpeakerWaveIcon className="w-4 h-4 text-gray-400 flex-shrink-0"/>
        <audio ref={ref} src={url} onEnded={() => setPlaying(false)} className="hidden"/>
      </div>
    </div>
  );
}

// ─── Modal de détail / modération ────────────────────────────────────────────
function ModalDetail({ contrib, onClose, onModerate }) {
  const [raison, setRaison]     = useState('');
  const [showRaison, setShowRaison] = useState(false);
  const [saving, setSaving]     = useState(false);

  if (!contrib) return null;

  const type  = TYPE_LABELS[contrib.type] || { label: contrib.type, color: 'bg-gray-100 text-gray-600' };
  const c     = contrib.contenu || {};
  const isPending = contrib.status === 'PENDING';

  const handleApprove = async () => {
    setSaving(true);
    try {
      await onModerate(contrib.id, 'PUBLISHED', '');
      onClose();
    } finally { setSaving(false); }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await onModerate(contrib.id, 'REJECTED', raison);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* ── En-tête modal ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className={`badge ${type.color}`}>{type.label}</span>
            <span className="badge bg-gray-100 text-gray-600">{contrib.language?.nom || '—'}</span>
            {contrib.status === 'PENDING'    && <span className="badge bg-amber-100 text-amber-700">⏳ En attente</span>}
            {contrib.status === 'PUBLISHED'  && <span className="badge bg-green-100 text-green-700">✅ Approuvée</span>}
            {contrib.status === 'REJECTED'   && <span className="badge bg-red-100 text-red-700">❌ Rejetée</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Contributeur ── */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <UserCircleIcon className="w-7 h-7 text-primary-500"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">
                {contrib.user?.prenom} {contrib.user?.nom}
              </p>
              {contrib.user?.email && (
                <p className="text-sm text-gray-500">{contrib.user.email}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Soumis le</p>
              <p className="text-xs font-medium text-gray-600">{fmtDate(contrib.createdAt)}</p>
            </div>
          </div>

          {/* ── Contenu principal ── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contenu soumis</p>
            </div>
            <div className="p-4 space-y-4">

              {/* Mot / Phrase */}
              {(c.mot || c.phrase) && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">
                    {contrib.type === 'WORD' ? 'Mot en langue locale' : 'Phrase en langue locale'}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{c.mot || c.phrase}</p>
                  {c.transcription && (
                    <p className="text-sm text-gray-400 italic mt-1">[{c.transcription}]</p>
                  )}
                </div>
              )}

              {/* Traduction */}
              {c.traduction && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">🇫🇷 Traduction française</p>
                  <p className="text-base font-medium text-gray-700">{c.traduction}</p>
                </div>
              )}

              {/* Catégorie / Contexte */}
              <div className="grid grid-cols-2 gap-4">
                {c.categorie && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Catégorie</p>
                    <span className="badge bg-indigo-100 text-indigo-700">{c.categorie}</span>
                  </div>
                )}
                {c.genre && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">Genre grammatical</p>
                    <span className="badge bg-gray-100 text-gray-600">{c.genre}</span>
                  </div>
                )}
              </div>

              {/* Exemple d'utilisation */}
              {c.contexte && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                  <p className="text-xs font-medium text-blue-500 mb-1">💬 Exemple d'utilisation</p>
                  <p className="text-sm text-blue-800 italic">"{c.contexte}"</p>
                </div>
              )}

              {/* Exemple en français */}
              {c.exempleTraduction && (
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Traduction de l'exemple</p>
                  <p className="text-sm text-gray-600 italic">"{c.exempleTraduction}"</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Médias ── */}
          {(c.audioUrl || c.audioUrlFr || c.imageUrl || contrib.imageUrl) && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Médias joints</p>
              </div>
              <div className="p-4 space-y-3">
                <AudioPlayer url={c.audioUrl}   label="🌍 Audio en langue locale"/>
                <AudioPlayer url={c.audioUrlFr} label="🇫🇷 Audio français"/>

                {(c.imageUrl || contrib.imageUrl) && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">🖼️ Image</p>
                    <img
                      src={c.imageUrl || contrib.imageUrl}
                      alt="contribution"
                      className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Informations complémentaires ── */}
          {(c.niveau || c.tags?.length > 0) && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations complémentaires</p>
              </div>
              <div className="p-4 flex flex-wrap gap-3">
                {c.niveau && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Niveau</p>
                    <span className="badge bg-teal-100 text-teal-700">{c.niveau}</span>
                  </div>
                )}
                {c.tags?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t, i) => (
                        <span key={i} className="badge bg-gray-100 text-gray-600">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Décision de modération (statut existant) ── */}
          {contrib.status !== 'PENDING' && (
            <div className={`rounded-xl px-4 py-3 border ${contrib.status === 'PUBLISHED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-sm font-semibold mb-1 ${contrib.status === 'PUBLISHED' ? 'text-green-700' : 'text-red-700'}`}>
                {contrib.status === 'PUBLISHED' ? '✅ Contribution approuvée' : '❌ Contribution rejetée'}
              </p>
              {contrib.commentaire && (
                <p className={`text-sm ${contrib.status === 'PUBLISHED' ? 'text-green-600' : 'text-red-600'}`}>
                  Raison : {contrib.commentaire}
                </p>
              )}
              {contrib.moderatedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Modérée le {fmtDate(contrib.moderatedAt)}
                  {contrib.moderator && ` par ${contrib.moderator.prenom} ${contrib.moderator.nom}`}
                </p>
              )}
            </div>
          )}

          {/* ── Zone de décision (PENDING uniquement) ── */}
          {isPending && (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500"/>
                Décision de modération
              </p>

              {/* Raison de rejet */}
              {showRaison && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Raison du rejet <span className="text-gray-400 font-normal">(envoyée au contributeur)</span>
                  </label>
                  <textarea
                    value={raison}
                    onChange={e => setRaison(e.target.value)}
                    rows={3}
                    placeholder="ex: La traduction proposée est incorrecte. Le mot 'folo' signifie 'maison' et non 'arbre'…"
                    className="input resize-none w-full"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
                  <CheckCircleIcon className="w-5 h-5"/>
                  Approuver &amp; publier
                </button>
                <button
                  onClick={() => showRaison ? handleReject() : setShowRaison(true)}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                  <XCircleIcon className="w-5 h-5"/>
                  {showRaison ? 'Confirmer le rejet' : 'Rejeter'}
                </button>
              </div>

              {!showRaison && (
                <p className="text-center text-xs text-gray-400">
                  Cliquez "Rejeter" pour ajouter une raison avant de confirmer
                </p>
              )}
              {showRaison && (
                <button onClick={() => setShowRaison(false)}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 text-center transition-colors">
                  ← Annuler le rejet
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ContributionsPage() {
  const { user } = useAuth();

  const [status, setStatus]             = useState('PENDING');
  const [contributions, setContributions] = useState([]);
  const [counts, setCounts]             = useState({ PENDING: 0, PUBLISHED: 0, REJECTED: 0 });
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);
  const [page, setPage]                 = useState(1);
  const [filterLang, setFilterLang]     = useState('');
  const [filterType, setFilterType]     = useState('');
  const [search, setSearch]             = useState('');
  const [languages, setLanguages]       = useState([]);
  const [selected, setSelected]         = useState(null);   // contrib ouverte dans la modal
  const LIMIT = 15;

  // ─── Chargement ──────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    const params = { status, page, limit: LIMIT };
    if (filterLang) params.languageId = filterLang;
    if (filterType) params.type = filterType;
    if (search)     params.search = search;
    contributionsAPI.getAll(params)
      .then(({ data }) => {
        setContributions(data.data || []);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  // Compteurs par statut (pour les badges)
  const loadCounts = () => {
    Promise.all(
      ['PENDING', 'PUBLISHED', 'REJECTED'].map(s =>
        contributionsAPI.getAll({ status: s, limit: 1 }).then(r => ({ s, t: r.data.total || 0 })).catch(() => ({ s, t: 0 }))
      )
    ).then(results => {
      const m = {};
      results.forEach(r => { m[r.s] = r.t; });
      setCounts(m);
    });
  };

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
    loadCounts();
  }, []);

  useEffect(() => { setPage(1); }, [status, filterLang, filterType, search]);
  useEffect(() => { load(); }, [status, page, filterLang, filterType, search]);

  // ─── Modération ──────────────────────────────────────────────────────────
  const moderate = async (id, action, commentaire) => {
    try {
      await contributionsAPI.moderate(id, { action, commentaire: commentaire || undefined });
      toast.success(action === 'PUBLISHED' ? '✅ Contribution approuvée !' : '❌ Contribution rejetée.');
      load(); loadCounts();
    } catch { toast.error('Une erreur est survenue.'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤝 Contributions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vérifiez et modérez les mots &amp; phrases soumis par la communauté
          </p>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card py-3 px-5 border-l-4 border-amber-400">
          <p className="text-2xl font-bold text-amber-600">{counts.PENDING}</p>
          <p className="text-sm text-gray-500">En attente de modération</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-green-400">
          <p className="text-2xl font-bold text-green-600">{counts.PUBLISHED}</p>
          <p className="text-sm text-gray-500">Approuvées &amp; publiées</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-red-400">
          <p className="text-2xl font-bold text-red-500">{counts.REJECTED}</p>
          <p className="text-sm text-gray-500">Rejetées</p>
        </div>
      </div>

      {/* ── Onglets statut ──────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
        {STATUTS.map(s => (
          <button key={s.key}
            onClick={() => setStatus(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              status === s.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {s.label}
            {counts[s.key] > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                status === s.key
                  ? s.key === 'PENDING' ? 'bg-amber-100 text-amber-700' : s.key === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[s.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Filtres ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un mot, une phrase…"
            className="input pl-9 w-56"/>
        </div>
        <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-48" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
          <option value="">Tous les types</option>
          <option value="WORD">Mots</option>
          <option value="PHRASE">Phrases</option>
          <option value="IMAGE">Images</option>
        </select>
        <span className="ml-auto text-sm text-gray-400">
          {total} contribution{total > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Alerte En attente ─────────────────────────────────────────── */}
      {status === 'PENDING' && counts.PENDING > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0"/>
          <span>
            <strong>{counts.PENDING} contribution{counts.PENDING > 1 ? 's' : ''}</strong> att{counts.PENDING > 1 ? 'endent' : 'end'} une décision.
            Cliquez sur une contribution pour voir son contenu complet avant de décider.
          </span>
        </div>
      )}

      {/* ── Liste ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}
        </div>
      ) : contributions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🤝</p>
          <p className="text-gray-400 font-medium">Aucune contribution dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contributions.map(c => {
            const type = TYPE_LABELS[c.type] || { label: c.type, color: 'bg-gray-100 text-gray-600' };
            const cont = c.contenu || {};
            const hasAudio = cont.audioUrl || cont.audioUrlFr;
            const hasImage = cont.imageUrl || c.imageUrl;

            return (
              <button key={c.id}
                onClick={() => setSelected(c)}
                className="w-full card hover:shadow-md hover:border-primary-200 transition-all text-left group border border-transparent">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges ligne 1 */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`badge ${type.color}`}>{type.label}</span>
                      <span className="badge bg-gray-100 text-gray-600">{c.language?.nom || '—'}</span>
                      {hasAudio && <SpeakerWaveIcon className="w-3.5 h-3.5 text-purple-400" title="Contient un audio"/>}
                      {hasImage && <PhotoIcon className="w-3.5 h-3.5 text-blue-400" title="Contient une image"/>}
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5"/>
                        {fmtDate(c.createdAt)}
                      </span>
                    </div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-bold text-gray-900 text-base">
                          {cont.mot || cont.phrase || '—'}
                        </span>
                        {cont.transcription && (
                          <span className="text-gray-400 italic ml-2 text-xs">[{cont.transcription}]</span>
                        )}
                      </div>
                      <div className="text-gray-600">{cont.traduction || '—'}</div>
                    </div>

                    {/* Contexte (aperçu) */}
                    {cont.contexte && (
                      <p className="text-xs text-gray-400 italic mt-1.5 truncate">💬 "{cont.contexte}"</p>
                    )}

                    {/* Contributeur */}
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <UserCircleIcon className="w-3.5 h-3.5"/>
                      {c.user?.prenom} {c.user?.nom}
                    </p>
                  </div>

                  {/* Actions rapides PENDING + bouton Voir */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1.5 text-xs text-primary-500 group-hover:text-primary-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <EyeIcon className="w-3.5 h-3.5"/> Voir le détail
                    </span>
                    {status === 'PENDING' && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => moderate(c.id, 'PUBLISHED', '')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors">
                          <CheckCircleIcon className="w-3.5 h-3.5"/> Approuver
                        </button>
                        <button
                          onClick={() => setSelected(c)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">
                          <XCircleIcon className="w-3.5 h-3.5"/> Rejeter…
                        </button>
                      </div>
                    )}
                    {c.status === 'REJECTED' && c.commentaire && (
                      <p className="text-xs text-red-500 max-w-[200px] text-right truncate" title={c.commentaire}>
                        {c.commentaire}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-1 py-1.5 px-3 text-sm"
              onClick={() => setPage(p => p - 1)} disabled={page === 1}>
              <ChevronLeftIcon className="w-4 h-4"/> Précédent
            </button>
            <button className="btn-secondary flex items-center gap-1 py-1.5 px-3 text-sm"
              onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
              Suivant <ChevronRightIcon className="w-4 h-4"/>
            </button>
          </div>
        </div>
      )}

      {/* ── Modal détail / modération ──────────────────────────────────── */}
      <ModalDetail
        contrib={selected}
        onClose={() => setSelected(null)}
        onModerate={moderate}
      />
    </div>
  );
}
