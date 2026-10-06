import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, Building2, Check, CircleAlert, Compass, HandCoins, RotateCcw, Users } from "lucide-react";
import { useShowSubscriptionDataQuery, useSubscriptionMutation } from "@/redux/features/withAuth";
import { localizedContent } from "@/lib/localizedContent";

function PlanFeatures({ features, t }) {
  return (
    <ul className="space-y-3">
      {Array.isArray(features) && features.length > 0
        ? features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#526274] sm:text-base">
            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf6f1] text-[#397055]"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
            <span>{localizedContent(feature, t)}</span>
          </li>
        ))
        : <li className="text-sm text-[#617082]">{t("no_features_available")}</li>}
    </ul>
  );
}

function ApplicationCard({ plan, onSelect, isSubscribing, t }) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-[#e9e6e0] bg-white shadow-[0_16px_48px_rgba(23,43,67,0.07)] lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#213b55] p-7 text-white sm:p-10 lg:min-h-[540px] lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/15" />
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d49a36] text-[#172b43]"><Building2 size={27} strokeWidth={1.8} aria-hidden="true" /></div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#e8b75b]">{localizedContent(plan.name, t)}</p>
          <h3 className="mt-3 max-w-md break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{localizedContent(plan.price, t)}</h3>
          {plan.subtitle && <p className="mt-5 max-w-md text-base leading-7 text-white/80">{localizedContent(plan.subtitle, t)}</p>}
        </div>
        <p className="relative mt-8 max-w-md border-t border-white/20 pt-6 text-sm leading-7 text-white/70 sm:text-base">{localizedContent(plan.description, t)}</p>
      </div>

      <div className="flex flex-col p-7 sm:p-10 lg:p-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><BadgeCheck size={22} aria-hidden="true" /></span>
          <h4 className="text-xl font-bold text-[#172b43]">{t("features")}</h4>
        </div>
        <PlanFeatures features={plan.features} t={t} />
        {plan.warningBox && (
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#f0e3c7] bg-[#fffbf2] p-4">
            <CircleAlert size={20} className="mt-0.5 shrink-0 text-[#b98427]" aria-hidden="true" />
            <div><p className="font-bold text-[#273b50]">{localizedContent(plan.warningBox.title, t)}</p><p className="mt-1 text-sm leading-6 text-[#617082]">{localizedContent(plan.warningBox.text, t)}</p></div>
          </div>
        )}
        <div className="mt-auto pt-8">
          <button type="button" onClick={() => onSelect(plan)} disabled={isSubscribing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 py-3 text-center font-bold text-white transition-colors hover:bg-[#ad751c] disabled:cursor-wait disabled:opacity-60">
            {isSubscribing ? t("subscribing") : localizedContent(plan.cta?.label, t) || t("select")} <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          {plan.cta?.subLabel && <p className="mt-3 text-center text-sm leading-6 text-[#718092]">{localizedContent(plan.cta.subLabel, t)}</p>}
        </div>
      </div>
    </article>
  );
}

function SubscriptionCard({ plan, onSelect, isSubscribing, featured, t }) {
  return (
    <article className={`flex min-w-0 flex-col overflow-hidden rounded-[24px] border bg-white shadow-[0_12px_36px_rgba(23,43,67,0.06)] ${featured ? "border-[#d5ad63]" : "border-[#e9e6e0]"}`}>
      <div className={`h-1.5 ${featured ? "bg-[#c88f2a]" : "bg-[#213b55]"}`} />
      <div className="flex flex-1 flex-col p-7 sm:p-9">
        <div className={`mb-7 flex h-13 w-13 items-center justify-center rounded-2xl ${featured ? "bg-[#fff4dd] text-[#b98427]" : "bg-[#e9eff3] text-[#34546d]"}`}><Building2 size={26} strokeWidth={1.8} aria-hidden="true" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a36f1d]">{localizedContent(plan.name, t)}</p>
        <h3 className="mt-3 break-words text-3xl font-bold tracking-tight text-[#172b43] sm:text-[42px]">{localizedContent(plan.price, t)}</h3>
        {plan.subtitle && <p className="mt-3 text-sm font-semibold leading-6 text-[#34546d]">{localizedContent(plan.subtitle, t)}</p>}
        <p className="mt-4 min-h-14 text-sm leading-7 text-[#617082] sm:text-base">{localizedContent(plan.description, t)}</p>
        <div className="my-7 h-px bg-[#e9edf0]" />
        <h4 className="mb-5 text-lg font-bold text-[#172b43]">{t("features")}</h4>
        <PlanFeatures features={plan.features} t={t} />
        {plan.warningBox && <div className="mt-6 rounded-xl border border-[#f0e3c7] bg-[#fffbf2] p-4 text-sm leading-6 text-[#526274]"><strong className="block text-[#273b50]">{localizedContent(plan.warningBox.title, t)}</strong>{localizedContent(plan.warningBox.text, t)}</div>}
        <div className="mt-auto pt-8">
          <button type="button" onClick={() => onSelect(plan)} disabled={isSubscribing} className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-bold transition-colors disabled:cursor-wait disabled:opacity-60 ${featured ? "bg-[#c88f2a] text-white hover:bg-[#ad751c]" : "bg-[#213b55] text-white hover:bg-[#172b43]"}`}>
            {isSubscribing ? t("subscribing") : plan.cta?.label ? localizedContent(plan.cta.label, t) : t("select")} <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          {plan.cta?.subLabel && <p className="mt-3 text-center text-sm leading-6 text-[#718092]">{localizedContent(plan.cta.subLabel, t)}</p>}
        </div>
      </div>
    </article>
  );
}

function Pricing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language === "ro" ? "ita" : "en";
  const accessToken = localStorage.getItem("access_token");
  const { data, isLoading, isFetching, isError, refetch } = useShowSubscriptionDataQuery(language, { refetchOnMountOrArgChange: true });
  const [subscription, { isLoading: isSubscribing }] = useSubscriptionMutation();
  const allPlans = Array.isArray(data?.plans) ? data.plans : [];
  const visiblePlans = allPlans.filter((plan) => accessToken ? plan.cta?.action !== "apply_partner" : plan.cta?.action === "apply_partner");
  const loading = isLoading || isFetching;

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { document.title = `TreiOferte | ${t("for_agencies")}`; }, [i18n.language, t]);

  const handleSelectPlan = async (plan) => {
    if (plan?.cta?.action === "apply_partner") {
      localStorage.setItem("pricing_status", "agency");
      navigate("/inregistrare", { state: { pricing_id: plan.price_id } });
      return;
    }
    if (!accessToken) {
      toast.info(t("login_required_for_premium"));
      navigate("/autentificare", { state: { from: "/pentru-agentii" } });
      return;
    }
    try {
      const response = await subscription({ price_id: plan.price_id }).unwrap();
      if (response?.checkout_url) window.location.href = response.checkout_url;
      else toast.success(t("subscription_success"));
    } catch (error) {
      toast.error(error?.data?.detail || t("failed_to_process_subscription"));
    }
  };

  const benefits = [
    { icon: BadgeCheck, text: t("pricing_verified_requests") },
    { icon: Users, text: t("pricing_limited_competition") },
    { icon: HandCoins, text: t("pricing_no_commissions") },
  ];

  return (
    <main className="agencies-page min-h-screen bg-[#faf9f6] pt-[72px] text-[#172b43] xl:pt-[82px]">
      <section className="overflow-hidden bg-[#172b43] px-5 pb-28 pt-14 text-white sm:px-8 sm:pb-32 sm:pt-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 h-1 w-12 rounded-full bg-[#d6a044]" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#e8b75b]">{t("for_agencies")}</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("pricing_become_partner")}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{t("pricing_selection_description")}</p>
          </div>
          <a href="#agency-plans" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#d49a36] px-6 py-3 font-bold text-[#172b43] transition-colors hover:bg-[#ebae47] lg:self-auto">{t("pricing_and_packages")} <ArrowDownRight size={18} aria-hidden="true" /></a>
        </div>
      </section>

      <div className="relative mx-auto -mt-12 max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden rounded-[22px] border border-[#e9e6e0] bg-white shadow-[0_16px_48px_rgba(23,43,67,0.1)] md:grid-cols-3">
          {benefits.map(({ icon: Icon, text }, index) => <div key={text} className={`flex items-start gap-4 p-6 sm:p-7 ${index > 0 ? "border-t border-[#e9e6e0] md:border-l md:border-t-0" : ""}`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4dd] text-[#b98427]"><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></span>
            <p className="pt-1 text-sm font-bold leading-6 text-[#243b50] sm:text-base">{text}</p>
          </div>)}
        </div>

        <section id="agency-plans" className="scroll-mt-28 pt-16 sm:pt-20">
          <div className="mb-9 max-w-2xl">
            <div className="mb-4 h-1 w-12 rounded-full bg-[#d6a044]" />
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t("pricing_and_packages")}</h2>
            <p className="mt-4 text-base leading-7 text-[#617082]">{t("pricing_real_requests")}</p>
          </div>
          {loading ? <div className={`grid gap-6 ${accessToken ? "lg:grid-cols-2" : ""}`}>{Array.from({ length: accessToken ? 2 : 1 }, (_, index) => <div key={index} className="h-[490px] animate-pulse rounded-[26px] bg-[#e8ecee]" />)}</div>
            : isError ? <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center"><Compass size={48} strokeWidth={1.5} className="text-[#b98427]" aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{t("error_loading_plans")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{t("something_went_wrong_try_again")}</p><button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white hover:bg-[#ad751c]"><RotateCcw size={17} aria-hidden="true" /> {t("try_again")}</button></div>
              : visiblePlans.length === 0 ? <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-[#e9e6e0] bg-white px-6 py-12 text-center"><Compass size={48} strokeWidth={1.5} className="text-[#b98427]" aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{t("agency_no_plans")}</h3><p className="mt-3 max-w-md leading-7 text-[#617082]">{accessToken ? t("contact_support_subscription") : t("please_register_or_wait")}</p><button type="button" onClick={refetch} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8e0e6] px-5 font-bold text-[#243b50] hover:bg-[#f1f5f7]"><RotateCcw size={17} aria-hidden="true" /> {t("refresh")}</button></div>
                : accessToken ? <div className="grid gap-6 lg:grid-cols-2">{visiblePlans.map((plan, index) => <SubscriptionCard key={plan.price_id || index} plan={plan} featured={index === 0} onSelect={handleSelectPlan} isSubscribing={isSubscribing} t={t} />)}</div>
                  : visiblePlans.map((plan, index) => <ApplicationCard key={plan.price_id || index} plan={plan} onSelect={handleSelectPlan} isSubscribing={isSubscribing} t={t} />)}
        </section>
      </div>
      <ToastContainer position="top-right" autoClose={5000} />
    </main>
  );
}

export default Pricing;
