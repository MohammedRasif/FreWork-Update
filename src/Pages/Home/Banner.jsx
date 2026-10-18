import { motion, AnimatePresence } from "framer-motion";
import img from "../../assets/img/background.png";
import img2 from "../../assets/img/mobileDeviceBackground.png";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";
import { Trans, useTranslation } from "react-i18next";
import { BadgeCheck, ClipboardList, Clock3, LockKeyhole, MapPin, MessagesSquare, UserRoundCheck } from "lucide-react";

let isGoogleScriptLoaded = false;  

const heroBenefits = [
  { key: "feature_drivers", icon: BadgeCheck },
  { key: "feature_booking", icon: ClipboardList },
  { key: "feature_pricing", icon: MessagesSquare },
  { key: "feature_vehicles", icon: UserRoundCheck },
];

const HeroBenefits = ({ mobile = false }) => {
  const { t } = useTranslation();
  return (
    <div className={mobile ? "mx-auto mt-7 grid max-w-7xl grid-cols-2 gap-x-4 gap-y-4 px-5 text-[#172b43] sm:hidden" : "mt-9 hidden max-w-[620px] gap-x-8 gap-y-4 sm:grid sm:grid-cols-2"}>
      {heroBenefits.map(({ key, icon: Icon }) => (
        <div key={key} className={`flex min-w-0 items-center ${mobile ? "gap-2 text-xs font-medium leading-5" : "gap-3 text-base font-medium leading-6 text-white/95"}`}>
          <span className={`flex shrink-0 items-center justify-center rounded-full border border-[#f1e4c7] bg-[#fffdf7] text-[#172b43] shadow-[0_6px_18px_rgba(8,22,38,0.15)] ${mobile ? "h-10 w-10" : "h-14 w-14"}`}>
            <Icon size={28} strokeWidth={1.8} className={`${mobile ? "h-5 w-5" : "h-7 w-7"} [&_path:last-child]:stroke-[#c88f2a] [&_rect]:stroke-[#c88f2a]`} aria-hidden="true" />
          </span>
          <span className="min-w-0 break-words">{t(key)}</span>
        </div>
      ))}
    </div>
  );
};

const readPendingPlan = () => {
  try {
    const saved = localStorage.getItem("pendingPlan");
    if (!saved) return null;
    const plan = JSON.parse(saved);
    return plan && typeof plan === "object" && !Array.isArray(plan) ? plan : null;
  } catch {
    return null;
  }
};

