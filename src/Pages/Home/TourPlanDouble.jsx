import { useEffect, useRef, useState, useCallback } from "react";
import { HiDotsVertical } from "react-icons/hi";
import {
  Menu,
  MapPin,
  Navigation,
  X,
  ShieldCheck,
  Clock4,
  BedDouble,
  Utensils,
  Baby,
  User,
} from "lucide-react";
import { IoBed, IoCheckmarkCircleSharp, IoPersonSharp } from "react-icons/io5";
import { MdOutlineNoMeals, MdVerified } from "react-icons/md";
import { debounce } from "lodash";
import { useNavigate } from "react-router-dom";
import {
  useAcceptOfferMutation,
  useGetTourPlanPublicQuery,
  useInviteToChatMutation,
  useOfferBudgetMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import toast, { Toaster } from "react-hot-toast";
import TourPlanPopup from "./TourPlanpopup";
import { FaListUl } from "react-icons/fa";
import {
  FaClock,
  FaList,
  FaLocationArrow,
  FaLocationDot,
  FaStar,
} from "react-icons/fa6";
import img from "../../assets/img/badge.png";
import { useTranslation } from "react-i18next";

const FullScreenInfinityLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const TourPlanDouble = () => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tours, setTours] = useState([]);
  const [tourPlanPublicUser, setTourPlanPublicUser] = useState({});
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    min: "",
    max: "",
    country: "",
    destination_type: "",
    travel_type: "",
  });
  const token = localStorage.getItem("access_token");
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const selectedCategory = localStorage.getItem("selectedCategory");
    if (selectedCategory) {
      setFilters((prev) => ({ ...prev, destination_type: selectedCategory }));
    }
  }, []);

  const { data: tourPlanPublic, isLoading: isTourPlanPublicLoading } =
    useGetTourPlanPublicQuery();
  const [offerBudgetToBack, { isLoading: isOfferBudgetLoading }] =
    useOfferBudgetMutation();
  const [acceptOffer, { isLoading: isAcceptLoading }] =
    useAcceptOfferMutation();
  const { data: userData, isLoading } = useShowUserInpormationQuery();
  const [invite, { isLoading: isInviteLoading }] = useInviteToChatMutation();

  const uniqueCountries = Array.from(
    new Set(
      tourPlanPublic?.map((tour) => tour.location_to?.trim()).filter(Boolean) ||
        [],
    ),
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    let filteredData = tourPlanPublic || [];
    if (filters.search) {
      filteredData = filteredData.filter((tour) =>
        tour.location_to?.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }
    if (filters.min) {
      filteredData = filteredData.filter(
        (tour) => parseFloat(tour.budget) >= parseFloat(filters.min),
      );
    }
    if (filters.max) {
      filteredData = filteredData.filter(
        (tour) => parseFloat(tour.budget) <= parseFloat(filters.max),
      );
    }
    if (filters.country) {
      filteredData = filteredData.filter((tour) =>
        tour.location_to?.toLowerCase().includes(filters.country.toLowerCase()),
      );
    }
    if (filters.destination_type) {
      filteredData = filteredData.filter(
        (tour) =>
          tour.destination_type?.toLowerCase() ===
          filters.destination_type.toLowerCase(),
      );
    }
    if (filters.travel_type) {
      filteredData = filteredData.filter((tour) =>
        tour.travel_type
          ?.toLowerCase()
          .includes(filters.travel_type.toLowerCase()),
      );
    }
    setTours(filteredData);
    if (filteredData && currentUserId) {
      const tourUsers = {};
      filteredData.forEach((tour) => {
        tourUsers[tour.id] = tour.user;
      });
      setTourPlanPublicUser(tourUsers);
    }
  }, [tourPlanPublic, filters, currentUserId]);

  const debouncedFilterChange = useCallback(
    debounce((name, value) => {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }, 500),
    [],
  );

  const handleFilterChange = (name, value) => {
    debouncedFilterChange(name, value);
  };

  const handleCategoryChange = (value) => {
    if (localStorage.getItem("selectedCategory")) {
      localStorage.removeItem("selectedCategory");
    }
    handleFilterChange("destination_type", value);
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

  const handleSubmitOffer = async (
    tourId,
    budget,
    comment,
    offerForm,
    file,
  ) => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_submit_offer"));
      return;
    }
    if (role !== "agency") {
      toast.error(t("only_agencies_can_submit"));
      return;
    }
    if (!budget || isNaN(budget) || budget <= 0) {
      toast.error(t("valid_budget_required"));
      return;
    }
    if (!comment.trim()) {
      toast.error(t("comment_required"));
      return;
    }
    if (
      offerForm.applyDiscount &&
      (!offerForm.discount ||
        isNaN(offerForm.discount) ||
        offerForm.discount <= 0)
    ) {
      toast.error(t("valid_discount_required"));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(budget));
      formData.append("message", comment.trim());
      formData.append("apply_discount", offerForm.applyDiscount || false);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0,
      );

      if (file) {
        formData.append("file", file);
      }

      const response = await offerBudgetToBack({
        id: tourId,
        data: formData,
      }).unwrap();

      const newOffer = {
        id: response?.id || `${currentUserId}-${Date.now()}`,
        offered_budget: Number.parseFloat(budget),
        message: comment.trim(),
        apply_discount: offerForm.applyDiscount || false,
        discount: offerForm.applyDiscount
          ? Number.parseFloat(offerForm.discount)
          : 0,
        file_name: file?.name || null,
        status: "pending",
        agency: {
          agency_name: localStorage.getItem("name") || t("unknown_agency"),
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
            : tour,
        ),
      );

      if (selectedTour && selectedTour.id === tourId) {
        setSelectedTour((prev) =>
          prev
            ? {
                ...prev,
                offers: [...(prev.offers || []), newOffer],
                offer_count: (prev.offer_count || 0) + 1,
              }
            : prev,
        );
      }

      toast.dismiss();
      toast.success(t("offer_submitted_success"));
    } catch (error) {
      const errorMessage =
        error?.data?.error ||
        error?.data?.detail ||
        t("failed_to_submit_offer");
      toast.error(errorMessage);
    }
  };

  const acceptOfferHandler = async (offerId, tourId) => {
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_accept_offer"));
      return;
    }
    try {
      await acceptOffer(offerId).unwrap();

      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === tourId
            ? {
                ...tour,
                offers: tour.offers.map((o) =>
                  o.id === offerId ? { ...o, status: "accepted" } : o,
                ),
              }
            : tour,
        ),
      );

      if (selectedTour && selectedTour.id === tourId) {
        setSelectedTour((prev) => ({
          ...prev,
          offers: prev.offers.map((o) =>
            o.id === offerId ? { ...o, status: "accepted" } : o,
          ),
        }));
      }

      toast.success(t("offer_accepted_success"));
    } catch (error) {
      toast.error(error.data?.detail || t("failed_to_accept_offer"));
    }
  };

  const handleMessage = async (data) => {
    if (!token) {
      navigate("/login");
      toast.error(t("login_to_send_message"));
      return;
    }
    const role = localStorage.getItem("role");
    try {
      await invite(data).unwrap();
      toast.success(t("chat_initiated_success"));
      navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
    } catch (error) {
      toast.error(error.data?.detail || t("failed_to_initiate_chat"));
    }
  };

  const displayTours = tours;

  return (
    <div className="bg-gray-50 p-3 sm:p-4 md:p-6 lg:pb-20 roboto ">
      <Toaster />
      <div className="px-2 sm:px-4 lg:px-6">
        <button
          className="md:hidden flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200"
          onClick={toggleMobileFilter}
        >
          <Menu size={18} />
          <span>{t("filters")}</span>
        </button>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-4 lg:pt-20">
          <div className="w-full md:w-3/4 lg:w-4/5 order-2 md:order-1">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-600">
                  {t("published_tour_plans")}
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-auto">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                      value={filters.destination_type || ""}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">{t("select_category")}</option>
                      <option value="beach">{t("beach_trips")}</option>
                      <option value="mountain">
                        {t("mountain_adventures")}
                      </option>
                      <option value="relax">{t("relaxing_tours")}</option>
                      <option value="group">{t("group_packages")}</option>
                    </select>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder={t("search_by_destination")}
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
                {t("all_posted_tour_plans_here")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl">
              {isTourPlanPublicLoading ? (
                <div className="col-span-full">
                  <FullScreenInfinityLoader />
                </div>
              ) : displayTours && displayTours.length > 0 ? (
                displayTours.map((tour) => {
                  const offerCount = tour.offer_count || 0;
                  const hasAcceptedOffer = tour.offers?.some(
                    (o) => o.status === "accepted",
                  );
                  const isOfferLimitReached = offerCount >= 3;
                  const isDisabled = hasAcceptedOffer || isOfferLimitReached;

                  let tooltipMessage = "";
                  if (hasAcceptedOffer && isOfferLimitReached) {
                    tooltipMessage = t("offer_accepted_and_limit");
                  } else if (hasAcceptedOffer) {
                    tooltipMessage = t("offer_accepted");
                  } else if (isOfferLimitReached) {
                    tooltipMessage = t("offer_limit_reached");
                  }

                  const token = localStorage.getItem("access_token");
                  const role = token ? localStorage.getItem("role") : null;
                  const showSentOfferButton = role === "agency" || !token;

                  const handleSentOfferClick = () => {
                    if (!token) {
                      navigate("/login");
                      toast.error(t("login_to_submit_offer"));
                      return;
                    }

                    const role = localStorage.getItem("role");
                    const agencyVerified =
                      localStorage.getItem("agency_is_verified") === "true";

                    if (role === "agency") {
                      if (!agencyVerified) {
                        navigate("/in-attesa");
                        toast.info(
                          t("agency_verification_pending") ||
                            "Your agency profile is under verification. Please wait.",
                        );
                        return;
                      }
                      setSelectedTour(tour);
                      setIsPopupOpen(true);
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
                  return (
                    <div
                      key={tour.id}
                      className="rounded-xl bg-white shadow-sm border border-gray-200 mb-6 relative"
                    >
                      {isDisabled && showSentOfferButton && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                          <div className="relative h-full w-full">
                            <div
                              className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                              style={{ bottom: "4.5rem" }}
                            >
                              {tooltipMessage}
                              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <div className="overflow-hidden">
                          <img
                            src={
                              tour.spot_picture_url ||
                              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                            }
                            alt={`${tour.location_to} destination`}
                            className="w-full h-72 object-cover hover:scale-105 transition-transform duration-300 rounded-t-xl"
                          />
                          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-center text-white rounded-t-xl">
                            <h2 className="text-2xl md:text-4xl font-semibold text-center px-4 mb-2">
                              {tour.location_to}
                            </h2>
                          </div>

                          {tour.offers && tour.offers.length > 0 && (
                            <div className="absolute bottom-6 flex items-center justify-center space-x-8 px-2 w-full">
                              {tour.offers.map((offer) => {
                                const isAccepted = offer.status === "accepted";
                                return (
                                  <div
                                    key={offer.agency?.id || Math.random()}
                                    className={`relative flex items-center justify-center flex-shrink-0 ${
                                      isAccepted
                                        ? "w-[72px] h-[72px]"
                                        : "w-16 h-16"
                                    }`}
                                  >
                                    {isAccepted && (
                                      <img
                                        src={img}
                                        alt={t("accepted_badge")}
                                        className="absolute inset-0 object-contain pointer-events-none"
                                      />
                                    )}
                                    <img
                                      src={
                                        offer.agency?.logo_url ||
                                        "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                      }
                                      alt={`${
                                        offer.agency?.agency_name || "Agency"
                                      } logo`}
                                      className={`relative z-10 ${
                                        isAccepted
                                          ? "w-[52px] h-[52px]"
                                          : "w-16 h-16"
                                      } object-contain rounded-full border bg-white ${
                                        isAccepted
                                          ? "border-gray-200 border-2"
                                          : "border-white"
                                      } flex-shrink-0`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {offerCount >= 3 && (
                            <div className="text-sm text-white px-2 rounded-full py-1 font-medium mt-3 absolute top-0 right-5 bg-green-600 flex items-center">
                              <IoCheckmarkCircleSharp
                                className="mr-1"
                                size={16}
                              />
                              {t("offers_completed")}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col flex-grow p-4 space-y-1 rounded-t-xl group">
                        <div className="flex items-center justify-between">
                          <h3 className="lg:text-3xl text-2xl font-semibold text-gray-900">
                            {tour.location_to.length > 8
                              ? `${tour.location_to.slice(0, 8)}...`
                              : tour.location_to}
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
                          <p>
                            <span className="font-medium">{t("date")}:</span>{" "}
                            {tour.start_date} to {tour.end_date}
                          </p>

                          <p>
                            <span className="font-medium">
                              {t("category")}:
                            </span>{" "}
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
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-900">
                            {t("budget")}: €{tour.budget}
                          </p>
                        </div>
                        <div className="flex items-center space-x-10">
                          <span className="text-md text-gray-700">
                            <span className="font-medium">{t("total")}:</span>{" "}
                            {tour.total_members}{" "}
                            {tour.total_members > 1 ? t("people") : t("person")}
                          </span>
                          {/* <div className="flex items-center space-x-4">
                            <h1 className="text-md text-gray-700">
                              <span className="font-medium">
                                {t("child")} :
                              </span>{" "}
                              {tour.child_count}
                            </h1>
                            <h1>
                              <span className="font-medium">
                                {t("adult")} :
                              </span>{" "}
                              {tour.adult_count}
                            </h1>
                          </div> */}
                        </div>

                        <div>
                          <p className="text-md text-gray-600 flex items-center gap-2 ">
                            <User className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">{t("adult")}:</span>{" "}
                              {tour.adult_count}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2 ">
                            
                            <Baby className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">{t("child")}:</span>{" "}
                              {tour.child_count}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationDot className="w-6 h-5 text-black size-4" />
                            <span>
                              <span className="font-medium">
                                {t("points_of_travel")}:
                              </span>{" "}
                              {tour.tourist_spots.length > 14
                                ? `${tour.tourist_spots.slice(0, 14)}...`
                                : tour.tourist_spots}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationArrow className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                {t("departure_from")}:
                              </span>{" "}
                              {tour.location_from || "N/A"}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MdOutlineNoMeals className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                {t("meal_plan")}:
                              </span>{" "}
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
                                      : tour.type_of_accommodation ===
                                          "apartment"
                                        ? "Appartamento"
                                        : tour.type_of_accommodation ===
                                            "hostel"
                                          ? "Ostello"
                                          : "N/A"}
                              </span>
                            </p>
                            {/* <p className="text-md text-gray-600 flex items-center gap-2 -space-x-[6px]">
                                          
                                          <span>{tour.minimum_star_hotel|| t("na")}</span><FaStar className="w-4 h-4 text-black" />
                                        </p> */}
                            <p className="text-md text-gray-600 flex items-center gap-2">
                              {tour.minimum_star_hotel
                                ? "⭐".repeat(Number(tour.minimum_star_hotel))
                                : t("na")}
                            </p>
                          </div>
                          {/* <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaStar className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                {t("minimum_rating")}:
                              </span>{" "}
                              {tour.minimum_star_hotel || "N/A"}
                            </span>
                          </p> */}
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaClock className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                {t("duration")}:
                              </span>{" "}
                              {tour.duration
                                ? `${tour.duration} ${
                                    Number(tour.duration) === 1
                                      ? t("day")
                                      : t("days")
                                  }`
                                : "N/A"}
                            </span>
                          </p>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-5 text-green-500" />
                            <span>
                              <span className="font-medium">
                                {t("contact_verified")}
                              </span>
                            </span>
                          </p>
                        </div>
                        {showSentOfferButton && (
                          <div className="pt-2 w-full">
                            <button
                              onClick={handleSentOfferClick}
                              disabled={token && isDisabled}
                              className={`block w-full text-center py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-md relative group ${
                                token && isDisabled
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              {t("sent_offer")}
                              {token && isDisabled && (
                                <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                  {tooltipMessage}
                                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full h-[36vh] text-3xl font-semibold text-center pt-40">{t("no_tours_found")}</div>
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("filters")}
                </h3>
                <button
                  className="md:hidden text-gray-500"
                  onClick={toggleMobileFilter}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("price_range_usd")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder={t("min")}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.min}
                      onChange={(e) =>
                        handleFilterChange("min", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder={t("max")}
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
                    {t("select_country_to")}
                  </label>
                  {isTourPlanPublicLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                      {t("loading_countries")}
                    </div>
                  ) : uniqueCountries.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                      {t("no_countries_found")}
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                      value={filters.country}
                      onChange={(e) =>
                        handleFilterChange("country", e.target.value)
                      }
                    >
                      <option value="">{t("all_countries")}</option>
                      {uniqueCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("travel_type")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("search_by_travel_type")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.travel_type}
                    onChange={(e) =>
                      handleFilterChange("travel_type", e.target.value)
                    }
                  />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPopupOpen && selectedTour && (
        <TourPlanPopup
          tour={selectedTour}
          onClose={closePopup}
          handleMessage={handleMessage}
          handleAcceptOffer={acceptOfferHandler}
          isAcceptLoading={isAcceptLoading}
          userData={userData}
          tourPlanPublicUser={tourPlanPublicUser}
          handleSubmitOffer={handleSubmitOffer}
          isOfferBudgetLoading={isOfferBudgetLoading}
        />
      )}
    </div>
  );
};

export default TourPlanDouble;
