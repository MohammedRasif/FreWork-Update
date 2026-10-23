import React from "react";
import { useGetOneTourPlanQuery } from "@/redux/features/withAuth";
import {
  X,
  Calendar,
  Clock,
  Users,
  Utensils,
  Mail,
  Phone,
  User,
  FileText,
  ExternalLink,
  Compass,
  Star,
} from "lucide-react";
import { FaLocationArrow, FaLocationDot, FaEuroSign } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { MdVerified, MdVerifiedUser } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n.js";
import { localizedContent } from "@/lib/localizedContent";
import PlanImage1 from "@/assets/img/plan-image-1.png";

export default function TourPlanDetails({ id, closeModal, initialData, offer: propOffer }) {
  const { t } = useTranslation();
  const lookupId = id || initialData?.slug || initialData?.id;
  const { data: fetchedTourData, isLoading, isError } = useGetOneTourPlanQuery(lookupId, {
    skip: !lookupId,
  });

  const tourData = fetchedTourData
    ? { ...(initialData || {}), ...fetchedTourData }
    : initialData;

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return t("tbd");
    try {
      const locale = i18n.language === "ro" ? "ro-RO" : "ru-RU";
      const start = new Date(startDate).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const end = endDate
        ? new Date(endDate).toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : start;
      return `${start} - ${end}`;
    } catch {
      return `${startDate}${endDate ? ` - ${endDate}` : ""}`;
    }
  };

  const getDurationDays = () => {
    if (tourData?.duration) return tourData.duration;
    if (tourData?.start_date && tourData?.end_date) {
      try {
        const start = new Date(tourData.start_date);
        const end = new Date(tourData.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
      } catch {
        return null;
      }
    }
    return null;
  };

  if (isLoading && !tourData) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center p-8 text-sm font-medium text-[#617082]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c88f2a] border-t-transparent" />
        <span className="mt-3">{t("loading")}...</span>
      </div>
    );
  }

  if ((isError && !tourData) || !tourData) {
    return (
      <div className="p-8 text-center">
        <p className="text-base font-semibold text-red-500">
          {t("error_loading") || t("error_loading_tour_details")}
        </p>
        <button
          type="button"
          onClick={closeModal}
          className="mt-4 rounded-xl bg-[#172b43] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#10243a]"
        >
          {t("close")}
        </button>
      </div>
    );
  }

  const offer =
    propOffer ||
    (tourData.offers && tourData.offers.length > 0 ? tourData.offers[0] : null);

  const userRole = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const isAgencyAccepted = Boolean(
    propOffer ||
      tourData.offers?.some(
        (item) =>
          item.status === "accepted" &&
          (String(item.agency?.user) === String(userId) ||
            String(item.agency?.id) === String(userId))
      )
  );

  const canViewContacts =
    userRole !== "agency" ||
    isAgencyAccepted ||
    Boolean(tourData.name || tourData.phone_number || tourData.email);

  const durationDays = getDurationDays();
  const createdDate = tourData.created_at
    ? new Date(tourData.created_at).toLocaleDateString(
        i18n.language === "ro" ? "ro-RO" : "ru-RU",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null;

  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Cover Image Header */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#f4eee4]">
        <img
          src={tourData.spot_picture_url || PlanImage1}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = PlanImage1;
          }}
          alt={`${tourData.location_to} ${t("destination")}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

        {/* Floating Close Button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label={t("close")}
          className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/75 hover:scale-105"
        >
          <X size={18} />
        </button>

        {/* Badges on Cover */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
          {tourData.category && (
            <span className="rounded-full bg-[#c88f2a] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              {tourData.category}
            </span>
          )}
          {tourData.destination_type && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#172b43] backdrop-blur-sm shadow-sm">
              {localizedContent(tourData.destination_type, t)}
            </span>
          )}
          {(tourData.approval_status === "Verificato" ||
            tourData.approval_status === "verified") && (
            <span className="flex items-center gap-1 rounded-full bg-[#e9f3ed] px-3 py-1 text-xs font-bold text-[#397055] shadow-sm">
              <MdVerifiedUser className="h-3.5 w-3.5" />
              {t("contact_verified") || t("verified")}
            </span>
          )}
        </div>

        {/* Header Overlay Title */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl drop-shadow-sm">
            {t("tour_to")} {tourData.location_to}
          </h2>
          <p className="mt-1 text-xs text-white/85 sm:text-sm">
            {t("posted_by")}{" "}
            <span className="font-semibold text-white">
              {canViewContacts ? tourData.name || t("user") : t("chat_private_traveller")}
            </span>
            {createdDate && ` · ${createdDate}`}
          </p>
        </div>
      </div>

      {/* Modal Body */}
      <div className="space-y-6 p-4 sm:p-6 lg:p-7">
        {/* Verified Customer Contacts (for Agency) */}
        {canViewContacts && (tourData.name || tourData.phone_number || tourData.email) && (
          <div className="overflow-hidden rounded-[20px] border border-[#e9e6e0] bg-[#faf8f5] p-4 sm:p-5">
            <div className="flex items-center gap-2 border-b border-[#ece7de] pb-3 text-sm font-bold text-[#172b43]">
              <MdVerifiedUser className="h-5 w-5 text-[#397055]" />
              <span>{t("contact_information")}</span>
              <span className="ml-auto rounded-full bg-[#e9f3ed] px-2.5 py-0.5 text-xs font-bold text-[#397055]">
                {t("verified")}
              </span>
            </div>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
              {tourData.name && (
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-[#edebe6]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff4dd] text-[#c88f2a]">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#7a8a9e]">{t("client") || t("user")}</p>
                    <p className="truncate text-sm font-bold text-[#172b43]">{tourData.name}</p>
                  </div>
                </div>
              )}
              {tourData.phone_number && (
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-[#edebe6]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e9f3ed] text-[#397055]">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#7a8a9e]">{t("phone")}</p>
                    <a
                      href={`tel:${tourData.phone_number}`}
                      className="block truncate text-sm font-bold text-[#172b43] hover:text-[#c88f2a] hover:underline"
                    >
                      {tourData.phone_number}
                    </a>
                  </div>
                </div>
              )}
              {tourData.email && (
                <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-[#edebe6]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef3fb] text-[#2f65a7]">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#7a8a9e]">{t("email") || t("email_address_label")}</p>
                    <a
                      href={`mailto:${tourData.email}`}
                      className="block truncate text-sm font-bold text-[#172b43] hover:text-[#c88f2a] hover:underline"
                    >
                      {tourData.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Accepted Offer Details Section */}
        {offer && (
          <div className="rounded-[20px] border border-[#c88f2a]/35 bg-[#fffdf8] p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#faedd8] pb-3">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="h-5 w-5 text-[#c88f2a]" />
                <h3 className="text-base font-bold text-[#172b43]">
                  {t("accepted_offer")}
                </h3>
              </div>
              {offer.offered_budget !== undefined && offer.offered_budget !== null && (
                <div className="flex items-baseline gap-1 text-[#c88f2a]">
                  <span className="text-xs font-semibold text-[#7a8a9e]">{t("offered_budget") || t("budget")}:</span>
                  <span className="text-lg sm:text-xl font-bold">€{Number(offer.offered_budget).toLocaleString(i18n.language === "ro" ? "ro-RO" : "ru-RU")}</span>
                </div>
              )}
            </div>

            <div className="mt-3.5 space-y-3">
              {offer.agency && (
                <div className="flex items-center gap-3">
                  {offer.agency.logo_url ? (
                    <img
                      src={offer.agency.logo_url}
                      alt={offer.agency.agency_name}
                      className="h-10 w-10 rounded-full border border-[#e9e6e0] object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#172b43] text-sm font-bold text-white">
                      {(offer.agency.agency_name || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-[#172b43]">
                      <span>{offer.agency.agency_name}</span>
                      {offer.agency.is_verified && (
                        <MdVerified className="text-[#3b82f6] text-base shrink-0" />
                      )}
                    </p>
                    {offer.agency.address && (
                      <p className="text-xs text-[#7a8a9e] truncate">{offer.agency.address}</p>
                    )}
                  </div>
                </div>
              )}

              {offer.message && (
                <div className="rounded-xl bg-white p-3.5 border border-[#faedd8] text-sm leading-relaxed text-[#34485c]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#9b6b22]">
                    {t("message") || "Mesaj ofertă"}:
                  </p>
                  <p className="whitespace-pre-line">{offer.message}</p>
                </div>
              )}

              {offer.file && (
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={offer.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#c88f2a] bg-[#fff8eb] px-3.5 py-1.5 text-xs font-bold text-[#9b6b22] transition-colors hover:bg-[#faedd8]"
                  >
                    <FileText size={14} />
                    <span>{t("view_file") || t("file") || "Vezi document atașat"}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Travel Details Grid */}
        <div>
          <h3 className="mb-3 text-base font-bold text-[#172b43]">
            {t("tour_details")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Route */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <FaLocationArrow className="h-3.5 w-3.5 text-[#c88f2a]" />
                <span>{t("route") || t("departure_from")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {tourData.location_from ? `${tourData.location_from} → ` : ""}{tourData.location_to}
              </p>
            </div>

            {/* Dates */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <Calendar size={14} className="text-[#c88f2a]" />
                <span>{t("dates")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {formatDateRange(tourData.start_date, tourData.end_date)}
              </p>
            </div>

            {/* Duration */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <Clock size={14} className="text-[#c88f2a]" />
                <span>{t("duration")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {durationDays ? `${durationDays} ${Number(durationDays) === 1 ? t("day") : t("days")}` : t("na")}
              </p>
            </div>

            {/* Travelers / Members */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <Users size={14} className="text-[#c88f2a]" />
                <span>{t("members")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {tourData.total_members || 1} {Number(tourData.total_members) === 1 ? t("person") : t("persons")}
                {(tourData.adult_count > 0 || tourData.child_count > 0) && (
                  <span className="block text-xs font-normal text-[#7a8a9e] mt-0.5">
                    {tourData.adult_count || 0} {t("adult")}, {tourData.child_count || 0} {t("child")}
                  </span>
                )}
              </p>
            </div>

            {/* Client Budget */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <FaEuroSign className="h-3.5 w-3.5 text-[#c88f2a]" />
                <span>{t("budget")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                €{Number(tourData.budget || 0).toLocaleString(i18n.language === "ro" ? "ro-RO" : "ru-RU")}
              </p>
            </div>

            {/* Accommodation & Rating */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <IoBed className="h-3.5 w-3.5 text-[#c88f2a]" />
                <span>{t("type_of_accommodation")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {localizedContent(tourData.type_of_accommodation, t) || t("na")}
                {tourData.minimum_star_hotel && tourData.minimum_star_hotel !== "N/A" && (
                  <span className="block text-xs text-[#c88f2a] mt-0.5" role="img" aria-label={`${t("hotel_stars")}: ${tourData.minimum_star_hotel}`}>
                    {Array.from({ length: Math.min(5, Math.max(0, Number(tourData.minimum_star_hotel) || 0)) }, (_, index) => (
                      <Star key={index} size={14} fill="currentColor" className="mr-0.5 inline-block" aria-hidden="true" />
                    ))}
                  </span>
                )}
              </p>
            </div>

            {/* Meal Plan */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <Utensils size={14} className="text-[#c88f2a]" />
                <span>{t("meal_plan")}</span>
              </div>
              <p className="text-sm font-bold text-[#172b43]">
                {localizedContent(tourData.meal_plan, t) || t("na")}
              </p>
            </div>

            {/* Travel Type */}
            {tourData.travel_type && (
              <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                  <Compass size={14} className="text-[#c88f2a]" />
                  <span>{t("travel_type") || "Tip călătorie"}</span>
                </div>
                <p className="text-sm font-bold text-[#172b43]">
                  {localizedContent(tourData.travel_type, t)}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#7a8a9e] mb-1">
                <FaCheckCircle className="h-3.5 w-3.5 text-[#397055]" />
                <span>{t("status")}</span>
              </div>
              <p className="text-sm font-bold text-[#397055] capitalize">
                {localizedContent(tourData.status || tourData.approval_status || "accepted", t)}
              </p>
            </div>
          </div>
        </div>

        {/* Tourist Spots / Points of travel */}
        {tourData.tourist_spots &&
          tourData.tourist_spots !== "N/A" &&
          tourData.tourist_spots !== "none" &&
          tourData.tourist_spots.trim() !== "" && (
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4">
              <p className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[#7a8a9e]">
                <FaLocationDot className="text-[#c88f2a]" />
                <span>{t("points_of_travel")}:</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {tourData.tourist_spots.split(",").map((spot, index) => {
                  const cleaned = spot.trim();
                  if (!cleaned) return null;
                  return (
                    <span
                      key={index}
                      className="rounded-lg border border-[#e2d8c3] bg-white px-3 py-1 text-xs font-semibold text-[#172b43] shadow-sm"
                    >
                      {cleaned}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

        {/* Included Requirements / Extras */}
        {tourData.includes &&
          tourData.includes !== "N/A" &&
          tourData.includes.trim() !== "" && (
            <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7a8a9e]">
                {t("includes") || "Servicii incluse / Cerințe specifice"}:
              </p>
              <p className="text-sm leading-relaxed text-[#34485c] whitespace-pre-line">
                {tourData.includes}
              </p>
            </div>
          )}

        {/* Description */}
        {tourData.description && (
          <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#7a8a9e]">
              {t("description")}:
            </p>
            <p className="text-sm leading-relaxed text-[#34485c] whitespace-pre-line">
              {tourData.description}
            </p>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#f0eee9] pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl border border-[#dce2e8] bg-white px-6 py-2.5 text-sm font-bold text-[#172b43] transition-colors hover:bg-[#f4eee4]"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
