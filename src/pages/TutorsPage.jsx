import { useEffect, useState } from 'react';
import PageHelp from '../components/PageHelp';
import { tutorsAPI, languagesAPI } from '../services/api';
import FileUploadField from '../components/FileUploadField';
import {
  PlusIcon, PencilIcon, TrashIcon, ChatBubbleLeftRightIcon,
  CheckCircleIcon, SparklesIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getAvatarPortrait } from '../utils/getAvatar';

const AVATAR_COLORS = ['#0B3D2E','#1565C0','#6A1B9A','#E65100','#00695C','#AD1457','#4E342E','#37474F'];

const PERSONALITIES = [
  { value: 'sage',       label: 'Sage & Patient',      desc: 'Proverbes, sagesse ancestrale' },
  { value: 'marchand',   label: 'Marchand Jovial',      desc: 'Énergique, expressions du marché' },
  { value: 'noble',      label: 'Noble & Fier',         desc: 'Dignité, traditions royales' },
  { value: 'artisan',    label: 'Artisan Créatif',      desc: 'Métiers, savoir-faire' },
  { value: 'princesse',  label: 'Princesse Élégante',   desc: 'Raffinement, cour royale' },
  { value: 'cultivateur',label: 'Cultivateur Généreux', desc: 'Nature, cycles, partage' },
  { value: 'chasseur',   label: 'Chasseur Brave',       desc: 'Forêt, courage, initiation' },
  { value: 'jeune',      label: 'Jeune Moderne',        desc: 'Urbain, fun, mélange culturel' },
];

const EMPTY_FORM = {
  nomAvatar: '', languageId: '', genre: 'M',
  personalite: '', voixConfig: { vitesse: 1.0, pitch: 1.0 },
  imageUrl: '', isActive: true,
};

