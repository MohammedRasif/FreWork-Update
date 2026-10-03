import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CalendarDays, Check, Compass, MapPin, RotateCcw, Search, Users } from "lucide-react";
import { useAcceptedAllOffersQuery } from "@/redux/features/baseApi";
import { localizedContent } from "@/lib/localizedContent";

const locale = (language) => language === "ru" ? "ru-RU" : "ro-RO";

function formatDate(value, language) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale(language), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatBudget(value, language) {
  if (value === undefined || value === null || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat(locale(language), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function DestinationImage({ tour, title }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-56 overflow-hidden bg-[#29465e]">
      {tour.spot_picture_url && !failed
        ? <img src={tour.spot_picture_url} alt={title} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#25445e] via-[#40627a] to-[#8ca5ae] text-white/45"><Compass size={70} strokeWidth={1.1} aria-hidden="true" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-[#10243a]/90 via-[#10243a]/10 to-transparent" />
      <h3 className="absolute bottom-5 left-5 right-5 break-words text-2xl font-bold leading-tight text-white">{title}</h3>
    </div>
  );
}

function AcceptedOfferCard({ tour }) {
  const { t, i18n } = useTranslation();
  const title = tour.location_to || t("destination");
  const agency = (Array.isArray(tour.offers) ? tour.offers.find((offer) => offer.status === "accepted") : null)?.agency;
  const spots = Array.isArray(tour.tourist_spots) ? tour.tourist_spots.filter(Boolean).join(", ") : tour.tourist_spots;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_12px_36px_rgba(23,43,67,0.06)]">
      <div className="relative">
        <DestinationImage tour={tour} title={title} />
        <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#edf6f1] px-3 py-1.5 text-xs font-bold text-[#397055] shadow-sm">
          <Check size={14} strokeWidth={3} aria-hidden="true" /> {t("accepted_offer")}
        </span>
        {tour.destination_type && <span className="absolute right-5 top-16 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#21364d] shadow-sm sm:top-5">{localizedContent(tour.destination_type, t)}</span>}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#718092]">{t("budget")}</p>
          <p className="text-xl font-bold leading-none text-[#172b43]">{formatBudget(tour.budget, i18n.language)}</p>
        </div>
        <dl className="space-y-3 text-sm leading-6 text-[#536477]">
          <div className="flex items-start gap-3"><CalendarDays size={17} className="mt-1 shrink-0 text-[#b98427]" aria-hidden="true" /><div><dt className="sr-only">{t("date")}</dt><dd>{formatDate(tour.start_date, i18n.language)} – {formatDate(tour.end_date, i18n.language)}</dd></div></div>
          <div className="flex items-start gap-3"><Users size={17} className="mt-1 shrink-0 text-[#b98427]" aria-hidden="true" /><div><dt className="sr-only">{t("total")}</dt><dd>{tour.total_members ?? "—"} {tour.total_members != null && (Number(tour.total_members) === 1 ? t("person") : t("people"))}</dd></div></div>
          {spots && <div className="flex items-start gap-3"><MapPin size={17} className="mt-1 shrink-0 text-[#b98427]" aria-hidden="true" /><div className="min-w-0"><dt className="sr-only">{t("points_of_travel")}</dt><dd className="line-clamp-2 break-words">{spots}</dd></div></div>}
        </dl>
        {agency?.agency_name && <div className="mt-5 flex min-w-0 items-center gap-3 rounded-xl bg-[#f7f8f7] px-3 py-3">
          {agency.logo_url
            ? <img src={agency.logo_url} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full border border-[#e5e9e8] bg-white object-cover" />
            : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8eee9] text-[#397055]"><Check size={20} aria-hidden="true" /></div>}
          <div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#748174]">{t("accepted_agency")}</p><p className="break-words text-sm font-bold text-[#24364b]">{agency.agency_name}</p></div>
        </div>}
        <div className="mt-auto pt-5"><Link to={`/cereri/${tour.slug || tour.id}`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d8e0e6] px-4 text-sm font-bold text-[#243b50] transition-colors hover:bg-[#f1f5f7]">{t("view_details")} <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </div>
    </article>
  );
}

function AcceptedOffers() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useAcceptedAllOffersQuery();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const tours = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { document.title = "TreiOferte | " + t("accepted_offers"); }, [i18n.language, t]);

  const filteredTours = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return tours.filter((tour) => (!query || String(tour.location_to || "").toLocaleLowerCase().includes(query)) && (!category || tour.destination_type === category));
  }, [tours, search, category]);
  const hasFilters = Boolean(search || category);
  const clearFilters = () => { setSearch(""); setCategory(""); };

  return (
    <main className="accepted-offers-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <section className="bg-[#172b43] px-5 pb-24 pt-14 text-white sm:px-8 sm:pb-28 sm:pt-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" /><h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("all_accepted_offers")}</h1><p className="mt-4 text-base leading-7 text-white/75 sm:text-lg">{t("accepted_offers_intro")}</p></div>
          <Link to="/cereri" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47] lg:self-auto">{t("tour_plans")} <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
      <div className="relative mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-[22px] border border-[#e9e6e0] bg-white p-4 shadow-[0_16px_48px_rgba(23,43,67,0.1)] sm:p-5 md:grid-cols-[minmax(0,1fr)_250px]">
          <label className="relative block min-w-0"><span className="sr-only">{t("search_by_destination")}</span><Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8997a5]" aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search_by_destination")} className="h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] pl-12 pr-4 text-[#24364b] placeholder:text-[#8997a5] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20" /></label>
          <select aria-label={t("select_category")} value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-[#24364b] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"><option value="">{t("select_category")}</option><option value="beach">{t("beach_trips")}</option><option value="mountain">{t("mountain_adventures")}</option><option value="relax">{t("relaxing_tours")}</option><option value="group">{t("group_packages")}</option></select>
        </div>
        <section className="pt-10" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("accepted_offers")}</h2>{!isLoading && !isError && <span className="rounded-full bg-[#f4e5c8] px-3 py-1 text-sm font-bold text-[#875f1d]">{filteredTours.length}</span>}{hasFilters && <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-[#a36f1d] hover:text-[#7e5416]"><RotateCcw size={16} aria-hidden="true" /> {t("reset")}</button>}</div>
          {isLoading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((number) => <div key={number} className="h-[450px] animate-pulse rounded-[22px] bg-[#e8ecee]" />)}</div>
            : isError ? <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center"><Compass size={48} className="text-[#b98427]" strokeWidth={1.5} aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{t("something_went_wrong")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{t("failed_to_load_offers")}</p><button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white hover:bg-[#ad751c]"><RotateCcw size={17} aria-hidden="true" /> {t("try_again")}</button></div>
            : filteredTours.length === 0 ? <div className="flex min-h-[390px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center shadow-[0_10px_35px_rgba(23,43,67,0.04)]"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><Compass size={32} strokeWidth={1.5} aria-hidden="true" /></div><h3 className="mt-6 text-2xl font-bold">{hasFilters ? t("no_tours_found") : t("no_accepted_offers_yet")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{hasFilters ? t("tour_no_matches_message") : t("accepted_offers_empty_description")}</p>{hasFilters ? <button type="button" onClick={clearFilters} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c88f2a] px-6 font-bold text-white hover:bg-[#ad751c]"><RotateCcw size={17} aria-hidden="true" /> {t("reset")}</button> : <Link to="/cereri" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c88f2a] px-6 font-bold text-white hover:bg-[#ad751c]">{t("tour_plans")} <ArrowUpRight size={17} aria-hidden="true" /></Link>}</div>
            : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredTours.map((tour) => <AcceptedOfferCard key={tour.id} tour={tour} />)}</div>}
        </section>
      </div>
    </main>
  );
}

export default AcceptedOffers;
