"use client";
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
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PlanImage1 from "@/assets/img/plan-image-1.png";

function AdminDecline() {
  const { t } = useTranslation();
  const { data: declineData = [], isLoading: isDeclineLoading } =
    useDeclineOfferQuery();
  const [restore, { isLoading: isRestoreLoading }] = useRestoreMutation();

  const handleRestore = async (id) => {
    try {
      await restore(id).unwrap();
      toast.success(t("plan_restored_success"));
    } catch (error) {
      toast.error(
        error?.data?.error || error?.data?.message || t("failed_to_restore")
      );
    }
  };

  if (isDeclineLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm font-medium text-[#617082]" role="status">
        {t("loading_declined_plans")}
      </div>
    );
  }

  if (!declineData.length) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center text-base font-semibold text-[#172b43] shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
        {t("no_declined_plans")}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">

      {declineData.map((plan) => (
        <div
          key={plan.id}
          className="overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]"
        >
          <div className="p-3 sm:p-4 lg:p-6 ">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-bold tracking-tight text-[#172b43] sm:text-2xl">
                  {plan.tour_plan.location_to}
                </h2>
                <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                  <div>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaLocationDot className="w-6 h-5 text-gray-900 size-4" />
                      <span>
                        <span className="font-medium">
                          {t("points_of_travel")}:
                        </span>{" "}
                        {plan.tour_plan.tourist_spots || t("none")}
                      </span>
                    </p>
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaLocationArrow className="w-6 h-5 text-gray-900" />
                      <span>
                        <span className="font-medium">
                          {t("departure_from")}:
                        </span>{" "}
                        {plan.tour_plan.location_from || t("na")}
                      </span>
                    </p>
                    {/* <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaList className="w-6 h-5 text-gray-900" />
                      <span>
                        <span className="font-medium">
                          {t("minimum_rating")}:
                        </span>{" "}
                        {plan.tour_plan.minimum_star_hotel || t("na")}
                      </span>
                    </p> */}
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <MdOutlineNoMeals className="w-6 h-5 text-gray-900" />
                      {/* <span>
                        <span className="font-medium">{t("meal_plan")}:</span>{" "}
                        {plan.tour_plan.meal_plan || t("na")}
                      </span> */}
                      <span>
                        <span className="font-medium">{t("meal_plan")}:</span>{" "}
                        {plan.tour_plan.meal_plan === "breakfast"
                          ? t("breakfast")
                          : plan.tour_plan.meal_plan === "half-board"
                          ? t("half_board")
                          : plan.tour_plan.meal_plan === "full-board"
                          ? t("full_board")
                          : "N/A"}
                      </span>
                    </p>
                    <div className="flex gap-2 pb-2">
                      <p className="text-md text-gray-600 flex items-center gap-2">
                        <IoBed className="w-6 h-5 text-gray-900" />

                        <span>
                          <span className="font-medium">
                            {t("type_of_accommodation")}:
                          </span>{" "}
                          {plan.tour_plan.type_of_accommodation === "hotel"
                            ? t("hotel")
                            : plan.tour_plan.type_of_accommodation === "resort"
                            ? t("resort")
                            : plan.tour_plan.type_of_accommodation ===
                              "homestay"
                            ? t("homestay")
                            : plan.tour_plan.type_of_accommodation ===
                              "apartment"
                            ? t("apartment")
                            : plan.tour_plan.type_of_accommodation === "hostel"
                            ? t("hostel")
                            : "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2">
                        {plan.tour_plan.minimum_star_hotel
                          ? "⭐".repeat(
                              Number(plan.tour_plan.minimum_star_hotel)
                            )
                          : t("na")}
                      </p>
                    </div>
                    {/* <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <FaClock className="w-6 h-5 text-gray-900" />
                      <span>
                        <span className="font-medium">{t("duration")}:</span>{" "}
                        {plan.tour_plan.duration || t("na")}
                      </span>
                    </p> */}
                    <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                      <MdVerifiedUser className="w-7 h-6 text-green-500" />
                      <span>
                        <span className="font-medium">
                          {t("contact_verified_via_email")}
                        </span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                <div>
                  <p className="flex items-center text-lg font-bold text-[#172b43]">
                    {t("budget")} <FaEuroSign /> {plan.tour_plan.budget}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                    {t("total")} {plan.tour_plan.total_members}{" "}
                    {plan.tour_plan.total_members === 1
                      ? t("person")
                      : t("persons")}
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
                {t("interested_travel_points")}:
              </p>
              <div className="flex flex-wrap gap-1">
                {plan.tour_plan.tourist_spots ? (
                  plan.tour_plan.tourist_spots
                    .split(",")
                    .map((location, index) => (
                      <span
                        key={index}
                        className="text-xs sm:text-sm lg:text-sm font-medium text-[#DD9E2C] hover:underline cursor-pointer"
                      >
                        {location.trim()}
                        {index <
                          plan.tour_plan.tourist_spots.split(",").length - 1 &&
                          ", "}
                      </span>
                    ))
                ) : (
                  <span className="text-xs sm:text-sm lg:text-sm text-gray-600">
                    {t("none")}
                  </span>
                )}
              </div>
            </div>
            <div className="relative mb-4 overflow-hidden rounded-[16px] bg-[#f4eee4]">
              <img
                src={plan.tour_plan.spot_picture_url || PlanImage1}
                onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
                alt={t("tour_destination")}
                className="h-48 w-full object-cover sm:h-64"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleRestore(plan.id)}
                disabled={isRestoreLoading}
                className={`min-h-10 rounded-xl px-5 text-sm font-bold text-white transition-colors ${
                  isRestoreLoading
                    ? "cursor-not-allowed bg-[#d0d6dc]"
                    : "bg-[#c88f2a] hover:bg-[#ad751c]"
                }`}
              >
                {isRestoreLoading ? t("restoring") : t("restore")}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDecline;
