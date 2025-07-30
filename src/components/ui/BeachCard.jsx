import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function BeachCard({ tourPlan }) {
  console.log({ tourPlan });
  return (
    
<Link
      to={`/tour-plans/${tourPlan.id}`}
      className="flex flex-col shadow-md w-full max-w-[150%] mx-auto sm:max-w-sm sm:mx-2 overflow-hidden rounded-2xl border transition-shadow duration-300 hover:shadow-lg min-h-[310px]"
    >
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={tourPlan.spot_picture_url || "/images/beach-placeholder.jpg"}
            alt="Beach destination"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 rounded-t-xl"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between flex-grow p-2 sm:p-4 h-full">
        <div className="flex justify-between items-center lg:mt-1">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-xl truncate">
              {tourPlan.location_to}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm sm:text-[15px] font-medium text-gray-900">
              {tourPlan.like_count}
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-[15px] lg:mt-1">
          Willing to proceed from: {tourPlan.start_date}
        </p>
        <p className="text-xs sm:text-[15px] lg:mt-1">
          Includes: {tourPlan.duration}
        </p>
        <p className="text-xs sm:text-[15px] lg:mt-1">
          Categoria: {tourPlan?.destination_type}
        </p>
        <p className="text-xs sm:text-[15px] font-bold lg:mt-1 py-1">
          Budget: ${tourPlan?.budget}
        </p>
        <span className="text-gray-600 text-xs sm:text-[14px] lg:mt-1">
          Total: {tourPlan.total_members}{" "}
          {tourPlan.total_members > 1 ? "people" : "person"}
        </span>
        <p className="text-xs sm:text-[15px] lg:mt-1">
          Travel points: {tourPlan?.tourist_spots}
        </p>
      </div>
    </Link>


  );
}
