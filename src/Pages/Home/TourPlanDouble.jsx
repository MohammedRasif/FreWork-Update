import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Compass,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  useAcceptOfferMutation,
  useGetTourPlanPublicQuery,
  useInviteToChatMutation,
  useOfferBudgetMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import TourPlanCard from "@/components/TourPlanCard";
import { getOfferCount, hasAcceptedOffer } from "@/lib/tourPlan";
import TourPlanPopup from "./TourPlanpopup";

const emptyFilters = {
  search: "",
  destination_type: "",
  min: "",
  max: "",
  country: "",
};

const initialFilters = () => ({
  ...emptyFilters,
  destination_type: localStorage.getItem("selectedCategory") || "",
});

const TourPlanDouble = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const role = token ? localStorage.getItem("role") : null;
  const currentUserId = localStorage.getItem("user_id");
  const [filters, setFilters] = useState(initialFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tours, setTours] = useState([]);

  const { data, isLoading: isTourLoading, isError, refetch } = useGetTourPlanPublicQuery();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] = useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] = useAcceptOfferMutation();
  const [invite] = useInviteToChatMutation();
  const { data: userData } = useShowUserInpormationQuery(undefined, { skip: !token });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = "TreiOferte | " + t("tour_plans");
  }, [i18n.language, t]);

  useEffect(() => {
    setTours(Array.isArray(data) ? data : []);
  }, [data]);

  const uniqueDestinations = useMemo(
    () => Array.from(new Set(tours.map((tour) => tour.location_to?.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, i18n.language)),
    [tours, i18n.language],
  );

  const filteredTours = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase();
    const minimum = filters.min === "" ? null : Number(filters.min);
    const maximum = filters.max === "" ? null : Number(filters.max);
    return tours.filter((tour) => {
      const destination = String(tour.location_to || "").toLocaleLowerCase();
      const budget = Number(tour.budget);
      if (search && !destination.includes(search)) return false;
      if (filters.destination_type && tour.destination_type?.toLowerCase() !== filters.destination_type) return false;
      if (filters.country && destination !== filters.country.toLocaleLowerCase()) return false;
      if ((minimum !== null || maximum !== null) && !Number.isFinite(budget)) return false;
      if (minimum !== null && Number.isFinite(minimum) && budget < minimum) return false;
      if (maximum !== null && Number.isFinite(maximum) && budget > maximum) return false;
      return true;
    }).sort((a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0));
  }, [tours, filters]);

  const tourPlanPublicUser = useMemo(
    () => currentUserId ? Object.fromEntries(tours.map((tour) => [tour.id, tour.user])) : {},
    [tours, currentUserId],
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const changeFilter = (name, value) => {
    if (name === "destination_type") localStorage.removeItem("selectedCategory");
    setFilters((current) => ({ ...current, [name]: value }));
  };
  const resetFilters = () => {
    localStorage.removeItem("selectedCategory");
    setFilters({ ...emptyFilters });
  };

  const handleOfferClick = (tour) => {
    if (!token) {
      toast.error(t("login_to_submit_offer"));
      navigate("/autentificare");
      return;
    }
    if (role !== "agency") {
      toast.error(t("only_agencies_can_submit"));
      return;
    }
    if (localStorage.getItem("agency_is_verified") !== "true") {
      toast(t("agency_verification_pending"));
      navigate("/in-asteptare");
      return;
    }
    if (hasAcceptedOffer(tour) || getOfferCount(tour) >= 3) {
      toast(hasAcceptedOffer(tour) ? t("accepted_offer") : t("offer_limit_reached"));
      return;
    }
    setSelectedTour(tour);
  };

  const handleSubmitOffer = async (tourId, budget, comment, offerForm, file) => {
    if (!token || role !== "agency") {
      toast.error(t("only_agencies_can_submit"));
      throw new Error("Only agencies can submit offers");
    }
    if (!budget || Number.isNaN(Number(budget)) || Number(budget) <= 0) {
      toast.error(t("valid_budget_required"));
      throw new Error("Invalid budget");
    }
    if (!comment.trim()) {
      toast.error(t("comment_required"));
      throw new Error("Comment required");
    }
    if (offerForm.applyDiscount && (!offerForm.discount || Number(offerForm.discount) <= 0)) {
      toast.error(t("valid_discount_required"));
      throw new Error("Invalid discount");
    }

    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(budget));
      formData.append("message", comment.trim());
      formData.append("apply_discount", offerForm.applyDiscount || false);
      formData.append("discount", offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0);
      if (file) formData.append("file", file);

      const response = await offerBudgetToBack({ id: tourId, data: formData }).unwrap();
      const newOffer = {
        id: response?.id || currentUserId + "-" + Date.now(),
        offered_budget: Number.parseFloat(budget),
        message: comment.trim(),
        apply_discount: offerForm.applyDiscount || false,
        discount: offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0,
        file_name: file?.name || null,
        status: "pending",
        agency: {
          agency_name: localStorage.getItem("name") || t("unknown_agency"),
          logo_url: localStorage.getItem("user_image") || null,
          is_verified: false,
        },
      };
      const addOffer = (tour) => tour.id === tourId
        ? { ...tour, offers: [...(tour.offers || []), newOffer], offer_count: (tour.offer_count || 0) + 1 }
        : tour;
      setTours((current) => current.map(addOffer));
      setSelectedTour((current) => current ? addOffer(current) : null);
      toast.success(t("offer_submitted_success"));
      return response;
    } catch (error) {
      toast.error(error?.data?.error || error?.data?.detail || t("failed_to_submit_offer"));
      throw error;
    }
  };

  const acceptOfferHandler = async (offerId, tourId) => {
    if (!token) {
      toast.error(t("login_to_accept_offer"));
      navigate("/autentificare");
      return;
    }
    try {
      await acceptOffer(offerId).unwrap();
      const accept = (tour) => tour.id === tourId
        ? { ...tour, offers: (tour.offers || []).map((offer) => offer.id === offerId ? { ...offer, status: "accepted" } : offer) }
        : tour;
      setTours((current) => current.map(accept));
      setSelectedTour((current) => current ? accept(current) : null);
      toast.success(t("offer_accepted_success"));
    } catch (error) {
      toast.error(error?.data?.detail || t("failed_to_accept_offer"));
    }
  };

  const handleMessage = async (payload) => {
    if (!token) {
      toast.error(t("login_to_send_message"));
      navigate("/autentificare");
      return;
    }
    try {
      await invite(payload).unwrap();
      toast.success(t("chat_initiated_success"));
      navigate(role === "tourist" ? "/cont/mesaje" : "/agentie/mesaje");
    } catch (error) {
      toast.error(error?.data?.detail || t("failed_to_initiate_chat"));
    }
  };

  return (
    <main className="tour-plans-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <Toaster />
      <section className="bg-[#172b43] px-5 pb-24 pt-14 text-white sm:px-8 sm:pb-28 sm:pt-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("published_tour_plans")}</h1>
            <p className="mt-4 text-base leading-7 text-white/75 sm:text-lg">{t("all_posted_tour_plans_here")}</p>
          </div>
          <NavLink to="/" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47] lg:self-auto">
            {t("create_request")} <ArrowUpRight size={18} aria-hidden="true" />
          </NavLink>
        </div>
      </section>

      <div className="relative mx-auto -mt-10 max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="grid gap-4 rounded-[22px] border border-[#e9e6e0] bg-white p-4 shadow-[0_16px_48px_rgba(23,43,67,0.1)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_250px_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">{t("search_by_destination")}</span>
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8997a5]" aria-hidden="true" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => changeFilter("search", event.target.value)}
              placeholder={t("search_by_destination")}
              className="h-12 w-full rounded-xl border border-[#dce2e8] bg-[#fafbfc] pl-12 pr-4 text-[#24364b] placeholder:text-[#8997a5] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"
            />
          </label>
          <select
            aria-label={t("select_category")}
            value={filters.destination_type}
            onChange={(event) => changeFilter("destination_type", event.target.value)}
            className="h-12 w-full min-w-0 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-[#24364b] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20"
          >
            <option value="">{t("select_category")}</option>
            <option value="beach">{t("beach_trips")}</option>
            <option value="mountain">{t("mountain_adventures")}</option>
            <option value="relax">{t("relaxing_tours")}</option>
            <option value="group">{t("group_packages")}</option>
          </select>
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen((open) => !open)}
            aria-expanded={isMobileFilterOpen}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#dce2e8] px-5 font-semibold text-[#24364b] lg:hidden"
          >
            <SlidersHorizontal size={18} aria-hidden="true" /> {t("filters")}
          </button>
        </div>

        <div className="grid gap-8 pt-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={(isMobileFilterOpen ? "block " : "hidden ") + "lg:block"}>
            <div className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)] lg:sticky lg:top-28">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#172b43]">{t("filters")}</h2>
                <button type="button" onClick={() => setIsMobileFilterOpen(false)} aria-label={t("close")} className="text-[#647386] lg:hidden"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <fieldset>
                  <legend className="mb-3 text-sm font-bold text-[#24364b]">{t("budget")} (€)</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="sr-only">{t("min")}</span>
                      <input type="number" min="0" inputMode="numeric" placeholder={t("min")} value={filters.min} onChange={(event) => changeFilter("min", event.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-[#dce2e8] px-3 text-sm focus:border-[#bd8525] focus:outline-none" />
                    </label>
                    <label>
                      <span className="sr-only">{t("max")}</span>
                      <input type="number" min="0" inputMode="numeric" placeholder={t("max")} value={filters.max} onChange={(event) => changeFilter("max", event.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-[#dce2e8] px-3 text-sm focus:border-[#bd8525] focus:outline-none" />
                    </label>
                  </div>
                </fieldset>
                <label className="block">
                  <span className="mb-3 block text-sm font-bold text-[#24364b]">{t("destination")}</span>
                  <select value={filters.country} onChange={(event) => changeFilter("country", event.target.value)} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-white px-3 text-sm text-[#24364b] focus:border-[#bd8525] focus:outline-none">
                    <option value="">{t("all_destinations")}</option>
                    {uniqueDestinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}
                  </select>
                </label>
              </div>
              {hasActiveFilters && (
                <button type="button" onClick={resetFilters} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#a36f1d] hover:text-[#7e5416]">
                  <RotateCcw size={16} aria-hidden="true" /> {t("reset")}
                </button>
              )}
            </div>
          </aside>

          <section className="min-w-0" aria-live="polite">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t("tour_plans")}</h2>
              {!isTourLoading && !isError && <span className="rounded-full bg-[#f4e5c8] px-3 py-1 text-sm font-bold text-[#875f1d]">{filteredTours.length}</span>}
            </div>

            {isTourLoading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((number) => <div key={number} className="h-[430px] animate-pulse rounded-[22px] bg-[#e8ecee]" />)}
              </div>
            ) : isError ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center">
                <Compass size={48} className="text-[#b98427]" strokeWidth={1.5} aria-hidden="true" />
                <h3 className="mt-5 max-w-lg text-xl font-bold text-[#172b43]">{t("error_loading")}</h3>
                <button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white hover:bg-[#ad751c]">
                  <RotateCcw size={17} aria-hidden="true" /> {t("try_again")}
                </button>
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="flex min-h-[390px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4dd] text-[#b98427]"><Compass size={32} strokeWidth={1.5} aria-hidden="true" /></div>
                <h3 className="mt-6 text-2xl font-bold text-[#172b43]">{hasActiveFilters ? t("no_tours_found") : t("no_tour_plans_available")}</h3>
                <p className="mt-3 max-w-md text-base leading-7 text-[#617082]">{hasActiveFilters ? t("tour_no_matches_message") : t("tour_empty_message")}</p>
                {hasActiveFilters ? (
                  <button type="button" onClick={resetFilters} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c88f2a] px-6 font-bold text-white hover:bg-[#ad751c]">
                    <RotateCcw size={17} aria-hidden="true" /> {t("reset")}
                  </button>
                ) : (
                  <NavLink to="/" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#c88f2a] px-6 font-bold text-white hover:bg-[#ad751c]">
                    {t("create_request")} <ArrowUpRight size={17} aria-hidden="true" />
                  </NavLink>
                )}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredTours.map((tour) => (
                  <TourPlanCard
                    key={tour.id}
                    tour={tour}
                    onDetails={(item) => navigate("/cereri/" + (item.slug || item.id))}
                    onOffer={handleOfferClick}
                    showOfferButton={!token || role === "agency"}
                    offerDisabled={!!token && (hasAcceptedOffer(tour) || getOfferCount(tour) >= 3)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedTour && (
        <TourPlanPopup
          tour={selectedTour}
          onClose={() => setSelectedTour(null)}
          handleMessage={handleMessage}
          handleAcceptOffer={acceptOfferHandler}
          isAcceptLoading={isAcceptLoading}
          userData={userData}
          tourPlanPublicUser={tourPlanPublicUser}
          handleSubmitOffer={handleSubmitOffer}
          isOfferBudgetLoading={isOfferBudgetLoading}
        />
      )}
    </main>
  );
};

export default TourPlanDouble;
