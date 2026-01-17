import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ChevronDown, Mail, Lock } from "lucide-react";
import img from "../../assets/img/Mask group (3).png";
import { NavLink, useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "@/redux/features/baseApi";
import img1 from "../../assets/img/1000062305-removebg-preview.png";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [createUser, { isLoading, isError, error, isSuccess }] =
    useCreateUserMutation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  localStorage.getItem("pricing_status") === "from_pricing";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const password = watch("password");
  const userType = watch("userType");

  useEffect(() => {
    const pricingStatus = localStorage.getItem("pricing_status");
    if (pricingStatus === "from_pricing") {
      setSelectedUserType("agency");
      setValue("userType", "agency");
    }
  }, [setValue]);

  useEffect(() => {
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (pendingPlan) {
      try {
        const parsedPlan = JSON.parse(pendingPlan);
        if (parsedPlan.email) {
          console.log(
            "Setting default email from pendingPlan:",
            parsedPlan.email
          );
          setValue("email", parsedPlan.email);
        }
      } catch (err) {
        console.error("Error parsing pendingPlan from localStorage:", err);
      }
    }
  }, [setValue]);

  const userTypes = ["tourist", "agency"];

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        role: data.userType,
        password: data.password,
        invitation_code: data.invitationCode || undefined,
        vat_id: data.vatId || undefined,
      };

      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userEmail", data.email);
      console.log("Stored userType in localStorage:", data.userType);

      const res = await createUser(payload).unwrap();
      console.log("User created successfully:", res);
      navigate("/otp_verify", {
        state: { email: data.email, from: "register" },
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setErrorMessage(err.data?.error || t("registration_error"));
      alert(err.data?.error || t("registration_error"));
    }
  };

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setValue("userType", type);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={img}
          alt={t("background_image")}
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <NavLink to="/">
              <div className="flex items-center justify-center mb-6">
                <img src={img1} className="h-20" alt={t("logo")} />
              </div>
            </NavLink>
            <h1 className="text-4xl font-semibold text-gray-700">
              {t("welcome_to_frework")}
            </h1>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center justify-center p-4 mb-4">
              <span className="text-red-500 text-center">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: t("email_required"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("invalid_email"),
                    },
                  })}
                  type="email"
                  placeholder={t("email_placeholder")}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* User Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("user_type_label")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-300 rounded-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between text-sm sm:text-base"
                >
                  <span
                    className={
                      selectedUserType ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {selectedUserType
                      ? t(`user_type_${selectedUserType}`)
                      : t("select_one")}
                  </span>
                  <ChevronDown
                    className={`h-4 sm:h-4 w-3 sm:w-4 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg">
                    {userTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleUserTypeSelect(type)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 first:rounded-t-sm last:rounded-b-sm text-sm sm:text-base"
                      >
                        {t(`user_type_${type}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                {...register("userType", {
                  required: t("user_type_required"),
                })}
                type="hidden"
                value={selectedUserType}
              />
              {errors.userType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.userType.message}
                </p>
              )}
            </div>

            {/* VAT ID Field (Conditional) */}
            {userType === "agency" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("vat_id")}
                </label>
                <input
                  {...register("vatId", {
                    required: t("vat_id_required"),
                    pattern: {
                      value: /^\d{11}$/,
                      message: t("vat_id_digits"),
                    },
                  })}
                  type="text"
                  placeholder={t("vat_id_placeholder")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.vatId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.vatId.message}
                  </p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: t("password_required"),
                    minLength: {
                      value: 6,
                      message: t("password_min_length"),
                    },
                  })}
                  type="password"
                  placeholder={t("password_placeholder")}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("confirm_password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: t("confirm_password_required"),
                    validate: (value) =>
                      value === password || t("passwords_do_not_match"),
                  })}
                  type="password"
                  placeholder={t("password_placeholder")}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Invitation Code Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invitation_code")}
              </label>
              <input
                {...register("invitationCode")}
                type="text"
                placeholder={t("enter_here")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading || !watch("termsAccepted")}
              className={`w-full mt-6 py-3.5 px-4 rounded-lg font-medium text-white transition-all duration-200 shadow-md
                ${
                  isLoading || !watch("termsAccepted")
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
              {isLoading ? t("registering") + "..." : t("register")}
            </button>
          </form>
          <div className="mt-8 pb-6 border-b border-gray-200">
            <label className="flex items-start gap-4 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("termsAccepted", {
                  required: t("please_accept_terms"),
                })}
                className="w-6 h-6 text-blue-600 bg-white border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                {t("by_registering_agree")}{" "}
                <NavLink
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  {t("terms_and_conditions")}
                </NavLink>{" "}
                &{" "}
                <NavLink
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  {t("privacy_policy")}
                </NavLink>
              </span>
            </label>

            {/* Error Message */}
            {errors.termsAccepted && (
              <p className="text-red-500 text-xs mt-3 flex items-center gap-1 ml-10">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <NavLink to="/login" className="text-md text-gray-600">
              {t("already_have_account")}{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                {t("login")}
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
