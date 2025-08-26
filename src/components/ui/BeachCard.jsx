import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import SinglePost from "@/Pages/SinglePost/SinglePost";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { MapPin, Navigation } from "lucide-react";

Modal.setAppElement("#root");

export default function TourCard({ tourPlan }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [localTourPlan, setLocalTourPlan] = useState(tourPlan);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocalStorage = () => {
      setRole(localStorage.getItem("role") || "tourist");
      setToken(localStorage.getItem("access_token"));
      setIsLocalStorageLoaded(true);
    };

    fetchLocalStorage();
    window.addEventListener("storage", fetchLocalStorage);
    return () => window.removeEventListener("storage", fetchLocalStorage);
  }, []);

  useEffect(() => {
    setLocalTourPlan(tourPlan);
  }, [tourPlan]);

  const handleOfferSubmitted = (updatedData) => {
    setLocalTourPlan((prev) => ({
      ...prev,
      offer_count: updatedData.offer_count || prev.offer_count + 1,
    }));
    setIsModalOpen(false);
  };

  const handleViewDetails = () => {
    navigate(`/tour-plans/${localTourPlan.id}`);
  };

  if (!isLocalStorageLoaded) {
    return <div>Loading user data...</div>;
  }

  return (
    <>
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
              <p className="text-sm md:text-base opacity-90 italic">
                Drone Shot
              </p>
            </div>
            {/* Display agency logos */}
            {localTourPlan.offers && localTourPlan.offers.length > 0 && (
              <div
                className="
                absolute bottom-4
                flex flex-col items-center space-y-3
                overflow-y-auto
                px-2
                scrollbar-none
              "
              >
                {localTourPlan?.offers?.map((offer) => (
                  <img
                    key={offer.agency?.id || Math.random()} // fallback key
                    src={
                      offer.agency?.logo_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                    }
                    alt={`${offer.agency?.agency_name || "Agency"} logo`}
                    className="
                    w-12 h-12
                    object-contain rounded-full border border-white bg-white
                    flex-shrink-0
                  "
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-grow p-4 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {localTourPlan.location_to}
            </h3>
           
          </div>

          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {localTourPlan.start_date} to{" "}
              {localTourPlan.offers.length > 0
                ? localTourPlan.offers[0].tour_plan.end_date
                : "N/A"}{" "}
              ({localTourPlan.duration})
            </p>
            {/* <p>
              <span className="font-medium">Categoria:</span>{" "}
              {localTourPlan.travel_type}
            </p> */}
          </div>

          <div className="">
            <p className="text-lg font-bold text-gray-900">
              Budget: ${localTourPlan.budget}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              <span className="font-medium">Totale:</span>{" "}
              {localTourPlan.total_members}{" "}
              {localTourPlan.total_members > 1 ? "persone" : "persona"}
            </span>
            {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {localTourPlan.offer_count} Offer received
            </span> */}
          </div>

          {/* <p className="text-sm text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>
              <span className="font-medium">Points of travel:</span>{" "}
              {localTourPlan.tourist_spots}
            </span>
          </p>

          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-gray-500" />
            <span>
              <span className="font-medium">Departure from:</span>{" "}
              {localTourPlan.location_from}
            </span>
          </p> */}

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

            {localTourPlan.offer_count < 3 ? (
              role !== "tourist" && <div></div>
            ) : (
              <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                <IoCheckmarkCircleSharp className="mr-1" size={16} />
                Offers completed
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isQuestionModalOpen}
        onRequestClose={() => setIsQuestionModalOpen(false)}
        contentLabel="Agency Question Modal"
        className="max-w-md mx-auto mt-24 bg-white rounded-2xl shadow-lg p-8 outline-none"
        overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-cute">Are You an Agency?</h2>
          <p className="text-gray-600 text-sm">
            Let us know if you're an agency to proceed with your offer!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setIsQuestionModalOpen(false);
                navigate("/register");
              }}
              className="px-6 py-2 bg-blue-600 hover:cursor-pointer text-white rounded-full font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Yes
            </button>
            <button
              onClick={() => {
                setIsQuestionModalOpen(false);
              }}
              className="px-6 py-2 bg-gray-300 hover:cursor-pointer text-gray-800 rounded-full font-medium hover:bg-gray-400 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              No
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Submit Offer Modal"
        className="max-w-4xl mx-auto mt-24 bg-white rounded-xl shadow-lg p-6 outline-none"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
        <div className="w-full h-[70vh] overflow-y-auto">
          <SinglePost
            prid={{ id: localTourPlan.id }}
            onOfferSubmitted={handleOfferSubmitted}
          />
        </div>
      </Modal>
    </>
  );
}
