import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageHelp from '../components/PageHelp';
import { suggestionsAPI } from '../services/api';
import { LightBulbIcon, EyeIcon, TrashIcon, CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const ONGLETS = [['NOUVEAU', 'Nouveaux'], ['REPONDU', 'Répondus'], ['TOUS', 'Toutes']];
const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function Carte({ s, onChange, onDelete }) {
  const [rep, setRep] = useState(s.reponse || '');
  const [busy, setBusy] = useState(false);
  const modifie = rep.trim() !== (s.reponse || '');

  const maj = async (data, ok) => {
    setBusy(true);
    try { const r = await suggestionsAPI.update(s.id, data); onChange(r.data); if (ok) toast.success(ok); }
    catch (e) { toast.error(e.response?.data?.error || 'Action impossible'); }
    finally { setBusy(false); }
  };

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm ${s.statut === 'NOUVEAU' ? 'border-blue-300' : 'border-gray-200'}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="font-semibold text-gray-800">{s.nom || 'Anonyme'}</span>
        <span>· {fmt(s.createdAt)}</span>
        {s.statut === 'NOUVEAU' && <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">Nouveau</span>}
        {s.statut === 'REPONDU' && <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">Répondu</span>}
        {s.publiable
          ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Accord de publication</span>
          : <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">Privé (pas d'accord de publication)</span>}
        {s.publiee && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700"><GlobeAltIcon className="h-3.5 w-3.5" /> Publié sur le site</span>}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-900">{s.texte}</p>
      {s.contact && <p className="mt-1 text-xs text-gray-500">Contact (privé) : <span className="font-medium text-gray-700">{s.contact}</span></p>}

      <textarea value={rep} onChange={(e) => setRep(e.target.value)} maxLength={2000} rows={3} placeholder="Votre réponse…"
        className="mt-3 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button disabled={busy || !modifie || rep.trim().length < 2} onClick={() => maj({ reponse: rep }, 'Réponse enregistrée')}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40">Enregistrer la réponse</button>
        <button disabled={busy || !s.reponse || !s.publiable || modifie} title={!s.publiable ? "L'auteur n'a pas donné son accord" : (!s.reponse ? 'Écrivez d\'abord une réponse' : '')}
          onClick={() => maj({ publiee: !s.publiee }, s.publiee ? 'Retiré du site' : 'Publié sur le site')}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-40 ${s.publiee ? 'border-orange-400 text-orange-700' : 'border-emerald-500 text-emerald-700'}`}>
          <GlobeAltIcon className="h-4 w-4" /> {s.publiee ? 'Retirer du site' : 'Publier sur le site'}
        </button>
        {s.statut === 'NOUVEAU' && (
          <button disabled={busy} onClick={() => maj({ statut: 'LU' })} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600">
            <EyeIcon className="h-4 w-4" /> Marquer comme lu
          </button>
        )}
        <button disabled={busy} onClick={() => onDelete(s)} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50">
          <TrashIcon className="h-4 w-4" /> Supprimer
        </button>
      </div>
    </article>
  );
}

export default function PropositionsAdminPage() {
  const [onglet, setOnglet] = useState('NOUVEAU');
  const [tout, setTout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [touche, setTouche] = useState(() => new Set()); // cartes modifiées dans cette session : elles restent affichées pour pouvoir les publier

  const charger = useCallback(async () => {
    setLoading(true);
    try { setTout((await suggestionsAPI.list()).data); }
    catch { toast.error('Chargement impossible'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { charger(); }, [charger]);

  const nb = (st) => tout.filter((s) => (st === 'TOUS' ? true : st === 'NOUVEAU' ? s.statut !== 'REPONDU' : s.statut === st)).length;
  const liste = tout.filter((s) => (onglet === 'TOUS' ? true : onglet === 'NOUVEAU' ? (s.statut !== 'REPONDU' || touche.has(s.id)) : s.statut === onglet));

  const supprimer = async (s) => {
    if (!window.confirm('Supprimer définitivement cette proposition ?')) return;
    try { await suggestionsAPI.remove(s.id); setTout((t) => t.filter((x) => x.id !== s.id)); toast.success('Supprimée'); }
    catch { toast.error('Suppression impossible'); }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><LightBulbIcon className="h-6 w-6" /></span>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Propositions du public</h1>
          <p className="text-sm text-gray-500">Messages reçus via « Une idée ? Écrivez-nous » sur languesivoire.ci. Le contact de l'auteur reste privé.</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {ONGLETS.map(([id, label]) => (
          <button key={id} onClick={() => { setOnglet(id); setTouche(new Set()); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${onglet === id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label} <span className="opacity-70">{nb(id)}</span>
          </button>
        ))}
      </div>

      {loading ? <p className="py-10 text-center text-gray-400">Chargement…</p>
        : liste.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
            <CheckCircleIcon className="mx-auto mb-2 h-8 w-8" /> Rien à traiter pour l'instant.
          </div>
        ) : (
          <div className="space-y-3">
            {liste.map((s) => <Carte key={s.id} s={s} onDelete={supprimer} onChange={(n) => { setTouche((p) => new Set(p).add(n.id)); setTout((t) => t.map((x) => (x.id === n.id ? n : x))); }} />)}
          </div>
        )}
      <PageHelp pageId="propositions" />
    </div>
  );
}
