import { useGetOneTourPlanQuery } from "@/redux/features/withAuth";
import { X } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { useTranslation } from "react-i18next";

export default function TourPlanDetails({ id, closeModal }) {
  const { t } = useTranslation();
  const { data: tourData, isLoading, isError } = useGetOneTourPlanQuery(id);

  const formatDateRange = (startDate, endDate) => {
    try {
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
    } catch (error) {
      return t("tbd") || "TBD";
    }
  };

  const placeholderImage =
    "https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443119/samples/landscapes/nature-mountains.jpg";

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-600 animate-pulse">
        {t("loading") || "Loading"}...
      </div>
    );
  }

  if (isError || !tourData) {
    return (
      <div className="text-center py-10 text-red-500">
        {t("error_loading") || "Error loading tour plan details."}
      </div>
    );
  }

  const offer =
    tourData.offers && tourData.offers.length > 0 ? tourData.offers[0] : null;

  return (
    <div className="w-full mx-auto sm:p-6">
      <div className="">
        {/* Cover Image */}
        <div className="relative">
          <div className="mb-6 absolute top-2 right-2 z-30">
            <button
              onClick={closeModal}
              className="p-2 bg-gray-400 text-white font-medium rounded-full hover:bg-gray-500 hover:cursor-pointer transition-colors"
            >
              <X />
            </button>
          </div>
          <img
            src={tourData.spot_picture_url || placeholderImage}
            alt={`${tourData.location_to} tour`}
            className="w-full h-48 sm:h-64 object-cover rounded-t-2xl"
          />
          <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded-full">
            {tourData.category}
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 sm:p-6">
          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {t("tour_to") || "Tour to"} {tourData.location_to}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("posted_by") || "Posted by"} User {tourData.name} ·{" "}
            {new Date(
              tourData.offers?.[0]?.tour_plan?.created_at || Date.now()
            ).toLocaleDateString()}
          </p>

          {/* Tour Plan Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("tour_details") || "Tour Details"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                <strong>{t("route") || "Route"}:</strong> {tourData.location_from} to{" "}
                {tourData.location_to}
              </p>
              <p>
                <strong>{t("dates") || "Dates"}:</strong>{" "}
                {tourData.start_date, tourData.end_date}
              </p>
              <p>
                <strong>{t("members") || "Members"}:</strong> {tourData.total_members}
              </p>
              <p>
                <strong>{t("budget") || "Budget"}:</strong> €{Number(tourData.budget).toLocaleString()}
              </p>
              <p>
                <strong>{t("duration") || "Duration"}:</strong> {tourData.duration} {t("days") || "days"}
              </p>
              <p>
                <strong>{t("status") || "Status"}:</strong>{" "}
                <span
                  className={`capitalize ${
                    tourData.approval_status === "Verificato"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {t(tourData.approval_status) || tourData.approval_status}
                </span>
              </p>
              <div className="sm:col-span-2">
                <p>
                  <strong>{t("description") || "Description"}:</strong>{" "}
                  {tourData.description || t("no_description") || "No description provided."}
                </p>
                <p className="pt-5">
                  <strong>{t("email") || "Email"}:</strong>{" "}
                  {tourData.email || t("not_provided") || "Not provided"}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <strong>{t("phone") || "Phone"}:</strong>{" "}
                  {tourData.phone_number || t("not_provided") || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          {offer && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("accepted_offer") }
              </h3>

              <div className="flex items-center mb-3">
                <img
                  src={offer.agency.logo_url || placeholderImage}
                  alt={`${offer.agency.agency_name} logo`}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 flex items-center">
                    <span>{offer.agency.agency_name}</span>
                    {offer.agency.is_verified && (
                      <span className="ml-2 text-xl text-blue-500">
                        <MdVerified />
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>{t("message") || "Message"}:</strong>{" "}
                  {offer.message || t("no_message") || "No message provided."}
                </p>
                <p>
                  <strong>{t("status") || "Status"}:</strong>{" "}
                  <span
                    className={`capitalize ${
                      offer.status === "accepted"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    {t(offer.status) || offer.status}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="bg-gray-50 px-4 sm:px-6 py-3 flex justify-between items-center text-sm text-gray-500">
          <p>
            {t("posted_on") || "Posted on"}{" "}
            {new Date(
              tourData.offers?.[0]?.tour_plan?.created_at || Date.now()
            ).toLocaleString()}
          </p>
          <a
            href={tourData.spot_picture_url || placeholderImage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {t("view_full_image") || "View Full Image"}
          </a>
        </div> */}
      </div>
    </div>
  );
}