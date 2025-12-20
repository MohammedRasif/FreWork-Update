"use client";
import { GoArrowLeft } from "react-icons/go";
import { MdVerified } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import {
  useDeleteOfferPlanMutation,
  useFinalOfferSentMutation,
  useGetOfferedPlanQuery,
  useLikePostMutation,
} from "@/redux/features/withAuth";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

function AdminOfferPlan() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Offered Plans");
  const [offerBudgets, setOfferBudgets] = useState({});
  const [isLiked, setIsLiked] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [isConfirming, setIsConfirming] = useState({});
  const dropdownRefs = useRef({});
  const { data: offeredPlans, isLoading, isError } = useGetOfferedPlanQuery();
  const [deleteOfferPlan] = useDeleteOfferPlanMutation();
  const [finalOfferSent] = useFinalOfferSentMutation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((tourPlanId) => {
        if (
          dropdownRefs.current[tourPlanId] &&
          !dropdownRefs.current[tourPlanId].contains(event.target)
        ) {
          setIsDropdownOpen((prev) => ({ ...prev, [tourPlanId]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (offerId) => {
    setIsDeleting((prev) => ({ ...prev, [offerId]: true }));
    try {
      await deleteOfferPlan(offerId).unwrap();
      toast.success(t("offer_deleted_success"));
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error(t("failed_to_delete_offer"));
    } finally {
      setIsDeleting((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleConfirmDeal = (offerId) => {
    setSelectedOfferId(offerId);
    setIsPopupOpen(true);
  };

  const handleConfirmFinalOffer = async () => {
    if (!selectedOfferId) return;

    try {
      setIsConfirming((prev) => ({ ...prev, [selectedOfferId]: true }));

      await finalOfferSent(selectedOfferId).unwrap();

      toast.success(t("final_offer_sent_success"));
    } catch (error) {
      toast.error(t("failed_to_send_final_offer"));
    } finally {
      setIsConfirming((prev) => ({ ...prev, [selectedOfferId]: false }));
      setIsPopupOpen(false);
      setSelectedOfferId(null);
    }
  };

  const handleCancel = () => {
    setIsPopupOpen(false);
    setSelectedOfferId(null);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("loading")}
      </div>
    );
  if (isError || !offeredPlans || offeredPlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("no_plans_available")}
      </div>
    );
  }

  const tourPlansMap = offeredPlans.reduce((acc, offer) => {
    const tourPlanId = offer.tour_plan.id;
    if (!acc[tourPlanId]) {
      acc[tourPlanId] = {
        tourPlan: offer.tour_plan,
        offers: [],
      };
    }
    acc[tourPlanId].offers.push(offer);
    return acc;
  }, {});

  const tourPlans = Object.values(tourPlansMap);

  return (
    <div className="min-h-screen">
      <div className="flex">
        <div className="flex-1">
          {tourPlans.map(({ tourPlan, offers }) => {
            const startDate = new Date(tourPlan.start_date);
            const endDate = new Date(tourPlan.end_date);
            const duration =
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) +
              ` ${t("days")}`;

            const destination = t("tour_from_to", {
              from: tourPlan.location_from,
              to: tourPlan.location_to,
            });
            const formattedDate = startDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            });

            const interestedLocations = tourPlan.tourist_spots
              ? tourPlan.tourist_spots.split(",")
              : [t("no_specific_locations")];

            return (
              <div key={tourPlan.id} className="mb-6">
                <div className="bg-white rounded-t-lg border-x border-t border-gray-200">
                  <div className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 lg:pb-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                          {destination}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                          <p>
                            {t("willing_to_go_on")}{" "}
                            <span className="font-medium">{formattedDate}</span>
                          </p>
                          <p>
  <span>
    <span className="font-medium">{t("duration")}:</span>{" "}
    {duration
      ? `${parseInt(duration)} ${
          parseInt(duration) === 1 ? t("day") : t("days")
        }`
      : "N/A"}
  </span>
</p>

                          {/* <p>
                            {t("category")}:{" "}
                            <span className="font-medium">{tourPlan.category}</span>
                          </p> */}
                        </div>
                      </div>
                      <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0 relative">
                        <div>
                          <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                            {t("budget")} €{tourPlan.budget}
                          </p>
                          <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                            {t("total")} {tourPlan.total_members}{" "}
                            {tourPlan.total_members === 1
                              ? t("person")
                              : t("persons")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                        {tourPlan.description || t("no_description")}
                      </p>
                    </div>
                  </div>

                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 space-y-4 relative">
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={
                          tourPlan.spot_picture_url ||
                          "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                        }
                        alt={t("tour_destination")}
                        className="w-full h-48 sm:h-64 lg:h-72 object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-b-lg border-x border-b border-gray-200">
                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 space-y-4 py-3 sm:py-4 lg:py-6 border-t">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 lg:px-4 rounded-lg space-y-3 sm:space-y-0"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 lg:gap-4">
                          <img
                            src={
                              offer.agency.logo_url ||
                              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                            }
                            alt={`${offer.agency.agency_name} avatar`}
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base lg:text-base font-medium text-gray-900">
                                {offer.agency.agency_name}
                              </span>
                              {offer.agency.is_verified && (
                                <span className="text-blue-500">
                                  <MdVerified
                                    size={16}
                                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3 lg:gap-3">
                          <span className="text-base sm:text-lg lg:text-xl font-semibold">
                            €{offer.offered_budget}
                          </span>
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <NavLink to={`/admin/chat/${offer?.room_id}`}>
                              <button className="px-3 sm:px-5 py-2 sm:py-[5px] font-semibold bg-blue-500 text-white text-sm sm:text-[17px] rounded-md hover:bg-blue-600 hover:cursor-pointer transition-colors w-full sm:w-auto">
                                {t("start_conversation")}
                              </button>
                            </NavLink>
                            {!offer.is_final && (
                              <button
                                onClick={() => handleConfirmDeal(offer.id)}
                                className="px-3 sm:px-5 py-2 sm:py-[5px] font-semibold bg-green-500 text-white text-sm sm:text-[17px] rounded-md hover:bg-green-600 hover:cursor-pointer transition-colors w-full sm:w-auto"
                              >
                                {t("confirm_the_deal")}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(offer.id)}
                              disabled={isDeleting[offer.id]}
                              className={`px-3 sm:px-5 py-2 sm:py-[5px] font-semibold text-white text-sm sm:text-[17px] rounded-md hover:cursor-pointer transition-colors w-full sm:w-auto ${
                                isDeleting[offer.id]
                                  ? "bg-yellow-300 cursor-not-allowed"
                                  : "bg-yellow-500 hover:bg-yellow-600"
                              }`}
                            >
                              {isDeleting[offer.id]
                                ? t("deleting")
                                : t("no_agreement")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 backdrop-blur-[5px] bg-black/10 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#252c3b] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t("confirm_deal")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t("confirm_deal_message")}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmFinalOffer}
                disabled={isConfirming[selectedOfferId]}
                className={`px-4 py-2 text-white rounded-md transition-colors cursor-pointer ${
                  isConfirming[selectedOfferId]
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isConfirming[selectedOfferId] ? t("confirming") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOfferPlan;
