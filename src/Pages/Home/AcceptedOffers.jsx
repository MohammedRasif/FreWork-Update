import { useAcceptedAllOffersQuery } from "@/redux/features/baseApi";
import { MapPin, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
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

function AcceptedOffers() {
  const { data, error, isLoading } = useAcceptedAllOffersQuery();
  const [showSentOfferButton, setShowSentOfferButton] = useState(false);
  const handleSentOfferClick = () => {
    console.log("Sent Offer clicked");
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="pt-24 container mx-auto px-3">
      <h1 className="lg:text-4xl text-[28] font-semibold pb-3 ">
        All Accepted Offers
      </h1>
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {data &&
          data.map((tour) => (
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
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center pb-2 flex-row gap-4">
                      {tour.offers
                        .slice(0, 3) // Limit to 3 offers
                        .map((offer, index) => (
                          <div
                            key={offer.id || index} // Fallback to index if offer.id is not unique
                            className="w-24 h-24 flex items-center justify-center"
                          >
                            <div className="relative rounded-full shadow-inner flex flex-col items-center justify-center p-2">
                              {offer.status === "accepted" && (
                                <img
                                  src={img}
                                  alt="Badge"
                                  className="absolute inset-0 object-contain rounded-full pointer-events-none z-10"
                                  onError={() =>
                                    console.log("Badge image failed to load")
                                  }
                                />
                              )}
                              <img
                                src={
                                  offer.agency?.logo_url ||
                                  "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                }
                                alt={offer.agency?.agency_name || "Agency"}
                                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md relative z-30 mt-[1px]"
                                onError={() =>
                                  console.log("Agency logo failed to load")
                                }
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  {tour.offer_count >= 3 ? (
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
                      Offers completed
                    </div>
                  ) : null}
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
                    <span className="font-medium">Date:</span> {tour.start_date}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {tour.travel_type || tour.category || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    Budget: €{tour.budget}
                  </p>
                </div>

                <div className="flex items-center space-x-10">
                  <span className="text-md text-gray-700">
                    <span className="font-medium">Total:</span>{" "}
                    {tour.total_members}{" "}
                    {tour.total_members > 1 ? "people" : "person"}
                  </span>

                  <div className="flex items-center space-x-4">
                    <h1 className="text-md text-gray-700">
                      <span className="font-medium">Child :</span>{" "}
                      {tour.child_count}
                    </h1>
                    <h1>
                      <span className="font-medium">Adult :</span>{" "}
                      {tour.adult_count} {/* Corrected to use adult_count */}
                    </h1>
                  </div>
                </div>

                <div>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaLocationDot className="w-6 h-5 text-black size-4" />
                    <span>
                      <span className="font-medium">Points of travel:</span>{" "}
                      {tour.tourist_spots.length > 14
                        ? `${tour.tourist_spots.slice(0, 14)}...`
                        : tour.tourist_spots}
                    </span>
                  </p>

                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaLocationArrow className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">Departure from:</span>{" "}
                      {tour.location_from || "N/A"}
                    </span>
                  </p>

                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <MdOutlineNoMeals className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">Meal plan:</span>{" "}
                      {tour.meal_plan || "N/A"}
                    </span>
                  </p>

                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <IoBed className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">
                        Type of accommodation:
                      </span>{" "}
                      {tour.type_of_accommodation || "N/A"}
                    </span>
                  </p>
                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaStar className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">Minimum rating:</span>{" "}
                      {tour.minimum_star_hotel || "N/A"}
                    </span>
                  </p>

                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <FaClock className="w-6 h-5 text-black" />
                    <span>
                      <span className="font-medium">Duration:</span>{" "}
                      {tour.duration || "N/A"}
                    </span>
                  </p>

                  <p className="text-md text-gray-600 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-5 text-green-500" />
                    <span>
                      <span className="font-medium">
                        Contact verified via email
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
                      Sent Offer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default AcceptedOffers;
