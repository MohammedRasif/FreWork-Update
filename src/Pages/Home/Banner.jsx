import { motion } from "framer-motion";
import img from "../../assets/img/background.jpg";
import img1 from "../../assets/img/banner.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BannerSectionPopup from "./BannerSectionPupup";

const Banner = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const showCreateRequestButton = !accessToken || role === "tourist";
  const navigate = useNavigate();

  // Function to determine the initial step based on pendingPlan data
  const getInitialStep = (pendingPlan) => {
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

    // Step 1: Check if basic information is complete
    if (
      !locationFrom ||
      !locationTo ||
      !startingDate ||
      !endingDate ||
      (!adults && !children)
    ) {
      return 1;
    }

    // Step 2: Check if details are complete
    if (!budget || !touristSpots || !description) {
      return 2;
    }

    // Step 3: Check if accommodation preferences are complete
    if (!typeOfAccommodation || !minimumHotelStars || !mealPlan) {
      return 3;
    }

    // Step 4: Check if travel preferences are complete
    if (!travelType || !destinationType) {
      return 4;
    }

    // Step 5: Check if personal information and confirmation are complete
    if (!name || !email || !phoneNumber || !confirmation) {
      return 5;
    }

    // If all data is present, default to step 5
    return 5;
  };

  useEffect(() => {
    // Check if there is a pending plan and user is authenticated
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
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={img}
          alt="Background"
          className="object-cover w-full h-full "
        />
        <div className="absolute inset-0 bg-black/10" /> {/* Light overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center lg:mt-12 mt-8">
        {/* Logo */}
        <img
          src={img1}
          alt="Logo"
          className="w-[220px] md:w-[500px] lg:w-[600px] lg:mt-3 mt-1 md:mt-16"
        />
        <h1 className="lg:text-4xl text-[16px] font-semibold text-blue-950 lg:pb-5 pb-2">
          La mia vacanza al mio prezzo
        </h1>
        {/* Main Slogan */}
        <p className="mt-2 text-[24px] md:text-[40px] lg:text-[42px] font-bold md:leading-[48px] lg:leading-[50px] text-white drop-shadow-sm max-w-[90%]">
          Publish your request and receive personalized offers from agencies
        </p>

        {/* CTA Button */}
        {showCreateRequestButton && (
          <button
            onClick={handleButtonClick}
            className="mt-3 md:mt-10 bg-[#FF6600] hover:bg-[#e55600] text-white text-[20px] md:text-[24px] font-medium py-[14px] md:py-[16px] px-[28px] md:px-[36px] rounded-[10px] md:rounded-[12px] max-w-[80%] md:w-[300px] lg:w-[350px] mx-auto"
          >
            Create Request
          </button>
        )}
      </div>

      {/* Popup */}
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
            className="p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
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