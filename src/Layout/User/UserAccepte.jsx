"use client";

import FullScreenInfinityLoader from "@/lib/Loading";
import {
  useGetAllacceptedOfferQuery,
  useGiveReviewMutation,
} from "@/redux/features/withAuth";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { FiSearch, FiStar, FiMapPin, FiUsers } from "react-icons/fi";

const UserAccepte = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search
  const { data, isLoading } = useGetAllacceptedOfferQuery();
  console.log(data, "helllllll");
  const [reviewMessage, setReviewMessage] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [giveReview, { isLoading: isReviewLoading }] = useGiveReviewMutation();

  const ratingLabels = [
    "Not good enough",
    "Average",
    "Good",
    "Liked it",
    "Excellent",
  ];

  const handleStarHover = (index) => {
    setHoveredStar(index + 1);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleStarClick = (index) => {
    setSelectedStar(index + 1);
  };

  // Filter tours based on status, date, and search query
  const today = new Date();
  const upcomingTours = data?.filter((offer) => {
    const startDate = new Date(offer.tour_plan.start_date);
    const endDate = new Date(offer.tour_plan.end_date);
    return (
      offer.status === "accepted" &&
      (!dateFilter || offer.tour_plan.start_date.includes(dateFilter)) &&
      (!searchQuery ||
        offer.tour_plan.location_to
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
    );
  }) || [];

  const completedTours = data?.filter((offer) => {
    const endDate = new Date(offer.tour_plan.end_date);
    return (
      offer.status === "completed" &&
      (!dateFilter || offer.tour_plan.end_date.includes(dateFilter)) &&
      (!searchQuery ||
        offer.tour_plan.location_to
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
    );
  }) || [];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleReviewSubmit = async () => {
    if (!selectedOffer || !selectedStar) {
      alert("Please select a rating before submitting.");
      return;
    }

    const reviewData = {
      agency_id: selectedOffer.tour_plan.id,
      rating: selectedStar,
      comment: reviewMessage,
    };

    try {
      await giveReview(reviewData).unwrap();
      toast.success("Review submitted successfully!");
      setIsReviewModalOpen(false);
      setSelectedStar(0);
      setReviewMessage("");
      setSelectedOffer(null);
    } catch (error) {
      console.error("Failed to submit review:", error.data.error);
      toast.error(
        error.data.error || "Failed to submit review. Please try again."
      );
    }
  };

  const handleCloseModal = () => {
    setIsReviewModalOpen(false);
    setSelectedStar(0);
    setReviewMessage("");
    setSelectedOffer(null);
  };

  return (
    <div className="p-4">
      <Toaster />
      {/* Header with tabs, search, and date filter */}
      <div className="flex justify-between mt-6 mb-6 border-b border-gray-300">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`text-lg font-medium pb-2 transition-colors cursor-pointer ${
              activeTab === "upcoming"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`text-lg font-medium pb-2 transition-colors cursor-pointer ${
              activeTab === "completed"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex gap-4 -mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by tour title"
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm text-gray-700 bg-white"
            />
            <FiSearch className="absolute left-3 top-2/5 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-44 text-sm text-gray-700 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "upcoming" && (
        <div>
          {isLoading ? (
            <FullScreenInfinityLoader />
          ) : upcomingTours.length === 0 ? (
            <div className="w-full rounded-xl p-4 flex justify-center h-auto items-center">
              <p className="text-[#70798F] text-lg">No upcoming tours found.</p>
            </div>
          ) : (
            upcomingTours.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="flex">
                  <div className="w-1/3 overflow-hidden">
                    <img
                      src={offer.tour_plan.spot_picture_url}
                      alt={`Tour to ${offer.tour_plan.location_to}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Tour+Image";
                      }}
                    />
                  </div>
                  <div className="w-full p-6">
                    <div className="flex justify-between items-start mb-4 h-full">
                      <div className="flex flex-col h-full">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-800">
                              Tour to {offer.tour_plan.location_to}
                            </h2>
                            {offer.status === "accepted" && (
                              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                <FaCheckCircle className="w-4 h-4 rounded-full" />
                                Offer accepted
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <FiUsers className="text-gray-600" />
                            <span className="text-lg font-semibold">
                              ${offer.offered_budget} / total{" "}
                              {offer.tour_plan.total_members} Person
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Category:{" "}
                            <span className="font-medium">
                              {offer.tour_plan.category}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mb-4">
                            <FiMapPin className="text-gray-600" />
                            <span className="font-medium">
                              Tour location: {offer.tour_plan.location_to}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-6">
                            {offer.tour_plan.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-8 mt-auto">
                          <div>
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="w-4 h-4 text-blue-600 rounded-full" />
                              <span className="text-sm font-medium">
                                Starting Date:
                              </span>
                              <span className="text-sm">
                                {offer.tour_plan.start_date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCheckCircle className="w-4 h-4 text-blue-600 rounded-full" />
                              <span className="text-sm font-medium">
                                Ending Date:
                              </span>
                              <span className="text-sm">
                                {offer.tour_plan.end_date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="">
                        <div className="flex flex-col items-end">
                           <img
                          src={offer.agency.logo_url}
                          className="rounded-full w-16 h-16 object-cover "
                          alt="Agency logo"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/64?text=Agency+Logo";
                          }}
                        />
                        </div>
                        <div className="text-right">
                          <div>
                            <div className="text-[24px] font-medium">
                              {offer.agency.agency_name}
                            </div>
                            <div>
                              <div className="text-[16px] text-gray-500">
                                {offer.agency.contact_email}
                              </div>
                              <div>
                                <div className="text-[16px] text-gray-500">
                                  {offer.agency.contact_phone}
                                </div>
                                <div>
                                  <div className="text-[16px] text-gray-500">
                                    {offer.agency.address}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-1 justify-end">
                              <FiStar className="text-yellow-400 fill-current" />
                              <span className="text-sm">4.3 (355 Reviews)</span>
                            </div> */}
                          </div>
                         
                        </div>
                       
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "completed" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <FullScreenInfinityLoader />
              </div>
            ) : completedTours.length === 0 ? (
              <div className="w-[80vh] rounded-xl p-4 flex justify-center items-center">
                <p className="text-[#70798F] text-lg">
                  No completed tours found.
                </p>
              </div>
            ) : (
              completedTours.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Previous Tour Plans
                  </h3>
                  <img
                    src={
                      offer.tour_plan.spot_picture_url ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                    }
                    alt={`Tour to ${offer.tour_plan.location_to}`}
                    className="w-full h-48 p-2 rounded-md object-cover"
                  />
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {offer.tour_plan.start_date} - {offer.tour_plan.end_date}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Tour to {offer.tour_plan.location_to}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {offer.tour_plan.description}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedOffer(offer);
                        setIsReviewModalOpen(true);
                      }}
                      className="px-4 border border-blue-600 text-blue-600 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
                    >
                      Give a review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[50vh]">
            <div className="flex items-center justify-between py-5">
              <button
                onClick={handleCloseModal}
                className="flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1"
              >
                <span>
                  <FaArrowLeft />
                </span>{" "}
                Back
              </button>
              <h2 className="text-2xl font-semibold py-1">Give a review</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How Was Your Experience With This Organization?
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, index) => (
                  <FiStar
                    key={index}
                    className={`w-6 h-6 cursor-pointer ${
                      index < (hoveredStar || selectedStar)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                    onMouseEnter={() => handleStarHover(index)}
                    onMouseLeave={handleStarLeave}
                    onClick={() => handleStarClick(index)}
                  />
                ))}
                <span className="ml-4 text-sm font-medium">
                  {(hoveredStar || selectedStar) > 0
                    ? ratingLabels[(hoveredStar || selectedStar) - 1]
                    : ""}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your experience{" "}
                <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                placeholder="Enter here"
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleReviewSubmit}
              disabled={isReviewLoading}
              className={`w-full bg-[#3776E2] text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors hover:cursor-pointer ${
                isReviewLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isReviewLoading ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccepte;