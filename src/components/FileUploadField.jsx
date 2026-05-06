/**
 * FileUploadField — composant réutilisable pour uploader un fichier audio ou image
 * depuis le PC vers Cloudinary via l'API /upload/audio ou /upload/image.
 *
 * Props :
 *   type        : 'audio' | 'image'
 *   value       : URL actuelle (string)
 *   onChange    : (url: string) => void
 *   label       : string (affiché au-dessus)
 *   disabled    : bool
 */
import { useRef, useState } from 'react';
import api from '../services/api';
import {
  ArrowUpTrayIcon, SpeakerWaveIcon, PhotoIcon,
  XMarkIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';

const ACCEPT = {
  audio: '.mp3,.m4a,.wav,.ogg,.aac,.webm',
  image: '.jpg,.jpeg,.png,.gif,.webp,.svg',
};

const MAX_SIZE = {
  audio: 20 * 1024 * 1024,   // 20 MB
  image: 10 * 1024 * 1024,   // 10 MB
};

const ENDPOINT = {
  audio: '/upload/audio',
  image: '/upload/image',
};

export default function FileUploadField({ type, value, onChange, label, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const doUpload = async (file) => {
    setError('');
    if (!file) return;

    // Vérif type
    const isAudio = type === 'audio';
    const isImage = type === 'image';
    if (isAudio && !file.type.startsWith('audio/')) {
      setError('Fichier audio requis (.mp3, .wav, .m4a…)');
      return;
    }
    if (isImage && !file.type.startsWith('image/')) {
      setError('Fichier image requis (.jpg, .png, .webp…)');
      return;
    }
    if (file.size > MAX_SIZE[type]) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE[type] / 1024 / 1024} MB)`);
      return;
    }

    const formData = new FormData();
    formData.append(isAudio ? 'audio' : 'image', file);

    setUploading(true);
    setProgress(0);
    try {
      const { data } = await api.post(ENDPOINT[type], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      const url = data?.data?.audioUrl || data?.data?.imageUrl || data?.audioUrl || data?.imageUrl || '';
      if (!url) throw new Error('URL non reçue');
      onChange(url);
      setProgress(100);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e) => doUpload(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    doUpload(e.dataTransfer.files?.[0]);
  };

  const handleClear = () => { onChange(''); setError(''); setProgress(0); };

  const isAudio = type === 'audio';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {/* Zone drag & drop / bouton */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${
          dragging ? 'border-accent bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Prévisualisation si URL existante */}
        {value && !uploading ? (
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {isAudio ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <SpeakerWaveIcon className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{value.split('/').pop()}</span>
                  </div>
                  <audio controls src={value} className="w-full h-8 rounded" style={{ height: 36 }} />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={value} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                  <span className="text-xs text-gray-400 truncate flex-1">{value.split('/').pop()}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                title="Remplacer">
                <ArrowUpTrayIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleClear}
                className="p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                title="Supprimer">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : uploading ? (
          /* Barre de progression */
          <div className="text-center py-2">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">Upload en cours… {progress}%</p>
          </div>
        ) : (
          /* État vide */
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 py-2 cursor-pointer">
            {isAudio
              ? <SpeakerWaveIcon className="w-8 h-8 text-gray-300" />
              : <PhotoIcon className="w-8 h-8 text-gray-300" />
            }
            <div className="text-center">
              <span className="text-sm font-medium text-accent">
                {isAudio ? 'Importer un audio' : 'Importer une image'}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAudio ? 'MP3, WAV, M4A — max 20 MB' : 'JPG, PNG, WEBP — max 10 MB'}
              </p>
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

      {/* Saisie manuelle de l'URL */}
      <div className="mt-2">
        <input
          type="url"
          value={value}
          onChange={(e) => { onChange(e.target.value); setError(''); }}
          placeholder={isAudio ? 'ou coller une URL audio…' : 'ou coller une URL image…'}
          className="input w-full text-xs text-gray-500"
          disabled={disabled}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <XMarkIcon className="w-3 h-3" /> {error}
        </p>
      )}

      {/* Confirmation succès */}
      {!uploading && value && progress === 100 && !error && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <CheckCircleIcon className="w-3 h-3" /> Fichier uploadé avec succès
        </p>
      )}
    </div>
  );
}
