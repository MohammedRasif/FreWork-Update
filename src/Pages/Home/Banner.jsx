import { motion } from "framer-motion";
import img from "../../assets/img/background.jpg";
import img1 from "../../assets/img/banner.png";
import { useState } from "react";
import BannerSectionPopup from "./bannerSectionPupup";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const showCreateRequestButton = !accessToken || role === "tourist";
  const navigator = useNavigate();
  if (accessToken == null) {
    navigator("/login");
  }

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
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center  lg:mt-12 mt-8">
        {/* Logo */}
        <img
          src={img1}
          alt="Logo"
          className="w-[220px] md:w-[500px] lg:w-[600px] lg:mt-3 mt-1 md:mt-16"
        />
        <h1 className="lg:text-4xl text-[16px] font-semibold text-blue-950 lg:pb-5 pb-2">La mia vacanza al mio prezzo</h1>
        {/* Main Slogan */}
        <p className="mt-2 text-[24px] md:text-[40px] lg:text-[42px] font-bold  md:leading-[48px] lg:leading-[50px] text-white drop-shadow-sm max-w-[90%]">
          Publish your request and receive personalized offers from agencies
        </p>

        {/* Secondary Slogan */}
       

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
            <BannerSectionPopup closeForm={closePopup} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Banner;
