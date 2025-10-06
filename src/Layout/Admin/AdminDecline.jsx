import {
  useDeclineOfferQuery,
  useRestoreMutation,
} from "@/redux/features/withAuth";
import React from "react";
import {
  FaClock,
  FaEuroSign,
  FaList,
  FaLocationArrow,
  FaLocationDot,
} from "react-icons/fa6";
import { MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

function AdminDecline() {
  const { data: declineData = [], isLoading: isDeclineLoading } =
    useDeclineOfferQuery();
  const [restore, { isLoading: isRestoreLoading }] = useRestoreMutation();
  console.log(declineData);

  const handleRestore = async (id) => {
    try {
      await restore(id).unwrap();
      toast.success("Plan restored successfully");
    } catch (error) {
      console.error("Failed to restore plan:", error);

      console.error("Error details:", error?.data || error.message);
      toast.error(
        error?.data?.error || error?.data?.message || "Failed to restore plan"
      );
    }
  };

  if (isDeclineLoading) {
    return (
      <div className="text-center text-gray-600 py-8">
        Loading declined plans...
      </div>
    );
  }

  if (!declineData.length) {
    return (
      <div className="text-center text-gray-600 py-8">
        No declined plans yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      {declineData.map((plan) => (
        <div
          key={plan.id}
          className="rounded-lg bg-white shadow-sm border border-gray-200 mx-auto max-w-4xl"
        >
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                  {plan.tour_plan.location_to}
                </h2>
                <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                  <div>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaLocationDot className="w-6 h-5 text-gray-500 size-4" />
                      <span>
                        <span className="font-medium">Points of travel:</span>{" "}
                        {plan.tour_plan.tourist_spots || "None"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaLocationArrow className="w-6 h-5 text-gray-500" />
                      <span>
                        <span className="font-medium">Departure from:</span>{" "}
                        {plan.tour_plan.location_from || "N/A"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaList className="w-6 h-5 text-gray-500" />
                      <span>
                        <span className="font-medium">Minimum rating:</span>{" "}
                        {plan.tour_plan.minimum_star_hotel || "N/A"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <MdOutlineNoMeals className="w-6 h-5 text-gray-500" />
                      <span>
                        <span className="font-medium">Meal plan:</span>{" "}
                        {plan.tour_plan.meal_plan || "N/A"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <IoBed className="w-6 h-5 text-gray-500" />
                      <span>
                        <span className="font-medium">
                          Type of accommodation:
                        </span>{" "}
                        {plan.tour_plan.type_of_accommodation || "N/A"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaClock className="w-6 h-5 text-gray-500" />
                      <span>
                        <span className="font-medium">Duration:</span>{" "}
                        {plan.tour_plan.duration || "N/A"}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <MdVerifiedUser className="w-7 h-6 text-green-500" />
                      <span>
                        <span className="font-medium">
                          Contact verified via email
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                <div>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 flex items-center">
                    Budget <FaEuroSign /> {plan.tour_plan.budget}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                    Total {plan.tour_plan.total_members} person
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                {plan.tour_plan.description}
              </p>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600">
                Interested Travel Points:
              </p>
              <div className="flex flex-wrap gap-1">
                {plan.tour_plan.tourist_spots ? (
                  plan.tour_plan.tourist_spots
                    .split(",")
                    .map((location, index) => (
                      <span
                        key={index}
                        className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        {location.trim()}
                        {index <
                          plan.tour_plan.tourist_spots.split(",").length - 1 &&
                          ", "}
                      </span>
                    ))
                ) : (
                  <span className="text-xs sm:text-sm lg:text-sm text-gray-600">
                    None
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4 relative">
              <img
                src={
                  plan.tour_plan.spot_picture_url ||
                  "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                }
                alt="Tour destination"
                className="w-full h-48 sm:h-36 lg:h-72 object-cover rounded-lg"
              />
              <h1 className="text-[20px] lg:left-64 left-5 absolute top-2 font-semibold text-white">
                Image generated automatically
              </h1>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleRestore(plan.id)}
                disabled={isRestoreLoading}
                className={`px-4 py-2 text-white font-medium rounded-md transition-colors ${
                  isRestoreLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isRestoreLoading ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDecline;
