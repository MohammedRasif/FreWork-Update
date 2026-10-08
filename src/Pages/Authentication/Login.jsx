import { useForm } from "react-hook-form";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogInMutation } from "@/redux/features/baseApi";
import { useTranslation } from "react-i18next";
import AuthLayout, { authInputClass } from "./AuthLayout";
import { getAgencyAccountPath } from "@/lib/agencyOnboarding";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [login, { isLoading }] = useLogInMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      localStorage.setItem("user_id", res?.profile_data?.user_id);
      localStorage.setItem("user_image", res?.profile_data?.image_url || "");
      localStorage.setItem("role", res?.profile_data?.role || "");
      localStorage.setItem("name", res?.profile_data?.name || res?.profile_data?.agency || "");
      localStorage.setItem("userEmail", data.email);
      const profile = res.profile_data;
      localStorage.setItem("userType", profile?.role || "");
      localStorage.setItem("agency_is_verified", String(Boolean(profile?.agency_is_verified)));
      const needsAgencyOnboarding = profile?.role === "agency" && (!profile.agency_is_verified || !profile.is_profile_complete || profile.agency_is_rejected);
      navigate(needsAgencyOnboarding ? getAgencyAccountPath(profile) : redirect, { replace: true });
    } catch (error) {
      const message = error?.data?.message;
      setErrorMessage(typeof message === "string" ? message : t("login_error"));
    }
  };

  return (
    <AuthLayout title={t("auth_login_title")} description={t("auth_login_description")}>
      {errorMessage && (
        <div role="alert" className="mb-5 rounded-xl border border-[#f1c9c3] bg-[#fff5f3] px-4 py-3 text-sm text-[#a13b32]">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} onChange={() => setErrorMessage("")} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#34485c]">{t("email_address_label")}</label>
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder={t("email_placeholder")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className={`${authInputClass} pl-11`}
              {...register("email", {
                required: t("email_required"),
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t("invalid_email") },
              })}
            />
          </div>
          {errors.email && <p id="login-email-error" role="alert" className="mt-1.5 text-xs text-[#b3483d]">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[#34485c]">{t("password")}</label>
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("password_placeholder")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              className={`${authInputClass} pl-11 pr-12`}
              {...register("password", {
                required: t("password_required"),
                minLength: { value: 6, message: t("password_min_length") },
              })}
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("hide_password") : t("show_password")} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#7c8b9a] hover:text-[#172b43]">
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p id="login-password-error" role="alert" className="mt-1.5 text-xs text-[#b3483d]">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/verificare-cont" className="text-sm font-semibold text-[#9b6b22] hover:underline">{t("forget_password")}</Link>
        </div>
        <button type="submit" disabled={isLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c] disabled:cursor-wait disabled:bg-[#d8c49f]">
          {isLoading ? t("please_wait") : t("login")}
          {!isLoading && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>
      <p className="mt-7 border-t border-[#edf0f2] pt-6 text-center text-sm text-[#617082]">
        {t("no_account")} <Link to="/inregistrare" className="font-bold text-[#9b6b22] hover:underline">{t("register")}</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
