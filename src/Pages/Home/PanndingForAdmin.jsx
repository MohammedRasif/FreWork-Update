import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Bell, Check, Clock3, FileCheck2, LoaderCircle, Mail, RefreshCw, ShieldCheck, TriangleAlert, UserRoundPen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetAgencyProfileQuery, useShowUserInpormationQuery } from "@/redux/features/withAuth";
import AuthLayout from "../Authentication/AuthLayout";
import { getAgencyAccountPath } from "@/lib/agencyOnboarding";

export default function PendingForAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user, isLoading, isFetching, isError, refetch } = useShowUserInpormationQuery(undefined, { pollingInterval: 30000, refetchOnMountOrArgChange: true });
  const isPendingAgency = user?.role === "agency" && !user.agency_is_verified && !user.agency_is_rejected;
  const { error: profileError, isError: isProfileError, isLoading: isProfileLoading, isFetching: isProfileFetching, refetch: refetchProfile } = useGetAgencyProfileQuery(undefined, { skip: !isPendingAgency, refetchOnMountOrArgChange: true });
  const profileRestricted = profileError?.status === 403;
  const isRejected = Boolean(user?.agency_is_rejected);
  const busy = isFetching || isProfileFetching;
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (user?.role === "tourist") navigate("/cont", { replace: true });
    else if (user?.role === "agency" && user.agency_is_verified && !user.agency_is_rejected) navigate(getAgencyAccountPath(user), { replace: true });
  }, [user, navigate]);

  const refreshStatus = () => {
    refetch();
    if (isPendingAgency) refetchProfile();
  };

  return (
    <AuthLayout title={t(isRejected ? "agency_pending_rejected_title" : "agency_pending_title")} description={t(isRejected ? "agency_pending_rejected_description" : "agency_pending_description")}>
      <div className={`flex items-start gap-3 rounded-2xl border p-4 ${isRejected ? "border-[#f1c9c3] bg-[#fff5f3]" : "border-[#ecdfc8] bg-[#fbf6ec]"}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ${isRejected ? "text-[#b54a40]" : "text-[#b88424]"}`}>{isRejected ? <TriangleAlert size={22} aria-hidden="true" /> : <Clock3 size={22} aria-hidden="true" />}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#172b43]">{t(isRejected ? "agency_pending_rejected_status" : "pendings.underReview")}</p>
          <p className="mt-1 text-xs leading-5 text-[#77818e]">{t(isRejected ? "agency_pending_contact_review" : "agency_pending_time_hint", { timeframe: t("pendings.timeframe") })}</p>
        </div>
      </div>

      {isError && <div role="alert" className="mt-4 rounded-xl border border-[#f1c9c3] bg-[#fff5f3] p-4 text-sm leading-6 text-[#b54a40]">{t("agency_pending_status_error")}</div>}

      {!isRejected && (
        <section className="mt-6" aria-labelledby="agency-review-steps">
          <h2 id="agency-review-steps" className="mb-4 text-sm font-semibold text-[#34485c]">{t("pendings.currentStatus")}</h2>
          <ol className="space-y-4">
            {[[Check, "1"], [FileCheck2, "2"], [Bell, "3"]].map(([Icon, step]) => <li key={step} className="flex items-start gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step === "1" ? "bg-[#eef5f0] text-[#46916a]" : step === "2" ? "bg-[#fbf2df] text-[#b88424]" : "bg-[#f4f5f6] text-[#a0a8b0]"}`}><Icon size={17} aria-hidden="true" /></span>
              <div className="min-w-0"><p className="text-sm font-semibold">{t(`pendings.steps.${step}.title`)}</p><p className="mt-0.5 text-xs leading-5 text-[#77818e]">{t(`pendings.steps.${step}.subtitle`)}</p></div>
            </li>)}
          </ol>
        </section>
      )}

      {email && <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#faf9f6] px-4 py-3 text-xs leading-5 text-[#77818e]"><Mail size={16} className="mt-0.5 shrink-0 text-[#b88424]" aria-hidden="true" /><p>{t("agency_pending_email_notice")} <span className="mt-1 block break-all font-semibold text-[#34485c]">{email}</span></p></div>}

      <div className="mt-6 border-t border-[#eeeae3] pt-5">
        {profileRestricted && <p role="status" className="mb-4 rounded-xl border border-[#e8dfd0] bg-[#faf6ee] p-4 text-xs leading-5 text-[#77818e]">{t("agency_pending_profile_restricted")}</p>}
        {isProfileError && !profileRestricted && <p role="alert" className="mb-4 text-sm text-[#b54a40]">{t("failed_to_load_profile")}</p>}
        {!isRejected && !isProfileError && !isError ? <>
          {!isLoading && !isProfileLoading && <div className="mb-4 flex items-start gap-2 text-sm leading-6 text-[#617082]"><UserRoundPen size={18} className="mt-0.5 shrink-0 text-[#b88424]" aria-hidden="true" /><p>{t(user?.is_profile_complete ? "agency_pending_profile_ready" : "agency_pending_complete_hint")}</p></div>}
          {isLoading || isProfileLoading ? <button type="button" disabled className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d8c49f] px-4 font-semibold text-white"><LoaderCircle size={18} className="animate-spin" />{t("loading")}</button> : <Link to="/agentie/modifica-profil" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c]">{t(user?.is_profile_complete ? "edit_profile_details" : "complete_profile_now")}<ArrowRight size={18} className="shrink-0" aria-hidden="true" /></Link>}
        </> : <Link to="/contact" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#ad751c]">{t("contact_support")}<ArrowRight size={18} className="shrink-0" aria-hidden="true" /></Link>}
        <button type="button" onClick={refreshStatus} disabled={busy} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e1e5e9] bg-white px-3 text-sm font-semibold text-[#34485c] hover:bg-[#faf9f6] disabled:opacity-60"><RefreshCw size={16} className={busy ? "animate-spin" : ""} aria-hidden="true" />{t("agency_pending_refresh")}</button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#77818e]">
        <Link to="/" className="inline-flex min-h-9 items-center gap-1.5 hover:text-[#172b43]"><ArrowLeft size={14} aria-hidden="true" />{t("agency_pending_home")}</Link>
        {!isRejected && !profileRestricted && <Link to="/contact" className="inline-flex min-h-9 items-center gap-1.5 hover:text-[#172b43]"><ShieldCheck size={14} aria-hidden="true" />{t("contact_support")}</Link>}
      </div>
    </AuthLayout>
  );
}
