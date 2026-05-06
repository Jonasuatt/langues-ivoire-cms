import { CpuChipIcon } from '@heroicons/react/24/outline';

export default function IALinguistiquePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <CpuChipIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IA Linguistique</h1>
            <p className="text-sm text-gray-500">Paramètres et gestion des agents IA spécialisés en langues ivoiriennes</p>
          </div>
        </div>
      </div>

      {/* Stats vides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Agents actifs', value: '—' },
          { label: 'Langues traitées', value: '—' },
          { label: 'Requêtes (7j)', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex items-start gap-4">
        <CpuChipIcon className="w-8 h-8 text-purple-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-purple-800 mb-1">Fonctionnalité en cours de développement</h2>
          <p className="text-sm text-purple-700">
            Ce module centralise la configuration des agents IA linguistiques : modèles de transcription,
            traduction automatique, reconnaissance phonétique et génération de contenu adapté aux langues ethniques ivoiriennes.
            Disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
