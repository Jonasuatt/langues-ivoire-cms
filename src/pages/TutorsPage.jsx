import { useEffect, useState } from 'react';
import { tutorsAPI } from '../services/api';

const AVATAR_COLORS = ['#0B3D2E','#1565C0','#6A1B9A','#E65100','#00695C','#AD1457','#4E342E','#37474F'];

export default function TutorsPage() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tutorsAPI.getAll()
      .then(({ data }) => setTutors(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tuteurs IA</h1>
        <p className="text-gray-500 text-sm mt-1">Configuration des 8 Tuteurs Ethniques Virtuels (TEV)</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor, i) => (
            <div key={tutor.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {tutor.nomAvatar[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{tutor.nomAvatar}</h3>
                    <span className="badge bg-accent/10 text-accent">{tutor.language?.nom}</span>
                    <span className={`badge ml-auto ${tutor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {tutor.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  {tutor.personalite && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{tutor.personalite}</p>
                  )}
                  <div className="mt-3 flex gap-4 text-xs text-gray-400">
                    <span>Voix : {tutor.voixConfig?.vitesse ?? 1.0}x</span>
                    <span>Code : {tutor.language?.code}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
