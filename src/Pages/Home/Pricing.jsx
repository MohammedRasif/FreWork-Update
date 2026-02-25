import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircleSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import img from "../../assets/img/Vector 63.png";
import img1 from "../../assets/img/Rectangle 161124457.png";
import { useNavigate } from "react-router-dom";
import {
  useShowSubscriptionDataQuery,
  useSubscriptionMutation,
} from "@/redux/features/withAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = localStorage.getItem("i18nextLng") || "en";
  const accessToken = localStorage.getItem("access_token");

  const {
    data: subscriptionData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useShowSubscriptionDataQuery(language, {
    refetchOnMountOrArgChange: true,
    skip: false,
  });

  const [subscription, { isLoading: isSubscribing, error: subscriptionError }] =
    useSubscriptionMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    refetch();
  }, [accessToken, language, refetch]);

  useEffect(() => {
    if (subscriptionError) {
      const errorMessage =
        subscriptionError?.data?.detail || t("failed_to_process_subscription");
      toast.error(errorMessage);
    }
  }, [subscriptionError, t]);

  const allPlans = (subscriptionData?.plans || []).map((plan) => ({
    ...plan,
    isFree: false,
    price_id: plan.price_id || "premium",
    priceSuffix: "",
    isSpecial: plan.price?.toString().includes("129"),
  }));

  let visiblePlans = [];
  if (accessToken) {
    visiblePlans = allPlans.slice(1);
  } else {
    visiblePlans = allPlans.slice(0, 1);
  }

  const isSingleCardView = visiblePlans.length === 1;
  const isLoadingState = isLoading || isFetching;

  const getPrimaryColor = (plan) => (plan?.isSpecial ? "#3776E2" : "#FF6600");
  const getHoverColor = (plan) => (plan?.isSpecial ? "#2a5bb5" : "#e65f05");

 const handleSelectPlan = async (plan) => {
  if (plan?.cta?.action === "apply_partner") {
    localStorage.setItem("pricing_status", "agency");
    navigate("/registrazione", {
      state: {
        pricing_id: plan.price_id, 
      },
    });
    return;
  }

  if (!accessToken) {
    toast.info(t("login_required_for_premium"));
    
    navigate("/login", { state: { from: "/prezzi-agenzie" } });
    return;
  }

  try {
    const response = await subscription({
      price_id: plan.price_id, 
    }).unwrap();

    if (response?.checkout_url) {
      window.location.href = response.checkout_url;
    } else {
      toast.success(t("subscription_success"));
    }
  } catch (err) {}
};
  const PricingSkeleton = ({ count = 1 }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
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

  return (
    <section className="pt-24 roboto bg-gray-50 min-h-screen pb-14">
      <div className="container mx-auto px-4">
        <h1 className="uppercase text-center text-3xl sm:text-4xl font-medium text-gray-600 mb-8 tracking-wider">
          {t("pricing")}
        </h1>

        {isLoadingState && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="grid gap-8 place-items-center">
              <PricingSkeleton
                count={accessToken ? Math.min(2, allPlans.length - 1 || 2) : 1}
              />
            </div>
          </div>
        )}

        {isError && !isLoadingState && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-2xl text-red-600 mb-4 font-semibold">
              {t("error_loading_plans") || "Errore nel caricamento dei piani"}
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              {error?.data?.message || t("something_went_wrong_try_again")}
            </p>
            <button
              onClick={() => refetch()}
              className="px-8 py-3 text-white rounded-md hover:opacity-90 transition"
              style={{
                backgroundColor: visiblePlans[0]
                  ? getPrimaryColor(visiblePlans[0])
                  : "#FF6600",
              }}
            >
              {t("try_again") || "Riprova"}
            </button>
          </div>
        )}

        {!isLoadingState && !isError && visiblePlans.length === 0 && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-2xl text-gray-600 mb-4">
              {t("no_plans_available") || "Nessun piano disponibile al momento"}
            </div>
            <p className="text-gray-500 mb-8 max-w-md">
              {accessToken
                ? t("contact_support_subscription")
                : t("please_register_or_wait")}
            </p>
            {!accessToken && (
              <button
                onClick={() => navigate("/registrazione")}
                className="px-8 py-3 text-white rounded-md hover:opacity-90 transition"
                style={{
                  backgroundColor: visiblePlans[0]
                    ? getPrimaryColor(visiblePlans[0])
                    : "#FF6600",
                }}
              >
                {t("register_now")}
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
            >
              {t("refresh")}
            </button>
          </div>
        )}

        {!isLoadingState && !isError && visiblePlans.length > 0 && (
          <div
            className={`grid gap-8 mx-auto place-items-center
              ${
                isSingleCardView
                  ? "grid-cols-1 max-w-md"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-4xl"
              }
            `}
          >
            {visiblePlans.map((plan, index) => (
              <div
                key={plan.plan_id || index}
                className="bg-white w-[45vh] rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-200"
              >
                <div className="relative">
                  <div className="w-3/4 rounded-r-lg my-10 relative">
                    <img
                      src={
                        plan.name === "Founder Partner" ||
                        plan.name === "Partner Fondatore"
                          ? img1
                          : img
                      }
                      alt="Plan background"
                      className="w-full h-auto"
                    />
                    <h3
                      className={`absolute top-5 left-2 z-10 font-bold ${
                        plan.name === "Founder Partner" ||
                        plan.name === "Partner Fondatore"
                          ? "text-white"
                          : "text-slate-700"
                      }`}
                    >
                      {plan.name}
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-6 flex flex-col flex-grow">
                  <div className="mb-5">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-slate-700">
                        {plan.price}
                      </span>

                      <span className="text-xl text-slate-500 ml-1">
                        {plan.priceSuffix}
                      </span>
                    </div>
                    {plan?.subtitle && (
                      <p className="text-[14px] font-semibold pb-5 pt-2">
                        {plan.subtitle}
                      </p>
                    )}
                    {/* <p className="text-slate-500 text-base mt-1">
                      {t("measurable_results")}
                    </p> */}
                    <p className="text-[15px]">{plan.description}</p>
                  </div>
                  {/* <p className="text-[14px]">{plan.features}</p> */}
                  {/* {plan?.cta && (
                    <div className="mb-4 text-[16px] text-slate-600">
                      {plan.cta.label && (
                        <p className="font-semibold text-slate-700">
                          {plan.cta.label}
                        </p>
                      )}

                      {plan.cta.subLabel && (
                        <p className="text-slate-500 text-[14px]">
                          {plan.cta.subLabel}
                        </p>
                      )}
                    </div>
                  )} */}

                  {/* <p className="text-slate-500 text-base mb-6">
                    {t("contact_for_details")}
                  </p> */}

                  <div className="mb-6 flex-grow">
                    <div className="flex items-center mb-3">
                      <span className="text-slate-700 font-semibold text-lg">
                        {t("features")}
                      </span>
                      <div
                        className="ml-2"
                        style={{ color: getPrimaryColor(plan) }}
                      >
                        <IoCheckmarkCircleSharp size={20} />
                      </div>
                    </div>

                    <ul className="space-y-3 text-base text-slate-600">
                      {Array.isArray(plan.features) &&
                      plan.features.length > 0 ? (
                        plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <IoCheckmarkDoneSharp
                              style={{ color: getPrimaryColor(plan) }}
                              className="mt-1 mr-2 flex-shrink-0"
                              size={20}
                            />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start">
                          <IoCheckmarkDoneSharp
                            style={{ color: getPrimaryColor(plan) }}
                            className="mt-1 mr-2 flex-shrink-0"
                            size={20}
                          />
                          <span>{t("no_features_available")}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  {plan?.warningBox && (
                    <div className="shadow-2xl border-2 rounded-md p-2 text-[14px] font-semibold">
                      <p className="flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{plan.warningBox.title}</span>
                      </p>
                      <p>{plan.warningBox.text}</p>
                    </div>
                  )}
                  {plan?.cta ? (
                    <div className="mb-4">
                      <button
                        className={`
                          w-full mt-5 text-white py-3 rounded-md mb-2
                          transition-colors cursor-pointer text-lg font-semibold
                          ${plan.isSpecial ? "bg-[#3776E2] hover:bg-[#2a5bb5]" : "bg-[#FF6600] hover:bg-[#e65f05]"}
                        `}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? t("subscribing") : plan.cta.label}
                      </button>
                      {plan.cta.subLabel && (
                        <p className="text-slate-500 text-center text-[14px] mt-1">
                          {plan.cta.subLabel}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`
                        w-full mt-5 text-white py-3 rounded-md mb-4
                        transition-colors cursor-pointer text-lg font-semibold
                        ${plan.isSpecial ? "bg-[#3776E2] hover:bg-[#2a5bb5]" : "bg-[#FF6600] hover:bg-[#e65f05]"}
                      `}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? t("subscribing") : t("select")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
      
    </section>
  );
};

export default Pricing;
