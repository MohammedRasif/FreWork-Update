"use client";

import { useForm } from "react-hook-form";
import img from "../../assets/img/contact.jpg";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    alert(t("form_submitted_success"));
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
              {t("contact_us")}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg">
              {t("have_question_reach_out")}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1 sm:mb-2">
                  {t("first_name")}
                </label>
                <input
                  {...register("firstName", { required: t("first_name_required") })}
                  type="text"
                  placeholder={t("enter_here")}
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
                  {t("last_name")}
                </label>
                <input
                  {...register("lastName", { required: t("last_name_required") })}
                  type="text"
                  placeholder={t("enter_here")}
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
                  {t("email")}
                </label>
                <input
                  {...register("email", {
                    required: t("email_required"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("invalid_email"),
                    },
                  })}
                  type="email"
                  placeholder={t("enter_here")}
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
                  {t("phone_number")}
                </label>
                <input
                  {...register("phoneNumber", { required: t("phone_required") })}
                  type="tel"
                  placeholder={t("enter_here")}
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
                  {t("town")}
                </label>
                <input
                  {...register("town", { required: t("town_required") })}
                  type="text"
                  placeholder={t("enter_here")}
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
                  {t("location")}
                </label>
                <input
                  {...register("location", { required: t("location_required") })}
                  type="text"
                  placeholder={t("enter_here")}
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
                {t("how_can_we_help")}
              </label>
              <textarea
                {...register("message", { required: t("message_required") })}
                placeholder={t("enter_here")}
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
                {t("submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;