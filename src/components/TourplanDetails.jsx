import { useGetOneTourPlanQuery } from "@/redux/features/withAuth";
import { Verified, VerifiedIcon, X } from "lucide-react";
import { MdVerified } from "react-icons/md";

export default function TourPlanDetails({ id, closeModal }) {
  const { data: tourData, isLoading, isError } = useGetOneTourPlanQuery(id);

  // Helper function to format date range
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
      return "TBD";
    }
  };

  // Placeholder image if none is provided
  const placeholderImage =
    "https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443119/samples/landscapes/nature-mountains.jpg";

  // Handle loading state
  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-600 animate-pulse">
        Loading...
      </div>
    );
  }

  // Handle error or no data state
  if (isError || !tourData) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading tour plan details.
      </div>
    );
  }

  // Check if there are offers
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
            Tour to {tourData.location_to}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Posted by User {tourData.name} ·{" "}
            {new Date(
              tourData.offers[0]?.tour_plan.created_at || Date.now()
            ).toLocaleDateString()}
          </p>

          {/* Tour Plan Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tour Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <p>
                <strong>Route:</strong> {tourData.location_from} to{" "}
                {tourData.location_to}
              </p>
              <p>
                <strong>Dates:</strong>{" "}
                {formatDateRange(tourData.start_date, tourData.end_date)}
              </p>
              <p>
                <strong>Members:</strong> {tourData.total_members}
              </p>
             <p>
  <strong>Budget:</strong> €{Number(tourData.budget).toLocaleString()}
</p>

              <p>
                <strong>Duration:</strong> {tourData.duration} days
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`capitalize ${
                    tourData.status === "accepted"
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {tourData.status}
                </span>
              </p>
              <div className="sm:col-span-2">
                <p>
                  <strong>Description:</strong>{" "}
                  {tourData.description || "No description provided."}
                </p>
                 <p className="pt-5">
                  <strong>Email:</strong>{" "}
                  {tourData.email || "No description provided."}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p>
                  <strong>Phone:</strong>{" "}
                  {tourData.phone_number || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          {offer && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Accepted Offer
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
                  {/* <p className="text-xs text-gray-500">
                    Agency ID: {offer.agency.id}
                  </p> */}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {/* <p>
                  <strong>Offered Budget:</strong> ${offer?.offers?.[0]?.offered_budget}
                </p> */}
                <p>
                  <strong>Message:</strong>{" "}
                  {offer.message || "No message provided."}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`capitalize ${
                      offer.status === "accepted"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  >
                    {offer.status}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Interactions */}
          {/* <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Interactions
            </h3>
            <div className="flex space-x-6 text-sm text-gray-600">
              <p>
                <strong>👍 Likes:</strong> {tourData.like_count}
              </p>
              <p>
                <strong>❤️ Loves:</strong> {tourData.love_count}
              </p>
              <p>
                <strong>🔗 Shares:</strong> {tourData.share_count}
              </p>
            </div>
            {tourData.interactions && tourData.interactions.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <p>
                  <strong>Recent Interactions:</strong>
                </p>
                <ul className="list-disc pl-5 mt-1">
                  {tourData.interactions.slice(0, 3).map((interaction) => (
                    <li key={interaction.id}>
                      {interaction.interaction_type} by User {interaction.user}{" "}
                      on {new Date(interaction.created_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div> */}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 flex justify-between items-center text-sm text-gray-500">
          <p>
            Posted on{" "}
            {new Date(
              tourData.offers[0]?.tour_plan.created_at || Date.now()
            ).toLocaleString()}
          </p>
          <a
            href={tourData.spot_picture_url || placeholderImage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Full Image
          </a>
        </div>
      </div>
    </div>
  );
}
