/**
 * MarcheDialoguesPage — Scénarios de négociation au Marché
 * Alimente MarcheScreen.js sur le mobile.
 * Un document MarcheDialogue par langue.
 */
import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import api, { languagesAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import FileUploadField from '../components/FileUploadField';
import LanguageSelect from '../components/LanguageSelect';

const EMPTY_REPLIQUE = {
  vendeurDit: '',
  vendeurDitFr: '',
  motJuste: { mot: '', sens: '', effet: -500, audioUrl: '', audioUrlFr: '' },
  leurres: ['', '', ''],
  conseil: '',
};

const EMPTY_FORM = {
  languageId: '', vendeur: '', vendeurDesc: '', salutation: '',
  audioSalutation: '', isActive: true,
  repliques: [{ ...EMPTY_REPLIQUE, motJuste: { mot: '', sens: '', effet: -500 } }],
};

export default function MarcheDialoguesPage() {
  const [items, setItems]         = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterLang, setFilterLang]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [expandedReplique, setExpandedReplique] = useState(0);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterLang) params.languageId = filterLang;
    api.get('/marche-dialogues/admin/list', { params })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    languagesAPI.getAllAdmin().then(({ data }) => setLanguages(data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [filterLang]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, languageId: filterLang || '' });
    setExpandedReplique(0);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    const repliques = Array.isArray(item.repliques) && item.repliques.length > 0
      ? item.repliques.map(r => ({
          vendeurDit:   r.vendeurDit   || '',
          vendeurDitFr: r.vendeurDitFr || '',
          motJuste: {
            mot:        r.motJuste?.mot        || '',
            sens:       r.motJuste?.sens       || '',
            effet:      r.motJuste?.effet      ?? -500,
            audioUrl:   r.motJuste?.audioUrl   || '',
            audioUrlFr: r.motJuste?.audioUrlFr || '',
          },
          leurres: (r.leurres || ['', '', '']).concat(['', '', '']).slice(0, 3),
          conseil: r.conseil || '',
        }))
      : [{ ...EMPTY_REPLIQUE, motJuste: { mot: '', sens: '', effet: -500 }, leurres: ['', '', ''] }];
    setForm({
      languageId:      item.languageId || '',
      vendeur:         item.vendeur || '',
      vendeurDesc:     item.vendeurDesc || '',
      salutation:      item.salutation || '',
      audioSalutation: item.audioSalutation || '',
      isActive:        item.isActive !== false,
      repliques,
    });
    setExpandedReplique(0);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.languageId) return toast.error('Sélectionnez une langue');
    if (!form.vendeur.trim()) return toast.error('Le nom du vendeur est obligatoire');
    if (!form.salutation.trim()) return toast.error('La salutation est obligatoire');
    setSaving(true);
    try {
      const repliques = form.repliques
        .filter(r => r.vendeurDit.trim() || r.motJuste.mot.trim())
        .map(r => ({
          vendeurDit:   r.vendeurDit.trim(),
          vendeurDitFr: r.vendeurDitFr?.trim() || '',
          motJuste: {
            mot:        r.motJuste.mot.trim(),
            sens:       r.motJuste.sens.trim(),
            effet:      parseInt(r.motJuste.effet) || -500,
            audioUrl:   r.motJuste.audioUrl?.trim()   || '',
            audioUrlFr: r.motJuste.audioUrlFr?.trim() || '',
          },
          leurres: r.leurres.filter(l => l.trim()),
          conseil: r.conseil.trim(),
        }));

      const payload = {
        languageId:      form.languageId,
        vendeur:         form.vendeur.trim(),
        vendeurDesc:     form.vendeurDesc.trim() || null,
        salutation:      form.salutation.trim(),
        audioSalutation: form.audioSalutation.trim() || null,
        isActive:        form.isActive,
        repliques,
      };
      if (editItem) {
        await api.patch(`/marche-dialogues/admin/${editItem.id}`, payload);
        toast.success('Dialogue mis à jour');
      } else {
        await api.post('/marche-dialogues/admin', payload);
        toast.success('Dialogue créé');
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
    if (!confirm('Supprimer ce dialogue ?')) return;
    try {
      await api.delete(`/marche-dialogues/admin/${id}`);
      toast.success('Dialogue supprimé');
      load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Helpers pour modifier les répliques
  const setReplique = (idx, field, value) => {
    setForm(p => {
      const repliques = [...p.repliques];
      repliques[idx] = { ...repliques[idx], [field]: value };
      return { ...p, repliques };
    });
  };
  const setMotJuste = (idx, field, value) => {
    setForm(p => {
      const repliques = [...p.repliques];
      repliques[idx] = { ...repliques[idx], motJuste: { ...repliques[idx].motJuste, [field]: value } };
      return { ...p, repliques };
    });
  };
  const setLeurre = (idx, lIdx, value) => {
    setForm(p => {
      const repliques = [...p.repliques];
      const leurres = [...(repliques[idx].leurres || ['', '', ''])];
      leurres[lIdx] = value;
      repliques[idx] = { ...repliques[idx], leurres };
      return { ...p, repliques };
    });
  };
  const addReplique = () => {
    setForm(p => ({ ...p, repliques: [...p.repliques, { ...EMPTY_REPLIQUE, motJuste: { mot: '', sens: '', effet: -500 }, leurres: ['', '', ''] }] }));
    setExpandedReplique(form.repliques.length);
  };
  const removeReplique = (idx) => {
    if (form.repliques.length === 1) return toast.error('Au moins une réplique est requise');
    setForm(p => ({ ...p, repliques: p.repliques.filter((_, i) => i !== idx) }));
    setExpandedReplique(Math.max(0, expandedReplique - 1));
  };

  const langName = (id) => languages.find(l => l.id === id)?.nom || '';

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛒 Au Marché — Scénarios de dialogue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} dialogue{items.length > 1 ? 's' : ''} · Un par langue · Alimente MarcheScreen
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nouveau dialogue
        </button>
      </div>

      {/* Filtre langue */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">Filtrer par langue</label>
        <LanguageSelect languages={languages} value={filterLang} onChange={setFilterLang} className="w-48" />
      </div>

      {/* Conseil */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>💡 Structure :</strong> Chaque dialogue contient 6 répliques (idéalement). Chaque réplique a 1 mot juste + 3 leurres + un conseil. L'effet (négatif) = réduction de prix en FCFA.
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-medium mb-1">
                      {langName(item.languageId) || item.language?.nom}
                    </span>
                    <p className="font-bold text-gray-900">{item.vendeur}</p>
                    {item.vendeurDesc && <p className="text-xs text-gray-400">{item.vendeurDesc}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {item.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic mb-3">
                  <span className="text-gray-400">Salutation :</span> « {item.salutation} »
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>💬 {Array.isArray(item.repliques) ? item.repliques.length : 0} répliques</span>
                  {item.audioSalutation && <span>🔊 Audio</span>}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => openEdit(item)} className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-1">
                    <PencilIcon className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 py-1 px-2">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-medium">Aucun dialogue — créez le premier scénario de marché</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">{editItem ? 'Modifier le dialogue' : 'Nouveau scénario de marché'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos générales */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">Informations du vendeur</h3>

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nom du vendeur *</label>
                    <input className="input" value={form.vendeur} onChange={e => f('vendeur', e.target.value)} placeholder="ex: Amara" />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <input className="input" value={form.vendeurDesc} onChange={e => f('vendeurDesc', e.target.value)} placeholder="ex: Commerçant de Bouaké" />
                  </div>
                </div>

                <div>
                  <label className="label">Salutation initiale *</label>
                  <input className="input" value={form.salutation} onChange={e => f('salutation', e.target.value)} placeholder="ex: I ni ce !" />
                </div>

                <FileUploadField
                  type="audio"
                  label="Audio de la salutation (optionnel)"
                  value={form.audioSalutation}
                  onChange={url => f('audioSalutation', url)}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="w-4 h-4 accent-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Dialogue actif</span>
                </label>
              </div>

              {/* Répliques */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">
                    Répliques ({form.repliques.length})
                    <span className="ml-2 text-xs font-normal text-gray-400">— recommandé : 6 répliques</span>
                  </h3>
                  <button type="button" onClick={addReplique} className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-1">
                    <PlusIcon className="w-3.5 h-3.5" /> Ajouter
                  </button>
                </div>

                <div className="space-y-2">
                  {form.repliques.map((r, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Accordéon header */}
                      <button
                        type="button"
                        onClick={() => setExpandedReplique(expandedReplique === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="font-medium text-sm text-gray-700">
                          Réplique {idx + 1}
                          {r.motJuste.mot && <span className="ml-2 text-primary-600">· {r.motJuste.mot}</span>}
                          {r.vendeurDit && <span className="ml-2 text-gray-400 font-normal text-xs">« {r.vendeurDit.slice(0, 40)}{r.vendeurDit.length > 40 ? '…' : ''} »</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeReplique(idx); }}
                            className="text-red-300 hover:text-red-500 p-1"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                          {expandedReplique === idx
                            ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                            : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          }
                        </div>
                      </button>

                      {/* Accordéon body */}
                      {expandedReplique === idx && (
                        <div className="p-4 space-y-3">
                          {/* Ce que dit le vendeur */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="label text-xs">🌍 Ce que dit le vendeur (langue locale)</label>
                              <textarea
                                className="input resize-none text-sm"
                                rows={2}
                                value={r.vendeurDit}
                                onChange={e => setReplique(idx, 'vendeurDit', e.target.value)}
                                placeholder="ex: Mɔgɔ diya ! Jɔli bɛ se ?"
                              />
                            </div>
                            <div>
                              <label className="label text-xs">🇫🇷 Traduction française</label>
                              <textarea
                                className="input resize-none text-sm"
                                rows={2}
                                value={r.vendeurDitFr || ''}
                                onChange={e => setReplique(idx, 'vendeurDitFr', e.target.value)}
                                placeholder="ex: Bonjour ! Combien tu offres ?"
                              />
                            </div>
                          </div>

                          {/* Mot juste */}
                          <div className="bg-green-50 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-green-700">✅ Mot juste (la bonne réponse)</p>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="label text-xs">Mot / formule</label>
                                <input className="input text-sm" value={r.motJuste.mot} onChange={e => setMotJuste(idx, 'mot', e.target.value)} placeholder="ex: I ni ce" />
                              </div>
                              <div>
                                <label className="label text-xs">Sens en français</label>
                                <input className="input text-sm" value={r.motJuste.sens} onChange={e => setMotJuste(idx, 'sens', e.target.value)} placeholder="ex: Bonjour (poli)" />
                              </div>
                              <div>
                                <label className="label text-xs">Effet sur le prix (FCFA)</label>
                                <input type="number" className="input text-sm" value={r.motJuste.effet} onChange={e => setMotJuste(idx, 'effet', e.target.value)} placeholder="-600" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <FileUploadField
                                type="audio"
                                label="🌍 Audio langue locale"
                                value={r.motJuste.audioUrl || ''}
                                onChange={url => setMotJuste(idx, 'audioUrl', url)}
                              />
                              <FileUploadField
                                type="audio"
                                label="🇫🇷 Audio français"
                                value={r.motJuste.audioUrlFr || ''}
                                onChange={url => setMotJuste(idx, 'audioUrlFr', url)}
                              />
                            </div>
                          </div>

                          {/* Leurres */}
                          <div className="bg-red-50 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-semibold text-red-700">❌ Leurres (mauvaises réponses)</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[0, 1, 2].map(li => (
                                <div key={li}>
                                  <label className="label text-xs">Leurre {li + 1}</label>
                                  <input
                                    className="input text-sm"
                                    value={(r.leurres || [])[li] || ''}
                                    onChange={e => setLeurre(idx, li, e.target.value)}
                                    placeholder={`ex: Nɔɔ !`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Conseil */}
                          <div>
                            <label className="label text-xs">Conseil (affiché après bonne réponse)</label>
                            <textarea
                              className="input resize-none text-sm"
                              rows={2}
                              value={r.conseil}
                              onChange={e => setReplique(idx, 'conseil', e.target.value)}
                              placeholder="ex: Toujours saluer d'abord — c'est la règle d'or du marché."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Sauvegarde…' : editItem ? 'Mettre à jour' : 'Créer le dialogue'}
              </button>
            </div>
          </div>
        </div>
      )}
      <PageHelp pageId="marche" />
    </div>
  );
}
