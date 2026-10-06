const pageTitles = {
  "/": "home",
  "/blog": "blog",
  "/agentii-verificate": "certified_agencies_title",
  "/pentru-agentii": "for_agencies",
  "/creeaza-cerere": "create_request",
  "/cereri": "tour_plans",
  "/oferte-acceptate": "accepted_offers",
  "/contact": "contact",
  "/toate-cererile": "tour_plans",
  "/cum-functioneaza": "who_work",
  "/politica-de-confidentialitate": "privacy_policy",
  "/termeni-si-conditii": "terms_and_conditions",
  "/inregistrare": "register",
  "/autentificare": "login",
  "/inregistrare-finalizata": "success",
  "/verificare-cont": "enter_your_email",
  "/verificare-otp": "verify_your_otp",
  "/resetare-parola": "reset_your_password",
  "/succes": "success",
  "/in-asteptare": "pendings.title",
  "/agentie": "my_board",
  "/agentie/dashboard": "my_board",
  "/agentie/profil": "profile",
  "/agentie/modifica-profil": "edit_profile_details",
  "/agentie/abonament": "subscription_management",
  "/agentie/notificari": "notifications",
  "/agentie/mesaje": "conversations",
  "/cont": "my_plans",
  "/cont/dashboard": "my_plans",
  "/cont/cereri-publicate": "published_plans",
  "/cont/cereri-acceptate": "accepted_plans_tab",
  "/cont/favorite": "favorites",
  "/cont/mesaje": "conversations",
  "/cont/profil": "profile",
  "/cont/creeaza-cerere": "create_plan",
  "/cont/modifica-cerere": "edit_tour_plan",
  "/cont/notificari": "notifications",
  "/cont/modifica-profil": "edit_profile_details",
};

export function getPageTitle(pathname, t) {
  const path = pathname.replace(/\/$/, "") || "/";
  const key = pageTitles[path]
    || (path.startsWith("/blog/") ? "blog" : null)
    || (path.startsWith("/cereri/") ? "tour_details" : null)
    || (/^\/(cont|agentie)\/mesaje\//.test(path) ? "conversations" : null)
    || "home";
  return t(key);
}
