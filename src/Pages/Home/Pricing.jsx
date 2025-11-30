import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircleSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import img from "../../assets/img/Vector 63.png";
import { useNavigate } from "react-router-dom";
import Faq from "./Faq";
import {
  useShowSubscriptionDataQuery,
  useSubscriptionMutation,
} from "@/redux/features/withAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscription, { isLoading: isSubscribing, error: subscriptionError }] =
    useSubscriptionMutation();
  const [langParam, setLangParam] = useState("lang=en");
  const navigate = useNavigate();
  const language = localStorage.getItem("i18nextLng");
  const { data: subscriptionData, isLoading } =
    useShowSubscriptionDataQuery(language);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (subscriptionError) {
      const errorMessage =
        subscriptionError?.data?.detail || t("failed_to_process_subscription");
      toast.error(errorMessage, {
        toastId: "subscription-error",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }, [subscriptionError, t]);

  const freePlan = {
    name: t("free_user"),
    limit: "3",
    limitUnit: t("query_per_day"),
    features: [t("free_feature_1"), t("free_feature_2"), t("free_feature_3")],
  };

  const handleSelectPlan = async (planName) => {
    if (planName === "premium") {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        toast.info(t("login_required_for_premium"), {
          toastId: "login-required",
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        navigate("/login", { state: { from: "/pricing" } });
        return;
      }

      try {
        const response = await subscription({ plan_id: "premium" }).unwrap();
        if (response?.checkout_url) {
          window.location.href = response.checkout_url;
        } else {
          toast.success(t("subscription_success"), {
            toastId: "subscription-success",
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } catch (error) {
        // Error toast handled by useEffect
      }
    } else {
      toast.info(t("free_plan_selected"), {
        toastId: "free-plan-selected",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <section className="pt-24 roboto bg-gray-50 ">
      <div className="container mx-auto px-4">
        <h1 className="uppercase text-center text-3xl sm:text-4xl font-medium text-gray-600 mb-3 sm:mb-5 tracking-wider">
          {t("pricing")}
        </h1>

        {isLoading && (
          <p className="text-center text-gray-600">{t("loading_plans")}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto place-items-center  md:place-items-start">
          <AnimatePresence mode="wait">
            {/* Free Plan Card */}
            <motion.div
              key="free-plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="bg-white w-full max-w-sm mx-auto md:mx-0 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200"
            >
              <div className="relative">
                <div className="w-3/4 rounded-r-lg my-10 relative">
                  <img
                    src={img}
                    alt={t("plan_background")}
                    className="w-full h-auto"
                  />
                  <h3 className="absolute top-4 left-4 text-slate-700 font-bold text-xl z-10">
                    {freePlan.name}
                  </h3>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="lg:mb-14 mb-5">
                  <div className="flex items-end">
                    <span className="text-4xl font-bold text-slate-700">
                      0{t("per_month")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-base mt-1">
                    {t("measurable_results")}
                  </p>
                </div>
                <button
                  className="w-full bg-[#3776E2] text-white py-3 rounded-md mb-4 hover:bg-[#00669e] transition-colors cursor-pointer text-lg font-semibold"
                  onClick={() => handleSelectPlan("free")}
                  disabled={isSubscribing}
                >
                  {t("select")}
                </button>
                <p className="text-slate-500 text-base mb-6">
                  {t("contact_for_details")}
                </p>
                <div className="mb-4 flex-grow">
                  <div className="flex items-center mb-3">
                    <span className="text-slate-700 font-semibold text-lg">
                      {t("features")}
                    </span>
                    <div className="ml-2 text-[#3776E2]">
                      <IoCheckmarkCircleSharp size={20} />
                    </div>
                  </div>
                  <ul className="space-y-3 text-base text-slate-600">
                    {freePlan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <IoCheckmarkDoneSharp
                          className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                          size={20}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Premium Plan Card */}
            {!isLoading && subscriptionData?.premium && (
              <motion.div
                key="premium-plan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white w-full max-w-sm mx-auto md:mx-0 rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200 "
              >
                <div className="relative">
                  <div className="w-3/4 rounded-r-lg my-10 relative">
                    <img
                      src={img}
                      alt={t("plan_background")}
                      className="w-full h-auto"
                    />
                    <h3 className="absolute top-4 left-4 text-slate-700 font-bold text-xl z-10">
                      {subscriptionData.premium.name}
                    </h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-6">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-slate-700">
                        {subscriptionData.premium.price}
                      </span>
                    </div>
                    <h1 className="text-[17px] pt-2 font-semibold">
                      {t("measurable_title")}
                    </h1>
                    <p className="text-slate-500 text-base mt-1">
                      {t("measurable_result")}
                    </p>
                  </div>
                  <button
                    className="w-full bg-[#3776E2] text-white py-3 rounded-md mb-4 hover:bg-[#00669e] transition-colors cursor-pointer text-lg font-semibold"
                    onClick={() => handleSelectPlan("premium")}
                    disabled={isSubscribing || isLoading}
                  >
                    {isSubscribing ? t("subscribing") : t("select")}
                  </button>
                  <p className="text-slate-500 text-base mb-6">
                    {t("contact_for_details")}
                  </p>
                  <div className="mb-4 flex-grow">
                    <div className="flex items-center mb-3">
                      <span className="text-slate-700 font-semibold text-lg">
                        {t("features")}
                      </span>
                      <div className="ml-2 text-[#3776E2]">
                        <IoCheckmarkCircleSharp size={20} />
                      </div>
                    </div>
                    <ul className="space-y-3 text-base text-slate-600">
                      {Array.isArray(subscriptionData.premium.features) &&
                      subscriptionData.premium.features.length > 0 ? (
                        subscriptionData.premium.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <IoCheckmarkDoneSharp
                              className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                              size={20}
                            />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <IoCheckmarkDoneSharp
                            className="text-[#3776E2] mt-1 mr-2 flex-shrink-0"
                            size={20}
                          />
                          <span>{t("no_features_available")}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ToastContainer />
      <Faq />
    </section>
  );
};

export default Pricing;
