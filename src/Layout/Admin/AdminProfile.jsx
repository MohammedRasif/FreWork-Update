"use client";
import FullScreenInfinityLoader from "@/lib/Loading";
import {
  useGetAgencyProfileQuery,
  useUpdateAgencyProfileMutation,
} from "@/redux/features/withAuth";
import { useEffect, useState } from "react";
import {
  FaStar,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaCalendarAlt,
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminProfile = () => {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError,
    error,
    refetch,
  } = useGetAgencyProfileQuery();
  const [update, { isLoading }] = useUpdateAgencyProfileMutation();

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setFromDate("");
    setToDate("");
  };

  const handleReset = async () => {
    setFromDate("");
    setToDate("");
    const payload = {
      start_unavailable: "",
      end_unavailable: "",
    };

    try {
      await update(payload).unwrap();
      refetch();
      handleClosePopup();
    } catch (err) {
      console.error("Failed to reset unavailability:", err);
      const errorMessage =
        err?.data?.detail ||
        err?.data?.message ||
        t("failed_to_reset_unavailability");
      alert(errorMessage);
    }
  };

  useEffect(() => {
    if (profileData) {
      setFromDate(profileData.start_unavailable?.split("T")[0] || "");
      setToDate(profileData.end_unavailable?.split("T")[0] || "");
    }
  }, [profileData, t]);

  const handleConfirm = async () => {
    if (!fromDate || !toDate) {
      alert(t("select_both_dates"));
      return;
    }

    const parsedFromDate = new Date(fromDate);
    const parsedToDate = new Date(toDate);

    if (isNaN(parsedFromDate) || isNaN(parsedToDate)) {
      alert(t("invalid_date_format"));
      return;
    }

    if (parsedFromDate >= parsedToDate) {
      alert(t("end_date_after_start"));
      return;
    }

    try {
      const payload = {
        start_unavailable: new Date(
          parsedFromDate.setHours(14, 36, 34, 327)
        ).toISOString(),
        end_unavailable: new Date(
          parsedToDate.setHours(14, 36, 34, 327)
        ).toISOString(),
      };

      await update(payload).unwrap();
      refetch();
      handleClosePopup();
    } catch (err) {
      console.error("Failed to set unavailability:", err);
      const errorMessage =
        err?.data?.detail ||
        err?.data?.message ||
        t("failed_to_set_unavailability");
      alert(errorMessage);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FullScreenInfinityLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-red-600">
          {t("error")}: {error?.data?.message || t("failed_to_load_profile")}
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-600">
          {t("no_profile_data")}
        </div>
      </div>
    );
  }

  let facilitiesDetails = [];
  let serviceCategoriesDetails = [];

  try {
    if (profileData?.facilities?.[0]) {
      facilitiesDetails = JSON.parse(profileData.facilities[0]).map((name) => ({
        name,
      }));
    }
  } catch (err) {
    console.error("Failed to parse facilities:", err);
  }

  try {
    if (profileData?.service_categories?.[0]) {
      serviceCategoriesDetails = JSON.parse(
        profileData.service_categories[0]
      ).map((name) => ({ name }));
    }
  } catch (err) {
    console.error("Failed to parse service categories:", err);
  }

  const contactInformation = [
    profileData?.contact_phone && {
      icon: <FaPhone className="w-4 h-4 text-gray-500" />,
      text: profileData.contact_phone,
    },
    profileData?.contact_email && {
      icon: <FaEnvelope className="w-4 h-4 text-gray-500" />,
      text: profileData.contact_email,
    },
  ].filter(Boolean);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen">
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 relative">
            <button
              onClick={handleClosePopup}
              className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
              title={t("back")}
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-sm"
            >
              {t("reset")}
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-4 sm:mb-6">
              {t("set_unavailability")}
            </h2>
            <div className="space-y-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="w-full sm:w-20 text-gray-700 font-medium">
                  {t("from")}
                </label>
                <div className="relative w-full sm:flex-1">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="w-full sm:w-20 text-gray-700 font-medium">
                  {t("to")}
                </label>
                <div className="relative w-full sm:flex-1">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    min={fromDate || new Date().toISOString().split("T")[0]}
                  />
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`w-full py-2 sm:py-3 rounded-md font-medium text-white ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? t("submitting") : t("confirm")}
            </button>
          </div>
        </div>
      )}

      <div className="pb-4 sm:pb-7">
        <h1 className="text-2xl sm:text-3xl text-black font-semibold text-center">
          {t("agency_profile")}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <div className="hidden sm:block"></div>
          <h1 className="text-sm sm:text-md text-[#5E6282] font-semibold text-center sm:pl-32">
            {t("set_profile_for_best_match")}
          </h1>
          <button
            onClick={handleOpenPopup}
            className="flex items-center gap-1 mt-2 text-blue-500 underline cursor-pointer self-center sm:self-end"
          >
            <FaEdit className="w-5 h-5" />
            <span className="text-sm">{t("set_unavailability")}</span>
          </button>
        </div>
        <h1 className="text-sm sm:text-md font-semibold text-gray-700 text-center mt-2">
          {t("vat_id")}: {profileData?.vat_id || t("na")}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="w-full sm:w-96 flex-shrink-0">
          <img
            src={
              profileData?.cover_photo_url ||
              "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1751196563/b170870007dfa419295d949814474ab2_t_qm2pcq.jpg"
            }
            alt={t("agency_cover")}
            className="w-full h-48 sm:h-72 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 bg-white p-3 sm:p-4 rounded-md h-auto sm:h-72">
          <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3">
            <div>
              <div className="flex items-center justify-center gap-5">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profileData?.agency_name || t("unnamed_agency")}
                </h2>
                <NavLink
                  to="/admin/editProfile"
                  className="flex items-center gap-1 cursor-pointer underline"
                >
                  <FaEdit className="w-5 h-5" />
                  <span className="text-sm sm:text-[16px]">{t("edit")}</span>
                </NavLink>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm sm:text-[15px] font-medium text-gray-900 ml-1">
                    {profileData?.rating || 0}
                  </span>
                </div>
                <span className="text-sm sm:text-[15px] text-blue-600">
                  ({profileData?.review_count || 0} {t("reviews")})
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="pb-5">
              <h1 className="text-2xl font-semibold text-black">
                {t("our_service_category")}
              </h1>
              {profileData?.service_categories?.length > 0 ? (
                <span className="text-gray-700 text-md">
                  {JSON.parse(profileData.service_categories[0])
                    .map(
                      (category) =>
                        category.charAt(0).toUpperCase() + category.slice(1)
                    )
                    .join(", ")}
                </span>
              ) : (
                <span>{t("no_categories_available")}</span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
              {t("about")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed line-clamp-5">
              {profileData?.about || t("no_description_available")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div className="bg-white p-3 sm:p-4 rounded-md">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
            {t("contact_information")}
          </h3>
          <div className="space-y-3">
            {contactInformation.length > 0 ? (
              contactInformation.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm sm:text-[15px] text-gray-600">
                    {item.text}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm sm:text-[15px] text-gray-600">
                {t("no_contact_info")}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-md">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            {t("our_aim")}
          </h3>
          <p className="text-gray-700 text-sm sm:text-[15px] leading-relaxed">
            {profileData?.our_aim || t("no_aim_description")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;