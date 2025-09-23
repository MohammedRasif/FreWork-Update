"use client";

import { NavLink, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";

import Card from "@/components/ui/Card";
import BeachCard from "@/components/ui/BeachCard";
import MountainCard from "@/components/ui/MountainCard";
import RelaxCard from "@/components/ui/RelaxCard";
import GroupCard from "@/components/ui/GroupCard";
import { useRef } from "react";
import { ArrowBigRight, ArrowLeft, ArrowRight } from "lucide-react";
import { GoChevronRight } from "react-icons/go";
import { useGetTourPlanPublicQuery } from "@/redux/features/withAuth";

const Published = () => {
  const navigate = useNavigate();
  const beachPrevRef = useRef(null);
  const beachNextRef = useRef(null);
  const mountainPrevRef = useRef(null);
  const mountainNextRef = useRef(null);
  const relaxPrevRef = useRef(null);
  const relaxNextRef = useRef(null);
  const groupPrevRef = useRef(null);
  const groupNextRef = useRef(null);
  const {
    data: publishedData = [],
    isLoading,
    isError,
  } = useGetTourPlanPublicQuery();

  const beachTrips = publishedData?.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "beach"
  );
  const mountainTrips = publishedData.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "mountain"
  );
  const relaxTrips = publishedData.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "relax"
  );
  const groupTrips = publishedData.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "group"
  );

  const handleCategoryClick = (category) => {
    localStorage.setItem("selectedCategory", category);
    navigate("/tourPlans");
  };

  const getSliderSettings = (length) => ({
    dots: true,
    infinite: length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    swipe: true,
    touchMove: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: length > 2,
          dots: true,
          arrows: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          infinite: length > 1,
          dots: true,
          arrows: false,
          variableWidth: false,
          swipe: true,
          touchMove: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: length > 1,
          dots: true,
          arrows: false,
          variableWidth: false,
          swipe: true,
          touchMove: true,
        },
      },
    ],
  });

  return (
    <div className="pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#4691F2]/10">
      <style jsx>{`
        .mySwiper {
          padding: 0 10px;
        }
        .swiper-slide {
          display: flex;
          justify-content: center;
          align-items: center;
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
        .category-button {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          cursor: pointer;
          text-align: left;
          transition: color 0.2s ease-in-out;
        }
        .category-button:hover {
          color: #3182ce;
        }
      `}</style>

      <div className="text-center py-1 mb-6 sm:py-12 lg:py-16">
        <p className="text-gray-700 text-[13px] md:text-lg lg:mb-4 font-medium">
          Top Requests are here
        </p>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          Last Request Published
        </h1>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            Error loading tour plans. Please try again later.
          </div>
        ) : publishedData.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            No tour plans available at the moment.
          </div>
        ) : (
          <>
            {beachTrips.length > 0 && (
              <div className="mb-4">
                <button
                  value="beach"
                  onClick={() => handleCategoryClick("beach")}
                  className="text-3xl font-bold text-black mb-4 flex items-center hover:cursor-pointer"
                >
                  Beach Trips
                  <GoChevronRight className="mt-[5px]" />
                </button>
                <div className="relative">
                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={12}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return `
          <span class="${className} custom-pagination-bullet">
            <span class="pagination-number">${index + 1}</span>
          </span>
        `;
                      },
                    }}
                    navigation={{
                      prevEl: beachPrevRef.current,
                      nextEl: beachNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = beachPrevRef.current;
                      swiper.params.navigation.nextEl = beachNextRef.current;
                    }}
                    breakpoints={{
                      1024: { slidesPerView: 4, spaceBetween: 12 },
                      768: { slidesPerView: 3, spaceBetween: 10 },
                      320: { slidesPerView: 1, spaceBetween: 8 },
                    }}
                    loop={true}
                    className="mySwiper"
                  >
                    {beachTrips.slice(-6).map((p) => (
                      <SwiperSlide key={p.id} className="px-2 mb-12">
                        <BeachCard tourPlan={p} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}

            {mountainTrips.length > 0 && (
              <div className="mb-4">
                <button
                  value="mountain"
                  onClick={() => handleCategoryClick("mountain")}
                  className="text-3xl font-bold text-black flex items-center mb-4 hover:cursor-pointer"
                >
                  Mountain Adventures
                  <GoChevronRight className="mt-[5px]" />
                </button>
                <div className="relative">
                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={12}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return `
          <span class="${className} custom-pagination-bullet">
            <span class="pagination-number">${index + 1}</span>
          </span>
        `;
                      },
                    }}
                    navigation={{
                      prevEl: mountainPrevRef.current,
                      nextEl: mountainNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = mountainPrevRef.current;
                      swiper.params.navigation.nextEl = mountainNextRef.current;
                    }}
                    breakpoints={{
                      1024: { slidesPerView: 4, spaceBetween: 12 },
                      768: { slidesPerView: 3, spaceBetween: 10 },
                      320: { slidesPerView: 1, spaceBetween: 8 },
                    }}
                    loop={true}
                    className="mySwiper"
                  >
                    {mountainTrips.slice(-6).map((p) => (
                      <SwiperSlide key={p.id} className="px-2 mb-12">
                        <MountainCard tourPlan={p} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}

            {relaxTrips.length > 0 && (
              <div className="mb-4">
                <button
                  value="desert"
                  onClick={() => handleCategoryClick("desert")}
                  className="text-3xl font-bold text-black mb-4 hover:cursor-pointer flex items-center"
                >
                  Relaxing Tours <GoChevronRight className="mt-[5px]" />
                </button>
                <div className="relative">
                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={12}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return `
          <span class="${className} custom-pagination-bullet">
            <span class="pagination-number">${index + 1}</span>
          </span>
        `;
                      },
                    }}
                    navigation={{
                      prevEl: relaxPrevRef.current,
                      nextEl: relaxNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = relaxPrevRef.current;
                      swiper.params.navigation.nextEl = relaxNextRef.current;
                    }}
                    breakpoints={{
                      1024: { slidesPerView: 4, spaceBetween: 12 },
                      768: { slidesPerView: 3, spaceBetween: 10 },
                      320: { slidesPerView: 1, spaceBetween: 8 },
                    }}
                    loop={true}
                    className="mySwiper"
                  >
                    {relaxTrips.slice(-6).map((p) => (
                      <SwiperSlide key={p.id} className="px-2 mb-12">
                        <RelaxCard tourPlan={p} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}

            {groupTrips.length > 0 && (
              <div className="">
                <button
                  value="island"
                  onClick={() => handleCategoryClick("island")}
                  className="text-3xl font-bold text-black mb-4 flex items-center hover:cursor-pointer"
                >
                  Group Packages <GoChevronRight className="mt-[5px]" />
                </button>
                <div className="relative">
                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={12}
                    pagination={{
                      clickable: true,
                      renderBullet: (index, className) => {
                        return `
          <span class="${className} custom-pagination-bullet">
            <span class="pagination-number">${index + 1}</span>
          </span>
        `;
                      },
                    }}
                    navigation={{
                      prevEl: relaxPrevRef.current,
                      nextEl: relaxNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = relaxPrevRef.current;
                      swiper.params.navigation.nextEl = relaxNextRef.current;
                    }}
                    breakpoints={{
                      1024: { slidesPerView: 4, spaceBetween: 12 },
                      768: { slidesPerView: 3, spaceBetween: 10 },
                      320: { slidesPerView: 1, spaceBetween: 8 },
                    }}
                    loop={true}
                    className="mySwiper"
                  >
                    {groupTrips.slice(-6).map((p) => (
                      <SwiperSlide key={p.id} className="px-2 mb-12">
                        <GroupCard tourPlan={p} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <NavLink to="/tourPlans" className="flex justify-center mt-2">
        <h1 className="w-5/6 md:w-auto h-[48px] rounded-2xl py-2 font-medium text-base sm:text-lg lg:text-[19px] text-blue-500 underline text-center cursor-pointer">
          see more
        </h1>
      </NavLink>
    </div>
  );
};

export default Published;
