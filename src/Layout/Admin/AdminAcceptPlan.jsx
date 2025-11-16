import { useState } from "react";
import { useGetAllacceptedOfferQuery } from "@/redux/features/withAuth";
import TourPlanDetails from "@/components/TourplanDetails";
import { useTranslation } from "react-i18next";

export default function AdminAcceptPlan() {
  const { t } = useTranslation();
  const { data: toursData, isLoading, isError } = useGetAllacceptedOfferQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [expanded, setExpanded] = useState({});

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

  const placeholderImage =
    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg";

  const openModal = (tourId) => {
    setSelectedTourId(tourId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTourId(null);
  };

  if (isLoading) {
    return <div className="text-center py-10">{t("loading")}</div>;
  }

  if (isError || !toursData || toursData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("no_plans_available")}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {toursData.map((tour) => {
          const description =
            tour.tour_plan.description || t("default_description");
          const words = description.split(" ");
          const isLong = words.length > 15;
          const isExpanded = expanded[tour.id] || false;
          const shownText =
            isLong && !isExpanded
              ? words.slice(0, 15).join(" ") + "..."
              : description;

          return (
            <div
              key={tour.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
              style={{ minHeight: "400px" }}
            >
              <div className="relative p-3">
                <img
                  src={tour.agency.logo_url || placeholderImage}
                  alt={`${tour.tour_plan.location_to} ${t("destination")}`}
                  className="w-full h-44 rounded-md object-cover"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="text-sm text-gray-600 mb-2">
                  {formatDateRange(
                    tour.tour_plan.start_date,
                    tour.tour_plan.end_date
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {t("tour_to")} {tour.tour_plan.location_to}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed font-medium mb-2 flex-grow">
                  {shownText}
                </p>

                {isLong && (
                  <button
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [tour.id]: !isExpanded,
                      }))
                    }
                    className="text-blue-500 text-sm mb-3 hover:underline"
                  >
                    {isExpanded ? t("see_less") : t("see_more")}
                  </button>
                )}

                <div className="mt-auto">
                  <button
                    onClick={() => openModal(tour.tour_plan.id)}
                    className="py-[5px] px-5 border-2 border-gray-400 text-blue-500 font-medium rounded-md hover:bg-blue-50 transition-colors text-[14px]"
                  >
                    {t("view")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && selectedTourId && (
        <div
          className="fixed inset-0 bg-[#ffffff6e] backdrop-blur-xs flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TourPlanDetails closeModal={closeModal} id={selectedTourId} />
          </div>
        </div>
      )}
    </div>
  );
}