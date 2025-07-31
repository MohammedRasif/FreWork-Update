import { NavLink } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useGetTopAgencyQuery } from "@/redux/features/baseApi";
import AgencyCard from "@/components/ui/AgencyCard";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";
import MountainCard from "@/components/ui/MountainCard";

const Agencies = () => {
  const mountainPrevRef = useRef(null);
    const mountainNextRef = useRef(null);
  const { data: topAgency = [], isLoading, isError } = useGetTopAgencyQuery();
  console.log(topAgency, "tttttttt");


  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: topAgency.length > 2,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    centerMode: false, // Disable center mode to prevent centering
    variableWidth: false, // Ensure consistent width for alignment
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: topAgency.length > 2,
          dots: true,
          arrows: true,
          centerMode: false,
          variableWidth: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: topAgency.length > 2,
          dots: true,
          arrows: false,
          centerMode: false,
          variableWidth: false, // Disable variableWidth for consistent alignment
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: topAgency.length > 1,
          dots: true,
          arrows: false,
          centerMode: false,
          variableWidth: false, // Disable variableWidth
        },
      },
    ],
  };

  return (
    <div className="pb-8 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .slick-slide > div {
          display: flex;
          align-items: stretch;
          width: 100%; /* Ensure consistent width for cards */
        }
        .slick-track {
          display: flex !important;
          align-items: stretch !important;
          justify-content: flex-start !important; /* Align items to the start */
          margin-left: 0 !important; /* Remove any default margin */
        }
        .slick-slide {
          height: auto !important;
          margin-right: 16px; /* Add spacing between cards */
        }
        .slick-list {
          overflow: visible !important; /* Ensure no clipping */
        }
      `}</style>
      <div className="text-center py-10 lg:py-12">
        <p className="text-gray-700 text-[16px] md:text-lg lg:mb-4 font-medium">
          Top Agencies are here
        </p>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          Currently Top Agencies
        </h1>
      </div>
      <div className="max-w-7xl mx-auto">


        {/* {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            Error loading agencies. Please try again later.
          </div>
        ) : topAgency.length === 0 ? (
          <div className="text-center text-gray-600 py-6">
            No agencies available at the moment.
          </div>
        ) :
         (
          <Slider {...sliderSettings}>
            {topAgency.map((item) => (
              <div key={item.id} className="px-2">
                <AgencyCard agency={item} />
              </div>
            ))}
          </Slider>
        )
        } */}


         {topAgency.length > 0 && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-black mb-4">
                  Mountain Adventures
                </h2>

                <div className="relative">
                  <button
                    ref={mountainPrevRef}
                    className="absolute top-1/2 -left-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowLeft />
                  </button>

                  <button
                    ref={mountainNextRef}
                    className="absolute top-1/2 -right-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowRight />
                  </button>

                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    navigation={{
                      prevEl: mountainPrevRef.current,
                      nextEl: mountainNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = mountainPrevRef.current;
                      swiper.params.navigation.nextEl = mountainNextRef.current;
                    }}
                    breakpoints={{
                      760: { slidesPerView: 3 },
                      480: { slidesPerView: 2 },
                      320: { slidesPerView: 2 },
                    }}
                    loop={true}
                  >
                    {topAgency.map((p) => (
                      <SwiperSlide key={p.id} className="px-2 mb-12">
                        <AgencyCard agency={p} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
      </div>
      {topAgency.length === 0 ? null : (
        <NavLink to="/membership" className="flex justify-center">
          <h1 className="w-full md:w-auto h-[48px] bg-gray-300 md:bg-transparent rounded-2xl py-2 mt-6 font-medium text-base sm:text-lg lg:text-[19px] text-blue-500 underline text-center cursor-pointer">
            see more...
          </h1>
        </NavLink>
      )}
    </div>
  );
};

export default Agencies;