"use client";

import { useState, useEffect } from "react";
import { useCreatePlanOneMutation, useUpdatePlanMutation } from "@/redux/features/withAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

export default function BannerSectionPopup({ closeForm }) {
  const totalSteps = 4; // Increased to 4 to accommodate new step

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    locationFrom: "",
    locationTo: "",
    startingDate: "",
    endingDate: "",
    adults: "",
    children: "",
    budget: "",
    touristSpots: "",
    description: "",
    uploadedFile: null,
    travelType: "",
    destinationType: "",
    confirmation: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [createPlan] = useCreatePlanOneMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  // Populate form with data when state?.id exists
  useEffect(() => {
    if (state?.id) {
      setValue("name", state?.name || "");
      setValue("email", state?.email || "");
      setValue("phoneNumber", state?.phone_number || "");
      setValue("locationFrom", state?.location_from || "");
      setValue("locationTo", state?.location_to || "");
      setValue("startingDate", state?.start_date ? new Date(state.start_date).toISOString().split("T")[0] : "");
      setValue("endingDate", state?.end_date ? new Date(state.end_date).toISOString().split("T")[0] : "");
      setValue("adults", state?.adult_count || "");
      setValue("children", state?.child_count || "");
      setValue("budget", state?.budget || "");
      setValue("touristSpots", state?.tourist_spots || "");
      setValue("description", state?.description || "");
      setValue("travelType", state?.travel_type || "");
      setValue("destinationType", state?.destination_type || "");
      setValue("confirmation", !!state?.is_confirmed_request);
    }
  }, [state?.id, setValue]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data, status) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      toast.error("Please log in to create a plan");
      navigate("/login");
      return;
    }

    if (data.endingDate < data.startingDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (!data.adults && !data.children) {
      toast.error("At least one adult or child is required");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", data.name);
    formDataToSend.append("email", data.email);
    formDataToSend.append("phone_number", data.phoneNumber);
    formDataToSend.append("location_from", data.locationFrom);
    formDataToSend.append("location_to", data.locationTo);
    formDataToSend.append("start_date", data.startingDate);
    formDataToSend.append("end_date", data.endingDate);
    formDataToSend.append("adult_count", data.adults || 0);
    formDataToSend.append("child_count", data.children || 0);
    formDataToSend.append("budget", data.budget);
    formDataToSend.append("description", data.description);
    formDataToSend.append("travel_type", data.travelType);
    formDataToSend.append("destination_type", data.destinationType);
    formDataToSend.append("status", status);
    formDataToSend.append("tourist_spots", data.touristSpots);
    formDataToSend.append("is_confirmed_request", data.confirmation ? "true" : "false");

    if (selectedFile) {
      formDataToSend.append("spot_picture", selectedFile);
    }

    try {
      if (status === "draft") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }

      if (state?.id) {
        await updatePlan({ id: state.id, updates: formDataToSend }).unwrap();
        toast.success("Plan updated successfully!");
      } else {
        await createPlan(formDataToSend).unwrap();
        toast.success("Plan created successfully!");
        reset();
        setSelectedFile(null);
      }
      navigate("/user");
      closeForm();
    } catch (error) {
      toast.error(`Error ${state?.id ? "updating" : "creating"} plan: ${error.message}`);
    } finally {
      if (status === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    updateFormData("uploadedFile", file);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden md:max-w-2xl sm:max-w-md transition-all duration-300">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-[#FF6600] to-[#e55600] p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-white">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-semibold text-white">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-4">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center sm:text-2xl">Create Your Tour Plan</h2>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-1">
            <div className="grid grid-cols-1 gap-4 sm:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (From)</label>
                <input
                  {...register("locationFrom", { required: "Location (From) is required" })}
                  type="text"
                  placeholder="Enter starting location"
                  defaultValue={formData.locationFrom}
                  onChange={(e) => updateFormData("locationFrom", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.locationFrom && <span className="text-red-500 text-xs mt-1">{errors.locationFrom.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (To)</label>
                <input
                  {...register("locationTo", { required: "Location (To) is required" })}
                  type="text"
                  placeholder="Enter destination"
                  defaultValue={formData.locationTo}
                  onChange={(e) => updateFormData("locationTo", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.locationTo && <span className="text-red-500 text-xs mt-1">{errors.locationTo.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                <input
                  {...register("startingDate", { required: "Starting Date is required" })}
                  type="date"
                  defaultValue={formData.startingDate}
                  onChange={(e) => updateFormData("startingDate", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.startingDate && <span className="text-red-500 text-xs mt-1">{errors.startingDate.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
                <input
                  {...register("endingDate", { required: "Ending Date is required" })}
                  type="date"
                  defaultValue={formData.endingDate}
                  onChange={(e) => updateFormData("endingDate", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.endingDate && <span className="text-red-500 text-xs mt-1">{errors.endingDate.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                <input
                  {...register("adults", { required: "At least one adult or child is required" })}
                  type="number"
                  placeholder="Number of adults"
                  defaultValue={formData.adults}
                  onChange={(e) => updateFormData("adults", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.adults && <span className="text-red-500 text-xs mt-1">{errors.adults.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                <input
                  {...register("children")}
                  type="number"
                  placeholder="Number of children"
                  defaultValue={formData.children}
                  onChange={(e) => updateFormData("children", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                />
                {errors.children && <span className="text-red-500 text-xs mt-1">{errors.children.message}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                {...register("budget", { required: "Budget is required" })}
                type="text"
                placeholder="Enter budget (USD)"
                defaultValue={formData.budget}
                onChange={(e) => updateFormData("budget", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.budget && <span className="text-red-500 text-xs mt-1">{errors.budget.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tourist Spots</label>
              <input
                {...register("touristSpots", { required: "Tourist Spots are required" })}
                type="text"
                placeholder="E.g., Cox's Bazar, Sundarbans, Bandarban"
                defaultValue={formData.touristSpots}
                onChange={(e) => updateFormData("touristSpots", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.touristSpots && <span className="text-red-500 text-xs mt-1">{errors.touristSpots.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                placeholder="Describe your trip"
                rows="5"
                defaultValue={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-sm transition-all duration-200"
              ></textarea>
              {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Picture (Optional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 sm:p-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF6600] file:text-white hover:file:bg-[#e55600] transition-all duration-200"
                />
                {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Type</label>
                <select
                  {...register("travelType", { required: "Travel Type is required" })}
                  defaultValue={formData.travelType}
                  onChange={(e) => updateFormData("travelType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                >
                  <option value="">Select Travel Type</option>
                  <option value="family">Family Trip</option>
                  <option value="solo">Solo Travel</option>
                  <option value="couple">Couple</option>
                  <option value="group">Group Travel</option>
                  <option value="business">Business Travel</option>
                </select>
                {errors.travelType && <span className="text-red-500 text-xs mt-1">{errors.travelType.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Type</label>
                <select
                  {...register("destinationType", { required: "Destination Type is required" })}
                  defaultValue={formData.destinationType}
                  onChange={(e) => updateFormData("destinationType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
                >
                  <option value="">Select Destination Type</option>
                  <option value="beach">Beach</option>
                  <option value="mountain">Mountain</option>
                  <option value="city">City</option>
                  <option value="historical">Historical</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                </select>
                {errors.destinationType && <span className="text-red-500 text-xs mt-1">{errors.destinationType.message}</span>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 sm:p-3 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 text-base">Review Your Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">From:</span> {formData.locationFrom || "Not specified"}</p>
                <p><span className="font-medium">To:</span> {formData.locationTo || "Not specified"}</p>
                <p><span className="font-medium">Dates:</span> {formData.startingDate} to {formData.endingDate}</p>
                <p><span className="font-medium">Travelers:</span> {formData.adults} adults, {formData.children} children</p>
                <p><span className="font-medium">Budget:</span> {formData.budget || "Not specified"}</p>
                <p><span className="font-medium">Travel Type:</span> {formData.travelType || "Not specified"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Personal Information */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="Enter your full name"
                defaultValue={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="Enter your email"
                defaultValue={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                {...register("phoneNumber", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Invalid phone number",
                  },
                })}
                type="tel"
                placeholder="Enter your phone number"
                defaultValue={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm transition-all duration-200"
              />
              {errors.phoneNumber && <span className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</span>}
            </div>

            <div className="flex items-start">
              <input
                {...register("confirmation", { required: "You must confirm the request" })}
                type="checkbox"
                id="confirmation"
                checked={formData.confirmation}
                onChange={(e) => updateFormData("confirmation", e.target.checked)}
                className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded mt-1"
              />
              <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                I confirm this is a travel request, and all provided information is valid and does not include any third party.
              </label>
              {errors.confirmation && <span className="text-red-500 text-xs mt-1">{errors.confirmation.message}</span>}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 mb-3 sm:mb-0">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all duration-200"
              >
                Previous
              </button>
            )}
            <button
              onClick={closeForm}
              className="px-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit((data) => onSubmit(data, "draft"))}
              disabled={isSavingDraft || isPublishing}
              className="px-2 py-2 border border-[#FF6600] text-[#FF6600] rounded-lg hover:bg-[#FF6600] hover:text-white font-medium text-sm transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
            </button>
          </div>

          <div>
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="bg-[#FF6600] hover:bg-[#e55600] text-white font-semibold py-2 px-6 rounded-lg text-sm w-full sm:w-auto transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
                disabled={isSavingDraft || isPublishing || !formData.confirmation}
                className="bg-[#FF6600] hover:bg-[#e55600] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-1 rounded-lg text-sm w-full sm:w-auto transition-all duration-200"
              >
                {isPublishing ? "Publishing..." : "Submit Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}