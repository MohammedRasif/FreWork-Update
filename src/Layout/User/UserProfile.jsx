import { useGetTuristProfileQuery } from "@/redux/features/withAuth";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function UserProfile() {
  const { data: profileData, isLoading } = useGetTuristProfileQuery();
  const [user, setUser] = useState({});

  useEffect(() => {
    if (profileData) setUser(profileData);
  }, [profileData]);

  return (
    <div className="mx-auto p-4 ">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-2 sm:space-y-0">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Profile Details
        </h2>
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          <h1 className="text-base sm:text-lg text-gray-600">
            INVITATION CODE: 101020
          </h1>
          <NavLink to="/user/editProfile">
            <button className="text-blue-500 hover:underline border border-blue-500 rounded-md px-4 sm:px-6 py-2 flex items-center cursor-pointer">
              <FaEdit className="mr-2" /> Edit
            </button>
          </NavLink>
        </div>
      </div>

      {/* User Info and About */}
      <div className="flex flex-col sm:flex-row items-start mb-6 bg-white p-4 sm:p-5 rounded-md">
        {/* User Image and Details */}
        <div className="w-full sm:w-2/5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-300 rounded-full mb-2 mx-auto sm:mx-0 overflow-hidden">
            <img
              src={
                user.profile_picture_url ||
                "https://res.cloudinary.com/dpi0t9wfn/image/upload/v1741443124/samples/smile.jpg"
              }
              className=""
              alt="User profile"
            />
          </div>
          <div className="text-center sm:text-left ml-2">
            <h3 className="text-xl sm:text-[28px] font-semibold text-gray-700">
              {user.first_name || ""} {user.last_name || ""}
            </h3>
            <p className="text-sm text-gray-600 pt-1 sm:pt-2 font-medium">
              {user.profession || "N/A"}
            </p>
            <p className="text-sm text-gray-600 pt-1 font-medium">
              {user.address_city && user.address_country
                ? `${user.address_city}, ${user.address_country}`
                : user.address_city || user.address_country || "N/A"}
            </p>
          </div>
          <div className="hidden sm:block w-px ml-12 bg-gray-300 mx-4"></div>
        </div>
        {/* About Me */}
        <div className="w-full sm:w-3/5 pl-0 sm:pl-4 mt-4 sm:mt-0">
          <h4 className="text-xl sm:text-[24px] font-semibold text-gray-800">
            About me
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {user.bio || "N/A"}
          </p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mb-6 bg-white p-4 sm:p-5 rounded-md">
        <h3 className="text-xl sm:text-[24px] font-semibold text-gray-800 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 Ryan-4">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="text-md font-medium text-gray-800">
              {user.first_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="text-md font-medium text-gray-800">
              {user.last_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="text-md font-medium text-gray-800">
              {user.age ? `${user.age} years` : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="text-md font-medium text-gray-800">
              {user.gender || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Educational qualification</p>
            <p className="text-md font-medium text-gray-800">
              {user.education || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Language</p>
            <p className="text-md font-medium text-gray-800">
              {user.language || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone (Home)</p>
            <p className="text-md font-medium text-gray-800">
              {user.phone_home || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email Address (Personal)</p>
            <p className="text-md font-medium text-gray-800">
              {user.email || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-white p-4 sm:p-5 rounded-md">
        <h3 className="text-xl sm:text-[24px] font-semibold text-gray-800 mb-4">
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">House No.</p>
            <p className="text-md font-medium text-gray-800">
              {user.address_house_no || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Road No.</p>
            <p className="text-md font-medium text-gray-800">
              {user.address_road_no || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City/State</p>
            <p className="text-md font-medium text-gray-800">
              {user.address_city || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="text-md font-medium text-gray-800">
              {user.address_country || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Post Code</p>
            <p className="text-md font-medium text-gray-800">
              {user.address_postal_code || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;