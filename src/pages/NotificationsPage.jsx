import { useState, useEffect } from 'react';
import {
  BellIcon, PaperAirplaneIcon, UsersIcon,
  ClockIcon, CheckCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { adminNotificationsAPI, adminAPI } from '../services/api';

const TYPES = ['SYSTEM', 'BADGE', 'STREAK', 'LESSON', 'PROMO'];

const TYPE_COLORS = {
  SYSTEM:  'bg-gray-100 text-gray-700',
  BADGE:   'bg-amber-100 text-amber-700',
  STREAK:  'bg-orange-100 text-orange-700',
  LESSON:  'bg-blue-100 text-blue-700',
  PROMO:   'bg-purple-100 text-purple-700',
};

const TEMPLATES = [
  { label: '📚 Nouvelle leçon disponible', titre: 'Nouvelle leçon disponible !', corps: 'Une nouvelle leçon vient d\'être ajoutée. Venez l\'essayer maintenant !' },
  { label: '🔥 Rappel de streak', titre: 'N\'oubliez pas votre streak !', corps: 'Vous avez un streak actif. Connectez-vous aujourd\'hui pour ne pas le perdre !' },
  { label: '🏆 Nouveau badge', titre: 'Un nouveau badge vous attend !', corps: 'Continuez votre progression pour débloquer de nouveaux badges.' },
  { label: '🎉 Message de bienvenue', titre: 'Bienvenue sur Langues Ivoire !', corps: 'Merci de rejoindre notre communauté. Commencez votre apprentissage dès aujourd\'hui !' },
];

export default function NotificationsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    titre: '', corps: '', type: 'SYSTEM', targetUserId: '',
  });
  const [sent, setSent] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await adminNotificationsAPI.getHistory();
      setHistory(res.data.data || []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 200 });
      setUsers(res.data.data || []);
    } catch { /* silencieux */ }
  };

  useEffect(() => { loadHistory(); loadUsers(); }, []);

  const applyTemplate = (tpl) => {
    setForm(f => ({ ...f, titre: tpl.titre, corps: tpl.corps }));
    setSent(null);
  };

  const handleSend = async () => {
    if (!form.titre.trim() || !form.corps.trim()) return;
    setSending(true);
    setSent(null);
    try {
      const payload = {
        titre: form.titre,
        corps: form.corps,
        type: form.type,
        targetUserId: form.targetUserId || undefined,
      };
      const res = await adminNotificationsAPI.send(payload);
      setSent({ success: true, count: res.data.sent });
      setForm(f => ({ ...f, titre: '', corps: '' }));
      await loadHistory();
    } catch (e) {
      setSent({ success: false, msg: e.response?.data?.error || 'Erreur lors de l\'envoi' });
    } finally {
      setSending(false);
    }
  };

  const charsLeft = 200 - (form.corps?.length || 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BellIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Push</h1>
          <p className="text-sm text-gray-500">Envoyez des messages à tous les utilisateurs ou à un utilisateur ciblé</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire d'envoi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-primary-500" />
            Composer une notification
          </h2>

          {/* Templates */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Modèles rapides</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map(t => (
                <button key={t.label} onClick={() => applyTemplate(t)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-full transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
                <span className="ml-1 text-xs text-gray-400">(vide = tous les utilisateurs)</span>
              </label>
              <select value={form.targetUserId} onChange={e => setForm(f => ({ ...f, targetUserId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">📢 Tous les utilisateurs</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom} — {u.email}</option>
                ))}
              </select>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input type="text" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                maxLength={80}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Titre de la notification..." />
            </div>

            {/* Corps */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Message *</label>
                <span className={`text-xs ${charsLeft < 20 ? 'text-red-500' : 'text-gray-400'}`}>
                  {charsLeft} caractères restants
                </span>
              </div>
              <textarea value={form.corps} onChange={e => setForm(f => ({ ...f, corps: e.target.value }))}
                rows={4} maxLength={200}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Corps du message..." />
            </div>

            {/* Aperçu */}
            {(form.titre || form.corps) && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-medium">Aperçu</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BellIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{form.titre || 'Titre'}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{form.corps || 'Message...'}</p>
                  </div>
                </div>
              </div>
            )}

            {sent && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${sent.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {sent.success ? <CheckCircleIcon className="w-4 h-4" /> : <XMarkIcon className="w-4 h-4" />}
                {sent.success ? `✓ Notification envoyée à ${sent.count} utilisateur${sent.count !== 1 ? 's' : ''}` : sent.msg}
              </div>
            )}

            <button onClick={handleSend}
              disabled={sending || !form.titre.trim() || !form.corps.trim()}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {sending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <PaperAirplaneIcon className="w-4 h-4" />}
              {form.targetUserId ? 'Envoyer à cet utilisateur' : 'Envoyer à tous'}
            </button>
          </div>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            Historique des envois
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BellIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune notification envoyée pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.map(n => (
                <div key={n.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 flex-1">{n.titre}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'}`}>
                      {n.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{n.corps}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        {n.totalRecipients} destinataire{n.totalRecipients !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        {n.readCount} lu{n.readCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span>{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
