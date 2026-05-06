import { TrophyIcon } from '@heroicons/react/24/outline';

export default function BadgesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <TrophyIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Badges & XP</h1>
            <p className="text-sm text-gray-500">Gestion des badges de progression et des points d'expérience</p>
          </div>
        </div>
      </div>

      {/* Stats vides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Badges créés', value: '—' },
          { label: 'Badges attribués', value: '—' },
          { label: 'XP moyen / utilisateur', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
        <TrophyIcon className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-yellow-800 mb-1">Fonctionnalité en cours de développement</h2>
          <p className="text-sm text-yellow-700">
            Ce module permettra de créer et gérer les badges de compétence, de définir les seuils de points XP,
            de configurer les récompenses et de suivre la progression gamifiée des apprenants.
            Disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
