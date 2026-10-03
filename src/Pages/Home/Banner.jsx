import { motion } from "framer-motion";
import img from "../../assets/img/background.png";
import img2 from "../../assets/img/mobileDeviceBackground.png";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";
import { useTranslation } from "react-i18next";
import { Check, LockKeyhole, Clock3, MapPin } from "lucide-react";

let isGoogleScriptLoaded = false;  

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
    if (!isGoogleScriptLoaded && !window.google) {
      isGoogleScriptLoaded = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBIVSr8DMIg5U5P_oRIDt1j_Q32ceDQddc&libraries=places`;
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
    // your existing function (unchanged)
    const fromLogin = location.state?.fromLogin || false;
    if (fromLogin && accessToken && pendingPlan) return 5;
    if (!pendingPlan) return 1;
    const { locationFrom, locationTo, startingDate, endingDate, adults, children, budget, touristSpots, typeOfAccommodation, minimumHotelStars, mealPlan, travelType, destinationType, name, email, phoneNumber, confirmation } = pendingPlan;
    if (!locationFrom || !locationTo || !startingDate || !endingDate || (!adults && !children)) return 1;
    if (!budget || !touristSpots) return 2;
    if (!typeOfAccommodation || !minimumHotelStars || !mealPlan) return 3;
    if (!travelType || !destinationType) return 4;
    if (!name || !email || !phoneNumber || !confirmation) return 5;
    return 5;
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
        <div className={`relative mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-24 lg:px-10 lg:pt-28 ${showCreateRequestButton ? "pb-36 sm:pb-40" : "pb-24"}`}>
          <div className="max-w-[690px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-white backdrop-blur-sm">
              <Clock3 size={16} aria-hidden="true" />
              <span>{t("response_time")}</span>
            </div>
            <h1 className="mt-7 max-w-[680px] text-[clamp(2.4rem,4.5vw,4.1rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-balance text-white">
              {t("banner_slogan")}
            </h1>
            <p className="mt-6 max-w-[565px] text-base leading-7 text-white/90 sm:text-xl sm:leading-8">
              {t("show_short_descriptionn")}
            </p>
            <div className="mt-9 grid max-w-[620px] gap-x-8 gap-y-4 sm:grid-cols-2">
              {["feature_drivers", "feature_booking", "feature_pricing", "feature_vehicles"].map((key) => (
                <div key={key} className="flex items-start gap-3 text-sm font-medium leading-6 text-white/95 sm:text-base">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e5ad42] text-[#17273a]">
                    <Check size={13} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showCreateRequestButton && (
        <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="rounded-[24px] border border-[#eee7dc] bg-white p-5 shadow-[0_18px_55px_rgba(18,36,58,0.14)] sm:p-7 lg:p-8">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-7">
              <div className="min-w-0">
                <label htmlFor="home-destination" className="mb-3 block text-sm font-bold uppercase tracking-[0.11em] text-[#24364b]">
                  {t("create_request")}
                </label>
                <div className="flex h-[58px] items-center gap-3 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 transition-colors focus-within:border-[#bd8525] focus-within:ring-2 focus-within:ring-[#e5ad42]/20">
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
                className="h-[58px] w-full rounded-xl bg-[#c88f2a] px-8 text-base font-bold text-white shadow-[0_8px_20px_rgba(173,116,20,0.24)] transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9e6c20] lg:w-auto"
              >
                {t("create_request")}
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-xs font-medium leading-5 text-[#657184] sm:flex-row sm:gap-7 sm:text-sm">
              <span className="flex items-start gap-2"><Clock3 size={15} className="mt-0.5 shrink-0 text-[#b98328]" aria-hidden="true" />{t("time_info")}</span>
              <span className="flex items-start gap-2"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#b98328]" aria-hidden="true" />{t("privacy_info")}</span>
            </div>
          </div>
        </div>
      )}

      {isPopupOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl">
            <BannerSectionPopup 
              closeForm={closePopup} 
              initialStep={getInitialStep(readPendingPlan())}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Banner;