const Banner = () => {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bannerLocation, setBannerLocation] = useState(""); // ← New

  const locationInputRef = useRef(null); // ← New

  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const showCreateRequestButton = !accessToken || role === "tourist";

  const location = useLocation();

  // Load Google Maps Script
  useEffect(() => {
    // Modified by takmim: Suppress blocking error dialog and support configurable API key
    if (typeof window !== "undefined" && !window.gm_authFailure) {
      window.gm_authFailure = () => {
        console.warn(
          "Google Maps Places API authentication error: Check API key, billing, or referrers in Google Cloud Console."
        );
      };
    }

    const googleMapsApiKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      "AIzaSyBIVSr8DMIg5U5P_oRIDt1j_Q32ceDQddc";

    if (!isGoogleScriptLoaded && !window.google) {
      isGoogleScriptLoaded = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Google Autocomplete for Banner Input
  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google?.maps?.places || !locationInputRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        { types: ["(cities)"] }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const selected = place.formatted_address || place.name;

        setBannerLocation(selected);

        // Save to localStorage immediately
        const pending = readPendingPlan() || {};
        pending.locationTo = selected;
        pending.locationFrom = selected;
        localStorage.setItem("pendingPlan", JSON.stringify(pending));
      });
    };

    if (window.google) {
      setTimeout(initAutocomplete, 200);
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          setTimeout(initAutocomplete, 200);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const getInitialStep = (pendingPlan) => {
    const fromLogin = location.state?.fromLogin || false;
    if (fromLogin && accessToken && pendingPlan) return 5;
    if (!pendingPlan) return 1;
    const { locationFrom, locationTo, startingDate, endingDate, adults, children, budget, name, email, phoneNumber, confirmation } = pendingPlan;
    if (!locationFrom || !locationTo || !startingDate || !endingDate || (!adults && !children)) return 1;
    if (!budget) return 1;
    return name && email && phoneNumber && confirmation ? 5 : 6;
  };

  useEffect(() => {
    const pendingPlan = readPendingPlan();
    if (pendingPlan && accessToken) {
      setIsPopupOpen(true);
    }
  }, [accessToken]);

const handleButtonClick = () => {
  if (bannerLocation.trim() !== "") {
    const pending = readPendingPlan() || {};
    pending.locationTo = bannerLocation;
    pending.locationFrom = bannerLocation;
    localStorage.setItem("pendingPlan", JSON.stringify(pending));
  }

  setBannerLocation("");

  setIsPopupOpen(true);
};

  const closePopup = () => setIsPopupOpen(false);

  return (
    <div className="bg-[#faf9f6]">
      <section className="relative isolate overflow-hidden bg-[#12243a] text-white">
        <picture className="absolute inset-0 -z-20">
          <source media="(max-width: 700px)" srcSet={img2} />
          <img src={img} alt="" className="h-full w-full object-cover object-center" />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#101f32]/95 via-[#14263c]/80 to-[#14263c]/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101f32]/75 via-transparent to-transparent" />
        <div className={`relative mx-auto max-w-7xl px-5 pt-7 sm:px-8 sm:pt-24 lg:px-10 lg:pt-28 ${showCreateRequestButton ? "pb-16 sm:pb-40" : "pb-8 sm:pb-24"}`}>
          <div className="max-w-[690px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm">
              <Clock3 size={16} aria-hidden="true" />
              <span>{t("response_time")}</span>
            </div>
            <h1 className="mt-5 max-w-[680px] text-[clamp(1.75rem,7.8vw,2.15rem)] font-extrabold leading-[1.12] tracking-[-0.035em] text-balance text-white sm:mt-7 sm:text-[clamp(2.4rem,4.5vw,4.1rem)] sm:leading-[1.1]">
              <Trans
                i18nKey="banner_slogan"
                components={{
                  question: <span className="block" />,
                  highlight: <span className="block text-[#e5ad42]" />,
                }}
              />
            </h1>
            <p className="mt-4 max-w-[565px] text-[15px] leading-[22px] text-white/90 sm:mt-6 sm:text-xl sm:leading-8">
              {t("show_short_descriptionn")}
            </p>
            <HeroBenefits />
          </div>
        </div>
      </section>

      {showCreateRequestButton && (
        <div className="relative z-10 mx-auto -mt-12 max-w-7xl px-5 sm:-mt-20 sm:px-8 lg:px-10">
          <div className="rounded-[24px] border border-[#eee7dc] bg-white p-4 shadow-[0_18px_55px_rgba(18,36,58,0.14)] sm:p-7 lg:p-8">
            <div className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-7">
              <div className="min-w-0">
                <label htmlFor="home-destination" className="mb-2 block text-xs font-bold uppercase tracking-[0.11em] text-[#24364b] sm:mb-3 sm:text-sm">
                  {t("create_request")}
                </label>
                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 transition-colors focus-within:border-[#bd8525] focus-within:ring-2 focus-within:ring-[#e5ad42]/20 sm:h-[58px]">
                  <MapPin size={20} className="shrink-0 text-[#c18a2c]" aria-hidden="true" />
                  <input
                    id="home-destination"
                    ref={locationInputRef}
                    type="text"
                    placeholder={t("input_placeholder", t("where_to"))}
                    className="h-full w-full min-w-0 bg-transparent text-base text-[#24364b] placeholder:text-[#647386] focus:outline-none"
                    value={bannerLocation}
                    onChange={(e) => setBannerLocation(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleButtonClick}
                className="h-12 w-full rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(173,116,20,0.24)] transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e6c20] sm:h-[58px] sm:px-8 sm:text-base lg:w-auto"
              >
                {t("create_request")}
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-1.5 text-xs font-medium leading-5 text-[#657184] sm:mt-4 sm:flex-row sm:gap-7 sm:text-sm">
              <span className="flex items-start gap-2"><Clock3 size={15} className="mt-0.5 shrink-0 text-[#b98328]" aria-hidden="true" />{t("time_info")}</span>
              <span className="flex items-start gap-2"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#b98328]" aria-hidden="true" />{t("privacy_info")}</span>
            </div>
          </div>
        </div>
      )}

      <HeroBenefits mobile />

      {/* Modified by takmim: Smooth modal open without white flash/flicker */}
      <AnimatePresence>
        {isPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#0f1f33]/70 backdrop-blur-sm"
              onClick={closePopup}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative z-10 w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <BannerSectionPopup 
                closeForm={closePopup} 
                initialStep={getInitialStep(readPendingPlan())}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Banner;
