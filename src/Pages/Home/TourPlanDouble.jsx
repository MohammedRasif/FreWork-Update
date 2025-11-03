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

// Temporary fallback for FullScreenInfinityLoader
const FullScreenInfinityLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const TourPlanDouble = () => {
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
    window.scrollTo(0, 0); // Scroll to top when component mounts
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
        []
    )
  ).sort((a, b) => a.localeCompare(b));

  // Apply client-side filtering
  useEffect(() => {
    let filteredData = tourPlanPublic || [];

    if (filters.search) {
      filteredData = filteredData.filter((tour) =>
        tour.location_to?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.min) {
      filteredData = filteredData.filter(
        (tour) => parseFloat(tour.budget) >= parseFloat(filters.min)
      );
    }

    if (filters.max) {
      filteredData = filteredData.filter(
        (tour) => parseFloat(tour.budget) <= parseFloat(filters.max)
      );
    }

    if (filters.country) {
      filteredData = filteredData.filter((tour) =>
        tour.location_to?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.destination_type) {
      filteredData = filteredData.filter(
        (tour) =>
          tour.destination_type?.toLowerCase() ===
          filters.destination_type.toLowerCase()
      );
    }

    if (filters.travel_type) {
      filteredData = filteredData.filter((tour) =>
        tour.travel_type
          ?.toLowerCase()
          .includes(filters.travel_type.toLowerCase())
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
    []
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
    file
  ) => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      toast.error("Please log in to submit an offer");
      return;
    }

    if (role !== "agency") {
      toast.error("Only agencies can submit offers");
      return;
    }

    if (!budget || isNaN(budget) || budget <= 0) {
      toast.error("Please provide a valid budget amount");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    if (
      offerForm.applyDiscount &&
      (!offerForm.discount ||
        isNaN(offerForm.discount) ||
        offerForm.discount <= 0)
    ) {
      toast.error("Please provide a valid discount percentage");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("offered_budget", Number.parseFloat(budget));
      formData.append("message", comment.trim());
      formData.append("apply_discount", offerForm.applyDiscount || false);
      formData.append(
        "discount",
        offerForm.applyDiscount ? Number.parseFloat(offerForm.discount) : 0
      );
      formData.append("file", file);

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
        file_name: file.name,
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

      toast.success("Offer submitted successfully!");
      navigate("/admin/chat");
    } catch (error) {
      console.error("Failed to submit offer:", error);
      const errorMessage =
        error?.data?.error ||
        error?.data?.detail ||
        "Failed to submit offer. Please try again.";
      toast.error(errorMessage);
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
    <div className="bg-gray-50 p-3 sm:p-4 md:p-6 pb-20 roboto">
      <Toaster />
      <div className="px-2 sm:px-4 lg:px-6">
        <button
          className="md:hidden flex items-center gap-2 mb-4 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-200"
          onClick={toggleMobileFilter}
        >
          <Menu size={18} />
          <span>Filters</span>
        </button>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-20">
          <div className="w-full md:w-3/4 lg:w-4/5 order-2 md:order-1">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-600">
                  Published Tour Plans
                </h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-auto">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                      value={filters.destination_type || ""}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">Select a category</option>
                      <option value="beach">Beach trips</option>
                      <option value="mountain">Mountain adventures</option>
                      <option value="relax">Relaxing tours</option>
                      <option value="island">Group packages</option>
                    </select>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search by destination"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl">
              {isTourPlanPublicLoading ? (
                <div className="col-span-full">
                  <FullScreenInfinityLoader />
                </div>
              ) : displayTours && displayTours.length > 0 ? (
                displayTours.map((tour) => {
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
                      className="rounded-xl bg-white shadow-sm border border-gray-200 mb-6"
                    >
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
                            <div
                              className="
      absolute bottom-6
      flex items-center justify-center space-x-8
      px-2
      w-full
    "
                            >
                              {tour.offers.map((offer) => {
                                const isAccepted = offer.status === "accepted";

                                return (
                                  <div
                                    key={offer.agency?.id || Math.random()}
                                    className={`
            relative flex items-center justify-center flex-shrink-0
            ${isAccepted ? "w-[72px] h-[72px]" : "w-16 h-16"}
          `}
                                  >
                                    {/* Accepted Badge (Background) */}
                                    {isAccepted && (
                                      <img
                                        src={img}
                                        alt="Accepted Badge"
                                        className="absolute inset-0  object-contain pointer-events-none"
                                      />
                                    )}

                                    {/* Agency Logo (Always on Top) */}
                                    <img
                                      src={
                                        offer.agency?.logo_url ||
                                        "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                                      }
                                      alt={`${
                                        offer.agency?.agency_name || "Agency"
                                      } logo`}
                                      className={`
              relative z-10
              ${isAccepted ? "w-[52px] h-[52px]" : "w-16 h-16"}
              object-contain rounded-full border bg-white
              ${isAccepted ? "border-gray-200 border-2" : "border-white"}
              flex-shrink-0
            `}
                                    />
                                  </div>
                                );
                              })}
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
                        {/* <h1 className="text-[16px] left-[70px] absolute top-2  font-semibold text-white ">
                          Image generated automatically
                        </h1> */}
                      </div>

                      <div className="flex flex-col flex-grow p-4 space-y-1 rounded-t-xl">
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
                              Real Request
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-md text-gray-700">
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {tour.start_date}
                          </p>
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {tour.destination_type || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xl font-semibold text-gray-900">
                            Budget: ${tour.budget}
                          </p>
                        </div>

                        <div className="flex items-center space-x-10">
                          <span className="text-md text-gray-700">
                            <span className="font-medium">Total:</span>{" "}
                            {tour.total_members}{" "}
                            {tour.total_members > 1 ? "people" : "person"}
                          </span>

                          <div className="flex items-center space-x-4">
                            <h1 className="text-md text-gray-700">
                              <span className="font-medium">Child :</span>{" "}
                              {tour.child_count}
                            </h1>
                            <h1>
                              <span className="font-medium">Adult :</span>{" "}
                              {tour.adult_count}
                            </h1>
                          </div>
                        </div>

                        <div>
                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaLocationDot className="w-6 h-5 text-black size-4" />
                            <span>
                              <span className="font-medium">
                                Points of travel:
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
                                Departure from:
                              </span>{" "}
                              {tour.location_from || "N/A"}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <MdOutlineNoMeals className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">Meal plan:</span>{" "}
                              {tour.meal_plan || "N/A"}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <IoBed className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                Type of accommodation:
                              </span>{" "}
                              {tour.type_of_accommodation || "N/A"}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaStar className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">
                                Minimum rating:
                              </span>{" "}
                              {tour.minimum_star_hotel || "N/A"}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <FaClock className="w-6 h-5 text-black" />
                            <span>
                              <span className="font-medium">Duration:</span>{" "}
                              {tour.duration || "N/A"}
                            </span>
                          </p>

                          <p className="text-md text-gray-600 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-5 text-green-500" />
                            <span>
                              <span className="font-medium">
                                Contact verified via email
                              </span>
                            </span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (USD)
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
                    Select Country (To)
                  </label>

                  {isTourPlanPublicLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                      Loading countries...
                    </div>
                  ) : uniqueCountries.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                      No countries found
                    </div>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-colors"
                      value={filters.country}
                      onChange={(e) =>
                        handleFilterChange("country", e.target.value)
                      }
                    >
                      <option value="">All Countries</option>
                      {uniqueCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Type
                  </label>
                  <input
                    type="text"
                    placeholder="Search by travel type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.travel_type}
                    onChange={(e) =>
                      handleFilterChange("travel_type", e.target.value)
                    }
                  />
                </div>
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
