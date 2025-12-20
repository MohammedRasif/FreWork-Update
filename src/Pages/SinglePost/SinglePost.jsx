import {
  useGetOneDetailQuery,
  useOfferBudgetMutation,
  useAcceptOfferMutation,
  useInviteToChatMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import React, { useEffect, useState } from "react";
import img from "../../assets/img/badge.png";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaClock,
  FaList,
  FaLocationArrow,
  FaLocationDot,
  FaStar,
} from "react-icons/fa6";
import { X, Utensils, BedDouble, Clock4, ShieldCheck } from "lucide-react";
import {
  MdOutlineKeyboardBackspace,
  MdOutlineNoMeals,
  MdVerifiedUser,
} from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IoBed, IoCheckmarkCircleSharp, IoPersonSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";

function SinglePost({ prid }) {
  const navigate = useNavigate();
  useNavigate();
  const { id: paramId } = useParams();
  const finalId = paramId || prid?.id;
  const { t } = useTranslation();

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
      toast.error(t("error_loading"));
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
      toast.error(t("login_to_submit_offer"));
      return;
    }
    if (!offerForm.budget || !offerForm.comment.trim()) {
      toast.error(t("provide_budget_and_comment"));
      return;
    }
    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || Number(offerForm.discount) <= 0)
    ) {
      toast.error(t("provide_valid_discount"));
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

      const response = await offerBudgetToBack({
        id: finalId,
        data: formData,
      }).unwrap();

      const newOffer = {
        id: `${currentUserId}-${Date.now()}`,
        offered_budget: Number.parseFloat(offerForm.budget),
        message: offerForm.comment,
        apply_discount: offerForm.applyDiscount,
        discount: offerForm.applyDiscount
          ? Number.parseFloat(offerForm.discount)
          : 0,
        file_name: selectedFile ? selectedFile.name : null,
        agency: {
          agency_name: localStorage.getItem("name") || t("unknown_agency"),
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

      toast.dismiss();
      toast.success(t("offer_submitted_success"));
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(error.data?.error || t("failed_to_submit_offer"));
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  const acceptOfferHandler = async (offerId) => {
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_accept_offer"));
      return;
    }
    try {
      await acceptOffer(offerId).unwrap();
      navigate(-1);
      toast.success(t("offer_accepted_success"));
    } catch (error) {
      console.error("Failed to accept offer:", error);
      toast.error(error.data?.detail || t("failed_to_accept_offer"));
    }
  };

  const handleMessage = async (otherUserId) => {
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_send_message"));
      return;
    }
    if (!otherUserId) {
      toast.error(t("recipient_id_not_found"));
      return;
    }
    if (String(otherUserId) === String(currentUserId)) {
      toast.error(
        t("cannot_message_yourself") || "Non puoi mandare messaggi a te stesso"
      );
      return;
    }
    try {
      await invite({ other_user_id: otherUserId }).unwrap();
      toast.success(t("chat_initiated_success"));
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
      toast.error(error.data?.detail || t("failed_to_initiate_chat"));
    }
  };

  if (!isLocalStorageLoaded || isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {t("loading_user_data")}
      </div>
    );
  }

  if (isPostLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {t("loading")}...
      </div>
    );
  }

  if (postError) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {t("error_loading")}
      </div>
    );
  }

  const tour = postData;
  console.log("Tour data:", tour);
  const hasMaxOffers = tour.offers?.length >= 3;

  const handleSentOfferClick = () => {
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_submit_offer"));
      return;
    }

    if (tour.status === "accepted") {
      toast.info(t("offer_accepted"));
      return;
    }

    if (hasMaxOffers) {
      toast.info(t("offer_limit_reached"));
      return;
    }

    setIsPopupOpen(true);
  };

  const showSentOfferButton = !token || role === "agency";

  return (
    <div className="min-h-screen bg-gray-50 px-4 flex flex-col items-center justify-center relative container mx-auto">
      <Toaster />
      <button
        onClick={() => navigate(-1)}
        className=" text-black rounded-md transition-colors absolute top-4 left-4 cursor-pointer z-30"
      >
        <MdOutlineKeyboardBackspace size={36} />
      </button>

      <div className="flex flex-col shadow-lg w-full lg:w-[50vh] mx-auto overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-xl z-10 lg:mt-0 mt-16">
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={
                tour.spot_picture_url ||
                "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
              }
              alt={`${tour.location_to} ${t("destination")}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white">
              <h2 className="text-2xl md:text-4xl font-bold text-center px-4 mb-2">
                {tour.location_to}
              </h2>
            </div>

            {/* Offerte mostrate come loghi */}
            {tour.offers && tour.offers.length > 0 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                <div className="flex justify-center items-center space-x-12  w-full px-4">
                  {tour.offers.slice(0, 3).map((offer) => {
                    const isAccepted = offer.status === "accepted";

                    return (
                      <div
                        key={offer.agency?.id || Math.random()}
                        className={`
                          relative flex items-center justify-center
                          ${isAccepted ? "w-20 h-20" : "w-16 h-16"}
                        `}
                      >
                        {isAccepted && (
                          <img
                            src={img}
                            alt={t("accepted_badge")}
                            className="absolute inset-0 "
                          />
                        )}

                        <img
                          src={
                            offer.agency?.logo_url ||
                            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                          }
                          alt={`${
                            offer.agency?.agency_name || t("unknown_agency")
                          } logo`}
                          className="
                            relative z-10 w-[60px] h-[60px] mt-[1px]
                            object-contain rounded-full bg-white 
                            border-2  
                            
                          "
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tour.offers?.length >= 3 && (
              <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                <IoCheckmarkCircleSharp className="mr-1" size={16} />
                {t("offers_completed")}
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
                {t("real_request")}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-md text-gray-700">
            <p className=" font-bold">
              <span className="font-medium">{t("date")}:</span>{" "}
              {tour.start_date} {t("to")} {tour.end_date || t("na")} (
              {tour.duration} {t("days")})
            </p>
          </div>

          <p>
            <span className="font-medium">{t("category")}:</span>{" "}
            {tour.destination_type === "beach"
              ? "Mare"
              : tour.destination_type === "mountain"
              ? "Montagna"
              : tour.destination_type === "relax"
              ? "Relax"
              : tour.destination_type === "group"
              ? "Gruppi"
              : t("na")}
          </p>

          <div className="">
            <p className="text-xl font-bold text-gray-900">
              {t("budget")}: €{tour.budget}
            </p>
          </div>

          <div className="flex items-center space-x-10">
            <span className="text-md text-gray-700 ">
              <span className="font-bold">{t("total")}:</span>{" "}
              {tour.total_members}{" "}
              {tour.total_members > 1 ? t("people") : t("person")}
            </span>

            <div className="flex items-center space-x-4">
              <h1 className="text-md text-gray-700">
                <span className="font-bold">{t("child")} :</span>{" "}
                {tour.child_count}
              </h1>
              <h1 className="text-md text-gray-700">
                {" "}
                <span className="font-bold">{t("adult")} :</span>{" "}
                {tour.adult_count}
              </h1>
            </div>
          </div>

          <div>
            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaLocationDot className="w-6 h-5 text-black size-4" />
              <span>
                <span className="font-medium">{t("points_of_travel")}:</span>{" "}
                {tour.tourist_spots || t("none")}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaLocationArrow className="w-6 h-5 text-black" />
              <span>
                <span className="font-medium">{t("departure_from")}:</span>{" "}
                {tour.location_from || t("na")}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <MdOutlineNoMeals className="w-6 h-5 text-black" />
              <span>
                <span className="font-medium">{t("meal_plan")}:</span>{" "}
                {tour.meal_plan === "breakfast"
                  ? "Colazione"
                  : tour.meal_plan === "half-board"
                  ? "Mezza Pensione (Colazione & Cena)"
                  : tour.meal_plan === "full-board"
                  ? "Pensione Completa (Tutti i Pasti)"
                  : "N/A"}
              </span>
            </p>

            <div className="flex items-center space-x-2">
              <p className="text-md text-gray-600 flex items-center gap-2">
                <IoBed className="w-6 h-5 text-black" />
                <span>
                  <span className="font-medium">
                    {t("type_of_accommodation")}:
                  </span>{" "}
                  {tour.type_of_accommodation === "hotel"
                    ? "Hotel"
                    : tour.type_of_accommodation === "resort"
                    ? "Resort"
                    : tour.type_of_accommodation === "homestay"
                    ? "Famiglia"
                    : tour.type_of_accommodation === "apartment"
                    ? "Appartamento"
                    : tour.type_of_accommodation === "hostel"
                    ? "Ostello"
                    : "N/A"}
                </span>
              </p>
              <p className="text-md text-gray-600 flex items-center gap-2">
                {tour.minimum_star_hotel
                  ? "⭐".repeat(Number(tour.minimum_star_hotel))
                  : t("na")}
              </p>
            </div>

            {/* <p className="text-md text-gray-600 flex items-center gap-2">
              <FaStar className="w-6 h-5 text-black" />
              <span>{tour.minimum_star_hotel || t("na")}</span>
            </p> */}

            <p className="text-md text-gray-600 flex items-center gap-2">
              <FaClock className="w-6 h-5 text-black" />
              <span>
                <span className="font-medium">{t("duration")}:</span>{" "}
                {tour.duration
                  ? `${tour.duration} ${
                      Number(tour.duration) === 1 ? t("day") : t("days")
                    }`
                  : "N/A"}
              </span>
            </p>

            <p className="text-md text-gray-600 flex items-center gap-2">
              <MdVerifiedUser className="w-7 h-6 text-green-500" />
              <span>
                <span className="font-medium">{t("contact_verified")}</span>
              </span>
            </p>

            <h1 className="text-[16px] py-2 font-bold ">
              * {t("image_generated_automatically")}
            </h1>
          </div>

          <div className="pt-2 w-full">
            <Dialog
              open={isPopupOpen}
              onOpenChange={(open) => {
                setIsPopupOpen(open);
                if (!open) {
                  setOfferForm({
                    budget: "",
                    comment: "",
                    discount: "",
                    applyDiscount: false,
                  });
                  setSelectedFile(null);
                }
              }}
            >
              {showSentOfferButton && (
                <DialogTrigger className="backdrop-blur-2xl" asChild>
                  <div className="relative inline-block w-full">
                    <button
                      onClick={handleSentOfferClick}
                      disabled={tour.status === "accepted" || hasMaxOffers}
                      className={`
          block w-full text-center py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-md
          ${
            tour.status === "accepted" || hasMaxOffers
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer"
          }
        `}
                    >
                      {tour.status === "accepted"
                        ? t("offer_accepted")
                        : t("sent_offer")}
                    </button>

                    {(tour.status === "accepted" || hasMaxOffers) && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
                        {tour.status === "accepted"
                          ? t("offer_accepted")
                          : t("offer_limit_reached")}
                      </div>
                    )}
                  </div>
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
                  {t("place_your_offer")}
                </h3>

                <form onSubmit={handleOfferSubmit} className="space-y-2">
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      {t("offer")}
                    </label>
                    <input
                      type="number"
                      name="budget"
                      id="budget"
                      value={offerForm.budget}
                      onChange={handleOfferChange}
                      placeholder={t("enter_budget_placeholder")}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      {t("message")}
                    </label>
                    <textarea
                      name="comment"
                      id="comment"
                      value={offerForm.comment}
                      onChange={handleOfferChange}
                      rows="4"
                      placeholder={t("enter_message_placeholder")}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="file"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      {t("upload_file_optional")}
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
                        {t("selected")}: {selectedFile.name}
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
                        {t("apply_additional_discount")}
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("discount_suggestion")}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="discount"
                      className="block text-md font-medium text-gray-700 mb-1"
                    >
                      {t("discount_percent")}
                    </label>
                    <input
                      type="number"
                      name="discount"
                      id="discount"
                      value={offerForm.discount}
                      onChange={handleOfferChange}
                      placeholder={t("discount_placeholder")}
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
                    {isOfferSubmitting ? t("submitting") : t("submit_offer")}
                  </button>
                </form>

                {/* Lista offerte già ricevute */}
                <div className="space-y-4 mt-6">
                  {isUserLoading ? (
                    <div>{t("loading_user_data")}</div>
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
                                  offer.agency?.agency_name ||
                                  t("unknown_agency")
                                } avatar`}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                              />

                              <div>
                                <span className="font-medium text-gray-900">
                                  {offer.agency?.agency_name ||
                                    t("unknown_agency")}
                                </span>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {offer.message}
                                </p>
                                {offer.file_name && (
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {t("file")}: {offer.file_name}
                                  </p>
                                )}
                                {offer.apply_discount && offer.discount > 0 && (
                                  <p className="text-xs sm:text-sm text-green-600">
                                    {t("discount")}: {offer.discount}%{" "}
                                    {t("off")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              <span className="font-semibold text-lg sm:text-xl">
                                €{offer.offered_budget || t("na")}
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
                                  {isInviteLoading
                                    ? t("sending") + "..."
                                    : t("message")}
                                </button>

                                {tour.user === currentUserId && (
                                  <button
                                    onClick={() => acceptOfferHandler(offer.id)}
                                    disabled={isAcceptLoading}
                                    className={`px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-md rounded-md transition-colors ${
                                      isAcceptLoading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-[#3776E2] text-white hover:bg-blue-700"
                                    }`}
                                  >
                                    {t("accept")}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })
                  ) : (
                    <p className="text-gray-600 text-sm">
                      {t("no_offers_available")}
                    </p>
                  )}
                  {tour.offers?.length > 3 && (
                    <button
                      onClick={() => setExpandedOffers(!expandedOffers)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {expandedOffers ? t("see_less") : t("see_more")}
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
