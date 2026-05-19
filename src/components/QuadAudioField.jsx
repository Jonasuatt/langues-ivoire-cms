/**
 * QuadAudioField — 4 champs audio M/F pour langue locale et français
 * Props:
 *   audioUrl     : string  — locale homme
 *   audioUrlF    : string  — locale femme
 *   audioUrlFr   : string  — français homme
 *   audioUrlFrF  : string  — français femme
 *   onChange     : (field, url) => void
 *   langLabel    : string  — ex: "Dioula", "Baoulé" (optionnel)
 *   disabled     : bool
 */
import FileUploadField from './FileUploadField';

export default function QuadAudioField({ audioUrl = '', audioUrlF = '', audioUrlFr = '', audioUrlFrF = '', onChange, langLabel = 'Langue locale', disabled = false }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audios prononciation</p>
      <div className="grid grid-cols-2 gap-3">
        <FileUploadField
          type="audio"
          label={`👨 ${langLabel} — Homme`}
          value={audioUrl}
          onChange={url => onChange('audioUrl', url)}
          disabled={disabled}
        />
        <FileUploadField
          type="audio"
          label={`👩 ${langLabel} — Femme`}
          value={audioUrlF}
          onChange={url => onChange('audioUrlF', url)}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FileUploadField
          type="audio"
          label="👨 Français — Homme"
          value={audioUrlFr}
          onChange={url => onChange('audioUrlFr', url)}
          disabled={disabled}
        />
        <FileUploadField
          type="audio"
          label="👩 Français — Femme"
          value={audioUrlFrF}
          onChange={url => onChange('audioUrlFrF', url)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
