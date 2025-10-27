import { useState, useEffect, useRef } from "react";
import {
  useCreatePlanOneMutation,
  useUpdatePlanMutation,
} from "@/redux/features/withAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

let isGoogleScriptLoaded = false;

export default function BannerSectionPopup({ closeForm, initialStep = 1 }) {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    locationFrom: "",
    locationTo: "",
    startingDate: "",
    endingDate: "",
    adults: 0,
    children: 0,
    budget: "",
    touristSpots: "",
    description: "",
    uploadedFile: null,
    destinationType: "",
    typeOfAccommodation: "",
    minimumHotelStars: "",
    mealPlan: "",
    travelType: "",
    includeRoundTripFlight: false,
    confirmation: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showBudgetMessage, setShowBudgetMessage] = useState(false);
  const [hasWarningBeenShown, setHasWarningBeenShown] = useState(false);
  const budgetRef = useRef(null);
  const [isPopupOpened, setIsPopupOpened] = useState(false);
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
    trigger,
  } = useForm();
  const locationFromRef = useRef(null);
  const locationToRef = useRef(null);
  const touristSpotsRef = useRef(null);

  // Define the event handlers
  const handleBudgetClick = () => {
    if (isPopupOpened && !showBudgetMessage && !hasWarningBeenShown) {
      setShowBudgetMessage(true);
    }
  };

  const handleOkClick = () => {
    setShowBudgetMessage(false);
    setHasWarningBeenShown(true);
  };

  useEffect(() => {
    // Reset states when popup is opened
    setIsPopupOpened(true);
    setShowBudgetMessage(false);
    setHasWarningBeenShown(false);

    // Load existing plan or pending plan data
    const pendingPlan = localStorage.getItem("pendingPlan");
    if (state?.id) {
      // Load data from state (existing plan)
      setValue("name", state?.name || "");
      setValue("email", state?.email || "");
      setValue("phoneNumber", state?.phone_number || "");
      setValue("locationFrom", state?.location_from || "");
      setValue("locationTo", state?.location_to || "");
      setValue(
        "startingDate",
        state?.start_date
          ? new Date(state?.start_date).toISOString().split("T")[0]
          : ""
      );
      setValue(
        "endingDate",
        state?.end_date
          ? new Date(state?.end_date).toISOString().split("T")[0]
          : ""
      );
      setValue("adults", state?.adult_count || 0);
      setValue("children", state?.child_count || 0);
      setValue("budget", state?.budget || "");
      setValue("touristSpots", state?.tourist_spots || "");
      setValue("description", state?.description || "");
      setValue("destinationType", state?.destination_type || "");
      setValue("typeOfAccommodation", state?.type_of_accommodation || "");
      setValue("minimumHotelStars", state?.minimum_star_hotel || "");
      setValue("mealPlan", state?.meal_plan || "");
      setValue("travelType", state?.travel_type || "");
      setValue("confirmation", !!state?.is_confirmed_request);
      Object.entries(state || {}).forEach(([key, value]) => {
        const mappedKey =
          {
            phone_number: "phoneNumber",
            location_from: "locationFrom",
            location_to: "locationTo",
            start_date: "startingDate",
            end_date: "endingDate",
            adult_count: "adults",
            child_count: "children",
            tourist_spots: "touristSpots",
            destination_type: "destinationType",
            type_of_accommodation: "typeOfAccommodation",
            minimum_star_hotel: "minimumHotelStars",
            meal_plan: "mealPlan",
            travel_type: "travelType",
            is_confirmed_request: "confirmation",
          }[key] || key;
        updateFormData(mappedKey, value);
      });
    } else if (pendingPlan) {
      // Load data from pendingPlan
      const parsed = JSON.parse(pendingPlan);
      Object.entries(parsed).forEach(([key, value]) => {
        setValue(key, value);
        updateFormData(key, value);
      });
    }
  }, [state?.id, setValue]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!isGoogleScriptLoaded && !window.google) {
        isGoogleScriptLoaded = true;
        console.log("Loading Google Maps script...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBIVSr8DMIg5U5P_oRIDt1j_Q32ceDQddc&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google Maps script loaded successfully");
        };
        script.onerror = () => {
          console.error("Failed to load Google Maps API");
          toast.error("Failed to load Google Maps API");
        };
        document.head.appendChild(script);
      }
    };
    loadGoogleMaps();
    return () => {};
  }, []);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API is not available");
        toast.error("Google Maps Places API is not available");
        return;
      }
      console.log("Initializing autocomplete for all fields...");
      if (locationFromRef.current) {
        console.log("Setting up autocomplete for locationFrom");
        const fromAutocomplete = new window.google.maps.places.Autocomplete(
          locationFromRef.current
        );
        fromAutocomplete.addListener("place_changed", () => {
          const place = fromAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          console.log("locationFrom selected:", locationValue);
          setValue("locationFrom", locationValue);
          updateFormData("locationFrom", locationValue);
        });
      } else {
        console.warn("locationFromRef is null");
      }
      if (locationToRef.current) {
        console.log("Setting up autocomplete for locationTo");
        const toAutocomplete = new window.google.maps.places.Autocomplete(
          locationToRef.current
        );
        toAutocomplete.addListener("place_changed", () => {
          const place = toAutocomplete.getPlace();
          const locationValue = place.formatted_address || place.name;
          console.log("locationTo selected:", locationValue);
          setValue("locationTo", locationValue);
          updateFormData("locationTo", locationValue);
        });
      } else {
        console.warn("locationToRef is null");
      }
      
    };
    if (window.google) {
      setTimeout(initAutocomplete, 100);
    }
  }, [setValue, currentStep]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = async (step) => {
    let fieldsToValidate = [];
    switch (step) {
      case 1:
        fieldsToValidate = ["startingDate", "endingDate", "adults", "children"];
        break;
      case 2:
        fieldsToValidate = [
          "locationFrom",
          "locationTo",
          "budget",
          "touristSpots",
        ];
        break;
      case 3:
        fieldsToValidate = [
          "typeOfAccommodation",
          "minimumHotelStars",
          "mealPlan",
        ];
        break;
      case 4:
        fieldsToValidate = ["travelType", "destinationType"];
        break;
      case 5:
        fieldsToValidate = ["name", "email", "phoneNumber", "confirmation"];
        break;
      default:
        return true;
    }
    const result = await trigger(fieldsToValidate);
    if (!result) {
      toast.error("Please fill all required fields before proceeding.");
    }
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data, status) => {
    console.log("onSubmit called with data:", data, "status:", status);
    const accessToken = localStorage.getItem("access_token");
    console.log("Access Token:", accessToken);
    if (!accessToken) {
      localStorage.setItem("pendingPlan", JSON.stringify(data));
      toast.error("Please log in to create a plan");
      navigate("/register", { state: { fromLogin: true } }); // Add fromLogin flag
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
    formDataToSend.append("budget", data.budget || "");
    formDataToSend.append("description", data.description || "");
    formDataToSend.append("travel_type", data.travelType || "");
    formDataToSend.append("destination_type", data.destinationType || "");
    formDataToSend.append(
      "type_of_accommodation",
      data.typeOfAccommodation || ""
    );
    formDataToSend.append("minimum_star_hotel", data.minimumHotelStars || "");
    formDataToSend.append("meal_plan", data.mealPlan || "");
    formDataToSend.append("status", status);
    formDataToSend.append("tourist_spots", data.touristSpots || "");
    formDataToSend.append(
      "is_confirmed_request",
      data.confirmation ? "true" : "false"
    );
    if (selectedFile) {
      formDataToSend.append("spot_picture", selectedFile);
    }
    console.log("FormData to send:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }
    try {
      if (status === "draft") {
        setIsSavingDraft(true);
      } else {
        setIsPublishing(true);
      }
      let response;
      if (state?.id) {
        response = await updatePlan({
          id: state.id,
          updates: formDataToSend,
        }).unwrap();
        console.log("Update Plan Response:", response);
      } else {
        response = await createPlan(formDataToSend).unwrap();
        console.log("Create Plan Response:", response);
      }

      toast.success(
        "Your data successfully submitted! When approved by admin, this tour plan will be published.",
        {
          autoClose: 4000,
          style: {
            background: "linear-gradient(135deg, #FF6600, #e55600)",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            maxWidth: "400px",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#FF6600",
          },
        }
      );

      reset();
      setSelectedFile(null);
      console.log("Navigating to /user and closing form");
      localStorage.removeItem("pendingPlan");
      navigate("/user");
      closeForm();
    } catch (error) {
      console.error("API Error:", error);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    updateFormData("uploadedFile", file);
  };

  const handlepupupClose = () => {
    localStorage.removeItem("pendingPlan");
    closeForm();
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const { ref: fromFormRef, ...fromRest } = register("locationFrom", {
    required: "Location (From) is required",
  });

  const { ref: toFormRef, ...toRest } = register("locationTo", {
    required: "Location (To) is required",
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden sm:max-w-lg xs:max-w-xs transition-all duration-300">
      <div className="bg-gradient-to-r from-[#FF6600] to-[#e55600] p-3 sm:p-4">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-semibold text-white">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2 sm:h-3">
          <div
            className="bg-white h-2 sm:h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="p-3 sm:p-4 xs:p-2 relative" style={{ zIndex: 1000 }}>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4 text-center">
          Create Your Tour Plan
        </h2>
        {currentStep === 1 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Starting Date
                </label>
                <input
                  {...register("startingDate", {
                    required: "Starting Date is required",
                  })}
                  type="date"
                  defaultValue={formData.startingDate}
                  onChange={(e) =>
                    updateFormData("startingDate", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.startingDate && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.startingDate.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Ending Date
                </label>
                <input
                  {...register("endingDate", {
                    required: "Ending Date is required",
                  })}
                  type="date"
                  defaultValue={formData.endingDate}
                  onChange={(e) => updateFormData("endingDate", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.endingDate && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.endingDate.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Adults
                </label>
                <input
                  {...register("adults", {
                    required: "At least one adult or child is required",
                    min: { value: 0, message: "Adults cannot be negative" },
                  })}
                  type="number"
                  placeholder="Adults"
                  defaultValue={formData.adults}
                  onChange={(e) => updateFormData("adults", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.adults && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.adults.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Children
                </label>
                <input
                  {...register("children", {
                    min: { value: 0, message: "Children cannot be negative" },
                  })}
                  type="number"
                  placeholder="Children"
                  defaultValue={formData.children}
                  onChange={(e) => updateFormData("children", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.children && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.children.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location (From)
                </label>
                <input
                  {...fromRest}
                  type="text"
                  placeholder="Starting location"
                  defaultValue={formData.locationFrom}
                  onChange={(e) => {
                    updateFormData("locationFrom", e.target.value);
                    setValue("locationFrom", e.target.value);
                  }}
                  ref={(e) => {
                    fromFormRef(e);
                    locationFromRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.locationFrom && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.locationFrom.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Location (To)
                </label>
                <input
                  {...toRest}
                  type="text"
                  placeholder="Destination"
                  defaultValue={formData.locationTo}
                  onChange={(e) => {
                    updateFormData("locationTo", e.target.value);
                    setValue("locationTo", e.target.value);
                  }}
                  ref={(e) => {
                    toFormRef(e);
                    locationToRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.locationTo && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.locationTo.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  {...register("budget", {
                    required: "Budget is required",
                    validate: (value) =>
                      value.trim() !== "" || "Budget cannot be empty",
                  })}
                  type="text"
                  placeholder="Budget (EUR)"
                  defaultValue={formData.budget}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFormData("budget", value);
                    setValue("budget", value, { shouldValidate: true });
                  }}
                  onClick={handleBudgetClick}
                  ref={budgetRef}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                />
                {errors.budget && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.budget.message}
                  </span>
                )}
                {showBudgetMessage && (
                  <div className="fixed inset-x-0 top-0 flex items-center justify-center z-50 pt-4">
                    <div className="bg-white rounded-lg p-4 flex flex-col items-end space-y-4 lg:w-96 w-72">
                      <p className="lg:text-[15px] text-[13px] text-gray-700">
                        Ensure a reasonable price is entered to aid agencies in
                        making appropriate offers. Users entering
                        unrealistically low prices may be restricted or
                        penalized.
                      </p>
                      <button
                        onClick={handleOkClick}
                        className="bg-[#FF6600] hover:bg-[#e55600] text-white font-semibold py-1 px-4 rounded-lg text-[14px]"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Tourist Spots
                </label>
                <input
                  {...register("touristSpots", {
                    required: "Tourist Spots is required",
                  })}
                  type="text"
                  placeholder="Mare, Monumenti, Ristorante..."
                  defaultValue={formData.touristSpots}
                  onChange={(e) => {
                    updateFormData("touristSpots", e.target.value);
                    setValue("touristSpots", e.target.value);
                    console.log("touristSpots input changed:", e.target.value);
                  }}
                  ref={(e) => {
                    touristSpotsRef.current = e;
                  }}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                  style={{ zIndex: 1001 }}
                />
                {errors.touristSpots && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.touristSpots.message}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                placeholder="Vorremmo una settimana di relax al mare con due bambini, in hotel con piscina."
                rows="4"
                defaultValue={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent resize-none text-xs sm:text-sm transition-all duration-200"
              ></textarea>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Type of Accommodation
                </label>
                <select
                  {...register("typeOfAccommodation", {
                    required: "Type of Accommodation is required",
                  })}
                  defaultValue={formData.typeOfAccommodation}
                  onChange={(e) =>
                    updateFormData("typeOfAccommodation", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">Select Accommodation Type</option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="homestay">Homestay</option>
                  <option value="apartment">Apartment</option>
                  <option value="hostel">Hostel</option>
                </select>
                {errors.typeOfAccommodation && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.typeOfAccommodation.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Minimum Hotel Stars
                </label>
                <select
                  {...register("minimumHotelStars", {
                    required: "Minimum Hotel Stars is required",
                  })}
                  defaultValue={formData.minimumHotelStars}
                  onChange={(e) =>
                    updateFormData("minimumHotelStars", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">Select Star Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
                {errors.minimumHotelStars && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.minimumHotelStars.message}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Meal Plan
              </label>
              <select
                {...register("mealPlan", { required: "Meal Plan is required" })}
                defaultValue={formData.mealPlan}
                onChange={(e) => updateFormData("mealPlan", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              >
                <option value="">Select Meal Plan</option>
                <option value="none">No Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="half-board">
                  Half-Board (Breakfast & Dinner)
                </option>
                <option value="full-board">Full-Board (All Meals)</option>
              </select>
              {errors.mealPlan && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.mealPlan.message}
                </span>
              )}
            </div>
          </div>
        )}
        {currentStep === 4 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Travel Type
                </label>
                <select
                  {...register("travelType", {
                    required: "Travel Type is required",
                  })}
                  defaultValue={formData.travelType}
                  onChange={(e) => updateFormData("travelType", e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">Select Travel Type</option>
                  <option value="family">Family Trip</option>
                  <option value="solo">Solo Travel</option>
                  <option value="couple">Couple</option>
                  <option value="group">Group Travel</option>
                  <option value="business">Business Travel</option>
                </select>
                {errors.travelType && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.travelType.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Destination Type
                </label>
                <select
                  {...register("destinationType", {
                    required: "Destination Type is required",
                  })}
                  defaultValue={formData.destinationType}
                  onChange={(e) =>
                    updateFormData("destinationType", e.target.value)
                  }
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
                >
                  <option value="">Select Destination Type</option>
                  <option value="beach">Beach trips</option>
                  <option value="mountain">Mountain adventures</option>
                  <option value="relax">Relaxing tours</option>
                  <option value="group">Group packages</option>
                </select>
                {errors.destinationType && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.destinationType.message}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                Review Your Information
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p>
                  <span className="font-medium">From:</span>{" "}
                  {formData.locationFrom || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">To:</span>{" "}
                  {formData.locationTo || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Dates:</span>{" "}
                  {formData.startingDate && formData.endingDate
                    ? `${formData.startingDate} to ${formData.endingDate}`
                    : "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Travelers:</span>{" "}
                  {formData.adults || formData.children
                    ? `${formData.adults || 0} adults, ${
                        formData.children || 0
                      } children`
                    : "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Budget:</span>{" "}
                  {formData.budget || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Tourist Spots:</span>{" "}
                  {formData.touristSpots || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Accommodation:</span>{" "}
                  {formData.typeOfAccommodation || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Hotel Stars:</span>{" "}
                  {formData.minimumHotelStars || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Meal Plan:</span>{" "}
                  {formData.mealPlan || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Travel Type:</span>{" "}
                  {formData.travelType || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Destination Type:</span>{" "}
                  {formData.destinationType || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Flight:</span>{" "}
                  {formData.includeRoundTripFlight
                    ? "Included"
                    : "Not included"}
                </p>
              </div>
            </div>
          </div>
        )}
        {currentStep === 5 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                placeholder="Full name"
                defaultValue={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email
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
                placeholder="Email"
                defaultValue={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                {...register("phoneNumber", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: "Invalid phone number",
                  },
                })}
                type="tel"
                placeholder="Phone number"
                defaultValue={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent text-xs sm:text-sm transition-all duration-200"
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber.message}
                </span>
              )}
            </div>
            <div className="flex items-start">
              <input
                {...register("confirmation", {
                  required: "You must confirm the request",
                })}
                type="checkbox"
                id="confirmation"
                checked={formData.confirmation}
                onChange={(e) =>
                  updateFormData("confirmation", e.target.checked)
                }
                className="h-4 w-4 text-[#FF6600] focus:ring-[#FF6600] border-gray-300 rounded mt-1"
              />
              <label
                htmlFor="confirmation"
                className="ml-2 text-xs sm:text-sm text-gray-700"
              >
                I confirm this is a travel request, and all provided information
                is valid and does not include any third party.
              </label>
              {errors.confirmation && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.confirmation.message}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-2 sm:mb-0 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-2 py-1 sm:px-2 sm:py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-xs sm:text-sm transition-all duration-200 w-full sm:w-auto"
              >
                Previous
              </button>
            )}
            <button
              onClick={handlepupupClose}
              className="px-2 py-1 sm:px-2.1 sm:py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-xs sm:text-sm transition-all duration-200 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
          <div className="w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="bg-[#FF6600] hover:bg-[#e55600] text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg text-xs sm:text-sm w-full sm:w-auto transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
                disabled={
                  isSavingDraft || isPublishing || !formData.confirmation
                }
                className="bg-[#FF6600] hover:bg-[#e55600] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-1.5 sm:py-1.01 px-1 sm:px-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto transition-all duration-200"
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