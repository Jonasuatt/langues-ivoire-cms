import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { publicSuggestionsAPI } from '../services/api';

/**
 * « Une idée ? Écrivez-nous » (languesivoire.ci/propositions), sur le modèle de mondje.ci/propositions.
 * Les messages sont enregistrés par l'API ; l'équipe répond depuis le CMS et peut publier l'échange
 * (seulement avec l'accord de l'auteur, jamais le contact).
 */
const EMAIL = 'contact@languesivoire.ci';
const WHATSAPP = '2250565750303';

export default function PropositionsPage() {
  const [nom, setNom] = useState('');
  const [contact, setContact] = useState('');
  const [texte, setTexte] = useState('');
  const [publiable, setPubliable] = useState(false);
  const [piege, setPiege] = useState('');
  const [etat, setEtat] = useState(null); // { ok: bool, msg: string }
  const [envoi, setEnvoi] = useState(false);
  const [echanges, setEchanges] = useState([]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Une idée, une remarque ? — LANGUES IVOIRE';
    window.scrollTo(0, 0);
    publicSuggestionsAPI.published().then((r) => setEchanges(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    return () => { document.title = prev; };
  }, []);

  const envoyer = async (e) => {
    e.preventDefault();
    if (texte.trim().length < 5) return setEtat({ ok: false, msg: 'Écrivez au moins quelques mots.' });
    setEnvoi(true);
    try {
      await publicSuggestionsAPI.send({ nom, contact, texte, publiable, siteWeb: piege });
      setNom(''); setContact(''); setTexte(''); setPubliable(false);
      setEtat({ ok: true, msg: `Merci ! Votre message est bien arrivé. L’équipe LANGUES IVOIRE vous répondra${contact.trim() ? '' : ' (si vous nous laissez un contact la prochaine fois, nous pourrons vous écrire directement)'}.` });
    } catch (err) {
      setEtat({ ok: false, msg: err.response?.data?.error || 'Envoi impossible. Vérifiez votre connexion et réessayez.' });
    } finally { setEnvoi(false); }
  };

  const champ = 'w-full rounded-xl border border-black/15 bg-white px-3.5 py-3 text-[#1B2420] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]';

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1B2420]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <header className="border-b border-black/5 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/landing/logo.webp" alt="" className="h-9 w-auto" />
            <span className="text-[15px] font-extrabold tracking-wide text-[#0B3D2E]">LANGUES IVOIRE</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#34413b] hover:text-[#F47920]"><ArrowLeftIcon className="h-4 w-4" /> Retour au site</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47920]">Écrivez-nous</p>
        <h1 className="mt-2 text-4xl font-extrabold text-[#0B3D2E]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Une idée, une remarque ?</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-[#4a5750]">
          LANGUES IVOIRE se construit avec ceux qui s’en servent. Dites-nous ce qui manque, ce qui gêne, une langue que vous aimeriez
          voir arriver. Notre équipe lit chaque message et répond.
        </p>

        <form className="mt-8 grid max-w-xl gap-4" onSubmit={envoyer} noValidate>
          <label className="grid gap-1.5 font-semibold">Votre nom <span className="text-sm font-normal text-[#56635c]">(un prénom suffit)</span>
            <input className={champ} type="text" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} autoComplete="given-name" />
          </label>
          <label className="grid gap-1.5 font-semibold">Votre WhatsApp ou votre e-mail <span className="text-sm font-normal text-[#56635c]">(facultatif — pour que nous puissions vous répondre en privé ; il n’est jamais affiché)</span>
            <input className={champ} type="text" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={120} autoComplete="off" inputMode="email" />
          </label>
          <label className="grid gap-1.5 font-semibold">Votre message
            <textarea className={`${champ} min-h-[150px] resize-y`} value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={2000}
              placeholder="Par exemple : « Ce serait bien de pouvoir… »" />
          </label>
          <label className="flex items-start gap-2.5 text-[15px] text-[#56635c]">
            <input type="checkbox" checked={publiable} onChange={(e) => setPubliable(e.target.checked)} className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#0B3D2E]" />
            <span>J’accepte que mon message et la réponse de l’équipe puissent être affichés sur cette page, avec mon prénom (jamais mon contact). Cela peut aider d’autres personnes qui se posent la même question.</span>
          </label>
          {/* Piège à robots : invisible pour les humains */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Ne pas remplir<input type="text" tabIndex={-1} autoComplete="off" value={piege} onChange={(e) => setPiege(e.target.value)} /></label>
          </div>
          <div>
            <button type="submit" disabled={envoi} className="inline-flex items-center gap-2 rounded-full bg-[#F47920] px-7 py-3 font-bold text-white hover:bg-[#e06a14] disabled:opacity-60">
              <PaperAirplaneIcon className="h-5 w-5" /> {envoi ? 'Envoi…' : 'Envoyer mon message'}
            </button>
          </div>
          {etat && (
            <p role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm ${etat.ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-800'}`}>{etat.msg}</p>
          )}
        </form>

        <p className="mt-8 max-w-xl text-sm text-[#56635c]">
          Plutôt par téléphone ? Écrivez-nous sur <a className="font-semibold text-[#0B3D2E] underline" href={`https://wa.me/${WHATSAPP}`}>WhatsApp au 05 65 75 03 03</a>{' '}
          ou à <a className="font-semibold text-[#0B3D2E] underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>. Votre message n’est lu que par l’équipe LANGUES IVOIRE.
        </p>

        {echanges.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold text-[#0B3D2E]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>Vos propositions, nos réponses</h2>
            <div className="mt-5 grid gap-4">
              {echanges.map((x, i) => (
                <article key={i} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                  <p className="whitespace-pre-wrap">{x.texte}</p>
                  <p className="mt-1 text-sm text-[#56635c]">{x.nom} · {new Date(x.repondueLe).toLocaleDateString('fr-FR')}</p>
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#E8F5EE] px-4 py-3"><b className="text-[#0B3D2E]">LANGUES IVOIRE : </b>{x.reponse}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-black/5 px-4 py-6 text-center text-xs text-[#56635c]">
        © 2026 LANGUES IVOIRE · <Link to="/" className="underline">Accueil</Link> · <Link to="/privacy" className="underline">Confidentialité</Link>
      </footer>
    </div>
  );
}
