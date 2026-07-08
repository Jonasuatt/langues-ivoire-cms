/**
 * Page publique de suppression de données — exigence Google Play / ARTCI.
 * Accessible sans connexion : /suppression-donnees
 */
export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="LANGUES IVOIRE" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <h1 className="text-xl font-black text-gray-900">Suppression de vos données</h1>
            <p className="text-sm text-gray-500">LANGUES IVOIRE — application d'apprentissage des langues de Côte d'Ivoire</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-bold text-gray-900 mb-2">🗑️ Supprimer votre compte depuis l'application</h2>
            <p>
              Ouvrez l'application LANGUES IVOIRE, puis :
              <b> Profil → Supprimer mon compte</b> (en bas de la page, sous « Se déconnecter »).
              Confirmez avec votre mot de passe. La suppression est immédiate et définitive.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">📋 Ce qui est supprimé</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Vos données personnelles : nom, prénom, email, numéro de téléphone, photo, date de naissance</li>
              <li>Vos identifiants de connexion (mot de passe, comptes Google/Facebook liés)</li>
              <li>Votre progression, vos cartes de révision et vos notifications</li>
              <li>Vos appartenances aux classes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">🏺 Ce qui est conservé (anonymement)</h2>
            <p>
              Vos contributions linguistiques (mots proposés, enregistrements audio validés) sont conservées
              dans le corpus patrimonial des langues ivoiriennes, <b>sans aucune donnée personnelle attachée</b>.
              Elles participent à la préservation scientifique des langues (intérêt légitime — partenariat
              Institut de Linguistique Appliquée, Université Félix Houphouët-Boigny).
            </p>
          </section>

          <section>
            <h2 className="font-bold text-gray-900 mb-2">✉️ Sans accès à l'application ?</h2>
            <p>
              Si vous ne pouvez plus vous connecter, envoyez votre demande de suppression
              (avec l'email ou le numéro de téléphone du compte) à :
              <b> ouattaranogolourgo@gmail.com</b> — traitement sous 30 jours maximum.
            </p>
          </section>
        </div>

        <p className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
          LANGUES IVOIRE respecte la loi ivoirienne n°2013-450 relative à la protection des données
          à caractère personnel (ARTCI). Voir aussi notre <a href="/privacy" className="underline">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
