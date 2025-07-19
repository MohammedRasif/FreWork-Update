"use client";

import { useForm } from "react-hook-form";
import img from "../../assets/img/contact.jpg";

const Contact = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    alert("Form submitted successfully!");
    reset();
  };

  return (
    <div className="relative min-h-screen w-full roboto">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${img})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Contact Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Contact Us
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">
              Have a question? Reach out to us!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  First name
                </label>
                <input
                  {...register("firstName", { required: "First name is required" })}
                  type="text"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  Last name
                </label>
                <input
                  {...register("lastName", { required: "Last name is required" })}
                  type="text"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email and Phone Number Row */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  Email
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  Phone number
                </label>
                <input
                  {...register("phoneNumber", { required: "Phone number is required" })}
                  type="tel"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Town and Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  Town
                </label>
                <input
                  {...register("town", { required: "Town is required" })}
                  type="text"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.town && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.town.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  Location
                </label>
                <input
                  {...register("location", { required: "Location is required" })}
                  type="text"
                  placeholder="Enter here"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                {errors.location && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                How can we help you?
              </label>
              <textarea
                {...register("message", { required: "Message is required" })}
                placeholder="Enter here"
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
              {errors.message && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-3 sm:pt-4">
              <button
                type="submit"
                className="px-8 sm:px-12 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;