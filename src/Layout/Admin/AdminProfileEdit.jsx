import { useForm, useWatch } from "react-hook-form";
import { useState, useEffect } from "react";
import { GoArrowLeft } from "react-icons/go";
import { NavLink } from "react-router-dom";
import {
  useGetAgencyProfileQuery,
  useUpdateAgencyProfileMutation,
} from "@/redux/features/withAuth";
import LoadingPage from "@/lib/Loading";

const AdminProfileEdit = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      facilities: [],
      categories: "",
      otherFacilities: "",
      agencyName: "",
      about: "",
      aim: "",
      phoneNumber: "",
      email: "",
      website: "",
      location: "",
      handlerName: "",
      handlerPosition: "",
    },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPhotoFileName, setCoverPhotoFileName] = useState("");
  const [vatFile, setVatFile] = useState(null);
  const [vatFileName, setVatFileName] = useState("");
  const [agencyLogoUrlFile, setAgencyLogoUrlFile] = useState(null);
  const [agencyLogoUrlFileName, setAgencyLogoUrlFileName] = useState("");
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError,
    error,
  } = useGetAgencyProfileQuery();
  const [updateProfile, { isLoading: isUpdateLoading }] =
    useUpdateAgencyProfileMutation();

  // Predefined facilities for checkboxes
  const predefinedFacilities = ["breakfast", "lunch", "snacks", "dinner"];

  // Watch form fields for real-time updates
  const watchedFacilities = watch("facilities");
  const watchedOtherFacilities = watch("otherFacilities");
  const watchedCategories = watch("categories");

  // Safe JSON parsing function
  const safeParseJSON = (value, defaultValue = []) => {
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error("JSON parsing error:", e.message);
      return defaultValue;
    }
  };

  // Prepopulate form with fetched data
  useEffect(() => {
    if (profileData) {
      setValue("agencyName", profileData?.agency_name || "");
      setValue("about", profileData?.about || "");
      setValue("aim", profileData?.our_aim || "");
      setValue("phoneNumber", profileData?.contact_phone || "");
      setValue("email", profileData?.contact_email || "");
      setValue("website", profileData?.website_url || "");
      setValue("location", profileData?.address || "");
      setValue("handlerName", profileData?.profile_handler_name || "");
      setValue("handlerPosition", profileData?.profile_handler_position || "");

      // Handle facilities
      const facilities = safeParseJSON(profileData?.facilities, []);
      const normalizedPredefined = predefinedFacilities.map((f) =>
        f.toLowerCase()
      );
      // Filter predefined facilities (case-insensitive match)
      const selectedPredefined = facilities
        .filter((f) =>
          normalizedPredefined.includes(f.toLowerCase().replace(/[^a-z]/g, ""))
        )
        .map((f) => {
          const lowerF = f.toLowerCase().replace(/[^a-z]/g, "");
          return predefinedFacilities[normalizedPredefined.indexOf(lowerF)];
        });
      setValue("facilities", selectedPredefined);

      // Filter other facilities (non-predefined)
      const otherFacilities = facilities
        .filter(
          (f) =>
            !normalizedPredefined.includes(
              f.toLowerCase().replace(/[^a-z]/g, "")
            )
        )
        .join(", ");
      setValue("otherFacilities", otherFacilities);

      // Handle service categories
      const categories = safeParseJSON(profileData?.service_categories, []);
      setValue("categories", categories.join(", ") || "");

      // Set logo, cover photo, agency logo URL, and VAT file names
      setLogoFileName(
        profileData?.agency_logo_url
          ? profileData.agency_logo_url.split("/").pop()
          : ""
      );
      setCoverPhotoFileName(
        profileData?.cover_photo_url
          ? profileData.cover_photo_url.split("/").pop()
          : ""
      );
      setAgencyLogoUrlFileName(
        profileData?.agency_logo_url
          ? profileData.agency_logo_url.split("/").pop()
          : ""
      );
      setVatFileName(
        profileData?.vat_id_file_url
          ? profileData.vat_id_file_url.split("/").pop()
          : ""
      );
    }
  }, [profileData, setValue]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("id", profileData?.id || "");
      formData.append("agency_name", data.agencyName || "");
      formData.append("about", data.about || "");
      formData.append("our_aim", data.aim || "");
      formData.append("invitation_code", profileData?.invitation_code || "");
      formData.append("contact_phone", data.phoneNumber || "");
      formData.append("contact_email", data.email || "");
      formData.append("website_url", data.website || "");
      formData.append("address", data.location || "");
      formData.append(
        "is_unavailable",
        profileData?.is_unavailable ? "true" : "false"
      );
      formData.append(
        "is_verified",
        profileData?.is_verified ? "true" : "false"
      );
      formData.append("rating", profileData?.rating || 0);
      formData.append("review_count", profileData?.review_count || 0);
      formData.append("profile_handler_name", data.handlerName || "");
      formData.append("profile_handler_position", data.handlerPosition || "");

      if (logoFile) {
        formData.append("agency_logo", logoFile);
      }
      if (coverPhotoFile) {
        formData.append("cover_photo", coverPhotoFile);
      }
      if (agencyLogoUrlFile) {
        formData.append("agency_logo_url", agencyLogoUrlFile);
      }
      if (vatFile) {
        formData.append("vat_id_file", vatFile);
      }

      // Combine predefined and other facilities
      const standardFacilities = data.facilities || [];
      const otherFacilities = data.otherFacilities
        ? data.otherFacilities
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f)
        : [];
      const allFacilities = [...standardFacilities, ...otherFacilities];
      formData.append("facilities", JSON.stringify(allFacilities));

      // Handle service categories
      const categories = data.categories
        ? data.categories
            .split(",")
            .map((cat) => cat.trim())
            .filter((cat) => cat)
        : [];
      formData.append("service_categories", JSON.stringify(categories));

      await updateProfile(formData).unwrap();
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      setLogoFile(file);
      setLogoFileName(file.name);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      setCoverPhotoFile(file);
      setCoverPhotoFileName(file.name);
    }
  };

  const handleAgencyLogoUrlChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      setAgencyLogoUrlFile(file);
      setAgencyLogoUrlFileName(file.name);
    }
  };

  const handleVatChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      setVatFile(file);
      setVatFileName(file.name);
    }
  };

  // Combine predefined and other facilities for display
  const allFacilities = [
    ...(watchedFacilities || []),
    ...(watchedOtherFacilities
      ? watchedOtherFacilities
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f)
      : []),
  ];

  // Get categories for display
  const allCategories = watchedCategories
    ? watchedCategories
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat)
    : [];

  if (isProfileLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingPage size="lg" />
      </div>
    );
  if (isError)
    return <div>Error: {error?.message || "Something went wrong"}</div>;

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <NavLink
          to="/admin/profile"
          className="flex items-center space-x-1 cursor-pointer"
        >
          <GoArrowLeft size={22} />
          <h1 className="text-[19px] -mt-1">Back</h1>
        </NavLink>
        <h1 className="text-3xl text-black font-semibold text-center pb-10 pt-5">
          Agency Profile
        </h1>
        <div></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name and Upload Logo Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Name of your agency
            </label>
            <input
              {...register("agencyName", {
                required: "Agency name is required",
              })}
              type="text"
              placeholder="Enter here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
            />
            {errors.agencyName && (
              <span className="text-red-500 text-sm">
                {errors.agencyName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Upload Logo
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 rounded-l-md cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors text-base font-semibold">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>
              <span className="text-base text-gray-600">{logoFileName}</span>
            </div>
          </div>
        </div>

        {/* Cover Photo and Agency Logo URL Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Upload Cover Photo
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 rounded-l-md cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors text-base font-semibold">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                />
              </label>
              <span className="text-base text-gray-600">
                {coverPhotoFileName}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Upload Agency Logo URL
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 rounded-l-md cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors text-base font-semibold">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAgencyLogoUrlChange}
                />
              </label>
              <span className="text-base text-gray-600">
                {agencyLogoUrlFileName}
              </span>
            </div>
          </div>
        </div>

        {/* VAT ID Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Aim of the Agency
            </label>
            <input
              {...register("aim")}
              type="text"
              placeholder="Enter here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Upload VAT ID (PDF)
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 rounded-l-md cursor-pointer bg-gray-300 hover:bg-gray-200 transition-colors text-base font-semibold">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleVatChange}
                  accept="application/pdf"
                />
              </label>
              <span className="text-base text-gray-600">{vatFileName}</span>
            </div>
          </div>
        </div>

        {/* Facilities and Description Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Facilities your agency provide
            </label>
            <div className="grid grid-cols-2 gap-3">
              {predefinedFacilities.map((facility) => (
                <label key={facility} className="flex items-center">
                  <input
                    {...register("facilities")}
                    type="checkbox"
                    value={facility}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
                  />
                  <span className="text-base text-gray-700">
                    {facility.charAt(0).toUpperCase() +
                      facility.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
            {errors.facilities && (
              <span className="text-red-500 text-sm">
                {errors.facilities.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Describe about yourself (Max 100 words)
            </label>
            <textarea
              {...register("about", {
                maxLength: {
                  value: 1000,
                  message: "Description cannot exceed 100 words",
                },
              })}
              placeholder="Enter here"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white placeholder:text-base"
            />
            {errors.about && (
              <span className="text-red-500 text-sm">
                {errors.about.message}
              </span>
            )}
          </div>
        </div>

        {/* Aim and Other facilities Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Select categories (Max 5, comma-separated)
            </label>
            <input
              {...register("categories", {
                validate: (value) => {
                  const categories = value
                    ? value
                        .split(",")
                        .map((cat) => cat.trim())
                        .filter((cat) => cat)
                    : [];
                  return (
                    categories.length <= 5 ||
                    "You can select a maximum of 5 categories"
                  );
                },
              })}
              type="text"
              placeholder="Enter here (comma-separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
            />
            {errors.categories && (
              <span className="text-red-500 text-sm">
                {errors.categories.message}
              </span>
            )}
            {allCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {allCategories.map((category, index) => (
                  <span
                    key={index}
                    className="text-base text-gray-700 bg-white px-5 rounded-full py-[2px] border border-gray-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Other facilities (comma-separated)
            </label>
            <input
              {...register("otherFacilities", {
                validate: (value) => {
                  const facilities = value
                    ? value
                        .split(",")
                        .map((f) => f.trim())
                        .filter((f) => f)
                    : [];
                  return (
                    facilities.length <= 2 ||
                    "Maximum 2 other facilities allowed"
                  );
                },
              })}
              type="text"
              placeholder="Enter here (e.g., Wi-Fi, Parking)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
            />
            {errors.otherFacilities && (
              <span className="text-red-500 text-sm">
                {errors.otherFacilities.message}
              </span>
            )}
            {allFacilities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {allFacilities.map((facility, index) => (
                  <span
                    key={index}
                    className="text-base text-gray-700 bg-white px-5 rounded-full py-[2px] border border-gray-200"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

        {/* Contact Information Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Contact information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Phone number (Home)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <input
                  {...register("phoneNumber")}
                  type="tel"
                  placeholder="Ex. 123456789"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                {...register("website")}
                type="url"
                placeholder="Enter here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                {...register("location")}
                type="text"
                placeholder="Enter here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="user@mail.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Profile Handler Name
              </label>
              <input
                {...register("handlerName")}
                type="text"
                placeholder="Enter here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Profile Handler Position
              </label>
              <input
                {...register("handlerPosition")}
                type="text"
                placeholder="Enter here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder:text-base"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isUpdateLoading}
            className={`px-6 py-2 bg-[#3776E2] cursor-pointer font-medium text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-base ${
              isUpdateLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUpdateLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileEdit;
