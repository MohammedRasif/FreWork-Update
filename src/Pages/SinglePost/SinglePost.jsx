import {
  useGetOneDetailQuery,
  useLikePostMutation,
  useOfferBudgetMutation,
  useAcceptOfferMutation,
  useInviteToChatMutation,
} from "@/redux/features/withAuth";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThumbsUp, Share2 } from "lucide-react";
import { MdOutlineKeyboardBackspace, MdVerified } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";

const token = localStorage.getItem("access_token");
const currentUserId = localStorage.getItem("user_id");

function SinglePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postData, setPostData] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [offerForm, setOfferForm] = useState({ budget: "", comment: "" });
  const [expandedOffers, setExpandedOffers] = useState(false);

  // RTK Queries
  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
  } = useGetOneDetailQuery(id, {
    skip: !id,
  });
  const [interact, { isLoading: isInteractLoading }] = useLikePostMutation();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] =
    useAcceptOfferMutation();
  const [invite, { isLoading: isInviteLoading }] = useInviteToChatMutation();

  // Initialize post data and like/share status
  useEffect(() => {
    if (postError) {
      console.error("Failed to fetch post:", postError);
      toast.error("Failed to load post data");
    }
    if (post) {
      console.log("Post data:", post);
      setPostData(post);
      if (currentUserId) {
        setIsLiked(
          post.interactions?.some(
            (interaction) =>
              String(interaction.user) === String(currentUserId) &&
              interaction.interaction_type === "like"
          )
        );
        setIsShared(
          post.interactions?.some(
            (interaction) =>
              String(interaction.user) === String(currentUserId) &&
              interaction.interaction_type === "share"
          )
        );
      }
    }
  }, [post, postError, currentUserId]);

  // Handle offer form changes
  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle like/unlike action
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
        const newIsLiked = !prev;
        setPostData((prevTour) => ({
          ...prevTour,
          interactions: newIsLiked
            ? [
                ...prevTour.interactions.filter(
                  (i) =>
                    String(i.user) !== String(currentUserId) ||
                    i.interaction_type !== "like"
                ),
                { user: currentUserId, interaction_type: "like" },
              ]
            : prevTour.interactions.filter(
                (i) =>
                  String(i.user) !== String(currentUserId) ||
                  i.interaction_type !== "like"
              ),
        }));
        return newIsLiked;
      });
      toast.success(isLiked ? "Post unliked" : "Post liked");
    } catch (error) {
      console.error("Failed to update like:", error);
      toast.error("Failed to update like");
    }
  };

  // Handle share/unshare action
  const handleShare = async (tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to share the post");
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/tour-plans/${tourId}`
      );
      toast.success("Post link copied to clipboard");
      await interact({
        id: tourId,
        data: { interaction_type: "share" },
      }).unwrap();
      setIsShared((prev) => {
        const newIsShared = !prev;
        setPostData((prevTour) => ({
          ...prevTour,
          interactions: newIsShared
            ? [
                ...prevTour.interactions.filter(
                  (i) =>
                    String(i.user) !== String(currentUserId) ||
                    i.interaction_type !== "share"
                ),
                { user: currentUserId, interaction_type: "share" },
              ]
            : prevTour.interactions.filter(
                (i) =>
                  String(i.user) !== String(currentUserId) ||
                  i.interaction_type !== "share"
              ),
        }));
        return newIsShared;
      });
    } catch (error) {
      console.error("Failed to update share:", error);
      toast.error("Failed to copy link or update share");
    }
  };

  // Handle offer submission
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      toast.error("Please log in to submit an offer");
      return;
    }
    if (!offerForm.budget || !offerForm.comment.trim()) {
      toast.error("Please provide both a budget and a comment");
      return;
    }
    try {
      await offerBudgetToBack({
        id,
        data: {
          offered_budget: parseFloat(offerForm.budget),
          message: offerForm.comment,
        },
      }).unwrap();
      const newOffer = {
        id: currentUserId,
        offered_budget: parseFloat(offerForm.budget),
        message: offerForm.comment,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url: localStorage.getItem("user_image") || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
          is_verified: false,
        },
      };
      setPostData((prev) => ({
        ...prev,
        offers: [
          ...(prev.offers || []).filter((offer) => offer.id !== newOffer.id),
          newOffer,
        ],
        offer_count: (prev.offer_count || 0) + 1,
      }));
      setOfferForm({ budget: "", comment: "" });
      toast.success("Offer submitted successfully");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error.data?.detail
          ? `${error.data.detail} Only agency can do this.`
          : "Something went wrong"
      );
    }
  };

  // Handle accept offer
  const acceptOfferHandler = async (offerId, tourId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to accept an offer");
      return;
    }
    try {
      await acceptOffer(offerId).unwrap();
      navigate(-1);
      toast.success("Offer accepted successfully");
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error(error.data?.detail || "Failed to accept offer");
    }
  };

  // Handle message action
  const handleMessage = async (otherUserId) => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to send a message");
      return;
    }
    if (!otherUserId) {
      toast.error("Agency user ID not found");
      return;
    }
    if (String(otherUserId) === String(currentUserId)) {
      toast.error("Cannot message yourself");
      return;
    }
    const role = localStorage.getItem("role") || "tourist";
    try {
      await invite({ other_user_id: otherUserId }).unwrap();
      toast.success("Chat initiated successfully");
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error(error.data?.detail || "Failed to initiate chat");
    }
  };

  // Calculate interaction counts
  const getInteractionCounts = (tour) => {
    const likeCount =
      tour.interactions?.filter(
        (interaction) => interaction.interaction_type === "like"
      ).length || 0;
    const shareCount =
      tour.interactions?.filter(
        (interaction) => interaction.interaction_type === "share"
      ).length || 0;
    return { likeCount, shareCount };
  };

  const { likeCount, shareCount } = getInteractionCounts(postData);

  if (isPostLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (postError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Error loading post. Please try again later.
      </div>
    );
  }

  const tour = postData;
  const role = localStorage.getItem("role") || "tourist";

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex flex-col items-center justify-center relative container mx-auto ">
      <Toaster />
      <button
        onClick={() => navigate(-1)}
        className=" text-gray-800 rounded-md  transition-colors absolute top-4 left-4 cursor-pointer"
      >
        <MdOutlineKeyboardBackspace  size={24}/>

      </button>

      <div className="rounded-lg bg-white shadow-sm border border-gray-200  w-full lg:-mt-10 mt-10">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
            <div className="flex-1">
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 my-2">
                {tour.location_to || "Unknown Destination"}
              </h2>
              <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                <p className="text-[16px]">
                  Willing to go on{" "}
                  <span className="font-medium">
                    {tour.start_date || "N/A"}
                  </span>
                </p>
                <p className="text-[16px]">
                  Duration:{" "}
                  <span className="font-medium">
                    {tour.duration || "N/A"} days
                  </span>
                </p>
                <p className="text-[16px]">
                  Category:{" "}
                  <span className="font-medium">{tour.category || "N/A"}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
              <div>
                <p className="text-[16px] lg:text-lg font-bold text-gray-700">
                  Budget ${tour.budget || "N/A"}
                </p>
                <p className="text-[16px] lg:text-md text-gray-800">
                  Total {tour.total_members || "N/A"} person
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[16px] text-gray-600 leading-relaxed">
              {tour.description || "No description available"}
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <p className="text-[16px] lg:text-lg font-medium text-gray-700">
              Interested Travel Points:
            </p>
            <div className="flex flex-wrap gap-1">
              {tour.tourist_spots ? (
                tour.tourist_spots.split(",").map((location, index) => (
                  <span
                    key={index}
                    className="text-[16px] lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                  >
                    {location.trim()}
                    {index < tour.tourist_spots.split(",").length - 1 && ", "}
                  </span>
                ))
              ) : (
                <span className="text-[16px] lg:text-lg text-gray-600">
                  None
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <img
              src={tour.spot_picture_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
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
              </div>
              <span className="text-xs sm:text-sm lg:text-sm text-gray-600">
                {likeCount} Likes
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-4 text-xs sm:text-sm lg:text-sm text-gray-600">
              <span>{tour.offer_count || 0} Offers</span>
              <span>{shareCount} Shares</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 sm:gap-6 lg:gap-6 w-full justify-around lg:w-auto lg:justify-baseline">
              <button
                onClick={() => handleLike(tour.id)}
                disabled={isInteractLoading}
                className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm ${
                  isLiked ? "text-blue-600" : "text-gray-600"
                } hover:text-blue-600 transition-colors hover:cursor-pointer`}
              >
                <ThumbsUp
                  className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                    isLiked ? "fill-current" : ""
                  }`}
                />
                <span>{isLiked ? "Unlike" : "Like"}</span>
              </button>
              <button
                onClick={() => handleShare(tour.id)}
                disabled={isInteractLoading}
                className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm hover:cursor-pointer ${
                  isShared ? "text-blue-600" : "text-gray-600"
                } hover:text-blue-600 transition-colors`}
              >
                <Share2
                  className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                    isShared ? "fill-current" : ""
                  }`}
                />
                <span>{isShared ? "Unshare" : "Share"}</span>
              </button>
            </div>
          </div>

          {role !== "tourist" && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Place Your Offer
              </h3>
              <div className="flex">
                <div className="w-9 h-9 mt-7 rounded-full overflow-hidden border border-gray-300">
                  <img
                    className="w-full"
                    src={
                      `${
                        "http://res.cloudinary.com/ds97wytcs" +
                        localStorage.getItem("user_image")
                      }` ||
                      "http://res.cloudinary.com/ds97wytcs/image/upload/v1752053074/sjxpjoqalo27rqrn8hbd.jpg"
                    }
                    alt=""
                  />
                </div>
                <form
                  onSubmit={handleOfferSubmit}
                  className="px-6 rounded-xl mx-auto grow"
                >
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Budget
                    </label>
                    <input
                      type="number"
                      name="budget"
                      id="budget"
                      value={offerForm.budget}
                      onChange={handleOfferChange}
                      placeholder="Enter your budget"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      name="comment"
                      id="comment"
                      value={offerForm.comment}
                      onChange={handleOfferChange}
                      rows="4"
                      placeholder="Enter your message"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isOfferBudgetLoading ||
                      !offerForm.budget ||
                      !offerForm.comment.trim()
                    }
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                      offerForm.budget && offerForm.comment.trim()
                        ? "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <IoIosSend size={20} />
                    Submit Offer
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {tour.offers && tour.offers.length > 0 ? (
              tour.offers
                .slice(0, expandedOffers ? tour.offers.length : 3)
                .map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 py-3 rounded-lg border border-transparent hover:border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                      <img
                        src={offer.agency?.logo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                        alt={`${
                          offer.agency?.agency_name || "Unknown Agency"
                        } avatar`}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {offer.agency?.agency_name || "Unknown Agency"}
                          </span>
                          {offer.agency?.is_verified && (
                            <span className="text-blue-500">
                              <MdVerified size={20} className="sm:w-6 sm:h-6" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {offer.message || "No message provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-semibold text-lg sm:text-xl">
                        💰 ${offer.offered_budget || "N/A"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessage(offer.agency?.user)}
                          disabled={
                            isInviteLoading ||
                            isInteractLoading ||
                            isOfferBudgetLoading ||
                            isAcceptLoading ||
                            !offer.agency?.user
                          }
                          className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                            isInviteLoading ||
                            isInteractLoading ||
                            isOfferBudgetLoading ||
                            isAcceptLoading ||
                            !offer.agency?.user
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-[#3776E2] text-white hover:bg-blue-700 hover:cursor-pointer"
                          }`}
                        >
                          {isInviteLoading ? "Sending..." : "Message"}
                        </button>
                        {tour.user === currentUserId && (
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
                ))
            ) : (
              <p className="text-gray-600 text-sm">No offers available</p>
            )}
            {tour.offers?.length > 3 && (
              <button
                onClick={() => setExpandedOffers(!expandedOffers)}
                className="text-blue-600 hover:underline text-sm"
              >
                {expandedOffers ? "Show Less" : "See More"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePost;
