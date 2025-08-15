"use client";

import { useState, useEffect } from "react";
import { useCreatePlanOneMutation, useUpdatePlanMutation } from "@/redux/features/withAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

export default function BannerSectionPopup({ closeForm }) {
  const totalSteps = 3; // Moved to the top to avoid initialization error

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
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
    // Check for access token (assuming it's stored in localStorage or context)
    const accessToken = localStorage.getItem("access_token"); // Adjust based on your auth setup
    if (!accessToken) {
      toast.error("Please log in to create a plan");
      navigate("/login"); // Redirect to login page
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
      navigate("/user"); // Redirect to plans list
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden md:max-w-md sm:max-w-sm">
      {/* Progress Bar */}
      <div className="bg-gray-100 p-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-600">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#FF6600] h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center sm:text-xl">Create a Tour Plan</h2>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (From)</label>
                <input
                  {...register("locationFrom", { required: "Location (From) is required" })}
                  type="text"
                  placeholder="Enter here"
                  defaultValue={formData.locationFrom}
                  onChange={(e) => updateFormData("locationFrom", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.locationFrom && <span className="text-red-500 text-xs">{errors.locationFrom.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (To)</label>
                <input
                  {...register("locationTo", { required: "Location (To) is required" })}
                  type="text"
                  placeholder="Enter here"
                  defaultValue={formData.locationTo}
                  onChange={(e) => updateFormData("locationTo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.locationTo && <span className="text-red-500 text-xs">{errors.locationTo.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                <input
                  {...register("startingDate", { required: "Starting Date is required" })}
                  type="date"
                  defaultValue={formData.startingDate}
                  onChange={(e) => updateFormData("startingDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.startingDate && <span className="text-red-500 text-xs">{errors.startingDate.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ending Date</label>
                <input
                  {...register("endingDate", { required: "Ending Date is required" })}
                  type="date"
                  defaultValue={formData.endingDate}
                  onChange={(e) => updateFormData("endingDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.endingDate && <span className="text-red-500 text-xs">{errors.endingDate.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adult</label>
                <input
                  {...register("adults", { required: "At least one adult or child is required" })}
                  type="number"
                  placeholder="Enter number of adults"
                  defaultValue={formData.adults}
                  onChange={(e) => updateFormData("adults", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.adults && <span className="text-red-500 text-xs">{errors.adults.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                <input
                  {...register("children")}
                  type="number"
                  placeholder="Enter number of children"
                  defaultValue={formData.children}
                  onChange={(e) => updateFormData("children", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                />
                {errors.children && <span className="text-red-500 text-xs">{errors.children.message}</span>}
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
                placeholder="USD"
                defaultValue={formData.budget}
                onChange={(e) => updateFormData("budget", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
              />
              {errors.budget && <span className="text-red-500 text-xs">{errors.budget.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tourist Spots</label>
              <input
                {...register("touristSpots", { required: "Tourist Spots are required" })}
                type="text"
                placeholder="Example: Cox's Bazar, Sundarbans, Bandarban"
                defaultValue={formData.touristSpots}
                onChange={(e) => updateFormData("touristSpots", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
              />
              {errors.touristSpots && <span className="text-red-500 text-xs">{errors.touristSpots.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                placeholder="Enter here"
                rows="4"
                defaultValue={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-sm"
              ></textarea>
              {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Picture (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-3 sm:p-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#FF6600] file:text-white hover:file:bg-[#e55600]"
                />
                {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel Type</label>
                <select
                  {...register("travelType", { required: "Travel Type is required" })}
                  defaultValue={formData.travelType}
                  onChange={(e) => updateFormData("travelType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                >
                  <option value="">Select Travel Type</option>
                  <option value="family">Family Trip</option>
                  <option value="solo">Solo Travel</option>
                  <option value="couple">Couple</option>
                  <option value="group">Group Travel</option>
                  <option value="business">Business Travel</option>
                </select>
                {errors.travelType && <span className="text-red-500 text-xs">{errors.travelType.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Type</label>
                <select
                  {...register("destinationType", { required: "Destination Type is required" })}
                  defaultValue={formData.destinationType}
                  onChange={(e) => updateFormData("destinationType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-sm"
                >
                  <option value="">Select Destination Type</option>
                  <option value="beach">Beach</option>
                  <option value="mountain">Mountain</option>
                  <option value="city">City</option>
                  <option value="historical">Historical</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                </select>
                {errors.destinationType && <span className="text-red-500 text-xs">{errors.destinationType.message}</span>}
              </div>
            </div>

            <div className="bg-gray-50 p-3 sm:p-2 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2 text-sm">Review Your Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">From:</span> {formData.locationFrom || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">To:</span> {formData.locationTo || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Dates:</span> {formData.startingDate} to {formData.endingDate}
                </p>
                <p>
                  <span className="font-medium">Travelers:</span> {formData.adults} adults, {formData.children} children
                </p>
                <p>
                  <span className="font-medium">Budget:</span> {formData.budget || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Travel Type:</span> {formData.travelType || "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input
                {...register("confirmation")}
                type="checkbox"
                id="confirmation"
                checked={formData.confirmation}
                onChange={(e) => updateFormData("confirmation", e.target.checked)}
                className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded mt-1"
              />
              <label htmlFor="confirmation" className="ml-2 text-sm text-gray-700">
                I confirm this is a travel request, and all provided information is valid and does not include any third
                party.
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 sm:mb-0">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
              >
                Previous
              </button>
            )}
            <button
              onClick={closeForm}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              Cancel
            </button>
          </div>

          <div>
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="bg-[#FF6600] hover:bg-[#e55600] text-white font-medium py-1.5 px-4 rounded-md text-sm w-full sm:w-auto"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit((data) => onSubmit(data, "published"))} // Default to published
                disabled={isSavingDraft || isPublishing || !formData.confirmation}
                className="bg-[#FF6600] hover:bg-[#e55600] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-1.5 px-4 rounded-md text-sm w-full sm:w-auto"
              >
                {isSavingDraft ? "Saving Draft..." : isPublishing ? "Publishing..." : "Submit Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}