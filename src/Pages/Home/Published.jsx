"use client";

import { NavLink } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css";

import { useGetTourPlanPublicQuery } from "@/redux/features/baseApi";

import Card from "@/components/ui/Card";
import BeachCard from "@/components/ui/BeachCard";
import MountainCard from "@/components/ui/MountainCard";
import RelaxCard from "@/components/ui/RelaxCard";
import GroupCard from "@/components/ui/GroupCard";
import { useRef } from "react";
import { ArrowBigRight, ArrowLeft, ArrowRight } from "lucide-react";

const Published = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const beachPrevRef = useRef(null);
  const beachNextRef = useRef(null);
  const mountainPrevRef = useRef(null);
  const mountainNextRef = useRef(null);
  const relaxPrevRef = useRef(null);
  const relaxNextRef = useRef(null);
  const {
    data: publishedData = [],
    isLoading,
    isError,
  } = useGetTourPlanPublicQuery();

  const beachTrips = publishedData?.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "beach"
  );
  console.log({ beachTrips });
  const mountainTrips = publishedData.filter(
    (p) => p.destination_type?.trim().toLowerCase() === "mountain"
  );
  console.log({ mountainTrips });
  const relaxTrips = publishedData.filter(
    (p) => p.travel_type?.trim().toLowerCase() === "relax"
  );
  console.log({ relaxTrips });
  const groupTrips = publishedData.filter(
    (p) => p.travel_type?.trim().toLowerCase() === "group"
  );
  console.log({ groupTrips });

  // const sliderSettings = {
  //   dots: true,
  //   infinite: publishedData.length > 2,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  //   arrows: true,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 1,
  //         infinite: true,
  //         dots: true,
  //         arrows: true,
  //       },
  //     },
  //     {
  //       breakpoint: 640,
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 2,
  //         infinite: true,
  //         dots: true,
  //         arrows: false,
  //         variableWidth: true,
  //       },
  //     },
  //     {
  //       breakpoint: 480,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //         infinite: true,
  //         dots: true,
  //         arrows: false,
  //         variableWidth: true,
  //       },
  //     },
  //   ],
  // };

  // const getSliderSettings = (length) => ({
  //   dots: false,
  //   infinite: length > 3,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 1,
  //   arrows: true,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 3,
  //         slidesToScroll: 1,
  //         infinite: length > 2,
  //         dots: false,
  //         arrows: true,
  //       },
  //     },
  //     {
  //       breakpoint: 640,
  //       settings: {
  //         slidesToShow: 1.5,
  //         slidesToScroll: 1,
  //         infinite: length > 1,
  //         dots: false,
  //         arrows: false,
  //         variableWidth: false,
  //       },
  //     },
  //     {
  //       breakpoint: 480,
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 1,
  //         infinite: length > 1,
  //         dots: false,
  //         arrows: false,
  //         variableWidth: false,
  //       },
  //     },
  //   ],
  // });

  const getSliderSettings = (length) => ({
    dots: true, // change from false to true
    infinite: length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    swipe: true, // ✅ enables swipe
    touchMove: true, // ✅ enables smooth touch interaction
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: length > 2,
          dots: true, // change from false to true
          arrows: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          infinite: length > 1,
          dots: true, // change from false to true
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
          dots: true, // change from false to true
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

      {/* .slick-dots {
        display: none !important;
      } */}

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
                <h2 className="text-2xl font-bold text-black mb-4">
                  Beach Trips
                </h2>

                <div className="relative">
                  <button
                    ref={beachPrevRef}
                    className="absolute top-1/2 -left-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowLeft />
                  </button>

                  <button
                    ref={beachNextRef}
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
                      prevEl: beachPrevRef.current,
                      nextEl: beachNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = beachPrevRef.current;
                      swiper.params.navigation.nextEl = beachNextRef.current;
                    }}
                    breakpoints={{
                      760: { slidesPerView: 3 },
                      480: { slidesPerView: 1.1 },
                      320: { slidesPerView: 1.1 },
                    }}
                    loop={true}
                  >
                    {beachTrips.map((p) => (
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
                    {mountainTrips.map((p) => (
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
                <h2 className="text-2xl font-bold text-black mb-4">
                  Relaxing Tours
                </h2>

                <div className="relative">
                  <button
                    ref={relaxPrevRef}
                    className="absolute top-1/2 -left-10 z-10 hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowLeft />
                  </button>

                  <button
                    ref={relaxNextRef}
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
                      prevEl: relaxPrevRef.current,
                      nextEl: relaxNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = relaxPrevRef.current;
                      swiper.params.navigation.nextEl = relaxNextRef.current;
                    }}
                    breakpoints={{
                      760: { slidesPerView: 3 },
                      480: { slidesPerView: 2 },
                      320: { slidesPerView: 2 },
                    }}
                    loop={true}
                  >
                    {relaxTrips.map((p) => (
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
                <h2 className="text-2xl font-bold text-black mb-4">
                  Group Packages
                </h2>

                <div className="relative">
                  {/* Custom arrows */}
                  <button
                    ref={prevRef}
                    title="Previous"
                    className="absolute  top-1/2 -left-10 z-10 cursor-pointer hidden lg:flex w-10 h-10 items-center bg-white text-black justify-center  border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowLeft />
                  </button>

                  <button
                    ref={nextRef}
                    title="Next"
                    className="absolute cursor-pointer top-1/2 -right-10 z-10 hidden lg:flex w-10 h-10 items-center justify-center bg-white border rounded-full shadow"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowRight />
                  </button>

                  <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    loop={true}
                    navigation={{
                      prevEl: prevRef.current,
                      nextEl: nextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = prevRef.current;
                      swiper.params.navigation.nextEl = nextRef.current;
                    }}
                    breakpoints={{
                      760: {
                        slidesPerView: 3,
                        slidesPerGroup: 1,
                      },
                      480: {
                        slidesPerView: 2,
                        slidesPerGroup: 1,
                      },
                      320: {
                        slidesPerView: 2,
                        slidesPerGroup: 1,
                      },
                    }}
                  >
                    {groupTrips.map((p) => (
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

      <NavLink to="/viewall" className="flex justify-center mt-2">
        <h1 className="w-5/6 md:w-auto h-[48px]  rounded-2xl py-2 font-medium text-base sm:text-lg lg:text-[19px] text-blue-500 underline text-center cursor-pointer">
          see more
        </h1>
      </NavLink>
    </div>
  );
};

export default Published;
