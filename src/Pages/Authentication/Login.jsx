import { useForm } from "react-hook-form";
import { useState } from "react";
import { ChevronDown, Mail, Lock } from "lucide-react";
import img from "../../assets/img/Mask group (3).png";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogInMutation } from "@/redux/features/baseApi";

const login = () => {
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
      navigate(redirect, { replace: true });
      // console.log(res, "success responce");
    } catch (error) {
      console.log(error);
      setErrorMessage(error.data.message || "An error occurred during login");
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
          alt="Background image"
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-100">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-gray-400 text-sm mb-6">Logo here</div>
            <h1 className="text-4xl font-semibold text-gray-700">
              Welcome to Frework
            </h1>
          </div>
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
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="user@gmail.com"
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
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <h1
                onClick={() => navigate("/verify")}
                className="text-blue-500 text-end cursor-pointer hover:underline"
              >
                forget password
              </h1>
            </div>

            {/* login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
            >
              Login
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <NavLink to="/register" className="text-sm text-gray-600 ">
              Don't have a account?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Register
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default login;
