// import { Star } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function BeachCard({ tourPlan }) {
//   console.log({ tourPlan });
//   return (
//     <Link
//       to={`/tour-plans/${tourPlan.id}`}
//       className="flex flex-col shadow-md w-full max-w-[150%] mx-auto sm:max-w-sm sm:mx-2 overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-lg min-h-[310px]"
//     >
//       <div className="relative">
//         <div className="aspect-[4/3] overflow-hidden">
//           <img
//             src={tourPlan.spot_picture_url || "/images/beach-placeholder.jpg"}
//             alt="Beach destination"
//             className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 rounded-t-xl"
//           />
//         </div>
//       </div>

//       <div className="flex flex-col justify-between flex-grow p-2 sm:p-4 h-full">
//         <div className="flex justify-between items-center lg:mt-1">
//           <div>
//             <h3 className="font-semibold text-gray-900 text-sm sm:text-xl truncate">
//               {tourPlan.location_to}
//             </h3>
//           </div>

//           <div className="flex items-center gap-1">
//             <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
//             <span className="text-sm sm:text-[15px] font-medium text-gray-900">
//               {tourPlan.like_count}
//             </span>
//           </div>
//         </div>
//         <p className="text-xs sm:text-[15px] lg:mt-1">
//           Willing to proceed from: {tourPlan.start_date}
//         </p>
//         <p className="text-xs sm:text-[15px] lg:mt-1">
//           Includes: {tourPlan.duration}
//         </p>
//         <p className="text-xs sm:text-[15px] lg:mt-1">
//           Categoria: {tourPlan?.destination_type}
//         </p>
//         <p className="text-xs sm:text-[15px] font-bold lg:mt-1 py-1">
//           Budget: ${tourPlan?.budget}
//         </p>
//         <span className="text-gray-600 text-xs sm:text-[14px] lg:mt-1">
//           Total: {tourPlan.total_members}{" "}
//           {tourPlan.total_members > 1 ? "people" : "person"}
//         </span>
//         <p className="text-xs sm:text-[15px] lg:mt-1">
//           Travel points: {tourPlan?.tourist_spots}
//         </p>
//       </div>
//     </Link>
//   );
// } 
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Link, useNavigate } from "react-router-dom";
import SinglePost from "@/Pages/SinglePost/SinglePost";
 
Modal.setAppElement("#root");
 
export default function TourCard({ tourPlan }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [localTourPlan, setLocalTourPlan] = useState(tourPlan); // Local state for tourPlan
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);
 
  const navigate = useNavigate();
 
  // Initialize localStorage values and sync tourPlan
  useEffect(() => {
    // Fetch localStorage values
    const fetchLocalStorage = () => {
      setRole(localStorage.getItem("role") || "tourist");
      setToken(localStorage.getItem("access_token"));
      setIsLocalStorageLoaded(true);
    };
 
    fetchLocalStorage();
 
    // Listen for storage events to handle dynamic localStorage changes
    window.addEventListener("storage", fetchLocalStorage);
    return () => window.removeEventListener("storage", fetchLocalStorage);
  }, []);
 
  // Sync localTourPlan with tourPlan prop when it changes
  useEffect(() => {
    setLocalTourPlan(tourPlan);
  }, [tourPlan]);
 
  // Callback to update localTourPlan after an offer is submitted
  const handleOfferSubmitted = (updatedData) => {
    setLocalTourPlan((prev) => ({
      ...prev,
      offer_count: updatedData.offer_count || prev.offer_count + 1,
      // Update other fields if needed, e.g., offers array
    }));
    setIsModalOpen(false); // Close the modal after submission
  };
 
  if (!isLocalStorageLoaded) {
    return <div>Loading user data...</div>;
  }
 
  return (
    <>
      <div className="flex flex-col shadow-lg w-full max-w-sm mx-auto overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-xl">
        {/* Header Image */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={localTourPlan.spot_picture_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"}
              alt={`${localTourPlan.location_to} destination`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold text-center px-4 mb-2">
                {localTourPlan.tourist_spots}
              </h2>
              <p className="text-sm md:text-base opacity-90 italic">
                Drone Shot
              </p>
            </div>
          </div>
        </div>
 
        {/* Content */}
        <div className="flex flex-col flex-grow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {localTourPlan.location_to}
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
                Richiesta reale
              </span>
            </div>
          </div>
 
          {/* Details */}
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium">Disponibile a procedere dal:</span>{" "}
              {localTourPlan.start_date}
            </p>
            <p>
              <span className="font-medium">Include:</span> {localTourPlan.duration}
            </p>
            <p>
              <span className="font-medium">Categoria:</span>{" "}
              {localTourPlan.destination_type}
            </p>
          </div>
 
          {/* Budget */}
          <div className="py-2">
            <p className="text-lg font-bold text-gray-900">
              Budget: ${localTourPlan.budget}
            </p>
          </div>
 
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              <span className="font-medium">Totale:</span>{" "}
              {localTourPlan.total_members}{" "}
              {localTourPlan.total_members > 1 ? "persone" : "persona"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {localTourPlan.offer_count} Offer received
            </span>
          </div>
 
          {/* Action Buttons */}
          <div
            className={localTourPlan.offer_count < 3 ? "flex gap-3 pt-" : "pt-4"}
          >
            <Link
              to={`/tour-plans/${localTourPlan.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              View Details
            </Link>
 
            {localTourPlan.offer_count < 3 ? (
              role !== "tourist" && (
                <button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
                  onClick={() => {
                    if (!token) {
                      setIsQuestionModalOpen(true);
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  Submit Offer
                </button>
              )
            ) : (
              <p className="text-sm text-red-600 font-medium mt-3">
                Offers completed – this request has already received 3 offers.
                Please explore other available requests.
              </p>
            )}
          </div>
 
          {/* Travel Points */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Punti di viaggio:</span>{" "}
              {localTourPlan.tourist_spots}
            </p>
          </div>
        </div>
      </div>
 
      {/* Question Modal */}
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
 
      {/* Submit Offer Modal */}
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
          <SinglePost prid={{ id: localTourPlan.id }} onOfferSubmitted={handleOfferSubmitted} />
        </div>
      </Modal>
    </>
  );
}
 