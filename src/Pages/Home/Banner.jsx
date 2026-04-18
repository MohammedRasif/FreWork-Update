import { motion } from "framer-motion";
import img from "../../assets/img/background.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaClock, FaLock } from "react-icons/fa"; // Using react-icons for the UI

const Banner = () => {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const showCreateRequestButton = !accessToken || role === "tourist";
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialStep = (pendingPlan) => {
    const fromLogin = location.state?.fromLogin || false;
    if (fromLogin && accessToken && pendingPlan) {
      return 5;
    }
    if (!pendingPlan) return 1;
    const {
      locationFrom,
      locationTo,
      startingDate,
      endingDate,
      adults,
      children,
      budget,
      touristSpots,
      typeOfAccommodation,
      minimumHotelStars,
      mealPlan,
      travelType,
      destinationType,
      name,
      email,
      phoneNumber,
      confirmation,
    } = pendingPlan;

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
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="relative w-full min-h-screen lg:h-screen overflow-hidden flex items-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0">
        <img src={img} alt="Background" className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-black/30 lg:bg-transparent lg:bg-gradient-to-r lg:from-black/60 lg:to-transparent" />
      </div>

      <div className="relative z-10 w-full container mx-auto px-6 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Content */}
          <div className="text-white space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-sm">
              <FaClock className="text-blue-300" />
              <span>{t("show_short_description")}</span>
            </div>

            {/* Slogan */}
            <h1 className="text-4xl md:text-5xl lg:text-[50px] font-bold leading-tight dm_serif">
              {t("banner_slogan")}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl opacity-90 max-w-lg">
              {t("show_short_descriptionn" , "Compare verified agencies and choose without wasting time.")}
            </p>

            {/* Features Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <FaCheckCircle size={22} className="text-gray-100" />
                <span>{t("feature_drivers", "Professional drivers")}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle size={22} className="text-gray-100" />
                <span>{t("feature_booking", "Flexible booking")}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle size={22} className="text-gray-100" />
                <span>{t("feature_pricing", "Transparent pricing")}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle size={22} className="text-gray-100" />
                <span>{t("feature_vehicles", "Comfortable vehicles")}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form Action */}
          <div className="flex justify-center lg:justify-end lg:mt-32">
            <div className="bg-white/10 backdrop-blur-[5px] border border-white/20 p-5 rounded-[14px] w-full max-w-xl shadow-2xl">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    disabled
                    type="text"
                    placeholder={t("input_placeholder", "Where do you want to go?")}
                    className="w-full py-2.5 px-6 rounded-[10px] bg-white text-gray-800 placeholder-gray-500 focus:outline-none"
                  />
                </div>

                {showCreateRequestButton && (
                  <button
                    onClick={handleButtonClick}
                    className="w-full bg-gradient-to-r from-[#DD9E2C] to-[#C2851C] cursor-pointer transition-colors text-white text-[17px] font-semibold py-2.5 rounded-[10px] shadow-lg"
                  >
                    {t("create_request")}
                  </button>
                )}

                <div className="flex justify-between items-center text-xs text-white/80 px-2">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <span>{t("time_info", "Takes less than 2 minutes")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaLock size={10} />
                    <span>{t("privacy_info", "No calls without your consent")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Popup Logic - Same as before */}
      {isPopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-4 sm:p-6 rounded-2xl max-w-xl w-full mx-4"
          >
            <BannerSectionPopup
              closeForm={closePopup}
              initialStep={getInitialStep(
                JSON.parse(localStorage.getItem("pendingPlan") || "{}")
              )}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Banner;