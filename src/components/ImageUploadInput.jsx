/**
 * ImageUploadInput — champ image réutilisable
 * Permet d'importer une image depuis l'ordinateur OU de coller une URL.
 */
import { useRef, useState } from 'react';
import { ArrowUpTrayIcon, LinkIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { uploadAPI } from '../services/api';

/**
 * @param {string}   value      — URL actuelle de l'image
 * @param {Function} onChange   — (url: string) => void
 * @param {string}   [label]    — label affiché au-dessus du champ
 * @param {string}   [hint]     — texte d'aide sous le champ
 * @param {string}   [previewClass] — classes CSS supplémentaires pour l'aperçu
 */
export default function ImageUploadInput({
  value = '',
  onChange,
  label = "Image de l'avatar",
  hint = "Importez un fichier ou collez une URL en ligne.",
  previewClass = "w-20 h-20 rounded-xl object-cover border-2 border-primary-200",
}) {
  const [tab, setTab] = useState('url');        // 'url' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation basique
    if (!file.type.startsWith('image/')) {
      setUploadError('Fichier invalide. Formats acceptés : JPG, PNG, WEBP, GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (5 Mo maximum).');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadAPI.uploadImage(formData);
      const url = res.data?.url || res.data?.imageUrl || '';
      if (url) {
        onChange(url);
        setTab('url'); // Repasse en mode URL pour voir l'aperçu
      } else {
        setUploadError("L'upload a réussi mais aucune URL n'a été retournée.");
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      // Reset input pour pouvoir re-sélectionner le même fichier
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            tab === 'url' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <LinkIcon className="w-3.5 h-3.5" />
          URL en ligne
        </button>
        <button type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            tab === 'upload' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}>
          <ArrowUpTrayIcon className="w-3.5 h-3.5" />
          Depuis l'ordinateur
        </button>
      </div>

      {/* Champ URL */}
      {tab === 'url' && (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://exemple.com/photo.jpg"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-8"
          />
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Zone d'upload */}
      {tab === 'upload' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 px-4 transition-colors ${
              uploading
                ? 'border-primary-300 bg-primary-50 cursor-wait'
                : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'
            }`}>
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-primary-600 font-medium">Envoi en cours...</span>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">Cliquez pour choisir un fichier</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP, GIF — 5 Mo max</span>
              </>
            )}
          </button>

          {uploadError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <XMarkIcon className="w-3.5 h-3.5" />
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Aperçu */}
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={value}
            alt="Aperçu"
            className={previewClass}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div>
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <PhotoIcon className="w-3.5 h-3.5" />
              Aperçu de l'image
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{value}</p>
          </div>
        </div>
      )}

      {hint && !value && (
        <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
      )}
    </div>
  );
}
