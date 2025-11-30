"use client";

import { NavLink, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";

import BeachCard from "@/components/ui/BeachCard";
import MountainCard from "@/components/ui/MountainCard";
import RelaxCard from "@/components/ui/RelaxCard";
import GroupCard from "@/components/ui/GroupCard";
import { useEffect, useRef } from "react";
import { GoChevronRight } from "react-icons/go";
import { useGetTourPlanPublicQuery } from "@/redux/features/withAuth";
import { useTranslation } from "react-i18next";

const Published = () => {
  const { t } = useTranslation();
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
    refetch,
  } = useGetTourPlanPublicQuery();
  useEffect(() => {
    refetch();
  }, [refetch]);
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
        {/* <p className="text-gray-700 text-[13px] md:text-lg lg:mb-4 font-medium">
          {t("top_requests_here")}
        </p> */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-[#3F4C65]">
          {t("last_request_published")}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            {t("error_loading")}
          </div>
        ) : publishedData.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            {t("no_tour_plans")}
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
                  {t("beach_trips")}
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
                  {t("mountain_adventures")}
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
                  value="relax"
                  onClick={() => handleCategoryClick("relax")}
                  className="text-3xl font-bold text-black mb-4 hover:cursor-pointer flex items-center"
                >
                  {t("relaxing_tours")} <GoChevronRight className="mt-[5px]" />
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
                  value="group"
                  onClick={() => handleCategoryClick("group")}
                  className="text-3xl font-bold text-black mb-4 flex items-center hover:cursor-pointer"
                >
                  {t("group_packages")} <GoChevronRight className="mt-[5px]" />
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
                      prevEl: groupPrevRef.current,
                      nextEl: groupNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = groupPrevRef.current;
                      swiper.params.navigation.nextEl = groupNextRef.current;
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
          {t("see_more")}
        </h1>
      </NavLink>
    </div>
  );
};

export default Published;
