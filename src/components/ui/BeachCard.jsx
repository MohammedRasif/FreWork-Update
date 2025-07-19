import { Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function BeachCard({ tourPlan }) {
  console.log({ tourPlan });
  return (
    
<Link
  to={`/tour-plans/${tourPlan.id}`}
  className="flex flex-col shadow-md w-full p-1 sm:max-w-sm mx-auto sm:mx-2 overflow-hidden rounded-2xl border transition-shadow duration-300"
>
  <div className="relative  ">
    <div className="aspect-[4/3] overflow-hidden ">
      <img
        src={tourPlan.spot_picture_url || "/images/beach-placeholder.jpg"}
        alt="Beach destination"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 rounded-xl"
      />
    </div>
    <div className="absolute top-2 left-3 bg-sky-100 text-sky-800 font-semibold px-3 py-1 text-[14px] rounded">
      {
        tourPlan?.destination_type
      }
    </div>
  </div>

  <div className="flex flex-col justify-between flex-grow p-3 sm:p-4  h-full ">
    <h3 className="font-semibold text-gray-900 text-sm sm:text-[16px] truncate">
      {tourPlan.location_to}
    </h3>

    <div className="mt-2">
      <div className="text-gray-900 font-semibold text-sm sm:text-base">
        ${tourPlan.budget}
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="text-gray-600 text-[14px]">
          {tourPlan.total_members}{" "}
          {tourPlan.total_members > 1 ? "people" : "person"}
        </span>

        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-[14px] font-medium text-gray-900">
            {tourPlan.like_count}
          </span>
        </div>
      </div>
    </div>
  </div>

</Link>


  );
}
