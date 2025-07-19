"use client";

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import {
  useGetTuristProfileQuery,
  useUpdateTuristProfileMutation,
} from "@/redux/features/withAuth";

function UserEditProfile() {
  const { data: profileData, isLoading: profileLoading } =
    useGetTuristProfileQuery();
  const [updateUser, { isLoading: updateLoading }] =
    useUpdateTuristProfileMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phonePersonal: "",
    describeYourself: "",
    profession: "",
    education: "",
    gender: "",
    age: "",
    language: "",
    picture: null,
    houseNo: "",
    roadNo: "",
    townCity: "",
    postalCode: "",
    country: "",
    phoneHome: "",
  });

  // Populate the formData with fetched profile
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        phonePersonal: profileData.phone_personal || "",
        describeYourself: profileData.bio || "",
        profession: profileData.profession || "",
        education: profileData.education || "",
        gender: profileData.gender || "",
        age: profileData.age || "",
        language: profileData.language || "",
        houseNo: profileData.address_house_no || "",
        roadNo: profileData.address_road_no || "",
        townCity: profileData.address_city || "",
        postalCode: profileData.address_postal_code || "",
        country: profileData.address_country || "",
        phoneHome: profileData.phone_home || "",
        picture: null, // keep null unless user uploads a new one
      }));
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, picture: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("first_name", formData.firstName);
    payload.append("last_name", formData.lastName);
    payload.append("phone_personal", formData.phonePersonal);
    payload.append("bio", formData.describeYourself);
    payload.append("profession", formData.profession);
    payload.append("education", formData.education);
    payload.append("gender", formData.gender.toLocaleLowerCase());
    payload.append("age", formData.age);
    payload.append("language", formData.language);
    payload.append("address_house_no", formData.houseNo);
    payload.append("address_road_no", formData.roadNo);
    payload.append("address_city", formData.townCity);
    payload.append("address_postal_code", formData.postalCode);
    payload.append("address_country", formData.country);
    payload.append("phone_home", formData.phoneHome);
    if (formData.picture) payload.append("profile_picture", formData.picture);

    try {
      await updateUser(payload).unwrap();
      // You can show a success message or navigate elsewhere
      // alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (profileLoading) return <p>Loading profile...</p>;

  return (
    <div className="p-3 sm:p-4 lg:p-4 font-semibold">
      <div className="mb-3 sm:mb-4 lg:mb-5">
        <NavLink
          to="/user/profile"
          className="inline-flex items-center px-2 sm:px-3 lg:px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm sm:text-base lg:text-base"
        >
          <IoArrowBack className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 mr-1 sm:mr-2 lg:mr-2 text-gray-700" />
          Back
        </NavLink>
      </div>

      <h1 className="text-xl sm:text-2xl lg:text-3xl pb-3 sm:pb-4 lg:pb-5">
        Welcome, <span className="font-normal">Edit Profile Details</span>
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Personal phone */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Phone number (personal)
            </label>
            <input
              type="tel"
              name="phonePersonal"
              value={formData.phonePersonal}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Bio */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Describe yourself in short
            </label>
            <input
              type="text"
              name="describeYourself"
              value={formData.describeYourself}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Profession */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Education */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Education
            </label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Gender and Age */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-3">
              <div>
                <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                  Gender
                </label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter here"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter here"
                />
              </div>
            </div>
          </div>
          {/* Language */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Language
            </label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter here"
            />
          </div>
          {/* Picture */}
          <div>
            <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
              Upload picture
            </label>
            <div className="flex items-center space-x-2 p-1 h-[42px] border border-gray-200 rounded-sm bg-white">
              <label className="inline-block px-2 sm:px-3 lg:px-4 py-1 bg-gray-100 border rounded cursor-pointer text-xs sm:text-sm lg:text-sm">
                Choose file
                <input
                  type="file"
                  name="picture"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-gray-500 text-xs sm:text-sm lg:text-sm truncate">
                {formData.picture ? formData.picture.name : "Choose a file"}
              </span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mt-6 sm:mt-7 lg:mt-8 mb-3 sm:mb-4 lg:mb-5">
          <h3 className="text-lg sm:text-xl lg:text-[24px] font-semibold text-gray-700 mb-3 sm:mb-4 lg:mb-4">
            Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                House No.
              </label>
              <input
                type="text"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                Road No
              </label>
              <input
                type="text"
                name="roadNo"
                value={formData.roadNo}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                Town/city
              </label>
              <input
                type="text"
                name="townCity"
                value={formData.townCity}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                Postal code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium text-sm sm:text-base lg:text-base mb-1">
                Phone number (Home)
              </label>
              <input
                type="tel"
                name="phoneHome"
                value={formData.phoneHome}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white text-sm sm:text-base lg:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter here"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 sm:mt-8 lg:mt-8">
          <button
            disabled={updateLoading}
            type="submit"
            className="w-full sm:w-auto lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 sm:px-8 lg:px-8 rounded-md transition-colors text-sm sm:text-base lg:text-base"
          >
            {updateLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEditProfile;
