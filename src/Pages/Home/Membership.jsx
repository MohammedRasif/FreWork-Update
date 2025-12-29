import { Search, Star, MessageCircle, X } from "lucide-react";
import { VscVerifiedFilled } from "react-icons/vsc";
import { FaHeart } from "react-icons/fa";
import {
  useGetAllAgencyQuery,
  useGetTopAgencyQuery,
  useSearchAgencyQuery,
} from "@/redux/features/baseApi";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import FullScreenInfinityLoader from "@/lib/Loading";
import { useNavigate } from "react-router-dom";
import {
  useAddToFavoritMutation,
  useInviteToChatMutation,
  useShowUserInpormationQuery,
} from "@/redux/features/withAuth";
import { toast, ToastContainer } from "react-toastify";
import { FaAward } from "react-icons/fa6";
import { RiAwardLine } from "react-icons/ri";
import { useTranslation } from "react-i18next";

const Membership = () => {
  const { t } = useTranslation();
  const [agency, setAgency] = useState([]);
  const [topAgencie, setTopAgency] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("access_token");
  const currentUserId = parseInt(localStorage.getItem("user_id"), 10);
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: AgencyAll, isLoading: isAgencyDataLoading } =
    useGetAllAgencyQuery();
  const { data: TopAgencies, isLoading: isTopAgencyLoading } =
    useGetTopAgencyQuery();
  const { data: SearchAgencies, isLoading: isSearchLoading } =
    useSearchAgencyQuery(searchTerm, { skip: !searchTerm });
  const [addToFavo, { isLoading: isAddFevLoading }] = useAddToFavoritMutation();
  const { data: userData, isLoading } = useShowUserInpormationQuery();

  const [invite, { isLoading: isInviteLoading, isError: isInviteError }] =
    useInviteToChatMutation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };
  const handleOpenReviews = (plan) => {
    setSelectedPlan(plan);
    setShowReviewModal(true);
  };

  const handleCloseReviews = () => {
    setShowReviewModal(false);
    setSelectedPlan(null);
  };

  const handleFavoriteToggle = async (agencyUserId) => {
    if (!token || !currentUserId) {
      navigate("/login");
      return;
    }

    const prevFavorites = [...favorites];
    const prevAgency = [...agency];
    const isAdding = !favorites.includes(agencyUserId);

    setFavorites((prev) =>
      isAdding
        ? [...prev, agencyUserId]
        : prev.filter((id) => id !== agencyUserId)
    );

    setAgency((prev) =>
      prev.map((item) =>
        item.user === agencyUserId
          ? {
              ...item,
              favorite_users: isAdding
                ? [...item.favorite_users, currentUserId]
                : item.favorite_users.filter((id) => id !== currentUserId),
            }
          : item
      )
    );

    try {
      await addToFavo(agencyUserId).unwrap();
    } catch (error) {
      setFavorites(prevFavorites);
      setAgency(prevAgency);
      const errorMessage =
        error?.data?.detail || error?.detail || t("failed_to_update_favorite");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (searchTerm && SearchAgencies) {
      setAgency(
        SearchAgencies.map((item) => ({
          id: item.id,
          image:
            item.cover_photo_url ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg",
          verified: item.is_verified,
          agency: item.agency_name || t("unknown_agency"),
          rating: item.average_rating.toFixed(1),
          received_reviews: item.received_reviews || [],
          reviews: item.review_count,
          about: item.about || t("no_description"),
          location: "Unknown Location",
          price: t("contact_for_pricing"),
          logo_url: item.logo_url || "",
          user: item.user || null,
          favorite_users: item.favorite_users || [],
          badge_count: item.badge_count || 0,
          service_categories: item.service_categories || [],
        }))
      );
      if (currentUserId) {
        setFavorites(
          SearchAgencies.filter((item) =>
            item.favorite_users.includes(currentUserId)
          ).map((item) => item.user)
        );
      }
    } else if (AgencyAll) {
      setAgency(
        AgencyAll.map((item) => ({
          id: item.id,
          image:
            item.cover_photo_url ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg",
          verified: item.is_verified,
          agency: item.agency_name || t("unknown_agency"),
          rating: item.average_rating.toFixed(1),
          reviews: item.review_count,
          received_reviews: item.received_reviews || [],
          about: item.about || t("no_description"),
          location: "Unknown Location",
          price: t("contact_for_pricing"),
          logo_url: item.logo_url || "",
          user: item.user || null,
          favorite_users: item.favorite_users || [],
          badge_count: item.badge_count || 0,
          service_categories: item.service_categories || [],
        }))
      );
      if (currentUserId) {
        setFavorites(
          AgencyAll.filter((item) =>
            item.favorite_users.includes(currentUserId)
          ).map((item) => item.user)
        );
      }
    }
  }, [AgencyAll, SearchAgencies, searchTerm, currentUserId, t]);

  useEffect(() => {
    if (TopAgencies) {
      setTopAgency(
        TopAgencies.map((item, index) => ({
          name: item.agency_name || t("unknown_agency"),
          rating: item.average_rating.toFixed(1),
          reviews: item.review_count,
          received_reviews: item.received_reviews || [],
          color: `bg-gradient-to-br from-${
            ["purple-500", "blue-500", "green-500", "pink-500"][index % 4]
          } to-${
            ["pink-500", "green-500", "purple-500", "blue-500"][index % 4]
          }`,
          logo_url: item.logo_url || "",
        }))
      );
    }
  }, [TopAgencies, t]);

  const handleMessage = async (data) => {
    const role = localStorage.getItem("role");
    if (role) {
      try {
        await invite(data);
        navigate(role === "tourist" ? "/user/chat" : "/admin/chat");
      } catch (error) {
        console.log(error, "invite to message");
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row bg-gray-50 px-4 sm:px-10 pb-16 font-roboto pt-16">
      <div className="w-full sm:w-4/5 p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold sm:font-medium text-gray-600 mb-3 sm:mb-5">
            {t("search_for_tour_planner")}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            {t("all_posted_tour_plans")}
          </p>
        </div>

        <div className="relative mb-6 sm:mb-8 w-full sm:w-96">
          <div className="flex">
            <input
              type="text"
              placeholder={t("search_placeholder")}
              onChange={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              aria-label={t("search_tour_plans")}
            />
            <button
              className="px-4 sm:px-5 py-2 sm:py-3 bg-[#3776E2] text-white rounded-r-lg transition-colors hover:bg-blue-600"
              aria-label={t("search")}
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {isAgencyDataLoading || isSearchLoading ? (
          <div className="text-center text-gray-600">
            <FullScreenInfinityLoader />
          </div>
        ) : agency.length === 0 ? (
          <div className="text-center text-gray-600 h-full">
            <div className="min-h-[400px]">{t("no_tour_plans_available")}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {agency.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-72 h-48 sm:h-60 relative">
                  <img
                    src={
                      plan.image ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
                    }
                    alt={`${plan.agency} tour`}
                    className="w-full h-full object-cover"
                  />
                  {plan.verified && (
                    <div className="absolute top-3 right-2 bg-black/50 text-white px-2 py-1 text-sm sm:text-base font-medium flex items-center space-x-2 rounded-full">
                      <span>{t("verified")}</span>
                      <VscVerifiedFilled size={20} className="text-green-500" />
                    </div>
                  )}
                  <button
                    onClick={() => handleFavoriteToggle(plan.user)}
                    className="bg-gray-300 rounded-full absolute bottom-3 right-2 p-1 hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    aria-label={
                      favorites.includes(plan.user)
                        ? t("remove_from_favorites")
                        : t("add_to_favorites")
                    }
                    disabled={isAddFevLoading}
                  >
                    <FaHeart
                      className={`${
                        favorites.includes(plan.user)
                          ? "text-red-500"
                          : "text-gray-600"
                      } pt-[1px]`}
                      size={18}
                    />
                  </button>
                </div>

                <div className="flex-1 p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            className=""
                            src={
                              plan.logo_url ||
                              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
                            }
                            alt="logo"
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg sm:text-xl text-gray-800">
                          {plan.agency}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">
                            {plan.rating}
                          </span>
                          <span
                            onClick={() => handleOpenReviews(plan)}
                            className="text-xs text-blue-500 underline font-medium cursor-pointer"
                          >
                            ({plan.reviews} {t("reviews")})
                          </span>
                        </div>
                      </div>
                    </div>
                    {plan.badge_count > 0 && (
                      <div className="relative">
                        <RiAwardLine size={40} className="text-yellow-500" />
                        <h1 className="absolute top-[3px] left-[15px] font-bold">
                          {plan.badge_count}
                        </h1>
                      </div>
                    )}
                  </div>
                  <div className="pb-2">
                    <h1 className="text-2xl font-semibold text-black">
                      {t("our_service_category")}
                    </h1>
                    {plan?.service_categories?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {plan.service_categories.map((category, index) => (
                          <span
                            key={index}
                            className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{t("no_categories_available")}</span>
                    )}
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-base">
                      {t("about")}
                    </h4>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed line-clamp-3">
                      {plan.about}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full sm:w-1/5 bg-white border border-gray-200 p-4 sm:p-6 sm:ml-5 sm:mt-20 rounded-xl lg:mt-52">
        <h2 className="font-semibold text-gray-800 mb-6 text-center text-lg sm:text-xl">
          {t("top_agencies")}
        </h2>
        {isTopAgencyLoading ? (
          <div className="text-center text-gray-600">
            <FullScreenInfinityLoader />
          </div>
        ) : topAgencie.length === 0 ? (
          <div className="text-center text-gray-600">
            {t("no_top_agencies_available")}
          </div>
        ) : (
          <div className="space-y-5">
            {topAgencie.map((agency, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${agency.color} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img className="" src={agency.logo_url || ""} alt="logo" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {agency.name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600 font-medium">
                      {agency.rating}
                    </span>
                    <span
                      onClick={() => handleOpenReviews(agency)}
                      className="text-xs text-blue-500 underline font-medium cursor-pointer"
                    >
                      ({agency.reviews} {t("reviews")})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
     {showReviewModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-2xl shadow-2xl p-6 sm:px-8 relative max-h-[90vh] overflow-hidden">
      
      {/* Close Button */}
      <button
        onClick={handleCloseReviews}
        className="absolute top-4  text-gray-500 hover:text-gray-800 transition-colors text-xl font-bold"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-gray-600 " />
      </button>

      {/* Header */}
      {/* <h2 className="text-2xl font-bold text-gray-800 mb-6 pr-10">
        {selectedPlan?.agency || selectedPlan?.name} – {t("reviews")}
        <span className="text-gray-500 text-lg ml-2">
          ({selectedPlan?.reviews || 0})
        </span>
      </h2> */}

      {/* Reviews List */}
      {selectedPlan?.received_reviews?.length > 0 ? (
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-5">
          {selectedPlan.received_reviews.map((review, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Tourist Image */}
                <img
                  src={
                    review.tourist_image ||
                    "https://ui-avatars.com/api/?name=" + (review.tourist_first_name || "User") + "&background=random"
                  }
                  alt={review.tourist_first_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=User&background=random";
                  }}
                />

                <div className="flex-1 min-w-0">
                  {/* Name + Rating */}
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-gray-800 text-base">
                      {review.tourist_first_name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(review.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium text-gray-600 ml-1">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    {review.comment?.trim() || t("no_comment_provided")}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">{t("no_reviews_yet")}</p>
          <p className="text-sm mt-2">{t("be_the_first_to_review")}</p>
        </div>
      )}
    </div>
  </div>
)}

      <ToastContainer />
    </div>
  );
};

export default Membership;
