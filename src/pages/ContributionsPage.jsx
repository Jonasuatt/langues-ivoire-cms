import { useEffect, useState } from 'react';
import { contributionsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const STATUS_TABS = ['PENDING', 'PUBLISHED', 'REJECTED'];
const STATUS_LABELS = { PENDING: 'En attente', PUBLISHED: 'Approuvées', REJECTED: 'Rejetées' };

export default function ContributionsPage() {
  const [status, setStatus] = useState('PENDING');
  const [contributions, setContributions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Modale de rejet
  const [rejectModal, setRejectModal] = useState(null); // { id } ou null
  const [rejectCommentaire, setRejectCommentaire] = useState('');

  const load = () => {
    setLoading(true);
    contributionsAPI.getAll({ status, page, limit: 15 })
      .then(({ data }) => { setContributions(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [status]);
  useEffect(() => { load(); }, [status, page]);

  const moderate = async (id, action, commentaire) => {
    try {
      await contributionsAPI.moderate(id, { action, commentaire });
      toast.success(action === 'PUBLISHED' ? 'Contribution approuvée !' : 'Contribution rejetée.');
      load();
    } catch {
      toast.error('Une erreur est survenue.');
    }
  };

  const openRejectModal = (id) => {
    setRejectCommentaire('');
    setRejectModal({ id });
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    await moderate(rejectModal.id, 'REJECTED', rejectCommentaire || undefined);
    setRejectModal(null);
  };

  return (
    <div className="p-8">
      {/* Modale de rejet */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Motif du rejet</h2>
            <p className="text-sm text-gray-500 mb-4">Expliquez au contributeur pourquoi sa contribution a été refusée (optionnel).</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              rows={3}
              placeholder="Ex : La traduction est incorrecte, le mot n'existe pas dans cette langue…"
              value={rejectCommentaire}
              onChange={e => setRejectCommentaire(e.target.value)}
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Annuler
              </button>
              <button
                onClick={confirmReject}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                <XCircleIcon className="w-4 h-4" /> Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Contributions de la communauté</h1>
        <p className="text-gray-500 text-sm mt-1">{total} contribution(s) reçue(s)</p>
      </div>

      {/* Aide */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-900">
          <p className="font-semibold mb-1">👥 Qu'est-ce qu'une contribution ?</p>
          <p>Les utilisateurs de l'application peuvent proposer des <strong>mots, phrases ou photos</strong> dans leur langue. Votre rôle est de <strong>vérifier et approuver</strong> les contributions correctes, ou de rejeter celles qui contiennent des erreurs. Les contributions approuvées enrichissent automatiquement le dictionnaire de l'application.</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {STATUS_TABS.map(s => (
          <button key={s}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setStatus(s)}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
        ) : contributions.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">Aucune contribution dans cette catégorie</div>
        ) : contributions.map(c => (
          <div key={c.id} className="card flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${c.type === 'WORD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {c.type === 'WORD' ? 'Mot' : c.type === 'PHRASE' ? 'Phrase' : 'Image'}
                </span>
                <span className="badge bg-gray-100 text-gray-600">{c.language?.nom}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  par {c.user?.prenom} {c.user?.nom}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-primary-500">
                    {c.contenu?.mot || c.contenu?.phrase}
                  </span>
                  {c.contenu?.transcription && (
                    <span className="text-gray-400 italic ml-2">[{c.contenu.transcription}]</span>
                  )}
                </div>
                <div className="text-gray-600">{c.contenu?.traduction}</div>
              </div>
              {c.contenu?.contexte && (
                <p className="text-xs text-gray-400 mt-1 italic">"{c.contenu.contexte}"</p>
              )}
              {c.commentaire && (
                <p className="text-xs text-red-500 mt-1">Commentaire : {c.commentaire}</p>
              )}
            </div>

            {/* Actions (uniquement pour PENDING) */}
            {status === 'PENDING' && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => moderate(c.id, 'PUBLISHED')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors">
                  <CheckCircleIcon className="w-4 h-4" /> Approuver
                </button>
                <button onClick={() => openRejectModal(c.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
                  <XCircleIcon className="w-4 h-4" /> Rejeter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {Math.ceil(total / 15) > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button className="btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Précédent</button>
          <span className="flex items-center px-4 text-sm text-gray-600">Page {page}</span>
          <button className="btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}>Suivant →</button>
        </div>
      )}
    </div>
  );
}
