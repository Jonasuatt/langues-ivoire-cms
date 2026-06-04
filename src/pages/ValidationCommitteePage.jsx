import { useEffect, useState, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import { committeeAPI, languagesAPI } from '../services/api';
import LanguageSelect from '../components/LanguageSelect';
import {
  CheckCircleIcon, XCircleIcon, ArrowPathIcon,
  PlayIcon, StopIcon, ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Constantes ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SUBMITTED:          { label: 'Soumis',           color: 'bg-gray-100  text-gray-600',   dot: 'bg-gray-400' },
  IN_REVIEW:          { label: 'En examen',         color: 'bg-blue-100  text-blue-700',   dot: 'bg-blue-500' },
  CERTIFIED_ILA:      { label: '✅ Certifié ILA',   color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  REVISION_REQUESTED: { label: '⚠️ Révision demandée', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  REJECTED:           { label: '❌ Rejeté',         color: 'bg-red-100   text-red-700',    dot: 'bg-red-500' },
};

const VOTE_CONFIG = {
  APPROVED:           { label: '✅ Approuvé',          color: 'text-green-600' },
  REVISION_REQUESTED: { label: '⚠️ Révision demandée', color: 'text-orange-600' },
  REJECTED:           { label: '❌ Rejeté',            color: 'text-red-600' },
};

const QUORUM = 3;

// ─── Composant AudioPlayer ─────────────────────────────────────────────────────
function AudioPlayer({ src }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); ref.current.currentTime = 0; setPlaying(false); }
    else { ref.current.play().catch(() => {}); setPlaying(true); }
  };
  return (
    <>
      <audio ref={ref} src={src} onEnded={() => setPlaying(false)} preload="none" />
      <button onClick={toggle} title={playing ? 'Arrêter' : 'Écouter'}
        className={`p-2 rounded-full transition-colors flex-shrink-0 ${playing ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary-50 text-primary-500 hover:bg-primary-100'}`}>
        {playing ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
    </>
  );
}

// ─── Composant VoteProgress ────────────────────────────────────────────────────
function VoteProgress({ votes = [] }) {
  const approved  = votes.filter(v => v.vote === 'APPROVED').length;
  const revision  = votes.filter(v => v.vote === 'REVISION_REQUESTED').length;
  const rejected  = votes.filter(v => v.vote === 'REJECTED').length;
  const total     = votes.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs">
        <span className="w-24 text-gray-500">Votes ({total}/5)</span>
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const v = votes[i];
            const color = !v ? 'bg-gray-200'
              : v.vote === 'APPROVED' ? 'bg-green-500'
              : v.vote === 'REVISION_REQUESTED' ? 'bg-orange-400'
              : 'bg-red-500';
            return <div key={i} className={`h-3 flex-1 rounded-full ${color}`} title={v?.expert?.prenom || 'Pas encore voté'} />;
          })}
        </div>
        <span className="text-green-600 font-bold">{approved}/{QUORUM}</span>
      </div>
      {votes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {votes.map(v => (
            <span key={v.id} className={`text-xs px-2 py-0.5 rounded-full border ${
              v.vote === 'APPROVED' ? 'border-green-200 bg-green-50 text-green-700'
              : v.vote === 'REVISION_REQUESTED' ? 'border-orange-200 bg-orange-50 text-orange-700'
              : 'border-red-200 bg-red-50 text-red-700'
            }`} title={v.comment || ''}>
              {v.expert?.prenom} {v.expert?.nom?.charAt(0)}.
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function ValidationCommitteePage() {
  const [languages, setLanguages]       = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState('SUBMITTED,IN_REVIEW');
  const [filterLang, setFilterLang]     = useState('');

  // Modal vote
  const [voteTarget, setVoteTarget]   = useState(null); // contribution
  const [voteType, setVoteType]       = useState('APPROVED');
  const [voteComment, setVoteComment] = useState('');
  const [voteSaving, setVoteSaving]   = useState(false);

  // Chargement
  const loadStats = () =>
    committeeAPI.getStats().then(({ data }) => setStats(data)).catch(() => {});

  const load = () => {
    setLoading(true);
    committeeAPI.getAll({
      status: filterStatus,
      langue: filterLang || undefined,
      limit: 50,
    })
      .then(({ data }) => setSubmissions(data.data || []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
    loadStats();
  }, []);

  useEffect(() => { load(); }, [filterStatus, filterLang]);

  // Soumettre un vote
  const handleVote = async () => {
    if (!voteTarget) return;
    if ((voteType === 'REVISION_REQUESTED' || voteType === 'REJECTED') && !voteComment.trim()) {
      toast.error('Un commentaire est obligatoire pour ce type de vote');
      return;
    }
    setVoteSaving(true);
    try {
      const { data } = await committeeAPI.castVote(voteTarget.id, { vote: voteType, comment: voteComment.trim() || undefined });
      toast.success(
        data.certification.newStatus === 'CERTIFIED_ILA'
          ? '🏆 Quorum atteint — Contribution CERTIFIÉE ILA !'
          : '✅ Vote enregistré'
      );
      setVoteTarget(null);
      setVoteComment('');
      setVoteType('APPROVED');
      load(); loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du vote');
    } finally { setVoteSaving(false); }
  };

  const openVoteModal = (item) => {
    // Pré-sélectionner le vote existant si l'utilisateur a déjà voté
    setVoteTarget(item);
    setVoteType('APPROVED');
    setVoteComment('');
  };

  // Filtres de statut
  const STATUS_FILTERS = [
    { value: 'SUBMITTED,IN_REVIEW', label: '🔍 À examiner' },
    { value: 'CERTIFIED_ILA',       label: '✅ Certifiés ILA' },
    { value: 'REVISION_REQUESTED',  label: '⚠️ Révisions' },
    { value: 'REJECTED',            label: '❌ Rejetés' },
    { value: 'SUBMITTED,IN_REVIEW,CERTIFIED_ILA,REVISION_REQUESTED,REJECTED', label: 'Toutes' },
  ];

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7 text-indigo-500" />
            Comité de Validation ILA
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Certifiez les contributions audio — quorum requis : <strong>3 experts sur 5</strong>
          </p>
        </div>
      </div>

      {/* Bannière info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5 text-sm text-indigo-900">
        <p className="font-semibold mb-1">🏛️ Processus de certification ILA — UFHB</p>
        <p>
          Chaque contribution audio doit obtenir <strong>3 approbations sur 5</strong> pour être marquée
          <strong> "Certifié ILA"</strong> et intégrée dans la base de référence des tuteurs et agents IA.
          Votre vote est modifiable tant que la certification n'est pas atteinte.
        </p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'À examiner',  value: stats.submitted + stats.inReview, color: 'text-blue-600', icon: ClockIcon },
            { label: 'Certifiés ILA', value: stats.certified,  color: 'text-green-600', icon: ShieldCheckIcon },
            { label: 'En révision', value: stats.revision,   color: 'text-orange-500', icon: ExclamationTriangleIcon },
            { label: 'Rejetés',     value: stats.rejected,   color: 'text-red-500',    icon: XCircleIcon },
            { label: 'Total',       value: stats.total,      color: 'text-gray-700',   icon: ChatBubbleLeftEllipsisIcon },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card text-center py-4">
              <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f.value}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === f.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setFilterStatus(f.value)}>{f.label}</button>
        ))}
        <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-44" />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="card text-center py-16">
          <ShieldCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Aucune contribution dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(item => {
            const cfg = STATUS_CONFIG[item.certificationStatus] || STATUS_CONFIG.SUBMITTED;
            const myVote = null; // le backend peut inclure ce champ plus tard
            return (
              <div key={item.id} className="card">
                <div className="flex items-start gap-4">
                  {/* Audio */}
                  <AudioPlayer src={item.audioUrl} />

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900 text-lg">{item.mot}</p>
                      {item.language && <span className="badge bg-primary-100 text-primary-700">{item.language.nom}</span>}
                      {item.categorie && <span className="badge bg-gray-100 text-gray-600">{item.categorie}</span>}
                      {item.estVoixOfficielle && (
                        <span className={`badge ${item.genreVoix === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.genreVoix === 'F' ? '♀' : '♂'} Voix officielle
                        </span>
                      )}
                      <span className={`badge ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    {item.traduction && <p className="text-sm text-gray-500 mb-2">{item.traduction}</p>}
                    <p className="text-xs text-gray-400 mb-2">
                      Par {item.user?.prenom} {item.user?.nom} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>

                    {/* Progression des votes */}
                    <VoteProgress votes={item.validationVotes || []} />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!['CERTIFIED_ILA', 'REJECTED'].includes(item.certificationStatus) && (
                      <button
                        onClick={() => openVoteModal(item)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Voter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Vote */}
      {voteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />
              Votre verdict — Comité ILA
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{voteTarget.mot}</strong> ({voteTarget.language?.nom})
            </p>

            {/* Écouter avant de voter */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5">
              <AudioPlayer src={voteTarget.audioUrl} />
              <div>
                <p className="text-sm font-semibold text-gray-800">{voteTarget.mot}</p>
                {voteTarget.traduction && <p className="text-xs text-gray-500">{voteTarget.traduction}</p>}
              </div>
            </div>

            {/* Choix du vote */}
            <div className="space-y-2 mb-4">
              {[
                ['APPROVED', '✅ Approuvé', 'Contenu conforme aux standards ILA', 'border-green-400 bg-green-50'],
                ['REVISION_REQUESTED', '⚠️ Révision demandée', 'Le contenu nécessite des corrections', 'border-orange-400 bg-orange-50'],
                ['REJECTED', '❌ Rejeté', 'Contenu non conforme, à exclure', 'border-red-400 bg-red-50'],
              ].map(([val, label, desc, activeCls]) => (
                <label key={val}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    voteType === val ? activeCls + ' ring-2 ring-offset-1 ring-indigo-400' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <input type="radio" name="voteType" value={val}
                    checked={voteType === val} onChange={() => setVoteType(val)}
                    className="mt-0.5 accent-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Commentaire */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire {(voteType !== 'APPROVED') ? <span className="text-red-500">*</span> : <span className="text-gray-400">(optionnel)</span>}
              </label>
              <textarea
                className="input h-20 resize-none"
                placeholder={voteType === 'APPROVED' ? 'Commentaire facultatif...' : 'Précisez les points à corriger...'}
                value={voteComment}
                onChange={e => setVoteComment(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setVoteTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleVote} disabled={voteSaving}
                className="btn-primary flex-1 justify-center disabled:opacity-50">
                {voteSaving ? 'Envoi...' : 'Confirmer mon vote'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHelp pageId="validation-committee" />
    </div>
  );
}
