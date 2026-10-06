// Translate known API labels for display without changing the values sent back.
const labels = {
  "Apply as a Partner Agency": "pricing_apply_partner",
  "Candidati come Agenzia Partner": "pricing_apply_partner",
  "Agenzia Partner": "pricing_partner_agency",
  "Become a Selected Partner Agency": "pricing_become_partner",
  "Diventa Agenzia Partner Selezionata": "pricing_become_partner",
  "treioferte.md selects a limited number of agencies to ensure quality, results, and respect for your time.": "pricing_selection_description",
  "TreiOferte selects a limited number of agencies to ensure quality, results, and respect for your time.": "pricing_selection_description",
  "treioferte.md seleziona un numero limitato di agenzie per garantire qualità, risultati e rispetto del tuo tempo.": "pricing_selection_description",
  "TreiOferte seleziona un numero limitato di agenzie per garantire qualità, risultati e rispetto del tuo tempo.": "pricing_selection_description",
  "Work only with real, screened, high-value requests.": "pricing_real_requests",
  "Lavora solo con richieste reali, filtrate e ad alto valore.": "pricing_real_requests",
  "Manually verified customer requests": "pricing_verified_requests",
  "Richieste clienti verificate manualmente": "pricing_verified_requests",
  "No commissions on sales": "pricing_no_commissions",
  "Nessuna commissione sulle vendite": "pricing_no_commissions",
  "Limited competition (max 3 agencies)": "pricing_limited_competition",
  "Concorrenza limitata (max 3 agenzie)": "pricing_limited_competition",
  "Direct contact with the customer": "pricing_direct_contact",
  "Contatto diretto con il cliente": "pricing_direct_contact",
  "Quality-focused marketplace, not volume-driven": "pricing_quality_marketplace",
  "Marketplace orientato alla qualità, non al volume": "pricing_quality_marketplace",
  "Review within 48 hours. No initial commitment.": "pricing_review_time",
  "Valutazione entro 48 ore. Nessun impegno iniziale.": "pricing_review_time",
  "Access is by application": "pricing_application_access",
  "L’accesso è su candidatura": "pricing_application_access",
  "Not all agencies are accepted. We verify professionalism, documentation, and work standards.": "pricing_selection_warning",
  "Non tutte le agenzie vengono accettate. Verifichiamo professionalità, documentazione e modalità di lavoro.": "pricing_selection_warning",
  "Founder Partner": "pricing_founder",
  "Partner Fondatore": "pricing_founder",
  "Lifetime locked price for the first 20 approved partners": "pricing_founder_description",
  "Prezzo bloccato per sempre per i primi 20 partner approvati": "pricing_founder_description",
  "Access to all manually verified requests": "pricing_all_verified",
  "Accesso a tutte le richieste verificate manualmente": "pricing_all_verified",
  "Real requests, checked one by one (anti-fake)": "pricing_checked_individually",
  "Richieste reali, filtrate una ad una (anti-fake)": "pricing_checked_individually",
  "Limited competition: max 3 agencies per request": "pricing_three_per_request",
  "Concorrenza limitata: massimo 3 agenzie per richiesta": "pricing_three_per_request",
  "Direct contact with the customer (off-platform)": "pricing_off_platform_contact",
  "Contatto diretto con il cliente (fuori piattaforma)": "pricing_off_platform_contact",
  "Priority support": "pricing_priority_support",
  "Supporto prioritario": "pricing_priority_support",
  "Standard Partner Plan": "pricing_standard",
  "Piano Partner Standard": "pricing_standard",
  "Plan available for agencies joining after the Founder offer closes.": "pricing_standard_description",
  "Piano attivo per le agenzie che accedono dopo la chiusura dell’offerta fondatori": "pricing_standard_description",
  beach: "beach", mountain: "mountain", relax: "relaxation", group: "group",
  family: "family_trip", solo: "solo_travel", couple: "couple", business: "business_travel",
  hotel: "hotel", resort: "resort", homestay: "homestay", apartment: "apartment", hostel: "hostel",
  none: "none", breakfast: "breakfast", "half-board": "half_board", "full-board": "full_board",
  pending: "pending", "In attesa": "pending", Pending: "pending",
  accepted: "accepted_offer", approved: "approved", Approvato: "approved",
  rejected: "rejected", Rifiutato: "rejected", declined: "rejected",
  verified: "verified", Verificato: "verified", confirmed: "confirmed", Confermato: "confirmed",
};

export function localizedContent(value, t) {
  if (typeof value !== "string") return value;
  const key = Object.hasOwn(labels, value) ? labels[value] : null;
  if (key) return t(key);
  // Preserve live prices; only the billing-period label is localized.
  if (/^[€$\d.,\s]+\/(month|mese)$/.test(value)) {
    return value.replace(/\/(month|mese)$/, t("per_month"));
  }
  return value;
}
