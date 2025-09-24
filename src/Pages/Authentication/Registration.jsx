import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ChevronDown, Mail, Lock } from "lucide-react";
import img from "../../assets/img/Mask group (3).png";
import { NavLink, useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "@/redux/features/baseApi";

const register = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
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
  } = useForm();

  const password = watch("password");

  // Load email from localStorage pendingPlan
  useEffect(() => {
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (pendingPlan) {
      try {
        const parsedPlan = JSON.parse(pendingPlan);
        if (parsedPlan.email) {
          console.log("Setting default email from pendingPlan:", parsedPlan.email);
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
      };
      const res = await createUser(payload).unwrap();
      console.log("User created successfully:", res);
      navigate("/otp_verify", {
        state: { email: data.email, from: "register" },
      });
    } catch (err) {
      console.error("Error creating user:", err);
      console.log(err.data.error);
      setErrorMessage(err.data.error);
      alert(
        errorMessage ||
          err.data.error ||
          "Error occurred during registration. Please try again."
      );
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

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* User Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What describes you best
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
                    {selectedUserType || "Select one"}
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
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                {...register("userType", {
                  required: "Please select user type",
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type="password"
                  placeholder="Password"
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
                Invitation code (optional)
              </label>
              <input
                {...register("invitationCode")}
                type="text"
                placeholder="Enter here"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
            >
              Register
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <NavLink to="/login" className="text-sm text-gray-600">
              Already have an account?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Login
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default register;