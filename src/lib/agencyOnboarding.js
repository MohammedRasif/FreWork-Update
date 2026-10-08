export function getAgencyAccountPath(profile) {
  if (profile?.agency_is_rejected) return "/in-asteptare";
  if (!profile?.is_profile_complete) return "/agentie/modifica-profil";
  return profile.agency_is_verified ? "/agentie" : "/in-asteptare";
}
