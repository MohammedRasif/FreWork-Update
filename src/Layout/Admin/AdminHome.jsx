"use client";
import { useState, useEffect, useRef } from "react";
import { Baby, User, X, ClipboardList, Send, CheckCircle2, XCircle, Search, Heart, ArrowUpRight, Info } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  useDeclineRequestMutation,
  useGetTourPlanPublicQuery,
  useOfferBudgetMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import AdminOfferPlan from "./AdminOfferPlan";
import AdminAcceptPlan from "./AdminAcceptPlan";
import {
  FaClock,
  FaEuroSign,
  FaList,
  FaLocationArrow,
  FaLocationDot,
  FaStar,
} from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import AdminDecline from "./AdminDecline";
import { useTranslation } from "react-i18next";
import PlanImage1 from "@/assets/img/plan-image-1.png";

const tabs = [
  { id: "all", label: "all_plans_tab", icon: ClipboardList },
  { id: "offered", label: "offered_plans_tab", icon: Send },
  { id: "accepted", label: "accepted_plans_tab", icon: CheckCircle2 },
  { id: "declined", label: "decline_plans_tab", icon: XCircle },
];

const AdminHome = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [modalType, setModalType] = useState("view");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [offerBudget, setOfferBudget] = useState(0);
  const [offerComment, setOfferComment] = useState("");
  const [offerForm, setOfferForm] = useState({
    applyDiscount: false,
    discount: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { data: userData } = useShowUserInpormationQuery();
  const { data: tourPlanPublic = [], isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [declineRequest, { isLoading: isDeclineRequestLoading }] =
    useDeclineRequestMutation();
  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    if (tabs.some((tab) => tab.id === savedTab)) setActiveTab(savedTab);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("adminActiveTab", tab);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
        setSelectedPlan(null);
        setOfferBudget(0);
        setOfferComment("");
        setOfferForm({ applyDiscount: false, discount: "" });
        setSelectedFile(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentUserEmail = localStorage.getItem("userEmail");

  const filteredPlans = tourPlanPublic.filter((plan) => {
    const matchesSearch = plan.location_to
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Offered" && plan.offered_status === true);
    const hasUserOffered =
      Array.isArray(plan.offers) &&
      plan.offers.some(
        (offer) => offer.agency?.contact_email === currentUserEmail
      );
    const isOwnPlan = plan.user === currentUserEmail;

    // ✅ Condition 2: plan_status === "accepted" হলে hide করো
    const isAccepted = plan.plan_status === "accepted";

    return matchesSearch && matchesFilter && !hasUserOffered && !isOwnPlan && !isAccepted;
  });

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

  const handleSubmitOffer = async (planId, budget, comment) => {
    if (!localStorage.getItem("access_token")) {
      toast.error(t("login_to_submit_offer"));
      return;
    }
    if (!budget || !comment.trim()) {
      toast.error(t("provide_budget_and_comment"));
      return;
    }
    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || offerForm.discount <= 0)
    ) {
      toast.error(t("provide_valid_discount"));
      return;
    }

    setIsOfferSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(budget));
      formData.append("message", comment);
      formData.append("apply_discount", offerForm.applyDiscount);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0
      );
      if (selectedFile) formData.append("file", selectedFile);

      await offerBudgetToBack({ id: planId, data: formData }).unwrap();

      const newOffer = {
        id: `${localStorage.getItem("user_id")}-${Date.now()}`,
        offered_budget: Number.parseFloat(budget),
        message: comment,
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
      setSelectedFile(null);
      toast.success(t("offer_submitted_success"));
      navigate("/agentie/mesaje");
    } catch (error) {
      toast.error(
        error?.data?.error || error?.error || t("failed_to_submit_offer")
      );
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  const handleDeclineRequest = async (planId) => {
    if (!localStorage.getItem("access_token")) {
      toast.error(t("login_to_decline"));
      return;
    }
    try {
      await declineRequest({ id: planId }).unwrap();
      toast.success(t("request_declined_success"));
    } catch (error) {
      toast.error(error?.data?.error || t("failed_to_decline"));
    }
  };

  const openPopup = (plan, type = "view") => {
    setSelectedPlan({ ...plan, offers: plan.offers || [] });
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
    setSelectedFile(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        if (isTourPlanPublicLoading) {
          return (
            <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm font-medium text-[#617082]" role="status">
              {t("loading_plans")}
            </div>
          );
        }
        if (!filteredPlans.length) {
          return (
            <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-center text-base font-semibold text-[#172b43] shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
              {t("no_plans_found")}
            </div>
          );
        }
        return filteredPlans.map((plan) => {
          const offerLimitReached = plan.offer_count > 3;
          const alreadyOffered = plan.offered_status === true;
          const hideOfferButton = offerLimitReached || alreadyOffered;

          return (
            <div
              key={plan.id}
              className="mb-5 overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="relative shrink-0 bg-[#f4eee4] lg:w-[215px]">
                  <img
                    src={plan.spot_picture_url || PlanImage1}
                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
                    alt={t("tourist_spot")}
                    className="h-44 w-full object-cover lg:h-full lg:min-h-[220px]"
                  />
                </div>
                <div className="min-w-0 flex-1 p-5 lg:flex lg:justify-between lg:gap-5 lg:p-6">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a36f1d]">{t("all_plans_tab")}</p>
                    <h2 className="mb-3 break-words text-xl font-bold tracking-tight text-[#172b43] sm:text-2xl">
                      {plan.location_to}
                    </h2>
                    <div className="space-y-2 text-sm text-[#617082]">
                      <p>
                        {t("dates")}:{" "}
                        <span className="font-medium">
                          {plan.start_date} — {plan.end_date || plan.start_date}
                        </span>
                      </p>
                      <p>
                        <span className="">{t("category")}:</span>{" "}
                        <span className="font-medium">
                          {plan.destination_type === "beach"
                            ? t("beach")
                            : plan.destination_type === "mountain"
                            ? t("mountain")
                            : plan.destination_type === "relax"
                            ? t("relaxation")
                            : plan.destination_type === "group"
                            ? t("group")
                            : t("na")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex shrink-0 flex-col gap-3 border-t border-[#f0eee9] pt-4 lg:mt-0 lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="lg:flex lg:items-end lg:justify-between lg:flex-col lg:space-x-0">
                      <div className="text-left lg:text-right">
                        <p className="flex items-center text-lg font-bold text-[#172b43]">
                          {t("budget")} <FaEuroSign /> {plan.budget}
                        </p>
                        <p className="text-sm text-[#617082]">
                          {t("total")} {plan.total_members}{" "}
                          {plan.total_members === 1 ? t("person") : t("persons")}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 lg:justify-end">
                        <button
                          onClick={() => openPopup(plan, "view")}
                          className="min-h-10 cursor-pointer rounded-xl border border-[#d8dfe5] bg-white px-4 text-sm font-bold text-[#172b43] transition-colors hover:bg-[#f7f3ec]"
                        >
                          {t("view")}
                        </button>

                        {/* ✅ Send Offer button — condition চেক করে দেখাচ্ছি */}
                        {hideOfferButton ? (
                          <span className="text-xs text-gray-500 italic">
                            {alreadyOffered
                              ? t("already_offered") // "তুমি already offer পাঠিয়েছ"
                              : t("max_offers_reached")} {/* offer_count > 3 */}
                          </span>
                        ) : (
                          <button
                            onClick={() => openPopup(plan, "offer")}
                            className="min-h-10 rounded-xl bg-[#c88f2a] px-4 text-sm font-bold text-white transition-colors hover:bg-[#ad751c]"
                          >
                            {t("send_offer")}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeclineRequest(plan.id)}
                          disabled={isDeclineRequestLoading}
                          className={`min-h-10 rounded-xl border border-[#d8dfe5] bg-white px-4 text-sm font-semibold text-[#617082] transition-colors hover:bg-[#fff3ee] hover:text-[#9d4635] ${
                            isDeclineRequestLoading
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isDeclineRequestLoading
                            ? t("declining")
                            : t("decline_request")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        });
      case "declined":
        return <AdminDecline />;
      case "offered":
        return <AdminOfferPlan />;
      case "accepted":
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
                  <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                    <div>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <BsFillCalendarDateFill className="w-6 h-5 text-gray-900 size-4" />
                        <span>
                          <span className="font-bold">{t("dates")}:</span>{" "}
                          <span className="font-medium">
                            {selectedPlan.start_date} 
                            {/* {selectedPlan.end_date || selectedPlan.start_date} */}
                          </span>
                        </span>
                      </p>
                      {/* <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <FaLocationDot className="w-6 h-5 text-gray-900 size-4" />
                        <span>
                          <span className="font-bold">
                            {t("points_of_travel")}:
                          </span>{" "}
                          {selectedPlan.tourist_spots || t("none")}
                        </span>
                      </p> */}
                      {/* <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <FaLocationArrow className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">
                            {t("departure_from")}:
                          </span>{" "}
                          {selectedPlan.location_from || t("na")}
                        </span>
                      </p> */}
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <MdOutlineNoMeals className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">{t("meal_plan")}:</span>{" "}
                          {selectedPlan.meal_plan === "breakfast"
                            ? t("breakfast")
                            : selectedPlan.meal_plan === "half-board"
                            ? t("half_board")
                            : selectedPlan.meal_plan === "full-board"
                            ? t("full_board")
                            : "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <IoBed className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">
                            {t("type_of_accommodation")}:
                          </span>{" "}
                          {selectedPlan.type_of_accommodation === "hotel"
                            ? t("hotel")
                            : selectedPlan.type_of_accommodation === "resort"
                            ? t("resort")
                            : selectedPlan.type_of_accommodation === "homestay"
                            ? t("homestay")
                            : selectedPlan.type_of_accommodation === "apartment"
                            ? t("apartment")
                            : selectedPlan.type_of_accommodation === "hostel"
                            ? t("hostel")
                            : "N/A"}
                        </span>
                        <p className="text-md text-gray-600 flex items-center gap-2">
                          {selectedPlan.minimum_star_hotel
                            ? "⭐".repeat(
                                Number(selectedPlan.minimum_star_hotel)
                              )
                            : t("na")}
                        </p>
                      </p>
                      {/* <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <Baby className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">{t("child")}:</span>{" "}
                          {selectedPlan.child_count}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <User className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">{t("adult")}:</span>{" "}
                          {selectedPlan.adult_count}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <FaClock className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-medium">{t("duration")}:</span>{" "}
                          {selectedPlan.duration
                            ? `${selectedPlan.duration} ${
                                Number(selectedPlan.duration) === 1
                                  ? t("day")
                                  : t("days")
                              }`
                            : "N/A"}
                        </span>
                      </p> */}
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <MdVerifiedUser className="w-7 h-6 text-green-500" />
                        <span>
                          <span className="font-medium">
                            {t("contact_verified")}
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 flex items-center">
                      {t("budget")} <FaEuroSign /> {selectedPlan.budget}
                    </p>
                    <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                      {t("total")} {selectedPlan.total_members}{" "}
                      {selectedPlan.total_members === 1
                        ? t("person")
                        : t("persons")}
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
                  {t("interested_travel_points")}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedPlan.tourist_spots ? (
                    selectedPlan.tourist_spots
                      .split(",")
                      .map((location, index) => (
                        <span
                          key={index}
                          className="text-xs sm:text-sm lg:text-sm font-medium text-[#DD9E2C] hover:underline cursor-pointer"
                        >
                          {location.trim()}
                          {index <
                            selectedPlan.tourist_spots.split(",").length - 1 &&
                            ", "}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs sm:text-sm lg:text-sm text-gray-600">
                      {t("none")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-4 relative">
                <img
                  src={selectedPlan.spot_picture_url || PlanImage1}
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = PlanImage1; }}
                  alt={t("tour_destination")}
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
              {t("place_your_offer")}
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="number"
                placeholder={t("enter_your_budget")}
                value={offerBudget}
                onChange={(e) => setOfferBudget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent bg-white"
              />
              <textarea
                placeholder={t("enter_your_comment")}
                value={offerComment}
                onChange={(e) => setOfferComment(e.target.value)}
                className="w-full resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent bg-white"
                rows="4"
              />
              <div className="mt-4">
                <label className="block lg:text-md font-medium text-gray-700 mb-1">
                  {t("upload_file_optional")}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-transparent bg-white"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    {t("selected")}: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="applyDiscount"
                    checked={offerForm.applyDiscount}
                    onChange={handleOfferChange}
                    className="h-4 w-4 text-[#DD9E2C] focus:ring-[#DD9E2C] border-gray-300 rounded"
                  />
                  <span className="ml-2 lg:text-md text-gray-700">
                    {t("apply_additional_discount")}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {t("discount_suggestion")}
                </p>
              </div>
              <div className="mt-4 mb-2">
                <label
                  htmlFor="discount"
                  className="block lg:text-md font-medium text-gray-700 mb-1"
                >
                  {t("discount")}
                </label>
                <input
                  type="number"
                  name="discount"
                  value={offerForm.discount}
                  onChange={handleOfferChange}
                  placeholder={t("enter_discount_percentage")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#DD9E2C] focus:border-[#DD9E2C] transition"
                  disabled={!offerForm.applyDiscount}
                />
              </div>
              <button
                onClick={() =>
                  handleSubmitOffer(selectedPlan.id, offerBudget, offerComment)
                }
                className={`px-3 py-2 font-medium rounded-md transition-colors flex items-center gap-3 justify-center ${
                  isOfferSubmitting || !offerBudget || !offerComment.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#c88f2a] text-white hover:bg-[#ad751c]"
                }`}
                disabled={
                  isOfferSubmitting || !offerBudget || !offerComment.trim()
                }
              >
                <IoIosSend size={24} />
                <span>
                  {isOfferSubmitting ? t("submitting") : t("submit_offer")}
                </span>
              </button>
            </div>
          </div>
          {selectedPlan.offers && selectedPlan.offers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {t("offers")}
              </h3>
              {selectedPlan.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="mb-3 flex flex-col justify-between gap-3 rounded-xl border border-[#e9e6e0] bg-[#faf9f6] px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#172b43] text-sm font-bold text-white">
                      {(offer.agency?.agency_name || "A").charAt(0).toUpperCase()}
                      {offer.agency?.logo_url && <img src={offer.agency.logo_url} onError={(event) => { event.currentTarget.style.display = "none"; }} alt={`${offer.agency.agency_name} avatar`} className="absolute inset-0 h-full w-full object-cover" />}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900">
                        {offer.agency.agency_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {offer.apply_discount && offer.discount > 0 && (
                      <span className="text-sm text-green-600">
                        ({offer.discount}% {t("off")})
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
    <div className="agency-home min-w-0">
      <Toaster />
      <section className="rounded-[26px] bg-[#172b43] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="mb-5 h-1 w-11 rounded-full bg-[#d6a044]" />
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t("welcome")}</h2>
        <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">{t("choose_perfect_offer")}</p>
      </section>

      <nav aria-label={t("my_board")} className="mt-6 grid grid-cols-2 gap-2 rounded-[20px] border border-[#e9e6e0] bg-white p-2 shadow-[0_10px_35px_rgba(23,43,67,0.04)] xl:grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => handleTabChange(id)} aria-current={activeTab === id ? "page" : undefined}
            className={"flex min-h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 text-center text-xs font-semibold leading-tight transition-colors sm:gap-2 sm:px-3 sm:text-sm " + (activeTab === id ? "bg-[#172b43] text-white shadow-sm" : "text-[#536477] hover:bg-[#f7f3ec] hover:text-[#172b43]")}>
            <Icon size={17} className="shrink-0" aria-hidden="true" /><span>{t(label)}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 grid min-w-0 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div><div className="mb-3 h-1 w-10 rounded-full bg-[#d6a044]" /><h3 className="text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t(tabs.find((tab) => tab.id === activeTab)?.label || "all_plans_tab")}</h3></div>
            {activeTab === "all" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block min-w-0 flex-1">
                  <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b99a7]" aria-hidden="true" />
                  <span className="sr-only">{t("search_by_tour_location")}</span>
                  <input type="search" placeholder={t("search_by_tour_location")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-11 w-full rounded-xl border border-[#dce2e8] bg-white pl-10 pr-4 text-sm text-[#172b43] outline-none focus:border-[#c88f2a] focus:ring-2 focus:ring-[#c88f2a]/15 sm:w-60" />
                </label>
                <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label={t("filters")} className="h-11 rounded-xl border border-[#dce2e8] bg-white px-3 text-sm font-medium text-[#34485c] outline-none focus:border-[#c88f2a] focus:ring-2 focus:ring-[#c88f2a]/15">
                  <option value="All">{t("all")}</option>
                  <option value="Offered">{t("offered")}</option>
                </select>
              </div>
            )}
          </div>
          {renderContent()}
        </section>

        <aside className="space-y-5">
          <div className="rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><Heart size={19} aria-hidden="true" /></div>
            <h3 className="mt-4 text-base font-bold text-[#172b43]">{t("need_fast_response")}</h3>
            <NavLink to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#9b6b22] hover:underline">{t("click_here")}<ArrowUpRight size={16} aria-hidden="true" /></NavLink>
          </div>
          <div className="rounded-[22px] border border-[#eadac0] bg-[#fffaf0] p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff0d5] text-[#a36f1d]"><Info size={18} aria-hidden="true" /></span>
              <h3 className="text-sm font-bold leading-6 text-[#172b43]">{t("important_notice_for_agencies")}</h3>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#34485c]">{t("confirm_deal_mandatory")}</p>
            <p className="mt-3 text-sm leading-6 text-[#617082]">{t("final_confirmation_client")}</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-[#9d4635]">{t("penalties_for_noncompliance")}</p>
          </div>
        </aside>
      </div>

      {isPopupOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/55 p-4">
          <div
            ref={popupRef}
            className="agency-offer-modal max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_24px_70px_rgba(16,36,58,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-[#e9e6e0] p-5 sm:px-7">
              <h2 className="text-xl font-bold text-[#172b43]">
                {modalType === "view" ? t("tour_details") : t("send_offer")}
              </h2>
              <button
                onClick={closePopup}
                aria-label={t("close")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#617082] transition-colors hover:bg-[#f2f4f5]"
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
