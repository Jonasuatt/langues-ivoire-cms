import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, KeyIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ROLE_LABELS, ROLE_COLORS } from '../components/Layout';

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [infoForm, setInfoForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
  });
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwdForm, setPwdForm] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmer: '',
  });
  const [savingPwd, setSavingPwd] = useState(false);

  const handleInfoSave = async () => {
    setSavingInfo(true);
    try {
      const res = await authAPI.updateMe(infoForm);
      if (setUser) setUser(prev => ({ ...prev, ...res.data }));
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSave = async () => {
    if (pwdForm.nouveauMotDePasse !== pwdForm.confirmer) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (pwdForm.nouveauMotDePasse.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    setSavingPwd(true);
    try {
      await authAPI.changePassword({
        ancienMotDePasse: pwdForm.ancienMotDePasse,
        nouveauMotDePasse: pwdForm.nouveauMotDePasse,
      });
      toast.success('Mot de passe modifié avec succès !');
      setPwdForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmer: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.prenom} {user?.nom}</h1>
          <div className="flex items-center gap-2 mt-1">
            {user?.role === 'SUPER_ADMIN' && <ShieldCheckIcon className="w-4 h-4 text-amber-500" />}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user?.role] || 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Infos personnelles */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <UserCircleIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-base font-semibold text-gray-900">Informations personnelles</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={infoForm.prenom}
              onChange={e => setInfoForm(f => ({ ...f, prenom: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={infoForm.nom}
              onChange={e => setInfoForm(f => ({ ...f, nom: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
        </div>
        <button
          onClick={handleInfoSave}
          disabled={savingInfo}
          className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {savingInfo
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <CheckIcon className="w-4 h-4" />}
          Enregistrer
        </button>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-base font-semibold text-gray-900">Changer le mot de passe</h2>
        </div>
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              value={pwdForm.ancienMotDePasse}
              onChange={e => setPwdForm(f => ({ ...f, ancienMotDePasse: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={pwdForm.nouveauMotDePasse}
              onChange={e => setPwdForm(f => ({ ...f, nouveauMotDePasse: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={pwdForm.confirmer}
              onChange={e => setPwdForm(f => ({ ...f, confirmer: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveauMotDePasse
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200'
              }`}
              placeholder="••••••••"
            />
            {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveauMotDePasse && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>
        </div>
        <button
          onClick={handlePasswordSave}
          disabled={savingPwd || !pwdForm.ancienMotDePasse || !pwdForm.nouveauMotDePasse || pwdForm.nouveauMotDePasse !== pwdForm.confirmer}
          className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {savingPwd
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <KeyIcon className="w-4 h-4" />}
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}
