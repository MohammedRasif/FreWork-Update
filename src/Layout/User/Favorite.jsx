import { useAllFavoritAgencyQuery } from "@/redux/features/withAuth";
import { BadgeCheck, Heart, Search, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import PlanImage1 from "@/assets/img/plan-image-1.png";

const Favorite = () => {
  const { t } = useTranslation();
  const { data: favoriteAgency, isLoading } = useAllFavoritAgencyQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredAgencies = (favoriteAgency || []).filter((agency) =>
    (agency.agency_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#617082]">{t("favorite_agency")}</p>
        <label className="relative block w-full sm:w-64">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b99a7]" aria-hidden="true" />
          <span className="sr-only">{t("search_by_agency_name")}</span>
          <input type="search" placeholder={t("search_by_agency_name")} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-white pl-10 pr-4 text-sm text-[#172b43] outline-none focus:border-[#c88f2a] focus:ring-2 focus:ring-[#c88f2a]/15" />
        </label>
      </div>
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm text-[#617082]" role="status">{t("loading")}</div>
      ) : filteredAgencies.length ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredAgencies.map((agency) => (
            <article key={agency.id} className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]">
              <div className="relative h-36 bg-[#f4eee4]">
                <img src={agency.cover_photo_url || PlanImage1} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }} alt={t("agency_cover_alt", { name: agency.agency_name })} className="h-full w-full object-cover" />
                <div className="absolute -bottom-7 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#172b43] text-lg font-bold text-white shadow-sm">
                  {agency.logo_url ? <img src={agency.logo_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={t("agency_logo_alt", { name: agency.agency_name })} className="h-full w-full object-cover" /> : (agency.agency_name || "A").charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-10">
                <div className="flex items-start gap-2"><h4 className="min-w-0 break-words text-lg font-bold text-[#172b43]">{agency.agency_name}</h4>{agency.is_verified && <BadgeCheck size={20} aria-label={t("verified")} className="mt-0.5 shrink-0 text-[#c88f2a]" />}</div>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-[#617082]">{agency.about || t("no_description")}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eee9] pt-4 text-xs font-semibold text-[#617082]">
                  <span className="inline-flex items-center gap-1.5"><Star size={15} fill="#c88f2a" className="text-[#c88f2a]" aria-hidden="true" />{Number(agency.average_rating || 0).toFixed(1)} ({agency.review_count || 0} {t("reviews")})</span>
                  <span className="inline-flex items-center gap-1.5"><Heart size={15} className="text-[#c88f2a]" aria-hidden="true" />{agency.favorite_users?.length || 0} {t("favorites")}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><Heart size={25} aria-hidden="true" /></span>
          <p className="text-base font-semibold text-[#172b43]">{t("no_agencies_found")}</p>
        </div>
      )}
    </div>
  );
};

export default Favorite;
