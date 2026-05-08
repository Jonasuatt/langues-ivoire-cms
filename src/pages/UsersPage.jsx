import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, KeyIcon, PlusIcon } from '@heroicons/react/24/outline';

const ALL_ROLES = ['USER', 'CONTRIBUTOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'];
const ROLE_COLORS = {
  USER: 'bg-gray-100 text-gray-600',
  CONTRIBUTOR: 'bg-blue-100 text-blue-700',
  EDITOR: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-red-100 text-red-700',
  SUPER_ADMIN: 'bg-orange-100 text-orange-700',
};

const EMPTY_CREATE = { nom: '', prenom: '', email: '', motDePasse: '', role: 'CONTRIBUTOR' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Password reset modal
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  // Create member modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined })
      .then(({ data }) => { setUsers(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [search, roleFilter]);
  useEffect(() => { load(); }, [page, search, roleFilter]);

  const updateRole = async (id, role) => {
    try {
      await adminAPI.updateUser(id, { role });
      toast.success('Rôle mis à jour');
      load();
    } catch { toast.error('Erreur'); }
  };

  const togglePremium = async (id, isPremium) => {
    try {
      await adminAPI.updateUser(id, { isPremium: !isPremium });
      toast.success('Statut Premium mis à jour');
      load();
    } catch { toast.error('Erreur'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setResetting(true);
    try {
      await adminAPI.updateUser(resetTarget.id, { newMotDePasse: newPassword });
      toast.success(`Mot de passe réinitialisé pour ${resetTarget.email}`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  const handleCreateMember = async () => {
    if (!createForm.nom || !createForm.prenom || !createForm.email || !createForm.motDePasse) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }
    setCreating(true);
    try {
      await adminAPI.createMember(createForm);
      toast.success('Compte créé avec succès');
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  // Roles assignable by current user
  const assignableRoles = isSuperAdmin ? ALL_ROLES : ALL_ROLES.filter(r => r !== 'SUPER_ADMIN');

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} comptes au total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Créer un compte
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher par nom ou email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-44" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Premium', 'Streak', 'Contribs', 'Dernière activité', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</td></tr>
              ) : users.map(u => {
                const canEditRole = isSuperAdmin || u.role !== 'SUPER_ADMIN';
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <span className="font-medium">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      {canEditRole ? (
                        <select
                          className={`text-xs border border-gray-200 rounded-lg px-2 py-1 font-medium ${ROLE_COLORS[u.role] || ''}`}
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value)}>
                          {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100'}`}>{u.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => togglePremium(u.id, u.isPremium)}
                        className={`badge cursor-pointer ${u.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isPremium ? '⭐ Premium' : 'Gratuit'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-accent">{u.streak}🔥</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {u._count?.contributions ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdmin && (
                        <button
                          onClick={() => { setResetTarget(u); setNewPassword(''); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                          title="Réinitialiser le mot de passe">
                          <KeyIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Math.ceil(total / 20) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} / {Math.ceil(total / 20)}</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Précédent</button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Suivant →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal réinitialisation mot de passe */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Réinitialiser le mot de passe</h2>
            <p className="text-sm text-gray-500 mb-4">{resetTarget.email}</p>
            <input
              type="password"
              className="input mb-4"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleResetPassword} disabled={resetting} className="btn-primary flex-1 justify-center">
                {resetting ? 'En cours...' : 'Réinitialiser'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal créer un compte */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Créer un compte</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input className="input" value={createForm.prenom}
                    onChange={e => setCreateForm({ ...createForm, prenom: e.target.value })} placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input className="input" value={createForm.nom}
                    onChange={e => setCreateForm({ ...createForm, nom: e.target.value })} placeholder="Nom" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input" value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input type="password" className="input" value={createForm.motDePasse}
                  onChange={e => setCreateForm({ ...createForm, motDePasse: e.target.value })} placeholder="Minimum 8 caractères" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select className="input" value={createForm.role}
                  onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                  {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); }} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleCreateMember} disabled={creating} className="btn-primary flex-1 justify-center">
                {creating ? 'Création...' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
