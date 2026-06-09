/**
 * FileUploadField — composant réutilisable pour uploader audio / image / vidéo
 * depuis le PC vers Cloudinary via l'API.
 *
 * Props :
 *   type        : 'audio' | 'image' | 'video'
 *   value       : URL actuelle (string)
 *   onChange    : (url: string) => void
 *   label       : string (affiché au-dessus)
 *   sublabel    : string optionnel (ex: "recommandé pour non-lecteurs")
 *   disabled    : bool
 *   compact     : bool — réduit la hauteur (pour usage dans une grille)
 */
import { useRef, useState } from 'react';
import api from '../services/api';
import {
  ArrowUpTrayIcon, SpeakerWaveIcon, PhotoIcon, VideoCameraIcon,
  XMarkIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ACCEPT = {
  audio: '.mp3,.m4a,.wav,.ogg,.aac,.webm',
  image: '.jpg,.jpeg,.png,.gif,.webp,.svg',
  video: '.mp4,.mov,.avi,.mkv,.webm',
};

const MAX_SIZE = {
  audio: 20 * 1024 * 1024,   // 20 MB
  image: 10 * 1024 * 1024,   // 10 MB
  video: 100 * 1024 * 1024,  // 100 MB
};

const ENDPOINT = {
  audio: '/upload/audio',
  image: '/upload/image',
  video: '/upload/video',
};

const URL_KEY = {
  audio: ['audioUrl'],
  image: ['imageUrl'],
  video: ['videoUrl', 'url'],
};

const TYPE_HINT = {
  audio: 'MP3, WAV, M4A — max 20 MB',
  image: 'JPG, PNG, WEBP — max 10 MB',
  video: 'MP4, MOV, WEBM — max 100 MB',
};

const TYPE_LABEL = {
  audio: 'Importer un audio',
  image: 'Importer une image',
  video: 'Importer une vidéo',
};

const TYPE_PLACEHOLDER = {
  audio: 'ou coller une URL audio…',
  image: 'ou coller une URL image…',
  video: 'ou coller une URL vidéo (.mp4, YouTube embed…)',
};

function TypeIcon({ type, className }) {
  if (type === 'audio') return <SpeakerWaveIcon className={className} />;
  if (type === 'video') return <VideoCameraIcon className={className} />;
  return <PhotoIcon className={className} />;
}

export default function FileUploadField({ type, value, onChange, label, sublabel, disabled, compact }) {
  const inputRef = useRef(null);
  const [uploading, setUploading]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState('');
  const [dragging, setDragging]     = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const doUpload = async (file) => {
    setError('');
    setJustUploaded(false);
    if (!file) return;

    // Validation type MIME
    const mimeMap = { audio: 'audio/', image: 'image/', video: 'video/' };
    if (!file.type.startsWith(mimeMap[type])) {
      setError(`Fichier ${type} requis (${ACCEPT[type]})`);
      return;
    }
    if (file.size > MAX_SIZE[type]) {
      setError(`Trop volumineux — max ${MAX_SIZE[type] / 1024 / 1024} MB`);
      return;
    }

    const fieldName = type === 'audio' ? 'audio' : type === 'video' ? 'video' : 'image';
    const formData  = new FormData();
    formData.append(fieldName, file);

    setUploading(true);
    setProgress(0);
    try {
      const { data } = await api.post(ENDPOINT[type], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      // Chercher l'URL dans la réponse
      let url = '';
      for (const key of URL_KEY[type]) {
        url = data?.[key] || data?.data?.[key] || '';
        if (url) break;
      }
      if (!url) throw new Error('URL non reçue du serveur');
      onChange(url);
      setProgress(100);
      setJustUploaded(true);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFile    = (e)  => doUpload(e.target.files?.[0]);
  const handleDrop    = (e)  => { e.preventDefault(); setDragging(false); doUpload(e.dataTransfer.files?.[0]); };
  const handleClear   = ()   => { onChange(''); setError(''); setProgress(0); setJustUploaded(false); };

  const py = compact ? 'py-2' : 'py-4';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-0.5">
          {label}
          {sublabel && <span className="ml-1 text-xs font-normal text-gray-400">({sublabel})</span>}
        </label>
      )}

      {/* Zone principale drag & drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all ${py} px-4 ${
          dragging  ? 'border-accent bg-orange-50 scale-[1.01]' :
          justUploaded ? 'border-green-400 bg-green-50' :
          'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Aperçu si fichier présent */}
        {value && !uploading ? (
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {type === 'audio' ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <SpeakerWaveIcon className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{decodeURIComponent(value.split('/').pop())}</span>
                  </div>
                  <audio controls src={value} className="w-full rounded" style={{ height: 32 }} />
                </div>
              ) : type === 'video' ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <VideoCameraIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{decodeURIComponent(value.split('/').pop())}</span>
                  </div>
                  <video src={value} controls className="w-full max-h-36 rounded-lg border border-gray-200 object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={value} alt="aperçu"
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                    onError={e => { e.target.style.display='none'; }} />
                  <span className="text-xs text-gray-400 break-all line-clamp-3">{decodeURIComponent(value.split('/').pop())}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                title="Remplacer">
                <ArrowUpTrayIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Supprimer">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        ) : uploading ? (
          /* Progression */
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {type === 'video' ? '⏳ Upload vidéo en cours' : '⬆ Upload en cours'} — {progress}%
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Ne fermez pas cette page…</p>
          </div>

        ) : (
          /* Zone vide — clic ou drag */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
          >
            <TypeIcon type={type} className="w-9 h-9 text-gray-300" />
            <div className="text-center">
              <span className="text-sm font-semibold text-accent">{TYPE_LABEL[type]}</span>
              <p className="text-xs text-gray-400 mt-0.5">{TYPE_HINT[type]}</p>
              <p className="text-xs text-gray-300 mt-0.5">ou glisser-déposer ici</p>
            </div>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[type]}
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* URL manuelle (toujours visible) */}
      <input
        type="url"
        value={value || ''}
        onChange={(e) => { onChange(e.target.value); setError(''); setJustUploaded(false); }}
        placeholder={TYPE_PLACEHOLDER[type]}
        className="input w-full text-xs text-gray-500 mt-1.5"
        disabled={disabled}
      />

      {/* Erreur */}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <XMarkIcon className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}

      {/* Succès */}
      {justUploaded && !error && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <CheckCircleIcon className="w-3 h-3 flex-shrink-0" /> Fichier uploadé et hébergé sur Cloudinary ✓
        </p>
      )}
    </div>
  );
}
