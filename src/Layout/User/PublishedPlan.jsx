"use client";

import { GoArrowLeft } from "react-icons/go";
import { MdVerified } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPlansQuery } from "@/redux/features/withAuth";
import FullScreenInfinityLoader from "@/lib/Loading";

function PublishedPlan() {
  const { data: posts, isLoading, isError } = useGetPlansQuery();
  const [activeTab, setActiveTab] = useState("Offered Plans");
  const [offerBudget, setOfferBudget] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const dropdownRef = useRef(null);

  // Filter plans with status "published"
  const publishedPlans = posts
    ? posts.filter((plan) => plan.status === "published")
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResponseClick = (offer) => {
    setSelectedAgency(offer);
    setShowAgencyModal(true);
    setShowReviews(false);
  };

  const handleReviewsClick = () => {
    setShowReviews(!showReviews);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-yellow-500">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="text-gray-300">
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) return <FullScreenInfinityLoader />;
  if (isError) return <div>Error loading plans</div>;
  if (!publishedPlans.length) return <div>No published plans available</div>;

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="flex">
        <div className="flex-1 flex flex-col gap-3">
          {publishedPlans.map((plan) => (
            <div key={plan.id}>
              <div className="bg-white rounded-t-lg border-x border-t border-gray-200">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Tour from {plan.location_from} to {plan.location_to}
                      </h2>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          Willing to go on{" "}
                          <span className="font-medium">{plan.start_date}</span>
                        </p>
                        <p>
                          Duration:{" "}
                          <span className="font-medium">
                            {plan.duration} Days
                          </span>
                        </p>
                        <p>
                          Category:{" "}
                          <span className="font-medium">{plan.category}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-2 relative">
                      <div>
                        <p className="text-lg font-bold text-gray-700">
                          Budget ${plan.budget}
                        </p>
                        <p className="text-md text-gray-800">
                          Total {plan.total_members} person
                          {plan.total_members > 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                      >
                        <HiDotsVertical
                          size={22}
                          className="cursor-pointer text-gray-600 hover:text-gray-800 transition-colors -mt-3"
                        />
                      </button>
                      {isDropdownOpen && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 w-40 z-10"
                        >
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Edit Plan
                          </button>
                          <button className="block  w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Share Plan
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                            Delete Plan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                  <div className="mb-6 flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-700">
                      Interested Travel Points:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {plan.tourist_spots ? (
                        plan.tourist_spots.split(",").map((spot, index) => (
                          <span
                            key={index}
                            className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                          >
                            {spot.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          None specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={
                        plan.spot_picture_url ||
                        "/placeholder.svg?height=256&width=512"
                      }
                      alt="Tour destination"
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      {plan.like_count > 0 && (
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-1">
                            <ThumbsUp className="w-3 h-3 text-white fill-current" />
                          </div>
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center -ml-2">
                            <Heart className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                      )}
                      <span className="text-sm text-gray-600 ml-2">
                        {plan.like_count} Likes
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>0 Comments</span>
                      <span>{plan.share_count} Share</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex items-center gap-2 text-sm cursor-pointer ${
                          isLiked ? "text-blue-600" : "text-gray-600"
                        } hover:text-blue-600 transition-colors`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                        />
                        <span>Likes</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span>Comments</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-b-lg border-x border-b border-gray-200">
                <div className="px-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-600 pt-3 flex items-center space-x-2">
                        <GoArrowLeft />
                        <p>All Offers</p>
                      </h3>
                    </div>
                    <div className="flex items-center space-x-16 pt-2">
                      <div className="text-sm text-gray-600">
                        Offered Budget
                      </div>
                      <div className="text-sm text-gray-600">
                        <h3 className="text-xl font-semibold text-gray-600 flex items-center space-x-2">
                          <GoArrowLeft />
                          <p>Back</p>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6 space-y-4 py-6">
                  {plan.offers && plan.offers.length > 0 ? (
                    plan.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between px-4 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={offer.image || "/placeholder.svg"}
                            alt={`${offer.company} avatar`}
                            className="w-11 h-11 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {offer.company}
                              </span>
                              {offer.verified && (
                                <div className="flex space-x-1">
                                  <div className="rounded-full flex items-center justify-center">
                                    <span className="text-blue-500">
                                      <MdVerified size={24} />
                                    </span>
                                  </div>
                                  <div className="rounded-full flex items-center justify-center">
                                    <span className="text-green-500">
                                      <MdVerified size={24} />
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xl">
                              💰 {offer.budget}
                            </span>
                          </div>
                          <button
                            onClick={() => handleResponseClick(offer)}
                            className="px-5 py-2 bg-[#3776E2] text-white text-md rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Response
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 text-sm">
                      No offers available
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAgencyModal && selectedAgency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-[63vw] max-h-[80vh] overflow-hidden">
            <div className="flex h-[450px]">
              <div className="w-1/2 relative">
                <button
                  onClick={() => setShowAgencyModal(false)}
                  className="absolute top-4 bg-gray-500 text-white px-4 py-2 rounded-r-full flex items-center gap-2 z-10 cursor-pointer transition-colors"
                >
                  <GoArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <img
                  src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529170/samples/landscapes/nature-mountains.jpg"
                  alt="Agency"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/2 p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <img
                        src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529167/samples/ecommerce/analog-classic.jpg"
                        className="rounded-full w-16 h-16 object-cover"
                        alt="Agency Logo"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {selectedAgency.company}
                      </h2>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-600">4.5 (355 </span>
                        <button
                          onClick={handleReviewsClick}
                          className="text-sm text-blue-600 hover:underline cursor-pointer"
                        >
                          Reviews
                        </button>
                        <span className="text-sm text-gray-600">)</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Response
                  </button>
                </div>
                <div className="mb-6 flex-1">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Aspen is as close as one can get to a storybook alpine town
                    in America. The choose-your-own-adventure
                    possibilities—skiing, hiking, dining shopping and ....Aspen
                    is as close as one can get to a storybook alpine town in
                    America.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Facilities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        Dinner
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        Breakfast
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        Lunch
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        Snacks(3/day)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        24/7 Support during tour
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <FaCheckCircle className="w-3 h-3 text-blue-500" />
                        Local Guides and Language Support
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {showReviews && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -20 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="border-t border-gray-200 overflow-hidden"
                  style={{ transformOrigin: "top" }}
                >
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-6 space-y-6"
                  >
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 -mt-5">
                        Recent Reviews
                      </h3>
                      <div className="space-y-4 max-h-56 overflow-y-auto">
                        {/* Placeholder for reviews, as no review data is provided */}
                        <div className="text-gray-600 text-sm">
                          No reviews available
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublishedPlan;
