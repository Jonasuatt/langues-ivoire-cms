// ─── Avatars locaux — portraits des 16 tuteurs ────────────────────────────────
// Utilisé dans TutorsPage pour afficher l'illustration ethnique du tuteur.

import amaraPortrait    from '../assets/avatars/amara_portrait.png';
import ayaPortrait      from '../assets/avatars/aya_portrait.png';
import blekaPortrait    from '../assets/avatars/bleka_portrait.png';
import djenebaPortrait  from '../assets/avatars/djeneba_portrait.png';
import dolouroPortrait  from '../assets/avatars/dolourou_portrait.png';
import kadioPortrait    from '../assets/avatars/kadio_portrait.png';
import koffiPortrait    from '../assets/avatars/koffi_portrait.png';
import nachePortrait    from '../assets/avatars/nache_portrait.png';
import oulahiPortrait   from '../assets/avatars/oulahi_portrait.png';
import ozouaPortrait    from '../assets/avatars/ozoua_portrait.png';
import pololoPortrait   from '../assets/avatars/pololo_portrait.png';
import tehiaPortrait    from '../assets/avatars/tehia_portrait.png';
import tialagnonPortrait from '../assets/avatars/tialagnon_portrait.png';
import traLouPortrait   from '../assets/avatars/tra_lou_portrait.png';
import yoroPortrait     from '../assets/avatars/yoro_portrait.png';
import zanBiPortrait    from '../assets/avatars/zan_bi_portrait.png';

const PORTRAITS = {
  amara:     amaraPortrait,
  aya:       ayaPortrait,
  bleka:     blekaPortrait,
  djeneba:   djenebaPortrait,
  dolourou:  dolouroPortrait,
  kadio:     kadioPortrait,
  koffi:     koffiPortrait,
  nache:     nachePortrait,
  oulahi:    oulahiPortrait,
  ozoua:     ozouaPortrait,
  pololo:    pololoPortrait,
  tehia:     tehiaPortrait,
  tialagnon: tialagnonPortrait,
  tra_lou:   traLouPortrait,
  yoro:      yoroPortrait,
  zan_bi:    zanBiPortrait,
};

/**
 * Retourne l'URL du portrait local pour un tuteur.
 * @param {string} nomAvatar - ex: "Zan Bi", "Koffi", "Tra Lou", "Djénéba"
 * @returns {string|null}
 */
export function getAvatarPortrait(nomAvatar) {
  if (!nomAvatar) return null;
  // Normalise : minuscules, supprime les accents (NFD + [̀-ͯ]), espaces → _
  const key = nomAvatar
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return PORTRAITS[key] ?? null;
}
