import { useEffect, useState, useMemo, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import { audioContribAPI, committeeAPI } from '../services/api';
import {
  DocumentArrowDownIcon, ChartBarIcon,
  CheckCircleIcon, ClockIcon, XCircleIcon,
  GlobeAltIcon, UserGroupIcon, ArrowPathIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function avgDays(items) {
  const certified = items.filter(i => i.certificationStatus === 'CERTIFIED_ILA' && i.certifiedAt && i.createdAt);
  if (!certified.length) return null;
  const total = certified.reduce((sum, i) => {
    return sum + (new Date(i.certifiedAt) - new Date(i.createdAt));
  }, 0);
  return Math.round(total / certified.length / 86400000 * 10) / 10; // jours avec 1 décimale
}

function StatCard({ icon: Icon, value, label, sub, color = 'text-gray-800', bgColor = 'bg-gray-50', borderColor = 'border-gray-100' }) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-2xl p-5 flex flex-col gap-1`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
async function exportPDF(ref) {
  const { default: jsPDF }      = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const el = ref.current;
  if (!el) return;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData   = canvas.toDataURL('image/png');
  const pdf       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW     = pdf.internal.pageSize.getWidth();
  const pageH     = pdf.internal.pageSize.getHeight();
  const margin    = 12;
  const printW    = pageW - margin * 2;
  const printH    = (canvas.height * printW) / canvas.width;
  const pageCount = Math.ceil(printH / (pageH - margin * 2));

  for (let i = 0; i < pageCount; i++) {
    if (i > 0) pdf.addPage();
    const srcY  = i * (pageH - margin * 2) * (canvas.width / printW);
    const srcH  = (pageH - margin * 2) * (canvas.width / printW);
    const slice = document.createElement('canvas');
    slice.width  = canvas.width;
    slice.height = Math.min(srcH, canvas.height - srcY);
    slice.getContext('2d').drawImage(canvas, 0, srcY, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, printW, (slice.height * printW) / canvas.width);
  }

  const date = new Date().toISOString().slice(0, 10);
  pdf.save(`rapport_ila_${date}.pdf`);
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(langStats, expertStats) {
  const rows = [];
  rows.push('=== LANGUES ===');
  rows.push('Langue,Soumis,Certifiés,En examen,Révision,Rejetés,Délai moy. (j)');
  langStats.forEach(l => {
    rows.push(`"${l.langue}",${l.total},${l.certified},${l.inReview},${l.revision},${l.rejected},${l.avgDays ?? ''}`);
  });
  rows.push('');
  rows.push('=== EXPERTS (votes) ===');
  rows.push('Expert,Approuvés,Révision demandée,Rejetés,Total votes');
  expertStats.forEach(e => {
    rows.push(`"${e.name}",${e.approved},${e.revision},${e.rejected},${e.total}`);
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapport_ila_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RapportEditeursPage() {
  const reportRef = useRef(null);
  const [contribs, setContribs]   = useState([]);
  const [votes, setVotes]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try { await exportPDF(reportRef); }
    finally { setExportingPDF(false); }
  };

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [c, v] = await Promise.all([
        audioContribAPI.getAll({ limit: 1000, page: 1 }),
        committeeAPI.getAll({ limit: 2000, page: 1 }),
      ]);
      setContribs(c.data.data ?? c.data ?? []);
      setVotes(v.data.data ?? v.data ?? []);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Stats globales ─────────────────────────────────────────────────────────
  const global = useMemo(() => {
    const total     = contribs.length;
    const certified = contribs.filter(i => i.certificationStatus === 'CERTIFIED_ILA').length;
    const inReview  = contribs.filter(i => ['SUBMITTED', 'IN_REVIEW'].includes(i.certificationStatus)).length;
    const revision  = contribs.filter(i => i.certificationStatus === 'REVISION_REQUESTED').length;
    const rejected  = contribs.filter(i => i.certificationStatus === 'REJECTED').length;
    const delay     = avgDays(contribs);
    const tauxCert  = total ? Math.round(certified / total * 100) : 0;
    return { total, certified, inReview, revision, rejected, delay, tauxCert };
  }, [contribs]);

  // ── Stats par langue ───────────────────────────────────────────────────────
  const langStats = useMemo(() => {
    const map = {};
    contribs.forEach(i => {
      const k = i.language?.nom ?? 'Inconnue';
      if (!map[k]) map[k] = [];
      map[k].push(i);
    });
    return Object.entries(map)
      .map(([langue, items]) => ({
        langue,
        total:     items.length,
        certified: items.filter(i => i.certificationStatus === 'CERTIFIED_ILA').length,
        inReview:  items.filter(i => ['SUBMITTED', 'IN_REVIEW'].includes(i.certificationStatus)).length,
        revision:  items.filter(i => i.certificationStatus === 'REVISION_REQUESTED').length,
        rejected:  items.filter(i => i.certificationStatus === 'REJECTED').length,
        avgDays:   avgDays(items),
      }))
      .sort((a, b) => b.total - a.total);
  }, [contribs]);

  // ── Stats par expert ───────────────────────────────────────────────────────
  const expertStats = useMemo(() => {
    const map = {};
    votes.forEach(v => {
      const name = v.expert
        ? `${v.expert.prenom ?? ''} ${v.expert.nom ?? ''}`.trim() || v.expert.email
        : 'Expert inconnu';
      if (!map[name]) map[name] = { name, approved: 0, revision: 0, rejected: 0, total: 0 };
      map[name].total++;
      if (v.vote === 'APPROVED')           map[name].approved++;
      if (v.vote === 'REVISION_REQUESTED') map[name].revision++;
      if (v.vote === 'REJECTED')           map[name].rejected++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [votes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div ref={reportRef} className="p-6 max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rapport d'activité</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pipeline de certification ILA-UFHB · Certification audio</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => exportCSV(langStats, expertStats)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-primary-500 rounded-xl hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {exportingPDF
              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
              : <PrinterIcon className="w-4 h-4" />
            }
            {exportingPDF ? 'Génération…' : 'Exporter PDF'}
          </button>
        </div>
        <PageHelp pageId="rapport-editeurs" />
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={ChartBarIcon}    value={global.total}     label="Total soumis"     bgColor="bg-gray-50"    borderColor="border-gray-100"   color="text-gray-800" />
        <StatCard icon={CheckCircleIcon} value={global.certified} label="Certifiés ILA"    bgColor="bg-green-50"   borderColor="border-green-100"  color="text-green-700" sub={`${global.tauxCert}% du total`} />
        <StatCard icon={ClockIcon}       value={global.inReview}  label="En examen"        bgColor="bg-blue-50"    borderColor="border-blue-100"   color="text-blue-700" />
        <StatCard icon={ChartBarIcon}    value={global.revision}  label="En révision"      bgColor="bg-amber-50"   borderColor="border-amber-100"  color="text-amber-700" />
        <StatCard icon={XCircleIcon}     value={global.rejected}  label="Rejetés"          bgColor="bg-red-50"     borderColor="border-red-100"    color="text-red-600" />
        <StatCard icon={ClockIcon}       value={global.delay !== null ? `${global.delay}j` : '—'} label="Délai moy. cert." bgColor="bg-purple-50" borderColor="border-purple-100" color="text-purple-700" sub="entre soumission et cert." />
      </div>

      {/* Pipeline visuel */}
      {global.total > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-primary-500" />
            Pipeline de certification global
          </h2>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Répartition des {global.total} contributions</span>
            <span className="font-semibold text-green-600">{global.tauxCert}% certifiés</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 transition-all duration-700" style={{ width: `${global.certified / global.total * 100}%` }} title="Certifiés ILA" />
            <div className="bg-blue-400"  style={{ width: `${global.inReview  / global.total * 100}%` }} title="En examen" />
            <div className="bg-amber-400" style={{ width: `${global.revision  / global.total * 100}%` }} title="En révision" />
            <div className="bg-red-400"   style={{ width: `${global.rejected  / global.total * 100}%` }} title="Rejetés" />
          </div>
          <div className="flex gap-5 mt-3 flex-wrap text-xs text-gray-500">
            {[
              { color: 'bg-green-500', label: 'Certifiés ILA' },
              { color: 'bg-blue-400',  label: 'En examen' },
              { color: 'bg-amber-400', label: 'En révision' },
              { color: 'bg-red-400',   label: 'Rejetés' },
            ].map(i => (
              <span key={i.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${i.color}`} />
                {i.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tableau par langue */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <GlobeAltIcon className="w-5 h-5 text-primary-500" />
          <h2 className="text-base font-bold text-gray-900">Langues couvertes</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {langStats.length} langue{langStats.length !== 1 ? 's' : ''}
          </span>
        </div>
        {langStats.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">Aucune donnée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Langue</th>
                  <th className="px-4 py-3 text-center font-semibold">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-green-700">✅ Certifiés</th>
                  <th className="px-4 py-3 text-center font-semibold text-blue-700">⏳ En examen</th>
                  <th className="px-4 py-3 text-center font-semibold text-amber-700">⚠️ Révision</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-600">❌ Rejetés</th>
                  <th className="px-4 py-3 text-center font-semibold text-purple-700">Délai moy.</th>
                  <th className="px-5 py-3 text-left font-semibold">Taux cert.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {langStats.map((l) => {
                  const taux = l.total ? Math.round(l.certified / l.total * 100) : 0;
                  return (
                    <tr key={l.langue} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{l.langue}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-700">{l.total}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-bold text-green-700">{l.certified}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-blue-700">{l.inReview}</td>
                      <td className="px-4 py-3.5 text-center text-amber-700">{l.revision}</td>
                      <td className="px-4 py-3.5 text-center text-red-600">{l.rejected}</td>
                      <td className="px-4 py-3.5 text-center text-purple-700 text-xs font-medium">
                        {l.avgDays !== null ? `${l.avgDays}j` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${taux}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{taux}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tableau experts / votes */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-gray-900">Activité des experts ILA-UFHB</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {votes.length} vote{votes.length !== 1 ? 's' : ''} au total
          </span>
        </div>
        {expertStats.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">Aucun vote enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Expert</th>
                  <th className="px-4 py-3 text-center font-semibold text-green-700">Approuvés</th>
                  <th className="px-4 py-3 text-center font-semibold text-amber-700">Révision</th>
                  <th className="px-4 py-3 text-center font-semibold text-red-600">Rejetés</th>
                  <th className="px-4 py-3 text-center font-semibold">Total</th>
                  <th className="px-5 py-3 text-left font-semibold">Part approuvés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expertStats.map((e) => {
                  const pct = e.total ? Math.round(e.approved / e.total * 100) : 0;
                  return (
                    <tr key={e.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-800">{e.name}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-green-700">{e.approved}</td>
                      <td className="px-4 py-3.5 text-center text-amber-700">{e.revision}</td>
                      <td className="px-4 py-3.5 text-center text-red-600">{e.rejected}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-gray-700">{e.total}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
