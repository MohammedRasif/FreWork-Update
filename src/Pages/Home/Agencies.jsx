"use client";

import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";

import { useGetTopAgencyQuery } from "@/redux/features/baseApi";
import AgencyCard from "@/components/ui/AgencyCard";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const Agencies = () => {
  const { t } = useTranslation();
  const mountainPrevRef = useRef(null);
  const mountainNextRef = useRef(null);
  const { data: topAgency = [], isLoading, isError } = useGetTopAgencyQuery();

  return (
    <div className="pb-8 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .mySwiper {
          padding: 0 10px;
        }
        .swiper-slide {
          display: flex;
          justify-content: center;
          align-items: stretch;
          width: 100%;
        }
        .swiper-slide > div {
          width: 100%;
          max-width: 100%;
        }
        .swiper-pagination {
          position: relative;
          margin-top: 10px;
        }
        .swiper-button-prev,
        .swiper-button-next {
          color: #3182ce;
          transform: scale(0.8);
        }
        @media (max-width: 480px) {
          .swiper-slide {
            width: 100% !important;
          }
          .swiper-slide > div {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="text-center py-10 lg:py-12">
        {/* <p className="text-gray-700 text-[16px] md:text-lg lg:mb-4 font-medium">
          {t("top_agencies_here")}
        </p> */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          {t("currently_top_agencies")}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            {t("error_loading_agencies")}
          </div>
        ) : topAgency.length === 0 ? (
          <div className="text-center text-gray-600 py-6">
            {t("no_agencies_available")}
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">{t("top_agencies")}</h2>
            <div className="relative">
              <button
                ref={mountainPrevRef}
                className="absolute top-1/2 -left-4 lg:-left-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                style={{ transform: "translateY(-50%)" }}
              >
                <ArrowLeft className="text-blue-500" />
              </button>
              <button
                ref={mountainNextRef}
                className="absolute top-1/2 -right-4 lg:-right-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                style={{ transform: "translateY(-50%)" }}
              >
                <ArrowRight className="text-blue-500" />
              </button>
              <Swiper
                modules={[Pagination, Navigation]}
                spaceBetween={12}
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
                  1024: { slidesPerView: 3, spaceBetween: 12 },
                  768: { slidesPerView: 2, spaceBetween: 10 },
                  320: { slidesPerView: 1, spaceBetween: 8 },
                }}
                loop={topAgency.length > 1}
                className="mySwiper"
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
            {t("see_more")}
          </h1>
        </NavLink>
      )}
    </div>
  );
};

export default Agencies;