import { motion } from "framer-motion";
import img from "../../assets/img/background.png";
import img2 from "../../assets/img/mobileDeviceBackground.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaLock } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";

let isGoogleScriptLoaded = false;  

const Banner = () => {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [bannerLocation, setBannerLocation] = useState(""); // ← New

  const locationInputRef = useRef(null); // ← New

  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const showCreateRequestButton = !accessToken || role === "tourist";

  const navigate = useNavigate();
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
        const pending = JSON.parse(localStorage.getItem("pendingPlan") || "{}");
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
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (pendingPlan && accessToken) {
      setIsPopupOpen(true);
    }
  }, [accessToken]);

const handleButtonClick = () => {
  if (bannerLocation.trim() !== "") {
    const pending = JSON.parse(localStorage.getItem("pendingPlan") || "{}");
    pending.locationTo = bannerLocation;
    pending.locationFrom = bannerLocation;
    localStorage.setItem("pendingPlan", JSON.stringify(pending));
  }

  setBannerLocation("");

  setIsPopupOpen(true);
};

  const closePopup = () => setIsPopupOpen(false);

  return (
    <div className="relative w-full min-h-screen flex items-center overflow-hidden">
      {/* Background Handler */}
      <div className="absolute inset-0">
       <div className="relative w-full h-full">
  <picture>
    <source media="(max-width: 700px)" srcSet={img2} />
    <img
      src={img}
      alt="Background"
      className="object-cover w-full h-full object-center"
    />
  </picture>

  {/* Bottom white fade overlay */}
<div className="" /></div>
      </div>

      <div className="relative z-10 w-full container mx-auto px-6 pt-7 pb-10 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Side - unchanged */}
          <div className="text-white space-y-6 lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-[13px] md:text-sm">
              <LuClock3 className="text-white/90" />
              <span>{t("response_time")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-[28px] md:text-5xl lg:text-[56px] font-bold leading-[1.1] dm_serif">
              {t("banner_slogan")}
            </h1>

            {/* Sub-description */}
            <p className="text-[17px] md:text-xl font-medium opacity-95 max-w-md">
              {t("show_short_descriptionn")}
            </p>

            {/* Features Checklist */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4">
            {[
              { key: "feature_drivers", label: "Professional drivers" },
              { key: "feature_booking", label: "Flexible booking" },
              { key: "feature_pricing", label: "Transparent pricing" },
              { key: "feature_vehicles", label: "Comfortable vehicles" }
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                
                <div className="w-[18px] h-[18px] flex-shrink-0 mt-[7px]">
                  <FaCheckCircle className="w-full h-full text-white" />
                </div>

                <span className="text-[15px] md:text-[18px] font-medium leading-relaxed">
                  {t(item.key, item.label)}
                </span>

              </div>
            ))}
          </div>
          </div>
          {/* Right Side: Floating Form Card */}
          {showCreateRequestButton && (
            <div className="flex justify-center lg:justify-end lg:mt-40">
              <div className="bg-black/10 backdrop-blur-[10px] border border-white/20 p-6 rounded-[14px] w-full max-w-[460px] shadow-2xl">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      ref={locationInputRef}
                      type="text"
                      placeholder={t("input_placeholder", "Where do you want to go?")}
                      className="w-full py-2.5 px-6 rounded-[7px] bg-white/95 text-gray-800 placeholder-gray-500 focus:outline-none text-[15px]"
                      value={bannerLocation}
                      onChange={(e) => setBannerLocation(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleButtonClick}
                    className="w-full bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] transition-all cursor-pointer text-white lg:text-[18px] text-[16px] font-bold py-2.5 rounded-[7px] shadow-lg active:scale-[0.98]"
                  >
                    {t("create_request")}
                  </button>

                  {/* rest unchanged */}
                  <div className="flex justify-between items-center text-[10px] md:text-[12px] text-white/90 px-1 font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                      <span>{t("time_info", "Takes less than 2 minutes")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaLock size={10} />
                      <span>{t("privacy_info", "No calls without your consent")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popup Modal - unchanged */}
      {isPopupOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl">
            <BannerSectionPopup 
              closeForm={closePopup} 
              initialStep={getInitialStep(JSON.parse(localStorage.getItem("pendingPlan") || "{}"))} 
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Banner;