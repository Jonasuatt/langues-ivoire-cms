import { useEffect, useState, useRef } from 'react';
import PageHelp from '../components/PageHelp';
import { notificationsAdminAPI, adminAPI, uploadAPI } from '../services/api';
import {
  BellIcon, PaperAirplaneIcon, ClockIcon, UsersIcon,
  MegaphoneIcon, PhotoIcon, MusicalNoteIcon, VideoCameraIcon,
  ArrowUpTrayIcon, XMarkIcon, EyeIcon, SpeakerWaveIcon,
  CheckCircleIcon, ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ─── Types notification ────────────────────────────────────────────────────────
const TYPES_NOTIF = [
  { value: 'SYSTEM',    label: '📢 Système',              desc: 'Annonce générale de la plateforme' },
  { value: 'ANNONCE',   label: '📣 Annonce',              desc: 'Informations sur nos partenaires ou structures' },
  { value: 'LESSON',    label: '📚 Nouvelle leçon',       desc: 'Leçon disponible dans l\'app' },
  { value: 'REMINDER',  label: '⏰ Rappel',               desc: 'Rappel d\'apprentissage' },
  { value: 'BADGE',     label: '🏅 Badge / Récompense',   desc: 'Attribution d\'un badge' },
  { value: 'CULTURAL',  label: '🎭 Événement culturel',   desc: 'Événement culturel ivoirien' },
];

const CATS_PUB = [
  { value: 'EVENEMENT',  label: '🎉 Événement',   color: 'bg-purple-100 text-purple-700' },
  { value: 'PROMOTION',  label: '🎁 Promotion',   color: 'bg-green-100 text-green-700' },
  { value: 'PARTENAIRE', label: '🤝 Partenaire',  color: 'bg-blue-100 text-blue-700' },
  { value: 'ACTUALITE',  label: '📰 Actualité',   color: 'bg-orange-100 text-orange-700' },
];

const EMPTY_NOTIF = { titre: '', corps: '', type: 'SYSTEM', targetUserId: '' };
const EMPTY_PUB   = { titre: '', corps: '', categorie: 'EVENEMENT', targetUserId: '', imageUrl: '', audioUrl: '', videoUrl: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('fr-CI', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function typeBadge(type, categorie) {
  if (type === 'PUBLICITE') {
    const cat = CATS_PUB.find(c => c.value === categorie);
    return cat ? <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cat.color}`}>{cat.label}</span> : null;
  }
  const t = TYPES_NOTIF.find(t => t.value === type);
  return t ? <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">{t.label}</span> : null;
}

// ─── Mini Upload Zone ──────────────────────────────────────────────────────────
function UploadZone({ accept, label, icon: Icon, value, onChange, uploading, onUpload, maxSize = '50 MB' }) {
  const ref = useRef(null);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {value ? (
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs text-gray-600 flex-1 truncate">{value}</span>
          <button onClick={() => onChange('')} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          onClick={() => ref.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              <span className="text-xs text-blue-500">Upload…</span>
            </div>
          ) : (
            <>
              <Icon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Cliquer ou glisser — {maxSize}</p>
            </>
          )}
        </div>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={onUpload} />
      {!value && (
        <input type="url" placeholder="Ou coller une URL directement…"
          className="w-full mt-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600 placeholder-gray-400"
          onBlur={e => e.target.value.trim() && onChange(e.target.value.trim())}
          onKeyDown={e => e.key === 'Enter' && e.target.value.trim() && onChange(e.target.value.trim())}
        />
      )}
    </div>
  );
}

// ─── Aperçu Push (notification) ───────────────────────────────────────────────
function AperçuPush({ titre, corps }) {
  if (!titre && !corps) return null;
  return (
    <div className="mt-4 bg-gray-900 rounded-2xl p-4 text-white">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
          <BellIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs text-gray-400">Langues Ivoire • Maintenant</span>
      </div>
      <p className="text-sm font-semibold">{titre || 'Titre de la notification'}</p>
      <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">{corps || 'Contenu…'}</p>
    </div>
  );
}

// ─── Aperçu Publicité ─────────────────────────────────────────────────────────
function AperçuPub({ form }) {
  if (!form.titre && !form.corps && !form.imageUrl) return null;
  const cat = CATS_PUB.find(c => c.value === form.categorie);
  return (
    <div className="mt-4 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {form.imageUrl && (
        <div className="bg-gray-100 h-36 overflow-hidden">
          <img src={form.imageUrl} alt="aperçu" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Langues Ivoire</span>
          {cat && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${cat.color}`}>{cat.label}</span>}
        </div>
        {form.titre && <p className="text-sm font-bold text-gray-900">{form.titre}</p>}
        {form.corps && <p className="text-xs text-gray-600 mt-0.5 line-clamp-3">{form.corps}</p>}
        <div className="flex gap-3 mt-2">
          {form.audioUrl && <span className="text-xs text-blue-500 flex items-center gap-1"><MusicalNoteIcon className="w-3 h-3" />Audio</span>}
          {form.videoUrl && <span className="text-xs text-red-500 flex items-center gap-1"><VideoCameraIcon className="w-3 h-3" />Vidéo</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Détail notification ────────────────────────────────────────────────
function ModalDetail({ notif, onClose }) {
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const playAudio = (url) => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setPlaying(false);
    audioRef.current.play();
    setPlaying(true);
  };

  const isPub    = notif.type === 'PUBLICITE';
  const cat      = CATS_PUB.find(c => c.value === notif.categorie);
  const typeInfo = TYPES_NOTIF.find(t => t.value === notif.type);
  const taux     = notif.totalRecipients > 0
    ? Math.round((notif.readCount / notif.totalRecipients) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            {isPub
              ? <MegaphoneIcon className="w-5 h-5 text-purple-500" />
              : <BellIcon className="w-5 h-5 text-blue-500" />
            }
            <h2 className="font-bold text-gray-900 text-base">
              {isPub ? 'Publicité envoyée' : 'Notification envoyée'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Badges type + date */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPub && cat
              ? <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cat.color}`}>{cat.label}</span>
              : typeInfo && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">{typeInfo.label}</span>
            }
            <span className="text-xs text-gray-400 ml-auto">{formatDate(notif.createdAt)}</span>
          </div>

          {/* Image (publicité) */}
          {notif.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <img src={notif.imageUrl} alt={notif.titre} className="w-full max-h-56 object-cover" />
            </div>
          )}

          {/* Titre */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Titre</p>
            <p className="text-lg font-bold text-gray-900">{notif.titre}</p>
          </div>

          {/* Corps */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notif.corps}
            </div>
          </div>

          {/* Audio */}
          {notif.audioUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Audio joint</p>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <MusicalNoteIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-blue-700 flex-1 truncate">{notif.audioUrl}</span>
                <button onClick={() => playAudio(notif.audioUrl)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  {playing
                    ? <><XMarkIcon className="w-3.5 h-3.5" />Stop</>
                    : <><SpeakerWaveIcon className="w-3.5 h-3.5" />Écouter</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* Vidéo */}
          {notif.videoUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vidéo jointe</p>
              {notif.videoUrl.includes('youtube.com') || notif.videoUrl.includes('youtu.be') ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video bg-black">
                  <iframe
                    src={notif.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full" allowFullScreen title="vidéo" />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <VideoCameraIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <a href={notif.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-red-700 truncate flex-1 underline">
                    {notif.videoUrl}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Statistiques</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Destinataires', value: notif.totalRecipients ?? '—', icon: '📤', color: 'text-gray-700' },
                { label: 'Messages lus', value: notif.readCount ?? '—', icon: '👁️', color: 'text-blue-600' },
                { label: 'Taux ouverture', value: `${taux}%`, icon: '📊', color: taux > 50 ? 'text-green-600' : 'text-orange-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg">{s.icon}</p>
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Réponses (si le champ existe) */}
          {notif.reponse && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Réponse envoyée</p>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800 border border-green-100 whitespace-pre-wrap">
                {notif.reponse}
              </div>
            </div>
          )}

          {/* Interactions utilisateurs */}
          {notif.interactions && notif.interactions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Interactions</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notif.interactions.map((inter, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                    <span>👤</span>
                    <span className="flex-1">{inter.userName || inter.userId}</span>
                    <span className="text-gray-400">{inter.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage]             = useState(1);
  const [totalHist, setTotalHist]   = useState(0);
  const [detailNotif, setDetailNotif] = useState(null);

  // ── Onglet composer ──
  const [composerTab, setComposerTab] = useState('notif'); // 'notif' | 'pub'

  // ── Formulaire Notification ──
  const [form, setForm]             = useState(EMPTY_NOTIF);
  const [targetMode, setTargetMode] = useState('all');
  const [sending, setSending]       = useState(false);

  // ── Formulaire Publicité ──
  const [pub, setPub]               = useState(EMPTY_PUB);
  const [pubTarget, setPubTarget]   = useState('all');
  const [sendingPub, setSendingPub] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingAud, setUploadingAud] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);

  const loadHistory = () => {
    setHistLoading(true);
    notificationsAdminAPI.getHistory({ page, limit: 10 })
      .then(({ data }) => { setHistory(data.data || []); setTotalHist(data.total || 0); })
      .catch(() => {})
      .finally(() => setHistLoading(false));
  };

  useEffect(() => {
    loadHistory();
    adminAPI.getUsers({ limit: 1 }).then(({ data }) => setTotalUsers(data.total || 0)).catch(() => {});
  }, [page]);

  // ── Envoi Notification ──
  const handleSend = async () => {
    if (!form.titre.trim() || !form.corps.trim()) { toast.error('Titre et contenu requis'); return; }
    if (targetMode === 'user' && !form.targetUserId.trim()) { toast.error('ID utilisateur requis'); return; }
    setSending(true);
    try {
      const payload = {
        titre: form.titre.trim(), corps: form.corps.trim(), type: form.type,
        ...(targetMode === 'user' ? { targetUserId: form.targetUserId.trim() } : {}),
      };
      const { data } = await notificationsAdminAPI.send(payload);
      const sent = data.sent ?? 1;
      toast.success(`✅ Notification envoyée à ${sent} utilisateur${sent > 1 ? 's' : ''}`);
      setForm(EMPTY_NOTIF); setTargetMode('all');
      loadHistory();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi'); }
    finally { setSending(false); }
  };

  // ── Envoi Publicité ──
  const handleSendPub = async () => {
    if (!pub.titre.trim() || !pub.corps.trim()) { toast.error('Titre et description requis'); return; }
    if (pubTarget === 'user' && !pub.targetUserId.trim()) { toast.error('ID utilisateur requis'); return; }
    setSendingPub(true);
    try {
      const payload = {
        titre: pub.titre.trim(), corps: pub.corps.trim(),
        type: 'PUBLICITE', categorie: pub.categorie,
        imageUrl: pub.imageUrl || undefined,
        audioUrl: pub.audioUrl || undefined,
        videoUrl: pub.videoUrl || undefined,
        ...(pubTarget === 'user' ? { targetUserId: pub.targetUserId.trim() } : {}),
      };
      const { data } = await notificationsAdminAPI.send(payload);
      const sent = data.sent ?? 1;
      toast.success(`✅ Publicité envoyée à ${sent} utilisateur${sent > 1 ? 's' : ''}`);
      setPub(EMPTY_PUB); setPubTarget('all');
      loadHistory();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi'); }
    finally { setSendingPub(false); }
  };

  // ── Uploads Publicité ──
  const handleUploadImg = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const { data } = await uploadAPI.uploadImage(fd);
      setPub(p => ({ ...p, imageUrl: data.imageUrl || data.url || '' }));
    } catch { toast.error('Erreur upload image'); } finally { setUploadingImg(false); }
  };
  const handleUploadAud = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAud(true);
    try {
      const fd = new FormData(); fd.append('audio', file);
      const { data } = await uploadAPI.uploadAudio(fd);
      setPub(p => ({ ...p, audioUrl: data.audioUrl || data.url || '' }));
    } catch { toast.error('Erreur upload audio'); } finally { setUploadingAud(false); }
  };
  const handleUploadVid = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVid(true);
    try {
      const fd = new FormData(); fd.append('video', file);
      const { data } = await uploadAPI.uploadVideo(fd);
      setPub(p => ({ ...p, videoUrl: data.videoUrl || data.url || '' }));
    } catch { toast.error('Erreur upload vidéo'); } finally { setUploadingVid(false); }
  };

  // ── Stats ──
  const recentSends    = history.length;
  const totalRead      = history.reduce((s, n) => s + (n.readCount || 0), 0);
  const totalRecip     = history.reduce((s, n) => s + (n.totalRecipients || 0), 0);
  const tauxOuverture  = totalRecip > 0 ? Math.round((totalRead / totalRecip) * 100) : 0;
  const totalPages     = Math.ceil(totalHist / 10);

  // ── Ouvrir le détail ──
  const openDetail = (notif) => setDetailNotif(notif);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellIcon className="w-7 h-7 text-blue-500" />
            Notifications & Publicités
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Envoyez des notifications ciblées et des publicités enrichies aux utilisateurs de l'app
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Envois (historique)', value: recentSends, color: 'text-gray-800', icon: ClockIcon, bg: 'bg-gray-50' },
          { label: 'Taux d\'ouverture', value: `${tauxOuverture}%`, color: 'text-blue-600', icon: EyeIcon, bg: 'bg-blue-50' },
          { label: 'Messages lus', value: totalRead, color: 'text-green-600', icon: CheckCircleIcon, bg: 'bg-green-50' },
          { label: 'Utilisateurs inscrits', value: totalUsers.toLocaleString(), color: 'text-gray-800', icon: UsersIcon, bg: 'bg-gray-50' },
        ].map(({ label, value, color, icon: Icon, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3 border border-gray-100`}>
            <Icon className={`w-7 h-7 ${color} flex-shrink-0`} />
            <div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ══════════ COMPOSER (gauche) ══════════ */}
        <div className="space-y-4">

          {/* Onglets Notification / Publicité */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setComposerTab('notif')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                composerTab === 'notif'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <BellIcon className="w-4 h-4" />
              📢 Notification
            </button>
            <button onClick={() => setComposerTab('pub')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                composerTab === 'pub'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <MegaphoneIcon className="w-4 h-4" />
              📣 Publicité
            </button>
          </div>

          {/* ── TAB NOTIFICATION ── */}
          {composerTab === 'notif' && (
            <div className="card space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <PaperAirplaneIcon className="w-5 h-5 text-blue-500" />
                Composer une notification
              </h2>

              {/* Destinataires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
                <div className="flex gap-2">
                  {[{ k: 'all', l: '👥 Tous les utilisateurs' }, { k: 'user', l: '👤 Utilisateur ciblé' }].map(b => (
                    <button key={b.k} onClick={() => setTargetMode(b.k)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                        targetMode === b.k ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}>
                      {b.l}
                    </button>
                  ))}
                </div>
                {targetMode === 'user' && (
                  <input className="input mt-2" value={form.targetUserId}
                    onChange={e => setForm({ ...form, targetUserId: e.target.value })}
                    placeholder="ID ou email de l'utilisateur" />
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de notification</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES_NOTIF.map(t => (
                    <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                      className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${
                        form.type === t.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input className="input" value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  placeholder="ex: Nouvelle leçon de Dioula disponible !" maxLength={100} />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{form.titre.length}/100</p>
              </div>

              {/* Corps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea className="input h-24 resize-none" value={form.corps}
                  onChange={e => setForm({ ...form, corps: e.target.value })}
                  placeholder="ex: Une nouvelle leçon vous attend. Commencez dès maintenant !" maxLength={300} />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{form.corps.length}/300</p>
              </div>

              <AperçuPush titre={form.titre} corps={form.corps} />

              <div className="flex gap-3">
                <button onClick={() => setForm(EMPTY_NOTIF)} className="btn-secondary flex-1">Effacer</button>
                <button onClick={handleSend} disabled={sending || !form.titre || !form.corps}
                  className="btn-primary flex-1 justify-center flex items-center gap-2">
                  {sending
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Envoi…</>
                    : <><PaperAirplaneIcon className="w-4 h-4" />Envoyer{targetMode === 'all' ? ` à tous (${totalUsers})` : ''}</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── TAB PUBLICITÉ ── */}
          {composerTab === 'pub' && (
            <div className="card space-y-4">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <MegaphoneIcon className="w-5 h-5 text-purple-500" />
                  Créer une publicité
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Événements, promotions, partenaires… avec image, audio et vidéo.
                </p>
              </div>

              {/* Destinataires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinataires</label>
                <div className="flex gap-2">
                  {[{ k: 'all', l: '👥 Tous' }, { k: 'user', l: '👤 Ciblé' }].map(b => (
                    <button key={b.k} onClick={() => setPubTarget(b.k)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                        pubTarget === b.k ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}>
                      {b.l}
                    </button>
                  ))}
                </div>
                {pubTarget === 'user' && (
                  <input className="input mt-2" value={pub.targetUserId}
                    onChange={e => setPub({ ...pub, targetUserId: e.target.value })}
                    placeholder="ID ou email de l'utilisateur" />
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATS_PUB.map(c => (
                    <button key={c.value} onClick={() => setPub({ ...pub, categorie: c.value })}
                      className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        pub.categorie === c.value
                          ? `${c.color} border-current`
                          : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input className="input" value={pub.titre}
                  onChange={e => setPub({ ...pub, titre: e.target.value })}
                  placeholder="ex: Festival des Langues Ivoiriennes 2025" maxLength={120} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea className="input h-24 resize-none" value={pub.corps}
                  onChange={e => setPub({ ...pub, corps: e.target.value })}
                  placeholder="Détaillez votre publicité ici : dates, lieu, contacts…" maxLength={600} />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{pub.corps.length}/600</p>
              </div>

              {/* Médias */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  📎 Fichiers joints
                  <span className="text-xs font-normal text-gray-400">Optionnel</span>
                </p>

                <UploadZone
                  accept="image/*" label="🖼️ Image" icon={PhotoIcon}
                  value={pub.imageUrl} onChange={v => setPub(p => ({ ...p, imageUrl: v }))}
                  uploading={uploadingImg} onUpload={handleUploadImg} maxSize="10 MB"
                />
                <UploadZone
                  accept="audio/*" label="🎵 Audio" icon={MusicalNoteIcon}
                  value={pub.audioUrl} onChange={v => setPub(p => ({ ...p, audioUrl: v }))}
                  uploading={uploadingAud} onUpload={handleUploadAud} maxSize="20 MB"
                />
                <UploadZone
                  accept="video/*" label="🎬 Vidéo" icon={VideoCameraIcon}
                  value={pub.videoUrl} onChange={v => setPub(p => ({ ...p, videoUrl: v }))}
                  uploading={uploadingVid} onUpload={handleUploadVid} maxSize="200 MB"
                />
              </div>

              <AperçuPub form={pub} />

              <div className="flex gap-3">
                <button onClick={() => setPub(EMPTY_PUB)} className="btn-secondary flex-1">Effacer</button>
                <button onClick={handleSendPub} disabled={sendingPub || !pub.titre || !pub.corps}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition-colors">
                  {sendingPub
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Envoi…</>
                    : <><MegaphoneIcon className="w-4 h-4" />Publier{pubTarget === 'all' ? ` à tous (${totalUsers})` : ''}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ══════════ HISTORIQUE (droite) ══════════ */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            Historique des envois
            <span className="ml-auto text-xs text-gray-400 font-normal">{totalHist} au total</span>
          </h2>

          {histLoading ? (
            <div className="space-y-2 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BellIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune notification envoyée</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(n => {
                const isPub = n.type === 'PUBLICITE';
                const taux  = n.totalRecipients > 0 ? Math.round((n.readCount / n.totalRecipients) * 100) : 0;
                return (
                  <button key={n.id} onClick={() => openDetail(n)}
                    className="w-full text-left border border-gray-100 rounded-xl p-3.5 hover:bg-gray-50 hover:border-gray-200 transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isPub
                          ? <MegaphoneIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          : <BellIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        }
                        <p className="text-sm font-semibold text-gray-900 truncate">{n.titre}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                        <EyeIcon className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mb-2 pl-6">{n.corps}</p>
                    <div className="flex items-center gap-3 pl-6">
                      {typeBadge(n.type, n.categorie)}
                      {n.imageUrl && <PhotoIcon className="w-3.5 h-3.5 text-gray-300" title="Image jointe" />}
                      {n.audioUrl && <MusicalNoteIcon className="w-3.5 h-3.5 text-gray-300" title="Audio joint" />}
                      {n.videoUrl && <VideoCameraIcon className="w-3.5 h-3.5 text-gray-300" title="Vidéo jointe" />}
                      <span className="ml-auto text-xs text-gray-400">
                        📤 {n.totalRecipients ?? 0} · 👁️ {taux}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-xs py-1.5 px-3">← Préc.</button>
              <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                className="btn-secondary text-xs py-1.5 px-3">Suiv. →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Détail ── */}
      {detailNotif && (
        <ModalDetail notif={detailNotif} onClose={() => setDetailNotif(null)} />
      )}
      <PageHelp pageId="notifications" />
    </div>
  );
}
