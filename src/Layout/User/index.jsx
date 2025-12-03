import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const HomeLayout = ({ children }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="w-full h-auto">
      <div className="w-full flex flex-col gap-2 px-4">
        <h2 className="text-[#343E4B] font-semibold text-xl">
          <span className="text-[28px]">{t("welcome")}, </span>
          <span className="font-normal text-[18px] font">
            {t("share_plan_subtitle")}
          </span>
        </h2>
      </div>

      <div className="w-full flex flex-col max-lg:gap-4 lg:grid lg:grid-cols-8 lg:py-8">
        {/* Main Content Section */}
        <div className="lg:col-span-6 max-lg:order-last">
          <div className="w-full flex items-end justify-end">
            <NavLink to="/user/CreatePlan">
              <Button
                variant="transparent"
                className="font-nunito-sans font-semibold"
              >
                {t("create_plan")}
                <Plus size={18} />
              </Button>
            </NavLink>
          </div>

          <div className="w-full flex items-center gap-2 px-4">
            <div className="min-w-max">
              <h4 className="text-xl font-semibold text-[#343E4B]">
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h4>
            </div>

            <div className="w-full h-[1px] bg-[#B8BABD]"></div>
          </div>

          <div className="px-4 max-lg:mt-4">{children}</div>
        </div>

        {/* My All Plans Section */}
        <div className="lg:col-start-7 lg:col-span-2 max-lg:order-first lg:pt-16 lg:mx-10">
          <h3 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            {t("my_all_plans")}
          </h3>
          <div className="flex flex-col gap-4 py-2 px-4">
            <Link to="/user">
              <button
                className={`w-full text-center px-4 py-3 font-semibold rounded-md transition-colors cursor-pointer ${
                  pathname === "/user"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("created_plan")}
              </button>
            </Link>
            <Link to="/user/published">
              <button
                className={`w-full text-center px-4 py-3 font-semibold rounded-md transition-colors cursor-pointer ${
                  pathname === "/user/published"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("published_plans")}
              </button>
            </Link>
            <Link to="/user/accepted">
              <button
                className={`w-full text-center px-4 py-3 font-semibold rounded-md transition-colors cursor-pointer ${
                  pathname === "/user/accepted"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("accepted_offers")}
              </button>
            </Link>
            <Link to="/user/favourite">
              <button
                className={`w-full text-center px-4 py-3 font-semibold rounded-md transition-colors cursor-pointer ${
                  pathname === "/user/favourite"
                    ? "bg-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("favourite_agencies")}
              </button>
            </Link>

            <div className="flex flex-col gap-1 mt-6">
              <p className="text-sm text-gray-900 font-semibold mb-2">
                {t("need_fast_response")}
              </p>
             <NavLink to="/contact">
               <Button
                variant="link"
                size="sm"
                className="p-0 underline text-left w-min text-xs"
              >
                {t("click_here")}
              </Button>
             </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;