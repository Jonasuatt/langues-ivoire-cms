import { BeakerIcon } from '@heroicons/react/24/outline';

export default function TestAgentsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BeakerIcon className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Agents IA</h1>
            <p className="text-sm text-gray-500">Interface de test et validation des agents intelligents</p>
          </div>
        </div>
      </div>

      {/* Stats vides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Tests réalisés', value: '—' },
          { label: 'Agents disponibles', value: '—' },
          { label: 'Taux de réussite', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 flex items-start gap-4">
        <BeakerIcon className="w-8 h-8 text-teal-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-teal-800 mb-1">Fonctionnalité en cours de développement</h2>
          <p className="text-sm text-teal-700">
            L'interface de test permettra d'envoyer des requêtes aux agents IA, d'évaluer leurs réponses,
            d'ajuster les paramètres et de valider les performances avant déploiement en production.
            Disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
