import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ROLES = ['USER','CONTRIBUTOR','EDITOR','ADMIN'];
const ROLE_COLORS = { USER:'bg-gray-100 text-gray-600', CONTRIBUTOR:'bg-blue-100 text-blue-700',
  EDITOR:'bg-purple-100 text-purple-700', ADMIN:'bg-red-100 text-red-700' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} comptes au total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher par nom ou email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Premium', 'Streak', 'Contributions', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </div>
                      <span className="font-medium">{user.prenom} {user.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                      value={user.role} onChange={e => updateRole(user.id, e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePremium(user.id, user.isPremium)}
                      className={`badge cursor-pointer ${user.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                      {user.isPremium ? '⭐ Premium' : 'Gratuit'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-accent">{user.streak}🔥</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {user._count?.contributions ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400">
                      {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </span>
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
