import img from "../../assets/img/Group.png";
import img1 from "../../assets/img/hello.png";
import img2 from "../../assets/img/discount 1.png";
import img3 from "../../assets/img/booking.png";

const VacanzaMycost = () => {
  return (
    <div className="bg-white">
      {/* Header Text */}
      <div className="text-center pt-1 md:pt-16">
        <p className="text-gray-700 text-[14px] md:text-lg lg:mb-4 font-medium">
          What we offer to our users...
        </p>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          Let's Use VacanzaMycost.It
        </h1>
      </div>
      <div className="relative">
        {/* Background Image */}
        <img
          src={img}
          alt="Background"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[25vh] sm:h-[60vh] md:h-[80vh] z-0 object-contain hidden md:block"
        />

        {/* Overlay (optional for readability, kept transparent) */}
        <div className="absolute top-0 left-0 w-full h-full z-10"></div>

        {/* Content Container */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[20vh] md:h-[70vh] px-1 py-0">
          {/* Steps Container */}
          <div className="flex flex-row gap-4 items-center justify-center space-x-6 md:space-x-20 lg:space-x-32 w-full overflow-x-auto h-full">
            {/* Step 1 */}
           
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[280px] lg:bg-white">
              <div className="relative">
                <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
                  <img
                    src={img1}
                    alt="Publish Request"
                    className="h-10 md:h-[80px]"
                  />
                </div>
              </div>
              <h3 className="text-base md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                Publish Request
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                Enter Your Travel Request
                <br />
                In Just A Few Clicks
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[280px] lg:bg-white">
              <div className="relative">
                <div className="w-16 h-16 md:w-28 md:h-28 flex items-center justify-center">
                  <img
                    src={img2}
                    alt="Personalized Offers"
                    className="h-8 md:h-[80px]"
                  />
                </div>
              </div>
              <h3 className="text-base md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                Personalized Offers
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                Get convenient proposals
                <br />
                from travel agencies
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center md:rounded-full lg:shadow-xl p-3 md:p-8 w-[80px] md:w-[280px] lg:bg-white">
              <div className="relative">
                <div className="w-14 h-14 md:w-28 md:h-28 flex items-center justify-center">
                  <img
                    src={img3}
                    alt="Free Booking"
                    className="h-10 md:h-[90px]"
                  />
                </div>
              </div>
              <h3 className="text-base md:text-2xl font-semibold text-cyan-600 mb-1 md:mb-4">
                Free Booking
              </h3>
              <p className="text-gray-600 text-[10px] md:text-base leading-relaxed font-medium hidden md:block">
                Easily contact the agency
                <br />
                and book directly
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VacanzaMycost;