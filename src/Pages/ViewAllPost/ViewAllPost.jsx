import { NavLink } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Card from "@/components/ui/Card";
import { useGetTourPlanPublicQuery } from "@/redux/features/withAuth";
import { useTranslation } from "react-i18next";


const ViewAllPost = () => {
  const { t } = useTranslation();
  const {
    data: publishedData = [],
    isLoading,
    isError,
  } = useGetTourPlanPublicQuery();

  return (
    <div className="pb-8 px-4 sm:px-6 lg:px-20 bg-gradient-to-b from-white to-[#4691F2]/10 py-10">
      <div className="mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2851C] border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-8">
            {t("error_loading")}
          </div>
        ) : publishedData.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            {t("no_tour_plans")}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {publishedData.map((item) => (
                <Card key={item.id} tourPlan={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllPost;
