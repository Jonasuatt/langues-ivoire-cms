/**
 * ArbreVocabulairePage — Vocabulaire familial (Arbre à Palabres)
 * Alimente ArbresScreen.js sur le mobile.
 * Utilise UsefulPhrase avec categorie='famille' et contexte=membreId.
 */
import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';
import LanguageSelect from '../components/LanguageSelect';

// Les 8 membres de l'arbre — correspond aux IDs dans ArbresScreen.js
const MEMBRES = [
  { id: 'grand_pere', fr: 'Grand-père', emoji: '👴🏾', tier: 0 },
  { id: 'grand_mere', fr: 'Grand-mère', emoji: '👵🏾', tier: 0 },
  { id: 'pere',       fr: 'Père',       emoji: '👨🏾', tier: 1 },
  { id: 'mere',       fr: 'Mère',       emoji: '👩🏾', tier: 1 },
  { id: 'oncle',      fr: 'Oncle',      emoji: '🧔', tier: 1 },
  { id: 'tante',      fr: 'Tante',      emoji: '👩🏾‍🦱', tier: 1 },
  { id: 'frere',      fr: 'Frère',      emoji: '👦🏾', tier: 2 },
  { id: 'soeur',      fr: 'Sœur',       emoji: '👧🏾', tier: 2 },
];

const EMPTY_FORM = {
  languageId: '', contexte: 'grand_pere', phrase: '',
  transcription: '', traduction: '', audioUrl: '', audioUrlFr: '', genreVoix: '',
  status: 'PUBLISHED',
};

