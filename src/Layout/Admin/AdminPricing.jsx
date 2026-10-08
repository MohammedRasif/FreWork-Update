import { localizedContent } from "@/lib/localizedContent";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoCheckmarkCircleSharp, IoCheckmarkDoneSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  useShowSubscriptionDataQuery,
  useSubscriptionMutation,
} from "@/redux/features/withAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const AdminPricing = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language === "ro" ? "ita" : "en";
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

  const getPrimaryColor = (plan) => (plan?.isSpecial ? "#DD9E2C" : "#C2851C");

  const handleSelectPlan = async (plan) => {
    if (plan?.cta?.action === "apply_partner") {
      localStorage.setItem("pricing_status", "agency");
      navigate("/inregistrare", {
        state: {
          pricing_id: plan.price_id,
        },
      });
      return;
    }

    if (!accessToken) {
      toast.info(t("login_required_for_premium"));

      navigate("/autentificare", { state: { from: "/pentru-agentii" } });
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
    } catch (err) { }
  };
  const PricingSkeleton = ({ count = 1 }) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full max-w-sm rounded-[22px] border border-[#e9e6e0] bg-white p-6 shadow-[0_10px_35px_rgba(23,43,67,0.05)]"
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
    <section className="agency-pricing mx-auto max-w-5xl pb-10">
      <div className="mx-auto">
        <div className="mb-7 h-1 w-10 rounded-full bg-[#d6a044]" />
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t("subscription_management")}</h1>

        {isLoadingState && (
          <div className="flex min-h-56 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8">
            <div className="grid gap-8 place-items-center">
              <PricingSkeleton
                count={accessToken ? Math.min(2, allPlans.length - 1 || 2) : 1}
              />
            </div>
          </div>
        )}

        {isError && !isLoadingState && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white px-6 py-10 text-center">
            <div className="text-2xl text-red-600 mb-4 font-semibold">
              {t("error_loading_plans")}
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              {error?.data?.message || t("something_went_wrong_try_again")}
            </p>
            <button
              onClick={() => refetch()}
              className="min-h-11 rounded-xl px-8 py-3 font-bold text-white transition hover:opacity-90"
              style={{
                backgroundColor: visiblePlans[0]
                  ? getPrimaryColor(visiblePlans[0])
                  : "#c88f2a",
              }}
            >
              {t("try_again")}
            </button>
          </div>
        )}

        {!isLoadingState && !isError && visiblePlans.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white px-6 py-10 text-center">
            <div className="text-2xl text-gray-600 mb-4">
              {t("no_plans_available")}
            </div>
            <p className="text-gray-500 mb-8 max-w-md">
              {accessToken
                ? t("contact_support_subscription")
                : t("please_register_or_wait")}
            </p>
            {!accessToken && (
              <button
                onClick={() => navigate("/inregistrare")}
                className="min-h-11 rounded-xl px-8 py-3 font-bold text-white transition hover:opacity-90"
                style={{
                  backgroundColor: visiblePlans[0]
                    ? getPrimaryColor(visiblePlans[0])
                    : "#c88f2a",
                }}
              >
                {t("register_now")}
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="mt-4 min-h-10 rounded-xl border border-[#d8dfe5] px-6 text-sm font-semibold text-[#172b43] hover:bg-[#f7f3ec]"
            >
              {t("refresh")}
            </button>
          </div>
        )}

        {!isLoadingState && !isError && visiblePlans.length > 0 && (
          <div
            className={`mx-auto grid gap-5
              ${isSingleCardView
                ? "max-w-lg grid-cols-1"
                : "grid-cols-1 md:grid-cols-2"
              }
            `}
          >
            {visiblePlans.map((plan, index) => (
              <div
                key={plan.plan_id || index}
                className="flex w-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_10px_35px_rgba(23,43,67,0.05)]"
              >
                <div className="bg-[#172b43] px-6 py-7 text-white">
                  <div className="mb-4 h-1 w-9 rounded-full bg-[#d6a044]" />
                  <h3 className="text-xl font-bold tracking-tight">{localizedContent(plan.name, t)}</h3>
                </div>

                <div className="flex flex-grow flex-col px-6 pb-6 pt-7">
                  <div className="mb-5">
                    <div className="flex items-end">
                      <span className="text-4xl font-bold text-[#172b43]">
                        {localizedContent(plan.price, t)}
                      </span>

                      <span className="text-xl text-slate-500 ml-1">
                        {plan.priceSuffix}
                      </span>
                    </div>
                    {plan?.subtitle && (
                      <p className="text-[14px] font-semibold pb-5 pt-2">
                        {localizedContent(plan.subtitle, t)}
                      </p>
                    )}
                    {/* <p className="text-slate-500 text-base mt-1">
                      {t("measurable_results")}
                    </p> */}
                    <p className="text-[15px] leading-6 text-[#617082]">{localizedContent(plan.description, t)}</p>
                  </div>
                  {/* <p className="text-[14px]">{plan.features}</p> */}
                  {/* {plan?.cta && (
                    <div className="mb-4 text-[16px] text-slate-600">
                      {plan.cta.label && (
                        <p className="font-semibold text-slate-700">
                          {localizedContent(plan.cta.label, t)}
                        </p>
                      )}

                      {plan.cta.subLabel && (
                        <p className="text-slate-500 text-[14px]">
                          {localizedContent(plan.cta.subLabel, t)}
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
                            <span>{localizedContent(feature, t)}</span>
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
                    <div className="rounded-xl border border-[#eadac0] bg-[#fffaf0] p-4 text-sm font-semibold text-[#34485c]">
                      <p className="flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{localizedContent(plan.warningBox.title, t)}</span>
                      </p>
                      <p>{localizedContent(plan.warningBox.text, t)}</p>
                    </div>
                  )}
                  {plan?.cta ? (
                    <div className="mb-4">
                      <button
                        className={`
                          mb-2 mt-5 min-h-12 w-full cursor-pointer rounded-xl bg-[#c88f2a] py-3 text-base font-bold text-white transition-colors hover:bg-[#ad751c]
                        `}
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isSubscribing}
                      >
                        {isSubscribing ? t("subscribing") : localizedContent(plan.cta.label, t)}
                      </button>
                      {plan.cta.subLabel && (
                        <p className="text-slate-500 text-center text-[14px] mt-1">
                          {localizedContent(plan.cta.subLabel, t)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      className={`
                        mb-4 mt-5 min-h-12 w-full cursor-pointer rounded-xl bg-[#c88f2a] py-3 text-base font-bold text-white transition-colors hover:bg-[#ad751c]
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

    </section>
  );
};

export default AdminPricing;
