"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
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
  const [modalType, setModalType] = useState("view"); // "view" or "offer"
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLiked, setIsLiked] = useState({});
  const [isShared, setIsShared] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [offerBudget, setOfferBudget] = useState(0);
  const [offerComment, setOfferComment] = useState("");
  const [offerForm, setOfferForm] = useState({
    applyDiscount: false,
    discount: "",
  });
  const popupRef = useRef(null);
  const navigate = useNavigate();

  const { data: tourPlanPublic = [], isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
  const [interact, { isLoading: isInteractLoading }] = useLikePostMutation();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();

  // Initialize like, share, and like count states
  // useEffect(() => {
  //   if (tourPlanPublic && currentUserId) {
  //     const initialLikes = {};
  //     const initialShares = {};
  //     const initialLikeCounts = {};
  //     tourPlanPublic.forEach((plan) => {
  //       initialLikes[plan.id] = plan.interactions?.some(
  //         (interaction) =>
  //           String(interaction.user) === String(currentUserId) &&
  //           interaction.interaction_type === "like"
  //       );
  //       initialShares[plan.id] = plan.interactions?.some(
  //         (interaction) =>
  //           String(interaction.user) === String(currentUserId) &&
  //           interaction.interaction_type === "share"
  //       );
  //       initialLikeCounts[plan.id] =
  //         plan.interactions?.filter(
  //           (interaction) => interaction.interaction_type === "like"
  //         ).length || 0;
  //     });
  //     setIsLiked(initialLikes);
  //     setIsShared(initialShares);
  //     setLikeCounts(initialLikeCounts);
  //   }
  // }, [tourPlanPublic, currentUserId]);

  // Force re-render of selectedPlan when likeCounts change
  useEffect(() => {
    if (selectedPlan) {
      setSelectedPlan((prev) => ({ ...prev }));
    }
  }, [likeCounts]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
        setSelectedPlan(null);
        setOfferBudget(0);
        setOfferComment("");
        setOfferForm({ applyDiscount: false, discount: "" });
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
    } catch (error) {
      console.error("Failed to update like:", error);
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

  // Handle offer form changes
  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle offer submission
  const handleSubmitOffer = async (planId, budget, comment) => {
    if (!token) {
      toast.error("Please log in to submit an offer");
      return;
    }

    if (!budget || !comment.trim()) {
      toast.error("Please provide both a budget and a comment");
      return;
    }

    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || offerForm.discount <= 0)
    ) {
      toast.error("Please provide a valid discount percentage");
      return;
    }

    try {
      const offerData = {
        offered_budget: Number.parseFloat(budget),
        message: comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? Number.parseFloat(offerForm.discount)
          : 0,
      };

      await offerBudgetToBack({
        id: planId,
        data: offerData,
      }).unwrap();

      const newOffer = {
        id: `${currentUserId}-${Date.now()}`,
        offered_budget: Number.parseFloat(budget),
        message: comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? Number.parseFloat(offerForm.discount)
          : 0,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url:
            localStorage.getItem("user_image") ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
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
      setOfferForm({ applyDiscount: false, discount: "" });
      toast.success("Offer submitted successfully");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error.data?.error ||
          "Failed to submit offer. Only agencies can do this."
      );
    }
  };

  // Open/close popup
  const openPopup = (plan, type = "view") => {
    setSelectedPlan({
      ...plan,
      interactions: plan.interactions || [],
      offers: plan.offers || [],
    });
    setModalType(type);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlan(null);
    setModalType("view");
    setOfferBudget(0);
    setOfferComment("");
    setOfferForm({ applyDiscount: false, discount: "" });
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
              className="rounded-lg bg-white shadow-sm border border-gray-200 mb-6  mx-auto"
            >
              <div className=" ">
                <div className="flex justify-between">
                  <div className=" flex ">
                    <div>
                      {/* Resort Image */}
                      <div>
                        <img
                          src={
                            plan.spot_picture_url
                              ? plan.spot_picture_url
                              : "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                          }
                          alt={`${plan.location_to || "Tourist spot"}`}
                          className="lg:h-44 lg:w-56 object-cover rounded-l-lg mr-5"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 mt-5">
                          {plan.location_to}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                          <p>
                            Dates:{" "}
                            <span className="font-medium">
                              {plan.start_date} —{" "}
                              {plan.end_date || plan.start_date}
                            </span>
                          </p>
                          <p>
                            Total members:{" "}
                            <span className="font-medium">
                              {plan.total_members}
                            </span>
                          </p>
                          <p>
                            Category:{" "}
                            <span className="font-medium">{plan.category}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Travel Header */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0 mt-5 mr-3">
                    <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                      <div>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                          Budget ${plan.budget}.00
                        </p>
                        <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                          {plan.total_members} person
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => {
                            // Handle deal closed action
                            toast.success("Deal marked as closed");
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          Deal closed
                        </button>
                        <button
                          onClick={() => openPopup(plan, "view")}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openPopup(plan, "offer")}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          Send offer
                        </button>
                        <button
                          onClick={() => {
                            // Handle decline request action
                            toast.success("Request declined");
                          }}
                          className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Decline request
                        </button>
                      </div>
                    </div>
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

  const renderModalContent = () => {
    if (modalType === "view") {
      return (
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
                            selectedPlan.tourist_spots.split(",").length - 1 &&
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
              <div className="mb-4">
                <img
                  src={
                    selectedPlan.spot_picture_url ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                  }
                  alt="Tour destination"
                  className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (modalType === "offer") {
      return (
        <div className="p-4">
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
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="applyDiscount"
                    id="applyDiscount"
                    checked={offerForm.applyDiscount}
                    onChange={handleOfferChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 lg:text-md text-gray-700">
                    Apply an additional discount
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  The site automatically suggests to visitors to request an
                  additional discount, increasing conversions by 30%. If you
                  want to offer more, do so by checking this.
                </p>
              </div>
              <div className="mt-4 mb-2">
                <label
                  htmlFor="discount"
                  className="block lg:text-md font-medium text-gray-700 mb-1"
                >
                  Discount
                </label>
                <input
                  type="number"
                  name="discount"
                  id="discount"
                  value={offerForm.discount}
                  onChange={handleOfferChange}
                  placeholder="Enter discount percentage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={!offerForm.applyDiscount}
                />
              </div>
              <button
                onClick={() =>
                  handleSubmitOffer(selectedPlan.id, offerBudget, offerComment)
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
          {selectedPlan.offers && selectedPlan.offers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Offers
              </h3>
              {selectedPlan.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-gray-200 mb-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <img
                      src={offer.agency.logo_url || "/placeholder.svg"}
                      alt={`${offer.agency.agency_name} avatar`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        {offer.agency.agency_name}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {offer.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg sm:text-xl">
                      ${offer.offered_budget}
                    </span>
                    {offer.apply_discount && offer.discount > 0 && (
                      <span className="text-sm text-green-600">
                        ({offer.discount}% off)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen">
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

      {isPopupOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div
            ref={popupRef}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalType === "view" ? "Tour Details" : "Send Offer"}
              </h2>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
