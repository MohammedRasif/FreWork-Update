import { GoArrowLeft } from "react-icons/go";
import { MdVerified } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import {
  useDeletePublishPlanMutation,
  useGetPlansQuery,
  useGetPublicisResponseQuery,
  useInviteToChatMutation,
  useLikePostMutation,
  useOfferBudgetMutation,
} from "@/redux/features/withAuth";
import FullScreenInfinityLoader from "@/lib/Loading";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { X } from "lucide-react";
import { ToastContainer } from "react-toastify";

const token = localStorage.getItem("access_token");
const currentUserId = localStorage.getItem("user_id");

function PublishedPlan() {
  const { data: posts, isLoading, isError } = useGetPlansQuery();
  console.log(posts, "posts");
  const [activeTab, setActiveTab] = useState("Offered Plans");
  const [offerBudget, setOfferBudget] = useState("");
  const [offerComment, setOfferComment] = useState("");
  const [isLiked, setIsLiked] = useState({});
  const [isShared, setIsShared] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [expandedOfferMessages, setExpandedOfferMessages] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [interact, { isLoading: isInteractLoading }] = useLikePostMutation();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [deletePublishPlan, { isLoading: isDeletePublishPlan }] =
    useDeletePublishPlanMutation();
  const { data: showResponseData, isLoading: isResponseLoading } =
    useGetPublicisResponseQuery(selectedUserId, {
      skip: !selectedUserId,
    });
  console.log(showResponseData, "showResponseData");
  const [invite, { isLoading: isInviteLoading, isError: isInviteError }] =
    useInviteToChatMutation();

  const truncateText = (text, wordLimit = 30) => {
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

  const toggleOfferMessage = (offerId) => {
    setExpandedOfferMessages((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }));
  };

  useEffect(() => {
    if (posts && currentUserId) {
      const initialLikes = {};
      const initialShares = {};
      posts.forEach((plan) => {
        initialLikes[plan.id] =
          plan.interactions?.some(
            (interaction) =>
              String(interaction.user) === String(currentUserId) &&
              interaction.interaction_type === "like"
          ) || false;
        initialShares[plan.id] =
          plan.interactions?.some(
            (interaction) =>
              String(interaction.user) === String(currentUserId) &&
              interaction.interaction_type === "share"
          ) || false;
      });
      setIsLiked(initialLikes);
      setIsShared(initialShares);
    }
  }, [posts, currentUserId]);

  const handleLike = async (tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to like a post");
      return;
    }

    try {
      await interact({
        id: tourId,
        data: { interaction_type: "like" },
      }).unwrap();
      setIsLiked((prev) => ({
        ...prev,
        [tourId]: !prev[tourId],
      }));
    } catch (error) {
      console.error("Failed to update like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleMessage = async (data) => {
    const role = localStorage.getItem("role");
    console.log(data); // Debug log for the data being sent
    if (!role) {
      navigate("/login");
      toast.error("Please log in to send a message");
      return;
    }

    try {
      await invite({ ...data, other_user_id: data.other_user_id }).unwrap(); // Ensure data structure matches API expectation
      toast.success("Chat invitation sent successfully!");
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Invite to chat error:", error);
      toast.error(error?.data?.detail || "Failed to send chat invitation");
    }
  };

  const handleShare = async (tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to share a post");
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

      setIsShared((prev) => ({
        ...prev,
        [tourId]: !prev[tourId],
      }));
    } catch (error) {
      console.error("Failed to update share:", error);
      toast.error("Failed to copy link or update share");
    }
  };

  const openPopup = (tour) => {
    setSelectedTour(tour);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedTour(null);
    setOfferBudget("");
    setOfferComment("");
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

      toast.success("Offer submitted successfully");
      setOfferBudget("");
      setOfferComment("");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(error.data?.detail || "Failed to submit offer");
    }
  };

  const getInteractionCounts = (plan) => {
    const likeCount =
      plan.interactions?.filter(
        (interaction) => interaction.interaction_type === "like"
      ).length || 0;
    const shareCount =
      plan.interactions?.filter(
        (interaction) => interaction.interaction_type === "share"
      ).length || 0;
    return { likeCount, shareCount };
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResponseClick = (offer, userId) => {
    setSelectedAgency(offer);
    setSelectedUserId(userId);
    setShowAgencyModal(true);
    setShowReviews(false);
    console.log(offer, userId, "offer and userId");
  };

  const handleReviewsClick = () => {
    setShowReviews(!showReviews);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-500">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) return <FullScreenInfinityLoader />;
  if (isError)
    return (
      <div className="text-center text-red-600 text-base sm:text-lg">
        Error loading plans
      </div>
    );

  const publishedPlans = posts
    ? posts.filter((plan) => plan.status === "published")
    : [];

  if (!publishedPlans.length)
    return (
      <div className="w-full rounded-xl p-4 flex justify-center items-center">
        <p className="text-[#70798F] text-base sm:text-lg">
          No published plans available
        </p>
      </div>
    );

  const handleDelete = async (id) => {
    try {
      await deletePublishPlan(id).unwrap();
      toast.success("Plan deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to delete plan!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster />
      <div className="flex flex-col">
        <div className="flex-1 flex flex-col gap-3">
          {publishedPlans.map((plan) => {
            const { likeCount, shareCount } = getInteractionCounts(plan);
            return (
              <div key={plan.id}>
                <div className="bg-white rounded-t-lg border-x border-t border-gray-200">
                  <div className="p-4 sm:p-6 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                          Tour from {plan.location_from} to {plan.location_to}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p>
                            Willing to go on{" "}
                            <span className="font-medium">
                              {plan.start_date}
                            </span>
                          </p>
                          <p>
                            Duration:{" "}
                            <span className="font-medium">
                              {plan.duration} Days
                            </span>
                          </p>
                          <p>
                            Category:{" "}
                            <span className="font-medium">{plan.category}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center relative mt-4 sm:mt-0">
                        <div>
                          <p className="text-base sm:text-lg font-bold text-gray-700">
                            Budget ${plan.budget}
                          </p>
                          <p className="text-xs sm:text-md text-gray-800">
                            Total {plan.total_members} person
                            {plan.total_members > 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(!isDropdownOpen);
                          }}
                          className="ml-2"
                        >
                          <HiDotsVertical
                            size={20}
                            className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                          />
                        </button>
                        {isDropdownOpen && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-8 bg-gray-100 shadow-lg rounded-md py-2 w-40 z-10 animate-dropdown"
                          >
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:cursor-pointer hover:bg-white"
                              onClick={() => handleDelete(plan.id)}
                              disabled={isDeletePublishPlan}
                            >
                              {isDeletePublishPlan
                                ? "Deleting..."
                                : "Delete Plan"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        Interested Travel Points:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {plan.tourist_spots ? (
                          plan.tourist_spots.split(",").map((spot, index) => (
                            <span
                              key={index}
                              className="text-xs sm:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                            >
                              {spot.trim()}
                              {index <
                                plan.tourist_spots.split(",").length - 1 &&
                                ", "}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-500">
                            None specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                    <div className="rounded-lg overflow-hidden relative">
                      <img
                        src={
                          plan.spot_picture_url ||
                          "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                        }
                        alt="Tour destination"
                        className="w-full h-64 sm:h-96 object-cover"
                      />
                      <h1 className="text-[20px] left-2/6 absolute bottom-2  font-semibold text-white ">
                        Image generated automatically
                      </h1>
                    </div>
                    {/* <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                            <ThumbsUp className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" />
                          </div>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center -ml-2">
                            <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" />
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 ml-2">
                          {likeCount} Likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span>{plan.offers?.length || 0} Offers</span>
                        <span>{shareCount} Shares</span>
                      </div>
                    </div> */}
                    {/* <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 sm:gap-4 w-full justify-around sm:w-auto sm:justify-start">
                        <button
                          onClick={() => handleLike(plan.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            isLiked[plan.id] ? "text-blue-600" : "text-gray-600"
                          } hover:text-blue-600 transition-colors hover:cursor-pointer`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isLiked[plan.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>{isLiked[plan.id] ? "Unlike" : "Like"}</span>
                        </button>
                        <button
                          onClick={() => openPopup(plan)}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Comments</span>
                        </button>
                        <button
                          onClick={() => handleShare(plan.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            isShared[plan.id]
                              ? "text-gray-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                        >
                          <Share2
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isShared[plan.id] ? "" : ""
                            }`}
                          />
                          <span>{isShared[plan.id] ? "Share" : "Share"}</span>
                        </button>
                      </div>
                    </div> */}
                  </div>
                </div>
                <div className="bg-white rounded-b-lg border-x border-b border-gray-200">
                  <div className="px-4 sm:px-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 pt-3 flex items-center space-x-2">
                          <GoArrowLeft />
                          <p>All Offers</p>
                        </h3>
                      </div>
                      <div className="flex items-center space-x-8 sm:space-x-16 pt-2">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Offered Budget
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 py-4 sm:py-6">
                    {plan.offers && plan.offers.length > 0 ? (
                      plan.offers.map((offer) => {
                        const { truncated, isTruncated } = truncateText(
                          offer.message,
                          20
                        );
                        return (
                          <div
                            key={offer.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 rounded-lg"
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              <img
                                src={
                                  offer.agency.logo_url ||
                                  "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                }
                                alt={`${offer.company} avatar`}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 text-xs sm:text-sm">
                                    {expandedOfferMessages[offer.id]
                                      ? offer.message
                                      : truncated}
                                    {isTruncated &&
                                      !expandedOfferMessages[offer.id] && (
                                        <button
                                          onClick={() =>
                                            toggleOfferMessage(offer.id)
                                          }
                                          className="text-blue-600 hover:underline text-xs sm:text-sm ml-1"
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
                                          className="text-blue-600 hover:underline text-xs sm:text-sm ml-1"
                                        >
                                          Show Less
                                        </button>
                                      )}
                                  </span>
                                  {offer.verified && (
                                    <div className="flex space-x-1">
                                      <span className="text-blue-500">
                                        <MdVerified size={20} />
                                      </span>
                                      <span className="text-green-500">
                                        <MdVerified size={20} />
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-base sm:text-xl">
                                  💰 {offer.offered_budget}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleResponseClick(offer, offer.agency.user)
                                }
                                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#3776E2] text-white text-xs sm:text-md rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                Response
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-600 text-xs sm:text-sm">
                        No offers available
                      </div>
                    )}
                    <div className="border-t border-gray-200 my-4"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup Modal for Comments */}
      {isPopupOpen && selectedTour && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                Tour Details
              </h2>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="w-full">
                <div className="rounded-lg bg-white shadow-sm border border-gray-200">
                  <div className="p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                          Tour from {selectedTour.location_from} to{" "}
                          {selectedTour.location_to}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p>
                            Willing to go on{" "}
                            <span className="font-medium">
                              {selectedTour.start_date}
                            </span>
                          </p>
                          <p>
                            Duration:{" "}
                            <span className="font-medium">
                              {selectedTour.duration} Days
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
                          <p className="text-xs sm:text-sm text-gray-800">
                            Total {selectedTour.total_members} person
                            {selectedTour.total_members > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {selectedTour.description}
                      </p>
                    </div>
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Interested Travel Points:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTour.tourist_spots ? (
                          selectedTour.tourist_spots
                            .split(",")
                            .map((location, index) => (
                              <span
                                key={index}
                                className="text-xs sm:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                              >
                                {location.trim()}
                                {index <
                                  selectedTour.tourist_spots.split(",").length -
                                    1 && ", "}
                              </span>
                            ))
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-600">
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
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                            <ThumbsUp className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" />
                          </div>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center -ml-2">
                            <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" />
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 ml-2">
                          {getInteractionCounts(selectedTour).likeCount} Likes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span>{selectedTour.offers?.length || 0} Offers</span>
                        <span>
                          {getInteractionCounts(selectedTour).shareCount} Shares
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button
                          onClick={() => handleLike(selectedTour.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            isLiked[selectedTour.id]
                              ? "text-blue-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isLiked[selectedTour.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>
                            {isLiked[selectedTour.id] ? "Unlike" : "Like"}
                          </span>
                        </button>
                        <button
                          onClick={() => openPopup(selectedTour)}
                          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Comments</span>
                        </button>
                        <button
                          onClick={() => handleShare(selectedTour.id)}
                          disabled={isInteractLoading}
                          className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                            isShared[selectedTour.id]
                              ? "text-blue-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                        >
                          <Share2
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              isShared[selectedTour.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>
                            {isShared[selectedTour.id] ? "Unshare" : "Share"}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start gap-3 p-2 sm:p-4 rounded-lg">
                      <div className="text-gray-600 w-fit">
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
                        <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">
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
                            className={`px-3 py-2 font-medium rounded-md transition-colors flex items-center gap-2 sm:gap-3 justify-center ${
                              offerBudget && offerComment.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!offerBudget || !offerComment.trim()}
                          >
                            <IoIosSend size={20} />
                            <span>Submit Offer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 py-4 sm:py-6">
                      {selectedTour.offers && selectedTour.offers.length > 0 ? (
                        selectedTour.offers.map((offer) => {
                          const { truncated, isTruncated } = truncateText(
                            offer.message,
                            20
                          );
                          return (
                            <div
                              key={offer.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 rounded-lg"
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <img
                                  src={
                                    offer.image ||
                                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                  }
                                  alt={`${offer.company} avatar`}
                                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-900 text-xs sm:text-sm">
                                      {expandedOfferMessages[offer.id]
                                        ? offer.message
                                        : truncated}
                                      {isTruncated &&
                                        !expandedOfferMessages[offer.id] && (
                                          <button
                                            onClick={() =>
                                              toggleOfferMessage(offer.id)
                                            }
                                            className="text-blue-600 hover:underline text-xs sm:text-sm ml-1"
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
                                            className="text-blue-600 hover:underline text-xs sm:text-sm ml-1"
                                          >
                                            Show Less
                                          </button>
                                        )}
                                    </span>
                                    {offer.verified && (
                                      <div className="flex space-x-1">
                                        <span className="text-blue-500">
                                          <MdVerified size={20} />
                                        </span>
                                        <span className="text-green-500">
                                          <MdVerified size={20} />
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-base sm:text-xl">
                                    💰 {offer.offered_budget}
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    handleResponseClick(
                                      offer,
                                      selectedTour.user
                                    )
                                  }
                                  className="px-3 sm:px-5 py-1.5 sm:py-2 bg-[#3776E2] text-white text-xs sm:text-md rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                  Response
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-600 text-xs sm:text-sm">
                          No offers available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agency Modal */}
      {showAgencyModal && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-[90vh] max-h-[80vh] overflow-hidden">
            <div className="flex flex-col sm:flex-row h-auto sm:h-[450px]">
              {/* Left Image & Close Button */}
              <div className="w-full sm:w-1/2 relative">
                <button
                  onClick={() => {
                    setShowAgencyModal(false);
                    setSelectedUserId(null);
                  }}
                  className="absolute top-4 left-4 bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-r-full flex items-center gap-2 z-10 cursor-pointer transition-colors"
                >
                  <GoArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <img
                  src={
                    showResponseData?.cover_photo_url ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529170/samples/landscapes/nature-mountains.jpg"
                  }
                  alt="Agency"
                  className="w-full h-48 sm:h-full object-cover"
                />
              </div>

              {/* Right Content */}
              <div className="w-full sm:w-1/2 p-4 sm:p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <img
                        src={
                          showResponseData?.agency_logo_url ||
                          "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529167/samples/ecommerce/analog-classic.jpg"
                        }
                        className="rounded-full w-12 h-12 sm:w-16 sm:h-16 object-cover"
                        alt="Agency Logo"
                      />
                    </div>
                    <div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                          {showResponseData?.agency_name ||
                            selectedAgency.company}
                        </h2>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(showResponseData?.rating || 4.5)}
                          <span className="text-xs sm:text-sm text-gray-600">
                            ({showResponseData?.review_count || 0}{" "}
                          </span>
                          <button
                            onClick={handleReviewsClick}
                            className="text-xs sm:text-sm text-blue-600 hover:underline cursor-pointer"
                          >
                            Reviews
                          </button>
                          <span className="text-xs sm:text-sm text-gray-600">
                            )
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 sm:mb-6 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {showResponseData?.about ||
                      "Aspen is as close as one can get to a storybook alpine town in America..."}
                  </p>
                </div>

                <div className="mb-2">
                  <h1 className="flex items-center">
                    {" "}
                    <Mail className="w-4 h-4 text-blue-600 mr-1" />{" "}
                    {showResponseData?.contact_email}
                  </h1>
                  <h1 className="flex items-center">
                    {" "}
                    <Phone className="w-4 h-4 text-green-600 mr-1" />{" "}
                    {showResponseData?.contact_phone}
                  </h1>
                  <h1 className="flex items-center">
                    {" "}
                    <MapPin className="w-4 h-4 text-red-600 mr-1" />{" "}
                    {showResponseData?.address}
                  </h1>
                </div>

                {/* Facilities */}
                <div className=" flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                      Facilities
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(
                          showResponseData?.facilities?.[0] || "[]"
                        ).map((item, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1"
                          >
                            <FaCheckCircle className="w-3 h-3 text-blue-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        if (!token) {
                          navigate("/login");
                        } else {
                          handleMessage({ other_user_id: selectedUserId });
                        }
                      }}
                      disabled={isInviteLoading}
                      className="flex items-center space-x-2 bg-[#3776E2] text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors w-full sm:w-auto hover:cursor-pointer"
                    >
                      {isInviteLoading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base font-medium">
                            Message
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AnimatePresence block for Reviews */}
            <AnimatePresence>
              {showReviews && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -20 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="border-t border-gray-200 overflow-hidden"
                  style={{ transformOrigin: "top" }}
                >
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-4 sm:p-6 space-y-4 sm:space-y-6"
                  >
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 -mt-5">
                        Recent Reviews
                      </h3>
                      <div className="space-y-4 max-h-56 overflow-y-auto">
                        <div className="text-gray-600 text-xs sm:text-sm">
                          {showResponseData?.recent_reviews?.length
                            ? showResponseData.recent_reviews.map(
                                (review, index) => (
                                  <div
                                    key={index}
                                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-md border border-pink-200"
                                  >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-base sm:text-lg">
                                        {review.tourist_name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-base sm:text-lg text-gray-800">
                                              {
                                                review.tourist_name.split(
                                                  "@"
                                                )[0]
                                              }
                                            </span>
                                            <div className="flex">
                                              {Array.from(
                                                { length: 5 },
                                                (_, i) => (
                                                  <svg
                                                    key={i}
                                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                                      i < review.rating
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.31 9.397c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.97z" />
                                                  </svg>
                                                )
                                              )}
                                            </div>
                                          </div>
                                          <span className="text-xs sm:text-sm text-gray-500 italic">
                                            {new Date(
                                              review.created_at
                                            ).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-xs sm:text-base text-gray-600 mt-2">
                                          {review.comment}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )
                            : "No reviews available"}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default PublishedPlan;
