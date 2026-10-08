import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, MailCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useOtpVerifyMutation,
  useReSendOtpMutation,
} from "@/redux/features/baseApi";
import { useTranslation } from "react-i18next";
import AuthLayout, { authInputClass } from "./AuthLayout";

const OTP_Verification = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const [statusKey, setStatusKey] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const isPasswordReset = location.state?.to === "/resetare-parola";
  const redirectTimer = useRef(null);
  const [regVerify, { isLoading }] = useOtpVerifyMutation();
  const [reSend, { isLoading: resendLoading }] = useReSendOtpMutation();
  const isBusy = isLoading || resendLoading || isVerified;

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (isBusy) return;
    setErrorKey("");
    setStatusKey("");
    if (!email) {
      setErrorKey("no_email_found");
      return;
    }
    if (!/^[0-9]{4}$/.test(otp)) {
      setErrorKey("enter_4_digit_otp");
      return;
    }
    try {
      const res = await regVerify({ otp, email }).unwrap();
      if (!res.access || !res.refresh) {
        setErrorKey("otp_verification_failed");
        return;
      }
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      const profile = res.profile_data;
      const role = profile?.role || localStorage.getItem("userType") || "tourist";
      localStorage.setItem("role", role);
      localStorage.setItem("userType", role);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("agency_is_verified", String(Boolean(profile?.agency_is_verified)));
      if (profile?.user_id != null) localStorage.setItem("user_id", String(profile.user_id));
      else localStorage.removeItem("user_id");
      localStorage.setItem("name", profile?.name || "");
      localStorage.setItem("user_image", profile?.image_url || "");
      const isAgency = role === "agency";
      setIsVerified(true);
      setStatusKey(isAgency ? "otp_verified_agency" : "otp_verified_success");
      redirectTimer.current = setTimeout(() => {
        navigate(isAgency ? "/in-asteptare" : "/", { state: { email } });
      }, 7000);
    } catch {
      setErrorKey("otp_verification_failed");
    }
  };

  const handleResend = async () => {
    if (isBusy) return;
    setErrorKey("");
    setStatusKey("");
    if (!email) {
      setErrorKey("no_email_found");
      return;
    }
    try {
      await reSend({ email }).unwrap();
      setStatusKey("otp_resent_success");
    } catch {
      setErrorKey("error_sending_otp");
    }
  };

  return (
    <AuthLayout title={t("auth_otp_title")} description={t("auth_otp_description")}>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#eeddbb] bg-[#fff8e9] p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#b98427]">
          <MailCheck size={21} aria-hidden="true" />
        </span>
        <div className="min-w-0 text-sm leading-6 text-[#536477]">
          <p id="otp-delivery-message">{t(isPasswordReset ? "otp_email_sent_reset" : "otp_email_sent_registration")}</p>
          {email && <p className="mt-1 break-all font-bold text-[#172b43]">{email}</p>}
        </div>
      </div>

      {!email && (
        <div role="alert" className="mb-5 rounded-xl border border-[#f1c9c3] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#a13b32]">
          <p>{t("otp_missing_email")}</p>
          <Link to={isPasswordReset ? "/verificare-cont" : "/inregistrare"} className="mt-1 inline-block font-bold underline underline-offset-4">
            {t(isPasswordReset ? "enter_your_email" : "register")}
          </Link>
        </div>
      )}

      <form onSubmit={handleOtpSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="verification-code" className="mb-2 block text-sm font-semibold text-[#34485c]">{t("otp_code_label")}</label>
          <div className="relative">
            <LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              placeholder="0000"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/[^0-9]/g, "").slice(0, 4));
                setErrorKey("");
              }}
              disabled={isBusy || !email}
              aria-invalid={errorKey === "enter_4_digit_otp" || errorKey === "otp_verification_failed"}
              aria-describedby={`otp-code-hint otp-delivery-message${errorKey ? " otp-error" : ""}`}
              className={`${authInputClass} pl-11 text-lg font-semibold tracking-[0.35em] disabled:opacity-60`}
            />
          </div>
          <p id="otp-code-hint" className="mt-2 text-xs leading-5 text-[#617082]">{t("otp_code_hint")}</p>
        </div>

        {errorKey && <div id="otp-error" role="alert" className="rounded-xl border border-[#f1c9c3] bg-[#fff5f3] px-4 py-3 text-sm leading-6 text-[#a13b32]">{t(errorKey)}</div>}
        {statusKey && (
          <div role="status" className="flex items-start gap-2 rounded-xl border border-[#cfe3d7] bg-[#f1f8f3] px-4 py-3 text-sm leading-6 text-[#34614a]">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{t(statusKey)}</p>
          </div>
        )}

        <button type="submit" disabled={isBusy || !email} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c] disabled:cursor-not-allowed disabled:bg-[#d8c49f]">
          {isVerified ? t("otp_verified_button") : isLoading ? t("verifying") : t("otp_verify_button")}
          {isVerified ? <CheckCircle2 size={18} aria-hidden="true" /> : !isLoading && <ArrowRight size={18} aria-hidden="true" />}
        </button>

        <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4 text-center">
          <p className="text-sm font-semibold text-[#34485c]">{t("otp_not_received")}</p>
          <p className="mt-1 text-xs leading-5 text-[#617082]">{t("otp_check_spam")}</p>
          <button type="button" onClick={handleResend} disabled={isBusy || !email} className="mt-2 inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-bold text-[#9b6b22] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c] disabled:cursor-not-allowed disabled:opacity-50">
            {resendLoading ? t("sending") : t("resend_code")}
          </button>
        </div>
      </form>

      <div className="mt-7 border-t border-[#edf0f2] pt-6 text-center">
        <Link to="/autentificare" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#617082] hover:text-[#172b43] hover:underline">
          <ArrowLeft size={16} aria-hidden="true" />{t("back_to_login")}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default OTP_Verification;
