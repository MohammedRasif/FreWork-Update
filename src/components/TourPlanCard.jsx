import { ArrowUpRight, CalendarDays, Compass, MapPin, ShieldCheck, Users, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { localizedContent } from "@/lib/localizedContent";
import { getOfferCount, hasAcceptedOffer } from "@/lib/tourPlan";
import { cn } from "@/lib/utils";
import OfferAgencyLogos from "./OfferAgencyLogos";

const formatDate = (value, language) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatBudget = (value, language) => {
  if (value === undefined || value === null || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const TourPlanCard = ({ tour, onDetails, onOffer, showOfferButton = false, offerDisabled, className }) => {
  const { t, i18n } = useTranslation();
  const offerCount = getOfferCount(tour);
  const hasAgencyLogos = Array.isArray(tour.offers) && tour.offers.some((offer) => offer?.agency);
  const spots = Array.isArray(tour.tourist_spots)
    ? tour.tourist_spots.join(", ")
    : tour.tourist_spots;

  return (
    <article className={cn("flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_12px_36px_rgba(23,43,67,0.06)]", className)}>
      <div className="relative h-56 overflow-hidden bg-[#29465e]">
        {tour.spot_picture_url ? (
          <img
            src={tour.spot_picture_url}
            alt={tour.location_to || t("destination")}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#25445e] to-[#7e9aaa] text-white/60">
            <Compass size={64} strokeWidth={1.2} aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10243a]/90 via-[#10243a]/10 to-transparent" />
        {tour.destination_type && (
          <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#21364d] shadow-sm">
            {localizedContent(tour.destination_type, t)}
          </span>
        )}
        <h3 className={cn("absolute left-5 right-5 break-words text-2xl font-bold leading-tight text-white", hasAgencyLogos ? "bottom-20 line-clamp-2" : "bottom-5")}>
          {tour.location_to || t("destination")}
        </h3>
        <OfferAgencyLogos offers={tour.offers} />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6f1] px-3 py-1.5 text-xs font-semibold text-[#397055]">
            <ShieldCheck size={15} aria-hidden="true" /> {t("real_request")}
          </span>
          <span className="text-xs font-semibold text-[#718092]">{offerCount} {t("offers")}</span>
        </div>

        <dl className="mt-5 space-y-3 text-sm text-[#536477]">
          <div className="flex items-start gap-3">
            <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
            <div><dt className="sr-only">{t("date")}</dt><dd>{formatDate(tour.start_date, i18n.language)} – {formatDate(tour.end_date, i18n.language)}</dd></div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet size={17} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
            <div><dt className="sr-only">{t("budget")}</dt><dd className="font-bold text-[#21364d]">{formatBudget(tour.budget, i18n.language)}</dd></div>
          </div>
          <div className="flex items-start gap-3">
            <Users size={17} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
            <div><dt className="sr-only">{t("total")}</dt><dd>{tour.total_members ?? "—"} {Number(tour.total_members) === 1 ? t("person") : t("people")}</dd></div>
          </div>
          {spots && (
            <div className="flex items-start gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
              <div className="min-w-0"><dt className="sr-only">{t("points_of_travel")}</dt><dd className="line-clamp-2">{spots}</dd></div>
            </div>
          )}
        </dl>

        <div className="mt-auto flex gap-3 border-t border-[#edf0f2] pt-5">
          <button
            type="button"
            onClick={() => onDetails(tour)}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-[#d8e0e6] px-3 text-sm font-bold text-[#243b50] transition-colors hover:bg-[#f1f5f7]"
          >
            {t("view_details")} <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          {showOfferButton && (
            <button
              type="button"
              onClick={() => onOffer(tour)}
              disabled={offerDisabled}
              className="min-h-11 flex-1 rounded-xl bg-[#c88f2a] px-3 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] disabled:cursor-not-allowed disabled:bg-[#e6e9eb] disabled:text-[#778390]"
            >
              {offerDisabled ? (hasAcceptedOffer(tour) ? t("accepted_offer") : t("offers_completed")) : t("send_offer")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default TourPlanCard;
