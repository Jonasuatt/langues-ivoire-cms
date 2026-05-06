import { VideoCameraIcon } from '@heroicons/react/24/outline';

export default function VideosPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <VideoCameraIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vidéos pédagogiques</h1>
            <p className="text-sm text-gray-500">Gestion des vidéos d'apprentissage par langue</p>
          </div>
        </div>
      </div>

      {/* Stats vides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Vidéos publiées', value: '—' },
          { label: 'En attente', value: '—' },
          { label: 'Langues couvertes', value: '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-700">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
        <VideoCameraIcon className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-amber-800 mb-1">Fonctionnalité en cours de développement</h2>
          <p className="text-sm text-amber-700">
            La gestion des vidéos pédagogiques sera disponible prochainement. Ce module permettra
            d'importer, catégoriser et associer des vidéos aux leçons et modules de chaque langue.
          </p>
        </div>
      </div>
    </div>
  );
}
