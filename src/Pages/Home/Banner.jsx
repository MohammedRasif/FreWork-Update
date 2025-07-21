"use client";

import { motion } from "framer-motion";
import img from "../../assets/img/maldives-island.png";
import img1 from "../../assets/img/banner.png";

const Banner = () => {
  return (
    <div className="relative w-full h-[30vh] sm:h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden">
      {/* Background Image - Full width */}
      <div className="absolute inset-0">
        <img
          src={img}
          alt="Maldives Island"
          className="object-cover w-full h-full backdrop-blur-sm sm:backdrop-blur-none"
          sizes="100vw"
        />
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center sm:justify-center">
  <div className="relative w-full px-2 sm:px-6 md:px-8 lg:px-12 ">
    <motion.div
      className="backdrop-blur-[1px] sm:backdrop-blur-[1px] bg-white/40 rounded-xl sm:shadow-lg max-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto sm:mx-8 md:mx-8 lg:ml-16 xl:ml-24 text-center sm:text-left"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="px-4 py-2 sm:px-8 sm:py-10 md:px-10 md:py-12 ">
        <div className=" flex items-center justify-center lg:mb-10">
          <img src={img1} className="lg:h-28 h-[50px] flex ite" alt="" />
        </div>
        <p className="mt-2 text-xs font-medium sm:text-base md:text-lg lg:text-xl text-gray-800 text-center">
          Post your request and receive personalized offers from agencies
        </p>
        <div className="flex items-center justify-center">
          <button className=" mt-4 sm:mt-8 bg-[#3C76DC] hover:bg-blue-600 text-white font-medium py-3 sm:py-3 px-8 sm:px-12 rounded-md transition-colors text-[12px] sm:text-base md:text-lg">
            Create Request
          </button>
        </div>
      </div>
    </motion.div>
  </div>
</div>
      
    </div>
  );
};

export default Banner;