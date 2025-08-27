import React, { useState } from "react";
import { ThumbsUp, MessageCircle, Share2, X, Heart } from "lucide-react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import toast from "react-hot-toast";
import { IoIosSend } from "react-icons/io";

const TourPlanPopup = ({
  tour,
  onClose,
  isLiked,
  isShared,
  handleLike,
  handleShare,
  handleMessage,
  handleAcceptOffer,
  isInteractLoading,
  isAcceptLoading,
  userData,
  tourPlanPublicUser,
  handleSubmitOffer,
}) => {
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedOffers, setExpandedOffers] = useState({});
  const [expandedOfferMessages, setExpandedOfferMessages] = useState({});
  const [offerBudget, setOfferBudget] = useState("");
  const [offerComment, setOfferComment] = useState("");
  const [offerForm, setOfferForm] = useState({
    applyDiscount: false,
    discount: "",
  });

  const truncateText = (text, wordLimit = 100) => {
    if (!text || typeof text !== "string") {
      return { truncated: "", isTruncated: false };
    }
    const words = text.split(/\s+/).filter(Boolean);
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

  const toggleOffers = (tourId) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Tour Details</h2>
          <button
            onClick={onClose}
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
                      {tour.location_to}
                    </h2>
                    <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                      <p>
                        Willing to go on{" "}
                        <span className="font-medium">{tour.start_date}</span>
                      </p>
                      <p>
                        Include: <span className="font-medium">{tour.duration}</span>
                      </p>
                      <p>
                        Category:{" "}
                        <span className="font-medium">
                          {tour.travel_type || tour.category || "N/A"}
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
                      : truncateText(tour.description, 100).truncated}
                    {truncateText(tour.description, 100).isTruncated &&
                      !expandedDescriptions[tour.id] && (
                        <button
                          onClick={() => toggleDescription(tour.id)}
                          className="text-blue-600 hover:underline text-sm ml-1"
                        >
                          See More
                        </button>
                      )}
                    {truncateText(tour.description, 100).isTruncated &&
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
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-600">
                    Interested Travel Points:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tour.tourist_spots ? (
                      tour.tourist_spots.split(",").map((location, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          {location.trim()}
                          {index < tour.tourist_spots.split(",").length - 1 && ", "}
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
                      tour.spot_picture_url ||
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
                      {getInteractionCounts(tour).likeCount} Likes
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
                    <span>{tour.offer_count} Offers</span>
                    <span>{getInteractionCounts(tour).shareCount} Shares</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 sm:gap-6 lg:gap-6">
                    <button
                      onClick={() => handleLike(tour.id)}
                      disabled={isInteractLoading}
                      className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                        isLiked[tour.id] ? "text-blue-600" : "text-gray-600"
                      } hover:text-blue-600 transition-colors`}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                          isLiked[tour.id] ? "fill-current" : ""
                        }`}
                      />
                      <span>{isLiked[tour.id] ? "Unlike" : "Like"}</span>
                    </button>
                    <button
                      onClick={() => {}}
                      className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                      <span>Comments</span>
                    </button>
                    <button
                      onClick={() => handleShare(tour.id)}
                      disabled={isInteractLoading}
                      className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                        isShared[tour.id] ? "text-gray-600" : "text-gray-600"
                      } hover:text-blue-600 transition-colors`}
                    >
                      <Share2
                        className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                          isShared[tour.id] ? "fill-current" : ""
                        }`}
                      />
                      <span>{isShared[tour.id] ? "Share" : "Share"}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {userData?.isLoading ? (
                    <div>Loading user data...</div>
                  ) : (
                    tour.offers
                      .slice(
                        0,
                        expandedOffers[tour.id] ? tour.offers.length : 3
                      )
                      .map((offer) => {
                        const { truncated, isTruncated } = truncateText(
                          offer.message,
                          30
                        );
                        return userData?.user_id &&
                          offer?.agency?.user &&
                          tourPlanPublicUser[tour.id] &&
                          (userData.user_id === offer.agency.user ||
                            userData.user_id === tourPlanPublicUser[tour.id]) ? (
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
                                alt={`${offer.agency?.agency_name || "Unknown Agency"} avatar`}
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
                                  {isTruncated && !expandedOfferMessages[offer.id] && (
                                    <button
                                      onClick={() => toggleOfferMessage(offer.id)}
                                      className="text-blue-600 hover:underline text-sm ml-1"
                                    >
                                      See More
                                    </button>
                                  )}
                                  {isTruncated && expandedOfferMessages[offer.id] && (
                                    <button
                                      onClick={() => toggleOfferMessage(offer.id)}
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
                                    if (!localStorage.getItem("access_token")) {
                                      window.location.href = "/login";
                                    } else {
                                      const userId = tour.user;
                                      if (userId) {
                                        handleMessage({ other_user_id: userId });
                                      } else {
                                        console.error("User ID not found in tour");
                                      }
                                    }
                                  }}
                                  className="flex items-center space-x-2 bg-[#3776E2] text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors w-full sm:w-auto hover:cursor-pointer"
                                  aria-label={`Message ${offer.agency?.agency_name || "Agency"}`}
                                >
                                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                  <span className="text-sm sm:text-base font-medium">
                                    Message
                                  </span>
                                </button>
                                {tour.user === localStorage.getItem("user_id") && (
                                  <button
                                    onClick={() => handleAcceptOffer(offer.id, tour.id)}
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
                  {tour.offers.length > 3 && (
                    <button
                      onClick={() => toggleOffers(tour.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {expandedOffers[tour.id] ? "Show Less" : "See More"}
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
                          handleSubmitOffer(tour.id, offerBudget, offerComment, {
                            applyDiscount: offerForm.applyDiscount,
                            discount: offerForm.discount,
                          })
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
  );
};

export default TourPlanPopup;