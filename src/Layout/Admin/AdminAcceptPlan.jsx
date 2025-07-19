import { useState } from "react";
import { useGetAllacceptedOfferQuery } from "@/redux/features/withAuth";
import TourPlanDetails from "@/components/TourplanDetails";

export default function AdminAcceptPlan() {
  const { data: toursData, isLoading, isError } = useGetAllacceptedOfferQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  // Placeholder image if none is provided
  const placeholderImage =
    "https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443119/samples/landscapes/nature-mountains.jpg";

  // Handle opening the modal
  const openModal = (tourId) => {
    setSelectedTourId(tourId);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTourId(null);
  };

  // Handle loading and error states
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (isError || !toursData) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading tour data.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Grid layout for tour cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {toursData.map((tour) => (
          <div
            key={tour.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
            style={{ minHeight: "400px" }}
          >
            {/* Tour Image */}
            <div className="relative p-3">
              <img
                src={tour.agency.logo_url || placeholderImage}
                alt={`${tour.tour_plan.location_to} destination`}
                className="w-full h-44 rounded-md object-cover"
              />
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col flex-grow">
              {/* Date Range */}
              <div className="text-sm text-gray-600 mb-2">
                {formatDateRange(
                  tour.tour_plan.start_date,
                  tour.tour_plan.end_date
                )}
              </div>

              {/* Tour Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Tour to {tour.tour_plan.location_to}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed font-medium mb-3 flex-grow">
                {tour.tour_plan.description ||
                  "Explore this amazing destination!"}
              </p>

              {/* View Button - Fixed at the bottom */}
              <div className="mt-auto">
                <button
                  onClick={() => openModal(tour.tour_plan.id)}
                  className="py-[5px] px-5 border-2 border-gray-400 text-blue-500 font-medium rounded-md hover:bg-blue-50 transition-colors text-[14px]"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedTourId && (
        <div
          className="fixed inset-0 bg-[#ffffff6e] backdrop-blur-xs flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <TourPlanDetails closeModal={closeModal} id={selectedTourId} />
            {/* Close Button */}
          </div>
        </div>
      )}
    </div>
  );
}
