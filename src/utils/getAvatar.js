// ─── Avatars locaux — portraits des 16 tuteurs ────────────────────────────────
// Utilisé dans TutorsPage pour afficher l'illustration ethnique du tuteur.
// Les portraits sont servis comme fichiers statiques depuis public/portraits/

const PORTRAIT_KEYS = [
  'amara', 'aya', 'bleka', 'djeneba', 'dolourou',
  'kadio', 'koffi', 'nache', 'oulahi', 'ozoua',
  'pololo', 'tehia', 'tialagnon', 'tra_lou', 'yoro', 'zan_bi',
];

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
  if (!PORTRAIT_KEYS.includes(key)) return null;
  return `/portraits/${key}_portrait.png`;
}
