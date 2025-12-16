import { useAcceptedAllOffersQuery } from "@/redux/features/baseApi";
import { MapPin, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  FaBed,
  FaClock,
  FaList,
  FaListUl,
  FaLocationArrow,
  FaLocationDot,
  FaStar,
  FaUtensils,
} from "react-icons/fa6";
import { IoBed } from "react-icons/io5";
import { LuNavigation2 as Navigation } from "react-icons/lu";
import { MdOutlineNoMeals } from "react-icons/md";
import img from "../../assets/img/badge.png";
import { useTranslation } from "react-i18next";

function AcceptedOffers() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useAcceptedAllOffersQuery();
  const [showSentOfferButton, setShowSentOfferButton] = useState(false);

  const handleSentOfferClick = () => {
    console.log("Sent Offer clicked");
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="h-72 bg-gray-300 rounded-t-xl"></div>
          <div className="p-4 space-y-3">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-5 bg-gray-300 rounded w-full"></div>
            <div className="h-5 bg-gray-300 rounded w-5/6"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-11/12"></div>
              <div className="h-4 bg-gray-300 rounded w-10/12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const NoDataMessage = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center min-h-screen -my-56">
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        {t("no_accepted_offers_yet")}
      </h3>
    </div>
  );

  const ErrorMessage = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <svg
          className="w-12 h-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">
        {t("something_went_wrong")}
      </h3>
      <p className="text-gray-600">{t("failed_to_load_offers")}</p>
    </div>
  );

  return (
    <div className="pt-24 container mx-auto lg:px-3 px-5">
      <h1 className="lg:text-4xl text-[28px] font-semibold pb-3">
        {t("all_accepted_offers")}
      </h1>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorMessage />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((tour) => (
            <div
              key={tour.id}
              className="rounded-xl bg-white shadow-sm border border-gray-200 mb-6"
            >
              <div className="relative">
                <div className="overflow-hidden">
                  <img
                    src={
                      tour.spot_picture_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                    }
                    alt={`${tour.location_to} destination`}
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-300 rounded-t-xl"
                  />
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white rounded-t-xl">
                    <h2 className="text-2xl md:text-4xl font-semibold text-center px-4 mb-2">
                      {tour.location_to}
                    </h2>
                  </div>

                  {tour.offers && tour.offers.length > 0 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center pb-2 flex-row">
                      {tour.offers.slice(0, 3).map((offer, index) => (
                        <div
                          key={offer.id || index}
                          className="w-20 h-20 flex items-center justify-center"
                        >
                          <div className="relative rounded-full shadow-inner flex flex-col items-center justify-center p-2">
                            {offer.status === "accepted" && (
                              <img
                                src={img}
                                alt={t("badge")}
                                className="absolute inset-0 object-contain rounded-full pointer-events-none z-10"
                              />
                            )}
                            <img
                              src={
                                offer.agency?.logo_url ||
                                "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                              }
                              alt={offer.agency?.agency_name || t("agency")}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md relative z-30 mt-[1px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tour.offer_count >= 3 && (
                    <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                      <svg
                        className="mr-1"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      {t("offers_completed")}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-grow p-4 space-y-1 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="lg:text-3xl text-2xl font-semibold text-gray-900">
                    {tour.location_to.length > 8
                      ? `${tour.location_to.slice(0, 8)}...`
                      : tour.location_to}
                  </h3>
                </div>

                <div className="space-y-1 text-md text-gray-700">
                  <p>
                    <span className="font-medium">{t("date")}:</span>{" "}
                    {tour.start_date}
                  </p>
                  {/* <p>
                    <span className="font-medium">{t("category")}:</span>{" "}
                    {tour.destination_type || "N/A"}
                  </p> */}
                  <p>
                    <span className="font-medium">{t("category")}:</span>{" "}
                    {tour.destination_type === "beach"
                      ? "Mare"
                      : tour.destination_type === "mountain"
                      ? "Montagna"
                      : tour.destination_type === "relax"
                      ? "Relax"
                      : tour.destination_type === "group"
                      ? "Gruppi"
                      : t("na")}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    {t("budget")}: €{tour.budget}
                  </p>
                </div>

                <div className="flex items-center space-x-10">
                  <span className="text-md text-gray-700">
                    <span className="font-medium">{t("total")}:</span>{" "}
                    {tour.total_members}{" "}
                    {tour.total_members > 1 ? t("people") : t("person")}
                  </span>
                  <div className="flex items-center space-x-4">
                    <h1 className="text-md text-gray-700">
                      <span className="font-medium">{t("child")} :</span>{" "}
                      {tour.child_count}
                    </h1>
                    <h1>
                      <span className="font-medium">{t("adult")} :</span>{" "}
                      {tour.adult_count}
                    </h1>
                  </div>
                </div>

                <div>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaLocationDot className="w-6 h-5 text-black size-4" />
                    <span>
                      <span className="font-medium">
                        {t("points_of_travel")}:
                      </span>{" "}
                      {tour.tourist_spots.length > 14
                        ? `${tour.tourist_spots.slice(0, 14)}...`
                        : tour.tourist_spots}
                    </span>
                  </p>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaLocationArrow className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">
                        {t("departure_from")}:
                      </span>{" "}
                      {tour.location_from || "N/A"}
                    </span>
                  </p>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <MdOutlineNoMeals className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">{t("meal_plan")}:</span>{" "}
                      {tour.meal_plan === "breakfast"
                        ? "Colazione"
                        : tour.meal_plan === "half-board"
                        ? "Mezza Pensione (Colazione & Cena)"
                        : tour.meal_plan === "full-board"
                        ? "Pensione Completa (Tutti i Pasti)"
                        : "N/A"}
                    </span>
                  </p>
                  <div className="flex items-center  space-x-2">
                                <p className="text-md text-gray-600 flex items-center gap-2">
                                  <IoBed className="w-6 h-5 text-black" />
                                  <span>
                                    <span className="font-medium">
                                      {t("type_of_accommodation")}:
                                    </span>{" "}
                                    {tour.type_of_accommodation === "hotel"
                                      ? "Hotel"
                                      : tour.type_of_accommodation === "resort"
                                      ? "Resort"
                                      : tour.type_of_accommodation === "homestay"
                                      ? "B&B"
                                      : tour.type_of_accommodation === "apartment"
                                      ? "Appartamento"
                                      : tour.type_of_accommodation === "hostel"
                                      ? "Ostello"
                                      : "N/A"}
                                  </span>
                                </p>
                                <p className="text-md text-gray-600 flex items-center gap-2 -space-x-[6px]">
                                  
                                  <span>{tour.minimum_star_hotel|| t("0")}</span><FaStar className="w-4 h-4 text-black" />
                                </p>
                              </div>
                  {/* <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaStar className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">
                        {t("minimum_rating")}:
                      </span>{" "}
                      {tour.minimum_star_hotel || "N/A"}
                    </span>
                  </p> */}
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaClock className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">{t("duration")}:</span>{" "}
                      {tour.duration || "N/A"}
                    </span>
                  </p>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-5 text-green-500" />
                    <span>
                      <span className="font-medium">
                        {t("contact_verified")}
                      </span>
                    </span>
                  </p>
                </div>

                {showSentOfferButton && (
                  <div className="pt-2 w-full">
                    <button
                      onClick={handleSentOfferClick}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-md"
                    >
                      {t("sent_offer")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoDataMessage />
      )}
    </div>
  );
}

export default AcceptedOffers;