export default function ArbreVocabulairePage() {
  const [items, setItems]         = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterLang, setFilterLang]   = useState('');
  const [filterMembre, setFilterMembre] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    const params = { categorie: 'famille', status: 'PUBLISHED', limit: 200 };
    if (filterLang) params.languageId = filterLang;
    api.get('/admin/phrases', { params })
      .then(({ data }) => {
        let result = data.data || data || [];
        if (filterMembre) result = result.filter(i => i.contexte === filterMembre);
        setItems(result);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterLang, filterMembre]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, languageId: filterLang || (languages[0]?.id ?? '') });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      languageId:    item.languageId || '',
      contexte:      item.contexte || 'grand_pere',
      phrase:        item.phrase || '',
      transcription: item.transcription || '',
      traduction:    item.traduction || '',
      audioUrl:      item.audioUrl || '',
      audioUrlFr:    item.audioUrlFr || '',
      genreVoix:     item.genreVoix || '',
      status:        item.status || 'PUBLISHED',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.languageId) return toast.error('Sélectionnez une langue');
    if (!form.phrase.trim()) return toast.error('Le mot en langue locale est obligatoire');
    if (!form.traduction.trim()) return toast.error('La traduction française est obligatoire');
    setSaving(true);
    try {
      const payload = {
        languageId:    form.languageId,
        categorie:     'famille',
        contexte:      form.contexte,
        phrase:        form.phrase.trim(),
        transcription: form.transcription.trim() || null,
        traduction:    form.traduction.trim(),
        audioUrl:      form.audioUrl.trim() || null,
        audioUrlFr:    form.audioUrlFr.trim() || null,
        genreVoix:     form.genreVoix || null,
        status:        form.status,
      };
      if (editItem) {
        await api.patch(`/admin/phrases/${editItem.id}`, payload);
        toast.success('Mot mis à jour');
      } else {
        await api.post('/admin/phrases', payload);
        toast.success('Mot créé');
      }
      setShowModal(false);
      load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce mot ?')) return;
    try {
      await api.delete(`/admin/phrases/${id}`);
      toast.success('Mot supprimé');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const selectedMembre = MEMBRES.find(m => m.id === filterMembre);
  const selectedMemberForm = MEMBRES.find(m => m.id === form.contexte);
  const langName = (id) => languages.find(l => l.id === id)?.nom || '';

  // Grouper par langue, puis par membre
  const groupedByLang = languages
    .filter(l => !filterLang || l.id === filterLang)
    .map(lang => ({
      ...lang,
      membres: MEMBRES.map(m => ({
        ...m,
        item: items.find(i => i.languageId === lang.id && i.contexte === m.id),
      })),
    }))
    .filter(l => l.membres.some(m => m.item) || filterLang === l.id);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🌳 Arbre à Palabres — Vocabulaire familial</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} mot{items.length > 1 ? 's' : ''} · 8 membres × langues · Alimente ArbresScreen
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Ajouter un mot
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Langue</label>
          <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-48" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Membre</label>
          <select className="input py-1.5" value={filterMembre} onChange={e => setFilterMembre(e.target.value)}>
            <option value="">Tous les membres</option>
            {MEMBRES.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.fr}</option>)}
          </select>
        </div>
      </div>

      {/* Grille de progression */}
      {!filterLang && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <strong>💡 Conseil :</strong> Sélectionnez une langue pour voir la grille complète des 8 membres. Chaque ligne représente un membre de la famille dans cette langue.
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filterLang ? (
        // Vue grille par langue sélectionnée
        <div className="space-y-4">
          {groupedByLang.map(lang => (
            <div key={lang.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                <h2 className="font-bold text-primary-800">{lang.nom}</h2>
                <span className="text-xs text-primary-500">{lang.membres.filter(m => m.item).length}/8 membres renseignés</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                {lang.membres.map(m => (
                  <div key={m.id} className="p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{m.emoji}</span>
                      <div className="flex gap-1">
                        {m.item ? (
                          <>
                            <button onClick={() => openEdit(m.item)} className="text-primary-500 hover:text-primary-700 p-1">
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(m.item.id)} className="text-red-400 hover:text-red-600 p-1">
                              <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => { openCreate(); setTimeout(() => { f('languageId', lang.id); f('contexte', m.id); }, 0); }}
                            className="text-gray-300 hover:text-primary-500 p-1"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500">{m.fr}</p>
                    {m.item ? (
                      <>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{m.item.phrase}</p>
                        {m.item.transcription && <p className="text-xs text-gray-400">{m.item.transcription}</p>}
                        <div className="flex gap-1 mt-1">
                          {m.item.audioUrl && <span className="text-xs text-green-600" title="Audio local">🎵</span>}
                          {m.item.audioUrlFr && <span className="text-xs text-blue-600" title="Audio français">🇫🇷</span>}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-300 mt-1 italic">— non renseigné</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vue liste plate sans filtre langue
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Membre</th>
                <th className="text-left px-4 py-3">Langue</th>
                <th className="text-left px-4 py-3">Mot local</th>
                <th className="text-left px-4 py-3">Phonétique</th>
                <th className="text-left px-4 py-3">Français</th>
                <th className="text-left px-4 py-3">Audio</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(item => {
                const m = MEMBRES.find(m => m.id === item.contexte);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{m ? `${m.emoji} ${m.fr}` : item.contexte}</td>
                    <td className="px-4 py-3 text-gray-600">{langName(item.languageId)}</td>
                    <td className="px-4 py-3 font-semibold text-primary-700">{item.phrase}</td>
                    <td className="px-4 py-3 text-gray-400 italic text-xs">{item.transcription}</td>
                    <td className="px-4 py-3 text-gray-600">{item.traduction}</td>
                    <td className="px-4 py-3">
                      {item.audioUrl && <span className="text-green-500 text-xs">🌍 local</span>}
                      {item.audioUrlFr && <span className="text-blue-500 text-xs ml-1">🇫🇷 fr</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-primary-600 hover:text-primary-800">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucun mot — créez votre premier mot familial</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editItem ? 'Modifier le mot' : 'Ajouter un mot familial'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Langue */}
              <div>
                <label className="label">Langue *</label>
                <LanguageSelect
                  languages={languages}
                  value={form.languageId || ''}
                  onChange={v => f('languageId', v)}
                  allLabel="— Sélectionner —"
                  showAll={false}
                  className="w-full"
                />
              </div>

              {/* Membre de la famille */}
              <div>
                <label className="label">Membre de la famille *</label>
                <div className="grid grid-cols-4 gap-2">
                  {MEMBRES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => f('contexte', m.id)}
                      className={`py-2 px-1 rounded-lg text-center text-xs font-medium border-2 transition ${form.contexte === m.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                    >
                      <div className="text-xl">{m.emoji}</div>
                      <div>{m.fr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mot local */}
              <div>
                <label className="label">
                  Mot en langue locale * — {selectedMemberForm ? `"${selectedMemberForm.fr}"` : ''}
                </label>
                <input
                  className="input"
                  value={form.phrase}
                  onChange={e => f('phrase', e.target.value)}
                  placeholder="ex: Kɔkɔ (pour Grand-père en Dioula)"
                />
              </div>

              {/* Phonétique */}
              <div>
                <label className="label">Prononciation phonétique</label>
                <input
                  className="input"
                  value={form.transcription}
                  onChange={e => f('transcription', e.target.value)}
                  placeholder="ex: [kɔ-kɔ]"
                />
              </div>

              {/* Traduction */}
              <div>
                <label className="label">Traduction française *</label>
                <input
                  className="input"
                  value={form.traduction}
                  onChange={e => f('traduction', e.target.value)}
                  placeholder="ex: Grand-père"
                />
              </div>

              {/* Audios */}
              <div className="grid grid-cols-2 gap-4">
                <FileUploadField
                  type="audio"
                  label="🌍 Audio langue locale"
                  value={form.audioUrl}
                  onChange={url => f('audioUrl', url)}
                />
                <FileUploadField
                  type="audio"
                  label="🇫🇷 Audio français"
                  value={form.audioUrlFr}
                  onChange={url => f('audioUrlFr', url)}
                />
              </div>

              {/* Genre de la voix */}
              <div>
                <label className="label">Genre de la voix audio</label>
                <div className="flex gap-2">
                  {[{v:'',l:'Non défini'},{v:'M',l:'♂ Masculin'},{v:'F',l:'♀ Féminin'}].map(g => (
                    <button key={g.v} type="button"
                      onClick={() => f('genreVoix', g.v)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.genreVoix === g.v
                          ? g.v === 'M' ? 'bg-blue-600 text-white border-blue-600'
                            : g.v === 'F' ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-gray-600 text-white border-gray-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="label">Statut</label>
                <select className="input" value={form.status} onChange={e => f('status', e.target.value)}>
                  <option value="PUBLISHED">Publié (visible sur mobile)</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Sauvegarde…' : editItem ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHelp pageId="arbre-palabres" />
    </div>
  );
}
