import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <BellIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Envoi de notifications push aux utilisateurs de l'application mobile</p>
          </div>
        </div>
      </div>

      {/* Stats vides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Envoyées (30j)', value: '—' },
          { label: 'Taux d\'ouverture', value: '—' },
          { label: 'Appareils enregistrés', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
        <BellIcon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-blue-800 mb-1">Fonctionnalité en cours de développement</h2>
          <p className="text-sm text-blue-700">
            Ce module permettra de composer et d'envoyer des notifications push ciblées aux utilisateurs
            (rappels d'apprentissage, annonces de nouveaux contenus, événements culturels).
            Disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
