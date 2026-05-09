import { useEffect, useState } from 'react';
import { certificatesAPI, languagesAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon, PlusIcon, MagnifyingGlassIcon,
  InformationCircleIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1'];
const NIVEAU_LABELS = {
  A1: 'Débutant', A2: 'Élémentaire',
  B1: 'Intermédiaire', B2: 'Intermédiaire avancé', C1: 'Avancé',
};
const NIVEAU_COLORS = {
  A1: { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300' },
  A2: { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-300' },
  B1: { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-300' },
  B2: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  C1: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-300' },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterNiveau, setFilterNiveau] = useState('');

  // Modal d'émission
  const [showModal, setShowModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ languageId: '', niveau: 'A1' });
  const [issuing, setIssuing] = useState(false);
  const [searching, setSearching] = useState(false);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterLanguage) params.languageId = filterLanguage;
    if (filterNiveau) params.niveau = filterNiveau;
    certificatesAPI.getAll(params)
      .then(({ data }) => { setCerts(data.data); setTotal(data.total); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterLanguage, filterNiveau]);

  // Recherche d'utilisateur
  useEffect(() => {
    if (!userSearch.trim() || userSearch.length < 2) { setUserResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      adminAPI.getUsers({ search: userSearch, limit: 8 })
        .then(({ data }) => setUserResults(data.data || data))
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  const openModal = () => {
    setSelectedUser(null);
    setUserSearch('');
    setUserResults([]);
    setForm({ languageId: languages[0]?.id || '', niveau: 'A1' });
    setShowModal(true);
  };

  const handleIssue = async () => {
    if (!selectedUser) { toast.error('Sélectionnez un utilisateur'); return; }
    if (!form.languageId) { toast.error('Sélectionnez une langue'); return; }
    setIssuing(true);
    try {
      await certificatesAPI.issue({ userId: selectedUser.id, languageId: form.languageId, niveau: form.niveau });
      toast.success(`Certificat ${form.niveau} émis pour ${selectedUser.prenom} ${selectedUser.nom} — notification envoyée`);
      setShowModal(false);
      load();
    } catch (err) {
      if (err.response?.status === 409) toast.error('Ce certificat existe déjà pour cet utilisateur');
      else toast.error(err.response?.data?.error || 'Erreur lors de l\'émission');
    } finally { setIssuing(false); }
  };

  // Grouper par langue pour les stats
  const statsByLang = {};
  certs.forEach(c => {
    const k = c.language.nom;
    if (!statsByLang[k]) statsByLang[k] = { total: 0, niveaux: {} };
    statsByLang[k].total++;
    statsByLang[k].niveaux[c.niveau] = (statsByLang[k].niveaux[c.niveau] || 0) + 1;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificats & Diplômes</h1>
          <p className="text-gray-500 text-sm mt-1">{total} certificat(s) émis</p>
        </div>
        <button onClick={openModal} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Émettre un certificat
        </button>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">🎓 À propos des certificats</p>
          <p>
            Les certificats peuvent être émis <strong>manuellement</strong> ici pour récompenser des utilisateurs méritants,
            ou <strong>automatiquement</strong> par le système lorsqu'un utilisateur complète toutes les leçons d'un niveau.
            L'utilisateur reçoit une <strong>notification push</strong> et retrouve son certificat dans son profil.
          </p>
        </div>
      </div>

      {/* Stats par niveau */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {NIVEAUX.map(n => {
          const count = certs.filter(c => c.niveau === n).length;
          const col = NIVEAU_COLORS[n];
          return (
            <div key={n} className={`rounded-xl p-4 border ${col.bg} ${col.border}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold uppercase tracking-wide ${col.text}`}>{n}</span>
                <AcademicCapIcon className={`w-5 h-5 ${col.text}`} />
              </div>
              <p className={`text-2xl font-bold ${col.text}`}>{count}</p>
              <p className={`text-xs ${col.text} opacity-70`}>{NIVEAU_LABELS[n]}</p>
            </div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-5">
        <select className="input w-52 text-sm" value={filterLanguage}
          onChange={e => setFilterLanguage(e.target.value)}>
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
        </select>
        <select className="input w-44 text-sm" value={filterNiveau}
          onChange={e => setFilterNiveau(e.target.value)}>
          <option value="">Tous les niveaux</option>
          {NIVEAUX.map(n => <option key={n} value={n}>{n} — {NIVEAU_LABELS[n]}</option>)}
        </select>
      </div>

      {/* Liste des certificats */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <AcademicCapIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun certificat dans cette catégorie</p>
          <button onClick={openModal} className="btn-primary mt-4 mx-auto">Émettre le premier</button>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map(c => {
            const col = NIVEAU_COLORS[c.niveau] || NIVEAU_COLORS.A1;
            return (
              <div key={c.id} className="card flex items-center gap-4">
                {/* Médaillon niveau */}
                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 flex-shrink-0 ${col.bg} ${col.border}`}>
                  <span className={`text-lg font-bold ${col.text}`}>{c.niveau}</span>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {c.user?.prenom} {c.user?.nom}
                    </span>
                    <span className="text-xs text-gray-400">{c.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge text-xs ${col.bg} ${col.text}`}>
                      {c.niveau} — {NIVEAU_LABELS[c.niveau]}
                    </span>
                    <span className="badge bg-gray-100 text-gray-600 text-xs">{c.language?.nom}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Émis le</p>
                  <p className="text-sm font-medium text-gray-700">{formatDate(c.issuedAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal d'émission ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Émettre un certificat</h2>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Recherche utilisateur */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur *</label>
              {selectedUser ? (
                <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
                    {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{selectedUser.prenom} {selectedUser.nom}</p>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setUserSearch(''); }}
                    className="text-gray-400 hover:text-red-500">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input className="input pl-9 text-sm" placeholder="Rechercher par nom ou email…"
                    value={userSearch} onChange={e => setUserSearch(e.target.value)} autoFocus />
                  {searching && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {userResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {userResults.map(u => (
                        <button key={u.id}
                          onClick={() => { setSelectedUser(u); setUserSearch(''); setUserResults([]); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.prenom} {u.nom}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Langue */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
              <select className="input text-sm" value={form.languageId}
                onChange={e => setForm(f => ({ ...f, languageId: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {languages.map(l => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </div>

            {/* Niveau */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau *</label>
              <div className="grid grid-cols-5 gap-2">
                {NIVEAUX.map(n => {
                  const col = NIVEAU_COLORS[n];
                  const active = form.niveau === n;
                  return (
                    <button key={n}
                      onClick={() => setForm(f => ({ ...f, niveau: n }))}
                      className={`py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                        active ? `${col.bg} ${col.text} ${col.border}` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {n}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{NIVEAU_LABELS[form.niveau]}</p>
            </div>

            {/* Aperçu du certificat */}
            {selectedUser && form.languageId && (
              <div className="mb-5 p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl text-white text-center">
                <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Langues Ivoire</p>
                <p className="font-bold text-lg">{selectedUser.prenom} {selectedUser.nom}</p>
                <p className="text-sm opacity-80 mt-1">
                  Niveau {form.niveau} — {NIVEAU_LABELS[form.niveau]}
                </p>
                <p className="text-sm opacity-80">
                  {languages.find(l => l.id === form.languageId)?.nom}
                </p>
                <p className="text-xs opacity-60 mt-2">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleIssue} disabled={issuing || !selectedUser || !form.languageId}
                className="btn-primary flex-1 justify-center disabled:opacity-50">
                <AcademicCapIcon className="w-4 h-4 inline mr-2" />
                {issuing ? 'Émission…' : 'Émettre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
