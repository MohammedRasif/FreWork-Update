import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OfferAgencyLogos({ offers }) {
  const { t } = useTranslation();
  const agencies = Array.isArray(offers) ? offers.filter((offer) => offer?.agency) : [];
  if (!agencies.length) return null;

  return (
    <ul aria-label={t("agencies_who_made_offers")} className="absolute bottom-5 left-5 right-5 flex items-center gap-2.5">
      {agencies.slice(0, 3).map((offer, index) => {
        const agency = offer.agency;
        const name = agency.agency_name || t("unknown_agency");
        const accepted = offer.status === "accepted";
        const label = accepted ? `${name} · ${t("accepted_offer")}` : name;
        const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase();

        return (
          <li key={offer.id ?? `${agency.user ?? agency.id ?? name}-${index}`} title={label} aria-label={label} className={`relative h-11 w-11 shrink-0 rounded-full bg-white p-1 shadow-[0_3px_12px_rgba(8,24,42,0.22)] ${accepted ? "ring-2 ring-[#d6a044] ring-offset-2 ring-offset-[#172b43]/40" : "border border-white/80"}`}>
            <span aria-hidden="true" className="flex h-full w-full items-center justify-center rounded-full bg-[#f7f3ec] text-xs font-bold text-[#9b6b22]">{initials}</span>
            {(agency.logo_url || agency.agency_logo_url) && <img
              key={agency.logo_url || agency.agency_logo_url}
              src={agency.logo_url || agency.agency_logo_url}
              alt={t("agency_logo_alt", { name })}
              loading="lazy"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
              className="absolute inset-1 h-[calc(100%-0.5rem)] w-[calc(100%-0.5rem)] rounded-full bg-white object-contain"
            />}
            {accepted && <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#c88f2a] text-white"><Check size={11} strokeWidth={3} aria-hidden="true" /></span>}
          </li>
        );
      })}
      {agencies.length > 3 && <li title={agencies.slice(3).map((offer) => offer.agency.agency_name || t("unknown_agency")).join(", ")} aria-label={t("more_offer_agencies", { count: agencies.length - 3 })} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-[#172b43]/80 text-xs font-bold text-white backdrop-blur-sm">+{agencies.length - 3}</li>}
    </ul>
  );
}
