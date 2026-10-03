import {
  useGetOneDetailQuery,
  useOfferBudgetMutation,
  useAcceptOfferMutation,
  useInviteToChatMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import img from "../../assets/img/badge.png";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  X,
  BedDouble,
  MapPin,
  Send,
  ShieldCheck,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { localizedContent } from "@/lib/localizedContent";

function SinglePost({ prid }) {
  const navigate = useNavigate();
  const { slug: paramSlug } = useParams();
  const finalId = paramSlug || prid?.id;
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [postData, setPostData] = useState({});
  const [offerForm, setOfferForm] = useState({
    budget: "",
    comment: "",
    discount: "",
    applyDiscount: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedOffers, setExpandedOffers] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    refetch,
  } = useGetOneDetailQuery(finalId, {
    skip: !finalId,
  });
  const { data: userData, isLoading: isUserLoading } =
    useShowUserInpormationQuery(undefined, { skip: !localStorage.getItem("access_token") });
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] =
    useAcceptOfferMutation();
  const [invite, { isLoading: isInviteLoading }] = useInviteToChatMutation();
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageLoaded(false);
  }, [finalId]);

  useEffect(() => {
    document.title = `TreiOferte | ${post?.location_to || t("tour_details")}`;
  }, [post?.location_to, i18n.language, t]);

  useEffect(() => {
    const fetchLocalStorage = () => {
      setToken(localStorage.getItem("access_token"));
      setCurrentUserId(localStorage.getItem("user_id"));
      setRole(localStorage.getItem("role") || "tourist");
      setIsLocalStorageLoaded(true);
    };

    fetchLocalStorage();
    window.addEventListener("storage", fetchLocalStorage);
    return () => window.removeEventListener("storage", fetchLocalStorage);
  }, []);

  useEffect(() => {
    if (postError) {
      console.error("Failed to fetch post:", postError);
      toast.error(t("error_loading"));
    }
    if (post && isLocalStorageLoaded) {
      setPostData({
        ...post,
        offers: post.offers || [],
      });
    }
  }, [post, postError, isLocalStorageLoaded]);

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/autentificare");
      toast.error(t("login_to_submit_offer"));
      return;
    }
    if (!offerForm.budget || !offerForm.comment.trim()) {
      toast.error(t("provide_budget_and_comment"));
      return;
    }
    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || Number(offerForm.discount) <= 0)
    ) {
      toast.error(t("provide_valid_discount"));
      return;
    }

    setIsOfferSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(offerForm.budget));
      formData.append("message", offerForm.comment);
      formData.append("apply_discount", offerForm.applyDiscount);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0,
      );
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await offerBudgetToBack({
        id: finalId,
        data: formData,
      }).unwrap();

      const newOffer = {
        id: `${currentUserId}-${Date.now()}`,
        offered_budget: Number.parseFloat(offerForm.budget),
        message: offerForm.comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? Number.parseFloat(offerForm.discount)
          : 0,
        file_name: selectedFile ? selectedFile.name : null,
        agency: {
          agency_name: localStorage.getItem("name") || t("unknown_agency"),
          logo_url:
            localStorage.getItem("user_image") ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
          is_verified: false,
        },
      };

      setPostData((prev) => ({
        ...prev,
        offers: [...(prev.offers || []), newOffer],
        offer_count: (prev.offer_count || 0) + 1,
      }));

      setOfferForm({
        budget: "",
        comment: "",
        discount: "",
        applyDiscount: false,
      });
      setSelectedFile(null);
      setIsPopupOpen(false);

      toast.dismiss();
      toast.success(t("offer_submitted_success"));
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(error.data?.error || t("failed_to_submit_offer"));
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  const acceptOfferHandler = async (offerId) => {
    if (!token) {
      navigate("/autentificare");
      toast.error(t("login_to_accept_offer"));
      return;
    }
    try {
      await acceptOffer(offerId).unwrap();
      navigate(-1);
      toast.success(t("offer_accepted_success"));
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error(error.data?.detail || t("failed_to_accept_offer"));
    }
  };

  const handleMessage = async (otherUserId) => {
    if (!token) {
      navigate("/autentificare");
      toast.error(t("login_to_send_message"));
      return;
    }
    if (!otherUserId) {
      toast.error(t("recipient_id_not_found"));
      return;
    }
    if (String(otherUserId) === String(currentUserId)) {
      toast.error(
        t("cannot_message_yourself"),
      );
      return;
    }
    try {
      await invite({ other_user_id: otherUserId }).unwrap();
      toast.success(t("chat_initiated_success"));
      navigate(role === "tourist" ? "/cont/mesaje" : "/agentie/mesaje");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error(error.data?.detail || t("failed_to_initiate_chat"));
    }
  };

  if (!isLocalStorageLoaded || isUserLoading || isPostLoading || (!postError && !postData.id)) {
    return (
      <main className="min-h-screen bg-[#faf9f6] pt-[72px] xl:pt-[82px]" aria-busy="true">
        <div className="h-72 bg-[#172b43]" />
        <div className="relative mx-auto -mt-12 grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-10">
          <div className="h-[460px] animate-pulse rounded-[24px] bg-[#e8ecee]" />
          <div className="h-72 animate-pulse rounded-[24px] bg-[#e8ecee]" />
          <span className="sr-only">{t("loading")}...</span>
        </div>
      </main>
    );
  }

  if (postError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 pt-[72px] xl:pt-[82px]">
        <div className="w-full max-w-lg rounded-[24px] border border-[#e9e6e0] bg-white px-7 py-12 text-center shadow-[0_10px_35px_rgba(23,43,67,0.06)]">
          <Compass size={42} className="mx-auto text-[#b98427]" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="mt-5 text-2xl font-bold text-[#172b43]">{t("error_loading_tour_details")}</h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={refetch} className="rounded-xl bg-[#c88f2a] px-5 py-3 text-sm font-bold text-white hover:bg-[#ad751c]">{t("try_again")}</button><Link to="/cereri" className="rounded-xl border border-[#d8e0e6] px-5 py-3 text-sm font-bold text-[#243b50] hover:bg-[#f1f5f7]">{t("tour_plans")}</Link></div>
        </div>
      </main>
    );
  }

  const tour = postData;
  const offerCount = Math.max(Number(tour.offer_count) || 0, tour.offers?.length || 0);
  const hasMaxOffers = offerCount >= 3;

  const handleSentOfferClick = () => {
    if (!token) {
      navigate("/autentificare");
      toast.error(t("login_to_submit_offer"));
      return;
    }

    if (userData?.role === "agency" && !userData?.agency_is_verified) {
      navigate("/in-asteptare");
      toast.info(
        t("agency_verification_pending"),
      );
      return;
    }
    if (tour.status === "accepted") {
      toast.info(t("offer_accepted"));
      return;
    }

    if (hasMaxOffers) {
      toast.info(t("offer_limit_reached"));
      return;
    }

    setIsPopupOpen(true);
  };

  const showSentOfferButton = !token || role === "agency";
  const isAccepted = tour.status === "accepted";
  const locale = i18n.language === "ru" ? "ru-RU" : "ro-RO";
  const formatDate = (value) => {
    if (!value) return t("na");
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  };
  const formatBudget = (value) => {
    const amount = Number(value);
    return value === undefined || value === null || value === "" || !Number.isFinite(amount)
      ? t("na")
      : new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
  };
  const accommodation = {
    hotel: "hotel",
    resort: "resort",
    homestay: "homestay",
    apartment: "apartment",
    hostel: "hostel",
  }[tour.type_of_accommodation];
  const meal = {
    breakfast: "breakfast",
    "half-board": "half_board",
    "full-board": "full_board",
  }[tour.meal_plan];
  const spots = Array.isArray(tour.tourist_spots)
    ? tour.tourist_spots.join(", ")
    : tour.tourist_spots?.split(",").map((spot) => spot.trim()).join(", ");
  const stars = Math.min(5, Math.max(0, Number(tour.minimum_star_hotel) || 0));
  const detailItems = [
    { icon: CalendarDays, label: t("date"), value: `${formatDate(tour.start_date)} – ${formatDate(tour.end_date)}` },
    { icon: Clock3, label: t("duration"), value: Number.isFinite(Number(tour.duration)) && tour.duration !== null && tour.duration !== undefined ? new Intl.NumberFormat(locale, { style: "unit", unit: "day", unitDisplay: "long" }).format(Number(tour.duration)) : t("na") },
    { icon: Users, label: t("total"), value: `${tour.total_members ?? t("na")} ${Number(tour.total_members) === 1 ? t("person") : t("people")}` },
    { icon: MapPin, label: t("departure_from"), value: tour.location_from || t("na") },
    { icon: Compass, label: t("points_of_travel"), value: spots || t("none") },
    { icon: UtensilsCrossed, label: t("meal_plan"), value: meal ? t(meal) : t("na") },
    { icon: BedDouble, label: t("type_of_accommodation"), value: accommodation ? t(accommodation) : t("na"), stars },
  ];

  return (
    <main className="tour-detail-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <Toaster />
      <header className="bg-[#172b43] px-5 pb-24 pt-10 text-white sm:px-8 sm:pb-28 sm:pt-14 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link to="/cereri" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/75 transition-colors hover:text-white">
            <ArrowLeft size={18} aria-hidden="true" /> {t("tour_plans")}
          </Link>
          <div className="mt-7 h-1 w-12 rounded-full bg-[#d6a044]" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e2ad53]">{t("tour_details")}</p>
              <h1 className="mt-2 break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{tour.location_to || t("destination")}</h1>
              {tour.location_from && <p className="mt-3 flex items-center gap-2 text-sm text-white/70 sm:text-base"><MapPin size={16} aria-hidden="true" /> {tour.location_from} <ArrowRight size={15} aria-hidden="true" /> {tour.location_to}</p>}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"><ShieldCheck size={17} className="text-[#e2ad53]" aria-hidden="true" />{t("real_request")}</span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto -mt-10 grid max-w-7xl items-start gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:px-10">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-[24px] border border-[#e9e6e0] bg-white shadow-[0_14px_42px_rgba(23,43,67,0.08)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#25445e] to-[#4d7187] sm:aspect-[16/8]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/60"><Compass size={54} strokeWidth={1.2} aria-hidden="true" /><span className="px-6 text-lg font-semibold text-white/80">{tour.location_to || t("destination")}</span></div>
              <img
                src={tour.spot_picture_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"}
                alt={`${tour.location_to || t("destination")} ${t("destination")}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#10243a]/55 via-transparent to-transparent" />
              {tour.destination_type && <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-[#172b43] shadow-sm sm:bottom-6 sm:left-6">{localizedContent(tour.destination_type, t)}</span>}
            </div>
            <p className="px-5 py-3 text-xs text-[#718092] sm:px-7">* {t("image_generated_automatically")}</p>
          </section>

          <section className="rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:p-8">
            <div className="mb-7 h-1 w-10 rounded-full bg-[#d6a044]" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("tour_details")}</h2>
            <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {detailItems.map(({ icon: Icon, label, value, stars: itemStars }) => (
                <div key={label} className="flex min-w-0 items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff4dd] text-[#ad771f]"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#778597]">{label}</p>
                    <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#253a50] sm:text-base">{value}</p>
                    {itemStars > 0 && <p className="mt-1 flex gap-0.5 text-[#c88f2a]" aria-label={`${t("hotel_stars")}: ${itemStars}`}>
                    {Array.from({ length: itemStars }, (_, index) => <Star key={index} size={15} fill="currentColor" aria-hidden="true" />)}
                    </p>}
                  </div>
                </div>
              ))}
            </div>
            {tour.description && <div className="mt-8 border-t border-[#edf0f2] pt-7"><h3 className="text-lg font-bold">{t("description")}</h3><p className="mt-3 whitespace-pre-line break-words leading-7 text-[#536477]">{tour.description}</p></div>}
            <div className="mt-8 flex items-center gap-2 border-t border-[#edf0f2] pt-6 text-sm font-semibold text-[#397055]"><ShieldCheck size={18} aria-hidden="true" />{t("contact_verified")}</div>
          </section>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-28">
          <div className="rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_14px_42px_rgba(23,43,67,0.08)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#8a98a7]">{t("budget")}</p>
            <p className="mt-2 break-words text-3xl font-bold tracking-tight text-[#172b43]">{formatBudget(tour.budget)}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf0f2] pt-5 text-sm">
              <span className="text-[#617082]">{t("offers")}</span>
              <span className="rounded-full bg-[#f4e5c8] px-3 py-1 font-bold text-[#875f1d]">{offerCount} / 3</span>
            </div>
            {isAccepted && <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#edf6f1] px-4 py-3 text-sm font-semibold text-[#397055]"><CheckCircle2 size={18} aria-hidden="true" />{t("accepted_offer")}</div>}
            {showSentOfferButton && !isAccepted && <button type="button" onClick={handleSentOfferClick} disabled={hasMaxOffers} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] disabled:cursor-not-allowed disabled:bg-[#e6e9eb] disabled:text-[#778390]">
              <Send size={17} aria-hidden="true" />{hasMaxOffers ? t("offers_completed") : t("send_offer")}
            </button>}
          </div>

          {tour.offers?.length > 0 && <div className="rounded-[24px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)] sm:p-7">
            <h2 className="text-lg font-bold">{t("offers")}</h2>
            <div className="mt-5 space-y-4">
              {tour.offers.slice(0, 3).map((offer) => <div key={offer.id} className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <img src={offer.agency?.logo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"} alt={`${offer.agency?.agency_name || t("unknown_agency")} logo`} className="h-11 w-11 rounded-full border border-[#e9e6e0] bg-white object-contain" />
                  {offer.status === "accepted" && <img src={img} alt={t("accepted_badge")} className="absolute -bottom-1 -right-1 h-5 w-5 object-contain" />}
                </div>
                <span className="min-w-0 break-words text-sm font-semibold text-[#34485c]">{offer.agency?.agency_name || t("unknown_agency")}</span>
              </div>)}
            </div>
          </div>}
        </aside>
      </div>

      <Dialog open={isPopupOpen} onOpenChange={(open) => {
        setIsPopupOpen(open);
        if (!open) {
          setOfferForm({ budget: "", comment: "", discount: "", applyDiscount: false });
          setSelectedFile(null);
        }
      }}>
        <DialogOverlay className="z-[55] bg-[#10243a]/55 backdrop-blur-[2px]" />
        <DialogContent style={{ zIndex: 60 }} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[22px] border-[#e9e6e0] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><div className="mb-3 h-1 w-9 rounded-full bg-[#d6a044]" /><DialogTitle className="text-xl font-bold text-[#172b43]">{t("place_your_offer")}</DialogTitle></div>
            <button type="button" onClick={() => setIsPopupOpen(false)} aria-label={t("close")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2f4f5] text-[#536477] hover:bg-[#e5e9eb]"><X size={20} aria-hidden="true" /></button>
          </div>
          <DialogDescription className="sr-only">{t("place_your_offer")}</DialogDescription>
          <form onSubmit={handleOfferSubmit} className="space-y-4">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("offer")}</span><input type="number" name="budget" min="1" id="budget" value={offerForm.budget} onChange={handleOfferChange} placeholder={t("enter_budget_placeholder")} required className="h-11 w-full rounded-xl border border-[#dce2e8] px-4 text-[#172b43] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("message")}</span><textarea name="comment" id="comment" value={offerForm.comment} onChange={handleOfferChange} rows="4" placeholder={t("enter_message_placeholder")} required className="w-full resize-none rounded-xl border border-[#dce2e8] px-4 py-3 text-[#172b43] focus:border-[#bd8525] focus:outline-none focus:ring-2 focus:ring-[#e5ad42]/20" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("upload_file_optional")}</span><input type="file" id="file" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" className="w-full rounded-xl border border-[#dce2e8] px-3 py-2 text-sm text-[#536477]" />{selectedFile && <span className="mt-1 block text-xs text-[#617082]">{t("selected")}: {selectedFile.name}</span>}</label>
            <div className="rounded-xl bg-[#faf9f6] p-4"><label className="flex items-start gap-2.5"><input type="checkbox" name="applyDiscount" checked={offerForm.applyDiscount} onChange={handleOfferChange} className="mt-1 accent-[#c88f2a]" /><span className="text-sm font-semibold text-[#34485c]">{t("apply_additional_discount")}</span></label><p className="mt-2 text-xs leading-5 text-[#718092]">{t("discount_suggestion")}</p></div>
            {offerForm.applyDiscount && <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#34485c]">{t("discount_percent")}</span><input type="number" name="discount" id="discount" min="1" max="100" value={offerForm.discount} onChange={handleOfferChange} placeholder={t("discount_placeholder")} className="h-11 w-full rounded-xl border border-[#dce2e8] px-4 text-[#172b43] focus:border-[#bd8525] focus:outline-none" /></label>}
            <button type="submit" disabled={isOfferSubmitting || !offerForm.budget || !offerForm.comment.trim()} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white hover:bg-[#ad751c] disabled:cursor-not-allowed disabled:bg-[#e6e9eb] disabled:text-[#778390]"><Send size={17} aria-hidden="true" />{isOfferSubmitting ? t("submitting") : t("submit_offer")}</button>
          </form>
          {userData?.user_id && tour.offers?.length > 0 && <div className="mt-3 border-t border-[#edf0f2] pt-6">
            <h3 className="mb-4 font-bold text-[#172b43]">{t("offers")}</h3>
            <div className="space-y-3">
              {tour.offers.filter((offer) => offer?.agency?.user && (userData.user_id === offer.agency.user || userData.user_id === tour.user)).slice(0, expandedOffers ? undefined : 3).map((offer) => <div key={offer.id} className="rounded-xl border border-[#e9e6e0] p-4">
                <div className="flex items-start gap-3"><img src={offer.agency?.logo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"} alt={`${offer.agency?.agency_name || t("unknown_agency")} logo`} className="h-10 w-10 shrink-0 rounded-full object-contain" /><div className="min-w-0 flex-1"><p className="font-semibold text-[#172b43]">{offer.agency?.agency_name || t("unknown_agency")}</p><p className="mt-1 break-words text-sm text-[#617082]">{offer.message}</p>{offer.file_name && <p className="mt-1 text-xs text-[#617082]">{t("file")}: {offer.file_name}</p>}{offer.apply_discount && Number(offer.discount) > 0 && <p className="mt-1 text-xs font-semibold text-[#397055]">{t("discount")}: {offer.discount}% {t("off")}</p>}</div></div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] pt-3"><strong className="text-lg text-[#172b43]">{formatBudget(offer.offered_budget)}</strong><div className="flex flex-wrap gap-2"><button type="button" onClick={() => handleMessage(offer.agency?.user)} disabled={isInviteLoading || isOfferBudgetLoading || isAcceptLoading || !offer.agency?.user} className="rounded-lg border border-[#d8e0e6] px-3 py-2 text-sm font-bold text-[#243b50] hover:bg-[#f1f5f7] disabled:opacity-50">{isInviteLoading ? t("sending") + "..." : t("message")}</button>{String(tour.user) === String(currentUserId) && <button type="button" onClick={() => acceptOfferHandler(offer.id)} disabled={isAcceptLoading} className="rounded-lg bg-[#c88f2a] px-3 py-2 text-sm font-bold text-white hover:bg-[#ad751c] disabled:opacity-50">{t("accept")}</button>}</div></div>
              </div>)}
              {tour.offers.length > 3 && <button type="button" onClick={() => setExpandedOffers(!expandedOffers)} className="text-sm font-semibold text-[#9b6b22] hover:underline">{expandedOffers ? t("see_less") : t("see_more")}</button>}
            </div>
          </div>}
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default SinglePost;
