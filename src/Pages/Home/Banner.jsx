"use client";

import { motion } from "framer-motion";
import img from "../../assets/img/maldives-island.png";

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
        <div className="relative w-full px-2 sm:px-6 md:px-8 lg:px-12">
          <motion.div
            className="backdrop-blur-[1px] sm:backdrop-blur-[1px] bg-white/40 rounded-xl sm:shadow-lg max-w-[300px] sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto sm:mx-8 md:mx-8 lg:ml-16 xl:ml-24 text-center sm:text-left"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="px-4 py-2 sm:px-8 sm:py-10 md:px-10 md:py-12">
              <h1 className="text-[18px] sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                How Does <span className="text-blue-700">VacanzaMyCost.It</span> Work?
              </h1>
              <p className="mt-2 text-xs font-medium sm:text-base md:text-lg lg:text-xl text-gray-800">
                Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it.
              </p>
              <button className="mt-4 sm:mt-8 bg-[#3C76DC] hover:bg-blue-600 text-white font-medium py-2 px-5 sm:py-2.5 sm:px-8 rounded-md transition-colors text-[12px] sm:text-base md:text-lg">
                Create Request
              </button>
            </div>
          </motion.div>
        </div>
      </div> 
      
    </div>
  );
};

export default Banner;