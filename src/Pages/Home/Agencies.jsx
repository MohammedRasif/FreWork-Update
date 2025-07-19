import { NavLink } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useGetTopAgencyQuery } from "@/redux/features/baseApi";
import AgencyCard from "@/components/ui/AgencyCard";

const Agencies = () => {
  const { data: topAgency = [], isLoading, isError } = useGetTopAgencyQuery();

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: topAgency.length > 2,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: topAgency.length > 2,
          dots: true,
          arrows: true,
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
          variableWidth: true,
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
          variableWidth: true,
        },
      },
    ],
  };

  return (
    <div className="pb-8 px-4 sm:px-6 lg:px-8 ">
      <style jsx>{`
        .slick-slide > div {
          display: flex;
          align-items: stretch;
        }
        .slick-track {
          display: flex !important;
          align-items: stretch !important;
        }
        .slick-slide {
          height: auto !important;
        }
      `}</style>
      <div className="text-center  py-10 lg:py-12">
        <p className="text-gray-700 text-[16px] md:text-lg lg:mb-4 font-medium">
          Top Agencies are here
        </p>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          Currently Top Agencies
        </h1>
      </div>
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
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
        ) : (
          <Slider {...sliderSettings}>
            {topAgency.map((item) => (
              <AgencyCard key={item.id} agency={item} />
            ))}
          </Slider>
        )}
      </div>
      {
        topAgency.length === 0 ? (
         null
        ) : <NavLink to="/membership" className={"flex justify-center"}>
          <h1 className="w-full md:w-auto h-[48px] bg-gray-300 md:bg-transparent rounded-2xl py-2 mt-6 font-medium text-base sm:text-lg lg:text-[19px] text-blue-500 underline text-center cursor-pointer">
    see more...
  </h1>
        </NavLink>
      }

    </div>
  );
};

export default Agencies;
