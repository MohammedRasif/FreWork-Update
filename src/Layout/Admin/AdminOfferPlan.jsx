"use client";

import { GoArrowLeft } from "react-icons/go";
import { MdVerified } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import {
 
  useGetOfferedPlanQuery,
  useLikePostMutation,
} from "@/redux/features/withAuth";

function AdminOfferPlan() {
  const [activeTab, setActiveTab] = useState("Offered Plans");
  const [offerBudgets, setOfferBudgets] = useState({}); // Track offer budget per tour plan
  const [isLiked, setIsLiked] = useState({}); // Track like state per tour plan
  const [isDropdownOpen, setIsDropdownOpen] = useState({}); // Track dropdown state per tour plan
  const dropdownRefs = useRef({}); // Refs for dropdowns per tour plan
  // const { data: offeredPlans, isLoading, isError } = useGetOfferedPlanQuery();
  // console.log(offeredPlans,"dhello")
  const {data: offeredPlans , isLoading, isError } = useGetOfferedPlanQuery()
  console.log(offeredPlans)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((tourPlanId) => {
        if (
          dropdownRefs.current[tourPlanId] &&
          !dropdownRefs.current[tourPlanId].contains(event.target)
        ) {
          setIsDropdownOpen((prev) => ({ ...prev, [tourPlanId]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle loading and error states
  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  if (isError || !offeredPlans || offeredPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Fetching plans or no plans available.
      </div>
    );
  }

  // Group offers by tour_plan.id
  const tourPlansMap = offeredPlans.reduce((acc, offer) => {
    const tourPlanId = offer.tour_plan.id;
    if (!acc[tourPlanId]) {
      acc[tourPlanId] = {
        tourPlan: offer.tour_plan,
        offers: [],
      };
    }
    acc[tourPlanId].offers.push(offer);
    return acc;
  }, {});

  // Convert to array for rendering
  const tourPlans = Object.values(tourPlansMap);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {tourPlans.map(({ tourPlan, offers }) => {
            // Calculate duration
            const startDate = new Date(tourPlan.start_date);
            const endDate = new Date(tourPlan.end_date);
            const duration =
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) +
              " Days";

            // Format destination and date
            const destination = `Tour from ${tourPlan.location_from} to ${tourPlan.location_to}`;
            const formattedDate = startDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            // Fallback for tourist spots
            const interestedLocations = tourPlan.tourist_spots
              ? tourPlan.tourist_spots.split(",")
              : ["No specific locations provided"];

            return (
              <div key={tourPlan.id} className="mb-6">
                {/* Tour Card */}
                <div className="bg-white rounded-t-lg border-x border-t border-gray-200">
                  {/* Card Header */}
                  <div className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 lg:pb-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 space-y-3 lg:space-y-0">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-2">
                          {destination}
                        </h2>
                        <div className="space-y-1 text-xs sm:text-sm lg:text-sm text-gray-600">
                          <p>
                            Willing to go on{" "}
                            <span className="font-medium">{formattedDate}</span>
                          </p>
                          <p>
                            Include:{" "}
                            <span className="font-medium">{duration}</span>
                          </p>
                          <p>
                            Category:{" "}
                            <span className="font-medium">
                              {tourPlan.category}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start justify-between lg:justify-end lg:text-right lg:flex-col lg:items-end space-x-2 lg:space-x-0 relative">
                        <div>
                          <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-700">
                            Budget ${tourPlan.budget}
                          </p>
                          <p className="text-xs sm:text-sm lg:text-md text-gray-800">
                            Total {tourPlan.total_members} person
                            {tourPlan.total_members > 1 ? "s" : ""}
                          </p>
                        </div>
                        {/* 3dot Dropdown */}
                        {/* <button
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen((prev) => ({
                              ...prev,
                              [tourPlan.id]: !prev[tourPlan.id],
                            }));
                          }}
                          className="lg:-mt-3"
                        >
                          <HiDotsVertical
                            size={18}
                            className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                          />
                        </button> */}
                        {/* {isDropdownOpen[tourPlan.id] && (
                          <div
                            ref={(el) =>
                              (dropdownRefs.current[tourPlan.id] = el)
                            }
                            className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 w-32 sm:w-36 lg:w-40 z-10"
                          >
                            <button className="block w-full text-left px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-sm text-gray-700 hover:bg-gray-100">
                              Edit Plan
                            </button>
                            <button className="block w-full text-left px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-sm text-gray-700 hover:bg-gray-100">
                              Share Plan
                            </button>
                            <button className="block w-full text-left px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-sm text-red-600 hover:bg-gray-100">
                              Delete Plan
                            </button>
                          </div>
                        )} */}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm lg:text-sm text-gray-600 leading-relaxed">
                        {tourPlan.description || "No description provided."}
                      </p>
                    </div>

                    {/* Interested Travel Points */}
                    {/* <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <p className="text-xs sm:text-sm lg:text-sm font-medium text-gray-700">
                        Interested Travel Points:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {interestedLocations.map((location, index) => (
                          <span
                            key={index}
                            className="text-xs sm:text-sm lg:text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            {location}
                          </span>
                        ))}
                      </div>
                    </div> */}
                  </div>

                  {/* Tour Image */}
                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 space-y-4">
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={
                          tourPlan.spot_picture_url ||
                          "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png?height=256&width=512"
                        }
                        alt="Tour destination"
                        className="w-full h-48 sm:h-64 lg:h-96 object-cover"
                      />
                    </div>
                    {/* Social Actions (Likes disabled as not in JSON) */}
                    {/* <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 sm:gap-6 lg:gap-6">
                        <button
                          onClick={() =>
                            setIsLiked((prev) => ({
                              ...prev,
                              [tourPlan.id]: !prev[tourPlan.id],
                            }))
                          }
                          className={`flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm cursor-pointer ${
                            isLiked[tourPlan.id]
                              ? "text-blue-600"
                              : "text-gray-600"
                          } hover:text-blue-600 transition-colors`}
                          disabled // Disable until backend supports likes
                        >
                          <ThumbsUp
                            className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4 ${
                              isLiked[tourPlan.id] ? "fill-current" : ""
                            }`}
                          />
                          <span>Likes</span>
                        </button>
                        <button className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          <span>Comments</span>
                        </button>
                        <button className="flex items-center gap-1 sm:gap-2 lg:gap-2 text-xs sm:text-sm lg:text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                          <Share2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-4 lg:h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div> */}
                  </div>
                </div>

                {/* Offers Section */}
                <div className="bg-white rounded-b-lg border-x border-b border-gray-200">
                  {/* Header */}
                  {/* <div className="px-3 sm:px-4 lg:px-6 pb-3 lg:pb-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 pt-3 flex items-center space-x-2">
                          <GoArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                          <p>All Offers</p>
                        </h3>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-8 sm:space-x-16 lg:space-x-16 pt-2">
                        <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                          Offered Budget
                        </div>
                        <div className="text-xs sm:text-sm lg:text-sm text-gray-600">
                          <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-600 flex items-center space-x-2">
                            <GoArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            <p>Back</p>
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Content */}
                  <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 space-y-4 py-3 sm:py-4 lg:py-6 border-t">
                    {/* Existing Offers */}
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-4 lg:px-4 rounded-lg space-y-3 sm:space-y-0"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 lg:gap-4">
                          <img
                            src={offer.agency.logo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
                            alt={`${offer.agency.agency_name} avatar`}
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base lg:text-base font-medium text-gray-900">
                                {offer.agency.agency_name}
                              </span>
                              {offer.agency.is_verified && (
                                <span className="text-blue-500">
                                  <MdVerified
                                    size={16}
                                    className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3 lg:gap-3">
                          <span className="text-base sm:text-lg lg:text-xl font-semibold">
                            ${offer.offered_budget}
                          </span>
                          <button className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2 bg-[#3776E2] text-white text-xs sm:text-sm lg:text-md rounded-md transition-colors">
                            {offer?.status}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Separator */}
                    {/* <div className="border-t border-gray-200 my-4"></div> */}

                    {/* Place Your Offer */}
                    {/* <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-2 sm:p-4 lg:p-4 rounded-lg space-y-3 sm:space-y-0">
                      <div className="text-gray-600 flex items-center justify-center sm:mt-8 lg:mt-8">
                        <img
                          src="https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443124/samples/smile.jpg"
                          alt="User avatar"
                          className="rounded-full w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex-shrink-0"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-lg lg:text-xl font-medium text-gray-700 mb-2">
                          Place your offer Budget here
                        </p>
                        <input
                          type="text"
                          placeholder="Enter here"
                          value={offerBudgets[tourPlan.id] || ""}
                          onChange={(e) =>
                            setOfferBudgets((prev) => ({
                              ...prev,
                              [tourPlan.id]: e.target.value,
                            }))
                          }
                          className="w-full px-2 sm:px-3 lg:px-3 py-1.5 sm:py-2 lg:py-2 text-sm sm:text-base lg:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                      </div>
                      <button
                        className={`px-2 sm:px-3 lg:px-3 py-1.5 sm:py-2 lg:py-2 font-medium rounded-md transition-colors ${
                          offerBudgets[tourPlan.id]?.trim()
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={!offerBudgets[tourPlan.id]?.trim()}
                      >
                        <IoIosSend
                          size={20}
                          className="sm:w-6 sm:h-6 lg:w-7 lg:h-7"
                        />
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminOfferPlan;
