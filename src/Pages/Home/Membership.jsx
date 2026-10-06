import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowUpRight, Award, BadgeCheck, Building2, Compass, Heart, RotateCcw, Search, Star, X } from "lucide-react";
import { useGetAllAgencyQuery, useGetTopAgencyQuery, useSearchAgencyQuery } from "@/redux/features/baseApi";
import { useAddToFavoritMutation } from "@/redux/features/withAuth";

const asList = (value) => Array.isArray(value) ? value : Array.isArray(value?.results) ? value.results : [];

function categoryLabel(category, t) {
  const labels = { beach: "beach", mountain: "mountain", desert: "agency_desert", island: "agency_island" };
  return labels[category] ? t(labels[category]) : category;
}

function AgencyLogo({ agency, size = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  return agency.logo_url && !failed
    ? <img src={agency.logo_url} alt="" loading="lazy" onError={() => setFailed(true)} className={size + " shrink-0 rounded-full border border-[#e5e9e8] bg-white object-cover"} />
    : <span className={size + " flex shrink-0 items-center justify-center rounded-full bg-[#e9eff3] text-lg font-bold text-[#34546d]"} aria-hidden="true">{(agency.agency_name || "A").charAt(0)}</span>;
}

function AgencyCover({ agency }) {
  const [failed, setFailed] = useState(false);
  return agency.cover_photo_url && !failed
    ? <img src={agency.cover_photo_url} alt={agency.agency_name || ""} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#25445e] via-[#40627a] to-[#8ca5ae] text-white/45"><Building2 size={68} strokeWidth={1.1} aria-hidden="true" /></div>;
}

function ReviewSummary({ agency, onOpen, t }) {
  const count = Number(agency.review_count) || 0;
  const rating = Number(agency.average_rating);
  if (count === 0) return <span className="text-sm text-[#718092]">{t("no_reviews_yet")}</span>;
  return <button type="button" onClick={() => onOpen(agency)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#536477] hover:text-[#a36f1d]">
    <Star size={15} className="fill-[#d49a36] text-[#d49a36]" aria-hidden="true" />
    {Number.isFinite(rating) ? rating.toFixed(1) : "—"} <span className="font-normal text-[#718092]">({count} {count === 1 ? t("review") : t("reviews")})</span>
  </button>;
}

function AgencyCard({ agency, isFavorite, onFavorite, onOpen, favoriteLoading, t }) {
  const categories = Array.isArray(agency.service_categories) ? agency.service_categories : [];
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_12px_36px_rgba(23,43,67,0.06)]">
      <div className="relative h-52 overflow-hidden bg-[#29465e]">
        <AgencyCover agency={agency} />
        {agency.is_verified && <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-[#edf6f1] px-3 py-1.5 text-xs font-bold text-[#397055] shadow-sm"><BadgeCheck size={15} aria-hidden="true" /> {t("verified")}</span>}
        <button type="button" onClick={() => onFavorite(agency.user)} disabled={favoriteLoading || !agency.user} aria-label={isFavorite ? t("remove_from_favorites") : t("add_to_favorites")} aria-pressed={isFavorite} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#526274] shadow-sm transition-colors hover:text-[#b54450] disabled:opacity-50">
          <Heart size={19} className={isFavorite ? "fill-[#cf5360] text-[#cf5360]" : ""} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <AgencyLogo agency={agency} />
          <div className="min-w-0">
            <h3 className="break-words text-xl font-bold leading-tight text-[#172b43]">{agency.agency_name || t("unknown_agency")}</h3>
            <div className="mt-1.5"><ReviewSummary agency={agency} onOpen={onOpen} t={t} /></div>
          </div>
        </div>
        {categories.length > 0 && <div className="mt-5 flex flex-wrap gap-2" aria-label={t("our_service_category")}>{categories.map((category) => <span key={category} className="rounded-full bg-[#f1f4f5] px-3 py-1.5 text-xs font-semibold text-[#526274]">{categoryLabel(category, t)}</span>)}</div>}
        <p className="mt-5 line-clamp-3 min-h-18 break-words text-sm leading-6 text-[#617082]">{agency.about || t("no_description")}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-5">
          {Number(agency.badge_count) > 0
            ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#a36f1d]" aria-label={String(agency.badge_count) + " " + t("agency_badges")}><Award size={18} aria-hidden="true" /> {agency.badge_count}</span>
            : <span />}
          <button type="button" onClick={() => onOpen(agency)} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d8e0e6] px-4 text-sm font-bold text-[#243b50] transition-colors hover:bg-[#f1f5f7]">{t("agency_profile")} <ArrowUpRight size={17} aria-hidden="true" /></button>
        </div>
      </div>
    </article>
  );
}

function AgencyDialog({ agency, onClose }) {
  const { t, i18n } = useTranslation();
  const dialogRef = useRef(null);
  const categories = Array.isArray(agency.service_categories) ? agency.service_categories : [];
  const reviews = Array.isArray(agency.received_reviews) ? agency.received_reviews : [];
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }} aria-labelledby={"agency-dialog-title-" + agency.id} className="m-auto max-h-[90vh] w-[calc(100%-32px)] max-w-3xl overflow-y-auto rounded-[24px] border border-[#e9e6e0] bg-white p-0 text-[#172b43] shadow-[0_30px_90px_rgba(16,36,58,0.25)] backdrop:bg-[#10243a]/70">
      <div className="relative h-48 overflow-hidden bg-[#29465e] sm:h-56"><AgencyCover agency={agency} /><button type="button" onClick={() => dialogRef.current?.close()} aria-label={t("close")} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#243b50] shadow-sm"><X size={20} aria-hidden="true" /></button></div>
      <div className="p-6 sm:p-8">
        <div className="flex min-w-0 items-start gap-4"><AgencyLogo agency={agency} size="h-14 w-14" /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a36f1d]">{t("agency_profile")}</p><h2 id={"agency-dialog-title-" + agency.id} className="mt-1 break-words text-2xl font-bold leading-tight sm:text-3xl">{agency.agency_name || t("unknown_agency")}</h2></div></div>
        <div className="mt-5 flex flex-wrap items-center gap-4">{agency.is_verified && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6f1] px-3 py-1.5 text-xs font-bold text-[#397055]"><BadgeCheck size={15} aria-hidden="true" /> {t("verified")}</span>}<ReviewSummary agency={agency} onOpen={() => document.getElementById("agency-reviews")?.scrollIntoView({ behavior: "smooth", block: "nearest" })} t={t} />{Number(agency.badge_count) > 0 && <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#a36f1d]"><Award size={17} aria-hidden="true" /> {agency.badge_count} {t("agency_badges")}</span>}</div>
        <div className="mt-7 border-t border-[#edf0f2] pt-6"><h3 className="text-lg font-bold">{t("about")}</h3><p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#586879] sm:text-base">{agency.about || t("no_description")}</p></div>
        {categories.length > 0 && <div className="mt-7"><h3 className="text-lg font-bold">{t("our_service_category")}</h3><div className="mt-3 flex flex-wrap gap-2">{categories.map((category) => <span key={category} className="rounded-full bg-[#f1f4f5] px-3 py-1.5 text-sm font-semibold text-[#526274]">{categoryLabel(category, t)}</span>)}</div></div>}
        <div id="agency-reviews" className="mt-7 border-t border-[#edf0f2] pt-6"><h3 className="text-lg font-bold">{t("reviews")} ({Number(agency.review_count) || 0})</h3>{reviews.length === 0 ? <p className="mt-3 text-sm text-[#718092]">{t("no_reviews_yet")}</p> : <div className="mt-4 space-y-3">{reviews.map((review, index) => <div key={review.id || index} className="rounded-xl bg-[#f8fafb] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-[#243b50]">{review.tourist_first_name || t("anonymous")}</p><span className="inline-flex items-center gap-1 text-sm font-semibold text-[#a36f1d]"><Star size={15} className="fill-[#d49a36] text-[#d49a36]" aria-hidden="true" /> {Number(review.rating || 0).toFixed(1)}</span></div><p className="mt-2 text-sm leading-6 text-[#586879]">{review.comment?.trim() || t("no_comment_provided")}</p>{review.created_at && <p className="mt-2 text-xs text-[#8793a0]">{new Date(review.created_at).toLocaleDateString(i18n.language === "ru" ? "ru-RU" : "ro-RO")}</p>}</div>)}</div>}</div>
      </div>
    </dialog>
  );
}

