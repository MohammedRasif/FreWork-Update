import { useState } from "react";
import { useGetAllacceptedOfferQuery } from "@/redux/features/withAuth";
import TourPlanDetails from "@/components/TourplanDetails";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n.js";
import PlanImage1 from "@/assets/img/plan-image-1.png";


export default function AdminAcceptPlan() {
  const { t } = useTranslation();
  const { data: toursData, isLoading, isError } = useGetAllacceptedOfferQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [expanded, setExpanded] = useState({});

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString(i18n.language === "ro" ? "ro-RO" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const end = new Date(endDate || startDate).toLocaleDateString(i18n.language === "ro" ? "ro-RO" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const openModal = (tourId) => {
    setSelectedTourId(tourId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTourId(null);
  };

  if (isLoading) {
    return <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm font-medium text-[#617082]" role="status">{t("loading")}</div>;
  }

  if (isError || !toursData || toursData.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center text-base font-semibold text-[#172b43] shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
        {t("no_plans_available")}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="grid gap-5 sm:grid-cols-2">
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
              className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]"
            >
              <div className="relative h-44 bg-[#f4eee4]">
                <img
                  src={tour.tour_plan.spot_picture_url || PlanImage1}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
                  alt={`${tour.tour_plan.location_to} ${t("destination")}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 text-sm text-[#617082]">
                  {formatDateRange(tour.tour_plan.start_date, tour.tour_plan.end_date)}
                </div>

                <h2 className="mb-2 text-xl font-bold tracking-tight text-[#172b43]">
                  {t("tour_to")} {tour.tour_plan.location_to}
                </h2>

                <p className="mb-3 flex-grow text-sm leading-6 text-[#617082]">
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
                    className="mb-3 self-start text-sm font-semibold text-[#9b6b22] hover:underline"
                  >
                    {isExpanded ? t("see_less") : t("see_more")}
                  </button>
                )}

                <div className="mt-auto border-t border-[#f0eee9] pt-4">
                  <button
                    onClick={() => openModal(tour.tour_plan.id)}
                    className="min-h-10 rounded-xl bg-[#c88f2a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#ad751c]"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/55 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_24px_70px_rgba(16,36,58,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            <TourPlanDetails closeModal={closeModal} id={selectedTourId} />
          </div>
        </div>
      )}
    </div>
  );
}
