export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
          <p className="text-gray-500 mt-2">Langues Ivoire — Application mobile</p>
          <p className="text-sm text-gray-400 mt-1">Dernière mise à jour : 13 avril 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p>
              Langues Ivoire est une application mobile dédiée à l'apprentissage des langues ethniques
              ivoiriennes (Baoulé, Dioula, Bété, Sénoufo, Agni, Gouro, Guéré, Nouchi).
              Nous nous engageons à protéger la confidentialité de vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Informations de compte :</strong> nom, prénom, adresse e-mail, mot de passe (chiffré)</li>
              <li><strong>Progression d'apprentissage :</strong> leçons complétées, scores, niveau, badges obtenus, streak</li>
              <li><strong>Contributions :</strong> mots, phrases et images soumis par les utilisateurs</li>
              <li><strong>Enregistrements audio :</strong> uniquement lors de l'utilisation de la fonctionnalité de prononciation (avec votre permission)</li>
              <li><strong>Photos :</strong> uniquement lors des contributions d'images (avec votre permission)</li>
              <li><strong>Données d'utilisation :</strong> dernière connexion, préférences de langue</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fournir et personnaliser votre expérience d'apprentissage</li>
              <li>Suivre votre progression et vous attribuer des badges</li>
              <li>Envoyer des notifications (rappels de streak, badges gagnés) si vous l'autorisez</li>
              <li>Améliorer le contenu de la plateforme grâce aux contributions</li>
              <li>Générer des statistiques anonymisées pour améliorer l'application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Stockage et sécurité</h2>
            <p>
              Vos données sont stockées de manière sécurisée sur des serveurs protégés.
              Les mots de passe sont chiffrés avec bcrypt. Les communications entre l'application
              et nos serveurs sont sécurisées par HTTPS/TLS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Mode hors-ligne</h2>
            <p>
              L'application permet le téléchargement de contenu pour un usage hors-ligne.
              Ces données sont stockées localement sur votre appareil et ne sont pas partagées
              avec des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Partage des données</h2>
            <p>
              Nous ne vendons ni ne partageons vos données personnelles avec des tiers.
              Les contributions approuvées (mots, phrases) sont rendues disponibles à tous
              les utilisateurs de la plateforme, sans mention de données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Permissions de l'appareil</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Microphone :</strong> pour la pratique de prononciation (optionnel)</li>
              <li><strong>Caméra :</strong> pour les contributions d'images (optionnel)</li>
              <li><strong>Notifications :</strong> pour les rappels d'apprentissage (désactivable dans les paramètres)</li>
              <li><strong>Internet :</strong> pour synchroniser votre progression et accéder au contenu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Droits des utilisateurs</h2>
            <p>Vous avez le droit de :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Accéder à vos données personnelles</li>
              <li>Demander la modification de vos informations</li>
              <li>Demander la suppression de votre compte et de vos données</li>
              <li>Désactiver les notifications à tout moment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Enfants</h2>
            <p>
              L'application peut être utilisée par des mineurs dans un cadre éducatif.
              Nous ne collectons pas sciemment de données supplémentaires auprès des enfants
              de moins de 13 ans sans le consentement parental.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer
              vos droits, contactez-nous à :
            </p>
            <p className="font-medium">contact@languesivoire.ci</p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-gray-400">
          © 2026 Langues Ivoire. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