function Membership() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const currentUserId = Number(localStorage.getItem("user_id")) || null;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const { data: allData, isLoading, isError, refetch } = useGetAllAgencyQuery();
  const { data: topData } = useGetTopAgencyQuery();
  const { currentData: searchedData } = useSearchAgencyQuery(debouncedSearch, { skip: !debouncedSearch });
  const [toggleFavorite, { isLoading: favoriteLoading }] = useAddToFavoritMutation();
  const allAgencies = asList(allData);
  const topAgencies = asList(topData);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { document.title = "TreiOferte | " + t("certified_agencies_title"); }, [i18n.language, t]);
  useEffect(() => { const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350); return () => window.clearTimeout(timer); }, [search]);
  useEffect(() => {
    if (!currentUserId) return;
    setFavoriteIds(allAgencies.filter((agency) => Array.isArray(agency.favorite_users) && agency.favorite_users.includes(currentUserId)).map((agency) => agency.user));
  }, [allData, currentUserId]);

  const categories = useMemo(() => [...new Set(allAgencies.flatMap((agency) => Array.isArray(agency.service_categories) ? agency.service_categories : []))], [allData]);
  const agencies = useMemo(() => {
    const source = debouncedSearch && debouncedSearch === search.trim() && searchedData ? asList(searchedData) : allAgencies;
    const query = search.trim().toLocaleLowerCase();
    return source.filter((agency) => (!query || String(agency.agency_name || "").toLocaleLowerCase().includes(query)) && (!category || agency.service_categories?.includes(category)));
  }, [allData, searchedData, debouncedSearch, search, category]);
  const hasFilters = Boolean(search || category);
  const clearFilters = () => { setSearch(""); setDebouncedSearch(""); setCategory(""); };

  const handleFavorite = async (agencyUserId) => {
    if (!token || !currentUserId) { navigate("/autentificare", { state: { from: "/agentii-verificate" } }); return; }
    if (!agencyUserId) return;
    const wasFavorite = favoriteIds.includes(agencyUserId);
    setFavoriteIds((ids) => wasFavorite ? ids.filter((id) => id !== agencyUserId) : [...ids, agencyUserId]);
    try { await toggleFavorite(agencyUserId).unwrap(); }
    catch (error) {
      setFavoriteIds((ids) => wasFavorite ? [...ids, agencyUserId] : ids.filter((id) => id !== agencyUserId));
      toast.error(error?.data?.detail || t("failed_to_update_favorite"));
    }
  };

  return (
    <main className="certified-agencies-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <section className="bg-[#172b43] px-5 pb-24 pt-14 text-white sm:px-8 sm:pb-28 sm:pt-20 lg:px-10">
        <div className="mx-auto max-w-7xl"><div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" /><h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("certified_agencies_title")}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{t("certified_agencies_intro")}</p></div>
      </section>
      <div className="relative mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-[22px] border border-[#e9e6e0] bg-white p-4 shadow-[0_16px_48px_rgba(23,43,67,0.1)] sm:p-5 md:grid-cols-[minmax(0,1fr)_250px]">
          <label className="relative block min-w-0"><span className="sr-only">{t("search_by_agency_name")}</span><Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8997a5]" aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search_by_agency_name")} className="h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] pl-12 pr-4 text-[#24364b] placeholder:text-[#8997a5] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20" /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t("our_service_category")} className="h-12 w-full min-w-0 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-[#24364b] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"><option value="">{t("agency_all_categories")}</option>{categories.map((item) => <option key={item} value={item}>{categoryLabel(item, t)}</option>)}</select>
        </div>
        <section className="pt-10" aria-live="polite">
          <div className="mb-6 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("agencies")}</h2>{!isLoading && !isError && <span className="rounded-full bg-[#f4e5c8] px-3 py-1 text-sm font-bold text-[#875f1d]">{agencies.length}</span>}{hasFilters && <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-2 text-sm font-bold text-[#a36f1d] hover:text-[#7e5416]"><RotateCcw size={16} aria-hidden="true" /> {t("reset")}</button>}</div>
          {isLoading ? <div className="grid gap-5 md:grid-cols-2">{[0, 1, 2, 3].map((index) => <div key={index} className="h-[455px] animate-pulse rounded-[22px] bg-[#e8ecee]" />)}</div>
            : isError ? <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center"><Compass size={48} className="text-[#b98427]" strokeWidth={1.5} aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{t("something_went_wrong")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{t("agency_load_error")}</p><button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white hover:bg-[#ad751c]"><RotateCcw size={17} aria-hidden="true" /> {t("try_again")}</button></div>
              : agencies.length === 0 ? <div className="flex min-h-[390px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center shadow-[0_10px_35px_rgba(23,43,67,0.04)]"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><Building2 size={32} strokeWidth={1.5} aria-hidden="true" /></div><h3 className="mt-6 text-2xl font-bold">{hasFilters ? t("agency_no_matches") : t("agency_no_results")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{hasFilters ? t("agency_no_matches_description") : t("agency_empty_description")}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c88f2a] px-6 font-bold text-white hover:bg-[#ad751c]"><RotateCcw size={17} aria-hidden="true" /> {t("reset")}</button>}</div>
                : <div className="grid gap-5 md:grid-cols-2">{agencies.map((agency) => <AgencyCard key={agency.id} agency={agency} isFavorite={favoriteIds.includes(agency.user)} onFavorite={handleFavorite} onOpen={setSelectedAgency} favoriteLoading={favoriteLoading} t={t} />)}</div>}
        </section>
        {topAgencies.length > 0 && <section className="pt-20"><div className="mb-7 h-1 w-12 rounded-full bg-[#d6a044]" /><h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">{t("top_agencies")}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topAgencies.map((agency) => <button key={agency.id} type="button" onClick={() => setSelectedAgency(agency)} className="flex min-w-0 items-center gap-4 rounded-[20px] border border-[#e9e6e0] bg-white p-5 text-left shadow-[0_10px_35px_rgba(23,43,67,0.04)] hover:border-[#d5ad63]"><AgencyLogo agency={agency} /><span className="min-w-0"><span className="block break-words font-bold text-[#172b43]">{agency.agency_name}</span><span className="mt-1 block text-sm text-[#718092]">{Number(agency.review_count) || 0} {t("reviews")}</span></span><ArrowUpRight size={17} className="ml-auto shrink-0 text-[#b98427]" aria-hidden="true" /></button>)}</div></section>}
      </div>
      {selectedAgency && <AgencyDialog agency={selectedAgency} onClose={() => setSelectedAgency(null)} />}
      <ToastContainer position="top-right" autoClose={5000} />
    </main>
  );
}

export default Membership;
