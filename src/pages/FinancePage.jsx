/**
 * FinancePage — Gestion financière de la plateforme Langues Ivoire
 *
 * Trois onglets :
 *  1. 💰 Tarifs & Paiements  — droits pour Annonces et Publicités
 *  2. 🤝 Contributions       — dons et parrainages des utilisateurs / organisations
 *  3. 📊 Comptabilité        — tableau de bord financier consolidé
 */
import { useEffect, useState, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import { financeAPI, depensesAPI, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon,
  BanknotesIcon, ChartBarIcon, UserGroupIcon,
  ArrowDownTrayIcon, BuildingLibraryIcon,
  StarIcon, UserCircleIcon, ShieldCheckIcon,
  ArrowPathIcon, NoSymbolIcon, DocumentArrowDownIcon,
  PaperClipIcon, FunnelIcon, ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// ─── Constantes ───────────────────────────────────────────────────────────────
const FCFA = (n) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const METHODES = [
  { value: 'ORANGE_MONEY', label: '🟠 Orange Money' },
  { value: 'MTN_MONEY',    label: '🟡 MTN Money'    },
  { value: 'WAVE',         label: '🔵 Wave'          },
  { value: 'MOOV_MONEY',   label: '🟣 Moov Money'   },
  { value: 'VIREMENT',     label: '🏦 Virement bancaire' },
  { value: 'ESPECES',      label: '💵 Espèces'       },
];

const TYPES_PAIEMENT = [
  { value: 'ANNONCE',            label: '📣 Annonce partenaire' },
  { value: 'PUBLICITE_STANDARD', label: '📢 Publicité standard (7j)' },
  { value: 'PUBLICITE_PREMIUM',  label: '⭐ Publicité premium (30j)' },
  { value: 'PARTENARIAT',        label: '🤝 Partenariat annuel' },
];

const STATUTS_PAI = [
  { value: 'EN_ATTENTE', label: '⏳ En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'RECU',       label: '✅ Reçu',       color: 'bg-green-100 text-green-700' },
  { value: 'ANNULE',     label: '❌ Annulé',     color: 'bg-red-100 text-red-700'    },
  { value: 'REMBOURSE',  label: '↩️ Remboursé',  color: 'bg-gray-100 text-gray-600'  },
];

const OBJETS_CONTRIB = [
  { value: 'SOUTIEN_GENERAL',   label: '💚 Soutien général'         },
  { value: 'PARRAINAGE_LANGUE', label: '🌍 Parrainage d\'une langue' },
  { value: 'ENREGISTREMENT',    label: '🎙️ Enregistrement audio'    },
  { value: 'TRADUCTION',        label: '📝 Traduction'              },
  { value: 'DEVELOPPEMENT',     label: '📱 Développement app'       },
  { value: 'DON_LIBRE',         label: '🎁 Don libre'               },
];

// Tarifs par défaut (affichés même si l'API ne répond pas encore)
const TARIFS_DEFAUT = [
  { id: 'annonce',   type: 'ANNONCE',            label: '📣 Annonce partenaire',       montant: 5000,  duree: null, description: 'Publication d\'une annonce dans l\'app et notifications' },
  { id: 'pub-std',   type: 'PUBLICITE_STANDARD', label: '📢 Publicité standard',       montant: 15000, duree: 7,   description: 'Bannière publicitaire pendant 7 jours' },
  { id: 'pub-prem',  type: 'PUBLICITE_PREMIUM',  label: '⭐ Publicité premium',        montant: 50000, duree: 30,  description: 'Publicité prioritaire pendant 30 jours avec audio/vidéo' },
  { id: 'partenaire',type: 'PARTENARIAT',         label: '🤝 Partenariat institutionnel', montant: null,  duree: 365, description: 'Partenariat annuel — tarif sur devis' },
];

// Plans Premium (cohérents avec PremiumScreen.js mobile)
const PLANS_PREMIUM = [
  { key: 'mensuel',     label: '📅 Mensuel',     montant: 3500,  unite: 'FCFA / mois', badge: null,            color: 'border-blue-200 bg-blue-50',   text: 'text-blue-700'  },
  { key: 'annuel',      label: '🏆 Annuel',      montant: 28000, unite: 'FCFA / an',   badge: '33% d\'économie', color: 'border-amber-300 bg-amber-50', text: 'text-amber-700' },
  { key: 'institution', label: '🏫 Institution', montant: null,  unite: 'Sur devis',   badge: 'Personnalisé',  color: 'border-purple-200 bg-purple-50', text: 'text-purple-700' },
];

const STATUTS_PREMIUM = [
  { value: 'ACTIF',   label: '✅ Actif',   color: 'bg-green-100 text-green-700'  },
  { value: 'EXPIRE',  label: '⌛ Expiré',  color: 'bg-gray-100 text-gray-600'    },
  { value: 'ANNULE',  label: '❌ Annulé',  color: 'bg-red-100 text-red-700'      },
  { value: 'OFFERT',  label: '🎁 Offert',  color: 'bg-purple-100 text-purple-700' },
];

const PERIODE_OPTIONS = [
  { value: 'mois',      label: 'Ce mois'      },
  { value: 'trimestre', label: 'Ce trimestre' },
  { value: 'annee',     label: 'Cette année'  },
  { value: 'tout',      label: 'Tout'         },
];

// ─── Composant statut badge ───────────────────────────────────────────────────
function StatutBadge({ value, options }) {
  const opt = options.find(o => o.value === value) || options[0];
  return <span className={`badge text-xs ${opt.color}`}>{opt.label}</span>;
}

// ─── Modal Paiement (annonce / publicité) ────────────────────────────────────
function ModalPaiement({ item, onClose, onSave }) {
  const EMPTY = { type: 'ANNONCE', payeurNom: '', payeurEmail: '', payeurOrganisation: '',
    montant: '', methode: 'ORANGE_MONEY', statut: 'EN_ATTENTE', reference: '',
    dateEcheance: '', notes: '', contentId: '' };
  const [form, setForm] = useState(item ? {
    type: item.type || 'ANNONCE', payeurNom: item.payeurNom || '',
    payeurEmail: item.payeurEmail || '', payeurOrganisation: item.payeurOrganisation || '',
    montant: item.montant || '', methode: item.methode || 'ORANGE_MONEY',
    statut: item.statut || 'EN_ATTENTE', reference: item.reference || '',
    dateEcheance: item.dateEcheance?.slice(0,10) || '', notes: item.notes || '', contentId: item.contentId || '',
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.payeurNom || !form.montant) { toast.error('Nom du payeur et montant requis'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {item ? 'Modifier le paiement' : 'Enregistrer un paiement'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de prestation *</label>
            <select className="input" value={form.type} onChange={e => f('type', e.target.value)}>
              {TYPES_PAIEMENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Contact *</label>
              <input className="input" value={form.payeurNom} onChange={e => f('payeurNom', e.target.value)} placeholder="Prénom Nom"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation</label>
              <input className="input" value={form.payeurOrganisation} onChange={e => f('payeurOrganisation', e.target.value)} placeholder="Société / Structure"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className="input" type="email" value={form.payeurEmail} onChange={e => f('payeurEmail', e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input className="input" type="number" value={form.montant} onChange={e => f('montant', e.target.value)} placeholder="15000"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
              <select className="input" value={form.methode} onChange={e => f('methode', e.target.value)}>
                {METHODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input" value={form.statut} onChange={e => f('statut', e.target.value)}>
                {STATUTS_PAI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input className="input" type="date" value={form.dateEcheance} onChange={e => f('dateEcheance', e.target.value)}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence de paiement</label>
            <input className="input" value={form.reference} onChange={e => f('reference', e.target.value)} placeholder="N° de transaction, reçu…"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => f('notes', e.target.value)}/>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Sauvegarde…' : item ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Contribution financière ───────────────────────────────────────────
function ModalContribution({ item, onClose, onSave }) {
  const EMPTY = { contributeurNom: '', contributeurEmail: '', contributeurOrganisation: '',
    isOrganisation: false, montant: '', objet: 'SOUTIEN_GENERAL', langueId: '',
    methode: 'ORANGE_MONEY', statut: 'EN_ATTENTE', reference: '', message: '', dateReception: '' };
  const [form, setForm] = useState(item ? {
    contributeurNom: item.contributeurNom || '', contributeurEmail: item.contributeurEmail || '',
    contributeurOrganisation: item.contributeurOrganisation || '',
    isOrganisation: item.isOrganisation || false, montant: item.montant || '',
    objet: item.objet || 'SOUTIEN_GENERAL', langueId: item.langueId || '',
    methode: item.methode || 'ORANGE_MONEY', statut: item.statut || 'EN_ATTENTE',
    reference: item.reference || '', message: item.message || '',
    dateReception: item.dateReception?.slice(0,10) || '',
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.contributeurNom || !form.montant) { toast.error('Nom et montant requis'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {item ? 'Modifier la contribution' : 'Enregistrer une contribution'}
        </h2>
        <div className="space-y-4">
          {/* Type contributeur */}
          <div className="flex gap-3">
            {[{ v: false, l: '👤 Particulier' }, { v: true, l: '🏢 Organisation' }].map(opt => (
              <button key={String(opt.v)} type="button" onClick={() => f('isOrganisation', opt.v)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  form.isOrganisation === opt.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {opt.l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Prénom *</label>
              <input className="input" value={form.contributeurNom} onChange={e => f('contributeurNom', e.target.value)}/>
            </div>
            {form.isOrganisation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organisation *</label>
                <input className="input" value={form.contributeurOrganisation} onChange={e => f('contributeurOrganisation', e.target.value)} placeholder="Nom de l'organisation"/>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" value={form.contributeurEmail} onChange={e => f('contributeurEmail', e.target.value)}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input className="input" type="number" value={form.montant} onChange={e => f('montant', e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet de la contribution</label>
              <select className="input" value={form.objet} onChange={e => f('objet', e.target.value)}>
                {OBJETS_CONTRIB.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
              <select className="input" value={form.methode} onChange={e => f('methode', e.target.value)}>
                {METHODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input" value={form.statut} onChange={e => f('statut', e.target.value)}>
                {STATUTS_PAI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de réception</label>
              <input className="input" type="date" value={form.dateReception} onChange={e => f('dateReception', e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
              <input className="input" value={form.reference} onChange={e => f('reference', e.target.value)} placeholder="Reçu, transaction…"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message du contributeur</label>
            <textarea className="input resize-none" rows={3} value={form.message} onChange={e => f('message', e.target.value)} placeholder="Message d'accompagnement (optionnel)…"/>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Sauvegarde…' : item ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Tarifs & Paiements ────────────────────────────────────────────────
function TarifsTab({ isAdmin }) {
  const [paiements, setPaiements]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tarifs, setTarifs]           = useState(TARIFS_DEFAUT);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [editTarif, setEditTarif]     = useState(null);
  const [tempMontant, setTempMontant] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await financeAPI.getPaiements({ limit: 100 });
      setPaiements(data.data || []);
    } catch { setPaiements([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = paiements.filter(p => {
    if (filterStatut && p.statut !== filterStatut) return false;
    if (filterType   && p.type   !== filterType)   return false;
    if (search) {
      const q = search.toLowerCase();
      if (!['payeurNom','payeurOrganisation','reference'].some(k => (p[k]||'').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const totalRecu    = paiements.filter(p => p.statut === 'RECU').reduce((s, p) => s + (p.montant || 0), 0);
  const totalAttente = paiements.filter(p => p.statut === 'EN_ATTENTE').reduce((s, p) => s + (p.montant || 0), 0);
  const totalMois    = paiements.filter(p => {
    if (p.statut !== 'RECU') return false;
    const d = new Date(p.createdAt); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, p) => s + (p.montant || 0), 0);

  const handleSavePaiement = async (form) => {
    if (editItem) {
      await financeAPI.updatePaiement(editItem.id, form);
      toast.success('Paiement mis à jour');
    } else {
      await financeAPI.createPaiement(form);
      toast.success('Paiement enregistré');
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce paiement ?')) return;
    try { await financeAPI.deletePaiement(id); toast.success('Supprimé'); load(); }
    catch { toast.error('Erreur'); }
  };

  const handleMarkRecu = async (p) => {
    try {
      await financeAPI.updatePaiement(p.id, { statut: 'RECU' });
      toast.success('Marqué comme reçu ✅');
      load();
    } catch { toast.error('Erreur'); }
  };

  const saveTarif = async (t) => {
    try {
      await financeAPI.updateTarif(t.id, { montant: parseInt(tempMontant) || t.montant });
      toast.success('Tarif mis à jour');
    } catch {}
    setTarifs(prev => prev.map(x => x.id === t.id ? { ...x, montant: parseInt(tempMontant) || x.montant } : x));
    setEditTarif(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card py-3 px-5 border-l-4 border-green-400">
          <p className="text-xl font-bold text-green-600">{FCFA(totalRecu)}</p>
          <p className="text-sm text-gray-500">Total encaissé</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-amber-400">
          <p className="text-xl font-bold text-amber-600">{FCFA(totalAttente)}</p>
          <p className="text-sm text-gray-500">En attente de paiement</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-blue-400">
          <p className="text-xl font-bold text-blue-600">{FCFA(totalMois)}</p>
          <p className="text-sm text-gray-500">Encaissé ce mois</p>
        </div>
      </div>

      {/* Grille des tarifs */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">Grille tarifaire</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {tarifs.map(t => (
            <div key={t.id} className="card border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm text-gray-900">{t.label}</p>
                {isAdmin && (
                  <button onClick={() => { setEditTarif(t); setTempMontant(String(t.montant || '')); }}
                    className="p-1 text-gray-400 hover:text-primary-500 transition-colors">
                    <PencilIcon className="w-3.5 h-3.5"/>
                  </button>
                )}
              </div>
              {editTarif?.id === t.id ? (
                <div className="space-y-2">
                  <input type="number" className="input text-sm py-1" value={tempMontant}
                    onChange={e => setTempMontant(e.target.value)} placeholder="Montant FCFA"/>
                  <div className="flex gap-1">
                    <button onClick={() => saveTarif(t)} className="flex-1 py-1 text-xs bg-primary-500 text-white rounded-lg">✓</button>
                    <button onClick={() => setEditTarif(null)} className="flex-1 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-primary-600 my-2">
                    {t.montant ? FCFA(t.montant) : 'Sur devis'}
                  </p>
                  {t.duree && <p className="text-xs text-gray-400">{t.duree} jours</p>}
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Liste des paiements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">Paiements enregistrés</h3>
          <button onClick={() => { setEditItem(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 text-sm py-2">
            <PlusIcon className="w-4 h-4"/> Enregistrer un paiement
          </button>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…" className="input pl-9 w-48"/>
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
            <option value="">Tous les types</option>
            {TYPES_PAIEMENT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input w-auto">
            <option value="">Tous les statuts</option>
            {STATUTS_PAI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="ml-auto text-sm text-gray-400">{filtered.length} paiement(s)</span>
        </div>

        {loading ? (
          <div className="space-y-2 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <BanknotesIcon className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-400">Aucun paiement enregistré</p>
            <button onClick={() => { setEditItem(null); setShowModal(true); }}
              className="btn-primary mt-4 mx-auto text-sm">Enregistrer le premier paiement</button>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Payeur', 'Type', 'Montant', 'Méthode', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{p.payeurNom}</p>
                      {p.payeurOrganisation && <p className="text-xs text-gray-400">{p.payeurOrganisation}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-blue-100 text-blue-700 text-xs">
                        {TYPES_PAIEMENT.find(t => t.value === p.type)?.label || p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{FCFA(p.montant)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {METHODES.find(m => m.value === p.methode)?.label || p.methode}
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge value={p.statut} options={STATUTS_PAI}/>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.statut === 'EN_ATTENTE' && (
                          <button onClick={() => handleMarkRecu(p)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Marquer reçu">
                            <CheckCircleIcon className="w-4 h-4"/>
                          </button>
                        )}
                        <button onClick={() => { setEditItem(p); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                          <PencilIcon className="w-4 h-4"/>
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ModalPaiement
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSavePaiement}
        />
      )}
    </div>
  );
}

// ─── Onglet Contributions financières ────────────────────────────────────────
function ContributionsTab() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterStatut, setFilterStatut]   = useState('');
  const [filterType, setFilterType]       = useState('');
  const [search, setSearch]               = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [editItem, setEditItem]           = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await financeAPI.getContributions({ limit: 200 });
      setContributions(data.data || []);
    } catch { setContributions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = contributions.filter(c => {
    if (filterStatut && c.statut !== filterStatut) return false;
    if (filterType   && (c.isOrganisation ? 'org' : 'part') !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!['contributeurNom','contributeurOrganisation','message'].some(k => (c[k]||'').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const totalRecu  = contributions.filter(c => c.statut === 'RECU').reduce((s, c) => s + (c.montant || 0), 0);
  const nbOrgs     = contributions.filter(c => c.isOrganisation).length;
  const totalMois  = contributions.filter(c => {
    if (c.statut !== 'RECU') return false;
    const d = new Date(c.dateReception || c.createdAt); const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, c) => s + (c.montant || 0), 0);

  const handleSave = async (form) => {
    if (editItem) {
      await financeAPI.updateContribution(editItem.id, form);
      toast.success('Contribution mise à jour');
    } else {
      await financeAPI.createContribution(form);
      toast.success('Contribution enregistrée');
    }
    load();
  };

  const handleMarkRecu = async (c) => {
    try { await financeAPI.updateContribution(c.id, { statut: 'RECU' }); toast.success('Reçu ✅'); load(); }
    catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette contribution ?')) return;
    try { await financeAPI.deleteContribution(id); toast.success('Supprimée'); load(); }
    catch { toast.error('Erreur'); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card py-3 px-5 border-l-4 border-green-400">
          <p className="text-xl font-bold text-green-600">{FCFA(totalRecu)}</p>
          <p className="text-sm text-gray-500">Total reçu</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-blue-400">
          <p className="text-xl font-bold text-blue-600">{FCFA(totalMois)}</p>
          <p className="text-sm text-gray-500">Ce mois</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-purple-400">
          <p className="text-xl font-bold text-purple-600">{contributions.length}</p>
          <p className="text-sm text-gray-500">Contributeurs</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-amber-400">
          <p className="text-xl font-bold text-amber-600">{nbOrgs}</p>
          <p className="text-sm text-gray-500">Organisations</p>
        </div>
      </div>

      {/* Info mobile */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-800 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">📱</span>
        <div>
          <p className="font-semibold mb-0.5">Contributions via l'application mobile</p>
          <p className="text-xs text-primary-600">
            Les utilisateurs peuvent soumettre une contribution financière directement depuis l'écran
            <strong> Profil → Soutenir Langues Ivoire</strong>. Les contributions mobile apparaissent automatiquement ici.
          </p>
        </div>
      </div>

      {/* Filtres + bouton */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…" className="input pl-9 w-48"/>
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto">
          <option value="">Tous les contributeurs</option>
          <option value="part">👤 Particuliers</option>
          <option value="org">🏢 Organisations</option>
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS_PAI.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => { setEditItem(null); setShowModal(true); }}
          className="ml-auto btn-primary flex items-center gap-2 text-sm py-2">
          <PlusIcon className="w-4 h-4"/> Enregistrer une contribution
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-2 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <UserGroupIcon className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-400">Aucune contribution financière</p>
          <button onClick={() => { setEditItem(null); setShowModal(true); }}
            className="btn-primary mt-4 mx-auto text-sm">Enregistrer la première contribution</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const objet = OBJETS_CONTRIB.find(o => o.value === c.objet);
            return (
              <div key={c.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${c.isOrganisation ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    <span className="text-lg">{c.isOrganisation ? '🏢' : '👤'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-gray-900">{c.contributeurNom}</p>
                      {c.contributeurOrganisation && <span className="badge bg-purple-100 text-purple-700 text-xs">{c.contributeurOrganisation}</span>}
                      {objet && <span className="badge bg-gray-100 text-gray-600 text-xs">{objet.label}</span>}
                      <StatutBadge value={c.statut} options={STATUTS_PAI}/>
                    </div>
                    {c.contributeurEmail && <p className="text-xs text-gray-400 mb-1">{c.contributeurEmail}</p>}
                    {c.message && <p className="text-sm text-gray-600 italic">"{c.message}"</p>}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3"/>
                      {fmtDate(c.dateReception || c.createdAt)}
                      {c.methode && <> · {METHODES.find(m => m.value === c.methode)?.label}</>}
                      {c.reference && <> · Réf: {c.reference}</>}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900">{FCFA(c.montant)}</p>
                    <div className="flex gap-1">
                      {c.statut === 'EN_ATTENTE' && (
                        <button onClick={() => handleMarkRecu(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Marquer reçu">
                          <CheckCircleIcon className="w-4 h-4"/>
                        </button>
                      )}
                      <button onClick={() => { setEditItem(c); setShowModal(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                        <PencilIcon className="w-4 h-4"/>
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <TrashIcon className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ModalContribution
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Onglet Comptabilité ─────────────────────────────────────────────────────
function ComptabiliteTab() {
  const [periode, setPeriode]   = useState('mois');
  const [resume, setResume]     = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await financeAPI.getResume({ periode });
      setResume(data);
    } catch {
      // Données simulées si l'API n'existe pas encore
      setResume({
        totalEncaisse: 0, totalAnnonces: 0, totalPublicites: 0,
        totalContributions: 0, totalEnAttente: 0, totalRembourses: 0,
        nbTransactions: 0, nbContributeurs: 0,
        lignes: [],
      });
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [periode]);

  const r = resume || {};

  return (
    <div className="space-y-6">
      {/* Filtre période */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Période :</span>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODE_OPTIONS.map(p => (
            <button key={p.value} onClick={() => setPeriode(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periode === p.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="ml-auto btn-secondary flex items-center gap-2 text-sm py-1.5">
          <ArrowDownTrayIcon className="w-4 h-4"/> Exporter CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}</div>
          <div className="h-64 bg-gray-100 rounded-xl"/>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="card py-4 px-5 border-l-4 border-green-500">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Total encaissé</p>
              <p className="text-2xl font-bold text-green-600">{FCFA(r.totalEncaisse || 0)}</p>
            </div>
            <div className="card py-4 px-5 border-l-4 border-amber-400">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{FCFA(r.totalEnAttente || 0)}</p>
            </div>
            <div className="card py-4 px-5 border-l-4 border-gray-300">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Remboursé</p>
              <p className="text-2xl font-bold text-gray-600">{FCFA(r.totalRembourses || 0)}</p>
            </div>
          </div>

          {/* Ventilation par source */}
          <div>
            <h3 className="text-base font-bold text-gray-800 mb-3">Ventilation par source de revenus</h3>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Source', 'Encaissé', 'En attente', 'Total', '% du total'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { label: '📣 Annonces',          encaisse: r.totalAnnonces || 0,       attente: 0 },
                    { label: '📢 Publicités',         encaisse: r.totalPublicites || 0,     attente: 0 },
                    { label: '🤝 Contributions',      encaisse: r.totalContributions || 0,  attente: 0 },
                  ].map((row, i) => {
                    const total = (r.totalEncaisse || 0);
                    const pct   = total > 0 ? Math.round((row.encaisse / total) * 100) : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.label}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">{FCFA(row.encaisse)}</td>
                        <td className="px-4 py-3 text-amber-600">{FCFA(row.attente)}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{FCFA(row.encaisse + row.attente)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px]">
                              <div className="h-2 bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                            </div>
                            <span className="text-xs text-gray-500">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Ligne total */}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3 text-gray-900">TOTAL</td>
                    <td className="px-4 py-3 text-green-700">{FCFA(r.totalEncaisse || 0)}</td>
                    <td className="px-4 py-3 text-amber-700">{FCFA(r.totalEnAttente || 0)}</td>
                    <td className="px-4 py-3 text-gray-900">{FCFA((r.totalEncaisse || 0) + (r.totalEnAttente || 0))}</td>
                    <td className="px-4 py-3 text-gray-500">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Métriques complémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card py-3 px-5">
              <p className="text-2xl font-bold text-gray-800">{r.nbTransactions || 0}</p>
              <p className="text-sm text-gray-500">Transactions sur la période</p>
            </div>
            <div className="card py-3 px-5">
              <p className="text-2xl font-bold text-gray-800">{r.nbContributeurs || 0}</p>
              <p className="text-sm text-gray-500">Contributeurs distincts</p>
            </div>
          </div>

          {/* Avertissement backend */}
          {(r.totalEncaisse === 0 && r.nbTransactions === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              <p className="font-semibold mb-1">📡 En attente des données backend</p>
              <p>Les endpoints <code>/finance/resume</code>, <code>/finance/paiements</code> et <code>/finance/contributions</code> doivent être implémentés côté API pour afficher les données réelles.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Modal activation Premium manuelle ───────────────────────────────────────
function ModalPremium({ item, onClose, onSave }) {
  const isNew = !item;
  const today = new Date().toISOString().slice(0, 10);
  const in1Month  = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const in1Year   = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const [form, setForm] = useState({
    userEmail:   item?.user?.email   || '',
    userNom:     item?.user?.prenom ? `${item.user.prenom} ${item.user.nom}` : '',
    plan:        item?.plan          || 'mensuel',
    statut:      item?.statut        || 'ACTIF',
    dateDebut:   item?.dateDebut?.slice(0, 10) || today,
    dateFin:     item?.dateFin?.slice(0, 10)   || in1Month,
    methode:     item?.methode       || 'ORANGE_MONEY',
    montantPaye: item?.montantPaye   || '',
    reference:   item?.reference     || '',
    notes:       item?.notes         || '',
  });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-calculer la date de fin selon le plan
  const handlePlanChange = (plan) => {
    f('plan', plan);
    const debut = new Date(form.dateDebut);
    if (plan === 'mensuel') f('dateFin', new Date(debut.getTime() + 30 * 86400000).toISOString().slice(0, 10));
    if (plan === 'annuel')  f('dateFin', new Date(debut.getTime() + 365 * 86400000).toISOString().slice(0, 10));
    if (plan === 'institution') f('dateFin', new Date(debut.getTime() + 365 * 86400000).toISOString().slice(0, 10));
    const plan_info = PLANS_PREMIUM.find(p => p.key === plan);
    if (plan_info?.montant) f('montantPaye', String(plan_info.montant));
  };

  const handleSave = async () => {
    if (!form.userEmail && !form.userNom) { toast.error('Email ou nom requis'); return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const planInfo = PLANS_PREMIUM.find(p => p.key === form.plan);
  const joursRestants = form.dateFin
    ? Math.ceil((new Date(form.dateFin) - new Date()) / 86400000)
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          <StarIcon className="w-5 h-5 text-amber-500"/>
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? 'Activer un abonnement Premium' : 'Modifier l\'abonnement'}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Utilisateur */}
          <div className={`grid gap-3 ${isNew ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de l'utilisateur *</label>
                <input className="input" type="email" value={form.userEmail}
                  onChange={e => f('userEmail', e.target.value)} placeholder="user@example.com"/>
              </div>
            )}
            {isNew && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom (si inconnu)</label>
                <input className="input" value={form.userNom}
                  onChange={e => f('userNom', e.target.value)} placeholder="Prénom Nom"/>
              </div>
            )}
            {!isNew && item?.user && (
              <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center">
                  <span className="font-bold text-amber-700 text-sm">
                    {item.user.prenom?.[0]}{item.user.nom?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.user.prenom} {item.user.nom}</p>
                  <p className="text-xs text-gray-500">{item.user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan d'abonnement *</label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS_PREMIUM.map(p => (
                <button key={p.key} type="button" onClick={() => handlePlanChange(p.key)}
                  className={`py-3 px-2 rounded-xl border-2 text-xs font-semibold text-center transition-colors ${
                    form.plan === p.key ? `${p.color} ${p.text} border-current` : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  <div className="text-base mb-1">{p.label.split(' ')[0]}</div>
                  <div>{p.label.split(' ').slice(1).join(' ')}</div>
                  <div className="font-bold mt-1">{p.montant ? FCFA(p.montant) : 'Sur devis'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input className="input" type="date" value={form.dateDebut}
                onChange={e => f('dateDebut', e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
              <input className="input" type="date" value={form.dateFin}
                onChange={e => f('dateFin', e.target.value)}/>
              {joursRestants !== null && (
                <p className={`text-xs mt-1 ${joursRestants > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {joursRestants > 0 ? `${joursRestants} jour(s) restant(s)` : 'Expiré'}
                </p>
              )}
            </div>
          </div>

          {/* Paiement */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant payé (FCFA)</label>
              <input className="input" type="number" value={form.montantPaye}
                onChange={e => f('montantPaye', e.target.value)} placeholder={planInfo?.montant || ''}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Méthode</label>
              <select className="input" value={form.methode} onChange={e => f('methode', e.target.value)}>
                {METHODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                <option value="OFFERT">🎁 Offert / Gratuit</option>
              </select>
            </div>
          </div>

          {/* Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input" value={form.statut} onChange={e => f('statut', e.target.value)}>
                {STATUTS_PREMIUM.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Référence paiement</label>
              <input className="input" value={form.reference}
                onChange={e => f('reference', e.target.value)} placeholder="Transaction, reçu…"/>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
            <textarea className="input resize-none" rows={2} value={form.notes}
              onChange={e => f('notes', e.target.value)}/>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50">
            <StarIcon className="w-4 h-4"/>
            {saving ? 'Sauvegarde…' : isNew ? 'Activer Premium' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Abonnements Premium ───────────────────────────────────────────────
function PremiumTab() {
  const [abonnes, setAbonnes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterPlan, setFilterPlan]   = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [search, setSearch]           = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editItem, setEditItem]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await financeAPI.getPremiumUsers({ limit: 200 });
      setAbonnes(data.data || []);
    } catch {
      // Fallback : tenter via adminAPI
      try {
        const { data } = await adminAPI.getUsers({ isPremium: true, limit: 200 });
        setAbonnes((data.data || []).map(u => ({
          id: u.id,
          user: u,
          plan: u.premiumPlan || 'mensuel',
          statut: u.premiumExpiresAt && new Date(u.premiumExpiresAt) < new Date() ? 'EXPIRE' : u.isPremium ? 'ACTIF' : 'ANNULE',
          dateDebut: u.premiumStartedAt,
          dateFin: u.premiumExpiresAt,
          montantPaye: u.premiumMontant,
          methode: u.premiumMethode,
        })));
      } catch { setAbonnes([]); }
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = abonnes.filter(a => {
    if (filterPlan   && a.plan   !== filterPlan)   return false;
    if (filterStatut && a.statut !== filterStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      const nom = `${a.user?.prenom || ''} ${a.user?.nom || ''} ${a.user?.email || ''}`.toLowerCase();
      if (!nom.includes(q)) return false;
    }
    return true;
  });

  // ── Stats ──
  const nbActifs     = abonnes.filter(a => a.statut === 'ACTIF').length;
  const nbExpires    = abonnes.filter(a => a.statut === 'EXPIRE').length;
  const revenusTotal = abonnes.filter(a => a.statut === 'ACTIF' || a.statut === 'OFFERT')
    .reduce((s, a) => s + (a.montantPaye || 0), 0);
  const expirantBientot = abonnes.filter(a => {
    if (a.statut !== 'ACTIF' || !a.dateFin) return false;
    return Math.ceil((new Date(a.dateFin) - new Date()) / 86400000) <= 30;
  }).length;

  const handleSave = async (form) => {
    if (editItem) {
      await financeAPI.updatePremium(editItem.id, form);
      toast.success('Abonnement mis à jour');
    } else {
      await financeAPI.grantPremium(form);
      toast.success('Premium activé ✅');
    }
    load();
  };

  const handleRevoke = async (a) => {
    if (!confirm(`Révoquer le Premium de ${a.user?.prenom} ${a.user?.nom} ?`)) return;
    try {
      await financeAPI.revokePremium(a.id);
      toast.success('Premium révoqué');
      load();
    } catch { toast.error('Erreur'); }
  };

  const handleRenew = async (a) => {
    const plan = PLANS_PREMIUM.find(p => p.key === a.plan);
    const days = a.plan === 'annuel' ? 365 : 30;
    const newEnd = new Date(Math.max(new Date(), new Date(a.dateFin || Date.now())) + days * 86400000)
      .toISOString().slice(0, 10);
    try {
      await financeAPI.updatePremium(a.id, { dateFin: newEnd, statut: 'ACTIF' });
      toast.success(`Prolongé jusqu'au ${new Date(newEnd).toLocaleDateString('fr-FR')}`);
      load();
    } catch { toast.error('Erreur'); }
  };

  const joursRestants = (dateFin) => {
    if (!dateFin) return null;
    return Math.ceil((new Date(dateFin) - new Date()) / 86400000);
  };

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card py-3 px-5 border-l-4 border-amber-400">
          <p className="text-2xl font-bold text-amber-600">{nbActifs}</p>
          <p className="text-sm text-gray-500">Abonnés actifs</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-green-400">
          <p className="text-xl font-bold text-green-600">{FCFA(revenusTotal)}</p>
          <p className="text-sm text-gray-500">Revenus Premium</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-orange-400">
          <p className="text-2xl font-bold text-orange-600">{expirantBientot}</p>
          <p className="text-sm text-gray-500">Expirent dans 30j</p>
        </div>
        <div className="card py-3 px-5 border-l-4 border-gray-300">
          <p className="text-2xl font-bold text-gray-600">{nbExpires}</p>
          <p className="text-sm text-gray-500">Expirés</p>
        </div>
      </div>

      {/* Plans tarifaires (rappel visuel) */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">Plans tarifaires Premium</h3>
        <div className="grid grid-cols-3 gap-4">
          {PLANS_PREMIUM.map(p => (
            <div key={p.key} className={`card border-2 ${p.color} text-center`}>
              <p className={`text-sm font-bold mb-1 ${p.text}`}>{p.label}</p>
              <p className="text-2xl font-bold text-gray-900 my-2">
                {p.montant ? FCFA(p.montant) : 'Sur devis'}
              </p>
              <p className="text-xs text-gray-500">{p.unite}</p>
              {p.badge && (
                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${p.color} ${p.text}`}>
                  {p.badge}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {abonnes.filter(a => a.plan === p.key && a.statut === 'ACTIF').length} abonné(s) actif(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres + bouton */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur…" className="input pl-9 w-52"/>
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="input w-auto">
          <option value="">Tous les plans</option>
          {PLANS_PREMIUM.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS_PREMIUM.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} abonné(s)</span>
        <button onClick={() => { setEditItem(null); setShowModal(true); }}
          className="ml-auto btn-primary flex items-center gap-2 text-sm py-2">
          <StarIcon className="w-4 h-4"/> Activer Premium manuellement
        </button>
      </div>

      {/* Alerte expiration proche */}
      {expirantBientot > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800 flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-orange-500 flex-shrink-0"/>
          <span>
            <strong>{expirantBientot} abonnement(s)</strong> expirent dans moins de 30 jours.
            Pensez à relancer ces utilisateurs.
          </span>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-14">
          <StarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
          <p className="text-gray-400 font-medium">Aucun abonné Premium</p>
          <p className="text-sm text-gray-400 mt-1">Activez manuellement un abonnement ou attendez les souscriptions via l'app</p>
          <button onClick={() => { setEditItem(null); setShowModal(true); }}
            className="btn-primary mt-4 mx-auto text-sm flex items-center gap-2 w-fit">
            <StarIcon className="w-4 h-4"/> Activer le premier abonnement
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Utilisateur', 'Plan', 'Début', 'Expiration', 'Jours restants', 'Montant', 'Méthode', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => {
                const plan       = PLANS_PREMIUM.find(p => p.key === a.plan);
                const statut     = STATUTS_PREMIUM.find(s => s.value === a.statut);
                const jours      = joursRestants(a.dateFin);
                const isExpiring = jours !== null && jours <= 30 && jours > 0;
                const isExpired  = jours !== null && jours <= 0;
                return (
                  <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                    {/* Utilisateur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-amber-700">
                            {a.user?.prenom?.[0]}{a.user?.nom?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {a.user?.prenom} {a.user?.nom}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{a.user?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${plan?.color || ''} ${plan?.text || ''}`}>
                        {plan?.label || a.plan}
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(a.dateDebut)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(a.dateFin)}</td>

                    {/* Jours restants */}
                    <td className="px-4 py-3">
                      {jours === null ? <span className="text-gray-400">—</span> : (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                          isExpired  ? 'bg-red-100 text-red-600' :
                          isExpiring ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {isExpired ? 'Expiré' : `${jours}j`}
                        </span>
                      )}
                    </td>

                    {/* Montant */}
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {a.montantPaye ? FCFA(a.montantPaye) : '—'}
                    </td>

                    {/* Méthode */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.methode === 'OFFERT' ? '🎁 Offert' : METHODES.find(m => m.value === a.methode)?.label || a.methode || '—'}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${statut?.color || 'bg-gray-100 text-gray-600'}`}>
                        {statut?.label || a.statut}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {/* Modifier */}
                        <button onClick={() => { setEditItem(a); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors" title="Modifier">
                          <PencilIcon className="w-4 h-4"/>
                        </button>
                        {/* Renouveler */}
                        {a.statut !== 'ANNULE' && (
                          <button onClick={() => handleRenew(a)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Prolonger">
                            <ArrowPathIcon className="w-4 h-4"/>
                          </button>
                        )}
                        {/* Révoquer */}
                        {a.statut === 'ACTIF' && (
                          <button onClick={() => handleRevoke(a)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Révoquer">
                            <NoSymbolIcon className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ModalPremium
          item={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Constantes dépenses ─────────────────────────────────────────────────────
const OBJETS_DEPENSE = [
  { value: 'SALAIRE',        label: '👤 Salaire / Prestataire'   },
  { value: 'INFRASTRUCTURE', label: '🖥️ Infrastructure / Cloud'   },
  { value: 'MATERIEL',       label: '🛠️ Matériel / Équipement'   },
  { value: 'MARKETING',      label: '📣 Marketing / Communication' },
  { value: 'TRANSPORT',      label: '🚗 Transport / Déplacement'  },
  { value: 'ABONNEMENT',     label: '📦 Abonnement / Licence'     },
  { value: 'FORMATION',      label: '🎓 Formation / Conférence'   },
  { value: 'JURIDIQUE',      label: '⚖️ Juridique / Administratif'},
  { value: 'AUTRE',          label: '📋 Autre'                    },
];

const STATUTS_DEPENSE = [
  { value: 'EN_ATTENTE', label: '⏳ En attente', color: 'bg-amber-100 text-amber-700 border-amber-200'  },
  { value: 'VALIDEE',    label: '✅ Validée',    color: 'bg-green-100 text-green-700 border-green-200'  },
  { value: 'REJETEE',    label: '❌ Rejetée',    color: 'bg-red-100 text-red-700 border-red-200'        },
];

// ─── Modal Dépense ────────────────────────────────────────────────────────────
function ModalDepense({ item, onClose, onSave }) {
  const EMPTY = {
    sujet: '', objet: 'INFRASTRUCTURE', description: '', montant: '',
    date: new Date().toISOString().slice(0, 10), statut: 'EN_ATTENTE',
    reference: '', fournisseur: '', pieceJointeUrl: '', pieceJointeNom: '', pieceJointeType: '',
  };
  const [form, setForm] = useState(item ? {
    sujet:           item.sujet || '',
    objet:           item.objet || 'INFRASTRUCTURE',
    description:     item.description || '',
    montant:         item.montant || '',
    date:            item.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    statut:          item.statut || 'EN_ATTENTE',
    reference:       item.reference || '',
    fournisseur:     item.fournisseur || '',
    pieceJointeUrl:  item.pieceJointeUrl || '',
    pieceJointeNom:  item.pieceJointeNom || '',
    pieceJointeType: item.pieceJointeType || '',
  } : EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef(null);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUploadPJ = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await depensesAPI.uploadPJ(fd);
      f('pieceJointeUrl',  data.url);
      f('pieceJointeNom',  data.nom);
      f('pieceJointeType', data.type);
      toast.success('Pièce jointe uploadée');
    } catch {
      toast.error('Erreur upload pièce jointe');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.sujet)   { toast.error('Le sujet est requis');  return; }
    if (!form.montant) { toast.error('Le montant est requis'); return; }
    if (!form.date)    { toast.error('La date est requise');   return; }
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {item ? 'Modifier la dépense' : 'Enregistrer une dépense'}
        </h2>

        <div className="space-y-4">
          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
            <input className="input" value={form.sujet} onChange={e => f('sujet', e.target.value)}
              placeholder="Ex: Facture Railway Mai 2026"/>
          </div>

          {/* Objet + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
              <select className="input" value={form.objet} onChange={e => f('objet', e.target.value)}>
                {OBJETS_DEPENSE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select className="input" value={form.statut} onChange={e => f('statut', e.target.value)}>
                {STATUTS_DEPENSE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Montant + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input className="input" type="number" min="0" value={form.montant}
                onChange={e => f('montant', e.target.value)} placeholder="25000"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input className="input" type="date" value={form.date} onChange={e => f('date', e.target.value)}/>
            </div>
          </div>

          {/* Fournisseur + Référence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <input className="input" value={form.fournisseur} onChange={e => f('fournisseur', e.target.value)}
                placeholder="Nom du prestataire"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Facture / Ref.</label>
              <input className="input" value={form.reference} onChange={e => f('reference', e.target.value)}
                placeholder="FAC-2026-001"/>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Objet détaillé</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={e => f('description', e.target.value)}
              placeholder="Détails de la dépense..."/>
          </div>

          {/* Pièce jointe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pièce jointe (facture, reçu…)</label>
            {form.pieceJointeUrl ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <PaperClipIcon className="w-4 h-4 text-green-600 flex-shrink-0"/>
                <a href={form.pieceJointeUrl} target="_blank" rel="noreferrer"
                  className="text-sm text-green-700 font-medium truncate flex-1 hover:underline">
                  {form.pieceJointeNom || 'Voir le fichier'}
                </a>
                <button onClick={() => { f('pieceJointeUrl',''); f('pieceJointeNom',''); f('pieceJointeType',''); }}
                  className="text-red-400 hover:text-red-600 text-xs font-bold flex-shrink-0">✕ Retirer</button>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={handleUploadPJ}/>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors text-sm disabled:opacity-50">
                  {uploading
                    ? <><span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"/><span>Upload en cours…</span></>
                    : <><PaperClipIcon className="w-4 h-4"/><span>Joindre un fichier (PDF, image, Word — max 10 Mo)</span></>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/><span>Enregistrement…</span></>
              : item ? 'Modifier' : 'Enregistrer la dépense'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Dépenses ──────────────────────────────────────────────────────────
function DepensesTab() {
  const [depenses,  setDepenses]  = useState([]);
  const [resume,    setResume]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(null);   // null | 'create' | dépense objet
  const [deleting,  setDeleting]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [filtObjet, setFiltObjet] = useState('');
  const [filtStatut,setFiltStatut]= useState('');
  const [periode,   setPeriode]   = useState('tout');

  const load = async () => {
    setLoading(true);
    try {
      const [dep, res] = await Promise.all([
        depensesAPI.getAll({ limit: 200 }),
        depensesAPI.getResume({ periode }),
      ]);
      setDepenses(dep.data?.data ?? []);
      setResume(res.data ?? null);
    } catch { setDepenses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [periode]);

  const handleSave = async (form) => {
    if (modal === 'create') {
      await depensesAPI.create(form);
      toast.success('Dépense enregistrée');
    } else {
      await depensesAPI.update(modal.id, form);
      toast.success('Dépense modifiée');
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    setDeleting(id);
    try {
      await depensesAPI.delete(id);
      toast.success('Dépense supprimée');
      load();
    } catch { toast.error('Erreur suppression'); }
    finally { setDeleting(null); }
  };

  // Filtrage local
  const filtered = depenses.filter(d => {
    if (filtObjet  && d.objet  !== filtObjet)  return false;
    if (filtStatut && d.statut !== filtStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      return (d.sujet?.toLowerCase().includes(q)
           || d.fournisseur?.toLowerCase().includes(q)
           || d.reference?.toLowerCase().includes(q)
           || d.description?.toLowerCase().includes(q));
    }
    return true;
  });

  const totalFiltre = filtered.reduce((s, d) => s + (d.montant || 0), 0);

  const OBJET_COLORS = {
    SALAIRE:        'bg-blue-100 text-blue-700',
    INFRASTRUCTURE: 'bg-violet-100 text-violet-700',
    MATERIEL:       'bg-amber-100 text-amber-700',
    MARKETING:      'bg-pink-100 text-pink-700',
    TRANSPORT:      'bg-cyan-100 text-cyan-700',
    ABONNEMENT:     'bg-indigo-100 text-indigo-700',
    FORMATION:      'bg-teal-100 text-teal-700',
    JURIDIQUE:      'bg-orange-100 text-orange-700',
    AUTRE:          'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">

      {/* ── KPIs résumé ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total dépenses',     value: resume?.totalMontant     ?? 0, color: 'bg-red-500',    icon: ArrowTrendingDownIcon },
          { label: 'Dépenses validées',  value: resume?.montantValide    ?? 0, color: 'bg-green-600',  icon: CheckCircleIcon       },
          { label: 'En attente',         value: resume?.montantEnAttente ?? 0, color: 'bg-amber-500',  icon: ClockIcon             },
          { label: 'Nb. de dépenses',    value: resume?.totalDepenses    ?? 0, color: 'bg-primary-600',icon: ChartBarIcon          },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${k.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <k.icon className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">
                {k.label === 'Nb. de dépenses'
                  ? k.value
                  : FCFA(k.value)
                }
              </p>
              <p className="text-xs text-gray-500 font-medium leading-tight mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Répartition par catégorie ─────────────────────────────────── */}
      {resume?.parObjet?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 text-primary-500"/>
            Répartition par catégorie
          </h3>
          <div className="space-y-2">
            {resume.parObjet.sort((a, b) => b.montant - a.montant).map(p => {
              const pct = resume.totalMontant > 0 ? Math.round(p.montant / resume.totalMontant * 100) : 0;
              const obj = OBJETS_DEPENSE.find(o => o.value === p.objet);
              return (
                <div key={p.objet}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{obj?.label ?? p.objet}</span>
                    <span className="font-bold">{FCFA(p.montant)} <span className="text-gray-400">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Barre d'outils ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          {/* Recherche */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
            <input
              className="input pl-9 w-56 text-sm"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filtre catégorie */}
          <select className="input text-sm w-44" value={filtObjet} onChange={e => setFiltObjet(e.target.value)}>
            <option value="">Toutes catégories</option>
            {OBJETS_DEPENSE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Filtre statut */}
          <select className="input text-sm w-36" value={filtStatut} onChange={e => setFiltStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            {STATUTS_DEPENSE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Période résumé */}
          <select className="input text-sm w-36" value={periode} onChange={e => setPeriode(e.target.value)}>
            {PERIODE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 text-sm font-semibold shadow-sm">
          <PlusIcon className="w-4 h-4"/>
          Nouvelle dépense
        </button>
      </div>

      {/* Total filtré */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-500 font-medium">
          {filtered.length} dépense{filtered.length > 1 ? 's' : ''} — Total affiché : <strong className="text-red-600">{FCFA(totalFiltre)}</strong>
        </p>
      )}

      {/* ── Table des dépenses ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <span className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <ArrowTrendingDownIcon className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p className="font-semibold">Aucune dépense enregistrée</p>
          <p className="text-sm mt-1">Cliquez sur "Nouvelle dépense" pour commencer</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Sujet / Fournisseur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Montant</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Statut</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">PJ</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(dep => {
                  const statut = STATUTS_DEPENSE.find(s => s.value === dep.statut) || STATUTS_DEPENSE[0];
                  const obj    = OBJETS_DEPENSE.find(o => o.value === dep.objet);
                  return (
                    <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                      {/* Date */}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {fmtDate(dep.date)}
                      </td>

                      {/* Sujet */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{dep.sujet}</p>
                        {dep.fournisseur && <p className="text-xs text-gray-400 mt-0.5">{dep.fournisseur}</p>}
                        {dep.reference   && <p className="text-xs text-gray-400 font-mono">#{dep.reference}</p>}
                        {dep.description && (
                          <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-1">{dep.description}</p>
                        )}
                      </td>

                      {/* Catégorie */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${OBJET_COLORS[dep.objet] || 'bg-gray-100 text-gray-600'}`}>
                          {obj?.label ?? dep.objet}
                        </span>
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-red-600 text-sm">{FCFA(dep.montant)}</span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statut.color}`}>
                          {statut.label}
                        </span>
                      </td>

                      {/* Pièce jointe */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {dep.pieceJointeUrl ? (
                          <a href={dep.pieceJointeUrl} target="_blank" rel="noreferrer"
                            title={dep.pieceJointeNom || 'Voir la pièce jointe'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors">
                            <PaperClipIcon className="w-4 h-4"/>
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setModal(dep)} title="Modifier"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 hover:text-amber-700 transition-colors">
                            <PencilIcon className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDelete(dep.id)} disabled={deleting === dep.id}
                            title="Supprimer"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40">
                            {deleting === dep.id
                              ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block"/>
                              : <TrashIcon className="w-4 h-4"/>
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ModalDepense
          item={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function FinancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState('tarifs');
  const [exportingPDF, setExportingPDF] = useState(false);
  const reportRef = useRef(null);

  const TAB_LABELS = {
    tarifs:        'Tarifs & Paiements',
    contributions: 'Contributions',
    depenses:      'Dépenses',
    comptabilite:  'Comptabilité',
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    setExportingPDF(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

      // En-tête
      pdf.setFillColor(11, 61, 46);
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Finance — ${TAB_LABELS[activeTab]}`, margin, 12);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Généré le ${today}`, pageW - margin, 12, { align: 'right' });

      // Contenu paginé
      const contentY = 22;
      const availH = pageH - contentY - margin;
      let yOffset = 0;
      while (yOffset < imgH) {
        if (yOffset > 0) { pdf.addPage(); }
        const sliceH = Math.min(availH, imgH - yOffset);
        const srcY = (yOffset / imgH) * canvas.height;
        const srcH = (sliceH / imgH) * canvas.height;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = srcH;
        sliceCanvas.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, yOffset === 0 ? contentY : margin, usableW, sliceH);
        yOffset += availH;
      }

      pdf.save(`finance_${activeTab}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingPDF(false);
    }
  };

  const TABS = [
    { key: 'tarifs',        label: '💰 Tarifs & Paiements',      icon: BanknotesIcon          },
    { key: 'contributions', label: '🤝 Contributions',            icon: UserGroupIcon          },
    { key: 'depenses',      label: '💸 Dépenses',                 icon: ArrowTrendingDownIcon  },
    { key: 'comptabilite',  label: '📊 Comptabilité',             icon: ChartBarIcon           },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingLibraryIcon className="w-7 h-7 text-primary-500"/>
            Finance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des droits, paiements, contributions et comptabilité de la plateforme
          </p>
        </div>
        <button onClick={exportPDF} disabled={exportingPDF}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-300 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-sm font-semibold disabled:opacity-50">
          {exportingPDF
            ? <><span className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"/><span>Export…</span></>
            : <><DocumentArrowDownIcon className="w-4 h-4"/><span>Exporter PDF</span></>
          }
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors -mb-px ${
              activeTab === tab.key
                ? 'bg-white border border-b-white border-gray-200 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="w-4 h-4"/>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div ref={reportRef}>
        {activeTab === 'tarifs'        && <TarifsTab isAdmin={isAdmin}/>}
        {activeTab === 'contributions' && <ContributionsTab/>}
        {activeTab === 'depenses'      && <DepensesTab/>}
        {activeTab === 'comptabilite'  && <ComptabiliteTab/>}
      </div>
      <PageHelp pageId="finance" />
    </div>
  );
}
