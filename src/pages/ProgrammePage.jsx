import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const CYCLES_ORDER = ['PRIMAIRE', 'COLLEGE', 'LYCEE', 'CHERCHEUR'];
const CYCLE_LABELS = { PRIMAIRE: 'Primaire', COLLEGE: 'Collège', LYCEE: 'Lycée', CHERCHEUR: 'Parcours Chercheur' };
const CYCLE_COLORS = {
  PRIMAIRE:  { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800',  title: 'text-green-800'  },
  COLLEGE:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800',    title: 'text-blue-800'   },
  LYCEE:     { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800',title: 'text-purple-800' },
  CHERCHEUR: { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800',  title: 'text-amber-800'  },
};
const PILIER_CONFIG = {
  LANGUE_COMMUNICATION: { label: 'Langue & Communication',    icon: '🗣️', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  CULTURE_CITOYENNETE:  { label: 'Culture & Citoyenneté',     icon: '🏛️', color: 'text-emerald-700',bg: 'bg-emerald-50',border: 'border-emerald-200' },
  PRATIQUE_METIERS:     { label: 'Pratique & Métiers',        icon: '🔧', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200'  },
  SANS_PILIER:          { label: 'Sans pilier',               icon: '📌', color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200'    },
};
const TRIM_LABELS  = { T1: '1er Trimestre', T2: '2e Trimestre', T3: '3e Trimestre', SANS_TRIMESTRE: 'Sans trimestre' };

export default function ProgrammePage() {
  const [languages, setLanguages]   = useState([]);
  const [langId, setLangId]         = useState('');
  const [programme, setProgramme]   = useState(null);
  const [loading, setLoading]       = useState(false);
  const [openGrades, setOpenGrades] = useState({});   // gradeLevelId → bool
  const [openPiliers, setOpenPiliers] = useState({}); // `${gradeLevelId}_${pilier}` → bool
  const printRef = useRef();

  // Charger les langues
  useEffect(() => {
    api.get('/languages').then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.languages ?? []);
      setLanguages(list);
      if (list.length > 0) setLangId(list[0].id);
    }).catch(() => {});
  }, []);

  // Charger le programme quand la langue change
  useEffect(() => {
    if (!langId) return;
    setLoading(true);
    api.get('/curriculum/programme', { params: { languageId: langId } })
      .then(({ data }) => {
        setProgramme(data.programme);
        // Ouvrir toutes les classes par défaut
        const gradeOpen = {};
        Object.values(data.programme).flat().forEach(g => { gradeOpen[g.id] = true; });
        setOpenGrades(gradeOpen);
        setOpenPiliers({});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [langId]);

  const toggleGrade  = (id) => setOpenGrades(p  => ({ ...p, [id]: !p[id] }));
  const togglePilier = (key) => setOpenPiliers(p => ({ ...p, [key]: !p[key] }));

  const handlePrint = () => window.print();

  const selectedLang = languages.find(l => l.id === langId);

  // Compte le nb de leçons dans un pilier
  const pilierTotal = (lecons, pilier) => {
    if (!lecons[pilier]) return 0;
    return Object.values(lecons[pilier]).reduce((acc, arr) => acc + arr.length, 0);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">📋 Table des Matières</h1>
          <p className="text-sm text-gray-500 mt-1">Programme scolaire par classe et par pilier</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={langId}
            onChange={e => setLangId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.emoji ?? '📚'} {l.nom}</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition flex items-center gap-2 print:hidden"
          >
            🖨️ Imprimer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Chargement du programme…</div>
      ) : !programme ? (
        <div className="text-center py-20 text-gray-300 text-4xl">📋</div>
      ) : (
        <div ref={printRef} className="space-y-8 print-content">
          {/* Titre d'impression */}
          <div className="hidden print:block mb-8 border-b-2 border-gray-300 pb-4">
            <h2 className="text-2xl font-black text-center">Programme Scolaire — {selectedLang?.nom}</h2>
            <p className="text-center text-gray-500 text-sm mt-1">LANGUES IVOIRE · Institut de Langues Africaines</p>
          </div>

          {CYCLES_ORDER.filter(c => programme[c]?.length > 0).map(cycle => {
            const cc = CYCLE_COLORS[cycle] ?? CYCLE_COLORS.PRIMAIRE;
            const grades = programme[cycle] ?? [];
            const cycleTotal = grades.reduce((a, g) => a + g.total.TOTAL, 0);

            return (
              <div key={cycle}>
                {/* En-tête cycle */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${cc.bg} border ${cc.border} mb-3`}>
                  <h2 className={`text-lg font-black ${cc.title} flex-1`}>{CYCLE_LABELS[cycle]}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${cc.badge}`}>
                    {grades.length} classe{grades.length > 1 ? 's' : ''} · {cycleTotal} leçon{cycleTotal > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 pl-2">
                  {grades.map(grade => {
                    const isOpen = openGrades[grade.id] ?? true;
                    return (
                      <div key={grade.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                        {/* Ligne classe */}
                        <button
                          onClick={() => toggleGrade(grade.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition print:cursor-default"
                        >
                          <span className="text-lg print:hidden">{isOpen ? '▼' : '▶'}</span>
                          <span className="font-black text-gray-800 flex-1 text-left">{grade.nom}</span>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {['LANGUE_COMMUNICATION','CULTURE_CITOYENNETE','PRATIQUE_METIERS'].map(p => {
                              const n = pilierTotal(grade.lecons, p);
                              if (!n) return null;
                              const pc = PILIER_CONFIG[p];
                              return (
                                <span key={p} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pc.bg} ${pc.color} border ${pc.border}`}>
                                  {pc.icon} {n}
                                </span>
                              );
                            })}
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold border border-gray-200">
                              Total: {grade.total.TOTAL}
                            </span>
                          </div>
                        </button>

                        {/* Corps de la classe */}
                        {isOpen && (
                          <div className="divide-y divide-gray-50 border-t border-gray-100">
                            {['LANGUE_COMMUNICATION','CULTURE_CITOYENNETE','PRATIQUE_METIERS','SANS_PILIER'].map(pilier => {
                              const pc = PILIER_CONFIG[pilier];
                              const total = pilierTotal(grade.lecons, pilier);
                              if (!total) return null;
                              const pilierKey = `${grade.id}_${pilier}`;
                              const isPilierOpen = openPiliers[pilierKey] ?? true;

                              return (
                                <div key={pilier} className={`${pc.bg}`}>
                                  {/* Ligne pilier */}
                                  <button
                                    onClick={() => togglePilier(pilierKey)}
                                    className="w-full flex items-center gap-2 px-5 py-2 hover:brightness-95 transition print:cursor-default"
                                  >
                                    <span className="text-sm print:hidden">{isPilierOpen ? '▼' : '▶'}</span>
                                    <span className="text-base">{pc.icon}</span>
                                    <span className={`font-bold text-sm ${pc.color} flex-1 text-left`}>{pc.label}</span>
                                    <span className={`text-xs font-semibold ${pc.color}`}>{total} leçon{total > 1 ? 's' : ''}</span>
                                  </button>

                                  {/* Leçons par trimestre */}
                                  {isPilierOpen && (
                                    <div className="px-5 pb-3 space-y-3">
                                      {['T1','T2','T3','SANS_TRIMESTRE'].map(trim => {
                                        const lecons = grade.lecons[pilier]?.[trim] ?? [];
                                        if (!lecons.length) return null;
                                        return (
                                          <div key={trim}>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 mt-2">
                                              {TRIM_LABELS[trim]}
                                            </div>
                                            <div className="space-y-1">
                                              {lecons.map((l, idx) => (
                                                <div key={l.id} className="flex items-start gap-2 py-1 border-b border-white/60 last:border-0">
                                                  <span className="text-xs font-mono text-gray-400 w-5 text-right flex-shrink-0 mt-0.5">
                                                    {l.semaine ? `S${l.semaine}` : `${idx + 1}.`}
                                                  </span>
                                                  <span className="text-sm text-gray-800 flex-1">{l.titre}</span>
                                                  {!l.isObligatoire && (
                                                    <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded flex-shrink-0">
                                                      optionnel
                                                    </span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #root > * { display: none !important; }
          .print-content { display: block !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block  { display: block !important; }
          button { pointer-events: none; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
