import { useEffect, useState } from 'react';
import { supportAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon,
  ClockIcon, XMarkIcon, PaperAirplaneIcon, InformationCircleIcon,
} from '@heroicons/react/24/outline';

const STATUT_CONFIG = {
  OUVERT:   { label: 'Ouvert',    bg: 'bg-blue-100',  text: 'text-blue-700',  icon: EnvelopeIcon },
  EN_COURS: { label: 'En cours',  bg: 'bg-orange-100', text: 'text-orange-700', icon: ClockIcon },
  RESOLU:   { label: 'Résolu',    bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircleIcon },
};

const STATUTS = ['OUVERT', 'EN_COURS', 'RESOLU'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function MessagesPage() {
  const [statut, setStatut] = useState('OUVERT');
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatut, setNewStatut] = useState('EN_COURS');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    supportAPI.getAll({ statut })
      .then(({ data }) => { setMessages(data.data); setTotal(data.total); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statut]);

  const openThread = (msg) => {
    setSelected(msg);
    setReplyText('');
    setNewStatut(msg.statut === 'OUVERT' ? 'EN_COURS' : msg.statut);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await supportAPI.reply(selected.id, { corps: replyText.trim(), statut: newStatut });
      toast.success('Réponse envoyée — l\'utilisateur a été notifié');
      setSelected(null);
      load();
    } catch {
      toast.error('Erreur lors de l\'envoi');
    } finally { setSending(false); }
  };

  const changeStatut = async (id, s) => {
    try {
      await supportAPI.updateStatus(id, { statut: s });
      toast.success('Statut mis à jour');
      load();
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error('Erreur');
    }
  };

  const counts = { OUVERT: 0, EN_COURS: 0, RESOLU: 0 };
  messages.forEach(m => { if (counts[m.statut] !== undefined) counts[m.statut]++; });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages des utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} message(s) reçu(s)</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Les utilisateurs peuvent vous envoyer des messages privés depuis leur profil dans l'application.
          Répondez ici — ils recevront une <strong>notification push</strong> et verront votre réponse dans leurs messages.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {STATUTS.map(s => {
          const conf = STATUT_CONFIG[s];
          return (
            <button key={s}
              onClick={() => setStatut(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statut === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {conf.label}
            </button>
          );
        })}
      </div>

      {/* Layout : liste + thread */}
      <div className="flex gap-4">
        {/* Liste */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} space-y-3`}>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              <EnvelopeIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Aucun message dans cette catégorie</p>
            </div>
          ) : messages.map(msg => {
            const conf = STATUT_CONFIG[msg.statut] || STATUT_CONFIG.OUVERT;
            const Icon = conf.icon;
            return (
              <div key={msg.id}
                onClick={() => openThread(msg)}
                className={`card cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  selected?.id === msg.id ? 'border-l-primary-500 bg-primary-50/30' : 'border-l-transparent'
                }`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">
                      {msg.user?.prenom?.[0]}{msg.user?.nom?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {msg.user?.prenom} {msg.user?.nom}
                      </span>
                      <span className="text-xs text-gray-400">{msg.user?.email}</span>
                      <span className={`badge ml-auto text-xs ${conf.bg} ${conf.text}`}>
                        <Icon className="w-3 h-3 inline mr-1" />{conf.label}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 mt-1 text-sm">{msg.sujet}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{msg.corps}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                      {msg.reponses?.length > 0 && (
                        <span className="text-xs text-primary-600 font-medium">
                          <ChatBubbleLeftEllipsisIcon className="w-3 h-3 inline mr-1" />
                          {msg.reponses.length} réponse(s)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thread de réponse */}
        {selected && (
          <div className="w-1/2 card h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900">{selected.sujet}</p>
                <p className="text-xs text-gray-500">
                  de {selected.user?.prenom} {selected.user?.nom} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Message original */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Message</p>
              <p className="text-sm text-gray-800 leading-relaxed">{selected.corps}</p>
            </div>

            {/* Historique des réponses */}
            {selected.reponses?.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Historique</p>
                {selected.reponses.map(r => (
                  <div key={r.id} className="bg-primary-50 rounded-xl p-3 border border-primary-100">
                    <p className="text-xs text-primary-600 font-medium mb-1">
                      Équipe Langues Ivoire · {formatDate(r.createdAt)}
                    </p>
                    <p className="text-sm text-gray-800">{r.corps}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Répondre */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Votre réponse</label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                className="input resize-none mb-3 text-sm"
                placeholder="Écrivez votre réponse ici..."
              />

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Changer le statut</label>
                  <select className="input text-sm py-1.5" value={newStatut}
                    onChange={e => setNewStatut(e.target.value)}>
                    <option value="EN_COURS">En cours</option>
                    <option value="RESOLU">Résolu</option>
                    <option value="OUVERT">Remettre ouvert</option>
                  </select>
                </div>
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className="btn-primary flex items-center gap-2 mt-4 disabled:opacity-50">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {sending ? 'Envoi…' : 'Envoyer'}
                </button>
              </div>
            </div>

            {/* Actions rapides de statut */}
            {selected.statut !== 'RESOLU' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => changeStatut(selected.id, 'RESOLU')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <CheckCircleIcon className="w-4 h-4" />
                  Marquer comme résolu (sans répondre)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
