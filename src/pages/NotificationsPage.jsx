import { useEffect, useState } from 'react';
import { notificationsAdminAPI, adminAPI } from '../services/api';
import { BellIcon, PaperAirplaneIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'SYSTEM', label: '📢 Système (annonce générale)' },
  { value: 'LESSON', label: '📚 Nouvelle leçon disponible' },
  { value: 'REMINDER', label: '⏰ Rappel d\'apprentissage' },
  { value: 'BADGE', label: '🏅 Badge / Récompense' },
  { value: 'CULTURAL', label: '🎭 Événement culturel' },
];

const EMPTY_FORM = { titre: '', corps: '', type: 'SYSTEM', targetUserId: '' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

export default function NotificationsPage() {
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const [form, setForm] = useState(EMPTY_FORM);
  const [targetMode, setTargetMode] = useState('all'); // 'all' | 'user'
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);

  const [page, setPage] = useState(1);
  const [totalHist, setTotalHist] = useState(0);

  const loadHistory = () => {
    setHistLoading(true);
    notificationsAdminAPI.getHistory({ page, limit: 10 })
      .then(({ data }) => {
        setHistory(data.data || []);
        setTotalHist(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  };

  useEffect(() => {
    loadHistory();
    adminAPI.getUsers({ limit: 1 })
      .then(({ data }) => setTotalUsers(data.total || 0))
      .catch(() => {});
  }, [page]);

  const handleSend = async () => {
    if (!form.titre.trim() || !form.corps.trim()) {
      toast.error('Titre et contenu sont requis');
      return;
    }
    if (targetMode === 'user' && !form.targetUserId.trim()) {
      toast.error("Veuillez saisir l'ID ou l'email de l'utilisateur cible");
      return;
    }
    setSending(true);
    try {
      const payload = {
        titre: form.titre.trim(),
        corps: form.corps.trim(),
        type: form.type,
        ...(targetMode === 'user' ? { targetUserId: form.targetUserId.trim() } : {}),
      };
      const { data } = await notificationsAdminAPI.send(payload);
      const sent = data.sent ?? 1;
      toast.success(`✅ Notification envoyée à ${sent} utilisateur${sent > 1 ? 's' : ''}`);
      setForm(EMPTY_FORM);
      setTargetMode('all');
      setPreview(false);
      loadHistory();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const recentSends = history.length;
  const totalReadCount = history.reduce((s, n) => s + (n.readCount || 0), 0);
  const totalRecipients = history.reduce((s, n) => s + (n.totalRecipients || 0), 0);
  const tauxOuverture = totalRecipients > 0 ? Math.round((totalReadCount / totalRecipients) * 100) : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellIcon className="w-7 h-7 text-blue-500" />
            Notifications Push
          </h1>
          <p className="text-gray-500 text-sm mt-1">Envoyez des notifications ciblées aux utilisateurs de l'application mobile</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-gray-800">{recentSends}</p>
          <p className="text-sm text-gray-500">Envois récents (historique)</p>
        </div>
        <div className="card py-3 px-5">
          <p className="text-2xl font-bold text-blue-600">{tauxOuverture}%</p>
          <p className="text-sm text-gray-500">Taux d'ouverture estimé</p>
        </div>
        <div className="card py-3 px-5 flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Utilisateurs inscrits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer une notification */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-blue-500" />
            Composer une notification
          </h2>

          {/* Cible */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
            <div className="flex gap-2">
              <button onClick={() => setTargetMode('all')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  targetMode === 'all' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                👥 Tous les utilisateurs
              </button>
              <button onClick={() => setTargetMode('user')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  targetMode === 'user' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                👤 Utilisateur ciblé
              </button>
            </div>
            {targetMode === 'user' && (
              <input className="input mt-2" value={form.targetUserId}
                onChange={e => setForm({ ...form, targetUserId: e.target.value })}
                placeholder="ID de l'utilisateur (UUID)" />
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de notification</label>
              <select className="input" value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input className="input" value={form.titre}
                onChange={e => setForm({ ...form, titre: e.target.value })}
                placeholder="ex: Nouvelle leçon de Dioula disponible !" maxLength={100} />
              <p className="text-xs text-gray-400 mt-0.5 text-right">{form.titre.length}/100</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
              <textarea className="input h-24 resize-none" value={form.corps}
                onChange={e => setForm({ ...form, corps: e.target.value })}
                placeholder="ex: Une nouvelle leçon sur les salutations en Dioula vous attend. Commencez dès maintenant !" maxLength={300} />
              <p className="text-xs text-gray-400 mt-0.5 text-right">{form.corps.length}/300</p>
            </div>
          </div>

          {/* Aperçu */}
          {(form.titre || form.corps) && (
            <div className="mt-4 bg-gray-900 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                  <BellIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs text-gray-400">Langues Ivoire • Maintenant</span>
              </div>
              <p className="text-sm font-semibold">{form.titre || 'Titre de la notification'}</p>
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">{form.corps || 'Contenu de la notification'}</p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setForm(EMPTY_FORM)} className="btn-secondary flex-1">Effacer</button>
            <button onClick={handleSend} disabled={sending || !form.titre || !form.corps}
              className="btn-primary flex-1 justify-center flex items-center gap-2">
              {sending ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Envoi en cours...</>
              ) : (
                <><PaperAirplaneIcon className="w-4 h-4" />Envoyer{targetMode === 'all' ? ` à tous (${totalUsers})` : ''}</>
              )}
            </button>
          </div>
        </div>

        {/* Historique */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            Historique des envois
          </h2>
          {histLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <BellIcon className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Aucune notification envoyée</p>
              <p className="text-xs mt-1">Les envois apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(n => (
                <div key={n.id} className="border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.titre}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{n.corps}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>📤 {n.totalRecipients} destinataire{n.totalRecipients > 1 ? 's' : ''}</span>
                    <span>👁️ {n.readCount} lu{n.readCount > 1 ? 's' : ''}</span>
                    {n.totalRecipients > 0 && (
                      <span className="ml-auto text-blue-600 font-medium">
                        {Math.round((n.readCount / n.totalRecipients) * 100)}% ouverture
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination historique */}
          {Math.ceil(totalHist / 10) > 1 && (
            <div className="flex items-center justify-between mt-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-xs py-1.5 px-3">← Prec.</button>
              <span className="text-xs text-gray-500">Page {page} / {Math.ceil(totalHist / 10)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= totalHist}
                className="btn-secondary text-xs py-1.5 px-3">Suiv. →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
