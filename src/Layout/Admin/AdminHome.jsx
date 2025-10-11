import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IoIosSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa6";
import { MdOutlineNoMeals, MdVerifiedUser } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import AdminDecline from "./AdminDecline";

const token = localStorage.getItem("access_token");

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("All Plans");
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
  console.log(userData);

  const { data: tourPlanPublic = [], isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [declineRequest, { isLoading: isDeclineRequestLoading }] =
    useDeclineRequestMutation();

  const [isOfferSubmitting, setIsOfferSubmitting] = useState(false);

  // Close popup when clicking outside
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

  // Filter plans based on search query and filter option
  const filteredPlans = tourPlanPublic.filter((plan) => {
    const matchesSearch = plan.location_to
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Offered" && plan.offered_status === true);
    return matchesSearch && matchesFilter;
  });

  // Handle offer form changes
  const handleOfferChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Handle offer submission
  const handleSubmitOffer = async (planId, budget, comment) => {
    if (!token) {
      toast.error("Please log in to submit an offer");
      return;
    }

    if (!budget || !comment.trim()) {
      toast.error("Please provide a budget and a comment");
      return;
    }

    if (
      offerForm.applyDiscount &&
      (!offerForm.discount || offerForm.discount <= 0)
    ) {
      toast.error("Please provide a valid discount percentage");
      return;
    }

    setIsOfferSubmitting(true);

    try {
      // Create FormData to include all required fields
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(budget));
      formData.append("message", comment);
      formData.append("apply_discount", offerForm.applyDiscount);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0
      );
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await offerBudgetToBack({
        id: planId,
        data: formData,
      }).unwrap();

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
      setSelectedFile(null);
      toast.success("Offer submitted successfully");
      navigate("/admin/chat");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error(
        error.data?.error ||
          "Failed to submit offer. Only agencies can do this."
      );
    } finally {
      setIsOfferSubmitting(false);
    }
  };

  // Handle decline request
  const handleDeclineRequest = async (planId) => {
    if (!token) {
      toast.error("Please log in to decline a request");
      return;
    }

    try {
      await declineRequest({ id: planId }).unwrap();
      toast.success("Request declined successfully");
    } catch (error) {
      toast.error(error?.data?.error || "Failed to decline request");
    }
  };

  // Open/close popup
  const openPopup = (plan, type = "view") => {
    setSelectedPlan({
      ...plan,
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
    setSelectedFile(null);
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
      return filteredPlans
        .filter((plan) => !plan.offered_status) // Only include plans where offered_status is false or undefined
        .map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg bg-white shadow-sm border border-gray-200 mb-6 mx-auto"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="lg:flex relative">
                <img
                  src={
                    plan.spot_picture_url
                      ? plan.spot_picture_url
                      : "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                  }
                  alt={`${plan.location_to || "Tourist spot"}`}
                  className="w-full h-48 object-cover rounded-t-lg lg:h-44 lg:w-56 lg:rounded-l-lg lg:rounded-t-none"
                />
                {/* <h1 className="text-[14px] left-3 absolute top-2 font-semibold text-white ">
                  Image generated automatically
                </h1> */}
              </div>
              <div className="p-3 lg:flex lg:flex-1 lg:justify-between">
                <div className="flex-1 lg:-mr-0 -mr-8 pl-1 lg:pl-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2 mt-2 lg:mt-5">
                    {plan.location_to}
                  </h2>
                  <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                    <p>
                      Dates:{" "}
                      <span className="font-medium">
                        {plan.start_date} — {plan.end_date || plan.start_date}
                      </span>
                    </p>
                    <p>
                      Total members:{" "}
                      <span className="font-medium">{plan.total_members}</span>
                    </p>
                    <p>
                      Category:{" "}
                      <span className="font-medium">{plan.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:justify-end lg:items-start mb-4 space-y-3 lg:space-y-0 mt-3 lg:mt-5 lg:mr-3">
                  <div className="lg:flex lg:items-start lg:justify-between lg:flex-col lg:items-end lg:space-x-0">
                    <div className="text-center lg:text-right">
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 flex items-center justify-center lg:items-center">
                        Budget <FaEuroSign /> {plan.budget}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                        {plan.total_members} person
                      </p>
                    </div>
                    <div className="flex flex-row justify-center space-x-4 lg:flex-wrap lg:gap-2 mt-4 lg:mt-4">
                      <button
                        onClick={() => openPopup(plan, "view")}
                        className="px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm lg:text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openPopup(plan, "offer")}
                        className="px-4 py-2 bg-green-600 text-white text-xs sm:text-sm lg:text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        Send offer
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
                          ? "Declining..."
                          : "Decline request"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ));
    case "Decline Plans":
      return <AdminDecline />;
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
                  <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                    <div>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <FaLocationDot className="w-6 h-5 text-gray-500 size-4" />
                        <span>
                          <span className="font-medium">Points of travel:</span>{" "}
                          {selectedPlan.tourist_spots || "None"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <FaLocationArrow className="w-6 h-5 text-gray-500" />
                        <span>
                          <span className="font-medium">Departure from:</span>{" "}
                          {selectedPlan.location_from || "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <FaList className="w-6 h-5 text-gray-500" />
                        <span>
                          <span className="font-medium">Minimum rating:</span>{" "}
                          {selectedPlan.minimum_star_hotel || "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <MdOutlineNoMeals className="w-6 h-5 text-gray-500" />
                        <span>
                          <span className="font-medium">Meal plan:</span>{" "}
                          {selectedPlan.meal_plan || "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <IoBed className="w-6 h-5 text-gray-500" />
                        <span>
                          <span className="font-medium">
                            Type of accommodation:
                          </span>{" "}
                          {selectedPlan.type_of_accommodation || "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <FaClock className="w-6 h-5 text-gray-500" />
                        <span>
                          <span className="font-medium">Duration:</span>{" "}
                          {selectedPlan.duration || "N/A"}
                        </span>
                      </p>
                      <p className="text-md text-gray-600 flex items-center gap-2 pb-2">
                        <MdVerifiedUser className="w-7 h-6 text-green-500" />
                        <span>
                          <span className="font-medium">
                            Contact verified via email
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0">
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700 flex items-center">
                      Budget <FaEuroSign /> {selectedPlan.budget}
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
              <div className="mb-4 relative">
                <img
                  src={
                    selectedPlan.spot_picture_url ||
                    "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                  }
                  alt="Tour destination"
                  className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg"
                />
                {/* <h1 className="text-[20px] left-64 absolute top-2  font-semibold text-white ">
                  Image generated automatically
                </h1> */}
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
                <label className="block lg:text-md font-medium text-gray-700 mb-1">
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-600 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
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
                  Website suggests extra discount, increases conversions by 30%.
                  Check to offer more.
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
                  isOfferSubmitting ||
                  !offerBudget ||
                  !offerComment.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                disabled={
                  isOfferSubmitting ||
                  !offerBudget ||
                  !offerComment.trim()
                }
              >
                <IoIosSend size={24} />
                <span>
                  {isOfferSubmitting ? "Submitting..." : "Submit Offer"}
                </span>
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
                      {/* <p className="text-xs sm:text-sm text-gray-600">
                        {offer.message}
                      </p> */}
                      {/* {offer.file_name && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          File: {offer.file_name}
                        </p>
                      )} */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <span className="font-semibold text-lg sm:text-xl">
                      ${offer.offered_budget}
                    </span> */}
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
        <div className="w-full lg:w-4/5">
          <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Welcome,{" "}
              <span className="font-semibold">
                Choose perfect offer for you
              </span>
            </h1>
            {activeTab === "All Plans" && (
              <div className="flex items-center space-x-4">
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
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm lg:text-base text-gray-700"
                >
                  <option value="All">All</option>
                  <option value="Offered">Offered</option>
                </select>
              </div>
            )}
          </div>
          {renderContent()}
        </div>
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
                onClick={() => setActiveTab("Decline Plans")}
                className={`flex-shrink-0 lg:w-full text-center px-3 sm:px-4 lg:px-4 py-2 lg:py-3 text-xs sm:text-sm lg:text-base font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "Decline Plans"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Decline Plans
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