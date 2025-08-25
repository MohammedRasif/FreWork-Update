"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { HiDotsVertical } from "react-icons/hi";
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  Menu,
  X,
  MapPin,
  Navigation,
} from "lucide-react";
import { IoCheckmarkCircleSharp, IoPersonSharp } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import {
  useFilterTourPlanPublicQuery,
  useGetTourPlanPublicQuery,
} from "@/redux/features/baseApi";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import {
  useAcceptOfferMutation,
  useInviteToChatMutation,
  useLikePostMutation,
  useOfferBudgetMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import toast, { Toaster } from "react-hot-toast";
import { IoIosSend } from "react-icons/io";

// Temporary fallback for FullScreenInfinityLoader
const FullScreenInfinityLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const token = localStorage.getItem("access_token");
const currentUserId = localStorage.getItem("user_id");

const TourPlanDouble = () => {
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
  const [expandedOfferMessages, setExpandedOfferMessages] = useState({});
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
  const [tourPlanPublicUser, setTourPlanPublicUser] = useState({});
  const [offerForm, setOfferForm] = useState({
    applyDiscount: false,
    discount: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when component mounts
  }, []);

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const truncateText = (text, wordLimit = 10) => {
    if (!text || typeof text !== "string") {
      return { truncated: "", isTruncated: false };
    }
    const words = text.split(/\s+/).filter(Boolean); // Remove empty strings
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    return {
      truncated: words.slice(0, wordLimit).join(" ") + "...",
      isTruncated: true,
    };
  };

  const toggleDescription = (tourId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  const toggleOfferMessage = (offerId) => {
    setExpandedOfferMessages((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));
  };

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
  const { data: userData, isLoading } = useShowUserInpormationQuery();
  const [invite, { isLoading: isInviteLoading }] = useInviteToChatMutation();

  useEffect(() => {
    const data = filteredTourPlan || tourPlanPublic || [];
    setTours(data);
    if (data && currentUserId) {
      const initialLikes = {};
      const initialShares = {};
      const tourUsers = {};
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
        tourUsers[tour.id] = tour.user;
      });
      setIsLiked(initialLikes);
      setIsShared(initialShares);
      setTourPlanPublicUser(tourUsers);
    }
  }, [tourPlanPublic, filteredTourPlan, currentUserId]);

  const debouncedFilterChange = useCallback(
    debounce((name, value) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }, 500),
    []
  );

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

    if (offerForm.applyDiscount && !offerForm.discount) {
      toast.error(
        "Please provide a discount percentage if discount is applied"
      );
      return;
    }

    try {
      const payload = {
        offered_budget: parseFloat(budget),
        message: comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? parseFloat(offerForm.discount)
          : null,
      };

      const response = await offerBudgetToBack({
        id: tourId,
        data: payload,
      }).unwrap();

      const newOffer = {
        id: response?.id || `temp-${Date.now()}`,
        offered_budget: parseFloat(budget),
        message: comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? parseFloat(offerForm.discount)
          : null,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url:
            localStorage.getItem("user_image") ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
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
      setOfferForm({ applyDiscount: false, discount: "" });
      toast.success("Offer submitted successfully");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error?.data?.detail
          ? `${error.data.detail} Only agency can do this.`
          : "Something went wrong"
      );
    }
  };

  const handleLike = async (tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to like the post");
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
      toast.error("Failed to update like");
    }
  };

  const handleShare = async (tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to share the post");
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/post?postid=${tourId}`
      );
      toast.success("Post link copied to clipboard");
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

  const handleMessage = async (data) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to send a message");
      return;
    }
    const role = localStorage.getItem("role");
    try {
      await invite(data).unwrap();
      toast.success("Chat initiated successfully");
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error(error.data?.detail || "Failed to initiate chat");
    }
  };

  const displayTours = tours;

  return (
    <div className=" bg-gray-50 p-3 sm:p-4 md:p-6 pb-20 roboto">
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
                      <option value="beach">Beach trips</option>
                      <option value="mountain">Mountain adventures</option>
                      <option value="desert">Relaxing tours</option>
                      <option value="island">Group packages</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isTourPlanPublicLoading || isFilteredLoading ? (
                <div className="col-span-full">
                  <FullScreenInfinityLoader />
                </div>
              ) : displayTours && displayTours.length > 0 ? (
                displayTours.map((tour) => {
                  const { likeCount, shareCount } = getInteractionCounts(tour);
                  const { truncated, isTruncated } = truncateText(
                    tour.description,
                    100
                  );
                  const hasMaxOffers = tour.offer_count >= 3;
                  const role = localStorage.getItem("role");
                  const showSentOfferButton = !token || role === "agency";

                  const handleSentOfferClick = () => {
                    if (!token) {
                      navigate("/login");
                      toast.error("Please log in to submit an offer");
                      return;
                    }
                    if (hasMaxOffers) {
                      toast.error(
                        "Sorry, this post already has 3 offers submitted."
                      );
                    } else {
                      openPopup(tour);
                    }
                  };

                  return (
                    <div
                      key={tour.id}
                      className="rounded-lg bg-white shadow-sm border  border-gray-200 mb-6"
                    >
                      <div className="relative ">
                        <div className="aspect-[4/3] overflow-hidden  ">
                          <img
                            src={
                              tour.spot_picture_url ||
                              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                            }
                            alt={`${tour.location_to} destination`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white">
                            <h2 className="text-2xl md:text-4xl font-bold text-center px-4 mb-2">
                              {tour.location_to}
                            </h2>
                            <p className="text-sm md:text-base opacity-90 italic">
                              Drone Shot
                            </p>
                          </div>
                          {tour.offers && tour.offers.length > 0 && (
                            <div className="absolute bottom-4 flex flex-col items-center space-y-3 overflow-y-auto px-2 scrollbar-none">
                              {tour.offers.map((offer) => (
                                <img
                                  key={offer.id}
                                  src={
                                    offer.agency?.logo_url ||
                                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                  }
                                  alt={`${
                                    offer.agency?.agency_name ||
                                    "Unknown Agency"
                                  } logo`}
                                  className="w-16 h-16 object-contain rounded-full border border-white bg-white flex-shrink-0"
                                />
                              ))}
                            </div>
                          )}
                          {tour.offer_count < 3 ? (
                            <div></div>
                          ) : (
                            <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                              <IoCheckmarkCircleSharp
                                className="mr-1"
                                size={16}
                              />
                              Offers completed
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="lg:text-3xl text-2xl font-bold text-gray-900">
                            {tour.location_to}
                          </h3>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm text-green-600 font-medium">
                              Real Request
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-md text-gray-700">
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {tour.start_date} to {tour.end_date || "N/A"} (
                            {tour.duration || "N/A"})
                          </p>
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {tour.travel_type || tour.category || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            Budget: ${tour.budget}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-md text-gray-700">
                            <span className="font-medium">Total:</span>{" "}
                            {tour.total_members}{" "}
                            {tour.total_members > 1 ? "people" : "person"}
                          </span>
                        </div>

                        <div>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MapPin className="w-6 h-5 text-gray-500" />
                            <span>
                              <span className="font-medium">
                                Points of travel:
                              </span>{" "}
                              {tour.tourist_spots || "None"}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <Navigation className="w-6 h-5 text-gray-500" />
                            <span>
                              <span className="font-medium">
                                Departure from:
                              </span>{" "}
                              {tour.location_from || "N/A"}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <IoPersonSharp className="w-6 h-5 text-gray-500" />
                            <span>
                              <span className="font-medium">
                                Contact verified via email
                              </span>
                            </span>
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="text-md text-gray-600 leading-relaxed">
                            {expandedDescriptions[tour.id]
                              ? tour.description || "No description available"
                              : truncateText(tour.description).truncated}
                            {truncateText(tour.description).isTruncated &&
                              !expandedDescriptions[tour.id] && (
                                <button
                                  onClick={() => toggleDescription(tour.id)}
                                  className="text-blue-600 hover:underline text-sm ml-1"
                                >
                                  See More
                                </button>
                              )}
                            {truncateText(tour.description).isTruncated &&
                              expandedDescriptions[tour.id] && (
                                <button
                                  onClick={() => toggleDescription(tour.id)}
                                  className="text-blue-600 hover:underline text-sm ml-1"
                                >
                                  Show Less
                                </button>
                              )}
                          </p>
                        </div>

                        {showSentOfferButton && (
                          <div className="pt-2 w-full">
                            <button
                              onClick={handleSentOfferClick}
                              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-md"
                            >
                              Sent Offer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">No tours found</div>
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
                  <X size={18} />
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                              {selectedTour.travel_type ||
                                selectedTour.category ||
                                "N/A"}
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
                          : truncateText(selectedTour.description, 100)
                              .truncated}
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
                          selectedTour.spot_picture_url ||
                          "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
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
                          onClick={() => openPopup(selectedTour)}
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
                      {isLoading ? (
                        <div>Loading user data...</div>
                      ) : (
                        selectedTour.offers
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
                            return userData?.user_id &&
                              offer?.agency?.user &&
                              tourPlanPublicUser[selectedTour.id] &&
                              (userData.user_id === offer.agency.user ||
                                userData.user_id ===
                                  tourPlanPublicUser[selectedTour.id]) ? (
                              <div
                                key={offer.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                                  <img
                                    src={
                                      offer.agency?.logo_url ||
                                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                    }
                                    alt={`${
                                      offer.agency?.agency_name ||
                                      "Unknown Agency"
                                    } avatar`}
                                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">
                                        {offer.agency?.agency_name}
                                      </span>
                                      {offer.agency?.is_verified && (
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
                                      onClick={() => {
                                        if (!token) {
                                          navigate("/login");
                                        } else {
                                          const userId = selectedTour.user;
                                          if (userId) {
                                            handleMessage({
                                              other_user_id: userId,
                                            });
                                          } else {
                                            console.error(
                                              "User ID not found in selectedTour"
                                            );
                                          }
                                        }
                                      }}
                                      className="flex items-center space-x-2 bg-[#3776E2] text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors w-full sm:w-auto hover:cursor-pointer"
                                      aria-label={`Message ${
                                        offer.agency?.agency_name || "Agency"
                                      }`}
                                    >
                                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span className="text-sm sm:text-base font-medium">
                                        Message
                                      </span>
                                    </button>
                                    {selectedTour.user ===
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
                            ) : null;
                          })
                      )}
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
                              The site automatically suggests to visitors to
                              request an additional discount, increasing
                              conversions by 30%. If you want to offer more, do
                              so by checking this.
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
                              handleSubmitOffer(
                                selectedTour.id,
                                offerBudget,
                                offerComment
                              )
                            }
                            className={`px-3 py-2 font-medium rounded-md transition-colors flex items-center gap-3 justify-center cursor-pointer ${
                              offerBudget &&
                              offerComment.trim() &&
                              (!offerForm.applyDiscount || offerForm.discount)
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={
                              !offerBudget ||
                              !offerComment.trim() ||
                              (offerForm.applyDiscount && !offerForm.discount)
                            }
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

export default TourPlanDouble;
