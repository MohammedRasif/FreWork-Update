"use client";
import { GoArrowLeft } from "react-icons/go";
import { MdVerified } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, ThumbsUp, LoaderCircle } from "lucide-react";
import {
  useDeleteOfferPlanMutation,
  useFinalOfferSentMutation,
  useGetOfferedPlanQuery,
  useLikePostMutation,
  useGetChatListQuery,
  useInviteToChatMutation,
} from "@/redux/features/withAuth";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n.js";
import PlanImage1 from "@/assets/img/plan-image-1.png";


function AdminOfferPlan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Offered Plans");
  const [offerBudgets, setOfferBudgets] = useState({});
  const [isLiked, setIsLiked] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const [isDeleting, setIsDeleting] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [isConfirming, setIsConfirming] = useState({});
  const [isStartingChat, setIsStartingChat] = useState({});
  const dropdownRefs = useRef({});
  const { data: offeredPlans, isLoading, isError } = useGetOfferedPlanQuery();
  const { data: chatList, refetch: refetchChatList } = useGetChatListQuery(undefined, {
    pollingInterval: 3000,
  });
  const [deleteOfferPlan] = useDeleteOfferPlanMutation();
  const [finalOfferSent] = useFinalOfferSentMutation();
  const [inviteToChat] = useInviteToChatMutation();

  // Modified by takmim: Direct navigation to specific conversation for tour plan/tourist
  const handleStartConversation = async (tourPlan, offer) => {
    if (!tourPlan) return;

    // 1. Check existing conversations in chatList
    let targetChat = null;
    if (Array.isArray(chatList) && chatList.length > 0) {
      if (offer?.room_id) {
        targetChat = chatList.find((c) => String(c.id) === String(offer.room_id));
      }
      if (!targetChat && offer?.id) {
        targetChat = chatList.find((c) => String(c.offer_id) === String(offer.id));
      }
      if (!targetChat && tourPlan?.id) {
        targetChat = chatList.find((c) => String(c.tour_plan_id) === String(tourPlan.id));
      }
    }

    if (targetChat) {
      navigate(`/agentie/mesaje/${targetChat.id}`, {
        state: {
          agency: {
            id: String(targetChat.id),
            name: targetChat.other_participant_name || t("unknown_user"),
            image: targetChat.other_participant_image || null,
            other_user_id: targetChat.other_user_id || null,
            tour_plan_id: targetChat.tour_plan_id || tourPlan.id,
            tour_plan_title: targetChat.tour_plan_title || tourPlan.location_to || t("no_tour_plan"),
            is_archived: targetChat.is_archived || false,
          },
        },
      });
      return;
    }

    // 2. If offer?.room_id exists and is valid, navigate with matching state
    if (offer?.room_id && offer.room_id !== "undefined" && offer.room_id !== "null") {
      navigate(`/agentie/mesaje/${offer.room_id}`, {
        state: {
          agency: {
            id: String(offer.room_id),
            name: t("unknown_user"),
            image: null,
            tour_plan_id: tourPlan.id,
            tour_plan_title: tourPlan.location_to || t("no_tour_plan"),
            is_archived: false,
          },
        },
      });
      return;
    }

    // 3. Initiate conversation with tourist if not found
    const touristId =
      tourPlan?.user?.id ||
      tourPlan?.user_id ||
      tourPlan?.tourist_id ||
      tourPlan?.tourist?.id ||
      (typeof tourPlan?.user === "number" ||
      (typeof tourPlan?.user === "string" && !tourPlan?.user.includes("@") && !isNaN(Number(tourPlan.user)))
        ? Number(tourPlan.user)
        : null) ||
      offer?.tourist_id ||
      offer?.user_id ||
      offer?.tourist?.id;

    const offerKey = offer?.id || tourPlan.id;
    setIsStartingChat((prev) => ({ ...prev, [offerKey]: true }));

    try {
      const payload = {
        tour_plan_id: Number(tourPlan.id),
      };
      if (touristId) {
        payload.other_user_id = touristId;
      }
      if (offer?.id) {
        payload.offer_id = offer.id;
      }

      const res = await inviteToChat(payload).unwrap();
      const newChatId = res?.id || res?.conversation_id || res?.room_id || res?.chat_id;

      if (refetchChatList) {
        refetchChatList();
      }

      if (newChatId) {
        navigate(`/agentie/mesaje/${newChatId}`, {
          state: {
            agency: {
              id: String(newChatId),
              name: tourPlan.user?.name || t("unknown_user"),
              image: null,
              other_user_id: touristId || null,
              tour_plan_id: tourPlan.id,
              tour_plan_title: tourPlan.location_to || t("no_tour_plan"),
              is_archived: false,
            },
          },
        });
      } else {
        navigate("/agentie/mesaje");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      try {
        const refreshed = await refetchChatList();
        const found = (refreshed?.data || []).find(
          (c) => String(c.tour_plan_id) === String(tourPlan.id) || String(c.offer_id) === String(offer?.id)
        );
        if (found) {
          navigate(`/agentie/mesaje/${found.id}`, {
            state: {
              agency: {
                id: String(found.id),
                name: found.other_participant_name || t("unknown_user"),
                image: found.other_participant_image || null,
                other_user_id: found.other_user_id || touristId || null,
                tour_plan_id: found.tour_plan_id || tourPlan.id,
                tour_plan_title: found.tour_plan_title || tourPlan.location_to || t("no_tour_plan"),
                is_archived: found.is_archived || false,
              },
            },
          });
          return;
        }
      } catch (_) {}

      toast.error(error?.data?.detail || error?.data?.error || t("failed_to_initiate_chat"));
    } finally {
      setIsStartingChat((prev) => ({ ...prev, [offerKey]: false }));
    }
  };

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
      if (selectedOfferId) {
        localStorage.setItem(`final_offer_sent_offer_${selectedOfferId}`, "true");
      }
      refetchChatList?.();

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
      <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm font-medium text-[#617082]" role="status">
        {t("loading")}
      </div>
    );
  if (isError || !offeredPlans || offeredPlans.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center text-base font-semibold text-[#172b43] shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
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
    <div className="min-w-0">
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
            const formattedDate = startDate.toLocaleDateString(i18n.language === "ro" ? "ro-RO" : "ru-RU", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
            });

            const interestedLocations = tourPlan.tourist_spots
              ? tourPlan.tourist_spots.split(",")
              : [t("no_specific_locations")];

            return (
              <article key={tourPlan.id} className="mb-5 overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]">
                <div className="bg-white">
                  <div className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 lg:pb-4">
                    <div className="mb-4 flex flex-col gap-3">
                      <div className="min-w-0">
                        <h2 className="mb-2 break-words text-xl font-bold tracking-tight text-[#172b43] sm:text-2xl">
                          {destination}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                          <p>
                            {t("willing_to_go_on")}{" "}
                            <span className="font-medium">{formattedDate}</span>
                          </p>
                              {/* <p>
                                <span>
                                  <span className="font-medium">{t("duration")}:</span>{" "}
                                  {duration
                                    ? `${parseInt(duration)} ${
                                        parseInt(duration) === 1 ? t("day") : t("days")
                                      }`
                                    : "N/A"}
                                </span>
                              </p> */}

                          {/* <p>
                            {t("category")}:{" "}
                            <span className="font-medium">{tourPlan.category}</span>
                          </p> */}
                        </div>
                      </div>
                      <div className="relative flex items-start justify-between">
                        <div>
                          <p className="text-lg font-bold text-[#172b43]">
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
                    <div className="overflow-hidden rounded-[16px] bg-[#f4eee4]">
                      <img
                        src={tourPlan.spot_picture_url || PlanImage1}
                        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
                        alt={t("tour_destination")}
                        className="h-48 w-full object-cover sm:h-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f0eee9] bg-white">
                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 space-y-4 py-3 sm:py-4 lg:py-6 border-t">
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="flex flex-col gap-3 rounded-xl border border-[#f0eee9] bg-[#faf9f6] p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 lg:gap-4">
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#172b43] text-sm font-bold text-white">
                            {(offer.agency?.agency_name || "A").charAt(0).toUpperCase()}
                            {offer.agency?.logo_url && <img src={offer.agency.logo_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={`${offer.agency.agency_name} avatar`} className="absolute inset-0 h-full w-full object-cover" />}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base lg:text-base font-medium text-gray-900">
                                {offer.agency.agency_name}
                              </span>
                              {offer.agency.is_verified && (
                                <span className="text-[#DD9E2C]">
                                  <MdVerified
                                    size={16}
                                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                          <span className="text-base sm:text-lg lg:text-xl font-semibold">
                            €{offer.offered_budget}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartConversation(tourPlan, offer)}
                              disabled={isStartingChat[offer?.id || tourPlan.id]}
                              className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#d8dfe5] bg-white px-4 text-sm font-bold text-[#172b43] transition-colors hover:bg-[#f7f3ec] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isStartingChat[offer?.id || tourPlan.id] ? (
                                <>
                                  <LoaderCircle size={16} className="animate-spin text-[#c88f2a]" />
                                  <span>{t("loading")}</span>
                                </>
                              ) : (
                                t("start_conversation")
                              )}
                            </button>
                            {!offer.is_final && (
                              <button
                                onClick={() => handleConfirmDeal(offer.id)}
                                className="min-h-10 rounded-xl bg-[#c88f2a] px-4 text-sm font-bold text-white transition-colors hover:bg-[#ad751c]"
                              >
                                {t("confirm_the_deal")}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(offer.id)}
                              disabled={isDeleting[offer.id]}
                              className={`min-h-10 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                                isDeleting[offer.id]
                                  ? "cursor-not-allowed border-[#e9e6e0] bg-[#f1f0ed] text-[#8b99a7]"
                                  : "border-[#d8dfe5] bg-white text-[#617082] hover:bg-[#fff3ee] hover:text-[#9d4635]"
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
              </article>
            );
          })}
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/55 p-4">
          <div className="w-full max-w-md rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_24px_70px_rgba(16,36,58,0.25)]">
            <h2 className="mb-4 text-lg font-bold text-[#172b43]">
              {t("confirm_deal")}
            </h2>
            <p className="mb-6 text-sm leading-6 text-[#617082]">
              {t("confirm_deal_message")}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="min-h-10 cursor-pointer rounded-xl border border-[#d8dfe5] bg-white px-4 text-sm font-semibold text-[#172b43] transition-colors hover:bg-[#f7f3ec]"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmFinalOffer}
                disabled={isConfirming[selectedOfferId]}
                className={`min-h-10 cursor-pointer rounded-xl px-4 text-sm font-bold text-white transition-colors ${
                  isConfirming[selectedOfferId]
                    ? "cursor-not-allowed bg-[#d0d6dc]"
                    : "bg-[#c88f2a] hover:bg-[#ad751c]"
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
