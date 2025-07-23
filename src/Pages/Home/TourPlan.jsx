"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { ThumbsUp, Heart, MessageCircle, Share2, Menu, X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { MdVerified } from "react-icons/md";
import {
  useFilterTourPlanPublicQuery,
  useGetTourPlanPublicQuery,
} from "@/redux/features/baseApi";
import { debounce } from "lodash";
import FullScreenInfinityLoader from "@/lib/Loading";
import { useNavigate } from "react-router-dom";
import {
  useAcceptOfferMutation,
  useLikePostMutation,
  useOfferBudgetMutation,
} from "@/redux/features/withAuth";
import toast, { Toaster } from "react-hot-toast";

const token = localStorage.getItem("access_token");
const currentUserId = localStorage.getItem("user_id");

const TourPlanWithPopup = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [isLiked, setIsLiked] = useState({});
  const [isShared, setIsShared] = useState({});
  const [offerBudget, setOfferBudget] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [expandedOffers, setExpandedOffers] = useState({});
  const [tours, setTours] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedOfferMessages, setExpandedOfferMessages] = useState({}); // New state for offer messages
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    min: "",
    max: "",
    country: "",
    category: "",
  });
  const [offerComment, setOfferComment] = useState("");

  // Utility function to truncate text to a specified word limit
  const truncateText = (text, wordLimit = 100) => {
    if (!text) return { truncated: "", isTruncated: false };
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    return {
      truncated: words.slice(0, wordLimit).join(" ") + "...",
      isTruncated: true,
    };
  };

  // Toggle description expansion
  const toggleDescription = (tourId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  // Toggle offer message expansion
  const toggleOfferMessage = (offerId) => {
    setExpandedOfferMessages((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));
  };

  // RTK Queries
  const { data: tourPlanPublic, isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
  const { data: filteredTourPlan, isLoading: isFilteredLoading } =
    useFilterTourPlanPublicQuery(filters, {
      skip:
        !filters.search &&
        !filters.min &&
        !filters.max &&
        !filters.country &&
        !filters.category,
    });
  const [interact, { isLoading: isInteractLoading }] = useLikePostMutation();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] =
    useAcceptOfferMutation();

  // Initialize tours and like/share status
  useEffect(() => {
    const data = filteredTourPlan || tourPlanPublic || [];
    setTours(data);
    if (data && currentUserId) {
      const initialLikes = {};
      const initialShares = {};
      data.forEach((tour) => {
        initialLikes[tour.id] = tour.interactions.some(
          (interaction) =>
            String(interaction.user) === String(currentUserId) &&
            interaction.interaction_type === "like"
        );
        initialShares[tour.id] = tour.interactions.some(
          (interaction) =>
            String(interaction.user) === String(currentUserId) &&
            interaction.interaction_type === "share"
        );
      });
      setIsLiked(initialLikes);
      setIsShared(initialShares);
    }
  }, [tourPlanPublic, filteredTourPlan, currentUserId]);

  // Debounced filter change
  const debouncedFilterChange = useCallback(
    debounce((name, value) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }, 500),
    []
  );

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (name, value) => {
    debouncedFilterChange(name, value);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const openPopup = (tour) => {
    setSelectedTour(tour);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedTour(null);
  };

  const toggleOffers = (tourId) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  const handleSubmitOffer = async (tourId, budget, comment) => {
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
      const response = await offerBudgetToBack({
        id: tourId,
        data: { offered_budget: parseFloat(budget), message: comment },
      }).unwrap();

      const newOffer = {
        id: response?.id || `temp-${Date.now()}`,
        offered_budget: parseFloat(budget),
        message: comment,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url: localStorage.getItem("user_image") || "/placeholder.svg",
          is_verified: false,
        },
      };

      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === tourId
            ? {
                ...tour,
                offers: [...(tour.offers || []), newOffer],
                offer_count: (tour.offer_count || 0) + 1,
              }
            : tour
        )
      );

      if (selectedTour && selectedTour.id === tourId) {
        setSelectedTour((prev) =>
          prev
            ? {
                ...prev,
                offers: [...(prev.offers || []), newOffer],
                offer_count: (prev.offer_count || 0) + 1,
              }
            : prev
        );
      }

      setOfferBudget("");
      setOfferComment("");
      toast.success("Offer submitted successfully");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error?.data?.error
          ? `${error.data.error} Only agency can do this.`
          : "Something went wrong"
      );
    }
  };

  const handleLike = async (tourId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await interact({
        id: tourId,
        data: { interaction_type: "like" },
      }).unwrap();
      setIsLiked((prev) => {
        const newIsLiked = { ...prev, [tourId]: !prev[tourId] };
        setTours((prevTours) =>
          prevTours.map((tour) =>
            tour.id === tourId
              ? {
                  ...tour,
                  interactions: newIsLiked[tourId]
                    ? [
                        ...tour.interactions.filter(
                          (i) =>
                            String(i.user) !== String(currentUserId) ||
                            i.interaction_type !== "like"
                        ),
                        { user: currentUserId, interaction_type: "like" },
                      ]
                    : tour.interactions.filter(
                        (i) =>
                          String(i.user) !== String(currentUserId) ||
                          i.interaction_type !== "like"
                      ),
                }
              : tour
          )
        );
        if (selectedTour && selectedTour.id === tourId) {
          setSelectedTour((prev) =>
            prev
              ? {
                  ...prev,
                  interactions: newIsLiked[tourId]
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
        return newIsLiked;
      });
    } catch (error) {
      console.error("Failed to update like:", error);
    }
  };

  const handleShare = async (tourId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/post?postid=${tourId}`
      );
      toast.success("Post link is copied");

      await interact({
        id: tourId,
        data: { interaction_type: "share" },
      }).unwrap();

      setIsShared((prev) => {
        const newIsShared = { ...prev, [tourId]: !prev[tourId] };
        setTours((prevTours) =>
          prevTours.map((tour) =>
            tour.id === tourId
              ? {
                  ...tour,
                  interactions: newIsShared[tourId]
                    ? [
                        ...tour.interactions.filter(
                          (i) =>
                            String(i.user) !== String(currentUserId) ||
                            i.interaction_type !== "share"
                        ),
                        { user: currentUserId, interaction_type: "share" },
                      ]
                    : tour.interactions.filter(
                        (i) =>
                          String(i.user) !== String(currentUserId) ||
                          i.interaction_type !== "share"
                      ),
                }
              : tour
          )
        );
        if (selectedTour && selectedTour.id === tourId) {
          setSelectedTour((prev) =>
            prev
              ? {
                  ...prev,
                  interactions: newIsShared[tourId]
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
    } catch (error) {
      console.error("Failed to update share:", error);
      toast.error("Failed to copy link or update share");
    }
  };

  const acceptOfferHandler = async (offerId, tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to accept an offer");
      return;
    }

    try {
      await acceptOffer(offerId).unwrap();
      setTours((prevTours) => prevTours.filter((tour) => tour.id !== tourId));

      if (selectedTour && selectedTour.id === tourId) {
        setIsPopupOpen(false);
        setSelectedTour(null);
      }

      toast.success("Offer accepted successfully");
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error(error.data?.detail || "Failed to accept offer");
    }
  };

  const getInteractionCounts = (tour) => {
    const likeCount = tour.interactions.filter(
      (interaction) => interaction.interaction_type === "like"
    ).length;
    const shareCount = tour.interactions.filter(
      (interaction) => interaction.interaction_type === "share"
    ).length;
    return { likeCount, shareCount };
  };

  const displayTours = tours;

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 pb-20 roboto">
      <Toaster />
      <div className="px-2 sm:px-4 lg:px-6">
        <button
          className="md:hidden flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200"
          onClick={toggleMobileFilter}
        >
          <Menu size={18} />
          <span>Filters</span>
        </button>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="w-full md:w-3/4 lg:w-4/5 order-2 md:order-1">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-600 mb-2 sm:mb-0">
                  Published Tour Plans
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-auto">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                    >
                      <option value="">Select a category</option>
                      <option value="adventure">Adventure</option>
                      <option value="cultural">Cultural</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="historical">Historical</option>
                      <option value="beach">Beach</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="romantic">Romantic</option>
                    </select>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-64"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-md font-medium">
                All posted tour plans are here
              </p>
            </div>

            <div className="space-y-6 mb-6">
              {isTourPlanPublicLoading || isFilteredLoading ? (
                <div>
                  <FullScreenInfinityLoader />
                </div>
              ) : displayTours && displayTours.length > 0 ? (
                displayTours.map((tour) => {
                  const { likeCount, shareCount } = getInteractionCounts(tour);
                  const { truncated, isTruncated } = truncateText(
                    tour.description,
                    100
                  );
                  return (
                    <div
                      key={tour.id}
                      className="rounded-lg bg-white shadow-sm border border-gray-200"
                    >
                      <div className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                          <div className="flex-1">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                              {tour.location_to}
                            </h2>
                            <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                              <p>
                                Willing to go on{" "}
                                <span className="font-medium">
                                  {tour.start_date}
                                </span>
                              </p>
                              <p>
                                Include:{" "}
                                <span className="font-medium">
                                  {tour.duration}
                                </span>
                              </p>
                              <p>
                                Category:{" "}
                                <span className="font-medium">
                                  {tour.category}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0 relative">
                            <div>
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                                Budget ${tour.budget}
                              </p>
                              <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                                Total {tour.total_members} person
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                            {expandedDescriptions[tour.id]
                              ? tour.description
                              : truncated}
                            {isTruncated && !expandedDescriptions[tour.id] && (
                              <button
                                onClick={() => toggleDescription(tour.id)}
                                className="text-blue-600 hover:underline text-sm ml-1"
                              >
                                See More
                              </button>
                            )}
                            {isTruncated && expandedDescriptions[tour.id] && (
                              <button
                                onClick={() => toggleDescription(tour.id)}
                                className="text-blue-600 hover:underline text-sm ml-1"
                              >
                                Show Less
                              </button>
                            )}
                          </p>
                        </div>

                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-700">
                            Interested Travel Points:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {tour.tourist_spots ? (
                              tour.tourist_spots
                                .split(",")
                                .map((location, index) => (
                                  <span
                                    key={index}
                                    className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                  >
                                    {location.trim()}
                                    {index <
                                      tour.tourist_spots.split(",").length - 1 &&
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
                            src={tour.spot_picture_url || "/placeholder.svg"}
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
                              {likeCount} Likes
                            </span>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
                            <span>{tour.offer_count} Offers</span>
                            <span>{shareCount} Shares</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4 sm:gap-6 lg:gap-6 w-full justify-around lg:w-auto lg:justify-baseline">
                            <button
                              onClick={() => handleLike(tour.id)}
                              disabled={isInteractLoading}
                              className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                                isLiked[tour.id]
                                  ? "text-blue-600"
                                  : "text-gray-600"
                              } hover:text-blue-600 transition-colors hover:cursor-pointer`}
                            >
                              <ThumbsUp
                                className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                                  isLiked[tour.id] ? "fill-current" : ""
                                }`}
                              />
                              <span>{isLiked[tour.id] ? "Unlike" : "Like"}</span>
                            </button>
                            <button
                              onClick={() => openPopup(tour)}
                              className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                              <span>Comments</span>
                            </button>
                            <button
                              onClick={() => handleShare(tour.id)}
                              disabled={isInteractLoading}
                              className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                                isShared[tour.id]
                                  ? "text-gray-600"
                                  : "text-gray-600"
                              } hover:text-blue-600 transition-colors`}
                            >
                              <Share2
                                className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                                  isShared[tour.id] ? "fill-current" : ""
                                }`}
                              />
                              <span>
                                {isShared[tour.id] ? "Share" : "Share"}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-4">
                          {tour.offers
                            .slice(
                              0,
                              expandedOffers[tour.id] ? tour.offers.length : 3
                            )
                            .map((offer) => {
                              const { truncated, isTruncated } = truncateText(
                                offer.message,
                                30
                              );
                              return (
                                <div
                                  key={offer.id}
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                                    <img
                                      src={
                                        offer.agency.logo_url ||
                                        "/placeholder.svg"
                                      }
                                      alt={`${offer.agency.agency_name} avatar`}
                                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                          {offer.agency.agency_name}
                                        </span>
                                        {offer.agency.is_verified && (
                                          <div className="flex space-x-1">
                                            <span className="text-blue-500">
                                              <MdVerified
                                                size={20}
                                                className="sm:w-6 sm:h-6"
                                              />
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-600">
                                        {expandedOfferMessages[offer.id]
                                          ? offer.message
                                          : truncated}
                                        {isTruncated &&
                                          !expandedOfferMessages[offer.id] && (
                                            <button
                                              onClick={() =>
                                                toggleOfferMessage(offer.id)
                                              }
                                              className="text-blue-600 hover:underline text-sm ml-1"
                                            >
                                              See More
                                            </button>
                                          )}
                                        {isTruncated &&
                                          expandedOfferMessages[offer.id] && (
                                            <button
                                              onClick={() =>
                                                toggleOfferMessage(offer.id)
                                              }
                                              className="text-blue-600 hover:underline text-sm ml-1"
                                            >
                                              Show Less
                                            </button>
                                          )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-lg sm:text-xl">
                                        💰 ${offer.offered_budget}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {}}
                                        className="px-3 hover:cursor-pointer sm:px-5 py-1.5 sm:py-2 bg-[#3776E2] text-white text-sm sm:text-md rounded-md hover:bg-blue-700 transition-colors"
                                      >
                                        Message
                                      </button>
                                      {tour.user ==
                                        localStorage.getItem("user_id") && (
                                        <button
                                          onClick={() =>
                                            acceptOfferHandler(offer.id, tour.id)
                                          }
                                          disabled={isAcceptLoading}
                                          className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                                            isAcceptLoading
                                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                              : "bg-[#3776E2] text-white hover:bg-blue-700"
                                          }`}
                                        >
                                          Accept
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          {tour.offers.length > 3 && (
                            <button
                              onClick={() => toggleOffers(tour.id)}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {expandedOffers[tour.id] ? "Show Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>No tours found</div>
              )}
            </div>
          </div>

          <div
            className={`w-full md:w-1/4 lg:w-1/5 order-1 md:order-2 lg:mt-24 ${
              isMobileFilterOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  className="md:hidden text-gray-500"
                  onClick={toggleMobileFilter}
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="search to available plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price range (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.min}
                      onChange={(e) =>
                        handleFilterChange("min", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.max}
                      onChange={(e) =>
                        handleFilterChange("max", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Country
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                    value={filters.country}
                    onChange={(e) =>
                      handleFilterChange("country", e.target.value)
                    }
                  >
                    <option value="">Select a country</option>
                    <option value="thailand">Thailand</option>
                    <option value="india">India</option>
                    <option value="malaysia">Malaysia</option>
                    <option value="singapore">Singapore</option>
                    <option value="japan">Japan</option>
                    <option value="indonesia">Indonesia</option>
                    <option value="vietnam">Vietnam</option>
                    <option value="sri_lanka">Sri Lanka</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Destination
                  </label>
                  <input
                    type="text"
                    placeholder="search destination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && selectedTour && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="w-full">
                <div className="rounded-lg bg-white shadow-sm border border-gray-200">
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                          {selectedTour.location_to}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                          <p>
                            Willing to go on{" "}
                            <span className="font-medium">
                              {selectedTour.start_date}
                            </span>
                          </p>
                          <p>
                            Include:{" "}
                            <span className="font-medium">
                              {selectedTour.duration}
                            </span>
                          </p>
                          <p>
                            Category:{" "}
                            <span className="font-medium">
                              {selectedTour.category}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0 relative">
                        <div>
                          <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                            Budget ${selectedTour.budget}
                          </p>
                          <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                            Total {selectedTour.total_members} person
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                        {expandedDescriptions[selectedTour.id]
                          ? selectedTour.description
                          : truncateText(selectedTour.description, 100).truncated}
                        {truncateText(selectedTour.description, 100)
                          .isTruncated &&
                          !expandedDescriptions[selectedTour.id] && (
                            <button
                              onClick={() => toggleDescription(selectedTour.id)}
                              className="text-blue-600 hover:underline text-sm ml-1"
                            >
                              See More
                            </button>
                          )}
                        {truncateText(selectedTour.description, 100)
                          .isTruncated &&
                          expandedDescriptions[selectedTour.id] && (
                            <button
                              onClick={() => toggleDescription(selectedTour.id)}
                              className="text-blue-600 hover:underline text-sm ml-1"
                            >
                              Show Less
                            </button>
                          )}
                      </p>
                    </div>
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600">
                        Interested Travel Points:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTour.tourist_spots ? (
                          selectedTour.tourist_spots
                            .split(",")
                            .map((location, index) => (
                              <span
                                key={index}
                                className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                              >
                                {location.trim()}
                                {index <
                                  selectedTour.tourist_spots.split(",").length -
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
                        src={
                          selectedTour.spot_picture_url || "/placeholder.svg"
                        }
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
                          {getInteractionCounts(selectedTour).likeCount} Likes
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
                        <span>{selectedTour.offer_count} Offers</span>
                        <span>
                          {getInteractionCounts(selectedTour).shareCount} Shares
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 sm:gap-6 lg:gap-6">
                        <button
                          onClick={() => handleLike(selectedTour.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                            isLiked[selectedTour.id]
                              ? "text-blue-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                              isLiked[selectedTour.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>
                            {isLiked[selectedTour.id] ? "Unlike" : "Like"}
                          </span>
                        </button>
                        <button
                          className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          <span>Comments</span>
                        </button>
                        <button
                          onClick={() => handleShare(selectedTour.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                            isShared[selectedTour.id]
                              ? "text-gray-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                        >
                          <Share2
                            className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                              isShared[selectedTour.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>
                            {isShared[selectedTour.id] ? "Share" : "Share"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      {selectedTour.offers
                        .slice(
                          0,
                          expandedOffers[selectedTour.id]
                            ? selectedTour.offers.length
                            : 3
                        )
                        .map((offer) => {
                          const { truncated, isTruncated } = truncateText(
                            offer.message,
                            30
                          );
                          return (
                            <div
                              key={offer.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                                <img
                                  src={
                                    offer.agency.logo_url || "/placeholder.svg"
                                  }
                                  alt={`${offer.agency.agency_name} avatar`}
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">
                                      {offer.agency.agency_name}
                                    </span>
                                    {offer.agency.is_verified && (
                                      <div className="flex space-x-1">
                                        <span className="text-blue-500">
                                          <MdVerified
                                            size={20}
                                            className="sm:w-6 sm:h-6"
                                          />
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {expandedOfferMessages[offer.id]
                                      ? offer.message
                                      : truncated}
                                    {isTruncated &&
                                      !expandedOfferMessages[offer.id] && (
                                        <button
                                          onClick={() =>
                                            toggleOfferMessage(offer.id)
                                          }
                                          className="text-blue-600 hover:underline text-sm ml-1"
                                        >
                                          See More
                                        </button>
                                      )}
                                    {isTruncated &&
                                      expandedOfferMessages[offer.id] && (
                                        <button
                                          onClick={() =>
                                            toggleOfferMessage(offer.id)
                                          }
                                          className="text-blue-600 hover:underline text-sm ml-1"
                                        >
                                          Show Less
                                        </button>
                                      )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lg sm:text-xl">
                                    💰 ${offer.offered_budget}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {}}
                                    className="px-3 hover:cursor-pointer sm:px-5 py-1.5 sm:py-2 bg-[#3776E2] text-white text-sm sm:text-md rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    Message
                                  </button>
                                  {selectedTour.user ==
                                    localStorage.getItem("user_id") && (
                                    <button
                                      onClick={() =>
                                        acceptOfferHandler(
                                          offer.id,
                                          selectedTour.id
                                        )
                                      }
                                      disabled={isAcceptLoading}
                                      className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                                        isAcceptLoading
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                          : "bg-[#3776E2] text-white hover:bg-blue-700"
                                      }`}
                                    >
                                      Accept
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {selectedTour.offers.length > 3 && (
                        <button
                          onClick={() => toggleOffers(selectedTour.id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {expandedOffers[selectedTour.id]
                            ? "Show Less"
                            : "See More"}
                        </button>
                      )}
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
                                selectedTour.id,
                                offerBudget,
                                offerComment
                              )
                            }
                            className={`px-3 py-2 font-medium rounded-md transition-colors flex items-center gap-3 justify-center cursor-pointer ${
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
        </div>
      )}
    </div>
  );
};

export default TourPlanWithPopup;