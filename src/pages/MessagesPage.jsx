import { useEffect, useState, useCallback, useRef } from 'react';
import { supportAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon,
  ClockIcon, XMarkIcon, PaperAirplaneIcon, InformationCircleIcon,
  ArrowPathIcon, LockClosedIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const STATUT_CONFIG = {
  OUVERT:   { label: 'Ouvert',   bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-400',   icon: EnvelopeIcon },
  EN_COURS: { label: 'En cours', bg: 'bg-orange-100',  text: 'text-orange-700', border: 'border-orange-400', icon: ClockIcon },
  RESOLU:   { label: 'Résolu',   bg: 'bg-green-100',   text: 'text-green-700',  border: 'border-green-400',  icon: CheckCircleIcon },
};

const STATUTS = ['OUVERT', 'EN_COURS', 'RESOLU'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function MessagesPage() {
  const [statut, setStatut]       = useState('OUVERT');
  const [messages, setMessages]   = useState([]);
  const [counts, setCounts]       = useState({ OUVERT: 0, EN_COURS: 0, RESOLU: 0 });
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatut, setNewStatut] = useState('EN_COURS');
  const [sending, setSending]     = useState(false);
  const [search, setSearch]       = useState('');
  const replyRef = useRef(null);

  /* ── Chargement des counts pour les 3 onglets ── */
  const loadCounts = useCallback(() => {
    Promise.all(
      STATUTS.map(s => supportAPI.getAll({ statut: s, limit: 1 }).catch(() => ({ data: { total: 0 } })))
    ).then(([ou, en, re]) => {
      setCounts({
        OUVERT:   ou.data.total   ?? ou.data.data?.length ?? 0,
        EN_COURS: en.data.total   ?? en.data.data?.length ?? 0,
        RESOLU:   re.data.total   ?? re.data.data?.length ?? 0,
      });
    });
  }, []);

  /* ── Chargement des messages de l'onglet actif ── */
  const load = useCallback(() => {
    setLoading(true);
    setSelected(null);
    supportAPI.getAll({ statut, limit: 200 })
      .then(({ data }) => setMessages(data.data ?? []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [statut]);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { load(); setSearch(''); }, [statut]);

  const openThread = (msg, scrollToReply = false) => {
    setSelected(msg);
    setReplyText('');
    setNewStatut(msg.statut === 'OUVERT' ? 'EN_COURS' : msg.statut === 'RESOLU' ? 'RESOLU' : msg.statut);
    if (scrollToReply) {
      setTimeout(() => replyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await supportAPI.reply(selected.id, { corps: replyText.trim(), statut: newStatut });
      toast.success('Réponse envoyée — l\'utilisateur a été notifié');
      setSelected(null);
      load();
      loadCounts();
    } catch {
      toast.error('Erreur lors de l\'envoi');
    } finally { setSending(false); }
  };

  const changeStatut = async (id, s) => {
    try {
      await supportAPI.updateStatus(id, { statut: s });
      toast.success('Statut mis à jour');
      load();
      loadCounts();
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error('Erreur');
    }
  };

  /* ── Filtrage local par recherche ── */
  const filtered = messages.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.sujet?.toLowerCase().includes(q) ||
      m.corps?.toLowerCase().includes(q) ||
      m.user?.prenom?.toLowerCase().includes(q) ||
      m.user?.nom?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q)
    );
  });

  /* ── Stats cards ── */
  const totalResolu = counts.RESOLU;
  const totalActifs = counts.OUVERT + counts.EN_COURS;

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
            <EnvelopeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages des utilisateurs</h1>
            <p className="text-gray-500 text-sm mt-0.5">Support et assistance à la communauté</p>
          </div>
        </div>
      </div>

      {/* Bannière info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Les utilisateurs envoient des messages depuis leur profil dans l'application.
          Répondez ici — ils reçoivent une <strong>notification push</strong> et voient la réponse dans leurs messages.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.OUVERT}</p>
          <p className="text-xs text-gray-500 mt-1">Ouverts</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-500">{counts.EN_COURS}</p>
          <p className="text-xs text-gray-500 mt-1">En cours</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{totalResolu}</p>
          <p className="text-xs text-gray-500 mt-1">Résolus</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-700">{totalActifs}</p>
          <p className="text-xs text-gray-500 mt-1">À traiter</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
        {STATUTS.map(s => {
          const conf = STATUT_CONFIG[s];
          const count = counts[s];
          return (
            <button key={s}
              onClick={() => setStatut(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statut === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {conf.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  statut === s
                    ? `${conf.bg} ${conf.text}`
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un message…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9 text-sm"
        />
      </div>

      {/* Layout : liste + thread */}
      <div className="flex gap-4">
        {/* Liste */}
        <div className={`${selected ? 'w-1/2' : 'w-full'} space-y-3 transition-all`}>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              {statut === 'RESOLU' ? (
                <>
                  <CheckCircleIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Aucun message résolu</p>
                  <p className="text-xs mt-1">Les messages traités apparaîtront ici</p>
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Aucun message dans cette catégorie</p>
                </>
              )}
            </div>
          ) : filtered.map(msg => {
            const conf = STATUT_CONFIG[msg.statut] || STATUT_CONFIG.OUVERT;
            const Icon = conf.icon;
            const isResolu = msg.statut === 'RESOLU';
            return (
              <div key={msg.id}
                onClick={() => openThread(msg)}
                className={`card cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  selected?.id === msg.id
                    ? `border-l-primary-500 bg-primary-50/30`
                    : isResolu
                    ? 'border-l-green-400 bg-green-50/20'
                    : 'border-l-transparent'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isResolu ? 'bg-green-100' : 'bg-primary-100'
                  }`}>
                    {isResolu
                      ? <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      : <span className="text-sm font-bold text-primary-600">
                          {msg.user?.prenom?.[0]}{msg.user?.nom?.[0]}
                        </span>
                    }
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
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                      {msg.reponses?.length > 0 && (
                        <span className={`text-xs font-medium flex items-center gap-1 ${isResolu ? 'text-green-600' : 'text-primary-600'}`}>
                          <ChatBubbleLeftEllipsisIcon className="w-3 h-3" />
                          {msg.reponses.length} réponse{msg.reponses.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {isResolu && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openThread(msg, true); }}
                          className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 hover:underline">
                          ↩ Continuer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thread de détail */}
        {selected && (
          <div className="w-1/2 card h-fit sticky top-4">
            {/* En-tête thread */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge text-xs ${STATUT_CONFIG[selected.statut]?.bg} ${STATUT_CONFIG[selected.statut]?.text}`}>
                    {(() => { const Icon = STATUT_CONFIG[selected.statut]?.icon; return <Icon className="w-3 h-3 inline mr-1" />; })()}
                    {STATUT_CONFIG[selected.statut]?.label}
                  </span>
                  {selected.statut === 'RESOLU' && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <LockClosedIcon className="w-3 h-3" /> Traité
                    </span>
                  )}
                </div>
                <p className="font-bold text-gray-900">{selected.sujet}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.user?.prenom} {selected.user?.nom} · {selected.user?.email} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Bannière RÉSOLU */}
            {selected.statut === 'RESOLU' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800">Message traité et résolu</p>
                  <p className="text-xs text-green-600">Ce message a été pris en charge et marqué comme résolu.</p>
                </div>
                <button
                  onClick={() => changeStatut(selected.id, 'OUVERT')}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors font-medium flex-shrink-0">
                  <ArrowPathIcon className="w-3 h-3" /> Réouvrir
                </button>
              </div>
            )}

            {/* Message original */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Message original</p>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{selected.corps}</p>
            </div>

            {/* Historique des réponses */}
            {selected.reponses?.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Conversation ({selected.reponses.length} réponse{selected.reponses.length > 1 ? 's' : ''})
                </p>
                {selected.reponses.map((r, idx) => (
                  <div key={r.id ?? idx} className={`rounded-xl p-3 border ${
                    r.auteur === 'ADMIN'
                      ? 'bg-primary-50 border-primary-100'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${r.auteur === 'ADMIN' ? 'text-primary-600' : 'text-gray-500'}`}>
                      {r.auteur === 'ADMIN' ? 'Équipe Langues Ivoire' : `${selected.user?.prenom} ${selected.user?.nom}`}
                      {' · '}{formatDate(r.createdAt)}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-line">{r.corps}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Zone de réponse — toujours disponible même pour RÉSOLU */}
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {selected.statut === 'RESOLU' ? 'Ajouter un commentaire de suivi' : 'Votre réponse'}
              </label>
              <textarea
                ref={replyRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={4}
                className="input resize-none mb-3 text-sm"
                placeholder={
                  selected.statut === 'RESOLU'
                    ? 'Ajouter une note ou un complément d\'information…'
                    : 'Écrivez votre réponse ici…'
                }
              />

              <div className="flex items-end gap-3">
                {selected.statut !== 'RESOLU' && (
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Changer le statut</label>
                    <select className="input text-sm py-1.5" value={newStatut}
                      onChange={e => setNewStatut(e.target.value)}>
                      <option value="EN_COURS">En cours</option>
                      <option value="RESOLU">Résolu</option>
                      <option value="OUVERT">Remettre ouvert</option>
                    </select>
                  </div>
                )}
                {selected.statut === 'RESOLU' && <div className="flex-1" />}
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {sending ? 'Envoi…' : 'Envoyer'}
                </button>
              </div>
            </div>

            {/* Actions rapides — uniquement si non résolu */}
            {selected.statut !== 'RESOLU' && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                {selected.statut === 'OUVERT' && (
                  <button onClick={() => changeStatut(selected.id, 'EN_COURS')}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                    <ClockIcon className="w-4 h-4" />
                    Passer en cours (sans répondre)
                  </button>
                )}
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
