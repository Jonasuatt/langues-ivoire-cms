import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, ShieldCheckIcon, InformationCircleIcon, UserPlusIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ROLE_LABELS, ROLE_COLORS } from '../components/Layout';

// Rôles disponibles avec description claire
const ROLES_INFO = [
  {
    value: 'USER',
    label: 'Utilisateur',
    description: 'Apprenant standard de l\'application mobile',
    color: 'bg-gray-100 text-gray-600',
  },
  {
    value: 'CONTRIBUTOR',
    label: 'Contributeur',
    description: 'Peut soumettre du vocabulaire et des traductions',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'EDITOR',
    label: 'Éditeur',
    description: 'Peut créer et publier du contenu dans le CMS',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'ADMIN',
    label: 'Administrateur',
    description: 'Gestion quotidienne complète de la plateforme',
    color: 'bg-red-100 text-red-700',
  },
  {
    value: 'SUPER_ADMIN',
    label: 'Super-Administrateur',
    description: 'Propriétaire — accès total et gestion des administrateurs',
    color: 'bg-amber-100 text-amber-800',
    superOnly: true, // Seul un SUPER_ADMIN peut attribuer ce rôle
  },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showRoleGuide, setShowRoleGuide] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ prenom: '', nom: '', email: '', motDePasse: '', role: 'CONTRIBUTOR' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined })
      .then(({ data }) => { setUsers(data.data); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [search, roleFilter]);
  useEffect(() => { load(); }, [page, search, roleFilter]);

  const updateRole = async (targetUser, newRole) => {
    // Empêcher un ADMIN de modifier un SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && !isSuperAdmin) {
      toast.error('Seul un Super-Administrateur peut modifier ce compte.');
      return;
    }
    // Empêcher un ADMIN d'attribuer le rôle SUPER_ADMIN
    if (newRole === 'SUPER_ADMIN' && !isSuperAdmin) {
      toast.error('Seul un Super-Administrateur peut attribuer ce rôle.');
      return;
    }
    try {
      await adminAPI.updateUser(targetUser.id, { role: newRole });
      toast.success(`Rôle mis à jour : ${ROLE_LABELS[newRole]}`);
      load();
    } catch { toast.error('Erreur lors de la mise à jour du rôle'); }
  };

  const handleInvite = async () => {
    const { prenom, nom, email, motDePasse, role } = inviteForm;
    if (!prenom || !nom || !email || !motDePasse) {
      toast.error('Tous les champs sont obligatoires'); return;
    }
    if (motDePasse.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères'); return;
    }
    setInviteLoading(true);
    try {
      await adminAPI.createMember({ prenom, nom, email, motDePasse, role });
      toast.success(`✅ Compte créé pour ${prenom} ${nom} (${ROLE_LABELS[role]})`);
      setShowInviteModal(false);
      setInviteForm({ prenom: '', nom: '', email: '', motDePasse: '', role: 'CONTRIBUTOR' });
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setInviteLoading(false);
    }
  };

  const togglePremium = async (id, isPremium) => {
    try {
      await adminAPI.updateUser(id, { isPremium: !isPremium });
      toast.success(isPremium ? 'Compte repassé en Gratuit' : 'Compte passé en Premium ⭐');
      load();
    } catch { toast.error('Erreur lors de la mise à jour du statut Premium'); }
  };

  // Rôles disponibles selon le compte connecté
  const availableRoles = isSuperAdmin
    ? ROLES_INFO
    : ROLES_INFO.filter(r => !r.superOnly);

  return (
    <>
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">{total} compte(s) au total</p>
        </div>
        <div className="flex gap-3">
          {/* Bouton guide des rôles */}
          <button
            onClick={() => setShowRoleGuide(v => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <InformationCircleIcon className="w-4 h-4" />
            Guide des rôles
          </button>
          {/* Bouton inviter un membre */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
            <UserPlusIcon className="w-4 h-4" />
            Inviter un membre
          </button>
        </div>
      </div>

      {/* Guide des rôles */}
      {showRoleGuide && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Explication des rôles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ROLES_INFO.map(r => (
              <div key={r.value} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-blue-100">
                <span className={`badge mt-0.5 flex-shrink-0 ${r.color}`}>{r.label}</span>
                <p className="text-sm text-gray-600">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher par nom ou email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-52" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ROLES_INFO.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Premium', 'Série 🔥', 'Contributions', 'Dernière activité'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</td></tr>
              ) : users.map(u => {
                const isTargetSuperAdmin = u.role === 'SUPER_ADMIN';
                const canEditRole = isSuperAdmin || !isTargetSuperAdmin;

                return (
                  <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isTargetSuperAdmin ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <span className="font-medium">{u.prenom} {u.nom}</span>
                          {isTargetSuperAdmin && (
                            <ShieldCheckIcon className="inline w-3.5 h-3.5 text-amber-500 ml-1 -mt-0.5" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      {canEditRole ? (
                        <select
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                          value={u.role}
                          onChange={e => updateRole(u, e.target.value)}>
                          {availableRoles.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePremium(u.id, u.isPremium)}
                        className={`badge cursor-pointer transition-colors ${u.isPremium ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {u.isPremium ? '⭐ Premium' : 'Gratuit'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-accent">{u.streak ?? 0} 🔥</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {u._count?.contributions ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString('fr-FR') : 'Jamais connecté'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Math.ceil(total / 20) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} / {Math.ceil(total / 20)} — {total} utilisateurs</p>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Précédent</button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>Suivant →</button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Modal invitation */}
    {showInviteModal && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                <UserPlusIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Inviter un membre</h2>
                <p className="text-xs text-gray-400">Crée un accès CMS direct, sans passer par l'app mobile</p>
              </div>
            </div>
            <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
                <input type="text" value={inviteForm.prenom}
                  onChange={e => setInviteForm(f => ({ ...f, prenom: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Kouadio" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                <input type="text" value={inviteForm.nom}
                  onChange={e => setInviteForm(f => ({ ...f, nom: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Yao" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" value={inviteForm.email}
                onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="animateur@languesivoire.ci" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe temporaire *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={inviteForm.motDePasse}
                  onChange={e => setInviteForm(f => ({ ...f, motDePasse: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Min. 8 caractères" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Le membre devra le changer à sa première connexion.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rôle</label>
              <select value={inviteForm.role}
                onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {(isSuperAdmin ? ROLES_INFO : ROLES_INFO.filter(r => !r.superOnly))
                  .filter(r => r.value !== 'USER')
                  .map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
                  ))}
              </select>
            </div>

            {/* Résumé du rôle sélectionné */}
            {inviteForm.role && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-start gap-2">
                <span className={`badge mt-0.5 flex-shrink-0 ${ROLES_INFO.find(r => r.value === inviteForm.role)?.color}`}>
                  {ROLE_LABELS[inviteForm.role]}
                </span>
                <p>{ROLES_INFO.find(r => r.value === inviteForm.role)?.description}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              Annuler
            </button>
            <button onClick={handleInvite} disabled={inviteLoading}
              className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {inviteLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <UserPlusIcon className="w-4 h-4" />}
              Créer le compte
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
