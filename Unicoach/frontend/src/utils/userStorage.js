/**
 * localStorage keys that belong to the signed-in student (or the verified lead on this browser).
 * They must not survive a logout, otherwise the next person on the same device sees (and syncs)
 * the previous user's shortlists, mentor handle, checklist and AI history.
 * Device preferences (e.g. 'typing_game_muted') are intentionally not listed.
 */
export const USER_STORAGE_KEYS = [
  'user_info',
  'user_token',
  'lead_info',
  'unicoach_mentor_handle',
  'unicoach_saved_unis',
  'unicoach_saved_scholarships',
  'unicoach_saved_sops',
  'unicoach_visa_history',
  'unicoach_roadmap_tasks',
  'unicoach_daily_tasks',
  'local_writing_history',
];

// Per-account keys stored as `<prefix><userId>`
const USER_STORAGE_PREFIXES = ['unicoach_shortlist_profile:'];

export const clearUserStorage = () => {
  USER_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode / blocked) — nothing to clear
    }
  });
  try {
    Object.keys(localStorage)
      .filter((key) => USER_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage unavailable — nothing to clear
  }
};
