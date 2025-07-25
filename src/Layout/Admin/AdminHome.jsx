"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Share2, ThumbsUp, MessageCircle, X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useGetTourPlanPublicQuery } from "@/redux/features/baseApi";
import toast, { Toaster } from "react-hot-toast";
import {
  useLikePostMutation,
  useOfferBudgetMutation,
} from "@/redux/features/withAuth";
import AdminOfferPlan from "./AdminOfferPlan";
import AdminAcceptPlan from "./AdminAcceptPlan";

const token = localStorage.getItem("access_token");
const currentUserId = localStorage.getItem("user_id");

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("All Plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLiked, setIsLiked] = useState({});
  const [isShared, setIsShared] = useState({});
  const [likeCounts, setLikeCounts] = useState({}); // New state for like counts
  const [offerBudget, setOfferBudget] = useState(0);
  const [offerComment, setOfferComment] = useState("");
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const { data: tourPlanPublic = [], isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
    console.log(tourPlanPublic)
  const [interact, { isLoading: isInteractLoading }] = useLikePostMutation();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();

  // Initialize like, share, and like count states
  useEffect(() => {
    if (tourPlanPublic && currentUserId) {
      const initialLikes = {};
      const initialShares = {};
      const initialLikeCounts = {};
      tourPlanPublic.forEach((plan) => {
        initialLikes[plan.id] = plan.interactions?.some(
          (interaction) =>
            String(interaction.user) === String(currentUserId) &&
            interaction.interaction_type === "like"
        );
        initialShares[plan.id] = plan.interactions?.some(
          (interaction) =>
            String(interaction.user) === String(currentUserId) &&
            interaction.interaction_type === "share"
        );
        initialLikeCounts[plan.id] =
          plan.interactions?.filter(
            (interaction) => interaction.interaction_type === "like"
          ).length || 0;
      });
      setIsLiked(initialLikes);
      setIsShared(initialShares);
      setLikeCounts(initialLikeCounts);
    }
  }, [tourPlanPublic, currentUserId]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
        setSelectedPlan(null);
        setOfferBudget(0);
        setOfferComment("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter plans based on search query
  const filteredPlans = tourPlanPublic.filter((plan) =>
    plan.location_to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle like/unlike action
  const handleLike = async (planId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to like a plan");
      return;
    }

    const wasLiked = isLiked[planId];
    const optimisticLikeCounts = {
      ...likeCounts,
      [planId]: wasLiked ? likeCounts[planId] - 1 : likeCounts[planId] + 1,
    };
    const optimisticIsLiked = { ...isLiked, [planId]: !wasLiked };

    // Optimistically update UI
    setLikeCounts(optimisticLikeCounts);
    setIsLiked(optimisticIsLiked);

    // Update selectedPlan if open
    if (selectedPlan && selectedPlan.id === planId) {
      setSelectedPlan((prev) =>
        prev
          ? {
              ...prev,
              interactions: optimisticIsLiked[planId]
                ? [
                    ...prev.interactions.filter(
                      (i) =>
                        String(i.user) !== String(currentUserId) ||
                        i.interaction_type !== "like"
                    ),
                    { user: currentUserId, interaction_type: "like" },
                  ]
                : prev.interactions.filter(
                    (i) =>
                      String(i.user) !== String(currentUserId) ||
                      i.interaction_type !== "like"
                  ),
            }
          : prev
      );
    }

    try {
      await interact({
        id: planId,
        data: { interaction_type: "like" },
      }).unwrap();
      // toast.success(wasLiked ? "Unliked" : "Liked");
    } catch (error) {
      console.error("Failed to update like:", error);
      // Revert optimistic updates on failure
      setLikeCounts({ ...likeCounts, [planId]: likeCounts[planId] });
      setIsLiked({ ...isLiked, [planId]: wasLiked });
      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan((prev) =>
          prev
            ? {
                ...prev,
                interactions: wasLiked
                  ? [
                      ...prev.interactions,
                      { user: currentUserId, interaction_type: "like" },
                    ]
                  : prev.interactions.filter(
                      (i) =>
                        String(i.user) !== String(currentUserId) ||
                        i.interaction_type !== "like"
                    ),
              }
            : prev
        );
      }
      // toast.error("Failed to update like");
    }
  };

  // Handle share/unshare action
  const handleShare = async (planId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to share a plan");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/post?postid=${planId}`
      );
      await interact({
        id: planId,
        data: { interaction_type: "share" },
      }).unwrap();
      setIsShared((prev) => {
        const newIsShared = { ...prev, [planId]: !prev[planId] };
        if (selectedPlan && selectedPlan.id === planId) {
          setSelectedPlan((prev) =>
            prev
              ? {
                  ...prev,
                  interactions: newIsShared[planId]
                    ? [
                        ...prev.interactions.filter(
                          (i) =>
                            String(i.user) !== String(currentUserId) ||
                            i.interaction_type !== "share"
                        ),
                        { user: currentUserId, interaction_type: "share" },
                      ]
                    : prev.interactions.filter(
                        (i) =>
                          String(i.user) !== String(currentUserId) ||
                          i.interaction_type !== "share"
                      ),
                }
              : prev
          );
        }
        return newIsShared;
      });
      toast.success("Link copied and shared");
    } catch (error) {
      console.error("Failed to update share:", error);
      toast.error("Failed to share plan");
    }
  };

  // Handle offer submission
  const handleSubmitOffer = async (planId, budget, comment) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to submit an offer");
      return;
    }

    if (!budget || !comment.trim()) {
      toast.error("Please provide both a budget and a comment");
      return;
    }

    try {
      await offerBudgetToBack({
        id: planId,
        data: { offered_budget: parseFloat(budget), message: comment },
      }).unwrap();

      const newOffer = {
        id: currentUserId,
        offered_budget: parseFloat(budget),
        message: comment,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url: localStorage.getItem("user_image") || "/placeholder.svg",
          is_verified: false,
        },
      };

      if (selectedPlan && selectedPlan.id === planId) {
        setSelectedPlan((prev) =>
          prev
            ? {
                ...prev,
                offers: [...(prev.offers || []), newOffer],
                offer_count: (prev.offer_count || 0) + 1,
              }
            : prev
        );
      }

      setOfferBudget(0);
      setOfferComment("");
      toast.success("Offer submitted successfully");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error.data?.detail ||
          "Failed to submit offer. Only agencies can do this."
      );
    }
  };

  // Open/close popup
  const openPopup = (plan) => {
    setSelectedPlan({ ...plan, interactions: plan.interactions || [] });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlan(null);
    setOfferBudget(0);
    setOfferComment("");
  };

  // Calculate interaction counts
  const getInteractionCounts = (plan) => {
    const likeCount = likeCounts[plan.id] || 0;
    const shareCount =
      plan.interactions?.filter(
        (interaction) => interaction.interaction_type === "share"
      ).length || 0;
    return { likeCount, shareCount };
  };

  // Render content for different tabs
  const renderContent = () => {
    switch (activeTab) {
      case "All Plans":
        if (isTourPlanPublicLoading) {
          return (
            <div className="text-center text-gray-600">Loading plans...</div>
          );
        }
        if (!filteredPlans.length) {
          return (
            <div className="text-center text-gray-600">No plans found.</div>
          );
        }
        return filteredPlans.map((plan) => {
          const { likeCount, shareCount } = getInteractionCounts(plan);
          return (
            <div
              key={plan.id}
              className="rounded-lg bg-white shadow-sm border border-gray-200 mb-6"
            >
              <div className="p-3 sm:p-4 lg:p-6">
                {/* Travel Header */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                      {plan.location_to}
                    </h2>
                    <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                      <p>
                        Willing to go on{" "}
                        <span className="font-medium">{plan.start_date}</span>
                      </p>
                      <p>
                        Include:{" "}
                        <span className="font-medium">{plan.duration}</span>
                      </p>
                      <p>
                        Category:{" "}
                        <span className="font-medium">{plan.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                    <div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                        Budget ${plan.budget}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                        Total {plan.total_members} person
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Interested Travel Points */}
                {plan.tourist_spots && (
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-700">
                      Interested Travel Points:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {plan.tourist_spots.split(",").map((spot, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          {spot.trim()}
                          {index < plan.tourist_spots.split(",").length - 1 &&
                            ", "}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resort Image */}
                {plan.spot_picture_url && (
                  <div className="mb-4">
                    <img
                      src={plan.spot_picture_url || "/placeholder.svg"}
                      alt={`${plan.location_to} tourist spot`}
                      className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Social Stats */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                        <ThumbsUp className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 text-white fill-current" />
                      </div>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 bg-red-500 rounded-full flex items-center justify-center -ml-2">
                        <Heart className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 text-white fill-current" />
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-sm text-gray-600 ml-2">
                      {likeCount} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
                    <span>{plan.offer_count || 0} Offers</span>
                    <span>{shareCount} Shares</span>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 sm:gap-6 lg:gap-6 w-full justify-around lg:w-auto lg:justify-baseline">
                    <button
                      onClick={() => handleLike(plan.id)}
                      disabled={isInteractLoading}
                      className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                        isLiked[plan.id] ? "text-blue-600" : "text-gray-600"
                      } hover:text-blue-600 transition-colors`}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                          isLiked[plan.id] ? "fill-current" : ""
                        }`}
                      />
                      <span>{isLiked[plan.id] ? "Unlike" : "Like"}</span>
                    </button>
                    <button
                      onClick={() => openPopup(plan)}
                      className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                      <span>Offers</span>
                    </button>
                    <button
                      onClick={() => handleShare(plan.id)}
                      disabled={isInteractLoading}
                      className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                        isShared[plan.id] ? "text-blue-600" : "text-gray-600"
                      } hover:text-blue-600 transition-colors`}
                    >
                      <Share2
                        className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                          isShared[plan.id] ? "fill-current" : ""
                        }`}
                      />
                      <span>{isShared[plan.id] ? "Unshare" : "Share"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      case "Offered Plans":
        return <AdminOfferPlan />;
      case "Accepted Plans":
        return <AdminAcceptPlan />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <Toaster />
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="w-full lg:w-4/5">
          {/* Header */}
          <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Welcome,{" "}
              <span className="font-semibold">
                Choose perfect offer for you
              </span>
            </h1>
            {/* Search field */}
            {activeTab === "All Plans" && (
              <div className="relative w-full lg:max-w-[30vh]">
                <input
                  type="text"
                  placeholder="Search by Tour Location"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm lg:text-base text-gray-700 placeholder-gray-400 pr-8 sm:pr-10 lg:pr-10"
                />
                <svg
                  className="absolute right-2 sm:right-3 lg:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/5 p-3 sm:p-4 lg:p-6 lg:mt-[7.6vh] order-first lg:order-last">
          <div className="space-y-4 lg:space-y-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-4 lg:mb-6 text-center">
              My Board
            </h3>
            <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 overflow-x-auto lg:overflow-x-visible">
              <button
                onClick={() => setActiveTab("All Plans")}
                className={`flex-shrink-0 lg:w-full text-center px-3 sm:px-4 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "All Plans"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All Plans
              </button>
              <button
                onClick={() => setActiveTab("Offered Plans")}
                className={`flex-shrink-0 lg:w-full text-center px-3 sm:px-4 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "Offered Plans"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Offered Plans
              </button>
              <button
                onClick={() => setActiveTab("Accepted Plans")}
                className={`flex-shrink-0 lg:w-full text-center px-3 sm:px-4 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "Accepted Plans"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Accepted Plans
              </button>
            </div>
            <div className="pt-4 lg:pt-6">
              <p className="text-xs sm:text-sm lg:text-sm text-gray-900 font-semibold mb-2">
                Want to respond fast to get Tourist for "Free"?
              </p>
              <a
                href="#"
                className="text-xs sm:text-sm lg:text-sm text-blue-600 hover:underline"
              >
                Click here
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {isPopupOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Tour Details
              </h2>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-lg bg-white shadow-sm border border-gray-200">
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                        {selectedPlan.location_to}
                      </h2>
                      <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                        <p>
                          Willing to go on{" "}
                          <span className="font-medium">
                            {selectedPlan.start_date}
                          </span>
                        </p>
                        <p>
                          Include:{" "}
                          <span className="font-medium">
                            {selectedPlan.duration}
                          </span>
                        </p>
                        <p>
                          Category:{" "}
                          <span className="font-medium">
                            {selectedPlan.category}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                          Budget ${selectedPlan.budget}
                        </p>
                        <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                          Total {selectedPlan.total_members} person
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600">
                      Interested Travel Points:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPlan.tourist_spots ? (
                        selectedPlan.tourist_spots
                          .split(",")
                          .map((location, index) => (
                            <span
                              key={index}
                              className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                            >
                              {location.trim()}
                              {index <
                                selectedPlan.tourist_spots.split(",").length -
                                  1 && ", "}
                            </span>
                          ))
                      ) : (
                        <span className="text-xs sm:text-sm lg:text-sm text-gray-600">
                          None
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <img
                      src={selectedPlan.spot_picture_url || "/placeholder.svg"}
                      alt="Tour destination"
                      className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                          <ThumbsUp className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 text-white fill-current" />
                        </div>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 bg-red-500 rounded-full flex items-center justify-center -ml-2">
                          <Heart className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 text-white fill-current" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm lg:text-sm text-gray-600 ml-2">
                        {likeCounts[selectedPlan.id] || 0} Likes
                      </span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
                      <span>{selectedPlan.offer_count || 0} Offers</span>
                      <span>
                        {getInteractionCounts(selectedPlan).shareCount} Shares
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-6">
                      <button
                        onClick={() => handleLike(selectedPlan.id)}
                        disabled={isInteractLoading}
                        className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                          isLiked[selectedPlan.id]
                            ? "text-blue-600"
                            : "text-gray-600"
                        } hover:text-blue-600 transition-colors`}
                      >
                        <ThumbsUp
                          className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                            isLiked[selectedPlan.id] ? "fill-current" : ""
                          }`}
                        />
                        <span>
                          {isLiked[selectedPlan.id] ? "Unlike" : "Like"}
                        </span>
                      </button>
                      <button
                        onClick={() => openPopup(selectedPlan)}
                        className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                        <span>Offers</span>
                      </button>
                      <button
                        onClick={() => handleShare(selectedPlan.id)}
                        disabled={isInteractLoading}
                        className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                          isShared[selectedPlan.id]
                            ? "text-blue-600"
                            : "text-gray-600"
                        } hover:text-blue-600 transition-colors`}
                      >
                        <Share2
                          className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                            isShared[selectedPlan.id] ? "fill-current" : ""
                          }`}
                        />
                        <span>
                          {isShared[selectedPlan.id] ? "Unshare" : "Share"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-start sm:flex-row items-start gap-3 p-2 sm:p-4 rounded-lg">
                    <div className="text-gray-600 sm:mt-0 w-fit md:mt-8">
                      <img
                        src={
                          localStorage.getItem("user_image") ||
                          "https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443124/samples/smile.jpg"
                        }
                        alt="User avatar"
                        className="rounded-full w-10 h-10 sm:w-11 sm:h-11"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-lg sm:text-xl font-medium text-gray-700 mb-2">
                        Place your offer
                      </p>
                      <div className="flex flex-col gap-3">
                        <input
                          type="number"
                          placeholder="Enter your budget"
                          value={offerBudget}
                          onChange={(e) => setOfferBudget(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                        <textarea
                          placeholder="Enter your comment"
                          value={offerComment}
                          onChange={(e) => setOfferComment(e.target.value)}
                          className="w-full resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          rows="4"
                        />
                        <button
                          onClick={() =>
                            handleSubmitOffer(
                              selectedPlan.id,
                              offerBudget,
                              offerComment
                            )
                          }
                          className={`px-3 py-2 font-medium rounded-md transition-colors flex items-center gap-3 justify-center ${
                            offerBudget && offerComment.trim()
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!offerBudget || !offerComment.trim()}
                        >
                          <IoIosSend size={24} />
                          <span>Submit Offer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
