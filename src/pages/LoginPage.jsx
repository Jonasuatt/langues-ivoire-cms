import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'CONTRIBUTOR'].includes(user.role)) {
        throw new Error('Accès non autorisé pour ce compte.');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Langues Ivoire" className="w-32 h-32 object-contain mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-2xl font-bold text-white">LANGUES IVOIRE</h1>
          <p className="text-white/70 text-sm mt-1">Interface d'administration CMS</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Connexion</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" value={email}
                onChange={e => setEmail(e.target.value)} required placeholder="admin@languesivoire.ci" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" className="input" value={password}
                onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full btn-primary justify-center py-3" disabled={loading}>
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          Réservé aux administrateurs, éditeurs et contributeurs autorisés.
        </p>
      </div>
    </div>
  );
}
