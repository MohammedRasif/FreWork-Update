import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import TourPlanCard from "@/components/TourPlanCard";
import { ArrowUpRight } from "lucide-react";
import { useGetTourPlanPublicQuery } from "@/redux/features/withAuth";
import { useTranslation } from "react-i18next";

const Published = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetTourPlanPublicQuery();

  const categories = useMemo(() => {
    const plans = Array.isArray(data) ? data : [];
    const sorted = [...plans].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return [
      { key: "beach", label: "beach_trips" },
      { key: "mountain", label: "mountain_adventures" },
      { key: "relax", label: "relaxing_tours" },
      { key: "group", label: "group_packages" },
    ].map((category) => ({
      ...category,
      plans: sorted.filter((plan) => plan.destination_type?.trim().toLowerCase() === category.key).slice(0, 6),
    })).filter((category) => category.plans.length > 0);
  }, [data]);

  const handleCategoryClick = (category) => {
    localStorage.setItem("selectedCategory", category);
    navigate("/cereri");
  };

  if (isLoading || isError || categories.length === 0) return null;

  return (
    <section className="bg-[#f1f5f7] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h2 className="text-3xl font-bold tracking-tight text-[#172b43] sm:text-4xl lg:text-[44px]">{t("last_request_published")}</h2>
          </div>
          <NavLink to="/cereri" className="inline-flex items-center gap-1 font-semibold text-[#9d6b1e] hover:text-[#755018]">
            {t("see_more")} <ArrowUpRight size={18} aria-hidden="true" />
          </NavLink>
        </div>
        <div className="space-y-12">
          {categories.map(({ key, label, plans }) => (
            <div key={key}>
              <button type="button" onClick={() => handleCategoryClick(key)} className="mb-5 inline-flex items-center gap-2 text-xl font-bold text-[#23374d] hover:text-[#9d6b1e] sm:text-2xl">
                {t(label)} <ArrowUpRight size={20} aria-hidden="true" />
              </button>
              <Swiper
                modules={[Pagination]}
                spaceBetween={18}
                slidesPerView={1}
                pagination={{ clickable: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 900: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }}
                className="home-carousel"
              >
                {plans.map((plan) => (
                  <SwiperSlide key={plan.id} className="pb-12">
                    <TourPlanCard
                      tour={plan}
                      onDetails={(tour) => navigate("/cereri/" + (tour.slug || tour.id))}
                      className="h-full"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Published;
