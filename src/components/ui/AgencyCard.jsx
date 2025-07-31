import { Star } from "lucide-react";

export default function AgencyCard({ agency }) {
  return (
    <div className="flex flex-col w-full max-w-[160px] sm:max-w-sm mx-1 sm:mx-2 h-[180px] sm:h-[330px] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <div className="relative flex-shrink-0">
        {/* Cover Photo */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={agency.cover_photo_url || "/images/placeholder.png"}
            alt={`${agency.agency_name} cover`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 p-1 rounded-lg"
          />
        </div>

        {/* Agency Logo */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ">
          <img
            src={agency.logo_url || "/images/placeholder.png"}
            alt={`${agency.agency_name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col flex-grow p-2 sm:p-4 min-h-0">
        {/* Agency Name */}
        <h3 className="font-semibold text-gray-900 text-sm sm:text-xl mb-1 sm:mb-2 truncate ">
          {agency.agency_name}
        </h3>

        {/* Rating and Review Count */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Star className="w-3 h-3 sm:w-5 sm:h-5 fill-current text-yellow-500" />
            <span className="text-xs sm:text-[15px] font-medium text-gray-900">
              {agency.average_rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs sm:text-[15px] text-gray-600">
            {agency.review_count}{" "}
            {agency.review_count === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </div>
  );
}
