import { useState, useEffect, useCallback, useRef } from 'react';
import { languagesAPI, uploadAPI, dictionaryAPI } from '../services/api';
import {
  MusicalNoteIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationTriangleIcon,
  XCircleIcon, TrashIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ACCEPTED_AUDIO = '.mp3,.wav,.ogg,.webm,.m4a';

export default function AudioUploadPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState('auto'); // auto | mapping
  const [mappings, setMappings] = useState({}); // filename -> mot
  const fileInputRef = useRef(null);

  useEffect(() => {
    languagesAPI.getAll().then(r => setLanguages(r.data)).catch(() => {});
  }, []);

  // ---- Drag & Drop ----
  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)
    );
    if (dropped.length) addFiles(dropped);
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length) addFiles(selected);
    e.target.value = '';
  };

  const addFiles = (newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      const unique = newFiles.filter(f => !existing.has(f.name));
      return [...prev, ...unique];
    });
    setResults(null);
  };

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    setMappings(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const clearAll = () => { setFiles([]); setMappings({}); setResults(null); };

  // ---- Upload ----
  const handleUpload = async () => {
    if (!selectedLang || files.length === 0) return;
    setUploading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('langueCode', selectedLang);
      files.forEach(f => formData.append('audios', f));

      let response;
      if (mode === 'mapping' && Object.keys(mappings).length > 0) {
        const mappingArray = Object.entries(mappings)
          .filter(([, mot]) => mot.trim())
          .map(([fichier, mot]) => ({ fichier, mot: mot.trim() }));
        formData.append('mappings', JSON.stringify(mappingArray));
        response = await uploadAPI.bulkUploadWithMapping(formData);
      } else {
        response = await uploadAPI.bulkUploadAudio(formData);
      }

      setResults(response.data);
    } catch (err) {
      setResults({ success: false, error: err.response?.data?.error || err.message });
    } finally {
      setUploading(false);
    }
  };

  const updateMapping = (filename, mot) => {
    setMappings(prev => ({ ...prev, [filename]: mot }));
  };

  const getMotFromFilename = (filename) =>
    filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MusicalNoteIcon className="w-7 h-7 text-primary-500" />
          Import Audio en Masse
        </h1>
        <p className="text-gray-500 mt-1">
          Uploadez les fichiers audio enregistrés par votre équipe. Les fichiers seront automatiquement associés aux mots du dictionnaire.
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Langue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue cible *</label>
            <select
              value={selectedLang}
              onChange={e => setSelectedLang(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Sélectionner une langue --</option>
              {languages.map(l => (
                <option key={l.id} value={l.code}>{l.nom} ({l.code})</option>
              ))}
            </select>
          </div>
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode d'association</label>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('auto')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  mode === 'auto' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Automatique
              </button>
              <button
                onClick={() => setMode('mapping')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  mode === 'mapping' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Mapping manuel
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'auto'
                ? 'Le nom du fichier = le mot (ex: akwaba.mp3 → "akwaba")'
                : 'Associez manuellement chaque fichier à un mot du dictionnaire'}
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <ArrowUpTrayIcon className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-primary-500' : 'text-gray-400'}`} />
        <p className="text-lg font-medium text-gray-700">
          Glissez-déposez vos fichiers audio ici
        </p>
        <p className="text-sm text-gray-400 mt-1">
          ou cliquez pour parcourir • MP3, WAV, OGG, WebM • 10 Mo max par fichier
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_AUDIO}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border mt-5">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-800">
              {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
            </h3>
            <div className="flex gap-2">
              <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                <TrashIcon className="w-4 h-4" /> Tout supprimer
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {files.map(file => {
              const motDetected = getMotFromFilename(file.name);
              const mappedMot = mappings[file.name];
              const resultItem = results?.results?.find(r => r.file === file.name);
              const errorItem = results?.errors?.find(e => e.file === file.name);

              return (
                <div key={file.name} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  {/* Icone status */}
                  <div className="flex-shrink-0">
                    {resultItem?.status === 'linked' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : resultItem?.status === 'uploaded_no_match' ? (
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    ) : errorItem ? (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <MusicalNoteIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Info fichier */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024).toFixed(0)} Ko
                      {mode === 'auto' && <span className="ml-2">→ mot détecté : <strong>{motDetected}</strong></span>}
                    </p>
                    {resultItem && (
                      <p className={`text-xs mt-0.5 ${resultItem.status === 'linked' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {resultItem.status === 'linked' ? `✓ Associé au mot "${resultItem.mot}"` : `⚠ Uploadé mais aucun mot "${resultItem.mot}" trouvé`}
                      </p>
                    )}
                    {errorItem && (
                      <p className="text-xs text-red-500 mt-0.5">✗ Erreur : {errorItem.error}</p>
                    )}
                  </div>

                  {/* Mapping manuel */}
                  {mode === 'mapping' && !results && (
                    <input
                      type="text"
                      placeholder="Mot associé..."
                      value={mappedMot || ''}
                      onChange={e => updateMapping(file.name, e.target.value)}
                      className="w-40 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  )}

                  {/* Supprimer */}
                  {!results && (
                    <button onClick={() => removeFile(file.name)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Résumé des résultats */}
      {results && results.summary && (
        <div className="bg-white rounded-xl shadow-sm border mt-5 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Résultat de l'import</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-800">{results.summary.total}</p>
              <p className="text-xs text-gray-500">Total fichiers</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{results.summary.linked}</p>
              <p className="text-xs text-green-600">Associés</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">{results.summary.uploadedNoMatch}</p>
              <p className="text-xs text-yellow-600">Sans correspondance</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{results.summary.errors}</p>
              <p className="text-xs text-red-600">Erreurs</p>
            </div>
          </div>
        </div>
      )}

      {results && !results.summary && results.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl mt-5 p-4">
          <p className="text-red-700 font-medium">Erreur lors de l'import</p>
          <p className="text-red-500 text-sm mt-1">{results.error}</p>
        </div>
      )}

      {/* Bouton Upload */}
      {files.length > 0 && !results && (
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!selectedLang || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium shadow-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5" />
                Uploader {files.length} fichier{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Nouveau batch */}
      {results && (
        <div className="mt-5 flex justify-end">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium shadow-sm hover:bg-primary-600 transition-colors"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            Nouvel import
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl mt-6 p-5">
        <h4 className="font-semibold text-blue-800 mb-2">Comment nommer vos fichiers audio ?</h4>
        <ul className="text-sm text-blue-700 space-y-1.5">
          <li><strong>Mode automatique :</strong> Le nom du fichier doit correspondre au mot dans le dictionnaire.</li>
          <li>Exemple : <code className="bg-blue-100 px-1 rounded">akwaba.mp3</code> sera associé au mot <strong>"akwaba"</strong></li>
          <li>Les tirets et underscores sont convertis en espaces : <code className="bg-blue-100 px-1 rounded">bon_jour.mp3</code> → <strong>"bon jour"</strong></li>
          <li><strong>Mode mapping :</strong> Nommez vos fichiers librement et associez chaque fichier à un mot dans l'interface.</li>
          <li>Formats acceptés : MP3, WAV, OGG, WebM • Taille max : 10 Mo par fichier • Jusqu'à 50 fichiers par lot</li>
        </ul>
      </div>
    </div>
  );
}
