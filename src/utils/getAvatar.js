// ─── Avatars locaux — portraits des 18 tuteurs ────────────────────────────────
// Utilisé dans TutorsPage pour afficher l'illustration ethnique du tuteur.
// Les portraits sont servis comme fichiers statiques depuis public/portraits/

const PORTRAIT_KEYS = [
  'amara', 'aya', 'bleka', 'djeneba', 'dolourou',
  'kadio', 'koffi', 'nache', 'oulahi', 'ozoua',
  'pololo', 'tehia', 'tialagnon', 'tra_lou', 'yoro', 'zan_bi',
  'droh', 'zia',
];

// Agents IA — images dans public/agents/ (Kouadio et Zélé)
const AGENT_PORTRAIT_MAP = {
  'kouadio': '/agents/kouadio.png',
  'zele':    '/agents/zele.png',
  'zele_2':  '/agents/zele2.png',
  'kouadio_2': '/agents/kouadio2.png',
};

/**
 * Retourne l'URL du portrait local pour un tuteur.
 * @param {string} nomAvatar - ex: "Zan Bi", "Koffi", "Kouadio", "Zélé"
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
  // Agents IA
  if (AGENT_PORTRAIT_MAP[key]) return AGENT_PORTRAIT_MAP[key];
  // Tuteurs ethniques classiques
  if (!PORTRAIT_KEYS.includes(key)) return null;
  return `/portraits/${key}_portrait.png`;
}
