import { useEffect, useState } from 'react';
import { fichesAPI, languagesAPI, curriculumAPI } from '../services/api';
import toast from 'react-hot-toast';

const TYPE_LABELS  = { COURS: 'Cours', EXERCICE: 'Exercice', EVALUATION: 'Évaluation', RESSOURCE: 'Ressource' };
const TYPE_COLORS  = {
  COURS:      'bg-blue-100 text-blue-700',
  EXERCICE:   'bg-yellow-100 text-yellow-700',
  EVALUATION: 'bg-red-100 text-red-700',
  RESSOURCE:  'bg-purple-100 text-purple-700',
};
const PILIER_LABELS = {
  LANGUE_COMMUNICATION: '📢 Langue & Communication',
  CULTURE_CITOYENNETE:  '🎭 Culture & Citoyenneté',
  PRATIQUE_METIERS:     '🔨 Pratique & Métiers',
};
const TRIM_LABELS = { T1: 'T1 (Sept–Déc)', T2: 'T2 (Janv–Mars)', T3: 'T3 (Avr–Juin)' };

const EMPTY_FORM = {
  titre: '', description: '', contenu: '', type: 'COURS',
  pilier: '', trimestre: '', semaine: '', isPublished: false,
  fileUrl: '', languageId: '', gradeLevelId: '',
};

