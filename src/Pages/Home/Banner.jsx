import { motion } from "framer-motion";
import img from "../../assets/img/background.jpg";
import img1 from "../../assets/img/banner.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";
import { useTranslation } from "react-i18next";

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
      name,
      email,
      phoneNumber,
      locationFrom,
      locationTo,
      startingDate,
      endingDate,
      adults,
      children,
      budget,
      touristSpots,
      description,
      typeOfAccommodation,
      minimumHotelStars,
      mealPlan,
      travelType,
      destinationType,
      confirmation,
    } = pendingPlan;

    if (
      !locationFrom ||
      !locationTo ||
      !startingDate ||
      !endingDate ||
      (!adults && !children)
    ) {
      return 1;
    }
    if (!budget || !touristSpots) {
      return 2;
    }
    if (!typeOfAccommodation || !minimumHotelStars || !mealPlan) {
      return 3;
    }
    if (!travelType || !destinationType) {
      return 4;
    }
    if (!name || !email || !phoneNumber || !confirmation) {
      return 5;
    }
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
    <div className="relative w-full h-auto pb-3 md:h-[120vh] lg:h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={img}
          alt="Background"
          className="object-cover w-full h-full "
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center lg:mt-12 mt-8">
        <img
          src={img1}
          alt="Logo"
          className="w-[220px] md:w-[500px] lg:w-[600px] lg:mt-3 mt-1 md:mt-16"
        />
        <h1 className="lg:text-4xl text-[16px] font-semibold text-blue-950 lg:pb-5 pb-2">
          {t("banner_tagline")}
        </h1>
        <p className="mt-2 text-[24px] md:text-[40px] lg:text-[42px] font-bold md:leading-[48px] lg:leading-[50px] text-white drop-shadow-sm max-w-[90%]">
          {t("banner_slogan")}
        </p>
        <p className="py-3 lg:text-2xl text-[15px]">{t("show_short_description")}</p>
        {showCreateRequestButton && (
          <button
            onClick={handleButtonClick}
            className="mt-3 md:mt-5 bg-[#FF6600] hover:bg-[#e55600] text-white text-[20px] md:text-[24px] font-medium py-[14px] md:py-[16px] px-[28px] md:px-[36px] rounded-[10px] md:rounded-[12px] max-w-[80%] md:w-[300px] lg:w-[350px] mx-auto"
          >
            {t("create_request")}
          </button>
        )}
      </div>
      
      {isPopupOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.7 }}
            className="p-6 rounded-lg shadow-lg max-w-xl w-full mx-4"
          >
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