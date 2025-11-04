import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation } from "lucide-react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import img from "../../assets/img/badge.png";


export default function GroupCard({ tourPlan }) {
  const [localTourPlan, setLocalTourPlan] = useState(tourPlan);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocalStorage = () => {
      setRole(localStorage.getItem("role") || "tourist");
      setIsLocalStorageLoaded(true);
    };

    fetchLocalStorage();
    window.addEventListener("storage", fetchLocalStorage);
    return () => window.removeEventListener("storage", fetchLocalStorage);
  }, []);

  useEffect(() => {
    setLocalTourPlan(tourPlan);
  }, [tourPlan]);

  const handleViewDetails = () => {
    navigate(`/tour-plans/${localTourPlan.id}`);
  };

  if (!isLocalStorageLoaded) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="flex flex-col shadow-lg w-72 mx-auto overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-xl">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={
              localTourPlan.spot_picture_url ||
              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
            }
            alt={`${localTourPlan.location_to} destination`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold text-center px-4 mb-2">
              {localTourPlan.location_to}
            </h2>
          </div>
          {/* Display agency logos */}
          {localTourPlan.offers && localTourPlan.offers.length > 0 && (
                      <div
                        className="
                absolute bottom-4
                flex items-center justify-center space-x-8
                px-2
                w-full
              "
                      >
                        {localTourPlan?.offers?.map((offer) => {
                          const isAccepted = offer.status === "accepted";
          
                          return (
                            <div
                              key={offer.agency?.id || Math.random()}
                              className={`
                      relative flex items-center justify-center flex-shrink-0
                      ${isAccepted ? "w-14 h-14" : "w-12 h-12"}
                    `}
                            >
                              {/* Accepted Badge Background */}
                              {isAccepted && (
                                <img
                                  src={img}
                                  alt="Accepted Badge"
                                  className="absolute inset-0  object-contain pointer-events-none"
                                />
                              )}
          
                              {/* Agency Logo (Always on Top) */}
                              <img
                                src={
                                  offer.agency?.logo_url ||
                                  "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                }
                                alt={`${offer.agency?.agency_name || "Agency"} logo`}
                                className={`
                        relative z-10
                        ${isAccepted ? "w-10 h-10" : "w-12 h-12"}
                        object-contain rounded-full border bg-white
                        ${isAccepted ? "" : "border-white"}
                        flex-shrink-0
                      `}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
        </div>
        {/* <h1 className="text-[14px] left-10 absolute top-2  font-semibold text-white ">Image generated automatically</h1> */}
      </div>

      <div className="flex flex-col flex-grow p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {localTourPlan.location_to.length > 8
              ? `${localTourPlan.location_to.slice(0, 8)}...`
              : localTourPlan.location_to}
          </h3>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-green-600 font-medium">
              Real Request
            </span>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <span className="font-medium">Date:</span>{" "}
            {localTourPlan.start_date} to{" "}
            {localTourPlan.offers.length > 0
              ? localTourPlan.offers[0].tour_plan.end_date
              : localTourPlan.end_date || "N/A"}{" "}
          </p>
          <p>
            <span className="font-medium">Category:</span>{" "}
            {localTourPlan.destination_type}
          </p>
        </div>

        <div>
          <p className="text-lg font-bold text-gray-900">
            Budget: €{localTourPlan.budget}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">
            <span className="font-medium">Total:</span>{" "}
            {localTourPlan.total_members}{" "}
            {localTourPlan.total_members > 1 ? "people" : "person"}
          </span>
        </div>

        <div
          className={
            localTourPlan.offer_count < 3
              ? "pt-2 w-full relative"
              : "pt-2 w-full"
          }
        >
          <button
            onClick={handleViewDetails}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
          >
            View Details
          </button>

          {localTourPlan.offer_count >= 3 && (
            <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
              <IoCheckmarkCircleSharp className="mr-1" size={16} />
              Offers completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
