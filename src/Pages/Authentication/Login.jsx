import { useForm } from "react-hook-form";
import { useState } from "react";
import { ChevronDown, Mail, Lock } from "lucide-react";
import img from "../../assets/img/Mask group (3).png";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogInMutation } from "@/redux/features/baseApi";
import img1 from "../../assets/img/1000062305-removebg-preview.png";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [login, { isError }] = useLogInMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const password = watch("password");

  const userTypes = ["Tourist", "Travel agency"];

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    try {
      const res = await login(data).unwrap();
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      localStorage.setItem("user_id", res?.profile_data?.user_id);
      localStorage.setItem("user_image", res?.profile_data.image_url);
      localStorage.setItem("role", res?.profile_data.role);

      localStorage.setItem(
        "name",
        res?.profile_data.name || res?.profile_data.agency
      );

      localStorage.setItem("userEmail", data.email);
      navigate(redirect, { replace: true });
    } catch (error) {
      console.log(error);
      setErrorMessage(error.data?.message || t("login_error"));
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
            {/* <h1 className="text-3xl font-semibold text-gray-700">
              {t("welcome_to_frework")}
            </h1> */}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center justify-center p-4 mb-4">
              <span className="text-red-500 text-center">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            onChange={() => setErrorMessage("")}
          >
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

            {/* Forget Password */}
            <div>
              <h1
                onClick={() => navigate("/verifica-account")}
                className="text-blue-500 text-end cursor-pointer hover:underline"
              >
                {t("forget_password")}
              </h1>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
            >
              {t("login")}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <NavLink to="/registrazione" className="text-md text-gray-600">
              {t("no_account")}{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                {t("register")}
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;