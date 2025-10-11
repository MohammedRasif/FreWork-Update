import {
  useGetOneDetailQuery,
  useOfferBudgetMutation,
  useAcceptOfferMutation,
  useInviteToChatMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaClock,
  FaList,
  FaLocationArrow,
  FaLocationDot,
} from "react-icons/fa6";
import { X, Utensils, BedDouble, Clock4, ShieldCheck } from "lucide-react";
import { MdOutlineKeyboardBackspace, MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IoBed, IoCheckmarkCircleSharp, IoPersonSharp } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";

function SinglePost({ prid }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const finalId = paramId || prid?.id;

  const [token, setToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState(false);

  const [postData, setPostData] = useState({});
  const [offerForm, setOfferForm] = useState({
    budget: "",
    comment: "",
    discount: "",
    applyDiscount: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedOffers, setExpandedOffers] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    refetch,
  } = useGetOneDetailQuery(finalId, {
    skip: !finalId,
  });
  const { data: userData, isLoading: isUserLoading } =
    useShowUserInpormationQuery();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] =
    useAcceptOfferMutation();
  const [invite, { isLoading: isInviteLoading }] = useInviteToChatMutation();
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocalStorage = () => {
      setToken(localStorage.getItem("access_token"));
      setCurrentUserId(localStorage.getItem("user_id"));
      setRole(localStorage.getItem("role") || "tourist");
      setIsLocalStorageLoaded(true);
    };

    fetchLocalStorage();
    window.addEventListener("storage", fetchLocalStorage);
    return () => window.removeEventListener("storage", fetchLocalStorage);
  }, []);

  useEffect(() => {
    if (postError) {
      console.error("Failed to fetch post:", postError);
      toast.error("Failed to load post data");
    }
    if (post && isLocalStorageLoaded) {
      setPostData({
        ...post,
        offers: post.offers || [],
      });
    }
  }, [post, postError, isLocalStorageLoaded]);

  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      toast.error("Please log in to submit an offer");
      return;
    }
    if (!offerForm.budget || !offerForm.comment.trim()) {
      toast.error("Please provide a budget and a comment");
      return;
    }
    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || Number(offerForm.discount) <= 0)
    ) {
      toast.error("Please provide a valid discount percentage");
      return;
    }

    setIsOfferSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(offerForm.budget));
      formData.append("message", offerForm.comment);
      formData.append("apply_discount", offerForm.applyDiscount);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0
      );
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await offerBudgetToBack({
        id: finalId,
        data: formData,
      }).unwrap();

      const newOffer = {
        id: `${currentUserId}-${Date.now()}`,
        offered_budget: Number.parseFloat(offerForm.budget),
        message: offerForm.comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0,
        file_name: selectedFile ? selectedFile.name : null,
        agency: {
          agency_name: localStorage.getItem("name") || "Unknown Agency",
          logo_url:
            localStorage.getItem("user_image") ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png",
          is_verified: false,
        },
      };
      setPostData((prev) => ({
        ...prev,
        offers: [...(prev.offers || []), newOffer],
        offer_count: (prev.offer_count || 0) + 1,
      }));
      setOfferForm({
        budget: "",
        comment: "",
        discount: "",
        applyDiscount: false,
      });
      setSelectedFile(null);
      setIsPopupOpen(false);
      toast.success("Offer submitted successfully");
      navigate("/admin/chat");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error.data?.error
          ? `${error.data.error} Only agency can do this.`
          : "Something went wrong"
      );
    } finally {
      setIsOfferSubmitting(false);
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
      navigate(-1);
      toast.success("Offer accepted successfully");
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error(error.data?.detail || "Failed to accept offer");
    }
  };

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
    try {
      await invite({ other_user_id: otherUserId }).unwrap();
      toast.success("Chat initiated successfully");
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error(error.data?.detail || "Failed to initiate chat");
    }
  };

  if (!isLocalStorageLoaded || isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading user data...
      </div>
    );
  }

  if (isPostLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading post...
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
  const hasMaxOffers = tour.offers?.length >= 3;

  const handleSentOfferClick = () => {
    if (!token) {
      navigate("/login");
      toast.error("Please log in to submit an offer");
      return;
    }
    if (hasMaxOffers) {
      toast.error("Sorry, this post already has 3 offers submitted.");
    } else {
      setIsPopupOpen(true);
    }
  };

  const showSentOfferButton = !token || role === "agency";

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex flex-col items-center justify-center relative container mx-auto">
      <Toaster />
      <button
        onClick={() => navigate(-1)}
        className="text-gray-800 rounded-md transition-colors absolute top-4 left-4 cursor-pointer"
      >
        <MdOutlineKeyboardBackspace size={36} />
      </button>

      <div className="flex flex-col shadow-lg w-80 lg:w-[50vh] mx-auto overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-xl">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
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
            </div>
            {tour.offers && tour.offers.length > 0 && (
              <div className="absolute bottom-4 left-3/7 -translate-x-2/5 flex items-center lg:space-x-20 space-x-10 overflow-x-auto px-2 scrollbar-none">
                {tour.offers.map((offer) => (
                  <img
                    key={offer.id}
                    src={
                      offer.agency?.logo_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                    }
                    alt={`${
                      offer.agency?.agency_name || "Unknown Agency"
                    } logo`}
                    className="w-16 h-16 object-contain rounded-full border border-white bg-white flex-shrink-0"
                  />
                ))}
                
              </div>
            )}
            {tour.offers?.length >= 3 ? (
              <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                <IoCheckmarkCircleSharp className="mr-1" size={16} />
                Offers completed
              </div>
            ) : (
              <div></div>
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
            <p className=" font-bold">
              <span className="font-medium">Date:</span> {tour.start_date} to{" "}
              {tour.end_date || "N/A"}
            </p>
          </div>
          <p>
            <span className="font-medium">Categoria:</span>{" "}
            {tour.travel_type || "N/A"}
          </p>

          <div className="">
            <p className="text-xl font-bold text-gray-900">
              Budget: ${tour.budget}
            </p>
          </div>

          <div className="flex items-center space-x-10">
            <span className="text-md text-gray-700 ">
              <span className="font-bold">Total:</span> {tour.total_members}{" "}
              {tour.total_members > 1 ? "people" : "person"}
            </span>

            <div className="flex items-center space-x-4">
              <h1 className="text-md text-gray-700">
                <span className="font-bold">Child :</span> {tour.child_count}
              </h1>
              <h1 className="text-md text-gray-700">
                {" "}
                <span className="font-bold">Adult :</span> {tour.adult_count}
              </h1>
            </div>
          </div>

          <div>
            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaLocationDot className="w-6 h-5 text-gray-500 size-4" />
              <span>
                <span className="font-medium">Points of travel:</span>{" "}
                {tour.tourist_spots || "None"}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaLocationArrow className="w-6 h-5 text-gray-500" />
              <span>
                <span className="font-medium">Departure from:</span>{" "}
                {tour.location_from || "N/A"}
              </span>
            </p>

            

            <p className="text-md text-gray-600 flex items-center gap-2">
              <MdOutlineNoMeals className="w-6 h-5 text-gray-500" />
              <span>
                <span className="font-medium">Meal plan:</span>{" "}
                {tour.meal_plan || "N/A"}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <IoBed className="w-6 h-5 text-gray-500" />
              <span>
                <span className="font-medium">Type of accommodation:</span>{" "}
                {tour.type_of_accommodation || "N/A"}
              </span>
            </p>
            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaList className="w-6 h-5 text-gray-500" />
              <span>
                <span className="font-medium">Minimum rating:</span>{" "}
                {tour.minimum_star_hotel || "N/A"}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaClock className="w-6 h-5 text-gray-500" />
              <span>
                <span className="font-medium">Duration:</span>{" "}
                {tour.duration || "N/A"}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <MdVerifiedUser className="w-7 h-6 text-green-500" />
              <span>
                <span className="font-medium">Contact verified via email</span>
              </span>
            </p>

             <h1 className="text-[16px]   py-2 pl-9 font-bold ">Image generated automatically</h1>

          </div>
          <div className="pt-2 w-full">
            <Dialog open={isPopupOpen} onOpenChange={(open) => {
              setIsPopupOpen(open);
              if (!open) {
                setOfferForm({ budget: "", comment: "", discount: "", applyDiscount: false });
                setSelectedFile(null);
              }
            }}>
              {showSentOfferButton && (
                <DialogTrigger className="backdrop-blur-2xl" asChild>
                  <button
                    onClick={handleSentOfferClick}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-md"
                  >
                    Sent Offer
                  </button>
                </DialogTrigger>
              )}
              <DialogContent className="lg:w-[60vh]">
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                  Place Your Offer
                </h3>
                <form onSubmit={handleOfferSubmit} className="space-y-2">
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      Offer
                    </label>
                    <input
                      type="number"
                      name="budget"
                      id="budget"
                      value={offerForm.budget}
                      onChange={handleOfferChange}
                      placeholder="Enter your budget (e.g., 6000)"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-md font-medium text-gray-700 mb-1"
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

                  <div>
                    <label
                      htmlFor="file"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      Upload File (Optional)
                    </label>
                    <input
                      type="file"
                      id="file"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    {selectedFile && (
                      <p className="text-xs text-gray-600 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="applyDiscount"
                        id="applyDiscount"
                        checked={offerForm.applyDiscount}
                        onChange={handleOfferChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-md text-gray-700">
                        Apply an additional discount
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Website suggests extra discount, increases conversions by 30%. Check to offer more.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="discount"
                      className="block text-md font-medium text-gray-700 mb-1"
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
                    type="submit"
                    disabled={
                      isOfferSubmitting ||
                      !offerForm.budget ||
                      !offerForm.comment.trim()
                    }
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${
                      isOfferSubmitting ||
                      !offerForm.budget ||
                      !offerForm.comment.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                    }`}
                  >
                    <IoIosSend size={20} />
                    {isOfferSubmitting ? "Submitting..." : "Submit Offer"}
                  </button>
                </form>
                <div className="space-y-4">
                  {isUserLoading ? (
                    <div>Loading user data...</div>
                  ) : tour.offers && tour.offers.length > 0 ? (
                    tour.offers
                      .slice(0, expandedOffers ? tour.offers.length : 3)
                      .map((offer) => {
                        return userData?.user_id &&
                          offer?.agency?.user &&
                          tour.user &&
                          (userData.user_id === offer.agency.user ||
                            userData.user_id === tour.user) ? (
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
                                  offer.agency?.agency_name || "Unknown Agency"
                                } avatar`}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                              />
                              
                              <div>
                                <span className="font-medium text-gray-900">
                                  {offer.agency?.agency_name || "Unknown Agency"}
                                </span>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {offer.message}
                                </p>
                                {offer.file_name && (
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    File: {offer.file_name}
                                  </p>
                                )}
                                {offer.apply_discount && offer.discount > 0 && (
                                  <p className="text-xs sm:text-sm text-green-600">
                                    Discount: {offer.discount}% off
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <span className="font-semibold text-lg sm:text-xl">
                                💰 ${offer.offered_budget || "N/A"}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleMessage(offer.agency?.user)
                                  }
                                  disabled={
                                    isInviteLoading ||
                                    isOfferBudgetLoading ||
                                    isAcceptLoading ||
                                    !offer.agency?.user
                                  }
                                  className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                                    isInviteLoading ||
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
                        ) : null;
                      })
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
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default SinglePost;