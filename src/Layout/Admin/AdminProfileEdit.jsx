"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import { GoArrowLeft } from "react-icons/go";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdminProfileMutation, useGetAgencyProfileQuery } from "@/redux/features/withAuth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const AdminProfileEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categoryMap = useMemo(
    () => ({
      [t("beach_trips")]: "beach",
      [t("mountain_adventures")]: "mountain",
      [t("relaxing_tours")]: "desert",
      [t("group_packages")]: "island",
    }),
    [t]
  );

  const reverseCategoryMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(categoryMap).map(([display, value]) => [value, display])
      ),
    [categoryMap]
  );

  const { data: profileData, isLoading: isProfileLoading } = useGetAgencyProfileQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      agencyName: "",
      vatNumber: "",
      email: "",
      phoneNumber: "",
      description: "",
      categories: [],
      terms: false,
    },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [logoSizeError, setLogoSizeError] = useState("");
  const [coverSizeError, setCoverSizeError] = useState("");

  const [adminProfile, { isLoading, error }] = useAdminProfileMutation();

  useEffect(() => {
    if (profileData) {
      try {
        const categories = profileData.service_categories?.[0]
          ? JSON.parse(profileData.service_categories[0]).map(
              (value) => reverseCategoryMap[value] || value
            )
          : [];
        reset({
          agencyName: profileData.agency_name || "",
          vatNumber: profileData.vat_id || "",
          email: profileData.contact_email || "",
          phoneNumber: profileData.contact_phone || "",
          description: profileData.about || "",
          categories: categories,
          terms: false,
        });
      } catch (err) {
        console.error("Error parsing service_categories:", err);
      }
    }
  }, [profileData, reset, reverseCategoryMap]);

  const validateFileSize = (file, setErrorState, errorMessage) => {
    if (file && file.size > MAX_FILE_SIZE) {
      setErrorState(errorMessage);
      return false;
    }
    setErrorState("");
    return true;
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFileSize(file, setLogoSizeError, t("logo_size_error"))) {
        setLogoFile(file);
        clearErrors("logoFile");
      } else {
        setLogoFile(null);
        e.target.value = null;
        setError("logoFile", { message: t("file_too_large") });
      }
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFileSize(file, setCoverSizeError, t("cover_size_error"))) {
        setCoverPhotoFile(file);
        clearErrors("coverPhotoFile");
      } else {
        setCoverPhotoFile(null);
        e.target.value = null;
        setError("coverPhotoFile", { message: t("file_too_large") });
      }
    }
  };

  const onSubmit = async (data) => {
    if (logoFile && logoFile.size > MAX_FILE_SIZE) {
      setLogoSizeError(t("logo_size_error"));
      return;
    }
    if (coverPhotoFile && coverPhotoFile.size > MAX_FILE_SIZE) {
      setCoverSizeError(t("cover_size_error"));
      return;
    }

    try {
      const mappedCategories = data.categories.map(
        (category) => categoryMap[category]
      );

      const formData = new FormData();
      formData.append("agency_name", data.agencyName);
      formData.append("vat_id", data.vatNumber);
      formData.append("contact_email", data.email);
      formData.append("contact_phone", data.phoneNumber);
      formData.append("about", data.description);
      formData.append("service_categories", JSON.stringify(mappedCategories));
      if (logoFile) formData.append("agency_logo", logoFile);
      if (coverPhotoFile) formData.append("cover_photo", coverPhotoFile);

      await adminProfile(formData).unwrap();
      toast.success(t("profile_updated_success"));
      navigate("/agentie/profil");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(t("failed_to_update_profile"));
    }
  };

  if (isProfileLoading) {
    return <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-[#e9e6e0] bg-white p-8 text-sm text-[#617082]" role="status">{t("loading_profile")}</div>;
  }

  return (
    <div className="agency-profile-edit mx-auto max-w-5xl">
      <div className="mb-6">
        <NavLink to="/agentie/profil" className="inline-flex items-center gap-2 text-sm font-semibold text-[#617082] transition-colors hover:text-[#172b43]">
          <GoArrowLeft size={22} />
          <span>{t("back")}</span>
        </NavLink>
      </div>
      <div className="mb-3 h-1 w-10 rounded-full bg-[#d6a044]" />
      <h1 className="mb-7 text-2xl font-bold tracking-tight text-[#172b43] sm:text-3xl">{t("edit_profile_details")}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-[22px] border border-[#e9e6e0] bg-white p-5 shadow-[0_10px_35px_rgba(23,43,67,0.05)] sm:p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("agency_data")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              {t("agency_name")}
            </label>
            <input
              {...register("agencyName", { required: t("agency_name_required") })}
              type="text"
              placeholder={t("enter_here")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD9E2C]"
            />
            {errors.agencyName && (
              <span className="text-red-500 text-sm">
                {errors.agencyName.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              {t("vat_number")}
            </label>
            <input
              {...register("vatNumber", {
                required: t("vat_number_required"),
                pattern: {
                  value: /^\d{11}$/,
                  message: t("vat_11_digits"),
                },
              })}
              type="text"
              placeholder={t("enter_11_digit_vat")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD9E2C]"
            />
            {errors.vatNumber && (
              <span className="text-red-500 text-sm">{errors.vatNumber.message}</span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              {t("contact_email")}
            </label>
            <input
              {...register("email", {
                required: t("email_required"),
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: t("invalid_email"),
                },
              })}
              type="email"
              placeholder="user@mail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD9E2C]"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              {t("phone")}
            </label>
            <input
              {...register("phoneNumber", {
                required: t("phone_required"),
                pattern: {
                  value: /^[0-9]{9,15}$/,
                  message: t("invalid_phone"),
                },
              })}
              type="tel"
              placeholder={t("phone_example")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD9E2C]"
            />
            {errors.phoneNumber && (
              <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("images")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">{t("logo")}</label>
            <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-[#dce2e8] bg-[#fafbfc]">
              <label className="cursor-pointer bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#172b43] hover:bg-[#fff4dd]">
                {t("choose_file")}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </label>
              <span className="text-base text-gray-600 truncate max-w-[150px]">
                {logoFile ? logoFile.name : t("no_file_chosen")}
              </span>
            </div>
            {logoSizeError && (
              <p className="text-red-500 text-sm mt-1">{logoSizeError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{t("max_size_10mb")}</p>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              {t("cover_photo")}
            </label>
            <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-[#dce2e8] bg-[#fafbfc]">
              <label className="cursor-pointer bg-[#f7f3ec] px-4 py-3 text-sm font-semibold text-[#172b43] hover:bg-[#fff4dd]">
                {t("choose_file")}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                  accept="image/*"
                />
              </label>
              <span className="text-base text-gray-600 truncate max-w-[150px]">
                {coverPhotoFile ? coverPhotoFile.name : t("no_file_chosen")}
              </span>
            </div>
            {coverSizeError && (
              <p className="text-red-500 text-sm mt-1">{coverSizeError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{t("max_size_10mb")}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("profile")}</h3>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            {t("short_description")}
          </label>
          <textarea
            {...register("description", {
              required: t("description_required"),
              maxLength: {
                value: 500,
                message: t("description_max_500"),
              },
            })}
            placeholder={t("enter_short_description")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#DD9E2C] resize-none"
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description.message}</span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("main_categories")}</h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(categoryMap).map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e9e6e0] bg-[#faf9f6] px-4 py-2 text-sm text-[#34485c]"
            >
              <input
                type="checkbox"
                value={category}
                {...register("categories", {
                  validate: (value) =>
                    value.length > 0 || t("select_at_least_one_category"),
                })}
                className="h-4 w-4 text-[#DD9E2C]"
              />
              {category}
            </label>
          ))}
          {errors.categories && (
            <span className="text-red-500 text-sm w-full">{errors.categories.message}</span>
          )}
        </div>

        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            {...register("terms", {
              required: t("accept_terms_required"),
            })}
            className="h-4 w-4 text-[#DD9E2C]"
          />
          <span className="ml-2 text-base text-gray-700">
            {t("accept_terms_privacy")}
          </span>
        </div>
        {errors.terms && (
          <span className="text-red-500 text-sm">{errors.terms.message}</span>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error.data?.message || t("update_profile_error")}
          </div>
        )}

        <div className="flex justify-end border-t border-[#f0eee9] pt-6">
          <button
            type="submit"
            disabled={isLoading || !!logoSizeError || !!coverSizeError}
            className={`min-h-12 w-full cursor-pointer rounded-xl bg-[#c88f2a] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#ad751c] sm:w-auto ${
              isLoading || logoSizeError || coverSizeError
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading ? t("updating") : t("save_changes")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileEdit;
