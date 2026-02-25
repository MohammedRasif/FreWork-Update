import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ChevronDown, Mail, Lock, Building, Phone } from "lucide-react";
import img from "../../assets/img/Mask group (3).png";
import { NavLink, useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "@/redux/features/baseApi";
import img1 from "../../assets/img/1000062305-removebg-preview.png";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("tourist");
  const [createUser, { isLoading, isError, error, isSuccess }] =
    useCreateUserMutation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      userType: "tourist",
      agency_name: "",
      telephone_number: "",
      vatId: "",
    },
  });

  const password = watch("password");
  const userType = watch("userType");

  // useEffect(() => {
  //   return () => {
  //     localStorage.removeItem("pricing_status");
  //   };
  // }, []);

  useEffect(() => {
    const pricingStatus = localStorage.getItem("pricing_status");

    if (pricingStatus === "agency") {
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
          setValue("email", parsedPlan.email);
        }
      } catch (err) {
        console.error("Error parsing pendingPlan:", err);
      }
    }
  }, [setValue]);


  useEffect(() => {
  const handleBeforeUnload = () => {
    localStorage.removeItem("pricing_status");
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    localStorage.removeItem("pricing_status");  
  };
}, []);




  const userTypes = ["tourist", "agency"];

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        role: data.userType,
        password: data.password,
        invitation_code: data.invitationCode || undefined,
      };

      // Add agency-specific fields only if agency is selected
      if (data.userType === "agency") {
        payload.agency_name = data.agency_name;
        payload.telephone_number = data.telephone_number;
        payload.vat_id = data.vatId || undefined;
      }

      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userEmail", data.email);

      const res = await createUser(payload).unwrap();
      console.log("User created:", res);
      localStorage.removeItem("pricing_status");

      navigate("/verifica-otp", {
        state: { email: data.email, from: "register" },
      });
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err.data?.error || t("registration_error");
      setErrorMessage(msg);
      alert(msg);
    }
  };

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setValue("userType", type);
    setIsDropdownOpen(false);
  };

  const isAgency = userType === "agency";

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
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <NavLink to="/">
              <div className="flex items-center justify-center mb-6">
                <img src={img1} className="h-20" alt={t("logo")} />
              </div>
            </NavLink>
            {/* <h1 className="text-4xl font-semibold text-gray-700">
              {t("welcome_to_frework")}
            </h1> */}
          </div>

          {errorMessage && (
            <div className="p-4 mb-4 text-center text-red-500">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                  className="w-full pl-10 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-sm bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500"
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
                    className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg">
                    {userTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleUserTypeSelect(type)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50"
                      >
                        {t(`user_type_${type}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="hidden"
                {...register("userType", { required: t("user_type_required") })}
              />
              {errors.userType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.userType.message}
                </p>
              )}
            </div>

            {/* ────────────────────────────────────────────────
                AGENCY-ONLY FIELDS
            ──────────────────────────────────────────────── */}
            {isAgency && (
              <>
                {/* Agency Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("agency_name")}
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      {...register("agency_name", {
                        required: isAgency ? t("agency_name_required") : false,
                        minLength: {
                          value: 2,
                          message: t("agency_name_too_short"),
                        },
                      })}
                      type="text"
                      placeholder={
                        t("agency_name_placeholder") || "e.g. Arnob Agency"
                      }
                      className="w-full pl-10 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.agency_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agency_name.message}
                    </p>
                  )}
                </div>

                {/* Telephone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("telephone_number")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      {...register("telephone_number")}
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-10 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.telephone_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.telephone_number.message}
                    </p>
                  )}
                </div>

                {/* VAT ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("vat_id")}
                  </label>
                  <input
                    {...register("vatId", {
                      required: isAgency ? t("vat_id_required") : false,
                      pattern: {
                        value: /^\d{11}$/,
                        message: t("vat_id_digits"),
                      },
                    })}
                    type="text"
                    placeholder={t("vat_id_placeholder")}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.vatId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vatId.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  {...register("password", {
                    required: t("password_required"),
                    minLength: { value: 6, message: t("password_min_length") },
                  })}
                  type="password"
                  placeholder={t("password_placeholder")}
                  className="w-full pl-10 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("confirm_password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  {...register("confirmPassword", {
                    required: t("confirm_password_required"),
                    validate: (value) =>
                      value === password || t("passwords_do_not_match"),
                  })}
                  type="password"
                  placeholder={t("password_placeholder")}
                  className="w-full pl-10 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Invitation Code (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invitation_code")}
              </label>
              <input
                {...register("invitationCode")}
                type="text"
                placeholder={t("enter_here")}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !watch("termsAccepted")}
              className={`w-full mt-6 py-3.5 px-4 rounded-lg font-medium text-white transition-all
                ${
                  isLoading || !watch("termsAccepted")
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
            >
              {isLoading ? t("registering") + "..." : t("register")}
            </button>
          </form>

          {/* Terms Checkbox */}
          <div className="mt-8 pb-6 border-b border-gray-200">
            <label className="flex items-start gap-4 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("termsAccepted", {
                  required: t("please_accept_terms"),
                })}
                className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-md focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                {t("by_registering_agree")}{" "}
                <NavLink
                  to="/termini-e-condizioni"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {t("terms_and_conditions")}
                </NavLink>{" "}
                &{" "}
                <NavLink
                  to="/privacy-policy"
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {t("privacy_policy")}
                </NavLink>
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-red-500 text-xs mt-3 flex items-center gap-2 ml-10">
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

          {/* Already have account */}
          <div className="text-center mt-6">
            <NavLink to="/login" className="text-gray-600">
              {t("already_have_account")}{" "}
              <span className="text-blue-600 font-medium">{t("login")}</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
