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
import React, { useState } from "react"
import Modal from "react-modal"
import { Link, useNavigate } from "react-router-dom"
import SinglePost from "@/Pages/SinglePost/SinglePost"

Modal.setAppElement("#root") // This avoids screen reader accessibility warnings

export default function TourCard({ tourPlan }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const role = localStorage.getItem("role")
  const token = localStorage.getItem("access_token")
  const navigate = useNavigate()

  return (
    <>
      <div className="flex flex-col shadow-lg w-full max-w-sm mx-auto overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-xl">
        {/* Header Image */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={tourPlan.spot_picture_url || "/images/beach-placeholder.jpg"}
              alt={`${tourPlan.location_to} destination`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold text-center px-4 mb-2">{tourPlan.tourist_spots}</h2>
              <p className="text-sm md:text-base opacity-90 italic">Drone Shot</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{tourPlan.location_to}</h3>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-600 font-medium">Richiesta reale</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Disponibile a procedere dal:</span> {tourPlan.start_date}</p>
            <p><span className="font-medium">Include:</span> {tourPlan.duration}</p>
            <p><span className="font-medium">Categoria:</span> {tourPlan.destination_type}</p>
          </div>

          {/* Budget */}
          <div className="py-2">
            <p className="text-lg font-bold text-gray-900">Budget: ${tourPlan.budget}</p>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              <span className="font-medium">Totale:</span> {tourPlan.total_members}{" "}
              {tourPlan.total_members > 1 ? "persone" : "persona"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              1 offerta ricevuta
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link
              to={`/tour-plans/${tourPlan.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              View Details
            </Link>
            {
              role === "agency" && <button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
              onClick={() => {
                if (!token) navigate("/login")
                setIsModalOpen(true)
              }}
            >
              Submit offer
            </button>
            }
          </div>

          {/* Travel Points */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Punti di viaggio:</span> {tourPlan.tourist_spots}
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
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
          <SinglePost prid={{ id: tourPlan.id }} />
        </div>
        
      </Modal>
    </>
  )
}