// ── Carte tuteur (réutilisée dans les deux tabs) ──────────────────────────────
function TutorCard({ tutor, idx, onEdit, onDelete, onToggle, onActivate, activating, dormant = false }) {
  const portrait = getAvatarPortrait(tutor.nomAvatar);
  const src = portrait || tutor.imageUrl;
  const lang = tutor.language;

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all ${dormant ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {src ? (
            <img src={src} alt={tutor.nomAvatar}
              className="w-14 h-14 rounded-xl flex-shrink-0 object-cover shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
              {tutor.nomAvatar?.[0] || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">{tutor.nomAvatar}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tutor.genre === 'F' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                {tutor.genre === 'F' ? '♀ F' : '♂ M'}
              </span>
            </div>
            {lang && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base leading-none">{lang.emoji || '🌍'}</span>
                <span className="text-xs font-medium text-gray-600">{lang.nom}</span>
                <span className="text-xs text-gray-400">· {lang.famille || ''}</span>
              </div>
            )}
            {tutor.personalite && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{tutor.personalite}</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        {dormant ? (
          <>
            <button
              onClick={() => onActivate(tutor)}
              disabled={activating === tutor.id}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              <CheckCircleIcon className="w-4 h-4" />
              {activating === tutor.id ? 'Activation…' : 'Activer'}
            </button>
            <button onClick={() => onEdit(tutor)}
              title="Personnaliser"
              className="px-3 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
              <PencilIcon className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onToggle(tutor)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors border ${
                tutor.isActive
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}>
              {tutor.isActive ? '🟢 Actif' : '⏸ Inactif'}
            </button>
            <div className="flex gap-1 ml-auto">
              <button onClick={() => onEdit(tutor)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors">
                <PencilIcon className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(tutor)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function TutorsPage() {
  const [tutors,    setTutors]    = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState('actifs');
  const [showModal, setShowModal] = useState(false);
  const [editTutor, setEditTutor] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [activating, setActivating] = useState(null);
  const [search,    setSearch]    = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([tutorsAPI.getAllAdmin(), languagesAPI.getAllAdmin()])
      .then(([tutorsRes, langsRes]) => {
        const list = tutorsRes.data || [];
        // Tri : M avant F, puis alphabétique par nom de tuteur dans chaque langue
        const sorted = [...list].sort((a, b) => {
          const langA = a.language?.nom || '';
          const langB = b.language?.nom || '';
          if (langA !== langB) return langA.localeCompare(langB, 'fr');
          if (a.genre !== b.genre) return a.genre === 'M' ? -1 : 1;
          return (a.nomAvatar || '').localeCompare(b.nomAvatar || '', 'fr');
        });
        setTutors(sorted);
        setLanguages(langsRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Activation ──
  const handleActivate = async (tutor) => {
    if (activating) return;
    setActivating(tutor.id);
    try {
      await tutorsAPI.activate(tutor.id);
      toast.success(`🎉 ${tutor.nomAvatar} est maintenant actif dans l'application !`);
      load();
    } catch {
      toast.error("Erreur lors de l'activation.");
    } finally {
      setActivating(null);
    }
  };

  // ── Toggle actif/inactif ──
  const toggleActive = async (tutor) => {
    try {
      await tutorsAPI.update(tutor.id, { isActive: !tutor.isActive });
      toast.success(tutor.isActive ? 'Tuteur désactivé' : 'Tuteur activé');
      load();
    } catch { toast.error('Erreur'); }
  };

  // ── Édition ──
  const openAdd = () => {
    setEditTutor(null);
    const firstActiveLang = languages.find(l => l.isActive !== false);
    setForm({ ...EMPTY_FORM, languageId: firstActiveLang?.id || '' });
    setShowModal(true);
  };
  const openEdit = (tutor) => {
    setEditTutor(tutor);
    setForm({
      nomAvatar:   tutor.nomAvatar || '',
      languageId:  tutor.languageId || '',
      genre:       tutor.genre || 'M',
      personalite: tutor.personalite || '',
      voixConfig:  tutor.voixConfig || { vitesse: 1.0, pitch: 1.0 },
      imageUrl:    tutor.imageUrl || '',
      isActive:    tutor.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nomAvatar)  { toast.error("Nom d'avatar obligatoire"); return; }
    if (!form.languageId) { toast.error('Langue obligatoire'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        voixConfig: typeof form.voixConfig === 'string' ? JSON.parse(form.voixConfig) : form.voixConfig,
      };
      if (editTutor) {
        await tutorsAPI.update(editTutor.id, payload);
        toast.success('Tuteur mis à jour !');
      } else {
        await tutorsAPI.create(payload);
        toast.success('Tuteur créé !');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  const handleDelete = async (tutor) => {
    if (!confirm(`Supprimer le tuteur "${tutor.nomAvatar}" ?`)) return;
    try {
      await tutorsAPI.delete(tutor.id);
      toast.success('Tuteur supprimé');
      load();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  // ── Données dérivées ──
  const tutorsActifs   = tutors.filter(t => t.isActive !== false);
  const tutorsDormants = tutors.filter(t => t.isActive === false);

  const filteredActifs = tutorsActifs.filter(t =>
    !search || t.nomAvatar?.toLowerCase().includes(search.toLowerCase()) ||
    t.language?.nom?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDormants = tutorsDormants.filter(t =>
    !search || t.nomAvatar?.toLowerCase().includes(search.toLowerCase()) ||
    t.language?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  // Grouper les dormants par famille de langue
  const dormantsByFamille = filteredDormants.reduce((acc, t) => {
    const famille = t.language?.famille || 'Autre';
    if (!acc[famille]) acc[famille] = [];
    acc[famille].push(t);
    return acc;
  }, {});
  const familleOrder = ['Akan', 'Krou', 'Gour', 'Mandé Nord', 'Mandé Sud', 'Véhiculaire', 'Autre'];
  const sortedFamilles = Object.keys(dormantsByFamille).sort((a, b) => {
    const ia = familleOrder.indexOf(a);
    const ib = familleOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const FAMILLE_COLORS = {
    'Akan':       { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-800',  dot: 'bg-yellow-400' },
    'Krou':       { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-800',   dot: 'bg-green-500'  },
    'Gour':       { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-800',  dot: 'bg-orange-400' },
    'Mandé Nord': { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',    dot: 'bg-blue-500'   },
    'Mandé Sud':  { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-800',  dot: 'bg-purple-500' },
    'Véhiculaire':{ bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-800',     dot: 'bg-red-400'    },
    'Autre':      { bg: 'bg-gray-50',    border: 'border-gray-200',   text: 'text-gray-700',    dot: 'bg-gray-400'   },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tuteurs IA</h1>
            <p className="text-sm text-gray-500">
              {tutorsActifs.length} actif{tutorsActifs.length !== 1 ? 's' : ''} · {tutorsDormants.length} en dormance
            </p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-semibold transition-colors shadow-sm">
          <PlusIcon className="w-4 h-4" /> Nouveau tuteur
        </button>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { val: tutors.length,           label: 'Total tuteurs',   sub: 'tous les peuples CI',  bg: 'bg-white',       color: 'text-gray-700'   },
            { val: tutorsActifs.length,     label: '🟢 Actifs',       sub: 'visibles dans l\'app', bg: 'bg-green-50',    color: 'text-green-600'  },
            { val: tutorsDormants.length,   label: '⏸ En dormance',  sub: 'prêts à activer',      bg: 'bg-amber-50',    color: 'text-amber-600'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── Bannière dormance ── */}
      {!loading && tutorsDormants.length > 0 && tab === 'actifs' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{tutorsDormants.length} tuteurs pré-configurés en dormance</p>
            <p className="text-xs text-amber-600 mt-0.5">Chaque langue possède déjà un tuteur masculin et féminin. Activez-les en un clic.</p>
          </div>
          <button onClick={() => setTab('dormance')}
            className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
            Voir le catalogue
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        {[['actifs', '🟢 Actifs'], ['dormance', '✨ Catalogue tuteurs']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
            {key === 'dormance' && tutorsDormants.length > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{tutorsDormants.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Barre de recherche ── */}
      {!loading && (
        <div className="mb-4">
          <input type="text" placeholder="Rechercher un tuteur ou une langue…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm pl-4 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* ══ TAB ACTIFS ══════════════════════════════════════════════════ */}
          {tab === 'actifs' && (
            filteredActifs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun tuteur actif</p>
                <button onClick={() => setTab('dormance')} className="mt-4 text-sm bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                  ✨ Activer depuis le catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActifs.map((tutor, i) => (
                  <TutorCard key={tutor.id} tutor={tutor} idx={i}
                    onEdit={openEdit} onDelete={handleDelete} onToggle={toggleActive}
                    onActivate={handleActivate} activating={activating} dormant={false} />
                ))}
              </div>
            )
          )}

          {/* ══ TAB DORMANCE / CATALOGUE ════════════════════════════════════ */}
          {tab === 'dormance' && (
            <div className="space-y-5">
              {/* Bannière info */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-purple-900">Tuteurs pré-configurés — activation en un clic</p>
                  <p className="text-sm text-purple-700 mt-1">
                    Chaque langue dispose d'un tuteur masculin et féminin avec leur personnalité, leur voix et leur biographie déjà configurées.
                    Cliquez <strong>Activer</strong> pour les rendre disponibles dans l'application mobile.
                  </p>
                </div>
              </div>

              {filteredDormants.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <CheckCircleIcon className="w-14 h-14 mx-auto mb-4 text-green-400" />
                  <p className="text-lg font-semibold text-green-700">Tous les tuteurs sont actifs !</p>
                </div>
              ) : (
                sortedFamilles.map(famille => {
                  const items = dormantsByFamille[famille];
                  if (!items || items.length === 0) return null;
                  const colors = FAMILLE_COLORS[famille] || FAMILLE_COLORS['Autre'];
                  return (
                    <div key={famille}>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.bg} ${colors.border} border mb-3`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>{famille}</span>
                        <span className={`ml-auto text-xs ${colors.text} opacity-60`}>{items.length} tuteur{items.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {items.map((tutor, i) => (
                          <TutorCard key={tutor.id} tutor={tutor} idx={i}
                            onEdit={openEdit} onDelete={handleDelete} onToggle={toggleActive}
                            onActivate={handleActivate} activating={activating} dormant={true} />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal Créer / Modifier ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editTutor ? `Modifier — ${editTutor.nomAvatar}` : 'Nouveau Tuteur IA'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'avatar *</label>
                  <input className="input" value={form.nomAvatar}
                    onChange={e => setForm({...form, nomAvatar: e.target.value})}
                    placeholder="ex: Koffi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
                  <select className="input" value={form.languageId}
                    onChange={e => setForm({...form, languageId: e.target.value})}>
                    <option value="">-- Choisir --</option>
                    {languages.map(l => (
                      <option key={l.id} value={l.id}>{l.nom} ({l.code}){l.isActive === false ? ' ⏸' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm(f => ({...f, genre: 'M'}))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                        form.genre === 'M' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>♂</button>
                    <button type="button" onClick={() => setForm(f => ({...f, genre: 'F'}))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
                        form.genre === 'F' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>♀</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnalité (archétype)</label>
                <select className="input"
                  value={PERSONALITIES.find(p => form.personalite?.includes(p.label))?.value || 'custom'}
                  onChange={e => {
                    const p = PERSONALITIES.find(x => x.value === e.target.value);
                    if (p) setForm({...form, personalite: `${p.label} — ${p.desc}`});
                  }}>
                  <option value="custom">Description personnalisée</option>
                  {PERSONALITIES.map(p => (
                    <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description personnalisée</label>
                <textarea className="input h-20 resize-none" value={form.personalite}
                  onChange={e => setForm({...form, personalite: e.target.value})}
                  placeholder="Description de la personnalité du tuteur…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vitesse voix</label>
                  <input type="number" step="0.1" min="0.5" max="2.0" className="input"
                    value={form.voixConfig?.vitesse ?? 1.0}
                    onChange={e => setForm({...form, voixConfig: {...form.voixConfig, vitesse: parseFloat(e.target.value)}})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pitch voix</label>
                  <input type="number" step="0.1" min="0.5" max="2.0" className="input"
                    value={form.voixConfig?.pitch ?? 1.0}
                    onChange={e => setForm({...form, voixConfig: {...form.voixConfig, pitch: parseFloat(e.target.value)}})} />
                </div>
              </div>

              <FileUploadField
                type="image"
                label="Image avatar du tuteur"
                value={form.imageUrl}
                onChange={url => setForm({...form, imageUrl: url})}
              />

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="w-4 h-4 rounded text-primary-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Tuteur actif (visible dans l'app)</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? 'Sauvegarde…' : editTutor ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHelp pageId="tuteurs-ia" />
    </div>
  );
}
