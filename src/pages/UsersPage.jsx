import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, KeyIcon, PlusIcon,
  Squares2X2Icon, XMarkIcon, CheckIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';

// ── Rôles ──────────────────────────────────────────────────────────────
const ALL_ROLES = ['USER', 'CONTRIBUTOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'];

const ROLE_CONFIG = {
  USER:        { label: 'Utilisateur',          color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400',   cms: false },
  CONTRIBUTOR: { label: 'Contributeur',          color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   cms: true  },
  EDITOR:      { label: 'Éditeur',               color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', cms: true  },
  ADMIN:       { label: 'Administrateur',        color: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    cms: false },
  SUPER_ADMIN: { label: 'Super-Administrateur',  color: 'bg-amber-100 text-amber-800',   dot: 'bg-amber-500',  cms: false },
};

const ROLE_DESC = {
  SUPER_ADMIN: '⚠️ Accès total au CMS, finances, gestion des comptes.',
  ADMIN:       '🔐 Accès complet au CMS. Peut créer des comptes Éditeur et Contributeur.',
  EDITOR:      '✏️ Consulte et modifie le contenu des modules assignés.',
  CONTRIBUTOR: '📝 Contribue aux modules sélectionnés. Accès en lecture/écriture limité.',
  USER:        '📱 Utilisateur mobile uniquement. Aucun accès au CMS.',
};

// ── Modules CMS ────────────────────────────────────────────────────────
const CMS_MODULES = [
  { key: 'dictionary',        label: 'Dictionnaire',        group: 'Contenu' },
  { key: 'conjugation',       label: 'Conjugaison',         group: 'Contenu' },
  { key: 'vocabulary',        label: 'Vocabulaire',         group: 'Contenu' },
  { key: 'lessons',           label: 'Leçons',              group: 'Contenu' },
  { key: 'cultural',          label: 'Culture & Traditions',group: 'Contenu' },
  { key: 'textes-recits',     label: 'Textes & Récits',     group: 'Contenu' },
  { key: 'image-galleries',   label: "Galeries d'Images",   group: 'Contenu' },
  { key: 'videos',            label: 'Vidéos',              group: 'Contenu' },
  { key: 'contributions',     label: 'Contributions',       group: 'Communauté' },
  { key: 'messages',          label: 'Messages',            group: 'Communauté' },
  { key: 'certificates',      label: 'Certificats',         group: 'Communauté' },
  { key: 'ia-linguistique',   label: 'IA Linguistique',     group: 'Communauté' },
  { key: 'voix-audio',        label: 'Import Audio',        group: 'Communauté' },
  { key: 'tutors',            label: 'Tuteurs IA',          group: 'Intelligence Artificielle' },
  { key: 'test-agents',       label: 'Test Agents IA',      group: 'Intelligence Artificielle' },
  { key: 'bienvenue-sons',    label: 'Bienvenue & Sons',    group: 'Intelligence Artificielle' },
  { key: 'langues',           label: 'Langues',             group: 'Paramètres App' },
  { key: 'badges',            label: 'Badges & XP',         group: 'Paramètres App' },
  { key: 'phrases-sos',       label: 'Phrases SOS',         group: 'Paramètres App' },
  { key: 'phrases-utiles',    label: 'Phrases Utiles',      group: 'Paramètres App' },
  { key: 'notifications',     label: 'Notifications',       group: 'Paramètres App' },
  { key: 'premiers-secours',  label: 'Premiers Secours',    group: 'Paramètres App' },
  { key: 'civisme',           label: 'Civisme',             group: 'Paramètres App' },
  { key: 'musee-tresors',     label: 'Musée des Trésors',   group: 'Paramètres App' },
  { key: 'arbre-vocabulaire', label: 'Arbre à Palabres',    group: 'Paramètres App' },
  { key: 'marche-dialogues',  label: 'Au Marché',           group: 'Paramètres App' },
];

const MODULE_GROUPS = [...new Set(CMS_MODULES.map(m => m.group))];

// ── Helpers ────────────────────────────────────────────────────────────
function needsModules(role) { return ROLE_CONFIG[role]?.cms === true; }

function creatableRoles(currentRole) {
  if (currentRole === 'SUPER_ADMIN') return ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'];
  if (currentRole === 'ADMIN')       return ['EDITOR', 'CONTRIBUTOR'];
  return [];
}

function canEditUser(currentRole, targetRole) {
  if (currentRole === 'SUPER_ADMIN') return true;
  if (currentRole === 'ADMIN') return !['ADMIN', 'SUPER_ADMIN'].includes(targetRole);
  return false;
}

function assignableRoles(currentRole) {
  if (currentRole === 'SUPER_ADMIN') return ALL_ROLES;
  if (currentRole === 'ADMIN') return ALL_ROLES.filter(r => !['ADMIN', 'SUPER_ADMIN'].includes(r));
  return [];
}

// ── Composant sélection de modules ────────────────────────────────────
function ModuleSelector({ selected, onChange }) {
  const toggle = (key) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

  const toggleGroup = (group) => {
    const keys = CMS_MODULES.filter(m => m.group === group).map(m => m.key);
    const allOn = keys.every(k => selected.includes(k));
    onChange(allOn ? selected.filter(k => !keys.includes(k)) : [...new Set([...selected, ...keys])]);
  };

  return (
    <div className="space-y-5">
      {MODULE_GROUPS.map(group => {
        const mods = CMS_MODULES.filter(m => m.group === group);
        const allOn = mods.every(m => selected.includes(m.key));
        return (
          <div key={group}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{group}</p>
              <button type="button" onClick={() => toggleGroup(group)}
                className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                  allOn ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {allOn ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {mods.map(mod => {
                const on = selected.includes(mod.key);
                return (
                  <button type="button" key={mod.key} onClick={() => toggle(mod.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                      on ? 'bg-primary-50 border-primary-300 text-primary-700'
                         : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}>
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      on ? 'bg-primary-500' : 'border border-gray-300 bg-white'
                    }`}>
                      {on && <CheckIcon className="w-3 h-3 text-white" />}
                    </span>
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: me } = useAuth();
  const myRole      = me?.role;
  const canCreate   = creatableRoles(myRole);
  const canAssign   = assignableRoles(myRole);

  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(false);

  // Reset password
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting]     = useState(false);

  // Créer un compte
  const defaultRole = canCreate[0] || 'CONTRIBUTOR';
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState({ nom: '', prenom: '', email: '', motDePasse: '', role: defaultRole, modules: [] });
  const [creating, setCreating]       = useState(false);

  // Édition des modules d'un utilisateur existant
  const [modTarget, setModTarget]   = useState(null); // { user, modules }
  const [savingMods, setSavingMods] = useState(false);

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
    try { await adminAPI.updateUser(id, { role }); toast.success('Rôle mis à jour'); load(); }
    catch { toast.error('Erreur'); }
  };

  const togglePremium = async (id, isPremium) => {
    try { await adminAPI.updateUser(id, { isPremium: !isPremium }); toast.success('Statut Premium mis à jour'); load(); }
    catch { toast.error('Erreur'); }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { toast.error('Minimum 8 caractères'); return; }
    setResetting(true);
    try {
      await adminAPI.updateUser(resetTarget.id, { newMotDePasse: newPassword });
      toast.success('Mot de passe réinitialisé');
      setResetTarget(null); setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
    finally { setResetting(false); }
  };

  const handleCreate = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.motDePasse) {
      toast.error('Tous les champs sont obligatoires'); return;
    }
    if (needsModules(form.role) && form.modules.length === 0) {
      toast.error('Sélectionnez au moins un module'); return;
    }
    setCreating(true);
    try {
      await adminAPI.createMember({
        nom: form.nom, prenom: form.prenom, email: form.email,
        motDePasse: form.motDePasse, role: form.role,
        modules: needsModules(form.role) ? form.modules : [],
      });
      toast.success('Compte créé avec succès');
      setShowCreate(false);
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: defaultRole, modules: [] });
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de la création'); }
    finally { setCreating(false); }
  };

  const handleSaveMods = async () => {
    setSavingMods(true);
    try {
      await adminAPI.updateUser(modTarget.user.id, { modules: modTarget.modules });
      toast.success('Modules mis à jour');
      setModTarget(null); load();
    } catch { toast.error('Erreur'); }
    finally { setSavingMods(false); }
  };

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
            <UserCircleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} compte(s) au total</p>
          </div>
        </div>
        {canCreate.length > 0 && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Créer un compte
          </button>
        )}
      </div>

      {/* Légende rôles */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_ROLES.map(r => (
          <span key={r} className={`badge text-xs ${ROLE_CONFIG[r].color}`}>
            {ROLE_CONFIG[r].label}
            {ROLE_CONFIG[r].cms && <span className="ml-1 opacity-50">· modules</span>}
          </span>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="relative max-w-sm flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher par nom ou email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-52" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Modules CMS', 'Premium', 'Streak', 'Contribs', 'Dernière activité', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Chargement…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Aucun utilisateur trouvé</td></tr>
              ) : users.map(u => {
                const editable = canEditUser(myRole, u.role);
                const userMods = u.modules ?? [];
                const hasMods  = needsModules(u.role);
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <span className="font-medium whitespace-nowrap">{u.prenom} {u.nom}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    {/* Rôle */}
                    <td className="px-4 py-3">
                      {editable && canAssign.length > 0 ? (
                        <select
                          className={`text-xs border border-gray-200 rounded-lg px-2 py-1 font-medium ${ROLE_CONFIG[u.role]?.color || ''}`}
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value)}>
                          {canAssign.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                        </select>
                      ) : (
                        <span className={`badge ${ROLE_CONFIG[u.role]?.color || 'bg-gray-100'}`}>
                          {ROLE_CONFIG[u.role]?.label || u.role}
                        </span>
                      )}
                    </td>
                    {/* Modules */}
                    <td className="px-4 py-3">
                      {hasMods ? (
                        <button onClick={() => setModTarget({ user: u, modules: userMods })}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                            userMods.length > 0
                              ? 'bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100'
                              : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                          }`}>
                          <Squares2X2Icon className="w-3.5 h-3.5" />
                          {userMods.length > 0 ? `${userMods.length} module${userMods.length > 1 ? 's' : ''}` : 'Aucun'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">
                          {u.role === 'USER' ? 'App mobile' : 'Accès total'}
                        </span>
                      )}
                    </td>
                    {/* Premium */}
                    <td className="px-4 py-3">
                      <button onClick={() => togglePremium(u.id, u.isPremium)}
                        className={`badge cursor-pointer ${u.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isPremium ? '⭐ Premium' : 'Gratuit'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center"><span className="font-semibold text-accent">{u.streak ?? 0}🔥</span></td>
                    <td className="px-4 py-3 text-center text-gray-600">{u._count?.contributions ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      {myRole === 'SUPER_ADMIN' && (
                        <button onClick={() => { setResetTarget(u); setNewPassword(''); }}
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

      {/* ── Modal : Réinitialiser mot de passe ── */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-1">Réinitialiser le mot de passe</h2>
            <p className="text-sm text-gray-500 mb-4">{resetTarget.email}</p>
            <input type="password" className="input mb-4"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleResetPassword} disabled={resetting} className="btn-primary flex-1 justify-center">
                {resetting ? 'En cours…' : 'Réinitialiser'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : Créer un compte ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Créer un compte CMS</h2>
                <p className="text-sm text-gray-500 mt-0.5">Définissez le rôle et les modules accessibles</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Identité */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Identité</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input className="input" placeholder="Prénom" value={form.prenom}
                      onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input className="input" placeholder="Nom" value={form.nom}
                      onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input" placeholder="email@exemple.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" className="input" placeholder="Minimum 8 caractères" value={form.motDePasse}
                    onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} />
                </div>
              </section>

              {/* Rôle */}
              <section>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Rôle CMS</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {canCreate.map(r => (
                    <button type="button" key={r}
                      onClick={() => setForm(f => ({ ...f, role: r, modules: [] }))}
                      className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${
                        form.role === r
                          ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                      }`}>
                      <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1.5 ${ROLE_CONFIG[r].dot}`} />
                      <div className="text-xs font-semibold">{ROLE_CONFIG[r].label}</div>
                      {ROLE_CONFIG[r].cms && (
                        <p className="text-[10px] text-gray-400 mt-0.5">modules requis</p>
                      )}
                    </button>
                  ))}
                </div>
                {/* Description du rôle sélectionné */}
                <div className={`mt-3 p-3 rounded-xl text-xs border ${
                  form.role === 'SUPER_ADMIN' ? 'bg-amber-50  border-amber-200  text-amber-800'  :
                  form.role === 'ADMIN'        ? 'bg-red-50    border-red-200    text-red-800'    :
                  form.role === 'EDITOR'       ? 'bg-purple-50 border-purple-200 text-purple-800' :
                  form.role === 'CONTRIBUTOR'  ? 'bg-blue-50   border-blue-200   text-blue-800'   :
                                                 'bg-gray-50   border-gray-200   text-gray-600'
                }`}>
                  {ROLE_DESC[form.role]}
                </div>
              </section>

              {/* Modules — uniquement pour EDITOR et CONTRIBUTOR */}
              {needsModules(form.role) && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Modules accessibles</p>
                      <p className="text-xs text-gray-400 mt-0.5">{form.modules.length} / {CMS_MODULES.length} sélectionné(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, modules: CMS_MODULES.map(m => m.key) }))}
                        className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium">
                        Tout sélectionner
                      </button>
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, modules: [] }))}
                        className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                        Effacer
                      </button>
                    </div>
                  </div>
                  <ModuleSelector
                    selected={form.modules}
                    onChange={mods => setForm(f => ({ ...f, modules: mods }))}
                  />
                </section>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 justify-center">
                {creating ? 'Création…' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : Éditer les modules d'un utilisateur ── */}
      {modTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Modules — {modTarget.user.prenom} {modTarget.user.nom}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-xs ${ROLE_CONFIG[modTarget.user.role]?.color}`}>
                    {ROLE_CONFIG[modTarget.user.role]?.label}
                  </span>
                  <span className="text-xs text-gray-400">{modTarget.modules.length} module(s) actif(s)</span>
                </div>
              </div>
              <button onClick={() => setModTarget(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="flex gap-2 mb-4">
                <button type="button"
                  onClick={() => setModTarget(t => ({ ...t, modules: CMS_MODULES.map(m => m.key) }))}
                  className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium">
                  Tout sélectionner
                </button>
                <button type="button"
                  onClick={() => setModTarget(t => ({ ...t, modules: [] }))}
                  className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
                  Tout effacer
                </button>
                <span className="ml-auto text-xs text-gray-400 self-center">
                  {modTarget.modules.length} / {CMS_MODULES.length} modules
                </span>
              </div>
              <ModuleSelector
                selected={modTarget.modules}
                onChange={mods => setModTarget(t => ({ ...t, modules: mods }))}
              />
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setModTarget(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSaveMods} disabled={savingMods} className="btn-primary flex-1 justify-center">
                {savingMods ? 'Sauvegarde…' : 'Enregistrer les modules'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
