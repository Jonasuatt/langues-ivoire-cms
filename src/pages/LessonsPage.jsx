import { useEffect, useState } from 'react';
import { lessonsAPI, languagesAPI } from '../services/api';
import { PlusIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LEVEL_COLORS = { A1: 'bg-green-100 text-green-700', A2: 'bg-teal-100 text-teal-700',
  B1: 'bg-blue-100 text-blue-700', B2: 'bg-purple-100 text-purple-700', C1: 'bg-red-100 text-red-700' };

export default function LessonsPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      setLanguages(data);
      if (data.length) setSelectedLang(data[0].code);
    });
  }, []);

  useEffect(() => {
    if (!selectedLang) return;
    setLoading(true);
    lessonsAPI.getByLanguage(selectedLang)
      .then(({ data }) => setLessons(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedLang]);

  const byLevel = lessons.reduce((acc, l) => {
    if (!acc[l.niveau]) acc[l.niveau] = [];
    acc[l.niveau].push(l);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leçons</h1>
          <p className="text-gray-500 text-sm mt-1">{lessons.length} leçon(s) au total</p>
        </div>
      </div>

      {/* Sélecteur de langue */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {languages.map(l => (
          <button key={l.id}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLang === l.code ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedLang(l.code)}>
            {l.nom}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      ) : lessons.length === 0 ? (
        <div className="card text-center py-16">
          <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Aucune leçon pour cette langue</p>
        </div>
      ) : (
        <div className="space-y-6">
          {LEVELS.filter(l => byLevel[l]?.length > 0).map(niveau => (
            <div key={niveau}>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Niveau {niveau}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {byLevel[niveau].map(lesson => (
                  <div key={lesson.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${LEVEL_COLORS[lesson.niveau]}`}>{lesson.niveau}</span>
                          <span className="text-xs text-gray-400">#{lesson.ordre}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{lesson.titre}</h4>
                        {lesson.description && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-accent">{lesson.pointsXp} XP</p>
                        <p className="text-xs text-gray-400">{lesson._count?.steps ?? 0} étapes</p>
                      </div>
                    </div>
                    {lesson.progress && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className={`badge ${lesson.progress.statut === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {lesson.progress.statut === 'completed' ? 'Terminée' : 'En cours'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
