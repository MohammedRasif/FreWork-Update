import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  useCreatePlanOneMutation,
  useGetOneDetailQuery,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { Toaster, toast } from "react-hot-toast";
import FullScreenInfinityLoader from "@/lib/Loading";

const CreatePlan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createPlan] = useCreatePlanOneMutation();
  const [update] = useUpdatePlanMutation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const { data: oldData, isLoading: isFetching } = useGetOneDetailQuery(
    state?.id,
    { skip: !state?.id }
  );

  // Populate form with data when oldData is available
  useEffect(() => {
    if (state?.id && oldData) {
      setValue("name", oldData.name || "");
      setValue("email", oldData.email || "");
      setValue("phoneNumber", oldData.phone_number || "");
      setValue("locationFrom", oldData.location_from || "");
      setValue("locationTo", oldData.location_to || "");
      setValue(
        "startingDate",
        oldData.start_date
          ? new Date(oldData.start_date).toISOString().split("T")[0]
          : ""
      );
      setValue(
        "endingDate",
        oldData.end_date
          ? new Date(oldData.end_date).toISOString().split("T")[0]
          : ""
      );
      setValue("adult", oldData.adult_count || 0);
      setValue("child", oldData.child_count || 0);
      setValue("budget", oldData.budget || "");
      setValue("touristSpots", oldData.tourist_spots || "");
      setValue("description", oldData.description || "");
      setValue("travelType", oldData.travel_type || "");
      setValue("destinationType", oldData.destination_type || "");
      setValue("typeOfAccommodation", oldData.type_of_accommodation || "");
      setValue("minimumHotelStars", oldData.minimum_hotel_stars || "");
      setValue("mealPlan", oldData.meal_plan || "");
      setValue("confirmation", !!oldData.is_confirmed_request);
    }
  }, [state?.id, oldData, setValue]);

  const onSubmit = async (data, status) => {
    if (data.endingDate < data.startingDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (!data.adult && !data.child) {
      toast.error("At least one adult or child is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phoneNumber);
    formData.append("location_from", data.locationFrom);
    formData.append("location_to", data.locationTo);
    formData.append("start_date", data.startingDate);
    formData.append("end_date", data.endingDate);
    formData.append("adult_count", data.adult || 0);
    formData.append("child_count", data.child || 0);
    formData.append("budget", data.budget);
    formData.append("description", data.description);
    formData.append("travel_type", data.travelType);
    formData.append("destination_type", data.destinationType);
    formData.append("type_of_accommodation", data.typeOfAccommodation);
    formData.append("includes", data.minimumHotelStars);
    formData.append("meal_plan", data.mealPlan);
    formData.append("status", status);
    formData.append("tourist_spots", data.touristSpots);
    formData.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false"
    );

    if (selectedFile) {
      formData.append("spot_picture", selectedFile);
    }

    try {
      if (status === "draft") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }

      if (state?.id) {
        await update({ id: state.id, updates: formData }).unwrap();
        toast.success("Plan updated successfully!");
      } else {
        await createPlan(formData).unwrap();
        toast.success("Plan created successfully!");
        reset();
        setSelectedFile(null);
      }
      navigate("/user");
    } catch (error) {
      toast.error(
        `Error ${state?.id ? "updating" : "creating"} plan: ${error.message}`
      );
    } finally {
      if (status === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  if (isFetching && state?.id) {
    return <FullScreenInfinityLoader />;
  }

  return (
    <div className="p-6">
      <div className="mx-auto">
        <Toaster />
        {/* Header */}
        <div className="flex items-center mb-8">
          <NavLink to="/user">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <FiArrowLeft className="w-5 h-5" />
              <span className="text-md">Back</span>
            </button>
          </NavLink>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {state?.id ? "Edit Tour Plan" : "Create a Tour Plan"}
        </h1>

        {/* Form */}
        <form className="space-y-6">
          {/* Row 1: Name, Email, Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Invalid phone number",
                  },
                })}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div className="flex flex-row gap-4">
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  Type of Accommodation
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("typeOfAccommodation", {
                    required: "Type of accommodation is required",
                  })}
                >
                  <option value="" disabled selected>
                    Select Accommodation Type
                  </option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="homestay">Homestay</option>
                  <option value="apartment">Apartment</option>
                  <option value="hostel">Hostel</option>
                </select>
                {errors.typeOfAccommodation && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.typeOfAccommodation.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  Destination Type
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("destinationType", {
                    required: "Destination Type is required",
                  })}
                >c
                  <option value="" disabled selected>
                    Select Destination Type
                  </option>
                  <option value="beach">Beach trips</option>
                  <option value="mountain">Mountain adventures</option>
                  <option value="relaxing">Relaxing tours</option>
                  <option value="group">Group packages</option>
                </select>
                {errors.destinationType && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.destinationType.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  Minimum Hotel Stars
                </label>
                <select
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("minimumHotelStars", {
                    required: "Minimum hotel stars is required",
                  })}
                >
                  <option value="" disabled selected>
                    Select Star Rating
                  </option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
                {errors.minimumHotelStars && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.minimumHotelStars.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Location From & To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Location (From)
              </label>
              <input
                type="text"
                placeholder="Enter here"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("locationFrom", {
                  required: "Location from is required",
                })}
              />
              {errors.locationFrom && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.locationFrom.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Location (To)
              </label>
              <input
                type="text"
                placeholder="Enter here"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("locationTo", {
                  required: "Location to is required",
                })}
              />
              {errors.locationTo && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.locationTo.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: Starting Date & Ending Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Starting Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 max-w-full"
                  {...register("startingDate", {
                    required: "Starting date is required",
                  })}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.startingDate && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.startingDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Ending Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  {...register("endingDate", {
                    required: "Ending date is required",
                  })}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.endingDate && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.endingDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 4: Adult & Child & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex w-full gap-4">
              <div className="flex-1">
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  Adult
                </label>
                <input
                  type="number"
                  placeholder="Enter number of adults"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("adult", {
                    min: {
                      value: 0,
                      message: "Number of adults cannot be negative",
                    },
                  })}
                />
                {errors.adult && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.adult.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[16px] font-medium text-gray-700 mb-2">
                  Child
                </label>
                <input
                  type="number"
                  placeholder="Enter number of children"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("child", {
                    min: {
                      value: 0,
                      message: "Number of children cannot be negative",
                    },
                  })}
                />
                {errors.child && (
                  <p className="text-red-500 text-[14px] mt-1">
                    {errors.child.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Budget
              </label>
              <input
                type="number"
                placeholder="EUR"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("budget", {
                  required: "Budget is required",
                  min: { value: 0, message: "Budget cannot be negative" },
                })}
              />
              {errors.budget && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.budget.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 5: Tourist Spots & Upload Picture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Tourist Spots
              </label>
              <input
                type="text"
                placeholder="Example: Cox's Bazar, Sundarbans, Bandarban"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("touristSpots", {
                  required: "Tourist spots are required",
                })}
              />
              {errors.touristSpots && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.touristSpots.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Upload Picture (Optional)
              </label>
              <div className="flex items-center bg-white gap-3">
                <label className="bg-gray-200 px-4 py-2 rounded-l-md cursor-pointer transition-colors border border-gray-300">
                  <span className="text-[14px] text-gray-600">Choose file</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                <span className="text-[14px] text-gray-500 flex-1">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Row 6: Description & Meal Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter here"
                rows={4}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                {...register("description", {
                  required: "Description is required",
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-2">
                Meal Plan
              </label>
              <select
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("mealPlan", { required: "Meal plan is required" })}
              >
                <option value="" disabled selected>
                  Select Meal Plan
                </option>
                <option value="none">No Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="half-board">
                  Half-Board (Breakfast & Dinner)
                </option>
                <option value="full-board">Full-Board (All Meals)</option>
              </select>
              {errors.mealPlan && (
                <p className="text-red-500 text-[14px] mt-1">
                  {errors.mealPlan.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 7: Travel Type, Destination Type, Type of Accommodation, Minimum Hotel Stars */}

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 mt-8">
            <input
              type="checkbox"
              id="confirmation"
              className="mt-1 w-4 h-4 text-blue-600 border border-blue-600 rounded focus:ring-blue-500 hover:cursor-pointer checkbox checkbox-xs checked:text-blue-600"
              {...register("confirmation", {
                required: "Please confirm the information",
              })}
            />
            <label
              htmlFor="confirmation"
              className="text-[15px] text-gray-600 leading-relaxed"
            >
              I confirm this is a travel request, and all provided information
              is valid and does not include any third party.
            </label>
          </div>
          {errors.confirmation && (
            <p className="text-red-500 text-[14px] mt-1">
              {errors.confirmation.message}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-6">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isSavingDraft || isPublishing}
            >
              {isSavingDraft ? "Saving..." : "Save for Future"}
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, "published"))}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              disabled={isSavingDraft || isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlan;
