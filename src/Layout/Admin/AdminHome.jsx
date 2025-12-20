"use client";
import { useState, useEffect, useRef } from "react";
import { Baby, User, X } from "lucide-react";
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
import { MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import AdminDecline from "./AdminDecline";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const AdminHome = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(t("all_plans_tab"));
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
    if (savedTab) setActiveTab(savedTab);
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
      .toLowerCase()
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
    return matchesSearch && matchesFilter && !hasUserOffered && !isOwnPlan;
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
      navigate("/admin/chat");
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
      case t("all_plans_tab"):
        if (isTourPlanPublicLoading) {
          return (
            <div className="text-center text-gray-600">
              {t("loading_plans")}
            </div>
          );
        }
        if (!filteredPlans.length) {
          return (
            <div className="text-center text-gray-600">
              {t("no_plans_found")}
            </div>
          );
        }
        return filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg bg-white shadow-sm border border-gray-200 mb-6 mx-auto"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:flex relative">
                <img
                  src={
                    plan.spot_picture_url ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                  }
                  alt={t("tourist_spot")}
                  className="w-full h-48 object-cover rounded-t-lg lg:h-44 lg:w-56 lg:rounded-l-lg lg:rounded-t-none"
                />
              </div>
              <div className="p-3 lg:flex lg:flex-1 lg:justify-between">
                <div className="flex-1 lg:-mr-0 -mr-8 pl-1 lg:pl-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 mt-2 lg:mt-5">
                    {plan.location_to}
                  </h2>
                  <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                    <p>
                      {t("dates")}:{" "}
                      <span className="font-medium">
                        {plan.start_date} — {plan.end_date || plan.start_date}
                      </span>
                    </p>
                    <p>
                      {t("total_members")}:{" "}
                      <span className="font-medium">{plan.total_members}</span>
                    </p>

                    <p>
                      <span className="">{t("category")}:</span>{" "}
                      <span className="font-medium">
                        {plan.destination_type === "beach"
                          ? "Mare"
                          : plan.destination_type === "mountain"
                          ? "Montagna"
                          : plan.destination_type === "relax"
                          ? "Relax"
                          : plan.destination_type === "group"
                          ? "Gruppi"
                          : t("na")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-end lg:items-start mb-4 space-y-3 lg:space-y-0 mt-3 lg:mt-5 lg:mr-3">
                  <div className="lg:flex lg:items-end lg:justify-between lg:flex-col lg:space-x-0">
                    <div className="text-center lg:text-right">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 flex items-center justify-center lg:items-center">
                        {t("budget")} <FaEuroSign /> {plan.budget}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                        {t("total")} {plan.total_members}{" "}
                        {plan.total_members === 1 ? t("person") : t("persons")}
                      </p>
                    </div>
                    <div className="flex flex-row justify-center space-x-4 lg:flex-wrap lg:gap-2 mt-4 lg:mt-4">
                      <button
                        onClick={() => openPopup(plan, "view")}
                        className="px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm lg:text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {t("view")}
                      </button>
                      <button
                        onClick={() => openPopup(plan, "offer")}
                        className="px-4 py-2 bg-green-600 text-white text-xs sm:text-sm lg:text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        {t("send_offer")}
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(plan.id)}
                        disabled={isDeclineRequestLoading}
                        className={`px-4 py-2 bg-gray-600 text-white text-xs sm:text-sm lg:text-sm font-medium rounded-md hover:bg-gray-700 transition-colors ${
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
        ));
      case t("decline_plans_tab"):
        return <AdminDecline />;
      case t("offered_plans_tab"):
        return <AdminOfferPlan />;
      case t("accepted_plans_tab"):
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
                        <FaLocationDot className="w-6 h-5 text-gray-900 size-4" />
                        <span>
                          <span className="font-bold">
                            {t("points_of_travel")}:
                          </span>{" "}
                          {selectedPlan.tourist_spots || t("none")}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <FaLocationArrow className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">
                            {t("departure_from")}:
                          </span>{" "}
                          {selectedPlan.location_from || t("na")}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <FaStar className="w-6 h-5 text-gray-900" />
                        <span>
                          <span className="font-bold">
                            {t("minimum_rating")}:
                          </span>{" "}
                          {selectedPlan.minimum_star_hotel || t("na")}
                        </span>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
                        <MdOutlineNoMeals className="w-6 h-5 text-gray-900" />
                        {/* <span>
                          <span className="font-bold">{t("meal_plan")}:</span>{" "}
                          {selectedPlan.meal_plan || t("na")}
                        </span> */}
                        <span>
                          <span className="font-bold">{t("meal_plan")}:</span>{" "}
                          {selectedPlan.meal_plan === "breakfast"
                            ? "Colazione"
                            : selectedPlan.meal_plan === "half-board"
                            ? "Mezza Pensione (Colazione & Cena)"
                            : selectedPlan.meal_plan === "full-board"
                            ? "Pensione Completa (Tutti i Pasti)"
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
                            ? "Hotel"
                            : selectedPlan.type_of_accommodation === "resort"
                            ? "Resort"
                            : selectedPlan.type_of_accommodation === "homestay"
                            ? "Famiglia"
                            : selectedPlan.type_of_accommodation === "apartment"
                            ? "Appartamento"
                            : selectedPlan.type_of_accommodation === "hostel"
                            ? "Ostello"
                            : "N/A"}
                        </span>
                        <p className="text-md text-gray-600 flex items-center gap-2">
                          {selectedPlan.minimum_star_hotel
                            ? "⭐".repeat(Number(selectedPlan.minimum_star_hotel))
                            : t("na")}
                        </p>
                      </p>
                      <p className="text-md text-gray-900 flex items-center gap-2 pb-2">
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
                          <span className="font-bold">{t("duration")}:</span>{" "}
                          {selectedPlan.duration}
                        </span>
                      </p>
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
                      {/* {t("total_persons", {
                        count: selectedPlan.total_members,
                      })} */}
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
                      {t("none")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-4 relative">
                <img
                  src={
                    selectedPlan.spot_picture_url ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                  }
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <textarea
                placeholder={t("enter_your_comment")}
                value={offerComment}
                onChange={(e) => setOfferComment(e.target.value)}
                className="w-full resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                rows="4"
              />
              <div className="mt-4">
                <label className="block lg:text-md font-medium text-gray-700 mb-1">
                  {t("upload_file_optional")}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                    : "bg-blue-600 text-white hover:bg-blue-700"
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
    <div className="min-h-screen">
      <Toaster />
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-4/5">
          <div className="mb-24 lg:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {t("welcome")},{" "}
              <span className="font-semibold">{t("choose_perfect_offer")}</span>
            </h1>
            {activeTab === t("all_plans_tab") && (
              <div className="flex items-center space-x-4">
                <div className="relative w-full lg:max-w-[30vh]">
                  <input
                    type="text"
                    placeholder={t("search_by_tour_location")}
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
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm lg:text-base text-gray-700"
                >
                  <option value="All">{t("all")}</option>
                  <option value="Offered">{t("offered")}</option>
                </select>
              </div>
            )}
          </div>
          {renderContent()}
        </div>

        <div className="fixed lg:right-3 right-[2px] lg:top-20 top-40 w-full md:w-1/6 p-3 sm:p-4 lg:p-2 z-40">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-4 lg:mb-6 text-center hidden md:block">
                {t("my_board")}
              </h3>
              <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 overflow-x-auto lg:overflow-x-visible">
                {[
                  t("all_plans_tab"),
                  t("offered_plans_tab"),
                  t("accepted_plans_tab"),
                  t("decline_plans_tab"),
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-shrink-0 lg:w-full text-center px-3 sm:px-4 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-white shadow-md border border-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="pt-4 lg:pt-6 hidden md:block">
                <div className="flex flex-col gap-1 mt-6">
                  <p className="text-sm text-gray-900 font-semibold mb-2">
                    {t("need_fast_response")}
                  </p>
                  <NavLink to="/contact">
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 underline text-left w-min text-xs"
                    >
                      {t("click_here")}
                    </Button>
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-red-600 rounded-xl shadow-lg overflow-hidden hidden md:block">
              <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                <div className="bg-white text-red-600 rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold">
                  !
                </div>
                <h3 className="text-sm lg:text-base font-bold">
                  {t("important_notice_for_agencies")}
                </h3>
              </div>
              <div className="p-4 space-y-3 text-gray-800 text-xs lg:text-sm">
                <p className="font-semibold leading-relaxed">
                  {t("confirm_deal_mandatory")}
                </p>
                <p className="leading-relaxed">
                  {t("final_confirmation_client")}
                </p>
                <p className="font-bold text-red-700 flex items-center gap-1">
                  <span className="text-xl">X</span>
                  {t("penalties_for_noncompliance")}
                </p>
              </div>
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
                {modalType === "view" ? t("tour_details") : t("send_offer")}
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