export default function FichesPage() {
  const [fiches, setFiches]         = useState([]);
  const [languages, setLanguages]   = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Filtres
  const [filterLang,    setFilterLang]    = useState('');
  const [filterGrade,   setFilterGrade]   = useState('');
  const [filterType,    setFilterType]    = useState('');
  const [filterTrim,    setFilterTrim]    = useState('');
  const [filterPub,     setFilterPub]     = useState('');

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // null = création
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);

  // Détail
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    Promise.all([
      languagesAPI.getAll(),
      curriculumAPI.getGradeLevels(),
    ]).then(([lRes, gRes]) => {
      setLanguages(lRes.data.languages ?? lRes.data ?? []);
      setGradeLevels(gRes.data.gradeLevels ?? gRes.data ?? []);
    }).catch(console.error);
  }, []);

  const fetchFiches = () => {
    setLoading(true);
    const params = {};
    if (filterLang)  params.languageId   = filterLang;
    if (filterGrade) params.gradeLevelId = filterGrade;
    if (filterType)  params.type         = filterType;
    if (filterTrim)  params.trimestre    = filterTrim;
    fichesAPI.list(params)
      .then(r => setFiches(r.data.fiches ?? []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFiches(); }, [filterLang, filterGrade, filterType, filterTrim]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (f) => {
    setEditing(f.id);
    setForm({
      titre:       f.titre,
      description: f.description ?? '',
      contenu:     f.contenu,
      type:        f.type,
      pilier:      f.pilier ?? '',
      trimestre:   f.trimestre ?? '',
      semaine:     f.semaine ?? '',
      isPublished: f.isPublished,
      fileUrl:     f.fileUrl ?? '',
      languageId:  f.languageId,
      gradeLevelId: f.gradeLevelId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.titre || !form.contenu || !form.languageId || !form.gradeLevelId) {
      toast.error('Titre, contenu, langue et classe sont requis.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fichesAPI.update(editing, form);
        toast.success('Fiche mise à jour.');
      } else {
        await fichesAPI.create(form);
        toast.success('Fiche créée.');
      }
      setShowForm(false);
      fetchFiches();
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const r = await fichesAPI.togglePublish(id);
      const updated = r.data.fiche;
      setFiches(prev => prev.map(f => f.id === id ? { ...f, isPublished: updated.isPublished } : f));
      toast.success(updated.isPublished ? 'Fiche publiée.' : 'Fiche dépubliée.');
    } catch {
      toast.error('Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette fiche ? Cette action est irréversible.')) return;
    try {
      await fichesAPI.delete(id);
      setFiches(prev => prev.filter(f => f.id !== id));
      toast.success('Fiche supprimée.');
    } catch {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const fiche = (id) => fiches.find(f => f.id === id);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📄 Fiches Pédagogiques</h1>
          <p className="text-sm text-gray-500 mt-1">Cours, exercices et ressources pour les classes du cursus scolaire</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 transition"
        >
          + Nouvelle fiche
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterLang} onChange={e => setFilterLang(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Toutes les langues</option>
          {languages.map(l => <option key={l.id} value={l.id}>{l.emoji ?? '📚'} {l.nom}</option>)}
        </select>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Toutes les classes</option>
          {gradeLevels.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filterTrim} onChange={e => setFilterTrim(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm">
          <option value="">Tous les trimestres</option>
          {Object.entries(TRIM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={fetchFiches} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 font-medium">
          Actualiser
        </button>
      </div>

      {/* Compteur */}
      <p className="text-sm text-gray-500 mb-4">{fiches.length} fiche{fiches.length !== 1 ? 's' : ''}</p>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement…</div>
      ) : fiches.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center text-gray-400">
          <div className="text-5xl mb-3">📄</div>
          <p className="font-semibold text-lg">Aucune fiche trouvée</p>
          <p className="text-sm mt-1">Créez la première fiche pédagogique pour cette sélection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fiches.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[f.type]}`}>
                  {TYPE_LABELS[f.type]}
                </span>
                {f.isPublished ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✅ Publiée</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">⏸ Brouillon</span>
                )}
                {f.trimestre && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {TRIM_LABELS[f.trimestre]}{f.semaine ? ` · Sem. ${f.semaine}` : ''}
                  </span>
                )}
              </div>

              {/* Titre */}
              <div>
                <h3 className="font-bold text-gray-800 text-base leading-tight">{f.titre}</h3>
                {f.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{f.description}</p>}
              </div>

              {/* Langue / Classe */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{f.language?.emoji ?? '📚'} {f.language?.nom}</span>
                <span>·</span>
                <span>🎒 {f.gradeLevel?.nom}</span>
                {f.pilier && <><span>·</span><span>{PILIER_LABELS[f.pilier]?.slice(0, 25) ?? f.pilier}</span></>}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                <button
                  onClick={() => setViewing(f.id)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  👁 Voir
                </button>
                <button
                  onClick={() => openEdit(f)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                >
                  ✏️ Éditer
                </button>
                <button
                  onClick={() => handleTogglePublish(f.id)}
                  className="flex-1 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  {f.isPublished ? '⏸' : '▶'} {f.isPublished ? 'Dépublier' : 'Publier'}
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="py-1.5 px-2 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── Modal Création / Édition ───── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {editing ? '✏️ Modifier la fiche' : '+ Nouvelle fiche pédagogique'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            <div className="p-5 space-y-4">

              {/* Titre */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Titre *</label>
                <input
                  value={form.titre}
                  onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex: Introduction à l'alphabet Dioula"
                />
              </div>

              {/* Langue + Classe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Langue *</label>
                  <select
                    value={form.languageId}
                    onChange={e => setForm(f => ({ ...f, languageId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Choisir —</option>
                    {languages.map(l => <option key={l.id} value={l.id}>{l.emoji ?? '📚'} {l.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Classe *</label>
                  <select
                    value={form.gradeLevelId}
                    onChange={e => setForm(f => ({ ...f, gradeLevelId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Choisir —</option>
                    {gradeLevels.map(g => <option key={g.id} value={g.id}>{g.nom} ({g.cycle})</option>)}
                  </select>
                </div>
              </div>

              {/* Type + Pilier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Pilier</label>
                  <select
                    value={form.pilier}
                    onChange={e => setForm(f => ({ ...f, pilier: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Aucun —</option>
                    {Object.entries(PILIER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Trimestre + Semaine */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Trimestre</label>
                  <select
                    value={form.trimestre}
                    onChange={e => setForm(f => ({ ...f, trimestre: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">— Aucun —</option>
                    {Object.entries(TRIM_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Semaine (1–12)</label>
                  <input
                    type="number" min="1" max="12"
                    value={form.semaine}
                    onChange={e => setForm(f => ({ ...f, semaine: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="—"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description courte</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Résumé en une phrase…"
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Contenu * <span className="font-normal text-gray-400">(markdown supporté)</span>
                </label>
                <textarea
                  rows={12}
                  value={form.contenu}
                  onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-y"
                  placeholder={`# Titre de la leçon\n\n## Objectifs\n- Objectif 1\n- Objectif 2\n\n## Contenu\n...`}
                />
              </div>

              {/* Lien fichier + Publier */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">URL fichier PDF (optionnel)</label>
                  <input
                    value={form.fileUrl}
                    onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="https://…"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">Publier immédiatement</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 disabled:opacity-50 transition"
              >
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : 'Créer la fiche'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Modal Détail ───── */}
      {viewing && fiche(viewing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[fiche(viewing).type]}`}>
                  {TYPE_LABELS[fiche(viewing).type]}
                </span>
                <h2 className="text-lg font-bold text-gray-800">{fiche(viewing).titre}</h2>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>{fiche(viewing).language?.emoji ?? '📚'} {fiche(viewing).language?.nom}</span>
                <span>·</span>
                <span>🎒 {fiche(viewing).gradeLevel?.nom}</span>
                {fiche(viewing).pilier && <><span>·</span><span>{PILIER_LABELS[fiche(viewing).pilier]}</span></>}
                {fiche(viewing).trimestre && (
                  <><span>·</span><span>{TRIM_LABELS[fiche(viewing).trimestre]}{fiche(viewing).semaine ? ` Sem. ${fiche(viewing).semaine}` : ''}</span></>
                )}
              </div>

              {fiche(viewing).description && (
                <p className="text-sm text-gray-600 italic">{fiche(viewing).description}</p>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {fiche(viewing).contenu}
                </pre>
              </div>

              {fiche(viewing).fileUrl && (
                <a
                  href={fiche(viewing).fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition"
                >
                  📎 Télécharger le fichier PDF
                </a>
              )}

              <div className="text-xs text-gray-400">
                Créée par {fiche(viewing).createdBy?.prenom} {fiche(viewing).createdBy?.nom}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => { setViewing(null); openEdit(fiche(viewing)); }}
                className="flex-1 py-2 bg-emerald-700 text-white rounded-xl font-semibold text-sm hover:bg-emerald-800 transition"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => setViewing(null)}
                className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
