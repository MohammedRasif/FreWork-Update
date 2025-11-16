import { useAllFavoritAgencyQuery } from "@/redux/features/withAuth";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import { VscVerifiedFilled } from "react-icons/vsc";
import FullScreenInfinityLoader from "@/lib/Loading";
import { useTranslation } from "react-i18next";

const Favorite = () => {
  const { t } = useTranslation();
  const { data: favoriteAgency, isLoading } = useAllFavoritAgencyQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter agencies based on search term
  const filteredAgencies = favoriteAgency?.filter((agency) =>
    agency.agency_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {t("favorite_agency")}
            </h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={t("search_by_agency_name")}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center col-span-full">
              <FullScreenInfinityLoader />
            </div>
          ) : filteredAgencies?.length > 0 ? (
            filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white h-[450px] rounded-lg shadow-lg overflow-hidden transform transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative">
                    <img
                      src={agency.cover_photo_url}
                      alt={t("agency_cover_alt", { name: agency.agency_name })}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="w-20 h-20 rounded-full mr-4 absolute -bottom-6 left-5 overflow-hidden border-4 border-white">
                      <img
                        src={agency.logo_url}
                        alt={t("agency_logo_alt", { name: agency.agency_name })}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-4 mt-8">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center gap-1">
                        <h2 className="text-xl font-semibold">
                          {agency.agency_name}
                        </h2>
                        {agency.is_verified && (
                          <VscVerifiedFilled className="text-blue-600 text-2xl" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-[7]">
                      {agency.about || t("no_description")}
                    </p>
                  </div>
                </div>
                <div className="px-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-2xl">
                        {"★".repeat(Math.round(agency.average_rating))}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({agency.review_count} {t("reviews")})
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {agency.favorite_users.length} {t("favorites")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 col-span-full text-gray-600">
              {t("no_agencies_found")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorite;