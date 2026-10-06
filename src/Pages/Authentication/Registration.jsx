import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "@/redux/features/baseApi";
import { useTranslation } from "react-i18next";
import AuthLayout, { authInputClass } from "./AuthLayout";

const fieldErrorClass = "mt-1.5 text-xs text-[#b3483d]";
const fieldLabelClass = "mb-2 block text-sm font-semibold text-[#34485c]";

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: { userType: "tourist", agency_name: "", telephone_number: "", vatId: "" },
  });
  const password = watch("password");
  const isAgency = watch("userType") === "agency";

  useEffect(() => {
    if (localStorage.getItem("pricing_status") === "agency") setValue("userType", "agency");
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (pendingPlan) {
      try {
        const parsedPlan = JSON.parse(pendingPlan);
        if (parsedPlan.email) setValue("email", parsedPlan.email);
      } catch (error) {
        console.error("Error parsing pendingPlan:", error);
      }
    }
  }, [setValue]);

  useEffect(() => {
    const clearPricingStatus = () => localStorage.removeItem("pricing_status");
    window.addEventListener("beforeunload", clearPricingStatus);
    return () => {
      window.removeEventListener("beforeunload", clearPricingStatus);
      clearPricingStatus();
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        role: data.userType,
        password: data.password,
        invitation_code: data.invitationCode || undefined,
      };
      if (data.userType === "agency") {
        payload.agency_name = data.agency_name;
        payload.telephone_number = data.telephone_number;
        payload.vat_id = data.vatId || undefined;
      }
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userEmail", data.email);
      await createUser(payload).unwrap();
      localStorage.removeItem("pricing_status");
      navigate("/verificare-otp", { state: { email: data.email, from: "register" } });
    } catch (error) {
      const message = error?.data?.error;
      setErrorMessage(typeof message === "string" ? message : t("registration_error"));
    }
  };

  return (
    <AuthLayout title={t("auth_register_title")} description={t("auth_register_description")} wide>
      {errorMessage && <div role="alert" className="mb-5 rounded-xl border border-[#f1c9c3] bg-[#fff5f3] px-4 py-3 text-sm text-[#a13b32]">{errorMessage}</div>}
      <form onSubmit={handleSubmit(onSubmit)} onChange={() => setErrorMessage("")} className="space-y-5" noValidate>
        <fieldset>
          <legend className={fieldLabelClass}>{t("user_type_label")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ value: "tourist", icon: UserRound }, { value: "agency", icon: Building2 }].map(({ value, icon: Icon }) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" value={value} {...register("userType", { required: t("user_type_required") })} className="peer sr-only" />
                <span className="flex min-h-16 items-center gap-3 rounded-xl border border-[#dce2e8] bg-[#fafbfc] px-4 text-sm font-semibold text-[#536477] transition-colors hover:border-[#d5ad63] peer-checked:border-[#c88f2a] peer-checked:bg-[#fff8e9] peer-checked:text-[#172b43] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#bd8525]">
                  <Icon size={21} className="shrink-0 text-[#b98427]" aria-hidden="true" />{t(`user_type_${value}`)}
                </span>
              </label>
            ))}
          </div>
          {errors.userType && <p role="alert" className={fieldErrorClass}>{errors.userType.message}</p>}
        </fieldset>

        <div>
          <label htmlFor="register-email" className={fieldLabelClass}>{t("email_address_label")}</label>
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
            <input id="register-email" type="email" autoComplete="email" placeholder={t("email_placeholder")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "register-email-error" : undefined} className={`${authInputClass} pl-11`} {...register("email", { required: t("email_required"), pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: t("invalid_email") } })} />
          </div>
          {errors.email && <p id="register-email-error" role="alert" className={fieldErrorClass}>{errors.email.message}</p>}
        </div>

        {isAgency && <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="register-agency" className={fieldLabelClass}>{t("agency_name")}</label>
            <div className="relative"><Building2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" /><input id="register-agency" type="text" autoComplete="organization" placeholder={t("agency_name_placeholder")} aria-invalid={!!errors.agency_name} className={`${authInputClass} pl-11`} {...register("agency_name", { required: isAgency ? t("agency_name_required") : false, minLength: { value: 2, message: t("agency_name_too_short") } })} /></div>
            {errors.agency_name && <p role="alert" className={fieldErrorClass}>{errors.agency_name.message}</p>}
          </div>
          <div className="min-w-0">
            <label htmlFor="register-phone" className={fieldLabelClass}>{t("telephone_number")}</label>
            <div className="relative"><Phone size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" /><input id="register-phone" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={`${authInputClass} pl-11`} {...register("telephone_number")} /></div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="register-vat" className={fieldLabelClass}>{t("vat_id")}</label>
            <input id="register-vat" type="text" inputMode="numeric" placeholder={t("vat_id_placeholder")} aria-invalid={!!errors.vatId} className={authInputClass} {...register("vatId", { required: isAgency ? t("vat_id_required") : false, pattern: { value: /^\d{11}$/, message: t("vat_id_digits") } })} />
            {errors.vatId && <p role="alert" className={fieldErrorClass}>{errors.vatId.message}</p>}
          </div>
        </div>}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="register-password" className={fieldLabelClass}>{t("password")}</label>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
              <input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("password_placeholder")} aria-invalid={!!errors.password} className={`${authInputClass} pl-11 pr-11`} {...register("password", { required: t("password_required"), minLength: { value: 6, message: t("password_min_length") } })} />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("hide_password") : t("show_password")} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#7c8b9a] hover:text-[#172b43]">{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
            </div>
            {errors.password && <p role="alert" className={fieldErrorClass}>{errors.password.message}</p>}
          </div>
          <div className="min-w-0">
            <label htmlFor="register-confirm" className={fieldLabelClass}>{t("confirm_password")}</label>
            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#97a4b0]" aria-hidden="true" />
              <input id="register-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("password_placeholder")} aria-invalid={!!errors.confirmPassword} className={`${authInputClass} pl-11 pr-11`} {...register("confirmPassword", { required: t("confirm_password_required"), validate: (value) => value === password || t("passwords_do_not_match") })} />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? t("hide_password") : t("show_password")} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#7c8b9a] hover:text-[#172b43]">{showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
            </div>
            {errors.confirmPassword && <p role="alert" className={fieldErrorClass}>{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="register-invitation" className={fieldLabelClass}>{t("invitation_code")}</label>
          <input id="register-invitation" type="text" placeholder={t("enter_here")} className={authInputClass} {...register("invitationCode")} />
        </div>

        <div className="rounded-xl border border-[#e9e6e0] bg-[#faf9f6] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#c88f2a]" aria-invalid={!!errors.termsAccepted} {...register("termsAccepted", { required: t("please_accept_terms") })} />
            <span className="text-sm leading-6 text-[#536477]">{t("by_registering_agree")} <Link to="/termeni-si-conditii" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#9b6b22] hover:underline">{t("terms_and_conditions")}</Link> &amp; <Link to="/politica-de-confidentialitate" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#9b6b22] hover:underline">{t("privacy_policy")}</Link></span>
          </label>
          {errors.termsAccepted && <p role="alert" className={`${fieldErrorClass} pl-8`}>{errors.termsAccepted.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#c88f2a] px-5 font-bold text-white transition-colors hover:bg-[#ad751c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ad751c] disabled:cursor-wait disabled:bg-[#d8c49f]">
          {isLoading ? t("registering") : t("register")}{!isLoading && <ArrowRight size={18} aria-hidden="true" />}
        </button>
      </form>
      <p className="mt-7 border-t border-[#edf0f2] pt-6 text-center text-sm text-[#617082]">{t("already_have_account")} <Link to="/autentificare" className="font-bold text-[#9b6b22] hover:underline">{t("login")}</Link></p>
    </AuthLayout>
  );
}

export default Register;
