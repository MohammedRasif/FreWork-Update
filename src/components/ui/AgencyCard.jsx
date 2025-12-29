import { Star, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function AgencyCard({ agency }) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const { t } = useTranslation();

  const hasReviews = agency.review_count > 0;
  return (
    <div className="flex flex-col w-full max-w-[160px] sm:max-w-sm mx-1 sm:mx-2 h-[300px] sm:h-[370px] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <div className="relative flex-shrink-0">
        {/* Cover Photo */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={
              agency.cover_photo_url ||
              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
            }
            alt={`${agency.agency_name} cover`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 p-1 rounded-lg"
          />
        </div>
        {/* Agency Logo */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img
            src={
              agency.logo_url ||
              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"
            }
            alt={`${agency.agency_name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col flex-grow p-2 sm:p-4 justify-between">
        {/* Agency Name */}
        <h3 className="font-bold text-gray-900 text-base sm:text-xl text-start mb-1 sm:mb-2">
          {agency.agency_name}
        </h3>
        {/* Rating and Review Count */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-yellow-500" />
            <span className="text-sm sm:text-[15px] font-bold text-gray-900">
              {agency.average_rating.toFixed(1)}
            </span>
          </div>
          <button
            onClick={() => setIsReviewsOpen(true)}
            className="text-sm sm:text-[15px] font-bold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            disabled={!hasReviews}
            title={hasReviews ? t("see_all_reviews") : t("no_reviews_yet")}
          >
            {agency.review_count}{" "}
            {agency.review_count === 1 ? t("review") : t("reviews")}
          </button>
        </div>
      </div>
      {isReviewsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm rounded-lg">
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              {/* <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("reviews_for")} {agency.agency_name}
              </h2> */}
              <h1></h1>
              <button
                onClick={() => setIsReviewsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {agency.received_reviews?.length > 0 ? (
                <div className="space-y-5">
                  {agency.received_reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Tourist Image */}
                        <img
                          src={
                            review.tourist_image ||
                            `https://ui-avatars.com/api/?name=${
                              review.tourist_first_name || "User"
                            }&background=random`
                          }
                          alt={review.tourist_first_name || "User"}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                          onError={(e) => {
                            e.target.src =
                              "https://ui-avatars.com/api/?name=User&background=random";
                          }}
                        />

                        <div className="flex-1 min-w-0">
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
                            {new Date(review.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
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
        </div>
      )}
    </div>
  );
}
