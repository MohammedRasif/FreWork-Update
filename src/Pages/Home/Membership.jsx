import { Search, Star, MessageCircle } from "lucide-react";
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

const Membership = () => {
  const [agency, setAgency] = useState([]);
  const [topAgencie, setTopAgency] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]); // Track agency user IDs that the current user has favorited
  const token = localStorage.getItem("access_token");
  const currentUserId = parseInt(localStorage.getItem("user_id"), 10); // Get current user ID from localStorage
  const navigate = useNavigate();

  const { data: AgencyAll, isLoading: isAgencyDataLoading } =
    useGetAllAgencyQuery();

  console.log(AgencyAll, "AgencyAll");
  const { data: TopAgencies, isLoading: isTopAgencyLoading } =
    useGetTopAgencyQuery();
  const { data: SearchAgencies, isLoading: isSearchLoading } =
    useSearchAgencyQuery(searchTerm, { skip: !searchTerm });
  const [addToFavo, { isLoading: isAddFevLoading }] = useAddToFavoritMutation();
  const { data: userData, isLoading } = useShowUserInpormationQuery();
  console.log(userData,"hello ")

  // invite to chat
  const [invite, { isLoading: isInviteLoading, isError: isInviteError }] =
    useInviteToChatMutation();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 500),
    []
  );

  // Handle search input change
  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };
  const handleFavoriteToggle = async (agencyUserId) => {
    if (!token || !currentUserId) {
      navigate("/login");
      return;
    }

    const prevFavorites = [...favorites];
    const prevAgency = [...agency];
    const isAdding = !favorites.includes(agencyUserId);

    // Optimistically update favorites state
    setFavorites((prev) =>
      isAdding
        ? [...prev, agencyUserId]
        : prev.filter((id) => id !== agencyUserId)
    );

    // Optimistically update agency state to reflect favorite_users
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
      // Revert state on failure
      setFavorites(prevFavorites);
      setAgency(prevAgency);

      // Show error message from response
      const errorMessage =
        error?.data?.detail ||
        error?.detail ||
        "Failed to update favorite status";
      toast.error(errorMessage);
    }
  };

  // Set agency data to state when fetched (all agencies or search results)
  useEffect(() => {
    if (searchTerm && SearchAgencies) {
      setAgency(
        SearchAgencies.map((item) => ({
          id: item.id,
          image:
            item.cover_photo_url ||
            "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg",
          verified: item.is_verified,
          agency: item.agency_name || "Unknown Agency",
          rating: item.average_rating.toFixed(1),
          reviews: item.review_count,
          about: item.about || "No description available.",
          location: "Unknown Location",
          price: "Contact for pricing",
          logo_url: item.logo_url || "",
          user: item.user || null,
          favorite_users: item.favorite_users || [],
        }))
      );
      // Initialize favorites for the current user
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
          agency: item.agency_name || "Unknown Agency",
          rating: item.average_rating.toFixed(1),
          reviews: item.review_count,
          about: item.about || "No description available.",
          location: "Unknown Location",
          price: "Contact for pricing",
          logo_url: item.logo_url || "",
          user: item.user || null,
          favorite_users: item.favorite_users || [],
        }))
      );
      // Initialize favorites for the current user
      if (currentUserId) {
        setFavorites(
          AgencyAll.filter((item) =>
            item.favorite_users.includes(currentUserId)
          ).map((item) => item.user)
        );
      }
    }
  }, [AgencyAll, SearchAgencies, searchTerm, currentUserId]);

  // Set top agencies data to state when fetched
  useEffect(() => {
    if (TopAgencies) {
      setTopAgency(
        TopAgencies.map((item, index) => ({
          name: item.agency_name || "Unknown Agency",
          rating: item.average_rating.toFixed(1),
          reviews: item.review_count,
          color: `bg-gradient-to-br from-${
            ["purple-500", "blue-500", "green-500", "pink-500"][index % 4]
          } to-${
            ["pink-500", "green-500", "purple-500", "blue-500"][index % 4]
          }`,
          logo_url: item.logo_url || "",
        }))
      );
    }
  }, [TopAgencies]);

  const handleMessage = async (data) => {
    const role = localStorage.getItem("role");
    console.log(data);
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
    <div className="flex flex-col sm:flex-row bg-gray-50 px-4 sm:px-10 pb-16 font-roboto">
      {/* Main Content - Tour Plans */}
      <div className="w-full sm:w-4/5 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold sm:font-medium text-gray-600 mb-3 sm:mb-5">
            Search for Tour Planner (Agencies)
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            All posted tour plans are here
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 sm:mb-8 w-full sm:w-96">
          <div className="flex">
            <input
              type="text"
              placeholder="Search here..."
              onChange={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              aria-label="Search tour plans"
            />
            <button
              className="px-4 sm:px-5 py-2 sm:py-3 bg-[#3776E2] text-white rounded-r-lg transition-colors hover:bg-blue-600"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isAgencyDataLoading || isSearchLoading ? (
          <div className="text-center text-gray-600">
            <FullScreenInfinityLoader />
          </div>
        ) : agency.length === 0 ? (
          <div className="text-center text-gray-600 h-full">
            <div className="min-h-[400px]">No tour plans available</div>
          </div>
        ) : (
          /* Tour Plans */
          <div className="space-y-6">
            {agency.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Image */}
                <div className="w-full sm:w-72 h-48 sm:h-56 relative">
                  <img
                    src={
                      plan.image ||
                      "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpgs"
                    }
                    alt={`${plan.location} tour`}
                    className="w-full h-full object-cover"
                  />
                  {plan.verified && (
                    <div className="absolute top-3 right-2 bg-black/50 text-white px-2 py-1 text-sm sm:text-base font-medium flex items-center space-x-2 rounded-full">
                      <span>Verified</span>
                      <VscVerifiedFilled size={20} className="text-green-500" />
                    </div>
                  )}
                  <button
                    onClick={() => handleFavoriteToggle(plan.user)}
                    className="bg-gray-300 rounded-full absolute bottom-3 right-2 p-1 hover:bg-gray-400 transition-colors hover:cursor-pointer"
                    aria-label={
                      favorites.includes(plan.user)
                        ? "Remove from favorites"
                        : "Add to favorites"
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

                {/* Content */}
                <div className="flex-1 p-4">
                  {/* Agency Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10  rounded-full flex items-center justify-center">
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
                          <span className="text-sm text-gray-500 font-medium">
                            ({plan.reviews} Reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!token) {
                          navigate("/login");
                        } else {
                          handleMessage({ other_user_id: plan.user });
                        }
                      }}
                      disabled={isAddFevLoading}
                      className="flex items-center space-x-2 bg-[#3776E2] text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors w-full sm:w-auto hover:cursor-pointer"
                      aria-label={`Message ${plan.agency}`}
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">
                        Message
                      </span>
                    </button>
                  </div>

                  {/* About Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-base">
                      About
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

      {/* Top Agencies */}
      <div className="w-full sm:w-1/5 bg-white border border-gray-200 p-4 sm:p-6 sm:ml-5 sm:mt-20 rounded-xl lg:mt-52">
        <h2 className="font-semibold text-gray-800 mb-6 text-center text-lg sm:text-xl">
          TOP AGENCIES
        </h2>
        {isTopAgencyLoading ? (
          <div className="text-center text-gray-600">
            <FullScreenInfinityLoader />
          </div>
        ) : topAgencie.length === 0 ? (
          <div className="text-center text-gray-600">
            No top agencies available
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
                    <span className="text-xs text-blue-500 underline font-medium">
                      ({agency.reviews} Reviews)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Membership;
