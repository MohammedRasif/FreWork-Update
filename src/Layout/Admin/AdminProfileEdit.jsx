import { useForm } from "react-hook-form";
import { useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { NavLink } from "react-router-dom";

const AdminProfileEdit = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agencyName: "",
      vatNumber: "",
      email: "",
      phoneNumber: "",
      description: "",
      categories: [],
    },
  });

  const [logoFileName, setLogoFileName] = useState("");
  const [coverPhotoFileName, setCoverPhotoFileName] = useState("");

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
    alert("Agency Registration form submitted!");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setLogoFileName(file.name);
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCoverPhotoFileName(file.name);
  };

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
          Agency Registration
        </h1>
        <div></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Agency Data */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Agency Data
        </h3>
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
              {...register("vatNumber")}
              type="text"
              placeholder="Enter here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="user@mail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              {...register("phoneNumber")}
              type="tel"
              placeholder="Ex. 123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Images */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-md">
              <label className="px-4 py-2 text-gray-700 cursor-pointer bg-gray-300 hover:bg-gray-200">
                Choose file
                <input type="file" className="hidden" onChange={handleLogoChange} />
              </label>
              <span className="text-base text-gray-600">{logoFileName}</span>
            </div>
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
                />
              </label>
              <span className="text-base text-gray-600">
                {coverPhotoFileName}
              </span>
            </div>
          </div>
        </div>

        {/* Profile */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile</h3>
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter a short description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Categories */}
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Main Categories
        </h3>
        <div className="flex flex-wrap gap-3">
          {["Italy", "France", "Spain", "Germany", "Greece"].map((country) => (
            <label
              key={country}
              className="flex items-center gap-2 text-base text-gray-700 bg-white px-4 py-1 rounded-full border border-gray-200 cursor-pointer"
            >
              <input
                type="checkbox"
                value={country}
                {...register("categories")}
                className="h-4 w-4 text-blue-600"
              />
              {country}
            </label>
          ))}
        </div>

        {/* Confirmation */}
        <div className="flex items-center mt-6">
          <input
            type="checkbox"
            {...register("terms", { required: "You must accept Terms & Privacy" })}
            className="h-4 w-4 text-blue-600"
          />
          <span className="ml-2 text-base text-gray-700">
            I accept Terms and Privacy
          </span>
        </div>
        {errors.terms && (
          <span className="text-red-500 text-sm">{errors.terms.message}</span>
        )}

        {/* Submit */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-[#3776E2] font-medium text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfileEdit;
