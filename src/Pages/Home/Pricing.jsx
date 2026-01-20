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
  const navigate = useNavigate();
  const language = localStorage.getItem("i18nextLng");

  const { data: subscriptionData, isLoading } =
    useShowSubscriptionDataQuery(language);

  const accessToken = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

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

  const allPlans = [
    ...(subscriptionData?.plans || []).map((plan) => ({
      ...plan,
      isFree: false,
      plan_id: plan.price_id || "premium",
      priceSuffix: "",
    })),
  ];

  // Logged in হলে প্রথম প্ল্যান skip, না হলে শুধু প্রথমটা
  let visiblePlans = [];
  if (accessToken) {
    visiblePlans = allPlans.slice(1); // প্রথমটা (free) বাদ
  } else {
    visiblePlans = allPlans.slice(0, 1); // শুধু প্রথমটা
  }

  const isSingleCardView = visiblePlans.length === 1;

  const handleSelectPlan = async (plan) => {
    if (isSingleCardView) {
      localStorage.setItem("pricing_status", "from_pricing");
      navigate("/register");
      return;
    }

    if (plan.isFree) {
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
      return;
    }

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
      const response = await subscription({ plan_id: plan.plan_id }).unwrap();
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
      // Error toast already handled in useEffect
    }
  };

  const PricingSkeleton = ({ count = 1 }) => {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white w-[45vh] max-w-sm rounded-2xl shadow-xl border border-gray-200 p-6"
          >
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </>
    );
  };

  return (
    <section className="pt-24 roboto bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="uppercase text-center text-3xl sm:text-4xl font-medium text-gray-600 mb-3 sm:mb-8 tracking-wider">
          {t("pricing")}
        </h1>

        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="grid gap-8 place-items-center">
              <PricingSkeleton count={accessToken ? 2 : 1} /> {/* লগইন হলে ২টা skeleton, না হলে ১টা */}
            </div>
          </div>
        ) : visiblePlans.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-xl">
            {t("no_plans_available") || "No plans available at the moment."}
          </div>
        ) : (
          <div
            className={`grid gap-8 mx-auto place-items-center
              ${isSingleCardView 
                ? "grid-cols-1 max-w-md" 
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl"}
            `}
          >
            <AnimatePresence mode="wait">
              {visiblePlans.map((plan, index) => (
                <motion.div
                  key={plan.name || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white w-[45vh] max-w-sm rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200"
                >
                  <div className="relative">
                    <div className="w-3/4 rounded-r-lg my-10 relative">
                      <img
                        src={img}
                        alt={t("plan_background")}
                        className="w-full h-auto"
                      />
                      <h3 className="absolute top-4 left-2 text-slate-700 font-bold text-xl z-10">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  <div className="px-6 pb-6 flex flex-col flex-grow">
                    <div className="lg:mb-5 mb-4">
                      <div className="flex items-end">
                        <span className="text-4xl font-bold text-slate-700">
                          {plan.price}
                        </span>
                        <span className="text-xl text-slate-500 ml-1">
                          {plan.priceSuffix}
                        </span>
                      </div>
                      <p className="text-slate-500 text-base mt-1">
                        {t("measurable_results")}
                      </p>
                    </div>

                    <p className="text-slate-500 text-base mb-6">
                      {t("contact_for_details")}
                    </p>

                    <div className="mb-6 flex-grow">
                      <div className="flex items-center mb-3">
                        <span className="text-slate-700 font-semibold text-lg">
                          {t("features")}
                        </span>
                        <div className="ml-2 text-[#3776E2]">
                          <IoCheckmarkCircleSharp size={20} />
                        </div>
                      </div>
                      <ul className="space-y-3 text-base text-slate-600">
                        {Array.isArray(plan.features) && plan.features.length > 0 ? (
                          plan.features.map((feature, i) => (
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

                    <button
                      className="w-full bg-[#3776E2] text-white py-3 rounded-md hover:bg-[#00669e] transition-colors cursor-pointer text-lg font-semibold mt-auto"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isSingleCardView ? t("register") : t("select")}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ToastContainer />
      <Faq />
    </section>
  );
};

export default Pricing;