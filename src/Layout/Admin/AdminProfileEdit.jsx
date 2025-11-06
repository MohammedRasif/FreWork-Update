import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import { GoArrowLeft } from "react-icons/go";
import { NavLink } from "react-router-dom";
import { useAdminProfileMutation, useGetAgencyProfileQuery } from "@/redux/features/withAuth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const AdminProfileEdit = () => {
  const categoryMap = useMemo(
    () => ({
      "Beach trips": "beach",
      "Mountain adventures": "mountain",
      "Relaxing tours": "desert",
      "Group Packages": "island",
    }),
    []
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
  }, [profileData, reset]);

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
      if (validateFileSize(file, setLogoSizeError, "Logo must be under 10MB")) {
        setLogoFile(file);
        clearErrors("logoFile");
      } else {
        setLogoFile(null);
        e.target.value = null; // Reset input
        setError("logoFile", { message: "File too large" });
      }
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFileSize(file, setCoverSizeError, "Cover photo must be under 10MB")) {
        setCoverPhotoFile(file);
        clearErrors("coverPhotoFile");
      } else {
        setCoverPhotoFile(null);
        e.target.value = null;
        setError("coverPhotoFile", { message: "File too large" });
      }
    }
  };

  const onSubmit = async (data) => {
    // Final check before submit
    if (logoFile && logoFile.size > MAX_FILE_SIZE) {
      setLogoSizeError("Logo must be under 10MB");
      return;
    }
    if (coverPhotoFile && coverPhotoFile.size > MAX_FILE_SIZE) {
      setCoverSizeError("Cover photo must be under 10MB");
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

      const response = await adminProfile(formData).unwrap();
      console.log("Profile Updated:", response);
      alert("Agency profile updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update agency profile. Please try again.");
    }
  };

  if (isProfileLoading) {
    return <div>Loading profile data...</div>;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <NavLink to="/admin/profile" className="flex items-center space-x-1 cursor-pointer">
          <GoArrowLeft size={22} />
          <h1 className="text-[19px] -mt-1">Back</h1>
        </NavLink>
        <h1 className="text-3xl text-black font-semibold text-center pb-10 pt-5">
          Agency Registration
        </h1>
        <div></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Agency Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Agency Name
            </label>
            <input
              {...register("agencyName", { required: "Agency name is required" })}
              type="text"
              placeholder="Enter here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.agencyName && (
              <span className="text-red-500 text-sm">
                {errors.agencyName.message}
              </span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              VAT Number
            </label>
            <input
              {...register("vatNumber", {
                required: "VAT Number is required",
                pattern: {
                  value: /^\d{11}$/,
                  message: "VAT Number must be exactly 11 digits",
                },
              })}
              type="text"
              placeholder="Enter 11-digit VAT Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.vatNumber && (
              <span className="text-red-500 text-sm">{errors.vatNumber.message}</span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="user@mail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              {...register("phoneNumber", {
                required: "Phone Number is required",
                pattern: {
                  value: /^[0-9]{9,15}$/,
                  message: "Invalid phone number",
                },
              })}
              type="tel"
              placeholder="Ex. 123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            {errors.phoneNumber && (
              <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 cursor-pointer bg-gray-300 hover:bg-gray-200">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </label>
              <span className="text-base text-gray-600 truncate max-w-[150px]">
                {logoFile ? logoFile.name : "No file chosen"}
              </span>
            </div>
            {logoSizeError && (
              <p className="text-red-500 text-sm mt-1">{logoSizeError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
            <p className="text-xs  mt-1 text-red-400">Uploading logo and photos is mandatory. Without images, your profile will not be activated and you will not be able to use all functions.</p>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Cover Photo
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 cursor-pointer bg-gray-300 hover:bg-gray-200">
                Choose file
                <input
                  type="file"
                  className="hidden"
                  onChange={handleCoverPhotoChange}
                  accept="image/*"
                />
              </label>
              <span className="text-base text-gray-600 truncate max-w-[150px]">
                {coverPhotoFile ? coverPhotoFile.name : "No file chosen"}
              </span>
            </div>
            {coverSizeError && (
              <p className="text-red-500 text-sm mt-1">{coverSizeError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Max size: 10MB</p>
            <p className="text-xs mt-1 text-red-400">Uploading logo and photos is mandatory. Without images, your profile will not be activated and you will not be able to use all functions.</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile</h3>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            {...register("description", {
              maxLength: {
                value: 500,
                message: "Description cannot exceed 500 characters",
              },
            })}
            placeholder="Enter a short description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description.message}</span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Main Categories</h3>
        <div className="flex flex-wrap gap-3">
          {["Beach trips", "Mountain adventures", "Relaxing tours", "Group Packages"].map(
            (category) => (
              <label
                key={category}
                className="flex items-center gap-2 text-base text-gray-700 bg-white px-4 py-1 rounded-full border border-gray-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={category}
                  {...register("categories", {
                    validate: (value) =>
                      value.length > 0 || "At least one category must be selected",
                  })}
                  className="h-4 w-4 text-blue-600"
                />
                {category}
              </label>
            )
          )}
          {errors.categories && (
            <span className="text-red-500 text-sm w-full">{errors.categories.message}</span>
          )}
        </div>

        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            {...register("terms", {
              required: "You must accept Terms & Privacy",
            })}
            className="h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-base text-gray-700">
            I accept Terms and Privacy
          </span>
        </div>
        {errors.terms && (
          <span className="text-red-500 text-sm">{errors.terms.message}</span>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error.data?.message || "An error occurred while updating the profile"}
          </div>
        )}

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={isLoading || !!logoSizeError || !!coverSizeError}
            className={`px-6 py-2 bg-[#3776E2] font-medium text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 ${
              isLoading || logoSizeError || coverSizeError
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading ? "Updating..." : "Complete Registration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileEdit;