import { Star } from "lucide-react";

export default function AgencyCard({ agency }) {
  return (
    <div className="flex flex-col w-full max-w-[160px] sm:max-w-sm mx-1 sm:mx-2 h-[300px] sm:h-[370px] overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <div className="relative flex-shrink-0">
        {/* Cover Photo */}
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={agency.cover_photo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"}
            alt={`${agency.agency_name} cover`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 p-1 rounded-lg"
          />
        </div>
        {/* Agency Logo */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img
            src={agency.logo_url || "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1738133725/56832_cdztsw.png"}
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
          <span className="text-sm sm:text-[15px] font-bold text-gray-600">
            {agency.review_count}{" "}
            {agency.review_count === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>
    </div>
  );
}