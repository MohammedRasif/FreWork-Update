import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { ArrowUpRight } from "lucide-react";
import { useGetTopAgencyQuery } from "@/redux/features/baseApi";
import AgencyCard from "@/components/ui/AgencyCard";
import { useTranslation } from "react-i18next";

const Agencies = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetTopAgencyQuery();
  const agencies = Array.isArray(data) ? data : [];

  if (isLoading || isError || agencies.length === 0) return null;

  return (
    <section className="bg-[#faf9f6] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h2 className="text-3xl font-bold tracking-tight text-[#172b43] sm:text-4xl lg:text-[44px]">{t("currently_top_agencies")}</h2>
          </div>
          <NavLink to="/agentii-verificate" className="inline-flex items-center gap-1 font-semibold text-[#9d6b1e] hover:text-[#755018]">
            {t("see_more")} <ArrowUpRight size={18} aria-hidden="true" />
          </NavLink>
        </div>
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{ 640: { slidesPerView: 2 }, 900: { slidesPerView: 3 } }}
          className="home-carousel"
        >
          {agencies.map((agency) => (
            <SwiperSlide key={agency.id} className="pb-12"><AgencyCard agency={agency} /></SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Agencies;
